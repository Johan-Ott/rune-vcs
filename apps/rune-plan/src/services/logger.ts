// Production-ready Logging Service
// Centralized logging with different levels and outputs

import { config } from '../config';
import { isTauri, safeDynamicImport } from '../utils/envUtils';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  data?: any;
  component?: string;
  operation?: string;
  userId?: string;
}

class Logger {
  private logQueue: LogEntry[] = [];
  private isFlushingLogs = false;
  private maxQueueSize = 1000;
  
  private shouldLog(level: LogLevel): boolean {
    const levels: Record<LogLevel, number> = {
      debug: 0,
      info: 1,
      warn: 2,
      error: 3,
    };
    
    return levels[level] >= levels[config.logging.level];
  }
  
  private createLogEntry(
    level: LogLevel,
    message: string,
    data?: any,
    context?: Partial<Pick<LogEntry, 'component' | 'operation' | 'userId'>>
  ): LogEntry {
    return {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      ...context,
    };
  }
  
  private async writeToConsole(entry: LogEntry): Promise<void> {
    if (!config.logging.enableConsole) return;
    
    const prefix = `[${entry.timestamp}] [${entry.level.toUpperCase()}]`;
    const componentInfo = entry.component ? ` [${entry.component}]` : '';
    const operationInfo = entry.operation ? ` [${entry.operation}]` : '';
    const logMessage = `${prefix}${componentInfo}${operationInfo} ${entry.message}`;
    
    switch (entry.level) {
      case 'debug':
        console.debug(logMessage, entry.data);
        break;
      case 'info':
        console.info(logMessage, entry.data);
        break;
      case 'warn':
        console.warn(logMessage, entry.data);
        break;
      case 'error':
        console.error(logMessage, entry.data);
        break;
    }
  }
  
  private async writeToFile(entry: LogEntry): Promise<void> {
    if (!config.logging.enableFileLogging || !isTauri()) return;
    
    const tauriFs = await safeDynamicImport(
      () => import('@tauri-apps/api/fs'),
      null
    );
    
    if (tauriFs) {
      try {
        const logFileName = `app-${new Date().toISOString().split('T')[0]}.log`;
        const logLine = JSON.stringify(entry) + '\n';
        
        await tauriFs.writeTextFile(logFileName, logLine, {
          dir: tauriFs.BaseDirectory.Log,
          append: true,
        });
      } catch (error) {
        console.warn('File logging failed:', error);
      }
    }
  }
  
  private async flushLogs(): Promise<void> {
    if (this.isFlushingLogs || this.logQueue.length === 0) return;
    
    this.isFlushingLogs = true;
    const logsToFlush = [...this.logQueue];
    this.logQueue = [];
    
    try {
      await Promise.all(
        logsToFlush.map(async (entry) => {
          await Promise.all([
            this.writeToConsole(entry),
            this.writeToFile(entry),
          ]);
        })
      );
    } catch (error) {
      console.error('Failed to flush logs:', error);
      // Re-add failed logs back to queue
      this.logQueue.unshift(...logsToFlush);
    } finally {
      this.isFlushingLogs = false;
    }
  }
  
  private log(
    level: LogLevel,
    message: string,
    data?: any,
    context?: Partial<Pick<LogEntry, 'component' | 'operation' | 'userId'>>
  ): void {
    if (!this.shouldLog(level)) return;
    
    const entry = this.createLogEntry(level, message, data, context);
    
    // Add to queue
    this.logQueue.push(entry);
    
    // Prevent queue from growing too large
    if (this.logQueue.length > this.maxQueueSize) {
      this.logQueue = this.logQueue.slice(-this.maxQueueSize);
    }
    
    // Flush immediately for errors, or periodically for others
    if (level === 'error') {
      this.flushLogs();
    } else {
      // Debounced flush for performance
      setTimeout(() => this.flushLogs(), 100);
    }
  }
  
  debug(
    message: string,
    data?: any,
    context?: Partial<Pick<LogEntry, 'component' | 'operation' | 'userId'>>
  ): void {
    this.log('debug', message, data, context);
  }
  
