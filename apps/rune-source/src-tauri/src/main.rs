use serde::{Deserialize, Serialize};
use std::collections::HashMap;

// Import shared tauri-core commands
use tauri_core::commands::*;

#[derive(Debug, Serialize, Deserialize)]
struct RepoStatus {
    current_branch: String,
    modified_files: Vec<String>,
    staged_files: Vec<String>,
    untracked_files: Vec<String>,
    commit_count: usize,
}

#[tauri::command]
async fn get_repo_status() -> Result<RepoStatus, String> {
    // TODO: Integrate with rune-core to get actual repo status
    Ok(RepoStatus {
        current_branch: "main".to_string(),
        modified_files: vec!["src/main.rs".to_string(), "README.md".to_string()],
        staged_files: vec!["Cargo.toml".to_string()],
        untracked_files: vec!["new_file.txt".to_string()],
        commit_count: 42,
    })
}

#[tauri::command]
async fn get_file_diff(path: String) -> Result<String, String> {
    // TODO: Implement actual diff functionality
    Ok(format!("Diff for file: {}\n+ Added line\n- Removed line", path))
}

#[tauri::command]
async fn get_commit_history(limit: Option<usize>) -> Result<Vec<HashMap<String, String>>, String> {
    // TODO: Integrate with rune-core for actual commit history
    let mut commits = Vec::new();
    let limit = limit.unwrap_or(50);
    
    for i in 0..limit {
        let mut commit = HashMap::new();
        commit.insert("hash".to_string(), format!("abc123{:03}", i));
        commit.insert("message".to_string(), format!("Commit message {}", i + 1));
        commit.insert("author".to_string(), "Johan Ottosson".to_string());
        commit.insert("date".to_string(), "2025-09-05".to_string());
        commits.push(commit);
    }
    
    Ok(commits)
}

#[tauri::command]
async fn get_branches() -> Result<Vec<String>, String> {
    // TODO: Get actual branches from rune-core
    Ok(vec![
        "main".to_string(),
        "feature/ui-improvements".to_string(),
        "bugfix/memory-leak".to_string(),
    ])
}

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
            // Shared commands from tauri-core
            get_file_info,
            list_directory,
            get_vcs_status,
            open_external,
            // App-specific commands
            get_repo_status,
            get_file_diff,
            get_commit_history,
            get_branches
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
