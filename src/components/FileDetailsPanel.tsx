import React, { useState, useEffect } from 'react';
import { 
  X, 
  File, 
  Folder, 
  Calendar, 
  HardDrive, 
  FileText, 
  User, 
  Shield,
  Clock,
  Star,
  Tag,
  FileImage,
  FileCode,
  FileVideo,
  FileAudio,
  Archive,
  ZoomIn,
  Download,
  Copy,
  Eye,
  GitCommit,
  GitBranch,
  Hash,
  Activity,
  Edit,
  Trash2,
  Share,
  ExternalLink,
  FileCheck,
  Info,
  Heart,
  Bookmark,
  MoreHorizontal,
  PlayCircle,
  Pause,
  Volume2,
  VolumeX
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ImageWithFallback } from './figma/ImageWithFallback';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Progress } from './ui/progress';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';

interface FileItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  size?: string;
  modified: string;
  status?: 'modified' | 'added' | 'deleted' | 'staged' | 'clean';
  starred?: boolean;
  fileType?: string;
  path?: string;
  created?: string;
  permissions?: string;
  owner?: string;
  content?: string;
  previewUrl?: string;
  tags?: string[];
  description?: string;
  checksum?: string;
  encoding?: string;
  lineCount?: number;
  wordCount?: number;
  language?: string;
  lastAccessed?: string;
  isEncrypted?: boolean;
  isExecutable?: boolean;
}

interface FileDetailsPanelProps {
  isDark: boolean;
  file: FileItem | null;
  vcsFile?: any; // VCS file data for diff
  selectedVCSFile?: any; // For backward compatibility
  onClose: () => void;
  showVersionControl?: boolean;
  onStageFile?: (path: string) => void;
  onUnstageFile?: (path: string) => void;
  onDiscardChanges?: (path: string) => void;
  onFileAction?: (action: string, file: FileItem) => void;
  onTagAdd?: (file: FileItem, tag: string) => void;
  onTagRemove?: (file: FileItem, tag: string) => void;
}

const getFileIcon = (item: FileItem) => {
  if (item.type === 'folder') return <Folder className="w-8 h-8" />;
  
  const extension = item.fileType || item.name.split('.').pop()?.toLowerCase();
  
  switch (extension) {
    case 'tsx':
    case 'ts':
    case 'js':
    case 'jsx':
    case 'vue':
    case 'py':
    case 'java':
    case 'cpp':
    case 'c':
    case 'go':
    case 'rs':
      return <FileCode className="w-8 h-8" />;
    case 'png':
    case 'jpg':
    case 'jpeg':
    case 'gif':
    case 'svg':
    case 'webp':
      return <FileImage className="w-8 h-8" />;
    case 'mp4':
    case 'mov':
    case 'avi':
    case 'mkv':
      return <FileVideo className="w-8 h-8" />;
    case 'mp3':
    case 'wav':
    case 'flac':
    case 'ogg':
      return <FileAudio className="w-8 h-8" />;
    case 'zip':
    case 'rar':
    case 'tar':
    case 'gz':
      return <Archive className="w-8 h-8" />;
    case 'md':
    case 'txt':
    case 'json':
    case 'xml':
    case 'yaml':
    case 'yml':
      return <FileText className="w-8 h-8" />;
    default:
      return <File className="w-8 h-8" />;
  }
};

const getStatusColor = (status?: string) => {
  switch (status) {
    case 'modified': return 'bg-white/20 text-white/80 border-white/30';
    case 'added': return 'bg-white/15 text-white/70 border-white/25';
    case 'deleted': return 'bg-white/10 text-white/60 border-white/20';
    case 'staged': return 'bg-white/25 text-white/90 border-white/35';
    default: return 'bg-white/10 text-white/50 border-white/15';
  }
};

