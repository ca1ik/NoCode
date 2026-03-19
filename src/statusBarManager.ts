/**
 * Status bar üzerindeki ana aç/kapa butonunu yönetir.
 * Kullanıcı tek tıkla NoCode ve normal mod arasında geçiş yapar.
 */

import * as vscode from 'vscode';
import { AppMode, AppState } from './types';

export class StatusBarManager implements vscode.Disposable {
  private readonly statusBarItem: vscode.StatusBarItem;

  public constructor() {
    this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1000);
    this.statusBarItem.command = 'nocodeZone.toggle';
    this.statusBarItem.tooltip = 'Toggle NoCode Zone';
    this.statusBarItem.show();
  }

  /** State'e göre ikon, yazı ve renkleri günceller. */
  public render(state: Readonly<AppState>): void {
    const isNoCode = state.mode === AppMode.NoCode;

    this.statusBarItem.text = isNoCode ? '$(eye-closed) NoCode ON' : '$(code) NoCode OFF';
    this.statusBarItem.backgroundColor = isNoCode
      ? new vscode.ThemeColor('statusBarItem.warningBackground')
      : undefined;
  }

  public dispose(): void {
    this.statusBarItem.dispose();
  }
}
