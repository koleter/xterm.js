"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const UnicodeService_1 = require("common/services/UnicodeService");
class DummyProvider {
    constructor() {
        this.version = '123';
    }
    wcwidth(n) {
        return 2;
    }
    charProperties(codepoint) {
        return UnicodeService_1.UnicodeService.createPropertyValue(0, this.wcwidth(codepoint));
    }
}
describe('unicode provider', () => {
    let us;
    beforeEach(() => {
        us = new UnicodeService_1.UnicodeService();
    });
    it('default to V6', () => {
        chai_1.assert.equal(us.activeVersion, '6');
        chai_1.assert.deepEqual(us.versions, ['6']);
        chai_1.assert.doesNotThrow(() => { us.activeVersion = '6'; }, `unknown Unicode version "6"`);
        chai_1.assert.equal(us.getStringCellWidth('hello'), 5);
    });
    it('activate should throw for unknown version', () => {
        chai_1.assert.throws(() => { us.activeVersion = '55'; }, 'unknown Unicode version "55"');
    });
    it('should notify about version change', () => {
        const notes = [];
        us.onChange(version => notes.push(version));
        const dummyProvider = new DummyProvider();
        us.register(dummyProvider);
        us.activeVersion = dummyProvider.version;
        chai_1.assert.deepEqual(notes, [dummyProvider.version]);
    });
    it('correctly changes provider impl', () => {
        chai_1.assert.equal(us.getStringCellWidth('hello'), 5);
        const dummyProvider = new DummyProvider();
        us.register(dummyProvider);
        us.activeVersion = dummyProvider.version;
        chai_1.assert.equal(us.getStringCellWidth('hello'), 2 * 5);
    });
    it('wcwidth V6 emoji test', () => {
        const widthV6 = us.getStringCellWidth('🤣🤣🤣🤣🤣🤣🤣🤣🤣🤣');
        chai_1.assert.equal(widthV6, 10);
    });
});
//# sourceMappingURL=UnicodeService.test.js.map