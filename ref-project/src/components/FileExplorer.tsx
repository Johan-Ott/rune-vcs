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
import { VCSFileExplorer } from './vcs/VCSFileExplorer';
import { PlansPanel } from './plans/PlansPanel';

import { BranchesPanel } from './vcs/BranchesPanel';
import { useVCS } from '../hooks/useVCS';
import { SettingsPanel } from './SettingsPanel';
import { TeamsSection } from './TeamsSection';
import { TagsSection } from './TagsSection';
import { SourcePanel } from './vcs/SourcePanel';
import { WorkspacePanel } from './WorkspacePanel';

interface FileItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  size?: string;
  modified: string;
  status?: 'modified' | 'added' | 'deleted' | 'staged' | 'clean';
  starred?: boolean;
  fileType?: string;
}

const mockFiles: FileItem[] = [
  { id: '1', name: 'src', type: 'folder', modified: '2 hours ago', status: 'modified' },
  { id: '2', name: 'components', type: 'folder', modified: '1 hour ago', status: 'clean' },
  { id: '3', name: 'assets', type: 'folder', modified: '3 days ago', status: 'clean', starred: true },
  { id: '4', name: 'package.json', type: 'file', size: '2.1 KB', modified: '5 minutes ago', status: 'modified', fileType: 'json' },
  { id: '5', name: 'App.tsx', type: 'file', size: '4.8 KB', modified: '1 hour ago', status: 'staged', fileType: 'tsx', starred: true },
  { id: '6', name: 'README.md', type: 'file', size: '1.2 KB', modified: '2 days ago', status: 'clean', fileType: 'md' },
  { id: '7', name: 'hero-image.png', type: 'file', size: '284 KB', modified: '1 week ago', status: 'clean', fileType: 'png' },
  { id: '8', name: 'main.js', type: 'file', size: '12.5 KB', modified: '3 hours ago', status: 'added', fileType: 'js' }
];

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
    case 'vue':
    case 'py':
    case 'java':
    case 'cpp':
    case 'c':
    case 'go':
    case 'rs':
      return <FileCode className="w-5 h-5" />;
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'svg':
    case 'webp':
      return <FileImage className="w-5 h-5" />;
    case 'mp4':
    case 'mov':
    case 'avi':
    case 'mkv':
      return <FileVideo className="w-5 h-5" />;
    case 'mp3':
    case 'wav':
    case 'flac':
    case 'ogg':
      return <FileAudio className="w-5 h-5" />;
    case 'zip':
    case 'rar':
    case 'tar':
    case 'gz':
      return <Archive className="w-5 h-5" />;
    case 'md':
    case 'txt':
    case 'json':
    case 'xml':
    case 'yaml':
    case 'yml':
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
      },
      {
        id: '13',
        name: 'hooks',
        type: 'folder',
        modified: '3 hours ago',
        status: 'clean',
        children: [
          { id: '14', name: 'useVCS.ts', type: 'file', size: '3.1 KB', modified: '3 hours ago', status: 'clean', fileType: 'ts' },
          { id: '15', name: 'useFileSystem.ts', type: 'file', size: '2.8 KB', modified: '1 day ago', status: 'clean', fileType: 'ts' },
        ]
      },
      { id: '7', name: 'App.tsx', type: 'file', size: '2.1 KB', modified: '30 minutes ago', status: 'modified', fileType: 'tsx' },
      { id: '16', name: 'main.tsx', type: 'file', size: '1.2 KB', modified: '2 days ago', status: 'clean', fileType: 'tsx' },
    ]
  },
  {
    id: '3',
    name: 'assets',
    type: 'folder',
    modified: '3 days ago',
    status: 'clean',
    starred: true,
    children: [
      { id: '8', name: 'hero-image.png', type: 'file', size: '284 KB', modified: '1 week ago', status: 'clean', fileType: 'png' },
      { id: '17', name: 'logo.svg', type: 'file', size: '12 KB', modified: '3 days ago', status: 'clean', fileType: 'svg' },
      { id: '18', name: 'icons', type: 'folder', modified: '1 week ago', status: 'clean', children: [
        { id: '19', name: 'folder.svg', type: 'file', size: '2 KB', modified: '1 week ago', status: 'clean', fileType: 'svg' },
        { id: '20', name: 'file.svg', type: 'file', size: '1.8 KB', modified: '1 week ago', status: 'clean', fileType: 'svg' },
      ]},
    ]
  },
  {
    id: '21',
    name: 'styles',
    type: 'folder',
    modified: '2 hours ago',
    status: 'modified',
    children: [
      { id: '22', name: 'globals.css', type: 'file', size: '8.5 KB', modified: '2 hours ago', status: 'modified', fileType: 'css' },
      { id: '23', name: 'components.css', type: 'file', size: '4.2 KB', modified: '1 day ago', status: 'clean', fileType: 'css' },
    ]
  },
  { id: '4', name: 'package.json', type: 'file', size: '2.1 KB', modified: '5 minutes ago', status: 'modified', fileType: 'json' },
  { id: '9', name: 'README.md', type: 'file', size: '1.2 KB', modified: '2 days ago', status: 'clean', fileType: 'md' },
  { id: '24', name: '.gitignore', type: 'file', size: '234 B', modified: '1 week ago', status: 'clean', fileType: 'gitignore' },
  { id: '25', name: 'tsconfig.json', type: 'file', size: '891 B', modified: '1 week ago', status: 'clean', fileType: 'json' },
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
      {
        id: '2',
        name: 'Projects',
        type: 'folder',
        modified: '1 hour ago',
        expanded: true,
        children: [
          { id: '5', name: 'Project1.docx', type: 'file', size: '4.8 KB', modified: '1 hour ago', fileType: 'docx', starred: true },
          { id: '6', name: 'Presentation.pptx', type: 'file', size: '3.2 MB', modified: '2 hours ago', fileType: 'pptx' },
        ]
      },
      { id: '7', name: 'Notes.txt', type: 'file', size: '2.1 KB', modified: '30 minutes ago', fileType: 'txt' },
    ]
  },
  {
    id: '3',
    name: 'Pictures',
    type: 'folder',
    modified: '3 days ago',
    starred: true,
    children: [
      { id: '8', name: 'vacation.jpg', type: 'file', size: '284 KB', modified: '1 week ago', fileType: 'jpg' },
      { id: '10', name: 'screenshot.png', type: 'file', size: '156 KB', modified: '2 days ago', fileType: 'png' },
    ]
  },
  { id: '4', name: 'Downloads', type: 'folder', modified: '5 minutes ago' },
  { id: '9', name: 'Music', type: 'folder', modified: '1 week ago' },
];

