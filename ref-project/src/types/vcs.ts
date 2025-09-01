export interface VCSFile {
  path: string;
  name: string;
  status: 'modified' | 'added' | 'deleted' | 'untracked' | 'staged' | 'unmodified';
  diff?: string;
  size?: number;
  lastModified?: Date;
}

export interface VCSCommit {
  hash: string;
  message: string;
  author: string;
  date: Date;
  files: string[];
}

export interface VCSBranch {
  name: string;
  current: boolean;
  ahead: number;
  behind: number;
  lastCommit?: VCSCommit;
}

export interface VCSStash {
  id: string;
  message: string;
  branch: string;
  date: Date;
  files: string[];
}

export interface Changelist {
  id: string;
  name: string;
  description?: string;
  files: VCSFile[];
  isDefault: boolean;
  isStashed: boolean;
  author: string;
  lastModified: Date;
  color?: string;
}

export interface VCSState {
  branch: VCSBranch;
  branches: VCSBranch[];
  files: VCSFile[];
  staged: VCSFile[];
  commits: VCSCommit[];
  stashes: VCSStash[];
  changelists: Changelist[];
  hasChangesToPush: boolean;
  hasChangesToPull: boolean;
}

export interface Plan {
  id: string;
  title: string;
  description: string;
  status: 'todo' | 'in-progress' | 'done';
  priority: 'low' | 'medium' | 'high';
  assignee?: string;
  dueDate?: Date;
  tasks: Task[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Task {
  id: string;
  title: string;
  completed: boolean;
  description?: string;
  createdAt: Date;
}