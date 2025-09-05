import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  GitBranch,
  GitMerge,
  GitCommit,
  Search,
  Plus,
  MoreHorizontal,
  List,
  Network,
  ArrowUp,
  ArrowDown,
  Clock,
  ChevronRight,
  ChevronDown,
  Star,
  Trash2,
  GitPullRequest,
  Upload,
  Download,
  Eye,
  Filter,
  RefreshCw,
  Edit,
  Copy,
  Check,
  X,
  Code,
  GitCompare,
  ZoomIn,
  ZoomOut,
  RotateCcw,
  Maximize2,
  Move,
  Target,
  GitFork,
  Activity,
  TrendingUp,
  HelpCircle,
  Keyboard,
  Settings,
  Terminal,
  ArrowUpDown,
  EyeOff
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { Tooltip, TooltipContent, TooltipTrigger } from '../ui/tooltip';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from '../ui/dropdown-menu';
import { Avatar, AvatarFallback } from '../ui/avatar';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { ContextMenu } from './ContextMenu';

interface Branch {
  id: string;
  name: string;
  type: 'local' | 'remote' | 'stream';
  current?: boolean;
  upstream?: string;
  ahead?: number;
  behind?: number;
  lastCommit: {
    hash: string;
    message: string;
    author: string;
    date: Date;
  };
  parentStream?: string;
  childStreams?: string[];
  protected?: boolean;
  starred?: boolean;
  color?: string;
}

interface BranchesPanelProps {
  isDark: boolean;
}

// Mock branch/stream data
const mockBranches: Branch[] = [
  {
    id: '1',
    name: 'main',
    type: 'local',
    current: true,
    upstream: 'origin/main',
    ahead: 0,
    behind: 2,
    lastCommit: {
      hash: 'a1b2c3d',
      message: 'Optimizes CSS output',
      author: 'Alice Johnson',
      date: new Date('2024-01-15T14:30:00')
    },
    protected: true,
    starred: true,
    color: '#8B5CF6'
  },
  {
    id: '2',
    name: 'feature/onboard',
    type: 'local',
    current: false,
    upstream: 'origin/feature/onboard',
    ahead: 3,
    behind: 0,
    lastCommit: {
      hash: 'e4f5g6h',
      message: 'Add overflow corrector',
      author: 'Bob Smith',
      date: new Date('2024-01-15T13:15:00')
    },
    parentStream: 'main',
    color: '#EC4899'
  },
  {
    id: '3',
    name: 'feature/graph',
    type: 'stream',
    current: false,
    ahead: 5,
    behind: 1,
    lastCommit: {
      hash: 'i7j8k9l',
      message: 'Fixes stash node icon alignment',
      author: 'Carol Davis',
      date: new Date('2024-01-15T12:45:00')
    },
    parentStream: 'feature/onboard',
    childStreams: ['4', '5'],
    color: '#F59E0B'
  },
  {
    id: '4',
    name: 'bug/error-log',
    type: 'stream',
    current: false,
    ahead: 2,
    behind: 0,
    lastCommit: {
      hash: 'y1z2a3b',
      message: 'Log error instead of throwing',
      author: 'Henry Davis',
      date: new Date('2024-01-15T07:15:00')
    },
    parentStream: 'feature/graph',
    color: '#10B981'
  },
  {
    id: '5',
    name: 'feature/icons',
    type: 'stream',
    current: false,
    ahead: 1,
    behind: 2,
    lastCommit: {
      hash: 'k9l0m1n',
      message: 'Add file-diff icons, bump component version',
      author: 'Jack Brown',
      date: new Date('2024-01-15T05:45:00')
    },
    parentStream: 'feature/graph',
    color: '#06B6D4'
  },
  {
    id: '6',
    name: 'development',
    type: 'local',
    current: false,
    upstream: 'origin/development',
    ahead: 0,
    behind: 5,
    lastCommit: {
      hash: 's5t6u7v',
      message: 'Add type safety to date ordering',
      author: 'Liam White',
      date: new Date('2024-01-15T04:15:00')
    },
    starred: true,
    color: '#8B5CF6'
  }
];

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

