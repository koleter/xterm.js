"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AddonManager = void 0;
class AddonManager {
    constructor() {
        this._addons = [];
    }
    dispose() {
        for (let i = this._addons.length - 1; i >= 0; i--) {
            this._addons[i].instance.dispose();
        }
    }
    loadAddon(terminal, instance) {
        const loadedAddon = {
            instance,
            dispose: instance.dispose,
            isDisposed: false
        };
        this._addons.push(loadedAddon);
        instance.dispose = () => this._wrappedAddonDispose(loadedAddon);
        instance.activate(terminal);
    }
    _wrappedAddonDispose(loadedAddon) {
        if (loadedAddon.isDisposed) {
            return;
        }
        let index = -1;
        for (let i = 0; i < this._addons.length; i++) {
            if (this._addons[i] === loadedAddon) {
                index = i;
                break;
            }
        }
        if (index === -1) {
            throw new Error('Could not dispose an addon that has not been loaded');
        }
        loadedAddon.isDisposed = true;
        loadedAddon.dispose.apply(loadedAddon.instance);
        this._addons.splice(index, 1);
    }
}
exports.AddonManager = AddonManager;
//# sourceMappingURL=AddonManager.js.map