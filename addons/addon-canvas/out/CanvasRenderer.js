"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanvasRenderer = void 0;
const CharAtlasCache_1 = require("browser/renderer/shared/CharAtlasCache");
const DevicePixelObserver_1 = require("browser/renderer/shared/DevicePixelObserver");
const RendererUtils_1 = require("browser/renderer/shared/RendererUtils");
const EventEmitter_1 = require("common/EventEmitter");
const Lifecycle_1 = require("common/Lifecycle");
const CursorRenderLayer_1 = require("./CursorRenderLayer");
const LinkRenderLayer_1 = require("./LinkRenderLayer");
const SelectionRenderLayer_1 = require("./SelectionRenderLayer");
const TextRenderLayer_1 = require("./TextRenderLayer");
class CanvasRenderer extends Lifecycle_1.Disposable {
    constructor(_terminal, _screenElement, linkifier2, _bufferService, _charSizeService, _optionsService, characterJoinerService, coreService, _coreBrowserService, decorationService, _themeService) {
        super();
        this._terminal = _terminal;
        this._screenElement = _screenElement;
        this._bufferService = _bufferService;
        this._charSizeService = _charSizeService;
        this._optionsService = _optionsService;
        this._coreBrowserService = _coreBrowserService;
        this._themeService = _themeService;
        this._observerDisposable = this.register(new Lifecycle_1.MutableDisposable());
        this._onRequestRedraw = this.register(new EventEmitter_1.EventEmitter());
        this.onRequestRedraw = this._onRequestRedraw.event;
        this._onChangeTextureAtlas = this.register(new EventEmitter_1.EventEmitter());
        this.onChangeTextureAtlas = this._onChangeTextureAtlas.event;
        this._onAddTextureAtlasCanvas = this.register(new EventEmitter_1.EventEmitter());
        this.onAddTextureAtlasCanvas = this._onAddTextureAtlasCanvas.event;
        const allowTransparency = this._optionsService.rawOptions.allowTransparency;
        this._renderLayers = [
            new TextRenderLayer_1.TextRenderLayer(this._terminal, this._screenElement, 0, allowTransparency, this._bufferService, this._optionsService, characterJoinerService, decorationService, this._coreBrowserService, _themeService),
            new SelectionRenderLayer_1.SelectionRenderLayer(this._terminal, this._screenElement, 1, this._bufferService, this._coreBrowserService, decorationService, this._optionsService, _themeService),
            new LinkRenderLayer_1.LinkRenderLayer(this._terminal, this._screenElement, 2, linkifier2, this._bufferService, this._optionsService, decorationService, this._coreBrowserService, _themeService),
            new CursorRenderLayer_1.CursorRenderLayer(this._terminal, this._screenElement, 3, this._onRequestRedraw, this._bufferService, this._optionsService, coreService, this._coreBrowserService, decorationService, _themeService)
        ];
        for (const layer of this._renderLayers) {
            (0, EventEmitter_1.forwardEvent)(layer.onAddTextureAtlasCanvas, this._onAddTextureAtlasCanvas);
        }
        this.dimensions = (0, RendererUtils_1.createRenderDimensions)();
        this._devicePixelRatio = this._coreBrowserService.dpr;
        this._updateDimensions();
        this._observerDisposable.value = (0, DevicePixelObserver_1.observeDevicePixelDimensions)(this._renderLayers[0].canvas, this._coreBrowserService.window, (w, h) => this._setCanvasDevicePixelDimensions(w, h));
        this.register(this._coreBrowserService.onWindowChange(w => {
            this._observerDisposable.value = (0, DevicePixelObserver_1.observeDevicePixelDimensions)(this._renderLayers[0].canvas, w, (w, h) => this._setCanvasDevicePixelDimensions(w, h));
        }));
        this.register((0, Lifecycle_1.toDisposable)(() => {
            for (const l of this._renderLayers) {
                l.dispose();
            }
            (0, CharAtlasCache_1.removeTerminalFromCache)(this._terminal);
        }));
    }
    get textureAtlas() {
        return this._renderLayers[0].cacheCanvas;
    }
    handleDevicePixelRatioChange() {
        if (this._devicePixelRatio !== this._coreBrowserService.dpr) {
            this._devicePixelRatio = this._coreBrowserService.dpr;
            this.handleResize(this._bufferService.cols, this._bufferService.rows);
        }
    }
    handleResize(cols, rows) {
        this._updateDimensions();
        for (const l of this._renderLayers) {
            l.resize(this.dimensions);
        }
        this._screenElement.style.width = `${this.dimensions.css.canvas.width}px`;
        this._screenElement.style.height = `${this.dimensions.css.canvas.height}px`;
    }
    handleCharSizeChanged() {
        this.handleResize(this._bufferService.cols, this._bufferService.rows);
    }
    handleBlur() {
        this._runOperation(l => l.handleBlur());
    }
    handleFocus() {
        this._runOperation(l => l.handleFocus());
    }
    handleSelectionChanged(start, end, columnSelectMode = false) {
        this._runOperation(l => l.handleSelectionChanged(start, end, columnSelectMode));
        if (this._themeService.colors.selectionForeground) {
            this._onRequestRedraw.fire({ start: 0, end: this._bufferService.rows - 1 });
        }
    }
    handleCursorMove() {
        this._runOperation(l => l.handleCursorMove());
    }
    clear() {
        this._runOperation(l => l.reset());
    }
    _runOperation(operation) {
        for (const l of this._renderLayers) {
            operation(l);
        }
    }
    renderRows(start, end) {
        for (const l of this._renderLayers) {
            l.handleGridChanged(start, end);
        }
    }
    clearTextureAtlas() {
        for (const layer of this._renderLayers) {
            layer.clearTextureAtlas();
        }
    }
    _updateDimensions() {
        if (!this._charSizeService.hasValidSize) {
            return;
        }
        const dpr = this._coreBrowserService.dpr;
        this.dimensions.device.char.width = Math.floor(this._charSizeService.width * dpr);
        this.dimensions.device.char.height = Math.ceil(this._charSizeService.height * dpr);
        this.dimensions.device.cell.height = Math.floor(this.dimensions.device.char.height * this._optionsService.rawOptions.lineHeight);
        this.dimensions.device.char.top = this._optionsService.rawOptions.lineHeight === 1 ? 0 : Math.round((this.dimensions.device.cell.height - this.dimensions.device.char.height) / 2);
        this.dimensions.device.cell.width = this.dimensions.device.char.width + Math.round(this._optionsService.rawOptions.letterSpacing);
        this.dimensions.device.char.left = Math.floor(this._optionsService.rawOptions.letterSpacing / 2);
        this.dimensions.device.canvas.height = this._bufferService.rows * this.dimensions.device.cell.height;
        this.dimensions.device.canvas.width = this._bufferService.cols * this.dimensions.device.cell.width;
        this.dimensions.css.canvas.height = Math.round(this.dimensions.device.canvas.height / dpr);
        this.dimensions.css.canvas.width = Math.round(this.dimensions.device.canvas.width / dpr);
        this.dimensions.css.cell.height = this.dimensions.css.canvas.height / this._bufferService.rows;
        this.dimensions.css.cell.width = this.dimensions.css.canvas.width / this._bufferService.cols;
    }
    _setCanvasDevicePixelDimensions(width, height) {
        this.dimensions.device.canvas.height = height;
        this.dimensions.device.canvas.width = width;
        for (const l of this._renderLayers) {
            l.resize(this.dimensions);
        }
        this._requestRedrawViewport();
    }
    _requestRedrawViewport() {
        this._onRequestRedraw.fire({ start: 0, end: this._bufferService.rows - 1 });
    }
}
exports.CanvasRenderer = CanvasRenderer;
//# sourceMappingURL=CanvasRenderer.js.map