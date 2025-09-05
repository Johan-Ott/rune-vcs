// Rune VCS Context - Modern React context for Rune VCS integration
// Provides state management and operations for the Rune VCS visual client

import React, { createContext, useContext, useReducer, useCallback, ReactNode, useEffect } from 'react';
import runeVCS, { VCSOperation, CommitOptions, BranchOptions, Repository, File, Commit, Branch } from '../services/runeVCSService';

// Rune VCS State
export interface RuneVCSState {
  // Repository State
  repositories: Repository[];
  currentRepository: Repository | null;
  isRepositoryLoaded: boolean;

  // File System State
  files: File[];
  currentPath: string;
  selectedFiles: string[];
  stagedFiles: string[];

  // Version Control State
  commits: Commit[];
  branches: Branch[];
  currentBranch: string;

  // UI State
  searchQuery: string;
  viewMode: 'list' | 'grid' | 'tree';
  sortBy: 'name' | 'date' | 'size' | 'status';
  sortOrder: 'asc' | 'desc';
  showHiddenFiles: boolean;

  // Operation State
  isOperationInProgress: boolean;
  lastOperation: VCSOperation | null;
  operationMessage: string;

  // Connection State
  isConnected: boolean;
  useMockData: boolean;
  apiUrl: string;

  // AI Features State
  aiFeatures: {
    conflictPrediction: any | null;
    performanceAnalysis: any | null;
    branchingStrategy: any | null;
    isAIEnabled: boolean;
  };
}

// Action Types
type RuneVCSAction =
  // Repository Actions
  | { type: 'SET_REPOSITORIES'; payload: Repository[] }
  | { type: 'SET_CURRENT_REPOSITORY'; payload: Repository | null }
  | { type: 'SET_REPOSITORY_LOADED'; payload: boolean }

  // File Actions
  | { type: 'SET_FILES'; payload: File[] }
  | { type: 'SET_CURRENT_PATH'; payload: string }
  | { type: 'SET_SELECTED_FILES'; payload: string[] }
  | { type: 'ADD_SELECTED_FILE'; payload: string }
  | { type: 'REMOVE_SELECTED_FILE'; payload: string }
  | { type: 'CLEAR_SELECTED_FILES' }
  | { type: 'SET_STAGED_FILES'; payload: string[] }
  | { type: 'STAGE_FILE'; payload: string }
  | { type: 'UNSTAGE_FILE'; payload: string }

  // Version Control Actions
  | { type: 'SET_COMMITS'; payload: Commit[] }
  | { type: 'SET_BRANCHES'; payload: Branch[] }
  | { type: 'SET_CURRENT_BRANCH'; payload: string }

  // UI Actions
  | { type: 'SET_SEARCH_QUERY'; payload: string }
  | { type: 'SET_VIEW_MODE'; payload: 'list' | 'grid' | 'tree' }
  | { type: 'SET_SORT'; payload: { by: 'name' | 'date' | 'size' | 'status'; order: 'asc' | 'desc' } }
  | { type: 'SET_SHOW_HIDDEN_FILES'; payload: boolean }

  // Operation Actions
  | { type: 'SET_OPERATION_IN_PROGRESS'; payload: boolean }
  | { type: 'SET_LAST_OPERATION'; payload: VCSOperation | null }
  | { type: 'SET_OPERATION_MESSAGE'; payload: string }

  // Connection Actions
  | { type: 'SET_CONNECTION_STATUS'; payload: boolean }
  | { type: 'SET_MOCK_MODE'; payload: boolean }
  | { type: 'SET_API_URL'; payload: string }

  // AI Feature Actions
  | { type: 'SET_AI_FEATURES'; payload: Partial<RuneVCSState['aiFeatures']> }
  | { type: 'SET_AI_ENABLED'; payload: boolean };

// Initial State
const initialState: RuneVCSState = {
  // Repository State
  repositories: [],
  currentRepository: null,
  isRepositoryLoaded: false,

  // File System State
  files: [],
  currentPath: '',
  selectedFiles: [],
  stagedFiles: [],

  // Version Control State
  commits: [],
  branches: [],
  currentBranch: 'main',

  // UI State
  searchQuery: '',
  viewMode: 'list',
  sortBy: 'name',
  sortOrder: 'asc',
  showHiddenFiles: false,

  // Operation State
  isOperationInProgress: false,
  lastOperation: null,
  operationMessage: '',

  // Connection State
  isConnected: false,
  useMockData: true,
  apiUrl: 'http://localhost:3000',

  // AI Features State
  aiFeatures: {
    conflictPrediction: null,
    performanceAnalysis: null,
    branchingStrategy: null,
    isAIEnabled: true,
  },
};

