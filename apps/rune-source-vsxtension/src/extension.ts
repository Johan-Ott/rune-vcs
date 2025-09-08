import * as vscode from 'vscode';
import { RuneApiClient } from './api';
import { ChangesProvider, HistoryProvider, BranchesProvider } from './providers';
import { CommandHandler } from './commands';

export function activate(context: vscode.ExtensionContext) {
    console.log('🔮 Activating Rune VCS Extension...');

    // Initialize components
    const apiClient = new RuneApiClient();
    const changesProvider = new ChangesProvider(apiClient);
    const historyProvider = new HistoryProvider(apiClient);
    const branchesProvider = new BranchesProvider(apiClient);

    // Create tree views
    const changesView = vscode.window.createTreeView('rune-changes', {
        treeDataProvider: changesProvider,
        showCollapseAll: true,
        canSelectMany: true
    });

    const historyView = vscode.window.createTreeView('rune-history', {
        treeDataProvider: historyProvider,
        showCollapseAll: false
    });

    const branchesView = vscode.window.createTreeView('rune-branches', {
        treeDataProvider: branchesProvider,
        showCollapseAll: false
    });

    const planView = vscode.window.createTreeView('rune-plan', {
        treeDataProvider: branchesProvider,
        showCollapseAll: false
    });

    // Refresh function
    const refreshAll = () => {
        changesProvider.refresh();
        historyProvider.refresh();
        branchesProvider.refresh();
    };

    // Register commands
    const commandHandler = new CommandHandler(apiClient, refreshAll);
    commandHandler.registerCommands(context);

    // Add views to subscriptions
    context.subscriptions.push(changesView, historyView, branchesView);

    console.log('✅ Rune VCS Extension activated successfully!');

    // Initial refresh
    refreshAll();
}

export function deactivate() {
    console.log('🔮 Rune VCS Extension deactivated');
}
