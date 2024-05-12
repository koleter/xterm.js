"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRenderLayer = void 0;
const CharAtlasCache_1 = require("browser/renderer/shared/CharAtlasCache");
const Constants_1 = require("browser/renderer/shared/Constants");
const RendererUtils_1 = require("browser/renderer/shared/RendererUtils");
const Lifecycle_1 = require("common/Lifecycle");
class BaseRenderLayer extends Lifecycle_1.Disposable {
    constructor(terminal, _container, id, zIndex, _alpha, _coreBrowserService, _optionsService, _themeService) {
        super();
        this._container = _container;
        this._alpha = _alpha;
        this._coreBrowserService = _coreBrowserService;
        this._optionsService = _optionsService;
        this._themeService = _themeService;
        this._deviceCharWidth = 0;
        this._deviceCharHeight = 0;
        this._deviceCellWidth = 0;
        this._deviceCellHeight = 0;
        this._deviceCharLeft = 0;
        this._deviceCharTop = 0;
        this._canvas = this._coreBrowserService.mainDocument.createElement('canvas');
        this._canvas.classList.add(`xterm-${id}-layer`);
        this._canvas.style.zIndex = zIndex.toString();
        this._initCanvas();
        this._container.appendChild(this._canvas);
        this.register(this._themeService.onChangeColors(e => {
            this._refreshCharAtlas(terminal, e);
            this.reset(terminal);
        }));
        this.register((0, Lifecycle_1.toDisposable)(() => {
            this._canvas.remove();
        }));
    }
    _initCanvas() {
        this._ctx = (0, RendererUtils_1.throwIfFalsy)(this._canvas.getContext('2d', { alpha: this._alpha }));
        if (!this._alpha) {
            this._clearAll();
        }
    }
    handleBlur(terminal) { }
    handleFocus(terminal) { }
    handleCursorMove(terminal) { }
    handleGridChanged(terminal, startRow, endRow) { }
    handleSelectionChanged(terminal, start, end, columnSelectMode = false) { }
    _setTransparency(terminal, alpha) {
        if (alpha === this._alpha) {
            return;
        }
        const oldCanvas = this._canvas;
        this._alpha = alpha;
        this._canvas = this._canvas.cloneNode();
        this._initCanvas();
        this._container.replaceChild(this._canvas, oldCanvas);
        this._refreshCharAtlas(terminal, this._themeService.colors);
        this.handleGridChanged(terminal, 0, terminal.rows - 1);
    }
    _refreshCharAtlas(terminal, colorSet) {
        if (this._deviceCharWidth <= 0 && this._deviceCharHeight <= 0) {
            return;
        }
        this._charAtlas = (0, CharAtlasCache_1.acquireTextureAtlas)(terminal, this._optionsService.rawOptions, colorSet, this._deviceCellWidth, this._deviceCellHeight, this._deviceCharWidth, this._deviceCharHeight, this._coreBrowserService.dpr);
        this._charAtlas.warmUp();
    }
    resize(terminal, dim) {
        this._deviceCellWidth = dim.device.cell.width;
        this._deviceCellHeight = dim.device.cell.height;
        this._deviceCharWidth = dim.device.char.width;
        this._deviceCharHeight = dim.device.char.height;
        this._deviceCharLeft = dim.device.char.left;
        this._deviceCharTop = dim.device.char.top;
        this._canvas.width = dim.device.canvas.width;
        this._canvas.height = dim.device.canvas.height;
        this._canvas.style.width = `${dim.css.canvas.width}px`;
        this._canvas.style.height = `${dim.css.canvas.height}px`;
        if (!this._alpha) {
            this._clearAll();
        }
        this._refreshCharAtlas(terminal, this._themeService.colors);
    }
    _fillBottomLineAtCells(x, y, width = 1) {
        this._ctx.fillRect(x * this._deviceCellWidth, (y + 1) * this._deviceCellHeight - this._coreBrowserService.dpr - 1, width * this._deviceCellWidth, this._coreBrowserService.dpr);
    }
    _clearAll() {
        if (this._alpha) {
            this._ctx.clearRect(0, 0, this._canvas.width, this._canvas.height);
        }
        else {
            this._ctx.fillStyle = this._themeService.colors.background.css;
            this._ctx.fillRect(0, 0, this._canvas.width, this._canvas.height);
        }
    }
    _clearCells(x, y, width, height) {
        if (this._alpha) {
            this._ctx.clearRect(x * this._deviceCellWidth, y * this._deviceCellHeight, width * this._deviceCellWidth, height * this._deviceCellHeight);
        }
        else {
            this._ctx.fillStyle = this._themeService.colors.background.css;
            this._ctx.fillRect(x * this._deviceCellWidth, y * this._deviceCellHeight, width * this._deviceCellWidth, height * this._deviceCellHeight);
        }
    }
    _fillCharTrueColor(terminal, cell, x, y) {
        this._ctx.font = this._getFont(terminal, false, false);
        this._ctx.textBaseline = Constants_1.TEXT_BASELINE;
        this._clipCell(x, y, cell.getWidth());
        this._ctx.fillText(cell.getChars(), x * this._deviceCellWidth + this._deviceCharLeft, y * this._deviceCellHeight + this._deviceCharTop + this._deviceCharHeight);
    }
    _clipCell(x, y, width) {
        this._ctx.beginPath();
        this._ctx.rect(x * this._deviceCellWidth, y * this._deviceCellHeight, width * this._deviceCellWidth, this._deviceCellHeight);
        this._ctx.clip();
    }
    _getFont(terminal, isBold, isItalic) {
        const fontWeight = isBold ? terminal.options.fontWeightBold : terminal.options.fontWeight;
        const fontStyle = isItalic ? 'italic' : '';
        return `${fontStyle} ${fontWeight} ${terminal.options.fontSize * this._coreBrowserService.dpr}px ${terminal.options.fontFamily}`;
    }
}
exports.BaseRenderLayer = BaseRenderLayer;
//# sourceMappingURL=BaseRenderLayer.js.map