import { IParams, ParamsArray } from 'common/parser/Types';
export declare class Params implements IParams {
    maxLength: number;
    maxSubParamsLength: number;
    params: Int32Array;
    length: number;
    protected _subParams: Int32Array;
    protected _subParamsLength: number;
    private _subParamsIdx;
    private _rejectDigits;
    private _rejectSubDigits;
    private _digitIsSub;
    static fromArray(values: ParamsArray): Params;
    constructor(maxLength?: number, maxSubParamsLength?: number);
    clone(): Params;
    toArray(): ParamsArray;
    reset(): void;
    addParam(value: number): void;
    addSubParam(value: number): void;
    hasSubParams(idx: number): boolean;
    getSubParams(idx: number): Int32Array | null;
    getSubParamsAll(): {
        [idx: number]: Int32Array;
    };
    addDigit(value: number): void;
}
//# sourceMappingURL=Params.d.ts.map