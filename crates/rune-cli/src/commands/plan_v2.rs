use crate::style::Style;
use anyhow::Result;
use clap::{Args, Subcommand};
use colored::Colorize;
use rune_planning::{
    create_issue_with_options, update_status, ComponentConfig, Issue, IssueStore, IssueTemplate,
    IssueType, PlanStatus, PlanningConfig, Priority, TaskMetadata, VersionConfig, PLAN_DIR,
};
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
    /// Create a new issue with next id (Linear-style)
    Create {
        /// Title of the issue
        title: String,
        /// Optional labels (comma separated)
        #[arg(long)]
        labels: Option<String>,
        /// Issue type (initiative, epic, feature, task, bug, spike)
        #[arg(long, value_enum, default_value = "task")]
        issue_type: IssueType,
        /// Priority level
        #[arg(long, value_enum, default_value = "medium")]
        priority: Priority,
        /// Team this issue belongs to
        #[arg(long)]
        team: Option<String>,
        /// Cycle this issue belongs to
        #[arg(long)]
        cycle: Option<String>,
        /// Parent issue this belongs to
        #[arg(long)]
        parent: Option<String>,
        /// Effort estimation
        #[arg(long)]
        estimate: Option<u32>,
    },
    /// List existing issues (id, status, title)
    List,
    /// Show an issue file (optionally with insights)
    Show {
        id: String,
        #[arg(long)]
        insights: bool,
    },
    /// Update status of an issue
    Status {
        id: String,
        #[arg(value_enum)]
        status: PlanStatus,
    },
    /// Set assignee for an issue
    Assign { id: String, assignee: String },
    /// Add labels to an issue
    AddLabels { id: String, labels: String },
    /// Remove labels from an issue
    RemoveLabels { id: String, labels: String },
    /// Set team for an issue
    SetTeam { id: String, team: String },
    /// Set cycle for an issue
    SetCycle { id: String, cycle: String },
    /// Set parent for an issue
    SetParent { id: String, parent: String },
    /// Set estimate for an issue
    SetEstimate { id: String, estimate: u32 },
    /// Add related issue
    AddRelated { id: String, related: String },
    /// Remove related issue
    RemoveRelated { id: String, related: String },
    /// Show burndown chart for a cycle
    Burndown { cycle: Option<String> },
    /// Show velocity report
    Velocity { team: Option<String> },
    /// Export issues to various formats
    Export {
        #[arg(long, value_enum, default_value = "json")]
        format: ExportFormat,
        #[arg(long)]
        team: Option<String>,
        #[arg(long)]
        cycle: Option<String>,
    },
}

#[derive(Debug, Clone, clap::ValueEnum)]
pub enum ExportFormat {
    Json,
    Csv,
    Markdown,
}

