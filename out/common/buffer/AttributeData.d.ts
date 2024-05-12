import { IAttributeData, IColorRGB, IExtendedAttrs } from 'common/Types';
import { UnderlineStyle } from 'common/buffer/Constants';
export declare class AttributeData implements IAttributeData {
    static toColorRGB(value: number): IColorRGB;
    static fromColorRGB(value: IColorRGB): number;
    clone(): IAttributeData;
    fg: number;
    bg: number;
    extended: IExtendedAttrs;
    isInverse(): number;
    isBold(): number;
    isUnderline(): number;
    isBlink(): number;
    isInvisible(): number;
    isItalic(): number;
    isDim(): number;
    isStrikethrough(): number;
    isProtected(): number;
    isOverline(): number;
    getFgColorMode(): number;
    getBgColorMode(): number;
    isFgRGB(): boolean;
    isBgRGB(): boolean;
    isFgPalette(): boolean;
    isBgPalette(): boolean;
    isFgDefault(): boolean;
    isBgDefault(): boolean;
    isAttributeDefault(): boolean;
    getFgColor(): number;
    getBgColor(): number;
    hasExtendedAttrs(): number;
    updateExtended(): void;
    getUnderlineColor(): number;
    getUnderlineColorMode(): number;
    isUnderlineColorRGB(): boolean;
    isUnderlineColorPalette(): boolean;
    isUnderlineColorDefault(): boolean;
    getUnderlineStyle(): UnderlineStyle;
    getUnderlineVariantOffset(): number;
}
export declare class ExtendedAttrs implements IExtendedAttrs {
    private _ext;
    get ext(): number;
    set ext(value: number);
    get underlineStyle(): UnderlineStyle;
    set underlineStyle(value: UnderlineStyle);
    get underlineColor(): number;
    set underlineColor(value: number);
    private _urlId;
    get urlId(): number;
    set urlId(value: number);
    get underlineVariantOffset(): number;
    set underlineVariantOffset(value: number);
    constructor(ext?: number, urlId?: number);
    clone(): IExtendedAttrs;
    isEmpty(): boolean;
}
//# sourceMappingURL=AttributeData.d.ts.map