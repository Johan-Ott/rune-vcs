import React, { useState } from 'react';
import { Plus, Target, Calendar, CheckCircle2, Clock, Play, Pause, Edit3, Trash2, BarChart3 } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Card, CardContent, CardHeader } from './ui/card';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { cn } from './ui/utils';
import { ExpandableRow, ExpandableRowContent, useExpandableRows } from './ExpandableRow';
import { Goal, Project, Issue } from '../App';

interface GoalsViewProps {
  goals: Goal[];
  projects: Project[];
  issues: Issue[];
  onGoalCreate: (goal: Goal) => void;
  onGoalUpdate: (goal: Goal) => void;
  onGoalDelete: (goalId: string) => void;
}

const getStatusIcon = (status: Goal['status']) => {
  switch (status) {
    case 'active':
      return <Play className="w-4 h-4 text-green-500" />;
    case 'completed':
      return <CheckCircle2 className="w-4 h-4 text-blue-500" />;
    case 'paused':
      return <Pause className="w-4 h-4 text-yellow-500" />;
    default:
      return <Target className="w-4 h-4 text-muted-foreground" />;
  }
};

const getStatusLabel = (status: Goal['status']) => {
  switch (status) {
    case 'active':
      return 'Active';
    case 'completed':
      return 'Completed';
    case 'paused':
      return 'Paused';
    default:
      return 'Unknown';
  }
};

const getStatusBadgeVariant = (status: Goal['status']) => {
  switch (status) {
    case 'active':
      return 'default';
    case 'completed':
      return 'secondary';
    case 'paused':
      return 'outline';
    default:
      return 'outline';
  }
};

