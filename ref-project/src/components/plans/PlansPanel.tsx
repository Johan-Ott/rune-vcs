import React, { useState } from 'react';
import { 
  Plus, 
  Calendar, 
  User, 
  Flag,
  CheckCircle,
  Circle,
  Clock,
  MoreHorizontal,
  Edit,
  Trash2,
  Target,
  Check,
  X
} from 'lucide-react';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import { ScrollArea } from '../ui/scroll-area';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { Input } from '../ui/input';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Plan, Task } from '../../types/vcs';

interface PlansPanelProps {
  isDark: boolean;
  plans: Plan[];
  onCreatePlan: (plan: Omit<Plan, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onUpdatePlan: (id: string, updates: Partial<Plan>) => void;
  onDeletePlan: (id: string) => void;
  onToggleTask: (planId: string, taskId: string) => void;
}

export function PlansPanel({ 
  isDark, 
  plans, 
  onCreatePlan, 
  onUpdatePlan, 
  onDeletePlan,
  onToggleTask 
}: PlansPanelProps) {
  const [isCreateFormOpen, setIsCreateFormOpen] = useState(false);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [isTaskFormOpen, setIsTaskFormOpen] = useState(false);
  const [editingPlanForTask, setEditingPlanForTask] = useState<string | null>(null);
  
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    status: 'todo' as const,
    priority: 'medium' as const,
    assignee: '',
    dueDate: ''
  });
  const [newTask, setNewTask] = useState({ title: '', description: '' });
  const [newPlan, setNewPlan] = useState({
    title: '',
    description: '',
    status: 'todo' as const,
    priority: 'medium' as const,
    assignee: '',
    dueDate: '',
  });

  const handleCreatePlan = () => {
    if (!newPlan.title.trim()) return;

    onCreatePlan({
      title: newPlan.title.trim(),
      description: newPlan.description.trim(),
      status: newPlan.status,
      priority: newPlan.priority,
      assignee: newPlan.assignee.trim() || undefined,
      dueDate: newPlan.dueDate ? new Date(newPlan.dueDate) : undefined,
      tasks: []
    });

    // Reset form
    setNewPlan({
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      assignee: '',
      dueDate: '',
    });
    setIsCreateFormOpen(false);
  };

  const handleCreateTask = () => {
    if (!newTask.title.trim() || !editingPlanForTask) return;

    const plan = plans.find(p => p.id === editingPlanForTask);
    if (!plan) return;

    const task: Task = {
      id: Math.random().toString(36).substr(2, 9),
      title: newTask.title.trim(),
      description: newTask.description.trim() || undefined,
      completed: false,
      createdAt: new Date()
    };

    onUpdatePlan(editingPlanForTask, {
      tasks: [...plan.tasks, task]
    });

    // Reset form
    setNewTask({ title: '', description: '' });
    setIsTaskFormOpen(false);
    setEditingPlanForTask(null);
  };

  const handleStartEdit = (plan: Plan) => {
    setEditingPlanId(plan.id);
    setEditForm({
      title: plan.title,
      description: plan.description,
      status: plan.status,
      priority: plan.priority,
      assignee: plan.assignee || '',
      dueDate: plan.dueDate ? plan.dueDate.toISOString().split('T')[0] : ''
    });
  };

  const handleSaveEdit = () => {
    if (!editingPlanId || !editForm.title.trim()) return;

    onUpdatePlan(editingPlanId, {
      title: editForm.title.trim(),
      description: editForm.description.trim(),
      status: editForm.status,
      priority: editForm.priority,
      assignee: editForm.assignee.trim() || undefined,
      dueDate: editForm.dueDate ? new Date(editForm.dueDate) : undefined
    });

    setEditingPlanId(null);
    setEditForm({
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      assignee: '',
      dueDate: ''
    });
  };

  const handleCancelEdit = () => {
    setEditingPlanId(null);
    setEditForm({
      title: '',
      description: '',
      status: 'todo',
      priority: 'medium',
      assignee: '',
      dueDate: ''
    });
  };

  const getPriorityColor = (priority: Plan['priority']) => {
    switch (priority) {
      case 'high': return isDark ? 'text-red-400 border-red-500/30 bg-red-500/15 backdrop-blur-sm' : 'text-red-600 border-red-400/40 bg-red-100/70 backdrop-blur-sm';
      case 'medium': return isDark ? 'text-yellow-400 border-yellow-500/30 bg-yellow-500/15 backdrop-blur-sm' : 'text-yellow-600 border-yellow-400/40 bg-yellow-100/70 backdrop-blur-sm';
      case 'low': return isDark ? 'text-green-400 border-green-500/30 bg-green-500/15 backdrop-blur-sm' : 'text-green-600 border-green-400/40 bg-green-100/70 backdrop-blur-sm';
      default: return isDark ? 'text-gray-400 border-gray-500/30 bg-gray-500/15 backdrop-blur-sm' : 'text-gray-600 border-gray-400/40 bg-gray-100/70 backdrop-blur-sm';
    }
  };

  const getStatusColor = (status: Plan['status']) => {
    switch (status) {
      case 'done': return isDark ? 'text-green-400 border-green-500/30 bg-green-500/15 backdrop-blur-sm' : 'text-green-600 border-green-400/40 bg-green-100/70 backdrop-blur-sm';
      case 'in-progress': return isDark ? 'text-blue-400 border-blue-500/30 bg-blue-500/15 backdrop-blur-sm' : 'text-blue-600 border-blue-400/40 bg-blue-100/70 backdrop-blur-sm';
      case 'todo': return isDark ? 'text-gray-400 border-gray-500/30 bg-gray-500/15 backdrop-blur-sm' : 'text-gray-600 border-gray-400/40 bg-gray-100/70 backdrop-blur-sm';
      default: return isDark ? 'text-gray-400 border-gray-500/30 bg-gray-500/15 backdrop-blur-sm' : 'text-gray-600 border-gray-400/40 bg-gray-100/70 backdrop-blur-sm';
    }
  };

  const getCompletedTasksCount = (tasks: Task[]) => {
    return tasks.filter(task => task.completed).length;
  };

  return (
    <div className="flex-1 flex flex-col p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2>Project Plans</h2>
        <Button
          size="sm"
          className={`${isDark ? 'glass-panel-dark backdrop-blur-md hover:bg-white/15' : 'glass-panel-light backdrop-blur-md hover:bg-white/70'} border-white/20`}
          onClick={() => {
            setIsCreateFormOpen(!isCreateFormOpen);
            if (!isCreateFormOpen) {
              setNewPlan({
                title: '',
                description: '',
                status: 'todo',
                priority: 'medium',
                assignee: '',
                dueDate: '',
              });
            }
          }}
        >
          {isCreateFormOpen ? <X className="w-3 h-3 mr-1" /> : <Plus className="w-3 h-3 mr-1" />}
          {isCreateFormOpen ? 'Cancel' : 'New Plan'}
        </Button>
      </div>

      {/* Create Plan Form */}
      {isCreateFormOpen && (
        <div className={`${isDark ? 'glass-card aurora-glow' : 'glass-card-light'} p-4 mb-4 border-dashed backdrop-blur-xl`}>
          <div className="space-y-3">
            <div>
              <Label className="text-sm">Plan Title *</Label>
              <Input
                placeholder="Enter plan title..."
                value={newPlan.title}
                onChange={(e) => setNewPlan(prev => ({ ...prev, title: e.target.value }))}
                className="mt-1"
              />
            </div>

            <div>
              <Label className="text-sm">Description</Label>
              <Textarea
                placeholder="Plan description (optional)..."
                value={newPlan.description}
                onChange={(e) => setNewPlan(prev => ({ ...prev, description: e.target.value }))}
                className="mt-1 min-h-[60px]"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-sm">Priority</Label>
                <Select value={newPlan.priority} onValueChange={(value: any) => setNewPlan(prev => ({ ...prev, priority: value }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Low</SelectItem>
                    <SelectItem value="medium">Medium</SelectItem>
                    <SelectItem value="high">High</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-sm">Status</Label>
                <Select value={newPlan.status} onValueChange={(value: any) => setNewPlan(prev => ({ ...prev, status: value }))}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="todo">To Do</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="done">Done</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button 
                size="sm"
                onClick={handleCreatePlan} 
                disabled={!newPlan.title.trim()}
              >
                <Check className="w-3 h-3 mr-1" />
                Create Plan
              </Button>
              <Button 
                size="sm" 
                variant="ghost"
                onClick={() => {
                  setIsCreateFormOpen(false);
                  setNewPlan({
                    title: '',
                    description: '',
                    status: 'todo',
                    priority: 'medium',
                    assignee: '',
                    dueDate: '',
                  });
                }}
              >
                <X className="w-3 h-3 mr-1" />
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Plans List */}
      <div className="space-y-3">
        {plans.length === 0 ? (
          <div className={`${isDark ? 'glass-card' : 'glass-card-light'} p-8 text-center`}>
            <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
            <h3>No Plans Created</h3>
            <p className="text-sm text-muted-foreground mb-3">Create your first project plan to organize your work</p>
            <Button 
              size="sm" 
              onClick={() => setIsCreateFormOpen(true)}
            >
              <Plus className="w-3 h-3 mr-1" />
              Create Plan
            </Button>
          </div>
        ) : (
          plans.map((plan) => (
            <div key={plan.id} className={`${isDark ? 'glass-card' : 'glass-card-light'}`}>
              <div className="p-4">
                <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="mb-1">{plan.title}</h3>
                  {plan.description && (
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {plan.description}
                    </p>
                  )}
                  
                  {/* Metadata */}
                  <div className="flex flex-wrap items-center gap-2 mt-3">
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getStatusColor(plan.status)}`}
                    >
                      {plan.status === 'in-progress' ? 'In Progress' : plan.status.charAt(0).toUpperCase() + plan.status.slice(1)}
                    </Badge>
                    
                    <Badge 
                      variant="outline" 
                      className={`text-xs ${getPriorityColor(plan.priority)}`}
                    >
                      <Flag className="w-3 h-3 mr-1" />
                      {plan.priority.charAt(0).toUpperCase() + plan.priority.slice(1)}
                    </Badge>

                    {plan.assignee && (
                      <Badge variant="outline" className={`text-xs ${isDark ? 'bg-white/10 border-white/20 backdrop-blur-sm' : 'bg-white/50 border-black/20 backdrop-blur-sm'}`}>
                        <User className="w-3 h-3 mr-1" />
                        {plan.assignee}
                      </Badge>
                    )}

                    {plan.dueDate && (
                      <Badge variant="outline" className={`text-xs ${isDark ? 'bg-white/10 border-white/20 backdrop-blur-sm' : 'bg-white/50 border-black/20 backdrop-blur-sm'}`}>
                        <Calendar className="w-3 h-3 mr-1" />
                        {plan.dueDate.toLocaleDateString()}
                      </Badge>
                    )}
                  </div>

                  {/* Tasks */}
                  <div className="mt-4">
                    <div className="flex items-center justify-between text-sm text-muted-foreground mb-2">
                      <span>Tasks ({getCompletedTasksCount(plan.tasks)}/{plan.tasks.length})</span>
                    </div>
                    
                    {plan.tasks.length > 0 && (
                      <div className="space-y-1">
                        {plan.tasks.slice(0, 3).map((task) => (
                          <div key={task.id} className="flex items-center gap-2">
                            <Button
                              size="sm"
                              variant="ghost"
                              className="h-4 w-4 p-0 hover:bg-transparent"
                              onClick={() => onToggleTask(plan.id, task.id)}
                            >
                              {task.completed ? (
                                <CheckCircle className="w-3 h-3 text-green-400" />
                              ) : (
                                <Circle className="w-3 h-3 opacity-60 hover:opacity-100" />
                              )}
                            </Button>
                            <span className={`flex-1 text-sm truncate ${task.completed ? 'line-through text-muted-foreground' : ''}`}>
                              {task.title}
                            </span>
                          </div>
                        ))}
                        
                        {plan.tasks.length > 3 && (
                          <div className="text-xs text-muted-foreground pl-6">
                            +{plan.tasks.length - 3} more tasks
                          </div>
                        )}
                      </div>
                    )}

                    
                    {/* Add Task Link */}
                    {!isTaskFormOpen && (
                      <div className="pt-2 mt-2 border-t border-white/5">
                        <button
                          type="button"
                          className="w-full text-left text-sm text-muted-foreground hover:text-foreground transition-colors py-1 flex items-center gap-2 group"
                          onClick={() => {
                            setEditingPlanForTask(plan.id);
                            setIsTaskFormOpen(true);
                          }}
                        >
                          <Plus className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
                          <span className="group-hover:underline">
                            {plan.tasks.length === 0 ? 'Add first task' : 'Add task'}
                          </span>
                        </button>
                      </div>
                    )}
                  </div>
                </div>
                
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                      <MoreHorizontal className="w-3 h-3" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => handleStartEdit(plan)}>
                      <Edit className="w-3 h-3 mr-2" />
                      Edit Plan
                    </DropdownMenuItem>
                    <DropdownMenuItem 
                      onClick={() => onDeletePlan(plan.id)}
                      className="text-red-400 focus:text-red-400"
                    >
                      <Trash2 className="w-3 h-3 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                </div>
              </div>

              {/* Inline Edit Form */}
              {editingPlanId === plan.id && (
                <div className={`px-4 pb-4 border-t ${isDark ? 'border-white/10 bg-white/5' : 'border-black/10 bg-white/20'} backdrop-blur-sm`}>
                  <div className="space-y-3 mt-4">
                    <div>
                      <Label className="text-sm">Plan Title *</Label>
                      <Input
                        placeholder="Enter plan title..."
                        value={editForm.title}
                        onChange={(e) => setEditForm(prev => ({ ...prev, title: e.target.value }))}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label className="text-sm">Description</Label>
                      <Textarea
                        placeholder="Plan description (optional)..."
                        value={editForm.description}
                        onChange={(e) => setEditForm(prev => ({ ...prev, description: e.target.value }))}
                        className="mt-1 min-h-[60px]"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <Label className="text-sm">Priority</Label>
                        <Select value={editForm.priority} onValueChange={(value: any) => setEditForm(prev => ({ ...prev, priority: value }))}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="low">Low</SelectItem>
                            <SelectItem value="medium">Medium</SelectItem>
                            <SelectItem value="high">High</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div>
                        <Label className="text-sm">Status</Label>
                        <Select value={editForm.status} onValueChange={(value: any) => setEditForm(prev => ({ ...prev, status: value }))}>
                          <SelectTrigger className="mt-1">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="todo">To Do</SelectItem>
                            <SelectItem value="in-progress">In Progress</SelectItem>
                            <SelectItem value="done">Done</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm"
                        onClick={handleSaveEdit} 
                        disabled={!editForm.title.trim()}
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Save Changes
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={handleCancelEdit}
                      >
                        <X className="w-3 h-3 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}

              {/* Inline Task Form */}
              {isTaskFormOpen && editingPlanForTask === plan.id && (
                <div className={`px-4 pb-4 border-t ${isDark ? 'border-white/10 bg-white/5' : 'border-black/10 bg-white/20'} backdrop-blur-sm`}>
                  <div className="space-y-3 mt-4">
                    <div>
                      <Label className="text-sm">Task Title *</Label>
                      <Input
                        placeholder="Enter task title..."
                        value={newTask.title}
                        onChange={(e) => setNewTask(prev => ({ ...prev, title: e.target.value }))}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label className="text-sm">Description (Optional)</Label>
                      <Textarea
                        placeholder="Task description..."
                        value={newTask.description}
                        onChange={(e) => setNewTask(prev => ({ ...prev, description: e.target.value }))}
                        className="mt-1 min-h-[50px]"
                      />
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button 
                        size="sm"
                        onClick={handleCreateTask} 
                        disabled={!newTask.title.trim()}
                      >
                        <Check className="w-3 h-3 mr-1" />
                        Add Task
                      </Button>
                      <Button 
                        size="sm" 
                        variant="ghost"
                        onClick={() => {
                          setIsTaskFormOpen(false);
                          setEditingPlanForTask(null);
                          setNewTask({ title: '', description: '' });
                        }}
                      >
                        <X className="w-3 h-3 mr-1" />
                        Cancel
                      </Button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>

    </div>
  );
}