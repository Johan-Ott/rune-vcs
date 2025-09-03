import React, { useState, useEffect, useRef } from 'react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '../ui/command';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '../ui/popover';
import {
  Search,
  Clock,
  Star,
  Filter,
  Folder,
  File,
  Tag,
  User,
  Calendar,
  HardDrive,
  Sparkles,
  ArrowRight,
  X
} from 'lucide-react';

interface SearchSuggestion {
  id: string;
  type: 'recent' | 'popular' | 'smart' | 'file' | 'folder' | 'tag' | 'filter';
  text: string;
  description?: string;
  icon?: React.ReactNode;
  action?: () => void;
  metadata?: Record<string, any>;
}

interface SmartSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSearch: (query: string, filters?: any) => void;
  onAdvancedSearch?: () => void;
  placeholder?: string;
  suggestions?: SearchSuggestion[];
  recentSearches?: string[];
  popularSearches?: string[];
  className?: string;
}

export function SmartSearchBar({
  value,
  onChange,
  onSearch,
  onAdvancedSearch,
  placeholder = "Search files and folders...",
  suggestions = [],
  recentSearches = [],
  popularSearches = [],
  className = ""
}: SmartSearchBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [smartSuggestions, setSmartSuggestions] = useState<SearchSuggestion[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  // Generate smart suggestions based on input
  useEffect(() => {
    const generateSmartSuggestions = (): SearchSuggestion[] => {
      const query = value.toLowerCase().trim();
      const suggestions: SearchSuggestion[] = [];

      if (!query) {
        // Show recent and popular searches when no query
        recentSearches.slice(0, 5).forEach((search, index) => {
          suggestions.push({
            id: `recent-${index}`,
            type: 'recent',
            text: search,
            description: 'Recent search',
            icon: <Clock className="w-4 h-4" />
          });
        });

        popularSearches.slice(0, 3).forEach((search, index) => {
          suggestions.push({
            id: `popular-${index}`,
            type: 'popular',
            text: search,
            description: 'Popular search',
            icon: <Star className="w-4 h-4" />
          });
        });

        return suggestions;
      }

      // Smart search suggestions based on query patterns
      
      // File type suggestions
      const fileTypePatterns = {
        'image': ['jpg', 'png', 'gif', 'svg'],
        'video': ['mp4', 'avi', 'mkv', 'mov'],
        'audio': ['mp3', 'wav', 'flac', 'ogg'],
        'document': ['pdf', 'doc', 'txt', 'md'],
        'code': ['js', 'ts', 'py', 'java'],
        'archive': ['zip', 'rar', 'tar', 'gz']
      };

      Object.entries(fileTypePatterns).forEach(([type, extensions]) => {
        if (query.includes(type) || extensions.some(ext => query.includes(ext))) {
          suggestions.push({
            id: `filetype-${type}`,
            type: 'smart',
            text: `Search ${type} files`,
            description: `Filter by ${extensions.join(', ')} files`,
            icon: <Filter className="w-4 h-4" />,
            action: () => onSearch(query, { fileTypes: extensions })
          });
        }
      });

      // Size-based suggestions
      const sizeKeywords = ['large', 'small', 'big', 'tiny', 'huge'];
      if (sizeKeywords.some(keyword => query.includes(keyword))) {
        suggestions.push({
          id: 'size-filter',
          type: 'smart',
          text: 'Filter by file size',
          description: 'Search files by size range',
          icon: <HardDrive className="w-4 h-4" />,
          action: () => onAdvancedSearch?.()
        });
      }

      // Date-based suggestions
      const dateKeywords = ['today', 'yesterday', 'week', 'month', 'year', 'recent', 'old'];
      if (dateKeywords.some(keyword => query.includes(keyword))) {
        suggestions.push({
          id: 'date-filter',
          type: 'smart',
          text: 'Filter by date modified',
          description: 'Search files by modification date',
          icon: <Calendar className="w-4 h-4" />,
          action: () => onAdvancedSearch?.()
        });
      }

      // Tag-based suggestions
      if (query.startsWith('#') || query.includes('tag:')) {
        const tagQuery = query.replace(/^#|tag:/g, '').trim();
        suggestions.push({
          id: 'tag-search',
          type: 'smart',
          text: `Search by tag: ${tagQuery}`,
          description: 'Find files with this tag',
          icon: <Tag className="w-4 h-4" />,
          action: () => onSearch('', { tags: [tagQuery] })
        });
      }

      // Path-based suggestions
      if (query.includes('/') || query.includes('in:')) {
        const pathQuery = query.replace(/in:/g, '').trim();
        suggestions.push({
          id: 'path-search',
          type: 'smart',
          text: `Search in: ${pathQuery}`,
          description: 'Limit search to this path',
          icon: <Folder className="w-4 h-4" />,
          action: () => onSearch(value.replace(/in:[^\s]+/g, '').trim(), { path: pathQuery })
        });
      }

      // Content search suggestion
      if (query.length > 3) {
        suggestions.push({
          id: 'content-search',
          type: 'smart',
          text: 'Search inside files',
          description: `Look for "${query}" in file contents`,
          icon: <Search className="w-4 h-4" />,
          action: () => onSearch(query, { searchContent: true })
        });
      }

      // Advanced search suggestion
      if (query.length > 0) {
        suggestions.push({
          id: 'advanced-search',
          type: 'filter',
          text: 'Advanced Search',
          description: 'More search options and filters',
          icon: <Sparkles className="w-4 h-4" />,
          action: () => onAdvancedSearch?.()
        });
      }

      return suggestions;
    };

    setSmartSuggestions(generateSmartSuggestions());
  }, [value, recentSearches, popularSearches, onSearch, onAdvancedSearch]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    const allSuggestions = [...smartSuggestions, ...suggestions];

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev < allSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : allSuggestions.length - 1
        );
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedIndex >= 0 && selectedIndex < allSuggestions.length) {
          const suggestion = allSuggestions[selectedIndex];
          if (suggestion.action) {
            suggestion.action();
          } else {
            onChange(suggestion.text);
            onSearch(suggestion.text);
          }
        } else {
          onSearch(value);
        }
        setIsOpen(false);
        break;
      case 'Escape':
        setIsOpen(false);
        setSelectedIndex(-1);
        break;
    }
  };

  const handleSuggestionClick = (suggestion: SearchSuggestion) => {
    if (suggestion.action) {
      suggestion.action();
    } else {
      onChange(suggestion.text);
      onSearch(suggestion.text);
    }
    setIsOpen(false);
  };

  const clearSearch = () => {
    onChange('');
    inputRef.current?.focus();
  };

  const allSuggestions = [...smartSuggestions, ...suggestions];

  return (
    <div className={`relative ${className}`}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              ref={inputRef}
              value={value}
              onChange={(e) => onChange(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => setIsOpen(true)}
              placeholder={placeholder}
              className="pl-10 pr-20"
            />
            <div className="absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1">
              {value && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-6 p-0"
                  onClick={clearSearch}
                >
                  <X className="w-3 h-3" />
                </Button>
              )}
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0"
                onClick={() => onAdvancedSearch?.()}
              >
                <Filter className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </PopoverTrigger>

        <PopoverContent 
          className="w-[400px] p-0" 
          align="start"
          side="bottom"
          onOpenAutoFocus={(e) => e.preventDefault()}
        >
          <Command>
            <CommandList>
              {allSuggestions.length === 0 ? (
                <CommandEmpty>
                  <div className="text-center py-4">
                    <Search className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                    <p className="text-sm text-muted-foreground">
                      Type to start searching
                    </p>
                  </div>
                </CommandEmpty>
              ) : (
                <>
                  {smartSuggestions.length > 0 && (
                    <CommandGroup heading="Smart Suggestions">
                      {smartSuggestions.map((suggestion, index) => (
                        <CommandItem
                          key={suggestion.id}
                          className={`cursor-pointer ${
                            index === selectedIndex ? 'bg-accent' : ''
                          }`}
                          onSelect={() => handleSuggestionClick(suggestion)}
                        >
                          <div className="flex items-center w-full">
                            {suggestion.icon}
                            <div className="ml-2 flex-1">
                              <div className="text-sm">{suggestion.text}</div>
                              {suggestion.description && (
                                <div className="text-xs text-muted-foreground">
                                  {suggestion.description}
                                </div>
                              )}
                            </div>
                            {suggestion.action && (
                              <ArrowRight className="w-3 h-3 ml-2 text-muted-foreground" />
                            )}
                          </div>
                        </CommandItem>
                      ))}
                    </CommandGroup>
                  )}

                  {suggestions.length > 0 && (
                    <>
                      {smartSuggestions.length > 0 && <CommandSeparator />}
                      <CommandGroup heading="Suggestions">
                        {suggestions.map((suggestion, index) => {
                          const adjustedIndex = index + smartSuggestions.length;
                          return (
                            <CommandItem
                              key={suggestion.id}
                              className={`cursor-pointer ${
                                adjustedIndex === selectedIndex ? 'bg-accent' : ''
                              }`}
                              onSelect={() => handleSuggestionClick(suggestion)}
                            >
                              <div className="flex items-center w-full">
                                {suggestion.icon}
                                <div className="ml-2 flex-1">
                                  <div className="text-sm">{suggestion.text}</div>
                                  {suggestion.description && (
                                    <div className="text-xs text-muted-foreground">
                                      {suggestion.description}
                                    </div>
                                  )}
                                </div>
                              </div>
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    </>
                  )}
                </>
              )}
            </CommandList>
          </Command>
          
          {/* Quick actions footer */}
          <div className="border-t p-2 text-xs text-muted-foreground">
            <div className="flex items-center justify-between">
              <span>
                Use ↑↓ to navigate, Enter to select
              </span>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="h-4 text-xs">
                  Ctrl+K
                </Badge>
                <span>Quick search</span>
              </div>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}
