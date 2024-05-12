import { ICellData, CharData } from 'common/Types';
import { AttributeData } from 'common/buffer/AttributeData';
import { IBufferService } from 'common/services/Services';
import { ICharacterJoinerService } from 'browser/services/Services';
export declare class JoinedCellData extends AttributeData implements ICellData {
    private _width;
    content: number;
    fg: number;
    bg: number;
    combinedData: string;
    constructor(firstCell: ICellData, chars: string, width: number);
    isCombined(): number;
    getWidth(): number;
    getChars(): string;
    getCode(): number;
    setFromCharData(value: CharData): void;
    getAsCharData(): CharData;
}
export declare class CharacterJoinerService implements ICharacterJoinerService {
    private _bufferService;
    serviceBrand: undefined;
    private _characterJoiners;
    private _nextCharacterJoinerId;
    private _workCell;
    constructor(_bufferService: IBufferService);
    register(handler: (text: string) => [number, number][]): number;
    deregister(joinerId: number): boolean;
    getJoinedCharacters(row: number): [number, number][];
    private _getJoinedRanges;
    private _stringRangesToCellRanges;
    private static _mergeRanges;
}
//# sourceMappingURL=CharacterJoinerService.d.ts.map