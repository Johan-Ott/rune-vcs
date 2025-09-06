import React, { useState, useRef, useEffect } from 'react';
import { Plus, Check, X } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { cn } from './ui/utils';

interface InlineIssueCreatorProps {
  onCreateIssue: (title: string) => void;
  placeholder?: string;
  className?: string;
}

export function InlineIssueCreator({ 
  onCreateIssue, 
  placeholder = "Create new issue...",
  className 
}: InlineIssueCreatorProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [title, setTitle] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isEditing]);

  const handleSubmit = () => {
    if (title.trim()) {
      onCreateIssue(title.trim());
      setTitle('');
      setIsEditing(false);
    }
  };

  const handleCancel = () => {
    setTitle('');
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
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
          "flex items-center gap-3 p-3 rounded-md hover:bg-muted/30 cursor-pointer transition-colors border-2 border-dashed border-muted-foreground/20 hover:border-muted-foreground/40",
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
    <div className={cn("flex items-center gap-2 p-3 rounded-md border-2 border-primary/20 bg-muted/20", className)}>
      <div className="flex-1">
        <Input
          ref={inputRef}
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Enter issue title..."
          className="border-none bg-transparent p-0 text-sm focus:ring-0 focus-visible:ring-0"
        />
      </div>
      <div className="flex gap-1">
        <Button
          size="sm"
          onClick={handleSubmit}
          disabled={!title.trim()}
          className="h-6 w-6 p-0"
        >
          <Check className="w-3 h-3" />
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={handleCancel}
          className="h-6 w-6 p-0"
        >
          <X className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
}