/**
 * Kullanıcıya anlamlı ve öncelik bazlı geri bildirim verir.
 * Extension içinde dağınık notification kullanımını tek yerden toplar.
 */

import * as vscode from 'vscode';
import { NotificationData, NotificationPriority } from './types';

export class NotificationService {
  /** Öncelik seviyesine göre uygun VS Code notification API'sini çağırır. */
  public async show(data: NotificationData): Promise<string | undefined> {
    const actions = data.actions ?? [];

    switch (data.priority) {
      case NotificationPriority.Low:
        return vscode.window.showInformationMessage(data.message, ...actions);
      case NotificationPriority.Medium:
        return vscode.window.showInformationMessage(`${data.title}: ${data.message}`, ...actions);
      case NotificationPriority.High:
        return vscode.window.showWarningMessage(`${data.title}: ${data.message}`, ...actions);
      case NotificationPriority.Critical:
        return vscode.window.showErrorMessage(`${data.title}: ${data.message}`, ...actions);
      default:
        return vscode.window.showInformationMessage(data.message, ...actions);
    }
  }
}
