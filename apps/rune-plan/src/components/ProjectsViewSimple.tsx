import React, { useState } from 'react';
import { 
  FolderOpen, 
  Plus, 
  ChevronRight,
  Edit3,
  Trash2,
  Check,
  X,
  Users,
  Activity,
  Play,
  Pause,
  CheckSquare,
  TrendingUp
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader } from './ui/card';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { InlineIssue } from './InlineIssue';
import { InlineIssueCreator } from './InlineIssueCreator';
import { cn } from './ui/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ExpandableRow, ExpandableRowContent, useExpandableRows } from './ExpandableRow';
import { Project, Issue } from '../App';

interface ProjectsViewSimpleProps {
  projects: Project[];
  issues: Issue[];
  selectedIssue: Issue | null;
  onIssueSelect: (issue: Issue) => void;
  onProjectCreate?: (project: Project) => void;
  onProjectUpdate?: (project: Project) => void;
  onProjectDelete?: (projectId: string) => void;
  onIssueCreate?: (issue: Issue) => void;
}

export function ProjectsViewSimple({ 
  projects, 
  issues, 
  selectedIssue, 
  onIssueSelect,
  onProjectCreate,
  onProjectUpdate,
  onProjectDelete,
  onIssueCreate
}: ProjectsViewSimpleProps) {
  const { isExpanded, toggleRow } = useExpandableRows();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingProject, setEditingProject] = useState<string | null>(null);
  const [newProject, setNewProject] = useState({
    name: '',
    description: '',
    status: 'active' as Project['status']
  });
  const [editingProjectData, setEditingProjectData] = useState<Project | null>(null);

  const getProjectIssues = (projectName: string) => {
    return issues.filter(issue => issue.project === projectName);
  };

  const handleCreateIssue = (title: string, projectName: string) => {
    if (onIssueCreate) {
      const newIssue: Issue = {
        id: `RUN-${Math.floor(Math.random() * 10000)}`,
        title,
        status: 'todo',
        priority: 'medium',
        description: '',
        labels: [],
        project: projectName,
        attachments: [],
        subIssues: [],
        activity: []
      };
      onIssueCreate(newIssue);
    }
  };

  const getProjectStatusIcon = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return <Play className="w-4 h-4 text-green-500" />;
      case 'paused':
        return <Pause className="w-4 h-4 text-yellow-500" />;
      case 'completed':
        return <CheckSquare className="w-4 h-4 text-blue-500" />;
    }
  };

  const getProjectStatusColor = (status: Project['status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-500/10 text-green-700 dark:text-green-400';
      case 'paused':
        return 'bg-yellow-500/10 text-yellow-700 dark:text-yellow-400';
      case 'completed':
        return 'bg-blue-500/10 text-blue-700 dark:text-blue-400';
    }
  };

  const calculateProjectStats = (project: Project) => {
    const projectIssues = getProjectIssues(project.name);
    const completed = projectIssues.filter(issue => issue.status === 'done').length;
    const total = projectIssues.length;
    const progress = total > 0 ? Math.round((completed / total) * 100) : 0;
    
    return {
      total,
      completed,
      progress,
      inProgress: projectIssues.filter(issue => issue.status === 'in-progress').length,
      todo: projectIssues.filter(issue => issue.status === 'todo').length
    };
  };

  const handleCreateProject = () => {
    if (newProject.name.trim() && onProjectCreate) {
      const project: Project = {
        id: newProject.name.toLowerCase().replace(/\s+/g, '-'),
        name: newProject.name,
        description: newProject.description,
        status: newProject.status,
        issueCount: 0,
        completedCount: 0,
        goals: [],
        members: []
      };
      onProjectCreate(project);
      setNewProject({ name: '', description: '', status: 'active' });
      setShowCreateForm(false);
    }
  };

  const handleUpdateProject = () => {
    if (editingProjectData && onProjectUpdate) {
      const stats = calculateProjectStats(editingProjectData);
      const updatedProject = {
        ...editingProjectData,
        issueCount: stats.total,
        completedCount: stats.completed
      };
      onProjectUpdate(updatedProject);
      setEditingProject(null);
      setEditingProjectData(null);
    }
  };

  const handleProjectExpand = (projectId: string) => {
    toggleRow(projectId);
    setEditingProject(null);
    setEditingProjectData(null);
  };

  const handleStartEdit = (project: Project) => {
    setEditingProject(project.id);
    setEditingProjectData({ ...project });
  };

  const handleCancelEdit = () => {
    setEditingProject(null);
    setEditingProjectData(null);
  };

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-2">Projects</h2>
          <p className="text-sm text-muted-foreground">
            Organize your work into projects and track progress
          </p>
        </div>

        <div className="bg-card rounded-lg border border-border/50 overflow-hidden">
          {/* Create Project Section */}
          <ExpandableRow
            className="opacity-60 hover:opacity-100 transition-opacity"
            onExpandChange={() => setShowCreateForm(!showCreateForm)}
            expandedContent={
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="project-name">Project name*</Label>
                    <Input
                      id="project-name"
                      placeholder="e.g. Core Platform, Mobile App"
                      value={newProject.name}
                      onChange={(e) => setNewProject(prev => ({ ...prev, name: e.target.value }))}
                      className="mt-1 h-8"
                    />
                  </div>
                  <div>
                    <Label htmlFor="project-status">Status</Label>
                    <Select
                      value={newProject.status}
                      onValueChange={(value: Project['status']) => 
                        setNewProject(prev => ({ ...prev, status: value }))
                      }
                    >
                      <SelectTrigger className="mt-1 h-8">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Active</SelectItem>
                        <SelectItem value="paused">Paused</SelectItem>
                        <SelectItem value="completed">Completed</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div>
                  <Label htmlFor="project-description">Description</Label>
                  <Input
                    id="project-description"
                    placeholder="What is this project about?"
                    value={newProject.description}
                    onChange={(e) => setNewProject(prev => ({ ...prev, description: e.target.value }))}
                    className="mt-1 h-8"
                  />
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={handleCreateProject} 
                    disabled={!newProject.name.trim()}
                    size="sm"
                    className="h-7 px-3"
                  >
                    Create project
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-7 px-3"
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewProject({ name: '', description: '', status: 'active' });
                    }}
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            }
          >
            <ExpandableRowContent
              avatar={
                <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
                  <Plus className="w-3 h-3 text-primary" />
                </div>
              }
              title={<span className="text-muted-foreground">Create new project</span>}
              subtitle="Set up a new project to organize issues"
            />
          </ExpandableRow>

          {/* Projects List */}
          {projects.map((project) => {
            const projectIssues = getProjectIssues(project.name);
            const stats = calculateProjectStats(project);
            
            return (
              <ExpandableRow
                key={project.id}
                onExpandChange={() => handleProjectExpand(project.id)}
                expandedContent={
                  <div className="space-y-4">
                        
                        {/* Project Info Section */}
                        <div className="mb-6">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium">Project Details</h4>
                            <div className="flex gap-2">
                              {editingProject === project.id ? (
                                <>
                                  <Button size="sm" onClick={handleUpdateProject}>
                                    <Check className="w-4 h-4 mr-1" />
                                    Save
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                                    <X className="w-4 h-4 mr-1" />
                                    Cancel
                                  </Button>
                                </>
                              ) : (
                                <>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => handleStartEdit(project)}
                                  >
                                    <Edit3 className="w-4 h-4 mr-1" />
                                    Edit
                                  </Button>
                                  <Button 
                                    size="sm" 
                                    variant="outline"
                                    onClick={() => onProjectDelete?.(project.id)}
                                    className="text-destructive hover:text-destructive"
                                  >
                                    <Trash2 className="w-4 h-4 mr-1" />
                                    Delete
                                  </Button>
                                </>
                              )}
                            </div>
                          </div>
                          
                          {editingProject === project.id && editingProjectData ? (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="edit-name">Project name</Label>
                                  <Input
                                    id="edit-name"
                                    value={editingProjectData.name}
                                    onChange={(e) => setEditingProjectData(prev => 
                                      prev ? { ...prev, name: e.target.value } : null
                                    )}
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="edit-status">Status</Label>
                                  <Select
                                    value={editingProjectData.status}
                                    onValueChange={(value: Project['status']) => 
                                      setEditingProjectData(prev => 
                                        prev ? { ...prev, status: value } : null
                                      )
                                    }
                                  >
                                    <SelectTrigger className="mt-1">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="active">Active</SelectItem>
                                      <SelectItem value="paused">Paused</SelectItem>
                                      <SelectItem value="completed">Completed</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                              </div>
                              <div>
                                <Label htmlFor="edit-description">Description</Label>
                                <Input
                                  id="edit-description"
                                  value={editingProjectData.description || ''}
                                  onChange={(e) => setEditingProjectData(prev => 
                                    prev ? { ...prev, description: e.target.value } : null
                                  )}
                                  className="mt-1"
                                />
                              </div>
                            </div>
                          ) : (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                              <div className="space-y-3">
                                <div>
                                  <div className="text-sm text-muted-foreground">Description</div>
                                  <div className="text-sm">{project.description || 'No description provided'}</div>
                                </div>
                                <div>
                                  <div className="text-sm text-muted-foreground">Project ID</div>
                                  <div className="text-sm font-mono">{project.id}</div>
                                </div>
                              </div>
                              <div className="space-y-3">
                                <div>
                                  <div className="text-sm text-muted-foreground">Progress</div>
                                  <div className="flex items-center gap-2">
                                    <Progress value={stats.progress} className="flex-1" />
                                    <span className="text-sm font-medium">{stats.progress}%</span>
                                  </div>
                                </div>
                                <div className="grid grid-cols-3 gap-2">
                                  <div className="text-center p-2 bg-muted/50 rounded">
                                    <div className="text-sm font-medium">{stats.todo}</div>
                                    <div className="text-xs text-muted-foreground">Todo</div>
                                  </div>
                                  <div className="text-center p-2 bg-muted/50 rounded">
                                    <div className="text-sm font-medium">{stats.inProgress}</div>
                                    <div className="text-xs text-muted-foreground">In Progress</div>
                                  </div>
                                  <div className="text-center p-2 bg-muted/50 rounded">
                                    <div className="text-sm font-medium">{stats.completed}</div>
                                    <div className="text-xs text-muted-foreground">Done</div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Project Members Section */}
                        {project.members.length > 0 && (
                          <div className="mb-6">
                            <h4 className="font-medium mb-3">Team Members ({project.members.length})</h4>
                            <div className="flex flex-wrap gap-2">
                              {project.members.map((member, index) => (
                                <div key={index} className="flex items-center gap-2 bg-muted/50 rounded-full px-3 py-1">
                                  <Avatar className="w-5 h-5">
                                    <AvatarImage src={member.avatar} alt={member.name} />
                                    <AvatarFallback className="text-xs">
                                      {member.name.split(' ').map(n => n.charAt(0)).join('')}
                                    </AvatarFallback>
                                  </Avatar>
                                  <span className="text-sm">{member.name}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                        {/* Project Issues Section */}
                        <div>
                          <h4 className="font-medium mb-4">Project Issues ({projectIssues.length})</h4>
                          
                          {projectIssues.length === 0 ? (
                            <div className="text-center py-8">
                              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-3">
                                <FolderOpen className="w-6 h-6 text-muted-foreground" />
                              </div>
                              <h3 className="font-medium mb-1">No issues yet</h3>
                              <p className="text-sm text-muted-foreground mb-3">
                                Create your first issue to get started with this project.
                              </p>
                              <InlineIssueCreator
                                onCreateIssue={(title) => handleCreateIssue(title, project.name)}
                                placeholder="Create first issue for this project..."
                              />
                            </div>
                          ) : (
                            <div className="space-y-1 max-h-96 overflow-y-auto">
                              {projectIssues.map((issue) => (
                                <InlineIssue
                                  key={issue.id}
                                  issue={issue}
                                  selected={selectedIssue?.id === issue.id}
                                  onClick={() => onIssueSelect(issue)}
                                  showProject={false}
                                  showTeam={true}
                                  showEstimation={true}
                                />
                              ))}
                              <InlineIssueCreator
                                onCreateIssue={(title) => handleCreateIssue(title, project.name)}
                                placeholder="Add another issue..."
                                className="mt-2"
                              />
                            </div>
                          )}
                        </div>
                  </div>
                }
              >
                <ExpandableRowContent
                  avatar={
                    <div className="w-6 h-6 bg-muted rounded-lg flex items-center justify-center">
                      <FolderOpen className="w-4 h-4 text-muted-foreground" />
                    </div>
                  }
                  title={project.name}
                  badges={[
                    <Badge 
                      key="status"
                      variant="secondary" 
                      className={cn("text-xs h-4 px-2 flex items-center gap-1", getProjectStatusColor(project.status))}
                    >
                      {getProjectStatusIcon(project.status)}
                      {project.status}
                    </Badge>,
                    <span key="progress" className="text-xs text-muted-foreground px-2">
                      {stats.progress}% • {stats.total} issues • {project.members.length} members
                    </span>
                  ]}
                />
              </ExpandableRow>
            );
          })}

        </div>

        {/* Empty State */}
        {projects.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
              <FolderOpen className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-2">No projects yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first project to organize your issues and track progress.
            </p>
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Create Project
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}