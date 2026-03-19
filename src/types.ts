/**
 * NoCode Zone - Core type definitions.
 * Tüm modüller arası paylaşılan tipler burada merkezi olarak tanımlanır.
 */

/** Extension'ın olası çalışma modları */
export const enum AppMode {
  /** Kodlar gizli, web/eğlence modu aktif */
  NoCode = 'nocode',
  /** Normal VS Code deneyimi */
  Normal = 'normal',
}

/** Copilot panelinin görünürlük durumu */
export const enum CopilotVisibility {
  Visible = 'visible',
  Hidden = 'hidden',
  /** Copilot input beklediğinde otomatik açılır */
  AutoReveal = 'auto-reveal',
}

/** Copilot'un kullanıcıdan beklediği etkileşim tipi */
export const enum CopilotInteraction {
  /** Copilot bir soru soruyor */
  Question = 'question',
  /** Copilot onay bekliyor */
  Approval = 'approval',
  /** Copilot işlem tamamladı */
  Completion = 'completion',
  /** Copilot hata bildiriyor */
  Error = 'error',
  /** Etkileşim yok */
  Idle = 'idle',
}

/** WebView'da gösterilecek hızlı erişim bağlantısı */
export interface QuickLink {
  readonly name: string;
  readonly url: string;
  readonly icon: string;
}

/** Extension'ın anlık durumu */
export interface AppState {
  mode: AppMode;
  copilotVisibility: CopilotVisibility;
  copilotInteraction: CopilotInteraction;
  isWebViewOpen: boolean;
  currentUrl: string;
  activeTheme: ThemeName;
}

/** Desteklenen tema isimleri */
export type ThemeName = 'midnight' | 'ocean' | 'sunset' | 'forest' | 'minimal';

/** State değişikliğini dinleyen callback */
export type StateChangeListener = (newState: Readonly<AppState>, changedKey: keyof AppState) => void;

/** Tema renk paleti */
export interface ThemePalette {
  readonly primary: string;
  readonly secondary: string;
  readonly background: string;
  readonly surface: string;
  readonly text: string;
  readonly accent: string;
  readonly border: string;
}

/** Bildirim öncelik seviyesi */
export const enum NotificationPriority {
  Low = 'low',
  Medium = 'medium',
  High = 'high',
  Critical = 'critical',
}

/** Bildirim verisi */
export interface NotificationData {
  readonly title: string;
  readonly message: string;
  readonly priority: NotificationPriority;
  readonly actions?: ReadonlyArray<string>;
  readonly autoCloseMs?: number;
}

/** Disposable kaynak arayüzü - RAII pattern */
export interface Disposable {
  dispose(): void;
}
