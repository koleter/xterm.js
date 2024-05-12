"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createSelectionRenderModel = void 0;
class SelectionRenderModel {
    constructor() {
        this.clear();
    }
    clear() {
        this.hasSelection = false;
        this.columnSelectMode = false;
        this.viewportStartRow = 0;
        this.viewportEndRow = 0;
        this.viewportCappedStartRow = 0;
        this.viewportCappedEndRow = 0;
        this.startCol = 0;
        this.endCol = 0;
        this.selectionStart = undefined;
        this.selectionEnd = undefined;
    }
    update(terminal, start, end, columnSelectMode = false) {
        this.selectionStart = start;
        this.selectionEnd = end;
        if (!start || !end || (start[0] === end[0] && start[1] === end[1])) {
            this.clear();
            return;
        }
        const viewportY = terminal.buffers.active.ydisp;
        const viewportStartRow = start[1] - viewportY;
        const viewportEndRow = end[1] - viewportY;
        const viewportCappedStartRow = Math.max(viewportStartRow, 0);
        const viewportCappedEndRow = Math.min(viewportEndRow, terminal.rows - 1);
        if (viewportCappedStartRow >= terminal.rows || viewportCappedEndRow < 0) {
            this.clear();
            return;
        }
        this.hasSelection = true;
        this.columnSelectMode = columnSelectMode;
        this.viewportStartRow = viewportStartRow;
        this.viewportEndRow = viewportEndRow;
        this.viewportCappedStartRow = viewportCappedStartRow;
        this.viewportCappedEndRow = viewportCappedEndRow;
        this.startCol = start[0];
        this.endCol = end[0];
    }
    isCellSelected(terminal, x, y) {
        if (!this.hasSelection) {
            return false;
        }
        y -= terminal.buffer.active.viewportY;
        if (this.columnSelectMode) {
            if (this.startCol <= this.endCol) {
                return x >= this.startCol && y >= this.viewportCappedStartRow &&
                    x < this.endCol && y <= this.viewportCappedEndRow;
            }
            return x < this.startCol && y >= this.viewportCappedStartRow &&
                x >= this.endCol && y <= this.viewportCappedEndRow;
        }
        return (y > this.viewportStartRow && y < this.viewportEndRow) ||
            (this.viewportStartRow === this.viewportEndRow && y === this.viewportStartRow && x >= this.startCol && x < this.endCol) ||
            (this.viewportStartRow < this.viewportEndRow && y === this.viewportEndRow && x < this.endCol) ||
            (this.viewportStartRow < this.viewportEndRow && y === this.viewportStartRow && x >= this.startCol);
    }
}
function createSelectionRenderModel() {
    return new SelectionRenderModel();
}
exports.createSelectionRenderModel = createSelectionRenderModel;
//# sourceMappingURL=SelectionRenderModel.js.map