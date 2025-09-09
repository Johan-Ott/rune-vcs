// Advanced Object Storage System for Rune VCS
// Provides object deduplication, compression, and smart caching

use anyhow::Result;
use sha2::{Digest, Sha256};
use std::collections::HashMap;
use std::path::{Path, PathBuf};
use std::sync::{Arc, RwLock};
use std::io::{Read, Write};
use flate2::{Compression, read::GzDecoder, write::GzEncoder};
use serde::{Deserialize, Serialize};

/// Advanced object storage with compression and deduplication
pub struct ObjectStore {
    /// Root directory for object storage
    objects_dir: PathBuf,
    /// In-memory cache for frequently accessed objects
    cache: Arc<RwLock<ObjectCache>>,
    /// Configuration for storage optimization
    config: StorageConfig,
}

#[derive(Debug, Clone)]
pub struct StorageConfig {
    /// Enable compression for objects
    pub enable_compression: bool,
    /// Compression level (0-9)
    pub compression_level: u32,
    /// Maximum cache size in bytes
    pub max_cache_size: usize,
    /// Enable object deduplication
    pub enable_deduplication: bool,
    /// Minimum object size for compression
    pub min_compression_size: usize,
}

#[derive(Debug)]
pub struct ObjectCache {
    /// Cached objects (hash -> data)
    objects: HashMap<String, CachedObject>,
    /// Current cache size in bytes
    current_size: usize,
    /// Access frequency tracking for LRU eviction
    access_order: Vec<String>,
}

#[derive(Debug, Clone)]
pub struct CachedObject {
    /// Object data
    data: Vec<u8>,
    /// When this object was last accessed
    last_accessed: std::time::Instant,
    /// Size in bytes
    size: usize,
    /// Whether this object is compressed
    is_compressed: bool,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct ObjectMetadata {
    /// Object hash
    pub hash: String,
    /// Original size in bytes
    pub size: usize,
    /// Compressed size (if compressed)
    pub compressed_size: Option<usize>,
    /// Whether object is compressed
    pub is_compressed: bool,
    /// Object type (blob, tree, commit)
    pub object_type: ObjectType,
    /// Creation timestamp
    pub created_at: chrono::DateTime<chrono::Utc>,
}

#[derive(Debug, Serialize, Deserialize)]
pub enum ObjectType {
    Blob,
    Tree,
    Commit,
    Tag,
}

impl Default for StorageConfig {
    fn default() -> Self {
        Self {
            enable_compression: true,
            compression_level: 6,
            max_cache_size: 64 * 1024 * 1024, // 64MB cache
            enable_deduplication: true,
            min_compression_size: 1024, // Don't compress files < 1KB
        }
    }
}

impl ObjectStore {
    /// Create a new object store
    pub fn new(rune_dir: &Path) -> Result<Self> {
        let objects_dir = rune_dir.join("objects");
        std::fs::create_dir_all(&objects_dir)?;

        Ok(Self {
            objects_dir,
            cache: Arc::new(RwLock::new(ObjectCache::new())),
            config: StorageConfig::default(),
        })
    }

    /// Create with custom configuration
    pub fn with_config(rune_dir: &Path, config: StorageConfig) -> Result<Self> {
        let mut store = Self::new(rune_dir)?;
        store.config = config;
        Ok(store)
    }

    /// Store an object and return its hash
    pub fn store_object(&self, data: &[u8], object_type: ObjectType) -> Result<String> {
        // Calculate hash
        let hash = self.calculate_hash(data);
        
        // Check if object already exists (deduplication)
        if self.config.enable_deduplication && self.object_exists(&hash)? {
            return Ok(hash);
        }

        // Determine if we should compress
        let should_compress = self.config.enable_compression 
            && data.len() >= self.config.min_compression_size;

        let (stored_data, is_compressed) = if should_compress {
            (self.compress_data(data)?, true)
        } else {
            (data.to_vec(), false)
        };

        // Store object to disk
        let object_path = self.get_object_path(&hash);
        if let Some(parent) = object_path.parent() {
            std::fs::create_dir_all(parent)?;
        }
        std::fs::write(&object_path, &stored_data)?;

        // Store metadata
        let metadata = ObjectMetadata {
            hash: hash.clone(),
            size: data.len(),
            compressed_size: if is_compressed { Some(stored_data.len()) } else { None },
            is_compressed,
            object_type,
            created_at: chrono::Utc::now(),
        };
        self.store_metadata(&hash, &metadata)?;

        // Add to cache
        self.cache_object(&hash, data, is_compressed)?;

        Ok(hash)
    }

