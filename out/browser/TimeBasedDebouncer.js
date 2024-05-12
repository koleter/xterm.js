"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TimeBasedDebouncer = void 0;
const RENDER_DEBOUNCE_THRESHOLD_MS = 1000;
class TimeBasedDebouncer {
    constructor(_renderCallback, _debounceThresholdMS = RENDER_DEBOUNCE_THRESHOLD_MS) {
        this._renderCallback = _renderCallback;
        this._debounceThresholdMS = _debounceThresholdMS;
        this._lastRefreshMs = 0;
        this._additionalRefreshRequested = false;
    }
    dispose() {
        if (this._refreshTimeoutID) {
            clearTimeout(this._refreshTimeoutID);
        }
    }
    refresh(rowStart, rowEnd, rowCount) {
        this._rowCount = rowCount;
        rowStart = rowStart !== undefined ? rowStart : 0;
        rowEnd = rowEnd !== undefined ? rowEnd : this._rowCount - 1;
        this._rowStart = this._rowStart !== undefined ? Math.min(this._rowStart, rowStart) : rowStart;
        this._rowEnd = this._rowEnd !== undefined ? Math.max(this._rowEnd, rowEnd) : rowEnd;
        const refreshRequestTime = Date.now();
        if (refreshRequestTime - this._lastRefreshMs >= this._debounceThresholdMS) {
            this._lastRefreshMs = refreshRequestTime;
            this._innerRefresh();
        }
        else if (!this._additionalRefreshRequested) {
            const elapsed = refreshRequestTime - this._lastRefreshMs;
            const waitPeriodBeforeTrailingRefresh = this._debounceThresholdMS - elapsed;
            this._additionalRefreshRequested = true;
            this._refreshTimeoutID = window.setTimeout(() => {
                this._lastRefreshMs = Date.now();
                this._innerRefresh();
                this._additionalRefreshRequested = false;
                this._refreshTimeoutID = undefined;
            }, waitPeriodBeforeTrailingRefresh);
        }
    }
    _innerRefresh() {
        if (this._rowStart === undefined || this._rowEnd === undefined || this._rowCount === undefined) {
            return;
        }
        const start = Math.max(this._rowStart, 0);
        const end = Math.min(this._rowEnd, this._rowCount - 1);
        this._rowStart = undefined;
        this._rowEnd = undefined;
        this._renderCallback(start, end);
    }
}
exports.TimeBasedDebouncer = TimeBasedDebouncer;
//# sourceMappingURL=TimeBasedDebouncer.js.map