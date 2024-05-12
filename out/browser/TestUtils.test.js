"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockThemeService = exports.MockSelectionService = exports.MockCharacterJoinerService = exports.MockRenderService = exports.MockMouseService = exports.MockCharSizeService = exports.MockCoreBrowserService = exports.MockCompositionHelper = exports.MockViewport = exports.MockRenderer = exports.MockBuffer = exports.MockTerminal = exports.TestTerminal = void 0;
const EventEmitter_1 = require("common/EventEmitter");
const Buffer_1 = require("common/buffer/Buffer");
const Browser = require("common/Platform");
const Terminal_1 = require("browser/Terminal");
const AttributeData_1 = require("common/buffer/AttributeData");
const Color_1 = require("common/Color");
const RendererUtils_1 = require("browser/renderer/shared/RendererUtils");
class TestTerminal extends Terminal_1.Terminal {
    get curAttrData() { return this._inputHandler._curAttrData; }
    keyDown(ev) { return this._keyDown(ev); }
    keyPress(ev) { return this._keyPress(ev); }
    writeP(data) {
        return new Promise(r => this.write(data, r));
    }
}
exports.TestTerminal = TestTerminal;
class MockTerminal {
    constructor() {
        this.browser = Browser;
    }
    registerMarker(cursorYOffset) {
        throw new Error('Method not implemented.');
    }
    selectLines(start, end) {
        throw new Error('Method not implemented.');
    }
    scrollToLine(line) {
        throw new Error('Method not implemented.');
    }
    setOption(key, value) {
        throw new Error('Method not implemented.');
    }
    blur() {
        throw new Error('Method not implemented.');
    }
    focus() {
        throw new Error('Method not implemented.');
    }
    input(data, wasUserInput = true) {
        throw new Error('Method not implemented.');
    }
    resize(columns, rows) {
        throw new Error('Method not implemented.');
    }
    writeln(data) {
        throw new Error('Method not implemented.');
    }
    paste(data) {
        throw new Error('Method not implemented.');
    }
    open(parent) {
        throw new Error('Method not implemented.');
    }
    attachCustomKeyEventHandler(customKeyEventHandler) {
        throw new Error('Method not implemented.');
    }
    attachCustomWheelEventHandler(customWheelEventHandler) {
        throw new Error('Method not implemented.');
    }
    registerCsiHandler(id, callback) {
        throw new Error('Method not implemented.');
    }
    registerDcsHandler(id, callback) {
        throw new Error('Method not implemented.');
    }
    registerEscHandler(id, handler) {
        throw new Error('Method not implemented.');
    }
    registerOscHandler(ident, callback) {
        throw new Error('Method not implemented.');
    }
    registerLinkProvider(linkProvider) {
        throw new Error('Method not implemented.');
    }
    registerDecoration(decorationOptions) {
        throw new Error('Method not implemented.');
    }
    hasSelection() {
        throw new Error('Method not implemented.');
    }
    getSelection() {
        throw new Error('Method not implemented.');
    }
    getSelectionPosition() {
        throw new Error('Method not implemented.');
    }
    clearSelection() {
        throw new Error('Method not implemented.');
    }
    select(column, row, length) {
        throw new Error('Method not implemented.');
    }
    selectAll() {
        throw new Error('Method not implemented.');
    }
    dispose() {
        throw new Error('Method not implemented.');
    }
    scrollPages(pageCount) {
        throw new Error('Method not implemented.');
    }
    scrollToTop() {
        throw new Error('Method not implemented.');
    }
    scrollToBottom() {
        throw new Error('Method not implemented.');
    }
    clear() {
        throw new Error('Method not implemented.');
    }
    write(data) {
        throw new Error('Method not implemented.');
    }
    getBufferElements(startLine, endLine) {
        throw new Error('Method not implemented.');
    }
    registerBufferElementProvider(bufferProvider) {
        throw new Error('Method not implemented.');
    }
    handler(data) {
        throw new Error('Method not implemented.');
    }
    on(event, callback) {
        throw new Error('Method not implemented.');
    }
    off(type, listener) {
        throw new Error('Method not implemented.');
    }
    addDisposableListener(type, handler) {
        throw new Error('Method not implemented.');
    }
    scrollLines(disp) {
        throw new Error('Method not implemented.');
    }
    scrollToRow(absoluteRow) {
        throw new Error('Method not implemented.');
    }
    cancel(ev, force) {
        throw new Error('Method not implemented.');
    }
    log(text) {
        throw new Error('Method not implemented.');
    }
    emit(event, data) {
        throw new Error('Method not implemented.');
    }
    reset() {
        throw new Error('Method not implemented.');
    }
    clearTextureAtlas() {
        throw new Error('Method not implemented.');
    }
    refresh(start, end) {
        throw new Error('Method not implemented.');
    }
    registerCharacterJoiner(handler) { return 0; }
    deregisterCharacterJoiner(joinerId) { }
}
exports.MockTerminal = MockTerminal;
class MockBuffer {
    constructor() {
        this.savedCurAttrData = new AttributeData_1.AttributeData();
    }
    addMarker(y) {
        throw new Error('Method not implemented.');
    }
    translateBufferLineToString(lineIndex, trimRight, startCol, endCol) {
        return Buffer_1.Buffer.prototype.translateBufferLineToString.apply(this, arguments);
    }
    getWrappedRangeForLine(y) {
        return Buffer_1.Buffer.prototype.getWrappedRangeForLine.apply(this, arguments);
    }
    nextStop(x) {
        throw new Error('Method not implemented.');
    }
    prevStop(x) {
        throw new Error('Method not implemented.');
    }
    setLines(lines) {
        this.lines = lines;
    }
    getBlankLine(attr, isWrapped) {
        return Buffer_1.Buffer.prototype.getBlankLine.apply(this, arguments);
    }
    getNullCell(attr) {
        throw new Error('Method not implemented.');
    }
    getWhitespaceCell(attr) {
        throw new Error('Method not implemented.');
    }
    clearMarkers(y) {
        throw new Error('Method not implemented.');
    }
    clearAllMarkers() {
        throw new Error('Method not implemented.');
    }
}
exports.MockBuffer = MockBuffer;
class MockRenderer {
    dispose() {
        throw new Error('Method not implemented.');
    }
    on(type, listener) {
        throw new Error('Method not implemented.');
    }
    off(type, listener) {
        throw new Error('Method not implemented.');
    }
    emit(type, data) {
        throw new Error('Method not implemented.');
    }
    addDisposableListener(type, handler) {
        throw new Error('Method not implemented.');
    }
    registerDecoration(decorationOptions) {
        throw new Error('Method not implemented.');
    }
    handleResize(cols, rows) { }
    handleCharSizeChanged() { }
    handleBlur() { }
    handleFocus() { }
    handleSelectionChanged(start, end) { }
    handleCursorMove() { }
    handleOptionsChanged() { }
    handleDevicePixelRatioChange() { }
    clear() { }
    renderRows(start, end) { }
}
exports.MockRenderer = MockRenderer;
class MockViewport {
    constructor() {
        this._onRequestScrollLines = new EventEmitter_1.EventEmitter();
        this.onRequestScrollLines = this._onRequestScrollLines.event;
        this.scrollBarWidth = 0;
    }
    dispose() {
        throw new Error('Method not implemented.');
    }
    handleThemeChange(colors) {
        throw new Error('Method not implemented.');
    }
    handleWheel(ev) {
        throw new Error('Method not implemented.');
    }
    handleTouchStart(ev) {
        throw new Error('Method not implemented.');
    }
    handleTouchMove(ev) {
        throw new Error('Method not implemented.');
    }
    syncScrollArea() { }
    getLinesScrolled(ev) {
        throw new Error('Method not implemented.');
    }
    getBufferElements(startLine, endLine) {
        throw new Error('Method not implemented.');
    }
    scrollLines(disp) {
        this._onRequestScrollLines.fire({ amount: disp, suppressScrollEvent: false });
    }
    reset() {
    }
}
exports.MockViewport = MockViewport;
class MockCompositionHelper {
    get isComposing() {
        return false;
    }
    compositionstart() {
        throw new Error('Method not implemented.');
    }
    compositionupdate(ev) {
        throw new Error('Method not implemented.');
    }
    compositionend() {
        throw new Error('Method not implemented.');
    }
    updateCompositionElements(dontRecurse) {
        throw new Error('Method not implemented.');
    }
    keydown(ev) {
        return true;
    }
}
exports.MockCompositionHelper = MockCompositionHelper;
class MockCoreBrowserService {
    constructor() {
        this.onDprChange = new EventEmitter_1.EventEmitter().event;
        this.onWindowChange = new EventEmitter_1.EventEmitter().event;
        this.isFocused = true;
        this.dpr = 1;
    }
    get window() {
        throw Error('Window object not available in tests');
    }
    get mainDocument() {
        throw Error('Document object not available in tests');
    }
}
exports.MockCoreBrowserService = MockCoreBrowserService;
class MockCharSizeService {
    get hasValidSize() { return this.width > 0 && this.height > 0; }
    constructor(width, height) {
        this.width = width;
        this.height = height;
        this.onCharSizeChange = new EventEmitter_1.EventEmitter().event;
    }
    measure() { }
}
exports.MockCharSizeService = MockCharSizeService;
class MockMouseService {
    getCoords(event, element, colCount, rowCount, isSelection) {
        throw new Error('Not implemented');
    }
    getMouseReportCoords(event, element) {
        throw new Error('Not implemented');
    }
}
exports.MockMouseService = MockMouseService;
class MockRenderService {
    constructor() {
        this.onDimensionsChange = new EventEmitter_1.EventEmitter().event;
        this.onRenderedViewportChange = new EventEmitter_1.EventEmitter().event;
        this.onRender = new EventEmitter_1.EventEmitter().event;
        this.onRefreshRequest = new EventEmitter_1.EventEmitter().event;
        this.dimensions = (0, RendererUtils_1.createRenderDimensions)();
    }
    refreshRows(start, end) {
        throw new Error('Method not implemented.');
    }
    addRefreshCallback(callback) {
        throw new Error('Method not implemented.');
    }
    clearTextureAtlas() {
        throw new Error('Method not implemented.');
    }
    resize(cols, rows) {
        throw new Error('Method not implemented.');
    }
    hasRenderer() {
        throw new Error('Method not implemented.');
    }
    setRenderer(renderer) {
        throw new Error('Method not implemented.');
    }
    handleDevicePixelRatioChange() {
        throw new Error('Method not implemented.');
    }
    handleResize(cols, rows) {
        throw new Error('Method not implemented.');
    }
    handleCharSizeChanged() {
        throw new Error('Method not implemented.');
    }
    handleBlur() {
        throw new Error('Method not implemented.');
    }
    handleFocus() {
        throw new Error('Method not implemented.');
    }
    handleSelectionChanged(start, end, columnSelectMode) {
        throw new Error('Method not implemented.');
    }
    handleCursorMove() {
        throw new Error('Method not implemented.');
    }
    clear() {
        throw new Error('Method not implemented.');
    }
    dispose() {
        throw new Error('Method not implemented.');
    }
    registerDecoration(decorationOptions) {
        throw new Error('Method not implemented.');
    }
}
exports.MockRenderService = MockRenderService;
class MockCharacterJoinerService {
    register(handler) {
        return 0;
    }
    deregister(joinerId) {
        return true;
    }
    getJoinedCharacters(row) {
        return [];
    }
}
exports.MockCharacterJoinerService = MockCharacterJoinerService;
class MockSelectionService {
    constructor() {
        this.selectionText = '';
        this.hasSelection = false;
        this.onLinuxMouseSelection = new EventEmitter_1.EventEmitter().event;
        this.onRequestRedraw = new EventEmitter_1.EventEmitter().event;
        this.onRequestScrollLines = new EventEmitter_1.EventEmitter().event;
        this.onSelectionChange = new EventEmitter_1.EventEmitter().event;
    }
    disable() {
        throw new Error('Method not implemented.');
    }
    enable() {
        throw new Error('Method not implemented.');
    }
    reset() {
        throw new Error('Method not implemented.');
    }
    setSelection(row, col, length) {
        throw new Error('Method not implemented.');
    }
    selectAll() {
        throw new Error('Method not implemented.');
    }
    selectLines(start, end) {
        throw new Error('Method not implemented.');
    }
    clearSelection() {
        throw new Error('Method not implemented.');
    }
    rightClickSelect(event) {
        throw new Error('Method not implemented.');
    }
    shouldColumnSelect(event) {
        throw new Error('Method not implemented.');
    }
    shouldForceSelection(event) {
        throw new Error('Method not implemented.');
    }
    refresh(isLinuxMouseSelection) {
        throw new Error('Method not implemented.');
    }
    handleMouseDown(event) {
        throw new Error('Method not implemented.');
    }
    isCellInSelection(x, y) {
        return false;
    }
}
exports.MockSelectionService = MockSelectionService;
class MockThemeService {
    constructor() {
        this.onChangeColors = new EventEmitter_1.EventEmitter().event;
        this.colors = {
            background: Color_1.css.toColor('#010101'),
            foreground: Color_1.css.toColor('#020202'),
            ansi: [
                Color_1.css.toColor('#2e3436'),
                Color_1.css.toColor('#cc0000'),
                Color_1.css.toColor('#4e9a06'),
                Color_1.css.toColor('#c4a000'),
                Color_1.css.toColor('#3465a4'),
                Color_1.css.toColor('#75507b'),
                Color_1.css.toColor('#06989a'),
                Color_1.css.toColor('#d3d7cf'),
                Color_1.css.toColor('#555753'),
                Color_1.css.toColor('#ef2929'),
                Color_1.css.toColor('#8ae234'),
                Color_1.css.toColor('#fce94f'),
                Color_1.css.toColor('#729fcf'),
                Color_1.css.toColor('#ad7fa8'),
                Color_1.css.toColor('#34e2e2'),
                Color_1.css.toColor('#eeeeec')
            ],
            selectionBackgroundOpaque: Color_1.css.toColor('#ff0000'),
            selectionInactiveBackgroundOpaque: Color_1.css.toColor('#00ff00')
        };
    }
    restoreColor(slot) {
        throw new Error('Method not implemented.');
    }
    modifyColors(callback) {
        throw new Error('Method not implemented.');
    }
}
exports.MockThemeService = MockThemeService;
//# sourceMappingURL=TestUtils.test.js.map