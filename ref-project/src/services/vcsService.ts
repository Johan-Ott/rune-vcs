// VCS Service Layer - Abstract interface for version control operations
// This service can be easily replaced with real API calls to Rune, Git, or Perforce

import { 
  MockRepository, 
  MockFile, 
  MockCommit, 
  MockBranch, 
  MockChangelist,
  mockRepositories,
  mockFiles,
  mockCommits,
  mockBranches,
  mockChangelists
} from '../data/mockData';

export interface VCSOperation {
  success: boolean;
  message: string;
  data?: any;
}

export interface CommitOptions {
  message: string;
  files: string[];
  author?: string;
  amend?: boolean;
}

export interface BranchOptions {
  name: string;
  fromBranch?: string;
  checkout?: boolean;
}

export interface MergeOptions {
  sourceBranch: string;
  targetBranch: string;
  strategy?: 'merge' | 'rebase' | 'squash';
}

// VCS Service Implementation (currently using mock data)
export class VCSService {
  private static instance: VCSService;
  private repositories: MockRepository[] = [...mockRepositories];
  private files: MockFile[] = [...mockFiles];
  private commits: MockCommit[] = [...mockCommits];
  private branches: MockBranch[] = [...mockBranches];
  private changelists: MockChangelist[] = [...mockChangelists];

  private constructor() {}

  static getInstance(): VCSService {
    if (!VCSService.instance) {
      VCSService.instance = new VCSService();
    }
    return VCSService.instance;
  }

