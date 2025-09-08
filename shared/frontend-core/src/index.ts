import { useState, useEffect } from 'react';
import { invoke } from '@tauri-apps/api/tauri';

// Delade types
export interface AppInfo {
  name: string;
  version: string;
  description: string;
}

export interface ThemeSettings {
  theme: string;
  accent_color: string;
  font_size: number;
}

// Hook för app information
export function useAppInfo() {
  const [appInfo, setAppInfo] = useState<AppInfo | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    invoke<AppInfo>('get_app_info')
      .then(setAppInfo)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  return { appInfo, loading };
}

// Hook för tema-hantering
export function useTheme() {
  const [theme, setTheme] = useState<ThemeSettings | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    invoke<ThemeSettings>('get_theme_settings')
      .then(setTheme)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const updateTheme = async (newTheme: ThemeSettings) => {
    try {
      await invoke('update_theme_settings', { settings: newTheme });
      setTheme(newTheme);
    } catch (error) {
      console.error('Failed to update theme:', error);
    }
  };

  return { theme, updateTheme, loading };
}

// Hook för window controls
export function useWindowControls() {
  const minimize = () => invoke('minimize_window');
  const maximize = () => invoke('maximize_window');
  const close = () => invoke('close_window');

  return { minimize, maximize, close };
}

// Delade utility funktioner
export const formatFileSize = (bytes: number): string => {
  const units = ['B', 'KB', 'MB', 'GB'];
  let size = bytes;
  let unitIndex = 0;

  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024;
    unitIndex++;
  }

  return `${size.toFixed(1)} ${units[unitIndex]}`;
};

export const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('sv-SE', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  }).format(date);
};
