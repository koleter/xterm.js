"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.SelectionService = void 0;
const Mouse_1 = require("browser/input/Mouse");
const MoveToCell_1 = require("browser/input/MoveToCell");
const SelectionModel_1 = require("browser/selection/SelectionModel");
const Services_1 = require("browser/services/Services");
const EventEmitter_1 = require("common/EventEmitter");
const Lifecycle_1 = require("common/Lifecycle");
const Browser = require("common/Platform");
const BufferRange_1 = require("common/buffer/BufferRange");
const CellData_1 = require("common/buffer/CellData");
const Services_2 = require("common/services/Services");
const DRAG_SCROLL_MAX_THRESHOLD = 50;
const DRAG_SCROLL_MAX_SPEED = 15;
const DRAG_SCROLL_INTERVAL = 50;
const ALT_CLICK_MOVE_CURSOR_TIME = 500;
const NON_BREAKING_SPACE_CHAR = String.fromCharCode(160);
const ALL_NON_BREAKING_SPACE_REGEX = new RegExp(NON_BREAKING_SPACE_CHAR, 'g');
let SelectionService = exports.SelectionService = class SelectionService extends Lifecycle_1.Disposable {
    constructor(_element, _screenElement, _linkifier, _bufferService, _coreService, _mouseService, _optionsService, _renderService, _coreBrowserService) {
        super();
        this._element = _element;
        this._screenElement = _screenElement;
        this._linkifier = _linkifier;
        this._bufferService = _bufferService;
        this._coreService = _coreService;
        this._mouseService = _mouseService;
        this._optionsService = _optionsService;
        this._renderService = _renderService;
        this._coreBrowserService = _coreBrowserService;
        this._dragScrollAmount = 0;
        this._enabled = true;
        this._workCell = new CellData_1.CellData();
        this._mouseDownTimeStamp = 0;
        this._oldHasSelection = false;
        this._oldSelectionStart = undefined;
        this._oldSelectionEnd = undefined;
        this._onLinuxMouseSelection = this.register(new EventEmitter_1.EventEmitter());
        this.onLinuxMouseSelection = this._onLinuxMouseSelection.event;
        this._onRedrawRequest = this.register(new EventEmitter_1.EventEmitter());
        this.onRequestRedraw = this._onRedrawRequest.event;
        this._onSelectionChange = this.register(new EventEmitter_1.EventEmitter());
        this.onSelectionChange = this._onSelectionChange.event;
        this._onRequestScrollLines = this.register(new EventEmitter_1.EventEmitter());
        this.onRequestScrollLines = this._onRequestScrollLines.event;
        this._mouseMoveListener = event => this._handleMouseMove(event);
        this._mouseUpListener = event => this._handleMouseUp(event);
        this._coreService.onUserInput(() => {
            if (this.hasSelection) {
                this.clearSelection();
            }
        });
        this._trimListener = this._bufferService.buffer.lines.onTrim(amount => this._handleTrim(amount));
        this.register(this._bufferService.buffers.onBufferActivate(e => this._handleBufferActivate(e)));
        this.enable();
        this._model = new SelectionModel_1.SelectionModel(this._bufferService);
        this._activeSelectionMode = 0;
        this.register((0, Lifecycle_1.toDisposable)(() => {
            this._removeMouseDownListeners();
        }));
    }
    reset() {
        this.clearSelection();
    }
    disable() {
        this.clearSelection();
        this._enabled = false;
    }
    enable() {
        this._enabled = true;
    }
    get selectionStart() { return this._model.finalSelectionStart; }
    get selectionEnd() { return this._model.finalSelectionEnd; }
    get hasSelection() {
        const start = this._model.finalSelectionStart;
        const end = this._model.finalSelectionEnd;
        if (!start || !end) {
            return false;
        }
        return start[0] !== end[0] || start[1] !== end[1];
    }
    get selectionText() {
        const start = this._model.finalSelectionStart;
        const end = this._model.finalSelectionEnd;
        if (!start || !end) {
            return '';
        }
        const buffer = this._bufferService.buffer;
        const result = [];
        if (this._activeSelectionMode === 3) {
            if (start[0] === end[0]) {
                return '';
            }
            const startCol = start[0] < end[0] ? start[0] : end[0];
            const endCol = start[0] < end[0] ? end[0] : start[0];
            for (let i = start[1]; i <= end[1]; i++) {
                const lineText = buffer.translateBufferLineToString(i, true, startCol, endCol);
                result.push(lineText);
            }
        }
        else {
            const startRowEndCol = start[1] === end[1] ? end[0] : undefined;
            result.push(buffer.translateBufferLineToString(start[1], true, start[0], startRowEndCol));
            for (let i = start[1] + 1; i <= end[1] - 1; i++) {
                const bufferLine = buffer.lines.get(i);
                const lineText = buffer.translateBufferLineToString(i, true);
                if (bufferLine?.isWrapped) {
                    result[result.length - 1] += lineText;
                }
                else {
                    result.push(lineText);
                }
            }
            if (start[1] !== end[1]) {
                const bufferLine = buffer.lines.get(end[1]);
                const lineText = buffer.translateBufferLineToString(end[1], true, 0, end[0]);
                if (bufferLine && bufferLine.isWrapped) {
                    result[result.length - 1] += lineText;
                }
                else {
                    result.push(lineText);
                }
            }
        }
        const formattedResult = result.map(line => {
            return line.replace(ALL_NON_BREAKING_SPACE_REGEX, ' ');
        }).join(Browser.isWindows ? '\r\n' : '\n');
        return formattedResult;
    }
    clearSelection() {
        this._model.clearSelection();
        this._removeMouseDownListeners();
        this.refresh();
        this._onSelectionChange.fire();
    }
    refresh(isLinuxMouseSelection) {
        if (!this._refreshAnimationFrame) {
            this._refreshAnimationFrame = this._coreBrowserService.window.requestAnimationFrame(() => this._refresh());
        }
        if (Browser.isLinux && isLinuxMouseSelection) {
            const selectionText = this.selectionText;
            if (selectionText.length) {
                this._onLinuxMouseSelection.fire(this.selectionText);
            }
        }
    }
    _refresh() {
        this._refreshAnimationFrame = undefined;
        this._onRedrawRequest.fire({
            start: this._model.finalSelectionStart,
            end: this._model.finalSelectionEnd,
            columnSelectMode: this._activeSelectionMode === 3
        });
    }
    _isClickInSelection(event) {
        const coords = this._getMouseBufferCoords(event);
        const start = this._model.finalSelectionStart;
        const end = this._model.finalSelectionEnd;
        if (!start || !end || !coords) {
            return false;
        }
        return this._areCoordsInSelection(coords, start, end);
    }
    isCellInSelection(x, y) {
        const start = this._model.finalSelectionStart;
        const end = this._model.finalSelectionEnd;
        if (!start || !end) {
            return false;
        }
        return this._areCoordsInSelection([x, y], start, end);
    }
    _areCoordsInSelection(coords, start, end) {
        return (coords[1] > start[1] && coords[1] < end[1]) ||
            (start[1] === end[1] && coords[1] === start[1] && coords[0] >= start[0] && coords[0] < end[0]) ||
            (start[1] < end[1] && coords[1] === end[1] && coords[0] < end[0]) ||
            (start[1] < end[1] && coords[1] === start[1] && coords[0] >= start[0]);
    }
    _selectWordAtCursor(event, allowWhitespaceOnlySelection) {
        const range = this._linkifier.currentLink?.link?.range;
        if (range) {
            this._model.selectionStart = [range.start.x - 1, range.start.y - 1];
            this._model.selectionStartLength = (0, BufferRange_1.getRangeLength)(range, this._bufferService.cols);
            this._model.selectionEnd = undefined;
            return true;
        }
        const coords = this._getMouseBufferCoords(event);
        if (coords) {
            this._selectWordAt(coords, allowWhitespaceOnlySelection);
            this._model.selectionEnd = undefined;
            return true;
        }
        return false;
    }
    selectAll() {
        this._model.isSelectAllActive = true;
        this.refresh();
        this._onSelectionChange.fire();
    }
    selectLines(start, end) {
        this._model.clearSelection();
        start = Math.max(start, 0);
        end = Math.min(end, this._bufferService.buffer.lines.length - 1);
        this._model.selectionStart = [0, start];
        this._model.selectionEnd = [this._bufferService.cols, end];
        this.refresh();
        this._onSelectionChange.fire();
    }
    _handleTrim(amount) {
        const needsRefresh = this._model.handleTrim(amount);
        if (needsRefresh) {
            this.refresh();
        }
    }
    _getMouseBufferCoords(event) {
        const coords = this._mouseService.getCoords(event, this._screenElement, this._bufferService.cols, this._bufferService.rows, true);
        if (!coords) {
            return undefined;
        }
        coords[0]--;
        coords[1]--;
        coords[1] += this._bufferService.buffer.ydisp;
        return coords;
    }
    _getMouseEventScrollAmount(event) {
        let offset = (0, Mouse_1.getCoordsRelativeToElement)(this._coreBrowserService.window, event, this._screenElement)[1];
        const terminalHeight = this._renderService.dimensions.css.canvas.height;
        if (offset >= 0 && offset <= terminalHeight) {
            return 0;
        }
        if (offset > terminalHeight) {
            offset -= terminalHeight;
        }
        offset = Math.min(Math.max(offset, -DRAG_SCROLL_MAX_THRESHOLD), DRAG_SCROLL_MAX_THRESHOLD);
        offset /= DRAG_SCROLL_MAX_THRESHOLD;
        return (offset / Math.abs(offset)) + Math.round(offset * (DRAG_SCROLL_MAX_SPEED - 1));
    }
    shouldForceSelection(event) {
        if (Browser.isMac) {
            return event.altKey && this._optionsService.rawOptions.macOptionClickForcesSelection;
        }
        return event.shiftKey;
    }
    handleMouseDown(event) {
        this._mouseDownTimeStamp = event.timeStamp;
        if (event.button === 2 && this.hasSelection) {
            return;
        }
        if (event.button !== 0) {
            return;
        }
        if (!this._enabled) {
            if (!this.shouldForceSelection(event)) {
                return;
            }
            event.stopPropagation();
        }
        event.preventDefault();
        this._dragScrollAmount = 0;
        if (this._enabled && event.shiftKey) {
            this._handleIncrementalClick(event);
        }
        else {
            if (event.detail === 1) {
                this._handleSingleClick(event);
            }
            else if (event.detail === 2) {
                this._handleDoubleClick(event);
            }
            else if (event.detail === 3) {
                this._handleTripleClick(event);
            }
        }
        this._addMouseDownListeners();
        this.refresh(true);
    }
    _addMouseDownListeners() {
        if (this._screenElement.ownerDocument) {
            this._screenElement.ownerDocument.addEventListener('mousemove', this._mouseMoveListener);
            this._screenElement.ownerDocument.addEventListener('mouseup', this._mouseUpListener);
        }
        this._dragScrollIntervalTimer = this._coreBrowserService.window.setInterval(() => this._dragScroll(), DRAG_SCROLL_INTERVAL);
    }
    _removeMouseDownListeners() {
        if (this._screenElement.ownerDocument) {
            this._screenElement.ownerDocument.removeEventListener('mousemove', this._mouseMoveListener);
            this._screenElement.ownerDocument.removeEventListener('mouseup', this._mouseUpListener);
        }
        this._coreBrowserService.window.clearInterval(this._dragScrollIntervalTimer);
        this._dragScrollIntervalTimer = undefined;
    }
    _handleIncrementalClick(event) {
        if (this._model.selectionStart) {
            this._model.selectionEnd = this._getMouseBufferCoords(event);
        }
    }
    _handleSingleClick(event) {
        this._model.selectionStartLength = 0;
        this._model.isSelectAllActive = false;
        this._activeSelectionMode = this.shouldColumnSelect(event) ? 3 : 0;
        this._model.selectionStart = this._getMouseBufferCoords(event);
        if (!this._model.selectionStart) {
            return;
        }
        this._model.selectionEnd = undefined;
        const line = this._bufferService.buffer.lines.get(this._model.selectionStart[1]);
        if (!line) {
            return;
        }
        if (line.length === this._model.selectionStart[0]) {
            return;
        }
        if (line.hasWidth(this._model.selectionStart[0]) === 0) {
            this._model.selectionStart[0]++;
        }
    }
    _handleDoubleClick(event) {
        if (this._selectWordAtCursor(event, true)) {
            this._activeSelectionMode = 1;
        }
    }
    _handleTripleClick(event) {
        const coords = this._getMouseBufferCoords(event);
        if (coords) {
            this._activeSelectionMode = 2;
            this._selectLineAt(coords[1]);
        }
    }
    shouldColumnSelect(event) {
        return event.altKey && !(Browser.isMac && this._optionsService.rawOptions.macOptionClickForcesSelection);
    }
    _handleMouseMove(event) {
        event.stopImmediatePropagation();
        if (!this._model.selectionStart) {
            return;
        }
        const previousSelectionEnd = this._model.selectionEnd ? [this._model.selectionEnd[0], this._model.selectionEnd[1]] : null;
        this._model.selectionEnd = this._getMouseBufferCoords(event);
        if (!this._model.selectionEnd) {
            this.refresh(true);
            return;
        }
        if (this._activeSelectionMode === 2) {
            if (this._model.selectionEnd[1] < this._model.selectionStart[1]) {
                this._model.selectionEnd[0] = 0;
            }
            else {
                this._model.selectionEnd[0] = this._bufferService.cols;
            }
        }
        else if (this._activeSelectionMode === 1) {
            this._selectToWordAt(this._model.selectionEnd);
        }
        this._dragScrollAmount = this._getMouseEventScrollAmount(event);
        if (this._activeSelectionMode !== 3) {
            if (this._dragScrollAmount > 0) {
                this._model.selectionEnd[0] = this._bufferService.cols;
            }
            else if (this._dragScrollAmount < 0) {
                this._model.selectionEnd[0] = 0;
            }
        }
        const buffer = this._bufferService.buffer;
        if (this._model.selectionEnd[1] < buffer.lines.length) {
            const line = buffer.lines.get(this._model.selectionEnd[1]);
            if (line && line.hasWidth(this._model.selectionEnd[0]) === 0) {
                if (this._model.selectionEnd[0] < this._bufferService.cols) {
                    this._model.selectionEnd[0]++;
                }
            }
        }
        if (!previousSelectionEnd ||
            previousSelectionEnd[0] !== this._model.selectionEnd[0] ||
            previousSelectionEnd[1] !== this._model.selectionEnd[1]) {
            this.refresh(true);
        }
    }
    _dragScroll() {
        if (!this._model.selectionEnd || !this._model.selectionStart) {
            return;
        }
        if (this._dragScrollAmount) {
            this._onRequestScrollLines.fire({ amount: this._dragScrollAmount, suppressScrollEvent: false });
            const buffer = this._bufferService.buffer;
            if (this._dragScrollAmount > 0) {
                if (this._activeSelectionMode !== 3) {
                    this._model.selectionEnd[0] = this._bufferService.cols;
                }
                this._model.selectionEnd[1] = Math.min(buffer.ydisp + this._bufferService.rows, buffer.lines.length - 1);
            }
            else {
                if (this._activeSelectionMode !== 3) {
                    this._model.selectionEnd[0] = 0;
                }
                this._model.selectionEnd[1] = buffer.ydisp;
            }
            this.refresh();
        }
    }
    _handleMouseUp(event) {
        const timeElapsed = event.timeStamp - this._mouseDownTimeStamp;
        this._removeMouseDownListeners();
        if (this.selectionText.length <= 1 && timeElapsed < ALT_CLICK_MOVE_CURSOR_TIME && event.altKey && this._optionsService.rawOptions.altClickMovesCursor) {
            if (this._bufferService.buffer.ybase === this._bufferService.buffer.ydisp) {
                const coordinates = this._mouseService.getCoords(event, this._element, this._bufferService.cols, this._bufferService.rows, false);
                if (coordinates && coordinates[0] !== undefined && coordinates[1] !== undefined) {
                    const sequence = (0, MoveToCell_1.moveToCellSequence)(coordinates[0] - 1, coordinates[1] - 1, this._bufferService, this._coreService.decPrivateModes.applicationCursorKeys);
                    this._coreService.triggerDataEvent(sequence, true);
                }
            }
        }
        else {
            this._fireEventIfSelectionChanged();
        }
    }
    _fireEventIfSelectionChanged() {
        const start = this._model.finalSelectionStart;
        const end = this._model.finalSelectionEnd;
        const hasSelection = !!start && !!end && (start[0] !== end[0] || start[1] !== end[1]);
        if (!hasSelection) {
            if (this._oldHasSelection) {
                this._fireOnSelectionChange(start, end, hasSelection);
            }
            return;
        }
        if (!start || !end) {
            return;
        }
        if (!this._oldSelectionStart || !this._oldSelectionEnd || (start[0] !== this._oldSelectionStart[0] || start[1] !== this._oldSelectionStart[1] ||
            end[0] !== this._oldSelectionEnd[0] || end[1] !== this._oldSelectionEnd[1])) {
            this._fireOnSelectionChange(start, end, hasSelection);
        }
    }
    _fireOnSelectionChange(start, end, hasSelection) {
        this._oldSelectionStart = start;
        this._oldSelectionEnd = end;
        this._oldHasSelection = hasSelection;
        this._onSelectionChange.fire();
    }
    _handleBufferActivate(e) {
        this.clearSelection();
        this._trimListener.dispose();
        this._trimListener = e.activeBuffer.lines.onTrim(amount => this._handleTrim(amount));
    }
    _convertViewportColToCharacterIndex(bufferLine, x) {
        let charIndex = x;
        for (let i = 0; x >= i; i++) {
            const length = bufferLine.loadCell(i, this._workCell).getChars().length;
            if (this._workCell.getWidth() === 0) {
                charIndex--;
            }
            else if (length > 1 && x !== i) {
                charIndex += length - 1;
            }
        }
        return charIndex;
    }
    setSelection(col, row, length) {
        this._model.clearSelection();
        this._removeMouseDownListeners();
        this._model.selectionStart = [col, row];
        this._model.selectionStartLength = length;
        this.refresh();
        this._fireEventIfSelectionChanged();
    }
    rightClickSelect(ev) {
        if (!this._isClickInSelection(ev)) {
            if (this._selectWordAtCursor(ev, false)) {
                this.refresh(true);
            }
            this._fireEventIfSelectionChanged();
        }
    }
    _getWordAt(coords, allowWhitespaceOnlySelection, followWrappedLinesAbove = true, followWrappedLinesBelow = true) {
        if (coords[0] >= this._bufferService.cols) {
            return undefined;
        }
        const buffer = this._bufferService.buffer;
        const bufferLine = buffer.lines.get(coords[1]);
        if (!bufferLine) {
            return undefined;
        }
        const line = buffer.translateBufferLineToString(coords[1], false);
        let startIndex = this._convertViewportColToCharacterIndex(bufferLine, coords[0]);
        let endIndex = startIndex;
        const charOffset = coords[0] - startIndex;
        let leftWideCharCount = 0;
        let rightWideCharCount = 0;
        let leftLongCharOffset = 0;
        let rightLongCharOffset = 0;
        if (line.charAt(startIndex) === ' ') {
            while (startIndex > 0 && line.charAt(startIndex - 1) === ' ') {
                startIndex--;
            }
            while (endIndex < line.length && line.charAt(endIndex + 1) === ' ') {
                endIndex++;
            }
        }
        else {
            let startCol = coords[0];
            let endCol = coords[0];
            if (bufferLine.getWidth(startCol) === 0) {
                leftWideCharCount++;
                startCol--;
            }
            if (bufferLine.getWidth(endCol) === 2) {
                rightWideCharCount++;
                endCol++;
            }
            const length = bufferLine.getString(endCol).length;
            if (length > 1) {
                rightLongCharOffset += length - 1;
                endIndex += length - 1;
            }
            while (startCol > 0 && startIndex > 0 && !this._isCharWordSeparator(bufferLine.loadCell(startCol - 1, this._workCell))) {
                bufferLine.loadCell(startCol - 1, this._workCell);
                const length = this._workCell.getChars().length;
                if (this._workCell.getWidth() === 0) {
                    leftWideCharCount++;
                    startCol--;
                }
                else if (length > 1) {
                    leftLongCharOffset += length - 1;
                    startIndex -= length - 1;
                }
                startIndex--;
                startCol--;
            }
            while (endCol < bufferLine.length && endIndex + 1 < line.length && !this._isCharWordSeparator(bufferLine.loadCell(endCol + 1, this._workCell))) {
                bufferLine.loadCell(endCol + 1, this._workCell);
                const length = this._workCell.getChars().length;
                if (this._workCell.getWidth() === 2) {
                    rightWideCharCount++;
                    endCol++;
                }
                else if (length > 1) {
                    rightLongCharOffset += length - 1;
                    endIndex += length - 1;
                }
                endIndex++;
                endCol++;
            }
        }
        endIndex++;
        let start = startIndex
            + charOffset
            - leftWideCharCount
            + leftLongCharOffset;
        let length = Math.min(this._bufferService.cols, endIndex
            - startIndex
            + leftWideCharCount
            + rightWideCharCount
            - leftLongCharOffset
            - rightLongCharOffset);
        if (!allowWhitespaceOnlySelection && line.slice(startIndex, endIndex).trim() === '') {
            return undefined;
        }
        if (followWrappedLinesAbove) {
            if (start === 0 && bufferLine.getCodePoint(0) !== 32) {
                const previousBufferLine = buffer.lines.get(coords[1] - 1);
                if (previousBufferLine && bufferLine.isWrapped && previousBufferLine.getCodePoint(this._bufferService.cols - 1) !== 32) {
                    const previousLineWordPosition = this._getWordAt([this._bufferService.cols - 1, coords[1] - 1], false, true, false);
                    if (previousLineWordPosition) {
                        const offset = this._bufferService.cols - previousLineWordPosition.start;
                        start -= offset;
                        length += offset;
                    }
                }
            }
        }
        if (followWrappedLinesBelow) {
            if (start + length === this._bufferService.cols && bufferLine.getCodePoint(this._bufferService.cols - 1) !== 32) {
                const nextBufferLine = buffer.lines.get(coords[1] + 1);
                if (nextBufferLine?.isWrapped && nextBufferLine.getCodePoint(0) !== 32) {
                    const nextLineWordPosition = this._getWordAt([0, coords[1] + 1], false, false, true);
                    if (nextLineWordPosition) {
                        length += nextLineWordPosition.length;
                    }
                }
            }
        }
        return { start, length };
    }
    _selectWordAt(coords, allowWhitespaceOnlySelection) {
        const wordPosition = this._getWordAt(coords, allowWhitespaceOnlySelection);
        if (wordPosition) {
            while (wordPosition.start < 0) {
                wordPosition.start += this._bufferService.cols;
                coords[1]--;
            }
            this._model.selectionStart = [wordPosition.start, coords[1]];
            this._model.selectionStartLength = wordPosition.length;
        }
    }
    _selectToWordAt(coords) {
        const wordPosition = this._getWordAt(coords, true);
        if (wordPosition) {
            let endRow = coords[1];
            while (wordPosition.start < 0) {
                wordPosition.start += this._bufferService.cols;
                endRow--;
            }
            if (!this._model.areSelectionValuesReversed()) {
                while (wordPosition.start + wordPosition.length > this._bufferService.cols) {
                    wordPosition.length -= this._bufferService.cols;
                    endRow++;
                }
            }
            this._model.selectionEnd = [this._model.areSelectionValuesReversed() ? wordPosition.start : wordPosition.start + wordPosition.length, endRow];
        }
    }
    _isCharWordSeparator(cell) {
        if (cell.getWidth() === 0) {
            return false;
        }
        return this._optionsService.rawOptions.wordSeparator.indexOf(cell.getChars()) >= 0;
    }
    _selectLineAt(line) {
        const wrappedRange = this._bufferService.buffer.getWrappedRangeForLine(line);
        const range = {
            start: { x: 0, y: wrappedRange.first },
            end: { x: this._bufferService.cols - 1, y: wrappedRange.last }
        };
        this._model.selectionStart = [0, wrappedRange.first];
        this._model.selectionEnd = undefined;
        this._model.selectionStartLength = (0, BufferRange_1.getRangeLength)(range, this._bufferService.cols);
    }
};
exports.SelectionService = SelectionService = __decorate([
    __param(3, Services_2.IBufferService),
    __param(4, Services_2.ICoreService),
    __param(5, Services_1.IMouseService),
    __param(6, Services_2.IOptionsService),
    __param(7, Services_1.IRenderService),
    __param(8, Services_1.ICoreBrowserService)
], SelectionService);
//# sourceMappingURL=SelectionService.js.map