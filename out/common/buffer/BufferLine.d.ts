import { CharData, IAttributeData, IBufferLine, ICellData, IExtendedAttrs } from 'common/Types';
import { AttributeData } from 'common/buffer/AttributeData';
export declare const DEFAULT_ATTR_DATA: Readonly<AttributeData>;
export declare class BufferLine implements IBufferLine {
    isWrapped: boolean;
    protected _data: Uint32Array;
    protected _combined: {
        [index: number]: string;
    };
    protected _extendedAttrs: {
        [index: number]: IExtendedAttrs | undefined;
    };
    length: number;
    constructor(cols: number, fillCellData?: ICellData, isWrapped?: boolean);
    get(index: number): CharData;
    set(index: number, value: CharData): void;
    getWidth(index: number): number;
    hasWidth(index: number): number;
    getFg(index: number): number;
    getBg(index: number): number;
    hasContent(index: number): number;
    getCodePoint(index: number): number;
    isCombined(index: number): number;
    getString(index: number): string;
    isProtected(index: number): number;
    loadCell(index: number, cell: ICellData): ICellData;
    setCell(index: number, cell: ICellData): void;
    setCellFromCodepoint(index: number, codePoint: number, width: number, attrs: IAttributeData): void;
    addCodepointToCell(index: number, codePoint: number, width: number): void;
    insertCells(pos: number, n: number, fillCellData: ICellData): void;
    deleteCells(pos: number, n: number, fillCellData: ICellData): void;
    replaceCells(start: number, end: number, fillCellData: ICellData, respectProtect?: boolean): void;
    resize(cols: number, fillCellData: ICellData): boolean;
    cleanupMemory(): number;
    fill(fillCellData: ICellData, respectProtect?: boolean): void;
    copyFrom(line: BufferLine): void;
    clone(): IBufferLine;
    getTrimmedLength(): number;
    getNoBgTrimmedLength(): number;
    copyCellsFrom(src: BufferLine, srcCol: number, destCol: number, length: number, applyInReverse: boolean): void;
    translateToString(trimRight?: boolean, startCol?: number, endCol?: number, outColumns?: number[]): string;
}
//# sourceMappingURL=BufferLine.d.ts.map