"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getDisposeArrayDisposable = exports.disposeArray = exports.toDisposable = exports.MutableDisposable = exports.Disposable = void 0;
class Disposable {
    constructor() {
        this._disposables = [];
        this._isDisposed = false;
    }
    dispose() {
        this._isDisposed = true;
        for (const d of this._disposables) {
            d.dispose();
        }
        this._disposables.length = 0;
    }
    register(d) {
        this._disposables.push(d);
        return d;
    }
    unregister(d) {
        const index = this._disposables.indexOf(d);
        if (index !== -1) {
            this._disposables.splice(index, 1);
        }
    }
}
exports.Disposable = Disposable;
class MutableDisposable {
    constructor() {
        this._isDisposed = false;
    }
    get value() {
        return this._isDisposed ? undefined : this._value;
    }
    set value(value) {
        if (this._isDisposed || value === this._value) {
            return;
        }
        this._value?.dispose();
        this._value = value;
    }
    clear() {
        this.value = undefined;
    }
    dispose() {
        this._isDisposed = true;
        this._value?.dispose();
        this._value = undefined;
    }
}
exports.MutableDisposable = MutableDisposable;
function toDisposable(f) {
    return { dispose: f };
}
exports.toDisposable = toDisposable;
function disposeArray(disposables) {
    for (const d of disposables) {
        d.dispose();
    }
    disposables.length = 0;
}
exports.disposeArray = disposeArray;
function getDisposeArrayDisposable(array) {
    return { dispose: () => disposeArray(array) };
}
exports.getDisposeArrayDisposable = getDisposeArrayDisposable;
//# sourceMappingURL=Lifecycle.js.map