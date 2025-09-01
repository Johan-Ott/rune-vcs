import React, { useState, useMemo } from 'react';
import { 
  Search, 
  FolderOpen, 
  File, 
  FileText,
  Image,
  Code,
  Archive,
  Video,
  Music,
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  Grid3X3,
  List,
  Eye,
  GitCommit,
  RefreshCw,
  Cloud,
  HardDrive,
  Globe,
  Folder,
  Home,
  ArrowLeft,
  Filter,
  SortAsc,
  X,
  Columns3,
  Info,
  SidebarClose
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { VCSStatusIndicator } from './VCSStatusIndicator';
import { FileContextMenu } from '../FileContextMenu';
import { FileDetailsPanel } from '../FileDetailsPanel';

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  size?: number;
  modified: Date;
  vcsStatus?: 'M' | 'A' | 'D' | 'L' | '??';
  children?: FileItem[];
}

interface VCSFileExplorerProps {
  isDark: boolean;
}

// Mock local file data with VCS status
const mockLocalFiles: FileItem[] = [
  {
    id: '1',
    name: 'src',
    type: 'folder',
    path: '/src',
    modified: new Date('2024-01-15'),
    vcsStatus: 'M',
    children: [
      {
        id: '2',
        name: 'components',
        type: 'folder',
        path: '/src/components',
        modified: new Date('2024-01-15'),
        children: [
          {
            id: '3',
            name: 'Button.tsx',
            type: 'file',
            path: '/src/components/Button.tsx',
            size: 2456,
            modified: new Date('2024-01-15'),
            vcsStatus: 'M'
          },
          {
            id: '4',
            name: 'Modal.tsx',
            type: 'file',
            path: '/src/components/Modal.tsx',
            size: 3200,
            modified: new Date('2024-01-14'),
            vcsStatus: 'A'
          }
        ]
      },
      {
        id: '5',
        name: 'utils',
        type: 'folder',
        path: '/src/utils',
        modified: new Date('2024-01-12'),
        children: [
          {
            id: '6',
            name: 'helpers.ts',
            type: 'file',
            path: '/src/utils/helpers.ts',
            size: 1800,
            modified: new Date('2024-01-12'),
            vcsStatus: 'L'
          }
        ]
      },
      {
        id: '7',
        name: 'App.tsx',
        type: 'file',
        path: '/src/App.tsx',
        size: 4500,
        modified: new Date('2024-01-15'),
        vcsStatus: 'M'
      }
    ]
  },
  {
    id: '8',
    name: 'public',
    type: 'folder',
    path: '/public',
    modified: new Date('2024-01-10'),
    children: [
      {
        id: '9',
        name: 'index.html',
        type: 'file',
        path: '/public/index.html',
        size: 1200,
        modified: new Date('2024-01-10')
      },
      {
        id: '10',
        name: 'favicon.ico',
        type: 'file',
        path: '/public/favicon.ico',
        size: 15086,
        modified: new Date('2024-01-05')
      }
    ]
  },
  {
    id: '11',
    name: 'package.json',
    type: 'file',
    path: '/package.json',
    size: 1456,
    modified: new Date('2024-01-14'),
    vcsStatus: 'M'
  },
  {
    id: '12',
    name: 'README.md',
    type: 'file',
    path: '/README.md',
    size: 2800,
    modified: new Date('2024-01-13')
  },
  {
    id: '13',
    name: 'temp.log',
    type: 'file',
    path: '/temp.log',
    size: 128,
    modified: new Date('2024-01-15'),
    vcsStatus: '??'
  }
];

