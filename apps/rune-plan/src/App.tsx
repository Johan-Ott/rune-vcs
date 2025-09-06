import React, { useState } from 'react';
import { SidebarHierarchical } from './components/SidebarHierarchical';
import { TopNavigation } from './components/TopNavigation';
import { IssuesViewSimple } from './components/IssuesViewSimple';
import { ViewsView } from './components/ViewsView';
import { TeamsView } from './components/TeamsView';
import { WelcomeView } from './components/WelcomeView';
import { FilterModal } from './components/FilterModal';
import { ImportModal } from './components/ImportModal';
import { WorkspaceSettingsModal } from './components/WorkspaceSettingsModal';
import { SettingsModal } from './components/SettingsModal';
import { ThemeProvider } from './components/ThemeProvider';
import { 
  Issue, 
  Project, 
  View, 
  Team, 
  TeamMember,
  Goal, 
  Release, 
  Workspace, 
  FilterState, 
  NavigationView 
} from './types';

// Re-export types for other components
export type { 
  Issue, 
  Project, 
  View, 
  Team, 
  TeamMember,
  Goal, 
  Release, 
  Workspace, 
  FilterState, 
  NavigationView 
} from './types';
import { usePlanning } from './hooks/usePlanning';
import { useWorkspaceData } from './hooks/useWorkspaceData';




