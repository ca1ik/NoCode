/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./src/copilotWatcher.ts"
/*!*******************************!*\
  !*** ./src/copilotWatcher.ts ***!
  \*******************************/
(__unused_webpack_module, exports, __webpack_require__) {


/**
 * Copilot görünürlüğünü ve etkileşim durumunu algılamak için event tabanlı izleyici.
 * VS Code API doğrudan Copilot state vermediği için güvenli heuristics kullanılır.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.CopilotWatcher = void 0;
const vscode = __importStar(__webpack_require__(/*! vscode */ "vscode"));
/**
 * Bunu yapabiliriz ama burada tam Copilot iç state erişimi mümkün değil.
 * VS Code public API buna izin vermediği için command/context/visible view heuristics kullanıyoruz.
 * Bu, bakım açısından illegal/private API hack'lerinden daha üstündür.
 */
class CopilotWatcher {
    stateStore;
    notificationService;
    disposables = [];
    constructor(stateStore, notificationService) {
        this.stateStore = stateStore;
        this.notificationService = notificationService;
    }
    /** Event subscription'larını başlatır. */
    initialize() {
        this.disposables.push(vscode.window.onDidChangeVisibleTextEditors(async () => {
            await this.detectPotentialCopilotAttention();
        }), vscode.window.onDidChangeWindowState(async (windowState) => {
            if (windowState.focused) {
                await this.detectPotentialCopilotAttention();
            }
        }), vscode.workspace.onDidChangeConfiguration(async (event) => {
            if (event.affectsConfiguration('github.copilot') || event.affectsConfiguration('github.copilot.chat')) {
                await this.detectPotentialCopilotAttention();
            }
        }));
    }
    /**
     * Public API sınırları içinde Copilot dikkat gerektiren durumları tahmin eder.
     * Kullanıcı etkileşimi istendiğinde auto-reveal zincirini tetikler.
     */
    async detectPotentialCopilotAttention() {
        const config = vscode.workspace.getConfiguration('nocodeZone');
        const autoReveal = config.get('copilotAutoReveal', true);
        if (!autoReveal) {
            return;
        }
        const chatViewVisible = vscode.window.tabGroups.all.some((group) => group.tabs.some((tab) => String(tab.label).toLowerCase().includes('copilot')));
        if (chatViewVisible) {
            await this.stateStore.setCopilotInteraction("question" /* CopilotInteraction.Question */);
            await this.stateStore.setCopilotVisibility("visible" /* CopilotVisibility.Visible */);
            await this.notificationService.show({
                title: 'Copilot Attention',
                message: 'Copilot görünür durumda ve etkileşim bekliyor olabilir.',
                priority: "medium" /* NotificationPriority.Medium */,
            });
        }
    }
    dispose() {
        for (const disposable of this.disposables) {
            disposable.dispose();
        }
    }
}
exports.CopilotWatcher = CopilotWatcher;


/***/ },

/***/ "./src/decorationManager.ts"
/*!**********************************!*\
  !*** ./src/decorationManager.ts ***!
  \**********************************/
(__unused_webpack_module, exports, __webpack_require__) {


/**
 * Kod editöründeki içeriği görsel olarak gizler.
 * Bu yaklaşım dosyaları değiştirmez, sadece render katmanını maskeler.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.DecorationManager = void 0;
const vscode = __importStar(__webpack_require__(/*! vscode */ "vscode"));
/**
 * DecorationManager editörlerdeki kodu görünmez hale getirir.
 * Dosya içeriğine dokunmadan reversible bir overlay uygular.
 */
