import React, { useState } from 'react';
import { 
  FileText, 
  Plus, 
  Minus, 
  Edit, 
  FileQuestion,
  CheckCircle,
  Eye,
  MoreHorizontal,
  GitCommit,
  Archive,
  Package
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { VCSFile } from '../../types/vcs';
import { FileDiffViewer } from './FileDiffViewer';

interface VCSFileListProps {
  isDark: boolean;
  files: VCSFile[];
  stagedFiles: VCSFile[];
  selectedFile?: VCSFile;
  onSelectFile: (file: VCSFile) => void;
  onStageFile: (path: string) => void;
  onUnstageFile: (path: string) => void;
  onDiscardChanges: (path: string) => void;
  onOpenCommitDialog: () => void;
  stashes?: any[]; // Add stashes support
}

export function VCSFileList({ 
  isDark, 
  files = [], 
  stagedFiles = [],
  selectedFile,
  onSelectFile,
  onStageFile,
  onUnstageFile,
  onDiscardChanges,
  onOpenCommitDialog,
  stashes = []
}: VCSFileListProps) {
  const [expandedSections, setExpandedSections] = useState<string[]>(['changes', 'staged']);

  const toggleSection = (section: string) => {
    setExpandedSections(prev => 
      prev.includes(section) 
        ? prev.filter(s => s !== section)
        : [...prev, section]
    );
  };

  const getStatusIcon = (status: VCSFile['status']) => {
    switch (status) {
      case 'modified': return <Edit className="w-4 h-4 text-yellow-400" />;
      case 'added': return <Plus className="w-4 h-4 text-green-400" />;
      case 'deleted': return <Minus className="w-4 h-4 text-red-400" />;
      case 'untracked': return <FileQuestion className="w-4 h-4 text-purple-400" />;
      case 'staged': return <CheckCircle className="w-4 h-4 text-blue-400" />;
      default: return <FileText className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: VCSFile['status']) => {
    switch (status) {
      case 'modified': return 'border-yellow-500/30 text-yellow-400';
      case 'added': return 'border-green-500/30 text-green-400';
      case 'deleted': return 'border-red-500/30 text-red-400';
      case 'untracked': return 'border-purple-500/30 text-purple-400';
      case 'staged': return 'border-blue-500/30 text-blue-400';
      default: return 'border-gray-500/30 text-gray-400';
    }
  };

  const unstartedFiles = (files || []).filter(f => f.status !== 'staged');

  return (
    <div className="h-full flex flex-col">
      {/* Header Actions */}
      <div className="p-3 border-b border-white/10">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-medium">Source Control</h2>
          <Button
            size="sm"
            onClick={onOpenCommitDialog}
            disabled={stagedFiles.length === 0}
            className="h-7 text-xs"
          >
            <GitCommit className="w-3 h-3 mr-1" />
            Commit ({stagedFiles.length})
          </Button>
        </div>
        
        {(unstartedFiles.length > 0 || stagedFiles.length > 0) && (
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={() => unstartedFiles.forEach(f => onStageFile(f.path))}
              disabled={unstartedFiles.length === 0}
              className="h-6 text-xs flex-1"
            >
              Stage All ({unstartedFiles.length})
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => stagedFiles.forEach(f => onUnstageFile(f.path))}
              disabled={stagedFiles.length === 0}
              className="h-6 text-xs flex-1"
            >
              Unstage All ({stagedFiles.length})
            </Button>
          </div>
        )}
      </div>

      <ScrollArea className="flex-1">
        <div className="p-3 space-y-4">
          {/* Staged Files Section */}
          {stagedFiles.length > 0 && (
            <Collapsible 
              open={expandedSections.includes('staged')} 
              onOpenChange={() => toggleSection('staged')}
            >
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-start p-0 h-auto">
                  <div className="flex items-center gap-2 py-2">
                    <CheckCircle className="w-4 h-4 text-blue-400" />
                    <span className="font-medium">Staged Changes ({stagedFiles.length})</span>
                  </div>
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="space-y-1 mt-2">
                {stagedFiles.map((file) => (
                  <div 
                    key={file.path}
                    className={`group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                      selectedFile?.path === file.path 
                        ? `${isDark ? 'bg-white/15' : 'bg-black/15'} aurora-glow` 
                        : `hover:${isDark ? 'bg-white/5' : 'bg-black/5'}`
                    }`}
                    onClick={() => onSelectFile(file)}
                  >
                    {getStatusIcon(file.status)}
                    <span className="text-sm font-mono flex-1 truncate">{file.name}</span>
                    <Badge variant="outline" className={`text-xs h-5 ${getStatusColor(file.status)}`}>
                      {file.status.charAt(0).toUpperCase()}
                    </Badge>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="w-3 h-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => onUnstageFile(file.path)}>
                          <Minus className="w-3 h-3 mr-2" />
                          Unstage
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onSelectFile(file)}>
                          <Eye className="w-3 h-3 mr-2" />
                          View Diff
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Unstaged Changes Section */}
          {unstartedFiles.length > 0 && (
            <Collapsible 
              open={expandedSections.includes('changes')} 
              onOpenChange={() => toggleSection('changes')}
            >
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-start p-0 h-auto">
                  <div className="flex items-center gap-2 py-2">
                    <Edit className="w-4 h-4 text-yellow-400" />
                    <span className="font-medium">Changes ({unstartedFiles.length})</span>
                  </div>
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="space-y-1 mt-2">
                {unstartedFiles.map((file) => (
                  <div 
                    key={file.path}
                    className={`group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                      selectedFile?.path === file.path 
                        ? `${isDark ? 'bg-white/15' : 'bg-black/15'} aurora-glow` 
                        : `hover:${isDark ? 'bg-white/5' : 'bg-black/5'}`
                    }`}
                    onClick={() => onSelectFile(file)}
                  >
                    {getStatusIcon(file.status)}
                    <span className="text-sm font-mono flex-1 truncate">{file.name}</span>
                    <Badge variant="outline" className={`text-xs h-5 ${getStatusColor(file.status)}`}>
                      {file.status.charAt(0).toUpperCase()}
                    </Badge>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="w-3 h-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem onClick={() => onStageFile(file.path)}>
                          <Plus className="w-3 h-3 mr-2" />
                          Stage
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => onSelectFile(file)}>
                          <Eye className="w-3 h-3 mr-2" />
                          View Diff
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => onDiscardChanges(file.path)}
                          className="text-red-400 focus:text-red-400"
                        >
                          <Minus className="w-3 h-3 mr-2" />
                          Discard
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Stash Section */}
          {stashes.length > 0 && (
            <Collapsible 
              open={expandedSections.includes('stash')} 
              onOpenChange={() => toggleSection('stash')}
            >
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-start p-0 h-auto">
                  <div className="flex items-center gap-2 py-2">
                    <Archive className="w-4 h-4 text-purple-400" />
                    <span className="font-medium">Stash ({stashes.length})</span>
                  </div>
                </Button>
              </CollapsibleTrigger>
              
              <CollapsibleContent className="space-y-1 mt-2">
                {stashes.slice(0, 3).map((stash: any) => (
                  <div 
                    key={stash.id}
                    className={`group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all hover:${isDark ? 'bg-white/5' : 'bg-black/5'}`}
                  >
                    <Package className="w-4 h-4 text-purple-400" />
                    <div className="flex-1 min-w-0">
                      <span className="text-sm truncate block">{stash.message}</span>
                      <span className="text-xs text-muted-foreground">{stash.branch} • {stash.files.length} files</span>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="w-3 h-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-40">
                        <DropdownMenuItem>
                          <CheckCircle className="w-3 h-3 mr-2" />
                          Apply
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Eye className="w-3 h-3 mr-2" />
                          Show
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-red-400 focus:text-red-400">
                          <Minus className="w-3 h-3 mr-2" />
                          Drop
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
                {stashes.length > 3 && (
                  <div className="text-xs text-muted-foreground pl-6">
                    +{stashes.length - 3} more stashes
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Empty State */}
          {files.length === 0 && stagedFiles.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <h3 className="font-medium mb-1">No Changes</h3>
              <p className="text-sm">Your working tree is clean</p>
            </div>
          )}
        </div>
      </ScrollArea>

      {/* Selected File Diff */}
      {selectedFile && (
        <div className="border-t border-white/10 p-3">
          <FileDiffViewer
            isDark={isDark}
            file={selectedFile}
            onStageFile={onStageFile}
            onUnstageFile={onUnstageFile}
          />
        </div>
      )}
    </div>
  );
}