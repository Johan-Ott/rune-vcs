/**
 * Application Services (Use Cases)
 * 
 * These services contain the business logic and orchestrate domain operations.
 * They are independent of UI and infrastructure concerns.
 */

import {
  FileSystemItem,
  Repository,
  NavigationState,
  Selection,
  ViewMode,
  ApplicationState,
  DomainEvent
} from '../domain/models';

import {
  IFileSystemService,
  IVCSService,
  IStateStore,
  IEventBus,
  INotificationService,
  IDialogService
} from '../domain/interfaces';

// ============================================================================
// File System Use Cases
// ============================================================================

export class FileSystemUseCase {
  constructor(
    private fileSystemService: IFileSystemService,
    private stateStore: IStateStore<ApplicationState>,
    private eventBus: IEventBus,
    private notificationService: INotificationService
  ) {}

  async navigateToDirectory(path: string): Promise<void> {
    try {
      this.stateStore.setState({ isLoading: true });
      
      const items = await this.fileSystemService.navigateToDirectory(path);
      
      // Update navigation state
      const currentState = this.stateStore.getState();
      const newHistory = [...currentState.navigation.history.slice(0, currentState.navigation.historyIndex + 1), path];
      
      this.stateStore.setState({
        navigation: {
          ...currentState.navigation,
          currentPath: path,
          history: newHistory,
          historyIndex: newHistory.length - 1
        },
        isLoading: false,
        error: undefined
      });

      // Publish navigation event
      this.eventBus.publish({
        id: crypto.randomUUID(),
        type: 'navigation:changed',
        timestamp: new Date(),
        payload: { from: currentState.navigation.currentPath, to: path }
      });

    } catch (error) {
      this.stateStore.setState({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Navigation failed' 
      });
      this.notificationService.error('Failed to navigate to directory');
    }
  }

  async createFile(path: string, name: string): Promise<void> {
    try {
      const fullPath = `${path}/${name}`;
      const newFile = await this.fileSystemService.createFile(fullPath);
      
      this.eventBus.publish({
        id: crypto.randomUUID(),
        type: 'file:created',
        timestamp: new Date(),
        payload: { path: fullPath, item: newFile }
      });
      
      this.notificationService.success(`File "${name}" created successfully`);
      
      // Refresh current directory
      await this.refreshCurrentDirectory();
      
    } catch (error) {
      this.notificationService.error(`Failed to create file: ${error}`);
    }
  }

  async createDirectory(path: string, name: string): Promise<void> {
    try {
      const fullPath = `${path}/${name}`;
      const newDir = await this.fileSystemService.createDirectory(fullPath);
      
      this.eventBus.publish({
        id: crypto.randomUUID(),
        type: 'directory:created',
        timestamp: new Date(),
        payload: { path: fullPath, item: newDir }
      });
      
      this.notificationService.success(`Directory "${name}" created successfully`);
      
      // Refresh current directory
      await this.refreshCurrentDirectory();
      
    } catch (error) {
      this.notificationService.error(`Failed to create directory: ${error}`);
    }
  }

  async deleteItems(items: FileSystemItem[]): Promise<void> {
    try {
      for (const item of items) {
        await this.fileSystemService.deleteItem(item.path);
        
        this.eventBus.publish({
          id: crypto.randomUUID(),
          type: 'file:deleted',
          timestamp: new Date(),
          payload: { path: item.path, item }
        });
      }
      
      this.notificationService.success(
        `${items.length} item${items.length > 1 ? 's' : ''} deleted successfully`
      );
      
      // Clear selection and refresh
      this.clearSelection();
      await this.refreshCurrentDirectory();
      
    } catch (error) {
      this.notificationService.error(`Failed to delete items: ${error}`);
    }
  }

  async refreshCurrentDirectory(): Promise<void> {
    const currentPath = this.stateStore.getState().navigation.currentPath;
    await this.navigateToDirectory(currentPath);
  }

  // Selection management
  selectItem(item: FileSystemItem, multiSelect: boolean = false): void {
    const currentState = this.stateStore.getState();
    let newSelection: Selection;

    if (multiSelect) {
      const isAlreadySelected = currentState.selection.items.some(i => i.id === item.id);
      if (isAlreadySelected) {
        newSelection = {
          items: currentState.selection.items.filter(i => i.id !== item.id),
          primary: currentState.selection.items.length > 1 ? currentState.selection.primary : undefined
        };
      } else {
        newSelection = {
          items: [...currentState.selection.items, item],
          primary: item
        };
      }
    } else {
      newSelection = {
        items: [item],
        primary: item
      };
    }

    this.stateStore.setState({ selection: newSelection });
    
    this.eventBus.publish({
      id: crypto.randomUUID(),
      type: 'selection:changed',
      timestamp: new Date(),
      payload: { 
        items: newSelection.items, 
        action: multiSelect ? 'multiple' : 'single' 
      }
    });
  }

  clearSelection(): void {
    this.stateStore.setState({ 
      selection: { items: [], primary: undefined } 
    });
    
    this.eventBus.publish({
      id: crypto.randomUUID(),
      type: 'selection:cleared',
      timestamp: new Date(),
      payload: { items: [], action: 'single' }
    });
  }

  // View mode management
  changeViewMode(viewMode: Partial<ViewMode>): void {
    const currentState = this.stateStore.getState();
    this.stateStore.setState({
      viewMode: { ...currentState.viewMode, ...viewMode }
    });
  }
}

// ============================================================================
// VCS Use Cases
// ============================================================================

