"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const BufferRange_1 = require("common/buffer/BufferRange");
describe('BufferRange', () => {
    describe('getRangeLength', () => {
        it('should get range for single line', () => {
            chai_1.assert.equal((0, BufferRange_1.getRangeLength)(createRange(1, 1, 4, 1), 0), 4);
        });
        it('should throw for invalid range', () => {
            chai_1.assert.throws(() => (0, BufferRange_1.getRangeLength)(createRange(1, 3, 1, 1), 0));
        });
        it('should get range multiple lines', () => {
            chai_1.assert.equal((0, BufferRange_1.getRangeLength)(createRange(1, 1, 4, 5), 5), 24);
        });
        it('should get range for end line right after start line', () => {
            chai_1.assert.equal((0, BufferRange_1.getRangeLength)(createRange(1, 1, 7, 2), 5), 12);
        });
    });
});
function createRange(x1, y1, x2, y2) {
    return {
        start: { x: x1, y: y1 },
        end: { x: x2, y: y2 }
    };
}
//# sourceMappingURL=BufferRange.test.js.map