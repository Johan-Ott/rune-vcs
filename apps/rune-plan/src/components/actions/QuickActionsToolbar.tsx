import React from 'react';
import {
  Copy,
  Scissors,
  ClipboardPaste,
  Trash2,
  FolderPlus,
  FilePlus,
  Download,
  Upload,
  Archive,
  Share,
  Star,
  RotateCcw,
  Settings,
  Grid,
  List,
  TreePine,
  SortAsc,
  Filter,
  Search,
  Maximize2,
  MoreHorizontal
} from 'lucide-react';
import { Button } from '../ui/button';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '../ui/tooltip';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

interface QuickAction {
  id: string;
  label: string;
  icon: React.ReactNode;
  shortcut?: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost';
}

interface QuickActionsToolbarProps {
  // File operations
  onCopy: () => void;
  onCut: () => void;
  onPaste: () => void;
  onDelete: () => void;
  onNewFolder: () => void;
  onNewFile: () => void;
  onDownload: () => void;
  onUpload: () => void;
  onArchive: () => void;
  onShare: () => void;
  onRefresh: () => void;
  
  // View controls
  viewMode: 'tree' | 'grid' | 'list';
  onViewModeChange: (mode: 'tree' | 'grid' | 'list') => void;
  onSort: () => void;
  onFilter: () => void;
  onSearch: () => void;
  onFullscreen: () => void;
  
  // State
  hasSelection: boolean;
  canPaste: boolean;
  selectedCount: number;
  className?: string;
}

