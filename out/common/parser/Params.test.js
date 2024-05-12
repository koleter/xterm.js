"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const Params_1 = require("common/parser/Params");
class TestParams extends Params_1.Params {
    get subParams() {
        return this._subParams;
    }
    get subParamsLength() {
        return this._subParamsLength;
    }
}
function parse(params, s) {
    params.reset();
    params.addParam(0);
    if (typeof s === 'string') {
        s = [s];
    }
    for (const chunk of s) {
        for (let i = 0; i < chunk.length; ++i) {
            let code = chunk.charCodeAt(i);
            do {
                switch (code) {
                    case 0x3b:
                        params.addParam(0);
                        break;
                    case 0x3a:
                        params.addSubParam(-1);
                        break;
                    default:
                        params.addDigit(code - 48);
                }
            } while (++i < s.length && (code = chunk.charCodeAt(i)) > 0x2f && code < 0x3c);
            i--;
        }
    }
}
describe('Params', () => {
    it('should respect ctor args', () => {
        const params = new TestParams(12, 23);
        chai_1.assert.equal(params.params.length, 12);
        chai_1.assert.equal(params.subParams.length, 23);
        chai_1.assert.deepEqual(params.toArray(), []);
    });
    it('addParam', () => {
        const params = new TestParams();
        params.addParam(1);
        chai_1.assert.equal(params.length, 1);
        chai_1.assert.deepEqual(Array.prototype.slice.call(params.params, 0, params.length), [1]);
        chai_1.assert.deepEqual(params.toArray(), [1]);
        params.addParam(23);
        chai_1.assert.equal(params.length, 2);
        chai_1.assert.deepEqual(Array.prototype.slice.call(params.params, 0, params.length), [1, 23]);
        chai_1.assert.deepEqual(params.toArray(), [1, 23]);
        chai_1.assert.equal(params.subParamsLength, 0);
    });
    it('addSubParam', () => {
        const params = new TestParams();
        params.addParam(1);
        params.addSubParam(2);
        params.addSubParam(3);
        chai_1.assert.equal(params.length, 1);
        chai_1.assert.equal(params.subParamsLength, 2);
        chai_1.assert.deepEqual(params.toArray(), [1, [2, 3]]);
        params.addParam(12345);
        params.addSubParam(-1);
        chai_1.assert.equal(params.length, 2);
        chai_1.assert.equal(params.subParamsLength, 3);
        chai_1.assert.deepEqual(params.toArray(), [1, [2, 3], 12345, [-1]]);
    });
    it('should not add sub params without previous param', () => {
        const params = new TestParams();
        params.addSubParam(2);
        params.addSubParam(3);
        chai_1.assert.equal(params.length, 0);
        chai_1.assert.equal(params.subParamsLength, 0);
        chai_1.assert.deepEqual(params.toArray(), []);
        params.addParam(1);
        params.addSubParam(2);
        params.addSubParam(3);
        chai_1.assert.equal(params.length, 1);
        chai_1.assert.equal(params.subParamsLength, 2);
        chai_1.assert.deepEqual(params.toArray(), [1, [2, 3]]);
    });
    it('reset', () => {
        const params = new TestParams();
        params.addParam(1);
        params.addSubParam(2);
        params.addSubParam(3);
        params.addParam(12345);
        params.addSubParam(-1);
        params.reset();
        chai_1.assert.equal(params.length, 0);
        chai_1.assert.equal(params.subParamsLength, 0);
        chai_1.assert.deepEqual(params.toArray(), []);
        params.addParam(1);
        params.addSubParam(2);
        params.addSubParam(3);
        params.addParam(12345);
        params.addSubParam(-1);
        chai_1.assert.equal(params.length, 2);
        chai_1.assert.equal(params.subParamsLength, 3);
        chai_1.assert.deepEqual(params.toArray(), [1, [2, 3], 12345, [-1]]);
    });
    it('Params.fromArray --> toArray', () => {
        let data = [];
        chai_1.assert.deepEqual(Params_1.Params.fromArray(data).toArray(), data);
        data = [1, [2, 3], 12345, [-1]];
        chai_1.assert.deepEqual(Params_1.Params.fromArray(data).toArray(), data);
        data = [38, 2, 50, 100, 150];
        chai_1.assert.deepEqual(Params_1.Params.fromArray(data).toArray(), data);
        data = [38, 2, 50, 100, [150]];
        chai_1.assert.deepEqual(Params_1.Params.fromArray(data).toArray(), data);
        data = [38, [2, 50, 100, 150]];
        chai_1.assert.deepEqual(Params_1.Params.fromArray(data).toArray(), data);
        data = [38, [2, 50, 100, 150], 5, [], 6];
        chai_1.assert.deepEqual(Params_1.Params.fromArray(data).toArray(), [38, [2, 50, 100, 150], 5, 6]);
    });
    it('clone', () => {
        const params = Params_1.Params.fromArray([38, [2, 50, 100, 150], 5, [], 6, 1, [2, 3], 12345, [-1]]);
        chai_1.assert.deepEqual(params.clone(), params);
    });
    it('hasSubParams / getSubParams', () => {
        const params = Params_1.Params.fromArray([38, [2, 50, 100, 150], 5, [], 6]);
        chai_1.assert.equal(params.hasSubParams(0), true);
        chai_1.assert.deepEqual(params.getSubParams(0), new Int32Array([2, 50, 100, 150]));
        chai_1.assert.equal(params.hasSubParams(1), false);
        chai_1.assert.deepEqual(params.getSubParams(1), null);
        chai_1.assert.equal(params.hasSubParams(2), false);
        chai_1.assert.deepEqual(params.getSubParams(2), null);
    });
    it('getSubParamsAll', () => {
        const params = Params_1.Params.fromArray([1, [2, 3], 7, 12345, [-1]]);
        chai_1.assert.deepEqual(params.getSubParamsAll(), { 0: new Int32Array([2, 3]), 2: new Int32Array([-1]) });
    });
    describe('parse tests', () => {
        it('param defaults to 0 (ZDM - zero default mode)', () => {
            const params = new Params_1.Params();
            parse(params, '');
            chai_1.assert.deepEqual(params.toArray(), [0]);
        });
        it('sub param defaults to -1', () => {
            const params = new Params_1.Params();
            parse(params, ':');
            chai_1.assert.deepEqual(params.toArray(), [0, [-1]]);
        });
        it('should correctly reset on new sequence', () => {
            const params = new Params_1.Params();
            parse(params, '1;2;3');
            chai_1.assert.deepEqual(params.toArray(), [1, 2, 3]);
            parse(params, '4');
            chai_1.assert.deepEqual(params.toArray(), [4]);
            parse(params, '4::123:5;6;7');
            chai_1.assert.deepEqual(params.toArray(), [4, [-1, 123, 5], 6, 7]);
            parse(params, '');
            chai_1.assert.deepEqual(params.toArray(), [0]);
        });
        it('should handle length restrictions correctly', () => {
            const params = new Params_1.Params(3, 3);
            parse(params, '1;2;3');
            chai_1.assert.deepEqual(params.toArray(), [1, 2, 3]);
            parse(params, '4');
            chai_1.assert.deepEqual(params.toArray(), [4]);
            parse(params, '4::123:5;6;7');
            chai_1.assert.deepEqual(params.toArray(), [4, [-1, 123, 5], 6, 7]);
            parse(params, '');
            chai_1.assert.deepEqual(params.toArray(), [0]);
            parse(params, '1;2;3;4;5;6;7');
            chai_1.assert.deepEqual(params.toArray(), [1, 2, 3]);
            parse(params, '4;38:2::50:100:150;48:5:22');
            chai_1.assert.deepEqual(params.toArray(), [4, 38, [2, -1, 50], 48]);
        });
        it('typical sequences', () => {
            const params = new Params_1.Params();
            parse(params, '0;4;38;2;50;100;150;48;5;22');
            chai_1.assert.deepEqual(params.toArray(), [0, 4, 38, 2, 50, 100, 150, 48, 5, 22]);
            parse(params, '0;4;38;2;50:100:150;48;5:22');
            chai_1.assert.deepEqual(params.toArray(), [0, 4, 38, 2, 50, [100, 150], 48, 5, [22]]);
            parse(params, '0;4;38:2::50:100:150;48:5:22');
            chai_1.assert.deepEqual(params.toArray(), [0, 4, 38, [2, -1, 50, 100, 150], 48, [5, 22]]);
        });
    });
    describe('should not overflow to negative', () => {
        it('reject params lesser -1', () => {
            const params = new Params_1.Params();
            params.addParam(-1);
            chai_1.assert.throws(() => params.addParam(-2), 'values lesser than -1 are not allowed');
        });
        it('reject subparams lesser -1', () => {
            const params = new Params_1.Params();
            params.addParam(-1);
            params.addSubParam(-1);
            chai_1.assert.throws(() => params.addSubParam(-2), 'values lesser than -1 are not allowed');
            chai_1.assert.deepEqual(params.toArray(), [-1, [-1]]);
        });
        it('clamp parsed params', () => {
            const params = new Params_1.Params();
            parse(params, '2147483648');
            chai_1.assert.deepEqual(params.toArray(), [0x7FFFFFFF]);
        });
        it('clamp parsed subparams', () => {
            const params = new Params_1.Params();
            parse(params, ':2147483648');
            chai_1.assert.deepEqual(params.toArray(), [0, [0x7FFFFFFF]]);
        });
    });
    describe('issue 2389', () => {
        it('should cancel subdigits if beyond params limit', () => {
            const params = new Params_1.Params();
            parse(params, ';;;;;;;;;10;;;;;;;;;;20;;;;;;;;;;30;31;32;33;34;35::::::::');
            chai_1.assert.deepEqual(params.toArray(), [
                0, 0, 0, 0, 0, 0, 0, 0, 0, 10,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 20,
                0, 0, 0, 0, 0, 0, 0, 0, 0, 30, 31, 32
            ]);
        });
        it('should carry forward isSub state', () => {
            const params = new Params_1.Params();
            parse(params, ['1:22:33', '44']);
            chai_1.assert.deepEqual(params.toArray(), [1, [22, 3344]]);
        });
    });
});
//# sourceMappingURL=Params.test.js.map