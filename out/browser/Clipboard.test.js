"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const Clipboard = require("browser/Clipboard");
describe('evaluatePastedTextProcessing', () => {
    it('should replace carriage return and/or line feed with carriage return', () => {
        const pastedText = {
            unix: 'foo\nbar\n',
            windows: 'foo\r\nbar\r\n'
        };
        const processedText = {
            unix: Clipboard.prepareTextForTerminal(pastedText.unix),
            windows: Clipboard.prepareTextForTerminal(pastedText.windows)
        };
        chai_1.assert.equal(processedText.unix, 'foo\rbar\r');
        chai_1.assert.equal(processedText.windows, 'foo\rbar\r');
    });
    it('should bracket pasted text in bracketedPasteMode', () => {
        const pastedText = 'foo bar';
        const unbracketedText = Clipboard.bracketTextForPaste(pastedText, false);
        const bracketedText = Clipboard.bracketTextForPaste(pastedText, true);
        chai_1.assert.equal(unbracketedText, 'foo bar');
        chai_1.assert.equal(bracketedText, '\x1b[200~foo bar\x1b[201~');
    });
});
//# sourceMappingURL=Clipboard.test.js.map