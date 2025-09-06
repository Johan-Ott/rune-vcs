import React, { useState } from 'react';
import { 
  ChevronLeft, 
  ChevronRight,
  User, 
  BarChart3, 
  Users2,
  Download,
  Settings,
  Zap
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Button } from './ui/button';
import { Separator } from './ui/separator';
import { cn } from './ui/utils';
import { NavigationView, Project, Goal, Release, View } from '../types';
import { ThemeToggle } from './ThemeToggle';

interface SidebarHierarchicalProps {
  collapsed: boolean;
  currentView: NavigationView;
  currentTeam: any;
  teams: any[];
  projects: Project[];
  goals: Goal[];
  releases: Release[];
  views: View[];
  onToggle: () => void;
  onNavigate: (view: NavigationView, projectId?: string) => void;
  onTeamChange: (team: any) => void;
  onTeamCreate: (team: any) => void;
  onTeamUpdate: (team: any) => void;
  onTeamDelete: (teamId: string) => void;
  onImportIssues: () => void;
  onSettingsClick: () => void;
}

export function SidebarHierarchical({ 
  collapsed, 
  currentView, 
  currentTeam, 
  teams,
  projects,
  goals,
  releases,
  views,
  onToggle, 
  onNavigate, 
  onTeamChange, 
  onTeamCreate, 
  onTeamUpdate, 
  onTeamDelete, 
  onImportIssues,
  onSettingsClick
}: SidebarHierarchicalProps) {
  const navigationItems = [
    { icon: User, label: 'My Issues', view: 'my-issues' as NavigationView },
  ];

  const quickActions = [
    { icon: Download, label: 'Import issues', onClick: onImportIssues },
    { icon: Settings, label: 'Settings', onClick: onSettingsClick }
  ];

  return (
    <div className={cn(
      "bg-sidebar border-r border-sidebar-border flex flex-col transition-all duration-200 relative",
      collapsed ? "w-12" : "w-64"
    )}>
      {/* Subtle gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-purple-500/[0.04] via-gray-700/[0.02] to-gray-800/[0.01] pointer-events-none" />
      {/* Header */}
      <div className="p-3 flex items-center justify-between relative z-10">
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

      <div className="flex-1 px-2 overflow-y-auto relative z-10">
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

          {/* Views */}
          <Button
            variant="ghost"
            onClick={() => onNavigate('views')}
            className={cn(
              "w-full justify-start h-8 px-2 text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent",
              currentView === 'views' && "bg-sidebar-accent text-sidebar-foreground",
              collapsed && "px-2 justify-center"
            )}
          >
            <BarChart3 className="w-4 h-4" />
            {!collapsed && <span className="ml-2 text-sm">Views</span>}
          </Button>

          {/* Teams */}
          <Button
            variant="ghost"
            onClick={() => onNavigate('teams')}
            className={cn(
              "w-full justify-start h-8 px-2 text-sidebar-foreground/80 hover:text-sidebar-foreground hover:bg-sidebar-accent",
              currentView === 'teams' && "bg-sidebar-accent text-sidebar-foreground",
              collapsed && "px-2 justify-center"
            )}
          >
            <Users2 className="w-4 h-4" />
            {!collapsed && <span className="ml-2 text-sm">Teams</span>}
          </Button>
        </nav>
      </div>

      {/* Quick actions */}
      <div className="p-2 border-t border-sidebar-border relative z-10">
        <div className="flex items-center justify-between mb-2">
          <div className="flex-1">
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
          {!collapsed && (
            <div className="ml-2">
              <ThemeToggle />
            </div>
          )}
        </div>
        {collapsed && (
          <div className="flex justify-center">
            <ThemeToggle />
          </div>
        )}
      </div>
    </div>
  );
}