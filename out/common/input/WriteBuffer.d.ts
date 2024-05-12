import { Disposable } from 'common/Lifecycle';
export declare class WriteBuffer extends Disposable {
    private _action;
    private _writeBuffer;
    private _callbacks;
    private _pendingData;
    private _bufferOffset;
    private _isSyncWriting;
    private _syncCalls;
    private _didUserInput;
    private readonly _onWriteParsed;
    readonly onWriteParsed: import("common/EventEmitter").IEvent<void, void>;
    constructor(_action: (data: string | Uint8Array, promiseResult?: boolean) => void | Promise<boolean>);
    handleUserInput(): void;
    writeSync(data: string | Uint8Array, maxSubsequentCalls?: number): void;
    write(data: string | Uint8Array, callback?: () => void): void;
    protected _innerWrite(lastTime?: number, promiseResult?: boolean): void;
}
//# sourceMappingURL=WriteBuffer.d.ts.map