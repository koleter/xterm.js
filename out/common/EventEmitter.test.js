"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const EventEmitter_1 = require("common/EventEmitter");
describe('EventEmitter', () => {
    it('should fire listeners multiple times', () => {
        const order = [];
        const emitter = new EventEmitter_1.EventEmitter();
        emitter.event(data => order.push(data + 'a'));
        emitter.event(data => order.push(data + 'b'));
        emitter.fire(1);
        emitter.fire(2);
        chai_1.assert.deepEqual(order, ['1a', '1b', '2a', '2b']);
    });
    it('should not fire listeners once disposed', () => {
        const order = [];
        const emitter = new EventEmitter_1.EventEmitter();
        emitter.event(data => order.push(data + 'a'));
        const disposeB = emitter.event(data => order.push(data + 'b'));
        emitter.event(data => order.push(data + 'c'));
        emitter.fire(1);
        disposeB.dispose();
        emitter.fire(2);
        chai_1.assert.deepEqual(order, ['1a', '1b', '1c', '2a', '2c']);
    });
});
//# sourceMappingURL=EventEmitter.test.js.map