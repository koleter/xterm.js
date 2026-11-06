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
let ctx;
test_1.test.beforeAll((_a) => __awaiter(void 0, [_a], void 0, function* ({ browser }) {
    ctx = yield (0, TestUtils_1.createTestContext)(browser);
    yield (0, TestUtils_1.openTerminal)(ctx);
}));
test_1.test.afterAll(() => __awaiter(void 0, void 0, void 0, function* () { return yield ctx.page.close(); }));
test_1.test.beforeEach(() => __awaiter(void 0, void 0, void 0, function* () { return yield ctx.proxy.reset(); }));
test_1.test.describe('CharWidth Integration Tests', () => {
    test_1.test.describe('getStringCellWidth', () => {
        (0, test_1.test)('ASCII chars', () => __awaiter(void 0, void 0, void 0, function* () {
            yield ctx.proxy.write('This is just ASCII text.#');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => sumWidths(0, 1, '#'), 25);
        }));
        (0, test_1.test)('combining chars', () => __awaiter(void 0, void 0, void 0, function* () {
            yield ctx.proxy.write('e\u0301e\u0301e\u0301e\u0301e\u0301e\u0301e\u0301e\u0301e\u0301#');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => sumWidths(0, 1, '#'), 10);
        }));
        (0, test_1.test)('surrogate chars', () => __awaiter(void 0, void 0, void 0, function* () {
            yield ctx.proxy.write('𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞𝄞#');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => sumWidths(0, 1, '#'), 28);
        }));
        (0, test_1.test)('surrogate combining chars', () => __awaiter(void 0, void 0, void 0, function* () {
            yield ctx.proxy.write('𓂀\u0301𓂀\u0301𓂀\u0301𓂀\u0301𓂀\u0301𓂀\u0301𓂀\u0301𓂀\u0301𓂀\u0301𓂀\u0301𓂀\u0301#');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => sumWidths(0, 1, '#'), 12);
        }));
        (0, test_1.test)('fullwidth chars', () => __awaiter(void 0, void 0, void 0, function* () {
            yield ctx.proxy.write('１２３４５６７８９０#');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => sumWidths(0, 1, '#'), 21);
        }));
        (0, test_1.test)('fullwidth chars offset 1', () => __awaiter(void 0, void 0, void 0, function* () {
            yield ctx.proxy.write('a１２３４５６７８９０#');
            yield (0, TestUtils_1.pollFor)(ctx.page, () => sumWidths(0, 1, '#'), 22);
        }));
    });
});
function sumWidths(start, end, sentinel) {
    return __awaiter(this, void 0, void 0, function* () {
        yield ctx.page.evaluate(`
    (function() {
      window.result = 0;
      const buffer = window.term.buffer.active;
      for (let i = ${start}; i < ${end}; i++) {
        const line = buffer.getLine(i);
        let j = 0;
        while (true) {
          const cell = line.getCell(j++);
          if (!cell) {
            break;
          }
          window.result += cell.getWidth();
          if (cell.getChars() === '${sentinel}') {
            return;
          }
        }
      }
    })();
  `);
        return yield ctx.page.evaluate(`window.result`);
    });
}
//# sourceMappingURL=CharWidth.test.js.map