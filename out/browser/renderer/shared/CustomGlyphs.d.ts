interface IBlockVector {
    x: number;
    y: number;
    w: number;
    h: number;
}
export declare const blockElementDefinitions: {
    [index: string]: IBlockVector[] | undefined;
};
type DrawFunctionDefinition = (xp: number, yp: number) => string;
export declare const boxDrawingDefinitions: {
    [character: string]: {
        [fontWeight: number]: string | DrawFunctionDefinition;
    } | undefined;
};
interface IVectorShape {
    d: string;
    type: VectorType;
    leftPadding?: number;
    rightPadding?: number;
}
declare const enum VectorType {
    FILL = 0,
    STROKE = 1
}
export declare const powerlineDefinitions: {
    [index: string]: IVectorShape;
};
export declare function tryDrawCustomChar(ctx: CanvasRenderingContext2D, c: string, xOffset: number, yOffset: number, deviceCellWidth: number, deviceCellHeight: number, fontSize: number, devicePixelRatio: number): boolean;
export {};
//# sourceMappingURL=CustomGlyphs.d.ts.map