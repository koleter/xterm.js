"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const SharedRendererTests_1 = require("../../../out-test/playwright/SharedRendererTests");
const TestUtils_1 = require("../../../out-test/playwright/TestUtils");
const os_1 = require("os");
let ctx;
const ctxWrapper = { value: undefined };
test_1.default.beforeAll(async ({ browser }) => {
    ctx = await (0, TestUtils_1.createTestContext)(browser);
    await (0, TestUtils_1.openTerminal)(ctx);
    ctxWrapper.value = ctx;
    await ctx.page.evaluate(`
    window.addon = new window.WebglAddon(true);
    window.term.loadAddon(window.addon);
  `);
});
test_1.default.afterAll(async () => await ctx.page.close());
test_1.default.describe('WebGL Renderer Integration Tests', async () => {
    if ((0, os_1.platform)() === 'linux') {
        test_1.default.skip(({ browserName }) => browserName === 'firefox');
    }
    (0, SharedRendererTests_1.injectSharedRendererTests)(ctxWrapper);
    (0, SharedRendererTests_1.injectSharedRendererTestsStandalone)(ctxWrapper, async () => {
        await ctx.page.evaluate(`
      window.addon = new window.WebglAddon(true);
      window.term.loadAddon(window.addon);
    `);
    });
});
//# sourceMappingURL=WebglRenderer.test.js.map