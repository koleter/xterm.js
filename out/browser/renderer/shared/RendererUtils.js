"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.computeNextVariantOffset = exports.createRenderDimensions = exports.treatGlyphAsBackgroundColor = exports.allowRescaling = exports.isEmoji = exports.isRestrictedPowerlineGlyph = exports.isPowerlineGlyph = exports.throwIfFalsy = void 0;
function throwIfFalsy(value) {
    if (!value) {
        throw new Error('value must not be falsy');
    }
    return value;
}
exports.throwIfFalsy = throwIfFalsy;
function isPowerlineGlyph(codepoint) {
    return 0xE0A4 <= codepoint && codepoint <= 0xE0D6;
}
exports.isPowerlineGlyph = isPowerlineGlyph;
function isRestrictedPowerlineGlyph(codepoint) {
    return 0xE0B0 <= codepoint && codepoint <= 0xE0B7;
}
exports.isRestrictedPowerlineGlyph = isRestrictedPowerlineGlyph;
function isNerdFontGlyph(codepoint) {
    return 0xE000 <= codepoint && codepoint <= 0xF8FF;
}
function isBoxOrBlockGlyph(codepoint) {
    return 0x2500 <= codepoint && codepoint <= 0x259F;
}
function isEmoji(codepoint) {
    return (codepoint >= 0x1F600 && codepoint <= 0x1F64F ||
        codepoint >= 0x1F300 && codepoint <= 0x1F5FF ||
        codepoint >= 0x1F680 && codepoint <= 0x1F6FF ||
        codepoint >= 0x2600 && codepoint <= 0x26FF ||
        codepoint >= 0x2700 && codepoint <= 0x27BF ||
        codepoint >= 0xFE00 && codepoint <= 0xFE0F ||
        codepoint >= 0x1F900 && codepoint <= 0x1F9FF ||
        codepoint >= 0x1F1E6 && codepoint <= 0x1F1FF);
}
exports.isEmoji = isEmoji;
function allowRescaling(codepoint, width, glyphSizeX, deviceCellWidth) {
    return (width === 1 &&
        glyphSizeX > Math.ceil(deviceCellWidth * 1.5) &&
        codepoint !== undefined && codepoint > 0xFF &&
        !isEmoji(codepoint) &&
        !isPowerlineGlyph(codepoint) && !isNerdFontGlyph(codepoint));
}
exports.allowRescaling = allowRescaling;
function treatGlyphAsBackgroundColor(codepoint) {
    return isPowerlineGlyph(codepoint) || isBoxOrBlockGlyph(codepoint);
}
exports.treatGlyphAsBackgroundColor = treatGlyphAsBackgroundColor;
function createRenderDimensions() {
    return {
        css: {
            canvas: createDimension(),
            cell: createDimension()
        },
        device: {
            canvas: createDimension(),
            cell: createDimension(),
            char: {
                width: 0,
                height: 0,
                left: 0,
                top: 0
            }
        }
    };
}
exports.createRenderDimensions = createRenderDimensions;
function createDimension() {
    return {
        width: 0,
        height: 0
    };
}
function computeNextVariantOffset(cellWidth, lineWidth, currentOffset = 0) {
    return (cellWidth - (Math.round(lineWidth) * 2 - currentOffset)) % (Math.round(lineWidth) * 2);
}
exports.computeNextVariantOffset = computeNextVariantOffset;
//# sourceMappingURL=RendererUtils.js.map