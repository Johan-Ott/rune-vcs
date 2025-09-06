import React, { useState } from 'react';
import { X, Filter } from 'lucide-react';
import { Button } from './ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Checkbox } from './ui/checkbox';
import { Label } from './ui/label';
import { Separator } from './ui/separator';
import { Badge } from './ui/badge';
import { FilterState, Issue, Project } from '../App';

interface FilterModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  issues: Issue[];
  projects: Project[];
}

export function FilterModal({ open, onOpenChange, filters, onFiltersChange, issues, projects }: FilterModalProps) {
  const [localFilters, setLocalFilters] = useState<FilterState>(filters);

  const uniqueStatuses = Array.from(new Set(issues.map(issue => issue.status)));
  const uniquePriorities = Array.from(new Set(issues.map(issue => issue.priority)));
  const uniqueAssignees = Array.from(new Set(issues.map(issue => issue.assignee?.name).filter(Boolean))) as string[];
  const uniqueProjectIds = Array.from(new Set(issues.map(issue => issue.projectId)));
  const uniqueProjects = uniqueProjectIds.map(projectId => {
    const project = projects.find(p => p.id === projectId);
    return project ? project.name : 'Unknown Project';
  });

  const handleFilterChange = (category: keyof FilterState, value: string, checked: boolean) => {
    setLocalFilters(prev => ({
      ...prev,
      [category]: checked 
        ? [...prev[category], value]
        : prev[category].filter(item => item !== value)
    }));
  };

  const handleApply = () => {
    onFiltersChange(localFilters);
    onOpenChange(false);
  };

  const handleClear = () => {
    const clearedFilters = {
      status: [],
      priority: [],
      assignee: [],
      project: []
    };
    setLocalFilters(clearedFilters);
    onFiltersChange(clearedFilters);
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'todo': return 'Todo';
      case 'in-progress': return 'In Progress';
      case 'done': return 'Done';
      default: return status;
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'low': return 'Low';
      case 'medium': return 'Medium';
      case 'high': return 'High';
      case 'urgent': return 'Urgent';
      default: return priority;
    }
  };

  const totalActiveFilters = localFilters.status.length + 
                            localFilters.priority.length + 
                            localFilters.assignee.length + 
                            localFilters.project.length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filter Issues
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Status Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Status</Label>
            <div className="grid grid-cols-3 gap-2">
              {uniqueStatuses.map(status => (
                <div key={status} className="flex items-center space-x-2">
                  <Checkbox
                    id={`status-${status}`}
                    checked={localFilters.status.includes(status)}
                    onCheckedChange={(checked) => 
                      handleFilterChange('status', status, checked as boolean)
                    }
                  />
                  <Label 
                    htmlFor={`status-${status}`} 
                    className="text-sm cursor-pointer"
                  >
                    {getStatusLabel(status)}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Priority Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Priority</Label>
            <div className="grid grid-cols-4 gap-2">
              {uniquePriorities.map(priority => (
                <div key={priority} className="flex items-center space-x-2">
                  <Checkbox
                    id={`priority-${priority}`}
                    checked={localFilters.priority.includes(priority)}
                    onCheckedChange={(checked) => 
                      handleFilterChange('priority', priority, checked as boolean)
                    }
                  />
                  <Label 
                    htmlFor={`priority-${priority}`} 
                    className="text-sm cursor-pointer"
                  >
                    {getPriorityLabel(priority)}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Assignee Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Assignee</Label>
            <div className="grid grid-cols-2 gap-2">
              {uniqueAssignees.map(assignee => (
                <div key={assignee} className="flex items-center space-x-2">
                  <Checkbox
                    id={`assignee-${assignee}`}
                    checked={localFilters.assignee.includes(assignee)}
                    onCheckedChange={(checked) => 
                      handleFilterChange('assignee', assignee, checked as boolean)
                    }
                  />
                  <Label 
                    htmlFor={`assignee-${assignee}`} 
                    className="text-sm cursor-pointer"
                  >
                    {assignee}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Project Filter */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Project</Label>
            <div className="grid grid-cols-2 gap-2">
              {uniqueProjects.map(project => (
                <div key={project} className="flex items-center space-x-2">
                  <Checkbox
                    id={`project-${project}`}
                    checked={localFilters.project.includes(project)}
                    onCheckedChange={(checked) => 
                      handleFilterChange('project', project, checked as boolean)
                    }
                  />
                  <Label 
                    htmlFor={`project-${project}`} 
                    className="text-sm cursor-pointer"
                  >
                    {project}
                  </Label>
                </div>
              ))}
            </div>
          </div>

          {/* Active Filters Summary */}
          {totalActiveFilters > 0 && (
            <div className="p-3 bg-muted rounded-md">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Active Filters</span>
                <Badge variant="secondary">{totalActiveFilters}</Badge>
              </div>
              <div className="flex flex-wrap gap-1">
                {localFilters.status.map(status => (
                  <Badge key={status} variant="outline" className="text-xs">
                    Status: {getStatusLabel(status)}
                  </Badge>
                ))}
                {localFilters.priority.map(priority => (
                  <Badge key={priority} variant="outline" className="text-xs">
                    Priority: {getPriorityLabel(priority)}
                  </Badge>
                ))}
                {localFilters.assignee.map(assignee => (
                  <Badge key={assignee} variant="outline" className="text-xs">
                    Assignee: {assignee}
                  </Badge>
                ))}
                {localFilters.project.map(project => (
                  <Badge key={project} variant="outline" className="text-xs">
                    Project: {project}
                  </Badge>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-between pt-4 border-t">
          <Button variant="outline" onClick={handleClear}>
            Clear All
          </Button>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleApply}>
              Apply Filters
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}