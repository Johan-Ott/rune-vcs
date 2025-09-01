use std::fs;
use std::path::Path;
use serde::{Deserialize, Serialize};

#[derive(Debug, Serialize, Deserialize)]
pub struct FileEntry {
    name: String,
    path: String,
    is_directory: bool,
    size: Option<u64>,
    modified_at: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct FileMetadata {
    path: String,
    size: u64,
    is_directory: bool,
    is_readonly: bool,
    created_at: Option<String>,
    modified_at: Option<String>,
    accessed_at: Option<String>,
}

#[tauri::command]
async fn read_dir(path: String) -> Result<Vec<FileEntry>, String> {
    let path = Path::new(&path);
    
    if !path.exists() {
        return Err(format!("Path does not exist: {}", path.display()));
    }
    
    if !path.is_dir() {
        return Err(format!("Path is not a directory: {}", path.display()));
    }
    
    let mut entries = Vec::new();
    
    match fs::read_dir(path) {
        Ok(dir_entries) => {
            for entry in dir_entries {
                match entry {
                    Ok(entry) => {
                        let path = entry.path();
                        let metadata = entry.metadata().ok();
                        
                        let file_entry = FileEntry {
                            name: entry.file_name().to_string_lossy().to_string(),
                            path: path.to_string_lossy().to_string(),
                            is_directory: path.is_dir(),
                            size: metadata.as_ref().map(|m| m.len()),
                            modified_at: metadata
                                .and_then(|m| m.modified().ok())
                                .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
                                .map(|d| d.as_secs().to_string()),
                        };
                        
                        entries.push(file_entry);
                    }
                    Err(e) => {
                        eprintln!("Error reading directory entry: {}", e);
                    }
                }
            }
        }
        Err(e) => {
            return Err(format!("Failed to read directory: {}", e));
        }
    }
    
    // Sort entries: directories first, then files, both alphabetically
    entries.sort_by(|a, b| {
        match (a.is_directory, b.is_directory) {
            (true, false) => std::cmp::Ordering::Less,
            (false, true) => std::cmp::Ordering::Greater,
            _ => a.name.to_lowercase().cmp(&b.name.to_lowercase()),
        }
    });
    
    Ok(entries)
}

#[tauri::command]
async fn read_file(path: String) -> Result<String, String> {
    match fs::read_to_string(&path) {
        Ok(contents) => Ok(contents),
        Err(e) => Err(format!("Failed to read file {}: {}", path, e)),
    }
}

#[tauri::command]
async fn write_file(path: String, contents: String) -> Result<(), String> {
    match fs::write(&path, contents) {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Failed to write file {}: {}", path, e)),
    }
}

#[tauri::command]
async fn file_exists(path: String) -> Result<bool, String> {
    Ok(Path::new(&path).exists())
}

#[tauri::command]
async fn get_home_dir() -> Result<String, String> {
    match dirs::home_dir() {
        Some(path) => Ok(path.to_string_lossy().to_string()),
        None => Err("Could not determine home directory".to_string()),
    }
}

#[tauri::command]
async fn get_current_dir() -> Result<String, String> {
    match std::env::current_dir() {
        Ok(path) => Ok(path.to_string_lossy().to_string()),
        Err(e) => Err(format!("Could not determine current directory: {}", e)),
    }
}

#[tauri::command]
async fn create_directory(path: String) -> Result<(), String> {
    match fs::create_dir_all(&path) {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Failed to create directory {}: {}", path, e)),
    }
}

#[tauri::command]
async fn delete_file(path: String) -> Result<(), String> {
    let path = Path::new(&path);
    
    if !path.exists() {
        return Err(format!("Path does not exist: {}", path.display()));
    }
    
    match if path.is_dir() {
        fs::remove_dir_all(&path)
    } else {
        fs::remove_file(&path)
    } {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Failed to delete {}: {}", path.display(), e)),
    }
}

#[tauri::command]
async fn rename_file(old_path: String, new_path: String) -> Result<(), String> {
    match fs::rename(&old_path, &new_path) {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Failed to rename {} to {}: {}", old_path, new_path, e)),
    }
}

#[tauri::command]
async fn copy_file(src: String, dest: String) -> Result<(), String> {
    let src_path = Path::new(&src);
    let dest_path = Path::new(&dest);
    
    if !src_path.exists() {
        return Err(format!("Source path does not exist: {}", src));
    }
    
    match if src_path.is_dir() {
        copy_dir_all(src_path, dest_path)
    } else {
        fs::copy(src_path, dest_path).map(|_| ())
    } {
        Ok(_) => Ok(()),
        Err(e) => Err(format!("Failed to copy {} to {}: {}", src, dest, e)),
    }
}

#[tauri::command]
async fn get_file_metadata(path: String) -> Result<FileMetadata, String> {
    let path = Path::new(&path);
    
    if !path.exists() {
        return Err(format!("Path does not exist: {}", path.display()));
    }
    
    match path.metadata() {
        Ok(metadata) => {
            let created_at = metadata.created()
                .ok()
                .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
                .map(|d| d.as_secs().to_string());
                
            let modified_at = metadata.modified()
                .ok()
                .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
                .map(|d| d.as_secs().to_string());
                
            let accessed_at = metadata.accessed()
                .ok()
                .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
                .map(|d| d.as_secs().to_string());
            
            Ok(FileMetadata {
                path: path.to_string_lossy().to_string(),
                size: metadata.len(),
                is_directory: metadata.is_dir(),
                is_readonly: metadata.permissions().readonly(),
                created_at,
                modified_at,
                accessed_at,
            })
        }
        Err(e) => Err(format!("Failed to get metadata for {}: {}", path.display(), e)),
    }
}

// Helper function to copy directories recursively
fn copy_dir_all(src: &Path, dest: &Path) -> std::io::Result<()> {
    fs::create_dir_all(dest)?;
    
    for entry in fs::read_dir(src)? {
        let entry = entry?;
        let src_path = entry.path();
        let dest_path = dest.join(entry.file_name());
        
        if src_path.is_dir() {
            copy_dir_all(&src_path, &dest_path)?;
        } else {
            fs::copy(&src_path, &dest_path)?;
        }
    }
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
        read_dir,
        read_file,
        write_file,
        file_exists,
        get_home_dir,
        get_current_dir,
        create_directory,
        delete_file,
        rename_file,
        copy_file,
        get_file_metadata
    ])
    .setup(|app| {
      if cfg!(debug_assertions) {
        app.handle().plugin(
          tauri_plugin_log::Builder::default()
            .level(log::LevelFilter::Info)
            .build(),
        )?;
      }
      Ok(())
    })
    .run(tauri::generate_context!())
    .expect("error while running tauri application");
}
