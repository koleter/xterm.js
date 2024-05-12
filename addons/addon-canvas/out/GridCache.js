"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GridCache = void 0;
class GridCache {
    constructor() {
        this.cache = [];
    }
    resize(width, height) {
        for (let x = 0; x < width; x++) {
            if (this.cache.length <= x) {
                this.cache.push([]);
            }
            for (let y = this.cache[x].length; y < height; y++) {
                this.cache[x].push(undefined);
            }
            this.cache[x].length = height;
        }
        this.cache.length = width;
    }
    clear() {
        for (let x = 0; x < this.cache.length; x++) {
            for (let y = 0; y < this.cache[x].length; y++) {
                this.cache[x][y] = undefined;
            }
        }
    }
}
exports.GridCache = GridCache;
//# sourceMappingURL=GridCache.js.map