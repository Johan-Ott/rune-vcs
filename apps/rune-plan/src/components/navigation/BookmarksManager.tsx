import React, { useState } from 'react';
import { Star, StarOff, FolderOpen, Edit2, Trash2, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '../ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '../ui/tooltip';

interface Bookmark {
  id: string;
  name: string;
  path: string;
  icon?: React.ReactNode;
  dateAdded: number;
}

interface BookmarksManagerProps {
  currentPath: string;
  currentName: string;
  bookmarks: Bookmark[];
  onAddBookmark: (bookmark: Omit<Bookmark, 'id' | 'dateAdded'>) => void;
  onRemoveBookmark: (id: string) => void;
  onUpdateBookmark: (id: string, updates: Partial<Bookmark>) => void;
  onNavigateToBookmark: (path: string) => void;
  isBookmarked: boolean;
  className?: string;
}

export const BookmarksManager: React.FC<BookmarksManagerProps> = ({
  currentPath,
  currentName,
  bookmarks,
  onAddBookmark,
  onRemoveBookmark,
  onUpdateBookmark,
  onNavigateToBookmark,
  isBookmarked,
  className = '',
}) => {
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [newBookmarkName, setNewBookmarkName] = useState('');
  const [editingBookmark, setEditingBookmark] = useState<Bookmark | null>(null);

  const handleToggleBookmark = () => {
    if (isBookmarked) {
      const bookmark = bookmarks.find(b => b.path === currentPath);
      if (bookmark) {
        onRemoveBookmark(bookmark.id);
      }
    } else {
      setNewBookmarkName(currentName);
      setShowAddDialog(true);
    }
  };

  const handleAddBookmark = () => {
    if (newBookmarkName.trim()) {
      onAddBookmark({
        name: newBookmarkName.trim(),
        path: currentPath,
        icon: <FolderOpen className="w-4 h-4" />
      });
      setNewBookmarkName('');
      setShowAddDialog(false);
    }
  };

  const handleEditBookmark = (bookmark: Bookmark, newName: string) => {
    if (newName.trim() && newName !== bookmark.name) {
      onUpdateBookmark(bookmark.id, { name: newName.trim() });
    }
    setEditingBookmark(null);
  };

  const BookmarkToggleButton = () => (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleToggleBookmark}
          className="h-8 w-8 p-0"
        >
          {isBookmarked ? (
            <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
          ) : (
            <StarOff className="w-4 h-4" />
          )}
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        {isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
      </TooltipContent>
    </Tooltip>
  );

  const BookmarksDropdown = () => (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          size="sm"
          className="h-8 px-2"
        >
          <Star className="w-4 h-4" />
          <span className="ml-2 text-sm">Bookmarks</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-64">
        <DropdownMenuLabel className="flex items-center justify-between">
          Bookmarks
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              setNewBookmarkName(currentName);
              setShowAddDialog(true);
            }}
            className="h-6 w-6 p-0"
          >
            <Plus className="w-3 h-3" />
          </Button>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        
        {bookmarks.length === 0 ? (
          <DropdownMenuItem disabled>
            No bookmarks yet
          </DropdownMenuItem>
        ) : (
          <DropdownMenuGroup>
            {bookmarks.map((bookmark) => (
              <DropdownMenuItem
                key={bookmark.id}
                onClick={() => onNavigateToBookmark(bookmark.path)}
                className="flex items-center justify-between group"
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {bookmark.icon}
                  <span className="truncate">{bookmark.name}</span>
                </div>
                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingBookmark(bookmark);
                    }}
                    className="h-6 w-6 p-0"
                  >
                    <Edit2 className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRemoveBookmark(bookmark.id);
                    }}
                    className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                  >
                    <Trash2 className="w-3 h-3" />
                  </Button>
                </div>
              </DropdownMenuItem>
            ))}
          </DropdownMenuGroup>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  );

  return (
    <div className={`flex items-center gap-1 ${className}`}>
      <BookmarkToggleButton />
      <BookmarksDropdown />

      {/* Add Bookmark Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Bookmark</DialogTitle>
            <DialogDescription>
              Add the current location to your bookmarks for quick access.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Name</label>
              <Input
                value={newBookmarkName}
                onChange={(e) => setNewBookmarkName(e.target.value)}
                placeholder="Bookmark name"
                className="mt-1"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleAddBookmark();
                  }
                }}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Path</label>
              <Input
                value={currentPath}
                disabled
                className="mt-1 bg-muted"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddBookmark}>
              Add Bookmark
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Bookmark Dialog */}
      {editingBookmark && (
        <Dialog open={!!editingBookmark} onOpenChange={() => setEditingBookmark(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Bookmark</DialogTitle>
              <DialogDescription>
                Change the name of this bookmark.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">Name</label>
                <Input
                  defaultValue={editingBookmark.name}
                  placeholder="Bookmark name"
                  className="mt-1"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      handleEditBookmark(editingBookmark, (e.target as HTMLInputElement).value);
                    }
                  }}
                  onBlur={(e) => {
                    handleEditBookmark(editingBookmark, e.target.value);
                  }}
                  autoFocus
                />
              </div>
              <div>
                <label className="text-sm font-medium">Path</label>
                <Input
                  value={editingBookmark.path}
                  disabled
                  className="mt-1 bg-muted"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setEditingBookmark(null)}>
                Cancel
              </Button>
              <Button onClick={() => {
                const input = document.querySelector('input:not([disabled])') as HTMLInputElement;
                if (input) {
                  handleEditBookmark(editingBookmark, input.value);
                }
              }}>
                Save Changes
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
};
