// Simple favorites (starred) store backed by localStorage with subscription support
const STORAGE_KEY = 'rune_favorites_v1';

type Subscriber = (favorites: string[]) => void;

class FavoritesStore {
  private favorites: Set<string>;
  private subscribers: Set<Subscriber> = new Set();

  constructor() {
    this.favorites = new Set<string>();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const arr = JSON.parse(raw) as string[];
        arr.forEach(p => this.favorites.add(p));
      }
    } catch (e) {
      console.warn('Failed to load favorites from localStorage', e);
    }
  }

  private persist() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...this.favorites]));
    } catch (e) {
      console.warn('Failed to persist favorites', e);
    }
    this.subscribers.forEach(s => s(this.getAll()));
  }

  has(path: string) {
    return this.favorites.has(path);
  }

  add(path: string) {
    this.favorites.add(path);
    this.persist();
  }

  remove(path: string) {
    this.favorites.delete(path);
    this.persist();
  }

  toggle(path: string) {
    if (this.favorites.has(path)) this.favorites.delete(path);
    else this.favorites.add(path);
    this.persist();
  }

  getAll(): string[] {
    return [...this.favorites];
  }

  subscribe(cb: Subscriber): () => void {
    this.subscribers.add(cb);
    try { cb(this.getAll()); } catch (e) {}
    return () => { this.subscribers.delete(cb); };
  }
}

export const favoritesStore = new FavoritesStore();
