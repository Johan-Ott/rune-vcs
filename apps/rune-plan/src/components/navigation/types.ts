import React from 'react';

export interface NavigationHistoryEntry {
  path: string;
  timestamp: number;
  name: string;
}

export interface Bookmark {
  id: string;
  name: string;
  path: string;
  icon?: React.ReactNode;
  dateAdded: number;
}

export interface PathSuggestion {
  path: string;
  name: string;
  type: 'folder' | 'recent' | 'bookmark';
  icon?: React.ReactNode;
}

export interface BreadcrumbItem {
  name: string;
  path: string;
  icon?: React.ReactNode;
}
