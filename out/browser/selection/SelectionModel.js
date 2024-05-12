"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelectionModel = void 0;
class SelectionModel {
    constructor(_bufferService) {
        this._bufferService = _bufferService;
        this.isSelectAllActive = false;
        this.selectionStartLength = 0;
    }
    clearSelection() {
        this.selectionStart = undefined;
        this.selectionEnd = undefined;
        this.isSelectAllActive = false;
        this.selectionStartLength = 0;
    }
    get finalSelectionStart() {
        if (this.isSelectAllActive) {
            return [0, 0];
        }
        if (!this.selectionEnd || !this.selectionStart) {
            return this.selectionStart;
        }
        return this.areSelectionValuesReversed() ? this.selectionEnd : this.selectionStart;
    }
    get finalSelectionEnd() {
        if (this.isSelectAllActive) {
            return [this._bufferService.cols, this._bufferService.buffer.ybase + this._bufferService.rows - 1];
        }
        if (!this.selectionStart) {
            return undefined;
        }
        if (!this.selectionEnd || this.areSelectionValuesReversed()) {
            const startPlusLength = this.selectionStart[0] + this.selectionStartLength;
            if (startPlusLength > this._bufferService.cols) {
                if (startPlusLength % this._bufferService.cols === 0) {
                    return [this._bufferService.cols, this.selectionStart[1] + Math.floor(startPlusLength / this._bufferService.cols) - 1];
                }
                return [startPlusLength % this._bufferService.cols, this.selectionStart[1] + Math.floor(startPlusLength / this._bufferService.cols)];
            }
            return [startPlusLength, this.selectionStart[1]];
        }
        if (this.selectionStartLength) {
            if (this.selectionEnd[1] === this.selectionStart[1]) {
                const startPlusLength = this.selectionStart[0] + this.selectionStartLength;
                if (startPlusLength > this._bufferService.cols) {
                    return [startPlusLength % this._bufferService.cols, this.selectionStart[1] + Math.floor(startPlusLength / this._bufferService.cols)];
                }
                return [Math.max(startPlusLength, this.selectionEnd[0]), this.selectionEnd[1]];
            }
        }
        return this.selectionEnd;
    }
    areSelectionValuesReversed() {
        const start = this.selectionStart;
        const end = this.selectionEnd;
        if (!start || !end) {
            return false;
        }
        return start[1] > end[1] || (start[1] === end[1] && start[0] > end[0]);
    }
    handleTrim(amount) {
        if (this.selectionStart) {
            this.selectionStart[1] -= amount;
        }
        if (this.selectionEnd) {
            this.selectionEnd[1] -= amount;
        }
        if (this.selectionEnd && this.selectionEnd[1] < 0) {
            this.clearSelection();
            return true;
        }
        if (this.selectionStart && this.selectionStart[1] < 0) {
            this.selectionStart[1] = 0;
        }
        return false;
    }
}
exports.SelectionModel = SelectionModel;
//# sourceMappingURL=SelectionModel.js.map