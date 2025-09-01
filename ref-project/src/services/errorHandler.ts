// Centralized Error Handling Service
// Production-ready error handling with categorization and recovery

import { logger } from './logger';
import { config } from '../config';

export type ErrorCategory = 
  | 'network'
  | 'filesystem'
  | 'validation'
  | 'authorization'
  | 'vcs'
  | 'ui'
  | 'unknown';

export interface AppError {
  id: string;
  category: ErrorCategory;
  code: string;
  message: string;
  originalError?: Error;
  context?: Record<string, any>;
  timestamp: Date;
  severity: 'low' | 'medium' | 'high' | 'critical';
  recoverable: boolean;
  userMessage?: string;
  suggestedAction?: string;
}

export interface ErrorMetadata {
  component?: string;
  operation?: string;
  userId?: string;
  sessionId?: string;
  buildVersion?: string;
  userAgent?: string;
}

class ErrorHandler {
  private errorHistory: AppError[] = [];
  private maxHistorySize = 100;
  private errorCallbacks: Map<ErrorCategory, ((error: AppError) => void)[]> = new Map();

  // Error categorization patterns
  private categoryPatterns: Record<ErrorCategory, RegExp[]> = {
    network: [
      /fetch.*failed/i,
      /network.*error/i,
      /connection.*refused/i,
      /timeout/i,
      /cors/i,
    ],
    filesystem: [
      /file.*not.*found/i,
      /permission.*denied/i,
      /disk.*full/i,
      /path.*invalid/i,
      /enoent/i,
      /eacces/i,
    ],
    validation: [
      /validation.*failed/i,
      /invalid.*input/i,
      /required.*field/i,
      /format.*error/i,
    ],
    authorization: [
      /unauthorized/i,
      /forbidden/i,
      /access.*denied/i,
      /authentication.*failed/i,
      /token.*expired/i,
    ],
    vcs: [
      /git.*error/i,
      /repository.*not.*found/i,
      /merge.*conflict/i,
      /branch.*not.*found/i,
      /commit.*failed/i,
    ],
    ui: [
      /component.*error/i,
      /render.*failed/i,
      /state.*error/i,
    ],
    unknown: [],
  };

  private categorizeError(error: Error): ErrorCategory {
    const message = error.message.toLowerCase();
    
    for (const [category, patterns] of Object.entries(this.categoryPatterns)) {
      if (patterns.some(pattern => pattern.test(message))) {
        return category as ErrorCategory;
      }
    }
    
    return 'unknown';
  }

  private generateErrorId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private determineSeverity(category: ErrorCategory, error: Error): AppError['severity'] {
    // Critical errors that can crash the app
    if (category === 'unknown' && error.name === 'ChunkLoadError') {
      return 'critical';
    }
    
    // High severity errors
    if (['filesystem', 'authorization'].includes(category)) {
      return 'high';
    }
    
    // Medium severity errors
    if (['network', 'vcs'].includes(category)) {
      return 'medium';
    }
    
    // Low severity errors
    return 'low';
  }

  private isRecoverable(category: ErrorCategory, error: Error): boolean {
    // Network errors are usually recoverable with retry
    if (category === 'network') return true;
    
    // Validation errors are recoverable with user input
    if (category === 'validation') return true;
    
    // UI errors are often recoverable
    if (category === 'ui') return true;
    
    // VCS errors might be recoverable depending on the specific error
    if (category === 'vcs') {
      return !error.message.toLowerCase().includes('fatal');
    }
    
    return false;
  }

  private getUserMessage(category: ErrorCategory, error: Error): string {
    switch (category) {
      case 'network':
        return 'Unable to connect to the server. Please check your internet connection and try again.';
      case 'filesystem':
        return 'Unable to access the file or folder. Please check permissions and try again.';
      case 'validation':
        return 'Please check your input and try again.';
      case 'authorization':
        return 'You do not have permission to perform this action. Please contact your administrator.';
      case 'vcs':
        return 'Version control operation failed. Please check your repository status and try again.';
      case 'ui':
        return 'An interface error occurred. Please refresh the page and try again.';
      default:
        return 'An unexpected error occurred. Please try again or contact support if the problem persists.';
    }
  }

  private getSuggestedAction(category: ErrorCategory, error: Error): string {
    switch (category) {
      case 'network':
        return 'Check your internet connection and retry the operation.';
      case 'filesystem':
        return 'Verify file permissions and available disk space.';
      case 'validation':
        return 'Review the input data and correct any validation errors.';
      case 'authorization':
        return 'Log in again or contact your administrator for access.';
      case 'vcs':
        return 'Check repository status and resolve any conflicts.';
      case 'ui':
        return 'Refresh the page or restart the application.';
      default:
        return 'Try again in a moment or contact support if the issue persists.';
    }
  }

