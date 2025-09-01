// Persistent Storage Service for Tauri/Web
// Unified storage interface that works in both browser and Tauri

import { config } from '../config';
import { logger } from './logger';
import { isTauri, safeDynamicImport } from '../utils/envUtils';

export type StorageScope = 'user' | 'app' | 'cache' | 'temp';

export interface StorageOptions {
  scope?: StorageScope;
  encrypt?: boolean;
  ttl?: number; // Time to live in milliseconds
}

export interface StorageItem<T = any> {
  key: string;
  value: T;
  metadata: {
    created: string;
    updated: string;
    ttl?: number;
    encrypted: boolean;
    scope: StorageScope;
  };
}

class StorageService {
  private cache = new Map<string, any>();
  private isInitialized = false;

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      // Initialize Tauri store if available
      if (config.tauri.enabled) {
        await this.initializeTauriStore();
      }
      
      // Load cached data
      await this.loadCache();
      
      this.isInitialized = true;
      logger.info('Storage service initialized');
    } catch (error) {
      logger.error('Failed to initialize storage service', error);
      throw error;
    }
  }

  private async initializeTauriStore(): Promise<void> {
    if (!isTauri()) return;
    
    const tauriStore = await safeDynamicImport(
      () => import('@tauri-apps/plugin-store'),
      null
    );
    
    if (tauriStore) {
      try {
        // Initialize different stores for different scopes
        // This will be used in the real implementation
      } catch (error) {
        console.warn('Tauri store initialization failed:', error);
      }
    }
  }

  private async loadCache(): Promise<void> {
    try {
      // Load frequently accessed items into memory cache
      const cacheKeys = await this.getAllKeys('cache');
      await Promise.all(
        cacheKeys.map(async (key) => {
          const item = await this.getItem(key, { scope: 'cache' });
          if (item) {
            this.cache.set(key, item.value);
          }
        })
      );
    } catch (error) {
      logger.error('Failed to load cache', error);
    }
  }

  private async isTauriAvailable(): Promise<boolean> {
    return isTauri();
  }

  private getStorageKey(key: string, scope: StorageScope): string {
    return `${scope}:${key}`;
  }

  private async encryptValue(value: any): Promise<string> {
    if (!config.tauri.enabled) {
      // In browser, use simple base64 encoding (not secure, but prevents casual inspection)
      return btoa(JSON.stringify(value));
    }

    try {
      // In Tauri, use proper encryption
      // This would use Tauri's crypto APIs in real implementation
      return JSON.stringify(value);
    } catch (error) {
      logger.error('Failed to encrypt value', error);
      return JSON.stringify(value);
    }
  }

  private async decryptValue(encryptedValue: string): Promise<any> {
    if (!config.tauri.enabled) {
      try {
        return JSON.parse(atob(encryptedValue));
      } catch {
        return encryptedValue;
      }
    }

    try {
      // In Tauri, use proper decryption
      // This would use Tauri's crypto APIs in real implementation
      return JSON.parse(encryptedValue);
    } catch (error) {
      logger.error('Failed to decrypt value', error);
      return encryptedValue;
    }
  }

  async setItem<T>(
    key: string, 
    value: T, 
    options: StorageOptions = {}
  ): Promise<void> {
    const { scope = 'user', encrypt = false, ttl } = options;
    
    try {
      const now = new Date().toISOString();
      const storageItem: StorageItem<T> = {
        key,
        value,
        metadata: {
          created: now,
          updated: now,
          ttl,
          encrypted: encrypt,
          scope,
        },
      };

      let serializedValue: string;
      if (encrypt) {
        serializedValue = await this.encryptValue(storageItem);
      } else {
        serializedValue = JSON.stringify(storageItem);
      }

      const storageKey = this.getStorageKey(key, scope);

      // Store in appropriate location
      if (await this.isTauriAvailable()) {
        await this.setTauriItem(storageKey, serializedValue, scope);
      } else {
        await this.setBrowserItem(storageKey, serializedValue, scope);
      }

      // Update cache for frequently accessed items
      if (scope === 'cache' || scope === 'user') {
        this.cache.set(key, value);
      }

      logger.debug(`Stored item: ${key} (scope: ${scope})`);
    } catch (error) {
      logger.error(`Failed to store item: ${key}`, error);
      throw error;
    }
  }

  async getItem<T>(
    key: string, 
    options: StorageOptions = {}
  ): Promise<StorageItem<T> | null> {
    const { scope = 'user' } = options;

    try {
      // Check cache first for performance
      if ((scope === 'cache' || scope === 'user') && this.cache.has(key)) {
        const cachedValue = this.cache.get(key);
        // Return as StorageItem format for consistency
        return {
          key,
          value: cachedValue,
          metadata: {
            created: new Date().toISOString(),
            updated: new Date().toISOString(),
            encrypted: false,
            scope,
          },
        };
      }

      const storageKey = this.getStorageKey(key, scope);
      let serializedValue: string | null;

      if (await this.isTauriAvailable()) {
        serializedValue = await this.getTauriItem(storageKey, scope);
      } else {
        serializedValue = await this.getBrowserItem(storageKey, scope);
      }

      if (!serializedValue) {
        return null;
      }

      let storageItem: StorageItem<T>;
      try {
        storageItem = JSON.parse(serializedValue);
      } catch {
        // Try decryption if parsing fails
        storageItem = await this.decryptValue(serializedValue);
      }

      // Check TTL
      if (storageItem.metadata.ttl) {
        const created = new Date(storageItem.metadata.created).getTime();
        const now = Date.now();
        if (now - created > storageItem.metadata.ttl) {
          await this.removeItem(key, options);
          return null;
        }
      }

      return storageItem;
    } catch (error) {
      logger.error(`Failed to get item: ${key}`, error);
      return null;
    }
  }

  async removeItem(key: string, options: StorageOptions = {}): Promise<void> {
    const { scope = 'user' } = options;

    try {
      const storageKey = this.getStorageKey(key, scope);

      if (await this.isTauriAvailable()) {
        await this.removeTauriItem(storageKey, scope);
      } else {
        await this.removeBrowserItem(storageKey, scope);
      }

      // Remove from cache
      this.cache.delete(key);

      logger.debug(`Removed item: ${key} (scope: ${scope})`);
    } catch (error) {
      logger.error(`Failed to remove item: ${key}`, error);
      throw error;
    }
  }

  async getAllKeys(scope: StorageScope = 'user'): Promise<string[]> {
    try {
      if (await this.isTauriAvailable()) {
        return await this.getTauriKeys(scope);
      } else {
        return await this.getBrowserKeys(scope);
      }
    } catch (error) {
      logger.error(`Failed to get keys for scope: ${scope}`, error);
      return [];
    }
  }

  async clear(scope?: StorageScope): Promise<void> {
    try {
      if (scope) {
        const keys = await this.getAllKeys(scope);
        await Promise.all(keys.map(key => this.removeItem(key, { scope })));
      } else {
        // Clear all scopes
        const scopes: StorageScope[] = ['user', 'app', 'cache', 'temp'];
        await Promise.all(scopes.map(s => this.clear(s)));
      }

      // Clear cache
      if (!scope || scope === 'cache' || scope === 'user') {
        this.cache.clear();
      }

      logger.info(`Cleared storage${scope ? ` for scope: ${scope}` : ''}`);
    } catch (error) {
      logger.error('Failed to clear storage', error);
      throw error;
    }
  }

  // Tauri-specific implementations
  private async setTauriItem(key: string, value: string, scope: StorageScope): Promise<void> {
    // In real implementation, this would use Tauri's Store API
    // For now, fallback to browser storage
    return this.setBrowserItem(key, value, scope);
  }

  private async getTauriItem(key: string, scope: StorageScope): Promise<string | null> {
    // In real implementation, this would use Tauri's Store API
    // For now, fallback to browser storage
    return this.getBrowserItem(key, scope);
  }

  private async removeTauriItem(key: string, scope: StorageScope): Promise<void> {
    // In real implementation, this would use Tauri's Store API
    // For now, fallback to browser storage
    return this.removeBrowserItem(key, scope);
  }

  private async getTauriKeys(scope: StorageScope): Promise<string[]> {
    // In real implementation, this would use Tauri's Store API
    // For now, fallback to browser storage
    return this.getBrowserKeys(scope);
  }

  // Browser storage implementations
  private async setBrowserItem(key: string, value: string, scope: StorageScope): Promise<void> {
    const storage = scope === 'temp' ? sessionStorage : localStorage;
    storage.setItem(key, value);
  }

  private async getBrowserItem(key: string, scope: StorageScope): Promise<string | null> {
    const storage = scope === 'temp' ? sessionStorage : localStorage;
    return storage.getItem(key);
  }

  private async removeBrowserItem(key: string, scope: StorageScope): Promise<void> {
    const storage = scope === 'temp' ? sessionStorage : localStorage;
    storage.removeItem(key);
  }

  private async getBrowserKeys(scope: StorageScope): Promise<string[]> {
    const storage = scope === 'temp' ? sessionStorage : localStorage;
    const prefix = `${scope}:`;
    const keys: string[] = [];
    
    for (let i = 0; i < storage.length; i++) {
      const key = storage.key(i);
      if (key?.startsWith(prefix)) {
        keys.push(key.substring(prefix.length));
      }
    }
    
    return keys;
  }

  // Cleanup expired items
  async cleanup(): Promise<void> {
    try {
      const allScopes: StorageScope[] = ['user', 'app', 'cache', 'temp'];
      
      for (const scope of allScopes) {
        const keys = await this.getAllKeys(scope);
        
        await Promise.all(keys.map(async (key) => {
          const item = await this.getItem(key, { scope });
          // getItem already handles TTL cleanup by returning null for expired items
          // So we don't need to do anything here - cleanup happens automatically
        }));
      }

      logger.info('Storage cleanup completed');
    } catch (error) {
      logger.error('Storage cleanup failed', error);
    }
  }
}

