/**
 * FileExplorer Bridge
 * 
 * This adapter connects the existing FileExplorerNew component 
 * with the new clean architecture, allowing gradual migration
 */

import React, { useEffect, useState } from 'react';
import { FileExplorer as FileExplorerNew } from './FileExplorerNew';
import { 
  useFileSystemUseCase, 
  useNavigationUseCase, 
  useAppStateStore,
  AppStateStore,
  useAppSelector,
  selectors 
} from '../core';
import { FileItem } from '../services/TauriFileService';
import { FileSystemItem } from '../core/domain/models';

interface FileExplorerBridgeProps {
  isDark: boolean;
  tabType?: string;
  section?: string;
  isWelcomeTab?: boolean;
  isProfileTab?: boolean;
  onLocationSelect?: (type: 'explorer' | 'repository', path: string) => void;
  onThemeToggle?: () => void;
}

/**
 * Bridge component that provides clean architecture data to existing UI
 */
export const FileExplorerBridge: React.FC<FileExplorerBridgeProps> = (props) => {
  const fileSystemUseCase = useFileSystemUseCase();
  const navigationUseCase = useNavigationUseCase();
  const stateStore = useAppStateStore() as AppStateStore;
  
  // Use selectors for reactive state
  const currentPath = useAppSelector(stateStore, selectors.currentPath);
  const isLoading = useAppSelector(stateStore, selectors.isLoading);
  const selectedItems = useAppSelector(stateStore, selectors.selectedItems);
  const viewMode = useAppSelector(stateStore, selectors.viewMode);
  const navigation = useAppSelector(stateStore, selectors.navigation);
  
  // Local state for backward compatibility
  const [files, setFiles] = useState<FileItem[]>([]);
  const [adaptedSelectedItems, setAdaptedSelectedItems] = useState<Set<string>>(new Set());

  // Initialize file explorer
  useEffect(() => {
    const initializeExplorer = async () => {
      try {
        if (!currentPath) {
          const homeDir = await fileSystemUseCase['fileSystemService'].getCurrentDirectory();
          await fileSystemUseCase.navigateToDirectory(homeDir);
        } else {
          await fileSystemUseCase.refreshCurrentDirectory();
        }
      } catch (error) {
        console.error('Failed to initialize file explorer:', error);
      }
    };

    initializeExplorer();
  }, [fileSystemUseCase, currentPath]);

  // Convert domain models to legacy format when needed
  useEffect(() => {
    const loadCurrentDirectoryFiles = async () => {
      if (currentPath) {
        try {
          const items = await fileSystemUseCase['fileSystemService'].readDirectory(currentPath);
          const convertedFiles = items.map(convertFileSystemItemToLegacy);
          setFiles(convertedFiles);
        } catch (error) {
          console.error('Failed to load directory files:', error);
          setFiles([]);
        }
      }
    };

    loadCurrentDirectoryFiles();
  }, [currentPath, fileSystemUseCase]);

  // Sync selected items
  useEffect(() => {
    const newSelectedSet = new Set(selectedItems.map(item => item.path));
    setAdaptedSelectedItems(newSelectedSet);
  }, [selectedItems]);

  // Helper function to convert FileSystemItem to legacy FileItem format
  const convertFileSystemItemToLegacy = (item: FileSystemItem): FileItem => ({
    name: item.name,
    path: item.path,
    isDirectory: item.type === 'directory',
    size: item.size || 0,
    modified: item.lastModified,
    extension: item.name.includes('.') ? item.name.split('.').pop() || '' : '',
  });

  // Enhanced location select handler that uses clean architecture
  const handleLocationSelect = async (type: 'explorer' | 'repository', path: string) => {
    try {
      await fileSystemUseCase.navigateToDirectory(path);
      props.onLocationSelect?.(type, path);
    } catch (error) {
      console.error('Navigation failed:', error);
    }
  };

  // Pass enhanced props to the existing component
  const enhancedProps = {
    ...props,
    onLocationSelect: handleLocationSelect,
    // Inject clean architecture state
    currentPathOverride: currentPath,
    filesOverride: files,
    loadingOverride: isLoading,
    selectedItemsOverride: adaptedSelectedItems,
    viewModeOverride: viewMode.type as 'list' | 'grid' | 'details' | 'tree',
    navigationHistoryOverride: navigation.history,
    historyIndexOverride: navigation.historyIndex,
    
    // Inject clean architecture methods
    onNavigateToPath: async (path: string) => {
      await fileSystemUseCase.navigateToDirectory(path);
    },
    onGoBack: async () => {
      await navigationUseCase.goBack();
    },
    onGoForward: async () => {
      await navigationUseCase.goForward();
    },
    onGoUp: async () => {
      await navigationUseCase.goToParent();
    },
    onRefresh: async () => {
      await fileSystemUseCase.refreshCurrentDirectory();
    },
    onSelectItem: (item: FileItem, multiSelect: boolean = false) => {
      const domainItem: FileSystemItem = {
        id: item.path,
        name: item.name,
        path: item.path,
        type: item.isDirectory ? 'directory' : 'file',
        size: item.size,
        lastModified: item.modified || new Date(),
      };
      fileSystemUseCase.selectItem(domainItem, multiSelect);
    },
    onClearSelection: () => {
      fileSystemUseCase.clearSelection();
    },
    onChangeViewMode: (mode: any) => {
      fileSystemUseCase.changeViewMode(mode);
    },
    onCreateFile: async (name: string) => {
      await fileSystemUseCase.createFile(currentPath, name);
    },
    onCreateDirectory: async (name: string) => {
      await fileSystemUseCase.createDirectory(currentPath, name);
    },
    onDeleteItems: async (items: FileItem[]) => {
      const domainItems = items.map(item => ({
        id: item.path,
        name: item.name,
        path: item.path,
        type: item.isDirectory ? 'directory' as const : 'file' as const,
        size: item.size,
        lastModified: item.modified || new Date(),
      }));
      await fileSystemUseCase.deleteItems(domainItems);
    }
  };

  return <FileExplorerNew {...enhancedProps} />;
};

/**
 * Enhanced FileExplorer that uses clean architecture
 * This is the new default export that should be used
 */
export const FileExplorer: React.FC<FileExplorerBridgeProps> = (props) => {
  return <FileExplorerBridge {...props} />;
};
