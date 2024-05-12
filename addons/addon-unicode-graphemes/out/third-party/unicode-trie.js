"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tiny_inflate_1 = require("./tiny-inflate");
const SHIFT_1 = 6 + 5;
const SHIFT_2 = 5;
const SHIFT_1_2 = SHIFT_1 - SHIFT_2;
const OMITTED_BMP_INDEX_1_LENGTH = 0x10000 >> SHIFT_1;
const INDEX_2_BLOCK_LENGTH = 1 << SHIFT_1_2;
const INDEX_2_MASK = INDEX_2_BLOCK_LENGTH - 1;
const INDEX_SHIFT = 2;
const DATA_BLOCK_LENGTH = 1 << SHIFT_2;
const DATA_MASK = DATA_BLOCK_LENGTH - 1;
const LSCP_INDEX_2_OFFSET = 0x10000 >> SHIFT_2;
const LSCP_INDEX_2_LENGTH = 0x400 >> SHIFT_2;
const INDEX_2_BMP_LENGTH = LSCP_INDEX_2_OFFSET + LSCP_INDEX_2_LENGTH;
const UTF8_2B_INDEX_2_OFFSET = INDEX_2_BMP_LENGTH;
const UTF8_2B_INDEX_2_LENGTH = 0x800 >> 6;
const INDEX_1_OFFSET = UTF8_2B_INDEX_2_OFFSET + UTF8_2B_INDEX_2_LENGTH;
const DATA_GRANULARITY = 1 << INDEX_SHIFT;
const isBigEndian = (new Uint8Array(new Uint32Array([0x12345678]).buffer)[0] === 0x12);
class UnicodeTrie {
    constructor(data) {
        const view = new DataView(data.buffer);
        this.highStart = view.getUint32(0, true);
        this.errorValue = view.getUint32(4, true);
        let uncompressedLength = view.getUint32(8, true);
        data = data.subarray(12);
        data = (0, tiny_inflate_1.default)(data, new Uint8Array(uncompressedLength));
        data = (0, tiny_inflate_1.default)(data, new Uint8Array(uncompressedLength));
        if (isBigEndian) {
            const len = data.length;
            for (let i = 0; i < len; i += 4) {
                let x = data[i];
                data[i] = data[i + 3];
                data[i + 3] = x;
                let y = data[i + 1];
                data[i + 1] = data[i + 2];
                data[i + 2] = y;
            }
        }
        this.data = new Uint32Array(data.buffer);
    }
    get(codePoint) {
        let index;
        if ((codePoint < 0) || (codePoint > 0x10ffff)) {
            return this.errorValue;
        }
        if ((codePoint < 0xd800) || ((codePoint > 0xdbff) && (codePoint <= 0xffff))) {
            index = (this.data[codePoint >> SHIFT_2] << INDEX_SHIFT) + (codePoint & DATA_MASK);
            return this.data[index];
        }
        if (codePoint <= 0xffff) {
            index = (this.data[LSCP_INDEX_2_OFFSET + ((codePoint - 0xd800) >> SHIFT_2)] << INDEX_SHIFT) + (codePoint & DATA_MASK);
            return this.data[index];
        }
        if (codePoint < this.highStart) {
            index = this.data[(INDEX_1_OFFSET - OMITTED_BMP_INDEX_1_LENGTH) + (codePoint >> SHIFT_1)];
            index = this.data[index + ((codePoint >> SHIFT_2) & INDEX_2_MASK)];
            index = (index << INDEX_SHIFT) + (codePoint & DATA_MASK);
            return this.data[index];
        }
        return this.data[this.data.length - DATA_GRANULARITY];
    }
}
exports.default = UnicodeTrie;
//# sourceMappingURL=unicode-trie.js.map