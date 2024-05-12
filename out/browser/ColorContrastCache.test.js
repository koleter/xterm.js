"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const ColorContrastCache_1 = require("browser/ColorContrastCache");
describe('ColorContrastCache', () => {
    let cache;
    beforeEach(() => {
        cache = new ColorContrastCache_1.ColorContrastCache();
    });
    it('should save and get color values', () => {
        chai_1.assert.strictEqual(cache.getColor(0x01, 0x00), undefined);
        cache.setColor(0x01, 0x01, null);
        chai_1.assert.strictEqual(cache.getColor(0x01, 0x01), null);
        cache.setColor(0x01, 0x02, { css: '#030303', rgba: 0x030303ff });
        chai_1.assert.deepEqual(cache.getColor(0x01, 0x02), { css: '#030303', rgba: 0x030303ff });
    });
    it('should save and get css values', () => {
        chai_1.assert.strictEqual(cache.getCss(0x01, 0x00), undefined);
        cache.setCss(0x01, 0x01, null);
        chai_1.assert.strictEqual(cache.getCss(0x01, 0x01), null);
        cache.setCss(0x01, 0x02, '#030303');
        chai_1.assert.deepEqual(cache.getCss(0x01, 0x02), '#030303');
    });
    it('should clear all values on clear', () => {
        cache.setColor(0x01, 0x01, null);
        cache.setColor(0x01, 0x02, { css: '#030303', rgba: 0x030303ff });
        cache.setCss(0x01, 0x01, null);
        cache.setCss(0x01, 0x02, '#030303');
        cache.clear();
        chai_1.assert.strictEqual(cache.getColor(0x01, 0x01), undefined);
        chai_1.assert.strictEqual(cache.getColor(0x01, 0x02), undefined);
        chai_1.assert.strictEqual(cache.getCss(0x01, 0x01), undefined);
        chai_1.assert.strictEqual(cache.getCss(0x01, 0x02), undefined);
    });
});
//# sourceMappingURL=ColorContrastCache.test.js.map