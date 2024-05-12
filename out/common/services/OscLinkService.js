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
exports.OscLinkService = void 0;
const Services_1 = require("common/services/Services");
let OscLinkService = exports.OscLinkService = class OscLinkService {
    constructor(_bufferService) {
        this._bufferService = _bufferService;
        this._nextId = 1;
        this._entriesWithId = new Map();
        this._dataByLinkId = new Map();
    }
    registerLink(data) {
        const buffer = this._bufferService.buffer;
        if (data.id === undefined) {
            const marker = buffer.addMarker(buffer.ybase + buffer.y);
            const entry = {
                data,
                id: this._nextId++,
                lines: [marker]
            };
            marker.onDispose(() => this._removeMarkerFromLink(entry, marker));
            this._dataByLinkId.set(entry.id, entry);
            return entry.id;
        }
        const castData = data;
        const key = this._getEntryIdKey(castData);
        const match = this._entriesWithId.get(key);
        if (match) {
            this.addLineToLink(match.id, buffer.ybase + buffer.y);
            return match.id;
        }
        const marker = buffer.addMarker(buffer.ybase + buffer.y);
        const entry = {
            id: this._nextId++,
            key: this._getEntryIdKey(castData),
            data: castData,
            lines: [marker]
        };
        marker.onDispose(() => this._removeMarkerFromLink(entry, marker));
        this._entriesWithId.set(entry.key, entry);
        this._dataByLinkId.set(entry.id, entry);
        return entry.id;
    }
    addLineToLink(linkId, y) {
        const entry = this._dataByLinkId.get(linkId);
        if (!entry) {
            return;
        }
        if (entry.lines.every(e => e.line !== y)) {
            const marker = this._bufferService.buffer.addMarker(y);
            entry.lines.push(marker);
            marker.onDispose(() => this._removeMarkerFromLink(entry, marker));
        }
    }
    getLinkData(linkId) {
        return this._dataByLinkId.get(linkId)?.data;
    }
    _getEntryIdKey(linkData) {
        return `${linkData.id};;${linkData.uri}`;
    }
    _removeMarkerFromLink(entry, marker) {
        const index = entry.lines.indexOf(marker);
        if (index === -1) {
            return;
        }
        entry.lines.splice(index, 1);
        if (entry.lines.length === 0) {
            if (entry.data.id !== undefined) {
                this._entriesWithId.delete(entry.key);
            }
            this._dataByLinkId.delete(entry.id);
        }
    }
};
exports.OscLinkService = OscLinkService = __decorate([
    __param(0, Services_1.IBufferService)
], OscLinkService);
//# sourceMappingURL=OscLinkService.js.map