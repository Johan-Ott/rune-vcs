import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Separator } from '../ui/separator';
import { ScrollArea } from '../ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { Checkbox } from '../ui/checkbox';
import { Slider } from '../ui/slider';
import {
  Search,
  Filter,
  Calendar,
  HardDrive,
  FileText,
  Image,
  Video,
  Music,
  Archive,
  Code,
  X,
  Plus,
  Save,
  History,
  Sparkles,
  Settings,
  Clock
} from 'lucide-react';

interface SearchFilter {
  query: string;
  fileTypes: string[];
  sizeMin: number;
  sizeMax: number;
  dateModifiedAfter?: Date;
  dateModifiedBefore?: Date;
  dateCreatedAfter?: Date;
  dateCreatedBefore?: Date;
  includeHidden: boolean;
  searchContent: boolean;
  caseSensitive: boolean;
  useRegex: boolean;
  tags: string[];
  owners: string[];
  extensions: string[];
  path: string;
}

interface SavedSearch {
  id: string;
  name: string;
  filter: SearchFilter;
  createdAt: Date;
  lastUsed: Date;
}

interface AdvancedSearchDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSearch: (filter: SearchFilter) => void;
  onSaveSearch?: (search: SavedSearch) => void;
  savedSearches?: SavedSearch[];
  currentPath?: string;
}

const FILE_TYPE_CATEGORIES = {
  'Documents': ['pdf', 'doc', 'docx', 'txt', 'rtf', 'odt'],
  'Images': ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'tiff', 'webp'],
  'Videos': ['mp4', 'avi', 'mkv', 'mov', 'wmv', 'flv', 'webm', 'm4v'],
  'Audio': ['mp3', 'wav', 'flac', 'ogg', 'aac', 'm4a', 'wma'],
  'Code': ['js', 'ts', 'jsx', 'tsx', 'py', 'java', 'cpp', 'c', 'go', 'rs', 'php'],
  'Archives': ['zip', 'rar', 'tar', 'gz', '7z', 'bz2', 'xz'],
  'Spreadsheets': ['xls', 'xlsx', 'csv', 'ods'],
  'Presentations': ['ppt', 'pptx', 'odp']
};

const SIZE_PRESETS = [
  { label: 'Tiny (< 100 KB)', min: 0, max: 100 * 1024 },
  { label: 'Small (100 KB - 1 MB)', min: 100 * 1024, max: 1024 * 1024 },
  { label: 'Medium (1 MB - 10 MB)', min: 1024 * 1024, max: 10 * 1024 * 1024 },
  { label: 'Large (10 MB - 100 MB)', min: 10 * 1024 * 1024, max: 100 * 1024 * 1024 },
  { label: 'Huge (> 100 MB)', min: 100 * 1024 * 1024, max: Infinity }
];

