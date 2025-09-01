import React, { useState } from 'react';
import { 
  FolderOpen, 
  GitBranch, 
  Settings,
  HardDrive,
  Cloud,
  Tag,
  Users,
  Filter,
  ChevronRight,
  ChevronDown,
  File,
  Folder,
  Star,
  Clock,
  Target,
  Calendar,
  FileText,
  Archive,
  User,
  Palette,
  Monitor,
  Bell,
  Shield,
  Database,
  Keyboard,
  Briefcase,
  GitCommit,
  Upload,
  Download,
  RefreshCw,
  Zap,
  Search
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { Input } from './ui/input';
import { Tooltip, TooltipContent, TooltipTrigger } from './ui/tooltip';
import { useVCS } from '../contexts/VCSContext';
import { toast } from 'sonner@2.0.3';

interface SidebarProps {
  isDark: boolean;
  activeTabType: 'explorer' | 'repository';
  activeSection: string;
  onSectionChange: (section: string) => void;
  isProfileTab?: boolean;
}

// File Explorer Mode Navigation
const explorerItems = [
  { id: 'quick-access', label: 'Quick Access', icon: Star, items: ['Desktop', 'Documents', 'Downloads', 'Pictures'] },
  { id: 'this-pc', label: 'This PC', icon: HardDrive, items: ['Local Disk (C:)', 'Data (D:)', 'USB Drive'] },
  { id: 'cloud', label: 'Cloud Storage', icon: Cloud, items: ['OneDrive', 'Google Drive', 'Dropbox'] },
  { id: 'recent', label: 'Recent Files', icon: Clock, items: [] },
];

// Repository Mode Navigation  
const repositoryItems = [
  { id: 'source', label: 'Source', icon: GitCommit, badge: '5' },
  { id: 'explorer', label: 'File Explorer', icon: FolderOpen, badge: '24' },
  { id: 'branches', label: 'Branches/Streams', icon: GitBranch, badge: '7' },
  { id: 'workspace', label: 'Workspace', icon: Briefcase, badge: '15' },
];

// Rune VCS Commands
const vcsCommands = [
  { id: 'push', label: 'Push', icon: Upload, tooltip: 'Push changes to remote' },
  { id: 'pull', label: 'Pull', icon: Download, tooltip: 'Pull changes from remote' },
  { id: 'fetch', label: 'Fetch', icon: RefreshCw, tooltip: 'Fetch remote changes' },
  { id: 'sync', label: 'Sync', icon: Zap, tooltip: 'Sync with remote repository' },
  { id: 'analyze', label: 'Analyze', icon: Search, tooltip: 'Analyze repository changes' },
];

// Profile Mode Navigation
const profileItems = [
  { id: 'profile', label: 'Profile', icon: User },
  { id: 'appearance', label: 'Appearance', icon: Palette },
  { id: 'editor', label: 'Editor', icon: Monitor },
  { id: 'notifications', label: 'Notifications', icon: Bell },
  { id: 'security', label: 'Security & Privacy', icon: Shield },
  { id: 'storage', label: 'Storage', icon: Database },
  { id: 'shortcuts', label: 'Keyboard Shortcuts', icon: Keyboard },
  { id: 'advanced', label: 'Advanced', icon: Settings }
];

export function Sidebar({ isDark, activeTabType, activeSection, onSectionChange, isProfileTab = false }: SidebarProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['quick-access', 'this-pc']);
  const { pushChanges, pullChanges, fetchChanges, state } = useVCS();

  const toggleSection = (sectionId: string) => {
    setExpandedSections(prev => 
      prev.includes(sectionId) 
        ? prev.filter(id => id !== sectionId)
        : [...prev, sectionId]
    );
  };

  const handleSectionClick = (sectionId: string) => {
    onSectionChange(sectionId);
  };

  const handleVCSCommand = async (command: string) => {
    if (!state.currentRepository) {
      toast.error('No repository selected');
      return;
    }

    try {
      let result;
      
      switch (command) {
        case 'push':
          toast.loading('Pushing changes...', { id: 'vcs-push' });
          result = await pushChanges();
          toast.dismiss('vcs-push');
          break;
        case 'pull':
          toast.loading('Pulling changes...', { id: 'vcs-pull' });
          result = await pullChanges();
          toast.dismiss('vcs-pull');
          break;
        case 'fetch':
          toast.loading('Fetching changes...', { id: 'vcs-fetch' });
          result = await fetchChanges();
          toast.dismiss('vcs-fetch');
          break;
        case 'sync':
          toast.loading('Syncing repository...', { id: 'vcs-sync' });
          // Sync is a combination of fetch and pull
          await fetchChanges();
          result = await pullChanges();
          toast.dismiss('vcs-sync');
          break;
        case 'analyze':
          toast.loading('Analyzing repository...', { id: 'vcs-analyze' });
          // Show repository analysis
          const modifiedCount = state.files.filter(f => f.status === 'modified').length;
          const stagedCount = state.files.filter(f => f.status === 'staged').length;
          const untrackedCount = state.files.filter(f => f.status === 'untracked').length;
          
          toast.dismiss('vcs-analyze');
          toast.success(`Analysis: ${modifiedCount} modified, ${stagedCount} staged, ${untrackedCount} untracked files`, {
            duration: 5000
          });
          return;
        default:
          return;
      }

      if (result?.success) {
        toast.success(result.message || `${command} completed successfully`);
      } else {
        toast.error(result?.message || `${command} failed`);
      }
    } catch (error) {
      toast.error(`Failed to execute ${command}`);
    }
  };

  // Profile Mode - Settings sections only
  if (isProfileTab) {
    return (
      <div className={`sidebar w-16 h-full ${isDark ? 'glass-panel-dark' : 'glass-panel-light'} flex flex-col border-r ${isDark ? 'border-white/10' : 'border-black/10'}`}>
        {/* Profile Settings Navigation - Icon Only */}
        <div className="flex-1 flex flex-col items-center py-4 gap-3">
          {profileItems.slice(0, 4).map((item) => (
            <Tooltip key={item.id}>
              <TooltipTrigger asChild>
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`w-12 h-12 ${
                      activeSection === item.id 
                        ? `${isDark ? 'bg-white/10 text-white' : 'bg-black/10 text-black'}` 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    onClick={() => handleSectionClick(item.id)}
                  >
                    <item.icon className="w-5 h-5" />
                  </Button>
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{item.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>
      </div>
    );
  }

  if (activeTabType === 'explorer') {
    return (
      <div className={`sidebar w-16 h-full ${isDark ? 'glass-panel-dark' : 'glass-panel-light'} flex flex-col border-r ${isDark ? 'border-white/10' : 'border-black/10'}`}>
        {/* File Explorer Mode - Icon Only */}
        <div className="flex-1 flex flex-col items-center py-4 gap-3">
          {explorerItems.map((section) => (
            <Tooltip key={section.id}>
              <TooltipTrigger asChild>
                <div className="relative">
                  <Button
                    variant="ghost"
                    size="icon"
                    className={`w-12 h-12 ${
                      activeSection === section.id 
                        ? `${isDark ? 'bg-white/10 text-white' : 'bg-black/10 text-black'}` 
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                    onClick={() => handleSectionClick(section.id)}
                  >
                    <section.icon className="w-5 h-5" />
                  </Button>
                  {section.badge && (
                    <Badge variant="secondary" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                      {section.badge}
                    </Badge>
                  )}
                </div>
              </TooltipTrigger>
              <TooltipContent side="right">
                <p>{section.label}</p>
              </TooltipContent>
            </Tooltip>
          ))}
        </div>

        {/* Settings at bottom */}
        <div className="p-2 border-t border-white/10">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="w-12 h-12 text-muted-foreground hover:text-foreground"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Settings</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </div>
    );
  }

  // Repository Mode - Icon Only
  return (
    <div className={`sidebar w-16 h-full ${isDark ? 'glass-panel-dark' : 'glass-panel-light'} flex flex-col border-r ${isDark ? 'border-white/10' : 'border-black/10'}`}>
      {/* Repository Navigation - Icon Only */}
      <div className="flex-1 flex flex-col items-center py-4 gap-3">
        {repositoryItems.map((item) => (
          <Tooltip key={item.id}>
            <TooltipTrigger asChild>
              <div className="relative">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`w-12 h-12 ${
                    activeSection === item.id 
                      ? `${isDark ? 'bg-white/10 text-white' : 'bg-black/10 text-black'}` 
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                  onClick={() => handleSectionClick(item.id)}
                >
                  <item.icon className="w-5 h-5" />
                </Button>
                {item.badge && (
                  <Badge variant="secondary" className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                    {item.badge}
                  </Badge>
                )}
              </div>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>{item.label}</p>
            </TooltipContent>
          </Tooltip>
        ))}
        
        {/* VCS Commands Section */}
        {state.currentRepository && (
          <>
            <div className="w-8 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent my-3" />
            {vcsCommands.map((command, index) => (
              <Tooltip key={command.id}>
                <TooltipTrigger asChild>
                  <div className="relative group">
                    <Button
                      variant="ghost"
                      size="icon"
                      className={`w-12 h-12 text-muted-foreground transition-all duration-300 ease-out relative overflow-hidden ${
                        state.isOperationInProgress 
                          ? 'opacity-50 cursor-not-allowed' 
                          : 'hover:text-foreground hover:scale-105 hover:bg-white/5'
                      }`}
                      style={{ 
                        animationDelay: `${index * 100}ms`,
                        transform: 'translateY(0px)'
                      }}
                      onClick={() => handleVCSCommand(command.id)}
                      disabled={state.isOperationInProgress}
                    >
                      {/* Glassmorphism hover effect */}
                      <div className="absolute inset-0 bg-gradient-to-br from-white/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg" />
                      
                      {/* Aurora glow effect on hover */}
                      <div className={`absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-all duration-500 ${
                        command.id === 'push' ? 'bg-gradient-to-br from-green-400/20 to-transparent shadow-lg shadow-green-400/10' :
                        command.id === 'pull' ? 'bg-gradient-to-br from-blue-400/20 to-transparent shadow-lg shadow-blue-400/10' :
                        command.id === 'fetch' ? 'bg-gradient-to-br from-purple-400/20 to-transparent shadow-lg shadow-purple-400/10' :
                        command.id === 'sync' ? 'bg-gradient-to-br from-yellow-400/20 to-transparent shadow-lg shadow-yellow-400/10' :
                        'bg-gradient-to-br from-cyan-400/20 to-transparent shadow-lg shadow-cyan-400/10'
                      }`} />
                      
                      <command.icon className={`w-5 h-5 relative z-10 transition-transform duration-300 ${
                        state.isOperationInProgress && (command.id === 'sync' || command.id === 'fetch') 
                          ? 'animate-spin' 
                          : 'group-hover:scale-110'
                      }`} />
                    </Button>
                    
                    {/* Activity indicator for VCS operations */}
                    {state.isOperationInProgress && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-br from-purple-400 to-pink-400 rounded-full animate-pulse" />
                    )}
                  </div>
                </TooltipTrigger>
                <TooltipContent side="right" className="bg-black/80 backdrop-blur-md border-white/20">
                  <p className="text-white">{command.tooltip}</p>
                  <p className="text-xs text-gray-300 mt-1">Rune VCS</p>
                </TooltipContent>
              </Tooltip>
            ))}
          </>
        )}
      </div>

      {/* Settings at bottom */}
      <div className="p-2 border-t border-white/10">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="w-12 h-12 text-muted-foreground hover:text-foreground"
            >
              <Settings className="w-5 h-5" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Settings</p>
          </TooltipContent>
        </Tooltip>
      </div>
    </div>
  );
}