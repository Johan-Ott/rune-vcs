import React, { useState } from 'react';
import { 
  BarChart3, 
  Plus, 
  Filter,
  ChevronRight,
  Edit3,
  Trash2,
  Check,
  X,
  MoreHorizontal
} from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { Card, CardContent, CardHeader } from './ui/card';
import { Separator } from './ui/separator';
import { Checkbox } from './ui/checkbox';
import { EditDeleteDropdown } from './CustomDropdown';
import { ExpandableIssue } from './ExpandableIssue';
import { InlineIssueCreator } from './InlineIssueCreator';
import { cn } from './ui/utils';
import { motion, AnimatePresence } from 'framer-motion';
import { ExpandableRow, ExpandableRowContent, useExpandableRows } from './ExpandableRow';
import { View, Issue, Goal, Release, Team } from '../App';

interface ViewsViewProps {
  views: View[];
  issues: Issue[];
  goals: Goal[];
  releases: Release[];
  teams: Team[];
  onViewCreate?: (view: View) => void;
  onViewUpdate?: (view: View) => void;
  onViewDelete?: (viewId: string) => void;
  onIssueCreate?: (issue: Issue) => void;
  onIssueUpdate?: (issue: Issue) => void;
  onIssueDelete?: (issueId: string) => void;
  onIssueStatusChange?: (issueId: string, status: Issue['status']) => void;
}

