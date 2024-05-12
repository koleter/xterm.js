"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WebglAddon = void 0;
const EventEmitter_1 = require("common/EventEmitter");
const Lifecycle_1 = require("common/Lifecycle");
const Platform_1 = require("common/Platform");
const WebglRenderer_1 = require("./WebglRenderer");
const LogService_1 = require("common/services/LogService");
class WebglAddon extends Lifecycle_1.Disposable {
    constructor(_preserveDrawingBuffer) {
        if (Platform_1.isSafari && (0, Platform_1.getSafariVersion)() < 16) {
            const contextAttributes = {
                antialias: false,
                depth: false,
                preserveDrawingBuffer: true
            };
            const gl = document.createElement('canvas').getContext('webgl2', contextAttributes);
            if (!gl) {
                throw new Error('Webgl2 is only supported on Safari 16 and above');
            }
        }
        super();
        this._preserveDrawingBuffer = _preserveDrawingBuffer;
        this._onChangeTextureAtlas = this.register(new EventEmitter_1.EventEmitter());
        this.onChangeTextureAtlas = this._onChangeTextureAtlas.event;
        this._onAddTextureAtlasCanvas = this.register(new EventEmitter_1.EventEmitter());
        this.onAddTextureAtlasCanvas = this._onAddTextureAtlasCanvas.event;
        this._onRemoveTextureAtlasCanvas = this.register(new EventEmitter_1.EventEmitter());
        this.onRemoveTextureAtlasCanvas = this._onRemoveTextureAtlasCanvas.event;
        this._onContextLoss = this.register(new EventEmitter_1.EventEmitter());
        this.onContextLoss = this._onContextLoss.event;
    }
    activate(terminal) {
        const core = terminal._core;
        if (!terminal.element) {
            this.register(core.onWillOpen(() => this.activate(terminal)));
            return;
        }
        this._terminal = terminal;
        const coreService = core.coreService;
        const optionsService = core.optionsService;
        const unsafeCore = core;
        const renderService = unsafeCore._renderService;
        const characterJoinerService = unsafeCore._characterJoinerService;
        const charSizeService = unsafeCore._charSizeService;
        const coreBrowserService = unsafeCore._coreBrowserService;
        const decorationService = unsafeCore._decorationService;
        const logService = unsafeCore._logService;
        const themeService = unsafeCore._themeService;
        (0, LogService_1.setTraceLogger)(logService);
        this._renderer = this.register(new WebglRenderer_1.WebglRenderer(terminal, characterJoinerService, charSizeService, coreBrowserService, coreService, decorationService, optionsService, themeService, this._preserveDrawingBuffer));
        this.register((0, EventEmitter_1.forwardEvent)(this._renderer.onContextLoss, this._onContextLoss));
        this.register((0, EventEmitter_1.forwardEvent)(this._renderer.onChangeTextureAtlas, this._onChangeTextureAtlas));
        this.register((0, EventEmitter_1.forwardEvent)(this._renderer.onAddTextureAtlasCanvas, this._onAddTextureAtlasCanvas));
        this.register((0, EventEmitter_1.forwardEvent)(this._renderer.onRemoveTextureAtlasCanvas, this._onRemoveTextureAtlasCanvas));
        renderService.setRenderer(this._renderer);
        this.register((0, Lifecycle_1.toDisposable)(() => {
            const renderService = this._terminal._core._renderService;
            renderService.setRenderer(this._terminal._core._createRenderer());
            renderService.handleResize(terminal.cols, terminal.rows);
        }));
    }
    get textureAtlas() {
        return this._renderer?.textureAtlas;
    }
    clearTextureAtlas() {
        this._renderer?.clearTextureAtlas();
    }
}
exports.WebglAddon = WebglAddon;
//# sourceMappingURL=WebglAddon.js.map