// Legacy VCS Hook - Updated to use new service architecture
// This hook maintains backward compatibility while using the optimized VCS context

import { useState, useEffect } from 'react';
import { VCSState, VCSFile, VCSCommit, VCSBranch, Plan, Task, Changelist } from '../types/vcs';
import { useVCS as useVCSContext } from '../contexts/VCSContext';
import { useFileOperations, useCommitOperations, useBranchOperations } from './useVCSOperations';

// Mock data for demonstration
const mockVCSState: VCSState = {
  branch: {
    name: 'main',
    current: true,
    ahead: 2,
    behind: 1,
    lastCommit: {
      hash: 'a1b2c3d',
      message: 'Add Nordic glassmorphism styling',
      author: 'John Doe',
      date: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      files: ['styles/globals.css', 'components/Header.tsx']
    }
  },
  branches: [
    {
      name: 'main',
      current: true,
      ahead: 2,
      behind: 1,
    },
    {
      name: 'feature/vcs-integration',
      current: false,
      ahead: 0,
      behind: 3,
    },
    {
      name: 'feature/plans-system',
      current: false,
      ahead: 1,
      behind: 0,
    }
  ],
  files: [], // Files are now organized in changelists
  staged: [],
  commits: [
    {
      hash: 'a1b2c3d',
      message: 'Add Nordic glassmorphism styling',
      author: 'John Doe',
      date: new Date(Date.now() - 2 * 60 * 60 * 1000),
      files: ['styles/globals.css', 'components/Header.tsx']
    },
    {
      hash: 'e4f5g6h',
      message: 'Implement file explorer with tree view',
      author: 'John Doe',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000),
      files: ['components/FileExplorer.tsx', 'components/Sidebar.tsx']
    },
    {
      hash: 'i7j8k9l',
      message: 'Initial commit with project structure',
      author: 'John Doe',
      date: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      files: ['App.tsx', 'package.json', 'README.md']
    }
  ],
  stashes: [
    {
      id: 'stash-1',
      message: 'Work in progress on feature branch',
      branch: 'feature/vcs-integration',
      date: new Date(Date.now() - 2 * 60 * 60 * 1000),
      files: ['components/Header.tsx', 'components/Sidebar.tsx']
    },
    {
      id: 'stash-2',
      message: 'Temporary changes before branch switch',
      branch: 'main',
      date: new Date(Date.now() - 24 * 60 * 60 * 1000),
      files: ['App.tsx']
    }
  ],
  changelists: [
    {
      id: 'default',
      name: 'Default',
      description: 'Default changelist for all changes',
      files: [
        {
          path: 'components/vcs/VCSStatusIndicator.tsx',
          name: 'VCSStatusIndicator.tsx',
          status: 'added',
          diff: `@@ -0,0 +1,124 @@
+import React from 'react';
+import { GitBranch } from 'lucide-react';
+
+export function VCSStatusIndicator() {
+  return (
+    <div>Status</div>
+  );
+}`
        },
        {
          path: 'components/vcs/FileDiffViewer.tsx',
          name: 'FileDiffViewer.tsx',
          status: 'modified',
          diff: `@@ -45,7 +45,9 @@
   const diffLines = parseDiff(file.diff || mockDiff);
 
   const getStatusColor = (status: VCSFile['status']) => {
+    // Updated color scheme for Nordic theme
     switch (status) {
       case 'modified': return 'text-yellow-400';
+      case 'staged': return 'text-blue-400';
       default: return 'text-gray-400';
     }
   };`
        }
      ],
      isDefault: true,
      isStashed: false,
      author: 'John Doe',
      lastModified: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      color: 'rgba(59, 130, 246, 0.1)'
    },
    {
      id: 'feature-work',
      name: 'Feature Work',
      description: 'Working on new features',
      files: [
        {
          path: 'README.md',
          name: 'README.md',
          status: 'deleted',
          diff: `@@ -1,8 +0,0 @@
-# Nordic Explorer
-
-A modern file explorer with version control integration.
-
-## Features
-
-- Glassmorphism UI
-- VCS Support`
        }
      ],
      isDefault: false,
      isStashed: false,
      author: 'John Doe',
      lastModified: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      color: 'rgba(34, 197, 94, 0.1)'
    },
    {
      id: 'experimental',
      name: 'Experimental',
      description: 'Experimental changes to try later',
      files: [
        {
          path: 'temp-notes.txt',
          name: 'temp-notes.txt',
          status: 'untracked',
        }
      ],
      isDefault: false,
      isStashed: true,
      author: 'John Doe',
      lastModified: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
      color: 'rgba(147, 51, 234, 0.1)'
    }
  ],
  hasChangesToPush: true,
  hasChangesToPull: true
};

