use anyhow::{Result, Context};
use chrono::{DateTime, Utc};
use serde::{Serialize, Deserialize};
use clap::ValueEnum;
use std::{fs, path::PathBuf, collections::HashMap};
use std::io::Write;

pub const PLAN_DIR: &str = ".rune/plans";
pub const CONFIG_FILE: &str = ".rune/planning.toml";
pub const STREAM_DIR: &str = ".rune/streams";
pub const TEMPLATE_DIR: &str = ".rune/templates";

// Template struktur
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlanTemplate {
    pub name: String,
    pub description: String,
    pub plan_type: PlanType,
    pub priority: Priority,
    pub tags: Vec<String>,
    pub default_tasks: Vec<String>,
    pub default_acceptance_criteria: Vec<String>,
    pub content_template: String,
    pub metadata: HashMap<String, String>,
    pub created: DateTime<Utc>,
}

// Förbättrad Task-struktur med metadata
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaskMetadata {
    pub assignee: Option<String>,
    pub due_date: Option<String>,
    pub estimated_hours: Option<f32>,
    pub actual_hours: Option<f32>,
    pub blocked_by: Vec<String>,
    pub dependencies: Vec<String>,
}

// Hierarkisk struktur för plans
pub fn get_project_dir(project_id: &str) -> String {
    format!("{}/{}", PLAN_DIR, project_id)
}

pub fn get_epic_dir(project_id: &str, epic_id: &str) -> String {
    format!("{}/{}/{}", PLAN_DIR, project_id, epic_id)
}

pub fn get_story_dir(project_id: &str, epic_id: &str, story_id: &str) -> String {
    format!("{}/{}/{}/{}", PLAN_DIR, project_id, epic_id, story_id)
}

#[derive(Debug, Clone, Serialize, Deserialize, PartialEq, Eq, ValueEnum)]
pub enum PlanStatus { Planned, Active, InProgress, Blocked, Done }

impl PlanStatus { pub fn as_str(&self) -> &'static str { match self { Self::Planned=>"planned", Self::Active=>"active", Self::InProgress=>"in-progress", Self::Blocked=>"blocked", Self::Done=>"done" } } }
impl std::fmt::Display for PlanStatus { fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result { f.write_str(self.as_str()) } }

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq, Hash, ValueEnum)]
pub enum Priority { Low, Medium, High, Critical }

