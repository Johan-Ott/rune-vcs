export interface Issue {
  id: string;
  title: string;
  status: 'todo' | 'in-progress' | 'done' | 'backlog' | 'cancelled';
  priority: 'lowest' | 'low' | 'medium' | 'high' | 'urgent' | 'critical';
  assignee?: {
    name: string;
    avatar: string;
  };
  dueDate?: string;
  deadline?: string;
  estimation?: number; // Fibonacci numbers: 1, 2, 3, 5, 8, 13, 21, etc.
  team?: {
    id: string;
    name: string;
    avatar?: string;
  };
  description: string;
  labels: string[];
  projectId: string;
  goalId?: string;
  releaseId?: string;
  attachments: Attachment[];
  subIssues: Issue[];
  activity: ActivityItem[];
}

export interface ActivityItem {
  id: string;
  type: 'comment' | 'status_change' | 'assignment';
  user: string;
  content: string;
  timestamp: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'paused' | 'completed';
  issueCount: number;
  completedCount: number;
  goals: Goal[];
  members: Array<{
    name: string;
    avatar: string;
  }>;
}

export interface View {
  id: string;
  name: string;
  description: string;
  projectId?: string;
  filters: {
    status?: string[];
    priority?: string[];
    assignee?: string[];
    project?: string[];
  };
  issueCount: number;
}

export interface Team {
  id: string;
  name: string;
  avatar?: string;
  description?: string;
  members?: TeamMember[];
  createdAt?: string;
  updatedAt?: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: 'owner' | 'admin' | 'member';
}

export interface FilterState {
  status: string[];
  priority: string[];
  assignee: string[];
  project: string[];
}

export interface Goal {
  id: string;
  title: string;
  description: string;
  projectId: string;
  status: 'active' | 'completed' | 'paused';
  targetDate?: string;
  issuesCount: number;
  completedIssuesCount: number;
}

export interface Release {
  id: string;
  name: string;
  description: string;
  version: string;
  status: 'planned' | 'in-progress' | 'released' | 'cancelled';
  targetDate?: string;
  releaseDate?: string;
  projectId?: string;
  issuesCount: number;
  completedIssuesCount: number;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  type: 'image' | 'file';
  size: number;
  uploadedBy: string;
  uploadedAt: string;
}

export interface Workspace {
  id: string;
  name: string;
  avatar?: string;
  description?: string;
  members: TeamMember[];
  isActive?: boolean;
}

export type NavigationView = 'my-issues' | 'views' | 'teams' | 'goals';

export type Theme = 'light' | 'dark' | 'system';