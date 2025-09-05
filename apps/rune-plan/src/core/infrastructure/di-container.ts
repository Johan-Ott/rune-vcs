/**
 * Dependency Injection Container
 * 
 * Simple DI container to wire up all dependencies and provide
 * a clean way to access services throughout the application.
 */

import { 
  IFileSystemService, 
  IVCSService, 
  IStateStore, 
  IEventBus,
  INotificationService,
  IDialogService,
  ITauriService 
} from '../domain/interfaces';
import { ApplicationState } from '../domain/models';
import { 
  FileSystemUseCase, 
  VCSUseCase, 
  NavigationUseCase 
} from '../application/usecases';
import { 
  TauriFileSystemService, 
  MockFileSystemService 
} from './file-system.service';
import { AppStateStore, StatePersistence } from './state.store';

// ============================================================================
// Service Implementations
// ============================================================================

class SimpleEventBus implements IEventBus {
  private subscribers: Map<string, Function[]> = new Map();

  publish<T>(event: T & { type: string }): void {
    const handlers = this.subscribers.get(event.type) || [];
    handlers.forEach(handler => {
      try {
        handler(event);
      } catch (error) {
        console.error('Error in event handler:', error);
      }
    });
  }

  subscribe<T>(eventType: string, handler: (event: T) => void): () => void {
    if (!this.subscribers.has(eventType)) {
      this.subscribers.set(eventType, []);
    }
    
    this.subscribers.get(eventType)!.push(handler);
    
    // Return unsubscribe function
    return () => {
      const handlers = this.subscribers.get(eventType);
      if (handlers) {
        const index = handlers.indexOf(handler);
        if (index > -1) {
          handlers.splice(index, 1);
        }
      }
    };
  }

  unsubscribe(eventType: string, handler: Function): void {
    const handlers = this.subscribers.get(eventType);
    if (handlers) {
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
      }
    }
  }
}

class SimpleNotificationService implements INotificationService {
  success(message: string, title?: string): void {
    this.showNotification('success', message, title);
  }

  error(message: string, title?: string): void {
    this.showNotification('error', message, title);
  }

  warning(message: string, title?: string): void {
    this.showNotification('warning', message, title);
  }

  info(message: string, title?: string): void {
    this.showNotification('info', message, title);
  }

  private showNotification(type: string, message: string, title?: string): void {
    // For now, use console logging. In a real app, you'd integrate with
    // a toast library like react-hot-toast or sonner
    console.log(`[${type.toUpperCase()}] ${title ? title + ': ' : ''}${message}`);
    
    // Could also dispatch custom events for UI components to listen to
    window.dispatchEvent(new CustomEvent('app:notification', {
      detail: { type, message, title }
    }));
  }
}

class SimpleDialogService implements IDialogService {
  async confirm(message: string, title?: string): Promise<boolean> {
    return window.confirm(`${title ? title + '\n\n' : ''}${message}`);
  }

  async openFile(options?: any): Promise<string | null> {
    // This would integrate with Tauri's dialog API
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      return await invoke('open_file_dialog', options);
    } catch {
      // Fallback for web
      return null;
    }
  }

  async openDirectory(options?: any): Promise<string | null> {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      return await invoke('open_directory_dialog', options);
    } catch {
      // Fallback for web
      return null;
    }
  }

  async saveFile(options?: any): Promise<string | null> {
    try {
      const { invoke } = await import('@tauri-apps/api/core');
      return await invoke('save_file_dialog', options);
    } catch {
      // Fallback for web
      return null;
    }
  }
}

class TauriService implements ITauriService {
  async invoke<T>(command: string, args?: any): Promise<T> {
    const { invoke } = await import('@tauri-apps/api/core');
    return invoke(command, args);
  }

  async listen<T>(event: string, handler: (event: T) => void): Promise<() => void> {
    const { listen } = await import('@tauri-apps/api/event');
    return listen(event, (event: any) => handler(event));
  }

  async emit(event: string, payload?: any): Promise<void> {
    const { emit } = await import('@tauri-apps/api/event');
    return emit(event, payload);
  }
}

// Mock VCS Service for development
class MockVCSService implements IVCSService {
  async initRepository(path: string): Promise<any> {
    throw new Error('VCS operations not implemented yet');
  }

  async openRepository(path: string): Promise<any> {
    throw new Error('VCS operations not implemented yet');
  }

  async getStatus(repositoryPath: string): Promise<any> {
    throw new Error('VCS operations not implemented yet');
  }

  async getCommitHistory(repositoryPath: string, limit?: number): Promise<any> {
    throw new Error('VCS operations not implemented yet');
  }

  async commit(repositoryPath: string, message: string, files?: string[]): Promise<any> {
    throw new Error('VCS operations not implemented yet');
  }

  async getChanges(repositoryPath: string): Promise<any> {
    throw new Error('VCS operations not implemented yet');
  }

