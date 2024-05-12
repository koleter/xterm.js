"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.launchBrowser = exports.getBrowserType = exports.timeout = exports.writeSync = exports.pollForApproximate = exports.pollFor = exports.openTerminal = exports.TerminalProxy = exports.createTestContext = void 0;
const assert_1 = require("assert");
const playwright = require("@playwright/test");
const EventEmitter_1 = require("../../out/common/EventEmitter");
function createTestContext(browser) {
    return __awaiter(this, void 0, void 0, function* () {
        const page = yield browser.newPage();
        page.on('console', e => console.log(`[${browser.browserType().name()}:${e.type()}]`, e));
        page.on('pageerror', e => console.error(`[${browser.browserType().name()}]`, e));
        yield page.goto('/test');
        const proxy = new TerminalProxy(page);
        proxy.initPage();
        return {
            browser,
            page,
            termHandle: yield page.evaluateHandle('window.term'),
            proxy
        };
    });
}
exports.createTestContext = createTestContext;
class TerminalProxy {
    constructor(_page) {
        this._page = _page;
        this._onBell = new EventEmitter_1.EventEmitter();
        this.onBell = this._onBell.event;
        this._onBinary = new EventEmitter_1.EventEmitter();
        this.onBinary = this._onBinary.event;
        this._onCursorMove = new EventEmitter_1.EventEmitter();
        this.onCursorMove = this._onCursorMove.event;
        this._onData = new EventEmitter_1.EventEmitter();
        this.onData = this._onData.event;
        this._onKey = new EventEmitter_1.EventEmitter();
        this.onKey = this._onKey.event;
        this._onLineFeed = new EventEmitter_1.EventEmitter();
        this.onLineFeed = this._onLineFeed.event;
        this._onRender = new EventEmitter_1.EventEmitter();
        this.onRender = this._onRender.event;
        this._onResize = new EventEmitter_1.EventEmitter();
        this.onResize = this._onResize.event;
        this._onScroll = new EventEmitter_1.EventEmitter();
        this.onScroll = this._onScroll.event;
        this._onSelectionChange = new EventEmitter_1.EventEmitter();
        this.onSelectionChange = this._onSelectionChange.event;
        this._onTitleChange = new EventEmitter_1.EventEmitter();
        this.onTitleChange = this._onTitleChange.event;
        this._onWriteParsed = new EventEmitter_1.EventEmitter();
        this.onWriteParsed = this._onWriteParsed.event;
    }
    initPage() {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._page.exposeFunction('onBell', () => this._onBell.fire());
            yield this._page.exposeFunction('onBinary', (e) => this._onBinary.fire(e));
            yield this._page.exposeFunction('onCursorMove', () => this._onCursorMove.fire());
            yield this._page.exposeFunction('onData', (e) => this._onData.fire(e));
            yield this._page.exposeFunction('onKey', (e) => this._onKey.fire(e));
            yield this._page.exposeFunction('onLineFeed', () => this._onLineFeed.fire());
            yield this._page.exposeFunction('onRender', (e) => this._onRender.fire(e));
            yield this._page.exposeFunction('onResize', (e) => this._onResize.fire(e));
            yield this._page.exposeFunction('onScroll', (e) => this._onScroll.fire(e));
            yield this._page.exposeFunction('onSelectionChange', () => this._onSelectionChange.fire());
            yield this._page.exposeFunction('onTitleChange', (e) => this._onTitleChange.fire(e));
            yield this._page.exposeFunction('onWriteParsed', () => this._onWriteParsed.fire());
        });
    }
    initTerm() {
        return __awaiter(this, void 0, void 0, function* () {
            for (const emitter of [
                this._onBell,
                this._onBinary,
                this._onCursorMove,
                this._onData,
                this._onKey,
                this._onLineFeed,
                this._onRender,
                this._onResize,
                this._onScroll,
                this._onSelectionChange,
                this._onTitleChange,
                this._onWriteParsed
            ]) {
                emitter.clearListeners();
            }
            yield this.evaluate(([term]) => term.onBell(window.onBell));
            yield this.evaluate(([term]) => term.onBinary(window.onBinary));
            yield this.evaluate(([term]) => term.onCursorMove(window.onCursorMove));
            yield this.evaluate(([term]) => term.onData(window.onData));
            yield this.evaluate(([term]) => term.onKey(window.onKey));
            yield this.evaluate(([term]) => term.onLineFeed(window.onLineFeed));
            yield this.evaluate(([term]) => term.onRender(window.onRender));
            yield this.evaluate(([term]) => term.onResize(window.onResize));
            yield this.evaluate(([term]) => term.onScroll(window.onScroll));
            yield this.evaluate(([term]) => term.onSelectionChange(window.onSelectionChange));
            yield this.evaluate(([term]) => term.onTitleChange(window.onTitleChange));
            yield this.evaluate(([term]) => term.onWriteParsed(window.onWriteParsed));
        });
    }
    get cols() { return this.evaluate(([term]) => term.cols); }
    get rows() { return this.evaluate(([term]) => term.rows); }
    get modes() { return this.evaluate(([term]) => term.modes); }
    get buffer() { return new TerminalBufferNamespaceProxy(this._page, this); }
    get core() { return new TerminalCoreProxy(this._page, this); }
    dispose() {
        return __awaiter(this, void 0, void 0, function* () { return this.evaluate(([term]) => term.dispose()); });
    }
    reset() {
        return __awaiter(this, void 0, void 0, function* () { return this.evaluate(([term]) => term.reset()); });
    }
    clear() {
        return __awaiter(this, void 0, void 0, function* () { return this.evaluate(([term]) => term.clear()); });
    }
    focus() {
        return __awaiter(this, void 0, void 0, function* () { return this.evaluate(([term]) => term.focus()); });
    }
    blur() {
        return __awaiter(this, void 0, void 0, function* () { return this.evaluate(([term]) => term.blur()); });
    }
    hasSelection() {
        return __awaiter(this, void 0, void 0, function* () { return this.evaluate(([term]) => term.hasSelection()); });
    }
    getSelection() {
        return __awaiter(this, void 0, void 0, function* () { return this.evaluate(([term]) => term.getSelection()); });
    }
    getSelectionPosition() {
        return __awaiter(this, void 0, void 0, function* () { return this.evaluate(([term]) => term.getSelectionPosition()); });
    }
    selectAll() {
        return __awaiter(this, void 0, void 0, function* () { return this.evaluate(([term]) => term.selectAll()); });
    }
    selectLines(start, end) {
        return __awaiter(this, void 0, void 0, function* () { return this._page.evaluate(([term, start, end]) => term.selectLines(start, end), [yield this.getHandle(), start, end]); });
    }
    clearSelection() {
        return __awaiter(this, void 0, void 0, function* () { return this.evaluate(([term]) => term.clearSelection()); });
    }
    select(column, row, length) {
        return __awaiter(this, void 0, void 0, function* () { return this._page.evaluate(([term, column, row, length]) => term.select(column, row, length), [yield this.getHandle(), column, row, length]); });
    }
    paste(data) {
        return __awaiter(this, void 0, void 0, function* () { return this._page.evaluate(([term, data]) => term.paste(data), [yield this.getHandle(), data]); });
    }
    refresh(start, end) {
        return __awaiter(this, void 0, void 0, function* () { return this._page.evaluate(([term, start, end]) => term.refresh(start, end), [yield this.getHandle(), start, end]); });
    }
    getOption(key) {
        return __awaiter(this, void 0, void 0, function* () { return this._page.evaluate(([term, key]) => term.options[key], [yield this.getHandle(), key]); });
    }
    setOption(key, value) {
        return __awaiter(this, void 0, void 0, function* () { return this._page.evaluate(([term, key, value]) => term.options[key] = value, [yield this.getHandle(), key, value]); });
    }
    setOptions(value) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._page.evaluate(([term, value]) => {
                term.options = value;
            }, [yield this.getHandle(), value]);
        });
    }
    scrollToTop() {
        return __awaiter(this, void 0, void 0, function* () { return this.evaluate(([term]) => term.scrollToTop()); });
    }
    scrollToBottom() {
        return __awaiter(this, void 0, void 0, function* () { return this.evaluate(([term]) => term.scrollToBottom()); });
    }
    scrollPages(pageCount) {
        return __awaiter(this, void 0, void 0, function* () { return this._page.evaluate(([term, pageCount]) => term.scrollPages(pageCount), [yield this.getHandle(), pageCount]); });
    }
    scrollToLine(line) {
        return __awaiter(this, void 0, void 0, function* () { return this._page.evaluate(([term, line]) => term.scrollToLine(line), [yield this.getHandle(), line]); });
    }
    scrollLines(amount) {
        return __awaiter(this, void 0, void 0, function* () { return this._page.evaluate(([term, amount]) => term.scrollLines(amount), [yield this.getHandle(), amount]); });
    }
    write(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._page.evaluate(([term, data]) => {
                return new Promise(r => term.write(typeof data === 'string' ? data : new Uint8Array(data), r));
            }, [yield this.getHandle(), typeof data === 'string' ? data : Array.from(data)]);
        });
    }
    writeln(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._page.evaluate(([term, data]) => {
                return new Promise(r => term.writeln(typeof data === 'string' ? data : new Uint8Array(data), r));
            }, [yield this.getHandle(), typeof data === 'string' ? data : Array.from(data)]);
        });
    }
    input(data, wasUserInput = true) {
        return __awaiter(this, void 0, void 0, function* () { return this.evaluate(([term]) => term.input(data, wasUserInput)); });
    }
    resize(cols, rows) {
        return __awaiter(this, void 0, void 0, function* () { return this._page.evaluate(([term, cols, rows]) => term.resize(cols, rows), [yield this.getHandle(), cols, rows]); });
    }
    registerMarker(y) {
        return __awaiter(this, void 0, void 0, function* () { return this._page.evaluate(([term, y]) => term.registerMarker(y), [yield this.getHandle(), y]); });
    }
    registerDecoration(decorationOptions) {
        return __awaiter(this, void 0, void 0, function* () { return this._page.evaluate(([term, decorationOptions]) => term.registerDecoration(decorationOptions), [yield this.getHandle(), decorationOptions]); });
    }
    clearTextureAtlas() {
        return __awaiter(this, void 0, void 0, function* () { return this.evaluate(([term]) => term.clearTextureAtlas()); });
    }
    evaluate(pageFunction) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._page.evaluate(pageFunction, [yield this.getHandle()]);
        });
    }
    evaluateHandle(pageFunction) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._page.evaluateHandle(pageFunction, [yield this.getHandle()]);
        });
    }
    getHandle() {
        return __awaiter(this, void 0, void 0, function* () {
            return this._page.evaluateHandle('window.term');
        });
    }
}
exports.TerminalProxy = TerminalProxy;
class TerminalBufferNamespaceProxy {
    constructor(_page, _proxy) {
        this._page = _page;
        this._proxy = _proxy;
        this._onBufferChange = new EventEmitter_1.EventEmitter();
        this.onBufferChange = this._onBufferChange.event;
    }
    get active() { return new TerminalBufferProxy(this._page, this._proxy, this._proxy.evaluateHandle(([term]) => term.buffer.active)); }
    get normal() { return new TerminalBufferProxy(this._page, this._proxy, this._proxy.evaluateHandle(([term]) => term.buffer.normal)); }
    get alternate() { return new TerminalBufferProxy(this._page, this._proxy, this._proxy.evaluateHandle(([term]) => term.buffer.alternate)); }
}
class TerminalBufferProxy {
    constructor(_page, _proxy, _handle) {
        this._page = _page;
        this._proxy = _proxy;
        this._handle = _handle;
    }
    get type() { return this.evaluate(([buffer]) => buffer.type); }
    get cursorY() { return this.evaluate(([buffer]) => buffer.cursorY); }
    get cursorX() { return this.evaluate(([buffer]) => buffer.cursorX); }
    get viewportY() { return this.evaluate(([buffer]) => buffer.viewportY); }
    get baseY() { return this.evaluate(([buffer]) => buffer.baseY); }
    get length() { return this.evaluate(([buffer]) => buffer.length); }
    getLine(y) {
        return __awaiter(this, void 0, void 0, function* () {
            const lineHandle = yield this._page.evaluateHandle(([buffer, y]) => buffer.getLine(y), [yield this._handle, y]);
            const value = yield lineHandle.jsonValue();
            if (value) {
                return new TerminalBufferLine(this._page, lineHandle);
            }
            return undefined;
        });
    }
    evaluate(pageFunction) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._page.evaluate(pageFunction, [yield this._handle]);
        });
    }
}
class TerminalBufferLine {
    constructor(_page, _handle) {
        this._page = _page;
        this._handle = _handle;
    }
    get length() { return this.evaluate(([bufferLine]) => bufferLine.length); }
    get isWrapped() { return this.evaluate(([bufferLine]) => bufferLine.isWrapped); }
    translateToString(trimRight, startColumn, endColumn) {
        return this._page.evaluate(([bufferLine, trimRight, startColumn, endColumn]) => {
            return bufferLine.translateToString(trimRight, startColumn, endColumn);
        }, [this._handle, trimRight, startColumn, endColumn]);
    }
    getCell(x) {
        return __awaiter(this, void 0, void 0, function* () {
            const cellHandle = yield this._page.evaluateHandle(([bufferLine, x]) => bufferLine.getCell(x), [this._handle, x]);
            const value = yield cellHandle.jsonValue();
            if (value) {
                return new TerminalBufferCell(this._page, cellHandle);
            }
            return undefined;
        });
    }
    evaluate(pageFunction) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._page.evaluate(pageFunction, [this._handle]);
        });
    }
}
class TerminalBufferCell {
    constructor(_page, _handle) {
        this._page = _page;
        this._handle = _handle;
    }
    getWidth() { return this.evaluate(([line]) => line.getWidth()); }
    getChars() { return this.evaluate(([line]) => line.getChars()); }
    evaluate(pageFunction) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._page.evaluate(pageFunction, [this._handle]);
        });
    }
}
class TerminalCoreProxy {
    constructor(_page, _proxy) {
        this._page = _page;
        this._proxy = _proxy;
    }
    get isDisposed() { return this.evaluate(([core]) => core._isDisposed); }
    get renderDimensions() { return this.evaluate(([core]) => core._renderService.dimensions); }
    triggerBinaryEvent(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._page.evaluate(([core, data]) => core.coreService.triggerBinaryEvent(data), [yield this._getCoreHandle(), data]);
        });
    }
    _getCoreHandle() {
        return __awaiter(this, void 0, void 0, function* () {
            return this._proxy.evaluateHandle(([term]) => term._core);
        });
    }
    evaluate(pageFunction) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._page.evaluate(pageFunction, [yield this._getCoreHandle()]);
        });
    }
}
function openTerminal(ctx, options = {}, testOptions = { loadUnicodeGraphemesAddon: true }) {
    return __awaiter(this, void 0, void 0, function* () {
        yield ctx.page.evaluate(`
  if ('term' in window) {
    try {
      window.term.dispose();
    } catch {}
  }
  `);
        (0, assert_1.strictEqual)(yield ctx.page.evaluate(`document.querySelector('#terminal-container').children.length`), 0, 'there must be no terminals on the page');
        yield ctx.page.evaluate(`
    window.term = new window.Terminal(${JSON.stringify(Object.assign({ allowProposedApi: true }, options))});
    window.term.open(document.querySelector('#terminal-container'));
  `);
        if (testOptions.loadUnicodeGraphemesAddon) {
            yield ctx.page.evaluate(`
      window.unicode = new UnicodeGraphemesAddon();
      window.term.loadAddon(window.unicode);
      window.term.unicode.activeVersion = '15-graphemes';
    `);
        }
        yield ctx.page.waitForSelector('.xterm-rows');
        ctx.termHandle = yield ctx.page.evaluateHandle('window.term');
        yield ctx.proxy.initTerm();
    });
}
exports.openTerminal = openTerminal;
function pollFor(page, evalOrFn, val, preFn, options) {
    var _a;
    return __awaiter(this, void 0, void 0, function* () {
        if (!options) {
            options = {};
        }
        (_a = options.stack) !== null && _a !== void 0 ? _a : (options.stack = new Error().stack);
        if (preFn) {
            yield preFn();
        }
        const result = typeof evalOrFn === 'string' ? yield page.evaluate(evalOrFn) : yield evalOrFn();
        if (process.env.DEBUG) {
            console.log('pollFor\n  actual: ', JSON.stringify(result), '  expected: ', JSON.stringify(val));
        }
        let equalityCheck;
        if (options.equalityFn) {
            equalityCheck = options.equalityFn(result, val);
        }
        else {
            equalityCheck = true;
            try {
                (0, assert_1.deepStrictEqual)(result, val);
            }
            catch (e) {
                equalityCheck = false;
            }
        }
        if (!equalityCheck) {
            if (options.maxDuration === undefined) {
                options.maxDuration = 2000;
            }
            if (options.maxDuration <= 0) {
                (0, assert_1.deepStrictEqual)(result, val, ([
                    `pollFor max duration exceeded.`,
                    (`Last comparison: ` +
                        `${typeof result === 'object' ? JSON.stringify(result) : result} (actual) !== ` +
                        `${typeof val === 'object' ? JSON.stringify(val) : val} (expected)`),
                    `Stack: ${options.stack}`
                ].join('\n')));
            }
            return new Promise(r => {
                setTimeout(() => r(pollFor(page, evalOrFn, val, preFn, Object.assign(Object.assign({}, options), { maxDuration: options.maxDuration - 10, stack: options.stack }))), 10);
            });
        }
    });
}
exports.pollFor = pollFor;
function pollForApproximate(page, marginOfError, evalOrFn, val, preFn, maxDuration, stack) {
    return __awaiter(this, void 0, void 0, function* () {
        yield pollFor(page, evalOrFn, val, preFn, {
            maxDuration,
            stack,
            equalityFn: (a, b) => {
                if (a === b) {
                    return true;
                }
                if (Array.isArray(a) && Array.isArray(b) && a.length === b.length) {
                    let success = true;
                    for (let i = 0; i < a.length; i++) {
                        if (Math.abs(a[i] - b[i]) > marginOfError) {
                            success = false;
                            break;
                        }
                    }
                    if (success) {
                        return true;
                    }
                }
                return false;
            }
        });
    });
}
exports.pollForApproximate = pollForApproximate;
function writeSync(page, data) {
    return __awaiter(this, void 0, void 0, function* () {
        yield page.evaluate(`
    window.ready = false;
    window.term.write('${data}', () => window.ready = true);
  `);
        yield pollFor(page, 'window.ready', true);
    });
}
exports.writeSync = writeSync;
function timeout(ms) {
    return __awaiter(this, void 0, void 0, function* () {
        return new Promise(r => setTimeout(r, ms));
    });
}
exports.timeout = timeout;
function getBrowserType() {
    let browserType = playwright['chromium'];
    const index = process.argv.indexOf('--browser');
    if (index !== -1 && process.argv.length > index + 1 && typeof process.argv[index + 1] === 'string') {
        const string = process.argv[index + 1];
        if (string === 'firefox' || string === 'webkit') {
            browserType = playwright[string];
        }
    }
    return browserType;
}
exports.getBrowserType = getBrowserType;
function launchBrowser() {
    const browserType = getBrowserType();
    const options = {
        headless: process.argv.includes('--headless')
    };
    const index = process.argv.indexOf('--executablePath');
    if (index > 0 && process.argv.length > index + 1 && typeof process.argv[index + 1] === 'string') {
        options.executablePath = process.argv[index + 1];
    }
    return browserType.launch(options);
}
exports.launchBrowser = launchBrowser;
//# sourceMappingURL=TestUtils.js.map