"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsdom = require("jsdom");
const chai_1 = require("chai");
const DomRendererRowFactory_1 = require("browser/renderer/dom/DomRendererRowFactory");
const Constants_1 = require("common/buffer/Constants");
const BufferLine_1 = require("common/buffer/BufferLine");
const CellData_1 = require("common/buffer/CellData");
const TestUtils_test_1 = require("common/TestUtils.test");
const TestUtils_test_2 = require("browser/TestUtils.test");
const WidthCache_test_1 = require("browser/renderer/dom/WidthCache.test");
const dom = new jsdom.JSDOM('');
const EMPTY_WIDTH = new WidthCache_test_1.TestWidthCache(dom.window.document, dom.window.document.createElement('div'));
describe('DomRendererRowFactory', () => {
    let dom;
    let rowFactory;
    let lineData;
    beforeEach(() => {
        dom = new jsdom.JSDOM('');
        rowFactory = new DomRendererRowFactory_1.DomRendererRowFactory(dom.window.document, new TestUtils_test_2.MockCharacterJoinerService(), new TestUtils_test_1.MockOptionsService({ drawBoldTextInBrightColors: true }), new TestUtils_test_2.MockCoreBrowserService(), new TestUtils_test_1.MockCoreService(), new TestUtils_test_1.MockDecorationService(), new TestUtils_test_2.MockThemeService());
        lineData = createEmptyLineData(2);
    });
    describe('createRow', () => {
        it('should not create anything for an empty row', () => {
            const spans = rowFactory.createRow(lineData, 0, false, undefined, undefined, 0, false, 5, EMPTY_WIDTH, -1, -1);
            chai_1.assert.equal(extractHtml(spans), '');
        });
        it('should set correct attributes for double width characters', () => {
            EMPTY_WIDTH.widths['語'] = [10, 10, 10, 10];
            lineData.setCell(0, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, '語', 2, '語'.charCodeAt(0)]));
            lineData.setCell(1, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, '', 0, 0]));
            const spans = rowFactory.createRow(lineData, 0, false, undefined, undefined, 0, false, 5, EMPTY_WIDTH, -1, -1);
            chai_1.assert.equal(extractHtml(spans), '<span>語</span>');
        });
        it('should add class for cursor and cursor style', () => {
            for (const style of ['block', 'bar', 'underline']) {
                const spans = rowFactory.createRow(lineData, 0, true, style, undefined, 0, false, 5, EMPTY_WIDTH, -1, -1);
                chai_1.assert.equal(extractHtml(spans), `<span class="xterm-cursor xterm-cursor-${style}"> </span>`);
            }
        });
        it('should add class for cursor blink', () => {
            const spans = rowFactory.createRow(lineData, 0, true, 'block', undefined, 0, true, 5, EMPTY_WIDTH, -1, -1);
            chai_1.assert.equal(extractHtml(spans), `<span class="xterm-cursor xterm-cursor-blink xterm-cursor-block"> </span>`);
        });
        it('should add class for inactive cursor', () => {
            const coreBrowserService = new TestUtils_test_2.MockCoreBrowserService();
            coreBrowserService.isFocused = false;
            const rowFactory = new DomRendererRowFactory_1.DomRendererRowFactory(dom.window.document, new TestUtils_test_2.MockCharacterJoinerService(), new TestUtils_test_1.MockOptionsService({ drawBoldTextInBrightColors: true }), coreBrowserService, new TestUtils_test_1.MockCoreService(), new TestUtils_test_1.MockDecorationService(), new TestUtils_test_2.MockThemeService());
            for (const inactiveStyle of ['outline', 'block', 'bar', 'underline', 'none']) {
                const spans = rowFactory.createRow(lineData, 0, true, 'block', inactiveStyle, 0, false, 5, EMPTY_WIDTH, -1, -1);
                if (inactiveStyle === 'none') {
                    chai_1.assert.equal(extractHtml(spans), `<span class="xterm-cursor"> </span>`);
                }
                else {
                    chai_1.assert.equal(extractHtml(spans), `<span class="xterm-cursor xterm-cursor-${inactiveStyle}"> </span>`);
                }
            }
        });
        it('should not display cursor for before initializing', () => {
            const coreService = new TestUtils_test_1.MockCoreService();
            coreService.isCursorInitialized = false;
            const rowFactory = new DomRendererRowFactory_1.DomRendererRowFactory(dom.window.document, new TestUtils_test_2.MockCharacterJoinerService(), new TestUtils_test_1.MockOptionsService(), new TestUtils_test_2.MockCoreBrowserService(), coreService, new TestUtils_test_1.MockDecorationService(), new TestUtils_test_2.MockThemeService());
            const spans = rowFactory.createRow(lineData, 0, true, 'block', undefined, 0, false, 5, EMPTY_WIDTH, -1, -1);
            chai_1.assert.equal(extractHtml(spans), `<span> </span>`);
        });
        describe('attributes', () => {
            it('should add class for bold', () => {
                const cell = CellData_1.CellData.fromCharData([0, 'a', 1, 'a'.charCodeAt(0)]);
                cell.fg = BufferLine_1.DEFAULT_ATTR_DATA.fg | 134217728;
                lineData.setCell(0, cell);
                const spans = rowFactory.createRow(lineData, 0, false, undefined, undefined, 0, false, 5, EMPTY_WIDTH, -1, -1);
                chai_1.assert.equal(extractHtml(spans), '<span class="xterm-bold">a</span>');
            });
            it('should add class for italic', () => {
                const cell = CellData_1.CellData.fromCharData([0, 'a', 1, 'a'.charCodeAt(0)]);
                cell.bg = BufferLine_1.DEFAULT_ATTR_DATA.bg | 67108864;
                lineData.setCell(0, cell);
                const spans = rowFactory.createRow(lineData, 0, false, undefined, undefined, 0, false, 5, EMPTY_WIDTH, -1, -1);
                chai_1.assert.equal(extractHtml(spans), '<span class="xterm-italic">a</span>');
            });
            it('should add class for dim', () => {
                const cell = CellData_1.CellData.fromCharData([0, 'a', 1, 'a'.charCodeAt(0)]);
                cell.bg = BufferLine_1.DEFAULT_ATTR_DATA.bg | 134217728;
                lineData.setCell(0, cell);
                const spans = rowFactory.createRow(lineData, 0, false, undefined, undefined, 0, false, 5, EMPTY_WIDTH, -1, -1);
                chai_1.assert.equal(extractHtml(spans), '<span class="xterm-dim">a</span>');
            });
            describe('underline', () => {
                it('should add class for straight underline style', () => {
                    const cell = CellData_1.CellData.fromCharData([0, 'a', 1, 'a'.charCodeAt(0)]);
                    cell.fg = BufferLine_1.DEFAULT_ATTR_DATA.fg | 268435456;
                    cell.bg = BufferLine_1.DEFAULT_ATTR_DATA.bg | 268435456;
                    cell.extended.underlineStyle = 1;
                    lineData.setCell(0, cell);
                    const spans = rowFactory.createRow(lineData, 0, false, undefined, undefined, 0, false, 5, EMPTY_WIDTH, -1, -1);
                    chai_1.assert.equal(extractHtml(spans), '<span class="xterm-underline-1">a</span>');
                });
                it('should add class for double underline style', () => {
                    const cell = CellData_1.CellData.fromCharData([0, 'a', 1, 'a'.charCodeAt(0)]);
                    cell.fg = BufferLine_1.DEFAULT_ATTR_DATA.fg | 268435456;
                    cell.bg = BufferLine_1.DEFAULT_ATTR_DATA.bg | 268435456;
                    cell.extended.underlineStyle = 2;
                    lineData.setCell(0, cell);
                    const spans = rowFactory.createRow(lineData, 0, false, undefined, undefined, 0, false, 5, EMPTY_WIDTH, -1, -1);
                    chai_1.assert.equal(extractHtml(spans), '<span class="xterm-underline-2">a</span>');
                });
                it('should add class for curly underline style', () => {
                    const cell = CellData_1.CellData.fromCharData([0, 'a', 1, 'a'.charCodeAt(0)]);
                    cell.fg = BufferLine_1.DEFAULT_ATTR_DATA.fg | 268435456;
                    cell.bg = BufferLine_1.DEFAULT_ATTR_DATA.bg | 268435456;
                    cell.extended.underlineStyle = 3;
                    lineData.setCell(0, cell);
                    const spans = rowFactory.createRow(lineData, 0, false, undefined, undefined, 0, false, 5, EMPTY_WIDTH, -1, -1);
                    chai_1.assert.equal(extractHtml(spans), '<span class="xterm-underline-3">a</span>');
                });
                it('should add class for double dotted style', () => {
                    const cell = CellData_1.CellData.fromCharData([0, 'a', 1, 'a'.charCodeAt(0)]);
                    cell.fg = BufferLine_1.DEFAULT_ATTR_DATA.fg | 268435456;
                    cell.bg = BufferLine_1.DEFAULT_ATTR_DATA.bg | 268435456;
                    cell.extended.underlineStyle = 4;
                    lineData.setCell(0, cell);
                    const spans = rowFactory.createRow(lineData, 0, false, undefined, undefined, 0, false, 5, EMPTY_WIDTH, -1, -1);
                    chai_1.assert.equal(extractHtml(spans), '<span class="xterm-underline-4">a</span>');
                });
                it('should add class for dashed underline style', () => {
                    const cell = CellData_1.CellData.fromCharData([0, 'a', 1, 'a'.charCodeAt(0)]);
                    cell.fg = BufferLine_1.DEFAULT_ATTR_DATA.fg | 268435456;
                    cell.bg = BufferLine_1.DEFAULT_ATTR_DATA.bg | 268435456;
                    cell.extended.underlineStyle = 5;
                    lineData.setCell(0, cell);
                    const spans = rowFactory.createRow(lineData, 0, false, undefined, undefined, 0, false, 5, EMPTY_WIDTH, -1, -1);
                    chai_1.assert.equal(extractHtml(spans), '<span class="xterm-underline-5">a</span>');
                });
            });
            it('should add class for overline', () => {
                const cell = CellData_1.CellData.fromCharData([0, 'a', 1, 'a'.charCodeAt(0)]);
                cell.bg = BufferLine_1.DEFAULT_ATTR_DATA.bg | 1073741824;
                lineData.setCell(0, cell);
                const spans = rowFactory.createRow(lineData, 0, false, undefined, undefined, 0, false, 5, EMPTY_WIDTH, -1, -1);
                chai_1.assert.equal(extractHtml(spans), '<span class="xterm-overline">a</span>');
            });
            it('should add class for strikethrough', () => {
                const cell = CellData_1.CellData.fromCharData([0, 'a', 1, 'a'.charCodeAt(0)]);
                cell.fg = BufferLine_1.DEFAULT_ATTR_DATA.fg | 2147483648;
                lineData.setCell(0, cell);
                const spans = rowFactory.createRow(lineData, 0, false, undefined, undefined, 0, false, 5, EMPTY_WIDTH, -1, -1);
                chai_1.assert.equal(extractHtml(spans), '<span class="xterm-strikethrough">a</span>');
            });
            it('should add classes for 256 foreground colors', () => {
                const cell = CellData_1.CellData.fromCharData([0, 'a', 1, 'a'.charCodeAt(0)]);
                cell.fg |= 33554432;
                for (let i = 0; i < 256; i++) {
                    cell.fg &= ~255;
                    cell.fg |= i;
                    lineData.setCell(0, cell);
                    const spans = rowFactory.createRow(lineData, 0, false, undefined, undefined, 0, false, 5, EMPTY_WIDTH, -1, -1);
                    chai_1.assert.equal(extractHtml(spans), `<span class="xterm-fg-${i}">a</span>`);
                }
            });
            it('should add classes for 256 background colors', () => {
                const cell = CellData_1.CellData.fromCharData([0, 'a', 1, 'a'.charCodeAt(0)]);
                cell.bg |= 33554432;
                for (let i = 0; i < 256; i++) {
                    cell.bg &= ~255;
                    cell.bg |= i;
                    lineData.setCell(0, cell);
                    const spans = rowFactory.createRow(lineData, 0, false, undefined, undefined, 0, false, 5, EMPTY_WIDTH, -1, -1);
                    chai_1.assert.equal(extractHtml(spans), `<span class="xterm-bg-${i}">a</span>`);
                }
            });
            it('should correctly invert colors', () => {
                const cell = CellData_1.CellData.fromCharData([0, 'a', 1, 'a'.charCodeAt(0)]);
                cell.fg |= 16777216 | 2 | 67108864;
                cell.bg |= 16777216 | 1;
                lineData.setCell(0, cell);
                const spans = rowFactory.createRow(lineData, 0, false, undefined, undefined, 0, false, 5, EMPTY_WIDTH, -1, -1);
                chai_1.assert.equal(extractHtml(spans), '<span class="xterm-bg-2 xterm-fg-1">a</span>');
            });
            it('should correctly invert default fg color', () => {
                const cell = CellData_1.CellData.fromCharData([0, 'a', 1, 'a'.charCodeAt(0)]);
                cell.fg |= 67108864;
                cell.bg |= 16777216 | 1;
                lineData.setCell(0, cell);
                const spans = rowFactory.createRow(lineData, 0, false, undefined, undefined, 0, false, 5, EMPTY_WIDTH, -1, -1);
                chai_1.assert.equal(extractHtml(spans), '<span class="xterm-bg-257 xterm-fg-1">a</span>');
            });
            it('should correctly invert default bg color', () => {
                const cell = CellData_1.CellData.fromCharData([0, 'a', 1, 'a'.charCodeAt(0)]);
                cell.fg |= 16777216 | 1 | 67108864;
                lineData.setCell(0, cell);
                const spans = rowFactory.createRow(lineData, 0, false, undefined, undefined, 0, false, 5, EMPTY_WIDTH, -1, -1);
                chai_1.assert.equal(extractHtml(spans), '<span class="xterm-bg-1 xterm-fg-257">a</span>');
            });
            it('should turn bold fg text bright', () => {
                const cell = CellData_1.CellData.fromCharData([0, 'a', 1, 'a'.charCodeAt(0)]);
                cell.fg |= 134217728 | 16777216;
                for (let i = 0; i < 8; i++) {
                    cell.fg &= ~255;
                    cell.fg |= i;
                    lineData.setCell(0, cell);
                    const spans = rowFactory.createRow(lineData, 0, false, undefined, undefined, 0, false, 5, EMPTY_WIDTH, -1, -1);
                    chai_1.assert.equal(extractHtml(spans), `<span class="xterm-bold xterm-fg-${i + 8}">a</span>`);
                }
            });
            it('should set style attribute for RBG', () => {
                const cell = CellData_1.CellData.fromCharData([0, 'a', 1, 'a'.charCodeAt(0)]);
                cell.fg |= 50331648 | 1 << 16 | 2 << 8 | 3;
                cell.bg |= 50331648 | 4 << 16 | 5 << 8 | 6;
                lineData.setCell(0, cell);
                const spans = rowFactory.createRow(lineData, 0, false, undefined, undefined, 0, false, 5, EMPTY_WIDTH, -1, -1);
                chai_1.assert.equal(extractHtml(spans), '<span style="background-color:#040506;color:#010203;">a</span>');
            });
            it('should correctly invert RGB colors', () => {
                const cell = CellData_1.CellData.fromCharData([0, 'a', 1, 'a'.charCodeAt(0)]);
                cell.fg |= 50331648 | 1 << 16 | 2 << 8 | 3 | 67108864;
                cell.bg |= 50331648 | 4 << 16 | 5 << 8 | 6;
                lineData.setCell(0, cell);
                const spans = rowFactory.createRow(lineData, 0, false, undefined, undefined, 0, false, 5, EMPTY_WIDTH, -1, -1);
                chai_1.assert.equal(extractHtml(spans), '<span style="background-color:#010203;color:#040506;">a</span>');
            });
        });
        describe('selectionForeground', () => {
            it('should force selected cells with content to be rendered above the background', () => {
                lineData.setCell(0, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, 'a', 1, 'a'.charCodeAt(0)]));
                lineData.setCell(1, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, 'b', 1, 'b'.charCodeAt(0)]));
                rowFactory.handleSelectionChanged([1, 0], [2, 0], false);
                const spans = rowFactory.createRow(lineData, 0, false, undefined, undefined, 0, false, 5, EMPTY_WIDTH, -1, -1);
                chai_1.assert.equal(extractHtml(spans), '<span>a</span><span style="background-color:#ff0000;" class="xterm-decoration-top">b</span>');
            });
            it('should force whitespace cells to be rendered above the background', () => {
                lineData.setCell(1, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, 'a', 1, 'a'.charCodeAt(0)]));
                rowFactory.handleSelectionChanged([0, 0], [2, 0], false);
                const spans = rowFactory.createRow(lineData, 0, false, undefined, undefined, 0, false, 5, EMPTY_WIDTH, -1, -1);
                chai_1.assert.equal(extractHtml(spans), '<span style="background-color:#ff0000;" class="xterm-decoration-top"> a</span>');
            });
        });
    });
    describe('createRow with merged spans', () => {
        beforeEach(() => {
            lineData = createEmptyLineData(10);
        });
        it('should not create anything for an empty row', () => {
            const spans = rowFactory.createRow(lineData, 0, false, undefined, undefined, 0, false, 5, EMPTY_WIDTH, -1, -1);
            chai_1.assert.equal(extractHtml(spans), '');
        });
        it('can merge codepoints for equal spacing', () => {
            lineData.setCell(0, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, 'a', 1, 'a'.charCodeAt(0)]));
            lineData.setCell(1, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, 'b', 1, 'b'.charCodeAt(0)]));
            lineData.setCell(2, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, 'c', 1, 'c'.charCodeAt(0)]));
            const spans = rowFactory.createRow(lineData, 0, false, undefined, undefined, 0, false, 5, EMPTY_WIDTH, -1, -1);
            chai_1.assert.equal(extractHtml(spans), '<span>abc</span>');
        });
        it('should not merge codepoints with different spacing', () => {
            EMPTY_WIDTH.widths['€'] = [2, 2, 2, 2];
            lineData.setCell(0, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, 'a', 1, 'a'.charCodeAt(0)]));
            lineData.setCell(1, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, '€', 1, '€'.charCodeAt(0)]));
            lineData.setCell(2, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, 'c', 1, 'c'.charCodeAt(0)]));
            const spans = rowFactory.createRow(lineData, 0, false, undefined, undefined, 0, false, 5, EMPTY_WIDTH, -1, -1);
            chai_1.assert.equal(extractHtml(spans), '<span>a</span><span style="letter-spacing: 3px;">€</span><span>c</span>');
        });
        it('should not merge on FG change', () => {
            const aColor1 = CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, 'a', 1, 'a'.charCodeAt(0)]);
            aColor1.fg |= 16777216 | 1;
            const bColor2 = CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, 'b', 1, 'b'.charCodeAt(0)]);
            bColor2.fg |= 16777216 | 2;
            lineData.setCell(0, aColor1);
            lineData.setCell(1, aColor1);
            lineData.setCell(2, bColor2);
            lineData.setCell(3, bColor2);
            const spans = rowFactory.createRow(lineData, 0, false, undefined, undefined, 0, false, 5, EMPTY_WIDTH, -1, -1);
            chai_1.assert.equal(extractHtml(spans), '<span class="xterm-fg-1">aa</span><span class="xterm-fg-2">bb</span>');
        });
        it('should not merge cursor cell', () => {
            lineData.setCell(0, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, 'a', 1, 'a'.charCodeAt(0)]));
            lineData.setCell(1, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, 'a', 1, 'a'.charCodeAt(0)]));
            lineData.setCell(2, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, 'X', 1, 'X'.charCodeAt(0)]));
            lineData.setCell(3, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, 'b', 1, 'b'.charCodeAt(0)]));
            lineData.setCell(4, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, 'b', 1, 'b'.charCodeAt(0)]));
            const spans = rowFactory.createRow(lineData, 0, true, undefined, undefined, 2, false, 5, EMPTY_WIDTH, -1, -1);
            chai_1.assert.equal(extractHtml(spans), '<span>aa</span><span class="xterm-cursor xterm-cursor-block">X</span><span>bb</span>');
        });
        it('should handle BCE correctly', () => {
            const nullCell = lineData.loadCell(0, new CellData_1.CellData());
            nullCell.bg = 16777216 | 1;
            lineData.setCell(2, nullCell);
            nullCell.bg = 16777216 | 2;
            lineData.setCell(3, nullCell);
            lineData.setCell(4, nullCell);
            const spans = rowFactory.createRow(lineData, 0, false, undefined, undefined, 0, false, 5, EMPTY_WIDTH, -1, -1);
            chai_1.assert.equal(extractHtml(spans), '<span>  </span><span class="xterm-bg-1"> </span><span class="xterm-bg-2">  </span>');
        });
        it('should handle BCE for multiple cells', () => {
            const nullCell = lineData.loadCell(0, new CellData_1.CellData());
            nullCell.bg = 16777216 | 1;
            lineData.setCell(0, nullCell);
            let spans = rowFactory.createRow(lineData, 0, false, undefined, undefined, 0, false, 5, EMPTY_WIDTH, -1, -1);
            chai_1.assert.equal(extractHtml(spans), '<span class="xterm-bg-1"> </span>');
            lineData.setCell(1, nullCell);
            spans = rowFactory.createRow(lineData, 0, false, undefined, undefined, 0, false, 5, EMPTY_WIDTH, -1, -1);
            chai_1.assert.equal(extractHtml(spans), '<span class="xterm-bg-1">  </span>');
            lineData.setCell(2, nullCell);
            lineData.setCell(3, nullCell);
            spans = rowFactory.createRow(lineData, 0, false, undefined, undefined, 0, false, 5, EMPTY_WIDTH, -1, -1);
            chai_1.assert.equal(extractHtml(spans), '<span class="xterm-bg-1">    </span>');
            lineData.setCell(4, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, 'a', 1, 'a'.charCodeAt(0)]));
            spans = rowFactory.createRow(lineData, 0, false, undefined, undefined, 0, false, 5, EMPTY_WIDTH, -1, -1);
            chai_1.assert.equal(extractHtml(spans), '<span class="xterm-bg-1">    </span><span>a</span>');
        });
        it('should apply correct positive or negative spacing', () => {
            EMPTY_WIDTH.widths['€'] = [2, 2, 2, 2];
            EMPTY_WIDTH.widths['語'] = [10, 10, 10, 10];
            EMPTY_WIDTH.widths['𝄞'] = [7, 7, 7, 7];
            lineData.setCell(0, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, 'a', 1, 'a'.charCodeAt(0)]));
            lineData.setCell(1, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, '€', 1, '€'.charCodeAt(0)]));
            lineData.setCell(2, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, 'c', 1, 'c'.charCodeAt(0)]));
            lineData.setCell(3, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, '語', 2, 'c'.charCodeAt(0)]));
            lineData.setCell(4, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, '𝄞', 1, 'c'.charCodeAt(0)]));
            const spans = rowFactory.createRow(lineData, 0, false, undefined, undefined, 0, false, 5, EMPTY_WIDTH, -1, -1);
            chai_1.assert.equal(extractHtml(spans), '<span>a</span><span style="letter-spacing: 3px;">€</span><span>c語</span><span style="letter-spacing: -2px;">𝄞</span>');
        });
        it('should not merge across link borders', () => {
            lineData.setCell(0, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, 'a', 1, 'a'.charCodeAt(0)]));
            lineData.setCell(1, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, 'a', 1, 'a'.charCodeAt(0)]));
            lineData.setCell(2, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, 'x', 1, 'x'.charCodeAt(0)]));
            lineData.setCell(3, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, 'x', 1, 'x'.charCodeAt(0)]));
            lineData.setCell(4, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, 'x', 1, 'x'.charCodeAt(0)]));
            lineData.setCell(5, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, 'b', 1, 'b'.charCodeAt(0)]));
            lineData.setCell(6, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, 'b', 1, 'b'.charCodeAt(0)]));
            const spans = rowFactory.createRow(lineData, 0, false, undefined, undefined, 0, false, 5, EMPTY_WIDTH, 2, 4);
            chai_1.assert.equal(extractHtml(spans), '<span>aa</span><span style="text-decoration: underline;">xxx</span><span>bb</span>');
        });
        it('empty cells included in link underline', () => {
            lineData.setCell(0, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, 'a', 1, 'a'.charCodeAt(0)]));
            lineData.setCell(1, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, 'a', 1, 'a'.charCodeAt(0)]));
            lineData.setCell(2, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, 'x', 1, 'x'.charCodeAt(0)]));
            lineData.setCell(4, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, 'x', 1, 'x'.charCodeAt(0)]));
            const spans = rowFactory.createRow(lineData, 0, false, undefined, undefined, 0, false, 5, EMPTY_WIDTH, 2, 4);
            chai_1.assert.equal(extractHtml(spans), '<span>aa</span><span style="text-decoration: underline;">x x</span>');
        });
        it('link range gets capped to actual line borders', () => {
            for (let i = 0; i < 10; ++i) {
                lineData.setCell(i, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, 'a', 1, 'a'.charCodeAt(0)]));
            }
            const spans = rowFactory.createRow(lineData, 0, false, undefined, undefined, 0, false, 5, EMPTY_WIDTH, -100, 100);
            chai_1.assert.equal(extractHtml(spans), '<span style="text-decoration: underline;">aaaaaaaaaa</span>');
        });
    });
    function extractHtml(spans) {
        const element = dom.window.document.createElement('div');
        element.replaceChildren(...spans);
        return element.innerHTML;
    }
    function createEmptyLineData(cols) {
        const lineData = new BufferLine_1.BufferLine(cols);
        for (let i = 0; i < cols; i++) {
            lineData.setCell(i, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, Constants_1.NULL_CELL_CHAR, Constants_1.NULL_CELL_WIDTH, Constants_1.NULL_CELL_CODE]));
        }
        return lineData;
    }
});
//# sourceMappingURL=DomRendererRowFactory.test.js.map