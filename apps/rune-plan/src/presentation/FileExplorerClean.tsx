/**
 * Clean File Explorer Component (Presentation Layer)
 * 
 * This component is purely for presentation and delegates all logic
 * to the application use cases. It follows clean architecture principles.
 */

import React, { useEffect } from 'react';
import { FileSystemItem } from '../core/domain/models';
import { 
  useFileSystemUseCase, 
  useNavigationUseCase, 
  useAppStateStore 
} from '../core/infrastructure/di-container';
import { useAppState, useAppSelector, selectors } from '../core/infrastructure/state.store';
import { Button } from './ui/button';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronUp, 
  Home, 
  RefreshCw,
  Grid,
  List,
  TreePine,
  MoreVertical
} from 'lucide-react';

// ============================================================================
// File Explorer Container (Smart Component)
// ============================================================================

export function FileExplorer(): React.ReactElement {
  const fileSystemUseCase = useFileSystemUseCase();
  const navigationUseCase = useNavigationUseCase();
  const stateStore = useAppStateStore();
  
  // Use selectors for specific state slices
  const currentPath = useAppSelector(stateStore, selectors.currentPath);
  const viewMode = useAppSelector(stateStore, selectors.viewMode);
  const selection = useAppSelector(stateStore, selectors.selection);
  const isLoading = useAppSelector(stateStore, selectors.isLoading);
  const canGoBack = useAppSelector(stateStore, selectors.canGoBack);
  const canGoForward = useAppSelector(stateStore, selectors.canGoForward);

  // Initialize with current directory
  useEffect(() => {
    const initializeFileExplorer = async () => {
      try {
        const currentDir = await fileSystemUseCase['fileSystemService'].getCurrentDirectory();
        await fileSystemUseCase.navigateToDirectory(currentDir);
      } catch (error) {
        console.error('Failed to initialize file explorer:', error);
      }
    };

    if (!currentPath) {
      initializeFileExplorer();
    }
  }, [fileSystemUseCase, currentPath]);

  // Event handlers that delegate to use cases
  const handleNavigateToDirectory = async (path: string) => {
    await fileSystemUseCase.navigateToDirectory(path);
  };

  const handleGoBack = async () => {
    await navigationUseCase.goBack();
  };

  const handleGoForward = async () => {
    await navigationUseCase.goForward();
  };

  const handleGoUp = async () => {
    await navigationUseCase.goToParent();
  };

  const handleRefresh = async () => {
    await fileSystemUseCase.refreshCurrentDirectory();
  };

  const handleSelectItem = (item: FileSystemItem, multiSelect: boolean = false) => {
    fileSystemUseCase.selectItem(item, multiSelect);
  };

  const handleDoubleClickItem = async (item: FileSystemItem) => {
    if (item.type === 'directory') {
      await fileSystemUseCase.navigateToDirectory(item.path);
    }
    // For files, could open in editor or external app
  };

  const handleChangeViewMode = (newViewMode: any) => {
    fileSystemUseCase.changeViewMode(newViewMode);
  };

  return (
    <div className="h-full flex flex-col bg-gray-950 text-white">
      {/* Toolbar */}
      <FileExplorerToolbar
        currentPath={currentPath}
        canGoBack={canGoBack}
        canGoForward={canGoForward}
        viewMode={viewMode}
        isLoading={isLoading}
        onGoBack={handleGoBack}
        onGoForward={handleGoForward}
        onGoUp={handleGoUp}
        onRefresh={handleRefresh}
        onChangeViewMode={handleChangeViewMode}
        onNavigateToPath={handleNavigateToDirectory}
      />

      {/* Main Content */}
      <div className="flex-1 flex">
        {/* File List */}
        <FileExplorerContent
          currentPath={currentPath}
          viewMode={viewMode}
          selection={selection}
          isLoading={isLoading}
          onSelectItem={handleSelectItem}
          onDoubleClickItem={handleDoubleClickItem}
          onNavigateToDirectory={handleNavigateToDirectory}
        />
      </div>
    </div>
  );
}

// ============================================================================
// Toolbar Component (Dumb Component)
// ============================================================================

interface FileExplorerToolbarProps {
  currentPath: string;
  canGoBack: boolean;
  canGoForward: boolean;
  viewMode: any;
  isLoading: boolean;
  onGoBack: () => void;
  onGoForward: () => void;
  onGoUp: () => void;
  onRefresh: () => void;
  onChangeViewMode: (viewMode: any) => void;
  onNavigateToPath: (path: string) => void;
}

