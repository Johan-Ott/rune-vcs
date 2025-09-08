import * as vscode from 'vscode';
import { RuneApiClient } from './api';
import { FileItem } from './models';

export class CommandHandler {
    constructor(
        private apiClient: RuneApiClient,
        private refreshCallback: () => void
    ) {}

    registerCommands(context: vscode.ExtensionContext): void {
        const commands = [
            vscode.commands.registerCommand('rune-vcs.refresh', () => {
                console.log('🔄 Refreshing all views...');
                this.refreshCallback();
            }),

            vscode.commands.registerCommand('rune-vcs.commit', async () => {
                await this.handleCommit();
            }),

            vscode.commands.registerCommand('rune-vcs.stage', async (item: FileItem) => {
                if (item?.change?.path) {
                    await this.handleStageFile(item.change.path);
                }
            }),

            vscode.commands.registerCommand('rune-vcs.unstage', async (item: FileItem) => {
                if (item?.change?.path) {
                    await this.handleUnstageFile(item.change.path);
                }
            }),

            vscode.commands.registerCommand('rune-vcs.discard', async (item: FileItem) => {
                if (item?.change?.path) {
                    await this.handleDiscardFile(item.change.path);
                }
            }),

            vscode.commands.registerCommand('rune-vcs.stageAll', async () => {
                await this.handleStageAll();
            }),

            vscode.commands.registerCommand('rune-vcs.unstageAll', async () => {
                await this.handleUnstageAll();
            }),

            vscode.commands.registerCommand('rune-vcs.push', async () => {
                await this.handlePush();
            }),

            vscode.commands.registerCommand('rune-vcs.pull', async () => {
                await this.handlePull();
            })
        ];

        context.subscriptions.push(...commands);
    }

    private async handleCommit(): Promise<void> {
        const message = await vscode.window.showInputBox({
            prompt: 'Enter commit message',
            placeHolder: 'Commit message...'
        });

        if (!message?.trim()) {
            vscode.window.showErrorMessage('Commit message cannot be empty');
            return;
        }

        const success = await this.apiClient.commit(message);
        if (success) {
            vscode.window.showInformationMessage(`✅ Committed: "${message}"`);
            this.refreshCallback();
        } else {
            vscode.window.showErrorMessage('Failed to commit changes');
        }
    }

    private async handleStageFile(path: string): Promise<void> {
        const success = await this.apiClient.stageFile(path);
        if (success) {
            vscode.window.showInformationMessage(`✅ Staged: ${path}`);
            this.refreshCallback();
        } else {
            vscode.window.showErrorMessage(`Failed to stage: ${path}`);
        }
    }

    private async handleUnstageFile(path: string): Promise<void> {
        const success = await this.apiClient.unstageFile(path);
        if (success) {
            vscode.window.showInformationMessage(`✅ Unstaged: ${path}`);
            this.refreshCallback();
        } else {
            vscode.window.showErrorMessage(`Failed to unstage: ${path}`);
        }
    }

    private async handleDiscardFile(path: string): Promise<void> {
        const result = await vscode.window.showWarningMessage(
            `Discard changes to ${path}?`,
            'Discard',
            'Cancel'
        );

        if (result === 'Discard') {
            const success = await this.apiClient.discardFile(path);
            if (success) {
                vscode.window.showInformationMessage(`✅ Discarded: ${path}`);
                this.refreshCallback();
            } else {
                vscode.window.showErrorMessage(`Failed to discard: ${path}`);
            }
        }
    }

    private async handleStageAll(): Promise<void> {
        const success = await this.apiClient.stageAll();
        if (success) {
            vscode.window.showInformationMessage('✅ Staged all changes');
            this.refreshCallback();
        } else {
            vscode.window.showErrorMessage('Failed to stage all changes');
        }
    }

    private async handleUnstageAll(): Promise<void> {
        const success = await this.apiClient.unstageAll();
        if (success) {
            vscode.window.showInformationMessage('✅ Unstaged all changes');
            this.refreshCallback();
        } else {
            vscode.window.showErrorMessage('Failed to unstage all changes');
        }
    }

    private async handlePush(): Promise<void> {
        const success = await this.apiClient.push();
        if (success) {
            vscode.window.showInformationMessage('✅ Pushed changes');
            this.refreshCallback();
        } else {
            vscode.window.showErrorMessage('Failed to push changes');
        }
    }

    private async handlePull(): Promise<void> {
        const success = await this.apiClient.pull();
        if (success) {
            vscode.window.showInformationMessage('✅ Pulled changes');
            this.refreshCallback();
        } else {
            vscode.window.showErrorMessage('Failed to pull changes');
        }
    }
}
