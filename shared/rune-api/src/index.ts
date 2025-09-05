import { invoke } from '@tauri-apps/api/core';

// Types matching our Rust structs
export interface FileInfo {
  path: string;
  name: string;
  is_directory: boolean;
  size?: number;
  modified?: string;
}

export interface VCSStatus {
  current_branch: string;
  modified_files: string[];
  staged_files: string[];
  untracked_files: string[];
  ahead: number;
  behind: number;
}

// File System API Bridge
export class FileSystemAPI {
  static async getFileInfo(path: string): Promise<FileInfo> {
    return invoke('get_file_info', { path });
  }

  static async listDirectory(path: string): Promise<FileInfo[]> {
    return invoke('list_directory', { path });
  }

  static async openExternal(path: string): Promise<void> {
    return invoke('open_external', { path });
  }
}

// VCS API Bridge
export class VCSAPI {
  static async getStatus(repoPath: string): Promise<VCSStatus> {
    return invoke('get_vcs_status', { repoPath });
  }

  static async getCurrentBranch(repoPath: string): Promise<string> {
    const status = await this.getStatus(repoPath);
    return status.current_branch;
  }

  static async getModifiedFiles(repoPath: string): Promise<string[]> {
    const status = await this.getStatus(repoPath);
    return status.modified_files;
  }
}

// Planning API Bridge (for rune-plan specific features)
export class PlanningAPI {
  static async createTask(title: string, description: string): Promise<string> {
    return invoke('create_task', { title, description });
  }

  static async listTasks(): Promise<any[]> {
    return invoke('list_tasks');
  }

  static async updateTask(id: string, updates: any): Promise<void> {
    return invoke('update_task', { id, updates });
  }
}

// Source Control API Bridge (for rune-source specific features)
export class SourceControlAPI {
  static async commitFiles(message: string, files: string[]): Promise<void> {
    return invoke('commit_files', { message, files });
  }

  static async stageFiles(files: string[]): Promise<void> {
    return invoke('stage_files', { files });
  }

  static async unstageFiles(files: string[]): Promise<void> {
    return invoke('unstage_files', { files });
  }

  static async createBranch(name: string): Promise<void> {
    return invoke('create_branch', { name });
  }

  static async switchBranch(name: string): Promise<void> {
    return invoke('switch_branch', { name });
  }
}

// Unified Rune API - main export
export class RuneAPI {
  static fileSystem = FileSystemAPI;
  static vcs = VCSAPI;
  static planning = PlanningAPI;
  static sourceControl = SourceControlAPI;
}

// Hooks for React apps
export * from './hooks';
export * from './types';
