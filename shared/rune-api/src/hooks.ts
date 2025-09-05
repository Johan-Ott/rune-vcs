import { useState, useEffect } from 'react';
import { FileInfo, VCSStatus, RuneAPI } from './index';

// React hooks for common operations
export function useFileSystem(initialPath?: string) {
  const [currentPath, setCurrentPath] = useState(initialPath || '');
  const [files, setFiles] = useState<FileInfo[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadDirectory = async (path: string) => {
    setLoading(true);
    setError(null);
    try {
      const result = await RuneAPI.fileSystem.listDirectory(path);
      setFiles(result);
      setCurrentPath(path);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load directory');
    } finally {
      setLoading(false);
    }
  };

  const navigateTo = (path: string) => {
    loadDirectory(path);
  };

  const openFile = async (path: string) => {
    await RuneAPI.fileSystem.openExternal(path);
  };

  useEffect(() => {
    if (initialPath) {
      loadDirectory(initialPath);
    }
  }, [initialPath]);

  return {
    currentPath,
    files,
    loading,
    error,
    navigateTo,
    openFile,
    reload: () => loadDirectory(currentPath),
  };
}

export function useVCSStatus(repoPath: string) {
  const [status, setStatus] = useState<VCSStatus | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await RuneAPI.vcs.getStatus(repoPath);
      setStatus(result);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get VCS status');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (repoPath) {
      refresh();
    }
  }, [repoPath]);

  return {
    status,
    loading,
    error,
    refresh,
  };
}

export function useTasks() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const loadTasks = async () => {
    setLoading(true);
    try {
      const result = await RuneAPI.planning.listTasks();
      setTasks(result);
    } catch (err) {
      console.error('Failed to load tasks:', err);
    } finally {
      setLoading(false);
    }
  };

  const createTask = async (title: string, description: string) => {
    try {
      await RuneAPI.planning.createTask(title, description);
      await loadTasks(); // Refresh list
    } catch (err) {
      console.error('Failed to create task:', err);
    }
  };

  const updateTask = async (id: string, updates: any) => {
    try {
      await RuneAPI.planning.updateTask(id, updates);
      await loadTasks(); // Refresh list
    } catch (err) {
      console.error('Failed to update task:', err);
    }
  };

  useEffect(() => {
    loadTasks();
  }, []);

  return {
    tasks,
    loading,
    createTask,
    updateTask,
    refresh: loadTasks,
  };
}
