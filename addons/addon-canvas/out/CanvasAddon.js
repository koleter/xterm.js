"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CanvasAddon = void 0;
const EventEmitter_1 = require("common/EventEmitter");
const Lifecycle_1 = require("common/Lifecycle");
const LogService_1 = require("common/services/LogService");
const CanvasRenderer_1 = require("./CanvasRenderer");
class CanvasAddon extends Lifecycle_1.Disposable {
    constructor() {
        super(...arguments);
        this._onChangeTextureAtlas = this.register(new EventEmitter_1.EventEmitter());
        this.onChangeTextureAtlas = this._onChangeTextureAtlas.event;
        this._onAddTextureAtlasCanvas = this.register(new EventEmitter_1.EventEmitter());
        this.onAddTextureAtlasCanvas = this._onAddTextureAtlasCanvas.event;
    }
    get textureAtlas() {
        return this._renderer?.textureAtlas;
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
        const screenElement = core.screenElement;
        const linkifier = core.linkifier;
        const unsafeCore = core;
        const bufferService = unsafeCore._bufferService;
        const renderService = unsafeCore._renderService;
        const characterJoinerService = unsafeCore._characterJoinerService;
        const charSizeService = unsafeCore._charSizeService;
        const coreBrowserService = unsafeCore._coreBrowserService;
        const decorationService = unsafeCore._decorationService;
        const logService = unsafeCore._logService;
        const themeService = unsafeCore._themeService;
        (0, LogService_1.setTraceLogger)(logService);
        this._renderer = new CanvasRenderer_1.CanvasRenderer(terminal, screenElement, linkifier, bufferService, charSizeService, optionsService, characterJoinerService, coreService, coreBrowserService, decorationService, themeService);
        this.register((0, EventEmitter_1.forwardEvent)(this._renderer.onChangeTextureAtlas, this._onChangeTextureAtlas));
        this.register((0, EventEmitter_1.forwardEvent)(this._renderer.onAddTextureAtlasCanvas, this._onAddTextureAtlasCanvas));
        renderService.setRenderer(this._renderer);
        renderService.handleResize(bufferService.cols, bufferService.rows);
        this.register((0, Lifecycle_1.toDisposable)(() => {
            renderService.setRenderer(this._terminal._core._createRenderer());
            renderService.handleResize(terminal.cols, terminal.rows);
            this._renderer?.dispose();
            this._renderer = undefined;
        }));
    }
    clearTextureAtlas() {
        this._renderer?.clearTextureAtlas();
    }
}
exports.CanvasAddon = CanvasAddon;
//# sourceMappingURL=CanvasAddon.js.map