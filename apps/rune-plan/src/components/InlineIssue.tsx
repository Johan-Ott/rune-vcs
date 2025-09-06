import React from 'react';
import { 
  Circle, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight 
} from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import { Badge } from './ui/badge';
import { cn } from './ui/utils';
import { Issue } from '../App';

interface InlineIssueProps {
  issue: Issue;
  selected?: boolean;
  onClick?: () => void;
  draggable?: boolean;
  onDragStart?: (e: React.DragEvent) => void;
  showProject?: boolean;
  showTeam?: boolean;
  showEstimation?: boolean;
  className?: string;
}

export function InlineIssue({ 
  issue, 
  selected = false,
  onClick,
  draggable = false,
  onDragStart,
  showProject = true,
  showTeam = false,
  showEstimation = false,
  className 
}: InlineIssueProps) {
  const getStatusIcon = (status: Issue['status']) => {
    switch (status) {
      case 'todo':
        return <Circle className="w-4 h-4 text-muted-foreground" />;
      case 'in-progress':
        return <Clock className="w-4 h-4 text-blue-500" />;
      case 'done':
        return <CheckCircle2 className="w-4 h-4 text-green-500" fill="currentColor" />;
      case 'backlog':
        return <Circle className="w-4 h-4 text-muted-foreground" />;
      case 'cancelled':
        return <Circle className="w-4 h-4 text-red-500" />;
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

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onClick?.();
  };

  return (
    <div
      draggable={draggable}
      onDragStart={onDragStart}
      onClick={handleClick}
      className={cn(
        "group flex items-center gap-3 p-3 rounded-md hover:bg-muted/50 cursor-pointer transition-colors",
        selected && "bg-muted",
        className
      )}
    >
      <div className="flex items-center gap-2 flex-1 min-w-0">
        {getStatusIcon(issue.status)}
        <span className="text-xs text-muted-foreground font-mono flex-shrink-0">
          {issue.id}
        </span>
        <span className="text-sm truncate">{issue.title}</span>
        {getPriorityIcon(issue.priority)}
        
        {showProject && (
          <Badge variant="secondary" className="text-xs">
            {issue.project}
          </Badge>
        )}

        {showTeam && issue.team && (
          <div className="flex items-center gap-1">
            {issue.team.avatar && (
              <Avatar className="w-4 h-4">
                <AvatarImage src={issue.team.avatar} alt={issue.team.name} />
                <AvatarFallback className="text-xs">
                  {issue.team.name.charAt(0)}
                </AvatarFallback>
              </Avatar>
            )}
            <span className="text-xs text-muted-foreground">{issue.team.name}</span>
          </div>
        )}

        {showEstimation && issue.estimation && (
          <Badge variant="outline" className="text-xs">
            {getFibonacciDisplay(issue.estimation)}
          </Badge>
        )}
      </div>

      <div className="flex items-center gap-2">
        {issue.assignee && (
          <Avatar className="w-5 h-5">
            <AvatarImage src={issue.assignee.avatar} alt={issue.assignee.name} />
            <AvatarFallback className="text-xs">
              {issue.assignee.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
        )}
        {issue.dueDate && (
          <span className="text-xs text-muted-foreground">
            {formatDate(issue.dueDate)}
          </span>
        )}
        {issue.deadline && !issue.dueDate && (
          <span className="text-xs text-muted-foreground">
            {formatDate(issue.deadline)}
          </span>
        )}
      </div>
    </div>
  );
}