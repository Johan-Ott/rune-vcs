// Simple import fallback to avoid webpack issues
import React from 'react';
import { SimpleHeader } from './components/SimpleHeader';
import { FileExplorerWithTabs } from './components/FileExplorerWithTabs';
import { StatusBar } from './components/StatusBar';
import { TooltipProvider } from './components/ui/tooltip';
import { Toaster } from './components/ui/sonner';
import { AppProvider, useApp } from './contexts/AppContext';
import { VCSProvider } from './contexts/VCSContext';
import { ErrorBoundary } from './components/ErrorBoundary';
import { DIProvider } from './core/infrastructure/di-container';

// Main App Component - Simple version without advanced services
function AppContent() {
  const { 
    state, 
    setTheme, 
    addTab, 
    removeTab, 
    setActiveTab, 
    updateTabLocation, 
    updateTabBranch, 
    setSidebarSection 
  } = useApp();

  const handleLocationSelect = (type: 'explorer' | 'repository', path: string) => {
    try {
      const activeTab = state.tabs.find(tab => tab.id === state.activeTabId);
      if (activeTab?.isWelcome) {
        updateTabLocation(state.activeTabId, path);
      }
    } catch (error) {
      console.error('Error handling location select:', error);
    }
  };

  const activeTab = state.tabs.find(tab => tab.id === state.activeTabId);
  const isProfileTab = activeTab?.label === 'Profile & Settings';

  return (
    <TooltipProvider>
      <div className={`h-screen w-screen overflow-hidden ${state.isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <SimpleHeader 
            isDark={state.isDark} 
            onThemeToggle={() => setTheme(!state.isDark)}
          />
          
          {/* Main Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Main Panel */}
            <div className="flex-1 flex flex-col">
              <FileExplorerWithTabs 
                isDark={state.isDark} 
                onThemeToggle={() => setTheme(!state.isDark)}
              />
            </div>
          </div>
          
          {/* Status Bar */}
          <StatusBar isDark={state.isDark} />
        </div>
        
        {/* Toast Notifications */}
        <Toaster 
          theme={state.isDark ? 'dark' : 'light'}
          position="bottom-right"
          expand={true}
          richColors
        />
      </div>
    </TooltipProvider>
  );
}

// Root App Component with Providers
export default function App() {
  return (
    <ErrorBoundary>
      <DIProvider>
        <AppProvider>
          <VCSProvider>
            <AppContent />
          </VCSProvider>
        </AppProvider>
      </DIProvider>
    </ErrorBoundary>
  );
}