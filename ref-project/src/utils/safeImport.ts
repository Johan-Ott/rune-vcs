// Safe import utilities to prevent webpack build errors
// These utilities help with dynamic imports that might fail in certain environments

export async function safeImport<T>(
  importFn: () => Promise<T>,
  fallback?: T
): Promise<T | undefined> {
  try {
    return await importFn();
  } catch (error) {
    console.warn('Dynamic import failed:', error);
    return fallback;
  }
}

export async function safeImportWithRetry<T>(
  importFn: () => Promise<T>,
  maxRetries: number = 3,
  delay: number = 1000,
  fallback?: T
): Promise<T | undefined> {
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      return await importFn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      console.warn(`Import attempt ${attempt + 1} failed:`, error);
      
      if (attempt < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }
  
  console.error('All import attempts failed:', lastError);
  return fallback;
}

// Specific safe importers for our services
export async function safeImportConfig() {
  return safeImport(() => import('../config'));
}

export async function safeImportLogger() {
  return safeImport(() => import('../services/logger'));
}

export async function safeImportStorage() {
  return safeImport(() => import('../services/storage'));
}

export async function safeImportErrorHandler() {
  return safeImport(() => import('../services/errorHandler'));
}

// Batch import with individual error handling
export async function safeImportServices() {
  const results = await Promise.allSettled([
    safeImportConfig(),
    safeImportLogger(),
    safeImportStorage(),
    safeImportErrorHandler(),
  ]);

  const [configResult, loggerResult, storageResult, errorHandlerResult] = results;

  return {
    config: configResult.status === 'fulfilled' ? configResult.value : undefined,
    logger: loggerResult.status === 'fulfilled' ? loggerResult.value : undefined,
    storage: storageResult.status === 'fulfilled' ? storageResult.value : undefined,
    errorHandler: errorHandlerResult.status === 'fulfilled' ? errorHandlerResult.value : undefined,
  };
}

// Check if we're in a build environment where dynamic imports might fail
export function isBuildEnvironment(): boolean {
  try {
    // Check for Node.js environment (during build)
    if (typeof process !== 'undefined' && process.versions && process.versions.node) {
      return true;
    }

    // Check if window/document are undefined (SSR/build)
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      return true;
    }

    // Check for build-specific globals
    if (typeof global !== 'undefined' && global.process) {
      return true;
    }

    // We're in a browser environment
    return false;
  } catch {
    // If any checks fail, assume it's a browser environment
    return false;
  }
}

// Safe module loader that handles build environments
export async function loadModuleSafely<T>(
  modulePath: string,
  loader: () => Promise<T>,
  fallback?: T
): Promise<T | undefined> {
  // In build environments, return fallback immediately
  if (isBuildEnvironment()) {
    console.log(`Skipping module load in build environment: ${modulePath}`);
    return fallback;
  }

  return safeImportWithRetry(loader, 2, 500, fallback);
}