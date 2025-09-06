import React, { useState } from 'react';
import { ExpandableIssue } from './ExpandableIssue';
import { InlineIssueCreator } from './InlineIssueCreator';
import { Issue, Goal, Release, Team, Project } from '../App';

interface IssuesViewSimpleProps {
  issues: Issue[];
  goals: Goal[];
  releases: Release[];
  teams: Team[];
  projects: Project[];
  selectedProject?: Project | null;
  onIssueCreate?: (issue: Issue) => void;
  onIssueUpdate?: (issue: Issue) => void;
  onIssueDelete?: (issueId: string) => void;
  onIssueStatusChange?: (issueId: string, status: Issue['status']) => void;
  onProjectCreate?: (project: any) => void;
}

export function IssuesViewSimple({ 
  issues, 
  goals,
  releases,
  teams,
  projects,
  selectedProject,
  onIssueCreate,
  onIssueUpdate,
  onIssueDelete,
  onIssueStatusChange,
  onProjectCreate
}: IssuesViewSimpleProps) {
  const [groupBy, setGroupBy] = useState<'status' | 'priority' | 'project'>('status');

  const generateProjectIssueId = (projectId: string) => {
    const project = projects.find(p => p.id === projectId);
    const projectIssues = issues.filter(issue => issue.projectId === projectId);
    const projectPrefix = project ? project.name.split(' ').map(word => word.substring(0, 3).toUpperCase()).join('').substring(0, 6) : 'PROJ';
    const nextNumber = projectIssues.length + 1;
    return `${projectPrefix}-${nextNumber}`;
  };

  const handleInlineCreateIssue = (title: string) => {
    if (onIssueCreate) {
      const targetProjectId = selectedProject ? selectedProject.id : (projects.length > 0 ? projects[0].id : 'default');
      const issue: Issue = {
        id: generateProjectIssueId(targetProjectId),
        title,
        status: 'todo',
        priority: 'medium',
        description: '',
        labels: [],
        projectId: targetProjectId,
        attachments: [],
        subIssues: [],
        activity: []
      };
      onIssueCreate(issue);
    }
  };

  const handleIssueClick = (issue: Issue) => {
    // No-op for inline-only view
  };

  const handleIssueStatusChange = (issueId: string, newStatus: Issue['status']) => {
    if (onIssueStatusChange) {
      onIssueStatusChange(issueId, newStatus);
    }
  };

  const groupIssues = () => {
    const groups: { [key: string]: Issue[] } = {};
    
    issues.forEach(issue => {
      let key = '';
      switch (groupBy) {
        case 'status':
          key = issue.status;
          break;
        case 'priority':
          key = issue.priority;
          break;
        case 'project':
          const project = projects.find(p => p.id === issue.projectId);
          key = project ? project.name : 'Unknown Project';
          break;
      }
      
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(issue);
    });
    
    return groups;
  };

  const getGroupTitle = (key: string) => {
    switch (groupBy) {
      case 'status':
        return key.charAt(0).toUpperCase() + key.slice(1).replace('-', ' ');
      case 'priority':
        return key.charAt(0).toUpperCase() + key.slice(1);
      case 'project':
        return key;
      default:
        return key;
    }
  };

  const statusOrder = ['backlog', 'todo', 'in-progress', 'done', 'cancelled'];
  const priorityOrder = ['lowest', 'low', 'medium', 'high', 'urgent', 'critical'];

  const getSortedGroupKeys = (groups: { [key: string]: Issue[] }) => {
    const keys = Object.keys(groups);
    
    switch (groupBy) {
      case 'status':
        return keys.sort((a, b) => statusOrder.indexOf(a) - statusOrder.indexOf(b));
      case 'priority':
        return keys.sort((a, b) => priorityOrder.indexOf(a) - priorityOrder.indexOf(b));
      default:
        return keys.sort();
    }
  };

  const groupedIssues = groupIssues();
  const sortedGroupKeys = getSortedGroupKeys(groupedIssues);

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between p-4 border-b border-border">
        <div>
          <h1 className="text-xl font-semibold">Issues</h1>
          <p className="text-sm text-muted-foreground">
            Manage and track all your issues
          </p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={groupBy}
            onChange={(e) => setGroupBy(e.target.value as 'status' | 'priority' | 'project')}
            className="px-3 py-1 text-sm border border-border rounded-md bg-background"
          >
            <option value="status">Group by Status</option>
            <option value="priority">Group by Priority</option>
            <option value="project">Group by Project</option>
          </select>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 space-y-6">
        {sortedGroupKeys.map((groupKey) => (
          <div key={groupKey} className="space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-medium text-sm text-muted-foreground">
                {getGroupTitle(groupKey)} ({groupedIssues[groupKey].length})
              </h3>
            </div>
            
            <div className="space-y-0 border border-border/50 rounded-lg overflow-hidden bg-card">
              {groupedIssues[groupKey].map((issue) => (
                <ExpandableIssue
                  key={issue.id}
                  issue={issue}
                  goals={goals}
                  releases={releases}
                  teams={teams}
                  projects={projects}
                  selected={false}
                  onStatusChange={(newStatus) => handleIssueStatusChange(issue.id, newStatus)}
                  onIssueUpdate={onIssueUpdate}
                  onIssueDelete={onIssueDelete}
                  showProject={groupBy !== 'project'}
                  showTeam={true}
                  showEstimation={true}
                />
              ))}
              
              {/* Only show creator in TODO/Backlog for status grouping */}
              {(groupBy !== 'status' || groupKey === 'todo' || groupKey === 'backlog') && (
                <div className="p-3 border-t border-border/50">
                  <InlineIssueCreator
                    onCreateIssue={handleInlineCreateIssue}
                    placeholder={`Add issue to ${getGroupTitle(groupKey)}...`}
                  />
                </div>
              )}
            </div>
          </div>
        ))}

        {/* Global issue creator if no issues exist */}
        {issues.length === 0 && (
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
              <div className="w-6 h-6 rounded border-2 border-muted-foreground/30" />
            </div>
            <h3 className="font-medium mb-2">No issues yet</h3>
            <p className="text-sm text-muted-foreground mb-6">
              Create your first issue to get started
            </p>
            <InlineIssueCreator
              onCreateIssue={handleInlineCreateIssue}
              placeholder="Create your first issue..."
            />
          </div>
        )}
      </div>
    </div>
  );
}