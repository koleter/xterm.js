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
const test_1 = require("@playwright/test");
const TestUtils_1 = require("./TestUtils");
const SharedRendererTests_1 = require("./SharedRendererTests");
let ctx;
const ctxWrapper = {
    value: undefined,
    skipDomExceptions: true
};
test_1.test.beforeAll(({ browser }) => __awaiter(void 0, void 0, void 0, function* () {
    ctx = yield (0, TestUtils_1.createTestContext)(browser);
    ctxWrapper.value = ctx;
    yield (0, TestUtils_1.openTerminal)(ctx);
}));
test_1.test.afterAll(() => __awaiter(void 0, void 0, void 0, function* () { return yield ctx.page.close(); }));
test_1.test.describe('DOM Renderer Integration Tests', () => {
    (0, SharedRendererTests_1.injectSharedRendererTests)(ctxWrapper);
    (0, SharedRendererTests_1.injectSharedRendererTestsStandalone)(ctxWrapper, () => { });
});
//# sourceMappingURL=Renderer.test.js.map