pub fn run(args: PlanArgs) -> Result<()> {
    let store = IssueStore::new(env::current_dir()?);

    match args.command {
        PlanCmd::Init => {
            store.ensure()?;
            println!(
                "✅ Initialized planning directory at {}",
                store.dir().display()
            );
        }

        PlanCmd::Create {
            title,
            labels,
            issue_type,
            priority,
            team,
            cycle,
            parent,
            estimate,
        } => {
            let issue = create_issue_with_options(
                &store,
                &title,
                labels.as_deref(),
                issue_type,
                priority,
                team.as_deref(),
                cycle.as_deref(),
                parent.as_deref(),
                estimate,
            )?;
            println!(
                "✅ Created issue: {} - {}",
                Style::issue_id(&issue.id),
                issue.title
            );
        }

        PlanCmd::List => {
            let issues = store.load_all()?;
            if issues.is_empty() {
                println!("No issues found. Use 'rune plan create' to create one.");
                return Ok(());
            }

            println!(
                "{:<12} {:<12} {:<8} {:<8} {}",
                "ID".bold(),
                "Type".bold(),
                "Status".bold(),
                "Priority".bold(),
                "Title".bold()
            );
            println!("{}", "─".repeat(80));

            for issue in &issues {
                println!(
                    "{:<12} {:<12} {:<8} {:<8} {}",
                    Style::issue_id(&issue.id),
                    Style::issue_type(&issue.issue_type),
                    Style::status(&issue.status),
                    Style::priority(&issue.priority),
                    issue.title
                );
            }

            println!("\nTotal: {} issues", issues.len());
        }

        PlanCmd::Show { id, insights } => {
            let issue = store.load(&id)?;

            // Basic info
            println!("{}", Style::issue_id(&issue.id).bold());
            println!("Title: {}", issue.title.bold());
            println!("Type: {}", Style::issue_type(&issue.issue_type));
            println!("Status: {}", Style::status(&issue.status));
            println!("Priority: {}", Style::priority(&issue.priority));

            // Linear-style fields
            if let Some(team) = &issue.team {
                println!("Team: {}", team.cyan());
            }
            if let Some(cycle) = &issue.cycle {
                println!("Cycle: {}", cycle.green());
            }
            if let Some(assignee) = &issue.assignee {
                println!("Assignee: {}", assignee.yellow());
            }
            if let Some(parent) = &issue.parent_id {
                println!("Parent: {}", Style::issue_id(parent));
            }
            if let Some(estimate) = issue.estimate {
                println!("Estimate: {} points", estimate.to_string().magenta());
            }

            // Labels
            if !issue.labels.is_empty() {
                println!("Labels: {}", Style::labels(&issue.labels));
            }

            // Related issues
            if !issue.related_issues.is_empty() {
                println!("Related: {}", issue.related_issues.join(", "));
            }

            // Blocks
            if !issue.blocks.is_empty() {
                println!("Blocks: {}", issue.blocks.join(", "));
            }

            // Description
            if !issue.description.is_empty() {
                println!("\nDescription:");
                println!("{}", issue.description);
            }

            // Acceptance criteria
            if !issue.acceptance_criteria.is_empty() {
                println!("\nAcceptance Criteria:");
                for criteria in &issue.acceptance_criteria {
                    println!("  ✓ {}", criteria);
                }
            }

            println!("\nCreated: {}", issue.created.format("%Y-%m-%d %H:%M"));
            println!("Updated: {}", issue.updated.format("%Y-%m-%d %H:%M"));

            if insights {
                println!("\n{}", "Insights:".bold());
                // Add insights here when implemented
                println!("  (Insights coming soon for Linear-style issues)");
            }
        }

        PlanCmd::Status { id, status } => {
            update_status(&store, &id, status)?;
            println!(
                "✅ Updated status of {} to {}",
                Style::issue_id(&id),
                Style::status(&status)
            );
        }

        PlanCmd::Assign { id, assignee } => {
            let mut issue = store.load(&id)?;
            issue.assignee = Some(assignee.clone());
            issue.updated = chrono::Utc::now();
            store.save(&issue)?;
            println!(
                "✅ Assigned {} to {}",
                Style::issue_id(&id),
                assignee.yellow()
            );
        }

        PlanCmd::AddLabels { id, labels } => {
            let mut issue = store.load(&id)?;
            let new_labels: Vec<String> = labels.split(',').map(|s| s.trim().to_string()).collect();
            for label in new_labels {
                if !issue.labels.contains(&label) {
                    issue.labels.push(label);
                }
            }
            issue.updated = chrono::Utc::now();
            store.save(&issue)?;
            println!(
                "✅ Added labels to {}: {}",
                Style::issue_id(&id),
                Style::labels(&issue.labels)
            );
        }

        PlanCmd::RemoveLabels { id, labels } => {
            let mut issue = store.load(&id)?;
            let remove_labels: Vec<&str> = labels.split(',').map(|s| s.trim()).collect();
            issue
                .labels
                .retain(|label| !remove_labels.contains(&label.as_str()));
            issue.updated = chrono::Utc::now();
            store.save(&issue)?;
            println!(
                "✅ Removed labels from {}: {}",
                Style::issue_id(&id),
                labels
            );
        }

        PlanCmd::SetTeam { id, team } => {
            let mut issue = store.load(&id)?;
            issue.team = Some(team.clone());
            issue.updated = chrono::Utc::now();
            store.save(&issue)?;
            println!(
                "✅ Set team for {} to {}",
                Style::issue_id(&id),
                team.cyan()
            );
        }

        PlanCmd::SetCycle { id, cycle } => {
            let mut issue = store.load(&id)?;
            issue.cycle = Some(cycle.clone());
            issue.updated = chrono::Utc::now();
            store.save(&issue)?;
            println!(
                "✅ Set cycle for {} to {}",
                Style::issue_id(&id),
                cycle.green()
            );
        }

        PlanCmd::SetParent { id, parent } => {
            let mut issue = store.load(&id)?;
            issue.parent_id = Some(parent.clone());
            issue.updated = chrono::Utc::now();
            store.save(&issue)?;
            println!(
                "✅ Set parent for {} to {}",
                Style::issue_id(&id),
                Style::issue_id(&parent)
            );
        }

        PlanCmd::SetEstimate { id, estimate } => {
            let mut issue = store.load(&id)?;
            issue.estimate = Some(estimate);
            issue.updated = chrono::Utc::now();
            store.save(&issue)?;
            println!(
                "✅ Set estimate for {} to {} points",
                Style::issue_id(&id),
                estimate.to_string().magenta()
            );
        }

        PlanCmd::AddRelated { id, related } => {
            let mut issue = store.load(&id)?;
            if !issue.related_issues.contains(&related) {
                issue.related_issues.push(related.clone());
                issue.updated = chrono::Utc::now();
                store.save(&issue)?;
                println!(
                    "✅ Added related issue {} to {}",
                    Style::issue_id(&related),
                    Style::issue_id(&id)
                );
            } else {
                println!("Related issue already exists");
            }
        }

        PlanCmd::RemoveRelated { id, related } => {
            let mut issue = store.load(&id)?;
            if let Some(pos) = issue.related_issues.iter().position(|x| x == &related) {
                issue.related_issues.remove(pos);
                issue.updated = chrono::Utc::now();
                store.save(&issue)?;
                println!(
                    "✅ Removed related issue {} from {}",
                    Style::issue_id(&related),
                    Style::issue_id(&id)
                );
            } else {
                println!("Related issue not found");
            }
        }

        PlanCmd::Burndown { cycle } => {
            let issues = store.load_all()?;

            if let Some(cycle_name) = cycle {
                let cycle_issues: Vec<_> = issues
                    .iter()
                    .filter(|i| i.cycle.as_ref() == Some(&cycle_name))
                    .collect();

                println!("Burndown for cycle: {}", cycle_name.green().bold());
                show_burndown_chart(&cycle_issues);
            } else {
                println!("All cycles burndown:");
                let cycles: std::collections::HashSet<_> =
                    issues.iter().filter_map(|i| i.cycle.as_ref()).collect();

                for cycle_name in cycles {
                    let cycle_issues: Vec<_> = issues
                        .iter()
                        .filter(|i| i.cycle.as_ref() == Some(cycle_name))
                        .collect();

                    println!("\n{}", cycle_name.green().bold());
                    show_burndown_chart(&cycle_issues);
                }
            }
        }

        PlanCmd::Velocity { team } => {
            let issues = store.load_all()?;

            if let Some(team_name) = team {
                let team_issues: Vec<_> = issues
                    .iter()
                    .filter(|i| i.team.as_ref() == Some(&team_name))
                    .collect();

                println!("Velocity for team: {}", team_name.cyan().bold());
                show_velocity_report(&team_issues);
            } else {
                println!("All teams velocity:");
                let teams: std::collections::HashSet<_> =
                    issues.iter().filter_map(|i| i.team.as_ref()).collect();

                for team_name in teams {
                    let team_issues: Vec<_> = issues
                        .iter()
                        .filter(|i| i.team.as_ref() == Some(team_name))
                        .collect();

                    println!("\n{}", team_name.cyan().bold());
                    show_velocity_report(&team_issues);
                }
            }
        }

        PlanCmd::Export {
            format,
            team,
            cycle,
        } => {
            let mut issues = store.load_all()?;

            // Filter by team if specified
            if let Some(team_name) = &team {
                issues.retain(|i| i.team.as_ref() == Some(team_name));
            }

            // Filter by cycle if specified
            if let Some(cycle_name) = &cycle {
                issues.retain(|i| i.cycle.as_ref() == Some(cycle_name));
            }

            match format {
                ExportFormat::Json => {
                    let json = serde_json::to_string_pretty(&issues)?;
                    println!("{}", json);
                }
                ExportFormat::Csv => {
                    println!("ID,Title,Type,Status,Priority,Team,Cycle,Assignee,Estimate,Labels");
                    for issue in &issues {
                        println!(
                            "{},{},{},{},{},{},{},{},{},\"{}\"",
                            issue.id,
                            issue.title,
                            issue.issue_type.as_str(),
                            issue.status.as_str(),
                            issue.priority.as_str(),
                            issue.team.as_deref().unwrap_or(""),
                            issue.cycle.as_deref().unwrap_or(""),
                            issue.assignee.as_deref().unwrap_or(""),
                            issue.estimate.unwrap_or(0),
                            issue.labels.join(";")
                        );
                    }
                }
                ExportFormat::Markdown => {
                    println!("# Issues Report\n");
                    if let Some(team_name) = &team {
                        println!("**Team:** {}\n", team_name);
                    }
                    if let Some(cycle_name) = &cycle {
                        println!("**Cycle:** {}\n", cycle_name);
                    }

                    println!("| ID | Title | Type | Status | Priority | Assignee |");
                    println!("|----|-------|------|--------|----------|----------|");

                    for issue in &issues {
                        println!(
                            "| {} | {} | {} | {} | {} | {} |",
                            issue.id,
                            issue.title,
                            issue.issue_type.as_str(),
                            issue.status.as_str(),
                            issue.priority.as_str(),
                            issue.assignee.as_deref().unwrap_or("-")
                        );
                    }
                }
            }
        }
    }

    Ok(())
}

