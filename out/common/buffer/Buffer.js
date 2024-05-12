"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Buffer = exports.MAX_BUFFER_SIZE = void 0;
const CircularList_1 = require("common/CircularList");
const TaskQueue_1 = require("common/TaskQueue");
const AttributeData_1 = require("common/buffer/AttributeData");
const BufferLine_1 = require("common/buffer/BufferLine");
const BufferReflow_1 = require("common/buffer/BufferReflow");
const CellData_1 = require("common/buffer/CellData");
const Constants_1 = require("common/buffer/Constants");
const Marker_1 = require("common/buffer/Marker");
const Charsets_1 = require("common/data/Charsets");
exports.MAX_BUFFER_SIZE = 4294967295;
class Buffer {
    constructor(_hasScrollback, _optionsService, _bufferService) {
        this._hasScrollback = _hasScrollback;
        this._optionsService = _optionsService;
        this._bufferService = _bufferService;
        this.ydisp = 0;
        this.ybase = 0;
        this.y = 0;
        this.x = 0;
        this.tabs = {};
        this.savedY = 0;
        this.savedX = 0;
        this.savedCurAttrData = BufferLine_1.DEFAULT_ATTR_DATA.clone();
        this.savedCharset = Charsets_1.DEFAULT_CHARSET;
        this.markers = [];
        this._nullCell = CellData_1.CellData.fromCharData([0, Constants_1.NULL_CELL_CHAR, Constants_1.NULL_CELL_WIDTH, Constants_1.NULL_CELL_CODE]);
        this._whitespaceCell = CellData_1.CellData.fromCharData([0, Constants_1.WHITESPACE_CELL_CHAR, Constants_1.WHITESPACE_CELL_WIDTH, Constants_1.WHITESPACE_CELL_CODE]);
        this._isClearing = false;
        this._memoryCleanupQueue = new TaskQueue_1.IdleTaskQueue();
        this._memoryCleanupPosition = 0;
        this._cols = this._bufferService.cols;
        this._rows = this._bufferService.rows;
        this.lines = new CircularList_1.CircularList(this._getCorrectBufferLength(this._rows));
        this.scrollTop = 0;
        this.scrollBottom = this._rows - 1;
        this.setupTabStops();
    }
    getNullCell(attr) {
        if (attr) {
            this._nullCell.fg = attr.fg;
            this._nullCell.bg = attr.bg;
            this._nullCell.extended = attr.extended;
        }
        else {
            this._nullCell.fg = 0;
            this._nullCell.bg = 0;
            this._nullCell.extended = new AttributeData_1.ExtendedAttrs();
        }
        return this._nullCell;
    }
    getWhitespaceCell(attr) {
        if (attr) {
            this._whitespaceCell.fg = attr.fg;
            this._whitespaceCell.bg = attr.bg;
            this._whitespaceCell.extended = attr.extended;
        }
        else {
            this._whitespaceCell.fg = 0;
            this._whitespaceCell.bg = 0;
            this._whitespaceCell.extended = new AttributeData_1.ExtendedAttrs();
        }
        return this._whitespaceCell;
    }
    getBlankLine(attr, isWrapped) {
        return new BufferLine_1.BufferLine(this._bufferService.cols, this.getNullCell(attr), isWrapped);
    }
    get hasScrollback() {
        return this._hasScrollback && this.lines.maxLength > this._rows;
    }
    get isCursorInViewport() {
        const absoluteY = this.ybase + this.y;
        const relativeY = absoluteY - this.ydisp;
        return (relativeY >= 0 && relativeY < this._rows);
    }
    _getCorrectBufferLength(rows) {
        if (!this._hasScrollback) {
            return rows;
        }
        const correctBufferLength = rows + this._optionsService.rawOptions.scrollback;
        return correctBufferLength > exports.MAX_BUFFER_SIZE ? exports.MAX_BUFFER_SIZE : correctBufferLength;
    }
    fillViewportRows(fillAttr) {
        if (this.lines.length === 0) {
            if (fillAttr === undefined) {
                fillAttr = BufferLine_1.DEFAULT_ATTR_DATA;
            }
            let i = this._rows;
            while (i--) {
                this.lines.push(this.getBlankLine(fillAttr));
            }
        }
    }
    clear() {
        this.ydisp = 0;
        this.ybase = 0;
        this.y = 0;
        this.x = 0;
        this.lines = new CircularList_1.CircularList(this._getCorrectBufferLength(this._rows));
        this.scrollTop = 0;
        this.scrollBottom = this._rows - 1;
        this.setupTabStops();
    }
    resize(newCols, newRows) {
        const nullCell = this.getNullCell(BufferLine_1.DEFAULT_ATTR_DATA);
        let dirtyMemoryLines = 0;
        const newMaxLength = this._getCorrectBufferLength(newRows);
        if (newMaxLength > this.lines.maxLength) {
            this.lines.maxLength = newMaxLength;
        }
        if (this.lines.length > 0) {
            if (this._cols < newCols) {
                for (let i = 0; i < this.lines.length; i++) {
                    dirtyMemoryLines += +this.lines.get(i).resize(newCols, nullCell);
                }
            }
            let addToY = 0;
            if (this._rows < newRows) {
                for (let y = this._rows; y < newRows; y++) {
                    if (this.lines.length < newRows + this.ybase) {
                        if (this._optionsService.rawOptions.windowsMode || this._optionsService.rawOptions.windowsPty.backend !== undefined || this._optionsService.rawOptions.windowsPty.buildNumber !== undefined) {
                            this.lines.push(new BufferLine_1.BufferLine(newCols, nullCell));
                        }
                        else {
                            if (this.ybase > 0 && this.lines.length <= this.ybase + this.y + addToY + 1) {
                                this.ybase--;
                                addToY++;
                                if (this.ydisp > 0) {
                                    this.ydisp--;
                                }
                            }
                            else {
                                this.lines.push(new BufferLine_1.BufferLine(newCols, nullCell));
                            }
                        }
                    }
                }
            }
            else {
                for (let y = this._rows; y > newRows; y--) {
                    if (this.lines.length > newRows + this.ybase) {
                        if (this.lines.length > this.ybase + this.y + 1) {
                            this.lines.pop();
                        }
                        else {
                            this.ybase++;
                            this.ydisp++;
                        }
                    }
                }
            }
            if (newMaxLength < this.lines.maxLength) {
                const amountToTrim = this.lines.length - newMaxLength;
                if (amountToTrim > 0) {
                    this.lines.trimStart(amountToTrim);
                    this.ybase = Math.max(this.ybase - amountToTrim, 0);
                    this.ydisp = Math.max(this.ydisp - amountToTrim, 0);
                    this.savedY = Math.max(this.savedY - amountToTrim, 0);
                }
                this.lines.maxLength = newMaxLength;
            }
            this.x = Math.min(this.x, newCols - 1);
            this.y = Math.min(this.y, newRows - 1);
            if (addToY) {
                this.y += addToY;
            }
            this.savedX = Math.min(this.savedX, newCols - 1);
            this.scrollTop = 0;
        }
        this.scrollBottom = newRows - 1;
        if (this._isReflowEnabled) {
            this._reflow(newCols, newRows);
            if (this._cols > newCols) {
                for (let i = 0; i < this.lines.length; i++) {
                    dirtyMemoryLines += +this.lines.get(i).resize(newCols, nullCell);
                }
            }
        }
        this._cols = newCols;
        this._rows = newRows;
        this._memoryCleanupQueue.clear();
        if (dirtyMemoryLines > 0.1 * this.lines.length) {
            this._memoryCleanupPosition = 0;
            this._memoryCleanupQueue.enqueue(() => this._batchedMemoryCleanup());
        }
    }
    _batchedMemoryCleanup() {
        let normalRun = true;
        if (this._memoryCleanupPosition >= this.lines.length) {
            this._memoryCleanupPosition = 0;
            normalRun = false;
        }
        let counted = 0;
        while (this._memoryCleanupPosition < this.lines.length) {
            counted += this.lines.get(this._memoryCleanupPosition++).cleanupMemory();
            if (counted > 100) {
                return true;
            }
        }
        return normalRun;
    }
    get _isReflowEnabled() {
        const windowsPty = this._optionsService.rawOptions.windowsPty;
        if (windowsPty && windowsPty.buildNumber) {
            return this._hasScrollback && windowsPty.backend === 'conpty' && windowsPty.buildNumber >= 21376;
        }
        return this._hasScrollback && !this._optionsService.rawOptions.windowsMode;
    }
    _reflow(newCols, newRows) {
        if (this._cols === newCols) {
            return;
        }
        if (newCols > this._cols) {
            this._reflowLarger(newCols, newRows);
        }
        else {
            this._reflowSmaller(newCols, newRows);
        }
    }
    _reflowLarger(newCols, newRows) {
        const toRemove = (0, BufferReflow_1.reflowLargerGetLinesToRemove)(this.lines, this._cols, newCols, this.ybase + this.y, this.getNullCell(BufferLine_1.DEFAULT_ATTR_DATA));
        if (toRemove.length > 0) {
            const newLayoutResult = (0, BufferReflow_1.reflowLargerCreateNewLayout)(this.lines, toRemove);
            (0, BufferReflow_1.reflowLargerApplyNewLayout)(this.lines, newLayoutResult.layout);
            this._reflowLargerAdjustViewport(newCols, newRows, newLayoutResult.countRemoved);
        }
    }
    _reflowLargerAdjustViewport(newCols, newRows, countRemoved) {
        const nullCell = this.getNullCell(BufferLine_1.DEFAULT_ATTR_DATA);
        let viewportAdjustments = countRemoved;
        while (viewportAdjustments-- > 0) {
            if (this.ybase === 0) {
                if (this.y > 0) {
                    this.y--;
                }
                if (this.lines.length < newRows) {
                    this.lines.push(new BufferLine_1.BufferLine(newCols, nullCell));
                }
            }
            else {
                if (this.ydisp === this.ybase) {
                    this.ydisp--;
                }
                this.ybase--;
            }
        }
        this.savedY = Math.max(this.savedY - countRemoved, 0);
    }
    _reflowSmaller(newCols, newRows) {
        const nullCell = this.getNullCell(BufferLine_1.DEFAULT_ATTR_DATA);
        const toInsert = [];
        let countToInsert = 0;
        for (let y = this.lines.length - 1; y >= 0; y--) {
            let nextLine = this.lines.get(y);
            if (!nextLine || !nextLine.isWrapped && nextLine.getTrimmedLength() <= newCols) {
                continue;
            }
            const wrappedLines = [nextLine];
            while (nextLine.isWrapped && y > 0) {
                nextLine = this.lines.get(--y);
                wrappedLines.unshift(nextLine);
            }
            const absoluteY = this.ybase + this.y;
            if (absoluteY >= y && absoluteY < y + wrappedLines.length) {
                continue;
            }
            const lastLineLength = wrappedLines[wrappedLines.length - 1].getTrimmedLength();
            const destLineLengths = (0, BufferReflow_1.reflowSmallerGetNewLineLengths)(wrappedLines, this._cols, newCols);
            const linesToAdd = destLineLengths.length - wrappedLines.length;
            let trimmedLines;
            if (this.ybase === 0 && this.y !== this.lines.length - 1) {
                trimmedLines = Math.max(0, this.y - this.lines.maxLength + linesToAdd);
            }
            else {
                trimmedLines = Math.max(0, this.lines.length - this.lines.maxLength + linesToAdd);
            }
            const newLines = [];
            for (let i = 0; i < linesToAdd; i++) {
                const newLine = this.getBlankLine(BufferLine_1.DEFAULT_ATTR_DATA, true);
                newLines.push(newLine);
            }
            if (newLines.length > 0) {
                toInsert.push({
                    start: y + wrappedLines.length + countToInsert,
                    newLines
                });
                countToInsert += newLines.length;
            }
            wrappedLines.push(...newLines);
            let destLineIndex = destLineLengths.length - 1;
            let destCol = destLineLengths[destLineIndex];
            if (destCol === 0) {
                destLineIndex--;
                destCol = destLineLengths[destLineIndex];
            }
            let srcLineIndex = wrappedLines.length - linesToAdd - 1;
            let srcCol = lastLineLength;
            while (srcLineIndex >= 0) {
                const cellsToCopy = Math.min(srcCol, destCol);
                if (wrappedLines[destLineIndex] === undefined) {
                    break;
                }
                wrappedLines[destLineIndex].copyCellsFrom(wrappedLines[srcLineIndex], srcCol - cellsToCopy, destCol - cellsToCopy, cellsToCopy, true);
                destCol -= cellsToCopy;
                if (destCol === 0) {
                    destLineIndex--;
                    destCol = destLineLengths[destLineIndex];
                }
                srcCol -= cellsToCopy;
                if (srcCol === 0) {
                    srcLineIndex--;
                    const wrappedLinesIndex = Math.max(srcLineIndex, 0);
                    srcCol = (0, BufferReflow_1.getWrappedLineTrimmedLength)(wrappedLines, wrappedLinesIndex, this._cols);
                }
            }
            for (let i = 0; i < wrappedLines.length; i++) {
                if (destLineLengths[i] < newCols) {
                    wrappedLines[i].setCell(destLineLengths[i], nullCell);
                }
            }
            let viewportAdjustments = linesToAdd - trimmedLines;
            while (viewportAdjustments-- > 0) {
                if (this.ybase === 0) {
                    if (this.y < newRows - 1) {
                        this.y++;
                        this.lines.pop();
                    }
                    else {
                        this.ybase++;
                        this.ydisp++;
                    }
                }
                else {
                    if (this.ybase < Math.min(this.lines.maxLength, this.lines.length + countToInsert) - newRows) {
                        if (this.ybase === this.ydisp) {
                            this.ydisp++;
                        }
                        this.ybase++;
                    }
                }
            }
            this.savedY = Math.min(this.savedY + linesToAdd, this.ybase + newRows - 1);
        }
        if (toInsert.length > 0) {
            const insertEvents = [];
            const originalLines = [];
            for (let i = 0; i < this.lines.length; i++) {
                originalLines.push(this.lines.get(i));
            }
            const originalLinesLength = this.lines.length;
            let originalLineIndex = originalLinesLength - 1;
            let nextToInsertIndex = 0;
            let nextToInsert = toInsert[nextToInsertIndex];
            this.lines.length = Math.min(this.lines.maxLength, this.lines.length + countToInsert);
            let countInsertedSoFar = 0;
            for (let i = Math.min(this.lines.maxLength - 1, originalLinesLength + countToInsert - 1); i >= 0; i--) {
                if (nextToInsert && nextToInsert.start > originalLineIndex + countInsertedSoFar) {
                    for (let nextI = nextToInsert.newLines.length - 1; nextI >= 0; nextI--) {
                        this.lines.set(i--, nextToInsert.newLines[nextI]);
                    }
                    i++;
                    insertEvents.push({
                        index: originalLineIndex + 1,
                        amount: nextToInsert.newLines.length
                    });
                    countInsertedSoFar += nextToInsert.newLines.length;
                    nextToInsert = toInsert[++nextToInsertIndex];
                }
                else {
                    this.lines.set(i, originalLines[originalLineIndex--]);
                }
            }
            let insertCountEmitted = 0;
            for (let i = insertEvents.length - 1; i >= 0; i--) {
                insertEvents[i].index += insertCountEmitted;
                this.lines.onInsertEmitter.fire(insertEvents[i]);
                insertCountEmitted += insertEvents[i].amount;
            }
            const amountToTrim = Math.max(0, originalLinesLength + countToInsert - this.lines.maxLength);
            if (amountToTrim > 0) {
                this.lines.onTrimEmitter.fire(amountToTrim);
            }
        }
    }
    translateBufferLineToString(lineIndex, trimRight, startCol = 0, endCol) {
        const line = this.lines.get(lineIndex);
        if (!line) {
            return '';
        }
        return line.translateToString(trimRight, startCol, endCol);
    }
    getWrappedRangeForLine(y) {
        let first = y;
        let last = y;
        while (first > 0 && this.lines.get(first).isWrapped) {
            first--;
        }
        while (last + 1 < this.lines.length && this.lines.get(last + 1).isWrapped) {
            last++;
        }
        return { first, last };
    }
    setupTabStops(i) {
        if (i !== null && i !== undefined) {
            if (!this.tabs[i]) {
                i = this.prevStop(i);
            }
        }
        else {
            this.tabs = {};
            i = 0;
        }
        for (; i < this._cols; i += this._optionsService.rawOptions.tabStopWidth) {
            this.tabs[i] = true;
        }
    }
    prevStop(x) {
        if (x === null || x === undefined) {
            x = this.x;
        }
        while (!this.tabs[--x] && x > 0)
            ;
        return x >= this._cols ? this._cols - 1 : x < 0 ? 0 : x;
    }
    nextStop(x) {
        if (x === null || x === undefined) {
            x = this.x;
        }
        while (!this.tabs[++x] && x < this._cols)
            ;
        return x >= this._cols ? this._cols - 1 : x < 0 ? 0 : x;
    }
    clearMarkers(y) {
        this._isClearing = true;
        for (let i = 0; i < this.markers.length; i++) {
            if (this.markers[i].line === y) {
                this.markers[i].dispose();
                this.markers.splice(i--, 1);
            }
        }
        this._isClearing = false;
    }
    clearAllMarkers() {
        this._isClearing = true;
        for (let i = 0; i < this.markers.length; i++) {
            this.markers[i].dispose();
            this.markers.splice(i--, 1);
        }
        this._isClearing = false;
    }
    addMarker(y) {
        const marker = new Marker_1.Marker(y);
        this.markers.push(marker);
        marker.register(this.lines.onTrim(amount => {
            marker.line -= amount;
            if (marker.line < 0) {
                marker.dispose();
            }
        }));
        marker.register(this.lines.onInsert(event => {
            if (marker.line >= event.index) {
                marker.line += event.amount;
            }
        }));
        marker.register(this.lines.onDelete(event => {
            if (marker.line >= event.index && marker.line < event.index + event.amount) {
                marker.dispose();
            }
            if (marker.line > event.index) {
                marker.line -= event.amount;
            }
        }));
        marker.register(marker.onDispose(() => this._removeMarker(marker)));
        return marker;
    }
    _removeMarker(marker) {
        if (!this._isClearing) {
            this.markers.splice(this.markers.indexOf(marker), 1);
        }
    }
}
exports.Buffer = Buffer;
//# sourceMappingURL=Buffer.js.map