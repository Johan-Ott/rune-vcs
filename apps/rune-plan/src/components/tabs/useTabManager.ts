import { useState, useCallback } from 'react';
import type { Tab } from './TabBar';

export interface TabState {
  // Navigation state for this tab
  currentPath: string;
  navigationHistory: Array<{
    path: string;
    timestamp: number;
    name: string;
  }>;
  historyIndex: number;
  
  // View state
  viewMode: 'tree' | 'grid' | 'list';
  sortBy: 'name' | 'modified' | 'size';
  sortOrder: 'asc' | 'desc';
  filterText: string;
  
  // Selection state
  selectedFiles: any[];
  
  // Search state
  searchQuery: string;
  searchResults: any[];
  showSearchResults: boolean;
  
  // UI state
  showDetailsPanel: boolean;
  selectedFile: any | null;
}

const createDefaultTabState = (path: string): TabState => ({
  currentPath: path,
  navigationHistory: [{ path, timestamp: Date.now(), name: path.split('/').pop() || 'Root' }],
  historyIndex: 0,
  viewMode: 'tree',
  sortBy: 'name',
  sortOrder: 'asc',
  filterText: '',
  selectedFiles: [],
  searchQuery: '',
  searchResults: [],
  showSearchResults: false,
  showDetailsPanel: false,
  selectedFile: null,
});

