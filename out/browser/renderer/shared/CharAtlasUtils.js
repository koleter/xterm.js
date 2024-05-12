"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.is256Color = exports.configEquals = exports.generateConfig = void 0;
const Color_1 = require("common/Color");
function generateConfig(deviceCellWidth, deviceCellHeight, deviceCharWidth, deviceCharHeight, options, colors, devicePixelRatio) {
    const clonedColors = {
        foreground: colors.foreground,
        background: colors.background,
        cursor: Color_1.NULL_COLOR,
        cursorAccent: Color_1.NULL_COLOR,
        selectionForeground: Color_1.NULL_COLOR,
        selectionBackgroundTransparent: Color_1.NULL_COLOR,
        selectionBackgroundOpaque: Color_1.NULL_COLOR,
        selectionInactiveBackgroundTransparent: Color_1.NULL_COLOR,
        selectionInactiveBackgroundOpaque: Color_1.NULL_COLOR,
        ansi: colors.ansi.slice(),
        contrastCache: colors.contrastCache,
        halfContrastCache: colors.halfContrastCache
    };
    return {
        customGlyphs: options.customGlyphs,
        devicePixelRatio,
        letterSpacing: options.letterSpacing,
        lineHeight: options.lineHeight,
        deviceCellWidth: deviceCellWidth,
        deviceCellHeight: deviceCellHeight,
        deviceCharWidth: deviceCharWidth,
        deviceCharHeight: deviceCharHeight,
        fontFamily: options.fontFamily,
        fontSize: options.fontSize,
        fontWeight: options.fontWeight,
        fontWeightBold: options.fontWeightBold,
        allowTransparency: options.allowTransparency,
        drawBoldTextInBrightColors: options.drawBoldTextInBrightColors,
        minimumContrastRatio: options.minimumContrastRatio,
        colors: clonedColors
    };
}
exports.generateConfig = generateConfig;
function configEquals(a, b) {
    for (let i = 0; i < a.colors.ansi.length; i++) {
        if (a.colors.ansi[i].rgba !== b.colors.ansi[i].rgba) {
            return false;
        }
    }
    return a.devicePixelRatio === b.devicePixelRatio &&
        a.customGlyphs === b.customGlyphs &&
        a.lineHeight === b.lineHeight &&
        a.letterSpacing === b.letterSpacing &&
        a.fontFamily === b.fontFamily &&
        a.fontSize === b.fontSize &&
        a.fontWeight === b.fontWeight &&
        a.fontWeightBold === b.fontWeightBold &&
        a.allowTransparency === b.allowTransparency &&
        a.deviceCharWidth === b.deviceCharWidth &&
        a.deviceCharHeight === b.deviceCharHeight &&
        a.drawBoldTextInBrightColors === b.drawBoldTextInBrightColors &&
        a.minimumContrastRatio === b.minimumContrastRatio &&
        a.colors.foreground.rgba === b.colors.foreground.rgba &&
        a.colors.background.rgba === b.colors.background.rgba;
}
exports.configEquals = configEquals;
function is256Color(colorCode) {
    return (colorCode & 50331648) === 16777216 || (colorCode & 50331648) === 33554432;
}
exports.is256Color = is256Color;
//# sourceMappingURL=CharAtlasUtils.js.map