export default function App() {
  // UI State
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [currentView, setCurrentView] = useState<NavigationView>('my-issues');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [filters, setFilters] = useState<FilterState>({
    status: [],
    priority: [],
    assignee: [],
    project: []
  });

  // Modal States
  const [filterOpen, setFilterOpen] = useState(false);
  const [importModalOpen, setImportModalOpen] = useState(false);
  const [workspaceSettingsOpen, setWorkspaceSettingsOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Data State - use real workspace and planning data
  const { 
    issues, 
    loading: issuesLoading,
    error: issuesError,
    createIssue,
    updateIssueStatus,
    refreshIssues,
    clearError: clearIssuesError
  } = usePlanning();

  const {
    projects,
    teams,
    goals,
    releases,
    views,
    workspaces,
    currentWorkspace,
    currentTeam,
    loading: workspaceLoading,
    error: workspaceError,
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
    createWorkspace,
    setCurrentTeam
  } = useWorkspaceData();

  // Create default values to prevent null errors
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

  const safeCurrentTeam = currentTeam || teams[0] || defaultTeam;
  const safeCurrentWorkspace = currentWorkspace || workspaces[0] || defaultWorkspace;

  // Local issue modifications (until backend supports full updates)
  const [localIssueUpdates, setLocalIssueUpdates] = useState<Record<string, Partial<Issue>>>({});
  const [deletedIssueIds, setDeletedIssueIds] = useState<Set<string>>(new Set());

  const handleIssueStatusChange = (issueId: string, newStatus: Issue['status']) => {
    updateIssueStatus(issueId, newStatus);
  };

  const handleNavigationChange = (view: NavigationView) => {
    setCurrentView(view);
  };

  const handleTeamChange = (team: Team) => {
    setCurrentTeam(team);
  };

  const handleIssueCreate = async (issueData: Partial<Issue>) => {
    if (!issueData.title) return;
    
    // Map frontend priority to backend priority
    const priorityMapping: Record<Issue['priority'], 'low' | 'medium' | 'high' | 'critical'> = {
      'lowest': 'low',
      'low': 'low',
      'medium': 'medium',
      'high': 'high',
      'urgent': 'critical',
      'critical': 'critical'
    };
    
    const request = {
      title: issueData.title,
      plan_type: 'issue' as const,
      priority: priorityMapping[issueData.priority || 'medium'],
      description: issueData.description,
      project: issueData.projectId
    };
    
    await createIssue(request);
  };

  const handleIssueUpdate = async (updatedIssue: Issue) => {
    console.log('Updating issue:', updatedIssue.id, 'with changes:', updatedIssue);
    
    // Update status via backend if it changed
    if (updatedIssue.status) {
      try {
        await updateIssueStatus(updatedIssue.id, updatedIssue.status);
        console.log('Status updated successfully in backend');
      } catch (error) {
        console.error('Failed to update issue status:', error);
      }
    }
    
    // Store local updates for all fields (including status for consistency)
    setLocalIssueUpdates(prev => ({
      ...prev,
      [updatedIssue.id]: {
        ...prev[updatedIssue.id],
        status: updatedIssue.status, // Include status for immediate UI feedback
        priority: updatedIssue.priority,
        assignee: updatedIssue.assignee,
        labels: updatedIssue.labels,
        description: updatedIssue.description,
        title: updatedIssue.title,
        estimation: updatedIssue.estimation,
        goalId: updatedIssue.goalId,
        releaseId: updatedIssue.releaseId,
        deadline: updatedIssue.deadline,
        attachments: updatedIssue.attachments,
        dueDate: updatedIssue.dueDate,
        team: updatedIssue.team
      }
    }));
    
    console.log('Issue updated successfully (status saved to backend, all fields stored locally)');
  };

  const handleIssueDelete = (issueId: string) => {
    console.log('Deleting issue:', issueId);
    
    if (window.confirm(`Are you sure you want to delete this issue?`)) {
      // Add to deleted issues set for local filtering
      setDeletedIssueIds(prev => new Set(prev).add(issueId));
      console.log('Issue marked as deleted locally. Backend delete not yet implemented.');
    }
  };

  const handleFilterChange = (newFilters: FilterState) => {
    setFilters(newFilters);
  };

  const handleImportIssues = async (importedIssues: Issue[]) => {
    // Convert and create each imported issue
    for (const issue of importedIssues) {
      await handleIssueCreate(issue);
    }
    setImportModalOpen(false);
  };

  const handleOpenProject = () => {
    // For now, just trigger the import modal
    // TODO: Add file picker for .rune project files
    setImportModalOpen(true);
  };

  // Wrapper handlers for Sidebar component compatibility
  const handleTeamCreate = (team: Team) => createTeam(team);
  const handleTeamUpdate = (team: Team) => updateTeam(team);
  const handleTeamDelete = (teamId: string) => deleteTeam(teamId);
  const handleWorkspaceChange = (workspace: Workspace) => {
    // For now, just create the workspace since we don't have setCurrentWorkspace
    createWorkspace(workspace);
  };

  // Merge backend issues with local updates
  const getMergedIssues = (backendIssues: Issue[]): Issue[] => {
    console.log('Merging issues - backend count:', backendIssues.length);
    
    // Filter out deleted issues first
    const nonDeletedIssues = backendIssues.filter(issue => !deletedIssueIds.has(issue.id));
    
    // Then apply local updates
    const merged = nonDeletedIssues.map(issue => {
      const localUpdate = localIssueUpdates[issue.id];
      if (localUpdate) {
        return { ...issue, ...localUpdate };
      }
      return issue;
    });
    console.log('Merged issues count:', merged.length, 'deleted count:', deletedIssueIds.size);
    return merged;
  };

  const getFilteredIssues = (issueList: Issue[]) => {
    return issueList.filter(issue => {
      // Project filter from dropdown
      if (selectedProject && issue.projectId !== selectedProject.id) return false;
      
      // Other filters
      if (filters.status.length > 0 && !filters.status.includes(issue.status)) return false;
      if (filters.priority.length > 0 && !filters.priority.includes(issue.priority)) return false;
      if (filters.assignee.length > 0 && (!issue.assignee || !filters.assignee.includes(issue.assignee.name))) return false;
      if (filters.project.length > 0) {
        const projectNames = filters.project.map(projectName => {
          const project = projects.find(p => p.name === projectName);
          return project ? project.id : null;
        }).filter(Boolean);
        if (!projectNames.includes(issue.projectId)) return false;
      }
      return true;
    });
  };

  const renderMainContent = () => {
    // Show welcome view if no projects exist
    if (projects.length === 0) {
      return (
        <WelcomeView
          onCreateProject={createProject}
          onCreateWorkspace={createWorkspace}
          onOpenProject={handleOpenProject}
        />
      );
    }

    const mergedIssues = getMergedIssues(issues);
    const filteredIssues = getFilteredIssues(mergedIssues);
    console.log('Final filtered issues count:', filteredIssues.length, 'for view:', currentView);
    
    switch (currentView) {
      case 'views':
        return (
          <ViewsView 
            views={views}
            issues={filteredIssues}
            goals={goals}
            releases={releases}
            teams={teams}
            onViewCreate={createView}
            onViewUpdate={updateView}
            onViewDelete={deleteView}
            onIssueCreate={handleIssueCreate}
            onIssueUpdate={handleIssueUpdate}
            onIssueDelete={handleIssueDelete}
            onIssueStatusChange={handleIssueStatusChange}
          />
        );
      case 'teams':
        return (
          <TeamsView
            teams={teams}
            currentTeam={safeCurrentTeam}
            onTeamChange={handleTeamChange}
            onTeamCreate={createTeam}
            onTeamUpdate={updateTeam}
            onTeamDelete={deleteTeam}
          />
        );
      case 'goals':
        return (
          <div className="p-6">
            <h2>Goals View - Coming Soon</h2>
            <p>Goals functionality will be available in a future update.</p>
          </div>
        );

      default:
        return (
          <IssuesViewSimple 
            issues={filteredIssues}
            goals={goals}
            releases={releases}
            teams={teams}
            projects={projects}
            selectedProject={selectedProject}
            onIssueCreate={handleIssueCreate}
            onIssueUpdate={handleIssueUpdate}
            onIssueDelete={handleIssueDelete}
            onIssueStatusChange={handleIssueStatusChange}
            onProjectCreate={createProject}
          />
        );
    }
  };

  return (
    <ThemeProvider>
      <div className="h-screen bg-background text-foreground flex">
        {/* Show sidebar and navigation only if projects exist */}
        {projects.length > 0 && (
          <SidebarHierarchical 
            collapsed={sidebarCollapsed}
            currentView={currentView}
            currentTeam={safeCurrentTeam}
            teams={teams}
            projects={projects}
            goals={goals}
            releases={releases}
            views={views}
            onToggle={() => setSidebarCollapsed(!sidebarCollapsed)}
            onNavigate={handleNavigationChange}
            onTeamChange={handleTeamChange}
            onTeamCreate={handleTeamCreate}
            onTeamUpdate={handleTeamUpdate}
            onTeamDelete={handleTeamDelete}
            onImportIssues={() => setImportModalOpen(true)}
            onSettingsClick={() => setSettingsOpen(true)}
          />
        )}
        
        <div className="flex-1 flex flex-col min-w-0">
          {/* Show top navigation only if projects exist */}
          {projects.length > 0 && (
            <TopNavigation 
              currentView={currentView}
              projects={projects}
              selectedProject={selectedProject}
              onProjectChange={setSelectedProject}
            />
          )}
          
          <div className="flex-1 flex min-h-0">
            <div className="flex-1 min-w-0">
              {renderMainContent()}
            </div>
          </div>
        </div>

        <FilterModal
          open={filterOpen}
          onOpenChange={setFilterOpen}
          filters={filters}
          onFiltersChange={handleFilterChange}
          issues={issues}
          projects={projects}
        />

        <ImportModal
          open={importModalOpen}
          onOpenChange={setImportModalOpen}
          onImport={handleImportIssues}
        />

        <WorkspaceSettingsModal
          open={workspaceSettingsOpen}
          onOpenChange={setWorkspaceSettingsOpen}
          workspace={safeCurrentWorkspace}
          onWorkspaceUpdate={handleWorkspaceChange}
        />

        <SettingsModal
          open={settingsOpen}
          onOpenChange={setSettingsOpen}
        />
      </div>
    </ThemeProvider>
  );
}