import React from 'react';
import { 
  ChevronLeft, 
  ChevronRight, 
  Inbox, 
  User, 
  Folder, 
  BarChart3, 
  Users2,
  Download, 
  UserPlus,
  Zap,
  Target,
  Package
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { cn } from './ui/utils';
import { NavigationView } from '../App';

interface SidebarProps {
  collapsed: boolean;
  currentView: NavigationView;
  currentTeam: any;
  teams: any[];
  onToggle: () => void;
  onNavigate: (view: NavigationView) => void;
  onTeamChange: (team: any) => void;
  onTeamCreate: (team: any) => void;
  onTeamUpdate: (team: any) => void;
  onTeamDelete: (teamId: string) => void;
  onImportIssues: () => void;
  onInvitePeople: () => void;
}

export function Sidebar({ collapsed, currentView, currentTeam, teams, onToggle, onNavigate, onTeamChange, onTeamCreate, onTeamUpdate, onTeamDelete, onImportIssues, onInvitePeople }: SidebarProps) {
  const navigationItems = [
    { icon: Inbox, label: 'Inbox', view: 'inbox' as NavigationView },
    { icon: User, label: 'My Issues', view: 'my-issues' as NavigationView },
  ];

  const projectItems = [
    { icon: Folder, label: 'Projects', view: 'projects' as NavigationView },
    { icon: BarChart3, label: 'Views', view: 'views' as NavigationView },
    { icon: Users2, label: 'Teams', view: 'teams' as NavigationView },
  ];

  const trackingItems = [
    { icon: Target, label: 'Goals', view: 'goals' as NavigationView },
    { icon: Package, label: 'Releases', view: 'releases' as NavigationView },
  ];

  const quickActions = [
    { icon: Download, label: 'Import issues', onClick: onImportIssues },
    { icon: UserPlus, label: 'Invite people', onClick: onInvitePeople },
  ];

  return (
    <div className={cn(
      "bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-200",
      collapsed ? "w-12" : "w-64"
    )}>
      {/* Header */}
      <div className="p-3 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-gradient-to-br from-purple-500 to-blue-500 rounded flex items-center justify-center">
              <Zap className="w-3 h-3 text-white" />
            </div>
            <span className="font-medium text-sidebar-foreground">{currentTeam.name}</span>
          </div>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={onToggle}
          className="w-6 h-6 p-0 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent"
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </Button>
      </div>

      <div className="flex-1 px-2">
        {/* Main navigation */}
        <nav className="space-y-1 mb-4">
          {navigationItems.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              onClick={() => onNavigate(item.view)}
              className={cn(
                "w-full justify-start h-8 px-2 text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                currentView === item.view && "bg-sidebar-accent text-sidebar-foreground",
                collapsed && "px-2 justify-center"
              )}
            >
              <item.icon className="w-4 h-4" />
              {!collapsed && <span className="ml-2 text-sm">{item.label}</span>}
            </Button>
          ))}
        </nav>

        <Separator className="bg-sidebar-border mb-4" />

        {/* Projects & Views */}
        <nav className="space-y-1 mb-4">
          {projectItems.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              onClick={() => onNavigate(item.view)}
              className={cn(
                "w-full justify-start h-8 px-2 text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                currentView === item.view && "bg-sidebar-accent text-sidebar-foreground",
                collapsed && "px-2 justify-center"
              )}
            >
              <item.icon className="w-4 h-4" />
              {!collapsed && <span className="ml-2 text-sm">{item.label}</span>}
            </Button>
          ))}
        </nav>

        <Separator className="bg-sidebar-border mb-4" />

        {/* Tracking section */}
        <nav className="space-y-1 mb-4">
          {trackingItems.map((item) => (
            <Button
              key={item.label}
              variant="ghost"
              onClick={() => onNavigate(item.view)}
              className={cn(
                "w-full justify-start h-8 px-2 text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent",
                currentView === item.view && "bg-sidebar-accent text-sidebar-foreground",
                collapsed && "px-2 justify-center"
              )}
            >
              <item.icon className="w-4 h-4" />
              {!collapsed && <span className="ml-2 text-sm">{item.label}</span>}
            </Button>
          ))}
        </nav>


      </div>

      {/* Quick actions */}
      <div className="p-2 border-t border-sidebar-border">
        {quickActions.map((action) => (
          <Button
            key={action.label}
            variant="ghost"
            onClick={action.onClick}
            className={cn(
              "w-full justify-start h-8 px-2 text-sidebar-foreground/60 hover:text-sidebar-foreground hover:bg-sidebar-accent text-xs",
              collapsed && "px-2 justify-center"
            )}
          >
            <action.icon className="w-4 h-4" />
            {!collapsed && <span className="ml-2">{action.label}</span>}
          </Button>
        ))}
      </div>
    </div>
  );
}