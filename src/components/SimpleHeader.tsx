import React, { useState } from 'react';
import { 
  Moon, 
  Sun, 
  Minimize2, 
  Maximize2, 
  X,
  Search,
  Bell,
  User,
  ChevronDown,
  RefreshCw,
  Settings
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
  DropdownMenuSeparator,
} from './ui/dropdown-menu';

interface SimpleHeaderProps {
  isDark: boolean;
  onThemeToggle: () => void;
}

export function SimpleHeader({ isDark, onThemeToggle }: SimpleHeaderProps) {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className={`h-14 border-b ${isDark ? 'bg-gray-900 border-gray-800' : 'bg-white border-gray-200'} flex items-center justify-between px-4`}>
      {/* Left side - App title */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 bg-blue-600 rounded-md flex items-center justify-center">
            <span className="text-white text-sm font-bold">R</span>
          </div>
          <span className="font-semibold text-lg">Rune VCS Visual Client</span>
        </div>
      </div>

      {/* Center - Search */}
      <div className="flex-1 max-w-md mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
            <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100">
              <span className="text-xs">⌘</span>K
            </kbd>
          </div>
        </div>
      </div>

      {/* Right side - Controls */}
      <div className="flex items-center gap-2">
        {/* Refresh */}
        <Button variant="ghost" size="sm">
          <RefreshCw className="w-4 h-4" />
        </Button>

        {/* Notifications */}
        <Button variant="ghost" size="sm" className="relative">
          <Bell className="w-4 h-4" />
          <Badge variant="destructive" className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs">
            3
          </Badge>
        </Button>

        {/* Theme Toggle */}
        <Button variant="ghost" size="sm" onClick={onThemeToggle}>
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </Button>

        {/* User Menu */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <Avatar className="w-6 h-6">
                <AvatarImage src="/api/placeholder/32/32" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <ChevronDown className="w-3 h-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem>
              <User className="w-4 h-4 mr-2" />
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem>
              <Settings className="w-4 h-4 mr-2" />
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem>Sign out</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>

        {/* Window Controls */}
        <div className="flex items-center gap-1 ml-2">
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <Minimize2 className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <Maximize2 className="w-3 h-3" />
          </Button>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0 hover:bg-red-500 hover:text-white">
            <X className="w-3 h-3" />
          </Button>
        </div>
      </div>
    </div>
  );
}
