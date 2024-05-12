"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ParserApi = void 0;
class ParserApi {
    constructor(_core) {
        this._core = _core;
    }
    registerCsiHandler(id, callback) {
        return this._core.registerCsiHandler(id, (params) => callback(params.toArray()));
    }
    addCsiHandler(id, callback) {
        return this.registerCsiHandler(id, callback);
    }
    registerDcsHandler(id, callback) {
        return this._core.registerDcsHandler(id, (data, params) => callback(data, params.toArray()));
    }
    addDcsHandler(id, callback) {
        return this.registerDcsHandler(id, callback);
    }
    registerEscHandler(id, handler) {
        return this._core.registerEscHandler(id, handler);
    }
    addEscHandler(id, handler) {
        return this.registerEscHandler(id, handler);
    }
    registerOscHandler(ident, callback) {
        return this._core.registerOscHandler(ident, callback);
    }
    addOscHandler(ident, callback) {
        return this.registerOscHandler(ident, callback);
    }
}
exports.ParserApi = ParserApi;
//# sourceMappingURL=ParserApi.js.map