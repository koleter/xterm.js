"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnicodeGraphemeProvider = void 0;
const UnicodeService_1 = require("common/services/UnicodeService");
const UC = require("./third-party/UnicodeProperties");
class UnicodeGraphemeProvider {
    constructor(handleGraphemes = true) {
        this.ambiguousCharsAreWide = false;
        this.version = handleGraphemes ? '15-graphemes' : '15';
        this.handleGraphemes = handleGraphemes;
    }
    charProperties(codepoint, preceding) {
        if ((codepoint >= 32 && codepoint < 127) && (preceding >> 3) === 0) {
            return UnicodeGraphemeProvider._plainNarrowProperties;
        }
        let charInfo = UC.getInfo(codepoint);
        let w = UC.infoToWidthInfo(charInfo);
        let shouldJoin = false;
        if (w >= 2) {
            w = w === 3 || this.ambiguousCharsAreWide || codepoint === 0xfe0f ? 2 : 1;
        }
        else {
            w = 1;
        }
        if (preceding !== 0) {
            const oldWidth = UnicodeService_1.UnicodeService.extractWidth(preceding);
            if (this.handleGraphemes) {
                charInfo = UC.shouldJoin(UnicodeService_1.UnicodeService.extractCharKind(preceding), charInfo);
            }
            else {
                charInfo = w === 0 ? 1 : 0;
            }
            shouldJoin = charInfo > 0;
            if (shouldJoin) {
                if (oldWidth > w) {
                    w = oldWidth;
                }
                else if (charInfo === 32) {
                    w = 2;
                }
            }
        }
        return UnicodeService_1.UnicodeService.createPropertyValue(charInfo, w, shouldJoin);
    }
    wcwidth(codepoint) {
        const charInfo = UC.getInfo(codepoint);
        const w = UC.infoToWidthInfo(charInfo);
        const kind = (charInfo & UC.GRAPHEME_BREAK_MASK) >> UC.GRAPHEME_BREAK_SHIFT;
        if (kind === UC.GRAPHEME_BREAK_Extend || kind === UC.GRAPHEME_BREAK_Prepend) {
            return 0;
        }
        if (w >= 2 && (w === 3 || this.ambiguousCharsAreWide)) {
            return 2;
        }
        return 1;
    }
}
exports.UnicodeGraphemeProvider = UnicodeGraphemeProvider;
UnicodeGraphemeProvider._plainNarrowProperties = UnicodeService_1.UnicodeService.createPropertyValue(UC.GRAPHEME_BREAK_Other, 1, false);
//# sourceMappingURL=UnicodeGraphemeProvider.js.map