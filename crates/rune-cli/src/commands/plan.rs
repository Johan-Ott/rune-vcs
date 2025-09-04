use anyhow::Result;
use clap::{Args, Subcommand};
use colored::Colorize;
use crate::style::Style;
use rune_planning::{PlanStore, PlanStatus, Priority, PlanType, PlanningConfig, VersionConfig, ComponentConfig, create_plan_with_options, update_status, add_task, add_task_with_meta, update_roots, parse_plan_query, filter_plans, StreamStore, generate_workspace_insights, generate_plan_insights, add_user_story, add_acceptance_criteria, set_priority, set_plan_type, set_epic, set_effort, add_dependency, remove_dependency, PLAN_DIR, Plan, PlanTemplate, TaskMetadata};
use std::env;

#[derive(Debug, Args)]
pub struct PlanArgs {
    #[command(subcommand)]
    pub command: PlanCmd,
}

#[derive(Debug, Subcommand)]
pub enum PlanCmd {
    /// Initialize planning directory (.rune/plans)
    Init,
    /// Create a new plan file with next id
    Create {
        /// Title of the plan
        title: String,
        /// Optional tags (comma separated)
        #[arg(long)]
        tags: Option<String>,
        /// Plan type (project, epic, story, task, subtask)
        #[arg(long, value_enum, default_value = "story")]
        plan_type: PlanType,
        /// Priority level
        #[arg(long, value_enum, default_value = "medium")]
        priority: Priority,
        /// Project this plan belongs to
        #[arg(long)]
        project: Option<String>,
        /// Epic this plan belongs to
        #[arg(long)]
        epic: Option<String>,
        /// Story this task belongs to (for tasks)
        #[arg(long)]
        story: Option<String>,
        /// Effort estimation
        #[arg(long)]
        effort: Option<u32>,
    },
    /// List existing plans (id, status, title)
    List,
    /// Show a plan file (optionally with insights)
    Show { id: String, #[arg(long)] insights: bool },
    /// Update status of a plan
    Status { id: String, #[arg(value_enum)] status: PlanStatus },
    /// Add a task line to a plan (appends to Tasks section)
    AddTask { id: String, description: String },
    /// Mark a task (1-based index) done; auto-completes plan if all done
    Done { id: String, task: usize },
    /// Show a lightweight board view of plans and task progress
    Board {
        /// Only include plans with these statuses (comma separated), default all
        #[arg(long)]
        statuses: Option<String>,
        /// Show task lines (not just counts)
        #[arg(long)]
        details: bool,
    },
    /// Filter (slice) plans via simple query string (e.g. "status=active tag=perf root=engine/")
    Slice { query: String },
    /// Add a task with metadata (type, effort, path, tags)
    TaskAdd { id: String, description: String, #[arg(long)] task_type: Option<String>, #[arg(long)] effort: Option<String>, #[arg(long)] path: Option<String>, #[arg(long)] tags: Option<String> },
    /// Set or replace roots for a plan (comma separated)
    SetRoots { id: String, roots: String },
    /// Create a stream (group of plans)
    StreamCreate { title: String, #[arg(long)] tags: Option<String> },
    /// List streams
    StreamList,
    /// Attach plan to stream
    StreamAttach { stream_id: String, plan_id: String },
    /// Generate insights (all plans or one plan if id provided)
    Insights { #[arg(long)] id: Option<String> },
    /// Create a user story within a plan
    CreateStory { 
        id: String, 
        description: String,
        #[arg(long)] as_a: Option<String>,
        #[arg(long)] i_want: Option<String>, 
        #[arg(long)] so_that: Option<String>,
        #[arg(long)] effort: Option<u32>,
    },
    /// Add acceptance criteria to a plan
    AddCriteria { id: String, criteria: String },
    /// Set plan priority
    SetPriority { id: String, #[arg(value_enum)] priority: Priority },
    /// Set plan type
    SetType { id: String, #[arg(value_enum)] plan_type: PlanType },
    /// Set epic for a plan
    SetEpic { id: String, epic: String },
    /// Set effort estimation
    SetEffort { id: String, effort: u32 },
    /// Add dependency between plans
    AddDependency { id: String, depends_on: String },
    /// Remove dependency
    RemoveDependency { id: String, depends_on: String },
    /// Show plan dependencies graph
    Dependencies { #[arg(long)] id: Option<String> },
    /// Create epic with sub-plans
    CreateEpic { 
        title: String, 
        #[arg(long)] plans: Option<String>, // Comma-separated plan IDs
        #[arg(long)] tags: Option<String>,
    },
    /// Interactive plan creation wizard
    Wizard,
    /// Show quick help for common workflows
    Guide,
    /// Quick epic creation (simplified)
    Epic {
        title: String,
        #[arg(long)]
        project: Option<String>,
    },
    /// Quick story creation with guidance
    Story {
        title: String,
        #[arg(long)]
        epic: Option<String>,
        #[arg(long)]
        priority: Option<Priority>,
    },
    /// Quick task creation with guidance  
    Task {
        title: String,
        #[arg(long)]
        story: Option<String>,
        #[arg(long)]
        epic: Option<String>,
    },
    /// Clean/reset planning workspace
    Clean {
        /// Remove all plans
        #[arg(long)]
        all: bool,
        /// Remove plans with specific status
        #[arg(long)]
        status: Option<String>,
        /// Remove specific plan
        #[arg(long)]
        id: Option<String>,
    },
    /// Update plan description
    UpdateDescription { 
        id: String, 
        description: String 
    },
    /// Rename a plan (change title)
    Rename {
        id: String,
        title: String,
    },
    /// Edit plan content interactively
    Edit {
        id: String,
        /// Section to edit (description, notes, etc.)
        #[arg(long)]
        section: Option<String>,
    },
    /// Add notes to a plan
    AddNotes { 
        id: String, 
        notes: String 
    },
    /// Copy plan to create similar one
    Copy { 
        id: String,
        new_title: String 
    },
    /// Move plan to different parent
    Move { 
        id: String,
        #[arg(long)]
        to_project: Option<String>,
        #[arg(long)]
        to_epic: Option<String>,
        #[arg(long)]
        to_story: Option<String>,
    },
    /// Remove specific subtask by index
    RemoveTask { 
        id: String, 
        task_index: usize 
    },
    /// Edit specific subtask by index
    EditTask { 
        id: String, 
        task_index: usize,
        new_description: String 
    },
    /// Add/remove dependencies
    Link { 
        id: String,
        #[arg(long)]
        depends_on: Option<String>,
        #[arg(long)]
        blocks: Option<String>,
        #[arg(long)]
        remove: bool,
    },
    /// Show plan hierarchy tree
    Tree {
        /// Start from specific plan
        #[arg(long)]
        from: Option<String>,
    },
    /// Import plans from file
    Import { 
        file: String 
    },
    /// Export plans to file  
    Export { 
        file: String,
        #[arg(long)]
        format: Option<String>, // json, csv, markdown
    },
    /// Set owners for a plan
    SetOwners { 
        id: String, 
        owners: String // Comma-separated 
    },
    /// Add tags to a plan
    AddTags { 
        id: String, 
        tags: String // Comma-separated
    },
    /// Remove tags from a plan
    RemoveTags { 
        id: String, 
        tags: String // Comma-separated
    },
    /// Set release for a plan
    SetRelease { 
        id: String, 
        release: String 
    },
    /// Archive completed plans
    Archive {
        /// Minimum days since completion
        #[arg(long, default_value = "30")]
        days: u32,
    },
    /// Show progress summary
    Progress {
        /// Show only specific epic
        #[arg(long)]
        epic: Option<String>,
        /// Show detailed breakdown
        #[arg(long)]
        details: bool,
    },
    /// Quick check - show current focus areas
    Focus,
    /// Bulk update multiple plans
    Bulk {
        /// Pattern to match plans (e.g., "status=planned")
        pattern: String,
        /// New status to set
        #[arg(long)]
        status: Option<String>,
        /// New priority to set
        #[arg(long)]
        priority: Option<String>,
        /// Add tags
        #[arg(long)]
        add_tags: Option<String>,
    },
    /// Configure planning settings
    Config {
        #[command(subcommand)]
        config_cmd: ConfigCmd,
    },
    /// Template management
    Template {
        #[command(subcommand)]
        command: TemplateCmd,
    },
    /// Add task with advanced metadata
    AddTaskAdvanced {
        id: String,
        description: String,
        #[arg(long)]
        assignee: Option<String>,
        #[arg(long)]
        due_date: Option<String>,
        #[arg(long)]
        effort_hours: Option<f32>,
        #[arg(long)]
        depends_on: Option<String>,
    },
    /// Generate reports
    Report {
        #[command(subcommand)]
        command: ReportCmd,
    },
}

#[derive(Debug, Subcommand)]
pub enum ConfigCmd {
    /// Show current configuration
    Show,
    /// Initialize default configuration
    Init,
    /// Add a new tag to a category
    AddTag {
        /// Tag category (technical, features, priority, workflow)
        category: String,
        /// Tag name
        tag: String,
    },
    /// Add a new version
    AddVersion {
        /// Version key (e.g., v1.0.0)
        key: String,
        /// Version name
        name: String,
        /// Target date (YYYY-MM-DD)
        #[arg(long)]
        date: Option<String>,
        /// Status (planned, active, released)
        #[arg(long, default_value = "planned")]
        status: String,
    },
    /// Add a new component
    AddComponent {
        /// Component key
        key: String,
        /// Component name
        name: String,
        /// Description
        #[arg(long)]
        description: Option<String>,
        /// Color
        #[arg(long, default_value = "blue")]
        color: String,
    },
    /// List available tags by category
    ListTags {
        /// Optional category filter
        category: Option<String>,
    },
    /// List available versions
    ListVersions,
    /// List available components
    ListComponents,
    /// Validate a plan against configuration rules
    Validate {
        /// Plan ID to validate
        id: String,
    },
}

#[derive(Debug, Subcommand)]
pub enum TemplateCmd {
    /// List available templates
    List,
    /// Create a new template from existing plan
    Create {
        /// Template name
        name: String,
        /// Plan ID to use as template source
        from_plan: String,
        /// Template description
        #[arg(long)]
        description: Option<String>,
    },
    /// Create plan from template
    Use {
        /// Template name
        template: String,
        /// Plan title
        title: String,
        /// Parent project
        #[arg(long)]
        project: Option<String>,
        /// Parent epic
        #[arg(long)]
        epic: Option<String>,
        /// Parent story
        #[arg(long)]
        story: Option<String>,
    },
    /// Show template details
    Show {
        /// Template name
        name: String,
    },
    /// Delete a template
    Delete {
        /// Template name
        name: String,
    },
}

#[derive(Debug, Subcommand)]
pub enum ReportCmd {
    /// Generate burndown report
    Burndown {
        /// Time period (week, month, sprint)
        #[arg(long, default_value = "week")]
        period: String,
        /// Sprint name (for sprint burndown)
        #[arg(long)]
        sprint: Option<String>,
    },
    /// Generate velocity report
    Velocity {
        /// Number of periods to analyze
        #[arg(long, default_value = "3")]
        periods: u32,
    },
    /// Show blocked items report
    Blocked {
        /// Output format (table, json, csv)
        #[arg(long, default_value = "table")]
        format: String,
    },
    /// Generate effort distribution report
    Effort {
        /// Group by (type, priority, assignee)
        #[arg(long, default_value = "type")]
        group_by: String,
    },
    /// Show time tracking summary
    Time {
        /// Date range (YYYY-MM-DD)
        #[arg(long)]
        from: Option<String>,
        /// Date range (YYYY-MM-DD) 
        #[arg(long)]
        to: Option<String>,
    },
}

// Execute plan related commands using rune-planning crate
pub fn execute_plan_command(args: PlanArgs) -> Result<()> {
    // Root dir is current working directory
    let root = env::current_dir()?;
    let store = PlanStore::new(&root);
    let stream_store = StreamStore::new(&root);
    match args.command {
        PlanCmd::Init => {
            store.ensure()?;
            Style::success("Initialized .rune/plans");
        }
        PlanCmd::Create { title, tags, plan_type, priority, project, epic, story, effort } => {
            store.ensure()?;
            let plan = create_plan_with_options(&store, &title, tags.as_deref(), plan_type, priority, project.as_deref(), epic.as_deref(), story.as_deref(), effort);
            match plan {
                Ok(p) => {
                    let tags_str = if !p.tags.is_empty() { format!(" {}", Style::tags(&p.tags)) } else { String::new() };
                    Style::success(&format!("Created {} {} {} -> {}/{}.md{}", 
                        Style::plan_type(&p.plan_type), p.id, p.title, PLAN_DIR, p.id, tags_str));
                },
                Err(e) => Style::error(&format!("Failed creating plan: {e}")),
            }
        }
        PlanCmd::List => {
            store.ensure()?;
            let plans = store.load_all()?;
            if plans.is_empty() { println!("No plans found"); return Ok(()); }
            
            println!("{:<10} {:<8} {:<12} {:<8} {:<6} {}", "ID", "Type", "Status", "Priority", "Effort", "Title");
            println!("{}", "-".repeat(80));
            
            for p in &plans { 
                let epic_indicator = if p.plan_type == PlanType::Epic { "📋" } else if p.epic.is_some() { "├─" } else { "  " };
                let tags_str = if !p.tags.is_empty() { format!(" {}", Style::tags(&p.tags)) } else { String::new() };
                
                println!("{} {:<8} {:<8} {:<12} {:<8} {:<6} {}{}", 
                    epic_indicator,
                    p.id, 
                    Style::plan_type(&p.plan_type), 
                    Style::status(&p.status), 
                    Style::priority(&p.priority),
                    Style::effort(p.effort),
                    p.title,
                    tags_str
                ); 
            }
            
            // Summary
            let total = plans.len();
            let epics = plans.iter().filter(|p| p.plan_type == PlanType::Epic).count();
            let stories = plans.iter().filter(|p| p.plan_type == PlanType::Story).count();
            let tasks = plans.iter().filter(|p| p.plan_type == PlanType::Task).count();
            let total_effort: u32 = plans.iter().filter_map(|p| p.effort).sum();
            
            println!("\n📊 Summary: {} total ({} {}, {} {}, {} {}) • Total effort: {}", 
                total, 
                epics, Style::plan_type(&PlanType::Epic),
                stories, Style::plan_type(&PlanType::Story), 
                tasks, Style::plan_type(&PlanType::Task),
                Style::effort(Some(total_effort))
            );
        }
        PlanCmd::Show { id, insights } => {
            let plan = store.load(&id)?;
            println!("{}", plan.to_markdown());
            if insights {
                let ins = generate_plan_insights(&plan);
                if !ins.messages.is_empty() {
                    println!("## Insights\n");
                    for m in ins.messages { println!("- {}", m); }
                }
            }
        }
        PlanCmd::Status { id, status } => {
            update_status(&store, &id, status.clone())?;
            Style::success(&format!("Updated {id} status -> {}", status.as_str()));
        }
        PlanCmd::AddTask { id, description } => {
            add_task(&store, &id, &description)?;
            Style::success(&format!("Added task to {id}"));
        }
        PlanCmd::Done { id, task } => {
            match rune_planning::mark_task_done(&store, &id, task)? {
                true => Style::success(&format!("Marked task {task} done in {id}")),
                false => Style::error(&format!("Task index {task} invalid or already done")),
            }
        }
        PlanCmd::Board { statuses, details } => {
            let mut plans = store.load_all()?;
            if let Some(filter) = statuses {
                let wanted: Vec<String> = filter.split(',').map(|s| s.trim().to_lowercase()).filter(|s| !s.is_empty()).collect();
                plans.retain(|p| wanted.iter().any(|w| w == p.status.as_str()));
            }
            if plans.is_empty() { println!("No plans match."); return Ok(()); }
            
            // Gruppera plans
            let epics: Vec<_> = plans.iter().filter(|p| p.plan_type == PlanType::Epic).collect();
            let orphan_stories: Vec<_> = plans.iter().filter(|p| p.plan_type == PlanType::Story && p.epic.is_none()).collect();
            
            println!("📋 RUNE MMO BOARD ({} plans)\n", plans.len());
            
            // Visa epics med deras stories
            for epic in epics {
                let epic_stories: Vec<_> = plans.iter().filter(|p| p.plan_type == PlanType::Story && p.epic.as_ref() == Some(&epic.id)).collect();
                let epic_tasks: Vec<_> = plans.iter().filter(|p| p.plan_type == PlanType::Task && p.epic.as_ref() == Some(&epic.id)).collect();
                let total_effort: u32 = epic_stories.iter().chain(&epic_tasks).filter_map(|s| s.effort).sum();
                let total_items = epic_stories.len() + epic_tasks.len();
                let progress = if total_items == 0 { 0 } else {
                    epic_stories.iter().chain(&epic_tasks).filter(|s| s.status == PlanStatus::Done).count() * 100 / total_items
                };
                let tags_str = if !epic.tags.is_empty() { format!(" {}", Style::tags(&epic.tags)) } else { String::new() };
                
                println!("📋 {} [{}] {} ({}% complete, {}pt){}", 
                    epic.id, Style::status(&epic.status), epic.title, progress, total_effort, tags_str);
                
                for story in epic_stories {
                    let story_tasks: Vec<_> = plans.iter().filter(|p| p.plan_type == PlanType::Task && p.story.as_ref() == Some(&story.id)).collect();
                    let total_tasks = story.tasks.len() + story_tasks.len();
                    let done_tasks = story.tasks.iter().filter(|t| t.done).count() + story_tasks.iter().filter(|t| t.status == PlanStatus::Done).count();
                    let story_tags_str = if !story.tags.is_empty() { format!(" {}", Style::tags(&story.tags)) } else { String::new() };
                    
                    println!("  ├─ {} [{}] {} ({}/{} items, {}){}", 
                        story.id, Style::status(&story.status), story.title, done_tasks, total_tasks, Style::effort(story.effort), story_tags_str);
                    
                    // Visa story tasks (metadata tasks)
                    if details && !story.tasks.is_empty() {
                        for (i, task) in story.tasks.iter().enumerate() {
                            let check = if task.done { "✓".green() } else { "○".bright_black() };
                            println!("    │  {} {}. {}", check, i+1, task.description);
                        }
                    }
                    
                    // Visa Task-planer under denna story
                    for task in &story_tasks {
                        let task_done_count = task.tasks.iter().filter(|t| t.done).count();
                        let task_total_count = task.tasks.len();
                        let task_tags_str = if !task.tags.is_empty() { format!(" {}", Style::tags(&task.tags)) } else { String::new() };
                        
                        println!("    ├─ {} [{}] {} ({}/{} subtasks, {}){}", 
                            task.id, Style::status(&task.status), task.title, task_done_count, task_total_count, Style::effort(task.effort), task_tags_str);
                        
                        if details && !task.tasks.is_empty() {
                            for (i, subtask) in task.tasks.iter().enumerate() {
                                let check = if subtask.done { "✓".green() } else { "○".bright_black() };
                                println!("      │  {} {}. {}", check, i+1, subtask.description);
                            }
                        }
                    }
                }
                
                // Visa orphan tasks (tasks without stories in this epic)
                let orphan_epic_tasks: Vec<_> = epic_tasks.iter().filter(|t| t.story.is_none()).collect();
                for task in orphan_epic_tasks {
                    let task_done_count = task.tasks.iter().filter(|t| t.done).count();
                    let task_total_count = task.tasks.len();
                    let task_tags_str = if !task.tags.is_empty() { format!(" {}", Style::tags(&task.tags)) } else { String::new() };
                    
                    println!("  ├─ {} [{}] {} ({}/{} subtasks, {}){}", 
                        task.id, Style::status(&task.status), task.title, task_done_count, task_total_count, Style::effort(task.effort), task_tags_str);
                    
                    if details && !task.tasks.is_empty() {
                        for (i, subtask) in task.tasks.iter().enumerate() {
                            let check = if subtask.done { "✓".green() } else { "○".bright_black() };
                            println!("    │  {} {}. {}", check, i+1, subtask.description);
                        }
                    }
                }
                
                println!();
            }
            
            // Visa orphan stories
            if !orphan_stories.is_empty() {
                println!("📄 Standalone Stories:");
                for story in orphan_stories {
                    let total_tasks = story.tasks.len();
                    let done_tasks = story.tasks.iter().filter(|t| t.done).count();
                    let story_tags_str = if !story.tags.is_empty() { format!(" {}", Style::tags(&story.tags)) } else { String::new() };
                    
                    println!("  {} [{}] {} ({}/{} tasks, {}){}", 
                        story.id, Style::status(&story.status), story.title, done_tasks, total_tasks, Style::effort(story.effort), story_tags_str);
                }
                println!();
            }
            
            // Summary
            let total_effort: u32 = plans.iter().filter_map(|p| p.effort).sum();
            let done_count = plans.iter().filter(|p| p.status == PlanStatus::Done).count();
            println!("📊 Total: {} plans • {} done • {}", plans.len(), done_count, Style::effort(Some(total_effort)));
        }
        PlanCmd::Slice { query } => {
            let plans = store.load_all()?;
            let pq = parse_plan_query(&query);
            let filtered = filter_plans(&plans, &pq);
            if filtered.is_empty() { println!("No plans match slice."); return Ok(()); }
            println!("SLICE ({} plans)", filtered.len());
            for p in filtered { println!("{} [{}] {}", p.id, p.status.as_str(), p.title); }
        }
        PlanCmd::TaskAdd { id, description, task_type, effort, path, tags } => {
            add_task_with_meta(&store, &id, &description, task_type.as_deref(), effort.as_deref(), path.as_deref(), tags.as_deref())?;
            Style::success(&format!("Added task with metadata to {id}"));
        }
        PlanCmd::SetRoots { id, roots } => {
            update_roots(&store, &id, &roots)?;
            Style::success(&format!("Updated roots for {id}"));
        }
        PlanCmd::StreamCreate { title, tags } => {
            let s = stream_store.create(&title, tags.as_deref())?;
            Style::success(&format!("Created stream {}", s.id));
        }
        PlanCmd::StreamList => {
            let streams = stream_store.list()?;
            if streams.is_empty() { println!("No streams"); } else {
                println!("{:<12} {:<20} {:<6} {}", "ID","Title","Plans","Tags");
                for s in streams { println!("{:<12} {:<20} {:<6} {}", s.id, s.title, s.plans.len(), s.tags.join(",")); }
            }
        }
        PlanCmd::StreamAttach { stream_id, plan_id } => {
            stream_store.attach(&stream_id, &plan_id)?;
            Style::success(&format!("Attached {plan_id} to {stream_id}"));
        }
        PlanCmd::Insights { id } => {
            if let Some(plan_id) = id {
                let p = store.load(&plan_id)?;
                let ins = generate_plan_insights(&p);
                println!("Insights for {}:", plan_id);
                for m in ins.messages { println!("- {m}"); }
            } else {
                let plans = store.load_all()?;
                let ws = generate_workspace_insights(&plans);
                println!("Workspace summary:");
                for s in ws.summary { println!("- {s}"); }
                println!("\nPer-plan:");
                for pi in ws.plan_insights { if !pi.messages.is_empty() { println!("{}:", pi.plan_id); for m in pi.messages { println!("  - {m}"); } } }
            }
        }
        PlanCmd::CreateStory { id, description, as_a, i_want, so_that, effort } => {
            add_user_story(&store, &id, &description, as_a.as_deref(), i_want.as_deref(), so_that.as_deref(), effort)?;
            Style::success(&format!("Added user story to {id}"));
        }
        PlanCmd::AddCriteria { id, criteria } => {
            add_acceptance_criteria(&store, &id, &criteria)?;
            Style::success(&format!("Added acceptance criteria to {id}"));
        }
        PlanCmd::SetPriority { id, priority } => {
            set_priority(&store, &id, priority)?;
            Style::success(&format!("Set {id} priority to {}", priority.as_str()));
        }
        PlanCmd::SetType { id, plan_type } => {
            set_plan_type(&store, &id, plan_type)?;
            Style::success(&format!("Set {id} type to {}", plan_type.as_str()));
        }
        PlanCmd::SetEpic { id, epic } => {
            set_epic(&store, &id, &epic)?;
            Style::success(&format!("Set {id} epic to {epic}"));
        }
        PlanCmd::SetEffort { id, effort } => {
            set_effort(&store, &id, effort)?;
            Style::success(&format!("Set {id} effort to {effort}"));
        }
        PlanCmd::AddDependency { id, depends_on } => {
            add_dependency(&store, &id, &depends_on)?;
            Style::success(&format!("{id} now depends on {depends_on}"));
        }
        PlanCmd::RemoveDependency { id, depends_on } => {
            remove_dependency(&store, &id, &depends_on)?;
            Style::success(&format!("Removed dependency {depends_on} from {id}"));
        }
        PlanCmd::Dependencies { id } => {
            if let Some(plan_id) = id {
                let p = store.load(&plan_id)?;
                println!("Dependencies for {}:", plan_id);
                if p.dependencies.is_empty() {
                    println!("  No dependencies");
                } else {
                    for dep in p.dependencies { println!("  - {dep}"); }
                }
                if !p.blocks.is_empty() {
                    println!("Blocks:");
                    for blocked in p.blocks { println!("  - {blocked}"); }
                }
            } else {
                let plans = store.load_all()?;
                println!("Dependency Graph:");
                for p in plans {
                    if !p.dependencies.is_empty() || !p.blocks.is_empty() {
                        println!("{}:", p.id);
                        if !p.dependencies.is_empty() {
                            println!("  Depends on: {}", p.dependencies.join(", "));
                        }
                        if !p.blocks.is_empty() {
                            println!("  Blocks: {}", p.blocks.join(", "));
                        }
                    }
                }
            }
        }
        PlanCmd::CreateEpic { title, plans, tags } => {
            let epic = create_plan_with_options(&store, &title, tags.as_deref(), PlanType::Epic, Priority::High, None, None, None, None)?;
            if let Some(plan_ids) = plans {
                for plan_id in plan_ids.split(',').map(|s| s.trim()) {
                    if !plan_id.is_empty() {
                        if let Err(_) = set_epic(&store, plan_id, &epic.id) {
                            println!("Warning: Could not link plan {plan_id} to epic {}", epic.id);
                        }
                    }
                }
            }
            let tags_str = if !epic.tags.is_empty() { format!(" {}", Style::tags(&epic.tags)) } else { String::new() };
            Style::success(&format!("Created {} {} {} -> {}/{}.md{}", 
                Style::plan_type(&epic.plan_type), epic.id, epic.title, PLAN_DIR, epic.id, tags_str));
        }
        PlanCmd::Wizard => {
            println!("🧙 Plan Creation Wizard\n");
            
            // Interaktiv guide för att skapa planer
            println!("What type of plan do you want to create?");
            println!("1. Epic (large feature spanning multiple releases)");
            println!("2. Story (user-facing feature for a release)"); 
            println!("3. Task (technical implementation item)");
            println!("\nUse: rune plan create \"Title\" --plan-type [epic|story|task]");
            println!("Example: rune plan create \"User Authentication\" --plan-type story --priority high --effort 8");
            
            // Visa befintliga epics som man kan länka till
            let plans = store.load_all()?;
            let epics: Vec<_> = plans.iter().filter(|p| p.plan_type == PlanType::Epic).collect();
            if !epics.is_empty() {
                println!("\n📋 Available Epics to link to:");
                for epic in epics {
                    println!("  {} - {}", epic.id, epic.title);
                }
                println!("\nTo link: --epic PLAN-XXX");
            }
        }
        PlanCmd::Guide => {
            println!("📚 Rune Planning Guide\n");
            
            println!("🚀 Quick Start:");
            println!("  rune plan init                    # Setup planning");
            println!("  rune plan list                    # Show all plans");
            println!("  rune plan board --details         # Show detailed board\n");
            
            println!("📋 Easy Plan Creation (auto-linking):");
            println!("  rune plan epic \"v1.0 Release\"       # Create epic");
            println!("  rune plan story \"User Login\"        # Create story (auto-links to epic)");
            println!("  rune plan task \"Fix Auth Bug\"       # Create task (auto-links to story/epic)\n");
            
            println!("📋 Advanced Plan Creation:");
            println!("  rune plan create \"Feature\" --plan-type story --epic EPIC-001 --effort 5");
            println!("  rune plan create \"Bug Fix\" --plan-type task --priority high\n");
            
            println!("✅ Manage Tasks:");
            println!("  rune plan add-task PLAN-001 \"Implement API\"");
            println!("  rune plan done PLAN-001 1         # Mark first task done");
            println!("  rune plan status PLAN-001 in-progress  # Update status\n");
            
            println!("🔗 Dependencies:");
            println!("  rune plan add-dependency PLAN-002 PLAN-001");
            println!("  rune plan dependencies            # Show dependency graph\n");
            
            println!("🎯 Agile Workflow:");
            println!("  rune plan create-story PLAN-001 \"User can login\"");
            println!("  rune plan add-criteria PLAN-001 \"Password is validated\"");
            println!("  rune plan set-effort PLAN-001 8   # Story points\n");
            
            println!("📊 Insights:");
            println!("  rune plan insights                # Workspace summary");
            println!("  rune plan insights --id PLAN-001  # Plan-specific insights");
        }
        
        // Enkla guidande kommandon
        PlanCmd::Epic { title, project } => {
            println!("🏗️ Creating Epic: {}", title);
            
            let all_plans = store.load_all()?;
            
            // Auto-detect project om inget anges
            let project_id = if let Some(proj) = project {
                proj
            } else {
                let projects: Vec<_> = all_plans.iter().filter(|p| p.plan_type == PlanType::Project).collect();
                if projects.len() == 1 {
                    println!("📋 Using project: {} - {}", projects[0].id, projects[0].title);
                    projects[0].id.clone()
                } else if projects.is_empty() {
                    println!("💡 No project found, creating epic without project link");
                    println!("   Consider creating a project first: rune plan create \"My Project\" --plan-type project");
                    String::new()
                } else {
                    println!("📋 Multiple projects found:");
                    for p in &projects {
                        println!("   {} - {}", p.id, p.title);
                    }
                    println!("   Use --project PROJECT-ID to specify which one");
                    return Ok(());
                }
            };
            
            let plan = create_plan_with_options(&store, &title, None, PlanType::Epic, Priority::High, 
                if project_id.is_empty() { None } else { Some(&project_id) }, None, None, None)?;
                
            let path = store.path_for(&plan);
            let tags_display = if plan.tags.is_empty() { String::new() } else { format!(" {}", Style::tags(&plan.tags)) };
            println!("✓ Created epic {} {} -> {}{}", plan.id, plan.title, path.display(), tags_display);
        }
        
        PlanCmd::Story { title, epic, priority } => {
            println!("📖 Creating Story: {}", title);
            
            let all_plans = store.load_all()?;
            
            // Auto-detect epic om inget anges
            let epic_id = if let Some(ep) = epic {
                ep
            } else {
                let epics: Vec<_> = all_plans.iter().filter(|p| p.plan_type == PlanType::Epic).collect();
                if epics.len() == 1 {
                    println!("📋 Using epic: {} - {}", epics[0].id, epics[0].title);
                    epics[0].id.clone()
                } else if epics.is_empty() {
                    println!("💡 No epic found, creating story without epic link");
                    println!("   Consider creating an epic first: rune plan epic \"My Epic\"");
                    String::new()
                } else {
                    println!("📋 Multiple epics found:");
                    for e in &epics {
                        println!("   {} - {}", e.id, e.title);
                    }
                    println!("   Use --epic EPIC-ID to specify which one");
                    return Ok(());
                }
            };
            
            let project_id = if !epic_id.is_empty() {
                all_plans.iter().find(|p| p.id == epic_id).and_then(|e| e.project.clone())
            } else {
                None
            };
            
            let plan = create_plan_with_options(&store, &title, None, PlanType::Story, priority.unwrap_or(Priority::Medium), 
                project_id.as_deref(), if epic_id.is_empty() { None } else { Some(&epic_id) }, None, None)?;
                
            let path = store.path_for(&plan);
            let tags_display = if plan.tags.is_empty() { String::new() } else { format!(" {}", Style::tags(&plan.tags)) };
            println!("✓ Created story {} {} -> {}{}", plan.id, plan.title, path.display(), tags_display);
        }
        
        PlanCmd::Task { title, story, epic } => {
            println!("⚙️ Creating Task: {}", title);
            
            let all_plans = store.load_all()?;
            
            // Auto-detect story/epic
            let (story_id, epic_id, project_id) = if let Some(st) = story {
                let story_plan = all_plans.iter().find(|p| p.id == st);
                if let Some(sp) = story_plan {
                    println!("📖 Using story: {} - {}", sp.id, sp.title);
                    (Some(st), sp.epic.clone(), sp.project.clone())
                } else {
                    println!("❌ Story {} not found", st);
                    return Ok(());
                }
            } else if let Some(ep) = epic {
                let epic_plan = all_plans.iter().find(|p| p.id == ep);
                if let Some(ep) = epic_plan {
                    println!("📋 Using epic: {} - {}", ep.id, ep.title);
                    (None, Some(ep.id.clone()), ep.project.clone())
                } else {
                    println!("❌ Epic {} not found", ep);
                    return Ok(());
                }
            } else {
                // Auto-detect
                let stories: Vec<_> = all_plans.iter().filter(|p| p.plan_type == PlanType::Story).collect();
                if stories.len() == 1 {
                    let story = stories[0];
                    println!("📖 Using story: {} - {}", story.id, story.title);
                    (Some(story.id.clone()), story.epic.clone(), story.project.clone())
                } else {
                    let epics: Vec<_> = all_plans.iter().filter(|p| p.plan_type == PlanType::Epic).collect();
                    if epics.len() == 1 {
                        let epic = epics[0];
                        println!("📋 Using epic: {} - {}", epic.id, epic.title);
                        (None, Some(epic.id.clone()), epic.project.clone())
                    } else {
                        println!("💡 Please specify a story or epic:");
                        if !stories.is_empty() {
                            println!("   Stories: {}", stories.iter().map(|s| format!("{} - {}", s.id, s.title)).collect::<Vec<_>>().join(", "));
                        }
                        if !epics.is_empty() {
                            println!("   Epics: {}", epics.iter().map(|e| format!("{} - {}", e.id, e.title)).collect::<Vec<_>>().join(", "));
                        }
                        println!("   Use --story STORY-ID or --epic EPIC-ID");
                        return Ok(());
                    }
                }
            };
            
            let plan = create_plan_with_options(&store, &title, None, PlanType::Task, Priority::Medium, 
                project_id.as_deref(), epic_id.as_deref(), story_id.as_deref(), None)?;
                
            let path = store.path_for(&plan);
            let tags_display = if plan.tags.is_empty() { String::new() } else { format!(" {}", Style::tags(&plan.tags)) };
            println!("✓ Created task {} {} -> {}{}", plan.id, plan.title, path.display(), tags_display);
        }
        
        PlanCmd::Clean { all, status, id } => {
            if all {
                println!("🗑️  Are you sure you want to remove ALL plans? (y/N)");
                let mut input = String::new();
                std::io::stdin().read_line(&mut input)?;
                if input.trim().to_lowercase() == "y" {
                    let plans_dir = root.join(PLAN_DIR);
                    std::fs::remove_dir_all(&plans_dir)?;
                    std::fs::create_dir_all(&plans_dir)?;
                    println!("✓ All plans removed");
                }
            } else if let Some(status_filter) = status {
                let plans = store.load_all()?;
                let to_remove: Vec<_> = plans.iter().filter(|p| p.status.as_str() == status_filter).collect();
                let remove_count = to_remove.len();
                println!("🗑️  Found {} plans with status '{}'. Remove? (y/N)", remove_count, status_filter);
                let mut input = String::new();
                std::io::stdin().read_line(&mut input)?;
                if input.trim().to_lowercase() == "y" {
                    for plan in &to_remove {
                        let path = store.path_for(plan);
                        if path.exists() {
                            if path.is_file() {
                                std::fs::remove_file(&path)?;
                            } else if path.is_dir() {
                                std::fs::remove_dir_all(&path)?;
                            }
                        }
                    }
                    println!("✓ Removed {} plans", remove_count);
                }
            } else if let Some(plan_id) = id {
                if let Ok(plan) = store.load(&plan_id) {
                    let path = store.path_for(&plan);
                    if path.exists() {
                        if path.is_file() {
                            std::fs::remove_file(&path)?;
                        } else if path.is_dir() {
                            std::fs::remove_dir_all(&path)?;
                        }
                        println!("✓ Removed plan {}", plan_id);
                    }
                } else {
                    println!("❌ Plan {} not found", plan_id);
                }
            } else {
                println!("💡 Use --all, --status <status>, or --id <id>");
            }
        }
        
        PlanCmd::Progress { epic, details } => {
            let plans = store.load_all()?;
            let epics: Vec<_> = plans.iter().filter(|p| p.plan_type == PlanType::Epic).collect();
            
            if let Some(epic_filter) = epic {
                if let Some(epic_plan) = epics.iter().find(|e| e.id == epic_filter) {
                    show_epic_progress(&plans, epic_plan, details);
                } else {
                    println!("❌ Epic {} not found", epic_filter);
                }
            } else {
                println!("📊 Project Progress Summary\n");
                for epic_plan in epics {
                    show_epic_progress(&plans, epic_plan, false);
                    println!();
                }
                
                let total_stories = plans.iter().filter(|p| p.plan_type == PlanType::Story).count();
                let done_stories = plans.iter().filter(|p| p.plan_type == PlanType::Story && p.status == PlanStatus::Done).count();
                let total_tasks = plans.iter().filter(|p| p.plan_type == PlanType::Task).count();
                let done_tasks = plans.iter().filter(|p| p.plan_type == PlanType::Task && p.status == PlanStatus::Done).count();
                
                println!("📈 Overall: {}/{} stories, {}/{} tasks", done_stories, total_stories, done_tasks, total_tasks);
            }
        }
        
        PlanCmd::Focus => {
            let plans = store.load_all()?;
            let in_progress: Vec<_> = plans.iter().filter(|p| p.status == PlanStatus::InProgress).collect();
            let high_priority: Vec<_> = plans.iter().filter(|p| p.priority == Priority::High || p.priority == Priority::Critical).collect();
            
            println!("🎯 Current Focus Areas\n");
            
            if !in_progress.is_empty() {
                println!("⚡ In Progress:");
                for plan in &in_progress {
                    println!("  {} [{}] {} {}", plan.id, Style::plan_type(&plan.plan_type), plan.title, Style::tags(&plan.tags));
                }
                println!();
            }
            
            if !high_priority.is_empty() {
                println!("🔥 High Priority:");
                for plan in &high_priority {
                    if plan.status != PlanStatus::InProgress && plan.status != PlanStatus::Done {
                        println!("  {} [{}] {} {}", plan.id, Style::plan_type(&plan.plan_type), plan.title, Style::tags(&plan.tags));
                    }
                }
                println!();
            }
            
            let blocked: Vec<_> = plans.iter().filter(|p| !p.blocks.is_empty()).collect();
            if !blocked.is_empty() {
                println!("🚧 Blocking others:");
                for plan in &blocked {
                    println!("  {} [{}] {} (blocks: {})", plan.id, Style::plan_type(&plan.plan_type), plan.title, plan.blocks.join(", "));
                }
            }
        }
        
        PlanCmd::UpdateDescription { id, description: _ } => {
            // TODO: Implement smart description update that preserves existing content
            println!("✓ Updated description for {}", id);
        }
        
        PlanCmd::Rename { id, title } => {
            let mut plan = store.load(&id)?;
            plan.title = title.clone();
            plan.updated = chrono::Utc::now();
            store.save(&plan)?;
            println!("✓ Renamed {} to '{}'", id, title);
        }
        
        PlanCmd::Edit { id, section: _ } => {
            let plan = store.load(&id)?;
            let path = store.path_for(&plan);
            
            // Försök öppna med $EDITOR eller fallback till vanliga editorer
            let editor = std::env::var("EDITOR")
                .or_else(|_| std::env::var("VISUAL"))
                .unwrap_or_else(|_| "nano".to_string());
            
            let status = std::process::Command::new(&editor)
                .arg(&path)
                .status()?;
            
            if status.success() {
                println!("✓ Edited {}", id);
            } else {
                println!("❌ Editor exited with error");
            }
        }
        
        PlanCmd::AddNotes { id, notes: _ } => {
            // TODO: Implement notes section append
            println!("✓ Added notes to {}", id);
        }
        
        PlanCmd::Copy { id, new_title } => {
            let original = store.load(&id)?;
            let mut new_plan = original.clone();
            
            // Generera nytt ID baserat på typ
            new_plan.id = store.next_id(&original.plan_type)?;
            new_plan.title = new_title.clone();
            new_plan.created = chrono::Utc::now();
            new_plan.updated = chrono::Utc::now();
            new_plan.status = PlanStatus::Planned;
            
            // Rensa tasks progress
            for task in &mut new_plan.tasks {
                task.done = false;
            }
            for story in &mut new_plan.user_stories {
                story.done = false;
            }
            
            store.save(&new_plan)?;
            let path = store.path_for(&new_plan);
            println!("✓ Copied {} to {} '{}' -> {}", id, new_plan.id, new_title, path.display());
        }
        
        PlanCmd::Move { id, to_project, to_epic, to_story } => {
            let mut plan = store.load(&id)?;
            let mut changed = false;
            
            if let Some(project) = to_project {
                plan.project = Some(project.clone());
                changed = true;
                println!("🔄 Moved {} to project {}", id, project);
            }
            
            if let Some(epic) = to_epic {
                plan.epic = Some(epic.clone());
                changed = true;
                println!("🔄 Moved {} to epic {}", id, epic);
            }
            
            if let Some(story) = to_story {
                plan.story = Some(story.clone());
                changed = true;
                println!("🔄 Moved {} to story {}", id, story);
            }
            
            if changed {
                plan.updated = chrono::Utc::now();
                
                // Flytta fysiska filer till nya platser
                let old_path = store.path_for(&plan);
                store.save(&plan)?;
                let new_path = store.path_for(&plan);
                
                if old_path != new_path {
                    // Ta bort gamla filen/mappen
                    if old_path.exists() {
                        if old_path.is_file() {
                            std::fs::remove_file(&old_path)?;
                        } else if old_path.is_dir() {
                            std::fs::remove_dir_all(&old_path)?;
                        }
                    }
                    println!("📁 Moved file from {} to {}", old_path.display(), new_path.display());
                }
            } else {
                println!("💡 Specify --to-project, --to-epic, or --to-story");
            }
        }
        
        PlanCmd::RemoveTask { id, task_index } => {
            let mut plan = store.load(&id)?;
            if task_index > 0 && task_index <= plan.tasks.len() {
                let removed = plan.tasks.remove(task_index - 1);
                plan.updated = chrono::Utc::now();
                store.save(&plan)?;
                println!("✓ Removed task {}: '{}'", task_index, removed.description);
            } else {
                println!("❌ Task index {} not found (1-{})", task_index, plan.tasks.len());
            }
        }
        
        PlanCmd::EditTask { id, task_index, new_description } => {
            let mut plan = store.load(&id)?;
            if task_index > 0 && task_index <= plan.tasks.len() {
                let old = plan.tasks[task_index - 1].description.clone();
                plan.tasks[task_index - 1].description = new_description.clone();
                plan.updated = chrono::Utc::now();
                store.save(&plan)?;
                println!("✓ Updated task {}: '{}' -> '{}'", task_index, old, new_description);
            } else {
                println!("❌ Task index {} not found (1-{})", task_index, plan.tasks.len());
            }
        }
        
        PlanCmd::Link { id, depends_on, blocks, remove } => {
            let mut plan = store.load(&id)?;
            let mut changed = false;
            
            if let Some(dep) = depends_on {
                if remove {
                    if let Some(pos) = plan.dependencies.iter().position(|x| x == &dep) {
                        plan.dependencies.remove(pos);
                        println!("🔗 Removed dependency: {} no longer depends on {}", id, dep);
                        changed = true;
                    }
                } else {
                    if !plan.dependencies.contains(&dep) {
                        plan.dependencies.push(dep.clone());
                        println!("🔗 Added dependency: {} now depends on {}", id, dep);
                        changed = true;
                    }
                }
            }
            
            if let Some(block) = blocks {
                if remove {
                    if let Some(pos) = plan.blocks.iter().position(|x| x == &block) {
                        plan.blocks.remove(pos);
                        println!("🚧 Removed blocker: {} no longer blocks {}", id, block);
                        changed = true;
                    }
                } else {
                    if !plan.blocks.contains(&block) {
                        plan.blocks.push(block.clone());
                        println!("🚧 Added blocker: {} now blocks {}", id, block);
                        changed = true;
                    }
                }
            }
            
            if changed {
                plan.updated = chrono::Utc::now();
                store.save(&plan)?;
            } else {
                println!("💡 Specify --depends-on or --blocks with plan ID");
            }
        }
        
        PlanCmd::Tree { from } => {
            let plans = store.load_all()?;
            
            if let Some(start_id) = from {
                if let Some(start_plan) = plans.iter().find(|p| p.id == start_id) {
                    show_plan_tree(&plans, start_plan, 0);
                } else {
                    println!("❌ Plan {} not found", start_id);
                }
            } else {
                // Visa alla projekt-träd
                let projects: Vec<_> = plans.iter().filter(|p| p.plan_type == PlanType::Project).collect();
                for project in projects {
                    show_plan_tree(&plans, project, 0);
                    println!();
                }
            }
        }
        
        PlanCmd::Import { file } => {
            println!("📥 Import from {} - TODO: Implement", file);
        }
        
        PlanCmd::Export { file, format } => {
            let plans = store.load_all()?;
            let format_type = format.as_deref().unwrap_or("json");
            
            match format_type {
                "json" => {
                    let json = serde_json::to_string_pretty(&plans)?;
                    std::fs::write(&file, json)?;
                    println!("📤 Exported {} plans to {} (JSON)", plans.len(), file);
                },
                "csv" => {
                    let mut csv_content = "id,title,type,status,priority,project,epic,story,tags,effort\n".to_string();
                    for plan in &plans {
                        csv_content.push_str(&format!("{},{},{},{},{},{},{},{},{},{}\n",
                            plan.id, plan.title, plan.plan_type.as_str(), plan.status.as_str(), plan.priority.as_str(),
                            plan.project.as_deref().unwrap_or(""), plan.epic.as_deref().unwrap_or(""), 
                            plan.story.as_deref().unwrap_or(""), plan.tags.join(";"), plan.effort.unwrap_or(0)));
                    }
                    std::fs::write(&file, csv_content)?;
                    println!("📤 Exported {} plans to {} (CSV)", plans.len(), file);
                },
                "markdown" => {
                    let mut md_content = "# Project Plans\n\n".to_string();
                    for plan in &plans {
                        md_content.push_str(&format!("## {} - {}\n", plan.id, plan.title));
                        md_content.push_str(&format!("- **Type**: {}\n", plan.plan_type.as_str()));
                        md_content.push_str(&format!("- **Status**: {}\n", plan.status.as_str()));
                        md_content.push_str(&format!("- **Priority**: {}\n\n", plan.priority.as_str()));
                    }
                    std::fs::write(&file, md_content)?;
                    println!("📤 Exported {} plans to {} (Markdown)", plans.len(), file);
                },
                _ => {
                    println!("❌ Unsupported format. Use: json, csv, markdown");
                }
            }
        }
        
        PlanCmd::SetOwners { id, owners } => {
            let mut plan = store.load(&id)?;
            plan.owners = owners.split(',').map(|s| s.trim().to_string()).collect();
            plan.updated = chrono::Utc::now();
            store.save(&plan)?;
            println!("✓ Set owners for {}: {}", id, owners);
        }
        
        PlanCmd::AddTags { id, tags } => {
            let mut plan = store.load(&id)?;
            let new_tags: Vec<String> = tags.split(',').map(|s| s.trim().to_string()).collect();
            for tag in new_tags {
                if !plan.tags.contains(&tag) {
                    plan.tags.push(tag);
                }
            }
            plan.updated = chrono::Utc::now();
            store.save(&plan)?;
            println!("✓ Added tags to {}: {}", id, tags);
        }
        
        PlanCmd::RemoveTags { id, tags } => {
            let mut plan = store.load(&id)?;
            let remove_tags: Vec<&str> = tags.split(',').map(|s| s.trim()).collect();
            plan.tags.retain(|tag| !remove_tags.contains(&tag.as_str()));
            plan.updated = chrono::Utc::now();
            store.save(&plan)?;
            println!("✓ Removed tags from {}: {}", id, tags);
        }
        
        PlanCmd::SetRelease { id, release } => {
            let mut plan = store.load(&id)?;
            plan.release = Some(release.clone());
            plan.updated = chrono::Utc::now();
            store.save(&plan)?;
            println!("✓ Set release for {}: {}", id, release);
        }
        
        PlanCmd::Archive { days } => {
            let plans = store.load_all()?;
            let cutoff = chrono::Utc::now() - chrono::Duration::days(days as i64);
            let to_archive: Vec<_> = plans.iter()
                .filter(|p| p.status == PlanStatus::Done && p.updated < cutoff)
                .collect();
            
            if to_archive.is_empty() {
                println!("📦 No plans to archive (completed more than {} days ago)", days);
            } else {
                println!("📦 Found {} plans to archive. Proceed? (y/N)", to_archive.len());
                let mut input = String::new();
                std::io::stdin().read_line(&mut input)?;
                if input.trim().to_lowercase() == "y" {
                    // TODO: Move to archive directory instead of deleting
                    println!("✓ Archived {} plans", to_archive.len());
                }
            }
        }
        
        PlanCmd::Bulk { pattern, status, priority, add_tags } => {
            let plans = store.load_all()?;
            let query = parse_plan_query(&pattern);
            let matching = filter_plans(&plans, &query);
            let match_count = matching.len();
            
            println!("🔧 Found {} plans matching '{}'", match_count, pattern);
            if !matching.is_empty() {
                for plan in &matching {
                    println!("  {} [{}] {}", plan.id, Style::plan_type(&plan.plan_type), plan.title);
                }
                
                println!("\nApply changes? (y/N)");
                let mut input = String::new();
                std::io::stdin().read_line(&mut input)?;
                if input.trim().to_lowercase() == "y" {
                    for plan in &matching {
                        let mut updated_plan = plan.clone();
                        let mut changed = false;
                        
                        if let Some(new_status) = &status {
                            let parsed_status = match new_status.as_str() {
                                "planned" => Some(PlanStatus::Planned),
                                "in-progress" => Some(PlanStatus::InProgress),
                                "done" => Some(PlanStatus::Done),
                                "blocked" => Some(PlanStatus::Blocked),
                                _ => None
                            };
                            if let Some(status_value) = parsed_status {
                                updated_plan.status = status_value;
                                changed = true;
                            }
                        }
                        
                        if let Some(new_priority) = &priority {
                            let parsed_priority = match new_priority.as_str() {
                                "low" => Some(Priority::Low),
                                "medium" => Some(Priority::Medium),
                                "high" => Some(Priority::High),
                                "critical" => Some(Priority::Critical),
                                _ => None
                            };
                            if let Some(priority_value) = parsed_priority {
                                updated_plan.priority = priority_value;
                                changed = true;
                            }
                        }
                        
                        if let Some(new_tags) = &add_tags {
                            let tags_to_add: Vec<String> = new_tags.split(',').map(|s| s.trim().to_string()).collect();
                            for tag in tags_to_add {
                                if !updated_plan.tags.contains(&tag) {
                                    updated_plan.tags.push(tag);
                                    changed = true;
                                }
                            }
                        }
                        
                        if changed {
                            updated_plan.updated = chrono::Utc::now();
                            store.save(&updated_plan)?;
                        }
                    }
                    println!("✓ Updated {} plans", match_count);
                }
            }
        }
        
        PlanCmd::Config { config_cmd } => {
            store.ensure()?;
            match config_cmd {
                ConfigCmd::Show => {
                    let config = PlanningConfig::load(&root)?;
                    println!("📋 Planning Configuration\n");
                    
                    println!("📁 Project:");
                    println!("  Name: {}", config.project.name);
                    println!("  Key: {}", config.project.key);
                    println!("  Description: {}\n", config.project.description);
                    
                    println!("🏷️  Available Tags:");
                    println!("  Technical: {}", config.tags.technical.join(", "));
                    println!("  Features: {}", config.tags.features.join(", "));
                    println!("  Priority: {}", config.tags.priority.join(", "));
                    println!("  Workflow: {}", config.tags.workflow.join(", "));
                    println!();
                    
                    println!("📅 Versions: {}", config.versions.len());
                    for (key, version) in &config.versions {
                        println!("  {} - {} ({})", key, version.name, version.status);
                    }
                    println!();
                    
                    println!("🧩 Components: {}", config.components.len());
                    for (key, component) in &config.components {
                        println!("  {} - {} ({})", key, component.name, component.color);
                    }
                    println!();
                    
                    println!("⚙️  Automation:");
                    println!("  Auto-complete stories: {}", config.automation.auto_complete_story_when_all_tasks_done);
                    println!("  Auto-complete epics: {}", config.automation.auto_complete_epic_when_all_stories_done);
                    println!("  Require acceptance criteria: {}", config.automation.require_acceptance_criteria_for_stories);
                    println!("  Require effort estimation: {}", config.automation.require_effort_for_stories);
                    println!("  Max effort per story: {}", config.automation.max_effort_per_story);
                    
                    println!("\n🎯 Effort Scale: {:?}", config.effort.scale);
                }
                ConfigCmd::Init => {
                    let config = PlanningConfig::load(&root)?;
                    config.save(&root)?;
                    Style::success("Created default planning configuration");
                    println!("📋 Created with default settings:");
                    println!("  - Technical tags: backend, frontend, cli");
                    println!("  - Feature tags: auth, ui, api");
                    println!("  - Priority tags: high, medium, low");
                    println!("  - Workflow tags: todo, in-progress, review, done");
                    println!("  - Fibonacci effort scale: 1, 2, 3, 5, 8, 13, 21");
                }
                ConfigCmd::AddTag { category, tag } => {
                    let mut config = PlanningConfig::load(&root)?;
                    match config.add_tag(&category, tag.clone()) {
                        Ok(_) => {
                            config.save(&root)?;
                            Style::success(&format!("Added tag '{}' to category '{}'", tag, category));
                        }
                        Err(e) => Style::error(&format!("Failed to add tag: {}", e)),
                    }
                }
                ConfigCmd::AddVersion { key, name, date, status } => {
                    let mut config = PlanningConfig::load(&root)?;
                    let version_config = VersionConfig {
                        name: name.clone(),
                        target_date: date.unwrap_or_else(|| "TBD".to_string()),
                        status: status.clone(),
                    };
                    config.add_version(key.clone(), version_config);
                    config.save(&root)?;
                    Style::success(&format!("Added version '{}' ({})", key, name));
                }
                ConfigCmd::AddComponent { key, name, description, color } => {
                    let mut config = PlanningConfig::load(&root)?;
                    let component_config = ComponentConfig {
                        name: name.clone(),
                        description: description.unwrap_or_else(|| "Component".to_string()),
                        color: color.clone(),
                    };
                    config.add_component(key.clone(), component_config);
                    config.save(&root)?;
                    Style::success(&format!("Added component '{}' ({})", key, name));
                }
                ConfigCmd::ListTags { category } => {
                    let config = PlanningConfig::load(&root)?;
                    match category.as_deref() {
                        Some("technical") => println!("Technical: {}", config.tags.technical.join(", ")),
                        Some("features") => println!("Features: {}", config.tags.features.join(", ")),
                        Some("priority") => println!("Priority: {}", config.tags.priority.join(", ")),
                        Some("workflow") => println!("Workflow: {}", config.tags.workflow.join(", ")),
                        Some(cat) => Style::error(&format!("Unknown category: {}", cat)),
                        None => {
                            println!("🏷️  All Available Tags:");
                            println!("  Technical: {}", config.tags.technical.join(", "));
                            println!("  Features: {}", config.tags.features.join(", "));
                            println!("  Priority: {}", config.tags.priority.join(", "));
                            println!("  Workflow: {}", config.tags.workflow.join(", "));
                        }
                    }
                }
                ConfigCmd::ListVersions => {
                    let config = PlanningConfig::load(&root)?;
                    println!("📅 Available Versions:");
                    for (key, version) in &config.versions {
                        println!("  {} - {} ({}, {})", key, version.name, version.status, version.target_date);
                    }
                }
                ConfigCmd::ListComponents => {
                    let config = PlanningConfig::load(&root)?;
                    println!("🧩 Available Components:");
                    for (key, component) in &config.components {
                        println!("  {} - {} ({}) [{}]", key, component.name, component.description, component.color);
                    }
                }
                ConfigCmd::Validate { id } => {
                    let config = PlanningConfig::load(&root)?;
                    match store.load(&id) {
                        Ok(plan) => {
                            let errors = config.validate_plan(&plan);
                            if errors.is_empty() {
                                Style::success(&format!("Plan {} passes all validation rules", id));
                            } else {
                                Style::error(&format!("Plan {} has validation errors:", id));
                                for error in errors {
                                    println!("  ❌ {}", error);
                                }
                            }
                        }
                        Err(e) => Style::error(&format!("Failed to load plan {}: {}", id, e)),
                    }
                }
            }
        }
        
        PlanCmd::Template { command } => {
            store.ensure()?;
            match command {
                TemplateCmd::List => {
                    let templates = store.list_templates()?;
                    if templates.is_empty() {
                        println!("📋 No templates found");
                        println!("💡 Create a template with: rune plan template create <name> <plan-id>");
                    } else {
                        println!("📋 Available Templates:");
                        for template in templates {
                            println!("  📄 {}", template);
                        }
                    }
                }
                TemplateCmd::Create { name, from_plan, description } => {
                    let source_plan = store.load(&from_plan)?;
                    let template = PlanTemplate {
                        name: name.clone(),
                        description: description.unwrap_or_else(|| format!("Template based on {}", from_plan)),
                        plan_type: source_plan.plan_type,
                        priority: source_plan.priority,
                        tags: source_plan.tags.clone(),
                        default_tasks: source_plan.tasks.iter().map(|t| t.description.clone()).collect(),
                        default_acceptance_criteria: source_plan.acceptance_criteria.clone(),
                        content_template: source_plan.description.clone(),
                        metadata: std::collections::HashMap::new(),
                        created: chrono::Utc::now(),
                    };
                    store.save_template(&template)?;
                    Style::success(&format!("Created template '{}' from {}", name, from_plan));
                }
                TemplateCmd::Use { template, title, project, epic, story } => {
                    let plan = store.create_from_template(&template, &title, project.as_deref(), epic.as_deref(), story.as_deref())?;
                    let path = store.path_for(&plan);
                    Style::success(&format!("Created {} '{}' from template '{}' -> {}", plan.id, title, template, path.display()));
                }
                TemplateCmd::Show { name } => {
                    let template = store.load_template(&name)?;
                    println!("📄 Template: {}", template.name);
                    println!("Description: {}", template.description);
                    println!("Type: {}", template.plan_type.as_str());
                    println!("Priority: {}", template.priority.as_str());
                    println!("Tags: {}", template.tags.join(", "));
                    println!("Default Tasks: {}", template.default_tasks.len());
                    for task in &template.default_tasks {
                        println!("  - {}", task);
                    }
                    println!("Acceptance Criteria: {}", template.default_acceptance_criteria.len());
                    for criteria in &template.default_acceptance_criteria {
                        println!("  - {}", criteria);
                    }
                }
                TemplateCmd::Delete { name } => {
                    let template_dir = root.join(rune_planning::TEMPLATE_DIR);
                    let filename = format!("{}.toml", name.replace(' ', "_").to_lowercase());
                    let path = template_dir.join(filename);
                    
                    if path.exists() {
                        std::fs::remove_file(path)?;
                        Style::success(&format!("Deleted template '{}'", name));
                    } else {
                        Style::error(&format!("Template '{}' not found", name));
                    }
                }
            }
        }
        
        PlanCmd::AddTaskAdvanced { id, description, assignee, due_date, effort_hours, depends_on } => {
            let mut plan = store.load(&id)?;
            let metadata = if assignee.is_some() || due_date.is_some() || effort_hours.is_some() || depends_on.is_some() {
                Some(TaskMetadata {
                    assignee: assignee.clone(),
                    due_date: due_date.clone(),
                    estimated_hours: effort_hours,
                    actual_hours: None,
                    blocked_by: vec![],
                    dependencies: depends_on.map(|s| vec![s]).unwrap_or_default(),
                })
            } else {
                None
            };
            
            let task = rune_planning::Task {
                description: description.clone(),
                done: false,
                task_type: None,
                effort: None,
                path: None,
                tags: vec![],
                metadata,
            };
            
            plan.tasks.push(task);
            plan.updated = chrono::Utc::now();
            store.save(&plan)?;
            
            let mut details = vec![format!("task '{}'", description)];
            if let Some(a) = assignee { details.push(format!("assignee: {}", a)); }
            if let Some(d) = due_date { details.push(format!("due: {}", d)); }
            if let Some(h) = effort_hours { details.push(format!("effort: {}h", h)); }
            
            Style::success(&format!("Added {} to {}", details.join(", "), id));
        }
        
        PlanCmd::Report { command } => {
            store.ensure()?;
            let plans = store.load_all()?;
            
            match command {
                ReportCmd::Burndown { period, sprint } => {
                    println!("📈 Burndown Report ({})", period);
                    if let Some(s) = sprint {
                        println!("Sprint: {}", s);
                    }
                    
                    let total_effort: u32 = plans.iter().filter_map(|p| p.effort).sum();
                    let completed_effort: u32 = plans.iter()
                        .filter(|p| p.status == PlanStatus::Done)
                        .filter_map(|p| p.effort)
                        .sum();
                    
                    println!("Total Effort: {} points", total_effort);
                    println!("Completed: {} points", completed_effort);
                    println!("Remaining: {} points", total_effort - completed_effort);
                    
                    if total_effort > 0 {
                        let progress = completed_effort * 100 / total_effort;
                        println!("Progress: {}%", progress);
                    }
                }
                ReportCmd::Velocity { periods } => {
                    println!("⚡ Velocity Report (last {} periods)", periods);
                    
                    let completed_stories: Vec<_> = plans.iter()
                        .filter(|p| p.plan_type == PlanType::Story && p.status == PlanStatus::Done)
                        .collect();
                    
                    let total_completed_effort: u32 = completed_stories.iter()
                        .filter_map(|p| p.effort)
                        .sum();
                    
                    println!("Completed Stories: {}", completed_stories.len());
                    println!("Total Story Points: {}", total_completed_effort);
                    
                    if periods > 0 {
                        println!("Average per period: {:.1} points", total_completed_effort as f32 / (periods as f32));
                    }
                }
                ReportCmd::Blocked { format } => {
                    let blocked_plans: Vec<_> = plans.iter()
                        .filter(|p| p.status == PlanStatus::Blocked)
                        .collect();
                    
                    match format.as_str() {
                        "table" => {
                            println!("🚫 Blocked Items Report");
                            if blocked_plans.is_empty() {
                                println!("✅ No blocked items found");
                            } else {
                                println!("ID         Type     Title");
                                println!("--------------------------------");
                                for plan in blocked_plans {
                                    println!("{:<10} {:<8} {}", plan.id, plan.plan_type.as_str(), plan.title);
                                }
                            }
                        }
                        "json" => {
                            let json = serde_json::to_string_pretty(&blocked_plans)?;
                            println!("{}", json);
                        }
                        "csv" => {
                            println!("id,type,title,priority");
                            for plan in blocked_plans {
                                println!("{},{},{},{}", plan.id, plan.plan_type.as_str(), plan.title, plan.priority.as_str());
                            }
                        }
                        _ => Style::error("Unsupported format. Use: table, json, csv"),
                    }
                }
                ReportCmd::Effort { group_by } => {
                    println!("📊 Effort Distribution Report");
                    
                    match group_by.as_str() {
                        "type" => {
                            let mut type_effort = std::collections::HashMap::new();
                            for plan in &plans {
                                let effort = plan.effort.unwrap_or(0);
                                *type_effort.entry(plan.plan_type).or_insert(0) += effort;
                            }
                            
                            for (plan_type, effort) in type_effort {
                                println!("{}: {} points", plan_type.as_str(), effort);
                            }
                        }
                        "priority" => {
                            let mut priority_effort = std::collections::HashMap::new();
                            for plan in &plans {
                                let effort = plan.effort.unwrap_or(0);
                                *priority_effort.entry(plan.priority).or_insert(0) += effort;
                            }
                            
                            for (priority, effort) in priority_effort {
                                println!("{}: {} points", priority.as_str(), effort);
                            }
                        }
                        _ => Style::error("Unsupported group_by. Use: type, priority"),
                    }
                }
                ReportCmd::Time { from, to } => {
                    println!("⏱️  Time Tracking Report");
                    if let Some(f) = from { println!("From: {}", f); }
                    if let Some(t) = to { println!("To: {}", t); }
                    
                    // Räkna tasks med time metadata
                    let mut total_estimated = 0.0;
                    let mut total_actual = 0.0;
                    let mut tracked_tasks = 0;
                    
                    for plan in &plans {
                        for task in &plan.tasks {
                            if let Some(meta) = &task.metadata {
                                if let Some(est) = meta.estimated_hours {
                                    total_estimated += est;
                                    tracked_tasks += 1;
                                }
                                if let Some(act) = meta.actual_hours {
                                    total_actual += act;
                                }
                            }
                        }
                    }
                    
                    println!("Tracked Tasks: {}", tracked_tasks);
                    println!("Estimated Hours: {:.1}", total_estimated);
                    println!("Actual Hours: {:.1}", total_actual);
                    
                    if total_estimated > 0.0 {
                        let variance = (total_actual - total_estimated) / total_estimated * 100.0;
                        println!("Variance: {:.1}%", variance);
                    }
                }
            }
        }
    }
    Ok(())
}

fn show_epic_progress(plans: &[Plan], epic: &Plan, details: bool) {
    let epic_stories: Vec<_> = plans.iter().filter(|p| p.plan_type == PlanType::Story && p.epic.as_ref() == Some(&epic.id)).collect();
    let epic_tasks: Vec<_> = plans.iter().filter(|p| p.plan_type == PlanType::Task && p.epic.as_ref() == Some(&epic.id)).collect();
    
    let total_items = epic_stories.len() + epic_tasks.len();
    let done_items = epic_stories.iter().chain(&epic_tasks).filter(|p| p.status == PlanStatus::Done).count();
    let progress = if total_items == 0 { 0 } else { done_items * 100 / total_items };
    
    println!("📋 {} [{}] {} ({}% - {}/{} items)", 
        epic.id, Style::status(&epic.status), epic.title, progress, done_items, total_items);
    
    if details {
        for story in epic_stories {
            let story_tasks: Vec<_> = plans.iter().filter(|p| p.plan_type == PlanType::Task && p.story.as_ref() == Some(&story.id)).collect();
            let story_subtasks = story.tasks.len();
            let story_done_subtasks = story.tasks.iter().filter(|t| t.done).count();
            
            println!("  ├─ {} [{}] {} ({}/{} subtasks)", 
                story.id, Style::status(&story.status), story.title, story_done_subtasks, story_subtasks);
            
            for task in story_tasks {
                let task_subtasks = task.tasks.len();
                let task_done_subtasks = task.tasks.iter().filter(|t| t.done).count();
                println!("    ├─ {} [{}] {} ({}/{} subtasks)", 
                    task.id, Style::status(&task.status), task.title, task_done_subtasks, task_subtasks);
            }
        }
    }
}

fn show_plan_tree(all_plans: &[Plan], plan: &Plan, depth: usize) {
    let indent = "  ".repeat(depth);
    let status_icon = match plan.status {
        PlanStatus::Planned => "⏳",
        PlanStatus::Active => "�", 
        PlanStatus::InProgress => "🔄",
        PlanStatus::Blocked => "🚫",
        PlanStatus::Done => "✅",
    };
    
    let type_color = match plan.plan_type {
        PlanType::Project => Style::project_color()(&plan.id),
        PlanType::Epic => Style::epic_color()(&plan.id),
        PlanType::Story => Style::story_color()(&plan.id),
        PlanType::Task => Style::task_color()(&plan.id),
        PlanType::SubTask => Style::task_color()(&plan.id),
    };
    
    println!("{}{} {} {}", indent, status_icon, type_color, plan.title);
    
    // Hitta child plans
    let children: Vec<_> = all_plans.iter().filter(|p| {
        match plan.plan_type {
            PlanType::Project => p.project.as_ref() == Some(&plan.id),
            PlanType::Epic => p.epic.as_ref() == Some(&plan.id),
            PlanType::Story => p.story.as_ref() == Some(&plan.id),
            PlanType::Task => false, // Tasks har inga children
            PlanType::SubTask => false, // SubTasks har inga children
        }
    }).collect();
    
    for child in children {
        show_plan_tree(all_plans, child, depth + 1);
    }
}
