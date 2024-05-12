"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CharsetService = void 0;
class CharsetService {
    constructor() {
        this.glevel = 0;
        this._charsets = [];
    }
    reset() {
        this.charset = undefined;
        this._charsets = [];
        this.glevel = 0;
    }
    setgLevel(g) {
        this.glevel = g;
        this.charset = this._charsets[g];
    }
    setgCharset(g, charset) {
        this._charsets[g] = charset;
        if (this.glevel === g) {
            this.charset = charset;
        }
    }
}
exports.CharsetService = CharsetService;
//# sourceMappingURL=CharsetService.js.map