export function GoalsView({ goals, projects, issues, onGoalCreate, onGoalUpdate, onGoalDelete }: GoalsViewProps) {
  const [isCreating, setIsCreating] = useState(false);
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);
  const [newGoal, setNewGoal] = useState({
    title: '',
    description: '',
    projectId: '',
    targetDate: '',
    status: 'active' as Goal['status']
  });

  const handleCreateGoal = () => {
    if (newGoal.title && newGoal.projectId) {
      const goal: Goal = {
        id: `goal-${Date.now()}`,
        title: newGoal.title,
        description: newGoal.description,
        projectId: newGoal.projectId,
        status: newGoal.status,
        targetDate: newGoal.targetDate,
        issuesCount: 0,
        completedIssuesCount: 0
      };
      onGoalCreate(goal);
      setNewGoal({ title: '', description: '', projectId: '', targetDate: '', status: 'active' });
      setIsCreating(false);
    }
  };

  const handleUpdateGoal = () => {
    if (editingGoal) {
      onGoalUpdate(editingGoal);
      setEditingGoal(null);
    }
  };

  const getGoalProgress = (goal: Goal) => {
    const goalIssues = issues.filter(issue => issue.goalId === goal.id);
    const completedIssues = goalIssues.filter(issue => issue.status === 'done');
    return goalIssues.length > 0 ? (completedIssues.length / goalIssues.length) * 100 : 0;
  };

  const getGoalStats = (goal: Goal) => {
    const goalIssues = issues.filter(issue => issue.goalId === goal.id);
    const completedIssues = goalIssues.filter(issue => issue.status === 'done');
    return {
      total: goalIssues.length,
      completed: completedIssues.length,
      progress: goalIssues.length > 0 ? (completedIssues.length / goalIssues.length) * 100 : 0
    };
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const isOverdue = (targetDate: string) => {
    return new Date(targetDate) < new Date();
  };

  const groupedGoals = goals.reduce((acc, goal) => {
    if (!acc[goal.status]) {
      acc[goal.status] = [];
    }
    acc[goal.status].push(goal);
    return acc;
  }, {} as Record<Goal['status'], Goal[]>);

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-medium mb-2">Goals</h2>
            <p className="text-sm text-muted-foreground">
              Track progress towards your project objectives
            </p>
          </div>
          <Dialog open={isCreating} onOpenChange={setIsCreating}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                New Goal
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Goal</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Title</Label>
                  <Input
                    placeholder="Enter goal title"
                    value={newGoal.title}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea
                    placeholder="Enter goal description"
                    value={newGoal.description}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, description: e.target.value }))}
                    rows={3}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Project</Label>
                  <Select value={newGoal.projectId} onValueChange={(value) => setNewGoal(prev => ({ ...prev, projectId: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select project" />
                    </SelectTrigger>
                    <SelectContent>
                      {projects.map((project) => (
                        <SelectItem key={project.id} value={project.id}>
                          {project.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Target Date</Label>
                  <Input
                    type="date"
                    value={newGoal.targetDate}
                    onChange={(e) => setNewGoal(prev => ({ ...prev, targetDate: e.target.value }))}
                  />
                </div>
                <div className="flex gap-2 justify-end pt-4">
                  <Button variant="outline" onClick={() => setIsCreating(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateGoal} disabled={!newGoal.title || !newGoal.projectId}>
                    Create Goal
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Goals Overview */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <Play className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">Active Goals</span>
              </div>
              <p className="text-2xl font-bold">
                {groupedGoals.active?.length || 0}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle2 className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">Completed Goals</span>
              </div>
              <p className="text-2xl font-bold">
                {groupedGoals.completed?.length || 0}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-2">
                <BarChart3 className="w-4 h-4 text-muted-foreground" />
                <span className="text-sm font-medium">Avg. Progress</span>
              </div>
              <p className="text-2xl font-bold">
                {goals.length > 0 ? Math.round(goals.reduce((acc, goal) => acc + getGoalProgress(goal), 0) / goals.length) : 0}%
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Goals List */}
        <div className="bg-card rounded-lg border border-border/50 overflow-hidden">
          {goals.length === 0 ? (
            <div className="text-center py-12">
              <Target className="w-12 h-12 mx-auto mb-4 text-muted-foreground opacity-50" />
              <h3 className="text-lg font-medium mb-2">No goals yet</h3>
              <p className="text-muted-foreground mb-4">
                Create your first goal to start tracking project progress
              </p>
              <Button onClick={() => setIsCreating(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Create Goal
              </Button>
            </div>
          ) : (
            goals.map((goal) => {
              const project = projects.find(p => p.id === goal.projectId);
              const stats = getGoalStats(goal);
              
              return (
                <ExpandableRow
                  key={goal.id}
                  expandedContent={
                    <div className="space-y-4">
                      {/* Goal Details */}
                      <div className="space-y-3">
                        <div>
                          <div className="text-sm text-muted-foreground mb-1">Description</div>
                          <div className="text-sm">{goal.description}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <div className="text-sm text-muted-foreground mb-1">Project</div>
                            <div className="text-sm">{project?.name}</div>
                          </div>
                          {goal.targetDate && (
                            <div>
                              <div className="text-sm text-muted-foreground mb-1">Target Date</div>
                              <div className={cn(
                                "text-sm flex items-center gap-1",
                                isOverdue(goal.targetDate) && goal.status === 'active' && 'text-red-500'
                              )}>
                                <Calendar className="w-3 h-3" />
                                {formatDate(goal.targetDate)}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Progress Section */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Progress</span>
                          <span className="font-medium">{stats.completed} of {stats.total} issues completed</span>
                        </div>
                        <Progress value={stats.progress} className="h-2" />
                        <div className="flex justify-between text-xs text-muted-foreground">
                          <span>0%</span>
                          <span className="font-medium">{Math.round(stats.progress)}%</span>
                          <span>100%</span>
                        </div>
                      </div>
                    </div>
                  }
                >
                  <ExpandableRowContent
                    avatar={getStatusIcon(goal.status)}
                    title={goal.title}
                    badges={[
                      <Badge key="status" variant={getStatusBadgeVariant(goal.status)} className="text-xs h-4 px-2">
                        {getStatusLabel(goal.status)}
                      </Badge>,
                      <span key="progress" className="text-xs text-muted-foreground px-2">
                        {Math.round(stats.progress)}% • {stats.completed}/{stats.total}
                      </span>
                    ]}
                    actions={[
                      <Dialog key="edit" open={editingGoal?.id === goal.id} onOpenChange={(open) => !open && setEditingGoal(null)}>
                        <DialogTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            className="h-6 w-6 p-0"
                            onClick={() => setEditingGoal(goal)}
                          >
                            <Edit3 className="w-3 h-3" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle>Edit Goal</DialogTitle>
                          </DialogHeader>
                          {editingGoal && (
                            <div className="space-y-4 py-4">
                              <div className="space-y-2">
                                <Label>Title</Label>
                                <Input
                                  value={editingGoal.title}
                                  onChange={(e) => setEditingGoal(prev => prev ? ({ ...prev, title: e.target.value }) : null)}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Description</Label>
                                <Textarea
                                  value={editingGoal.description}
                                  onChange={(e) => setEditingGoal(prev => prev ? ({ ...prev, description: e.target.value }) : null)}
                                  rows={3}
                                />
                              </div>
                              <div className="space-y-2">
                                <Label>Status</Label>
                                <Select value={editingGoal.status} onValueChange={(value: Goal['status']) => setEditingGoal(prev => prev ? ({ ...prev, status: value }) : null)}>
                                  <SelectTrigger>
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="active">Active</SelectItem>
                                    <SelectItem value="completed">Completed</SelectItem>
                                    <SelectItem value="paused">Paused</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                              <div className="space-y-2">
                                <Label>Target Date</Label>
                                <Input
                                  type="date"
                                  value={editingGoal.targetDate}
                                  onChange={(e) => setEditingGoal(prev => prev ? ({ ...prev, targetDate: e.target.value }) : null)}
                                />
                              </div>
                              <div className="flex gap-2 justify-end pt-4">
                                <Button variant="outline" onClick={() => setEditingGoal(null)}>
                                  Cancel
                                </Button>
                                <Button onClick={handleUpdateGoal}>
                                  Update Goal
                                </Button>
                              </div>
                            </div>
                          )}
                        </DialogContent>
                      </Dialog>,
                      <Button 
                        key="delete"
                        variant="ghost" 
                        size="sm" 
                        className="h-6 w-6 p-0"
                        onClick={() => onGoalDelete(goal.id)}
                      >
                        <Trash2 className="w-3 h-3 text-destructive" />
                      </Button>
                    ]}
                  />
                </ExpandableRow>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}