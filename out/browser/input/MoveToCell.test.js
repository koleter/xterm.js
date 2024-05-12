"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const TestUtils_test_1 = require("common/TestUtils.test");
const MoveToCell_1 = require("./MoveToCell");
describe('MoveToCell', () => {
    let bufferService;
    beforeEach(() => {
        bufferService = new TestUtils_test_1.MockBufferService(5, 5);
        bufferService.buffer.x = 3;
        bufferService.buffer.y = 3;
    });
    describe('normal buffer', () => {
        it('should use the right directional escape sequences', () => {
            chai_1.assert.equal((0, MoveToCell_1.moveToCellSequence)(1, 3, bufferService, false), '\x1b[D\x1b[D');
            chai_1.assert.equal((0, MoveToCell_1.moveToCellSequence)(2, 3, bufferService, false), '\x1b[D');
            chai_1.assert.equal((0, MoveToCell_1.moveToCellSequence)(4, 3, bufferService, false), '\x1b[C');
            chai_1.assert.equal((0, MoveToCell_1.moveToCellSequence)(5, 3, bufferService, false), '\x1b[C\x1b[C');
        });
        it('should wrap around entire row instead of doing up and down when the Y value differs', () => {
            chai_1.assert.equal((0, MoveToCell_1.moveToCellSequence)(1, 1, bufferService, false), '\x1b[D\x1b[D\x1b[D\x1b[D\x1b[D\x1b[D\x1b[D\x1b[D\x1b[D\x1b[D\x1b[D\x1b[D');
            chai_1.assert.equal((0, MoveToCell_1.moveToCellSequence)(2, 1, bufferService, false), '\x1b[D\x1b[D\x1b[D\x1b[D\x1b[D\x1b[D\x1b[D\x1b[D\x1b[D\x1b[D\x1b[D');
            chai_1.assert.equal((0, MoveToCell_1.moveToCellSequence)(3, 1, bufferService, false), '\x1b[D\x1b[D\x1b[D\x1b[D\x1b[D\x1b[D\x1b[D\x1b[D\x1b[D\x1b[D');
            chai_1.assert.equal((0, MoveToCell_1.moveToCellSequence)(4, 1, bufferService, false), '\x1b[D\x1b[D\x1b[D\x1b[D\x1b[D\x1b[D\x1b[D\x1b[D\x1b[D');
            chai_1.assert.equal((0, MoveToCell_1.moveToCellSequence)(5, 1, bufferService, false), '\x1b[D\x1b[D\x1b[D\x1b[D\x1b[D\x1b[D\x1b[D\x1b[D');
            chai_1.assert.equal((0, MoveToCell_1.moveToCellSequence)(1, 2, bufferService, false), '\x1b[D\x1b[D\x1b[D\x1b[D\x1b[D\x1b[D\x1b[D');
            chai_1.assert.equal((0, MoveToCell_1.moveToCellSequence)(2, 2, bufferService, false), '\x1b[D\x1b[D\x1b[D\x1b[D\x1b[D\x1b[D');
            chai_1.assert.equal((0, MoveToCell_1.moveToCellSequence)(3, 2, bufferService, false), '\x1b[D\x1b[D\x1b[D\x1b[D\x1b[D');
            chai_1.assert.equal((0, MoveToCell_1.moveToCellSequence)(4, 2, bufferService, false), '\x1b[D\x1b[D\x1b[D\x1b[D');
            chai_1.assert.equal((0, MoveToCell_1.moveToCellSequence)(5, 2, bufferService, false), '\x1b[D\x1b[D\x1b[D');
            chai_1.assert.equal((0, MoveToCell_1.moveToCellSequence)(1, 4, bufferService, false), '\x1b[C\x1b[C\x1b[C');
            chai_1.assert.equal((0, MoveToCell_1.moveToCellSequence)(2, 4, bufferService, false), '\x1b[C\x1b[C\x1b[C\x1b[C');
            chai_1.assert.equal((0, MoveToCell_1.moveToCellSequence)(3, 4, bufferService, false), '\x1b[C\x1b[C\x1b[C\x1b[C\x1b[C');
            chai_1.assert.equal((0, MoveToCell_1.moveToCellSequence)(4, 4, bufferService, false), '\x1b[C\x1b[C\x1b[C\x1b[C\x1b[C\x1b[C');
            chai_1.assert.equal((0, MoveToCell_1.moveToCellSequence)(5, 4, bufferService, false), '\x1b[C\x1b[C\x1b[C\x1b[C\x1b[C\x1b[C\x1b[C');
            chai_1.assert.equal((0, MoveToCell_1.moveToCellSequence)(1, 5, bufferService, false), '\x1b[C\x1b[C\x1b[C\x1b[C\x1b[C\x1b[C\x1b[C\x1b[C');
            chai_1.assert.equal((0, MoveToCell_1.moveToCellSequence)(2, 5, bufferService, false), '\x1b[C\x1b[C\x1b[C\x1b[C\x1b[C\x1b[C\x1b[C\x1b[C\x1b[C');
            chai_1.assert.equal((0, MoveToCell_1.moveToCellSequence)(3, 5, bufferService, false), '\x1b[C\x1b[C\x1b[C\x1b[C\x1b[C\x1b[C\x1b[C\x1b[C\x1b[C\x1b[C');
            chai_1.assert.equal((0, MoveToCell_1.moveToCellSequence)(4, 5, bufferService, false), '\x1b[C\x1b[C\x1b[C\x1b[C\x1b[C\x1b[C\x1b[C\x1b[C\x1b[C\x1b[C\x1b[C');
            chai_1.assert.equal((0, MoveToCell_1.moveToCellSequence)(5, 5, bufferService, false), '\x1b[C\x1b[C\x1b[C\x1b[C\x1b[C\x1b[C\x1b[C\x1b[C\x1b[C\x1b[C\x1b[C\x1b[C');
        });
        it('should use the correct character for application cursor', () => {
            chai_1.assert.equal((0, MoveToCell_1.moveToCellSequence)(3, 1, bufferService, true), '\x1bOD\x1bOD\x1bOD\x1bOD\x1bOD\x1bOD\x1bOD\x1bOD\x1bOD\x1bOD');
            chai_1.assert.equal((0, MoveToCell_1.moveToCellSequence)(3, 2, bufferService, true), '\x1bOD\x1bOD\x1bOD\x1bOD\x1bOD');
            chai_1.assert.equal((0, MoveToCell_1.moveToCellSequence)(2, 3, bufferService, true), '\x1bOD');
            chai_1.assert.equal((0, MoveToCell_1.moveToCellSequence)(4, 3, bufferService, true), '\x1bOC');
            chai_1.assert.equal((0, MoveToCell_1.moveToCellSequence)(3, 4, bufferService, true), '\x1bOC\x1bOC\x1bOC\x1bOC\x1bOC');
            chai_1.assert.equal((0, MoveToCell_1.moveToCellSequence)(3, 5, bufferService, true), '\x1bOC\x1bOC\x1bOC\x1bOC\x1bOC\x1bOC\x1bOC\x1bOC\x1bOC\x1bOC');
        });
    });
    describe('alt buffer', () => {
        beforeEach(() => {
            bufferService.buffers.activateAltBuffer();
            bufferService.buffer.x = 3;
            bufferService.buffer.y = 3;
        });
        it('should move the cursor across rows', () => {
            chai_1.assert.equal((0, MoveToCell_1.moveToCellSequence)(4, 4, bufferService, false), '\x1b[B\x1b[C');
        });
    });
});
//# sourceMappingURL=MoveToCell.test.js.map