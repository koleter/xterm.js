"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ColorContrastCache = void 0;
const MultiKeyMap_1 = require("common/MultiKeyMap");
class ColorContrastCache {
    constructor() {
        this._color = new MultiKeyMap_1.TwoKeyMap();
        this._css = new MultiKeyMap_1.TwoKeyMap();
    }
    setCss(bg, fg, value) {
        this._css.set(bg, fg, value);
    }
    getCss(bg, fg) {
        return this._css.get(bg, fg);
    }
    setColor(bg, fg, value) {
        this._color.set(bg, fg, value);
    }
    getColor(bg, fg) {
        return this._color.get(bg, fg);
    }
    clear() {
        this._color.clear();
        this._css.clear();
    }
}
exports.ColorContrastCache = ColorContrastCache;
//# sourceMappingURL=ColorContrastCache.js.map