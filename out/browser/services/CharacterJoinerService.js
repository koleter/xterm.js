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
exports.CharacterJoinerService = exports.JoinedCellData = void 0;
const AttributeData_1 = require("common/buffer/AttributeData");
const Constants_1 = require("common/buffer/Constants");
const CellData_1 = require("common/buffer/CellData");
const Services_1 = require("common/services/Services");
class JoinedCellData extends AttributeData_1.AttributeData {
    constructor(firstCell, chars, width) {
        super();
        this.content = 0;
        this.combinedData = '';
        this.fg = firstCell.fg;
        this.bg = firstCell.bg;
        this.combinedData = chars;
        this._width = width;
    }
    isCombined() {
        return 2097152;
    }
    getWidth() {
        return this._width;
    }
    getChars() {
        return this.combinedData;
    }
    getCode() {
        return 0x1FFFFF;
    }
    setFromCharData(value) {
        throw new Error('not implemented');
    }
    getAsCharData() {
        return [this.fg, this.getChars(), this.getWidth(), this.getCode()];
    }
}
exports.JoinedCellData = JoinedCellData;
let CharacterJoinerService = exports.CharacterJoinerService = class CharacterJoinerService {
    constructor(_bufferService) {
        this._bufferService = _bufferService;
        this._characterJoiners = [];
        this._nextCharacterJoinerId = 0;
        this._workCell = new CellData_1.CellData();
    }
    register(handler) {
        const joiner = {
            id: this._nextCharacterJoinerId++,
            handler
        };
        this._characterJoiners.push(joiner);
        return joiner.id;
    }
    deregister(joinerId) {
        for (let i = 0; i < this._characterJoiners.length; i++) {
            if (this._characterJoiners[i].id === joinerId) {
                this._characterJoiners.splice(i, 1);
                return true;
            }
        }
        return false;
    }
    getJoinedCharacters(row) {
        if (this._characterJoiners.length === 0) {
            return [];
        }
        const line = this._bufferService.buffer.lines.get(row);
        if (!line || line.length === 0) {
            return [];
        }
        const ranges = [];
        const lineStr = line.translateToString(true);
        let rangeStartColumn = 0;
        let currentStringIndex = 0;
        let rangeStartStringIndex = 0;
        let rangeAttrFG = line.getFg(0);
        let rangeAttrBG = line.getBg(0);
        for (let x = 0; x < line.getTrimmedLength(); x++) {
            line.loadCell(x, this._workCell);
            if (this._workCell.getWidth() === 0) {
                continue;
            }
            if (this._workCell.fg !== rangeAttrFG || this._workCell.bg !== rangeAttrBG) {
                if (x - rangeStartColumn > 1) {
                    const joinedRanges = this._getJoinedRanges(lineStr, rangeStartStringIndex, currentStringIndex, line, rangeStartColumn);
                    for (let i = 0; i < joinedRanges.length; i++) {
                        ranges.push(joinedRanges[i]);
                    }
                }
                rangeStartColumn = x;
                rangeStartStringIndex = currentStringIndex;
                rangeAttrFG = this._workCell.fg;
                rangeAttrBG = this._workCell.bg;
            }
            currentStringIndex += this._workCell.getChars().length || Constants_1.WHITESPACE_CELL_CHAR.length;
        }
        if (this._bufferService.cols - rangeStartColumn > 1) {
            const joinedRanges = this._getJoinedRanges(lineStr, rangeStartStringIndex, currentStringIndex, line, rangeStartColumn);
            for (let i = 0; i < joinedRanges.length; i++) {
                ranges.push(joinedRanges[i]);
            }
        }
        return ranges;
    }
    _getJoinedRanges(line, startIndex, endIndex, lineData, startCol) {
        const text = line.substring(startIndex, endIndex);
        let allJoinedRanges = [];
        try {
            allJoinedRanges = this._characterJoiners[0].handler(text);
        }
        catch (error) {
            console.error(error);
        }
        for (let i = 1; i < this._characterJoiners.length; i++) {
            try {
                const joinerRanges = this._characterJoiners[i].handler(text);
                for (let j = 0; j < joinerRanges.length; j++) {
                    CharacterJoinerService._mergeRanges(allJoinedRanges, joinerRanges[j]);
                }
            }
            catch (error) {
                console.error(error);
            }
        }
        this._stringRangesToCellRanges(allJoinedRanges, lineData, startCol);
        return allJoinedRanges;
    }
    _stringRangesToCellRanges(ranges, line, startCol) {
        let currentRangeIndex = 0;
        let currentRangeStarted = false;
        let currentStringIndex = 0;
        let currentRange = ranges[currentRangeIndex];
        if (!currentRange) {
            return;
        }
        for (let x = startCol; x < this._bufferService.cols; x++) {
            const width = line.getWidth(x);
            const length = line.getString(x).length || Constants_1.WHITESPACE_CELL_CHAR.length;
            if (width === 0) {
                continue;
            }
            if (!currentRangeStarted && currentRange[0] <= currentStringIndex) {
                currentRange[0] = x;
                currentRangeStarted = true;
            }
            if (currentRange[1] <= currentStringIndex) {
                currentRange[1] = x;
                currentRange = ranges[++currentRangeIndex];
                if (!currentRange) {
                    break;
                }
                if (currentRange[0] <= currentStringIndex) {
                    currentRange[0] = x;
                    currentRangeStarted = true;
                }
                else {
                    currentRangeStarted = false;
                }
            }
            currentStringIndex += length;
        }
        if (currentRange) {
            currentRange[1] = this._bufferService.cols;
        }
    }
    static _mergeRanges(ranges, newRange) {
        let inRange = false;
        for (let i = 0; i < ranges.length; i++) {
            const range = ranges[i];
            if (!inRange) {
                if (newRange[1] <= range[0]) {
                    ranges.splice(i, 0, newRange);
                    return ranges;
                }
                if (newRange[1] <= range[1]) {
                    range[0] = Math.min(newRange[0], range[0]);
                    return ranges;
                }
                if (newRange[0] < range[1]) {
                    range[0] = Math.min(newRange[0], range[0]);
                    inRange = true;
                }
                continue;
            }
            else {
                if (newRange[1] <= range[0]) {
                    ranges[i - 1][1] = newRange[1];
                    return ranges;
                }
                if (newRange[1] <= range[1]) {
                    ranges[i - 1][1] = Math.max(newRange[1], range[1]);
                    ranges.splice(i, 1);
                    return ranges;
                }
                ranges.splice(i, 1);
                i--;
            }
        }
        if (inRange) {
            ranges[ranges.length - 1][1] = newRange[1];
        }
        else {
            ranges.push(newRange);
        }
        return ranges;
    }
};
exports.CharacterJoinerService = CharacterJoinerService = __decorate([
    __param(0, Services_1.IBufferService)
], CharacterJoinerService);
//# sourceMappingURL=CharacterJoinerService.js.map