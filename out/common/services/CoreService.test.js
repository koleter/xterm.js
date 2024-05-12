"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const CoreService_1 = require("common/services/CoreService");
const TestUtils_test_1 = require("common/TestUtils.test");
const chai_1 = require("chai");
describe('CoreService', () => {
    let coreService;
    beforeEach(() => {
        coreService = new CoreService_1.CoreService(new TestUtils_test_1.MockBufferService(80, 30), new TestUtils_test_1.MockLogService(), new TestUtils_test_1.MockOptionsService());
    });
    describe('reset', () => {
        it('should not affect isCursorInitialized', () => {
            coreService.isCursorInitialized = true;
            coreService.reset();
            chai_1.assert.equal(coreService.isCursorInitialized, true);
            coreService.isCursorInitialized = false;
            coreService.reset();
            chai_1.assert.equal(coreService.isCursorInitialized, false);
        });
    });
});
//# sourceMappingURL=CoreService.test.js.map