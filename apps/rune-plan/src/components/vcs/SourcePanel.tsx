import React, { useState, useMemo } from 'react';
import { 
  GitCommit,
  History,
  FileText,
  Plus,
  Minus,
  CheckSquare,
  Square,
  MessageSquare,
  Search,
  RefreshCw,
  Settings,
  X,
  ChevronRight,
  ChevronDown,
  FolderOpen,
  File,
  MoreHorizontal,
  Eye,
  Copy,
  FileX,
  GitBranch,
  Undo2,
  FileCode
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';

interface SourcePanelProps {
  isDark: boolean;
}

interface Changelist {
  id: string;
  name: string;
  description: string;
  files: ChangedFile[];
  isDefault?: boolean;
  author: string;
  created: Date;
}

interface ChangedFile {
  id: string;
  path: string;
  status: 'added' | 'modified' | 'deleted' | 'renamed';
  staged: boolean;
  hunks: FileHunk[];
}

interface FileHunk {
  id: string;
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  header: string;
  lines: DiffLine[];
  staged: boolean;
}

interface DiffLine {
  type: 'context' | 'added' | 'removed';
  content: string;
  lineNumber?: number;
}

interface Commit {
  id: string;
  hash: string;
  message: string;
  author: string;
  date: Date;
  files: string[];
  parents: string[];
}

// Mock data
const mockChangelists: Changelist[] = [
  {
    id: '1',
    name: 'Default',
    description: 'Current working changes',
    isDefault: true,
    author: 'Current User',
    created: new Date(),
    files: [
      {
        id: '1',
        path: 'src/components/Header.tsx',
        status: 'modified',
        staged: false,
        hunks: [
          {
            id: '1',
            oldStart: 45,
            oldLines: 3,
            newStart: 45,
            newLines: 5,
            header: '@@ -45,3 +45,5 @@ export function Header() {',
            staged: false,
            lines: [
              { type: 'context', content: '  const handleThemeToggle = () => {' },
              { type: 'removed', content: '    setIsDark(!isDark);' },
              { type: 'added', content: '    setIsDark(prev => !prev);' },
              { type: 'added', content: '    // Save theme preference' },
              { type: 'context', content: '  };' },
            ]
          }
        ]
      },
      {
        id: '2',
        path: 'src/styles/globals.css',
        status: 'modified',
        staged: true,
        hunks: [
          {
            id: '2',
            oldStart: 120,
            oldLines: 2,
            newStart: 120,
            newLines: 4,
            header: '@@ -120,2 +120,4 @@ .glass-card {',
            staged: true,
            lines: [
              { type: 'context', content: '.glass-card {' },
              { type: 'added', content: '  backdrop-filter: blur(12px);' },
              { type: 'added', content: '  -webkit-backdrop-filter: blur(12px);' },
              { type: 'context', content: '}' },
            ]
          }
        ]
      }
    ]
  },
  {
    id: '2',
    name: 'Feature: Dark Mode Improvements',
    description: 'Enhanced dark mode with better contrast',
    author: 'Current User',
    created: new Date(Date.now() - 86400000),
    files: [
      {
        id: '3',
        path: 'src/components/Sidebar.tsx',
        status: 'modified',
        staged: false,
        hunks: []
      }
    ]
  }
];

const mockCommits: Commit[] = [
  {
    id: '1',
    hash: 'a1b2c3d4',
    message: 'Fix header theme toggle functionality',
    author: 'Alice Johnson',
    date: new Date(Date.now() - 3600000),
    files: ['src/components/Header.tsx', 'src/hooks/useTheme.ts'],
    parents: ['e5f6g7h8']
  },
  {
    id: '2',
    hash: 'e5f6g7h8',
    message: 'Add glassmorphism effects to cards',
    author: 'Bob Smith',
    date: new Date(Date.now() - 7200000),
    files: ['src/styles/globals.css'],
    parents: ['i9j0k1l2']
  },
  {
    id: '3',
    hash: 'i9j0k1l2',
    message: 'Initial commit: File explorer structure',
    author: 'Carol Davis',
    date: new Date(Date.now() - 86400000),
    files: ['src/App.tsx', 'src/components/FileExplorer.tsx'],
    parents: []
  }
];

export function SourcePanel({ isDark }: SourcePanelProps) {
  const [changelists, setChangelists] = useState<Changelist[]>(mockChangelists);
  const [commits] = useState<Commit[]>(mockCommits);
  const [selectedFile, setSelectedFile] = useState<ChangedFile | null>(null);
  const [selectedCommit, setSelectedCommit] = useState<Commit | null>(null);
  const [commitMessage, setCommitMessage] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState('changes');
  const [expandedChangelists, setExpandedChangelists] = useState<string[]>(['1']);
  const [viewMode, setViewMode] = useState<'tree' | 'list'>('tree');

  const formatDate = (date: Date): string => {
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);
    
    if (diffHours < 1) return 'just now';
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return date.toLocaleDateString();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'added': return <Plus className="w-3 h-3 text-green-500" />;
      case 'modified': return <FileText className="w-3 h-3 text-blue-500" />;
      case 'deleted': return <Minus className="w-3 h-3 text-red-500" />;
      case 'renamed': return <RefreshCw className="w-3 h-3 text-purple-500" />;
      default: return <FileText className="w-3 h-3" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'added': return 'text-green-500';
      case 'modified': return 'text-blue-500';
      case 'deleted': return 'text-red-500';
      case 'renamed': return 'text-purple-500';
      default: return 'text-muted-foreground';
    }
  };

  const toggleChangelist = (changelistId: string) => {
    setExpandedChangelists(prev => 
      prev.includes(changelistId)
        ? prev.filter(id => id !== changelistId)
        : [...prev, changelistId]
    );
  };

  const toggleFileStaging = (changelistId: string, fileId: string) => {
    setChangelists(prev => prev.map(changelist => {
      if (changelist.id === changelistId) {
        return {
          ...changelist,
          files: changelist.files.map(file => 
            file.id === fileId ? { ...file, staged: !file.staged } : file
          )
        };
      }
      return changelist;
    }));
  };

  const stagedFiles = useMemo(() => {
    return changelists.flatMap(cl => cl.files.filter(f => f.staged));
  }, [changelists]);

  const allFiles = useMemo(() => {
    return changelists.flatMap(cl => cl.files);
  }, [changelists]);

  const filteredFiles = useMemo(() => {
    if (!searchQuery) return allFiles;
    return allFiles.filter(file => 
      file.path.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allFiles, searchQuery]);

  const filteredCommits = useMemo(() => {
    if (!searchQuery) return commits;
    return commits.filter(commit => 
      commit.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
      commit.author.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [commits, searchQuery]);

  const handleStageAll = () => {
    changelists.forEach(changelist => {
      changelist.files.forEach(file => {
        if (!file.staged) {
          toggleFileStaging(changelist.id, file.id);
        }
      });
    });
  };

  const handleUnstageAll = () => {
    changelists.forEach(changelist => {
      changelist.files.forEach(file => {
        if (file.staged) {
          toggleFileStaging(changelist.id, file.id);
        }
      });
    });
  };

  const renderFileItem = (file: ChangedFile, changelist: Changelist) => {
    return (
      <div 
        key={file.id}
        className={`group flex items-center gap-2 p-2 ml-6 rounded cursor-pointer transition-colors ${
          selectedFile?.id === file.id 
            ? 'bg-accent' 
            : 'hover:bg-accent/50'
        }`}
        onClick={() => setSelectedFile(file)}
      >
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="h-5 w-5 p-0 flex-shrink-0"
              onClick={(e) => {
                e.stopPropagation();
                toggleFileStaging(changelist.id, file.id);
              }}
            >
              {file.staged ? (
                <CheckSquare className="w-3 h-3 text-green-500" />
              ) : (
                <Square className="w-3 h-3 text-muted-foreground" />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {file.staged ? 'Unstage file' : 'Stage file'}
          </TooltipContent>
        </Tooltip>
        
        <File className="w-3 h-3 text-muted-foreground flex-shrink-0" />
        
        <div className="flex-1 min-w-0">
          <div className="text-sm truncate">{file.path.split('/').pop()}</div>
          <div className="text-xs text-muted-foreground truncate">{file.path}</div>
        </div>
        
        <div className="flex items-center gap-1">
          {getStatusIcon(file.status)}
          
          {/* Context Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="w-3 h-3" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuItem onClick={() => setSelectedFile(file)}>
                <Eye className="w-4 h-4 mr-2" />
                View Changes
              </DropdownMenuItem>
              <DropdownMenuItem>
                <FileCode className="w-4 h-4 mr-2" />
                Open File
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem 
                onClick={(e) => {
                  e.preventDefault();
                  toggleFileStaging(changelist.id, file.id);
                }}
              >
                {file.staged ? (
                  <>
                    <Minus className="w-4 h-4 mr-2" />
                    Unstage Changes
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Stage Changes
                  </>
                )}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Copy className="w-4 h-4 mr-2" />
                Copy Path
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                <Undo2 className="w-4 h-4 mr-2" />
                Discard Changes
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    );
  };

  const renderChangelistTree = () => (
    <div className="space-y-1">
      {changelists.map(changelist => {
        const isExpanded = expandedChangelists.includes(changelist.id);
        const filteredFiles = changelist.files.filter(file =>
          !searchQuery || file.path.toLowerCase().includes(searchQuery.toLowerCase())
        );
        
        if (viewMode === 'list') {
          return filteredFiles.map(file => renderFileItem(file, changelist));
        }
        
        return (
          <div key={changelist.id}>
            <div 
              className={`group flex items-center gap-2 p-2 rounded cursor-pointer transition-colors hover:bg-accent/50`}
              onClick={() => toggleChangelist(changelist.id)}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-muted-foreground" />
              ) : (
                <ChevronRight className="w-4 h-4 text-muted-foreground" />
              )}
              
              <FolderOpen className="w-4 h-4 text-muted-foreground" />
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm truncate">{changelist.name}</span>
                  {changelist.isDefault && (
                    <Badge variant="secondary" className="text-xs px-1.5 py-0.5">
                      default
                    </Badge>
                  )}
                </div>
                <div className="text-xs text-muted-foreground">
                  {filteredFiles.length} file{filteredFiles.length !== 1 ? 's' : ''}
                  {filteredFiles.filter(f => f.staged).length > 0 && (
                    <span className="text-green-600 dark:text-green-400">
                      {' '}• {filteredFiles.filter(f => f.staged).length} staged
                    </span>
                  )}
                </div>
              </div>
              
              <div className="flex items-center gap-1">
                <div className="text-xs text-muted-foreground">
                  {formatDate(changelist.created)}
                </div>
                
                {!changelist.isDefault && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <MoreHorizontal className="w-3 h-3" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-48">
                      <DropdownMenuItem>
                        <Eye className="w-4 h-4 mr-2" />
                        View Description
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Settings className="w-4 h-4 mr-2" />
                        Edit Changelist
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem>
                        <Plus className="w-4 h-4 mr-2" />
                        Stage All Files
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <Minus className="w-4 h-4 mr-2" />
                        Unstage All Files
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-destructive">
                        <FileX className="w-4 h-4 mr-2" />
                        Delete Changelist
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                )}
              </div>
            </div>

            {isExpanded && (
              <div className="space-y-1">
                {filteredFiles.map(file => renderFileItem(file, changelist))}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );

  const renderCommitForm = () => (
    <div className="space-y-6">
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <label className="font-medium">Commit Message</label>
          <div className="text-xs text-muted-foreground">
            {commitMessage.length}/50 recommended for summary
          </div>
        </div>
        <Textarea
          value={commitMessage}
          onChange={(e) => setCommitMessage(e.target.value)}
          placeholder="Brief summary of changes (use imperative mood)&#10;&#10;Optional detailed description of what and why..."
          className="min-h-[120px] resize-none font-mono text-sm"
        />
        {commitMessage.length > 72 && (
          <div className="text-xs text-amber-600 dark:text-amber-400">
            Consider keeping the first line under 72 characters for better readability
          </div>
        )}
      </div>
      
      {stagedFiles.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="font-medium">Staged Files ({stagedFiles.length})</div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleUnstageAll}
                className="h-7 text-xs"
              >
                <Minus className="w-3 h-3 mr-1" />
                Unstage All
              </Button>
            </div>
          </div>
          <div className="space-y-1 max-h-48 overflow-y-auto border rounded-md p-2 bg-muted/20">
            {stagedFiles.map(file => (
              <div key={file.id} className="flex items-center gap-2 p-1 rounded hover:bg-muted/50">
                {getStatusIcon(file.status)}
                <span className="text-sm font-mono flex-1 truncate">{file.path}</span>
                <Badge variant="outline" className="text-xs px-1">
                  {file.status}
                </Badge>
              </div>
            ))}
          </div>
        </div>
      )}
      
      <div className="space-y-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Settings className="w-4 h-4" />
          <span>Commit Options</span>
        </div>
        
        <div className="space-y-2 pl-6 border-l-2 border-muted">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" className="rounded border-border" />
            <span>Amend previous commit</span>
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" className="rounded border-border" />
            <span>Skip pre-commit hooks</span>
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" className="rounded border-border" defaultChecked />
            <span>Auto-push after commit</span>
          </label>
        </div>
      </div>
      
      <div className="flex gap-2">
        <Button 
          className="flex-1" 
          disabled={!commitMessage.trim() || stagedFiles.length === 0}
        >
          <GitCommit className="w-4 h-4 mr-2" />
          Commit {stagedFiles.length} File{stagedFiles.length !== 1 ? 's' : ''}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="px-3">
              <ChevronDown className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <GitCommit className="w-4 h-4 mr-2" />
              Commit & Push
            </DropdownMenuItem>
            <DropdownMenuItem>
              <GitCommit className="w-4 h-4 mr-2" />
              Commit & Create PR
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setCommitMessage('')}>
              <X className="w-4 h-4 mr-2" />
              Clear Message
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 p-4 border-b border-border">
        <div className="flex items-center gap-2">
          <History className="w-4 h-4 text-muted-foreground" />
          <span>Source</span>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="sm">
            <RefreshCw className="w-4 h-4" />
          </Button>
          <Button variant="ghost" size="sm">
            <Settings className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Status Bar */}
      <div className="flex items-center justify-between p-3 border-b border-border bg-muted/30">
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder={activeTab === 'history' ? "Search commits..." : "Search files..."}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 h-8 w-64"
            />
          </div>
          
          {activeTab === 'changes' && (
            <div className="flex items-center gap-2">
              <Button 
                variant={viewMode === 'tree' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('tree')}
                className="h-8"
              >
                Tree
              </Button>
              <Button 
                variant={viewMode === 'list' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-8"
              >
                List
              </Button>
            </div>
          )}
          
          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {allFiles.length} files
            </Badge>
            {stagedFiles.length > 0 && (
              <Badge className="bg-green-500/20 text-green-700 dark:text-green-400 hover:bg-green-500/20">
                {stagedFiles.length} staged
              </Badge>
            )}
          </div>
        </div>

        {activeTab === 'changes' && (
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleStageAll}
              disabled={allFiles.length === 0 || allFiles.every(f => f.staged)}
            >
              <Plus className="w-4 h-4 mr-1" />
              Stage All
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={handleUnstageAll}
              disabled={stagedFiles.length === 0}
            >
              <Minus className="w-4 h-4 mr-1" />
              Unstage All
            </Button>
          </div>
        )}
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-hidden">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="h-full flex flex-col">
          <div className="border-b border-border">
            <TabsList className="h-12 grid w-full grid-cols-3 bg-transparent p-1">
              <TabsTrigger value="changes" className="data-[state=active]:bg-background">
                Changes ({allFiles.length})
              </TabsTrigger>
              <TabsTrigger value="commit" className="data-[state=active]:bg-background">
                Commit
              </TabsTrigger>
              <TabsTrigger value="history" className="data-[state=active]:bg-background">
                History
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="changes" className="h-full p-4 overflow-y-auto">
              {allFiles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <GitCommit className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <h3 className="font-medium mb-1">No changes</h3>
                  <p className="text-sm">Make some changes to your files to see them here</p>
                </div>
              ) : (
                renderChangelistTree()
              )}
            </TabsContent>

            <TabsContent value="commit" className="h-full p-4">
              {stagedFiles.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-50" />
                  <h3 className="font-medium mb-1">No files staged</h3>
                  <p className="text-sm">Stage some files from the Changes tab to create a commit</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setActiveTab('changes')}
                  >
                    Go to Changes
                  </Button>
                </div>
              ) : (
                renderCommitForm()
              )}
            </TabsContent>

            <TabsContent value="history" className="h-full p-4 overflow-y-auto">
              <div className="space-y-3">
                {filteredCommits.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    {searchQuery ? 'No commits match your search' : 'No commit history available'}
                  </div>
                ) : (
                  filteredCommits.map(commit => (
                    <div 
                      key={commit.id}
                      className={`group p-3 rounded-lg cursor-pointer transition-colors border ${
                        selectedCommit?.id === commit.id
                          ? 'bg-accent border-border' 
                          : 'hover:bg-accent/50 border-transparent'
                      }`}
                      onClick={() => setSelectedCommit(commit)}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <code 
                                className="text-xs font-mono bg-muted px-1.5 py-0.5 rounded cursor-pointer hover:bg-muted/80"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  navigator.clipboard.writeText(commit.hash);
                                }}
                              >
                                {commit.hash}
                              </code>
                            </TooltipTrigger>
                            <TooltipContent>
                              Click to copy hash
                            </TooltipContent>
                          </Tooltip>
                          <Avatar className="w-5 h-5">
                            <AvatarFallback className="text-xs">
                              {commit.author.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-xs text-muted-foreground">{commit.author}</span>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          <span className="text-xs text-muted-foreground">
                            {formatDate(commit.date)}
                          </span>
                          
                          {/* Commit Context Menu */}
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-5 w-5 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <MoreHorizontal className="w-3 h-3" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-52">
                              <DropdownMenuItem>
                                <Eye className="w-4 h-4 mr-2" />
                                View Commit Details
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <GitBranch className="w-4 h-4 mr-2" />
                                Create Branch from Here
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <Copy className="w-4 h-4 mr-2" />
                                Copy Commit Hash
                              </DropdownMenuItem>
                              <DropdownMenuItem>
                                <Copy className="w-4 h-4 mr-2" />
                                Copy Commit Message
                              </DropdownMenuItem>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem>
                                <GitCommit className="w-4 h-4 mr-2" />
                                Cherry-pick
                              </DropdownMenuItem>
                              <DropdownMenuItem className="text-destructive">
                                <Undo2 className="w-4 h-4 mr-2" />
                                Revert Commit
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </div>
                      
                      <div className="mb-2 pr-8">{commit.message}</div>
                      
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <FileText className="w-3 h-3" />
                          <span>{commit.files.length} file{commit.files.length !== 1 ? 's' : ''}</span>
                          {commit.parents.length > 0 && (
                            <>
                              <span>•</span>
                              <span>Parent: {commit.parents[0].substring(0, 7)}</span>
                            </>
                          )}
                        </div>
                        
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <GitBranch className="w-3 h-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              Create branch
                            </TooltipContent>
                          </Tooltip>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                                <Copy className="w-3 h-3" />
                              </Button>
                            </TooltipTrigger>
                            <TooltipContent>
                              Copy hash
                            </TooltipContent>
                          </Tooltip>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </TabsContent>
          </div>
        </Tabs>
      </div>

      {/* File Details Overlay */}
      {selectedFile && (
        <div className="absolute inset-0 bg-background/95 backdrop-blur-sm flex flex-col">
          <div className="flex items-center justify-between p-4 border-b border-border">
            <div className="flex items-center gap-2">
              {getStatusIcon(selectedFile.status)}
              <span>{selectedFile.path}</span>
              <Badge variant="secondary">
                {selectedFile.status}
              </Badge>
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedFile(null)}
            >
              <X className="w-4 h-4" />
            </Button>
          </div>

          <div className="flex-1 p-4 overflow-y-auto">
            <div className="space-y-3">
              {selectedFile.hunks.map(hunk => (
                <div key={hunk.id} className="border border-border rounded-lg p-3">
                  <div className="flex items-center justify-between mb-2">
                    <code className="text-xs font-mono text-muted-foreground">
                      {hunk.header}
                    </code>
                  </div>
                  
                  <div className="font-mono text-sm space-y-0">
                    {hunk.lines.map((line, lineIndex) => {
                      let bgColor = '';
                      let textColor = '';
                      let prefix = ' ';
                      
                      if (line.type === 'added') {
                        bgColor = 'bg-green-500/10';
                        textColor = 'text-green-600 dark:text-green-400';
                        prefix = '+';
                      } else if (line.type === 'removed') {
                        bgColor = 'bg-red-500/10';
                        textColor = 'text-red-600 dark:text-red-400';
                        prefix = '-';
                      }
                      
                      return (
                        <div key={lineIndex} className={`flex ${bgColor}`}>
                          <span className={`w-8 text-center text-xs text-muted-foreground ${textColor}`}>
                            {prefix}
                          </span>
                          <span className={`flex-1 px-2 ${textColor}`}>
                            {line.content}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}