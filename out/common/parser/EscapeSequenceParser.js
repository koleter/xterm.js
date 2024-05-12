"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EscapeSequenceParser = exports.VT500_TRANSITION_TABLE = exports.TransitionTable = void 0;
const Lifecycle_1 = require("common/Lifecycle");
const Params_1 = require("common/parser/Params");
const OscParser_1 = require("common/parser/OscParser");
const DcsParser_1 = require("common/parser/DcsParser");
class TransitionTable {
    constructor(length) {
        this.table = new Uint8Array(length);
    }
    setDefault(action, next) {
        this.table.fill(action << 4 | next);
    }
    add(code, state, action, next) {
        this.table[state << 8 | code] = action << 4 | next;
    }
    addMany(codes, state, action, next) {
        for (let i = 0; i < codes.length; i++) {
            this.table[state << 8 | codes[i]] = action << 4 | next;
        }
    }
}
exports.TransitionTable = TransitionTable;
const NON_ASCII_PRINTABLE = 0xA0;
exports.VT500_TRANSITION_TABLE = (function () {
    const table = new TransitionTable(4095);
    const BYTE_VALUES = 256;
    const blueprint = Array.apply(null, Array(BYTE_VALUES)).map((unused, i) => i);
    const r = (start, end) => blueprint.slice(start, end);
    const PRINTABLES = r(0x20, 0x7f);
    const EXECUTABLES = r(0x00, 0x18);
    EXECUTABLES.push(0x19);
    EXECUTABLES.push.apply(EXECUTABLES, r(0x1c, 0x20));
    const states = r(0, 13 + 1);
    let state;
    table.setDefault(1, 0);
    table.addMany(PRINTABLES, 0, 2, 0);
    for (state in states) {
        table.addMany([0x18, 0x1a, 0x99, 0x9a], state, 3, 0);
        table.addMany(r(0x80, 0x90), state, 3, 0);
        table.addMany(r(0x90, 0x98), state, 3, 0);
        table.add(0x9c, state, 0, 0);
        table.add(0x1b, state, 11, 1);
        table.add(0x9d, state, 4, 8);
        table.addMany([0x98, 0x9e, 0x9f], state, 0, 7);
        table.add(0x9b, state, 11, 3);
        table.add(0x90, state, 11, 9);
    }
    table.addMany(EXECUTABLES, 0, 3, 0);
    table.addMany(EXECUTABLES, 1, 3, 1);
    table.add(0x7f, 1, 0, 1);
    table.addMany(EXECUTABLES, 8, 0, 8);
    table.addMany(EXECUTABLES, 3, 3, 3);
    table.add(0x7f, 3, 0, 3);
    table.addMany(EXECUTABLES, 4, 3, 4);
    table.add(0x7f, 4, 0, 4);
    table.addMany(EXECUTABLES, 6, 3, 6);
    table.addMany(EXECUTABLES, 5, 3, 5);
    table.add(0x7f, 5, 0, 5);
    table.addMany(EXECUTABLES, 2, 3, 2);
    table.add(0x7f, 2, 0, 2);
    table.add(0x5d, 1, 4, 8);
    table.addMany(PRINTABLES, 8, 5, 8);
    table.add(0x7f, 8, 5, 8);
    table.addMany([0x9c, 0x1b, 0x18, 0x1a, 0x07], 8, 6, 0);
    table.addMany(r(0x1c, 0x20), 8, 0, 8);
    table.addMany([0x58, 0x5e, 0x5f], 1, 0, 7);
    table.addMany(PRINTABLES, 7, 0, 7);
    table.addMany(EXECUTABLES, 7, 0, 7);
    table.add(0x9c, 7, 0, 0);
    table.add(0x7f, 7, 0, 7);
    table.add(0x5b, 1, 11, 3);
    table.addMany(r(0x40, 0x7f), 3, 7, 0);
    table.addMany(r(0x30, 0x3c), 3, 8, 4);
    table.addMany([0x3c, 0x3d, 0x3e, 0x3f], 3, 9, 4);
    table.addMany(r(0x30, 0x3c), 4, 8, 4);
    table.addMany(r(0x40, 0x7f), 4, 7, 0);
    table.addMany([0x3c, 0x3d, 0x3e, 0x3f], 4, 0, 6);
    table.addMany(r(0x20, 0x40), 6, 0, 6);
    table.add(0x7f, 6, 0, 6);
    table.addMany(r(0x40, 0x7f), 6, 0, 0);
    table.addMany(r(0x20, 0x30), 3, 9, 5);
    table.addMany(r(0x20, 0x30), 5, 9, 5);
    table.addMany(r(0x30, 0x40), 5, 0, 6);
    table.addMany(r(0x40, 0x7f), 5, 7, 0);
    table.addMany(r(0x20, 0x30), 4, 9, 5);
    table.addMany(r(0x20, 0x30), 1, 9, 2);
    table.addMany(r(0x20, 0x30), 2, 9, 2);
    table.addMany(r(0x30, 0x7f), 2, 10, 0);
    table.addMany(r(0x30, 0x50), 1, 10, 0);
    table.addMany(r(0x51, 0x58), 1, 10, 0);
    table.addMany([0x59, 0x5a, 0x5c], 1, 10, 0);
    table.addMany(r(0x60, 0x7f), 1, 10, 0);
    table.add(0x50, 1, 11, 9);
    table.addMany(EXECUTABLES, 9, 0, 9);
    table.add(0x7f, 9, 0, 9);
    table.addMany(r(0x1c, 0x20), 9, 0, 9);
    table.addMany(r(0x20, 0x30), 9, 9, 12);
    table.addMany(r(0x30, 0x3c), 9, 8, 10);
    table.addMany([0x3c, 0x3d, 0x3e, 0x3f], 9, 9, 10);
    table.addMany(EXECUTABLES, 11, 0, 11);
    table.addMany(r(0x20, 0x80), 11, 0, 11);
    table.addMany(r(0x1c, 0x20), 11, 0, 11);
    table.addMany(EXECUTABLES, 10, 0, 10);
    table.add(0x7f, 10, 0, 10);
    table.addMany(r(0x1c, 0x20), 10, 0, 10);
    table.addMany(r(0x30, 0x3c), 10, 8, 10);
    table.addMany([0x3c, 0x3d, 0x3e, 0x3f], 10, 0, 11);
    table.addMany(r(0x20, 0x30), 10, 9, 12);
    table.addMany(EXECUTABLES, 12, 0, 12);
    table.add(0x7f, 12, 0, 12);
    table.addMany(r(0x1c, 0x20), 12, 0, 12);
    table.addMany(r(0x20, 0x30), 12, 9, 12);
    table.addMany(r(0x30, 0x40), 12, 0, 11);
    table.addMany(r(0x40, 0x7f), 12, 12, 13);
    table.addMany(r(0x40, 0x7f), 10, 12, 13);
    table.addMany(r(0x40, 0x7f), 9, 12, 13);
    table.addMany(EXECUTABLES, 13, 13, 13);
    table.addMany(PRINTABLES, 13, 13, 13);
    table.add(0x7f, 13, 0, 13);
    table.addMany([0x1b, 0x9c, 0x18, 0x1a], 13, 14, 0);
    table.add(NON_ASCII_PRINTABLE, 0, 2, 0);
    table.add(NON_ASCII_PRINTABLE, 8, 5, 8);
    table.add(NON_ASCII_PRINTABLE, 6, 0, 6);
    table.add(NON_ASCII_PRINTABLE, 11, 0, 11);
    table.add(NON_ASCII_PRINTABLE, 13, 13, 13);
    return table;
})();
class EscapeSequenceParser extends Lifecycle_1.Disposable {
    constructor(_transitions = exports.VT500_TRANSITION_TABLE) {
        super();
        this._transitions = _transitions;
        this.result = "";
        this._parseStack = {
            state: 0,
            handlers: [],
            handlerPos: 0,
            transition: 0,
            chunkPos: 0
        };
        this.initialState = 0;
        this.currentState = this.initialState;
        this._params = new Params_1.Params();
        this._params.addParam(0);
        this._collect = 0;
        this.precedingJoinState = 0;
        this._printHandlerFb = (data, start, end) => { };
        this._executeHandlerFb = (code) => { };
        this._csiHandlerFb = (ident, params) => { };
        this._escHandlerFb = (ident) => { };
        this._errorHandlerFb = (state) => state;
        this._printHandler = this._printHandlerFb;
        this._executeHandlers = Object.create(null);
        this._csiHandlers = Object.create(null);
        this._escHandlers = Object.create(null);
        this.register((0, Lifecycle_1.toDisposable)(() => {
            this._csiHandlers = Object.create(null);
            this._executeHandlers = Object.create(null);
            this._escHandlers = Object.create(null);
        }));
        this._oscParser = this.register(new OscParser_1.OscParser());
        this._dcsParser = this.register(new DcsParser_1.DcsParser());
        this._errorHandler = this._errorHandlerFb;
        this.registerEscHandler({ final: '\\' }, () => true);
    }
    _identifier(id, finalRange = [0x40, 0x7e]) {
        let res = 0;
        if (id.prefix) {
            if (id.prefix.length > 1) {
                throw new Error('only one byte as prefix supported');
            }
            res = id.prefix.charCodeAt(0);
            if (res && 0x3c > res || res > 0x3f) {
                throw new Error('prefix must be in range 0x3c .. 0x3f');
            }
        }
        if (id.intermediates) {
            if (id.intermediates.length > 2) {
                throw new Error('only two bytes as intermediates are supported');
            }
            for (let i = 0; i < id.intermediates.length; ++i) {
                const intermediate = id.intermediates.charCodeAt(i);
                if (0x20 > intermediate || intermediate > 0x2f) {
                    throw new Error('intermediate must be in range 0x20 .. 0x2f');
                }
                res <<= 8;
                res |= intermediate;
            }
        }
        if (id.final.length !== 1) {
            throw new Error('final must be a single byte');
        }
        const finalCode = id.final.charCodeAt(0);
        if (finalRange[0] > finalCode || finalCode > finalRange[1]) {
            throw new Error(`final must be in range ${finalRange[0]} .. ${finalRange[1]}`);
        }
        res <<= 8;
        res |= finalCode;
        return res;
    }
    identToString(ident) {
        const res = [];
        while (ident) {
            res.push(String.fromCharCode(ident & 0xFF));
            ident >>= 8;
        }
        return res.reverse().join('');
    }
    setPrintHandler(handler) {
        this._printHandler = handler;
    }
    clearPrintHandler() {
        this._printHandler = this._printHandlerFb;
    }
    registerEscHandler(id, handler) {
        const ident = this._identifier(id, [0x30, 0x7e]);
        if (this._escHandlers[ident] === undefined) {
            this._escHandlers[ident] = [];
        }
        const handlerList = this._escHandlers[ident];
        handlerList.push(handler);
        return {
            dispose: () => {
                const handlerIndex = handlerList.indexOf(handler);
                if (handlerIndex !== -1) {
                    handlerList.splice(handlerIndex, 1);
                }
            }
        };
    }
    clearEscHandler(id) {
        if (this._escHandlers[this._identifier(id, [0x30, 0x7e])])
            delete this._escHandlers[this._identifier(id, [0x30, 0x7e])];
    }
    setEscHandlerFallback(handler) {
        this._escHandlerFb = handler;
    }
    setExecuteHandler(flag, handler) {
        this._executeHandlers[flag.charCodeAt(0)] = handler;
    }
    clearExecuteHandler(flag) {
        if (this._executeHandlers[flag.charCodeAt(0)])
            delete this._executeHandlers[flag.charCodeAt(0)];
    }
    setExecuteHandlerFallback(handler) {
        this._executeHandlerFb = handler;
    }
    registerCsiHandler(id, handler) {
        const ident = this._identifier(id);
        if (this._csiHandlers[ident] === undefined) {
            this._csiHandlers[ident] = [];
        }
        const handlerList = this._csiHandlers[ident];
        handlerList.push(handler);
        return {
            dispose: () => {
                const handlerIndex = handlerList.indexOf(handler);
                if (handlerIndex !== -1) {
                    handlerList.splice(handlerIndex, 1);
                }
            }
        };
    }
    clearCsiHandler(id) {
        if (this._csiHandlers[this._identifier(id)])
            delete this._csiHandlers[this._identifier(id)];
    }
    setCsiHandlerFallback(callback) {
        this._csiHandlerFb = callback;
    }
    registerDcsHandler(id, handler) {
        return this._dcsParser.registerHandler(this._identifier(id), handler);
    }
    clearDcsHandler(id) {
        this._dcsParser.clearHandler(this._identifier(id));
    }
    setDcsHandlerFallback(handler) {
        this._dcsParser.setHandlerFallback(handler);
    }
    registerOscHandler(ident, handler) {
        return this._oscParser.registerHandler(ident, handler);
    }
    clearOscHandler(ident) {
        this._oscParser.clearHandler(ident);
    }
    setOscHandlerFallback(handler) {
        this._oscParser.setHandlerFallback(handler);
    }
    setErrorHandler(callback) {
        this._errorHandler = callback;
    }
    clearErrorHandler() {
        this._errorHandler = this._errorHandlerFb;
    }
    reset() {
        this.currentState = this.initialState;
        this._oscParser.reset();
        this._dcsParser.reset();
        this._params.reset();
        this._params.addParam(0);
        this._collect = 0;
        this.precedingJoinState = 0;
        if (this._parseStack.state !== 0) {
            this._parseStack.state = 2;
            this._parseStack.handlers = [];
        }
    }
    _preserveStack(state, handlers, handlerPos, transition, chunkPos) {
        this._parseStack.state = state;
        this._parseStack.handlers = handlers;
        this._parseStack.handlerPos = handlerPos;
        this._parseStack.transition = transition;
        this._parseStack.chunkPos = chunkPos;
    }
    parse(data, length, promiseResult) {
        let code = 0;
        let transition = 0;
        let start = 0;
        this.result = "";
        let handlerResult;
        if (this._parseStack.state) {
            if (this._parseStack.state === 2) {
                this._parseStack.state = 0;
                start = this._parseStack.chunkPos + 1;
            }
            else {
                if (promiseResult === undefined || this._parseStack.state === 1) {
                    this._parseStack.state = 1;
                    throw new Error('improper continuation due to previous async handler, giving up parsing');
                }
                const handlers = this._parseStack.handlers;
                let handlerPos = this._parseStack.handlerPos - 1;
                switch (this._parseStack.state) {
                    case 3:
                        if (promiseResult === false && handlerPos > -1) {
                            for (; handlerPos >= 0; handlerPos--) {
                                handlerResult = handlers[handlerPos](this._params);
                                if (handlerResult === true) {
                                    break;
                                }
                                else if (handlerResult instanceof Promise) {
                                    this._parseStack.handlerPos = handlerPos;
                                    return handlerResult;
                                }
                            }
                        }
                        this._parseStack.handlers = [];
                        break;
                    case 4:
                        if (promiseResult === false && handlerPos > -1) {
                            for (; handlerPos >= 0; handlerPos--) {
                                handlerResult = handlers[handlerPos]();
                                if (handlerResult === true) {
                                    break;
                                }
                                else if (handlerResult instanceof Promise) {
                                    this._parseStack.handlerPos = handlerPos;
                                    return handlerResult;
                                }
                            }
                        }
                        this._parseStack.handlers = [];
                        break;
                    case 6:
                        code = data[this._parseStack.chunkPos];
                        handlerResult = this._dcsParser.unhook(code !== 0x18 && code !== 0x1a, promiseResult);
                        if (handlerResult) {
                            return handlerResult;
                        }
                        if (code === 0x1b)
                            this._parseStack.transition |= 1;
                        this._params.reset();
                        this._params.addParam(0);
                        this._collect = 0;
                        break;
                    case 5:
                        code = data[this._parseStack.chunkPos];
                        handlerResult = this._oscParser.end(code !== 0x18 && code !== 0x1a, promiseResult);
                        if (handlerResult) {
                            return handlerResult;
                        }
                        if (code === 0x1b)
                            this._parseStack.transition |= 1;
                        this._params.reset();
                        this._params.addParam(0);
                        this._collect = 0;
                        break;
                }
                this._parseStack.state = 0;
                start = this._parseStack.chunkPos + 1;
                this.precedingJoinState = 0;
                this.currentState = this._parseStack.transition & 15;
            }
        }
        for (let i = start; i < length; ++i) {
            code = data[i];
            transition = this._transitions.table[this.currentState << 8 | (code < 0xa0 ? code : NON_ASCII_PRINTABLE)];
            switch (transition >> 4) {
                case 2:
                    for (let j = i + 1;; ++j) {
                        if (j >= length || (code = data[j]) < 0x20 || (code > 0x7e && code < NON_ASCII_PRINTABLE)) {
                            this.result += String.fromCharCode(...data.subarray(i, j));
                            this._printHandler(data, i, j);
                            i = j - 1;
                            break;
                        }
                        if (++j >= length || (code = data[j]) < 0x20 || (code > 0x7e && code < NON_ASCII_PRINTABLE)) {
                            this.result += String.fromCharCode(...data.subarray(i, j));
                            this._printHandler(data, i, j);
                            i = j - 1;
                            break;
                        }
                        if (++j >= length || (code = data[j]) < 0x20 || (code > 0x7e && code < NON_ASCII_PRINTABLE)) {
                            this.result += String.fromCharCode(...data.subarray(i, j));
                            this._printHandler(data, i, j);
                            i = j - 1;
                            break;
                        }
                        if (++j >= length || (code = data[j]) < 0x20 || (code > 0x7e && code < NON_ASCII_PRINTABLE)) {
                            this.result += String.fromCharCode(...data.subarray(i, j));
                            this._printHandler(data, i, j);
                            i = j - 1;
                            break;
                        }
                    }
                    break;
                case 3:
                    if (this._executeHandlers[code])
                        this._executeHandlers[code]();
                    else
                        this._executeHandlerFb(code);
                    this.precedingJoinState = 0;
                    break;
                case 0:
                    break;
                case 1:
                    const inject = this._errorHandler({
                        position: i,
                        code,
                        currentState: this.currentState,
                        collect: this._collect,
                        params: this._params,
                        abort: false
                    });
                    if (inject.abort)
                        return;
                    break;
                case 7:
                    const handlers = this._csiHandlers[this._collect << 8 | code];
                    let j = handlers ? handlers.length - 1 : -1;
                    for (; j >= 0; j--) {
                        handlerResult = handlers[j](this._params);
                        if (handlerResult === true) {
                            break;
                        }
                        else if (handlerResult instanceof Promise) {
                            this._preserveStack(3, handlers, j, transition, i);
                            return handlerResult;
                        }
                    }
                    if (j < 0) {
                        this._csiHandlerFb(this._collect << 8 | code, this._params);
                    }
                    this.precedingJoinState = 0;
                    break;
                case 8:
                    do {
                        switch (code) {
                            case 0x3b:
                                this._params.addParam(0);
                                break;
                            case 0x3a:
                                this._params.addSubParam(-1);
                                break;
                            default:
                                this._params.addDigit(code - 48);
                        }
                    } while (++i < length && (code = data[i]) > 0x2f && code < 0x3c);
                    i--;
                    break;
                case 9:
                    this._collect <<= 8;
                    this._collect |= code;
                    break;
                case 10:
                    const handlersEsc = this._escHandlers[this._collect << 8 | code];
                    let jj = handlersEsc ? handlersEsc.length - 1 : -1;
                    for (; jj >= 0; jj--) {
                        handlerResult = handlersEsc[jj]();
                        if (handlerResult === true) {
                            break;
                        }
                        else if (handlerResult instanceof Promise) {
                            this._preserveStack(4, handlersEsc, jj, transition, i);
                            return handlerResult;
                        }
                    }
                    if (jj < 0) {
                        this._escHandlerFb(this._collect << 8 | code);
                    }
                    this.precedingJoinState = 0;
                    break;
                case 11:
                    this._params.reset();
                    this._params.addParam(0);
                    this._collect = 0;
                    break;
                case 12:
                    this._dcsParser.hook(this._collect << 8 | code, this._params);
                    break;
                case 13:
                    for (let j = i + 1;; ++j) {
                        if (j >= length || (code = data[j]) === 0x18 || code === 0x1a || code === 0x1b || (code > 0x7f && code < NON_ASCII_PRINTABLE)) {
                            this._dcsParser.put(data, i, j);
                            i = j - 1;
                            break;
                        }
                    }
                    break;
                case 14:
                    handlerResult = this._dcsParser.unhook(code !== 0x18 && code !== 0x1a);
                    if (handlerResult) {
                        this._preserveStack(6, [], 0, transition, i);
                        return handlerResult;
                    }
                    if (code === 0x1b)
                        transition |= 1;
                    this._params.reset();
                    this._params.addParam(0);
                    this._collect = 0;
                    this.precedingJoinState = 0;
                    break;
                case 4:
                    this._oscParser.start();
                    break;
                case 5:
                    for (let j = i + 1;; j++) {
                        if (j >= length || (code = data[j]) < 0x20 || (code > 0x7f && code < NON_ASCII_PRINTABLE)) {
                            this._oscParser.put(data, i, j);
                            i = j - 1;
                            break;
                        }
                    }
                    break;
                case 6:
                    handlerResult = this._oscParser.end(code !== 0x18 && code !== 0x1a);
                    if (handlerResult) {
                        this._preserveStack(5, [], 0, transition, i);
                        return handlerResult;
                    }
                    if (code === 0x1b)
                        transition |= 1;
                    this._params.reset();
                    this._params.addParam(0);
                    this._collect = 0;
                    this.precedingJoinState = 0;
                    break;
            }
            this.currentState = transition & 15;
        }
    }
}
exports.EscapeSequenceParser = EscapeSequenceParser;
//# sourceMappingURL=EscapeSequenceParser.js.map