// Mock remote file data (different structure to show remote differences)
const mockRemoteFiles: FileItem[] = [
  {
    id: 'r1',
    name: 'src',
    type: 'folder',
    path: '/src',
    modified: new Date('2024-01-16'),
    children: [
      {
        id: 'r2',
        name: 'components',
        type: 'folder',
        path: '/src/components',
        modified: new Date('2024-01-16'),
        children: [
          {
            id: 'r3',
            name: 'Button.tsx',
            type: 'file',
            path: '/src/components/Button.tsx',
            size: 2800,
            modified: new Date('2024-01-16')
          },
          {
            id: 'r4',
            name: 'Modal.tsx',
            type: 'file',
            path: '/src/components/Modal.tsx',
            size: 3400,
            modified: new Date('2024-01-16')
          },
          {
            id: 'r5',
            name: 'Dialog.tsx',
            type: 'file',
            path: '/src/components/Dialog.tsx',
            size: 2100,
            modified: new Date('2024-01-15')
          }
        ]
      },
      {
        id: 'r6',
        name: 'utils',
        type: 'folder',
        path: '/src/utils',
        modified: new Date('2024-01-14'),
        children: [
          {
            id: 'r7',
            name: 'helpers.ts',
            type: 'file',
            path: '/src/utils/helpers.ts',
            size: 2100,
            modified: new Date('2024-01-14')
          },
          {
            id: 'r8',
            name: 'validators.ts',
            type: 'file',
            path: '/src/utils/validators.ts',
            size: 1500,
            modified: new Date('2024-01-13')
          }
        ]
      },
      {
        id: 'r9',
        name: 'App.tsx',
        type: 'file',
        path: '/src/App.tsx',
        size: 4200,
        modified: new Date('2024-01-16')
      }
    ]
  },
  {
    id: 'r10',
    name: 'docs',
    type: 'folder',
    path: '/docs',
    modified: new Date('2024-01-15'),
    children: [
      {
        id: 'r11',
        name: 'api.md',
        type: 'file',
        path: '/docs/api.md',
        size: 3200,
        modified: new Date('2024-01-15')
      },
      {
        id: 'r12',
        name: 'contributing.md',
        type: 'file',
        path: '/docs/contributing.md',
        size: 1800,
        modified: new Date('2024-01-10')
      }
    ]
  },
  {
    id: 'r13',
    name: 'package.json',
    type: 'file',
    path: '/package.json',
    size: 1600,
    modified: new Date('2024-01-16')
  },
  {
    id: 'r14',
    name: 'README.md',
    type: 'file',
    path: '/README.md',
    size: 3100,
    modified: new Date('2024-01-15')
  }
];

const getFileIcon = (fileName: string, fileType: 'file' | 'folder') => {
  if (fileType === 'folder') return FolderOpen;
  
  const ext = fileName.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'tsx':
    case 'ts':
    case 'js':
    case 'jsx':
      return Code;
    case 'md':
    case 'txt':
      return FileText;
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'svg':
      return Image;
    case 'mp4':
    case 'avi':
    case 'mov':
      return Video;
    case 'mp3':
    case 'wav':
    case 'flac':
      return Music;
    case 'zip':
    case 'tar':
    case 'gz':
      return Archive;
    default:
      return File;
  }
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

