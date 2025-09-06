import { useState } from 'react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from './ui/dialog';
import {
  Plus,
  FolderOpen
} from 'lucide-react';
import { Project, Workspace } from '../types';

interface WelcomeViewProps {
  onCreateProject: (project: Omit<Project, 'id' | 'issueCount' | 'completedCount' | 'goals'>) => Promise<Project | null>;
  onCreateWorkspace: (workspace: Omit<Workspace, 'id'>) => Promise<Workspace>;
  onOpenProject: () => void;
}

export function WelcomeView({ 
  onCreateProject, 
  onCreateWorkspace, 
  onOpenProject 
}: WelcomeViewProps) {
  const [createProjectOpen, setCreateProjectOpen] = useState(false);
  const [createWorkspaceOpen, setCreateWorkspaceOpen] = useState(false);
  
  // Project creation form
  const [projectData, setProjectData] = useState({
    name: '',
    description: ''
  });

  // Workspace creation form
  const [workspaceData, setWorkspaceData] = useState({
    name: '',
    description: ''
  });

  const handleCreateProject = async () => {
    if (!projectData.name.trim()) return;
    
    await onCreateProject({
      name: projectData.name.trim(),
      description: projectData.description.trim(),
      status: 'active',
      members: []
    });
    
    setCreateProjectOpen(false);
    setProjectData({ name: '', description: '' });
  };

  const handleCreateWorkspace = async () => {
    if (!workspaceData.name.trim()) return;
    
    await onCreateWorkspace({
      name: workspaceData.name.trim(),
      description: workspaceData.description.trim(),
      members: []
    });
    
    setCreateWorkspaceOpen(false);
    setWorkspaceData({ name: '', description: '' });
  };

  return (
    <div className="h-full flex flex-col bg-gradient-to-br from-background to-secondary/20">
      {/* Header */}
      <div className="flex-shrink-0 p-8 text-center">
        <div className="mb-6">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent mb-2">
            Welcome to Rune Plan
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Your intelligent project planning and issue tracking workspace. 
            Get started by creating a new project or opening an existing one.
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-8 pb-8">
        <div className="w-full max-w-6xl">
          {/* Action Cards */}
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            <Card className="p-8 hover:shadow-lg transition-shadow border-2 hover:border-primary/20">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <Plus className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Create New Project</h3>
                <p className="text-muted-foreground mb-6">
                  Start fresh with a new project workspace for your team
                </p>
                <Dialog open={createProjectOpen} onOpenChange={setCreateProjectOpen}>
                  <DialogTrigger asChild>
                    <Button size="lg" className="w-full">
                      Create Project
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Create New Project</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="project-name">Project Name</Label>
                        <Input
                          id="project-name"
                          placeholder="My Awesome Project"
                          value={projectData.name}
                          onChange={(e) => setProjectData(prev => ({ ...prev, name: e.target.value }))}
                        />
                      </div>
                      <div>
                        <Label htmlFor="project-description">Description</Label>
                        <Textarea
                          id="project-description"
                          placeholder="Describe your project..."
                          value={projectData.description}
                          onChange={(e) => setProjectData(prev => ({ ...prev, description: e.target.value }))}
                          rows={3}
                        />
                      </div>
                      <div className="flex gap-2 pt-4">
                        <Button 
                          onClick={handleCreateProject}
                          disabled={!projectData.name.trim()}
                          className="flex-1"
                        >
                          Create Project
                        </Button>
                        <Button 
                          variant="outline" 
                          onClick={() => setCreateProjectOpen(false)}
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </Card>

            <Card className="p-8 hover:shadow-lg transition-shadow border-2 hover:border-primary/20">
              <div className="text-center">
                <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <FolderOpen className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-xl font-semibold mb-2">Open Existing Project</h3>
                <p className="text-muted-foreground mb-6">
                  Load an existing project from your workspace
                </p>
                <Button size="lg" variant="outline" className="w-full" onClick={onOpenProject}>
                  Open Project
                </Button>
              </div>
            </Card>
          </div>

          {/* Quick Start Options */}
          <div className="text-center mb-8">
            <p className="text-sm text-muted-foreground mb-4">Or create a new workspace</p>
            <Dialog open={createWorkspaceOpen} onOpenChange={setCreateWorkspaceOpen}>
              <DialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Plus className="w-4 h-4 mr-2" />
                  Create Workspace
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Workspace</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="workspace-name">Workspace Name</Label>
                    <Input
                      id="workspace-name"
                      placeholder="My Organization"
                      value={workspaceData.name}
                      onChange={(e) => setWorkspaceData(prev => ({ ...prev, name: e.target.value }))}
                    />
                  </div>
                  <div>
                    <Label htmlFor="workspace-description">Description</Label>
                    <Textarea
                      id="workspace-description"
                      placeholder="Describe your workspace..."
                      value={workspaceData.description}
                      onChange={(e) => setWorkspaceData(prev => ({ ...prev, description: e.target.value }))}
                      rows={3}
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button 
                      onClick={handleCreateWorkspace}
                      disabled={!workspaceData.name.trim()}
                      className="flex-1"
                    >
                      Create Workspace
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={() => setCreateWorkspaceOpen(false)}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
}
