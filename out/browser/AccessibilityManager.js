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
exports.AccessibilityManager = void 0;
const Strings = require("browser/LocalizableStrings");
const TimeBasedDebouncer_1 = require("browser/TimeBasedDebouncer");
const Lifecycle_1 = require("common/Lifecycle");
const Services_1 = require("browser/services/Services");
const Services_2 = require("common/services/Services");
const Lifecycle_2 = require("browser/Lifecycle");
const MAX_ROWS_TO_READ = 20;
const DEBUG = false;
let AccessibilityManager = exports.AccessibilityManager = class AccessibilityManager extends Lifecycle_1.Disposable {
    constructor(_terminal, instantiationService, _coreBrowserService, _renderService) {
        super();
        this._terminal = _terminal;
        this._coreBrowserService = _coreBrowserService;
        this._renderService = _renderService;
        this._rowColumns = new WeakMap();
        this._liveRegionLineCount = 0;
        this._charsToConsume = [];
        this._charsToAnnounce = '';
        this._accessibilityContainer = this._coreBrowserService.mainDocument.createElement('div');
        this._accessibilityContainer.classList.add('xterm-accessibility');
        this._rowContainer = this._coreBrowserService.mainDocument.createElement('div');
        this._rowContainer.setAttribute('role', 'list');
        this._rowContainer.classList.add('xterm-accessibility-tree');
        this._rowElements = [];
        for (let i = 0; i < this._terminal.rows; i++) {
            this._rowElements[i] = this._createAccessibilityTreeNode();
            this._rowContainer.appendChild(this._rowElements[i]);
        }
        this._topBoundaryFocusListener = e => this._handleBoundaryFocus(e, 0);
        this._bottomBoundaryFocusListener = e => this._handleBoundaryFocus(e, 1);
        this._rowElements[0].addEventListener('focus', this._topBoundaryFocusListener);
        this._rowElements[this._rowElements.length - 1].addEventListener('focus', this._bottomBoundaryFocusListener);
        this._refreshRowsDimensions();
        this._accessibilityContainer.appendChild(this._rowContainer);
        this._liveRegion = this._coreBrowserService.mainDocument.createElement('div');
        this._liveRegion.classList.add('live-region');
        this._liveRegion.setAttribute('aria-live', 'assertive');
        this._accessibilityContainer.appendChild(this._liveRegion);
        this._liveRegionDebouncer = this.register(new TimeBasedDebouncer_1.TimeBasedDebouncer(this._renderRows.bind(this)));
        if (!this._terminal.element) {
            throw new Error('Cannot enable accessibility before Terminal.open');
        }
        if (DEBUG) {
            this._accessibilityContainer.classList.add('debug');
            this._rowContainer.classList.add('debug');
            this._debugRootContainer = document.createElement('div');
            this._debugRootContainer.classList.add('xterm');
            this._debugRootContainer.appendChild(document.createTextNode('------start a11y------'));
            this._debugRootContainer.appendChild(this._accessibilityContainer);
            this._debugRootContainer.appendChild(document.createTextNode('------end a11y------'));
            this._terminal.element.insertAdjacentElement('afterend', this._debugRootContainer);
        }
        else {
            this._terminal.element.insertAdjacentElement('afterbegin', this._accessibilityContainer);
        }
        this.register(this._terminal.onResize(e => this._handleResize(e.rows)));
        this.register(this._terminal.onRender(e => this._refreshRows(e.start, e.end)));
        this.register(this._terminal.onScroll(() => this._refreshRows()));
        this.register(this._terminal.onA11yChar(char => this._handleChar(char)));
        this.register(this._terminal.onLineFeed(() => this._handleChar('\n')));
        this.register(this._terminal.onA11yTab(spaceCount => this._handleTab(spaceCount)));
        this.register(this._terminal.onKey(e => this._handleKey(e.key)));
        this.register(this._terminal.onBlur(() => this._clearLiveRegion()));
        this.register(this._renderService.onDimensionsChange(() => this._refreshRowsDimensions()));
        this.register((0, Lifecycle_2.addDisposableDomListener)(document, 'selectionchange', () => this._handleSelectionChange()));
        this.register(this._coreBrowserService.onDprChange(() => this._refreshRowsDimensions()));
        this._refreshRows();
        this.register((0, Lifecycle_1.toDisposable)(() => {
            if (DEBUG) {
                this._debugRootContainer.remove();
            }
            else {
                this._accessibilityContainer.remove();
            }
            this._rowElements.length = 0;
        }));
    }
    _handleTab(spaceCount) {
        for (let i = 0; i < spaceCount; i++) {
            this._handleChar(' ');
        }
    }
    _handleChar(char) {
        if (this._liveRegionLineCount < MAX_ROWS_TO_READ + 1) {
            if (this._charsToConsume.length > 0) {
                const shiftedChar = this._charsToConsume.shift();
                if (shiftedChar !== char) {
                    this._charsToAnnounce += char;
                }
            }
            else {
                this._charsToAnnounce += char;
            }
            if (char === '\n') {
                this._liveRegionLineCount++;
                if (this._liveRegionLineCount === MAX_ROWS_TO_READ + 1) {
                    this._liveRegion.textContent += Strings.tooMuchOutput;
                }
            }
        }
    }
    _clearLiveRegion() {
        this._liveRegion.textContent = '';
        this._liveRegionLineCount = 0;
    }
    _handleKey(keyChar) {
        this._clearLiveRegion();
        if (!/\p{Control}/u.test(keyChar)) {
            this._charsToConsume.push(keyChar);
        }
    }
    _refreshRows(start, end) {
        this._liveRegionDebouncer.refresh(start, end, this._terminal.rows);
    }
    _renderRows(start, end) {
        const buffer = this._terminal.buffer;
        const setSize = buffer.lines.length.toString();
        for (let i = start; i <= end; i++) {
            const line = buffer.lines.get(buffer.ydisp + i);
            const columns = [];
            const lineData = line?.translateToString(true, undefined, undefined, columns) || '';
            const posInSet = (buffer.ydisp + i + 1).toString();
            const element = this._rowElements[i];
            if (element) {
                if (lineData.length === 0) {
                    element.innerText = '\u00a0';
                    this._rowColumns.set(element, [0, 1]);
                }
                else {
                    element.textContent = lineData;
                    this._rowColumns.set(element, columns);
                }
                element.setAttribute('aria-posinset', posInSet);
                element.setAttribute('aria-setsize', setSize);
            }
        }
        this._announceCharacters();
    }
    _announceCharacters() {
        if (this._charsToAnnounce.length === 0) {
            return;
        }
        this._liveRegion.textContent += this._charsToAnnounce;
        this._charsToAnnounce = '';
    }
    _handleBoundaryFocus(e, position) {
        const boundaryElement = e.target;
        const beforeBoundaryElement = this._rowElements[position === 0 ? 1 : this._rowElements.length - 2];
        const posInSet = boundaryElement.getAttribute('aria-posinset');
        const lastRowPos = position === 0 ? '1' : `${this._terminal.buffer.lines.length}`;
        if (posInSet === lastRowPos) {
            return;
        }
        if (e.relatedTarget !== beforeBoundaryElement) {
            return;
        }
        let topBoundaryElement;
        let bottomBoundaryElement;
        if (position === 0) {
            topBoundaryElement = boundaryElement;
            bottomBoundaryElement = this._rowElements.pop();
            this._rowContainer.removeChild(bottomBoundaryElement);
        }
        else {
            topBoundaryElement = this._rowElements.shift();
            bottomBoundaryElement = boundaryElement;
            this._rowContainer.removeChild(topBoundaryElement);
        }
        topBoundaryElement.removeEventListener('focus', this._topBoundaryFocusListener);
        bottomBoundaryElement.removeEventListener('focus', this._bottomBoundaryFocusListener);
        if (position === 0) {
            const newElement = this._createAccessibilityTreeNode();
            this._rowElements.unshift(newElement);
            this._rowContainer.insertAdjacentElement('afterbegin', newElement);
        }
        else {
            const newElement = this._createAccessibilityTreeNode();
            this._rowElements.push(newElement);
            this._rowContainer.appendChild(newElement);
        }
        this._rowElements[0].addEventListener('focus', this._topBoundaryFocusListener);
        this._rowElements[this._rowElements.length - 1].addEventListener('focus', this._bottomBoundaryFocusListener);
        this._terminal.scrollLines(position === 0 ? -1 : 1);
        this._rowElements[position === 0 ? 1 : this._rowElements.length - 2].focus();
        e.preventDefault();
        e.stopImmediatePropagation();
    }
    _handleSelectionChange() {
        if (this._rowElements.length === 0) {
            return;
        }
        const selection = document.getSelection();
        if (!selection) {
            return;
        }
        if (selection.isCollapsed) {
            if (this._rowContainer.contains(selection.anchorNode)) {
                this._terminal.clearSelection();
            }
            return;
        }
        if (!selection.anchorNode || !selection.focusNode) {
            console.error('anchorNode and/or focusNode are null');
            return;
        }
        let begin = { node: selection.anchorNode, offset: selection.anchorOffset };
        let end = { node: selection.focusNode, offset: selection.focusOffset };
        if ((begin.node.compareDocumentPosition(end.node) & Node.DOCUMENT_POSITION_PRECEDING) || (begin.node === end.node && begin.offset > end.offset)) {
            [begin, end] = [end, begin];
        }
        if (begin.node.compareDocumentPosition(this._rowElements[0]) & (Node.DOCUMENT_POSITION_CONTAINED_BY | Node.DOCUMENT_POSITION_FOLLOWING)) {
            begin = { node: this._rowElements[0].childNodes[0], offset: 0 };
        }
        if (!this._rowContainer.contains(begin.node)) {
            return;
        }
        const lastRowElement = this._rowElements.slice(-1)[0];
        if (end.node.compareDocumentPosition(lastRowElement) & (Node.DOCUMENT_POSITION_CONTAINED_BY | Node.DOCUMENT_POSITION_PRECEDING)) {
            end = {
                node: lastRowElement,
                offset: lastRowElement.textContent?.length ?? 0
            };
        }
        if (!this._rowContainer.contains(end.node)) {
            return;
        }
        const toRowColumn = ({ node, offset }) => {
            const rowElement = node instanceof Text ? node.parentNode : node;
            let row = parseInt(rowElement?.getAttribute('aria-posinset'), 10) - 1;
            if (isNaN(row)) {
                console.warn('row is invalid. Race condition?');
                return null;
            }
            const columns = this._rowColumns.get(rowElement);
            if (!columns) {
                console.warn('columns is null. Race condition?');
                return null;
            }
            let column = offset < columns.length ? columns[offset] : columns.slice(-1)[0] + 1;
            if (column >= this._terminal.cols) {
                ++row;
                column = 0;
            }
            return {
                row,
                column
            };
        };
        const beginRowColumn = toRowColumn(begin);
        const endRowColumn = toRowColumn(end);
        if (!beginRowColumn || !endRowColumn) {
            return;
        }
        if (beginRowColumn.row > endRowColumn.row || (beginRowColumn.row === endRowColumn.row && beginRowColumn.column >= endRowColumn.column)) {
            throw new Error('invalid range');
        }
        this._terminal.select(beginRowColumn.column, beginRowColumn.row, (endRowColumn.row - beginRowColumn.row) * this._terminal.cols - beginRowColumn.column + endRowColumn.column);
    }
    _handleResize(rows) {
        this._rowElements[this._rowElements.length - 1].removeEventListener('focus', this._bottomBoundaryFocusListener);
        for (let i = this._rowContainer.children.length; i < this._terminal.rows; i++) {
            this._rowElements[i] = this._createAccessibilityTreeNode();
            this._rowContainer.appendChild(this._rowElements[i]);
        }
        while (this._rowElements.length > rows) {
            this._rowContainer.removeChild(this._rowElements.pop());
        }
        this._rowElements[this._rowElements.length - 1].addEventListener('focus', this._bottomBoundaryFocusListener);
        this._refreshRowsDimensions();
    }
    _createAccessibilityTreeNode() {
        const element = this._coreBrowserService.mainDocument.createElement('div');
        element.setAttribute('role', 'listitem');
        element.tabIndex = -1;
        this._refreshRowDimensions(element);
        return element;
    }
    _refreshRowsDimensions() {
        if (!this._renderService.dimensions.css.cell.height) {
            return;
        }
        this._accessibilityContainer.style.width = `${this._renderService.dimensions.css.canvas.width}px`;
        if (this._rowElements.length !== this._terminal.rows) {
            this._handleResize(this._terminal.rows);
        }
        for (let i = 0; i < this._terminal.rows; i++) {
            this._refreshRowDimensions(this._rowElements[i]);
        }
    }
    _refreshRowDimensions(element) {
        element.style.height = `${this._renderService.dimensions.css.cell.height}px`;
    }
};
exports.AccessibilityManager = AccessibilityManager = __decorate([
    __param(1, Services_2.IInstantiationService),
    __param(2, Services_1.ICoreBrowserService),
    __param(3, Services_1.IRenderService)
], AccessibilityManager);
//# sourceMappingURL=AccessibilityManager.js.map