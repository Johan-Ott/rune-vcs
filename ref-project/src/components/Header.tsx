import React, { useState } from 'react';
import { 
  ChevronRight, 
  Home, 
  Moon, 
  Sun, 
  Minimize2, 
  Maximize2, 
  X,
  Search,
  Command,
  Plus,
  RefreshCw,
  FolderOpen,
  GitBranch,
  Bell,
  User,
  ChevronDown,
  File,
  Folder,
  FileText,
  FileImage,
  FileCode
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { BranchSelector } from './BranchSelector';

interface Tab {
  id: string;
  label: string;
  type: 'explorer' | 'repository';
  icon: React.ComponentType<any>;
  path?: string;
  isActive?: boolean;
  branch?: string;
}

interface HeaderProps {
  isDark: boolean;
  onThemeToggle: () => void;
  tabs: Tab[];
  activeTabId: string;
  onTabChange: (tabId: string) => void;
  onNewTab: (tabType?: 'explorer' | 'repository' | 'profile') => void;
  onCloseTab: (tabId: string) => void;
  onBranchChange?: (tabId: string, branch: string) => void;
}

const breadcrumbs = [
  { label: 'Home', icon: Home },
  { label: 'Projects' },
  { label: 'nordic-explorer' },
  { label: 'src' },
];

export function Header({ isDark, onThemeToggle, tabs, activeTabId, onTabChange, onNewTab, onCloseTab, onBranchChange }: HeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);

  // Mock search results
  const mockSearchResults = [
    { id: '1', name: 'App.tsx', type: 'file', path: '/src/App.tsx', icon: FileCode },
    { id: '2', name: 'Header.tsx', type: 'file', path: '/src/components/Header.tsx', icon: FileCode },
    { id: '3', name: 'README.md', type: 'file', path: '/README.md', icon: FileText },
    { id: '4', name: 'hero-image.png', type: 'file', path: '/assets/hero-image.png', icon: FileImage },
    { id: '5', name: 'components', type: 'folder', path: '/src/components', icon: Folder },
    { id: '6', name: 'utils.ts', type: 'file', path: '/src/utils.ts', icon: FileCode },
    { id: '7', name: 'styles.css', type: 'file', path: '/src/styles.css', icon: FileText },
  ];

  const filteredResults = mockSearchResults.filter(item => 
    item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    item.path.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Mock branches for repository tabs
  const mockBranches = [
    { name: 'main', current: true, ahead: 2, behind: 1 },
    { name: 'feature/vcs-integration', current: false, ahead: 0, behind: 3 },
    { name: 'feature/plans-system', current: false, ahead: 1, behind: 0 },
    { name: 'hotfix/urgent-fix', current: false, ahead: 0, behind: 0 },
  ];

  return (
    <div className={`h-12 ${isDark ? 'glass-panel-dark' : 'glass-panel-light'} aurora-gradient border-b ${isDark ? 'border-white/10' : 'border-black/10'} flex items-center justify-between px-4`}>
      {/* Left: Tabs - More space for wider tabs */}
      <div className="flex items-center gap-1" style={{ flex: '2 1 0%', minWidth: '0' }}>
        <div className="flex items-center gap-1 overflow-x-auto max-w-full">
          {tabs.map((tab) => (
            <div
              key={tab.id}
              className={`flex items-center gap-2 px-4 py-1.5 rounded-lg cursor-pointer group transition-all duration-200 min-w-0 ${
                tab.id === activeTabId
                  ? `${isDark ? 'bg-white/20 text-white border border-white/30' : 'bg-black/20 text-black border border-black/30'} aurora-glow`
                  : `${isDark ? 'hover:bg-white/10 border border-transparent' : 'hover:bg-black/10 border border-transparent'} text-muted-foreground hover:text-foreground`
              }`}
              style={{ minWidth: '160px', maxWidth: '240px' }}
              onClick={() => onTabChange(tab.id)}
            >
              <tab.icon className="w-4 h-4 flex-shrink-0" />
              <div className="flex items-center gap-2 min-w-0 flex-1">
                <span className="text-sm truncate">{tab.label}</span>
                {tab.type === 'repository' && tab.branch && onBranchChange && (
                  <BranchSelector
                    isDark={isDark}
                    currentBranch={tab.branch}
                    branches={mockBranches.map(b => ({ ...b, current: b.name === tab.branch }))}
                    onBranchChange={(branch) => onBranchChange(tab.id, branch)}
                    compact={true}
                  />
                )}
              </div>
              {tabs.length > 1 && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-4 w-4 p-0 opacity-0 group-hover:opacity-100 hover:bg-red-500/20 flex-shrink-0"
                  onClick={(e) => {
                    e.stopPropagation();
                    onCloseTab(tab.id);
                  }}
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
            </div>
          ))}
          
          {/* Enhanced + Button with dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className={`h-8 w-8 flex items-center justify-center rounded-md transition-all duration-200 hover:scale-105 cursor-pointer ${
                  isDark 
                    ? 'hover:bg-white/15 text-white/80 hover:text-white border border-white/20 hover:border-white/30 hover:shadow-lg bg-white/5' 
                    : 'hover:bg-black/15 text-black/80 hover:text-black border border-black/20 hover:border-black/30 hover:shadow-lg bg-white/5'
                }`}
                title="New Tab"
              >
                <Plus className="w-4 h-4" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className={`${isDark ? 'glass-panel-dark' : 'glass-panel-light'} border ${isDark ? 'border-white/10' : 'border-black/10'}`}>
              <DropdownMenuItem onClick={() => onNewTab('explorer')} className="flex items-center gap-2">
                <FolderOpen className="w-4 h-4" />
                <span>New File Explorer</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onNewTab('repository')} className="flex items-center gap-2">
                <GitBranch className="w-4 h-4" />
                <span>New Repository</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => onNewTab('profile')} className="flex items-center gap-2">
                <User className="w-4 h-4" />
                <span>Profile & Settings</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Right-Center: Search - Moved more to the right */}
      <div className="flex items-center gap-2 relative" style={{ flex: '0 0 auto', width: '320px' }}>
        <div className="relative w-full">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setShowSearchDropdown(e.target.value.length > 0);
            }}
            onFocus={() => setShowSearchDropdown(searchQuery.length > 0)}
            onBlur={() => setTimeout(() => setShowSearchDropdown(false), 150)}
            className={`pl-10 pr-16 h-8 w-full ${isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'} backdrop-blur-sm`}
          />
          <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
            <kbd className={`px-1.5 py-0.5 text-xs ${isDark ? 'bg-white/10 text-white/70' : 'bg-black/10 text-black/70'} rounded border`}>
              <Command className="w-3 h-3" />
            </kbd>
            <kbd className={`px-1.5 py-0.5 text-xs ${isDark ? 'bg-white/10 text-white/70' : 'bg-black/10 text-black/70'} rounded border`}>
              K
            </kbd>
          </div>
          
          {/* Search Dropdown */}
          {showSearchDropdown && filteredResults.length > 0 && (
            <div className={`absolute top-full left-0 right-0 mt-2 ${isDark ? 'glass-panel-dark' : 'glass-panel-light'} border ${isDark ? 'border-white/10' : 'border-black/10'} rounded-lg shadow-lg z-50 max-h-96 overflow-y-auto`}>
              <div className="p-2">
                <div className="text-xs text-muted-foreground mb-2 px-2">
                  {filteredResults.length} result{filteredResults.length !== 1 ? 's' : ''}
                </div>
                {filteredResults.slice(0, 8).map((result) => {
                  const Icon = result.icon;
                  return (
                    <div
                      key={result.id}
                      className={`group flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer ${isDark ? 'hover:bg-white/10' : 'hover:bg-black/10'} transition-colors`}
                      onClick={() => {
                        setSearchQuery('');
                        setShowSearchDropdown(false);
                        // Handle file selection here
                      }}
                    >
                      <Icon className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm truncate">{result.name}</div>
                        <div className="text-xs text-muted-foreground truncate">{result.path}</div>
                      </div>
                      <div className="flex items-center gap-1">
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                            >
                              <ChevronDown className="w-3 h-3" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>Open</DropdownMenuItem>
                            <DropdownMenuItem>Open in New Tab</DropdownMenuItem>
                            <DropdownMenuItem>Copy Path</DropdownMenuItem>
                            <DropdownMenuItem>Reveal in Explorer</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </div>
                  );
                })}
                {filteredResults.length > 8 && (
                  <div className="text-xs text-muted-foreground text-center p-2 border-t border-white/10 mt-2">
                    +{filteredResults.length - 8} more results
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Profile, Notifications, Actions, Window Controls */}
      <div className="flex items-center gap-1" style={{ flex: '1 1 0%', minWidth: '0', justifyContent: 'flex-end' }}>
        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
          <RefreshCw className="w-4 h-4" />
        </Button>
        
        {/* Notifications */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 relative">
              <Bell className="w-4 h-4" />
              <Badge variant="destructive" className="absolute -top-1 -right-1 h-4 w-4 p-0 text-xs">
                3
              </Badge>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className={`${isDark ? 'glass-panel-dark' : 'glass-panel-light'} border ${isDark ? 'border-white/10' : 'border-black/10'} w-80`}>
            <div className="p-3 border-b border-white/10">
              <h4 className="font-medium text-sm">Notifications</h4>
            </div>
            <div className="max-h-64 overflow-y-auto">
              <DropdownMenuItem className="flex items-start gap-3 p-3">
                <GitBranch className="w-4 h-4 mt-0.5 text-blue-400" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">New commit in main</div>
                  <div className="text-xs text-muted-foreground">John pushed 3 commits • 2h ago</div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-start gap-3 p-3">
                <User className="w-4 h-4 mt-0.5 text-green-400" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">Team invitation</div>
                  <div className="text-xs text-muted-foreground">You've been invited to join Core Developers • 4h ago</div>
                </div>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex items-start gap-3 p-3">
                <RefreshCw className="w-4 h-4 mt-0.5 text-yellow-400" />
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium">Sync completed</div>
                  <div className="text-xs text-muted-foreground">All repositories are up to date • 6h ago</div>
                </div>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 gap-2 px-2">
              <Avatar className="w-6 h-6">
                <AvatarImage src="" />
                <AvatarFallback className="text-xs">JD</AvatarFallback>
              </Avatar>
              <ChevronDown className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className={`${isDark ? 'glass-panel-dark' : 'glass-panel-light'} border ${isDark ? 'border-white/10' : 'border-black/10'}`}>
            <div className="p-3 border-b border-white/10">
              <div className="font-medium text-sm">John Doe</div>
              <div className="text-xs text-muted-foreground">john.doe@example.com</div>
            </div>
            <DropdownMenuItem onClick={() => onNewTab('profile')} className="flex items-center gap-2">
              <User className="w-4 h-4" />
              <span>Profile & Settings</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2">
              <Bell className="w-4 h-4" />
              <span>Notifications</span>
            </DropdownMenuItem>
            <DropdownMenuItem className="flex items-center gap-2">
              <RefreshCw className="w-4 h-4" />
              <span>Sync Settings</span>
            </DropdownMenuItem>
            <div className="border-t border-white/10 mt-1">
              <DropdownMenuItem className="flex items-center gap-2 text-red-400">
                <X className="w-4 h-4" />
                <span>Sign Out</span>
              </DropdownMenuItem>
            </div>
          </DropdownMenuContent>
        </DropdownMenu>
        
        <Button
          variant="ghost"
          size="sm"
          className="h-8 w-8 p-0"
          onClick={onThemeToggle}
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>
        
        {/* Window Controls */}
        <div className="flex items-center ml-2">
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-yellow-500/20">
            <Minimize2 className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-green-500/20">
            <Maximize2 className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="sm" className="h-8 w-8 p-0 hover:bg-red-500/20">
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}