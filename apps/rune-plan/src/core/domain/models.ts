/**
 * Core Domain Models for Rune VCS Visual Client
 * 
 * These models represent the business entities and value objects
 * that are independent of any UI framework or external dependencies.
 */

// ============================================================================
// File System Models
// ============================================================================

export interface FileSystemItem {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'directory';
  size?: number;
  lastModified: Date;
  permissions?: FilePermissions;
  children?: FileSystemItem[];
  isExpanded?: boolean;
}

export interface FilePermissions {
  readable: boolean;
  writable: boolean;
  executable: boolean;
}

export interface Directory extends FileSystemItem {
  type: 'directory';
  children: FileSystemItem[];
}

export interface File extends FileSystemItem {
  type: 'file';
  size: number;
  extension?: string;
  mimeType?: string;
}

// ============================================================================
// VCS Models
// ============================================================================

export interface Repository {
  id: string;
  name: string;
  path: string;
  branch: string;
  status: RepositoryStatus;
  remotes: Remote[];
  commits: Commit[];
  workingDirectory: Directory;
}

export interface Commit {
  hash: string;
  message: string;
  author: Author;
  timestamp: Date;
  changes: FileChange[];
}

export interface Author {
  name: string;
  email: string;
}

export interface Remote {
  name: string;
  url: string;
  type: 'origin' | 'upstream' | 'custom';
}

export interface FileChange {
  path: string;
  type: 'added' | 'modified' | 'deleted' | 'renamed';
  oldPath?: string; // for renames
}

export type RepositoryStatus = 
  | 'clean' 
  | 'dirty' 
  | 'merging' 
  | 'rebasing' 
  | 'conflict';

// ============================================================================
// UI State Models
// ============================================================================

export interface ViewMode {
  type: 'tree' | 'list' | 'grid' | 'details';
  sortBy: 'name' | 'date' | 'size' | 'type';
  sortDirection: 'asc' | 'desc';
  showHidden: boolean;
}

export interface Selection {
  items: FileSystemItem[];
  primary?: FileSystemItem;
}

export interface NavigationState {
  currentPath: string;
  history: string[];
  historyIndex: number;
  favorites: string[];
  bookmarks: string[];
}

// ============================================================================
// Application State Models
// ============================================================================

export interface ApplicationState {
  theme: 'light' | 'dark' | 'system';
  viewMode: ViewMode;
  navigation: NavigationState;
  selection: Selection;
  repository?: Repository;
  isLoading: boolean;
  error?: string;
}

// ============================================================================
// Command Models
// ============================================================================

export interface Command {
  id: string;
  name: string;
  description: string;
  shortcut?: string;
  category: CommandCategory;
}

export type CommandCategory = 
  | 'file' 
  | 'edit' 
  | 'view' 
  | 'vcs' 
  | 'navigation' 
  | 'tools';

// ============================================================================
// Event Models
// ============================================================================

export interface DomainEvent {
  id: string;
  type: string;
  timestamp: Date;
  payload: any;
}

export interface FileSystemEvent extends DomainEvent {
  type: 'file:created' | 'file:modified' | 'file:deleted' | 'directory:created';
  payload: {
    path: string;
    item?: FileSystemItem;
  };
}

export interface NavigationEvent extends DomainEvent {
  type: 'navigation:changed' | 'navigation:back' | 'navigation:forward';
  payload: {
    from: string;
    to: string;
  };
}

export interface SelectionEvent extends DomainEvent {
  type: 'selection:changed' | 'selection:cleared';
  payload: {
    items: FileSystemItem[];
    action: 'single' | 'multiple' | 'range';
  };
}
