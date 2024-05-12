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
test_1.test.describe('API Integration Tests', () => {
    (0, test_1.test)('Default options', () => __awaiter(void 0, void 0, void 0, function* () {
        (0, assert_1.strictEqual)(yield ctx.proxy.cols, 80);
        (0, assert_1.strictEqual)(yield ctx.proxy.rows, 24);
    }));
    (0, test_1.test)('Proposed API check', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, TestUtils_1.openTerminal)(ctx, { allowProposedApi: false }, { loadUnicodeGraphemesAddon: false });
        yield ctx.page.evaluate(`
      try {
        window.term.markers;
      } catch (e) {
        window.throwMessage = e.message;
      }
    `);
        yield (0, TestUtils_1.pollFor)(ctx.page, 'window.throwMessage', 'You must set the allowProposedApi option to true to use proposed API');
    }));
    (0, test_1.test)('write', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, TestUtils_1.openTerminal)(ctx);
        yield ctx.page.evaluate(`
      window.term.write('foo');
      window.term.write('bar');
      window.term.write('文');
    `);
        yield (0, TestUtils_1.pollFor)(ctx.page, `window.term.buffer.active.getLine(0).translateToString(true)`, 'foobar文');
    }));
    (0, test_1.test)('write with callback', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, TestUtils_1.openTerminal)(ctx);
        yield ctx.page.evaluate(`
      window.term.write('foo', () => { window.__x = 'a'; });
      window.term.write('bar', () => { window.__x += 'b'; });
      window.term.write('文', () => { window.__x += 'c'; });
    `);
        yield (0, TestUtils_1.pollFor)(ctx.page, `window.term.buffer.active.getLine(0).translateToString(true)`, 'foobar文');
        yield (0, TestUtils_1.pollFor)(ctx.page, `window.__x`, 'abc');
    }));
    (0, test_1.test)('write - bytes (UTF8)', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, TestUtils_1.openTerminal)(ctx);
        yield ctx.page.evaluate(`
      window.term.write(new Uint8Array([102, 111, 111])); // foo
      window.term.write(new Uint8Array([98, 97, 114])); // bar
      window.term.write(new Uint8Array([230, 150, 135])); // 文
    `);
        yield (0, TestUtils_1.pollFor)(ctx.page, `window.term.buffer.active.getLine(0).translateToString(true)`, 'foobar文');
    }));
    (0, test_1.test)('write - bytes (UTF8) with callback', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, TestUtils_1.openTerminal)(ctx);
        yield ctx.page.evaluate(`
      window.term.write(new Uint8Array([102, 111, 111]), () => { window.__x = 'A'; }); // foo
      window.term.write(new Uint8Array([98, 97, 114]), () => { window.__x += 'B'; }); // bar
      window.term.write(new Uint8Array([230, 150, 135]), () => { window.__x += 'C'; }); // 文
    `);
        yield (0, TestUtils_1.pollFor)(ctx.page, `window.term.buffer.active.getLine(0).translateToString(true)`, 'foobar文');
        yield (0, TestUtils_1.pollFor)(ctx.page, `window.__x`, 'ABC');
    }));
    (0, test_1.test)('writeln', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, TestUtils_1.openTerminal)(ctx);
        yield ctx.page.evaluate(`
      window.term.writeln('foo');
      window.term.writeln('bar');
      window.term.writeln('文');
    `);
        yield (0, TestUtils_1.pollFor)(ctx.page, `window.term.buffer.active.getLine(0).translateToString(true)`, 'foo');
        yield (0, TestUtils_1.pollFor)(ctx.page, `window.term.buffer.active.getLine(1).translateToString(true)`, 'bar');
        yield (0, TestUtils_1.pollFor)(ctx.page, `window.term.buffer.active.getLine(2).translateToString(true)`, '文');
    }));
    (0, test_1.test)('writeln with callback', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, TestUtils_1.openTerminal)(ctx);
        yield ctx.page.evaluate(`
      window.term.writeln('foo', () => { window.__x = '1'; });
      window.term.writeln('bar', () => { window.__x += '2'; });
      window.term.writeln('文', () => { window.__x += '3'; });
    `);
        yield (0, TestUtils_1.pollFor)(ctx.page, `window.term.buffer.active.getLine(0).translateToString(true)`, 'foo');
        yield (0, TestUtils_1.pollFor)(ctx.page, `window.term.buffer.active.getLine(1).translateToString(true)`, 'bar');
        yield (0, TestUtils_1.pollFor)(ctx.page, `window.term.buffer.active.getLine(2).translateToString(true)`, '文');
        yield (0, TestUtils_1.pollFor)(ctx.page, `window.__x`, '123');
    }));
    (0, test_1.test)('writeln - bytes (UTF8)', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, TestUtils_1.openTerminal)(ctx);
        yield ctx.page.evaluate(`
      window.term.writeln(new Uint8Array([102, 111, 111]));
      window.term.writeln(new Uint8Array([98, 97, 114]));
      window.term.writeln(new Uint8Array([230, 150, 135]));
    `);
        yield (0, TestUtils_1.pollFor)(ctx.page, `window.term.buffer.active.getLine(0).translateToString(true)`, 'foo');
        yield (0, TestUtils_1.pollFor)(ctx.page, `window.term.buffer.active.getLine(1).translateToString(true)`, 'bar');
        yield (0, TestUtils_1.pollFor)(ctx.page, `window.term.buffer.active.getLine(2).translateToString(true)`, '文');
    }));
    (0, test_1.test)('paste', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, TestUtils_1.openTerminal)(ctx);
        const calls = [];
        ctx.proxy.onData(e => calls.push(e));
        yield ctx.proxy.paste('foo');
        yield ctx.proxy.paste('\r\nfoo\nbar\r');
        yield ctx.proxy.write('\x1b[?2004h');
        yield ctx.proxy.paste('foo');
        yield ctx.page.evaluate(`window.term.options.ignoreBracketedPasteMode = true;`);
        yield ctx.proxy.paste('check_mode');
        (0, assert_1.deepStrictEqual)(calls, ['foo', '\rfoo\rbar\r', '\x1b[200~foo\x1b[201~', 'check_mode']);
    }));
    (0, test_1.test)('clear', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, TestUtils_1.openTerminal)(ctx, { rows: 5 });
        yield ctx.page.evaluate(`
      window.term.write('test0');
      window.parsed = 0;
      for (let i = 1; i < 10; i++) {
        window.term.write('\\n\\rtest' + i, () => window.parsed++);
      }
    `);
        yield (0, TestUtils_1.pollFor)(ctx.page, `window.parsed`, 9);
        yield ctx.page.evaluate(`window.term.clear()`);
        yield (0, TestUtils_1.pollFor)(ctx.page, `window.term.buffer.active.length`, 5);
        yield (0, TestUtils_1.pollFor)(ctx.page, `window.term.buffer.active.getLine(0).translateToString(true)`, 'test9');
        for (let i = 1; i < 5; i++) {
            yield (0, TestUtils_1.pollFor)(ctx.page, `window.term.buffer.active.getLine(${i}).translateToString(true)`, '');
        }
    }));
    test_1.test.describe('options', () => {
        (0, test_1.test)('getter', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, TestUtils_1.openTerminal)(ctx);
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.options.cols`), 80);
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.options.rows`), 24);
        }));
        (0, test_1.test)('setter', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, TestUtils_1.openTerminal)(ctx);
            try {
                yield ctx.page.evaluate('window.term.options.cols = 40');
                test_1.test.fail();
            }
            catch (_a) { }
            try {
                yield ctx.page.evaluate('window.term.options.rows = 20');
                test_1.test.fail();
            }
            catch (_b) { }
            yield ctx.page.evaluate('window.term.options.scrollback = 1');
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.options.scrollback`), 1);
            yield ctx.page.evaluate(`
        window.term.options = {
          fontSize: 30,
          fontFamily: 'Arial'
        };
      `);
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.options.fontSize`), 30);
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.options.fontFamily`), 'Arial');
        }));
        (0, test_1.test)('object.keys return the correct number of options', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, TestUtils_1.openTerminal)(ctx);
            (0, assert_1.notStrictEqual)(yield ctx.page.evaluate(`Object.keys(window.term.options).length`), 0);
        }));
    });
    test_1.test.describe('renderer', () => {
        (0, test_1.test)('foreground', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, TestUtils_1.openTerminal)(ctx);
            yield ctx.proxy.write('\x1b[30m0\x1b[31m1\x1b[32m2\x1b[33m3\x1b[34m4\x1b[35m5\x1b[36m6\x1b[37m7');
            yield (0, TestUtils_1.pollFor)(ctx.page, `document.querySelectorAll('.xterm-rows > :nth-child(1) > *').length`, 9);
            (0, assert_1.deepStrictEqual)(yield ctx.page.evaluate(`
        [
          document.querySelector('.xterm-rows > :nth-child(1) > :nth-child(1)').className,
          document.querySelector('.xterm-rows > :nth-child(1) > :nth-child(2)').className,
          document.querySelector('.xterm-rows > :nth-child(1) > :nth-child(3)').className,
          document.querySelector('.xterm-rows > :nth-child(1) > :nth-child(4)').className,
          document.querySelector('.xterm-rows > :nth-child(1) > :nth-child(5)').className,
          document.querySelector('.xterm-rows > :nth-child(1) > :nth-child(6)').className,
          document.querySelector('.xterm-rows > :nth-child(1) > :nth-child(7)').className
        ]
      `), [
                'xterm-fg-0',
                'xterm-fg-1',
                'xterm-fg-2',
                'xterm-fg-3',
                'xterm-fg-4',
                'xterm-fg-5',
                'xterm-fg-6'
            ]);
        }));
        (0, test_1.test)('background', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, TestUtils_1.openTerminal)(ctx);
            yield ctx.proxy.write('\x1b[40m0\x1b[41m1\x1b[42m2\x1b[43m3\x1b[44m4\x1b[45m5\x1b[46m6\x1b[47m7');
            yield (0, TestUtils_1.pollFor)(ctx.page, `document.querySelectorAll('.xterm-rows > :nth-child(1) > *').length`, 9);
            (0, assert_1.deepStrictEqual)(yield ctx.page.evaluate(`
        [
          document.querySelector('.xterm-rows > :nth-child(1) > :nth-child(1)').className,
          document.querySelector('.xterm-rows > :nth-child(1) > :nth-child(2)').className,
          document.querySelector('.xterm-rows > :nth-child(1) > :nth-child(3)').className,
          document.querySelector('.xterm-rows > :nth-child(1) > :nth-child(4)').className,
          document.querySelector('.xterm-rows > :nth-child(1) > :nth-child(5)').className,
          document.querySelector('.xterm-rows > :nth-child(1) > :nth-child(6)').className,
          document.querySelector('.xterm-rows > :nth-child(1) > :nth-child(7)').className
        ]
      `), [
                'xterm-bg-0',
                'xterm-bg-1',
                'xterm-bg-2',
                'xterm-bg-3',
                'xterm-bg-4',
                'xterm-bg-5',
                'xterm-bg-6'
            ]);
        }));
    });
    (0, test_1.test)('selection', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, TestUtils_1.openTerminal)(ctx, { rows: 5, cols: 5 });
        yield ctx.proxy.write(`\n\nfoo\n\n\rbar\n\n\rbaz`);
        (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.hasSelection()`), false);
        (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.getSelection()`), '');
        (0, assert_1.deepStrictEqual)(yield ctx.page.evaluate(`window.term.getSelectionPosition()`), undefined);
        yield ctx.page.evaluate(`window.term.selectAll()`);
        (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.hasSelection()`), true);
        if (process.platform === 'win32') {
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.getSelection()`), '\r\n\r\nfoo\r\n\r\nbar\r\n\r\nbaz');
        }
        else {
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.getSelection()`), '\n\nfoo\n\nbar\n\nbaz');
        }
        (0, assert_1.deepStrictEqual)(yield ctx.page.evaluate(`window.term.getSelectionPosition()`), { start: { x: 0, y: 0 }, end: { x: 5, y: 6 } });
        yield ctx.page.evaluate(`window.term.clearSelection()`);
        (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.hasSelection()`), false);
        (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.getSelection()`), '');
        (0, assert_1.deepStrictEqual)(yield ctx.page.evaluate(`window.term.getSelectionPosition()`), undefined);
        yield ctx.page.evaluate(`window.term.select(1, 2, 2)`);
        (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.hasSelection()`), true);
        (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.getSelection()`), 'oo');
        (0, assert_1.deepStrictEqual)(yield ctx.page.evaluate(`window.term.getSelectionPosition()`), { start: { x: 1, y: 2 }, end: { x: 3, y: 2 } });
    }));
    (0, test_1.test)('focus, blur', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, TestUtils_1.openTerminal)(ctx);
        (0, assert_1.strictEqual)(yield ctx.page.evaluate(`document.activeElement.className`), '');
        yield ctx.page.evaluate(`window.term.focus()`);
        (0, assert_1.strictEqual)(yield ctx.page.evaluate(`document.activeElement.className`), 'xterm-helper-textarea');
        yield ctx.page.evaluate(`window.term.blur()`);
        (0, assert_1.strictEqual)(yield ctx.page.evaluate(`document.activeElement.className`), '');
    }));
    test_1.test.describe('loadAddon', () => {
        (0, test_1.test)('constructor', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, TestUtils_1.openTerminal)(ctx, { cols: 5 });
            yield ctx.page.evaluate(`
        window.cols = 0;
        window.term.loadAddon({
          activate: (t) => window.cols = t.cols,
          dispose: () => {}
        });
      `);
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.cols`), 5);
        }));
        (0, test_1.test)('dispose (addon)', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, TestUtils_1.openTerminal)(ctx);
            yield ctx.page.evaluate(`
        window.disposeCalled = false
        window.addon = {
          activate: () => {},
          dispose: () => window.disposeCalled = true
        };
        window.term.loadAddon(window.addon);
      `);
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.disposeCalled`), false);
            yield ctx.page.evaluate(`window.addon.dispose()`);
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.disposeCalled`), true);
        }));
        (0, test_1.test)('dispose (terminal)', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, TestUtils_1.openTerminal)(ctx);
            yield ctx.page.evaluate(`
        window.disposeCalled = false
        window.term.loadAddon({
          activate: () => {},
          dispose: () => window.disposeCalled = true
        });
      `);
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.disposeCalled`), false);
            yield ctx.page.evaluate(`window.term.dispose()`);
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.disposeCalled`), true);
        }));
    });
    test_1.test.describe('Events', () => {
        (0, test_1.test)('onCursorMove', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, TestUtils_1.openTerminal)(ctx);
            yield ctx.page.evaluate(`
        window.callCount = 0;
        window.term.onCursorMove(e => window.callCount++);
        window.term.write('foo');
      `);
            yield (0, TestUtils_1.pollFor)(ctx.page, `window.callCount`, 1);
            yield ctx.page.evaluate(`window.term.write('bar')`);
            yield (0, TestUtils_1.pollFor)(ctx.page, `window.callCount`, 2);
        }));
        (0, test_1.test)('onData', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, TestUtils_1.openTerminal)(ctx);
            yield ctx.page.evaluate(`
        window.calls = [];
        window.term.onData(e => calls.push(e));
      `);
            yield ctx.page.type('.xterm-helper-textarea', 'foo');
            (0, assert_1.deepStrictEqual)(yield ctx.page.evaluate(`window.calls`), ['f', 'o', 'o']);
        }));
        (0, test_1.test)('onKey', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, TestUtils_1.openTerminal)(ctx);
            yield ctx.page.evaluate(`
        window.calls = [];
        window.term.onKey(e => calls.push(e.key));
      `);
            yield ctx.page.type('.xterm-helper-textarea', 'foo');
            (0, assert_1.deepStrictEqual)(yield ctx.page.evaluate(`window.calls`), ['f', 'o', 'o']);
        }));
        (0, test_1.test)('onLineFeed', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, TestUtils_1.openTerminal)(ctx);
            yield ctx.page.evaluate(`
        window.callCount = 0;
        window.term.onLineFeed(() => callCount++);
        window.term.writeln('foo');
      `);
            yield (0, TestUtils_1.pollFor)(ctx.page, `window.callCount`, 1);
            yield ctx.page.evaluate(`window.term.writeln('bar')`);
            yield (0, TestUtils_1.pollFor)(ctx.page, `window.callCount`, 2);
        }));
        (0, test_1.test)('onScroll', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, TestUtils_1.openTerminal)(ctx, { rows: 5 });
            yield ctx.page.evaluate(`
        window.calls = [];
        window.term.onScroll(e => window.calls.push(e));
        for (let i = 0; i < 4; i++) {
          window.term.writeln('foo');
        }
      `);
            yield (0, TestUtils_1.pollFor)(ctx.page, `window.calls`, []);
            yield ctx.page.evaluate(`window.term.writeln('bar')`);
            yield (0, TestUtils_1.pollFor)(ctx.page, `window.calls`, [1]);
            yield ctx.page.evaluate(`window.term.writeln('baz')`);
            yield (0, TestUtils_1.pollFor)(ctx.page, `window.calls`, [1, 2]);
        }));
        (0, test_1.test)('onSelectionChange', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, TestUtils_1.openTerminal)(ctx);
            yield ctx.page.evaluate(`
        window.callCount = 0;
        window.term.onSelectionChange(() => window.callCount++);
      `);
            yield (0, TestUtils_1.pollFor)(ctx.page, `window.callCount`, 0);
            yield ctx.page.evaluate(`window.term.selectAll()`);
            yield (0, TestUtils_1.pollFor)(ctx.page, `window.callCount`, 1);
            yield ctx.page.evaluate(`window.term.clearSelection()`);
            yield (0, TestUtils_1.pollFor)(ctx.page, `window.callCount`, 2);
        }));
        (0, test_1.test)('onRender', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, TestUtils_1.openTerminal)(ctx);
            yield (0, TestUtils_1.timeout)(20);
            yield ctx.page.evaluate(`
        window.calls = [];
        window.term.onRender(e => window.calls.push([e.start, e.end]));
      `);
            yield (0, TestUtils_1.pollFor)(ctx.page, `window.calls`, []);
            yield ctx.page.evaluate(`window.term.write('foo')`);
            yield (0, TestUtils_1.pollFor)(ctx.page, `window.calls`, [[0, 0]]);
            yield ctx.page.evaluate(`window.term.write('bar\\n\\nbaz')`);
            yield (0, TestUtils_1.pollFor)(ctx.page, `window.calls`, [[0, 0], [0, 2]]);
        }));
        (0, test_1.test)('onResize', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, TestUtils_1.openTerminal)(ctx);
            yield (0, TestUtils_1.timeout)(20);
            yield ctx.page.evaluate(`
        window.calls = [];
        window.term.onResize(e => window.calls.push([e.cols, e.rows]));
      `);
            yield (0, TestUtils_1.pollFor)(ctx.page, `window.calls`, []);
            yield ctx.page.evaluate(`window.term.resize(10, 5)`);
            yield (0, TestUtils_1.pollFor)(ctx.page, `window.calls`, [[10, 5]]);
            yield ctx.page.evaluate(`window.term.resize(20, 15)`);
            yield (0, TestUtils_1.pollFor)(ctx.page, `window.calls`, [[10, 5], [20, 15]]);
        }));
        (0, test_1.test)('onTitleChange', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, TestUtils_1.openTerminal)(ctx);
            yield ctx.page.evaluate(`
        window.calls = [];
        window.term.onTitleChange(e => window.calls.push(e));
      `);
            yield (0, TestUtils_1.pollFor)(ctx.page, `window.calls`, []);
            yield ctx.page.evaluate(`window.term.write('\x1b]2;foo\x9c')`);
            yield (0, TestUtils_1.pollFor)(ctx.page, `window.calls`, ['foo']);
        }));
        (0, test_1.test)('onBell', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, TestUtils_1.openTerminal)(ctx);
            yield ctx.page.evaluate(`
        window.calls = [];
        window.term.onBell(() => window.calls.push(true));
      `);
            yield (0, TestUtils_1.pollFor)(ctx.page, `window.calls`, []);
            yield ctx.page.evaluate(`window.term.write('\x07')`);
            yield (0, TestUtils_1.pollFor)(ctx.page, `window.calls`, [true]);
        }));
    });
    test_1.test.describe('buffer', () => {
        (0, test_1.test)('cursorX, cursorY', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, TestUtils_1.openTerminal)(ctx, { rows: 5, cols: 5 });
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.active.cursorX`), 0);
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.active.cursorY`), 0);
            yield ctx.proxy.write('foo');
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.active.cursorX`), 3);
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.active.cursorY`), 0);
            yield ctx.proxy.write('\n');
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.active.cursorX`), 3);
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.active.cursorY`), 1);
            yield ctx.proxy.write('\r');
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.active.cursorX`), 0);
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.active.cursorY`), 1);
            yield ctx.proxy.write('abcde');
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.active.cursorX`), 5);
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.active.cursorY`), 1);
            yield ctx.proxy.write('\n\r\n\n\n\n\n');
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.active.cursorX`), 0);
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.active.cursorY`), 4);
        }));
        (0, test_1.test)('viewportY', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, TestUtils_1.openTerminal)(ctx, { rows: 5 });
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.active.viewportY`), 0);
            yield ctx.proxy.write('\n\n\n\n');
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.active.viewportY`), 0);
            yield ctx.proxy.write('\n');
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.active.viewportY`), 1);
            yield ctx.proxy.write('\n\n\n\n');
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.active.viewportY`), 5);
            yield ctx.page.evaluate(`window.term.scrollLines(-1)`);
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.active.viewportY`), 4);
            yield ctx.page.evaluate(`window.term.scrollToTop()`);
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.active.viewportY`), 0);
        }));
        (0, test_1.test)('baseY', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, TestUtils_1.openTerminal)(ctx, { rows: 5 });
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.active.baseY`), 0);
            yield ctx.proxy.write('\n\n\n\n');
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.active.baseY`), 0);
            yield ctx.proxy.write('\n');
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.active.baseY`), 1);
            yield ctx.proxy.write('\n\n\n\n');
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.active.baseY`), 5);
            yield ctx.page.evaluate(`window.term.scrollLines(-1)`);
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.active.baseY`), 5);
            yield ctx.page.evaluate(`window.term.scrollToTop()`);
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.active.baseY`), 5);
        }));
        (0, test_1.test)('length', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, TestUtils_1.openTerminal)(ctx, { rows: 5 });
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.active.length`), 5);
            yield ctx.proxy.write('\n\n\n\n');
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.active.length`), 5);
            yield ctx.proxy.write('\n');
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.active.length`), 6);
            yield ctx.proxy.write('\n\n\n\n');
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.active.length`), 10);
        }));
        test_1.test.describe('getLine', () => {
            (0, test_1.test)('invalid index', () => __awaiter(void 0, void 0, void 0, function* () {
                yield (0, TestUtils_1.openTerminal)(ctx, { rows: 5 });
                (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.active.getLine(-1)`), undefined);
                (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.active.getLine(5)`), undefined);
            }));
            (0, test_1.test)('isWrapped', () => __awaiter(void 0, void 0, void 0, function* () {
                yield (0, TestUtils_1.openTerminal)(ctx, { cols: 5 });
                (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.active.getLine(0).isWrapped`), false);
                (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.active.getLine(1).isWrapped`), false);
                yield ctx.proxy.write('abcde');
                (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.active.getLine(0).isWrapped`), false);
                (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.active.getLine(1).isWrapped`), false);
                yield ctx.proxy.write('f');
                (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.active.getLine(0).isWrapped`), false);
                (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.active.getLine(1).isWrapped`), true);
            }));
            (0, test_1.test)('translateToString', () => __awaiter(void 0, void 0, void 0, function* () {
                yield (0, TestUtils_1.openTerminal)(ctx, { cols: 5 });
                (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.active.getLine(0).translateToString()`), '     ');
                (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.active.getLine(0).translateToString(true)`), '');
                yield ctx.proxy.write('foo');
                (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.active.getLine(0).translateToString()`), 'foo  ');
                (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.active.getLine(0).translateToString(true)`), 'foo');
                yield ctx.proxy.write('bar');
                (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.active.getLine(0).translateToString()`), 'fooba');
                (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.active.getLine(0).translateToString(true)`), 'fooba');
                (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.active.getLine(1).translateToString(true)`), 'r');
                (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.active.getLine(0).translateToString(false, 1)`), 'ooba');
                (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.active.getLine(0).translateToString(false, 1, 3)`), 'oo');
            }));
            (0, test_1.test)('getCell', () => __awaiter(void 0, void 0, void 0, function* () {
                yield (0, TestUtils_1.openTerminal)(ctx, { cols: 5 });
                (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.active.getLine(0).getCell(-1)`), undefined);
                (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.active.getLine(0).getCell(5)`), undefined);
                (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.active.getLine(0).getCell(0).getChars()`), '');
                (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.active.getLine(0).getCell(0).getWidth()`), 1);
                yield ctx.proxy.write('a文');
                (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.active.getLine(0).getCell(0).getChars()`), 'a');
                (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.active.getLine(0).getCell(0).getWidth()`), 1);
                (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.active.getLine(0).getCell(1).getChars()`), '文');
                (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.active.getLine(0).getCell(1).getWidth()`), 2);
                (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.active.getLine(0).getCell(2).getChars()`), '');
                (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.active.getLine(0).getCell(2).getWidth()`), 0);
            }));
            (0, test_1.test)('clearMarkers', () => __awaiter(void 0, void 0, void 0, function* () {
                yield (0, TestUtils_1.openTerminal)(ctx, { cols: 5 });
                yield ctx.page.evaluate(`
          window.disposeStack = [];
          `);
                yield ctx.proxy.write('\n\n\n\n');
                yield ctx.proxy.write('\n\n\n\n');
                yield ctx.proxy.write('\n\n\n\n');
                yield ctx.proxy.write('\n\n\n\n');
                yield ctx.page.evaluate(`window.term.registerMarker(1)`);
                yield ctx.page.evaluate(`window.term.registerMarker(2)`);
                yield ctx.page.evaluate(`window.term.scrollLines(10)`);
                yield ctx.page.evaluate(`window.term.registerMarker(3)`);
                yield ctx.page.evaluate(`window.term.registerMarker(4)`);
                yield ctx.page.evaluate(`
          for (let i = 0; i < window.term.markers.length; ++i) {
              const marker = window.term.markers[i];
              marker.onDispose(() => window.disposeStack.push(marker));
          }`);
                yield ctx.page.evaluate(`window.term.clear()`);
                (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.disposeStack.length`), 4);
            }));
        });
        (0, test_1.test)('active, normal, alternate', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, TestUtils_1.openTerminal)(ctx, { cols: 5 });
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.active.type`), 'normal');
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.normal.type`), 'normal');
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.alternate.type`), 'alternate');
            yield ctx.proxy.write('norm ');
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.active.getLine(0).translateToString()`), 'norm ');
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.normal.getLine(0).translateToString()`), 'norm ');
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.alternate.getLine(0)`), undefined);
            yield ctx.proxy.write('\x1b[?47h\r');
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.active.type`), 'alternate');
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.normal.type`), 'normal');
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.alternate.type`), 'alternate');
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.active.getLine(0).translateToString()`), '     ');
            yield ctx.proxy.write('alt  ');
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.active.getLine(0).translateToString()`), 'alt  ');
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.normal.getLine(0).translateToString()`), 'norm ');
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.alternate.getLine(0).translateToString()`), 'alt  ');
            yield ctx.proxy.write('\x1b[?47l\r');
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.active.type`), 'normal');
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.normal.type`), 'normal');
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.alternate.type`), 'alternate');
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.active.getLine(0).translateToString()`), 'norm ');
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.normal.getLine(0).translateToString()`), 'norm ');
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.buffer.alternate.getLine(0)`), undefined);
        }));
    });
    test_1.test.describe('modes', () => {
        test_1.test.beforeEach(() => (0, TestUtils_1.openTerminal)(ctx));
        (0, test_1.test)('defaults', () => __awaiter(void 0, void 0, void 0, function* () {
            (0, assert_1.deepStrictEqual)(yield ctx.page.evaluate(`window.term.modes`), {
                applicationCursorKeysMode: false,
                applicationKeypadMode: false,
                bracketedPasteMode: false,
                insertMode: false,
                mouseTrackingMode: 'none',
                originMode: false,
                reverseWraparoundMode: false,
                sendFocusMode: false,
                wraparoundMode: true
            });
        }));
        (0, test_1.test)('applicationCursorKeysMode', () => __awaiter(void 0, void 0, void 0, function* () {
            yield ctx.proxy.write('\x1b[?1h');
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.modes.applicationCursorKeysMode`), true);
            yield ctx.proxy.write('\x1b[?1l');
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.modes.applicationCursorKeysMode`), false);
        }));
        (0, test_1.test)('applicationKeypadMode', () => __awaiter(void 0, void 0, void 0, function* () {
            yield ctx.proxy.write('\x1b[?66h');
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.modes.applicationKeypadMode`), true);
            yield ctx.proxy.write('\x1b[?66l');
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.modes.applicationKeypadMode`), false);
        }));
        (0, test_1.test)('bracketedPasteMode', () => __awaiter(void 0, void 0, void 0, function* () {
            yield ctx.proxy.write('\x1b[?2004h');
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.modes.bracketedPasteMode`), true);
            yield ctx.proxy.write('\x1b[?2004l');
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.modes.bracketedPasteMode`), false);
        }));
        (0, test_1.test)('insertMode', () => __awaiter(void 0, void 0, void 0, function* () {
            yield ctx.proxy.write('\x1b[4h');
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.modes.insertMode`), true);
            yield ctx.proxy.write('\x1b[4l');
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.modes.insertMode`), false);
        }));
        (0, test_1.test)('mouseTrackingMode', () => __awaiter(void 0, void 0, void 0, function* () {
            yield ctx.proxy.write('\x1b[?9h');
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.modes.mouseTrackingMode`), 'x10');
            yield ctx.proxy.write('\x1b[?9l');
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.modes.mouseTrackingMode`), 'none');
            yield ctx.proxy.write('\x1b[?1000h');
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.modes.mouseTrackingMode`), 'vt200');
            yield ctx.proxy.write('\x1b[?1000l');
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.modes.mouseTrackingMode`), 'none');
            yield ctx.proxy.write('\x1b[?1002h');
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.modes.mouseTrackingMode`), 'drag');
            yield ctx.proxy.write('\x1b[?1002l');
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.modes.mouseTrackingMode`), 'none');
            yield ctx.proxy.write('\x1b[?1003h');
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.modes.mouseTrackingMode`), 'any');
            yield ctx.proxy.write('\x1b[?1003l');
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.modes.mouseTrackingMode`), 'none');
        }));
        (0, test_1.test)('originMode', () => __awaiter(void 0, void 0, void 0, function* () {
            yield ctx.proxy.write('\x1b[?6h');
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.modes.originMode`), true);
            yield ctx.proxy.write('\x1b[?6l');
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.modes.originMode`), false);
        }));
        (0, test_1.test)('reverseWraparoundMode', () => __awaiter(void 0, void 0, void 0, function* () {
            yield ctx.proxy.write('\x1b[?45h');
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.modes.reverseWraparoundMode`), true);
            yield ctx.proxy.write('\x1b[?45l');
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.modes.reverseWraparoundMode`), false);
        }));
        (0, test_1.test)('sendFocusMode', () => __awaiter(void 0, void 0, void 0, function* () {
            yield ctx.proxy.write('\x1b[?1004h');
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.modes.sendFocusMode`), true);
            yield ctx.proxy.write('\x1b[?1004l');
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.modes.sendFocusMode`), false);
        }));
        (0, test_1.test)('wraparoundMode', () => __awaiter(void 0, void 0, void 0, function* () {
            yield ctx.proxy.write('\x1b[?7h');
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.modes.wraparoundMode`), true);
            yield ctx.proxy.write('\x1b[?7l');
            (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term.modes.wraparoundMode`), false);
        }));
    });
    (0, test_1.test)('dispose', () => __awaiter(void 0, void 0, void 0, function* () {
        yield ctx.page.evaluate(`
      if ('term' in window) {
        try {
          window.term.dispose();
        } catch {}
      }
      window.term = new Terminal();
      window.term.dispose();
    `);
        (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term._core._isDisposed`), true);
    }));
    (0, test_1.test)('dispose (opened)', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, TestUtils_1.openTerminal)(ctx);
        yield ctx.page.evaluate(`
      if ('term' in window) {
        try {
          window.term.dispose();
        } catch {}
      }
    `);
        (0, assert_1.strictEqual)(yield ctx.page.evaluate(`window.term._core._isDisposed`), true);
    }));
    (0, test_1.test)('render when visible after hidden', () => __awaiter(void 0, void 0, void 0, function* () {
        yield (0, TestUtils_1.openTerminal)(ctx);
        yield ctx.page.evaluate(`
      if ('term' in window) {
        try {
          window.term.dispose();
        } catch {}
      }
    `);
        yield ctx.page.evaluate(`document.querySelector('#terminal-container').style.display='none'`);
        yield ctx.page.evaluate(`window.term = new Terminal()`);
        yield ctx.page.evaluate(`window.term.open(document.querySelector('#terminal-container'))`);
        yield ctx.page.evaluate(`document.querySelector('#terminal-container').style.display=''`);
        yield (0, TestUtils_1.pollFor)(ctx.page, `window.term._core._renderService.dimensions.css.cell.width > 0`, true);
    }));
    test_1.test.describe('registerDecoration', () => {
        test_1.test.describe('bufferDecorations', () => {
            (0, test_1.test)('should register decorations and render them when terminal open is called', () => __awaiter(void 0, void 0, void 0, function* () {
                yield (0, TestUtils_1.openTerminal)(ctx);
                yield ctx.page.evaluate(`window.marker1 = window.term.registerMarker(1)`);
                yield ctx.page.evaluate(`window.marker2 = window.term.registerMarker(2)`);
                yield ctx.page.evaluate(`window.term.registerDecoration({ marker: window.marker1 })`);
                yield ctx.page.evaluate(`window.term.registerDecoration({ marker: window.marker2 })`);
                yield (0, TestUtils_1.pollFor)(ctx.page, `document.querySelectorAll('.xterm-screen .xterm-decoration').length`, 2);
            }));
            (0, test_1.test)('should return undefined when the marker has already been disposed of', () => __awaiter(void 0, void 0, void 0, function* () {
                yield (0, TestUtils_1.openTerminal)(ctx);
                yield ctx.page.evaluate(`window.marker = window.term.registerMarker(1)`);
                yield ctx.page.evaluate(`window.marker.dispose()`);
                yield (0, TestUtils_1.pollFor)(ctx.page, `window.decoration = window.term.registerDecoration({ marker: window.marker });`, undefined);
            }));
            (0, test_1.test)('should throw when a negative x offset is provided', () => __awaiter(void 0, void 0, void 0, function* () {
                yield (0, TestUtils_1.openTerminal)(ctx);
                yield ctx.page.evaluate(`window.marker = window.term.registerMarker(1)`);
                yield ctx.page.evaluate(`
        try {
          window.decoration = window.term.registerDecoration({ marker: window.marker, x: -2 });
        } catch (e) {
          window.throwMessage = e.message;
        }
      `);
                yield (0, TestUtils_1.pollFor)(ctx.page, 'window.throwMessage', 'This API only accepts positive integers');
            }));
        });
        test_1.test.describe('overviewRulerDecorations', () => {
            (0, test_1.test)('should not add an overview ruler when width is not set', () => __awaiter(void 0, void 0, void 0, function* () {
                yield (0, TestUtils_1.openTerminal)(ctx);
                yield ctx.page.evaluate(`window.marker1 = window.term.registerMarker(1)`);
                yield ctx.page.evaluate(`window.marker2 = window.term.registerMarker(2)`);
                yield ctx.page.evaluate(`window.term.registerDecoration({ marker: window.marker1, overviewRulerOptions: { color: 'red', position: 'full' } })`);
                yield ctx.page.evaluate(`window.term.registerDecoration({ marker: window.marker2, overviewRulerOptions: { color: 'blue', position: 'full' } })`);
                yield (0, TestUtils_1.pollFor)(ctx.page, `document.querySelectorAll('.xterm-decoration-overview-ruler').length`, 0);
            }));
            (0, test_1.test)('should add an overview ruler when width is set', () => __awaiter(void 0, void 0, void 0, function* () {
                yield (0, TestUtils_1.openTerminal)(ctx, { overviewRulerWidth: 15 });
                yield ctx.page.evaluate(`window.marker1 = window.term.registerMarker(1)`);
                yield ctx.page.evaluate(`window.marker2 = window.term.registerMarker(2)`);
                yield ctx.page.evaluate(`window.term.registerDecoration({ marker: window.marker1, overviewRulerOptions: { color: 'red', position: 'full' } })`);
                yield ctx.page.evaluate(`window.term.registerDecoration({ marker: window.marker2, overviewRulerOptions: { color: 'blue', position: 'full' } })`);
                yield (0, TestUtils_1.pollFor)(ctx.page, `document.querySelectorAll('.xterm-decoration-overview-ruler').length`, 1);
            }));
        });
    });
    test_1.test.describe('registerLinkProvider', () => {
        (0, test_1.test)('should fire provideLinks when hovering cells', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, TestUtils_1.openTerminal)(ctx);
            yield ctx.proxy.focus();
            yield ctx.page.evaluate(`
        window.calls = [];
        window.disposable = window.term.registerLinkProvider({
          provideLinks: (position, cb) => {
            calls.push(position);
            cb(undefined);
          }
        });
      `);
            const dims = yield getDimensions();
            yield moveMouseCell(dims, 1, 1);
            yield moveMouseCell(dims, 2, 2);
            yield moveMouseCell(dims, 10, 4);
            yield (0, TestUtils_1.pollFor)(ctx.page, `window.calls`, [1, 2, 4]);
            yield ctx.page.evaluate(`window.disposable.dispose()`);
        }));
        (0, test_1.test)('should fire hover and leave events on the link', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, TestUtils_1.openTerminal)(ctx);
            yield ctx.page.evaluate('window.term.focus()');
            yield ctx.proxy.write('foo bar baz');
            yield (0, TestUtils_1.pollFor)(ctx.page, `document.querySelector('.xterm-rows').textContent`, 'foo bar baz ');
            yield ctx.page.evaluate(`
        window.calls = [];
        window.disposable = window.term.registerLinkProvider({
          provideLinks: (position, cb) => {
            window.calls.push('provide ' + position);
            if (position === 1) {
              window.calls.push('match');
              cb([{
                range: { start: { x: 5, y: 1 }, end: { x: 7, y: 1 } },
                text: 'bar',
                activate: () => window.calls.push('activate'),
                hover: () => window.calls.push('hover'),
                leave: () => window.calls.push('leave')
              }]);
            }
          }
        });
      `);
            const dims = yield getDimensions();
            yield moveMouseCell(dims, 5, 1);
            yield (0, TestUtils_1.timeout)(100);
            yield moveMouseCell(dims, 4, 1);
            yield (0, TestUtils_1.pollFor)(ctx.page, `window.calls`, ['provide 1', 'match', 'hover', 'leave']);
            yield moveMouseCell(dims, 7, 1);
            yield (0, TestUtils_1.timeout)(100);
            yield moveMouseCell(dims, 8, 1);
            yield (0, TestUtils_1.pollFor)(ctx.page, `window.calls`, ['provide 1', 'match', 'hover', 'leave', 'hover', 'leave']);
            yield ctx.page.evaluate(`window.disposable.dispose()`);
        }));
        (0, test_1.test)('should work fine when hover and leave callbacks are not provided', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, TestUtils_1.openTerminal)(ctx);
            yield ctx.page.evaluate('window.term.focus()');
            yield ctx.proxy.write('foo bar baz');
            yield (0, TestUtils_1.pollFor)(ctx.page, `document.querySelector('.xterm-rows').textContent`, 'foo bar baz ');
            yield ctx.page.evaluate(`
        window.calls = [];
        window.disposable = window.term.registerLinkProvider({
          provideLinks: (position, cb) => {
            window.calls.push('provide ' + position);
            if (position === 1) {
              window.calls.push('match 1');
              cb([{
                range: { start: { x: 5, y: 1 }, end: { x: 7, y: 1 } },
                text: 'bar',
                activate: () => window.calls.push('activate')
              }]);
            } else if (position === 2) {
              window.calls.push('match 2');
              cb([{
                range: { start: { x: 5, y: 2 }, end: { x: 7, y: 2 } },
                text: 'bar',
                activate: () => window.calls.push('activate')
              }]);
            }
          }
        });
      `);
            const dims = yield getDimensions();
            yield moveMouseCell(dims, 5, 1);
            yield (0, TestUtils_1.pollFor)(ctx.page, `window.calls`, ['provide 1', 'match 1']);
            yield moveMouseCell(dims, 4, 2);
            yield (0, TestUtils_1.pollFor)(ctx.page, `window.calls`, ['provide 1', 'match 1', 'provide 2', 'match 2']);
            yield moveMouseCell(dims, 7, 1);
            yield (0, TestUtils_1.pollFor)(ctx.page, `window.calls`, ['provide 1', 'match 1', 'provide 2', 'match 2', 'provide 1', 'match 1']);
            yield moveMouseCell(dims, 6, 2);
            yield (0, TestUtils_1.pollFor)(ctx.page, `window.calls`, ['provide 1', 'match 1', 'provide 2', 'match 2', 'provide 1', 'match 1', 'provide 2', 'match 2']);
            yield ctx.page.evaluate(`window.disposable.dispose()`);
        }));
        (0, test_1.test)('should fire activate events when clicking the link', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, TestUtils_1.openTerminal)(ctx);
            yield ctx.page.evaluate('window.term.focus()');
            yield ctx.proxy.write('a b c');
            yield (0, TestUtils_1.pollFor)(ctx.page, `document.querySelector('.xterm-rows').textContent`, 'a b c ');
            yield ctx.page.evaluate(`
        window.calls = [];
        window.disposable = window.term.registerLinkProvider({
          provideLinks: (y, cb) => {
            window.calls.push('provide ' + y);
            cb([{
              range: { start: { x: 1, y }, end: { x: 80, y } },
              text: window.term.buffer.active.getLine(y - 1).translateToString(),
              activate: (_, text) => window.calls.push('activate ' + y),
              hover: () => window.calls.push('hover ' + y),
              leave: () => window.calls.push('leave ' + y)
            }]);
          }
        });
      `);
            const dims = yield getDimensions();
            yield moveMouseCell(dims, 3, 1);
            yield (0, TestUtils_1.pollFor)(ctx.page, `window.calls`, ['provide 1', 'hover 1']);
            yield ctx.page.mouse.down();
            yield ctx.page.mouse.up();
            yield (0, TestUtils_1.pollFor)(ctx.page, `window.calls`, ['provide 1', 'hover 1', 'activate 1']);
            yield moveMouseCell(dims, 1, 2);
            yield (0, TestUtils_1.pollFor)(ctx.page, `window.calls`, ['provide 1', 'hover 1', 'activate 1', 'leave 1', 'provide 2', 'hover 2']);
            yield ctx.page.mouse.down();
            yield ctx.page.mouse.up();
            yield (0, TestUtils_1.pollFor)(ctx.page, `window.calls`, ['provide 1', 'hover 1', 'activate 1', 'leave 1', 'provide 2', 'hover 2', 'activate 2']);
            yield moveMouseCell(dims, 5, 1);
            yield (0, TestUtils_1.pollFor)(ctx.page, `window.calls`, ['provide 1', 'hover 1', 'activate 1', 'leave 1', 'provide 2', 'hover 2', 'activate 2', 'leave 2', 'provide 1', 'hover 1']);
            yield ctx.page.mouse.down();
            yield ctx.page.mouse.up();
            yield (0, TestUtils_1.pollFor)(ctx.page, `window.calls`, ['provide 1', 'hover 1', 'activate 1', 'leave 1', 'provide 2', 'hover 2', 'activate 2', 'leave 2', 'provide 1', 'hover 1', 'activate 1']);
            yield ctx.page.evaluate(`window.disposable.dispose()`);
        }));
        (0, test_1.test)('should work when multiple links are provided on the same line', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, TestUtils_1.openTerminal)(ctx);
            yield ctx.page.evaluate('window.term.focus()');
            yield ctx.proxy.write('foo bar baz');
            yield (0, TestUtils_1.pollFor)(ctx.page, `document.querySelector('.xterm-rows').textContent`, 'foo bar baz ');
            yield ctx.page.evaluate(`
        window.calls = [];
        window.disposable = window.term.registerLinkProvider({
          provideLinks: (position, cb) => {
            window.calls.push('provide ' + position);
            if (position === 1) {
              cb([{
                range: { start: { x: 1, y: 1 }, end: { x: 3, y: 1 } },
                text: '',
                activate: () => window.calls.push('activate'),
                hover: () => window.calls.push('hover 1-3'),
                leave: () => window.calls.push('leave 1-3')
              }, {
                range: { start: { x: 5, y: 1 }, end: { x: 7, y: 1 } },
                text: '',
                activate: () => window.calls.push('activate'),
                hover: () => window.calls.push('hover 5-7'),
                leave: () => window.calls.push('leave 5-7')
              }, {
                range: { start: { x: 9, y: 1 }, end: { x: 11, y: 1 } },
                text: '',
                activate: () => window.calls.push('activate'),
                hover: () => window.calls.push('hover 9-11'),
                leave: () => window.calls.push('leave 9-11')
              }]);
            }
          }
        });
      `);
            const dims = yield getDimensions();
            yield moveMouseCell(dims, 2, 1);
            yield (0, TestUtils_1.pollFor)(ctx.page, `window.calls`, ['provide 1', 'hover 1-3']);
            yield moveMouseCell(dims, 6, 1);
            yield (0, TestUtils_1.pollFor)(ctx.page, `window.calls`, ['provide 1', 'hover 1-3', 'leave 1-3', 'hover 5-7']);
            yield moveMouseCell(dims, 6, 2);
            yield (0, TestUtils_1.pollFor)(ctx.page, `window.calls`, ['provide 1', 'hover 1-3', 'leave 1-3', 'hover 5-7', 'leave 5-7', 'provide 2']);
            yield moveMouseCell(dims, 10, 1);
            yield (0, TestUtils_1.pollFor)(ctx.page, `window.calls`, ['provide 1', 'hover 1-3', 'leave 1-3', 'hover 5-7', 'leave 5-7', 'provide 2', 'provide 1', 'hover 9-11']);
            yield ctx.page.evaluate(`window.disposable.dispose()`);
        }));
        (0, test_1.test)('should dispose links when hovering away', () => __awaiter(void 0, void 0, void 0, function* () {
            yield (0, TestUtils_1.openTerminal)(ctx);
            yield ctx.page.evaluate('window.term.focus()');
            yield ctx.proxy.write('foo bar baz');
            yield (0, TestUtils_1.pollFor)(ctx.page, `document.querySelector('.xterm-rows').textContent`, 'foo bar baz ');
            yield ctx.page.evaluate(`
        window.calls = [];
        window.disposable = window.term.registerLinkProvider({
          provideLinks: (position, cb) => {
            window.calls.push('provide ' + position);
            if (position === 1) {
              cb([{
                range: { start: { x: 1, y: 1 }, end: { x: 3, y: 1 } },
                text: '',
                activate: () => window.calls.push('activate'),
                dispose: () => window.calls.push('dispose 1-3'),
                hover: () => window.calls.push('hover 1-3'),
                leave: () => window.calls.push('leave 1-3')
              }, {
                range: { start: { x: 5, y: 1 }, end: { x: 7, y: 1 } },
                text: '',
                activate: () => window.calls.push('activate'),
                dispose: () => window.calls.push('dispose 5-7'),
                hover: () => window.calls.push('hover 5-7'),
                leave: () => window.calls.push('leave 5-7')
              }, {
                range: { start: { x: 9, y: 1 }, end: { x: 11, y: 1 } },
                text: '',
                activate: () => window.calls.push('activate'),
                dispose: () => window.calls.push('dispose 9-11'),
                hover: () => window.calls.push('hover 9-11'),
                leave: () => window.calls.push('leave 9-11')
              }]);
            }
          }
        });
      `);
            const dims = yield getDimensions();
            yield moveMouseCell(dims, 2, 1);
            yield (0, TestUtils_1.pollFor)(ctx.page, `window.calls`, ['provide 1', 'hover 1-3']);
            yield moveMouseCell(dims, 6, 1);
            yield (0, TestUtils_1.pollFor)(ctx.page, `window.calls`, ['provide 1', 'hover 1-3', 'leave 1-3', 'hover 5-7']);
            yield moveMouseCell(dims, 6, 2);
            yield (0, TestUtils_1.pollFor)(ctx.page, `window.calls`, ['provide 1', 'hover 1-3', 'leave 1-3', 'hover 5-7', 'leave 5-7', 'dispose 1-3', 'dispose 5-7', 'dispose 9-11', 'provide 2']);
            yield moveMouseCell(dims, 10, 1);
            yield (0, TestUtils_1.pollFor)(ctx.page, `window.calls`, ['provide 1', 'hover 1-3', 'leave 1-3', 'hover 5-7', 'leave 5-7', 'dispose 1-3', 'dispose 5-7', 'dispose 9-11', 'provide 2', 'provide 1', 'hover 9-11']);
            yield moveMouseCell(dims, 10, 2);
            yield (0, TestUtils_1.pollFor)(ctx.page, `window.calls`, ['provide 1', 'hover 1-3', 'leave 1-3', 'hover 5-7', 'leave 5-7', 'dispose 1-3', 'dispose 5-7', 'dispose 9-11', 'provide 2', 'provide 1', 'hover 9-11', 'leave 9-11', 'dispose 1-3', 'dispose 5-7', 'dispose 9-11', 'provide 2']);
            yield ctx.page.evaluate(`window.disposable.dispose()`);
        }));
    });
});
function getDimensions() {
    return __awaiter(this, void 0, void 0, function* () {
        return yield ctx.page.evaluate(`
    (function() {
      const rect = document.querySelector('.xterm-rows').getBoundingClientRect();
      return {
        top: rect.top,
        left: rect.left,
        renderDimensions: window.term._core._renderService.dimensions
      };
    })();
  `);
    });
}
function getCellCoordinates(dimensions, col, row) {
    return __awaiter(this, void 0, void 0, function* () {
        return {
            x: dimensions.left + dimensions.renderDimensions.device.cell.width * (col - 0.5),
            y: dimensions.top + dimensions.renderDimensions.device.cell.height * (row - 0.5)
        };
    });
}
function moveMouseCell(dimensions, col, row) {
    return __awaiter(this, void 0, void 0, function* () {
        const coords = yield getCellCoordinates(dimensions, col, row);
        yield ctx.page.mouse.move(coords.x, coords.y);
    });
}
//# sourceMappingURL=Terminal.test.js.map