"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const TestUtils_1 = require("../../../out-test/api/TestUtils");
const APP = 'http://127.0.0.1:3001/test';
let browser;
let page;
const width = 1024;
const height = 768;
describe('FitAddon', () => {
    before(async function () {
        browser = await (0, TestUtils_1.launchBrowser)();
        page = await (await browser.newContext()).newPage();
        await page.setViewportSize({ width, height });
        await page.goto(APP);
    });
    beforeEach(async function () {
        await page.evaluate(`document.querySelector('#terminal-container').style.display=''`);
        await (0, TestUtils_1.openTerminal)(page);
    });
    after(async () => {
        await browser.close();
    });
    afterEach(async function () {
        await page.evaluate(`window.term.dispose()`);
    });
    it('no terminal', async function () {
        await page.evaluate(`window.fit = new FitAddon();`);
        chai_1.assert.equal(await page.evaluate(`window.fit.proposeDimensions()`), undefined);
    });
    describe('proposeDimensions', () => {
        afterEach(() => unloadFit());
        it('default', async function () {
            await loadFit();
            const dimensions = await page.evaluate(`window.fit.proposeDimensions()`);
            chai_1.assert.isAbove(dimensions.cols, 85);
            chai_1.assert.isBelow(dimensions.cols, 88);
            chai_1.assert.isAbove(dimensions.rows, 24);
            chai_1.assert.isBelow(dimensions.rows, 29);
        });
        it('width', async function () {
            await loadFit(1008);
            const dimensions = await page.evaluate(`window.fit.proposeDimensions()`);
            chai_1.assert.isAbove(dimensions.cols, 108);
            chai_1.assert.isBelow(dimensions.cols, 111);
            chai_1.assert.isAbove(dimensions.rows, 24);
            chai_1.assert.isBelow(dimensions.rows, 29);
        });
        it('small', async function () {
            await loadFit(1, 1);
            chai_1.assert.deepEqual(await page.evaluate(`window.fit.proposeDimensions()`), {
                cols: 2,
                rows: 1
            });
        });
        it('hidden', async function () {
            await page.evaluate(`window.term.dispose()`);
            await page.evaluate(`document.querySelector('#terminal-container').style.display='none'`);
            await page.evaluate(`window.term = new Terminal()`);
            await page.evaluate(`window.term.open(document.querySelector('#terminal-container'))`);
            await loadFit();
            const dimensions = await page.evaluate(`window.fit.proposeDimensions()`);
            if (dimensions) {
                chai_1.assert.isAbove(dimensions.cols, 85);
                chai_1.assert.isBelow(dimensions.cols, 88);
                chai_1.assert.isAbove(dimensions.rows, 24);
                chai_1.assert.isBelow(dimensions.rows, 29);
            }
        });
    });
    describe('fit', () => {
        afterEach(() => unloadFit());
        it('default', async function () {
            await loadFit();
            await page.evaluate(`window.fit.fit()`);
            const cols = await page.evaluate(`window.term.cols`);
            const rows = await page.evaluate(`window.term.rows`);
            chai_1.assert.isAbove(cols, 85);
            chai_1.assert.isBelow(cols, 88);
            chai_1.assert.isAbove(rows, 24);
            chai_1.assert.isBelow(rows, 29);
        });
        it('width', async function () {
            await loadFit(1008);
            await page.evaluate(`window.fit.fit()`);
            const cols = await page.evaluate(`window.term.cols`);
            const rows = await page.evaluate(`window.term.rows`);
            chai_1.assert.isAbove(cols, 108);
            chai_1.assert.isBelow(cols, 111);
            chai_1.assert.isAbove(rows, 24);
            chai_1.assert.isBelow(rows, 29);
        });
        it('small', async function () {
            await loadFit(1, 1);
            await page.evaluate(`window.fit.fit()`);
            chai_1.assert.equal(await page.evaluate(`window.term.cols`), 2);
            chai_1.assert.equal(await page.evaluate(`window.term.rows`), 1);
        });
    });
});
async function loadFit(width = 800, height = 450) {
    await page.evaluate(`
    window.fit = new FitAddon();
    window.term.loadAddon(window.fit);
    document.querySelector('#terminal-container').style.width='${width}px';
    document.querySelector('#terminal-container').style.height='${height}px';
  `);
}
async function unloadFit() {
    await page.evaluate(`window.fit.dispose();`);
}
//# sourceMappingURL=FitAddon.api.js.map