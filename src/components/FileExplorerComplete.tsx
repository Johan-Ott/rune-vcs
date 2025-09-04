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
  MoreHorizontal,
  Grid,
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
  Globe,
  X
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
import { AdvancedSearchDialog } from './search/AdvancedSearchDialog';
import { SmartSearchBar } from './search/SmartSearchBar';
import { SearchResults } from './search/SearchResults';
import { EnhancedNavigationBar } from './navigation/EnhancedNavigationBar';
import type { NavigationHistoryEntry, Bookmark, PathSuggestion } from './navigation/types';
import { QuickActionsToolbar, CreateFileDialog, FileOperations, useKeyboardShortcuts } from './actions';
import type { FileItem as ActionFileItem, ClipboardData } from './actions';

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
  // Tab manager
  const {
    tabs,
    activeTabId,
    activeTab,
    activeTabState,
    addTab,
    closeTab,
    selectTab,
    updateTab,
    duplicateTab,
    moveTab,
    pinTab,
    unpinTab,
    navigateToPath,
    goBack,
    goForward,
    canGoBack,
    canGoForward,
    openInNewTab,
    updateActiveTabState,
  } = useTabManager('/Users/johanottosson/Documents');

  // Use tab state instead of local state for tab-specific data
  const viewMode = activeTabState?.viewMode || 'tree';
  const selectedFile = activeTabState?.selectedFile || null;
  const showDetailsPanel = activeTabState?.showDetailsPanel || false;
  const sortBy = activeTabState?.sortBy || 'name';
  const sortOrder = activeTabState?.sortOrder || 'asc';
  const filterText = activeTabState?.filterText || '';
  const searchQuery = activeTabState?.searchQuery || '';
  const showSearchResults = activeTabState?.showSearchResults || false;
  const selectedFiles = activeTabState?.selectedFiles || [];
  const searchResults = activeTabState?.searchResults || [];

  // State that's tab-independent
  const [isCommitDialogOpen, setIsCommitDialogOpen] = useState(false);
  const [detailsPanelWidth, setDetailsPanelWidth] = useState(320);
  const [isResizing, setIsResizing] = useState(false);

  // Enhanced search state
  const [isAdvancedSearchOpen, setIsAdvancedSearchOpen] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [savedSearches, setSavedSearches] = useState<any[]>([]);
  const [searchViewMode, setSearchViewMode] = useState<'list' | 'grid'>('list');

  // Enhanced Navigation state (use tab manager for navigation)
  const navCurrentPath = activeTabState?.currentPath || '/Users/johanottosson/Documents';
  const navHistory = activeTabState?.navigationHistory || [];
  const navHistoryIndex = activeTabState?.historyIndex || 0;
  const [navBookmarks, setNavBookmarks] = useState<Bookmark[]>([
    {
      id: '1',
      name: 'Documents',
      path: '/Users/johanottosson/Documents',
      icon: <FolderOpen className="w-4 h-4" />,
      dateAdded: Date.now()
    }
  ]);
  const [navPathSuggestions] = useState<PathSuggestion[]>([
    {
      path: '/Users/johanottosson/Documents',
      name: 'Documents',
      type: 'folder',
      icon: <FolderOpen className="w-4 h-4" />
    },
    {
      path: '/Users/johanottosson/Desktop',
      name: 'Desktop',
      type: 'folder',
      icon: <FolderOpen className="w-4 h-4" />
    }
  ]);

  // Quick Actions state
  const [clipboard, setClipboard] = useState<ClipboardData | null>(null);
  const [showCreateDialog, setShowCreateDialog] = useState(false);

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

  // Enhanced search functionality
  const handleSearch = async (query: string, filters?: any) => {
    setIsSearching(true);
    updateActiveTabState({ searchQuery: query });
    
    try {
      // Simulate search API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Mock search results with different file types
      const mockResults = getSearchResults().map((file, index) => ({
        id: file.id,
        name: file.name,
        path: file.path || `/Users/Documents/${file.name}`,
        type: file.type,
        size: file.size ? parseInt(file.size.replace(/[^\d]/g, '')) : Math.floor(Math.random() * 1000000),
        modified: new Date(Date.now() - Math.random() * 10000000000),
        created: new Date(Date.now() - Math.random() * 20000000000),
        fileType: file.fileType,
        matchScore: Math.random(),
        isStarred: file.starred,
        matchContext: `This file contains "${query}" in its content...`,
        tags: ['important', 'work', 'project'].slice(0, Math.floor(Math.random() * 3))
      }));
      
      updateActiveTabState({ 
        searchResults: mockResults,
        showSearchResults: true
      });
      
      // Update recent searches
      if (query && !recentSearches.includes(query)) {
        setRecentSearches(prev => [query, ...prev.slice(0, 9)]);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAdvancedSearch = (filter: any) => {
    console.log('Advanced search with filter:', filter);
    handleSearch(filter.query, filter);
  };

  const handleSaveSearch = (search: any) => {
    setSavedSearches(prev => [...prev, search]);
  };

  const clearSearch = () => {
    updateActiveTabState({
      searchQuery: '',
      searchResults: [],
      showSearchResults: false
    });
  };

  const handleSearchResultClick = (result: any) => {
    updateActiveTabState({
      selectedFile: {
        id: result.id,
        name: result.name,
        type: result.type,
        size: result.size ? `${(result.size / 1024).toFixed(1)} KB` : undefined,
        modified: result.modified.toLocaleDateString(),
        path: result.path,
        fileType: result.fileType,
        starred: result.isStarred
      },
      showDetailsPanel: true
    });
  };

  const handleSearchResultDoubleClick = (result: any) => {
    // Handle opening the file
    console.log('Opening file:', result);
  };

  // Enhanced Navigation handlers
  const handleNavigateTo = (path: string) => {
    navigateToPath(path);
  };

  const handleNavigateBack = () => {
    goBack();
  };

  const handleNavigateForward = () => {
    goForward();
  };

  const handleRefresh = () => {
    // Refresh current location
    console.log('Refreshing:', navCurrentPath);
  };

  const handleAddBookmark = (bookmark: Omit<Bookmark, 'id' | 'dateAdded'>) => {
    const newBookmark: Bookmark = {
      ...bookmark,
      id: Date.now().toString(),
      dateAdded: Date.now()
    };
    setNavBookmarks(prev => [...prev, newBookmark]);
  };

  const handleRemoveBookmark = (id: string) => {
    setNavBookmarks(prev => prev.filter(b => b.id !== id));
  };

  const handleUpdateBookmark = (id: string, updates: Partial<Bookmark>) => {
    setNavBookmarks(prev => prev.map(b => b.id === id ? { ...b, ...updates } : b));
  };

  const isCurrentPathBookmarked = navBookmarks.some(b => b.path === navCurrentPath);

  // Quick Actions handlers
  const handleCopy = () => {
    if (selectedFiles.length > 0) {
      FileOperations.copy(selectedFiles as ActionFileItem[]);
      setClipboard(FileOperations.getClipboard());
    }
  };

  const handleCut = () => {
    if (selectedFiles.length > 0) {
      FileOperations.cut(selectedFiles as ActionFileItem[]);
      setClipboard(FileOperations.getClipboard());
    }
  };

  const handlePaste = async () => {
    if (FileOperations.canPaste()) {
      try {
        await FileOperations.paste(navCurrentPath);
        setClipboard(FileOperations.getClipboard());
        // Refresh the file list
        handleRefresh();
      } catch (error) {
        console.error('Paste failed:', error);
      }
    }
  };

  const handleDelete = async () => {
    if (selectedFiles.length > 0) {
      try {
        for (const file of selectedFiles) {
          await FileOperations.deleteFile(file.path || `${navCurrentPath}/${file.name}`);
        }
        updateActiveTabState({ selectedFiles: [] });
        handleRefresh();
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const handleNewFolder = () => {
    setShowCreateDialog(true);
  };

  const handleNewFile = () => {
    setShowCreateDialog(true);
  };

  const handleDownload = async () => {
    if (selectedFiles.length > 0) {
      try {
        for (const file of selectedFiles) {
          await FileOperations.downloadFile(file as ActionFileItem);
        }
      } catch (error) {
        console.error('Download failed:', error);
      }
    }
  };

  const handleUpload = () => {
    // Create hidden file input for upload
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = true;
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) {
        console.log('Upload files:', Array.from(files).map(f => f.name));
        // Handle file upload
      }
    };
    input.click();
  };

  const handleArchive = async () => {
    if (selectedFiles.length > 0) {
      try {
        const archiveName = `archive_${Date.now()}.zip`;
        const outputPath = `${navCurrentPath}/${archiveName}`;
        await FileOperations.compressFiles(selectedFiles as ActionFileItem[], outputPath);
        handleRefresh();
      } catch (error) {
        console.error('Archive failed:', error);
      }
    }
  };

  const handleShare = async () => {
    if (selectedFiles.length > 0) {
      try {
        await FileOperations.shareFiles(selectedFiles as ActionFileItem[]);
      } catch (error) {
        console.error('Share failed:', error);
      }
    }
  };

  const handleCreateFile = async (filePath: string, content: string) => {
    try {
      await FileOperations.createFile(filePath, content);
      handleRefresh();
    } catch (error) {
      console.error('Create file failed:', error);
    }
  };

  const handleCreateFolder = async (folderPath: string) => {
    try {
      await FileOperations.createFolder(folderPath);
      handleRefresh();
    } catch (error) {
      console.error('Create folder failed:', error);
    }
  };

  const handleFullscreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      document.documentElement.requestFullscreen();
    }
  };

  // Keyboard shortcuts
  useKeyboardShortcuts({
    shortcuts: {
      'cmd+c': handleCopy,
      'cmd+x': handleCut,
      'cmd+v': handlePaste,
      'delete': handleDelete,
      'backspace': handleDelete,
      'cmd+n': handleNewFile,
      'cmd+shift+n': handleNewFolder,
      'cmd+d': handleDownload,
      'f5': handleRefresh,
      'cmd+r': handleRefresh,
      'cmd+f': () => setIsAdvancedSearchOpen(true),
      'cmd+1': () => updateActiveTabState({ viewMode: 'tree' }),
      'cmd+2': () => updateActiveTabState({ viewMode: 'grid' }),
      'cmd+3': () => updateActiveTabState({ viewMode: 'list' }),
      'cmd+up': handleNavigateBack,
      'cmd+down': handleNavigateForward,
      'escape': () => {
        updateActiveTabState({ 
          selectedFiles: [],
          showSearchResults: false
        });
        setIsAdvancedSearchOpen(false);
      },
    }
  });

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
            updateActiveTabState({ selectedFile: fileItem });
          } else {
            updateActiveTabState({ 
              selectedFile: fileItem,
              showDetailsPanel: true
            });
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

  const handleAddTab = (type: 'local' | 'remote' | 'search' | 'bookmarks') => {
    switch (type) {
      case 'local':
        addTab({ 
          title: 'Documents', 
          path: '/Users/johanottosson/Documents', 
          type: 'local',
          icon: <FolderOpen className="w-4 h-4" />
        });
        break;
      case 'remote':
        addTab({ 
          title: 'Remote Files', 
          path: '/remote', 
          type: 'remote',
          icon: <Globe className="w-4 h-4" />
        });
        break;
      case 'search':
        addTab({ 
          title: 'Search Results', 
          path: '/search', 
          type: 'search',
          icon: <Search className="w-4 h-4" />
        });
        break;
      case 'bookmarks':
        addTab({ 
          title: 'Bookmarks', 
          path: '/bookmarks', 
          type: 'bookmarks',
          icon: <Star className="w-4 h-4" />
        });
        break;
    }
  };

  const renderTabContent = () => {
    if (!activeTab) return null;

    switch (activeTab.type) {
      case 'local':
        return renderLocalFileContent();
      case 'remote':
        return renderRemoteContent();
      case 'search':
        return renderSearchContent();
      case 'bookmarks':
        return renderBookmarksContent();
      default:
        return renderLocalFileContent();
    }
  };

  const renderLocalFileContent = () => {
    // This is the existing file explorer content
    return (
      <>
        {/* Enhanced Navigation Bar */}
        <EnhancedNavigationBar
          currentPath={navCurrentPath}
          currentName={navCurrentPath.split('/').pop() || 'Root'}
          history={navHistory}
          currentHistoryIndex={navHistoryIndex}
          canGoBack={canGoBack}
          canGoForward={canGoForward}
          bookmarks={navBookmarks}
          pathSuggestions={navPathSuggestions}
          isCurrentPathBookmarked={isCurrentPathBookmarked}
          onNavigate={handleNavigateTo}
          onNavigateBack={handleNavigateBack}
          onNavigateForward={handleNavigateForward}
          onRefresh={handleRefresh}
          onAddBookmark={handleAddBookmark}
          onRemoveBookmark={handleRemoveBookmark}
          onUpdateBookmark={handleUpdateBookmark}
          className="border-b"
        />

        {/* Quick Actions Toolbar */}
        <QuickActionsToolbar
          onCopy={handleCopy}
          onCut={handleCut}
          onPaste={handlePaste}
          onDelete={handleDelete}
          onNewFolder={handleNewFolder}
          onNewFile={handleNewFile}
          onDownload={handleDownload}
          onUpload={handleUpload}
          onArchive={handleArchive}
          onShare={handleShare}
          onRefresh={handleRefresh}
          viewMode={viewMode}
          onViewModeChange={(mode) => updateActiveTabState({ viewMode: mode })}
          onSort={() => console.log('Sort')}
          onFilter={() => console.log('Filter')}
          onSearch={() => setIsAdvancedSearchOpen(true)}
          onFullscreen={handleFullscreen}
          hasSelection={selectedFiles.length > 0}
          canPaste={FileOperations.canPaste()}
          clipboard={clipboard}
          isDark={isDark}
        />

        {/* Main Content Area - existing file explorer content */}
        {renderMainContent()}
      </>
    );
  };

  const renderRemoteContent = () => {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="text-center space-y-4">
          <Globe className="w-16 h-16 mx-auto text-muted-foreground" />
          <div>
            <h3 className="text-lg font-semibold">Remote Files</h3>
            <p className="text-muted-foreground">Connect to remote servers and cloud storage</p>
          </div>
          <Button onClick={() => console.log('Connect to remote')}>
            <Plus className="w-4 h-4 mr-2" />
            Add Remote Connection
          </Button>
        </div>
      </div>
    );
  };

  const renderSearchContent = () => {
    return (
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b">
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Advanced Search</h3>
            <SmartSearchBar
              value={searchQuery}
              onChange={(value) => updateActiveTabState({ searchQuery: value })}
              onSearch={handleSearch}
              onAdvancedSearch={() => setIsAdvancedSearchOpen(true)}
              placeholder="Search across all locations..."
              recentSearches={recentSearches}
              className="w-full"
            />
          </div>
        </div>
        
        {showSearchResults && searchResults.length > 0 ? (
          <SearchResults
            results={searchResults}
            query={searchQuery}
            onResultClick={handleSearchResultClick}
            onResultDoubleClick={handleSearchResultDoubleClick}
            viewMode={searchViewMode}
            onViewModeChange={setSearchViewMode}
            totalResults={searchResults.length}
            isLoading={isSearching}
            onClearSearch={clearSearch}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center space-y-4">
              <Search className="w-16 h-16 mx-auto text-muted-foreground" />
              <div>
                <h3 className="text-lg font-semibold">Search Files and Folders</h3>
                <p className="text-muted-foreground">Enter a search query to find files across all locations</p>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const renderBookmarksContent = () => {
    return (
      <div className="flex-1 flex flex-col">
        <div className="p-4 border-b">
          <h3 className="text-lg font-semibold">Bookmarks</h3>
        </div>
        
        <div className="flex-1 p-4">
          {navBookmarks.length > 0 ? (
            <div className="space-y-2">
              {navBookmarks.map((bookmark) => (
                <div
                  key={bookmark.id}
                  className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 cursor-pointer"
                  onClick={() => {
                    // Switch to a local tab and navigate to bookmark
                    const localTab = tabs.find(t => t.type === 'local');
                    if (localTab) {
                      selectTab(localTab.id);
                      handleNavigateTo(bookmark.path);
                    } else {
                      addTab({
                        title: bookmark.name,
                        path: bookmark.path,
                        type: 'local',
                        icon: bookmark.icon
                      });
                    }
                  }}
                >
                  {bookmark.icon}
                  <div className="flex-1">
                    <div className="font-medium">{bookmark.name}</div>
                    <div className="text-sm text-muted-foreground">{bookmark.path}</div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleRemoveBookmark(bookmark.id);
                    }}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center space-y-4">
                <Star className="w-16 h-16 mx-auto text-muted-foreground" />
                <div>
                  <h3 className="text-lg font-semibold">No Bookmarks</h3>
                  <p className="text-muted-foreground">Bookmark your favorite locations for quick access</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  };

  const renderMainContent = () => {
    // This contains the existing main content rendering logic - placeholder for now
    return (
      <div className="flex-1 p-4">
        <div className="text-center text-muted-foreground">
          File explorer content will be rendered here based on view mode
        </div>
      </div>
    );
  };

  // Main content render
  return (
    <div className="flex-1 flex flex-col h-full">
      {/* Tab Bar */}
      <TabBar
        tabs={tabs}
        activeTabId={activeTabId}
        onTabSelect={selectTab}
        onTabClose={closeTab}
        onTabAdd={handleAddTab}
        onTabMove={moveTab}
        className="border-b"
      />

      {/* Render content based on active tab type */}
      {renderTabContent()}
    </div>
  );
}
      <EnhancedNavigationBar
        currentPath={navCurrentPath}
        currentName={navCurrentPath.split('/').pop() || 'Root'}
        history={navHistory}
        currentHistoryIndex={navHistoryIndex}
        canGoBack={canGoBack}
        canGoForward={canGoForward}
        bookmarks={navBookmarks}
        isCurrentPathBookmarked={isCurrentPathBookmarked}
        pathSuggestions={navPathSuggestions}
        onNavigate={handleNavigateTo}
        onNavigateBack={handleNavigateBack}
        onNavigateForward={handleNavigateForward}
        onRefresh={handleRefresh}
        onAddBookmark={handleAddBookmark}
        onRemoveBookmark={handleRemoveBookmark}
        onUpdateBookmark={handleUpdateBookmark}
        showBreadcrumbs={true}
        showQuickPath={true}
        showBookmarks={true}
      />

      {/* Quick Actions Toolbar */}
      <QuickActionsToolbar
        onCopy={handleCopy}
        onCut={handleCut}
        onPaste={handlePaste}
        onDelete={handleDelete}
        onNewFolder={handleNewFolder}
        onNewFile={handleNewFile}
        onDownload={handleDownload}
        onUpload={handleUpload}
        onArchive={handleArchive}
        onShare={handleShare}
        onRefresh={handleRefresh}
        viewMode={viewMode}
        onViewModeChange={(mode) => updateActiveTabState({ viewMode: mode })}
        onSort={() => console.log('Sort')}
        onFilter={() => console.log('Filter')}
        onSearch={() => setIsAdvancedSearchOpen(true)}
        onFullscreen={handleFullscreen}
        hasSelection={selectedFiles.length > 0}
        canPaste={FileOperations.canPaste()}
        selectedCount={selectedFiles.length}
      />
      
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
              
              {/* Enhanced Search */}
              <div className="relative w-80">
                <SmartSearchBar
                  value={searchQuery}
                  onChange={(value) => updateActiveTabState({ searchQuery: value })}
                  onSearch={handleSearch}
                  onAdvancedSearch={() => setIsAdvancedSearchOpen(true)}
                  placeholder="Search files and folders..."
                  recentSearches={recentSearches}
                  className="w-full"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              {/* View Mode Toggle */}
              <div className="flex items-center gap-1">
                <Button
                  size="sm"
                  variant={viewMode === 'tree' ? 'default' : 'ghost'}
                  onClick={() => updateActiveTabState({ viewMode: 'tree' })}
                  className="h-7 w-7 p-0"
                >
                  <TreePine className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  onClick={() => updateActiveTabState({ viewMode: 'grid' })}
                  className="h-7 w-7 p-0"
                >
                  <Grid className="w-3 h-3" />
                </Button>
                <Button
                  size="sm"
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  onClick={() => updateActiveTabState({ viewMode: 'list' })}
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
            {showSearchResults && searchResults.length > 0 ? (
              <SearchResults
                results={searchResults}
                query={searchQuery}
                totalResults={searchResults.length}
                isLoading={isSearching}
                onResultClick={handleSearchResultClick}
                onResultDoubleClick={handleSearchResultDoubleClick}
                onClearSearch={clearSearch}
                viewMode={searchViewMode}
                onViewModeChange={setSearchViewMode}
                className="p-4"
              />
            ) : viewMode === 'tree' ? (
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
            <div
              style={{ height: changelistPanelHeight }}
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
            </div>
          )}
        </div>

        {/* Details Panel */}
        {showDetailsPanel && selectedFile && (
          <div
            style={{ width: detailsPanelWidth }}
            className={`resizable-panel ${isResizing ? 'resizing' : ''}`}
          >
            <FileDetailsPanel
              isDark={isDark}
              file={selectedFile}
              vcsFile={selectedVCSFile}
              onClose={() => {
                updateActiveTabState({ 
                  showDetailsPanel: false,
                  selectedFile: null
                });
              }}
              onStageFile={stageFile}
              onUnstageFile={unstageFile}
              onDiscardChanges={discardChanges}
            />
          </div>
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

      {/* Create File Dialog */}
      <CreateFileDialog
        open={showCreateDialog}
        onOpenChange={setShowCreateDialog}
        currentPath={navCurrentPath}
        onCreateFile={handleCreateFile}
        onCreateFolder={handleCreateFolder}
      />
    </div>
  );
}