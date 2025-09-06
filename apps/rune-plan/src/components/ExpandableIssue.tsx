import React, { useState } from 'react';
import { 
  Circle, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  User,
  Tag,
  Folder,
  Calendar,
  CalendarDays,
  Users,
  Hash,
  Target,
  Package,
  Minus,
  XCircle,
  RotateCcw,
  MessageSquare,
  Plus,
  X,
  Upload,
  FileText,
  Image,
  Edit3
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Separator } from './ui/separator';
import { ExpandableRow, ExpandableRowContent } from './ExpandableRow';
import { EstimationSelector } from './EstimationSelector';
import { cn } from './ui/utils';
import { Issue, Goal, Release, Team, Project } from '../App';
import { Attachment } from '../types';
import { EditDeleteDropdown } from './CustomDropdown';

interface ExpandableIssueProps {
  issue: Issue;
  goals: Goal[];
  releases: Release[];
  teams: Team[];
  projects?: Project[];
  selected?: boolean;
  showProject?: boolean;
  showTeam?: boolean;
  showEstimation?: boolean;
  className?: string;
  onStatusChange?: (newStatus: Issue['status']) => void;
  onIssueUpdate?: (updatedIssue: Issue) => void;
  onIssueDelete?: (issueId: string) => void;
}

export function ExpandableIssue({ 
  issue, 
  goals,
  releases,
  teams,
  projects = [],
  selected = false,
  showProject = true,
  showTeam = false,
  showEstimation = false,
  className,
  onStatusChange,
  onIssueUpdate,
  onIssueDelete
}: ExpandableIssueProps) {
  // Safety check - ensure issue has required properties
  if (!issue || !issue.id) {
    return null;
  }

  // Ensure issue has required array properties
  const safeIssue = {
    ...issue,
    labels: issue.labels || [],
    attachments: issue.attachments || [],
    subIssues: issue.subIssues || [],
    activity: issue.activity || []
  };

  const [description, setDescription] = useState(safeIssue.description || '');
  const [newLabel, setNewLabel] = useState('');
  const [showLabelInput, setShowLabelInput] = useState(false);


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

  const getPriorityIcon = (priority: Issue['priority']) => {
    switch (priority) {
      case 'urgent':
        return <AlertCircle className="w-3 h-3 text-red-500" />;
      case 'critical':
        return <AlertCircle className="w-3 h-3 text-red-600" />;
      case 'high':
        return <ArrowRight className="w-3 h-3 text-orange-500 rotate-45" />;
      case 'medium':
        return <ArrowRight className="w-3 h-3 text-yellow-500" />;
      case 'low':
        return <ArrowRight className="w-3 h-3 text-green-500 -rotate-45" />;
      case 'lowest':
        return <ArrowRight className="w-3 h-3 text-gray-400 -rotate-90" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const getFibonacciDisplay = (estimation: number) => {
    return estimation.toString();
  };

  const handleStatusChange = (newStatus: Issue['status']) => {
    onStatusChange?.(newStatus);
  };

  const handleUpdateIssue = (updates: Partial<Issue>) => {
    onIssueUpdate?.({ ...safeIssue, ...updates });
  };

  const handleDescriptionSave = () => {
    handleUpdateIssue({ description });
  };

  const handleAddLabel = () => {
    if (newLabel.trim() && !safeIssue.labels.includes(newLabel.trim())) {
      handleUpdateIssue({ labels: [...safeIssue.labels, newLabel.trim()] });
      setNewLabel('');
      setShowLabelInput(false);
    }
  };

  const handleRemoveLabel = (labelToRemove: string) => {
    handleUpdateIssue({ labels: safeIssue.labels.filter(label => label !== labelToRemove) });
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      // Create a mock attachment for demo purposes
      const newAttachment: Attachment = {
        id: `att-${Date.now()}`,
        name: file.name,
        url: URL.createObjectURL(file),
        type: file.type.startsWith('image/') ? 'image' : 'file',
        size: file.size,
        uploadedBy: 'Current User',
        uploadedAt: 'just now'
      };
      handleUpdateIssue({ attachments: [...safeIssue.attachments, newAttachment] });
    }
  };

  const handleRemoveAttachment = (attachmentId: string) => {
    handleUpdateIssue({ 
      attachments: safeIssue.attachments.filter(att => att.id !== attachmentId) 
    });
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };



  // Row content that's always visible
  const rowContent = (
    <ExpandableRowContent
      avatar={getStatusIcon(safeIssue.status)}
      title={
        <div className="flex items-center gap-2 min-w-0">
          <span className="text-xs text-muted-foreground font-mono flex-shrink-0">
            {safeIssue.id}
          </span>
          <span className="text-sm truncate">{safeIssue.title}</span>
          {getPriorityIcon(safeIssue.priority)}
          
          {showProject && (
            <Badge variant="secondary" className="text-xs">
              {projects.find(p => p.id === safeIssue.projectId)?.name || 'Unknown Project'}
            </Badge>
          )}

          {showTeam && safeIssue.team && (
            <div className="flex items-center gap-1">
              {safeIssue.team.avatar && (
                <Avatar className="w-4 h-4">
                  <AvatarImage src={safeIssue.team.avatar} alt={safeIssue.team.name} />
                  <AvatarFallback className="text-xs">
                    {safeIssue.team.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
              )}
              <span className="text-xs text-muted-foreground">{safeIssue.team.name}</span>
            </div>
          )}

          {showEstimation && safeIssue.estimation && (
            <Badge variant="outline" className="text-xs">
              {getFibonacciDisplay(safeIssue.estimation)}
            </Badge>
          )}
        </div>
      }
      actions={[
        safeIssue.assignee && (
          <Avatar key="assignee" className="w-5 h-5">
            <AvatarImage src={safeIssue.assignee.avatar} alt={safeIssue.assignee.name} />
            <AvatarFallback className="text-xs">
              {safeIssue.assignee.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
        ),
        (safeIssue.dueDate || safeIssue.deadline) && (
          <span key="date" className="text-xs text-muted-foreground">
            {safeIssue.dueDate ? formatDate(safeIssue.dueDate) : safeIssue.deadline && formatDate(safeIssue.deadline)}
          </span>
        ),
        onIssueDelete && (
          <EditDeleteDropdown
            key="edit-delete"
            onEdit={() => {
              // For now, editing is handled by the expanded view
              console.log('Edit clicked for issue:', safeIssue.id);
            }}
            onDelete={() => onIssueDelete(safeIssue.id)}
            itemName={safeIssue.title}
          />
        )
      ].filter(Boolean)}
    />
  );

  // Expanded content with issue details
  const expandedContent = (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-6">
        {/* Left column - Main content */}
        <div className="col-span-2 space-y-4">
          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-medium">Description</label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              onBlur={handleDescriptionSave}
              placeholder="Add a description..."
              className="min-h-24 resize-none border-0 bg-background/50 p-3 focus-visible:ring-1 focus-visible:ring-ring"
            />
          </div>

          {/* Activity */}
          <div className="space-y-3">
            <h4 className="font-medium text-sm">Activity</h4>
            {safeIssue.activity.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity yet</p>
            ) : (
              <div className="space-y-2">
                {safeIssue.activity.slice(0, 3).map((activity) => (
                  <div key={activity.id} className="flex gap-2 text-sm">
                    <div className="w-5 h-5 bg-muted rounded-full flex items-center justify-center shrink-0 mt-0.5">
                      <MessageSquare className="w-2.5 h-2.5 text-muted-foreground" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p>
                        <span className="font-medium">{activity.user}</span>{' '}
                        <span className="text-muted-foreground">{activity.content}</span>
                      </p>
                      <p className="text-xs text-muted-foreground">{activity.timestamp}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right column - Properties */}
        <div className="space-y-4">
          <h4 className="font-medium text-sm">Properties</h4>
          
          {/* Status */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Circle className="w-3 h-3" />
              Status
            </label>
            <Select value={safeIssue.status} onValueChange={handleStatusChange}>
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="backlog">
                  <div className="flex items-center gap-2">
                    <Minus className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs">Backlog</span>
                  </div>
                </SelectItem>
                <SelectItem value="todo">
                  <div className="flex items-center gap-2">
                    <Circle className="w-3 h-3 text-muted-foreground" />
                    <span className="text-xs">Todo</span>
                  </div>
                </SelectItem>
                <SelectItem value="in-progress">
                  <div className="flex items-center gap-2">
                    <RotateCcw className="w-3 h-3 text-blue-500" />
                    <span className="text-xs">In Progress</span>
                  </div>
                </SelectItem>
                <SelectItem value="done">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-3 h-3 text-green-500" />
                    <span className="text-xs">Done</span>
                  </div>
                </SelectItem>
                <SelectItem value="cancelled">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-3 h-3 text-red-500" />
                    <span className="text-xs">Cancelled</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              {getPriorityIcon(safeIssue.priority)}
              Priority
            </label>
            <Select 
              value={safeIssue.priority} 
              onValueChange={(value) => handleUpdateIssue({ priority: value as Issue['priority'] })}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="urgent">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="w-3 h-3 text-red-500" />
                    <span className="text-xs">Urgent</span>
                  </div>
                </SelectItem>
                <SelectItem value="high">
                  <div className="flex items-center gap-2">
                    <ArrowRight className="w-3 h-3 text-orange-500 rotate-45" />
                    <span className="text-xs">High</span>
                  </div>
                </SelectItem>
                <SelectItem value="medium">
                  <div className="flex items-center gap-2">
                    <ArrowRight className="w-3 h-3 text-yellow-500" />
                    <span className="text-xs">Medium</span>
                  </div>
                </SelectItem>
                <SelectItem value="low">
                  <div className="flex items-center gap-2">
                    <ArrowRight className="w-3 h-3 text-green-500 -rotate-45" />
                    <span className="text-xs">Low</span>
                  </div>
                </SelectItem>
                <SelectItem value="lowest">
                  <div className="flex items-center gap-2">
                    <ArrowRight className="w-3 h-3 text-gray-400 -rotate-90" />
                    <span className="text-xs">Lowest</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Assignee */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <User className="w-3 h-3" />
              Assignee
            </label>
            {safeIssue.assignee ? (
              <div className="flex items-center gap-2 p-1.5 rounded border bg-background/50">
                <Avatar className="w-5 h-5">
                  <AvatarImage src={safeIssue.assignee.avatar} alt={safeIssue.assignee.name} />
                  <AvatarFallback className="text-xs">
                    {safeIssue.assignee.name.charAt(0)}
                  </AvatarFallback>
                </Avatar>
                <span className="text-xs">{safeIssue.assignee.name}</span>
              </div>
            ) : (
              <div className="p-1.5 rounded border bg-background/50 text-xs text-muted-foreground">
                Unassigned
              </div>
            )}
          </div>

          {/* Labels */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Tag className="w-3 h-3" />
              Labels
            </label>
            <div className="space-y-2">
              {issue?.labels?.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {safeIssue.labels.map((label) => (
                    <Badge key={label} variant="secondary" className="text-xs px-1.5 py-0.5 h-auto group">
                      {label}
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto w-auto p-0 ml-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveLabel(label)}
                      >
                        <X className="w-2 h-2" />
                      </Button>
                    </Badge>
                  ))}
                </div>
              )}
              {showLabelInput ? (
                <div className="flex gap-1">
                  <Input
                    value={newLabel}
                    onChange={(e) => setNewLabel(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        handleAddLabel();
                      } else if (e.key === 'Escape') {
                        setNewLabel('');
                        setShowLabelInput(false);
                      }
                    }}
                    placeholder="Label name"
                    className="h-6 text-xs"
                    autoFocus
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={handleAddLabel}
                  >
                    <Plus className="w-3 h-3" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0"
                    onClick={() => {
                      setNewLabel('');
                      setShowLabelInput(false);
                    }}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ) : (
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-auto px-1 text-xs text-muted-foreground"
                  onClick={() => setShowLabelInput(true)}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add label
                </Button>
              )}
            </div>
          </div>

          {/* Estimation */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Hash className="w-3 h-3" />
              Estimation
            </label>
            <EstimationSelector
              value={safeIssue.estimation || undefined}
              onChange={(value) => handleUpdateIssue({ estimation: value || undefined })}
              size="sm"
            />
          </div>

          {/* Team */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Users className="w-3 h-3" />
              Team
            </label>
            <Select 
              value={safeIssue.team?.id || 'none'} 
              onValueChange={(value) => {
                if (value === 'none') {
                  handleUpdateIssue({ team: undefined });
                } else {
                  const selectedTeam = teams.find(t => t.id === value);
                  handleUpdateIssue({ team: selectedTeam });
                }
              }}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Select team..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <span className="text-xs text-muted-foreground">No team</span>
                </SelectItem>
                {teams.map((team) => (
                  <SelectItem key={team.id} value={team.id}>
                    <div className="flex items-center gap-2">
                      {team.avatar && (
                        <Avatar className="w-4 h-4">
                          <AvatarImage src={team.avatar} alt={team.name} />
                          <AvatarFallback className="text-xs">
                            {team.name.charAt(0)}
                          </AvatarFallback>
                        </Avatar>
                      )}
                      <span className="text-xs">{team.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Goal */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Target className="w-3 h-3" />
              Goal
            </label>
            <Select 
              value={safeIssue.goalId || 'none'} 
              onValueChange={(value) => handleUpdateIssue({ goalId: value === 'none' ? undefined : value })}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Select goal..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <span className="text-xs text-muted-foreground">No goal</span>
                </SelectItem>
                {goals.map((goal) => (
                  <SelectItem key={goal.id} value={goal.id}>
                    <span className="text-xs">{goal.title}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Release */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Package className="w-3 h-3" />
              Release
            </label>
            <Select 
              value={safeIssue.releaseId || 'none'} 
              onValueChange={(value) => handleUpdateIssue({ releaseId: value === 'none' ? undefined : value })}
            >
              <SelectTrigger className="h-8 text-xs">
                <SelectValue placeholder="Select release..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">
                  <span className="text-xs text-muted-foreground">No release</span>
                </SelectItem>
                {releases.map((release) => (
                  <SelectItem key={release.id} value={release.id}>
                    <span className="text-xs">{release.name}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Deadline */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <CalendarDays className="w-3 h-3" />
              Deadline
            </label>
            <Input
              type="date"
              value={safeIssue.deadline || ''}
              onChange={(e) => handleUpdateIssue({ deadline: e.target.value || undefined })}
              className="h-8 text-xs"
            />
          </div>

          {/* Attachments */}
          <div className="space-y-1">
            <label className="text-xs font-medium text-muted-foreground flex items-center gap-1">
              <Upload className="w-3 h-3" />
              Attachments
            </label>
            <div className="space-y-2">
              {safeIssue.attachments.length > 0 && (
                <div className="space-y-1">
                  {safeIssue.attachments.map((attachment) => (
                    <div key={attachment.id} className="flex items-center gap-2 p-1.5 rounded border bg-background/50 group">
                      {attachment.type === 'image' ? (
                        <Image className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                      ) : (
                        <FileText className="w-3 h-3 text-muted-foreground flex-shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-xs truncate">{attachment.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {formatFileSize(attachment.size)} • {attachment.uploadedAt}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-auto w-auto p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleRemoveAttachment(attachment.id)}
                      >
                        <X className="w-3 h-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
              <div>
                <Input
                  type="file"
                  onChange={handleFileUpload}
                  className="hidden"
                  id={`file-upload-${safeIssue.id}`}
                />
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-6 w-auto px-1 text-xs text-muted-foreground"
                  onClick={() => document.getElementById(`file-upload-${safeIssue.id}`)?.click()}
                >
                  <Plus className="w-3 h-3 mr-1" />
                  Add attachment
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <ExpandableRow
      className={cn(selected && "bg-muted", className)}
      expandedContent={expandedContent}
    >
      {rowContent}
    </ExpandableRow>
  );
}