"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const Linkifier_1 = require("./Linkifier");
const TestUtils_test_1 = require("common/TestUtils.test");
const LinkProviderService_1 = require("browser/services/LinkProviderService");
const jsdom = require("jsdom");
class TestLinkifier2 extends Linkifier_1.Linkifier {
    set currentLink(link) {
        this._currentLink = link;
    }
    linkHover(element, link, event) {
        this._linkHover(element, link, event);
    }
    linkLeave(element, link, event) {
        this._linkLeave(element, link, event);
    }
}
describe('Linkifier2', () => {
    let bufferService;
    let linkifier;
    const link = {
        text: 'foo',
        range: {
            start: {
                x: 5,
                y: 1
            },
            end: {
                x: 7,
                y: 1
            }
        },
        activate: () => { }
    };
    beforeEach(() => {
        const dom = new jsdom.JSDOM();
        bufferService = new TestUtils_test_1.MockBufferService(100, 10);
        linkifier = new TestLinkifier2(dom.window.document.createElement('div'), null, null, bufferService, new LinkProviderService_1.LinkProviderService());
        linkifier.currentLink = {
            link,
            state: {
                decorations: {
                    underline: true,
                    pointerCursor: true
                },
                isHovered: true
            }
        };
    });
    it('onShowLinkUnderline event range is correct', done => {
        linkifier.onShowLinkUnderline(e => {
            chai_1.assert.equal(link.range.start.x - 1, e.x1);
            chai_1.assert.equal(link.range.start.y - 1, e.y1);
            chai_1.assert.equal(link.range.end.x, e.x2);
            chai_1.assert.equal(link.range.end.y - 1, e.y2);
            done();
        });
        linkifier.linkHover({ classList: { add: () => { } } }, link, {});
    });
    it('onHideLinkUnderline event range is correct', done => {
        linkifier.onHideLinkUnderline(e => {
            chai_1.assert.equal(link.range.start.x - 1, e.x1);
            chai_1.assert.equal(link.range.start.y - 1, e.y1);
            chai_1.assert.equal(link.range.end.x, e.x2);
            chai_1.assert.equal(link.range.end.y - 1, e.y2);
            done();
        });
        linkifier.linkLeave({ classList: { add: () => { } } }, link, {});
    });
});
//# sourceMappingURL=Linkifier.test.js.map