// Reducer
function runeVCSReducer(state: RuneVCSState, action: RuneVCSAction): RuneVCSState {
  switch (action.type) {
    // Repository Cases
    case 'SET_REPOSITORIES':
      return { ...state, repositories: action.payload };
    case 'SET_CURRENT_REPOSITORY':
      return { ...state, currentRepository: action.payload };
    case 'SET_REPOSITORY_LOADED':
      return { ...state, isRepositoryLoaded: action.payload };

    // File Cases
    case 'SET_FILES':
      return { ...state, files: action.payload };
    case 'SET_CURRENT_PATH':
      return { ...state, currentPath: action.payload };
    case 'SET_SELECTED_FILES':
      return { ...state, selectedFiles: action.payload };
    case 'ADD_SELECTED_FILE':
      return { 
        ...state, 
        selectedFiles: [...state.selectedFiles, action.payload] 
      };
    case 'REMOVE_SELECTED_FILE':
      return { 
        ...state, 
        selectedFiles: state.selectedFiles.filter(f => f !== action.payload) 
      };
    case 'CLEAR_SELECTED_FILES':
      return { ...state, selectedFiles: [] };
    case 'SET_STAGED_FILES':
      return { ...state, stagedFiles: action.payload };
    case 'STAGE_FILE':
      return { 
        ...state, 
        stagedFiles: [...state.stagedFiles, action.payload] 
      };
    case 'UNSTAGE_FILE':
      return { 
        ...state, 
        stagedFiles: state.stagedFiles.filter(f => f !== action.payload) 
      };

    // Version Control Cases
    case 'SET_COMMITS':
      return { ...state, commits: action.payload };
    case 'SET_BRANCHES':
      return { ...state, branches: action.payload };
    case 'SET_CURRENT_BRANCH':
      return { ...state, currentBranch: action.payload };

    // UI Cases
    case 'SET_SEARCH_QUERY':
      return { ...state, searchQuery: action.payload };
    case 'SET_VIEW_MODE':
      return { ...state, viewMode: action.payload };
    case 'SET_SORT':
      return { ...state, sortBy: action.payload.by, sortOrder: action.payload.order };
    case 'SET_SHOW_HIDDEN_FILES':
      return { ...state, showHiddenFiles: action.payload };

    // Operation Cases
    case 'SET_OPERATION_IN_PROGRESS':
      return { ...state, isOperationInProgress: action.payload };
    case 'SET_LAST_OPERATION':
      return { ...state, lastOperation: action.payload };
    case 'SET_OPERATION_MESSAGE':
      return { ...state, operationMessage: action.payload };

    // Connection Cases
    case 'SET_CONNECTION_STATUS':
      return { ...state, isConnected: action.payload };
    case 'SET_MOCK_MODE':
      return { ...state, useMockData: action.payload };
    case 'SET_API_URL':
      return { ...state, apiUrl: action.payload };

    // AI Feature Cases
    case 'SET_AI_FEATURES':
      return { 
        ...state, 
        aiFeatures: { ...state.aiFeatures, ...action.payload } 
      };
    case 'SET_AI_ENABLED':
      return { 
        ...state, 
        aiFeatures: { ...state.aiFeatures, isAIEnabled: action.payload } 
      };

    default:
      return state;
  }
}

// Context Interface
interface RuneVCSContextType {
  state: RuneVCSState;
  
  // Repository Operations
  initRepository: (path: string) => Promise<VCSOperation>;
  cloneRepository: (url: string, path: string) => Promise<VCSOperation>;
  loadRepository: (path?: string) => Promise<void>;
  refreshRepository: () => Promise<void>;

  // File Operations
  loadFiles: (path?: string) => Promise<void>;
  stageFile: (filePath: string) => Promise<VCSOperation>;
  unstageFile: (filePath: string) => Promise<VCSOperation>;
  stageFiles: (filePaths: string[]) => Promise<VCSOperation>;
  getFileContent: (filePath: string) => Promise<string>;

  // Selection Operations
  selectFile: (filePath: string) => void;
  deselectFile: (filePath: string) => void;
  selectAllFiles: () => void;
  clearSelection: () => void;

  // Commit Operations
  commit: (options: CommitOptions) => Promise<VCSOperation>;
  loadCommits: (limit?: number) => Promise<void>;
  getCommit: (hash: string) => Promise<Commit>;

