import React, { useState, useEffect } from 'react';
import { Resizable } from 're-resizable';
import { 
  Folder, 
  File, 
  FileText, 
  FileImage, 
  FileCode, 
  FileVideo,
  FileAudio,
  Archive,
  MoreHorizontal,
  Grid3X3,
  List,
  Star,
  Clock,
  TreePine,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  Home,
  Filter,
  SortAsc,
  Eye,
  FolderOpen,
  Users,
  Tag,
  Cloud,
  GitCommit,
  Plus,
  Minus,
  Search,
  History,
  GitBranch,
  FileX,
  Diff,
  Upload,
  Download,
  RefreshCw,
  Settings,
  Archive as ArchiveIcon,
  Globe
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Input } from './ui/input';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from './ui/dropdown-menu';
import { Separator } from './ui/separator';
import { FileDetailsPanel } from './FileDetailsPanel';
import { FileContextMenu } from './FileContextMenu';
import { WelcomeScreen } from './WelcomeScreen';
import { VCSFileList } from './vcs/VCSFileList';
import { VCSStatusIndicator } from './vcs/VCSStatusIndicator';
import { CommitDialog } from './vcs/CommitDialog';
import { ChangelistPanel } from './vcs/ChangelistPanel';
import { useVCS } from '../hooks/useVCS';
import { SettingsPanel } from './SettingsPanel';
import { WorkspacePanel } from './WorkspacePanel';

// Dynamic imports with error handling
let BranchesPanel: any = null;
let VCSFileExplorer: any = null;
let PlansPanel: any = null;
let TeamsSection: any = null;
let TagsSection: any = null;

try {
  BranchesPanel = require('./vcs/BranchesPanel').BranchesPanel;
} catch (error) {
  console.error('Failed to import BranchesPanel:', error);
}

try {
  VCSFileExplorer = require('./vcs/VCSFileExplorer').VCSFileExplorer;
} catch (error) {
  console.error('Failed to import VCSFileExplorer:', error);
}

try {
  PlansPanel = require('./plans/PlansPanel').PlansPanel;
} catch (error) {
  console.error('Failed to import PlansPanel:', error);
}

try {
  TeamsSection = require('./TeamsSection').TeamsSection;
} catch (error) {
  console.error('Failed to import TeamsSection:', error);
}

try {
  TagsSection = require('./TagsSection').TagsSection;
} catch (error) {
  console.error('Failed to import TagsSection:', error);
}

interface FileItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  size?: string;
  modified: string;
  status?: 'modified' | 'added' | 'deleted' | 'staged' | 'clean';
  starred?: boolean;
  fileType?: string;
  path?: string;
}

interface FileExplorerProps {
  isDark: boolean;
  tabType: 'explorer' | 'repository';
  section: string;
  isWelcomeTab?: boolean;
  isProfileTab?: boolean;
  onLocationSelect?: (type: 'explorer' | 'repository', path: string) => void;
  onThemeToggle?: () => void;
}

interface TreeNode {
  id: string;
  name: string;
  type: 'folder' | 'file';
  children?: TreeNode[];
  expanded?: boolean;
  size?: string;
  modified: string;
  status?: 'modified' | 'added' | 'deleted' | 'staged' | 'clean';
  starred?: boolean;
  fileType?: string;
}

// Repository tree data (with version control status)
const mockRepositoryTreeData: TreeNode[] = [
  {
    id: '1',
    name: 'src',
    type: 'folder',
    modified: '2 hours ago',
    status: 'modified',
    expanded: true,
    children: [
      {
        id: '2',
        name: 'components',
        type: 'folder',
        modified: '1 hour ago',
        status: 'clean',
        expanded: true,
        children: [
          { id: '5', name: 'Header.tsx', type: 'file', size: '4.8 KB', modified: '1 hour ago', status: 'staged', fileType: 'tsx', starred: true },
          { id: '6', name: 'Sidebar.tsx', type: 'file', size: '3.2 KB', modified: '2 hours ago', status: 'modified', fileType: 'tsx' },
          { id: '11', name: 'FileExplorer.tsx', type: 'file', size: '15.3 KB', modified: '30 minutes ago', status: 'modified', fileType: 'tsx' },
          { id: '12', name: 'StatusBar.tsx', type: 'file', size: '2.4 KB', modified: '1 day ago', status: 'clean', fileType: 'tsx' },
        ]
      }
    ]
  }
];

