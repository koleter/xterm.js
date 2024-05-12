import { IBufferService, IOscLinkService } from 'common/services/Services';
import { IOscLinkData } from 'common/Types';
export declare class OscLinkService implements IOscLinkService {
    private readonly _bufferService;
    serviceBrand: any;
    private _nextId;
    private _entriesWithId;
    private _dataByLinkId;
    constructor(_bufferService: IBufferService);
    registerLink(data: IOscLinkData): number;
    addLineToLink(linkId: number, y: number): void;
    getLinkData(linkId: number): IOscLinkData | undefined;
    private _getEntryIdKey;
    private _removeMarkerFromLink;
}
//# sourceMappingURL=OscLinkService.d.ts.map