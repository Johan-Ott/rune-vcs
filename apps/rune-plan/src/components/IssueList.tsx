import React from 'react';
import { Plus, Circle, ArrowRight, CheckCircle2, Clock, AlertCircle, CalendarDays, Users, XCircle, RotateCcw, Minus } from 'lucide-react';
import { Button } from './ui/button';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { cn } from './ui/utils';
import { Issue } from '../App';

interface IssueListProps {
  issues: Issue[];
  activeTab: string;
  selectedIssue: Issue | null;
  onIssueSelect: (issue: Issue) => void;
  onIssueStatusChange: (issueId: string, newStatus: Issue['status']) => void;
}

export function IssueList({ issues, activeTab, selectedIssue, onIssueSelect, onIssueStatusChange }: IssueListProps) {
  const filteredIssues = issues.filter(issue => {
    if (activeTab === 'active') return issue.status !== 'done';
    if (activeTab === 'backlog') return issue.status === 'todo';
    return true; // all
  });

  const groupedIssues = {
    backlog: filteredIssues.filter(issue => issue.status === 'backlog'),
    todo: filteredIssues.filter(issue => issue.status === 'todo'),
    'in-progress': filteredIssues.filter(issue => issue.status === 'in-progress'),
    done: filteredIssues.filter(issue => issue.status === 'done'),
    cancelled: filteredIssues.filter(issue => issue.status === 'cancelled'),
  };

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

  const getPriorityIcon = (priority: Issue['priority']) => {
    switch (priority) {
      case 'urgent':
        return <AlertCircle className="w-3 h-3 text-red-500" />;
      case 'high':
        return <ArrowRight className="w-3 h-3 text-orange-500 rotate-45" />;
      case 'medium':
        return <ArrowRight className="w-3 h-3 text-yellow-500" />;
      case 'low':
        return <ArrowRight className="w-3 h-3 text-green-500 -rotate-45" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  };

  const isOverdue = (deadline: string) => {
    return new Date(deadline) < new Date();
  };

  const handleDragStart = (e: React.DragEvent, issue: Issue) => {
    e.dataTransfer.setData('text/plain', issue.id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: Issue['status']) => {
    e.preventDefault();
    const issueId = e.dataTransfer.getData('text/plain');
    onIssueStatusChange(issueId, targetStatus);
  };

  if (filteredIssues.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">No active issues</h3>
          <p className="text-muted-foreground mb-6">
            All issues are complete. Create a new issue to get started.
          </p>
          <Button>
            <Plus className="w-4 h-4 mr-2" />
            New Issue
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6 space-y-8">
        {Object.entries(groupedIssues).map(([status, statusIssues]) => {
          if (statusIssues.length === 0) return null;
          
          return (
            <div
              key={status}
              className="space-y-2"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, status as Issue['status'])}
            >
              <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground mb-3">
                {getStatusIcon(status as Issue['status'])}
                <span>{getStatusLabel(status as Issue['status'])}</span>
                <Badge variant="secondary" className="h-5 px-2 text-xs">
                  {statusIssues.length}
                </Badge>
              </div>

              <div className="space-y-1">
                {statusIssues.map((issue) => (
                  <div
                    key={issue.id}
                    draggable
                    onDragStart={(e) => handleDragStart(e, issue)}
                    onClick={() => onIssueSelect(issue)}
                    className={cn(
                      "group flex items-center gap-3 p-3 rounded-lg border hover:bg-accent/50 cursor-pointer transition-colors",
                      selectedIssue?.id === issue.id && "bg-accent border-accent-foreground/20"
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {getStatusIcon(issue.status)}
                        <span className="text-sm font-medium text-muted-foreground font-mono">
                          {issue.id}
                        </span>
                        <span className="font-medium truncate">{issue.title}</span>
                        {getPriorityIcon(issue.priority)}
                      </div>
                      <div className="flex items-center gap-4 text-xs text-muted-foreground">
                        <span>{issue.project}</span>
                        
                        {issue.team && (
                          <div className="flex items-center gap-1">
                            <Users className="w-3 h-3" />
                            <span>{issue.team.name}</span>
                          </div>
                        )}
                        
                        {issue.estimation && (
                          <Badge variant="secondary" className="text-xs px-2 py-0">
                            {issue.estimation}pt
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-3 flex-shrink-0">
                      {issue.assignee && (
                        <Avatar className="w-6 h-6">
                          <AvatarImage src={issue.assignee.avatar} alt={issue.assignee.name} />
                          <AvatarFallback className="text-xs">
                            {issue.assignee.name.split(' ').map(n => n[0]).join('')}
                          </AvatarFallback>
                        </Avatar>
                      )}

                      {issue.deadline && (
                        <div className={cn(
                          "flex items-center gap-1 text-xs",
                          isOverdue(issue.deadline) ? 'text-red-500' : 'text-muted-foreground'
                        )}>
                          <CalendarDays className="w-3 h-3" />
                          {formatDate(issue.deadline)}
                        </div>
                      )}

                      {issue.dueDate && !issue.deadline && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="w-3 h-3" />
                          {formatDate(issue.dueDate)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}