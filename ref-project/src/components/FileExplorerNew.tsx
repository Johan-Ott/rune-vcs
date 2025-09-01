import React, { useState, useEffect } from 'react';
import { 
  Folder, 
  File, 
  FileText, 
  FileImage, 
  FileCode, 
  FileVideo,
  FileAudio,
  Archive,
  Grid3X3,
  List,
  Star,
  Clock,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  Home,
  SortAsc,
  FolderOpen,
  Search,
  FileX,
  Download,
  Columns3,
  Info,
  Share2,
  ChevronRight,
  ChevronDown,
  HardDrive,
  Cloud,
  MoreHorizontal,
  Eye,
  RefreshCw,
  TreePine
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from './ui/dropdown-menu';
import { Separator } from './ui/separator';
import { toast } from 'sonner';
import { fileService, FileItem } from '../services/TauriFileService';
import { FileSidebar } from './FileSidebar';
import { FileContextMenu } from './FileContextMenu';

interface QuickAccessItem {
  id: string;
  name: string;
  iconName: string;
  path: string;
}

const quickAccessItems: QuickAccessItem[] = [
  { id: 'recent', name: 'Recent files', iconName: 'Clock', path: 'recent' },
  { id: 'starred', name: 'Starred', iconName: 'Star', path: 'starred' },
  { id: 'shared', name: 'Shared with me', iconName: 'Share2', path: 'shared' },
  { id: 'desktop', name: 'Desktop', iconName: 'HardDrive', path: 'Desktop' },
  { id: 'documents', name: 'Documents', iconName: 'Folder', path: 'Documents' },
  { id: 'downloads', name: 'Downloads', iconName: 'Download', path: 'Downloads' },
];

const IconComponent: React.FC<{ name: string; className?: string }> = ({ name, className = "w-4 h-4" }) => {
  switch (name) {
    case 'Clock': return <Clock className={className} />;
    case 'Star': return <Star className={className} />;
    case 'Share2': return <Share2 className={className} />;
    case 'HardDrive': return <HardDrive className={className} />;
    case 'Folder': return <Folder className={className} />;
    case 'Download': return <Download className={className} />;
    default: return <Folder className={className} />;
  }
};

const getFileIcon = (item: FileItem, isHovered = false, isSelected = false) => {
  if (item.isDirectory) {
    return (isHovered || isSelected) ? <FolderOpen className="w-5 h-5" /> : <Folder className="w-5 h-5" />;
  }
  
  const extension = item.extension?.toLowerCase();
  
  switch (extension) {
    case 'tsx':
    case 'ts':
    case 'js':
    case 'jsx':
    case 'json':
    case 'rs':
    case 'py':
    case 'go':
    case 'java':
    case 'cpp':
    case 'c':
    case 'h':
    case 'hpp':
    case 'cs':
    case 'php':
    case 'rb':
    case 'swift':
    case 'kt':
    case 'scala':
    case 'sh':
    case 'bat':
    case 'ps1':
      return <FileCode className="w-5 h-5" />;
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'svg':
    case 'bmp':
    case 'tiff':
    case 'webp':
    case 'ico':
      return <FileImage className="w-5 h-5" />;
    case 'md':
    case 'txt':
    case 'pdf':
    case 'doc':
    case 'docx':
    case 'rtf':
    case 'odt':
      return <FileText className="w-5 h-5" />;
    case 'mp4':
    case 'avi':
    case 'mov':
    case 'wmv':
    case 'flv':
    case 'webm':
    case 'mkv':
      return <FileVideo className="w-5 h-5" />;
    case 'mp3':
    case 'wav':
    case 'flac':
    case 'aac':
    case 'ogg':
    case 'wma':
      return <FileAudio className="w-5 h-5" />;
    case 'zip':
    case 'rar':
    case '7z':
    case 'tar':
    case 'gz':
    case 'bz2':
    case 'xz':
      return <Archive className="w-5 h-5" />;
    default:
      return <File className="w-5 h-5" />;
  }
};

interface FileExplorerProps {
  isDark: boolean;
  tabType?: string;
  section?: string;
  isWelcomeTab?: boolean;
  isProfileTab?: boolean;
  onLocationSelect?: (type: 'explorer' | 'repository', path: string) => void;
  onThemeToggle?: () => void;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({ 
  isDark,
  tabType = 'explorer',
  section = '',
  isWelcomeTab = false,
  isProfileTab = false,
  onLocationSelect,
  onThemeToggle
}) => {
  // State
  const [currentPath, setCurrentPath] = useState<string>('');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'details' | 'tree'>('details');
  const [sortBy, setSortBy] = useState<'name' | 'modified' | 'size' | 'type'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());
  const [folderContents, setFolderContents] = useState<Map<string, FileItem[]>>(new Map());

  // Context menu action handler
  const handleContextMenuAction = (action: string, file: any, extra?: any) => {
    console.log('Context menu action:', action, 'on file:', file.name);
    
    switch (action) {
      case 'open':
        if (file.type === 'folder') {
          navigateToPath(file.id);
        } else {
          toast.success(`Opening ${file.name}`);
        }
        break;
      case 'open-in-new-tab':
        if (file.type === 'folder') {
          toast.success(`Opening ${file.name} in new tab`);
        }
        break;
      case 'open-external':
        toast.success(`Opening ${file.name} in external editor`);
        break;
      case 'copy':
        toast.success(`Copied ${file.name}`);
        break;
      case 'cut':
        toast.success(`Cut ${file.name}`);
        break;
      case 'rename':
        toast.success(`Renaming ${file.name}`);
        break;
      case 'delete':
        toast.error(`Deleting ${file.name}`);
        break;
      case 'download':
        toast.success(`Downloading ${file.name}`);
        break;
      case 'share':
        toast.success(`Sharing ${file.name}`);
        break;
      case 'compress':
        toast.success(`Compressing ${file.name}`);
        break;
      case 'star':
        toast.success(file.starred ? `Removed star from ${file.name}` : `Starred ${file.name}`);
        break;
      case 'properties':
        toast.info(`Properties for ${file.name}`);
        break;
      default:
        console.log('Unhandled action:', action);
    }
  };

  // Initialize with home directory
  useEffect(() => {
    initializeExplorer();
  }, []);

  const initializeExplorer = async () => {
    try {
      setLoading(true);
      const homeDir = await fileService.getCurrentDirectory();
      if (homeDir) {
        setCurrentPath(homeDir);
        await loadDirectory(homeDir);
      }
    } catch (error) {
      console.error('Failed to initialize explorer:', error);
      toast.error('Failed to initialize file explorer');
    } finally {
      setLoading(false);
    }
  };

  const loadDirectory = async (path: string) => {
    try {
      setLoading(true);
      const directoryFiles = await fileService.readDirectory(path);
      setFiles(directoryFiles);
      
      // If we're in tree view, also cache this directory's contents
      if (viewMode === 'tree') {
        const newContents = new Map(folderContents);
        newContents.set(path, directoryFiles);
        setFolderContents(newContents);
      }
    } catch (error) {
      console.error('Failed to load directory:', error);
      toast.error(`Failed to load directory: ${path}`);
    } finally {
      setLoading(false);
    }
  };

  const navigateToPath = async (newPath: string, addToHistory = true) => {
    if (addToHistory && currentPath && currentPath !== newPath) {
      const newHistory = navigationHistory.slice(0, historyIndex + 1);
      newHistory.push(currentPath);
      setNavigationHistory(newHistory);
      setHistoryIndex(newHistory.length - 1);
    }
    
    setCurrentPath(newPath);
    await loadDirectory(newPath);
    setSelectedItems(new Set());
  };

  const navigateUp = async () => {
    if (currentPath) {
      const parentPath = currentPath.split('/').slice(0, -1).join('/') || '/';
      await navigateToPath(parentPath);
    }
  };

  const navigateBack = async () => {
    if (historyIndex > 0) {
      const prevPath = navigationHistory[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setCurrentPath(prevPath);
      await loadDirectory(prevPath);
    }
  };

  const navigateForward = async () => {
    if (historyIndex < navigationHistory.length - 1) {
      const nextPath = navigationHistory[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setCurrentPath(nextPath);
      await loadDirectory(nextPath);
    }
  };

  const toggleFolderExpansion = async (folderPath: string) => {
    const newExpanded = new Set(expandedFolders);
    
    if (newExpanded.has(folderPath)) {
      // Collapse folder
      newExpanded.delete(folderPath);
      setExpandedFolders(newExpanded);
    } else {
      // Expand folder - load its contents
      try {
        setLoading(true);
        const folderFiles = await fileService.readDirectory(folderPath);
        
        // Update folder contents cache
        const newContents = new Map(folderContents);
        newContents.set(folderPath, folderFiles);
        setFolderContents(newContents);
        
        // Add to expanded set
        newExpanded.add(folderPath);
        setExpandedFolders(newExpanded);
      } catch (error) {
        console.error('Failed to load folder contents:', error);
        toast.error(`Failed to load folder: ${folderPath}`);
      } finally {
        setLoading(false);
      }
    }
  };

  const handleItemDoubleClick = async (item: FileItem) => {
    if (viewMode === 'tree') {
      // In tree view, double-click toggles expansion for folders
      if (item.isDirectory) {
        await toggleFolderExpansion(item.path);
      } else {
        try {
          toast.info(`Opening file: ${item.name}`);
        } catch (error) {
          toast.error(`Failed to open file: ${item.name}`);
        }
      }
    } else {
      // In other views, double-click navigates
      if (item.isDirectory) {
        await navigateToPath(item.path);
      } else {
        try {
          toast.info(`Opening file: ${item.name}`);
        } catch (error) {
          toast.error(`Failed to open file: ${item.name}`);
        }
      }
    }
  };

  const handleItemClick = (item: FileItem, event: React.MouseEvent) => {
    if (event.ctrlKey || event.metaKey) {
      // Multi-select
      const newSelected = new Set(selectedItems);
      if (newSelected.has(item.path)) {
        newSelected.delete(item.path);
      } else {
        newSelected.add(item.path);
      }
      setSelectedItems(newSelected);
    } else {
      // Single select
      setSelectedItems(new Set([item.path]));
    }
  };

  const handleTreeItemClick = async (item: FileItem, event: React.MouseEvent) => {
    if (item.isDirectory) {
      // Single click on folder in tree view toggles expansion
      event.preventDefault();
      await toggleFolderExpansion(item.path);
    }
    
    // Also handle selection
    handleItemClick(item, event);
  };

  const renderTreeItem = (item: FileItem, level: number = 0): React.ReactNode[] => {
    const isSelected = selectedItems.has(item.path);
    const isExpanded = expandedFolders.has(item.path);
    const hasChildren = item.isDirectory;
    const children = folderContents.get(item.path) || [];
    
    const result: React.ReactNode[] = [];
    
    // Main item
    result.push(
      <div
        key={item.path}
        className={`flex items-center gap-2 p-2 rounded cursor-pointer ${
          isSelected 
            ? isDark ? 'bg-gray-800' : 'bg-blue-50'
            : isDark ? 'hover:bg-gray-900' : 'hover:bg-gray-100'
        }`}
        style={{ paddingLeft: `${(level + 1) * 20}px` }}
        onClick={(e) => handleTreeItemClick(item, e)}
        onDoubleClick={() => handleItemDoubleClick(item)}
      >
        {hasChildren && (
          <button
            className="p-0.5 hover:bg-gray-200 dark:hover:bg-gray-700 rounded"
            onClick={(e) => {
              e.stopPropagation();
              toggleFolderExpansion(item.path);
            }}
          >
            {isExpanded ? (
              <ChevronDown className="w-3 h-3 text-gray-400" />
            ) : (
              <ChevronRight className="w-3 h-3 text-gray-400" />
            )}
          </button>
        )}
        {!hasChildren && <div className="w-4" />}
        {getFileIcon(item, false, isSelected)}
        <span className={`truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
          {item.name}
        </span>
      </div>
    );
    
    // Children if expanded
    if (hasChildren && isExpanded && children.length > 0) {
      for (const child of children) {
        result.push(...renderTreeItem(child, level + 1));
      }
    }
    
    return result;
  };

  const handleViewModeChange = (newMode: 'list' | 'grid' | 'details' | 'tree') => {
    setViewMode(newMode);
    
    // Clear tree state when switching away from tree view
    if (viewMode === 'tree' && newMode !== 'tree') {
      setExpandedFolders(new Set());
      setFolderContents(new Map());
    }
  };

  const filteredFiles = files.filter(file => 
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const sortedFiles = [...filteredFiles].sort((a, b) => {
    let comparison = 0;
    
    // Folders first
    if (a.isDirectory && !b.isDirectory) return -1;
    if (!a.isDirectory && b.isDirectory) return 1;
    
    switch (sortBy) {
      case 'name':
        comparison = a.name.localeCompare(b.name);
        break;
      case 'modified':
        comparison = (a.modified?.getTime() || 0) - (b.modified?.getTime() || 0);
        break;
      case 'size':
        comparison = (a.size || 0) - (b.size || 0);
        break;
      case 'type':
        comparison = (a.extension || '').localeCompare(b.extension || '');
        break;
    }
    
    return sortOrder === 'asc' ? comparison : -comparison;
  });

  const formatFileSize = (bytes?: number): string => {
    if (!bytes) return '';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
  };

  const formatDate = (date?: Date): string => {
    if (!date) return '';
    const now = new Date();
    const diffInMs = now.getTime() - date.getTime();
    const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return 'Today';
    } else if (diffInDays === 1) {
      return 'Yesterday';
    } else if (diffInDays < 7) {
      return `${diffInDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  if (isWelcomeTab || isProfileTab) {
    return (
      <div className={`flex-1 flex flex-col ${isDark ? 'bg-gray-900' : 'bg-white'}`}>
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <h2 className={`text-2xl font-bold mb-4 ${isDark ? 'text-white' : 'text-gray-900'}`}>
              {isProfileTab ? 'Profile & Settings' : 'Welcome to Rune VCS'}
            </h2>
            <p className={`text-lg ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
              {isProfileTab ? 'Configure your preferences here' : 'Select a folder to get started'}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex-1 flex overflow-hidden glass-surface ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
      {/* File Sidebar */}
      <FileSidebar 
        isDark={isDark}
        onNavigate={navigateToPath}
        currentPath={currentPath}
      />
      
      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden glass-panel">
        {/* Header with Navigation and Controls */}
        <div className={`flex items-center gap-2 p-3 border-b backdrop-blur-md ${isDark ? 'border-gray-700 bg-gray-900/80' : 'border-gray-200 bg-white/80'}`}>
          {/* Navigation Controls */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={navigateBack}
              disabled={historyIndex <= 0}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={navigateForward}
              disabled={historyIndex >= navigationHistory.length - 1}
              className="h-8 w-8 p-0"
            >
              <ArrowRight className="w-4 h-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={navigateUp}
              disabled={!currentPath || currentPath === '/'}
              className="h-8 w-8 p-0"
            >
              <ArrowUp className="w-4 h-4" />
            </Button>
          </div>

          <Separator orientation="vertical" className="h-6" />

          {/* Path Bar */}
          <div className="flex-1 flex items-center">
            <div className="flex items-center gap-1 text-sm">
              <Home className="w-4 h-4" />
              <ChevronRight className="w-3 h-3 text-gray-400" />
              <span>Documents</span>
            </div>
          </div>

          {/* Search */}
          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search in folder..."
                className={`pl-8 w-48 ${isDark ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
              />
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => loadDirectory(currentPath)}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </div>

          {/* View Controls */}
          <Separator orientation="vertical" className="h-6" />
          
          <div className="flex items-center gap-1">
            <Button
              variant={viewMode === 'tree' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewModeChange('tree')}
              className="h-8 w-8 p-0"
            >
              <TreePine className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewModeChange('list')}
              className="h-8 w-8 p-0"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewModeChange('grid')}
              className="h-8 w-8 p-0"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'details' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => handleViewModeChange('details')}
              className="h-8 w-8 p-0"
            >
              <Columns3 className="w-4 h-4" />
            </Button>
          </div>

          {/* Sort Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <SortAsc className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSortBy('name')}>
                Sort by Name
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('modified')}>
                Sort by Modified
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('size')}>
                Sort by Size
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('type')}>
                Sort by Type
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                {sortOrder === 'asc' ? 'Descending' : 'Ascending'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Main Content Area */}
        <div className="flex-1 overflow-hidden">
          {loading ? (
            <div className="flex-1 flex items-center justify-center">
              <RefreshCw className="w-6 h-6 animate-spin" />
            </div>
          ) : (
            <div className={`h-full overflow-auto ${isDark ? 'bg-gray-950' : 'bg-white'}`}>
              {viewMode === 'details' && (
                /* Details View */
                <div className="w-full">
                  {/* Header */}
                  <div className={`grid grid-cols-[1fr_100px_120px] gap-4 p-3 text-sm font-medium border-b ${isDark ? 'border-gray-700 bg-gray-900 text-gray-300' : 'border-gray-200 bg-gray-50 text-gray-600'}`}>
                    <div>Name</div>
                    <div>Size</div>
                    <div>Modified</div>
                  </div>
                  
                  {/* File List */}
                  <div className="divide-y divide-gray-200 dark:divide-gray-700">
                    {sortedFiles.map((item) => {
                      const isSelected = selectedItems.has(item.path);
                      const contextMenuItem = {
                        id: item.path,
                        name: item.name,
                        type: item.isDirectory ? 'folder' : 'file' as 'folder' | 'file',
                        size: formatFileSize(item.size),
                        modified: formatDate(item.modified),
                        fileType: item.extension
                      };
                      
                      return (
                        <div key={item.path}>
                          <FileContextMenu
                            file={contextMenuItem}
                            onAction={handleContextMenuAction}
                          >
                            <div
                              className={`grid grid-cols-[1fr_100px_120px] gap-4 p-3 cursor-pointer glass-item ${
                                isSelected 
                                  ? isDark ? 'bg-gray-800' : 'bg-blue-50' 
                                  : isDark ? 'hover:bg-gray-900' : 'hover:bg-gray-50'
                              }`}
                              onClick={(e) => handleItemClick(item, e)}
                              onDoubleClick={() => handleItemDoubleClick(item)}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                {getFileIcon(item, false, isSelected)}
                                <span className={`truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                  {item.name}
                                </span>
                              </div>
                              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {!item.isDirectory ? formatFileSize(item.size) : ''}
                              </div>
                              <div className={`text-sm ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                                {formatDate(item.modified)}
                              </div>
                            </div>
                          </FileContextMenu>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {viewMode === 'list' && (
                /* List View - Full Width */
                <div className="p-4 h-full">
                  <div className="space-y-1">
                    {sortedFiles.map((item) => {
                      const isSelected = selectedItems.has(item.path);
                      const contextMenuItem = {
                        id: item.path,
                        name: item.name,
                        type: item.isDirectory ? 'folder' : 'file' as 'folder' | 'file',
                        size: formatFileSize(item.size),
                        modified: formatDate(item.modified),
                        fileType: item.extension
                      };
                      
                      return (
                        <div key={item.path}>
                          <FileContextMenu
                            file={contextMenuItem}
                            onAction={handleContextMenuAction}
                          >
                            <div
                              className={`flex items-center gap-3 p-2 rounded cursor-pointer glass-item ${
                                isSelected 
                                  ? isDark ? 'bg-gray-800' : 'bg-blue-50'
                                  : isDark ? 'hover:bg-gray-900' : 'hover:bg-gray-100'
                              }`}
                              onClick={(e) => handleItemClick(item, e)}
                              onDoubleClick={() => handleItemDoubleClick(item)}
                            >
                              {getFileIcon(item, false, isSelected)}
                              <span className={`truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {item.name}
                              </span>
                            </div>
                          </FileContextMenu>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {viewMode === 'grid' && (
                /* Grid View - Full Width with Large Thumbnails */
                <div className="p-4 h-full">
                  <div className="grid grid-cols-6 gap-4">
                    {sortedFiles.map((item) => {
                      const isSelected = selectedItems.has(item.path);
                      const contextMenuItem = {
                        id: item.path,
                        name: item.name,
                        type: item.isDirectory ? 'folder' : 'file' as 'folder' | 'file',
                        size: formatFileSize(item.size),
                        modified: formatDate(item.modified),
                        fileType: item.extension
                      };
                      
                      return (
                        <div key={item.path}>
                          <FileContextMenu
                            file={contextMenuItem}
                            onAction={handleContextMenuAction}
                          >
                            <div
                              className={`flex flex-col items-center p-4 rounded cursor-pointer glass-card ${
                                isSelected 
                                  ? isDark ? 'bg-gray-800' : 'bg-blue-50'
                                  : isDark ? 'hover:bg-gray-900' : 'hover:bg-gray-100'
                              }`}
                              onClick={(e) => handleItemClick(item, e)}
                              onDoubleClick={() => handleItemDoubleClick(item)}
                            >
                              <div className="mb-2 w-12 h-12 flex items-center justify-center">
                                {React.cloneElement(getFileIcon(item, false, isSelected), { className: 'w-8 h-8' })}
                              </div>
                              <span className={`text-sm text-center truncate w-full ${isDark ? 'text-white' : 'text-gray-900'}`}>
                                {item.name}
                              </span>
                            </div>
                          </FileContextMenu>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {viewMode === 'tree' && (
                /* Tree View - Hierarchical with Expand/Collapse */
                <div className="p-4 h-full">
                  <div className="space-y-1">
                    {sortedFiles.map((item) => renderTreeItem(item, 0)).flat()}
                  </div>
                </div>
              )}

              {sortedFiles.length === 0 && !loading && (
                <div className="flex-1 flex items-center justify-center">
                  <div className="text-center">
                    <FileX className={`w-12 h-12 mx-auto mb-4 ${isDark ? 'text-gray-600' : 'text-gray-400'}`} />
                    <p className={`text-lg ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                      {searchQuery ? 'No files match your search' : 'This folder is empty'}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
