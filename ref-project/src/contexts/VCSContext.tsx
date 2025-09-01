// VCS Context - Manages version control state and operations
// Uses the VCS service layer for all operations, making it easy to switch backends

import React, { createContext, useContext, useReducer, useCallback, ReactNode } from 'react';
import { vcsService, VCSOperation, CommitOptions, BranchOptions, MergeOptions } from '../services/vcsService';
import { MockRepository, MockFile, MockCommit, MockBranch, MockChangelist } from '../data/mockData';
import { useApp } from './AppContext';

// VCS State
export interface VCSState {
  repositories: MockRepository[];
  currentRepository: MockRepository | null;
  files: MockFile[];
  commits: MockCommit[];
  branches: MockBranch[];
  changelists: MockChangelist[];
  selectedFiles: string[];
  searchQuery: string;
  viewMode: 'list' | 'grid' | 'tree';
  sortBy: 'name' | 'date' | 'size' | 'status';
  sortOrder: 'asc' | 'desc';
  showHiddenFiles: boolean;
  isOperationInProgress: boolean;
  lastOperation: VCSOperation | null;
}

// Action types
type VCSAction =
  | { type: 'SET_REPOSITORIES'; payload: MockRepository[] }
  | { type: 'SET_CURRENT_REPOSITORY'; payload: MockRepository | null }
  | { type: 'SET_FILES'; payload: MockFile[] }
  | { type: 'SET_COMMITS'; payload: MockCommit[] }
  | { type: 'SET_BRANCHES'; payload: MockBranch[] }
  | { type: 'SET_CHANGELISTS'; payload: MockChangelist[] }
  | { type: 'UPDATE_FILE'; payload: { path: string; updates: Partial<MockFile> } }
  | { type: 'SET_SELECTED_FILES'; payload: string[] }
  | { type: 'ADD_SELECTED_FILE'; payload: string }
  | { type: 'REMOVE_SELECTED_FILE'; payload: string }
  | { type: 'CLEAR_SELECTED_FILES' }
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_VIEW_MODE'; payload: 'list' | 'grid' | 'tree' }
  | { type: 'SET_SORT'; payload: { by: 'name' | 'date' | 'size' | 'status'; order: 'asc' | 'desc' } }
  | { type: 'SET_SHOW_HIDDEN_FILES'; payload: boolean }
  | { type: 'SET_OPERATION_IN_PROGRESS'; payload: boolean }
  | { type: 'SET_LAST_OPERATION'; payload: VCSOperation | null };

// Initial state
const initialState: VCSState = {
  repositories: [],
  currentRepository: null,
  files: [],
  commits: [],
  branches: [],
  changelists: [],
  selectedFiles: [],
  searchQuery: '',
  viewMode: 'list',
  sortBy: 'name',
  sortOrder: 'asc',
  showHiddenFiles: false,
  isOperationInProgress: false,
  lastOperation: null
};

// Reducer
function vcsReducer(state: VCSState, action: VCSAction): VCSState {
  switch (action.type) {
    case 'SET_REPOSITORIES':
      return { ...state, repositories: action.payload };

    case 'SET_CURRENT_REPOSITORY':
      return { ...state, currentRepository: action.payload };

    case 'SET_FILES':
      return { ...state, files: action.payload };

    case 'SET_COMMITS':
      return { ...state, commits: action.payload };

    case 'SET_BRANCHES':
      return { ...state, branches: action.payload };

    case 'SET_CHANGELISTS':
      return { ...state, changelists: action.payload };

    case 'UPDATE_FILE':
      return {
        ...state,
        files: state.files.map(file =>
          file.path === action.payload.path
            ? { ...file, ...action.payload.updates }
            : file
        )
      };

    case 'SET_SELECTED_FILES':
      return { ...state, selectedFiles: action.payload };

    case 'ADD_SELECTED_FILE':
      return {
        ...state,
        selectedFiles: state.selectedFiles.includes(action.payload)
          ? state.selectedFiles
          : [...state.selectedFiles, action.payload]
      };

    case 'REMOVE_SELECTED_FILE':
      return {
        ...state,
        selectedFiles: state.selectedFiles.filter(path => path !== action.payload)
      };

    case 'CLEAR_SELECTED_FILES':
      return { ...state, selectedFiles: [] };

    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };

    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };

    case 'SET_SORT':
      return { 
        ...state, 
        sortBy: action.payload.by, 
        sortOrder: action.payload.order 
      };

    case 'SET_SHOW_HIDDEN_FILES':
      return { ...state, showHiddenFiles: action.payload };

    case 'SET_OPERATION_IN_PROGRESS':
      return { ...state, isOperationInProgress: action.payload };

    case 'SET_LAST_OPERATION':
      return { ...state, lastOperation: action.payload };

    default:
      return state;
  }
}

