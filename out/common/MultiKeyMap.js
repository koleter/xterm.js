"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FourKeyMap = exports.TwoKeyMap = void 0;
class TwoKeyMap {
    constructor() {
        this._data = {};
    }
    set(first, second, value) {
        if (!this._data[first]) {
            this._data[first] = {};
        }
        this._data[first][second] = value;
    }
    get(first, second) {
        return this._data[first] ? this._data[first][second] : undefined;
    }
    clear() {
        this._data = {};
    }
}
exports.TwoKeyMap = TwoKeyMap;
class FourKeyMap {
    constructor() {
        this._data = new TwoKeyMap();
    }
    set(first, second, third, fourth, value) {
        if (!this._data.get(first, second)) {
            this._data.set(first, second, new TwoKeyMap());
        }
        this._data.get(first, second).set(third, fourth, value);
    }
    get(first, second, third, fourth) {
        return this._data.get(first, second)?.get(third, fourth);
    }
    clear() {
        this._data.clear();
    }
}
exports.FourKeyMap = FourKeyMap;
//# sourceMappingURL=MultiKeyMap.js.map