  public createError(
    error: Error,
    metadata?: ErrorMetadata,
    customContext?: Record<string, any>
  ): AppError {
    const category = this.categorizeError(error);
    const severity = this.determineSeverity(category, error);
    const recoverable = this.isRecoverable(category, error);

    const appError: AppError = {
      id: this.generateErrorId(),
      category,
      code: error.name || 'UnknownError',
      message: error.message,
      originalError: error,
      context: {
        ...metadata,
        ...customContext,
        stack: error.stack,
        url: window.location.href,
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date(),
      severity,
      recoverable,
      userMessage: this.getUserMessage(category, error),
      suggestedAction: this.getSuggestedAction(category, error),
    };

    return appError;
  }

  public handleError(
    error: Error,
    metadata?: ErrorMetadata,
    customContext?: Record<string, any>
  ): AppError {
    const appError = this.createError(error, metadata, customContext);
    
    // Add to history
    this.errorHistory.push(appError);
    if (this.errorHistory.length > this.maxHistorySize) {
      this.errorHistory = this.errorHistory.slice(-this.maxHistorySize);
    }

    // Log the error
    logger.error(
      `${appError.category.toUpperCase()} Error: ${appError.message}`,
      {
        errorId: appError.id,
        code: appError.code,
        severity: appError.severity,
        recoverable: appError.recoverable,
        context: appError.context,
      },
      {
        component: metadata?.component || 'ErrorHandler',
        operation: metadata?.operation || 'handleError',
      }
    );

    // Trigger category-specific callbacks
    const callbacks = this.errorCallbacks.get(appError.category) || [];
    callbacks.forEach(callback => {
      try {
        callback(appError);
      } catch (callbackError) {
        logger.error('Error in error callback', callbackError);
      }
    });

    // Send to crash reporting service in production
    if (config.isProduction && appError.severity === 'critical') {
      this.reportToAnalytics(appError);
    }

    return appError;
  }

  public onError(category: ErrorCategory, callback: (error: AppError) => void): void {
    if (!this.errorCallbacks.has(category)) {
      this.errorCallbacks.set(category, []);
    }
    this.errorCallbacks.get(category)!.push(callback);
  }

  public removeErrorCallback(category: ErrorCategory, callback: (error: AppError) => void): void {
    const callbacks = this.errorCallbacks.get(category);
    if (callbacks) {
      const index = callbacks.indexOf(callback);
      if (index > -1) {
        callbacks.splice(index, 1);
      }
    }
  }

  public getErrorHistory(): AppError[] {
    return [...this.errorHistory];
  }

  public getErrorsByCategory(category: ErrorCategory): AppError[] {
    return this.errorHistory.filter(error => error.category === category);
  }

  public clearErrorHistory(): void {
    this.errorHistory = [];
  }

  private async reportToAnalytics(error: AppError): Promise<void> {
    if (!config.features.enableAnalytics) return;

    try {
      // In production, send to analytics service
      const payload = {
        errorId: error.id,
        category: error.category,
        message: error.message,
        severity: error.severity,
        timestamp: error.timestamp.toISOString(),
        context: {
          ...error.context,
          // Remove sensitive information
          stack: undefined,
          originalError: undefined,
        },
      };

      // Example: send to analytics service
      // await analyticsService.reportError(payload);
      
      logger.info('Error reported to analytics', { errorId: error.id });
    } catch (reportingError) {
      logger.error('Failed to report error to analytics', reportingError);
    }
  }

  // Recovery utilities
  public async attemptRecovery(error: AppError): Promise<boolean> {
    if (!error.recoverable) {
      return false;
    }

    try {
      switch (error.category) {
        case 'network':
          // Attempt to reconnect
          return await this.attemptNetworkRecovery();
        
        case 'ui':
          // Attempt to reset UI state
          return await this.attemptUIRecovery();
        
        case 'vcs':
          // Attempt to recover VCS state
          return await this.attemptVCSRecovery(error);
        
        default:
          return false;
      }
    } catch (recoveryError) {
      logger.error('Recovery attempt failed', recoveryError);
      return false;
    }
  }

  private async attemptNetworkRecovery(): Promise<boolean> {
    try {
      // Simple connectivity check
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      const response = await fetch('/api/health', { 
        method: 'HEAD',
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      return response.ok;
    } catch {
      return false;
    }
  }

  private async attemptUIRecovery(): Promise<boolean> {
    try {
      // Force a re-render by dispatching a custom event
      window.dispatchEvent(new CustomEvent('ui-recovery-attempt'));
      return true;
    } catch {
      return false;
    }
  }

  private async attemptVCSRecovery(error: AppError): Promise<boolean> {
    try {
      // Attempt to reset VCS state or reload repository data
      window.dispatchEvent(new CustomEvent('vcs-recovery-attempt', {
        detail: { error }
      }));
      return true;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const errorHandler = new ErrorHandler();

// Convenience functions
export function handleError(
  error: Error,
  metadata?: ErrorMetadata,
  customContext?: Record<string, any>
): AppError {
  return errorHandler.handleError(error, metadata, customContext);
}

export function createError(
  error: Error,
  metadata?: ErrorMetadata,
  customContext?: Record<string, any>
): AppError {
  return errorHandler.createError(error, metadata, customContext);
}

// Global error handlers
export function setupGlobalErrorHandlers(): void {
  // Handle unhandled promise rejections
  window.addEventListener('unhandledrejection', (event) => {
    const error = event.reason instanceof Error ? event.reason : new Error(event.reason);
    handleError(error, { component: 'Global', operation: 'unhandledrejection' });
    event.preventDefault();
  });

  // Handle JavaScript errors
  window.addEventListener('error', (event) => {
    const error = event.error || new Error(event.message);
    handleError(error, { 
      component: 'Global', 
      operation: 'javascript-error',
    }, {
      filename: event.filename,
      lineno: event.lineno,
      colno: event.colno,
    });
  });

  // Handle React error boundary errors
  window.addEventListener('react-error', (event: any) => {
    const error = event.detail.error || new Error(event.detail.message);
    handleError(error, {
      component: event.detail.component || 'React',
      operation: 'render-error',
    }, {
      errorInfo: event.detail.errorInfo,
    });
  });
}