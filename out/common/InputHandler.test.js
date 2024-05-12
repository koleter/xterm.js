"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const InputHandler_1 = require("common/InputHandler");
const BufferLine_1 = require("common/buffer/BufferLine");
const CellData_1 = require("common/buffer/CellData");
const AttributeData_1 = require("common/buffer/AttributeData");
const Params_1 = require("common/parser/Params");
const TestUtils_test_1 = require("common/TestUtils.test");
const OptionsService_1 = require("common/services/OptionsService");
const Clone_1 = require("common/Clone");
const BufferService_1 = require("common/services/BufferService");
const CoreService_1 = require("common/services/CoreService");
function getCursor(bufferService) {
    return [
        bufferService.buffer.x,
        bufferService.buffer.y
    ];
}
function getLines(bufferService, limit = bufferService.rows) {
    const res = [];
    for (let i = 0; i < limit; ++i) {
        const line = bufferService.buffer.lines.get(i);
        if (line) {
            res.push(line.translateToString(true));
        }
    }
    return res;
}
class TestInputHandler extends InputHandler_1.InputHandler {
    get curAttrData() { return this._curAttrData; }
    get windowTitleStack() { return this._windowTitleStack; }
    get iconNameStack() { return this._iconNameStack; }
    async parseP(data) {
        let result;
        let prev;
        while (result = this.parse(data, prev)) {
            prev = await result;
        }
    }
}
describe('InputHandler', () => {
    let bufferService;
    let coreService;
    let optionsService;
    let inputHandler;
    beforeEach(() => {
        optionsService = new TestUtils_test_1.MockOptionsService();
        bufferService = new BufferService_1.BufferService(optionsService);
        bufferService.resize(80, 30);
        coreService = new CoreService_1.CoreService(bufferService, new TestUtils_test_1.MockLogService(), optionsService);
        inputHandler = new TestInputHandler(bufferService, new TestUtils_test_1.MockCharsetService(), coreService, new TestUtils_test_1.MockLogService(), optionsService, new TestUtils_test_1.MockOscLinkService(), new TestUtils_test_1.MockCoreMouseService(), new TestUtils_test_1.MockUnicodeService());
    });
    describe('SL/SR/DECIC/DECDC', () => {
        beforeEach(() => {
            bufferService.resize(5, 5);
            optionsService.options.scrollback = 1;
            bufferService.reset();
        });
        it('SL (scrollLeft)', async () => {
            await inputHandler.parseP('12345'.repeat(6));
            await inputHandler.parseP('\x1b[ @');
            chai_1.assert.deepEqual(getLines(bufferService, 6), ['12345', '2345', '2345', '2345', '2345', '2345']);
            await inputHandler.parseP('\x1b[0 @');
            chai_1.assert.deepEqual(getLines(bufferService, 6), ['12345', '345', '345', '345', '345', '345']);
            await inputHandler.parseP('\x1b[2 @');
            chai_1.assert.deepEqual(getLines(bufferService, 6), ['12345', '5', '5', '5', '5', '5']);
        });
        it('SR (scrollRight)', async () => {
            await inputHandler.parseP('12345'.repeat(6));
            await inputHandler.parseP('\x1b[ A');
            chai_1.assert.deepEqual(getLines(bufferService, 6), ['12345', ' 1234', ' 1234', ' 1234', ' 1234', ' 1234']);
            await inputHandler.parseP('\x1b[0 A');
            chai_1.assert.deepEqual(getLines(bufferService, 6), ['12345', '  123', '  123', '  123', '  123', '  123']);
            await inputHandler.parseP('\x1b[2 A');
            chai_1.assert.deepEqual(getLines(bufferService, 6), ['12345', '    1', '    1', '    1', '    1', '    1']);
        });
        it('insertColumns (DECIC)', async () => {
            await inputHandler.parseP('12345'.repeat(6));
            await inputHandler.parseP('\x1b[3;3H');
            await inputHandler.parseP('\x1b[\'}');
            chai_1.assert.deepEqual(getLines(bufferService, 6), ['12345', '12 34', '12 34', '12 34', '12 34', '12 34']);
            bufferService.reset();
            await inputHandler.parseP('12345'.repeat(6));
            await inputHandler.parseP('\x1b[3;3H');
            await inputHandler.parseP('\x1b[1\'}');
            chai_1.assert.deepEqual(getLines(bufferService, 6), ['12345', '12 34', '12 34', '12 34', '12 34', '12 34']);
            bufferService.reset();
            await inputHandler.parseP('12345'.repeat(6));
            await inputHandler.parseP('\x1b[3;3H');
            await inputHandler.parseP('\x1b[2\'}');
            chai_1.assert.deepEqual(getLines(bufferService, 6), ['12345', '12  3', '12  3', '12  3', '12  3', '12  3']);
        });
        it('deleteColumns (DECDC)', async () => {
            await inputHandler.parseP('12345'.repeat(6));
            await inputHandler.parseP('\x1b[3;3H');
            await inputHandler.parseP('\x1b[\'~');
            chai_1.assert.deepEqual(getLines(bufferService, 6), ['12345', '1245', '1245', '1245', '1245', '1245']);
            bufferService.reset();
            await inputHandler.parseP('12345'.repeat(6));
            await inputHandler.parseP('\x1b[3;3H');
            await inputHandler.parseP('\x1b[1\'~');
            chai_1.assert.deepEqual(getLines(bufferService, 6), ['12345', '1245', '1245', '1245', '1245', '1245']);
            bufferService.reset();
            await inputHandler.parseP('12345'.repeat(6));
            await inputHandler.parseP('\x1b[3;3H');
            await inputHandler.parseP('\x1b[2\'~');
            chai_1.assert.deepEqual(getLines(bufferService, 6), ['12345', '125', '125', '125', '125', '125']);
        });
    });
    describe('BS with reverseWraparound set/unset', () => {
        const ttyBS = '\x08 \x08';
        beforeEach(() => {
            bufferService.resize(5, 5);
            optionsService.options.scrollback = 1;
            bufferService.reset();
        });
        describe('reverseWraparound set', () => {
            it('should not reverse outside of scroll margins', async () => {
                await inputHandler.parseP('#####abcdefghijklmnopqrstuvwxy');
                chai_1.assert.deepEqual(getLines(bufferService, 6), ['#####', 'abcde', 'fghij', 'klmno', 'pqrst', 'uvwxy']);
                chai_1.assert.equal(bufferService.buffers.active.ydisp, 1);
                chai_1.assert.equal(bufferService.buffers.active.x, 5);
                chai_1.assert.equal(bufferService.buffers.active.y, 4);
                await inputHandler.parseP(ttyBS.repeat(100));
                chai_1.assert.deepEqual(getLines(bufferService, 6), ['#####', 'abcde', 'fghij', 'klmno', 'pqrst', '    y']);
                await inputHandler.parseP('\x1b[?45h');
                await inputHandler.parseP('uvwxy');
                await inputHandler.parseP('\x1b[2;4r');
                bufferService.buffers.active.x = 5;
                bufferService.buffers.active.y = 4;
                await inputHandler.parseP(ttyBS.repeat(100));
                chai_1.assert.deepEqual(getLines(bufferService, 6), ['#####', 'abcde', 'fghij', 'klmno', 'pqrst', '     ']);
                await inputHandler.parseP('uvwxy');
                bufferService.buffers.active.x = 5;
                bufferService.buffers.active.y = 3;
                await inputHandler.parseP(ttyBS.repeat(100));
                chai_1.assert.deepEqual(getLines(bufferService, 6), ['#####', 'abcde', '     ', '     ', '     ', 'uvwxy']);
                chai_1.assert.equal(bufferService.buffers.active.x, 0);
                chai_1.assert.equal(bufferService.buffers.active.y, bufferService.buffers.active.scrollTop);
                await inputHandler.parseP('fghijklmnopqrst');
                bufferService.buffers.active.x = 5;
                bufferService.buffers.active.y = 0;
                await inputHandler.parseP(ttyBS.repeat(100));
                chai_1.assert.deepEqual(getLines(bufferService, 6), ['#####', '     ', 'fghij', 'klmno', 'pqrst', 'uvwxy']);
            });
        });
    });
    it('save and restore cursor', () => {
        bufferService.buffer.x = 1;
        bufferService.buffer.y = 2;
        bufferService.buffer.ybase = 0;
        inputHandler.curAttrData.fg = 3;
        inputHandler.saveCursor();
        chai_1.assert.equal(bufferService.buffer.x, 1);
        chai_1.assert.equal(bufferService.buffer.y, 2);
        chai_1.assert.equal(inputHandler.curAttrData.fg, 3);
        bufferService.buffer.x = 10;
        bufferService.buffer.y = 20;
        inputHandler.curAttrData.fg = 30;
        inputHandler.restoreCursor();
        chai_1.assert.equal(bufferService.buffer.x, 1);
        chai_1.assert.equal(bufferService.buffer.y, 2);
        chai_1.assert.equal(inputHandler.curAttrData.fg, 3);
    });
    describe('setCursorStyle', () => {
        it('should call Terminal.setOption with correct params', () => {
            inputHandler.setCursorStyle(Params_1.Params.fromArray([0]));
            chai_1.assert.equal(optionsService.options['cursorStyle'], 'block');
            chai_1.assert.equal(optionsService.options['cursorBlink'], true);
            optionsService.options = (0, Clone_1.clone)(OptionsService_1.DEFAULT_OPTIONS);
            inputHandler.setCursorStyle(Params_1.Params.fromArray([1]));
            chai_1.assert.equal(optionsService.options['cursorStyle'], 'block');
            chai_1.assert.equal(optionsService.options['cursorBlink'], true);
            optionsService.options = (0, Clone_1.clone)(OptionsService_1.DEFAULT_OPTIONS);
            inputHandler.setCursorStyle(Params_1.Params.fromArray([2]));
            chai_1.assert.equal(optionsService.options['cursorStyle'], 'block');
            chai_1.assert.equal(optionsService.options['cursorBlink'], false);
            optionsService.options = (0, Clone_1.clone)(OptionsService_1.DEFAULT_OPTIONS);
            inputHandler.setCursorStyle(Params_1.Params.fromArray([3]));
            chai_1.assert.equal(optionsService.options['cursorStyle'], 'underline');
            chai_1.assert.equal(optionsService.options['cursorBlink'], true);
            optionsService.options = (0, Clone_1.clone)(OptionsService_1.DEFAULT_OPTIONS);
            inputHandler.setCursorStyle(Params_1.Params.fromArray([4]));
            chai_1.assert.equal(optionsService.options['cursorStyle'], 'underline');
            chai_1.assert.equal(optionsService.options['cursorBlink'], false);
            optionsService.options = (0, Clone_1.clone)(OptionsService_1.DEFAULT_OPTIONS);
            inputHandler.setCursorStyle(Params_1.Params.fromArray([5]));
            chai_1.assert.equal(optionsService.options['cursorStyle'], 'bar');
            chai_1.assert.equal(optionsService.options['cursorBlink'], true);
            optionsService.options = (0, Clone_1.clone)(OptionsService_1.DEFAULT_OPTIONS);
            inputHandler.setCursorStyle(Params_1.Params.fromArray([6]));
            chai_1.assert.equal(optionsService.options['cursorStyle'], 'bar');
            chai_1.assert.equal(optionsService.options['cursorBlink'], false);
        });
    });
    describe('setMode', () => {
        it('should toggle bracketedPasteMode', () => {
            const coreService = new TestUtils_test_1.MockCoreService();
            const inputHandler = new TestInputHandler(new TestUtils_test_1.MockBufferService(80, 30), new TestUtils_test_1.MockCharsetService(), coreService, new TestUtils_test_1.MockLogService(), new TestUtils_test_1.MockOptionsService(), new TestUtils_test_1.MockOscLinkService(), new TestUtils_test_1.MockCoreMouseService(), new TestUtils_test_1.MockUnicodeService());
            inputHandler.setModePrivate(Params_1.Params.fromArray([2004]));
            chai_1.assert.equal(coreService.decPrivateModes.bracketedPasteMode, true);
            inputHandler.resetModePrivate(Params_1.Params.fromArray([2004]));
            chai_1.assert.equal(coreService.decPrivateModes.bracketedPasteMode, false);
        });
    });
    describe('regression tests', function () {
        function termContent(bufferService, trim) {
            const result = [];
            for (let i = 0; i < bufferService.rows; ++i)
                result.push(bufferService.buffer.lines.get(i).translateToString(trim));
            return result;
        }
        it('insertChars', async () => {
            const bufferService = new TestUtils_test_1.MockBufferService(80, 30);
            const inputHandler = new TestInputHandler(bufferService, new TestUtils_test_1.MockCharsetService(), new TestUtils_test_1.MockCoreService(), new TestUtils_test_1.MockLogService(), new TestUtils_test_1.MockOptionsService(), new TestUtils_test_1.MockOscLinkService(), new TestUtils_test_1.MockCoreMouseService(), new TestUtils_test_1.MockUnicodeService());
            await inputHandler.parseP(Array(bufferService.cols - 9).join('a'));
            await inputHandler.parseP('1234567890');
            await inputHandler.parseP(Array(bufferService.cols - 9).join('a'));
            await inputHandler.parseP('1234567890');
            const line1 = bufferService.buffer.lines.get(0);
            chai_1.assert.equal(line1.translateToString(false), Array(bufferService.cols - 9).join('a') + '1234567890');
            bufferService.buffer.y = 0;
            bufferService.buffer.x = 70;
            inputHandler.insertChars(Params_1.Params.fromArray([0]));
            chai_1.assert.equal(line1.translateToString(false), Array(bufferService.cols - 9).join('a') + ' 123456789');
            bufferService.buffer.y = 0;
            bufferService.buffer.x = 70;
            inputHandler.insertChars(Params_1.Params.fromArray([1]));
            chai_1.assert.equal(line1.translateToString(false), Array(bufferService.cols - 9).join('a') + '  12345678');
            bufferService.buffer.y = 0;
            bufferService.buffer.x = 70;
            inputHandler.insertChars(Params_1.Params.fromArray([2]));
            chai_1.assert.equal(line1.translateToString(false), Array(bufferService.cols - 9).join('a') + '    123456');
            bufferService.buffer.y = 0;
            bufferService.buffer.x = 70;
            inputHandler.insertChars(Params_1.Params.fromArray([10]));
            chai_1.assert.equal(line1.translateToString(false), Array(bufferService.cols - 9).join('a') + '          ');
            chai_1.assert.equal(line1.translateToString(true), Array(bufferService.cols - 9).join('a'));
        });
        it('deleteChars', async () => {
            const bufferService = new TestUtils_test_1.MockBufferService(80, 30);
            const inputHandler = new TestInputHandler(bufferService, new TestUtils_test_1.MockCharsetService(), new TestUtils_test_1.MockCoreService(), new TestUtils_test_1.MockLogService(), new TestUtils_test_1.MockOptionsService(), new TestUtils_test_1.MockOscLinkService(), new TestUtils_test_1.MockCoreMouseService(), new TestUtils_test_1.MockUnicodeService());
            await inputHandler.parseP(Array(bufferService.cols - 9).join('a'));
            await inputHandler.parseP('1234567890');
            await inputHandler.parseP(Array(bufferService.cols - 9).join('a'));
            await inputHandler.parseP('1234567890');
            const line1 = bufferService.buffer.lines.get(0);
            chai_1.assert.equal(line1.translateToString(false), Array(bufferService.cols - 9).join('a') + '1234567890');
            bufferService.buffer.y = 0;
            bufferService.buffer.x = 70;
            inputHandler.deleteChars(Params_1.Params.fromArray([0]));
            chai_1.assert.equal(line1.translateToString(false), Array(bufferService.cols - 9).join('a') + '234567890 ');
            chai_1.assert.equal(line1.translateToString(true), Array(bufferService.cols - 9).join('a') + '234567890');
            bufferService.buffer.y = 0;
            bufferService.buffer.x = 70;
            inputHandler.deleteChars(Params_1.Params.fromArray([1]));
            chai_1.assert.equal(line1.translateToString(false), Array(bufferService.cols - 9).join('a') + '34567890  ');
            chai_1.assert.equal(line1.translateToString(true), Array(bufferService.cols - 9).join('a') + '34567890');
            bufferService.buffer.y = 0;
            bufferService.buffer.x = 70;
            inputHandler.deleteChars(Params_1.Params.fromArray([2]));
            chai_1.assert.equal(line1.translateToString(false), Array(bufferService.cols - 9).join('a') + '567890    ');
            chai_1.assert.equal(line1.translateToString(true), Array(bufferService.cols - 9).join('a') + '567890');
            bufferService.buffer.y = 0;
            bufferService.buffer.x = 70;
            inputHandler.deleteChars(Params_1.Params.fromArray([10]));
            chai_1.assert.equal(line1.translateToString(false), Array(bufferService.cols - 9).join('a') + '          ');
            chai_1.assert.equal(line1.translateToString(true), Array(bufferService.cols - 9).join('a'));
        });
        it('eraseInLine', async () => {
            const bufferService = new TestUtils_test_1.MockBufferService(80, 30);
            const inputHandler = new TestInputHandler(bufferService, new TestUtils_test_1.MockCharsetService(), new TestUtils_test_1.MockCoreService(), new TestUtils_test_1.MockLogService(), new TestUtils_test_1.MockOptionsService(), new TestUtils_test_1.MockOscLinkService(), new TestUtils_test_1.MockCoreMouseService(), new TestUtils_test_1.MockUnicodeService());
            await inputHandler.parseP(Array(bufferService.cols + 1).join('a'));
            await inputHandler.parseP(Array(bufferService.cols + 1).join('a'));
            await inputHandler.parseP(Array(bufferService.cols + 1).join('a'));
            bufferService.buffer.y = 0;
            bufferService.buffer.x = 70;
            inputHandler.eraseInLine(Params_1.Params.fromArray([0]));
            chai_1.assert.equal(bufferService.buffer.lines.get(0).translateToString(false), Array(71).join('a') + '          ');
            bufferService.buffer.y = 1;
            bufferService.buffer.x = 70;
            inputHandler.eraseInLine(Params_1.Params.fromArray([1]));
            chai_1.assert.equal(bufferService.buffer.lines.get(1).translateToString(false), Array(71).join(' ') + ' aaaaaaaaa');
            bufferService.buffer.y = 2;
            bufferService.buffer.x = 70;
            inputHandler.eraseInLine(Params_1.Params.fromArray([2]));
            chai_1.assert.equal(bufferService.buffer.lines.get(2).translateToString(false), Array(bufferService.cols + 1).join(' '));
        });
        it('eraseInLine reflow', async () => {
            const bufferService = new TestUtils_test_1.MockBufferService(80, 30);
            const inputHandler = new TestInputHandler(bufferService, new TestUtils_test_1.MockCharsetService(), new TestUtils_test_1.MockCoreService(), new TestUtils_test_1.MockLogService(), new TestUtils_test_1.MockOptionsService(), new TestUtils_test_1.MockOscLinkService(), new TestUtils_test_1.MockCoreMouseService(), new TestUtils_test_1.MockUnicodeService());
            const resetToBaseState = async () => {
                bufferService.buffer.y = 0;
                bufferService.buffer.x = 0;
                await inputHandler.parseP(Array(bufferService.cols + 1).join('a'));
                await inputHandler.parseP(Array(bufferService.cols + 10).join('a'));
                for (let i = 3; i < bufferService.rows; ++i)
                    await inputHandler.parseP(Array(bufferService.cols + 1).join('a'));
                chai_1.assert.equal(bufferService.buffer.lines.get(2).isWrapped, true);
            };
            await resetToBaseState();
            bufferService.buffer.y = 2;
            bufferService.buffer.x = 40;
            inputHandler.eraseInLine(Params_1.Params.fromArray([0]));
            chai_1.assert.equal(bufferService.buffer.lines.get(2).isWrapped, true);
            bufferService.buffer.y = 2;
            bufferService.buffer.x = 0;
            inputHandler.eraseInLine(Params_1.Params.fromArray([0]));
            chai_1.assert.equal(bufferService.buffer.lines.get(2).isWrapped, false);
            await resetToBaseState();
            bufferService.buffer.y = 2;
            bufferService.buffer.x = 40;
            inputHandler.eraseInLine(Params_1.Params.fromArray([1]));
            chai_1.assert.equal(bufferService.buffer.lines.get(2).isWrapped, true);
            await resetToBaseState();
            bufferService.buffer.y = 2;
            bufferService.buffer.x = 40;
            inputHandler.eraseInLine(Params_1.Params.fromArray([2]));
            chai_1.assert.equal(bufferService.buffer.lines.get(2).isWrapped, false);
        });
        it('eraseInDisplay', async () => {
            const bufferService = new TestUtils_test_1.MockBufferService(80, 7);
            const inputHandler = new TestInputHandler(bufferService, new TestUtils_test_1.MockCharsetService(), new TestUtils_test_1.MockCoreService(), new TestUtils_test_1.MockLogService(), new TestUtils_test_1.MockOptionsService(), new TestUtils_test_1.MockOscLinkService(), new TestUtils_test_1.MockCoreMouseService(), new TestUtils_test_1.MockUnicodeService());
            for (let i = 0; i < bufferService.rows; ++i)
                await inputHandler.parseP(Array(bufferService.cols + 1).join('a'));
            bufferService.buffer.y = 5;
            bufferService.buffer.x = 40;
            inputHandler.eraseInDisplay(Params_1.Params.fromArray([0]));
            chai_1.assert.deepEqual(termContent(bufferService, false), [
                Array(bufferService.cols + 1).join('a'),
                Array(bufferService.cols + 1).join('a'),
                Array(bufferService.cols + 1).join('a'),
                Array(bufferService.cols + 1).join('a'),
                Array(bufferService.cols + 1).join('a'),
                Array(40 + 1).join('a') + Array(bufferService.cols - 40 + 1).join(' '),
                Array(bufferService.cols + 1).join(' ')
            ]);
            chai_1.assert.deepEqual(termContent(bufferService, true), [
                Array(bufferService.cols + 1).join('a'),
                Array(bufferService.cols + 1).join('a'),
                Array(bufferService.cols + 1).join('a'),
                Array(bufferService.cols + 1).join('a'),
                Array(bufferService.cols + 1).join('a'),
                Array(40 + 1).join('a'),
                ''
            ]);
            bufferService.buffer.y = 0;
            bufferService.buffer.x = 0;
            for (let i = 0; i < bufferService.rows; ++i)
                await inputHandler.parseP(Array(bufferService.cols + 1).join('a'));
            bufferService.buffer.y = 5;
            bufferService.buffer.x = 40;
            inputHandler.eraseInDisplay(Params_1.Params.fromArray([1]));
            chai_1.assert.deepEqual(termContent(bufferService, false), [
                Array(bufferService.cols + 1).join(' '),
                Array(bufferService.cols + 1).join(' '),
                Array(bufferService.cols + 1).join(' '),
                Array(bufferService.cols + 1).join(' '),
                Array(bufferService.cols + 1).join(' '),
                Array(41 + 1).join(' ') + Array(bufferService.cols - 41 + 1).join('a'),
                Array(bufferService.cols + 1).join('a')
            ]);
            chai_1.assert.deepEqual(termContent(bufferService, true), [
                '',
                '',
                '',
                '',
                '',
                Array(41 + 1).join(' ') + Array(bufferService.cols - 41 + 1).join('a'),
                Array(bufferService.cols + 1).join('a')
            ]);
            bufferService.buffer.y = 0;
            bufferService.buffer.x = 0;
            for (let i = 0; i < bufferService.rows; ++i)
                await inputHandler.parseP(Array(bufferService.cols + 1).join('a'));
            bufferService.buffer.y = 5;
            bufferService.buffer.x = 40;
            inputHandler.eraseInDisplay(Params_1.Params.fromArray([2]));
            chai_1.assert.deepEqual(termContent(bufferService, false), [
                Array(bufferService.cols + 1).join(' '),
                Array(bufferService.cols + 1).join(' '),
                Array(bufferService.cols + 1).join(' '),
                Array(bufferService.cols + 1).join(' '),
                Array(bufferService.cols + 1).join(' '),
                Array(bufferService.cols + 1).join(' '),
                Array(bufferService.cols + 1).join(' ')
            ]);
            chai_1.assert.deepEqual(termContent(bufferService, true), [
                '',
                '',
                '',
                '',
                '',
                '',
                ''
            ]);
            bufferService.buffer.y = 0;
            bufferService.buffer.x = 0;
            await inputHandler.parseP(Array(bufferService.cols + 1).join('a'));
            await inputHandler.parseP(Array(bufferService.cols + 10).join('a'));
            for (let i = 3; i < bufferService.rows; ++i)
                await inputHandler.parseP(Array(bufferService.cols + 1).join('a'));
            chai_1.assert.equal(bufferService.buffer.lines.get(2).isWrapped, true);
            bufferService.buffer.y = 2;
            bufferService.buffer.x = 40;
            inputHandler.eraseInDisplay(Params_1.Params.fromArray([1]));
            chai_1.assert.equal(bufferService.buffer.lines.get(2).isWrapped, false);
            bufferService.buffer.y = 0;
            bufferService.buffer.x = 0;
            await inputHandler.parseP(Array(bufferService.cols + 1).join('a'));
            await inputHandler.parseP(Array(bufferService.cols + 10).join('a'));
            for (let i = 3; i < bufferService.rows; ++i)
                await inputHandler.parseP(Array(bufferService.cols + 1).join('a'));
            chai_1.assert.equal(bufferService.buffer.lines.get(2).isWrapped, true);
            bufferService.buffer.y = 1;
            bufferService.buffer.x = 90;
            inputHandler.eraseInDisplay(Params_1.Params.fromArray([1]));
            chai_1.assert.equal(bufferService.buffer.lines.get(2).isWrapped, false);
        });
    });
    describe('print', () => {
        it('should not cause an infinite loop (regression test)', () => {
            const inputHandler = new TestInputHandler(new TestUtils_test_1.MockBufferService(80, 30), new TestUtils_test_1.MockCharsetService(), new TestUtils_test_1.MockCoreService(), new TestUtils_test_1.MockLogService(), new TestUtils_test_1.MockOptionsService(), new TestUtils_test_1.MockOscLinkService(), new TestUtils_test_1.MockCoreMouseService(), new TestUtils_test_1.MockUnicodeService());
            const container = new Uint32Array(10);
            container[0] = 0x200B;
            inputHandler.print(container, 0, 1);
        });
        it('should clear cells to the right on early wrap-around', async () => {
            bufferService.resize(5, 5);
            optionsService.options.scrollback = 1;
            await inputHandler.parseP('12345');
            bufferService.buffer.x = 0;
            await inputHandler.parseP('￥￥￥');
            chai_1.assert.deepEqual(getLines(bufferService, 2), ['￥￥', '￥']);
        });
    });
    describe('alt screen', () => {
        let bufferService;
        let handler;
        beforeEach(() => {
            bufferService = new TestUtils_test_1.MockBufferService(80, 30);
            handler = new TestInputHandler(bufferService, new TestUtils_test_1.MockCharsetService(), new TestUtils_test_1.MockCoreService(), new TestUtils_test_1.MockLogService(), new TestUtils_test_1.MockOptionsService(), new TestUtils_test_1.MockOscLinkService(), new TestUtils_test_1.MockCoreMouseService(), new TestUtils_test_1.MockUnicodeService());
        });
        it('should handle DECSET/DECRST 47 (alt screen buffer)', async () => {
            await handler.parseP('\x1b[?47h\r\n\x1b[31mJUNK\x1b[?47lTEST');
            chai_1.assert.equal(bufferService.buffer.translateBufferLineToString(0, true), '');
            chai_1.assert.equal(bufferService.buffer.translateBufferLineToString(1, true), '    TEST');
            chai_1.assert.equal((bufferService.buffer.lines.get(1).loadCell(4, new CellData_1.CellData()).getFgColor()), 1);
        });
        it('should handle DECSET/DECRST 1047 (alt screen buffer)', async () => {
            await handler.parseP('\x1b[?1047h\r\n\x1b[31mJUNK\x1b[?1047lTEST');
            chai_1.assert.equal(bufferService.buffer.translateBufferLineToString(0, true), '');
            chai_1.assert.equal(bufferService.buffer.translateBufferLineToString(1, true), '    TEST');
            chai_1.assert.equal((bufferService.buffer.lines.get(1).loadCell(4, new CellData_1.CellData()).getFgColor()), 1);
        });
        it('should handle DECSET/DECRST 1048 (alt screen cursor)', async () => {
            await handler.parseP('\x1b[?1048h\r\n\x1b[31mJUNK\x1b[?1048lTEST');
            chai_1.assert.equal(bufferService.buffer.translateBufferLineToString(0, true), 'TEST');
            chai_1.assert.equal(bufferService.buffer.translateBufferLineToString(1, true), 'JUNK');
            chai_1.assert.equal(bufferService.buffer.lines.get(0).loadCell(0, new CellData_1.CellData()).fg, BufferLine_1.DEFAULT_ATTR_DATA.fg);
            chai_1.assert.equal((bufferService.buffer.lines.get(1).loadCell(0, new CellData_1.CellData()).getFgColor()), 1);
        });
        it('should handle DECSET/DECRST 1049 (alt screen buffer+cursor)', async () => {
            await handler.parseP('\x1b[?1049h\r\n\x1b[31mJUNK\x1b[?1049lTEST');
            chai_1.assert.equal(bufferService.buffer.translateBufferLineToString(0, true), 'TEST');
            chai_1.assert.equal(bufferService.buffer.translateBufferLineToString(1, true), '');
            chai_1.assert.equal(bufferService.buffer.lines.get(0).loadCell(0, new CellData_1.CellData()).fg, BufferLine_1.DEFAULT_ATTR_DATA.fg);
        });
        it('should handle DECSET/DECRST 1049 - maintains saved cursor for alt buffer', async () => {
            await handler.parseP('\x1b[?1049h\r\n\x1b[31m\x1b[s\x1b[?1049lTEST');
            chai_1.assert.equal(bufferService.buffer.translateBufferLineToString(0, true), 'TEST');
            chai_1.assert.equal(bufferService.buffer.lines.get(0).loadCell(0, new CellData_1.CellData()).fg, BufferLine_1.DEFAULT_ATTR_DATA.fg);
            await handler.parseP('\x1b[?1049h\x1b[uTEST');
            chai_1.assert.equal(bufferService.buffer.translateBufferLineToString(1, true), 'TEST');
            chai_1.assert.equal((bufferService.buffer.lines.get(1).loadCell(0, new CellData_1.CellData()).getFgColor()), 1);
        });
        it('should handle DECSET/DECRST 1049 - clears alt buffer with erase attributes', async () => {
            await handler.parseP('\x1b[42m\x1b[?1049h');
            chai_1.assert.equal(bufferService.buffer.lines.get(20).loadCell(10, new CellData_1.CellData()).getBgColor(), 2);
        });
    });
    describe('text attributes', () => {
        it('bold', async () => {
            await inputHandler.parseP('\x1b[1m');
            chai_1.assert.equal(!!inputHandler.curAttrData.isBold(), true);
            await inputHandler.parseP('\x1b[22m');
            chai_1.assert.equal(!!inputHandler.curAttrData.isBold(), false);
        });
        it('dim', async () => {
            await inputHandler.parseP('\x1b[2m');
            chai_1.assert.equal(!!inputHandler.curAttrData.isDim(), true);
            await inputHandler.parseP('\x1b[22m');
            chai_1.assert.equal(!!inputHandler.curAttrData.isDim(), false);
        });
        it('italic', async () => {
            await inputHandler.parseP('\x1b[3m');
            chai_1.assert.equal(!!inputHandler.curAttrData.isItalic(), true);
            await inputHandler.parseP('\x1b[23m');
            chai_1.assert.equal(!!inputHandler.curAttrData.isItalic(), false);
        });
        it('underline', async () => {
            await inputHandler.parseP('\x1b[4m');
            chai_1.assert.equal(!!inputHandler.curAttrData.isUnderline(), true);
            await inputHandler.parseP('\x1b[24m');
            chai_1.assert.equal(!!inputHandler.curAttrData.isUnderline(), false);
        });
        it('blink', async () => {
            await inputHandler.parseP('\x1b[5m');
            chai_1.assert.equal(!!inputHandler.curAttrData.isBlink(), true);
            await inputHandler.parseP('\x1b[25m');
            chai_1.assert.equal(!!inputHandler.curAttrData.isBlink(), false);
        });
        it('inverse', async () => {
            await inputHandler.parseP('\x1b[7m');
            chai_1.assert.equal(!!inputHandler.curAttrData.isInverse(), true);
            await inputHandler.parseP('\x1b[27m');
            chai_1.assert.equal(!!inputHandler.curAttrData.isInverse(), false);
        });
        it('invisible', async () => {
            await inputHandler.parseP('\x1b[8m');
            chai_1.assert.equal(!!inputHandler.curAttrData.isInvisible(), true);
            await inputHandler.parseP('\x1b[28m');
            chai_1.assert.equal(!!inputHandler.curAttrData.isInvisible(), false);
        });
        it('strikethrough', async () => {
            await inputHandler.parseP('\x1b[9m');
            chai_1.assert.equal(!!inputHandler.curAttrData.isStrikethrough(), true);
            await inputHandler.parseP('\x1b[29m');
            chai_1.assert.equal(!!inputHandler.curAttrData.isStrikethrough(), false);
        });
        it('colormode palette 16', async () => {
            chai_1.assert.equal(inputHandler.curAttrData.getFgColorMode(), 0);
            chai_1.assert.equal(inputHandler.curAttrData.getBgColorMode(), 0);
            for (let i = 0; i < 8; ++i) {
                await inputHandler.parseP(`\x1b[${i + 30};${i + 40}m`);
                chai_1.assert.equal(inputHandler.curAttrData.getFgColorMode(), 16777216);
                chai_1.assert.equal(inputHandler.curAttrData.getFgColor(), i);
                chai_1.assert.equal(inputHandler.curAttrData.getBgColorMode(), 16777216);
                chai_1.assert.equal(inputHandler.curAttrData.getBgColor(), i);
            }
            await inputHandler.parseP(`\x1b[39;49m`);
            chai_1.assert.equal(inputHandler.curAttrData.getFgColorMode(), 0);
            chai_1.assert.equal(inputHandler.curAttrData.getBgColorMode(), 0);
        });
        it('colormode palette 256', async () => {
            chai_1.assert.equal(inputHandler.curAttrData.getFgColorMode(), 0);
            chai_1.assert.equal(inputHandler.curAttrData.getBgColorMode(), 0);
            for (let i = 0; i < 256; ++i) {
                await inputHandler.parseP(`\x1b[38;5;${i};48;5;${i}m`);
                chai_1.assert.equal(inputHandler.curAttrData.getFgColorMode(), 33554432);
                chai_1.assert.equal(inputHandler.curAttrData.getFgColor(), i);
                chai_1.assert.equal(inputHandler.curAttrData.getBgColorMode(), 33554432);
                chai_1.assert.equal(inputHandler.curAttrData.getBgColor(), i);
            }
            await inputHandler.parseP(`\x1b[39;49m`);
            chai_1.assert.equal(inputHandler.curAttrData.getFgColorMode(), 0);
            chai_1.assert.equal(inputHandler.curAttrData.getFgColor(), -1);
            chai_1.assert.equal(inputHandler.curAttrData.getBgColorMode(), 0);
            chai_1.assert.equal(inputHandler.curAttrData.getBgColor(), -1);
        });
        it('colormode RGB', async () => {
            chai_1.assert.equal(inputHandler.curAttrData.getFgColorMode(), 0);
            chai_1.assert.equal(inputHandler.curAttrData.getBgColorMode(), 0);
            await inputHandler.parseP(`\x1b[38;2;1;2;3;48;2;4;5;6m`);
            chai_1.assert.equal(inputHandler.curAttrData.getFgColorMode(), 50331648);
            chai_1.assert.equal(inputHandler.curAttrData.getFgColor(), 1 << 16 | 2 << 8 | 3);
            chai_1.assert.deepEqual(AttributeData_1.AttributeData.toColorRGB(inputHandler.curAttrData.getFgColor()), [1, 2, 3]);
            chai_1.assert.equal(inputHandler.curAttrData.getBgColorMode(), 50331648);
            chai_1.assert.deepEqual(AttributeData_1.AttributeData.toColorRGB(inputHandler.curAttrData.getBgColor()), [4, 5, 6]);
            await inputHandler.parseP(`\x1b[39;49m`);
            chai_1.assert.equal(inputHandler.curAttrData.getFgColorMode(), 0);
            chai_1.assert.equal(inputHandler.curAttrData.getFgColor(), -1);
            chai_1.assert.equal(inputHandler.curAttrData.getBgColorMode(), 0);
            chai_1.assert.equal(inputHandler.curAttrData.getBgColor(), -1);
        });
        it('colormode transition RGB to 256', async () => {
            await inputHandler.parseP(`\x1b[38;2;1;2;3;48;2;4;5;6m`);
            await inputHandler.parseP(`\x1b[38;5;255;48;5;255m`);
            chai_1.assert.equal(inputHandler.curAttrData.getFgColorMode(), 33554432);
            chai_1.assert.equal(inputHandler.curAttrData.getFgColor(), 255);
            chai_1.assert.equal(inputHandler.curAttrData.getBgColorMode(), 33554432);
            chai_1.assert.equal(inputHandler.curAttrData.getBgColor(), 255);
        });
        it('colormode transition RGB to 16', async () => {
            await inputHandler.parseP(`\x1b[38;2;1;2;3;48;2;4;5;6m`);
            await inputHandler.parseP(`\x1b[37;47m`);
            chai_1.assert.equal(inputHandler.curAttrData.getFgColorMode(), 16777216);
            chai_1.assert.equal(inputHandler.curAttrData.getFgColor(), 7);
            chai_1.assert.equal(inputHandler.curAttrData.getBgColorMode(), 16777216);
            chai_1.assert.equal(inputHandler.curAttrData.getBgColor(), 7);
        });
        it('colormode transition 16 to 256', async () => {
            await inputHandler.parseP(`\x1b[37;47m`);
            await inputHandler.parseP(`\x1b[38;5;255;48;5;255m`);
            chai_1.assert.equal(inputHandler.curAttrData.getFgColorMode(), 33554432);
            chai_1.assert.equal(inputHandler.curAttrData.getFgColor(), 255);
            chai_1.assert.equal(inputHandler.curAttrData.getBgColorMode(), 33554432);
            chai_1.assert.equal(inputHandler.curAttrData.getBgColor(), 255);
        });
        it('colormode transition 256 to 16', async () => {
            await inputHandler.parseP(`\x1b[38;5;255;48;5;255m`);
            await inputHandler.parseP(`\x1b[37;47m`);
            chai_1.assert.equal(inputHandler.curAttrData.getFgColorMode(), 16777216);
            chai_1.assert.equal(inputHandler.curAttrData.getFgColor(), 7);
            chai_1.assert.equal(inputHandler.curAttrData.getBgColorMode(), 16777216);
            chai_1.assert.equal(inputHandler.curAttrData.getBgColor(), 7);
        });
        it('should zero missing RGB values', async () => {
            await inputHandler.parseP(`\x1b[38;2;1;2;3m`);
            await inputHandler.parseP(`\x1b[38;2;5m`);
            chai_1.assert.deepEqual(AttributeData_1.AttributeData.toColorRGB(inputHandler.curAttrData.getFgColor()), [5, 0, 0]);
        });
    });
    describe('colon notation', () => {
        let inputHandler2;
        beforeEach(() => {
            inputHandler2 = new TestInputHandler(bufferService, new TestUtils_test_1.MockCharsetService(), coreService, new TestUtils_test_1.MockLogService(), optionsService, new TestUtils_test_1.MockOscLinkService(), new TestUtils_test_1.MockCoreMouseService(), new TestUtils_test_1.MockUnicodeService());
        });
        describe('should equal to semicolon', () => {
            it('CSI 38:2::50:100:150 m', async () => {
                inputHandler.curAttrData.fg = 0xFFFFFFFF;
                inputHandler2.curAttrData.fg = 0xFFFFFFFF;
                await inputHandler2.parseP('\x1b[38;2;50;100;150m');
                await inputHandler.parseP('\x1b[38:2::50:100:150m');
                chai_1.assert.equal(inputHandler2.curAttrData.fg & 0xFFFFFF, 50 << 16 | 100 << 8 | 150);
                chai_1.assert.equal(inputHandler.curAttrData.fg, inputHandler2.curAttrData.fg);
            });
            it('CSI 38:2::50:100: m', async () => {
                inputHandler.curAttrData.fg = 0xFFFFFFFF;
                inputHandler2.curAttrData.fg = 0xFFFFFFFF;
                await inputHandler2.parseP('\x1b[38;2;50;100;m');
                await inputHandler.parseP('\x1b[38:2::50:100:m');
                chai_1.assert.equal(inputHandler2.curAttrData.fg & 0xFFFFFF, 50 << 16 | 100 << 8 | 0);
                chai_1.assert.equal(inputHandler.curAttrData.fg, inputHandler2.curAttrData.fg);
            });
            it('CSI 38:2::50:: m', async () => {
                inputHandler.curAttrData.fg = 0xFFFFFFFF;
                inputHandler2.curAttrData.fg = 0xFFFFFFFF;
                await inputHandler2.parseP('\x1b[38;2;50;;m');
                await inputHandler.parseP('\x1b[38:2::50::m');
                chai_1.assert.equal(inputHandler2.curAttrData.fg & 0xFFFFFF, 50 << 16 | 0 << 8 | 0);
                chai_1.assert.equal(inputHandler.curAttrData.fg, inputHandler2.curAttrData.fg);
            });
            it('CSI 38:2:::: m', async () => {
                inputHandler.curAttrData.fg = 0xFFFFFFFF;
                inputHandler2.curAttrData.fg = 0xFFFFFFFF;
                await inputHandler2.parseP('\x1b[38;2;;;m');
                await inputHandler.parseP('\x1b[38:2::::m');
                chai_1.assert.equal(inputHandler2.curAttrData.fg & 0xFFFFFF, 0 << 16 | 0 << 8 | 0);
                chai_1.assert.equal(inputHandler.curAttrData.fg, inputHandler2.curAttrData.fg);
            });
            it('CSI 38;2::50:100:150 m', async () => {
                inputHandler.curAttrData.fg = 0xFFFFFFFF;
                inputHandler2.curAttrData.fg = 0xFFFFFFFF;
                await inputHandler2.parseP('\x1b[38;2;50;100;150m');
                await inputHandler.parseP('\x1b[38;2::50:100:150m');
                chai_1.assert.equal(inputHandler2.curAttrData.fg & 0xFFFFFF, 50 << 16 | 100 << 8 | 150);
                chai_1.assert.equal(inputHandler.curAttrData.fg, inputHandler2.curAttrData.fg);
            });
            it('CSI 38;2;50:100:150 m', async () => {
                inputHandler.curAttrData.fg = 0xFFFFFFFF;
                inputHandler2.curAttrData.fg = 0xFFFFFFFF;
                await inputHandler2.parseP('\x1b[38;2;50;100;150m');
                await inputHandler.parseP('\x1b[38;2;50:100:150m');
                chai_1.assert.equal(inputHandler2.curAttrData.fg & 0xFFFFFF, 50 << 16 | 100 << 8 | 150);
                chai_1.assert.equal(inputHandler.curAttrData.fg, inputHandler2.curAttrData.fg);
            });
            it('CSI 38;2;50;100:150 m', async () => {
                inputHandler.curAttrData.fg = 0xFFFFFFFF;
                inputHandler2.curAttrData.fg = 0xFFFFFFFF;
                await inputHandler2.parseP('\x1b[38;2;50;100;150m');
                await inputHandler.parseP('\x1b[38;2;50;100:150m');
                chai_1.assert.equal(inputHandler2.curAttrData.fg & 0xFFFFFF, 50 << 16 | 100 << 8 | 150);
                chai_1.assert.equal(inputHandler.curAttrData.fg, inputHandler2.curAttrData.fg);
            });
            it('CSI 38:5:50 m', async () => {
                inputHandler.curAttrData.fg = 0xFFFFFFFF;
                inputHandler2.curAttrData.fg = 0xFFFFFFFF;
                await inputHandler2.parseP('\x1b[38;5;50m');
                await inputHandler.parseP('\x1b[38:5:50m');
                chai_1.assert.equal(inputHandler2.curAttrData.fg & 0xFF, 50);
                chai_1.assert.equal(inputHandler.curAttrData.fg, inputHandler2.curAttrData.fg);
            });
            it('CSI 38:5: m', async () => {
                inputHandler.curAttrData.fg = 0xFFFFFFFF;
                inputHandler2.curAttrData.fg = 0xFFFFFFFF;
                await inputHandler2.parseP('\x1b[38;5;m');
                await inputHandler.parseP('\x1b[38:5:m');
                chai_1.assert.equal(inputHandler2.curAttrData.fg & 0xFF, 0);
                chai_1.assert.equal(inputHandler.curAttrData.fg, inputHandler2.curAttrData.fg);
            });
            it('CSI 38;5:50 m', async () => {
                inputHandler.curAttrData.fg = 0xFFFFFFFF;
                inputHandler2.curAttrData.fg = 0xFFFFFFFF;
                await inputHandler2.parseP('\x1b[38;5;50m');
                await inputHandler.parseP('\x1b[38;5:50m');
                chai_1.assert.equal(inputHandler2.curAttrData.fg & 0xFF, 50);
                chai_1.assert.equal(inputHandler.curAttrData.fg, inputHandler2.curAttrData.fg);
            });
        });
        describe('should fill early sequence end with default of 0', () => {
            it('CSI 38:2 m', async () => {
                inputHandler.curAttrData.fg = 0xFFFFFFFF;
                inputHandler2.curAttrData.fg = 0xFFFFFFFF;
                await inputHandler2.parseP('\x1b[38;2m');
                await inputHandler.parseP('\x1b[38:2m');
                chai_1.assert.equal(inputHandler2.curAttrData.fg & 0xFFFFFF, 0 << 16 | 0 << 8 | 0);
                chai_1.assert.equal(inputHandler.curAttrData.fg, inputHandler2.curAttrData.fg);
            });
            it('CSI 38:5 m', async () => {
                inputHandler.curAttrData.fg = 0xFFFFFFFF;
                inputHandler2.curAttrData.fg = 0xFFFFFFFF;
                await inputHandler2.parseP('\x1b[38;5m');
                await inputHandler.parseP('\x1b[38:5m');
                chai_1.assert.equal(inputHandler2.curAttrData.fg & 0xFF, 0);
                chai_1.assert.equal(inputHandler.curAttrData.fg, inputHandler2.curAttrData.fg);
            });
        });
        describe('should not interfere with leading/following SGR attrs', () => {
            it('CSI 1 ; 38:2::50:100:150 ; 4 m', async () => {
                await inputHandler2.parseP('\x1b[1;38;2;50;100;150;4m');
                await inputHandler.parseP('\x1b[1;38:2::50:100:150;4m');
                chai_1.assert.equal(!!inputHandler2.curAttrData.isBold(), true);
                chai_1.assert.equal(!!inputHandler2.curAttrData.isUnderline(), true);
                chai_1.assert.equal(inputHandler2.curAttrData.fg & 0xFFFFFF, 50 << 16 | 100 << 8 | 150);
                chai_1.assert.equal(inputHandler.curAttrData.fg, inputHandler2.curAttrData.fg);
            });
            it('CSI 1 ; 38:2::50:100: ; 4 m', async () => {
                await inputHandler2.parseP('\x1b[1;38;2;50;100;;4m');
                await inputHandler.parseP('\x1b[1;38:2::50:100:;4m');
                chai_1.assert.equal(!!inputHandler2.curAttrData.isBold(), true);
                chai_1.assert.equal(!!inputHandler2.curAttrData.isUnderline(), true);
                chai_1.assert.equal(inputHandler2.curAttrData.fg & 0xFFFFFF, 50 << 16 | 100 << 8 | 0);
                chai_1.assert.equal(inputHandler.curAttrData.fg, inputHandler2.curAttrData.fg);
            });
            it('CSI 1 ; 38:2::50:100 ; 4 m', async () => {
                await inputHandler2.parseP('\x1b[1;38;2;50;100;;4m');
                await inputHandler.parseP('\x1b[1;38:2::50:100;4m');
                chai_1.assert.equal(!!inputHandler2.curAttrData.isBold(), true);
                chai_1.assert.equal(!!inputHandler2.curAttrData.isUnderline(), true);
                chai_1.assert.equal(inputHandler2.curAttrData.fg & 0xFFFFFF, 50 << 16 | 100 << 8 | 0);
                chai_1.assert.equal(inputHandler.curAttrData.fg, inputHandler2.curAttrData.fg);
            });
            it('CSI 1 ; 38:2:: ; 4 m', async () => {
                await inputHandler2.parseP('\x1b[1;38;2;;;;4m');
                await inputHandler.parseP('\x1b[1;38:2::;4m');
                chai_1.assert.equal(!!inputHandler2.curAttrData.isBold(), true);
                chai_1.assert.equal(!!inputHandler2.curAttrData.isUnderline(), true);
                chai_1.assert.equal(inputHandler2.curAttrData.fg & 0xFFFFFF, 0);
                chai_1.assert.equal(inputHandler.curAttrData.fg, inputHandler2.curAttrData.fg);
            });
            it('CSI 1 ; 38;2:: ; 4 m', async () => {
                await inputHandler2.parseP('\x1b[1;38;2;;;;4m');
                await inputHandler.parseP('\x1b[1;38;2::;4m');
                chai_1.assert.equal(!!inputHandler2.curAttrData.isBold(), true);
                chai_1.assert.equal(!!inputHandler2.curAttrData.isUnderline(), true);
                chai_1.assert.equal(inputHandler2.curAttrData.fg & 0xFFFFFF, 0);
                chai_1.assert.equal(inputHandler.curAttrData.fg, inputHandler2.curAttrData.fg);
            });
        });
    });
    describe('cursor positioning', () => {
        beforeEach(() => {
            bufferService.resize(10, 10);
        });
        it('cursor forward (CUF)', async () => {
            await inputHandler.parseP('\x1b[C');
            chai_1.assert.deepEqual(getCursor(bufferService), [1, 0]);
            await inputHandler.parseP('\x1b[1C');
            chai_1.assert.deepEqual(getCursor(bufferService), [2, 0]);
            await inputHandler.parseP('\x1b[4C');
            chai_1.assert.deepEqual(getCursor(bufferService), [6, 0]);
            await inputHandler.parseP('\x1b[100C');
            chai_1.assert.deepEqual(getCursor(bufferService), [9, 0]);
            bufferService.buffer.x = 8;
            bufferService.buffer.y = 4;
            await inputHandler.parseP('\x1b[C');
            chai_1.assert.deepEqual(getCursor(bufferService), [9, 4]);
        });
        it('cursor backward (CUB)', async () => {
            await inputHandler.parseP('\x1b[D');
            chai_1.assert.deepEqual(getCursor(bufferService), [0, 0]);
            await inputHandler.parseP('\x1b[1D');
            chai_1.assert.deepEqual(getCursor(bufferService), [0, 0]);
            await inputHandler.parseP('\x1b[100C');
            await inputHandler.parseP('\x1b[D');
            chai_1.assert.deepEqual(getCursor(bufferService), [8, 0]);
            await inputHandler.parseP('\x1b[1D');
            chai_1.assert.deepEqual(getCursor(bufferService), [7, 0]);
            await inputHandler.parseP('\x1b[4D');
            chai_1.assert.deepEqual(getCursor(bufferService), [3, 0]);
            await inputHandler.parseP('\x1b[100D');
            chai_1.assert.deepEqual(getCursor(bufferService), [0, 0]);
            bufferService.buffer.x = 4;
            bufferService.buffer.y = 4;
            await inputHandler.parseP('\x1b[D');
            chai_1.assert.deepEqual(getCursor(bufferService), [3, 4]);
        });
        it('cursor down (CUD)', async () => {
            await inputHandler.parseP('\x1b[B');
            chai_1.assert.deepEqual(getCursor(bufferService), [0, 1]);
            await inputHandler.parseP('\x1b[1B');
            chai_1.assert.deepEqual(getCursor(bufferService), [0, 2]);
            await inputHandler.parseP('\x1b[4B');
            chai_1.assert.deepEqual(getCursor(bufferService), [0, 6]);
            await inputHandler.parseP('\x1b[100B');
            chai_1.assert.deepEqual(getCursor(bufferService), [0, 9]);
            bufferService.buffer.x = 8;
            bufferService.buffer.y = 0;
            await inputHandler.parseP('\x1b[B');
            chai_1.assert.deepEqual(getCursor(bufferService), [8, 1]);
        });
        it('cursor up (CUU)', async () => {
            await inputHandler.parseP('\x1b[A');
            chai_1.assert.deepEqual(getCursor(bufferService), [0, 0]);
            await inputHandler.parseP('\x1b[1A');
            chai_1.assert.deepEqual(getCursor(bufferService), [0, 0]);
            await inputHandler.parseP('\x1b[100B');
            await inputHandler.parseP('\x1b[A');
            chai_1.assert.deepEqual(getCursor(bufferService), [0, 8]);
            await inputHandler.parseP('\x1b[1A');
            chai_1.assert.deepEqual(getCursor(bufferService), [0, 7]);
            await inputHandler.parseP('\x1b[4A');
            chai_1.assert.deepEqual(getCursor(bufferService), [0, 3]);
            await inputHandler.parseP('\x1b[100A');
            chai_1.assert.deepEqual(getCursor(bufferService), [0, 0]);
            bufferService.buffer.x = 8;
            bufferService.buffer.y = 9;
            await inputHandler.parseP('\x1b[A');
            chai_1.assert.deepEqual(getCursor(bufferService), [8, 8]);
        });
        it('cursor next line (CNL)', async () => {
            await inputHandler.parseP('\x1b[E');
            chai_1.assert.deepEqual(getCursor(bufferService), [0, 1]);
            await inputHandler.parseP('\x1b[1E');
            chai_1.assert.deepEqual(getCursor(bufferService), [0, 2]);
            await inputHandler.parseP('\x1b[4E');
            chai_1.assert.deepEqual(getCursor(bufferService), [0, 6]);
            await inputHandler.parseP('\x1b[100E');
            chai_1.assert.deepEqual(getCursor(bufferService), [0, 9]);
            bufferService.buffer.x = 8;
            bufferService.buffer.y = 0;
            await inputHandler.parseP('\x1b[E');
            chai_1.assert.deepEqual(getCursor(bufferService), [0, 1]);
        });
        it('cursor previous line (CPL)', async () => {
            await inputHandler.parseP('\x1b[F');
            chai_1.assert.deepEqual(getCursor(bufferService), [0, 0]);
            await inputHandler.parseP('\x1b[1F');
            chai_1.assert.deepEqual(getCursor(bufferService), [0, 0]);
            await inputHandler.parseP('\x1b[100E');
            await inputHandler.parseP('\x1b[F');
            chai_1.assert.deepEqual(getCursor(bufferService), [0, 8]);
            await inputHandler.parseP('\x1b[1F');
            chai_1.assert.deepEqual(getCursor(bufferService), [0, 7]);
            await inputHandler.parseP('\x1b[4F');
            chai_1.assert.deepEqual(getCursor(bufferService), [0, 3]);
            await inputHandler.parseP('\x1b[100F');
            chai_1.assert.deepEqual(getCursor(bufferService), [0, 0]);
            bufferService.buffer.x = 8;
            bufferService.buffer.y = 9;
            await inputHandler.parseP('\x1b[F');
            chai_1.assert.deepEqual(getCursor(bufferService), [0, 8]);
        });
        it('cursor character absolute (CHA)', async () => {
            await inputHandler.parseP('\x1b[G');
            chai_1.assert.deepEqual(getCursor(bufferService), [0, 0]);
            await inputHandler.parseP('\x1b[1G');
            chai_1.assert.deepEqual(getCursor(bufferService), [0, 0]);
            await inputHandler.parseP('\x1b[2G');
            chai_1.assert.deepEqual(getCursor(bufferService), [1, 0]);
            await inputHandler.parseP('\x1b[5G');
            chai_1.assert.deepEqual(getCursor(bufferService), [4, 0]);
            await inputHandler.parseP('\x1b[100G');
            chai_1.assert.deepEqual(getCursor(bufferService), [9, 0]);
        });
        it('cursor position (CUP)', async () => {
            bufferService.buffer.x = 5;
            bufferService.buffer.y = 5;
            await inputHandler.parseP('\x1b[H');
            chai_1.assert.deepEqual(getCursor(bufferService), [0, 0]);
            bufferService.buffer.x = 5;
            bufferService.buffer.y = 5;
            await inputHandler.parseP('\x1b[1H');
            chai_1.assert.deepEqual(getCursor(bufferService), [0, 0]);
            bufferService.buffer.x = 5;
            bufferService.buffer.y = 5;
            await inputHandler.parseP('\x1b[1;1H');
            chai_1.assert.deepEqual(getCursor(bufferService), [0, 0]);
            bufferService.buffer.x = 5;
            bufferService.buffer.y = 5;
            await inputHandler.parseP('\x1b[8H');
            chai_1.assert.deepEqual(getCursor(bufferService), [0, 7]);
            bufferService.buffer.x = 5;
            bufferService.buffer.y = 5;
            await inputHandler.parseP('\x1b[;8H');
            chai_1.assert.deepEqual(getCursor(bufferService), [7, 0]);
            bufferService.buffer.x = 5;
            bufferService.buffer.y = 5;
            await inputHandler.parseP('\x1b[100;100H');
            chai_1.assert.deepEqual(getCursor(bufferService), [9, 9]);
        });
        it('horizontal position absolute (HPA)', async () => {
            await inputHandler.parseP('\x1b[`');
            chai_1.assert.deepEqual(getCursor(bufferService), [0, 0]);
            await inputHandler.parseP('\x1b[1`');
            chai_1.assert.deepEqual(getCursor(bufferService), [0, 0]);
            await inputHandler.parseP('\x1b[2`');
            chai_1.assert.deepEqual(getCursor(bufferService), [1, 0]);
            await inputHandler.parseP('\x1b[5`');
            chai_1.assert.deepEqual(getCursor(bufferService), [4, 0]);
            await inputHandler.parseP('\x1b[100`');
            chai_1.assert.deepEqual(getCursor(bufferService), [9, 0]);
        });
        it('horizontal position relative (HPR)', async () => {
            await inputHandler.parseP('\x1b[a');
            chai_1.assert.deepEqual(getCursor(bufferService), [1, 0]);
            await inputHandler.parseP('\x1b[1a');
            chai_1.assert.deepEqual(getCursor(bufferService), [2, 0]);
            await inputHandler.parseP('\x1b[4a');
            chai_1.assert.deepEqual(getCursor(bufferService), [6, 0]);
            await inputHandler.parseP('\x1b[100a');
            chai_1.assert.deepEqual(getCursor(bufferService), [9, 0]);
            bufferService.buffer.x = 8;
            bufferService.buffer.y = 4;
            await inputHandler.parseP('\x1b[a');
            chai_1.assert.deepEqual(getCursor(bufferService), [9, 4]);
        });
        it('vertical position absolute (VPA)', async () => {
            await inputHandler.parseP('\x1b[d');
            chai_1.assert.deepEqual(getCursor(bufferService), [0, 0]);
            await inputHandler.parseP('\x1b[1d');
            chai_1.assert.deepEqual(getCursor(bufferService), [0, 0]);
            await inputHandler.parseP('\x1b[2d');
            chai_1.assert.deepEqual(getCursor(bufferService), [0, 1]);
            await inputHandler.parseP('\x1b[5d');
            chai_1.assert.deepEqual(getCursor(bufferService), [0, 4]);
            await inputHandler.parseP('\x1b[100d');
            chai_1.assert.deepEqual(getCursor(bufferService), [0, 9]);
            bufferService.buffer.x = 8;
            bufferService.buffer.y = 4;
            await inputHandler.parseP('\x1b[d');
            chai_1.assert.deepEqual(getCursor(bufferService), [8, 0]);
        });
        it('vertical position relative (VPR)', async () => {
            await inputHandler.parseP('\x1b[e');
            chai_1.assert.deepEqual(getCursor(bufferService), [0, 1]);
            await inputHandler.parseP('\x1b[1e');
            chai_1.assert.deepEqual(getCursor(bufferService), [0, 2]);
            await inputHandler.parseP('\x1b[4e');
            chai_1.assert.deepEqual(getCursor(bufferService), [0, 6]);
            await inputHandler.parseP('\x1b[100e');
            chai_1.assert.deepEqual(getCursor(bufferService), [0, 9]);
            bufferService.buffer.x = 8;
            bufferService.buffer.y = 4;
            await inputHandler.parseP('\x1b[e');
            chai_1.assert.deepEqual(getCursor(bufferService), [8, 5]);
        });
        describe('should clamp cursor into addressible range', () => {
            it('CUF', async () => {
                bufferService.buffer.x = 10000;
                bufferService.buffer.y = 10000;
                await inputHandler.parseP('\x1b[C');
                chai_1.assert.deepEqual(getCursor(bufferService), [9, 9]);
                bufferService.buffer.x = -10000;
                bufferService.buffer.y = -10000;
                await inputHandler.parseP('\x1b[C');
                chai_1.assert.deepEqual(getCursor(bufferService), [1, 0]);
            });
            it('CUB', async () => {
                bufferService.buffer.x = 10000;
                bufferService.buffer.y = 10000;
                await inputHandler.parseP('\x1b[D');
                chai_1.assert.deepEqual(getCursor(bufferService), [8, 9]);
                bufferService.buffer.x = -10000;
                bufferService.buffer.y = -10000;
                await inputHandler.parseP('\x1b[D');
                chai_1.assert.deepEqual(getCursor(bufferService), [0, 0]);
            });
            it('CUD', async () => {
                bufferService.buffer.x = 10000;
                bufferService.buffer.y = 10000;
                await inputHandler.parseP('\x1b[B');
                chai_1.assert.deepEqual(getCursor(bufferService), [9, 9]);
                bufferService.buffer.x = -10000;
                bufferService.buffer.y = -10000;
                await inputHandler.parseP('\x1b[B');
                chai_1.assert.deepEqual(getCursor(bufferService), [0, 1]);
            });
            it('CUU', async () => {
                bufferService.buffer.x = 10000;
                bufferService.buffer.y = 10000;
                await inputHandler.parseP('\x1b[A');
                chai_1.assert.deepEqual(getCursor(bufferService), [9, 8]);
                bufferService.buffer.x = -10000;
                bufferService.buffer.y = -10000;
                await inputHandler.parseP('\x1b[A');
                chai_1.assert.deepEqual(getCursor(bufferService), [0, 0]);
            });
            it('CNL', async () => {
                bufferService.buffer.x = 10000;
                bufferService.buffer.y = 10000;
                await inputHandler.parseP('\x1b[E');
                chai_1.assert.deepEqual(getCursor(bufferService), [0, 9]);
                bufferService.buffer.x = -10000;
                bufferService.buffer.y = -10000;
                await inputHandler.parseP('\x1b[E');
                chai_1.assert.deepEqual(getCursor(bufferService), [0, 1]);
            });
            it('CPL', async () => {
                bufferService.buffer.x = 10000;
                bufferService.buffer.y = 10000;
                await inputHandler.parseP('\x1b[F');
                chai_1.assert.deepEqual(getCursor(bufferService), [0, 8]);
                bufferService.buffer.x = -10000;
                bufferService.buffer.y = -10000;
                await inputHandler.parseP('\x1b[F');
                chai_1.assert.deepEqual(getCursor(bufferService), [0, 0]);
            });
            it('CHA', async () => {
                bufferService.buffer.x = 10000;
                bufferService.buffer.y = 10000;
                await inputHandler.parseP('\x1b[5G');
                chai_1.assert.deepEqual(getCursor(bufferService), [4, 9]);
                bufferService.buffer.x = -10000;
                bufferService.buffer.y = -10000;
                await inputHandler.parseP('\x1b[5G');
                chai_1.assert.deepEqual(getCursor(bufferService), [4, 0]);
            });
            it('CUP', async () => {
                bufferService.buffer.x = 10000;
                bufferService.buffer.y = 10000;
                await inputHandler.parseP('\x1b[5;5H');
                chai_1.assert.deepEqual(getCursor(bufferService), [4, 4]);
                bufferService.buffer.x = -10000;
                bufferService.buffer.y = -10000;
                await inputHandler.parseP('\x1b[5;5H');
                chai_1.assert.deepEqual(getCursor(bufferService), [4, 4]);
            });
            it('HPA', async () => {
                bufferService.buffer.x = 10000;
                bufferService.buffer.y = 10000;
                await inputHandler.parseP('\x1b[5`');
                chai_1.assert.deepEqual(getCursor(bufferService), [4, 9]);
                bufferService.buffer.x = -10000;
                bufferService.buffer.y = -10000;
                await inputHandler.parseP('\x1b[5`');
                chai_1.assert.deepEqual(getCursor(bufferService), [4, 0]);
            });
            it('HPR', async () => {
                bufferService.buffer.x = 10000;
                bufferService.buffer.y = 10000;
                await inputHandler.parseP('\x1b[a');
                chai_1.assert.deepEqual(getCursor(bufferService), [9, 9]);
                bufferService.buffer.x = -10000;
                bufferService.buffer.y = -10000;
                await inputHandler.parseP('\x1b[a');
                chai_1.assert.deepEqual(getCursor(bufferService), [1, 0]);
            });
            it('VPA', async () => {
                bufferService.buffer.x = 10000;
                bufferService.buffer.y = 10000;
                await inputHandler.parseP('\x1b[5d');
                chai_1.assert.deepEqual(getCursor(bufferService), [9, 4]);
                bufferService.buffer.x = -10000;
                bufferService.buffer.y = -10000;
                await inputHandler.parseP('\x1b[5d');
                chai_1.assert.deepEqual(getCursor(bufferService), [0, 4]);
            });
            it('VPR', async () => {
                bufferService.buffer.x = 10000;
                bufferService.buffer.y = 10000;
                await inputHandler.parseP('\x1b[e');
                chai_1.assert.deepEqual(getCursor(bufferService), [9, 9]);
                bufferService.buffer.x = -10000;
                bufferService.buffer.y = -10000;
                await inputHandler.parseP('\x1b[e');
                chai_1.assert.deepEqual(getCursor(bufferService), [0, 1]);
            });
            it('DCH', async () => {
                bufferService.buffer.x = 10000;
                bufferService.buffer.y = 10000;
                await inputHandler.parseP('\x1b[P');
                chai_1.assert.deepEqual(getCursor(bufferService), [9, 9]);
                bufferService.buffer.x = -10000;
                bufferService.buffer.y = -10000;
                await inputHandler.parseP('\x1b[P');
                chai_1.assert.deepEqual(getCursor(bufferService), [0, 0]);
            });
            it('DCH - should delete last cell', async () => {
                await inputHandler.parseP('0123456789\x1b[P');
                chai_1.assert.equal(bufferService.buffer.lines.get(0).translateToString(false), '012345678 ');
            });
            it('ECH', async () => {
                bufferService.buffer.x = 10000;
                bufferService.buffer.y = 10000;
                await inputHandler.parseP('\x1b[X');
                chai_1.assert.deepEqual(getCursor(bufferService), [9, 9]);
                bufferService.buffer.x = -10000;
                bufferService.buffer.y = -10000;
                await inputHandler.parseP('\x1b[X');
                chai_1.assert.deepEqual(getCursor(bufferService), [0, 0]);
            });
            it('ECH - should delete last cell', async () => {
                await inputHandler.parseP('0123456789\x1b[X');
                chai_1.assert.equal(bufferService.buffer.lines.get(0).translateToString(false), '012345678 ');
            });
            it('ICH', async () => {
                bufferService.buffer.x = 10000;
                bufferService.buffer.y = 10000;
                await inputHandler.parseP('\x1b[@');
                chai_1.assert.deepEqual(getCursor(bufferService), [9, 9]);
                bufferService.buffer.x = -10000;
                bufferService.buffer.y = -10000;
                await inputHandler.parseP('\x1b[@');
                chai_1.assert.deepEqual(getCursor(bufferService), [0, 0]);
            });
            it('ICH - should delete last cell', async () => {
                await inputHandler.parseP('0123456789\x1b[@');
                chai_1.assert.equal(bufferService.buffer.lines.get(0).translateToString(false), '012345678 ');
            });
        });
    });
    describe('DECSTBM - scroll margins', () => {
        beforeEach(() => {
            bufferService.resize(10, 10);
        });
        it('should default to whole viewport', async () => {
            await inputHandler.parseP('\x1b[r');
            chai_1.assert.equal(bufferService.buffer.scrollTop, 0);
            chai_1.assert.equal(bufferService.buffer.scrollBottom, 9);
            await inputHandler.parseP('\x1b[3;7r');
            chai_1.assert.equal(bufferService.buffer.scrollTop, 2);
            chai_1.assert.equal(bufferService.buffer.scrollBottom, 6);
            await inputHandler.parseP('\x1b[0;0r');
            chai_1.assert.equal(bufferService.buffer.scrollTop, 0);
            chai_1.assert.equal(bufferService.buffer.scrollBottom, 9);
        });
        it('should clamp bottom', async () => {
            await inputHandler.parseP('\x1b[3;1000r');
            chai_1.assert.equal(bufferService.buffer.scrollTop, 2);
            chai_1.assert.equal(bufferService.buffer.scrollBottom, 9);
        });
        it('should only apply for top < bottom', async () => {
            await inputHandler.parseP('\x1b[7;2r');
            chai_1.assert.equal(bufferService.buffer.scrollTop, 0);
            chai_1.assert.equal(bufferService.buffer.scrollBottom, 9);
        });
        it('should home cursor', async () => {
            bufferService.buffer.x = 10000;
            bufferService.buffer.y = 10000;
            await inputHandler.parseP('\x1b[2;7r');
            chai_1.assert.deepEqual(getCursor(bufferService), [0, 0]);
        });
    });
    describe('scroll margins', () => {
        beforeEach(() => {
            bufferService.resize(10, 10);
        });
        it('scrollUp', async () => {
            await inputHandler.parseP('0\r\n1\r\n2\r\n3\r\n4\r\n5\r\n6\r\n7\r\n8\r\n9\x1b[2;4r\x1b[2Sm');
            chai_1.assert.deepEqual(getLines(bufferService), ['m', '3', '', '', '4', '5', '6', '7', '8', '9']);
        });
        it('scrollDown', async () => {
            await inputHandler.parseP('0\r\n1\r\n2\r\n3\r\n4\r\n5\r\n6\r\n7\r\n8\r\n9\x1b[2;4r\x1b[2Tm');
            chai_1.assert.deepEqual(getLines(bufferService), ['m', '', '', '1', '4', '5', '6', '7', '8', '9']);
        });
        it('insertLines - out of margins', async () => {
            await inputHandler.parseP('0\r\n1\r\n2\r\n3\r\n4\r\n5\r\n6\r\n7\r\n8\r\n9\x1b[3;6r');
            chai_1.assert.equal(bufferService.buffer.scrollTop, 2);
            chai_1.assert.equal(bufferService.buffer.scrollBottom, 5);
            await inputHandler.parseP('\x1b[2Lm');
            chai_1.assert.deepEqual(getLines(bufferService), ['m', '1', '2', '3', '4', '5', '6', '7', '8', '9']);
            await inputHandler.parseP('\x1b[2H\x1b[2Ln');
            chai_1.assert.deepEqual(getLines(bufferService), ['m', 'n', '2', '3', '4', '5', '6', '7', '8', '9']);
            await inputHandler.parseP('\x1b[7H\x1b[2Lo');
            chai_1.assert.deepEqual(getLines(bufferService), ['m', 'n', '2', '3', '4', '5', 'o', '7', '8', '9']);
            await inputHandler.parseP('\x1b[8H\x1b[2Lp');
            chai_1.assert.deepEqual(getLines(bufferService), ['m', 'n', '2', '3', '4', '5', 'o', 'p', '8', '9']);
            await inputHandler.parseP('\x1b[100H\x1b[2Lq');
            chai_1.assert.deepEqual(getLines(bufferService), ['m', 'n', '2', '3', '4', '5', 'o', 'p', '8', 'q']);
        });
        it('insertLines - within margins', async () => {
            await inputHandler.parseP('0\r\n1\r\n2\r\n3\r\n4\r\n5\r\n6\r\n7\r\n8\r\n9\x1b[3;6r');
            chai_1.assert.equal(bufferService.buffer.scrollTop, 2);
            chai_1.assert.equal(bufferService.buffer.scrollBottom, 5);
            await inputHandler.parseP('\x1b[3H\x1b[2Lm');
            chai_1.assert.deepEqual(getLines(bufferService), ['0', '1', 'm', '', '2', '3', '6', '7', '8', '9']);
            await inputHandler.parseP('\x1b[6H\x1b[2Ln');
            chai_1.assert.deepEqual(getLines(bufferService), ['0', '1', 'm', '', '2', 'n', '6', '7', '8', '9']);
        });
        it('deleteLines - out of margins', async () => {
            await inputHandler.parseP('0\r\n1\r\n2\r\n3\r\n4\r\n5\r\n6\r\n7\r\n8\r\n9\x1b[3;6r');
            chai_1.assert.equal(bufferService.buffer.scrollTop, 2);
            chai_1.assert.equal(bufferService.buffer.scrollBottom, 5);
            await inputHandler.parseP('\x1b[2Mm');
            chai_1.assert.deepEqual(getLines(bufferService), ['m', '1', '2', '3', '4', '5', '6', '7', '8', '9']);
            await inputHandler.parseP('\x1b[2H\x1b[2Mn');
            chai_1.assert.deepEqual(getLines(bufferService), ['m', 'n', '2', '3', '4', '5', '6', '7', '8', '9']);
            await inputHandler.parseP('\x1b[7H\x1b[2Mo');
            chai_1.assert.deepEqual(getLines(bufferService), ['m', 'n', '2', '3', '4', '5', 'o', '7', '8', '9']);
            await inputHandler.parseP('\x1b[8H\x1b[2Mp');
            chai_1.assert.deepEqual(getLines(bufferService), ['m', 'n', '2', '3', '4', '5', 'o', 'p', '8', '9']);
            await inputHandler.parseP('\x1b[100H\x1b[2Mq');
            chai_1.assert.deepEqual(getLines(bufferService), ['m', 'n', '2', '3', '4', '5', 'o', 'p', '8', 'q']);
        });
        it('deleteLines - within margins', async () => {
            await inputHandler.parseP('0\r\n1\r\n2\r\n3\r\n4\r\n5\r\n6\r\n7\r\n8\r\n9\x1b[3;6r');
            chai_1.assert.equal(bufferService.buffer.scrollTop, 2);
            chai_1.assert.equal(bufferService.buffer.scrollBottom, 5);
            await inputHandler.parseP('\x1b[6H\x1b[2Mm');
            chai_1.assert.deepEqual(getLines(bufferService), ['0', '1', '2', '3', '4', 'm', '6', '7', '8', '9']);
            await inputHandler.parseP('\x1b[3H\x1b[2Mn');
            chai_1.assert.deepEqual(getLines(bufferService), ['0', '1', 'n', 'm', '', '', '6', '7', '8', '9']);
        });
    });
    it('should parse big chunks in smaller subchunks', async () => {
        const calls = [];
        bufferService.resize(10, 10);
        inputHandler._parser.parse = (data, length) => {
            calls.push([data.length, length]);
        };
        await inputHandler.parseP('12345');
        await inputHandler.parseP('a'.repeat(10000));
        await inputHandler.parseP('a'.repeat(200000));
        await inputHandler.parseP('a'.repeat(300000));
        chai_1.assert.deepEqual(calls, [
            [4096, 5],
            [10000, 10000],
            [131072, 131072], [131072, 200000 - 131072],
            [131072, 131072], [131072, 131072], [131072, 300000 - 131072 - 131072]
        ]);
    });
    describe('windowOptions', () => {
        it('all should be disabled by default and not report', async () => {
            bufferService.resize(10, 10);
            const stack = [];
            coreService.onData(data => stack.push(data));
            await inputHandler.parseP('\x1b[14t');
            await inputHandler.parseP('\x1b[16t');
            await inputHandler.parseP('\x1b[18t');
            await inputHandler.parseP('\x1b[20t');
            await inputHandler.parseP('\x1b[21t');
            chai_1.assert.deepEqual(stack, []);
        });
        it('14 - GetWinSizePixels', async () => {
            bufferService.resize(10, 10);
            optionsService.options.windowOptions.getWinSizePixels = true;
            const stack = [];
            coreService.onData(data => stack.push(data));
            await inputHandler.parseP('\x1b[14t');
            chai_1.assert.deepEqual(stack, []);
        });
        it('16 - GetCellSizePixels', async () => {
            bufferService.resize(10, 10);
            optionsService.options.windowOptions.getCellSizePixels = true;
            const stack = [];
            coreService.onData(data => stack.push(data));
            await inputHandler.parseP('\x1b[16t');
            chai_1.assert.deepEqual(stack, []);
        });
        it('18 - GetWinSizeChars', async () => {
            bufferService.resize(10, 10);
            optionsService.options.windowOptions.getWinSizeChars = true;
            const stack = [];
            coreService.onData(data => stack.push(data));
            await inputHandler.parseP('\x1b[18t');
            chai_1.assert.deepEqual(stack, ['\x1b[8;10;10t']);
            bufferService.resize(50, 20);
            await inputHandler.parseP('\x1b[18t');
            chai_1.assert.deepEqual(stack, ['\x1b[8;10;10t', '\x1b[8;20;50t']);
        });
        it('22/23 - PushTitle/PopTitle', async () => {
            bufferService.resize(10, 10);
            optionsService.options.windowOptions.pushTitle = true;
            optionsService.options.windowOptions.popTitle = true;
            const stack = [];
            inputHandler.onTitleChange(data => stack.push(data));
            await inputHandler.parseP('\x1b]0;1\x07');
            await inputHandler.parseP('\x1b[22t');
            await inputHandler.parseP('\x1b]0;2\x07');
            await inputHandler.parseP('\x1b[22t');
            await inputHandler.parseP('\x1b]0;3\x07');
            await inputHandler.parseP('\x1b[22t');
            chai_1.assert.deepEqual(inputHandler.windowTitleStack, ['1', '2', '3']);
            chai_1.assert.deepEqual(inputHandler.iconNameStack, ['1', '2', '3']);
            chai_1.assert.deepEqual(stack, ['1', '2', '3']);
            await inputHandler.parseP('\x1b[23t');
            await inputHandler.parseP('\x1b[23t');
            await inputHandler.parseP('\x1b[23t');
            await inputHandler.parseP('\x1b[23t');
            chai_1.assert.deepEqual(inputHandler.windowTitleStack, []);
            chai_1.assert.deepEqual(inputHandler.iconNameStack, []);
            chai_1.assert.deepEqual(stack, ['1', '2', '3', '3', '2', '1']);
        });
        it('22/23 - PushTitle/PopTitle with ;1', async () => {
            bufferService.resize(10, 10);
            optionsService.options.windowOptions.pushTitle = true;
            optionsService.options.windowOptions.popTitle = true;
            const stack = [];
            inputHandler.onTitleChange(data => stack.push(data));
            await inputHandler.parseP('\x1b]0;1\x07');
            await inputHandler.parseP('\x1b[22;1t');
            await inputHandler.parseP('\x1b]0;2\x07');
            await inputHandler.parseP('\x1b[22;1t');
            await inputHandler.parseP('\x1b]0;3\x07');
            await inputHandler.parseP('\x1b[22;1t');
            chai_1.assert.deepEqual(inputHandler.windowTitleStack, []);
            chai_1.assert.deepEqual(inputHandler.iconNameStack, ['1', '2', '3']);
            chai_1.assert.deepEqual(stack, ['1', '2', '3']);
            await inputHandler.parseP('\x1b[23;1t');
            await inputHandler.parseP('\x1b[23;1t');
            await inputHandler.parseP('\x1b[23;1t');
            await inputHandler.parseP('\x1b[23;1t');
            chai_1.assert.deepEqual(inputHandler.windowTitleStack, []);
            chai_1.assert.deepEqual(inputHandler.iconNameStack, []);
            chai_1.assert.deepEqual(stack, ['1', '2', '3']);
        });
        it('22/23 - PushTitle/PopTitle with ;2', async () => {
            bufferService.resize(10, 10);
            optionsService.options.windowOptions.pushTitle = true;
            optionsService.options.windowOptions.popTitle = true;
            const stack = [];
            inputHandler.onTitleChange(data => stack.push(data));
            await inputHandler.parseP('\x1b]0;1\x07');
            await inputHandler.parseP('\x1b[22;2t');
            await inputHandler.parseP('\x1b]0;2\x07');
            await inputHandler.parseP('\x1b[22;2t');
            await inputHandler.parseP('\x1b]0;3\x07');
            await inputHandler.parseP('\x1b[22;2t');
            chai_1.assert.deepEqual(inputHandler.windowTitleStack, ['1', '2', '3']);
            chai_1.assert.deepEqual(inputHandler.iconNameStack, []);
            chai_1.assert.deepEqual(stack, ['1', '2', '3']);
            await inputHandler.parseP('\x1b[23;2t');
            await inputHandler.parseP('\x1b[23;2t');
            await inputHandler.parseP('\x1b[23;2t');
            await inputHandler.parseP('\x1b[23;2t');
            chai_1.assert.deepEqual(inputHandler.windowTitleStack, []);
            chai_1.assert.deepEqual(inputHandler.iconNameStack, []);
            chai_1.assert.deepEqual(stack, ['1', '2', '3', '3', '2', '1']);
        });
        it('DECCOLM - should only work with "SetWinLines" (24) enabled', async () => {
            bufferService.resize(10, 10);
            await inputHandler.parseP('\x1b[?3l');
            chai_1.assert.equal(bufferService.cols, 10);
            await inputHandler.parseP('\x1b[?3h');
            chai_1.assert.equal(bufferService.cols, 10);
            inputHandler.reset();
            optionsService.options.windowOptions.setWinLines = true;
            await inputHandler.parseP('\x1b[?3l');
            chai_1.assert.equal(bufferService.cols, 80);
            await inputHandler.parseP('\x1b[?3h');
            chai_1.assert.equal(bufferService.cols, 132);
        });
    });
    describe('should correctly reset cells taken by wide chars', () => {
        beforeEach(async () => {
            bufferService.resize(10, 5);
            optionsService.options.scrollback = 1;
            await inputHandler.parseP('￥￥￥￥￥￥￥￥￥￥￥￥￥￥￥￥￥￥￥￥');
        });
        it('print', async () => {
            await inputHandler.parseP('\x1b[H#');
            chai_1.assert.deepEqual(getLines(bufferService), ['# ￥￥￥￥', '￥￥￥￥￥', '￥￥￥￥￥', '￥￥￥￥￥', '']);
            await inputHandler.parseP('\x1b[1;6H######');
            chai_1.assert.deepEqual(getLines(bufferService), ['# ￥ #####', '# ￥￥￥￥', '￥￥￥￥￥', '￥￥￥￥￥', '']);
            await inputHandler.parseP('#');
            chai_1.assert.deepEqual(getLines(bufferService), ['# ￥ #####', '##￥￥￥￥', '￥￥￥￥￥', '￥￥￥￥￥', '']);
            await inputHandler.parseP('#');
            chai_1.assert.deepEqual(getLines(bufferService), ['# ￥ #####', '### ￥￥￥', '￥￥￥￥￥', '￥￥￥￥￥', '']);
            await inputHandler.parseP('\x1b[3;9H#');
            chai_1.assert.deepEqual(getLines(bufferService), ['# ￥ #####', '### ￥￥￥', '￥￥￥￥#', '￥￥￥￥￥', '']);
            await inputHandler.parseP('#');
            chai_1.assert.deepEqual(getLines(bufferService), ['# ￥ #####', '### ￥￥￥', '￥￥￥￥##', '￥￥￥￥￥', '']);
            await inputHandler.parseP('#');
            chai_1.assert.deepEqual(getLines(bufferService), ['# ￥ #####', '### ￥￥￥', '￥￥￥￥##', '# ￥￥￥￥', '']);
            await inputHandler.parseP('\x1b[4;10H#');
            chai_1.assert.deepEqual(getLines(bufferService), ['# ￥ #####', '### ￥￥￥', '￥￥￥￥##', '# ￥￥￥ #', '']);
        });
        it('EL', async () => {
            await inputHandler.parseP('\x1b[1;6H\x1b[K#');
            chai_1.assert.deepEqual(getLines(bufferService), ['￥￥ #', '￥￥￥￥￥', '￥￥￥￥￥', '￥￥￥￥￥', '']);
            await inputHandler.parseP('\x1b[2;5H\x1b[1K');
            chai_1.assert.deepEqual(getLines(bufferService), ['￥￥ #', '      ￥￥', '￥￥￥￥￥', '￥￥￥￥￥', '']);
            await inputHandler.parseP('\x1b[3;6H\x1b[1K');
            chai_1.assert.deepEqual(getLines(bufferService), ['￥￥ #', '      ￥￥', '      ￥￥', '￥￥￥￥￥', '']);
        });
        it('ICH', async () => {
            await inputHandler.parseP('\x1b[1;6H\x1b[@');
            chai_1.assert.deepEqual(getLines(bufferService), ['￥￥   ￥', '￥￥￥￥￥', '￥￥￥￥￥', '￥￥￥￥￥', '']);
            await inputHandler.parseP('\x1b[2;4H\x1b[2@');
            chai_1.assert.deepEqual(getLines(bufferService), ['￥￥   ￥', '￥    ￥￥', '￥￥￥￥￥', '￥￥￥￥￥', '']);
            await inputHandler.parseP('\x1b[3;4H\x1b[3@');
            chai_1.assert.deepEqual(getLines(bufferService), ['￥￥   ￥', '￥    ￥￥', '￥     ￥', '￥￥￥￥￥', '']);
            await inputHandler.parseP('\x1b[4;4H\x1b[4@');
            chai_1.assert.deepEqual(getLines(bufferService), ['￥￥   ￥', '￥    ￥￥', '￥     ￥', '￥      ￥', '']);
        });
        it('DCH', async () => {
            await inputHandler.parseP('\x1b[1;6H\x1b[P');
            chai_1.assert.deepEqual(getLines(bufferService), ['￥￥ ￥￥', '￥￥￥￥￥', '￥￥￥￥￥', '￥￥￥￥￥', '']);
            await inputHandler.parseP('\x1b[2;6H\x1b[2P');
            chai_1.assert.deepEqual(getLines(bufferService), ['￥￥ ￥￥', '￥￥  ￥', '￥￥￥￥￥', '￥￥￥￥￥', '']);
            await inputHandler.parseP('\x1b[3;6H\x1b[3P');
            chai_1.assert.deepEqual(getLines(bufferService), ['￥￥ ￥￥', '￥￥  ￥', '￥￥ ￥', '￥￥￥￥￥', '']);
        });
        it('ECH', async () => {
            await inputHandler.parseP('\x1b[1;6H\x1b[X');
            chai_1.assert.deepEqual(getLines(bufferService), ['￥￥  ￥￥', '￥￥￥￥￥', '￥￥￥￥￥', '￥￥￥￥￥', '']);
            await inputHandler.parseP('\x1b[2;6H\x1b[2X');
            chai_1.assert.deepEqual(getLines(bufferService), ['￥￥  ￥￥', '￥￥    ￥', '￥￥￥￥￥', '￥￥￥￥￥', '']);
            await inputHandler.parseP('\x1b[3;6H\x1b[3X');
            chai_1.assert.deepEqual(getLines(bufferService), ['￥￥  ￥￥', '￥￥    ￥', '￥￥    ￥', '￥￥￥￥￥', '']);
        });
    });
    describe('BS with reverseWraparound set/unset', () => {
        const ttyBS = '\x08 \x08';
        beforeEach(() => {
            bufferService.resize(5, 5);
            optionsService.options.scrollback = 1;
        });
        describe('reverseWraparound unset (default)', () => {
            it('cannot delete last cell', async () => {
                await inputHandler.parseP('12345');
                await inputHandler.parseP(ttyBS);
                chai_1.assert.deepEqual(getLines(bufferService, 1), ['123 5']);
                await inputHandler.parseP(ttyBS.repeat(10));
                chai_1.assert.deepEqual(getLines(bufferService, 1), ['    5']);
            });
            it('cannot access prev line', async () => {
                await inputHandler.parseP('12345'.repeat(2));
                await inputHandler.parseP(ttyBS);
                chai_1.assert.deepEqual(getLines(bufferService, 2), ['12345', '123 5']);
                await inputHandler.parseP(ttyBS.repeat(10));
                chai_1.assert.deepEqual(getLines(bufferService, 2), ['12345', '    5']);
            });
        });
        describe('reverseWraparound set', () => {
            it('can delete last cell', async () => {
                await inputHandler.parseP('\x1b[?45h');
                await inputHandler.parseP('12345');
                await inputHandler.parseP(ttyBS);
                chai_1.assert.deepEqual(getLines(bufferService, 1), ['1234 ']);
                await inputHandler.parseP(ttyBS.repeat(7));
                chai_1.assert.deepEqual(getLines(bufferService, 1), ['     ']);
            });
            it('can access prev line if wrapped', async () => {
                await inputHandler.parseP('\x1b[?45h');
                await inputHandler.parseP('12345'.repeat(2));
                await inputHandler.parseP(ttyBS);
                chai_1.assert.deepEqual(getLines(bufferService, 2), ['12345', '1234 ']);
                await inputHandler.parseP(ttyBS.repeat(7));
                chai_1.assert.deepEqual(getLines(bufferService, 2), ['12   ', '     ']);
            });
            it('should lift isWrapped', async () => {
                await inputHandler.parseP('\x1b[?45h');
                await inputHandler.parseP('12345'.repeat(2));
                chai_1.assert.equal(bufferService.buffer.lines.get(1)?.isWrapped, true);
                await inputHandler.parseP(ttyBS.repeat(7));
                chai_1.assert.equal(bufferService.buffer.lines.get(1)?.isWrapped, false);
            });
            it('stops at hard NLs', async () => {
                await inputHandler.parseP('\x1b[?45h');
                await inputHandler.parseP('12345\r\n');
                await inputHandler.parseP('12345'.repeat(2));
                await inputHandler.parseP(ttyBS.repeat(50));
                chai_1.assert.deepEqual(getLines(bufferService, 3), ['12345', '     ', '     ']);
                chai_1.assert.equal(bufferService.buffer.x, 0);
                chai_1.assert.equal(bufferService.buffer.y, 1);
            });
            it('handles wide chars correctly', async () => {
                await inputHandler.parseP('\x1b[?45h');
                await inputHandler.parseP('￥￥￥');
                chai_1.assert.deepEqual(getLines(bufferService, 2), ['￥￥', '￥']);
                await inputHandler.parseP(ttyBS);
                chai_1.assert.deepEqual(getLines(bufferService, 2), ['￥￥', '  ']);
                chai_1.assert.equal(bufferService.buffer.x, 1);
                await inputHandler.parseP(ttyBS);
                chai_1.assert.deepEqual(getLines(bufferService, 2), ['￥￥', '  ']);
                chai_1.assert.equal(bufferService.buffer.x, 0);
                await inputHandler.parseP(ttyBS);
                chai_1.assert.deepEqual(getLines(bufferService, 2), ['￥  ', '  ']);
                chai_1.assert.equal(bufferService.buffer.x, 3);
                await inputHandler.parseP(ttyBS);
                chai_1.assert.deepEqual(getLines(bufferService, 2), ['￥  ', '  ']);
                chai_1.assert.equal(bufferService.buffer.x, 2);
                await inputHandler.parseP(ttyBS);
                chai_1.assert.deepEqual(getLines(bufferService, 2), ['    ', '  ']);
                chai_1.assert.equal(bufferService.buffer.x, 1);
                await inputHandler.parseP(ttyBS);
                chai_1.assert.deepEqual(getLines(bufferService, 2), ['    ', '  ']);
                chai_1.assert.equal(bufferService.buffer.x, 0);
            });
        });
    });
    describe('reset text attributes (SGR 0)', () => {
        it('resets all attributes if there is no url', async () => {
            await inputHandler.parseP('\x1b[30m\x1b[40m\x1b[4m');
            chai_1.assert.notEqual(inputHandler.curAttrData.fg, 0);
            chai_1.assert.notEqual(inputHandler.curAttrData.bg, 0);
            chai_1.assert.isFalse(inputHandler.curAttrData.extended.isEmpty());
            await inputHandler.parseP('\x1b[m');
            chai_1.assert.equal(inputHandler.curAttrData.fg, 0);
            chai_1.assert.equal(inputHandler.curAttrData.bg, 0);
            chai_1.assert.isTrue(inputHandler.curAttrData.extended.isEmpty());
        });
        it('resets all attributes except for the url', async () => {
            await inputHandler.parseP('\x1b[30m\x1b[40m\x1b[4m');
            await inputHandler.parseP('\x1b]8;;http://example.com\x1b\\');
            chai_1.assert.notEqual(inputHandler.curAttrData.fg, 0);
            chai_1.assert.notEqual(inputHandler.curAttrData.bg, 0);
            chai_1.assert.notEqual(inputHandler.curAttrData.extended.ext, 0);
            const urlId = inputHandler.curAttrData.extended.urlId;
            chai_1.assert.notEqual(urlId, 0);
            await inputHandler.parseP('\x1b[m');
            chai_1.assert.equal(inputHandler.curAttrData.fg, 0);
            chai_1.assert.equal(inputHandler.curAttrData.bg, 268435456);
            const expectedExtended = new AttributeData_1.ExtendedAttrs();
            expectedExtended.urlId = urlId;
            chai_1.assert.deepEqual(inputHandler.curAttrData.extended, expectedExtended);
        });
    });
    describe('extended underline style support (SGR 4)', () => {
        beforeEach(() => {
            bufferService.resize(10, 5);
        });
        it('4 | 24', async () => {
            await inputHandler.parseP('\x1b[4m');
            chai_1.assert.equal(inputHandler.curAttrData.getUnderlineStyle(), 1);
            await inputHandler.parseP('\x1b[24m');
            chai_1.assert.equal(inputHandler.curAttrData.getUnderlineStyle(), 0);
        });
        it('21 | 24', async () => {
            await inputHandler.parseP('\x1b[21m');
            chai_1.assert.equal(inputHandler.curAttrData.getUnderlineStyle(), 2);
            await inputHandler.parseP('\x1b[24m');
            chai_1.assert.equal(inputHandler.curAttrData.getUnderlineStyle(), 0);
        });
        it('4:1 | 4:0', async () => {
            await inputHandler.parseP('\x1b[4:1m');
            chai_1.assert.equal(inputHandler.curAttrData.getUnderlineStyle(), 1);
            await inputHandler.parseP('\x1b[4:0m');
            chai_1.assert.equal(inputHandler.curAttrData.getUnderlineStyle(), 0);
            await inputHandler.parseP('\x1b[4:1m');
            chai_1.assert.equal(inputHandler.curAttrData.getUnderlineStyle(), 1);
            await inputHandler.parseP('\x1b[24m');
            chai_1.assert.equal(inputHandler.curAttrData.getUnderlineStyle(), 0);
        });
        it('4:2 | 4:0', async () => {
            await inputHandler.parseP('\x1b[4:2m');
            chai_1.assert.equal(inputHandler.curAttrData.getUnderlineStyle(), 2);
            await inputHandler.parseP('\x1b[4:0m');
            chai_1.assert.equal(inputHandler.curAttrData.getUnderlineStyle(), 0);
            await inputHandler.parseP('\x1b[4:2m');
            chai_1.assert.equal(inputHandler.curAttrData.getUnderlineStyle(), 2);
            await inputHandler.parseP('\x1b[24m');
            chai_1.assert.equal(inputHandler.curAttrData.getUnderlineStyle(), 0);
        });
        it('4:3 | 4:0', async () => {
            await inputHandler.parseP('\x1b[4:3m');
            chai_1.assert.equal(inputHandler.curAttrData.getUnderlineStyle(), 3);
            await inputHandler.parseP('\x1b[4:0m');
            chai_1.assert.equal(inputHandler.curAttrData.getUnderlineStyle(), 0);
            await inputHandler.parseP('\x1b[4:3m');
            chai_1.assert.equal(inputHandler.curAttrData.getUnderlineStyle(), 3);
            await inputHandler.parseP('\x1b[24m');
            chai_1.assert.equal(inputHandler.curAttrData.getUnderlineStyle(), 0);
        });
        it('4:4 | 4:0', async () => {
            await inputHandler.parseP('\x1b[4:4m');
            chai_1.assert.equal(inputHandler.curAttrData.getUnderlineStyle(), 4);
            await inputHandler.parseP('\x1b[4:0m');
            chai_1.assert.equal(inputHandler.curAttrData.getUnderlineStyle(), 0);
            await inputHandler.parseP('\x1b[4:4m');
            chai_1.assert.equal(inputHandler.curAttrData.getUnderlineStyle(), 4);
            await inputHandler.parseP('\x1b[24m');
            chai_1.assert.equal(inputHandler.curAttrData.getUnderlineStyle(), 0);
        });
        it('4:5 | 4:0', async () => {
            await inputHandler.parseP('\x1b[4:5m');
            chai_1.assert.equal(inputHandler.curAttrData.getUnderlineStyle(), 5);
            await inputHandler.parseP('\x1b[4:0m');
            chai_1.assert.equal(inputHandler.curAttrData.getUnderlineStyle(), 0);
            await inputHandler.parseP('\x1b[4:5m');
            chai_1.assert.equal(inputHandler.curAttrData.getUnderlineStyle(), 5);
            await inputHandler.parseP('\x1b[24m');
            chai_1.assert.equal(inputHandler.curAttrData.getUnderlineStyle(), 0);
        });
        it('4:x --> 4 should revert to single underline', async () => {
            await inputHandler.parseP('\x1b[4:5m');
            chai_1.assert.equal(inputHandler.curAttrData.getUnderlineStyle(), 5);
            await inputHandler.parseP('\x1b[4m');
            chai_1.assert.equal(inputHandler.curAttrData.getUnderlineStyle(), 1);
        });
    });
    describe('underline colors (SGR 58 & SGR 59)', () => {
        beforeEach(() => {
            bufferService.resize(10, 5);
        });
        it('defaults to FG color', async () => {
            for (const s of ['', '\x1b[30m', '\x1b[38;510m', '\x1b[38;2;1;2;3m']) {
                await inputHandler.parseP(s);
                chai_1.assert.equal(inputHandler.curAttrData.getUnderlineColor(), inputHandler.curAttrData.getFgColor());
                chai_1.assert.equal(inputHandler.curAttrData.getUnderlineColorMode(), inputHandler.curAttrData.getFgColorMode());
                chai_1.assert.equal(inputHandler.curAttrData.isUnderlineColorRGB(), inputHandler.curAttrData.isFgRGB());
                chai_1.assert.equal(inputHandler.curAttrData.isUnderlineColorPalette(), inputHandler.curAttrData.isFgPalette());
                chai_1.assert.equal(inputHandler.curAttrData.isUnderlineColorDefault(), inputHandler.curAttrData.isFgDefault());
            }
        });
        it('correctly sets P256/RGB colors', async () => {
            await inputHandler.parseP('\x1b[4m');
            await inputHandler.parseP('\x1b[58;5;123m');
            chai_1.assert.equal(inputHandler.curAttrData.getUnderlineColor(), 123);
            chai_1.assert.equal(inputHandler.curAttrData.getUnderlineColorMode(), 33554432);
            chai_1.assert.equal(inputHandler.curAttrData.isUnderlineColorRGB(), false);
            chai_1.assert.equal(inputHandler.curAttrData.isUnderlineColorPalette(), true);
            chai_1.assert.equal(inputHandler.curAttrData.isUnderlineColorDefault(), false);
            await inputHandler.parseP('\x1b[58;2::1:2:3m');
            chai_1.assert.equal(inputHandler.curAttrData.getUnderlineColor(), (1 << 16) | (2 << 8) | 3);
            chai_1.assert.equal(inputHandler.curAttrData.getUnderlineColorMode(), 50331648);
            chai_1.assert.equal(inputHandler.curAttrData.isUnderlineColorRGB(), true);
            chai_1.assert.equal(inputHandler.curAttrData.isUnderlineColorPalette(), false);
            chai_1.assert.equal(inputHandler.curAttrData.isUnderlineColorDefault(), false);
        });
        it('P256/RGB persistence', async () => {
            const cell = new CellData_1.CellData();
            await inputHandler.parseP('\x1b[4m');
            await inputHandler.parseP('\x1b[58;5;123m');
            chai_1.assert.equal(inputHandler.curAttrData.getUnderlineColor(), 123);
            chai_1.assert.equal(inputHandler.curAttrData.getUnderlineColorMode(), 33554432);
            chai_1.assert.equal(inputHandler.curAttrData.isUnderlineColorRGB(), false);
            chai_1.assert.equal(inputHandler.curAttrData.isUnderlineColorPalette(), true);
            chai_1.assert.equal(inputHandler.curAttrData.isUnderlineColorDefault(), false);
            await inputHandler.parseP('ab');
            bufferService.buffer.lines.get(0).loadCell(1, cell);
            chai_1.assert.equal(cell.getUnderlineColor(), 123);
            chai_1.assert.equal(cell.getUnderlineColorMode(), 33554432);
            chai_1.assert.equal(cell.isUnderlineColorRGB(), false);
            chai_1.assert.equal(cell.isUnderlineColorPalette(), true);
            chai_1.assert.equal(cell.isUnderlineColorDefault(), false);
            await inputHandler.parseP('\x1b[4:0m');
            chai_1.assert.equal(inputHandler.curAttrData.getUnderlineColor(), inputHandler.curAttrData.getFgColor());
            chai_1.assert.equal(inputHandler.curAttrData.getUnderlineColorMode(), inputHandler.curAttrData.getFgColorMode());
            chai_1.assert.equal(inputHandler.curAttrData.isUnderlineColorRGB(), inputHandler.curAttrData.isFgRGB());
            chai_1.assert.equal(inputHandler.curAttrData.isUnderlineColorPalette(), inputHandler.curAttrData.isFgPalette());
            chai_1.assert.equal(inputHandler.curAttrData.isUnderlineColorDefault(), inputHandler.curAttrData.isFgDefault());
            await inputHandler.parseP('a');
            bufferService.buffer.lines.get(0).loadCell(1, cell);
            chai_1.assert.equal(cell.getUnderlineColor(), 123);
            chai_1.assert.equal(cell.getUnderlineColorMode(), 33554432);
            chai_1.assert.equal(cell.isUnderlineColorRGB(), false);
            chai_1.assert.equal(cell.isUnderlineColorPalette(), true);
            chai_1.assert.equal(cell.isUnderlineColorDefault(), false);
            bufferService.buffer.lines.get(0).loadCell(2, cell);
            chai_1.assert.equal(cell.getUnderlineColor(), inputHandler.curAttrData.getFgColor());
            chai_1.assert.equal(cell.getUnderlineColorMode(), inputHandler.curAttrData.getFgColorMode());
            chai_1.assert.equal(cell.isUnderlineColorRGB(), inputHandler.curAttrData.isFgRGB());
            chai_1.assert.equal(cell.isUnderlineColorPalette(), inputHandler.curAttrData.isFgPalette());
            chai_1.assert.equal(cell.isUnderlineColorDefault(), inputHandler.curAttrData.isFgDefault());
            await inputHandler.parseP('\x1b[4m');
            await inputHandler.parseP('\x1b[58;2::1:2:3m');
            chai_1.assert.equal(inputHandler.curAttrData.getUnderlineColor(), (1 << 16) | (2 << 8) | 3);
            chai_1.assert.equal(inputHandler.curAttrData.getUnderlineColorMode(), 50331648);
            chai_1.assert.equal(inputHandler.curAttrData.isUnderlineColorRGB(), true);
            chai_1.assert.equal(inputHandler.curAttrData.isUnderlineColorPalette(), false);
            chai_1.assert.equal(inputHandler.curAttrData.isUnderlineColorDefault(), false);
            await inputHandler.parseP('a');
            await inputHandler.parseP('\x1b[24m');
            bufferService.buffer.lines.get(0).loadCell(1, cell);
            chai_1.assert.equal(cell.getUnderlineColor(), 123);
            chai_1.assert.equal(cell.getUnderlineColorMode(), 33554432);
            chai_1.assert.equal(cell.isUnderlineColorRGB(), false);
            chai_1.assert.equal(cell.isUnderlineColorPalette(), true);
            chai_1.assert.equal(cell.isUnderlineColorDefault(), false);
            bufferService.buffer.lines.get(0).loadCell(3, cell);
            chai_1.assert.equal(cell.getUnderlineColor(), (1 << 16) | (2 << 8) | 3);
            chai_1.assert.equal(cell.getUnderlineColorMode(), 50331648);
            chai_1.assert.equal(cell.isUnderlineColorRGB(), true);
            chai_1.assert.equal(cell.isUnderlineColorPalette(), false);
            chai_1.assert.equal(cell.isUnderlineColorDefault(), false);
            chai_1.assert.equal(bufferService.buffer.lines.get(0)._extendedAttrs[0], bufferService.buffer.lines.get(0)._extendedAttrs[1]);
            chai_1.assert.equal(bufferService.buffer.lines.get(0)._extendedAttrs[2], undefined);
            chai_1.assert.notEqual(bufferService.buffer.lines.get(0)._extendedAttrs[1], bufferService.buffer.lines.get(0)._extendedAttrs[3]);
        });
    });
    describe('DECSTR', () => {
        beforeEach(async () => {
            bufferService.resize(10, 5);
            optionsService.options.scrollback = 1;
            await inputHandler.parseP('01234567890123');
        });
        it('should reset IRM', async () => {
            await inputHandler.parseP('\x1b[4h');
            chai_1.assert.equal(coreService.modes.insertMode, true);
            await inputHandler.parseP('\x1b[!p');
            chai_1.assert.equal(coreService.modes.insertMode, false);
        });
        it('should reset cursor visibility', async () => {
            await inputHandler.parseP('\x1b[?25l');
            chai_1.assert.equal(coreService.isCursorHidden, true);
            await inputHandler.parseP('\x1b[!p');
            chai_1.assert.equal(coreService.isCursorHidden, false);
        });
        it('should reset scroll margins', async () => {
            await inputHandler.parseP('\x1b[2;4r');
            chai_1.assert.equal(bufferService.buffer.scrollTop, 1);
            chai_1.assert.equal(bufferService.buffer.scrollBottom, 3);
            await inputHandler.parseP('\x1b[!p');
            chai_1.assert.equal(bufferService.buffer.scrollTop, 0);
            chai_1.assert.equal(bufferService.buffer.scrollBottom, bufferService.rows - 1);
        });
        it('should reset text attributes', async () => {
            await inputHandler.parseP('\x1b[1;2;32;43m');
            chai_1.assert.equal(!!inputHandler.curAttrData.isBold(), true);
            await inputHandler.parseP('\x1b[!p');
            chai_1.assert.equal(!!inputHandler.curAttrData.isBold(), false);
            chai_1.assert.equal(inputHandler.curAttrData.fg, 0);
            chai_1.assert.equal(inputHandler.curAttrData.bg, 0);
        });
        it('should reset DECSC data', async () => {
            await inputHandler.parseP('\x1b7');
            chai_1.assert.equal(bufferService.buffer.savedX, 4);
            chai_1.assert.equal(bufferService.buffer.savedY, 1);
            await inputHandler.parseP('\x1b[!p');
            chai_1.assert.equal(bufferService.buffer.savedX, 0);
            chai_1.assert.equal(bufferService.buffer.savedY, 0);
        });
        it('should reset DECOM', async () => {
            await inputHandler.parseP('\x1b[?6h');
            chai_1.assert.equal(coreService.decPrivateModes.origin, true);
            await inputHandler.parseP('\x1b[!p');
            chai_1.assert.equal(coreService.decPrivateModes.origin, false);
        });
    });
    describe('OSC', () => {
        it('4: query color events', async () => {
            const stack = [];
            inputHandler.onColor(ev => stack.push(ev));
            await inputHandler.parseP('\x1b]4;0;?\x07');
            chai_1.assert.deepEqual(stack, [[{ type: 0, index: 0 }]]);
            stack.length = 0;
            await inputHandler.parseP('\x1b]4;123;?\x07');
            chai_1.assert.deepEqual(stack, [[{ type: 0, index: 123 }]]);
            stack.length = 0;
            await inputHandler.parseP('\x1b]4;0;?;123;?\x07');
            chai_1.assert.deepEqual(stack, [[{ type: 0, index: 0 }, { type: 0, index: 123 }]]);
            stack.length = 0;
        });
        it('4: set color events', async () => {
            const stack = [];
            inputHandler.onColor(ev => stack.push(ev));
            await inputHandler.parseP('\x1b]4;0;rgb:01/02/03\x07');
            chai_1.assert.deepEqual(stack, [[{ type: 1, index: 0, color: [1, 2, 3] }]]);
            stack.length = 0;
            await inputHandler.parseP('\x1b]4;123;#aabbcc\x07');
            chai_1.assert.deepEqual(stack, [[{ type: 1, index: 123, color: [170, 187, 204] }]]);
            stack.length = 0;
            await inputHandler.parseP('\x1b]4;0;rgb:aa/bb/cc;123;#001122\x07');
            chai_1.assert.deepEqual(stack, [[{ type: 1, index: 0, color: [170, 187, 204] }, { type: 1, index: 123, color: [0, 17, 34] }]]);
            stack.length = 0;
        });
        it('4: should ignore invalid values', async () => {
            const stack = [];
            inputHandler.onColor(ev => stack.push(ev));
            await inputHandler.parseP('\x1b]4;0;rgb:aa/bb/cc;45;rgb:1/22/333;123;#001122\x07');
            chai_1.assert.deepEqual(stack, [[{ type: 1, index: 0, color: [170, 187, 204] }, { type: 1, index: 123, color: [0, 17, 34] }]]);
            stack.length = 0;
        });
        it('104: restore events', async () => {
            const stack = [];
            inputHandler.onColor(ev => stack.push(ev));
            await inputHandler.parseP('\x1b]104;0\x07\x1b]104;43\x07');
            chai_1.assert.deepEqual(stack, [[{ type: 2, index: 0 }], [{ type: 2, index: 43 }]]);
            stack.length = 0;
            await inputHandler.parseP('\x1b]104;0;43\x07');
            chai_1.assert.deepEqual(stack, [[{ type: 2, index: 0 }, { type: 2, index: 43 }]]);
            stack.length = 0;
            await inputHandler.parseP('\x1b]104\x07');
            chai_1.assert.deepEqual(stack, [[{ type: 2 }]]);
        });
        it('10: FG set & query events', async () => {
            const stack = [];
            inputHandler.onColor(ev => stack.push(ev));
            await inputHandler.parseP('\x1b]10;?\x07');
            chai_1.assert.deepEqual(stack, [[{ type: 0, index: 256 }]]);
            stack.length = 0;
            await inputHandler.parseP('\x1b]10;?;?;?;?\x07');
            chai_1.assert.deepEqual(stack, [[{ type: 0, index: 256 }], [{ type: 0, index: 257 }], [{ type: 0, index: 258 }]]);
            stack.length = 0;
            await inputHandler.parseP('\x1b]10;rgb:01/02/03\x07');
            chai_1.assert.deepEqual(stack, [[{ type: 1, index: 256, color: [1, 2, 3] }]]);
            stack.length = 0;
            await inputHandler.parseP('\x1b]10;#aabbcc\x07');
            chai_1.assert.deepEqual(stack, [[{ type: 1, index: 256, color: [170, 187, 204] }]]);
            stack.length = 0;
            await inputHandler.parseP('\x1b]10;rgb:aa/bb/cc;#001122;rgb:12/34/56\x07');
            chai_1.assert.deepEqual(stack, [
                [{ type: 1, index: 256, color: [170, 187, 204] }],
                [{ type: 1, index: 257, color: [0, 17, 34] }],
                [{ type: 1, index: 258, color: [18, 52, 86] }]
            ]);
        });
        it('110: restore FG color', async () => {
            const stack = [];
            inputHandler.onColor(ev => stack.push(ev));
            await inputHandler.parseP('\x1b]110\x07');
            chai_1.assert.deepEqual(stack, [[{ type: 2, index: 256 }]]);
        });
        it('11: BG set & query events', async () => {
            const stack = [];
            inputHandler.onColor(ev => stack.push(ev));
            await inputHandler.parseP('\x1b]11;?\x07');
            chai_1.assert.deepEqual(stack, [[{ type: 0, index: 257 }]]);
            stack.length = 0;
            await inputHandler.parseP('\x1b]11;?;?;?;?\x07');
            chai_1.assert.deepEqual(stack, [[{ type: 0, index: 257 }], [{ type: 0, index: 258 }]]);
            stack.length = 0;
            await inputHandler.parseP('\x1b]11;rgb:01/02/03\x07');
            chai_1.assert.deepEqual(stack, [[{ type: 1, index: 257, color: [1, 2, 3] }]]);
            stack.length = 0;
            await inputHandler.parseP('\x1b]11;#aabbcc\x07');
            chai_1.assert.deepEqual(stack, [[{ type: 1, index: 257, color: [170, 187, 204] }]]);
            stack.length = 0;
            await inputHandler.parseP('\x1b]11;#001122;rgb:12/34/56\x07');
            chai_1.assert.deepEqual(stack, [
                [{ type: 1, index: 257, color: [0, 17, 34] }],
                [{ type: 1, index: 258, color: [18, 52, 86] }]
            ]);
        });
        it('111: restore BG color', async () => {
            const stack = [];
            inputHandler.onColor(ev => stack.push(ev));
            await inputHandler.parseP('\x1b]111\x07');
            chai_1.assert.deepEqual(stack, [[{ type: 2, index: 257 }]]);
        });
        it('12: cursor color set & query events', async () => {
            const stack = [];
            inputHandler.onColor(ev => stack.push(ev));
            await inputHandler.parseP('\x1b]12;?\x07');
            chai_1.assert.deepEqual(stack, [[{ type: 0, index: 258 }]]);
            stack.length = 0;
            await inputHandler.parseP('\x1b]12;?;?;?;?\x07');
            chai_1.assert.deepEqual(stack, [[{ type: 0, index: 258 }]]);
            stack.length = 0;
            await inputHandler.parseP('\x1b]12;rgb:01/02/03\x07');
            chai_1.assert.deepEqual(stack, [[{ type: 1, index: 258, color: [1, 2, 3] }]]);
            stack.length = 0;
            await inputHandler.parseP('\x1b]12;#aabbcc\x07');
            chai_1.assert.deepEqual(stack, [[{ type: 1, index: 258, color: [170, 187, 204] }]]);
        });
        it('112: restore cursor color', async () => {
            const stack = [];
            inputHandler.onColor(ev => stack.push(ev));
            await inputHandler.parseP('\x1b]112\x07');
            chai_1.assert.deepEqual(stack, [[{ type: 2, index: 258 }]]);
        });
    });
    describe('EL/ED cursor at buffer.cols', () => {
        beforeEach(() => {
            bufferService.resize(10, 5);
        });
        describe('cursor should stay at cols / does not overflow', () => {
            it('EL0', async () => {
                await inputHandler.parseP('##########\x1b[0K');
                chai_1.assert.equal(bufferService.buffer.x, 10);
                chai_1.assert.deepEqual(getLines(bufferService), ['#'.repeat(10), '', '', '', '']);
            });
            it('EL1', async () => {
                await inputHandler.parseP('##########\x1b[1K');
                chai_1.assert.equal(bufferService.buffer.x, 10);
                chai_1.assert.deepEqual(getLines(bufferService), ['', '', '', '', '']);
            });
            it('EL2', async () => {
                await inputHandler.parseP('##########\x1b[2K');
                chai_1.assert.equal(bufferService.buffer.x, 10);
                chai_1.assert.deepEqual(getLines(bufferService), ['', '', '', '', '']);
            });
            it('ED0', async () => {
                await inputHandler.parseP('##########\x1b[0J');
                chai_1.assert.equal(bufferService.buffer.x, 10);
                chai_1.assert.deepEqual(getLines(bufferService), ['#'.repeat(10), '', '', '', '']);
            });
            it('ED1', async () => {
                await inputHandler.parseP('##########\x1b[1J');
                chai_1.assert.equal(bufferService.buffer.x, 10);
                chai_1.assert.deepEqual(getLines(bufferService), ['', '', '', '', '']);
            });
            it('ED2', async () => {
                await inputHandler.parseP('##########\x1b[2J');
                chai_1.assert.equal(bufferService.buffer.x, 10);
                chai_1.assert.deepEqual(getLines(bufferService), ['', '', '', '', '']);
            });
            it('ED3', async () => {
                await inputHandler.parseP('##########\x1b[3J');
                chai_1.assert.equal(bufferService.buffer.x, 10);
                chai_1.assert.deepEqual(getLines(bufferService), ['#'.repeat(10), '', '', '', '']);
            });
        });
        describe('following sequence keeps working', () => {
            const SEQ = [
                '\x1b[10@',
                '\x1b[10 @',
                '\x1b[10A',
                '\x1b[10 A',
                '\x1b[10B',
                '\x1b[10C',
                '\x1b[10D',
                '\x1b[10E',
                '\x1b[10F',
                '\x1b[10G',
                '\x1b[10;10H',
                '\x1b[10I',
                '\x1b[10L',
                '\x1b[10M',
                '\x1b[10P',
                '\x1b[10S',
                '\x1b[10T',
                '\x1b[10X',
                '\x1b[10Z',
                '\x1b[10`',
                '\x1b[10a',
                '\x1b[10b',
                '\x1b[10d',
                '\x1b[10e',
                '\x1b[10;10f',
                '\x1b[0g',
                '\x1b[s',
                '\x1b[10\'}',
                '\x1b[10\'~'
            ];
            it('cursor never advances beyond cols', async () => {
                for (const seq of SEQ) {
                    await inputHandler.parseP('##########\x1b[2J' + seq);
                    chai_1.assert.equal(bufferService.buffer.x <= bufferService.cols, true);
                    inputHandler.reset();
                    bufferService.reset();
                }
            });
        });
    });
    describe('DECSCA and DECSED/DECSEL', () => {
        it('default is unprotected', async () => {
            await inputHandler.parseP('some text');
            await inputHandler.parseP('\x1b[?2K');
            chai_1.assert.deepEqual(getLines(bufferService, 2), ['', '']);
            await inputHandler.parseP('some text');
            await inputHandler.parseP('\x1b[?2J');
            chai_1.assert.deepEqual(getLines(bufferService, 2), ['', '']);
        });
        it('DECSCA 1 with DECSEL', async () => {
            await inputHandler.parseP('###\x1b[1"qlineerase\x1b[0"q***');
            await inputHandler.parseP('\x1b[?2K');
            chai_1.assert.deepEqual(getLines(bufferService, 2), ['   lineerase', '']);
            await inputHandler.parseP('\x1b[2K');
            chai_1.assert.deepEqual(getLines(bufferService, 2), ['', '']);
        });
        it('DECSCA 1 with DECSED', async () => {
            await inputHandler.parseP('###\x1b[1"qdisplayerase\x1b[0"q***');
            await inputHandler.parseP('\x1b[?2J');
            chai_1.assert.deepEqual(getLines(bufferService, 2), ['   displayerase', '']);
            await inputHandler.parseP('\x1b[2J');
            chai_1.assert.deepEqual(getLines(bufferService, 2), ['', '']);
        });
        it('DECRQSS reports correct DECSCA state', async () => {
            const sendStack = [];
            coreService.onData(d => sendStack.push(d));
            await inputHandler.parseP('\x1bP$q"q\x1b\\');
            chai_1.assert.deepEqual(sendStack.pop(), '\x1bP1$r0"q\x1b\\');
            await inputHandler.parseP('###\x1b[1"q');
            await inputHandler.parseP('\x1bP$q"q\x1b\\');
            chai_1.assert.deepEqual(sendStack.pop(), '\x1bP1$r1"q\x1b\\');
            await inputHandler.parseP('###\x1b[2"q');
            await inputHandler.parseP('\x1bP$q"q\x1b\\');
            chai_1.assert.deepEqual(sendStack.pop(), '\x1bP1$r0"q\x1b\\');
        });
    });
    describe('DECRQM', () => {
        const reportStack = [];
        beforeEach(() => {
            reportStack.length = 0;
            coreService.onData(data => reportStack.push(data));
        });
        it('ANSI 2 (keyboard action mode)', async () => {
            await inputHandler.parseP('\x1b[2$p');
            chai_1.assert.deepEqual(reportStack.pop(), '\x1b[2;4$y');
        });
        it('ANSI 4 (insert mode)', async () => {
            await inputHandler.parseP('\x1b[4$p');
            chai_1.assert.deepEqual(reportStack.pop(), '\x1b[4;2$y');
            await inputHandler.parseP('\x1b[4h');
            await inputHandler.parseP('\x1b[4$p');
            chai_1.assert.deepEqual(reportStack.pop(), '\x1b[4;1$y');
            await inputHandler.parseP('\x1b[4l');
            await inputHandler.parseP('\x1b[4$p');
            chai_1.assert.deepEqual(reportStack.pop(), '\x1b[4;2$y');
        });
        it('ANSI 12 (send/receive)', async () => {
            await inputHandler.parseP('\x1b[12$p');
            chai_1.assert.deepEqual(reportStack.pop(), '\x1b[12;3$y');
        });
        it('ANSI 20 (newline mode)', async () => {
            await inputHandler.parseP('\x1b[20$p');
            chai_1.assert.deepEqual(reportStack.pop(), '\x1b[20;2$y');
            await inputHandler.parseP('\x1b[20h');
            await inputHandler.parseP('\x1b[20$p');
            chai_1.assert.deepEqual(reportStack.pop(), '\x1b[20;1$y');
            await inputHandler.parseP('\x1b[20l');
            await inputHandler.parseP('\x1b[20$p');
            chai_1.assert.deepEqual(reportStack.pop(), '\x1b[20;2$y');
        });
        it('ANSI unknown', async () => {
            await inputHandler.parseP('\x1b[1234$p');
            chai_1.assert.deepEqual(reportStack.pop(), '\x1b[1234;0$y');
        });
        it('DEC privates with set/reset semantic', async () => {
            const reset = [1, 6, 9, 12, 45, 66, 1000, 1002, 1003, 1004, 1006, 1016, 47, 1047, 1049, 2004];
            for (const mode of reset) {
                await inputHandler.parseP(`\x1b[?${mode}$p`);
                chai_1.assert.deepEqual(reportStack.pop(), `\x1b[?${mode};2$y`);
                await inputHandler.parseP(`\x1b[?${mode}h`);
                await inputHandler.parseP(`\x1b[?${mode}$p`);
                chai_1.assert.deepEqual(reportStack.pop(), `\x1b[?${mode};1$y`);
                await inputHandler.parseP(`\x1b[?${mode}l`);
                await inputHandler.parseP(`\x1b[?${mode}$p`);
                chai_1.assert.deepEqual(reportStack.pop(), `\x1b[?${mode};2$y`);
            }
            const set = [7, 25];
            for (const mode of set) {
                await inputHandler.parseP(`\x1b[?${mode}$p`);
                chai_1.assert.deepEqual(reportStack.pop(), `\x1b[?${mode};1$y`);
                await inputHandler.parseP(`\x1b[?${mode}l`);
                await inputHandler.parseP(`\x1b[?${mode}$p`);
                chai_1.assert.deepEqual(reportStack.pop(), `\x1b[?${mode};2$y`);
                await inputHandler.parseP(`\x1b[?${mode}h`);
                await inputHandler.parseP(`\x1b[?${mode}$p`);
                chai_1.assert.deepEqual(reportStack.pop(), `\x1b[?${mode};1$y`);
            }
        });
        it('DEC privates perma modes', async () => {
            const perma = [[3, 0], [8, 3], [67, 4], [1005, 4], [1015, 4], [1048, 1]];
            for (const [mode, value] of perma) {
                await inputHandler.parseP(`\x1b[?${mode}$p`);
                chai_1.assert.deepEqual(reportStack.pop(), `\x1b[?${mode};${value}$y`);
            }
        });
    });
});
describe('InputHandler - async handlers', () => {
    let bufferService;
    let coreService;
    let optionsService;
    let inputHandler;
    beforeEach(() => {
        optionsService = new TestUtils_test_1.MockOptionsService();
        bufferService = new BufferService_1.BufferService(optionsService);
        bufferService.resize(80, 30);
        coreService = new CoreService_1.CoreService(bufferService, new TestUtils_test_1.MockLogService(), optionsService);
        coreService.onData(data => { console.log(data); });
        inputHandler = new TestInputHandler(bufferService, new TestUtils_test_1.MockCharsetService(), coreService, new TestUtils_test_1.MockLogService(), optionsService, new TestUtils_test_1.MockOscLinkService(), new TestUtils_test_1.MockCoreMouseService(), new TestUtils_test_1.MockUnicodeService());
    });
    it('async CUP with CPR check', async () => {
        const cup = [];
        const cpr = [];
        inputHandler.registerCsiHandler({ final: 'H' }, async (params) => {
            cup.push(params.toArray());
            await new Promise(res => setTimeout(res, 50));
            return inputHandler.cursorPosition(params);
        });
        coreService.onData(data => {
            const m = data.match(/\x1b\[(.*?);(.*?)R/);
            if (m) {
                cpr.push([parseInt(m[1]), parseInt(m[2])]);
            }
        });
        await inputHandler.parseP('aaa\x1b[3;4H\x1b[6nbbb\x1b[6;8H\x1b[6n');
        chai_1.assert.deepEqual(cup, cpr);
    });
    it('async OSC between', async () => {
        inputHandler.registerOscHandler(1000, async (data) => {
            await new Promise(res => setTimeout(res, 50));
            chai_1.assert.deepEqual(getLines(bufferService, 2), ['hello world!', '']);
            chai_1.assert.equal(data, 'some data');
            return true;
        });
        await inputHandler.parseP('hello world!\r\n\x1b]1000;some data\x07second line');
        chai_1.assert.deepEqual(getLines(bufferService, 2), ['hello world!', 'second line']);
    });
    it('async DCS between', async () => {
        inputHandler.registerDcsHandler({ final: 'a' }, async (data, params) => {
            await new Promise(res => setTimeout(res, 50));
            chai_1.assert.deepEqual(getLines(bufferService, 2), ['hello world!', '']);
            chai_1.assert.equal(data, 'some data');
            chai_1.assert.deepEqual(params.toArray(), [1, 2]);
            return true;
        });
        await inputHandler.parseP('hello world!\r\n\x1bP1;2asome data\x1b\\second line');
        chai_1.assert.deepEqual(getLines(bufferService, 2), ['hello world!', 'second line']);
    });
});
//# sourceMappingURL=InputHandler.test.js.map