"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const WriteBuffer_1 = require("./WriteBuffer");
function toBytes(s) {
    return Buffer.from(s);
}
function fromBytes(bytes) {
    return bytes.toString();
}
describe('WriteBuffer', () => {
    let wb;
    let stack = [];
    let cbStack = [];
    beforeEach(() => {
        stack = [];
        cbStack = [];
        wb = new WriteBuffer_1.WriteBuffer(data => { stack.push(data); });
    });
    describe('write input', () => {
        it('string', done => {
            wb.write('a._');
            wb.write('b.x', () => { cbStack.push('b'); });
            wb.write('c._');
            wb.write('d.x', () => { cbStack.push('d'); });
            wb.write('e', () => {
                chai_1.assert.deepEqual(stack, ['a._', 'b.x', 'c._', 'd.x', 'e']);
                chai_1.assert.deepEqual(cbStack, ['b', 'd']);
                done();
            });
        });
        it('bytes', done => {
            wb.write(toBytes('a._'));
            wb.write(toBytes('b.x'), () => { cbStack.push('b'); });
            wb.write(toBytes('c._'));
            wb.write(toBytes('d.x'), () => { cbStack.push('d'); });
            wb.write(toBytes('e'), () => {
                chai_1.assert.deepEqual(stack.map(val => typeof val === 'string' ? '' : fromBytes(val)), ['a._', 'b.x', 'c._', 'd.x', 'e']);
                chai_1.assert.deepEqual(cbStack, ['b', 'd']);
                done();
            });
        });
        it('string/bytes mixed', done => {
            wb.write('a._');
            wb.write('b.x', () => { cbStack.push('b'); });
            wb.write(toBytes('c._'));
            wb.write(toBytes('d.x'), () => { cbStack.push('d'); });
            wb.write(toBytes('e'), () => {
                chai_1.assert.deepEqual(stack.map(val => typeof val === 'string' ? val : fromBytes(val)), ['a._', 'b.x', 'c._', 'd.x', 'e']);
                chai_1.assert.deepEqual(cbStack, ['b', 'd']);
                done();
            });
        });
        it('write callback works for empty chunks', done => {
            wb.write('a', () => { cbStack.push('a'); });
            wb.write('', () => { cbStack.push('b'); });
            wb.write(toBytes('c'), () => { cbStack.push('c'); });
            wb.write(new Uint8Array(0), () => { cbStack.push('d'); });
            wb.write('e', () => {
                chai_1.assert.deepEqual(stack.map(val => typeof val === 'string' ? val : fromBytes(val)), ['a', '', 'c', '', 'e']);
                chai_1.assert.deepEqual(cbStack, ['a', 'b', 'c', 'd']);
                done();
            });
        });
        it('writeSync', done => {
            wb.write('a', () => { cbStack.push('a'); });
            wb.write('b', () => { cbStack.push('b'); });
            wb.write('c', () => { cbStack.push('c'); });
            wb.writeSync('d');
            chai_1.assert.deepEqual(stack, ['a', 'b', 'c', 'd']);
            chai_1.assert.deepEqual(cbStack, ['a', 'b', 'c']);
            wb.write('x', () => { cbStack.push('x'); });
            wb.write('', () => {
                chai_1.assert.deepEqual(stack, ['a', 'b', 'c', 'd', 'x', '']);
                chai_1.assert.deepEqual(cbStack, ['a', 'b', 'c', 'x']);
                done();
            });
        });
        it('writeSync called from action does not overflow callstack - issue #3265', () => {
            wb = new WriteBuffer_1.WriteBuffer(data => {
                const num = parseInt(data);
                if (num < 1000000) {
                    wb.writeSync('' + (num + 1));
                }
            });
            wb.writeSync('1');
        });
        it('writeSync maxSubsequentCalls argument', () => {
            let last = '';
            wb = new WriteBuffer_1.WriteBuffer(data => {
                last = data;
                const num = parseInt(data);
                if (num < 1000000) {
                    wb.writeSync('' + (num + 1), 10);
                }
            });
            wb.writeSync('1', 10);
            chai_1.assert.equal(last, '11');
        });
    });
});
//# sourceMappingURL=WriteBuffer.test.js.map