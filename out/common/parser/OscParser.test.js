"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const OscParser_1 = require("common/parser/OscParser");
const TextDecoder_1 = require("common/input/TextDecoder");
const Constants_1 = require("common/parser/Constants");
function toUtf32(s) {
    const utf32 = new Uint32Array(s.length);
    const decoder = new TextDecoder_1.StringToUtf32();
    const length = decoder.decode(s, utf32);
    return utf32.subarray(0, length);
}
class TestHandler {
    constructor(id, output, msg, returnFalse = false) {
        this.id = id;
        this.output = output;
        this.msg = msg;
        this.returnFalse = returnFalse;
    }
    start() {
        this.output.push([this.msg, this.id, 'START']);
    }
    put(data, start, end) {
        this.output.push([this.msg, this.id, 'PUT', (0, TextDecoder_1.utf32ToString)(data, start, end)]);
    }
    end(success) {
        this.output.push([this.msg, this.id, 'END', success]);
        if (this.returnFalse) {
            return false;
        }
        return true;
    }
}
describe('OscParser', () => {
    let parser;
    let reports = [];
    beforeEach(() => {
        reports = [];
        parser = new OscParser_1.OscParser();
        parser.setHandlerFallback((id, action, data) => {
            reports.push([id, action, data]);
        });
    });
    describe('identifier parsing', () => {
        it('no report for illegal ids', () => {
            const data = toUtf32('hello world!');
            parser.put(data, 0, data.length);
            parser.end(true);
            chai_1.assert.deepEqual(reports, []);
        });
        it('no payload', () => {
            parser.start();
            let data = toUtf32('12');
            parser.put(data, 0, data.length);
            data = toUtf32('34');
            parser.put(data, 0, data.length);
            parser.end(true);
            chai_1.assert.deepEqual(reports, [[1234, 'START', undefined], [1234, 'END', true]]);
        });
        it('with payload', () => {
            parser.start();
            let data = toUtf32('12');
            parser.put(data, 0, data.length);
            data = toUtf32('34');
            parser.put(data, 0, data.length);
            data = toUtf32(';h');
            parser.put(data, 0, data.length);
            data = toUtf32('ello');
            parser.put(data, 0, data.length);
            parser.end(true);
            chai_1.assert.deepEqual(reports, [
                [1234, 'START', undefined],
                [1234, 'PUT', 'h'],
                [1234, 'PUT', 'ello'],
                [1234, 'END', true]
            ]);
        });
    });
    describe('handler registration', () => {
        it('setOscHandler', () => {
            parser.registerHandler(1234, new TestHandler(1234, reports, 'th'));
            parser.start();
            let data = toUtf32('1234;Here comes');
            parser.put(data, 0, data.length);
            data = toUtf32('the mouse!');
            parser.put(data, 0, data.length);
            parser.end(true);
            chai_1.assert.deepEqual(reports, [
                ['th', 1234, 'START'],
                ['th', 1234, 'PUT', 'Here comes'],
                ['th', 1234, 'PUT', 'the mouse!'],
                ['th', 1234, 'END', true]
            ]);
        });
        it('clearOscHandler', () => {
            parser.registerHandler(1234, new TestHandler(1234, reports, 'th'));
            parser.clearHandler(1234);
            parser.start();
            let data = toUtf32('1234;Here comes');
            parser.put(data, 0, data.length);
            data = toUtf32('the mouse!');
            parser.put(data, 0, data.length);
            parser.end(true);
            chai_1.assert.deepEqual(reports, [
                [1234, 'START', undefined],
                [1234, 'PUT', 'Here comes'],
                [1234, 'PUT', 'the mouse!'],
                [1234, 'END', true]
            ]);
        });
        it('addOscHandler', () => {
            parser.registerHandler(1234, new TestHandler(1234, reports, 'th1'));
            parser.registerHandler(1234, new TestHandler(1234, reports, 'th2'));
            parser.start();
            let data = toUtf32('1234;Here comes');
            parser.put(data, 0, data.length);
            data = toUtf32('the mouse!');
            parser.put(data, 0, data.length);
            parser.end(true);
            chai_1.assert.deepEqual(reports, [
                ['th2', 1234, 'START'],
                ['th1', 1234, 'START'],
                ['th2', 1234, 'PUT', 'Here comes'],
                ['th1', 1234, 'PUT', 'Here comes'],
                ['th2', 1234, 'PUT', 'the mouse!'],
                ['th1', 1234, 'PUT', 'the mouse!'],
                ['th2', 1234, 'END', true],
                ['th1', 1234, 'END', false]
            ]);
        });
        it('addOscHandler with return false', () => {
            parser.registerHandler(1234, new TestHandler(1234, reports, 'th1'));
            parser.registerHandler(1234, new TestHandler(1234, reports, 'th2', true));
            parser.start();
            let data = toUtf32('1234;Here comes');
            parser.put(data, 0, data.length);
            data = toUtf32('the mouse!');
            parser.put(data, 0, data.length);
            parser.end(true);
            chai_1.assert.deepEqual(reports, [
                ['th2', 1234, 'START'],
                ['th1', 1234, 'START'],
                ['th2', 1234, 'PUT', 'Here comes'],
                ['th1', 1234, 'PUT', 'Here comes'],
                ['th2', 1234, 'PUT', 'the mouse!'],
                ['th1', 1234, 'PUT', 'the mouse!'],
                ['th2', 1234, 'END', true],
                ['th1', 1234, 'END', true]
            ]);
        });
        it('dispose handlers', () => {
            parser.registerHandler(1234, new TestHandler(1234, reports, 'th1'));
            const dispo = parser.registerHandler(1234, new TestHandler(1234, reports, 'th2', true));
            dispo.dispose();
            parser.start();
            let data = toUtf32('1234;Here comes');
            parser.put(data, 0, data.length);
            data = toUtf32('the mouse!');
            parser.put(data, 0, data.length);
            parser.end(true);
            chai_1.assert.deepEqual(reports, [
                ['th1', 1234, 'START'],
                ['th1', 1234, 'PUT', 'Here comes'],
                ['th1', 1234, 'PUT', 'the mouse!'],
                ['th1', 1234, 'END', true]
            ]);
        });
    });
    describe('OscHandlerFactory', () => {
        it('should be called once on end(true)', () => {
            parser.registerHandler(1234, new OscParser_1.OscHandler(data => { reports.push([1234, data]); return true; }));
            parser.start();
            let data = toUtf32('1234;Here comes');
            parser.put(data, 0, data.length);
            data = toUtf32(' the mouse!');
            parser.put(data, 0, data.length);
            parser.end(true);
            chai_1.assert.deepEqual(reports, [[1234, 'Here comes the mouse!']]);
        });
        it('should not be called on end(false)', () => {
            parser.registerHandler(1234, new OscParser_1.OscHandler(data => { reports.push([1234, data]); return true; }));
            parser.start();
            let data = toUtf32('1234;Here comes');
            parser.put(data, 0, data.length);
            data = toUtf32(' the mouse!');
            parser.put(data, 0, data.length);
            parser.end(false);
            chai_1.assert.deepEqual(reports, []);
        });
        it('should be disposable', () => {
            parser.registerHandler(1234, new OscParser_1.OscHandler(data => { reports.push(['one', data]); return true; }));
            const dispo = parser.registerHandler(1234, new OscParser_1.OscHandler(data => { reports.push(['two', data]); return true; }));
            parser.start();
            let data = toUtf32('1234;Here comes');
            parser.put(data, 0, data.length);
            data = toUtf32(' the mouse!');
            parser.put(data, 0, data.length);
            parser.end(true);
            chai_1.assert.deepEqual(reports, [['two', 'Here comes the mouse!']]);
            dispo.dispose();
            parser.start();
            data = toUtf32('1234;some other');
            parser.put(data, 0, data.length);
            data = toUtf32(' data');
            parser.put(data, 0, data.length);
            parser.end(true);
            chai_1.assert.deepEqual(reports, [['two', 'Here comes the mouse!'], ['one', 'some other data']]);
        });
        it('should respect return false', () => {
            parser.registerHandler(1234, new OscParser_1.OscHandler(data => { reports.push(['one', data]); return true; }));
            parser.registerHandler(1234, new OscParser_1.OscHandler(data => { reports.push(['two', data]); return false; }));
            parser.start();
            let data = toUtf32('1234;Here comes');
            parser.put(data, 0, data.length);
            data = toUtf32(' the mouse!');
            parser.put(data, 0, data.length);
            parser.end(true);
            chai_1.assert.deepEqual(reports, [['two', 'Here comes the mouse!'], ['one', 'Here comes the mouse!']]);
        });
        it('should work up to payload limit', function () {
            this.timeout(30000);
            parser.registerHandler(1234, new OscParser_1.OscHandler(data => { reports.push([1234, data]); return true; }));
            parser.start();
            let data = toUtf32('1234;');
            parser.put(data, 0, data.length);
            data = toUtf32('A'.repeat(1000));
            for (let i = 0; i < Constants_1.PAYLOAD_LIMIT; i += 1000) {
                parser.put(data, 0, data.length);
            }
            parser.end(true);
            chai_1.assert.deepEqual(reports, [[1234, 'A'.repeat(Constants_1.PAYLOAD_LIMIT)]]);
        });
        it('should abort for payload limit +1', function () {
            this.timeout(30000);
            parser.registerHandler(1234, new OscParser_1.OscHandler(data => { reports.push([1234, data]); return true; }));
            parser.start();
            let data = toUtf32('1234;');
            parser.put(data, 0, data.length);
            data = toUtf32('A'.repeat(1000));
            for (let i = 0; i < Constants_1.PAYLOAD_LIMIT; i += 1000) {
                parser.put(data, 0, data.length);
            }
            data = toUtf32('A');
            parser.put(data, 0, data.length);
            parser.end(true);
            chai_1.assert.deepEqual(reports, []);
        });
    });
});
class TestHandlerAsync {
    constructor(id, output, msg, returnFalse = false) {
        this.id = id;
        this.output = output;
        this.msg = msg;
        this.returnFalse = returnFalse;
    }
    start() {
        this.output.push([this.msg, this.id, 'START']);
    }
    put(data, start, end) {
        this.output.push([this.msg, this.id, 'PUT', (0, TextDecoder_1.utf32ToString)(data, start, end)]);
    }
    async end(success) {
        await new Promise(res => setTimeout(res, 20));
        this.output.push([this.msg, this.id, 'END', success]);
        if (this.returnFalse) {
            return false;
        }
        return true;
    }
}
async function endP(parser, success) {
    let result;
    let prev;
    while (result = parser.end(success, prev)) {
        prev = await result;
    }
}
describe('OscParser - async tests', () => {
    let parser;
    let reports = [];
    beforeEach(() => {
        reports = [];
        parser = new OscParser_1.OscParser();
        parser.setHandlerFallback((id, action, data) => {
            reports.push([id, action, data]);
        });
    });
    describe('sync and async mixed', () => {
        describe('sync | async | sync', () => {
            it('first should run, cleanup action for others', async () => {
                parser.registerHandler(1234, new TestHandler(1234, reports, 's1'));
                parser.registerHandler(1234, new TestHandlerAsync(1234, reports, 'a1'));
                parser.registerHandler(1234, new TestHandler(1234, reports, 's2'));
                parser.start();
                let data = toUtf32('1234;Here comes');
                parser.put(data, 0, data.length);
                data = toUtf32('the mouse!');
                parser.put(data, 0, data.length);
                await endP(parser, true);
                chai_1.assert.deepEqual(reports, [
                    ['s2', 1234, 'START'],
                    ['a1', 1234, 'START'],
                    ['s1', 1234, 'START'],
                    ['s2', 1234, 'PUT', 'Here comes'],
                    ['a1', 1234, 'PUT', 'Here comes'],
                    ['s1', 1234, 'PUT', 'Here comes'],
                    ['s2', 1234, 'PUT', 'the mouse!'],
                    ['a1', 1234, 'PUT', 'the mouse!'],
                    ['s1', 1234, 'PUT', 'the mouse!'],
                    ['s2', 1234, 'END', true],
                    ['a1', 1234, 'END', false],
                    ['s1', 1234, 'END', false]
                ]);
            });
            it('all should run', async () => {
                parser.registerHandler(1234, new TestHandler(1234, reports, 's1', true));
                parser.registerHandler(1234, new TestHandlerAsync(1234, reports, 'a1', true));
                parser.registerHandler(1234, new TestHandler(1234, reports, 's2', true));
                parser.start();
                let data = toUtf32('1234;Here comes');
                parser.put(data, 0, data.length);
                data = toUtf32('the mouse!');
                parser.put(data, 0, data.length);
                await endP(parser, true);
                chai_1.assert.deepEqual(reports, [
                    ['s2', 1234, 'START'],
                    ['a1', 1234, 'START'],
                    ['s1', 1234, 'START'],
                    ['s2', 1234, 'PUT', 'Here comes'],
                    ['a1', 1234, 'PUT', 'Here comes'],
                    ['s1', 1234, 'PUT', 'Here comes'],
                    ['s2', 1234, 'PUT', 'the mouse!'],
                    ['a1', 1234, 'PUT', 'the mouse!'],
                    ['s1', 1234, 'PUT', 'the mouse!'],
                    ['s2', 1234, 'END', true],
                    ['a1', 1234, 'END', true],
                    ['s1', 1234, 'END', true]
                ]);
            });
        });
        describe('async | sync | async', () => {
            it('first should run, cleanup action for others', async () => {
                parser.registerHandler(1234, new TestHandlerAsync(1234, reports, 's1'));
                parser.registerHandler(1234, new TestHandler(1234, reports, 'a1'));
                parser.registerHandler(1234, new TestHandlerAsync(1234, reports, 's2'));
                parser.start();
                let data = toUtf32('1234;Here comes');
                parser.put(data, 0, data.length);
                data = toUtf32('the mouse!');
                parser.put(data, 0, data.length);
                await endP(parser, true);
                chai_1.assert.deepEqual(reports, [
                    ['s2', 1234, 'START'],
                    ['a1', 1234, 'START'],
                    ['s1', 1234, 'START'],
                    ['s2', 1234, 'PUT', 'Here comes'],
                    ['a1', 1234, 'PUT', 'Here comes'],
                    ['s1', 1234, 'PUT', 'Here comes'],
                    ['s2', 1234, 'PUT', 'the mouse!'],
                    ['a1', 1234, 'PUT', 'the mouse!'],
                    ['s1', 1234, 'PUT', 'the mouse!'],
                    ['s2', 1234, 'END', true],
                    ['a1', 1234, 'END', false],
                    ['s1', 1234, 'END', false]
                ]);
            });
            it('all should run', async () => {
                parser.registerHandler(1234, new TestHandlerAsync(1234, reports, 's1', true));
                parser.registerHandler(1234, new TestHandler(1234, reports, 'a1', true));
                parser.registerHandler(1234, new TestHandlerAsync(1234, reports, 's2', true));
                parser.start();
                let data = toUtf32('1234;Here comes');
                parser.put(data, 0, data.length);
                data = toUtf32('the mouse!');
                parser.put(data, 0, data.length);
                await endP(parser, true);
                chai_1.assert.deepEqual(reports, [
                    ['s2', 1234, 'START'],
                    ['a1', 1234, 'START'],
                    ['s1', 1234, 'START'],
                    ['s2', 1234, 'PUT', 'Here comes'],
                    ['a1', 1234, 'PUT', 'Here comes'],
                    ['s1', 1234, 'PUT', 'Here comes'],
                    ['s2', 1234, 'PUT', 'the mouse!'],
                    ['a1', 1234, 'PUT', 'the mouse!'],
                    ['s1', 1234, 'PUT', 'the mouse!'],
                    ['s2', 1234, 'END', true],
                    ['a1', 1234, 'END', true],
                    ['s1', 1234, 'END', true]
                ]);
            });
        });
        describe('OscHandlerFactory', () => {
            it('should be called once on end(true)', async () => {
                parser.registerHandler(1234, new OscParser_1.OscHandler(async (data) => { reports.push([1234, data]); return true; }));
                parser.start();
                let data = toUtf32('1234;Here comes');
                parser.put(data, 0, data.length);
                data = toUtf32(' the mouse!');
                parser.put(data, 0, data.length);
                parser.end(true);
                await endP(parser, true);
                chai_1.assert.deepEqual(reports, [[1234, 'Here comes the mouse!']]);
            });
            it('should not be called on end(false)', async () => {
                parser.registerHandler(1234, new OscParser_1.OscHandler(async (data) => { reports.push([1234, data]); return true; }));
                parser.start();
                let data = toUtf32('1234;Here comes');
                parser.put(data, 0, data.length);
                data = toUtf32(' the mouse!');
                parser.put(data, 0, data.length);
                await endP(parser, false);
                chai_1.assert.deepEqual(reports, []);
            });
            it('should be disposable', async () => {
                parser.registerHandler(1234, new OscParser_1.OscHandler(async (data) => { reports.push(['one', data]); return true; }));
                const dispo = parser.registerHandler(1234, new OscParser_1.OscHandler(async (data) => { reports.push(['two', data]); return true; }));
                parser.start();
                let data = toUtf32('1234;Here comes');
                parser.put(data, 0, data.length);
                data = toUtf32(' the mouse!');
                parser.put(data, 0, data.length);
                await endP(parser, true);
                chai_1.assert.deepEqual(reports, [['two', 'Here comes the mouse!']]);
                dispo.dispose();
                parser.start();
                data = toUtf32('1234;some other');
                parser.put(data, 0, data.length);
                data = toUtf32(' data');
                parser.put(data, 0, data.length);
                await endP(parser, true);
                chai_1.assert.deepEqual(reports, [['two', 'Here comes the mouse!'], ['one', 'some other data']]);
            });
            it('should respect return false', async () => {
                parser.registerHandler(1234, new OscParser_1.OscHandler(async (data) => { reports.push(['one', data]); return true; }));
                parser.registerHandler(1234, new OscParser_1.OscHandler(async (data) => { reports.push(['two', data]); return false; }));
                parser.start();
                let data = toUtf32('1234;Here comes');
                parser.put(data, 0, data.length);
                data = toUtf32(' the mouse!');
                parser.put(data, 0, data.length);
                await endP(parser, true);
                chai_1.assert.deepEqual(reports, [['two', 'Here comes the mouse!'], ['one', 'Here comes the mouse!']]);
            });
        });
    });
});
//# sourceMappingURL=OscParser.test.js.map