"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BufferLineApiView = void 0;
const CellData_1 = require("common/buffer/CellData");
class BufferLineApiView {
    constructor(_line) {
        this._line = _line;
    }
    get isWrapped() { return this._line.isWrapped; }
    get length() { return this._line.length; }
    getCell(x, cell) {
        if (x < 0 || x >= this._line.length) {
            return undefined;
        }
        if (cell) {
            this._line.loadCell(x, cell);
            return cell;
        }
        return this._line.loadCell(x, new CellData_1.CellData());
    }
    translateToString(trimRight, startColumn, endColumn) {
        return this._line.translateToString(trimRight, startColumn, endColumn);
    }
}
exports.BufferLineApiView = BufferLineApiView;
//# sourceMappingURL=BufferLineApiView.js.map