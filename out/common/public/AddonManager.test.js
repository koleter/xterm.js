"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const AddonManager_1 = require("./AddonManager");
class TestAddonManager extends AddonManager_1.AddonManager {
    get addons() {
        return this._addons;
    }
}
describe('AddonManager', () => {
    let manager;
    beforeEach(() => {
        manager = new TestAddonManager();
    });
    describe('loadAddon', () => {
        it('should call addon constructor', () => {
            let called = false;
            class Addon {
                activate(terminal) {
                    chai_1.assert.equal(terminal, 'foo', 'The first constructor arg should be Terminal');
                    called = true;
                }
                dispose() { }
            }
            manager.loadAddon('foo', new Addon());
            chai_1.assert.equal(called, true);
        });
    });
    describe('dispose', () => {
        it('should dispose all loaded addons', () => {
            let called = 0;
            class Addon {
                activate() { }
                dispose() { called++; }
            }
            manager.loadAddon(null, new Addon());
            manager.loadAddon(null, new Addon());
            manager.loadAddon(null, new Addon());
            chai_1.assert.equal(manager.addons.length, 3);
            manager.dispose();
            chai_1.assert.equal(called, 3);
            chai_1.assert.equal(manager.addons.length, 0);
        });
    });
});
//# sourceMappingURL=AddonManager.test.js.map