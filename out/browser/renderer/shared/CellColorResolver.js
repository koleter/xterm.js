"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CellColorResolver = void 0;
const Constants_1 = require("common/buffer/Constants");
const Color_1 = require("common/Color");
const RendererUtils_1 = require("browser/renderer/shared/RendererUtils");
let $fg = 0;
let $bg = 0;
let $hasFg = false;
let $hasBg = false;
let $isSelected = false;
let $colors;
let $variantOffset = 0;
class CellColorResolver {
    constructor(_terminal, _optionService, _selectionRenderModel, _decorationService, _coreBrowserService, _themeService) {
        this._terminal = _terminal;
        this._optionService = _optionService;
        this._selectionRenderModel = _selectionRenderModel;
        this._decorationService = _decorationService;
        this._coreBrowserService = _coreBrowserService;
        this._themeService = _themeService;
        this.result = {
            fg: 0,
            bg: 0,
            ext: 0
        };
    }
    resolve(cell, x, y, deviceCellWidth) {
        this.result.bg = cell.bg;
        this.result.fg = cell.fg;
        this.result.ext = cell.bg & 268435456 ? cell.extended.ext : 0;
        $bg = 0;
        $fg = 0;
        $hasBg = false;
        $hasFg = false;
        $isSelected = false;
        $colors = this._themeService.colors;
        $variantOffset = 0;
        const code = cell.getCode();
        if (code !== Constants_1.NULL_CELL_CODE && cell.extended.underlineStyle === 4) {
            const lineWidth = Math.max(1, Math.floor(this._optionService.rawOptions.fontSize * this._coreBrowserService.dpr / 15));
            $variantOffset = x * deviceCellWidth % (Math.round(lineWidth) * 2);
        }
        this._decorationService.forEachDecorationAtCell(x, y, 'bottom', d => {
            if (d.backgroundColorRGB) {
                $bg = d.backgroundColorRGB.rgba >> 8 & 16777215;
                $hasBg = true;
            }
            if (d.foregroundColorRGB) {
                $fg = d.foregroundColorRGB.rgba >> 8 & 16777215;
                $hasFg = true;
            }
        });
        $isSelected = this._selectionRenderModel.isCellSelected(this._terminal, x, y);
        if ($isSelected) {
            if ((this.result.fg & 67108864) ||
                (this.result.bg & 50331648) !== 0) {
                if (this.result.fg & 67108864) {
                    switch (this.result.fg & 50331648) {
                        case 16777216:
                        case 33554432:
                            $bg = this._themeService.colors.ansi[this.result.fg & 255].rgba;
                            break;
                        case 50331648:
                            $bg = ((this.result.fg & 16777215) << 8) | 0xFF;
                            break;
                        case 0:
                        default:
                            $bg = this._themeService.colors.foreground.rgba;
                    }
                }
                else {
                    switch (this.result.bg & 50331648) {
                        case 16777216:
                        case 33554432:
                            $bg = this._themeService.colors.ansi[this.result.bg & 255].rgba;
                            break;
                        case 50331648:
                            $bg = ((this.result.bg & 16777215) << 8) | 0xFF;
                            break;
                    }
                }
                $bg = Color_1.rgba.blend($bg, ((this._coreBrowserService.isFocused ? $colors.selectionBackgroundOpaque : $colors.selectionInactiveBackgroundOpaque).rgba & 0xFFFFFF00) | 0x80) >> 8 & 16777215;
            }
            else {
                $bg = (this._coreBrowserService.isFocused ? $colors.selectionBackgroundOpaque : $colors.selectionInactiveBackgroundOpaque).rgba >> 8 & 16777215;
            }
            $hasBg = true;
            if ($colors.selectionForeground) {
                $fg = $colors.selectionForeground.rgba >> 8 & 16777215;
                $hasFg = true;
            }
            if ((0, RendererUtils_1.treatGlyphAsBackgroundColor)(cell.getCode())) {
                if ((this.result.fg & 67108864) &&
                    (this.result.bg & 50331648) === 0) {
                    $fg = (this._coreBrowserService.isFocused ? $colors.selectionBackgroundOpaque : $colors.selectionInactiveBackgroundOpaque).rgba >> 8 & 16777215;
                }
                else {
                    if (this.result.fg & 67108864) {
                        switch (this.result.bg & 50331648) {
                            case 16777216:
                            case 33554432:
                                $fg = this._themeService.colors.ansi[this.result.bg & 255].rgba;
                                break;
                            case 50331648:
                                $fg = ((this.result.bg & 16777215) << 8) | 0xFF;
                                break;
                        }
                    }
                    else {
                        switch (this.result.fg & 50331648) {
                            case 16777216:
                            case 33554432:
                                $fg = this._themeService.colors.ansi[this.result.fg & 255].rgba;
                                break;
                            case 50331648:
                                $fg = ((this.result.fg & 16777215) << 8) | 0xFF;
                                break;
                            case 0:
                            default:
                                $fg = this._themeService.colors.foreground.rgba;
                        }
                    }
                    $fg = Color_1.rgba.blend($fg, ((this._coreBrowserService.isFocused ? $colors.selectionBackgroundOpaque : $colors.selectionInactiveBackgroundOpaque).rgba & 0xFFFFFF00) | 0x80) >> 8 & 16777215;
                }
                $hasFg = true;
            }
        }
        this._decorationService.forEachDecorationAtCell(x, y, 'top', d => {
            if (d.backgroundColorRGB) {
                $bg = d.backgroundColorRGB.rgba >> 8 & 16777215;
                $hasBg = true;
            }
            if (d.foregroundColorRGB) {
                $fg = d.foregroundColorRGB.rgba >> 8 & 16777215;
                $hasFg = true;
            }
        });
        if ($hasBg) {
            if ($isSelected) {
                $bg = (cell.bg & ~16777215 & ~134217728) | $bg | 50331648;
            }
            else {
                $bg = (cell.bg & ~16777215) | $bg | 50331648;
            }
        }
        if ($hasFg) {
            $fg = (cell.fg & ~16777215 & ~67108864) | $fg | 50331648;
        }
        if (this.result.fg & 67108864) {
            if ($hasBg && !$hasFg) {
                if ((this.result.bg & 50331648) === 0) {
                    $fg = (this.result.fg & ~(16777215 | 67108864 | 50331648)) | (($colors.background.rgba >> 8 & 16777215) & 16777215) | 50331648;
                }
                else {
                    $fg = (this.result.fg & ~(16777215 | 67108864 | 50331648)) | this.result.bg & (16777215 | 50331648);
                }
                $hasFg = true;
            }
            if (!$hasBg && $hasFg) {
                if ((this.result.fg & 50331648) === 0) {
                    $bg = (this.result.bg & ~(16777215 | 50331648)) | (($colors.foreground.rgba >> 8 & 16777215) & 16777215) | 50331648;
                }
                else {
                    $bg = (this.result.bg & ~(16777215 | 50331648)) | this.result.fg & (16777215 | 50331648);
                }
                $hasBg = true;
            }
        }
        $colors = undefined;
        this.result.bg = $hasBg ? $bg : this.result.bg;
        this.result.fg = $hasFg ? $fg : this.result.fg;
        this.result.ext &= ~3758096384;
        this.result.ext |= ($variantOffset << 29) & 3758096384;
    }
}
exports.CellColorResolver = CellColorResolver;
//# sourceMappingURL=CellColorResolver.js.map