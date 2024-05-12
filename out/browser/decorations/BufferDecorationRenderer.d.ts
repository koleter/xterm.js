import { ICoreBrowserService, IRenderService } from 'browser/services/Services';
import { Disposable } from 'common/Lifecycle';
import { IBufferService, IDecorationService } from 'common/services/Services';
export declare class BufferDecorationRenderer extends Disposable {
    private readonly _screenElement;
    private readonly _bufferService;
    private readonly _coreBrowserService;
    private readonly _decorationService;
    private readonly _renderService;
    private readonly _container;
    private readonly _decorationElements;
    private _animationFrame;
    private _altBufferIsActive;
    private _dimensionsChanged;
    constructor(_screenElement: HTMLElement, _bufferService: IBufferService, _coreBrowserService: ICoreBrowserService, _decorationService: IDecorationService, _renderService: IRenderService);
    private _queueRefresh;
    private _doRefreshDecorations;
    private _renderDecoration;
    private _createElement;
    private _refreshStyle;
    private _refreshXPosition;
    private _removeDecoration;
}
//# sourceMappingURL=BufferDecorationRenderer.d.ts.map