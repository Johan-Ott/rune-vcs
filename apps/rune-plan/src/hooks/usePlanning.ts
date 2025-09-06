import { useState, useEffect, useCallback } from 'react';
import { planningAPI, Plan, CreatePlanRequest, planToIssue } from '../lib/planning-api';
import { Issue } from '../types';

export function usePlanning() {
  const [issues, setIssues] = useState<Issue[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Initialize the planning store
  const initStore = useCallback(async () => {
    try {
      await planningAPI.initStore();
    } catch (err) {
      console.error('Failed to initialize planning store:', err);
      setError(err instanceof Error ? err.message : 'Failed to initialize planning store');
    }
  }, []);

  // Load all plans and convert to issues
  const loadIssues = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      
      const plans = await planningAPI.loadAllPlans();
      const convertedIssues = plans.map(planToIssue);
      setIssues(convertedIssues);
    } catch (err) {
      console.error('Failed to load issues:', err);
      setError(err instanceof Error ? err.message : 'Failed to load issues');
    } finally {
      setLoading(false);
    }
  }, []);

  // Create a new issue
  const createIssue = useCallback(async (issueData: CreatePlanRequest): Promise<Issue | null> => {
    try {
      setError(null);
      
      const plan = await planningAPI.createPlan(issueData);
      const newIssue = planToIssue(plan);
      
      setIssues(prev => [...prev, newIssue]);
      return newIssue;
    } catch (err) {
      console.error('Failed to create issue:', err);
      setError(err instanceof Error ? err.message : 'Failed to create issue');
      return null;
    }
  }, []);

  // Update issue status
  const updateIssueStatus = useCallback(async (issueId: string, status: Issue['status']): Promise<void> => {
    try {
      setError(null);
      
      // Map frontend status to Rust status
      const statusMapping: Record<Issue['status'], Plan['status']> = {
        'todo': 'planned',
        'in-progress': 'in-progress', 
        'done': 'done',
        'backlog': 'blocked',
        'cancelled': 'blocked'
      };

      const rustStatus = statusMapping[status];
      const updatedPlan = await planningAPI.updatePlanStatus(issueId, rustStatus);
      const updatedIssue = planToIssue(updatedPlan);

      setIssues(prev => prev.map(issue => 
        issue.id === issueId ? updatedIssue : issue
      ));
    } catch (err) {
      console.error('Failed to update issue status:', err);
      setError(err instanceof Error ? err.message : 'Failed to update issue status');
    }
  }, []);

  // Initialize store and load issues on mount
  useEffect(() => {
    const init = async () => {
      await initStore();
      await loadIssues();
    };

    init();
  }, [initStore, loadIssues]);

  return {
    issues,
    loading,
    error,
    createIssue,
    updateIssueStatus,
    refreshIssues: loadIssues,
    clearError: () => setError(null)
  };
}
