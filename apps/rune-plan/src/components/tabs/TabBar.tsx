import React from 'react';
import { X, Plus, FolderOpen, Home, Star, Clock, Archive, Search } from 'lucide-react';
import { Button } from '../ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

export interface Tab {
  id: string;
  title: string;
  path: string;
  type: 'local' | 'remote' | 'search' | 'bookmarks';
  icon?: React.ReactNode;
  modified?: boolean;
  pinned?: boolean;
  loading?: boolean;
}

interface TabBarProps {
  tabs: Tab[];
  activeTabId: string;
  onTabSelect: (tabId: string) => void;
  onTabClose: (tabId: string) => void;
  onTabAdd: (type: 'local' | 'remote' | 'search' | 'bookmarks') => void;
  onTabMove: (fromIndex: number, toIndex: number) => void;
  showAddButton?: boolean;
  maxTabs?: number;
  className?: string;
}

export const TabBar: React.FC<TabBarProps> = ({
  tabs,
  activeTabId,
  onTabSelect,
  onTabClose,
  onTabAdd,
  onTabMove,
  showAddButton = true,
  maxTabs = 10,
  className = '',
}) => {
  const getTabIcon = (tab: Tab) => {
    if (tab.icon) return tab.icon;
    
    switch (tab.type) {
      case 'local':
        return <FolderOpen className="w-4 h-4" />;
      case 'remote':
        return <Archive className="w-4 h-4" />;
      case 'search':
        return <Clock className="w-4 h-4" />;
      case 'bookmarks':
        return <Star className="w-4 h-4" />;
      default:
        return <Home className="w-4 h-4" />;
    }
  };

  const getTabTitle = (tab: Tab) => {
    if (tab.title) return tab.title;
    
    // Extract folder name from path
    const pathParts = tab.path.split('/').filter(Boolean);
    return pathParts[pathParts.length - 1] || 'Root';
  };

  const canCloseTab = (tab: Tab) => {
    return tabs.length > 1 && !tab.pinned;
  };

  const TabComponent: React.FC<{ tab: Tab; isActive: boolean }> = ({ tab, isActive }) => (
    <div
      className={`
        flex items-center gap-2 px-3 py-2 border-r cursor-pointer transition-all
        ${isActive 
          ? 'bg-background border-b-2 border-b-primary' 
          : 'bg-muted/50 hover:bg-muted'
        }
        ${tab.loading ? 'opacity-60' : ''}
        min-w-0 max-w-48
      `}
      onClick={() => onTabSelect(tab.id)}
    >
      <div className="flex-shrink-0">
        {getTabIcon(tab)}
      </div>
      
      <span className="truncate text-sm font-medium">
        {getTabTitle(tab)}
        {tab.modified && <span className="ml-1">•</span>}
      </span>
      
      {canCloseTab(tab) && (
        <Button
          variant="ghost"
          size="sm"
          className="h-4 w-4 p-0 opacity-60 hover:opacity-100 ml-auto flex-shrink-0"
          onClick={(e) => {
            e.stopPropagation();
            onTabClose(tab.id);
          }}
        >
          <X className="w-3 h-3" />
        </Button>
      )}
      
      {tab.pinned && (
        <div className="w-2 h-2 bg-primary rounded-full flex-shrink-0" />
      )}
    </div>
  );

  const NewTabDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0 border-r"
          disabled={tabs.length >= maxTabs}
        >
          <Plus className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start">
        <DropdownMenuItem onClick={() => onTabAdd('local')}>
          <FolderOpen className="w-4 h-4 mr-2" />
          New Local Tab
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onTabAdd('remote')}>
          <Archive className="w-4 h-4 mr-2" />
          New Remote Tab
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => onTabAdd('bookmarks')}>
          <Star className="w-4 h-4 mr-2" />
          Bookmarks
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => onTabAdd('search')}>
          <Search className="w-4 h-4 mr-2" />
          New Search Tab
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className={`flex items-center bg-muted/30 border-b ${className}`}>
      <div className="flex-1 flex overflow-x-auto">
        {tabs.map((tab) => (
          <TabComponent
            key={tab.id}
            tab={tab}
            isActive={tab.id === activeTabId}
          />
        ))}
      </div>
      
      {showAddButton && tabs.length < maxTabs && (
        <div className="flex-shrink-0">
          <NewTabDropdown />
        </div>
      )}
    </div>
  );
};
