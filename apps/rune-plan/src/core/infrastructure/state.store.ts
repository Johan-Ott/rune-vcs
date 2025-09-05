/**
 * Application State Store
 * 
 * Simple state management without external dependencies
 * Using observer pattern for reactivity
 */

import { ApplicationState, ViewMode, NavigationState, Selection } from '../domain/models';
import { IStateStore } from '../domain/interfaces';

// ============================================================================
// State Store Implementation
// ============================================================================

export class AppStateStore implements IStateStore<ApplicationState> {
  private state: ApplicationState;
  private subscribers: ((state: ApplicationState) => void)[] = [];

  constructor(initialState?: Partial<ApplicationState>) {
    this.state = {
      theme: 'dark',
      viewMode: {
        type: 'tree',
        sortBy: 'name',
        sortDirection: 'asc',
        showHidden: false,
      },
      navigation: {
        currentPath: '',
        history: [],
        historyIndex: -1,
        favorites: [],
        bookmarks: [],
      },
      selection: {
        items: [],
        primary: undefined,
      },
      repository: undefined,
      isLoading: false,
      error: undefined,
      ...initialState,
    };
  }

  getState(): ApplicationState {
    return { ...this.state };
  }

  setState(newState: Partial<ApplicationState>): void {
    this.state = { ...this.state, ...newState };
    this.notifySubscribers();
  }

  subscribe(callback: (state: ApplicationState) => void): () => void {
    this.subscribers.push(callback);
    
    // Return unsubscribe function
    return () => {
      const index = this.subscribers.indexOf(callback);
      if (index > -1) {
        this.subscribers.splice(index, 1);
      }
    };
  }

  dispatch(action: AppAction): void {
    const newState = appReducer(this.state, action);
    this.state = newState;
    this.notifySubscribers();
  }

  private notifySubscribers(): void {
    this.subscribers.forEach(callback => callback(this.getState()));
  }

  // Convenience methods for common operations
  updateViewMode(viewMode: Partial<ViewMode>): void {
    this.setState({
      viewMode: { ...this.state.viewMode, ...viewMode }
    });
  }

  updateNavigation(navigation: Partial<NavigationState>): void {
    this.setState({
      navigation: { ...this.state.navigation, ...navigation }
    });
  }

  updateSelection(selection: Partial<Selection>): void {
    this.setState({
      selection: { ...this.state.selection, ...selection }
    });
  }

  setTheme(theme: 'light' | 'dark' | 'system'): void {
    this.setState({ theme });
  }

  setLoading(isLoading: boolean): void {
    this.setState({ isLoading });
  }

  setError(error: string | undefined): void {
    this.setState({ error });
  }

  clearError(): void {
    this.setState({ error: undefined });
  }
}

// ============================================================================
// Action Types & Reducer (Optional Redux-like pattern)
// ============================================================================

export type AppAction = 
  | { type: 'SET_THEME'; payload: 'light' | 'dark' | 'system' }
  | { type: 'SET_VIEW_MODE'; payload: Partial<ViewMode> }
  | { type: 'SET_NAVIGATION'; payload: Partial<NavigationState> }
  | { type: 'SET_SELECTION'; payload: Partial<Selection> }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | undefined }
  | { type: 'CLEAR_ERROR' }
  | { type: 'NAVIGATE_TO'; payload: { path: string } }
  | { type: 'SELECT_ITEM'; payload: { item: any; multiSelect: boolean } }
  | { type: 'CLEAR_SELECTION' };

export function appReducer(state: ApplicationState, action: AppAction): ApplicationState {
  switch (action.type) {
    case 'SET_THEME':
      return { ...state, theme: action.payload };
      
    case 'SET_VIEW_MODE':
      return { 
        ...state, 
        viewMode: { ...state.viewMode, ...action.payload }
      };
      
    case 'SET_NAVIGATION':
      return { 
        ...state, 
        navigation: { ...state.navigation, ...action.payload }
      };
      
    case 'SET_SELECTION':
      return { 
        ...state, 
        selection: { ...state.selection, ...action.payload }
      };
      
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload };
      
    case 'SET_ERROR':
      return { ...state, error: action.payload };
      
    case 'CLEAR_ERROR':
      return { ...state, error: undefined };
      
    case 'NAVIGATE_TO':
      const newHistory = [
        ...state.navigation.history.slice(0, state.navigation.historyIndex + 1),
        action.payload.path
      ];
      return {
        ...state,
        navigation: {
          ...state.navigation,
          currentPath: action.payload.path,
          history: newHistory,
          historyIndex: newHistory.length - 1,
        }
      };
      
    case 'SELECT_ITEM':
      // Implementation depends on multiSelect logic
      return state; // Placeholder
      
    case 'CLEAR_SELECTION':
      return {
        ...state,
        selection: { items: [], primary: undefined }
      };
      
    default:
      return state;
  }
}

// ============================================================================
// State Persistence
// ============================================================================

export class StatePersistence {
  private static readonly STORAGE_KEY = 'rune-vcs-app-state';

  static saveState(state: ApplicationState): void {
    try {
      const stateToSave = {
        theme: state.theme,
        viewMode: state.viewMode,
        navigation: {
          favorites: state.navigation.favorites,
          bookmarks: state.navigation.bookmarks,
        }
      };
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stateToSave));
    } catch (error) {
      console.warn('Failed to save state to localStorage:', error);
    }
  }

  static loadState(): Partial<ApplicationState> | null {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (!saved) return null;
      
      const parsed = JSON.parse(saved);
      return {
        theme: parsed.theme,
        viewMode: parsed.viewMode,
        navigation: {
          currentPath: '',
          history: [],
          historyIndex: -1,
          favorites: parsed.navigation?.favorites || [],
          bookmarks: parsed.navigation?.bookmarks || [],
        }
      };
    } catch (error) {
      console.warn('Failed to load state from localStorage:', error);
      return null;
    }
  }

  static clearState(): void {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
    } catch (error) {
      console.warn('Failed to clear state from localStorage:', error);
    }
  }
}

// ============================================================================
// React Hooks for State (Presentation Layer)
// ============================================================================

import { useState, useEffect } from 'react';

export function useAppState(store: AppStateStore) {
  const [state, setState] = useState(store.getState());

  useEffect(() => {
    const unsubscribe = store.subscribe(setState);
    return unsubscribe;
  }, [store]);

  return state;
}

export function useAppSelector<T>(
  store: AppStateStore, 
  selector: (state: ApplicationState) => T
): T {
  const [selectedState, setSelectedState] = useState(() => selector(store.getState()));

  useEffect(() => {
    const unsubscribe = store.subscribe((state) => {
      const newSelectedState = selector(state);
      setSelectedState(newSelectedState);
    });
    return unsubscribe;
  }, [store, selector]);

  return selectedState;
}

// Specific selectors for common use cases
export const selectors = {
  theme: (state: ApplicationState) => state.theme,
  viewMode: (state: ApplicationState) => state.viewMode,
  navigation: (state: ApplicationState) => state.navigation,
  selection: (state: ApplicationState) => state.selection,
  repository: (state: ApplicationState) => state.repository,
  isLoading: (state: ApplicationState) => state.isLoading,
  error: (state: ApplicationState) => state.error,
  currentPath: (state: ApplicationState) => state.navigation.currentPath,
  selectedItems: (state: ApplicationState) => state.selection.items,
  canGoBack: (state: ApplicationState) => state.navigation.historyIndex > 0,
  canGoForward: (state: ApplicationState) => 
    state.navigation.historyIndex < state.navigation.history.length - 1,
};
