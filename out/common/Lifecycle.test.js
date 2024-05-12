"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const Lifecycle_1 = require("common/Lifecycle");
class TestDisposable extends Lifecycle_1.Disposable {
    get isDisposed() {
        return this._isDisposed;
    }
}
describe('Disposable', () => {
    describe('register', () => {
        it('should register disposables', () => {
            const d = new TestDisposable();
            const d2 = {
                dispose: () => { throw new Error(); }
            };
            d.register(d2);
            chai_1.assert.throws(() => d.dispose());
        });
    });
    describe('unregister', () => {
        it('should unregister disposables', () => {
            const d = new TestDisposable();
            const d2 = {
                dispose: () => { throw new Error(); }
            };
            d.register(d2);
            d.unregister(d2);
            chai_1.assert.doesNotThrow(() => d.dispose());
        });
    });
    describe('dispose', () => {
        it('should set is disposed flag', () => {
            const d = new TestDisposable();
            chai_1.assert.isFalse(d.isDisposed);
            d.dispose();
            chai_1.assert.isTrue(d.isDisposed);
        });
    });
});
describe('MutableDisposable', () => {
    const mutable = new Lifecycle_1.MutableDisposable();
    class TrackedDisposable extends Lifecycle_1.Disposable {
        get isDisposed() { return this._isDisposed; }
    }
    describe('value', () => {
        it('should set the value', () => {
            const d1 = new TrackedDisposable();
            mutable.value = d1;
            chai_1.assert.strictEqual(mutable.value, d1);
            chai_1.assert.isFalse(d1.isDisposed);
        });
        it('should dispose of any previous value', () => {
            const d1 = new TrackedDisposable();
            const d2 = new TrackedDisposable();
            mutable.value = d1;
            mutable.value = d2;
            chai_1.assert.strictEqual(mutable.value, d2);
            chai_1.assert.isTrue(d1.isDisposed);
            chai_1.assert.isFalse(d2.isDisposed);
        });
    });
    describe('clear', () => {
        it('should clear and dispose of the object', () => {
            const d1 = new TrackedDisposable();
            mutable.value = d1;
            mutable.clear();
            chai_1.assert.strictEqual(mutable.value, undefined);
            chai_1.assert.isTrue(d1.isDisposed);
        });
    });
    it('dispose', () => {
        it('should dispose of the object', () => {
            const d1 = new TrackedDisposable();
            mutable.value = d1;
            mutable.dispose();
            chai_1.assert.strictEqual(mutable.value, undefined);
            chai_1.assert.isTrue(d1.isDisposed);
        });
        it('should prevent using the MutableDisposable again', () => {
            const d1 = new TrackedDisposable();
            mutable.value = d1;
            mutable.dispose();
            mutable.value = new TrackedDisposable();
            chai_1.assert.strictEqual(mutable.value, undefined);
        });
    });
});
//# sourceMappingURL=Lifecycle.test.js.map