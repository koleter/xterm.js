import { IOptionsService } from 'common/services/Services';
import { ICharSizeService } from 'browser/services/Services';
import { Disposable } from 'common/Lifecycle';
export declare class CharSizeService extends Disposable implements ICharSizeService {
    private readonly _optionsService;
    serviceBrand: undefined;
    width: number;
    height: number;
    private _measureStrategy;
    get hasValidSize(): boolean;
    private readonly _onCharSizeChange;
    readonly onCharSizeChange: import("common/EventEmitter").IEvent<void, void>;
    constructor(document: Document, parentElement: HTMLElement, _optionsService: IOptionsService);
    measure(): void;
}
//# sourceMappingURL=CharSizeService.d.ts.map