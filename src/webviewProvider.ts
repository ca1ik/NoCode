/**
 * NoCode dashboard ve tarayıcı deneyimini sağlayan webview provider.
 * Embed edilemeyen siteler için güvenli fallback olarak external browser açılır.
 */

import * as vscode from 'vscode';
import { getThemePalette } from './themes';
import { AppStateStore } from './state';
import { AppMode, QuickLink } from './types';

const DASHBOARD_VIEW_ID = 'nocodeZone.dashboard';

interface DashboardMessage {
  readonly type: 'openUrl' | 'toggleMode' | 'openExternal' | 'refresh';
  readonly payload?: string;
}

/**
 * WebviewProvider yan panel dashboard'u ve ana browser panelini üretir.
 * YouTube gibi embed destekleyen sayfaları içeride gösterir, diğerlerini external açar.
 */
export class NoCodeDashboardProvider implements vscode.WebviewViewProvider, vscode.Disposable {
  public static readonly viewId = DASHBOARD_VIEW_ID;

  private view?: vscode.WebviewView;

  private browserPanel?: vscode.WebviewPanel;

  public constructor(
    private readonly context: vscode.ExtensionContext,
    private readonly stateStore: AppStateStore,
  ) {
    void this.context;
  }

  public async resolveWebviewView(
    webviewView: vscode.WebviewView,
    resolveContext: vscode.WebviewViewResolveContext,
    token: vscode.CancellationToken,
  ): Promise<void> {
    void resolveContext;
    void token;

    this.view = webviewView;
    webviewView.webview.options = {
      enableScripts: true,
    };
    webviewView.webview.html = this.getDashboardHtml(webviewView.webview);

    webviewView.webview.onDidReceiveMessage(async (message: DashboardMessage) => {
      await this.handleMessage(message);
    });
  }

  /** Yan panel dashboard'u görünür hale getirir. */
  public async revealDashboard(): Promise<void> {
    await vscode.commands.executeCommand('nocodeZone.focus');
  }

  /**
   * URL'i uygun deneyimle açar.
   * YouTube için embed, kısıtlı siteler için external browser fallback uygulanır.
   */
  public async openUrl(url: string): Promise<void> {
    const normalizedUrl = this.normalizeUrl(url);
    await this.stateStore.setCurrentUrl(normalizedUrl);

    if (!this.supportsEmbedding(normalizedUrl)) {
      await vscode.env.openExternal(vscode.Uri.parse(normalizedUrl));
      return;
    }

    if (!this.browserPanel) {
      this.browserPanel = vscode.window.createWebviewPanel(
        'nocodeZone.browser',
        'NoCode Browser',
        vscode.ViewColumn.Active,
        {
          enableScripts: true,
          retainContextWhenHidden: true,
        },
      );

      this.browserPanel.onDidDispose(async () => {
        this.browserPanel = undefined;
        await this.stateStore.setWebViewOpen(false);
      });
    }

    this.browserPanel.webview.html = this.getBrowserHtml(this.browserPanel.webview, normalizedUrl);
    this.browserPanel.reveal(vscode.ViewColumn.Active, false);
    await this.stateStore.setWebViewOpen(true);
  }

  /** State değişince dashboard ve panel görünümünü yeniler. */
  public refresh(): void {
    if (this.view) {
      this.view.webview.html = this.getDashboardHtml(this.view.webview);
    }

    if (this.browserPanel) {
      const state = this.stateStore.getState();
      this.browserPanel.webview.html = this.getBrowserHtml(this.browserPanel.webview, state.currentUrl);
    }
  }

  public dispose(): void {
    this.browserPanel?.dispose();
  }

  private async handleMessage(message: DashboardMessage): Promise<void> {
    switch (message.type) {
      case 'toggleMode':
        await vscode.commands.executeCommand('nocodeZone.toggle');
        return;
      case 'openUrl':
        if (message.payload) {
          await this.openUrl(message.payload);
        }
        return;
      case 'openExternal':
        if (message.payload) {
          await vscode.env.openExternal(vscode.Uri.parse(this.normalizeUrl(message.payload)));
        }
        return;
      case 'refresh':
        this.refresh();
        return;
      default:
        return;
    }
  }

