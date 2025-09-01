/**
 * Core Architecture Index
 * 
 * Clean exports for the entire core layer
 */

// Domain exports
export * from './domain/models';
export * from './domain/interfaces';

// Application exports  
export * from './application/usecases';

// Infrastructure exports
export * from './infrastructure/file-system.service';
export * from './infrastructure/state.store';
export * from './infrastructure/di-container';

// Re-export commonly used types and functions
export type {
  FileSystemItem,
  Repository,
  ApplicationState,
  ViewMode,
  NavigationState,
  Selection
} from './domain/models';

export type {
  IFileSystemService,
  IVCSService,
  IStateStore,
  IEventBus
} from './domain/interfaces';

export {
  DIContainer,
  DIProvider,
  useDI,
  useFileSystemUseCase,
  useVCSUseCase,
  useNavigationUseCase,
  useAppStateStore
} from './infrastructure/di-container';

export {
  AppStateStore,
  useAppState,
  useAppSelector,
  selectors
} from './infrastructure/state.store';