export class VCSUseCase {
  constructor(
    private vcsService: IVCSService,
    private stateStore: IStateStore<ApplicationState>,
    private eventBus: IEventBus,
    private notificationService: INotificationService,
    private dialogService: IDialogService
  ) {}

  async initializeRepository(path: string): Promise<void> {
    try {
      this.stateStore.setState({ isLoading: true });
      
      const repository = await this.vcsService.initRepository(path);
      
      this.stateStore.setState({ 
        repository,
        isLoading: false,
        error: undefined 
      });
      
      this.notificationService.success('Repository initialized successfully');
      
    } catch (error) {
      this.stateStore.setState({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to initialize repository' 
      });
      this.notificationService.error('Failed to initialize repository');
    }
  }

  async openRepository(path: string): Promise<void> {
    try {
      this.stateStore.setState({ isLoading: true });
      
      const repository = await this.vcsService.openRepository(path);
      
      this.stateStore.setState({ 
        repository,
        isLoading: false,
        error: undefined 
      });
      
      this.notificationService.success('Repository opened successfully');
      
    } catch (error) {
      this.stateStore.setState({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Failed to open repository' 
      });
      this.notificationService.error('Failed to open repository');
    }
  }

  async commitChanges(message: string, files?: string[]): Promise<void> {
    try {
      const repository = this.stateStore.getState().repository;
      if (!repository) {
        throw new Error('No repository opened');
      }

      const commit = await this.vcsService.commit(repository.path, message, files);
      
      // Update repository state
      const updatedRepository = await this.vcsService.getStatus(repository.path);
      this.stateStore.setState({ repository: updatedRepository });
      
      this.notificationService.success('Changes committed successfully');
      
    } catch (error) {
      this.notificationService.error(`Failed to commit changes: ${error}`);
    }
  }

  async createBranch(branchName: string): Promise<void> {
    try {
      const repository = this.stateStore.getState().repository;
      if (!repository) {
        throw new Error('No repository opened');
      }

      await this.vcsService.createBranch(repository.path, branchName);
      
      // Refresh repository state
      const updatedRepository = await this.vcsService.getStatus(repository.path);
      this.stateStore.setState({ repository: updatedRepository });
      
      this.notificationService.success(`Branch "${branchName}" created successfully`);
      
    } catch (error) {
      this.notificationService.error(`Failed to create branch: ${error}`);
    }
  }

  async switchBranch(branchName: string): Promise<void> {
    try {
      const repository = this.stateStore.getState().repository;
      if (!repository) {
        throw new Error('No repository opened');
      }

      await this.vcsService.switchBranch(repository.path, branchName);
      
      // Refresh repository state
      const updatedRepository = await this.vcsService.getStatus(repository.path);
      this.stateStore.setState({ repository: updatedRepository });
      
      this.notificationService.success(`Switched to branch "${branchName}"`);
      
    } catch (error) {
      this.notificationService.error(`Failed to switch branch: ${error}`);
    }
  }
}

// ============================================================================
// Navigation Use Cases
// ============================================================================

export class NavigationUseCase {
  constructor(
    private stateStore: IStateStore<ApplicationState>,
    private fileSystemUseCase: FileSystemUseCase,
    private eventBus: IEventBus
  ) {}

  async goBack(): Promise<void> {
    const state = this.stateStore.getState();
    const { navigation } = state;
    
    if (navigation.historyIndex > 0) {
      const newIndex = navigation.historyIndex - 1;
      const targetPath = navigation.history[newIndex];
      
      this.stateStore.setState({
        navigation: {
          ...navigation,
          historyIndex: newIndex,
          currentPath: targetPath
        }
      });
      
      this.eventBus.publish({
        id: crypto.randomUUID(),
        type: 'navigation:back',
        timestamp: new Date(),
        payload: { from: navigation.currentPath, to: targetPath }
      });
      
      await this.fileSystemUseCase.navigateToDirectory(targetPath);
    }
  }

  async goForward(): Promise<void> {
    const state = this.stateStore.getState();
    const { navigation } = state;
    
    if (navigation.historyIndex < navigation.history.length - 1) {
      const newIndex = navigation.historyIndex + 1;
      const targetPath = navigation.history[newIndex];
      
      this.stateStore.setState({
        navigation: {
          ...navigation,
          historyIndex: newIndex,
          currentPath: targetPath
        }
      });
      
      this.eventBus.publish({
        id: crypto.randomUUID(),
        type: 'navigation:forward',
        timestamp: new Date(),
        payload: { from: navigation.currentPath, to: targetPath }
      });
      
      await this.fileSystemUseCase.navigateToDirectory(targetPath);
    }
  }

  async goToParent(): Promise<void> {
    const currentPath = this.stateStore.getState().navigation.currentPath;
    const parentPath = currentPath.split('/').slice(0, -1).join('/') || '/';
    await this.fileSystemUseCase.navigateToDirectory(parentPath);
  }

  addToFavorites(path: string): void {
    const state = this.stateStore.getState();
    const favorites = [...state.navigation.favorites];
    
    if (!favorites.includes(path)) {
      favorites.push(path);
      this.stateStore.setState({
        navigation: { ...state.navigation, favorites }
      });
    }
  }

  removeFromFavorites(path: string): void {
    const state = this.stateStore.getState();
    const favorites = state.navigation.favorites.filter(f => f !== path);
    this.stateStore.setState({
      navigation: { ...state.navigation, favorites }
    });
  }
}