class DecorationManager {
    codeHiderDecoration;
    constructor() {
        this.codeHiderDecoration = vscode.window.createTextEditorDecorationType({
            opacity: '0',
            letterSpacing: '-9999px',
            color: 'transparent',
            backgroundColor: new vscode.ThemeColor('editor.background'),
            overviewRulerColor: 'transparent',
        });
    }
    /** Aktif tüm editörlerdeki görünür kodu gizler. */
    applyToVisibleEditors() {
        for (const editor of vscode.window.visibleTextEditors) {
            this.hideEditorContent(editor);
        }
    }
    /** Belirli editördeki tüm satırlara dekorasyon uygular. */
    hideEditorContent(editor) {
        if (editor.document.isUntitled && editor.document.getText().length === 0) {
            return;
        }
        const lastLineIndex = editor.document.lineCount - 1;
        const lastLine = editor.document.lineAt(lastLineIndex);
        const fullRange = new vscode.Range(0, 0, lastLineIndex, lastLine.range.end.character);
        editor.setDecorations(this.codeHiderDecoration, [fullRange]);
    }
    /** Belirli editörde dekorasyonu kaldırır. */
    revealEditorContent(editor) {
        editor.setDecorations(this.codeHiderDecoration, []);
    }
    /** Tüm görünür editörlerde kodu tekrar gösterir. */
    revealVisibleEditors() {
        for (const editor of vscode.window.visibleTextEditors) {
            this.revealEditorContent(editor);
        }
    }
    dispose() {
        this.codeHiderDecoration.dispose();
    }
}
exports.DecorationManager = DecorationManager;


/***/ },

/***/ "./src/extension.ts"
/*!**************************!*\
  !*** ./src/extension.ts ***!
  \**************************/
(__unused_webpack_module, exports, __webpack_require__) {


/**
 * NoCode Zone extension entry point.
 * Tüm servisleri ayağa kaldırır ve command kayıtlarını yönetir.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.activate = activate;
exports.deactivate = deactivate;
const vscode = __importStar(__webpack_require__(/*! vscode */ "vscode"));
const copilotWatcher_1 = __webpack_require__(/*! ./copilotWatcher */ "./src/copilotWatcher.ts");
const decorationManager_1 = __webpack_require__(/*! ./decorationManager */ "./src/decorationManager.ts");
const noCodeManager_1 = __webpack_require__(/*! ./noCodeManager */ "./src/noCodeManager.ts");
const notificationService_1 = __webpack_require__(/*! ./notificationService */ "./src/notificationService.ts");
const state_1 = __webpack_require__(/*! ./state */ "./src/state.ts");
const statusBarManager_1 = __webpack_require__(/*! ./statusBarManager */ "./src/statusBarManager.ts");
const webviewProvider_1 = __webpack_require__(/*! ./webviewProvider */ "./src/webviewProvider.ts");
async function activate(context) {
    const stateStore = new state_1.AppStateStore(context);
    const decorationManager = new decorationManager_1.DecorationManager();
    const notificationService = new notificationService_1.NotificationService();
    const statusBarManager = new statusBarManager_1.StatusBarManager();
    const dashboardProvider = new webviewProvider_1.NoCodeDashboardProvider(context, stateStore);
    const noCodeManager = new noCodeManager_1.NoCodeManager(stateStore, decorationManager, dashboardProvider, statusBarManager, notificationService);
    const copilotWatcher = new copilotWatcher_1.CopilotWatcher(stateStore, notificationService);
    context.subscriptions.push(decorationManager, statusBarManager, dashboardProvider, noCodeManager, copilotWatcher, vscode.window.registerWebviewViewProvider(webviewProvider_1.NoCodeDashboardProvider.viewId, dashboardProvider), vscode.commands.registerCommand('nocodeZone.toggle', async () => {
        await noCodeManager.toggleMode();
    }), vscode.commands.registerCommand('nocodeZone.openBrowser', async () => {
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
    }), vscode.commands.registerCommand('nocodeZone.openYouTube', async () => {
        await noCodeManager.openUrl('https://www.youtube.com');
    }), vscode.commands.registerCommand('nocodeZone.toggleCopilotVisibility', async () => {
        await noCodeManager.toggleCopilotVisibility();
    }), vscode.commands.registerCommand('nocodeZone.showSettings', async () => {
        await vscode.commands.executeCommand('workbench.action.openSettings', '@ext:nocode-studio.nocode-zone');
    }), vscode.commands.registerCommand('nocodeZone.focus', async () => {
        await vscode.commands.executeCommand('workbench.view.extension.nocodeZone');
    }));
    copilotWatcher.initialize();
    await noCodeManager.initialize();
}
function deactivate() {
    // VS Code subscription mekanizmasi tum disposable kaynaklari otomatik serbest birakir.
}


/***/ },

