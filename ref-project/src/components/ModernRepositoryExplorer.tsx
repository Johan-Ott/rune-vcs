// This file has been removed - functionality moved to VCSFileExplorer.tsx

interface RepositoryFile {
  id: string;
  name: string;
  type: 'folder' | 'file';
  size?: string;
  sizeBytes?: number;
  modified: string;
  modifiedDate: Date;
  vcsStatus?: 'M' | 'A' | 'D' | 'L' | '??';
  starred?: boolean;
  fileType?: string;
  path?: string;
  parentId?: string;
  author?: string;
  commitHash?: string;
}

interface ModernRepositoryExplorerProps {
  isDark: boolean;
  tabId: string;
  initialBranch?: string;
  onBranchChange?: (branch: string) => void;
}

// Mock repository file structure
const mockRepositoryFiles: RepositoryFile[] = [
  // Root folders
  { 
    id: 'src', 
    name: 'src', 
    type: 'folder', 
    modified: '2 hours ago', 
    modifiedDate: new Date(Date.now() - 7200000), 
    path: 'src',
    vcsStatus: 'M',
    author: 'john.doe'
  },
  { 
    id: 'public', 
    name: 'public', 
    type: 'folder', 
    modified: '1 week ago', 
    modifiedDate: new Date(Date.now() - 604800000), 
    path: 'public',
    author: 'jane.smith'
  },
  { 
    id: 'docs', 
    name: 'docs', 
    type: 'folder', 
    modified: '3 days ago', 
    modifiedDate: new Date(Date.now() - 259200000), 
    path: 'docs',
    author: 'mike.wilson'
  },
  
  // Root files
  { 
    id: 'package-json', 
    name: 'package.json', 
    type: 'file', 
    size: '2.1 KB', 
    sizeBytes: 2150, 
    modified: '5 minutes ago', 
    modifiedDate: new Date(Date.now() - 300000), 
    fileType: 'json', 
    path: 'package.json',
    vcsStatus: 'M',
    author: 'john.doe',
    commitHash: 'a1b2c3d'
  },
  { 
    id: 'readme-md', 
    name: 'README.md', 
    type: 'file', 
    size: '4.8 KB', 
    sizeBytes: 4915, 
    modified: '2 hours ago', 
    modifiedDate: new Date(Date.now() - 7200000), 
    fileType: 'md', 
    path: 'README.md',
    author: 'jane.smith',
    commitHash: 'b2c3d4e'
  },
  { 
    id: 'gitignore', 
    name: '.gitignore', 
    type: 'file', 
    size: '234 B', 
    sizeBytes: 234, 
    modified: '1 week ago', 
    modifiedDate: new Date(Date.now() - 604800000), 
    fileType: 'gitignore', 
    path: '.gitignore',
    author: 'mike.wilson'
  },
  
  // src folder contents
  { 
    id: 'components', 
    name: 'components', 
    type: 'folder', 
    modified: '1 hour ago', 
    modifiedDate: new Date(Date.now() - 3600000), 
    path: 'src/components',
    parentId: 'src',
    vcsStatus: 'M',
    author: 'john.doe'
  },
  { 
    id: 'hooks', 
    name: 'hooks', 
    type: 'folder', 
    modified: '3 hours ago', 
    modifiedDate: new Date(Date.now() - 10800000), 
    path: 'src/hooks',
    parentId: 'src',
    author: 'jane.smith'
  },
  { 
    id: 'app-tsx', 
    name: 'App.tsx', 
    type: 'file', 
    size: '12.5 KB', 
    sizeBytes: 12800, 
    modified: '1 hour ago', 
    modifiedDate: new Date(Date.now() - 3600000), 
    fileType: 'tsx', 
    path: 'src/App.tsx',
    parentId: 'src',
    vcsStatus: 'M',
    author: 'john.doe',
    commitHash: 'c3d4e5f'
  },
  
  // components folder contents
  { 
    id: 'header-tsx', 
    name: 'Header.tsx', 
    type: 'file', 
    size: '3.2 KB', 
    sizeBytes: 3277, 
    modified: '30 minutes ago', 
    modifiedDate: new Date(Date.now() - 1800000), 
    fileType: 'tsx', 
    path: 'src/components/Header.tsx',
    parentId: 'components',
    vcsStatus: 'A',
    author: 'john.doe',
    commitHash: 'd4e5f6g'
  },
  { 
    id: 'sidebar-tsx', 
    name: 'Sidebar.tsx', 
    type: 'file', 
    size: '8.7 KB', 
    sizeBytes: 8908, 
    modified: '2 hours ago', 
    modifiedDate: new Date(Date.now() - 7200000), 
    fileType: 'tsx', 
    path: 'src/components/Sidebar.tsx',
    parentId: 'components',
    vcsStatus: 'M',
    author: 'jane.smith',
    commitHash: 'e5f6g7h'
  },
  { 
    id: 'temp-file', 
    name: 'temp.log', 
    type: 'file', 
    size: '128 B', 
    sizeBytes: 128, 
    modified: '15 minutes ago', 
    modifiedDate: new Date(Date.now() - 900000), 
    fileType: 'log', 
    path: 'src/components/temp.log',
    parentId: 'components',
    vcsStatus: '??',
    author: 'john.doe'
  },
];

