import React, { useState, useEffect } from 'react';
import {
  Clock,
  Star,
  Share2,
  HardDrive,
  Folder,
  Download,
  Cloud,
  ChevronRight,
  ChevronDown,
  Home,
  FileImage,
  Music,
  Video,
} from 'lucide-react';
import { Button } from './ui/button';
import { TauriFileSystemService } from '../core/infrastructure/file-system.service';

interface SidebarItem {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  path?: string;
  children?: SidebarItem[];
}

interface FileSidebarProps {
  isDark: boolean;
  onNavigate: (path: string) => void;
  currentPath: string;
}

export const FileSidebar: React.FC<FileSidebarProps> = ({ 
  isDark, 
  onNavigate, 
  currentPath 
}) => {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['quick-access', 'favorites', 'this-pc']));
  const [systemDirectories, setSystemDirectories] = useState<{
    home: string;
    desktop?: string;
    documents?: string;
    downloads?: string;
    pictures?: string;
    videos?: string;
    music?: string;
  } | null>(null);
  const [starredPaths, setStarredPaths] = useState<string[]>([]);

  useEffect(() => {
    // Subscribe to favorites store if available (lazy import to avoid cycles)
    let unsub: (() => void) | undefined;
    try {
      // dynamic import to avoid circular import during module load
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { favoritesStore } = require('../core/infrastructure/favorites.store');
      unsub = favoritesStore.subscribe((list: string[]) => setStarredPaths(list));
    } catch (e) {
      // ignore
    }
    return () => { if (unsub) unsub(); };
  }, []);

  const fileSystemService = new TauriFileSystemService();

  useEffect(() => {
    const loadSystemDirectories = async () => {
      try {
        const dirs = await fileSystemService.getSystemDirectories();

        // Verify downloads actually exists on disk; if not, do not expose it
        if (dirs.downloads) {
          try {
            const exists = await fileSystemService.exists(dirs.downloads);
            if (!exists) {
              dirs.downloads = undefined;
            }
          } catch (e) {
            // If the exists check fails for any reason, hide downloads to be safe
            dirs.downloads = undefined;
          }
        }

        setSystemDirectories(dirs);
      } catch (error) {
        console.error('Failed to load system directories:', error);
        // Fallback to mock directories
        setSystemDirectories({
          home: '/Users/' + (process.env.USER || 'user'),
          desktop: undefined,
          documents: undefined,
          downloads: undefined,
          pictures: undefined,
          videos: undefined,
          music: undefined,
        });
      }
    };

    loadSystemDirectories();
  }, []);

  // Use virtual paths for special/aggregate views so the explorer can handle them
  const quickAccessItems: SidebarItem[] = [
    { id: 'recent', name: 'Recent files', icon: Clock, path: 'virtual:recent' },
    { id: 'starred', name: 'Starred', icon: Star, path: 'virtual:starred' },
    { id: 'shared', name: 'Shared with me', icon: Share2, path: 'virtual:shared' },
  ];

  // Build favorites items dynamically based on available system directories
  const getFavoritesItems = (): SidebarItem[] => {
    if (!systemDirectories) return [];

    const items: SidebarItem[] = [];

    // Prepend user-starred favorites (persisted)
    for (const path of starredPaths) {
      const short = path.split(/[\/]/).pop() || path;
      items.push({ id: `fav-${short}-${path}`, name: short, icon: Folder, path });
    }

    if (systemDirectories.home) {
      items.push({ id: 'home', name: 'Home', icon: Home, path: systemDirectories.home });
    }

    if (systemDirectories.desktop) {
      items.push({ id: 'desktop', name: 'Desktop', icon: HardDrive, path: systemDirectories.desktop });
    }

    if (systemDirectories.documents) {
      items.push({ id: 'documents', name: 'Documents', icon: Folder, path: systemDirectories.documents });
    }

    // Provide a sensible Downloads fallback using home directory if missing
    const downloadsPath = systemDirectories.downloads || (systemDirectories.home ? `${systemDirectories.home}/Downloads` : undefined);
    if (downloadsPath) {
      items.push({ id: 'downloads', name: 'Downloads', icon: Download, path: downloadsPath });
    }

    if (systemDirectories.pictures) {
      items.push({ id: 'pictures', name: 'Pictures', icon: FileImage, path: systemDirectories.pictures });
    }

    if (systemDirectories.videos) {
      items.push({ id: 'videos', name: 'Videos', icon: Video, path: systemDirectories.videos });
    }

    if (systemDirectories.music) {
      items.push({ id: 'music', name: 'Music', icon: Music, path: systemDirectories.music });
    }

    return items;
  };

  // Get platform-specific disk items
  const getThisPCItems = (): SidebarItem[] => {
    const platform = navigator.platform.toLowerCase();
    
    if (platform.includes('win')) {
      // Windows drives
      return [
        { id: 'local-disk-c', name: 'Local Disk (C:)', icon: HardDrive, path: 'C:\\' },
        { id: 'data-disk-d', name: 'Data (D:)', icon: HardDrive, path: 'D:\\' },
      ];
    } else if (platform.includes('mac')) {
      // macOS volumes
      return [
        { id: 'macintosh-hd', name: 'Macintosh HD', icon: HardDrive, path: '/' },
        { id: 'volumes', name: 'Volumes', icon: HardDrive, path: '/Volumes' },
      ];
    } else {
      // Linux filesystems
      return [
        { id: 'root', name: 'Root (/)', icon: HardDrive, path: '/' },
        { id: 'home', name: 'Home', icon: Folder, path: '/home' },
        { id: 'media', name: 'Media', icon: HardDrive, path: '/media' },
        { id: 'mnt', name: 'Mount', icon: HardDrive, path: '/mnt' },
      ];
    }
  };

  const networkItems: SidebarItem[] = [
    { id: 'onedrive', name: 'OneDrive', icon: Cloud, path: 'onedrive' },
  ];

  const toggleSection = (sectionId: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(sectionId)) {
      newExpanded.delete(sectionId);
    } else {
      newExpanded.add(sectionId);
    }
    setExpandedSections(newExpanded);
  };

  const renderSidebarItem = (item: SidebarItem, level = 0) => {
    const Icon = item.icon;
    const isActive = currentPath === item.path;
    
    return (
      <Button
        key={item.id}
        variant="ghost"
        className={`w-full justify-start h-8 px-2 text-sm font-normal glass-item ${
          level > 0 ? 'ml-4' : ''
        } ${
          isActive 
            ? isDark 
              ? 'bg-gray-800/80 text-blue-400 hover:bg-gray-700/80' 
              : 'bg-blue-100/80 text-blue-700 hover:bg-blue-200/80'
            : isDark
              ? 'hover:bg-gray-800/50 text-gray-300'
              : 'hover:bg-gray-100/50 text-gray-700'
        }`}
        onClick={() => item.path && onNavigate(item.path)}
      >
        <Icon className="w-4 h-4 mr-3 flex-shrink-0" />
        <span className="truncate text-left">{item.name}</span>
      </Button>
    );
  };

  const renderSection = (
    sectionId: string, 
    title: string, 
    items: SidebarItem[], 
    showProgress?: { used: number; total: number; color: string }
  ) => {
    const isExpanded = expandedSections.has(sectionId);
    
    return (
      <div className="mb-4">
        <Button
          variant="ghost"
          className={`w-full justify-start h-6 px-2 text-xs font-medium glass-item ${
            isDark ? 'text-gray-400 hover:text-gray-300 hover:bg-gray-800/50' : 'text-gray-600 hover:text-gray-700 hover:bg-gray-100/50'
          }`}
          onClick={() => toggleSection(sectionId)}
        >
          {isExpanded ? (
            <ChevronDown className="w-3 h-3 mr-1" />
          ) : (
            <ChevronRight className="w-3 h-3 mr-1" />
          )}
          <span className="text-left">{title}</span>
        </Button>
        
        {isExpanded && (
          <div className="space-y-1 mt-1">
            {items.map(item => renderSidebarItem(item))}
            {showProgress && (
              <div className="px-2 py-2">
                <div className={`w-full h-2 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                  <div 
                    className={`h-full rounded ${showProgress.color}`}
                    style={{ width: `${(showProgress.used / showProgress.total) * 100}%` }}
                  />
                </div>
                <div className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                  {showProgress.used} GB free of {showProgress.total} GB
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`w-64 h-full border-r glass-panel backdrop-blur-xl ${
      isDark 
        ? 'bg-gray-950/50 border-gray-800' 
        : 'bg-gray-50/50 border-gray-200'
    } overflow-y-auto`}>
      <div className="p-3">
        {/* Quick Access */}
        {renderSection('quick-access', 'Quick access', quickAccessItems)}
        
        {/* Favorites */}
        {renderSection('favorites', 'Favorites', getFavoritesItems())}
        
        {/* This PC */}
        {renderSection('this-pc', 'This PC', getThisPCItems())}
        
        {/* Progress bars for drives */}
        {expandedSections.has('this-pc') && (
          <div className="space-y-3 px-2">
            <div>
              <div className={`w-full h-2 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <div className="h-full rounded bg-blue-500" style={{ width: '75%' }} />
              </div>
              <div className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                256 GB free
              </div>
            </div>
            <div>
              <div className={`w-full h-2 rounded ${isDark ? 'bg-gray-700' : 'bg-gray-200'}`}>
                <div className="h-full rounded bg-purple-500" style={{ width: '45%' }} />
              </div>
              <div className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
                1.2 TB free
              </div>
            </div>
          </div>
        )}
        
        {/* Network */}
        {renderSection('network', 'Network', networkItems)}
        
        {/* OneDrive status */}
        {expandedSections.has('network') && (
          <div className="px-2">
            <div className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-600'}`}>
              Synced
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
