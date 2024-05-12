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
exports.InputHandler = exports.WindowsOptionsReportType = void 0;
const EscapeSequences_1 = require("common/data/EscapeSequences");
const Charsets_1 = require("common/data/Charsets");
const EscapeSequenceParser_1 = require("common/parser/EscapeSequenceParser");
const Lifecycle_1 = require("common/Lifecycle");
const TextDecoder_1 = require("common/input/TextDecoder");
const BufferLine_1 = require("common/buffer/BufferLine");
const EventEmitter_1 = require("common/EventEmitter");
const Constants_1 = require("common/buffer/Constants");
const CellData_1 = require("common/buffer/CellData");
const AttributeData_1 = require("common/buffer/AttributeData");
const Services_1 = require("common/services/Services");
const UnicodeService_1 = require("common/services/UnicodeService");
const OscParser_1 = require("common/parser/OscParser");
const DcsParser_1 = require("common/parser/DcsParser");
const XParseColor_1 = require("common/input/XParseColor");
const GLEVEL = { '(': 0, ')': 1, '*': 2, '+': 3, '-': 1, '.': 2 };
const MAX_PARSEBUFFER_LENGTH = 131072;
const STACK_LIMIT = 10;
function paramToWindowOption(n, opts) {
    if (n > 24) {
        return opts.setWinLines || false;
    }
    switch (n) {
        case 1: return !!opts.restoreWin;
        case 2: return !!opts.minimizeWin;
        case 3: return !!opts.setWinPosition;
        case 4: return !!opts.setWinSizePixels;
        case 5: return !!opts.raiseWin;
        case 6: return !!opts.lowerWin;
        case 7: return !!opts.refreshWin;
        case 8: return !!opts.setWinSizeChars;
        case 9: return !!opts.maximizeWin;
        case 10: return !!opts.fullscreenWin;
        case 11: return !!opts.getWinState;
        case 13: return !!opts.getWinPosition;
        case 14: return !!opts.getWinSizePixels;
        case 15: return !!opts.getScreenSizePixels;
        case 16: return !!opts.getCellSizePixels;
        case 18: return !!opts.getWinSizeChars;
        case 19: return !!opts.getScreenSizeChars;
        case 20: return !!opts.getIconTitle;
        case 21: return !!opts.getWinTitle;
        case 22: return !!opts.pushTitle;
        case 23: return !!opts.popTitle;
        case 24: return !!opts.setWinLines;
    }
    return false;
}
var WindowsOptionsReportType;
(function (WindowsOptionsReportType) {
    WindowsOptionsReportType[WindowsOptionsReportType["GET_WIN_SIZE_PIXELS"] = 0] = "GET_WIN_SIZE_PIXELS";
    WindowsOptionsReportType[WindowsOptionsReportType["GET_CELL_SIZE_PIXELS"] = 1] = "GET_CELL_SIZE_PIXELS";
})(WindowsOptionsReportType || (exports.WindowsOptionsReportType = WindowsOptionsReportType = {}));
const SLOW_ASYNC_LIMIT = 5000;
let $temp = 0;
class InputHandler extends Lifecycle_1.Disposable {
    getAttrData() { return this._curAttrData; }
    constructor(_bufferService, _charsetService, _coreService, _logService, _optionsService, _oscLinkService, _coreMouseService, _unicodeService, _parser = new EscapeSequenceParser_1.EscapeSequenceParser()) {
        super();
        this._bufferService = _bufferService;
        this._charsetService = _charsetService;
        this._coreService = _coreService;
        this._logService = _logService;
        this._optionsService = _optionsService;
        this._oscLinkService = _oscLinkService;
        this._coreMouseService = _coreMouseService;
        this._unicodeService = _unicodeService;
        this._parser = _parser;
        this._parseBuffer = new Uint32Array(4096);
        this._stringDecoder = new TextDecoder_1.StringToUtf32();
        this._utf8Decoder = new TextDecoder_1.Utf8ToUtf32();
        this._workCell = new CellData_1.CellData();
        this._windowTitle = '';
        this._iconName = '';
        this._windowTitleStack = [];
        this._iconNameStack = [];
        this._curAttrData = BufferLine_1.DEFAULT_ATTR_DATA.clone();
        this._eraseAttrDataInternal = BufferLine_1.DEFAULT_ATTR_DATA.clone();
        this._onRequestBell = this.register(new EventEmitter_1.EventEmitter());
        this.onRequestBell = this._onRequestBell.event;
        this._onRequestRefreshRows = this.register(new EventEmitter_1.EventEmitter());
        this.onRequestRefreshRows = this._onRequestRefreshRows.event;
        this._onRequestReset = this.register(new EventEmitter_1.EventEmitter());
        this.onRequestReset = this._onRequestReset.event;
        this._onRequestSendFocus = this.register(new EventEmitter_1.EventEmitter());
        this.onRequestSendFocus = this._onRequestSendFocus.event;
        this._onRequestSyncScrollBar = this.register(new EventEmitter_1.EventEmitter());
        this.onRequestSyncScrollBar = this._onRequestSyncScrollBar.event;
        this._onRequestWindowsOptionsReport = this.register(new EventEmitter_1.EventEmitter());
        this.onRequestWindowsOptionsReport = this._onRequestWindowsOptionsReport.event;
        this._onA11yChar = this.register(new EventEmitter_1.EventEmitter());
        this.onA11yChar = this._onA11yChar.event;
        this._onA11yTab = this.register(new EventEmitter_1.EventEmitter());
        this.onA11yTab = this._onA11yTab.event;
        this._onCursorMove = this.register(new EventEmitter_1.EventEmitter());
        this.onCursorMove = this._onCursorMove.event;
        this._onLineFeed = this.register(new EventEmitter_1.EventEmitter());
        this.onLineFeed = this._onLineFeed.event;
        this._onScroll = this.register(new EventEmitter_1.EventEmitter());
        this.onScroll = this._onScroll.event;
        this._onTitleChange = this.register(new EventEmitter_1.EventEmitter());
        this.onTitleChange = this._onTitleChange.event;
        this._onColor = this.register(new EventEmitter_1.EventEmitter());
        this.onColor = this._onColor.event;
        this._parseStack = {
            paused: false,
            cursorStartX: 0,
            cursorStartY: 0,
            decodedLength: 0,
            position: 0
        };
        this._specialColors = [256, 257, 258];
        this.register(this._parser);
        this._dirtyRowTracker = new DirtyRowTracker(this._bufferService);
        this._activeBuffer = this._bufferService.buffer;
        this.register(this._bufferService.buffers.onBufferActivate(e => this._activeBuffer = e.activeBuffer));
        this._parser.setCsiHandlerFallback((ident, params) => {
            this._logService.debug('Unknown CSI code: ', { identifier: this._parser.identToString(ident), params: params.toArray() });
        });
        this._parser.setEscHandlerFallback(ident => {
            this._logService.debug('Unknown ESC code: ', { identifier: this._parser.identToString(ident) });
        });
        this._parser.setExecuteHandlerFallback(code => {
            this._logService.debug('Unknown EXECUTE code: ', { code });
        });
        this._parser.setOscHandlerFallback((identifier, action, data) => {
            this._logService.debug('Unknown OSC code: ', { identifier, action, data });
        });
        this._parser.setDcsHandlerFallback((ident, action, payload) => {
            if (action === 'HOOK') {
                payload = payload.toArray();
            }
            this._logService.debug('Unknown DCS code: ', { identifier: this._parser.identToString(ident), action, payload });
        });
        this._parser.setPrintHandler((data, start, end) => this.print(data, start, end));
        this._parser.registerCsiHandler({ final: '@' }, params => this.insertChars(params));
        this._parser.registerCsiHandler({ intermediates: ' ', final: '@' }, params => this.scrollLeft(params));
        this._parser.registerCsiHandler({ final: 'A' }, params => this.cursorUp(params));
        this._parser.registerCsiHandler({ intermediates: ' ', final: 'A' }, params => this.scrollRight(params));
        this._parser.registerCsiHandler({ final: 'B' }, params => this.cursorDown(params));
        this._parser.registerCsiHandler({ final: 'C' }, params => this.cursorForward(params));
        this._parser.registerCsiHandler({ final: 'D' }, params => this.cursorBackward(params));
        this._parser.registerCsiHandler({ final: 'E' }, params => this.cursorNextLine(params));
        this._parser.registerCsiHandler({ final: 'F' }, params => this.cursorPrecedingLine(params));
        this._parser.registerCsiHandler({ final: 'G' }, params => this.cursorCharAbsolute(params));
        this._parser.registerCsiHandler({ final: 'H' }, params => this.cursorPosition(params));
        this._parser.registerCsiHandler({ final: 'I' }, params => this.cursorForwardTab(params));
        this._parser.registerCsiHandler({ final: 'J' }, params => this.eraseInDisplay(params, false));
        this._parser.registerCsiHandler({ prefix: '?', final: 'J' }, params => this.eraseInDisplay(params, true));
        this._parser.registerCsiHandler({ final: 'K' }, params => this.eraseInLine(params, false));
        this._parser.registerCsiHandler({ prefix: '?', final: 'K' }, params => this.eraseInLine(params, true));
        this._parser.registerCsiHandler({ final: 'L' }, params => this.insertLines(params));
        this._parser.registerCsiHandler({ final: 'M' }, params => this.deleteLines(params));
        this._parser.registerCsiHandler({ final: 'P' }, params => this.deleteChars(params));
        this._parser.registerCsiHandler({ final: 'S' }, params => this.scrollUp(params));
        this._parser.registerCsiHandler({ final: 'T' }, params => this.scrollDown(params));
        this._parser.registerCsiHandler({ final: 'X' }, params => this.eraseChars(params));
        this._parser.registerCsiHandler({ final: 'Z' }, params => this.cursorBackwardTab(params));
        this._parser.registerCsiHandler({ final: '`' }, params => this.charPosAbsolute(params));
        this._parser.registerCsiHandler({ final: 'a' }, params => this.hPositionRelative(params));
        this._parser.registerCsiHandler({ final: 'b' }, params => this.repeatPrecedingCharacter(params));
        this._parser.registerCsiHandler({ final: 'c' }, params => this.sendDeviceAttributesPrimary(params));
        this._parser.registerCsiHandler({ prefix: '>', final: 'c' }, params => this.sendDeviceAttributesSecondary(params));
        this._parser.registerCsiHandler({ final: 'd' }, params => this.linePosAbsolute(params));
        this._parser.registerCsiHandler({ final: 'e' }, params => this.vPositionRelative(params));
        this._parser.registerCsiHandler({ final: 'f' }, params => this.hVPosition(params));
        this._parser.registerCsiHandler({ final: 'g' }, params => this.tabClear(params));
        this._parser.registerCsiHandler({ final: 'h' }, params => this.setMode(params));
        this._parser.registerCsiHandler({ prefix: '?', final: 'h' }, params => this.setModePrivate(params));
        this._parser.registerCsiHandler({ final: 'l' }, params => this.resetMode(params));
        this._parser.registerCsiHandler({ prefix: '?', final: 'l' }, params => this.resetModePrivate(params));
        this._parser.registerCsiHandler({ final: 'm' }, params => this.charAttributes(params));
        this._parser.registerCsiHandler({ final: 'n' }, params => this.deviceStatus(params));
        this._parser.registerCsiHandler({ prefix: '?', final: 'n' }, params => this.deviceStatusPrivate(params));
        this._parser.registerCsiHandler({ intermediates: '!', final: 'p' }, params => this.softReset(params));
        this._parser.registerCsiHandler({ intermediates: ' ', final: 'q' }, params => this.setCursorStyle(params));
        this._parser.registerCsiHandler({ final: 'r' }, params => this.setScrollRegion(params));
        this._parser.registerCsiHandler({ final: 's' }, params => this.saveCursor(params));
        this._parser.registerCsiHandler({ final: 't' }, params => this.windowOptions(params));
        this._parser.registerCsiHandler({ final: 'u' }, params => this.restoreCursor(params));
        this._parser.registerCsiHandler({ intermediates: '\'', final: '}' }, params => this.insertColumns(params));
        this._parser.registerCsiHandler({ intermediates: '\'', final: '~' }, params => this.deleteColumns(params));
        this._parser.registerCsiHandler({ intermediates: '"', final: 'q' }, params => this.selectProtected(params));
        this._parser.registerCsiHandler({ intermediates: '$', final: 'p' }, params => this.requestMode(params, true));
        this._parser.registerCsiHandler({ prefix: '?', intermediates: '$', final: 'p' }, params => this.requestMode(params, false));
        this._parser.setExecuteHandler(EscapeSequences_1.C0.BEL, () => this.bell());
        this._parser.setExecuteHandler(EscapeSequences_1.C0.LF, () => this.lineFeed());
        this._parser.setExecuteHandler(EscapeSequences_1.C0.VT, () => this.lineFeed());
        this._parser.setExecuteHandler(EscapeSequences_1.C0.FF, () => this.lineFeed());
        this._parser.setExecuteHandler(EscapeSequences_1.C0.CR, () => this.carriageReturn());
        this._parser.setExecuteHandler(EscapeSequences_1.C0.BS, () => this.backspace());
        this._parser.setExecuteHandler(EscapeSequences_1.C0.HT, () => this.tab());
        this._parser.setExecuteHandler(EscapeSequences_1.C0.SO, () => this.shiftOut());
        this._parser.setExecuteHandler(EscapeSequences_1.C0.SI, () => this.shiftIn());
        this._parser.setExecuteHandler(EscapeSequences_1.C1.IND, () => this.index());
        this._parser.setExecuteHandler(EscapeSequences_1.C1.NEL, () => this.nextLine());
        this._parser.setExecuteHandler(EscapeSequences_1.C1.HTS, () => this.tabSet());
        this._parser.registerOscHandler(0, new OscParser_1.OscHandler(data => { this.setTitle(data); this.setIconName(data); return true; }));
        this._parser.registerOscHandler(1, new OscParser_1.OscHandler(data => this.setIconName(data)));
        this._parser.registerOscHandler(2, new OscParser_1.OscHandler(data => this.setTitle(data)));
        this._parser.registerOscHandler(4, new OscParser_1.OscHandler(data => this.setOrReportIndexedColor(data)));
        this._parser.registerOscHandler(8, new OscParser_1.OscHandler(data => this.setHyperlink(data)));
        this._parser.registerOscHandler(10, new OscParser_1.OscHandler(data => this.setOrReportFgColor(data)));
        this._parser.registerOscHandler(11, new OscParser_1.OscHandler(data => this.setOrReportBgColor(data)));
        this._parser.registerOscHandler(12, new OscParser_1.OscHandler(data => this.setOrReportCursorColor(data)));
        this._parser.registerOscHandler(104, new OscParser_1.OscHandler(data => this.restoreIndexedColor(data)));
        this._parser.registerOscHandler(110, new OscParser_1.OscHandler(data => this.restoreFgColor(data)));
        this._parser.registerOscHandler(111, new OscParser_1.OscHandler(data => this.restoreBgColor(data)));
        this._parser.registerOscHandler(112, new OscParser_1.OscHandler(data => this.restoreCursorColor(data)));
        this._parser.registerEscHandler({ final: '7' }, () => this.saveCursor());
        this._parser.registerEscHandler({ final: '8' }, () => this.restoreCursor());
        this._parser.registerEscHandler({ final: 'D' }, () => this.index());
        this._parser.registerEscHandler({ final: 'E' }, () => this.nextLine());
        this._parser.registerEscHandler({ final: 'H' }, () => this.tabSet());
        this._parser.registerEscHandler({ final: 'M' }, () => this.reverseIndex());
        this._parser.registerEscHandler({ final: '=' }, () => this.keypadApplicationMode());
        this._parser.registerEscHandler({ final: '>' }, () => this.keypadNumericMode());
        this._parser.registerEscHandler({ final: 'c' }, () => this.fullReset());
        this._parser.registerEscHandler({ final: 'n' }, () => this.setgLevel(2));
        this._parser.registerEscHandler({ final: 'o' }, () => this.setgLevel(3));
        this._parser.registerEscHandler({ final: '|' }, () => this.setgLevel(3));
        this._parser.registerEscHandler({ final: '}' }, () => this.setgLevel(2));
        this._parser.registerEscHandler({ final: '~' }, () => this.setgLevel(1));
        this._parser.registerEscHandler({ intermediates: '%', final: '@' }, () => this.selectDefaultCharset());
        this._parser.registerEscHandler({ intermediates: '%', final: 'G' }, () => this.selectDefaultCharset());
        for (const flag in Charsets_1.CHARSETS) {
            this._parser.registerEscHandler({ intermediates: '(', final: flag }, () => this.selectCharset('(' + flag));
            this._parser.registerEscHandler({ intermediates: ')', final: flag }, () => this.selectCharset(')' + flag));
            this._parser.registerEscHandler({ intermediates: '*', final: flag }, () => this.selectCharset('*' + flag));
            this._parser.registerEscHandler({ intermediates: '+', final: flag }, () => this.selectCharset('+' + flag));
            this._parser.registerEscHandler({ intermediates: '-', final: flag }, () => this.selectCharset('-' + flag));
            this._parser.registerEscHandler({ intermediates: '.', final: flag }, () => this.selectCharset('.' + flag));
            this._parser.registerEscHandler({ intermediates: '/', final: flag }, () => this.selectCharset('/' + flag));
        }
        this._parser.registerEscHandler({ intermediates: '#', final: '8' }, () => this.screenAlignmentPattern());
        this._parser.setErrorHandler((state) => {
            this._logService.error('Parsing error: ', state);
            return state;
        });
        this._parser.registerDcsHandler({ intermediates: '$', final: 'q' }, new DcsParser_1.DcsHandler((data, params) => this.requestStatusString(data, params)));
    }
    _preserveStack(cursorStartX, cursorStartY, decodedLength, position) {
        this._parseStack.paused = true;
        this._parseStack.cursorStartX = cursorStartX;
        this._parseStack.cursorStartY = cursorStartY;
        this._parseStack.decodedLength = decodedLength;
        this._parseStack.position = position;
    }
    _logSlowResolvingAsync(p) {
        if (this._logService.logLevel <= Services_1.LogLevelEnum.WARN) {
            Promise.race([p, new Promise((res, rej) => setTimeout(() => rej('#SLOW_TIMEOUT'), SLOW_ASYNC_LIMIT))])
                .catch(err => {
                if (err !== '#SLOW_TIMEOUT') {
                    throw err;
                }
                console.warn(`async parser handler taking longer than ${SLOW_ASYNC_LIMIT} ms`);
            });
        }
    }
    _getCurrentLinkId() {
        return this._curAttrData.extended.urlId;
    }
    parse(data, promiseResult) {
        let result;
        let cursorStartX = this._activeBuffer.x;
        let cursorStartY = this._activeBuffer.y;
        let start = 0;
        const wasPaused = this._parseStack.paused;
        if (wasPaused) {
            if (result = this._parser.parse(this._parseBuffer, this._parseStack.decodedLength, promiseResult)) {
                this._logSlowResolvingAsync(result);
                return result;
            }
            cursorStartX = this._parseStack.cursorStartX;
            cursorStartY = this._parseStack.cursorStartY;
            this._parseStack.paused = false;
            if (data.length > MAX_PARSEBUFFER_LENGTH) {
                start = this._parseStack.position + MAX_PARSEBUFFER_LENGTH;
            }
        }
        if (this._logService.logLevel <= Services_1.LogLevelEnum.DEBUG) {
            this._logService.debug(`parsing data${typeof data === 'string' ? ` "${data}"` : ` "${Array.prototype.map.call(data, e => String.fromCharCode(e)).join('')}"`}`, typeof data === 'string'
                ? data.split('').map(e => e.charCodeAt(0))
                : data);
        }
        if (this._parseBuffer.length < data.length) {
            if (this._parseBuffer.length < MAX_PARSEBUFFER_LENGTH) {
                this._parseBuffer = new Uint32Array(Math.min(data.length, MAX_PARSEBUFFER_LENGTH));
            }
        }
        if (!wasPaused) {
            this._dirtyRowTracker.clearRange();
        }
        if (data.length > MAX_PARSEBUFFER_LENGTH) {
            for (let i = start; i < data.length; i += MAX_PARSEBUFFER_LENGTH) {
                const end = i + MAX_PARSEBUFFER_LENGTH < data.length ? i + MAX_PARSEBUFFER_LENGTH : data.length;
                const len = (typeof data === 'string')
                    ? this._stringDecoder.decode(data.substring(i, end), this._parseBuffer)
                    : this._utf8Decoder.decode(data.subarray(i, end), this._parseBuffer);
                if (result = this._parser.parse(this._parseBuffer, len)) {
                    this._preserveStack(cursorStartX, cursorStartY, len, i);
                    this._logSlowResolvingAsync(result);
                    return result;
                }
            }
        }
        else {
            if (!wasPaused) {
                const len = (typeof data === 'string')
                    ? this._stringDecoder.decode(data, this._parseBuffer)
                    : this._utf8Decoder.decode(data, this._parseBuffer);
                if (result = this._parser.parse(this._parseBuffer, len)) {
                    this._preserveStack(cursorStartX, cursorStartY, len, 0);
                    this._logSlowResolvingAsync(result);
                    return result;
                }
            }
        }
        if (this._activeBuffer.x !== cursorStartX || this._activeBuffer.y !== cursorStartY) {
            this._onCursorMove.fire();
        }
        const viewportEnd = this._dirtyRowTracker.end + (this._bufferService.buffer.ybase - this._bufferService.buffer.ydisp);
        const viewportStart = this._dirtyRowTracker.start + (this._bufferService.buffer.ybase - this._bufferService.buffer.ydisp);
        if (viewportStart < this._bufferService.rows) {
            this._onRequestRefreshRows.fire(Math.min(viewportStart, this._bufferService.rows - 1), Math.min(viewportEnd, this._bufferService.rows - 1));
        }
    }
    print(data, start, end) {
        let code;
        let chWidth;
        const charset = this._charsetService.charset;
        const screenReaderMode = this._optionsService.rawOptions.screenReaderMode;
        const cols = this._bufferService.cols;
        const wraparoundMode = this._coreService.decPrivateModes.wraparound;
        const insertMode = this._coreService.modes.insertMode;
        const curAttr = this._curAttrData;
        let bufferRow = this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y);
        this._dirtyRowTracker.markDirty(this._activeBuffer.y);
        if (this._activeBuffer.x && end - start > 0 && bufferRow.getWidth(this._activeBuffer.x - 1) === 2) {
            bufferRow.setCellFromCodepoint(this._activeBuffer.x - 1, 0, 1, curAttr);
        }
        let precedingJoinState = this._parser.precedingJoinState;
        for (let pos = start; pos < end; ++pos) {
            code = data[pos];
            if (code < 127 && charset) {
                const ch = charset[String.fromCharCode(code)];
                if (ch) {
                    code = ch.charCodeAt(0);
                }
            }
            const currentInfo = this._unicodeService.charProperties(code, precedingJoinState);
            chWidth = UnicodeService_1.UnicodeService.extractWidth(currentInfo);
            const shouldJoin = UnicodeService_1.UnicodeService.extractShouldJoin(currentInfo);
            const oldWidth = shouldJoin ? UnicodeService_1.UnicodeService.extractWidth(precedingJoinState) : 0;
            precedingJoinState = currentInfo;
            if (screenReaderMode) {
                this._onA11yChar.fire((0, TextDecoder_1.stringFromCodePoint)(code));
            }
            if (this._getCurrentLinkId()) {
                this._oscLinkService.addLineToLink(this._getCurrentLinkId(), this._activeBuffer.ybase + this._activeBuffer.y);
            }
            if (this._activeBuffer.x + chWidth - oldWidth > cols) {
                if (wraparoundMode) {
                    const oldRow = bufferRow;
                    let oldCol = this._activeBuffer.x - oldWidth;
                    this._activeBuffer.x = oldWidth;
                    this._activeBuffer.y++;
                    if (this._activeBuffer.y === this._activeBuffer.scrollBottom + 1) {
                        this._activeBuffer.y--;
                        this._bufferService.scroll(this._eraseAttrData(), true);
                    }
                    else {
                        if (this._activeBuffer.y >= this._bufferService.rows) {
                            this._activeBuffer.y = this._bufferService.rows - 1;
                        }
                        this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y).isWrapped = true;
                    }
                    bufferRow = this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y);
                    if (oldWidth > 0 && bufferRow instanceof BufferLine_1.BufferLine) {
                        bufferRow.copyCellsFrom(oldRow, oldCol, 0, oldWidth, false);
                    }
                    while (oldCol < cols) {
                        oldRow.setCellFromCodepoint(oldCol++, 0, 1, curAttr);
                    }
                }
                else {
                    this._activeBuffer.x = cols - 1;
                    if (chWidth === 2) {
                        continue;
                    }
                }
            }
            if (shouldJoin && this._activeBuffer.x) {
                const offset = bufferRow.getWidth(this._activeBuffer.x - 1) ? 1 : 2;
                bufferRow.addCodepointToCell(this._activeBuffer.x - offset, code, chWidth);
                for (let delta = chWidth - oldWidth; --delta >= 0;) {
                    bufferRow.setCellFromCodepoint(this._activeBuffer.x++, 0, 0, curAttr);
                }
                continue;
            }
            if (insertMode) {
                bufferRow.insertCells(this._activeBuffer.x, chWidth - oldWidth, this._activeBuffer.getNullCell(curAttr));
                if (bufferRow.getWidth(cols - 1) === 2) {
                    bufferRow.setCellFromCodepoint(cols - 1, Constants_1.NULL_CELL_CODE, Constants_1.NULL_CELL_WIDTH, curAttr);
                }
            }
            bufferRow.setCellFromCodepoint(this._activeBuffer.x++, code, chWidth, curAttr);
            if (chWidth > 0) {
                while (--chWidth) {
                    bufferRow.setCellFromCodepoint(this._activeBuffer.x++, 0, 0, curAttr);
                }
            }
        }
        this._parser.precedingJoinState = precedingJoinState;
        if (this._activeBuffer.x < cols && end - start > 0 && bufferRow.getWidth(this._activeBuffer.x) === 0 && !bufferRow.hasContent(this._activeBuffer.x)) {
            bufferRow.setCellFromCodepoint(this._activeBuffer.x, 0, 1, curAttr);
        }
        this._dirtyRowTracker.markDirty(this._activeBuffer.y);
    }
    registerCsiHandler(id, callback) {
        if (id.final === 't' && !id.prefix && !id.intermediates) {
            return this._parser.registerCsiHandler(id, params => {
                if (!paramToWindowOption(params.params[0], this._optionsService.rawOptions.windowOptions)) {
                    return true;
                }
                return callback(params);
            });
        }
        return this._parser.registerCsiHandler(id, callback);
    }
    registerDcsHandler(id, callback) {
        return this._parser.registerDcsHandler(id, new DcsParser_1.DcsHandler(callback));
    }
    registerEscHandler(id, callback) {
        return this._parser.registerEscHandler(id, callback);
    }
    registerOscHandler(ident, callback) {
        return this._parser.registerOscHandler(ident, new OscParser_1.OscHandler(callback));
    }
    bell() {
        this._onRequestBell.fire();
        return true;
    }
    lineFeed() {
        this._dirtyRowTracker.markDirty(this._activeBuffer.y);
        if (this._optionsService.rawOptions.convertEol) {
            this._activeBuffer.x = 0;
        }
        this._activeBuffer.y++;
        if (this._activeBuffer.y === this._activeBuffer.scrollBottom + 1) {
            this._activeBuffer.y--;
            this._bufferService.scroll(this._eraseAttrData());
        }
        else if (this._activeBuffer.y >= this._bufferService.rows) {
            this._activeBuffer.y = this._bufferService.rows - 1;
        }
        else {
            this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y).isWrapped = false;
        }
        if (this._activeBuffer.x >= this._bufferService.cols) {
            this._activeBuffer.x--;
        }
        this._dirtyRowTracker.markDirty(this._activeBuffer.y);
        this._onLineFeed.fire();
        return true;
    }
    carriageReturn() {
        this._activeBuffer.x = 0;
        return true;
    }
    backspace() {
        if (!this._coreService.decPrivateModes.reverseWraparound) {
            this._restrictCursor();
            if (this._activeBuffer.x > 0) {
                this._activeBuffer.x--;
            }
            return true;
        }
        this._restrictCursor(this._bufferService.cols);
        if (this._activeBuffer.x > 0) {
            this._activeBuffer.x--;
        }
        else {
            if (this._activeBuffer.x === 0
                && this._activeBuffer.y > this._activeBuffer.scrollTop
                && this._activeBuffer.y <= this._activeBuffer.scrollBottom
                && this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y)?.isWrapped) {
                this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y).isWrapped = false;
                this._activeBuffer.y--;
                this._activeBuffer.x = this._bufferService.cols - 1;
                const line = this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y);
                if (line.hasWidth(this._activeBuffer.x) && !line.hasContent(this._activeBuffer.x)) {
                    this._activeBuffer.x--;
                }
            }
        }
        this._restrictCursor();
        return true;
    }
    tab() {
        if (this._activeBuffer.x >= this._bufferService.cols) {
            return true;
        }
        const originalX = this._activeBuffer.x;
        this._activeBuffer.x = this._activeBuffer.nextStop();
        if (this._optionsService.rawOptions.screenReaderMode) {
            this._onA11yTab.fire(this._activeBuffer.x - originalX);
        }
        return true;
    }
    shiftOut() {
        this._charsetService.setgLevel(1);
        return true;
    }
    shiftIn() {
        this._charsetService.setgLevel(0);
        return true;
    }
    _restrictCursor(maxCol = this._bufferService.cols - 1) {
        this._activeBuffer.x = Math.min(maxCol, Math.max(0, this._activeBuffer.x));
        this._activeBuffer.y = this._coreService.decPrivateModes.origin
            ? Math.min(this._activeBuffer.scrollBottom, Math.max(this._activeBuffer.scrollTop, this._activeBuffer.y))
            : Math.min(this._bufferService.rows - 1, Math.max(0, this._activeBuffer.y));
        this._dirtyRowTracker.markDirty(this._activeBuffer.y);
    }
    _setCursor(x, y) {
        this._dirtyRowTracker.markDirty(this._activeBuffer.y);
        if (this._coreService.decPrivateModes.origin) {
            this._activeBuffer.x = x;
            this._activeBuffer.y = this._activeBuffer.scrollTop + y;
        }
        else {
            this._activeBuffer.x = x;
            this._activeBuffer.y = y;
        }
        this._restrictCursor();
        this._dirtyRowTracker.markDirty(this._activeBuffer.y);
    }
    _moveCursor(x, y) {
        this._restrictCursor();
        this._setCursor(this._activeBuffer.x + x, this._activeBuffer.y + y);
    }
    cursorUp(params) {
        const diffToTop = this._activeBuffer.y - this._activeBuffer.scrollTop;
        if (diffToTop >= 0) {
            this._moveCursor(0, -Math.min(diffToTop, params.params[0] || 1));
        }
        else {
            this._moveCursor(0, -(params.params[0] || 1));
        }
        return true;
    }
    cursorDown(params) {
        const diffToBottom = this._activeBuffer.scrollBottom - this._activeBuffer.y;
        if (diffToBottom >= 0) {
            this._moveCursor(0, Math.min(diffToBottom, params.params[0] || 1));
        }
        else {
            this._moveCursor(0, params.params[0] || 1);
        }
        return true;
    }
    cursorForward(params) {
        this._moveCursor(params.params[0] || 1, 0);
        return true;
    }
    cursorBackward(params) {
        this._moveCursor(-(params.params[0] || 1), 0);
        return true;
    }
    cursorNextLine(params) {
        this.cursorDown(params);
        this._activeBuffer.x = 0;
        return true;
    }
    cursorPrecedingLine(params) {
        this.cursorUp(params);
        this._activeBuffer.x = 0;
        return true;
    }
    cursorCharAbsolute(params) {
        this._setCursor((params.params[0] || 1) - 1, this._activeBuffer.y);
        return true;
    }
    cursorPosition(params) {
        this._setCursor((params.length >= 2) ? (params.params[1] || 1) - 1 : 0, (params.params[0] || 1) - 1);
        return true;
    }
    charPosAbsolute(params) {
        this._setCursor((params.params[0] || 1) - 1, this._activeBuffer.y);
        return true;
    }
    hPositionRelative(params) {
        this._moveCursor(params.params[0] || 1, 0);
        return true;
    }
    linePosAbsolute(params) {
        this._setCursor(this._activeBuffer.x, (params.params[0] || 1) - 1);
        return true;
    }
    vPositionRelative(params) {
        this._moveCursor(0, params.params[0] || 1);
        return true;
    }
    hVPosition(params) {
        this.cursorPosition(params);
        return true;
    }
    tabClear(params) {
        const param = params.params[0];
        if (param === 0) {
            delete this._activeBuffer.tabs[this._activeBuffer.x];
        }
        else if (param === 3) {
            this._activeBuffer.tabs = {};
        }
        return true;
    }
    cursorForwardTab(params) {
        if (this._activeBuffer.x >= this._bufferService.cols) {
            return true;
        }
        let param = params.params[0] || 1;
        while (param--) {
            this._activeBuffer.x = this._activeBuffer.nextStop();
        }
        return true;
    }
    cursorBackwardTab(params) {
        if (this._activeBuffer.x >= this._bufferService.cols) {
            return true;
        }
        let param = params.params[0] || 1;
        while (param--) {
            this._activeBuffer.x = this._activeBuffer.prevStop();
        }
        return true;
    }
    selectProtected(params) {
        const p = params.params[0];
        if (p === 1)
            this._curAttrData.bg |= 536870912;
        if (p === 2 || p === 0)
            this._curAttrData.bg &= ~536870912;
        return true;
    }
    _eraseInBufferLine(y, start, end, clearWrap = false, respectProtect = false) {
        const line = this._activeBuffer.lines.get(this._activeBuffer.ybase + y);
        line.replaceCells(start, end, this._activeBuffer.getNullCell(this._eraseAttrData()), respectProtect);
        if (clearWrap) {
            line.isWrapped = false;
        }
    }
    _resetBufferLine(y, respectProtect = false) {
        const line = this._activeBuffer.lines.get(this._activeBuffer.ybase + y);
        if (line) {
            line.fill(this._activeBuffer.getNullCell(this._eraseAttrData()), respectProtect);
            this._bufferService.buffer.clearMarkers(this._activeBuffer.ybase + y);
            line.isWrapped = false;
        }
    }
    eraseInDisplay(params, respectProtect = false) {
        this._restrictCursor(this._bufferService.cols);
        let j;
        switch (params.params[0]) {
            case 0:
                j = this._activeBuffer.y;
                this._dirtyRowTracker.markDirty(j);
                this._eraseInBufferLine(j++, this._activeBuffer.x, this._bufferService.cols, this._activeBuffer.x === 0, respectProtect);
                for (; j < this._bufferService.rows; j++) {
                    this._resetBufferLine(j, respectProtect);
                }
                this._dirtyRowTracker.markDirty(j);
                break;
            case 1:
                j = this._activeBuffer.y;
                this._dirtyRowTracker.markDirty(j);
                this._eraseInBufferLine(j, 0, this._activeBuffer.x + 1, true, respectProtect);
                if (this._activeBuffer.x + 1 >= this._bufferService.cols) {
                    this._activeBuffer.lines.get(j + 1).isWrapped = false;
                }
                while (j--) {
                    this._resetBufferLine(j, respectProtect);
                }
                this._dirtyRowTracker.markDirty(0);
                break;
            case 2:
                j = this._bufferService.rows;
                this._dirtyRowTracker.markDirty(j - 1);
                while (j--) {
                    this._resetBufferLine(j, respectProtect);
                }
                this._dirtyRowTracker.markDirty(0);
                break;
            case 3:
                const scrollBackSize = this._activeBuffer.lines.length - this._bufferService.rows;
                if (scrollBackSize > 0) {
                    this._activeBuffer.lines.trimStart(scrollBackSize);
                    this._activeBuffer.ybase = Math.max(this._activeBuffer.ybase - scrollBackSize, 0);
                    this._activeBuffer.ydisp = Math.max(this._activeBuffer.ydisp - scrollBackSize, 0);
                    this._onScroll.fire(0);
                }
                break;
        }
        return true;
    }
    eraseInLine(params, respectProtect = false) {
        this._restrictCursor(this._bufferService.cols);
        switch (params.params[0]) {
            case 0:
                this._eraseInBufferLine(this._activeBuffer.y, this._activeBuffer.x, this._bufferService.cols, this._activeBuffer.x === 0, respectProtect);
                break;
            case 1:
                this._eraseInBufferLine(this._activeBuffer.y, 0, this._activeBuffer.x + 1, false, respectProtect);
                break;
            case 2:
                this._eraseInBufferLine(this._activeBuffer.y, 0, this._bufferService.cols, true, respectProtect);
                break;
        }
        this._dirtyRowTracker.markDirty(this._activeBuffer.y);
        return true;
    }
    insertLines(params) {
        this._restrictCursor();
        let param = params.params[0] || 1;
        if (this._activeBuffer.y > this._activeBuffer.scrollBottom || this._activeBuffer.y < this._activeBuffer.scrollTop) {
            return true;
        }
        const row = this._activeBuffer.ybase + this._activeBuffer.y;
        const scrollBottomRowsOffset = this._bufferService.rows - 1 - this._activeBuffer.scrollBottom;
        const scrollBottomAbsolute = this._bufferService.rows - 1 + this._activeBuffer.ybase - scrollBottomRowsOffset + 1;
        while (param--) {
            this._activeBuffer.lines.splice(scrollBottomAbsolute - 1, 1);
            this._activeBuffer.lines.splice(row, 0, this._activeBuffer.getBlankLine(this._eraseAttrData()));
        }
        this._dirtyRowTracker.markRangeDirty(this._activeBuffer.y, this._activeBuffer.scrollBottom);
        this._activeBuffer.x = 0;
        return true;
    }
    deleteLines(params) {
        this._restrictCursor();
        let param = params.params[0] || 1;
        if (this._activeBuffer.y > this._activeBuffer.scrollBottom || this._activeBuffer.y < this._activeBuffer.scrollTop) {
            return true;
        }
        const row = this._activeBuffer.ybase + this._activeBuffer.y;
        let j;
        j = this._bufferService.rows - 1 - this._activeBuffer.scrollBottom;
        j = this._bufferService.rows - 1 + this._activeBuffer.ybase - j;
        while (param--) {
            this._activeBuffer.lines.splice(row, 1);
            this._activeBuffer.lines.splice(j, 0, this._activeBuffer.getBlankLine(this._eraseAttrData()));
        }
        this._dirtyRowTracker.markRangeDirty(this._activeBuffer.y, this._activeBuffer.scrollBottom);
        this._activeBuffer.x = 0;
        return true;
    }
    insertChars(params) {
        this._restrictCursor();
        const line = this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y);
        if (line) {
            line.insertCells(this._activeBuffer.x, params.params[0] || 1, this._activeBuffer.getNullCell(this._eraseAttrData()));
            this._dirtyRowTracker.markDirty(this._activeBuffer.y);
        }
        return true;
    }
    deleteChars(params) {
        this._restrictCursor();
        const line = this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y);
        if (line) {
            line.deleteCells(this._activeBuffer.x, params.params[0] || 1, this._activeBuffer.getNullCell(this._eraseAttrData()));
            this._dirtyRowTracker.markDirty(this._activeBuffer.y);
        }
        return true;
    }
    scrollUp(params) {
        let param = params.params[0] || 1;
        while (param--) {
            this._activeBuffer.lines.splice(this._activeBuffer.ybase + this._activeBuffer.scrollTop, 1);
            this._activeBuffer.lines.splice(this._activeBuffer.ybase + this._activeBuffer.scrollBottom, 0, this._activeBuffer.getBlankLine(this._eraseAttrData()));
        }
        this._dirtyRowTracker.markRangeDirty(this._activeBuffer.scrollTop, this._activeBuffer.scrollBottom);
        return true;
    }
    scrollDown(params) {
        let param = params.params[0] || 1;
        while (param--) {
            this._activeBuffer.lines.splice(this._activeBuffer.ybase + this._activeBuffer.scrollBottom, 1);
            this._activeBuffer.lines.splice(this._activeBuffer.ybase + this._activeBuffer.scrollTop, 0, this._activeBuffer.getBlankLine(BufferLine_1.DEFAULT_ATTR_DATA));
        }
        this._dirtyRowTracker.markRangeDirty(this._activeBuffer.scrollTop, this._activeBuffer.scrollBottom);
        return true;
    }
    scrollLeft(params) {
        if (this._activeBuffer.y > this._activeBuffer.scrollBottom || this._activeBuffer.y < this._activeBuffer.scrollTop) {
            return true;
        }
        const param = params.params[0] || 1;
        for (let y = this._activeBuffer.scrollTop; y <= this._activeBuffer.scrollBottom; ++y) {
            const line = this._activeBuffer.lines.get(this._activeBuffer.ybase + y);
            line.deleteCells(0, param, this._activeBuffer.getNullCell(this._eraseAttrData()));
            line.isWrapped = false;
        }
        this._dirtyRowTracker.markRangeDirty(this._activeBuffer.scrollTop, this._activeBuffer.scrollBottom);
        return true;
    }
    scrollRight(params) {
        if (this._activeBuffer.y > this._activeBuffer.scrollBottom || this._activeBuffer.y < this._activeBuffer.scrollTop) {
            return true;
        }
        const param = params.params[0] || 1;
        for (let y = this._activeBuffer.scrollTop; y <= this._activeBuffer.scrollBottom; ++y) {
            const line = this._activeBuffer.lines.get(this._activeBuffer.ybase + y);
            line.insertCells(0, param, this._activeBuffer.getNullCell(this._eraseAttrData()));
            line.isWrapped = false;
        }
        this._dirtyRowTracker.markRangeDirty(this._activeBuffer.scrollTop, this._activeBuffer.scrollBottom);
        return true;
    }
    insertColumns(params) {
        if (this._activeBuffer.y > this._activeBuffer.scrollBottom || this._activeBuffer.y < this._activeBuffer.scrollTop) {
            return true;
        }
        const param = params.params[0] || 1;
        for (let y = this._activeBuffer.scrollTop; y <= this._activeBuffer.scrollBottom; ++y) {
            const line = this._activeBuffer.lines.get(this._activeBuffer.ybase + y);
            line.insertCells(this._activeBuffer.x, param, this._activeBuffer.getNullCell(this._eraseAttrData()));
            line.isWrapped = false;
        }
        this._dirtyRowTracker.markRangeDirty(this._activeBuffer.scrollTop, this._activeBuffer.scrollBottom);
        return true;
    }
    deleteColumns(params) {
        if (this._activeBuffer.y > this._activeBuffer.scrollBottom || this._activeBuffer.y < this._activeBuffer.scrollTop) {
            return true;
        }
        const param = params.params[0] || 1;
        for (let y = this._activeBuffer.scrollTop; y <= this._activeBuffer.scrollBottom; ++y) {
            const line = this._activeBuffer.lines.get(this._activeBuffer.ybase + y);
            line.deleteCells(this._activeBuffer.x, param, this._activeBuffer.getNullCell(this._eraseAttrData()));
            line.isWrapped = false;
        }
        this._dirtyRowTracker.markRangeDirty(this._activeBuffer.scrollTop, this._activeBuffer.scrollBottom);
        return true;
    }
    eraseChars(params) {
        this._restrictCursor();
        const line = this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y);
        if (line) {
            line.replaceCells(this._activeBuffer.x, this._activeBuffer.x + (params.params[0] || 1), this._activeBuffer.getNullCell(this._eraseAttrData()));
            this._dirtyRowTracker.markDirty(this._activeBuffer.y);
        }
        return true;
    }
    repeatPrecedingCharacter(params) {
        const joinState = this._parser.precedingJoinState;
        if (!joinState) {
            return true;
        }
        const length = params.params[0] || 1;
        const chWidth = UnicodeService_1.UnicodeService.extractWidth(joinState);
        const x = this._activeBuffer.x - chWidth;
        const bufferRow = this._activeBuffer.lines.get(this._activeBuffer.ybase + this._activeBuffer.y);
        const text = bufferRow.getString(x);
        const data = new Uint32Array(text.length * length);
        let idata = 0;
        for (let itext = 0; itext < text.length;) {
            const ch = text.codePointAt(itext) || 0;
            data[idata++] = ch;
            itext += ch > 0xffff ? 2 : 1;
        }
        let tlength = idata;
        for (let i = 1; i < length; ++i) {
            data.copyWithin(tlength, 0, idata);
            tlength += idata;
        }
        this.print(data, 0, tlength);
        return true;
    }
    sendDeviceAttributesPrimary(params) {
        if (params.params[0] > 0) {
            return true;
        }
        if (this._is('xterm') || this._is('rxvt-unicode') || this._is('screen')) {
            this._coreService.triggerDataEvent(EscapeSequences_1.C0.ESC + '[?1;2c');
        }
        else if (this._is('linux')) {
            this._coreService.triggerDataEvent(EscapeSequences_1.C0.ESC + '[?6c');
        }
        return true;
    }
    sendDeviceAttributesSecondary(params) {
        if (params.params[0] > 0) {
            return true;
        }
        if (this._is('xterm')) {
            this._coreService.triggerDataEvent(EscapeSequences_1.C0.ESC + '[>0;276;0c');
        }
        else if (this._is('rxvt-unicode')) {
            this._coreService.triggerDataEvent(EscapeSequences_1.C0.ESC + '[>85;95;0c');
        }
        else if (this._is('linux')) {
            this._coreService.triggerDataEvent(params.params[0] + 'c');
        }
        else if (this._is('screen')) {
            this._coreService.triggerDataEvent(EscapeSequences_1.C0.ESC + '[>83;40003;0c');
        }
        return true;
    }
    _is(term) {
        return (this._optionsService.rawOptions.termName + '').indexOf(term) === 0;
    }
    setMode(params) {
        for (let i = 0; i < params.length; i++) {
            switch (params.params[i]) {
                case 4:
                    this._coreService.modes.insertMode = true;
                    break;
                case 20:
                    this._optionsService.options.convertEol = true;
                    break;
            }
        }
        return true;
    }
    setModePrivate(params) {
        for (let i = 0; i < params.length; i++) {
            switch (params.params[i]) {
                case 1:
                    this._coreService.decPrivateModes.applicationCursorKeys = true;
                    break;
                case 2:
                    this._charsetService.setgCharset(0, Charsets_1.DEFAULT_CHARSET);
                    this._charsetService.setgCharset(1, Charsets_1.DEFAULT_CHARSET);
                    this._charsetService.setgCharset(2, Charsets_1.DEFAULT_CHARSET);
                    this._charsetService.setgCharset(3, Charsets_1.DEFAULT_CHARSET);
                    break;
                case 3:
                    if (this._optionsService.rawOptions.windowOptions.setWinLines) {
                        this._bufferService.resize(132, this._bufferService.rows);
                        this._onRequestReset.fire();
                    }
                    break;
                case 6:
                    this._coreService.decPrivateModes.origin = true;
                    this._setCursor(0, 0);
                    break;
                case 7:
                    this._coreService.decPrivateModes.wraparound = true;
                    break;
                case 12:
                    this._optionsService.options.cursorBlink = true;
                    break;
                case 45:
                    this._coreService.decPrivateModes.reverseWraparound = true;
                    break;
                case 66:
                    this._logService.debug('Serial port requested application keypad.');
                    this._coreService.decPrivateModes.applicationKeypad = true;
                    this._onRequestSyncScrollBar.fire();
                    break;
                case 9:
                    this._coreMouseService.activeProtocol = 'X10';
                    break;
                case 1000:
                    this._coreMouseService.activeProtocol = 'VT200';
                    break;
                case 1002:
                    this._coreMouseService.activeProtocol = 'DRAG';
                    break;
                case 1003:
                    this._coreMouseService.activeProtocol = 'ANY';
                    break;
                case 1004:
                    this._coreService.decPrivateModes.sendFocus = true;
                    this._onRequestSendFocus.fire();
                    break;
                case 1005:
                    this._logService.debug('DECSET 1005 not supported (see #2507)');
                    break;
                case 1006:
                    this._coreMouseService.activeEncoding = 'SGR';
                    break;
                case 1015:
                    this._logService.debug('DECSET 1015 not supported (see #2507)');
                    break;
                case 1016:
                    this._coreMouseService.activeEncoding = 'SGR_PIXELS';
                    break;
                case 25:
                    this._coreService.isCursorHidden = false;
                    break;
                case 1048:
                    this.saveCursor();
                    break;
                case 1049:
                    this.saveCursor();
                case 47:
                case 1047:
                    this._bufferService.buffers.activateAltBuffer(this._eraseAttrData());
                    this._coreService.isCursorInitialized = true;
                    this._onRequestRefreshRows.fire(0, this._bufferService.rows - 1);
                    this._onRequestSyncScrollBar.fire();
                    break;
                case 2004:
                    this._coreService.decPrivateModes.bracketedPasteMode = true;
                    break;
            }
        }
        return true;
    }
    resetMode(params) {
        for (let i = 0; i < params.length; i++) {
            switch (params.params[i]) {
                case 4:
                    this._coreService.modes.insertMode = false;
                    break;
                case 20:
                    this._optionsService.options.convertEol = false;
                    break;
            }
        }
        return true;
    }
    resetModePrivate(params) {
        for (let i = 0; i < params.length; i++) {
            switch (params.params[i]) {
                case 1:
                    this._coreService.decPrivateModes.applicationCursorKeys = false;
                    break;
                case 3:
                    if (this._optionsService.rawOptions.windowOptions.setWinLines) {
                        this._bufferService.resize(80, this._bufferService.rows);
                        this._onRequestReset.fire();
                    }
                    break;
                case 6:
                    this._coreService.decPrivateModes.origin = false;
                    this._setCursor(0, 0);
                    break;
                case 7:
                    this._coreService.decPrivateModes.wraparound = false;
                    break;
                case 12:
                    this._optionsService.options.cursorBlink = false;
                    break;
                case 45:
                    this._coreService.decPrivateModes.reverseWraparound = false;
                    break;
                case 66:
                    this._logService.debug('Switching back to normal keypad.');
                    this._coreService.decPrivateModes.applicationKeypad = false;
                    this._onRequestSyncScrollBar.fire();
                    break;
                case 9:
                case 1000:
                case 1002:
                case 1003:
                    this._coreMouseService.activeProtocol = 'NONE';
                    break;
                case 1004:
                    this._coreService.decPrivateModes.sendFocus = false;
                    break;
                case 1005:
                    this._logService.debug('DECRST 1005 not supported (see #2507)');
                    break;
                case 1006:
                    this._coreMouseService.activeEncoding = 'DEFAULT';
                    break;
                case 1015:
                    this._logService.debug('DECRST 1015 not supported (see #2507)');
                    break;
                case 1016:
                    this._coreMouseService.activeEncoding = 'DEFAULT';
                    break;
                case 25:
                    this._coreService.isCursorHidden = true;
                    break;
                case 1048:
                    this.restoreCursor();
                    break;
                case 1049:
                case 47:
                case 1047:
                    this._bufferService.buffers.activateNormalBuffer();
                    if (params.params[i] === 1049) {
                        this.restoreCursor();
                    }
                    this._coreService.isCursorInitialized = true;
                    this._onRequestRefreshRows.fire(0, this._bufferService.rows - 1);
                    this._onRequestSyncScrollBar.fire();
                    break;
                case 2004:
                    this._coreService.decPrivateModes.bracketedPasteMode = false;
                    break;
            }
        }
        return true;
    }
    requestMode(params, ansi) {
        const dm = this._coreService.decPrivateModes;
        const { activeProtocol: mouseProtocol, activeEncoding: mouseEncoding } = this._coreMouseService;
        const cs = this._coreService;
        const { buffers, cols } = this._bufferService;
        const { active, alt } = buffers;
        const opts = this._optionsService.rawOptions;
        const f = (m, v) => {
            cs.triggerDataEvent(`${EscapeSequences_1.C0.ESC}[${ansi ? '' : '?'}${m};${v}$y`);
            return true;
        };
        const b2v = (value) => value ? 1 : 2;
        const p = params.params[0];
        if (ansi) {
            if (p === 2)
                return f(p, 4);
            if (p === 4)
                return f(p, b2v(cs.modes.insertMode));
            if (p === 12)
                return f(p, 3);
            if (p === 20)
                return f(p, b2v(opts.convertEol));
            return f(p, 0);
        }
        if (p === 1)
            return f(p, b2v(dm.applicationCursorKeys));
        if (p === 3)
            return f(p, opts.windowOptions.setWinLines ? (cols === 80 ? 2 : cols === 132 ? 1 : 0) : 0);
        if (p === 6)
            return f(p, b2v(dm.origin));
        if (p === 7)
            return f(p, b2v(dm.wraparound));
        if (p === 8)
            return f(p, 3);
        if (p === 9)
            return f(p, b2v(mouseProtocol === 'X10'));
        if (p === 12)
            return f(p, b2v(opts.cursorBlink));
        if (p === 25)
            return f(p, b2v(!cs.isCursorHidden));
        if (p === 45)
            return f(p, b2v(dm.reverseWraparound));
        if (p === 66)
            return f(p, b2v(dm.applicationKeypad));
        if (p === 67)
            return f(p, 4);
        if (p === 1000)
            return f(p, b2v(mouseProtocol === 'VT200'));
        if (p === 1002)
            return f(p, b2v(mouseProtocol === 'DRAG'));
        if (p === 1003)
            return f(p, b2v(mouseProtocol === 'ANY'));
        if (p === 1004)
            return f(p, b2v(dm.sendFocus));
        if (p === 1005)
            return f(p, 4);
        if (p === 1006)
            return f(p, b2v(mouseEncoding === 'SGR'));
        if (p === 1015)
            return f(p, 4);
        if (p === 1016)
            return f(p, b2v(mouseEncoding === 'SGR_PIXELS'));
        if (p === 1048)
            return f(p, 1);
        if (p === 47 || p === 1047 || p === 1049)
            return f(p, b2v(active === alt));
        if (p === 2004)
            return f(p, b2v(dm.bracketedPasteMode));
        return f(p, 0);
    }
    _updateAttrColor(color, mode, c1, c2, c3) {
        if (mode === 2) {
            color |= 50331648;
            color &= ~16777215;
            color |= AttributeData_1.AttributeData.fromColorRGB([c1, c2, c3]);
        }
        else if (mode === 5) {
            color &= ~(50331648 | 255);
            color |= 33554432 | (c1 & 0xff);
        }
        return color;
    }
    _extractColor(params, pos, attr) {
        const accu = [0, 0, -1, 0, 0, 0];
        let cSpace = 0;
        let advance = 0;
        do {
            accu[advance + cSpace] = params.params[pos + advance];
            if (params.hasSubParams(pos + advance)) {
                const subparams = params.getSubParams(pos + advance);
                let i = 0;
                do {
                    if (accu[1] === 5) {
                        cSpace = 1;
                    }
                    accu[advance + i + 1 + cSpace] = subparams[i];
                } while (++i < subparams.length && i + advance + 1 + cSpace < accu.length);
                break;
            }
            if ((accu[1] === 5 && advance + cSpace >= 2)
                || (accu[1] === 2 && advance + cSpace >= 5)) {
                break;
            }
            if (accu[1]) {
                cSpace = 1;
            }
        } while (++advance + pos < params.length && advance + cSpace < accu.length);
        for (let i = 2; i < accu.length; ++i) {
            if (accu[i] === -1) {
                accu[i] = 0;
            }
        }
        switch (accu[0]) {
            case 38:
                attr.fg = this._updateAttrColor(attr.fg, accu[1], accu[3], accu[4], accu[5]);
                break;
            case 48:
                attr.bg = this._updateAttrColor(attr.bg, accu[1], accu[3], accu[4], accu[5]);
                break;
            case 58:
                attr.extended = attr.extended.clone();
                attr.extended.underlineColor = this._updateAttrColor(attr.extended.underlineColor, accu[1], accu[3], accu[4], accu[5]);
        }
        return advance;
    }
    _processUnderline(style, attr) {
        attr.extended = attr.extended.clone();
        if (!~style || style > 5) {
            style = 1;
        }
        attr.extended.underlineStyle = style;
        attr.fg |= 268435456;
        if (style === 0) {
            attr.fg &= ~268435456;
        }
        attr.updateExtended();
    }
    _processSGR0(attr) {
        attr.fg = BufferLine_1.DEFAULT_ATTR_DATA.fg;
        attr.bg = BufferLine_1.DEFAULT_ATTR_DATA.bg;
        attr.extended = attr.extended.clone();
        attr.extended.underlineStyle = 0;
        attr.extended.underlineColor &= ~(50331648 | 16777215);
        attr.updateExtended();
    }
    charAttributes(params) {
        if (params.length === 1 && params.params[0] === 0) {
            this._processSGR0(this._curAttrData);
            return true;
        }
        const l = params.length;
        let p;
        const attr = this._curAttrData;
        for (let i = 0; i < l; i++) {
            p = params.params[i];
            if (p >= 30 && p <= 37) {
                attr.fg &= ~(50331648 | 255);
                attr.fg |= 16777216 | (p - 30);
            }
            else if (p >= 40 && p <= 47) {
                attr.bg &= ~(50331648 | 255);
                attr.bg |= 16777216 | (p - 40);
            }
            else if (p >= 90 && p <= 97) {
                attr.fg &= ~(50331648 | 255);
                attr.fg |= 16777216 | (p - 90) | 8;
            }
            else if (p >= 100 && p <= 107) {
                attr.bg &= ~(50331648 | 255);
                attr.bg |= 16777216 | (p - 100) | 8;
            }
            else if (p === 0) {
                this._processSGR0(attr);
            }
            else if (p === 1) {
                attr.fg |= 134217728;
            }
            else if (p === 3) {
                attr.bg |= 67108864;
            }
            else if (p === 4) {
                attr.fg |= 268435456;
                this._processUnderline(params.hasSubParams(i) ? params.getSubParams(i)[0] : 1, attr);
            }
            else if (p === 5) {
                attr.fg |= 536870912;
            }
            else if (p === 7) {
                attr.fg |= 67108864;
            }
            else if (p === 8) {
                attr.fg |= 1073741824;
            }
            else if (p === 9) {
                attr.fg |= 2147483648;
            }
            else if (p === 2) {
                attr.bg |= 134217728;
            }
            else if (p === 21) {
                this._processUnderline(2, attr);
            }
            else if (p === 22) {
                attr.fg &= ~134217728;
                attr.bg &= ~134217728;
            }
            else if (p === 23) {
                attr.bg &= ~67108864;
            }
            else if (p === 24) {
                attr.fg &= ~268435456;
                this._processUnderline(0, attr);
            }
            else if (p === 25) {
                attr.fg &= ~536870912;
            }
            else if (p === 27) {
                attr.fg &= ~67108864;
            }
            else if (p === 28) {
                attr.fg &= ~1073741824;
            }
            else if (p === 29) {
                attr.fg &= ~2147483648;
            }
            else if (p === 39) {
                attr.fg &= ~(50331648 | 16777215);
                attr.fg |= BufferLine_1.DEFAULT_ATTR_DATA.fg & (255 | 16777215);
            }
            else if (p === 49) {
                attr.bg &= ~(50331648 | 16777215);
                attr.bg |= BufferLine_1.DEFAULT_ATTR_DATA.bg & (255 | 16777215);
            }
            else if (p === 38 || p === 48 || p === 58) {
                i += this._extractColor(params, i, attr);
            }
            else if (p === 53) {
                attr.bg |= 1073741824;
            }
            else if (p === 55) {
                attr.bg &= ~1073741824;
            }
            else if (p === 59) {
                attr.extended = attr.extended.clone();
                attr.extended.underlineColor = -1;
                attr.updateExtended();
            }
            else if (p === 100) {
                attr.fg &= ~(50331648 | 16777215);
                attr.fg |= BufferLine_1.DEFAULT_ATTR_DATA.fg & (255 | 16777215);
                attr.bg &= ~(50331648 | 16777215);
                attr.bg |= BufferLine_1.DEFAULT_ATTR_DATA.bg & (255 | 16777215);
            }
            else {
                this._logService.debug('Unknown SGR attribute: %d.', p);
            }
        }
        return true;
    }
    deviceStatus(params) {
        switch (params.params[0]) {
            case 5:
                this._coreService.triggerDataEvent(`${EscapeSequences_1.C0.ESC}[0n`);
                break;
            case 6:
                const y = this._activeBuffer.y + 1;
                const x = this._activeBuffer.x + 1;
                this._coreService.triggerDataEvent(`${EscapeSequences_1.C0.ESC}[${y};${x}R`);
                break;
        }
        return true;
    }
    deviceStatusPrivate(params) {
        switch (params.params[0]) {
            case 6:
                const y = this._activeBuffer.y + 1;
                const x = this._activeBuffer.x + 1;
                this._coreService.triggerDataEvent(`${EscapeSequences_1.C0.ESC}[?${y};${x}R`);
                break;
            case 15:
                break;
            case 25:
                break;
            case 26:
                break;
            case 53:
                break;
        }
        return true;
    }
    softReset(params) {
        this._coreService.isCursorHidden = false;
        this._onRequestSyncScrollBar.fire();
        this._activeBuffer.scrollTop = 0;
        this._activeBuffer.scrollBottom = this._bufferService.rows - 1;
        this._curAttrData = BufferLine_1.DEFAULT_ATTR_DATA.clone();
        this._coreService.reset();
        this._charsetService.reset();
        this._activeBuffer.savedX = 0;
        this._activeBuffer.savedY = this._activeBuffer.ybase;
        this._activeBuffer.savedCurAttrData.fg = this._curAttrData.fg;
        this._activeBuffer.savedCurAttrData.bg = this._curAttrData.bg;
        this._activeBuffer.savedCharset = this._charsetService.charset;
        this._coreService.decPrivateModes.origin = false;
        return true;
    }
    setCursorStyle(params) {
        const param = params.params[0] || 1;
        switch (param) {
            case 1:
            case 2:
                this._optionsService.options.cursorStyle = 'block';
                break;
            case 3:
            case 4:
                this._optionsService.options.cursorStyle = 'underline';
                break;
            case 5:
            case 6:
                this._optionsService.options.cursorStyle = 'bar';
                break;
        }
        const isBlinking = param % 2 === 1;
        this._optionsService.options.cursorBlink = isBlinking;
        return true;
    }
    setScrollRegion(params) {
        const top = params.params[0] || 1;
        let bottom;
        if (params.length < 2 || (bottom = params.params[1]) > this._bufferService.rows || bottom === 0) {
            bottom = this._bufferService.rows;
        }
        if (bottom > top) {
            this._activeBuffer.scrollTop = top - 1;
            this._activeBuffer.scrollBottom = bottom - 1;
            this._setCursor(0, 0);
        }
        return true;
    }
    windowOptions(params) {
        if (!paramToWindowOption(params.params[0], this._optionsService.rawOptions.windowOptions)) {
            return true;
        }
        const second = (params.length > 1) ? params.params[1] : 0;
        switch (params.params[0]) {
            case 14:
                if (second !== 2) {
                    this._onRequestWindowsOptionsReport.fire(WindowsOptionsReportType.GET_WIN_SIZE_PIXELS);
                }
                break;
            case 16:
                this._onRequestWindowsOptionsReport.fire(WindowsOptionsReportType.GET_CELL_SIZE_PIXELS);
                break;
            case 18:
                if (this._bufferService) {
                    this._coreService.triggerDataEvent(`${EscapeSequences_1.C0.ESC}[8;${this._bufferService.rows};${this._bufferService.cols}t`);
                }
                break;
            case 22:
                if (second === 0 || second === 2) {
                    this._windowTitleStack.push(this._windowTitle);
                    if (this._windowTitleStack.length > STACK_LIMIT) {
                        this._windowTitleStack.shift();
                    }
                }
                if (second === 0 || second === 1) {
                    this._iconNameStack.push(this._iconName);
                    if (this._iconNameStack.length > STACK_LIMIT) {
                        this._iconNameStack.shift();
                    }
                }
                break;
            case 23:
                if (second === 0 || second === 2) {
                    if (this._windowTitleStack.length) {
                        this.setTitle(this._windowTitleStack.pop());
                    }
                }
                if (second === 0 || second === 1) {
                    if (this._iconNameStack.length) {
                        this.setIconName(this._iconNameStack.pop());
                    }
                }
                break;
        }
        return true;
    }
    saveCursor(params) {
        this._activeBuffer.savedX = this._activeBuffer.x;
        this._activeBuffer.savedY = this._activeBuffer.ybase + this._activeBuffer.y;
        this._activeBuffer.savedCurAttrData.fg = this._curAttrData.fg;
        this._activeBuffer.savedCurAttrData.bg = this._curAttrData.bg;
        this._activeBuffer.savedCharset = this._charsetService.charset;
        return true;
    }
    restoreCursor(params) {
        this._activeBuffer.x = this._activeBuffer.savedX || 0;
        this._activeBuffer.y = Math.max(this._activeBuffer.savedY - this._activeBuffer.ybase, 0);
        this._curAttrData.fg = this._activeBuffer.savedCurAttrData.fg;
        this._curAttrData.bg = this._activeBuffer.savedCurAttrData.bg;
        this._charsetService.charset = this._savedCharset;
        if (this._activeBuffer.savedCharset) {
            this._charsetService.charset = this._activeBuffer.savedCharset;
        }
        this._restrictCursor();
        return true;
    }
    setTitle(data) {
        this._windowTitle = data;
        this._onTitleChange.fire(data);
        return true;
    }
    setIconName(data) {
        this._iconName = data;
        return true;
    }
    setOrReportIndexedColor(data) {
        const event = [];
        const slots = data.split(';');
        while (slots.length > 1) {
            const idx = slots.shift();
            const spec = slots.shift();
            if (/^\d+$/.exec(idx)) {
                const index = parseInt(idx);
                if (isValidColorIndex(index)) {
                    if (spec === '?') {
                        event.push({ type: 0, index });
                    }
                    else {
                        const color = (0, XParseColor_1.parseColor)(spec);
                        if (color) {
                            event.push({ type: 1, index, color });
                        }
                    }
                }
            }
        }
        if (event.length) {
            this._onColor.fire(event);
        }
        return true;
    }
    setHyperlink(data) {
        const args = data.split(';');
        if (args.length < 2) {
            return false;
        }
        if (args[1]) {
            return this._createHyperlink(args[0], args[1]);
        }
        if (args[0].trim()) {
            return false;
        }
        return this._finishHyperlink();
    }
    _createHyperlink(params, uri) {
        if (this._getCurrentLinkId()) {
            this._finishHyperlink();
        }
        const parsedParams = params.split(':');
        let id;
        const idParamIndex = parsedParams.findIndex(e => e.startsWith('id='));
        if (idParamIndex !== -1) {
            id = parsedParams[idParamIndex].slice(3) || undefined;
        }
        this._curAttrData.extended = this._curAttrData.extended.clone();
        this._curAttrData.extended.urlId = this._oscLinkService.registerLink({ id, uri });
        this._curAttrData.updateExtended();
        return true;
    }
    _finishHyperlink() {
        this._curAttrData.extended = this._curAttrData.extended.clone();
        this._curAttrData.extended.urlId = 0;
        this._curAttrData.updateExtended();
        return true;
    }
    _setOrReportSpecialColor(data, offset) {
        const slots = data.split(';');
        for (let i = 0; i < slots.length; ++i, ++offset) {
            if (offset >= this._specialColors.length)
                break;
            if (slots[i] === '?') {
                this._onColor.fire([{ type: 0, index: this._specialColors[offset] }]);
            }
            else {
                const color = (0, XParseColor_1.parseColor)(slots[i]);
                if (color) {
                    this._onColor.fire([{ type: 1, index: this._specialColors[offset], color }]);
                }
            }
        }
        return true;
    }
    setOrReportFgColor(data) {
        return this._setOrReportSpecialColor(data, 0);
    }
    setOrReportBgColor(data) {
        return this._setOrReportSpecialColor(data, 1);
    }
    setOrReportCursorColor(data) {
        return this._setOrReportSpecialColor(data, 2);
    }
    restoreIndexedColor(data) {
        if (!data) {
            this._onColor.fire([{ type: 2 }]);
            return true;
        }
        const event = [];
        const slots = data.split(';');
        for (let i = 0; i < slots.length; ++i) {
            if (/^\d+$/.exec(slots[i])) {
                const index = parseInt(slots[i]);
                if (isValidColorIndex(index)) {
                    event.push({ type: 2, index });
                }
            }
        }
        if (event.length) {
            this._onColor.fire(event);
        }
        return true;
    }
    restoreFgColor(data) {
        this._onColor.fire([{ type: 2, index: 256 }]);
        return true;
    }
    restoreBgColor(data) {
        this._onColor.fire([{ type: 2, index: 257 }]);
        return true;
    }
    restoreCursorColor(data) {
        this._onColor.fire([{ type: 2, index: 258 }]);
        return true;
    }
    nextLine() {
        this._activeBuffer.x = 0;
        this.index();
        return true;
    }
    keypadApplicationMode() {
        this._logService.debug('Serial port requested application keypad.');
        this._coreService.decPrivateModes.applicationKeypad = true;
        this._onRequestSyncScrollBar.fire();
        return true;
    }
    keypadNumericMode() {
        this._logService.debug('Switching back to normal keypad.');
        this._coreService.decPrivateModes.applicationKeypad = false;
        this._onRequestSyncScrollBar.fire();
        return true;
    }
    selectDefaultCharset() {
        this._charsetService.setgLevel(0);
        this._charsetService.setgCharset(0, Charsets_1.DEFAULT_CHARSET);
        return true;
    }
    selectCharset(collectAndFlag) {
        if (collectAndFlag.length !== 2) {
            this.selectDefaultCharset();
            return true;
        }
        if (collectAndFlag[0] === '/') {
            return true;
        }
        this._charsetService.setgCharset(GLEVEL[collectAndFlag[0]], Charsets_1.CHARSETS[collectAndFlag[1]] || Charsets_1.DEFAULT_CHARSET);
        return true;
    }
    index() {
        this._restrictCursor();
        this._activeBuffer.y++;
        if (this._activeBuffer.y === this._activeBuffer.scrollBottom + 1) {
            this._activeBuffer.y--;
            this._bufferService.scroll(this._eraseAttrData());
        }
        else if (this._activeBuffer.y >= this._bufferService.rows) {
            this._activeBuffer.y = this._bufferService.rows - 1;
        }
        this._restrictCursor();
        return true;
    }
    tabSet() {
        this._activeBuffer.tabs[this._activeBuffer.x] = true;
        return true;
    }
    reverseIndex() {
        this._restrictCursor();
        if (this._activeBuffer.y === this._activeBuffer.scrollTop) {
            const scrollRegionHeight = this._activeBuffer.scrollBottom - this._activeBuffer.scrollTop;
            this._activeBuffer.lines.shiftElements(this._activeBuffer.ybase + this._activeBuffer.y, scrollRegionHeight, 1);
            this._activeBuffer.lines.set(this._activeBuffer.ybase + this._activeBuffer.y, this._activeBuffer.getBlankLine(this._eraseAttrData()));
            this._dirtyRowTracker.markRangeDirty(this._activeBuffer.scrollTop, this._activeBuffer.scrollBottom);
        }
        else {
            this._activeBuffer.y--;
            this._restrictCursor();
        }
        return true;
    }
    fullReset() {
        this._parser.reset();
        this._onRequestReset.fire();
        return true;
    }
    reset() {
        this._curAttrData = BufferLine_1.DEFAULT_ATTR_DATA.clone();
        this._eraseAttrDataInternal = BufferLine_1.DEFAULT_ATTR_DATA.clone();
    }
    _eraseAttrData() {
        this._eraseAttrDataInternal.bg &= ~(50331648 | 0xFFFFFF);
        this._eraseAttrDataInternal.bg |= this._curAttrData.bg & ~0xFC000000;
        return this._eraseAttrDataInternal;
    }
    setgLevel(level) {
        this._charsetService.setgLevel(level);
        return true;
    }
    screenAlignmentPattern() {
        const cell = new CellData_1.CellData();
        cell.content = 1 << 22 | 'E'.charCodeAt(0);
        cell.fg = this._curAttrData.fg;
        cell.bg = this._curAttrData.bg;
        this._setCursor(0, 0);
        for (let yOffset = 0; yOffset < this._bufferService.rows; ++yOffset) {
            const row = this._activeBuffer.ybase + this._activeBuffer.y + yOffset;
            const line = this._activeBuffer.lines.get(row);
            if (line) {
                line.fill(cell);
                line.isWrapped = false;
            }
        }
        this._dirtyRowTracker.markAllDirty();
        this._setCursor(0, 0);
        return true;
    }
    requestStatusString(data, params) {
        const f = (s) => {
            this._coreService.triggerDataEvent(`${EscapeSequences_1.C0.ESC}${s}${EscapeSequences_1.C0.ESC}\\`);
            return true;
        };
        const b = this._bufferService.buffer;
        const opts = this._optionsService.rawOptions;
        const STYLES = { 'block': 2, 'underline': 4, 'bar': 6 };
        if (data === '"q')
            return f(`P1$r${this._curAttrData.isProtected() ? 1 : 0}"q`);
        if (data === '"p')
            return f(`P1$r61;1"p`);
        if (data === 'r')
            return f(`P1$r${b.scrollTop + 1};${b.scrollBottom + 1}r`);
        if (data === 'm')
            return f(`P1$r0m`);
        if (data === ' q')
            return f(`P1$r${STYLES[opts.cursorStyle] - (opts.cursorBlink ? 1 : 0)} q`);
        return f(`P0$r`);
    }
    markRangeDirty(y1, y2) {
        this._dirtyRowTracker.markRangeDirty(y1, y2);
    }
}
exports.InputHandler = InputHandler;
let DirtyRowTracker = class DirtyRowTracker {
    constructor(_bufferService) {
        this._bufferService = _bufferService;
        this.clearRange();
    }
    clearRange() {
        this.start = this._bufferService.buffer.y;
        this.end = this._bufferService.buffer.y;
    }
    markDirty(y) {
        if (y < this.start) {
            this.start = y;
        }
        else if (y > this.end) {
            this.end = y;
        }
    }
    markRangeDirty(y1, y2) {
        if (y1 > y2) {
            $temp = y1;
            y1 = y2;
            y2 = $temp;
        }
        if (y1 < this.start) {
            this.start = y1;
        }
        if (y2 > this.end) {
            this.end = y2;
        }
    }
    markAllDirty() {
        this.markRangeDirty(0, this._bufferService.rows - 1);
    }
};
DirtyRowTracker = __decorate([
    __param(0, Services_1.IBufferService)
], DirtyRowTracker);
function isValidColorIndex(value) {
    return 0 <= value && value < 256;
}
//# sourceMappingURL=InputHandler.js.map