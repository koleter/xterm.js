import { IDisposable, IMarker } from 'common/Types';
export declare class Marker implements IMarker {
    line: number;
    private static _nextId;
    isDisposed: boolean;
    private readonly _disposables;
    private readonly _id;
    get id(): number;
    private readonly _onDispose;
    readonly onDispose: import("common/EventEmitter").IEvent<void, void>;
    constructor(line: number);
    dispose(): void;
    register<T extends IDisposable>(disposable: T): T;
}
//# sourceMappingURL=Marker.d.ts.map