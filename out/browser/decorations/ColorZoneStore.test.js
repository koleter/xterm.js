"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const ColorZoneStore_1 = require("browser/decorations/ColorZoneStore");
const optionsRedFull = {
    overviewRulerOptions: {
        color: 'red',
        position: 'full'
    }
};
describe('ColorZoneStore', () => {
    let store;
    beforeEach(() => {
        store = new ColorZoneStore_1.ColorZoneStore();
        store.setPadding({
            full: 1,
            left: 1,
            center: 1,
            right: 1
        });
    });
    it('should merge adjacent zones', () => {
        store.addDecoration({
            marker: { line: 0 },
            options: optionsRedFull
        });
        store.addDecoration({
            marker: { line: 1 },
            options: optionsRedFull
        });
        chai_1.assert.deepStrictEqual(store.zones, [
            {
                color: 'red',
                position: 'full',
                startBufferLine: 0,
                endBufferLine: 1
            }
        ]);
    });
    it('should not merge non-adjacent zones', () => {
        store.addDecoration({
            marker: { line: 0 },
            options: optionsRedFull
        });
        store.addDecoration({
            marker: { line: 2 },
            options: optionsRedFull
        });
        chai_1.assert.deepStrictEqual(store.zones, [
            {
                color: 'red',
                position: 'full',
                startBufferLine: 0,
                endBufferLine: 0
            },
            {
                color: 'red',
                position: 'full',
                startBufferLine: 2,
                endBufferLine: 2
            }
        ]);
    });
    it('should reuse zone objects', () => {
        const obj = {
            marker: { line: 0 },
            options: optionsRedFull
        };
        store.addDecoration(obj);
        const zone = store.zones[0];
        store.clear();
        store.addDecoration({
            marker: { line: 1 },
            options: optionsRedFull
        });
        chai_1.assert.equal(zone, store.zones[0]);
    });
});
//# sourceMappingURL=ColorZoneStore.test.js.map