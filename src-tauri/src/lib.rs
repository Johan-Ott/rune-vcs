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

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
        read_dir,
        read_file,
        write_file,
        file_exists,
        get_home_dir,
        get_current_dir
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
