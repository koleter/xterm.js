"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BufferApiView = void 0;
const BufferLineApiView_1 = require("common/public/BufferLineApiView");
const CellData_1 = require("common/buffer/CellData");
class BufferApiView {
    constructor(_buffer, type) {
        this._buffer = _buffer;
        this.type = type;
    }
    init(buffer) {
        this._buffer = buffer;
        return this;
    }
    get cursorY() { return this._buffer.y; }
    get cursorX() { return this._buffer.x; }
    get viewportY() { return this._buffer.ydisp; }
    get baseY() { return this._buffer.ybase; }
    get length() { return this._buffer.lines.length; }
    getLine(y) {
        const line = this._buffer.lines.get(y);
        if (!line) {
            return undefined;
        }
        return new BufferLineApiView_1.BufferLineApiView(line);
    }
    getNullCell() { return new CellData_1.CellData(); }
}
exports.BufferApiView = BufferApiView;
//# sourceMappingURL=BufferApiView.js.map