// Context interface
interface VCSContextType {
  state: VCSState;
  
  // Repository operations
  loadRepositories: () => Promise<void>;
  setCurrentRepository: (repository: MockRepository) => Promise<void>;
  cloneRepository: (url: string, path: string) => Promise<VCSOperation>;
  
  // File operations
  loadFiles: (path?: string) => Promise<void>;
  stageFile: (filePath: string) => Promise<VCSOperation>;
  unstageFile: (filePath: string) => Promise<VCSOperation>;
  getFileContent: (filePath: string) => Promise<string>;
  getFileHistory: (filePath: string) => Promise<MockCommit[]>;
  
  // Commit operations
  loadCommits: (branch?: string) => Promise<void>;
  commit: (options: CommitOptions) => Promise<VCSOperation>;
  getCommitDiff: (commitHash: string) => Promise<string>;
  
  // Branch operations
  loadBranches: () => Promise<void>;
  createBranch: (options: BranchOptions) => Promise<VCSOperation>;
  switchBranch: (branchName: string) => Promise<VCSOperation>;
  mergeBranch: (options: MergeOptions) => Promise<VCSOperation>;
  deleteBranch: (branchName: string) => Promise<VCSOperation>;
  
  // Changelist operations
  loadChangelists: () => Promise<void>;
  createChangelist: (name: string, description: string) => Promise<VCSOperation>;
  submitChangelist: (changelistId: string) => Promise<VCSOperation>;
  
  // Sync operations
  fetchChanges: () => Promise<VCSOperation>;
  pullChanges: () => Promise<VCSOperation>;
  pushChanges: (branch?: string) => Promise<VCSOperation>;
  
  // UI state operations
  setSelectedFiles: (files: string[]) => void;
  addSelectedFile: (filePath: string) => void;
  removeSelectedFile: (filePath: string) => void;
  clearSelectedFiles: () => void;
  setSearchQuery: (query: string) => void;
  setViewMode: (mode: 'list' | 'grid' | 'tree') => void;
  setSorting: (by: 'name' | 'date' | 'size' | 'status', order: 'asc' | 'desc') => void;
  setShowHiddenFiles: (show: boolean) => void;
  
  // Utility methods
  getRepositoryStatus: () => Promise<any>;
  filteredFiles: MockFile[];
  sortedFiles: MockFile[];
}

const VCSContext = createContext<VCSContextType | undefined>(undefined);

// Provider component
interface VCSProviderProps {
  children: ReactNode;
}