const getBranchIcon = (branch: Branch) => {
  if (branch.type === 'stream') return GitMerge;
  if (branch.type === 'remote') return Upload;
  return GitBranch;
};

const getBranchTextColor = (branch: Branch) => {
  if (branch.current) return 'text-green-400';
  if (branch.type === 'remote') return 'text-blue-400';
  if (branch.type === 'stream') return 'text-purple-400';
  return 'text-muted-foreground';
};

export function BranchesPanel({ isDark }: BranchesPanelProps) {
  const [viewMode, setViewMode] = useState<'list' | 'graph'>('graph');
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'all' | 'local' | 'remote' | 'streams'>('all');
  const [expandedStreams, setExpandedStreams] = useState<string[]>(['3']);
  const [branches, setBranches] = useState<Branch[]>(mockBranches);
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [newBranch, setNewBranch] = useState({
    name: '',
    type: 'local' as const,
    baseBranch: 'main'
  });
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [hoveredEdge, setHoveredEdge] = useState<string | null>(null);
  const [graphZoom, setGraphZoom] = useState(1);
  const [graphPan, setGraphPan] = useState({ x: 0, y: 0 });
  const [autoLayout, setAutoLayout] = useState(true);
  const [layoutType, setLayoutType] = useState<'hierarchical' | 'force' | 'radial'>('hierarchical');
  const [showMinimap, setShowMinimap] = useState(false);
  const [animationsEnabled, setAnimationsEnabled] = useState(true);
  const [showHelp, setShowHelp] = useState(false);
  const [isCalculatingLayout, setIsCalculatingLayout] = useState(false);
  const [renderTime, setRenderTime] = useState(0);
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    x: number;
    y: number;
    branch: Branch | null;
  }>({ isOpen: false, x: 0, y: 0, branch: null });
  const svgRef = useRef<SVGSVGElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [draggedNode, setDraggedNode] = useState<string | null>(null);
  const [nodePositions, setNodePositions] = useState<{ [key: string]: { x: number; y: number } }>({});

  const filteredBranches = useMemo(() => {
    let filtered = branches;

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(branch => 
        branch.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        branch.lastCommit.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        branch.lastCommit.author.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    // Filter by type
    if (filterType !== 'all') {
      if (filterType === 'streams') {
        filtered = filtered.filter(branch => branch.type === 'stream');
      } else {
        filtered = filtered.filter(branch => branch.type === filterType);
      }
    }

    return filtered;
  }, [branches, searchQuery, filterType]);

  const toggleStreamExpansion = (streamId: string) => {
    setExpandedStreams(prev => 
      prev.includes(streamId) 
        ? prev.filter(id => id !== streamId)
        : [...prev, streamId]
    );
  };

  const handleCreateBranch = () => {
    if (!newBranch.name.trim()) return;

    const branch: Branch = {
      id: Math.random().toString(36).substr(2, 9),
      name: newBranch.name.trim(),
      type: newBranch.type,
      current: false,
      ahead: 0,
      behind: 0,
      lastCommit: {
        hash: 'new',
        message: 'Initial commit',
        author: 'Current User',
        date: new Date()
      },
      parentStream: newBranch.type === 'stream' ? newBranch.baseBranch : undefined,
      color: '#8B5CF6'
    };

    setBranches(prev => [...prev, branch]);
    setNewBranch({ name: '', type: 'local', baseBranch: 'main' });
    setIsCreateFormOpen(false);
  };

  const handleBranchAction = (action: string, branch: Branch) => {
    console.log(`Action: ${action} on branch: ${branch.name}`);
    
    switch (action) {
      case 'checkout':
        // Switch current branch
        setBranches(prev => prev.map(b => ({
          ...b,
          current: b.id === branch.id
        })));
        break;
      case 'star':
        // Toggle star status
        setBranches(prev => prev.map(b => 
          b.id === branch.id ? { ...b, starred: !b.starred } : b
        ));
        break;
      case 'delete':
        // Delete branch (if not protected)
        if (!branch.protected && !branch.current) {
          setBranches(prev => prev.filter(b => b.id !== branch.id));
        }
        break;
      case 'copy-name':
        // Copy branch name to clipboard
        navigator.clipboard?.writeText(branch.name).then(() => {
          console.log('Branch name copied to clipboard:', branch.name);
        });
        break;
      case 'copy-hash':
        // Copy commit hash to clipboard
        navigator.clipboard?.writeText(branch.lastCommit.hash).then(() => {
          console.log('Commit hash copied to clipboard:', branch.lastCommit.hash);
        });
        break;
      case 'rename':
        // For now, just log - could implement inline editing
        console.log('Rename branch:', branch.name);
        break;
      default:
        // Handle other actions like merge, compare, pull-request, push, pull, view-commits, view-files
        break;
    }
  };

  const handleNodeClick = (nodeId: string) => {
    setSelectedNode(selectedNode === nodeId ? null : nodeId);
    setContextMenu({ isOpen: false, x: 0, y: 0, branch: null });
  };

  const handleNodeRightClick = (e: React.MouseEvent, branch: Branch) => {
    e.preventDefault();
    setContextMenu({
      isOpen: true,
      x: e.clientX,
      y: e.clientY,
      branch
    });
  };

  const closeContextMenu = () => {
    setContextMenu({ isOpen: false, x: 0, y: 0, branch: null });
  };

  const handleNodeMouseEnter = (nodeId: string) => {
    setHoveredNode(nodeId);
  };

  const handleNodeMouseLeave = () => {
    setHoveredNode(null);
  };

  const handleNodeDragStart = (nodeId: string, e: React.MouseEvent) => {
    if (e.button !== 0) return; // Only left mouse button
    setDraggedNode(nodeId);
    setIsDragging(true);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  // Context menu effect for closing
  useEffect(() => {
    const handleClickOutside = () => {
      if (contextMenu.isOpen) {
        closeContextMenu();
      }
    };

    if (contextMenu.isOpen) {
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
  }, [contextMenu.isOpen]);

  const renderBranchItem = (branch: Branch, level: number = 0) => {
    const Icon = getBranchIcon(branch);
    const colorClass = getBranchTextColor(branch);
    const isExpanded = expandedStreams.includes(branch.id);
    const hasChildren = branch.childStreams && branch.childStreams.length > 0;

    return (
      <div key={branch.id} className="select-none">
        <div 
          className={`flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-all duration-200 ${
            isDark ? 'hover:bg-white/5' : 'hover:bg-white/30'
          } group`}
          style={{ paddingLeft: `${12 + level * 20}px` }}
        >
          {/* Expansion Toggle for Streams with Children */}
          {hasChildren && (
            <Button
              variant="ghost"
              size="sm"
              className="h-4 w-4 p-0 opacity-60 hover:opacity-100"
              onClick={(e) => {
                e.stopPropagation();
                toggleStreamExpansion(branch.id);
              }}
            >
              {isExpanded ? (
                <ChevronDown className="w-3 h-3" />
              ) : (
                <ChevronRight className="w-3 h-3" />
              )}
            </Button>
          )}
          {!hasChildren && <div className="w-4" />}

          {/* Branch Icon */}
          <Icon className={`w-4 h-4 ${colorClass}`} />

          {/* Branch Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`truncate ${branch.current ? 'font-medium' : ''}`}>
                {branch.name}
              </span>
              
              {branch.current && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0.5 bg-green-500/20 text-green-400 border-green-400/30">
                  current
                </Badge>
              )}
              
              {branch.protected && (
                <Badge variant="secondary" className="text-xs px-1.5 py-0.5 bg-yellow-500/20 text-yellow-400 border-yellow-400/30">
                  protected
                </Badge>
              )}
              
              {branch.starred && (
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              )}
            </div>
            
            <div className="text-xs text-muted-foreground truncate">
              {branch.lastCommit.message}
            </div>
          </div>

          {/* Remote Tracking & Ahead/Behind */}
          <div className="flex items-center gap-2">
            {branch.upstream && (
              <div className="flex items-center gap-1">
                {branch.ahead! > 0 && (
                  <Badge variant="outline" className="text-xs px-1.5 py-0.5 bg-blue-500/20 text-blue-400 border-blue-400/30">
                    <ArrowUp className="w-2.5 h-2.5 mr-1" />
                    {branch.ahead}
                  </Badge>
                )}
                {branch.behind! > 0 && (
                  <Badge variant="outline" className="text-xs px-1.5 py-0.5 bg-orange-500/20 text-orange-400 border-orange-400/30">
                    <ArrowDown className="w-2.5 h-2.5 mr-1" />
                    {branch.behind}
                  </Badge>
                )}
              </div>
            )}

            {/* Author & Date */}
            <div className="flex items-center gap-2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
              <Avatar className="w-4 h-4">
                <AvatarFallback className="text-xs">
                  {branch.lastCommit.author.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span>{formatDate(branch.lastCommit.date)}</span>
            </div>

            {/* Actions Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="w-3 h-3" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className={`${isDark ? 'glass-card' : 'glass-card-light'} border-none`}>
                {!branch.current && (
                  <>
                    <DropdownMenuItem onClick={() => handleBranchAction('checkout', branch)}>
                      <GitBranch className="w-4 h-4 mr-2" />
                      Switch to branch
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                
                <DropdownMenuItem onClick={() => handleBranchAction('merge', branch)}>
                  <GitMerge className="w-4 h-4 mr-2" />
                  Merge into current
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => handleBranchAction('compare', branch)}>
                  <GitCompare className="w-4 h-4 mr-2" />
                  Compare branches
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => handleBranchAction('pull-request', branch)}>
                  <GitPullRequest className="w-4 h-4 mr-2" />
                  Create pull request
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                {branch.upstream && (
                  <>
                    <DropdownMenuItem onClick={() => handleBranchAction('push', branch)}>
                      <Upload className="w-4 h-4 mr-2" />
                      Push changes
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleBranchAction('pull', branch)}>
                      <Download className="w-4 h-4 mr-2" />
                      Pull changes
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                  </>
                )}
                
                <DropdownMenuItem onClick={() => handleBranchAction('copy-name', branch)}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy branch name
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => handleBranchAction('rename', branch)}>
                  <Edit className="w-4 h-4 mr-2" />
                  Rename branch
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => handleBranchAction('star', branch)}>
                  <Star className="w-4 h-4 mr-2" />
                  {branch.starred ? 'Unstar' : 'Star'} branch
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={() => handleBranchAction('view-commits', branch)}>
                  <Eye className="w-4 h-4 mr-2" />
                  View commits
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => handleBranchAction('view-files', branch)}>
                  <Code className="w-4 h-4 mr-2" />
                  Browse files
                </DropdownMenuItem>
                
                {!branch.protected && !branch.current && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleBranchAction('delete', branch)}
                      className="text-destructive focus:text-destructive"
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Delete branch
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Render Child Streams */}
        {hasChildren && isExpanded && (
          <div className="ml-4 border-l border-white/10">
            {branch.childStreams!.map(childId => {
              const childBranch = branches.find(b => b.id === childId);
              return childBranch ? renderBranchItem(childBranch, level + 1) : null;
            })}
          </div>
        )}
      </div>
    );
  };

  // Simple graph view for demo
  const renderGraphView = () => {
    const svgWidth = 1000;
    const svgHeight = 600;
    
    // Calculate positions for nodes
    const nodeSize = 150; // Larger nodes
    const nodeSpacing = 250; // Increased spacing
    
    const positions = filteredBranches.map((branch, index) => ({
      branch,
      x: 150 + (index % 3) * nodeSpacing,
      y: 100 + Math.floor(index / 3) * nodeSpacing,
      size: nodeSize
    }));

    return (
      <div className="flex-1 relative overflow-hidden" style={{ minHeight: '600px' }}>
        <motion.div
          className="w-full flex-1"
          style={{ minHeight: '500px' }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <svg
            ref={svgRef}
            width="100%"
            height="100%"
            viewBox={`0 0 ${svgWidth} ${svgHeight}`}
            className="w-full h-full"
          >
            {/* Grid pattern */}
            <defs>
              <pattern id="grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path
                  d="M 50 0 L 0 0 0 50"
                  fill="none"
                  stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}
                  strokeWidth="1"
                />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />

            {/* Edges */}
            {positions.map(pos => {
              if (!pos.branch.parentStream) return null;
              
              const parentPos = positions.find(p => p.branch.name === pos.branch.parentStream);
              if (!parentPos) return null;

              return (
                <line
                  key={`edge-${parentPos.branch.id}-${pos.branch.id}`}
                  x1={parentPos.x + parentPos.size / 2}
                  y1={parentPos.y + parentPos.size / 2}
                  x2={pos.x + pos.size / 2}
                  y2={pos.y + pos.size / 2}
                  stroke={isDark ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)"}
                  strokeWidth="2"
                  strokeDasharray="5,5"
                />
              );
            })}

            {/* Nodes */}
            {positions.map(pos => {
              const node = pos;
              const isSelected = selectedNode === node.branch.id;
              const isHovered = hoveredNode === node.branch.id;
              const nodeWidth = node.size * 1.8; // Increased from 1.2
              const nodeHeight = node.size * 1.2; // Increased from 0.8

              return (
                <g key={node.branch.id}>
                  {/* Node background */}
                  <rect
                    x={node.x}
                    y={node.y}
                    width={nodeWidth}
                    height={nodeHeight}
                    rx="12"
                    fill={node.branch.color || '#8B5CF6'}
                    fillOpacity={isSelected ? 0.3 : isHovered ? 0.2 : 0.15}
                    stroke={node.branch.color || '#8B5CF6'}
                    strokeWidth={isSelected ? 3 : isHovered ? 2 : 1}
                    strokeOpacity={isSelected ? 0.8 : isHovered ? 0.6 : 0.4}
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={() => handleNodeMouseEnter(node.branch.id)}
                    onMouseLeave={() => handleNodeMouseLeave()}
                    onClick={() => handleNodeClick(node.branch.id)}
                    onContextMenu={(e) => handleNodeRightClick(e, node.branch)}
                    onMouseDown={(e) => handleNodeDragStart(node.branch.id, e)}
                  />

                  {/* Branch name */}
                  <text
                    x={node.x + nodeWidth / 2}
                    y={node.y + nodeHeight / 2 - 10}
                    textAnchor="middle"
                    className="text-sm font-medium fill-current pointer-events-none"
                    fill={isDark ? "white" : "black"}
                  >
                    {node.branch.name}
                  </text>

                  {/* Branch type */}
                  <text
                    x={node.x + nodeWidth / 2}
                    y={node.y + nodeHeight / 2 + 10}
                    textAnchor="middle"
                    className="text-xs fill-current pointer-events-none"
                    fill={isDark ? "rgba(255,255,255,0.7)" : "rgba(0,0,0,0.7)"}
                  >
                    {node.branch.type}
                  </text>

                  {/* Current branch indicator */}
                  {node.branch.current && (
                    <circle
                      cx={node.x + nodeWidth - 20}
                      cy={node.y + 20}
                      r="8"
                      fill="#10B981"
                      className="pointer-events-none"
                    />
                  )}

                  {/* Starred indicator */}
                  {node.branch.starred && (
                    <polygon
                      points={`${node.x + 20},${node.y + 15} ${node.x + 25},${node.y + 25} ${node.x + 35},${node.y + 25} ${node.x + 28},${node.y + 32} ${node.x + 30},${node.y + 42} ${node.x + 20},${node.y + 37} ${node.x + 10},${node.y + 42} ${node.x + 12},${node.y + 32} ${node.x + 5},${node.y + 25} ${node.x + 15},${node.y + 25}`}
                      fill="#F59E0B"
                      className="pointer-events-none"
                    />
                  )}
                </g>
              );
            })}
          </svg>
        </motion.div>
      </div>
    );
  };

  return (
    <>
      <div className="h-full flex flex-col">
        {/* Controls */}
        <div className="flex items-center justify-between gap-2 p-4 border-b border-white/10">
          <div className="flex items-center gap-2">
            <h2 className="font-medium">Branches & Streams</h2>
            <Badge variant="secondary" className="text-xs bg-blue-500/20 text-blue-400 border-blue-400/30">
              {filteredBranches.length}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 w-3 h-3 text-muted-foreground" />
              <Input
                placeholder="Search branches..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-7 w-48 h-8 text-xs bg-white/5 border-white/10"
              />
            </div>

            {/* Filter */}
            <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
              <SelectTrigger className="w-24 h-8 text-xs bg-white/5 border-white/10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="local">Local</SelectItem>
                <SelectItem value="remote">Remote</SelectItem>
                <SelectItem value="streams">Streams</SelectItem>
              </SelectContent>
            </Select>

            {/* View Mode Toggle */}
            <div className="flex rounded-md border border-white/10 bg-white/5">
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 px-3 rounded-none rounded-l-md ${
                  viewMode === 'list' 
                    ? 'bg-white/10 text-white' 
                    : 'text-muted-foreground hover:text-white'
                }`}
                onClick={() => setViewMode('list')}
              >
                <List className="w-3 h-3" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                className={`h-8 px-3 rounded-none rounded-r-md ${
                  viewMode === 'graph' 
                    ? 'bg-white/10 text-white' 
                    : 'text-muted-foreground hover:text-white'
                }`}
                onClick={() => setViewMode('graph')}
              >
                <Network className="w-3 h-3" />
              </Button>
            </div>

            {/* Create Branch */}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0"
                  onClick={() => setIsCreateFormOpen(!isCreateFormOpen)}
                >
                  <Plus className="w-3 h-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Create new branch</TooltipContent>
            </Tooltip>
          </div>
        </div>

        {/* Create Branch Form */}
        <AnimatePresence>
          {isCreateFormOpen && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="border-b border-white/10 bg-white/5 p-4"
            >
              <div className="flex items-center gap-3">
                <Input
                  placeholder="Branch name"
                  value={newBranch.name}
                  onChange={(e) => setNewBranch(prev => ({ ...prev, name: e.target.value }))}
                  className="flex-1 h-8 text-xs bg-white/5 border-white/10"
                />
                
                <Select
                  value={newBranch.type}
                  onValueChange={(value: any) => setNewBranch(prev => ({ ...prev, type: value }))}
                >
                  <SelectTrigger className="w-24 h-8 text-xs bg-white/5 border-white/10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="local">Local</SelectItem>
                    <SelectItem value="stream">Stream</SelectItem>
                  </SelectContent>
                </Select>

                <Button size="sm" onClick={handleCreateBranch} className="h-8">
                  <Check className="w-3 h-3 mr-1" />
                  Create
                </Button>
                
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCreateFormOpen(false)}
                  className="h-8 w-8 p-0"
                >
                  <X className="w-3 h-3" />
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Content */}
        {viewMode === 'graph' ? renderGraphView() : (
          <div className="flex-1 overflow-auto p-4">
            <div className="space-y-2">
              {filteredBranches.map(branch => {
                if (branch.parentStream && filteredBranches.some(b => b.name === branch.parentStream)) {
                  return null; // Skip child branches, they will be rendered by their parents
                }
                return renderBranchItem(branch);
              })}
            </div>
          </div>
        )}
      </div>

      {/* Context Menu */}
      <ContextMenu
        isOpen={contextMenu.isOpen}
        x={contextMenu.x}
        y={contextMenu.y}
        branch={contextMenu.branch}
        isDark={isDark}
        onClose={closeContextMenu}
        onAction={handleBranchAction}
      />
    </>
  );
}