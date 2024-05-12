"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CellData = void 0;
const TextDecoder_1 = require("common/input/TextDecoder");
const Constants_1 = require("common/buffer/Constants");
const AttributeData_1 = require("common/buffer/AttributeData");
class CellData extends AttributeData_1.AttributeData {
    constructor() {
        super(...arguments);
        this.content = 0;
        this.fg = 0;
        this.bg = 0;
        this.extended = new AttributeData_1.ExtendedAttrs();
        this.combinedData = '';
    }
    static fromCharData(value) {
        const obj = new CellData();
        obj.setFromCharData(value);
        return obj;
    }
    isCombined() {
        return this.content & 2097152;
    }
    getWidth() {
        return this.content >> 22;
    }
    getChars() {
        if (this.content & 2097152) {
            return this.combinedData;
        }
        if (this.content & 2097151) {
            return (0, TextDecoder_1.stringFromCodePoint)(this.content & 2097151);
        }
        return '';
    }
    getCode() {
        return (this.isCombined())
            ? this.combinedData.charCodeAt(this.combinedData.length - 1)
            : this.content & 2097151;
    }
    setFromCharData(value) {
        this.fg = value[Constants_1.CHAR_DATA_ATTR_INDEX];
        this.bg = 0;
        let combined = false;
        if (value[Constants_1.CHAR_DATA_CHAR_INDEX].length > 2) {
            combined = true;
        }
        else if (value[Constants_1.CHAR_DATA_CHAR_INDEX].length === 2) {
            const code = value[Constants_1.CHAR_DATA_CHAR_INDEX].charCodeAt(0);
            if (0xD800 <= code && code <= 0xDBFF) {
                const second = value[Constants_1.CHAR_DATA_CHAR_INDEX].charCodeAt(1);
                if (0xDC00 <= second && second <= 0xDFFF) {
                    this.content = ((code - 0xD800) * 0x400 + second - 0xDC00 + 0x10000) | (value[Constants_1.CHAR_DATA_WIDTH_INDEX] << 22);
                }
                else {
                    combined = true;
                }
            }
            else {
                combined = true;
            }
        }
        else {
            this.content = value[Constants_1.CHAR_DATA_CHAR_INDEX].charCodeAt(0) | (value[Constants_1.CHAR_DATA_WIDTH_INDEX] << 22);
        }
        if (combined) {
            this.combinedData = value[Constants_1.CHAR_DATA_CHAR_INDEX];
            this.content = 2097152 | (value[Constants_1.CHAR_DATA_WIDTH_INDEX] << 22);
        }
    }
    getAsCharData() {
        return [this.fg, this.getChars(), this.getWidth(), this.getCode()];
    }
}
exports.CellData = CellData;
//# sourceMappingURL=CellData.js.map