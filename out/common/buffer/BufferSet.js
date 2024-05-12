"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BufferSet = void 0;
const EventEmitter_1 = require("common/EventEmitter");
const Lifecycle_1 = require("common/Lifecycle");
const Buffer_1 = require("common/buffer/Buffer");
class BufferSet extends Lifecycle_1.Disposable {
    constructor(_optionsService, _bufferService) {
        super();
        this._optionsService = _optionsService;
        this._bufferService = _bufferService;
        this._onBufferActivate = this.register(new EventEmitter_1.EventEmitter());
        this.onBufferActivate = this._onBufferActivate.event;
        this.reset();
        this.register(this._optionsService.onSpecificOptionChange('scrollback', () => this.resize(this._bufferService.cols, this._bufferService.rows)));
        this.register(this._optionsService.onSpecificOptionChange('tabStopWidth', () => this.setupTabStops()));
    }
    reset() {
        this._normal = new Buffer_1.Buffer(true, this._optionsService, this._bufferService);
        this._normal.fillViewportRows();
        this._alt = new Buffer_1.Buffer(false, this._optionsService, this._bufferService);
        this._activeBuffer = this._normal;
        this._onBufferActivate.fire({
            activeBuffer: this._normal,
            inactiveBuffer: this._alt
        });
        this.setupTabStops();
    }
    get alt() {
        return this._alt;
    }
    get active() {
        return this._activeBuffer;
    }
    get normal() {
        return this._normal;
    }
    activateNormalBuffer() {
        if (this._activeBuffer === this._normal) {
            return;
        }
        this._normal.x = this._alt.x;
        this._normal.y = this._alt.y;
        this._alt.clearAllMarkers();
        this._alt.clear();
        this._activeBuffer = this._normal;
        this._onBufferActivate.fire({
            activeBuffer: this._normal,
            inactiveBuffer: this._alt
        });
    }
    activateAltBuffer(fillAttr) {
        if (this._activeBuffer === this._alt) {
            return;
        }
        this._alt.fillViewportRows(fillAttr);
        this._alt.x = this._normal.x;
        this._alt.y = this._normal.y;
        this._activeBuffer = this._alt;
        this._onBufferActivate.fire({
            activeBuffer: this._alt,
            inactiveBuffer: this._normal
        });
    }
    resize(newCols, newRows) {
        this._normal.resize(newCols, newRows);
        this._alt.resize(newCols, newRows);
        this.setupTabStops(newCols);
    }
    setupTabStops(i) {
        this._normal.setupTabStops(i);
        this._alt.setupTabStops(i);
    }
}
exports.BufferSet = BufferSet;
//# sourceMappingURL=BufferSet.js.map