// Export singleton instance
export const storage = new StorageService();

// Convenience functions for common operations
export async function setUserPreference<T>(key: string, value: T): Promise<void> {
  return storage.setItem(`pref_${key}`, value, { scope: 'user' });
}

export async function getUserPreference<T>(key: string): Promise<T | null> {
  const item = await storage.getItem<T>(`pref_${key}`, { scope: 'user' });
  return item?.value || null;
}

export async function setRecentRepository(repo: any): Promise<void> {
  const recent = await getRecentRepositories();
  const updated = [repo, ...recent.filter(r => r.id !== repo.id)]
    .slice(0, config.features.maxRecentRepositories);
  return storage.setItem('recent_repositories', updated, { scope: 'user' });
}

export async function getRecentRepositories(): Promise<any[]> {
  const item = await storage.getItem<any[]>('recent_repositories', { scope: 'user' });
  return item?.value || [];
}

export async function cacheAPIResponse<T>(
  endpoint: string, 
  data: T, 
  ttl: number = 300000 // 5 minutes default
): Promise<void> {
  return storage.setItem(`api_${endpoint}`, data, { 
    scope: 'cache', 
    ttl 
  });
}

export async function getCachedAPIResponse<T>(endpoint: string): Promise<T | null> {
  const item = await storage.getItem<T>(`api_${endpoint}`, { scope: 'cache' });
  return item?.value || null;
}