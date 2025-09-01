import React, { useState } from 'react';
import { 
  ChevronDown, 
  ChevronRight, 
  Copy, 
  Download,
  Eye,
  EyeOff,
  MoreHorizontal,
  GitBranch,
  FileX,
  ExternalLink,
  Undo2,
  ArrowUpDown
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '../ui/collapsible';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger, 
  DropdownMenuSeparator 
} from '../ui/dropdown-menu';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '../ui/context-menu';
import { VCSFile } from '../../types/vcs';

interface FileDiffViewerProps {
  isDark: boolean;
  file: VCSFile;
  onStageFile?: (path: string) => void;
  onUnstageFile?: (path: string) => void;
  onIgnoreFile?: (path: string) => void;
  onDiscardChanges?: (path: string) => void;
  compact?: boolean;
}

export function FileDiffViewer({ 
  isDark, 
  file, 
  onStageFile, 
  onUnstageFile, 
  onIgnoreFile, 
  onDiscardChanges, 
  compact = false 
}: FileDiffViewerProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showWhitespace, setShowWhitespace] = useState(false);
  const [viewMode, setViewMode] = useState<'unified' | 'split'>('unified');

  // Mock diff data - in a real app, this would come from the VCS
  const mockDiff = `@@ -1,4 +1,6 @@
 import React from 'react';
+import { useState } from 'react';
 import { Button } from './ui/button';
 
 export function Component() {
+  const [state, setState] = useState(false);
   return (
-    <div>Hello World</div>
+    <div>Hello Nordic Explorer</div>
   );
 }`;

  const parseDiff = (diff: string) => {
    const lines = diff.split('\n');
    return lines.map((line, index) => {
      let type: 'header' | 'addition' | 'deletion' | 'context' = 'context';
      if (line.startsWith('@@')) type = 'header';
      else if (line.startsWith('+')) type = 'addition';
      else if (line.startsWith('-')) type = 'deletion';
      
      return { line, type, number: index + 1 };
    });
  };

  const diffLines = parseDiff(file.diff || mockDiff);

  const getStatusColor = (status: VCSFile['status']) => {
    switch (status) {
      case 'modified': return 'text-yellow-400';
      case 'added': return 'text-green-400';
      case 'deleted': return 'text-red-400';
      case 'untracked': return 'text-purple-400';
      case 'staged': return 'text-blue-400';
      default: return 'text-gray-400';
    }
  };

  const getLineStyle = (type: string) => {
    switch (type) {
      case 'header':
        return `${isDark ? 'bg-blue-500/20 text-blue-300' : 'bg-blue-500/10 text-blue-600'}`;
      case 'addition':
        return `${isDark ? 'bg-green-500/20 text-green-300' : 'bg-green-500/10 text-green-600'}`;
      case 'deletion':
        return `${isDark ? 'bg-red-500/20 text-red-300' : 'bg-red-500/10 text-red-600'}`;
      default:
        return '';
    }
  };

  const handleIgnoreFile = () => {
    if (onIgnoreFile) {
      onIgnoreFile(file.path);
    }
  };

  const handleDiscardChanges = () => {
    if (onDiscardChanges) {
      onDiscardChanges(file.path);
    }
  };

  const handleCopyPath = () => {
    navigator.clipboard.writeText(file.path);
  };

  const handleOpenExternal = () => {
    console.log('Open in external editor:', file.path);
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger>
        <Card className={`${isDark ? 'glass-card' : 'glass-card-light'} transition-all`}>
          <Collapsible open={isExpanded} onOpenChange={setIsExpanded}>
            <CollapsibleTrigger asChild>
              <CardHeader className="cursor-pointer hover:bg-white/5 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {isExpanded ? (
                      <ChevronDown className="w-4 h-4" />
                    ) : (
                      <ChevronRight className="w-4 h-4" />
                    )}
                    <span className="font-medium">{file.name}</span>
                    <Badge variant="outline" className={`text-xs ${getStatusColor(file.status)}`}>
                      {file.status.toUpperCase()}
                    </Badge>
                  </div>
                  
                  <div className="flex items-center gap-1">
                    {file.status !== 'staged' && onStageFile && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          onStageFile(file.path);
                        }}
                      >
                        Stage
                      </Button>
                    )}
                    
                    {file.status === 'staged' && onUnstageFile && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-xs"
                        onClick={(e) => {
                          e.stopPropagation();
                          onUnstageFile(file.path);
                        }}
                      >
                        Unstage
                      </Button>
                    )}
                    
                    <Button
                      size="sm"
                      variant="ghost"
                      className="h-7 w-7 p-0"
                      onClick={(e) => {
                        e.stopPropagation();
                        setShowWhitespace(!showWhitespace);
                      }}
                      title={showWhitespace ? 'Hide whitespace' : 'Show whitespace'}
                    >
                      {showWhitespace ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    </Button>

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreHorizontal className="w-3 h-3" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-48">
                        <DropdownMenuItem onClick={handleCopyPath}>
                          <Copy className="w-4 h-4 mr-2" />
                          Copy Path
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={handleOpenExternal}>
                          <ExternalLink className="w-4 h-4 mr-2" />
                          Open in Editor
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setViewMode(viewMode === 'unified' ? 'split' : 'unified')}>
                          <ArrowUpDown className="w-4 h-4 mr-2" />
                          {viewMode === 'unified' ? 'Split View' : 'Unified View'}
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {onIgnoreFile && (
                          <DropdownMenuItem onClick={handleIgnoreFile}>
                            <FileX className="w-4 h-4 mr-2" />
                            Add to .gitignore
                          </DropdownMenuItem>
                        )}
                        {onDiscardChanges && file.status !== 'staged' && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem 
                              onClick={handleDiscardChanges}
                              className="text-red-400 focus:text-red-400"
                            >
                              <Undo2 className="w-4 h-4 mr-2" />
                              Discard Changes
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              </CardHeader>
            </CollapsibleTrigger>
            
            <CollapsibleContent>
              <CardContent className="pt-0">
                <div className="relative">
                  {/* Diff Controls */}
                  <div className="flex items-center justify-between mb-2 pb-2 border-b border-white/10">
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>{file.path}</span>
                    </div>
                    
                    <div className="flex items-center gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        onClick={() => navigator.clipboard.writeText(file.diff || mockDiff)}
                        title="Copy diff"
                      >
                        <Copy className="w-3 h-3" />
                      </Button>
                      
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 w-7 p-0"
                        title="Download diff"
                      >
                        <Download className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                  
                  {/* Diff Content */}
                  <div className={`rounded-md border ${isDark ? 'border-white/10' : 'border-black/10'} overflow-hidden`}>
                    <div className="font-mono text-xs">
                      {diffLines.map((diffLine) => (
                        <div
                          key={diffLine.number}
                          className={`flex ${getLineStyle(diffLine.type)} border-l-2 ${
                            diffLine.type === 'addition' ? 'border-green-500/50' :
                            diffLine.type === 'deletion' ? 'border-red-500/50' :
                            diffLine.type === 'header' ? 'border-blue-500/50' :
                            'border-transparent'
                          }`}
                        >
                          <div className={`w-12 flex-shrink-0 text-right pr-2 py-1 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'} border-r ${isDark ? 'border-white/10' : 'border-black/10'}`}>
                            {diffLine.type !== 'header' ? diffLine.number : ''}
                          </div>
                          <div className="flex-1 py-1 px-3 overflow-x-auto whitespace-pre">
                            {diffLine.line}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </CardContent>
            </CollapsibleContent>
          </Collapsible>
        </Card>
      </ContextMenuTrigger>
      
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={handleCopyPath}>
          <Copy className="w-4 h-4 mr-2" />
          Copy Path
        </ContextMenuItem>
        <ContextMenuItem onClick={handleOpenExternal}>
          <ExternalLink className="w-4 h-4 mr-2" />
          Open in Editor
        </ContextMenuItem>
        <ContextMenuSeparator />
        {file.status !== 'staged' && onStageFile && (
          <ContextMenuItem onClick={() => onStageFile(file.path)}>
            <GitBranch className="w-4 h-4 mr-2" />
            Stage File
          </ContextMenuItem>
        )}
        {file.status === 'staged' && onUnstageFile && (
          <ContextMenuItem onClick={() => onUnstageFile(file.path)}>
            <GitBranch className="w-4 h-4 mr-2" />
            Unstage File
          </ContextMenuItem>
        )}
        <ContextMenuSeparator />
        {onIgnoreFile && (
          <ContextMenuItem onClick={handleIgnoreFile}>
            <FileX className="w-4 h-4 mr-2" />
            Add to .gitignore
          </ContextMenuItem>
        )}
        {onDiscardChanges && file.status !== 'staged' && (
          <>
            <ContextMenuSeparator />
            <ContextMenuItem 
              onClick={handleDiscardChanges}
              className="text-red-400 focus:text-red-400"
            >
              <Undo2 className="w-4 h-4 mr-2" />
              Discard Changes
            </ContextMenuItem>
          </>
        )}
      </ContextMenuContent>
    </ContextMenu>
  );
}