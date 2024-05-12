import { IDisposable } from 'common/Types';
export declare abstract class Disposable implements IDisposable {
    protected _disposables: IDisposable[];
    protected _isDisposed: boolean;
    dispose(): void;
    register<T extends IDisposable>(d: T): T;
    unregister<T extends IDisposable>(d: T): void;
}
export declare class MutableDisposable<T extends IDisposable> implements IDisposable {
    private _value?;
    private _isDisposed;
    get value(): T | undefined;
    set value(value: T | undefined);
    clear(): void;
    dispose(): void;
}
export declare function toDisposable(f: () => void): IDisposable;
export declare function disposeArray(disposables: IDisposable[]): void;
export declare function getDisposeArrayDisposable(array: IDisposable[]): IDisposable;
//# sourceMappingURL=Lifecycle.d.ts.map