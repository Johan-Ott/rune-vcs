// File operations service - handles all file system operations
// For Tauri integration: import { invoke } from '@tauri-apps/api/tauri';

// Mock invoke function for development
const invoke = async (command: string, args?: any) => {
  console.log(`Tauri command: ${command}`, args);
  // Simulate async operation
  await new Promise(resolve => setTimeout(resolve, 100));
};

export interface FileItem {
  id: string;
  name: string;
  type: 'file' | 'folder';
  path: string;
  size?: string;
  modified?: string;
  starred?: boolean;
  status?: string;
  fileType?: string;
}

export interface ClipboardData {
  files: FileItem[];
  operation: 'copy' | 'cut';
  timestamp: number;
}

export class FileOperations {
  private static clipboard: ClipboardData | null = null;
  private static listeners: ((clipboard: ClipboardData | null) => void)[] = [];

  // Clipboard operations
  static copy(files: FileItem[]) {
    this.clipboard = {
      files,
      operation: 'copy',
      timestamp: Date.now()
    };
    this.notifyListeners();
  }

  static cut(files: FileItem[]) {
    this.clipboard = {
      files,
      operation: 'cut',
      timestamp: Date.now()
    };
    this.notifyListeners();
  }

  static async paste(targetPath: string): Promise<boolean> {
    if (!this.clipboard) {
      throw new Error('Nothing to paste');
    }

    try {
      const { files, operation } = this.clipboard;
      
      for (const file of files) {
        if (operation === 'copy') {
          await this.copyFile(file.path, `${targetPath}/${file.name}`);
        } else if (operation === 'cut') {
          await this.moveFile(file.path, `${targetPath}/${file.name}`);
        }
      }

      // Clear clipboard after cut operation
      if (operation === 'cut') {
        this.clipboard = null;
        this.notifyListeners();
      }

      return true;
    } catch (error) {
      console.error('Paste operation failed:', error);
      return false;
    }
  }

  static getClipboard(): ClipboardData | null {
    return this.clipboard;
  }

  static canPaste(): boolean {
    return this.clipboard !== null;
  }

  // File system operations
  static async copyFile(sourcePath: string, targetPath: string): Promise<void> {
    try {
      await invoke('copy_file', { sourcePath, targetPath });
    } catch (error) {
      // Fallback for web environment
      console.log('Copy file:', sourcePath, 'to', targetPath);
    }
  }

  static async moveFile(sourcePath: string, targetPath: string): Promise<void> {
    try {
      await invoke('move_file', { sourcePath, targetPath });
    } catch (error) {
      // Fallback for web environment
      console.log('Move file:', sourcePath, 'to', targetPath);
    }
  }

  static async deleteFile(filePath: string): Promise<void> {
    try {
      await invoke('delete_file', { filePath });
    } catch (error) {
      // Fallback for web environment
      console.log('Delete file:', filePath);
    }
  }

  static async renameFile(oldPath: string, newPath: string): Promise<void> {
    try {
      await invoke('rename_file', { oldPath, newPath });
    } catch (error) {
      // Fallback for web environment
      console.log('Rename file:', oldPath, 'to', newPath);
    }
  }

  static async createFolder(folderPath: string): Promise<void> {
    try {
      await invoke('create_folder', { folderPath });
    } catch (error) {
      // Fallback for web environment
      console.log('Create folder:', folderPath);
    }
  }

  static async createFile(filePath: string, content = ''): Promise<void> {
    try {
      await invoke('create_file', { filePath, content });
    } catch (error) {
      // Fallback for web environment
      console.log('Create file:', filePath);
    }
  }

  // Advanced operations
  static async compressFiles(files: FileItem[], outputPath: string, format: 'zip' | 'tar' | '7z' = 'zip'): Promise<void> {
    try {
      const filePaths = files.map(f => f.path);
      await invoke('compress_files', { filePaths, outputPath, format });
    } catch (error) {
      console.log('Compress files:', files.map(f => f.name), 'to', outputPath);
    }
  }

  static async downloadFile(file: FileItem): Promise<void> {
    try {
      await invoke('download_file', { filePath: file.path });
    } catch (error) {
      // Fallback: trigger browser download
      const link = document.createElement('a');
      link.download = file.name;
      link.href = `file://${file.path}`;
      link.click();
    }
  }

  static async shareFiles(files: FileItem[]): Promise<void> {
    if (navigator.share) {
      try {
        await navigator.share({
          title: files.length === 1 ? files[0].name : `${files.length} files`,
          text: files.map(f => f.name).join(', '),
        });
      } catch (error) {
        console.log('Share failed:', error);
      }
    } else {
      // Fallback: copy to clipboard
      const fileNames = files.map(f => f.name).join('\n');
      await navigator.clipboard.writeText(fileNames);
    }
  }

  static async showInFinder(file: FileItem): Promise<void> {
    try {
      await invoke('show_in_finder', { filePath: file.path });
    } catch (error) {
      console.log('Show in finder:', file.path);
    }
  }

  static async getFileInfo(file: FileItem): Promise<any> {
    try {
      return await invoke('get_file_info', { filePath: file.path });
    } catch (error) {
      // Return mock data for web environment
      return {
        name: file.name,
        path: file.path,
        size: file.size,
        modified: file.modified,
        type: file.type,
        permissions: 'rw-r--r--',
        owner: 'user',
        group: 'staff'
      };
    }
  }

  // Event listeners for clipboard changes
  static onClipboardChange(listener: (clipboard: ClipboardData | null) => void) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  private static notifyListeners() {
    this.listeners.forEach(listener => listener(this.clipboard));
  }
}
