use colored::*;
use console::Term;
use rune_planning::{PlanType, Priority, PlanStatus};

pub struct Style;

impl Style {
    /// Print a success message
    pub fn success(msg: &str) {
        println!("{} {}", "✓".green().bold(), msg);
    }

    /// Print an info message
    pub fn info(msg: &str) {
        println!("{} {}", "ℹ".blue().bold(), msg);
    }

    /// Print a warning message
    pub fn warning(msg: &str) {
        println!("{} {}", "⚠".yellow().bold(), msg);
    }

    /// Print an error message
    pub fn error(msg: &str) {
        eprintln!("{} {}", "✗".red().bold(), msg);
    }

    /// Format plan type with color
    pub fn plan_type(plan_type: &PlanType) -> String {
        match plan_type {
            PlanType::Project => plan_type.as_str().red().bold().to_string(),
            PlanType::Epic => plan_type.as_str().magenta().bold().to_string(),
            PlanType::Story => plan_type.as_str().blue().bold().to_string(),
            PlanType::Task => plan_type.as_str().cyan().bold().to_string(),
            PlanType::SubTask => plan_type.as_str().bright_cyan().to_string(),
        }
    }

    /// Format priority with color
    pub fn priority(priority: &Priority) -> String {
        match priority {
            Priority::Critical => priority.as_str().red().bold().to_string(),
            Priority::High => priority.as_str().yellow().bold().to_string(),
            Priority::Medium => priority.as_str().green().to_string(),
            Priority::Low => priority.as_str().bright_black().to_string(),
        }
    }

    /// Format status with color
    pub fn status(status: &PlanStatus) -> String {
        match status {
            PlanStatus::Planned => status.as_str().bright_black().to_string(),
            PlanStatus::Active => status.as_str().blue().to_string(),
            PlanStatus::InProgress => status.as_str().yellow().to_string(),
            PlanStatus::Blocked => status.as_str().red().to_string(),
            PlanStatus::Done => status.as_str().green().bold().to_string(),
        }
    }

    /// Format tags with brackets and color
    pub fn tags(tags: &[String]) -> String {
        if tags.is_empty() {
            return String::new();
        }
        tags.iter()
            .map(|tag| format!("[{}]", tag.bright_cyan()))
            .collect::<Vec<_>>()
            .join(" ")
    }

    /// Format effort with points suffix
    pub fn effort(effort: Option<u32>) -> String {
        match effort {
            Some(e) => format!("{}pt", e.to_string().bright_green()),
            None => "-".bright_black().to_string(),
        }
    }

    /// Print a verbose/debug message
    pub fn verbose(msg: &str) {
        println!("{} {}", "🔍".dimmed(), msg.dimmed());
    }

    /// Print a progress message
    pub fn progress(msg: &str) {
        print!("{} {}...\r", "⏳".cyan(), msg);
        use std::io::{self, Write};
        io::stdout().flush().ok();
    }

    /// Clear progress line
    pub fn clear_progress() {
        print!("\r\x1b[2K");
        use std::io::{self, Write};
        io::stdout().flush().ok();
    }

    /// Print a commit hash with styling
    pub fn commit_hash(hash: &str) -> ColoredString {
        hash.yellow().bold()
    }

    /// Print a branch name with styling
    pub fn branch_name(name: &str) -> ColoredString {
        name.green().bold()
    }

    /// Print a file path with styling
    pub fn file_path(path: &str) -> ColoredString {
        path.cyan()
    }

    /// Print an author name with styling
    pub fn author_name(name: &str) -> ColoredString {
        name.magenta()
    }

    /// Print a status indicator
    pub fn status_added() -> ColoredString {
        "+".green().bold()
    }

    #[allow(dead_code)] // Status formatting utilities in development
    pub fn status_modified() -> ColoredString {
        "M".yellow().bold()
    }

    #[allow(dead_code)] // Status formatting utilities in development
    pub fn status_deleted() -> ColoredString {
        "-".red().bold()
    }

    #[allow(dead_code)] // Status formatting utilities in development
    pub fn status_renamed() -> ColoredString {
        "R".blue().bold()
    }

    #[allow(dead_code)] // Status formatting utilities in development
    pub fn status_untracked() -> ColoredString {
        "?".magenta().bold()
    }

    /// Format a timestamp nicely
    pub fn timestamp(ts: chrono::NaiveDateTime) -> String {
        ts.format("%Y-%m-%d %H:%M:%S").to_string().dimmed().to_string()
    }

    /// Print a section header
    pub fn section_header(title: &str) {
        println!("\n{}", title.bold().underline());
    }

    /// Print a table-like row
    #[allow(dead_code)] // Table formatting utility in development
    pub fn table_row(col1: &str, col2: &str, col3: &str) {
        println!(
            "{:<12} {:<10} {}",
            col1.yellow().bold(),
            col2.dimmed(),
            col3
        );
    }

    /// Print a summary line
    #[allow(dead_code)] // Summary formatting utility in development
    pub fn summary(items: usize, item_type: &str) {
        if items == 0 {
            println!("{}", format!("No {} found", item_type).dimmed());
        } else {
            println!(
                "{} {}{}",
                items.to_string().bold(),
                item_type,
                if items == 1 { "" } else { "s" }
            );
        }
    }

    /// Check if we should use colors (respects NO_COLOR env var)
    pub fn should_color() -> bool {
        std::env::var("NO_COLOR").is_err() && Term::stdout().features().colors_supported()
    }

    /// Get project color
    pub fn project_color() -> impl Fn(&str) -> colored::ColoredString {
        |s: &str| s.red().bold()
    }

    /// Get epic color
    pub fn epic_color() -> impl Fn(&str) -> colored::ColoredString {
        |s: &str| s.magenta().bold()
    }

    /// Get story color
    pub fn story_color() -> impl Fn(&str) -> colored::ColoredString {
        |s: &str| s.blue().bold()
    }

    /// Get task color
    pub fn task_color() -> impl Fn(&str) -> colored::ColoredString {
        |s: &str| s.cyan().bold()
    }
}

/// Initialize colored output
pub fn init_colors() {
    colored::control::set_override(Style::should_color());
}

/// Format file size nicely
#[allow(dead_code)] // Size formatting utility in development
pub fn format_size(bytes: u64) -> String {
    const UNITS: &[&str] = &["B", "KB", "MB", "GB", "TB"];
    let mut size = bytes as f64;
    let mut unit_index = 0;

    while size >= 1024.0 && unit_index < UNITS.len() - 1 {
        size /= 1024.0;
        unit_index += 1;
    }

    if unit_index == 0 {
        format!("{} {}", size as u64, UNITS[unit_index])
    } else {
        format!("{:.1} {}", size, UNITS[unit_index])
    }
}

/// Format duration nicely
pub fn format_duration(seconds: i64) -> String {
    if seconds < 60 {
        format!("{} seconds ago", seconds)
    } else if seconds < 3600 {
        format!("{} minutes ago", seconds / 60)
    } else if seconds < 86400 {
        format!("{} hours ago", seconds / 3600)
    } else {
        format!("{} days ago", seconds / 86400)
    }
}
