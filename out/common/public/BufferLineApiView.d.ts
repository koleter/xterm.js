import { IBufferLine } from 'common/Types';
import { IBufferCell as IBufferCellApi, IBufferLine as IBufferLineApi } from '@xterm/xterm';
export declare class BufferLineApiView implements IBufferLineApi {
    private _line;
    constructor(_line: IBufferLine);
    get isWrapped(): boolean;
    get length(): number;
    getCell(x: number, cell?: IBufferCellApi): IBufferCellApi | undefined;
    translateToString(trimRight?: boolean, startColumn?: number, endColumn?: number): string;
}
//# sourceMappingURL=BufferLineApiView.d.ts.map