export const useTabManager = (initialPath = '/Users/johanottosson/Documents') => {
  const [tabs, setTabs] = useState<Tab[]>([
    {
      id: 'tab-1',
      title: 'Documents',
      path: initialPath,
      type: 'local',
      pinned: false,
    }
  ]);
  
  const [activeTabId, setActiveTabId] = useState('tab-1');
  const [tabStates, setTabStates] = useState<Record<string, TabState>>({
    'tab-1': createDefaultTabState(initialPath)
  });

  const activeTab = tabs.find(tab => tab.id === activeTabId);
  const activeTabState = tabStates[activeTabId];

  // Tab operations
  const addTab = useCallback((options?: Partial<Tab>) => {
    const newTabId = `tab-${Date.now()}`;
    const newTab: Tab = {
      id: newTabId,
      title: options?.title || 'New Tab',
      path: options?.path || initialPath,
      type: options?.type || 'local',
      icon: options?.icon,
      pinned: options?.pinned || false,
      ...options
    };

    setTabs(prev => [...prev, newTab]);
    setTabStates(prev => ({
      ...prev,
      [newTabId]: createDefaultTabState(newTab.path)
    }));
    setActiveTabId(newTabId);

    return newTabId;
  }, [initialPath]);

  const closeTab = useCallback((tabId: string) => {
    setTabs(prev => {
      const newTabs = prev.filter(tab => tab.id !== tabId);
      
      // If closing active tab, switch to another tab
      if (tabId === activeTabId && newTabs.length > 0) {
        const currentIndex = prev.findIndex(tab => tab.id === tabId);
        const nextTab = newTabs[Math.min(currentIndex, newTabs.length - 1)];
        setActiveTabId(nextTab.id);
      }
      
      return newTabs;
    });

    // Clean up tab state
    setTabStates(prev => {
      const newStates = { ...prev };
      delete newStates[tabId];
      return newStates;
    });
  }, [activeTabId]);

  const selectTab = useCallback((tabId: string) => {
    setActiveTabId(tabId);
  }, []);

  const updateTab = useCallback((tabId: string, updates: Partial<Tab>) => {
    setTabs(prev => prev.map(tab => 
      tab.id === tabId ? { ...tab, ...updates } : tab
    ));
  }, []);

  const duplicateTab = useCallback((tabId: string) => {
    const tab = tabs.find(t => t.id === tabId);
    const tabState = tabStates[tabId];
    
    if (tab && tabState) {
      const newTabId = addTab({
        ...tab,
        title: `${tab.title} (Copy)`,
        pinned: false
      });
      
      // Copy the tab state
      setTabStates(prev => ({
        ...prev,
        [newTabId]: { ...tabState }
      }));
    }
  }, [tabs, tabStates, addTab]);

  const moveTab = useCallback((fromIndex: number, toIndex: number) => {
    setTabs(prev => {
      const newTabs = [...prev];
      const [movedTab] = newTabs.splice(fromIndex, 1);
      newTabs.splice(toIndex, 0, movedTab);
      return newTabs;
    });
  }, []);

  const pinTab = useCallback((tabId: string) => {
    updateTab(tabId, { pinned: true });
  }, [updateTab]);

  const unpinTab = useCallback((tabId: string) => {
    updateTab(tabId, { pinned: false });
  }, [updateTab]);

  // Tab state operations
  const updateTabState = useCallback((tabId: string, updates: Partial<TabState>) => {
    setTabStates(prev => ({
      ...prev,
      [tabId]: { ...prev[tabId], ...updates }
    }));
  }, []);

  const updateActiveTabState = useCallback((updates: Partial<TabState>) => {
    updateTabState(activeTabId, updates);
  }, [activeTabId, updateTabState]);

  // Navigation operations for active tab
  const navigateToPath = useCallback((path: string) => {
    if (!activeTabState) return;

    const newEntry = {
      path,
      timestamp: Date.now(),
      name: path.split('/').pop() || 'Root'
    };

    // Remove any forward history and add new entry
    const newHistory = [
      ...activeTabState.navigationHistory.slice(0, activeTabState.historyIndex + 1),
      newEntry
    ];

    updateActiveTabState({
      currentPath: path,
      navigationHistory: newHistory,
      historyIndex: newHistory.length - 1
    });

    // Update tab title based on current path
    updateTab(activeTabId, {
      title: newEntry.name,
      path: path
    });
  }, [activeTabState, activeTabId, updateActiveTabState, updateTab]);

  const goBack = useCallback(() => {
    if (!activeTabState || activeTabState.historyIndex <= 0) return;

    const newIndex = activeTabState.historyIndex - 1;
    const entry = activeTabState.navigationHistory[newIndex];

    updateActiveTabState({
      currentPath: entry.path,
      historyIndex: newIndex
    });

    updateTab(activeTabId, {
      title: entry.name,
      path: entry.path
    });
  }, [activeTabState, activeTabId, updateActiveTabState, updateTab]);

  const goForward = useCallback(() => {
    if (!activeTabState || activeTabState.historyIndex >= activeTabState.navigationHistory.length - 1) return;

    const newIndex = activeTabState.historyIndex + 1;
    const entry = activeTabState.navigationHistory[newIndex];

    updateActiveTabState({
      currentPath: entry.path,
      historyIndex: newIndex
    });

    updateTab(activeTabId, {
      title: entry.name,
      path: entry.path
    });
  }, [activeTabState, activeTabId, updateActiveTabState, updateTab]);

  const canGoBack = activeTabState?.historyIndex > 0;
  const canGoForward = activeTabState?.historyIndex < (activeTabState?.navigationHistory.length - 1);

  // Quick tab creation helpers
  const openInNewTab = useCallback((path: string, title?: string) => {
    return addTab({
      title: title || path.split('/').pop() || 'New Tab',
      path,
      type: 'local'
    });
  }, [addTab]);

  const openBookmarksTab = useCallback(() => {
    return addTab({
      title: 'Bookmarks',
      path: '/bookmarks',
      type: 'bookmarks'
    });
  }, [addTab]);

  const openSearchTab = useCallback((query: string) => {
    return addTab({
      title: `Search: ${query}`,
      path: `/search?q=${encodeURIComponent(query)}`,
      type: 'search'
    });
  }, [addTab]);

  return {
    // Tab state
    tabs,
    activeTabId,
    activeTab,
    activeTabState,
    tabStates,

    // Tab operations
    addTab,
    closeTab,
    selectTab,
    updateTab,
    duplicateTab,
    moveTab,
    pinTab,
    unpinTab,

    // Tab state operations
    updateTabState,
    updateActiveTabState,

    // Navigation operations
    navigateToPath,
    goBack,
    goForward,
    canGoBack,
    canGoForward,

    // Quick actions
    openInNewTab,
    openBookmarksTab,
    openSearchTab,
  };
};
