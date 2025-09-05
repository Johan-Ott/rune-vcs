// Main Interface Component - Core UI for Rune VCS
// Handles file browser, repository view, and main operations

import React, { useEffect, useState } from 'react';
import { useRuneVCS } from '../contexts/RuneVCSContext';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { Input } from './ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';

interface MainInterfaceProps {
  theme: 'dark' | 'light';
}

export function MainInterface({ theme }: MainInterfaceProps) {
  const {
    state,
    loadRepository,
    loadFiles,
    stageFile,
    unstageFile,
    commit,
    loadBranches,
    switchBranch,
    createBranch,
    selectFile,
    clearSelection,
    setSearchQuery,
    testConnection,
    setMockMode,
  } = useRuneVCS();

  const [commitMessage, setCommitMessage] = useState('');
  const [newBranchName, setNewBranchName] = useState('');

  // Initialize repository on mount
  useEffect(() => {
    const init = async () => {
      try {
        await loadRepository();
      } catch (error) {
        console.log('Failed to load repository, using mock mode');
        setMockMode(true);
      }
    };
    init();
  }, []);

  const handleCommit = async () => {
    if (!commitMessage.trim()) return;
    
    try {
      await commit({
        message: commitMessage,
        files: state.selectedFiles,
      });
      setCommitMessage('');
      clearSelection();
    } catch (error) {
      console.error('Commit failed:', error);
    }
  };

  const handleCreateBranch = async () => {
    if (!newBranchName.trim()) return;
    
    try {
      await createBranch({ name: newBranchName });
      setNewBranchName('');
    } catch (error) {
      console.error('Branch creation failed:', error);
    }
  };

  const getFileStatusColor = (status?: string) => {
    switch (status) {
      case 'modified': return 'bg-yellow-500';
      case 'added': return 'bg-green-500';
      case 'deleted': return 'bg-red-500';
      case 'untracked': return 'bg-blue-500';
      case 'staged': return 'bg-purple-500';
      default: return 'bg-gray-500';
    }
  };

  if (!state.isRepositoryLoaded && !state.useMockData) {
    return (
      <div className="h-full flex items-center justify-center">
        <Card className="w-96">
          <CardHeader>
            <CardTitle>Welcome to Rune VCS</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-gray-600">
              No repository loaded. Initialize or clone a repository to get started.
            </p>
            <div className="flex space-x-2">
              <Button onClick={() => loadRepository()}>
                Open Repository
              </Button>
              <Button variant="outline" onClick={() => setMockMode(true)}>
                Use Demo Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Repository Header */}
      {state.currentRepository && (
        <div className="p-4 border-b border-gray-800 bg-gray-900/30">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold">{state.currentRepository.name}</h2>
              <p className="text-sm text-gray-400">{state.currentRepository.path}</p>
            </div>
            <div className="flex items-center space-x-2">
              <Badge variant="outline">{state.currentBranch}</Badge>
              <Badge 
                variant={state.currentRepository.status === 'clean' ? 'default' : 'destructive'}
              >
                {state.currentRepository.status}
              </Badge>
              {state.useMockData && (
                <Badge variant="secondary">Mock Data</Badge>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Content Tabs */}
      <Tabs defaultValue="files" className="flex-1 flex flex-col">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="commits">Commits</TabsTrigger>
          <TabsTrigger value="branches">Branches</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
        </TabsList>

        {/* Files Tab */}
        <TabsContent value="files" className="flex-1 p-4">
          <div className="grid grid-cols-2 gap-4 h-full">
            {/* File Browser */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Files
                  <Input
                    placeholder="Search files..."
                    value={state.searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-48"
                  />
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  {state.files.map((file) => (
                    <div
                      key={file.id}
                      className={`flex items-center justify-between p-2 rounded-md cursor-pointer transition-colors ${
                        state.selectedFiles.includes(file.path)
                          ? 'bg-blue-600/30'
                          : 'hover:bg-gray-700/30'
                      }`}
                      onClick={() => selectFile(file.path)}
                    >
                      <div className="flex items-center space-x-2">
                        <span>{file.type === 'folder' ? '📁' : '📄'}</span>
                        <span className="text-sm">{file.name}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        {file.status && (
                          <div className={`w-2 h-2 rounded-full ${getFileStatusColor(file.status)}`} />
                        )}
                        {file.status && (
                          <Badge variant="outline" className="text-xs">
                            {file.status}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Staging Area */}
            <Card>
              <CardHeader>
                <CardTitle>Staging Area</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {/* Selected Files */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Selected Files</h4>
                  <ScrollArea className="h-32 border rounded-md p-2">
                    {state.selectedFiles.map((filePath) => (
                      <div key={filePath} className="flex items-center justify-between py-1">
                        <span className="text-sm">{filePath}</span>
                        <div className="flex space-x-1">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => stageFile(filePath)}
                          >
                            Stage
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => unstageFile(filePath)}
                          >
                            Unstage
                          </Button>
                        </div>
                      </div>
                    ))}
                  </ScrollArea>
                </div>

                {/* Commit Section */}
                <div>
                  <h4 className="text-sm font-medium mb-2">Commit</h4>
                  <div className="space-y-2">
                    <Input
                      placeholder="Commit message..."
                      value={commitMessage}
                      onChange={(e) => setCommitMessage(e.target.value)}
                    />
                    <Button
                      onClick={handleCommit}
                      disabled={!commitMessage.trim() || state.selectedFiles.length === 0}
                      className="w-full"
                    >
                      Commit ({state.selectedFiles.length} files)
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Commits Tab */}
        <TabsContent value="commits" className="flex-1 p-4">
          <Card>
            <CardHeader>
              <CardTitle>Commit History</CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                {state.commits.map((commit) => (
                  <div key={commit.id} className="border-b border-gray-700 p-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{commit.message}</p>
                        <p className="text-sm text-gray-400">
                          {commit.author} • {commit.date}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge variant="outline" className="text-xs">
                          {commit.hash.substring(0, 8)}
                        </Badge>
                        <p className="text-xs text-gray-400 mt-1">
                          +{commit.insertions} -{commit.deletions}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </ScrollArea>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Branches Tab */}
        <TabsContent value="branches" className="flex-1 p-4">
          <div className="grid grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle>Branches</CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-64">
                  {state.branches.map((branch) => (
                    <div
                      key={branch.id}
                      className={`flex items-center justify-between p-2 rounded-md cursor-pointer ${
                        branch.current
                          ? 'bg-blue-600/30'
                          : 'hover:bg-gray-700/30'
                      }`}
                      onClick={() => !branch.current && switchBranch(branch.name)}
                    >
                      <div>
                        <span className="font-medium">{branch.name}</span>
                        {branch.current && (
                          <Badge variant="default" className="ml-2 text-xs">current</Badge>
                        )}
                      </div>
                      <div className="text-xs text-gray-400">
                        {branch.ahead > 0 && `+${branch.ahead} `}
                        {branch.behind > 0 && `-${branch.behind}`}
                      </div>
                    </div>
                  ))}
                </ScrollArea>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Create Branch</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <Input
                  placeholder="New branch name..."
                  value={newBranchName}
                  onChange={(e) => setNewBranchName(e.target.value)}
                />
                <Button
                  onClick={handleCreateBranch}
                  disabled={!newBranchName.trim()}
                  className="w-full"
                >
                  Create Branch
                </Button>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Operations Tab */}
        <TabsContent value="operations" className="flex-1 p-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Operations</CardTitle>
            </CardHeader>
            <CardContent>
              {state.lastOperation ? (
                <div className={`p-3 rounded-md ${
                  state.lastOperation.success 
                    ? 'bg-green-600/20 border border-green-600/30' 
                    : 'bg-red-600/20 border border-red-600/30'
                }`}>
                  <p className="text-sm font-medium">
                    {state.lastOperation.success ? '✅' : '❌'} {state.lastOperation.message}
                  </p>
                  {state.isOperationInProgress && (
                    <p className="text-xs text-gray-400 mt-1">Operation in progress...</p>
                  )}
                </div>
              ) : (
                <p className="text-gray-400 text-sm">No recent operations</p>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
