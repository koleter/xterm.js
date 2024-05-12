"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TEXT_BASELINE = exports.DIM_OPACITY = exports.INVERTED_DEFAULT_COLOR = void 0;
const Platform_1 = require("common/Platform");
exports.INVERTED_DEFAULT_COLOR = 257;
exports.DIM_OPACITY = 0.5;
exports.TEXT_BASELINE = Platform_1.isFirefox || Platform_1.isLegacyEdge ? 'bottom' : 'ideographic';
//# sourceMappingURL=Constants.js.map