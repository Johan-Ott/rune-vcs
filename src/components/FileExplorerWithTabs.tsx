import React, { useState, useCallback, useEffect } from 'react';
import { 
  Folder, 
  FolderOpen,
  Star,
  Search,
  Globe,
  X,
  Plus,
  File,
  FileText,
  FileImage,
  FileCode,
  TreePine,
  List,
  Grid,
  MoreHorizontal,
  Download,
  Upload,
  Trash2,
  Copy,
  Scissors,
  Eye,
  Info,
  ChevronRight,
  ChevronDown
} from 'lucide-react';
import { TabBar } from './tabs/TabBar';
import { useTabManager } from './tabs/useTabManager';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator
} from './ui/dropdown-menu';
import { Separator } from './ui/separator';

interface FileItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  size?: string;
  modified: string;
  path: string;
  fileType?: string;
}

interface FileExplorerWithTabsProps {
  isDark: boolean;
  onThemeToggle?: () => void;
}

// Mock data
const mockFiles: FileItem[] = [
  { id: '1', name: 'Documents', type: 'folder', modified: '2 hours ago', path: '/Users/johanottosson/Documents' },
  { id: '2', name: 'Downloads', type: 'folder', modified: '1 day ago', path: '/Users/johanottosson/Downloads' },
  { id: '3', name: 'script.js', type: 'file', size: '2.5 KB', modified: '30 minutes ago', path: '/Users/johanottosson/script.js', fileType: 'js' },
  { id: '4', name: 'README.md', type: 'file', size: '1.2 KB', modified: '1 hour ago', path: '/Users/johanottosson/README.md', fileType: 'md' },
  { id: '5', name: 'image.png', type: 'file', size: '245 KB', modified: '2 days ago', path: '/Users/johanottosson/image.png', fileType: 'png' },
];

