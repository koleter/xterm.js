"use strict";
/**
 * Copyright (c) 2018 The xterm.js authors. All rights reserved.
 * @license MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.LigaturesAddon = void 0;
const _1 = require(".");
class LigaturesAddon {
    constructor(options) {
        this._fallbackLigatures = ((options === null || options === void 0 ? void 0 : options.fallbackLigatures) || [
            '<--', '<---', '<<-', '<-', '->', '->>', '-->', '--->',
            '<==', '<===', '<<=', '<=', '=>', '=>>', '==>', '===>', '>=', '>>=',
            '<->', '<-->', '<--->', '<---->', '<=>', '<==>', '<===>', '<====>', '-------->',
            '<~~', '<~', '~>', '~~>', '::', ':::', '==', '!=', '===', '!==',
            ':=', ':-', ':+', '<*', '<*>', '*>', '<|', '<|>', '|>', '+:', '-:', '=:', ':>',
            '++', '+++', '<!--', '<!---', '<***>'
        ]).sort((a, b) => b.length - a.length);
    }
    activate(terminal) {
        this._terminal = terminal;
        this._characterJoinerId = (0, _1.enableLigatures)(terminal, this._fallbackLigatures);
    }
    dispose() {
        var _a;
        if (this._characterJoinerId !== undefined) {
            (_a = this._terminal) === null || _a === void 0 ? void 0 : _a.deregisterCharacterJoiner(this._characterJoinerId);
            this._characterJoinerId = undefined;
        }
    }
}
exports.LigaturesAddon = LigaturesAddon;
//# sourceMappingURL=LigaturesAddon.js.map