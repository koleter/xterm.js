"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CoreMouseService_1 = require("common/services/CoreMouseService");
const TestUtils_test_1 = require("common/TestUtils.test");
const chai_1 = require("chai");
const bufferService = new TestUtils_test_1.MockBufferService(300, 100);
const coreService = new TestUtils_test_1.MockCoreService();
function toBytes(s) {
    if (!s) {
        return [];
    }
    const res = [];
    for (let i = 0; i < s.length; ++i) {
        res.push(s.charCodeAt(i));
    }
    return res;
}
describe('CoreMouseService', () => {
    it('init', () => {
        const cms = new CoreMouseService_1.CoreMouseService(bufferService, coreService);
        chai_1.assert.equal(cms.activeEncoding, 'DEFAULT');
        chai_1.assert.equal(cms.activeProtocol, 'NONE');
    });
    it('default protocols - NONE, X10, VT200, DRAG, ANY', () => {
        const cms = new CoreMouseService_1.CoreMouseService(bufferService, coreService);
        chai_1.assert.deepEqual(Object.keys(cms._protocols), ['NONE', 'X10', 'VT200', 'DRAG', 'ANY']);
    });
    it('default encodings - DEFAULT, SGR', () => {
        const cms = new CoreMouseService_1.CoreMouseService(bufferService, coreService);
        chai_1.assert.deepEqual(Object.keys(cms._encodings), ['DEFAULT', 'SGR', 'SGR_PIXELS']);
    });
    it('protocol/encoding setter, reset', () => {
        const cms = new CoreMouseService_1.CoreMouseService(bufferService, coreService);
        cms.activeEncoding = 'SGR';
        cms.activeProtocol = 'ANY';
        chai_1.assert.equal(cms.activeEncoding, 'SGR');
        chai_1.assert.equal(cms.activeProtocol, 'ANY');
        cms.reset();
        chai_1.assert.equal(cms.activeEncoding, 'DEFAULT');
        chai_1.assert.equal(cms.activeProtocol, 'NONE');
        chai_1.assert.throws(() => { cms.activeEncoding = 'xyz'; }, 'unknown encoding "xyz"');
        chai_1.assert.throws(() => { cms.activeProtocol = 'xyz'; }, 'unknown protocol "xyz"');
    });
    it('addEncoding', () => {
        const cms = new CoreMouseService_1.CoreMouseService(bufferService, coreService);
        cms.addEncoding('XYZ', (e) => '');
        cms.activeEncoding = 'XYZ';
        chai_1.assert.equal(cms.activeEncoding, 'XYZ');
    });
    it('addProtocol', () => {
        const cms = new CoreMouseService_1.CoreMouseService(bufferService, coreService);
        cms.addProtocol('XYZ', { events: 0, restrict: (e) => false });
        cms.activeProtocol = 'XYZ';
        chai_1.assert.equal(cms.activeProtocol, 'XYZ');
    });
    it('onProtocolChange', () => {
        const cms = new CoreMouseService_1.CoreMouseService(bufferService, coreService);
        const wantedEvents = [];
        cms.onProtocolChange(events => wantedEvents.push(events));
        cms.activeProtocol = 'NONE';
        chai_1.assert.deepEqual(wantedEvents, [0]);
        cms.activeProtocol = 'ANY';
        chai_1.assert.deepEqual(wantedEvents, [
            0,
            1 | 2 | 16 | 4 | 8
        ]);
    });
    describe('triggerMouseEvent', () => {
        let cms;
        let reports;
        beforeEach(() => {
            cms = new CoreMouseService_1.CoreMouseService(bufferService, coreService);
            reports = [];
            coreService.triggerDataEvent = (data, userInput) => reports.push(data);
            coreService.triggerBinaryEvent = (data) => reports.push(data);
        });
        it('NONE', () => {
            chai_1.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: 0, action: 1 }), false);
            chai_1.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: 0, action: 0 }), false);
            chai_1.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: 0, action: 32 }), false);
            chai_1.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: 1, action: 1 }), false);
            chai_1.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: 2, action: 1 }), false);
            chai_1.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: 4, action: 0 }), false);
            chai_1.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: 3, action: 32 }), false);
        });
        it('X10', () => {
            cms.activeProtocol = 'X10';
            chai_1.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: 0, action: 1 }), true);
            chai_1.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: 0, action: 0 }), false);
            chai_1.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: 0, action: 32 }), false);
            chai_1.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: 1, action: 1 }), true);
            chai_1.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: 2, action: 1 }), true);
            chai_1.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: 4, action: 0 }), false);
            chai_1.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: 3, action: 32 }), false);
        });
        it('VT200', () => {
            cms.activeProtocol = 'VT200';
            chai_1.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: 0, action: 1 }), true);
            chai_1.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: 0, action: 0 }), true);
            chai_1.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: 0, action: 32 }), false);
            chai_1.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: 1, action: 1 }), true);
            chai_1.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: 2, action: 1 }), true);
            chai_1.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: 4, action: 0 }), true);
            chai_1.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: 3, action: 32 }), false);
        });
        it('DRAG', () => {
            cms.activeProtocol = 'DRAG';
            chai_1.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: 0, action: 1 }), true);
            chai_1.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: 0, action: 0 }), true);
            chai_1.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: 0, action: 32 }), true);
            chai_1.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: 1, action: 1 }), true);
            chai_1.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: 2, action: 1 }), true);
            chai_1.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: 4, action: 0 }), true);
        });
        it('ANY', () => {
            cms.activeProtocol = 'ANY';
            chai_1.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: 0, action: 1 }), true);
            chai_1.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: 0, action: 0 }), true);
            chai_1.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: 0, action: 32 }), true);
            chai_1.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: 1, action: 1 }), true);
            chai_1.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: 2, action: 1 }), true);
            chai_1.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: 4, action: 0 }), true);
            chai_1.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: 3, action: 32 }), true);
            chai_1.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: 4, action: 32 }), false);
            chai_1.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: 3, action: 1 }), false);
            chai_1.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: 3, action: 0 }), false);
            chai_1.assert.equal(cms.triggerMouseEvent({ col: -1, row: 0, x: 0, y: 0, button: 0, action: 1 }), false);
            chai_1.assert.equal(cms.triggerMouseEvent({ col: 500, row: 0, x: 0, y: 0, button: 0, action: 1 }), false);
            chai_1.assert.equal(cms.triggerMouseEvent({ col: 0, row: -1, x: 0, y: 0, button: 0, action: 1 }), false);
            chai_1.assert.equal(cms.triggerMouseEvent({ col: 0, row: 500, x: 0, y: 0, button: 0, action: 1 }), false);
        });
        describe('coords', () => {
            it('DEFAULT encoding', () => {
                cms.activeProtocol = 'ANY';
                for (let i = 0; i < bufferService.cols; ++i) {
                    chai_1.assert.equal(cms.triggerMouseEvent({ col: i, row: 0, x: 0, y: 0, button: 0, action: 1 }), true);
                    if (i > 222) {
                        chai_1.assert.deepEqual(toBytes(reports.pop()), []);
                    }
                    else {
                        chai_1.assert.deepEqual(toBytes(reports.pop()), [0x1b, 0x5b, 0x4d, 0x20, i + 33, 0x21]);
                    }
                }
            });
            it('SGR encoding', () => {
                cms.activeProtocol = 'ANY';
                cms.activeEncoding = 'SGR';
                for (let i = 0; i < bufferService.cols; ++i) {
                    chai_1.assert.equal(cms.triggerMouseEvent({ col: i, row: 0, x: 0, y: 0, button: 0, action: 1 }), true);
                    chai_1.assert.deepEqual(reports.pop(), `\x1b[<0;${i + 1};1M`);
                }
            });
            it('SGR_PIXELS encoding', () => {
                cms.activeProtocol = 'ANY';
                cms.activeEncoding = 'SGR_PIXELS';
                for (let i = 0; i < 500; ++i) {
                    chai_1.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: i, y: 0, button: 0, action: 1 }), true);
                    chai_1.assert.deepEqual(reports.pop(), `\x1b[<0;${i};0M`);
                }
            });
        });
        it('eventCodes with modifiers (DEFAULT encoding)', () => {
            cms.activeProtocol = 'ANY';
            cms.activeEncoding = 'DEFAULT';
            chai_1.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: 0, action: 1, ctrl: false, alt: false, shift: false }), true);
            chai_1.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: 1, action: 1, ctrl: false, alt: false, shift: false }), true);
            chai_1.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: 2, action: 1, ctrl: false, alt: false, shift: false }), true);
            chai_1.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: 4, action: 1, ctrl: false, alt: false, shift: false }), true);
            chai_1.assert.deepEqual(reports, ['\x1b[M !!', '\x1b[M!!!', '\x1b[M"!!', '\x1b[Ma!!']);
            reports = [];
            chai_1.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: 0, action: 0, ctrl: false, alt: false, shift: false }), true);
            chai_1.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: 1, action: 0, ctrl: false, alt: false, shift: false }), true);
            chai_1.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: 2, action: 0, ctrl: false, alt: false, shift: false }), true);
            chai_1.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: 4, action: 0, ctrl: false, alt: false, shift: false }), true);
            chai_1.assert.deepEqual(reports, ['\x1b[M#!!', '\x1b[M#!!', '\x1b[M#!!', '\x1b[M`!!']);
            reports = [];
            chai_1.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: 0, action: 32, ctrl: false, alt: false, shift: false }), true);
            chai_1.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: 1, action: 32, ctrl: false, alt: false, shift: false }), true);
            chai_1.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: 2, action: 32, ctrl: false, alt: false, shift: false }), true);
            chai_1.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: 3, action: 32, ctrl: false, alt: false, shift: false }), true);
            chai_1.assert.deepEqual(reports, ['\x1b[M@!!', '\x1b[MA!!', '\x1b[MB!!', '\x1b[MC!!']);
            reports = [];
            chai_1.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: 3, action: 32, ctrl: true, alt: false, shift: false }), true);
            chai_1.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: 3, action: 32, ctrl: false, alt: true, shift: false }), true);
            chai_1.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: 3, action: 32, ctrl: false, alt: false, shift: true }), true);
            chai_1.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: 3, action: 32, ctrl: true, alt: true, shift: false }), true);
            chai_1.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: 3, action: 32, ctrl: false, alt: true, shift: true }), true);
            chai_1.assert.equal(cms.triggerMouseEvent({ col: 0, row: 0, x: 0, y: 0, button: 3, action: 32, ctrl: true, alt: true, shift: true }), true);
            chai_1.assert.deepEqual(reports, ['\x1b[MS!!', '\x1b[MK!!', '\x1b[MG!!', '\x1b[M[!!', '\x1b[MO!!', '\x1b[M_!!']);
            reports = [];
        });
    });
});
//# sourceMappingURL=CoreMouseService.test.js.map