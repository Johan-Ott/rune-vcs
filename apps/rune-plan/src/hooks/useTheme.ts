import { useState, useEffect } from 'react';
import { Theme } from '../types';

const THEME_STORAGE_KEY = 'rune-plan-theme';

export function useTheme() {
  // Initialize theme from localStorage or default to system preference
  const [theme, setTheme] = useState<Theme>(() => {
    if (typeof window === 'undefined') return 'dark';
    
    const stored = localStorage.getItem(THEME_STORAGE_KEY);
    if (stored && ['light', 'dark', 'system'].includes(stored)) {
      return stored as Theme;
    }
    
    return 'system';
  });

  // Apply theme to document
  useEffect(() => {
    const root = window.document.documentElement;
    
    // Remove existing theme classes
    root.classList.remove('light', 'dark');

    if (theme === 'system') {
      // Use system preference
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }

    // Save to localStorage
    localStorage.setItem(THEME_STORAGE_KEY, theme);
  }, [theme]);

  // Listen for system theme changes when theme is 'system'
  useEffect(() => {
    if (theme !== 'system') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      const root = window.document.documentElement;
      root.classList.remove('light', 'dark');
      root.classList.add(mediaQuery.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [theme]);

  const setThemeWithTransition = (newTheme: Theme) => {
    // Optional: Add smooth transition
    const root = window.document.documentElement;
    root.style.transition = 'background-color 0.2s ease, color 0.2s ease';
    
    setTheme(newTheme);
    
    // Remove transition after animation completes
    setTimeout(() => {
      root.style.transition = '';
    }, 200);
  };

  return { theme, setTheme: setThemeWithTransition };
}