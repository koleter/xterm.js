import { ILinkProvider, ILinkProviderService } from 'browser/services/Services';
import { Disposable } from 'common/Lifecycle';
import { IDisposable } from 'common/Types';
export declare class LinkProviderService extends Disposable implements ILinkProviderService {
    serviceBrand: undefined;
    readonly linkProviders: ILinkProvider[];
    constructor();
    registerLinkProvider(linkProvider: ILinkProvider): IDisposable;
}
//# sourceMappingURL=LinkProviderService.d.ts.map