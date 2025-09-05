import React from 'react';
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
} from './ui/context-menu';
import {
  Eye,
  Copy,
  Scissors,
  Trash2,
  Star,
  Download,
  Share2,
  Edit,
  FolderOpen,
  Info,
  GitBranch,
  GitCommit,
  Archive,
  RefreshCw,
  Plus,
  Minus,
  RotateCcw,
  FileX,
  ExternalLink,
  Package,
  ChevronRight
} from 'lucide-react';

interface FileItem {
  id: string;
  name: string;
  type: 'folder' | 'file';
  size?: string;
  modified: string;
  status?: 'modified' | 'added' | 'deleted' | 'staged' | 'clean';
  starred?: boolean;
  fileType?: string;
}

interface FileContextMenuProps {
  children: React.ReactNode;
  file: FileItem;
  showVersionControl?: boolean;
  availableChangelists?: Array<{ id: string; name: string }>;
  onAction: (action: string, file: FileItem, extra?: any) => void;
}

export function FileContextMenu({ children, file, showVersionControl = false, availableChangelists = [], onAction }: FileContextMenuProps) {
  const handleAction = (action: string, extra?: any) => {
    onAction(action, file, extra);
  };

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        {children}
      </ContextMenuTrigger>
      <ContextMenuContent className="w-48">
        <ContextMenuItem onClick={() => handleAction('open')}>
          <Eye className="w-4 h-4 mr-2" />
          Open
        </ContextMenuItem>
        
        {file.type === 'folder' && (
          <ContextMenuItem onClick={() => handleAction('open-in-new-tab')}>
            <FolderOpen className="w-4 h-4 mr-2" />
            Open in New Tab
          </ContextMenuItem>
        )}

        <ContextMenuItem onClick={() => handleAction('open-external')}>
          <ExternalLink className="w-4 h-4 mr-2" />
          Open in External Editor
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuItem onClick={() => handleAction('copy')}>
          <Copy className="w-4 h-4 mr-2" />
          Copy
        </ContextMenuItem>
        
        <ContextMenuItem onClick={() => handleAction('cut')}>
          <Scissors className="w-4 h-4 mr-2" />
          Cut
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuItem onClick={() => handleAction('rename')}>
          <Edit className="w-4 h-4 mr-2" />
          Rename
        </ContextMenuItem>

        <ContextMenuItem onClick={() => handleAction('download')}>
          <Download className="w-4 h-4 mr-2" />
          Download
        </ContextMenuItem>

        <ContextMenuItem onClick={() => handleAction('share')}>
          <Share2 className="w-4 h-4 mr-2" />
          Share
        </ContextMenuItem>

        {file.type === 'folder' && (
          <ContextMenuItem onClick={() => handleAction('compress')}>
            <Archive className="w-4 h-4 mr-2" />
            Compress
          </ContextMenuItem>
        )}

        <ContextMenuSeparator />

        <ContextMenuItem onClick={() => handleAction('star')}>
          <Star className={`w-4 h-4 mr-2 ${file.starred ? 'fill-yellow-400 text-yellow-400' : ''}`} />
          {file.starred ? 'Remove Star' : 'Add Star'}
        </ContextMenuItem>

        {/* Version Control Actions */}
        {showVersionControl && (
          <>
            <ContextMenuSeparator />
            
            {file.status !== 'staged' && file.status !== 'clean' && file.status && (
              <ContextMenuItem onClick={() => handleAction('stage')}>
                <Plus className="w-4 h-4 mr-2" />
                Stage Changes
              </ContextMenuItem>
            )}
            
            {file.status === 'staged' && (
              <ContextMenuItem onClick={() => handleAction('unstage')}>
                <Minus className="w-4 h-4 mr-2" />
                Unstage Changes
              </ContextMenuItem>
            )}
            
            {file.status && file.status !== 'clean' && (
              <ContextMenuItem onClick={() => handleAction('diff')}>
                <Eye className="w-4 h-4 mr-2" />
                Show Diff
              </ContextMenuItem>
            )}
            
            {availableChangelists.length > 0 && (
              <ContextMenuSub>
                <ContextMenuSubTrigger>
                  <Package className="w-4 h-4 mr-2" />
                  Add to Changelist
                  <ChevronRight className="ml-auto h-4 w-4" />
                </ContextMenuSubTrigger>
                <ContextMenuSubContent>
                  {availableChangelists.map((changelist) => (
                    <ContextMenuItem 
                      key={changelist.id}
                      onClick={() => handleAction('add-to-changelist', changelist.id)}
                    >
                      <Package className="w-4 h-4 mr-2" />
                      {changelist.name}
                    </ContextMenuItem>
                  ))}
                </ContextMenuSubContent>
              </ContextMenuSub>
            )}
            
            <ContextMenuItem onClick={() => handleAction('ignore')}>
              <FileX className="w-4 h-4 mr-2" />
              Add to .gitignore
            </ContextMenuItem>
            
            {file.status && file.status !== 'staged' && file.status !== 'clean' && (
              <ContextMenuItem 
                onClick={() => handleAction('discard')}
                className="text-red-600 focus:text-red-600"
              >
                <RotateCcw className="w-4 h-4 mr-2" />
                Discard Changes
              </ContextMenuItem>
            )}
          </>
        )}

        <ContextMenuSeparator />

        <ContextMenuItem onClick={() => handleAction('properties')}>
          <Info className="w-4 h-4 mr-2" />
          Properties
        </ContextMenuItem>

        <ContextMenuSeparator />

        <ContextMenuItem 
          onClick={() => handleAction('delete')}
          className="text-red-600 focus:text-red-600"
        >
          <Trash2 className="w-4 h-4 mr-2" />
          Delete
        </ContextMenuItem>
      </ContextMenuContent>
    </ContextMenu>
  );
}