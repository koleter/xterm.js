"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelectionRenderLayer = void 0;
const BaseRenderLayer_1 = require("./BaseRenderLayer");
class SelectionRenderLayer extends BaseRenderLayer_1.BaseRenderLayer {
    constructor(terminal, container, zIndex, bufferService, coreBrowserService, decorationService, optionsService, themeService) {
        super(terminal, container, 'selection', zIndex, true, themeService, bufferService, optionsService, decorationService, coreBrowserService);
        this._clearState();
    }
    _clearState() {
        this._state = {
            start: undefined,
            end: undefined,
            columnSelectMode: undefined,
            ydisp: undefined
        };
    }
    resize(dim) {
        super.resize(dim);
        if (this._selectionModel.selectionStart && this._selectionModel.selectionEnd) {
            this._clearState();
            this._redrawSelection(this._selectionModel.selectionStart, this._selectionModel.selectionEnd, this._selectionModel.columnSelectMode);
        }
    }
    reset() {
        if (this._state.start && this._state.end) {
            this._clearState();
            this._clearAll();
        }
    }
    handleBlur() {
        this.reset();
        this._redrawSelection(this._selectionModel.selectionStart, this._selectionModel.selectionEnd, this._selectionModel.columnSelectMode);
    }
    handleFocus() {
        this.reset();
        this._redrawSelection(this._selectionModel.selectionStart, this._selectionModel.selectionEnd, this._selectionModel.columnSelectMode);
    }
    handleSelectionChanged(start, end, columnSelectMode) {
        super.handleSelectionChanged(start, end, columnSelectMode);
        this._redrawSelection(start, end, columnSelectMode);
    }
    _redrawSelection(start, end, columnSelectMode) {
        if (!this._didStateChange(start, end, columnSelectMode, this._bufferService.buffer.ydisp)) {
            return;
        }
        this._clearAll();
        if (!start || !end) {
            this._clearState();
            return;
        }
        const viewportStartRow = start[1] - this._bufferService.buffer.ydisp;
        const viewportEndRow = end[1] - this._bufferService.buffer.ydisp;
        const viewportCappedStartRow = Math.max(viewportStartRow, 0);
        const viewportCappedEndRow = Math.min(viewportEndRow, this._bufferService.rows - 1);
        if (viewportCappedStartRow >= this._bufferService.rows || viewportCappedEndRow < 0) {
            this._state.ydisp = this._bufferService.buffer.ydisp;
            return;
        }
        this._ctx.fillStyle = (this._coreBrowserService.isFocused
            ? this._themeService.colors.selectionBackgroundTransparent
            : this._themeService.colors.selectionInactiveBackgroundTransparent).css;
        if (columnSelectMode) {
            const startCol = start[0];
            const width = end[0] - startCol;
            const height = viewportCappedEndRow - viewportCappedStartRow + 1;
            this._fillCells(startCol, viewportCappedStartRow, width, height);
        }
        else {
            const startCol = viewportStartRow === viewportCappedStartRow ? start[0] : 0;
            const startRowEndCol = viewportCappedStartRow === viewportEndRow ? end[0] : this._bufferService.cols;
            this._fillCells(startCol, viewportCappedStartRow, startRowEndCol - startCol, 1);
            const middleRowsCount = Math.max(viewportCappedEndRow - viewportCappedStartRow - 1, 0);
            this._fillCells(0, viewportCappedStartRow + 1, this._bufferService.cols, middleRowsCount);
            if (viewportCappedStartRow !== viewportCappedEndRow) {
                const endCol = viewportEndRow === viewportCappedEndRow ? end[0] : this._bufferService.cols;
                this._fillCells(0, viewportCappedEndRow, endCol, 1);
            }
        }
        this._state.start = [start[0], start[1]];
        this._state.end = [end[0], end[1]];
        this._state.columnSelectMode = columnSelectMode;
        this._state.ydisp = this._bufferService.buffer.ydisp;
    }
    _didStateChange(start, end, columnSelectMode, ydisp) {
        return !this._areCoordinatesEqual(start, this._state.start) ||
            !this._areCoordinatesEqual(end, this._state.end) ||
            columnSelectMode !== this._state.columnSelectMode ||
            ydisp !== this._state.ydisp;
    }
    _areCoordinatesEqual(coord1, coord2) {
        if (!coord1 || !coord2) {
            return false;
        }
        return coord1[0] === coord2[0] && coord1[1] === coord2[1];
    }
}
exports.SelectionRenderLayer = SelectionRenderLayer;
//# sourceMappingURL=SelectionRenderLayer.js.map