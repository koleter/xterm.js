"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RenderDebouncer = void 0;
class RenderDebouncer {
    constructor(_renderCallback, _coreBrowserService) {
        this._renderCallback = _renderCallback;
        this._coreBrowserService = _coreBrowserService;
        this._refreshCallbacks = [];
    }
    dispose() {
        if (this._animationFrame) {
            this._coreBrowserService.window.cancelAnimationFrame(this._animationFrame);
            this._animationFrame = undefined;
        }
    }
    addRefreshCallback(callback) {
        this._refreshCallbacks.push(callback);
        if (!this._animationFrame) {
            this._animationFrame = this._coreBrowserService.window.requestAnimationFrame(() => this._innerRefresh());
        }
        return this._animationFrame;
    }
    refresh(rowStart, rowEnd, rowCount) {
        this._rowCount = rowCount;
        rowStart = rowStart !== undefined ? rowStart : 0;
        rowEnd = rowEnd !== undefined ? rowEnd : this._rowCount - 1;
        this._rowStart = this._rowStart !== undefined ? Math.min(this._rowStart, rowStart) : rowStart;
        this._rowEnd = this._rowEnd !== undefined ? Math.max(this._rowEnd, rowEnd) : rowEnd;
        if (this._animationFrame) {
            return;
        }
        this._animationFrame = this._coreBrowserService.window.requestAnimationFrame(() => this._innerRefresh());
    }
    _innerRefresh() {
        this._animationFrame = undefined;
        if (this._rowStart === undefined || this._rowEnd === undefined || this._rowCount === undefined) {
            this._runRefreshCallbacks();
            return;
        }
        const start = Math.max(this._rowStart, 0);
        const end = Math.min(this._rowEnd, this._rowCount - 1);
        this._rowStart = undefined;
        this._rowEnd = undefined;
        this._renderCallback(start, end);
        this._runRefreshCallbacks();
    }
    _runRefreshCallbacks() {
        for (const callback of this._refreshCallbacks) {
            callback(0);
        }
        this._refreshCallbacks = [];
    }
}
exports.RenderDebouncer = RenderDebouncer;
//# sourceMappingURL=RenderDebouncer.js.map