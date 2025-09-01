import React, { useState } from 'react';
import { 
  Tag, 
  Plus, 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Download, 
  Eye, 
  GitCommit,
  Check,
  X,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import { Button } from './ui/button';
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuTrigger,
  DropdownMenuSeparator 
} from './ui/dropdown-menu';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';

interface GitTag {
  id: string;
  name: string;
  message: string;
  commit: string;
  date: string;
  author?: string;
}

interface TagsSectionProps {
  isDark: boolean;
}

export function TagsSection({ isDark }: TagsSectionProps) {
  const [tags, setTags] = useState<GitTag[]>([
    { 
      id: '1', 
      name: 'v2.1.0', 
      date: '2024-01-15', 
      commit: 'a1b2c3d', 
      message: 'Major release with VCS integration',
      author: 'John Doe'
    },
    { 
      id: '2', 
      name: 'v2.0.1', 
      date: '2024-01-10', 
      commit: 'e4f5g6h', 
      message: 'Hotfix for critical bug',
      author: 'Jane Smith'
    },
    { 
      id: '3', 
      name: 'v2.0.0', 
      date: '2024-01-01', 
      commit: 'i7j8k9l', 
      message: 'Major release with Nordic theme',
      author: 'John Doe'
    },
    { 
      id: '4', 
      name: 'v1.5.2', 
      date: '2023-12-20', 
      commit: 'm1n2o3p', 
      message: 'Performance improvements',
      author: 'Bob Wilson'
    },
  ]);

  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [newTag, setNewTag] = useState({
    name: '',
    message: '',
    commit: 'HEAD' // Default to current HEAD
  });
  
  const [editForm, setEditForm] = useState({
    name: '',
    message: ''
  });

  const handleCreateTag = () => {
    if (!newTag.name.trim() || !newTag.message.trim()) return;

    const tag: GitTag = {
      id: Math.random().toString(36).substr(2, 9),
      name: newTag.name.trim(),
      message: newTag.message.trim(),
      commit: newTag.commit || 'HEAD',
      date: new Date().toISOString().split('T')[0],
      author: 'Current User'
    };

    setTags(prev => [tag, ...prev]);
    setNewTag({ name: '', message: '', commit: 'HEAD' });
    setIsCreateFormOpen(false);
  };

  const handleStartEdit = (tag: GitTag) => {
    setEditingTagId(tag.id);
    setEditForm({
      name: tag.name,
      message: tag.message
    });
  };

  const handleSaveEdit = () => {
    if (!editingTagId || !editForm.name.trim() || !editForm.message.trim()) return;

    setTags(prev => prev.map(tag => 
      tag.id === editingTagId ? { ...tag, name: editForm.name.trim(), message: editForm.message.trim() } : tag
    ));
    setEditingTagId(null);
    setEditForm({ name: '', message: '' });
  };

  const handleCancelEdit = () => {
    setEditingTagId(null);
    setEditForm({ name: '', message: '' });
  };

  const handleDeleteTag = (id: string) => {
    setTags(prev => prev.filter(tag => tag.id !== id));
  };

  return (
    <div className="flex-1 flex flex-col p-4">
      <div className="flex items-center justify-between mb-4">
        <h2>Git Tags</h2>
        <Button 
          size="sm" 
          onClick={() => {
            setIsCreateFormOpen(!isCreateFormOpen);
            if (!isCreateFormOpen) {
              setNewTag({ name: '', message: '', commit: 'HEAD' });
            }
          }}
        >
          {isCreateFormOpen ? <X className="w-3 h-3 mr-1" /> : <Plus className="w-3 h-3 mr-1" />}
          {isCreateFormOpen ? 'Cancel' : 'Create Tag'}
        </Button>
      </div>

      {/* Create Tag Form */}
      {isCreateFormOpen && (
        <div className={`${isDark ? 'glass-card' : 'glass-card-light'} p-4 mb-4 border-dashed`}>
          <div className="space-y-3">
            <div>
              <Label className="text-sm">Tag Name *</Label>
              <Input
                placeholder="e.g., v1.0.0"
                value={newTag.name}
                onChange={(e) => setNewTag(prev => ({ ...prev, name: e.target.value }))}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm">Tag Message *</Label>
              <Textarea
                placeholder="Describe this release..."
                value={newTag.message}
                onChange={(e) => setNewTag(prev => ({ ...prev, message: e.target.value }))}
                className="mt-1 min-h-[60px]"
              />
            </div>

            <div>
              <Label className="text-sm">Target Commit</Label>
              <Input
                placeholder="Commit hash or branch (default: HEAD)"
                value={newTag.commit}
                onChange={(e) => setNewTag(prev => ({ ...prev, commit: e.target.value }))}
                className="mt-1"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button 
                size="sm"
                onClick={handleCreateTag} 
                disabled={!newTag.name.trim() || !newTag.message.trim()}
              >
                <Check className="w-3 h-3 mr-1" />
                Create Tag
              </Button>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => {
                  setIsCreateFormOpen(false);
                  setNewTag({ name: '', message: '', commit: 'HEAD' });
                }}
              >
                <X className="w-3 h-3 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {tags.map((tag) => (
          <div key={tag.id} className={`${isDark ? 'glass-card' : 'glass-card-light'}`}>
            <div className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full ${isDark ? 'bg-white/10' : 'bg-black/10'} flex items-center justify-center`}>
                    <Tag className="w-4 h-4" />
                  </div>
                  <div>
                    <h3>{tag.name}</h3>
                    <p className="text-sm text-muted-foreground">{tag.message}</p>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                      <span>{tag.date}</span>
                      <span>•</span>
                      <span className="font-mono">{tag.commit}</span>
                      {tag.author && (
                        <>
                          <span>•</span>
                          <span>{tag.author}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                      <MoreHorizontal className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleStartEdit(tag)}>
                      <Edit className="w-3 h-3 mr-2" />
                      Edit Tag
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Eye className="w-3 h-3 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <GitCommit className="w-3 h-3 mr-2" />
                      View Commit
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Download className="w-3 h-3 mr-2" />
                      Download Archive
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={() => handleDeleteTag(tag.id)}
                      className="text-red-400 focus:text-red-400"
                    >
                      <Trash2 className="w-3 h-3 mr-2" />
                      Delete Tag
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>

            {/* Inline Edit Form */}
            {editingTagId === tag.id && (
              <div className={`px-4 pb-4 border-t ${isDark ? 'border-white/10' : 'border-black/10'}`}>
                <div className="space-y-3 mt-4">
                  <div>
                    <Label className="text-sm">Tag Name *</Label>
                    <Input
                      placeholder="e.g., v1.0.0"
                      value={editForm.name}
                      onChange={(e) => setEditForm(prev => ({ ...prev, name: e.target.value }))}
                      className="mt-1"
                    />
                  </div>

                  <div>
                    <Label className="text-sm">Tag Message *</Label>
                    <Textarea
                      placeholder="Describe this release..."
                      value={editForm.message}
                      onChange={(e) => setEditForm(prev => ({ ...prev, message: e.target.value }))}
                      className="mt-1 min-h-[60px]"
                    />
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button 
                      size="sm"
                      onClick={handleSaveEdit} 
                      disabled={!editForm.name.trim() || !editForm.message.trim()}
                    >
                      <Check className="w-3 h-3 mr-1" />
                      Save Changes
                    </Button>
                    <Button 
                      size="sm" 
                      variant="ghost"
                      onClick={handleCancelEdit}
                    >
                      <X className="w-3 h-3 mr-1" />
                      Cancel
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

    </div>
  );
}