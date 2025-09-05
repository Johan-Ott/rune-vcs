import React from 'react';
import { BreadcrumbNavigation } from './BreadcrumbNavigation';
import { NavigationHistory } from './NavigationHistory';
import { BookmarksManager } from './BookmarksManager';
import { QuickPathNavigation } from './QuickPathNavigation';
import { TooltipProvider } from '../ui/tooltip';

interface NavigationHistoryEntry {
  path: string;
  timestamp: number;
  name: string;
}

interface Bookmark {
  id: string;
  name: string;
  path: string;
  icon?: React.ReactNode;
  dateAdded: number;
}

interface PathSuggestion {
  path: string;
  name: string;
  type: 'folder' | 'recent' | 'bookmark';
  icon?: React.ReactNode;
}

interface EnhancedNavigationBarProps {
  // Current state
  currentPath: string;
  currentName: string;
  
  // Navigation history
  history: NavigationHistoryEntry[];
  currentHistoryIndex: number;
  canGoBack: boolean;
  canGoForward: boolean;
  
  // Bookmarks
  bookmarks: Bookmark[];
  isCurrentPathBookmarked: boolean;
  
  // Path suggestions for quick navigation
  pathSuggestions?: PathSuggestion[];
  
  // Event handlers
  onNavigate: (path: string) => void;
  onNavigateBack: () => void;
  onNavigateForward: () => void;
  onRefresh: () => void;
  onOpenInNewTab?: () => void;
  
  // Bookmark handlers
  onAddBookmark: (bookmark: Omit<Bookmark, 'id' | 'dateAdded'>) => void;
  onRemoveBookmark: (id: string) => void;
  onUpdateBookmark: (id: string, updates: Partial<Bookmark>) => void;
  
  // Path change handler
  onPathChange?: (path: string) => void;
  
  // Layout options
  showBreadcrumbs?: boolean;
  showQuickPath?: boolean;
  showBookmarks?: boolean;
  className?: string;
}

export const EnhancedNavigationBar: React.FC<EnhancedNavigationBarProps> = ({
  currentPath,
  currentName,
  history,
  currentHistoryIndex,
  canGoBack,
  canGoForward,
  bookmarks,
  isCurrentPathBookmarked,
  pathSuggestions = [],
  onNavigate,
  onNavigateBack,
  onNavigateForward,
  onRefresh,
  onOpenInNewTab,
  onAddBookmark,
  onRemoveBookmark,
  onUpdateBookmark,
  onPathChange,
  showBreadcrumbs = true,
  showQuickPath = true,
  showBookmarks = true,
  className = '',
}) => {
  // Convert bookmarks to breadcrumb items for quick access
  const bookmarkItems = bookmarks.map(bookmark => ({
    name: bookmark.name,
    path: bookmark.path,
    icon: bookmark.icon,
  }));

  // Convert history to recent paths
  const recentPaths = history
    .filter((_, index) => index !== currentHistoryIndex)
    .map(entry => ({
      name: entry.name,
      path: entry.path,
    }))
    .slice(-5); // Last 5 recent paths

  return (
    <TooltipProvider>
      <div className={`flex flex-col gap-2 p-2 border-b bg-background/50 backdrop-blur-sm ${className}`}>
        {/* Top row: History controls and bookmarks */}
        <div className="flex items-center justify-between">
          <NavigationHistory
            history={history}
            currentIndex={currentHistoryIndex}
            canGoBack={canGoBack}
            canGoForward={canGoForward}
            onNavigateBack={onNavigateBack}
            onNavigateForward={onNavigateForward}
            onRefresh={onRefresh}
            onOpenInNewTab={onOpenInNewTab}
          />
          
          {showBookmarks && (
            <BookmarksManager
              currentPath={currentPath}
              currentName={currentName}
              bookmarks={bookmarks}
              isBookmarked={isCurrentPathBookmarked}
              onAddBookmark={onAddBookmark}
              onRemoveBookmark={onRemoveBookmark}
              onUpdateBookmark={onUpdateBookmark}
              onNavigateToBookmark={onNavigate}
            />
          )}
        </div>

        {/* Bottom row: Path navigation */}
        <div className="flex items-center gap-2">
          {showBreadcrumbs && (
            <BreadcrumbNavigation
              currentPath={currentPath}
              onNavigate={onNavigate}
              bookmarks={bookmarkItems}
              recentPaths={recentPaths}
              className="flex-1"
            />
          )}
          
          {showQuickPath && (
            <QuickPathNavigation
              currentPath={currentPath}
              onNavigate={onNavigate}
              suggestions={pathSuggestions}
              recentPaths={history.map(h => h.path)}
              bookmarks={bookmarks.map(b => b.path)}
              onPathChange={onPathChange}
              className="flex-1 max-w-md"
            />
          )}
        </div>
      </div>
    </TooltipProvider>
  );
};
