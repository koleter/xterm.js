import { IBufferService } from 'common/services/Services';
export declare class SelectionModel {
    private _bufferService;
    isSelectAllActive: boolean;
    selectionStartLength: number;
    selectionStart: [number, number] | undefined;
    selectionEnd: [number, number] | undefined;
    constructor(_bufferService: IBufferService);
    clearSelection(): void;
    get finalSelectionStart(): [number, number] | undefined;
    get finalSelectionEnd(): [number, number] | undefined;
    areSelectionValuesReversed(): boolean;
    handleTrim(amount: number): boolean;
}
//# sourceMappingURL=SelectionModel.d.ts.map