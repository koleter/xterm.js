"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isChromeOS = exports.isLinux = exports.isWindows = exports.isIphone = exports.isIpad = exports.isMac = exports.getSafariVersion = exports.isSafari = exports.isLegacyEdge = exports.isFirefox = exports.isNode = void 0;
exports.isNode = (typeof process !== 'undefined' && 'title' in process) ? true : false;
const userAgent = (exports.isNode) ? 'node' : navigator.userAgent;
const platform = (exports.isNode) ? 'node' : navigator.platform;
exports.isFirefox = userAgent.includes('Firefox');
exports.isLegacyEdge = userAgent.includes('Edge');
exports.isSafari = /^((?!chrome|android).)*safari/i.test(userAgent);
function getSafariVersion() {
    if (!exports.isSafari) {
        return 0;
    }
    const majorVersion = userAgent.match(/Version\/(\d+)/);
    if (majorVersion === null || majorVersion.length < 2) {
        return 0;
    }
    return parseInt(majorVersion[1]);
}
exports.getSafariVersion = getSafariVersion;
exports.isMac = ['Macintosh', 'MacIntel', 'MacPPC', 'Mac68K'].includes(platform);
exports.isIpad = platform === 'iPad';
exports.isIphone = platform === 'iPhone';
exports.isWindows = ['Windows', 'Win16', 'Win32', 'WinCE'].includes(platform);
exports.isLinux = platform.indexOf('Linux') >= 0;
exports.isChromeOS = /\bCrOS\b/.test(userAgent);
//# sourceMappingURL=Platform.js.map