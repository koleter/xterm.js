"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const RendererUtils_1 = require("browser/renderer/shared/RendererUtils");
const chai_1 = require("chai");
describe('RendererUtils', () => {
    it('computeNextVariantOffset', () => {
        const cellWidth = 11;
        const doubleCellWidth = 22;
        let line = 1;
        let variantOffset = 0;
        let cells = [cellWidth, cellWidth, doubleCellWidth, doubleCellWidth];
        let result = [1, 0, 0, 0];
        for (let index = 0; index < cells.length; index++) {
            const cell = cells[index];
            variantOffset = (0, RendererUtils_1.computeNextVariantOffset)(cell, line, variantOffset);
            chai_1.assert.equal(variantOffset, result[index]);
        }
        line = 2;
        variantOffset = 0;
        cells = [cellWidth, cellWidth, doubleCellWidth, doubleCellWidth];
        result = [3, 2, 0, 2];
        for (let index = 0; index < cells.length; index++) {
            const cell = cells[index];
            variantOffset = (0, RendererUtils_1.computeNextVariantOffset)(cell, line, variantOffset);
            chai_1.assert.equal(variantOffset, result[index]);
        }
        line = 3;
        variantOffset = 0;
        cells = [cellWidth, cellWidth, doubleCellWidth, doubleCellWidth];
        result = [5, 4, 2, 0];
        for (let index = 0; index < cells.length; index++) {
            const cell = cells[index];
            variantOffset = (0, RendererUtils_1.computeNextVariantOffset)(cell, line, variantOffset);
            chai_1.assert.equal(variantOffset, result[index]);
        }
    });
});
//# sourceMappingURL=RendererUtils.test.js.map