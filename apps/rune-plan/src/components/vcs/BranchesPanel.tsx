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
  EyeOff,
  MousePointer2,
  Hand,
  Square,
  Circle,
  Diamond,
  Triangle,
  Shield,
  Info
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

// Enhanced color palette with nordic glassmorphism feel
const naturalColors = [
  '#6B8E65', // Forest Green
  '#5A7A8A', // Steel Blue  
  '#7A6B8E', // Purple
  '#8E6B6B', // Burgundy
  '#8E8E5A', // Olive
  '#5A8E8E', // Teal
  '#8E7A5A', // Tan
  '#8B7355', // Brown
  '#6B6B8E', // Slate
  '#8E6B7A', // Mauve
];

// Mock branch/stream data with better hierarchy
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
    color: naturalColors[0]
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
    color: naturalColors[1]
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
    color: naturalColors[2]
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
    color: naturalColors[3]
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
    color: naturalColors[4]
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
    color: naturalColors[5]
  },
  {
    id: '7',
    name: 'feature/ui-update',
    type: 'remote',
    current: false,
    upstream: 'origin/feature/ui-update',
    ahead: 0,
    behind: 3,
    lastCommit: {
      hash: 'p9q0r1s',
      message: 'Update button styles',
      author: 'Sarah Wilson',
      date: new Date('2024-01-14T16:20:00')
    },
    parentStream: 'main',
    color: naturalColors[6]
  },
  {
    id: '8',
    name: 'hotfix/critical',
    type: 'local',
    current: false,
    ahead: 1,
    behind: 0,
    lastCommit: {
      hash: 't2u3v4w',
      message: 'Critical security fix',
      author: 'Mike Johnson',
      date: new Date('2024-01-14T09:45:00')
    },
    parentStream: 'main',
    protected: true,
    color: naturalColors[7]
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
  
  // Enhanced Graph State
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [hoveredNode, setHoveredNode] = useState<string | null>(null);
  const [graphZoom, setGraphZoom] = useState(0.8);
  const [graphPan, setGraphPan] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [panStart, setPanStart] = useState({ x: 0, y: 0 });
  const [showLegend, setShowLegend] = useState(true);
  const [isMouseDownOnEmpty, setIsMouseDownOnEmpty] = useState(false);
  const [contextMenu, setContextMenu] = useState<{
    isOpen: boolean;
    x: number;
    y: number;
    branch: Branch | null;
  }>({ isOpen: false, x: 0, y: 0, branch: null });
  
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

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

  // Enhanced zoom and pan handlers
  const handleWheel = useCallback((e: WheelEvent) => {
    if (e.ctrlKey || e.metaKey) {
      e.preventDefault();
      const delta = e.deltaY * -0.01;
      const newZoom = Math.min(Math.max(0.25, graphZoom + delta), 3);
      setGraphZoom(newZoom);
    } else {
      // Pan with mouse wheel
      const deltaX = e.deltaX * -1;
      const deltaY = e.deltaY * -1;
      setGraphPan(prev => ({
        x: prev.x + deltaX / graphZoom,
        y: prev.y + deltaY / graphZoom
      }));
    }
  }, [graphZoom]);

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.button === 1 || (e.button === 0 && e.altKey)) { // Middle mouse or Alt+Left
      e.preventDefault();
      setIsPanning(true);
      setPanStart({ x: e.clientX - graphPan.x, y: e.clientY - graphPan.y });
    } else if (e.button === 0) { // Left mouse button in empty space
      const target = e.target as HTMLElement;
      // Check if we clicked on the SVG background (not on a node)
      if (target.tagName === 'svg' || target.tagName === 'rect' && target.getAttribute('width') === '100%') {
        e.preventDefault();
        setIsMouseDownOnEmpty(true);
        setPanStart({ x: e.clientX - graphPan.x, y: e.clientY - graphPan.y });
      }
    }
  }, [graphPan]);

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (isPanning || isMouseDownOnEmpty) {
      setGraphPan({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y
      });
      
      // If we started with empty space click, promote to full panning
      if (isMouseDownOnEmpty && !isPanning) {
        setIsPanning(true);
        setIsMouseDownOnEmpty(false);
      }
    }
  }, [isPanning, isMouseDownOnEmpty, panStart]);

  const handleMouseUp = useCallback(() => {
    setIsPanning(false);
    setIsMouseDownOnEmpty(false);
  }, []);

  // Enhanced keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (viewMode !== 'graph') return;
      
      switch (e.key) {
        case '0':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setGraphZoom(1);
            setGraphPan({ x: 0, y: 0 });
          }
          break;
        case '=':
        case '+':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setGraphZoom(prev => Math.min(prev * 1.2, 3));
          }
          break;
        case '-':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setGraphZoom(prev => Math.max(prev / 1.2, 0.25));
          }
          break;
        case 'l':
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            setShowLegend(!showLegend);
          }
          break;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [viewMode, showLegend]);

  // Mouse event listeners
  useEffect(() => {
    if (isPanning || isMouseDownOnEmpty) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isPanning, isMouseDownOnEmpty, handleMouseMove, handleMouseUp]);

  // Wheel event listener
  useEffect(() => {
    const container = containerRef.current;
    if (container && viewMode === 'graph') {
      container.addEventListener('wheel', handleWheel, { passive: false });
      return () => container.removeEventListener('wheel', handleWheel);
    }
  }, [handleWheel, viewMode]);

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
      color: naturalColors[Math.floor(Math.random() * naturalColors.length)]
    };

    setBranches(prev => [...prev, branch]);
    setNewBranch({ name: '', type: 'local', baseBranch: 'main' });
    setIsCreateFormOpen(false);
  };

  const handleBranchAction = (action: string, branch: Branch) => {
    console.log(`Action: ${action} on branch: ${branch.name}`);
    
    switch (action) {
      case 'checkout':
        setBranches(prev => prev.map(b => ({
          ...b,
          current: b.id === branch.id
        })));
        break;
      case 'star':
        setBranches(prev => prev.map(b => 
          b.id === branch.id ? { ...b, starred: !b.starred } : b
        ));
        break;
      case 'delete':
        if (!branch.protected && !branch.current) {
          setBranches(prev => prev.filter(b => b.id !== branch.id));
        }
        break;
      case 'copy-name':
        navigator.clipboard?.writeText(branch.name).then(() => {
          console.log('Branch name copied to clipboard:', branch.name);
        });
        break;
      default:
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

  // Context menu effect
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

  // Enhanced layout algorithm for better node positioning
  const calculateNodePositions = (branches: Branch[]) => {
    const positions = new Map<string, { x: number; y: number; level: number }>();
    const visited = new Set<string>();
    const nodeWidth = 140;
    const nodeHeight = 80;
    const levelHeight = 150;
    const nodeSpacing = 180;

    // Find root nodes (no parents)
    const rootNodes = branches.filter(b => !b.parentStream);
    
    // Level-based positioning
    const positionNode = (branch: Branch, level: number, indexAtLevel: number) => {
      if (visited.has(branch.id)) return;
      visited.add(branch.id);
      
      const x = 80 + indexAtLevel * nodeSpacing;
      const y = 80 + level * levelHeight;
      
      positions.set(branch.id, { x, y, level });
      
      // Position children
      const children = branches.filter(b => b.parentStream === branch.name);
      children.forEach((child, childIndex) => {
        positionNode(child, level + 1, indexAtLevel * 2 + childIndex);
      });
    };

    // Start with root nodes
    rootNodes.forEach((root, index) => {
      positionNode(root, 0, index);
    });

    // Handle orphaned nodes
    branches.forEach((branch, index) => {
      if (!positions.has(branch.id)) {
        positions.set(branch.id, {
          x: 80 + (index % 6) * nodeSpacing,
          y: 80 + Math.floor(index / 6) * levelHeight,
          level: 0
        });
      }
    });

    return Array.from(positions.entries()).map(([id, pos]) => ({
      branch: branches.find(b => b.id === id)!,
      ...pos,
      size: nodeWidth
    }));
  };

  // Enhanced arrow rendering
  const renderArrow = (x1: number, y1: number, x2: number, y2: number, color: string, isHovered: boolean = false) => {
    const dx = x2 - x1;
    const dy = y2 - y1;
    const length = Math.sqrt(dx * dx + dy * dy);
    const angle = Math.atan2(dy, dx);
    
    // Control points for curved arrow
    const midX = x1 + dx * 0.5;
    const midY = y1 + dy * 0.5;
    const curve = length * 0.2;
    const perpX = -Math.sin(angle) * curve;
    const perpY = Math.cos(angle) * curve;
    
    const pathData = `M ${x1} ${y1} Q ${midX + perpX} ${midY + perpY} ${x2} ${y2}`;
    
    // Arrow head
    const arrowSize = isHovered ? 8 : 6;
    const arrowAngle = angle - Math.PI;
    const arrowX1 = x2 + Math.cos(arrowAngle - 0.5) * arrowSize;
    const arrowY1 = y2 + Math.sin(arrowAngle - 0.5) * arrowSize;
    const arrowX2 = x2 + Math.cos(arrowAngle + 0.5) * arrowSize;
    const arrowY2 = y2 + Math.sin(arrowAngle + 0.5) * arrowSize;

    return (
      <g>
        <path
          d={pathData}
          stroke={color}
          strokeWidth={isHovered ? 3 : 2}
          strokeOpacity={isHovered ? 0.8 : 0.6}
          fill="none"
          className="transition-all duration-200"
        />
        <polygon
          points={`${x2},${y2} ${arrowX1},${arrowY1} ${arrowX2},${arrowY2}`}
          fill={color}
          fillOpacity={isHovered ? 0.9 : 0.7}
          className="transition-all duration-200"
        />
      </g>
    );
  };

  // Enhanced legend component
  const renderLegend = () => (
    <AnimatePresence>
      {showLegend && (
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          className={`absolute top-4 left-4 z-10 ${isDark ? 'glass-card' : 'glass-card-light'} p-4 min-w-[200px]`}
        >
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-medium">Legend</h3>
            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0"
              onClick={() => setShowLegend(false)}
            >
              <X className="w-3 h-3" />
            </Button>
          </div>
          
          <div className="space-y-3">
            {/* Node Types */}
            <div>
              <h4 className="text-xs text-muted-foreground mb-2">Branch Types</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <GitBranch className="w-3 h-3 text-green-400" />
                  <span>Local Branch</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Upload className="w-3 h-3 text-blue-400" />
                  <span>Remote Branch</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <GitMerge className="w-3 h-3 text-purple-400" />
                  <span>Stream</span>
                </div>
              </div>
            </div>
            
            {/* Indicators */}
            <div>
              <h4 className="text-xs text-muted-foreground mb-2">Indicators</h4>
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-xs">
                  <Circle className="w-3 h-3 fill-green-400 text-green-400" />
                  <span>Current Branch</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                  <span>Starred</span>
                </div>
                <div className="flex items-center gap-2 text-xs">
                  <Shield className="w-3 h-3 text-yellow-500" />
                  <span>Protected</span>
                </div>
              </div>
            </div>
            
            {/* Controls */}
            <div>
              <h4 className="text-xs text-muted-foreground mb-2">Controls</h4>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div>Click & Drag: Pan view</div>
                <div>Scroll: Pan view</div>
                <div>Ctrl+Scroll: Zoom</div>
                <div>Alt+Click: Pan mode</div>
                <div>Ctrl+0: Reset view</div>
                <div>Ctrl+L: Toggle legend</div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

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

          <Icon className={`w-4 h-4 ${colorClass}`} />

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

            <div className="flex items-center gap-2 text-xs text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity">
              <Avatar className="w-4 h-4">
                <AvatarFallback className="text-xs">
                  {branch.lastCommit.author.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span>{formatDate(branch.lastCommit.date)}</span>
            </div>

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
                
                <DropdownMenuItem onClick={() => handleBranchAction('copy-name', branch)}>
                  <Copy className="w-4 h-4 mr-2" />
                  Copy branch name
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => handleBranchAction('star', branch)}>
                  <Star className="w-4 h-4 mr-2" />
                  {branch.starred ? 'Unstar' : 'Star'} branch
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

  // Enhanced graph view with better positioning and styling
  const renderGraphView = () => {
    const positions = calculateNodePositions(filteredBranches);
    const svgWidth = Math.max(1200, positions.length > 0 ? Math.max(...positions.map(p => p.x)) + 200 : 1200);
    const svgHeight = Math.max(800, positions.length > 0 ? Math.max(...positions.map(p => p.y)) + 150 : 800);

    return (
      <div 
        ref={containerRef}
        className="flex-1 relative overflow-hidden"
        style={{ minHeight: '600px' }}
        onMouseDown={handleMouseDown}
      >
        {renderLegend()}
        
        {/* Graph Controls */}
        <div className="absolute top-4 right-4 z-10 flex gap-2">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowLegend(!showLegend)}
                className={`${isDark ? 'glass-card' : 'glass-card-light'} border-none`}
              >
                <Info className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle Legend (Ctrl+L)</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setGraphZoom(prev => Math.max(prev / 1.2, 0.25))}
                className={`${isDark ? 'glass-card' : 'glass-card-light'} border-none`}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom Out</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  setGraphZoom(1);
                  setGraphPan({ x: 0, y: 0 });
                }}
                className={`${isDark ? 'glass-card' : 'glass-card-light'} border-none`}
              >
                <Target className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Reset View (Ctrl+0)</TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setGraphZoom(prev => Math.min(prev * 1.2, 3))}
                className={`${isDark ? 'glass-card' : 'glass-card-light'} border-none`}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Zoom In</TooltipContent>
          </Tooltip>
        </div>

        {/* Zoom level indicator */}
        <div className="absolute bottom-4 right-4 z-10">
          <div className={`${isDark ? 'glass-card' : 'glass-card-light'} px-2 py-1 text-xs`}>
            {Math.round(graphZoom * 100)}%
          </div>
        </div>

        <motion.div
          className="w-full h-full"
          style={{ 
            cursor: isPanning || isMouseDownOnEmpty ? 'grabbing' : 'grab',
            transform: `translate(${graphPan.x}px, ${graphPan.y}px) scale(${graphZoom})`
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          <svg
            ref={svgRef}
            width={svgWidth}
            height={svgHeight}
            className="w-full h-full"
          >
            {/* Enhanced grid pattern */}
            <defs>
              <pattern id="enhanced-grid" width="50" height="50" patternUnits="userSpaceOnUse">
                <path
                  d="M 50 0 L 0 0 0 50"
                  fill="none"
                  stroke={isDark ? "rgba(255,255,255,0.03)" : "rgba(0,0,0,0.03)"}
                  strokeWidth="1"
                />
                <path
                  d="M 25 0 L 25 50 M 0 25 L 50 25"
                  fill="none"
                  stroke={isDark ? "rgba(255,255,255,0.01)" : "rgba(0,0,0,0.01)"}
                  strokeWidth="0.5"
                />
              </pattern>
              
              {/* Enhanced arrow marker */}
              <marker
                id="arrowhead"
                markerWidth="10"
                markerHeight="7"
                refX="9"
                refY="3.5"
                orient="auto"
              >
                <polygon
                  points="0 0, 10 3.5, 0 7"
                  fill={isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)"}
                />
              </marker>
            </defs>
            
            <rect width="100%" height="100%" fill="url(#enhanced-grid)" />

            {/* Enhanced connection lines */}
            {positions.map(pos => {
              if (!pos.branch.parentStream) return null;
              
              const parentPos = positions.find(p => p.branch.name === pos.branch.parentStream);
              if (!parentPos) return null;

              const isHovered = hoveredNode === pos.branch.id || hoveredNode === parentPos.branch.id;
              
              return renderArrow(
                parentPos.x + parentPos.size / 2,
                parentPos.y + 50,
                pos.x + pos.size / 2,
                pos.y,
                pos.branch.color || naturalColors[0],
                isHovered
              );
            })}

            {/* Enhanced branch nodes */}
            {positions.map(pos => {
              const node = pos;
              const isSelected = selectedNode === node.branch.id;
              const isHovered = hoveredNode === node.branch.id;
              const nodeWidth = node.size;
              const nodeHeight = 60;

              return (
                <g key={node.branch.id}>
                  {/* Node shadow */}
                  <rect
                    x={node.x + 2}
                    y={node.y + 2}
                    width={nodeWidth}
                    height={nodeHeight}
                    rx="8"
                    fill="rgba(0,0,0,0.1)"
                    className="pointer-events-none"
                  />
                  
                  {/* Node background */}
                  <rect
                    x={node.x}
                    y={node.y}
                    width={nodeWidth}
                    height={nodeHeight}
                    rx="8"
                    fill={node.branch.color || naturalColors[0]}
                    fillOpacity={isSelected ? 0.25 : isHovered ? 0.2 : 0.15}
                    stroke={node.branch.color || naturalColors[0]}
                    strokeWidth={isSelected ? 3 : isHovered ? 2 : 1}
                    strokeOpacity={isSelected ? 0.9 : isHovered ? 0.7 : 0.5}
                    className="cursor-pointer transition-all duration-200"
                    onMouseEnter={() => handleNodeMouseEnter(node.branch.id)}
                    onMouseLeave={() => handleNodeMouseLeave()}
                    onClick={() => handleNodeClick(node.branch.id)}
                    onContextMenu={(e) => handleNodeRightClick(e, node.branch)}
                  />

                  {/* Top-left info panel */}
                  <g className="pointer-events-none">
                    {/* Branch type indicator */}
                    <rect
                      x={node.x + 4}
                      y={node.y + 4}
                      width={16}
                      height={12}
                      rx="2"
                      fill={isDark ? "rgba(0,0,0,0.3)" : "rgba(255,255,255,0.5)"}
                    />
                    <text
                      x={node.x + 12}
                      y={node.y + 13}
                      textAnchor="middle"
                      className="text-xs font-medium"
                      fill={isDark ? "white" : "black"}
                    >
                      {node.branch.type === 'stream' ? 'S' : node.branch.type === 'remote' ? 'R' : 'L'}
                    </text>
                    
                    {/* Change count */}
                    {(node.branch.ahead || 0) > 0 && (
                      <>
                        <rect
                          x={node.x + 22}
                          y={node.y + 4}
                          width={20}
                          height={12}
                          rx="6"
                          fill="rgba(59, 130, 246, 0.2)"
                        />
                        <text
                          x={node.x + 32}
                          y={node.y + 13}
                          textAnchor="middle"
                          className="text-xs"
                          fill="#3b82f6"
                        >
                          +{node.branch.ahead}
                        </text>
                      </>
                    )}
                  </g>

                  {/* Branch name */}
                  <text
                    x={node.x + nodeWidth / 2}
                    y={node.y + nodeHeight / 2 + 2}
                    textAnchor="middle"
                    className="text-sm font-medium pointer-events-none"
                    fill={isDark ? "white" : "black"}
                  >
                    {node.branch.name.length > 16 
                      ? node.branch.name.substring(0, 16) + '...' 
                      : node.branch.name}
                  </text>

                  {/* Bottom info */}
                  <text
                    x={node.x + nodeWidth / 2}
                    y={node.y + nodeHeight - 8}
                    textAnchor="middle"
                    className="text-xs pointer-events-none"
                    fill={isDark ? "rgba(255,255,255,0.6)" : "rgba(0,0,0,0.6)"}
                  >
                    {node.branch.lastCommit.author.split(' ')[0]} • {formatDate(node.branch.lastCommit.date)}
                  </text>

                  {/* Status indicators */}
                  {node.branch.current && (
                    <circle
                      cx={node.x + nodeWidth - 8}
                      cy={node.y + 8}
                      r="4"
                      fill="#10B981"
                      className="pointer-events-none"
                    />
                  )}

                  {node.branch.starred && (
                    <polygon
                      points={`${node.x + nodeWidth - 20},${node.y + 4} ${node.x + nodeWidth - 18},${node.y + 8} ${node.x + nodeWidth - 14},${node.y + 8} ${node.x + nodeWidth - 16},${node.y + 10} ${node.x + nodeWidth - 15},${node.y + 14} ${node.x + nodeWidth - 18},${node.y + 12} ${node.x + nodeWidth - 21},${node.y + 14} ${node.x + nodeWidth - 20},${node.y + 10} ${node.x + nodeWidth - 22},${node.y + 8} ${node.x + nodeWidth - 18},${node.y + 8}`}
                      fill="#F59E0B"
                      className="pointer-events-none"
                    />
                  )}

                  {node.branch.protected && (
                    <rect
                      x={node.x + nodeWidth - 32}
                      y={node.y + 4}
                      width="10"
                      height="8"
                      rx="1"
                      fill="none"
                      stroke="#F59E0B"
                      strokeWidth="1"
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
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className={`px-6 py-4 border-b ${isDark ? 'border-white/10' : 'border-black/10'}`}>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-xl font-semibold">Branches & Streams</h1>
            <p className="text-sm text-muted-foreground">
              {filteredBranches.length} branch{filteredBranches.length !== 1 ? 'es' : ''} in repository
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 p-1 rounded-lg bg-muted/30">
              <Button
                variant={viewMode === 'list' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('list')}
                className="h-7 px-2"
              >
                <List className="w-4 h-4 mr-1" />
                List
              </Button>
              <Button
                variant={viewMode === 'graph' ? 'secondary' : 'ghost'}
                size="sm"
                onClick={() => setViewMode('graph')}
                className="h-7 px-2"
              >
                <Network className="w-4 h-4 mr-1" />
                Graph
              </Button>
            </div>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setIsCreateFormOpen(true)}
              className={`${isDark ? 'glass-panel-dark backdrop-blur-md hover:bg-white/15' : 'glass-panel-light backdrop-blur-md hover:bg-white/70'} border-white/20`}
            >
              <Plus className="w-4 h-4 mr-2" />
              New Branch
            </Button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-3 mt-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search branches..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-muted/30 border-0"
            />
          </div>
          
          <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
            <SelectTrigger className="w-[140px] bg-muted/30 border-0">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All branches</SelectItem>
              <SelectItem value="local">Local only</SelectItem>
              <SelectItem value="remote">Remote only</SelectItem>
              <SelectItem value="streams">Streams only</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'list' ? (
          <div className="h-full overflow-y-auto px-6 py-4">
            {filteredBranches.map(branch => renderBranchItem(branch))}
          </div>
        ) : (
          renderGraphView()
        )}
      </div>

      {/* Create Branch Dialog */}
      <AnimatePresence>
        {isCreateFormOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setIsCreateFormOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className={`${isDark ? 'glass-card' : 'glass-card-light'} p-6 w-full max-w-md`}
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold">Create New Branch</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsCreateFormOpen(false)}
                  className="h-6 w-6 p-0"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <Label htmlFor="branch-name" className="text-sm font-medium">
                    Branch name
                  </Label>
                  <Input
                    id="branch-name"
                    value={newBranch.name}
                    onChange={(e) => setNewBranch(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="feature/new-feature"
                    className="mt-1"
                  />
                </div>
                
                <div>
                  <Label htmlFor="branch-type" className="text-sm font-medium">
                    Type
                  </Label>
                  <Select 
                    value={newBranch.type} 
                    onValueChange={(value: any) => setNewBranch(prev => ({ ...prev, type: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="local">Local Branch</SelectItem>
                      <SelectItem value="stream">Stream</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div>
                  <Label htmlFor="base-branch" className="text-sm font-medium">
                    Base branch
                  </Label>
                  <Select 
                    value={newBranch.baseBranch} 
                    onValueChange={(value) => setNewBranch(prev => ({ ...prev, baseBranch: value }))}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {branches.map(branch => (
                        <SelectItem key={branch.id} value={branch.name}>
                          {branch.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex gap-2 pt-4">
                  <Button onClick={handleCreateBranch} className="flex-1">
                    <GitBranch className="w-4 h-4 mr-2" />
                    Create Branch
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={() => setIsCreateFormOpen(false)}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Context Menu */}
      {contextMenu.isOpen && contextMenu.branch && (
        <ContextMenu
          x={contextMenu.x}
          y={contextMenu.y}
          branch={contextMenu.branch}
          onAction={handleBranchAction}
          onClose={closeContextMenu}
          isDark={isDark}
        />
      )}
    </div>
  );
}