const repositoryQuickAccessItems = [
  { id: 'changes', name: 'Uncommitted Changes', iconName: 'GitCommit', path: 'changes', description: '3 modified files' },
  { id: 'history', name: 'Commit History', iconName: 'History', path: 'history', description: 'Recent commits' },
  { id: 'branches', name: 'All Branches', iconName: 'GitBranch', path: 'branches', description: '4 active branches' },
  { id: 'tags', name: 'Tags', iconName: 'Tag', path: 'tags', description: 'Release tags' },
  { id: 'pulls', name: 'Pull Requests', iconName: 'GitPullRequest', path: 'pulls', description: '2 open' },
  { id: 'compare', name: 'Compare Branches', iconName: 'GitCompare', path: 'compare', description: 'Branch comparison' },
];

const remoteRepositories = [
  { id: 'origin', name: 'origin', url: 'https://github.com/user/nordic-explorer.git', status: 'Up to date' },
  { id: 'upstream', name: 'upstream', url: 'https://github.com/original/nordic-explorer.git', status: '2 commits ahead' },
];

const branches = [
  { id: 'main', name: 'main', isActive: true, ahead: 0, behind: 0 },
  { id: 'develop', name: 'develop', isActive: false, ahead: 3, behind: 1 },
  { id: 'feature/file-explorer', name: 'feature/file-explorer', isActive: false, ahead: 5, behind: 0 },
  { id: 'hotfix/bug-fix', name: 'hotfix/bug-fix', isActive: false, ahead: 1, behind: 2 },
];

const IconComponent: React.FC<{ name: string; className?: string }> = ({ name, className = "w-4 h-4" }) => {
  switch (name) {
    case 'GitCommit': return <GitCommit className={className} />;
    case 'History': return <History className={className} />;
    case 'GitBranch': return <GitBranch className={className} />;
    case 'Tag': return <Tag className={className} />;
    case 'GitPullRequest': return <GitPullRequest className={className} />;
    case 'GitCompare': return <GitCompare className={className} />;
    case 'Users': return <Users className={className} />;
    case 'Settings': return <Settings className={className} />;
    default: return <GitBranch className={className} />;
  }
};

