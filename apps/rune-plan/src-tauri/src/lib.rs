use std::fs;
use std::path::Path;
use serde::{Deserialize, Serialize};
use base64;

// Import shared tauri-core commands
use tauri_core::commands::*;

// Import planning functionality
use rune_planning::*;

// Workspace configuration structures
#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct WorkspaceConfig {
    pub projects: Vec<ProjectConfig>,
    pub teams: Vec<TeamConfig>, 
    pub goals: Vec<GoalConfig>,
    pub releases: Vec<ReleaseConfig>,
    pub views: Vec<ViewConfig>,
    pub workspaces: Vec<WorkspaceInfo>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProjectConfig {
    pub id: String,
    pub name: String,
    pub description: String,
    pub status: String, // 'active' | 'paused' | 'completed'
    pub issue_count: u32,
    pub completed_count: u32,
    pub members: Vec<ProjectMember>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ProjectMember {
    pub name: String,
    pub avatar: String,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TeamConfig {
    pub id: String,
    pub name: String,
    pub avatar: Option<String>,
    pub description: Option<String>,
    pub members: Vec<TeamMember>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct TeamMember {
    pub id: String,
    pub name: String,
    pub email: String,
    pub avatar: String,
    pub role: String, // 'owner' | 'admin' | 'member'
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct GoalConfig {
    pub id: String,
    pub title: String,
    pub description: String,
    pub project_id: String,
    pub status: String, // 'active' | 'completed' | 'paused'
    pub target_date: Option<String>,
    pub issues_count: u32,
    pub completed_issues_count: u32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ReleaseConfig {
    pub id: String,
    pub name: String,
    pub description: String,
    pub version: String,
    pub status: String, // 'planned' | 'in-progress' | 'released' | 'cancelled'
    pub target_date: Option<String>,
    pub release_date: Option<String>,
    pub project_id: Option<String>,
    pub issues_count: u32,
    pub completed_issues_count: u32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ViewConfig {
    pub id: String,
    pub name: String,
    pub description: String,
    pub project_id: Option<String>,
    pub filters: ViewFilters,
    pub issue_count: u32,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct ViewFilters {
    pub status: Option<Vec<String>>,
    pub priority: Option<Vec<String>>,
    pub assignee: Option<Vec<String>>,
    pub project: Option<Vec<String>>,
}

#[derive(Debug, Serialize, Deserialize, Clone)]
pub struct WorkspaceInfo {
    pub id: String,
    pub name: String,
    pub avatar: Option<String>,
    pub description: Option<String>,
    pub members: Vec<TeamMember>,
    pub is_active: Option<bool>,
}

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

#[derive(Debug, Serialize, Deserialize)]
pub struct SystemDirectory {
    id: String,
    name: String,
    path: String,
    icon: String,
}

#[derive(Debug, Serialize, Deserialize)]
pub struct SystemDirectories {
    home: String,
    desktop: Option<String>,
    documents: Option<String>,
    downloads: Option<String>,
    pictures: Option<String>,
    videos: Option<String>,
    music: Option<String>,
}

#[tauri::command]
async fn get_system_directories() -> Result<SystemDirectories, String> {
    let home = dirs::home_dir()
        .ok_or("Could not get home directory")?
        .to_string_lossy()
        .to_string();
    
    let desktop = dirs::desktop_dir().map(|p| p.to_string_lossy().to_string());
    let documents = dirs::document_dir().map(|p| p.to_string_lossy().to_string());
    let downloads = dirs::download_dir().map(|p| p.to_string_lossy().to_string());
    let pictures = dirs::picture_dir().map(|p| p.to_string_lossy().to_string());
    let videos = dirs::video_dir().map(|p| p.to_string_lossy().to_string());
    let music = dirs::audio_dir().map(|p| p.to_string_lossy().to_string());
    
    Ok(SystemDirectories {
        home,
        desktop,
        documents,
        downloads,
        pictures,
        videos,
        music,
    })
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

#[tauri::command]
async fn open_with_default(path: String) -> Result<bool, String> {
    // Use the `open` crate to open with system default application
    match open::that(path.clone()) {
        Ok(_) => Ok(true),
        Err(e) => Err(format!("Failed to open {}: {}", path, e)),
    }
}

#[tauri::command]
async fn read_file_dataurl(path: String) -> Result<String, String> {
    use std::fs::File;
    use std::io::Read;

    let path_obj = Path::new(&path);
    if !path_obj.exists() {
        return Err(format!("Path does not exist: {}", path));
    }

    let mut file = File::open(path_obj).map_err(|e| format!("Failed to open file {}: {}", path, e))?;
    let mut buf = Vec::new();
    file.read_to_end(&mut buf).map_err(|e| format!("Failed to read file {}: {}", path, e))?;

    // Guess mime
    let mime = mime_guess::from_path(path_obj).first_or_octet_stream();
    let b64 = base64::encode(&buf);
    let data_url = format!("data:{};base64,{}", mime.essence_str(), b64);
    Ok(data_url)
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

// Planning Commands
#[tauri::command]
async fn init_planning_store(workspace_path: String) -> Result<(), String> {
    let store = PlanStore::new(workspace_path);
    store.ensure().map_err(|e| e.to_string())
}

#[tauri::command]
async fn create_plan_item(
    workspace_path: String,
    title: String,
    plan_type: String,
    priority: String,
    description: Option<String>,
    project: Option<String>,
    epic: Option<String>,
    story: Option<String>,
) -> Result<Plan, String> {
    let store = PlanStore::new(workspace_path);
    
    let plan_type = match plan_type.as_str() {
        "initiative" => PlanType::Initiative,
        "project" => PlanType::Project,
        "issue" => PlanType::Issue,
        "subissue" => PlanType::SubIssue,
        _ => return Err("Invalid plan type".to_string()),
    };
    
    let priority = match priority.as_str() {
        "low" => Priority::Low,
        "medium" => Priority::Medium,
        "high" => Priority::High,
        "critical" => Priority::Critical,
        _ => return Err("Invalid priority".to_string()),
    };
    
    let mut plan = create_plan_with_options(
        &store,
        &title,
        None,
        plan_type,
        priority,
        project.as_deref(),
        epic.as_deref(),
        story.as_deref(),
        None,
    ).map_err(|e| e.to_string())?;
    
    if let Some(desc) = description {
        plan.description = desc;
    }
    
    store.save(&plan).map_err(|e| e.to_string())?;
    Ok(plan)
}

#[tauri::command]
async fn load_all_plans(workspace_path: String) -> Result<Vec<Plan>, String> {
    let store = PlanStore::new(workspace_path);
    store.load_all().map_err(|e| e.to_string())
}

#[tauri::command]
async fn load_plan(workspace_path: String, plan_id: String) -> Result<Plan, String> {
    let store = PlanStore::new(workspace_path);
    store.load(&plan_id).map_err(|e| e.to_string())
}

#[tauri::command]
async fn save_plan(workspace_path: String, plan: Plan) -> Result<(), String> {
    let store = PlanStore::new(workspace_path);
    store.save(&plan).map_err(|e| e.to_string())
}

#[tauri::command]
async fn update_plan_status(
    workspace_path: String,
    plan_id: String,
    status: String,
) -> Result<Plan, String> {
    let store = PlanStore::new(workspace_path);
    let mut plan = store.load(&plan_id).map_err(|e| e.to_string())?;
    
    plan.status = match status.as_str() {
        "planned" => PlanStatus::Planned,
        "active" => PlanStatus::Active,
        "in-progress" => PlanStatus::InProgress,
        "blocked" => PlanStatus::Blocked,
        "done" => PlanStatus::Done,
        _ => return Err("Invalid status".to_string()),
    };
    
    store.save(&plan).map_err(|e| e.to_string())?;
    Ok(plan)
}

// Workspace Configuration Commands
#[tauri::command]
async fn load_workspace_config(workspace_path: String) -> Result<WorkspaceConfig, String> {
    let config_path = std::path::Path::new(&workspace_path).join(".rune").join("workspace-config.json");
    
    if !config_path.exists() {
        // Return default configuration
        return Ok(WorkspaceConfig {
            projects: vec![],
            teams: vec![],
            goals: vec![],
            releases: vec![],
            views: vec![],
            workspaces: vec![WorkspaceInfo {
                id: "default".to_string(),
                name: "Default Workspace".to_string(),
                avatar: None,
                description: Some("Default workspace for planning".to_string()),
                members: vec![],
                is_active: Some(true),
            }],
        });
    }
    
    let content = fs::read_to_string(&config_path).map_err(|e| e.to_string())?;
    let config: WorkspaceConfig = serde_json::from_str(&content).map_err(|e| e.to_string())?;
    Ok(config)
}

#[tauri::command]
async fn save_workspace_config(workspace_path: String, config: WorkspaceConfig) -> Result<(), String> {
    let rune_dir = std::path::Path::new(&workspace_path).join(".rune");
    fs::create_dir_all(&rune_dir).map_err(|e| e.to_string())?;
    
    let config_path = rune_dir.join("workspace-config.json");
    let content = serde_json::to_string_pretty(&config).map_err(|e| e.to_string())?;
    fs::write(&config_path, content).map_err(|e| e.to_string())?;
    Ok(())
}

#[tauri::command]
async fn create_project(workspace_path: String, project: ProjectConfig) -> Result<ProjectConfig, String> {
    let mut config = load_workspace_config(workspace_path.clone()).await?;
    config.projects.push(project.clone());
    save_workspace_config(workspace_path, config).await?;
    Ok(project)
}

#[tauri::command]
async fn update_project(workspace_path: String, project: ProjectConfig) -> Result<ProjectConfig, String> {
    let mut config = load_workspace_config(workspace_path.clone()).await?;
    if let Some(existing) = config.projects.iter_mut().find(|p| p.id == project.id) {
        *existing = project.clone();
        save_workspace_config(workspace_path, config).await?;
        Ok(project)
    } else {
        Err("Project not found".to_string())
    }
}

#[tauri::command]
async fn delete_project(workspace_path: String, project_id: String) -> Result<(), String> {
    let mut config = load_workspace_config(workspace_path.clone()).await?;
    config.projects.retain(|p| p.id != project_id);
    save_workspace_config(workspace_path, config).await?;
    Ok(())
}

#[tauri::command]
async fn create_team(workspace_path: String, team: TeamConfig) -> Result<TeamConfig, String> {
    let mut config = load_workspace_config(workspace_path.clone()).await?;
    config.teams.push(team.clone());
    save_workspace_config(workspace_path, config).await?;
    Ok(team)
}

#[tauri::command]
async fn update_team(workspace_path: String, team: TeamConfig) -> Result<TeamConfig, String> {
    let mut config = load_workspace_config(workspace_path.clone()).await?;
    if let Some(existing) = config.teams.iter_mut().find(|t| t.id == team.id) {
        *existing = team.clone();
        save_workspace_config(workspace_path, config).await?;
        Ok(team)
    } else {
        Err("Team not found".to_string())
    }
}

#[tauri::command]
async fn delete_team(workspace_path: String, team_id: String) -> Result<(), String> {
    let mut config = load_workspace_config(workspace_path.clone()).await?;
    config.teams.retain(|t| t.id != team_id);
    save_workspace_config(workspace_path, config).await?;
    Ok(())
}

#[tauri::command]
async fn create_goal(workspace_path: String, goal: GoalConfig) -> Result<GoalConfig, String> {
    let mut config = load_workspace_config(workspace_path.clone()).await?;
    config.goals.push(goal.clone());
    save_workspace_config(workspace_path, config).await?;
    Ok(goal)
}

#[tauri::command]
async fn update_goal(workspace_path: String, goal: GoalConfig) -> Result<GoalConfig, String> {
    let mut config = load_workspace_config(workspace_path.clone()).await?;
    if let Some(existing) = config.goals.iter_mut().find(|g| g.id == goal.id) {
        *existing = goal.clone();
        save_workspace_config(workspace_path, config).await?;
        Ok(goal)
    } else {
        Err("Goal not found".to_string())
    }
}

#[tauri::command]
async fn delete_goal(workspace_path: String, goal_id: String) -> Result<(), String> {
    let mut config = load_workspace_config(workspace_path.clone()).await?;
    config.goals.retain(|g| g.id != goal_id);
    save_workspace_config(workspace_path, config).await?;
    Ok(())
}

#[tauri::command]
async fn create_release(workspace_path: String, release: ReleaseConfig) -> Result<ReleaseConfig, String> {
    let mut config = load_workspace_config(workspace_path.clone()).await?;
    config.releases.push(release.clone());
    save_workspace_config(workspace_path, config).await?;
    Ok(release)
}

#[tauri::command]
async fn update_release(workspace_path: String, release: ReleaseConfig) -> Result<ReleaseConfig, String> {
    let mut config = load_workspace_config(workspace_path.clone()).await?;
    if let Some(existing) = config.releases.iter_mut().find(|r| r.id == release.id) {
        *existing = release.clone();
        save_workspace_config(workspace_path, config).await?;
        Ok(release)
    } else {
        Err("Release not found".to_string())
    }
}

#[tauri::command]
async fn delete_release(workspace_path: String, release_id: String) -> Result<(), String> {
    let mut config = load_workspace_config(workspace_path.clone()).await?;
    config.releases.retain(|r| r.id != release_id);
    save_workspace_config(workspace_path, config).await?;
    Ok(())
}

#[tauri::command]
async fn create_view(workspace_path: String, view: ViewConfig) -> Result<ViewConfig, String> {
    let mut config = load_workspace_config(workspace_path.clone()).await?;
    config.views.push(view.clone());
    save_workspace_config(workspace_path, config).await?;
    Ok(view)
}

#[tauri::command]
async fn update_view(workspace_path: String, view: ViewConfig) -> Result<ViewConfig, String> {
    let mut config = load_workspace_config(workspace_path.clone()).await?;
    if let Some(existing) = config.views.iter_mut().find(|v| v.id == view.id) {
        *existing = view.clone();
        save_workspace_config(workspace_path, config).await?;
        Ok(view)
    } else {
        Err("View not found".to_string())
    }
}

#[tauri::command]
async fn delete_view(workspace_path: String, view_id: String) -> Result<(), String> {
    let mut config = load_workspace_config(workspace_path.clone()).await?;
    config.views.retain(|v| v.id != view_id);
    save_workspace_config(workspace_path, config).await?;
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
  tauri::Builder::default()
    .invoke_handler(tauri::generate_handler![
        // Shared commands from tauri-core
        get_file_info,
        list_directory,
        get_vcs_status,
        open_external,
        // App-specific commands
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
        get_file_metadata,
        get_system_directories,
        open_with_default,
        read_file_dataurl,
        // Planning commands
        init_planning_store,
        create_plan_item,
        load_all_plans,
        load_plan,
        save_plan,
        update_plan_status,
        // Workspace configuration commands
        load_workspace_config,
        save_workspace_config,
        create_project,
        update_project,
        delete_project,
        create_team,
        update_team,
        delete_team,
        create_goal,
        update_goal,
        delete_goal,
        create_release,
        update_release,
        delete_release,
        create_view,
        update_view,
        delete_view
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
