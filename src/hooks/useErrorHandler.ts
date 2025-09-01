// React Hook for Error Handling
// Provides easy error handling integration for components

import { useCallback, useEffect, useState } from 'react';
import { errorHandler, AppError, ErrorCategory, ErrorMetadata } from '../services/errorHandler';
import { logger } from '../services/logger';

export interface UseErrorHandlerOptions {
  component?: string;
  onError?: (error: AppError) => void;
  autoRecovery?: boolean;
}

export interface UseErrorHandlerReturn {
  error: AppError | null;
  isError: boolean;
  handleError: (error: Error, context?: Record<string, any>) => AppError;
  clearError: () => void;
  retryOperation: () => Promise<boolean>;
  errorHistory: AppError[];
}

export function useErrorHandler(
  options: UseErrorHandlerOptions = {}
): UseErrorHandlerReturn {
  const [currentError, setCurrentError] = useState<AppError | null>(null);
  const [errorHistory, setErrorHistory] = useState<AppError[]>([]);

  const handleError = useCallback((
    error: Error,
    customContext?: Record<string, any>
  ): AppError => {
    const metadata: ErrorMetadata = {
      component: options.component,
      operation: 'component-error',
    };

    const appError = errorHandler.handleError(error, metadata, customContext);
    
    setCurrentError(appError);
    setErrorHistory(prev => [appError, ...prev.slice(0, 9)]); // Keep last 10 errors
    
    // Call custom error handler
    if (options.onError) {
      options.onError(appError);
    }

    // Attempt automatic recovery if enabled
    if (options.autoRecovery && appError.recoverable) {
      setTimeout(() => {
        retryOperation();
      }, 2000); // Wait 2 seconds before attempting recovery
    }

    return appError;
  }, [options.component, options.onError, options.autoRecovery]);

  const clearError = useCallback(() => {
    setCurrentError(null);
  }, []);

  const retryOperation = useCallback(async (): Promise<boolean> => {
    if (!currentError) return false;

    try {
      const recovered = await errorHandler.attemptRecovery(currentError);
      
      if (recovered) {
        logger.info('Error recovery successful', { 
          errorId: currentError.id,
          component: options.component 
        });
        setCurrentError(null);
        return true;
      } else {
        logger.warn('Error recovery failed', { 
          errorId: currentError.id,
          component: options.component 
        });
        return false;
      }
    } catch (recoveryError) {
      logger.error('Error during recovery attempt', recoveryError);
      return false;
    }
  }, [currentError, options.component]);

  // Set up error listeners for this component
  useEffect(() => {
    const handleGlobalError = (error: AppError) => {
      if (!options.component || error.context?.component === options.component) {
        setCurrentError(error);
        setErrorHistory(prev => [error, ...prev.slice(0, 9)]);
      }
    };

    // Listen for all error categories
    const categories: ErrorCategory[] = ['network', 'filesystem', 'validation', 'authorization', 'vcs', 'ui', 'unknown'];
    
    categories.forEach(category => {
      errorHandler.onError(category, handleGlobalError);
    });

    return () => {
      categories.forEach(category => {
        errorHandler.removeErrorCallback(category, handleGlobalError);
      });
    };
  }, [options.component]);

  return {
    error: currentError,
    isError: currentError !== null,
    handleError,
    clearError,
    retryOperation,
    errorHistory,
  };
}

// Specialized hooks for different error categories
export function useNetworkErrorHandler(options: UseErrorHandlerOptions = {}) {
  const errorHandler = useErrorHandler(options);
  
  const handleNetworkError = useCallback((error: Error, context?: Record<string, any>) => {
    return errorHandler.handleError(error, { ...context, category: 'network' });
  }, [errorHandler.handleError]);

  return {
    ...errorHandler,
    handleNetworkError,
  };
}

export function useVCSErrorHandler(options: UseErrorHandlerOptions = {}) {
  const errorHandler = useErrorHandler(options);
  
  const handleVCSError = useCallback((error: Error, operation?: string, context?: Record<string, any>) => {
    return errorHandler.handleError(error, { 
      ...context, 
      category: 'vcs',
      operation: operation || 'unknown-vcs-operation'
    });
  }, [errorHandler.handleError]);

  return {
    ...errorHandler,
    handleVCSError,
  };
}

export function useValidationErrorHandler(options: UseErrorHandlerOptions = {}) {
  const errorHandler = useErrorHandler(options);
  
  const handleValidationError = useCallback((error: Error, field?: string, context?: Record<string, any>) => {
    return errorHandler.handleError(error, { 
      ...context, 
      category: 'validation',
      field
    });
  }, [errorHandler.handleError]);

  return {
    ...errorHandler,
    handleValidationError,
  };
}

// Higher-order component for error boundary integration
export function withErrorHandler<P extends object>(
  Component: React.ComponentType<P>,
  options: UseErrorHandlerOptions = {}
) {
  return function WrappedComponent(props: P) {
    const { error, handleError } = useErrorHandler({
      ...options,
      component: options.component || Component.displayName || Component.name,
    });

    // Provide error handler to component via props
    const enhancedProps = {
      ...props,
      onError: handleError,
      hasError: error !== null,
      error,
    } as P;

    return <Component {...enhancedProps} />;
  };
}

// Hook for async operation error handling
export function useAsyncErrorHandler<T extends (...args: any[]) => Promise<any>>(
  asyncFn: T,
  options: UseErrorHandlerOptions = {}
) {
  const { handleError } = useErrorHandler(options);
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState<any>(null);

  const execute = useCallback(async (...args: Parameters<T>) => {
    setLoading(true);
    setData(null);

    try {
      const result = await asyncFn(...args);
      setData(result);
      return result;
    } catch (error) {
      handleError(error instanceof Error ? error : new Error(String(error)));
      throw error;
    } finally {
      setLoading(false);
    }
  }, [asyncFn, handleError]);

  return {
    execute,
    loading,
    data,
  };
}