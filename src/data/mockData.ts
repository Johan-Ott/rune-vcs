// Mock data for the Nordic File Explorer VCS application
// This file contains all mock data that can easily be replaced with real API calls

export interface MockRepository {
  id: string;
  name: string;
  path: string;
  branch: string;
  lastCommit: string;
  status: 'clean' | 'modified' | 'ahead' | 'behind';
  remoteUrl?: string;
}

export interface MockFile {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  size?: number;
  modified: string;
  status?: 'modified' | 'added' | 'deleted' | 'untracked' | 'staged';
  extension?: string;
  content?: string;
}

export interface MockCommit {
  id: string;
  hash: string;
  message: string;
  author: string;
  date: string;
  branch: string;
  files: string[];
}

export interface MockBranch {
  id: string;
  name: string;
  isActive: boolean;
  lastCommit: string;
  ahead: number;
  behind: number;
  isRemote?: boolean;
}

export interface MockChangelist {
  id: string;
  name: string;
  description: string;
  files: MockFile[];
  author: string;
  created: string;
  status: 'pending' | 'submitted' | 'shelved';
}

// Mock Repositories
export const mockRepositories: MockRepository[] = [
  {
    id: 'repo-1',
    name: 'nordic-explorer',
    path: '/home/repositories/nordic-explorer',
    branch: 'main',
    lastCommit: '2 hours ago',
    status: 'modified',
    remoteUrl: 'https://github.com/nordic/explorer.git'
  },
  {
    id: 'repo-2',
    name: 'design-system',
    path: '/home/repositories/design-system',
    branch: 'feature/glassmorphism',
    lastCommit: '1 day ago',
    status: 'ahead',
    remoteUrl: 'https://github.com/nordic/design-system.git'
  },
  {
    id: 'repo-3',
    name: 'vcs-client',
    path: '/home/repositories/vcs-client',
    branch: 'develop',
    lastCommit: '3 days ago',
    status: 'clean'
  }
];

// Mock Files
export const mockFiles: MockFile[] = [
  {
    id: 'file-1',
    name: 'App.tsx',
    path: '/src/App.tsx',
    type: 'file',
    size: 15420,
    modified: '2024-01-15 14:30',
    status: 'modified',
    extension: 'tsx',
    content: 'import React from "react"...'
  },
  {
    id: 'file-2',
    name: 'components',
    path: '/src/components',
    type: 'folder',
    modified: '2024-01-15 12:15'
  },
  {
    id: 'file-3',
    name: 'Header.tsx',
    path: '/src/components/Header.tsx',
    type: 'file',
    size: 8920,
    modified: '2024-01-15 10:45',
    status: 'staged',
    extension: 'tsx'
  },
  {
    id: 'file-4',
    name: 'newFile.ts',
    path: '/src/utils/newFile.ts',
    type: 'file',
    size: 1250,
    modified: '2024-01-15 16:00',
    status: 'untracked',
    extension: 'ts'
  }
];

// Mock Commits
export const mockCommits: MockCommit[] = [
  {
    id: 'commit-1',
    hash: 'a1b2c3d4',
    message: 'feat: Add glassmorphism effects to sidebar components',
    author: 'Nordic Developer',
    date: '2024-01-15 14:30',
    branch: 'main',
    files: ['App.tsx', 'Sidebar.tsx', 'globals.css']
  },
  {
    id: 'commit-2',
    hash: 'e5f6g7h8',
    message: 'fix: Resolve tooltip z-index conflicts in sidebar',
    author: 'Nordic Developer',
    date: '2024-01-15 12:15',
    branch: 'main',
    files: ['tooltip.tsx', 'globals.css']
  },
  {
    id: 'commit-3',
    hash: 'i9j0k1l2',
    message: 'refactor: Improve VCS file explorer performance',
    author: 'Team Lead',
    date: '2024-01-14 16:45',
    branch: 'main',
    files: ['VCSFileExplorer.tsx', 'useVCS.ts']
  }
];

// Mock Branches
export const mockBranches: MockBranch[] = [
  {
    id: 'branch-1',
    name: 'main',
    isActive: true,
    lastCommit: '2 hours ago',
    ahead: 0,
    behind: 0
  },
  {
    id: 'branch-2',
    name: 'feature/glassmorphism',
    isActive: false,
    lastCommit: '1 day ago',
    ahead: 3,
    behind: 1
  },
  {
    id: 'branch-3',
    name: 'hotfix/tooltip-fix',
    isActive: false,
    lastCommit: '3 days ago',
    ahead: 1,
    behind: 5
  },
  {
    id: 'branch-4',
    name: 'origin/main',
    isActive: false,
    lastCommit: '2 hours ago',
    ahead: 0,
    behind: 0,
    isRemote: true
  }
];

// Mock Changelists (for Perforce-style workflow)
export const mockChangelists: MockChangelist[] = [
  {
    id: 'cl-1',
    name: 'Glassmorphism Updates',
    description: 'Implementing Nordic Aurora glassmorphism design system across all components',
    files: [mockFiles[0], mockFiles[2]],
    author: 'Nordic Developer',
    created: '2024-01-15 14:00',
    status: 'pending'
  },
  {
    id: 'cl-2',
    name: 'Performance Improvements',
    description: 'Optimizing VCS operations and file loading performance',
    files: [mockFiles[3]],
    author: 'Performance Team',
    created: '2024-01-15 09:30',
    status: 'submitted'
  }
];

// Mock workspace data
export const mockWorkspaces = [
  {
    id: 'ws-1',
    name: 'Nordic Explorer Workspace',
    path: '/workspaces/nordic-explorer',
    repositories: ['repo-1', 'repo-2'],
    activeRepository: 'repo-1',
    lastAccessed: '2024-01-15 16:00'
  },
  {
    id: 'ws-2',
    name: 'Design System Workspace',
    path: '/workspaces/design-system',
    repositories: ['repo-2'],
    activeRepository: 'repo-2',
    lastAccessed: '2024-01-14 14:30'
  }
];

// Mock user preferences
export const mockUserPreferences = {
  theme: 'dark',
  defaultBranch: 'main',
  autoFetch: true,
  showHiddenFiles: false,
  diffTool: 'builtin',
  mergeTool: 'builtin',
  notifications: {
    commits: true,
    pulls: true,
    mentions: true
  }
};

// Mock recent activities
export const mockRecentActivities = [
  {
    id: 'activity-1',
    type: 'commit',
    message: 'Committed changes to main branch',
    timestamp: '2024-01-15 14:30',
    repository: 'nordic-explorer'
  },
  {
    id: 'activity-2',
    type: 'branch',
    message: 'Created new branch feature/glassmorphism',
    timestamp: '2024-01-15 12:00',
    repository: 'design-system'
  },
  {
    id: 'activity-3',
    type: 'merge',
    message: 'Merged hotfix/tooltip-fix into main',
    timestamp: '2024-01-14 16:15',
    repository: 'nordic-explorer'
  }
];