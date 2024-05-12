import { IBufferLine } from 'common/Types';
import { ICoreService, IDecorationService, IOptionsService } from 'common/services/Services';
import { ICharacterJoinerService, ICoreBrowserService, IThemeService } from 'browser/services/Services';
import { WidthCache } from 'browser/renderer/dom/WidthCache';
export declare const enum RowCss {
    BOLD_CLASS = "xterm-bold",
    DIM_CLASS = "xterm-dim",
    ITALIC_CLASS = "xterm-italic",
    UNDERLINE_CLASS = "xterm-underline",
    OVERLINE_CLASS = "xterm-overline",
    STRIKETHROUGH_CLASS = "xterm-strikethrough",
    CURSOR_CLASS = "xterm-cursor",
    CURSOR_BLINK_CLASS = "xterm-cursor-blink",
    CURSOR_STYLE_BLOCK_CLASS = "xterm-cursor-block",
    CURSOR_STYLE_OUTLINE_CLASS = "xterm-cursor-outline",
    CURSOR_STYLE_BAR_CLASS = "xterm-cursor-bar",
    CURSOR_STYLE_UNDERLINE_CLASS = "xterm-cursor-underline"
}
export declare class DomRendererRowFactory {
    private readonly _document;
    private readonly _characterJoinerService;
    private readonly _optionsService;
    private readonly _coreBrowserService;
    private readonly _coreService;
    private readonly _decorationService;
    private readonly _themeService;
    private _workCell;
    private _selectionStart;
    private _selectionEnd;
    private _columnSelectMode;
    defaultSpacing: number;
    constructor(_document: Document, _characterJoinerService: ICharacterJoinerService, _optionsService: IOptionsService, _coreBrowserService: ICoreBrowserService, _coreService: ICoreService, _decorationService: IDecorationService, _themeService: IThemeService);
    handleSelectionChanged(start: [number, number] | undefined, end: [number, number] | undefined, columnSelectMode: boolean): void;
    createRow(lineData: IBufferLine, row: number, isCursorRow: boolean, cursorStyle: string | undefined, cursorInactiveStyle: string | undefined, cursorX: number, cursorBlink: boolean, cellWidth: number, widthCache: WidthCache, linkStart: number, linkEnd: number): HTMLSpanElement[];
    private _applyMinimumContrast;
    private _getContrastCache;
    private _addStyle;
    private _isCellInSelection;
}
//# sourceMappingURL=DomRendererRowFactory.d.ts.map