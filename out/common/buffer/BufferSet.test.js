"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const BufferSet_1 = require("common/buffer/BufferSet");
const Buffer_1 = require("common/buffer/Buffer");
const TestUtils_test_1 = require("common/TestUtils.test");
describe('BufferSet', () => {
    let bufferSet;
    beforeEach(() => {
        bufferSet = new BufferSet_1.BufferSet(new TestUtils_test_1.MockOptionsService({ scrollback: 1000 }), new TestUtils_test_1.MockBufferService(80, 24));
    });
    describe('constructor', () => {
        it('should create two different buffers: alt and normal', () => {
            chai_1.assert.instanceOf(bufferSet.normal, Buffer_1.Buffer);
            chai_1.assert.instanceOf(bufferSet.alt, Buffer_1.Buffer);
            chai_1.assert.notEqual(bufferSet.normal, bufferSet.alt);
        });
    });
    describe('activateNormalBuffer', () => {
        beforeEach(() => {
            bufferSet.activateNormalBuffer();
        });
        it('should set the normal buffer as the currently active buffer', () => {
            chai_1.assert.equal(bufferSet.active, bufferSet.normal);
        });
    });
    describe('activateAltBuffer', () => {
        beforeEach(() => {
            bufferSet.activateAltBuffer();
        });
        it('should set the alt buffer as the currently active buffer', () => {
            chai_1.assert.equal(bufferSet.active, bufferSet.alt);
        });
    });
    describe('cursor handling when swapping buffers', () => {
        beforeEach(() => {
            bufferSet.normal.x = 0;
            bufferSet.normal.y = 0;
            bufferSet.alt.x = 0;
            bufferSet.alt.y = 0;
        });
        it('should keep the cursor stationary when activating alt buffer', () => {
            bufferSet.activateNormalBuffer();
            bufferSet.active.x = 30;
            bufferSet.active.y = 10;
            bufferSet.activateAltBuffer();
            chai_1.assert.equal(bufferSet.active.x, 30);
            chai_1.assert.equal(bufferSet.active.y, 10);
        });
        it('should keep the cursor stationary when activating normal buffer', () => {
            bufferSet.activateAltBuffer();
            bufferSet.active.x = 30;
            bufferSet.active.y = 10;
            bufferSet.activateNormalBuffer();
            chai_1.assert.equal(bufferSet.active.x, 30);
            chai_1.assert.equal(bufferSet.active.y, 10);
        });
    });
    describe('markers', () => {
        it('should clear the markers when the buffer is switched', () => {
            bufferSet.activateAltBuffer();
            bufferSet.alt.addMarker(1);
            chai_1.assert.equal(bufferSet.alt.markers.length, 1);
            bufferSet.activateNormalBuffer();
            chai_1.assert.equal(bufferSet.alt.markers.length, 0);
        });
    });
});
//# sourceMappingURL=BufferSet.test.js.map