// File explorer tree data (without version control status)
const mockExplorerTreeData: TreeNode[] = [
  {
    id: '1',
    name: 'Documents',
    type: 'folder',
    modified: '2 hours ago',
    expanded: true,
    children: [
      { id: '7', name: 'Notes.txt', type: 'file', size: '2.1 KB', modified: '30 minutes ago', fileType: 'txt' },
    ]
  }
];

const mockFiles: FileItem[] = [
  { id: '1', name: 'src', type: 'folder', modified: '2 hours ago', status: 'modified' },
  { id: '4', name: 'package.json', type: 'file', size: '2.1 KB', modified: '5 minutes ago', status: 'modified', fileType: 'json' },
];

const getFileIcon = (item: FileItem | TreeNode, isHovered = false, isSelected = false) => {
  if (item.type === 'folder') {
    return (isHovered || isSelected) ? <FolderOpen className="w-5 h-5" /> : <Folder className="w-5 h-5" />;
  }
  
  const extension = item.fileType || item.name.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'tsx':
    case 'ts':
    case 'js':
    case 'jsx':
      return <FileCode className="w-5 h-5" />;
    case 'png':
    case 'jpg':
    case 'jpeg':
      return <FileImage className="w-5 h-5" />;
    case 'md':
    case 'txt':
    case 'json':
      return <FileText className="w-5 h-5" />;
    default:
      return <File className="w-5 h-5" />;
  }
};

const getStatusColor = (status?: string) => {
  switch (status) {
    case 'modified': return 'bg-white/20 text-white/80 border-white/30';
    case 'added': return 'bg-white/15 text-white/70 border-white/25';
    case 'deleted': return 'bg-white/10 text-white/60 border-white/20';
    case 'staged': return 'bg-white/25 text-white/90 border-white/35';
    default: return 'bg-white/10 text-white/50 border-white/15';
  }
};

