/**
 * Tauri File System Service
 * 
 * Implementation of IFileSystemService using Tauri backend (Rust)
 */

import { invoke } from '@tauri-apps/api/core';
import { FileSystemItem } from '../domain/models';
import { IFileSystemService } from '../domain/interfaces';

export class TauriFileSystemService implements IFileSystemService {
  
  async readDirectory(path: string): Promise<FileSystemItem[]> {
    try {
      const items = await invoke<any[]>('read_dir', { path });
      return items.map(this.mapToFileSystemItem);
    } catch (error) {
      console.error('Failed to read directory:', error);
      throw new Error(`Failed to read directory: ${error}`);
    }
  }

  async getCurrentDirectory(): Promise<string> {
    try {
      return await invoke<string>('get_current_dir');
    } catch (error) {
      console.error('Failed to get current directory:', error);
      throw new Error(`Failed to get current directory: ${error}`);
    }
  }

  async navigateToDirectory(path: string): Promise<FileSystemItem[]> {
    return this.readDirectory(path);
  }

  async createFile(path: string, content: string = ''): Promise<FileSystemItem> {
    try {
      await invoke('create_file', { path, content });
      return this.getItemInfo(path);
    } catch (error) {
      console.error('Failed to create file:', error);
      throw new Error(`Failed to create file: ${error}`);
    }
  }

  async createDirectory(path: string): Promise<FileSystemItem> {
    try {
      await invoke('create_directory', { path });
      return this.getItemInfo(path);
    } catch (error) {
      console.error('Failed to create directory:', error);
      throw new Error(`Failed to create directory: ${error}`);
    }
  }

  async deleteItem(path: string): Promise<void> {
    try {
      await invoke('delete_file', { path });
    } catch (error) {
      console.error('Failed to delete item:', error);
      throw new Error(`Failed to delete item: ${error}`);
    }
  }

  async renameItem(oldPath: string, newPath: string): Promise<FileSystemItem> {
    try {
      await invoke('rename_file', { oldPath, newPath });
      return this.getItemInfo(newPath);
    } catch (error) {
      console.error('Failed to rename item:', error);
      throw new Error(`Failed to rename item: ${error}`);
    }
  }

  async copyItem(sourcePath: string, destinationPath: string): Promise<FileSystemItem> {
    try {
      await invoke('copy_file', { src: sourcePath, dest: destinationPath });
      return this.getItemInfo(destinationPath);
    } catch (error) {
      console.error('Failed to copy item:', error);
      throw new Error(`Failed to copy item: ${error}`);
    }
  }

  async moveItem(sourcePath: string, destinationPath: string): Promise<FileSystemItem> {
    try {
      await invoke('move_item', { sourcePath, destinationPath });
      return this.getItemInfo(destinationPath);
    } catch (error) {
      console.error('Failed to move item:', error);
      throw new Error(`Failed to move item: ${error}`);
    }
  }

  async exists(path: string): Promise<boolean> {
    try {
      return await invoke<boolean>('file_exists', { path });
    } catch (error) {
      console.error('Failed to check path existence:', error);
      return false;
    }
  }

  async getItemInfo(path: string): Promise<FileSystemItem> {
    try {
      const metadata = await invoke<any>('get_file_metadata', { path });
      return this.mapMetadataToFileSystemItem(metadata);
    } catch (error) {
      console.error('Failed to get item info:', error);
      throw new Error(`Failed to get item info: ${error}`);
    }
  }

  async watchDirectory(path: string, callback: (event: any) => void): Promise<() => void> {
    try {
      // Implementation would use Tauri's file watcher
      const unlisten = await invoke<() => void>('watch_directory', { 
        path, 
        callback: (event: any) => callback(event) 
      });
      return unlisten;
    } catch (error) {
      console.error('Failed to watch directory:', error);
      throw new Error(`Failed to watch directory: ${error}`);
    }
  }

  async getSystemDirectories(): Promise<{
    home: string;
    desktop?: string;
    documents?: string;
    downloads?: string;
    pictures?: string;
    videos?: string;
    music?: string;
  }> {
    try {
      return await invoke('get_system_directories');
    } catch (error) {
      console.error('Failed to get system directories:', error);
      throw new Error(`Failed to get system directories: ${error}`);
    }
  }

  private mapToFileSystemItem(item: any): FileSystemItem {
    return {
      id: item.path || crypto.randomUUID(),
      name: item.name,
      path: item.path,
      type: item.is_directory ? 'directory' : 'file',
      size: item.size,
      lastModified: item.modified_at ? new Date(parseInt(item.modified_at) * 1000) : new Date(),
      permissions: {
        readable: true,
        writable: true,
        executable: false,
      },
      children: item.is_directory ? [] : undefined,
      isExpanded: false,
    };
  }

  private mapMetadataToFileSystemItem(metadata: any): FileSystemItem {
    const pathParts = metadata.path.split(/[/\\]/);
    const name = pathParts[pathParts.length - 1] || metadata.path;
    
    return {
      id: metadata.path || crypto.randomUUID(),
      name,
      path: metadata.path,
      type: metadata.is_directory ? 'directory' : 'file',
      size: metadata.size,
      lastModified: metadata.modified_at ? new Date(parseInt(metadata.modified_at) * 1000) : new Date(),
      permissions: {
        readable: true,
        writable: !metadata.is_readonly,
        executable: false,
      },
      children: metadata.is_directory ? [] : undefined,
      isExpanded: false,
    };
  }
}

