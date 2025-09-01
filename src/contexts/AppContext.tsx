// Application Context - Global state management for the Nordic File Explorer
// Separates state logic from UI components for better maintainability

import React, { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { FolderOpen, GitBranch } from 'lucide-react';

// Types
export interface Tab {
  id: string;
  label: string;
  type: 'explorer' | 'repository';
  icon: React.ComponentType<any>;
  path?: string;
  isActive?: boolean;
  isWelcome?: boolean;
  branch?: string;
  currentPath?: string;
}

export interface AppState {
  isDark: boolean;
  tabs: Tab[];
  activeTabId: string;
  sidebarSection: string;
  isLoading: boolean;
  error: string | null;
  notifications: Notification[];
}

export interface Notification {
  id: string;
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  timestamp: number;
  autoHide?: boolean;
}

// Action types
type AppAction =
  | { type: 'SET_THEME'; payload: boolean }
  | { type: 'SET_TABS'; payload: Tab[] }
  | { type: 'ADD_TAB'; payload: Tab }
  | { type: 'REMOVE_TAB'; payload: string }
  | { type: 'SET_ACTIVE_TAB'; payload: string }
  | { type: 'UPDATE_TAB'; payload: { id: string; updates: Partial<Tab> } }
  | { type: 'SET_SIDEBAR_SECTION'; payload: string }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'ADD_NOTIFICATION'; payload: Notification }
  | { type: 'REMOVE_NOTIFICATION'; payload: string }
  | { type: 'CLEAR_NOTIFICATIONS' };

// Initial state
const initialState: AppState = {
  isDark: true,
  tabs: [
    {
      id: 'tab-1',
      label: 'Documents',
      type: 'explorer',
      icon: FolderOpen,
      path: '/home/projects/nordic-explorer',
      currentPath: 'Documents',
      isActive: true
    },
    {
      id: 'tab-2',
      label: 'Repository',
      type: 'repository',
      icon: GitBranch,
      path: '/home/repositories/nordic-explorer',
      branch: 'main'
    }
  ],
  activeTabId: 'tab-1',
  sidebarSection: 'source',
  isLoading: false,
  error: null,
  notifications: []
};

// Reducer
function appReducer(state: AppState, action: AppAction): AppState {
  switch (action.type) {
    case 'SET_THEME':
      return { ...state, isDark: action.payload };

    case 'SET_TABS':
      return { ...state, tabs: action.payload };

    case 'ADD_TAB':
      return { 
        ...state, 
        tabs: [...state.tabs, action.payload],
        activeTabId: action.payload.id
      };

    case 'REMOVE_TAB': {
      const newTabs = state.tabs.filter(tab => tab.id !== action.payload);
      let newActiveTabId = state.activeTabId;
      
      // If removing active tab, switch to another tab
      if (action.payload === state.activeTabId && newTabs.length > 0) {
        newActiveTabId = newTabs[0].id;
      }
      
      return {
        ...state,
        tabs: newTabs,
        activeTabId: newActiveTabId
      };
    }

    case 'SET_ACTIVE_TAB':
      return { ...state, activeTabId: action.payload };

    case 'UPDATE_TAB':
      return {
        ...state,
        tabs: state.tabs.map(tab =>
          tab.id === action.payload.id
            ? { ...tab, ...action.payload.updates }
            : tab
        )
      };

    case 'SET_SIDEBAR_SECTION':
      return { ...state, sidebarSection: action.payload };

    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };

    case 'SET_ERROR':
      return { ...state, error: action.payload };

    case 'ADD_NOTIFICATION':
      return {
        ...state,
        notifications: [...state.notifications, action.payload]
      };

    case 'REMOVE_NOTIFICATION':
      return {
        ...state,
        notifications: state.notifications.filter(n => n.id !== action.payload)
      };

    case 'CLEAR_NOTIFICATIONS':
      return { ...state, notifications: [] };

    default:
      return state;
  }
}

// Context
interface AppContextType {
  state: AppState;
  dispatch: React.Dispatch<AppAction>;
  
