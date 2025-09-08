import React, { useState, useMemo } from 'react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import {
  Search,
  File,
  Folder,
  Clock,
  HardDrive,
  Star,
  Filter,
  Grid,
  List,
  SortAsc,
  SortDesc,
  Eye,
  ExternalLink,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  Code,
  X,
  ArrowRight,
  MapPin
} from 'lucide-react';

interface SearchResult {
  id: string;
  name: string;
  path: string;
  type: 'file' | 'folder';
  size?: number;
  modified: Date;
  created: Date;
  fileType?: string;
  thumbnail?: string;
  matchContext?: string;
  matchScore: number;
  isStarred?: boolean;
  tags?: string[];
}

interface SearchResultsProps {
  results: SearchResult[];
  query: string;
  totalResults: number;
  isLoading: boolean;
  onResultClick: (result: SearchResult) => void;
  onResultDoubleClick: (result: SearchResult) => void;
  onClearSearch: () => void;
  viewMode?: 'list' | 'grid';
  onViewModeChange?: (mode: 'list' | 'grid') => void;
  className?: string;
}

type SortField = 'name' | 'modified' | 'size' | 'relevance';
type SortDirection = 'asc' | 'desc';

const getFileIcon = (fileType?: string, type?: string) => {
  if (type === 'folder') return <Folder className="w-4 h-4" />;
  
  if (!fileType) return <File className="w-4 h-4" />;
  
  const extension = fileType.toLowerCase();
  
  if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp', 'bmp'].includes(extension)) {
    return <Image className="w-4 h-4" />;
  }
  if (['mp4', 'avi', 'mkv', 'mov', 'webm', 'flv'].includes(extension)) {
    return <Video className="w-4 h-4" />;
  }
  if (['mp3', 'wav', 'flac', 'ogg', 'aac', 'm4a'].includes(extension)) {
    return <Music className="w-4 h-4" />;
  }
  if (['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'go', 'rs'].includes(extension)) {
    return <Code className="w-4 h-4" />;
  }
  if (['zip', 'rar', 'tar', 'gz', '7z'].includes(extension)) {
    return <Archive className="w-4 h-4" />;
  }
  
  return <FileText className="w-4 h-4" />;
};

const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};

const formatDate = (date: Date): string => {
  const now = new Date();
  const diffTime = now.getTime() - date.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 0) return 'Today';
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
  
  return date.toLocaleDateString();
};

const highlightText = (text: string, query: string): React.ReactNode => {
  if (!query.trim()) return text;
  
  const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
  const parts = text.split(regex);
  
  return parts.map((part, index) =>
    regex.test(part) ? (
      <mark key={index} className="bg-yellow-200 dark:bg-yellow-900 px-0.5 rounded">
        {part}
      </mark>
    ) : (
      part
    )
  );
};

