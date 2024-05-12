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
exports.Linkifier = void 0;
const Lifecycle_1 = require("browser/Lifecycle");
const EventEmitter_1 = require("common/EventEmitter");
const Lifecycle_2 = require("common/Lifecycle");
const Services_1 = require("common/services/Services");
const Services_2 = require("./services/Services");
let Linkifier = exports.Linkifier = class Linkifier extends Lifecycle_2.Disposable {
    get currentLink() { return this._currentLink; }
    constructor(_element, _mouseService, _renderService, _bufferService, _linkProviderService) {
        super();
        this._element = _element;
        this._mouseService = _mouseService;
        this._renderService = _renderService;
        this._bufferService = _bufferService;
        this._linkProviderService = _linkProviderService;
        this._linkCacheDisposables = [];
        this._isMouseOut = true;
        this._wasResized = false;
        this._activeLine = -1;
        this._onShowLinkUnderline = this.register(new EventEmitter_1.EventEmitter());
        this.onShowLinkUnderline = this._onShowLinkUnderline.event;
        this._onHideLinkUnderline = this.register(new EventEmitter_1.EventEmitter());
        this.onHideLinkUnderline = this._onHideLinkUnderline.event;
        this.register((0, Lifecycle_2.getDisposeArrayDisposable)(this._linkCacheDisposables));
        this.register((0, Lifecycle_2.toDisposable)(() => {
            this._lastMouseEvent = undefined;
            this._activeProviderReplies?.clear();
        }));
        this.register(this._bufferService.onResize(() => {
            this._clearCurrentLink();
            this._wasResized = true;
        }));
        this.register((0, Lifecycle_1.addDisposableDomListener)(this._element, 'mouseleave', () => {
            this._isMouseOut = true;
            this._clearCurrentLink();
        }));
        this.register((0, Lifecycle_1.addDisposableDomListener)(this._element, 'mousemove', this._handleMouseMove.bind(this)));
        this.register((0, Lifecycle_1.addDisposableDomListener)(this._element, 'mousedown', this._handleMouseDown.bind(this)));
        this.register((0, Lifecycle_1.addDisposableDomListener)(this._element, 'mouseup', this._handleMouseUp.bind(this)));
    }
    _handleMouseMove(event) {
        this._lastMouseEvent = event;
        const position = this._positionFromMouseEvent(event, this._element, this._mouseService);
        if (!position) {
            return;
        }
        this._isMouseOut = false;
        const composedPath = event.composedPath();
        for (let i = 0; i < composedPath.length; i++) {
            const target = composedPath[i];
            if (target.classList.contains('xterm')) {
                break;
            }
            if (target.classList.contains('xterm-hover')) {
                return;
            }
        }
        if (!this._lastBufferCell || (position.x !== this._lastBufferCell.x || position.y !== this._lastBufferCell.y)) {
            this._handleHover(position);
            this._lastBufferCell = position;
        }
    }
    _handleHover(position) {
        if (this._activeLine !== position.y || this._wasResized) {
            this._clearCurrentLink();
            this._askForLink(position, false);
            this._wasResized = false;
            return;
        }
        const isCurrentLinkInPosition = this._currentLink && this._linkAtPosition(this._currentLink.link, position);
        if (!isCurrentLinkInPosition) {
            this._clearCurrentLink();
            this._askForLink(position, true);
        }
    }
    _askForLink(position, useLineCache) {
        if (!this._activeProviderReplies || !useLineCache) {
            this._activeProviderReplies?.forEach(reply => {
                reply?.forEach(linkWithState => {
                    if (linkWithState.link.dispose) {
                        linkWithState.link.dispose();
                    }
                });
            });
            this._activeProviderReplies = new Map();
            this._activeLine = position.y;
        }
        let linkProvided = false;
        for (const [i, linkProvider] of this._linkProviderService.linkProviders.entries()) {
            if (useLineCache) {
                const existingReply = this._activeProviderReplies?.get(i);
                if (existingReply) {
                    linkProvided = this._checkLinkProviderResult(i, position, linkProvided);
                }
            }
            else {
                linkProvider.provideLinks(position.y, (links) => {
                    if (this._isMouseOut) {
                        return;
                    }
                    const linksWithState = links?.map(link => ({ link }));
                    this._activeProviderReplies?.set(i, linksWithState);
                    linkProvided = this._checkLinkProviderResult(i, position, linkProvided);
                    if (this._activeProviderReplies?.size === this._linkProviderService.linkProviders.length) {
                        this._removeIntersectingLinks(position.y, this._activeProviderReplies);
                    }
                });
            }
        }
    }
    _removeIntersectingLinks(y, replies) {
        const occupiedCells = new Set();
        for (let i = 0; i < replies.size; i++) {
            const providerReply = replies.get(i);
            if (!providerReply) {
                continue;
            }
            for (let i = 0; i < providerReply.length; i++) {
                const linkWithState = providerReply[i];
                const startX = linkWithState.link.range.start.y < y ? 0 : linkWithState.link.range.start.x;
                const endX = linkWithState.link.range.end.y > y ? this._bufferService.cols : linkWithState.link.range.end.x;
                for (let x = startX; x <= endX; x++) {
                    if (occupiedCells.has(x)) {
                        providerReply.splice(i--, 1);
                        break;
                    }
                    occupiedCells.add(x);
                }
            }
        }
    }
    _checkLinkProviderResult(index, position, linkProvided) {
        if (!this._activeProviderReplies) {
            return linkProvided;
        }
        const links = this._activeProviderReplies.get(index);
        let hasLinkBefore = false;
        for (let j = 0; j < index; j++) {
            if (!this._activeProviderReplies.has(j) || this._activeProviderReplies.get(j)) {
                hasLinkBefore = true;
            }
        }
        if (!hasLinkBefore && links) {
            const linkAtPosition = links.find(link => this._linkAtPosition(link.link, position));
            if (linkAtPosition) {
                linkProvided = true;
                this._handleNewLink(linkAtPosition);
            }
        }
        if (this._activeProviderReplies.size === this._linkProviderService.linkProviders.length && !linkProvided) {
            for (let j = 0; j < this._activeProviderReplies.size; j++) {
                const currentLink = this._activeProviderReplies.get(j)?.find(link => this._linkAtPosition(link.link, position));
                if (currentLink) {
                    linkProvided = true;
                    this._handleNewLink(currentLink);
                    break;
                }
            }
        }
        return linkProvided;
    }
    _handleMouseDown() {
        this._mouseDownLink = this._currentLink;
    }
    _handleMouseUp(event) {
        if (!this._currentLink) {
            return;
        }
        const position = this._positionFromMouseEvent(event, this._element, this._mouseService);
        if (!position) {
            return;
        }
        if (this._mouseDownLink === this._currentLink && this._linkAtPosition(this._currentLink.link, position)) {
            this._currentLink.link.activate(event, this._currentLink.link.text);
        }
    }
    _clearCurrentLink(startRow, endRow) {
        if (!this._currentLink || !this._lastMouseEvent) {
            return;
        }
        if (!startRow || !endRow || (this._currentLink.link.range.start.y >= startRow && this._currentLink.link.range.end.y <= endRow)) {
            this._linkLeave(this._element, this._currentLink.link, this._lastMouseEvent);
            this._currentLink = undefined;
            (0, Lifecycle_2.disposeArray)(this._linkCacheDisposables);
        }
    }
    _handleNewLink(linkWithState) {
        if (!this._lastMouseEvent) {
            return;
        }
        const position = this._positionFromMouseEvent(this._lastMouseEvent, this._element, this._mouseService);
        if (!position) {
            return;
        }
        if (this._linkAtPosition(linkWithState.link, position)) {
            this._currentLink = linkWithState;
            this._currentLink.state = {
                decorations: {
                    underline: linkWithState.link.decorations === undefined ? true : linkWithState.link.decorations.underline,
                    pointerCursor: linkWithState.link.decorations === undefined ? true : linkWithState.link.decorations.pointerCursor
                },
                isHovered: true
            };
            this._linkHover(this._element, linkWithState.link, this._lastMouseEvent);
            linkWithState.link.decorations = {};
            Object.defineProperties(linkWithState.link.decorations, {
                pointerCursor: {
                    get: () => this._currentLink?.state?.decorations.pointerCursor,
                    set: v => {
                        if (this._currentLink?.state && this._currentLink.state.decorations.pointerCursor !== v) {
                            this._currentLink.state.decorations.pointerCursor = v;
                            if (this._currentLink.state.isHovered) {
                                this._element.classList.toggle('xterm-cursor-pointer', v);
                            }
                        }
                    }
                },
                underline: {
                    get: () => this._currentLink?.state?.decorations.underline,
                    set: v => {
                        if (this._currentLink?.state && this._currentLink?.state?.decorations.underline !== v) {
                            this._currentLink.state.decorations.underline = v;
                            if (this._currentLink.state.isHovered) {
                                this._fireUnderlineEvent(linkWithState.link, v);
                            }
                        }
                    }
                }
            });
            this._linkCacheDisposables.push(this._renderService.onRenderedViewportChange(e => {
                if (!this._currentLink) {
                    return;
                }
                const start = e.start === 0 ? 0 : e.start + 1 + this._bufferService.buffer.ydisp;
                const end = this._bufferService.buffer.ydisp + 1 + e.end;
                if (this._currentLink.link.range.start.y >= start && this._currentLink.link.range.end.y <= end) {
                    this._clearCurrentLink(start, end);
                    if (this._lastMouseEvent) {
                        const position = this._positionFromMouseEvent(this._lastMouseEvent, this._element, this._mouseService);
                        if (position) {
                            this._askForLink(position, false);
                        }
                    }
                }
            }));
        }
    }
    _linkHover(element, link, event) {
        if (this._currentLink?.state) {
            this._currentLink.state.isHovered = true;
            if (this._currentLink.state.decorations.underline) {
                this._fireUnderlineEvent(link, true);
            }
            if (this._currentLink.state.decorations.pointerCursor) {
                element.classList.add('xterm-cursor-pointer');
            }
        }
        if (link.hover) {
            link.hover(event, link.text);
        }
    }
    _fireUnderlineEvent(link, showEvent) {
        const range = link.range;
        const scrollOffset = this._bufferService.buffer.ydisp;
        const event = this._createLinkUnderlineEvent(range.start.x - 1, range.start.y - scrollOffset - 1, range.end.x, range.end.y - scrollOffset - 1, undefined);
        const emitter = showEvent ? this._onShowLinkUnderline : this._onHideLinkUnderline;
        emitter.fire(event);
    }
    _linkLeave(element, link, event) {
        if (this._currentLink?.state) {
            this._currentLink.state.isHovered = false;
            if (this._currentLink.state.decorations.underline) {
                this._fireUnderlineEvent(link, false);
            }
            if (this._currentLink.state.decorations.pointerCursor) {
                element.classList.remove('xterm-cursor-pointer');
            }
        }
        if (link.leave) {
            link.leave(event, link.text);
        }
    }
    _linkAtPosition(link, position) {
        const lower = link.range.start.y * this._bufferService.cols + link.range.start.x;
        const upper = link.range.end.y * this._bufferService.cols + link.range.end.x;
        const current = position.y * this._bufferService.cols + position.x;
        return (lower <= current && current <= upper);
    }
    _positionFromMouseEvent(event, element, mouseService) {
        const coords = mouseService.getCoords(event, element, this._bufferService.cols, this._bufferService.rows);
        if (!coords) {
            return;
        }
        return { x: coords[0], y: coords[1] + this._bufferService.buffer.ydisp };
    }
    _createLinkUnderlineEvent(x1, y1, x2, y2, fg) {
        return { x1, y1, x2, y2, cols: this._bufferService.cols, fg };
    }
};
exports.Linkifier = Linkifier = __decorate([
    __param(1, Services_2.IMouseService),
    __param(2, Services_2.IRenderService),
    __param(3, Services_1.IBufferService),
    __param(4, Services_2.ILinkProviderService)
], Linkifier);
//# sourceMappingURL=Linkifier.js.map