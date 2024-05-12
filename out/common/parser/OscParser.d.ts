import { IOscHandler, OscFallbackHandlerType, IOscParser } from 'common/parser/Types';
import { IDisposable } from 'common/Types';
export declare class OscParser implements IOscParser {
    private _state;
    private _active;
    private _id;
    private _handlers;
    private _handlerFb;
    private _stack;
    registerHandler(ident: number, handler: IOscHandler): IDisposable;
    clearHandler(ident: number): void;
    setHandlerFallback(handler: OscFallbackHandlerType): void;
    dispose(): void;
    reset(): void;
    private _start;
    private _put;
    start(): void;
    put(data: Uint32Array, start: number, end: number): void;
    end(success: boolean, promiseResult?: boolean): void | Promise<boolean>;
}
export declare class OscHandler implements IOscHandler {
    private _handler;
    private _data;
    private _hitLimit;
    constructor(_handler: (data: string) => boolean | Promise<boolean>);
    start(): void;
    put(data: Uint32Array, start: number, end: number): void;
    end(success: boolean): boolean | Promise<boolean>;
}
//# sourceMappingURL=OscParser.d.ts.map