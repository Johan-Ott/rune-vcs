import { invoke } from '@tauri-apps/api/core';
import { Project, Team, Goal, Release, View, Workspace } from '../types';

// Backend configuration types (matching Rust structs)
export interface WorkspaceConfig {
  projects: ProjectConfig[];
  teams: TeamConfig[];
  goals: GoalConfig[];
  releases: ReleaseConfig[];
  views: ViewConfig[];
  workspaces: WorkspaceInfo[];
}

export interface ProjectConfig {
  id: string;
  name: string;
  description: string;
  status: string;
  issue_count: number;
  completed_count: number;
  members: ProjectMember[];
}

export interface ProjectMember {
  name: string;
  avatar: string;
}

export interface TeamConfig {
  id: string;
  name: string;
  avatar?: string;
  description?: string;
  members: TeamMemberConfig[];
}

export interface TeamMemberConfig {
  id: string;
  name: string;
  email: string;
  avatar: string;
  role: string;
}

export interface GoalConfig {
  id: string;
  title: string;
  description: string;
  project_id: string;
  status: string;
  target_date?: string;
  issues_count: number;
  completed_issues_count: number;
}

export interface ReleaseConfig {
  id: string;
  name: string;
  description: string;
  version: string;
  status: string;
  target_date?: string;
  release_date?: string;
  project_id?: string;
  issues_count: number;
  completed_issues_count: number;
}

export interface ViewConfig {
  id: string;
  name: string;
  description: string;
  project_id?: string;
  filters: ViewFilters;
  issue_count: number;
}

export interface ViewFilters {
  status?: string[];
  priority?: string[];
  assignee?: string[];
  project?: string[];
}

export interface WorkspaceInfo {
  id: string;
  name: string;
  avatar?: string;
  description?: string;
  members: TeamMemberConfig[];
  is_active?: boolean;
}

// Type conversion functions
export function projectConfigToProject(config: ProjectConfig): Project {
  return {
    id: config.id,
    name: config.name,
    description: config.description,
    status: config.status as 'active' | 'paused' | 'completed',
    issueCount: config.issue_count,
    completedCount: config.completed_count,
    goals: [], // Will be populated separately
    members: config.members
  };
}

export function projectToProjectConfig(project: Project): ProjectConfig {
  return {
    id: project.id,
    name: project.name,
    description: project.description,
    status: project.status,
    issue_count: project.issueCount,
    completed_count: project.completedCount,
    members: project.members
  };
}

export function teamConfigToTeam(config: TeamConfig): Team {
  return {
    id: config.id,
    name: config.name,
    avatar: config.avatar,
    description: config.description,
    members: config.members.map(m => ({
      id: m.id,
      name: m.name,
      email: m.email,
      avatar: m.avatar,
      role: m.role as 'owner' | 'admin' | 'member'
    }))
  };
}

export function teamToTeamConfig(team: Team): TeamConfig {
  return {
    id: team.id,
    name: team.name,
    avatar: team.avatar,
    description: team.description,
    members: team.members?.map(m => ({
      id: m.id,
      name: m.name,
      email: m.email,
      avatar: m.avatar,
      role: m.role
    })) || []
  };
}

export function goalConfigToGoal(config: GoalConfig): Goal {
  return {
    id: config.id,
    title: config.title,
    description: config.description,
    projectId: config.project_id,
    status: config.status as 'active' | 'completed' | 'paused',
    targetDate: config.target_date,
    issuesCount: config.issues_count,
    completedIssuesCount: config.completed_issues_count
  };
}

export function goalToGoalConfig(goal: Goal): GoalConfig {
  return {
    id: goal.id,
    title: goal.title,
    description: goal.description,
    project_id: goal.projectId,
    status: goal.status,
    target_date: goal.targetDate,
    issues_count: goal.issuesCount,
    completed_issues_count: goal.completedIssuesCount
  };
}

export function releaseConfigToRelease(config: ReleaseConfig): Release {
  return {
    id: config.id,
    name: config.name,
    description: config.description,
    version: config.version,
    status: config.status as 'planned' | 'in-progress' | 'released' | 'cancelled',
    targetDate: config.target_date,
    releaseDate: config.release_date,
    projectId: config.project_id,
    issuesCount: config.issues_count,
    completedIssuesCount: config.completed_issues_count
  };
}

export function releaseToReleaseConfig(release: Release): ReleaseConfig {
  return {
    id: release.id,
    name: release.name,
    description: release.description,
    version: release.version,
    status: release.status,
    target_date: release.targetDate,
    release_date: release.releaseDate,
    project_id: release.projectId,
    issues_count: release.issuesCount,
    completed_issues_count: release.completedIssuesCount
  };
}

