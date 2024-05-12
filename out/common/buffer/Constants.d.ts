export declare const DEFAULT_COLOR = 0;
export declare const DEFAULT_ATTR: number;
export declare const DEFAULT_EXT = 0;
export declare const CHAR_DATA_ATTR_INDEX = 0;
export declare const CHAR_DATA_CHAR_INDEX = 1;
export declare const CHAR_DATA_WIDTH_INDEX = 2;
export declare const CHAR_DATA_CODE_INDEX = 3;
export declare const NULL_CELL_CHAR = "";
export declare const NULL_CELL_WIDTH = 1;
export declare const NULL_CELL_CODE = 0;
export declare const WHITESPACE_CELL_CHAR = " ";
export declare const WHITESPACE_CELL_WIDTH = 1;
export declare const WHITESPACE_CELL_CODE = 32;
export declare const enum Content {
    CODEPOINT_MASK = 2097151,
    IS_COMBINED_MASK = 2097152,
    HAS_CONTENT_MASK = 4194303,
    WIDTH_MASK = 12582912,
    WIDTH_SHIFT = 22
}
export declare const enum Attributes {
    BLUE_MASK = 255,
    BLUE_SHIFT = 0,
    PCOLOR_MASK = 255,
    PCOLOR_SHIFT = 0,
    GREEN_MASK = 65280,
    GREEN_SHIFT = 8,
    RED_MASK = 16711680,
    RED_SHIFT = 16,
    CM_MASK = 50331648,
    CM_DEFAULT = 0,
    CM_P16 = 16777216,
    CM_P256 = 33554432,
    CM_RGB = 50331648,
    RGB_MASK = 16777215
}
export declare const enum FgFlags {
    INVERSE = 67108864,
    BOLD = 134217728,
    UNDERLINE = 268435456,
    BLINK = 536870912,
    INVISIBLE = 1073741824,
    STRIKETHROUGH = 2147483648
}
export declare const enum BgFlags {
    ITALIC = 67108864,
    DIM = 134217728,
    HAS_EXTENDED = 268435456,
    PROTECTED = 536870912,
    OVERLINE = 1073741824
}
export declare const enum ExtFlags {
    UNDERLINE_STYLE = 469762048,
    VARIANT_OFFSET = 3758096384
}
export declare const enum UnderlineStyle {
    NONE = 0,
    SINGLE = 1,
    DOUBLE = 2,
    CURLY = 3,
    DOTTED = 4,
    DASHED = 5
}
//# sourceMappingURL=Constants.d.ts.map