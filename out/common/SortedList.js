"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SortedList = void 0;
let i = 0;
class SortedList {
    constructor(_getKey) {
        this._getKey = _getKey;
        this._array = [];
    }
    clear() {
        this._array.length = 0;
    }
    insert(value) {
        if (this._array.length === 0) {
            this._array.push(value);
            return;
        }
        i = this._search(this._getKey(value));
        this._array.splice(i, 0, value);
    }
    delete(value) {
        if (this._array.length === 0) {
            return false;
        }
        const key = this._getKey(value);
        if (key === undefined) {
            return false;
        }
        i = this._search(key);
        if (i === -1) {
            return false;
        }
        if (this._getKey(this._array[i]) !== key) {
            return false;
        }
        do {
            if (this._array[i] === value) {
                this._array.splice(i, 1);
                return true;
            }
        } while (++i < this._array.length && this._getKey(this._array[i]) === key);
        return false;
    }
    *getKeyIterator(key) {
        if (this._array.length === 0) {
            return;
        }
        i = this._search(key);
        if (i < 0 || i >= this._array.length) {
            return;
        }
        if (this._getKey(this._array[i]) !== key) {
            return;
        }
        do {
            yield this._array[i];
        } while (++i < this._array.length && this._getKey(this._array[i]) === key);
    }
    forEachByKey(key, callback) {
        if (this._array.length === 0) {
            return;
        }
        i = this._search(key);
        if (i < 0 || i >= this._array.length) {
            return;
        }
        if (this._getKey(this._array[i]) !== key) {
            return;
        }
        do {
            callback(this._array[i]);
        } while (++i < this._array.length && this._getKey(this._array[i]) === key);
    }
    values() {
        return [...this._array].values();
    }
    _search(key) {
        let min = 0;
        let max = this._array.length - 1;
        while (max >= min) {
            let mid = (min + max) >> 1;
            const midKey = this._getKey(this._array[mid]);
            if (midKey > key) {
                max = mid - 1;
            }
            else if (midKey < key) {
                min = mid + 1;
            }
            else {
                while (mid > 0 && this._getKey(this._array[mid - 1]) === key) {
                    mid--;
                }
                return mid;
            }
        }
        return min;
    }
}
exports.SortedList = SortedList;
//# sourceMappingURL=SortedList.js.map