import { IBuffer as IBufferApi, IBufferLine as IBufferLineApi, IBufferCell as IBufferCellApi } from '@xterm/xterm';
import { IBuffer } from 'common/buffer/Types';
export declare class BufferApiView implements IBufferApi {
    private _buffer;
    readonly type: 'normal' | 'alternate';
    constructor(_buffer: IBuffer, type: 'normal' | 'alternate');
    init(buffer: IBuffer): BufferApiView;
    get cursorY(): number;
    get cursorX(): number;
    get viewportY(): number;
    get baseY(): number;
    get length(): number;
    getLine(y: number): IBufferLineApi | undefined;
    getNullCell(): IBufferCellApi;
}
//# sourceMappingURL=BufferApiView.d.ts.map