/***/ "./src/noCodeManager.ts"
/*!******************************!*\
  !*** ./src/noCodeManager.ts ***!
  \******************************/
(__unused_webpack_module, exports, __webpack_require__) {


/**
 * NoCode modunun yaşam döngüsünü yöneten merkez servis.
 * UI görünürlüğü, editör dekorasyonu, webview ve Copilot davranışları burada orkestre edilir.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NoCodeManager = void 0;
const vscode = __importStar(__webpack_require__(/*! vscode */ "vscode"));
class NoCodeManager {
    stateStore;
    decorationManager;
    dashboardProvider;
    statusBarManager;
    notificationService;
    disposables = [];
    constructor(stateStore, decorationManager, dashboardProvider, statusBarManager, notificationService) {
        this.stateStore = stateStore;
        this.decorationManager = decorationManager;
        this.dashboardProvider = dashboardProvider;
        this.statusBarManager = statusBarManager;
        this.notificationService = notificationService;
    }
    /** Başlangıç state'ini uygular ve event aboneliklerini açar. */
    async initialize() {
        this.disposables.push(this.stateStore.subscribe((state, changedKey) => {
            this.statusBarManager.render(state);
            this.dashboardProvider.refresh();
            if (changedKey === 'copilotInteraction' && state.copilotInteraction !== "idle" /* CopilotInteraction.Idle */) {
                void this.revealForCopilotAttention();
            }
        }), vscode.window.onDidChangeVisibleTextEditors(() => {
            if (this.stateStore.getState().mode === "nocode" /* AppMode.NoCode */) {
                this.decorationManager.applyToVisibleEditors();
            }
        }), vscode.window.onDidChangeActiveTextEditor((editor) => {
            if (editor && this.stateStore.getState().mode === "nocode" /* AppMode.NoCode */) {
                this.decorationManager.hideEditorContent(editor);
            }
        }));
        this.statusBarManager.render(this.stateStore.getState());
        if (this.stateStore.getState().mode === "nocode" /* AppMode.NoCode */) {
            await this.enableNoCodeMode(false);
            return;
        }
        await this.disableNoCodeMode(false);
    }
    /** NoCode ve normal mod arasında toggle yapar. */
    async toggleMode() {
        const currentMode = this.stateStore.getState().mode;
        if (currentMode === "nocode" /* AppMode.NoCode */) {
            await this.disableNoCodeMode(true);
            return;
        }
        await this.enableNoCodeMode(true);
    }
    /** Belirli URL'i NoCode browser içinde açar. */
    async openUrl(url) {
        await this.dashboardProvider.openUrl(url);
    }
    /** Copilot paneli için görünürlük davranışını toggle eder. */
    async toggleCopilotVisibility() {
        const current = this.stateStore.getState().copilotVisibility;
        const next = current === "hidden" /* CopilotVisibility.Hidden */ ? "visible" /* CopilotVisibility.Visible */ : "hidden" /* CopilotVisibility.Hidden */;
        await this.stateStore.setCopilotVisibility(next);
        if (next === "hidden" /* CopilotVisibility.Hidden */) {
            await this.hideCopilotSurface();
        }
        else {
            await this.revealCopilotSurface();
        }
    }
    /**
     * Copilot kullanıcı girdisi istediğinde veya görünür olduğunda NoCode perdesini kaldırır.
     * Bu mekanizma tam API olmadığı için best-effort çalışır.
     */
    async revealForCopilotAttention() {
        const state = this.stateStore.getState();
        if (state.mode !== "nocode" /* AppMode.NoCode */) {
            return;
        }
        await this.disableNoCodeMode(false);
        await this.revealCopilotSurface();
        await this.notificationService.show({
            title: 'Copilot Visible',
            message: 'Copilot etkileşimi icin normal gorunume gecildi.',
            priority: "high" /* NotificationPriority.High */,
            actions: ['Tamam'],
        });
    }
    dispose() {
        for (const disposable of this.disposables) {
            disposable.dispose();
        }
    }
    async enableNoCodeMode(showNotification) {
        await this.stateStore.setMode("nocode" /* AppMode.NoCode */);
        this.decorationManager.applyToVisibleEditors();
        await this.hideWorkbenchNoise();
        await this.dashboardProvider.revealDashboard();
        await this.dashboardProvider.openUrl(this.stateStore.getState().currentUrl);
        if (this.stateStore.getState().copilotVisibility === "hidden" /* CopilotVisibility.Hidden */) {
            await this.hideCopilotSurface();
        }
        if (showNotification) {
            await this.notificationService.show({
                title: 'NoCode Zone',
                message: 'Kod gorunumu gizlendi. Dashboard aktif.',
                priority: "medium" /* NotificationPriority.Medium */,
            });
        }
    }
    async disableNoCodeMode(showNotification) {
        await this.stateStore.setMode("normal" /* AppMode.Normal */);
        this.decorationManager.revealVisibleEditors();
        if (showNotification) {
            await this.notificationService.show({
                title: 'NoCode Zone',
                message: 'Normal VS Code gorunumu geri yüklendi.',
                priority: "low" /* NotificationPriority.Low */,
            });
        }
    }
    /** Dikkat dağıtan UI katmanlarını minimize eder. */
    async hideWorkbenchNoise() {
        await vscode.commands.executeCommand('workbench.action.closeSidebar');
        await vscode.commands.executeCommand('workbench.action.closePanel');
        await vscode.commands.executeCommand('workbench.action.closeAuxiliaryBar');
    }
    /** Copilot/chat tarafını gizlemek için mevcut public command'ları kullanır. */
    async hideCopilotSurface() {
        await vscode.commands.executeCommand('workbench.action.closeAuxiliaryBar');
        await vscode.commands.executeCommand('workbench.action.closePanel');
    }
    /** Copilot/chat tarafını olabildiğince görünür hale getirir. */
    async revealCopilotSurface() {
        try {
            await vscode.commands.executeCommand('workbench.action.chat.open');
        }
        catch (error) {
            await this.notificationService.show({
                title: 'Copilot Command',
                message: `Copilot chat acilamadi: ${error instanceof Error ? error.message : 'bilinmeyen hata'}`,
                priority: "low" /* NotificationPriority.Low */,
            });
        }
    }
}
exports.NoCodeManager = NoCodeManager;


