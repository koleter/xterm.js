import { ICircularList } from 'common/Types';
import { EventEmitter } from 'common/EventEmitter';
import { Disposable } from 'common/Lifecycle';
export interface IInsertEvent {
    index: number;
    amount: number;
}
export interface IDeleteEvent {
    index: number;
    amount: number;
}
export declare class CircularList<T> extends Disposable implements ICircularList<T> {
    private _maxLength;
    protected _array: (T | undefined)[];
    private _startIndex;
    private _length;
    readonly onDeleteEmitter: EventEmitter<IDeleteEvent, void>;
    readonly onDelete: import("common/EventEmitter").IEvent<IDeleteEvent, void>;
    readonly onInsertEmitter: EventEmitter<IInsertEvent, void>;
    readonly onInsert: import("common/EventEmitter").IEvent<IInsertEvent, void>;
    readonly onTrimEmitter: EventEmitter<number, void>;
    readonly onTrim: import("common/EventEmitter").IEvent<number, void>;
    constructor(_maxLength: number);
    get maxLength(): number;
    set maxLength(newMaxLength: number);
    get length(): number;
    set length(newLength: number);
    get(index: number): T | undefined;
    set(index: number, value: T | undefined): void;
    push(value: T): void;
    recycle(): T;
    get isFull(): boolean;
    pop(): T | undefined;
    splice(start: number, deleteCount: number, ...items: T[]): void;
    trimStart(count: number): void;
    shiftElements(start: number, count: number, offset: number): void;
    private _getCyclicIndex;
}
//# sourceMappingURL=CircularList.d.ts.map