import { IInternalDecoration } from 'common/services/Services';
export interface IColorZoneStore {
    readonly zones: IColorZone[];
    clear(): void;
    addDecoration(decoration: IInternalDecoration): void;
    setPadding(padding: {
        [position: string]: number;
    }): void;
}
export interface IColorZone {
    color: string;
    position: 'full' | 'left' | 'center' | 'right' | undefined;
    startBufferLine: number;
    endBufferLine: number;
}
interface IMinimalDecorationForColorZone {
    marker: Pick<IInternalDecoration['marker'], 'line'>;
    options: Pick<IInternalDecoration['options'], 'overviewRulerOptions'>;
}
export declare class ColorZoneStore implements IColorZoneStore {
    private _zones;
    private _zonePool;
    private _zonePoolIndex;
    private _linePadding;
    get zones(): IColorZone[];
    clear(): void;
    addDecoration(decoration: IMinimalDecorationForColorZone): void;
    setPadding(padding: {
        [position: string]: number;
    }): void;
    private _lineIntersectsZone;
    private _lineAdjacentToZone;
    private _addLineToZone;
}
export {};
//# sourceMappingURL=ColorZoneStore.d.ts.map