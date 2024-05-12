import { IViewport } from 'browser/Types';
import { ICharSizeService, ICoreBrowserService, IRenderService, IThemeService } from 'browser/services/Services';
import { Disposable } from 'common/Lifecycle';
import { IBufferService, IOptionsService } from 'common/services/Services';
export declare class Viewport extends Disposable implements IViewport {
    private readonly _viewportElement;
    private readonly _scrollArea;
    private readonly _bufferService;
    private readonly _optionsService;
    private readonly _charSizeService;
    private readonly _renderService;
    private readonly _coreBrowserService;
    scrollBarWidth: number;
    private _currentRowHeight;
    private _currentDeviceCellHeight;
    private _lastRecordedBufferLength;
    private _lastRecordedViewportHeight;
    private _lastRecordedBufferHeight;
    private _lastTouchY;
    private _lastScrollTop;
    private _activeBuffer;
    private _renderDimensions;
    private _wheelPartialScroll;
    private _refreshAnimationFrame;
    private _ignoreNextScrollEvent;
    private _smoothScrollState;
    private readonly _onRequestScrollLines;
    readonly onRequestScrollLines: import("common/EventEmitter").IEvent<{
        amount: number;
        suppressScrollEvent: boolean;
    }, void>;
    constructor(_viewportElement: HTMLElement, _scrollArea: HTMLElement, _bufferService: IBufferService, _optionsService: IOptionsService, _charSizeService: ICharSizeService, _renderService: IRenderService, _coreBrowserService: ICoreBrowserService, themeService: IThemeService);
    private _handleThemeChange;
    reset(): void;
    private _refresh;
    private _innerRefresh;
    syncScrollArea(immediate?: boolean): void;
    private _handleScroll;
    private _smoothScroll;
    private _smoothScrollPercent;
    private _clearSmoothScrollState;
    private _bubbleScroll;
    handleWheel(ev: WheelEvent): boolean;
    scrollLines(disp: number): void;
    private _getPixelsScrolled;
    getBufferElements(startLine: number, endLine?: number): {
        bufferElements: HTMLElement[];
        cursorElement?: HTMLElement;
    };
    getLinesScrolled(ev: WheelEvent): number;
    private _applyScrollModifier;
    handleTouchStart(ev: TouchEvent): void;
    handleTouchMove(ev: TouchEvent): boolean;
}
//# sourceMappingURL=Viewport.d.ts.map