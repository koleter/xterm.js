"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BaseRenderLayer = void 0;
const CellColorResolver_1 = require("browser/renderer/shared/CellColorResolver");
const CharAtlasCache_1 = require("browser/renderer/shared/CharAtlasCache");
const Constants_1 = require("browser/renderer/shared/Constants");
const CustomGlyphs_1 = require("browser/renderer/shared/CustomGlyphs");
const RendererUtils_1 = require("browser/renderer/shared/RendererUtils");
const SelectionRenderModel_1 = require("browser/renderer/shared/SelectionRenderModel");
const EventEmitter_1 = require("common/EventEmitter");
const Lifecycle_1 = require("common/Lifecycle");
const Platform_1 = require("common/Platform");
const Constants_2 = require("common/buffer/Constants");
class BaseRenderLayer extends Lifecycle_1.Disposable {
    get canvas() { return this._canvas; }
    get cacheCanvas() { return this._charAtlas?.pages[0].canvas; }
    constructor(_terminal, _container, id, zIndex, _alpha, _themeService, _bufferService, _optionsService, _decorationService, _coreBrowserService) {
        super();
        this._terminal = _terminal;
        this._container = _container;
        this._alpha = _alpha;
        this._themeService = _themeService;
        this._bufferService = _bufferService;
        this._optionsService = _optionsService;
        this._decorationService = _decorationService;
        this._coreBrowserService = _coreBrowserService;
        this._deviceCharWidth = 0;
        this._deviceCharHeight = 0;
        this._deviceCellWidth = 0;
        this._deviceCellHeight = 0;
        this._deviceCharLeft = 0;
        this._deviceCharTop = 0;
        this._selectionModel = (0, SelectionRenderModel_1.createSelectionRenderModel)();
        this._bitmapGenerator = [];
        this._charAtlasDisposable = this.register(new Lifecycle_1.MutableDisposable());
        this._onAddTextureAtlasCanvas = this.register(new EventEmitter_1.EventEmitter());
        this.onAddTextureAtlasCanvas = this._onAddTextureAtlasCanvas.event;
        this._cellColorResolver = new CellColorResolver_1.CellColorResolver(this._terminal, this._optionsService, this._selectionModel, this._decorationService, this._coreBrowserService, this._themeService);
        this._canvas = this._coreBrowserService.mainDocument.createElement('canvas');
        this._canvas.classList.add(`xterm-${id}-layer`);
        this._canvas.style.zIndex = zIndex.toString();
        this._initCanvas();
        this._container.appendChild(this._canvas);
        this._refreshCharAtlas(this._themeService.colors);
        this.register(this._themeService.onChangeColors(e => {
            this._refreshCharAtlas(e);
            this.reset();
            this.handleSelectionChanged(this._selectionModel.selectionStart, this._selectionModel.selectionEnd, this._selectionModel.columnSelectMode);
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
    handleBlur() { }
    handleFocus() { }
    handleCursorMove() { }
    handleGridChanged(startRow, endRow) { }
    handleSelectionChanged(start, end, columnSelectMode = false) {
        this._selectionModel.update(this._terminal._core, start, end, columnSelectMode);
    }
    _setTransparency(alpha) {
        if (alpha === this._alpha) {
            return;
        }
        const oldCanvas = this._canvas;
        this._alpha = alpha;
        this._canvas = this._canvas.cloneNode();
        this._initCanvas();
        this._container.replaceChild(this._canvas, oldCanvas);
        this._refreshCharAtlas(this._themeService.colors);
        this.handleGridChanged(0, this._bufferService.rows - 1);
    }
    _refreshCharAtlas(colorSet) {
        if (this._deviceCharWidth <= 0 && this._deviceCharHeight <= 0) {
            return;
        }
        this._charAtlas = (0, CharAtlasCache_1.acquireTextureAtlas)(this._terminal, this._optionsService.rawOptions, colorSet, this._deviceCellWidth, this._deviceCellHeight, this._deviceCharWidth, this._deviceCharHeight, this._coreBrowserService.dpr);
        this._charAtlasDisposable.value = (0, EventEmitter_1.forwardEvent)(this._charAtlas.onAddTextureAtlasCanvas, this._onAddTextureAtlasCanvas);
        this._charAtlas.warmUp();
        for (let i = 0; i < this._charAtlas.pages.length; i++) {
            this._bitmapGenerator[i] = new BitmapGenerator(this._charAtlas.pages[i].canvas);
        }
    }
    resize(dim) {
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
        this._refreshCharAtlas(this._themeService.colors);
    }
    clearTextureAtlas() {
        this._charAtlas?.clearTexture();
    }
    _fillCells(x, y, width, height) {
        this._ctx.fillRect(x * this._deviceCellWidth, y * this._deviceCellHeight, width * this._deviceCellWidth, height * this._deviceCellHeight);
    }
    _fillMiddleLineAtCells(x, y, width = 1) {
        const cellOffset = Math.ceil(this._deviceCellHeight * 0.5);
        this._ctx.fillRect(x * this._deviceCellWidth, (y + 1) * this._deviceCellHeight - cellOffset - this._coreBrowserService.dpr, width * this._deviceCellWidth, this._coreBrowserService.dpr);
    }
    _fillBottomLineAtCells(x, y, width = 1, pixelOffset = 0) {
        this._ctx.fillRect(x * this._deviceCellWidth, (y + 1) * this._deviceCellHeight + pixelOffset - this._coreBrowserService.dpr - 1, width * this._deviceCellWidth, this._coreBrowserService.dpr);
    }
    _curlyUnderlineAtCell(x, y, width = 1) {
        this._ctx.save();
        this._ctx.beginPath();
        this._ctx.strokeStyle = this._ctx.fillStyle;
        const lineWidth = this._coreBrowserService.dpr;
        this._ctx.lineWidth = lineWidth;
        for (let xOffset = 0; xOffset < width; xOffset++) {
            const xLeft = (x + xOffset) * this._deviceCellWidth;
            const xMid = (x + xOffset + 0.5) * this._deviceCellWidth;
            const xRight = (x + xOffset + 1) * this._deviceCellWidth;
            const yMid = (y + 1) * this._deviceCellHeight - lineWidth - 1;
            const yMidBot = yMid - lineWidth;
            const yMidTop = yMid + lineWidth;
            this._ctx.moveTo(xLeft, yMid);
            this._ctx.bezierCurveTo(xLeft, yMidBot, xMid, yMidBot, xMid, yMid);
            this._ctx.bezierCurveTo(xMid, yMidTop, xRight, yMidTop, xRight, yMid);
        }
        this._ctx.stroke();
        this._ctx.restore();
    }
    _dottedUnderlineAtCell(x, y, width = 1) {
        this._ctx.save();
        this._ctx.beginPath();
        this._ctx.strokeStyle = this._ctx.fillStyle;
        const lineWidth = this._coreBrowserService.dpr;
        this._ctx.lineWidth = lineWidth;
        this._ctx.setLineDash([lineWidth * 2, lineWidth]);
        const xLeft = x * this._deviceCellWidth;
        const yMid = (y + 1) * this._deviceCellHeight - lineWidth - 1;
        this._ctx.moveTo(xLeft, yMid);
        for (let xOffset = 0; xOffset < width; xOffset++) {
            const xRight = (x + width + xOffset) * this._deviceCellWidth;
            this._ctx.lineTo(xRight, yMid);
        }
        this._ctx.stroke();
        this._ctx.closePath();
        this._ctx.restore();
    }
    _dashedUnderlineAtCell(x, y, width = 1) {
        this._ctx.save();
        this._ctx.beginPath();
        this._ctx.strokeStyle = this._ctx.fillStyle;
        const lineWidth = this._coreBrowserService.dpr;
        this._ctx.lineWidth = lineWidth;
        this._ctx.setLineDash([lineWidth * 4, lineWidth * 3]);
        const xLeft = x * this._deviceCellWidth;
        const xRight = (x + width) * this._deviceCellWidth;
        const yMid = (y + 1) * this._deviceCellHeight - lineWidth - 1;
        this._ctx.moveTo(xLeft, yMid);
        this._ctx.lineTo(xRight, yMid);
        this._ctx.stroke();
        this._ctx.closePath();
        this._ctx.restore();
    }
    _fillLeftLineAtCell(x, y, width) {
        this._ctx.fillRect(x * this._deviceCellWidth, y * this._deviceCellHeight, this._coreBrowserService.dpr * width, this._deviceCellHeight);
    }
    _strokeRectAtCell(x, y, width, height) {
        const lineWidth = this._coreBrowserService.dpr;
        this._ctx.lineWidth = lineWidth;
        this._ctx.strokeRect(x * this._deviceCellWidth + lineWidth / 2, y * this._deviceCellHeight + (lineWidth / 2), width * this._deviceCellWidth - lineWidth, (height * this._deviceCellHeight) - lineWidth);
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
    _fillCharTrueColor(cell, x, y) {
        this._ctx.font = this._getFont(false, false);
        this._ctx.textBaseline = Constants_1.TEXT_BASELINE;
        this._clipRow(y);
        let drawSuccess = false;
        if (this._optionsService.rawOptions.customGlyphs !== false) {
            drawSuccess = (0, CustomGlyphs_1.tryDrawCustomChar)(this._ctx, cell.getChars(), x * this._deviceCellWidth, y * this._deviceCellHeight, this._deviceCellWidth, this._deviceCellHeight, this._optionsService.rawOptions.fontSize, this._coreBrowserService.dpr);
        }
        if (!drawSuccess) {
            this._ctx.fillText(cell.getChars(), x * this._deviceCellWidth + this._deviceCharLeft, y * this._deviceCellHeight + this._deviceCharTop + this._deviceCharHeight);
        }
    }
    _drawChars(cell, x, y) {
        const chars = cell.getChars();
        const code = cell.getCode();
        const width = cell.getWidth();
        this._cellColorResolver.resolve(cell, x, this._bufferService.buffer.ydisp + y, this._deviceCellWidth);
        if (!this._charAtlas) {
            return;
        }
        let glyph;
        if (chars && chars.length > 1) {
            glyph = this._charAtlas.getRasterizedGlyphCombinedChar(chars, this._cellColorResolver.result.bg, this._cellColorResolver.result.fg, this._cellColorResolver.result.ext, true);
        }
        else {
            glyph = this._charAtlas.getRasterizedGlyph(cell.getCode() || Constants_2.WHITESPACE_CELL_CODE, this._cellColorResolver.result.bg, this._cellColorResolver.result.fg, this._cellColorResolver.result.ext, true);
        }
        if (!glyph.size.x || !glyph.size.y) {
            return;
        }
        this._ctx.save();
        this._clipRow(y);
        if (this._bitmapGenerator[glyph.texturePage] && this._charAtlas.pages[glyph.texturePage].canvas !== this._bitmapGenerator[glyph.texturePage].canvas) {
            this._bitmapGenerator[glyph.texturePage]?.bitmap?.close();
            delete this._bitmapGenerator[glyph.texturePage];
        }
        if (this._charAtlas.pages[glyph.texturePage].version !== this._bitmapGenerator[glyph.texturePage]?.version) {
            if (!this._bitmapGenerator[glyph.texturePage]) {
                this._bitmapGenerator[glyph.texturePage] = new BitmapGenerator(this._charAtlas.pages[glyph.texturePage].canvas);
            }
            this._bitmapGenerator[glyph.texturePage].refresh();
            this._bitmapGenerator[glyph.texturePage].version = this._charAtlas.pages[glyph.texturePage].version;
        }
        let renderWidth = glyph.size.x;
        if (this._optionsService.rawOptions.rescaleOverlappingGlyphs) {
            if ((0, RendererUtils_1.allowRescaling)(code, width, glyph.size.x, this._deviceCellWidth)) {
                renderWidth = this._deviceCellWidth - 1;
            }
        }
        this._ctx.drawImage(this._bitmapGenerator[glyph.texturePage]?.bitmap || this._charAtlas.pages[glyph.texturePage].canvas, glyph.texturePosition.x, glyph.texturePosition.y, glyph.size.x, glyph.size.y, x * this._deviceCellWidth + this._deviceCharLeft - glyph.offset.x, y * this._deviceCellHeight + this._deviceCharTop - glyph.offset.y, renderWidth, glyph.size.y);
        this._ctx.restore();
    }
    _clipRow(y) {
        this._ctx.beginPath();
        this._ctx.rect(0, y * this._deviceCellHeight, this._bufferService.cols * this._deviceCellWidth, this._deviceCellHeight);
        this._ctx.clip();
    }
    _getFont(isBold, isItalic) {
        const fontWeight = isBold ? this._optionsService.rawOptions.fontWeightBold : this._optionsService.rawOptions.fontWeight;
        const fontStyle = isItalic ? 'italic' : '';
        return `${fontStyle} ${fontWeight} ${this._optionsService.rawOptions.fontSize * this._coreBrowserService.dpr}px ${this._optionsService.rawOptions.fontFamily}`;
    }
}
exports.BaseRenderLayer = BaseRenderLayer;
const GLYPH_BITMAP_COMMIT_DELAY = 100;
class BitmapGenerator {
    get bitmap() { return this._bitmap; }
    constructor(canvas) {
        this.canvas = canvas;
        this._state = 0;
        this._commitTimeout = undefined;
        this._bitmap = undefined;
        this.version = -1;
    }
    refresh() {
        this._bitmap?.close();
        this._bitmap = undefined;
        if (Platform_1.isSafari) {
            return;
        }
        if (this._commitTimeout === undefined) {
            this._commitTimeout = window.setTimeout(() => this._generate(), GLYPH_BITMAP_COMMIT_DELAY);
        }
        if (this._state === 1) {
            this._state = 2;
        }
    }
    _generate() {
        if (this._state === 0) {
            this._bitmap?.close();
            this._bitmap = undefined;
            this._state = 1;
            window.createImageBitmap(this.canvas).then(bitmap => {
                if (this._state === 2) {
                    this.refresh();
                }
                else {
                    this._bitmap = bitmap;
                }
                this._state = 0;
            });
            if (this._commitTimeout) {
                this._commitTimeout = undefined;
            }
        }
    }
}
//# sourceMappingURL=BaseRenderLayer.js.map