/***/ },

/***/ "./src/notificationService.ts"
/*!************************************!*\
  !*** ./src/notificationService.ts ***!
  \************************************/
(__unused_webpack_module, exports, __webpack_require__) {


/**
 * Kullanıcıya anlamlı ve öncelik bazlı geri bildirim verir.
 * Extension içinde dağınık notification kullanımını tek yerden toplar.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NotificationService = void 0;
const vscode = __importStar(__webpack_require__(/*! vscode */ "vscode"));
class NotificationService {
    /** Öncelik seviyesine göre uygun VS Code notification API'sini çağırır. */
    async show(data) {
        const actions = data.actions ?? [];
        switch (data.priority) {
            case "low" /* NotificationPriority.Low */:
                return vscode.window.showInformationMessage(data.message, ...actions);
            case "medium" /* NotificationPriority.Medium */:
                return vscode.window.showInformationMessage(`${data.title}: ${data.message}`, ...actions);
            case "high" /* NotificationPriority.High */:
                return vscode.window.showWarningMessage(`${data.title}: ${data.message}`, ...actions);
            case "critical" /* NotificationPriority.Critical */:
                return vscode.window.showErrorMessage(`${data.title}: ${data.message}`, ...actions);
            default:
                return vscode.window.showInformationMessage(data.message, ...actions);
        }
    }
}
exports.NotificationService = NotificationService;


/***/ },

/***/ "./src/state.ts"
/*!**********************!*\
  !*** ./src/state.ts ***!
  \**********************/
(__unused_webpack_module, exports, __webpack_require__) {


/**
 * Merkezi state store.
 * Extension genelindeki durum tek kaynaktan yönetilir.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.AppStateStore = void 0;
const vscode = __importStar(__webpack_require__(/*! vscode */ "vscode"));
const STATE_KEY = 'nocodeZone.state';
/**
 * AppStateStore tüm state mutasyonlarını tip güvenli ve gözlemlenebilir şekilde yönetir.
 * Tek sorumluluğu durum depolamak ve değişiklikleri yayınlamaktır.
 */
