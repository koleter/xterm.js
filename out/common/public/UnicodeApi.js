"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UnicodeApi = void 0;
class UnicodeApi {
    constructor(_core) {
        this._core = _core;
    }
    register(provider) {
        this._core.unicodeService.register(provider);
    }
    get versions() {
        return this._core.unicodeService.versions;
    }
    get activeVersion() {
        return this._core.unicodeService.activeVersion;
    }
    set activeVersion(version) {
        this._core.unicodeService.activeVersion = version;
    }
}
exports.UnicodeApi = UnicodeApi;
//# sourceMappingURL=UnicodeApi.js.map