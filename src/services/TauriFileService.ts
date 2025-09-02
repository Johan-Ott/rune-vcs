import { invoke } from '@tauri-apps/api/core';

export interface FileItem {
  name: string;
  path: string;
  isDirectory: boolean;
  size?: number;
  modified?: Date;
  extension?: string;
}

export class TauriFileService {
  private isTauriEnvironment(): boolean {
    return typeof window !== 'undefined' && (window as any).__TAURI__;
  }

  private getMockData(): FileItem[] {
    return [
      {
        name: 'Projects',
        path: '/Users/john/Documents/Projects',
        isDirectory: true,
        modified: new Date(Date.now() - 86400000),
        extension: undefined
      },
      {
        name: 'Notes.txt',
        path: '/Users/john/Documents/Notes.txt',
        isDirectory: false,
        size: 2400,
        modified: new Date(Date.now() - 3600000),
        extension: 'txt'
      },
      {
        name: 'Resume.pdf',
        path: '/Users/john/Documents/Resume.pdf',
        isDirectory: false,
        size: 145000,
        modified: new Date(Date.now() - 86400000 * 7),
        extension: 'pdf'
      }
    ];
  }

  /**
   * Read directory contents
   */
  async readDirectory(path: string): Promise<FileItem[]> {
    if (!this.isTauriEnvironment()) {
      // Return mock data for web environment
      return this.getMockData();
    }
    
    try {
      const entries = await invoke('read_dir', { path });
      
      return (entries as any[]).map(entry => ({
        name: entry.name,
        path: entry.path,
        isDirectory: entry.is_directory,
        size: entry.size,
        modified: entry.modified_at ? new Date(entry.modified_at) : undefined,
        extension: entry.is_directory ? undefined : this.getFileExtension(entry.name)
      }));
    } catch (error) {
      console.error('Failed to read directory:', error);
      throw new Error(`Failed to read directory: ${error}`);
    }
  }

  /**
   * Read file contents
   */
  async readFile(path: string): Promise<string> {
    try {
      return await invoke('read_file', { path });
    } catch (error) {
      console.error('Failed to read file:', error);
      throw new Error(`Failed to read file: ${error}`);
    }
  }

  /**
   * Read binary file and return a data URL (base64) for previews
   */
  async readFileDataUrl(path: string): Promise<string> {
    try {
      return await invoke('read_file_dataurl', { path });
    } catch (error) {
      console.error('Failed to read file dataurl:', error);
      throw new Error(`Failed to read file dataurl: ${error}`);
    }
  }

  /**
   * Open a file with the system default application
   */
  async openWithDefault(path: string): Promise<boolean> {
    try {
      return await invoke('open_with_default', { path });
    } catch (error) {
      console.error('Failed to open with default:', error);
      return false;
    }
  }

  /**
   * Write file contents
   */
  async writeFile(path: string, contents: string): Promise<void> {
    try {
      await invoke('write_file', { path, contents });
    } catch (error) {
      console.error('Failed to write file:', error);
      throw new Error(`Failed to write file: ${error}`);
    }
  }

  /**
   * Check if file/directory exists
   */
  async exists(path: string): Promise<boolean> {
    try {
      return await invoke('file_exists', { path });
    } catch (error) {
      console.error('Failed to check if file exists:', error);
      return false;
    }
  }

  /**
   * Get user's home directory
   */
  async getHomeDirectory(): Promise<string> {
    try {
      return await invoke('get_home_dir');
    } catch (error) {
      console.error('Failed to get home directory:', error);
      throw new Error(`Failed to get home directory: ${error}`);
    }
  }

  /**
   * Get current working directory
   */
  async getCurrentDirectory(): Promise<string> {
    if (!this.isTauriEnvironment()) {
      return '/Users/john/Documents';
    }
    
    try {
      return await invoke('get_current_dir');
    } catch (error) {
      console.error('Failed to get current directory:', error);
      throw new Error(`Failed to get current directory: ${error}`);
    }
  }

  /**
   * Get file extension from filename
   */
  private getFileExtension(filename: string): string | undefined {
    const lastDot = filename.lastIndexOf('.');
    if (lastDot === -1 || lastDot === 0) return undefined;
    return filename.slice(lastDot + 1).toLowerCase();
  }

  /**
   * Get file type icon based on extension
   */
  getFileType(filename: string): 'text' | 'image' | 'code' | 'video' | 'audio' | 'archive' | 'unknown' {
    const ext = this.getFileExtension(filename);
    if (!ext) return 'unknown';

    const textExts = ['txt', 'md', 'rtf', 'doc', 'docx', 'pdf'];
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'bmp', 'svg', 'webp'];
    const codeExts = ['js', 'ts', 'tsx', 'jsx', 'py', 'rs', 'go', 'cpp', 'c', 'java', 'php', 'rb', 'css', 'html', 'json', 'xml', 'yaml', 'yml'];
    const videoExts = ['mp4', 'avi', 'mov', 'mkv', 'webm', 'flv'];
    const audioExts = ['mp3', 'wav', 'flac', 'aac', 'ogg'];
    const archiveExts = ['zip', 'tar', 'gz', 'rar', '7z', 'bz2'];

    if (textExts.includes(ext)) return 'text';
    if (imageExts.includes(ext)) return 'image';
    if (codeExts.includes(ext)) return 'code';
    if (videoExts.includes(ext)) return 'video';
    if (audioExts.includes(ext)) return 'audio';
    if (archiveExts.includes(ext)) return 'archive';

    return 'unknown';
  }
}

export const fileService = new TauriFileService();
