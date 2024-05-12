"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CursorBlinkStateManager = void 0;
const BLINK_INTERVAL = 600;
class CursorBlinkStateManager {
    constructor(_renderCallback, _coreBrowserService) {
        this._renderCallback = _renderCallback;
        this._coreBrowserService = _coreBrowserService;
        this.isCursorVisible = true;
        if (this._coreBrowserService.isFocused) {
            this._restartInterval();
        }
    }
    get isPaused() { return !(this._blinkStartTimeout || this._blinkInterval); }
    dispose() {
        if (this._blinkInterval) {
            this._coreBrowserService.window.clearInterval(this._blinkInterval);
            this._blinkInterval = undefined;
        }
        if (this._blinkStartTimeout) {
            this._coreBrowserService.window.clearTimeout(this._blinkStartTimeout);
            this._blinkStartTimeout = undefined;
        }
        if (this._animationFrame) {
            this._coreBrowserService.window.cancelAnimationFrame(this._animationFrame);
            this._animationFrame = undefined;
        }
    }
    restartBlinkAnimation() {
        if (this.isPaused) {
            return;
        }
        this._animationTimeRestarted = Date.now();
        this.isCursorVisible = true;
        if (!this._animationFrame) {
            this._animationFrame = this._coreBrowserService.window.requestAnimationFrame(() => {
                this._renderCallback();
                this._animationFrame = undefined;
            });
        }
    }
    _restartInterval(timeToStart = BLINK_INTERVAL) {
        if (this._blinkInterval) {
            this._coreBrowserService.window.clearInterval(this._blinkInterval);
            this._blinkInterval = undefined;
        }
        this._blinkStartTimeout = this._coreBrowserService.window.setTimeout(() => {
            if (this._animationTimeRestarted) {
                const time = BLINK_INTERVAL - (Date.now() - this._animationTimeRestarted);
                this._animationTimeRestarted = undefined;
                if (time > 0) {
                    this._restartInterval(time);
                    return;
                }
            }
            this.isCursorVisible = false;
            this._animationFrame = this._coreBrowserService.window.requestAnimationFrame(() => {
                this._renderCallback();
                this._animationFrame = undefined;
            });
            this._blinkInterval = this._coreBrowserService.window.setInterval(() => {
                if (this._animationTimeRestarted) {
                    const time = BLINK_INTERVAL - (Date.now() - this._animationTimeRestarted);
                    this._animationTimeRestarted = undefined;
                    this._restartInterval(time);
                    return;
                }
                this.isCursorVisible = !this.isCursorVisible;
                this._animationFrame = this._coreBrowserService.window.requestAnimationFrame(() => {
                    this._renderCallback();
                    this._animationFrame = undefined;
                });
            }, BLINK_INTERVAL);
        }, timeToStart);
    }
    pause() {
        this.isCursorVisible = true;
        if (this._blinkInterval) {
            this._coreBrowserService.window.clearInterval(this._blinkInterval);
            this._blinkInterval = undefined;
        }
        if (this._blinkStartTimeout) {
            this._coreBrowserService.window.clearTimeout(this._blinkStartTimeout);
            this._blinkStartTimeout = undefined;
        }
        if (this._animationFrame) {
            this._coreBrowserService.window.cancelAnimationFrame(this._animationFrame);
            this._animationFrame = undefined;
        }
    }
    resume() {
        this.pause();
        this._animationTimeRestarted = undefined;
        this._restartInterval();
        this.restartBlinkAnimation();
    }
}
exports.CursorBlinkStateManager = CursorBlinkStateManager;
//# sourceMappingURL=CursorBlinkStateManager.js.map