export function SearchResults({
  results,
  query,
  totalResults,
  isLoading,
  onResultClick,
  onResultDoubleClick,
  onClearSearch,
  viewMode = 'list',
  onViewModeChange,
  className = ""
}: SearchResultsProps) {
  const [sortField, setSortField] = useState<SortField>('relevance');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');
  const [filterType, setFilterType] = useState<'all' | 'files' | 'folders'>('all');

  // Sort and filter results
  const processedResults = useMemo(() => {
    let filtered = results;

    // Apply type filter
    if (filterType !== 'all') {
      filtered = filtered.filter(result => 
        filterType === 'files' ? result.type === 'file' : result.type === 'folder'
      );
    }

    // Sort results
    return filtered.sort((a, b) => {
      let comparison = 0;

      switch (sortField) {
        case 'name':
          comparison = a.name.localeCompare(b.name);
          break;
        case 'modified':
          comparison = a.modified.getTime() - b.modified.getTime();
          break;
        case 'size':
          comparison = (a.size || 0) - (b.size || 0);
          break;
        case 'relevance':
          comparison = a.matchScore - b.matchScore;
          break;
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });
  }, [results, sortField, sortDirection, filterType]);

  const toggleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const resultsByType = useMemo(() => {
    const files = processedResults.filter(r => r.type === 'file');
    const folders = processedResults.filter(r => r.type === 'folder');
    return { files, folders };
  }, [processedResults]);

  if (isLoading) {
    return (
      <div className={`flex items-center justify-center py-12 ${className}`}>
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-sm text-muted-foreground">Searching...</p>
        </div>
      </div>
    );
  }

  if (results.length === 0 && query) {
    return (
      <div className={`text-center py-12 ${className}`}>
        <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
        <h3 className="text-lg font-medium mb-2">No results found</h3>
        <p className="text-sm text-muted-foreground mb-4">
          Try adjusting your search terms or filters
        </p>
        <Button variant="outline" onClick={onClearSearch}>
          <X className="w-4 h-4 mr-2" />
          Clear Search
        </Button>
      </div>
    );
  }

  const renderListView = () => (
    <div className="space-y-1">
      {processedResults.map((result) => (
        <div
          key={result.id}
          className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted/50 cursor-pointer transition-colors group"
          onClick={() => onResultClick(result)}
          onDoubleClick={() => onResultDoubleClick(result)}
        >
          <div className="flex-shrink-0">
            {getFileIcon(result.fileType, result.type)}
          </div>
          
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="text-sm font-medium truncate">
                {highlightText(result.name, query)}
              </h4>
              {result.isStarred && (
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              )}
              {result.tags && result.tags.length > 0 && (
                <div className="flex gap-1">
                  {result.tags.slice(0, 2).map(tag => (
                    <Badge key={tag} variant="secondary" className="h-4 text-xs">
                      {tag}
                    </Badge>
                  ))}
                  {result.tags.length > 2 && (
                    <Badge variant="secondary" className="h-4 text-xs">
                      +{result.tags.length - 2}
                    </Badge>
                  )}
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <MapPin className="w-3 h-3" />
                <span className="truncate max-w-[200px]">
                  {highlightText(result.path, query)}
                </span>
              </div>
              
              {result.size && (
                <div className="flex items-center gap-1">
                  <HardDrive className="w-3 h-3" />
                  <span>{formatFileSize(result.size)}</span>
                </div>
              )}
              
              <div className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                <span>{formatDate(result.modified)}</span>
              </div>
            </div>
            
            {result.matchContext && (
              <p className="text-xs text-muted-foreground mt-1 italic">
                ...{highlightText(result.matchContext, query)}...
              </p>
            )}
          </div>
          
          <div className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
            <div className="flex gap-1">
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Eye className="w-3 h-3" />
              </Button>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <ExternalLink className="w-3 h-3" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  const renderGridView = () => (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
      {processedResults.map((result) => (
        <div
          key={result.id}
          className="p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors group"
          onClick={() => onResultClick(result)}
          onDoubleClick={() => onResultDoubleClick(result)}
        >
          <div className="aspect-square mb-2 flex items-center justify-center bg-muted/30 rounded-lg">
            {result.thumbnail ? (
              <img 
                src={result.thumbnail} 
                alt={result.name}
                className="w-full h-full object-cover rounded-lg"
              />
            ) : (
              <div className="text-muted-foreground">
                {getFileIcon(result.fileType, result.type)}
              </div>
            )}
          </div>
          
          <div className="space-y-1">
            <h4 className="text-sm font-medium truncate">
              {highlightText(result.name, query)}
            </h4>
            
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              {result.size && <span>{formatFileSize(result.size)}</span>}
              {result.isStarred && (
                <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Search Results Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div>
            <h3 className="text-lg font-medium">
              Search Results for "{query}"
            </h3>
            <p className="text-sm text-muted-foreground">
              {totalResults} result{totalResults !== 1 ? 's' : ''} found
              {resultsByType.folders.length > 0 && (
                <> • {resultsByType.folders.length} folder{resultsByType.folders.length !== 1 ? 's' : ''}</>
              )}
              {resultsByType.files.length > 0 && (
                <> • {resultsByType.files.length} file{resultsByType.files.length !== 1 ? 's' : ''}</>
              )}
            </p>
          </div>
          
          <Button variant="outline" size="sm" onClick={onClearSearch}>
            <X className="w-4 h-4 mr-2" />
            Clear
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          {/* Type Filter */}
          <Select value={filterType} onValueChange={(value: any) => setFilterType(value)}>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="files">Files Only</SelectItem>
              <SelectItem value="folders">Folders Only</SelectItem>
            </SelectContent>
          </Select>
          
          {/* Sort Options */}
          <Select value={`${sortField}-${sortDirection}`} onValueChange={(value) => {
            const [field, direction] = value.split('-') as [SortField, SortDirection];
            setSortField(field);
            setSortDirection(direction);
          }}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="relevance-desc">Most Relevant</SelectItem>
              <SelectItem value="name-asc">Name (A-Z)</SelectItem>
              <SelectItem value="name-desc">Name (Z-A)</SelectItem>
              <SelectItem value="modified-desc">Recently Modified</SelectItem>
              <SelectItem value="modified-asc">Oldest First</SelectItem>
              <SelectItem value="size-desc">Largest First</SelectItem>
              <SelectItem value="size-asc">Smallest First</SelectItem>
            </SelectContent>
          </Select>
          
          {/* View Mode Toggle */}
          {onViewModeChange && (
            <div className="flex border rounded-lg">
              <Button
                variant={viewMode === 'list' ? 'default' : 'ghost'}
                size="sm"
                className="rounded-r-none"
                onClick={() => onViewModeChange('list')}
              >
                <List className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === 'grid' ? 'default' : 'ghost'}
                size="sm"
                className="rounded-l-none"
                onClick={() => onViewModeChange('grid')}
              >
                <Grid className="w-4 h-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
      
      <Separator />
      
      {/* Results */}
      <ScrollArea className="h-[600px]">
        {viewMode === 'list' ? renderListView() : renderGridView()}
      </ScrollArea>
    </div>
  );
}
