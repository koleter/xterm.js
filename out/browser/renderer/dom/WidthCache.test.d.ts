import { WidthCache } from 'browser/renderer/dom/WidthCache';
export declare class TestWidthCache extends WidthCache {
    get flat(): Float32Array;
    get holey(): Map<string, number> | undefined;
    widths: {
        [key: string]: [number, number, number, number];
    };
    protected _measure(c: string, variant: number): number;
}
//# sourceMappingURL=WidthCache.test.d.ts.map