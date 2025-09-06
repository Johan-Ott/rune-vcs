import { invoke } from '@tauri-apps/api/core';
import { Issue } from '../types';

export interface Plan {
  id: string;
  title: string;
  description: string;
  plan_type: 'initiative' | 'project' | 'issue' | 'subissue';
  status: 'planned' | 'active' | 'in-progress' | 'blocked' | 'done';
  priority: 'low' | 'medium' | 'high' | 'critical';
  owners: string[];
  tags: string[];
  created: string;
  updated: string;
  project?: string;
  epic?: string;
  story?: string;
  effort?: number;
}

export interface CreatePlanRequest {
  title: string;
  plan_type: 'initiative' | 'project' | 'issue' | 'subissue';
  priority: 'low' | 'medium' | 'high' | 'critical';
  description?: string;
  project?: string;
  epic?: string;
  story?: string;
}

// Convert between Rust Plan and Frontend Issue
export function planToIssue(plan: Plan): Issue {
  const priorityMapping: Record<string, Issue['priority']> = {
    'low': 'low',
    'medium': 'medium', 
    'high': 'high',
    'critical': 'critical'
  };

  const statusMapping: Record<string, Issue['status']> = {
    'planned': 'todo',
    'active': 'todo',
    'in-progress': 'in-progress',
    'blocked': 'backlog',
    'done': 'done'
  };

  return {
    id: plan.id,
    title: plan.title,
    description: plan.description,
    status: statusMapping[plan.status] || 'todo',
    priority: priorityMapping[plan.priority] || 'medium',
    assignee: plan.owners.length > 0 ? {
      name: plan.owners[0],
      avatar: `https://api.dicebear.com/7.x/initials/svg?seed=${plan.owners[0]}`
    } : undefined,
    labels: plan.tags || [],
    projectId: plan.project || 'default',
    attachments: [],
    subIssues: [],
    activity: [],
    estimation: plan.effort
  };
}

export function issueToCreatePlanRequest(issue: Partial<Issue>): CreatePlanRequest {
  const priorityMapping: Record<Issue['priority'], Plan['priority']> = {
    'lowest': 'low',
    'low': 'low',
    'medium': 'medium',
    'high': 'high',
    'urgent': 'critical',
    'critical': 'critical'
  };

  return {
    title: issue.title || '',
    plan_type: 'issue',
    priority: priorityMapping[issue.priority || 'medium'],
    description: issue.description,
    project: issue.projectId
  };
}

export class PlanningAPI {
  private workspacePath: string;

  constructor(workspacePath: string = '/Users/johanottosson/Documents/small_projects_prog/rune-vcs') {
    this.workspacePath = workspacePath;
  }

  async initStore(): Promise<void> {
    return invoke('init_planning_store', { workspacePath: this.workspacePath });
  }

  async createPlan(request: CreatePlanRequest): Promise<Plan> {
    return invoke('create_plan_item', {
      workspacePath: this.workspacePath,
      title: request.title,
      planType: request.plan_type,
      priority: request.priority,
      description: request.description,
      project: request.project,
      epic: request.epic,
      story: request.story,
    });
  }

  async loadAllPlans(): Promise<Plan[]> {
    return invoke('load_all_plans', { workspacePath: this.workspacePath });
  }

  async loadPlan(planId: string): Promise<Plan> {
    return invoke('load_plan', { 
      workspacePath: this.workspacePath, 
      planId 
    });
  }

  async savePlan(plan: Plan): Promise<void> {
    return invoke('save_plan', { 
      workspacePath: this.workspacePath, 
      plan 
    });
  }

  async updatePlanStatus(planId: string, status: Plan['status']): Promise<Plan> {
    return invoke('update_plan_status', { 
      workspacePath: this.workspacePath, 
      planId, 
      status 
    });
  }
}

// Export singleton instance
export const planningAPI = new PlanningAPI();
