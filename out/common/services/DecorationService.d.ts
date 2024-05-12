import { Disposable } from 'common/Lifecycle';
import { IDecorationService, IInternalDecoration } from 'common/services/Services';
import { IDecoration, IDecorationOptions } from '@xterm/xterm';
export declare class DecorationService extends Disposable implements IDecorationService {
    serviceBrand: any;
    private readonly _decorations;
    private readonly _onDecorationRegistered;
    readonly onDecorationRegistered: import("common/EventEmitter").IEvent<IInternalDecoration, void>;
    private readonly _onDecorationRemoved;
    readonly onDecorationRemoved: import("common/EventEmitter").IEvent<IInternalDecoration, void>;
    get decorations(): IterableIterator<IInternalDecoration>;
    constructor();
    registerDecoration(options: IDecorationOptions): IDecoration | undefined;
    reset(): void;
    getDecorationsAtCell(x: number, line: number, layer?: 'bottom' | 'top'): IterableIterator<IInternalDecoration>;
    forEachDecorationAtCell(x: number, line: number, layer: 'bottom' | 'top' | undefined, callback: (decoration: IInternalDecoration) => void): void;
}
//# sourceMappingURL=DecorationService.d.ts.map