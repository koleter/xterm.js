"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LinkProviderService = void 0;
const Lifecycle_1 = require("common/Lifecycle");
class LinkProviderService extends Lifecycle_1.Disposable {
    constructor() {
        super();
        this.linkProviders = [];
        this.register((0, Lifecycle_1.toDisposable)(() => this.linkProviders.length = 0));
    }
    registerLinkProvider(linkProvider) {
        this.linkProviders.push(linkProvider);
        return {
            dispose: () => {
                const providerIndex = this.linkProviders.indexOf(linkProvider);
                if (providerIndex !== -1) {
                    this.linkProviders.splice(providerIndex, 1);
                }
            }
        };
    }
}
exports.LinkProviderService = LinkProviderService;
//# sourceMappingURL=LinkProviderService.js.map