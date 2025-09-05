// Utility functions for common operations

import { invoke } from '@tauri-apps/api/core';
import { APIResponse, FileInfo, VCSStatus } from './types';

export class APIUtils {
  /**
   * Safely invoke a Tauri command with error handling
   */
  static async safeInvoke<T>(command: string, args?: Record<string, any>): Promise<APIResponse<T>> {
    try {
      const data = await invoke<T>(command, args);
      return {
        data,
        success: true
      };
    } catch (error) {
      return {
        data: null as any,
        success: false,
        error: error instanceof Error ? error.message : String(error)
      };
    }
  }

  /**
   * Format file size in human readable format
   */
  static formatFileSize(bytes: number): string {
    const units = ['B', 'KB', 'MB', 'GB', 'TB'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    return `${size.toFixed(unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
  }

  /**
   * Format date for display
   */
  static formatDate(dateString: string): string {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays === 0) {
      return 'Today';
    } else if (diffDays === 1) {
      return 'Yesterday';
    } else if (diffDays < 7) {
      return `${diffDays} days ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  /**
   * Get file extension from path
   */
  static getFileExtension(path: string): string {
    const lastDot = path.lastIndexOf('.');
    return lastDot > 0 ? path.substring(lastDot + 1) : '';
  }

  /**
   * Get file name from path
   */
  static getFileName(path: string): string {
    return path.split('/').pop() || path.split('\\').pop() || path;
  }

  /**
   * Get directory path from file path
   */
  static getDirectoryPath(path: string): string {
    const parts = path.split('/');
    parts.pop();
    return parts.join('/') || '/';
  }

  /**
   * Check if path is a file or directory based on FileInfo
   */
  static isFile(fileInfo: FileInfo): boolean {
    return fileInfo.file_type === 'file';
  }

  /**
   * Check if path is a directory based on FileInfo
   */
  static isDirectory(fileInfo: FileInfo): boolean {
    return fileInfo.file_type === 'directory';
  }

  /**
   * Get status icon for VCS status
   */
  static getVCSStatusIcon(status: VCSStatus['status']): string {
    switch (status) {
      case 'modified': return '●';
      case 'added': return '+';
      case 'deleted': return '-';
      case 'untracked': return '?';
      case 'staged': return '✓';
      case 'conflicted': return '!';
      case 'clean': return '';
      default: return '';
    }
  }

  /**
   * Get status color for VCS status
   */
  static getVCSStatusColor(status: VCSStatus['status']): string {
    switch (status) {
      case 'modified': return '#ff9500'; // orange
      case 'added': return '#00ff00'; // green
      case 'deleted': return '#ff0000'; // red
      case 'untracked': return '#999999'; // gray
      case 'staged': return '#0066ff'; // blue
      case 'conflicted': return '#ff0066'; // pink
      case 'clean': return '#666666'; // dark gray
      default: return '#000000'; // black
    }
  }

  /**
   * Debounce function calls
   */
  static debounce<T extends (...args: any[]) => any>(
    func: T,
    waitMs: number
  ): (...args: Parameters<T>) => void {
    let timeoutId: NodeJS.Timeout;
    return (...args: Parameters<T>) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), waitMs);
    };
  }

  /**
   * Throttle function calls
   */
  static throttle<T extends (...args: any[]) => any>(
    func: T,
    limitMs: number
  ): (...args: Parameters<T>) => void {
    let inThrottle = false;
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => inThrottle = false, limitMs);
      }
    };
  }

  /**
   * Validate file path
   */
  static isValidPath(path: string): boolean {
    if (!path || path.trim() === '') return false;
    
    // Check for invalid characters (Windows + Unix)
    const invalidChars = /[<>:"|?*\x00-\x1f]/;
    if (invalidChars.test(path)) return false;
    
    // Check for reserved names (Windows)
    const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\.|$)/i;
    const fileName = this.getFileName(path);
    if (reservedNames.test(fileName)) return false;
    
    return true;
  }

  /**
   * Sanitize file name for cross-platform compatibility
   */
  static sanitizeFileName(name: string): string {
    return name
      .replace(/[<>:"|?*\x00-\x1f]/g, '_') // Replace invalid chars
      .replace(/^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\.|$)/i, '_$1$2') // Handle reserved names
      .trim()
      .replace(/\.$/, '_'); // Remove trailing dot
  }
}
