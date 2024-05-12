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
exports.DomRendererRowFactory = void 0;
const Constants_1 = require("browser/renderer/shared/Constants");
const Constants_2 = require("common/buffer/Constants");
const CellData_1 = require("common/buffer/CellData");
const Services_1 = require("common/services/Services");
const Color_1 = require("common/Color");
const Services_2 = require("browser/services/Services");
const CharacterJoinerService_1 = require("browser/services/CharacterJoinerService");
const RendererUtils_1 = require("browser/renderer/shared/RendererUtils");
const AttributeData_1 = require("common/buffer/AttributeData");
let DomRendererRowFactory = exports.DomRendererRowFactory = class DomRendererRowFactory {
    constructor(_document, _characterJoinerService, _optionsService, _coreBrowserService, _coreService, _decorationService, _themeService) {
        this._document = _document;
        this._characterJoinerService = _characterJoinerService;
        this._optionsService = _optionsService;
        this._coreBrowserService = _coreBrowserService;
        this._coreService = _coreService;
        this._decorationService = _decorationService;
        this._themeService = _themeService;
        this._workCell = new CellData_1.CellData();
        this._columnSelectMode = false;
        this.defaultSpacing = 0;
    }
    handleSelectionChanged(start, end, columnSelectMode) {
        this._selectionStart = start;
        this._selectionEnd = end;
        this._columnSelectMode = columnSelectMode;
    }
    createRow(lineData, row, isCursorRow, cursorStyle, cursorInactiveStyle, cursorX, cursorBlink, cellWidth, widthCache, linkStart, linkEnd) {
        const elements = [];
        const joinedRanges = this._characterJoinerService.getJoinedCharacters(row);
        const colors = this._themeService.colors;
        let lineLength = lineData.getNoBgTrimmedLength();
        if (isCursorRow && lineLength < cursorX + 1) {
            lineLength = cursorX + 1;
        }
        let charElement;
        let cellAmount = 0;
        let text = '';
        let oldBg = 0;
        let oldFg = 0;
        let oldExt = 0;
        let oldLinkHover = false;
        let oldSpacing = 0;
        let oldIsInSelection = false;
        let spacing = 0;
        const classes = [];
        const hasHover = linkStart !== -1 && linkEnd !== -1;
        for (let x = 0; x < lineLength; x++) {
            lineData.loadCell(x, this._workCell);
            let width = this._workCell.getWidth();
            if (width === 0) {
                continue;
            }
            let isJoined = false;
            let lastCharX = x;
            let cell = this._workCell;
            if (joinedRanges.length > 0 && x === joinedRanges[0][0]) {
                isJoined = true;
                const range = joinedRanges.shift();
                cell = new CharacterJoinerService_1.JoinedCellData(this._workCell, lineData.translateToString(true, range[0], range[1]), range[1] - range[0]);
                lastCharX = range[1] - 1;
                width = cell.getWidth();
            }
            const isInSelection = this._isCellInSelection(x, row);
            const isCursorCell = isCursorRow && x === cursorX;
            const isLinkHover = hasHover && x >= linkStart && x <= linkEnd;
            let isDecorated = false;
            this._decorationService.forEachDecorationAtCell(x, row, undefined, d => {
                isDecorated = true;
            });
            let chars = cell.getChars() || Constants_2.WHITESPACE_CELL_CHAR;
            if (chars === ' ' && (cell.isUnderline() || cell.isOverline())) {
                chars = '\xa0';
            }
            spacing = width * cellWidth - widthCache.get(chars, cell.isBold(), cell.isItalic());
            if (!charElement) {
                charElement = this._document.createElement('span');
            }
            else {
                if (cellAmount
                    && ((isInSelection && oldIsInSelection)
                        || (!isInSelection && !oldIsInSelection && cell.bg === oldBg))
                    && ((isInSelection && oldIsInSelection && colors.selectionForeground)
                        || cell.fg === oldFg)
                    && cell.extended.ext === oldExt
                    && isLinkHover === oldLinkHover
                    && spacing === oldSpacing
                    && !isCursorCell
                    && !isJoined
                    && !isDecorated) {
                    if (cell.isInvisible()) {
                        text += Constants_2.WHITESPACE_CELL_CHAR;
                    }
                    else {
                        text += chars;
                    }
                    cellAmount++;
                    continue;
                }
                else {
                    if (cellAmount) {
                        charElement.textContent = text;
                    }
                    charElement = this._document.createElement('span');
                    cellAmount = 0;
                    text = '';
                }
            }
            oldBg = cell.bg;
            oldFg = cell.fg;
            oldExt = cell.extended.ext;
            oldLinkHover = isLinkHover;
            oldSpacing = spacing;
            oldIsInSelection = isInSelection;
            if (isJoined) {
                if (cursorX >= x && cursorX <= lastCharX) {
                    cursorX = x;
                }
            }
            if (!this._coreService.isCursorHidden && isCursorCell && this._coreService.isCursorInitialized) {
                classes.push("xterm-cursor");
                if (this._coreBrowserService.isFocused) {
                    if (cursorBlink) {
                        classes.push("xterm-cursor-blink");
                    }
                    classes.push(cursorStyle === 'bar'
                        ? "xterm-cursor-bar"
                        : cursorStyle === 'underline'
                            ? "xterm-cursor-underline"
                            : "xterm-cursor-block");
                }
                else {
                    if (cursorInactiveStyle) {
                        switch (cursorInactiveStyle) {
                            case 'outline':
                                classes.push("xterm-cursor-outline");
                                break;
                            case 'block':
                                classes.push("xterm-cursor-block");
                                break;
                            case 'bar':
                                classes.push("xterm-cursor-bar");
                                break;
                            case 'underline':
                                classes.push("xterm-cursor-underline");
                                break;
                            default:
                                break;
                        }
                    }
                }
            }
            if (cell.isBold()) {
                classes.push("xterm-bold");
            }
            if (cell.isItalic()) {
                classes.push("xterm-italic");
            }
            if (cell.isDim()) {
                classes.push("xterm-dim");
            }
            if (cell.isInvisible()) {
                text = Constants_2.WHITESPACE_CELL_CHAR;
            }
            else {
                text = cell.getChars() || Constants_2.WHITESPACE_CELL_CHAR;
            }
            if (cell.isUnderline()) {
                classes.push(`${"xterm-underline"}-${cell.extended.underlineStyle}`);
                if (text === ' ') {
                    text = '\xa0';
                }
                if (!cell.isUnderlineColorDefault()) {
                    if (cell.isUnderlineColorRGB()) {
                        charElement.style.textDecorationColor = `rgb(${AttributeData_1.AttributeData.toColorRGB(cell.getUnderlineColor()).join(',')})`;
                    }
                    else {
                        let fg = cell.getUnderlineColor();
                        if (this._optionsService.rawOptions.drawBoldTextInBrightColors && cell.isBold() && fg < 8) {
                            fg += 8;
                        }
                        charElement.style.textDecorationColor = colors.ansi[fg].css;
                    }
                }
            }
            if (cell.isOverline()) {
                classes.push("xterm-overline");
                if (text === ' ') {
                    text = '\xa0';
                }
            }
            if (cell.isStrikethrough()) {
                classes.push("xterm-strikethrough");
            }
            if (isLinkHover) {
                charElement.style.textDecoration = 'underline';
            }
            let fg = cell.getFgColor();
            let fgColorMode = cell.getFgColorMode();
            let bg = cell.getBgColor();
            let bgColorMode = cell.getBgColorMode();
            const isInverse = !!cell.isInverse();
            if (isInverse) {
                const temp = fg;
                fg = bg;
                bg = temp;
                const temp2 = fgColorMode;
                fgColorMode = bgColorMode;
                bgColorMode = temp2;
            }
            let bgOverride;
            let fgOverride;
            let isTop = false;
            this._decorationService.forEachDecorationAtCell(x, row, undefined, d => {
                if (d.options.layer !== 'top' && isTop) {
                    return;
                }
                if (d.backgroundColorRGB) {
                    bgColorMode = 50331648;
                    bg = d.backgroundColorRGB.rgba >> 8 & 0xFFFFFF;
                    bgOverride = d.backgroundColorRGB;
                }
                if (d.foregroundColorRGB) {
                    fgColorMode = 50331648;
                    fg = d.foregroundColorRGB.rgba >> 8 & 0xFFFFFF;
                    fgOverride = d.foregroundColorRGB;
                }
                isTop = d.options.layer === 'top';
            });
            if (!isTop && isInSelection) {
                bgOverride = this._coreBrowserService.isFocused ? colors.selectionBackgroundOpaque : colors.selectionInactiveBackgroundOpaque;
                bg = bgOverride.rgba >> 8 & 0xFFFFFF;
                bgColorMode = 50331648;
                isTop = true;
                if (colors.selectionForeground) {
                    fgColorMode = 50331648;
                    fg = colors.selectionForeground.rgba >> 8 & 0xFFFFFF;
                    fgOverride = colors.selectionForeground;
                }
            }
            if (isTop) {
                classes.push('xterm-decoration-top');
            }
            let resolvedBg;
            switch (bgColorMode) {
                case 16777216:
                case 33554432:
                    resolvedBg = colors.ansi[bg];
                    classes.push(`xterm-bg-${bg}`);
                    break;
                case 50331648:
                    resolvedBg = Color_1.channels.toColor(bg >> 16, bg >> 8 & 0xFF, bg & 0xFF);
                    this._addStyle(charElement, `background-color:#${padStart((bg >>> 0).toString(16), '0', 6)}`);
                    break;
                case 0:
                default:
                    if (isInverse) {
                        resolvedBg = colors.foreground;
                        classes.push(`xterm-bg-${Constants_1.INVERTED_DEFAULT_COLOR}`);
                    }
                    else {
                        resolvedBg = colors.background;
                    }
            }
            if (!bgOverride) {
                if (cell.isDim()) {
                    bgOverride = Color_1.color.multiplyOpacity(resolvedBg, 0.5);
                }
            }
            switch (fgColorMode) {
                case 16777216:
                case 33554432:
                    if (cell.isBold() && fg < 8 && this._optionsService.rawOptions.drawBoldTextInBrightColors) {
                        fg += 8;
                    }
                    if (!this._applyMinimumContrast(charElement, resolvedBg, colors.ansi[fg], cell, bgOverride, undefined)) {
                        classes.push(`xterm-fg-${fg}`);
                    }
                    break;
                case 50331648:
                    const color = Color_1.channels.toColor((fg >> 16) & 0xFF, (fg >> 8) & 0xFF, (fg) & 0xFF);
                    if (!this._applyMinimumContrast(charElement, resolvedBg, color, cell, bgOverride, fgOverride)) {
                        this._addStyle(charElement, `color:#${padStart(fg.toString(16), '0', 6)}`);
                    }
                    break;
                case 0:
                default:
                    if (!this._applyMinimumContrast(charElement, resolvedBg, colors.foreground, cell, bgOverride, fgOverride)) {
                        if (isInverse) {
                            classes.push(`xterm-fg-${Constants_1.INVERTED_DEFAULT_COLOR}`);
                        }
                    }
            }
            if (classes.length) {
                charElement.className = classes.join(' ');
                classes.length = 0;
            }
            if (!isCursorCell && !isJoined && !isDecorated) {
                cellAmount++;
            }
            else {
                charElement.textContent = text;
            }
            if (spacing !== this.defaultSpacing) {
                charElement.style.letterSpacing = `${spacing}px`;
            }
            elements.push(charElement);
            x = lastCharX;
        }
        if (charElement && cellAmount) {
            charElement.textContent = text;
        }
        return elements;
    }
    _applyMinimumContrast(element, bg, fg, cell, bgOverride, fgOverride) {
        if (this._optionsService.rawOptions.minimumContrastRatio === 1 || (0, RendererUtils_1.treatGlyphAsBackgroundColor)(cell.getCode())) {
            return false;
        }
        const cache = this._getContrastCache(cell);
        let adjustedColor = undefined;
        if (!bgOverride && !fgOverride) {
            adjustedColor = cache.getColor(bg.rgba, fg.rgba);
        }
        if (adjustedColor === undefined) {
            const ratio = this._optionsService.rawOptions.minimumContrastRatio / (cell.isDim() ? 2 : 1);
            adjustedColor = Color_1.color.ensureContrastRatio(bgOverride || bg, fgOverride || fg, ratio);
            cache.setColor((bgOverride || bg).rgba, (fgOverride || fg).rgba, adjustedColor ?? null);
        }
        if (adjustedColor) {
            this._addStyle(element, `color:${adjustedColor.css}`);
            return true;
        }
        return false;
    }
    _getContrastCache(cell) {
        if (cell.isDim()) {
            return this._themeService.colors.halfContrastCache;
        }
        return this._themeService.colors.contrastCache;
    }
    _addStyle(element, style) {
        element.setAttribute('style', `${element.getAttribute('style') || ''}${style};`);
    }
    _isCellInSelection(x, y) {
        const start = this._selectionStart;
        const end = this._selectionEnd;
        if (!start || !end) {
            return false;
        }
        if (this._columnSelectMode) {
            if (start[0] <= end[0]) {
                return x >= start[0] && y >= start[1] &&
                    x < end[0] && y <= end[1];
            }
            return x < start[0] && y >= start[1] &&
                x >= end[0] && y <= end[1];
        }
        return (y > start[1] && y < end[1]) ||
            (start[1] === end[1] && y === start[1] && x >= start[0] && x < end[0]) ||
            (start[1] < end[1] && y === end[1] && x < end[0]) ||
            (start[1] < end[1] && y === start[1] && x >= start[0]);
    }
};
exports.DomRendererRowFactory = DomRendererRowFactory = __decorate([
    __param(1, Services_2.ICharacterJoinerService),
    __param(2, Services_1.IOptionsService),
    __param(3, Services_2.ICoreBrowserService),
    __param(4, Services_1.ICoreService),
    __param(5, Services_1.IDecorationService),
    __param(6, Services_2.IThemeService)
], DomRendererRowFactory);
function padStart(text, padChar, length) {
    while (text.length < length) {
        text = padChar + text;
    }
    return text;
}
//# sourceMappingURL=DomRendererRowFactory.js.map