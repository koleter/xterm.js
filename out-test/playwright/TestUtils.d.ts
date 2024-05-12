import { Browser, JSHandle, Page } from '@playwright/test';
import type { IRenderDimensions } from 'browser/renderer/shared/Types';
import type { ICoreTerminal, IMarker } from 'common/Types';
import * as playwright from '@playwright/test';
import { PageFunction } from 'playwright-core/types/structs';
import { IBuffer, IBufferCell, IBufferLine, IBufferNamespace, IBufferRange, IDecoration, IDecorationOptions, IModes, ITerminalInitOnlyOptions, ITerminalOptions, Terminal } from '@xterm/xterm';
export interface ITestContext {
    browser: Browser;
    page: Page;
    termHandle: JSHandle<Terminal>;
    proxy: TerminalProxy;
}
export declare function createTestContext(browser: Browser): Promise<ITestContext>;
type EnsureAsync<T> = T extends PromiseLike<any> ? T : Promise<T>;
type EnsureAsyncProperties<T> = {
    [Key in keyof T]: EnsureAsync<T[Key]>;
};
type EnsureAsyncMethods<T> = {
    [K in keyof T]: T[K] extends (...args: infer Args) => infer Return ? (...args: Args) => Promise<Return> : T[K];
};
type PlaywrightApiProxy<TBaseInterface, TAsyncPropOverrides extends keyof TBaseInterface, TAsyncMethodOverrides extends keyof TBaseInterface, TCustomOverrides extends keyof TBaseInterface> = (EnsureAsyncProperties<Pick<TBaseInterface, TAsyncPropOverrides>> & EnsureAsyncMethods<Pick<TBaseInterface, TAsyncMethodOverrides>> & Omit<TBaseInterface, TAsyncPropOverrides | TAsyncMethodOverrides | TCustomOverrides>);
interface ITerminalProxyCustomMethods {
    evaluate<T>(pageFunction: PageFunction<JSHandle<Terminal>[], T>): Promise<T>;
    write(data: string | Uint8Array): Promise<void>;
}
type TerminalProxyAsyncPropOverrides = 'cols' | 'rows' | 'modes';
type TerminalProxyAsyncMethodOverrides = 'hasSelection' | 'getSelection' | 'getSelectionPosition' | 'registerMarker' | 'registerDecoration';
type TerminalProxyCustomOverrides = 'buffer' | ('element' | 'textarea' | 'markers' | 'unicode' | 'parser' | 'options' | 'open' | 'attachCustomKeyEventHandler' | 'attachCustomWheelEventHandler' | 'registerLinkProvider' | 'registerCharacterJoiner' | 'deregisterCharacterJoiner' | 'loadAddon');
export declare class TerminalProxy implements ITerminalProxyCustomMethods, PlaywrightApiProxy<Terminal, TerminalProxyAsyncPropOverrides, TerminalProxyAsyncMethodOverrides, TerminalProxyCustomOverrides> {
    private readonly _page;
    constructor(_page: Page);
    initPage(): Promise<void>;
    initTerm(): Promise<void>;
    private _onBell;
    readonly onBell: import("../../out/common/EventEmitter").IEvent<void, void>;
    private _onBinary;
    readonly onBinary: import("../../out/common/EventEmitter").IEvent<string, void>;
    private _onCursorMove;
    readonly onCursorMove: import("../../out/common/EventEmitter").IEvent<void, void>;
    private _onData;
    readonly onData: import("../../out/common/EventEmitter").IEvent<string, void>;
    private _onKey;
    readonly onKey: import("../../out/common/EventEmitter").IEvent<{
        key: string;
        domEvent: KeyboardEvent;
    }, void>;
    private _onLineFeed;
    readonly onLineFeed: import("../../out/common/EventEmitter").IEvent<void, void>;
    private _onRender;
    readonly onRender: import("../../out/common/EventEmitter").IEvent<{
        start: number;
        end: number;
    }, void>;
    private _onResize;
    readonly onResize: import("../../out/common/EventEmitter").IEvent<{
        cols: number;
        rows: number;
    }, void>;
    private _onScroll;
    readonly onScroll: import("../../out/common/EventEmitter").IEvent<number, void>;
    private _onSelectionChange;
    readonly onSelectionChange: import("../../out/common/EventEmitter").IEvent<void, void>;
    private _onTitleChange;
    readonly onTitleChange: import("../../out/common/EventEmitter").IEvent<string, void>;
    private _onWriteParsed;
    readonly onWriteParsed: import("../../out/common/EventEmitter").IEvent<void, void>;
    get cols(): Promise<number>;
    get rows(): Promise<number>;
    get modes(): Promise<IModes>;
    get buffer(): TerminalBufferNamespaceProxy;
    get core(): TerminalCoreProxy;
    dispose(): Promise<void>;
    reset(): Promise<void>;
    clear(): Promise<void>;
    focus(): Promise<void>;
    blur(): Promise<void>;
    hasSelection(): Promise<boolean>;
    getSelection(): Promise<string>;
    getSelectionPosition(): Promise<IBufferRange | undefined>;
    selectAll(): Promise<void>;
    selectLines(start: number, end: number): Promise<void>;
    clearSelection(): Promise<void>;
    select(column: number, row: number, length: number): Promise<void>;
    paste(data: string): Promise<void>;
    refresh(start: number, end: number): Promise<void>;
    getOption<T extends keyof ITerminalOptions>(key: T): Promise<ITerminalOptions[T]>;
    setOption<T extends keyof ITerminalOptions>(key: T, value: ITerminalOptions[T]): Promise<any>;
    setOptions(value: Partial<ITerminalOptions>): Promise<any>;
    scrollToTop(): Promise<void>;
    scrollToBottom(): Promise<void>;
    scrollPages(pageCount: number): Promise<void>;
    scrollToLine(line: number): Promise<void>;
    scrollLines(amount: number): Promise<void>;
    write(data: string | Uint8Array): Promise<void>;
    writeln(data: string | Uint8Array): Promise<void>;
    input(data: string, wasUserInput?: boolean): Promise<void>;
    resize(cols: number, rows: number): Promise<void>;
    registerMarker(y?: number | undefined): Promise<IMarker>;
    registerDecoration(decorationOptions: IDecorationOptions): Promise<IDecoration | undefined>;
    clearTextureAtlas(): Promise<void>;
    evaluate<T>(pageFunction: PageFunction<JSHandle<Terminal>[], T>): Promise<T>;
    evaluateHandle<T>(pageFunction: PageFunction<JSHandle<Terminal>[], T>): Promise<JSHandle<T>>;
    getHandle(): Promise<JSHandle<Terminal>>;
}
declare class TerminalBufferNamespaceProxy implements PlaywrightApiProxy<IBufferNamespace, never, never, 'active' | 'normal' | 'alternate'> {
    private readonly _page;
    private readonly _proxy;
    private _onBufferChange;
    readonly onBufferChange: import("../../out/common/EventEmitter").IEvent<IBuffer, void>;
    constructor(_page: Page, _proxy: TerminalProxy);
    get active(): TerminalBufferProxy;
    get normal(): TerminalBufferProxy;
    get alternate(): TerminalBufferProxy;
}
declare class TerminalBufferProxy {
    private readonly _page;
    private readonly _proxy;
    private readonly _handle;
    constructor(_page: Page, _proxy: TerminalProxy, _handle: Promise<JSHandle<IBuffer>>);
    get type(): Promise<'normal' | 'alternate'>;
    get cursorY(): Promise<number>;
    get cursorX(): Promise<number>;
    get viewportY(): Promise<number>;
    get baseY(): Promise<number>;
    get length(): Promise<number>;
    getLine(y: number): Promise<TerminalBufferLine | undefined>;
    evaluate<T>(pageFunction: PageFunction<JSHandle<IBuffer>[], T>): Promise<T>;
}
declare class TerminalBufferLine {
    private readonly _page;
    private readonly _handle;
    constructor(_page: Page, _handle: JSHandle<IBufferLine>);
    get length(): Promise<number>;
    get isWrapped(): Promise<boolean>;
    translateToString(trimRight?: boolean, startColumn?: number, endColumn?: number): Promise<string>;
    getCell(x: number): Promise<TerminalBufferCell | undefined>;
    evaluate<T>(pageFunction: PageFunction<JSHandle<IBufferLine>[], T>): Promise<T>;
}
declare class TerminalBufferCell {
    private readonly _page;
    private readonly _handle;
    constructor(_page: Page, _handle: JSHandle<IBufferCell>);
    getWidth(): Promise<number>;
    getChars(): Promise<string>;
    evaluate<T>(pageFunction: PageFunction<JSHandle<IBufferCell>[], T>): Promise<T>;
}
declare class TerminalCoreProxy {
    private readonly _page;
    private readonly _proxy;
    constructor(_page: Page, _proxy: TerminalProxy);
    get isDisposed(): Promise<boolean>;
    get renderDimensions(): Promise<IRenderDimensions>;
    triggerBinaryEvent(data: string): Promise<void>;
    private _getCoreHandle;
    evaluate<T>(pageFunction: PageFunction<JSHandle<ICoreTerminal>[], T>): Promise<T>;
}
export declare function openTerminal(ctx: ITestContext, options?: ITerminalOptions | ITerminalInitOnlyOptions, testOptions?: {
    loadUnicodeGraphemesAddon: boolean;
}): Promise<void>;
export type MaybeAsync<T> = Promise<T> | T;
interface IPollForOptions<T> {
    equalityFn?: (a: T, b: T) => boolean;
    maxDuration?: number;
    stack?: string;
}
export declare function pollFor<T>(page: playwright.Page, evalOrFn: string | (() => MaybeAsync<T>), val: T, preFn?: () => Promise<void>, options?: IPollForOptions<T>): Promise<void>;
export declare function pollForApproximate<T>(page: playwright.Page, marginOfError: number, evalOrFn: string | (() => MaybeAsync<T>), val: T, preFn?: () => Promise<void>, maxDuration?: number, stack?: string): Promise<void>;
export declare function writeSync(page: playwright.Page, data: string): Promise<void>;
export declare function timeout(ms: number): Promise<void>;
export declare function getBrowserType(): playwright.BrowserType<playwright.WebKitBrowser> | playwright.BrowserType<playwright.ChromiumBrowser> | playwright.BrowserType<playwright.FirefoxBrowser>;
export declare function launchBrowser(): Promise<playwright.Browser>;
export {};
