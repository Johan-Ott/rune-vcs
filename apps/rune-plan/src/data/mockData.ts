import { Issue, Project, View, Team, Goal, Release, Workspace } from '../types';

export const mockIssues: Issue[] = [
  // Core Platform Issues
  {
    id: 'CORE-1',
    title: 'Set up user authentication system',
    status: 'in-progress',
    priority: 'high',
    assignee: { name: 'Alice Johnson', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b734?w=32&h=32&fit=crop&crop=face' },
    dueDate: '2025-01-15',
    deadline: '2025-01-20',
    estimation: 8,
    team: { id: 'engineering', name: 'Engineering', avatar: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=32&h=32&fit=crop' },
    description: 'Implement OAuth2 authentication with Google and GitHub providers. Include JWT token management and refresh token logic.',
    labels: ['Authentication', 'Backend', 'Security'],
    projectId: 'core-platform',
    goalId: 'goal-1',
    releaseId: 'release-1',
    attachments: [],
    subIssues: [],
    activity: [
      {
        id: '1',
        type: 'status_change',
        user: 'Alice Johnson',
        content: 'changed status from Todo to In Progress',
        timestamp: '2 hours ago'
      }
    ]
  },
  {
    id: 'CORE-2',
    title: 'Database migration system',
    status: 'todo',
    priority: 'medium',
    assignee: { name: 'Charlie Davis', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face' },
    dueDate: '2025-01-25',
    deadline: '2025-01-30',
    estimation: 5,
    team: { id: 'engineering', name: 'Engineering', avatar: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=32&h=32&fit=crop' },
    description: 'Build automated database migration system for schema updates.',
    labels: ['Database', 'Backend', 'Infrastructure'],
    projectId: 'core-platform',
    goalId: 'goal-1',
    attachments: [],
    subIssues: [],
    activity: []
  },
  {
    id: 'CORE-3',
    title: 'API rate limiting',
    status: 'backlog',
    priority: 'medium',
    estimation: 3,
    team: { id: 'engineering', name: 'Engineering', avatar: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=32&h=32&fit=crop' },
    description: 'Implement rate limiting for API endpoints to prevent abuse.',
    labels: ['API', 'Security', 'Backend'],
    projectId: 'core-platform',
    attachments: [],
    subIssues: [],
    activity: []
  },
  
  // Marketing Site Issues
  {
    id: 'MARKET-1',
    title: 'Design landing page components',
    status: 'backlog',
    priority: 'medium',
    assignee: { name: 'Bob Smith', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face' },
    dueDate: '2025-01-20',
    deadline: '2025-01-25',
    estimation: 5,
    team: { id: 'design-team', name: 'Design Team', avatar: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=32&h=32&fit=crop' },
    description: 'Create reusable React components for the marketing landing page including hero section, features grid, and testimonials.',
    labels: ['Design', 'Frontend', 'Components'],
    projectId: 'marketing-site',
    goalId: 'goal-2',
    attachments: [],
    subIssues: [],
    activity: []
  },
  {
    id: 'MARKET-2',
    title: 'SEO optimization',
    status: 'todo',
    priority: 'high',
    assignee: { name: 'Bob Smith', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face' },
    deadline: '2025-02-01',
    estimation: 3,
    team: { id: 'design-team', name: 'Design Team', avatar: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=32&h=32&fit=crop' },
    description: 'Optimize website for search engines with meta tags, structured data, and performance improvements.',
    labels: ['SEO', 'Marketing', 'Performance'],
    projectId: 'marketing-site',
    goalId: 'goal-2',
    attachments: [],
    subIssues: [],
    activity: []
  },

  // Mobile App Issues
  {
    id: 'MOBILE-1',
    title: 'Fix responsive mobile layout',
    status: 'done',
    priority: 'critical',
    dueDate: '2025-01-10',
    deadline: '2025-01-12',
    estimation: 3,
    team: { id: 'engineering', name: 'Engineering', avatar: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=32&h=32&fit=crop' },
    description: 'Resolved mobile layout issues on dashboard screens. Updated breakpoints and improved touch interactions.',
    labels: ['Bug', 'Mobile', 'CSS'],
    projectId: 'mobile-app',
    goalId: 'goal-3',
    attachments: [
      {
        id: 'att-1',
        name: 'mobile-layout-fix.png',
        url: 'https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?w=400&h=300&fit=crop',
        type: 'image',
        size: 245760,
        uploadedBy: 'Charlie Davis',
        uploadedAt: '2 days ago'
      }
    ],
    subIssues: [],
    activity: [
      {
        id: '2',
        type: 'status_change',
        user: 'Charlie Davis',
        content: 'marked as complete',
        timestamp: '1 day ago'
      }
    ]
  },
  {
    id: 'MOBILE-2',
    title: 'Push notifications',
    status: 'in-progress',
    priority: 'high',
    assignee: { name: 'Alice Johnson', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b734?w=32&h=32&fit=crop&crop=face' },
    deadline: '2025-01-28',
    estimation: 8,
    team: { id: 'engineering', name: 'Engineering', avatar: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=32&h=32&fit=crop' },
    description: 'Implement push notification system for mobile apps.',
    labels: ['Mobile', 'Notifications', 'Backend'],
    projectId: 'mobile-app',
    goalId: 'goal-3',
    attachments: [],
    subIssues: [],
    activity: []
  },

  // Design System Issues
  {
    id: 'DESIGN-1',
    title: 'Implement dark mode toggle',
    status: 'todo',
    priority: 'low',
    assignee: { name: 'Charlie Davis', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face' },
    deadline: '2025-02-05',
    estimation: 2,
    team: { id: 'design-team', name: 'Design Team', avatar: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=32&h=32&fit=crop' },
    description: 'Add system-wide dark mode support with toggle in user preferences.',
    labels: ['Enhancement', 'UI', 'Theme'],
    projectId: 'design-system',
    attachments: [],
    subIssues: [],
    activity: []
  },
  {
    id: 'DESIGN-2',
    title: 'Component library documentation',
    status: 'in-progress',
    priority: 'medium',
    assignee: { name: 'Charlie Davis', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face' },
    deadline: '2025-02-15',
    estimation: 5,
    team: { id: 'design-team', name: 'Design Team', avatar: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=32&h=32&fit=crop' },
    description: 'Create comprehensive documentation for all design system components.',
    labels: ['Documentation', 'Design System'],
    projectId: 'design-system',
    attachments: [],
    subIssues: [],
    activity: []
  },

  // Analytics & Insights Issues
  {
    id: 'ANALYTICS-1',
    title: 'Set up analytics tracking',
    status: 'cancelled',
    priority: 'lowest',
    dueDate: '2025-02-01',
    deadline: '2025-02-10',
    estimation: 13,
    team: { id: 'engineering', name: 'Engineering', avatar: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=32&h=32&fit=crop' },
    description: 'Implement user behavior tracking and conversion analytics.',
    labels: ['Analytics', 'Tracking', 'Data'],
    projectId: 'analytics',
    attachments: [],
    subIssues: [],
    activity: []
  }
];

export const mockGoals: Goal[] = [
  {
    id: 'goal-1',
    title: 'User Authentication System',
    description: 'Complete user authentication and authorization',
    projectId: 'core-platform',
    status: 'active',
    targetDate: '2025-02-01',
    issuesCount: 3,
    completedIssuesCount: 1
  },
  {
    id: 'goal-2',
    title: 'Marketing Website Launch',
    description: 'Launch the new marketing website',
    projectId: 'marketing-site',
    status: 'active',
    targetDate: '2025-01-30',
    issuesCount: 5,
    completedIssuesCount: 2
  },
  {
    id: 'goal-3',
    title: 'Mobile App Beta',
    description: 'Release mobile app beta version',
    projectId: 'mobile-app',
    status: 'completed',
    targetDate: '2025-01-15',
    issuesCount: 8,
    completedIssuesCount: 8
  },
  {
    id: 'goal-4',
    title: 'Design System v2',
    description: 'Complete design system overhaul',
    projectId: 'design-system',
    status: 'active',
    targetDate: '2025-03-01',
    issuesCount: 4,
    completedIssuesCount: 2
  }
];

export const mockReleases: Release[] = [
  {
    id: 'release-1',
    name: 'Version 1.0',
    description: 'Initial public release with core features',
    version: '1.0.0',
    status: 'in-progress',
    targetDate: '2025-02-15',
    projectId: 'core-platform',
    issuesCount: 12,
    completedIssuesCount: 7
  },
  {
    id: 'release-2',
    name: 'Version 1.1',
    description: 'Feature enhancements and bug fixes',
    version: '1.1.0',
    status: 'planned',
    targetDate: '2025-03-15',
    projectId: 'core-platform',
    issuesCount: 8,
    completedIssuesCount: 0
  },
  {
    id: 'release-3',
    name: 'Mobile Beta',
    description: 'Beta release for mobile app',
    version: '0.9.0',
    status: 'in-progress',
    targetDate: '2025-02-01',
    projectId: 'mobile-app',
    issuesCount: 5,
    completedIssuesCount: 3
  }
];

export const mockWorkspaces: Workspace[] = [
  {
    id: 'rune-plan',
    name: 'Rune-Plan',
    avatar: 'https://images.unsplash.com/photo-1549692520-acc6669e2f0c?w=32&h=32&fit=crop',
    description: 'Main workspace for project planning and collaboration',
    isActive: true,
    members: [
      {
        id: 'user-1',
        name: 'Alice Johnson',
        email: 'alice@runeplan.com',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b734?w=32&h=32&fit=crop&crop=face',
        role: 'owner'
      },
      {
        id: 'user-2',
        name: 'Bob Smith',
        email: 'bob@runeplan.com',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
        role: 'admin'
      },
      {
        id: 'user-3',
        name: 'Charlie Davis',
        email: 'charlie@runeplan.com',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
        role: 'member'
      }
    ]
  },
  {
    id: 'acme-corp',
    name: 'Acme Corp',
    avatar: 'https://images.unsplash.com/photo-1560472354-b33ff0c44a43?w=32&h=32&fit=crop',
    description: 'Client work and external projects',
    members: [
      {
        id: 'user-1',
        name: 'Alice Johnson',
        email: 'alice@runeplan.com',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b734?w=32&h=32&fit=crop&crop=face',
        role: 'member'
      }
    ]
  }
];

export const mockProjects: Project[] = [
  {
    id: 'core-platform',
    name: 'Core Platform',
    description: 'Main application backend and infrastructure',
    status: 'active',
    issueCount: 12,
    completedCount: 8,
    goals: mockGoals.filter(goal => goal.projectId === 'core-platform'),
    members: [
      { name: 'Alice Johnson', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b734?w=32&h=32&fit=crop&crop=face' },
      { name: 'Charlie Davis', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face' }
    ]
  },
  {
    id: 'marketing-site',
    name: 'Marketing Site',
    description: 'Public website and landing pages',
    status: 'active',
    issueCount: 6,
    completedCount: 2,
    goals: mockGoals.filter(goal => goal.projectId === 'marketing-site'),
    members: [
      { name: 'Bob Smith', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face' }
    ]
  },
  {
    id: 'mobile-app',
    name: 'Mobile App',
    description: 'iOS and Android mobile applications',
    status: 'active',
    issueCount: 8,
    completedCount: 3,
    goals: mockGoals.filter(goal => goal.projectId === 'mobile-app'),
    members: [
      { name: 'Alice Johnson', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b734?w=32&h=32&fit=crop&crop=face' },
      { name: 'Bob Smith', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face' }
    ]
  },
  {
    id: 'design-system',
    name: 'Design System',
    description: 'Component library and design tokens',
    status: 'active',
    issueCount: 4,
    completedCount: 7,
    goals: [],
    members: [
      { name: 'Charlie Davis', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face' }
    ]
  },
  {
    id: 'analytics',
    name: 'Analytics & Insights',
    description: 'Data tracking and user analytics',
    status: 'paused',
    issueCount: 2,
    completedCount: 1,
    goals: [],
    members: [
      { name: 'Alice Johnson', avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b734?w=32&h=32&fit=crop&crop=face' }
    ]
  },
  {
    id: 'infrastructure',
    name: 'Infrastructure',
    description: 'DevOps, deployment and monitoring',
    status: 'active',
    issueCount: 5,
    completedCount: 12,
    goals: [],
    members: [
      { name: 'Charlie Davis', avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face' },
      { name: 'Bob Smith', avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face' }
    ]
  }
];

export const mockViews: View[] = [
  {
    id: 'high-priority',
    name: 'High Priority',
    description: 'All urgent and high priority issues',
    projectId: 'core-platform',
    filters: { priority: ['urgent', 'high'] },
    issueCount: 4
  },
  {
    id: 'my-assignments',
    name: 'My Assignments',
    description: 'Issues assigned to me',
    projectId: 'core-platform',
    filters: { assignee: ['Alice Johnson'] },
    issueCount: 2
  },
  {
    id: 'mobile-bugs',
    name: 'Mobile Bugs',
    description: 'Bug reports for mobile app',
    projectId: 'mobile-app',
    filters: { project: ['Mobile App'], priority: ['high', 'critical'] },
    issueCount: 3
  },
  {
    id: 'design-tasks',
    name: 'Design Tasks',
    description: 'Design and UI related tasks',
    projectId: 'design-system',
    filters: { labels: ['Design', 'UI'] },
    issueCount: 6
  }
];

export const mockTeams: Team[] = [
  {
    id: 'rune-plan',
    name: 'Rune-Plan',
    avatar: 'https://images.unsplash.com/photo-1549692520-acc6669e2f0c?w=32&h=32&fit=crop',
    description: 'Main workspace for project planning and collaboration',
    members: [
      {
        id: 'user-1',
        name: 'Alice Johnson',
        email: 'alice@runeplan.com',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b734?w=32&h=32&fit=crop&crop=face',
        role: 'owner'
      },
      {
        id: 'user-2',
        name: 'Bob Smith',
        email: 'bob@runeplan.com', 
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
        role: 'admin'
      },
      {
        id: 'user-3',
        name: 'Charlie Davis',
        email: 'charlie@runeplan.com',
        avatar: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=32&h=32&fit=crop&crop=face',
        role: 'member'
      }
    ]
  },
  {
    id: 'design-team',
    name: 'Design Team',
    avatar: 'https://images.unsplash.com/photo-1561070791-2526d30994b5?w=32&h=32&fit=crop',
    description: 'Design system and UI/UX work',
    members: [
      {
        id: 'user-1',
        name: 'Alice Johnson',
        email: 'alice@runeplan.com',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b734?w=32&h=32&fit=crop&crop=face',
        role: 'member'
      },
      {
        id: 'user-4',
        name: 'Diana Chen',
        email: 'diana@runeplan.com',
        avatar: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=32&h=32&fit=crop&crop=face',
        role: 'owner'
      }
    ]
  },
  {
    id: 'engineering',
    name: 'Engineering',
    avatar: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=32&h=32&fit=crop',
    description: 'Development and engineering tasks',
    members: [
      {
        id: 'user-1',
        name: 'Alice Johnson',
        email: 'alice@runeplan.com',
        avatar: 'https://images.unsplash.com/photo-1494790108755-2616b612b734?w=32&h=32&fit=crop&crop=face',
        role: 'member'
      },
      {
        id: 'user-2',
        name: 'Bob Smith',
        email: 'bob@runeplan.com',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=32&h=32&fit=crop&crop=face',
        role: 'owner'
      },
      {
        id: 'user-5',
        name: 'Eve Wilson',
        email: 'eve@runeplan.com',
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=32&h=32&fit=crop&crop=face',
        role: 'admin'
      }
    ]
  }
];