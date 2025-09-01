import React, { useState } from 'react';
import {
  Plus,
  MoreHorizontal,
  ChevronRight,
  ChevronDown,
  FolderOpen,
  FileText,
  Archive,
  Trash2,
  Edit3,
  GitBranch,
  Clock,
  User,
  Package,
  Eye,
  EyeOff,
  Save,
  Copy,
  Upload,
  Download,
  FileX,
  Undo2
} from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from '../ui/context-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import { Changelist, VCSFile } from '../../types/vcs';
import { VCSFileList } from './VCSFileList';

interface ChangelistPanelProps {
  isDark: boolean;
  changelists: Changelist[];
  onCreateChangelist: (name: string, description: string) => void;
  onUpdateChangelist: (id: string, updates: Partial<Changelist>) => void;
  onDeleteChangelist: (id: string) => void;
  onStashChangelist: (id: string) => void;
  onUnstashChangelist: (id: string) => void;
  onMoveFileToChangelist: (fileId: string, changelistId: string) => void;
  onStageFile: (fileId: string) => void;
  onUnstageFile: (fileId: string) => void;
  onDiscardChanges: (fileId: string) => void;
  onIgnoreFile?: (path: string) => void;
  onSubmitChangelist?: (id: string) => void;
  onExportChangelist?: (id: string) => void;
  onImportChangelist?: () => void;
  onCommitChangelist?: (changelist: Changelist) => void;
  selectedFile?: VCSFile;
  onFileSelect: (file: VCSFile) => void;
}

// Removed color system for minimal design

