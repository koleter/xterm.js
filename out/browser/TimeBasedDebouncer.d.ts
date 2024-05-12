import { IRenderDebouncer } from 'browser/Types';
export declare class TimeBasedDebouncer implements IRenderDebouncer {
    private _renderCallback;
    private readonly _debounceThresholdMS;
    private _rowStart;
    private _rowEnd;
    private _rowCount;
    private _lastRefreshMs;
    private _additionalRefreshRequested;
    private _refreshTimeoutID;
    constructor(_renderCallback: (start: number, end: number) => void, _debounceThresholdMS?: number);
    dispose(): void;
    refresh(rowStart: number | undefined, rowEnd: number | undefined, rowCount: number): void;
    private _innerRefresh;
}
//# sourceMappingURL=TimeBasedDebouncer.d.ts.map