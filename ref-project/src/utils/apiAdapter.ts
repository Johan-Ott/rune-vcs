// API Adapter Layer - Provides interface for switching between mock and real APIs
// This utility makes it easy to switch from mock data to real backend integration

import { vcsService } from '../services/vcsService';
import { mockRepositories, mockFiles, mockCommits, mockBranches, mockChangelists } from '../data/mockData';

export interface APIConfig {
  useRealAPI: boolean;
  baseURL?: string;
  apiKey?: string;
  timeout?: number;
}

// Global API configuration
let apiConfig: APIConfig = {
  useRealAPI: false, // Set to true when real API is available
  baseURL: process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api',
  timeout: 10000
};

export function setAPIConfig(config: Partial<APIConfig>) {
  apiConfig = { ...apiConfig, ...config };
}

export function getAPIConfig(): APIConfig {
  return { ...apiConfig };
}

// Real API client (placeholder implementation)
class RealAPIClient {
  private baseURL: string;
  private timeout: number;
  private headers: Record<string, string>;

  constructor(config: APIConfig) {
    this.baseURL = config.baseURL || '';
    this.timeout = config.timeout || 10000;
    this.headers = {
      'Content-Type': 'application/json',
      ...(config.apiKey && { 'Authorization': `Bearer ${config.apiKey}` })
    };
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseURL}${endpoint}`, {
        ...options,
        headers: { ...this.headers, ...options.headers },
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof Error) {
        throw new Error(`Network Error: ${error.message}`);
      }
      throw error;
    }
  }

  // Repository endpoints
  async getRepositories() {
    return this.request('/repositories');
  }

  async getRepository(id: string) {
    return this.request(`/repositories/${id}`);
  }

  async cloneRepository(url: string, path: string) {
    return this.request('/repositories/clone', {
      method: 'POST',
      body: JSON.stringify({ url, path })
    });
  }

  // File endpoints
  async getFiles(repositoryId: string, path?: string) {
    const query = path ? `?path=${encodeURIComponent(path)}` : '';
    return this.request(`/repositories/${repositoryId}/files${query}`);
  }

  async getFileContent(repositoryId: string, filePath: string) {
    return this.request(`/repositories/${repositoryId}/files/content?path=${encodeURIComponent(filePath)}`);
  }

  async stageFile(repositoryId: string, filePath: string) {
    return this.request(`/repositories/${repositoryId}/stage`, {
      method: 'POST',
      body: JSON.stringify({ files: [filePath] })
    });
  }

  async unstageFile(repositoryId: string, filePath: string) {
    return this.request(`/repositories/${repositoryId}/unstage`, {
      method: 'POST',
      body: JSON.stringify({ files: [filePath] })
    });
  }

  // Commit endpoints
  async getCommits(repositoryId: string, branch?: string) {
    const query = branch ? `?branch=${encodeURIComponent(branch)}` : '';
    return this.request(`/repositories/${repositoryId}/commits${query}`);
  }

  async commit(repositoryId: string, message: string, files: string[]) {
    return this.request(`/repositories/${repositoryId}/commit`, {
      method: 'POST',
      body: JSON.stringify({ message, files })
    });
  }

  // Branch endpoints
  async getBranches(repositoryId: string) {
    return this.request(`/repositories/${repositoryId}/branches`);
  }

  async createBranch(repositoryId: string, name: string, fromBranch?: string) {
    return this.request(`/repositories/${repositoryId}/branches`, {
      method: 'POST',
      body: JSON.stringify({ name, fromBranch })
    });
  }

  async switchBranch(repositoryId: string, branchName: string) {
    return this.request(`/repositories/${repositoryId}/checkout`, {
      method: 'POST',
      body: JSON.stringify({ branch: branchName })
    });
  }

  // Sync endpoints
  async fetchChanges(repositoryId: string) {
    return this.request(`/repositories/${repositoryId}/fetch`, {
      method: 'POST'
    });
  }

  async pullChanges(repositoryId: string) {
    return this.request(`/repositories/${repositoryId}/pull`, {
      method: 'POST'
    });
  }

  async pushChanges(repositoryId: string, branch?: string) {
    return this.request(`/repositories/${repositoryId}/push`, {
      method: 'POST',
      body: JSON.stringify({ branch })
    });
  }
}

// API Adapter that switches between mock and real API
export class APIAdapter {
  private realAPIClient: RealAPIClient;

  constructor() {
    this.realAPIClient = new RealAPIClient(apiConfig);
  }

  private shouldUseRealAPI(): boolean {
    return apiConfig.useRealAPI && !!apiConfig.baseURL;
  }

  // Repository methods
  async getRepositories() {
    if (this.shouldUseRealAPI()) {
      return this.realAPIClient.getRepositories();
    }
    return vcsService.getRepositories();
  }

  async getRepository(id: string) {
    if (this.shouldUseRealAPI()) {
      return this.realAPIClient.getRepository(id);
    }
    return vcsService.getRepository(id);
  }

  async cloneRepository(url: string, path: string) {
    if (this.shouldUseRealAPI()) {
      return this.realAPIClient.cloneRepository(url, path);
    }
    return vcsService.cloneRepository(url, path);
  }

  // File methods
  async getFiles(repositoryId: string, path?: string) {
    if (this.shouldUseRealAPI()) {
      return this.realAPIClient.getFiles(repositoryId, path);
    }
    return vcsService.getFiles(repositoryId, path);
  }

  async getFileContent(repositoryId: string, filePath: string) {
    if (this.shouldUseRealAPI()) {
      return this.realAPIClient.getFileContent(repositoryId, filePath);
    }
    return vcsService.getFileContent(filePath);
  }

  async stageFile(repositoryId: string, filePath: string) {
    if (this.shouldUseRealAPI()) {
      return this.realAPIClient.stageFile(repositoryId, filePath);
    }
    return vcsService.stageFile(filePath);
  }

  async unstageFile(repositoryId: string, filePath: string) {
    if (this.shouldUseRealAPI()) {
      return this.realAPIClient.unstageFile(repositoryId, filePath);
    }
    return vcsService.unstageFile(filePath);
  }

  // Commit methods
  async getCommits(repositoryId: string, branch?: string) {
    if (this.shouldUseRealAPI()) {
      return this.realAPIClient.getCommits(repositoryId, branch);
    }
    return vcsService.getCommits(repositoryId, branch);
  }

  async commit(repositoryId: string, message: string, files: string[]) {
    if (this.shouldUseRealAPI()) {
      return this.realAPIClient.commit(repositoryId, message, files);
    }
    return vcsService.commit({ message, files });
  }

  // Branch methods
  async getBranches(repositoryId: string) {
    if (this.shouldUseRealAPI()) {
      return this.realAPIClient.getBranches(repositoryId);
    }
    return vcsService.getBranches(repositoryId);
  }

  async createBranch(repositoryId: string, name: string, fromBranch?: string, checkout = false) {
    if (this.shouldUseRealAPI()) {
      return this.realAPIClient.createBranch(repositoryId, name, fromBranch);
    }
    return vcsService.createBranch({ name, fromBranch, checkout });
  }

  async switchBranch(repositoryId: string, branchName: string) {
    if (this.shouldUseRealAPI()) {
      return this.realAPIClient.switchBranch(repositoryId, branchName);
    }
    return vcsService.switchBranch(branchName);
  }

  // Sync methods
  async fetchChanges(repositoryId: string) {
    if (this.shouldUseRealAPI()) {
      return this.realAPIClient.fetchChanges(repositoryId);
    }
    return vcsService.fetchChanges(repositoryId);
  }

  async pullChanges(repositoryId: string) {
    if (this.shouldUseRealAPI()) {
      return this.realAPIClient.pullChanges(repositoryId);
    }
    return vcsService.pullChanges(repositoryId);
  }

  async pushChanges(repositoryId: string, branch?: string) {
    if (this.shouldUseRealAPI()) {
      return this.realAPIClient.pushChanges(repositoryId, branch);
    }
    return vcsService.pushChanges(repositoryId, branch);
  }
}

// Export singleton instance
export const apiAdapter = new APIAdapter();

// Utility functions for easy API switching
export function enableRealAPI(config: Omit<APIConfig, 'useRealAPI'>) {
  setAPIConfig({ ...config, useRealAPI: true });
}

export function enableMockAPI() {
  setAPIConfig({ useRealAPI: false });
}

export function isUsingRealAPI(): boolean {
  return getAPIConfig().useRealAPI;
}

// Migration utility for switching from mock to real API
export async function migrateToRealAPI(config: Omit<APIConfig, 'useRealAPI'>) {
  console.log('🔄 Migrating from mock API to real API...');
  
  try {
    // Test real API connection
    const testClient = new RealAPIClient({ ...config, useRealAPI: true });
    await testClient.getRepositories();
    
    // If successful, switch to real API
    enableRealAPI(config);
    console.log('✅ Successfully migrated to real API');
    return true;
  } catch (error) {
    console.error('❌ Failed to migrate to real API:', error);
    console.log('🔙 Falling back to mock API');
    enableMockAPI();
    return false;
  }
}