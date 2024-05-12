"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnicodeGraphemesAddon = void 0;
const UnicodeGraphemeProvider_1 = require("./UnicodeGraphemeProvider");
class UnicodeGraphemesAddon {
    constructor() {
        this._oldVersion = '';
    }
    activate(terminal) {
        if (!this._provider15) {
            this._provider15 = new UnicodeGraphemeProvider_1.UnicodeGraphemeProvider(false);
        }
        if (!this._provider15Graphemes) {
            this._provider15Graphemes = new UnicodeGraphemeProvider_1.UnicodeGraphemeProvider(true);
        }
        const unicode = terminal.unicode;
        this._unicode = unicode;
        unicode.register(this._provider15);
        unicode.register(this._provider15Graphemes);
        this._oldVersion = unicode.activeVersion;
        unicode.activeVersion = '15-graphemes';
    }
    dispose() {
        if (this._unicode) {
            this._unicode.activeVersion = this._oldVersion;
        }
    }
}
exports.UnicodeGraphemesAddon = UnicodeGraphemesAddon;
//# sourceMappingURL=UnicodeGraphemesAddon.js.map