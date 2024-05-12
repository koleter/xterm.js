"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const XParseColor_1 = require("common/input/XParseColor");
describe('XParseColor', () => {
    describe('parseColor', () => {
        it('rgb:<r>/<g>/<b> scheme in 4/8/12/16 bit', () => {
            chai_1.assert.deepEqual((0, XParseColor_1.parseColor)('rgb:0/0/0'), [0, 0, 0]);
            chai_1.assert.deepEqual((0, XParseColor_1.parseColor)('rgb:f/f/f'), [255, 255, 255]);
            chai_1.assert.deepEqual((0, XParseColor_1.parseColor)('rgb:1/2/3'), [17, 34, 51]);
            chai_1.assert.deepEqual((0, XParseColor_1.parseColor)('rgb:00/00/00'), [0, 0, 0]);
            chai_1.assert.deepEqual((0, XParseColor_1.parseColor)('rgb:ff/ff/ff'), [255, 255, 255]);
            chai_1.assert.deepEqual((0, XParseColor_1.parseColor)('rgb:11/22/33'), [17, 34, 51]);
            chai_1.assert.deepEqual((0, XParseColor_1.parseColor)('rgb:000/000/000'), [0, 0, 0]);
            chai_1.assert.deepEqual((0, XParseColor_1.parseColor)('rgb:fff/fff/fff'), [255, 255, 255]);
            chai_1.assert.deepEqual((0, XParseColor_1.parseColor)('rgb:111/222/333'), [17, 34, 51]);
            chai_1.assert.deepEqual((0, XParseColor_1.parseColor)('rgb:0000/0000/0000'), [0, 0, 0]);
            chai_1.assert.deepEqual((0, XParseColor_1.parseColor)('rgb:ffff/ffff/ffff'), [255, 255, 255]);
            chai_1.assert.deepEqual((0, XParseColor_1.parseColor)('rgb:1111/2222/3333'), [17, 34, 51]);
        });
        it('#RGB scheme in 4/8/12/16 bit', () => {
            chai_1.assert.deepEqual((0, XParseColor_1.parseColor)('#000'), [0, 0, 0]);
            chai_1.assert.deepEqual((0, XParseColor_1.parseColor)('#fff'), [240, 240, 240]);
            chai_1.assert.deepEqual((0, XParseColor_1.parseColor)('#123'), [16, 32, 48]);
            chai_1.assert.deepEqual((0, XParseColor_1.parseColor)('#000000'), [0, 0, 0]);
            chai_1.assert.deepEqual((0, XParseColor_1.parseColor)('#ffffff'), [255, 255, 255]);
            chai_1.assert.deepEqual((0, XParseColor_1.parseColor)('#112233'), [17, 34, 51]);
            chai_1.assert.deepEqual((0, XParseColor_1.parseColor)('#000000000'), [0, 0, 0]);
            chai_1.assert.deepEqual((0, XParseColor_1.parseColor)('#fffffffff'), [255, 255, 255]);
            chai_1.assert.deepEqual((0, XParseColor_1.parseColor)('#111222333'), [17, 34, 51]);
            chai_1.assert.deepEqual((0, XParseColor_1.parseColor)('#000000000000'), [0, 0, 0]);
            chai_1.assert.deepEqual((0, XParseColor_1.parseColor)('#ffffffffffff'), [255, 255, 255]);
            chai_1.assert.deepEqual((0, XParseColor_1.parseColor)('#111122223333'), [17, 34, 51]);
        });
        it('supports upper case', () => {
            chai_1.assert.deepEqual((0, XParseColor_1.parseColor)('RGB:0/A/F'), [0, 170, 255]);
            chai_1.assert.deepEqual((0, XParseColor_1.parseColor)('#FFF'), [240, 240, 240]);
        });
        it('does not parse illegal combinations', () => {
            chai_1.assert.equal((0, XParseColor_1.parseColor)('rgb:0/11/222'), undefined);
            chai_1.assert.equal((0, XParseColor_1.parseColor)('rgbi:00/11/22'), undefined);
            chai_1.assert.equal((0, XParseColor_1.parseColor)('#aabbbcc'), undefined);
            chai_1.assert.equal((0, XParseColor_1.parseColor)('#aabbgg'), undefined);
            chai_1.assert.equal((0, XParseColor_1.parseColor)('rgb:aa/bb/gg'), undefined);
        });
    });
    describe('toXColorRgb', () => {
        it('rgb:<r>/<g>/<b> scheme in 4/8/12/16 bit', () => {
            chai_1.assert.equal((0, XParseColor_1.toRgbString)((0, XParseColor_1.parseColor)('rgb:0/0/0'), 4), 'rgb:0/0/0');
            chai_1.assert.equal((0, XParseColor_1.toRgbString)((0, XParseColor_1.parseColor)('rgb:f/f/f'), 4), 'rgb:f/f/f');
            chai_1.assert.equal((0, XParseColor_1.toRgbString)((0, XParseColor_1.parseColor)('rgb:1/2/3'), 4), 'rgb:1/2/3');
            chai_1.assert.equal((0, XParseColor_1.toRgbString)((0, XParseColor_1.parseColor)('rgb:00/00/00'), 8), 'rgb:00/00/00');
            chai_1.assert.equal((0, XParseColor_1.toRgbString)((0, XParseColor_1.parseColor)('rgb:ff/ff/ff'), 8), 'rgb:ff/ff/ff');
            chai_1.assert.equal((0, XParseColor_1.toRgbString)((0, XParseColor_1.parseColor)('rgb:11/22/33'), 8), 'rgb:11/22/33');
            chai_1.assert.equal((0, XParseColor_1.toRgbString)((0, XParseColor_1.parseColor)('rgb:000/000/000'), 12), 'rgb:000/000/000');
            chai_1.assert.equal((0, XParseColor_1.toRgbString)((0, XParseColor_1.parseColor)('rgb:fff/fff/fff'), 12), 'rgb:fff/fff/fff');
            chai_1.assert.equal((0, XParseColor_1.toRgbString)((0, XParseColor_1.parseColor)('rgb:111/222/333'), 12), 'rgb:111/222/333');
            chai_1.assert.equal((0, XParseColor_1.toRgbString)((0, XParseColor_1.parseColor)('rgb:0000/0000/0000'), 16), 'rgb:0000/0000/0000');
            chai_1.assert.equal((0, XParseColor_1.toRgbString)((0, XParseColor_1.parseColor)('rgb:ffff/ffff/ffff'), 16), 'rgb:ffff/ffff/ffff');
            chai_1.assert.equal((0, XParseColor_1.toRgbString)((0, XParseColor_1.parseColor)('rgb:1111/2222/3333'), 16), 'rgb:1111/2222/3333');
        });
        it('defaults to 16 bit output', () => {
            chai_1.assert.equal((0, XParseColor_1.toRgbString)((0, XParseColor_1.parseColor)('rgb:1/2/3')), 'rgb:1111/2222/3333');
            chai_1.assert.equal((0, XParseColor_1.toRgbString)((0, XParseColor_1.parseColor)('rgb:11/22/33')), 'rgb:1111/2222/3333');
            chai_1.assert.equal((0, XParseColor_1.toRgbString)((0, XParseColor_1.parseColor)('rgb:111/222/333')), 'rgb:1111/2222/3333');
            chai_1.assert.equal((0, XParseColor_1.toRgbString)((0, XParseColor_1.parseColor)('rgb:123/123/123')), 'rgb:1212/1212/1212');
        });
        it('reduces colors to 8 bit resolution', () => {
            chai_1.assert.equal((0, XParseColor_1.toRgbString)((0, XParseColor_1.parseColor)('rgb:123/123/123'), 12), 'rgb:121/121/121');
            chai_1.assert.equal((0, XParseColor_1.toRgbString)((0, XParseColor_1.parseColor)('rgb:1234/1234/1234'), 16), 'rgb:1212/1212/1212');
        });
    });
});
//# sourceMappingURL=XParseColor.test.js.map