  private getDashboardHtml(webview: vscode.Webview): string {
    void webview;
    const state = this.stateStore.getState();
    const palette = getThemePalette(state.activeTheme);
    const configuration = vscode.workspace.getConfiguration('nocodeZone');
    const quickLinks = configuration.get<QuickLink[]>('quickLinks', []);
    const nonce = this.createNonce();

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https: data:; style-src 'unsafe-inline'; script-src 'nonce-${nonce}'; frame-src https://www.youtube.com https://youtube.com;">
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>NoCode Dashboard</title>
  <style>
    :root {
      --primary: ${palette.primary};
      --secondary: ${palette.secondary};
      --background: ${palette.background};
      --surface: ${palette.surface};
      --text: ${palette.text};
      --accent: ${palette.accent};
      --border: ${palette.border};
    }
    * { box-sizing: border-box; }
    body {
      margin: 0;
      padding: 16px;
      font-family: 'Segoe UI', sans-serif;
      background: radial-gradient(circle at top, var(--surface), var(--background));
      color: var(--text);
    }
    .hero {
      border: 1px solid var(--border);
      border-radius: 18px;
      padding: 18px;
      background: linear-gradient(145deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02));
      box-shadow: 0 20px 60px rgba(0,0,0,0.25);
    }
    .title { font-size: 22px; font-weight: 700; margin: 0 0 8px; }
    .subtitle { opacity: 0.8; margin: 0 0 16px; line-height: 1.5; }
    .status {
      display: inline-flex;
      padding: 6px 12px;
      border-radius: 999px;
      background: ${state.mode === AppMode.NoCode ? palette.accent : palette.border};
      color: #111;
      font-weight: 700;
      margin-bottom: 16px;
    }
    .actions {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      margin-bottom: 18px;
    }
    button, input {
      border: none;
      outline: none;
      border-radius: 12px;
      padding: 12px 14px;
      font-size: 14px;
    }
    button {
      cursor: pointer;
      background: var(--primary);
      color: white;
      font-weight: 600;
      transition: transform 0.18s ease, opacity 0.18s ease;
    }
    button:hover { transform: translateY(-1px); opacity: 0.94; }
    input {
      width: 100%;
      background: rgba(255,255,255,0.08);
      color: var(--text);
      border: 1px solid var(--border);
      margin-bottom: 10px;
    }
    .links {
      display: grid;
      gap: 10px;
      margin-top: 16px;
    }
    .link-card {
      padding: 14px;
      border-radius: 14px;
      border: 1px solid var(--border);
      background: rgba(255,255,255,0.04);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .hint {
      margin-top: 16px;
      font-size: 12px;
      opacity: 0.75;
      line-height: 1.5;
    }
  </style>
</head>
<body>
  <div class="hero">
    <div class="status">${state.mode === AppMode.NoCode ? 'NoCode Active' : 'Normal Mode'}</div>
    <h1 class="title">NoCode Zone</h1>
    <p class="subtitle">Kod görünmeden VS Code içinde kal. Embed destekleyen siteleri içeride aç, desteklemeyenleri tek tıkla dış tarayıcıya gönder.</p>
    <div class="actions">
      <button id="toggleButton">${state.mode === AppMode.NoCode ? 'Normal Moda Don' : 'NoCode Aktif Et'}</button>
      <button id="youtubeButton">YouTube Ac</button>
    </div>
    <input id="urlInput" type="text" value="${this.escapeAttribute(state.currentUrl)}" placeholder="URL girin" />
    <div class="actions">
      <button id="openInsideButton">Iceride Ac</button>
      <button id="openExternalButton">Dis Tarayicida Ac</button>
    </div>
    <div class="links">
      ${quickLinks.map((link: QuickLink) => `
        <div class="link-card">
          <span>${this.escapeHtml(link.name)}</span>
          <button data-url="${this.escapeAttribute(link.url)}">Ac</button>
        </div>`).join('')}
    </div>
    <p class="hint">Not: Google gibi bircok site iframe kisiti nedeniyle VS Code icinde acilamaz. Bu durumda extension otomatik olarak system browser fallback kullanir.</p>
  </div>
  <script nonce="${nonce}">
    const vscodeApi = acquireVsCodeApi();
    const urlInput = document.getElementById('urlInput');
    document.getElementById('toggleButton').addEventListener('click', () => {
      vscodeApi.postMessage({ type: 'toggleMode' });
    });
    document.getElementById('youtubeButton').addEventListener('click', () => {
      vscodeApi.postMessage({ type: 'openUrl', payload: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ' });
    });
    document.getElementById('openInsideButton').addEventListener('click', () => {
      vscodeApi.postMessage({ type: 'openUrl', payload: urlInput.value });
    });
    document.getElementById('openExternalButton').addEventListener('click', () => {
      vscodeApi.postMessage({ type: 'openExternal', payload: urlInput.value });
    });
    document.querySelectorAll('[data-url]').forEach((button) => {
      button.addEventListener('click', () => {
        vscodeApi.postMessage({ type: 'openUrl', payload: button.getAttribute('data-url') });
      });
    });
  </script>
</body>
</html>`;
  }

  private getBrowserHtml(webview: vscode.Webview, url: string): string {
    void webview;
    const state = this.stateStore.getState();
    const palette = getThemePalette(state.activeTheme);
    const nonce = this.createNonce();
    const embeddedUrl = this.toEmbeddableUrl(url);

    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src 'unsafe-inline'; frame-src https://www.youtube.com https://youtube.com; script-src 'nonce-${nonce}';">
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>NoCode Browser</title>
  <style>
    body {
      margin: 0;
      background: ${palette.background};
      color: ${palette.text};
      font-family: 'Segoe UI', sans-serif;
      display: grid;
      grid-template-rows: 56px 1fr;
      height: 100vh;
    }
    header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 16px;
      background: ${palette.surface};
      border-bottom: 1px solid ${palette.border};
    }
    iframe {
      width: 100%;
      height: 100%;
      border: none;
    }
    button {
      background: ${palette.primary};
      color: white;
      border: none;
      border-radius: 10px;
      padding: 10px 14px;
      cursor: pointer;
    }
    .url {
      opacity: 0.8;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      max-width: 70%;
    }
  </style>
</head>
<body>
  <header>
    <div class="url">${this.escapeHtml(url)}</div>
    <button id="externalButton">Dis Tarayicida Ac</button>
  </header>
  <iframe src="${this.escapeAttribute(embeddedUrl)}" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"></iframe>
  <script nonce="${nonce}">
    const vscodeApi = acquireVsCodeApi();
    document.getElementById('externalButton').addEventListener('click', () => {
      vscodeApi.postMessage({ type: 'openExternal', payload: '${this.escapeJavaScript(url)}' });
    });
  </script>
</body>
</html>`;
  }

  private normalizeUrl(url: string): string {
    if (!url.trim()) {
      return 'https://www.youtube.com';
    }

    if (/^https?:\/\//i.test(url)) {
      return url;
    }

    return `https://${url}`;
  }

  private supportsEmbedding(url: string): boolean {
    return /youtube\.com|youtu\.be/i.test(url);
  }

  private toEmbeddableUrl(url: string): string {
    const youtubeMatch = url.match(/(?:v=|youtu\.be\/)([\w-]{11})/i);
    if (youtubeMatch?.[1]) {
      return `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=0&rel=0`;
    }

    return 'https://www.youtube.com/embed/dQw4w9WgXcQ';
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  private escapeAttribute(value: string): string {
    return this.escapeHtml(value);
  }

  private escapeJavaScript(value: string): string {
    return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
  }

  private createNonce(): string {
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    return Array.from({ length: 16 }, () => possible.charAt(Math.floor(Math.random() * possible.length))).join('');
  }
}
