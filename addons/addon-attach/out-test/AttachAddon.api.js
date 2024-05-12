"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const WebSocket = require("ws");
const TestUtils_1 = require("../../../out-test/api/TestUtils");
const APP = 'http://127.0.0.1:3001/test';
let browser;
let page;
const width = 800;
const height = 600;
describe('AttachAddon', () => {
    before(async function () {
        browser = await (0, TestUtils_1.launchBrowser)();
        page = await (await browser.newContext()).newPage();
        await page.setViewportSize({ width, height });
    });
    after(async () => {
        await browser.close();
    });
    beforeEach(async () => await page.goto(APP));
    it('string', async function () {
        await (0, TestUtils_1.openTerminal)(page);
        const port = 8080;
        const server = new WebSocket.Server({ port });
        server.on('connection', socket => socket.send('foo'));
        await page.evaluate(`window.term.loadAddon(new window.AttachAddon(new WebSocket('ws://localhost:${port}')))`);
        await (0, TestUtils_1.pollFor)(page, `window.term.buffer.active.getLine(0).translateToString(true)`, 'foo');
        server.close();
    });
    it('utf8', async function () {
        await (0, TestUtils_1.openTerminal)(page);
        const port = 8080;
        const server = new WebSocket.Server({ port });
        const data = new Uint8Array([102, 111, 111]);
        server.on('connection', socket => socket.send(data));
        await page.evaluate(`window.term.loadAddon(new window.AttachAddon(new WebSocket('ws://localhost:${port}')))`);
        await (0, TestUtils_1.pollFor)(page, `window.term.buffer.active.getLine(0).translateToString(true)`, 'foo');
        server.close();
    });
});
//# sourceMappingURL=AttachAddon.api.js.map