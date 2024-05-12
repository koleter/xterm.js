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
test_1.test.describe('InputHandler Integration Tests', () => {
    test_1.test.describe('CSI', () => {
        test_1.test.beforeEach(() => __awaiter(void 0, void 0, void 0, function* () { return yield ctx.proxy.reset(); }));
        (0, test_1.test)('CSI Ps @ - ICH: Insert Ps (Blank) Character(s) (default = 1)', () => __awaiter(void 0, void 0, void 0, function* () {
            yield ctx.page.evaluate(`
        // Default
        window.term.write('foo\\x1b[3D\\x1b[@\\n\\r')
        // Explicit
        window.term.write('bar\\x1b[3D\\x1b[4@')
      `);
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getLinesAsArray(2), [' foo', '    bar']);
        }));
        test_1.test.skip('CSI Ps SP @ - SL: Shift left Ps columns(s) (default = 1), ECMA-48', () => __awaiter(void 0, void 0, void 0, function* () {
        }));
        (0, test_1.test)('CSI Ps A - CUU: Cursor Up Ps Times (default = 1)', () => __awaiter(void 0, void 0, void 0, function* () {
            yield ctx.page.evaluate(`
        // Default
        window.term.write('\\n\\n\\n\\n\x1b[Aa')
        // Explicit
        window.term.write('\x1b[2Ab')
      `);
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getLinesAsArray(4), ['', ' b', '', 'a']);
        }));
        (0, test_1.test)('CSI Ps B - CUD: Cursor Down Ps Times (default = 1)', () => __awaiter(void 0, void 0, void 0, function* () {
            yield ctx.page.evaluate(`
        // Default
        window.term.write('\x1b[Ba')
        // Explicit
        window.term.write('\x1b[2Bb')
      `);
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getLinesAsArray(4), ['', 'a', '', ' b']);
        }));
        (0, test_1.test)('CSI Ps C - CUF: Cursor Forward Ps Times (default = 1)', () => __awaiter(void 0, void 0, void 0, function* () {
            yield ctx.page.evaluate(`
        // Default
        window.term.write('\x1b[Ca')
        // Explicit
        window.term.write('\x1b[2Cb')
      `);
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getLinesAsArray(1), [' a  b']);
        }));
        (0, test_1.test)('CSI Ps D - CUB: Cursor Backward Ps Times (default = 1)', () => __awaiter(void 0, void 0, void 0, function* () {
            yield ctx.page.evaluate(`
        // Default
        window.term.write('foo\x1b[Da')
        // Explicit
        window.term.write('\x1b[2Db')
      `);
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getLinesAsArray(1), ['fba']);
        }));
        (0, test_1.test)('CSI Ps E - CNL: Cursor Next Line Ps Times (default = 1)', () => __awaiter(void 0, void 0, void 0, function* () {
            yield ctx.page.evaluate(`
        // Default
        window.term.write('\x1b[Ea')
        // Explicit
        window.term.write('\x1b[2Eb')
      `);
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getLinesAsArray(4), ['', 'a', '', 'b']);
        }));
        (0, test_1.test)('CSI Ps F - CPL: Cursor Preceding Line Ps Times (default = 1)', () => __awaiter(void 0, void 0, void 0, function* () {
            yield ctx.page.evaluate(`
        // Default
        window.term.write('\\n\\n\\n\\n\x1b[Fa')
        // Explicit
        window.term.write('\x1b[2Fb')
      `);
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getLinesAsArray(5), ['', 'b', '', 'a', '']);
        }));
        (0, test_1.test)('CSI Ps G - CHA: Cursor Character Absolute [column] (default = [row,1])', () => __awaiter(void 0, void 0, void 0, function* () {
            yield ctx.page.evaluate(`
        // Default
        window.term.write('foo\x1b[Ga')
        // Explicit
        window.term.write('\x1b[10Gb')
      `);
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getLinesAsArray(1), ['aoo      b']);
        }));
        (0, test_1.test)('CSI Ps ; Ps H - CUP: Cursor Position [row;column] (default = [1,1])', () => __awaiter(void 0, void 0, void 0, function* () {
            yield ctx.page.evaluate(`
        // Default
        window.term.write('foo\x1b[Ha')
        // Explicit
        window.term.write('\x1b[3;3Hb')
      `);
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getLinesAsArray(3), ['aoo', '', '  b']);
        }));
        (0, test_1.test)('CSI Ps I - CHT: Cursor Forward Tabulation Ps tab stops (default = 1)', () => __awaiter(void 0, void 0, void 0, function* () {
            yield ctx.page.evaluate(`
        // Default
        window.term.write('\x1b[Ia')
        // Explicit
        window.term.write('\\n\\r\x1b[2Ib')
      `);
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getLinesAsArray(2), ['        a', '                b']);
        }));
        (0, test_1.test)('CSI Ps J - ED: Erase in Display, VT100', () => __awaiter(void 0, void 0, void 0, function* () {
            const fixture = 'abc\\n\\rdef\\n\\rghi\x1b[2;2H';
            yield ctx.page.evaluate(`
        // Default: Erase Below
        window.term.resize(5, 5);
        window.term.write('${fixture}\x1b[J')
      `);
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getLinesAsArray(3), ['abc', 'd', '']);
            yield ctx.page.evaluate(`
        // 0: Erase Below
        window.term.reset()
        window.term.write('${fixture}\x1b[0J')
      `);
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getLinesAsArray(3), ['abc', 'd', '']);
            yield ctx.page.evaluate(`
        // 1: Erase Above
        window.term.reset()
        window.term.write('${fixture}\x1b[1J')
      `);
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getLinesAsArray(3), ['', '  f', 'ghi']);
            yield ctx.page.evaluate(`
        // 2: Erase Saved Lines (scrollback)
        window.term.reset()
        window.term.write('1\\n2\\n3\\n4\\n5${fixture}\x1b[3J')
      `);
            yield (0, TestUtils_1.pollFor)(ctx.page, () => ctx.page.evaluate(`window.term.buffer.active.length`), 5);
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getLinesAsArray(5), ['   4', '    5', 'abc', 'def', 'ghi']);
        }));
        (0, test_1.test)('CSI ? Ps J - DECSED: Erase in Display, VT220', () => __awaiter(void 0, void 0, void 0, function* () {
            const fixture = 'abc\\n\\rdef\\n\\rghi\x1b[2;2H';
            yield ctx.page.evaluate(`
        // Default: Erase Below
        window.term.resize(5, 5);
        window.term.write('${fixture}\x1b[?J')
      `);
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getLinesAsArray(3), ['abc', 'd', '']);
            yield ctx.page.evaluate(`
        // 0: Erase Below
        window.term.reset()
        window.term.write('${fixture}\x1b[?0J')
      `);
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getLinesAsArray(3), ['abc', 'd', '']);
            yield ctx.page.evaluate(`
        // 1: Erase Above
        window.term.reset()
        window.term.write('${fixture}\x1b[?1J')
      `);
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getLinesAsArray(3), ['', '  f', 'ghi']);
            yield ctx.page.evaluate(`
        // 2: Erase Saved Lines (scrollback)
        window.term.reset()
        window.term.write('1\\n2\\n3\\n4\\n5${fixture}\x1b[?3J')
      `);
            yield (0, TestUtils_1.pollFor)(ctx.page, () => ctx.page.evaluate(`window.term.buffer.active.length`), 5);
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getLinesAsArray(5), ['   4', '    5', 'abc', 'def', 'ghi']);
        }));
        test_1.test.skip('CSI Ps K - EL: Erase in Line, VT100', () => __awaiter(void 0, void 0, void 0, function* () {
        }));
        test_1.test.skip('CSI ? Ps K - DECSEL: Erase in Line, VT220', () => __awaiter(void 0, void 0, void 0, function* () {
        }));
        (0, test_1.test)('CSI Ps L - IL: Insert Ps Line(s) (default = 1)', () => __awaiter(void 0, void 0, void 0, function* () {
            yield ctx.page.evaluate(`
        // Default
        window.term.write('foo\x1b[La')
        // Explicit
        window.term.write('\x1b[2Lb')
      `);
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getLinesAsArray(4), ['b', '', 'a', 'foo']);
        }));
        (0, test_1.test)('CSI Ps M - DL: Delete Ps Line(s) (default = 1)', () => __awaiter(void 0, void 0, void 0, function* () {
            yield ctx.page.evaluate(`
        // Default
        window.term.write('a\\nb\x1b[1F\x1b[M')
        // Explicit
        window.term.write('\x1b[1Ed\\ne\\nf\x1b[2F\x1b[2M')
      `);
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getLinesAsArray(5), [' b', '  f', '', '', '']);
        }));
        (0, test_1.test)('CSI Ps P - DCH: Delete Ps Character(s) (default = 1)', () => __awaiter(void 0, void 0, void 0, function* () {
            yield ctx.page.evaluate(`
        // Default
        window.term.write('abc\x1b[1;1H\x1b[P')
        // Explicit
        window.term.write('\\n\\rdef\x1b[2;1H\x1b[2P')
      `);
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getLinesAsArray(2), ['bc', 'f']);
        }));
        test_1.test.skip('CSI Pm # P - XTPUSHCOLORS: Push current dynamic- and ANSI-palette colors onto stack, xterm', () => __awaiter(void 0, void 0, void 0, function* () {
        }));
        test_1.test.skip('CSI Pm # Q - XTPOPCOLORS: Pop stack to set dynamic- and ANSI-palette colors, xterm', () => __awaiter(void 0, void 0, void 0, function* () {
        }));
        test_1.test.skip('CSI # R - XTREPORTCOLORS: Report the current entry on the palette stack, and the number of palettes stored on the stack, using the same form as XTPOPCOLOR (default = 0), xterm', () => __awaiter(void 0, void 0, void 0, function* () {
        }));
        test_1.test.skip('CSI Ps S - SU: Scroll up Ps lines (default = 1), VT420, ECMA-48', () => __awaiter(void 0, void 0, void 0, function* () {
        }));
        test_1.test.skip('CSI ? Pi ; Pa ; Pv S - XTSMGRAPHICS: Set or request graphics attribute, xterm', () => __awaiter(void 0, void 0, void 0, function* () {
        }));
        test_1.test.skip('CSI Ps T - SD: Scroll down Ps lines (default = 1), VT420', () => __awaiter(void 0, void 0, void 0, function* () {
        }));
        test_1.test.skip('CSI Ps ; Ps ; Ps ; Ps ; Ps T - XTHIMOUSE: Initiate highlight mouse tracking (XTHIMOUSE), xterm', () => __awaiter(void 0, void 0, void 0, function* () {
        }));
        test_1.test.skip('CSI > Pm T - XTRMTITLE: Reset title mode features to default value, xterm', () => __awaiter(void 0, void 0, void 0, function* () {
        }));
        test_1.test.skip('CSI Ps X - ECH: Erase Ps Character(s) (default = 1)', () => __awaiter(void 0, void 0, void 0, function* () {
        }));
        test_1.test.skip('CSI Ps Z - CBT: Cursor Backward Tabulation Ps tab stops (default = 1)', () => __awaiter(void 0, void 0, void 0, function* () {
        }));
        test_1.test.skip('CSI Ps ^ - SD: Scroll down Ps lines (default = 1) (SD), ECMA-48', () => __awaiter(void 0, void 0, void 0, function* () {
        }));
        test_1.test.skip('CSI Ps ` - HPA: Character Position Absolute [column] (default = [row,1])', () => __awaiter(void 0, void 0, void 0, function* () {
        }));
        test_1.test.skip('CSI Ps a - ', () => __awaiter(void 0, void 0, void 0, function* () {
        }));
        (0, test_1.test)('CSI Ps b - REP: Repeat preceding character, ECMA48', () => __awaiter(void 0, void 0, void 0, function* () {
            yield ctx.page.evaluate(`
          window.term.resize(10, 10);
          window.term.write('#\x1b[b');
          window.term.writeln('');
          window.term.write('#\x1b[0b');
          window.term.writeln('');
          window.term.write('#\x1b[1b');
          window.term.writeln('');
          window.term.write('#\x1b[5b');
          `);
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getLinesAsArray(4), ['##', '##', '##', '######']);
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getCursor(), { col: 6, row: 3 });
            yield ctx.page.evaluate(`
          window.term.reset();
          window.term.write('￥\x1b[8b');
          `);
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getLinesAsArray(1), ['￥￥￥￥￥']);
            yield ctx.page.evaluate(`
          window.term.reset();
          window.term.write('e\u0301\x1b[2b');
          `);
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getLinesAsArray(1), ['e\u0301e\u0301e\u0301']);
            yield ctx.page.evaluate(`
          window.term.reset();
          window.term.write('#\x1b[15b');
          `);
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getLinesAsArray(2), ['##########', '######']);
            yield ctx.page.evaluate(`
          window.term.reset();
          window.term.write('\x1b[?7l');  // disable wrap around
          window.term.write('#\x1b[15b');
          `);
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getLinesAsArray(2), ['##########', '']);
            yield ctx.page.evaluate(`
          window.term.reset();
          window.term.write('\x1b[?7h');  // re-enable wrap around
          window.term.write('#\\n\x1b[3b');
          window.term.write('#\\r\x1b[3b');
          window.term.writeln('');
          window.term.write('abcdefg\x1b[3D\x1b[10b#\x1b[3b');
          `);
            yield (0, TestUtils_1.pollFor)(ctx.page, () => getLinesAsArray(3), ['#', ' #', 'abcd####']);
        }));
        test_1.test.skip('CSI Ps c - ', () => __awaiter(void 0, void 0, void 0, function* () {
        }));
        test_1.test.skip('CSI = Ps c - ', () => __awaiter(void 0, void 0, void 0, function* () {
        }));
        test_1.test.skip('CSI > Ps c - ', () => __awaiter(void 0, void 0, void 0, function* () {
        }));
        test_1.test.skip('CSI Ps d - ', () => __awaiter(void 0, void 0, void 0, function* () {
        }));
        test_1.test.skip('CSI Ps e - ', () => __awaiter(void 0, void 0, void 0, function* () {
        }));
        test_1.test.skip('CSI Ps ; Ps f - ', () => __awaiter(void 0, void 0, void 0, function* () {
        }));
        test_1.test.skip('CSI Ps g - ', () => __awaiter(void 0, void 0, void 0, function* () {
        }));
        test_1.test.skip('CSI Ps h - ', () => __awaiter(void 0, void 0, void 0, function* () {
        }));
        test_1.test.describe('CSI ? Pm h - DECSET: Private Mode Set', () => {
            test_1.test.skip('Ps = 1 - Application Cursor Keys (DECCKM), VT100', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 2 - Designate USASCII for character sets G0-G3 (DECANM), VT100, and set VT100 mode', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 3 - 132 Column Mode (DECCOLM), VT100', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 4 - Smooth (Slow) Scroll (DECSCLM), VT100', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 5 - Reverse Video (DECSCNM), VT100', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 6 - Origin Mode (DECOM), VT100', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 7 - Auto-Wrap Mode (DECAWM), VT100', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 8 - Auto-Repeat Keys (DECARM), VT100', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 9 - Send Mouse X & Y on button press', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 - Show toolbar (rxvt)', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 2 - Start blinking cursor (AT&T 610)', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 3 - Start blinking cursor (set only via resource or menu)', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 4 - Enable XOR of blinking cursor control sequence and menu', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 8 - Print Form Feed (DECPFF), VT220', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 9 - Set print extent to full screen (DECPEX), VT220', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 2 5 - Show cursor (DECTCEM), VT220', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 3 0 - Show scrollbar (rxvt)', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 3 5 - Enable font-shifting functions (rxvt)', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 3 8 - Enter Tektronix mode (DECTEK), VT240, xterm', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 4 0 - Allow 80 ⇒  132 mode, xterm', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 4 1 - more(1) fix (see curses resource)', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 4 2 - Enable National Replacement Character sets (DECNRCM), VT220', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 4 3 - Enable Graphic Expanded Print Mode (DECGEPM), VT340', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 4 4 - Turn on margin bell, xterm', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 4 4 - Enable Graphic Print Color Mode (DECGPCM), VT340', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 4 5 - Reverse-wraparound mode (XTREVWRAP), xterm', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 4 5 - Enable Graphic Print Color Syntax (DECGPCS), VT340', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 4 6 - Start logging (XTLOGGING), xterm', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 4 6 - Graphic Print Background Mode, VT340', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 4 7 - Use Alternate Screen Buffer, xterm', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 4 7 - Enable Graphic Rotated Print Mode (DECGRPM), VT340', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 6 6 - Application keypad mode (DECNKM), VT320', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 6 7 - Backarrow key sends backspace (DECBKM), VT340, VT420', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 6 9 - Enable left and right margin mode (DECLRMM), VT420 and up', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 8 0 - Enable Sixel Display Mode (DECSDM), VT330, VT340, VT382', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 9 5 - Do not clear screen when DECCOLM is set/reset (DECNCSM), VT510 and up', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 0 0 - Send Mouse X & Y on button press and release', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 0 1 - Use Hilite Mouse Tracking, xterm', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 0 2 - Use Cell Motion Mouse Tracking, xterm', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            (0, test_1.test)('Ps = 1 0 0 3 - Set Use All Motion (any event) Mouse Tracking', () => __awaiter(void 0, void 0, void 0, function* () {
                const coords = yield ctx.page.evaluate(`
          (function() {
            const rect = window.term.element.getBoundingClientRect();
            return { left: rect.left, top: rect.top, bottom: rect.bottom, right: rect.right };
          })();
        `);
                yield ctx.page.mouse.click((coords.left + coords.right) / 2, (coords.top + coords.bottom) / 2);
                yield ctx.page.mouse.down();
                yield ctx.page.mouse.move((coords.left + coords.right) / 2, (coords.top + coords.bottom) / 4);
                (0, assert_1.ok)((yield ctx.page.evaluate(`window.term.getSelection().length`)) > 0, 'mouse events are off so there should be a selection');
                yield ctx.page.mouse.up();
                yield ctx.page.mouse.click((coords.left + coords.right) / 2, (coords.top + coords.bottom) / 2);
                yield (0, TestUtils_1.pollFor)(ctx.page, () => ctx.page.evaluate(`window.term.getSelection().length`), 0);
                yield ctx.page.evaluate(`window.term.write('\x1b[?1003h')`);
                yield ctx.page.mouse.click((coords.left + coords.right) / 2, (coords.top + coords.bottom) / 2);
                yield ctx.page.mouse.down();
                yield ctx.page.mouse.move((coords.left + coords.right) / 2, (coords.top + coords.bottom) / 4);
                yield (0, TestUtils_1.pollFor)(ctx.page, () => ctx.page.evaluate(`window.term.getSelection().length`), 0);
                yield ctx.page.mouse.up();
            }));
            test_1.test.skip('Ps = 1 0 0 4 - Send FocusIn/FocusOut events, xterm', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 0 5 - Enable UTF-8 Mouse Mode, xterm', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 0 6 - Enable SGR Mouse Mode, xterm', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 0 7 - Enable Alternate Scroll Mode, xterm', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 1 0 - Scroll to bottom on tty output (rxvt)', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 1 1 - Scroll to bottom on key press (rxvt)', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 1 5 - Enable urxvt Mouse Mode', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 1 6 - Enable SGR Mouse PixelMode, xterm', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 3 4 - Interpret "meta" key, xterm', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 3 5 - Enable special modifiers for Alt and NumLock keys, xterm', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 3 6 - Send ESC   when Meta modifies a key, xterm', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 3 7 - Send DEL from the editing-keypad Delete key, xterm', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 3 9 - Send ESC  when Alt modifies a key, xterm', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 4 0 - Keep selection even if not highlighted, xterm', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 4 1 - Use the CLIPBOARD selection, xterm', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 4 2 - Enable Urgency window manager hint when Control-G is received, xterm', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 4 3 - Enable raising of the window when Control-G is received, xterm', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 4 4 - Reuse the most recent data copied to CLIPBOARD, xterm', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 4 5 - XTREVWRAP2: Extended Reverse-wraparound mode, xterm', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 4 6 - Enable switching to/from Alternate Screen Buffer, xterm', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 4 7 - Use Alternate Screen Buffer, xterm', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 4 8 - Save cursor as in DECSC, xterm', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 4 9 - Save cursor as in DECSC, xterm', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 5 0 - Set terminfo/termcap function-key mode, xterm', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 5 1 - Set Sun function-key mode, xterm', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 5 2 - Set HP function-key mode, xterm', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 5 3 - Set SCO function-key mode, xterm', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 6 0 - Set legacy keyboard emulation, i.e, X11R6, xterm', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 6 1 - Set VT220 keyboard emulation, xterm', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 2 0 0 1 - Enable readline mouse button-1, xterm', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 2 0 0 2 - Enable readline mouse button-2, xterm', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 2 0 0 3 - Enable readline mouse button-3, xterm', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            (0, test_1.test)('Pm = 2 0 0 4, Set bracketed paste mode', () => __awaiter(void 0, void 0, void 0, function* () {
                if (ctx.browser.browserType().name() !== 'chromium') {
                    test_1.test.skip();
                    return;
                }
                yield (0, TestUtils_1.pollFor)(ctx.page, () => simulatePaste('foo'), 'foo');
                yield ctx.page.evaluate(`window.term.write('\x1b[?2004h')`);
                yield (0, TestUtils_1.pollFor)(ctx.page, () => simulatePaste('bar'), '\x1b[200~bar\x1b[201~');
                yield ctx.page.evaluate(`window.term.write('\x1b[?2004l')`);
                yield (0, TestUtils_1.pollFor)(ctx.page, () => simulatePaste('baz'), 'baz');
            }));
            test_1.test.skip('Ps = 2 0 0 5 - Enable readline character-quoting, xterm', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 2 0 0 6 - Enable readline newline pasting, xterm', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
        });
        test_1.test.skip('CSI Ps i - MC: Media Copy', () => __awaiter(void 0, void 0, void 0, function* () {
        }));
        test_1.test.skip('CSI ? Ps i - MC: Media Copy, DEC-specified', () => __awaiter(void 0, void 0, void 0, function* () {
        }));
        test_1.test.skip('CSI Pm l - RM: Reset Mode', () => __awaiter(void 0, void 0, void 0, function* () {
        }));
        test_1.test.describe('CSI ? Pm l - DECRST: DEC Private Mode Reset', () => __awaiter(void 0, void 0, void 0, function* () {
            test_1.test.skip('Ps = 1 - Normal Cursor Keys (DECCKM), VT100.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 2 - Designate VT52 mode (DECANM), VT100.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 3 - 80 Column Mode (DECCOLM), VT100.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 4 - Jump (Fast) Scroll (DECSCLM), VT100.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 5 - Normal Video (DECSCNM), VT100.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 6 - Normal Cursor Mode (DECOM), VT100.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 7 - No Auto-Wrap Mode (DECAWM), VT100.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 8 - No Auto-Repeat Keys (DECARM), VT100.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 9 - Don\'t send Mouse X & Y on button press, xterm.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 - Hide toolbar (rxvt).', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 2 - Stop blinking cursor (AT&T 610).', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 3 - Disable blinking cursor (reset only via resource or menu).', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 4 - Disable XOR of blinking cursor control sequence and menu.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 8 - Don\'t Print Form Feed (DECPFF), VT220.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 9 - Limit print to scrolling region (DECPEX), VT220.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 2 5 - Hide cursor (DECTCEM), VT220.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 3 0 - Don\'t show scrollbar (rxvt).', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 3 5 - Disable font-shifting functions (rxvt).', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 4 0 - Disallow 80 ⇒  132 mode, xterm.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 4 1 - No more(1) fix (see curses resource).', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 4 2 - Disable National Replacement Character sets (DECNRCM), VT220.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 4 3 - Disable Graphic Expanded Print Mode (DECGEPM), VT340.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 4 4 - Turn off margin bell, xterm.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 4 4 - Disable Graphic Print Color Mode (DECGPCM), VT340.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 4 5 - No Reverse-wraparound mode (XTREVWRAP), xterm.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 4 5 - Disable Graphic Print Color Syntax (DECGPCS), VT340.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 4 6 - Stop logging (XTLOGGING), xterm.  This is normally disabled by a compile-time option.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 4 7 - Use Normal Screen Buffer, xterm.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 4 7 - Disable Graphic Rotated Print Mode (DECGRPM), VT340.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 6 6 - Numeric keypad mode (DECNKM), VT320.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 6 7 - Backarrow key sends delete (DECBKM), VT340, VT420.  This sets the backarrowKey resource to "false".', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 6 9 - Disable left and right margin mode (DECLRMM), VT420 and up.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 8 0 - Disable Sixel Display Mode (DECSDM), VT330, VT340, VT382.  Turns on "Sixel Scrolling".  See the section Sixel Graphics and mode 8 4 5 2 .', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 9 5 - Clear screen when DECCOLM is set/reset (DECNCSM), VT510 and up.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 0 0 - Don\'t send Mouse X & Y on button press and release.  See the section Mouse Tracking.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 0 1 - Don\'t use Hilite Mouse Tracking, xterm.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 0 2 - Don\'t use Cell Motion Mouse Tracking, xterm.  See the section Button-event tracking.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 0 3 - Don\'t use All Motion Mouse Tracking, xterm. See the section Any-event tracking.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 0 4 - Don\'t send FocusIn/FocusOut events, xterm.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 0 5 - Disable UTF-8 Mouse Mode, xterm.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 0 6 - Disable SGR Mouse Mode, xterm.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 0 7 - Disable Alternate Scroll Mode, xterm.  This corresponds to the alternateScroll resource.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 1 0 - Don\'t scroll to bottom on tty output (rxvt).  This sets the scrollTtyOutput resource to "false".', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 1 1 - Don\'t scroll to bottom on key press (rxvt). This sets the scrollKey resource to "false".', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 1 5 - Disable urxvt Mouse Mode.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 1 6 - Disable SGR Mouse Pixel-Mode, xterm.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 3 4 - Don\'t interpret "meta" key, xterm.  This disables the eightBitInput resource.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 3 5 - Disable special modifiers for Alt and NumLock keys, xterm.  This disables the numLock resource.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 3 6 - Don\'t send ESC  when Meta modifies a key, xterm.  This disables the metaSendsEscape resource.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 3 7 - Send VT220 Remove from the editing-keypad Delete key, xterm.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 3 9 - Don\'t send ESC when Alt modifies a key, xterm.  This disables the altSendsEscape resource.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 4 0 - Do not keep selection when not highlighted, xterm.  This disables the keepSelection resource.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 4 1 - Use the PRIMARY selection, xterm.  This disables the selectToClipboard resource.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 4 2 - Disable Urgency window manager hint when Control-G is received, xterm.  This disables the bellIsUrgent resource.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 4 3 - Disable raising of the window when Control- G is received, xterm.  This disables the popOnBell resource.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 4 5 - No Extended Reverse-wraparound mode (XTREVWRAP2), xterm.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 4 6 - Disable switching to/from Alternate Screen Buffer, xterm.  This works for terminfo-based systems, updating the titeInhibit resource.  If currently using the Alternate Screen Buffer, xterm switches to the Normal Screen Buffer.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 4 7 - Use Normal Screen Buffer, xterm.  Clear the screen first if in the Alternate Screen Buffer.  This may be disabled by the titeInhibit resource.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 4 8 - Restore cursor as in DECRC, xterm.  This may be disabled by the titeInhibit resource.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 4 9 - Use Normal Screen Buffer and restore cursor as in DECRC, xterm.  This may be disabled by the titeInhibit resource.  This combines the effects of the 1 0 4 7  and 1 0 4 8  modes.  Use this with terminfo-based applications rather than the 4 7  mode.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 5 0 - Reset terminfo/termcap function-key mode, xterm.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 5 1 - Reset Sun function-key mode, xterm.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 5 2 - Reset HP function-key mode, xterm.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 5 3 - Reset SCO function-key mode, xterm.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 6 0 - Reset legacy keyboard emulation, i.e, X11R6, xterm.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 6 1 - Reset keyboard emulation to Sun/PC style, xterm.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 2 0 0 1 - Disable readline mouse button-1, xterm.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 2 0 0 2 - Disable readline mouse button-2, xterm.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 2 0 0 3 - Disable readline mouse button-3, xterm.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 2 0 0 4 - Reset bracketed paste mode, xterm.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 2 0 0 5 - Disable readline character-quoting, xterm.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 2 0 0 6 - Disable readline newline pasting, xterm.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
        }));
        test_1.test.describe('CSI Pm m - SGR: Character Attributes', () => {
            test_1.test.skip('Ps = 0 -  Normal (default), VT100.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 -  Bold, VT100.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 2 -  Faint, decreased intensity, ECMA-48 2nd.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 3 -  Italicized, ECMA-48 2nd.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 4 -  Underlined, VT100.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 5 -  Blink, VT100. This appears as Bold in X11R6 xterm.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 7 -  Inverse, VT100.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 8 -  Invisible, i.e., hidden, ECMA-48 2nd, VT300.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 9 -  Crossed-out characters, ECMA-48 3rd.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 2 1 -  Doubly-underlined, ECMA-48 3rd.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 2 2 -  Normal (neither bold nor faint), ECMA-48 3rd.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 2 3 -  Not italicized, ECMA-48 3rd.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 2 4 -  Not underlined, ECMA-48 3rd.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 2 5 -  Steady (not blinking), ECMA-48 3rd.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 2 7 -  Positive (not inverse), ECMA-48 3rd.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 2 8 -  Visible, i.e., not hidden, ECMA-48 3rd, VT300.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 2 9 -  Not crossed-out, ECMA-48 3rd.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 3 0 -  Set foreground color to Black.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 3 1 -  Set foreground color to Red.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 3 2 -  Set foreground color to Green.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 3 3 -  Set foreground color to Yellow.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 3 4 -  Set foreground color to Blue.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 3 5 -  Set foreground color to Magenta.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 3 6 -  Set foreground color to Cyan.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 3 7 -  Set foreground color to White.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 3 9 -  Set foreground color to default, ECMA-48 3rd.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 4 0 -  Set background color to Black.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 4 1 -  Set background color to Red.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 4 2 -  Set background color to Green.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 4 3 -  Set background color to Yellow.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 4 4 -  Set background color to Blue.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 4 5 -  Set background color to Magenta.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 4 6 -  Set background color to Cyan.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 4 7 -  Set background color to White.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 4 9 -  Set background color to default, ECMA-48 3rd.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 9 0 -  Set foreground color to Black.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 9 1 -  Set foreground color to Red.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 9 2 -  Set foreground color to Green.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 9 3 -  Set foreground color to Yellow.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 9 4 -  Set foreground color to Blue.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 9 5 -  Set foreground color to Magenta.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 9 6 -  Set foreground color to Cyan.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 9 7 -  Set foreground color to White.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 0 -  Set background color to Black.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 1 -  Set background color to Red.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 2 -  Set background color to Green.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 3 -  Set background color to Yellow.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 4 -  Set background color to Blue.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 5 -  Set background color to Magenta.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 6 -  Set background color to Cyan.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 1 0 7 -  Set background color to White.', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 3 8 : 2 : Pi : Pr : Pg : Pb-  Set foreground color using RGB values', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 3 8 : 5 : Ps-  Set foreground color to Ps, using indexed color', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 4 8 : 2 : Pi : Pr : Pg : Pb-  Set background color using RGB values', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 4 8 : 5 : Ps-  Set background color to Ps, using indexed color', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 3 8 ; 2 ; Pr ; Pg ; Pb-  Set foreground color using RGB values', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
            test_1.test.skip('Ps = 4 8 ; 2 ; Pr ; Pg ; Pb-  Set background color using RGB values', () => __awaiter(void 0, void 0, void 0, function* () {
            }));
        });
        test_1.test.skip('CSI > Pp [; Pv] m - XTMODKEYS: Set/reset key modifier options, xterm', () => {
        });
        test_1.test.skip('CSI ? Pp m - XTQMODKEYS: Query key modifier options, xterm', () => {
        });
        test_1.test.describe('CSI Ps n - DSR: Device Status Report', () => {
            (0, test_1.test)('Status Report - CSI 5 n', () => __awaiter(void 0, void 0, void 0, function* () {
                yield ctx.page.evaluate(`
          window.term.onData(e => window.result = e);
          window.term.write('\\x1b[5n');
        `);
                yield (0, TestUtils_1.pollFor)(ctx.page, () => ctx.page.evaluate(`window.result`), '\x1b[0n');
            }));
            (0, test_1.test)('Report Cursor Position (CPR) - CSI 6 n', () => __awaiter(void 0, void 0, void 0, function* () {
                yield ctx.page.evaluate(`window.term.write('\\n\\nfoo')`);
                yield (0, TestUtils_1.pollFor)(ctx.page, () => ctx.page.evaluate(`
          [window.term.buffer.active.cursorY, window.term.buffer.active.cursorX]
        `), [2, 3]);
                yield ctx.page.evaluate(`
          window.term.onData(e => window.result = e);
          window.term.write('\\x1b[6n');
        `);
                yield (0, TestUtils_1.pollFor)(ctx.page, () => ctx.page.evaluate(`window.result`), '\x1b[3;4R');
            }));
            (0, test_1.test)('Report Cursor Position (DECXCPR) - CSI ? 6 n', () => __awaiter(void 0, void 0, void 0, function* () {
                yield ctx.page.evaluate(`window.term.write('\\n\\nfoo')`);
                yield (0, TestUtils_1.pollFor)(ctx.page, () => ctx.page.evaluate(`
          [window.term.buffer.active.cursorY, window.term.buffer.active.cursorX]
        `), [2, 3]);
                yield ctx.page.evaluate(`
          window.term.onData(e => window.result = e);
          window.term.write('\\x1b[?6n');
        `);
                yield (0, TestUtils_1.pollFor)(ctx.page, () => ctx.page.evaluate(`window.result`), '\x1b[?3;4R');
            }));
        });
        test_1.test.skip('CSI > Ps n - Disable key modifier options, xterm', () => {
        });
        test_1.test.describe.skip('CSI ? Ps n - DSR: Device Status Report (DEC-specific).', () => {
        });
        test_1.test.skip('CSI > Ps p - XTSMPOINTER: Set resource value pointerMode, xterm', () => {
        });
        test_1.test.skip('CSI ! p - DECSTR: Soft terminal reset, VT220 and up.', () => {
        });
        test_1.test.skip('CSI Pl ; Pc " p - DECSCL: Set conformance level, VT220 and up.', () => {
        });
        test_1.test.skip('CSI Ps $ p - DECRQM: Request ANSI mode', () => {
        });
        test_1.test.skip('CSI ? Ps $ p - Request DEC private mode (DECRQM).', () => {
        });
        test_1.test.skip('CSI [Pm] # p - Push video attributes onto stack (XTPUSHSGR), xterm.  This is an alias for CSI # { , used to work around language limitations of C#.', () => __awaiter(void 0, void 0, void 0, function* () {
        }));
        test_1.test.skip('CSI > Ps q - Report xterm name and version (XTVERSION).', () => __awaiter(void 0, void 0, void 0, function* () {
        }));
        test_1.test.skip('CSI Ps q - Load LEDs (DECLL), VT100.', () => __awaiter(void 0, void 0, void 0, function* () {
        }));
        test_1.test.skip('CSI Ps SP q - Set cursor style (DECSCUSR), VT520.', () => __awaiter(void 0, void 0, void 0, function* () {
        }));
        test_1.test.skip('CSI Ps " q - Select character protection attribute (DECSCA), VT220.', () => __awaiter(void 0, void 0, void 0, function* () {
        }));
        test_1.test.skip('CSI # q - Pop video attributes from stack (XTPOPSGR), xterm.', () => __awaiter(void 0, void 0, void 0, function* () {
        }));
        test_1.test.skip('CSI Ps ; Ps r - Set Scrolling Region [top;bottom] (default = full size of window) (DECSTBM), VT100.', () => __awaiter(void 0, void 0, void 0, function* () {
        }));
        test_1.test.skip('CSI ? Pm r - Restore DEC Private Mode Values (XTRESTORE), xterm.', () => __awaiter(void 0, void 0, void 0, function* () {
        }));
        test_1.test.skip('CSI Pt ; Pl ; Pb ; Pr ; Pm $ r - Change Attributes in Rectangular Area (DECCARA), VT400 and up.', () => __awaiter(void 0, void 0, void 0, function* () {
        }));
        test_1.test.skip('CSI s - Save cursor, available only when DECLRMM is disabled (SCOSC, also ANSI.SYS).', () => __awaiter(void 0, void 0, void 0, function* () {
        }));
        test_1.test.skip('CSI Pl ; Pr s - Set left and right margins (DECSLRM), VT420 and up.', () => __awaiter(void 0, void 0, void 0, function* () {
        }));
        test_1.test.skip('CSI > Ps s - Set/reset shift-escape options (XTSHIFTESCAPE), xterm.', () => __awaiter(void 0, void 0, void 0, function* () {
        }));
        test_1.test.skip('CSI ? Pm s - Save DEC Private Mode Values (XTSAVE), xterm.  Ps values are the same as for DECSET.', () => __awaiter(void 0, void 0, void 0, function* () {
        }));
        test_1.test.skip('CSI > Pm t - This xterm control sets one or more features of the title modes (XTSMTITLE), xterm.', () => __awaiter(void 0, void 0, void 0, function* () {
        }));
        test_1.test.skip('CSI Ps SP t - Set warning-bell volume (DECSWBV), VT520.', () => __awaiter(void 0, void 0, void 0, function* () {
        }));
        test_1.test.skip('CSI Pt ; Pl ; Pb ; Pr ; Pm $ t - Reverse Attributes in Rectangular Area (DECRARA), VT400 and up.', () => __awaiter(void 0, void 0, void 0, function* () {
        }));
        test_1.test.skip('CSI u - Restore cursor (SCORC, also ANSI.SYS).', () => __awaiter(void 0, void 0, void 0, function* () {
        }));
        test_1.test.skip('CSI Ps SP u - Set margin-bell volume (DECSMBV), VT520.', () => __awaiter(void 0, void 0, void 0, function* () {
        }));
        test_1.test.skip('CSI Pt ; Pl ; Pb ; Pr ; Pp ; Pt ; Pl ; Pp $ v - Copy Rectangular Area (DECCRA), VT400 and up.', () => __awaiter(void 0, void 0, void 0, function* () {
        }));
        test_1.test.skip('CSI Ps $ w - Request presentation state report (DECRQPSR), VT320 and up.', () => __awaiter(void 0, void 0, void 0, function* () {
        }));
        test_1.test.skip('CSI Pt ; Pl ; Pb ; Pr \' w - Enable Filter Rectangle (DECEFR), VT420 and up.', () => __awaiter(void 0, void 0, void 0, function* () {
        }));
        test_1.test.skip('CSI Ps x - Request Terminal Parameters (DECREQTPARM).', () => __awaiter(void 0, void 0, void 0, function* () {
        }));
        test_1.test.skip('CSI Ps * x - Select Attribute Change Extent (DECSACE), VT420 and up.', () => __awaiter(void 0, void 0, void 0, function* () {
        }));
        test_1.test.skip('CSI Pc ; Pt ; Pl ; Pb ; Pr $ x - Fill Rectangular Area (DECFRA), VT420 and up.', () => __awaiter(void 0, void 0, void 0, function* () {
        }));
        test_1.test.skip('CSI Ps # y - Select checksum extension (XTCHECKSUM), xterm.', () => __awaiter(void 0, void 0, void 0, function* () {
        }));
        test_1.test.skip('CSI Pi ; Pg ; Pt ; Pl ; Pb ; Pr * y - Request Checksum of Rectangular Area (DECRQCRA), VT420 and up.', () => __awaiter(void 0, void 0, void 0, function* () {
        }));
        test_1.test.skip('CSI Ps ; Pu \' z - Enable Locator Reporting (DECELR).', () => __awaiter(void 0, void 0, void 0, function* () {
        }));
        test_1.test.skip('CSI Pt ; Pl ; Pb ; Pr $ z - Erase Rectangular Area (DECERA), VT400 and up.', () => __awaiter(void 0, void 0, void 0, function* () {
        }));
        test_1.test.skip('CSI Pm \' { - Select Locator Events (DECSLE).', () => __awaiter(void 0, void 0, void 0, function* () {
        }));
        test_1.test.skip('CSI [Pm] # { Push video attributes onto stack (XTPUSHSGR), xterm.', () => __awaiter(void 0, void 0, void 0, function* () {
        }));
        test_1.test.skip('CSI Pt ; Pl ; Pb ; Pr $ { - Selective Erase Rectangular Area (DECSERA), VT400 and up.', () => __awaiter(void 0, void 0, void 0, function* () {
        }));
        test_1.test.skip('CSI Pt ; Pl ; Pb ; Pr # | - Report selected graphic rendition (XTREPORTSGR), xterm.', () => __awaiter(void 0, void 0, void 0, function* () {
        }));
        test_1.test.skip('CSI Ps $ | - Select columns per page (DECSCPP), VT340.', () => __awaiter(void 0, void 0, void 0, function* () {
        }));
        test_1.test.skip('CSI Ps \' | - Request Locator Position (DECRQLP).', () => __awaiter(void 0, void 0, void 0, function* () {
        }));
        test_1.test.skip('CSI Ps * | - Select number of lines per screen (DECSNLS), VT420 and up.', () => __awaiter(void 0, void 0, void 0, function* () {
        }));
        test_1.test.skip('CSI # } - Pop video attributes from stack (XTPOPSGR), xterm.', () => __awaiter(void 0, void 0, void 0, function* () {
        }));
        test_1.test.skip('CSI Ps \' } - Insert Ps Column(s) (default = 1) (DECIC), VT420 and up.', () => __awaiter(void 0, void 0, void 0, function* () {
        }));
        test_1.test.skip('CSI Ps $ } - Select active status display (DECSASD), VT320 and up.', () => __awaiter(void 0, void 0, void 0, function* () {
        }));
        test_1.test.skip('CSI Ps \' ~ - Delete Ps Column(s) (default = 1) (DECDC), VT420 and up.', () => __awaiter(void 0, void 0, void 0, function* () {
        }));
        test_1.test.skip('CSI Ps $ ~ - Select status line type (DECSSDT), VT320 and up.', () => __awaiter(void 0, void 0, void 0, function* () {
        }));
        test_1.test.describe('CSI Ps ; Ps ; Ps t - Window Options', () => {
            (0, test_1.test)('should be disabled by default', () => __awaiter(void 0, void 0, void 0, function* () {
                yield ctx.page.evaluate(`(() => {
            window._stack = [];
            const _h = window.term.onData(data => window._stack.push(data));
            window.term.write('\x1b[14t');
            window.term.write('\x1b[16t');
            window.term.write('\x1b[18t');
            window.term.write('\x1b[20t');
            window.term.write('\x1b[21t');
            return new Promise((r) => window.term.write('', () => { _h.dispose(); r(); }));
          })()`);
                yield (0, TestUtils_1.pollFor)(ctx.page, () => __awaiter(void 0, void 0, void 0, function* () { return yield ctx.page.evaluate(`(() => _stack)()`); }), []);
            }));
            (0, test_1.test)('14 - GetWinSizePixels', () => __awaiter(void 0, void 0, void 0, function* () {
                yield ctx.page.evaluate(`window.term.options.windowOptions = { getWinSizePixels: true }; `);
                yield ctx.page.evaluate(`(() => {
            window._stack = [];
            const _h = window.term.onData(data => window._stack.push(data));
            window.term.write('\x1b[14t');
            return new Promise((r) => window.term.write('', () => { _h.dispose(); r(); }));
          })()`);
                const d = yield getDimensions();
                yield (0, TestUtils_1.pollFor)(ctx.page, () => __awaiter(void 0, void 0, void 0, function* () { return yield ctx.page.evaluate(`(() => _stack)()`); }), [`\x1b[4;${d.height};${d.width}t`]);
            }));
            (0, test_1.test)('16 - GetCellSizePixels', () => __awaiter(void 0, void 0, void 0, function* () {
                yield ctx.page.evaluate(`window.term.options.windowOptions = { getCellSizePixels: true }; `);
                yield ctx.page.evaluate(`(() => {
            window._stack = [];
            const _h = window.term.onData(data => window._stack.push(data));
            window.term.write('\x1b[16t');
            return new Promise((r) => window.term.write('', () => { _h.dispose(); r(); }));
          })()`);
                const d = yield getDimensions();
                yield (0, TestUtils_1.pollFor)(ctx.page, () => __awaiter(void 0, void 0, void 0, function* () { return yield ctx.page.evaluate(`(() => _stack)()`); }), [`\x1b[6;${d.cellHeight};${d.cellWidth}t`]);
            }));
        });
    });
    test_1.test.describe('OSC', () => {
        test_1.test.describe('OSC 4', () => {
            test_1.test.beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
                yield ctx.page.evaluate('(() => {window._recordedData = []; window._h = term.onData(d => window._recordedData.push(d));})()');
            }));
            test_1.test.afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
                yield ctx.page.evaluate('window._h.dispose()');
            }));
            test_1.test.beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
                yield ctx.page.evaluate('window._recordedData.length = 0;');
            }));
            (0, test_1.test)('query single color', () => __awaiter(void 0, void 0, void 0, function* () {
                yield ctx.proxy.write('\x1b]4;0;?\x07');
                (0, assert_1.deepStrictEqual)(yield ctx.page.evaluate('window._recordedData'), ['\x1b]4;0;rgb:2e2e/3434/3636\x1b\\']);
                yield ctx.proxy.write('\x1b]4;77;?\x07');
                (0, assert_1.deepStrictEqual)(yield ctx.page.evaluate('window._recordedData'), ['\x1b]4;0;rgb:2e2e/3434/3636\x1b\\', '\x1b]4;77;rgb:5f5f/d7d7/5f5f\x1b\\']);
            }));
            (0, test_1.test)('query multiple colors', () => __awaiter(void 0, void 0, void 0, function* () {
                yield ctx.proxy.write('\x1b]4;0;?;77;?\x07');
                (0, assert_1.deepStrictEqual)(yield ctx.page.evaluate('window._recordedData'), ['\x1b]4;0;rgb:2e2e/3434/3636\x1b\\', '\x1b]4;77;rgb:5f5f/d7d7/5f5f\x1b\\']);
            }));
            (0, test_1.test)('set & query single color', () => __awaiter(void 0, void 0, void 0, function* () {
                yield ctx.proxy.write('\x1b]4;0;?\x07');
                const restore = yield ctx.page.evaluate('window._recordedData');
                (0, assert_1.deepStrictEqual)(yield ctx.page.evaluate('window._recordedData'), restore);
                yield ctx.proxy.write('\x1b]4;0;rgb:01/02/03\x07\x1b]4;0;?\x07');
                (0, assert_1.deepStrictEqual)(yield ctx.page.evaluate('window._recordedData'), [restore[0], '\x1b]4;0;rgb:0101/0202/0303\x1b\\']);
                yield ctx.proxy.write(restore[0] + '\x1b]4;0;?\x07');
                (0, assert_1.deepStrictEqual)(yield ctx.page.evaluate('window._recordedData'), [restore[0], '\x1b]4;0;rgb:0101/0202/0303\x1b\\', restore[0]]);
            }));
            (0, test_1.test)('query & set colors mixed', () => __awaiter(void 0, void 0, void 0, function* () {
                yield ctx.proxy.write('\x1b]4;0;?;77;?\x07');
                const restore = yield ctx.page.evaluate('window._recordedData');
                yield ctx.page.evaluate('window._recordedData.length = 0;');
                yield ctx.proxy.write('\x1b]4;0;rgb:01/02/03;43;?;77;#aabbcc\x07');
                (0, assert_1.deepStrictEqual)(yield ctx.page.evaluate('window._recordedData'), ['\x1b]4;43;rgb:0000/d7d7/afaf\x1b\\']);
                yield ctx.page.evaluate('window._recordedData.length = 0;');
                yield ctx.proxy.write('\x1b]4;0;?;77;?\x07');
                (0, assert_1.deepStrictEqual)(yield ctx.page.evaluate('window._recordedData'), ['\x1b]4;0;rgb:0101/0202/0303\x1b\\', '\x1b]4;77;rgb:aaaa/bbbb/cccc\x1b\\']);
                yield ctx.page.evaluate('window._recordedData.length = 0;');
                yield ctx.proxy.write(restore[0] + restore[1] + '\x1b]4;0;?;77;?\x07');
                (0, assert_1.deepStrictEqual)(yield ctx.page.evaluate('window._recordedData'), restore);
            }));
        });
        test_1.test.describe('OSC 4 & 104', () => {
            test_1.test.beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
                yield ctx.page.evaluate('(() => {window._recordedData = []; window._h = term.onData(d => window._recordedData.push(d));})()');
            }));
            test_1.test.afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
                yield ctx.page.evaluate('window._h.dispose()');
            }));
            test_1.test.beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
                yield ctx.page.evaluate('window._recordedData.length = 0;');
            }));
            (0, test_1.test)('change & restore single color', () => __awaiter(void 0, void 0, void 0, function* () {
                for (const i of [0, 43, 77, 255]) {
                    yield ctx.proxy.write(`\x1b]4;${i};?\x07`);
                    const restore = yield ctx.page.evaluate('window._recordedData');
                    yield ctx.proxy.write(`\x1b]4;${i};rgb:01/02/03\x07\x1b]4;${i};?\x07`);
                    (0, assert_1.deepStrictEqual)(yield ctx.page.evaluate('window._recordedData'), [restore[0], `\x1b]4;${i};rgb:0101/0202/0303\x1b\\`]);
                    yield ctx.proxy.write(`\x1b]104;${i}\x07\x1b]4;${i};?\x07`);
                    (0, assert_1.deepStrictEqual)(yield ctx.page.evaluate('window._recordedData'), [restore[0], `\x1b]4;${i};rgb:0101/0202/0303\x1b\\`, restore[0]]);
                    yield ctx.page.evaluate('window._recordedData.length = 0;');
                }
            }));
            (0, test_1.test)('restore multiple at once', () => __awaiter(void 0, void 0, void 0, function* () {
                yield ctx.proxy.write(`\x1b]4;0;?;43;?;77;?\x07`);
                const restore = yield ctx.page.evaluate('window._recordedData');
                yield ctx.page.evaluate('window._recordedData.length = 0;');
                yield ctx.proxy.write(`\x1b]4;0;rgb:01/02/03;43;#aabbcc;77;#123456\x07`);
                yield ctx.proxy.write(`\x1b]104;0;43;77\x07` + `\x1b]4;0;?;43;?;77;?\x07`);
                (0, assert_1.deepStrictEqual)(yield ctx.page.evaluate('window._recordedData'), restore);
            }));
            (0, test_1.test)('restore full table', () => __awaiter(void 0, void 0, void 0, function* () {
                yield ctx.proxy.write(`\x1b]4;0;?;43;?;77;?\x07`);
                const restore = yield ctx.page.evaluate('window._recordedData');
                yield ctx.page.evaluate('window._recordedData.length = 0;');
                yield ctx.proxy.write(`\x1b]4;0;rgb:01/02/03;43;#aabbcc;77;#123456\x07`);
                yield ctx.proxy.write(`\x1b]104\x07` + `\x1b]4;0;?;43;?;77;?\x07`);
                (0, assert_1.deepStrictEqual)(yield ctx.page.evaluate('window._recordedData'), restore);
            }));
        });
        test_1.test.describe('OSC 10 & 11 + 110 | 111 | 112', () => {
            test_1.test.beforeAll(() => __awaiter(void 0, void 0, void 0, function* () {
                yield ctx.page.evaluate('(() => {window._recordedData = []; window._h = term.onData(d => window._recordedData.push(d));})()');
            }));
            test_1.test.afterAll(() => __awaiter(void 0, void 0, void 0, function* () {
                yield ctx.page.evaluate('window._h.dispose()');
            }));
            test_1.test.beforeEach(() => __awaiter(void 0, void 0, void 0, function* () {
                yield ctx.page.evaluate('window._recordedData.length = 0;');
            }));
            (0, test_1.test)('query FG color', () => __awaiter(void 0, void 0, void 0, function* () {
                yield ctx.proxy.write('\x1b]10;?\x07');
                (0, assert_1.deepStrictEqual)(yield ctx.page.evaluate('window._recordedData'), ['\x1b]10;rgb:ffff/ffff/ffff\x1b\\']);
            }));
            (0, test_1.test)('query BG color', () => __awaiter(void 0, void 0, void 0, function* () {
                yield ctx.proxy.write('\x1b]11;?\x07');
                (0, assert_1.deepStrictEqual)(yield ctx.page.evaluate('window._recordedData'), ['\x1b]11;rgb:0000/0000/0000\x1b\\']);
            }));
            (0, test_1.test)('query FG & BG color in one call', () => __awaiter(void 0, void 0, void 0, function* () {
                yield ctx.proxy.write('\x1b]10;?;?\x07');
                (0, assert_1.deepStrictEqual)(yield ctx.page.evaluate('window._recordedData'), ['\x1b]10;rgb:ffff/ffff/ffff\x1b\\', '\x1b]11;rgb:0000/0000/0000\x1b\\']);
            }));
            (0, test_1.test)('set & query FG', () => __awaiter(void 0, void 0, void 0, function* () {
                yield ctx.proxy.write('\x1b]10;rgb:1/2/3\x07\x1b]10;?\x07');
                (0, assert_1.deepStrictEqual)(yield ctx.page.evaluate('window._recordedData'), ['\x1b]10;rgb:1111/2222/3333\x1b\\']);
                yield ctx.proxy.write('\x1b]10;#ffffff\x07\x1b]10;?\x07');
                (0, assert_1.deepStrictEqual)(yield ctx.page.evaluate('window._recordedData'), ['\x1b]10;rgb:1111/2222/3333\x1b\\', '\x1b]10;rgb:ffff/ffff/ffff\x1b\\']);
            }));
            (0, test_1.test)('set & query BG', () => __awaiter(void 0, void 0, void 0, function* () {
                yield ctx.proxy.write('\x1b]11;rgb:1/2/3\x07\x1b]11;?\x07');
                (0, assert_1.deepStrictEqual)(yield ctx.page.evaluate('window._recordedData'), ['\x1b]11;rgb:1111/2222/3333\x1b\\']);
                yield ctx.proxy.write('\x1b]11;#000000\x07\x1b]11;?\x07');
                (0, assert_1.deepStrictEqual)(yield ctx.page.evaluate('window._recordedData'), ['\x1b]11;rgb:1111/2222/3333\x1b\\', '\x1b]11;rgb:0000/0000/0000\x1b\\']);
            }));
            (0, test_1.test)('set & query cursor color', () => __awaiter(void 0, void 0, void 0, function* () {
                yield ctx.proxy.write('\x1b]12;rgb:1/2/3\x07\x1b]12;?\x07');
                (0, assert_1.deepStrictEqual)(yield ctx.page.evaluate('window._recordedData'), ['\x1b]12;rgb:1111/2222/3333\x1b\\']);
                yield ctx.proxy.write('\x1b]12;#ffffff\x07\x1b]12;?\x07');
                (0, assert_1.deepStrictEqual)(yield ctx.page.evaluate('window._recordedData'), ['\x1b]12;rgb:1111/2222/3333\x1b\\', '\x1b]12;rgb:ffff/ffff/ffff\x1b\\']);
            }));
            (0, test_1.test)('set & query FG & BG color in one call', () => __awaiter(void 0, void 0, void 0, function* () {
                yield ctx.proxy.write('\x1b]10;#123456;rgb:aa/bb/cc\x07\x1b]10;?;?\x07');
                (0, assert_1.deepStrictEqual)(yield ctx.page.evaluate('window._recordedData'), ['\x1b]10;rgb:1212/3434/5656\x1b\\', '\x1b]11;rgb:aaaa/bbbb/cccc\x1b\\']);
                yield ctx.proxy.write('\x1b]10;#ffffff;#000000\x07');
            }));
            (0, test_1.test)('OSC 110: restore FG color', () => __awaiter(void 0, void 0, void 0, function* () {
                yield ctx.proxy.write('\x1b]10;rgb:1/2/3\x07\x1b]10;?\x07');
                (0, assert_1.deepStrictEqual)(yield ctx.page.evaluate('window._recordedData'), ['\x1b]10;rgb:1111/2222/3333\x1b\\']);
                yield ctx.page.evaluate('window._recordedData.length = 0;');
                yield ctx.proxy.write('\x1b]110\x07\x1b]10;?\x07');
                (0, assert_1.deepStrictEqual)(yield ctx.page.evaluate('window._recordedData'), ['\x1b]10;rgb:ffff/ffff/ffff\x1b\\']);
            }));
            (0, test_1.test)('OSC 111: restore BG color', () => __awaiter(void 0, void 0, void 0, function* () {
                yield ctx.proxy.write('\x1b]11;rgb:1/2/3\x07\x1b]11;?\x07');
                (0, assert_1.deepStrictEqual)(yield ctx.page.evaluate('window._recordedData'), ['\x1b]11;rgb:1111/2222/3333\x1b\\']);
                yield ctx.page.evaluate('window._recordedData.length = 0;');
                yield ctx.proxy.write('\x1b]111\x07\x1b]11;?\x07');
                (0, assert_1.deepStrictEqual)(yield ctx.page.evaluate('window._recordedData'), ['\x1b]11;rgb:0000/0000/0000\x1b\\']);
            }));
            (0, test_1.test)('OSC 112: restore cursor color', () => __awaiter(void 0, void 0, void 0, function* () {
                yield ctx.proxy.write('\x1b]12;rgb:1/2/3\x07\x1b]12;?\x07');
                (0, assert_1.deepStrictEqual)(yield ctx.page.evaluate('window._recordedData'), ['\x1b]12;rgb:1111/2222/3333\x1b\\']);
                yield ctx.page.evaluate('window._recordedData.length = 0;');
                yield ctx.proxy.write('\x1b]112\x07\x1b]12;?\x07');
                (0, assert_1.deepStrictEqual)(yield ctx.page.evaluate('window._recordedData'), ['\x1b]12;rgb:ffff/ffff/ffff\x1b\\']);
            }));
        });
    });
    test_1.test.describe('ESC', () => {
        test_1.test.describe('DECRC: Save cursor, ESC 7', () => {
            (0, test_1.test)('should save the absolute cursor position so resizing restores to the correct position', () => __awaiter(void 0, void 0, void 0, function* () {
                yield ctx.page.evaluate(`
          window.term.resize(10, 2);
          window.term.write('1\\n\\r2\\n\\r3\\n\\r4\\n\\r5');
          window.term.write('\\x1b7\\x1b[?47h');
          `);
                yield ctx.page.evaluate(`
          window.term.resize(10, 4);
          window.term.write('\\x1b[?47l\\x1b8');
          `);
                yield (0, TestUtils_1.pollFor)(ctx.page, () => getCursor(), { col: 1, row: 3 });
            }));
        });
    });
});
function getLinesAsArray(count, start = 0) {
    return __awaiter(this, void 0, void 0, function* () {
        let text = '';
        for (let i = start; i < start + count; i++) {
            text += `window.term.buffer.active.getLine(${i}).translateToString(true),`;
        }
        return yield ctx.page.evaluate(`[${text}]`);
    });
}
function simulatePaste(text) {
    return __awaiter(this, void 0, void 0, function* () {
        const id = Math.floor(Math.random() * 1000000);
        yield ctx.page.evaluate(`
            (function() {
              window.term.onData(e => window.result_${id} = e);
              const clipboardData = new DataTransfer();
              clipboardData.setData('text/plain', '${text}');
              window.term.textarea.dispatchEvent(new ClipboardEvent('paste', { clipboardData }));
            })();
          `);
        return yield ctx.page.evaluate(`window.result_${id} `);
    });
}
function getCursor() {
    return __awaiter(this, void 0, void 0, function* () {
        return ctx.page.evaluate(`
  (function() {
    return {col: term.buffer.active.cursorX, row: term.buffer.active.cursorY};
  })();
  `);
    });
}
function getDimensions() {
    return __awaiter(this, void 0, void 0, function* () {
        const dim = yield ctx.page.evaluate(`term._core._renderService.dimensions`);
        return {
            cellWidth: dim.css.cell.width.toFixed(0),
            cellHeight: dim.css.cell.height.toFixed(0),
            width: dim.css.canvas.width.toFixed(0),
            height: dim.css.canvas.height.toFixed(0)
        };
    });
}
//# sourceMappingURL=InputHandler.test.js.map