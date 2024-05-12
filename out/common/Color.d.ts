import { IColor, IColorRGB } from 'common/Types';
export declare const NULL_COLOR: IColor;
export declare namespace channels {
    function toCss(r: number, g: number, b: number, a?: number): string;
    function toRgba(r: number, g: number, b: number, a?: number): number;
    function toColor(r: number, g: number, b: number, a?: number): IColor;
}
export declare namespace color {
    function blend(bg: IColor, fg: IColor): IColor;
    function isOpaque(color: IColor): boolean;
    function ensureContrastRatio(bg: IColor, fg: IColor, ratio: number): IColor | undefined;
    function opaque(color: IColor): IColor;
    function opacity(color: IColor, opacity: number): IColor;
    function multiplyOpacity(color: IColor, factor: number): IColor;
    function toColorRGB(color: IColor): IColorRGB;
}
export declare namespace css {
    function toColor(css: string): IColor;
}
export declare namespace rgb {
    function relativeLuminance(rgb: number): number;
    function relativeLuminance2(r: number, g: number, b: number): number;
}
export declare namespace rgba {
    function blend(bg: number, fg: number): number;
    function ensureContrastRatio(bgRgba: number, fgRgba: number, ratio: number): number | undefined;
    function reduceLuminance(bgRgba: number, fgRgba: number, ratio: number): number;
    function increaseLuminance(bgRgba: number, fgRgba: number, ratio: number): number;
    function toChannels(value: number): [number, number, number, number];
}
export declare function toPaddedHex(c: number): string;
export declare function contrastRatio(l1: number, l2: number): number;
//# sourceMappingURL=Color.d.ts.map