  // Convenience methods
  setTheme: (isDark: boolean) => void;
  addTab: (tabType?: 'explorer' | 'repository' | 'profile') => void;
  removeTab: (tabId: string) => void;
  setActiveTab: (tabId: string) => void;
  updateTabLocation: (tabId: string, newPath: string) => void;
  updateTabBranch: (tabId: string, branch: string) => void;
  setSidebarSection: (section: string) => void;
  showNotification: (notification: Omit<Notification, 'id' | 'timestamp'>) => void;
  hideNotification: (id: string) => void;
  setError: (error: string | null) => void;
  setLoading: (loading: boolean) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Provider component
interface AppProviderProps {
  children: ReactNode;
}

export function AppProvider({ children }: AppProviderProps) {
  const [state, dispatch] = useReducer(appReducer, initialState);

  // Theme effect - defensive programming for SSR/hydration
  useEffect(() => {
    try {
      if (typeof document !== 'undefined') {
        if (state.isDark) {
          document.documentElement.classList.add('dark');
        } else {
          document.documentElement.classList.remove('dark');
        }
      }
    } catch (error) {
      console.error('Error setting theme:', error);
    }
  }, [state.isDark]);

  // Auto-hide notifications
  useEffect(() => {
    const timers: NodeJS.Timeout[] = [];

    state.notifications.forEach(notification => {
      if (notification.autoHide !== false) {
        const timer = setTimeout(() => {
          dispatch({ type: 'REMOVE_NOTIFICATION', payload: notification.id });
        }, 5000);
        timers.push(timer);
      }
    });

    return () => {
      timers.forEach(timer => clearTimeout(timer));
    };
  }, [state.notifications]);

  // Convenience methods
  const setTheme = (isDark: boolean) => {
    dispatch({ type: 'SET_THEME', payload: isDark });
  };

  const addTab = (tabType?: 'explorer' | 'repository' | 'profile') => {
    let newTab: Tab;
    
    if (tabType === 'repository') {
      newTab = {
        id: `tab-${Date.now()}`,
        label: 'New Repository',
        type: 'repository',
        icon: GitBranch,
        isWelcome: true,
      };
    } else if (tabType === 'profile') {
      newTab = {
        id: `tab-${Date.now()}`,
        label: 'Profile & Settings',
        type: 'explorer',
        icon: FolderOpen,
        isWelcome: true,
      };
      // Auto-set profile section
      dispatch({ type: 'SET_SIDEBAR_SECTION', payload: 'profile' });
    } else {
      newTab = {
        id: `tab-${Date.now()}`,
        label: 'Welcome',
        type: 'explorer',
        icon: FolderOpen,
        isWelcome: true,
      };
    }
    
    dispatch({ type: 'ADD_TAB', payload: newTab });
  };

  const removeTab = (tabId: string) => {
    if (state.tabs.length === 1) return; // Don't close if it's the only tab
    dispatch({ type: 'REMOVE_TAB', payload: tabId });
  };

  const setActiveTab = (tabId: string) => {
    dispatch({ type: 'SET_ACTIVE_TAB', payload: tabId });
    
    // Set appropriate sidebar section based on tab type
    const newTab = state.tabs.find(tab => tab.id === tabId);
    if (newTab) {
      const currentTab = state.tabs.find(tab => tab.id === state.activeTabId);
      const isNewTabProfile = newTab.label === 'Profile & Settings';
      const isCurrentTabProfile = currentTab?.label === 'Profile & Settings';
      
      // Only reset section if switching between different tab types
      if (currentTab && (currentTab.type !== newTab.type || isNewTabProfile !== isCurrentTabProfile)) {
        const repositorySections = ['source', 'explorer', 'branches', 'workspace'];
        const explorerSections = ['quick-access', 'this-pc', 'cloud', 'recent'];
        const profileSections = ['profile', 'appearance', 'editor', 'notifications', 'security', 'storage', 'shortcuts', 'advanced'];
        
        if (isNewTabProfile && !profileSections.includes(state.sidebarSection)) {
          dispatch({ type: 'SET_SIDEBAR_SECTION', payload: 'profile' });
        } else if (newTab.type === 'repository' && !repositorySections.includes(state.sidebarSection)) {
          dispatch({ type: 'SET_SIDEBAR_SECTION', payload: 'source' });
        } else if (newTab.type === 'explorer' && !isNewTabProfile && !explorerSections.includes(state.sidebarSection)) {
          dispatch({ type: 'SET_SIDEBAR_SECTION', payload: 'quick-access' });
        }
      }
    }
  };

  const updateTabLocation = (tabId: string, newPath: string) => {
    const pathSegments = newPath.split('/').filter(Boolean);
    const pathName = pathSegments[pathSegments.length - 1] || 'Home';
    const label = pathName === 'recent' ? 'Recent files' : 
                  pathName === 'starred' ? 'Starred' :
                  pathName === 'shared' ? 'Shared' : pathName;

    dispatch({
      type: 'UPDATE_TAB',
      payload: {
        id: tabId,
        updates: {
          currentPath: newPath,
          label
        }
      }
    });
  };

  const updateTabBranch = (tabId: string, branch: string) => {
    dispatch({
      type: 'UPDATE_TAB',
      payload: {
        id: tabId,
        updates: { branch }
      }
    });
  };

  const setSidebarSection = (section: string) => {
    dispatch({ type: 'SET_SIDEBAR_SECTION', payload: section });
  };

  const showNotification = (notification: Omit<Notification, 'id' | 'timestamp'>) => {
    const newNotification: Notification = {
      id: `notification-${Date.now()}`,
      timestamp: Date.now(),
      autoHide: true,
      ...notification
    };
    dispatch({ type: 'ADD_NOTIFICATION', payload: newNotification });
  };

  const hideNotification = (id: string) => {
    dispatch({ type: 'REMOVE_NOTIFICATION', payload: id });
  };

  const setError = (error: string | null) => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const setLoading = (loading: boolean) => {
    dispatch({ type: 'SET_LOADING', payload: loading });
  };

  const contextValue: AppContextType = {
    state,
    dispatch,
    setTheme,
    addTab,
    removeTab,
    setActiveTab,
    updateTabLocation,
    updateTabBranch,
    setSidebarSection,
    showNotification,
    hideNotification,
    setError,
    setLoading
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
}

// Custom hook to use the context
export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}