"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateWindowsModeWrappedState = void 0;
const Constants_1 = require("common/buffer/Constants");
function updateWindowsModeWrappedState(bufferService) {
    const line = bufferService.buffer.lines.get(bufferService.buffer.ybase + bufferService.buffer.y - 1);
    const lastChar = line?.get(bufferService.cols - 1);
    const nextLine = bufferService.buffer.lines.get(bufferService.buffer.ybase + bufferService.buffer.y);
    if (nextLine && lastChar) {
        nextLine.isWrapped = (lastChar[Constants_1.CHAR_DATA_CODE_INDEX] !== Constants_1.NULL_CELL_CODE && lastChar[Constants_1.CHAR_DATA_CODE_INDEX] !== Constants_1.WHITESPACE_CELL_CODE);
    }
}
exports.updateWindowsModeWrappedState = updateWindowsModeWrappedState;
//# sourceMappingURL=WindowsMode.js.map