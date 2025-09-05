// Core type definitions matching Rust structs

export interface FileInfo {
  path: string;
  name: string;
  is_directory: boolean;
  size?: number;
  modified?: string;
  file_type: 'file' | 'directory';
}

export interface VCSStatus {
  current_branch: string;
  modified_files: string[];
  staged_files: string[];
  untracked_files: string[];
  ahead: number;
  behind: number;
  status: 'clean' | 'modified' | 'added' | 'deleted' | 'untracked' | 'staged' | 'conflicted';
}

// Additional type definitions for the API

export interface TaskItem {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  created_at: string;
  updated_at: string;
  assignee?: string;
  priority?: 'low' | 'medium' | 'high';
  labels?: string[];
}

export interface BranchInfo {
  name: string;
  is_current: boolean;
  commit_hash: string;
  commit_message: string;
  author: string;
  date: string;
}

export interface CommitInfo {
  hash: string;
  message: string;
  author: string;
  date: string;
  files_changed: number;
}

export interface FileChange {
  path: string;
  status: 'added' | 'modified' | 'deleted' | 'renamed';
  additions?: number;
  deletions?: number;
}

export interface DiffResult {
  file_path: string;
  old_content: string;
  new_content: string;
  hunks: DiffHunk[];
}

export interface DiffHunk {
  old_start: number;
  old_lines: number;
  new_start: number;
  new_lines: number;
  lines: DiffLine[];
}

export interface DiffLine {
  type: 'context' | 'addition' | 'deletion';
  content: string;
  old_line?: number;
  new_line?: number;
}

// API Response types
export interface APIResponse<T> {
  data: T;
  success: boolean;
  error?: string;
}

// App-specific configuration types
export interface AppConfig {
  theme: 'light' | 'dark' | 'auto';
  font_size: number;
  auto_save: boolean;
  show_hidden_files: boolean;
}

export interface PlanningConfig extends AppConfig {
  default_priority: 'low' | 'medium' | 'high';
  auto_assign: boolean;
  notification_enabled: boolean;
}

export interface SourceControlConfig extends AppConfig {
  show_line_numbers: boolean;
  wrap_lines: boolean;
  diff_context_lines: number;
  auto_stage_on_commit: boolean;
}