  async stageFiles(repositoryPath: string, files: string[]): Promise<void> {
    throw new Error('VCS operations not implemented yet');
  }

  async unstageFiles(repositoryPath: string, files: string[]): Promise<void> {
    throw new Error('VCS operations not implemented yet');
  }

  async createBranch(repositoryPath: string, branchName: string): Promise<void> {
    throw new Error('VCS operations not implemented yet');
  }

  async switchBranch(repositoryPath: string, branchName: string): Promise<void> {
    throw new Error('VCS operations not implemented yet');
  }

  async mergeBranch(repositoryPath: string, branchName: string): Promise<void> {
    throw new Error('VCS operations not implemented yet');
  }

  async push(repositoryPath: string, remote?: string, branch?: string): Promise<void> {
    throw new Error('VCS operations not implemented yet');
  }

  async pull(repositoryPath: string, remote?: string, branch?: string): Promise<void> {
    throw new Error('VCS operations not implemented yet');
  }
}

// ============================================================================
// Dependency Injection Container
// ============================================================================

export class DIContainer {
  private static instance: DIContainer;
  private services: Map<string, any> = new Map();

  private constructor() {
    this.initializeServices();
  }

  static getInstance(): DIContainer {
    if (!DIContainer.instance) {
      DIContainer.instance = new DIContainer();
    }
    return DIContainer.instance;
  }

  private initializeServices(): void {
    // Infrastructure services
    const eventBus = new SimpleEventBus();
    const notificationService = new SimpleNotificationService();
    const dialogService = new SimpleDialogService();
    const tauriService = new TauriService();
    
    // State management
    const initialState = StatePersistence.loadState();
    const stateStore = new AppStateStore(initialState || undefined);
    
    // Persist state changes
    stateStore.subscribe((state) => {
      StatePersistence.saveState(state);
    });

    // File system service (choose based on environment)
    const fileSystemService = this.isTauriEnvironment() 
      ? new TauriFileSystemService()
      : new MockFileSystemService();

    // VCS service (placeholder for now)
    const vcsService = new MockVCSService();

    // Use cases
    const fileSystemUseCase = new FileSystemUseCase(
      fileSystemService,
      stateStore,
      eventBus,
      notificationService
    );

    const vcsUseCase = new VCSUseCase(
      vcsService,
      stateStore,
      eventBus,
      notificationService,
      dialogService
    );

    const navigationUseCase = new NavigationUseCase(
      stateStore,
      fileSystemUseCase,
      eventBus
    );

    // Register services
    this.services.set('eventBus', eventBus);
    this.services.set('notificationService', notificationService);
    this.services.set('dialogService', dialogService);
    this.services.set('tauriService', tauriService);
    this.services.set('stateStore', stateStore);
    this.services.set('fileSystemService', fileSystemService);
    this.services.set('vcsService', vcsService);
    this.services.set('fileSystemUseCase', fileSystemUseCase);
    this.services.set('vcsUseCase', vcsUseCase);
    this.services.set('navigationUseCase', navigationUseCase);
  }

  get<T>(serviceName: string): T {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Service '${serviceName}' not found`);
    }
    return service as T;
  }

  // Convenience getters
  get stateStore(): IStateStore<ApplicationState> {
    return this.get('stateStore');
  }

  get fileSystemUseCase(): FileSystemUseCase {
    return this.get('fileSystemUseCase');
  }

  get vcsUseCase(): VCSUseCase {
    return this.get('vcsUseCase');
  }

  get navigationUseCase(): NavigationUseCase {
    return this.get('navigationUseCase');
  }

  get eventBus(): IEventBus {
    return this.get('eventBus');
  }

  get notificationService(): INotificationService {
    return this.get('notificationService');
  }

  private isTauriEnvironment(): boolean {
    return typeof window !== 'undefined' && '__TAURI__' in window;
  }
}

// ============================================================================
// React Context Provider
// ============================================================================

import React, { createContext, useContext, ReactNode } from 'react';

const DIContext = createContext<DIContainer | null>(null);

interface DIProviderProps {
  children: ReactNode;
}

export function DIProvider({ children }: DIProviderProps): React.ReactElement {
  const container = DIContainer.getInstance();
  
  return React.createElement(
    DIContext.Provider,
    { value: container },
    children
  );
}

export function useDI(): DIContainer {
  const container = useContext(DIContext);
  if (!container) {
    throw new Error('useDI must be used within a DIProvider');
  }
  return container;
}

// Specific hooks for common services
export function useFileSystemUseCase(): FileSystemUseCase {
  return useDI().fileSystemUseCase;
}

export function useVCSUseCase(): VCSUseCase {
  return useDI().vcsUseCase;
}

export function useNavigationUseCase(): NavigationUseCase {
  return useDI().navigationUseCase;
}

export function useAppStateStore(): IStateStore<ApplicationState> {
  return useDI().stateStore;
}