  info(
    message: string,
    data?: any,
    context?: Partial<Pick<LogEntry, 'component' | 'operation' | 'userId'>>
  ): void {
    this.log('info', message, data, context);
  }
  
  warn(
    message: string,
    data?: any,
    context?: Partial<Pick<LogEntry, 'component' | 'operation' | 'userId'>>
  ): void {
    this.log('warn', message, data, context);
  }
  
  error(
    message: string,
    data?: any,
    context?: Partial<Pick<LogEntry, 'component' | 'operation' | 'userId'>>
  ): void {
    this.log('error', message, data, context);
  }
  
  // Specialized logging methods
  vcsOperation(operation: string, result: { success: boolean; message?: string }, data?: any): void {
    const level = result.success ? 'info' : 'error';
    const message = `VCS operation ${operation}: ${result.success ? 'Success' : 'Failed'}${
      result.message ? ` - ${result.message}` : ''
    }`;
    
    this.log(level, message, data, { component: 'VCS', operation });
  }
  
  apiRequest(method: string, endpoint: string, status: number, duration: number, data?: any): void {
    const message = `API ${method} ${endpoint} - ${status} (${duration}ms)`;
    const level = status >= 400 ? 'error' : status >= 300 ? 'warn' : 'info';
    
    this.log(level, message, data, { component: 'API', operation: `${method} ${endpoint}` });
  }
  
  userAction(action: string, data?: any): void {
    this.log('info', `User action: ${action}`, data, { component: 'UI', operation: action });
  }
  
  performance(operation: string, duration: number, data?: any): void {
    const level = duration > 1000 ? 'warn' : 'debug';
    const message = `Performance: ${operation} took ${duration}ms`;
    
    this.log(level, message, data, { component: 'Performance', operation });
  }
  
  // Cleanup method for production
  async cleanup(): Promise<void> {
    await this.flushLogs();
    
    if (config.logging.enableFileLogging && isTauri()) {
      const tauriFs = await safeDynamicImport(
        () => import('@tauri-apps/api/fs'),
        null
      );
      
      if (tauriFs) {
        try {
          const logDir = await tauriFs.readDir('', { dir: tauriFs.BaseDirectory.Log });
          
          const logFiles = logDir
            .filter(entry => entry.name?.endsWith('.log'))
            .sort((a, b) => (b.name || '').localeCompare(a.name || ''))
            .slice(config.logging.maxLogFiles);
          
          await Promise.all(
            logFiles.map(file => tauriFs.removeFile(file.name || '', { dir: tauriFs.BaseDirectory.Log }))
          );
        } catch (error) {
          console.warn('Log cleanup failed:', error);
        }
      }
    }
  }
  
  // Export logs for debugging
  exportLogs(): LogEntry[] {
    return [...this.logQueue];
  }
  
  // Clear logs
  clearLogs(): void {
    this.logQueue = [];
  }
}

// Export singleton instance
export const logger = new Logger();

// Convenience functions for common logging patterns
export function logVCSOperation(operation: string, result: { success: boolean; message?: string }, data?: any): void {
  logger.vcsOperation(operation, result, data);
}

export function logAPIRequest(method: string, endpoint: string, status: number, duration: number, data?: any): void {
  logger.apiRequest(method, endpoint, status, duration, data);
}

export function logUserAction(action: string, data?: any): void {
  logger.userAction(action, data);
}

export function logPerformance(operation: string, duration: number, data?: any): void {
  logger.performance(operation, duration, data);
}

// Performance measurement utility
export function measurePerformance<T>(
  operation: string,
  fn: () => Promise<T>,
  component?: string
): Promise<T> {
  const start = performance.now();
  
  return fn().then(
    (result) => {
      const duration = performance.now() - start;
      logger.performance(operation, duration, { component, result: 'success' });
      return result;
    },
    (error) => {
      const duration = performance.now() - start;
      logger.performance(operation, duration, { component, result: 'error', error: error.message });
      throw error;
    }
  );
}