// Advanced Merge Engine for Rune VCS
// Provides intelligent merge strategies and conflict resolution

use anyhow::Result;
use std::collections::{HashMap, HashSet};
use std::path::{Path, PathBuf};
use serde::{Deserialize, Serialize};

/// Advanced merge engine with multiple strategies
pub struct MergeEngine {
    /// Workspace root directory
    workspace_root: PathBuf,
    /// Current merge strategy
    strategy: MergeStrategy,
    /// Conflict resolution handlers
    conflict_handlers: Vec<Box<dyn ConflictHandler>>,
}

#[derive(Debug, Clone)]
pub enum MergeStrategy {
    /// Standard three-way merge
    ThreeWay,
    /// Always prefer current branch (ours)
    Ours,
    /// Always prefer merging branch (theirs)
    Theirs,
    /// Intelligent merge with AI assistance
    Intelligent,
    /// Custom merge strategy
    Custom(String),
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MergeResult {
    /// Whether merge was successful
    pub success: bool,
    /// Files that were merged successfully
    pub merged_files: Vec<String>,
    /// Files with conflicts
    pub conflicted_files: Vec<ConflictInfo>,
    /// Merge strategy used
    pub strategy_used: String,
    /// Statistics about the merge
    pub stats: MergeStats,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConflictInfo {
    /// File path
    pub file_path: String,
    /// Type of conflict
    pub conflict_type: ConflictType,
    /// Conflicting sections
    pub conflicts: Vec<ConflictSection>,
    /// Suggested resolution
    pub suggested_resolution: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub enum ConflictType {
    /// Content conflicts (both sides modified)
    Content,
    /// File added by both sides
    AddAdd,
    /// File deleted by one side, modified by other
    DeleteModify,
    /// File renamed differently by both sides
    RenameRename,
    /// Mode change conflicts
    Mode,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct ConflictSection {
    /// Line range in the file
    pub line_range: (usize, usize),
    /// Content from current branch
    pub ours: String,
    /// Content from merging branch
    pub theirs: String,
    /// Common ancestor content (if available)
    pub base: Option<String>,
    /// Confidence level for auto-resolution (0.0-1.0)
    pub auto_resolve_confidence: f64,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct MergeStats {
    /// Total files processed
    pub files_processed: usize,
    /// Files merged automatically
    pub auto_merged: usize,
    /// Files with conflicts
    pub conflicts: usize,
    /// Time taken for merge (milliseconds)
    pub duration_ms: u64,
    /// Lines merged
    pub lines_merged: usize,
    /// Lines in conflict
    pub lines_conflicted: usize,
}

/// Trait for conflict resolution handlers
pub trait ConflictHandler {
    /// Try to resolve a conflict automatically
    fn resolve_conflict(&self, conflict: &ConflictInfo) -> Option<String>;
    
    /// Get confidence level for this handler
    fn confidence(&self) -> f64;
    
    /// Get handler name
    fn name(&self) -> &str;
}

/// Smart conflict handler for code files
pub struct CodeConflictHandler;

impl ConflictHandler for CodeConflictHandler {
    fn resolve_conflict(&self, conflict: &ConflictInfo) -> Option<String> {
        // Implement intelligent code conflict resolution
        match conflict.conflict_type {
            ConflictType::Content => {
                // Try to merge non-overlapping changes
                self.merge_code_changes(conflict)
            },
            ConflictType::AddAdd => {
                // Both sides added the same file - check if content is similar
                self.resolve_duplicate_additions(conflict)
            },
            _ => None,
        }
    }

    fn confidence(&self) -> f64 {
        0.8 // High confidence for code merging
    }

    fn name(&self) -> &str {
        "CodeConflictHandler"
    }
}

impl CodeConflictHandler {
    fn merge_code_changes(&self, conflict: &ConflictInfo) -> Option<String> {
        // Simplified implementation - in reality would use AST parsing
        for section in &conflict.conflicts {
            if section.auto_resolve_confidence > 0.9 {
                // High confidence - try to merge
                if let Some(base) = &section.base {
                    return Some(self.three_way_merge(&section.ours, &section.theirs, base));
                }
            }
        }
        None
    }

    fn resolve_duplicate_additions(&self, _conflict: &ConflictInfo) -> Option<String> {
        // Check if files are identical or can be merged
        None // Simplified for now
    }

    fn three_way_merge(&self, ours: &str, theirs: &str, base: &str) -> String {
        // Simplified three-way merge implementation
        let our_lines: Vec<&str> = ours.lines().collect();
        let their_lines: Vec<&str> = theirs.lines().collect();
        let base_lines: Vec<&str> = base.lines().collect();

        let mut result = Vec::new();
        
        // Simple line-by-line merge
        let max_len = our_lines.len().max(their_lines.len()).max(base_lines.len());
        
        for i in 0..max_len {
            let our_line = our_lines.get(i).unwrap_or(&"");
            let their_line = their_lines.get(i).unwrap_or(&"");
            let base_line = base_lines.get(i).unwrap_or(&"");

            if our_line == their_line {
                // No conflict
                result.push(our_line.to_string());
            } else if our_line == base_line {
                // We didn't change, use theirs
                result.push(their_line.to_string());
            } else if their_line == base_line {
                // They didn't change, use ours
                result.push(our_line.to_string());
            } else {
                // Both changed - conflict marker
                result.push(format!("<<<<<<< HEAD"));
                result.push(our_line.to_string());
                result.push(format!("======="));
                result.push(their_line.to_string());
                result.push(format!(">>>>>>> merge"));
            }
        }

        result.join("\n")
    }
}

/// Handler for documentation conflicts
pub struct DocumentationConflictHandler;

impl ConflictHandler for DocumentationConflictHandler {
    fn resolve_conflict(&self, conflict: &ConflictInfo) -> Option<String> {
        // For documentation, often we can merge by combining sections
        if conflict.file_path.ends_with(".md") || 
           conflict.file_path.ends_with(".txt") ||
           conflict.file_path.ends_with(".rst") {
            self.merge_documentation(conflict)
        } else {
            None
        }
    }

    fn confidence(&self) -> f64 {
        0.7 // Good confidence for documentation
    }

    fn name(&self) -> &str {
        "DocumentationConflictHandler"
    }
}

impl DocumentationConflictHandler {
    fn merge_documentation(&self, conflict: &ConflictInfo) -> Option<String> {
        // Try to merge documentation by combining sections
        for section in &conflict.conflicts {
            if section.ours.trim().is_empty() {
                return Some(section.theirs.clone());
            }
            if section.theirs.trim().is_empty() {
                return Some(section.ours.clone());
            }
            
            // If both have content, combine them
            if !section.ours.contains(&section.theirs) && !section.theirs.contains(&section.ours) {
                return Some(format!("{}\n\n{}", section.ours, section.theirs));
            }
        }
        None
    }
}

impl MergeEngine {
    /// Create a new merge engine
    pub fn new(workspace_root: PathBuf, strategy: MergeStrategy) -> Self {
        let mut engine = Self {
            workspace_root,
            strategy,
            conflict_handlers: Vec::new(),
        };

        // Register default conflict handlers
        engine.conflict_handlers.push(Box::new(CodeConflictHandler));
        engine.conflict_handlers.push(Box::new(DocumentationConflictHandler));

        engine
    }

    /// Add a custom conflict handler
    pub fn add_conflict_handler(&mut self, handler: Box<dyn ConflictHandler>) {
        self.conflict_handlers.push(handler);
    }

    /// Perform a merge operation
    pub fn merge(
        &self,
        current_tree: &FileTree,
        merge_tree: &FileTree,
        base_tree: Option<&FileTree>,
    ) -> Result<MergeResult> {
        let start_time = std::time::Instant::now();
        
        let mut merged_files = Vec::new();
        let mut conflicted_files = Vec::new();
        let mut lines_merged = 0;
        let mut lines_conflicted = 0;

        // Get all files that need to be processed
        let all_files = self.get_all_files(current_tree, merge_tree, base_tree.as_ref())?;

        for file_path in all_files {
            match self.merge_file(&file_path, current_tree, merge_tree, base_tree.as_ref())? {
                FileMergeResult::Success(lines) => {
                    merged_files.push(file_path);
                    lines_merged += lines;
                },
                FileMergeResult::Conflict(conflict_info) => {
                    lines_conflicted += conflict_info.conflicts.iter()
                        .map(|c| c.line_range.1 - c.line_range.0)
                        .sum::<usize>();
                    conflicted_files.push(conflict_info);
                },
            }
        }

        let duration_ms = start_time.elapsed().as_millis() as u64;

        Ok(MergeResult {
            success: conflicted_files.is_empty(),
            merged_files,
            conflicted_files,
            strategy_used: format!("{:?}", self.strategy),
            stats: MergeStats {
                files_processed: all_files.len(),
                auto_merged: merged_files.len(),
                conflicts: conflicted_files.len(),
                duration_ms,
                lines_merged,
                lines_conflicted,
            },
        })
    }

    /// Merge a single file
    fn merge_file(
        &self,
        file_path: &str,
        current_tree: &FileTree,
        merge_tree: &FileTree,
        base_tree: Option<&FileTree>,
    ) -> Result<FileMergeResult> {
        let current_content = current_tree.get_file_content(file_path);
        let merge_content = merge_tree.get_file_content(file_path);
        let base_content = base_tree.and_then(|tree| tree.get_file_content(file_path));

        match (&current_content, &merge_content, &base_content) {
            (Some(current), Some(merge), Some(base)) => {
                // Three-way merge
                self.three_way_merge_file(file_path, current, merge, base)
            },
            (Some(current), Some(merge), None) => {
                // Both added the file
                if current == merge {
                    Ok(FileMergeResult::Success(current.lines().count()))
                } else {
                    self.handle_add_add_conflict(file_path, current, merge)
                }
            },
            (Some(_), None, Some(_)) => {
                // They deleted, we modified
                self.handle_delete_modify_conflict(file_path, true)
            },
            (None, Some(_), Some(_)) => {
                // We deleted, they modified
                self.handle_delete_modify_conflict(file_path, false)
            },
            (Some(content), None, None) => {
                // Only we have the file
                Ok(FileMergeResult::Success(content.lines().count()))
            },
            (None, Some(content), None) => {
                // Only they have the file
                Ok(FileMergeResult::Success(content.lines().count()))
            },
            (None, None, _) => {
                // File doesn't exist in either - shouldn't happen
                Ok(FileMergeResult::Success(0))
            },
        }
    }

    fn three_way_merge_file(
        &self,
        file_path: &str,
        current: &str,
        merge: &str,
        base: &str,
    ) -> Result<FileMergeResult> {
        if current == merge {
            // No changes needed
            return Ok(FileMergeResult::Success(current.lines().count()));
        }

        // Detect conflicts
        let conflicts = self.detect_conflicts(current, merge, base)?;
        
        if conflicts.is_empty() {
            // Can be auto-merged
            let merged_content = self.auto_merge(current, merge, base)?;
            Ok(FileMergeResult::Success(merged_content.lines().count()))
        } else {
            // Has conflicts - try to resolve with handlers
            let conflict_info = ConflictInfo {
                file_path: file_path.to_string(),
                conflict_type: ConflictType::Content,
                conflicts,
                suggested_resolution: self.try_auto_resolve(file_path, current, merge, base),
            };

            Ok(FileMergeResult::Conflict(conflict_info))
        }
    }

    fn detect_conflicts(&self, current: &str, merge: &str, base: &str) -> Result<Vec<ConflictSection>> {
        let current_lines: Vec<&str> = current.lines().collect();
        let merge_lines: Vec<&str> = merge.lines().collect();
        let base_lines: Vec<&str> = base.lines().collect();

        let mut conflicts = Vec::new();
        let mut line_num = 0;

        while line_num < current_lines.len().max(merge_lines.len()).max(base_lines.len()) {
            let current_line = current_lines.get(line_num).unwrap_or(&"");
            let merge_line = merge_lines.get(line_num).unwrap_or(&"");
            let base_line = base_lines.get(line_num).unwrap_or(&"");

            if current_line != merge_line && 
               current_line != base_line && 
               merge_line != base_line {
                // This is a conflict
                let start_line = line_num;
                let mut end_line = line_num + 1;

                // Extend conflict region
                while end_line < current_lines.len().max(merge_lines.len()) {
                    let next_current = current_lines.get(end_line).unwrap_or(&"");
                    let next_merge = merge_lines.get(end_line).unwrap_or(&"");
                    
                    if next_current == next_merge {
                        break;
                    }
                    end_line += 1;
                }

                let conflict_current = current_lines[start_line..end_line.min(current_lines.len())].join("\n");
                let conflict_merge = merge_lines[start_line..end_line.min(merge_lines.len())].join("\n");
                let conflict_base = if start_line < base_lines.len() {
                    Some(base_lines[start_line..end_line.min(base_lines.len())].join("\n"))
                } else {
                    None
                };

                conflicts.push(ConflictSection {
                    line_range: (start_line, end_line),
                    ours: conflict_current,
                    theirs: conflict_merge,
                    base: conflict_base,
                    auto_resolve_confidence: self.calculate_auto_resolve_confidence(
                        &conflict_current, &conflict_merge, conflict_base.as_ref()
                    ),
                });

                line_num = end_line;
            } else {
                line_num += 1;
            }
        }

        Ok(conflicts)
    }

    fn calculate_auto_resolve_confidence(&self, ours: &str, theirs: &str, base: Option<&str>) -> f64 {
        // Simple heuristic - more sophisticated AI would be used in practice
        if ours.is_empty() || theirs.is_empty() {
            return 0.9; // High confidence for one-sided changes
        }

        if let Some(base_content) = base {
            if ours == base_content {
                return 0.95; // We didn't change, use theirs
            }
            if theirs == base_content {
                return 0.95; // They didn't change, use ours
            }
        }

        // Check similarity
        let similarity = self.calculate_similarity(ours, theirs);
        if similarity > 0.8 {
            return 0.7; // High similarity
        }

        0.3 // Low confidence
    }

    fn calculate_similarity(&self, a: &str, b: &str) -> f64 {
        // Simple Jaccard similarity
        let words_a: HashSet<&str> = a.split_whitespace().collect();
        let words_b: HashSet<&str> = b.split_whitespace().collect();
        
        let intersection = words_a.intersection(&words_b).count();
        let union = words_a.union(&words_b).count();
        
        if union == 0 {
            return 1.0;
        }
        
        intersection as f64 / union as f64
    }

    fn auto_merge(&self, current: &str, merge: &str, base: &str) -> Result<String> {
        // Simplified auto-merge implementation
        let current_lines: Vec<&str> = current.lines().collect();
        let merge_lines: Vec<&str> = merge.lines().collect();
        let base_lines: Vec<&str> = base.lines().collect();

        let mut result = Vec::new();
        let max_lines = current_lines.len().max(merge_lines.len()).max(base_lines.len());

        for i in 0..max_lines {
            let current_line = current_lines.get(i).unwrap_or(&"");
            let merge_line = merge_lines.get(i).unwrap_or(&"");
            let base_line = base_lines.get(i).unwrap_or(&"");

            if current_line == merge_line {
                result.push(current_line.to_string());
            } else if current_line == base_line {
                result.push(merge_line.to_string());
            } else if merge_line == base_line {
                result.push(current_line.to_string());
            } else {
                // This shouldn't happen in auto-merge
                result.push(current_line.to_string());
            }
        }

        Ok(result.join("\n"))
    }

    fn try_auto_resolve(&self, file_path: &str, current: &str, merge: &str, base: &str) -> Option<String> {
        let conflict_info = ConflictInfo {
            file_path: file_path.to_string(),
            conflict_type: ConflictType::Content,
            conflicts: vec![], // Simplified
            suggested_resolution: None,
        };

        for handler in &self.conflict_handlers {
            if let Some(resolution) = handler.resolve_conflict(&conflict_info) {
                return Some(resolution);
            }
        }

        None
    }

    fn handle_add_add_conflict(&self, file_path: &str, current: &str, merge: &str) -> Result<FileMergeResult> {
        let conflict_info = ConflictInfo {
            file_path: file_path.to_string(),
            conflict_type: ConflictType::AddAdd,
            conflicts: vec![ConflictSection {
                line_range: (0, current.lines().count().max(merge.lines().count())),
                ours: current.to_string(),
                theirs: merge.to_string(),
                base: None,
                auto_resolve_confidence: 0.5,
            }],
            suggested_resolution: None,
        };

        Ok(FileMergeResult::Conflict(conflict_info))
    }

    fn handle_delete_modify_conflict(&self, file_path: &str, we_modified: bool) -> Result<FileMergeResult> {
        let conflict_info = ConflictInfo {
            file_path: file_path.to_string(),
            conflict_type: ConflictType::DeleteModify,
            conflicts: vec![],
            suggested_resolution: if we_modified {
                Some("Keep the modified version".to_string())
            } else {
                Some("Delete the file".to_string())
            },
        };

        Ok(FileMergeResult::Conflict(conflict_info))
    }

    fn get_all_files(
        &self,
        current_tree: &FileTree,
        merge_tree: &FileTree,
        base_tree: Option<&FileTree>,
    ) -> Result<Vec<String>> {
        let mut all_files = HashSet::new();
        
        all_files.extend(current_tree.list_files()?);
        all_files.extend(merge_tree.list_files()?);
        
        if let Some(base) = base_tree {
            all_files.extend(base.list_files()?);
        }

        Ok(all_files.into_iter().collect())
    }
}

#[derive(Debug)]
enum FileMergeResult {
    Success(usize), // Number of lines
    Conflict(ConflictInfo),
}

/// Simplified file tree interface for merging
pub trait FileTree {
    fn get_file_content(&self, path: &str) -> Option<String>;
    fn list_files(&self) -> Result<Vec<String>>;
}

/// Implementation for actual file system
pub struct FsFileTree {
    root: PathBuf,
}

impl FsFileTree {
    pub fn new(root: PathBuf) -> Self {
        Self { root }
    }
}

impl FileTree for FsFileTree {
    fn get_file_content(&self, path: &str) -> Option<String> {
        let full_path = self.root.join(path);
        std::fs::read_to_string(full_path).ok()
    }

    fn list_files(&self) -> Result<Vec<String>> {
        let mut files = Vec::new();
        self.walk_dir(&self.root, &mut files, "")?;
        Ok(files)
    }
}

impl FsFileTree {
    fn walk_dir(&self, dir: &Path, files: &mut Vec<String>, prefix: &str) -> Result<()> {
        for entry in std::fs::read_dir(dir)? {
            let entry = entry?;
            let path = entry.path();
            let name = entry.file_name().to_string_lossy();
            let full_name = if prefix.is_empty() {
                name.to_string()
            } else {
                format!("{}/{}", prefix, name)
            };

            if path.is_dir() && name != ".rune" {
                self.walk_dir(&path, files, &full_name)?;
            } else if path.is_file() {
                files.push(full_name);
            }
        }
        Ok(())
    }
}