export function FileExplorer({ isDark, tabType, section, isWelcomeTab = false, isProfileTab = false, onLocationSelect, onThemeToggle }: FileExplorerProps) {
  const [viewMode, setViewMode] = useState<'tree' | 'grid' | 'list'>('tree');
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'modified' | 'size'>('name');
  const [filterText, setFilterText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isCommitDialogOpen, setIsCommitDialogOpen] = useState(false);
  const [detailsPanelWidth, setDetailsPanelWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);

  // Changelist panel state
  const [changelistPanelHeight, setChangelistPanelHeight] = useState(250);
  const [isChangelistPanelCollapsed, setIsChangelistPanelCollapsed] = useState(false);
  const [isChangelistResizing, setIsChangelistResizing] = useState(false);

  // VCS Hook
  const {
    vcsState,
    plans,
    selectedFile: selectedVCSFile,
    setSelectedFile: setSelectedVCSFile,
    stageFile,
    unstageFile,
    discardChanges,
    commit,
    createPlan,
    updatePlan,
    deletePlan,
    toggleTask,
    // Changelist functions
    createChangelist,
    updateChangelist,
    deleteChangelist,
    stashChangelist,
    unstashChangelist,
    moveFileToChangelist
  } = useVCS();

  // Handler for committing a changelist
  const handleCommitChangelist = (changelist: any) => {
    // Stage all files from the changelist first
    changelist.files.forEach((file: any) => {
      stageFile(file.path);
    });
    
    // Then open commit dialog
    setIsCommitDialogOpen(true);
    console.log('Committing changelist:', changelist.name);
  };

  const showVersionControl = tabType === 'repository' && (section === 'local' || section === 'staging');
  const isVCSSection = section === 'local' || section === 'staging';
  const isLocalRepository = tabType === 'repository' && section === 'local';
  const treeData = showVersionControl ? mockRepositoryTreeData : mockExplorerTreeData;
  const [expandedTreeData, setExpandedTreeData] = useState<TreeNode[]>(treeData);
  const [currentPath, setCurrentPath] = useState<string[]>(
    showVersionControl ? ['Home', 'Repositories', 'nordic-explorer'] : ['Home', 'User', 'Documents']
  );

  // For grid/list navigation - track current folder
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [navigationHistory, setNavigationHistory] = useState<Array<{folderId: string | null, folderName: string}>>([]);

  // Enhanced search results with actions
  const getSearchResults = () => {
    if (!searchQuery) return [];
    
    const allFiles: (FileItem & { path: string })[] = [];
    const traverse = (nodes: TreeNode[], path = '') => {
      nodes.forEach(node => {
        const fullPath = path ? `${path}/${node.name}` : node.name;
        allFiles.push({
          id: node.id,
          name: node.name,
          type: node.type,
          size: node.size,
          modified: node.modified,
          status: node.status,
          starred: node.starred,
          fileType: node.fileType,
          path: fullPath
        });
        
        if (node.children) {
          traverse(node.children, fullPath);
        }
      });
    };
    
    traverse(expandedTreeData);
    
    return allFiles.filter(file => 
      file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (file.path && file.path.toLowerCase().includes(searchQuery.toLowerCase()))
    ).slice(0, 8);
  };

  // Show welcome screen for new tabs
  if (isWelcomeTab && onLocationSelect) {
    return <WelcomeScreen isDark={isDark} onSelectLocation={onLocationSelect} />;
  }

  // Show settings panel for profile tabs
  if (isProfileTab) {
    if (!onThemeToggle) {
      return (
        <div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground">Settings panel not available</p>
        </div>
      );
    }
    
    try {
      return <SettingsPanel isDark={isDark} onThemeToggle={onThemeToggle} />;
    } catch (error) {
      console.error('Settings panel error:', error);
      return (
        <div className="flex h-full items-center justify-center">
          <p className="text-muted-foreground">Settings panel failed to load</p>
        </div>
      );
    }
  }
  
  if (tabType === 'repository') {
    switch (section) {
      case 'explorer':
        if (!VCSFileExplorer) {
          return (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">VCS File Explorer not available</p>
            </div>
          );
        }
        try {
          return (
            <div className="flex-1 h-full overflow-hidden">
              <VCSFileExplorer isDark={isDark} />
            </div>
          );
        } catch (error) {
          console.error('VCSFileExplorer error:', error);
          return (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">VCS File Explorer failed to load</p>
            </div>
          );
        }

      case 'branches':
        if (!BranchesPanel) {
          return (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">Branches panel not available</p>
            </div>
          );
        }
        try {
          return (
            <div className="flex-1 h-full overflow-hidden">
              <BranchesPanel isDark={isDark} />
            </div>
          );
        } catch (error) {
          console.error('BranchesPanel error:', error);
          return (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">Branches panel failed to load</p>
            </div>
          );
        }

      case 'plans':
        if (!PlansPanel) {
          return (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">Plans panel not available</p>
            </div>
          );
        }
        try {
          return (
            <div className="flex-1 h-full overflow-hidden">
              <PlansPanel
                isDark={isDark}
                plans={plans}
                onCreatePlan={createPlan}
                onUpdatePlan={updatePlan}
                onDeletePlan={deletePlan}
                onToggleTask={toggleTask}
              />
            </div>
          );
        } catch (error) {
          console.error('PlansPanel error:', error);
          return (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">Plans panel failed to load</p>
            </div>
          );
        }

      case 'teams':
        if (!TeamsSection) {
          return (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">Teams section not available</p>
            </div>
          );
        }
        try {
          return (
            <TeamsSection isDark={isDark} />
          );
        } catch (error) {
          console.error('TeamsSection error:', error);
          return (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">Teams section failed to load</p>
            </div>
          );
        }

      case 'tags':
        if (!TagsSection) {
          return (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">Tags section not available</p>
            </div>
          );
        }
        try {
          return (
            <TagsSection isDark={isDark} />
          );
        } catch (error) {
          console.error('TagsSection error:', error);
          return (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">Tags section failed to load</p>
            </div>
          );
        }

      case 'workspace':
        try {
          return (
            <div className="flex-1 h-full overflow-hidden">
              <WorkspacePanel isDark={isDark} />
            </div>
          );
        } catch (error) {
          console.error('WorkspacePanel error:', error);
          return (
            <div className="flex h-full items-center justify-center">
              <p className="text-muted-foreground">Workspace panel failed to load</p>
            </div>
          );
        }

      default:
        // Continue to file explorer for local, remote, etc.
        break;
    }
  }

  const toggleTreeNode = (nodeId: string) => {
    const updateNode = (nodes: TreeNode[]): TreeNode[] => {
      return nodes.map(node => {
        if (node.id === nodeId) {
          return { ...node, expanded: !node.expanded };
        }
        if (node.children) {
          return { ...node, children: updateNode(node.children) };
        }
        return node;
      });
    };
    setExpandedTreeData(updateNode(expandedTreeData));
  };

  const renderTreeNode = (node: TreeNode, depth: number = 0) => (
    <div key={node.id}>
      <div
        className={`flex items-center gap-2 py-1 px-2 hover:bg-white/5 rounded cursor-pointer group ${
          selectedFile?.id === node.id ? `${isDark ? 'bg-white/10' : 'bg-black/10'}` : ''
        }`}
        style={{ paddingLeft: `${depth * 20 + 8}px` }}
        onClick={() => {
          const fileItem = {
            id: node.id,
            name: node.name,
            type: node.type,
            size: node.size,
            modified: node.modified,
            status: node.status,
            starred: node.starred,
            fileType: node.fileType
          };
          
          if (node.type === 'folder') {
            toggleTreeNode(node.id);
            setSelectedFile(fileItem);
          } else {
            setSelectedFile(fileItem);
            setShowDetailsPanel(true);
          }
        }}
      >
        {node.type === 'folder' && (
          <Button
            variant="ghost"
            size="sm"
            className="h-4 w-4 p-0"
            onClick={(e) => {
              e.stopPropagation();
              toggleTreeNode(node.id);
            }}
          >
            {node.expanded ? (
              <ChevronDown className="w-3 h-3" />
            ) : (
              <ChevronRight className="w-3 h-3" />
            )}
          </Button>
        )}
        {node.type === 'file' && <div className="w-4" />}
        
        <div className="flex items-center gap-2 flex-1 min-w-0">
          {getFileIcon(node, false, selectedFile?.id === node.id)}
          <span className="text-sm truncate">{node.name}</span>
          {node.starred && <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 flex-shrink-0" />}
          {showVersionControl && isVCSSection && node.status && node.status !== 'clean' && (
            <Badge variant="outline" className={`text-xs h-4 ${getStatusColor(node.status)}`}>
              {node.status.charAt(0).toUpperCase()}
            </Badge>
          )}
        </div>
        
        {/* Hover Info */}
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          {node.size && (
            <span className="text-xs text-muted-foreground">{node.size}</span>
          )}
          <span className="text-xs text-muted-foreground">{node.modified}</span>
        </div>
      </div>
      
      {/* Render children if expanded */}
      {node.expanded && node.children && (
        <div>
          {node.children.map(child => renderTreeNode(child, depth + 1))}
        </div>
      )}
    </div>
  );

  const getCurrentFiles = () => {
    if (showSearchResults) {
      return getSearchResults();
    }

    if (viewMode === 'tree' || !currentFolderId) {
      return mockFiles.filter(file => 
        filterText === '' || file.name.toLowerCase().includes(filterText.toLowerCase())
      );
    }
    return mockFiles;
  };

  // Main content render
  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Content Area */}
      <div className="flex-1 flex overflow-hidden">
        {/* Main File Area */}
        <div className="flex-1 flex flex-col">
          {/* Top Bar - only show breadcrumbs for grid/list view */}
          <div className={`flex items-center justify-between p-3 border-b ${isDark ? 'border-white/10' : 'border-black/10'} bg-gradient-to-r from-transparent to-white/5`}>
            <div className="flex items-center gap-2">
              {/* Only show breadcrumbs for grid/list view, not tree view */}
              {viewMode !== 'tree' && (
                <div className="flex items-center gap-1">
                  {currentPath.map((pathPart, index) => (
                    <React.Fragment key={index}>
                      <button
                        className="text-sm hover:text-white/90 transition-colors"
                        onClick={() => {
                          if (index < currentPath.length - 1) {
                            // Navigate to this breadcrumb level
                            console.log('Navigate to:', pathPart);
                          }
                        }}
                      >
                        {pathPart}
                      </button>
                      {index < currentPath.length - 1 && (
                        <ChevronRight className="w-3 h-3 text-white/50" />
                      )}
                    </React.Fragment>
                  ))}
                </div>
              )}
              
              {/* Search */}
              <div className="relative">
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50" />
                  <Input
                    placeholder="Search files..."
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setShowSearchResults(e.target.value.length > 0);
                    }}
                    onFocus={() => searchQuery.length > 0 && setShowSearchResults(true)}
                    className={`pl-10 w-64 h-8 text-sm ${isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}
                  />
                </div>
                
                {/* Search Results Dropdown - High z-index to overlay everything */}
                {showSearchResults && searchQuery && (
                  <div className={`absolute top-full left-0 right-0 mt-1 max-h-64 ${isDark ? 'glass-panel-dark' : 'glass-panel-light'} rounded-lg border ${isDark ? 'border-white/20' : 'border-black/20'} shadow-xl overflow-hidden z-[9999]`}>
                    <div className="p-2">
                      <div className="text-xs text-muted-foreground px-2 py-1">
                        Search Results ({getSearchResults().length})
                      </div>
                      <div className="space-y-1 max-h-48 overflow-y-auto">
                        {getSearchResults().map((result) => (
                          <div
                            key={result.id}
                            className={`flex items-center gap-2 p-2 rounded cursor-pointer hover:${isDark ? 'bg-white/10' : 'bg-black/10'} transition-colors`}
                            onClick={() => {
                              setSelectedFile(result);
                              setShowDetailsPanel(true);
                              setShowSearchResults(false);
                              setSearchQuery('');
                            }}
                          >
                            {getFileIcon(result)}
                            <div className="flex-1 min-w-0">
                              <div className="text-sm truncate">{result.name}</div>
                              <div className="text-xs text-muted-foreground truncate">{result.path}</div>
                            </div>
                            {result.status && result.status !== 'clean' && (
                              <Badge variant="outline" className={`text-xs h-4 ${getStatusColor(result.status)}`}>
                                {result.status.charAt(0).toUpperCase()}
                              </Badge>
                            )}
                          </div>
                        ))}
                        {getSearchResults().length === 0 && (
                          <div className="text-sm text-muted-foreground text-center py-4">
                            No results found
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant={viewMode === 'tree' ? 'default' : 'ghost'}
                  onClick={() => setViewMode('tree')}
                  className="h-7 w-7 p-0"
                >
                  <TreePine className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  onClick={() => setViewMode('grid')}
                  className="h-7 w-7 p-0"
                >
                  <Grid3X3 className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  onClick={() => setViewMode('list')}
                  className="h-7 w-7 p-0"
                >
                  <List className="w-3 h-3" />
                </Button>
              </div>

              {/* Actions */}
              {showVersionControl && isVCSSection && (
                <Button
                  size="sm"
                  onClick={() => setIsCommitDialogOpen(true)}
                  disabled={vcsState.staged.length === 0}
                  className="h-7"
                >
                  <GitCommit className="w-3 h-3 mr-1" />
                  Commit
                </Button>
              )}
            </div>
          </div>

          {/* File Content */}
          <div className="flex-1 overflow-hidden">
            {viewMode === 'tree' ? (
              <div className="h-full overflow-y-auto">
                <div className="p-2">
                  {expandedTreeData.map(node => renderTreeNode(node))}
                </div>
              </div>
            ) : (
              <div className="p-4">
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Grid and List views coming soon...</p>
                </div>
              </div>
            )}
          </div>

          {/* VCS Section with Changelist Panel */}
          {showVersionControl && isLocalRepository && (
            <Resizable
              size={{ width: '100%', height: changelistPanelHeight }}
              onResizeStart={() => setIsChangelistResizing(true)}
              onResizeStop={() => setIsChangelistResizing(false)}
              onResize={(e, direction, ref, delta) => {
                setChangelistPanelHeight(changelistPanelHeight + delta.height);
              }}
              enable={{ top: true, right: false, bottom: false, left: false, topRight: false, bottomRight: false, bottomLeft: false, topLeft: false }}
              className={`border-t ${isDark ? 'border-white/10' : 'border-black/10'} ${isChangelistResizing ? 'resizing' : ''}`}
            >
              <ChangelistPanel
                isDark={isDark}
                changelists={vcsState.changelists}
                onCreateChangelist={createChangelist}
                onUpdateChangelist={updateChangelist}
                onDeleteChangelist={deleteChangelist}
                onStashChangelist={stashChangelist}
                onUnstashChangelist={unstashChangelist}
                onMoveFileToChangelist={moveFileToChangelist}
                onStageFile={stageFile}
                onUnstageFile={unstageFile}
                onDiscardChanges={discardChanges}
                onCommitChangelist={handleCommitChangelist}
                selectedFile={selectedVCSFile}
                onFileSelect={setSelectedVCSFile}
              />
            </Resizable>
          )}
        </div>

        {/* Details Panel */}
        {showDetailsPanel && selectedFile && (
          <Resizable
            size={{ width: detailsPanelWidth, height: '100%' }}
            onResizeStart={() => setIsResizing(true)}
            onResizeStop={() => setIsResizing(false)}
            onResize={(e, direction, ref, delta) => {
              setDetailsPanelWidth(detailsPanelWidth - delta.width);
            }}
            enable={{ left: true, right: false, top: false, bottom: false, topLeft: false, topRight: false, bottomLeft: false, bottomRight: false }}
            className={`resizable-panel ${isResizing ? 'resizing' : ''}`}
          >
            <FileDetailsPanel
              isDark={isDark}
              file={selectedFile}
              vcsFile={selectedVCSFile}
              onClose={() => {
                setShowDetailsPanel(false);
                setSelectedFile(null);
              }}
              onStageFile={stageFile}
              onUnstageFile={unstageFile}
              onDiscardChanges={discardChanges}
            />
          </Resizable>
        )}
      </div>

      {/* Commit Dialog */}
      <CommitDialog
        isDark={isDark}
        isOpen={isCommitDialogOpen}
        onClose={() => setIsCommitDialogOpen(false)}
        stagedFiles={vcsState.staged}
        onCommit={commit}
        onStageFile={stageFile}
        onUnstageFile={unstageFile}
      />
    </div>
  );
}