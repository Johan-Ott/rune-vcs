import React, { useState } from 'react';
import {
  FolderOpen,
  GitBranch,
  HardDrive,
  Cloud,
  Search,
  ChevronRight,
  Folder,
  Star,
  Clock,
  Plus
} from 'lucide-react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Separator } from './ui/separator';

interface WelcomeScreenProps {
  isDark: boolean;
  onSelectLocation: (type: 'explorer' | 'repository', path: string) => void;
}

const recentLocations = [
  { name: 'Documents', path: '/home/user/Documents', type: 'folder' as const, lastAccessed: '2 hours ago' },
  { name: 'Downloads', path: '/home/user/Downloads', type: 'folder' as const, lastAccessed: '1 day ago' },
  { name: 'Pictures', path: '/home/user/Pictures', type: 'folder' as const, lastAccessed: '3 days ago' },
  { name: 'Desktop', path: '/home/user/Desktop', type: 'folder' as const, lastAccessed: '5 days ago' },
];

const recentRepositories = [
  { name: 'nordic-explorer', path: '/repos/nordic-explorer', type: 'repo' as const, branch: 'main', lastAccessed: '30 minutes ago' },
  { name: 'my-website', path: '/repos/my-website', type: 'repo' as const, branch: 'develop', lastAccessed: '2 hours ago' },
  { name: 'data-analysis', path: '/repos/data-analysis', type: 'repo' as const, branch: 'feature/charts', lastAccessed: '1 day ago' },
];

const quickAccess = [
  { name: 'Home', path: '/home/user', icon: HardDrive },
  { name: 'This PC', path: '/', icon: HardDrive },
  { name: 'OneDrive', path: '/cloud/onedrive', icon: Cloud },
  { name: 'Google Drive', path: '/cloud/gdrive', icon: Cloud },
];

