"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const TestUtils_1 = require("../../../out-test/api/TestUtils");
const APP = 'http://127.0.0.1:3001/test';
let browser;
let page;
const width = 800;
const height = 600;
describe('UnicodeGraphemesAddon', () => {
    before(function () {
        return __awaiter(this, void 0, void 0, function* () {
            browser = yield (0, TestUtils_1.launchBrowser)();
            page = yield (yield browser.newContext()).newPage();
            yield page.setViewportSize({ width, height });
        });
    });
    after(() => __awaiter(void 0, void 0, void 0, function* () {
        yield browser.close();
    }));
    beforeEach(function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield page.goto(APP);
            yield (0, TestUtils_1.openTerminal)(page);
        });
    });
    function evalWidth(str) {
        return __awaiter(this, void 0, void 0, function* () {
            return page.evaluate(`window.term._core.unicodeService.getStringCellWidth('${str}')`);
        });
    }
    const ourVersion = '15-graphemes';
    it('wcwidth V15 emoji test', () => __awaiter(void 0, void 0, void 0, function* () {
        yield page.evaluate(`
      window.unicode = new UnicodeGraphemesAddon();
      window.term.loadAddon(window.unicode);
    `);
        chai_1.assert.deepEqual(yield page.evaluate(`window.term.unicode.versions`), ['6', '15', '15-graphemes']);
        yield page.evaluate(`window.term.unicode.activeVersion = '${ourVersion}';`);
        chai_1.assert.equal(yield page.evaluate(`window.term.unicode.activeVersion`), ourVersion);
        chai_1.assert.equal(yield evalWidth('🤣🤣🤣🤣🤣🤣🤣🤣🤣🤣'), 20, '10 emoji - width 10 in V6; 20 in V11 or later');
        chai_1.assert.equal(yield evalWidth('\u{1F476}\u{1F3FF}\u{1F476}'), 4, 'baby with emoji modifier fitzpatrick type-6; baby');
        chai_1.assert.equal(yield evalWidth('\u{1F469}\u200d\u{1f469}\u200d\u{1f466}'), 2, 'woman+zwj+woman+zwj+boy');
        chai_1.assert.equal(yield evalWidth('=\u{1F3CB}\u{FE0F}=\u{F3CB}\u{1F3FE}\u200D\u2640='), 7, 'person lifting weights (plain, emoji); woman lighting weights, medium dark');
        chai_1.assert.equal(yield evalWidth('\u{1F469}\u{1F469}\u{200D}\u{1F393}\u{1F468}\u{1F3FF}\u{200D}\u{1F393}'), 6, 'woman; woman student; man student dark');
        chai_1.assert.equal(yield evalWidth('\u{1f1f3}\u{1f1f4}/'), 3, 'regional indicator symbol letters N and O, cluster');
        chai_1.assert.equal(yield evalWidth('\u{1f1f3}/\u{1f1f4}'), 3, 'regional indicator symbol letters N and O, separated');
        chai_1.assert.equal(yield evalWidth('\u0061\u0301'), 1, 'letter a with acute accent');
        chai_1.assert.equal(yield evalWidth('{\u1100\u1161\u11a8\u1100\u1161}'), 6, 'Korean Jamo');
        chai_1.assert.equal(yield evalWidth('\uAC00=\uD685='), 6, 'Hangul syllables (pre-composed)');
        chai_1.assert.equal(yield evalWidth('(\u26b0\ufe0e)'), 3, 'coffin with text presentation');
        chai_1.assert.equal(yield evalWidth('(\u26b0\ufe0f)'), 4, 'coffin with emoji presentation');
        chai_1.assert.equal(yield evalWidth('<E\u0301\ufe0fg\ufe0fa\ufe0fl\ufe0fi\ufe0f\ufe0ft\ufe0fe\u0301\ufe0f>'), 16, 'Égalité (using separate acute) emoij_presentation');
    }));
});
//# sourceMappingURL=UnicodeGraphemesAddon.api.js.map