export function viewConfigToView(config: ViewConfig): View {
  return {
    id: config.id,
    name: config.name,
    description: config.description,
    projectId: config.project_id,
    filters: {
      status: config.filters.status,
      priority: config.filters.priority,
      assignee: config.filters.assignee,
      project: config.filters.project
    },
    issueCount: config.issue_count
  };
}

export function viewToViewConfig(view: View): ViewConfig {
  return {
    id: view.id,
    name: view.name,
    description: view.description,
    project_id: view.projectId,
    filters: {
      status: view.filters.status,
      priority: view.filters.priority,
      assignee: view.filters.assignee,
      project: view.filters.project
    },
    issue_count: view.issueCount
  };
}

export function workspaceInfoToWorkspace(info: WorkspaceInfo): Workspace {
  return {
    id: info.id,
    name: info.name,
    avatar: info.avatar,
    description: info.description,
    members: info.members.map(m => ({
      id: m.id,
      name: m.name,
      email: m.email,
      avatar: m.avatar,
      role: m.role as 'owner' | 'admin' | 'member'
    })),
    isActive: info.is_active
  };
}

export function workspaceToWorkspaceInfo(workspace: Workspace): WorkspaceInfo {
  return {
    id: workspace.id,
    name: workspace.name,
    avatar: workspace.avatar,
    description: workspace.description,
    members: workspace.members.map(m => ({
      id: m.id,
      name: m.name,
      email: m.email,
      avatar: m.avatar,
      role: m.role
    })),
    is_active: workspace.isActive
  };
}

export class WorkspaceAPI {
  private workspacePath: string;

  constructor(workspacePath: string = '/Users/johanottosson/Documents/small_projects_prog/rune-vcs') {
    this.workspacePath = workspacePath;
  }

  // Load all workspace configuration
  async loadConfig(): Promise<WorkspaceConfig> {
    return invoke('load_workspace_config', { workspacePath: this.workspacePath });
  }

  // Save workspace configuration
  async saveConfig(config: WorkspaceConfig): Promise<void> {
    return invoke('save_workspace_config', { workspacePath: this.workspacePath, config });
  }

  // Project operations
  async createProject(project: ProjectConfig): Promise<ProjectConfig> {
    return invoke('create_project', { workspacePath: this.workspacePath, project });
  }

  async updateProject(project: ProjectConfig): Promise<ProjectConfig> {
    return invoke('update_project', { workspacePath: this.workspacePath, project });
  }

  async deleteProject(projectId: string): Promise<void> {
    return invoke('delete_project', { workspacePath: this.workspacePath, projectId });
  }

  // Team operations
  async createTeam(team: TeamConfig): Promise<TeamConfig> {
    return invoke('create_team', { workspacePath: this.workspacePath, team });
  }

  async updateTeam(team: TeamConfig): Promise<TeamConfig> {
    return invoke('update_team', { workspacePath: this.workspacePath, team });
  }

  async deleteTeam(teamId: string): Promise<void> {
    return invoke('delete_team', { workspacePath: this.workspacePath, teamId });
  }

  // Goal operations
  async createGoal(goal: GoalConfig): Promise<GoalConfig> {
    return invoke('create_goal', { workspacePath: this.workspacePath, goal });
  }

  async updateGoal(goal: GoalConfig): Promise<GoalConfig> {
    return invoke('update_goal', { workspacePath: this.workspacePath, goal });
  }

  async deleteGoal(goalId: string): Promise<void> {
    return invoke('delete_goal', { workspacePath: this.workspacePath, goalId });
  }

  // Release operations
  async createRelease(release: ReleaseConfig): Promise<ReleaseConfig> {
    return invoke('create_release', { workspacePath: this.workspacePath, release });
  }

  async updateRelease(release: ReleaseConfig): Promise<ReleaseConfig> {
    return invoke('update_release', { workspacePath: this.workspacePath, release });
  }

  async deleteRelease(releaseId: string): Promise<void> {
    return invoke('delete_release', { workspacePath: this.workspacePath, releaseId });
  }

  // View operations
  async createView(view: ViewConfig): Promise<ViewConfig> {
    return invoke('create_view', { workspacePath: this.workspacePath, view });
  }

  async updateView(view: ViewConfig): Promise<ViewConfig> {
    return invoke('update_view', { workspacePath: this.workspacePath, view });
  }

  async deleteView(viewId: string): Promise<void> {
    return invoke('delete_view', { workspacePath: this.workspacePath, viewId });
  }
}

// Export singleton instance
export const workspaceAPI = new WorkspaceAPI();