/**
 * Mock File System Service for web development
 */
export class MockFileSystemService implements IFileSystemService {
  private mockData: FileSystemItem[] = [
    {
      id: '1',
      name: 'Documents',
      path: '/home/user/Documents',
      type: 'directory',
      lastModified: new Date(),
      children: [
        {
          id: '2',
          name: 'file.txt',
          path: '/home/user/Documents/file.txt',
          type: 'file',
          size: 1024,
          lastModified: new Date(),
        }
      ]
    }
  ];

  async readDirectory(path: string): Promise<FileSystemItem[]> {
    // Simulate async operation
    await new Promise(resolve => setTimeout(resolve, 100));
    
    // Simple mock implementation
    if (path === '/') {
      return this.mockData;
    }
    
    const parentItem = this.findItemByPath(path);
    return parentItem?.children || [];
  }

  async getCurrentDirectory(): Promise<string> {
    return '/home/user';
  }

  async navigateToDirectory(path: string): Promise<FileSystemItem[]> {
    return this.readDirectory(path);
  }

  async createFile(path: string, content: string = ''): Promise<FileSystemItem> {
    const newFile: FileSystemItem = {
      id: crypto.randomUUID(),
      name: path.split('/').pop() || 'newfile',
      path,
      type: 'file',
      size: content.length,
      lastModified: new Date(),
    };
    
    // Add to mock data structure
    this.addItemToMockData(newFile);
    return newFile;
  }

  async createDirectory(path: string): Promise<FileSystemItem> {
    const newDir: FileSystemItem = {
      id: crypto.randomUUID(),
      name: path.split('/').pop() || 'newfolder',
      path,
      type: 'directory',
      lastModified: new Date(),
      children: [],
    };
    
    this.addItemToMockData(newDir);
    return newDir;
  }

  async deleteItem(path: string): Promise<void> {
    // Remove from mock data
    this.removeItemFromMockData(path);
  }

  async renameItem(oldPath: string, newPath: string): Promise<FileSystemItem> {
    const item = this.findItemByPath(oldPath);
    if (!item) {
      throw new Error('Item not found');
    }
    
    item.path = newPath;
    item.name = newPath.split('/').pop() || item.name;
    return item;
  }

  async copyItem(sourcePath: string, destinationPath: string): Promise<FileSystemItem> {
    const sourceItem = this.findItemByPath(sourcePath);
    if (!sourceItem) {
      throw new Error('Source item not found');
    }
    
    const copiedItem: FileSystemItem = {
      ...sourceItem,
      id: crypto.randomUUID(),
      path: destinationPath,
      name: destinationPath.split('/').pop() || sourceItem.name,
    };
    
    this.addItemToMockData(copiedItem);
    return copiedItem;
  }

  async moveItem(sourcePath: string, destinationPath: string): Promise<FileSystemItem> {
    const copiedItem = await this.copyItem(sourcePath, destinationPath);
    await this.deleteItem(sourcePath);
    return copiedItem;
  }

  async exists(path: string): Promise<boolean> {
    return this.findItemByPath(path) !== null;
  }

  async getItemInfo(path: string): Promise<FileSystemItem> {
    const item = this.findItemByPath(path);
    if (!item) {
      throw new Error('Item not found');
    }
    return item;
  }

  async watchDirectory(path: string, callback: (event: any) => void): Promise<() => void> {
    // Mock implementation - return a no-op unsubscribe function
    return () => {};
  }

  async getSystemDirectories(): Promise<{
    home: string;
    desktop?: string;
    documents?: string;
    downloads?: string;
    pictures?: string;
    videos?: string;
    music?: string;
  }> {
    // Mock system directories for development
    return {
      home: '/home/user',
      desktop: '/home/user/Desktop',
      documents: '/home/user/Documents',
      downloads: '/home/user/Downloads',
      pictures: '/home/user/Pictures',
      videos: '/home/user/Videos',
      music: '/home/user/Music',
    };
  }

  private findItemByPath(path: string): FileSystemItem | null {
    const findRecursive = (items: FileSystemItem[]): FileSystemItem | null => {
      for (const item of items) {
        if (item.path === path) {
          return item;
        }
        if (item.children) {
          const found = findRecursive(item.children);
          if (found) return found;
        }
      }
      return null;
    };
    
    return findRecursive(this.mockData);
  }

  private addItemToMockData(newItem: FileSystemItem): void {
    const parentPath = newItem.path.split('/').slice(0, -1).join('/') || '/';
    const parent = this.findItemByPath(parentPath);
    
    if (parent && parent.children) {
      parent.children.push(newItem);
    } else {
      this.mockData.push(newItem);
    }
  }

  private removeItemFromMockData(path: string): void {
    const removeRecursive = (items: FileSystemItem[]): FileSystemItem[] => {
      return items.filter(item => {
        if (item.path === path) {
          return false;
        }
        if (item.children) {
          item.children = removeRecursive(item.children);
        }
        return true;
      });
    };
    
    this.mockData = removeRecursive(this.mockData);
  }
}
