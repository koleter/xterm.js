"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.launchBrowser = exports.getBrowserType = exports.openTerminal = exports.timeout = exports.writeSync = exports.pollFor = void 0;
var playwright = require("@playwright/test");
var deepEqual = require("deep-equal");
var assert_1 = require("assert");
function pollFor(page, evalOrFn, val, preFn, maxDuration) {
    return __awaiter(this, void 0, void 0, function () {
        var result, _a;
        return __generator(this, function (_b) {
            switch (_b.label) {
                case 0:
                    if (!preFn) return [3, 2];
                    return [4, preFn()];
                case 1:
                    _b.sent();
                    _b.label = 2;
                case 2:
                    if (!(typeof evalOrFn === 'string')) return [3, 4];
                    return [4, page.evaluate(evalOrFn)];
                case 3:
                    _a = _b.sent();
                    return [3, 6];
                case 4: return [4, evalOrFn()];
                case 5:
                    _a = _b.sent();
                    _b.label = 6;
                case 6:
                    result = _a;
                    if (process.env.DEBUG) {
                        console.log('pollFor result: ', result);
                    }
                    if (!deepEqual(result, val)) {
                        if (maxDuration === undefined) {
                            maxDuration = 2000;
                        }
                        if (maxDuration <= 0) {
                            (0, assert_1.deepStrictEqual)(result, val, 'pollFor max duration exceeded');
                        }
                        return [2, new Promise(function (r) {
                                setTimeout(function () { return r(pollFor(page, evalOrFn, val, preFn, maxDuration - 10)); }, 10);
                            })];
                    }
                    return [2];
            }
        });
    });
}
exports.pollFor = pollFor;
function writeSync(page, data) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4, page.evaluate("\n    window.ready = false;\n    window.term.write('".concat(data, "', () => window.ready = true);\n  "))];
                case 1:
                    _a.sent();
                    return [4, pollFor(page, 'window.ready', true)];
                case 2:
                    _a.sent();
                    return [2];
            }
        });
    });
}
exports.writeSync = writeSync;
function timeout(ms) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            return [2, new Promise(function (r) { return setTimeout(r, ms); })];
        });
    });
}
exports.timeout = timeout;
function openTerminal(page, options, testOptions) {
    if (options === void 0) { options = {}; }
    if (testOptions === void 0) { testOptions = { loadUnicodeGraphemesAddon: true }; }
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4, page.evaluate("window.term = new Terminal(".concat(JSON.stringify(__assign({ allowProposedApi: true }, options)), ")"))];
                case 1:
                    _a.sent();
                    return [4, page.evaluate("window.term.open(document.querySelector('#terminal-container'))")];
                case 2:
                    _a.sent();
                    if (!testOptions.loadUnicodeGraphemesAddon) return [3, 4];
                    return [4, page.evaluate("\n      window.unicode = new UnicodeGraphemesAddon();\n      window.term.loadAddon(window.unicode);\n      window.term.unicode.activeVersion = '15-graphemes';\n    ")];
                case 3:
                    _a.sent();
                    _a.label = 4;
                case 4: return [4, page.waitForSelector('.xterm-rows')];
                case 5:
                    _a.sent();
                    return [2];
            }
        });
    });
}
exports.openTerminal = openTerminal;
function getBrowserType() {
    var browserType = playwright['chromium'];
    var index = process.argv.indexOf('--browser');
    if (index !== -1 && process.argv.length > index + 1 && typeof process.argv[index + 1] === 'string') {
        var string = process.argv[index + 1];
        if (string === 'firefox' || string === 'webkit') {
            browserType = playwright[string];
        }
    }
    return browserType;
}
exports.getBrowserType = getBrowserType;
function launchBrowser() {
    var browserType = getBrowserType();
    var options = {
        headless: process.argv.includes('--headless')
    };
    var index = process.argv.indexOf('--executablePath');
    if (index > 0 && process.argv.length > index + 1 && typeof process.argv[index + 1] === 'string') {
        options.executablePath = process.argv[index + 1];
    }
    return browserType.launch(options);
}
exports.launchBrowser = launchBrowser;
//# sourceMappingURL=TestUtils.js.map