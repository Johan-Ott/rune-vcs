// Configuration Management for Production
// Centralized configuration for different environments

import { getEnvVar, isTauri, isDevelopment, isProduction, isBrowser } from '../utils/envUtils';

export interface AppConfig {
  // Environment
  environment: 'development' | 'production' | 'test';
  isDevelopment: boolean;
  isProduction: boolean;
  
  // API Configuration
  api: {
    useRealAPI: boolean;
    baseURL: string;
    timeout: number;
    retryAttempts: number;
    retryDelay: number;
  };
  
  // Tauri Configuration
  tauri: {
    enabled: boolean;
    allowedDomains: string[];
    fileSystemAccess: boolean;
  };
  
  // Logging
  logging: {
    level: 'debug' | 'info' | 'warn' | 'error';
    enableConsole: boolean;
    enableFileLogging: boolean;
    maxLogFiles: number;
  };
  
  // Performance
  performance: {
    enableCaching: boolean;
    cacheSize: number;
    debounceDelay: number;
    virtualScrollThreshold: number;
  };
  
  // Security
  security: {
    enableCSP: boolean;
    allowUnsafeEval: boolean;
    maxFileSize: number;
    allowedFileExtensions: string[];
  };
  
  // Features
  features: {
    enableAnalytics: boolean;
    enableNotifications: boolean;
    enableAutoSave: boolean;
    autoSaveInterval: number;
    maxRecentRepositories: number;
  };
}

// Default configuration
const defaultConfig: AppConfig = {
  environment: 'development',
  isDevelopment: true,
  isProduction: false,
  
  api: {
    useRealAPI: false,
    baseURL: 'http://localhost:3001/api',
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
  },
  
  tauri: {
    enabled: false,
    allowedDomains: ['localhost', '127.0.0.1'],
    fileSystemAccess: true,
  },
  
  logging: {
    level: 'info',
    enableConsole: true,
    enableFileLogging: false,
    maxLogFiles: 5,
  },
  
  performance: {
    enableCaching: true,
    cacheSize: 100,
    debounceDelay: 300,
    virtualScrollThreshold: 1000,
  },
  
  security: {
    enableCSP: true,
    allowUnsafeEval: false,
    maxFileSize: 100 * 1024 * 1024, // 100MB
    allowedFileExtensions: [
      '.js', '.ts', '.jsx', '.tsx', '.json', '.md', '.txt',
      '.css', '.scss', '.html', '.xml', '.yaml', '.yml',
      '.py', '.java', '.cpp', '.c', '.h', '.go', '.rs',
      '.php', '.rb', '.sh', '.bat', '.ps1'
    ],
  },
  
  features: {
    enableAnalytics: false,
    enableNotifications: true,
    enableAutoSave: true,
    autoSaveInterval: 30000, // 30 seconds
    maxRecentRepositories: 10,
  },
};

// Environment-specific overrides
const productionOverrides: Partial<AppConfig> = {
  environment: 'production',
  isDevelopment: false,
  isProduction: true,
  api: {
    useRealAPI: true,
    baseURL: 'https://api.yourapp.com',
    timeout: 30000,
    retryAttempts: 3,
    retryDelay: 1000,
  },
  logging: {
    level: 'warn',
    enableConsole: false,
    enableFileLogging: true,
    maxLogFiles: 10,
  },
  features: {
    enableAnalytics: true,
    enableNotifications: true,
    enableAutoSave: true,
    autoSaveInterval: 15000, // 15 seconds in production
    maxRecentRepositories: 20,
  },
};

const testOverrides: Partial<AppConfig> = {
  environment: 'test',
  isDevelopment: false,
  isProduction: false,
  api: {
    useRealAPI: false,
    timeout: 5000,
    retryAttempts: 1,
    retryDelay: 100,
  },
  logging: {
    level: 'error',
    enableConsole: false,
    enableFileLogging: false,
    maxLogFiles: 1,
  },
  performance: {
    enableCaching: false,
    debounceDelay: 0,
    virtualScrollThreshold: 100,
  },
};

// Create final configuration
function createConfig(): AppConfig {
  // Safe environment detection
  let environment: AppConfig['environment'] = 'development';
  try {
    environment = getEnvVar('NODE_ENV', 'development') as AppConfig['environment'];
  } catch {
    // Fallback if environment detection fails
  }
  
  let config = { ...defaultConfig };
  
  // Set environment flags safely
  try {
    config.environment = environment;
    config.isDevelopment = isDevelopment();
    config.isProduction = isProduction();
  } catch {
    // Use defaults if environment detection fails
  }
  
  // Apply environment-specific overrides
  try {
    if (isProduction()) {
      config = { ...config, ...productionOverrides };
    } else if (environment === 'test') {
      config = { ...config, ...testOverrides };
    }
  } catch {
    // Use defaults if override application fails
  }
  
  // Apply environment variable overrides (only in browser)
  if (isBrowser()) {
    try {
      const apiBaseUrl = getEnvVar('REACT_APP_API_BASE_URL');
      if (apiBaseUrl) {
        config.api.baseURL = apiBaseUrl;
      }
      
      if (getEnvVar('REACT_APP_USE_REAL_API') === 'true') {
        config.api.useRealAPI = true;
      }
      
      const logLevel = getEnvVar('REACT_APP_LOG_LEVEL');
      if (logLevel) {
        config.logging.level = logLevel as AppConfig['logging']['level'];
      }
    } catch {
      // Ignore env var errors in build environment
    }
  }
  
  // Detect Tauri environment safely
  try {
    config.tauri.enabled = isTauri();
  } catch {
    config.tauri.enabled = false;
  }
  
  return config;
}

export const config = createConfig();

// Utility functions
export function isRunningInTauri(): boolean {
  return config.tauri.enabled;
}

export function shouldUseRealAPI(): boolean {
  return config.api.useRealAPI;
}

// Configuration validation
export function validateConfig(cfg: AppConfig): string[] {
  const errors: string[] = [];
  
  if (!cfg.api.baseURL) {
    errors.push('API base URL is required');
  }
  
  if (cfg.api.timeout <= 0) {
    errors.push('API timeout must be greater than 0');
  }
  
  if (cfg.security.maxFileSize <= 0) {
    errors.push('Max file size must be greater than 0');
  }
  
  if (cfg.features.autoSaveInterval <= 0) {
    errors.push('Auto-save interval must be greater than 0');
  }
  
  return errors;
}

// Runtime configuration updates (for settings panel)
export function updateConfig(updates: Partial<AppConfig>): void {
  Object.assign(config, updates);
}