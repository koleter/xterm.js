"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.traceCall = exports.setTraceLogger = exports.LogService = void 0;
const Lifecycle_1 = require("common/Lifecycle");
const Services_1 = require("common/services/Services");
const optionsKeyToLogLevel = {
    trace: Services_1.LogLevelEnum.TRACE,
    debug: Services_1.LogLevelEnum.DEBUG,
    info: Services_1.LogLevelEnum.INFO,
    warn: Services_1.LogLevelEnum.WARN,
    error: Services_1.LogLevelEnum.ERROR,
    off: Services_1.LogLevelEnum.OFF
};
const LOG_PREFIX = 'xterm.js: ';
let LogService = exports.LogService = class LogService extends Lifecycle_1.Disposable {
    get logLevel() { return this._logLevel; }
    constructor(_optionsService) {
        super();
        this._optionsService = _optionsService;
        this._logLevel = Services_1.LogLevelEnum.OFF;
        this._updateLogLevel();
        this.register(this._optionsService.onSpecificOptionChange('logLevel', () => this._updateLogLevel()));
        traceLogger = this;
    }
    _updateLogLevel() {
        this._logLevel = optionsKeyToLogLevel[this._optionsService.rawOptions.logLevel];
    }
    _evalLazyOptionalParams(optionalParams) {
        for (let i = 0; i < optionalParams.length; i++) {
            if (typeof optionalParams[i] === 'function') {
                optionalParams[i] = optionalParams[i]();
            }
        }
    }
    _log(type, message, optionalParams) {
        this._evalLazyOptionalParams(optionalParams);
        type.call(console, (this._optionsService.options.logger ? '' : LOG_PREFIX) + message, ...optionalParams);
    }
    trace(message, ...optionalParams) {
        if (this._logLevel <= Services_1.LogLevelEnum.TRACE) {
            this._log(this._optionsService.options.logger?.trace.bind(this._optionsService.options.logger) ?? console.log, message, optionalParams);
        }
    }
    debug(message, ...optionalParams) {
        if (this._logLevel <= Services_1.LogLevelEnum.DEBUG) {
            this._log(this._optionsService.options.logger?.debug.bind(this._optionsService.options.logger) ?? console.log, message, optionalParams);
        }
    }
    info(message, ...optionalParams) {
        if (this._logLevel <= Services_1.LogLevelEnum.INFO) {
            this._log(this._optionsService.options.logger?.info.bind(this._optionsService.options.logger) ?? console.info, message, optionalParams);
        }
    }
    warn(message, ...optionalParams) {
        if (this._logLevel <= Services_1.LogLevelEnum.WARN) {
            this._log(this._optionsService.options.logger?.warn.bind(this._optionsService.options.logger) ?? console.warn, message, optionalParams);
        }
    }
    error(message, ...optionalParams) {
        if (this._logLevel <= Services_1.LogLevelEnum.ERROR) {
            this._log(this._optionsService.options.logger?.error.bind(this._optionsService.options.logger) ?? console.error, message, optionalParams);
        }
    }
};
exports.LogService = LogService = __decorate([
    __param(0, Services_1.IOptionsService)
], LogService);
let traceLogger;
function setTraceLogger(logger) {
    traceLogger = logger;
}
exports.setTraceLogger = setTraceLogger;
function traceCall(_target, key, descriptor) {
    if (typeof descriptor.value !== 'function') {
        throw new Error('not supported');
    }
    const fnKey = 'value';
    const fn = descriptor.value;
    descriptor[fnKey] = function (...args) {
        if (traceLogger.logLevel !== Services_1.LogLevelEnum.TRACE) {
            return fn.apply(this, args);
        }
        traceLogger.trace(`GlyphRenderer#${fn.name}(${args.map(e => JSON.stringify(e)).join(', ')})`);
        const result = fn.apply(this, args);
        traceLogger.trace(`GlyphRenderer#${fn.name} return`, result);
        return result;
    };
}
exports.traceCall = traceCall;
//# sourceMappingURL=LogService.js.map