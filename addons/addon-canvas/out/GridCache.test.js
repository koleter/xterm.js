"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const GridCache_1 = require("./GridCache");
describe('GridCache', () => {
    let grid;
    beforeEach(() => {
        grid = new GridCache_1.GridCache();
    });
    describe('constructor', () => {
        it('should create an empty cache', () => {
            chai_1.assert.equal(grid.cache.length, 0);
        });
    });
    describe('resize', () => {
        it('should fill all new elements with null', () => {
            grid.resize(2, 2);
            chai_1.assert.equal(grid.cache.length, 2);
            chai_1.assert.equal(grid.cache[0].length, 2);
            chai_1.assert.equal(grid.cache[0][0], null);
            chai_1.assert.equal(grid.cache[0][1], null);
            chai_1.assert.equal(grid.cache[1].length, 2);
            chai_1.assert.equal(grid.cache[1][0], null);
            chai_1.assert.equal(grid.cache[1][1], null);
            grid.resize(3, 2);
            chai_1.assert.equal(grid.cache.length, 3);
            chai_1.assert.equal(grid.cache[2][0], null);
            chai_1.assert.equal(grid.cache[2][1], null);
        });
        it('should remove rows/cols from the cache when reduced', () => {
            grid.resize(2, 2);
            grid.resize(1, 1);
            chai_1.assert.equal(grid.cache.length, 1);
            chai_1.assert.equal(grid.cache[0].length, 1);
        });
        it('should not touch existing cache entries if they fit in the new cache', () => {
            grid.resize(1, 1);
            chai_1.assert.equal(grid.cache[0][0], null);
            grid.cache[0][0] = 1;
            grid.resize(2, 1);
            chai_1.assert.equal(grid.cache[0][0], 1);
        });
    });
    describe('clear', () => {
        it('should make all entries null', () => {
            grid.resize(1, 1);
            grid.cache[0][0] = 1;
            grid.clear();
            chai_1.assert.equal(grid.cache[0][0], null);
        });
    });
});
//# sourceMappingURL=GridCache.test.js.map