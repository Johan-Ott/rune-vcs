/**
 * Domain Interfaces (Ports)
 * 
 * These interfaces define contracts that must be implemented by infrastructure
 * and application layers. They represent the "ports" in hexagonal architecture.
 */

import { 
  FileSystemItem, 
  Repository, 
  Commit, 
  FileChange,
  DomainEvent 
} from './models';

// ============================================================================
// File System Interfaces
// ============================================================================

export interface IFileSystemService {
  /**
   * Read directory contents
   */
  readDirectory(path: string): Promise<FileSystemItem[]>;
  
  /**
   * Get current working directory
   */
  getCurrentDirectory(): Promise<string>;
  
  /**
   * Navigate to directory
   */
  navigateToDirectory(path: string): Promise<FileSystemItem[]>;
  
  /**
   * Create new file
   */
  createFile(path: string, content?: string): Promise<FileSystemItem>;
  
  /**
   * Create new directory
   */
  createDirectory(path: string): Promise<FileSystemItem>;
  
  /**
   * Delete file or directory
   */
  deleteItem(path: string): Promise<void>;
  
  /**
   * Rename file or directory
   */
  renameItem(oldPath: string, newPath: string): Promise<FileSystemItem>;
  
  /**
   * Copy file or directory
   */
  copyItem(sourcePath: string, destinationPath: string): Promise<FileSystemItem>;
  
  /**
   * Move file or directory
   */
  moveItem(sourcePath: string, destinationPath: string): Promise<FileSystemItem>;
  
  /**
   * Check if path exists
   */
  exists(path: string): Promise<boolean>;
  
  /**
   * Get file/directory info
   */
  getItemInfo(path: string): Promise<FileSystemItem>;
  
  /**
   * Watch directory for changes
   */
  watchDirectory(path: string, callback: (event: any) => void): Promise<() => void>;
}

// ============================================================================
// VCS Interfaces  
// ============================================================================

export interface IVCSService {
  /**
   * Initialize repository
   */
  initRepository(path: string): Promise<Repository>;
  
  /**
   * Open existing repository
   */
  openRepository(path: string): Promise<Repository>;
  
  /**
   * Get repository status
   */
  getStatus(repositoryPath: string): Promise<Repository>;
  
  /**
   * Get commit history
   */
  getCommitHistory(repositoryPath: string, limit?: number): Promise<Commit[]>;
  
  /**
   * Create commit
   */
  commit(repositoryPath: string, message: string, files?: string[]): Promise<Commit>;
  
  /**
   * Get file changes
   */
  getChanges(repositoryPath: string): Promise<FileChange[]>;
  
  /**
   * Stage files
   */
  stageFiles(repositoryPath: string, files: string[]): Promise<void>;
  
  /**
   * Unstage files
   */
  unstageFiles(repositoryPath: string, files: string[]): Promise<void>;
  
  /**
   * Create branch
   */
  createBranch(repositoryPath: string, branchName: string): Promise<void>;
  
  /**
   * Switch branch
   */
  switchBranch(repositoryPath: string, branchName: string): Promise<void>;
  
  /**
   * Merge branch
   */
  mergeBranch(repositoryPath: string, branchName: string): Promise<void>;
  
  /**
   * Push changes
   */
  push(repositoryPath: string, remote?: string, branch?: string): Promise<void>;
  
  /**
   * Pull changes
   */
  pull(repositoryPath: string, remote?: string, branch?: string): Promise<void>;
}

// ============================================================================
// State Management Interfaces
// ============================================================================

export interface IStateStore<T> {
  /**
   * Get current state
   */
  getState(): T;
  
  /**
   * Update state
   */
  setState(newState: Partial<T>): void;
  
  /**
   * Subscribe to state changes
   */
  subscribe(callback: (state: T) => void): () => void;
  
  /**
   * Dispatch action
   */
  dispatch(action: any): void;
}

// ============================================================================
// Event System Interfaces
// ============================================================================

export interface IEventBus {
  /**
   * Publish event
   */
  publish<T extends DomainEvent>(event: T): void;
  
  /**
   * Subscribe to events
   */
  subscribe<T extends DomainEvent>(
    eventType: string, 
    handler: (event: T) => void
  ): () => void;
  
  /**
   * Unsubscribe from events
   */
  unsubscribe(eventType: string, handler: Function): void;
}

// ============================================================================
// External Service Interfaces
// ============================================================================

export interface ITauriService {
  /**
   * Invoke Tauri command
   */
  invoke<T>(command: string, args?: any): Promise<T>;
  
  /**
   * Listen to Tauri events
   */
  listen<T>(event: string, handler: (event: T) => void): Promise<() => void>;
  
  /**
   * Emit Tauri event
   */
  emit(event: string, payload?: any): Promise<void>;
}

export interface INotificationService {
  /**
   * Show success notification
   */
  success(message: string, title?: string): void;
  
  /**
   * Show error notification
   */
  error(message: string, title?: string): void;
  
  /**
   * Show warning notification
   */
  warning(message: string, title?: string): void;
  
  /**
   * Show info notification
   */
  info(message: string, title?: string): void;
}

export interface IDialogService {
  /**
   * Show confirmation dialog
   */
  confirm(message: string, title?: string): Promise<boolean>;
  
  /**
   * Show file picker dialog
   */
  openFile(options?: any): Promise<string | null>;
  
  /**
   * Show directory picker dialog
   */
  openDirectory(options?: any): Promise<string | null>;
  
  /**
   * Show save dialog
   */
  saveFile(options?: any): Promise<string | null>;
}
