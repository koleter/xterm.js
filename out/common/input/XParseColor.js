"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.toRgbString = exports.parseColor = void 0;
const RGB_REX = /^([\da-f])\/([\da-f])\/([\da-f])$|^([\da-f]{2})\/([\da-f]{2})\/([\da-f]{2})$|^([\da-f]{3})\/([\da-f]{3})\/([\da-f]{3})$|^([\da-f]{4})\/([\da-f]{4})\/([\da-f]{4})$/;
const HASH_REX = /^[\da-f]+$/;
function parseColor(data) {
    if (!data)
        return;
    let low = data.toLowerCase();
    if (low.indexOf('rgb:') === 0) {
        low = low.slice(4);
        const m = RGB_REX.exec(low);
        if (m) {
            const base = m[1] ? 15 : m[4] ? 255 : m[7] ? 4095 : 65535;
            return [
                Math.round(parseInt(m[1] || m[4] || m[7] || m[10], 16) / base * 255),
                Math.round(parseInt(m[2] || m[5] || m[8] || m[11], 16) / base * 255),
                Math.round(parseInt(m[3] || m[6] || m[9] || m[12], 16) / base * 255)
            ];
        }
    }
    else if (low.indexOf('#') === 0) {
        low = low.slice(1);
        if (HASH_REX.exec(low) && [3, 6, 9, 12].includes(low.length)) {
            const adv = low.length / 3;
            const result = [0, 0, 0];
            for (let i = 0; i < 3; ++i) {
                const c = parseInt(low.slice(adv * i, adv * i + adv), 16);
                result[i] = adv === 1 ? c << 4 : adv === 2 ? c : adv === 3 ? c >> 4 : c >> 8;
            }
            return result;
        }
    }
}
exports.parseColor = parseColor;
function pad(n, bits) {
    const s = n.toString(16);
    const s2 = s.length < 2 ? '0' + s : s;
    switch (bits) {
        case 4:
            return s[0];
        case 8:
            return s2;
        case 12:
            return (s2 + s2).slice(0, 3);
        default:
            return s2 + s2;
    }
}
function toRgbString(color, bits = 16) {
    const [r, g, b] = color;
    return `rgb:${pad(r, bits)}/${pad(g, bits)}/${pad(b, bits)}`;
}
exports.toRgbString = toRgbString;
//# sourceMappingURL=XParseColor.js.map