// Custom hooks for VCS operations - Business logic separated from UI components
// These hooks encapsulate common VCS workflows and can be reused across components

import { useCallback, useState, useEffect } from 'react';
import { useVCS } from '../contexts/VCSContext';
import { useApp } from '../contexts/AppContext';
import { MockFile, MockCommit, MockBranch } from '../data/mockData';

// Hook for file operations
export function useFileOperations() {
  const { 
    state, 
    stageFile, 
    unstageFile, 
    getFileContent, 
    getFileHistory,
    setSelectedFiles,
    addSelectedFile,
    removeSelectedFile,
    clearSelectedFiles
  } = useVCS();

  const [fileContent, setFileContent] = useState<string>('');
  const [fileHistory, setFileHistory] = useState<MockCommit[]>([]);
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);

  // Stage multiple files
  const stageSelectedFiles = useCallback(async () => {
    const operations = state.selectedFiles.map(filePath => stageFile(filePath));
    const results = await Promise.all(operations);
    const successful = results.filter(r => r.success).length;
    const failed = results.length - successful;
    
    if (successful > 0) {
      clearSelectedFiles();
    }
    
    return { successful, failed };
  }, [state.selectedFiles, stageFile, clearSelectedFiles]);

  // Unstage multiple files
  const unstageSelectedFiles = useCallback(async () => {
    const operations = state.selectedFiles.map(filePath => unstageFile(filePath));
    const results = await Promise.all(operations);
    const successful = results.filter(r => r.success).length;
    const failed = results.length - successful;
    
    if (successful > 0) {
      clearSelectedFiles();
    }
    
    return { successful, failed };
  }, [state.selectedFiles, unstageFile, clearSelectedFiles]);

  // Load file content with caching
  const loadFileContent = useCallback(async (filePath: string) => {
    setIsLoadingContent(true);
    try {
      const content = await getFileContent(filePath);
      setFileContent(content);
      return content;
    } finally {
      setIsLoadingContent(false);
    }
  }, [getFileContent]);

  // Load file history with caching
  const loadFileHistory = useCallback(async (filePath: string) => {
    setIsLoadingHistory(true);
    try {
      const history = await getFileHistory(filePath);
      setFileHistory(history);
      return history;
    } finally {
      setIsLoadingHistory(false);
    }
  }, [getFileHistory]);

  // Toggle file selection
  const toggleFileSelection = useCallback((filePath: string) => {
    if (state.selectedFiles.includes(filePath)) {
      removeSelectedFile(filePath);
    } else {
      addSelectedFile(filePath);
    }
  }, [state.selectedFiles, addSelectedFile, removeSelectedFile]);

  // Select files by status
  const selectFilesByStatus = useCallback((status: string) => {
    const filesWithStatus = state.files
      .filter(file => file.status === status)
      .map(file => file.path);
    setSelectedFiles(filesWithStatus);
  }, [state.files, setSelectedFiles]);

  // Get staged files
  const stagedFiles = state.files.filter(file => file.status === 'staged');
  const modifiedFiles = state.files.filter(file => file.status === 'modified');
  const untrackedFiles = state.files.filter(file => file.status === 'untracked');

  return {
    selectedFiles: state.selectedFiles,
    stagedFiles,
    modifiedFiles,
    untrackedFiles,
    fileContent,
    fileHistory,
    isLoadingContent,
    isLoadingHistory,
    stageSelectedFiles,
    unstageSelectedFiles,
    loadFileContent,
    loadFileHistory,
    toggleFileSelection,
    selectFilesByStatus,
    clearSelectedFiles
  };
}

