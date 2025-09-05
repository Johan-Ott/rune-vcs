// Shared state management using Zustand

import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import { FileInfo, VCSStatus, TaskItem, BranchInfo, AppConfig } from '@rune-vcs/api';

// File system state
interface FileSystemState {
  currentDirectory: string;
  files: FileInfo[];
  selectedFiles: string[];
  loading: boolean;
  error: string | null;
  
  setCurrentDirectory: (path: string) => void;
  setFiles: (files: FileInfo[]) => void;
  selectFile: (path: string) => void;
  unselectFile: (path: string) => void;
  clearSelection: () => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useFileSystemStore = create<FileSystemState>()(
  devtools(
    (set, get) => ({
      currentDirectory: '',
      files: [],
      selectedFiles: [],
      loading: false,
      error: null,
      
      setCurrentDirectory: (path) => set({ currentDirectory: path }),
      setFiles: (files) => set({ files }),
      selectFile: (path) => {
        const { selectedFiles } = get();
        if (!selectedFiles.includes(path)) {
          set({ selectedFiles: [...selectedFiles, path] });
        }
      },
      unselectFile: (path) => {
        const { selectedFiles } = get();
        set({ selectedFiles: selectedFiles.filter(f => f !== path) });
      },
      clearSelection: () => set({ selectedFiles: [] }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
    }),
    { name: 'filesystem-store' }
  )
);

// VCS state
interface VCSState {
  status: VCSStatus | null;
  branches: BranchInfo[];
  currentBranch: string;
  loading: boolean;
  error: string | null;
  
  setStatus: (status: VCSStatus) => void;
  setBranches: (branches: BranchInfo[]) => void;
  setCurrentBranch: (branch: string) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const useVCSStore = create<VCSState>()(
  devtools(
    (set) => ({
      status: null,
      branches: [],
      currentBranch: '',
      loading: false,
      error: null,
      
      setStatus: (status) => set({ status }),
      setBranches: (branches) => set({ branches }),
      setCurrentBranch: (branch) => set({ currentBranch: branch }),
      setLoading: (loading) => set({ loading }),
      setError: (error) => set({ error }),
    }),
    { name: 'vcs-store' }
  )
);

// Task/Planning state
interface PlanningState {
  tasks: TaskItem[];
  selectedTask: TaskItem | null;
  filter: 'all' | 'todo' | 'in-progress' | 'done';
  loading: boolean;
  error: string | null;
  
  setTasks: (tasks: TaskItem[]) => void;
  addTask: (task: TaskItem) => void;
  updateTask: (id: string, updates: Partial<TaskItem>) => void;
  deleteTask: (id: string) => void;
  setSelectedTask: (task: TaskItem | null) => void;
  setFilter: (filter: 'all' | 'todo' | 'in-progress' | 'done') => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
}

export const usePlanningStore = create<PlanningState>()(
  devtools(
    persist(
      (set, get) => ({
        tasks: [],
        selectedTask: null,
        filter: 'all',
        loading: false,
        error: null,
        
        setTasks: (tasks) => set({ tasks }),
        addTask: (task) => {
          const { tasks } = get();
          set({ tasks: [...tasks, task] });
        },
        updateTask: (id, updates) => {
          const { tasks } = get();
          set({
            tasks: tasks.map(task => 
              task.id === id ? { ...task, ...updates } : task
            )
          });
        },
        deleteTask: (id) => {
          const { tasks } = get();
          set({ tasks: tasks.filter(task => task.id !== id) });
        },
        setSelectedTask: (task) => set({ selectedTask: task }),
        setFilter: (filter) => set({ filter }),
        setLoading: (loading) => set({ loading }),
        setError: (error) => set({ error }),
      }),
      { name: 'planning-store' }
    ),
    { name: 'planning-store' }
  )
);

// App configuration state
interface ConfigState {
  config: AppConfig;
  loading: boolean;
  error: string | null;
  
  updateConfig: (updates: Partial<AppConfig>) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  resetConfig: () => void;
}

const defaultConfig: AppConfig = {
  theme: 'auto',
  font_size: 14,
  auto_save: true,
  show_hidden_files: false,
};

export const useConfigStore = create<ConfigState>()(
  devtools(
    persist(
      (set, get) => ({
        config: defaultConfig,
        loading: false,
        error: null,
        
        updateConfig: (updates) => {
          const { config } = get();
          set({ config: { ...config, ...updates } });
        },
        setLoading: (loading) => set({ loading }),
        setError: (error) => set({ error }),
        resetConfig: () => set({ config: defaultConfig }),
      }),
      { name: 'config-store' }
    ),
    { name: 'config-store' }
  )
);

// Global app state
interface AppState {
  activeTab: string;
  sidebarOpen: boolean;
  notifications: Array<{
    id: string;
    type: 'info' | 'success' | 'warning' | 'error';
    message: string;
    timestamp: number;
  }>;
  
  setActiveTab: (tab: string) => void;
  setSidebarOpen: (open: boolean) => void;
  addNotification: (notification: Omit<AppState['notifications'][0], 'id' | 'timestamp'>) => void;
  removeNotification: (id: string) => void;
  clearNotifications: () => void;
}

export const useAppStore = create<AppState>()(
  devtools(
    (set, get) => ({
      activeTab: 'files',
      sidebarOpen: true,
      notifications: [],
      
      setActiveTab: (tab) => set({ activeTab: tab }),
      setSidebarOpen: (open) => set({ sidebarOpen: open }),
      addNotification: (notification) => {
        const { notifications } = get();
        const newNotification = {
          ...notification,
          id: Date.now().toString(),
          timestamp: Date.now(),
        };
        set({ notifications: [...notifications, newNotification] });
        
        // Auto-remove after 5 seconds for non-error notifications
        if (notification.type !== 'error') {
          setTimeout(() => {
            const current = get();
            set({
              notifications: current.notifications.filter(n => n.id !== newNotification.id)
            });
          }, 5000);
        }
      },
      removeNotification: (id) => {
        const { notifications } = get();
        set({ notifications: notifications.filter(n => n.id !== id) });
      },
      clearNotifications: () => set({ notifications: [] }),
    }),
    { name: 'app-store' }
  )
);