export function FileExplorer({ isDark, tabType, section, isWelcomeTab = false, isProfileTab = false, onLocationSelect, onThemeToggle }: FileExplorerProps) {
  const [viewMode, setViewMode] = useState<'tree' | 'grid' | 'list'>('tree');
  const [selectedFile, setSelectedFile] = useState<FileItem | null>(null);
  const [showDetailsPanel, setShowDetailsPanel] = useState(false);
  const [sortBy, setSortBy] = useState<'name' | 'modified' | 'size'>('name');
  const [filterText, setFilterText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);
  const [isCommitDialogOpen, setIsCommitDialogOpen] = useState(false);
  const [detailsPanelWidth, setDetailsPanelWidth] = useState(() => {
    // Responsive initial width based on screen size
    if (typeof window !== 'undefined') {
      const screenWidth = window.innerWidth;
      if (screenWidth < 1024) return 280; // Smaller on mobile/tablet
      if (screenWidth < 1440) return 320; // Default on medium screens
      return 360; // Wider on large screens
    }
    return 320;
  });
  const [isResizing, setIsResizing] = useState(false);

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
  } = useVCS();

  const showVersionControl = tabType === 'repository' && section === 'source';
  const isVCSSection = section === 'source';

  const treeData = showVersionControl ? mockRepositoryTreeData : mockExplorerTreeData;
  const [expandedTreeData, setExpandedTreeData] = useState<TreeNode[]>(treeData);
  const [currentPath, setCurrentPath] = useState<string[]>(
    showVersionControl ? ['Home', 'Repositories', 'nordic-explorer'] : ['Home', 'User', 'Documents']
  );

  // For grid/list navigation - track current folder
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [navigationHistory, setNavigationHistory] = useState<Array<{folderId: string | null, folderName: string}>>([]);

  // Reset state when tab type or section changes
  useEffect(() => {
    const newTreeData = showVersionControl ? mockRepositoryTreeData : mockExplorerTreeData;
    const newPath = showVersionControl ? ['Home', 'Repositories', 'nordic-explorer'] : ['Home', 'User', 'Documents'];
    
    setExpandedTreeData(newTreeData);
    setCurrentPath(newPath);
    setCurrentFolderId(null);
    setNavigationHistory([]);
    setSelectedFile(null);
    setShowDetailsPanel(false);
    setFilterText('');
    setSearchQuery('');
    setShowSearchResults(false);
  }, [tabType, section, showVersionControl]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Escape key to close details panel
      if (e.key === 'Escape' && showDetailsPanel) {
        setShowDetailsPanel(false);
        setSelectedFile(null);
      }
      // Ctrl/Cmd + D to toggle details panel for selected file
      if ((e.ctrlKey || e.metaKey) && e.key === 'd' && selectedFile) {
        e.preventDefault();
        setShowDetailsPanel(!showDetailsPanel);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showDetailsPanel, selectedFile]);

  // Enhanced search results with actions
  const getSearchResults = () => {
    if (!searchQuery) return [];
    
    const allFiles: FileItem[] = [];
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
        } as FileItem & { path: string });
        
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

  const handleFileClick = (file: FileItem) => {
    setSelectedFile(file);
    
    if (viewMode === 'tree') {
      // In tree view, only show details for files, not folders
      if (file.type === 'file') {
        setShowDetailsPanel(true);
      }
    } else {
      // In grid/list view, single click selects, only show details for files
      if (file.type === 'file') {
        setShowDetailsPanel(true);
      }
    }
  };

  const handleFileDoubleClick = (file: FileItem) => {
    if (viewMode !== 'tree' && file.type === 'folder') {
      navigateToFolder(file.id, file.name);
    } else if (file.type === 'file') {
      setSelectedFile(file);
      setShowDetailsPanel(true);
    }
  };

  const navigateToFolder = (folderId: string, folderName: string) => {
    // Add current location to history
    setNavigationHistory(prev => [...prev, { folderId: currentFolderId, folderName: currentPath[currentPath.length - 1] || 'Root' }]);
    
    // Update current folder and path
    setCurrentFolderId(folderId);
    setCurrentPath(prev => [...prev, folderName]);
    
    // Clear current selection
    setSelectedFile(null);
    setShowDetailsPanel(false);
  };

  const navigateBack = () => {
    if (navigationHistory.length > 0) {
      const lastLocation = navigationHistory[navigationHistory.length - 1];
      setNavigationHistory(prev => prev.slice(0, -1));
      setCurrentFolderId(lastLocation.folderId);
      setCurrentPath(prev => prev.slice(0, -1));
      setSelectedFile(null);
      setShowDetailsPanel(false);
    }
  };

  const navigateToBreadcrumb = (index: number) => {
    if (index < currentPath.length - 1) {
      const newPath = currentPath.slice(0, index + 1);
      const stepsBack = currentPath.length - 1 - index;
      
      // Go back the appropriate number of steps
      let newFolderId = currentFolderId;
      let newHistory = [...navigationHistory];
      
      for (let i = 0; i < stepsBack; i++) {
        if (newHistory.length > 0) {
          const lastLocation = newHistory[newHistory.length - 1];
          newFolderId = lastLocation.folderId;
          newHistory = newHistory.slice(0, -1);
        }
      }
      
      setCurrentFolderId(newFolderId);
      setNavigationHistory(newHistory);
      setCurrentPath(newPath);
      setSelectedFile(null);
      setShowDetailsPanel(false);
    }
  };

  const handleContextMenuAction = (action: string, file: FileItem) => {
    console.log(`Action: ${action} on file: ${file.name}`);
    
    switch (action) {
      case 'properties':
        setSelectedFile(file);
        setShowDetailsPanel(true);
        break;
      case 'star':
        // Toggle star status
        const updateStarStatus = (nodes: TreeNode[]): TreeNode[] => {
          return nodes.map(node => {
            if (node.id === file.id) {
              return { ...node, starred: !node.starred };
            }
            if (node.children) {
              return { ...node, children: updateStarStatus(node.children) };
            }
            return node;
          });
        };
        setExpandedTreeData(updateStarStatus(expandedTreeData));
        break;
      case 'delete':
        // In a real app, this would show a confirmation dialog
        console.log('Delete file:', file.name);
        break;
      // VCS Actions
      case 'stage':
        if (showVersionControl && isVCSSection) {
          stageFile(file.id);
        }
        break;
      case 'unstage':
        if (showVersionControl && isVCSSection) {
          unstageFile(file.id);
        }
        break;
      case 'diff':
        if (showVersionControl && isVCSSection) {
          // Find the VCS file and select it for diff viewing
          const vcsFile = [...vcsState.files, ...vcsState.staged].find(f => f.path === file.id);
          if (vcsFile) {
            setSelectedVCSFile(vcsFile);
            setSelectedFile(file);
            setShowDetailsPanel(true);
          }
        }
        break;
      case 'discard':
        if (showVersionControl && isVCSSection) {
          discardChanges(file.id);
        }
        break;
      default:
        // Handle other actions
        break;
    }
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
      case 'source':
        return (
          <div className="flex-1 h-full overflow-hidden">
            <SourcePanel isDark={isDark} />
          </div>
        );

      case 'explorer':
        return (
          <div className="flex-1 h-full overflow-hidden">
            <VCSFileExplorer isDark={isDark} />
          </div>
        );

      case 'branches':
        return (
          <div className="flex-1 h-full overflow-hidden">
            <BranchesPanel isDark={isDark} />
          </div>
        );

      case 'plans':
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

      case 'teams':
        return (
          <TeamsSection isDark={isDark} />
        );

      case 'tags':
        return (
          <TagsSection isDark={isDark} />
        );

      case 'workspace':
        return (
          <div className="flex-1 h-full overflow-hidden">
            <WorkspacePanel isDark={isDark} />
          </div>
        );

      default:
        // Continue to file explorer for other sections
        break;
    }
  }

  const renderTreeNode = (node: TreeNode, depth: number = 0) => (
    <div key={node.id}>
      <FileContextMenu
        file={{
          id: node.id,
          name: node.name,
          type: node.type,
          size: node.size,
          modified: node.modified,
          status: node.status,
          starred: node.starred,
          fileType: node.fileType
        }}
        showVersionControl={showVersionControl && isVCSSection}
        onAction={handleContextMenuAction}
      >
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
              // For folders in tree view, expand/collapse the folder
              toggleTreeNode(node.id);
              // Only select the folder, don't show details panel
              setSelectedFile(fileItem);
            } else {
              // For files, show details panel
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
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={(e) => e.stopPropagation()}
            >
              <MoreHorizontal className="w-3 h-3" />
            </Button>
          </div>
        </div>
      </FileContextMenu>
      
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

    // Find current folder contents for grid/list view
    const findFolderContents = (nodes: TreeNode[], targetId: string): TreeNode[] => {
      for (const node of nodes) {
        if (node.id === targetId && node.children) {
          return node.children;
        }
        if (node.children) {
          const result = findFolderContents(node.children, targetId);
          if (result.length > 0) return result;
        }
      }
      return [];
    };

    const folderContents = findFolderContents(expandedTreeData, currentFolderId);
    return folderContents.map(node => ({
      id: node.id,
      name: node.name,
      type: node.type,
      size: node.size,
      modified: node.modified,
      status: node.status,
      starred: node.starred,
      fileType: node.fileType
    }));
  };

  const renderGridView = () => {
    const files = getCurrentFiles();
    return (
      <div className="grid grid-cols-auto-fit gap-4 p-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(120px, 1fr))' }}>
        {files.map((file) => (
          <FileContextMenu
            key={file.id}
            file={file}
            showVersionControl={showVersionControl && isVCSSection}
            onAction={handleContextMenuAction}
          >
            <div
              className={`flex flex-col items-center p-3 rounded-lg cursor-pointer hover:bg-white/5 transition-colors group ${
                selectedFile?.id === file.id ? `${isDark ? 'bg-white/10' : 'bg-black/10'}` : ''
              }`}
              onClick={() => handleFileClick(file)}
              onDoubleClick={() => handleFileDoubleClick(file)}
            >
              <div className="relative mb-2">
                {getFileIcon(file, false, selectedFile?.id === file.id)}
                {file.starred && (
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 absolute -top-1 -right-1" />
                )}
                {showVersionControl && isVCSSection && file.status && file.status !== 'clean' && (
                  <Badge variant="outline" className={`absolute -bottom-1 -right-1 text-xs h-4 w-4 p-0 ${getStatusColor(file.status)}`}>
                    {file.status.charAt(0).toUpperCase()}
                  </Badge>
                )}
              </div>
              <span className="text-xs text-center line-clamp-2 leading-tight">{file.name}</span>
              {file.size && (
                <span className="text-xs text-muted-foreground">{file.size}</span>
              )}
            </div>
          </FileContextMenu>
        ))}
      </div>
    );
  };

  const renderListView = () => {
    const files = getCurrentFiles();
    return (
      <div className="flex flex-col">
        {/* Header */}
        <div className={`grid grid-cols-[auto_1fr_100px_120px_40px] gap-4 px-4 py-2 border-b ${isDark ? 'border-white/10' : 'border-black/10'} text-xs text-muted-foreground`}>
          <div></div>
          <div>Name</div>
          <div>Size</div>
          <div>Modified</div>
          <div></div>
        </div>
        
        {/* Files */}
        <div className="flex-1 overflow-y-auto">
          {files.map((file) => (
            <FileContextMenu
              key={file.id}
              file={file}
              showVersionControl={showVersionControl && isVCSSection}
              onAction={handleContextMenuAction}
            >
              <div
                className={`grid grid-cols-[auto_1fr_100px_120px_40px] gap-4 px-4 py-2 hover:bg-white/5 cursor-pointer group items-center ${
                  selectedFile?.id === file.id ? `${isDark ? 'bg-white/10' : 'bg-black/10'}` : ''
                }`}
                onClick={() => handleFileClick(file)}
                onDoubleClick={() => handleFileDoubleClick(file)}
              >
                <div className="flex items-center gap-2">
                  {getFileIcon(file, false, selectedFile?.id === file.id)}
                  {file.starred && <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />}
                  {showVersionControl && isVCSSection && file.status && file.status !== 'clean' && (
                    <Badge variant="outline" className={`text-xs h-4 ${getStatusColor(file.status)}`}>
                      {file.status.charAt(0).toUpperCase()}
                    </Badge>
                  )}
                </div>
                <span className="text-sm truncate">{file.name}</span>
                <span className="text-xs text-muted-foreground">{file.size || '—'}</span>
                <span className="text-xs text-muted-foreground">{file.modified}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                  onClick={(e) => e.stopPropagation()}
                >
                  <MoreHorizontal className="w-3 h-3" />
                </Button>
              </div>
            </FileContextMenu>
          ))}
        </div>
      </div>
    );
  };

  // Main render function continues...
  return (
    <div className="flex h-full">
      {/* Main content area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Toolbar */}
        <div className={`h-12 ${isDark ? 'glass-panel-dark' : 'glass-panel-light'} border-b ${isDark ? 'border-white/10' : 'border-black/10'} flex items-center justify-between px-4`}>
          {/* Left: Navigation and breadcrumbs */}
          <div className="flex items-center gap-2 flex-1 min-w-0">
            {/* Back button for grid/list view */}
            {viewMode !== 'tree' && navigationHistory.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0"
                onClick={navigateBack}
              >
                <ArrowLeft className="w-4 h-4" />
              </Button>
            )}
            
            {/* Breadcrumbs */}
            <div className="flex items-center gap-1 min-w-0">
              {currentPath.map((segment, index) => (
                <React.Fragment key={index}>
                  <button
                    className={`text-sm hover:underline truncate ${
                      index === currentPath.length - 1 ? 'font-medium' : 'text-muted-foreground'
                    }`}
                    onClick={() => navigateToBreadcrumb(index)}
                    disabled={index === currentPath.length - 1}
                  >
                    {segment}
                  </button>
                  {index < currentPath.length - 1 && (
                    <ChevronRight className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>

          {/* Center: Search */}
          <div className="flex items-center gap-2 mx-4">
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-muted-foreground" />
              <Input
                placeholder="Search files..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  setShowSearchResults(e.target.value.length > 0);
                }}
                className={`pl-7 pr-3 h-7 w-48 text-xs ${isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}
              />
            </div>
          </div>

          {/* Right: View controls and actions */}
          <div className="flex items-center gap-1">
            {/* Filter */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <Filter className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>All Files</DropdownMenuItem>
                <DropdownMenuItem>Modified</DropdownMenuItem>
                <DropdownMenuItem>Starred</DropdownMenuItem>
                {showVersionControl && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>Changed Files</DropdownMenuItem>
                    <DropdownMenuItem>Staged Files</DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Sort */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                  <SortAsc className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setSortBy('name')}>
                  Name {sortBy === 'name' && '✓'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('modified')}>
                  Modified {sortBy === 'modified' && '✓'}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setSortBy('size')}>
                  Size {sortBy === 'size' && '✓'}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            <Separator orientation="vertical" className="h-4" />

            {/* View mode toggle */}
            <div className={`flex rounded-md p-1 ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
              <Button
                variant={viewMode === 'tree' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setViewMode('tree')}
              >
                <TreePine className="w-3 h-3" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setViewMode('grid')}
              >
                <Grid3X3 className="w-3 h-3" />
              </Button>
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => setViewMode('list')}
              >
                <List className="w-3 h-3" />
              </Button>
            </div>

            {/* Details panel toggle */}
            <Button
              variant={showDetailsPanel ? 'secondary' : 'ghost'}
              size="sm"
              className="h-8 w-8 p-0"
              onClick={() => setShowDetailsPanel(!showDetailsPanel)}
              disabled={!selectedFile}
            >
              <Eye className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* File content area */}
        <div className="flex-1 overflow-hidden">
          {viewMode === 'tree' ? (
            <div className="h-full overflow-y-auto p-2">
              {expandedTreeData.map(node => renderTreeNode(node))}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="h-full overflow-y-auto">
              {renderGridView()}
            </div>
          ) : (
            <div className="h-full overflow-hidden">
              {renderListView()}
            </div>
          )}
        </div>
      </div>

      {/* Details panel */}
      {showDetailsPanel && selectedFile && (
        <Resizable
          size={{ width: detailsPanelWidth, height: '100%' }}
          onResizeStop={(e, direction, ref, d) => {
            setDetailsPanelWidth(detailsPanelWidth + d.width);
            setIsResizing(false);
          }}
          onResizeStart={() => setIsResizing(true)}
          minWidth={240}
          maxWidth={600}
          enable={{
            top: false,
            right: false,
            bottom: false,
            left: true,
            topRight: false,
            bottomRight: false,
            bottomLeft: false,
            topLeft: false,
          }}
          className={`${isResizing ? 'resizing' : ''} resizable-panel`}
          handleClasses={{ left: 'resize-handle-left' }}
        >
          <div className={`h-full border-l ${isDark ? 'border-white/10' : 'border-black/10'}`}>
            <FileDetailsPanel
              file={selectedFile}
              isDark={isDark}
              onClose={() => {
                setShowDetailsPanel(false);
                setSelectedFile(null);
              }}
              showVersionControl={showVersionControl && isVCSSection}
            />
          </div>
        </Resizable>
      )}

      {/* VCS Commit Dialog */}
      {isCommitDialogOpen && showVersionControl && (
        <CommitDialog
          isDark={isDark}
          isOpen={isCommitDialogOpen}
          onClose={() => setIsCommitDialogOpen(false)}
          onCommit={(message) => {
            commit(message);
            setIsCommitDialogOpen(false);
          }}
          stagedFiles={vcsState.staged}
        />
      )}
    </div>
  );
}