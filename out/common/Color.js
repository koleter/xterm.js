"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.contrastRatio = exports.toPaddedHex = exports.rgba = exports.rgb = exports.css = exports.color = exports.channels = exports.NULL_COLOR = void 0;
let $r = 0;
let $g = 0;
let $b = 0;
let $a = 0;
exports.NULL_COLOR = {
    css: '#00000000',
    rgba: 0
};
var channels;
(function (channels) {
    function toCss(r, g, b, a) {
        if (a !== undefined) {
            return `#${toPaddedHex(r)}${toPaddedHex(g)}${toPaddedHex(b)}${toPaddedHex(a)}`;
        }
        return `#${toPaddedHex(r)}${toPaddedHex(g)}${toPaddedHex(b)}`;
    }
    channels.toCss = toCss;
    function toRgba(r, g, b, a = 0xFF) {
        return (r << 24 | g << 16 | b << 8 | a) >>> 0;
    }
    channels.toRgba = toRgba;
    function toColor(r, g, b, a) {
        return {
            css: channels.toCss(r, g, b, a),
            rgba: channels.toRgba(r, g, b, a)
        };
    }
    channels.toColor = toColor;
})(channels || (exports.channels = channels = {}));
var color;
(function (color_1) {
    function blend(bg, fg) {
        $a = (fg.rgba & 0xFF) / 255;
        if ($a === 1) {
            return {
                css: fg.css,
                rgba: fg.rgba
            };
        }
        const fgR = (fg.rgba >> 24) & 0xFF;
        const fgG = (fg.rgba >> 16) & 0xFF;
        const fgB = (fg.rgba >> 8) & 0xFF;
        const bgR = (bg.rgba >> 24) & 0xFF;
        const bgG = (bg.rgba >> 16) & 0xFF;
        const bgB = (bg.rgba >> 8) & 0xFF;
        $r = bgR + Math.round((fgR - bgR) * $a);
        $g = bgG + Math.round((fgG - bgG) * $a);
        $b = bgB + Math.round((fgB - bgB) * $a);
        const css = channels.toCss($r, $g, $b);
        const rgba = channels.toRgba($r, $g, $b);
        return { css, rgba };
    }
    color_1.blend = blend;
    function isOpaque(color) {
        return (color.rgba & 0xFF) === 0xFF;
    }
    color_1.isOpaque = isOpaque;
    function ensureContrastRatio(bg, fg, ratio) {
        const result = rgba.ensureContrastRatio(bg.rgba, fg.rgba, ratio);
        if (!result) {
            return undefined;
        }
        return channels.toColor((result >> 24 & 0xFF), (result >> 16 & 0xFF), (result >> 8 & 0xFF));
    }
    color_1.ensureContrastRatio = ensureContrastRatio;
    function opaque(color) {
        const rgbaColor = (color.rgba | 0xFF) >>> 0;
        [$r, $g, $b] = rgba.toChannels(rgbaColor);
        return {
            css: channels.toCss($r, $g, $b),
            rgba: rgbaColor
        };
    }
    color_1.opaque = opaque;
    function opacity(color, opacity) {
        $a = Math.round(opacity * 0xFF);
        [$r, $g, $b] = rgba.toChannels(color.rgba);
        return {
            css: channels.toCss($r, $g, $b, $a),
            rgba: channels.toRgba($r, $g, $b, $a)
        };
    }
    color_1.opacity = opacity;
    function multiplyOpacity(color, factor) {
        $a = color.rgba & 0xFF;
        return opacity(color, ($a * factor) / 0xFF);
    }
    color_1.multiplyOpacity = multiplyOpacity;
    function toColorRGB(color) {
        return [(color.rgba >> 24) & 0xFF, (color.rgba >> 16) & 0xFF, (color.rgba >> 8) & 0xFF];
    }
    color_1.toColorRGB = toColorRGB;
})(color || (exports.color = color = {}));
var css;
(function (css_1) {
    let $ctx;
    let $litmusColor;
    try {
        const canvas = document.createElement('canvas');
        canvas.width = 1;
        canvas.height = 1;
        const ctx = canvas.getContext('2d', {
            willReadFrequently: true
        });
        if (ctx) {
            $ctx = ctx;
            $ctx.globalCompositeOperation = 'copy';
            $litmusColor = $ctx.createLinearGradient(0, 0, 1, 1);
        }
    }
    catch {
    }
    function toColor(css) {
        if (css.match(/#[\da-f]{3,8}/i)) {
            switch (css.length) {
                case 4: {
                    $r = parseInt(css.slice(1, 2).repeat(2), 16);
                    $g = parseInt(css.slice(2, 3).repeat(2), 16);
                    $b = parseInt(css.slice(3, 4).repeat(2), 16);
                    return channels.toColor($r, $g, $b);
                }
                case 5: {
                    $r = parseInt(css.slice(1, 2).repeat(2), 16);
                    $g = parseInt(css.slice(2, 3).repeat(2), 16);
                    $b = parseInt(css.slice(3, 4).repeat(2), 16);
                    $a = parseInt(css.slice(4, 5).repeat(2), 16);
                    return channels.toColor($r, $g, $b, $a);
                }
                case 7:
                    return {
                        css,
                        rgba: (parseInt(css.slice(1), 16) << 8 | 0xFF) >>> 0
                    };
                case 9:
                    return {
                        css,
                        rgba: parseInt(css.slice(1), 16) >>> 0
                    };
            }
        }
        const rgbaMatch = css.match(/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(,\s*(0|1|\d?\.(\d+))\s*)?\)/);
        if (rgbaMatch) {
            $r = parseInt(rgbaMatch[1]);
            $g = parseInt(rgbaMatch[2]);
            $b = parseInt(rgbaMatch[3]);
            $a = Math.round((rgbaMatch[5] === undefined ? 1 : parseFloat(rgbaMatch[5])) * 0xFF);
            return channels.toColor($r, $g, $b, $a);
        }
        if (!$ctx || !$litmusColor) {
            throw new Error('css.toColor: Unsupported css format');
        }
        $ctx.fillStyle = $litmusColor;
        $ctx.fillStyle = css;
        if (typeof $ctx.fillStyle !== 'string') {
            throw new Error('css.toColor: Unsupported css format');
        }
        $ctx.fillRect(0, 0, 1, 1);
        [$r, $g, $b, $a] = $ctx.getImageData(0, 0, 1, 1).data;
        if ($a !== 0xFF) {
            throw new Error('css.toColor: Unsupported css format');
        }
        return {
            rgba: channels.toRgba($r, $g, $b, $a),
            css
        };
    }
    css_1.toColor = toColor;
})(css || (exports.css = css = {}));
var rgb;
(function (rgb_1) {
    function relativeLuminance(rgb) {
        return relativeLuminance2((rgb >> 16) & 0xFF, (rgb >> 8) & 0xFF, (rgb) & 0xFF);
    }
    rgb_1.relativeLuminance = relativeLuminance;
    function relativeLuminance2(r, g, b) {
        const rs = r / 255;
        const gs = g / 255;
        const bs = b / 255;
        const rr = rs <= 0.03928 ? rs / 12.92 : Math.pow((rs + 0.055) / 1.055, 2.4);
        const rg = gs <= 0.03928 ? gs / 12.92 : Math.pow((gs + 0.055) / 1.055, 2.4);
        const rb = bs <= 0.03928 ? bs / 12.92 : Math.pow((bs + 0.055) / 1.055, 2.4);
        return rr * 0.2126 + rg * 0.7152 + rb * 0.0722;
    }
    rgb_1.relativeLuminance2 = relativeLuminance2;
})(rgb || (exports.rgb = rgb = {}));
var rgba;
(function (rgba) {
    function blend(bg, fg) {
        $a = (fg & 0xFF) / 0xFF;
        if ($a === 1) {
            return fg;
        }
        const fgR = (fg >> 24) & 0xFF;
        const fgG = (fg >> 16) & 0xFF;
        const fgB = (fg >> 8) & 0xFF;
        const bgR = (bg >> 24) & 0xFF;
        const bgG = (bg >> 16) & 0xFF;
        const bgB = (bg >> 8) & 0xFF;
        $r = bgR + Math.round((fgR - bgR) * $a);
        $g = bgG + Math.round((fgG - bgG) * $a);
        $b = bgB + Math.round((fgB - bgB) * $a);
        return channels.toRgba($r, $g, $b);
    }
    rgba.blend = blend;
    function ensureContrastRatio(bgRgba, fgRgba, ratio) {
        const bgL = rgb.relativeLuminance(bgRgba >> 8);
        const fgL = rgb.relativeLuminance(fgRgba >> 8);
        const cr = contrastRatio(bgL, fgL);
        if (cr < ratio) {
            if (fgL < bgL) {
                const resultA = reduceLuminance(bgRgba, fgRgba, ratio);
                const resultARatio = contrastRatio(bgL, rgb.relativeLuminance(resultA >> 8));
                if (resultARatio < ratio) {
                    const resultB = increaseLuminance(bgRgba, fgRgba, ratio);
                    const resultBRatio = contrastRatio(bgL, rgb.relativeLuminance(resultB >> 8));
                    return resultARatio > resultBRatio ? resultA : resultB;
                }
                return resultA;
            }
            const resultA = increaseLuminance(bgRgba, fgRgba, ratio);
            const resultARatio = contrastRatio(bgL, rgb.relativeLuminance(resultA >> 8));
            if (resultARatio < ratio) {
                const resultB = reduceLuminance(bgRgba, fgRgba, ratio);
                const resultBRatio = contrastRatio(bgL, rgb.relativeLuminance(resultB >> 8));
                return resultARatio > resultBRatio ? resultA : resultB;
            }
            return resultA;
        }
        return undefined;
    }
    rgba.ensureContrastRatio = ensureContrastRatio;
    function reduceLuminance(bgRgba, fgRgba, ratio) {
        const bgR = (bgRgba >> 24) & 0xFF;
        const bgG = (bgRgba >> 16) & 0xFF;
        const bgB = (bgRgba >> 8) & 0xFF;
        let fgR = (fgRgba >> 24) & 0xFF;
        let fgG = (fgRgba >> 16) & 0xFF;
        let fgB = (fgRgba >> 8) & 0xFF;
        let cr = contrastRatio(rgb.relativeLuminance2(fgR, fgG, fgB), rgb.relativeLuminance2(bgR, bgG, bgB));
        while (cr < ratio && (fgR > 0 || fgG > 0 || fgB > 0)) {
            fgR -= Math.max(0, Math.ceil(fgR * 0.1));
            fgG -= Math.max(0, Math.ceil(fgG * 0.1));
            fgB -= Math.max(0, Math.ceil(fgB * 0.1));
            cr = contrastRatio(rgb.relativeLuminance2(fgR, fgG, fgB), rgb.relativeLuminance2(bgR, bgG, bgB));
        }
        return (fgR << 24 | fgG << 16 | fgB << 8 | 0xFF) >>> 0;
    }
    rgba.reduceLuminance = reduceLuminance;
    function increaseLuminance(bgRgba, fgRgba, ratio) {
        const bgR = (bgRgba >> 24) & 0xFF;
        const bgG = (bgRgba >> 16) & 0xFF;
        const bgB = (bgRgba >> 8) & 0xFF;
        let fgR = (fgRgba >> 24) & 0xFF;
        let fgG = (fgRgba >> 16) & 0xFF;
        let fgB = (fgRgba >> 8) & 0xFF;
        let cr = contrastRatio(rgb.relativeLuminance2(fgR, fgG, fgB), rgb.relativeLuminance2(bgR, bgG, bgB));
        while (cr < ratio && (fgR < 0xFF || fgG < 0xFF || fgB < 0xFF)) {
            fgR = Math.min(0xFF, fgR + Math.ceil((255 - fgR) * 0.1));
            fgG = Math.min(0xFF, fgG + Math.ceil((255 - fgG) * 0.1));
            fgB = Math.min(0xFF, fgB + Math.ceil((255 - fgB) * 0.1));
            cr = contrastRatio(rgb.relativeLuminance2(fgR, fgG, fgB), rgb.relativeLuminance2(bgR, bgG, bgB));
        }
        return (fgR << 24 | fgG << 16 | fgB << 8 | 0xFF) >>> 0;
    }
    rgba.increaseLuminance = increaseLuminance;
    function toChannels(value) {
        return [(value >> 24) & 0xFF, (value >> 16) & 0xFF, (value >> 8) & 0xFF, value & 0xFF];
    }
    rgba.toChannels = toChannels;
})(rgba || (exports.rgba = rgba = {}));
function toPaddedHex(c) {
    const s = c.toString(16);
    return s.length < 2 ? '0' + s : s;
}
exports.toPaddedHex = toPaddedHex;
function contrastRatio(l1, l2) {
    if (l1 < l2) {
        return (l2 + 0.05) / (l1 + 0.05);
    }
    return (l1 + 0.05) / (l2 + 0.05);
}
exports.contrastRatio = contrastRatio;
//# sourceMappingURL=Color.js.map