export function VCSProvider({ children }: VCSProviderProps) {
  const [state, dispatch] = useReducer(vcsReducer, initialState);
  const appContext = useApp();
  
  // Defensive programming - ensure context methods are available
  const showNotification = appContext?.showNotification || (() => {});
  const setError = appContext?.setError || (() => {});
  const setLoading = appContext?.setLoading || (() => {});

  // Helper function to handle operations with loading and error states
  const executeOperation = useCallback(async <T,>(
    operation: () => Promise<T>,
    successMessage?: string,
    errorMessage?: string
  ): Promise<T | null> => {
    try {
      dispatch({ type: 'SET_OPERATION_IN_PROGRESS', payload: true });
      setError(null);
      
      const result = await operation();
      
      if (successMessage) {
        showNotification({
          type: 'success',
          message: successMessage
        });
      }
      
      return result;
    } catch (error) {
      const message = errorMessage || 'Operation failed';
      setError(message);
      showNotification({
        type: 'error',
        message: message
      });
      return null;
    } finally {
      dispatch({ type: 'SET_OPERATION_IN_PROGRESS', payload: false });
    }
  }, [showNotification, setError]);

  // Repository operations
  const loadRepositories = useCallback(async () => {
    const repositories = await executeOperation(
      () => vcsService.getRepositories(),
      undefined,
      'Failed to load repositories'
    );
    if (repositories) {
      dispatch({ type: 'SET_REPOSITORIES', payload: repositories });
    }
  }, [executeOperation]);

  const setCurrentRepository = useCallback(async (repository: MockRepository) => {
    dispatch({ type: 'SET_CURRENT_REPOSITORY', payload: repository });
    // Load related data will be handled by the calling component
  }, []);

  const cloneRepository = useCallback(async (url: string, path: string): Promise<VCSOperation> => {
    const result = await executeOperation(
      () => vcsService.cloneRepository(url, path),
      'Repository cloned successfully',
      'Failed to clone repository'
    );
    
    if (result?.success) {
      await loadRepositories();
      dispatch({ type: 'SET_LAST_OPERATION', payload: result });
    }
    
    return result || { success: false, message: 'Operation failed' };
  }, [executeOperation, loadRepositories]);

  // File operations
  const loadFiles = useCallback(async (path?: string) => {
    const currentRepo = state.currentRepository;
    if (!currentRepo) return;
    
    const files = await executeOperation(
      () => vcsService.getFiles(currentRepo.id, path),
      undefined,
      'Failed to load files'
    );
    if (files) {
      dispatch({ type: 'SET_FILES', payload: files });
    }
  }, [state.currentRepository, executeOperation]);

  const stageFile = useCallback(async (filePath: string): Promise<VCSOperation> => {
    const result = await executeOperation(
      () => vcsService.stageFile(filePath),
      `Staged ${filePath}`,
      `Failed to stage ${filePath}`
    );
    
    if (result?.success) {
      dispatch({
        type: 'UPDATE_FILE',
        payload: { path: filePath, updates: { status: 'staged' } }
      });
    }
    
    return result || { success: false, message: 'Operation failed' };
  }, [executeOperation]);

  const unstageFile = useCallback(async (filePath: string): Promise<VCSOperation> => {
    const result = await executeOperation(
      () => vcsService.unstageFile(filePath),
      `Unstaged ${filePath}`,
      `Failed to unstage ${filePath}`
    );
    
    if (result?.success) {
      dispatch({
        type: 'UPDATE_FILE',
        payload: { path: filePath, updates: { status: 'modified' } }
      });
    }
    
    return result || { success: false, message: 'Operation failed' };
  }, [executeOperation]);

  const getFileContent = useCallback(async (filePath: string): Promise<string> => {
    const content = await executeOperation(
      () => vcsService.getFileContent(filePath),
      undefined,
      'Failed to load file content'
    );
    return content || '';
  }, [executeOperation]);

  const getFileHistory = useCallback(async (filePath: string): Promise<MockCommit[]> => {
    const history = await executeOperation(
      () => vcsService.getFileHistory(filePath),
      undefined,
      'Failed to load file history'
    );
    return history || [];
  }, [executeOperation]);

  // Commit operations
  const loadCommits = useCallback(async (branch?: string) => {
    const currentRepo = state.currentRepository;
    if (!currentRepo) return;
    
    const commits = await executeOperation(
      () => vcsService.getCommits(currentRepo.id, branch),
      undefined,
      'Failed to load commits'
    );
    if (commits) {
      dispatch({ type: 'SET_COMMITS', payload: commits });
    }
  }, [state.currentRepository, executeOperation]);

  const commit = useCallback(async (options: CommitOptions): Promise<VCSOperation> => {
    const result = await executeOperation(
      () => vcsService.commit(options),
      'Changes committed successfully',
      'Failed to commit changes'
    );
    
    if (result?.success && state.currentRepository) {
      // Reload data after successful commit
      const [commits, files] = await Promise.all([
        vcsService.getCommits(state.currentRepository.id),
        vcsService.getFiles(state.currentRepository.id)
      ]);
      
      dispatch({ type: 'SET_COMMITS', payload: commits });
      dispatch({ type: 'SET_FILES', payload: files });
      dispatch({ type: 'CLEAR_SELECTED_FILES' });
    }
    
    return result || { success: false, message: 'Operation failed' };
  }, [executeOperation, state.currentRepository]);

  const getCommitDiff = useCallback(async (commitHash: string): Promise<string> => {
    const diff = await executeOperation(
      () => vcsService.getCommitDiff(commitHash),
      undefined,
      'Failed to load commit diff'
    );
    return diff || '';
  }, [executeOperation]);

  // Branch operations
  const loadBranches = useCallback(async () => {
    const currentRepo = state.currentRepository;
    if (!currentRepo) return;
    
    const branches = await executeOperation(
      () => vcsService.getBranches(currentRepo.id),
      undefined,
      'Failed to load branches'
    );
    if (branches) {
      dispatch({ type: 'SET_BRANCHES', payload: branches });
    }
  }, [state.currentRepository, executeOperation]);

  const createBranch = useCallback(async (options: BranchOptions): Promise<VCSOperation> => {
    const result = await executeOperation(
      () => vcsService.createBranch(options),
      `Branch '${options.name}' created successfully`,
      `Failed to create branch '${options.name}'`
    );
    
    if (result?.success && state.currentRepository) {
      const branches = await vcsService.getBranches(state.currentRepository.id);
      dispatch({ type: 'SET_BRANCHES', payload: branches });
    }
    
    return result || { success: false, message: 'Operation failed' };
  }, [executeOperation, state.currentRepository]);

  const switchBranch = useCallback(async (branchName: string): Promise<VCSOperation> => {
    const result = await executeOperation(
      () => vcsService.switchBranch(branchName),
      `Switched to branch '${branchName}'`,
      `Failed to switch to branch '${branchName}'`
    );
    
    if (result?.success && state.currentRepository) {
      // Reload data after successful branch switch
      const [branches, files, commits] = await Promise.all([
        vcsService.getBranches(state.currentRepository.id),
        vcsService.getFiles(state.currentRepository.id),
        vcsService.getCommits(state.currentRepository.id)
      ]);
      
      dispatch({ type: 'SET_BRANCHES', payload: branches });
      dispatch({ type: 'SET_FILES', payload: files });
      dispatch({ type: 'SET_COMMITS', payload: commits });
    }
    
    return result || { success: false, message: 'Operation failed' };
  }, [executeOperation, state.currentRepository]);

  const mergeBranch = useCallback(async (options: MergeOptions): Promise<VCSOperation> => {
    const result = await executeOperation(
      () => vcsService.mergeBranch(options),
      `Merged ${options.sourceBranch} into ${options.targetBranch}`,
      'Failed to merge branches'
    );
    
    if (result?.success && state.currentRepository) {
      // Reload data after successful merge
      const [branches, commits] = await Promise.all([
        vcsService.getBranches(state.currentRepository.id),
        vcsService.getCommits(state.currentRepository.id)
      ]);
      
      dispatch({ type: 'SET_BRANCHES', payload: branches });
      dispatch({ type: 'SET_COMMITS', payload: commits });
    }
    
    return result || { success: false, message: 'Operation failed' };
  }, [executeOperation, state.currentRepository]);

  const deleteBranch = useCallback(async (branchName: string): Promise<VCSOperation> => {
    const result = await executeOperation(
      () => vcsService.deleteBranch(branchName),
      `Branch '${branchName}' deleted`,
      `Failed to delete branch '${branchName}'`
    );
    
    if (result?.success && state.currentRepository) {
      const branches = await vcsService.getBranches(state.currentRepository.id);
      dispatch({ type: 'SET_BRANCHES', payload: branches });
    }
    
    return result || { success: false, message: 'Operation failed' };
  }, [executeOperation, state.currentRepository]);

  // Changelist operations
  const loadChangelists = useCallback(async () => {
    const currentRepo = state.currentRepository;
    if (!currentRepo) return;
    
    const changelists = await executeOperation(
      () => vcsService.getChangelists(currentRepo.id),
      undefined,
      'Failed to load changelists'
    );
    if (changelists) {
      dispatch({ type: 'SET_CHANGELISTS', payload: changelists });
    }
  }, [state.currentRepository, executeOperation]);

  const createChangelist = useCallback(async (name: string, description: string): Promise<VCSOperation> => {
    const result = await executeOperation(
      () => vcsService.createChangelist(name, description),
      'Changelist created successfully',
      'Failed to create changelist'
    );
    
    if (result?.success && state.currentRepository) {
      const changelists = await vcsService.getChangelists(state.currentRepository.id);
      dispatch({ type: 'SET_CHANGELISTS', payload: changelists });
    }
    
    return result || { success: false, message: 'Operation failed' };
  }, [executeOperation, state.currentRepository]);

  const submitChangelist = useCallback(async (changelistId: string): Promise<VCSOperation> => {
    const result = await executeOperation(
      () => vcsService.submitChangelist(changelistId),
      'Changelist submitted successfully',
      'Failed to submit changelist'
    );
    
    if (result?.success && state.currentRepository) {
      const changelists = await vcsService.getChangelists(state.currentRepository.id);
      dispatch({ type: 'SET_CHANGELISTS', payload: changelists });
    }
    
    return result || { success: false, message: 'Operation failed' };
  }, [executeOperation, state.currentRepository]);

  // Sync operations
  const fetchChanges = useCallback(async (): Promise<VCSOperation> => {
    const currentRepo = state.currentRepository;
    if (!currentRepo) {
      return { success: false, message: 'No repository selected' };
    }
    
    const result = await executeOperation(
      () => vcsService.fetchChanges(currentRepo.id),
      'Fetched latest changes',
      'Failed to fetch changes'
    );
    
    return result || { success: false, message: 'Operation failed' };
  }, [state.currentRepository, executeOperation]);

  const pullChanges = useCallback(async (): Promise<VCSOperation> => {
    const currentRepo = state.currentRepository;
    if (!currentRepo) {
      return { success: false, message: 'No repository selected' };
    }
    
    const result = await executeOperation(
      () => vcsService.pullChanges(currentRepo.id),
      'Pulled latest changes',
      'Failed to pull changes'
    );
    
    if (result?.success) {
      // Reload data after successful pull
      const [files, commits, branches] = await Promise.all([
        vcsService.getFiles(currentRepo.id),
        vcsService.getCommits(currentRepo.id),
        vcsService.getBranches(currentRepo.id)
      ]);
      
      dispatch({ type: 'SET_FILES', payload: files });
      dispatch({ type: 'SET_COMMITS', payload: commits });
      dispatch({ type: 'SET_BRANCHES', payload: branches });
    }
    
    return result || { success: false, message: 'Operation failed' };
  }, [state.currentRepository, executeOperation]);

  const pushChanges = useCallback(async (branch?: string): Promise<VCSOperation> => {
    const currentRepo = state.currentRepository;
    if (!currentRepo) {
      return { success: false, message: 'No repository selected' };
    }
    
    const result = await executeOperation(
      () => vcsService.pushChanges(currentRepo.id, branch),
      'Pushed changes successfully',
      'Failed to push changes'
    );
    
    return result || { success: false, message: 'Operation failed' };
  }, [state.currentRepository, executeOperation]);

  // UI state operations
  const setSelectedFiles = useCallback((files: string[]) => {
    dispatch({ type: 'SET_SELECTED_FILES', payload: files });
  }, []);

  const addSelectedFile = useCallback((filePath: string) => {
    dispatch({ type: 'ADD_SELECTED_FILE', payload: filePath });
  }, []);

  const removeSelectedFile = useCallback((filePath: string) => {
    dispatch({ type: 'REMOVE_SELECTED_FILE', payload: filePath });
  }, []);

  const clearSelectedFiles = useCallback(() => {
    dispatch({ type: 'CLEAR_SELECTED_FILES' });
  }, []);

  const setSearchQuery = useCallback((query: string) => {
    dispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  }, []);

  const setViewMode = useCallback((mode: 'list' | 'grid' | 'tree') => {
    dispatch({ type: 'SET_VIEW_MODE', payload: mode });
  }, []);

  const setSorting = useCallback((by: 'name' | 'date' | 'size' | 'status', order: 'asc' | 'desc') => {
    dispatch({ type: 'SET_SORT', payload: { by, order } });
  }, []);

  const setShowHiddenFiles = useCallback((show: boolean) => {
    dispatch({ type: 'SET_SHOW_HIDDEN_FILES', payload: show });
  }, []);

  // Utility methods
  const getRepositoryStatus = useCallback(async () => {
    const currentRepo = state.currentRepository;
    if (!currentRepo) return null;
    
    return await executeOperation(
      () => vcsService.getRepositoryStatus(currentRepo.id),
      undefined,
      'Failed to get repository status'
    );
  }, [state.currentRepository, executeOperation]);

  // Computed values
  const filteredFiles = state.files.filter(file => {
    if (!state.showHiddenFiles && file.name.startsWith('.')) {
      return false;
    }
    if (state.searchQuery) {
      return file.name.toLowerCase().includes(state.searchQuery.toLowerCase());
    }
    return true;
  });

  const sortedFiles = [...filteredFiles].sort((a, b) => {
    let comparison = 0;
    
    switch (state.sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'date':
        comparison = new Date(a.modified).getTime() - new Date(b.modified).getTime();
        break;
      case 'size':
        comparison = (a.size || 0) - (b.size || 0);
        break;
      case 'status':
        comparison = (a.status || '').localeCompare(b.status || '');
        break;
    }
    
    return state.sortOrder === 'desc' ? -comparison : comparison;
  });

  const contextValue: VCSContextType = {
    state,
    loadRepositories,
    setCurrentRepository,
    cloneRepository,
    loadFiles,
    stageFile,
    unstageFile,
    getFileContent,
    getFileHistory,
    loadCommits,
    commit,
    getCommitDiff,
    loadBranches,
    createBranch,
    switchBranch,
    mergeBranch,
    deleteBranch,
    loadChangelists,
    createChangelist,
    submitChangelist,
    fetchChanges,
    pullChanges,
    pushChanges,
    setSelectedFiles,
    addSelectedFile,
    removeSelectedFile,
    clearSelectedFiles,
    setSearchQuery,
    setViewMode,
    setSorting,
    setShowHiddenFiles,
    getRepositoryStatus,
    filteredFiles,
    sortedFiles
  };

  return (
    <VCSContext.Provider value={contextValue}>
      {children}
    </VCSContext.Provider>
  );
}

// Custom hook to use the VCS context
export function useVCS() {
  const context = useContext(VCSContext);
  if (context === undefined) {
    throw new Error('useVCS must be used within a VCSProvider');
  }
  return context;
}