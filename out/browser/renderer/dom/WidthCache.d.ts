import { IDisposable } from 'common/Types';
import { FontWeight } from 'common/services/Services';
export declare const enum WidthCacheSettings {
    FLAT_UNSET = -9999,
    FLAT_SIZE = 256,
    REPEAT = 32
}
declare const enum FontVariant {
    REGULAR = 0,
    BOLD = 1,
    ITALIC = 2,
    BOLD_ITALIC = 3
}
export declare class WidthCache implements IDisposable {
    protected _flat: Float32Array;
    protected _holey: Map<string, number> | undefined;
    private _font;
    private _fontSize;
    private _weight;
    private _weightBold;
    private _container;
    private _measureElements;
    constructor(_document: Document, _helperContainer: HTMLElement);
    dispose(): void;
    clear(): void;
    setFont(font: string, fontSize: number, weight: FontWeight, weightBold: FontWeight): void;
    get(c: string, bold: boolean | number, italic: boolean | number): number;
    protected _measure(c: string, variant: FontVariant): number;
}
export {};
//# sourceMappingURL=WidthCache.d.ts.map