function FileExplorerToolbar({
  currentPath,
  canGoBack,
  canGoForward,
  viewMode,
  isLoading,
  onGoBack,
  onGoForward,
  onGoUp,
  onRefresh,
  onChangeViewMode,
  onNavigateToPath
}: FileExplorerToolbarProps): React.ReactElement {
  return (
    <div className="flex items-center gap-2 p-3 border-b border-gray-800 bg-gray-900/50">
      {/* Navigation buttons */}
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          disabled={!canGoBack}
          onClick={onGoBack}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          disabled={!canGoForward}
          onClick={onGoForward}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={onGoUp}
          className="h-8 w-8 p-0"
        >
          <ChevronUp className="h-4 w-4" />
        </Button>
      </div>

      {/* Address bar */}
      <div className="flex-1 mx-4">
        <AddressBar
          currentPath={currentPath}
          onNavigateToPath={onNavigateToPath}
        />
      </div>

      {/* View mode controls */}
      <div className="flex items-center gap-1">
        <Button
          variant={viewMode.type === 'tree' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => onChangeViewMode({ type: 'tree' })}
          className="h-8 w-8 p-0"
        >
          <TreePine className="h-4 w-4" />
        </Button>
        
        <Button
          variant={viewMode.type === 'list' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => onChangeViewMode({ type: 'list' })}
          className="h-8 w-8 p-0"
        >
          <List className="h-4 w-4" />
        </Button>
        
        <Button
          variant={viewMode.type === 'grid' ? 'secondary' : 'ghost'}
          size="sm"
          onClick={() => onChangeViewMode({ type: 'grid' })}
          className="h-8 w-8 p-0"
        >
          <Grid className="h-4 w-4" />
        </Button>
      </div>

      {/* Refresh button */}
      <Button
        variant="ghost"
        size="sm"
        onClick={onRefresh}
        disabled={isLoading}
        className="h-8 w-8 p-0"
      >
        <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
      </Button>
    </div>
  );
}

// ============================================================================
// Address Bar Component
// ============================================================================

interface AddressBarProps {
  currentPath: string;
  onNavigateToPath: (path: string) => void;
}

function AddressBar({ currentPath, onNavigateToPath }: AddressBarProps): React.ReactElement {
  const [isEditing, setIsEditing] = React.useState(false);
  const [editPath, setEditPath] = React.useState(currentPath);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      onNavigateToPath(editPath);
      setIsEditing(false);
    } else if (e.key === 'Escape') {
      setEditPath(currentPath);
      setIsEditing(false);
    }
  };

  if (isEditing) {
    return (
      <input
        type="text"
        value={editPath}
        onChange={(e) => setEditPath(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={() => setIsEditing(false)}
        className="w-full px-3 py-1 bg-gray-800 border border-gray-600 rounded text-sm"
        autoFocus
      />
    );
  }

  return (
    <div
      onClick={() => setIsEditing(true)}
      className="w-full px-3 py-1 bg-gray-800 border border-gray-700 rounded text-sm cursor-text hover:border-gray-600"
    >
      {currentPath || '/'}
    </div>
  );
}

// ============================================================================
// Content Component (Will delegate to existing components)
// ============================================================================

interface FileExplorerContentProps {
  currentPath: string;
  viewMode: any;
  selection: any;
  isLoading: boolean;
  onSelectItem: (item: FileSystemItem, multiSelect?: boolean) => void;
  onDoubleClickItem: (item: FileSystemItem) => void;
  onNavigateToDirectory: (path: string) => void;
}

function FileExplorerContent({
  currentPath,
  viewMode,
  selection,
  isLoading,
  onSelectItem,
  onDoubleClickItem,
  onNavigateToDirectory
}: FileExplorerContentProps): React.ReactElement {
  // For now, we'll integrate with your existing FileExplorerNew component
  // Later we can create clean view components for each view mode
  
  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="flex items-center gap-2">
          <RefreshCw className="h-4 w-4 animate-spin" />
          <span>Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-4">
      <div className="text-gray-400 text-sm mb-4">
        Current path: {currentPath}
      </div>
      <div className="text-gray-400 text-sm">
        View mode: {viewMode.type} | Selected: {selection.items.length} items
      </div>
      {/* This is where we'll integrate your existing FileExplorerNew component */}
      {/* or create new clean view components */}
    </div>
  );
}
