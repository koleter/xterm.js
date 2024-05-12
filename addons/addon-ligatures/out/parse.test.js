"use strict";
/**
 * Copyright (c) 2018 The xterm.js authors. All rights reserved.
 * @license MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const parse_1 = require("./parse");
// TODO: integrate tests from http://test.csswg.org/suites/css-fonts-4_dev/nightly-unstable/
describe('parse', () => {
    it('parses individual families', () => {
        chai_1.assert.deepEqual((0, parse_1.default)('monospace'), ['monospace']);
    });
    it('parses multiple families', () => {
        chai_1.assert.deepEqual((0, parse_1.default)('Arial, Verdana, serif'), ['Arial', 'Verdana', 'serif']);
    });
    it('parses quoted families', () => {
        chai_1.assert.deepEqual((0, parse_1.default)('"Times New Roman", serif'), ['Times New Roman', 'serif']);
    });
    it('parses single quoted families', () => {
        chai_1.assert.deepEqual((0, parse_1.default)('\'Times New Roman\', serif'), ['Times New Roman', 'serif']);
    });
    it('parses families with spaces in their names', () => {
        chai_1.assert.deepEqual((0, parse_1.default)('Times New Roman, serif'), ['Times New Roman', 'serif']);
    });
    it('collapses multiple spaces together in identifiers', () => {
        chai_1.assert.deepEqual((0, parse_1.default)('Times   New Roman, serif'), ['Times New Roman', 'serif']);
    });
    it('does not collapse multiple spaces together in quoted strings', () => {
        chai_1.assert.deepEqual((0, parse_1.default)('"Times   New Roman", serif'), ['Times   New Roman', 'serif']);
    });
    it('handles escaped characters in strings', () => {
        chai_1.assert.deepEqual((0, parse_1.default)('"quote \\" slash \\\\ slashquote \\\\\\"", serif'), ['quote " slash \\ slashquote \\"', 'serif']);
    });
    it('fails if a family has an unterminated string', () => {
        chai_1.assert.throws(() => (0, parse_1.default)('"Unterminated, serif'));
    });
    it('handles unicode escape sequences', () => {
        chai_1.assert.deepEqual((0, parse_1.default)('"space\\20 between", serif'), ['space between', 'serif']);
    });
    it('swallows only the first space after a unicode escape', () => {
        chai_1.assert.deepEqual((0, parse_1.default)('"two-space\\20  between", serif'), ['two-space  between', 'serif']);
    });
    it('automatically ends the unicode escape after six digits', () => {
        chai_1.assert.deepEqual((0, parse_1.default)('space\\000020between, serif'), ['space between', 'serif']);
    });
    it('handles unicode escapes at the end of the family', () => {
        chai_1.assert.deepEqual((0, parse_1.default)('endswithbrace \\7b, serif'), ['endswithbrace {', 'serif']);
    });
    it('handles unicode escapes at the end of the input', () => {
        chai_1.assert.deepEqual((0, parse_1.default)('endswithbrace \\7b'), ['endswithbrace {']);
    });
    it('handles other escaped characters in identifiers', () => {
        chai_1.assert.deepEqual((0, parse_1.default)('has\\,comma'), ['has,comma']);
    });
    it('swallows escaped newlines in strings', () => {
        chai_1.assert.deepEqual((0, parse_1.default)('"multi \\\nline", serif'), ['multi line', 'serif']);
    });
});
//# sourceMappingURL=parse.test.js.map