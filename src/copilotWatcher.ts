/**
 * Copilot görünürlüğünü ve etkileşim durumunu algılamak için event tabanlı izleyici.
 * VS Code API doğrudan Copilot state vermediği için güvenli heuristics kullanılır.
 */

import * as vscode from 'vscode';
import { AppStateStore } from './state';
import { CopilotInteraction, CopilotVisibility } from './types';
import { NotificationService } from './notificationService';
import { NotificationPriority } from './types';

/**
 * Bunu yapabiliriz ama burada tam Copilot iç state erişimi mümkün değil.
 * VS Code public API buna izin vermediği için command/context/visible view heuristics kullanıyoruz.
 * Bu, bakım açısından illegal/private API hack'lerinden daha üstündür.
 */
export class CopilotWatcher implements vscode.Disposable {
  private readonly disposables: vscode.Disposable[] = [];

  public constructor(
    private readonly stateStore: AppStateStore,
    private readonly notificationService: NotificationService,
  ) {}

  /** Event subscription'larını başlatır. */
  public initialize(): void {
    this.disposables.push(
      vscode.window.onDidChangeVisibleTextEditors(async () => {
        await this.detectPotentialCopilotAttention();
      }),
      vscode.window.onDidChangeWindowState(async (windowState: vscode.WindowState) => {
        if (windowState.focused) {
          await this.detectPotentialCopilotAttention();
        }
      }),
      vscode.workspace.onDidChangeConfiguration(async (event: vscode.ConfigurationChangeEvent) => {
        if (event.affectsConfiguration('github.copilot') || event.affectsConfiguration('github.copilot.chat')) {
          await this.detectPotentialCopilotAttention();
        }
      }),
    );
  }

  /**
   * Public API sınırları içinde Copilot dikkat gerektiren durumları tahmin eder.
   * Kullanıcı etkileşimi istendiğinde auto-reveal zincirini tetikler.
   */
  public async detectPotentialCopilotAttention(): Promise<void> {
    const config = vscode.workspace.getConfiguration('nocodeZone');
    const autoReveal = config.get<boolean>('copilotAutoReveal', true);

    if (!autoReveal) {
      return;
    }

    const chatViewVisible = vscode.window.tabGroups.all.some((group: vscode.TabGroup) =>
      group.tabs.some((tab: vscode.Tab) => String(tab.label).toLowerCase().includes('copilot')),
    );

    if (chatViewVisible) {
      await this.stateStore.setCopilotInteraction(CopilotInteraction.Question);
      await this.stateStore.setCopilotVisibility(CopilotVisibility.Visible);

      await this.notificationService.show({
        title: 'Copilot Attention',
        message: 'Copilot görünür durumda ve etkileşim bekliyor olabilir.',
        priority: NotificationPriority.Medium,
      });
    }
  }

  public dispose(): void {
    for (const disposable of this.disposables) {
      disposable.dispose();
    }
  }
}
