import React from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { FileExplorer } from './components/FileExplorer';
import { ModernFileExplorer } from './components/ModernFileExplorer';
import { StatusBar } from './components/StatusBar';
import { TooltipProvider } from './components/ui/tooltip';
import { Toaster } from './components/ui/sonner';
import { AppProvider, useApp } from './contexts/AppContext';
import { VCSProvider } from './contexts/VCSContext';
import { ErrorBoundary } from './components/ErrorBoundary';

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
      <div className={`h-screen w-screen overflow-hidden ${state.isDark ? 'aurora-bg' : 'aurora-bg-light'} ${state.isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
        <div className="h-full flex flex-col">
          {/* Header */}
          <Header 
            isDark={state.isDark} 
            onThemeToggle={() => setTheme(!state.isDark)}
            tabs={state.tabs}
            activeTabId={state.activeTabId}
            onTabChange={setActiveTab}
            onNewTab={addTab}
            onCloseTab={removeTab}
            onBranchChange={updateTabBranch}
          />
          
          {/* Main Content */}
          <div className="flex-1 flex overflow-hidden">
            {/* Conditional Sidebar - Only show for non-Modern File Explorer views */}
            {!(activeTab && activeTab.type === 'explorer' && !activeTab.isWelcome && !isProfileTab) && (
              <Sidebar 
                isDark={state.isDark} 
                activeTabType={activeTab?.type || 'explorer'}
                activeSection={state.sidebarSection}
                onSectionChange={setSidebarSection}
                isProfileTab={isProfileTab}
              />
            )}
            
            {/* Main Panel */}
            <div className="flex-1 flex flex-col">
              {activeTab && activeTab.type === 'explorer' && !activeTab.isWelcome && !isProfileTab ? (
                <ModernFileExplorer
                  key={state.activeTabId}
                  isDark={state.isDark} 
                  tabId={state.activeTabId}
                  initialPath={activeTab.currentPath || 'Documents'}
                  onLocationChange={(newPath: string) => updateTabLocation(state.activeTabId, newPath)}
                />
              ) : (
                <FileExplorer 
                  key={state.activeTabId}
                  isDark={state.isDark} 
                  tabType={activeTab?.type || 'explorer'}
                  section={state.sidebarSection}
                  isWelcomeTab={activeTab?.isWelcome || false}
                  isProfileTab={isProfileTab}
                  onLocationSelect={handleLocationSelect}
                  onThemeToggle={() => setTheme(!state.isDark)}
                />
              )}
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
      <AppProvider>
        <VCSProvider>
          <AppContent />
        </VCSProvider>
      </AppProvider>
    </ErrorBoundary>
  );
}