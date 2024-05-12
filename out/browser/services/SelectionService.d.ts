import { ILinkifier2 } from 'browser/Types';
import { SelectionModel } from 'browser/selection/SelectionModel';
import { ISelectionRedrawRequestEvent, ISelectionRequestScrollLinesEvent } from 'browser/selection/Types';
import { ICoreBrowserService, IMouseService, IRenderService, ISelectionService } from 'browser/services/Services';
import { Disposable } from 'common/Lifecycle';
import { IBufferService, ICoreService, IOptionsService } from 'common/services/Services';
export declare const enum SelectionMode {
    NORMAL = 0,
    WORD = 1,
    LINE = 2,
    COLUMN = 3
}
export declare class SelectionService extends Disposable implements ISelectionService {
    private readonly _element;
    private readonly _screenElement;
    private readonly _linkifier;
    private readonly _bufferService;
    private readonly _coreService;
    private readonly _mouseService;
    private readonly _optionsService;
    private readonly _renderService;
    private readonly _coreBrowserService;
    serviceBrand: undefined;
    protected _model: SelectionModel;
    private _dragScrollAmount;
    protected _activeSelectionMode: SelectionMode;
    private _dragScrollIntervalTimer;
    private _refreshAnimationFrame;
    private _enabled;
    private _mouseMoveListener;
    private _mouseUpListener;
    private _trimListener;
    private _workCell;
    private _mouseDownTimeStamp;
    private _oldHasSelection;
    private _oldSelectionStart;
    private _oldSelectionEnd;
    private readonly _onLinuxMouseSelection;
    readonly onLinuxMouseSelection: import("common/EventEmitter").IEvent<string, void>;
    private readonly _onRedrawRequest;
    readonly onRequestRedraw: import("common/EventEmitter").IEvent<ISelectionRedrawRequestEvent, void>;
    private readonly _onSelectionChange;
    readonly onSelectionChange: import("common/EventEmitter").IEvent<void, void>;
    private readonly _onRequestScrollLines;
    readonly onRequestScrollLines: import("common/EventEmitter").IEvent<ISelectionRequestScrollLinesEvent, void>;
    constructor(_element: HTMLElement, _screenElement: HTMLElement, _linkifier: ILinkifier2, _bufferService: IBufferService, _coreService: ICoreService, _mouseService: IMouseService, _optionsService: IOptionsService, _renderService: IRenderService, _coreBrowserService: ICoreBrowserService);
    reset(): void;
    disable(): void;
    enable(): void;
    get selectionStart(): [number, number] | undefined;
    get selectionEnd(): [number, number] | undefined;
    get hasSelection(): boolean;
    get selectionText(): string;
    clearSelection(): void;
    refresh(isLinuxMouseSelection?: boolean): void;
    private _refresh;
    private _isClickInSelection;
    isCellInSelection(x: number, y: number): boolean;
    protected _areCoordsInSelection(coords: [number, number], start: [number, number], end: [number, number]): boolean;
    private _selectWordAtCursor;
    selectAll(): void;
    selectLines(start: number, end: number): void;
    private _handleTrim;
    private _getMouseBufferCoords;
    private _getMouseEventScrollAmount;
    shouldForceSelection(event: MouseEvent): boolean;
    handleMouseDown(event: MouseEvent): void;
    private _addMouseDownListeners;
    private _removeMouseDownListeners;
    private _handleIncrementalClick;
    private _handleSingleClick;
    private _handleDoubleClick;
    private _handleTripleClick;
    shouldColumnSelect(event: KeyboardEvent | MouseEvent): boolean;
    private _handleMouseMove;
    private _dragScroll;
    private _handleMouseUp;
    private _fireEventIfSelectionChanged;
    private _fireOnSelectionChange;
    private _handleBufferActivate;
    private _convertViewportColToCharacterIndex;
    setSelection(col: number, row: number, length: number): void;
    rightClickSelect(ev: MouseEvent): void;
    private _getWordAt;
    protected _selectWordAt(coords: [number, number], allowWhitespaceOnlySelection: boolean): void;
    private _selectToWordAt;
    private _isCharWordSeparator;
    protected _selectLineAt(line: number): void;
}
//# sourceMappingURL=SelectionService.d.ts.map