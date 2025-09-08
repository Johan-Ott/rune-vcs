import { useEffect, useCallback } from 'react';

interface KeyboardShortcuts {
  // File operations
  'cmd+c': () => void;
  'cmd+x': () => void;
  'cmd+v': () => void;
  'cmd+a': () => void;
  'cmd+z': () => void;
  'cmd+shift+z': () => void;
  'delete': () => void;
  'backspace': () => void;
  'f2': () => void;
  'enter': () => void;
  'space': () => void;
  
  // Navigation
  'cmd+up': () => void;
  'cmd+down': () => void;
  'cmd+left': () => void;
  'cmd+right': () => void;
  'cmd+1': () => void;
  'cmd+2': () => void;
  'cmd+3': () => void;
  
  // View controls
  'cmd+plus': () => void;
  'cmd+minus': () => void;
  'cmd+0': () => void;
  'f5': () => void;
  'cmd+r': () => void;
  
  // Search and selection
  'cmd+f': () => void;
  'cmd+shift+f': () => void;
  'escape': () => void;
  'cmd+d': () => void;
  'cmd+i': () => void;
  'cmd+shift+d': () => void;
  
  // Quick actions
  'cmd+n': () => void;
  'cmd+shift+n': () => void;
  'cmd+t': () => void;
  'cmd+w': () => void;
}

interface UseKeyboardShortcutsProps {
  shortcuts: Partial<KeyboardShortcuts>;
  disabled?: boolean;
}

export const useKeyboardShortcuts = ({ shortcuts, disabled = false }: UseKeyboardShortcutsProps) => {
  const handleKeyDown = useCallback((event: KeyboardEvent) => {
    if (disabled) return;
    
    // Don't trigger shortcuts when typing in inputs
    const target = event.target as HTMLElement;
    if (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.contentEditable === 'true') {
      return;
    }

    const key = event.key.toLowerCase();
    const cmd = event.metaKey || event.ctrlKey;
    const shift = event.shiftKey;
    const alt = event.altKey;

    // Build shortcut string
    let shortcut = '';
    if (cmd) shortcut += 'cmd+';
    if (shift) shortcut += 'shift+';
    if (alt) shortcut += 'alt+';
    shortcut += key;

    // Handle special keys
    const specialKeys: Record<string, string> = {
      ' ': 'space',
      'arrowup': 'up',
      'arrowdown': 'down',
      'arrowleft': 'left',
      'arrowright': 'right',
      '=': 'plus',
      '-': 'minus',
      '0': '0',
    };

    if (specialKeys[key]) {
      shortcut = shortcut.replace(key, specialKeys[key]);
    }

    // Execute shortcut if it exists
    const handler = shortcuts[shortcut as keyof KeyboardShortcuts];
    if (handler) {
      event.preventDefault();
      event.stopPropagation();
      handler();
    }
  }, [shortcuts, disabled]);

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);
};
