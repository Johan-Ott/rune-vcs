import React, { useState } from 'react';
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
  HardDrive,
  Cloud
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
import { FileContextMenu } from './FileContextMenu';
import { toast } from 'sonner';

interface FileItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  size?: string;
  sizeBytes?: number;
  modified: string;
  modifiedDate: Date;
  created?: string;
  starred?: boolean;
  fileType?: string;
  path?: string;
  parentId?: string;
}

interface ModernFileExplorerProps {
  isDark: boolean;
  tabId: string;
  initialPath?: string;
  onLocationChange?: (path: string) => void;
}

// Mock Windows-like file structure
const mockFileSystem: FileItem[] = [
  // Root folders
  { id: 'desktop', name: 'Desktop', type: 'folder', modified: '1 hour ago', modifiedDate: new Date(Date.now() - 3600000), path: 'Desktop' },
  { id: 'documents', name: 'Documents', type: 'folder', modified: '2 hours ago', modifiedDate: new Date(Date.now() - 7200000), path: 'Documents' },
  { id: 'downloads', name: 'Downloads', type: 'folder', modified: '30 minutes ago', modifiedDate: new Date(Date.now() - 1800000), path: 'Downloads' },
  { id: 'pictures', name: 'Pictures', type: 'folder', modified: '3 hours ago', modifiedDate: new Date(Date.now() - 10800000), path: 'Pictures' },
  { id: 'music', name: 'Music', type: 'folder', modified: '1 day ago', modifiedDate: new Date(Date.now() - 86400000), path: 'Music' },
  { id: 'videos', name: 'Videos', type: 'folder', modified: '2 days ago', modifiedDate: new Date(Date.now() - 172800000), path: 'Videos' },
  
  // Documents folder contents
  { id: 'projects', name: 'Projects', type: 'folder', modified: '1 hour ago', modifiedDate: new Date(Date.now() - 3600000), path: 'Documents/Projects', parentId: 'documents' },
  { id: 'notes-txt', name: 'Notes.txt', type: 'file', size: '2.3 KB', sizeBytes: 2356, modified: '30 minutes ago', modifiedDate: new Date(Date.now() - 1800000), fileType: 'txt', path: 'Documents/Notes.txt', parentId: 'documents' },
  { id: 'resume-pdf', name: 'Resume.pdf', type: 'file', size: '145 KB', sizeBytes: 148480, modified: '1 week ago', modifiedDate: new Date(Date.now() - 604800000), fileType: 'pdf', path: 'Documents/Resume.pdf', parentId: 'documents' },
  
  // Projects folder contents  
  { id: 'nordic-explorer', name: 'nordic-explorer', type: 'folder', modified: '1 hour ago', modifiedDate: new Date(Date.now() - 3600000), path: 'Documents/Projects/nordic-explorer', parentId: 'projects' },
  { id: 'web-app', name: 'web-app', type: 'folder', modified: '3 hours ago', modifiedDate: new Date(Date.now() - 10800000), path: 'Documents/Projects/web-app', parentId: 'projects' },
  
  // Nordic Explorer project contents
  { id: 'src', name: 'src', type: 'folder', modified: '1 hour ago', modifiedDate: new Date(Date.now() - 3600000), path: 'Documents/Projects/nordic-explorer/src', parentId: 'nordic-explorer' },
  { id: 'package-json', name: 'package.json', type: 'file', size: '2.1 KB', sizeBytes: 2150, modified: '5 minutes ago', modifiedDate: new Date(Date.now() - 300000), fileType: 'json', path: 'Documents/Projects/nordic-explorer/package.json', parentId: 'nordic-explorer' },
  { id: 'readme-md', name: 'README.md', type: 'file', size: '4.8 KB', sizeBytes: 4915, modified: '2 hours ago', modifiedDate: new Date(Date.now() - 7200000), fileType: 'md', path: 'Documents/Projects/nordic-explorer/README.md', parentId: 'nordic-explorer' },
  
  // Downloads folder contents
  { id: 'installer-exe', name: 'VSCode_Installer.exe', type: 'file', size: '95.2 MB', sizeBytes: 99876567, modified: '1 hour ago', modifiedDate: new Date(Date.now() - 3600000), fileType: 'exe', path: 'Downloads/VSCode_Installer.exe', parentId: 'downloads' },
  { id: 'image-png', name: 'screenshot.png', type: 'file', size: '1.2 MB', sizeBytes: 1258291, modified: '2 hours ago', modifiedDate: new Date(Date.now() - 7200000), fileType: 'png', path: 'Downloads/screenshot.png', parentId: 'downloads' },
  
  // Pictures folder contents
  { id: 'vacation', name: 'Vacation', type: 'folder', modified: '1 week ago', modifiedDate: new Date(Date.now() - 604800000), path: 'Pictures/Vacation', parentId: 'pictures' },
  { id: 'hero-jpg', name: 'hero-image.jpg', type: 'file', size: '2.8 MB', sizeBytes: 2936832, modified: '3 days ago', modifiedDate: new Date(Date.now() - 259200000), fileType: 'jpg', path: 'Pictures/hero-image.jpg', parentId: 'pictures' },
];

