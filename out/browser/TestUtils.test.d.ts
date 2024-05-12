import { IDisposable, IMarker, ILinkProvider, IDecorationOptions, IDecoration } from '@xterm/xterm';
import { IEvent } from 'common/EventEmitter';
import { ICharacterJoinerService, ICharSizeService, ICoreBrowserService, IMouseService, IRenderService, ISelectionService, IThemeService } from 'browser/services/Services';
import { IRenderDimensions, IRenderer, IRequestRedrawEvent } from 'browser/renderer/shared/Types';
import { IColorSet, ITerminal, ILinkifier2, IBrowser, IViewport, ICompositionHelper, CharacterJoinerHandler, IBufferRange, ReadonlyColorSet, IBufferElementProvider } from 'browser/Types';
import { IBuffer, IBufferSet } from 'common/buffer/Types';
import { IBufferLine, ICellData, IAttributeData, ICircularList, XtermListener, ICharset, ITerminalOptions, ColorIndex } from 'common/Types';
import { Terminal } from 'browser/Terminal';
import { IUnicodeService, IOptionsService, ICoreService, ICoreMouseService } from 'common/services/Services';
import { IFunctionIdentifier, IParams } from 'common/parser/Types';
import { AttributeData } from 'common/buffer/AttributeData';
import { ISelectionRedrawRequestEvent, ISelectionRequestScrollLinesEvent } from 'browser/selection/Types';
export declare class TestTerminal extends Terminal {
    get curAttrData(): IAttributeData;
    keyDown(ev: any): boolean | undefined;
    keyPress(ev: any): boolean;
    writeP(data: string | Uint8Array): Promise<string>;
}
export declare class MockTerminal implements ITerminal {
    onBlur: IEvent<void>;
    onFocus: IEvent<void>;
    onA11yChar: IEvent<string>;
    onWriteParsed: IEvent<void>;
    onA11yTab: IEvent<number>;
    onCursorMove: IEvent<void>;
    onLineFeed: IEvent<void>;
    onSelectionChange: IEvent<void>;
    onData: IEvent<string>;
    onBinary: IEvent<string>;
    onTitleChange: IEvent<string>;
    onBell: IEvent<void>;
    onScroll: IEvent<number>;
    onWillOpen: IEvent<HTMLElement>;
    onKey: IEvent<{
        key: string;
        domEvent: KeyboardEvent;
    }>;
    onRender: IEvent<{
        start: number;
        end: number;
    }>;
    onResize: IEvent<{
        cols: number;
        rows: number;
    }>;
    markers: IMarker[];
    linkifier: ILinkifier2 | undefined;
    coreMouseService: ICoreMouseService;
    coreService: ICoreService;
    optionsService: IOptionsService;
    unicodeService: IUnicodeService;
    registerMarker(cursorYOffset: number): IMarker;
    selectLines(start: number, end: number): void;
    scrollToLine(line: number): void;
    static string: any;
    setOption(key: any, value: any): void;
    blur(): void;
    focus(): void;
    input(data: string, wasUserInput?: boolean): void;
    resize(columns: number, rows: number): void;
    writeln(data: string): void;
    paste(data: string): void;
    open(parent: HTMLElement): void;
    attachCustomKeyEventHandler(customKeyEventHandler: (event: KeyboardEvent) => boolean): void;
    attachCustomWheelEventHandler(customWheelEventHandler: (event: WheelEvent) => boolean): void;
    registerCsiHandler(id: IFunctionIdentifier, callback: (params: IParams) => boolean | Promise<boolean>): IDisposable;
    registerDcsHandler(id: IFunctionIdentifier, callback: (data: string, param: IParams) => boolean | Promise<boolean>): IDisposable;
    registerEscHandler(id: IFunctionIdentifier, handler: () => boolean | Promise<boolean>): IDisposable;
    registerOscHandler(ident: number, callback: (data: string) => boolean | Promise<boolean>): IDisposable;
    registerLinkProvider(linkProvider: ILinkProvider): IDisposable;
    registerDecoration(decorationOptions: IDecorationOptions): IDecoration | undefined;
    hasSelection(): boolean;
    getSelection(): string;
    getSelectionPosition(): IBufferRange | undefined;
    clearSelection(): void;
    select(column: number, row: number, length: number): void;
    selectAll(): void;
    dispose(): void;
    scrollPages(pageCount: number): void;
    scrollToTop(): void;
    scrollToBottom(): void;
    clear(): void;
    write(data: string): void;
    getBufferElements(startLine: number, endLine?: number | undefined): {
        bufferElements: HTMLElement[];
        cursorElement?: HTMLElement | undefined;
    };
    registerBufferElementProvider(bufferProvider: IBufferElementProvider): IDisposable;
    bracketedPasteMode: boolean;
    renderer: IRenderer;
    isFocused: boolean;
    options: Required<ITerminalOptions>;
    element: HTMLElement;
    screenElement: HTMLElement;
    rowContainer: HTMLElement;
    selectionContainer: HTMLElement;
    selectionService: ISelectionService;
    textarea: HTMLTextAreaElement;
    rows: number;
    cols: number;
    browser: IBrowser;
    writeBuffer: string[];
    children: HTMLElement[];
    cursorHidden: boolean;
    cursorState: number;
    scrollback: number;
    buffers: IBufferSet;
    buffer: IBuffer;
    viewport: IViewport;
    applicationCursor: boolean;
    handler(data: string): void;
    on(event: string, callback: (...args: any[]) => void): void;
    off(type: string, listener: XtermListener): void;
    addDisposableListener(type: string, handler: XtermListener): IDisposable;
    scrollLines(disp: number): void;
    scrollToRow(absoluteRow: number): number;
    cancel(ev: Event, force?: boolean): void;
    log(text: string): void;
    emit(event: string, data: any): void;
    reset(): void;
    clearTextureAtlas(): void;
    refresh(start: number, end: number): void;
    registerCharacterJoiner(handler: CharacterJoinerHandler): number;
    deregisterCharacterJoiner(joinerId: number): void;
}
export declare class MockBuffer implements IBuffer {
    markers: IMarker[];
    addMarker(y: number): IMarker;
    isCursorInViewport: boolean;
    lines: ICircularList<IBufferLine>;
    ydisp: number;
    ybase: number;
    hasScrollback: boolean;
    y: number;
    x: number;
    tabs: any;
    scrollBottom: number;
    scrollTop: number;
    savedY: number;
    savedX: number;
    savedCharset: ICharset | undefined;
    savedCurAttrData: AttributeData;
    translateBufferLineToString(lineIndex: number, trimRight: boolean, startCol?: number, endCol?: number): string;
    getWrappedRangeForLine(y: number): {
        first: number;
        last: number;
    };
    nextStop(x?: number): number;
    prevStop(x?: number): number;
    setLines(lines: ICircularList<IBufferLine>): void;
    getBlankLine(attr: IAttributeData, isWrapped?: boolean): IBufferLine;
    getNullCell(attr?: IAttributeData): ICellData;
    getWhitespaceCell(attr?: IAttributeData): ICellData;
    clearMarkers(y: number): void;
    clearAllMarkers(): void;
}
export declare class MockRenderer implements IRenderer {
    onRequestRedraw: IEvent<IRequestRedrawEvent>;
    onCanvasResize: IEvent<{
        width: number;
        height: number;
    }>;
    onRender: IEvent<{
        start: number;
        end: number;
    }>;
    dispose(): void;
    on(type: string, listener: XtermListener): void;
    off(type: string, listener: XtermListener): void;
    emit(type: string, data?: any): void;
    addDisposableListener(type: string, handler: XtermListener): IDisposable;
    dimensions: IRenderDimensions;
    registerDecoration(decorationOptions: IDecorationOptions): IDecoration;
    handleResize(cols: number, rows: number): void;
    handleCharSizeChanged(): void;
    handleBlur(): void;
    handleFocus(): void;
    handleSelectionChanged(start: [number, number], end: [number, number]): void;
    handleCursorMove(): void;
    handleOptionsChanged(): void;
    handleDevicePixelRatioChange(): void;
    clear(): void;
    renderRows(start: number, end: number): void;
}
export declare class MockViewport implements IViewport {
    private readonly _onRequestScrollLines;
    readonly onRequestScrollLines: IEvent<{
        amount: number;
        suppressScrollEvent: boolean;
    }, void>;
    dispose(): void;
    scrollBarWidth: number;
    handleThemeChange(colors: IColorSet): void;
    handleWheel(ev: WheelEvent): boolean;
    handleTouchStart(ev: TouchEvent): void;
    handleTouchMove(ev: TouchEvent): boolean;
    syncScrollArea(): void;
    getLinesScrolled(ev: WheelEvent): number;
    getBufferElements(startLine: number, endLine?: number | undefined): {
        bufferElements: HTMLElement[];
        cursorElement?: HTMLElement | undefined;
    };
    scrollLines(disp: number): void;
    reset(): void;
}
export declare class MockCompositionHelper implements ICompositionHelper {
    get isComposing(): boolean;
    compositionstart(): void;
    compositionupdate(ev: CompositionEvent): void;
    compositionend(): void;
    updateCompositionElements(dontRecurse?: boolean): void;
    keydown(ev: KeyboardEvent): boolean;
}
export declare class MockCoreBrowserService implements ICoreBrowserService {
    onDprChange: IEvent<number, void>;
    onWindowChange: IEvent<Window & typeof globalThis, void>;
    serviceBrand: undefined;
    isFocused: boolean;
    get window(): Window & typeof globalThis;
    get mainDocument(): Document;
    dpr: number;
}
export declare class MockCharSizeService implements ICharSizeService {
    width: number;
    height: number;
    serviceBrand: undefined;
    get hasValidSize(): boolean;
    onCharSizeChange: IEvent<void>;
    constructor(width: number, height: number);
    measure(): void;
}
export declare class MockMouseService implements IMouseService {
    serviceBrand: undefined;
    getCoords(event: {
        clientX: number;
        clientY: number;
    }, element: HTMLElement, colCount: number, rowCount: number, isSelection?: boolean): [number, number] | undefined;
    getMouseReportCoords(event: MouseEvent, element: HTMLElement): {
        col: number;
        row: number;
        x: number;
        y: number;
    } | undefined;
}
export declare class MockRenderService implements IRenderService {
    serviceBrand: undefined;
    onDimensionsChange: IEvent<IRenderDimensions>;
    onRenderedViewportChange: IEvent<{
        start: number;
        end: number;
    }, void>;
    onRender: IEvent<{
        start: number;
        end: number;
    }, void>;
    onRefreshRequest: IEvent<{
        start: number;
        end: number;
    }, void>;
    dimensions: IRenderDimensions;
    refreshRows(start: number, end: number): void;
    addRefreshCallback(callback: FrameRequestCallback): number;
    clearTextureAtlas(): void;
    resize(cols: number, rows: number): void;
    hasRenderer(): boolean;
    setRenderer(renderer: IRenderer): void;
    handleDevicePixelRatioChange(): void;
    handleResize(cols: number, rows: number): void;
    handleCharSizeChanged(): void;
    handleBlur(): void;
    handleFocus(): void;
    handleSelectionChanged(start: [number, number], end: [number, number], columnSelectMode: boolean): void;
    handleCursorMove(): void;
    clear(): void;
    dispose(): void;
    registerDecoration(decorationOptions: IDecorationOptions): IDecoration;
}
export declare class MockCharacterJoinerService implements ICharacterJoinerService {
    serviceBrand: undefined;
    register(handler: (text: string) => [number, number][]): number;
    deregister(joinerId: number): boolean;
    getJoinedCharacters(row: number): [number, number][];
}
export declare class MockSelectionService implements ISelectionService {
    serviceBrand: undefined;
    selectionText: string;
    hasSelection: boolean;
    selectionStart: [number, number] | undefined;
    selectionEnd: [number, number] | undefined;
    onLinuxMouseSelection: IEvent<string, void>;
    onRequestRedraw: IEvent<ISelectionRedrawRequestEvent, void>;
    onRequestScrollLines: IEvent<ISelectionRequestScrollLinesEvent, void>;
    onSelectionChange: IEvent<void, void>;
    disable(): void;
    enable(): void;
    reset(): void;
    setSelection(row: number, col: number, length: number): void;
    selectAll(): void;
    selectLines(start: number, end: number): void;
    clearSelection(): void;
    rightClickSelect(event: MouseEvent): void;
    shouldColumnSelect(event: MouseEvent | KeyboardEvent): boolean;
    shouldForceSelection(event: MouseEvent): boolean;
    refresh(isLinuxMouseSelection?: boolean): void;
    handleMouseDown(event: MouseEvent): void;
    isCellInSelection(x: number, y: number): boolean;
}
export declare class MockThemeService implements IThemeService {
    serviceBrand: undefined;
    onChangeColors: IEvent<ReadonlyColorSet, void>;
    restoreColor(slot?: ColorIndex | undefined): void;
    modifyColors(callback: (colors: IColorSet) => void): void;
    colors: ReadonlyColorSet;
}
//# sourceMappingURL=TestUtils.test.d.ts.map