    /// Retrieve an object by hash
    pub fn get_object(&self, hash: &str) -> Result<Vec<u8>> {
        // Try cache first
        if let Some(data) = self.get_from_cache(hash)? {
            return Ok(data);
        }

        // Load from disk
        let object_path = self.get_object_path(hash);
        if !object_path.exists() {
            return Err(anyhow::anyhow!("Object {} not found", hash));
        }

        let stored_data = std::fs::read(&object_path)?;
        
        // Check if compressed
        let metadata = self.get_metadata(hash)?;
        let data = if metadata.is_compressed {
            self.decompress_data(&stored_data)?
        } else {
            stored_data
        };

        // Add to cache
        self.cache_object(hash, &data, metadata.is_compressed)?;

        Ok(data)
    }

    /// Check if an object exists
    pub fn object_exists(&self, hash: &str) -> Result<bool> {
        Ok(self.get_object_path(hash).exists())
    }

    /// Get object metadata
    pub fn get_metadata(&self, hash: &str) -> Result<ObjectMetadata> {
        let metadata_path = self.get_metadata_path(hash);
        if !metadata_path.exists() {
            return Err(anyhow::anyhow!("Metadata for object {} not found", hash));
        }

        let metadata_json = std::fs::read_to_string(&metadata_path)?;
        let metadata: ObjectMetadata = serde_json::from_str(&metadata_json)?;
        Ok(metadata)
    }

    /// List all objects
    pub fn list_objects(&self) -> Result<Vec<String>> {
        let mut objects = Vec::new();
        self.walk_objects_dir(&self.objects_dir, &mut objects)?;
        Ok(objects)
    }

    /// Get storage statistics
    pub fn get_stats(&self) -> Result<StorageStats> {
        let mut total_objects = 0;
        let mut total_size = 0;
        let mut compressed_size = 0;
        let mut compressed_objects = 0;

        for hash in self.list_objects()? {
            if let Ok(metadata) = self.get_metadata(&hash) {
                total_objects += 1;
                total_size += metadata.size;
                
                if let Some(comp_size) = metadata.compressed_size {
                    compressed_size += comp_size;
                    compressed_objects += 1;
                } else {
                    compressed_size += metadata.size;
                }
            }
        }

        let cache = self.cache.read().unwrap();
        
        Ok(StorageStats {
            total_objects,
            total_size,
            compressed_size,
            compressed_objects,
            compression_ratio: if total_size > 0 { 
                compressed_size as f64 / total_size as f64 
            } else { 1.0 },
            cache_size: cache.current_size,
            cache_objects: cache.objects.len(),
        })
    }

    /// Garbage collect unreferenced objects
    pub fn garbage_collect(&self, referenced_hashes: &[String]) -> Result<GarbageCollectResult> {
        let all_objects = self.list_objects()?;
        let referenced_set: std::collections::HashSet<_> = referenced_hashes.iter().collect();
        
        let mut removed_objects = 0;
        let mut freed_bytes = 0;

        for hash in all_objects {
            if !referenced_set.contains(&hash) {
                if let Ok(metadata) = self.get_metadata(&hash) {
                    // Remove object file
                    let object_path = self.get_object_path(&hash);
                    if object_path.exists() {
                        std::fs::remove_file(&object_path)?;
                    }
                    
                    // Remove metadata file
                    let metadata_path = self.get_metadata_path(&hash);
                    if metadata_path.exists() {
                        std::fs::remove_file(&metadata_path)?;
                    }

                    freed_bytes += metadata.compressed_size.unwrap_or(metadata.size);
                    removed_objects += 1;
                }
            }
        }

        Ok(GarbageCollectResult {
            removed_objects,
            freed_bytes,
        })
    }

    // Private helper methods

