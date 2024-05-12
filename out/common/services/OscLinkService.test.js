"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const AttributeData_1 = require("common/buffer/AttributeData");
const BufferService_1 = require("common/services/BufferService");
const OptionsService_1 = require("common/services/OptionsService");
const OscLinkService_1 = require("common/services/OscLinkService");
describe('OscLinkService', () => {
    describe('constructor', () => {
        let bufferService;
        let optionsService;
        let oscLinkService;
        beforeEach(() => {
            optionsService = new OptionsService_1.OptionsService({ rows: 3, cols: 10 });
            bufferService = new BufferService_1.BufferService(optionsService);
            oscLinkService = new OscLinkService_1.OscLinkService(bufferService);
        });
        it('link IDs are created and fetched consistently', () => {
            const linkId = oscLinkService.registerLink({ id: 'foo', uri: 'bar' });
            chai_1.assert.ok(linkId);
            chai_1.assert.equal(oscLinkService.registerLink({ id: 'foo', uri: 'bar' }), linkId);
        });
        it('should dispose the link ID when the last marker is trimmed from the buffer', () => {
            bufferService.buffers.activateAltBuffer();
            const linkId = oscLinkService.registerLink({ id: 'foo', uri: 'bar' });
            chai_1.assert.ok(linkId);
            bufferService.scroll(new AttributeData_1.AttributeData());
            chai_1.assert.notStrictEqual(oscLinkService.registerLink({ id: 'foo', uri: 'bar' }), linkId);
        });
        it('should fetch link data from link id', () => {
            const linkId = oscLinkService.registerLink({ id: 'foo', uri: 'bar' });
            chai_1.assert.deepStrictEqual(oscLinkService.getLinkData(linkId), { id: 'foo', uri: 'bar' });
        });
    });
});
//# sourceMappingURL=OscLinkService.test.js.map