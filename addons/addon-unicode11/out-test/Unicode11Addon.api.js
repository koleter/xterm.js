"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const TestUtils_1 = require("../../../out-test/api/TestUtils");
const APP = 'http://127.0.0.1:3001/test';
let browser;
let page;
const width = 800;
const height = 600;
describe('Unicode11Addon', () => {
    before(async function () {
        browser = await (0, TestUtils_1.launchBrowser)();
        page = await (await browser.newContext()).newPage();
        await page.setViewportSize({ width, height });
    });
    after(async () => {
        await browser.close();
    });
    beforeEach(async function () {
        await page.goto(APP);
        await (0, TestUtils_1.openTerminal)(page);
    });
    it('wcwidth V11 emoji test', async () => {
        await page.evaluate(`
      window.unicode11 = new Unicode11Addon();
      window.term.loadAddon(window.unicode11);
    `);
        chai_1.assert.deepEqual((await page.evaluate(`window.term.unicode.versions`)).includes('11'), true);
        await page.evaluate(`window.term.unicode.activeVersion = '11';`);
        chai_1.assert.deepEqual(await page.evaluate(`window.term.unicode.activeVersion`), '11');
        chai_1.assert.deepEqual(await page.evaluate(`window.term._core.unicodeService.getStringCellWidth('🤣🤣🤣🤣🤣🤣🤣🤣🤣🤣')`), 20);
    });
});
//# sourceMappingURL=Unicode11Addon.api.js.map