    fn calculate_hash(&self, data: &[u8]) -> String {
        let mut hasher = Sha256::new();
        hasher.update(data);
        format!("{:x}", hasher.finalize())
    }

    fn get_object_path(&self, hash: &str) -> PathBuf {
        // Git-style directory structure: objects/ab/cdef123...
        let (dir, file) = hash.split_at(2);
        self.objects_dir.join(dir).join(file)
    }

    fn get_metadata_path(&self, hash: &str) -> PathBuf {
        self.get_object_path(hash).with_extension("meta")
    }

    fn compress_data(&self, data: &[u8]) -> Result<Vec<u8>> {
        let mut encoder = GzEncoder::new(Vec::new(), Compression::new(self.config.compression_level));
        encoder.write_all(data)?;
        Ok(encoder.finish()?)
    }

    fn decompress_data(&self, data: &[u8]) -> Result<Vec<u8>> {
        let mut decoder = GzDecoder::new(data);
        let mut decompressed = Vec::new();
        decoder.read_to_end(&mut decompressed)?;
        Ok(decompressed)
    }

    fn store_metadata(&self, hash: &str, metadata: &ObjectMetadata) -> Result<()> {
        let metadata_path = self.get_metadata_path(hash);
        if let Some(parent) = metadata_path.parent() {
            std::fs::create_dir_all(parent)?;
        }
        
        let metadata_json = serde_json::to_string_pretty(metadata)?;
        std::fs::write(&metadata_path, metadata_json)?;
        Ok(())
    }

    fn cache_object(&self, hash: &str, data: &[u8], is_compressed: bool) -> Result<()> {
        let mut cache = self.cache.write().unwrap();
        
        // Check cache size limit
        if cache.current_size + data.len() > self.config.max_cache_size {
            cache.evict_lru();
        }

        let cached_obj = CachedObject {
            data: data.to_vec(),
            last_accessed: std::time::Instant::now(),
            size: data.len(),
            is_compressed,
        };

        cache.objects.insert(hash.to_string(), cached_obj);
        cache.current_size += data.len();
        cache.access_order.push(hash.to_string());

        Ok(())
    }

    fn get_from_cache(&self, hash: &str) -> Result<Option<Vec<u8>>> {
        let mut cache = self.cache.write().unwrap();
        
        if let Some(obj) = cache.objects.get_mut(hash) {
            obj.last_accessed = std::time::Instant::now();
            
            // Update access order
            if let Some(pos) = cache.access_order.iter().position(|h| h == hash) {
                cache.access_order.remove(pos);
                cache.access_order.push(hash.to_string());
            }
            
            return Ok(Some(obj.data.clone()));
        }
        
        Ok(None)
    }

    fn walk_objects_dir(&self, dir: &Path, objects: &mut Vec<String>) -> Result<()> {
        for entry in std::fs::read_dir(dir)? {
            let entry = entry?;
            let path = entry.path();
            
            if path.is_dir() {
                self.walk_objects_dir(&path, objects)?;
            } else if let Some(name) = path.file_stem().and_then(|n| n.to_str()) {
                if path.extension().is_none() { // Skip .meta files
                    if let Some(parent_name) = path.parent()
                        .and_then(|p| p.file_name())
                        .and_then(|n| n.to_str()) {
                        objects.push(format!("{}{}", parent_name, name));
                    }
                }
            }
        }
        Ok(())
    }
}

impl ObjectCache {
    fn new() -> Self {
        Self {
            objects: HashMap::new(),
            current_size: 0,
            access_order: Vec::new(),
        }
    }

    fn evict_lru(&mut self) {
        if let Some(hash) = self.access_order.first().cloned() {
            if let Some(obj) = self.objects.remove(&hash) {
                self.current_size -= obj.size;
                self.access_order.remove(0);
            }
        }
    }
}

#[derive(Debug)]
pub struct StorageStats {
    pub total_objects: usize,
    pub total_size: usize,
    pub compressed_size: usize,
    pub compressed_objects: usize,
    pub compression_ratio: f64,
    pub cache_size: usize,
    pub cache_objects: usize,
}

#[derive(Debug)]
pub struct GarbageCollectResult {
    pub removed_objects: usize,
    pub freed_bytes: usize,
}
