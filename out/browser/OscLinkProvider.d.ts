import { ILink } from 'browser/Types';
import { ILinkProvider } from 'browser/services/Services';
import { IBufferService, IOptionsService, IOscLinkService } from 'common/services/Services';
export declare class OscLinkProvider implements ILinkProvider {
    private readonly _bufferService;
    private readonly _optionsService;
    private readonly _oscLinkService;
    constructor(_bufferService: IBufferService, _optionsService: IOptionsService, _oscLinkService: IOscLinkService);
    provideLinks(y: number, callback: (links: ILink[] | undefined) => void): void;
}
//# sourceMappingURL=OscLinkProvider.d.ts.map