"use strict";
/**
 * Copyright (c) 2018 The xterm.js authors. All rights reserved.
 * @license MIT
 */
Object.defineProperty(exports, "__esModule", { value: true });
const path = require("path");
const sinon = require("sinon");
const chai_1 = require("chai");
const fontFinder = require("font-finder");
const fontLigatures = require("font-ligatures");
const ligatureSupport = require(".");
describe('LigaturesAddon', () => {
    let onRefresh;
    let term;
    // -> forms a ligature in Fira Code and Iosevka, but www only forms a ligature
    // in Fira Code
    const input = 'a -> b www c';
    before(() => {
        sinon.stub(fontFinder, 'list').returns(Promise.resolve({
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'Fira Code': [{
                    path: path.join(__dirname, '../fonts/firaCode.otf'),
                    style: fontFinder.Style.Regular,
                    type: fontFinder.Type.Monospace,
                    weight: 400
                }],
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'Iosevka': [{
                    path: path.join(__dirname, '../fonts/iosevka.ttf'),
                    style: fontFinder.Style.Regular,
                    type: fontFinder.Type.Monospace,
                    weight: 400
                }],
            // eslint-disable-next-line @typescript-eslint/naming-convention
            'Nonexistant Font': [{
                    path: path.join(__dirname, '../fonts/nonexistant.ttf'),
                    style: fontFinder.Style.Regular,
                    type: fontFinder.Type.Monospace,
                    weight: 400
                }]
        }));
    });
    beforeEach(() => {
        onRefresh = sinon.stub();
        term = new MockTerminal(onRefresh);
        ligatureSupport.enableLigatures(term);
    });
    it('registers itself correctly', () => {
        const term = new MockTerminal(sinon.spy());
        chai_1.assert.isUndefined(term.joiner);
        ligatureSupport.enableLigatures(term);
        chai_1.assert.isFunction(term.joiner);
    });
    it('registers itself correctly when called directly', () => {
        const term = new MockTerminal(sinon.spy());
        chai_1.assert.isUndefined(term.joiner);
        ligatureSupport.enableLigatures(term);
        chai_1.assert.isFunction(term.joiner);
    });
    it('returns an empty set of ranges on the first call while the font is loading', () => {
        chai_1.assert.deepEqual(term.joiner(input), []);
    });
    it('fails if it finds but cannot load the font', async () => {
        term.options.fontFamily = 'Nonexistant Font, monospace';
        chai_1.assert.deepEqual(term.joiner(input), []);
        await delay(500);
        chai_1.assert.isTrue(onRefresh.notCalled);
    });
    it('returns nothing if the font is not present on the system', async () => {
        term.options.fontFamily = 'notinstalled';
        chai_1.assert.deepEqual(term.joiner(input), []);
        await delay(500);
        chai_1.assert.isTrue(onRefresh.notCalled);
        chai_1.assert.deepEqual(term.joiner(input), []);
    });
    it('returns nothing if no specific font is specified', async () => {
        term.options.fontFamily = 'monospace';
        chai_1.assert.deepEqual(term.joiner(input), []);
        await delay(500);
        chai_1.assert.isTrue(onRefresh.notCalled);
        chai_1.assert.deepEqual(term.joiner(input), []);
    });
    it('returns nothing if no fonts are provided', async () => {
        term.options.fontFamily = '';
        chai_1.assert.deepEqual(term.joiner(input), []);
        await delay(500);
        chai_1.assert.isTrue(onRefresh.notCalled);
        chai_1.assert.deepEqual(term.joiner(input), []);
    });
    it('fails when given malformed inputs', async () => {
        term.options.fontFamily = {};
        chai_1.assert.deepEqual(term.joiner(input), []);
        await delay(500);
        chai_1.assert.isTrue(onRefresh.notCalled);
    });
    it('ensures no empty errors are thrown', async () => {
        sinon.stub(fontLigatures, 'loadFile').callsFake(async () => { throw undefined; });
        term.options.fontFamily = 'Iosevka';
        chai_1.assert.deepEqual(term.joiner(input), []);
        await delay(500);
        chai_1.assert.isTrue(onRefresh.notCalled);
        fontLigatures.loadFile.restore();
    });
});
class MockTerminal {
    constructor(onRefresh) {
        this._options = {
            fontFamily: 'Fira Code, monospace',
            rows: 50
        };
        this.refresh = onRefresh;
    }
    registerCharacterJoiner(handler) {
        this.joiner = handler;
        return 1;
    }
    deregisterCharacterJoiner(id) {
        this.joiner = undefined;
    }
    get options() { return this._options; }
    set options(options) {
        for (const key in this._options) {
            this._options[key] = options[key];
        }
    }
}
function delay(delayMs) {
    return new Promise(resolve => setTimeout(resolve, delayMs));
}
//# sourceMappingURL=index.test.js.map