export function FileExplorerWithTabs({ isDark, onThemeToggle }: FileExplorerWithTabsProps) {
  // Tab manager
  const {
    tabs,
    activeTabId,
    activeTab,
    activeTabState,
    addTab,
    closeTab,
    selectTab,
    moveTab,
    updateActiveTabState,
  } = useTabManager('/Users/johanottosson/Documents');

  // Local state for file explorer
  const [selectedFiles, setSelectedFiles] = useState<FileItem[]>([]);
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [contextMenu, setContextMenu] = useState<{
    x: number;
    y: number;
    file: FileItem;
  } | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<'tree' | 'list' | 'grid'>('list');
  const [clipboardData, setClipboardData] = useState<{type: 'copy' | 'cut', files: FileItem[]} | null>(null);

  // File operation handlers
  const handleNewFile = useCallback(() => {
    const fileName = prompt('Enter file name:');
    if (fileName) {
      const newFile: FileItem = {
        id: `file-${Date.now()}`,
        name: fileName,
        type: 'file',
        size: '0 KB',
        modified: 'Just now',
        path: `/Users/johanottosson/Documents/${fileName}`,
        fileType: fileName.split('.').pop()
      };
      // For now just log, in real app would create actual file
      console.log('Creating file:', newFile);
      alert(`File "${fileName}" would be created here`);
    }
  }, []);

  const handleNewFolder = useCallback(() => {
    const folderName = prompt('Enter folder name:');
    if (folderName) {
      const newFolder: FileItem = {
        id: `folder-${Date.now()}`,
        name: folderName,
        type: 'folder',
        modified: 'Just now',
        path: `/Users/johanottosson/Documents/${folderName}`
      };
      // For now just log, in real app would create actual folder
      console.log('Creating folder:', newFolder);
      alert(`Folder "${folderName}" would be created here`);
    }
  }, []);

  const handleDelete = useCallback(() => {
    if (selectedFile) {
      if (confirm(`Are you sure you want to delete "${selectedFile.name}"?`)) {
        console.log('Deleting file:', selectedFile.name);
        alert(`File "${selectedFile.name}" would be deleted here`);
        setSelectedFile(null);
        setShowDetailsPanel(false);
      }
    }
  }, [selectedFile]);

  const handleDownload = useCallback(() => {
    if (selectedFile) {
      console.log('Downloading file:', selectedFile.name);
      alert(`Downloading "${selectedFile.name}"`);
    }
  }, [selectedFile]);

  const handleCopy = useCallback(() => {
    if (selectedFile) {
      setClipboardData({ type: 'copy', files: [selectedFile] });
      console.log('Copied file:', selectedFile.name);
      alert(`Copied "${selectedFile.name}" to clipboard`);
    }
  }, [selectedFile]);

  const handleCut = useCallback(() => {
    if (selectedFile) {
      setClipboardData({ type: 'cut', files: [selectedFile] });
      console.log('Cut file:', selectedFile.name);
      alert(`Cut "${selectedFile.name}" to clipboard`);
    }
  }, [selectedFile]);

  const handleFileClick = useCallback((file: FileItem) => {
    setSelectedFile(file);
    setShowDetailsPanel(true);
  }, []);

  const handleFileContextMenu = useCallback((e: React.MouseEvent, file: FileItem) => {
    e.preventDefault();
    setContextMenu({
      x: e.clientX,
      y: e.clientY,
      file: file
    });
    setSelectedFile(file);
  }, []);

  // Close context menu when clicking elsewhere
  useEffect(() => {
    const handleClickOutside = () => {
      setContextMenu(null);
    };
    
    if (contextMenu) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey || e.metaKey) {
        switch (e.key) {
          case 'c':
            if (selectedFile) {
              e.preventDefault();
              handleCopy();
            }
            break;
          case 'x':
            if (selectedFile) {
              e.preventDefault();
              handleCut();
            }
            break;
          case 'v':
            if (clipboardData) {
              e.preventDefault();
              alert(`Pasting ${clipboardData.files.length} file(s)`);
              setClipboardData(null);
            }
            break;
        }
      } else if (e.key === 'Delete' && selectedFile) {
        e.preventDefault();
        handleDelete();
      } else if (e.key === 'Escape') {
        setContextMenu(null);
        setSelectedFile(null);
        setShowDetailsPanel(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedFile, clipboardData, handleCopy, handleCut, handleDelete]);

  const getFileIcon = (file: FileItem) => {
    if (file.type === 'folder') {
      return <Folder className="w-4 h-4" />;
    }
    switch (file.fileType) {
      case 'js':
      case 'ts':
      case 'tsx':
      case 'jsx':
        return <FileCode className="w-4 h-4" />;
      case 'md':
      case 'txt':
        return <FileText className="w-4 h-4" />;
      case 'png':
      case 'jpg':
      case 'jpeg':
      case 'gif':
        return <FileImage className="w-4 h-4" />;
      default:
        return <File className="w-4 h-4" />;
    }
  };

  const filteredFiles = mockFiles.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderLocalFileContent = () => {
    return (
      <div className="flex h-full">
        <div className="flex-1 flex flex-col">
          {/* Toolbar */}
          <div className="border-b border-border/60 bg-muted/20 px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={handleNewFile}>
                  <Plus className="w-4 h-4 mr-1" />
                  File
                </Button>
                <Button variant="outline" size="sm" onClick={handleNewFolder}>
                  <Plus className="w-4 h-4 mr-1" />
                  Folder
                </Button>
                {clipboardData && (
                  <Button variant="outline" size="sm" onClick={() => {
                    alert(`Pasting ${clipboardData.files.length} file(s) here`);
                    setClipboardData(null);
                  }}>
                    <Copy className="w-4 h-4 mr-1" />
                    Paste ({clipboardData.files.length})
                  </Button>
                )}
                <Separator orientation="vertical" className="h-6" />
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('tree')}
                  className={viewMode === 'tree' ? 'bg-accent' : ''}
                >
                  <TreePine className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('list')}
                  className={viewMode === 'list' ? 'bg-accent' : ''}
                >
                  <List className="w-4 h-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setViewMode('grid')}
                  className={viewMode === 'grid' ? 'bg-accent' : ''}
                >
                  <Grid className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex items-center gap-2">
                <Input
                  placeholder="Search files..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64"
                />
                {clipboardData && (
                  <Badge variant="secondary" className="text-xs">
                    {clipboardData.type === 'copy' ? 'Copied' : 'Cut'}: {clipboardData.files.length} item(s)
                  </Badge>
                )}
                <Button variant="ghost" size="sm">
                  <MoreHorizontal className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>

          {/* File List */}
          <div 
            className="flex-1 overflow-auto"
            onClick={(e) => {
              // If clicking on empty space (not on a file), deselect
              if (e.target === e.currentTarget) {
                setSelectedFile(null);
                setShowDetailsPanel(false);
              }
            }}
          >
            {viewMode === 'tree' && renderTreeView(filteredFiles)}
            {viewMode === 'list' && renderListView(filteredFiles)}
            {viewMode === 'grid' && renderGridView(filteredFiles)}
          </div>
        </div>

        {/* Details Panel */}
        {showDetailsPanel && selectedFile && (
          <div className="w-80 max-w-[30%] border-l border-border/60 bg-muted/10 flex flex-col">
            <div className="p-4 flex-1 overflow-y-auto">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold">Details</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setShowDetailsPanel(false);
                    setSelectedFile(null);
                  }}
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  {getFileIcon(selectedFile)}
                  <div className="min-w-0 flex-1">
                    <p className="font-medium truncate">{selectedFile.name}</p>
                    <p className="text-sm text-muted-foreground">{selectedFile.type}</p>
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="text-sm">
                    <span className="text-muted-foreground">Size: </span>
                    <span>{selectedFile.size || 'N/A'}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Modified: </span>
                    <span>{selectedFile.modified}</span>
                  </div>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Path: </span>
                    <div className="mt-1">
                      <code className="text-xs bg-muted px-2 py-1 rounded block word-break-all">
                        {selectedFile.path}
                      </code>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pt-4">
                  <Button variant="outline" size="sm" onClick={handleDownload} className="w-full">
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCopy} className="w-full">
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleCut} className="w-full">
                    <Scissors className="w-4 h-4 mr-2" />
                    Cut
                  </Button>
                  <Button variant="destructive" size="sm" onClick={handleDelete} className="w-full">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderTreeView = (files: FileItem[]) => {
    return (
      <div className="tree-view">
        {files.map((file, index) => (
          <div
            key={index}
            className={`flex items-center p-2 hover:bg-muted cursor-pointer ${
              selectedFile?.path === file.path ? 'bg-accent' : ''
            } ${clipboardData?.files.some(f => f.id === file.id) && clipboardData.type === 'cut' ? 'opacity-50' : ''}`}
            onClick={() => handleFileClick(file)}
            onContextMenu={(e) => handleFileContextMenu(e, file)}
          >
            {getFileIcon(file)}
            <span className="text-sm ml-2">{file.name}</span>
            {clipboardData?.files.some(f => f.id === file.id) && (
              <div className="ml-auto">
                {clipboardData.type === 'copy' ? (
                  <Copy className="w-3 h-3 text-muted-foreground" />
                ) : (
                  <Scissors className="w-3 h-3 text-muted-foreground" />
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    );
  };

  const renderListView = (files: FileItem[]) => {
    return (
      <div className="list-view">
        <div className="grid grid-cols-4 gap-2 p-2 border-b text-xs font-medium text-muted-foreground">
          <div>Name</div>
          <div>Type</div>
          <div>Size</div>
          <div>Modified</div>
        </div>
        {files.map((file, index) => (
          <div
            key={index}
            className={`grid grid-cols-4 gap-2 p-2 hover:bg-muted cursor-pointer ${
              selectedFile?.path === file.path ? 'bg-accent' : ''
            } ${clipboardData?.files.some(f => f.id === file.id) && clipboardData.type === 'cut' ? 'opacity-50' : ''}`}
            onClick={() => handleFileClick(file)}
            onContextMenu={(e) => handleFileContextMenu(e, file)}
          >
            <div className="flex items-center">
              {getFileIcon(file)}
              <span className="text-sm truncate ml-2">{file.name}</span>
              {clipboardData?.files.some(f => f.id === file.id) && (
                <div className="ml-auto">
                  {clipboardData.type === 'copy' ? (
                    <Copy className="w-3 h-3 text-muted-foreground" />
                  ) : (
                    <Scissors className="w-3 h-3 text-muted-foreground" />
                  )}
                </div>
              )}
            </div>
            <div className="text-sm text-muted-foreground">{file.type}</div>
            <div className="text-sm text-muted-foreground">{file.size || '-'}</div>
            <div className="text-sm text-muted-foreground">{file.modified}</div>
          </div>
        ))}
      </div>
    );
  };

  const renderGridView = (files: FileItem[]) => {
    return (
      <div className="grid grid-cols-4 gap-4 p-4">
        {files.map((file, index) => (
          <div
            key={index}
            className={`flex flex-col items-center p-4 rounded-lg border hover:bg-muted cursor-pointer relative ${
              selectedFile?.path === file.path ? 'bg-accent' : ''
            } ${clipboardData?.files.some(f => f.id === file.id) && clipboardData.type === 'cut' ? 'opacity-50' : ''}`}
            onClick={() => handleFileClick(file)}
            onContextMenu={(e) => handleFileContextMenu(e, file)}
          >
            {clipboardData?.files.some(f => f.id === file.id) && (
              <div className="absolute top-2 right-2">
                {clipboardData.type === 'copy' ? (
                  <Copy className="w-3 h-3 text-muted-foreground" />
                ) : (
                  <Scissors className="w-3 h-3 text-muted-foreground" />
                )}
              </div>
            )}
            {file.type === 'folder' ? (
              <Folder className="w-8 h-8 mb-2" />
            ) : (
              <File className="w-8 h-8 mb-2" />
            )}
            <span className="text-sm text-center truncate w-full">{file.name}</span>
          </div>
        ))}
      </div>
    );
  };

  const renderContextMenu = () => {
    if (!contextMenu) return null;

    return (
      <div
        className="fixed z-50 bg-background border border-border rounded-md shadow-lg py-1 min-w-[160px]"
        style={{
          left: contextMenu.x,
          top: contextMenu.y,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground flex items-center gap-2"
          onClick={() => {
            handleCopy();
            setContextMenu(null);
          }}
        >
          <Copy className="w-4 h-4" />
          Copy
        </button>
        <button
          className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground flex items-center gap-2"
          onClick={() => {
            handleCut();
            setContextMenu(null);
          }}
        >
          <Scissors className="w-4 h-4" />
          Cut
        </button>
        <div className="h-px bg-border my-1" />
        <button
          className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground flex items-center gap-2"
          onClick={() => {
            handleDownload();
            setContextMenu(null);
          }}
        >
          <Download className="w-4 h-4" />
          Download
        </button>
        <button
          className="w-full px-3 py-2 text-left text-sm hover:bg-accent hover:text-accent-foreground flex items-center gap-2"
          onClick={() => {
            setShowDetailsPanel(true);
            setContextMenu(null);
          }}
        >
          <Info className="w-4 h-4" />
          Properties
        </button>
        <div className="h-px bg-border my-1" />
        <button
          className="w-full px-3 py-2 text-left text-sm hover:bg-destructive hover:text-destructive-foreground flex items-center gap-2"
          onClick={() => {
            handleDelete();
            setContextMenu(null);
          }}
        >
          <Trash2 className="w-4 h-4" />
          Delete
        </button>
      </div>
    );
  };

  const renderTabContent = () => {
    if (!activeTab) {
      return (
        <div className="flex items-center justify-center h-full">
          <div className="text-center">
            <File className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Tab Selected</h3>
            <p className="text-muted-foreground">Create a new tab to get started</p>
          </div>
        </div>
      );
    }

    switch (activeTab.type) {
      case 'local':
        return renderLocalFileContent();
      case 'remote':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <Globe className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Remote Files</h3>
              <p className="text-muted-foreground">Connect to a remote server to browse files</p>
              <Button variant="outline">
                Connect to Server
              </Button>
            </div>
          </div>
        );
      case 'search':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Search Results</h3>
              <p className="text-muted-foreground">Your search results will appear here</p>
              <div className="max-w-md mx-auto">
                <Input placeholder="Enter search query..." />
              </div>
            </div>
          </div>
        );
      case 'bookmarks':
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center space-y-4">
              <Star className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Bookmarks</h3>
              <p className="text-muted-foreground">Your bookmarked locations will appear here</p>
              <Button variant="outline">
                Add Bookmark
              </Button>
            </div>
          </div>
        );
      default:
        return (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <File className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-semibold mb-2">Unknown Tab Type</h3>
              <p className="text-muted-foreground">This tab type is not supported</p>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="h-full flex flex-col">
      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onTabSelect={selectTab}
        onTabClose={closeTab}
        onTabMove={moveTab}
        onTabAdd={(type) => addTab({
          type: type,
          title: type.charAt(0).toUpperCase() + type.slice(1),
          path: type === 'local' ? '/Users/johanottosson/Documents' : ''
        })}
      />
      <div className="flex-1 overflow-hidden">
        {renderTabContent()}
      </div>
      {renderContextMenu()}
    </div>
  );
}