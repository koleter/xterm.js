import { ITerminal } from 'browser/Types';
import { Disposable } from 'common/Lifecycle';
import { ICoreBrowserService, IRenderService } from 'browser/services/Services';
import { IInstantiationService } from 'common/services/Services';
export declare class AccessibilityManager extends Disposable {
    private readonly _terminal;
    private readonly _coreBrowserService;
    private readonly _renderService;
    private _debugRootContainer;
    private _accessibilityContainer;
    private _rowContainer;
    private _rowElements;
    private _rowColumns;
    private _liveRegion;
    private _liveRegionLineCount;
    private _liveRegionDebouncer;
    private _topBoundaryFocusListener;
    private _bottomBoundaryFocusListener;
    private _charsToConsume;
    private _charsToAnnounce;
    constructor(_terminal: ITerminal, instantiationService: IInstantiationService, _coreBrowserService: ICoreBrowserService, _renderService: IRenderService);
    private _handleTab;
    private _handleChar;
    private _clearLiveRegion;
    private _handleKey;
    private _refreshRows;
    private _renderRows;
    private _announceCharacters;
    private _handleBoundaryFocus;
    private _handleSelectionChange;
    private _handleResize;
    private _createAccessibilityTreeNode;
    private _refreshRowsDimensions;
    private _refreshRowDimensions;
}
//# sourceMappingURL=AccessibilityManager.d.ts.map