class AppStateStore {
    context;
    state;
    listeners = new Set();
    constructor(context) {
        this.context = context;
        this.state = this.loadInitialState();
    }
    /** Geçerli immutable state snapshot döner. */
    getState() {
        return Object.freeze({ ...this.state });
    }
    /** Mode günceller ve değişikliği kalıcı saklar. */
    async setMode(mode) {
        await this.updateState('mode', mode);
        await vscode.commands.executeCommand('setContext', 'nocodeZone.active', mode === "nocode" /* AppMode.NoCode */);
    }
    /** Copilot görünürlüğünü günceller. */
    async setCopilotVisibility(visibility) {
        await this.updateState('copilotVisibility', visibility);
    }
    /** Copilot etkileşim durumunu günceller. */
    async setCopilotInteraction(interaction) {
        await this.updateState('copilotInteraction', interaction);
    }
    /** WebView açık/kapalı durumunu günceller. */
    async setWebViewOpen(isWebViewOpen) {
        await this.updateState('isWebViewOpen', isWebViewOpen);
    }
    /** Aktif URL'i günceller. */
    async setCurrentUrl(currentUrl) {
        await this.updateState('currentUrl', currentUrl);
    }
    /** Aktif temayı günceller. */
    async setTheme(activeTheme) {
        await this.updateState('activeTheme', activeTheme);
    }
    /** Listener ekler ve dispose fonksiyonu döner. */
    subscribe(listener) {
        this.listeners.add(listener);
        return new vscode.Disposable(() => {
            this.listeners.delete(listener);
        });
    }
    loadInitialState() {
        const savedState = this.context.globalState.get(STATE_KEY);
        const configuration = vscode.workspace.getConfiguration('nocodeZone');
        const defaultMode = configuration.get('defaultMode', "nocode" /* AppMode.NoCode */);
        const defaultTheme = configuration.get('theme', 'midnight');
        return savedState ?? {
            mode: defaultMode,
            copilotVisibility: configuration.get('hideCopilot', false)
                ? "hidden" /* CopilotVisibility.Hidden */
                : "visible" /* CopilotVisibility.Visible */,
            copilotInteraction: "idle" /* CopilotInteraction.Idle */,
            isWebViewOpen: false,
            currentUrl: configuration.get('homepageUrl', 'https://www.youtube.com'),
            activeTheme: defaultTheme,
        };
    }
    /**
     * State güncellemesini atomik yapar, storage'a yazar ve observer'ları bilgilendirir.
     * Gereksiz notify'ı önlemek için değişmeyen değerlerde erken çıkar.
     */
    async updateState(key, value) {
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
exports.AppStateStore = AppStateStore;


/***/ },

/***/ "./src/statusBarManager.ts"
/*!*********************************!*\
  !*** ./src/statusBarManager.ts ***!
  \*********************************/
(__unused_webpack_module, exports, __webpack_require__) {


/**
 * Status bar üzerindeki ana aç/kapa butonunu yönetir.
 * Kullanıcı tek tıkla NoCode ve normal mod arasında geçiş yapar.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.StatusBarManager = void 0;
const vscode = __importStar(__webpack_require__(/*! vscode */ "vscode"));
class StatusBarManager {
    statusBarItem;
    constructor() {
        this.statusBarItem = vscode.window.createStatusBarItem(vscode.StatusBarAlignment.Left, 1000);
        this.statusBarItem.command = 'nocodeZone.toggle';
        this.statusBarItem.tooltip = 'Toggle NoCode Zone';
        this.statusBarItem.show();
    }
    /** State'e göre ikon, yazı ve renkleri günceller. */
    render(state) {
        const isNoCode = state.mode === "nocode" /* AppMode.NoCode */;
        this.statusBarItem.text = isNoCode ? '$(eye-closed) NoCode ON' : '$(code) NoCode OFF';
        this.statusBarItem.backgroundColor = isNoCode
            ? new vscode.ThemeColor('statusBarItem.warningBackground')
            : undefined;
    }
    dispose() {
        this.statusBarItem.dispose();
    }
}
exports.StatusBarManager = StatusBarManager;


/***/ },

