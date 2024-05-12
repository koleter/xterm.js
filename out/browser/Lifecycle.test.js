"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const Lifecycle_1 = require("./Lifecycle");
const jsdom = require("jsdom");
describe('addDisposableDomListener', () => {
    const dom = new jsdom.JSDOM();
    const document = dom.window.document;
    function createEvent(type) {
        const event = document.createEvent('Event');
        event.initEvent(type);
        return event;
    }
    it('dispose', () => {
        let calledTimes = 0;
        const div = document.createElement('div');
        const disposable = (0, Lifecycle_1.addDisposableDomListener)(div, 'test', () => { calledTimes++; });
        chai_1.assert.equal(calledTimes, 0);
        div.dispatchEvent(createEvent('test'));
        chai_1.assert.equal(calledTimes, 1);
        disposable.dispose();
        div.dispatchEvent(createEvent('test'));
        chai_1.assert.equal(calledTimes, 1);
        disposable.dispose();
        div.dispatchEvent(createEvent('test'));
        chai_1.assert.equal(calledTimes, 1);
    });
});
//# sourceMappingURL=Lifecycle.test.js.map