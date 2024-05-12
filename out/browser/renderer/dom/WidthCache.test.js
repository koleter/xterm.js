"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TestWidthCache = void 0;
const assert = require("assert");
const WidthCache_1 = require("browser/renderer/dom/WidthCache");
const jsdom = require("jsdom");
class TestWidthCache extends WidthCache_1.WidthCache {
    constructor() {
        super(...arguments);
        this.widths = {};
    }
    get flat() {
        return this._flat;
    }
    get holey() {
        return this._holey;
    }
    _measure(c, variant) {
        if (this.widths[c] !== undefined) {
            return this.widths[c][variant];
        }
        return 5;
    }
}
exports.TestWidthCache = TestWidthCache;
function castf32(v) {
    const buffer = new Float32Array(1);
    buffer[0] = v;
    return buffer[0];
}
describe('WidthCache', () => {
    let wc;
    beforeEach(() => {
        const dom = new jsdom.JSDOM('');
        wc = new TestWidthCache(dom.window.document, dom.window.document.createElement('div'));
        wc.setFont('monospace', 15, 'normal', 'bold');
    });
    describe('cache invalidation', () => {
        beforeEach(() => {
            wc.flat.fill(1.23);
            wc.holey?.set('a', 2.34);
        });
        it('can cache values', () => {
            assert.deepStrictEqual(wc.flat[0], castf32(1.23));
            assert.deepStrictEqual(wc.holey?.get('a'), 2.34);
            assert.deepStrictEqual(wc.holey?.size, 1);
        });
        it('clear resets cache entries', () => {
            wc.clear();
            assert.deepStrictEqual(wc.flat[0], castf32(-9999));
            assert.deepStrictEqual(wc.holey?.get('a'), undefined);
            assert.deepStrictEqual(wc.holey?.size, 0);
        });
        it('setFont with changed font name', () => {
            wc.setFont('Arial', 15, 'normal', 'bold');
            assert.deepStrictEqual(wc.flat[0], castf32(-9999));
            assert.deepStrictEqual(wc.holey?.get('a'), undefined);
            assert.deepStrictEqual(wc.holey?.size, 0);
        });
        it('setFont with changed font size', () => {
            wc.setFont('monospace', 14, 'normal', 'bold');
            assert.deepStrictEqual(wc.flat[0], castf32(-9999));
            assert.deepStrictEqual(wc.holey?.get('a'), undefined);
            assert.deepStrictEqual(wc.holey?.size, 0);
        });
        it('setFont with changed weight', () => {
            wc.setFont('monospace', 15, '100', 'bold');
            assert.deepStrictEqual(wc.flat[0], castf32(-9999));
            assert.deepStrictEqual(wc.holey?.get('a'), undefined);
            assert.deepStrictEqual(wc.holey?.size, 0);
        });
        it('setFont with changed weightBold', () => {
            wc.setFont('monospace', 15, 'normal', '900');
            assert.deepStrictEqual(wc.flat[0], castf32(-9999));
            assert.deepStrictEqual(wc.holey?.get('a'), undefined);
            assert.deepStrictEqual(wc.holey?.size, 0);
        });
        it('setFont with unchanged settings does not cache entries', () => {
            wc.setFont('monospace', 15, 'normal', 'bold');
            assert.deepStrictEqual(wc.flat[0], castf32(1.23));
            assert.deepStrictEqual(wc.holey?.get('a'), 2.34);
            assert.deepStrictEqual(wc.holey?.size, 1);
        });
    });
    describe('get', () => {
        it('store regular < WidthCacheSettings.FLAT_SIZE in flat', () => {
            for (let i = 0; i < 256 + 10; ++i) {
                const width = wc.get(String.fromCharCode(i), false, false);
                assert.deepStrictEqual(width, 5);
                if (i < 256) {
                    assert.deepStrictEqual(wc.flat[i], 5);
                    assert.deepStrictEqual(wc.holey?.get(String.fromCharCode(i)), undefined);
                }
                else {
                    assert.deepStrictEqual(wc.holey?.get(String.fromCharCode(i)), 5);
                }
            }
        });
        it('stores bold & italic in holey', () => {
            let width = wc.get('b', true, false);
            assert.deepStrictEqual(width, 5);
            assert.deepStrictEqual(wc.holey?.get('bB'), 5);
            width = wc.get('i', false, true);
            assert.deepStrictEqual(width, 5);
            assert.deepStrictEqual(wc.holey?.get('iI'), 5);
            width = wc.get('x', true, true);
            assert.deepStrictEqual(width, 5);
            assert.deepStrictEqual(wc.holey?.get('xBI'), 5);
        });
        it('can store any string', () => {
            let width = wc.get('foo', false, false);
            assert.deepStrictEqual(width, 5);
            assert.deepStrictEqual(wc.holey?.get('foo'), 5);
            width = wc.get('bar&baz', true, true);
            assert.deepStrictEqual(width, 5);
            assert.deepStrictEqual(wc.holey?.get('bar&bazBI'), 5);
        });
    });
});
//# sourceMappingURL=WidthCache.test.js.map