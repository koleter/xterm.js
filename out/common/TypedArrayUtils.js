"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.concat = void 0;
function concat(a, b) {
    const result = new a.constructor(a.length + b.length);
    result.set(a);
    result.set(b, a.length);
    return result;
}
exports.concat = concat;
//# sourceMappingURL=TypedArrayUtils.js.map