fn show_burndown_chart(issues: &[&Issue]) {
    let total_issues = issues.len();
    let done_issues = issues
        .iter()
        .filter(|i| i.status == PlanStatus::Done)
        .count();
    let in_progress = issues
        .iter()
        .filter(|i| i.status == PlanStatus::InProgress)
        .count();
    let planned = issues
        .iter()
        .filter(|i| i.status == PlanStatus::Planned)
        .count();
    let blocked = issues
        .iter()
        .filter(|i| i.status == PlanStatus::Blocked)
        .count();

    let total_estimate: u32 = issues.iter().filter_map(|i| i.estimate).sum();
    let done_estimate: u32 = issues
        .iter()
        .filter(|i| i.status == PlanStatus::Done)
        .filter_map(|i| i.estimate)
        .sum();

    println!(
        "Issues: {} total, {} done, {} in progress, {} planned, {} blocked",
        total_issues, done_issues, in_progress, planned, blocked
    );

    if total_estimate > 0 {
        println!(
            "Points: {} total, {} done ({:.1}% complete)",
            total_estimate,
            done_estimate,
            (done_estimate as f64 / total_estimate as f64) * 100.0
        );
    }

    // Simple progress bar
    if total_issues > 0 {
        let progress = (done_issues as f64 / total_issues as f64) * 20.0;
        let filled = "█".repeat(progress as usize);
        let empty = "░".repeat(20 - progress as usize);
        println!(
            "Progress: [{}{}] {:.1}%",
            filled.green(),
            empty,
            (done_issues as f64 / total_issues as f64) * 100.0
        );
    }
}

fn show_velocity_report(issues: &[&Issue]) {
    let completed_issues = issues
        .iter()
        .filter(|i| i.status == PlanStatus::Done)
        .count();
    let total_completed_points: u32 = issues
        .iter()
        .filter(|i| i.status == PlanStatus::Done)
        .filter_map(|i| i.estimate)
        .sum();

    println!(
        "Completed: {} issues, {} points",
        completed_issues, total_completed_points
    );

    // Group by issue type
    let mut type_counts = std::collections::HashMap::new();
    for issue in issues.iter().filter(|i| i.status == PlanStatus::Done) {
        *type_counts.entry(&issue.issue_type).or_insert(0) += 1;
    }

    println!("By type:");
    for (issue_type, count) in type_counts {
        println!("  {}: {}", issue_type.as_str(), count);
    }
}
