import * as vscode from 'vscode';
import { RuneApiClient } from './api';
import { FileItem, CommitItem, BranchItem, RuneFileChange, FileStatus } from './models';

export class ChangesProvider implements vscode.TreeDataProvider<FileItem> {
    private _onDidChangeTreeData = new vscode.EventEmitter<FileItem | undefined | null | void>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    constructor(private apiClient: RuneApiClient) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: FileItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: FileItem): Promise<FileItem[]> {
        if (element) return [];

        try {
            const data = await this.apiClient.getChanges();
            if (!data?.changelists?.[0]?.files) return [];

            return data.changelists[0].files.map((file: any) => 
                new FileItem({
                    path: file.path,
                    status: this.mapStatus(file.status),
                    staged: file.staged || false
                })
            );
        } catch (error) {
            console.error('Failed to get changes:', error);
            return [];
        }
    }

    private mapStatus(status: string): FileStatus {
        switch (status?.toLowerCase()) {
            case 'modified': return FileStatus.MODIFIED;
            case 'added': return FileStatus.ADDED;
            case 'deleted': return FileStatus.DELETED;
            case 'renamed': return FileStatus.RENAMED;
            default: return FileStatus.UNTRACKED;
        }
    }
}

export class HistoryProvider implements vscode.TreeDataProvider<CommitItem> {
    private _onDidChangeTreeData = new vscode.EventEmitter<CommitItem | undefined | null | void>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    constructor(private apiClient: RuneApiClient) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: CommitItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: CommitItem): Promise<CommitItem[]> {
        if (element) return [];

        try {
            const commits = await this.apiClient.getHistory();
            return commits.slice(0, 20).map(commit => new CommitItem(commit));
        } catch (error) {
            console.error('Failed to get history:', error);
            return [];
        }
    }
}

export class BranchesProvider implements vscode.TreeDataProvider<BranchItem> {
    private _onDidChangeTreeData = new vscode.EventEmitter<BranchItem | undefined | null | void>();
    readonly onDidChangeTreeData = this._onDidChangeTreeData.event;

    constructor(private apiClient: RuneApiClient) {}

    refresh(): void {
        this._onDidChangeTreeData.fire();
    }

    getTreeItem(element: BranchItem): vscode.TreeItem {
        return element;
    }

    async getChildren(element?: BranchItem): Promise<BranchItem[]> {
        if (element) return [];

        try {
            const status = await this.apiClient.getStatus();
            const branches = await this.apiClient.getBranches();
            const currentBranch = status?.branch?.replace('refs/heads/', '');

            return branches.map(branch => new BranchItem({
                name: typeof branch === 'string' ? branch : branch.name,
                current: (typeof branch === 'string' ? branch : branch.name) === currentBranch
            }));
        } catch (error) {
            console.error('Failed to get branches:', error);
            return [];
        }
    }
}