export function FileDetailsPanel({ 
  isDark, 
  file, 
  vcsFile, 
  selectedVCSFile, 
  onClose, 
  showVersionControl = false,
  onStageFile,
  onUnstageFile,
  onDiscardChanges,
  onFileAction,
  onTagAdd,
  onTagRemove
}: FileDetailsPanelProps) {
  const [activeTab, setActiveTab] = useState('preview');
  const [isStarred, setIsStarred] = useState(false);
  const [tags, setTags] = useState<string[]>([]);
  const [showFullPath, setShowFullPath] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(75);
  
  useEffect(() => {
    if (file) {
      setIsStarred(file.starred || false);
      setTags(file.tags || []);
    }
  }, [file]);
  
  if (!file) return null;
  
  const selectedFile = file; // For backward compatibility
  const currentVCSFile = vcsFile || selectedVCSFile; // Support both prop names

  const isImage = selectedFile.fileType && ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp', 'bmp', 'tiff'].includes(selectedFile.fileType);
  const isVideo = selectedFile.fileType && ['mp4', 'mov', 'avi', 'mkv', 'webm', 'flv', 'm4v'].includes(selectedFile.fileType);
  const isAudio = selectedFile.fileType && ['mp3', 'wav', 'flac', 'ogg', 'aac', 'm4a', 'wma'].includes(selectedFile.fileType);
  const isCode = selectedFile.fileType && ['tsx', 'ts', 'js', 'jsx', 'vue', 'py', 'java', 'cpp', 'c', 'go', 'rs', 'html', 'css', 'scss', 'php', 'rb', 'swift', 'kt', 'dart'].includes(selectedFile.fileType);
  const isText = selectedFile.fileType && ['txt', 'md', 'json', 'xml', 'yaml', 'yml', 'csv', 'log', 'ini', 'conf'].includes(selectedFile.fileType);
  const isArchive = selectedFile.fileType && ['zip', 'rar', 'tar', 'gz', '7z', 'bz2', 'xz'].includes(selectedFile.fileType);
  const isPDF = selectedFile.fileType === 'pdf';
  const isDocument = selectedFile.fileType && ['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'odt', 'ods', 'odp'].includes(selectedFile.fileType);

  // Enhanced file size formatting
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  // Get file type specific info
  const getFileTypeInfo = () => {
    if (isImage) return { category: 'Image', color: 'text-blue-400', bgColor: 'bg-blue-500/10' };
    if (isVideo) return { category: 'Video', color: 'text-purple-400', bgColor: 'bg-purple-500/10' };
    if (isAudio) return { category: 'Audio', color: 'text-green-400', bgColor: 'bg-green-500/10' };
    if (isCode) return { category: 'Code', color: 'text-orange-400', bgColor: 'bg-orange-500/10' };
    if (isText) return { category: 'Text', color: 'text-gray-400', bgColor: 'bg-gray-500/10' };
    if (isArchive) return { category: 'Archive', color: 'text-red-400', bgColor: 'bg-red-500/10' };
    if (isPDF) return { category: 'PDF', color: 'text-red-400', bgColor: 'bg-red-500/10' };
    if (isDocument) return { category: 'Document', color: 'text-blue-400', bgColor: 'bg-blue-500/10' };
    return { category: 'File', color: 'text-gray-400', bgColor: 'bg-gray-500/10' };
  };

  const fileTypeInfo = getFileTypeInfo();

  // Enhanced actions handler
  const handleFileAction = (action: string) => {
    if (onFileAction) {
      onFileAction(action, selectedFile);
    }
    
    // Local state updates
    if (action === 'star' || action === 'unstar') {
      setIsStarred(!isStarred);
    }
  };

  // Tag management
  const addTag = (tag: string) => {
    if (!tags.includes(tag)) {
      const newTags = [...tags, tag];
      setTags(newTags);
      if (onTagAdd) onTagAdd(selectedFile, tag);
    }
  };

  const removeTag = (tag: string) => {
    const newTags = tags.filter(t => t !== tag);
    setTags(newTags);
    if (onTagRemove) onTagRemove(selectedFile, tag);
  };

  // Mock content for demonstration
  const getMockContent = () => {
    if (isCode) {
      return `import React, { useState } from 'react';
import { Button } from './ui/button';

interface Props {
  title: string;
  onClick: () => void;
}

export function MyComponent({ title, onClick }: Props) {
  const [isActive, setIsActive] = useState(false);
  
  return (
    <div className="p-4">
      <h2 className="text-lg font-medium">{title}</h2>
      <Button 
        onClick={() => {
          setIsActive(!isActive);
          onClick();
        }}
        variant={isActive ? "default" : "outline"}
      >
        {isActive ? "Active" : "Inactive"}
      </Button>
    </div>
  );
}`;
    } else if (isText) {
      return `# Nordic Explorer

A modern file explorer application with glassmorphism design.

## Features

- File browsing with tree, grid, and list views
- Version control integration
- Beautiful Nordic-inspired UI
- Real-time file operations

## Usage

Navigate through your files using the sidebar navigation.
Use the search functionality to quickly find files.

## Tech Stack

- React + TypeScript
- Tailwind CSS
- Lucide Icons`;
    }
    return '';
  };

  const getPreviewUrl = () => {
    if (selectedFile.name.includes('vacation') || selectedFile.name.includes('image') || selectedFile.name.includes('hero')) {
      return "https://images.unsplash.com/photo-1635148040718-acf281233b8e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMGxhbmRzY2FwZSUyMG5hdHVyZXxlbnwxfHx8fDE3NTY0ODA3NDd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral";
    }
    return selectedFile.previewUrl;
  };

  return (
    <TooltipProvider>
      <div className={`w-full h-full ${isDark ? 'glass-panel-dark' : 'glass-panel-light'} border-l ${isDark ? 'border-white/10' : 'border-black/10'} flex flex-col`}>
        {/* Enhanced Header */}
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <h3 className="font-medium">File Details</h3>
              <Badge variant="outline" className={`text-xs ${fileTypeInfo.color} ${fileTypeInfo.bgColor}`}>
                {fileTypeInfo.category}
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                    <MoreHorizontal className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={() => handleFileAction('open')}>
                    <Eye className="w-4 h-4 mr-2" />
                    Open
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleFileAction('edit')}>
                    <Edit className="w-4 h-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleFileAction('copy')}>
                    <Copy className="w-4 h-4 mr-2" />
                    Copy
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleFileAction('share')}>
                    <Share className="w-4 h-4 mr-2" />
                    Share
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => handleFileAction('delete')} className="text-red-400">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onClose}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
          
          {/* Enhanced File Icon and Name */}
          <div className="flex items-center gap-3 mb-3">
            <div className={`p-3 rounded-lg ${isDark ? 'bg-white/5' : 'bg-black/5'} relative`}>
              {getFileIcon(selectedFile)}
              {selectedFile.isEncrypted && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-500 rounded-full flex items-center justify-center">
                  <Shield className="w-2 h-2 text-black" />
                </div>
              )}
              {selectedFile.isExecutable && (
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full flex items-center justify-center">
                  <PlayCircle className="w-2 h-2 text-black" />
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <h4 className="font-medium text-sm truncate">{selectedFile.name}</h4>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button 
                      variant="ghost" 
                      size="sm" 
                      className="h-4 w-4 p-0" 
                      onClick={() => handleFileAction(isStarred ? 'unstar' : 'star')}
                    >
                      <Star className={`w-3 h-3 ${isStarred ? 'text-yellow-400 fill-yellow-400' : 'text-muted-foreground'}`} />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>
                    {isStarred ? 'Remove from favorites' : 'Add to favorites'}
                  </TooltipContent>
                </Tooltip>
              </div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span className="capitalize">{selectedFile.type}</span>
                {selectedFile.size && (
                  <>
                    <span>•</span>
                    <span>{selectedFile.size}</span>
                  </>
                )}
                {selectedFile.language && (
                  <>
                    <span>•</span>
                    <span>{selectedFile.language}</span>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* File Description */}
          {selectedFile.description && (
            <div className="mb-3 p-2 rounded-md bg-white/5 text-xs text-muted-foreground">
              {selectedFile.description}
            </div>
          )}

          {/* Tags */}
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-3">
              {tags.map((tag, index) => (
                <Badge 
                  key={index} 
                  variant="secondary" 
                  className="text-xs px-2 py-0 h-5 cursor-pointer hover:bg-red-500/20"
                  onClick={() => removeTag(tag)}
                >
                  {tag}
                  <X className="w-2 h-2 ml-1" />
                </Badge>
              ))}
            </div>
          )}

          {/* Version Control Status */}
          {showVersionControl && selectedFile.status && selectedFile.status !== 'clean' && (
            <Badge variant="outline" className={`mb-3 ${getStatusColor(selectedFile.status)}`}>
              <GitCommit className="w-3 h-3 mr-1" />
              {selectedFile.status.charAt(0).toUpperCase() + selectedFile.status.slice(1)}
            </Badge>
          )}
        </div>

        {/* Content Tabs */}
        <div className="flex-1 flex flex-col">
          <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
            <TabsList className={`grid w-full ${
              showVersionControl && currentVCSFile && currentVCSFile.status !== 'clean' 
                ? (isImage || isVideo || isAudio || isCode || isText ? 'grid-cols-4' : 'grid-cols-2')
                : (isImage || isVideo || isAudio || isCode || isText ? 'grid-cols-3' : 'grid-cols-2')
            } mx-4 mt-2`}>
              {(isImage || isVideo || isAudio || isCode || isText) && (
                <TabsTrigger value="preview" className="text-xs">Preview</TabsTrigger>
              )}
              <TabsTrigger value="details" className="text-xs">Details</TabsTrigger>
              <TabsTrigger value="activity" className="text-xs">Activity</TabsTrigger>
              {showVersionControl && currentVCSFile && currentVCSFile.status !== 'clean' && (
                <TabsTrigger value="diff" className="text-xs">Changes</TabsTrigger>
              )}
            </TabsList>

            {/* Enhanced Preview Tab */}
            {(isImage || isVideo || isAudio || isCode || isText) && (
              <TabsContent value="preview" className="flex-1 m-0">
                <ScrollArea className="h-full">
                  <div className="p-4">
                    {/* Image Preview */}
                    {isImage && (
                      <div className="space-y-3">
                        <div className={`relative rounded-lg overflow-hidden ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
                          <ImageWithFallback
                            src={getPreviewUrl() || "https://images.unsplash.com/photo-1635148040718-acf281233b8e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMGxhbmRzY2FwZSUyMG5hdHVyZXxlbnwxfHx8fDE3NTY0ODA3NDd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"}
                            alt={selectedFile.name}
                            className="w-full h-48 object-cover"
                          />
                          <div className="absolute top-2 right-2 flex gap-1">
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="secondary" size="sm" className="h-6 w-6 p-0">
                                  <ZoomIn className="w-3 h-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Zoom to full size</TooltipContent>
                            </Tooltip>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <Button variant="secondary" size="sm" className="h-6 w-6 p-0">
                                  <ExternalLink className="w-3 h-3" />
                                </Button>
                              </TooltipTrigger>
                              <TooltipContent>Open externally</TooltipContent>
                            </Tooltip>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Dimensions:</span>
                              <span>1920 × 1080</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Color Space:</span>
                              <span>sRGB</span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">DPI:</span>
                              <span>72</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Bit Depth:</span>
                              <span>24-bit</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Video Preview */}
                    {isVideo && (
                      <div className="space-y-3">
                        <div className={`relative rounded-lg overflow-hidden ${isDark ? 'bg-white/5' : 'bg-black/5'} aspect-video`}>
                          <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                            <div className="text-center">
                              <FileVideo className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                              <p className="text-sm text-muted-foreground">Video Preview</p>
                              <p className="text-xs text-muted-foreground mt-1">{selectedFile.name}</p>
                            </div>
                          </div>
                          <div className="absolute bottom-2 left-2 right-2 flex items-center gap-2">
                            <Button variant="secondary" size="sm" className="flex-1">
                              <PlayCircle className="w-4 h-4 mr-2" />
                              Play
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Duration:</span>
                              <span>02:34</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Resolution:</span>
                              <span>1920x1080</span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Framerate:</span>
                              <span>30 fps</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Codec:</span>
                              <span>H.264</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Audio Preview */}
                    {isAudio && (
                      <div className="space-y-3">
                        <div className={`rounded-lg p-4 ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
                          <div className="text-center mb-4">
                            <FileAudio className="w-12 h-12 mx-auto mb-2 text-muted-foreground" />
                            <p className="text-sm font-medium">{selectedFile.name}</p>
                          </div>
                          <div className="flex items-center gap-3">
                            <Button 
                              variant="secondary" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={() => setIsPlaying(!isPlaying)}
                            >
                              {isPlaying ? <Pause className="w-4 h-4" /> : <PlayCircle className="w-4 h-4" />}
                            </Button>
                            <div className="flex-1">
                              <Progress value={33} className="h-2" />
                              <div className="flex justify-between text-xs text-muted-foreground mt-1">
                                <span>1:23</span>
                                <span>3:45</span>
                              </div>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              className="h-8 w-8 p-0"
                              onClick={() => setVolume(volume > 0 ? 0 : 75)}
                            >
                              {volume > 0 ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                            </Button>
                          </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Duration:</span>
                              <span>03:45</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Bitrate:</span>
                              <span>320 kbps</span>
                            </div>
                          </div>
                          <div className="space-y-1">
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Sample Rate:</span>
                              <span>44.1 kHz</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-muted-foreground">Channels:</span>
                              <span>Stereo</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Code/Text Preview */}
                    {(isCode || isText) && (
                      <div className="space-y-3">
                        <div className={`rounded-lg overflow-hidden border ${isDark ? 'border-white/10 bg-black/20' : 'border-black/10 bg-white/50'}`}>
                          <div className={`px-3 py-2 border-b ${isDark ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5'} flex items-center justify-between`}>
                            <div className="flex items-center gap-2">
                              <span className="text-xs text-muted-foreground font-mono">{selectedFile.name}</span>
                              {selectedFile.language && (
                                <Badge variant="outline" className="text-xs h-4">
                                  {selectedFile.language}
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-1">
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                                    <Copy className="w-3 h-3" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Copy to clipboard</TooltipContent>
                              </Tooltip>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                                    <ExternalLink className="w-3 h-3" />
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>Open in editor</TooltipContent>
                              </Tooltip>
                            </div>
                          </div>
                          <ScrollArea className="h-64">
                            <pre className="p-3 text-xs font-mono leading-relaxed">
                              <code>{getMockContent()}</code>
                            </pre>
                          </ScrollArea>
                        </div>
                        <div className="flex items-center justify-between text-xs text-muted-foreground">
                          <div className="flex items-center gap-4">
                            {isCode && selectedFile.lineCount && (
                              <span>{selectedFile.lineCount} lines</span>
                            )}
                            {isText && selectedFile.wordCount && (
                              <span>{selectedFile.wordCount} words</span>
                            )}
                            {selectedFile.encoding && (
                              <span>{selectedFile.encoding}</span>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <FileCheck className="w-3 h-3" />
                            <span>UTF-8</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </TabsContent>
            )}

            {/* Activity Tab - New */}
            <TabsContent value="activity" className="flex-1 m-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Activity className="w-4 h-4 text-blue-400" />
                      <span className="font-medium">Recent Activity</span>
                    </div>
                    
                    {/* Activity Timeline */}
                    <div className="space-y-3">
                      <div className="flex items-start gap-3 text-sm">
                        <div className="w-2 h-2 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">File created</span>
                            <span className="text-xs text-muted-foreground">2 hours ago</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Initial version of {selectedFile.name} created by {selectedFile.owner || 'john.doe'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 text-sm">
                        <div className="w-2 h-2 bg-blue-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">Modified</span>
                            <span className="text-xs text-muted-foreground">1 hour ago</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Content updated with new features
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-start gap-3 text-sm">
                        <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2 flex-shrink-0"></div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="font-medium">Accessed</span>
                            <span className="text-xs text-muted-foreground">30 minutes ago</span>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            File opened for reading
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <Separator className={`${isDark ? 'bg-white/10' : 'bg-black/10'}`} />

                  {/* File Statistics */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <Info className="w-4 h-4 text-muted-foreground" />
                      <span className="font-medium">Statistics</span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Times opened:</span>
                          <span>23</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Total edits:</span>
                          <span>8</span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Last backup:</span>
                          <span className="text-xs">12:30 PM</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Sync status:</span>
                          <Badge variant="outline" className="h-4 text-xs text-green-400">
                            Synced
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Security Information */}
                  {(selectedFile.isEncrypted || selectedFile.checksum) && (
                    <>
                      <Separator className={`${isDark ? 'bg-white/10' : 'bg-black/10'}`} />
                      <div className="space-y-3">
                        <div className="flex items-center gap-2 text-sm">
                          <Shield className="w-4 h-4 text-green-400" />
                          <span className="font-medium">Security</span>
                        </div>
                        <div className="space-y-2 text-sm">
                          {selectedFile.isEncrypted && (
                            <div className="flex items-center justify-between">
                              <span className="text-muted-foreground">Encryption:</span>
                              <Badge variant="outline" className="h-4 text-xs text-green-400">
                                AES-256
                              </Badge>
                            </div>
                          )}
                          {selectedFile.checksum && (
                            <div className="space-y-1">
                              <span className="text-muted-foreground">Checksum (SHA-256):</span>
                              <p className="font-mono text-xs break-all text-muted-foreground">
                                {selectedFile.checksum || 'a7f2c4d9e8b1c3f6h5j9k2l4m8n7p3q5r1s6t9u2v7w4x1y8z3a6b9c2d5e8f1g4h7'}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
            {/* Enhanced Diff Tab */}
            {showVersionControl && currentVCSFile && currentVCSFile.status !== 'clean' && (
              <TabsContent value="diff" className="flex-1 m-0">
                <ScrollArea className="h-full">
                  <div className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center gap-2 text-sm">
                        <GitBranch className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Changes in:</span>
                        <span className="font-mono text-xs">{selectedFile?.name}</span>
                        <Badge variant="outline" className={`text-xs ${getStatusColor(currentVCSFile.status)}`}>
                          {currentVCSFile.status}
                        </Badge>
                      </div>
                      
                      <div className={`rounded-lg overflow-hidden border ${isDark ? 'border-white/10 bg-black/20' : 'border-black/10 bg-white/50'}`}>
                        <div className={`px-3 py-2 border-b ${isDark ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5'} flex items-center justify-between`}>
                          <span className="text-xs text-muted-foreground">File Changes</span>
                          <div className="flex items-center gap-2">
                            <div className="flex items-center gap-1 text-xs">
                              <div className="w-2 h-2 bg-green-400 rounded-sm"></div>
                              <span className="text-green-400">+3</span>
                            </div>
                            <div className="flex items-center gap-1 text-xs">
                              <div className="w-2 h-2 bg-red-400 rounded-sm"></div>
                              <span className="text-red-400">-3</span>
                            </div>
                          </div>
                        </div>
                        <ScrollArea className="h-80">
                          <div className="font-mono text-xs">
                            {/* Enhanced diff content with line numbers */}
                            <div className="flex">
                              <div className="bg-red-500/10 border-l-2 border-red-500/50 px-3 py-1 flex-1">
                                <span className="text-red-400 mr-4 text-muted-foreground">-1</span>
                                <span className="text-red-400">- const oldFunction = () =&gt; &#123;</span>
                              </div>
                            </div>
                            <div className="flex">
                              <div className="bg-red-500/10 border-l-2 border-red-500/50 px-3 py-1 flex-1">
                                <span className="text-red-400 mr-4 text-muted-foreground">-2</span>
                                <span className="text-red-400">-   return 'old implementation';</span>
                              </div>
                            </div>
                            <div className="flex">
                              <div className="bg-red-500/10 border-l-2 border-red-500/50 px-3 py-1 flex-1">
                                <span className="text-red-400 mr-4 text-muted-foreground">-3</span>
                                <span className="text-red-400">- &#125;</span>
                              </div>
                            </div>
                            <div className="flex">
                              <div className="bg-green-500/10 border-l-2 border-green-500/50 px-3 py-1 flex-1">
                                <span className="text-green-400 mr-4 text-muted-foreground">+1</span>
                                <span className="text-green-400">+ const newFunction = () =&gt; &#123;</span>
                              </div>
                            </div>
                            <div className="flex">
                              <div className="bg-green-500/10 border-l-2 border-green-500/50 px-3 py-1 flex-1">
                                <span className="text-green-400 mr-4 text-muted-foreground">+2</span>
                                <span className="text-green-400">+   return 'improved implementation';</span>
                              </div>
                            </div>
                            <div className="flex">
                              <div className="bg-green-500/10 border-l-2 border-green-500/50 px-3 py-1 flex-1">
                                <span className="text-green-400 mr-4 text-muted-foreground">+3</span>
                                <span className="text-green-400">+ &#125;</span>
                              </div>
                            </div>
                            <div className="flex">
                              <div className="px-3 py-1 flex-1">
                                <span className="text-muted-foreground mr-4">4</span>
                                <span className="text-muted-foreground">  // Unchanged code</span>
                              </div>
                            </div>
                            <div className="flex">
                              <div className="px-3 py-1 flex-1">
                                <span className="text-muted-foreground mr-4">5</span>
                                <span className="text-muted-foreground">  const utils = require('./utils');</span>
                              </div>
                            </div>
                          </div>
                        </ScrollArea>
                      </div>
                      
                      {/* VCS Actions */}
                      {(onStageFile || onUnstageFile || onDiscardChanges) && (
                        <div className="flex gap-2">
                          {onStageFile && currentVCSFile.status !== 'staged' && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-xs"
                              onClick={() => onStageFile(selectedFile.path || selectedFile.name)}
                            >
                              <GitCommit className="w-3 h-3 mr-1" />
                              Stage
                            </Button>
                          )}
                          {onUnstageFile && currentVCSFile.status === 'staged' && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-xs"
                              onClick={() => onUnstageFile(selectedFile.path || selectedFile.name)}
                            >
                              <GitCommit className="w-3 h-3 mr-1" />
                              Unstage
                            </Button>
                          )}
                          {onDiscardChanges && currentVCSFile.status !== 'staged' && (
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="text-xs text-red-400 hover:bg-red-500/10"
                              onClick={() => onDiscardChanges(selectedFile.path || selectedFile.name)}
                            >
                              <Trash2 className="w-3 h-3 mr-1" />
                              Discard
                            </Button>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </ScrollArea>
              </TabsContent>
            )}

            {/* Enhanced Details Tab */}
            <TabsContent value="details" className="flex-1 m-0">
              <ScrollArea className="h-full">
                <div className="p-4 space-y-4">
                  {/* Basic Properties */}
                  <div>
                    <h5 className="text-sm font-medium mb-3 text-muted-foreground flex items-center gap-2">
                      <Info className="w-4 h-4" />
                      Properties
                    </h5>
                    <div className="space-y-3">
                      {selectedFile.size && (
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <HardDrive className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Size:</span>
                          </div>
                          <span>{selectedFile.size}</span>
                        </div>
                      )}
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Modified:</span>
                        </div>
                        <span>{selectedFile.modified}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Created:</span>
                        </div>
                        <span>{selectedFile.created || 'Jan 15, 2025'}</span>
                      </div>
                      {selectedFile.lastAccessed && (
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Eye className="w-4 h-4 text-muted-foreground" />
                            <span className="text-muted-foreground">Last accessed:</span>
                          </div>
                          <span>{selectedFile.lastAccessed}</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator className={`${isDark ? 'bg-white/10' : 'bg-black/10'}`} />

                  {/* Location */}
                  <div>
                    <h5 className="text-sm font-medium mb-3 text-muted-foreground flex items-center gap-2">
                      <Folder className="w-4 h-4" />
                      Location
                    </h5>
                    <div className="space-y-2">
                      <div className="text-sm">
                        <span className="text-muted-foreground">Path:</span>
                        <div className="mt-1 p-2 rounded-md bg-white/5 border border-white/10">
                          <p className="font-mono text-xs break-all cursor-pointer" onClick={() => setShowFullPath(!showFullPath)}>
                            {showFullPath 
                              ? (selectedFile.path || `/home/projects/nordic-explorer/${selectedFile.name}`)
                              : `.../${selectedFile.name}`
                            }
                          </p>
                        </div>
                      </div>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 text-xs"
                        onClick={() => handleFileAction('reveal')}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Reveal in Finder
                      </Button>
                    </div>
                  </div>

                  <Separator className={`${isDark ? 'bg-white/10' : 'bg-black/10'}`} />

                  {/* Security & Permissions */}
                  <div>
                    <h5 className="text-sm font-medium mb-3 text-muted-foreground flex items-center gap-2">
                      <Shield className="w-4 h-4" />
                      Security & Permissions
                    </h5>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Owner:</span>
                        </div>
                        <span>{selectedFile.owner || 'john.doe'}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Permissions:</span>
                        </div>
                        <span className="font-mono text-xs">{selectedFile.permissions || '-rw-r--r--'}</span>
                      </div>
                      {selectedFile.isEncrypted && (
                        <div className="flex items-center justify-between text-sm">
                          <div className="flex items-center gap-2">
                            <Shield className="w-4 h-4 text-green-400" />
                            <span className="text-muted-foreground">Encryption:</span>
                          </div>
                          <Badge variant="outline" className="h-4 text-xs text-green-400">
                            Encrypted
                          </Badge>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Version Control Info */}
                  {showVersionControl && (
                    <>
                      <Separator className={`${isDark ? 'bg-white/10' : 'bg-black/10'}`} />
                      <div>
                        <h5 className="text-sm font-medium mb-3 text-muted-foreground flex items-center gap-2">
                          <GitBranch className="w-4 h-4" />
                          Version Control
                        </h5>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <Tag className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Branch:</span>
                            </div>
                            <span>main</span>
                          </div>
                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center gap-2">
                              <Clock className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground">Last commit:</span>
                            </div>
                            <span>2 hours ago</span>
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <Hash className="w-4 h-4 text-muted-foreground" />
                              <span className="text-muted-foreground text-sm">Commit hash:</span>
                            </div>
                            <p className="font-mono text-xs text-muted-foreground pl-6">a7f2c4d</p>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* File Type Specific Info */}
                  {selectedFile.type === 'file' && (
                    <>
                      <Separator className={`${isDark ? 'bg-white/10' : 'bg-black/10'}`} />
                      <div>
                        <h5 className="text-sm font-medium mb-3 text-muted-foreground flex items-center gap-2">
                          <FileText className="w-4 h-4" />
                          File Information
                        </h5>
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-sm">
                            <span className="text-muted-foreground">Type:</span>
                            <Badge variant="outline" className="h-4 text-xs">
                              {selectedFile.fileType?.toUpperCase() || 'Unknown'}
                            </Badge>
                          </div>
                          {selectedFile.encoding && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Encoding:</span>
                              <span>{selectedFile.encoding}</span>
                            </div>
                          )}
                          {selectedFile.language && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Language:</span>
                              <span>{selectedFile.language}</span>
                            </div>
                          )}
                          {isCode && selectedFile.lineCount && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Lines:</span>
                              <span>{selectedFile.lineCount.toLocaleString()}</span>
                            </div>
                          )}
                          {isText && selectedFile.wordCount && (
                            <div className="flex items-center justify-between text-sm">
                              <span className="text-muted-foreground">Words:</span>
                              <span>{selectedFile.wordCount.toLocaleString()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Custom Tags Section */}
                  <Separator className={`${isDark ? 'bg-white/10' : 'bg-black/10'}`} />
                  <div>
                    <h5 className="text-sm font-medium mb-3 text-muted-foreground flex items-center gap-2">
                      <Tag className="w-4 h-4" />
                      Tags & Labels
                    </h5>
                    <div className="space-y-2">
                      {tags.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {tags.map((tag, index) => (
                            <Badge 
                              key={index} 
                              variant="secondary" 
                              className="text-xs px-2 py-0 h-5 cursor-pointer hover:bg-red-500/20"
                              onClick={() => removeTag(tag)}
                            >
                              {tag}
                              <X className="w-2 h-2 ml-1" />
                            </Badge>
                          ))}
                        </div>
                      ) : (
                        <p className="text-xs text-muted-foreground">No tags assigned</p>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-6 text-xs"
                        onClick={() => addTag('important')}
                      >
                        <Tag className="w-3 h-3 mr-1" />
                        Add Tag
                      </Button>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {/* Enhanced Actions */}
        <div className="p-4 border-t border-white/10 space-y-3">
          {/* Primary Actions */}
          <div className="grid grid-cols-2 gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  className="h-8 text-xs"
                  onClick={() => handleFileAction('open')}
                >
                  <Eye className="w-3 h-3 mr-1" />
                  Open
                </Button>
              </TooltipTrigger>
              <TooltipContent>Open with default application</TooltipContent>
            </Tooltip>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  className="h-8 text-xs"
                  onClick={() => handleFileAction('download')}
                >
                  <Download className="w-3 h-3 mr-1" />
                  Save
                </Button>
              </TooltipTrigger>
              <TooltipContent>Download a copy</TooltipContent>
            </Tooltip>
          </div>
          
          {/* Secondary Actions */}
          <div className="flex gap-2">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-7 text-xs flex-1"
                  onClick={() => handleFileAction(isStarred ? 'unstar' : 'star')}
                >
                  <Star className={`w-3 h-3 mr-1 ${isStarred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                  {isStarred ? 'Starred' : 'Star'}
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                {isStarred ? 'Remove from favorites' : 'Add to favorites'}
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => handleFileAction('share')}
                >
                  <Share className="w-3 h-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Share file</TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="h-7 text-xs"
                  onClick={() => handleFileAction('copy')}
                >
                  <Copy className="w-3 h-3" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy file path</TooltipContent>
            </Tooltip>
          </div>
        </div>
      </div>
    </TooltipProvider>
  );
}