import * as vscode from 'vscode';

export enum FileStatus {
    MODIFIED = 'M',
    ADDED = 'A', 
    DELETED = 'D',
    RENAMED = 'R',
    UNTRACKED = 'U'
}

export interface RuneFileChange {
    path: string;
    status: FileStatus;
    staged: boolean;
}

export interface RuneCommit {
    id: string;
    message: string;
    author: { name: string; email: string };
    time: number;
    files: string[];
}

export interface RuneBranch {
    name: string;
    current?: boolean;
}

export class FileItem extends vscode.TreeItem {
    constructor(
        public readonly change: RuneFileChange,
        collapsibleState: vscode.TreeItemCollapsibleState = vscode.TreeItemCollapsibleState.None
    ) {
        super(change.path, collapsibleState);
        
        this.description = this.getStatusText();
        this.tooltip = `${change.path} - ${this.getStatusText()}`;
        this.contextValue = change.staged ? 'staged-file' : 'unstaged-file';
        this.resourceUri = vscode.Uri.file(change.path);
        this.iconPath = this.getStatusIcon();
        
        // Open file on click
        this.command = {
            command: 'vscode.open',
            title: 'Open File',
            arguments: [this.resourceUri]
        };
    }

    private getStatusText(): string {
        switch (this.change.status) {
            case FileStatus.MODIFIED: return 'Modified';
            case FileStatus.ADDED: return 'Added';
            case FileStatus.DELETED: return 'Deleted';
            case FileStatus.RENAMED: return 'Renamed';
            case FileStatus.UNTRACKED: return 'Untracked';
            default: return 'Changed';
        }
    }

    private getStatusIcon(): vscode.ThemeIcon {
        switch (this.change.status) {
            case FileStatus.MODIFIED: return new vscode.ThemeIcon('diff-modified');
            case FileStatus.ADDED: return new vscode.ThemeIcon('diff-added');
            case FileStatus.DELETED: return new vscode.ThemeIcon('diff-removed');
            case FileStatus.RENAMED: return new vscode.ThemeIcon('diff-renamed');
            case FileStatus.UNTRACKED: return new vscode.ThemeIcon('question');
            default: return new vscode.ThemeIcon('diff-modified');
        }
    }
}

export class CommitItem extends vscode.TreeItem {
    constructor(public readonly commit: RuneCommit) {
        super(commit.id.substring(0, 8), vscode.TreeItemCollapsibleState.None);
        
        this.description = commit.message;
        this.tooltip = `${commit.message}\nBy: ${commit.author.name}\nFiles: ${commit.files.join(', ')}`;
        this.contextValue = 'commit';
        this.iconPath = new vscode.ThemeIcon('git-commit');
    }
}

export class BranchItem extends vscode.TreeItem {
    constructor(public readonly branch: RuneBranch) {
        super(branch.name, vscode.TreeItemCollapsibleState.None);
        
        this.description = branch.current ? 'Current' : '';
        this.tooltip = `Branch: ${branch.name}`;
        this.contextValue = branch.current ? 'current-branch' : 'branch';
        this.iconPath = new vscode.ThemeIcon('git-branch');
    }
}
