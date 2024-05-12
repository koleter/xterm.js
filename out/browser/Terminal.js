"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Terminal = void 0;
const Clipboard_1 = require("browser/Clipboard");
const Lifecycle_1 = require("browser/Lifecycle");
const Linkifier_1 = require("./Linkifier");
const Strings = require("browser/LocalizableStrings");
const OscLinkProvider_1 = require("browser/OscLinkProvider");
const Viewport_1 = require("browser/Viewport");
const BufferDecorationRenderer_1 = require("browser/decorations/BufferDecorationRenderer");
const OverviewRulerRenderer_1 = require("browser/decorations/OverviewRulerRenderer");
const CompositionHelper_1 = require("browser/input/CompositionHelper");
const DomRenderer_1 = require("browser/renderer/dom/DomRenderer");
const CharSizeService_1 = require("browser/services/CharSizeService");
const CharacterJoinerService_1 = require("browser/services/CharacterJoinerService");
const CoreBrowserService_1 = require("browser/services/CoreBrowserService");
const MouseService_1 = require("browser/services/MouseService");
const RenderService_1 = require("browser/services/RenderService");
const SelectionService_1 = require("browser/services/SelectionService");
const Services_1 = require("browser/services/Services");
const ThemeService_1 = require("browser/services/ThemeService");
const Color_1 = require("common/Color");
const CoreTerminal_1 = require("common/CoreTerminal");
const EventEmitter_1 = require("common/EventEmitter");
const Lifecycle_2 = require("common/Lifecycle");
const Browser = require("common/Platform");
const BufferLine_1 = require("common/buffer/BufferLine");
const EscapeSequences_1 = require("common/data/EscapeSequences");
const Keyboard_1 = require("common/input/Keyboard");
const XParseColor_1 = require("common/input/XParseColor");
const DecorationService_1 = require("common/services/DecorationService");
const Services_2 = require("common/services/Services");
const InputHandler_1 = require("../common/InputHandler");
const AccessibilityManager_1 = require("./AccessibilityManager");
const LinkProviderService_1 = require("browser/services/LinkProviderService");
class Terminal extends CoreTerminal_1.CoreTerminal {
    get onFocus() { return this._onFocus.event; }
    get onBlur() { return this._onBlur.event; }
    get onA11yChar() { return this._onA11yCharEmitter.event; }
    get onA11yTab() { return this._onA11yTabEmitter.event; }
    get onWillOpen() { return this._onWillOpen.event; }
    constructor(options = {}) {
        super(options);
        this.browser = Browser;
        this._keyDownHandled = false;
        this._keyDownSeen = false;
        this._keyPressHandled = false;
        this._unprocessedDeadKey = false;
        this._accessibilityManager = this.register(new Lifecycle_2.MutableDisposable());
        this._onCursorMove = this.register(new EventEmitter_1.EventEmitter());
        this.onCursorMove = this._onCursorMove.event;
        this._onKey = this.register(new EventEmitter_1.EventEmitter());
        this.onKey = this._onKey.event;
        this._onRender = this.register(new EventEmitter_1.EventEmitter());
        this.onRender = this._onRender.event;
        this._onSelectionChange = this.register(new EventEmitter_1.EventEmitter());
        this.onSelectionChange = this._onSelectionChange.event;
        this._onTitleChange = this.register(new EventEmitter_1.EventEmitter());
        this.onTitleChange = this._onTitleChange.event;
        this._onBell = this.register(new EventEmitter_1.EventEmitter());
        this.onBell = this._onBell.event;
        this._onFocus = this.register(new EventEmitter_1.EventEmitter());
        this._onBlur = this.register(new EventEmitter_1.EventEmitter());
        this._onA11yCharEmitter = this.register(new EventEmitter_1.EventEmitter());
        this._onA11yTabEmitter = this.register(new EventEmitter_1.EventEmitter());
        this._onWillOpen = this.register(new EventEmitter_1.EventEmitter());
        this._setup();
        this._decorationService = this._instantiationService.createInstance(DecorationService_1.DecorationService);
        this._instantiationService.setService(Services_2.IDecorationService, this._decorationService);
        this._linkProviderService = this._instantiationService.createInstance(LinkProviderService_1.LinkProviderService);
        this._instantiationService.setService(Services_1.ILinkProviderService, this._linkProviderService);
        this._linkProviderService.registerLinkProvider(this._instantiationService.createInstance(OscLinkProvider_1.OscLinkProvider));
        this.register(this._inputHandler.onRequestBell(() => this._onBell.fire()));
        this.register(this._inputHandler.onRequestRefreshRows((start, end) => this.refresh(start, end)));
        this.register(this._inputHandler.onRequestSendFocus(() => this._reportFocus()));
        this.register(this._inputHandler.onRequestReset(() => this.reset()));
        this.register(this._inputHandler.onRequestWindowsOptionsReport(type => this._reportWindowsOptions(type)));
        this.register(this._inputHandler.onColor((event) => this._handleColorEvent(event)));
        this.register((0, EventEmitter_1.forwardEvent)(this._inputHandler.onCursorMove, this._onCursorMove));
        this.register((0, EventEmitter_1.forwardEvent)(this._inputHandler.onTitleChange, this._onTitleChange));
        this.register((0, EventEmitter_1.forwardEvent)(this._inputHandler.onA11yChar, this._onA11yCharEmitter));
        this.register((0, EventEmitter_1.forwardEvent)(this._inputHandler.onA11yTab, this._onA11yTabEmitter));
        this.register(this._bufferService.onResize(e => this._afterResize(e.cols, e.rows)));
        this.register((0, Lifecycle_2.toDisposable)(() => {
            this._customKeyEventHandler = undefined;
            this.element?.parentNode?.removeChild(this.element);
        }));
    }
    _handleColorEvent(event) {
        if (!this._themeService)
            return;
        for (const req of event) {
            let acc;
            let ident = '';
            switch (req.index) {
                case 256:
                    acc = 'foreground';
                    ident = '10';
                    break;
                case 257:
                    acc = 'background';
                    ident = '11';
                    break;
                case 258:
                    acc = 'cursor';
                    ident = '12';
                    break;
                default:
                    acc = 'ansi';
                    ident = '4;' + req.index;
            }
            switch (req.type) {
                case 0:
                    const colorRgb = Color_1.color.toColorRGB(acc === 'ansi'
                        ? this._themeService.colors.ansi[req.index]
                        : this._themeService.colors[acc]);
                    this.coreService.triggerDataEvent(`${EscapeSequences_1.C0.ESC}]${ident};${(0, XParseColor_1.toRgbString)(colorRgb)}${EscapeSequences_1.C1_ESCAPED.ST}`);
                    break;
                case 1:
                    if (acc === 'ansi') {
                        this._themeService.modifyColors(colors => colors.ansi[req.index] = Color_1.channels.toColor(...req.color));
                    }
                    else {
                        const narrowedAcc = acc;
                        this._themeService.modifyColors(colors => colors[narrowedAcc] = Color_1.channels.toColor(...req.color));
                    }
                    break;
                case 2:
                    this._themeService.restoreColor(req.index);
                    break;
            }
        }
    }
    _setup() {
        super._setup();
        this._customKeyEventHandler = undefined;
    }
    get buffer() {
        return this.buffers.active;
    }
    focus() {
        if (this.textarea) {
            this.textarea.focus({ preventScroll: true });
        }
    }
    _handleScreenReaderModeOptionChange(value) {
        if (value) {
            if (!this._accessibilityManager.value && this._renderService) {
                this._accessibilityManager.value = this._instantiationService.createInstance(AccessibilityManager_1.AccessibilityManager, this);
            }
        }
        else {
            this._accessibilityManager.clear();
        }
    }
    _handleTextAreaFocus(ev) {
        if (this.coreService.decPrivateModes.sendFocus) {
            this.coreService.triggerDataEvent(EscapeSequences_1.C0.ESC + '[I');
        }
        this.element.classList.add('focus');
        this._showCursor();
        this._onFocus.fire();
    }
    blur() {
        return this.textarea?.blur();
    }
    _handleTextAreaBlur() {
        this.textarea.value = '';
        this.refresh(this.buffer.y, this.buffer.y);
        if (this.coreService.decPrivateModes.sendFocus) {
            this.coreService.triggerDataEvent(EscapeSequences_1.C0.ESC + '[O');
        }
        this.element.classList.remove('focus');
        this._onBlur.fire();
    }
    _syncTextArea() {
        if (!this.textarea || !this.buffer.isCursorInViewport || this._compositionHelper.isComposing || !this._renderService) {
            return;
        }
        const cursorY = this.buffer.ybase + this.buffer.y;
        const bufferLine = this.buffer.lines.get(cursorY);
        if (!bufferLine) {
            return;
        }
        const cursorX = Math.min(this.buffer.x, this.cols - 1);
        const cellHeight = this._renderService.dimensions.css.cell.height;
        const width = bufferLine.getWidth(cursorX);
        const cellWidth = this._renderService.dimensions.css.cell.width * width;
        const cursorTop = this.buffer.y * this._renderService.dimensions.css.cell.height;
        const cursorLeft = cursorX * this._renderService.dimensions.css.cell.width;
        this.textarea.style.left = cursorLeft + 'px';
        this.textarea.style.top = cursorTop + 'px';
        this.textarea.style.width = cellWidth + 'px';
        this.textarea.style.height = cellHeight + 'px';
        this.textarea.style.lineHeight = cellHeight + 'px';
        this.textarea.style.zIndex = '-5';
    }
    _initGlobal() {
        this._bindKeys();
        this.register((0, Lifecycle_1.addDisposableDomListener)(this.element, 'copy', (event) => {
            if (!this.hasSelection()) {
                return;
            }
            (0, Clipboard_1.copyHandler)(event, this._selectionService);
        }));
        const pasteHandlerWrapper = (event) => (0, Clipboard_1.handlePasteEvent)(event, this.textarea, this.coreService, this.optionsService);
        this.register((0, Lifecycle_1.addDisposableDomListener)(this.textarea, 'paste', pasteHandlerWrapper));
        this.register((0, Lifecycle_1.addDisposableDomListener)(this.element, 'paste', pasteHandlerWrapper));
        if (Browser.isFirefox) {
            this.register((0, Lifecycle_1.addDisposableDomListener)(this.element, 'mousedown', (event) => {
                if (event.button === 2) {
                    (0, Clipboard_1.rightClickHandler)(event, this.textarea, this.screenElement, this._selectionService, this.options.rightClickSelectsWord);
                }
            }));
        }
        else {
            this.register((0, Lifecycle_1.addDisposableDomListener)(this.element, 'contextmenu', (event) => {
                (0, Clipboard_1.rightClickHandler)(event, this.textarea, this.screenElement, this._selectionService, this.options.rightClickSelectsWord);
            }));
        }
        if (Browser.isLinux) {
            this.register((0, Lifecycle_1.addDisposableDomListener)(this.element, 'auxclick', (event) => {
                if (event.button === 1) {
                    (0, Clipboard_1.moveTextAreaUnderMouseCursor)(event, this.textarea, this.screenElement);
                }
            }));
        }
    }
    _bindKeys() {
        this.register((0, Lifecycle_1.addDisposableDomListener)(this.textarea, 'keyup', (ev) => this._keyUp(ev), true));
        this.register((0, Lifecycle_1.addDisposableDomListener)(this.textarea, 'keydown', (ev) => this._keyDown(ev), true));
        this.register((0, Lifecycle_1.addDisposableDomListener)(this.textarea, 'keypress', (ev) => this._keyPress(ev), true));
        this.register((0, Lifecycle_1.addDisposableDomListener)(this.textarea, 'compositionstart', () => this._compositionHelper.compositionstart()));
        this.register((0, Lifecycle_1.addDisposableDomListener)(this.textarea, 'compositionupdate', (e) => this._compositionHelper.compositionupdate(e)));
        this.register((0, Lifecycle_1.addDisposableDomListener)(this.textarea, 'compositionend', () => this._compositionHelper.compositionend()));
        this.register((0, Lifecycle_1.addDisposableDomListener)(this.textarea, 'input', (ev) => this._inputEvent(ev), true));
        this.register(this.onRender(() => this._compositionHelper.updateCompositionElements()));
    }
    open(parent) {
        if (!parent) {
            throw new Error('Terminal requires a parent element.');
        }
        if (!parent.isConnected) {
            this._logService.debug('Terminal.open was called on an element that was not attached to the DOM');
        }
        if (this.element?.ownerDocument.defaultView && this._coreBrowserService) {
            if (this.element.ownerDocument.defaultView !== this._coreBrowserService.window) {
                this._coreBrowserService.window = this.element.ownerDocument.defaultView;
            }
            return;
        }
        this._document = parent.ownerDocument;
        if (this.options.documentOverride && this.options.documentOverride instanceof Document) {
            this._document = this.optionsService.rawOptions.documentOverride;
        }
        this.element = this._document.createElement('div');
        this.element.dir = 'ltr';
        this.element.classList.add('terminal');
        this.element.classList.add('xterm');
        parent.appendChild(this.element);
        const fragment = this._document.createDocumentFragment();
        this._viewportElement = this._document.createElement('div');
        this._viewportElement.classList.add('xterm-viewport');
        fragment.appendChild(this._viewportElement);
        this._viewportScrollArea = this._document.createElement('div');
        this._viewportScrollArea.classList.add('xterm-scroll-area');
        this._viewportElement.appendChild(this._viewportScrollArea);
        this.screenElement = this._document.createElement('div');
        this.screenElement.classList.add('xterm-screen');
        this.register((0, Lifecycle_1.addDisposableDomListener)(this.screenElement, 'mousemove', (ev) => this.updateCursorStyle(ev)));
        this._helperContainer = this._document.createElement('div');
        this._helperContainer.classList.add('xterm-helpers');
        this.screenElement.appendChild(this._helperContainer);
        fragment.appendChild(this.screenElement);
        this.textarea = this._document.createElement('textarea');
        this.textarea.classList.add('xterm-helper-textarea');
        this.textarea.setAttribute('aria-label', Strings.promptLabel);
        if (!Browser.isChromeOS) {
            this.textarea.setAttribute('aria-multiline', 'false');
        }
        this.textarea.setAttribute('autocorrect', 'off');
        this.textarea.setAttribute('autocapitalize', 'off');
        this.textarea.setAttribute('spellcheck', 'false');
        this.textarea.tabIndex = 0;
        this._coreBrowserService = this.register(this._instantiationService.createInstance(CoreBrowserService_1.CoreBrowserService, this.textarea, parent.ownerDocument.defaultView ?? window, (this._document ?? (typeof window !== 'undefined')) ? window.document : null));
        this._instantiationService.setService(Services_1.ICoreBrowserService, this._coreBrowserService);
        this.register((0, Lifecycle_1.addDisposableDomListener)(this.textarea, 'focus', (ev) => this._handleTextAreaFocus(ev)));
        this.register((0, Lifecycle_1.addDisposableDomListener)(this.textarea, 'blur', () => this._handleTextAreaBlur()));
        this._helperContainer.appendChild(this.textarea);
        this._charSizeService = this._instantiationService.createInstance(CharSizeService_1.CharSizeService, this._document, this._helperContainer);
        this._instantiationService.setService(Services_1.ICharSizeService, this._charSizeService);
        this._themeService = this._instantiationService.createInstance(ThemeService_1.ThemeService);
        this._instantiationService.setService(Services_1.IThemeService, this._themeService);
        this._characterJoinerService = this._instantiationService.createInstance(CharacterJoinerService_1.CharacterJoinerService);
        this._instantiationService.setService(Services_1.ICharacterJoinerService, this._characterJoinerService);
        this._renderService = this.register(this._instantiationService.createInstance(RenderService_1.RenderService, this.rows, this.screenElement));
        this._instantiationService.setService(Services_1.IRenderService, this._renderService);
        this.register(this._renderService.onRenderedViewportChange(e => this._onRender.fire(e)));
        this.onResize(e => this._renderService.resize(e.cols, e.rows));
        this._compositionView = this._document.createElement('div');
        this._compositionView.classList.add('composition-view');
        this._compositionHelper = this._instantiationService.createInstance(CompositionHelper_1.CompositionHelper, this.textarea, this._compositionView);
        this._helperContainer.appendChild(this._compositionView);
        this._mouseService = this._instantiationService.createInstance(MouseService_1.MouseService);
        this._instantiationService.setService(Services_1.IMouseService, this._mouseService);
        this.linkifier = this.register(this._instantiationService.createInstance(Linkifier_1.Linkifier, this.screenElement));
        this.element.appendChild(fragment);
        try {
            this._onWillOpen.fire(this.element);
        }
        catch { }
        if (!this._renderService.hasRenderer()) {
            this._renderService.setRenderer(this._createRenderer());
        }
        this.viewport = this._instantiationService.createInstance(Viewport_1.Viewport, this._viewportElement, this._viewportScrollArea);
        this.viewport.onRequestScrollLines(e => this.scrollLines(e.amount, e.suppressScrollEvent, 1)),
            this.register(this._inputHandler.onRequestSyncScrollBar(() => this.viewport.syncScrollArea()));
        this.register(this.viewport);
        this.register(this.onCursorMove(() => {
            this._renderService.handleCursorMove();
            this._syncTextArea();
        }));
        this.register(this.onResize(() => this._renderService.handleResize(this.cols, this.rows)));
        this.register(this.onBlur(() => this._renderService.handleBlur()));
        this.register(this.onFocus(() => this._renderService.handleFocus()));
        this.register(this._renderService.onDimensionsChange(() => this.viewport.syncScrollArea()));
        this._selectionService = this.register(this._instantiationService.createInstance(SelectionService_1.SelectionService, this.element, this.screenElement, this.linkifier));
        this._instantiationService.setService(Services_1.ISelectionService, this._selectionService);
        this.register(this._selectionService.onRequestScrollLines(e => this.scrollLines(e.amount, e.suppressScrollEvent)));
        this.register(this._selectionService.onSelectionChange(() => this._onSelectionChange.fire()));
        this.register(this._selectionService.onRequestRedraw(e => this._renderService.handleSelectionChanged(e.start, e.end, e.columnSelectMode)));
        this.register(this._selectionService.onLinuxMouseSelection(text => {
            this.textarea.value = text;
            this.textarea.focus();
            this.textarea.select();
        }));
        this.register(this._onScroll.event(ev => {
            this.viewport.syncScrollArea();
            this._selectionService.refresh();
        }));
        this.register((0, Lifecycle_1.addDisposableDomListener)(this._viewportElement, 'scroll', () => this._selectionService.refresh()));
        this.register(this._instantiationService.createInstance(BufferDecorationRenderer_1.BufferDecorationRenderer, this.screenElement));
        this.register((0, Lifecycle_1.addDisposableDomListener)(this.element, 'mousedown', (e) => this._selectionService.handleMouseDown(e)));
        if (this.coreMouseService.areMouseEventsActive) {
            this._selectionService.disable();
            this.element.classList.add('enable-mouse-events');
        }
        else {
            this._selectionService.enable();
        }
        if (this.options.screenReaderMode) {
            this._accessibilityManager.value = this._instantiationService.createInstance(AccessibilityManager_1.AccessibilityManager, this);
        }
        this.register(this.optionsService.onSpecificOptionChange('screenReaderMode', e => this._handleScreenReaderModeOptionChange(e)));
        if (this.options.overviewRulerWidth) {
            this._overviewRulerRenderer = this.register(this._instantiationService.createInstance(OverviewRulerRenderer_1.OverviewRulerRenderer, this._viewportElement, this.screenElement));
        }
        this.optionsService.onSpecificOptionChange('overviewRulerWidth', value => {
            if (!this._overviewRulerRenderer && value && this._viewportElement && this.screenElement) {
                this._overviewRulerRenderer = this.register(this._instantiationService.createInstance(OverviewRulerRenderer_1.OverviewRulerRenderer, this._viewportElement, this.screenElement));
            }
        });
        this._charSizeService.measure();
        this.refresh(0, this.rows - 1);
        this._initGlobal();
        this.bindMouse();
    }
    _createRenderer() {
        return this._instantiationService.createInstance(DomRenderer_1.DomRenderer, this, this._document, this.element, this.screenElement, this._viewportElement, this._helperContainer, this.linkifier);
    }
    bindMouse() {
        const self = this;
        const el = this.element;
        function sendEvent(ev) {
            const pos = self._mouseService.getMouseReportCoords(ev, self.screenElement);
            if (!pos) {
                return false;
            }
            let but;
            let action;
            switch (ev.overrideType || ev.type) {
                case 'mousemove':
                    action = 32;
                    if (ev.buttons === undefined) {
                        but = 3;
                        if (ev.button !== undefined) {
                            but = ev.button < 3 ? ev.button : 3;
                        }
                    }
                    else {
                        but = ev.buttons & 1 ? 0 :
                            ev.buttons & 4 ? 1 :
                                ev.buttons & 2 ? 2 :
                                    3;
                    }
                    break;
                case 'mouseup':
                    action = 0;
                    but = ev.button < 3 ? ev.button : 3;
                    break;
                case 'mousedown':
                    action = 1;
                    but = ev.button < 3 ? ev.button : 3;
                    break;
                case 'wheel':
                    if (self._customWheelEventHandler && self._customWheelEventHandler(ev) === false) {
                        return false;
                    }
                    const amount = self.viewport.getLinesScrolled(ev);
                    if (amount === 0) {
                        return false;
                    }
                    action = ev.deltaY < 0 ? 0 : 1;
                    but = 4;
                    break;
                default:
                    return false;
            }
            if (action === undefined || but === undefined || but > 4) {
                return false;
            }
            return self.coreMouseService.triggerMouseEvent({
                col: pos.col,
                row: pos.row,
                x: pos.x,
                y: pos.y,
                button: but,
                action,
                ctrl: ev.ctrlKey,
                alt: ev.altKey,
                shift: ev.shiftKey
            });
        }
        const requestedEvents = {
            mouseup: null,
            wheel: null,
            mousedrag: null,
            mousemove: null
        };
        const eventListeners = {
            mouseup: (ev) => {
                sendEvent(ev);
                if (!ev.buttons) {
                    this._document.removeEventListener('mouseup', requestedEvents.mouseup);
                    if (requestedEvents.mousedrag) {
                        this._document.removeEventListener('mousemove', requestedEvents.mousedrag);
                    }
                }
                return this.cancel(ev);
            },
            wheel: (ev) => {
                sendEvent(ev);
                return this.cancel(ev, true);
            },
            mousedrag: (ev) => {
                if (ev.buttons) {
                    sendEvent(ev);
                }
            },
            mousemove: (ev) => {
                if (!ev.buttons) {
                    sendEvent(ev);
                }
            }
        };
        this.register(this.coreMouseService.onProtocolChange(events => {
            if (events) {
                if (this.optionsService.rawOptions.logLevel === 'debug') {
                    this._logService.debug('Binding to mouse events:', this.coreMouseService.explainEvents(events));
                }
                this.element.classList.add('enable-mouse-events');
                this._selectionService.disable();
            }
            else {
                this._logService.debug('Unbinding from mouse events.');
                this.element.classList.remove('enable-mouse-events');
                this._selectionService.enable();
            }
            if (!(events & 8)) {
                el.removeEventListener('mousemove', requestedEvents.mousemove);
                requestedEvents.mousemove = null;
            }
            else if (!requestedEvents.mousemove) {
                el.addEventListener('mousemove', eventListeners.mousemove);
                requestedEvents.mousemove = eventListeners.mousemove;
            }
            if (!(events & 16)) {
                el.removeEventListener('wheel', requestedEvents.wheel);
                requestedEvents.wheel = null;
            }
            else if (!requestedEvents.wheel) {
                el.addEventListener('wheel', eventListeners.wheel, { passive: false });
                requestedEvents.wheel = eventListeners.wheel;
            }
            if (!(events & 2)) {
                this._document.removeEventListener('mouseup', requestedEvents.mouseup);
                requestedEvents.mouseup = null;
            }
            else if (!requestedEvents.mouseup) {
                requestedEvents.mouseup = eventListeners.mouseup;
            }
            if (!(events & 4)) {
                this._document.removeEventListener('mousemove', requestedEvents.mousedrag);
                requestedEvents.mousedrag = null;
            }
            else if (!requestedEvents.mousedrag) {
                requestedEvents.mousedrag = eventListeners.mousedrag;
            }
        }));
        this.coreMouseService.activeProtocol = this.coreMouseService.activeProtocol;
        this.register((0, Lifecycle_1.addDisposableDomListener)(el, 'mousedown', (ev) => {
            ev.preventDefault();
            this.focus();
            if (!this.coreMouseService.areMouseEventsActive || this._selectionService.shouldForceSelection(ev)) {
                return;
            }
            sendEvent(ev);
            if (requestedEvents.mouseup) {
                this._document.addEventListener('mouseup', requestedEvents.mouseup);
            }
            if (requestedEvents.mousedrag) {
                this._document.addEventListener('mousemove', requestedEvents.mousedrag);
            }
            return this.cancel(ev);
        }));
        this.register((0, Lifecycle_1.addDisposableDomListener)(el, 'wheel', (ev) => {
            if (requestedEvents.wheel)
                return;
            if (this._customWheelEventHandler && this._customWheelEventHandler(ev) === false) {
                return false;
            }
            if (!this.buffer.hasScrollback) {
                const amount = this.viewport.getLinesScrolled(ev);
                if (amount === 0) {
                    return;
                }
                const sequence = EscapeSequences_1.C0.ESC + (this.coreService.decPrivateModes.applicationCursorKeys ? 'O' : '[') + (ev.deltaY < 0 ? 'A' : 'B');
                let data = '';
                for (let i = 0; i < Math.abs(amount); i++) {
                    data += sequence;
                }
                this.coreService.triggerDataEvent(data, true);
                return this.cancel(ev, true);
            }
            if (this.viewport.handleWheel(ev)) {
                return this.cancel(ev);
            }
        }, { passive: false }));
        this.register((0, Lifecycle_1.addDisposableDomListener)(el, 'touchstart', (ev) => {
            if (this.coreMouseService.areMouseEventsActive)
                return;
            this.viewport.handleTouchStart(ev);
            return this.cancel(ev);
        }, { passive: true }));
        this.register((0, Lifecycle_1.addDisposableDomListener)(el, 'touchmove', (ev) => {
            if (this.coreMouseService.areMouseEventsActive)
                return;
            if (!this.viewport.handleTouchMove(ev)) {
                return this.cancel(ev);
            }
        }, { passive: false }));
    }
    refresh(start, end) {
        this._renderService?.refreshRows(start, end);
    }
    updateCursorStyle(ev) {
        if (this._selectionService?.shouldColumnSelect(ev)) {
            this.element.classList.add('column-select');
        }
        else {
            this.element.classList.remove('column-select');
        }
    }
    _showCursor() {
        if (!this.coreService.isCursorInitialized) {
            this.coreService.isCursorInitialized = true;
            this.refresh(this.buffer.y, this.buffer.y);
        }
    }
    scrollLines(disp, suppressScrollEvent, source = 0) {
        if (source === 1) {
            super.scrollLines(disp, suppressScrollEvent, source);
            this.refresh(0, this.rows - 1);
        }
        else {
            this.viewport?.scrollLines(disp);
        }
    }
    paste(data) {
        (0, Clipboard_1.paste)(data, this.textarea, this.coreService, this.optionsService);
    }
    attachCustomKeyEventHandler(customKeyEventHandler) {
        this._customKeyEventHandler = customKeyEventHandler;
    }
    attachCustomWheelEventHandler(customWheelEventHandler) {
        this._customWheelEventHandler = customWheelEventHandler;
    }
    registerLinkProvider(linkProvider) {
        return this._linkProviderService.registerLinkProvider(linkProvider);
    }
    registerCharacterJoiner(handler) {
        if (!this._characterJoinerService) {
            throw new Error('Terminal must be opened first');
        }
        const joinerId = this._characterJoinerService.register(handler);
        this.refresh(0, this.rows - 1);
        return joinerId;
    }
    deregisterCharacterJoiner(joinerId) {
        if (!this._characterJoinerService) {
            throw new Error('Terminal must be opened first');
        }
        if (this._characterJoinerService.deregister(joinerId)) {
            this.refresh(0, this.rows - 1);
        }
    }
    get markers() {
        return this.buffer.markers;
    }
    registerMarker(cursorYOffset) {
        return this.buffer.addMarker(this.buffer.ybase + this.buffer.y + cursorYOffset);
    }
    registerDecoration(decorationOptions) {
        return this._decorationService.registerDecoration(decorationOptions);
    }
    hasSelection() {
        return this._selectionService ? this._selectionService.hasSelection : false;
    }
    select(column, row, length) {
        this._selectionService.setSelection(column, row, length);
    }
    getSelection() {
        return this._selectionService ? this._selectionService.selectionText : '';
    }
    getSelectionPosition() {
        if (!this._selectionService || !this._selectionService.hasSelection) {
            return undefined;
        }
        return {
            start: {
                x: this._selectionService.selectionStart[0],
                y: this._selectionService.selectionStart[1]
            },
            end: {
                x: this._selectionService.selectionEnd[0],
                y: this._selectionService.selectionEnd[1]
            }
        };
    }
    clearSelection() {
        this._selectionService?.clearSelection();
    }
    selectAll() {
        this._selectionService?.selectAll();
    }
    selectLines(start, end) {
        this._selectionService?.selectLines(start, end);
    }
    _keyDown(event) {
        this._keyDownHandled = false;
        this._keyDownSeen = true;
        if (this._customKeyEventHandler && this._customKeyEventHandler(event) === false) {
            return false;
        }
        const shouldIgnoreComposition = this.browser.isMac && this.options.macOptionIsMeta && event.altKey;
        if (!shouldIgnoreComposition && !this._compositionHelper.keydown(event)) {
            if (this.options.scrollOnUserInput && this.buffer.ybase !== this.buffer.ydisp) {
                this.scrollToBottom();
            }
            return false;
        }
        if (!shouldIgnoreComposition && (event.key === 'Dead' || event.key === 'AltGraph')) {
            this._unprocessedDeadKey = true;
        }
        const result = (0, Keyboard_1.evaluateKeyboardEvent)(event, this.coreService.decPrivateModes.applicationCursorKeys, this.browser.isMac, this.options.macOptionIsMeta);
        this.updateCursorStyle(event);
        if (result.type === 3 || result.type === 2) {
            const scrollCount = this.rows - 1;
            this.scrollLines(result.type === 2 ? -scrollCount : scrollCount);
            return this.cancel(event, true);
        }
        if (result.type === 1) {
            this.selectAll();
        }
        if (this._isThirdLevelShift(this.browser, event)) {
            return true;
        }
        if (result.cancel) {
            this.cancel(event, true);
        }
        if (!result.key) {
            return true;
        }
        if (event.key && !event.ctrlKey && !event.altKey && !event.metaKey && event.key.length === 1) {
            if (event.key.charCodeAt(0) >= 65 && event.key.charCodeAt(0) <= 90) {
                return true;
            }
        }
        if (this._unprocessedDeadKey) {
            this._unprocessedDeadKey = false;
            return true;
        }
        if (result.key === EscapeSequences_1.C0.ETX || result.key === EscapeSequences_1.C0.CR) {
            this.textarea.value = '';
        }
        this._onKey.fire({ key: result.key, domEvent: event });
        this._showCursor();
        this.coreService.triggerDataEvent(result.key, true);
        if (!this.optionsService.rawOptions.screenReaderMode || event.altKey || event.ctrlKey) {
            return this.cancel(event, true);
        }
        this._keyDownHandled = true;
    }
    _isThirdLevelShift(browser, ev) {
        const thirdLevelKey = (browser.isMac && !this.options.macOptionIsMeta && ev.altKey && !ev.ctrlKey && !ev.metaKey) ||
            (browser.isWindows && ev.altKey && ev.ctrlKey && !ev.metaKey) ||
            (browser.isWindows && ev.getModifierState('AltGraph'));
        if (ev.type === 'keypress') {
            return thirdLevelKey;
        }
        return thirdLevelKey && (!ev.keyCode || ev.keyCode > 47);
    }
    _keyUp(ev) {
        this._keyDownSeen = false;
        if (this._customKeyEventHandler && this._customKeyEventHandler(ev) === false) {
            return;
        }
        if (!wasModifierKeyOnlyEvent(ev)) {
            this.focus();
        }
        this.updateCursorStyle(ev);
        this._keyPressHandled = false;
    }
    _keyPress(ev) {
        let key;
        this._keyPressHandled = false;
        if (this._keyDownHandled) {
            return false;
        }
        if (this._customKeyEventHandler && this._customKeyEventHandler(ev) === false) {
            return false;
        }
        this.cancel(ev);
        if (ev.charCode) {
            key = ev.charCode;
        }
        else if (ev.which === null || ev.which === undefined) {
            key = ev.keyCode;
        }
        else if (ev.which !== 0 && ev.charCode !== 0) {
            key = ev.which;
        }
        else {
            return false;
        }
        if (!key || ((ev.altKey || ev.ctrlKey || ev.metaKey) && !this._isThirdLevelShift(this.browser, ev))) {
            return false;
        }
        key = String.fromCharCode(key);
        this._onKey.fire({ key, domEvent: ev });
        this._showCursor();
        this.coreService.triggerDataEvent(key, true);
        this._keyPressHandled = true;
        this._unprocessedDeadKey = false;
        return true;
    }
    _inputEvent(ev) {
        if (ev.data && ev.inputType === 'insertText' && (!ev.composed || !this._keyDownSeen) && !this.optionsService.rawOptions.screenReaderMode) {
            if (this._keyPressHandled) {
                return false;
            }
            this._unprocessedDeadKey = false;
            const text = ev.data;
            this.coreService.triggerDataEvent(text, true);
            this.cancel(ev);
            return true;
        }
        return false;
    }
    resize(x, y) {
        if (x === this.cols && y === this.rows) {
            if (this._charSizeService && !this._charSizeService.hasValidSize) {
                this._charSizeService.measure();
            }
            return;
        }
        super.resize(x, y);
    }
    _afterResize(x, y) {
        this._charSizeService?.measure();
        this.viewport?.syncScrollArea(true);
    }
    clear() {
        if (this.buffer.ybase === 0 && this.buffer.y === 0) {
            return;
        }
        this.buffer.clearAllMarkers();
        this.buffer.lines.set(0, this.buffer.lines.get(this.buffer.ybase + this.buffer.y));
        this.buffer.lines.length = 1;
        this.buffer.ydisp = 0;
        this.buffer.ybase = 0;
        this.buffer.y = 0;
        for (let i = 1; i < this.rows; i++) {
            this.buffer.lines.push(this.buffer.getBlankLine(BufferLine_1.DEFAULT_ATTR_DATA));
        }
        this._onScroll.fire({ position: this.buffer.ydisp, source: 0 });
        this.viewport?.reset();
        this.refresh(0, this.rows - 1);
    }
    reset() {
        this.options.rows = this.rows;
        this.options.cols = this.cols;
        const customKeyEventHandler = this._customKeyEventHandler;
        this._setup();
        super.reset();
        this._selectionService?.reset();
        this._decorationService.reset();
        this.viewport?.reset();
        this._customKeyEventHandler = customKeyEventHandler;
        this.refresh(0, this.rows - 1);
    }
    clearTextureAtlas() {
        this._renderService?.clearTextureAtlas();
    }
    _reportFocus() {
        if (this.element?.classList.contains('focus')) {
            this.coreService.triggerDataEvent(EscapeSequences_1.C0.ESC + '[I');
        }
        else {
            this.coreService.triggerDataEvent(EscapeSequences_1.C0.ESC + '[O');
        }
    }
    _reportWindowsOptions(type) {
        if (!this._renderService) {
            return;
        }
        switch (type) {
            case InputHandler_1.WindowsOptionsReportType.GET_WIN_SIZE_PIXELS:
                const canvasWidth = this._renderService.dimensions.css.canvas.width.toFixed(0);
                const canvasHeight = this._renderService.dimensions.css.canvas.height.toFixed(0);
                this.coreService.triggerDataEvent(`${EscapeSequences_1.C0.ESC}[4;${canvasHeight};${canvasWidth}t`);
                break;
            case InputHandler_1.WindowsOptionsReportType.GET_CELL_SIZE_PIXELS:
                const cellWidth = this._renderService.dimensions.css.cell.width.toFixed(0);
                const cellHeight = this._renderService.dimensions.css.cell.height.toFixed(0);
                this.coreService.triggerDataEvent(`${EscapeSequences_1.C0.ESC}[6;${cellHeight};${cellWidth}t`);
                break;
        }
    }
    cancel(ev, force) {
        if (!this.options.cancelEvents && !force) {
            return;
        }
        ev.preventDefault();
        ev.stopPropagation();
        return false;
    }
}
exports.Terminal = Terminal;
function wasModifierKeyOnlyEvent(ev) {
    return ev.keyCode === 16 ||
        ev.keyCode === 17 ||
        ev.keyCode === 18;
}
//# sourceMappingURL=Terminal.js.map