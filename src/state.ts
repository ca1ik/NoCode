/**
 * Merkezi state store.
 * Extension genelindeki durum tek kaynaktan yönetilir.
 */

import * as vscode from 'vscode';
import {
  AppMode,
  AppState,
  CopilotInteraction,
  CopilotVisibility,
  StateChangeListener,
  ThemeName,
} from './types';

const STATE_KEY = 'nocodeZone.state';

/**
 * AppStateStore tüm state mutasyonlarını tip güvenli ve gözlemlenebilir şekilde yönetir.
 * Tek sorumluluğu durum depolamak ve değişiklikleri yayınlamaktır.
 */
export class AppStateStore {
  private state: AppState;

  private readonly listeners = new Set<StateChangeListener>();

  public constructor(private readonly context: vscode.ExtensionContext) {
    this.state = this.loadInitialState();
  }

  /** Geçerli immutable state snapshot döner. */
  public getState(): Readonly<AppState> {
    return Object.freeze({ ...this.state });
  }

  /** Mode günceller ve değişikliği kalıcı saklar. */
  public async setMode(mode: AppMode): Promise<void> {
    await this.updateState('mode', mode);
    await vscode.commands.executeCommand('setContext', 'nocodeZone.active', mode === AppMode.NoCode);
  }

  /** Copilot görünürlüğünü günceller. */
  public async setCopilotVisibility(visibility: CopilotVisibility): Promise<void> {
    await this.updateState('copilotVisibility', visibility);
  }

  /** Copilot etkileşim durumunu günceller. */
  public async setCopilotInteraction(interaction: CopilotInteraction): Promise<void> {
    await this.updateState('copilotInteraction', interaction);
  }

  /** WebView açık/kapalı durumunu günceller. */
  public async setWebViewOpen(isWebViewOpen: boolean): Promise<void> {
    await this.updateState('isWebViewOpen', isWebViewOpen);
  }

  /** Aktif URL'i günceller. */
  public async setCurrentUrl(currentUrl: string): Promise<void> {
    await this.updateState('currentUrl', currentUrl);
  }

  /** Aktif temayı günceller. */
  public async setTheme(activeTheme: ThemeName): Promise<void> {
    await this.updateState('activeTheme', activeTheme);
  }

  /** Listener ekler ve dispose fonksiyonu döner. */
  public subscribe(listener: StateChangeListener): vscode.Disposable {
    this.listeners.add(listener);

    return new vscode.Disposable(() => {
      this.listeners.delete(listener);
    });
  }

  private loadInitialState(): AppState {
    const savedState = this.context.globalState.get<AppState>(STATE_KEY);
    const configuration = vscode.workspace.getConfiguration('nocodeZone');
    const defaultMode = configuration.get<string>('defaultMode', AppMode.NoCode) as AppMode;
    const defaultTheme = configuration.get<ThemeName>('theme', 'midnight');

    return savedState ?? {
      mode: defaultMode,
      copilotVisibility: configuration.get<boolean>('hideCopilot', false)
        ? CopilotVisibility.Hidden
        : CopilotVisibility.Visible,
      copilotInteraction: CopilotInteraction.Idle,
      isWebViewOpen: false,
      currentUrl: configuration.get<string>('homepageUrl', 'https://www.youtube.com'),
      activeTheme: defaultTheme,
    };
  }

  /**
   * State güncellemesini atomik yapar, storage'a yazar ve observer'ları bilgilendirir.
   * Gereksiz notify'ı önlemek için değişmeyen değerlerde erken çıkar.
   */
  private async updateState<Key extends keyof AppState>(key: Key, value: AppState[Key]): Promise<void> {
    if (this.state[key] === value) {
      return;
    }

    this.state = {
      ...this.state,
      [key]: value,
    };

    await this.context.globalState.update(STATE_KEY, this.state);

    for (const listener of this.listeners) {
      listener(this.getState(), key);
    }
  }
}
