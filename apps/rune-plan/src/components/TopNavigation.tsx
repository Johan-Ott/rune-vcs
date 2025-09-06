import React from 'react';
import { ChevronRight, ChevronDown, Globe } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { cn } from './ui/utils';
import { NavigationView, Workspace, Project } from '../types';

interface TopNavigationProps {
  currentView: NavigationView;
  projects: Project[];
  selectedProject?: Project | null;
  onProjectChange: (project: Project | null) => void;
}

export function TopNavigation({ 
  currentView, 
  projects,
  selectedProject,
  onProjectChange
}: TopNavigationProps) {

  const getViewTitle = (view: NavigationView) => {
    switch (view) {
      case 'my-issues':
        return 'My Issues';
      case 'projects':
        return 'Projects';
      case 'views':
        return 'Views';
      case 'teams':
        return 'Teams';
      case 'releases':
        return 'Releases';
      default:
        return 'Issues';
    }
  };

  const getViewSubtitle = (view: NavigationView) => {
    switch (view) {
      case 'my-issues':
        return 'Active Issues';
      default:
        return '';
    }
  };



  return (
    <div className="border-b border-border bg-background">
      {/* Header with breadcrumb and user controls */}
      <div className="px-6 py-2 border-b border-border">
        <div className="flex items-center justify-between">
          {/* Breadcrumb navigation */}
          <div className="flex items-center text-sm text-muted-foreground">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex items-center gap-1 font-medium text-foreground hover:text-primary transition-colors">
                  {selectedProject ? selectedProject.name : "All Projects"}
                  <ChevronDown className="w-3 h-3" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem
                  onClick={() => onProjectChange(null)}
                  className={cn(
                    "flex items-center justify-between",
                    !selectedProject && "bg-accent"
                  )}
                >
                  <div className="flex items-center">
                    <Globe className="w-4 h-4 mr-2" />
                    All Projects
                  </div>
                  {!selectedProject && (
                    <div className="w-2 h-2 rounded-full bg-primary" />
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                {projects.map((project) => (
                  <DropdownMenuItem
                    key={project.id}
                    onClick={() => onProjectChange(project)}
                    className={cn(
                      "flex items-center justify-between",
                      selectedProject?.id === project.id && "bg-accent"
                    )}
                  >
                    <div className="flex items-center">
                      <div className={cn(
                        "w-2 h-2 rounded-full mr-3",
                        project.status === 'active' && "bg-green-500",
                        project.status === 'paused' && "bg-yellow-500",
                        project.status === 'completed' && "bg-blue-500"
                      )} />
                      {project.name}
                    </div>
                    {selectedProject?.id === project.id && (
                      <div className="w-2 h-2 rounded-full bg-primary" />
                    )}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <ChevronRight className="w-4 h-4 mx-2" />
            <span>{getViewTitle(currentView)}</span>
            {getViewSubtitle(currentView) && (
              <>
                <ChevronRight className="w-4 h-4 mx-2" />
                <span>{getViewSubtitle(currentView)}</span>
              </>
            )}
          </div>


        </div>
      </div>


    </div>
  );
}