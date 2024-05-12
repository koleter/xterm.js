"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OscHandler = exports.OscParser = void 0;
const Constants_1 = require("common/parser/Constants");
const TextDecoder_1 = require("common/input/TextDecoder");
const EMPTY_HANDLERS = [];
class OscParser {
    constructor() {
        this._state = 0;
        this._active = EMPTY_HANDLERS;
        this._id = -1;
        this._handlers = Object.create(null);
        this._handlerFb = () => { };
        this._stack = {
            paused: false,
            loopPosition: 0,
            fallThrough: false
        };
    }
    registerHandler(ident, handler) {
        if (this._handlers[ident] === undefined) {
            this._handlers[ident] = [];
        }
        const handlerList = this._handlers[ident];
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
    clearHandler(ident) {
        if (this._handlers[ident])
            delete this._handlers[ident];
    }
    setHandlerFallback(handler) {
        this._handlerFb = handler;
    }
    dispose() {
        this._handlers = Object.create(null);
        this._handlerFb = () => { };
        this._active = EMPTY_HANDLERS;
    }
    reset() {
        if (this._state === 2) {
            for (let j = this._stack.paused ? this._stack.loopPosition - 1 : this._active.length - 1; j >= 0; --j) {
                this._active[j].end(false);
            }
        }
        this._stack.paused = false;
        this._active = EMPTY_HANDLERS;
        this._id = -1;
        this._state = 0;
    }
    _start() {
        this._active = this._handlers[this._id] || EMPTY_HANDLERS;
        if (!this._active.length) {
            this._handlerFb(this._id, 'START');
        }
        else {
            for (let j = this._active.length - 1; j >= 0; j--) {
                this._active[j].start();
            }
        }
    }
    _put(data, start, end) {
        if (!this._active.length) {
            this._handlerFb(this._id, 'PUT', (0, TextDecoder_1.utf32ToString)(data, start, end));
        }
        else {
            for (let j = this._active.length - 1; j >= 0; j--) {
                this._active[j].put(data, start, end);
            }
        }
    }
    start() {
        this.reset();
        this._state = 1;
    }
    put(data, start, end) {
        if (this._state === 3) {
            return;
        }
        if (this._state === 1) {
            while (start < end) {
                const code = data[start++];
                if (code === 0x3b) {
                    this._state = 2;
                    this._start();
                    break;
                }
                if (code < 0x30 || 0x39 < code) {
                    this._state = 3;
                    return;
                }
                if (this._id === -1) {
                    this._id = 0;
                }
                this._id = this._id * 10 + code - 48;
            }
        }
        if (this._state === 2 && end - start > 0) {
            this._put(data, start, end);
        }
    }
    end(success, promiseResult = true) {
        if (this._state === 0) {
            return;
        }
        if (this._state !== 3) {
            if (this._state === 1) {
                this._start();
            }
            if (!this._active.length) {
                this._handlerFb(this._id, 'END', success);
            }
            else {
                let handlerResult = false;
                let j = this._active.length - 1;
                let fallThrough = false;
                if (this._stack.paused) {
                    j = this._stack.loopPosition - 1;
                    handlerResult = promiseResult;
                    fallThrough = this._stack.fallThrough;
                    this._stack.paused = false;
                }
                if (!fallThrough && handlerResult === false) {
                    for (; j >= 0; j--) {
                        handlerResult = this._active[j].end(success);
                        if (handlerResult === true) {
                            break;
                        }
                        else if (handlerResult instanceof Promise) {
                            this._stack.paused = true;
                            this._stack.loopPosition = j;
                            this._stack.fallThrough = false;
                            return handlerResult;
                        }
                    }
                    j--;
                }
                for (; j >= 0; j--) {
                    handlerResult = this._active[j].end(false);
                    if (handlerResult instanceof Promise) {
                        this._stack.paused = true;
                        this._stack.loopPosition = j;
                        this._stack.fallThrough = true;
                        return handlerResult;
                    }
                }
            }
        }
        this._active = EMPTY_HANDLERS;
        this._id = -1;
        this._state = 0;
    }
}
exports.OscParser = OscParser;
class OscHandler {
    constructor(_handler) {
        this._handler = _handler;
        this._data = '';
        this._hitLimit = false;
    }
    start() {
        this._data = '';
        this._hitLimit = false;
    }
    put(data, start, end) {
        if (this._hitLimit) {
            return;
        }
        this._data += (0, TextDecoder_1.utf32ToString)(data, start, end);
        if (this._data.length > Constants_1.PAYLOAD_LIMIT) {
            this._data = '';
            this._hitLimit = true;
        }
    }
    end(success) {
        let ret = false;
        if (this._hitLimit) {
            ret = false;
        }
        else if (success) {
            ret = this._handler(this._data);
            if (ret instanceof Promise) {
                return ret.then(res => {
                    this._data = '';
                    this._hitLimit = false;
                    return res;
                });
            }
        }
        this._data = '';
        this._hitLimit = false;
        return ret;
    }
}
exports.OscHandler = OscHandler;
//# sourceMappingURL=OscParser.js.map