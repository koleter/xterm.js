import { IRenderDebouncerWithCallback } from 'browser/Types';
import { ICoreBrowserService } from 'browser/services/Services';
export declare class RenderDebouncer implements IRenderDebouncerWithCallback {
    private _renderCallback;
    private readonly _coreBrowserService;
    private _rowStart;
    private _rowEnd;
    private _rowCount;
    private _animationFrame;
    private _refreshCallbacks;
    constructor(_renderCallback: (start: number, end: number) => void, _coreBrowserService: ICoreBrowserService);
    dispose(): void;
    addRefreshCallback(callback: FrameRequestCallback): number;
    refresh(rowStart: number | undefined, rowEnd: number | undefined, rowCount: number): void;
    private _innerRefresh;
    private _runRefreshCallbacks;
}
//# sourceMappingURL=RenderDebouncer.d.ts.map