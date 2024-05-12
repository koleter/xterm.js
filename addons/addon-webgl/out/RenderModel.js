"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RenderModel = exports.COMBINED_CHAR_BIT_MASK = exports.RENDER_MODEL_EXT_OFFSET = exports.RENDER_MODEL_FG_OFFSET = exports.RENDER_MODEL_BG_OFFSET = exports.RENDER_MODEL_INDICIES_PER_CELL = void 0;
const SelectionRenderModel_1 = require("browser/renderer/shared/SelectionRenderModel");
exports.RENDER_MODEL_INDICIES_PER_CELL = 4;
exports.RENDER_MODEL_BG_OFFSET = 1;
exports.RENDER_MODEL_FG_OFFSET = 2;
exports.RENDER_MODEL_EXT_OFFSET = 3;
exports.COMBINED_CHAR_BIT_MASK = 0x80000000;
class RenderModel {
    constructor() {
        this.cells = new Uint32Array(0);
        this.lineLengths = new Uint32Array(0);
        this.selection = (0, SelectionRenderModel_1.createSelectionRenderModel)();
    }
    resize(cols, rows) {
        const indexCount = cols * rows * exports.RENDER_MODEL_INDICIES_PER_CELL;
        if (indexCount !== this.cells.length) {
            this.cells = new Uint32Array(indexCount);
            this.lineLengths = new Uint32Array(rows);
        }
    }
    clear() {
        this.cells.fill(0, 0);
        this.lineLengths.fill(0, 0);
    }
}
exports.RenderModel = RenderModel;
//# sourceMappingURL=RenderModel.js.map