/**
 * NoCode modunun yaşam döngüsünü yöneten merkez servis.
 * UI görünürlüğü, editör dekorasyonu, webview ve Copilot davranışları burada orkestre edilir.
 */

import * as vscode from 'vscode';
import { DecorationManager } from './decorationManager';
import { NotificationService } from './notificationService';
import { AppStateStore } from './state';
import { StatusBarManager } from './statusBarManager';
import { NoCodeDashboardProvider } from './webviewProvider';
import { AppMode, CopilotInteraction, CopilotVisibility, NotificationPriority } from './types';

export class NoCodeManager implements vscode.Disposable {
  private readonly disposables: vscode.Disposable[] = [];

  public constructor(
    private readonly stateStore: AppStateStore,
    private readonly decorationManager: DecorationManager,
    private readonly dashboardProvider: NoCodeDashboardProvider,
    private readonly statusBarManager: StatusBarManager,
    private readonly notificationService: NotificationService,
  ) {}

  /** Başlangıç state'ini uygular ve event aboneliklerini açar. */
  public async initialize(): Promise<void> {
    this.disposables.push(
      this.stateStore.subscribe((state, changedKey) => {
        this.statusBarManager.render(state);
        this.dashboardProvider.refresh();

        if (changedKey === 'copilotInteraction' && state.copilotInteraction !== CopilotInteraction.Idle) {
          void this.revealForCopilotAttention();
        }
      }),
      vscode.window.onDidChangeVisibleTextEditors(() => {
        if (this.stateStore.getState().mode === AppMode.NoCode) {
          this.decorationManager.applyToVisibleEditors();
        }
      }),
      vscode.window.onDidChangeActiveTextEditor((editor: vscode.TextEditor | undefined) => {
        if (editor && this.stateStore.getState().mode === AppMode.NoCode) {
          this.decorationManager.hideEditorContent(editor);
        }
      }),
    );

    this.statusBarManager.render(this.stateStore.getState());

    if (this.stateStore.getState().mode === AppMode.NoCode) {
      await this.enableNoCodeMode(false);
      return;
    }

    await this.disableNoCodeMode(false);
  }

  /** NoCode ve normal mod arasında toggle yapar. */
  public async toggleMode(): Promise<void> {
    const currentMode = this.stateStore.getState().mode;
    if (currentMode === AppMode.NoCode) {
      await this.disableNoCodeMode(true);
      return;
    }

    await this.enableNoCodeMode(true);
  }

  /** Belirli URL'i NoCode browser içinde açar. */
  public async openUrl(url: string): Promise<void> {
    await this.dashboardProvider.openUrl(url);
  }

  /** Copilot paneli için görünürlük davranışını toggle eder. */
  public async toggleCopilotVisibility(): Promise<void> {
    const current = this.stateStore.getState().copilotVisibility;
    const next = current === CopilotVisibility.Hidden ? CopilotVisibility.Visible : CopilotVisibility.Hidden;
    await this.stateStore.setCopilotVisibility(next);

    if (next === CopilotVisibility.Hidden) {
      await this.hideCopilotSurface();
    } else {
      await this.revealCopilotSurface();
    }
  }

  /**
   * Copilot kullanıcı girdisi istediğinde veya görünür olduğunda NoCode perdesini kaldırır.
   * Bu mekanizma tam API olmadığı için best-effort çalışır.
   */
  public async revealForCopilotAttention(): Promise<void> {
    const state = this.stateStore.getState();
    if (state.mode !== AppMode.NoCode) {
      return;
    }

    await this.disableNoCodeMode(false);
    await this.revealCopilotSurface();

    await this.notificationService.show({
      title: 'Copilot Visible',
      message: 'Copilot etkileşimi icin normal gorunume gecildi.',
      priority: NotificationPriority.High,
      actions: ['Tamam'],
    });
  }

  public dispose(): void {
    for (const disposable of this.disposables) {
      disposable.dispose();
    }
  }

  private async enableNoCodeMode(showNotification: boolean): Promise<void> {
    await this.stateStore.setMode(AppMode.NoCode);
    this.decorationManager.applyToVisibleEditors();
    await this.hideWorkbenchNoise();
    await this.dashboardProvider.revealDashboard();
    await this.dashboardProvider.openUrl(this.stateStore.getState().currentUrl);

    if (this.stateStore.getState().copilotVisibility === CopilotVisibility.Hidden) {
      await this.hideCopilotSurface();
    }

    if (showNotification) {
      await this.notificationService.show({
        title: 'NoCode Zone',
        message: 'Kod gorunumu gizlendi. Dashboard aktif.',
        priority: NotificationPriority.Medium,
      });
    }
  }

  private async disableNoCodeMode(showNotification: boolean): Promise<void> {
    await this.stateStore.setMode(AppMode.Normal);
    this.decorationManager.revealVisibleEditors();

    if (showNotification) {
      await this.notificationService.show({
        title: 'NoCode Zone',
        message: 'Normal VS Code gorunumu geri yüklendi.',
        priority: NotificationPriority.Low,
      });
    }
  }

  /** Dikkat dağıtan UI katmanlarını minimize eder. */
  private async hideWorkbenchNoise(): Promise<void> {
    await vscode.commands.executeCommand('workbench.action.closeSidebar');
    await vscode.commands.executeCommand('workbench.action.closePanel');
    await vscode.commands.executeCommand('workbench.action.closeAuxiliaryBar');
  }

  /** Copilot/chat tarafını gizlemek için mevcut public command'ları kullanır. */
  private async hideCopilotSurface(): Promise<void> {
    await vscode.commands.executeCommand('workbench.action.closeAuxiliaryBar');
    await vscode.commands.executeCommand('workbench.action.closePanel');
  }

  /** Copilot/chat tarafını olabildiğince görünür hale getirir. */
  private async revealCopilotSurface(): Promise<void> {
    try {
      await vscode.commands.executeCommand('workbench.action.chat.open');
    } catch (error) {
      await this.notificationService.show({
        title: 'Copilot Command',
        message: `Copilot chat acilamadi: ${error instanceof Error ? error.message : 'bilinmeyen hata'}`,
        priority: NotificationPriority.Low,
      });
    }
  }
}
