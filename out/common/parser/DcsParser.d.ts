import { IDisposable } from 'common/Types';
import { IDcsHandler, IParams, IDcsParser, DcsFallbackHandlerType } from 'common/parser/Types';
export declare class DcsParser implements IDcsParser {
    private _handlers;
    private _active;
    private _ident;
    private _handlerFb;
    private _stack;
    dispose(): void;
    registerHandler(ident: number, handler: IDcsHandler): IDisposable;
    clearHandler(ident: number): void;
    setHandlerFallback(handler: DcsFallbackHandlerType): void;
    reset(): void;
    hook(ident: number, params: IParams): void;
    put(data: Uint32Array, start: number, end: number): void;
    unhook(success: boolean, promiseResult?: boolean): void | Promise<boolean>;
}
export declare class DcsHandler implements IDcsHandler {
    private _handler;
    private _data;
    private _params;
    private _hitLimit;
    constructor(_handler: (data: string, params: IParams) => boolean | Promise<boolean>);
    hook(params: IParams): void;
    put(data: Uint32Array, start: number, end: number): void;
    unhook(success: boolean): boolean | Promise<boolean>;
}
//# sourceMappingURL=DcsParser.d.ts.map