const mockPlans: Plan[] = [
  {
    id: '1',
    title: 'Implement VCS Integration',
    description: 'Add comprehensive version control support with Rune integration',
    status: 'in-progress',
    priority: 'high',
    assignee: 'John Doe',
    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
    tasks: [
      {
        id: '1a',
        title: 'Create VCS status indicators',
        completed: true,
        createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000)
      },
      {
        id: '1b',
        title: 'Build file diff viewer',
        completed: true,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      },
      {
        id: '1c',
        title: 'Add commit dialog',
        completed: false,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      },
      {
        id: '1d',
        title: 'Implement stash management',
        completed: false,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
      }
    ],
    createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 1 * 60 * 60 * 1000)
  },
  {
    id: '2',
    title: 'UI Polish & Animations',
    description: 'Enhance the Nordic glassmorphism theme with smooth animations',
    status: 'todo',
    priority: 'medium',
    dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    tasks: [
      {
        id: '2a',
        title: 'Add micro-interactions',
        completed: false,
        createdAt: new Date()
      },
      {
        id: '2b',
        title: 'Improve hover states',
        completed: false,
        createdAt: new Date()
      }
    ],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
  }
];

export function useVCS() {
  // Use new VCS context for core functionality
  const vcsContext = useVCSContext();
  const fileOps = useFileOperations();
  const commitOps = useCommitOperations();
  const branchOps = useBranchOperations();

  // Legacy state management for plans (these could be moved to a separate context)
  const [plans, setPlans] = useState<Plan[]>(mockPlans);
  const [selectedFile, setSelectedFile] = useState<VCSFile | undefined>();

  // Transform new data structure to legacy format for backward compatibility
  const vcsState: VCSState = {
    branch: {
      name: branchOps.activeBranch?.name || 'main',
      current: true,
      ahead: branchOps.activeBranch?.ahead || 0,
      behind: branchOps.activeBranch?.behind || 0,
      lastCommit: vcsContext.state.commits[0] || {
        hash: 'unknown',
        message: 'No commits',
        author: 'Unknown',
        date: new Date(),
        files: []
      }
    },
    branches: vcsContext.state.branches.map(branch => ({
      name: branch.name,
      current: branch.isActive,
      ahead: branch.ahead,
      behind: branch.behind
    })),
    files: [],
    staged: vcsContext.state.files.filter(f => f.status === 'staged').map(f => ({
      path: f.path,
      name: f.name,
      status: f.status as any
    })),
    commits: vcsContext.state.commits,
    stashes: [], // Could be implemented later
    changelists: vcsContext.state.changelists.map(cl => ({
      id: cl.id,
      name: cl.name,
      description: cl.description,
      files: cl.files.map(f => ({
        path: f.path,
        name: f.name,
        status: f.status as any,
        diff: f.content || ''
      })),
      isDefault: cl.id === 'default',
      isStashed: cl.status === 'shelved',
      author: cl.author,
      lastModified: new Date(cl.created),
      color: 'rgba(59, 130, 246, 0.1)'
    })),
    hasChangesToPush: branchOps.activeBranch?.ahead ? branchOps.activeBranch.ahead > 0 : false,
    hasChangesToPull: branchOps.activeBranch?.behind ? branchOps.activeBranch.behind > 0 : false
  };

  // Updated methods to use new service architecture
  const stageFile = async (path: string) => {
    await vcsContext.stageFile(path);
  };

  const unstageFile = async (path: string) => {
    await vcsContext.unstageFile(path);
  };

  const discardChanges = (path: string) => {
    setVCSState(prev => {
      // Remove file from all changelists
      const updatedChangelists = prev.changelists.map(changelist => ({
        ...changelist,
        files: changelist.files.filter(f => f.path !== path),
        lastModified: changelist.files.some(f => f.path === path) ? new Date() : changelist.lastModified
      }));

      return {
        ...prev,
        changelists: updatedChangelists
      };
    });
  };

  const commit = async (message: string, description?: string) => {
    const stagedFiles = vcsState.staged.map(f => f.path);
    await commitOps.commitChanges(message, stagedFiles);
  };

  const createPlan = (planData: Omit<Plan, 'id' | 'createdAt' | 'updatedAt'>) => {
    const newPlan: Plan = {
      ...planData,
      id: Math.random().toString(36).substr(2, 9),
      createdAt: new Date(),
      updatedAt: new Date()
    };
    setPlans(prev => [newPlan, ...prev]);
  };

  const updatePlan = (id: string, updates: Partial<Plan>) => {
    setPlans(prev => prev.map(plan => 
      plan.id === id 
        ? { ...plan, ...updates, updatedAt: new Date() }
        : plan
    ));
  };

  const deletePlan = (id: string) => {
    setPlans(prev => prev.filter(plan => plan.id !== id));
  };

  const toggleTask = (planId: string, taskId: string) => {
    setPlans(prev => prev.map(plan => 
      plan.id === planId 
        ? {
            ...plan,
            tasks: plan.tasks.map(task =>
              task.id === taskId
                ? { ...task, completed: !task.completed }
                : task
            ),
            updatedAt: new Date()
          }
        : plan
    ));
  };

  // Changelist management functions
  const createChangelist = async (name: string, description: string) => {
    await vcsContext.createChangelist(name, description);
  };

  const updateChangelist = (id: string, updates: Partial<Changelist>) => {
    setVCSState(prev => ({
      ...prev,
      changelists: prev.changelists.map(changelist =>
        changelist.id === id
          ? { ...changelist, ...updates, lastModified: new Date() }
          : changelist
      )
    }));
  };

  const deleteChangelist = (id: string) => {
    setVCSState(prev => {
      const changelist = prev.changelists.find(c => c.id === id);
      if (!changelist || changelist.isDefault) return prev;

      // Move files back to default changelist
      const defaultChangelist = prev.changelists.find(c => c.isDefault);
      if (defaultChangelist) {
        const updatedChangelists = prev.changelists.map(c =>
          c.isDefault
            ? { ...c, files: [...c.files, ...changelist.files] }
            : c
        ).filter(c => c.id !== id);

        return {
          ...prev,
          changelists: updatedChangelists
        };
      }

      return {
        ...prev,
        changelists: prev.changelists.filter(c => c.id !== id)
      };
    });
  };

  const stashChangelist = (id: string) => {
    updateChangelist(id, { isStashed: true });
  };

  const unstashChangelist = (id: string) => {
    updateChangelist(id, { isStashed: false });
  };

  const moveFileToChangelist = (fileId: string, changelistId: string) => {
    setVCSState(prev => {
      const updatedChangelists = prev.changelists.map(changelist => {
        // Remove file from all changelists
        const filesWithoutTarget = changelist.files.filter(f => f.path !== fileId);
        
        // Add file to target changelist
        if (changelist.id === changelistId) {
          const fileToMove = prev.changelists
            .flatMap(c => c.files)
            .find(f => f.path === fileId);
          
          if (fileToMove) {
            return {
              ...changelist,
              files: [...filesWithoutTarget, fileToMove],
              lastModified: new Date()
            };
          }
        }
        
        return { ...changelist, files: filesWithoutTarget };
      });

      return {
        ...prev,
        changelists: updatedChangelists
      };
    });
  };

  return {
    vcsState,
    plans,
    selectedFile,
    setSelectedFile,
    stageFile,
    unstageFile,
    discardChanges,
    commit,
    createPlan,
    updatePlan,
    deletePlan,
    toggleTask,
    // Changelist functions
    createChangelist,
    updateChangelist,
    deleteChangelist,
    stashChangelist,
    unstashChangelist,
    moveFileToChangelist
  };
}