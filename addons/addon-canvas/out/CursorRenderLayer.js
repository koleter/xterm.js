"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CursorRenderLayer = void 0;
const CursorBlinkStateManager_1 = require("browser/renderer/shared/CursorBlinkStateManager");
const Lifecycle_1 = require("common/Lifecycle");
const Platform_1 = require("common/Platform");
const CellData_1 = require("common/buffer/CellData");
const BaseRenderLayer_1 = require("./BaseRenderLayer");
class CursorRenderLayer extends BaseRenderLayer_1.BaseRenderLayer {
    constructor(terminal, container, zIndex, _onRequestRedraw, bufferService, optionsService, _coreService, coreBrowserService, decorationService, themeService) {
        super(terminal, container, 'cursor', zIndex, true, themeService, bufferService, optionsService, decorationService, coreBrowserService);
        this._onRequestRedraw = _onRequestRedraw;
        this._coreService = _coreService;
        this._cursorBlinkStateManager = this.register(new Lifecycle_1.MutableDisposable());
        this._cell = new CellData_1.CellData();
        this._state = {
            x: 0,
            y: 0,
            isFocused: false,
            style: '',
            width: 0
        };
        this._cursorRenderers = {
            'bar': this._renderBarCursor.bind(this),
            'block': this._renderBlockCursor.bind(this),
            'underline': this._renderUnderlineCursor.bind(this),
            'outline': this._renderOutlineCursor.bind(this)
        };
        this.register(optionsService.onOptionChange(() => this._handleOptionsChanged()));
        this._handleOptionsChanged();
    }
    resize(dim) {
        super.resize(dim);
        this._state = {
            x: 0,
            y: 0,
            isFocused: false,
            style: '',
            width: 0
        };
    }
    reset() {
        this._clearCursor();
        this._cursorBlinkStateManager.value?.restartBlinkAnimation();
        this._handleOptionsChanged();
    }
    handleBlur() {
        this._cursorBlinkStateManager.value?.pause();
        this._onRequestRedraw.fire({ start: this._bufferService.buffer.y, end: this._bufferService.buffer.y });
    }
    handleFocus() {
        this._cursorBlinkStateManager.value?.resume();
        this._onRequestRedraw.fire({ start: this._bufferService.buffer.y, end: this._bufferService.buffer.y });
    }
    _handleOptionsChanged() {
        if (this._optionsService.rawOptions.cursorBlink) {
            if (!this._cursorBlinkStateManager.value) {
                this._cursorBlinkStateManager.value = new CursorBlinkStateManager_1.CursorBlinkStateManager(() => this._render(true), this._coreBrowserService);
            }
        }
        else {
            this._cursorBlinkStateManager.clear();
        }
        this._onRequestRedraw.fire({ start: this._bufferService.buffer.y, end: this._bufferService.buffer.y });
    }
    handleCursorMove() {
        this._cursorBlinkStateManager.value?.restartBlinkAnimation();
    }
    handleGridChanged(startRow, endRow) {
        if (!this._cursorBlinkStateManager.value || this._cursorBlinkStateManager.value.isPaused) {
            this._render(false);
        }
        else {
            this._cursorBlinkStateManager.value.restartBlinkAnimation();
        }
    }
    _render(triggeredByAnimationFrame) {
        if (!this._coreService.isCursorInitialized || this._coreService.isCursorHidden) {
            this._clearCursor();
            return;
        }
        const cursorY = this._bufferService.buffer.ybase + this._bufferService.buffer.y;
        const viewportRelativeCursorY = cursorY - this._bufferService.buffer.ydisp;
        if (viewportRelativeCursorY < 0 || viewportRelativeCursorY >= this._bufferService.rows) {
            this._clearCursor();
            return;
        }
        const cursorX = Math.min(this._bufferService.buffer.x, this._bufferService.cols - 1);
        this._bufferService.buffer.lines.get(cursorY).loadCell(cursorX, this._cell);
        if (this._cell.content === undefined) {
            return;
        }
        if (!this._coreBrowserService.isFocused) {
            this._clearCursor();
            this._ctx.save();
            this._ctx.fillStyle = this._themeService.colors.cursor.css;
            const cursorStyle = this._optionsService.rawOptions.cursorStyle;
            const cursorInactiveStyle = this._optionsService.rawOptions.cursorInactiveStyle;
            if (cursorInactiveStyle && cursorInactiveStyle !== 'none') {
                this._cursorRenderers[cursorInactiveStyle](cursorX, viewportRelativeCursorY, this._cell);
            }
            this._ctx.restore();
            this._state.x = cursorX;
            this._state.y = viewportRelativeCursorY;
            this._state.isFocused = false;
            this._state.style = cursorStyle;
            this._state.width = this._cell.getWidth();
            return;
        }
        if (this._cursorBlinkStateManager.value && !this._cursorBlinkStateManager.value.isCursorVisible) {
            this._clearCursor();
            return;
        }
        if (this._state) {
            if (this._state.x === cursorX &&
                this._state.y === viewportRelativeCursorY &&
                this._state.isFocused === this._coreBrowserService.isFocused &&
                this._state.style === this._optionsService.rawOptions.cursorStyle &&
                this._state.width === this._cell.getWidth()) {
                return;
            }
            this._clearCursor();
        }
        this._ctx.save();
        this._cursorRenderers[this._optionsService.rawOptions.cursorStyle || 'block'](cursorX, viewportRelativeCursorY, this._cell);
        this._ctx.restore();
        this._state.x = cursorX;
        this._state.y = viewportRelativeCursorY;
        this._state.isFocused = false;
        this._state.style = this._optionsService.rawOptions.cursorStyle;
        this._state.width = this._cell.getWidth();
    }
    _clearCursor() {
        if (this._state) {
            if (Platform_1.isFirefox || this._coreBrowserService.dpr < 1) {
                this._clearAll();
            }
            else {
                this._clearCells(this._state.x, this._state.y, this._state.width, 1);
            }
            this._state = {
                x: 0,
                y: 0,
                isFocused: false,
                style: '',
                width: 0
            };
        }
    }
    _renderBarCursor(x, y, cell) {
        this._ctx.save();
        this._ctx.fillStyle = this._themeService.colors.cursor.css;
        this._fillLeftLineAtCell(x, y, this._optionsService.rawOptions.cursorWidth);
        this._ctx.restore();
    }
    _renderBlockCursor(x, y, cell) {
        this._ctx.save();
        this._ctx.fillStyle = this._themeService.colors.cursor.css;
        this._fillCells(x, y, cell.getWidth(), 1);
        this._ctx.fillStyle = this._themeService.colors.cursorAccent.css;
        this._fillCharTrueColor(cell, x, y);
        this._ctx.restore();
    }
    _renderUnderlineCursor(x, y, cell) {
        this._ctx.save();
        this._ctx.fillStyle = this._themeService.colors.cursor.css;
        this._fillBottomLineAtCells(x, y);
        this._ctx.restore();
    }
    _renderOutlineCursor(x, y, cell) {
        this._ctx.save();
        this._ctx.strokeStyle = this._themeService.colors.cursor.css;
        this._strokeRectAtCell(x, y, cell.getWidth(), 1);
        this._ctx.restore();
    }
}
exports.CursorRenderLayer = CursorRenderLayer;
//# sourceMappingURL=CursorRenderLayer.js.map