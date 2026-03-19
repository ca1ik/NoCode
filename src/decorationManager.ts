/**
 * Kod editöründeki içeriği görsel olarak gizler.
 * Bu yaklaşım dosyaları değiştirmez, sadece render katmanını maskeler.
 */

import * as vscode from 'vscode';

/**
 * DecorationManager editörlerdeki kodu görünmez hale getirir.
 * Dosya içeriğine dokunmadan reversible bir overlay uygular.
 */
export class DecorationManager implements vscode.Disposable {
  private readonly codeHiderDecoration: vscode.TextEditorDecorationType;

  public constructor() {
    this.codeHiderDecoration = vscode.window.createTextEditorDecorationType({
      opacity: '0',
      letterSpacing: '-9999px',
      color: 'transparent',
      backgroundColor: new vscode.ThemeColor('editor.background'),
      overviewRulerColor: 'transparent',
    });
  }

  /** Aktif tüm editörlerdeki görünür kodu gizler. */
  public applyToVisibleEditors(): void {
    for (const editor of vscode.window.visibleTextEditors) {
      this.hideEditorContent(editor);
    }
  }

  /** Belirli editördeki tüm satırlara dekorasyon uygular. */
  public hideEditorContent(editor: vscode.TextEditor): void {
    if (editor.document.isUntitled && editor.document.getText().length === 0) {
      return;
    }

    const lastLineIndex = editor.document.lineCount - 1;
    const lastLine = editor.document.lineAt(lastLineIndex);
    const fullRange = new vscode.Range(0, 0, lastLineIndex, lastLine.range.end.character);

    editor.setDecorations(this.codeHiderDecoration, [fullRange]);
  }

  /** Belirli editörde dekorasyonu kaldırır. */
  public revealEditorContent(editor: vscode.TextEditor): void {
    editor.setDecorations(this.codeHiderDecoration, []);
  }

  /** Tüm görünür editörlerde kodu tekrar gösterir. */
  public revealVisibleEditors(): void {
    for (const editor of vscode.window.visibleTextEditors) {
      this.revealEditorContent(editor);
    }
  }

  public dispose(): void {
    this.codeHiderDecoration.dispose();
  }
}
