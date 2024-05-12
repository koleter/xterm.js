"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const jsdom = require("jsdom");
const chai_1 = require("chai");
const Mouse_1 = require("browser/input/Mouse");
const CHAR_WIDTH = 10;
const CHAR_HEIGHT = 20;
describe('Mouse getCoords', () => {
    let windowOverride;
    let document;
    beforeEach(() => {
        windowOverride = {
            getComputedStyle() {
                return {
                    getPropertyValue: () => '0px'
                };
            }
        };
        document = new jsdom.JSDOM('').window.document;
    });
    it('should return the cell that was clicked', () => {
        let coords;
        coords = (0, Mouse_1.getCoords)(windowOverride, { clientX: CHAR_WIDTH / 2, clientY: CHAR_HEIGHT / 2 }, document.createElement('div'), 10, 10, true, CHAR_WIDTH, CHAR_HEIGHT);
        chai_1.assert.deepEqual(coords, [1, 1]);
        coords = (0, Mouse_1.getCoords)(windowOverride, { clientX: CHAR_WIDTH, clientY: CHAR_HEIGHT }, document.createElement('div'), 10, 10, true, CHAR_WIDTH, CHAR_HEIGHT);
        chai_1.assert.deepEqual(coords, [1, 1]);
        coords = (0, Mouse_1.getCoords)(windowOverride, { clientX: CHAR_WIDTH, clientY: CHAR_HEIGHT + 1 }, document.createElement('div'), 10, 10, true, CHAR_WIDTH, CHAR_HEIGHT);
        chai_1.assert.deepEqual(coords, [1, 2]);
        coords = (0, Mouse_1.getCoords)(windowOverride, { clientX: CHAR_WIDTH + 1, clientY: CHAR_HEIGHT }, document.createElement('div'), 10, 10, true, CHAR_WIDTH, CHAR_HEIGHT);
        chai_1.assert.deepEqual(coords, [2, 1]);
    });
    it('should ensure the coordinates are returned within the terminal bounds', () => {
        let coords;
        coords = (0, Mouse_1.getCoords)(windowOverride, { clientX: -1, clientY: -1 }, document.createElement('div'), 10, 10, true, CHAR_WIDTH, CHAR_HEIGHT);
        chai_1.assert.deepEqual(coords, [1, 1]);
        coords = (0, Mouse_1.getCoords)(windowOverride, { clientX: CHAR_WIDTH * 20, clientY: CHAR_HEIGHT * 20 }, document.createElement('div'), 10, 10, true, CHAR_WIDTH, CHAR_HEIGHT);
        chai_1.assert.deepEqual(coords, [10, 10], 'coordinates should never come back as larger than the terminal');
    });
});
//# sourceMappingURL=Mouse.test.js.map