const quickAccessItems = [
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
  if (item.type === 'folder') {
    return (isHovered || isSelected) ? <FolderOpen className="w-5 h-5" /> : <Folder className="w-5 h-5" />;
  }
  
  const extension = item.fileType || item.name.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'tsx':
    case 'ts':
    case 'js':
    case 'jsx':
    case 'json':
      return <FileCode className="w-5 h-5" />;
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'svg':
      return <FileImage className="w-5 h-5" />;
    case 'md':
    case 'txt':
    case 'pdf':
      return <FileText className="w-5 h-5" />;
    case 'mp4':
    case 'avi':
    case 'mov':
      return <FileVideo className="w-5 h-5" />;
    case 'mp3':
    case 'wav':
    case 'flac':
      return <FileAudio className="w-5 h-5" />;
    case 'zip':
    case 'rar':
    case '7z':
      return <Archive className="w-5 h-5" />;
    case 'exe':
    case 'msi':
      return <FileX className="w-5 h-5" />;
    default:
      return <File className="w-5 h-5" />;
  }
};

const formatFileSize = (bytes?: number): string => {
  if (!bytes) return '';
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${Math.round(bytes / Math.pow(1024, i) * 100) / 100} ${sizes[i]}`;
};

const formatDate = (date: Date): string => {
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return 'Today';
  if (diffDays === 2) return 'Yesterday';
  if (diffDays <= 7) return `${diffDays - 1} days ago`;
  if (diffDays <= 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  
  return date.toLocaleDateString();
};

export function ModernFileExplorer({ isDark, tabId, initialPath = 'Documents', onLocationChange }: ModernFileExplorerProps) {
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'column'>('list');
  const [sortBy, setSortBy] = useState<'name' | 'modified' | 'size' | 'type'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Navigation state
  const [currentPath, setCurrentPath] = useState(initialPath);
  const [pathSegments, setPathSegments] = useState<string[]>(initialPath.split('/').filter(Boolean));
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(getInitialFolderId(initialPath));
  const [navigationHistory, setNavigationHistory] = useState<string[]>([initialPath]);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  // Selection and display state
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  
  // Force re-render state for when we modify mock data
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  
  function getInitialFolderId(path: string): string | null {
    if (path === 'Documents') return 'documents';
    if (path === 'Downloads') return 'downloads';
    if (path === 'Desktop') return 'desktop';
    if (path === 'Pictures') return 'pictures';
    return null;
  }

  // Get current folder contents
  const getCurrentFiles = () => {
    let files: FileItem[];
    
    if (currentPath === 'recent') {
      // Show recent files sorted by modification date
      files = mockFileSystem
        .filter(item => item.type === 'file')
        .sort((a, b) => b.modifiedDate.getTime() - a.modifiedDate.getTime())
        .slice(0, 20);
    } else if (currentPath === 'starred') {
      // Show starred files
      files = mockFileSystem.filter(item => item.starred);
    } else if (currentFolderId) {
      // Show contents of current folder
      files = mockFileSystem.filter(item => item.parentId === currentFolderId);
    } else {
      // Show root level folders
      files = mockFileSystem.filter(item => !item.parentId);
    }
    
    // Apply search filter
    if (searchQuery) {
      files = files.filter(item => 
        item.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    // Apply sorting
    files.sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'modified':
          comparison = b.modifiedDate.getTime() - a.modifiedDate.getTime();
          break;
        case 'size':
          comparison = (a.sizeBytes || 0) - (b.sizeBytes || 0);
          break;
        case 'type':
          comparison = (a.fileType || '').localeCompare(b.fileType || '');
          break;
      }
      
      return sortOrder === 'desc' ? -comparison : comparison;
    });
    
    // Folders first, then files
    const folders = files.filter(f => f.type === 'folder');
    const filesList = files.filter(f => f.type === 'file');
    
    return [...folders, ...filesList];
  };

  // Navigation functions
  const navigateTo = (newPath: string, newFolderId: string | null = null) => {
    setCurrentPath(newPath);
    setPathSegments(newPath.split('/').filter(Boolean));
    setCurrentFolderId(newFolderId);
    setSelectedItems(new Set());
    
    // Update history
    const newHistory = navigationHistory.slice(0, historyIndex + 1);
    newHistory.push(newPath);
    setNavigationHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
    
    if (onLocationChange) {
      onLocationChange(newPath);
    }
  };

  const navigateBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const newPath = navigationHistory[newIndex];
      setHistoryIndex(newIndex);
      setCurrentPath(newPath);
      setPathSegments(newPath.split('/').filter(Boolean));
      // Find folder ID for the path
      const segments = newPath.split('/').filter(Boolean);
      const lastSegment = segments[segments.length - 1];
      const folderId = mockFileSystem.find(f => f.name === lastSegment && f.type === 'folder')?.id || null;
      setCurrentFolderId(folderId);
      if (onLocationChange) {
        onLocationChange(newPath);
      }
    }
  };

  const navigateForward = () => {
    if (historyIndex < navigationHistory.length - 1) {
      const newIndex = historyIndex + 1;
      const newPath = navigationHistory[newIndex];
      setHistoryIndex(newIndex);
      setCurrentPath(newPath);
      setPathSegments(newPath.split('/').filter(Boolean));
      // Find folder ID for the path
      const segments = newPath.split('/').filter(Boolean);
      const lastSegment = segments[segments.length - 1];
      const folderId = mockFileSystem.find(f => f.name === lastSegment && f.type === 'folder')?.id || null;
      setCurrentFolderId(folderId);
      if (onLocationChange) {
        onLocationChange(newPath);
      }
    }
  };

  const navigateUp = () => {
    const segments = pathSegments.slice(0, -1);
    const newPath = segments.length > 0 ? segments.join('/') : 'Documents';
    const parentId = segments.length > 0 ? 
      mockFileSystem.find(f => f.name === segments[segments.length - 1] && f.type === 'folder')?.id || null 
      : null;
    navigateTo(newPath, parentId);
  };

  const handleItemDoubleClick = (item: FileItem) => {
    if (item.type === 'folder') {
      const newPath = item.path || `${currentPath}/${item.name}`;
      navigateTo(newPath, item.id);
    } else {
      // Open file
      console.log('Opening file:', item.name);
    }
  };

  const handleItemClick = (item: FileItem, event: React.MouseEvent<HTMLDivElement>) => {
    if (event.ctrlKey || event.metaKey) {
      // Multi-select
      const newSelection = new Set(selectedItems);
      if (newSelection.has(item.id)) {
        newSelection.delete(item.id);
      } else {
        newSelection.add(item.id);
      }
      setSelectedItems(newSelection);
    } else {
      // Single select
      setSelectedItems(new Set([item.id]));
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    const newSegments = pathSegments.slice(0, index + 1);
    const newPath = newSegments.join('/');
    const folderId = newSegments.length > 0 ? 
      mockFileSystem.find(f => f.name === newSegments[newSegments.length - 1] && f.type === 'folder')?.id || null 
      : null;
    navigateTo(newPath, folderId);
  };

  const handleContextMenuAction = (action: string, file: FileItem, extra?: any) => {
    console.log('Context menu action:', action, 'on file:', file.name, 'extra:', extra);
    
    switch (action) {
      case 'open':
        if (file.type === 'folder') {
          handleItemDoubleClick(file);
        } else {
          console.log('Opening file:', file.name);
        }
        break;
      case 'copy':
        console.log('Copying:', file.name);
        toast.success(`Copied "${file.name}" to clipboard`);
        break;
      case 'rename':
        console.log('Renaming:', file.name);
        toast.info(`Rename functionality for "${file.name}" - coming soon`);
        break;
      case 'star':
        // Update the file's starred status in mockFileSystem
        const fileIndex = mockFileSystem.findIndex(f => f.id === file.id);
        if (fileIndex !== -1) {
          const wasStarred = mockFileSystem[fileIndex].starred;
          mockFileSystem[fileIndex].starred = !wasStarred;
          console.log('Toggled star for:', file.name, 'now starred:', mockFileSystem[fileIndex].starred);
          // Force re-render by updating refresh trigger
          setRefreshTrigger(prev => prev + 1);
          toast.success(wasStarred ? `Removed "${file.name}" from favorites` : `Added "${file.name}" to favorites`);
        }
        break;
      case 'delete':
        console.log('Deleting:', file.name);
        toast.error(`Delete confirmation for "${file.name}" - feature coming soon`);
        break;
      case 'properties':
        console.log('Showing properties for:', file.name);
        toast.info(`Properties dialog for "${file.name}" - coming soon`);
        break;
      default:
        console.log('Unhandled action:', action);
    }
  };

  const currentFiles = getCurrentFiles();
  const canGoBack = historyIndex > 0;
  const canGoForward = historyIndex < navigationHistory.length - 1;
  const canGoUp = pathSegments.length > 0 && currentPath !== 'recent' && currentPath !== 'starred';

  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Navigation Bar */}
      <div className={`flex items-center justify-between p-2 border-b ${isDark ? 'border-white/10' : 'border-black/10'} bg-gradient-to-r from-transparent to-white/5`}>
        {/* Left: Navigation Controls */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={navigateBack}
            disabled={!canGoBack}
            className="h-8 w-8 p-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={navigateForward}
            disabled={!canGoForward}
            className="h-8 w-8 p-0"
          >
            <ArrowRight className="w-4 h-4" />
          </Button>
          
          <Button
            variant="ghost"
            size="sm"
            onClick={navigateUp}
            disabled={!canGoUp}
            className="h-8 w-8 p-0"
          >
            <ArrowUp className="w-4 h-4" />
          </Button>
          
          <Separator orientation="vertical" className="h-5 mx-2" />
          
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateTo('Documents')}
              className="h-7 px-2 text-sm"
            >
              <Home className="w-3 h-3 mr-1" />
              Home
            </Button>
            
            {pathSegments.map((segment, index) => (
              <div key={index} className="flex items-center gap-1">
                <ChevronRight className="w-3 h-3 text-muted-foreground" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleBreadcrumbClick(index)}
                  className="h-7 px-2 text-sm"
                >
                  {segment}
                </Button>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Search and Actions */}
        <div className="flex items-center gap-2">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-2 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search in folder..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 w-64 h-8 text-sm"
            />
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <SortAsc className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSortBy('name')}>
                Sort by Name {sortBy === 'name' && '✓'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('modified')}>
                Sort by Modified {sortBy === 'modified' && '✓'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('size')}>
                Sort by Size {sortBy === 'size' && '✓'}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortBy('type')}>
                Sort by Type {sortBy === 'type' && '✓'}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}>
                {sortOrder === 'asc' ? 'Descending' : 'Ascending'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-1">
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('list')}
              className="h-8 w-8 p-0"
            >
              <List className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grid')}
              className="h-8 w-8 p-0"
            >
              <Grid3X3 className="w-4 h-4" />
            </Button>
            <Button
              variant={viewMode === 'column' ? 'default' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('column')}
              className="h-8 w-8 p-0"
            >
              <Columns3 className="w-4 h-4" />
            </Button>
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => console.log('Details panel toggle')}
            className="h-8 w-8 p-0"
          >
            <Info className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Quick Access Sidebar */}
        <div className={`w-80 ${isDark ? 'glass-panel-dark' : 'glass-panel-light'} border-r ${isDark ? 'border-white/10' : 'border-black/10'} flex flex-col`}>
          {/* Quick Access Header */}
          <div className="p-4 border-b border-white/10">
            <h3 className="font-medium text-foreground mb-1">Quick Access</h3>
            <p className="text-xs text-muted-foreground">Frequently used locations and drives</p>
          </div>
          
          {/* Quick Access Items */}
          <div className="flex-1 p-4 space-y-1 overflow-y-auto">
            {/* Favorites Section */}
            <div className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground px-3 py-2 mb-2">Favorites</div>
              {quickAccessItems.map((item) => (
                <Button
                  key={item.id}
                  variant={currentPath === item.path ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => {
                    const folderId = item.id === 'desktop' ? 'desktop' : 
                                    item.id === 'documents' ? 'documents' : 
                                    item.id === 'downloads' ? 'downloads' : null;
                    navigateTo(item.path, folderId);
                  }}
                  className={`w-full justify-start h-12 px-3 text-left transition-all hover:scale-[1.02] ${
                    currentPath === item.path ? 'aurora-glow' : ''
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                    item.id === 'recent' ? 'bg-blue-500/20 text-blue-400' :
                    item.id === 'starred' ? 'bg-yellow-500/20 text-yellow-400' :
                    item.id === 'shared' ? 'bg-green-500/20 text-green-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    <IconComponent name={item.iconName} className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col items-start flex-1 min-w-0">
                    <span className="text-sm truncate w-full">{item.name}</span>
                    {item.id !== 'recent' && item.id !== 'starred' && item.id !== 'shared' && (
                      <span className="text-xs text-muted-foreground truncate w-full">{item.path}</span>
                    )}
                  </div>
                </Button>
              ))}
            </div>
            
            <Separator className="my-4" />
            
            {/* This PC Section */}
            <div className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground px-3 py-2 mb-2">This PC</div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start h-12 px-3 hover:scale-[1.02] transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mr-3">
                  <HardDrive className="w-4 h-4" />
                </div>
                <div className="flex flex-col items-start flex-1 min-w-0">
                  <span className="text-sm truncate w-full">Local Disk (C:)</span>
                  <div className="flex items-center gap-2 w-full">
                    <div className="flex-1 h-1 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-blue-500 rounded-full" style={{ width: '50%' }}></div>
                    </div>
                    <span className="text-xs text-muted-foreground">256 GB free</span>
                  </div>
                </div>
              </Button>
              
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start h-12 px-3 hover:scale-[1.02] transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-purple-500/20 text-purple-400 flex items-center justify-center mr-3">
                  <HardDrive className="w-4 h-4" />
                </div>
                <div className="flex flex-col items-start flex-1 min-w-0">
                  <span className="text-sm truncate w-full">Data (D:)</span>
                  <div className="flex items-center gap-2 w-full">
                    <div className="flex-1 h-1 bg-gray-300 dark:bg-gray-700 rounded-full overflow-hidden">
                      <div className="h-full bg-purple-500 rounded-full" style={{ width: '60%' }}></div>
                    </div>
                    <span className="text-xs text-muted-foreground">1.2 TB free</span>
                  </div>
                </div>
              </Button>
            </div>
            
            <Separator className="my-4" />
            
            {/* Network Locations */}
            <div className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground px-3 py-2 mb-2">Network</div>
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start h-12 px-3 hover:scale-[1.02] transition-all"
              >
                <div className="w-8 h-8 rounded-lg bg-green-500/20 text-green-400 flex items-center justify-center mr-3">
                  <Cloud className="w-4 h-4" />
                </div>
                <div className="flex flex-col items-start flex-1 min-w-0">
                  <span className="text-sm truncate w-full">OneDrive</span>
                  <span className="text-xs text-muted-foreground truncate w-full">Synced</span>
                </div>
              </Button>
            </div>
          </div>
        </div>

        {/* File Content Area */}
        <div className="flex-1 flex flex-col">
          {/* File List */}
          <div className="flex-1 overflow-y-auto">
            {viewMode === 'list' ? (
              <div className="p-4">
                <div className="space-y-1">
                  {currentFiles.map((file) => (
                    <FileContextMenu
                      key={file.id}
                      file={file}
                      showVersionControl={false}
                      onAction={handleContextMenuAction}
                    >
                      <div
                        className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors group ${
                          selectedItems.has(file.id) 
                            ? isDark ? 'bg-white/10' : 'bg-white/60'
                            : isDark ? 'hover:bg-white/5' : 'hover:bg-white/30'
                        }`}
                        onClick={(e) => handleItemClick(file, e)}
                        onDoubleClick={() => handleItemDoubleClick(file)}
                        onMouseEnter={() => setHoveredItem(file.id)}
                        onMouseLeave={() => setHoveredItem(null)}
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          {getFileIcon(file, hoveredItem === file.id, selectedItems.has(file.id))}
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm truncate">{file.name}</span>
                              {file.starred && <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 flex-shrink-0" />}
                            </div>
                            {file.size && (
                              <span className="text-xs text-muted-foreground">{file.size}</span>
                            )}
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4 text-xs text-muted-foreground">
                          <span>{formatDate(file.modifiedDate)}</span>
                        </div>
                      </div>
                    </FileContextMenu>
                  ))}
                </div>
              </div>
            ) : viewMode === 'grid' ? (
              <div className="p-4">
                <div className="grid grid-cols-auto-fill gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))' }}>
                  {currentFiles.map((file) => (
                    <FileContextMenu
                      key={file.id}
                      file={file}
                      showVersionControl={false}
                      onAction={handleContextMenuAction}
                    >
                      <div
                        className={`flex flex-col items-center p-3 rounded-lg cursor-pointer transition-colors group ${
                          selectedItems.has(file.id) 
                            ? isDark ? 'bg-white/10' : 'bg-white/60'
                            : isDark ? 'hover:bg-white/5' : 'hover:bg-white/30'
                        }`}
                        onClick={(e) => handleItemClick(file, e)}
                        onDoubleClick={() => handleItemDoubleClick(file)}
                        onMouseEnter={() => setHoveredItem(file.id)}
                        onMouseLeave={() => setHoveredItem(null)}
                      >
                        <div className="relative mb-2">
                          {getFileIcon(file, hoveredItem === file.id, selectedItems.has(file.id))}
                          {file.starred && (
                            <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 absolute -top-1 -right-1" />
                          )}
                        </div>
                        <span className="text-xs text-center truncate w-full">{file.name}</span>
                        {file.size && (
                          <span className="text-xs text-muted-foreground">{file.size}</span>
                        )}
                      </div>
                    </FileContextMenu>
                  ))}
                </div>
              </div>
            ) : (
              <div className="p-4">
                <div className="grid grid-cols-3 gap-4">
                  {currentFiles.map((file) => (
                    <FileContextMenu
                      key={file.id}
                      file={file}
                      showVersionControl={false}
                      onAction={handleContextMenuAction}
                    >
                      <div
                        className={`flex items-center p-2 rounded-lg cursor-pointer transition-colors group ${
                          selectedItems.has(file.id) 
                            ? isDark ? 'bg-white/10' : 'bg-white/60'
                            : isDark ? 'hover:bg-white/5' : 'hover:bg-white/30'
                        }`}
                        onClick={(e) => handleItemClick(file, e)}
                        onDoubleClick={() => handleItemDoubleClick(file)}
                        onMouseEnter={() => setHoveredItem(file.id)}
                        onMouseLeave={() => setHoveredItem(null)}
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {getFileIcon(file, hoveredItem === file.id, selectedItems.has(file.id))}
                          <div className="flex flex-col min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="text-sm truncate">{file.name}</span>
                              {file.starred && <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 flex-shrink-0" />}
                            </div>
                            <span className="text-xs text-muted-foreground">{formatDate(file.modifiedDate)}</span>
                          </div>
                        </div>
                      </div>
                    </FileContextMenu>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}