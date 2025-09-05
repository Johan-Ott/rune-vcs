// Core domain types - shared between all layers
export interface Repository {
  id: string;
  name: string;
  path: string;
  branch: string;
  lastCommit: string;
  status: 'clean' | 'modified' | 'ahead' | 'behind';
  remoteUrl?: string;
}

export interface File {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  size?: number;
  modified: string;
  status?: 'modified' | 'added' | 'deleted' | 'untracked' | 'staged';
  extension?: string;
  isExpanded?: boolean; // UI-specific property
  children?: File[];    // UI-specific property
}

export interface AppState {
  // Repository state
  currentRepository?: Repository;
  repositories: Repository[];
  
  // File explorer state
  currentPath: string;
  files: File[];
  selectedFiles: string[];
  
  // UI state
  viewMode: 'tree' | 'list' | 'grid' | 'details';
  isDark: boolean;
  sidebarExpanded: boolean;
  
  // Loading states
  isLoading: boolean;
  error?: string;
}

export type AppAction = 
  | { type: 'SET_REPOSITORY'; repository: Repository }
  | { type: 'SET_FILES'; files: File[] }
  | { type: 'SET_CURRENT_PATH'; path: string }
  | { type: 'SELECT_FILE'; fileId: string }
  | { type: 'TOGGLE_FILE_SELECTION'; fileId: string }
  | { type: 'SET_VIEW_MODE'; mode: AppState['viewMode'] }
  | { type: 'TOGGLE_THEME' }
  | { type: 'SET_LOADING'; loading: boolean }
  | { type: 'SET_ERROR'; error: string | undefined };
