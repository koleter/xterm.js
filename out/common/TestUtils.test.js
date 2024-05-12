"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MockDecorationService = exports.MockUnicodeService = exports.MockOscLinkService = exports.MockOptionsService = exports.MockLogService = exports.MockCoreService = exports.MockCharsetService = exports.MockCoreMouseService = exports.MockBufferService = void 0;
const Services_1 = require("common/services/Services");
const UnicodeService_1 = require("common/services/UnicodeService");
const EventEmitter_1 = require("common/EventEmitter");
const Clone_1 = require("common/Clone");
const OptionsService_1 = require("common/services/OptionsService");
const BufferSet_1 = require("common/buffer/BufferSet");
const UnicodeV6_1 = require("common/input/UnicodeV6");
class MockBufferService {
    get buffer() { return this.buffers.active; }
    constructor(cols, rows, optionsService = new MockOptionsService()) {
        this.cols = cols;
        this.rows = rows;
        this.buffers = {};
        this.onResize = new EventEmitter_1.EventEmitter().event;
        this.onScroll = new EventEmitter_1.EventEmitter().event;
        this.isUserScrolling = false;
        this.buffers = new BufferSet_1.BufferSet(optionsService, this);
    }
    scrollPages(pageCount) {
        throw new Error('Method not implemented.');
    }
    scrollToTop() {
        throw new Error('Method not implemented.');
    }
    scrollToLine(line) {
        throw new Error('Method not implemented.');
    }
    scroll(eraseAttr, isWrapped) {
        throw new Error('Method not implemented.');
    }
    scrollToBottom() {
        throw new Error('Method not implemented.');
    }
    scrollLines(disp, suppressScrollEvent) {
        throw new Error('Method not implemented.');
    }
    resize(cols, rows) {
        this.cols = cols;
        this.rows = rows;
    }
    reset() { }
}
exports.MockBufferService = MockBufferService;
class MockCoreMouseService {
    constructor() {
        this.areMouseEventsActive = false;
        this.activeEncoding = '';
        this.activeProtocol = '';
        this.onProtocolChange = new EventEmitter_1.EventEmitter().event;
    }
    addEncoding(name) { }
    addProtocol(name) { }
    reset() { }
    triggerMouseEvent(event) { return false; }
    explainEvents(events) {
        throw new Error('Method not implemented.');
    }
}
exports.MockCoreMouseService = MockCoreMouseService;
class MockCharsetService {
    constructor() {
        this.glevel = 0;
    }
    reset() { }
    setgLevel(g) { }
    setgCharset(g, charset) { }
}
exports.MockCharsetService = MockCharsetService;
class MockCoreService {
    constructor() {
        this.isCursorInitialized = true;
        this.isCursorHidden = false;
        this.isFocused = false;
        this.modes = {
            insertMode: false
        };
        this.decPrivateModes = {
            applicationCursorKeys: false,
            applicationKeypad: false,
            bracketedPasteMode: false,
            origin: false,
            reverseWraparound: false,
            sendFocus: false,
            wraparound: true
        };
        this.onData = new EventEmitter_1.EventEmitter().event;
        this.onUserInput = new EventEmitter_1.EventEmitter().event;
        this.onBinary = new EventEmitter_1.EventEmitter().event;
        this.onRequestScrollToBottom = new EventEmitter_1.EventEmitter().event;
    }
    reset() { }
    triggerDataEvent(data, wasUserInput) { }
    triggerBinaryEvent(data) { }
}
exports.MockCoreService = MockCoreService;
class MockLogService {
    constructor() {
        this.logLevel = Services_1.LogLevelEnum.DEBUG;
    }
    trace(message, ...optionalParams) { }
    debug(message, ...optionalParams) { }
    info(message, ...optionalParams) { }
    warn(message, ...optionalParams) { }
    error(message, ...optionalParams) { }
}
exports.MockLogService = MockLogService;
class MockOptionsService {
    constructor(testOptions) {
        this.rawOptions = (0, Clone_1.clone)(OptionsService_1.DEFAULT_OPTIONS);
        this.options = this.rawOptions;
        this.onOptionChange = new EventEmitter_1.EventEmitter().event;
        if (testOptions) {
            for (const key of Object.keys(testOptions)) {
                this.rawOptions[key] = testOptions[key];
            }
        }
    }
    onSpecificOptionChange(key, listener) {
        return this.onOptionChange(eventKey => {
            if (eventKey === key) {
                listener(this.rawOptions[key]);
            }
        });
    }
    onMultipleOptionChange(keys, listener) {
        return this.onOptionChange(eventKey => {
            if (keys.indexOf(eventKey) !== -1) {
                listener();
            }
        });
    }
    setOptions(options) {
        for (const key of Object.keys(options)) {
            this.options[key] = options[key];
        }
    }
}
exports.MockOptionsService = MockOptionsService;
class MockOscLinkService {
    registerLink(linkData) {
        return 1;
    }
    getLinkData(linkId) {
        return undefined;
    }
    addLineToLink(linkId, y) {
    }
}
exports.MockOscLinkService = MockOscLinkService;
class MockUnicodeService {
    constructor() {
        this._provider = new UnicodeV6_1.UnicodeV6();
        this.versions = [];
        this.activeVersion = '';
        this.onChange = new EventEmitter_1.EventEmitter().event;
        this.wcwidth = (codepoint) => this._provider.wcwidth(codepoint);
    }
    register(provider) {
        throw new Error('Method not implemented.');
    }
    charProperties(codepoint, preceding) {
        let width = this.wcwidth(codepoint);
        let shouldJoin = width === 0 && preceding !== 0;
        if (shouldJoin) {
            const oldWidth = UnicodeService_1.UnicodeService.extractWidth(preceding);
            if (oldWidth === 0) {
                shouldJoin = false;
            }
            else if (oldWidth > width) {
                width = oldWidth;
            }
        }
        return UnicodeService_1.UnicodeService.createPropertyValue(0, width, shouldJoin);
    }
    getStringCellWidth(s) {
        throw new Error('Method not implemented.');
    }
}
exports.MockUnicodeService = MockUnicodeService;
class MockDecorationService {
    constructor() {
        this.onDecorationRegistered = new EventEmitter_1.EventEmitter().event;
        this.onDecorationRemoved = new EventEmitter_1.EventEmitter().event;
    }
    get decorations() { return [].values(); }
    registerDecoration(decorationOptions) { return undefined; }
    reset() { }
    forEachDecorationAtCell(x, line, layer, callback) { }
    dispose() { }
}
exports.MockDecorationService = MockDecorationService;
//# sourceMappingURL=TestUtils.test.js.map