"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const TypedArrayUtils_1 = require("common/TypedArrayUtils");
function deepEquals(a, b) {
    chai_1.assert.equal(a.length, b.length);
    for (let i = 0; i < a.length; ++i) {
        chai_1.assert.equal(a[i], b[i]);
    }
}
describe('typed array convenience functions', () => {
    it('concat', () => {
        const a = new Uint8Array([1, 2, 3, 4, 5]);
        const b = new Uint8Array([6, 7, 8, 9, 0]);
        const merged = (0, TypedArrayUtils_1.concat)(a, b);
        deepEquals(merged, new Uint8Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 0]));
    });
});
//# sourceMappingURL=TypedArrayUtils.test.js.map