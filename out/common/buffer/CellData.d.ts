import { CharData, ICellData, IExtendedAttrs } from 'common/Types';
import { AttributeData } from 'common/buffer/AttributeData';
export declare class CellData extends AttributeData implements ICellData {
    static fromCharData(value: CharData): CellData;
    content: number;
    fg: number;
    bg: number;
    extended: IExtendedAttrs;
    combinedData: string;
    isCombined(): number;
    getWidth(): number;
    getChars(): string;
    getCode(): number;
    setFromCharData(value: CharData): void;
    getAsCharData(): CharData;
}
//# sourceMappingURL=CellData.d.ts.map