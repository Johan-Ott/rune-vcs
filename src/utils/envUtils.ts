// Environment Utilities
// Safe environment detection and variable access

export function isBrowser(): boolean {
  try {
    return typeof window !== 'undefined' && typeof document !== 'undefined';
  } catch {
    return false;
  }
}

export function isNode(): boolean {
  try {
    return typeof process !== 'undefined' && process.versions && process.versions.node && !isBrowser();
  } catch {
    return false;
  }
}

export function isTauri(): boolean {
  try {
    return isBrowser() && !!(window as any).__TAURI__;
  } catch {
    return false;
  }
}

export function getEnvVar(key: string, defaultValue?: string): string | undefined {
  try {
    if (isNode() && process.env) {
      return process.env[key] || defaultValue;
    }
    // In browser, environment variables are usually injected at build time
    return defaultValue;
  } catch {
    return defaultValue;
  }
}

export function isDevelopment(): boolean {
  try {
    return getEnvVar('NODE_ENV') === 'development' || 
           getEnvVar('REACT_APP_ENV') === 'development';
  } catch {
    return false;
  }
}

export function isProduction(): boolean {
  try {
    return getEnvVar('NODE_ENV') === 'production' || 
           getEnvVar('REACT_APP_ENV') === 'production';
  } catch {
    return false;
  }
}

// Safe JSON operations
export function safeParseJSON<T>(jsonString: string, fallback: T): T {
  try {
    return JSON.parse(jsonString);
  } catch {
    return fallback;
  }
}

export function safeStringifyJSON(obj: any): string {
  try {
    return JSON.stringify(obj);
  } catch {
    return '{}';
  }
}

// Safe async operations
export function withTimeout<T>(
  promise: Promise<T>, 
  timeoutMs: number, 
  fallback: T
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => 
      setTimeout(() => reject(new Error('Timeout')), timeoutMs)
    )
  ]).catch(() => fallback);
}

// Safe dynamic imports
export async function safeDynamicImport<T>(
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