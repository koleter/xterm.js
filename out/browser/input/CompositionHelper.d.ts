import { IRenderService } from 'browser/services/Services';
import { IBufferService, ICoreService, IOptionsService } from 'common/services/Services';
export declare class CompositionHelper {
    private readonly _textarea;
    private readonly _compositionView;
    private readonly _bufferService;
    private readonly _optionsService;
    private readonly _coreService;
    private readonly _renderService;
    private _isComposing;
    get isComposing(): boolean;
    private _compositionPosition;
    private _isSendingComposition;
    private _dataAlreadySent;
    constructor(_textarea: HTMLTextAreaElement, _compositionView: HTMLElement, _bufferService: IBufferService, _optionsService: IOptionsService, _coreService: ICoreService, _renderService: IRenderService);
    compositionstart(): void;
    compositionupdate(ev: Pick<CompositionEvent, 'data'>): void;
    compositionend(): void;
    keydown(ev: KeyboardEvent): boolean;
    private _finalizeComposition;
    private _handleAnyTextareaChanges;
    updateCompositionElements(dontRecurse?: boolean): void;
}
//# sourceMappingURL=CompositionHelper.d.ts.map