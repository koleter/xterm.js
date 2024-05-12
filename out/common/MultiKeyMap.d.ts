export declare class TwoKeyMap<TFirst extends string | number, TSecond extends string | number, TValue> {
    private _data;
    set(first: TFirst, second: TSecond, value: TValue): void;
    get(first: TFirst, second: TSecond): TValue | undefined;
    clear(): void;
}
export declare class FourKeyMap<TFirst extends string | number, TSecond extends string | number, TThird extends string | number, TFourth extends string | number, TValue> {
    private _data;
    set(first: TFirst, second: TSecond, third: TThird, fourth: TFourth, value: TValue): void;
    get(first: TFirst, second: TSecond, third: TThird, fourth: TFourth): TValue | undefined;
    clear(): void;
}
//# sourceMappingURL=MultiKeyMap.d.ts.map