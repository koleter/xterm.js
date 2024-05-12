import { IParsingState, IDcsHandler, IEscapeSequenceParser, IParams, IOscHandler, IHandlerCollection, CsiHandlerType, OscFallbackHandlerType, IOscParser, EscHandlerType, IDcsParser, DcsFallbackHandlerType, IFunctionIdentifier, ExecuteFallbackHandlerType, CsiFallbackHandlerType, EscFallbackHandlerType, PrintHandlerType, PrintFallbackHandlerType, ExecuteHandlerType, IParserStackState, ParserStackType, ResumableHandlersType } from 'common/parser/Types';
import { ParserState, ParserAction } from 'common/parser/Constants';
import { Disposable } from 'common/Lifecycle';
import { IDisposable } from 'common/Types';
import { Params } from 'common/parser/Params';
export declare class TransitionTable {
    table: Uint8Array;
    constructor(length: number);
    setDefault(action: ParserAction, next: ParserState): void;
    add(code: number, state: ParserState, action: ParserAction, next: ParserState): void;
    addMany(codes: number[], state: ParserState, action: ParserAction, next: ParserState): void;
}
export declare const VT500_TRANSITION_TABLE: TransitionTable;
export declare class EscapeSequenceParser extends Disposable implements IEscapeSequenceParser {
    protected readonly _transitions: TransitionTable;
    initialState: number;
    currentState: number;
    precedingJoinState: number;
    result: string;
    protected _params: Params;
    protected _collect: number;
    protected _printHandler: PrintHandlerType;
    protected _executeHandlers: {
        [flag: number]: ExecuteHandlerType;
    };
    protected _csiHandlers: IHandlerCollection<CsiHandlerType>;
    protected _escHandlers: IHandlerCollection<EscHandlerType>;
    protected readonly _oscParser: IOscParser;
    protected readonly _dcsParser: IDcsParser;
    protected _errorHandler: (state: IParsingState) => IParsingState;
    protected _printHandlerFb: PrintFallbackHandlerType;
    protected _executeHandlerFb: ExecuteFallbackHandlerType;
    protected _csiHandlerFb: CsiFallbackHandlerType;
    protected _escHandlerFb: EscFallbackHandlerType;
    protected _errorHandlerFb: (state: IParsingState) => IParsingState;
    protected _parseStack: IParserStackState;
    constructor(_transitions?: TransitionTable);
    protected _identifier(id: IFunctionIdentifier, finalRange?: number[]): number;
    identToString(ident: number): string;
    setPrintHandler(handler: PrintHandlerType): void;
    clearPrintHandler(): void;
    registerEscHandler(id: IFunctionIdentifier, handler: EscHandlerType): IDisposable;
    clearEscHandler(id: IFunctionIdentifier): void;
    setEscHandlerFallback(handler: EscFallbackHandlerType): void;
    setExecuteHandler(flag: string, handler: ExecuteHandlerType): void;
    clearExecuteHandler(flag: string): void;
    setExecuteHandlerFallback(handler: ExecuteFallbackHandlerType): void;
    registerCsiHandler(id: IFunctionIdentifier, handler: CsiHandlerType): IDisposable;
    clearCsiHandler(id: IFunctionIdentifier): void;
    setCsiHandlerFallback(callback: (ident: number, params: IParams) => void): void;
    registerDcsHandler(id: IFunctionIdentifier, handler: IDcsHandler): IDisposable;
    clearDcsHandler(id: IFunctionIdentifier): void;
    setDcsHandlerFallback(handler: DcsFallbackHandlerType): void;
    registerOscHandler(ident: number, handler: IOscHandler): IDisposable;
    clearOscHandler(ident: number): void;
    setOscHandlerFallback(handler: OscFallbackHandlerType): void;
    setErrorHandler(callback: (state: IParsingState) => IParsingState): void;
    clearErrorHandler(): void;
    reset(): void;
    protected _preserveStack(state: ParserStackType, handlers: ResumableHandlersType, handlerPos: number, transition: number, chunkPos: number): void;
    parse(data: Uint32Array, length: number, promiseResult?: boolean): void | Promise<boolean>;
}
//# sourceMappingURL=EscapeSequenceParser.d.ts.map