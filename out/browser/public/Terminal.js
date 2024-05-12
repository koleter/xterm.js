"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Terminal = void 0;
const Strings = require("browser/LocalizableStrings");
const Terminal_1 = require("browser/Terminal");
const Lifecycle_1 = require("common/Lifecycle");
const AddonManager_1 = require("common/public/AddonManager");
const BufferNamespaceApi_1 = require("common/public/BufferNamespaceApi");
const ParserApi_1 = require("common/public/ParserApi");
const UnicodeApi_1 = require("common/public/UnicodeApi");
const CONSTRUCTOR_ONLY_OPTIONS = ['cols', 'rows'];
class Terminal extends Lifecycle_1.Disposable {
    constructor(options) {
        super();
        this._core = this.register(new Terminal_1.Terminal(options));
        this._addonManager = this.register(new AddonManager_1.AddonManager());
        this._publicOptions = { ...this._core.options };
        const getter = (propName) => {
            return this._core.options[propName];
        };
        const setter = (propName, value) => {
            this._checkReadonlyOptions(propName);
            this._core.options[propName] = value;
        };
        for (const propName in this._core.options) {
            const desc = {
                get: getter.bind(this, propName),
                set: setter.bind(this, propName)
            };
            Object.defineProperty(this._publicOptions, propName, desc);
        }
    }
    _checkReadonlyOptions(propName) {
        if (CONSTRUCTOR_ONLY_OPTIONS.includes(propName)) {
            throw new Error(`Option "${propName}" can only be set in the constructor`);
        }
    }
    _checkProposedApi() {
        if (!this._core.optionsService.rawOptions.allowProposedApi) {
            throw new Error('You must set the allowProposedApi option to true to use proposed API');
        }
    }
    get onBell() { return this._core.onBell; }
    get onBinary() { return this._core.onBinary; }
    get onCursorMove() { return this._core.onCursorMove; }
    get onData() { return this._core.onData; }
    get onKey() { return this._core.onKey; }
    get onLineFeed() { return this._core.onLineFeed; }
    get onRender() { return this._core.onRender; }
    get onResize() { return this._core.onResize; }
    get onScroll() { return this._core.onScroll; }
    get onSelectionChange() { return this._core.onSelectionChange; }
    get onTitleChange() { return this._core.onTitleChange; }
    get onWriteParsed() { return this._core.onWriteParsed; }
    get element() { return this._core.element; }
    get parser() {
        if (!this._parser) {
            this._parser = new ParserApi_1.ParserApi(this._core);
        }
        return this._parser;
    }
    get unicode() {
        this._checkProposedApi();
        return new UnicodeApi_1.UnicodeApi(this._core);
    }
    get textarea() { return this._core.textarea; }
    get rows() { return this._core.rows; }
    get cols() { return this._core.cols; }
    get buffer() {
        if (!this._buffer) {
            this._buffer = this.register(new BufferNamespaceApi_1.BufferNamespaceApi(this._core));
        }
        return this._buffer;
    }
    get markers() {
        this._checkProposedApi();
        return this._core.markers;
    }
    get modes() {
        const m = this._core.coreService.decPrivateModes;
        let mouseTrackingMode = 'none';
        switch (this._core.coreMouseService.activeProtocol) {
            case 'X10':
                mouseTrackingMode = 'x10';
                break;
            case 'VT200':
                mouseTrackingMode = 'vt200';
                break;
            case 'DRAG':
                mouseTrackingMode = 'drag';
                break;
            case 'ANY':
                mouseTrackingMode = 'any';
                break;
        }
        return {
            applicationCursorKeysMode: m.applicationCursorKeys,
            applicationKeypadMode: m.applicationKeypad,
            bracketedPasteMode: m.bracketedPasteMode,
            insertMode: this._core.coreService.modes.insertMode,
            mouseTrackingMode: mouseTrackingMode,
            originMode: m.origin,
            reverseWraparoundMode: m.reverseWraparound,
            sendFocusMode: m.sendFocus,
            wraparoundMode: m.wraparound
        };
    }
    get options() {
        return this._publicOptions;
    }
    set options(options) {
        for (const propName in options) {
            this._publicOptions[propName] = options[propName];
        }
    }
    blur() {
        this._core.blur();
    }
    focus() {
        this._core.focus();
    }
    input(data, wasUserInput = true) {
        this._core.input(data, wasUserInput);
    }
    resize(columns, rows) {
        this._verifyIntegers(columns, rows);
        this._core.resize(columns, rows);
    }
    open(parent) {
        this._core.open(parent);
    }
    attachCustomKeyEventHandler(customKeyEventHandler) {
        this._core.attachCustomKeyEventHandler(customKeyEventHandler);
    }
    attachCustomWheelEventHandler(customWheelEventHandler) {
        this._core.attachCustomWheelEventHandler(customWheelEventHandler);
    }
    registerLinkProvider(linkProvider) {
        return this._core.registerLinkProvider(linkProvider);
    }
    registerCharacterJoiner(handler) {
        this._checkProposedApi();
        return this._core.registerCharacterJoiner(handler);
    }
    deregisterCharacterJoiner(joinerId) {
        this._checkProposedApi();
        this._core.deregisterCharacterJoiner(joinerId);
    }
    registerMarker(cursorYOffset = 0) {
        this._verifyIntegers(cursorYOffset);
        return this._core.registerMarker(cursorYOffset);
    }
    registerDecoration(decorationOptions) {
        this._checkProposedApi();
        this._verifyPositiveIntegers(decorationOptions.x ?? 0, decorationOptions.width ?? 0, decorationOptions.height ?? 0);
        return this._core.registerDecoration(decorationOptions);
    }
    hasSelection() {
        return this._core.hasSelection();
    }
    select(column, row, length) {
        this._verifyIntegers(column, row, length);
        this._core.select(column, row, length);
    }
    getSelection() {
        return this._core.getSelection();
    }
    getSelectionPosition() {
        return this._core.getSelectionPosition();
    }
    clearSelection() {
        this._core.clearSelection();
    }
    selectAll() {
        this._core.selectAll();
    }
    selectLines(start, end) {
        this._verifyIntegers(start, end);
        this._core.selectLines(start, end);
    }
    dispose() {
        super.dispose();
    }
    scrollLines(amount) {
        this._verifyIntegers(amount);
        this._core.scrollLines(amount);
    }
    scrollPages(pageCount) {
        this._verifyIntegers(pageCount);
        this._core.scrollPages(pageCount);
    }
    scrollToTop() {
        this._core.scrollToTop();
    }
    scrollToBottom() {
        this._core.scrollToBottom();
    }
    scrollToLine(line) {
        this._verifyIntegers(line);
        this._core.scrollToLine(line);
    }
    clear() {
        this._core.clear();
    }
    write(data, callback) {
        this._core.write(data, callback);
    }
    writeln(data, callback) {
        this._core.write(data);
        this._core.write('\r\n', callback);
    }
    paste(data) {
        this._core.paste(data);
    }
    refresh(start, end) {
        this._verifyIntegers(start, end);
        this._core.refresh(start, end);
    }
    reset() {
        this._core.reset();
    }
    clearTextureAtlas() {
        this._core.clearTextureAtlas();
    }
    loadAddon(addon) {
        this._addonManager.loadAddon(this, addon);
    }
    static get strings() {
        return Strings;
    }
    _verifyIntegers(...values) {
        for (const value of values) {
            if (value === Infinity || isNaN(value) || value % 1 !== 0) {
                throw new Error('This API only accepts integers');
            }
        }
    }
    _verifyPositiveIntegers(...values) {
        for (const value of values) {
            if (value && (value === Infinity || isNaN(value) || value % 1 !== 0 || value < 0)) {
                throw new Error('This API only accepts positive integers');
            }
        }
    }
}
exports.Terminal = Terminal;
//# sourceMappingURL=Terminal.js.map