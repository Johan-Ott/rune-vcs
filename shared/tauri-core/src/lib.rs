use anyhow::Result;
use serde::{Deserialize, Serialize};
use tauri::command;

#[derive(Debug, Serialize, Deserialize)]
pub struct FileInfo {
    pub path: String,
    pub name: String,
    pub is_directory: bool,
    pub size: Option<u64>,
    pub modified: Option<String>,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct VCSStatus {
    pub current_branch: String,
    pub modified_files: Vec<String>,
    pub staged_files: Vec<String>,
    pub untracked_files: Vec<String>,
    pub ahead: u32,
    pub behind: u32,
}

/// Shared Tauri commands that all apps can use
pub mod commands {
    use super::*;

    #[command]
    pub async fn get_file_info(path: String) -> Result<FileInfo, String> {
        use std::fs;

        let metadata = fs::metadata(&path).map_err(|e| e.to_string())?;
        let name = std::path::Path::new(&path)
            .file_name()
            .unwrap_or_default()
            .to_string_lossy()
            .to_string();

        Ok(FileInfo {
            path,
            name,
            is_directory: metadata.is_dir(),
            size: if metadata.is_file() {
                Some(metadata.len())
            } else {
                None
            },
            modified: metadata
                .modified()
                .ok()
                .and_then(|t| t.duration_since(std::time::UNIX_EPOCH).ok())
                .map(|d| d.as_secs().to_string()),
        })
    }

    #[command]
    pub async fn list_directory(path: String) -> Result<Vec<FileInfo>, String> {
        use std::fs;

        let entries = fs::read_dir(&path).map_err(|e| e.to_string())?;
        let mut files = Vec::new();

        for entry in entries {
            let entry = entry.map_err(|e| e.to_string())?;
            let path = entry.path().to_string_lossy().to_string();

            match get_file_info(path).await {
                Ok(info) => files.push(info),
                Err(_) => continue, // Skip files we can't read
            }
        }

        files.sort_by(|a, b| {
            // Directories first, then alphabetical
            match (a.is_directory, b.is_directory) {
                (true, false) => std::cmp::Ordering::Less,
                (false, true) => std::cmp::Ordering::Greater,
                _ => a.name.cmp(&b.name),
            }
        });

        Ok(files)
    }

    #[command]
    pub async fn get_vcs_status(repo_path: String) -> Result<VCSStatus, String> {
        // This would integrate with rune-core to get actual VCS status
        // For now, return a mock status
        Ok(VCSStatus {
            current_branch: "main".to_string(),
            modified_files: vec!["src/main.rs".to_string()],
            staged_files: vec![],
            untracked_files: vec!["temp.txt".to_string()],
            ahead: 0,
            behind: 0,
        })
    }

    #[command]
    pub async fn open_external(path: String) -> Result<(), String> {
        #[cfg(target_os = "macos")]
        {
            std::process::Command::new("open")
                .arg(&path)
                .spawn()
                .map_err(|e| e.to_string())?;
        }

        #[cfg(target_os = "windows")]
        {
            std::process::Command::new("explorer")
                .arg(&path)
                .spawn()
                .map_err(|e| e.to_string())?;
        }

        #[cfg(target_os = "linux")]
        {
            std::process::Command::new("xdg-open")
                .arg(&path)
                .spawn()
                .map_err(|e| e.to_string())?;
        }

        Ok(())
    }
}

/// Helper function to register all shared commands with a Tauri app
pub fn register_shared_commands<R: tauri::Runtime>(
    app: tauri::AppHandle<R>,
) -> tauri::AppHandle<R> {
    // This would be used in main.rs of each app:
    // tauri::Builder::default()
    //     .invoke_handler(tauri::generate_handler![
    //         tauri_core::commands::get_file_info,
    //         tauri_core::commands::list_directory,
    //         tauri_core::commands::get_vcs_status,
    //         tauri_core::commands::open_external,
    //         // ... app-specific commands
    //     ])
    app
}
