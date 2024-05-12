export declare class SortedList<T> {
    private readonly _getKey;
    private readonly _array;
    constructor(_getKey: (value: T) => number);
    clear(): void;
    insert(value: T): void;
    delete(value: T): boolean;
    getKeyIterator(key: number): IterableIterator<T>;
    forEachByKey(key: number, callback: (value: T) => void): void;
    values(): IterableIterator<T>;
    private _search;
}
//# sourceMappingURL=SortedList.d.ts.map