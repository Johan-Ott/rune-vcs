import React, { useState } from 'react';
import { 
  X, 
  Circle, 
  Clock, 
  CheckCircle2, 
  User, 
  Tag, 
  Folder,
  ChevronDown,
  ChevronRight,
  MessageSquare,
  Calendar,
  AlertCircle,
  ArrowRight,
  Target,
  Package,
  Paperclip,
  Download,
  Trash2,
  Upload,
  CalendarDays,
  Users,
  Hash,
  XCircle,
  RotateCcw,
  Minus
} from 'lucide-react';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { Input } from './ui/input';
import { cn } from './ui/utils';
import { Issue, Goal, Release, Attachment } from '../App';
import { EstimationSelector } from './EstimationSelector';

interface IssueDetailProps {
  issue: Issue;
  goals: Goal[];
  releases: Release[];
  onClose: () => void;
  onStatusChange: (newStatus: Issue['status']) => void;
  onIssueUpdate: (updatedIssue: Issue) => void;
}

export function IssueDetail({ issue, goals, releases, onClose, onStatusChange, onIssueUpdate }: IssueDetailProps) {
  const [description, setDescription] = useState(issue.description);
  const [subIssuesExpanded, setSubIssuesExpanded] = useState(true);

  const getStatusIcon = (status: Issue['status']) => {
    switch (status) {
      case 'backlog':
        return <Minus className="w-4 h-4 text-muted-foreground" />;
      case 'todo':
        return <Circle className="w-4 h-4 text-muted-foreground" />;
      case 'in-progress':
        return <RotateCcw className="w-4 h-4 text-blue-500" />;
      case 'done':
        return <CheckCircle2 className="w-4 h-4 text-green-500" fill="currentColor" />;
      case 'cancelled':
        return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusLabel = (status: Issue['status']) => {
    switch (status) {
      case 'backlog':
        return 'Backlog';
      case 'todo':
        return 'Todo';
      case 'in-progress':
        return 'In Progress';
      case 'done':
        return 'Done';
      case 'cancelled':
        return 'Cancelled';
    }
  };

  const getPriorityLabel = (priority: Issue['priority']) => {
    switch (priority) {
      case 'urgent':
        return 'Urgent';
      case 'high':
        return 'High';
      case 'medium':
        return 'Medium';
      case 'low':
        return 'Low';
    }
  };

  const getPriorityIcon = (priority: Issue['priority']) => {
    switch (priority) {
      case 'urgent':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      case 'high':
        return <ArrowRight className="w-4 h-4 text-orange-500 rotate-45" />;
      case 'medium':
        return <ArrowRight className="w-4 h-4 text-yellow-500" />;
      case 'low':
        return <ArrowRight className="w-4 h-4 text-green-500 -rotate-45" />;
    }
  };

  return (
    <div className="h-full flex">
      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div className="flex items-center gap-3 min-w-0">
            {getStatusIcon(issue.status)}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground font-mono">
                  {issue.id}
                </span>
                <Badge variant="secondary" className="text-xs">
                  {issue.project}
                </Badge>
              </div>
              <h1 className="text-xl font-medium truncate">{issue.title}</h1>
            </div>
          </div>
          <Button variant="ghost" size="sm" onClick={onClose} className="shrink-0">
            <X className="w-4 h-4" />
          </Button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 space-y-6">
          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add a description..."
              className="min-h-32 resize-none border-0 bg-muted p-3 focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          {/* Sub-issues */}
          <div className="space-y-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSubIssuesExpanded(!subIssuesExpanded)}
              className="p-0 h-auto font-medium text-sm justify-start hover:bg-transparent"
            >
              {subIssuesExpanded ? (
                <ChevronDown className="w-4 h-4 mr-1" />
              ) : (
                <ChevronRight className="w-4 h-4 mr-1" />
              )}
              Sub-issues ({issue.subIssues.length})
            </Button>
            {subIssuesExpanded && issue.subIssues.length === 0 && (
              <p className="text-sm text-muted-foreground ml-5">No sub-issues</p>
            )}
          </div>

          <Separator />

          {/* Activity */}
          <div className="space-y-4">
            <h3 className="font-medium">Activity</h3>
            {issue.activity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity yet</p>
            ) : (
              <div className="space-y-3">
                {issue.activity.map((activity) => (
                  <div key={activity.id} className="flex gap-3">
                    <div className="w-6 h-6 bg-muted rounded-full flex items-center justify-center shrink-0">
                      <MessageSquare className="w-3 h-3 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">
                        <span className="font-medium">{activity.user}</span>{' '}
                        <span className="text-muted-foreground">{activity.content}</span>
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {activity.timestamp}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Properties sidebar */}
      <div className="w-80 border-l border-border bg-muted/20 p-6 space-y-6">
        <h3 className="font-medium">Properties</h3>

        {/* Status */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Circle className="w-4 h-4" />
            Status
          </label>
          <Select value={issue.status} onValueChange={onStatusChange}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="backlog">
                <div className="flex items-center gap-2">
                  <Minus className="w-4 h-4 text-muted-foreground" />
                  Backlog
                </div>
              </SelectItem>
              <SelectItem value="todo">
                <div className="flex items-center gap-2">
                  <Circle className="w-4 h-4 text-muted-foreground" />
                  Todo
                </div>
              </SelectItem>
              <SelectItem value="in-progress">
                <div className="flex items-center gap-2">
                  <RotateCcw className="w-4 h-4 text-blue-500" />
                  In Progress
                </div>
              </SelectItem>
              <SelectItem value="done">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  Done
                </div>
              </SelectItem>
              <SelectItem value="cancelled">
                <div className="flex items-center gap-2">
                  <XCircle className="w-4 h-4 text-red-500" />
                  Cancelled
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Priority */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            {getPriorityIcon(issue.priority)}
            Priority
          </label>
          <Select value={issue.priority} onValueChange={() => {}}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="urgent">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-500" />
                  Urgent
                </div>
              </SelectItem>
              <SelectItem value="high">
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-orange-500 rotate-45" />
                  High
                </div>
              </SelectItem>
              <SelectItem value="medium">
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-yellow-500" />
                  Medium
                </div>
              </SelectItem>
              <SelectItem value="low">
                <div className="flex items-center gap-2">
                  <ArrowRight className="w-4 h-4 text-green-500 -rotate-45" />
                  Low
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Assignee */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <User className="w-4 h-4" />
            Assignee
          </label>
          {issue.assignee ? (
            <div className="flex items-center gap-2 p-2 rounded-md border">
              <Avatar className="w-6 h-6">
                <AvatarImage src={issue.assignee.avatar} alt={issue.assignee.name} />
                <AvatarFallback className="text-xs">
                  {issue.assignee.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
              <span className="text-sm">{issue.assignee.name}</span>
            </div>
          ) : (
            <Button variant="outline" className="w-full justify-start text-muted-foreground">
              <User className="w-4 h-4 mr-2" />
              Unassigned
            </Button>
          )}
        </div>

        {/* Labels */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Tag className="w-4 h-4" />
            Labels
          </label>
          <div className="flex flex-wrap gap-1">
            {issue.labels.map((label) => (
              <Badge key={label} variant="secondary" className="text-xs">
                {label}
              </Badge>
            ))}
          </div>
        </div>

        {/* Project */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Folder className="w-4 h-4" />
            Project
          </label>
          <div className="p-2 rounded-md border">
            <span className="text-sm">{issue.project}</span>
          </div>
        </div>

        {/* Estimation */}
        <div className="space-y-2">
          <label className="text-sm font-medium flex items-center gap-2">
            <Hash className="w-4 h-4" />
            Estimation
          </label>
          <EstimationSelector
            value={issue.estimation}
            onChange={(value) => onIssueUpdate({ ...issue, estimation: value })}
          />
        </div>

        {/* Team */}
        {issue.team && (
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Users className="w-4 h-4" />
              Team
            </label>
            <div className="flex items-center gap-2 p-2 rounded-md border">
              {issue.team.avatar && (
                <Avatar className="w-6 h-6">
                  <AvatarImage src={issue.team.avatar} alt={issue.team.name} />
                  <AvatarFallback className="text-xs">
                    {issue.team.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              )}
              <span className="text-sm">{issue.team.name}</span>
            </div>
          </div>
        )}

        {/* Goal */}
        {issue.goalId && (
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Target className="w-4 h-4" />
              Goal
            </label>
            <div className="p-2 rounded-md border">
              <span className="text-sm">
                {goals.find(g => g.id === issue.goalId)?.title || 'Unknown Goal'}
              </span>
            </div>
          </div>
        )}

        {/* Release */}
        {issue.releaseId && (
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Package className="w-4 h-4" />
              Release
            </label>
            <div className="p-2 rounded-md border">
              <span className="text-sm">
                {releases.find(r => r.id === issue.releaseId)?.name || 'Unknown Release'}
              </span>
            </div>
          </div>
        )}

        {/* Deadline */}
        {issue.deadline && (
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <CalendarDays className="w-4 h-4" />
              Deadline
            </label>
            <div className="p-2 rounded-md border">
              <span className="text-sm">{issue.deadline}</span>
            </div>
          </div>
        )}

        {/* Due Date */}
        {issue.dueDate && (
          <div className="space-y-2">
            <label className="text-sm font-medium flex items-center gap-2">
              <Calendar className="w-4 h-4" />
              Due Date
            </label>
            <div className="p-2 rounded-md border">
              <span className="text-sm">{issue.dueDate}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}