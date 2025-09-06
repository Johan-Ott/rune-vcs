import React, { useState } from 'react';
import { Calendar, Package, Filter, MoreHorizontal, Target, CheckCircle2, Clock, Plus } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { InlineIssue } from './InlineIssue';
import { InlineIssueCreator } from './InlineIssueCreator';
import { InlineReleaseCreator } from './InlineReleaseCreator';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from './ui/dialog';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { cn } from './ui/utils';
import { ExpandableRow, ExpandableRowContent, useExpandableRows } from './ExpandableRow';
import { Release, Issue } from '../App';

interface ReleasesViewProps {
  releases: Release[];
  issues: Issue[];
  selectedIssue: Issue | null;
  onIssueSelect: (issue: Issue) => void;
  onReleaseCreate: (release: Release) => void;
  onReleaseUpdate: (release: Release) => void;
  onReleaseDelete: (releaseId: string) => void;
  onIssueCreate?: (issue: Issue) => void;
}

export function ReleasesView({
  releases,
  issues,
  selectedIssue,
  onIssueSelect,
  onReleaseCreate,
  onReleaseUpdate,
  onReleaseDelete,
  onIssueCreate,
}: ReleasesViewProps) {
  const { isExpanded, toggleRow } = useExpandableRows();
  const [editingRelease, setEditingRelease] = useState<Release | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [newRelease, setNewRelease] = useState({
    name: '',
    description: '',
    version: '',
    status: 'planned' as Release['status'],
    targetDate: '',
  });

  const getStatusIcon = (status: Release['status']) => {
    switch (status) {
      case 'planned':
        return <Clock className="w-4 h-4" />;
      case 'in-progress':
        return <Target className="w-4 h-4" />;
      case 'released':
        return <CheckCircle2 className="w-4 h-4" />;
      case 'cancelled':
        return <div className="w-4 h-4 rounded-full bg-red-500" />;
      default:
        return <Clock className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: Release['status']) => {
    switch (status) {
      case 'planned':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'released':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'cancelled':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-200';
    }
  };

  const filteredReleases = releases.filter(release =>
    release.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    release.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    release.version.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateRelease = (releaseData: Omit<Release, 'id' | 'issuesCount' | 'completedIssuesCount'>) => {
    const release: Release = {
      id: `release-${Date.now()}`,
      ...releaseData,
      issuesCount: 0,
      completedIssuesCount: 0,
    };
    onReleaseCreate(release);
  };

  const handleEditRelease = (release: Release) => {
    setEditingRelease(release);
    setNewRelease({
      name: release.name,
      description: release.description,
      version: release.version,
      status: release.status,
      targetDate: release.targetDate || '',
    });
  };

  const handleUpdateRelease = () => {
    if (editingRelease) {
      onReleaseUpdate({
        ...editingRelease,
        ...newRelease,
      });
      setEditingRelease(null);
      setNewRelease({
        name: '',
        description: '',
        version: '',
        status: 'planned',
        targetDate: '',
      });
    }
  };

  const getReleaseIssues = (releaseId: string) => {
    return issues.filter(issue => issue.releaseId === releaseId);
  };

  const handleCreateIssue = (title: string, releaseId: string) => {
    if (onIssueCreate) {
      const newIssue: Issue = {
        id: `RUN-${Math.floor(Math.random() * 10000)}`,
        title,
        status: 'todo',
        priority: 'medium',
        description: '',
        labels: [],
        project: 'Default Project',
        releaseId: releaseId,
        attachments: [],
        subIssues: [],
        activity: []
      };
      onIssueCreate(newIssue);
    }
  };

  const toggleReleaseExpand = (releaseId: string) => {
    toggleRow(releaseId);
  };

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h1 className="text-xl font-semibold">Releases</h1>
          <p className="text-sm text-muted-foreground">
            Manage product releases and track progress
          </p>
        </div>
      </div>

      <div className="p-4 border-b border-border">
        <div className="flex items-center gap-3">
          <div className="relative flex-1">
            <Input
              placeholder="Search releases..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filter
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto">
        <div className="p-4">
          <div className="bg-card rounded-lg border border-border/50 overflow-hidden">
            {filteredReleases.map((release) => {
              const releaseIssues = getReleaseIssues(release.id);
              const completedIssues = releaseIssues.filter(issue => issue.status === 'done');
              const progress = releaseIssues.length > 0 ? (completedIssues.length / releaseIssues.length) * 100 : 0;

              return (
                <ExpandableRow
                  key={release.id}
                  onExpandChange={() => toggleReleaseExpand(release.id)}
                  expandedContent={
                    <div className="space-y-4">
                      {releaseIssues.length === 0 ? (
                        <div className="text-center py-6">
                          <div className="w-8 h-8 bg-muted rounded-lg flex items-center justify-center mx-auto mb-2">
                            <Package className="w-4 h-4 text-muted-foreground" />
                          </div>
                          <p className="text-sm text-muted-foreground mb-4">
                            No issues in this release yet.
                          </p>
                          <InlineIssueCreator
                            onCreateIssue={(title) => handleCreateIssue(title, release.id)}
                            placeholder="Create first issue for this release..."
                          />
                        </div>
                      ) : (
                        <div className="space-y-2">
                          <div className="flex items-center justify-between mb-3">
                            <h4 className="text-sm font-medium">Issues ({releaseIssues.length})</h4>
                          </div>
                          <div className="space-y-1">
                            {releaseIssues.map((issue) => (
                              <InlineIssue
                                key={issue.id}
                                issue={issue}
                                selected={false}
                                onClick={() => {}}
                                showProject={false}
                                showTeam={true}
                                showEstimation={true}
                              />
                            ))}
                            <InlineIssueCreator
                              onCreateIssue={(title) => handleCreateIssue(title, release.id)}
                              placeholder="Add another issue..."
                              className="mt-2"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  }
                >
                  <ExpandableRowContent
                    avatar={getStatusIcon(release.status)}
                    title={release.name}
                    badges={[
                      <Badge
                        key="status"
                        variant="secondary"
                        className={cn("text-xs h-4 px-2", getStatusColor(release.status))}
                      >
                        {release.status.replace('-', ' ')}
                      </Badge>,
                      <Badge key="version" variant="outline" className="text-xs h-4 px-2">
                        v{release.version}
                      </Badge>,
                      <span key="details" className="text-xs text-muted-foreground px-2">
                        {releaseIssues.length} issues • {Math.round(progress)}%
                        {release.targetDate && ` • ${new Date(release.targetDate).toLocaleDateString()}`}
                      </span>
                    ]}
                    actions={[
                      <DropdownMenu key="actions">
                        <DropdownMenuTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            className="h-6 w-6 p-0"
                            onClick={handleDropdownClick}
                          >
                            <MoreHorizontal className="w-3 h-3" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleEditRelease(release)}>
                            Edit Release
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => onReleaseDelete(release.id)}
                            className="text-destructive"
                          >
                            Delete Release
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    ]}
                  />
                </ExpandableRow>
              );
            })}
            
            {/* Inline Release Creator */}
            <ExpandableRow
              className="opacity-60 hover:opacity-100 transition-opacity"
              expandedContent={
                <InlineReleaseCreator
                  onCreateRelease={handleCreateRelease}
                  placeholder="Create new release..."
                />
              }
            >
              <ExpandableRowContent
                avatar={
                  <div className="w-6 h-6 rounded bg-primary/10 flex items-center justify-center">
                    <Plus className="w-3 h-3 text-primary" />
                  </div>
                }
                title={<span className="text-muted-foreground">Create new release</span>}
                subtitle="Plan and track a new release"
              />
            </ExpandableRow>
          </div>

          {/* Empty State */}
          {filteredReleases.length === 0 && (
            <div className="text-center py-12">
              <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
                <Package className="w-8 h-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium mb-2">No releases yet</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Create your first release to start planning and tracking progress
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Edit Release Dialog */}
      <Dialog open={editingRelease !== null} onOpenChange={(open) => !open && setEditingRelease(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Release</DialogTitle>
            <DialogDescription>
              Update release information and settings.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="edit-release-name">Name</Label>
              <Input
                id="edit-release-name"
                value={newRelease.name}
                onChange={(e) => setNewRelease(prev => ({ ...prev, name: e.target.value }))}
                placeholder="e.g., Summer Release"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-release-version">Version</Label>
              <Input
                id="edit-release-version"
                value={newRelease.version}
                onChange={(e) => setNewRelease(prev => ({ ...prev, version: e.target.value }))}
                placeholder="e.g., 2.1.0"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-release-status">Status</Label>
              <Select
                value={newRelease.status}
                onValueChange={(value: Release['status']) => 
                  setNewRelease(prev => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="planned">Planned</SelectItem>
                  <SelectItem value="in-progress">In Progress</SelectItem>
                  <SelectItem value="released">Released</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-release-target-date">Target Date</Label>
              <Input
                id="edit-release-target-date"
                type="date"
                value={newRelease.targetDate}
                onChange={(e) => setNewRelease(prev => ({ ...prev, targetDate: e.target.value }))}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="edit-release-description">Description</Label>
              <Textarea
                id="edit-release-description"
                value={newRelease.description}
                onChange={(e) => setNewRelease(prev => ({ ...prev, description: e.target.value }))}
                placeholder="What's new in this release?"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingRelease(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdateRelease}>Update Release</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}