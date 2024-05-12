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
const TestUtils_1 = require("./TestUtils");
let ctx;
test_1.test.beforeAll(({ browser }) => __awaiter(void 0, void 0, void 0, function* () {
    ctx = yield (0, TestUtils_1.createTestContext)(browser);
    yield (0, TestUtils_1.openTerminal)(ctx);
}));
test_1.test.afterAll(() => __awaiter(void 0, void 0, void 0, function* () { return yield ctx.page.close(); }));
const width = 1280;
const height = 960;
const fontSize = 6;
const cols = 260;
const rows = 50;
const noShift = process.platform === 'darwin' ? false : true;
function resetMouseModes() {
    return __awaiter(this, void 0, void 0, function* () {
        yield ctx.proxy.write('\x1b[?9l\x1b[?1000l\x1b[?1001l\x1b[?1002l\x1b[?1003l');
        yield ctx.proxy.write('\x1b[?1005l\x1b[?1006l\x1b[?1015l');
    });
}
function getReports(encoding) {
    return __awaiter(this, void 0, void 0, function* () {
        const reports = yield ctx.page.evaluate(`window.calls`);
        yield ctx.page.evaluate(`window.calls = [];`);
        return reports.map((report) => parseReport(encoding, report));
    });
}
function cellPos(col, row) {
    return __awaiter(this, void 0, void 0, function* () {
        const coords = yield ctx.page.evaluate(`
    (function() {
      const rect = window.term.element.getBoundingClientRect();
      const dim = term._core._renderService.dimensions;
      return {left: rect.left, top: rect.top, bottom: rect.bottom, right: rect.right, width: dim.css.cell.width, height: dim.css.cell.height};
    })();
  `);
        return [col * coords.width + coords.left + 2, row * coords.height + coords.top + 2];
    });
}
function mouseMove(col, row) {
    return __awaiter(this, void 0, void 0, function* () {
        const [xPixels, yPixels] = yield cellPos(col, row);
        yield ctx.page.mouse.move(xPixels, yPixels);
    });
}
function mouseDown(button) {
    return __awaiter(this, void 0, void 0, function* () {
        yield ctx.page.mouse.down({ button });
    });
}
function mouseUp(button) {
    return __awaiter(this, void 0, void 0, function* () {
        yield ctx.page.mouse.up({ button });
    });
}
const buttons = {
    '<none>': -1,
    left: 0,
    middle: 1,
    right: 2,
    released: 3,
    wheelUp: 4,
    wheelDown: 5,
    wheelLeft: 6,
    wheelRight: 7,
    aux8: 8,
    aux9: 9,
    aux10: 10,
    aux11: 11,
    aux12: 12,
    aux13: 13,
    aux14: 14,
    aux15: 15
};
const reverseButtons = {};
for (const el in buttons) {
    reverseButtons[buttons[el]] = el;
}
function evalButtonCode(code) {
    if (code > 255) {
        return { button: 'invalid', action: 'invalid', modifier: {} };
    }
    const modifier = { shift: !!(code & 4), meta: !!(code & 8), control: !!(code & 16) };
    const move = code & 32;
    let button = code & 3;
    if (code & 128) {
        button |= 8;
    }
    if (code & 64) {
        button |= 4;
    }
    let actionS = 'press';
    let buttonS = reverseButtons[button];
    if (button === 3) {
        buttonS = '<none>';
        actionS = 'release';
    }
    if (move) {
        actionS = 'move';
    }
    else if (4 <= button && button <= 7) {
        buttonS = 'wheel';
        actionS = button === 4 ? 'up' : button === 5 ? 'down' : button === 6 ? 'left' : 'right';
    }
    return { button: buttonS, action: actionS, modifier };
}
function parseReport(encoding, msg) {
    let sReport;
    let buttonCode;
    let row;
    let col;
    const report = String.fromCharCode.apply(null, msg);
    if (!report || report[0] !== '\x1b') {
        return report;
    }
    switch (encoding) {
        case 'DEFAULT':
            return {
                state: evalButtonCode(report.charCodeAt(3) - 32),
                col: report.charCodeAt(4) - 32,
                row: report.charCodeAt(5) - 32
            };
        case 'SGR':
            sReport = report.slice(3, -1);
            [buttonCode, col, row] = sReport.split(';').map(el => parseInt(el));
            const state = evalButtonCode(buttonCode);
            if (report[report.length - 1] === 'm') {
                state.action = 'release';
            }
            return { state, row, col };
        default:
            return {
                state: evalButtonCode(report.charCodeAt(3) - 32),
                col: report.charCodeAt(4) - 32,
                row: report.charCodeAt(5) - 32
            };
    }
}
test_1.test.describe('Mouse Tracking Tests', () => {
    test_1.test.beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
        yield ctx.page.setViewportSize({ width, height });
        yield ctx.page.evaluate(`
      window.term.onData(e => window.calls.push( Array.from(e).map(el => el.charCodeAt(0)) ));
      window.term.onBinary(e => window.calls.push( Array.from(e).map(el => el.charCodeAt(0)) ));
    `);
    }));
    test_1.test.beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
        yield ctx.page.evaluate(`
      window.calls = [];
      window.term.options.fontSize = ${fontSize};
    `);
        yield ctx.proxy.resize(cols, rows);
    }));
    test_1.test.describe('DECSET 9 (X10)', () => __awaiter(void 0, void 0, void 0, function* () {
        (0, test_1.test)('default encoding', () => __awaiter(void 0, void 0, void 0, function* () {
            if (ctx.browser.browserType().name() === 'webkit') {
                test_1.test.skip();
                return;
            }
            const encoding = 'DEFAULT';
            yield resetMouseModes();
            yield mouseMove(0, 0);
            yield ctx.proxy.write('\x1b[?9h');
            yield mouseDown('left');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [{ col: 1, row: 1, state: { action: 'press', button: 'left', modifier: { control: false, shift: false, meta: false } } }]);
            yield mouseUp('left');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), []);
            yield mouseMove(50, 10);
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), []);
            yield mouseDown('left');
            yield mouseUp('left');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [{ col: 51, row: 11, state: { action: 'press', button: 'left', modifier: { control: false, shift: false, meta: false } } }]);
            yield mouseMove(223 - 1, rows - 1);
            yield mouseDown('left');
            yield mouseUp('left');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [{ col: 223, row: rows, state: { action: 'press', button: 'left', modifier: { control: false, shift: false, meta: false } } }]);
            yield mouseMove(257, rows - 1);
            yield mouseDown('left');
            yield mouseUp('left');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), []);
            yield mouseMove(43, 24);
            yield getReports(encoding);
            yield mouseDown('left');
            yield mouseMove(44, 24);
            yield mouseUp('left');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [{ col: 44, row: 25, state: { action: 'press', button: 'left', modifier: { control: false, shift: false, meta: false } } }]);
            yield mouseMove(43, 24);
            yield getReports(encoding);
            yield mouseDown('right');
            yield mouseMove(44, 24);
            yield mouseUp('right');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [{ col: 44, row: 25, state: { action: 'press', button: 'right', modifier: { control: false, shift: false, meta: false } } }]);
            yield mouseMove(43, 24);
            yield getReports(encoding);
            yield ctx.page.keyboard.down('Control');
            yield mouseDown('left');
            yield mouseMove(44, 24);
            yield mouseUp('left');
            yield ctx.page.keyboard.up('Control');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [{ col: 44, row: 25, state: { action: 'press', button: 'left', modifier: { control: false, shift: false, meta: false } } }]);
            yield mouseMove(43, 24);
            yield getReports(encoding);
            yield ctx.page.keyboard.down('Alt');
            yield mouseDown('left');
            yield mouseMove(44, 24);
            yield mouseUp('left');
            yield ctx.page.keyboard.up('Alt');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [{ col: 44, row: 25, state: { action: 'press', button: 'left', modifier: { control: false, shift: false, meta: false } } }]);
            yield mouseMove(43, 24);
            yield getReports(encoding);
            yield ctx.page.keyboard.down('Shift');
            yield mouseDown('left');
            yield mouseMove(44, 24);
            yield mouseUp('left');
            yield ctx.page.keyboard.up('Shift');
            if (noShift) {
                yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), []);
            }
            else {
                yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [
                    { col: 44, row: 25, state: { action: 'press', button: 'left', modifier: { control: false, shift: false, meta: false } } }
                ]);
            }
            yield mouseMove(43, 24);
            yield getReports(encoding);
            yield ctx.page.keyboard.down('Control');
            yield ctx.page.keyboard.down('Alt');
            yield mouseDown('left');
            yield mouseMove(44, 24);
            yield mouseUp('left');
            yield ctx.page.keyboard.up('Control');
            yield ctx.page.keyboard.up('Alt');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [{ col: 44, row: 25, state: { action: 'press', button: 'left', modifier: { control: false, shift: false, meta: false } } }]);
        }));
        (0, test_1.test)('SGR encoding', () => __awaiter(void 0, void 0, void 0, function* () {
            if (ctx.browser.browserType().name() === 'webkit') {
                test_1.test.skip();
                return;
            }
            const encoding = 'SGR';
            yield resetMouseModes();
            yield mouseMove(0, 0);
            yield ctx.proxy.write('\x1b[?9h\x1b[?1006h');
            yield mouseDown('left');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [{ col: 1, row: 1, state: { action: 'press', button: 'left', modifier: { control: false, shift: false, meta: false } } }]);
            yield mouseUp('left');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), []);
            yield mouseMove(50, 10);
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), []);
            yield mouseDown('left');
            yield mouseUp('left');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [{ col: 51, row: 11, state: { action: 'press', button: 'left', modifier: { control: false, shift: false, meta: false } } }]);
            yield mouseMove(cols - 1, rows - 1);
            yield mouseDown('left');
            yield mouseUp('left');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [{ col: cols, row: rows, state: { action: 'press', button: 'left', modifier: { control: false, shift: false, meta: false } } }]);
            yield mouseMove(43, 24);
            yield getReports(encoding);
            yield mouseDown('left');
            yield mouseMove(44, 24);
            yield mouseUp('left');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [{ col: 44, row: 25, state: { action: 'press', button: 'left', modifier: { control: false, shift: false, meta: false } } }]);
            yield mouseMove(43, 24);
            yield getReports(encoding);
            yield mouseDown('right');
            yield mouseMove(44, 24);
            yield mouseUp('right');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [{ col: 44, row: 25, state: { action: 'press', button: 'right', modifier: { control: false, shift: false, meta: false } } }]);
            yield mouseMove(43, 24);
            yield getReports(encoding);
            yield ctx.page.keyboard.down('Control');
            yield mouseDown('left');
            yield mouseMove(44, 24);
            yield mouseUp('left');
            yield ctx.page.keyboard.up('Control');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [{ col: 44, row: 25, state: { action: 'press', button: 'left', modifier: { control: false, shift: false, meta: false } } }]);
            yield mouseMove(43, 24);
            yield getReports(encoding);
            yield ctx.page.keyboard.down('Alt');
            yield mouseDown('left');
            yield mouseMove(44, 24);
            yield mouseUp('left');
            yield ctx.page.keyboard.up('Alt');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [{ col: 44, row: 25, state: { action: 'press', button: 'left', modifier: { control: false, shift: false, meta: false } } }]);
            yield mouseMove(43, 24);
            yield getReports(encoding);
            yield ctx.page.keyboard.down('Shift');
            yield mouseDown('left');
            yield mouseMove(44, 24);
            yield mouseUp('left');
            yield ctx.page.keyboard.up('Shift');
            if (noShift) {
                yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), []);
            }
            else {
                yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [
                    { col: 44, row: 25, state: { action: 'press', button: 'left', modifier: { control: false, shift: false, meta: false } } }
                ]);
            }
            yield mouseMove(43, 24);
            yield getReports(encoding);
            yield ctx.page.keyboard.down('Control');
            yield ctx.page.keyboard.down('Alt');
            yield mouseDown('left');
            yield mouseMove(44, 24);
            yield mouseUp('left');
            yield ctx.page.keyboard.up('Control');
            yield ctx.page.keyboard.up('Alt');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [{ col: 44, row: 25, state: { action: 'press', button: 'left', modifier: { control: false, shift: false, meta: false } } }]);
        }));
    }));
    test_1.test.describe('DECSET 1000 (VT200 mouse)', () => {
        (0, test_1.test)('default encoding', () => __awaiter(void 0, void 0, void 0, function* () {
            if (ctx.browser.browserType().name() === 'webkit') {
                test_1.test.skip();
                return;
            }
            const encoding = 'DEFAULT';
            yield resetMouseModes();
            yield mouseMove(0, 0);
            yield ctx.proxy.write('\x1b[?1000h');
            yield mouseDown('left');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [
                { col: 1, row: 1, state: { action: 'press', button: 'left', modifier: { control: false, shift: false, meta: false } } }
            ]);
            yield mouseUp('left');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [
                { col: 1, row: 1, state: { action: 'release', button: '<none>', modifier: { control: false, shift: false, meta: false } } }
            ]);
            yield mouseMove(50, 10);
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), []);
            yield mouseDown('left');
            yield mouseUp('left');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [
                { col: 51, row: 11, state: { action: 'press', button: 'left', modifier: { control: false, shift: false, meta: false } } },
                { col: 51, row: 11, state: { action: 'release', button: '<none>', modifier: { control: false, shift: false, meta: false } } }
            ]);
            yield mouseMove(223 - 1, rows - 1);
            yield mouseDown('left');
            yield mouseUp('left');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [
                { col: 223, row: rows, state: { action: 'press', button: 'left', modifier: { control: false, shift: false, meta: false } } },
                { col: 223, row: rows, state: { action: 'release', button: '<none>', modifier: { control: false, shift: false, meta: false } } }
            ]);
            yield mouseMove(43, 24);
            yield getReports(encoding);
            yield mouseDown('left');
            yield mouseMove(44, 24);
            yield mouseUp('left');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [
                { col: 44, row: 25, state: { action: 'press', button: 'left', modifier: { control: false, shift: false, meta: false } } },
                { col: 45, row: 25, state: { action: 'release', button: '<none>', modifier: { control: false, shift: false, meta: false } } }
            ]);
            yield mouseMove(43, 24);
            yield getReports(encoding);
            yield mouseDown('right');
            yield mouseMove(44, 24);
            yield mouseUp('right');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [
                { col: 44, row: 25, state: { action: 'press', button: 'right', modifier: { control: false, shift: false, meta: false } } },
                { col: 45, row: 25, state: { action: 'release', button: '<none>', modifier: { control: false, shift: false, meta: false } } }
            ]);
            yield mouseMove(43, 24);
            yield getReports(encoding);
            yield ctx.page.keyboard.down('Control');
            yield mouseDown('left');
            yield mouseMove(44, 24);
            yield mouseUp('left');
            yield ctx.page.keyboard.up('Control');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [
                { col: 44, row: 25, state: { action: 'press', button: 'left', modifier: { control: true, shift: false, meta: false } } },
                { col: 45, row: 25, state: { action: 'release', button: '<none>', modifier: { control: true, shift: false, meta: false } } }
            ]);
            yield mouseMove(43, 24);
            yield getReports(encoding);
            yield ctx.page.keyboard.down('Alt');
            yield mouseDown('left');
            yield mouseMove(44, 24);
            yield mouseUp('left');
            yield ctx.page.keyboard.up('Alt');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [
                { col: 44, row: 25, state: { action: 'press', button: 'left', modifier: { control: false, shift: false, meta: true } } },
                { col: 45, row: 25, state: { action: 'release', button: '<none>', modifier: { control: false, shift: false, meta: true } } }
            ]);
            yield mouseMove(43, 24);
            yield getReports(encoding);
            yield ctx.page.keyboard.down('Control');
            yield ctx.page.keyboard.down('Alt');
            yield mouseDown('left');
            yield mouseMove(44, 24);
            yield mouseUp('left');
            yield ctx.page.keyboard.up('Control');
            yield ctx.page.keyboard.up('Alt');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [
                { col: 44, row: 25, state: { action: 'press', button: 'left', modifier: { control: true, shift: false, meta: true } } },
                { col: 45, row: 25, state: { action: 'release', button: '<none>', modifier: { control: true, shift: false, meta: true } } }
            ]);
        }));
        (0, test_1.test)('SGR encoding', () => __awaiter(void 0, void 0, void 0, function* () {
            if (ctx.browser.browserType().name() === 'webkit') {
                test_1.test.skip();
                return;
            }
            const encoding = 'SGR';
            yield resetMouseModes();
            yield mouseMove(0, 0);
            yield ctx.proxy.write('\x1b[?1000h\x1b[?1006h');
            yield mouseDown('left');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [
                { col: 1, row: 1, state: { action: 'press', button: 'left', modifier: { control: false, shift: false, meta: false } } }
            ]);
            yield mouseUp('left');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [
                { col: 1, row: 1, state: { action: 'release', button: 'left', modifier: { control: false, shift: false, meta: false } } }
            ]);
            yield mouseMove(50, 10);
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), []);
            yield mouseDown('left');
            yield mouseUp('left');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [
                { col: 51, row: 11, state: { action: 'press', button: 'left', modifier: { control: false, shift: false, meta: false } } },
                { col: 51, row: 11, state: { action: 'release', button: 'left', modifier: { control: false, shift: false, meta: false } } }
            ]);
            yield mouseMove(cols - 1, rows - 1);
            yield mouseDown('left');
            yield mouseUp('left');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [
                { col: cols, row: rows, state: { action: 'press', button: 'left', modifier: { control: false, shift: false, meta: false } } },
                { col: cols, row: rows, state: { action: 'release', button: 'left', modifier: { control: false, shift: false, meta: false } } }
            ]);
            yield mouseMove(43, 24);
            yield getReports(encoding);
            yield mouseDown('left');
            yield mouseMove(44, 24);
            yield mouseUp('left');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [
                { col: 44, row: 25, state: { action: 'press', button: 'left', modifier: { control: false, shift: false, meta: false } } },
                { col: 45, row: 25, state: { action: 'release', button: 'left', modifier: { control: false, shift: false, meta: false } } }
            ]);
            yield mouseMove(43, 24);
            yield getReports(encoding);
            yield mouseDown('right');
            yield mouseMove(44, 24);
            yield mouseUp('right');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [
                { col: 44, row: 25, state: { action: 'press', button: 'right', modifier: { control: false, shift: false, meta: false } } },
                { col: 45, row: 25, state: { action: 'release', button: 'right', modifier: { control: false, shift: false, meta: false } } }
            ]);
            yield mouseMove(43, 24);
            yield getReports(encoding);
            yield ctx.page.keyboard.down('Control');
            yield mouseDown('left');
            yield mouseMove(44, 24);
            yield mouseUp('left');
            yield ctx.page.keyboard.up('Control');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [
                { col: 44, row: 25, state: { action: 'press', button: 'left', modifier: { control: true, shift: false, meta: false } } },
                { col: 45, row: 25, state: { action: 'release', button: 'left', modifier: { control: true, shift: false, meta: false } } }
            ]);
            yield mouseMove(43, 24);
            yield getReports(encoding);
            yield ctx.page.keyboard.down('Alt');
            yield mouseDown('left');
            yield mouseMove(44, 24);
            yield mouseUp('left');
            yield ctx.page.keyboard.up('Alt');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [
                { col: 44, row: 25, state: { action: 'press', button: 'left', modifier: { control: false, shift: false, meta: true } } },
                { col: 45, row: 25, state: { action: 'release', button: 'left', modifier: { control: false, shift: false, meta: true } } }
            ]);
            yield mouseMove(43, 24);
            yield getReports(encoding);
            yield ctx.page.keyboard.down('Control');
            yield ctx.page.keyboard.down('Alt');
            yield mouseDown('left');
            yield mouseMove(44, 24);
            yield mouseUp('left');
            yield ctx.page.keyboard.up('Control');
            yield ctx.page.keyboard.up('Alt');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [
                { col: 44, row: 25, state: { action: 'press', button: 'left', modifier: { control: true, shift: false, meta: true } } },
                { col: 45, row: 25, state: { action: 'release', button: 'left', modifier: { control: true, shift: false, meta: true } } }
            ]);
        }));
    });
    test_1.test.describe('DECSET 1002 (xterm with drag)', () => {
        (0, test_1.test)('default encoding', () => __awaiter(void 0, void 0, void 0, function* () {
            if (ctx.browser.browserType().name() === 'webkit') {
                test_1.test.skip();
                return;
            }
            const encoding = 'DEFAULT';
            yield resetMouseModes();
            yield mouseMove(0, 0);
            yield ctx.proxy.write('\x1b[?1002h');
            yield mouseDown('left');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [
                { col: 1, row: 1, state: { action: 'press', button: 'left', modifier: { control: false, shift: false, meta: false } } }
            ]);
            yield mouseUp('left');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [
                { col: 1, row: 1, state: { action: 'release', button: '<none>', modifier: { control: false, shift: false, meta: false } } }
            ]);
            yield mouseMove(50, 10);
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), []);
            yield mouseDown('left');
            yield mouseUp('left');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [
                { col: 51, row: 11, state: { action: 'press', button: 'left', modifier: { control: false, shift: false, meta: false } } },
                { col: 51, row: 11, state: { action: 'release', button: '<none>', modifier: { control: false, shift: false, meta: false } } }
            ]);
            yield mouseMove(223 - 1, rows - 1);
            yield mouseDown('left');
            yield mouseUp('left');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [
                { col: 223, row: rows, state: { action: 'press', button: 'left', modifier: { control: false, shift: false, meta: false } } },
                { col: 223, row: rows, state: { action: 'release', button: '<none>', modifier: { control: false, shift: false, meta: false } } }
            ]);
            yield mouseMove(43, 24);
            yield getReports(encoding);
            yield mouseDown('left');
            yield mouseMove(44, 24);
            yield mouseUp('left');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [
                { col: 44, row: 25, state: { action: 'press', button: 'left', modifier: { control: false, shift: false, meta: false } } },
                { col: 45, row: 25, state: { action: 'move', button: 'left', modifier: { control: false, shift: false, meta: false } } },
                { col: 45, row: 25, state: { action: 'release', button: '<none>', modifier: { control: false, shift: false, meta: false } } }
            ]);
            yield mouseMove(43, 24);
            yield getReports(encoding);
            yield mouseDown('right');
            yield mouseMove(44, 24);
            yield mouseUp('right');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [
                { col: 44, row: 25, state: { action: 'press', button: 'right', modifier: { control: false, shift: false, meta: false } } },
                { col: 45, row: 25, state: { action: 'move', button: 'right', modifier: { control: false, shift: false, meta: false } } },
                { col: 45, row: 25, state: { action: 'release', button: '<none>', modifier: { control: false, shift: false, meta: false } } }
            ]);
            yield mouseMove(43, 24);
            yield getReports(encoding);
            yield ctx.page.keyboard.down('Control');
            yield mouseDown('left');
            yield mouseMove(44, 24);
            yield mouseUp('left');
            yield ctx.page.keyboard.up('Control');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [
                { col: 44, row: 25, state: { action: 'press', button: 'left', modifier: { control: true, shift: false, meta: false } } },
                { col: 45, row: 25, state: { action: 'move', button: 'left', modifier: { control: true, shift: false, meta: false } } },
                { col: 45, row: 25, state: { action: 'release', button: '<none>', modifier: { control: true, shift: false, meta: false } } }
            ]);
            yield mouseMove(43, 24);
            yield getReports(encoding);
            yield ctx.page.keyboard.down('Alt');
            yield mouseDown('left');
            yield mouseMove(44, 24);
            yield mouseUp('left');
            yield ctx.page.keyboard.up('Alt');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [
                { col: 44, row: 25, state: { action: 'press', button: 'left', modifier: { control: false, shift: false, meta: true } } },
                { col: 45, row: 25, state: { action: 'move', button: 'left', modifier: { control: false, shift: false, meta: true } } },
                { col: 45, row: 25, state: { action: 'release', button: '<none>', modifier: { control: false, shift: false, meta: true } } }
            ]);
            yield mouseMove(43, 24);
            yield getReports(encoding);
            yield ctx.page.keyboard.down('Control');
            yield ctx.page.keyboard.down('Alt');
            yield mouseDown('left');
            yield mouseMove(44, 24);
            yield mouseUp('left');
            yield ctx.page.keyboard.up('Control');
            yield ctx.page.keyboard.up('Alt');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [
                { col: 44, row: 25, state: { action: 'press', button: 'left', modifier: { control: true, shift: false, meta: true } } },
                { col: 45, row: 25, state: { action: 'move', button: 'left', modifier: { control: true, shift: false, meta: true } } },
                { col: 45, row: 25, state: { action: 'release', button: '<none>', modifier: { control: true, shift: false, meta: true } } }
            ]);
        }));
        (0, test_1.test)('SGR encoding', () => __awaiter(void 0, void 0, void 0, function* () {
            if (ctx.browser.browserType().name() === 'webkit') {
                test_1.test.skip();
                return;
            }
            const encoding = 'SGR';
            yield resetMouseModes();
            yield mouseMove(0, 0);
            yield ctx.proxy.write('\x1b[?1002h\x1b[?1006h');
            yield mouseDown('left');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [
                { col: 1, row: 1, state: { action: 'press', button: 'left', modifier: { control: false, shift: false, meta: false } } }
            ]);
            yield mouseUp('left');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [
                { col: 1, row: 1, state: { action: 'release', button: 'left', modifier: { control: false, shift: false, meta: false } } }
            ]);
            yield mouseMove(50, 10);
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), []);
            yield mouseDown('left');
            yield mouseUp('left');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [
                { col: 51, row: 11, state: { action: 'press', button: 'left', modifier: { control: false, shift: false, meta: false } } },
                { col: 51, row: 11, state: { action: 'release', button: 'left', modifier: { control: false, shift: false, meta: false } } }
            ]);
            yield mouseMove(cols - 1, rows - 1);
            yield mouseDown('left');
            yield mouseUp('left');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [
                { col: cols, row: rows, state: { action: 'press', button: 'left', modifier: { control: false, shift: false, meta: false } } },
                { col: cols, row: rows, state: { action: 'release', button: 'left', modifier: { control: false, shift: false, meta: false } } }
            ]);
            yield mouseMove(43, 24);
            yield getReports(encoding);
            yield mouseDown('left');
            yield mouseMove(44, 24);
            yield mouseUp('left');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [
                { col: 44, row: 25, state: { action: 'press', button: 'left', modifier: { control: false, shift: false, meta: false } } },
                { col: 45, row: 25, state: { action: 'move', button: 'left', modifier: { control: false, shift: false, meta: false } } },
                { col: 45, row: 25, state: { action: 'release', button: 'left', modifier: { control: false, shift: false, meta: false } } }
            ]);
            yield mouseMove(43, 24);
            yield getReports(encoding);
            yield mouseDown('right');
            yield mouseMove(44, 24);
            yield mouseUp('right');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [
                { col: 44, row: 25, state: { action: 'press', button: 'right', modifier: { control: false, shift: false, meta: false } } },
                { col: 45, row: 25, state: { action: 'move', button: 'right', modifier: { control: false, shift: false, meta: false } } },
                { col: 45, row: 25, state: { action: 'release', button: 'right', modifier: { control: false, shift: false, meta: false } } }
            ]);
            yield mouseMove(43, 24);
            yield getReports(encoding);
            yield ctx.page.keyboard.down('Control');
            yield mouseDown('left');
            yield mouseMove(44, 24);
            yield mouseUp('left');
            yield ctx.page.keyboard.up('Control');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [
                { col: 44, row: 25, state: { action: 'press', button: 'left', modifier: { control: true, shift: false, meta: false } } },
                { col: 45, row: 25, state: { action: 'move', button: 'left', modifier: { control: true, shift: false, meta: false } } },
                { col: 45, row: 25, state: { action: 'release', button: 'left', modifier: { control: true, shift: false, meta: false } } }
            ]);
            yield mouseMove(43, 24);
            yield getReports(encoding);
            yield ctx.page.keyboard.down('Alt');
            yield mouseDown('left');
            yield mouseMove(44, 24);
            yield mouseUp('left');
            yield ctx.page.keyboard.up('Alt');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [
                { col: 44, row: 25, state: { action: 'press', button: 'left', modifier: { control: false, shift: false, meta: true } } },
                { col: 45, row: 25, state: { action: 'move', button: 'left', modifier: { control: false, shift: false, meta: true } } },
                { col: 45, row: 25, state: { action: 'release', button: 'left', modifier: { control: false, shift: false, meta: true } } }
            ]);
            yield mouseMove(43, 24);
            yield getReports(encoding);
            yield ctx.page.keyboard.down('Control');
            yield ctx.page.keyboard.down('Alt');
            yield mouseDown('left');
            yield mouseMove(44, 24);
            yield mouseUp('left');
            yield ctx.page.keyboard.up('Control');
            yield ctx.page.keyboard.up('Alt');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [
                { col: 44, row: 25, state: { action: 'press', button: 'left', modifier: { control: true, shift: false, meta: true } } },
                { col: 45, row: 25, state: { action: 'move', button: 'left', modifier: { control: true, shift: false, meta: true } } },
                { col: 45, row: 25, state: { action: 'release', button: 'left', modifier: { control: true, shift: false, meta: true } } }
            ]);
        }));
    });
    test_1.test.describe('DECSET 1003 (xterm any event)', () => {
        (0, test_1.test)('default encoding', () => __awaiter(void 0, void 0, void 0, function* () {
            if (ctx.browser.browserType().name() === 'webkit') {
                test_1.test.skip();
                return;
            }
            const encoding = 'DEFAULT';
            yield resetMouseModes();
            yield mouseMove(0, 0);
            yield ctx.proxy.write('\x1b[?1003h');
            yield mouseDown('left');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [
                { col: 1, row: 1, state: { action: 'press', button: 'left', modifier: { control: false, shift: false, meta: false } } }
            ]);
            yield mouseUp('left');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [
                { col: 1, row: 1, state: { action: 'release', button: '<none>', modifier: { control: false, shift: false, meta: false } } }
            ]);
            yield mouseMove(50, 10);
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [
                { col: 51, row: 11, state: { action: 'move', button: '<none>', modifier: { control: false, shift: false, meta: false } } }
            ]);
            yield mouseDown('left');
            yield mouseUp('left');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [
                { col: 51, row: 11, state: { action: 'press', button: 'left', modifier: { control: false, shift: false, meta: false } } },
                { col: 51, row: 11, state: { action: 'release', button: '<none>', modifier: { control: false, shift: false, meta: false } } }
            ]);
            yield mouseMove(223 - 1, rows - 1);
            yield mouseDown('left');
            yield mouseUp('left');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [
                { col: 223, row: rows, state: { action: 'move', button: '<none>', modifier: { control: false, shift: false, meta: false } } },
                { col: 223, row: rows, state: { action: 'press', button: 'left', modifier: { control: false, shift: false, meta: false } } },
                { col: 223, row: rows, state: { action: 'release', button: '<none>', modifier: { control: false, shift: false, meta: false } } }
            ]);
            yield mouseMove(43, 24);
            yield mouseDown('left');
            yield mouseMove(44, 24);
            yield mouseUp('left');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [
                { col: 44, row: 25, state: { action: 'move', button: '<none>', modifier: { control: false, shift: false, meta: false } } },
                { col: 44, row: 25, state: { action: 'press', button: 'left', modifier: { control: false, shift: false, meta: false } } },
                { col: 45, row: 25, state: { action: 'move', button: 'left', modifier: { control: false, shift: false, meta: false } } },
                { col: 45, row: 25, state: { action: 'release', button: '<none>', modifier: { control: false, shift: false, meta: false } } }
            ]);
            yield mouseMove(43, 24);
            yield mouseDown('right');
            yield mouseMove(44, 24);
            yield mouseUp('right');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [
                { col: 44, row: 25, state: { action: 'move', button: '<none>', modifier: { control: false, shift: false, meta: false } } },
                { col: 44, row: 25, state: { action: 'press', button: 'right', modifier: { control: false, shift: false, meta: false } } },
                { col: 45, row: 25, state: { action: 'move', button: 'right', modifier: { control: false, shift: false, meta: false } } },
                { col: 45, row: 25, state: { action: 'release', button: '<none>', modifier: { control: false, shift: false, meta: false } } }
            ]);
            yield ctx.page.keyboard.down('Control');
            yield mouseMove(43, 24);
            yield mouseDown('left');
            yield mouseMove(44, 24);
            yield mouseUp('left');
            yield ctx.page.keyboard.up('Control');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [
                { col: 44, row: 25, state: { action: 'move', button: '<none>', modifier: { control: true, shift: false, meta: false } } },
                { col: 44, row: 25, state: { action: 'press', button: 'left', modifier: { control: true, shift: false, meta: false } } },
                { col: 45, row: 25, state: { action: 'move', button: 'left', modifier: { control: true, shift: false, meta: false } } },
                { col: 45, row: 25, state: { action: 'release', button: '<none>', modifier: { control: true, shift: false, meta: false } } }
            ]);
            yield ctx.page.keyboard.down('Alt');
            yield mouseMove(43, 24);
            yield mouseDown('left');
            yield mouseMove(44, 24);
            yield mouseUp('left');
            yield ctx.page.keyboard.up('Alt');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [
                { col: 44, row: 25, state: { action: 'move', button: '<none>', modifier: { control: false, shift: false, meta: true } } },
                { col: 44, row: 25, state: { action: 'press', button: 'left', modifier: { control: false, shift: false, meta: true } } },
                { col: 45, row: 25, state: { action: 'move', button: 'left', modifier: { control: false, shift: false, meta: true } } },
                { col: 45, row: 25, state: { action: 'release', button: '<none>', modifier: { control: false, shift: false, meta: true } } }
            ]);
            yield ctx.page.keyboard.down('Control');
            yield ctx.page.keyboard.down('Alt');
            yield mouseMove(43, 24);
            yield mouseDown('left');
            yield mouseMove(44, 24);
            yield mouseUp('left');
            yield ctx.page.keyboard.up('Control');
            yield ctx.page.keyboard.up('Alt');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [
                { col: 44, row: 25, state: { action: 'move', button: '<none>', modifier: { control: true, shift: false, meta: true } } },
                { col: 44, row: 25, state: { action: 'press', button: 'left', modifier: { control: true, shift: false, meta: true } } },
                { col: 45, row: 25, state: { action: 'move', button: 'left', modifier: { control: true, shift: false, meta: true } } },
                { col: 45, row: 25, state: { action: 'release', button: '<none>', modifier: { control: true, shift: false, meta: true } } }
            ]);
        }));
        (0, test_1.test)('SGR encoding', () => __awaiter(void 0, void 0, void 0, function* () {
            if (ctx.browser.browserType().name() === 'webkit') {
                test_1.test.skip();
                return;
            }
            const encoding = 'SGR';
            yield resetMouseModes();
            yield mouseMove(0, 0);
            yield ctx.proxy.write('\x1b[?1003h\x1b[?1006h');
            yield mouseDown('left');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [
                { col: 1, row: 1, state: { action: 'press', button: 'left', modifier: { control: false, shift: false, meta: false } } }
            ]);
            yield mouseUp('left');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [
                { col: 1, row: 1, state: { action: 'release', button: 'left', modifier: { control: false, shift: false, meta: false } } }
            ]);
            yield mouseMove(50, 10);
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [
                { col: 51, row: 11, state: { action: 'move', button: '<none>', modifier: { control: false, shift: false, meta: false } } }
            ]);
            yield mouseDown('left');
            yield mouseUp('left');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [
                { col: 51, row: 11, state: { action: 'press', button: 'left', modifier: { control: false, shift: false, meta: false } } },
                { col: 51, row: 11, state: { action: 'release', button: 'left', modifier: { control: false, shift: false, meta: false } } }
            ]);
            yield mouseMove(cols - 1, rows - 1);
            yield mouseDown('left');
            yield mouseUp('left');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [
                { col: cols, row: rows, state: { action: 'move', button: '<none>', modifier: { control: false, shift: false, meta: false } } },
                { col: cols, row: rows, state: { action: 'press', button: 'left', modifier: { control: false, shift: false, meta: false } } },
                { col: cols, row: rows, state: { action: 'release', button: 'left', modifier: { control: false, shift: false, meta: false } } }
            ]);
            yield mouseMove(43, 24);
            yield mouseDown('left');
            yield mouseMove(44, 24);
            yield mouseUp('left');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [
                { col: 44, row: 25, state: { action: 'move', button: '<none>', modifier: { control: false, shift: false, meta: false } } },
                { col: 44, row: 25, state: { action: 'press', button: 'left', modifier: { control: false, shift: false, meta: false } } },
                { col: 45, row: 25, state: { action: 'move', button: 'left', modifier: { control: false, shift: false, meta: false } } },
                { col: 45, row: 25, state: { action: 'release', button: 'left', modifier: { control: false, shift: false, meta: false } } }
            ]);
            yield mouseMove(43, 24);
            yield mouseDown('right');
            yield mouseMove(44, 24);
            yield mouseUp('right');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [
                { col: 44, row: 25, state: { action: 'move', button: '<none>', modifier: { control: false, shift: false, meta: false } } },
                { col: 44, row: 25, state: { action: 'press', button: 'right', modifier: { control: false, shift: false, meta: false } } },
                { col: 45, row: 25, state: { action: 'move', button: 'right', modifier: { control: false, shift: false, meta: false } } },
                { col: 45, row: 25, state: { action: 'release', button: 'right', modifier: { control: false, shift: false, meta: false } } }
            ]);
            yield ctx.page.keyboard.down('Control');
            yield mouseMove(43, 24);
            yield mouseDown('left');
            yield mouseMove(44, 24);
            yield mouseUp('left');
            yield ctx.page.keyboard.up('Control');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [
                { col: 44, row: 25, state: { action: 'move', button: '<none>', modifier: { control: true, shift: false, meta: false } } },
                { col: 44, row: 25, state: { action: 'press', button: 'left', modifier: { control: true, shift: false, meta: false } } },
                { col: 45, row: 25, state: { action: 'move', button: 'left', modifier: { control: true, shift: false, meta: false } } },
                { col: 45, row: 25, state: { action: 'release', button: 'left', modifier: { control: true, shift: false, meta: false } } }
            ]);
            yield ctx.page.keyboard.down('Alt');
            yield mouseMove(43, 24);
            yield mouseDown('left');
            yield mouseMove(44, 24);
            yield mouseUp('left');
            yield ctx.page.keyboard.up('Alt');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [
                { col: 44, row: 25, state: { action: 'move', button: '<none>', modifier: { control: false, shift: false, meta: true } } },
                { col: 44, row: 25, state: { action: 'press', button: 'left', modifier: { control: false, shift: false, meta: true } } },
                { col: 45, row: 25, state: { action: 'move', button: 'left', modifier: { control: false, shift: false, meta: true } } },
                { col: 45, row: 25, state: { action: 'release', button: 'left', modifier: { control: false, shift: false, meta: true } } }
            ]);
            yield ctx.page.keyboard.down('Control');
            yield ctx.page.keyboard.down('Alt');
            yield mouseMove(43, 24);
            yield mouseDown('left');
            yield mouseMove(44, 24);
            yield mouseUp('left');
            yield ctx.page.keyboard.up('Control');
            yield ctx.page.keyboard.up('Alt');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getReports(encoding), [
                { col: 44, row: 25, state: { action: 'move', button: '<none>', modifier: { control: true, shift: false, meta: true } } },
                { col: 44, row: 25, state: { action: 'press', button: 'left', modifier: { control: true, shift: false, meta: true } } },
                { col: 45, row: 25, state: { action: 'move', button: 'left', modifier: { control: true, shift: false, meta: true } } },
                { col: 45, row: 25, state: { action: 'release', button: 'left', modifier: { control: true, shift: false, meta: true } } }
            ]);
        }));
    });
});
//# sourceMappingURL=MouseTracking.test.js.map