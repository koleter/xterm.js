"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Marker = void 0;
const EventEmitter_1 = require("common/EventEmitter");
const Lifecycle_1 = require("common/Lifecycle");
class Marker {
    get id() { return this._id; }
    constructor(line) {
        this.line = line;
        this.isDisposed = false;
        this._disposables = [];
        this._id = Marker._nextId++;
        this._onDispose = this.register(new EventEmitter_1.EventEmitter());
        this.onDispose = this._onDispose.event;
    }
    dispose() {
        if (this.isDisposed) {
            return;
        }
        this.isDisposed = true;
        this.line = -1;
        this._onDispose.fire();
        (0, Lifecycle_1.disposeArray)(this._disposables);
        this._disposables.length = 0;
    }
    register(disposable) {
        this._disposables.push(disposable);
        return disposable;
    }
}
exports.Marker = Marker;
Marker._nextId = 1;
//# sourceMappingURL=Marker.js.map