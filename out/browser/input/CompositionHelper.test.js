"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const CompositionHelper_1 = require("browser/input/CompositionHelper");
const TestUtils_test_1 = require("browser/TestUtils.test");
const TestUtils_test_2 = require("common/TestUtils.test");
describe('CompositionHelper', () => {
    let compositionHelper;
    let compositionView;
    let textarea;
    let handledText;
    beforeEach(() => {
        compositionView = {
            classList: {
                add: () => { },
                remove: () => { }
            },
            getBoundingClientRect: () => {
                return { width: 0 };
            },
            style: {
                left: 0,
                top: 0
            },
            textContent: ''
        };
        textarea = {
            value: '',
            style: {
                left: 0,
                top: 0
            }
        };
        const coreService = new TestUtils_test_2.MockCoreService();
        coreService.triggerDataEvent = (text) => {
            handledText += text;
        };
        handledText = '';
        const bufferService = new TestUtils_test_2.MockBufferService(10, 5);
        compositionHelper = new CompositionHelper_1.CompositionHelper(textarea, compositionView, bufferService, new TestUtils_test_2.MockOptionsService(), coreService, new TestUtils_test_1.MockRenderService());
    });
    describe('Input', () => {
        it('Should insert simple characters', (done) => {
            compositionHelper.compositionstart();
            compositionHelper.compositionupdate({ data: 'ㅇ' });
            textarea.value = 'ㅇ';
            setTimeout(() => {
                compositionHelper.compositionend();
                setTimeout(() => {
                    chai_1.assert.equal(handledText, 'ㅇ');
                    compositionHelper.compositionstart();
                    compositionHelper.compositionupdate({ data: 'ㅇ' });
                    textarea.value = 'ㅇㅇ';
                    setTimeout(() => {
                        compositionHelper.compositionend();
                        setTimeout(() => {
                            chai_1.assert.equal(handledText, 'ㅇㅇ');
                            done();
                        }, 0);
                    }, 0);
                }, 0);
            }, 0);
        });
        it('Should insert complex characters', (done) => {
            compositionHelper.compositionstart();
            compositionHelper.compositionupdate({ data: 'ㅇ' });
            textarea.value = 'ㅇ';
            setTimeout(() => {
                compositionHelper.compositionupdate({ data: '아' });
                textarea.value = '아';
                setTimeout(() => {
                    compositionHelper.compositionupdate({ data: '앙' });
                    textarea.value = '앙';
                    setTimeout(() => {
                        compositionHelper.compositionend();
                        setTimeout(() => {
                            chai_1.assert.equal(handledText, '앙');
                            compositionHelper.compositionstart();
                            compositionHelper.compositionupdate({ data: 'ㅇ' });
                            textarea.value = '앙ㅇ';
                            setTimeout(() => {
                                compositionHelper.compositionupdate({ data: '아' });
                                textarea.value = '앙아';
                                setTimeout(() => {
                                    compositionHelper.compositionupdate({ data: '앙' });
                                    textarea.value = '앙앙';
                                    setTimeout(() => {
                                        compositionHelper.compositionend();
                                        setTimeout(() => {
                                            chai_1.assert.equal(handledText, '앙앙');
                                            done();
                                        }, 0);
                                    }, 0);
                                }, 0);
                            }, 0);
                        }, 0);
                    }, 0);
                }, 0);
            }, 0);
        });
        it('Should insert complex characters that change with following character', (done) => {
            compositionHelper.compositionstart();
            compositionHelper.compositionupdate({ data: 'ㅇ' });
            textarea.value = 'ㅇ';
            setTimeout(() => {
                compositionHelper.compositionupdate({ data: '아' });
                textarea.value = '아';
                setTimeout(() => {
                    compositionHelper.compositionupdate({ data: '앙' });
                    textarea.value = '앙';
                    setTimeout(() => {
                        compositionHelper.compositionend();
                        compositionHelper.compositionstart();
                        compositionHelper.compositionupdate({ data: '아' });
                        textarea.value = '아아';
                        setTimeout(() => {
                            compositionHelper.compositionend();
                            setTimeout(() => {
                                chai_1.assert.equal(handledText, '아아');
                                done();
                            }, 0);
                        }, 0);
                    }, 0);
                }, 0);
            }, 0);
        });
        it('Should insert multi-characters compositions', (done) => {
            compositionHelper.compositionstart();
            compositionHelper.compositionupdate({ data: 'd' });
            textarea.value = 'd';
            setTimeout(() => {
                compositionHelper.compositionupdate({ data: 'だ' });
                textarea.value = 'だ';
                setTimeout(() => {
                    compositionHelper.compositionupdate({ data: 'だあ' });
                    textarea.value = 'だあ';
                    setTimeout(() => {
                        compositionHelper.compositionend();
                        setTimeout(() => {
                            chai_1.assert.equal(handledText, 'だあ');
                            done();
                        }, 0);
                    }, 0);
                }, 0);
            }, 0);
        });
        it('Should insert multi-character compositions that are converted to other characters with the same length', (done) => {
            compositionHelper.compositionstart();
            compositionHelper.compositionupdate({ data: 'd' });
            textarea.value = 'd';
            setTimeout(() => {
                compositionHelper.compositionupdate({ data: 'だ' });
                textarea.value = 'だ';
                setTimeout(() => {
                    compositionHelper.compositionupdate({ data: 'だー' });
                    textarea.value = 'だー';
                    setTimeout(() => {
                        compositionHelper.compositionupdate({ data: 'ダー' });
                        textarea.value = 'ダー';
                        setTimeout(() => {
                            compositionHelper.compositionend();
                            setTimeout(() => {
                                chai_1.assert.equal(handledText, 'ダー');
                                done();
                            }, 0);
                        }, 0);
                    }, 0);
                }, 0);
            }, 0);
        });
        it('Should insert multi-character compositions that are converted to other characters with different lengths', (done) => {
            compositionHelper.compositionstart();
            compositionHelper.compositionupdate({ data: 'い' });
            textarea.value = 'い';
            setTimeout(() => {
                compositionHelper.compositionupdate({ data: 'いm' });
                textarea.value = 'いm';
                setTimeout(() => {
                    compositionHelper.compositionupdate({ data: 'いま' });
                    textarea.value = 'いま';
                    setTimeout(() => {
                        compositionHelper.compositionupdate({ data: '今' });
                        textarea.value = '今';
                        setTimeout(() => {
                            compositionHelper.compositionend();
                            setTimeout(() => {
                                chai_1.assert.equal(handledText, '今');
                                done();
                            }, 0);
                        }, 0);
                    }, 0);
                }, 0);
            }, 0);
        });
        it('Should insert non-composition characters input immediately after composition characters', (done) => {
            compositionHelper.compositionstart();
            compositionHelper.compositionupdate({ data: 'ㅇ' });
            textarea.value = 'ㅇ';
            setTimeout(() => {
                compositionHelper.compositionend();
                textarea.value = 'ㅇ1';
                setTimeout(() => {
                    chai_1.assert.equal(handledText, 'ㅇ1');
                    done();
                }, 0);
            }, 0);
        });
    });
});
//# sourceMappingURL=CompositionHelper.test.js.map