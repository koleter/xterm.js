"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DebouncedIdleTask = exports.IdleTaskQueue = exports.PriorityTaskQueue = void 0;
const Platform_1 = require("common/Platform");
class TaskQueue {
    constructor() {
        this._tasks = [];
        this._i = 0;
    }
    enqueue(task) {
        this._tasks.push(task);
        this._start();
    }
    flush() {
        while (this._i < this._tasks.length) {
            if (!this._tasks[this._i]()) {
                this._i++;
            }
        }
        this.clear();
    }
    clear() {
        if (this._idleCallback) {
            this._cancelCallback(this._idleCallback);
            this._idleCallback = undefined;
        }
        this._i = 0;
        this._tasks.length = 0;
    }
    _start() {
        if (!this._idleCallback) {
            this._idleCallback = this._requestCallback(this._process.bind(this));
        }
    }
    _process(deadline) {
        this._idleCallback = undefined;
        let taskDuration = 0;
        let longestTask = 0;
        let lastDeadlineRemaining = deadline.timeRemaining();
        let deadlineRemaining = 0;
        while (this._i < this._tasks.length) {
            taskDuration = Date.now();
            if (!this._tasks[this._i]()) {
                this._i++;
            }
            taskDuration = Math.max(1, Date.now() - taskDuration);
            longestTask = Math.max(taskDuration, longestTask);
            deadlineRemaining = deadline.timeRemaining();
            if (longestTask * 1.5 > deadlineRemaining) {
                if (lastDeadlineRemaining - taskDuration < -20) {
                    console.warn(`task queue exceeded allotted deadline by ${Math.abs(Math.round(lastDeadlineRemaining - taskDuration))}ms`);
                }
                this._start();
                return;
            }
            lastDeadlineRemaining = deadlineRemaining;
        }
        this.clear();
    }
}
class PriorityTaskQueue extends TaskQueue {
    _requestCallback(callback) {
        return setTimeout(() => callback(this._createDeadline(16)));
    }
    _cancelCallback(identifier) {
        clearTimeout(identifier);
    }
    _createDeadline(duration) {
        const end = Date.now() + duration;
        return {
            timeRemaining: () => Math.max(0, end - Date.now())
        };
    }
}
exports.PriorityTaskQueue = PriorityTaskQueue;
class IdleTaskQueueInternal extends TaskQueue {
    _requestCallback(callback) {
        return requestIdleCallback(callback);
    }
    _cancelCallback(identifier) {
        cancelIdleCallback(identifier);
    }
}
exports.IdleTaskQueue = (!Platform_1.isNode && 'requestIdleCallback' in window) ? IdleTaskQueueInternal : PriorityTaskQueue;
class DebouncedIdleTask {
    constructor() {
        this._queue = new exports.IdleTaskQueue();
    }
    set(task) {
        this._queue.clear();
        this._queue.enqueue(task);
    }
    flush() {
        this._queue.flush();
    }
}
exports.DebouncedIdleTask = DebouncedIdleTask;
//# sourceMappingURL=TaskQueue.js.map