  // Repository Operations
  async getRepositories(): Promise<MockRepository[]> {
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 300));
    return [...this.repositories];
  }

  async getRepository(id: string): Promise<MockRepository | null> {
    await new Promise(resolve => setTimeout(resolve, 100));
    return this.repositories.find(repo => repo.id === id) || null;
  }

  async cloneRepository(url: string, path: string): Promise<VCSOperation> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const newRepo: MockRepository = {
      id: `repo-${Date.now()}`,
      name: url.split('/').pop()?.replace('.git', '') || 'new-repo',
      path,
      branch: 'main',
      lastCommit: 'Just now',
      status: 'clean',
      remoteUrl: url
    };
    this.repositories.push(newRepo);
    return { success: true, message: 'Repository cloned successfully', data: newRepo };
  }

  // File Operations
  async getFiles(repositoryId: string, path?: string): Promise<MockFile[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    // Filter files by repository and path (simplified for mock)
    return [...this.files];
  }

  async getFileContent(filePath: string): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 150));
    const file = this.files.find(f => f.path === filePath);
    return file?.content || `// Content of ${filePath}\n// This is mock content`;
  }

  async getFileHistory(filePath: string): Promise<MockCommit[]> {
    await new Promise(resolve => setTimeout(resolve, 250));
    return this.commits.filter(commit => commit.files.includes(filePath));
  }

  async stageFile(filePath: string): Promise<VCSOperation> {
    await new Promise(resolve => setTimeout(resolve, 100));
    const file = this.files.find(f => f.path === filePath);
    if (file) {
      file.status = 'staged';
      return { success: true, message: `Staged ${filePath}` };
    }
    return { success: false, message: 'File not found' };
  }

  async unstageFile(filePath: string): Promise<VCSOperation> {
    await new Promise(resolve => setTimeout(resolve, 100));
    const file = this.files.find(f => f.path === filePath);
    if (file) {
      file.status = 'modified';
      return { success: true, message: `Unstaged ${filePath}` };
    }
    return { success: false, message: 'File not found' };
  }

  // Commit Operations
  async getCommits(repositoryId: string, branch?: string): Promise<MockCommit[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    if (branch) {
      return this.commits.filter(commit => commit.branch === branch);
    }
    return [...this.commits];
  }

  async commit(options: CommitOptions): Promise<VCSOperation> {
    await new Promise(resolve => setTimeout(resolve, 500));
    const newCommit: MockCommit = {
      id: `commit-${Date.now()}`,
      hash: Math.random().toString(36).substring(2, 10),
      message: options.message,
      author: options.author || 'Current User',
      date: new Date().toISOString(),
      branch: this.branches.find(b => b.isActive)?.name || 'main',
      files: [...options.files]
    };
    this.commits.unshift(newCommit);
    
    // Update file statuses after commit
    options.files.forEach(filePath => {
      const file = this.files.find(f => f.path === filePath);
      if (file && file.status === 'staged') {
        file.status = undefined; // Clean state after commit
      }
    });

    return { success: true, message: 'Changes committed successfully', data: newCommit };
  }

  async getCommitDiff(commitHash: string): Promise<string> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return `diff --git a/example.txt b/example.txt
index 1234567..abcdefg 100644
--- a/example.txt
+++ b/example.txt
@@ -1,4 +1,4 @@
 This is line 1
-This is the old line 2
+This is the new line 2
 This is line 3
 This is line 4`;
  }

  // Branch Operations
  async getBranches(repositoryId: string): Promise<MockBranch[]> {
    await new Promise(resolve => setTimeout(resolve, 200));
    return [...this.branches];
  }

  async createBranch(options: BranchOptions): Promise<VCSOperation> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const existingBranch = this.branches.find(b => b.name === options.name);
    if (existingBranch) {
      return { success: false, message: 'Branch already exists' };
    }

    const newBranch: MockBranch = {
      id: `branch-${Date.now()}`,
      name: options.name,
      isActive: options.checkout || false,
      lastCommit: 'Just created',
      ahead: 0,
      behind: 0
    };

    if (options.checkout) {
      this.branches.forEach(b => b.isActive = false);
      newBranch.isActive = true;
    }

    this.branches.push(newBranch);
    return { success: true, message: `Branch '${options.name}' created`, data: newBranch };
  }

  async switchBranch(branchName: string): Promise<VCSOperation> {
    await new Promise(resolve => setTimeout(resolve, 400));
    const branch = this.branches.find(b => b.name === branchName);
    if (!branch) {
      return { success: false, message: 'Branch not found' };
    }

    this.branches.forEach(b => b.isActive = false);
    branch.isActive = true;
    return { success: true, message: `Switched to branch '${branchName}'` };
  }

  async mergeBranch(options: MergeOptions): Promise<VCSOperation> {
    await new Promise(resolve => setTimeout(resolve, 800));
    // Simulate merge operation
    return { success: true, message: `Merged ${options.sourceBranch} into ${options.targetBranch}` };
  }

  async deleteBranch(branchName: string): Promise<VCSOperation> {
    await new Promise(resolve => setTimeout(resolve, 300));
    const branchIndex = this.branches.findIndex(b => b.name === branchName);
    if (branchIndex === -1) {
      return { success: false, message: 'Branch not found' };
    }
    if (this.branches[branchIndex].isActive) {
      return { success: false, message: 'Cannot delete active branch' };
    }

    this.branches.splice(branchIndex, 1);
    return { success: true, message: `Branch '${branchName}' deleted` };
  }

  // Changelist Operations (Perforce-style)
  async getChangelists(repositoryId: string): Promise<MockChangelist[]> {
    await new Promise(resolve => setTimeout(resolve, 250));
    return [...this.changelists];
  }

  async createChangelist(name: string, description: string): Promise<VCSOperation> {
    await new Promise(resolve => setTimeout(resolve, 200));
    const newChangelist: MockChangelist = {
      id: `cl-${Date.now()}`,
      name,
      description,
      files: [],
      author: 'Current User',
      created: new Date().toISOString(),
      status: 'pending'
    };
    this.changelists.push(newChangelist);
    return { success: true, message: 'Changelist created', data: newChangelist };
  }

  async submitChangelist(changelistId: string): Promise<VCSOperation> {
    await new Promise(resolve => setTimeout(resolve, 600));
    const changelist = this.changelists.find(cl => cl.id === changelistId);
    if (!changelist) {
      return { success: false, message: 'Changelist not found' };
    }
    changelist.status = 'submitted';
    return { success: true, message: 'Changelist submitted successfully' };
  }

  // Sync Operations
  async fetchChanges(repositoryId: string): Promise<VCSOperation> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, message: 'Fetched latest changes from remote' };
  }

  async pullChanges(repositoryId: string): Promise<VCSOperation> {
    await new Promise(resolve => setTimeout(resolve, 1200));
    return { success: true, message: 'Pulled and merged latest changes' };
  }

  async pushChanges(repositoryId: string, branch?: string): Promise<VCSOperation> {
    await new Promise(resolve => setTimeout(resolve, 1000));
    return { success: true, message: `Pushed changes to ${branch || 'current branch'}` };
  }

  // Status Operations
  async getRepositoryStatus(repositoryId: string): Promise<{
    branch: string;
    ahead: number;
    behind: number;
    staged: number;
    modified: number;
    untracked: number;
  }> {
    await new Promise(resolve => setTimeout(resolve, 150));
    const activeBranch = this.branches.find(b => b.isActive);
    const stagedFiles = this.files.filter(f => f.status === 'staged').length;
    const modifiedFiles = this.files.filter(f => f.status === 'modified').length;
    const untrackedFiles = this.files.filter(f => f.status === 'untracked').length;

    return {
      branch: activeBranch?.name || 'main',
      ahead: activeBranch?.ahead || 0,
      behind: activeBranch?.behind || 0,
      staged: stagedFiles,
      modified: modifiedFiles,
      untracked: untrackedFiles
    };
  }
}

// Export singleton instance
export const vcsService = VCSService.getInstance();