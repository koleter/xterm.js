"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.JoinedCellData = exports.WebglRenderer = void 0;
const Lifecycle_1 = require("browser/Lifecycle");
const CellColorResolver_1 = require("browser/renderer/shared/CellColorResolver");
const CharAtlasCache_1 = require("browser/renderer/shared/CharAtlasCache");
const CursorBlinkStateManager_1 = require("browser/renderer/shared/CursorBlinkStateManager");
const DevicePixelObserver_1 = require("browser/renderer/shared/DevicePixelObserver");
const RendererUtils_1 = require("browser/renderer/shared/RendererUtils");
const EventEmitter_1 = require("common/EventEmitter");
const Lifecycle_2 = require("common/Lifecycle");
const AttributeData_1 = require("common/buffer/AttributeData");
const CellData_1 = require("common/buffer/CellData");
const Constants_1 = require("common/buffer/Constants");
const GlyphRenderer_1 = require("./GlyphRenderer");
const RectangleRenderer_1 = require("./RectangleRenderer");
const RenderModel_1 = require("./RenderModel");
const LinkRenderLayer_1 = require("./renderLayer/LinkRenderLayer");
class WebglRenderer extends Lifecycle_2.Disposable {
    constructor(_terminal, _characterJoinerService, _charSizeService, _coreBrowserService, _coreService, _decorationService, _optionsService, _themeService, preserveDrawingBuffer) {
        super();
        this._terminal = _terminal;
        this._characterJoinerService = _characterJoinerService;
        this._charSizeService = _charSizeService;
        this._coreBrowserService = _coreBrowserService;
        this._coreService = _coreService;
        this._decorationService = _decorationService;
        this._optionsService = _optionsService;
        this._themeService = _themeService;
        this._cursorBlinkStateManager = new Lifecycle_2.MutableDisposable();
        this._charAtlasDisposable = this.register(new Lifecycle_2.MutableDisposable());
        this._observerDisposable = this.register(new Lifecycle_2.MutableDisposable());
        this._model = new RenderModel_1.RenderModel();
        this._workCell = new CellData_1.CellData();
        this._workCell2 = new CellData_1.CellData();
        this._rectangleRenderer = this.register(new Lifecycle_2.MutableDisposable());
        this._glyphRenderer = this.register(new Lifecycle_2.MutableDisposable());
        this._onChangeTextureAtlas = this.register(new EventEmitter_1.EventEmitter());
        this.onChangeTextureAtlas = this._onChangeTextureAtlas.event;
        this._onAddTextureAtlasCanvas = this.register(new EventEmitter_1.EventEmitter());
        this.onAddTextureAtlasCanvas = this._onAddTextureAtlasCanvas.event;
        this._onRemoveTextureAtlasCanvas = this.register(new EventEmitter_1.EventEmitter());
        this.onRemoveTextureAtlasCanvas = this._onRemoveTextureAtlasCanvas.event;
        this._onRequestRedraw = this.register(new EventEmitter_1.EventEmitter());
        this.onRequestRedraw = this._onRequestRedraw.event;
        this._onContextLoss = this.register(new EventEmitter_1.EventEmitter());
        this.onContextLoss = this._onContextLoss.event;
        this.register(this._themeService.onChangeColors(() => this._handleColorChange()));
        this._cellColorResolver = new CellColorResolver_1.CellColorResolver(this._terminal, this._optionsService, this._model.selection, this._decorationService, this._coreBrowserService, this._themeService);
        this._core = this._terminal._core;
        this._renderLayers = [
            new LinkRenderLayer_1.LinkRenderLayer(this._core.screenElement, 2, this._terminal, this._core.linkifier, this._coreBrowserService, _optionsService, this._themeService)
        ];
        this.dimensions = (0, RendererUtils_1.createRenderDimensions)();
        this._devicePixelRatio = this._coreBrowserService.dpr;
        this._updateDimensions();
        this._updateCursorBlink();
        this.register(_optionsService.onOptionChange(() => this._handleOptionsChanged()));
        this._canvas = this._coreBrowserService.mainDocument.createElement('canvas');
        const contextAttributes = {
            antialias: false,
            depth: false,
            preserveDrawingBuffer
        };
        this._gl = this._canvas.getContext('webgl2', contextAttributes);
        if (!this._gl) {
            throw new Error('WebGL2 not supported ' + this._gl);
        }
        this.register((0, Lifecycle_1.addDisposableDomListener)(this._canvas, 'webglcontextlost', (e) => {
            console.log('webglcontextlost event received');
            e.preventDefault();
            this._contextRestorationTimeout = setTimeout(() => {
                this._contextRestorationTimeout = undefined;
                console.warn('webgl context not restored; firing onContextLoss');
                this._onContextLoss.fire(e);
            }, 3000);
        }));
        this.register((0, Lifecycle_1.addDisposableDomListener)(this._canvas, 'webglcontextrestored', (e) => {
            console.warn('webglcontextrestored event received');
            clearTimeout(this._contextRestorationTimeout);
            this._contextRestorationTimeout = undefined;
            (0, CharAtlasCache_1.removeTerminalFromCache)(this._terminal);
            this._initializeWebGLState();
            this._requestRedrawViewport();
        }));
        this._observerDisposable.value = (0, DevicePixelObserver_1.observeDevicePixelDimensions)(this._canvas, this._coreBrowserService.window, (w, h) => this._setCanvasDevicePixelDimensions(w, h));
        this.register(this._coreBrowserService.onWindowChange(w => {
            this._observerDisposable.value = (0, DevicePixelObserver_1.observeDevicePixelDimensions)(this._canvas, w, (w, h) => this._setCanvasDevicePixelDimensions(w, h));
        }));
        this._core.screenElement.appendChild(this._canvas);
        [this._rectangleRenderer.value, this._glyphRenderer.value] = this._initializeWebGLState();
        this._isAttached = this._coreBrowserService.window.document.body.contains(this._core.screenElement);
        this.register((0, Lifecycle_2.toDisposable)(() => {
            for (const l of this._renderLayers) {
                l.dispose();
            }
            this._canvas.parentElement?.removeChild(this._canvas);
            (0, CharAtlasCache_1.removeTerminalFromCache)(this._terminal);
        }));
    }
    get textureAtlas() {
        return this._charAtlas?.pages[0].canvas;
    }
    _handleColorChange() {
        this._refreshCharAtlas();
        this._clearModel(true);
    }
    handleDevicePixelRatioChange() {
        if (this._devicePixelRatio !== this._coreBrowserService.dpr) {
            this._devicePixelRatio = this._coreBrowserService.dpr;
            this.handleResize(this._terminal.cols, this._terminal.rows);
        }
    }
    handleResize(cols, rows) {
        this._updateDimensions();
        this._model.resize(this._terminal.cols, this._terminal.rows);
        for (const l of this._renderLayers) {
            l.resize(this._terminal, this.dimensions);
        }
        this._canvas.width = this.dimensions.device.canvas.width;
        this._canvas.height = this.dimensions.device.canvas.height;
        this._canvas.style.width = `${this.dimensions.css.canvas.width}px`;
        this._canvas.style.height = `${this.dimensions.css.canvas.height}px`;
        this._core.screenElement.style.width = `${this.dimensions.css.canvas.width}px`;
        this._core.screenElement.style.height = `${this.dimensions.css.canvas.height}px`;
        this._rectangleRenderer.value?.setDimensions(this.dimensions);
        this._rectangleRenderer.value?.handleResize();
        this._glyphRenderer.value?.setDimensions(this.dimensions);
        this._glyphRenderer.value?.handleResize();
        this._refreshCharAtlas();
        this._clearModel(false);
    }
    handleCharSizeChanged() {
        this.handleResize(this._terminal.cols, this._terminal.rows);
    }
    handleBlur() {
        for (const l of this._renderLayers) {
            l.handleBlur(this._terminal);
        }
        this._cursorBlinkStateManager.value?.pause();
        this._requestRedrawViewport();
    }
    handleFocus() {
        for (const l of this._renderLayers) {
            l.handleFocus(this._terminal);
        }
        this._cursorBlinkStateManager.value?.resume();
        this._requestRedrawViewport();
    }
    handleSelectionChanged(start, end, columnSelectMode) {
        for (const l of this._renderLayers) {
            l.handleSelectionChanged(this._terminal, start, end, columnSelectMode);
        }
        this._model.selection.update(this._core, start, end, columnSelectMode);
        this._requestRedrawViewport();
    }
    handleCursorMove() {
        for (const l of this._renderLayers) {
            l.handleCursorMove(this._terminal);
        }
        this._cursorBlinkStateManager.value?.restartBlinkAnimation();
    }
    _handleOptionsChanged() {
        this._updateDimensions();
        this._refreshCharAtlas();
        this._updateCursorBlink();
    }
    _initializeWebGLState() {
        this._rectangleRenderer.value = new RectangleRenderer_1.RectangleRenderer(this._terminal, this._gl, this.dimensions, this._themeService);
        this._glyphRenderer.value = new GlyphRenderer_1.GlyphRenderer(this._terminal, this._gl, this.dimensions, this._optionsService);
        this.handleCharSizeChanged();
        return [this._rectangleRenderer.value, this._glyphRenderer.value];
    }
    _refreshCharAtlas() {
        if (this.dimensions.device.char.width <= 0 && this.dimensions.device.char.height <= 0) {
            this._isAttached = false;
            return;
        }
        const atlas = (0, CharAtlasCache_1.acquireTextureAtlas)(this._terminal, this._optionsService.rawOptions, this._themeService.colors, this.dimensions.device.cell.width, this.dimensions.device.cell.height, this.dimensions.device.char.width, this.dimensions.device.char.height, this._coreBrowserService.dpr);
        if (this._charAtlas !== atlas) {
            this._onChangeTextureAtlas.fire(atlas.pages[0].canvas);
            this._charAtlasDisposable.value = (0, Lifecycle_2.getDisposeArrayDisposable)([
                (0, EventEmitter_1.forwardEvent)(atlas.onAddTextureAtlasCanvas, this._onAddTextureAtlasCanvas),
                (0, EventEmitter_1.forwardEvent)(atlas.onRemoveTextureAtlasCanvas, this._onRemoveTextureAtlasCanvas)
            ]);
        }
        this._charAtlas = atlas;
        this._charAtlas.warmUp();
        this._glyphRenderer.value?.setAtlas(this._charAtlas);
    }
    _clearModel(clearGlyphRenderer) {
        this._model.clear();
        if (clearGlyphRenderer) {
            this._glyphRenderer.value?.clear();
        }
    }
    clearTextureAtlas() {
        this._charAtlas?.clearTexture();
        this._clearModel(true);
        this._requestRedrawViewport();
    }
    clear() {
        this._clearModel(true);
        for (const l of this._renderLayers) {
            l.reset(this._terminal);
        }
        this._cursorBlinkStateManager.value?.restartBlinkAnimation();
        this._updateCursorBlink();
    }
    registerCharacterJoiner(handler) {
        return -1;
    }
    deregisterCharacterJoiner(joinerId) {
        return false;
    }
    renderRows(start, end) {
        if (!this._isAttached) {
            if (this._coreBrowserService.window.document.body.contains(this._core.screenElement) && this._charSizeService.width && this._charSizeService.height) {
                this._updateDimensions();
                this._refreshCharAtlas();
                this._isAttached = true;
            }
            else {
                return;
            }
        }
        for (const l of this._renderLayers) {
            l.handleGridChanged(this._terminal, start, end);
        }
        if (!this._glyphRenderer.value || !this._rectangleRenderer.value) {
            return;
        }
        if (this._glyphRenderer.value.beginFrame()) {
            this._clearModel(true);
            this._updateModel(0, this._terminal.rows - 1);
        }
        else {
            this._updateModel(start, end);
        }
        this._rectangleRenderer.value.renderBackgrounds();
        this._glyphRenderer.value.render(this._model);
        if (!this._cursorBlinkStateManager.value || this._cursorBlinkStateManager.value.isCursorVisible) {
            this._rectangleRenderer.value.renderCursor();
        }
    }
    _updateCursorBlink() {
        if (this._terminal.options.cursorBlink) {
            this._cursorBlinkStateManager.value = new CursorBlinkStateManager_1.CursorBlinkStateManager(() => {
                this._requestRedrawCursor();
            }, this._coreBrowserService);
        }
        else {
            this._cursorBlinkStateManager.clear();
        }
        this._requestRedrawCursor();
    }
    _updateModel(start, end) {
        const terminal = this._core;
        let cell = this._workCell;
        let lastBg;
        let y;
        let row;
        let line;
        let joinedRanges;
        let isJoined;
        let lastCharX;
        let range;
        let chars;
        let code;
        let width;
        let i;
        let x;
        let j;
        start = clamp(start, terminal.rows - 1, 0);
        end = clamp(end, terminal.rows - 1, 0);
        const cursorY = this._terminal.buffer.active.baseY + this._terminal.buffer.active.cursorY;
        const viewportRelativeCursorY = cursorY - terminal.buffer.ydisp;
        const cursorX = Math.min(this._terminal.buffer.active.cursorX, terminal.cols - 1);
        let lastCursorX = -1;
        const isCursorVisible = this._coreService.isCursorInitialized &&
            !this._coreService.isCursorHidden &&
            (!this._cursorBlinkStateManager.value || this._cursorBlinkStateManager.value.isCursorVisible);
        this._model.cursor = undefined;
        let modelUpdated = false;
        for (y = start; y <= end; y++) {
            row = y + terminal.buffer.ydisp;
            line = terminal.buffer.lines.get(row);
            this._model.lineLengths[y] = 0;
            joinedRanges = this._characterJoinerService.getJoinedCharacters(row);
            for (x = 0; x < terminal.cols; x++) {
                lastBg = this._cellColorResolver.result.bg;
                line.loadCell(x, cell);
                if (x === 0) {
                    lastBg = this._cellColorResolver.result.bg;
                }
                isJoined = false;
                lastCharX = x;
                if (joinedRanges.length > 0 && x === joinedRanges[0][0]) {
                    isJoined = true;
                    range = joinedRanges.shift();
                    cell = new JoinedCellData(cell, line.translateToString(true, range[0], range[1]), range[1] - range[0]);
                    lastCharX = range[1] - 1;
                }
                chars = cell.getChars();
                code = cell.getCode();
                i = ((y * terminal.cols) + x) * RenderModel_1.RENDER_MODEL_INDICIES_PER_CELL;
                this._cellColorResolver.resolve(cell, x, row, this.dimensions.device.cell.width);
                if (isCursorVisible && row === cursorY) {
                    if (x === cursorX) {
                        this._model.cursor = {
                            x: cursorX,
                            y: viewportRelativeCursorY,
                            width: cell.getWidth(),
                            style: this._coreBrowserService.isFocused ?
                                (terminal.options.cursorStyle || 'block') : terminal.options.cursorInactiveStyle,
                            cursorWidth: terminal.options.cursorWidth,
                            dpr: this._devicePixelRatio
                        };
                        lastCursorX = cursorX + cell.getWidth() - 1;
                    }
                    if (x >= cursorX && x <= lastCursorX &&
                        ((this._coreBrowserService.isFocused &&
                            (terminal.options.cursorStyle || 'block') === 'block') ||
                            (this._coreBrowserService.isFocused === false &&
                                terminal.options.cursorInactiveStyle === 'block'))) {
                        this._cellColorResolver.result.fg =
                            50331648 | (this._themeService.colors.cursorAccent.rgba >> 8 & 16777215);
                        this._cellColorResolver.result.bg =
                            50331648 | (this._themeService.colors.cursor.rgba >> 8 & 16777215);
                    }
                }
                if (code !== Constants_1.NULL_CELL_CODE) {
                    this._model.lineLengths[y] = x + 1;
                }
                if (this._model.cells[i] === code &&
                    this._model.cells[i + RenderModel_1.RENDER_MODEL_BG_OFFSET] === this._cellColorResolver.result.bg &&
                    this._model.cells[i + RenderModel_1.RENDER_MODEL_FG_OFFSET] === this._cellColorResolver.result.fg &&
                    this._model.cells[i + RenderModel_1.RENDER_MODEL_EXT_OFFSET] === this._cellColorResolver.result.ext) {
                    continue;
                }
                modelUpdated = true;
                if (chars.length > 1) {
                    code |= RenderModel_1.COMBINED_CHAR_BIT_MASK;
                }
                this._model.cells[i] = code;
                this._model.cells[i + RenderModel_1.RENDER_MODEL_BG_OFFSET] = this._cellColorResolver.result.bg;
                this._model.cells[i + RenderModel_1.RENDER_MODEL_FG_OFFSET] = this._cellColorResolver.result.fg;
                this._model.cells[i + RenderModel_1.RENDER_MODEL_EXT_OFFSET] = this._cellColorResolver.result.ext;
                width = cell.getWidth();
                this._glyphRenderer.value.updateCell(x, y, code, this._cellColorResolver.result.bg, this._cellColorResolver.result.fg, this._cellColorResolver.result.ext, chars, width, lastBg);
                if (isJoined) {
                    cell = this._workCell;
                    for (x++; x < lastCharX; x++) {
                        j = ((y * terminal.cols) + x) * RenderModel_1.RENDER_MODEL_INDICIES_PER_CELL;
                        this._glyphRenderer.value.updateCell(x, y, Constants_1.NULL_CELL_CODE, 0, 0, 0, Constants_1.NULL_CELL_CHAR, 0, 0);
                        this._model.cells[j] = Constants_1.NULL_CELL_CODE;
                        this._model.cells[j + RenderModel_1.RENDER_MODEL_BG_OFFSET] = this._cellColorResolver.result.bg;
                        this._model.cells[j + RenderModel_1.RENDER_MODEL_FG_OFFSET] = this._cellColorResolver.result.fg;
                        this._model.cells[j + RenderModel_1.RENDER_MODEL_EXT_OFFSET] = this._cellColorResolver.result.ext;
                    }
                }
            }
        }
        if (modelUpdated) {
            this._rectangleRenderer.value.updateBackgrounds(this._model);
        }
        this._rectangleRenderer.value.updateCursor(this._model);
    }
    _updateDimensions() {
        if (!this._charSizeService.width || !this._charSizeService.height) {
            return;
        }
        this.dimensions.device.char.width = Math.floor(this._charSizeService.width * this._devicePixelRatio);
        this.dimensions.device.char.height = Math.ceil(this._charSizeService.height * this._devicePixelRatio);
        this.dimensions.device.cell.height = Math.floor(this.dimensions.device.char.height * this._optionsService.rawOptions.lineHeight);
        this.dimensions.device.char.top = this._optionsService.rawOptions.lineHeight === 1 ? 0 : Math.round((this.dimensions.device.cell.height - this.dimensions.device.char.height) / 2);
        this.dimensions.device.cell.width = this.dimensions.device.char.width + Math.round(this._optionsService.rawOptions.letterSpacing);
        this.dimensions.device.char.left = Math.floor(this._optionsService.rawOptions.letterSpacing / 2);
        this.dimensions.device.canvas.height = this._terminal.rows * this.dimensions.device.cell.height;
        this.dimensions.device.canvas.width = this._terminal.cols * this.dimensions.device.cell.width;
        this.dimensions.css.canvas.height = Math.round(this.dimensions.device.canvas.height / this._devicePixelRatio);
        this.dimensions.css.canvas.width = Math.round(this.dimensions.device.canvas.width / this._devicePixelRatio);
        this.dimensions.css.cell.height = this.dimensions.device.cell.height / this._devicePixelRatio;
        this.dimensions.css.cell.width = this.dimensions.device.cell.width / this._devicePixelRatio;
    }
    _setCanvasDevicePixelDimensions(width, height) {
        if (this._canvas.width === width && this._canvas.height === height) {
            return;
        }
        this._canvas.width = width;
        this._canvas.height = height;
        this._requestRedrawViewport();
    }
    _requestRedrawViewport() {
        this._onRequestRedraw.fire({ start: 0, end: this._terminal.rows - 1 });
    }
    _requestRedrawCursor() {
        const cursorY = this._terminal.buffer.active.cursorY;
        this._onRequestRedraw.fire({ start: cursorY, end: cursorY });
    }
}
exports.WebglRenderer = WebglRenderer;
class JoinedCellData extends AttributeData_1.AttributeData {
    constructor(firstCell, chars, width) {
        super();
        this.content = 0;
        this.combinedData = '';
        this.fg = firstCell.fg;
        this.bg = firstCell.bg;
        this.combinedData = chars;
        this._width = width;
    }
    isCombined() {
        return 2097152;
    }
    getWidth() {
        return this._width;
    }
    getChars() {
        return this.combinedData;
    }
    getCode() {
        return 0x1FFFFF;
    }
    setFromCharData(value) {
        throw new Error('not implemented');
    }
    getAsCharData() {
        return [this.fg, this.getChars(), this.getWidth(), this.getCode()];
    }
}
exports.JoinedCellData = JoinedCellData;
function clamp(value, max, min = 0) {
    return Math.max(Math.min(value, max), min);
}
//# sourceMappingURL=WebglRenderer.js.map