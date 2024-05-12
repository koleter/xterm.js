import { Disposable } from 'common/Lifecycle';
import { IAttributeData, ScrollSource } from 'common/Types';
import { IBuffer, IBufferSet } from 'common/buffer/Types';
import { IBufferService, IOptionsService } from 'common/services/Services';
export declare const MINIMUM_COLS = 2;
export declare const MINIMUM_ROWS = 1;
export declare class BufferService extends Disposable implements IBufferService {
    serviceBrand: any;
    cols: number;
    rows: number;
    buffers: IBufferSet;
    isUserScrolling: boolean;
    private readonly _onResize;
    readonly onResize: import("common/EventEmitter").IEvent<{
        cols: number;
        rows: number;
    }, void>;
    private readonly _onScroll;
    readonly onScroll: import("common/EventEmitter").IEvent<number, void>;
    get buffer(): IBuffer;
    private _cachedBlankLine;
    constructor(optionsService: IOptionsService);
    resize(cols: number, rows: number): void;
    reset(): void;
    scroll(eraseAttr: IAttributeData, isWrapped?: boolean): void;
    scrollLines(disp: number, suppressScrollEvent?: boolean, source?: ScrollSource): void;
}
//# sourceMappingURL=BufferService.d.ts.map