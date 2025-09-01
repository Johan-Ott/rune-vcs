import React, { useState } from 'react';
import { 
  GitCommit, 
  FileText, 
  User, 
  Calendar,
  CheckCircle,
  AlertCircle,
  X
} from 'lucide-react';
import { Button } from '../ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { VCSFile } from '../../types/vcs';

interface CommitDialogProps {
  isDark: boolean;
  isOpen: boolean;
  onClose: () => void;
  stagedFiles: VCSFile[];
  onCommit: (message: string, description?: string) => void;
  onStageFile?: (path: string) => void;
  onUnstageFile?: (path: string) => void;
}

export function CommitDialog({ 
  isDark, 
  isOpen, 
  onClose, 
  stagedFiles, 
  onCommit,
  onStageFile,
  onUnstageFile
}: CommitDialogProps) {
  const [commitMessage, setCommitMessage] = useState('');
  const [commitDescription, setCommitDescription] = useState('');
  const [author, setAuthor] = useState('John Doe <john@example.com>');

  const handleCommit = () => {
    if (!commitMessage.trim()) return;
    
    onCommit(commitMessage.trim(), commitDescription.trim() || undefined);
    
    // Reset form
    setCommitMessage('');
    setCommitDescription('');
    onClose();
  };

  const getStatusIcon = (status: VCSFile['status']) => {
    switch (status) {
      case 'modified': return <FileText className="w-3 h-3 text-yellow-400" />;
      case 'added': return <CheckCircle className="w-3 h-3 text-green-400" />;
      case 'deleted': return <X className="w-3 h-3 text-red-400" />;
      default: return <AlertCircle className="w-3 h-3 text-gray-400" />;
    }
  };

  const getStatusColor = (status: VCSFile['status']) => {
    switch (status) {
      case 'modified': return 'border-yellow-500/30 text-yellow-400';
      case 'added': return 'border-green-500/30 text-green-400';
      case 'deleted': return 'border-red-500/30 text-red-400';
      default: return 'border-gray-500/30 text-gray-400';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className={`max-w-2xl h-[600px] ${isDark ? 'glass-panel-dark' : 'glass-panel-light'}`}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <GitCommit className="w-5 h-5" />
            Create Commit
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex-1 flex flex-col gap-4 overflow-hidden">
          {/* Commit Message */}
          <div className="space-y-2">
            <Label htmlFor="commit-message">Commit Message *</Label>
            <Input
              id="commit-message"
              placeholder="Brief description of changes"
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}
            />
            <div className="text-xs text-muted-foreground">
              {commitMessage.length}/50 characters (keep it concise)
            </div>
          </div>

          {/* Commit Description */}
          <div className="space-y-2">
            <Label htmlFor="commit-description">Extended Description (optional)</Label>
            <Textarea
              id="commit-description"
              placeholder="Detailed explanation of what was changed and why..."
              value={commitDescription}
              onChange={(e) => setCommitDescription(e.target.value)}
              className={`min-h-[80px] ${isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}
            />
          </div>

          {/* Author Info */}
          <div className="space-y-2">
            <Label htmlFor="author">Author</Label>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-muted-foreground" />
              <Input
                id="author"
                value={author}
                onChange={(e) => setAuthor(e.target.value)}
                className={`${isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'}`}
              />
            </div>
          </div>

          <Separator className={`${isDark ? 'bg-white/10' : 'bg-black/10'}`} />

          {/* Staged Files */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="flex items-center gap-2 mb-3">
              <CheckCircle className="w-4 h-4 text-blue-400" />
              <h3 className="font-medium">Staged Files ({stagedFiles.length})</h3>
            </div>
            
            <ScrollArea className="flex-1">
              <div className="space-y-2">
                {stagedFiles.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No files staged for commit</p>
                    <p className="text-xs mt-1">Stage some files to create a commit</p>
                  </div>
                ) : (
                  stagedFiles.map((file) => (
                    <div 
                      key={file.path}
                      className={`flex items-center justify-between p-3 rounded-lg border ${isDark ? 'bg-white/5 border-white/10' : 'bg-black/5 border-black/10'} hover:${isDark ? 'bg-white/10' : 'bg-black/10'} transition-colors`}
                    >
                      <div className="flex items-center gap-2 flex-1 min-w-0">
                        {getStatusIcon(file.status)}
                        <span className="text-sm font-mono truncate">{file.path}</span>
                        <Badge variant="outline" className={`text-xs h-5 ${getStatusColor(file.status)}`}>
                          {file.status.toUpperCase()}
                        </Badge>
                      </div>
                      
                      {onUnstageFile && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 px-2 text-xs text-red-400 hover:text-red-300"
                          onClick={() => onUnstageFile(file.path)}
                        >
                          Unstage
                        </Button>
                      )}
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-between pt-2 border-t border-white/10">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-3 h-3" />
              <span>{new Date().toLocaleString()}</span>
            </div>
            
            <div className="flex gap-2">
              <Button variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button 
                onClick={handleCommit}
                disabled={!commitMessage.trim() || stagedFiles.length === 0}
                className="bg-green-600 hover:bg-green-700 text-white"
              >
                <GitCommit className="w-4 h-4 mr-2" />
                Commit ({stagedFiles.length})
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}