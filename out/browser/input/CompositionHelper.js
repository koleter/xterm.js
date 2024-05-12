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
exports.CompositionHelper = void 0;
const Services_1 = require("browser/services/Services");
const Services_2 = require("common/services/Services");
const EscapeSequences_1 = require("common/data/EscapeSequences");
let CompositionHelper = exports.CompositionHelper = class CompositionHelper {
    get isComposing() { return this._isComposing; }
    constructor(_textarea, _compositionView, _bufferService, _optionsService, _coreService, _renderService) {
        this._textarea = _textarea;
        this._compositionView = _compositionView;
        this._bufferService = _bufferService;
        this._optionsService = _optionsService;
        this._coreService = _coreService;
        this._renderService = _renderService;
        this._isComposing = false;
        this._isSendingComposition = false;
        this._compositionPosition = { start: 0, end: 0 };
        this._dataAlreadySent = '';
    }
    compositionstart() {
        this._isComposing = true;
        this._compositionPosition.start = this._textarea.value.length;
        this._compositionView.textContent = '';
        this._dataAlreadySent = '';
        this._compositionView.classList.add('active');
    }
    compositionupdate(ev) {
        this._compositionView.textContent = ev.data;
        this.updateCompositionElements();
        setTimeout(() => {
            this._compositionPosition.end = this._textarea.value.length;
        }, 0);
    }
    compositionend() {
        this._finalizeComposition(true);
    }
    keydown(ev) {
        if (this._isComposing || this._isSendingComposition) {
            if (ev.keyCode === 229) {
                return false;
            }
            if (ev.keyCode === 16 || ev.keyCode === 17 || ev.keyCode === 18) {
                return false;
            }
            this._finalizeComposition(false);
        }
        if (ev.keyCode === 229) {
            this._handleAnyTextareaChanges();
            return false;
        }
        return true;
    }
    _finalizeComposition(waitForPropagation) {
        this._compositionView.classList.remove('active');
        this._isComposing = false;
        if (!waitForPropagation) {
            this._isSendingComposition = false;
            const input = this._textarea.value.substring(this._compositionPosition.start, this._compositionPosition.end);
            this._coreService.triggerDataEvent(input, true);
        }
        else {
            const currentCompositionPosition = {
                start: this._compositionPosition.start,
                end: this._compositionPosition.end
            };
            this._isSendingComposition = true;
            setTimeout(() => {
                if (this._isSendingComposition) {
                    this._isSendingComposition = false;
                    let input;
                    currentCompositionPosition.start += this._dataAlreadySent.length;
                    if (this._isComposing) {
                        input = this._textarea.value.substring(currentCompositionPosition.start, this._compositionPosition.start);
                    }
                    else {
                        input = this._textarea.value.substring(currentCompositionPosition.start);
                    }
                    if (input.length > 0) {
                        this._coreService.triggerDataEvent(input, true);
                    }
                }
            }, 0);
        }
    }
    _handleAnyTextareaChanges() {
        const oldValue = this._textarea.value;
        setTimeout(() => {
            if (!this._isComposing) {
                const newValue = this._textarea.value;
                const diff = newValue.replace(oldValue, '');
                this._dataAlreadySent = diff;
                if (newValue.length > oldValue.length) {
                    this._coreService.triggerDataEvent(diff, true);
                }
                else if (newValue.length < oldValue.length) {
                    this._coreService.triggerDataEvent(`${EscapeSequences_1.C0.DEL}`, true);
                }
                else if ((newValue.length === oldValue.length) && (newValue !== oldValue)) {
                    this._coreService.triggerDataEvent(newValue, true);
                }
            }
        }, 0);
    }
    updateCompositionElements(dontRecurse) {
        if (!this._isComposing) {
            return;
        }
        if (this._bufferService.buffer.isCursorInViewport) {
            const cursorX = Math.min(this._bufferService.buffer.x, this._bufferService.cols - 1);
            const cellHeight = this._renderService.dimensions.css.cell.height;
            const cursorTop = this._bufferService.buffer.y * this._renderService.dimensions.css.cell.height;
            const cursorLeft = cursorX * this._renderService.dimensions.css.cell.width;
            this._compositionView.style.left = cursorLeft + 'px';
            this._compositionView.style.top = cursorTop + 'px';
            this._compositionView.style.height = cellHeight + 'px';
            this._compositionView.style.lineHeight = cellHeight + 'px';
            this._compositionView.style.fontFamily = this._optionsService.rawOptions.fontFamily;
            this._compositionView.style.fontSize = this._optionsService.rawOptions.fontSize + 'px';
            const compositionViewBounds = this._compositionView.getBoundingClientRect();
            this._textarea.style.left = cursorLeft + 'px';
            this._textarea.style.top = cursorTop + 'px';
            this._textarea.style.width = Math.max(compositionViewBounds.width, 1) + 'px';
            this._textarea.style.height = Math.max(compositionViewBounds.height, 1) + 'px';
            this._textarea.style.lineHeight = compositionViewBounds.height + 'px';
        }
        if (!dontRecurse) {
            setTimeout(() => this.updateCompositionElements(true), 0);
        }
    }
};
exports.CompositionHelper = CompositionHelper = __decorate([
    __param(2, Services_2.IBufferService),
    __param(3, Services_2.IOptionsService),
    __param(4, Services_2.ICoreService),
    __param(5, Services_1.IRenderService)
], CompositionHelper);
//# sourceMappingURL=CompositionHelper.js.map