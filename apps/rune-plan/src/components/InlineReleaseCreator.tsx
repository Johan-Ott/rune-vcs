import React, { useState, useRef, useEffect } from 'react';
import { Plus, Check, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { cn } from './ui/utils';
import { Release } from '../App';

interface InlineReleaseCreatorProps {
  onCreateRelease: (release: Omit<Release, 'id' | 'issuesCount' | 'completedIssuesCount'>) => void;
  placeholder?: string;
  className?: string;
}

export function InlineReleaseCreator({ 
  onCreateRelease, 
  placeholder = "Create new release...",
  className 
}: InlineReleaseCreatorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [releaseData, setReleaseData] = useState({
    name: '',
    description: '',
    version: '',
    status: 'planned' as Release['status'],
    targetDate: '',
  });
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSubmit = () => {
    if (releaseData.name.trim() && releaseData.version.trim()) {
      onCreateRelease({
        name: releaseData.name.trim(),
        description: releaseData.description.trim(),
        version: releaseData.version.trim(),
        status: releaseData.status,
        targetDate: releaseData.targetDate || undefined,
      });
      setReleaseData({
        name: '',
        description: '',
        version: '',
        status: 'planned',
        targetDate: '',
      });
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setReleaseData({
      name: '',
      description: '',
      version: '',
      status: 'planned',
      targetDate: '',
    });
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  if (!isEditing) {
    return (
      <div 
        className={cn(
          "flex items-center gap-3 p-4 rounded-lg hover:bg-muted/30 cursor-pointer transition-colors border-2 border-dashed border-muted-foreground/20 hover:border-muted-foreground/40",
          className
        )}
        onClick={() => setIsEditing(true)}
      >
        <Plus className="w-4 h-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{placeholder}</span>
      </div>
    );
  }

  return (
    <div className={cn("p-4 rounded-lg border-2 border-primary/20 bg-muted/20 space-y-3", className)}>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Input
            ref={inputRef}
            value={releaseData.name}
            onChange={(e) => setReleaseData(prev => ({ ...prev, name: e.target.value }))}
            onKeyDown={handleKeyDown}
            placeholder="Release name..."
            className="text-sm"
          />
        </div>
        <div>
          <Input
            value={releaseData.version}
            onChange={(e) => setReleaseData(prev => ({ ...prev, version: e.target.value }))}
            onKeyDown={handleKeyDown}
            placeholder="Version (e.g., 2.1.0)"
            className="text-sm"
          />
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Select
            value={releaseData.status}
            onValueChange={(value: Release['status']) => 
              setReleaseData(prev => ({ ...prev, status: value }))
            }
          >
            <SelectTrigger className="text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="planned">Planned</SelectItem>
              <SelectItem value="in-progress">In Progress</SelectItem>
              <SelectItem value="released">Released</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Input
            type="date"
            value={releaseData.targetDate}
            onChange={(e) => setReleaseData(prev => ({ ...prev, targetDate: e.target.value }))}
            className="text-sm"
          />
        </div>
      </div>
      
      <div>
        <Input
          value={releaseData.description}
          onChange={(e) => setReleaseData(prev => ({ ...prev, description: e.target.value }))}
          onKeyDown={handleKeyDown}
          placeholder="Description (optional)"
          className="text-sm"
        />
      </div>
      
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!releaseData.name.trim() || !releaseData.version.trim()}
        >
          <Check className="w-3 h-3 mr-1" />
          Create
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleCancel}
        >
          <X className="w-3 h-3 mr-1" />
          Cancel
        </Button>
      </div>
    </div>
  );
}