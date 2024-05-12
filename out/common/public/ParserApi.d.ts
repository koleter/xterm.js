import { IDisposable, IFunctionIdentifier, IParser } from '@xterm/xterm';
import { ICoreTerminal } from 'common/Types';
export declare class ParserApi implements IParser {
    private _core;
    constructor(_core: ICoreTerminal);
    registerCsiHandler(id: IFunctionIdentifier, callback: (params: (number | number[])[]) => boolean | Promise<boolean>): IDisposable;
    addCsiHandler(id: IFunctionIdentifier, callback: (params: (number | number[])[]) => boolean | Promise<boolean>): IDisposable;
    registerDcsHandler(id: IFunctionIdentifier, callback: (data: string, param: (number | number[])[]) => boolean | Promise<boolean>): IDisposable;
    addDcsHandler(id: IFunctionIdentifier, callback: (data: string, param: (number | number[])[]) => boolean | Promise<boolean>): IDisposable;
    registerEscHandler(id: IFunctionIdentifier, handler: () => boolean | Promise<boolean>): IDisposable;
    addEscHandler(id: IFunctionIdentifier, handler: () => boolean | Promise<boolean>): IDisposable;
    registerOscHandler(ident: number, callback: (data: string) => boolean | Promise<boolean>): IDisposable;
    addOscHandler(ident: number, callback: (data: string) => boolean | Promise<boolean>): IDisposable;
}
//# sourceMappingURL=ParserApi.d.ts.map