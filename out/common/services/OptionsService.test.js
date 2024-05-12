"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const OptionsService_1 = require("common/services/OptionsService");
describe('OptionsService', () => {
    describe('constructor', () => {
        const originalError = console.error;
        beforeEach(() => {
            console.error = () => { };
        });
        afterEach(() => {
            console.error = originalError;
        });
        it('uses default value if invalid constructor option values passed for cols/rows', () => {
            const optionsService = new OptionsService_1.OptionsService({ cols: undefined, rows: undefined });
            chai_1.assert.equal(optionsService.options.rows, OptionsService_1.DEFAULT_OPTIONS.rows);
            chai_1.assert.equal(optionsService.options.cols, OptionsService_1.DEFAULT_OPTIONS.cols);
        });
        it('uses values from constructor option values if correctly passed', () => {
            const optionsService = new OptionsService_1.OptionsService({ cols: 80, rows: 25 });
            chai_1.assert.equal(optionsService.options.rows, 25);
            chai_1.assert.equal(optionsService.options.cols, 80);
        });
        it('uses default value if invalid constructor option value passed', () => {
            chai_1.assert.equal(new OptionsService_1.OptionsService({ tabStopWidth: 0 }).options.tabStopWidth, OptionsService_1.DEFAULT_OPTIONS.tabStopWidth);
        });
        it('object.keys return the correct number of options', () => {
            const optionsService = new OptionsService_1.OptionsService({ cols: 80, rows: 25 });
            chai_1.assert.notEqual(Object.keys(optionsService.options).length, 0);
        });
    });
    describe('setOption', () => {
        let service;
        beforeEach(() => {
            service = new OptionsService_1.OptionsService({});
        });
        it('applies valid fontWeight option values', () => {
            service.options.fontWeight = 'bold';
            chai_1.assert.equal(service.options.fontWeight, 'bold', '"bold" keyword value should be applied');
            service.options.fontWeight = 'normal';
            chai_1.assert.equal(service.options.fontWeight, 'normal', '"normal" keyword value should be applied');
            service.options.fontWeight = '600';
            chai_1.assert.equal(service.options.fontWeight, '600', 'String numeric values should be applied');
            service.options.fontWeight = 350;
            chai_1.assert.equal(service.options.fontWeight, 350, 'Values between 1 and 1000 should be applied as is');
            service.options.fontWeight = 1;
            chai_1.assert.equal(service.options.fontWeight, 1, 'Range should include minimum value: 1');
            service.options.fontWeight = 1000;
            chai_1.assert.equal(service.options.fontWeight, 1000, 'Range should include maximum value: 1000');
        });
        it('normalizes invalid fontWeight option values', () => {
            service.options.fontWeight = 350;
            chai_1.assert.doesNotThrow(() => service.options.fontWeight = 10000, 'fontWeight should be normalized instead of throwing');
            chai_1.assert.equal(service.options.fontWeight, OptionsService_1.DEFAULT_OPTIONS.fontWeight, 'Values greater than 1000 should be reset to default');
            service.options.fontWeight = 350;
            service.options.fontWeight = -10;
            chai_1.assert.equal(service.options.fontWeight, OptionsService_1.DEFAULT_OPTIONS.fontWeight, 'Values less than 1 should be reset to default');
            service.options.fontWeight = 350;
            service.options.fontWeight = 'bold700';
            chai_1.assert.equal(service.options.fontWeight, OptionsService_1.DEFAULT_OPTIONS.fontWeight, 'Wrong string literals should be reset to default');
        });
    });
    describe('onOptionChange', () => {
        let service;
        beforeEach(() => {
            service = new OptionsService_1.OptionsService({});
        });
        it('should fire on any option change', async () => {
            let disposable;
            await new Promise(r => {
                disposable = service.onOptionChange(e => {
                    chai_1.assert.strictEqual(e, 'cursorWidth');
                    r();
                });
                service.options.cursorWidth = 10;
            });
            disposable.dispose();
            await new Promise(r => {
                service.onOptionChange(e => {
                    chai_1.assert.strictEqual(e, 'scrollback');
                    r();
                });
                service.options.scrollback = 20;
            });
        });
    });
    describe('onSpecificOptionChange', () => {
        let service;
        beforeEach(() => {
            service = new OptionsService_1.OptionsService({});
        });
        it('should fire only on a specific option change', async () => {
            await new Promise(r => {
                service.onSpecificOptionChange('scrollback', e => {
                    chai_1.assert.strictEqual(e, 20);
                    r();
                });
                service.options.cursorWidth = 10;
                service.options.scrollback = 20;
            });
        });
    });
    describe('onSpecificOptionChange', () => {
        let service;
        beforeEach(() => {
            service = new OptionsService_1.OptionsService({});
        });
        it('should fire only on a specific option change', async () => {
            await new Promise(r => {
                service.onSpecificOptionChange('scrollback', e => {
                    chai_1.assert.strictEqual(e, 20);
                    r();
                });
                service.options.cursorWidth = 10;
                service.options.scrollback = 20;
            });
        });
    });
    describe('onMultipleOptionChange', () => {
        let service;
        beforeEach(() => {
            service = new OptionsService_1.OptionsService({});
        });
        it('should fire only for specific options', async () => {
            await new Promise(r => {
                let called = false;
                service.onMultipleOptionChange(['scrollback'], () => {
                    called = true;
                });
                service.options.cursorWidth = 10;
                chai_1.assert.notOk(called);
                service.options.scrollback = 20;
                chai_1.assert.ok(called);
                r();
            });
        });
    });
});
//# sourceMappingURL=OptionsService.test.js.map