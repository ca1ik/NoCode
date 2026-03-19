/**
 * NoCode Zone extension entry point.
 * Tüm servisleri ayağa kaldırır ve command kayıtlarını yönetir.
 */

import * as vscode from 'vscode';
import { CopilotWatcher } from './copilotWatcher';
import { DecorationManager } from './decorationManager';
import { NoCodeManager } from './noCodeManager';
import { NotificationService } from './notificationService';
import { AppStateStore } from './state';
import { StatusBarManager } from './statusBarManager';
import { NoCodeDashboardProvider } from './webviewProvider';

export async function activate(context: vscode.ExtensionContext): Promise<void> {
  const stateStore = new AppStateStore(context);
  const decorationManager = new DecorationManager();
  const notificationService = new NotificationService();
  const statusBarManager = new StatusBarManager();
  const dashboardProvider = new NoCodeDashboardProvider(context, stateStore);
  const noCodeManager = new NoCodeManager(
    stateStore,
    decorationManager,
    dashboardProvider,
    statusBarManager,
    notificationService,
  );
  const copilotWatcher = new CopilotWatcher(stateStore, notificationService);

  context.subscriptions.push(
    decorationManager,
    statusBarManager,
    dashboardProvider,
    noCodeManager,
    copilotWatcher,
    vscode.window.registerWebviewViewProvider(NoCodeDashboardProvider.viewId, dashboardProvider),
    vscode.commands.registerCommand('nocodeZone.toggle', async () => {
      await noCodeManager.toggleMode();
    }),
    vscode.commands.registerCommand('nocodeZone.openBrowser', async () => {
      const url = await vscode.window.showInputBox({
        prompt: 'Acmak istediginiz URL',
        placeHolder: 'https://www.youtube.com',
        value: stateStore.getState().currentUrl,
        ignoreFocusOut: true,
      });

      if (!url) {
        return;
      }

      await noCodeManager.openUrl(url);
    }),
    vscode.commands.registerCommand('nocodeZone.openYouTube', async () => {
      await noCodeManager.openUrl('https://www.youtube.com');
    }),
    vscode.commands.registerCommand('nocodeZone.toggleCopilotVisibility', async () => {
      await noCodeManager.toggleCopilotVisibility();
    }),
    vscode.commands.registerCommand('nocodeZone.showSettings', async () => {
      await vscode.commands.executeCommand('workbench.action.openSettings', '@ext:nocode-studio.nocode-zone');
    }),
    vscode.commands.registerCommand('nocodeZone.focus', async () => {
      await vscode.commands.executeCommand('workbench.view.extension.nocodeZone');
    }),
  );

  copilotWatcher.initialize();
  await noCodeManager.initialize();
}

export function deactivate(): void {
  // VS Code subscription mekanizmasi tum disposable kaynaklari otomatik serbest birakir.
}