impl Priority { pub fn as_str(&self) -> &'static str { match self { Self::Low=>"low", Self::Medium=>"medium", Self::High=>"high", Self::Critical=>"critical" } } }
impl std::fmt::Display for Priority { fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result { f.write_str(self.as_str()) } }

#[derive(Debug, Clone, Copy, Serialize, Deserialize, PartialEq, Eq, Hash, ValueEnum)]
pub enum PlanType { Project, Epic, Story, Task, SubTask }

impl PlanType { pub fn as_str(&self) -> &'static str { match self { Self::Project=>"project", Self::Epic=>"epic", Self::Story=>"story", Self::Task=>"task", Self::SubTask=>"subtask" } } }
impl std::fmt::Display for PlanType { fn fmt(&self, f: &mut std::fmt::Formatter<'_>) -> std::fmt::Result { f.write_str(self.as_str()) } }

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Task {
    pub description: String,
    pub done: bool,
    pub task_type: Option<String>,
    pub effort: Option<String>,
    pub path: Option<String>,
    pub tags: Vec<String>,
    pub metadata: Option<TaskMetadata>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct UserStory {
    pub id: String,
    pub description: String,
    pub as_a: String,      // "As a user"
    pub i_want: String,    // "I want to login"
    pub so_that: String,   // "So that I can access my data"
    pub effort: Option<u32>,
    pub done: bool,
    pub acceptance_criteria: Vec<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Plan {
    pub id: String,
    pub title: String,
    pub status: PlanStatus,
    pub priority: Priority,
    pub plan_type: PlanType,
    pub release: Option<String>,
    pub owners: Vec<String>,
    pub tags: Vec<String>,
    pub effort: Option<u32>,
    pub project: Option<String>, // Parent project ID
    pub epic: Option<String>, // Parent epic ID
    pub story: Option<String>, // Parent story ID (for tasks/subtasks)
    pub created: DateTime<Utc>,
    pub updated: DateTime<Utc>,
    pub goals: Vec<String>,
    pub user_stories: Vec<UserStory>,
    pub tasks: Vec<Task>,
    pub acceptance_criteria: Vec<String>,
    pub dependencies: Vec<String>, // Other plan IDs
    pub blocks: Vec<String>, // Plans this blocks
    pub roots: Vec<String>,
    pub description: String,
}

impl Plan {
    pub fn to_markdown(&self) -> String {
        let tags = self.tags.join(",");
        let owners = self.owners.join(",");
        let dependencies = self.dependencies.join(",");
        let blocks = self.blocks.join(",");
        let effort_str = self.effort.map(|e| e.to_string()).unwrap_or_default();
        let project_str = self.project.clone().unwrap_or_default();
        let epic_str = self.epic.clone().unwrap_or_default();
        let story_str = self.story.clone().unwrap_or_default();
        let roots = if self.roots.is_empty() { String::new() } else { self.roots.join(",") };

        // Bas-metadata för alla plan-typer
        let metadata = format!("id: {id}\ntitle: {title}\nstatus: {status}\npriority: {priority}\ntype: {plan_type}\nrelease: {release}\nowners: {owners}\ntags: {tags}\neffort: {effort}\nproject: {project}\nepic: {epic}\nstory: {story}\ndependencies: {dependencies}\nblocks: {blocks}\nroots: {roots}\ncreated: {created}\nupdated: {updated}\n\n# Description\n\n{desc}\n\n", 
            id=self.id, 
            title=self.title, 
            status=self.status, 
            priority=self.priority,
            plan_type=self.plan_type,
            release=self.release.clone().unwrap_or_default(), 
            owners=owners, 
            tags=tags,
            effort=effort_str,
            project=project_str,
            epic=epic_str,
            story=story_str,
            dependencies=dependencies,
            blocks=blocks,
            roots=roots, 
            created=self.created.format("%Y-%m-%d"), 
            updated=self.updated.format("%Y-%m-%d"), 
            desc=self.description
        );

        // Anpassa innehåll baserat på plan-typ
        match self.plan_type {
            PlanType::Project => {
                let goals_md = if self.goals.is_empty() { "".into() } else { 
                    self.goals.iter().map(|g| format!("- {g}")).collect::<Vec<_>>().join("\n") 
                };
                format!("{}## Project Overview\n\n(Describe the overall project vision and scope)\n\n## Key Objectives\n{}\n\n## Success Criteria\n\n(Define what success looks like for this project)\n\n## Timeline & Milestones\n\n(Add key milestones and deadlines)\n", metadata, goals_md)
            },
            PlanType::Epic => {
                let goals_md = if self.goals.is_empty() { "".into() } else { 
                    self.goals.iter().map(|g| format!("- {g}")).collect::<Vec<_>>().join("\n") 
                };
                format!("{}## Epic Overview\n\n(Describe the large feature or capability this epic delivers)\n\n## Business Goals\n{}\n\n## User Impact\n\n(Describe how this epic benefits users)\n\n## Technical Approach\n\n(High-level technical strategy)\n", metadata, goals_md)
            },
            PlanType::Story => {
                let user_stories_md = self.user_stories.iter().map(|s| {
                    let criteria_md = s.acceptance_criteria.iter().map(|c| format!("  - {c}")).collect::<Vec<_>>().join("\n");
                    let effort = s.effort.map(|e| format!(" {{effort:{}}}", e)).unwrap_or_default();
                    format!("- [{}] {} (As a {}, I want {}, so that {}){}{}",
                        if s.done {"x"} else {" "}, s.description, s.as_a, s.i_want, s.so_that, effort,
                        if criteria_md.is_empty() { String::new() } else { format!("\n{}", criteria_md) }
                    )
                }).collect::<Vec<_>>().join("\n");

                let acceptance_criteria_md = self.acceptance_criteria.iter().map(|c| format!("- {c}")).collect::<Vec<_>>().join("\n");

                format!("{}## User Story\n\n(Write the main user story: As a [user type], I want [goal], so that [benefit])\n\n## Additional User Stories\n{}\n\n## Acceptance Criteria\n{}\n\n## Design Notes\n\n(Add UI/UX considerations, mockups, etc.)\n", metadata, user_stories_md, acceptance_criteria_md)
            },
            PlanType::Task => {
                let tasks_md = self.tasks.iter().map(|t| {
                    format!("- [{}] {}", if t.done {"x"} else {" "}, t.description)
                }).collect::<Vec<_>>().join("\n");

                let acceptance_criteria_md = self.acceptance_criteria.iter().map(|c| format!("- {c}")).collect::<Vec<_>>().join("\n");
                
                format!("{}## Implementation Plan\n\n(Describe the technical approach and implementation steps)\n\n## Sub-tasks\n{}\n\n## Definition of Done\n{}\n\n## Testing Notes\n\n(Add testing strategy and considerations)\n", metadata, tasks_md, acceptance_criteria_md)
            },
            PlanType::SubTask => {
                // SubTasks ska inte längre vara separata filer, men behåller för bakåtkompatibilitet
                format!("{}## Task Details\n\n(This should be moved to the parent Task as a checklist item)\n\n## Notes\n\n(Add any implementation notes)\n", metadata)
            }
        }
    }

    pub fn parse_markdown(md: &str) -> Result<Self> {
        let mut id = String::new();
        let mut title = String::new();
        let mut status = PlanStatus::Planned;
        let mut priority = Priority::Medium;
        let mut plan_type = PlanType::Story;
        let mut release = None;
        let mut owners: Vec<String> = vec![];
        let mut tags: Vec<String> = vec![];
        let mut effort: Option<u32> = None;
        let mut project: Option<String> = None;
        let mut epic: Option<String> = None;
        let mut story: Option<String> = None;
        let mut dependencies: Vec<String> = vec![];
        let mut blocks: Vec<String> = vec![];
        let mut created: Option<DateTime<Utc>> = None;
        let mut updated: Option<DateTime<Utc>> = None;
        let mut description_lines = Vec::new();
        let mut in_description = false;
        let mut goals: Vec<String> = Vec::new();
        let mut user_stories: Vec<UserStory> = Vec::new();
        let mut tasks: Vec<Task> = Vec::new();
        let mut acceptance_criteria: Vec<String> = Vec::new();
        let mut section = "";
        let mut roots: Vec<String> = Vec::new();
        
        for line in md.lines() {
            if line.starts_with("id:") { id = line[3..].trim().to_string(); }
            else if line.starts_with("title:") { title = line[6..].trim().to_string(); }
            else if line.starts_with("status:") { let v = line[7..].trim(); status = match v {"planned"=>PlanStatus::Planned,"active"=>PlanStatus::Active,"in-progress"=>PlanStatus::InProgress,"blocked"=>PlanStatus::Blocked,"done"=>PlanStatus::Done,_=>PlanStatus::Planned}; }
            else if line.starts_with("priority:") { let v = line[9..].trim(); priority = match v {"low"=>Priority::Low,"medium"=>Priority::Medium,"high"=>Priority::High,"critical"=>Priority::Critical,_=>Priority::Medium}; }
            else if line.starts_with("type:") { let v = line[5..].trim(); plan_type = match v {"project"=>PlanType::Project,"epic"=>PlanType::Epic,"story"=>PlanType::Story,"task"=>PlanType::Task,"subtask"=>PlanType::SubTask,_=>PlanType::Story}; }
            else if line.starts_with("release:") { let v = line[8..].trim(); if !v.is_empty() { release = Some(v.to_string()); } }
            else if line.starts_with("owners:") { owners = line[7..].trim().split(',').filter(|s| !s.is_empty()).map(|s| s.trim().to_string()).collect(); }
            else if line.starts_with("tags:") { tags = line[5..].trim().split(',').filter(|s| !s.is_empty()).map(|s| s.trim().to_string()).collect(); }
            else if line.starts_with("effort:") { let v = line[7..].trim(); if !v.is_empty() { effort = v.parse().ok(); } }
            else if line.starts_with("project:") { let v = line[8..].trim(); if !v.is_empty() { project = Some(v.to_string()); } }
            else if line.starts_with("epic:") { let v = line[5..].trim(); if !v.is_empty() { epic = Some(v.to_string()); } }
            else if line.starts_with("story:") { let v = line[6..].trim(); if !v.is_empty() { story = Some(v.to_string()); } }
            else if line.starts_with("dependencies:") { dependencies = line[13..].trim().split(',').filter(|s| !s.is_empty()).map(|s| s.trim().to_string()).collect(); }
            else if line.starts_with("blocks:") { blocks = line[7..].trim().split(',').filter(|s| !s.is_empty()).map(|s| s.trim().to_string()).collect(); }
            else if line.starts_with("roots:") { roots = line[6..].trim().split(',').filter(|s| !s.is_empty()).map(|s| s.trim().to_string()).collect(); }
            else if line.starts_with("created:") { let d = line[8..].trim(); created = Some(parse_date(d)?); }
            else if line.starts_with("updated:") { let d = line[8..].trim(); updated = Some(parse_date(d)?); }
            else if line.starts_with("# Description") { section = "description"; in_description = true; }
            else if line.starts_with("## Goals") { section = "goals"; in_description = false; }
            else if line.starts_with("## User Stories") { section = "user_stories"; in_description = false; }
            else if line.starts_with("## Tasks") { section = "tasks"; in_description = false; }
            else if line.starts_with("## Acceptance Criteria") { section = "acceptance_criteria"; in_description = false; }
            else {
                match section {
                    "description" => { if in_description { description_lines.push(line.to_string()); } },
                    "goals" => { if line.trim_start().starts_with('-') { goals.push(line.trim_start().trim_start_matches('-').trim().to_string()); } },
                    "acceptance_criteria" => { if line.trim_start().starts_with('-') { acceptance_criteria.push(line.trim_start().trim_start_matches('-').trim().to_string()); } },
                    "user_stories" => { 
                        if line.trim_start().starts_with('-') { 
                            let rest = line.trim_start().trim_start_matches('-').trim(); 
                            let done = rest.starts_with("[x]") || rest.starts_with("[X]"); 
                            let mut body = rest; 
                            if done { body = body.trim_start_matches("[x]").trim_start_matches("[X]").trim(); } 
                            else if body.starts_with("[ ]") { body = body.trim_start_matches("[ ]").trim(); }
                            
                            // Simple user story parsing - can be enhanced later
                            let story_id = format!("STORY-{}", user_stories.len() + 1);
                            user_stories.push(UserStory {
                                id: story_id,
                                description: body.to_string(),
                                as_a: "user".to_string(), // Default values for now
                                i_want: body.to_string(),
                                so_that: "achieve goal".to_string(),
                                effort: None,
                                done,
                                acceptance_criteria: vec![],
                            });
                        } 
                    },
                    "tasks" => { 
                        if line.trim_start().starts_with('-') { 
                            let rest = line.trim_start().trim_start_matches('-').trim(); 
                            let done = rest.starts_with("[x]") || rest.starts_with("[X]"); 
                            let mut body = rest; 
                            if done { body = body.trim_start_matches("[x]").trim_start_matches("[X]").trim(); } 
                            else if body.starts_with("[ ]") { body = body.trim_start_matches("[ ]").trim(); }
                            
                            // Extract metadata block {...}
                            let (desc_part, meta_part) = if let Some(idx) = body.rfind('{') { 
                                if body.ends_with('}') { (body[..idx].trim(), Some(&body[idx+1..body.len()-1])) } 
                                else { (body, None) } 
                            } else { (body, None) };
                            
                            let mut task_type=None; let mut effort_str=None; let mut path=None; let mut ttags=Vec::new();
                            if let Some(meta) = meta_part { 
                                for token in meta.split_whitespace() { 
                                    if let Some((k,v)) = token.split_once(':') { 
                                        match k { 
                                            "type"=>task_type=Some(v.to_string()), 
                                            "effort"=>effort_str=Some(v.to_string()), 
                                            "path"=>path=Some(v.to_string()), 
                                            "tags"=>{ ttags = v.split('|').filter(|s| !s.is_empty()).map(|s| s.to_string()).collect(); }, 
                                            _=>{} 
                                        } 
                                    } 
                                } 
                            }
                            tasks.push(Task { description: desc_part.to_string(), done, task_type, effort: effort_str, path, tags: ttags, metadata: None }); 
                        } 
                    },
                    _ => {}
                }
            }
        }
        Ok(Self { 
            id, title, status, priority, plan_type, release, owners, tags, effort, project, epic, story,
            created: created.unwrap_or_else(Utc::now), updated: updated.unwrap_or_else(Utc::now), 
            goals, user_stories, tasks, acceptance_criteria, dependencies, blocks, roots, 
            description: description_lines.join("\n").trim().to_string() 
        })
    }
}

fn parse_date(d: &str) -> Result<DateTime<Utc>> {
    let naive = chrono::NaiveDate::parse_from_str(d, "%Y-%m-%d")?.and_hms_opt(0, 0, 0).unwrap();
    Ok(DateTime::from_naive_utc_and_offset(naive, Utc))
}

pub struct PlanStore { root: PathBuf }
impl PlanStore {
    pub fn new(root: impl Into<PathBuf>) -> Self { Self { root: root.into() } }
    
    fn dir(&self) -> PathBuf { self.root.join(PLAN_DIR) }
    
    pub fn ensure(&self) -> Result<()> { 
        if !self.dir().exists() { 
            fs::create_dir_all(self.dir())?; 
        } 
        Ok(()) 
    }
    
    // Generera nästa ID baserat på plan-typ
    pub fn next_id(&self, plan_type: &PlanType) -> Result<String> { 
        self.ensure()?; 
        let prefix = match plan_type {
            PlanType::Project => "PROJECT",
            PlanType::Epic => "EPIC",
            PlanType::Story => "STORY", 
            PlanType::Task => "TASK",
            PlanType::SubTask => "SUBTASK",
        };
        
        let mut max = 0u32;
        self.scan_all_dirs(&self.dir(), prefix, &mut max)?;
        Ok(format!("{}-{:03}", prefix, max + 1))
    }
    
    // Rekursivt skanna alla mappar för att hitta högsta ID
    fn scan_all_dirs(&self, dir: &PathBuf, prefix: &str, max: &mut u32) -> Result<()> {
        if !dir.exists() { return Ok(()); }
        
        for entry in fs::read_dir(dir)? {
            let entry = entry?;
            let path = entry.path();
            
            if path.is_dir() {
                // Skanna submappar rekursivt
                self.scan_all_dirs(&path, prefix, max)?;
                
                // Kolla om mappnamnet matchar vårt prefix
                if let Some(name) = path.file_name().and_then(|n| n.to_str()) {
                    if let Some(rest) = name.strip_prefix(&format!("{}-", prefix)) {
                        if let Some(dash_pos) = rest.find('-') {
                            let num_str = &rest[..dash_pos];
                            if let Ok(n) = num_str.parse::<u32>() {
                                if n > *max { *max = n; }
                            }
                        }
                    }
                }
            } else if path.extension().and_then(|s| s.to_str()) == Some("md") {
                // Kolla filnamn
                if let Some(name) = path.file_stem().and_then(|n| n.to_str()) {
                    if let Some(rest) = name.strip_prefix(&format!("{}-", prefix)) {
                        if let Some(dash_pos) = rest.find('-') {
                            let num_str = &rest[..dash_pos];
                            if let Ok(n) = num_str.parse::<u32>() {
                                if n > *max { *max = n; }
                            }
                        } else if let Ok(n) = rest.parse::<u32>() {
                            if n > *max { *max = n; }
                        }
                    }
                }
            }
        }
        Ok(())
    }
    
    // Skapa hierarkisk mappath för en plan
    pub fn path_for(&self, plan: &Plan) -> PathBuf {
        match plan.plan_type {
            PlanType::Project => {
                let project_dir = self.dir().join(&plan.id);
                project_dir.join("project.md")
            },
            PlanType::Epic => {
                if let Some(ref project_id) = plan.project {
                    let epic_dir = self.dir().join(project_id).join(&plan.id);
                    epic_dir.join("epic.md")
                } else {
                    // Fallback till flat struktur
                    self.dir().join(format!("{}.md", plan.id))
                }
            },
            PlanType::Story => {
                if let Some(ref project_id) = plan.project {
                    if let Some(ref epic_id) = plan.epic {
                        // Story får sin egen mapp inom epic-mappen
                        let story_dir = self.dir().join(project_id).join(epic_id).join(&plan.id);
                        story_dir.join("story.md")
                    } else {
                        let story_dir = self.dir().join(project_id).join(&plan.id);
                        story_dir.join("story.md")
                    }
                } else {
                    self.dir().join(format!("{}.md", plan.id))
                }
            },
            PlanType::Task => {
                if let Some(ref project_id) = plan.project {
                    if let Some(ref story_id) = plan.story {
                        if let Some(ref epic_id) = plan.epic {
                            // Task får sin egen mapp inom story-mappen
                            let task_dir = self.dir().join(project_id).join(epic_id).join(story_id).join(&plan.id);
                            task_dir.join("task.md")
                        } else {
                            let task_dir = self.dir().join(project_id).join(story_id).join(&plan.id);
                            task_dir.join("task.md")
                        }
                    } else if let Some(ref epic_id) = plan.epic {
                        let task_dir = self.dir().join(project_id).join(epic_id).join(&plan.id);
                        task_dir.join("task.md")
                    } else {
                        let task_dir = self.dir().join(project_id).join(&plan.id);
                        task_dir.join("task.md")
                    }
                } else {
                    self.dir().join(format!("{}.md", plan.id))
                }
            },
            PlanType::SubTask => {
                // SubTasks ska inte vara separata filer längre, men vi returnerar en path för bakåtkompatibilitet
                // I praktiken borde detta inte användas - subtasks ska vara checkboxes i tasks
                if let Some(ref project_id) = plan.project {
                    if let Some(ref story_id) = plan.story {
                        if let Some(ref epic_id) = plan.epic {
                            let story_dir = self.dir().join(project_id).join(epic_id).join(story_id);
                            story_dir.join(format!("deprecated-{}.md", plan.id))
                        } else {
                            let story_dir = self.dir().join(project_id).join(story_id);
                            story_dir.join(format!("deprecated-{}.md", plan.id))
                        }
                    } else if let Some(ref epic_id) = plan.epic {
                        let epic_dir = self.dir().join(project_id).join(epic_id);
                        epic_dir.join(format!("deprecated-{}.md", plan.id))
                    } else {
                        self.dir().join(project_id).join(format!("deprecated-{}.md", plan.id))
                    }
                } else {
                    self.dir().join(format!("deprecated-{}.md", plan.id))
                }
            }
        }
    }
    
    pub fn save(&self, plan: &Plan) -> Result<()> { 
        self.ensure()?; 
        let path = self.path_for(plan);
        
        // Skapa alla nödvändiga mappar
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent)?;
        }
        
        // Om filen redan existerar, försök bevara user content
        if path.exists() {
            if let Ok(existing_content) = fs::read_to_string(&path) {
                let updated_content = self.merge_plan_content(plan, &existing_content)?;
                fs::write(path, updated_content)?;
                return Ok(());
            }
        }
        
        // Fallback: skriv helt ny fil
        fs::write(path, plan.to_markdown())?; 
        Ok(()) 
    }
    
    // Slå ihop plan metadata med befintligt user content
    fn merge_plan_content(&self, plan: &Plan, existing_content: &str) -> Result<String> {
        let lines: Vec<&str> = existing_content.lines().collect();
        let mut result = Vec::new();
        let mut in_metadata = true;
        let mut found_description = false;
        
        // Generera ny metadata
        let tags = plan.tags.join(",");
        let owners = plan.owners.join(",");
        let dependencies = plan.dependencies.join(",");
        let blocks = plan.blocks.join(",");
        let effort_str = plan.effort.map(|e| e.to_string()).unwrap_or_default();
        let project_str = plan.project.clone().unwrap_or_default();
        let epic_str = plan.epic.clone().unwrap_or_default();
        let story_str = plan.story.clone().unwrap_or_default();
        let roots = if plan.roots.is_empty() { String::new() } else { plan.roots.join(",") };
        
        // Skriv uppdaterad metadata
        result.push(format!("id: {}", plan.id));
        result.push(format!("title: {}", plan.title));
        result.push(format!("status: {}", plan.status));
        result.push(format!("priority: {}", plan.priority));
        result.push(format!("type: {}", plan.plan_type));
        result.push(format!("release: {}", plan.release.clone().unwrap_or_default()));
        result.push(format!("owners: {}", owners));
        result.push(format!("tags: {}", tags));
        result.push(format!("effort: {}", effort_str));
        result.push(format!("project: {}", project_str));
        result.push(format!("epic: {}", epic_str));
        result.push(format!("story: {}", story_str));
        result.push(format!("dependencies: {}", dependencies));
        result.push(format!("blocks: {}", blocks));
        result.push(format!("roots: {}", roots));
        result.push(format!("created: {}", plan.created.format("%Y-%m-%d")));
        result.push(format!("updated: {}", plan.updated.format("%Y-%m-%d")));
        result.push("".to_string());
        
        // Bevara allt content från "# Description" och framåt, men uppdatera tasks sections
        for line in lines {
            if line.starts_with("# Description") {
                in_metadata = false;
                found_description = true;
                result.push(line.to_string());
            } else if !in_metadata && found_description {
                // Uppdatera Sub-tasks section med nya tasks
                if line.starts_with("## Sub-tasks") {
                    result.push(line.to_string());
                    // Lägg till alla tasks från plan.tasks
                    for task in &plan.tasks {
                        let check = if task.done { "x" } else { " " };
                        result.push(format!("- [{}] {}", check, task.description));
                    }
                    // Skippa befintliga task-rader tills nästa section
                    continue;
                } else if line.starts_with("## Definition of Done") {
                    result.push(line.to_string());
                    // Lägg till alla acceptance criteria från plan.acceptance_criteria
                    for criteria in &plan.acceptance_criteria {
                        result.push(format!("- {}", criteria));
                    }
                    continue;
                } else if line.starts_with("- [") && result.last().map_or(false, |l| l.starts_with("## Sub-tasks")) {
                    // Skippa gamla tasks - de redan lagda till ovan
                    continue;
                } else if line.starts_with("- ") && result.last().map_or(false, |l| l.starts_with("## Definition of Done")) {
                    // Skippa gamla criteria - de redan lagda till ovan  
                    continue;
                } else {
                    result.push(line.to_string());
                }
            }
        }
        
        Ok(result.join("\n"))
    }
    
    pub fn load(&self, id: &str) -> Result<Plan> { 
        // Försök hitta filen genom att söka rekursivt
        let path = self.find_plan_file(id)?;
        let text = fs::read_to_string(&path).with_context(|| format!("load plan {id}"))?; 
        Plan::parse_markdown(&text) 
    }
    
    // Hitta plan-fil rekursivt
    fn find_plan_file(&self, id: &str) -> Result<PathBuf> {
        self.search_for_plan(&self.dir(), id)
            .ok_or_else(|| anyhow::anyhow!("Plan {} not found", id))
    }
    
    fn search_for_plan(&self, dir: &PathBuf, id: &str) -> Option<PathBuf> {
        if !dir.exists() { return None; }
        
        for entry in fs::read_dir(dir).ok()? {
            let entry = entry.ok()?;
            let path = entry.path();
            
            if path.is_dir() {
                // Kolla om mappnamnet matchar ID:t
                if let Some(name) = path.file_name().and_then(|n| n.to_str()) {
                    if name.starts_with(id) {
                        // Leta efter project.md, epic.md, story.md, task.md i mappen
                        for filename in &["project.md", "epic.md", "story.md", "task.md"] {
                            let file_path = path.join(filename);
                            if file_path.exists() {
                                return Some(file_path);
                            }
                        }
                    }
                }
                
                // Sök rekursivt i submappar
                if let Some(found) = self.search_for_plan(&path, id) {
                    return Some(found);
                }
            } else if path.extension().and_then(|s| s.to_str()) == Some("md") {
                if let Some(name) = path.file_stem().and_then(|n| n.to_str()) {
                    if name == id {
                        return Some(path);
                    }
                }
            }
        }
        None
    }
    
    pub fn load_all(&self) -> Result<Vec<Plan>> { 
        self.ensure()?; 
        let mut plans = Vec::new(); 
        self.collect_plans(&self.dir(), &mut plans)?;
        plans.sort_by(|a, b| a.id.cmp(&b.id)); 
        Ok(plans) 
    }
    
    fn collect_plans(&self, dir: &PathBuf, plans: &mut Vec<Plan>) -> Result<()> {
        if !dir.exists() { return Ok(()); }
        
        for entry in fs::read_dir(dir)? {
            let entry = entry?;
            let path = entry.path();
            
            if path.is_dir() {
                // Sök rekursivt i submappar
                self.collect_plans(&path, plans)?;
            } else if path.extension().and_then(|s| s.to_str()) == Some("md") {
                let text = fs::read_to_string(&path)?;
                if let Ok(plan) = Plan::parse_markdown(&text) {
                    plans.push(plan);
                }
            }
        }
        Ok(())
    }
    
    // Template management methods
    pub fn save_template(&self, template: &PlanTemplate) -> Result<()> {
        self.ensure()?;
        let template_dir = self.root.join(TEMPLATE_DIR);
        fs::create_dir_all(&template_dir)?;
        
        let filename = format!("{}.toml", template.name.replace(' ', "_").to_lowercase());
        let path = template_dir.join(filename);
        
        let toml_content = toml::to_string(template)?;
        fs::write(path, toml_content)?;
        Ok(())
    }
    
    pub fn load_template(&self, name: &str) -> Result<PlanTemplate> {
        let template_dir = self.root.join(TEMPLATE_DIR);
        let filename = format!("{}.toml", name.replace(' ', "_").to_lowercase());
        let path = template_dir.join(filename);
        
        let toml_content = fs::read_to_string(path)?;
        let template: PlanTemplate = toml::from_str(&toml_content)?;
        Ok(template)
    }
    
    pub fn list_templates(&self) -> Result<Vec<String>> {
        let template_dir = self.root.join(TEMPLATE_DIR);
        if !template_dir.exists() {
            return Ok(vec![]);
        }
        
        let mut templates = Vec::new();
        for entry in fs::read_dir(template_dir)? {
            let entry = entry?;
            let path = entry.path();
            
            if path.extension().and_then(|s| s.to_str()) == Some("toml") {
                if let Some(stem) = path.file_stem().and_then(|s| s.to_str()) {
                    templates.push(stem.replace('_', " "));
                }
            }
        }
        templates.sort();
        Ok(templates)
    }
    
    pub fn create_from_template(&self, template_name: &str, title: &str, project: Option<&str>, epic: Option<&str>, story: Option<&str>) -> Result<Plan> {
        let template = self.load_template(template_name)?;
        let id = self.next_id(&template.plan_type)?;
        let now = Utc::now();
        
        let plan = Plan {
            id: id.clone(),
            title: title.to_string(),
            status: PlanStatus::Planned,
            priority: template.priority,
            plan_type: template.plan_type,
            release: None,
            owners: vec![],
            tags: template.tags.clone(),
            effort: None,
            project: project.map(|s| s.to_string()),
            epic: epic.map(|s| s.to_string()),
            story: story.map(|s| s.to_string()),
            created: now,
            updated: now,
            goals: vec![],
            user_stories: vec![],
            tasks: template.default_tasks.iter().map(|desc| Task {
                description: desc.clone(),
                done: false,
                task_type: None,
                effort: None,
                path: None,
                tags: vec![],
                metadata: None,
            }).collect(),
            acceptance_criteria: template.default_acceptance_criteria.clone(),
            dependencies: vec![],
            blocks: vec![],
            roots: vec![],
            description: template.content_template.clone(),
        };
        
        self.save(&plan)?;
        Ok(plan)
    }
}

pub fn create_plan(store: &PlanStore, title: &str, tags: Option<&str>) -> Result<Plan> {
    create_plan_with_options(store, title, tags, PlanType::Story, Priority::Medium, None, None, None, None)
}

pub fn create_plan_with_options(store: &PlanStore, title: &str, tags: Option<&str>, plan_type: PlanType, priority: Priority, project: Option<&str>, epic: Option<&str>, story: Option<&str>, effort: Option<u32>) -> Result<Plan> {
    let id = store.next_id(&plan_type)?;
    let now = Utc::now();
    
    // Auto-resolve project from epic if epic is provided but project is not
    let resolved_project = if project.is_none() && epic.is_some() {
        if let Some(epic_id) = epic {
            // Try to load the epic and get its project
            if let Ok(epic_plan) = store.load(epic_id) {
                epic_plan.project.clone()
            } else {
                None
            }
        } else {
            None
        }
    } else {
        project.map(|s| s.to_string())
    };
    
    // Auto-resolve project from story if story is provided but project is not
    let resolved_project = if resolved_project.is_none() && story.is_some() {
        if let Some(story_id) = story {
            // Try to load the story and get its project
            if let Ok(story_plan) = store.load(story_id) {
                story_plan.project.clone()
            } else {
                None
            }
        } else {
            None
        }
    } else {
        resolved_project
    };
    
    let p = Plan { 
        id: id.clone(), 
        title: title.to_string(), 
        status: PlanStatus::Planned, 
        priority,
        plan_type,
        release: None, 
        owners: vec![], 
        tags: tags.unwrap_or("").split(',').filter(|s| !s.is_empty()).map(|s| s.trim().to_string()).collect(), 
        effort,
        project: resolved_project,
        epic: epic.map(|s| s.to_string()),
        story: story.map(|s| s.to_string()),
        created: now, 
        updated: now, 
        goals: vec![], 
        user_stories: vec![],
        tasks: vec![Task { 
            description: "First task".into(), 
            done: false, 
            task_type: None, 
            effort: None, 
            path: None, 
            tags: vec![],
            metadata: None,
        }], 
        acceptance_criteria: vec![],
        dependencies: vec![],
        blocks: vec![],
        roots: vec![], 
        description: "(Add details here)".into() 
    };
    store.save(&p)?; 
    Ok(p)
}

fn log_signal(root: &PathBuf, kind: &str, kv: &[(&str, &str)]) -> Result<()> {
    let dir = root.join(".rune/index");
    fs::create_dir_all(&dir)?;
    let path = dir.join("signals.log");
    let ts = Utc::now().to_rfc3339();
    let mut line = format!("{ts} kind={kind}");
    for (k,v) in kv { line.push(' '); line.push_str(k); line.push('='); line.push_str(v); }
    line.push('\n');
    let mut f = std::fs::OpenOptions::new().create(true).append(true).open(path)?;
    f.write_all(line.as_bytes())?;
    Ok(())
}

// ---- Streams ----
#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct Stream {
    pub id: String,
    pub title: String,
    pub tags: Vec<String>,
    pub plans: Vec<String>,
    pub created: DateTime<Utc>,
    pub updated: DateTime<Utc>,
    pub description: String,
}

impl Stream {
    pub fn to_markdown(&self) -> String {
        format!("id: {id}\ntitle: {title}\ntags: {tags}\nplans: {plans}\ncreated: {created}\nupdated: {updated}\n\n# Description\n\n{desc}\n", id=self.id, title=self.title, tags=self.tags.join(","), plans=self.plans.join(","), created=self.created.format("%Y-%m-%d"), updated=self.updated.format("%Y-%m-%d"), desc=self.description)
    }
    pub fn parse(md: &str) -> Result<Self> {
        let mut id=String::new(); let mut title=String::new(); let mut tags=Vec::new(); let mut plans=Vec::new(); let mut created=None; let mut updated=None; let mut desc_lines=Vec::new(); let mut in_desc=false;
        for line in md.lines() {
            if line.starts_with("id:") { id=line[3..].trim().to_string(); }
            else if line.starts_with("title:") { title=line[6..].trim().to_string(); }
            else if line.starts_with("tags:") { tags=line[5..].trim().split(',').filter(|s| !s.is_empty()).map(|s| s.trim().to_string()).collect(); }
            else if line.starts_with("plans:") { plans=line[6..].trim().split(',').filter(|s| !s.is_empty()).map(|s| s.trim().to_string()).collect(); }
            else if line.starts_with("created:") { created=Some(parse_date(&line[8..].trim())?); }
            else if line.starts_with("updated:") { updated=Some(parse_date(&line[8..].trim())?); }
            else if line.starts_with("# Description") { in_desc=true; }
            else if in_desc { desc_lines.push(line.to_string()); }
        }
        Ok(Stream { id, title, tags, plans, created: created.unwrap_or_else(Utc::now), updated: updated.unwrap_or_else(Utc::now), description: desc_lines.join("\n").trim().to_string() })
    }
}

pub struct StreamStore { root: PathBuf }
impl StreamStore {
    pub fn new(root: impl Into<PathBuf>) -> Self { Self { root: root.into() } }
    fn dir(&self) -> PathBuf { self.root.join(STREAM_DIR) }
    fn ensure(&self) -> Result<()> { if !self.dir().exists() { fs::create_dir_all(self.dir())?; } Ok(()) }
    fn next_id(&self) -> Result<String> { self.ensure()?; let mut max=0u32; for e in fs::read_dir(self.dir())? { let e=e?; if let Some(name)=e.file_name().to_str() { if let Some(rest)=name.strip_prefix("STREAM-") { if let Some(num)=rest.strip_suffix(".md") { if let Ok(n)=num.parse::<u32>() { if n>max { max=n; } } } } } } Ok(format!("STREAM-{:03}", max+1)) }
    pub fn create(&self, title:&str, tags: Option<&str>) -> Result<Stream> { let id=self.next_id()?; let now=Utc::now(); let s=Stream { id: id.clone(), title: title.to_string(), tags: tags.unwrap_or("").split(',').filter(|s| !s.is_empty()).map(|s| s.trim().to_string()).collect(), plans: vec![], created: now, updated: now, description: "(Add details)".into() }; self.save(&s)?; log_signal(&self.root, "stream_created", &[ ("stream", &id) ])?; Ok(s) }
    pub fn path_for(&self, id:&str) -> PathBuf { self.dir().join(format!("{id}.md")) }
    pub fn save(&self, s:&Stream) -> Result<()> { self.ensure()?; fs::write(self.path_for(&s.id), s.to_markdown())?; Ok(()) }
    pub fn load(&self, id:&str) -> Result<Stream> { let text=fs::read_to_string(self.path_for(id))?; Stream::parse(&text) }
    pub fn list(&self) -> Result<Vec<Stream>> { self.ensure()?; let mut v=Vec::new(); for e in fs::read_dir(self.dir())? { let e=e?; if e.path().extension().and_then(|s| s.to_str())==Some("md") { if let Ok(st)=Stream::parse(&fs::read_to_string(e.path())?) { v.push(st); } } } v.sort_by(|a,b| a.id.cmp(&b.id)); Ok(v) }
    pub fn attach(&self, stream_id:&str, plan_id:&str) -> Result<()> { let mut s=self.load(stream_id)?; if !s.plans.contains(&plan_id.to_string()) { s.plans.push(plan_id.to_string()); s.updated=Utc::now(); self.save(&s)?; log_signal(&self.root, "stream_attach", &[ ("stream", stream_id), ("plan", plan_id) ])?; } Ok(()) }
}

// --- Query / Slice filtering ---
#[derive(Debug, Default)]
pub struct PlanQuery {
    pub statuses: Vec<String>,
    pub tags: Vec<String>,
    pub roots: Vec<String>,
    pub text: Option<String>,
    pub path: Option<String>,
}

pub fn parse_plan_query(q:&str) -> PlanQuery {
    let mut pq=PlanQuery::default();
    for tok in q.split_whitespace() {
        if let Some((k,v))=tok.split_once('=') {
            match k {
                "status"|"statuses" => pq.statuses.extend(v.split(',').map(|s| s.to_lowercase())),
                "tag"|"tags" => pq.tags.extend(v.split(',').map(|s| s.to_lowercase())),
                "root"|"roots" => pq.roots.extend(v.split(',').map(|s| s.to_string())),
                "path" => pq.path = Some(v.to_string()),
                "text"|"q" => pq.text = Some(v.to_string()),
                _ => {}
            }
        }
    }
    pq
}

pub fn filter_plans(plans: &[Plan], query:&PlanQuery) -> Vec<Plan> {
    plans.iter().filter(|p| {
        if !query.statuses.is_empty() && !query.statuses.iter().any(|s| s==p.status.as_str()) { return false; }
        if !query.tags.is_empty() && query.tags.iter().any(|t| !p.tags.iter().any(|pt| pt.to_lowercase()==*t)) { return false; }
        if !query.roots.is_empty() && !p.roots.iter().any(|r| query.roots.iter().any(|qr| r.starts_with(qr))) { return false; }
        if let Some(ref txt)=query.text { let t=txt.to_lowercase(); if !p.title.to_lowercase().contains(&t) && !p.description.to_lowercase().contains(&t) { return false; } }
        if let Some(ref path)=query.path { if !p.tasks.iter().any(|t| t.path.as_deref().map(|pp| pp.starts_with(path)).unwrap_or(false)) { return false; } }
        true
    }).cloned().collect()
}

// ---- Insights (lightweight heuristic, AI-ready stub) ----
pub struct PlanInsight { pub plan_id: String, pub messages: Vec<String> }

pub fn generate_plan_insights(plan: &Plan) -> PlanInsight {
    let mut msgs = Vec::new();
    let total = plan.tasks.len();
    let done = plan.tasks.iter().filter(|t| t.done).count();
    if total>0 { msgs.push(format!("Progress: {done}/{total} tasks ({:.0}%)", (done as f32/ total as f32)*100.0)); }
    if plan.goals.is_empty() { msgs.push("No goals defined; consider adding 2–5 high-level goals.".into()); }
    let missing_effort = plan.tasks.iter().filter(|t| !t.done && t.effort.is_none()).count();
    if missing_effort > 0 { msgs.push(format!("{} open tasks lack effort sizing.", missing_effort)); }
    let long_titles = plan.tasks.iter().filter(|t| !t.done && t.description.split_whitespace().count()>18).count();
    if long_titles>0 { msgs.push(format!("{} tasks look verbose—may benefit from splitting.", long_titles)); }
    if plan.roots.is_empty() { msgs.push("No roots set; add code roots to enable path-focused slices.".into()); }
    let typed = plan.tasks.iter().filter(|t| t.task_type.is_some()).count();
    if typed < total && total>0 { msgs.push(format!("Only {}/{} tasks have a type; add types for better analytics.", typed, total)); }
    PlanInsight { plan_id: plan.id.clone(), messages: msgs }
}

pub struct WorkspaceInsights { pub plan_insights: Vec<PlanInsight>, pub summary: Vec<String> }

pub fn generate_workspace_insights(plans: &[Plan]) -> WorkspaceInsights {
    let mut plan_insights = Vec::new();
    for p in plans { plan_insights.push(generate_plan_insights(p)); }
    // Aggregate
    let total_plans = plans.len();
    let active = plans.iter().filter(|p| matches!(p.status, PlanStatus::Active|PlanStatus::InProgress)).count();
    let blocked = plans.iter().filter(|p| matches!(p.status, PlanStatus::Blocked)).count();
    let mut summary = vec![format!("Plans: {} (active {}, blocked {})", total_plans, active, blocked)];
    let avg_completion: f32 = if total_plans>0 { plans.iter().map(|p| if p.tasks.is_empty(){0.0}else{ p.tasks.iter().filter(|t| t.done).count() as f32 / p.tasks.len() as f32 }).sum::<f32>() / total_plans as f32 } else {0.0};
    summary.push(format!("Avg task completion {:.0}%", avg_completion*100.0));
    WorkspaceInsights { plan_insights, summary }
}

pub fn update_status(store: &PlanStore, id: &str, status: PlanStatus) -> Result<()> { 
    let mut p = store.load(id)?; 
    p.status = status; 
    p.updated = Utc::now(); 
    store.save(&p)?; 
    log_signal(&store.root, "status_change", &[("plan", &p.id), ("status", p.status.as_str())])?; 
    Ok(()) 
}

pub fn add_user_story(store: &PlanStore, id: &str, description: &str, as_a: Option<&str>, i_want: Option<&str>, so_that: Option<&str>, effort: Option<u32>) -> Result<()> {
    let mut p = store.load(id)?;
    let story_id = format!("STORY-{}", p.user_stories.len() + 1);
    let user_story = UserStory {
        id: story_id,
        description: description.to_string(),
        as_a: as_a.unwrap_or("user").to_string(),
        i_want: i_want.unwrap_or(description).to_string(),
        so_that: so_that.unwrap_or("achieve goal").to_string(),
        effort,
        done: false,
        acceptance_criteria: vec![],
    };
    p.user_stories.push(user_story);
    p.updated = Utc::now();
    store.save(&p)?;
    log_signal(&store.root, "user_story_added", &[("plan", &p.id), ("count", &p.user_stories.len().to_string())])?;
    Ok(())
}

pub fn add_acceptance_criteria(store: &PlanStore, id: &str, criteria: &str) -> Result<()> {
    let mut p = store.load(id)?;
    p.acceptance_criteria.push(criteria.to_string());
    p.updated = Utc::now();
    store.save(&p)?;
    log_signal(&store.root, "criteria_added", &[("plan", &p.id), ("count", &p.acceptance_criteria.len().to_string())])?;
    Ok(())
}

pub fn set_priority(store: &PlanStore, id: &str, priority: Priority) -> Result<()> {
    let mut p = store.load(id)?;
    p.priority = priority;
    p.updated = Utc::now();
    store.save(&p)?;
    log_signal(&store.root, "priority_changed", &[("plan", &p.id), ("priority", p.priority.as_str())])?;
    Ok(())
}

pub fn set_plan_type(store: &PlanStore, id: &str, plan_type: PlanType) -> Result<()> {
    let mut p = store.load(id)?;
    p.plan_type = plan_type;
    p.updated = Utc::now();
    store.save(&p)?;
    log_signal(&store.root, "type_changed", &[("plan", &p.id), ("type", p.plan_type.as_str())])?;
    Ok(())
}

pub fn set_epic(store: &PlanStore, id: &str, epic: &str) -> Result<()> {
    let mut p = store.load(id)?;
    p.epic = Some(epic.to_string());
    p.updated = Utc::now();
    store.save(&p)?;
    log_signal(&store.root, "epic_set", &[("plan", &p.id), ("epic", epic)])?;
    Ok(())
}

pub fn set_effort(store: &PlanStore, id: &str, effort: u32) -> Result<()> {
    let mut p = store.load(id)?;
    p.effort = Some(effort);
    p.updated = Utc::now();
    store.save(&p)?;
    log_signal(&store.root, "effort_set", &[("plan", &p.id), ("effort", &effort.to_string())])?;
    Ok(())
}

pub fn add_dependency(store: &PlanStore, id: &str, depends_on: &str) -> Result<()> {
    let mut p = store.load(id)?;
    if !p.dependencies.contains(&depends_on.to_string()) {
        p.dependencies.push(depends_on.to_string());
        p.updated = Utc::now();
        store.save(&p)?;
        log_signal(&store.root, "dependency_added", &[("plan", &p.id), ("depends_on", depends_on)])?;
    }
    Ok(())
}

pub fn remove_dependency(store: &PlanStore, id: &str, depends_on: &str) -> Result<()> {
    let mut p = store.load(id)?;
    p.dependencies.retain(|d| d != depends_on);
    p.updated = Utc::now();
    store.save(&p)?;
    log_signal(&store.root, "dependency_removed", &[("plan", &p.id), ("depends_on", depends_on)])?;
    Ok(())
}
pub fn add_task(store: &PlanStore, id: &str, desc: &str) -> Result<()> { let mut p = store.load(id)?; p.tasks.push(Task { description: desc.into(), done: false, task_type: None, effort: None, path: None, tags: vec![], metadata: None }); p.updated = Utc::now(); store.save(&p)?; log_signal(&store.root, "task_added", &[ ("plan", &p.id), ("count", &p.tasks.len().to_string()) ])?; Ok(()) }
pub fn add_task_with_meta(store: &PlanStore, id: &str, desc: &str, task_type: Option<&str>, effort: Option<&str>, path: Option<&str>, tags: Option<&str>) -> Result<()> {
    let mut p = store.load(id)?;
    let tag_list = tags.unwrap_or("").split(',').filter(|s| !s.is_empty()).map(|s| s.trim().to_string()).collect();
    p.tasks.push(Task { description: desc.into(), done: false, task_type: task_type.map(|s| s.to_string()), effort: effort.map(|s| s.to_string()), path: path.map(|s| s.to_string()), tags: tag_list, metadata: None });
    p.updated = Utc::now();
    store.save(&p)?;
    log_signal(&store.root, "task_added", &[ ("plan", &p.id), ("count", &p.tasks.len().to_string()) ])?;
    Ok(())
}
pub fn update_roots(store: &PlanStore, id: &str, roots: &str) -> Result<()> {
    let mut p = store.load(id)?;
    p.roots = roots.split(',').filter(|s| !s.is_empty()).map(|s| s.trim().to_string()).collect();
    p.updated = Utc::now();
    store.save(&p)?;
    log_signal(&store.root, "roots_set", &[ ("plan", &p.id), ("roots_count", &p.roots.len().to_string()) ])?;
    Ok(())
}
pub fn mark_task_done(store: &PlanStore, id: &str, index_one_based: usize) -> Result<bool> {
    let mut p = store.load(id)?;
    if index_one_based == 0 || index_one_based > p.tasks.len() { return Ok(false); }
    let idx = index_one_based - 1;
    if !p.tasks[idx].done { p.tasks[idx].done = true; p.updated = Utc::now();
        let all_done = !p.tasks.is_empty() && p.tasks.iter().all(|t| t.done);
        if all_done { p.status = PlanStatus::Done; }
        store.save(&p)?;
        log_signal(&store.root, "task_done", &[ ("plan", &p.id), ("task_index", &index_one_based.to_string()), ("all_done", &all_done.to_string()) ])?;
        return Ok(true);
    }
    Ok(false)
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct PlanningConfig {
    // Legacy fields
    #[serde(default = "default_auto_complete")] 
    pub auto_complete_on_all_tasks_done: bool,
    #[serde(default)] 
    pub archive_done_after_days: Option<u32>,
    #[serde(default)] 
    pub board_default_status_filters: Option<Vec<String>>,
    
    // Enhanced configuration
    #[serde(default)]
    pub project: ProjectConfig,
    #[serde(default)]
    pub versions: HashMap<String, VersionConfig>,
    #[serde(default)]
    pub components: HashMap<String, ComponentConfig>,
    #[serde(default)]
    pub tags: TagsConfig,
    #[serde(default)]
    pub effort: EffortConfig,
    #[serde(default)]
    pub task_types: HashMap<String, TaskTypeConfig>,
    #[serde(default)]
    pub templates: TemplatesConfig,
    #[serde(default)]
    pub automation: AutomationConfig,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ProjectConfig {
    pub name: String,
    pub key: String,
    pub description: String,
}

impl Default for ProjectConfig {
    fn default() -> Self {
        Self {
            name: "Project".to_string(),
            key: "PROJ".to_string(),
            description: "Default project".to_string(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct VersionConfig {
    pub name: String,
    pub target_date: String,
    pub status: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ComponentConfig {
    pub name: String,
    pub description: String,
    pub color: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TagsConfig {
    pub technical: Vec<String>,
    pub features: Vec<String>,
    pub priority: Vec<String>,
    pub workflow: Vec<String>,
}

impl Default for TagsConfig {
    fn default() -> Self {
        Self {
            technical: vec!["backend".to_string(), "frontend".to_string(), "cli".to_string()],
            features: vec!["auth".to_string(), "ui".to_string(), "api".to_string()],
            priority: vec!["high".to_string(), "medium".to_string(), "low".to_string()],
            workflow: vec!["todo".to_string(), "in-progress".to_string(), "review".to_string(), "done".to_string()],
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct EffortConfig {
    pub scale: Vec<u32>,
    pub description: String,
}

impl Default for EffortConfig {
    fn default() -> Self {
        Self {
            scale: vec![1, 2, 3, 5, 8, 13, 21],
            description: "Fibonacci scale for story points".to_string(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TaskTypeConfig {
    pub name: String,
    pub description: String,
    pub icon: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TemplatesConfig {
    pub epic: String,
    pub story: String,
    pub task: String,
}

impl Default for TemplatesConfig {
    fn default() -> Self {
        Self {
            epic: "# Epic: {title}\n\n## Goals\n\n## Success Criteria\n\n## User Impact\n".to_string(),
            story: "# Story: {title}\n\n## User Story\nAs a [user type], I want [functionality] so that [benefit].\n\n## Acceptance Criteria\n- [ ] Criteria 1\n- [ ] Criteria 2\n".to_string(),
            task: "# Task: {title}\n\n## Description\n\n## Implementation Notes\n\n## Definition of Done\n- [ ] Code complete\n- [ ] Tests written\n- [ ] Documentation updated\n".to_string(),
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct AutomationConfig {
    pub auto_complete_epic_when_all_stories_done: bool,
    pub auto_complete_story_when_all_tasks_done: bool,
    pub auto_update_epic_progress: bool,
    pub auto_tag_by_component: bool,
    pub auto_tag_by_file_path: bool,
    pub require_acceptance_criteria_for_stories: bool,
    pub require_effort_for_stories: bool,
    pub max_effort_per_story: u32,
}

impl Default for AutomationConfig {
    fn default() -> Self {
        Self {
            auto_complete_epic_when_all_stories_done: true,
            auto_complete_story_when_all_tasks_done: true,
            auto_update_epic_progress: true,
            auto_tag_by_component: true,
            auto_tag_by_file_path: false,
            require_acceptance_criteria_for_stories: true,
            require_effort_for_stories: true,
            max_effort_per_story: 21,
        }
    }
}

fn default_auto_complete() -> bool { true }

impl Default for PlanningConfig { 
    fn default() -> Self { 
        let mut versions = HashMap::new();
        versions.insert("v0.1.0".to_string(), VersionConfig {
            name: "Foundation".to_string(),
            target_date: "2025-12-01".to_string(),
            status: "planned".to_string(),
        });
        
        let mut components = HashMap::new();
        components.insert("core".to_string(), ComponentConfig {
            name: "Core".to_string(),
            description: "Core functionality".to_string(),
            color: "blue".to_string(),
        });
        components.insert("ui".to_string(), ComponentConfig {
            name: "UI".to_string(),
            description: "User interface".to_string(),
            color: "green".to_string(),
        });
        
        let mut task_types = HashMap::new();
        task_types.insert("feature".to_string(), TaskTypeConfig {
            name: "Feature".to_string(),
            description: "New functionality".to_string(),
            icon: "✨".to_string(),
        });
        task_types.insert("bug".to_string(), TaskTypeConfig {
            name: "Bug".to_string(),
            description: "Bug fix".to_string(),
            icon: "🐛".to_string(),
        });
        task_types.insert("task".to_string(), TaskTypeConfig {
            name: "Task".to_string(),
            description: "General task".to_string(),
            icon: "📋".to_string(),
        });
        
        Self { 
            auto_complete_on_all_tasks_done: true, 
            archive_done_after_days: None, 
            board_default_status_filters: None,
            project: ProjectConfig::default(),
            versions,
            components,
            tags: TagsConfig::default(),
            effort: EffortConfig::default(),
            task_types,
            templates: TemplatesConfig::default(),
            automation: AutomationConfig::default(),
        } 
    } 
}

impl PlanningConfig {
    pub fn load(root: &PathBuf) -> Result<Self> {
        let path = root.join(CONFIG_FILE);
        if !path.exists() { return Ok(Self::default()); }
        let data = fs::read_to_string(path)?;
        Ok(toml::from_str(&data).unwrap_or_default())
    }
    pub fn save(&self, root: &PathBuf) -> Result<()> {
        let path = root.join(CONFIG_FILE);
        if let Some(parent) = path.parent() { fs::create_dir_all(parent)?; }
        fs::write(path, toml::to_string_pretty(self)?)?;
        Ok(())
    }
    
    /// Get all available tags as a flat list
    pub fn all_tags(&self) -> Vec<String> {
        let mut tags = Vec::new();
        tags.extend(self.tags.technical.clone());
        tags.extend(self.tags.features.clone());
        tags.extend(self.tags.priority.clone());
        tags.extend(self.tags.workflow.clone());
        tags.sort();
        tags.dedup();
        tags
    }
    
    /// Get all available versions
    pub fn all_versions(&self) -> Vec<String> {
        self.versions.keys().cloned().collect()
    }
    
    /// Get all available components
    pub fn all_components(&self) -> Vec<String> {
        self.components.keys().cloned().collect()
    }
    
    /// Validate a plan against configuration rules
    pub fn validate_plan(&self, plan: &Plan) -> Vec<String> {
        let mut errors = Vec::new();
        
        // Check if story has acceptance criteria when required
        if self.automation.require_acceptance_criteria_for_stories 
            && plan.plan_type == PlanType::Story 
            && plan.acceptance_criteria.is_empty() {
            errors.push("Stories must have acceptance criteria".to_string());
        }
        
        // Check if story has effort when required
        if self.automation.require_effort_for_stories 
            && plan.plan_type == PlanType::Story 
            && plan.effort.is_none() {
            errors.push("Stories must have effort estimation".to_string());
        }
        
        // Check effort bounds
        if let Some(effort) = plan.effort {
            if effort > self.automation.max_effort_per_story {
                errors.push(format!("Effort {} exceeds maximum {}", effort, self.automation.max_effort_per_story));
            }
            
            // Check if effort is in valid scale
            if !self.effort.scale.contains(&effort) {
                errors.push(format!("Effort {} is not in valid scale: {:?}", effort, self.effort.scale));
            }
        }
        
        errors
    }
    
    /// Get template content for a plan type
    pub fn get_template(&self, plan_type: &PlanType) -> String {
        match plan_type {
            PlanType::Epic => self.templates.epic.clone(),
            PlanType::Story => self.templates.story.clone(),
            PlanType::Task | PlanType::SubTask => self.templates.task.clone(),
            PlanType::Project => "# Project: {title}\n\n## Overview\n\n## Objectives\n\n## Timeline\n".to_string(),
        }
    }
    
    /// Add a new tag to a category
    pub fn add_tag(&mut self, category: &str, tag: String) -> Result<()> {
        match category {
            "technical" => self.tags.technical.push(tag),
            "features" => self.tags.features.push(tag),
            "priority" => self.tags.priority.push(tag),
            "workflow" => self.tags.workflow.push(tag),
            _ => return Err(anyhow::anyhow!("Invalid tag category: {}", category)),
        }
        Ok(())
    }
    
    /// Add a new version
    pub fn add_version(&mut self, key: String, config: VersionConfig) {
        self.versions.insert(key, config);
    }
    
    /// Add a new component
    pub fn add_component(&mut self, key: String, config: ComponentConfig) {
        self.components.insert(key, config);
    }
}

#[cfg(test)]
mod tests {
    use super::*;
    use tempfile::TempDir;

    #[test]
    fn create_and_load_plan() -> Result<()> {
        let tmp = TempDir::new().unwrap();
        let store = PlanStore::new(tmp.path());
        store.ensure()?;
        let p = create_plan(&store, "Test Plan", Some("alpha,beta"))?;
        assert!(p.id.starts_with("PLAN-"));
        let all = store.load_all()?;
        assert_eq!(all.len(), 1);
        assert_eq!(all[0].title, "Test Plan");
        Ok(())
    }

    #[test]
    fn status_and_task_updates() -> Result<()> {
        let tmp = TempDir::new().unwrap();
        let store = PlanStore::new(tmp.path());
        let p = create_plan(&store, "Work", None)?;
        update_status(&store, &p.id, PlanStatus::Active)?;
        add_task(&store, &p.id, "Do something")?;
        let loaded = store.load(&p.id)?;
        assert_eq!(loaded.status, PlanStatus::Active);
        assert!(loaded.tasks.iter().any(|t| t.description == "Do something"));
        Ok(())
    }

    #[test]
    fn mark_task_done_and_auto_complete() -> Result<()> {
        let tmp = TempDir::new().unwrap();
        let store = PlanStore::new(tmp.path());
        let p = create_plan(&store, "Auto", None)?;
        // initial first task incomplete
        assert_eq!(store.load(&p.id)?.tasks[0].done, false);
        assert!(mark_task_done(&store, &p.id, 1)?);
        let after = store.load(&p.id)?;
        assert!(after.tasks[0].done);
        // All tasks done -> plan status done
        assert_eq!(after.status, PlanStatus::Done);
        Ok(())
    }
}
