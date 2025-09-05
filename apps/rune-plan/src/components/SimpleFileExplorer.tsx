import React, { useState, useEffect } from 'react';
import { 
  Folder, 
  FolderOpen, 
  File, 
  FileText, 
  FileImage, 
  FileCode, 
  FileVideo,
  FileAudio,
  Archive,
  ChevronRight,
  ChevronDown,
  ArrowLeft,
  Home,
  RefreshCw
} from 'lucide-react';
import { Button } from './ui/button';
import { fileService, FileItem } from '../services/TauriFileService';

interface SimpleFileExplorerProps {
  className?: string;
}

export function SimpleFileExplorer({ className = '' }: SimpleFileExplorerProps) {
  const [currentPath, setCurrentPath] = useState<string>('');
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set());

  // Load initial directory (home directory)
  useEffect(() => {
    loadHomeDirectory();
  }, []);

  const loadHomeDirectory = async () => {
    try {
      setLoading(true);
      setError(null);
      const homeDir = await fileService.getHomeDirectory();
      setCurrentPath(homeDir);
      await loadDirectory(homeDir);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load home directory');
    } finally {
      setLoading(false);
    }
  };

  const loadDirectory = async (path: string) => {
    try {
      setLoading(true);
      setError(null);
      const items = await fileService.readDirectory(path);
      setFiles(items);
      setCurrentPath(path);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load directory');
    } finally {
      setLoading(false);
    }
  };

  const navigateUp = () => {
    const parentPath = currentPath.split('/').slice(0, -1).join('/') || '/';
    loadDirectory(parentPath);
  };

  const handleItemClick = (item: FileItem) => {
    if (item.isDirectory) {
      loadDirectory(item.path);
    } else {
      // For now, just show that file was clicked
      console.log('File clicked:', item.path);
    }
  };

  const getFileIcon = (item: FileItem) => {
    if (item.isDirectory) {
      return expandedFolders.has(item.path) ? (
        <FolderOpen className="w-4 h-4 text-blue-500" />
      ) : (
        <Folder className="w-4 h-4 text-blue-500" />
      );
    }

    const fileType = fileService.getFileType(item.name);
    const iconClass = "w-4 h-4 text-gray-600";

    switch (fileType) {
      case 'text':
        return <FileText className={iconClass} />;
      case 'image':
        return <FileImage className={iconClass} />;
      case 'code':
        return <FileCode className={iconClass} />;
      case 'video':
        return <FileVideo className={iconClass} />;
      case 'audio':
        return <FileAudio className={iconClass} />;
      case 'archive':
        return <Archive className={iconClass} />;
      default:
        return <File className={iconClass} />;
    }
  };

  const formatFileSize = (size?: number) => {
    if (!size) return '';
    
    const units = ['B', 'KB', 'MB', 'GB'];
    let unitIndex = 0;
    let fileSize = size;
    
    while (fileSize >= 1024 && unitIndex < units.length - 1) {
      fileSize /= 1024;
      unitIndex++;
    }
    
    return `${fileSize.toFixed(1)} ${units[unitIndex]}`;
  };

  const formatDate = (date?: Date) => {
    if (!date) return '';
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  };

  return (
    <div className={`h-full flex flex-col bg-white dark:bg-gray-900 ${className}`}>
      {/* Toolbar */}
      <div className="flex items-center gap-2 p-3 border-b border-gray-200 dark:border-gray-700">
        <Button
          variant="outline"
          size="sm"
          onClick={navigateUp}
          disabled={currentPath === '/' || currentPath === ''}
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={loadHomeDirectory}
        >
          <Home className="w-4 h-4" />
        </Button>
        
        <Button
          variant="outline"
          size="sm"
          onClick={() => loadDirectory(currentPath)}
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
        
        <div className="flex-1 px-3 py-1 text-sm text-gray-600 dark:text-gray-300 bg-gray-50 dark:bg-gray-800 rounded border truncate">
          {currentPath}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto">
        {error && (
          <div className="p-4 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-b border-red-200 dark:border-red-800">
            {error}
          </div>
        )}
        
        {loading && (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            Loading...
          </div>
        )}
        
        {!loading && !error && files.length === 0 && (
          <div className="p-4 text-center text-gray-500 dark:text-gray-400">
            This directory is empty
          </div>
        )}
        
        {!loading && !error && files.length > 0 && (
          <div className="divide-y divide-gray-200 dark:divide-gray-700">
            {files.map((item, index) => (
              <div
                key={index}
                className="flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 cursor-pointer"
                onClick={() => handleItemClick(item)}
              >
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  {getFileIcon(item)}
                  <span className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                    {item.name}
                  </span>
                </div>
                
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                  {!item.isDirectory && (
                    <span className="w-16 text-right">{formatFileSize(item.size)}</span>
                  )}
                  <span className="w-32 text-right">{formatDate(item.modified)}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
