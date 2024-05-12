import { Disposable } from 'common/Lifecycle';
import { ILogService, IOptionsService, LogLevelEnum } from 'common/services/Services';
export declare class LogService extends Disposable implements ILogService {
    private readonly _optionsService;
    serviceBrand: any;
    private _logLevel;
    get logLevel(): LogLevelEnum;
    constructor(_optionsService: IOptionsService);
    private _updateLogLevel;
    private _evalLazyOptionalParams;
    private _log;
    trace(message: string, ...optionalParams: any[]): void;
    debug(message: string, ...optionalParams: any[]): void;
    info(message: string, ...optionalParams: any[]): void;
    warn(message: string, ...optionalParams: any[]): void;
    error(message: string, ...optionalParams: any[]): void;
}
export declare function setTraceLogger(logger: ILogService): void;
export declare function traceCall(_target: any, key: string, descriptor: any): any;
//# sourceMappingURL=LogService.d.ts.map