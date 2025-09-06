import React from 'react';
import { 
  Inbox as InboxIcon
} from 'lucide-react';
import { InlineIssue } from './InlineIssue';
import { InlineIssueCreator } from './InlineIssueCreator';
import { Issue } from '../App';

interface InboxViewProps {
  issues: Issue[];
  selectedIssue: Issue | null;
  onIssueSelect: (issue: Issue) => void;
  onIssueStatusChange: (issueId: string, newStatus: Issue['status']) => void;
  onIssueCreate?: (issue: Issue) => void;
}

export function InboxView({ issues, selectedIssue, onIssueSelect, onIssueStatusChange, onIssueCreate }: InboxViewProps) {
  // Filter issues for inbox - those assigned to current user or high priority
  const inboxIssues = issues.filter(issue => 
    issue.assignee?.name === 'Alice Johnson' || issue.priority === 'urgent' || issue.priority === 'high'
  );

  const handleCreateIssue = (title: string) => {
    if (onIssueCreate) {
      const newIssue: Issue = {
        id: `RUN-${Math.floor(Math.random() * 10000)}`,
        title,
        status: 'todo',
        priority: 'high', // Default to high priority for inbox issues
        description: '',
        labels: [],
        project: 'Default Project',
        assignee: { name: 'Alice Johnson', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b734?w=32&h=32&fit=crop&crop=face' },
        attachments: [],
        subIssues: [],
        activity: []
      };
      onIssueCreate(newIssue);
    }
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

  if (inboxIssues.length === 0) {
    return (
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center mx-auto mb-4">
            <InboxIcon className="w-8 h-8 text-muted-foreground" />
          </div>
          <h3 className="text-lg font-medium mb-2">Inbox is empty</h3>
          <p className="text-muted-foreground mb-6">
            No issues require your immediate attention. Great work!
          </p>
          <InlineIssueCreator
            onCreateIssue={handleCreateIssue}
            placeholder="Create new high priority issue..."
          />
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto">
      <div className="p-6">
        <div className="mb-6">
          <h2 className="text-lg font-medium mb-2">Inbox</h2>
          <p className="text-sm text-muted-foreground">
            Issues assigned to you and high priority items requiring attention
          </p>
        </div>

        <div className="space-y-1">
          {inboxIssues.map((issue) => (
            <InlineIssue
              key={issue.id}
              issue={issue}
              selected={selectedIssue?.id === issue.id}
              onClick={() => onIssueSelect(issue)}
              draggable
              onDragStart={(e) => handleDragStart(e, issue)}
              showProject={true}
              showTeam={true}
              showEstimation={true}
            />
          ))}
          <InlineIssueCreator
            onCreateIssue={handleCreateIssue}
            placeholder="Add new inbox issue..."
            className="mt-2"
          />
        </div>
      </div>
    </div>
  );
}