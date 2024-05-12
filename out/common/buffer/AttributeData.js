"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ExtendedAttrs = exports.AttributeData = void 0;
class AttributeData {
    constructor() {
        this.fg = 0;
        this.bg = 0;
        this.extended = new ExtendedAttrs();
    }
    static toColorRGB(value) {
        return [
            value >>> 16 & 255,
            value >>> 8 & 255,
            value & 255
        ];
    }
    static fromColorRGB(value) {
        return (value[0] & 255) << 16 | (value[1] & 255) << 8 | value[2] & 255;
    }
    clone() {
        const newObj = new AttributeData();
        newObj.fg = this.fg;
        newObj.bg = this.bg;
        newObj.extended = this.extended.clone();
        return newObj;
    }
    isInverse() { return this.fg & 67108864; }
    isBold() { return this.fg & 134217728; }
    isUnderline() {
        if (this.hasExtendedAttrs() && this.extended.underlineStyle !== 0) {
            return 1;
        }
        return this.fg & 268435456;
    }
    isBlink() { return this.fg & 536870912; }
    isInvisible() { return this.fg & 1073741824; }
    isItalic() { return this.bg & 67108864; }
    isDim() { return this.bg & 134217728; }
    isStrikethrough() { return this.fg & 2147483648; }
    isProtected() { return this.bg & 536870912; }
    isOverline() { return this.bg & 1073741824; }
    getFgColorMode() { return this.fg & 50331648; }
    getBgColorMode() { return this.bg & 50331648; }
    isFgRGB() { return (this.fg & 50331648) === 50331648; }
    isBgRGB() { return (this.bg & 50331648) === 50331648; }
    isFgPalette() { return (this.fg & 50331648) === 16777216 || (this.fg & 50331648) === 33554432; }
    isBgPalette() { return (this.bg & 50331648) === 16777216 || (this.bg & 50331648) === 33554432; }
    isFgDefault() { return (this.fg & 50331648) === 0; }
    isBgDefault() { return (this.bg & 50331648) === 0; }
    isAttributeDefault() { return this.fg === 0 && this.bg === 0; }
    getFgColor() {
        switch (this.fg & 50331648) {
            case 16777216:
            case 33554432: return this.fg & 255;
            case 50331648: return this.fg & 16777215;
            default: return -1;
        }
    }
    getBgColor() {
        switch (this.bg & 50331648) {
            case 16777216:
            case 33554432: return this.bg & 255;
            case 50331648: return this.bg & 16777215;
            default: return -1;
        }
    }
    hasExtendedAttrs() {
        return this.bg & 268435456;
    }
    updateExtended() {
        if (this.extended.isEmpty()) {
            this.bg &= ~268435456;
        }
        else {
            this.bg |= 268435456;
        }
    }
    getUnderlineColor() {
        if ((this.bg & 268435456) && ~this.extended.underlineColor) {
            switch (this.extended.underlineColor & 50331648) {
                case 16777216:
                case 33554432: return this.extended.underlineColor & 255;
                case 50331648: return this.extended.underlineColor & 16777215;
                default: return this.getFgColor();
            }
        }
        return this.getFgColor();
    }
    getUnderlineColorMode() {
        return (this.bg & 268435456) && ~this.extended.underlineColor
            ? this.extended.underlineColor & 50331648
            : this.getFgColorMode();
    }
    isUnderlineColorRGB() {
        return (this.bg & 268435456) && ~this.extended.underlineColor
            ? (this.extended.underlineColor & 50331648) === 50331648
            : this.isFgRGB();
    }
    isUnderlineColorPalette() {
        return (this.bg & 268435456) && ~this.extended.underlineColor
            ? (this.extended.underlineColor & 50331648) === 16777216
                || (this.extended.underlineColor & 50331648) === 33554432
            : this.isFgPalette();
    }
    isUnderlineColorDefault() {
        return (this.bg & 268435456) && ~this.extended.underlineColor
            ? (this.extended.underlineColor & 50331648) === 0
            : this.isFgDefault();
    }
    getUnderlineStyle() {
        return this.fg & 268435456
            ? (this.bg & 268435456 ? this.extended.underlineStyle : 1)
            : 0;
    }
    getUnderlineVariantOffset() {
        return this.extended.underlineVariantOffset;
    }
}
exports.AttributeData = AttributeData;
class ExtendedAttrs {
    get ext() {
        if (this._urlId) {
            return ((this._ext & ~469762048) |
                (this.underlineStyle << 26));
        }
        return this._ext;
    }
    set ext(value) { this._ext = value; }
    get underlineStyle() {
        if (this._urlId) {
            return 5;
        }
        return (this._ext & 469762048) >> 26;
    }
    set underlineStyle(value) {
        this._ext &= ~469762048;
        this._ext |= (value << 26) & 469762048;
    }
    get underlineColor() {
        return this._ext & (50331648 | 16777215);
    }
    set underlineColor(value) {
        this._ext &= ~(50331648 | 16777215);
        this._ext |= value & (50331648 | 16777215);
    }
    get urlId() {
        return this._urlId;
    }
    set urlId(value) {
        this._urlId = value;
    }
    get underlineVariantOffset() {
        const val = (this._ext & 3758096384) >> 29;
        if (val < 0) {
            return val ^ 0xFFFFFFF8;
        }
        return val;
    }
    set underlineVariantOffset(value) {
        this._ext &= ~3758096384;
        this._ext |= (value << 29) & 3758096384;
    }
    constructor(ext = 0, urlId = 0) {
        this._ext = 0;
        this._urlId = 0;
        this._ext = ext;
        this._urlId = urlId;
    }
    clone() {
        return new ExtendedAttrs(this._ext, this._urlId);
    }
    isEmpty() {
        return this.underlineStyle === 0 && this._urlId === 0;
    }
}
exports.ExtendedAttrs = ExtendedAttrs;
//# sourceMappingURL=AttributeData.js.map