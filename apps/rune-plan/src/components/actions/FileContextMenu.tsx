import React from 'react';
import {
  Copy,
  Cut,
  Paste,
  Trash2,
  Edit,
  Star,
  StarOff,
  FolderOpen,
  Download,
  Share,
  Info,
  MoreHorizontal,
  FileText,
  Archive,
  RefreshCw,
  Eye,
  EyeOff,
  Lock,
  Unlock
} from 'lucide-react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  ContextMenuTrigger,
  ContextMenuShortcut,
} from '../ui/context-menu';

interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  size?: string;
  modified?: string;
  starred?: boolean;
  status?: string;
  fileType?: string;
}

interface FileContextMenuProps {
  children: React.ReactNode;
  file: FileItem;
  onCopy: (file: FileItem) => void;
  onCut: (file: FileItem) => void;
  onPaste: (targetFile: FileItem) => void;
  onDelete: (file: FileItem) => void;
  onRename: (file: FileItem) => void;
  onToggleStar: (file: FileItem) => void;
  onOpen: (file: FileItem) => void;
  onOpenWith: (file: FileItem, application: string) => void;
  onDownload: (file: FileItem) => void;
  onShare: (file: FileItem) => void;
  onShowInfo: (file: FileItem) => void;
  onRefresh?: () => void;
  canPaste?: boolean;
  selectedFiles?: FileItem[];
  className?: string;
}

export const FileContextMenu: React.FC<FileContextMenuProps> = ({
  children,
  file,
  onCopy,
  onCut,
  onPaste,
  onDelete,
  onRename,
  onToggleStar,
  onOpen,
  onOpenWith,
  onDownload,
  onShare,
  onShowInfo,
  onRefresh,
  canPaste = false,
  selectedFiles = [],
  className = '',
}) => {
  const isMultipleSelected = selectedFiles.length > 1;
  const isStarred = file.starred;
  const isFolder = file.type === 'folder';

  const handleAction = (action: () => void) => {
    action();
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger className={className}>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-64">
        {/* Primary Actions */}
        <ContextMenuItem onClick={() => handleAction(() => onOpen(file))}>
          <FolderOpen className="w-4 h-4 mr-2" />
          {isFolder ? 'Open Folder' : 'Open'}
          <ContextMenuShortcut>⏎</ContextMenuShortcut>
        </ContextMenuItem>

        {!isFolder && (
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <FileText className="w-4 h-4 mr-2" />
              Open with
            </ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuItem onClick={() => handleAction(() => onOpenWith(file, 'default'))}>
                Default Application
              </ContextMenuItem>
              <ContextMenuItem onClick={() => handleAction(() => onOpenWith(file, 'text-editor'))}>
                Text Editor
              </ContextMenuItem>
              <ContextMenuItem onClick={() => handleAction(() => onOpenWith(file, 'code-editor'))}>
                Code Editor
              </ContextMenuItem>
              {file.fileType?.includes('image') && (
                <ContextMenuItem onClick={() => handleAction(() => onOpenWith(file, 'image-viewer'))}>
                  Image Viewer
                </ContextMenuItem>
              )}
            </ContextMenuSubContent>
          </ContextMenuSub>
        )}

        <ContextMenuSeparator />

        {/* Edit Actions */}
        <ContextMenuItem onClick={() => handleAction(() => onCopy(file))}>
          <Copy className="w-4 h-4 mr-2" />
          {isMultipleSelected ? `Copy ${selectedFiles.length} items` : 'Copy'}
          <ContextMenuShortcut>⌘C</ContextMenuShortcut>
        </ContextMenuItem>

        <ContextMenuItem onClick={() => handleAction(() => onCut(file))}>
          <Cut className="w-4 h-4 mr-2" />
          {isMultipleSelected ? `Cut ${selectedFiles.length} items` : 'Cut'}
          <ContextMenuShortcut>⌘X</ContextMenuShortcut>
        </ContextMenuItem>

        {canPaste && (
          <ContextMenuItem onClick={() => handleAction(() => onPaste(file))}>
            <Paste className="w-4 h-4 mr-2" />
            Paste
            <ContextMenuShortcut>⌘V</ContextMenuShortcut>
          </ContextMenuItem>
        )}

        <ContextMenuSeparator />

        {/* File Management */}
        <ContextMenuItem onClick={() => handleAction(() => onRename(file))}>
          <Edit className="w-4 h-4 mr-2" />
          Rename
          <ContextMenuShortcut>F2</ContextMenuShortcut>
        </ContextMenuItem>

        <ContextMenuItem onClick={() => handleAction(() => onToggleStar(file))}>
          {isStarred ? (
            <>
              <StarOff className="w-4 h-4 mr-2" />
              Remove from Favorites
            </>
          ) : (
            <>
              <Star className="w-4 h-4 mr-2" />
              Add to Favorites
            </>
          )}
        </ContextMenuItem>

        {!isFolder && (
          <ContextMenuItem onClick={() => handleAction(() => onDownload(file))}>
            <Download className="w-4 h-4 mr-2" />
            Download
            <ContextMenuShortcut>⌘D</ContextMenuShortcut>
          </ContextMenuItem>
        )}

        <ContextMenuItem onClick={() => handleAction(() => onShare(file))}>
          <Share className="w-4 h-4 mr-2" />
          Share
        </ContextMenuItem>

        <ContextMenuSeparator />

        {/* Advanced Actions */}
        {isFolder && (
          <ContextMenuSub>
            <ContextMenuSubTrigger>
              <Archive className="w-4 h-4 mr-2" />
              Archive
            </ContextMenuSubTrigger>
            <ContextMenuSubContent>
              <ContextMenuItem>
                Create ZIP
              </ContextMenuItem>
              <ContextMenuItem>
                Create TAR
              </ContextMenuItem>
              <ContextMenuItem>
                Create 7Z
              </ContextMenuItem>
            </ContextMenuSubContent>
          </ContextMenuSub>
        )}

        {isFolder && onRefresh && (
          <ContextMenuItem onClick={() => handleAction(onRefresh)}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
            <ContextMenuShortcut>F5</ContextMenuShortcut>
          </ContextMenuItem>
        )}

        <ContextMenuItem onClick={() => handleAction(() => onShowInfo(file))}>
          <Info className="w-4 h-4 mr-2" />
          Get Info
          <ContextMenuShortcut>⌘I</ContextMenuShortcut>
        </ContextMenuItem>

        <ContextMenuSeparator />

        {/* Danger Zone */}
        <ContextMenuItem 
          onClick={() => handleAction(() => onDelete(file))}
          className="text-red-600 focus:text-red-600"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          {isMultipleSelected ? `Delete ${selectedFiles.length} items` : 'Delete'}
          <ContextMenuShortcut>⌘⌫</ContextMenuShortcut>
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
};