/***/ "./src/themes.ts"
/*!***********************!*\
  !*** ./src/themes.ts ***!
  \***********************/
(__unused_webpack_module, exports) {


/**
 * Tema tanımları - Her tema için renk paleti.
 * Extension'ın NoCode modundaki görsel kimliğini belirler.
 */
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getThemePalette = getThemePalette;
exports.getAvailableThemes = getAvailableThemes;
const THEMES = {
    midnight: {
        primary: '#6c5ce7',
        secondary: '#a29bfe',
        background: '#0a0a1a',
        surface: '#16162a',
        text: '#e8e8f0',
        accent: '#fd79a8',
        border: '#2d2d5e',
    },
    ocean: {
        primary: '#0984e3',
        secondary: '#74b9ff',
        background: '#0a1628',
        surface: '#132743',
        text: '#dfe6e9',
        accent: '#00cec9',
        border: '#1e3a5f',
    },
    sunset: {
        primary: '#e17055',
        secondary: '#fab1a0',
        background: '#1a0a0a',
        surface: '#2d1515',
        text: '#ffeaa7',
        accent: '#fdcb6e',
        border: '#4a2020',
    },
    forest: {
        primary: '#00b894',
        secondary: '#55efc4',
        background: '#0a1a0a',
        surface: '#152d15',
        text: '#dfe6e9',
        accent: '#ffeaa7',
        border: '#1e4a1e',
    },
    minimal: {
        primary: '#636e72',
        secondary: '#b2bec3',
        background: '#0d0d0d',
        surface: '#1a1a1a',
        text: '#dfe6e9',
        accent: '#74b9ff',
        border: '#2d3436',
    },
};
/** Tema paletini isimle getirir. Geçersiz isimde midnight döner. */
function getThemePalette(name) {
    return THEMES[name] ?? THEMES.midnight;
}
/** Tüm kullanılabilir tema isimlerini döner */
function getAvailableThemes() {
    return Object.keys(THEMES);
}


/***/ },

/***/ "./src/webviewProvider.ts"
/*!********************************!*\
  !*** ./src/webviewProvider.ts ***!
  \********************************/
(__unused_webpack_module, exports, __webpack_require__) {


/**
 * NoCode dashboard ve tarayıcı deneyimini sağlayan webview provider.
 * Embed edilemeyen siteler için güvenli fallback olarak external browser açılır.
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.NoCodeDashboardProvider = void 0;
const vscode = __importStar(__webpack_require__(/*! vscode */ "vscode"));
const themes_1 = __webpack_require__(/*! ./themes */ "./src/themes.ts");
const DASHBOARD_VIEW_ID = 'nocodeZone.dashboard';
/**
 * WebviewProvider yan panel dashboard'u ve ana browser panelini üretir.
 * YouTube gibi embed destekleyen sayfaları içeride gösterir, diğerlerini external açar.
 */
