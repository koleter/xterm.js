"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextRenderLayer = void 0;
const CharacterJoinerService_1 = require("browser/services/CharacterJoinerService");
const AttributeData_1 = require("common/buffer/AttributeData");
const CellData_1 = require("common/buffer/CellData");
const Constants_1 = require("common/buffer/Constants");
const BaseRenderLayer_1 = require("./BaseRenderLayer");
const GridCache_1 = require("./GridCache");
class TextRenderLayer extends BaseRenderLayer_1.BaseRenderLayer {
    constructor(terminal, container, zIndex, alpha, bufferService, optionsService, _characterJoinerService, decorationService, coreBrowserService, themeService) {
        super(terminal, container, 'text', zIndex, alpha, themeService, bufferService, optionsService, decorationService, coreBrowserService);
        this._characterJoinerService = _characterJoinerService;
        this._characterWidth = 0;
        this._characterFont = '';
        this._characterOverlapCache = {};
        this._workCell = new CellData_1.CellData();
        this._state = new GridCache_1.GridCache();
        this.register(optionsService.onSpecificOptionChange('allowTransparency', value => this._setTransparency(value)));
    }
    resize(dim) {
        super.resize(dim);
        const terminalFont = this._getFont(false, false);
        if (this._characterWidth !== dim.device.char.width || this._characterFont !== terminalFont) {
            this._characterWidth = dim.device.char.width;
            this._characterFont = terminalFont;
            this._characterOverlapCache = {};
        }
        this._state.clear();
        this._state.resize(this._bufferService.cols, this._bufferService.rows);
    }
    reset() {
        this._state.clear();
        this._clearAll();
    }
    _forEachCell(firstRow, lastRow, callback) {
        for (let y = firstRow; y <= lastRow; y++) {
            const row = y + this._bufferService.buffer.ydisp;
            const line = this._bufferService.buffer.lines.get(row);
            const joinedRanges = this._characterJoinerService.getJoinedCharacters(row);
            for (let x = 0; x < this._bufferService.cols; x++) {
                line.loadCell(x, this._workCell);
                let cell = this._workCell;
                let isJoined = false;
                let lastCharX = x;
                if (cell.getWidth() === 0) {
                    continue;
                }
                if (joinedRanges.length > 0 && x === joinedRanges[0][0]) {
                    isJoined = true;
                    const range = joinedRanges.shift();
                    cell = new CharacterJoinerService_1.JoinedCellData(this._workCell, line.translateToString(true, range[0], range[1]), range[1] - range[0]);
                    lastCharX = range[1] - 1;
                }
                if (!isJoined && this._isOverlapping(cell)) {
                    if (lastCharX < line.length - 1 && line.getCodePoint(lastCharX + 1) === Constants_1.NULL_CELL_CODE) {
                        cell.content &= ~12582912;
                        cell.content |= 2 << 22;
                    }
                }
                callback(cell, x, y);
                x = lastCharX;
            }
        }
    }
    _drawBackground(firstRow, lastRow) {
        const ctx = this._ctx;
        const cols = this._bufferService.cols;
        let startX = 0;
        let startY = 0;
        let prevFillStyle = null;
        ctx.save();
        this._forEachCell(firstRow, lastRow, (cell, x, y) => {
            let nextFillStyle = null;
            if (cell.isInverse()) {
                if (cell.isFgDefault()) {
                    nextFillStyle = this._themeService.colors.foreground.css;
                }
                else if (cell.isFgRGB()) {
                    nextFillStyle = `rgb(${AttributeData_1.AttributeData.toColorRGB(cell.getFgColor()).join(',')})`;
                }
                else {
                    nextFillStyle = this._themeService.colors.ansi[cell.getFgColor()].css;
                }
            }
            else if (cell.isBgRGB()) {
                nextFillStyle = `rgb(${AttributeData_1.AttributeData.toColorRGB(cell.getBgColor()).join(',')})`;
            }
            else if (cell.isBgPalette()) {
                nextFillStyle = this._themeService.colors.ansi[cell.getBgColor()].css;
            }
            let isTop = false;
            this._decorationService.forEachDecorationAtCell(x, this._bufferService.buffer.ydisp + y, undefined, d => {
                if (d.options.layer !== 'top' && isTop) {
                    return;
                }
                if (d.backgroundColorRGB) {
                    nextFillStyle = d.backgroundColorRGB.css;
                }
                isTop = d.options.layer === 'top';
            });
            if (prevFillStyle === null) {
                startX = x;
                startY = y;
            }
            if (y !== startY) {
                ctx.fillStyle = prevFillStyle || '';
                this._fillCells(startX, startY, cols - startX, 1);
                startX = x;
                startY = y;
            }
            else if (prevFillStyle !== nextFillStyle) {
                ctx.fillStyle = prevFillStyle || '';
                this._fillCells(startX, startY, x - startX, 1);
                startX = x;
                startY = y;
            }
            prevFillStyle = nextFillStyle;
        });
        if (prevFillStyle !== null) {
            ctx.fillStyle = prevFillStyle;
            this._fillCells(startX, startY, cols - startX, 1);
        }
        ctx.restore();
    }
    _drawForeground(firstRow, lastRow) {
        this._forEachCell(firstRow, lastRow, (cell, x, y) => this._drawChars(cell, x, y));
    }
    handleGridChanged(firstRow, lastRow) {
        if (this._state.cache.length === 0) {
            return;
        }
        if (this._charAtlas) {
            this._charAtlas.beginFrame();
        }
        this._clearCells(0, firstRow, this._bufferService.cols, lastRow - firstRow + 1);
        this._drawBackground(firstRow, lastRow);
        this._drawForeground(firstRow, lastRow);
    }
    _isOverlapping(cell) {
        if (cell.getWidth() !== 1) {
            return false;
        }
        if (cell.getCode() < 256) {
            return false;
        }
        const chars = cell.getChars();
        if (this._characterOverlapCache.hasOwnProperty(chars)) {
            return this._characterOverlapCache[chars];
        }
        this._ctx.save();
        this._ctx.font = this._characterFont;
        const overlaps = Math.floor(this._ctx.measureText(chars).width) > this._characterWidth;
        this._ctx.restore();
        this._characterOverlapCache[chars] = overlaps;
        return overlaps;
    }
}
exports.TextRenderLayer = TextRenderLayer;
//# sourceMappingURL=TextRenderLayer.js.map