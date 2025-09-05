import React, { useState, useRef, useEffect } from 'react';
import { FolderOpen, Search, ArrowRight } from 'lucide-react';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '../ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';

interface PathSuggestion {
  path: string;
  name: string;
  type: 'folder' | 'recent' | 'bookmark';
  icon?: React.ReactNode;
}

interface QuickPathNavigationProps {
  currentPath: string;
  onNavigate: (path: string) => void;
  suggestions?: PathSuggestion[];
  recentPaths?: string[];
  bookmarks?: string[];
  onPathChange?: (path: string) => void;
  className?: string;
}

export const QuickPathNavigation: React.FC<QuickPathNavigationProps> = ({
  currentPath,
  onNavigate,
  suggestions = [],
  recentPaths = [],
  bookmarks = [],
  onPathChange,
  className = '',
}) => {
  const [inputValue, setInputValue] = useState(currentPath);
  const [isEditing, setIsEditing] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Update input when currentPath changes externally
  useEffect(() => {
    if (!isEditing) {
      setInputValue(currentPath);
    }
  }, [currentPath, isEditing]);

  const handleInputFocus = () => {
    setIsEditing(true);
    setShowSuggestions(true);
  };

  const handleInputBlur = () => {
    // Delay to allow click on suggestions
    setTimeout(() => {
      setIsEditing(false);
      setShowSuggestions(false);
      setInputValue(currentPath); // Reset to current path if not committed
    }, 200);
  };

  const handleInputChange = (value: string) => {
    setInputValue(value);
    onPathChange?.(value);
    setShowSuggestions(true);
  };

  const handleNavigate = (path: string) => {
    setInputValue(path);
    setIsEditing(false);
    setShowSuggestions(false);
    onNavigate(path);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleNavigate(inputValue);
    } else if (e.key === 'Escape') {
      setInputValue(currentPath);
      setIsEditing(false);
      setShowSuggestions(false);
      inputRef.current?.blur();
    }
  };

  // Filter suggestions based on input
  const filteredSuggestions = suggestions.filter(suggestion =>
    suggestion.path.toLowerCase().includes(inputValue.toLowerCase()) ||
    suggestion.name.toLowerCase().includes(inputValue.toLowerCase())
  );

  // Generate path suggestions from current input
  const generatePathSuggestions = (): PathSuggestion[] => {
    const pathSuggestions: PathSuggestion[] = [];
    
    // Add filtered suggestions
    pathSuggestions.push(...filteredSuggestions);
    
    // Add recent paths that match
    recentPaths.forEach(path => {
      if (path.toLowerCase().includes(inputValue.toLowerCase()) && 
          !pathSuggestions.some(s => s.path === path)) {
        pathSuggestions.push({
          path,
          name: path.split('/').pop() || 'Root',
          type: 'recent',
          icon: <FolderOpen className="w-4 h-4" />
        });
      }
    });

    // Add bookmark paths that match
    bookmarks.forEach(path => {
      if (path.toLowerCase().includes(inputValue.toLowerCase()) && 
          !pathSuggestions.some(s => s.path === path)) {
        pathSuggestions.push({
          path,
          name: path.split('/').pop() || 'Root',
          type: 'bookmark',
          icon: <FolderOpen className="w-4 h-4" />
        });
      }
    });

    return pathSuggestions.slice(0, 8); // Limit to 8 suggestions
  };

  const pathSuggestions = generatePathSuggestions();

  return (
    <div className={`relative flex-1 ${className}`}>
      <Popover open={showSuggestions && pathSuggestions.length > 0}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Input
              ref={inputRef}
              value={inputValue}
              onChange={(e) => handleInputChange(e.target.value)}
              onFocus={handleInputFocus}
              onBlur={handleInputBlur}
              onKeyDown={handleKeyDown}
              placeholder="Enter path or search..."
              className="pr-10"
            />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleNavigate(inputValue)}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-6 w-6 p-0"
            >
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
        </PopoverTrigger>
        <PopoverContent 
          className="w-full p-0" 
          align="start"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Command>
            <CommandList>
              {pathSuggestions.length > 0 ? (
                <CommandGroup heading="Suggestions">
                  {pathSuggestions.map((suggestion, index) => (
                    <CommandItem
                      key={`${suggestion.type}-${suggestion.path}-${index}`}
                      value={suggestion.path}
                      onSelect={() => handleNavigate(suggestion.path)}
                      className="flex items-center gap-2"
                    >
                      {suggestion.icon}
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="truncate font-medium">{suggestion.name}</span>
                        <span className="text-xs text-muted-foreground truncate">
                          {suggestion.path}
                        </span>
                      </div>
                      <span className="text-xs text-muted-foreground capitalize">
                        {suggestion.type}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              ) : (
                <CommandEmpty>No matching paths found</CommandEmpty>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
    </div>
  );
};
