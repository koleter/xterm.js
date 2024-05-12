"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const MultiKeyMap_1 = require("common/MultiKeyMap");
const strictEqual = chai_1.assert.strictEqual;
describe('TwoKeyMap', () => {
    let map;
    beforeEach(() => {
        map = new MultiKeyMap_1.TwoKeyMap();
    });
    it('set, get', () => {
        strictEqual(map.get(1, 2), undefined);
        map.set(1, 2, 'foo');
        strictEqual(map.get(1, 2), 'foo');
        map.set(1, 3, 'bar');
        strictEqual(map.get(1, 2), 'foo');
        strictEqual(map.get(1, 3), 'bar');
        map.set(2, 2, 'foo2');
        map.set(2, 3, 'bar2');
        strictEqual(map.get(1, 2), 'foo');
        strictEqual(map.get(1, 3), 'bar');
        strictEqual(map.get(2, 2), 'foo2');
        strictEqual(map.get(2, 3), 'bar2');
    });
    it('clear', () => {
        strictEqual(map.get(1, 2), undefined);
        map.set(1, 2, 'foo');
        strictEqual(map.get(1, 2), 'foo');
        map.clear();
        strictEqual(map.get(1, 2), undefined);
    });
});
describe('FourKeyMap', () => {
    let map;
    beforeEach(() => {
        map = new MultiKeyMap_1.FourKeyMap();
    });
    it('set, get', () => {
        strictEqual(map.get(1, 2, 3, 4), undefined);
        map.set(1, 2, 3, 4, 'foo');
        strictEqual(map.get(1, 2, 3, 4), 'foo');
        map.set(1, 3, 3, 4, 'bar');
        strictEqual(map.get(1, 2, 3, 4), 'foo');
        strictEqual(map.get(1, 3, 3, 4), 'bar');
        map.set(2, 2, 3, 4, 'foo2');
        map.set(2, 3, 3, 4, 'bar2');
        strictEqual(map.get(1, 2, 3, 4), 'foo');
        strictEqual(map.get(1, 3, 3, 4), 'bar');
        strictEqual(map.get(2, 2, 3, 4), 'foo2');
        strictEqual(map.get(2, 3, 3, 4), 'bar2');
    });
    it('clear', () => {
        strictEqual(map.get(1, 2, 3, 4), undefined);
        map.set(1, 2, 3, 4, 'foo');
        strictEqual(map.get(1, 2, 3, 4), 'foo');
        map.clear();
        strictEqual(map.get(1, 2, 3, 4), undefined);
    });
});
//# sourceMappingURL=MultiKeyMap.test.js.map