export function WelcomeScreen({ isDark, onSelectLocation }: WelcomeScreenProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedType, setSelectedType] = useState<'explorer' | 'repository'>('explorer');

  const handleQuickAccess = (path: string) => {
    onSelectLocation('explorer', path);
  };

  const handleRecentLocation = (path: string, type: 'folder' | 'repo') => {
    onSelectLocation(type === 'repo' ? 'repository' : 'explorer', path);
  };

  const handleBrowse = () => {
    // In a real app, this would open a folder picker dialog
    onSelectLocation(selectedType, selectedType === 'explorer' ? '/home/user' : '/repos');
  };

  return (
    <div className="flex-1 flex items-center justify-center p-8 overflow-auto">
      <div className="w-full max-w-4xl space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-semibold">Welcome to Nordic Explorer</h1>
          <p className="text-muted-foreground">Choose how you'd like to get started</p>
        </div>

        {/* Main Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* File Explorer Card */}
          <Card 
            className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
              selectedType === 'explorer' 
                ? `${isDark ? 'bg-white/10 border-white/20' : 'bg-black/10 border-black/20'} aurora-glow` 
                : ''
            }`}
            onClick={() => setSelectedType('explorer')}
          >
            <CardHeader className="text-center">
              <div className={`w-16 h-16 mx-auto rounded-full ${isDark ? 'bg-white/10' : 'bg-black/10'} flex items-center justify-center mb-4`}>
                <FolderOpen className="w-8 h-8" />
              </div>
              <CardTitle>File Explorer</CardTitle>
              <CardDescription>
                Browse your local files and folders with a modern interface
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button 
                  onClick={handleBrowse}
                  className="w-full" 
                  variant={selectedType === 'explorer' ? 'default' : 'outline'}
                >
                  <Search className="w-4 h-4 mr-2" />
                  Browse for Folder
                </Button>
                
                <div className="text-xs text-muted-foreground text-center">
                  Access files, manage folders, and organize your workspace
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Repository Card */}
          <Card 
            className={`cursor-pointer transition-all duration-200 hover:scale-105 ${
              selectedType === 'repository' 
                ? `${isDark ? 'bg-white/10 border-white/20' : 'bg-black/10 border-black/20'} aurora-glow` 
                : ''
            }`}
            onClick={() => setSelectedType('repository')}
          >
            <CardHeader className="text-center">
              <div className={`w-16 h-16 mx-auto rounded-full ${isDark ? 'bg-white/10' : 'bg-black/10'} flex items-center justify-center mb-4`}>
                <GitBranch className="w-8 h-8" />
              </div>
              <CardTitle>Repository</CardTitle>
              <CardDescription>
                Work with version-controlled projects using Rune Source Control
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <Button 
                  onClick={handleBrowse}
                  className="w-full" 
                  variant={selectedType === 'repository' ? 'default' : 'outline'}
                >
                  <Search className="w-4 h-4 mr-2" />
                  Browse for Repository
                </Button>
                
                <div className="text-xs text-muted-foreground text-center">
                  Track changes, manage branches, and collaborate with teams
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <Separator className={`${isDark ? 'bg-white/10' : 'bg-black/10'}`} />

        {/* Quick Access and Recent */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Quick Access */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <Star className="w-4 h-4" />
              Quick Access
            </h3>
            <div className="space-y-2">
              {quickAccess.map((item) => (
                <Button
                  key={item.path}
                  variant="ghost"
                  className="w-full justify-start gap-3 h-10"
                  onClick={() => handleQuickAccess(item.path)}
                >
                  <item.icon className="w-4 h-4" />
                  <span>{item.name}</span>
                  <ChevronRight className="w-3 h-3 ml-auto opacity-50" />
                </Button>
              ))}
            </div>
          </div>

          {/* Recent */}
          <div className="space-y-4">
            <h3 className="font-medium flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Recent
            </h3>
            <div className="space-y-2">
              {/* Recent Folders */}
              {recentLocations.slice(0, 2).map((item) => (
                <Button
                  key={item.path}
                  variant="ghost"
                  className="w-full justify-start gap-3 h-10"
                  onClick={() => handleRecentLocation(item.path, item.type)}
                >
                  <Folder className="w-4 h-4" />
                  <div className="flex-1 text-left">
                    <div className="text-sm">{item.name}</div>
                    <div className="text-xs text-muted-foreground">{item.lastAccessed}</div>
                  </div>
                  <ChevronRight className="w-3 h-3 opacity-50" />
                </Button>
              ))}
              
              {/* Recent Repositories */}
              {recentRepositories.slice(0, 2).map((item) => (
                <Button
                  key={item.path}
                  variant="ghost"
                  className="w-full justify-start gap-3 h-10"
                  onClick={() => handleRecentLocation(item.path, item.type)}
                >
                  <GitBranch className="w-4 h-4" />
                  <div className="flex-1 text-left">
                    <div className="text-sm flex items-center gap-2">
                      {item.name}
                      <Badge variant="outline" className="text-xs h-4">
                        {item.branch}
                      </Badge>
                    </div>
                    <div className="text-xs text-muted-foreground">{item.lastAccessed}</div>
                  </div>
                  <ChevronRight className="w-3 h-3 opacity-50" />
                </Button>
              ))}
            </div>
          </div>
        </div>

        {/* Custom Path Input */}
        <Card className={`${isDark ? 'glass-card' : 'glass-card-light'}`}>
          <CardHeader>
            <CardTitle className="text-lg">Custom Path</CardTitle>
            <CardDescription>
              Enter a specific path to open directly
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex gap-2">
              <Input
                placeholder={selectedType === 'explorer' ? '/home/user/projects' : '/repos/my-project'}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1"
              />
              <Button 
                onClick={() => onSelectLocation(selectedType, searchTerm || '/')}
                disabled={!searchTerm.trim()}
              >
                <Plus className="w-4 h-4 mr-2" />
                Open
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}