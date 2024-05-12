"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const assert_1 = require("assert");
const TestUtils_1 = require("./TestUtils");
let ctx;
test_1.test.beforeAll(({ browser }) => __awaiter(void 0, void 0, void 0, function* () {
    ctx = yield (0, TestUtils_1.createTestContext)(browser);
    yield (0, TestUtils_1.openTerminal)(ctx);
}));
test_1.test.afterAll(() => __awaiter(void 0, void 0, void 0, function* () { return yield ctx.page.close(); }));
test_1.test.describe('Parser Integration Tests', () => {
    test_1.test.beforeEach(() => __awaiter(void 0, void 0, void 0, function* () { return yield ctx.proxy.reset(); }));
    test_1.test.afterEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield ctx.page.evaluate(() => {
            var _a, _b;
            (_a = window.disposable) === null || _a === void 0 ? void 0 : _a.dispose();
            window.disposable = undefined;
            (_b = window.disposables) === null || _b === void 0 ? void 0 : _b.forEach(e => e.dispose());
            window.disposables = undefined;
        });
    }));
    test_1.test.describe('registerCsiHandler', () => {
        (0, test_1.test)('should call custom CSI handler with js array params', () => __awaiter(void 0, void 0, void 0, function* () {
            yield ctx.proxy.evaluate(([term]) => {
                window.customCsiHandlerParams = [];
                window.disposable = term.parser.registerCsiHandler({ final: 'm' }, (params) => {
                    window.customCsiHandlerParams.push(params);
                    return false;
                });
            });
            yield ctx.proxy.write('\x1b[38;5;123mparams\x1b[38:2::50:100:150msubparams');
            (0, assert_1.deepStrictEqual)(yield ctx.page.evaluate(() => window.customCsiHandlerParams), [
                [38, 5, 123],
                [38, [2, -1, 50, 100, 150]]
            ]);
        }));
        (0, test_1.test)('async', () => __awaiter(void 0, void 0, void 0, function* () {
            yield ctx.proxy.evaluate(([term]) => {
                window.customCsiHandlerCallStack = [];
                window.customCsiHandlerParams = [];
                window.disposables = [
                    term.parser.registerCsiHandler({ intermediates: '+', final: 'Z' }, params => {
                        window.customCsiHandlerCallStack.push('A');
                        window.customCsiHandlerParams.push(params);
                        return false;
                    }),
                    term.parser.registerCsiHandler({ intermediates: '+', final: 'Z' }, params => {
                        return new Promise(res => setTimeout(res, 50)).then(() => {
                            window.customCsiHandlerCallStack.push('B');
                            window.customCsiHandlerParams.push(params);
                            return false;
                        });
                    }),
                    term.parser.registerCsiHandler({ intermediates: '+', final: 'Z' }, params => {
                        window.customCsiHandlerCallStack.push('C');
                        window.customCsiHandlerParams.push(params);
                        return false;
                    })
                ];
            });
            yield ctx.proxy.write('\x1b[1;2+Z');
            (0, assert_1.deepStrictEqual)(yield ctx.page.evaluate(() => window.customCsiHandlerCallStack), [
                'C',
                'B',
                'A'
            ]);
            (0, assert_1.deepStrictEqual)(yield ctx.page.evaluate(() => window.customCsiHandlerParams), [
                [1, 2],
                [1, 2],
                [1, 2]
            ]);
        }));
    });
    test_1.test.describe('registerDcsHandler', () => {
        (0, test_1.test)('should respects return value', () => __awaiter(void 0, void 0, void 0, function* () {
            yield ctx.proxy.evaluate(([term]) => {
                window.customDcsHandlerCallStack = [];
                window.disposables = [
                    term.parser.registerDcsHandler({ intermediates: '+', final: 'p' }, (data, params) => {
                        window.customDcsHandlerCallStack.push(['A', params, data]);
                        return false;
                    }),
                    term.parser.registerDcsHandler({ intermediates: '+', final: 'p' }, (data, params) => {
                        window.customDcsHandlerCallStack.push(['B', params, data]);
                        return true;
                    }),
                    term.parser.registerDcsHandler({ intermediates: '+', final: 'p' }, (data, params) => {
                        window.customDcsHandlerCallStack.push(['C', params, data]);
                        return false;
                    })
                ];
            });
            yield ctx.proxy.write('\x1bP1;2+psome data\x1b\\');
            (0, assert_1.deepStrictEqual)(yield ctx.page.evaluate(() => window.customDcsHandlerCallStack), [
                ['C', [1, 2], 'some data'],
                ['B', [1, 2], 'some data']
            ]);
        }));
        (0, test_1.test)('async', () => __awaiter(void 0, void 0, void 0, function* () {
            yield ctx.proxy.evaluate(([term]) => {
                window.customDcsHandlerCallStack = [];
                window.disposables = [
                    term.parser.registerDcsHandler({ intermediates: '+', final: 'q' }, (data, params) => {
                        window.customDcsHandlerCallStack.push(['A', params, data]);
                        return false;
                    }),
                    term.parser.registerDcsHandler({ intermediates: '+', final: 'q' }, (data, params) => {
                        return new Promise(res => setTimeout(res, 50)).then(() => {
                            window.customDcsHandlerCallStack.push(['B', params, data]);
                            return false;
                        });
                    }),
                    term.parser.registerDcsHandler({ intermediates: '+', final: 'q' }, (data, params) => {
                        window.customDcsHandlerCallStack.push(['C', params, data]);
                        return false;
                    })
                ];
            });
            yield ctx.proxy.write('\x1bP1;2+qsome data\x1b\\');
            (0, assert_1.deepStrictEqual)(yield ctx.page.evaluate(() => window.customDcsHandlerCallStack), [
                ['C', [1, 2], 'some data'],
                ['B', [1, 2], 'some data'],
                ['A', [1, 2], 'some data']
            ]);
        }));
    });
    test_1.test.describe('registerEscHandler', () => {
        (0, test_1.test)('should respects return value', () => __awaiter(void 0, void 0, void 0, function* () {
            yield ctx.proxy.evaluate(([term]) => {
                window.customEscHandlerCallStack = [];
                window.disposables = [
                    term.parser.registerEscHandler({ intermediates: '(', final: 'B' }, () => {
                        window.customEscHandlerCallStack.push('A');
                        return false;
                    }),
                    term.parser.registerEscHandler({ intermediates: '(', final: 'B' }, () => {
                        window.customEscHandlerCallStack.push('B');
                        return true;
                    }),
                    term.parser.registerEscHandler({ intermediates: '(', final: 'B' }, () => {
                        window.customEscHandlerCallStack.push('C');
                        return false;
                    })
                ];
            });
            yield ctx.proxy.write('\x1b(B');
            (0, assert_1.deepStrictEqual)(yield ctx.page.evaluate(() => window.customEscHandlerCallStack), ['C', 'B']);
        }));
        (0, test_1.test)('async', () => __awaiter(void 0, void 0, void 0, function* () {
            yield ctx.proxy.evaluate(([term]) => {
                window.customEscHandlerCallStack = [];
                window.disposables = [
                    term.parser.registerEscHandler({ intermediates: '(', final: 'Z' }, () => {
                        window.customEscHandlerCallStack.push('A');
                        return false;
                    }),
                    term.parser.registerEscHandler({ intermediates: '(', final: 'Z' }, () => {
                        return new Promise(res => setTimeout(res, 50)).then(() => {
                            window.customEscHandlerCallStack.push('B');
                            return false;
                        });
                    }),
                    term.parser.registerEscHandler({ intermediates: '(', final: 'Z' }, () => {
                        window.customEscHandlerCallStack.push('C');
                        return false;
                    })
                ];
            });
            yield ctx.proxy.write('\x1b(Z');
            (0, assert_1.deepStrictEqual)(yield ctx.page.evaluate(() => window.customEscHandlerCallStack), ['C', 'B', 'A']);
        }));
    });
    test_1.test.describe('registerOscHandler', () => {
        (0, test_1.test)('should respects return value', () => __awaiter(void 0, void 0, void 0, function* () {
            yield ctx.proxy.evaluate(([term]) => {
                window.customOscHandlerCallStack = [];
                window.disposables = [
                    term.parser.registerOscHandler(1234, data => {
                        window.customOscHandlerCallStack.push(['A', data]);
                        return false;
                    }),
                    term.parser.registerOscHandler(1234, data => {
                        window.customOscHandlerCallStack.push(['B', data]);
                        return true;
                    }),
                    term.parser.registerOscHandler(1234, data => {
                        window.customOscHandlerCallStack.push(['C', data]);
                        return false;
                    })
                ];
            });
            yield ctx.proxy.write('\x1b]1234;some data\x07');
            (0, assert_1.deepStrictEqual)(yield ctx.page.evaluate(() => window.customOscHandlerCallStack), [
                ['C', 'some data'],
                ['B', 'some data']
            ]);
        }));
        (0, test_1.test)('async', () => __awaiter(void 0, void 0, void 0, function* () {
            yield ctx.proxy.evaluate(([term]) => {
                window.customOscHandlerCallStack = [];
                window.disposables = [
                    term.parser.registerOscHandler(666, data => {
                        window.customOscHandlerCallStack.push(['A', data]);
                        return false;
                    }),
                    term.parser.registerOscHandler(666, data => {
                        return new Promise(res => setTimeout(res, 50)).then(() => {
                            window.customOscHandlerCallStack.push(['B', data]);
                            return false;
                        });
                    }),
                    term.parser.registerOscHandler(666, data => {
                        window.customOscHandlerCallStack.push(['C', data]);
                        return false;
                    })
                ];
            });
            yield ctx.proxy.write('\x1b]666;some data\x07');
            (0, assert_1.deepStrictEqual)(yield ctx.page.evaluate(() => window.customOscHandlerCallStack), [
                ['C', 'some data'],
                ['B', 'some data'],
                ['A', 'some data']
            ]);
        }));
    });
});
//# sourceMappingURL=Parser.test.js.map