const getFileIcon = (item: RepositoryFile, isHovered = false, isSelected = false) => {
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
    case 'log':
    case 'gitignore':
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

export function ModernRepositoryExplorer({ isDark, tabId, initialBranch = 'main', onBranchChange }: ModernRepositoryExplorerProps) {
  const [viewMode, setViewMode] = useState<'list' | 'grid' | 'column'>('list');
  const [sortBy, setSortBy] = useState<'name' | 'modified' | 'size' | 'type'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  
  // Repository state
  const [currentBranch, setCurrentBranch] = useState(initialBranch);
  const [currentPath, setCurrentPath] = useState('');
  const [pathSegments, setPathSegments] = useState<string[]>([]);
  const [currentFolderId, setCurrentFolderId] = useState<string | null>(null);
  const [navigationHistory, setNavigationHistory] = useState<string[]>(['']);
  const [historyIndex, setHistoryIndex] = useState(0);
  
  // Selection and display state
  const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  
  // Search state
  const [searchQuery, setSearchQuery] = useState('');
  
  // Force re-render state
  const [refreshTrigger, setRefreshTrigger] = useState(0);

  // Get current folder contents
  const getCurrentFiles = () => {
    let files: RepositoryFile[];
    
    if (currentPath === 'changes') {
      // Show uncommitted changes
      files = mockRepositoryFiles.filter(item => item.vcsStatus && item.vcsStatus !== 'clean');
    } else if (currentPath === 'history') {
      // Show recent files sorted by modification date
      files = mockRepositoryFiles
        .filter(item => item.type === 'file')
        .sort((a, b) => b.modifiedDate.getTime() - a.modifiedDate.getTime())
        .slice(0, 20);
    } else if (currentFolderId) {
      // Show contents of current folder
      files = mockRepositoryFiles.filter(item => item.parentId === currentFolderId);
    } else {
      // Show root level files/folders
      files = mockRepositoryFiles.filter(item => !item.parentId);
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
  };

  const navigateBack = () => {
    if (historyIndex > 0) {
      const newIndex = historyIndex - 1;
      const newPath = navigationHistory[newIndex];
      setHistoryIndex(newIndex);
      setCurrentPath(newPath);
      setPathSegments(newPath.split('/').filter(Boolean));
      const segments = newPath.split('/').filter(Boolean);
      const lastSegment = segments[segments.length - 1];
      const folderId = mockRepositoryFiles.find(f => f.name === lastSegment && f.type === 'folder')?.id || null;
      setCurrentFolderId(folderId);
    }
  };

  const navigateForward = () => {
    if (historyIndex < navigationHistory.length - 1) {
      const newIndex = historyIndex + 1;
      const newPath = navigationHistory[newIndex];
      setHistoryIndex(newIndex);
      setCurrentPath(newPath);
      setPathSegments(newPath.split('/').filter(Boolean));
      const segments = newPath.split('/').filter(Boolean);
      const lastSegment = segments[segments.length - 1];
      const folderId = mockRepositoryFiles.find(f => f.name === lastSegment && f.type === 'folder')?.id || null;
      setCurrentFolderId(folderId);
    }
  };

  const navigateUp = () => {
    const segments = pathSegments.slice(0, -1);
    const newPath = segments.length > 0 ? segments.join('/') : '';
    const parentId = segments.length > 0 ? 
      mockRepositoryFiles.find(f => f.name === segments[segments.length - 1] && f.type === 'folder')?.id || null 
      : null;
    navigateTo(newPath, parentId);
  };

  const handleItemDoubleClick = (item: RepositoryFile) => {
    if (item.type === 'folder') {
      const newPath = item.path || `${currentPath}/${item.name}`;
      navigateTo(newPath, item.id);
    } else {
      console.log('Opening file:', item.name);
    }
  };

  const handleItemClick = (item: RepositoryFile, event: React.MouseEvent<HTMLDivElement>) => {
    if (event.ctrlKey || event.metaKey) {
      const newSelection = new Set(selectedItems);
      if (newSelection.has(item.id)) {
        newSelection.delete(item.id);
      } else {
        newSelection.add(item.id);
      }
      setSelectedItems(newSelection);
    } else {
      setSelectedItems(new Set([item.id]));
    }
  };

  const handleBreadcrumbClick = (index: number) => {
    const newSegments = pathSegments.slice(0, index + 1);
    const newPath = newSegments.join('/');
    const folderId = newSegments.length > 0 ? 
      mockRepositoryFiles.find(f => f.name === newSegments[newSegments.length - 1] && f.type === 'folder')?.id || null 
      : null;
    navigateTo(newPath, folderId);
  };

  const handleBranchChange = (newBranch: string) => {
    setCurrentBranch(newBranch);
    if (onBranchChange) {
      onBranchChange(newBranch);
    }
    toast.success(`Switched to branch: ${newBranch}`);
  };

  const currentFiles = getCurrentFiles();
  const canGoBack = historyIndex > 0;
  const canGoForward = historyIndex < navigationHistory.length - 1;
  const canGoUp = pathSegments.length > 0 && currentPath !== 'changes' && currentPath !== 'history';
  const activeBranch = branches.find(b => b.name === currentBranch);

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
          
          {/* Branch Selector */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-3 gap-2">
                <GitBranch className="w-4 h-4" />
                <span className="text-sm">{currentBranch}</span>
                {activeBranch && (activeBranch.ahead > 0 || activeBranch.behind > 0) && (
                  <Badge variant="outline" className="text-xs h-5">
                    {activeBranch.ahead > 0 && `+${activeBranch.ahead}`}
                    {activeBranch.behind > 0 && `-${activeBranch.behind}`}
                  </Badge>
                )}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-64">
              <div className="px-2 py-1.5 text-sm font-medium text-muted-foreground">Switch Branch</div>
              <DropdownMenuSeparator />
              {branches.map((branch) => (
                <DropdownMenuItem
                  key={branch.id}
                  onClick={() => handleBranchChange(branch.name)}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <GitBranch className="w-4 h-4" />
                    <span>{branch.name}</span>
                    {branch.name === currentBranch && (
                      <Badge variant="secondary" className="text-xs">Current</Badge>
                    )}
                  </div>
                  {(branch.ahead > 0 || branch.behind > 0) && (
                    <Badge variant="outline" className="text-xs">
                      {branch.ahead > 0 && `+${branch.ahead}`}
                      {branch.behind > 0 && `-${branch.behind}`}
                    </Badge>
                  )}
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          
          <Separator orientation="vertical" className="h-5 mx-2" />
          
          {/* Breadcrumb Navigation */}
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigateTo('')}
              className="h-7 px-2 text-sm"
            >
              <Home className="w-3 h-3 mr-1" />
              Repository
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
              placeholder="Search repository..."
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
        {/* Repository Sidebar */}
        <div className={`w-80 ${isDark ? 'glass-panel-dark' : 'glass-panel-light'} border-r ${isDark ? 'border-white/10' : 'border-black/10'} flex flex-col`}>
          {/* Repository Header */}
          <div className="p-4 border-b border-white/10">
            <h3 className="font-medium text-foreground mb-1">Repository Tools</h3>
            <p className="text-xs text-muted-foreground">Version control and project navigation</p>
          </div>
          
          {/* Repository Tools */}
          <div className="flex-1 p-4 space-y-1 overflow-y-auto">
            {/* Quick Actions Section */}
            <div className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground px-3 py-2 mb-2">Quick Actions</div>
              {repositoryQuickAccessItems.map((item) => (
                <Button
                  key={item.id}
                  variant={currentPath === item.path ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => navigateTo(item.path)}
                  className={`w-full justify-start h-12 px-3 text-left transition-all hover:scale-[1.02] ${
                    currentPath === item.path ? 'aurora-glow' : ''
                  }`}
                >
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center mr-3 ${
                    item.id === 'changes' ? 'bg-orange-500/20 text-orange-400' :
                    item.id === 'history' ? 'bg-blue-500/20 text-blue-400' :
                    item.id === 'branches' ? 'bg-green-500/20 text-green-400' :
                    item.id === 'tags' ? 'bg-purple-500/20 text-purple-400' :
                    item.id === 'pulls' ? 'bg-pink-500/20 text-pink-400' :
                    'bg-gray-500/20 text-gray-400'
                  }`}>
                    <IconComponent name={item.iconName} className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col items-start flex-1 min-w-0">
                    <span className="text-sm truncate w-full">{item.name}</span>
                    <span className="text-xs text-muted-foreground truncate w-full">{item.description}</span>
                  </div>
                </Button>
              ))}
            </div>
            
            <Separator className="my-4" />
            
            {/* Branches Section */}
            <div className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground px-3 py-2 mb-2">Active Branches</div>
              {branches.slice(0, 3).map((branch) => (
                <Button
                  key={branch.id}
                  variant={branch.name === currentBranch ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => handleBranchChange(branch.name)}
                  className="w-full justify-start h-10 px-3 hover:scale-[1.02] transition-all"
                >
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center mr-3 ${
                    branch.name === currentBranch ? 'bg-green-500/20 text-green-400' : 'bg-gray-500/20 text-gray-400'
                  }`}>
                    <GitBranch className="w-3 h-3" />
                  </div>
                  <div className="flex flex-col items-start flex-1 min-w-0">
                    <span className="text-sm truncate w-full">{branch.name}</span>
                    {(branch.ahead > 0 || branch.behind > 0) && (
                      <span className="text-xs text-muted-foreground">
                        {branch.ahead > 0 && `+${branch.ahead} `}
                        {branch.behind > 0 && `-${branch.behind}`}
                      </span>
                    )}
                  </div>
                </Button>
              ))}
            </div>
            
            <Separator className="my-4" />
            
            {/* Remote Repositories */}
            <div className="space-y-1">
              <div className="text-xs font-medium text-muted-foreground px-3 py-2 mb-2">Remotes</div>
              {remoteRepositories.map((remote) => (
                <Button
                  key={remote.id}
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start h-12 px-3 hover:scale-[1.02] transition-all"
                >
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 text-blue-400 flex items-center justify-center mr-3">
                    <Globe className="w-4 h-4" />
                  </div>
                  <div className="flex flex-col items-start flex-1 min-w-0">
                    <span className="text-sm truncate w-full">{remote.name}</span>
                    <span className="text-xs text-muted-foreground truncate w-full">{remote.status}</span>
                  </div>
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* File Content Area */}
        <div className="flex-1 flex flex-col">
          {/* File List */}
          <div className="flex-1 overflow-auto">
            {currentFiles.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                <Folder className="w-16 h-16 mb-4 opacity-50" />
                <p className="text-lg mb-2">No files found</p>
                <p className="text-sm">Try changing your search criteria or navigating to a different location</p>
              </div>
            ) : viewMode === 'list' ? (
              <div className="p-4">
                {/* List Header */}
                <div className="grid grid-cols-12 gap-4 px-4 py-2 text-xs font-medium text-muted-foreground border-b border-white/10 mb-2">
                  <div className="col-span-5">Name</div>
                  <div className="col-span-2">Size</div>
                  <div className="col-span-2">Modified</div>
                  <div className="col-span-2">Author</div>
                  <div className="col-span-1">Status</div>
                </div>
                
                {/* File Items */}
                <div className="space-y-1">
                  {currentFiles.map((file) => (
                    <FileContextMenu
                      key={file.id}
                      file={{
                        id: file.id,
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        modified: file.modified,
                        starred: file.starred,
                        fileType: file.fileType
                      }}
                      showVersionControl={true}
                      onAction={(action, fileItem) => {
                        console.log('Context action:', action, 'on:', fileItem.name);
                        switch (action) {
                          case 'star':
                            const fileIndex = mockRepositoryFiles.findIndex(f => f.id === file.id);
                            if (fileIndex !== -1) {
                              mockRepositoryFiles[fileIndex].starred = !mockRepositoryFiles[fileIndex].starred;
                              setRefreshTrigger(prev => prev + 1);
                            }
                            break;
                          case 'copy':
                            toast.success(`Copied "${file.name}" to clipboard`);
                            break;
                          default:
                            toast.info(`${action} - feature coming soon`);
                        }
                      }}
                    >
                      <div
                        className={`grid grid-cols-12 gap-4 px-4 py-3 rounded-lg cursor-pointer transition-all hover:bg-white/5 ${
                          selectedItems.has(file.id) ? 'bg-white/10 border border-white/20' : ''
                        }`}
                        onClick={(e) => handleItemClick(file, e)}
                        onDoubleClick={() => handleItemDoubleClick(file)}
                        onMouseEnter={() => setHoveredItem(file.id)}
                        onMouseLeave={() => setHoveredItem(null)}
                      >
                        <div className="col-span-5 flex items-center gap-3 min-w-0">
                          {getFileIcon(file, hoveredItem === file.id, selectedItems.has(file.id))}
                          <span className="text-sm truncate">{file.name}</span>
                          {file.starred && <Star className="w-3 h-3 text-yellow-400 fill-yellow-400 flex-shrink-0" />}
                        </div>
                        <div className="col-span-2 flex items-center">
                          <span className="text-sm text-muted-foreground">{file.size || ''}</span>
                        </div>
                        <div className="col-span-2 flex items-center">
                          <span className="text-sm text-muted-foreground">{file.modified}</span>
                        </div>
                        <div className="col-span-2 flex items-center">
                          <span className="text-sm text-muted-foreground">{file.author || ''}</span>
                        </div>
                        <div className="col-span-1 flex items-center">
                          {file.vcsStatus && <VCSStatusIndicator status={file.vcsStatus} />}
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
                      file={{
                        id: file.id,
                        name: file.name,
                        type: file.type,
                        size: file.size,
                        modified: file.modified,
                        starred: file.starred,
                        fileType: file.fileType
                      }}
                      showVersionControl={true}
                      onAction={(action) => console.log('Grid context action:', action)}
                    >
                      <div
                        className={`flex flex-col items-center p-3 rounded-lg cursor-pointer hover:bg-white/5 transition-colors ${
                          selectedItems.has(file.id) ? 'bg-white/10 border border-white/20' : ''
                        }`}
                        onClick={(e) => handleItemClick(file, e)}
                        onDoubleClick={() => handleItemDoubleClick(file)}
                      >
                        <div className="relative mb-2">
                          {getFileIcon(file, false, selectedItems.has(file.id))}
                          {file.vcsStatus && (
                            <div className="absolute -top-1 -right-1">
                              <VCSStatusIndicator status={file.vcsStatus} />
                            </div>
                          )}
                        </div>
                        <span className="text-xs text-center break-words w-full">{file.name}</span>
                        {file.size && (
                          <span className="text-xs text-muted-foreground mt-1">{file.size}</span>
                        )}
                      </div>
                    </FileContextMenu>
                  ))}
                </div>
              </div>
            ) : (
              <div className="flex-1 flex">
                {/* Column view - simplified for now */}
                <div className="flex-1 p-4">
                  <p className="text-muted-foreground">Column view - coming soon</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}