export function ChangelistPanel({
  isDark,
  changelists,
  onCreateChangelist,
  onUpdateChangelist,
  onDeleteChangelist,
  onStashChangelist,
  onUnstashChangelist,
  onMoveFileToChangelist,
  onStageFile,
  onUnstageFile,
  onDiscardChanges,
  onIgnoreFile,
  onSubmitChangelist,
  onExportChangelist,
  onImportChangelist,
  onCommitChangelist,
  selectedFile,
  onFileSelect
}: ChangelistPanelProps) {
  const [expandedChangelist, setExpandedChangelist] = useState<string | null>(null);
  const [editingChangelist, setEditingChangelist] = useState<string | null>(null);
  const [newChangelistName, setNewChangelistName] = useState('');
  const [newChangelistDescription, setNewChangelistDescription] = useState('');
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [editName, setEditName] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [showStashedChangelists, setShowStashedChangelists] = useState(false);

  const toggleChangelist = (changelistId: string) => {
    setExpandedChangelist(prev => prev === changelistId ? null : changelistId);
  };

  const handleCreateChangelist = () => {
    if (newChangelistName.trim()) {
      onCreateChangelist(newChangelistName.trim(), newChangelistDescription.trim());
      setNewChangelistName('');
      setNewChangelistDescription('');
      setIsCreateDialogOpen(false);
    }
  };

  const handleStashToggle = (changelist: Changelist) => {
    if (changelist.isStashed) {
      onUnstashChangelist(changelist.id);
    } else {
      onStashChangelist(changelist.id);
    }
  };

  const handleEditChangelist = (changelist: Changelist) => {
    setEditName(changelist.name);
    setEditDescription(changelist.description || '');
    setEditingChangelist(changelist.id);
  };

  const handleSaveEdit = () => {
    if (editingChangelist && editName.trim()) {
      onUpdateChangelist(editingChangelist, {
        name: editName.trim(),
        description: editDescription.trim()
      });
      setEditingChangelist(null);
      setEditName('');
      setEditDescription('');
    }
  };

  const handleCancelEdit = () => {
    setEditingChangelist(null);
    setEditName('');
    setEditDescription('');
  };

  const handleCommitChangelist = (changelist: Changelist) => {
    if (onCommitChangelist && changelist.files.length > 0) {
      onCommitChangelist(changelist);
    }
  };

  // Simplified styling - no custom colors

  const activeChangelists = changelists.filter(c => !c.isStashed);
  const stashedChangelists = changelists.filter(c => c.isStashed);

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-3 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4" />
          <span className="font-medium">Local Changelists</span>
          <Badge variant="outline" className="text-xs">
            {activeChangelists.length}
          </Badge>
        </div>
        
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            className="h-6 w-6 p-0"
            onClick={() => setShowStashedChangelists(!showStashedChangelists)}
            title={showStashedChangelists ? "Hide stashed" : "Show stashed"}
          >
            {showStashedChangelists ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          </Button>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
                <Plus className="w-3 h-3" />
              </Button>
            </DialogTrigger>
            <DialogContent className={`${isDark ? 'glass-panel-dark' : 'glass-panel-light'} border ${isDark ? 'border-white/10' : 'border-black/10'}`}>
              <DialogHeader>
                <DialogTitle>Create New Changelist</DialogTitle>
                <DialogDescription>
                  Create a new changelist to organize your changes.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <Input
                  placeholder="Changelist name"
                  value={newChangelistName}
                  onChange={(e) => setNewChangelistName(e.target.value)}
                  className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}
                />
                <Textarea
                  placeholder="Description (optional)"
                  value={newChangelistDescription}
                  onChange={(e) => setNewChangelistDescription(e.target.value)}
                  className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'} min-h-20`}
                />
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateChangelist} disabled={!newChangelistName.trim()}>
                  <Plus className="w-4 h-4 mr-2" />
                  Create
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Edit Changelist Dialog */}
      <Dialog open={editingChangelist !== null} onOpenChange={(open) => !open && handleCancelEdit()}>
        <DialogContent className={`${isDark ? 'glass-panel-dark' : 'glass-panel-light'} border ${isDark ? 'border-white/10' : 'border-black/10'}`}>
          <DialogHeader>
            <DialogTitle>Edit Changelist</DialogTitle>
            <DialogDescription>
              Update the changelist name and description.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <Input
              placeholder="Changelist name"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}
            />
            <Textarea
              placeholder="Description (optional)"
              value={editDescription}
              onChange={(e) => setEditDescription(e.target.value)}
              className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'} min-h-20`}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={handleCancelEdit}>
              Cancel
            </Button>
            <Button onClick={handleSaveEdit} disabled={!editName.trim()}>
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Active Changelists */}
      <ScrollArea className="flex-1">
        <div className="space-y-1 p-2">
          {activeChangelists.map((changelist) => {
            const isExpanded = expandedChangelist === changelist.id;
            
            return (
              <div key={changelist.id} className="space-y-0">
                <ContextMenu>
                  <ContextMenuTrigger>
                    {/* Minimal changelist row */}
                    <div
                      className={`group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all ${
                        isExpanded 
                          ? `${isDark ? 'bg-white/15' : 'bg-black/15'} aurora-glow` 
                          : `hover:${isDark ? 'bg-white/5' : 'bg-black/5'}`
                      }`}
                      onClick={() => toggleChangelist(changelist.id)}
                    >
                      <div className="transition-transform duration-200 flex-shrink-0">
                        {isExpanded ? (
                          <ChevronDown className="w-3 h-3" />
                        ) : (
                          <ChevronRight className="w-3 h-3" />
                        )}
                      </div>
                      
                      {changelist.isDefault ? (
                        <FolderOpen className="w-4 h-4 text-blue-400 flex-shrink-0" />
                      ) : (
                        <Package className="w-4 h-4 flex-shrink-0" />
                      )}
                      
                      <span className="text-sm font-mono flex-1 truncate">
                        {changelist.name}
                        {changelist.isDefault && <span className="text-xs text-muted-foreground ml-1">(default)</span>}
                      </span>
                      
                      <Badge variant="outline" className="text-xs h-5 flex-shrink-0">
                        {changelist.files.length}
                      </Badge>

                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <MoreHorizontal className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-40">
                          <DropdownMenuItem onClick={() => handleEditChangelist(changelist)}>
                            <Edit3 className="w-4 h-4 mr-2" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleStashToggle(changelist)}>
                            <Archive className="w-4 h-4 mr-2" />
                            {changelist.isStashed ? 'Unstash' : 'Stash'}
                          </DropdownMenuItem>
                          {!changelist.isDefault && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem 
                                onClick={() => onDeleteChangelist(changelist.id)}
                                className="text-red-400 focus:text-red-400"
                              >
                                <Trash2 className="w-4 h-4 mr-2" />
                                Delete
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </ContextMenuTrigger>
                  
                  <ContextMenuContent className="w-48">
                    <ContextMenuItem onClick={() => handleEditChangelist(changelist)}>
                      <Edit3 className="w-4 h-4 mr-2" />
                      Edit Changelist
                    </ContextMenuItem>
                    <ContextMenuItem onClick={() => navigator.clipboard.writeText(changelist.name)}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copy Name
                    </ContextMenuItem>
                    <ContextMenuSeparator />
                    {changelist.files.length > 0 && onCommitChangelist && (
                      <ContextMenuItem onClick={() => handleCommitChangelist(changelist)}>
                        <GitBranch className="w-4 h-4 mr-2" />
                        Commit Changelist
                      </ContextMenuItem>
                    )}
                    {onSubmitChangelist && (
                      <ContextMenuItem onClick={() => onSubmitChangelist(changelist.id)}>
                        <Upload className="w-4 h-4 mr-2" />
                        Submit for Review
                      </ContextMenuItem>
                    )}
                    {onExportChangelist && (
                      <ContextMenuItem onClick={() => onExportChangelist(changelist.id)}>
                        <Download className="w-4 h-4 mr-2" />
                        Export Changelist
                      </ContextMenuItem>
                    )}
                    <ContextMenuSeparator />
                    <ContextMenuItem onClick={() => handleStashToggle(changelist)}>
                      <Archive className="w-4 h-4 mr-2" />
                      {changelist.isStashed ? 'Unstash' : 'Stash'}
                    </ContextMenuItem>
                    {!changelist.isDefault && (
                      <>
                        <ContextMenuSeparator />
                        <ContextMenuItem 
                          onClick={() => onDeleteChangelist(changelist.id)}
                          className="text-red-400 focus:text-red-400"
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete Changelist
                        </ContextMenuItem>
                      </>
                    )}
                  </ContextMenuContent>
                </ContextMenu>

                {/* Expanded content */}
                {isExpanded && (
                  <div className="ml-6 mr-2 mt-1 space-y-2">
                    {/* Description */}
                    {changelist.description && (
                      <div className="text-xs text-muted-foreground px-2">
                        {changelist.description}
                      </div>
                    )}

                    {/* Simple file list with context menu */}
                    {changelist.files.length > 0 ? (
                      <div className="space-y-1">
                        {changelist.files.map((file) => (
                          <ContextMenu key={file.id}>
                            <ContextMenuTrigger>
                              <div 
                                className={`group flex items-center gap-2 p-1 px-2 rounded cursor-pointer transition-all text-xs ${
                                  selectedFile?.id === file.id 
                                    ? `${isDark ? 'bg-white/10' : 'bg-black/10'}` 
                                    : `hover:${isDark ? 'bg-white/5' : 'bg-black/5'}`
                                }`}
                                onClick={() => onFileSelect(file)}
                              >
                                <div className="w-2 h-2 rounded-full bg-yellow-400 flex-shrink-0" />
                                <span className="font-mono flex-1 truncate">{file.name}</span>
                                <span className="text-muted-foreground">{file.status.charAt(0).toUpperCase()}</span>
                              </div>
                            </ContextMenuTrigger>
                            <ContextMenuContent className="w-48">
                              <ContextMenuItem onClick={() => navigator.clipboard.writeText(file.path)}>
                                <Copy className="w-4 h-4 mr-2" />
                                Copy Path
                              </ContextMenuItem>
                              <ContextMenuItem onClick={() => console.log('Open in editor:', file.path)}>
                                <Eye className="w-4 h-4 mr-2" />
                                Open in Editor
                              </ContextMenuItem>
                              <ContextMenuSeparator />
                              {file.status !== 'staged' && (
                                <ContextMenuItem onClick={() => onStageFile(file.id)}>
                                  <GitBranch className="w-4 h-4 mr-2" />
                                  Stage File
                                </ContextMenuItem>
                              )}
                              {file.status === 'staged' && (
                                <ContextMenuItem onClick={() => onUnstageFile(file.id)}>
                                  <GitBranch className="w-4 h-4 mr-2" />
                                  Unstage File
                                </ContextMenuItem>
                              )}
                              <ContextMenuSeparator />
                              {onIgnoreFile && (
                                <ContextMenuItem onClick={() => onIgnoreFile(file.path)}>
                                  <FileX className="w-4 h-4 mr-2" />
                                  Add to .gitignore
                                </ContextMenuItem>
                              )}
                              {file.status !== 'staged' && (
                                <>
                                  <ContextMenuSeparator />
                                  <ContextMenuItem 
                                    onClick={() => onDiscardChanges(file.id)}
                                    className="text-red-400 focus:text-red-400"
                                  >
                                    <Undo2 className="w-4 h-4 mr-2" />
                                    Discard Changes
                                  </ContextMenuItem>
                                </>
                              )}
                            </ContextMenuContent>
                          </ContextMenu>
                        ))}
                      </div>
                    ) : (
                      <div className="text-xs text-muted-foreground text-center py-2 px-2">
                        No files in this changelist
                      </div>
                    )}

                    {/* Metadata */}
                    <div className="flex items-center gap-3 text-xs text-muted-foreground px-2 pt-1 border-t border-white/5">
                      <div className="flex items-center gap-1">
                        <User className="w-3 h-3" />
                        <span>{changelist.author}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>{changelist.lastModified.toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Stashed Changelists */}
        {showStashedChangelists && stashedChangelists.length > 0 && (
          <div className="border-t border-white/10 mt-2">
            <div className="p-2">
              <div className="flex items-center gap-2 mb-2">
                <Archive className="w-4 h-4" />
                <span className="text-sm font-medium text-muted-foreground">Stashed</span>
                <Badge variant="outline" className="text-xs">
                  {stashedChangelists.length}
                </Badge>
              </div>
              
              <div className="space-y-1">
                {stashedChangelists.map((changelist) => (
                  <div
                    key={changelist.id}
                    className={`group flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-all opacity-60 hover:opacity-80 hover:${isDark ? 'bg-white/5' : 'bg-black/5'}`}
                  >
                    <Archive className="w-4 h-4 flex-shrink-0" />
                    <span className="text-sm font-mono flex-1 truncate">{changelist.name}</span>
                    <Badge variant="outline" className="text-xs h-5 flex-shrink-0">
                      {changelist.files.length}
                    </Badge>
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={() => handleStashToggle(changelist)}
                      title="Unstash changelist"
                    >
                      <Package className="w-3 h-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {activeChangelists.length === 0 && (
          <div className="flex flex-col items-center justify-center py-8 px-4">
            <Package className="w-8 h-8 text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground text-center">
              No changelists yet. Create one to organize your changes.
            </p>
            <Button
              variant="outline"
              size="sm"
              className="mt-3"
              onClick={() => setIsCreateDialogOpen(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Create Changelist
            </Button>
          </div>
        )}
      </ScrollArea>
    </div>
  );
}