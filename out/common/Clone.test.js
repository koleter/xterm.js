"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const Clone_1 = require("common/Clone");
describe('clone', () => {
    it('should clone simple objects', () => {
        const test = {
            a: 1,
            b: 2
        };
        chai_1.assert.deepEqual((0, Clone_1.clone)(test), { a: 1, b: 2 });
    });
    it('should clone nested objects', () => {
        const test = {
            bar: {
                a: 1,
                b: 2,
                c: {
                    foo: 'bar'
                }
            }
        };
        chai_1.assert.deepEqual((0, Clone_1.clone)(test), {
            bar: {
                a: 1,
                b: 2,
                c: {
                    foo: 'bar'
                }
            }
        });
    });
    it('should clone array values', () => {
        const test = {
            a: [1, 2, 3],
            b: [1, null, 'test', { foo: 'bar' }]
        };
        chai_1.assert.deepEqual((0, Clone_1.clone)(test), {
            a: [1, 2, 3],
            b: [1, null, 'test', { foo: 'bar' }]
        });
    });
    it('should stop mutation from occuring on the original object', () => {
        const test = {
            a: 1,
            b: 2,
            c: {
                foo: 'bar'
            }
        };
        const cloned = (0, Clone_1.clone)(test);
        test.a = 5;
        test.c.foo = 'barbaz';
        chai_1.assert.deepEqual(cloned, {
            a: 1,
            b: 2,
            c: {
                foo: 'bar'
            }
        });
    });
    it('should clone to a maximum depth of 5 by default', () => {
        const test = {
            a: {
                b: {
                    c: {
                        d: {
                            e: {
                                f: 'foo'
                            }
                        }
                    }
                }
            }
        };
        const cloned = (0, Clone_1.clone)(test);
        test.a.b.c.d.e.f = 'bar';
        chai_1.assert.equal(cloned.a.b.c.d.e.f, 'bar');
    });
    it('should allow an optional maximum depth to be set', () => {
        const test = {
            a: {
                b: {
                    c: 'foo'
                }
            }
        };
        const cloned = (0, Clone_1.clone)(test, 2);
        test.a.b.c = 'bar';
        chai_1.assert.equal(cloned.a.b.c, 'bar');
    });
    it('should not throw when cloning a recursive reference', () => {
        const test = {
            a: {
                b: {
                    c: {}
                }
            }
        };
        test.a.b.c = test;
        chai_1.assert.doesNotThrow(() => (0, Clone_1.clone)(test));
    });
});
//# sourceMappingURL=Clone.test.js.map