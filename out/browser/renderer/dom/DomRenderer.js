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
exports.DomRenderer = void 0;
const DomRendererRowFactory_1 = require("browser/renderer/dom/DomRendererRowFactory");
const WidthCache_1 = require("browser/renderer/dom/WidthCache");
const Constants_1 = require("browser/renderer/shared/Constants");
const RendererUtils_1 = require("browser/renderer/shared/RendererUtils");
const SelectionRenderModel_1 = require("browser/renderer/shared/SelectionRenderModel");
const Services_1 = require("browser/services/Services");
const Color_1 = require("common/Color");
const EventEmitter_1 = require("common/EventEmitter");
const Lifecycle_1 = require("common/Lifecycle");
const Services_2 = require("common/services/Services");
const TERMINAL_CLASS_PREFIX = 'xterm-dom-renderer-owner-';
const ROW_CONTAINER_CLASS = 'xterm-rows';
const FG_CLASS_PREFIX = 'xterm-fg-';
const BG_CLASS_PREFIX = 'xterm-bg-';
const FOCUS_CLASS = 'xterm-focus';
const SELECTION_CLASS = 'xterm-selection';
let nextTerminalId = 1;
let DomRenderer = exports.DomRenderer = class DomRenderer extends Lifecycle_1.Disposable {
    constructor(_terminal, _document, _element, _screenElement, _viewportElement, _helperContainer, _linkifier2, instantiationService, _charSizeService, _optionsService, _bufferService, _coreBrowserService, _themeService) {
        super();
        this._terminal = _terminal;
        this._document = _document;
        this._element = _element;
        this._screenElement = _screenElement;
        this._viewportElement = _viewportElement;
        this._helperContainer = _helperContainer;
        this._linkifier2 = _linkifier2;
        this._charSizeService = _charSizeService;
        this._optionsService = _optionsService;
        this._bufferService = _bufferService;
        this._coreBrowserService = _coreBrowserService;
        this._themeService = _themeService;
        this._terminalClass = nextTerminalId++;
        this._rowElements = [];
        this._selectionRenderModel = (0, SelectionRenderModel_1.createSelectionRenderModel)();
        this.onRequestRedraw = this.register(new EventEmitter_1.EventEmitter()).event;
        this._rowContainer = this._document.createElement('div');
        this._rowContainer.classList.add(ROW_CONTAINER_CLASS);
        this._rowContainer.style.lineHeight = 'normal';
        this._rowContainer.setAttribute('aria-hidden', 'true');
        this._refreshRowElements(this._bufferService.cols, this._bufferService.rows);
        this._selectionContainer = this._document.createElement('div');
        this._selectionContainer.classList.add(SELECTION_CLASS);
        this._selectionContainer.setAttribute('aria-hidden', 'true');
        this.dimensions = (0, RendererUtils_1.createRenderDimensions)();
        this._updateDimensions();
        this.register(this._optionsService.onOptionChange(() => this._handleOptionsChanged()));
        this.register(this._themeService.onChangeColors(e => this._injectCss(e)));
        this._injectCss(this._themeService.colors);
        this._rowFactory = instantiationService.createInstance(DomRendererRowFactory_1.DomRendererRowFactory, document);
        this._element.classList.add(TERMINAL_CLASS_PREFIX + this._terminalClass);
        this._screenElement.appendChild(this._rowContainer);
        this._screenElement.appendChild(this._selectionContainer);
        this.register(this._linkifier2.onShowLinkUnderline(e => this._handleLinkHover(e)));
        this.register(this._linkifier2.onHideLinkUnderline(e => this._handleLinkLeave(e)));
        this.register((0, Lifecycle_1.toDisposable)(() => {
            this._element.classList.remove(TERMINAL_CLASS_PREFIX + this._terminalClass);
            this._rowContainer.remove();
            this._selectionContainer.remove();
            this._widthCache.dispose();
            this._themeStyleElement.remove();
            this._dimensionsStyleElement.remove();
        }));
        this._widthCache = new WidthCache_1.WidthCache(this._document, this._helperContainer);
        this._widthCache.setFont(this._optionsService.rawOptions.fontFamily, this._optionsService.rawOptions.fontSize, this._optionsService.rawOptions.fontWeight, this._optionsService.rawOptions.fontWeightBold);
        this._setDefaultSpacing();
    }
    _updateDimensions() {
        const dpr = this._coreBrowserService.dpr;
        this.dimensions.device.char.width = this._charSizeService.width * dpr;
        this.dimensions.device.char.height = Math.ceil(this._charSizeService.height * dpr);
        this.dimensions.device.cell.width = this.dimensions.device.char.width + Math.round(this._optionsService.rawOptions.letterSpacing);
        this.dimensions.device.cell.height = Math.floor(this.dimensions.device.char.height * this._optionsService.rawOptions.lineHeight);
        this.dimensions.device.char.left = 0;
        this.dimensions.device.char.top = 0;
        this.dimensions.device.canvas.width = this.dimensions.device.cell.width * this._bufferService.cols;
        this.dimensions.device.canvas.height = this.dimensions.device.cell.height * this._bufferService.rows;
        this.dimensions.css.canvas.width = Math.round(this.dimensions.device.canvas.width / dpr);
        this.dimensions.css.canvas.height = Math.round(this.dimensions.device.canvas.height / dpr);
        this.dimensions.css.cell.width = this.dimensions.css.canvas.width / this._bufferService.cols;
        this.dimensions.css.cell.height = this.dimensions.css.canvas.height / this._bufferService.rows;
        for (const element of this._rowElements) {
            element.style.width = `${this.dimensions.css.canvas.width}px`;
            element.style.height = `${this.dimensions.css.cell.height}px`;
            element.style.lineHeight = `${this.dimensions.css.cell.height}px`;
            element.style.overflow = 'hidden';
        }
        if (!this._dimensionsStyleElement) {
            this._dimensionsStyleElement = this._document.createElement('style');
            this._screenElement.appendChild(this._dimensionsStyleElement);
        }
        const styles = `${this._terminalSelector} .${ROW_CONTAINER_CLASS} span {` +
            ` display: inline-block;` +
            ` height: 100%;` +
            ` vertical-align: top;` +
            `}`;
        this._dimensionsStyleElement.textContent = styles;
        this._selectionContainer.style.height = this._viewportElement.style.height;
        this._screenElement.style.width = `${this.dimensions.css.canvas.width}px`;
        this._screenElement.style.height = `${this.dimensions.css.canvas.height}px`;
    }
    _injectCss(colors) {
        if (!this._themeStyleElement) {
            this._themeStyleElement = this._document.createElement('style');
            this._screenElement.appendChild(this._themeStyleElement);
        }
        let styles = `${this._terminalSelector} .${ROW_CONTAINER_CLASS} {` +
            ` color: ${colors.foreground.css};` +
            ` font-family: ${this._optionsService.rawOptions.fontFamily};` +
            ` font-size: ${this._optionsService.rawOptions.fontSize}px;` +
            ` font-kerning: none;` +
            ` white-space: pre` +
            `}`;
        styles +=
            `${this._terminalSelector} .${ROW_CONTAINER_CLASS} .xterm-dim {` +
                ` color: ${Color_1.color.multiplyOpacity(colors.foreground, 0.5).css};` +
                `}`;
        styles +=
            `${this._terminalSelector} span:not(.${"xterm-bold"}) {` +
                ` font-weight: ${this._optionsService.rawOptions.fontWeight};` +
                `}` +
                `${this._terminalSelector} span.${"xterm-bold"} {` +
                ` font-weight: ${this._optionsService.rawOptions.fontWeightBold};` +
                `}` +
                `${this._terminalSelector} span.${"xterm-italic"} {` +
                ` font-style: italic;` +
                `}`;
        const blinkAnimationUnderlineId = `blink_underline_${this._terminalClass}`;
        const blinkAnimationBarId = `blink_bar_${this._terminalClass}`;
        const blinkAnimationBlockId = `blink_block_${this._terminalClass}`;
        styles +=
            `@keyframes ${blinkAnimationUnderlineId} {` +
                ` 50% {` +
                `  border-bottom-style: hidden;` +
                ` }` +
                `}`;
        styles +=
            `@keyframes ${blinkAnimationBarId} {` +
                ` 50% {` +
                `  box-shadow: none;` +
                ` }` +
                `}`;
        styles +=
            `@keyframes ${blinkAnimationBlockId} {` +
                ` 0% {` +
                `  background-color: ${colors.cursor.css};` +
                `  color: ${colors.cursorAccent.css};` +
                ` }` +
                ` 50% {` +
                `  background-color: inherit;` +
                `  color: ${colors.cursor.css};` +
                ` }` +
                `}`;
        styles +=
            `${this._terminalSelector} .${ROW_CONTAINER_CLASS}.${FOCUS_CLASS} .${"xterm-cursor"}.${"xterm-cursor-blink"}.${"xterm-cursor-underline"} {` +
                ` animation: ${blinkAnimationUnderlineId} 1s step-end infinite;` +
                `}` +
                `${this._terminalSelector} .${ROW_CONTAINER_CLASS}.${FOCUS_CLASS} .${"xterm-cursor"}.${"xterm-cursor-blink"}.${"xterm-cursor-bar"} {` +
                ` animation: ${blinkAnimationBarId} 1s step-end infinite;` +
                `}` +
                `${this._terminalSelector} .${ROW_CONTAINER_CLASS}.${FOCUS_CLASS} .${"xterm-cursor"}.${"xterm-cursor-blink"}.${"xterm-cursor-block"} {` +
                ` animation: ${blinkAnimationBlockId} 1s step-end infinite;` +
                `}` +
                `${this._terminalSelector} .${ROW_CONTAINER_CLASS} .${"xterm-cursor"}.${"xterm-cursor-block"} {` +
                ` background-color: ${colors.cursor.css};` +
                ` color: ${colors.cursorAccent.css};` +
                `}` +
                `${this._terminalSelector} .${ROW_CONTAINER_CLASS} .${"xterm-cursor"}.${"xterm-cursor-block"}:not(.${"xterm-cursor-blink"}) {` +
                ` background-color: ${colors.cursor.css} !important;` +
                ` color: ${colors.cursorAccent.css} !important;` +
                `}` +
                `${this._terminalSelector} .${ROW_CONTAINER_CLASS} .${"xterm-cursor"}.${"xterm-cursor-outline"} {` +
                ` outline: 1px solid ${colors.cursor.css};` +
                ` outline-offset: -1px;` +
                `}` +
                `${this._terminalSelector} .${ROW_CONTAINER_CLASS} .${"xterm-cursor"}.${"xterm-cursor-bar"} {` +
                ` box-shadow: ${this._optionsService.rawOptions.cursorWidth}px 0 0 ${colors.cursor.css} inset;` +
                `}` +
                `${this._terminalSelector} .${ROW_CONTAINER_CLASS} .${"xterm-cursor"}.${"xterm-cursor-underline"} {` +
                ` border-bottom: 1px ${colors.cursor.css};` +
                ` border-bottom-style: solid;` +
                ` height: calc(100% - 1px);` +
                `}`;
        styles +=
            `${this._terminalSelector} .${SELECTION_CLASS} {` +
                ` position: absolute;` +
                ` top: 0;` +
                ` left: 0;` +
                ` z-index: 1;` +
                ` pointer-events: none;` +
                `}` +
                `${this._terminalSelector}.focus .${SELECTION_CLASS} div {` +
                ` position: absolute;` +
                ` background-color: ${colors.selectionBackgroundOpaque.css};` +
                `}` +
                `${this._terminalSelector} .${SELECTION_CLASS} div {` +
                ` position: absolute;` +
                ` background-color: ${colors.selectionInactiveBackgroundOpaque.css};` +
                `}`;
        for (const [i, c] of colors.ansi.entries()) {
            styles +=
                `${this._terminalSelector} .${FG_CLASS_PREFIX}${i} { color: ${c.css}; }` +
                    `${this._terminalSelector} .${FG_CLASS_PREFIX}${i}.${"xterm-dim"} { color: ${Color_1.color.multiplyOpacity(c, 0.5).css}; }` +
                    `${this._terminalSelector} .${BG_CLASS_PREFIX}${i} { background-color: ${c.css}; }`;
        }
        styles +=
            `${this._terminalSelector} .${FG_CLASS_PREFIX}${Constants_1.INVERTED_DEFAULT_COLOR} { color: ${Color_1.color.opaque(colors.background).css}; }` +
                `${this._terminalSelector} .${FG_CLASS_PREFIX}${Constants_1.INVERTED_DEFAULT_COLOR}.${"xterm-dim"} { color: ${Color_1.color.multiplyOpacity(Color_1.color.opaque(colors.background), 0.5).css}; }` +
                `${this._terminalSelector} .${BG_CLASS_PREFIX}${Constants_1.INVERTED_DEFAULT_COLOR} { background-color: ${colors.foreground.css}; }`;
        this._themeStyleElement.textContent = styles;
    }
    _setDefaultSpacing() {
        const spacing = this.dimensions.css.cell.width - this._widthCache.get('W', false, false);
        this._rowContainer.style.letterSpacing = `${spacing}px`;
        this._rowFactory.defaultSpacing = spacing;
    }
    handleDevicePixelRatioChange() {
        this._updateDimensions();
        this._widthCache.clear();
        this._setDefaultSpacing();
    }
    _refreshRowElements(cols, rows) {
        for (let i = this._rowElements.length; i <= rows; i++) {
            const row = this._document.createElement('div');
            this._rowContainer.appendChild(row);
            this._rowElements.push(row);
        }
        while (this._rowElements.length > rows) {
            this._rowContainer.removeChild(this._rowElements.pop());
        }
    }
    handleResize(cols, rows) {
        this._refreshRowElements(cols, rows);
        this._updateDimensions();
        this.handleSelectionChanged(this._selectionRenderModel.selectionStart, this._selectionRenderModel.selectionEnd, this._selectionRenderModel.columnSelectMode);
    }
    handleCharSizeChanged() {
        this._updateDimensions();
        this._widthCache.clear();
        this._setDefaultSpacing();
    }
    handleBlur() {
        this._rowContainer.classList.remove(FOCUS_CLASS);
        this.renderRows(0, this._bufferService.rows - 1);
    }
    handleFocus() {
        this._rowContainer.classList.add(FOCUS_CLASS);
        this.renderRows(this._bufferService.buffer.y, this._bufferService.buffer.y);
    }
    handleSelectionChanged(start, end, columnSelectMode) {
        this._selectionContainer.replaceChildren();
        this._rowFactory.handleSelectionChanged(start, end, columnSelectMode);
        this.renderRows(0, this._bufferService.rows - 1);
        if (!start || !end) {
            return;
        }
        this._selectionRenderModel.update(this._terminal, start, end, columnSelectMode);
        const viewportStartRow = this._selectionRenderModel.viewportStartRow;
        const viewportEndRow = this._selectionRenderModel.viewportEndRow;
        const viewportCappedStartRow = this._selectionRenderModel.viewportCappedStartRow;
        const viewportCappedEndRow = this._selectionRenderModel.viewportCappedEndRow;
        if (viewportCappedStartRow >= this._bufferService.rows || viewportCappedEndRow < 0) {
            return;
        }
        const documentFragment = this._document.createDocumentFragment();
        if (columnSelectMode) {
            const isXFlipped = start[0] > end[0];
            documentFragment.appendChild(this._createSelectionElement(viewportCappedStartRow, isXFlipped ? end[0] : start[0], isXFlipped ? start[0] : end[0], viewportCappedEndRow - viewportCappedStartRow + 1));
        }
        else {
            const startCol = viewportStartRow === viewportCappedStartRow ? start[0] : 0;
            const endCol = viewportCappedStartRow === viewportEndRow ? end[0] : this._bufferService.cols;
            documentFragment.appendChild(this._createSelectionElement(viewportCappedStartRow, startCol, endCol));
            const middleRowsCount = viewportCappedEndRow - viewportCappedStartRow - 1;
            documentFragment.appendChild(this._createSelectionElement(viewportCappedStartRow + 1, 0, this._bufferService.cols, middleRowsCount));
            if (viewportCappedStartRow !== viewportCappedEndRow) {
                const endCol = viewportEndRow === viewportCappedEndRow ? end[0] : this._bufferService.cols;
                documentFragment.appendChild(this._createSelectionElement(viewportCappedEndRow, 0, endCol));
            }
        }
        this._selectionContainer.appendChild(documentFragment);
    }
    _createSelectionElement(row, colStart, colEnd, rowCount = 1) {
        const element = this._document.createElement('div');
        const left = colStart * this.dimensions.css.cell.width;
        let width = this.dimensions.css.cell.width * (colEnd - colStart);
        if (left + width > this.dimensions.css.canvas.width) {
            width = this.dimensions.css.canvas.width - left;
        }
        element.style.height = `${rowCount * this.dimensions.css.cell.height}px`;
        element.style.top = `${row * this.dimensions.css.cell.height}px`;
        element.style.left = `${left}px`;
        element.style.width = `${width}px`;
        return element;
    }
    handleCursorMove() {
    }
    _handleOptionsChanged() {
        this._updateDimensions();
        this._injectCss(this._themeService.colors);
        this._widthCache.setFont(this._optionsService.rawOptions.fontFamily, this._optionsService.rawOptions.fontSize, this._optionsService.rawOptions.fontWeight, this._optionsService.rawOptions.fontWeightBold);
        this._setDefaultSpacing();
    }
    clear() {
        for (const e of this._rowElements) {
            e.replaceChildren();
        }
    }
    renderRows(start, end) {
        const buffer = this._bufferService.buffer;
        const cursorAbsoluteY = buffer.ybase + buffer.y;
        const cursorX = Math.min(buffer.x, this._bufferService.cols - 1);
        const cursorBlink = this._optionsService.rawOptions.cursorBlink;
        const cursorStyle = this._optionsService.rawOptions.cursorStyle;
        const cursorInactiveStyle = this._optionsService.rawOptions.cursorInactiveStyle;
        for (let y = start; y <= end; y++) {
            const row = y + buffer.ydisp;
            const rowElement = this._rowElements[y];
            const lineData = buffer.lines.get(row);
            if (!rowElement || !lineData) {
                break;
            }
            rowElement.replaceChildren(...this._rowFactory.createRow(lineData, row, row === cursorAbsoluteY, cursorStyle, cursorInactiveStyle, cursorX, cursorBlink, this.dimensions.css.cell.width, this._widthCache, -1, -1));
        }
    }
    get _terminalSelector() {
        return `.${TERMINAL_CLASS_PREFIX}${this._terminalClass}`;
    }
    _handleLinkHover(e) {
        this._setCellUnderline(e.x1, e.x2, e.y1, e.y2, e.cols, true);
    }
    _handleLinkLeave(e) {
        this._setCellUnderline(e.x1, e.x2, e.y1, e.y2, e.cols, false);
    }
    _setCellUnderline(x, x2, y, y2, cols, enabled) {
        if (y < 0)
            x = 0;
        if (y2 < 0)
            x2 = 0;
        const maxY = this._bufferService.rows - 1;
        y = Math.max(Math.min(y, maxY), 0);
        y2 = Math.max(Math.min(y2, maxY), 0);
        cols = Math.min(cols, this._bufferService.cols);
        const buffer = this._bufferService.buffer;
        const cursorAbsoluteY = buffer.ybase + buffer.y;
        const cursorX = Math.min(buffer.x, cols - 1);
        const cursorBlink = this._optionsService.rawOptions.cursorBlink;
        const cursorStyle = this._optionsService.rawOptions.cursorStyle;
        const cursorInactiveStyle = this._optionsService.rawOptions.cursorInactiveStyle;
        for (let i = y; i <= y2; ++i) {
            const row = i + buffer.ydisp;
            const rowElement = this._rowElements[i];
            const bufferline = buffer.lines.get(row);
            if (!rowElement || !bufferline) {
                break;
            }
            rowElement.replaceChildren(...this._rowFactory.createRow(bufferline, row, row === cursorAbsoluteY, cursorStyle, cursorInactiveStyle, cursorX, cursorBlink, this.dimensions.css.cell.width, this._widthCache, enabled ? (i === y ? x : 0) : -1, enabled ? ((i === y2 ? x2 : cols) - 1) : -1));
        }
    }
};
exports.DomRenderer = DomRenderer = __decorate([
    __param(7, Services_2.IInstantiationService),
    __param(8, Services_1.ICharSizeService),
    __param(9, Services_2.IOptionsService),
    __param(10, Services_2.IBufferService),
    __param(11, Services_1.ICoreBrowserService),
    __param(12, Services_1.IThemeService)
], DomRenderer);
//# sourceMappingURL=DomRenderer.js.map