export function AdvancedSearchDialog({
  isOpen,
  onOpenChange,
  onSearch,
  onSaveSearch,
  savedSearches = [],
  currentPath = ''
}: AdvancedSearchDialogProps) {
  const [activeTab, setActiveTab] = useState('basic');
  const [filter, setFilter] = useState<SearchFilter>({
    query: '',
    fileTypes: [],
    sizeMin: 0,
    sizeMax: Infinity,
    includeHidden: false,
    searchContent: false,
    caseSensitive: false,
    useRegex: false,
    tags: [],
    owners: [],
    extensions: [],
    path: currentPath
  });

  const [customSizeRange, setCustomSizeRange] = useState([0, 1000]);
  const [saveSearchName, setSaveSearchName] = useState('');
  const [recentSearches, setRecentSearches] = useState<string[]>([]);

  useEffect(() => {
    // Load recent searches from localStorage
    const stored = localStorage.getItem('recentSearches');
    if (stored) {
      setRecentSearches(JSON.parse(stored));
    }
  }, []);

  const updateFilter = (updates: Partial<SearchFilter>) => {
    setFilter(prev => ({ ...prev, ...updates }));
  };

  const handleSearch = () => {
    // Add to recent searches
    if (filter.query && !recentSearches.includes(filter.query)) {
      const newRecent = [filter.query, ...recentSearches.slice(0, 9)];
      setRecentSearches(newRecent);
      localStorage.setItem('recentSearches', JSON.stringify(newRecent));
    }

    onSearch(filter);
    onOpenChange(false);
  };

  const handleSaveSearch = () => {
    if (!saveSearchName.trim() || !onSaveSearch) return;

    const newSearch: SavedSearch = {
      id: Date.now().toString(),
      name: saveSearchName,
      filter: { ...filter },
      createdAt: new Date(),
      lastUsed: new Date()
    };

    onSaveSearch(newSearch);
    setSaveSearchName('');
  };

  const loadSavedSearch = (search: SavedSearch) => {
    setFilter(search.filter);
    if (onSaveSearch) {
      onSaveSearch({ ...search, lastUsed: new Date() });
    }
  };

  const toggleFileType = (category: string) => {
    const extensions = FILE_TYPE_CATEGORIES[category as keyof typeof FILE_TYPE_CATEGORIES];
    const hasAll = extensions.every(ext => filter.fileTypes.includes(ext));
    
    if (hasAll) {
      updateFilter({ 
        fileTypes: filter.fileTypes.filter(type => !extensions.includes(type))
      });
    } else {
      updateFilter({
        fileTypes: [...new Set([...filter.fileTypes, ...extensions])]
      });
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    if (bytes === Infinity) return '∞';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="w-5 h-5" />
            Advanced Search
          </DialogTitle>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Basic</TabsTrigger>
            <TabsTrigger value="filters">Filters</TabsTrigger>
            <TabsTrigger value="saved">Saved</TabsTrigger>
            <TabsTrigger value="options">Options</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[500px] mt-4">
            {/* Basic Search Tab */}
            <TabsContent value="basic" className="space-y-4">
              <div className="space-y-3">
                <div>
                  <Label htmlFor="search-query">Search Query</Label>
                  <Input
                    id="search-query"
                    placeholder="Search files and folders..."
                    value={filter.query}
                    onChange={(e) => updateFilter({ query: e.target.value })}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label htmlFor="search-path">Search in Path</Label>
                  <Input
                    id="search-path"
                    placeholder="/path/to/search"
                    value={filter.path}
                    onChange={(e) => updateFilter({ path: e.target.value })}
                    className="mt-1"
                  />
                </div>

                {/* Recent Searches */}
                {recentSearches.length > 0 && (
                  <div>
                    <Label className="flex items-center gap-2">
                      <History className="w-4 h-4" />
                      Recent Searches
                    </Label>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {recentSearches.map((query, index) => (
                        <Badge
                          key={index}
                          variant="secondary"
                          className="cursor-pointer hover:bg-blue-500/20"
                          onClick={() => updateFilter({ query })}
                        >
                          {query}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick File Type Filters */}
                <div>
                  <Label>File Types</Label>
                  <div className="grid grid-cols-2 gap-2 mt-2">
                    {Object.entries(FILE_TYPE_CATEGORIES).map(([category, extensions]) => {
                      const hasAll = extensions.every(ext => filter.fileTypes.includes(ext));
                      const hasAny = extensions.some(ext => filter.fileTypes.includes(ext));
                      
                      return (
                        <Button
                          key={category}
                          variant={hasAll ? "default" : hasAny ? "secondary" : "outline"}
                          size="sm"
                          className="justify-start h-8"
                          onClick={() => toggleFileType(category)}
                        >
                          {category === 'Documents' && <FileText className="w-3 h-3 mr-2" />}
                          {category === 'Images' && <Image className="w-3 h-3 mr-2" />}
                          {category === 'Videos' && <Video className="w-3 h-3 mr-2" />}
                          {category === 'Audio' && <Music className="w-3 h-3 mr-2" />}
                          {category === 'Code' && <Code className="w-3 h-3 mr-2" />}
                          {category === 'Archives' && <Archive className="w-3 h-3 mr-2" />}
                          {!['Documents', 'Images', 'Videos', 'Audio', 'Code', 'Archives'].includes(category) && 
                            <FileText className="w-3 h-3 mr-2" />}
                          {category}
                          {hasAny && (
                            <Badge variant="outline" className="ml-auto h-4 text-xs">
                              {extensions.filter(ext => filter.fileTypes.includes(ext)).length}
                            </Badge>
                          )}
                        </Button>
                      );
                    })}
                  </div>
                </div>

                {/* Selected Extensions */}
                {filter.fileTypes.length > 0 && (
                  <div>
                    <Label>Selected Extensions</Label>
                    <div className="flex flex-wrap gap-1 mt-2">
                      {filter.fileTypes.map((type) => (
                        <Badge
                          key={type}
                          variant="secondary"
                          className="cursor-pointer hover:bg-red-500/20"
                          onClick={() => updateFilter({
                            fileTypes: filter.fileTypes.filter(t => t !== type)
                          })}
                        >
                          .{type}
                          <X className="w-2 h-2 ml-1" />
                        </Badge>
                      ))}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-6 text-xs"
                        onClick={() => updateFilter({ fileTypes: [] })}
                      >
                        Clear All
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Advanced Filters Tab */}
            <TabsContent value="filters" className="space-y-4">
              <div className="space-y-4">
                {/* File Size Filter */}
                <div>
                  <Label className="flex items-center gap-2">
                    <HardDrive className="w-4 h-4" />
                    File Size
                  </Label>
                  <div className="space-y-3 mt-2">
                    <div className="grid grid-cols-2 gap-2">
                      {SIZE_PRESETS.map((preset) => (
                        <Button
                          key={preset.label}
                          variant="outline"
                          size="sm"
                          className="justify-start h-8 text-xs"
                          onClick={() => updateFilter({ 
                            sizeMin: preset.min, 
                            sizeMax: preset.max 
                          })}
                        >
                          {preset.label}
                        </Button>
                      ))}
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-sm">
                        <span className="text-muted-foreground">Range:</span>
                        <span>{formatFileSize(filter.sizeMin)} - {formatFileSize(filter.sizeMax)}</span>
                      </div>
                      <Slider
                        value={customSizeRange}
                        onValueChange={(value) => {
                          setCustomSizeRange(value);
                          const [min, max] = value;
                          const actualMin = Math.pow(2, min);
                          const actualMax = max === 1000 ? Infinity : Math.pow(2, max);
                          updateFilter({ sizeMin: actualMin, sizeMax: actualMax });
                        }}
                        max={1000}
                        step={1}
                        className="mt-2"
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Date Filters */}
                <div>
                  <Label className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date Modified
                  </Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">After</Label>
                      <Input
                        type="date"
                        className="mt-1"
                        value={filter.dateModifiedAfter?.toISOString().split('T')[0] || ''}
                        onChange={(e) => updateFilter({
                          dateModifiedAfter: e.target.value ? new Date(e.target.value) : undefined
                        })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Before</Label>
                      <Input
                        type="date"
                        className="mt-1"
                        value={filter.dateModifiedBefore?.toISOString().split('T')[0] || ''}
                        onChange={(e) => updateFilter({
                          dateModifiedBefore: e.target.value ? new Date(e.target.value) : undefined
                        })}
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <Label className="flex items-center gap-2">
                    <Calendar className="w-4 h-4" />
                    Date Created
                  </Label>
                  <div className="grid grid-cols-2 gap-3 mt-2">
                    <div>
                      <Label className="text-xs text-muted-foreground">After</Label>
                      <Input
                        type="date"
                        className="mt-1"
                        value={filter.dateCreatedAfter?.toISOString().split('T')[0] || ''}
                        onChange={(e) => updateFilter({
                          dateCreatedAfter: e.target.value ? new Date(e.target.value) : undefined
                        })}
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-muted-foreground">Before</Label>
                      <Input
                        type="date"
                        className="mt-1"
                        value={filter.dateCreatedBefore?.toISOString().split('T')[0] || ''}
                        onChange={(e) => updateFilter({
                          dateCreatedBefore: e.target.value ? new Date(e.target.value) : undefined
                        })}
                      />
                    </div>
                  </div>
                </div>

                <Separator />

                {/* Custom Extensions */}
                <div>
                  <Label>Custom File Extensions</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="e.g., log, config, tmp"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          const value = e.currentTarget.value.trim();
                          if (value && !filter.extensions.includes(value)) {
                            updateFilter({ extensions: [...filter.extensions, value] });
                            e.currentTarget.value = '';
                          }
                        }
                      }}
                    />
                    <Button variant="outline" size="sm">
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                  {filter.extensions.length > 0 && (
                    <div className="flex flex-wrap gap-1 mt-2">
                      {filter.extensions.map((ext) => (
                        <Badge
                          key={ext}
                          variant="outline"
                          className="cursor-pointer hover:bg-red-500/20"
                          onClick={() => updateFilter({
                            extensions: filter.extensions.filter(e => e !== ext)
                          })}
                        >
                          .{ext}
                          <X className="w-2 h-2 ml-1" />
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            {/* Saved Searches Tab */}
            <TabsContent value="saved" className="space-y-4">
              <div className="space-y-3">
                {/* Save Current Search */}
                <div className="p-3 border rounded-lg">
                  <Label>Save Current Search</Label>
                  <div className="flex gap-2 mt-2">
                    <Input
                      placeholder="Search name..."
                      value={saveSearchName}
                      onChange={(e) => setSaveSearchName(e.target.value)}
                    />
                    <Button 
                      onClick={handleSaveSearch}
                      disabled={!saveSearchName.trim()}
                    >
                      <Save className="w-4 h-4 mr-2" />
                      Save
                    </Button>
                  </div>
                </div>

                {/* Saved Searches List */}
                {savedSearches.length > 0 ? (
                  <div>
                    <Label>Saved Searches</Label>
                    <div className="space-y-2 mt-2">
                      {savedSearches.map((search) => (
                        <div
                          key={search.id}
                          className="p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                          onClick={() => loadSavedSearch(search)}
                        >
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium">{search.name}</h4>
                            <Badge variant="outline" className="text-xs">
                              <Clock className="w-3 h-3 mr-1" />
                              {search.lastUsed.toLocaleDateString()}
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Query: "{search.filter.query}"
                          </p>
                          {search.filter.fileTypes.length > 0 && (
                            <p className="text-xs text-muted-foreground">
                              Types: {search.filter.fileTypes.slice(0, 3).join(', ')}
                              {search.filter.fileTypes.length > 3 && ` +${search.filter.fileTypes.length - 3} more`}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <Sparkles className="w-8 h-8 mx-auto mb-2" />
                    <p>No saved searches yet</p>
                    <p className="text-sm">Save your frequent searches for quick access</p>
                  </div>
                )}
              </div>
            </TabsContent>

            {/* Options Tab */}
            <TabsContent value="options" className="space-y-4">
              <div className="space-y-4">
                <div className="space-y-3">
                  <Label className="flex items-center gap-2">
                    <Settings className="w-4 h-4" />
                    Search Options
                  </Label>

                  <div className="space-y-3">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="search-content"
                        checked={filter.searchContent}
                        onCheckedChange={(checked) => updateFilter({ searchContent: !!checked })}
                      />
                      <Label htmlFor="search-content" className="text-sm">
                        Search inside file contents
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="include-hidden"
                        checked={filter.includeHidden}
                        onCheckedChange={(checked) => updateFilter({ includeHidden: !!checked })}
                      />
                      <Label htmlFor="include-hidden" className="text-sm">
                        Include hidden files and folders
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="case-sensitive"
                        checked={filter.caseSensitive}
                        onCheckedChange={(checked) => updateFilter({ caseSensitive: !!checked })}
                      />
                      <Label htmlFor="case-sensitive" className="text-sm">
                        Case sensitive search
                      </Label>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="use-regex"
                        checked={filter.useRegex}
                        onCheckedChange={(checked) => updateFilter({ useRegex: !!checked })}
                      />
                      <Label htmlFor="use-regex" className="text-sm">
                        Use regular expressions
                      </Label>
                    </div>
                  </div>
                </div>

                <Separator />

                <div>
                  <Label>Search Performance</Label>
                  <div className="text-sm text-muted-foreground mt-1">
                    <p>• Content search may be slower for large files</p>
                    <p>• Regular expressions provide powerful pattern matching</p>
                    <p>• Including hidden files increases search scope</p>
                  </div>
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        {/* Action Buttons */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Filter className="w-4 h-4" />
            {filter.fileTypes.length > 0 && `${filter.fileTypes.length} file types`}
            {filter.sizeMin > 0 || filter.sizeMax < Infinity && ', size filter'}
            {(filter.dateModifiedAfter || filter.dateModifiedBefore) && ', date filter'}
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSearch}>
              <Search className="w-4 h-4 mr-2" />
              Search
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
