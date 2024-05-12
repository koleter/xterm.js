import { ICoreBrowserService } from 'browser/services/Services';
export declare class CursorBlinkStateManager {
    private _renderCallback;
    private _coreBrowserService;
    isCursorVisible: boolean;
    private _animationFrame;
    private _blinkStartTimeout;
    private _blinkInterval;
    private _animationTimeRestarted;
    constructor(_renderCallback: () => void, _coreBrowserService: ICoreBrowserService);
    get isPaused(): boolean;
    dispose(): void;
    restartBlinkAnimation(): void;
    private _restartInterval;
    pause(): void;
    resume(): void;
}
//# sourceMappingURL=CursorBlinkStateManager.d.ts.map