  // Branch Operations
  loadBranches: () => Promise<void>;
  createBranch: (options: BranchOptions) => Promise<VCSOperation>;
  switchBranch: (branchName: string) => Promise<VCSOperation>;
  deleteBranch: (branchName: string) => Promise<VCSOperation>;
  mergeBranch: (sourceBranch: string, targetBranch: string) => Promise<VCSOperation>;

  // AI Operations
  predictConflicts: (operation: string, sourceBranch?: string) => Promise<void>;
  analyzePerformance: () => Promise<void>;
  getBranchingStrategy: () => Promise<void>;

  // UI Operations
  setSearchQuery: (query: string) => void;
  setViewMode: (mode: 'list' | 'grid' | 'tree') => void;
  setSorting: (by: 'name' | 'date' | 'size' | 'status', order: 'asc' | 'desc') => void;
  setShowHiddenFiles: (show: boolean) => void;

  // Configuration Operations
  setMockMode: (useMock: boolean) => void;
  setAPIUrl: (url: string) => void;
  testConnection: () => Promise<boolean>;
}

// Create Context
const RuneVCSContext = createContext<RuneVCSContextType | undefined>(undefined);

// Provider Component
export function RuneVCSProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(runeVCSReducer, initialState);

  // Helper function for handling operations
  const handleOperation = useCallback(async (
    operation: () => Promise<any>,
    successMessage?: string,
    errorMessage?: string
  ): Promise<any> => {
    dispatch({ type: 'SET_OPERATION_IN_PROGRESS', payload: true });
    dispatch({ type: 'SET_OPERATION_MESSAGE', payload: 'Processing...' });

    try {
      const result = await operation();
      
      if (successMessage) {
        dispatch({ type: 'SET_OPERATION_MESSAGE', payload: successMessage });
        dispatch({ 
          type: 'SET_LAST_OPERATION', 
          payload: { success: true, message: successMessage, data: result } 
        });
      }
      
      return result;
    } catch (error) {
      const message = errorMessage || `Operation failed: ${error}`;
      dispatch({ type: 'SET_OPERATION_MESSAGE', payload: message });
      dispatch({ 
        type: 'SET_LAST_OPERATION', 
        payload: { success: false, message } 
      });
      throw error;
    } finally {
      dispatch({ type: 'SET_OPERATION_IN_PROGRESS', payload: false });
    }
  }, []);

  // Repository Operations
  const initRepository = useCallback(async (path: string): Promise<VCSOperation> => {
    return handleOperation(
      () => runeVCS.initRepository(path),
      'Repository initialized successfully'
    );
  }, [handleOperation]);

  const cloneRepository = useCallback(async (url: string, path: string): Promise<VCSOperation> => {
    return handleOperation(
      () => runeVCS.cloneRepository(url, path),
      'Repository cloned successfully'
    );
  }, [handleOperation]);

  const loadRepository = useCallback(async (path?: string): Promise<void> => {
    await handleOperation(async () => {
      const repo = await runeVCS.getCurrentRepository();
      dispatch({ type: 'SET_CURRENT_REPOSITORY', payload: repo });
      dispatch({ type: 'SET_REPOSITORY_LOADED', payload: true });
      
      // Load initial data
      const [files, branches, commits] = await Promise.all([
        runeVCS.getFiles(),
        runeVCS.getBranches(),
        runeVCS.getCommits(20)
      ]);
      
      dispatch({ type: 'SET_FILES', payload: files });
      dispatch({ type: 'SET_BRANCHES', payload: branches });
      dispatch({ type: 'SET_COMMITS', payload: commits });
      
      return repo;
    }, 'Repository loaded successfully');
  }, [handleOperation]);

  const refreshRepository = useCallback(async (): Promise<void> => {
    if (!state.currentRepository) return;
    await loadRepository();
  }, [state.currentRepository, loadRepository]);

  // File Operations
  const loadFiles = useCallback(async (path: string = ''): Promise<void> => {
    await handleOperation(async () => {
      const files = await runeVCS.getFiles(path);
      dispatch({ type: 'SET_FILES', payload: files });
      dispatch({ type: 'SET_CURRENT_PATH', payload: path });
      return files;
    });
  }, [handleOperation]);

  const stageFile = useCallback(async (filePath: string): Promise<VCSOperation> => {
    return handleOperation(async () => {
      const result = await runeVCS.stageFiles([filePath]);
      dispatch({ type: 'STAGE_FILE', payload: filePath });
      return result;
    }, `Staged ${filePath}`);
  }, [handleOperation]);

  const unstageFile = useCallback(async (filePath: string): Promise<VCSOperation> => {
    return handleOperation(async () => {
      const result = await runeVCS.unstageFiles([filePath]);
      dispatch({ type: 'UNSTAGE_FILE', payload: filePath });
      return result;
    }, `Unstaged ${filePath}`);
  }, [handleOperation]);

  const stageFiles = useCallback(async (filePaths: string[]): Promise<VCSOperation> => {
    return handleOperation(async () => {
      const result = await runeVCS.stageFiles(filePaths);
      filePaths.forEach(path => {
        dispatch({ type: 'STAGE_FILE', payload: path });
      });
      return result;
    }, `Staged ${filePaths.length} files`);
  }, [handleOperation]);

  const getFileContent = useCallback(async (filePath: string): Promise<string> => {
    return handleOperation(() => runeVCS.getFileContent(filePath));
  }, [handleOperation]);

  // Selection Operations
  const selectFile = useCallback((filePath: string) => {
    dispatch({ type: 'ADD_SELECTED_FILE', payload: filePath });
  }, []);

  const deselectFile = useCallback((filePath: string) => {
    dispatch({ type: 'REMOVE_SELECTED_FILE', payload: filePath });
  }, []);

  const selectAllFiles = useCallback(() => {
    const allFilePaths = state.files.map(f => f.path);
    dispatch({ type: 'SET_SELECTED_FILES', payload: allFilePaths });
  }, [state.files]);

  const clearSelection = useCallback(() => {
    dispatch({ type: 'CLEAR_SELECTED_FILES' });
  }, []);

  // Commit Operations
  const commit = useCallback(async (options: CommitOptions): Promise<VCSOperation> => {
    return handleOperation(async () => {
      const result = await runeVCS.commit(options);
      
      // Refresh commits and files after commit
      const [commits, files] = await Promise.all([
        runeVCS.getCommits(20),
        runeVCS.getFiles()
      ]);
      
      dispatch({ type: 'SET_COMMITS', payload: commits });
      dispatch({ type: 'SET_FILES', payload: files });
      dispatch({ type: 'SET_STAGED_FILES', payload: [] });
      dispatch({ type: 'CLEAR_SELECTED_FILES' });
      
      return result;
    }, 'Committed successfully');
  }, [handleOperation]);

  const loadCommits = useCallback(async (limit: number = 20): Promise<void> => {
    await handleOperation(async () => {
      const commits = await runeVCS.getCommits(limit);
      dispatch({ type: 'SET_COMMITS', payload: commits });
      return commits;
    });
  }, [handleOperation]);

  const getCommit = useCallback(async (hash: string): Promise<Commit> => {
    return handleOperation(() => runeVCS.getCommit(hash));
  }, [handleOperation]);

  // Branch Operations
  const loadBranches = useCallback(async (): Promise<void> => {
    await handleOperation(async () => {
      const branches = await runeVCS.getBranches();
      dispatch({ type: 'SET_BRANCHES', payload: branches });
      
      const currentBranch = branches.find(b => b.current);
      if (currentBranch) {
        dispatch({ type: 'SET_CURRENT_BRANCH', payload: currentBranch.name });
      }
      
      return branches;
    });
  }, [handleOperation]);

  const createBranch = useCallback(async (options: BranchOptions): Promise<VCSOperation> => {
    return handleOperation(async () => {
      const result = await runeVCS.createBranch(options);
      await loadBranches(); // Refresh branches
      return result;
    }, `Created branch ${options.name}`);
  }, [handleOperation, loadBranches]);

  const switchBranch = useCallback(async (branchName: string): Promise<VCSOperation> => {
    return handleOperation(async () => {
      const result = await runeVCS.switchBranch(branchName);
      dispatch({ type: 'SET_CURRENT_BRANCH', payload: branchName });
      
      // Refresh data after branch switch
      const [files, commits] = await Promise.all([
        runeVCS.getFiles(),
        runeVCS.getCommits(20)
      ]);
      
      dispatch({ type: 'SET_FILES', payload: files });
      dispatch({ type: 'SET_COMMITS', payload: commits });
      
      return result;
    }, `Switched to branch ${branchName}`);
  }, [handleOperation]);

  const deleteBranch = useCallback(async (branchName: string): Promise<VCSOperation> => {
    return handleOperation(async () => {
      const result = await runeVCS.deleteBranch(branchName);
      await loadBranches(); // Refresh branches
      return result;
    }, `Deleted branch ${branchName}`);
  }, [handleOperation, loadBranches]);

  const mergeBranch = useCallback(async (sourceBranch: string, targetBranch: string): Promise<VCSOperation> => {
    return handleOperation(async () => {
      const result = await runeVCS.mergeBranch(sourceBranch, targetBranch);
      
      // Refresh data after merge
      const [files, commits, branches] = await Promise.all([
        runeVCS.getFiles(),
        runeVCS.getCommits(20),
        runeVCS.getBranches()
      ]);
      
      dispatch({ type: 'SET_FILES', payload: files });
      dispatch({ type: 'SET_COMMITS', payload: commits });
      dispatch({ type: 'SET_BRANCHES', payload: branches });
      
      return result;
    }, `Merged ${sourceBranch} into ${targetBranch}`);
  }, [handleOperation]);

  // AI Operations
  const predictConflicts = useCallback(async (operation: string, sourceBranch?: string): Promise<void> => {
    if (!state.aiFeatures.isAIEnabled) return;
    
    await handleOperation(async () => {
      const prediction = await runeVCS.predictConflicts(operation, sourceBranch);
      dispatch({ 
        type: 'SET_AI_FEATURES', 
        payload: { conflictPrediction: prediction } 
      });
      return prediction;
    });
  }, [handleOperation, state.aiFeatures.isAIEnabled]);

  const analyzePerformance = useCallback(async (): Promise<void> => {
    if (!state.aiFeatures.isAIEnabled) return;
    
    await handleOperation(async () => {
      const analysis = await runeVCS.analyzePerformance();
      dispatch({ 
        type: 'SET_AI_FEATURES', 
        payload: { performanceAnalysis: analysis } 
      });
      return analysis;
    });
  }, [handleOperation, state.aiFeatures.isAIEnabled]);

  const getBranchingStrategy = useCallback(async (): Promise<void> => {
    if (!state.aiFeatures.isAIEnabled) return;
    
    await handleOperation(async () => {
      const strategy = await runeVCS.getBranchingStrategy();
      dispatch({ 
        type: 'SET_AI_FEATURES', 
        payload: { branchingStrategy: strategy } 
      });
      return strategy;
    });
  }, [handleOperation, state.aiFeatures.isAIEnabled]);

  // UI Operations
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

  // Configuration Operations
  const setMockMode = useCallback((useMock: boolean) => {
    runeVCS.setMockMode(useMock);
    dispatch({ type: 'SET_MOCK_MODE', payload: useMock });
  }, []);

  const setAPIUrl = useCallback((url: string) => {
    dispatch({ type: 'SET_API_URL', payload: url });
  }, []);

  const testConnection = useCallback(async (): Promise<boolean> => {
    try {
      const repo = await runeVCS.getCurrentRepository();
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: true });
      return true;
    } catch (error) {
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: false });
      return false;
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    const initialize = async () => {
      const connected = await testConnection();
      if (connected) {
        await loadRepository();
      } else {
        // Use mock data if connection fails
        setMockMode(true);
      }
    };

    initialize();
  }, []);

  const contextValue: RuneVCSContextType = {
    state,
    
    // Repository Operations
    initRepository,
    cloneRepository,
    loadRepository,
    refreshRepository,

    // File Operations
    loadFiles,
    stageFile,
    unstageFile,
    stageFiles,
    getFileContent,

    // Selection Operations
    selectFile,
    deselectFile,
    selectAllFiles,
    clearSelection,

    // Commit Operations
    commit,
    loadCommits,
    getCommit,

    // Branch Operations
    loadBranches,
    createBranch,
    switchBranch,
    deleteBranch,
    mergeBranch,

    // AI Operations
    predictConflicts,
    analyzePerformance,
    getBranchingStrategy,

    // UI Operations
    setSearchQuery,
    setViewMode,
    setSorting,
    setShowHiddenFiles,

    // Configuration Operations
    setMockMode,
    setAPIUrl,
    testConnection,
  };

  return (
    <RuneVCSContext.Provider value={contextValue}>
      {children}
    </RuneVCSContext.Provider>
  );
}

// Custom Hook
export function useRuneVCS(): RuneVCSContextType {
  const context = useContext(RuneVCSContext);
  if (context === undefined) {
    throw new Error('useRuneVCS must be used within a RuneVCSProvider');
  }
  return context;
}

export default RuneVCSContext;
