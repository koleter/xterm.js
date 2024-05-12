"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const SelectionService_1 = require("./SelectionService");
const TestUtils_test_1 = require("common/TestUtils.test");
const BufferLine_1 = require("common/buffer/BufferLine");
const TestUtils_test_2 = require("browser/TestUtils.test");
const CellData_1 = require("common/buffer/CellData");
class TestSelectionService extends SelectionService_1.SelectionService {
    constructor(bufferService, optionsService, renderService) {
        super(null, null, null, bufferService, new TestUtils_test_1.MockCoreService(), new TestUtils_test_2.MockMouseService(), optionsService, renderService, new TestUtils_test_2.MockCoreBrowserService());
    }
    get model() { return this._model; }
    set selectionMode(mode) { this._activeSelectionMode = mode; }
    selectLineAt(line) { this._selectLineAt(line); }
    selectWordAt(coords) { this._selectWordAt(coords, true); }
    areCoordsInSelection(coords, start, end) { return this._areCoordsInSelection(coords, start, end); }
    enable() { }
    disable() { }
    refresh() { }
}
describe('SelectionService', () => {
    let buffer;
    let bufferService;
    let optionsService;
    let selectionService;
    beforeEach(() => {
        optionsService = new TestUtils_test_1.MockOptionsService();
        bufferService = new TestUtils_test_1.MockBufferService(20, 20, optionsService);
        buffer = bufferService.buffer;
        const renderService = new TestUtils_test_2.MockRenderService();
        renderService.dimensions.css.canvas.height = 10 * 20;
        renderService.dimensions.css.canvas.width = 10 * 20;
        selectionService = new TestSelectionService(bufferService, optionsService, renderService);
    });
    function stringToRow(text) {
        const result = new BufferLine_1.BufferLine(text.length);
        for (let i = 0; i < text.length; i++) {
            result.setCell(i, CellData_1.CellData.fromCharData([0, text.charAt(i), 1, text.charCodeAt(i)]));
        }
        return result;
    }
    function stringArrayToRow(chars) {
        const line = new BufferLine_1.BufferLine(chars.length);
        chars.map((c, idx) => line.setCell(idx, CellData_1.CellData.fromCharData([0, c, 1, c.charCodeAt(0)])));
        return line;
    }
    describe('_selectWordAt', () => {
        it('should expand selection for normal width chars', () => {
            buffer.lines.set(0, stringToRow('foo bar'));
            selectionService.selectWordAt([0, 0]);
            chai_1.assert.equal(selectionService.selectionText, 'foo');
            selectionService.selectWordAt([1, 0]);
            chai_1.assert.equal(selectionService.selectionText, 'foo');
            selectionService.selectWordAt([2, 0]);
            chai_1.assert.equal(selectionService.selectionText, 'foo');
            selectionService.selectWordAt([3, 0]);
            chai_1.assert.equal(selectionService.selectionText, ' ');
            selectionService.selectWordAt([4, 0]);
            chai_1.assert.equal(selectionService.selectionText, 'bar');
            selectionService.selectWordAt([5, 0]);
            chai_1.assert.equal(selectionService.selectionText, 'bar');
            selectionService.selectWordAt([6, 0]);
            chai_1.assert.equal(selectionService.selectionText, 'bar');
        });
        it('should expand selection for whitespace', () => {
            buffer.lines.set(0, stringToRow('a   b'));
            selectionService.selectWordAt([0, 0]);
            chai_1.assert.equal(selectionService.selectionText, 'a');
            selectionService.selectWordAt([1, 0]);
            chai_1.assert.equal(selectionService.selectionText, '   ');
            selectionService.selectWordAt([2, 0]);
            chai_1.assert.equal(selectionService.selectionText, '   ');
            selectionService.selectWordAt([3, 0]);
            chai_1.assert.equal(selectionService.selectionText, '   ');
            selectionService.selectWordAt([4, 0]);
            chai_1.assert.equal(selectionService.selectionText, 'b');
        });
        it('should expand selection for wide characters', () => {
            const data = [
                [0, '中', 2, '中'.charCodeAt(0)],
                [0, '', 0, 0],
                [0, '文', 2, '文'.charCodeAt(0)],
                [0, '', 0, 0],
                [0, ' ', 1, ' '.charCodeAt(0)],
                [0, 'a', 1, 'a'.charCodeAt(0)],
                [0, '中', 2, '中'.charCodeAt(0)],
                [0, '', 0, 0],
                [0, '文', 2, '文'.charCodeAt(0)],
                [0, '', 0, ''.charCodeAt(0)],
                [0, 'b', 1, 'b'.charCodeAt(0)],
                [0, ' ', 1, ' '.charCodeAt(0)],
                [0, 'f', 1, 'f'.charCodeAt(0)],
                [0, 'o', 1, 'o'.charCodeAt(0)],
                [0, 'o', 1, 'o'.charCodeAt(0)]
            ];
            const line = new BufferLine_1.BufferLine(data.length);
            for (let i = 0; i < data.length; ++i)
                line.setCell(i, CellData_1.CellData.fromCharData(data[i]));
            buffer.lines.set(0, line);
            selectionService.selectWordAt([0, 0]);
            chai_1.assert.equal(selectionService.selectionText, '中文');
            selectionService.selectWordAt([1, 0]);
            chai_1.assert.equal(selectionService.selectionText, '中文');
            selectionService.selectWordAt([2, 0]);
            chai_1.assert.equal(selectionService.selectionText, '中文');
            selectionService.selectWordAt([3, 0]);
            chai_1.assert.equal(selectionService.selectionText, '中文');
            selectionService.selectWordAt([4, 0]);
            chai_1.assert.equal(selectionService.selectionText, ' ');
            selectionService.selectWordAt([5, 0]);
            chai_1.assert.equal(selectionService.selectionText, 'a中文b');
            selectionService.selectWordAt([6, 0]);
            chai_1.assert.equal(selectionService.selectionText, 'a中文b');
            selectionService.selectWordAt([7, 0]);
            chai_1.assert.equal(selectionService.selectionText, 'a中文b');
            selectionService.selectWordAt([8, 0]);
            chai_1.assert.equal(selectionService.selectionText, 'a中文b');
            selectionService.selectWordAt([9, 0]);
            chai_1.assert.equal(selectionService.selectionText, 'a中文b');
            selectionService.selectWordAt([10, 0]);
            chai_1.assert.equal(selectionService.selectionText, 'a中文b');
            selectionService.selectWordAt([11, 0]);
            chai_1.assert.equal(selectionService.selectionText, ' ');
            selectionService.selectWordAt([12, 0]);
            chai_1.assert.equal(selectionService.selectionText, 'foo');
            selectionService.selectWordAt([13, 0]);
            chai_1.assert.equal(selectionService.selectionText, 'foo');
            selectionService.selectWordAt([14, 0]);
            chai_1.assert.equal(selectionService.selectionText, 'foo');
        });
        it('should select up to non-path characters that are commonly adjacent to paths', () => {
            buffer.lines.set(0, stringToRow('(cd)[ef]{gh}\'ij"'));
            selectionService.selectWordAt([0, 0]);
            chai_1.assert.equal(selectionService.selectionText, '(cd');
            selectionService.selectWordAt([1, 0]);
            chai_1.assert.equal(selectionService.selectionText, 'cd');
            selectionService.selectWordAt([2, 0]);
            chai_1.assert.equal(selectionService.selectionText, 'cd');
            selectionService.selectWordAt([3, 0]);
            chai_1.assert.equal(selectionService.selectionText, 'cd)');
            selectionService.selectWordAt([4, 0]);
            chai_1.assert.equal(selectionService.selectionText, '[ef');
            selectionService.selectWordAt([5, 0]);
            chai_1.assert.equal(selectionService.selectionText, 'ef');
            selectionService.selectWordAt([6, 0]);
            chai_1.assert.equal(selectionService.selectionText, 'ef');
            selectionService.selectWordAt([7, 0]);
            chai_1.assert.equal(selectionService.selectionText, 'ef]');
            selectionService.selectWordAt([8, 0]);
            chai_1.assert.equal(selectionService.selectionText, '{gh');
            selectionService.selectWordAt([9, 0]);
            chai_1.assert.equal(selectionService.selectionText, 'gh');
            selectionService.selectWordAt([10, 0]);
            chai_1.assert.equal(selectionService.selectionText, 'gh');
            selectionService.selectWordAt([11, 0]);
            chai_1.assert.equal(selectionService.selectionText, 'gh}');
            selectionService.selectWordAt([12, 0]);
            chai_1.assert.equal(selectionService.selectionText, '\'ij');
            selectionService.selectWordAt([13, 0]);
            chai_1.assert.equal(selectionService.selectionText, 'ij');
            selectionService.selectWordAt([14, 0]);
            chai_1.assert.equal(selectionService.selectionText, 'ij');
            selectionService.selectWordAt([15, 0]);
            chai_1.assert.equal(selectionService.selectionText, 'ij"');
        });
        it('should expand upwards or downards for wrapped lines', () => {
            buffer.lines.set(0, stringToRow('                 foo'));
            buffer.lines.set(1, stringToRow('bar                 '));
            buffer.lines.get(1).isWrapped = true;
            selectionService.selectWordAt([1, 1]);
            chai_1.assert.equal(selectionService.selectionText, 'foobar');
            selectionService.model.clearSelection();
            selectionService.selectWordAt([18, 0]);
            chai_1.assert.equal(selectionService.selectionText, 'foobar');
        });
        it('should expand both upwards and downwards for word wrapped over many lines', () => {
            const expectedText = 'fooaaaaaaaaaaaaaaaaaaaabbbbbbbbbbbbbbbbbbbbccccccccccccccccccccbar';
            buffer.lines.set(0, stringToRow('                 foo'));
            buffer.lines.set(1, stringToRow('aaaaaaaaaaaaaaaaaaaa'));
            buffer.lines.set(2, stringToRow('bbbbbbbbbbbbbbbbbbbb'));
            buffer.lines.set(3, stringToRow('cccccccccccccccccccc'));
            buffer.lines.set(4, stringToRow('bar                 '));
            buffer.lines.get(1).isWrapped = true;
            buffer.lines.get(2).isWrapped = true;
            buffer.lines.get(3).isWrapped = true;
            buffer.lines.get(4).isWrapped = true;
            selectionService.selectWordAt([18, 0]);
            chai_1.assert.equal(selectionService.selectionText, expectedText);
            selectionService.model.clearSelection();
            selectionService.selectWordAt([10, 1]);
            chai_1.assert.equal(selectionService.selectionText, expectedText);
            selectionService.model.clearSelection();
            selectionService.selectWordAt([10, 2]);
            chai_1.assert.equal(selectionService.selectionText, expectedText);
            selectionService.model.clearSelection();
            selectionService.selectWordAt([10, 3]);
            chai_1.assert.equal(selectionService.selectionText, expectedText);
            selectionService.model.clearSelection();
            selectionService.selectWordAt([1, 4]);
            chai_1.assert.equal(selectionService.selectionText, expectedText);
        });
        describe('emoji', () => {
            it('should treat a single emoji as a word when wrapped in spaces', () => {
                buffer.lines.set(0, stringToRow(' ⚽ a'));
                selectionService.selectWordAt([0, 0]);
                chai_1.assert.equal(selectionService.selectionText, ' ');
                selectionService.selectWordAt([1, 0]);
                chai_1.assert.equal(selectionService.selectionText, '⚽');
                selectionService.selectWordAt([2, 0]);
                chai_1.assert.equal(selectionService.selectionText, ' ');
            });
            it('should treat multiple emojis as a word when wrapped in spaces', () => {
                buffer.lines.set(0, stringToRow(' ⚽⚽ a'));
                selectionService.selectWordAt([0, 0]);
                chai_1.assert.equal(selectionService.selectionText, ' ');
                selectionService.selectWordAt([1, 0]);
                chai_1.assert.equal(selectionService.selectionText, '⚽⚽');
                selectionService.selectWordAt([2, 0]);
                chai_1.assert.equal(selectionService.selectionText, '⚽⚽');
                selectionService.selectWordAt([3, 0]);
                chai_1.assert.equal(selectionService.selectionText, ' ');
            });
            it('should treat emojis using the zero-width-joiner as a single word', () => {
                buffer.lines.set(0, stringArrayToRow([
                    ' ', '👨‍', '👩‍', '👧‍', '👦', ' ', 'a'
                ]));
                selectionService.selectWordAt([0, 0]);
                chai_1.assert.equal(selectionService.selectionText, ' ');
                selectionService.selectWordAt([1, 0]);
                chai_1.assert.equal(selectionService.selectionText, '👨‍👩‍👧‍👦');
                selectionService.selectWordAt([2, 0]);
                chai_1.assert.equal(selectionService.selectionText, '👨‍👩‍👧‍👦');
                selectionService.selectWordAt([3, 0]);
                chai_1.assert.equal(selectionService.selectionText, '👨‍👩‍👧‍👦');
                selectionService.selectWordAt([4, 0]);
                chai_1.assert.equal(selectionService.selectionText, '👨‍👩‍👧‍👦');
                selectionService.selectWordAt([5, 0]);
                chai_1.assert.equal(selectionService.selectionText, ' ');
            });
            it('should treat emojis and characters joined together as a word', () => {
                buffer.lines.set(0, stringToRow(' ⚽ab cd⚽ ef⚽gh'));
                selectionService.selectWordAt([0, 0]);
                chai_1.assert.equal(selectionService.selectionText, ' ');
                selectionService.selectWordAt([1, 0]);
                chai_1.assert.equal(selectionService.selectionText, '⚽ab');
                selectionService.selectWordAt([2, 0]);
                chai_1.assert.equal(selectionService.selectionText, '⚽ab');
                selectionService.selectWordAt([3, 0]);
                chai_1.assert.equal(selectionService.selectionText, '⚽ab');
                selectionService.selectWordAt([4, 0]);
                chai_1.assert.equal(selectionService.selectionText, ' ');
                selectionService.selectWordAt([5, 0]);
                chai_1.assert.equal(selectionService.selectionText, 'cd⚽');
                selectionService.selectWordAt([6, 0]);
                chai_1.assert.equal(selectionService.selectionText, 'cd⚽');
                selectionService.selectWordAt([7, 0]);
                chai_1.assert.equal(selectionService.selectionText, 'cd⚽');
                selectionService.selectWordAt([8, 0]);
                chai_1.assert.equal(selectionService.selectionText, ' ');
                selectionService.selectWordAt([9, 0]);
                chai_1.assert.equal(selectionService.selectionText, 'ef⚽gh');
                selectionService.selectWordAt([10, 0]);
                chai_1.assert.equal(selectionService.selectionText, 'ef⚽gh');
                selectionService.selectWordAt([11, 0]);
                chai_1.assert.equal(selectionService.selectionText, 'ef⚽gh');
                selectionService.selectWordAt([12, 0]);
                chai_1.assert.equal(selectionService.selectionText, 'ef⚽gh');
                selectionService.selectWordAt([13, 0]);
                chai_1.assert.equal(selectionService.selectionText, 'ef⚽gh');
            });
            it('should treat complex emojis and characters joined together as a word', () => {
                buffer.lines.set(0, stringArrayToRow([
                    ' ', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'a', 'b', ' ', 'c', 'd', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', ' ', 'e', 'f', '🏴󠁧󠁢󠁥󠁮󠁧󠁿', 'g', 'h', ' ', 'a'
                ]));
                selectionService.selectWordAt([0, 0]);
                chai_1.assert.equal(selectionService.selectionText, ' ');
                selectionService.selectWordAt([1, 0]);
                chai_1.assert.equal(selectionService.selectionText, '🏴󠁧󠁢󠁥󠁮󠁧󠁿ab');
                selectionService.selectWordAt([2, 0]);
                chai_1.assert.equal(selectionService.selectionText, '🏴󠁧󠁢󠁥󠁮󠁧󠁿ab');
                selectionService.selectWordAt([3, 0]);
                chai_1.assert.equal(selectionService.selectionText, '🏴󠁧󠁢󠁥󠁮󠁧󠁿ab');
                selectionService.selectWordAt([4, 0]);
                chai_1.assert.equal(selectionService.selectionText, ' ');
                selectionService.selectWordAt([5, 0]);
                chai_1.assert.equal(selectionService.selectionText, 'cd🏴󠁧󠁢󠁥󠁮󠁧󠁿');
                selectionService.selectWordAt([6, 0]);
                chai_1.assert.equal(selectionService.selectionText, 'cd🏴󠁧󠁢󠁥󠁮󠁧󠁿');
                selectionService.selectWordAt([7, 0]);
                chai_1.assert.equal(selectionService.selectionText, 'cd🏴󠁧󠁢󠁥󠁮󠁧󠁿');
                selectionService.selectWordAt([8, 0]);
                chai_1.assert.equal(selectionService.selectionText, ' ');
                selectionService.selectWordAt([9, 0]);
                chai_1.assert.equal(selectionService.selectionText, 'ef🏴󠁧󠁢󠁥󠁮󠁧󠁿gh');
                selectionService.selectWordAt([10, 0]);
                chai_1.assert.equal(selectionService.selectionText, 'ef🏴󠁧󠁢󠁥󠁮󠁧󠁿gh');
                selectionService.selectWordAt([11, 0]);
                chai_1.assert.equal(selectionService.selectionText, 'ef🏴󠁧󠁢󠁥󠁮󠁧󠁿gh');
                selectionService.selectWordAt([12, 0]);
                chai_1.assert.equal(selectionService.selectionText, 'ef🏴󠁧󠁢󠁥󠁮󠁧󠁿gh');
                selectionService.selectWordAt([13, 0]);
                chai_1.assert.equal(selectionService.selectionText, 'ef🏴󠁧󠁢󠁥󠁮󠁧󠁿gh');
            });
        });
    });
    describe('_selectLineAt', () => {
        it('should select the entire line', () => {
            buffer.lines.set(0, stringToRow('foo bar'));
            selectionService.selectLineAt(0);
            chai_1.assert.equal(selectionService.selectionText, 'foo bar', 'The selected text is correct');
            chai_1.assert.deepEqual(selectionService.model.selectionStart, [0, 0]);
            chai_1.assert.deepEqual(selectionService.model.selectionEnd, undefined);
            chai_1.assert.deepEqual(selectionService.model.selectionStartLength, 20);
            chai_1.assert.deepEqual(selectionService.model.finalSelectionStart, [0, 0]);
            chai_1.assert.deepEqual(selectionService.model.finalSelectionEnd, [bufferService.cols, 0], 'The actual selection spans the entire column');
        });
        it('should select the entire wrapped line', () => {
            buffer.lines.set(0, stringToRow('foo'));
            const line2 = stringToRow('bar');
            line2.isWrapped = true;
            buffer.lines.set(1, line2);
            selectionService.selectLineAt(0);
            chai_1.assert.equal(selectionService.selectionText, 'foobar', 'The selected text is correct');
            chai_1.assert.deepEqual(selectionService.model.selectionStart, [0, 0]);
            chai_1.assert.deepEqual(selectionService.model.selectionEnd, undefined);
            chai_1.assert.deepEqual(selectionService.model.selectionStartLength, 40);
            chai_1.assert.deepEqual(selectionService.model.finalSelectionStart, [0, 0]);
            chai_1.assert.deepEqual(selectionService.model.finalSelectionEnd, [bufferService.cols, 1], 'The actual selection spans the entire column');
        });
    });
    describe('selectAll', () => {
        it('should select the entire buffer, beyond the viewport', () => {
            bufferService.resize(20, 5);
            buffer.lines.set(0, stringToRow('1'));
            buffer.lines.set(1, stringToRow('2'));
            buffer.lines.set(2, stringToRow('3'));
            buffer.lines.set(3, stringToRow('4'));
            buffer.lines.set(4, stringToRow('5'));
            selectionService.selectAll();
            chai_1.assert.equal(selectionService.selectionText, '1\n2\n3\n4\n5');
        });
    });
    describe('selectLines', () => {
        it('should select a single line', () => {
            buffer.lines.length = 3;
            buffer.lines.set(0, stringToRow('1'));
            buffer.lines.set(1, stringToRow('2'));
            buffer.lines.set(2, stringToRow('3'));
            selectionService.selectLines(1, 1);
            chai_1.assert.deepEqual(selectionService.model.finalSelectionStart, [0, 1]);
            chai_1.assert.deepEqual(selectionService.model.finalSelectionEnd, [bufferService.cols, 1]);
        });
        it('should select multiple lines', () => {
            buffer.lines.length = 5;
            buffer.lines.set(0, stringToRow('1'));
            buffer.lines.set(1, stringToRow('2'));
            buffer.lines.set(2, stringToRow('3'));
            buffer.lines.set(3, stringToRow('4'));
            buffer.lines.set(4, stringToRow('5'));
            selectionService.selectLines(1, 3);
            chai_1.assert.deepEqual(selectionService.model.finalSelectionStart, [0, 1]);
            chai_1.assert.deepEqual(selectionService.model.finalSelectionEnd, [bufferService.cols, 3]);
        });
        it('should select the to the start when requesting a negative row', () => {
            buffer.lines.length = 2;
            buffer.lines.set(0, stringToRow('1'));
            buffer.lines.set(1, stringToRow('2'));
            selectionService.selectLines(-1, 0);
            chai_1.assert.deepEqual(selectionService.model.finalSelectionStart, [0, 0]);
            chai_1.assert.deepEqual(selectionService.model.finalSelectionEnd, [bufferService.cols, 0]);
        });
        it('should select the to the end when requesting beyond the final row', () => {
            buffer.lines.length = 2;
            buffer.lines.set(0, stringToRow('1'));
            buffer.lines.set(1, stringToRow('2'));
            selectionService.selectLines(1, 2);
            chai_1.assert.deepEqual(selectionService.model.finalSelectionStart, [0, 1]);
            chai_1.assert.deepEqual(selectionService.model.finalSelectionEnd, [bufferService.cols, 1]);
        });
    });
    describe('hasSelection', () => {
        it('should return whether there is a selection', () => {
            selectionService.model.selectionStart = [0, 0];
            selectionService.model.selectionStartLength = 0;
            chai_1.assert.equal(selectionService.hasSelection, false);
            selectionService.model.selectionEnd = [0, 0];
            chai_1.assert.equal(selectionService.hasSelection, false);
            selectionService.model.selectionEnd = [1, 0];
            chai_1.assert.equal(selectionService.hasSelection, true);
            selectionService.model.selectionEnd = [0, 1];
            chai_1.assert.equal(selectionService.hasSelection, true);
            selectionService.model.selectionEnd = [1, 1];
            chai_1.assert.equal(selectionService.hasSelection, true);
        });
    });
    describe('column selection', () => {
        it('should select a column of text', () => {
            buffer.lines.length = 3;
            buffer.lines.set(0, stringToRow('abcdefghij'));
            buffer.lines.set(1, stringToRow('klmnopqrst'));
            buffer.lines.set(2, stringToRow('uvwxyz'));
            selectionService.selectionMode = 3;
            selectionService.model.selectionStart = [2, 0];
            selectionService.model.selectionEnd = [4, 2];
            chai_1.assert.equal(selectionService.selectionText, 'cd\nmn\nwx');
        });
        it('should select a column of text without chopping up double width characters', () => {
            buffer.lines.length = 3;
            buffer.lines.set(0, stringToRow('a'));
            buffer.lines.set(1, stringToRow('語'));
            buffer.lines.set(2, stringToRow('b'));
            selectionService.selectionMode = 3;
            selectionService.model.selectionStart = [0, 0];
            selectionService.model.selectionEnd = [1, 2];
            chai_1.assert.equal(selectionService.selectionText, 'a\n語\nb');
        });
        it('should select a column of text with single character emojis', () => {
            buffer.lines.length = 3;
            buffer.lines.set(0, stringToRow('a'));
            buffer.lines.set(1, stringToRow('☃'));
            buffer.lines.set(2, stringToRow('c'));
            selectionService.selectionMode = 3;
            selectionService.model.selectionStart = [0, 0];
            selectionService.model.selectionEnd = [1, 2];
            chai_1.assert.equal(selectionService.selectionText, 'a\n☃\nc');
        });
        it('should select a column of text with double character emojis', () => {
            buffer.lines.length = 3;
            buffer.lines.set(0, stringToRow('a '));
            buffer.lines.set(1, stringArrayToRow(['😁', ' ']));
            buffer.lines.set(2, stringToRow('c '));
            selectionService.selectionMode = 3;
            selectionService.model.selectionStart = [0, 0];
            selectionService.model.selectionEnd = [1, 2];
            chai_1.assert.equal(selectionService.selectionText, 'a\n😁\nc');
        });
    });
    describe('_areCoordsInSelection', () => {
        it('should return whether coords are in the selection', () => {
            chai_1.assert.isFalse(selectionService.areCoordsInSelection([0, 0], [2, 0], [2, 1]));
            chai_1.assert.isFalse(selectionService.areCoordsInSelection([1, 0], [2, 0], [2, 1]));
            chai_1.assert.isTrue(selectionService.areCoordsInSelection([2, 0], [2, 0], [2, 1]));
            chai_1.assert.isTrue(selectionService.areCoordsInSelection([10, 0], [2, 0], [2, 1]));
            chai_1.assert.isTrue(selectionService.areCoordsInSelection([0, 1], [2, 0], [2, 1]));
            chai_1.assert.isTrue(selectionService.areCoordsInSelection([1, 1], [2, 0], [2, 1]));
            chai_1.assert.isFalse(selectionService.areCoordsInSelection([2, 1], [2, 0], [2, 1]));
        });
    });
});
//# sourceMappingURL=SelectionService.test.js.map