"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const TestUtils_test_1 = require("browser/TestUtils.test");
const BufferLine_1 = require("common/buffer/BufferLine");
const CellData_1 = require("common/buffer/CellData");
const TestUtils_test_2 = require("common/TestUtils.test");
const INIT_COLS = 80;
const INIT_ROWS = 24;
const wcwidth = (new TestUtils_test_2.MockUnicodeService()).wcwidth;
describe('Terminal', () => {
    let term;
    const termOptions = {
        cols: INIT_COLS,
        rows: INIT_ROWS
    };
    beforeEach(() => {
        term = new TestUtils_test_1.TestTerminal(termOptions);
        term.refresh = () => { };
        term.renderer = new TestUtils_test_1.MockRenderer();
        term.viewport = new TestUtils_test_1.MockViewport();
        term.viewport.onRequestScrollLines(e => term.scrollLines(e.amount, e.suppressScrollEvent, 1));
        term._compositionHelper = new TestUtils_test_1.MockCompositionHelper();
        term.element = {
            classList: {
                toggle: () => { },
                remove: () => { }
            }
        };
    });
    it('should not mutate the options parameter', () => {
        term.options.cols = 1000;
        chai_1.assert.deepEqual(termOptions, {
            cols: INIT_COLS,
            rows: INIT_ROWS
        });
    });
    describe('events', () => {
        it('should fire the onData evnet', (done) => {
            term.onData(() => done());
            term.coreService.triggerDataEvent('fake');
        });
        it('should fire the onCursorMove event', () => {
            return new Promise(async (r) => {
                term.onCursorMove(() => r());
                await term.writeP('foo');
            });
        });
        it('should fire the onLineFeed event', () => {
            return new Promise(async (r) => {
                term.onLineFeed(() => r());
                await term.writeP('\n');
            });
        });
        it('should fire a scroll event when scrollback is created', () => {
            return new Promise(async (r) => {
                term.onScroll(() => r());
                await term.writeP('\n'.repeat(INIT_ROWS));
            });
        });
        it('should fire a scroll event when scrollback is cleared', () => {
            return new Promise(async (r) => {
                await term.writeP('\n'.repeat(INIT_ROWS));
                term.onScroll(() => r());
                term.clear();
            });
        });
        it('should fire a key event after a keypress DOM event', (done) => {
            term.onKey(e => {
                chai_1.assert.equal(typeof e.key, 'string');
                chai_1.assert.equal(e.domEvent instanceof Object, true);
                done();
            });
            const evKeyPress = {
                preventDefault: () => { },
                stopPropagation: () => { },
                type: 'keypress',
                keyCode: 13
            };
            term.keyPress(evKeyPress);
        });
        it('should fire a key event after a keydown DOM event', (done) => {
            term.onKey(e => {
                chai_1.assert.equal(typeof e.key, 'string');
                chai_1.assert.equal(e.domEvent instanceof Object, true);
                done();
            });
            term.textarea = { value: '' };
            const evKeyDown = {
                preventDefault: () => { },
                stopPropagation: () => { },
                type: 'keydown',
                keyCode: 13
            };
            term.keyDown(evKeyDown);
        });
        it('should fire the onResize event', (done) => {
            term.onResize(e => {
                chai_1.assert.equal(typeof e.cols, 'number');
                chai_1.assert.equal(typeof e.rows, 'number');
                done();
            });
            term.resize(1, 1);
        });
        it('should fire the onScroll event', (done) => {
            term.onScroll(e => {
                chai_1.assert.equal(typeof e, 'number');
                done();
            });
            term.scroll(BufferLine_1.DEFAULT_ATTR_DATA.clone());
        });
        it('should fire the onTitleChange event', (done) => {
            term.onTitleChange(e => {
                chai_1.assert.equal(e, 'title');
                done();
            });
            term.write('\x1b]2;title\x07');
        });
        it('should fire the onBell event', (done) => {
            term.onBell(e => {
                done();
            });
            term.write('\x07');
        });
    });
    describe('attachCustomKeyEventHandler', () => {
        const evKeyDown = {
            preventDefault: () => { },
            stopPropagation: () => { },
            type: 'keydown',
            keyCode: 77
        };
        const evKeyPress = {
            preventDefault: () => { },
            stopPropagation: () => { },
            type: 'keypress',
            keyCode: 77
        };
        beforeEach(() => {
            term.clearSelection = () => { };
        });
        it('should process the keydown/keypress event based on what the handler returns', () => {
            chai_1.assert.equal(term.keyDown(evKeyDown), true);
            chai_1.assert.equal(term.keyPress(evKeyPress), true);
            term.attachCustomKeyEventHandler(ev => ev.keyCode === 77);
            chai_1.assert.equal(term.keyDown(evKeyDown), true);
            chai_1.assert.equal(term.keyPress(evKeyPress), true);
            term.attachCustomKeyEventHandler(ev => ev.keyCode !== 77);
            chai_1.assert.equal(term.keyDown(evKeyDown), false);
            chai_1.assert.equal(term.keyPress(evKeyPress), false);
        });
        it('should alive after reset(ESC c Full Reset (RIS))', () => {
            term.attachCustomKeyEventHandler(ev => ev.keyCode !== 77);
            chai_1.assert.equal(term.keyDown(evKeyDown), false);
            chai_1.assert.equal(term.keyPress(evKeyPress), false);
            term.reset();
            chai_1.assert.equal(term.keyDown(evKeyDown), false);
            chai_1.assert.equal(term.keyPress(evKeyPress), false);
        });
    });
    describe('clear', () => {
        it('should clear a buffer equal to rows', () => {
            const promptLine = term.buffer.lines.get(term.buffer.ybase + term.buffer.y);
            term.clear();
            chai_1.assert.equal(term.buffer.y, 0);
            chai_1.assert.equal(term.buffer.ybase, 0);
            chai_1.assert.equal(term.buffer.ydisp, 0);
            chai_1.assert.equal(term.buffer.lines.length, term.rows);
            chai_1.assert.deepEqual(term.buffer.lines.get(0), promptLine);
            for (let i = 1; i < term.rows; i++) {
                chai_1.assert.deepEqual(term.buffer.lines.get(i), term.buffer.getBlankLine(BufferLine_1.DEFAULT_ATTR_DATA));
            }
        });
        it('should clear a buffer larger than rows', async () => {
            for (let i = 0; i < term.rows * 2; i++) {
                await term.writeP('test\n');
            }
            const promptLine = term.buffer.lines.get(term.buffer.ybase + term.buffer.y);
            term.clear();
            chai_1.assert.equal(term.buffer.y, 0);
            chai_1.assert.equal(term.buffer.ybase, 0);
            chai_1.assert.equal(term.buffer.ydisp, 0);
            chai_1.assert.equal(term.buffer.lines.length, term.rows);
            chai_1.assert.deepEqual(term.buffer.lines.get(0), promptLine);
            for (let i = 1; i < term.rows; i++) {
                chai_1.assert.deepEqual(term.buffer.lines.get(i), term.buffer.getBlankLine(BufferLine_1.DEFAULT_ATTR_DATA));
            }
        });
        it('should not break the prompt when cleared twice', () => {
            const promptLine = term.buffer.lines.get(term.buffer.ybase + term.buffer.y);
            term.clear();
            term.clear();
            chai_1.assert.equal(term.buffer.y, 0);
            chai_1.assert.equal(term.buffer.ybase, 0);
            chai_1.assert.equal(term.buffer.ydisp, 0);
            chai_1.assert.equal(term.buffer.lines.length, term.rows);
            chai_1.assert.deepEqual(term.buffer.lines.get(0), promptLine);
            for (let i = 1; i < term.rows; i++) {
                chai_1.assert.deepEqual(term.buffer.lines.get(i), term.buffer.getBlankLine(BufferLine_1.DEFAULT_ATTR_DATA));
            }
        });
    });
    describe('paste', () => {
        it('should fire data event', done => {
            term.onData(e => {
                chai_1.assert.equal(e, 'foo');
                done();
            });
            term.paste('foo');
        });
        it('should sanitize \\n chars', done => {
            term.onData(e => {
                chai_1.assert.equal(e, '\rfoo\rbar\r');
                done();
            });
            term.paste('\r\nfoo\nbar\r');
        });
        it('should respect bracketed paste mode', () => {
            return new Promise(async (r) => {
                term.onData(e => {
                    chai_1.assert.equal(e, '\x1b[200~foo\x1b[201~');
                    r();
                });
                await term.writeP('\x1b[?2004h');
                term.paste('foo');
            });
        });
    });
    describe('scroll', () => {
        describe('scrollLines', () => {
            let startYDisp;
            beforeEach(async () => {
                for (let i = 0; i < INIT_ROWS * 2; i++) {
                    await term.writeP('test\r\n');
                }
                startYDisp = INIT_ROWS + 1;
            });
            it('should scroll a single line', () => {
                chai_1.assert.equal(term.buffer.ydisp, startYDisp);
                term.scrollLines(-1);
                chai_1.assert.equal(term.buffer.ydisp, startYDisp - 1);
                term.scrollLines(1);
                chai_1.assert.equal(term.buffer.ydisp, startYDisp);
            });
            it('should scroll multiple lines', () => {
                chai_1.assert.equal(term.buffer.ydisp, startYDisp);
                term.scrollLines(-5);
                chai_1.assert.equal(term.buffer.ydisp, startYDisp - 5);
                term.scrollLines(5);
                chai_1.assert.equal(term.buffer.ydisp, startYDisp);
            });
            it('should not scroll beyond the bounds of the buffer', () => {
                chai_1.assert.equal(term.buffer.ydisp, startYDisp);
                term.scrollLines(1);
                chai_1.assert.equal(term.buffer.ydisp, startYDisp);
                for (let i = 0; i < startYDisp; i++) {
                    term.scrollLines(-1);
                }
                chai_1.assert.equal(term.buffer.ydisp, 0);
                term.scrollLines(-1);
                chai_1.assert.equal(term.buffer.ydisp, 0);
            });
        });
        describe('scrollPages', () => {
            let startYDisp;
            beforeEach(async () => {
                for (let i = 0; i < term.rows * 3; i++) {
                    await term.writeP('test\r\n');
                }
                startYDisp = (term.rows * 2) + 1;
            });
            it('should scroll a single page', () => {
                chai_1.assert.equal(term.buffer.ydisp, startYDisp);
                term.scrollPages(-1);
                chai_1.assert.equal(term.buffer.ydisp, startYDisp - (term.rows - 1));
                term.scrollPages(1);
                chai_1.assert.equal(term.buffer.ydisp, startYDisp);
            });
            it('should scroll a multiple pages', () => {
                chai_1.assert.equal(term.buffer.ydisp, startYDisp);
                term.scrollPages(-2);
                chai_1.assert.equal(term.buffer.ydisp, startYDisp - (term.rows - 1) * 2);
                term.scrollPages(2);
                chai_1.assert.equal(term.buffer.ydisp, startYDisp);
            });
        });
        describe('scrollToTop', () => {
            beforeEach(async () => {
                for (let i = 0; i < term.rows * 3; i++) {
                    await term.writeP('test\r\n');
                }
            });
            it('should scroll to the top', () => {
                chai_1.assert.notEqual(term.buffer.ydisp, 0);
                term.scrollToTop();
                chai_1.assert.equal(term.buffer.ydisp, 0);
            });
        });
        describe('scrollToBottom', () => {
            let startYDisp;
            beforeEach(async () => {
                for (let i = 0; i < term.rows * 3; i++) {
                    await term.writeP('test\r\n');
                }
                startYDisp = (term.rows * 2) + 1;
            });
            it('should scroll to the bottom', () => {
                term.scrollLines(-1);
                term.scrollToBottom();
                chai_1.assert.equal(term.buffer.ydisp, startYDisp);
                term.scrollPages(-1);
                term.scrollToBottom();
                chai_1.assert.equal(term.buffer.ydisp, startYDisp);
                term.scrollToTop();
                term.scrollToBottom();
                chai_1.assert.equal(term.buffer.ydisp, startYDisp);
            });
        });
        describe('scrollToLine', () => {
            let startYDisp;
            beforeEach(async () => {
                for (let i = 0; i < term.rows * 3; i++) {
                    await term.writeP('test\r\n');
                }
                startYDisp = (term.rows * 2) + 1;
            });
            it('should scroll to requested line', () => {
                chai_1.assert.equal(term.buffer.ydisp, startYDisp);
                term.scrollToLine(0);
                chai_1.assert.equal(term.buffer.ydisp, 0);
                term.scrollToLine(10);
                chai_1.assert.equal(term.buffer.ydisp, 10);
                term.scrollToLine(startYDisp);
                chai_1.assert.equal(term.buffer.ydisp, startYDisp);
                term.scrollToLine(20);
                chai_1.assert.equal(term.buffer.ydisp, 20);
            });
            it('should not scroll beyond boundary lines', () => {
                chai_1.assert.equal(term.buffer.ydisp, startYDisp);
                term.scrollToLine(-1);
                chai_1.assert.equal(term.buffer.ydisp, 0);
                term.scrollToLine(startYDisp + 1);
                chai_1.assert.equal(term.buffer.ydisp, startYDisp);
            });
        });
        describe('keyPress', () => {
            it('should scroll down, when a key is pressed and terminal is scrolled up', () => {
                const event = {
                    type: 'keydown',
                    key: 'a',
                    keyCode: 65,
                    preventDefault: () => { },
                    stopPropagation: () => { }
                };
                term.buffer.ydisp = 0;
                term.buffer.ybase = 40;
                term.keyPress(event);
                chai_1.assert.equal(term.buffer.ydisp, term.buffer.ybase);
            });
            it('should not scroll down, when a custom keydown handler prevents the event', async () => {
                for (let i = 0; i < term.rows * 3; i++) {
                    await term.writeP('test\r\n');
                }
                const startYDisp = (term.rows * 2) + 1;
                term.attachCustomKeyEventHandler(() => {
                    return false;
                });
                chai_1.assert.equal(term.buffer.ydisp, startYDisp);
                term.scrollLines(-1);
                chai_1.assert.equal(term.buffer.ydisp, startYDisp - 1);
                term.keyPress({ keyCode: 0 });
                chai_1.assert.equal(term.buffer.ydisp, startYDisp - 1);
            });
        });
        describe('scroll() function', () => {
            describe('when scrollback > 0', () => {
                it('should create a new line and scroll', () => {
                    term.buffer.lines.get(0).setCell(0, CellData_1.CellData.fromCharData([0, 'a', 0, 'a'.charCodeAt(0)]));
                    term.buffer.lines.get(INIT_ROWS - 1).setCell(0, CellData_1.CellData.fromCharData([0, 'b', 0, 'b'.charCodeAt(0)]));
                    term.buffer.y = INIT_ROWS - 1;
                    term.scroll(BufferLine_1.DEFAULT_ATTR_DATA.clone());
                    chai_1.assert.equal(term.buffer.lines.length, INIT_ROWS + 1);
                    chai_1.assert.equal(term.buffer.lines.get(0).loadCell(0, new CellData_1.CellData()).getChars(), 'a');
                    chai_1.assert.equal(term.buffer.lines.get(INIT_ROWS - 1).loadCell(0, new CellData_1.CellData()).getChars(), 'b');
                    chai_1.assert.equal(term.buffer.lines.get(INIT_ROWS).loadCell(0, new CellData_1.CellData()).getChars(), '');
                });
                it('should properly scroll inside a scroll region (scrollTop set)', () => {
                    term.buffer.lines.get(0).setCell(0, CellData_1.CellData.fromCharData([0, 'a', 0, 'a'.charCodeAt(0)]));
                    term.buffer.lines.get(1).setCell(0, CellData_1.CellData.fromCharData([0, 'b', 0, 'b'.charCodeAt(0)]));
                    term.buffer.lines.get(2).setCell(0, CellData_1.CellData.fromCharData([0, 'c', 0, 'c'.charCodeAt(0)]));
                    term.buffer.y = INIT_ROWS - 1;
                    term.buffer.scrollTop = 1;
                    term.scroll(BufferLine_1.DEFAULT_ATTR_DATA.clone());
                    chai_1.assert.equal(term.buffer.lines.length, INIT_ROWS);
                    chai_1.assert.equal(term.buffer.lines.get(0).loadCell(0, new CellData_1.CellData()).getChars(), 'a');
                    chai_1.assert.equal(term.buffer.lines.get(1).loadCell(0, new CellData_1.CellData()).getChars(), 'c');
                });
                it('should properly scroll inside a scroll region (scrollBottom set)', () => {
                    term.buffer.lines.get(0).setCell(0, CellData_1.CellData.fromCharData([0, 'a', 0, 'a'.charCodeAt(0)]));
                    term.buffer.lines.get(1).setCell(0, CellData_1.CellData.fromCharData([0, 'b', 0, 'b'.charCodeAt(0)]));
                    term.buffer.lines.get(2).setCell(0, CellData_1.CellData.fromCharData([0, 'c', 0, 'c'.charCodeAt(0)]));
                    term.buffer.lines.get(3).setCell(0, CellData_1.CellData.fromCharData([0, 'd', 0, 'd'.charCodeAt(0)]));
                    term.buffer.lines.get(4).setCell(0, CellData_1.CellData.fromCharData([0, 'e', 0, 'e'.charCodeAt(0)]));
                    term.buffer.y = 3;
                    term.buffer.scrollBottom = 3;
                    term.scroll(BufferLine_1.DEFAULT_ATTR_DATA.clone());
                    chai_1.assert.equal(term.buffer.lines.length, INIT_ROWS + 1);
                    chai_1.assert.equal(term.buffer.lines.get(0).loadCell(0, new CellData_1.CellData()).getChars(), 'a', '\'a\' should be pushed to the scrollback');
                    chai_1.assert.equal(term.buffer.lines.get(1).loadCell(0, new CellData_1.CellData()).getChars(), 'b');
                    chai_1.assert.equal(term.buffer.lines.get(2).loadCell(0, new CellData_1.CellData()).getChars(), 'c');
                    chai_1.assert.equal(term.buffer.lines.get(3).loadCell(0, new CellData_1.CellData()).getChars(), 'd');
                    chai_1.assert.equal(term.buffer.lines.get(4).loadCell(0, new CellData_1.CellData()).getChars(), '', 'a blank line should be added at scrollBottom\'s index');
                    chai_1.assert.equal(term.buffer.lines.get(5).loadCell(0, new CellData_1.CellData()).getChars(), 'e');
                });
                it('should properly scroll inside a scroll region (scrollTop and scrollBottom set)', () => {
                    term.buffer.lines.get(0).setCell(0, CellData_1.CellData.fromCharData([0, 'a', 0, 'a'.charCodeAt(0)]));
                    term.buffer.lines.get(1).setCell(0, CellData_1.CellData.fromCharData([0, 'b', 0, 'b'.charCodeAt(0)]));
                    term.buffer.lines.get(2).setCell(0, CellData_1.CellData.fromCharData([0, 'c', 0, 'c'.charCodeAt(0)]));
                    term.buffer.lines.get(3).setCell(0, CellData_1.CellData.fromCharData([0, 'd', 0, 'd'.charCodeAt(0)]));
                    term.buffer.lines.get(4).setCell(0, CellData_1.CellData.fromCharData([0, 'e', 0, 'e'.charCodeAt(0)]));
                    term.buffer.y = INIT_ROWS - 1;
                    term.buffer.scrollTop = 1;
                    term.buffer.scrollBottom = 3;
                    term.scroll(BufferLine_1.DEFAULT_ATTR_DATA.clone());
                    chai_1.assert.equal(term.buffer.lines.length, INIT_ROWS);
                    chai_1.assert.equal(term.buffer.lines.get(0).loadCell(0, new CellData_1.CellData()).getChars(), 'a');
                    chai_1.assert.equal(term.buffer.lines.get(1).loadCell(0, new CellData_1.CellData()).getChars(), 'c', '\'b\' should be removed from the buffer');
                    chai_1.assert.equal(term.buffer.lines.get(2).loadCell(0, new CellData_1.CellData()).getChars(), 'd');
                    chai_1.assert.equal(term.buffer.lines.get(3).loadCell(0, new CellData_1.CellData()).getChars(), '', 'a blank line should be added at scrollBottom\'s index');
                    chai_1.assert.equal(term.buffer.lines.get(4).loadCell(0, new CellData_1.CellData()).getChars(), 'e');
                });
            });
            describe('when scrollback === 0', () => {
                beforeEach(() => {
                    term.optionsService.options.scrollback = 0;
                    chai_1.assert.equal(term.buffer.lines.maxLength, INIT_ROWS);
                });
                it('should create a new line and shift everything up', () => {
                    term.buffer.lines.get(0).setCell(0, CellData_1.CellData.fromCharData([0, 'a', 0, 'a'.charCodeAt(0)]));
                    term.buffer.lines.get(1).setCell(0, CellData_1.CellData.fromCharData([0, 'b', 0, 'b'.charCodeAt(0)]));
                    term.buffer.lines.get(INIT_ROWS - 1).setCell(0, CellData_1.CellData.fromCharData([0, 'c', 0, 'c'.charCodeAt(0)]));
                    term.buffer.y = INIT_ROWS - 1;
                    chai_1.assert.equal(term.buffer.lines.length, INIT_ROWS);
                    term.scroll(BufferLine_1.DEFAULT_ATTR_DATA.clone());
                    chai_1.assert.equal(term.buffer.lines.length, INIT_ROWS);
                    chai_1.assert.equal(term.buffer.lines.get(0).loadCell(0, new CellData_1.CellData()).getChars(), 'b');
                    chai_1.assert.equal(term.buffer.lines.get(1).loadCell(0, new CellData_1.CellData()).getChars(), '');
                    chai_1.assert.equal(term.buffer.lines.get(INIT_ROWS - 2).loadCell(0, new CellData_1.CellData()).getChars(), 'c');
                    chai_1.assert.equal(term.buffer.lines.get(INIT_ROWS - 1).loadCell(0, new CellData_1.CellData()).getChars(), '');
                });
                it('should properly scroll inside a scroll region (scrollTop set)', () => {
                    term.buffer.lines.get(0).setCell(0, CellData_1.CellData.fromCharData([0, 'a', 0, 'a'.charCodeAt(0)]));
                    term.buffer.lines.get(1).setCell(0, CellData_1.CellData.fromCharData([0, 'b', 0, 'b'.charCodeAt(0)]));
                    term.buffer.lines.get(2).setCell(0, CellData_1.CellData.fromCharData([0, 'c', 0, 'c'.charCodeAt(0)]));
                    term.buffer.y = INIT_ROWS - 1;
                    term.buffer.scrollTop = 1;
                    term.scroll(BufferLine_1.DEFAULT_ATTR_DATA.clone());
                    chai_1.assert.equal(term.buffer.lines.length, INIT_ROWS);
                    chai_1.assert.equal(term.buffer.lines.get(0).loadCell(0, new CellData_1.CellData()).getChars(), 'a');
                    chai_1.assert.equal(term.buffer.lines.get(1).loadCell(0, new CellData_1.CellData()).getChars(), 'c');
                });
                it('should properly scroll inside a scroll region (scrollBottom set)', () => {
                    term.buffer.lines.get(0).setCell(0, CellData_1.CellData.fromCharData([0, 'a', 0, 'a'.charCodeAt(0)]));
                    term.buffer.lines.get(1).setCell(0, CellData_1.CellData.fromCharData([0, 'b', 0, 'b'.charCodeAt(0)]));
                    term.buffer.lines.get(2).setCell(0, CellData_1.CellData.fromCharData([0, 'c', 0, 'c'.charCodeAt(0)]));
                    term.buffer.lines.get(3).setCell(0, CellData_1.CellData.fromCharData([0, 'd', 0, 'd'.charCodeAt(0)]));
                    term.buffer.lines.get(4).setCell(0, CellData_1.CellData.fromCharData([0, 'e', 0, 'e'.charCodeAt(0)]));
                    term.buffer.y = 3;
                    term.buffer.scrollBottom = 3;
                    term.scroll(BufferLine_1.DEFAULT_ATTR_DATA.clone());
                    chai_1.assert.equal(term.buffer.lines.length, INIT_ROWS);
                    chai_1.assert.equal(term.buffer.lines.get(0).loadCell(0, new CellData_1.CellData()).getChars(), 'b');
                    chai_1.assert.equal(term.buffer.lines.get(1).loadCell(0, new CellData_1.CellData()).getChars(), 'c');
                    chai_1.assert.equal(term.buffer.lines.get(2).loadCell(0, new CellData_1.CellData()).getChars(), 'd');
                    chai_1.assert.equal(term.buffer.lines.get(3).loadCell(0, new CellData_1.CellData()).getChars(), '', 'a blank line should be added at scrollBottom\'s index');
                    chai_1.assert.equal(term.buffer.lines.get(4).loadCell(0, new CellData_1.CellData()).getChars(), 'e');
                });
                it('should properly scroll inside a scroll region (scrollTop and scrollBottom set)', () => {
                    term.buffer.lines.get(0).setCell(0, CellData_1.CellData.fromCharData([0, 'a', 0, 'a'.charCodeAt(0)]));
                    term.buffer.lines.get(1).setCell(0, CellData_1.CellData.fromCharData([0, 'b', 0, 'b'.charCodeAt(0)]));
                    term.buffer.lines.get(2).setCell(0, CellData_1.CellData.fromCharData([0, 'c', 0, 'c'.charCodeAt(0)]));
                    term.buffer.lines.get(3).setCell(0, CellData_1.CellData.fromCharData([0, 'd', 0, 'd'.charCodeAt(0)]));
                    term.buffer.lines.get(4).setCell(0, CellData_1.CellData.fromCharData([0, 'e', 0, 'e'.charCodeAt(0)]));
                    term.buffer.y = INIT_ROWS - 1;
                    term.buffer.scrollTop = 1;
                    term.buffer.scrollBottom = 3;
                    term.scroll(BufferLine_1.DEFAULT_ATTR_DATA.clone());
                    chai_1.assert.equal(term.buffer.lines.length, INIT_ROWS);
                    chai_1.assert.equal(term.buffer.lines.get(0).loadCell(0, new CellData_1.CellData()).getChars(), 'a');
                    chai_1.assert.equal(term.buffer.lines.get(1).loadCell(0, new CellData_1.CellData()).getChars(), 'c', '\'b\' should be removed from the buffer');
                    chai_1.assert.equal(term.buffer.lines.get(2).loadCell(0, new CellData_1.CellData()).getChars(), 'd');
                    chai_1.assert.equal(term.buffer.lines.get(3).loadCell(0, new CellData_1.CellData()).getChars(), '', 'a blank line should be added at scrollBottom\'s index');
                    chai_1.assert.equal(term.buffer.lines.get(4).loadCell(0, new CellData_1.CellData()).getChars(), 'e');
                });
            });
        });
    });
    describe('Third level shift', () => {
        let evKeyDown;
        let evKeyPress;
        beforeEach(() => {
            term.clearSelection = () => { };
            evKeyDown = {
                preventDefault: () => { },
                stopPropagation: () => { },
                type: 'keydown',
                altKey: null,
                keyCode: null
            };
            evKeyPress = {
                preventDefault: () => { },
                stopPropagation: () => { },
                type: 'keypress',
                altKey: null,
                charCode: null,
                keyCode: null
            };
        });
        describe('with macOptionIsMeta', () => {
            let originalIsMac;
            beforeEach(() => {
                originalIsMac = term.browser.isMac;
                term.options.macOptionIsMeta = true;
            });
            afterEach(() => term.browser.isMac = originalIsMac);
            it('should interfere with the alt key on keyDown', () => {
                evKeyDown.altKey = true;
                evKeyDown.keyCode = 81;
                chai_1.assert.equal(term.keyDown(evKeyDown), false);
                evKeyDown.altKey = true;
                evKeyDown.keyCode = 192;
                chai_1.assert.equal(term.keyDown(evKeyDown), false);
            });
        });
        describe('On Mac OS', () => {
            let originalIsMac;
            beforeEach(() => {
                originalIsMac = term.browser.isMac;
                term.browser.isMac = true;
            });
            afterEach(() => term.browser.isMac = originalIsMac);
            it('should not interfere with the alt key on keyDown', () => {
                evKeyDown.altKey = true;
                evKeyDown.keyCode = 81;
                chai_1.assert.equal(term.keyDown(evKeyDown), true);
                evKeyDown.altKey = true;
                evKeyDown.keyCode = 192;
                term.keyDown(evKeyDown);
                chai_1.assert.equal(term.keyDown(evKeyDown), true);
            });
            it('should interfere with the alt + arrow keys', () => {
                evKeyDown.altKey = true;
                evKeyDown.keyCode = 37;
                chai_1.assert.equal(term.keyDown(evKeyDown), false);
                evKeyDown.altKey = true;
                evKeyDown.keyCode = 39;
                chai_1.assert.equal(term.keyDown(evKeyDown), false);
            });
            it('should emit key with alt + key on keyPress', (done) => {
                const keys = ['@', '@', '\\', '\\', '|', '|'];
                term.onKey(e => {
                    if (e.key) {
                        const index = keys.indexOf(e.key);
                        (0, chai_1.assert)(index !== -1, 'Emitted wrong key: ' + e.key);
                        keys.splice(index, 1);
                    }
                    if (keys.length === 0)
                        done();
                });
                evKeyPress.altKey = true;
                evKeyPress.charCode = null;
                evKeyPress.keyCode = 64;
                term.keyPress(evKeyPress);
                evKeyPress.charCode = 64;
                evKeyPress.keyCode = 0;
                term.keyPress(evKeyPress);
                evKeyPress.charCode = null;
                evKeyPress.keyCode = 92;
                term.keyPress(evKeyPress);
                evKeyPress.charCode = 92;
                evKeyPress.keyCode = 0;
                term.keyPress(evKeyPress);
                evKeyPress.charCode = null;
                evKeyPress.keyCode = 124;
                term.keyPress(evKeyPress);
                evKeyPress.charCode = 124;
                evKeyPress.keyCode = 0;
                term.keyPress(evKeyPress);
            });
        });
        describe('On MS Windows', () => {
            let originalIsWindows;
            beforeEach(() => {
                originalIsWindows = term.browser.isWindows;
                term.browser.isWindows = true;
            });
            afterEach(() => term.browser.isWindows = originalIsWindows);
            it('should not interfere with the alt + ctrl key on keyDown', () => {
                evKeyPress.altKey = true;
                evKeyPress.ctrlKey = true;
                evKeyPress.keyCode = 81;
                chai_1.assert.equal(term.keyDown(evKeyPress), true);
                evKeyDown.altKey = true;
                evKeyDown.ctrlKey = true;
                evKeyDown.keyCode = 81;
                term.keyDown(evKeyDown);
                chai_1.assert.equal(term.keyDown(evKeyPress), true);
            });
            it('should interfere with the alt + ctrl + arrow keys', () => {
                evKeyDown.altKey = true;
                evKeyDown.ctrlKey = true;
                evKeyDown.keyCode = 37;
                chai_1.assert.equal(term.keyDown(evKeyDown), false);
                evKeyDown.keyCode = 39;
                term.keyDown(evKeyDown);
                chai_1.assert.equal(term.keyDown(evKeyDown), false);
            });
            it('should emit key with alt + ctrl + key on keyPress', (done) => {
                const keys = ['@', '@', '\\', '\\', '|', '|'];
                term.onKey(e => {
                    if (e.key) {
                        const index = keys.indexOf(e.key);
                        (0, chai_1.assert)(index !== -1, 'Emitted wrong key: ' + e.key);
                        keys.splice(index, 1);
                    }
                    if (keys.length === 0)
                        done();
                });
                evKeyPress.altKey = true;
                evKeyPress.ctrlKey = true;
                evKeyPress.charCode = null;
                evKeyPress.keyCode = 64;
                term.keyPress(evKeyPress);
                evKeyPress.charCode = 64;
                evKeyPress.keyCode = 0;
                term.keyPress(evKeyPress);
                evKeyPress.charCode = null;
                evKeyPress.keyCode = 92;
                term.keyPress(evKeyPress);
                evKeyPress.charCode = 92;
                evKeyPress.keyCode = 0;
                term.keyPress(evKeyPress);
                evKeyPress.charCode = null;
                evKeyPress.keyCode = 124;
                term.keyPress(evKeyPress);
                evKeyPress.charCode = 124;
                evKeyPress.keyCode = 0;
                term.keyPress(evKeyPress);
            });
        });
    });
    describe('unicode - surrogates', () => {
        for (let i = 0xDC00; i <= 0xDCF0; i += 0x10) {
            const range = `0x${i.toString(16).toUpperCase()}-0x${(i + 0xF).toString(16).toUpperCase()}`;
            it(`${range}: 2 characters per cell`, async function () {
                const high = String.fromCharCode(0xD800);
                const cell = new CellData_1.CellData();
                for (let j = i; j <= i + 0xF; j++) {
                    await term.writeP(high + String.fromCharCode(j));
                    const tchar = term.buffer.lines.get(0).loadCell(0, cell);
                    chai_1.assert.equal(tchar.getChars(), high + String.fromCharCode(j));
                    chai_1.assert.equal(tchar.getChars().length, 2);
                    chai_1.assert.equal(tchar.getWidth(), 1);
                    chai_1.assert.equal(term.buffer.lines.get(0).loadCell(1, cell).getChars(), '');
                    term.reset();
                }
            });
            it(`${range}: 2 characters at last cell`, async () => {
                const high = String.fromCharCode(0xD800);
                const cell = new CellData_1.CellData();
                term.buffer.x = term.cols - 1;
                for (let j = i; j <= i + 0xF; j++) {
                    await term.writeP(high + String.fromCharCode(j));
                    chai_1.assert.equal(term.buffer.lines.get(0).loadCell(term.buffer.x - 1, cell).getChars(), high + String.fromCharCode(j));
                    chai_1.assert.equal(term.buffer.lines.get(0).loadCell(term.buffer.x - 1, cell).getChars().length, 2);
                    chai_1.assert.equal(term.buffer.lines.get(1).loadCell(0, cell).getChars(), '');
                    term.reset();
                }
            });
            it(`${range}: 2 characters per cell over line end with autowrap`, async function () {
                const high = String.fromCharCode(0xD800);
                const cell = new CellData_1.CellData();
                for (let j = i; j <= i + 0xF; j++) {
                    term.buffer.x = term.cols - 1;
                    await term.writeP('a' + high + String.fromCharCode(j));
                    chai_1.assert.equal(term.buffer.lines.get(0).loadCell(term.cols - 1, cell).getChars(), 'a');
                    chai_1.assert.equal(term.buffer.lines.get(1).loadCell(0, cell).getChars(), high + String.fromCharCode(j));
                    chai_1.assert.equal(term.buffer.lines.get(1).loadCell(0, cell).getChars().length, 2);
                    chai_1.assert.equal(term.buffer.lines.get(1).loadCell(1, cell).getChars(), '');
                    term.reset();
                }
            });
            it(`${range}: 2 characters per cell over line end without autowrap`, async function () {
                const high = String.fromCharCode(0xD800);
                const cell = new CellData_1.CellData();
                for (let j = i; j <= i + 0xF; j++) {
                    term.buffer.x = term.cols - 1;
                    await term.writeP('\x1b[?7l');
                    const width = wcwidth((0xD800 - 0xD800) * 0x400 + j - 0xDC00 + 0x10000);
                    if (width !== 1) {
                        continue;
                    }
                    await term.writeP('a' + high + String.fromCharCode(j));
                    chai_1.assert.equal(term.buffer.lines.get(0).loadCell(term.cols - 1, cell).getChars(), high + String.fromCharCode(j));
                    chai_1.assert.equal(term.buffer.lines.get(0).loadCell(term.cols - 1, cell).getChars().length, 2);
                    chai_1.assert.equal(term.buffer.lines.get(1).loadCell(1, cell).getChars(), '');
                    term.reset();
                }
            });
            it(`${range}: splitted surrogates`, async function () {
                const high = String.fromCharCode(0xD800);
                const cell = new CellData_1.CellData();
                for (let j = i; j <= i + 0xF; j++) {
                    await term.writeP(high + String.fromCharCode(j));
                    const tchar = term.buffer.lines.get(0).loadCell(0, cell);
                    chai_1.assert.equal(tchar.getChars(), high + String.fromCharCode(j));
                    chai_1.assert.equal(tchar.getChars().length, 2);
                    chai_1.assert.equal(tchar.getWidth(), 1);
                    chai_1.assert.equal(term.buffer.lines.get(0).loadCell(1, cell).getChars(), '');
                    term.reset();
                }
            });
        }
    });
    describe('unicode - combining characters', () => {
        const cell = new CellData_1.CellData();
        it('café', async () => {
            await term.writeP('cafe\u0301');
            term.buffer.lines.get(0).loadCell(3, cell);
            chai_1.assert.equal(cell.getChars(), 'e\u0301');
            chai_1.assert.equal(cell.getChars().length, 2);
            chai_1.assert.equal(cell.getWidth(), 1);
        });
        it('café - end of line', async () => {
            term.buffer.x = term.cols - 1 - 3;
            await term.writeP('cafe\u0301');
            term.buffer.lines.get(0).loadCell(term.cols - 1, cell);
            chai_1.assert.equal(cell.getChars(), 'e\u0301');
            chai_1.assert.equal(cell.getChars().length, 2);
            chai_1.assert.equal(cell.getWidth(), 1);
            term.buffer.lines.get(0).loadCell(1, cell);
            chai_1.assert.equal(cell.getChars(), '');
            chai_1.assert.equal(cell.getChars().length, 0);
            chai_1.assert.equal(cell.getWidth(), 1);
        });
        it('multiple combined é', async () => {
            await term.writeP(Array(100).join('e\u0301'));
            for (let i = 0; i < term.cols; ++i) {
                term.buffer.lines.get(0).loadCell(i, cell);
                chai_1.assert.equal(cell.getChars(), 'e\u0301');
                chai_1.assert.equal(cell.getChars().length, 2);
                chai_1.assert.equal(cell.getWidth(), 1);
            }
            term.buffer.lines.get(1).loadCell(0, cell);
            chai_1.assert.equal(cell.getChars(), 'e\u0301');
            chai_1.assert.equal(cell.getChars().length, 2);
            chai_1.assert.equal(cell.getWidth(), 1);
        });
        it('multiple surrogate with combined', async () => {
            await term.writeP(Array(100).join('\uD800\uDC00\u0301'));
            for (let i = 0; i < term.cols; ++i) {
                term.buffer.lines.get(0).loadCell(i, cell);
                chai_1.assert.equal(cell.getChars(), '\uD800\uDC00\u0301');
                chai_1.assert.equal(cell.getChars().length, 3);
                chai_1.assert.equal(cell.getWidth(), 1);
            }
            term.buffer.lines.get(1).loadCell(0, cell);
            chai_1.assert.equal(cell.getChars(), '\uD800\uDC00\u0301');
            chai_1.assert.equal(cell.getChars().length, 3);
            chai_1.assert.equal(cell.getWidth(), 1);
        });
    });
    describe('unicode - fullwidth characters', () => {
        const cell = new CellData_1.CellData();
        it('cursor movement even', async () => {
            chai_1.assert.equal(term.buffer.x, 0);
            await term.writeP('￥');
            chai_1.assert.equal(term.buffer.x, 2);
        });
        it('cursor movement odd', async () => {
            term.buffer.x = 1;
            chai_1.assert.equal(term.buffer.x, 1);
            await term.writeP('￥');
            chai_1.assert.equal(term.buffer.x, 3);
        });
        it('line of ￥ even', async () => {
            await term.writeP(Array(50).join('￥'));
            for (let i = 0; i < term.cols; ++i) {
                term.buffer.lines.get(0).loadCell(i, cell);
                if (i % 2) {
                    chai_1.assert.equal(cell.getChars(), '');
                    chai_1.assert.equal(cell.getChars().length, 0);
                    chai_1.assert.equal(cell.getWidth(), 0);
                }
                else {
                    chai_1.assert.equal(cell.getChars(), '￥');
                    chai_1.assert.equal(cell.getChars().length, 1);
                    chai_1.assert.equal(cell.getWidth(), 2);
                }
            }
            term.buffer.lines.get(1).loadCell(0, cell);
            chai_1.assert.equal(cell.getChars(), '￥');
            chai_1.assert.equal(cell.getChars().length, 1);
            chai_1.assert.equal(cell.getWidth(), 2);
        });
        it('line of ￥ odd', async () => {
            term.buffer.x = 1;
            await term.writeP(Array(50).join('￥'));
            for (let i = 1; i < term.cols - 1; ++i) {
                term.buffer.lines.get(0).loadCell(i, cell);
                if (!(i % 2)) {
                    chai_1.assert.equal(cell.getChars(), '');
                    chai_1.assert.equal(cell.getChars().length, 0);
                    chai_1.assert.equal(cell.getWidth(), 0);
                }
                else {
                    chai_1.assert.equal(cell.getChars(), '￥');
                    chai_1.assert.equal(cell.getChars().length, 1);
                    chai_1.assert.equal(cell.getWidth(), 2);
                }
            }
            term.buffer.lines.get(0).loadCell(term.cols - 1, cell);
            chai_1.assert.equal(cell.getChars(), '');
            chai_1.assert.equal(cell.getChars().length, 0);
            chai_1.assert.equal(cell.getWidth(), 1);
            term.buffer.lines.get(1).loadCell(0, cell);
            chai_1.assert.equal(cell.getChars(), '￥');
            chai_1.assert.equal(cell.getChars().length, 1);
            chai_1.assert.equal(cell.getWidth(), 2);
        });
        it('line of ￥ with combining odd', async () => {
            term.buffer.x = 1;
            await term.writeP(Array(50).join('￥\u0301'));
            for (let i = 1; i < term.cols - 1; ++i) {
                term.buffer.lines.get(0).loadCell(i, cell);
                if (!(i % 2)) {
                    chai_1.assert.equal(cell.getChars(), '');
                    chai_1.assert.equal(cell.getChars().length, 0);
                    chai_1.assert.equal(cell.getWidth(), 0);
                }
                else {
                    chai_1.assert.equal(cell.getChars(), '￥\u0301');
                    chai_1.assert.equal(cell.getChars().length, 2);
                    chai_1.assert.equal(cell.getWidth(), 2);
                }
            }
            term.buffer.lines.get(0).loadCell(term.cols - 1, cell);
            chai_1.assert.equal(cell.getChars(), '');
            chai_1.assert.equal(cell.getChars().length, 0);
            chai_1.assert.equal(cell.getWidth(), 1);
            term.buffer.lines.get(1).loadCell(0, cell);
            chai_1.assert.equal(cell.getChars(), '￥\u0301');
            chai_1.assert.equal(cell.getChars().length, 2);
            chai_1.assert.equal(cell.getWidth(), 2);
        });
        it('line of ￥ with combining even', async () => {
            await term.writeP(Array(50).join('￥\u0301'));
            for (let i = 0; i < term.cols; ++i) {
                term.buffer.lines.get(0).loadCell(i, cell);
                if (i % 2) {
                    chai_1.assert.equal(cell.getChars(), '');
                    chai_1.assert.equal(cell.getChars().length, 0);
                    chai_1.assert.equal(cell.getWidth(), 0);
                }
                else {
                    chai_1.assert.equal(cell.getChars(), '￥\u0301');
                    chai_1.assert.equal(cell.getChars().length, 2);
                    chai_1.assert.equal(cell.getWidth(), 2);
                }
            }
            term.buffer.lines.get(1).loadCell(0, cell);
            chai_1.assert.equal(cell.getChars(), '￥\u0301');
            chai_1.assert.equal(cell.getChars().length, 2);
            chai_1.assert.equal(cell.getWidth(), 2);
        });
        it('line of surrogate fullwidth with combining odd', async () => {
            term.buffer.x = 1;
            await term.writeP(Array(50).join('\ud843\ude6d\u0301'));
            for (let i = 1; i < term.cols - 1; ++i) {
                term.buffer.lines.get(0).loadCell(i, cell);
                if (!(i % 2)) {
                    chai_1.assert.equal(cell.getChars(), '');
                    chai_1.assert.equal(cell.getChars().length, 0);
                    chai_1.assert.equal(cell.getWidth(), 0);
                }
                else {
                    chai_1.assert.equal(cell.getChars(), '\ud843\ude6d\u0301');
                    chai_1.assert.equal(cell.getChars().length, 3);
                    chai_1.assert.equal(cell.getWidth(), 2);
                }
            }
            term.buffer.lines.get(0).loadCell(term.cols - 1, cell);
            chai_1.assert.equal(cell.getChars(), '');
            chai_1.assert.equal(cell.getChars().length, 0);
            chai_1.assert.equal(cell.getWidth(), 1);
            term.buffer.lines.get(1).loadCell(0, cell);
            chai_1.assert.equal(cell.getChars(), '\ud843\ude6d\u0301');
            chai_1.assert.equal(cell.getChars().length, 3);
            chai_1.assert.equal(cell.getWidth(), 2);
        });
        it('line of surrogate fullwidth with combining even', async () => {
            await term.writeP(Array(50).join('\ud843\ude6d\u0301'));
            for (let i = 0; i < term.cols; ++i) {
                term.buffer.lines.get(0).loadCell(i, cell);
                if (i % 2) {
                    chai_1.assert.equal(cell.getChars(), '');
                    chai_1.assert.equal(cell.getChars().length, 0);
                    chai_1.assert.equal(cell.getWidth(), 0);
                }
                else {
                    chai_1.assert.equal(cell.getChars(), '\ud843\ude6d\u0301');
                    chai_1.assert.equal(cell.getChars().length, 3);
                    chai_1.assert.equal(cell.getWidth(), 2);
                }
            }
            term.buffer.lines.get(1).loadCell(0, cell);
            chai_1.assert.equal(cell.getChars(), '\ud843\ude6d\u0301');
            chai_1.assert.equal(cell.getChars().length, 3);
            chai_1.assert.equal(cell.getWidth(), 2);
        });
    });
    describe('insert mode', () => {
        const cell = new CellData_1.CellData();
        it('halfwidth - all', async () => {
            await term.writeP(Array(9).join('0123456789').slice(-80));
            term.buffer.x = 10;
            term.buffer.y = 0;
            term.write('\x1b[4h');
            await term.writeP('abcde');
            chai_1.assert.equal(term.buffer.lines.get(0).length, term.cols);
            chai_1.assert.equal(term.buffer.lines.get(0).loadCell(10, cell).getChars(), 'a');
            chai_1.assert.equal(term.buffer.lines.get(0).loadCell(14, cell).getChars(), 'e');
            chai_1.assert.equal(term.buffer.lines.get(0).loadCell(15, cell).getChars(), '0');
            chai_1.assert.equal(term.buffer.lines.get(0).loadCell(79, cell).getChars(), '4');
        });
        it('fullwidth - insert', async () => {
            await term.writeP(Array(9).join('0123456789').slice(-80));
            term.buffer.x = 10;
            term.buffer.y = 0;
            term.write('\x1b[4h');
            await term.writeP('￥￥￥');
            chai_1.assert.equal(term.buffer.lines.get(0).length, term.cols);
            chai_1.assert.equal(term.buffer.lines.get(0).loadCell(10, cell).getChars(), '￥');
            chai_1.assert.equal(term.buffer.lines.get(0).loadCell(11, cell).getChars(), '');
            chai_1.assert.equal(term.buffer.lines.get(0).loadCell(14, cell).getChars(), '￥');
            chai_1.assert.equal(term.buffer.lines.get(0).loadCell(15, cell).getChars(), '');
            chai_1.assert.equal(term.buffer.lines.get(0).loadCell(79, cell).getChars(), '3');
        });
        it('fullwidth - right border', async () => {
            await term.writeP(Array(41).join('￥'));
            term.buffer.x = 10;
            term.buffer.y = 0;
            term.write('\x1b[4h');
            await term.writeP('a');
            chai_1.assert.equal(term.buffer.lines.get(0).length, term.cols);
            chai_1.assert.equal(term.buffer.lines.get(0).loadCell(10, cell).getChars(), 'a');
            chai_1.assert.equal(term.buffer.lines.get(0).loadCell(11, cell).getChars(), '￥');
            chai_1.assert.equal(term.buffer.lines.get(0).loadCell(79, cell).getChars(), '');
            await term.writeP('b');
            chai_1.assert.equal(term.buffer.lines.get(0).length, term.cols);
            chai_1.assert.equal(term.buffer.lines.get(0).loadCell(11, cell).getChars(), 'b');
            chai_1.assert.equal(term.buffer.lines.get(0).loadCell(12, cell).getChars(), '￥');
            chai_1.assert.equal(term.buffer.lines.get(0).loadCell(79, cell).getChars(), '');
        });
    });
    describe('Windows Pty', () => {
        it('should mark lines as wrapped when the line ends in a non-null character after a LF', async () => {
            const data = [
                'aaaaaaaaaa\n\r',
                'aaaaaaaaa\n\r',
                'aaaaaaaaa'
            ];
            const normalTerminal = new TestUtils_test_1.TestTerminal({ rows: 5, cols: 10, windowsPty: {} });
            await normalTerminal.writeP(data.join(''));
            chai_1.assert.equal(normalTerminal.buffer.lines.get(0).isWrapped, false);
            chai_1.assert.equal(normalTerminal.buffer.lines.get(1).isWrapped, false);
            chai_1.assert.equal(normalTerminal.buffer.lines.get(2).isWrapped, false);
            const windowsModeTerminal = new TestUtils_test_1.TestTerminal({ rows: 5, cols: 10, windowsPty: { backend: 'conpty', buildNumber: 19000 } });
            await windowsModeTerminal.writeP(data.join(''));
            chai_1.assert.equal(windowsModeTerminal.buffer.lines.get(0).isWrapped, false);
            chai_1.assert.equal(windowsModeTerminal.buffer.lines.get(1).isWrapped, true, 'This line should wrap in Windows mode as the previous line ends in a non-null character');
            chai_1.assert.equal(windowsModeTerminal.buffer.lines.get(2).isWrapped, false);
        });
        it('should mark lines as wrapped when the line ends in a non-null character after a CUP', async () => {
            const data = [
                'aaaaaaaaaa\x1b[2;1H',
                'aaaaaaaaa\x1b[3;1H',
                'aaaaaaaaa'
            ];
            const normalTerminal = new TestUtils_test_1.TestTerminal({ rows: 5, cols: 10, windowsPty: {} });
            await normalTerminal.writeP(data.join(''));
            chai_1.assert.equal(normalTerminal.buffer.lines.get(0).isWrapped, false);
            chai_1.assert.equal(normalTerminal.buffer.lines.get(1).isWrapped, false);
            chai_1.assert.equal(normalTerminal.buffer.lines.get(2).isWrapped, false);
            const windowsModeTerminal = new TestUtils_test_1.TestTerminal({ rows: 5, cols: 10, windowsPty: { backend: 'conpty', buildNumber: 19000 } });
            await windowsModeTerminal.writeP(data.join(''));
            chai_1.assert.equal(windowsModeTerminal.buffer.lines.get(0).isWrapped, false);
            chai_1.assert.equal(windowsModeTerminal.buffer.lines.get(1).isWrapped, true, 'This line should wrap in Windows mode as the previous line ends in a non-null character');
            chai_1.assert.equal(windowsModeTerminal.buffer.lines.get(2).isWrapped, false);
        });
    });
    describe('Windows Mode', () => {
        it('should mark lines as wrapped when the line ends in a non-null character after a LF', async () => {
            const data = [
                'aaaaaaaaaa\n\r',
                'aaaaaaaaa\n\r',
                'aaaaaaaaa'
            ];
            const normalTerminal = new TestUtils_test_1.TestTerminal({ rows: 5, cols: 10, windowsMode: false });
            await normalTerminal.writeP(data.join(''));
            chai_1.assert.equal(normalTerminal.buffer.lines.get(0).isWrapped, false);
            chai_1.assert.equal(normalTerminal.buffer.lines.get(1).isWrapped, false);
            chai_1.assert.equal(normalTerminal.buffer.lines.get(2).isWrapped, false);
            const windowsModeTerminal = new TestUtils_test_1.TestTerminal({ rows: 5, cols: 10, windowsMode: true });
            await windowsModeTerminal.writeP(data.join(''));
            chai_1.assert.equal(windowsModeTerminal.buffer.lines.get(0).isWrapped, false);
            chai_1.assert.equal(windowsModeTerminal.buffer.lines.get(1).isWrapped, true, 'This line should wrap in Windows mode as the previous line ends in a non-null character');
            chai_1.assert.equal(windowsModeTerminal.buffer.lines.get(2).isWrapped, false);
        });
        it('should mark lines as wrapped when the line ends in a non-null character after a CUP', async () => {
            const data = [
                'aaaaaaaaaa\x1b[2;1H',
                'aaaaaaaaa\x1b[3;1H',
                'aaaaaaaaa'
            ];
            const normalTerminal = new TestUtils_test_1.TestTerminal({ rows: 5, cols: 10, windowsMode: false });
            await normalTerminal.writeP(data.join(''));
            chai_1.assert.equal(normalTerminal.buffer.lines.get(0).isWrapped, false);
            chai_1.assert.equal(normalTerminal.buffer.lines.get(1).isWrapped, false);
            chai_1.assert.equal(normalTerminal.buffer.lines.get(2).isWrapped, false);
            const windowsModeTerminal = new TestUtils_test_1.TestTerminal({ rows: 5, cols: 10, windowsMode: true });
            await windowsModeTerminal.writeP(data.join(''));
            chai_1.assert.equal(windowsModeTerminal.buffer.lines.get(0).isWrapped, false);
            chai_1.assert.equal(windowsModeTerminal.buffer.lines.get(1).isWrapped, true, 'This line should wrap in Windows mode as the previous line ends in a non-null character');
            chai_1.assert.equal(windowsModeTerminal.buffer.lines.get(2).isWrapped, false);
        });
    });
    it('convertEol setting', async () => {
        const termNotConverting = new TestUtils_test_1.TestTerminal({ cols: 15, rows: 10 });
        await termNotConverting.writeP('Hello\nWorld');
        chai_1.assert.equal(termNotConverting.buffer.lines.get(0).translateToString(false), 'Hello          ');
        chai_1.assert.equal(termNotConverting.buffer.lines.get(1).translateToString(false), '     World     ');
        chai_1.assert.equal(termNotConverting.buffer.lines.get(0).translateToString(true), 'Hello');
        chai_1.assert.equal(termNotConverting.buffer.lines.get(1).translateToString(true), '     World');
        const termConverting = new TestUtils_test_1.TestTerminal({ cols: 15, rows: 10, convertEol: true });
        await termConverting.writeP('Hello\nWorld');
        chai_1.assert.equal(termConverting.buffer.lines.get(0).translateToString(false), 'Hello          ');
        chai_1.assert.equal(termConverting.buffer.lines.get(1).translateToString(false), 'World          ');
        chai_1.assert.equal(termConverting.buffer.lines.get(0).translateToString(true), 'Hello');
        chai_1.assert.equal(termConverting.buffer.lines.get(1).translateToString(true), 'World');
    });
    describe('marker lifecycle', () => {
        let markers;
        let disposeStack;
        let term;
        beforeEach(async () => {
            term = new TestUtils_test_1.TestTerminal({});
            markers = [];
            disposeStack = [];
            term.optionsService.options.scrollback = 1;
            term.resize(10, 5);
            markers.push(term.buffers.active.addMarker(term.buffers.active.y));
            await term.writeP('\x1b[r0\r\n');
            markers.push(term.buffers.active.addMarker(term.buffers.active.y));
            await term.writeP('1\r\n');
            markers.push(term.buffers.active.addMarker(term.buffers.active.y));
            await term.writeP('2\r\n');
            markers.push(term.buffers.active.addMarker(term.buffers.active.y));
            await term.writeP('3\r\n');
            markers.push(term.buffers.active.addMarker(term.buffers.active.y));
            await term.writeP('4');
            for (let i = 0; i < markers.length; ++i) {
                const marker = markers[i];
                marker.onDispose(() => disposeStack.push(marker));
            }
        });
        it('initial', () => {
            chai_1.assert.deepEqual(markers.map(m => m.line), [0, 1, 2, 3, 4]);
        });
        it('should dispose on normal trim off the top', async () => {
            await term.writeP('\n');
            chai_1.assert.deepEqual(disposeStack, []);
            await term.writeP('\n');
            chai_1.assert.deepEqual(disposeStack, [markers[0]]);
            await term.writeP('\n');
            chai_1.assert.deepEqual(disposeStack, [markers[0], markers[1]]);
            chai_1.assert.deepEqual(disposeStack.map(el => el.isDisposed), [true, true]);
            chai_1.assert.deepEqual(disposeStack.map(el => el.line), [-1, -1]);
        });
        it('should dispose on DL', async () => {
            await term.writeP('\x1b[3;1H');
            await term.writeP('\x1b[2M');
            chai_1.assert.deepEqual(disposeStack, [markers[2], markers[3]]);
        });
        it('should dispose on IL', async () => {
            await term.writeP('\x1b[3;1H');
            await term.writeP('\x1b[2L');
            chai_1.assert.deepEqual(disposeStack, [markers[4], markers[3]]);
            chai_1.assert.deepEqual(markers.map(el => el.line), [0, 1, 4, -1, -1]);
        });
        it('should dispose on resize', () => {
            term.resize(10, 2);
            chai_1.assert.deepEqual(disposeStack, [markers[0], markers[1]]);
            chai_1.assert.deepEqual(markers.map(el => el.line), [-1, -1, 0, 1, 2]);
        });
    });
    describe('options', () => {
        beforeEach(async () => {
            term = new TestUtils_test_1.TestTerminal({});
        });
        it('get options', () => {
            chai_1.assert.equal(term.options.cols, 80);
            chai_1.assert.equal(term.options.rows, 24);
        });
        it('set options', async () => {
            term.options.cols = 40;
            chai_1.assert.equal(term.options.cols, 40);
            term.options.rows = 20;
            chai_1.assert.equal(term.options.rows, 20);
        });
    });
});
//# sourceMappingURL=Terminal.test.js.map