class NoCodeDashboardProvider {
    context;
    stateStore;
    static viewId = DASHBOARD_VIEW_ID;
    view;
    browserPanel;
    constructor(context, stateStore) {
        this.context = context;
        this.stateStore = stateStore;
        void this.context;
    }
    async resolveWebviewView(webviewView, resolveContext, token) {
        void resolveContext;
        void token;
        this.view = webviewView;
        webviewView.webview.options = {
            enableScripts: true,
        };
        webviewView.webview.html = this.getDashboardHtml(webviewView.webview);
        webviewView.webview.onDidReceiveMessage(async (message) => {
            await this.handleMessage(message);
        });
    }
    /** Yan panel dashboard'u görünür hale getirir. */
    async revealDashboard() {
        await vscode.commands.executeCommand('nocodeZone.focus');
    }
    /**
     * URL'i uygun deneyimle açar.
     * YouTube için embed, kısıtlı siteler için external browser fallback uygulanır.
     */
    async openUrl(url) {
        const normalizedUrl = this.normalizeUrl(url);
        await this.stateStore.setCurrentUrl(normalizedUrl);
        if (!this.supportsEmbedding(normalizedUrl)) {
            await vscode.env.openExternal(vscode.Uri.parse(normalizedUrl));
            return;
        }
        if (!this.browserPanel) {
            this.browserPanel = vscode.window.createWebviewPanel('nocodeZone.browser', 'NoCode Browser', vscode.ViewColumn.Active, {
                enableScripts: true,
                retainContextWhenHidden: true,
            });
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
    refresh() {
        if (this.view) {
            this.view.webview.html = this.getDashboardHtml(this.view.webview);
        }
        if (this.browserPanel) {
            const state = this.stateStore.getState();
            this.browserPanel.webview.html = this.getBrowserHtml(this.browserPanel.webview, state.currentUrl);
        }
    }
    dispose() {
        this.browserPanel?.dispose();
    }
    async handleMessage(message) {
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
    getDashboardHtml(webview) {
        void webview;
        const state = this.stateStore.getState();
        const palette = (0, themes_1.getThemePalette)(state.activeTheme);
        const configuration = vscode.workspace.getConfiguration('nocodeZone');
        const quickLinks = configuration.get('quickLinks', []);
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
      background: ${state.mode === "nocode" /* AppMode.NoCode */ ? palette.accent : palette.border};
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
    <div class="status">${state.mode === "nocode" /* AppMode.NoCode */ ? 'NoCode Active' : 'Normal Mode'}</div>
    <h1 class="title">NoCode Zone</h1>
    <p class="subtitle">Kod görünmeden VS Code içinde kal. Embed destekleyen siteleri içeride aç, desteklemeyenleri tek tıkla dış tarayıcıya gönder.</p>
    <div class="actions">
      <button id="toggleButton">${state.mode === "nocode" /* AppMode.NoCode */ ? 'Normal Moda Don' : 'NoCode Aktif Et'}</button>
      <button id="youtubeButton">YouTube Ac</button>
    </div>
    <input id="urlInput" type="text" value="${this.escapeAttribute(state.currentUrl)}" placeholder="URL girin" />
    <div class="actions">
      <button id="openInsideButton">Iceride Ac</button>
      <button id="openExternalButton">Dis Tarayicida Ac</button>
    </div>
    <div class="links">
      ${quickLinks.map((link) => `
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
    getBrowserHtml(webview, url) {
        void webview;
        const state = this.stateStore.getState();
        const palette = (0, themes_1.getThemePalette)(state.activeTheme);
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
    normalizeUrl(url) {
        if (!url.trim()) {
            return 'https://www.youtube.com';
        }
        if (/^https?:\/\//i.test(url)) {
            return url;
        }
        return `https://${url}`;
    }
    supportsEmbedding(url) {
        return /youtube\.com|youtu\.be/i.test(url);
    }
    toEmbeddableUrl(url) {
        const youtubeMatch = url.match(/(?:v=|youtu\.be\/)([\w-]{11})/i);
        if (youtubeMatch?.[1]) {
            return `https://www.youtube.com/embed/${youtubeMatch[1]}?autoplay=0&rel=0`;
        }
        return 'https://www.youtube.com/embed/dQw4w9WgXcQ';
    }
    escapeHtml(value) {
        return value
            .replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;')
            .replace(/"/g, '&quot;')
            .replace(/'/g, '&#39;');
    }
    escapeAttribute(value) {
        return this.escapeHtml(value);
    }
    escapeJavaScript(value) {
        return value.replace(/\\/g, '\\\\').replace(/'/g, "\\'");
    }
    createNonce() {
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        return Array.from({ length: 16 }, () => possible.charAt(Math.floor(Math.random() * possible.length))).join('');
    }
}
exports.NoCodeDashboardProvider = NoCodeDashboardProvider;


/***/ },

/***/ "vscode"
/*!*************************!*\
  !*** external "vscode" ***!
  \*************************/
(module) {

module.exports = require("vscode");

/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		if (!(moduleId in __webpack_modules__)) {
/******/ 			delete __webpack_module_cache__[moduleId];
/******/ 			var e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// startup
/******/ 	// Load entry module and return exports
/******/ 	// This entry module is referenced by other modules so it can't be inlined
/******/ 	var __webpack_exports__ = __webpack_require__("./src/extension.ts");
/******/ 	module.exports = __webpack_exports__;
/******/ 	
/******/ })()
;
//# sourceMappingURL=extension.js.map