export const QuickActionsToolbar: React.FC<QuickActionsToolbarProps> = ({
  onCopy,
  onCut,
  onPaste,
  onDelete,
  onNewFolder,
  onNewFile,
  onDownload,
  onUpload,
  onArchive,
  onShare,
  onRefresh,
  viewMode,
  onViewModeChange,
  onSort,
  onFilter,
  onSearch,
  onFullscreen,
  hasSelection,
  canPaste,
  selectedCount,
  className = '',
}) => {
  const primaryActions: QuickAction[] = [
    {
      id: 'new-folder',
      label: 'New Folder',
      icon: <FolderPlus className="w-4 h-4" />,
      shortcut: '⌘⇧N',
      onClick: onNewFolder,
    },
    {
      id: 'new-file',
      label: 'New File',
      icon: <FilePlus className="w-4 h-4" />,
      shortcut: '⌘N',
      onClick: onNewFile,
    },
  ];

  const selectionActions: QuickAction[] = [
    {
      id: 'copy',
      label: selectedCount > 1 ? `Copy ${selectedCount} items` : 'Copy',
      icon: <Copy className="w-4 h-4" />,
      shortcut: '⌘C',
      onClick: onCopy,
      disabled: !hasSelection,
    },
    {
      id: 'cut',
      label: selectedCount > 1 ? `Cut ${selectedCount} items` : 'Cut',
      icon: <Scissors className="w-4 h-4" />,
      shortcut: '⌘X',
      onClick: onCut,
      disabled: !hasSelection,
    },
    {
      id: 'paste',
      label: 'Paste',
      icon: <ClipboardPaste className="w-4 h-4" />,
      shortcut: '⌘V',
      onClick: onPaste,
      disabled: !canPaste,
    },
    {
      id: 'delete',
      label: selectedCount > 1 ? `Delete ${selectedCount} items` : 'Delete',
      icon: <Trash2 className="w-4 h-4" />,
      shortcut: '⌘⌫',
      onClick: onDelete,
      disabled: !hasSelection,
      variant: 'destructive' as const,
    },
  ];

  const utilityActions: QuickAction[] = [
    {
      id: 'download',
      label: 'Download',
      icon: <Download className="w-4 h-4" />,
      shortcut: '⌘D',
      onClick: onDownload,
      disabled: !hasSelection,
    },
    {
      id: 'upload',
      label: 'Upload',
      icon: <Upload className="w-4 h-4" />,
      onClick: onUpload,
    },
    {
      id: 'archive',
      label: 'Archive',
      icon: <Archive className="w-4 h-4" />,
      onClick: onArchive,
      disabled: !hasSelection,
    },
    {
      id: 'share',
      label: 'Share',
      icon: <Share className="w-4 h-4" />,
      onClick: onShare,
      disabled: !hasSelection,
    },
  ];

  const viewActions: QuickAction[] = [
    {
      id: 'tree-view',
      label: 'Tree View',
      icon: <TreePine className="w-4 h-4" />,
      shortcut: '⌘1',
      onClick: () => onViewModeChange('tree'),
      variant: viewMode === 'tree' ? 'default' : 'ghost' as const,
    },
    {
      id: 'grid-view',
      label: 'Grid View',
      icon: <Grid className="w-4 h-4" />,
      shortcut: '⌘2',
      onClick: () => onViewModeChange('grid'),
      variant: viewMode === 'grid' ? 'default' : 'ghost' as const,
    },
    {
      id: 'list-view',
      label: 'List View',
      icon: <List className="w-4 h-4" />,
      shortcut: '⌘3',
      onClick: () => onViewModeChange('list'),
      variant: viewMode === 'list' ? 'default' : 'ghost' as const,
    },
  ];

  const controlActions: QuickAction[] = [
    {
      id: 'sort',
      label: 'Sort',
      icon: <SortAsc className="w-4 h-4" />,
      onClick: onSort,
    },
    {
      id: 'filter',
      label: 'Filter',
      icon: <Filter className="w-4 h-4" />,
      onClick: onFilter,
    },
    {
      id: 'search',
      label: 'Search',
      icon: <Search className="w-4 h-4" />,
      shortcut: '⌘F',
      onClick: onSearch,
    },
    {
      id: 'refresh',
      label: 'Refresh',
      icon: <RotateCcw className="w-4 h-4" />,
      shortcut: 'F5',
      onClick: onRefresh,
    },
  ];

  const ActionButton: React.FC<{ action: QuickAction }> = ({ action }) => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant={action.variant || 'ghost'}
          size="sm"
          onClick={action.onClick}
          disabled={action.disabled}
          className="h-8 px-2"
        >
          {action.icon}
          <span className="sr-only">{action.label}</span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <div className="flex items-center gap-2">
          <span>{action.label}</span>
          {action.shortcut && (
            <kbd className="px-1.5 py-0.5 text-xs bg-muted rounded border">
              {action.shortcut}
            </kbd>
          )}
        </div>
      </TooltipContent>
    </Tooltip>
  );

  const MoreActionsDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 px-2">
          <MoreHorizontal className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {utilityActions.map((action) => (
          <DropdownMenuItem
            key={action.id}
            onClick={action.onClick}
            disabled={action.disabled}
          >
            {action.icon}
            <span className="ml-2">{action.label}</span>
            {action.shortcut && (
              <span className="ml-auto text-xs text-muted-foreground">
                {action.shortcut}
              </span>
            )}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onFullscreen}>
          <Maximize2 className="w-4 h-4" />
          <span className="ml-2">Fullscreen</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <TooltipProvider>
      <div className={`flex items-center gap-1 p-2 border-b bg-background/50 backdrop-blur-sm ${className}`}>
        {/* Primary Actions */}
        <div className="flex items-center gap-1">
          {primaryActions.map((action) => (
            <ActionButton key={action.id} action={action} />
          ))}
        </div>

        <div className="w-px h-6 bg-border mx-1" />

        {/* Selection Actions */}
        <div className="flex items-center gap-1">
          {selectionActions.map((action) => (
            <ActionButton key={action.id} action={action} />
          ))}
        </div>

        <div className="w-px h-6 bg-border mx-1" />

        {/* View Mode */}
        <div className="flex items-center gap-1">
          {viewActions.map((action) => (
            <ActionButton key={action.id} action={action} />
          ))}
        </div>

        <div className="flex-1" />

        {/* Control Actions */}
        <div className="flex items-center gap-1">
          {controlActions.map((action) => (
            <ActionButton key={action.id} action={action} />
          ))}
        </div>

        {/* More Actions */}
        <MoreActionsDropdown />
      </div>
    </TooltipProvider>
  );
};
