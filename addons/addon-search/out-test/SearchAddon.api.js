"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const fs_1 = require("fs");
const path_1 = require("path");
const TestUtils_1 = require("../../../out-test/api/TestUtils");
const APP = 'http://127.0.0.1:3001/test';
let browser;
let page;
const width = 800;
const height = 600;
describe('Search Tests', function () {
    before(async function () {
        browser = await (0, TestUtils_1.launchBrowser)();
        page = await (await browser.newContext()).newPage();
        await page.setViewportSize({ width, height });
        await page.goto(APP);
        await (0, TestUtils_1.openTerminal)(page);
    });
    after(() => {
        browser.close();
    });
    beforeEach(async () => {
        await page.evaluate(`
      window.term.reset()
      window.search?.dispose();
      window.search = new SearchAddon();
      window.term.loadAddon(window.search);
    `);
    });
    it('Simple Search', async () => {
        await (0, TestUtils_1.writeSync)(page, 'dafhdjfldshafhldsahfkjhldhjkftestlhfdsakjfhdjhlfdsjkafhjdlk');
        chai_1.assert.deepEqual(await page.evaluate(`window.search.findNext('test')`), true);
        chai_1.assert.deepEqual(await page.evaluate(`window.term.getSelection()`), 'test');
    });
    it('Scrolling Search', async () => {
        let dataString = '';
        for (let i = 0; i < 100; i++) {
            if (i === 52) {
                dataString += '$^1_3{}test$#';
            }
            dataString += makeData(50);
        }
        await (0, TestUtils_1.writeSync)(page, dataString);
        chai_1.assert.deepEqual(await page.evaluate(`window.search.findNext('$^1_3{}test$#')`), true);
        chai_1.assert.deepEqual(await page.evaluate(`window.term.getSelection()`), '$^1_3{}test$#');
    });
    it('Incremental Find Previous', async () => {
        await page.evaluate(`window.term.writeln('package.jsonc\\n')`);
        await (0, TestUtils_1.writeSync)(page, 'package.json pack package.lock');
        await page.evaluate(`window.search.findPrevious('pack', {incremental: true})`);
        let line = await page.evaluate(`window.term.buffer.active.getLine(window.term.getSelectionPosition().start.y).translateToString()`);
        let selectionPosition = await page.evaluate(`window.term.getSelectionPosition()`);
        chai_1.assert.deepEqual(line.substring(selectionPosition.start.x, selectionPosition.end.x + 8), 'package.lock');
        await page.evaluate(`window.search.findPrevious('package.j', {incremental: true})`);
        selectionPosition = await page.evaluate(`window.term.getSelectionPosition()`);
        chai_1.assert.deepEqual(line.substring(selectionPosition.start.x, selectionPosition.end.x + 3), 'package.json');
        await page.evaluate(`window.search.findPrevious('package.jsonc', {incremental: true})`);
        line = await page.evaluate(`window.term.buffer.active.getLine(window.term.getSelectionPosition().start.y).translateToString()`);
        selectionPosition = await page.evaluate(`window.term.getSelectionPosition()`);
        chai_1.assert.deepEqual(line.substring(selectionPosition.start.x, selectionPosition.end.x), 'package.jsonc');
    });
    it('Incremental Find Next', async () => {
        await page.evaluate(`window.term.writeln('package.lock pack package.json package.ups\\n')`);
        await (0, TestUtils_1.writeSync)(page, 'package.jsonc');
        await page.evaluate(`window.search.findNext('pack', {incremental: true})`);
        let line = await page.evaluate(`window.term.buffer.active.getLine(window.term.getSelectionPosition().start.y).translateToString()`);
        let selectionPosition = await page.evaluate(`window.term.getSelectionPosition()`);
        chai_1.assert.deepEqual(line.substring(selectionPosition.start.x, selectionPosition.end.x + 8), 'package.lock');
        await page.evaluate(`window.search.findNext('package.j', {incremental: true})`);
        selectionPosition = await page.evaluate(`window.term.getSelectionPosition()`);
        chai_1.assert.deepEqual(line.substring(selectionPosition.start.x, selectionPosition.end.x + 3), 'package.json');
        await page.evaluate(`window.search.findNext('package.jsonc', {incremental: true})`);
        line = await page.evaluate(`window.term.buffer.active.getLine(window.term.getSelectionPosition().start.y).translateToString()`);
        selectionPosition = await page.evaluate(`window.term.getSelectionPosition()`);
        chai_1.assert.deepEqual(line.substring(selectionPosition.start.x, selectionPosition.end.x), 'package.jsonc');
    });
    it('Simple Regex', async () => {
        await (0, TestUtils_1.writeSync)(page, 'abc123defABCD');
        await page.evaluate(`window.search.findNext('[a-z]+', {regex: true})`);
        chai_1.assert.deepEqual(await page.evaluate(`window.term.getSelection()`), 'abc');
        await page.evaluate(`window.search.findNext('[A-Z]+', {regex: true, caseSensitive: true})`);
        chai_1.assert.deepEqual(await page.evaluate(`window.term.getSelection()`), 'ABCD');
    });
    it('Search for single result twice should not unselect it', async () => {
        await (0, TestUtils_1.writeSync)(page, 'abc def');
        chai_1.assert.deepEqual(await page.evaluate(`window.search.findNext('abc')`), true);
        chai_1.assert.deepEqual(await page.evaluate(`window.term.getSelection()`), 'abc');
        chai_1.assert.deepEqual(await page.evaluate(`window.search.findNext('abc')`), true);
        chai_1.assert.deepEqual(await page.evaluate(`window.term.getSelection()`), 'abc');
    });
    it('Search for result bounding with wide unicode chars', async () => {
        await (0, TestUtils_1.writeSync)(page, '中文xx𝄞𝄞');
        chai_1.assert.deepEqual(await page.evaluate(`window.search.findNext('中')`), true);
        chai_1.assert.deepEqual(await page.evaluate(`window.term.getSelection()`), '中');
        chai_1.assert.deepEqual(await page.evaluate(`window.search.findNext('xx')`), true);
        chai_1.assert.deepEqual(await page.evaluate(`window.term.getSelection()`), 'xx');
        chai_1.assert.deepEqual(await page.evaluate(`window.search.findNext('𝄞')`), true);
        chai_1.assert.deepEqual(await page.evaluate(`window.term.getSelection()`), '𝄞');
        chai_1.assert.deepEqual(await page.evaluate(`window.search.findNext('𝄞')`), true);
        chai_1.assert.deepEqual(await page.evaluate(`window.term.getSelectionPosition()`), {
            start: {
                x: 7,
                y: 0
            },
            end: {
                x: 8,
                y: 0
            }
        });
    });
    describe('onDidChangeResults', async () => {
        describe('findNext', () => {
            it('should not fire unless the decorations option is set', async () => {
                await page.evaluate(`
          window.calls = [];
          window.search.onDidChangeResults(e => window.calls.push(e));
        `);
                await (0, TestUtils_1.writeSync)(page, 'abc');
                chai_1.assert.strictEqual(await page.evaluate(`window.search.findNext('a')`), true);
                chai_1.assert.strictEqual(await page.evaluate('window.calls.length'), 0);
                chai_1.assert.strictEqual(await page.evaluate(`window.search.findNext('b', { decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
                chai_1.assert.strictEqual(await page.evaluate('window.calls.length'), 1);
            });
            it('should fire with correct event values', async () => {
                await page.evaluate(`
          window.calls = [];
          window.search.onDidChangeResults(e => window.calls.push(e));
        `);
                await (0, TestUtils_1.writeSync)(page, 'abc bc c');
                chai_1.assert.strictEqual(await page.evaluate(`window.search.findNext('a', { decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
                chai_1.assert.deepStrictEqual(await page.evaluate('window.calls'), [
                    { resultCount: 1, resultIndex: 0 }
                ]);
                chai_1.assert.strictEqual(await page.evaluate(`window.search.findNext('b', { decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
                chai_1.assert.deepStrictEqual(await page.evaluate('window.calls'), [
                    { resultCount: 1, resultIndex: 0 },
                    { resultCount: 2, resultIndex: 0 }
                ]);
                chai_1.assert.strictEqual(await page.evaluate(`window.search.findNext('d', { decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), false);
                chai_1.assert.deepStrictEqual(await page.evaluate('window.calls'), [
                    { resultCount: 1, resultIndex: 0 },
                    { resultCount: 2, resultIndex: 0 },
                    { resultCount: 0, resultIndex: -1 }
                ]);
                chai_1.assert.strictEqual(await page.evaluate(`window.search.findNext('c', { decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
                chai_1.assert.strictEqual(await page.evaluate(`window.search.findNext('c', { decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
                chai_1.assert.strictEqual(await page.evaluate(`window.search.findNext('c', { decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
                chai_1.assert.deepStrictEqual(await page.evaluate('window.calls'), [
                    { resultCount: 1, resultIndex: 0 },
                    { resultCount: 2, resultIndex: 0 },
                    { resultCount: 0, resultIndex: -1 },
                    { resultCount: 3, resultIndex: 0 },
                    { resultCount: 3, resultIndex: 1 },
                    { resultCount: 3, resultIndex: 2 }
                ]);
            });
            it('should fire with correct event values (incremental)', async () => {
                await page.evaluate(`
          window.calls = [];
          window.search.onDidChangeResults(e => window.calls.push(e));
        `);
                await (0, TestUtils_1.writeSync)(page, 'd abc aabc d');
                chai_1.assert.deepStrictEqual(await page.evaluate(`window.search.findNext('a', { incremental: true, decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
                chai_1.assert.deepStrictEqual(await page.evaluate('window.calls'), [
                    { resultCount: 3, resultIndex: 0 }
                ]);
                chai_1.assert.deepStrictEqual(await page.evaluate(`window.search.findNext('ab', { incremental: true, decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
                chai_1.assert.deepStrictEqual(await page.evaluate('window.calls'), [
                    { resultCount: 3, resultIndex: 0 },
                    { resultCount: 2, resultIndex: 0 }
                ]);
                chai_1.assert.deepStrictEqual(await page.evaluate(`window.search.findNext('abc', { incremental: true, decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
                chai_1.assert.deepStrictEqual(await page.evaluate('window.calls'), [
                    { resultCount: 3, resultIndex: 0 },
                    { resultCount: 2, resultIndex: 0 },
                    { resultCount: 2, resultIndex: 0 }
                ]);
                chai_1.assert.deepStrictEqual(await page.evaluate(`window.search.findNext('abc', { incremental: true, decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
                chai_1.assert.deepStrictEqual(await page.evaluate('window.calls'), [
                    { resultCount: 3, resultIndex: 0 },
                    { resultCount: 2, resultIndex: 0 },
                    { resultCount: 2, resultIndex: 0 },
                    { resultCount: 2, resultIndex: 1 }
                ]);
                chai_1.assert.deepStrictEqual(await page.evaluate(`window.search.findNext('d', { incremental: true, decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
                chai_1.assert.deepStrictEqual(await page.evaluate('window.calls'), [
                    { resultCount: 3, resultIndex: 0 },
                    { resultCount: 2, resultIndex: 0 },
                    { resultCount: 2, resultIndex: 0 },
                    { resultCount: 2, resultIndex: 1 },
                    { resultCount: 2, resultIndex: 1 }
                ]);
                chai_1.assert.deepStrictEqual(await page.evaluate(`window.search.findNext('abcd', { incremental: true, decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), false);
                chai_1.assert.deepStrictEqual(await page.evaluate('window.calls'), [
                    { resultCount: 3, resultIndex: 0 },
                    { resultCount: 2, resultIndex: 0 },
                    { resultCount: 2, resultIndex: 0 },
                    { resultCount: 2, resultIndex: 1 },
                    { resultCount: 2, resultIndex: 1 },
                    { resultCount: 0, resultIndex: -1 }
                ]);
            });
            it('should fire with more than 1k matches', async () => {
                await page.evaluate(`
          window.calls = [];
          window.search.onDidChangeResults(e => window.calls.push(e));
        `);
                const data = ('a bc'.repeat(10) + '\\n\\r').repeat(150);
                await (0, TestUtils_1.writeSync)(page, data);
                chai_1.assert.strictEqual(await page.evaluate(`window.search.findNext('a', { decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
                chai_1.assert.deepStrictEqual(await page.evaluate('window.calls'), [
                    { resultCount: 1000, resultIndex: 0 }
                ]);
                chai_1.assert.strictEqual(await page.evaluate(`window.search.findNext('a', { decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
                chai_1.assert.deepStrictEqual(await page.evaluate('window.calls'), [
                    { resultCount: 1000, resultIndex: 0 },
                    { resultCount: 1000, resultIndex: 1 }
                ]);
                chai_1.assert.strictEqual(await page.evaluate(`window.search.findNext('bc', { decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
                chai_1.assert.deepStrictEqual(await page.evaluate('window.calls'), [
                    { resultCount: 1000, resultIndex: 0 },
                    { resultCount: 1000, resultIndex: 1 },
                    { resultCount: 1000, resultIndex: 1 }
                ]);
            });
            it('should fire when writing to terminal', async () => {
                await page.evaluate(`
          window.calls = [];
          window.search.onDidChangeResults(e => window.calls.push(e));
        `);
                await (0, TestUtils_1.writeSync)(page, 'abc bc c\\n\\r'.repeat(2));
                chai_1.assert.strictEqual(await page.evaluate(`window.search.findNext('abc', { decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
                chai_1.assert.deepStrictEqual(await page.evaluate('window.calls'), [
                    { resultCount: 2, resultIndex: 0 }
                ]);
                await (0, TestUtils_1.writeSync)(page, 'abc bc c\\n\\r');
                await (0, TestUtils_1.timeout)(300);
                chai_1.assert.deepStrictEqual(await page.evaluate('window.calls'), [
                    { resultCount: 2, resultIndex: 0 },
                    { resultCount: 3, resultIndex: 0 }
                ]);
            });
        });
        describe('findPrevious', () => {
            it('should not fire unless the decorations option is set', async () => {
                await page.evaluate(`
          window.calls = [];
          window.search.onDidChangeResults(e => window.calls.push(e));
        `);
                await (0, TestUtils_1.writeSync)(page, 'abc');
                chai_1.assert.strictEqual(await page.evaluate(`window.search.findPrevious('a')`), true);
                chai_1.assert.strictEqual(await page.evaluate('window.calls.length'), 0);
                chai_1.assert.strictEqual(await page.evaluate(`window.search.findPrevious('b', { decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
                chai_1.assert.strictEqual(await page.evaluate('window.calls.length'), 1);
            });
            it('should fire with correct event values', async () => {
                await page.evaluate(`
          window.calls = [];
          window.search.onDidChangeResults(e => window.calls.push(e));
        `);
                await (0, TestUtils_1.writeSync)(page, 'abc bc c');
                chai_1.assert.strictEqual(await page.evaluate(`window.search.findPrevious('a', { decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
                chai_1.assert.deepStrictEqual(await page.evaluate('window.calls'), [
                    { resultCount: 1, resultIndex: 0 }
                ]);
                await page.evaluate(`window.term.clearSelection()`);
                chai_1.assert.strictEqual(await page.evaluate(`window.search.findPrevious('b', { decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
                chai_1.assert.deepStrictEqual(await page.evaluate('window.calls'), [
                    { resultCount: 1, resultIndex: 0 },
                    { resultCount: 2, resultIndex: 1 }
                ]);
                await (0, TestUtils_1.timeout)(2000);
                chai_1.assert.strictEqual(await page.evaluate(`debugger; window.search.findPrevious('d', { decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), false);
                chai_1.assert.deepStrictEqual(await page.evaluate('window.calls'), [
                    { resultCount: 1, resultIndex: 0 },
                    { resultCount: 2, resultIndex: 1 },
                    { resultCount: 0, resultIndex: -1 }
                ]);
                chai_1.assert.strictEqual(await page.evaluate(`window.search.findPrevious('c', { decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
                chai_1.assert.strictEqual(await page.evaluate(`window.search.findPrevious('c', { decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
                chai_1.assert.strictEqual(await page.evaluate(`window.search.findPrevious('c', { decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
                chai_1.assert.deepStrictEqual(await page.evaluate('window.calls'), [
                    { resultCount: 1, resultIndex: 0 },
                    { resultCount: 2, resultIndex: 1 },
                    { resultCount: 0, resultIndex: -1 },
                    { resultCount: 3, resultIndex: 2 },
                    { resultCount: 3, resultIndex: 1 },
                    { resultCount: 3, resultIndex: 0 }
                ]);
            });
            it('should fire with correct event values (incremental)', async () => {
                await page.evaluate(`
          window.calls = [];
          window.search.onDidChangeResults(e => window.calls.push(e));
        `);
                await (0, TestUtils_1.writeSync)(page, 'd abc aabc d');
                chai_1.assert.deepStrictEqual(await page.evaluate(`window.search.findPrevious('a', { incremental: true, decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
                chai_1.assert.deepStrictEqual(await page.evaluate('window.calls'), [
                    { resultCount: 3, resultIndex: 2 }
                ]);
                chai_1.assert.deepStrictEqual(await page.evaluate(`window.search.findPrevious('ab', { incremental: true, decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
                chai_1.assert.deepStrictEqual(await page.evaluate('window.calls'), [
                    { resultCount: 3, resultIndex: 2 },
                    { resultCount: 2, resultIndex: 1 }
                ]);
                chai_1.assert.deepStrictEqual(await page.evaluate(`window.search.findPrevious('abc', { incremental: true, decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
                chai_1.assert.deepStrictEqual(await page.evaluate('window.calls'), [
                    { resultCount: 3, resultIndex: 2 },
                    { resultCount: 2, resultIndex: 1 },
                    { resultCount: 2, resultIndex: 1 }
                ]);
                chai_1.assert.deepStrictEqual(await page.evaluate(`window.search.findPrevious('abc', { incremental: true, decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
                chai_1.assert.deepStrictEqual(await page.evaluate('window.calls'), [
                    { resultCount: 3, resultIndex: 2 },
                    { resultCount: 2, resultIndex: 1 },
                    { resultCount: 2, resultIndex: 1 },
                    { resultCount: 2, resultIndex: 0 }
                ]);
                chai_1.assert.deepStrictEqual(await page.evaluate(`window.search.findPrevious('d', { incremental: true, decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
                chai_1.assert.deepStrictEqual(await page.evaluate('window.calls'), [
                    { resultCount: 3, resultIndex: 2 },
                    { resultCount: 2, resultIndex: 1 },
                    { resultCount: 2, resultIndex: 1 },
                    { resultCount: 2, resultIndex: 0 },
                    { resultCount: 2, resultIndex: 1 }
                ]);
                chai_1.assert.deepStrictEqual(await page.evaluate(`window.search.findPrevious('abcd', { incremental: true, decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), false);
                chai_1.assert.deepStrictEqual(await page.evaluate('window.calls'), [
                    { resultCount: 3, resultIndex: 2 },
                    { resultCount: 2, resultIndex: 1 },
                    { resultCount: 2, resultIndex: 1 },
                    { resultCount: 2, resultIndex: 0 },
                    { resultCount: 2, resultIndex: 1 },
                    { resultCount: 0, resultIndex: -1 }
                ]);
            });
            it('should fire with more than 1k matches', async () => {
                await page.evaluate(`
          window.calls = [];
          window.search.onDidChangeResults(e => window.calls.push(e));
        `);
                const data = ('a bc'.repeat(10) + '\\n\\r').repeat(150);
                await (0, TestUtils_1.writeSync)(page, data);
                chai_1.assert.strictEqual(await page.evaluate(`window.search.findPrevious('a', { decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
                chai_1.assert.deepStrictEqual(await page.evaluate('window.calls'), [
                    { resultCount: 1000, resultIndex: -1 }
                ]);
                chai_1.assert.strictEqual(await page.evaluate(`window.search.findPrevious('a', { decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
                chai_1.assert.deepStrictEqual(await page.evaluate('window.calls'), [
                    { resultCount: 1000, resultIndex: -1 },
                    { resultCount: 1000, resultIndex: -1 }
                ]);
                chai_1.assert.strictEqual(await page.evaluate(`window.search.findPrevious('bc', { decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
                chai_1.assert.deepStrictEqual(await page.evaluate('window.calls'), [
                    { resultCount: 1000, resultIndex: -1 },
                    { resultCount: 1000, resultIndex: -1 },
                    { resultCount: 1000, resultIndex: -1 }
                ]);
            });
            it('should fire when writing to terminal', async () => {
                await page.evaluate(`
          window.calls = [];
          window.search.onDidChangeResults(e => window.calls.push(e));
        `);
                await (0, TestUtils_1.writeSync)(page, 'abc bc c\\n\\r'.repeat(2));
                chai_1.assert.strictEqual(await page.evaluate(`window.search.findPrevious('abc', { decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
                chai_1.assert.deepStrictEqual(await page.evaluate('window.calls'), [
                    { resultCount: 2, resultIndex: 1 }
                ]);
                await (0, TestUtils_1.writeSync)(page, 'abc bc c\\n\\r');
                await (0, TestUtils_1.timeout)(300);
                chai_1.assert.deepStrictEqual(await page.evaluate('window.calls'), [
                    { resultCount: 2, resultIndex: 1 },
                    { resultCount: 3, resultIndex: 1 }
                ]);
            });
        });
    });
    describe('Regression tests', () => {
        describe('#2444 wrapped line content not being found', () => {
            let fixture;
            before(async () => {
                const rawFixture = await new Promise(r => (0, fs_1.readFile)((0, path_1.resolve)(__dirname, '../fixtures/issue-2444'), (err, data) => r(data)));
                if (process.platform === 'win32') {
                    fixture = rawFixture.toString()
                        .replace(/\n/g, '\\n')
                        .replace(/\r/g, '\\r');
                }
                else {
                    fixture = rawFixture.toString()
                        .replace(/\n/g, '\\n\\r');
                }
                fixture = fixture
                    .replace(/'/g, `\\'`);
            });
            it('should find all occurrences using findNext', async () => {
                await (0, TestUtils_1.writeSync)(page, fixture);
                chai_1.assert.deepEqual(await page.evaluate(`window.search.findNext('opencv')`), true);
                let selectionPosition = await page.evaluate(`window.term.getSelectionPosition()`);
                chai_1.assert.deepEqual(selectionPosition, { start: { x: 24, y: 53 }, end: { x: 30, y: 53 } });
                chai_1.assert.deepEqual(await page.evaluate(`window.search.findNext('opencv')`), true);
                selectionPosition = await page.evaluate(`window.term.getSelectionPosition()`);
                chai_1.assert.deepEqual(selectionPosition, { start: { x: 24, y: 76 }, end: { x: 30, y: 76 } });
                chai_1.assert.deepEqual(await page.evaluate(`window.search.findNext('opencv')`), true);
                selectionPosition = await page.evaluate(`window.term.getSelectionPosition()`);
                chai_1.assert.deepEqual(selectionPosition, { start: { x: 24, y: 96 }, end: { x: 30, y: 96 } });
                chai_1.assert.deepEqual(await page.evaluate(`window.search.findNext('opencv')`), true);
                selectionPosition = await page.evaluate(`window.term.getSelectionPosition()`);
                chai_1.assert.deepEqual(selectionPosition, { start: { x: 1, y: 114 }, end: { x: 7, y: 114 } });
                chai_1.assert.deepEqual(await page.evaluate(`window.search.findNext('opencv')`), true);
                selectionPosition = await page.evaluate(`window.term.getSelectionPosition()`);
                chai_1.assert.deepEqual(selectionPosition, { start: { x: 11, y: 115 }, end: { x: 17, y: 115 } });
                chai_1.assert.deepEqual(await page.evaluate(`window.search.findNext('opencv')`), true);
                selectionPosition = await page.evaluate(`window.term.getSelectionPosition()`);
                chai_1.assert.deepEqual(selectionPosition, { start: { x: 1, y: 126 }, end: { x: 7, y: 126 } });
                chai_1.assert.deepEqual(await page.evaluate(`window.search.findNext('opencv')`), true);
                selectionPosition = await page.evaluate(`window.term.getSelectionPosition()`);
                chai_1.assert.deepEqual(selectionPosition, { start: { x: 11, y: 127 }, end: { x: 17, y: 127 } });
                chai_1.assert.deepEqual(await page.evaluate(`window.search.findNext('opencv')`), true);
                selectionPosition = await page.evaluate(`window.term.getSelectionPosition()`);
                chai_1.assert.deepEqual(selectionPosition, { start: { x: 1, y: 135 }, end: { x: 7, y: 135 } });
                chai_1.assert.deepEqual(await page.evaluate(`window.search.findNext('opencv')`), true);
                selectionPosition = await page.evaluate(`window.term.getSelectionPosition()`);
                chai_1.assert.deepEqual(selectionPosition, { start: { x: 11, y: 136 }, end: { x: 17, y: 136 } });
                chai_1.assert.deepEqual(await page.evaluate(`window.search.findNext('opencv')`), true);
                selectionPosition = await page.evaluate(`window.term.getSelectionPosition()`);
                chai_1.assert.deepEqual(selectionPosition, { start: { x: 24, y: 53 }, end: { x: 30, y: 53 } });
            });
            it('should y all occurrences using findPrevious', async () => {
                await (0, TestUtils_1.writeSync)(page, fixture);
                chai_1.assert.deepEqual(await page.evaluate(`window.search.findPrevious('opencv')`), true);
                let selectionPosition = await page.evaluate(`window.term.getSelectionPosition()`);
                chai_1.assert.deepEqual(selectionPosition, { start: { x: 11, y: 136 }, end: { x: 17, y: 136 } });
                chai_1.assert.deepEqual(await page.evaluate(`window.search.findPrevious('opencv')`), true);
                selectionPosition = await page.evaluate(`window.term.getSelectionPosition()`);
                chai_1.assert.deepEqual(selectionPosition, { start: { x: 1, y: 135 }, end: { x: 7, y: 135 } });
                chai_1.assert.deepEqual(await page.evaluate(`window.search.findPrevious('opencv')`), true);
                selectionPosition = await page.evaluate(`window.term.getSelectionPosition()`);
                chai_1.assert.deepEqual(selectionPosition, { start: { x: 11, y: 127 }, end: { x: 17, y: 127 } });
                chai_1.assert.deepEqual(await page.evaluate(`window.search.findPrevious('opencv')`), true);
                selectionPosition = await page.evaluate(`window.term.getSelectionPosition()`);
                chai_1.assert.deepEqual(selectionPosition, { start: { x: 1, y: 126 }, end: { x: 7, y: 126 } });
                chai_1.assert.deepEqual(await page.evaluate(`window.search.findPrevious('opencv')`), true);
                selectionPosition = await page.evaluate(`window.term.getSelectionPosition()`);
                chai_1.assert.deepEqual(selectionPosition, { start: { x: 11, y: 115 }, end: { x: 17, y: 115 } });
                chai_1.assert.deepEqual(await page.evaluate(`window.search.findPrevious('opencv')`), true);
                selectionPosition = await page.evaluate(`window.term.getSelectionPosition()`);
                chai_1.assert.deepEqual(selectionPosition, { start: { x: 1, y: 114 }, end: { x: 7, y: 114 } });
                chai_1.assert.deepEqual(await page.evaluate(`window.search.findPrevious('opencv')`), true);
                selectionPosition = await page.evaluate(`window.term.getSelectionPosition()`);
                chai_1.assert.deepEqual(selectionPosition, { start: { x: 24, y: 96 }, end: { x: 30, y: 96 } });
                chai_1.assert.deepEqual(await page.evaluate(`window.search.findPrevious('opencv')`), true);
                selectionPosition = await page.evaluate(`window.term.getSelectionPosition()`);
                chai_1.assert.deepEqual(selectionPosition, { start: { x: 24, y: 76 }, end: { x: 30, y: 76 } });
                chai_1.assert.deepEqual(await page.evaluate(`window.search.findPrevious('opencv')`), true);
                selectionPosition = await page.evaluate(`window.term.getSelectionPosition()`);
                chai_1.assert.deepEqual(selectionPosition, { start: { x: 24, y: 53 }, end: { x: 30, y: 53 } });
                chai_1.assert.deepEqual(await page.evaluate(`window.search.findPrevious('opencv')`), true);
                selectionPosition = await page.evaluate(`window.term.getSelectionPosition()`);
                chai_1.assert.deepEqual(selectionPosition, { start: { x: 11, y: 136 }, end: { x: 17, y: 136 } });
            });
        });
    });
    describe('#3834 lines with null characters before search terms', () => {
        it('should find all matches on a line containing null characters', async () => {
            await page.evaluate(`
        window.calls = [];
        window.search.onDidChangeResults(e => window.calls.push(e));
      `);
            await (0, TestUtils_1.writeSync)(page, '\\x1b[CHi Hi');
            chai_1.assert.strictEqual(await page.evaluate(`window.search.findPrevious('h', { decorations: { activeMatchColorOverviewRuler: '#ff0000' } })`), true);
            chai_1.assert.deepStrictEqual(await page.evaluate('window.calls'), [
                { resultCount: 2, resultIndex: 1 }
            ]);
        });
    });
});
function makeData(length) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
}
//# sourceMappingURL=SearchAddon.api.js.map