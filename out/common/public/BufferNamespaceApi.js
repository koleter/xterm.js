"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BufferNamespaceApi = void 0;
const BufferApiView_1 = require("common/public/BufferApiView");
const EventEmitter_1 = require("common/EventEmitter");
const Lifecycle_1 = require("common/Lifecycle");
class BufferNamespaceApi extends Lifecycle_1.Disposable {
    constructor(_core) {
        super();
        this._core = _core;
        this._onBufferChange = this.register(new EventEmitter_1.EventEmitter());
        this.onBufferChange = this._onBufferChange.event;
        this._normal = new BufferApiView_1.BufferApiView(this._core.buffers.normal, 'normal');
        this._alternate = new BufferApiView_1.BufferApiView(this._core.buffers.alt, 'alternate');
        this._core.buffers.onBufferActivate(() => this._onBufferChange.fire(this.active));
    }
    get active() {
        if (this._core.buffers.active === this._core.buffers.normal) {
            return this.normal;
        }
        if (this._core.buffers.active === this._core.buffers.alt) {
            return this.alternate;
        }
        throw new Error('Active buffer is neither normal nor alternate');
    }
    get normal() {
        return this._normal.init(this._core.buffers.normal);
    }
    get alternate() {
        return this._alternate.init(this._core.buffers.alt);
    }
}
exports.BufferNamespaceApi = BufferNamespaceApi;
//# sourceMappingURL=BufferNamespaceApi.js.map