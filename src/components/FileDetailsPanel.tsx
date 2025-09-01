import React, { useState } from 'react';
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
  GitBranch
} from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';
import { ScrollArea } from './ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { ImageWithFallback } from './figma/ImageWithFallback';

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
  onDiscardChanges
}: FileDetailsPanelProps) {
  const [activeTab, setActiveTab] = useState('preview');
  
  if (!file) return null;
  
  const selectedFile = file; // For backward compatibility
  const currentVCSFile = vcsFile || selectedVCSFile; // Support both prop names

  const isImage = selectedFile.fileType && ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(selectedFile.fileType);
  const isCode = selectedFile.fileType && ['tsx', 'ts', 'js', 'jsx', 'vue', 'py', 'java', 'cpp', 'c', 'go', 'rs', 'html', 'css', 'scss'].includes(selectedFile.fileType);
  const isText = selectedFile.fileType && ['txt', 'md', 'json', 'xml', 'yaml', 'yml'].includes(selectedFile.fileType);

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
    <div className={`w-full h-full ${isDark ? 'glass-panel-dark' : 'glass-panel-light'} border-l ${isDark ? 'border-white/10' : 'border-black/10'} flex flex-col`}>
      {/* Header */}
      <div className="p-4 border-b border-white/10">
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-medium">File Details</h3>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={onClose}>
            <X className="w-4 h-4" />
          </Button>
        </div>
        
        {/* File Icon and Name */}
        <div className="flex items-center gap-3 mb-3">
          <div className={`p-3 rounded-lg ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
            {getFileIcon(selectedFile)}
          </div>
          <div className="flex-1 min-w-0">
            <h4 className="font-medium text-sm truncate">{selectedFile.name}</h4>
            <p className="text-xs text-muted-foreground capitalize">{selectedFile.type}</p>
          </div>
          {selectedFile.starred && (
            <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
          )}
        </div>

        {/* Version Control Status */}
        {showVersionControl && selectedFile.status && selectedFile.status !== 'clean' && (
          <Badge variant="outline" className={`mb-3 ${getStatusColor(selectedFile.status)}`}>
            {selectedFile.status.charAt(0).toUpperCase() + selectedFile.status.slice(1)}
          </Badge>
        )}
      </div>

      {/* Content Tabs */}
      <div className="flex-1 flex flex-col">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
          <TabsList className={`grid w-full ${
            showVersionControl && currentVCSFile && currentVCSFile.status !== 'clean' 
              ? (isImage || isCode || isText ? 'grid-cols-3' : 'grid-cols-2')
              : (isImage || isCode || isText ? 'grid-cols-2' : 'grid-cols-1')
          } mx-4 mt-2`}>
            {(isImage || isCode || isText) && (
              <TabsTrigger value="preview" className="text-xs">Preview</TabsTrigger>
            )}
            <TabsTrigger value="details" className="text-xs">Details</TabsTrigger>
            {showVersionControl && currentVCSFile && currentVCSFile.status !== 'clean' && (
              <TabsTrigger value="diff" className="text-xs">Diff</TabsTrigger>
            )}
          </TabsList>

          {/* Preview Tab */}
          {(isImage || isCode || isText) && (
            <TabsContent value="preview" className="flex-1 m-0">
              <ScrollArea className="h-full">
                <div className="p-4">
                  {isImage && (
                    <div className="space-y-3">
                      <div className={`relative rounded-lg overflow-hidden ${isDark ? 'bg-white/5' : 'bg-black/5'}`}>
                        <ImageWithFallback
                          src={getPreviewUrl() || "https://images.unsplash.com/photo-1635148040718-acf281233b8e?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb3VudGFpbiUyMGxhbmRzY2FwZSUyMG5hdHVyZXxlbnwxfHx8fDE3NTY0ODA3NDd8MA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"}
                          alt={selectedFile.name}
                          className="w-full h-48 object-cover"
                        />
                        <div className="absolute top-2 right-2 flex gap-1">
                          <Button variant="secondary" size="sm" className="h-6 w-6 p-0">
                            <ZoomIn className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                      {isImage && (
                        <div className="text-sm space-y-1">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Dimensions:</span>
                            <span>1920 × 1080</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Color Space:</span>
                            <span>sRGB</span>
                          </div>
                        </div>
                      )}
                    </div>
                  )}

                  {(isCode || isText) && (
                    <div className="space-y-3">
                      <div className={`rounded-lg overflow-hidden border ${isDark ? 'border-white/10 bg-black/20' : 'border-black/10 bg-white/50'}`}>
                        <div className={`px-3 py-2 border-b ${isDark ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5'} flex items-center justify-between`}>
                          <span className="text-xs text-muted-foreground font-mono">{selectedFile.name}</span>
                          <Button variant="ghost" size="sm" className="h-5 w-5 p-0">
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                        <ScrollArea className="h-64">
                          <pre className="p-3 text-xs font-mono leading-relaxed">
                            <code>{getMockContent()}</code>
                          </pre>
                        </ScrollArea>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {isCode && `${getMockContent().split('\n').length} lines`}
                        {isText && `${getMockContent().split(' ').length} words`}
                      </div>
                    </div>
                  )}
                </div>
              </ScrollArea>
            </TabsContent>
          )}

          {/* Diff Tab */}
          {showVersionControl && currentVCSFile && currentVCSFile.status !== 'clean' && (
            <TabsContent value="diff" className="flex-1 m-0">
              <ScrollArea className="h-full">
                <div className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-sm">
                      <GitBranch className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Changes in:</span>
                      <span className="font-mono text-xs">{selectedFile?.name}</span>
                    </div>
                    
                    <div className={`rounded-lg overflow-hidden border ${isDark ? 'border-white/10 bg-black/20' : 'border-black/10 bg-white/50'}`}>
                      <div className={`px-3 py-2 border-b ${isDark ? 'border-white/10 bg-white/5' : 'border-black/10 bg-black/5'} flex items-center justify-between`}>
                        <span className="text-xs text-muted-foreground">File Changes</span>
                        <Badge variant="outline" className={`text-xs ${getStatusColor(currentVCSFile.status)}`}>
                          {currentVCSFile.status}
                        </Badge>
                      </div>
                      <ScrollArea className="h-80">
                        <div className="font-mono text-xs">
                          {/* Mock diff content */}
                          <div className="bg-red-500/10 border-l-2 border-red-500/50 px-3 py-1">
                            <span className="text-red-400">- const oldFunction = () =&gt; &#123;</span>
                          </div>
                          <div className="bg-red-500/10 border-l-2 border-red-500/50 px-3 py-1">
                            <span className="text-red-400">-   return 'old implementation';</span>
                          </div>
                          <div className="bg-red-500/10 border-l-2 border-red-500/50 px-3 py-1">
                            <span className="text-red-400">- &#125;</span>
                          </div>
                          <div className="bg-green-500/10 border-l-2 border-green-500/50 px-3 py-1">
                            <span className="text-green-400">+ const newFunction = () =&gt; &#123;</span>
                          </div>
                          <div className="bg-green-500/10 border-l-2 border-green-500/50 px-3 py-1">
                            <span className="text-green-400">+   return 'improved implementation';</span>
                          </div>
                          <div className="bg-green-500/10 border-l-2 border-green-500/50 px-3 py-1">
                            <span className="text-green-400">+ &#125;</span>
                          </div>
                          <div className="px-3 py-1">
                            <span className="text-muted-foreground">  // Unchanged code</span>
                          </div>
                          <div className="px-3 py-1">
                            <span className="text-muted-foreground">  const utils = require('./utils');</span>
                          </div>
                        </div>
                      </ScrollArea>
                    </div>
                    
                    <div className="text-xs text-muted-foreground">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-green-400 rounded-sm"></div>
                          +3 additions
                        </span>
                        <span className="flex items-center gap-1">
                          <div className="w-2 h-2 bg-red-400 rounded-sm"></div>
                          -3 deletions
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </TabsContent>
          )}

          {/* Details Tab */}
          <TabsContent value="details" className="flex-1 m-0">
            <ScrollArea className="h-full">
              <div className="p-4 space-y-4">
                {/* Basic Properties */}
                <div>
                  <h5 className="text-sm font-medium mb-2 text-muted-foreground">Properties</h5>
                  <div className="space-y-2">
                    {selectedFile.size && (
                      <div className="flex items-center gap-2 text-sm">
                        <HardDrive className="w-4 h-4 text-muted-foreground" />
                        <span className="text-muted-foreground">Size:</span>
                        <span>{selectedFile.size}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-2 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Modified:</span>
                      <span>{selectedFile.modified}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Created:</span>
                      <span>{selectedFile.created || 'Jan 15, 2025'}</span>
                    </div>
                  </div>
                </div>

                <Separator className={`${isDark ? 'bg-white/10' : 'bg-black/10'}`} />

                {/* Location */}
                <div>
                  <h5 className="text-sm font-medium mb-2 text-muted-foreground">Location</h5>
                  <div className="text-sm">
                    <span className="text-muted-foreground">Path:</span>
                    <p className="mt-1 font-mono text-xs break-all">
                      {selectedFile.path || `/home/projects/nordic-explorer/${selectedFile.name}`}
                    </p>
                  </div>
                </div>

                <Separator className={`${isDark ? 'bg-white/10' : 'bg-black/10'}`} />

                {/* Security */}
                <div>
                  <h5 className="text-sm font-medium mb-2 text-muted-foreground">Security</h5>
                  <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sm">
                      <User className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Owner:</span>
                      <span>{selectedFile.owner || 'john.doe'}</span>
                    </div>
                    <div className="flex items-center gap-2 text-sm">
                      <Shield className="w-4 h-4 text-muted-foreground" />
                      <span className="text-muted-foreground">Permissions:</span>
                      <span className="font-mono text-xs">{selectedFile.permissions || '-rw-r--r--'}</span>
                    </div>
                  </div>
                </div>

                {/* Version Control Info (only for repository mode) */}
                {showVersionControl && (
                  <>
                    <Separator className={`${isDark ? 'bg-white/10' : 'bg-black/10'}`} />
                    <div>
                      <h5 className="text-sm font-medium mb-2 text-muted-foreground">Version Control</h5>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Tag className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Branch:</span>
                          <span>main</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Last commit:</span>
                          <span>2 hours ago</span>
                        </div>
                        <div className="text-sm">
                          <span className="text-muted-foreground">Commit hash:</span>
                          <p className="mt-1 font-mono text-xs text-muted-foreground">a7f2c4d</p>
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
                      <h5 className="text-sm font-medium mb-2 text-muted-foreground">File Info</h5>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <FileText className="w-4 h-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Type:</span>
                          <span>{selectedFile.fileType?.toUpperCase() || 'Unknown'}</span>
                        </div>
                        {isImage && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-muted-foreground">Format:</span>
                            <span>{selectedFile.fileType?.toUpperCase()}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </>
                )}
              </div>
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </div>

      {/* Actions */}
      <div className="p-4 border-t border-white/10 space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" className="h-8 text-xs">
            <Eye className="w-3 h-3 mr-1" />
            Open
          </Button>
          <Button variant="outline" className="h-8 text-xs">
            <Download className="w-3 h-3 mr-1" />
            Save
          </Button>
        </div>
        <Button variant="outline" className="w-full h-8 text-xs">
          <Star className="w-3 h-3 mr-2" />
          {selectedFile.starred ? 'Remove Star' : 'Add Star'}
        </Button>
      </div>
    </div>
  );
}