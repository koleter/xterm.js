"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WriteBuffer = void 0;
const EventEmitter_1 = require("common/EventEmitter");
const Lifecycle_1 = require("common/Lifecycle");
const DISCARD_WATERMARK = 50000000;
const WRITE_TIMEOUT_MS = 12;
const WRITE_BUFFER_LENGTH_THRESHOLD = 50;
class WriteBuffer extends Lifecycle_1.Disposable {
    constructor(_action) {
        super();
        this._action = _action;
        this._writeBuffer = [];
        this._callbacks = [];
        this._pendingData = 0;
        this._bufferOffset = 0;
        this._isSyncWriting = false;
        this._syncCalls = 0;
        this._didUserInput = false;
        this._onWriteParsed = this.register(new EventEmitter_1.EventEmitter());
        this.onWriteParsed = this._onWriteParsed.event;
    }
    handleUserInput() {
        this._didUserInput = true;
    }
    writeSync(data, maxSubsequentCalls) {
        if (maxSubsequentCalls !== undefined && this._syncCalls > maxSubsequentCalls) {
            this._syncCalls = 0;
            return;
        }
        this._pendingData += data.length;
        this._writeBuffer.push(data);
        this._callbacks.push(undefined);
        this._syncCalls++;
        if (this._isSyncWriting) {
            return;
        }
        this._isSyncWriting = true;
        let chunk;
        while (chunk = this._writeBuffer.shift()) {
            this._action(chunk);
            const cb = this._callbacks.shift();
            if (cb)
                cb();
        }
        this._pendingData = 0;
        this._bufferOffset = 0x7FFFFFFF;
        this._isSyncWriting = false;
        this._syncCalls = 0;
    }
    write(data, callback) {
        if (this._pendingData > DISCARD_WATERMARK) {
            throw new Error('write data discarded, use flow control to avoid losing data');
        }
        if (!this._writeBuffer.length) {
            this._bufferOffset = 0;
            if (this._didUserInput) {
                this._didUserInput = false;
                this._pendingData += data.length;
                this._writeBuffer.push(data);
                this._callbacks.push(callback);
                this._innerWrite();
                return;
            }
            setTimeout(() => this._innerWrite());
        }
        this._pendingData += data.length;
        this._writeBuffer.push(data);
        this._callbacks.push(callback);
    }
    _innerWrite(lastTime = 0, promiseResult = true) {
        const startTime = lastTime || Date.now();
        while (this._writeBuffer.length > this._bufferOffset) {
            const data = this._writeBuffer[this._bufferOffset];
            const result = this._action(data, promiseResult);
            if (result) {
                const continuation = (r) => Date.now() - startTime >= WRITE_TIMEOUT_MS
                    ? setTimeout(() => this._innerWrite(0, r))
                    : this._innerWrite(startTime, r);
                result.catch(err => {
                    queueMicrotask(() => { throw err; });
                    return Promise.resolve(false);
                }).then(continuation);
                return;
            }
            const cb = this._callbacks[this._bufferOffset];
            if (cb)
                cb();
            this._bufferOffset++;
            this._pendingData -= data.length;
            if (Date.now() - startTime >= WRITE_TIMEOUT_MS) {
                break;
            }
        }
        if (this._writeBuffer.length > this._bufferOffset) {
            if (this._bufferOffset > WRITE_BUFFER_LENGTH_THRESHOLD) {
                this._writeBuffer = this._writeBuffer.slice(this._bufferOffset);
                this._callbacks = this._callbacks.slice(this._bufferOffset);
                this._bufferOffset = 0;
            }
            setTimeout(() => this._innerWrite());
        }
        else {
            this._writeBuffer.length = 0;
            this._callbacks.length = 0;
            this._pendingData = 0;
            this._bufferOffset = 0;
        }
        this._onWriteParsed.fire();
    }
}
exports.WriteBuffer = WriteBuffer;
//# sourceMappingURL=WriteBuffer.js.map