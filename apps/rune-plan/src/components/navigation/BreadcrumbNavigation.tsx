import React from 'react';
import { ChevronRight, Home, Folder, Star, Clock } from 'lucide-react';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import type { BreadcrumbItem } from './types';

interface BreadcrumbNavigationProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  bookmarks?: BreadcrumbItem[];
  recentPaths?: BreadcrumbItem[];
  className?: string;
}

export const BreadcrumbNavigation: React.FC<BreadcrumbNavigationProps> = ({
  currentPath,
  onNavigate,
  bookmarks = [],
  recentPaths = [],
  className = '',
}) => {
  // Parse the current path into breadcrumb segments
  const generateBreadcrumbs = (path: string): BreadcrumbItem[] => {
    if (!path || path === '/') {
      return [{ name: 'Home', path: '/', icon: <Home className="w-4 h-4" /> }];
    }

    const segments = path.split('/').filter(Boolean);
    const breadcrumbs: BreadcrumbItem[] = [
      { name: 'Home', path: '/', icon: <Home className="w-4 h-4" /> }
    ];

    let currentPath = '';
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`;
      breadcrumbs.push({
        name: segment,
        path: currentPath,
        icon: <Folder className="w-4 h-4" />
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = generateBreadcrumbs(currentPath);

  const handleBreadcrumbClick = (path: string) => {
    onNavigate(path);
  };

  const QuickAccessDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="h-8 px-2 text-muted-foreground hover:text-foreground"
        >
          <Folder className="w-4 h-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        {bookmarks.length > 0 && (
          <DropdownMenuGroup>
            <DropdownMenuLabel className="flex items-center gap-2">
              <Star className="w-4 h-4" />
              Bookmarks
            </DropdownMenuLabel>
            {bookmarks.map((bookmark, index) => (
              <DropdownMenuItem
                key={index}
                onClick={() => handleBreadcrumbClick(bookmark.path)}
                className="flex items-center gap-2"
              >
                {bookmark.icon}
                <span className="truncate">{bookmark.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        )}
        
        {bookmarks.length > 0 && recentPaths.length > 0 && <DropdownMenuSeparator />}
        
        {recentPaths.length > 0 && (
          <DropdownMenuGroup>
            <DropdownMenuLabel className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Recent
            </DropdownMenuLabel>
            {recentPaths.slice(0, 5).map((recent, index) => (
              <DropdownMenuItem
                key={index}
                onClick={() => handleBreadcrumbClick(recent.path)}
                className="flex items-center gap-2"
              >
                {recent.icon}
                <span className="truncate">{recent.name}</span>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <QuickAccessDropdown />
      
      <div className="flex items-center gap-1 flex-1 min-w-0">
        {breadcrumbs.map((crumb, index) => (
          <React.Fragment key={crumb.path}>
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-muted-foreground flex-shrink-0" />
            )}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleBreadcrumbClick(crumb.path)}
              className="h-8 px-2 text-sm hover:bg-accent/50 flex items-center gap-2 min-w-0"
            >
              {crumb.icon}
              <span className="truncate">{crumb.name}</span>
            </Button>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