// Hook for commit operations
export function useCommitOperations() {
  const { state, commit, loadCommits, getCommitDiff } = useVCS();
  const { showNotification } = useApp();
  const [isCommitting, setIsCommitting] = useState(false);
  const [commitDiff, setCommitDiff] = useState<string>('');

  // Commit with validation
  const commitChanges = useCallback(async (message: string, files?: string[]) => {
    if (!message.trim()) {
      showNotification({
        type: 'error',
        message: 'Commit message is required'
      });
      return { success: false, message: 'Commit message is required' };
    }

    const filesToCommit = files || state.files
      .filter(file => file.status === 'staged')
      .map(file => file.path);

    if (filesToCommit.length === 0) {
      showNotification({
        type: 'warning',
        message: 'No staged files to commit'
      });
      return { success: false, message: 'No staged files to commit' };
    }

    setIsCommitting(true);
    try {
      const result = await commit({
        message: message.trim(),
        files: filesToCommit
      });
      return result;
    } finally {
      setIsCommitting(false);
    }
  }, [commit, state.files, showNotification]);

  // Load commit diff
  const loadCommitDiff = useCallback(async (commitHash: string) => {
    try {
      const diff = await getCommitDiff(commitHash);
      setCommitDiff(diff);
      return diff;
    } catch (error) {
      showNotification({
        type: 'error',
        message: 'Failed to load commit diff'
      });
      return '';
    }
  }, [getCommitDiff, showNotification]);

  // Get commit statistics
  const commitStats = {
    total: state.commits.length,
    recent: state.commits.slice(0, 10),
    byAuthor: state.commits.reduce((acc, commit) => {
      acc[commit.author] = (acc[commit.author] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  };

  return {
    commits: state.commits,
    commitStats,
    commitDiff,
    isCommitting,
    commitChanges,
    loadCommitDiff,
    loadCommits
  };
}

// Hook for branch operations
export function useBranchOperations() {
  const { 
    state, 
    createBranch, 
    switchBranch, 
    mergeBranch, 
    deleteBranch, 
    loadBranches 
  } = useVCS();
  const { showNotification } = useApp();
  const [isCreatingBranch, setIsCreatingBranch] = useState(false);
  const [isSwitchingBranch, setIsSwitchingBranch] = useState(false);

  // Create branch with validation
  const createNewBranch = useCallback(async (name: string, fromBranch?: string, checkout = false) => {
    if (!name.trim()) {
      showNotification({
        type: 'error',
        message: 'Branch name is required'
      });
      return { success: false, message: 'Branch name is required' };
    }

    // Basic validation for branch name
    if (!/^[a-zA-Z0-9_/-]+$/.test(name)) {
      showNotification({
        type: 'error',
        message: 'Invalid branch name. Use only letters, numbers, underscores, and dashes.'
      });
      return { success: false, message: 'Invalid branch name' };
    }

    setIsCreatingBranch(true);
    try {
      const result = await createBranch({
        name: name.trim(),
        fromBranch,
        checkout
      });
      return result;
    } finally {
      setIsCreatingBranch(false);
    }
  }, [createBranch, showNotification]);

  // Switch branch with loading state
  const switchToBranch = useCallback(async (branchName: string) => {
    setIsSwitchingBranch(true);
    try {
      const result = await switchBranch(branchName);
      return result;
    } finally {
      setIsSwitchingBranch(false);
    }
  }, [switchBranch]);

  // Merge branch with conflict detection (mock)
  const mergeBranchInto = useCallback(async (sourceBranch: string, targetBranch: string) => {
    // In a real implementation, this would check for conflicts
    const result = await mergeBranch({
      sourceBranch,
      targetBranch,
      strategy: 'merge'
    });
    return result;
  }, [mergeBranch]);

  // Delete branch with safety checks
  const deleteBranchSafely = useCallback(async (branchName: string) => {
    const branch = state.branches.find(b => b.name === branchName);
    if (!branch) {
      showNotification({
        type: 'error',
        message: 'Branch not found'
      });
      return { success: false, message: 'Branch not found' };
    }

    if (branch.isActive) {
      showNotification({
        type: 'error',
        message: 'Cannot delete the active branch'
      });
      return { success: false, message: 'Cannot delete active branch' };
    }

    if (branch.ahead > 0) {
      showNotification({
        type: 'warning',
        message: 'Branch has unmerged commits. Are you sure you want to delete it?'
      });
      // In a real implementation, this would show a confirmation dialog
    }

    const result = await deleteBranch(branchName);
    return result;
  }, [state.branches, deleteBranch, showNotification]);

  // Get branch information
  const activeBranch = state.branches.find(b => b.isActive);
  const localBranches = state.branches.filter(b => !b.isRemote);
  const remoteBranches = state.branches.filter(b => b.isRemote);

  const branchStats = {
    total: state.branches.length,
    local: localBranches.length,
    remote: remoteBranches.length,
    active: activeBranch?.name || 'main',
    ahead: activeBranch?.ahead || 0,
    behind: activeBranch?.behind || 0
  };

  return {
    branches: state.branches,
    activeBranch,
    localBranches,
    remoteBranches,
    branchStats,
    isCreatingBranch,
    isSwitchingBranch,
    createNewBranch,
    switchToBranch,
    mergeBranchInto,
    deleteBranchSafely,
    loadBranches
  };
}

// Hook for repository synchronization
export function useRepositorySync() {
  const { fetchChanges, pullChanges, pushChanges, getRepositoryStatus } = useVCS();
  const { showNotification } = useApp();
  const [isFetching, setIsFetching] = useState(false);
  const [isPulling, setIsPulling] = useState(false);
  const [isPushing, setIsPushing] = useState(false);
  const [repoStatus, setRepoStatus] = useState<any>(null);

  // Fetch with progress indication
  const fetchRemoteChanges = useCallback(async () => {
    setIsFetching(true);
    try {
      const result = await fetchChanges();
      if (result.success) {
        // Refresh repository status after fetch
        const status = await getRepositoryStatus();
        setRepoStatus(status);
      }
      return result;
    } finally {
      setIsFetching(false);
    }
  }, [fetchChanges, getRepositoryStatus]);

  // Pull with conflict detection
  const pullRemoteChanges = useCallback(async () => {
    setIsPulling(true);
    try {
      const result = await pullChanges();
      if (result.success) {
        const status = await getRepositoryStatus();
        setRepoStatus(status);
      }
      return result;
    } finally {
      setIsPulling(false);
    }
  }, [pullChanges, getRepositoryStatus]);

  // Push with validation
  const pushLocalChanges = useCallback(async (branch?: string) => {
    setIsPushing(true);
    try {
      const result = await pushChanges(branch);
      if (result.success) {
        const status = await getRepositoryStatus();
        setRepoStatus(status);
      }
      return result;
    } finally {
      setIsPushing(false);
    }
  }, [pushChanges, getRepositoryStatus]);

  // Sync operation (fetch + pull)
  const syncRepository = useCallback(async () => {
    showNotification({
      type: 'info',
      message: 'Synchronizing repository...'
    });

    try {
      const fetchResult = await fetchRemoteChanges();
      if (!fetchResult.success) {
        return fetchResult;
      }

      const pullResult = await pullRemoteChanges();
      return pullResult;
    } catch (error) {
      showNotification({
        type: 'error',
        message: 'Failed to synchronize repository'
      });
      return { success: false, message: 'Sync failed' };
    }
  }, [fetchRemoteChanges, pullRemoteChanges, showNotification]);

  // Update repository status
  const refreshRepositoryStatus = useCallback(async () => {
    try {
      const status = await getRepositoryStatus();
      setRepoStatus(status);
      return status;
    } catch (error) {
      showNotification({
        type: 'error',
        message: 'Failed to get repository status'
      });
      return null;
    }
  }, [getRepositoryStatus, showNotification]);

  // Auto-refresh status on mount
  useEffect(() => {
    refreshRepositoryStatus();
  }, [refreshRepositoryStatus]);

  return {
    repoStatus,
    isFetching,
    isPulling,
    isPushing,
    fetchRemoteChanges,
    pullRemoteChanges,
    pushLocalChanges,
    syncRepository,
    refreshRepositoryStatus
  };
}

// Hook for search and filtering
export function useFileSearch() {
  const { state, setSearchQuery, setViewMode, setSorting, setShowHiddenFiles, filteredFiles, sortedFiles } = useVCS();
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Advanced search with history
  const search = useCallback((query: string) => {
    setSearchQuery(query);
    
    if (query.trim() && !searchHistory.includes(query.trim())) {
      setSearchHistory(prev => [query.trim(), ...prev.slice(0, 9)]); // Keep last 10 searches
    }
  }, [setSearchQuery, searchHistory]);

  // Filter by file type
  const filterByType = useCallback((extensions: string[]) => {
    const filtered = state.files.filter(file => 
      file.extension && extensions.includes(file.extension)
    );
    return filtered;
  }, [state.files]);

  // Filter by status
  const filterByStatus = useCallback((statuses: string[]) => {
    const filtered = state.files.filter(file => 
      file.status && statuses.includes(file.status)
    );
    return filtered;
  }, [state.files]);

  // Quick filters
  const quickFilters = {
    modified: () => filterByStatus(['modified']),
    staged: () => filterByStatus(['staged']),
    untracked: () => filterByStatus(['untracked']),
    images: () => filterByType(['jpg', 'jpeg', 'png', 'gif', 'svg']),
    code: () => filterByType(['ts', 'tsx', 'js', 'jsx', 'py', 'java', 'cpp']),
    docs: () => filterByType(['md', 'txt', 'pdf', 'doc', 'docx'])
  };

  return {
    searchQuery: state.searchQuery,
    searchHistory,
    viewMode: state.viewMode,
    sortBy: state.sortBy,
    sortOrder: state.sortOrder,
    showHiddenFiles: state.showHiddenFiles,
    filteredFiles,
    sortedFiles,
    search,
    setViewMode,
    setSorting,
    setShowHiddenFiles,
    filterByType,
    filterByStatus,
    quickFilters
  };
}