export function VCSFileExplorer({ isDark }: VCSFileExplorerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'tree'>('list');
  const [expandedFolders, setExpandedFolders] = useState<string[]>(['1', '2']);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [contextMenu, setContextMenu] = useState<{ x: number; y: number; file: FileItem } | null>(null);
  const [isRemoteMode, setIsRemoteMode] = useState(false);
  const [currentPath, setCurrentPath] = useState<string[]>(['Repository']);
  const [sortBy, setSortBy] = useState<'name' | 'modified' | 'size'>('name');
  const [filterStatus, setFilterStatus] = useState<'all' | 'modified' | 'untracked'>('all');
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);

  const toggleFolder = (folderId: string) => {
    setExpandedFolders(prev => 
      prev.includes(folderId) 
        ? prev.filter(id => id !== folderId)
        : [...prev, folderId]
    );
  };

  const handleFileSelect = (file: FileItem) => {
    setSelectedFile(file);
    // Auto-show details panel when selecting a file
    if (file && !showDetailsPanel) {
      setShowDetailsPanel(true);
    }
  };

  const handleContextMenu = (e: React.MouseEvent, file: FileItem) => {
    e.preventDefault();
    setContextMenu({ x: e.clientX, y: e.clientY, file });
  };

  const filteredFiles = useMemo(() => {
    let files = isRemoteMode ? mockRemoteFiles : mockLocalFiles;
    
    // Filter by VCS status if not showing all (only for local mode)
    if (!isRemoteMode && filterStatus !== 'all') {
      const filterFilesByStatus = (files: FileItem[]): FileItem[] => {
        return files.filter(file => {
          if (filterStatus === 'modified' && file.vcsStatus && ['M', 'A', 'D'].includes(file.vcsStatus)) {
            return true;
          }
          if (filterStatus === 'untracked' && file.vcsStatus === '??') {
            return true;
          }
          const hasMatchingChildren = file.children && filterFilesByStatus(file.children).length > 0;
          return hasMatchingChildren;
        }).map(file => ({
          ...file,
          children: file.children ? filterFilesByStatus(file.children) : undefined
        }));
      };
      files = filterFilesByStatus(files);
    }
    
    // Filter by search query
    if (searchQuery) {
      const filterFiles = (files: FileItem[]): FileItem[] => {
        return files.filter(file => {
          const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase());
          const hasMatchingChildren = file.children && filterFiles(file.children).length > 0;
          return matchesSearch || hasMatchingChildren;
        }).map(file => ({
          ...file,
          children: file.children ? filterFiles(file.children) : undefined
        }));
      };
      files = filterFiles(files);
    }
    
    return files;
  }, [searchQuery, filterStatus, isRemoteMode]);

  // Helper function to convert VCS file to FileDetailsPanel format
  const convertToDetailsPanelFormat = (file: FileItem) => {
    if (!file) return null;
    
    // Map VCS status to FileDetailsPanel status
    const getFileStatus = (vcsStatus?: string) => {
      switch (vcsStatus) {
        case 'M': return 'modified';
        case 'A': return 'added'; 
        case 'D': return 'deleted';
        case 'L': return 'staged';
        default: return 'clean';
      }
    };

    return {
      id: file.id,
      name: file.name,
      type: file.type,
      size: file.size ? formatFileSize(file.size) : undefined,
      modified: file.modified.toLocaleDateString(),
      created: file.modified.toLocaleDateString(),
      path: file.path,
      status: getFileStatus(file.vcsStatus),
      fileType: file.name.split('.').pop(),
      starred: false,
      permissions: '-rw-r--r--',
      owner: 'john.doe'
    };
  };

  // Compact list view renderer
  const renderListItem = (file: FileItem) => {
    const Icon = getFileIcon(file.name, file.type);
    const isSelected = selectedFile?.id === file.id;
    const isExpanded = expandedFolders.includes(file.id);
    
    return (
      <React.Fragment key={file.id}>
        <FileContextMenu
          file={{
            id: file.id,
            name: file.name,
            type: file.type,
            size: file.size ? formatFileSize(file.size) : undefined,
            modified: file.modified.toLocaleDateString(),
            starred: false,
            fileType: file.name.split('.').pop()
          }}
          showVersionControl={true}
          onAction={(action, fileItem) => {
            console.log('Context action:', action, 'on:', fileItem.name);
          }}
        >
          <div
            className={`group px-3 py-1 cursor-pointer transition-all hover:bg-white/5 flex items-center gap-2 min-w-0 ${
              isSelected ? 'bg-white/10 border-l-2 border-l-blue-400' : ''
            }`}
            onClick={() => handleFileSelect(file)}
            onDoubleClick={() => {
              if (file.type === 'folder') {
                toggleFolder(file.id);
              } else {
                console.log('Opening file:', file.name);
              }
            }}
          >
            {/* Folder expand/collapse button */}
            {file.type === 'folder' && (
              <Button
                variant="ghost"
                size="sm"
                className="h-3 w-3 p-0 hover:bg-transparent opacity-60 hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  toggleFolder(file.id);
                }}
              >
                {isExpanded ? (
                  <ChevronDown className="w-2.5 h-2.5" />
                ) : (
                  <ChevronRight className="w-2.5 h-2.5" />
                )}
              </Button>
            )}
            {file.type === 'file' && <div className="w-3" />}
            
            {/* File icon */}
            <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            
            {/* File name */}
            <span className="text-sm truncate flex-1">{file.name}</span>
            
            {/* Hover details - visible on right side when hovering */}
            <div className="flex items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs text-muted-foreground">
              {file.type === 'file' && file.size && (
                <span className="min-w-[50px] text-right">{formatFileSize(file.size)}</span>
              )}
              <span className="min-w-[60px] text-right">
                {file.modified.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              </span>
              <span className="min-w-[40px] text-right">{file.vcsStatus ? 'You' : ''}</span>
            </div>
            
            {/* VCS Status - always visible */}
            <div className="flex items-center flex-shrink-0">
              {file.vcsStatus && <VCSStatusIndicator status={file.vcsStatus} />}
            </div>
          </div>
        </FileContextMenu>
        
        {/* Render children if folder is expanded */}
        {file.type === 'folder' && isExpanded && file.children && (
          <div className="ml-6">
            {file.children.map(child => renderListItem(child))}
          </div>
        )}
      </React.Fragment>
    );
  };

  // Grid view renderer
  const renderGridItem = (file: FileItem) => {
    const Icon = getFileIcon(file.name, file.type);
    const isSelected = selectedFile?.id === file.id;
    
    return (
      <FileContextMenu
        key={file.id}
        file={{
          id: file.id,
          name: file.name,
          type: file.type,
          size: file.size ? formatFileSize(file.size) : undefined,
          modified: file.modified.toLocaleDateString(),
          starred: false,
          fileType: file.name.split('.').pop()
        }}
        showVersionControl={true}
        onAction={(action, fileItem) => {
          console.log('Context action:', action, 'on:', fileItem.name);
        }}
      >
        <div
          className={`group relative p-3 rounded-lg cursor-pointer transition-all hover:bg-white/5 ${
            isSelected ? 'bg-white/10 border border-white/20' : ''
          }`}
          onClick={() => handleFileSelect(file)}
          onDoubleClick={() => {
            if (file.type === 'folder') {
              toggleFolder(file.id);
            } else {
              console.log('Opening file:', file.name);
            }
          }}
        >
          <div className="flex flex-col items-center gap-2">
            <Icon className="w-8 h-8 text-muted-foreground" />
            <span className="text-sm text-center truncate w-full">{file.name}</span>
            
            {/* Hover details for grid */}
            <div className="absolute inset-x-0 bottom-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs text-muted-foreground text-center">
              {file.type === 'file' && file.size && (
                <div>{formatFileSize(file.size)}</div>
              )}
              <div>{file.modified.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</div>
            </div>
            
            {file.vcsStatus && (
              <div className="absolute top-2 right-2">
                <VCSStatusIndicator status={file.vcsStatus} />
              </div>
            )}
          </div>
        </div>
      </FileContextMenu>
    );
  };

  // Tree view renderer (compact hierarchical)
  const renderTreeItem = (file: FileItem, level: number = 0) => {
    const Icon = getFileIcon(file.name, file.type);
    const isExpanded = expandedFolders.includes(file.id);
    const isSelected = selectedFile?.id === file.id;

    return (
      <div key={file.id} className="select-none">
        <div
          className={`group flex items-center gap-2 px-2 py-0.5 cursor-pointer hover:bg-white/5 ${
            isSelected ? 'bg-white/10 border-l-2 border-l-blue-400' : ''
          } transition-all duration-200`}
          style={{ paddingLeft: `${6 + level * 12}px` }}
          onClick={() => {
            if (file.type === 'folder') {
              toggleFolder(file.id);
            }
            handleFileSelect(file);
          }}
        >
          {file.type === 'folder' ? (
            <Button
              variant="ghost"
              size="sm"
              className="h-3 w-3 p-0 hover:bg-transparent opacity-60 hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                toggleFolder(file.id);
              }}
            >
              {isExpanded ? (
                <ChevronDown className="w-2.5 h-2.5" />
              ) : (
                <ChevronRight className="w-2.5 h-2.5" />
              )}
            </Button>
          ) : (
            <div className="w-3" />
          )}
          
          <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
          <span className="flex-1 truncate text-sm">{file.name}</span>
          
          {/* Hover details for tree view */}
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-xs text-muted-foreground">
            {file.type === 'file' && file.size && (
              <span className="min-w-[40px] text-right">{formatFileSize(file.size)}</span>
            )}
            <span className="min-w-[45px] text-right">
              {file.modified.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            </span>
          </div>
          
          {file.vcsStatus && (
            <VCSStatusIndicator status={file.vcsStatus} />
          )}
        </div>
        
        {file.type === 'folder' && isExpanded && file.children && (
          <div>
            {file.children.map(child => renderTreeItem(child, level + 1))}
          </div>
        )}
      </div>
    );
  };

  const getAllFiles = (files: FileItem[]): FileItem[] => {
    const result: FileItem[] = [];
    files.forEach(file => {
      result.push(file);
      if (file.children) {
        result.push(...getAllFiles(file.children));
      }
    });
    return result;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Top File Explorer Panel */}
      <div className={`${isDark ? 'glass-card' : 'glass-card-light'} m-4 mb-2`}>
        <div className="p-3">
          {/* Header with Remote/Local Toggle */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <h2 className="text-lg font-medium">Repository Explorer</h2>
              <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/30">
                <Button
                  variant={!isRemoteMode ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setIsRemoteMode(false)}
                  className="h-7 px-3 text-sm"
                >
                  <HardDrive className="w-3 h-3 mr-1" />
                  Local
                </Button>
                <Button
                  variant={isRemoteMode ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setIsRemoteMode(true)}
                  className="h-7 px-3 text-sm"
                >
                  <Cloud className="w-3 h-3 mr-1" />
                  Remote
                </Button>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {/* Status Filter - Only show for local mode */}
              {!isRemoteMode && (
                <Select value={filterStatus} onValueChange={setFilterStatus as any}>
                  <SelectTrigger className="w-32 h-8">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Files</SelectItem>
                    <SelectItem value="modified">Modified</SelectItem>
                    <SelectItem value="untracked">Untracked</SelectItem>
                  </SelectContent>
                </Select>
              )}
              
              {/* Sort */}
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
                    Sort by Date
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setSortBy('size')}>
                    Sort by Size
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              {/* View Mode */}
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
                  variant={viewMode === 'tree' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('tree')}
                  className="h-8 w-8 p-0"
                >
                  <Columns3 className="w-4 h-4" />
                </Button>
              </div>
              
              <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                <RefreshCw className="w-4 h-4" />
              </Button>
              
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0"
                    onClick={() => setShowDetailsPanel(!showDetailsPanel)}
                  >
                    {showDetailsPanel ? <SidebarClose className="w-4 h-4" /> : <Info className="w-4 h-4" />}
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  {showDetailsPanel ? 'Hide Details Panel' : 'Show Details Panel'}
                </TooltipContent>
              </Tooltip>
            </div>
          </div>
          
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={`Search ${isRemoteMode ? 'remote' : 'local'} files...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>

      {/* Main Content Area with Details Panel */}
      <div className="flex-1 flex overflow-hidden">
        {/* File List Panel */}
        <div className={`flex-1 overflow-auto ${showDetailsPanel ? 'border-r border-white/10' : ''}`}>
          {filteredFiles.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
              <Folder className="w-16 h-16 mb-4 opacity-50" />
              <p className="text-lg mb-2">No files found</p>
              <p className="text-sm">Try changing your {!isRemoteMode ? 'filter or ' : ''}search criteria</p>
            </div>
          ) : (
            <div className="p-3">
              {/* Status Summary */}
              {filterStatus === 'all' && (
                <div className="flex items-center gap-4 p-2 mb-3 rounded-lg bg-white/5 border border-white/10">
                  {!isRemoteMode ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-muted-foreground">Status:</span>
                      <Badge variant="outline" className="text-xs">
                        {filteredFiles.flatMap(f => f.children ? [f, ...getAllFiles(f.children)] : [f]).filter(f => f.vcsStatus === 'M').length} Modified
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {filteredFiles.flatMap(f => f.children ? [f, ...getAllFiles(f.children)] : [f]).filter(f => f.vcsStatus === 'A').length} Added
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        {filteredFiles.flatMap(f => f.children ? [f, ...getAllFiles(f.children)] : [f]).filter(f => f.vcsStatus === '??').length} Untracked
                      </Badge>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Globe className="w-4 h-4 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Remote Repository</span>
                      <Badge variant="outline" className="text-xs">
                        {getAllFiles(filteredFiles).filter(f => f.type === 'file').length} Files
                      </Badge>
                      <Badge variant="outline" className="text-xs">
                        Up to date
                      </Badge>
                    </div>
                  )}
                </div>
              )}
              
              {/* File View */}
              {viewMode === 'list' && (
                <div className="space-y-0">
                  {filteredFiles.map(file => renderListItem(file))}
                </div>
              )}
              
              {viewMode === 'grid' && (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
                  {getAllFiles(filteredFiles).map(file => renderGridItem(file))}
                </div>
              )}
              
              {viewMode === 'tree' && (
                <div className="space-y-0">
                  {filteredFiles.map(file => renderTreeItem(file))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Details Panel */}
        {showDetailsPanel && (
          <div className="w-80 flex-shrink-0">
            <FileDetailsPanel
              isDark={isDark}
              file={convertToDetailsPanelFormat(selectedFile)}
              showVersionControl={true}
              onClose={() => setShowDetailsPanel(false)}
              vcsFile={selectedFile ? { 
                status: selectedFile.vcsStatus || 'clean', 
                path: selectedFile.path 
              } : undefined}
            />
          </div>
        )}
      </div>
    </div>
  );
}