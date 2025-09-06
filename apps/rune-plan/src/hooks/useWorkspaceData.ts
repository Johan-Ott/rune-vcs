import { useState, useEffect, useCallback } from 'react';
import { 
  workspaceAPI, 
  WorkspaceConfig,
  projectConfigToProject,
  teamConfigToTeam,
  goalConfigToGoal,
  releaseConfigToRelease,
  viewConfigToView,
  workspaceInfoToWorkspace,
  projectToProjectConfig,
  teamToTeamConfig,
  goalToGoalConfig,
  releaseToReleaseConfig,
  viewToViewConfig,
  workspaceToWorkspaceInfo
} from '../lib/workspace-api';
import { Project, Team, Goal, Release, View, Workspace } from '../types';

export function useWorkspaceData() {
  // State for all workspace data
  const [projects, setProjects] = useState<Project[]>([]);
  const [teams, setTeams] = useState<Team[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [releases, setReleases] = useState<Release[]>([]);
  const [views, setViews] = useState<View[]>([]);
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [currentWorkspace, setCurrentWorkspace] = useState<Workspace | null>(null);
  const [currentTeam, setCurrentTeam] = useState<Team | null>(null);
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load all workspace data
  const loadWorkspaceData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const config = await workspaceAPI.loadConfig();
      
      // Convert backend config to frontend types
      const convertedProjects = config.projects.map(projectConfigToProject);
      const convertedTeams = config.teams.map(teamConfigToTeam);
      console.log('Loaded teams from backend:', convertedTeams.map(t => ({ 
        id: t.id, 
        name: t.name, 
        memberCount: t.members?.length || 0,
        members: t.members?.map(m => m.name) || []
      })));
      const convertedGoals = config.goals.map(goalConfigToGoal);
      const convertedReleases = config.releases.map(releaseConfigToRelease);
      const convertedViews = config.views.map(viewConfigToView);
      const convertedWorkspaces = config.workspaces.map(workspaceInfoToWorkspace);
      
      // Add goals to their corresponding projects
      const projectsWithGoals = convertedProjects.map(project => ({
        ...project,
        goals: convertedGoals.filter(goal => goal.projectId === project.id)
      }));
      
      setProjects(projectsWithGoals);
      setTeams(convertedTeams);
      setGoals(convertedGoals);
      setReleases(convertedReleases);
      setViews(convertedViews);
      setWorkspaces(convertedWorkspaces);
      
      // Set current workspace and team if not already set
      if (!currentWorkspace && convertedWorkspaces.length > 0) {
        const activeWorkspace = convertedWorkspaces.find(w => w.isActive) || convertedWorkspaces[0];
        setCurrentWorkspace(activeWorkspace);
      }
      
      if (!currentTeam && convertedTeams.length > 0) {
        setCurrentTeam(convertedTeams[0]);
      }
      
    } catch (err) {
      console.error('Failed to load workspace data:', err);
      setError(err instanceof Error ? err.message : 'Failed to load workspace data');
      
      // Initialize with default data if loading fails
      const defaultTeam: Team = {
        id: 'default',
        name: 'Default Team',
        description: 'Default team workspace'
      };

      const defaultWorkspace: Workspace = {
        id: 'default',
        name: 'Default Workspace',
        description: 'Default workspace',
        members: []
      };

      setTeams([defaultTeam]);
      setWorkspaces([defaultWorkspace]);
      setCurrentTeam(defaultTeam);
      setCurrentWorkspace(defaultWorkspace);
    } finally {
      setLoading(false);
    }
  }, [currentWorkspace, currentTeam]);

  // Save current state to backend
  const saveWorkspaceData = useCallback(async () => {
    try {
      const config: WorkspaceConfig = {
        projects: projects.map(projectToProjectConfig),
        teams: teams.map(teamToTeamConfig),
        goals: goals.map(goalToGoalConfig),
        releases: releases.map(releaseToReleaseConfig),
        views: views.map(viewToViewConfig),
        workspaces: workspaces.map(workspaceToWorkspaceInfo)
      };
      
      await workspaceAPI.saveConfig(config);
    } catch (err) {
      console.error('Failed to save workspace data:', err);
      setError(err instanceof Error ? err.message : 'Failed to save workspace data');
    }
  }, [projects, teams, goals, releases, views, workspaces]);

  // Project operations
  const createProject = useCallback(async (project: Omit<Project, 'id' | 'issueCount' | 'completedCount' | 'goals'>) => {
    try {
      const newProject: Project = {
        ...project,
        id: `project-${Date.now()}`,
        issueCount: 0,
        completedCount: 0,
        goals: []
      };
      
      // Create a completely fresh workspace with only the new project
      const cleanConfig: WorkspaceConfig = {
        projects: [projectToProjectConfig(newProject)],
        teams: [],
        goals: [],
        releases: [],
        views: [],
        workspaces: currentWorkspace ? [workspaceToWorkspaceInfo(currentWorkspace)] : []
      };
      
      await workspaceAPI.saveConfig(cleanConfig);
      
      // Update state to reflect the clean workspace
      setProjects([newProject]);
      setTeams([]);
      setViews([]);
      setGoals([]);
      setReleases([]);
      
      return newProject;
    } catch (err) {
      console.error('Failed to create project:', err);
      setError(err instanceof Error ? err.message : 'Failed to create project');
      return null;
    }
  }, [currentWorkspace]);

  const updateProject = useCallback(async (updatedProject: Project) => {
    try {
      const config = projectToProjectConfig(updatedProject);
      await workspaceAPI.updateProject(config);
      
      setProjects(prev => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
    } catch (err) {
      console.error('Failed to update project:', err);
      setError(err instanceof Error ? err.message : 'Failed to update project');
    }
  }, []);

  const deleteProject = useCallback(async (projectId: string) => {
    try {
      await workspaceAPI.deleteProject(projectId);
      setProjects(prev => prev.filter(p => p.id !== projectId));
      setGoals(prev => prev.filter(g => g.projectId !== projectId));
    } catch (err) {
      console.error('Failed to delete project:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete project');
    }
  }, []);

  // Team operations
  const createTeam = useCallback(async (team: Omit<Team, 'id'>) => {
    try {
      const newTeam: Team = {
        ...team,
        id: `team-${Date.now()}`
      };
      
      const config = teamToTeamConfig(newTeam);
      await workspaceAPI.createTeam(config);
      
      setTeams(prev => [...prev, newTeam]);
      return newTeam;
    } catch (err) {
      console.error('Failed to create team:', err);
      setError(err instanceof Error ? err.message : 'Failed to create team');
      return null;
    }
  }, []);

  const updateTeam = useCallback(async (updatedTeam: Team) => {
    try {
      const config = teamToTeamConfig(updatedTeam);
      await workspaceAPI.updateTeam(config);
      
      setTeams(prev => prev.map(t => t.id === updatedTeam.id ? updatedTeam : t));
      
      if (currentTeam?.id === updatedTeam.id) {
        setCurrentTeam(updatedTeam);
      }
    } catch (err) {
      console.error('Failed to update team:', err);
      setError(err instanceof Error ? err.message : 'Failed to update team');
    }
  }, [currentTeam]);

  const deleteTeam = useCallback(async (teamId: string) => {
    try {
      await workspaceAPI.deleteTeam(teamId);
      setTeams(prev => prev.filter(t => t.id !== teamId));
      
      if (currentTeam?.id === teamId) {
        setCurrentTeam(teams.find(t => t.id !== teamId) || null);
      }
    } catch (err) {
      console.error('Failed to delete team:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete team');
    }
  }, [currentTeam, teams]);

  // Goal operations
  const createGoal = useCallback(async (goal: Omit<Goal, 'id' | 'issuesCount' | 'completedIssuesCount'>) => {
    try {
      const newGoal: Goal = {
        ...goal,
        id: `goal-${Date.now()}`,
        issuesCount: 0,
        completedIssuesCount: 0
      };
      
      const config = goalToGoalConfig(newGoal);
      await workspaceAPI.createGoal(config);
      
      setGoals(prev => [...prev, newGoal]);
      
      // Update project with new goal
      setProjects(prev => prev.map(p => 
        p.id === newGoal.projectId 
          ? { ...p, goals: [...p.goals, newGoal] }
          : p
      ));
      
      return newGoal;
    } catch (err) {
      console.error('Failed to create goal:', err);
      setError(err instanceof Error ? err.message : 'Failed to create goal');
      return null;
    }
  }, []);

  const updateGoal = useCallback(async (updatedGoal: Goal) => {
    try {
      const config = goalToGoalConfig(updatedGoal);
      await workspaceAPI.updateGoal(config);
      
      setGoals(prev => prev.map(g => g.id === updatedGoal.id ? updatedGoal : g));
      
      // Update project goals
      setProjects(prev => prev.map(p => ({
        ...p,
        goals: p.goals.map(g => g.id === updatedGoal.id ? updatedGoal : g)
      })));
    } catch (err) {
      console.error('Failed to update goal:', err);
      setError(err instanceof Error ? err.message : 'Failed to update goal');
    }
  }, []);

  const deleteGoal = useCallback(async (goalId: string) => {
    try {
      await workspaceAPI.deleteGoal(goalId);
      setGoals(prev => prev.filter(g => g.id !== goalId));
      
      // Remove goal from projects
      setProjects(prev => prev.map(p => ({
        ...p,
        goals: p.goals.filter(g => g.id !== goalId)
      })));
    } catch (err) {
      console.error('Failed to delete goal:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete goal');
    }
  }, []);

  // Release operations
  const createRelease = useCallback(async (release: Omit<Release, 'id' | 'issuesCount' | 'completedIssuesCount'>) => {
    try {
      const newRelease: Release = {
        ...release,
        id: `release-${Date.now()}`,
        issuesCount: 0,
        completedIssuesCount: 0
      };
      
      const config = releaseToReleaseConfig(newRelease);
      await workspaceAPI.createRelease(config);
      
      setReleases(prev => [...prev, newRelease]);
      return newRelease;
    } catch (err) {
      console.error('Failed to create release:', err);
      setError(err instanceof Error ? err.message : 'Failed to create release');
      return null;
    }
  }, []);

  const updateRelease = useCallback(async (updatedRelease: Release) => {
    try {
      const config = releaseToReleaseConfig(updatedRelease);
      await workspaceAPI.updateRelease(config);
      
      setReleases(prev => prev.map(r => r.id === updatedRelease.id ? updatedRelease : r));
    } catch (err) {
      console.error('Failed to update release:', err);
      setError(err instanceof Error ? err.message : 'Failed to update release');
    }
  }, []);

  const deleteRelease = useCallback(async (releaseId: string) => {
    try {
      await workspaceAPI.deleteRelease(releaseId);
      setReleases(prev => prev.filter(r => r.id !== releaseId));
    } catch (err) {
      console.error('Failed to delete release:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete release');
    }
  }, []);

  // View operations
  const createView = useCallback(async (view: Omit<View, 'id' | 'issueCount'>) => {
    try {
      const newView: View = {
        ...view,
        id: `view-${Date.now()}`,
        issueCount: 0
      };
      
      const config = viewToViewConfig(newView);
      await workspaceAPI.createView(config);
      
      setViews(prev => [...prev, newView]);
      return newView;
    } catch (err) {
      console.error('Failed to create view:', err);
      setError(err instanceof Error ? err.message : 'Failed to create view');
      return null;
    }
  }, []);

  const updateView = useCallback(async (updatedView: View) => {
    try {
      const config = viewToViewConfig(updatedView);
      await workspaceAPI.updateView(config);
      
      setViews(prev => prev.map(v => v.id === updatedView.id ? updatedView : v));
    } catch (err) {
      console.error('Failed to update view:', err);
      setError(err instanceof Error ? err.message : 'Failed to update view');
    }
  }, []);

  const deleteView = useCallback(async (viewId: string) => {
    try {
      await workspaceAPI.deleteView(viewId);
      setViews(prev => prev.filter(v => v.id !== viewId));
    } catch (err) {
      console.error('Failed to delete view:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete view');
    }
  }, []);

  // Workspace operations
  const handleWorkspaceChange = useCallback((workspace: Workspace) => {
    setWorkspaces(prev => prev.map(w => ({ ...w, isActive: w.id === workspace.id })));
    setCurrentWorkspace({ ...workspace, isActive: true });
    saveWorkspaceData();
  }, [saveWorkspaceData]);

  const createWorkspace = useCallback(async (workspace: Omit<Workspace, 'id'>) => {
    const newWorkspace: Workspace = {
      ...workspace,
      id: `workspace-${Date.now()}`,
      isActive: false
    };
    
    setWorkspaces(prev => [...prev, newWorkspace]);
    await saveWorkspaceData();
    return newWorkspace;
  }, [saveWorkspaceData]);

  // Load data on mount
  useEffect(() => {
    loadWorkspaceData();
  }, [loadWorkspaceData]);

  return {
    // Data
    projects,
    teams,
    goals,
    releases,
    views,
    workspaces,
    currentWorkspace,
    currentTeam,
    loading,
    error,
    
    // Operations
    createProject,
    updateProject,
    deleteProject,
    createTeam,
    updateTeam,
    deleteTeam,
    createGoal,
    updateGoal,
    deleteGoal,
    createRelease,
    updateRelease,
    deleteRelease,
    createView,
    updateView,
    deleteView,
    handleWorkspaceChange,
    createWorkspace,
    
    // Utilities
    refreshData: loadWorkspaceData,
    clearError: () => setError(null),
    setCurrentTeam
  };
}