export function ViewsView({ 
  views, 
  issues, 
  goals,
  releases,
  teams,
  onViewCreate,
  onViewUpdate,
  onViewDelete,
  onIssueCreate,
  onIssueUpdate,
  onIssueDelete,
  onIssueStatusChange
}: ViewsViewProps) {
  const { isExpanded, toggleRow } = useExpandableRows();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingView, setEditingView] = useState<string | null>(null);
  const [newView, setNewView] = useState({
    name: '',
    description: '',
    filters: {
      status: [] as string[],
      priority: [] as string[],
      assignee: [] as string[],
      project: [] as string[]
    }
  });
  const [editingViewData, setEditingViewData] = useState<View | null>(null);

  const getFilteredIssues = (view: View) => {
    return issues.filter(issue => {
      if (view.filters.status && view.filters.status.length > 0 && !view.filters.status.includes(issue.status)) return false;
      if (view.filters.priority && view.filters.priority.length > 0 && !view.filters.priority.includes(issue.priority)) return false;
      if (view.filters.assignee && view.filters.assignee.length > 0 && (!issue.assignee || !view.filters.assignee.includes(issue.assignee.name))) return false;
      if (view.filters.project && view.filters.project.length > 0 && !view.filters.project.includes(issue.projectId)) return false;
      return true;
    });
  };

  const handleCreateIssue = (title: string) => {
    if (onIssueCreate) {
      const newIssue: Issue = {
        id: `RUN-${Math.floor(Math.random() * 10000)}`,
        title,
        status: 'todo',
        priority: 'medium',
        description: '',
        labels: [],
        projectId: 'Default Project',
        attachments: [],
        subIssues: [],
        activity: []
      };
      onIssueCreate(newIssue);
    }
  };

  const handleCreateView = () => {
    if (newView.name.trim() && onViewCreate) {
      const view: View = {
        id: newView.name.toLowerCase().replace(/\s+/g, '-'),
        name: newView.name,
        description: newView.description,
        filters: newView.filters,
        issueCount: getFilteredIssues({ ...newView, id: 'temp', issueCount: 0 }).length
      };
      onViewCreate(view);
      setNewView({
        name: '',
        description: '',
        filters: { status: [], priority: [], assignee: [], project: [] }
      });
      setShowCreateForm(false);
    }
  };

  const handleUpdateView = () => {
    if (editingViewData && onViewUpdate) {
      const updatedView = {
        ...editingViewData,
        issueCount: getFilteredIssues(editingViewData).length
      };
      onViewUpdate(updatedView);
      setEditingView(null);
      setEditingViewData(null);
    }
  };

  const handleViewExpand = (viewId: string) => {
    toggleRow(viewId);
    setEditingView(null);
    setEditingViewData(null);
  };

  const handleStartEdit = (view: View) => {
    setEditingView(view.id);
    setEditingViewData({ ...view });
  };

  const handleCancelEdit = () => {
    setEditingView(null);
    setEditingViewData(null);
  };

  const renderFilterSummary = (view: View) => {
    const filters = [];
    
    if (view.filters.status?.length) {
      filters.push(`Status: ${view.filters.status.join(', ')}`);
    }
    if (view.filters.priority?.length) {
      filters.push(`Priority: ${view.filters.priority.join(', ')}`);
    }
    if (view.filters.assignee?.length) {
      filters.push(`Assignee: ${view.filters.assignee.join(', ')}`);
    }
    if (view.filters.project?.length) {
      filters.push(`Project: ${view.filters.project.join(', ')}`);
    }
    
    return filters.join(' • ') || 'No filters';
  };

  const renderFilterOptions = (filterType: keyof View['filters'], options: string[], currentFilters: string[], onChange: (filters: string[]) => void) => {
    return (
      <div className="space-y-2">
        <Label className="text-sm">{filterType.charAt(0).toUpperCase() + filterType.slice(1)}</Label>
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {options.map((option) => (
            <div key={option} className="flex items-center space-x-2">
              <Checkbox
                id={`${filterType}-${option}`}
                checked={currentFilters.includes(option)}
                onCheckedChange={(checked) => {
                  if (checked) {
                    onChange([...currentFilters, option]);
                  } else {
                    onChange(currentFilters.filter(f => f !== option));
                  }
                }}
              />
              <label 
                htmlFor={`${filterType}-${option}`}
                className="text-sm capitalize cursor-pointer"
              >
                {option}
              </label>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Get unique values for filter options
  const statusOptions = ['todo', 'in-progress', 'done'];
  const priorityOptions = ['low', 'medium', 'high', 'urgent'];
  const assigneeOptions = Array.from(new Set(issues.filter(i => i.assignee).map(i => i.assignee!.name)));
  const projectOptions = Array.from(new Set(issues.map(i => i.projectId)));

  return (
    <div className="h-full flex flex-col">
      <div className="p-6 flex-1 overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-2">Views</h2>
          <p className="text-sm text-muted-foreground">
            Save custom filters to quickly access specific sets of issues
          </p>
        </div>

        <div className="bg-card rounded-lg border border-border/50 overflow-hidden">
          {/* Views List */}
          {views.map((view) => {
            const filteredIssues = getFilteredIssues(view);
            
            return (
              <ExpandableRow
                key={view.id}
                onExpandChange={() => handleViewExpand(view.id)}
                expandedContent={
                  <div className="space-y-4">
                        
                        {/* View Info Section */}
                        <div className="mb-6">
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium">View Settings</h4>
                            <div className="flex gap-2">
                              {editingView === view.id ? (
                                <>
                                  <Button size="sm" onClick={handleUpdateView}>
                                    <Check className="w-4 h-4 mr-1" />
                                    Save
                                  </Button>
                                  <Button size="sm" variant="outline" onClick={handleCancelEdit}>
                                    <X className="w-4 h-4 mr-1" />
                                    Cancel
                                  </Button>
                                </>
                              ) : (
                                <Button 
                                  size="sm" 
                                  variant="outline"
                                  onClick={() => handleStartEdit(view)}
                                >
                                  <Edit3 className="w-4 h-4 mr-1" />
                                  Edit
                                </Button>
                              )}
                            </div>
                          </div>
                          
                          {editingView === view.id && editingViewData ? (
                            <div className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                  <Label htmlFor="edit-name">View name</Label>
                                  <Input
                                    id="edit-name"
                                    value={editingViewData.name}
                                    onChange={(e) => setEditingViewData(prev => 
                                      prev ? { ...prev, name: e.target.value } : null
                                    )}
                                    className="mt-1"
                                  />
                                </div>
                                <div>
                                  <Label htmlFor="edit-description">Description</Label>
                                  <Input
                                    id="edit-description"
                                    value={editingViewData.description || ''}
                                    onChange={(e) => setEditingViewData(prev => 
                                      prev ? { ...prev, description: e.target.value } : null
                                    )}
                                    className="mt-1"
                                  />
                                </div>
                              </div>
                              
                              <div>
                                <h4 className="font-medium mb-3 flex items-center gap-2">
                                  <Filter className="w-4 h-4" />
                                  Filters
                                </h4>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                  {renderFilterOptions('status', statusOptions, editingViewData.filters.status || [], 
                                    (filters) => setEditingViewData(prev => prev ? 
                                      { ...prev, filters: { ...prev.filters, status: filters } } : null
                                    )
                                  )}
                                  {renderFilterOptions('priority', priorityOptions, editingViewData.filters.priority || [],
                                    (filters) => setEditingViewData(prev => prev ? 
                                      { ...prev, filters: { ...prev.filters, priority: filters } } : null
                                    )
                                  )}
                                  {renderFilterOptions('assignee', assigneeOptions, editingViewData.filters.assignee || [],
                                    (filters) => setEditingViewData(prev => prev ? 
                                      { ...prev, filters: { ...prev.filters, assignee: filters } } : null
                                    )
                                  )}
                                  {renderFilterOptions('project', projectOptions, editingViewData.filters.project || [],
                                    (filters) => setEditingViewData(prev => prev ? 
                                      { ...prev, filters: { ...prev.filters, project: filters } } : null
                                    )
                                  )}
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <div>
                                <div className="text-sm text-muted-foreground">Description</div>
                                <div className="text-sm">{view.description || 'No description provided'}</div>
                              </div>
                              <div>
                                <div className="text-sm text-muted-foreground">Active Filters</div>
                                <div className="text-sm">{renderFilterSummary(view)}</div>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* Issues Section */}
                        <div>
                          <div className="flex items-center justify-between mb-4">
                            <h4 className="font-medium">Matching Issues ({filteredIssues.length})</h4>
                            {filteredIssues.length > 10 && (
                              <span className="text-xs text-muted-foreground">
                                Scroll to see all issues
                              </span>
                            )}
                          </div>
                          
                          {filteredIssues.length === 0 ? (
                            <div className="text-center py-8">
                              <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-3">
                                <BarChart3 className="w-6 h-6 text-muted-foreground" />
                              </div>
                              <h3 className="font-medium mb-1">No matching issues</h3>
                              <p className="text-sm text-muted-foreground mb-6">
                                No issues match the current view filters.
                              </p>
                              <InlineIssueCreator
                                onCreateIssue={handleCreateIssue}
                                placeholder="Create your first issue for this view..."
                              />
                            </div>
                          ) : (
                            <div className="space-y-0 max-h-[600px] overflow-y-auto border border-border/50 rounded-lg bg-card scrollbar-thin scrollbar-thumb-muted-foreground/20 scrollbar-track-transparent">
                              {filteredIssues.map((issue) => (
                                <ExpandableIssue
                                  key={issue.id}
                                  issue={issue}
                                  goals={goals}
                                  releases={releases}
                                  teams={teams}
                                  onStatusChange={(newStatus) => onIssueStatusChange?.(issue.id, newStatus)}
                                  onIssueUpdate={onIssueUpdate}
                                  showProject={true}
                                  showTeam={true}
                                  showEstimation={true}
                                />
                              ))}
                              <div className="p-3 border-t border-border/50">
                                <InlineIssueCreator
                                  onCreateIssue={handleCreateIssue}
                                  placeholder="Create new issue..."
                                />
                              </div>
                            </div>
                          )}
                        </div>
                  </div>
                }
              >
                <ExpandableRowContent
                  avatar={
                    <div className="w-6 h-6 bg-muted rounded-lg flex items-center justify-center">
                      <BarChart3 className="w-4 h-4 text-muted-foreground" />
                    </div>
                  }
                  title={view.name}
                  badges={[
                    <Badge key="count" variant="secondary" className="text-xs h-4 px-2">
                      {filteredIssues.length}
                    </Badge>,
                    <span key="filters" className="text-xs text-muted-foreground px-2 truncate">
                      <Filter className="w-3 h-3 inline mr-1" />
                      {renderFilterSummary(view)}
                    </span>
                  ]}
                  actions={[
                    <EditDeleteDropdown
                      key="context-menu"
                      onEdit={() => handleStartEdit(view)}
                      onDelete={() => onViewDelete?.(view.id)}
                      itemName={view.name}
                    />
                  ]}
                />
              </ExpandableRow>
            );
          })}
        </div>

        {/* Create View Section */}
        <div className="bg-card rounded-lg border border-border/50 overflow-hidden mt-4">
          <ExpandableRow
            className="opacity-60 hover:opacity-100 transition-opacity"
            onExpandChange={() => setShowCreateForm(!showCreateForm)}
            expandedContent={
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="view-name">View name*</Label>
                    <Input
                      id="view-name"
                      placeholder="e.g. High Priority Issues, My Tasks"
                      value={newView.name}
                      onChange={(e) => setNewView(prev => ({ ...prev, name: e.target.value }))}
                      className="mt-1 h-8"
                    />
                  </div>
                  <div>
                    <Label htmlFor="view-description">Description</Label>
                    <Input
                      id="view-description"
                      placeholder="What does this view show?"
                      value={newView.description}
                      onChange={(e) => setNewView(prev => ({ ...prev, description: e.target.value }))}
                      className="mt-1 h-8"
                    />
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-3 flex items-center gap-2">
                    <Filter className="w-4 h-4" />
                    Filters
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {renderFilterOptions('status', statusOptions, newView.filters.status, 
                      (filters) => setNewView(prev => ({ ...prev, filters: { ...prev.filters, status: filters } }))
                    )}
                    {renderFilterOptions('priority', priorityOptions, newView.filters.priority,
                      (filters) => setNewView(prev => ({ ...prev, filters: { ...prev.filters, priority: filters } }))
                    )}
                    {renderFilterOptions('assignee', assigneeOptions, newView.filters.assignee,
                      (filters) => setNewView(prev => ({ ...prev, filters: { ...prev.filters, assignee: filters } }))
                    )}
                    {renderFilterOptions('project', projectOptions, newView.filters.project,
                      (filters) => setNewView(prev => ({ ...prev, filters: { ...prev.filters, project: filters } }))
                    )}
                  </div>
                </div>

                <div className="flex gap-2">
                  <Button 
                    onClick={handleCreateView} 
                    disabled={!newView.name.trim()}
                    size="sm"
                    className="h-7 px-3"
                  >
                    Create view
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="h-7 px-3"
                    onClick={() => {
                      setShowCreateForm(false);
                      setNewView({
                        name: '',
                        description: '',
                        filters: { status: [], priority: [], assignee: [], project: [] }
                      });
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
              title={<span className="text-muted-foreground">Create new view</span>}
              subtitle="Save a custom filter combination"
            />
          </ExpandableRow>
        </div>

        {/* Empty State */}
        {views.length === 0 && (
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="font-medium mb-2">No views yet</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Create your first view to save custom filter combinations
            </p>
          </div>
        )}
      </div>
    </div>
  );
}