import { Disposable } from 'common/Lifecycle';
import { ICoreBrowserService } from './Services';
export declare class CoreBrowserService extends Disposable implements ICoreBrowserService {
    private _textarea;
    private _window;
    readonly mainDocument: Document;
    serviceBrand: undefined;
    private _isFocused;
    private _cachedIsFocused;
    private _screenDprMonitor;
    private readonly _onDprChange;
    readonly onDprChange: import("common/EventEmitter").IEvent<number, void>;
    private readonly _onWindowChange;
    readonly onWindowChange: import("common/EventEmitter").IEvent<Window & typeof globalThis, void>;
    constructor(_textarea: HTMLTextAreaElement, _window: Window & typeof globalThis, mainDocument: Document);
    get window(): Window & typeof globalThis;
    set window(value: Window & typeof globalThis);
    get dpr(): number;
    get isFocused(): boolean;
}
//# sourceMappingURL=CoreBrowserService.d.ts.map