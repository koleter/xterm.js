"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const Constants_1 = require("common/buffer/Constants");
const BufferLine_1 = require("common/buffer//BufferLine");
const CellData_1 = require("common/buffer/CellData");
const chai_1 = require("chai");
const AttributeData_1 = require("common/buffer/AttributeData");
class TestBufferLine extends BufferLine_1.BufferLine {
    get combined() {
        return this._combined;
    }
    toArray() {
        const result = [];
        for (let i = 0; i < this.length; ++i) {
            result.push(this.loadCell(i, new CellData_1.CellData()).getAsCharData());
        }
        return result;
    }
}
describe('AttributeData', () => {
    describe('extended attributes', () => {
        it('hasExtendedAttrs', () => {
            const attrs = new AttributeData_1.AttributeData();
            chai_1.assert.equal(!!attrs.hasExtendedAttrs(), false);
            attrs.bg |= 268435456;
            chai_1.assert.equal(!!attrs.hasExtendedAttrs(), true);
        });
        it('getUnderlineColor - P256', () => {
            const attrs = new AttributeData_1.AttributeData();
            attrs.extended.underlineColor = 33554432 | 45;
            chai_1.assert.equal(attrs.getUnderlineColor(), -1);
            attrs.bg |= 268435456;
            chai_1.assert.equal(attrs.getUnderlineColor(), 45);
            attrs.extended.underlineColor = 0;
            attrs.fg |= 33554432 | 123;
            chai_1.assert.equal(attrs.getUnderlineColor(), 123);
        });
        it('getUnderlineColor - RGB', () => {
            const attrs = new AttributeData_1.AttributeData();
            attrs.extended.underlineColor = 50331648 | (1 << 16) | (2 << 8) | 3;
            chai_1.assert.equal(attrs.getUnderlineColor(), -1);
            attrs.bg |= 268435456;
            chai_1.assert.equal(attrs.getUnderlineColor(), (1 << 16) | (2 << 8) | 3);
            attrs.extended.underlineColor = 0;
            attrs.fg |= 33554432 | 123;
            chai_1.assert.equal(attrs.getUnderlineColor(), 123);
        });
        it('getUnderlineColorMode / isUnderlineColorRGB / isUnderlineColorPalette / isUnderlineColorDefault', () => {
            const attrs = new AttributeData_1.AttributeData();
            for (const mode of [0, 16777216, 33554432, 50331648]) {
                attrs.extended.underlineColor = mode;
                chai_1.assert.equal(attrs.getUnderlineColorMode(), attrs.getFgColorMode());
                chai_1.assert.equal(attrs.isUnderlineColorDefault(), true);
            }
            attrs.fg = 50331648;
            for (const mode of [0, 16777216, 33554432, 50331648]) {
                attrs.extended.underlineColor = mode;
                chai_1.assert.equal(attrs.getUnderlineColorMode(), attrs.getFgColorMode());
                chai_1.assert.equal(attrs.isUnderlineColorDefault(), false);
                chai_1.assert.equal(attrs.isUnderlineColorRGB(), true);
            }
            attrs.bg |= 268435456;
            attrs.extended.underlineColor = 0;
            chai_1.assert.equal(attrs.getUnderlineColorMode(), 0);
            attrs.extended.underlineColor = 16777216;
            chai_1.assert.equal(attrs.getUnderlineColorMode(), 16777216);
            chai_1.assert.equal(attrs.isUnderlineColorPalette(), true);
            attrs.extended.underlineColor = 33554432;
            chai_1.assert.equal(attrs.getUnderlineColorMode(), 33554432);
            chai_1.assert.equal(attrs.isUnderlineColorPalette(), true);
            attrs.extended.underlineColor = 50331648;
            chai_1.assert.equal(attrs.getUnderlineColorMode(), 50331648);
            chai_1.assert.equal(attrs.isUnderlineColorRGB(), true);
        });
        it('getUnderlineStyle', () => {
            const attrs = new AttributeData_1.AttributeData();
            chai_1.assert.equal(attrs.getUnderlineStyle(), 0);
            attrs.extended.underlineStyle = 3;
            chai_1.assert.equal(attrs.getUnderlineStyle(), 0);
            attrs.fg |= 268435456;
            chai_1.assert.equal(attrs.getUnderlineStyle(), 1);
            attrs.bg |= 268435456;
            chai_1.assert.equal(attrs.getUnderlineStyle(), 3);
            attrs.fg &= ~268435456;
            chai_1.assert.equal(attrs.getUnderlineStyle(), 0);
        });
        it('getUnderlineVariantOffset', () => {
            const attrs = new AttributeData_1.AttributeData();
            chai_1.assert.equal(attrs.getUnderlineVariantOffset(), 0);
            for (let i = 0; i < 8; ++i) {
                attrs.extended.underlineVariantOffset = i;
                chai_1.assert.equal(attrs.getUnderlineVariantOffset(), i);
            }
        });
    });
});
describe('CellData', () => {
    it('CharData <--> CellData equality', () => {
        const cell = new CellData_1.CellData();
        cell.setFromCharData([123, 'a', 1, 'a'.charCodeAt(0)]);
        chai_1.assert.deepEqual(cell.getAsCharData(), [123, 'a', 1, 'a'.charCodeAt(0)]);
        chai_1.assert.equal(cell.isCombined(), 0);
        cell.setFromCharData([123, 'e\u0301', 1, '\u0301'.charCodeAt(0)]);
        chai_1.assert.deepEqual(cell.getAsCharData(), [123, 'e\u0301', 1, '\u0301'.charCodeAt(0)]);
        chai_1.assert.equal(cell.isCombined(), 2097152);
        cell.setFromCharData([123, '𝄞', 1, 0x1D11E]);
        chai_1.assert.deepEqual(cell.getAsCharData(), [123, '𝄞', 1, 0x1D11E]);
        chai_1.assert.equal(cell.isCombined(), 0);
        cell.setFromCharData([123, '𓂀\u0301', 1, '𓂀\u0301'.charCodeAt(2)]);
        chai_1.assert.deepEqual(cell.getAsCharData(), [123, '𓂀\u0301', 1, '𓂀\u0301'.charCodeAt(2)]);
        chai_1.assert.equal(cell.isCombined(), 2097152);
        cell.setFromCharData([123, '１', 2, '１'.charCodeAt(0)]);
        chai_1.assert.deepEqual(cell.getAsCharData(), [123, '１', 2, '１'.charCodeAt(0)]);
        chai_1.assert.equal(cell.isCombined(), 0);
    });
});
describe('BufferLine', function () {
    it('ctor', function () {
        let line = new TestBufferLine(0);
        chai_1.assert.equal(line.length, 0);
        chai_1.assert.equal(line.isWrapped, false);
        line = new TestBufferLine(10);
        chai_1.assert.equal(line.length, 10);
        chai_1.assert.deepEqual(line.loadCell(0, new CellData_1.CellData()).getAsCharData(), [0, Constants_1.NULL_CELL_CHAR, Constants_1.NULL_CELL_WIDTH, Constants_1.NULL_CELL_CODE]);
        chai_1.assert.equal(line.isWrapped, false);
        line = new TestBufferLine(10, undefined, true);
        chai_1.assert.equal(line.length, 10);
        chai_1.assert.deepEqual(line.loadCell(0, new CellData_1.CellData()).getAsCharData(), [0, Constants_1.NULL_CELL_CHAR, Constants_1.NULL_CELL_WIDTH, Constants_1.NULL_CELL_CODE]);
        chai_1.assert.equal(line.isWrapped, true);
        line = new TestBufferLine(10, CellData_1.CellData.fromCharData([123, 'a', 456, 'a'.charCodeAt(0)]), true);
        chai_1.assert.equal(line.length, 10);
        chai_1.assert.deepEqual(line.loadCell(0, new CellData_1.CellData()).getAsCharData(), [123, 'a', 456, 'a'.charCodeAt(0)]);
        chai_1.assert.equal(line.isWrapped, true);
    });
    it('insertCells', function () {
        const line = new TestBufferLine(3);
        line.setCell(0, CellData_1.CellData.fromCharData([1, 'a', 0, 'a'.charCodeAt(0)]));
        line.setCell(1, CellData_1.CellData.fromCharData([2, 'b', 0, 'b'.charCodeAt(0)]));
        line.setCell(2, CellData_1.CellData.fromCharData([3, 'c', 0, 'c'.charCodeAt(0)]));
        line.insertCells(1, 3, CellData_1.CellData.fromCharData([4, 'd', 0, 'd'.charCodeAt(0)]));
        chai_1.assert.deepEqual(line.toArray(), [
            [1, 'a', 0, 'a'.charCodeAt(0)],
            [4, 'd', 0, 'd'.charCodeAt(0)],
            [4, 'd', 0, 'd'.charCodeAt(0)]
        ]);
    });
    it('deleteCells', function () {
        const line = new TestBufferLine(5);
        line.setCell(0, CellData_1.CellData.fromCharData([1, 'a', 0, 'a'.charCodeAt(0)]));
        line.setCell(1, CellData_1.CellData.fromCharData([2, 'b', 0, 'b'.charCodeAt(0)]));
        line.setCell(2, CellData_1.CellData.fromCharData([3, 'c', 0, 'c'.charCodeAt(0)]));
        line.setCell(3, CellData_1.CellData.fromCharData([4, 'd', 0, 'd'.charCodeAt(0)]));
        line.setCell(4, CellData_1.CellData.fromCharData([5, 'e', 0, 'e'.charCodeAt(0)]));
        line.deleteCells(1, 2, CellData_1.CellData.fromCharData([6, 'f', 0, 'f'.charCodeAt(0)]));
        chai_1.assert.deepEqual(line.toArray(), [
            [1, 'a', 0, 'a'.charCodeAt(0)],
            [4, 'd', 0, 'd'.charCodeAt(0)],
            [5, 'e', 0, 'e'.charCodeAt(0)],
            [6, 'f', 0, 'f'.charCodeAt(0)],
            [6, 'f', 0, 'f'.charCodeAt(0)]
        ]);
    });
    it('replaceCells', function () {
        const line = new TestBufferLine(5);
        line.setCell(0, CellData_1.CellData.fromCharData([1, 'a', 0, 'a'.charCodeAt(0)]));
        line.setCell(1, CellData_1.CellData.fromCharData([2, 'b', 0, 'b'.charCodeAt(0)]));
        line.setCell(2, CellData_1.CellData.fromCharData([3, 'c', 0, 'c'.charCodeAt(0)]));
        line.setCell(3, CellData_1.CellData.fromCharData([4, 'd', 0, 'd'.charCodeAt(0)]));
        line.setCell(4, CellData_1.CellData.fromCharData([5, 'e', 0, 'e'.charCodeAt(0)]));
        line.replaceCells(2, 4, CellData_1.CellData.fromCharData([6, 'f', 0, 'f'.charCodeAt(0)]));
        chai_1.assert.deepEqual(line.toArray(), [
            [1, 'a', 0, 'a'.charCodeAt(0)],
            [2, 'b', 0, 'b'.charCodeAt(0)],
            [6, 'f', 0, 'f'.charCodeAt(0)],
            [6, 'f', 0, 'f'.charCodeAt(0)],
            [5, 'e', 0, 'e'.charCodeAt(0)]
        ]);
    });
    it('fill', function () {
        const line = new TestBufferLine(5);
        line.setCell(0, CellData_1.CellData.fromCharData([1, 'a', 0, 'a'.charCodeAt(0)]));
        line.setCell(1, CellData_1.CellData.fromCharData([2, 'b', 0, 'b'.charCodeAt(0)]));
        line.setCell(2, CellData_1.CellData.fromCharData([3, 'c', 0, 'c'.charCodeAt(0)]));
        line.setCell(3, CellData_1.CellData.fromCharData([4, 'd', 0, 'd'.charCodeAt(0)]));
        line.setCell(4, CellData_1.CellData.fromCharData([5, 'e', 0, 'e'.charCodeAt(0)]));
        line.fill(CellData_1.CellData.fromCharData([123, 'z', 0, 'z'.charCodeAt(0)]));
        chai_1.assert.deepEqual(line.toArray(), [
            [123, 'z', 0, 'z'.charCodeAt(0)],
            [123, 'z', 0, 'z'.charCodeAt(0)],
            [123, 'z', 0, 'z'.charCodeAt(0)],
            [123, 'z', 0, 'z'.charCodeAt(0)],
            [123, 'z', 0, 'z'.charCodeAt(0)]
        ]);
    });
    it('clone', function () {
        const line = new TestBufferLine(5, undefined, true);
        line.setCell(0, CellData_1.CellData.fromCharData([1, 'a', 0, 'a'.charCodeAt(0)]));
        line.setCell(1, CellData_1.CellData.fromCharData([2, 'b', 0, 'b'.charCodeAt(0)]));
        line.setCell(2, CellData_1.CellData.fromCharData([3, 'c', 0, 'c'.charCodeAt(0)]));
        line.setCell(3, CellData_1.CellData.fromCharData([4, 'd', 0, 'd'.charCodeAt(0)]));
        line.setCell(4, CellData_1.CellData.fromCharData([5, 'e', 0, 'e'.charCodeAt(0)]));
        const line2 = line.clone();
        chai_1.assert.deepEqual(TestBufferLine.prototype.toArray.apply(line2), line.toArray());
        chai_1.assert.equal(line2.length, line.length);
        chai_1.assert.equal(line2.isWrapped, line.isWrapped);
    });
    it('copyFrom', function () {
        const line = new TestBufferLine(5);
        line.setCell(0, CellData_1.CellData.fromCharData([1, 'a', 0, 'a'.charCodeAt(0)]));
        line.setCell(1, CellData_1.CellData.fromCharData([2, 'b', 0, 'b'.charCodeAt(0)]));
        line.setCell(2, CellData_1.CellData.fromCharData([3, 'c', 0, 'c'.charCodeAt(0)]));
        line.setCell(3, CellData_1.CellData.fromCharData([4, 'd', 0, 'd'.charCodeAt(0)]));
        line.setCell(4, CellData_1.CellData.fromCharData([5, 'e', 0, 'e'.charCodeAt(0)]));
        const line2 = new TestBufferLine(5, CellData_1.CellData.fromCharData([1, 'a', 0, 'a'.charCodeAt(0)]), true);
        line2.copyFrom(line);
        chai_1.assert.deepEqual(line2.toArray(), line.toArray());
        chai_1.assert.equal(line2.length, line.length);
        chai_1.assert.equal(line2.isWrapped, line.isWrapped);
    });
    it('should support combining chars', function () {
        const line = new TestBufferLine(2, CellData_1.CellData.fromCharData([1, 'e\u0301', 0, '\u0301'.charCodeAt(0)]));
        chai_1.assert.deepEqual(line.toArray(), [[1, 'e\u0301', 0, '\u0301'.charCodeAt(0)], [1, 'e\u0301', 0, '\u0301'.charCodeAt(0)]]);
        const line2 = new TestBufferLine(5, CellData_1.CellData.fromCharData([1, 'a', 0, '\u0301'.charCodeAt(0)]), true);
        line2.copyFrom(line);
        chai_1.assert.deepEqual(line2.toArray(), line.toArray());
        const line3 = line.clone();
        chai_1.assert.deepEqual(TestBufferLine.prototype.toArray.apply(line3), line.toArray());
    });
    describe('resize', function () {
        it('enlarge(false)', function () {
            const line = new TestBufferLine(5, CellData_1.CellData.fromCharData([1, 'a', 0, 'a'.charCodeAt(0)]), false);
            line.resize(10, CellData_1.CellData.fromCharData([1, 'a', 0, 'a'.charCodeAt(0)]));
            chai_1.assert.deepEqual(line.toArray(), Array(10).fill([1, 'a', 0, 'a'.charCodeAt(0)]));
        });
        it('enlarge(true)', function () {
            const line = new TestBufferLine(5, CellData_1.CellData.fromCharData([1, 'a', 0, 'a'.charCodeAt(0)]), false);
            line.resize(10, CellData_1.CellData.fromCharData([1, 'a', 0, 'a'.charCodeAt(0)]));
            chai_1.assert.deepEqual(line.toArray(), Array(10).fill([1, 'a', 0, 'a'.charCodeAt(0)]));
        });
        it('shrink(true) - should apply new size', function () {
            const line = new TestBufferLine(10, CellData_1.CellData.fromCharData([1, 'a', 0, 'a'.charCodeAt(0)]), false);
            line.resize(5, CellData_1.CellData.fromCharData([1, 'a', 0, 'a'.charCodeAt(0)]));
            chai_1.assert.deepEqual(line.toArray(), Array(5).fill([1, 'a', 0, 'a'.charCodeAt(0)]));
        });
        it('shrink to 0 length', function () {
            const line = new TestBufferLine(10, CellData_1.CellData.fromCharData([1, 'a', 0, 'a'.charCodeAt(0)]), false);
            line.resize(0, CellData_1.CellData.fromCharData([1, 'a', 0, 'a'.charCodeAt(0)]));
            chai_1.assert.deepEqual(line.toArray(), Array(0).fill([1, 'a', 0, 'a'.charCodeAt(0)]));
        });
        it('should remove combining data on replaced cells after shrinking then enlarging', () => {
            const line = new TestBufferLine(10, CellData_1.CellData.fromCharData([1, 'a', 0, 'a'.charCodeAt(0)]), false);
            line.set(2, [0, '😁', 1, '😁'.charCodeAt(0)]);
            line.set(9, [0, '😁', 1, '😁'.charCodeAt(0)]);
            chai_1.assert.equal(line.translateToString(), 'aa😁aaaaaa😁');
            chai_1.assert.equal(Object.keys(line.combined).length, 2);
            line.resize(5, CellData_1.CellData.fromCharData([1, 'a', 0, 'a'.charCodeAt(0)]));
            chai_1.assert.equal(line.translateToString(), 'aa😁aa');
            line.resize(10, CellData_1.CellData.fromCharData([1, 'a', 0, 'a'.charCodeAt(0)]));
            chai_1.assert.equal(line.translateToString(), 'aa😁aaaaaaa');
            chai_1.assert.equal(Object.keys(line.combined).length, 1);
        });
    });
    describe('getTrimLength', function () {
        it('empty line', function () {
            const line = new TestBufferLine(10, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, Constants_1.NULL_CELL_CHAR, Constants_1.NULL_CELL_WIDTH, Constants_1.NULL_CELL_CODE]), false);
            chai_1.assert.equal(line.getTrimmedLength(), 0);
        });
        it('ASCII', function () {
            const line = new TestBufferLine(10, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, Constants_1.NULL_CELL_CHAR, Constants_1.NULL_CELL_WIDTH, Constants_1.NULL_CELL_CODE]), false);
            line.setCell(0, CellData_1.CellData.fromCharData([1, 'a', 1, 'a'.charCodeAt(0)]));
            line.setCell(2, CellData_1.CellData.fromCharData([1, 'a', 1, 'a'.charCodeAt(0)]));
            chai_1.assert.equal(line.getTrimmedLength(), 3);
        });
        it('surrogate', function () {
            const line = new TestBufferLine(10, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, Constants_1.NULL_CELL_CHAR, Constants_1.NULL_CELL_WIDTH, Constants_1.NULL_CELL_CODE]), false);
            line.setCell(0, CellData_1.CellData.fromCharData([1, 'a', 1, 'a'.charCodeAt(0)]));
            line.setCell(2, CellData_1.CellData.fromCharData([1, '𝄞', 1, '𝄞'.charCodeAt(0)]));
            chai_1.assert.equal(line.getTrimmedLength(), 3);
        });
        it('combining', function () {
            const line = new TestBufferLine(10, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, Constants_1.NULL_CELL_CHAR, Constants_1.NULL_CELL_WIDTH, Constants_1.NULL_CELL_CODE]), false);
            line.setCell(0, CellData_1.CellData.fromCharData([1, 'a', 1, 'a'.charCodeAt(0)]));
            line.setCell(2, CellData_1.CellData.fromCharData([1, 'e\u0301', 1, '\u0301'.charCodeAt(0)]));
            chai_1.assert.equal(line.getTrimmedLength(), 3);
        });
        it('fullwidth', function () {
            const line = new TestBufferLine(10, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, Constants_1.NULL_CELL_CHAR, Constants_1.NULL_CELL_WIDTH, Constants_1.NULL_CELL_CODE]), false);
            line.setCell(0, CellData_1.CellData.fromCharData([1, 'a', 1, 'a'.charCodeAt(0)]));
            line.setCell(2, CellData_1.CellData.fromCharData([1, '１', 2, '１'.charCodeAt(0)]));
            line.setCell(3, CellData_1.CellData.fromCharData([0, '', 0, 0]));
            chai_1.assert.equal(line.getTrimmedLength(), 4);
        });
    });
    describe('translateToString with and w\'o trimming', function () {
        it('empty line', function () {
            const line = new TestBufferLine(10, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, Constants_1.NULL_CELL_CHAR, Constants_1.NULL_CELL_WIDTH, Constants_1.NULL_CELL_CODE]), false);
            const columns = [];
            chai_1.assert.equal(line.translateToString(false, undefined, undefined, columns), '          ');
            chai_1.assert.deepEqual(columns, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
            chai_1.assert.equal(line.translateToString(true, undefined, undefined, columns), '');
            chai_1.assert.deepEqual(columns, [0]);
        });
        it('ASCII', function () {
            const columns = [];
            const line = new TestBufferLine(10, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, Constants_1.NULL_CELL_CHAR, Constants_1.NULL_CELL_WIDTH, Constants_1.NULL_CELL_CODE]), false);
            line.setCell(0, CellData_1.CellData.fromCharData([1, 'a', 1, 'a'.charCodeAt(0)]));
            line.setCell(2, CellData_1.CellData.fromCharData([1, 'a', 1, 'a'.charCodeAt(0)]));
            line.setCell(4, CellData_1.CellData.fromCharData([1, 'a', 1, 'a'.charCodeAt(0)]));
            line.setCell(5, CellData_1.CellData.fromCharData([1, 'a', 1, 'a'.charCodeAt(0)]));
            chai_1.assert.equal(line.translateToString(false, undefined, undefined, columns), 'a a aa    ');
            chai_1.assert.deepEqual(columns, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
            chai_1.assert.equal(line.translateToString(true, undefined, undefined, columns), 'a a aa');
            chai_1.assert.deepEqual(columns, [0, 1, 2, 3, 4, 5, 6]);
            for (const trimRight of [true, false]) {
                chai_1.assert.equal(line.translateToString(trimRight, 0, 5, columns), 'a a a');
                chai_1.assert.deepEqual(columns, [0, 1, 2, 3, 4, 5]);
                chai_1.assert.equal(line.translateToString(trimRight, 0, 4, columns), 'a a ');
                chai_1.assert.deepEqual(columns, [0, 1, 2, 3, 4]);
                chai_1.assert.equal(line.translateToString(trimRight, 0, 3, columns), 'a a');
                chai_1.assert.deepEqual(columns, [0, 1, 2, 3]);
            }
        });
        it('surrogate', function () {
            const columns = [];
            const line = new TestBufferLine(10, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, Constants_1.NULL_CELL_CHAR, Constants_1.NULL_CELL_WIDTH, Constants_1.NULL_CELL_CODE]), false);
            line.setCell(0, CellData_1.CellData.fromCharData([1, 'a', 1, 'a'.charCodeAt(0)]));
            line.setCell(2, CellData_1.CellData.fromCharData([1, '𝄞', 1, '𝄞'.charCodeAt(0)]));
            line.setCell(4, CellData_1.CellData.fromCharData([1, '𝄞', 1, '𝄞'.charCodeAt(0)]));
            line.setCell(5, CellData_1.CellData.fromCharData([1, '𝄞', 1, '𝄞'.charCodeAt(0)]));
            chai_1.assert.equal(line.translateToString(false, undefined, undefined, columns), 'a 𝄞 𝄞𝄞    ');
            chai_1.assert.deepEqual(columns, [0, 1, 2, 2, 3, 4, 4, 5, 5, 6, 7, 8, 9, 10]);
            chai_1.assert.equal(line.translateToString(true, undefined, undefined, columns), 'a 𝄞 𝄞𝄞');
            chai_1.assert.deepEqual(columns, [0, 1, 2, 2, 3, 4, 4, 5, 5, 6]);
            for (const trimRight of [true, false]) {
                chai_1.assert.equal(line.translateToString(trimRight, 0, 5, columns), 'a 𝄞 𝄞');
                chai_1.assert.deepEqual(columns, [0, 1, 2, 2, 3, 4, 4, 5]);
                chai_1.assert.equal(line.translateToString(trimRight, 0, 4, columns), 'a 𝄞 ');
                chai_1.assert.deepEqual(columns, [0, 1, 2, 2, 3, 4]);
                chai_1.assert.equal(line.translateToString(trimRight, 0, 3, columns), 'a 𝄞');
                chai_1.assert.deepEqual(columns, [0, 1, 2, 2, 3]);
            }
        });
        it('combining', function () {
            const columns = [];
            const line = new TestBufferLine(10, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, Constants_1.NULL_CELL_CHAR, Constants_1.NULL_CELL_WIDTH, Constants_1.NULL_CELL_CODE]), false);
            line.setCell(0, CellData_1.CellData.fromCharData([1, 'a', 1, 'a'.charCodeAt(0)]));
            line.setCell(2, CellData_1.CellData.fromCharData([1, 'e\u0301', 1, '\u0301'.charCodeAt(0)]));
            line.setCell(4, CellData_1.CellData.fromCharData([1, 'e\u0301', 1, '\u0301'.charCodeAt(0)]));
            line.setCell(5, CellData_1.CellData.fromCharData([1, 'e\u0301', 1, '\u0301'.charCodeAt(0)]));
            chai_1.assert.equal(line.translateToString(false, undefined, undefined, columns), 'a e\u0301 e\u0301e\u0301    ');
            chai_1.assert.deepEqual(columns, [0, 1, 2, 2, 3, 4, 4, 5, 5, 6, 7, 8, 9, 10]);
            chai_1.assert.equal(line.translateToString(true, undefined, undefined, columns), 'a e\u0301 e\u0301e\u0301');
            chai_1.assert.deepEqual(columns, [0, 1, 2, 2, 3, 4, 4, 5, 5, 6]);
            for (const trimRight of [true, false]) {
                chai_1.assert.equal(line.translateToString(trimRight, 0, 5, columns), 'a e\u0301 e\u0301');
                chai_1.assert.deepEqual(columns, [0, 1, 2, 2, 3, 4, 4, 5]);
                chai_1.assert.equal(line.translateToString(trimRight, 0, 4, columns), 'a e\u0301 ');
                chai_1.assert.deepEqual(columns, [0, 1, 2, 2, 3, 4]);
                chai_1.assert.equal(line.translateToString(trimRight, 0, 3, columns), 'a e\u0301');
                chai_1.assert.deepEqual(columns, [0, 1, 2, 2, 3]);
            }
        });
        it('fullwidth', function () {
            const columns = [];
            const line = new TestBufferLine(10, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, Constants_1.NULL_CELL_CHAR, Constants_1.NULL_CELL_WIDTH, Constants_1.NULL_CELL_CODE]), false);
            line.setCell(0, CellData_1.CellData.fromCharData([1, 'a', 1, 'a'.charCodeAt(0)]));
            line.setCell(2, CellData_1.CellData.fromCharData([1, '１', 2, '１'.charCodeAt(0)]));
            line.setCell(3, CellData_1.CellData.fromCharData([0, '', 0, 0]));
            line.setCell(5, CellData_1.CellData.fromCharData([1, '１', 2, '１'.charCodeAt(0)]));
            line.setCell(6, CellData_1.CellData.fromCharData([0, '', 0, 0]));
            line.setCell(7, CellData_1.CellData.fromCharData([1, '１', 2, '１'.charCodeAt(0)]));
            line.setCell(8, CellData_1.CellData.fromCharData([0, '', 0, 0]));
            chai_1.assert.equal(line.translateToString(false, undefined, undefined, columns), 'a １ １１ ');
            chai_1.assert.deepEqual(columns, [0, 1, 2, 4, 5, 7, 9, 10]);
            chai_1.assert.equal(line.translateToString(true, undefined, undefined, columns), 'a １ １１');
            chai_1.assert.deepEqual(columns, [0, 1, 2, 4, 5, 7, 9]);
            for (const trimRight of [true, false]) {
                chai_1.assert.equal(line.translateToString(trimRight, 0, 7, columns), 'a １ １');
                chai_1.assert.deepEqual(columns, [0, 1, 2, 4, 5, 7]);
                chai_1.assert.equal(line.translateToString(trimRight, 0, 6, columns), 'a １ １');
                chai_1.assert.deepEqual(columns, [0, 1, 2, 4, 5, 7]);
                chai_1.assert.equal(line.translateToString(trimRight, 0, 5, columns), 'a １ ');
                chai_1.assert.deepEqual(columns, [0, 1, 2, 4, 5]);
                chai_1.assert.equal(line.translateToString(trimRight, 0, 4, columns), 'a １');
                chai_1.assert.deepEqual(columns, [0, 1, 2, 4]);
                chai_1.assert.equal(line.translateToString(trimRight, 0, 3, columns), 'a １');
                chai_1.assert.deepEqual(columns, [0, 1, 2, 4]);
                chai_1.assert.equal(line.translateToString(trimRight, 0, 2, columns), 'a ');
                chai_1.assert.deepEqual(columns, [0, 1, 2]);
            }
        });
        it('space at end', function () {
            const columns = [];
            const line = new TestBufferLine(10, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, Constants_1.NULL_CELL_CHAR, Constants_1.NULL_CELL_WIDTH, Constants_1.NULL_CELL_CODE]), false);
            line.setCell(0, CellData_1.CellData.fromCharData([1, 'a', 1, 'a'.charCodeAt(0)]));
            line.setCell(2, CellData_1.CellData.fromCharData([1, 'a', 1, 'a'.charCodeAt(0)]));
            line.setCell(4, CellData_1.CellData.fromCharData([1, 'a', 1, 'a'.charCodeAt(0)]));
            line.setCell(5, CellData_1.CellData.fromCharData([1, 'a', 1, 'a'.charCodeAt(0)]));
            line.setCell(6, CellData_1.CellData.fromCharData([1, ' ', 1, ' '.charCodeAt(0)]));
            chai_1.assert.equal(line.translateToString(false, undefined, undefined, columns), 'a a aa    ');
            chai_1.assert.deepEqual(columns, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
            chai_1.assert.equal(line.translateToString(true, undefined, undefined, columns), 'a a aa ');
            chai_1.assert.deepEqual(columns, [0, 1, 2, 3, 4, 5, 6, 7]);
        });
        it('should always return some sane value', function () {
            const columns = [];
            const line = new TestBufferLine(10, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, Constants_1.NULL_CELL_CHAR, 0, Constants_1.NULL_CELL_CODE]), false);
            chai_1.assert.equal(line.translateToString(false, undefined, undefined, columns), '          ');
            chai_1.assert.deepEqual(columns, [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
            chai_1.assert.equal(line.translateToString(true, undefined, undefined, columns), '');
            chai_1.assert.deepEqual(columns, [0]);
        });
        it('should work with endCol=0', () => {
            const columns = [];
            const line = new TestBufferLine(10, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, Constants_1.NULL_CELL_CHAR, 0, Constants_1.NULL_CELL_CODE]), false);
            line.setCell(0, CellData_1.CellData.fromCharData([1, 'a', 1, 'a'.charCodeAt(0)]));
            chai_1.assert.equal(line.translateToString(true, 0, 0, columns), '');
            chai_1.assert.deepEqual(columns, [0]);
        });
    });
    describe('addCharToCell', () => {
        it('should set width to 1 for empty cell', () => {
            const line = new TestBufferLine(3, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, Constants_1.NULL_CELL_CHAR, Constants_1.NULL_CELL_WIDTH, Constants_1.NULL_CELL_CODE]), false);
            line.addCodepointToCell(0, '\u0301'.charCodeAt(0), 0);
            const cell = line.loadCell(0, new CellData_1.CellData());
            chai_1.assert.deepEqual(cell.getAsCharData(), [Constants_1.DEFAULT_ATTR, '\u0301', 1, 0x0301]);
            chai_1.assert.equal(cell.isCombined(), 0);
        });
        it('should add char to combining string in cell', () => {
            const line = new TestBufferLine(3, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, Constants_1.NULL_CELL_CHAR, Constants_1.NULL_CELL_WIDTH, Constants_1.NULL_CELL_CODE]), false);
            const cell = line.loadCell(0, new CellData_1.CellData());
            cell.setFromCharData([123, 'e\u0301', 1, 'e\u0301'.charCodeAt(1)]);
            line.setCell(0, cell);
            line.addCodepointToCell(0, '\u0301'.charCodeAt(0), 0);
            line.loadCell(0, cell);
            chai_1.assert.deepEqual(cell.getAsCharData(), [123, 'e\u0301\u0301', 1, 0x0301]);
            chai_1.assert.equal(cell.isCombined(), 2097152);
        });
        it('should create combining string on taken cell', () => {
            const line = new TestBufferLine(3, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, Constants_1.NULL_CELL_CHAR, Constants_1.NULL_CELL_WIDTH, Constants_1.NULL_CELL_CODE]), false);
            const cell = line.loadCell(0, new CellData_1.CellData());
            cell.setFromCharData([123, 'e', 1, 'e'.charCodeAt(1)]);
            line.setCell(0, cell);
            line.addCodepointToCell(0, '\u0301'.charCodeAt(0), 0);
            line.loadCell(0, cell);
            chai_1.assert.deepEqual(cell.getAsCharData(), [123, 'e\u0301', 1, 0x0301]);
            chai_1.assert.equal(cell.isCombined(), 2097152);
        });
    });
    describe('correct fullwidth handling', () => {
        function populate(line) {
            const cell = CellData_1.CellData.fromCharData([1, '￥', 2, '￥'.charCodeAt(0)]);
            for (let i = 0; i < line.length; i += 2) {
                line.setCell(i, cell);
            }
        }
        it('insert - wide char at pos', () => {
            const line = new TestBufferLine(10, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, Constants_1.NULL_CELL_CHAR, 0, Constants_1.NULL_CELL_CODE]), false);
            populate(line);
            line.insertCells(9, 1, CellData_1.CellData.fromCharData([1, 'a', 1, 'a'.charCodeAt(0)]));
            chai_1.assert.equal(line.translateToString(), '￥￥￥￥ a');
            line.insertCells(8, 1, CellData_1.CellData.fromCharData([1, 'a', 1, 'a'.charCodeAt(0)]));
            chai_1.assert.equal(line.translateToString(), '￥￥￥￥a ');
            line.insertCells(1, 1, CellData_1.CellData.fromCharData([1, 'a', 1, 'a'.charCodeAt(0)]));
            chai_1.assert.equal(line.translateToString(), ' a ￥￥￥a');
        });
        it('insert - wide char at end', () => {
            const line = new TestBufferLine(10, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, Constants_1.NULL_CELL_CHAR, 0, Constants_1.NULL_CELL_CODE]), false);
            populate(line);
            line.insertCells(0, 3, CellData_1.CellData.fromCharData([1, 'a', 1, 'a'.charCodeAt(0)]));
            chai_1.assert.equal(line.translateToString(), 'aaa￥￥￥ ');
            line.insertCells(4, 1, CellData_1.CellData.fromCharData([1, 'a', 1, 'a'.charCodeAt(0)]));
            chai_1.assert.equal(line.translateToString(), 'aaa a ￥￥');
            line.insertCells(4, 1, CellData_1.CellData.fromCharData([1, 'a', 1, 'a'.charCodeAt(0)]));
            chai_1.assert.equal(line.translateToString(), 'aaa aa ￥ ');
        });
        it('delete', () => {
            const line = new TestBufferLine(10, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, Constants_1.NULL_CELL_CHAR, 0, Constants_1.NULL_CELL_CODE]), false);
            populate(line);
            line.deleteCells(0, 1, CellData_1.CellData.fromCharData([1, 'a', 1, 'a'.charCodeAt(0)]));
            chai_1.assert.equal(line.translateToString(), ' ￥￥￥￥a');
            line.deleteCells(5, 2, CellData_1.CellData.fromCharData([1, 'a', 1, 'a'.charCodeAt(0)]));
            chai_1.assert.equal(line.translateToString(), ' ￥￥￥aaa');
            line.deleteCells(0, 2, CellData_1.CellData.fromCharData([1, 'a', 1, 'a'.charCodeAt(0)]));
            chai_1.assert.equal(line.translateToString(), ' ￥￥aaaaa');
        });
        it('replace - start at 0', () => {
            let line = new TestBufferLine(10, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, Constants_1.NULL_CELL_CHAR, 0, Constants_1.NULL_CELL_CODE]), false);
            populate(line);
            line.replaceCells(0, 1, CellData_1.CellData.fromCharData([1, 'a', 1, 'a'.charCodeAt(0)]));
            chai_1.assert.equal(line.translateToString(), 'a ￥￥￥￥');
            line = new TestBufferLine(10, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, Constants_1.NULL_CELL_CHAR, 0, Constants_1.NULL_CELL_CODE]), false);
            populate(line);
            line.replaceCells(0, 2, CellData_1.CellData.fromCharData([1, 'a', 1, 'a'.charCodeAt(0)]));
            chai_1.assert.equal(line.translateToString(), 'aa￥￥￥￥');
            line = new TestBufferLine(10, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, Constants_1.NULL_CELL_CHAR, 0, Constants_1.NULL_CELL_CODE]), false);
            populate(line);
            line.replaceCells(0, 3, CellData_1.CellData.fromCharData([1, 'a', 1, 'a'.charCodeAt(0)]));
            chai_1.assert.equal(line.translateToString(), 'aaa ￥￥￥');
            line = new TestBufferLine(10, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, Constants_1.NULL_CELL_CHAR, 0, Constants_1.NULL_CELL_CODE]), false);
            populate(line);
            line.replaceCells(0, 8, CellData_1.CellData.fromCharData([1, 'a', 1, 'a'.charCodeAt(0)]));
            chai_1.assert.equal(line.translateToString(), 'aaaaaaaa￥');
            line = new TestBufferLine(10, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, Constants_1.NULL_CELL_CHAR, 0, Constants_1.NULL_CELL_CODE]), false);
            populate(line);
            line.replaceCells(0, 9, CellData_1.CellData.fromCharData([1, 'a', 1, 'a'.charCodeAt(0)]));
            chai_1.assert.equal(line.translateToString(), 'aaaaaaaaa ');
            line = new TestBufferLine(10, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, Constants_1.NULL_CELL_CHAR, 0, Constants_1.NULL_CELL_CODE]), false);
            populate(line);
            line.replaceCells(0, 10, CellData_1.CellData.fromCharData([1, 'a', 1, 'a'.charCodeAt(0)]));
            chai_1.assert.equal(line.translateToString(), 'aaaaaaaaaa');
        });
        it('replace - start at 1', () => {
            let line = new TestBufferLine(10, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, Constants_1.NULL_CELL_CHAR, 0, Constants_1.NULL_CELL_CODE]), false);
            populate(line);
            line.replaceCells(1, 2, CellData_1.CellData.fromCharData([1, 'a', 1, 'a'.charCodeAt(0)]));
            chai_1.assert.equal(line.translateToString(), ' a￥￥￥￥');
            line = new TestBufferLine(10, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, Constants_1.NULL_CELL_CHAR, 0, Constants_1.NULL_CELL_CODE]), false);
            populate(line);
            line.replaceCells(1, 3, CellData_1.CellData.fromCharData([1, 'a', 1, 'a'.charCodeAt(0)]));
            chai_1.assert.equal(line.translateToString(), ' aa ￥￥￥');
            line = new TestBufferLine(10, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, Constants_1.NULL_CELL_CHAR, 0, Constants_1.NULL_CELL_CODE]), false);
            populate(line);
            line.replaceCells(1, 4, CellData_1.CellData.fromCharData([1, 'a', 1, 'a'.charCodeAt(0)]));
            chai_1.assert.equal(line.translateToString(), ' aaa￥￥￥');
            line = new TestBufferLine(10, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, Constants_1.NULL_CELL_CHAR, 0, Constants_1.NULL_CELL_CODE]), false);
            populate(line);
            line.replaceCells(1, 8, CellData_1.CellData.fromCharData([1, 'a', 1, 'a'.charCodeAt(0)]));
            chai_1.assert.equal(line.translateToString(), ' aaaaaaa￥');
            line = new TestBufferLine(10, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, Constants_1.NULL_CELL_CHAR, 0, Constants_1.NULL_CELL_CODE]), false);
            populate(line);
            line.replaceCells(1, 9, CellData_1.CellData.fromCharData([1, 'a', 1, 'a'.charCodeAt(0)]));
            chai_1.assert.equal(line.translateToString(), ' aaaaaaaa ');
            line = new TestBufferLine(10, CellData_1.CellData.fromCharData([Constants_1.DEFAULT_ATTR, Constants_1.NULL_CELL_CHAR, 0, Constants_1.NULL_CELL_CODE]), false);
            populate(line);
            line.replaceCells(1, 10, CellData_1.CellData.fromCharData([1, 'a', 1, 'a'.charCodeAt(0)]));
            chai_1.assert.equal(line.translateToString(), ' aaaaaaaaa');
        });
    });
    describe('extended attributes', () => {
        it('setCells', function () {
            const line = new TestBufferLine(5);
            const cell = CellData_1.CellData.fromCharData([1, 'a', 0, 'a'.charCodeAt(0)]);
            line.setCell(0, cell);
            cell.extended.underlineStyle = 3;
            cell.bg |= 268435456;
            line.setCell(1, cell);
            cell.content = 65;
            line.setCell(2, cell);
            cell.extended = cell.extended.clone();
            cell.extended.underlineStyle = 4;
            line.setCell(3, cell);
            cell.bg &= ~268435456;
            line.setCell(4, cell);
            chai_1.assert.deepEqual(line.toArray(), [
                [1, 'a', 0, 'a'.charCodeAt(0)],
                [1, 'a', 0, 'a'.charCodeAt(0)],
                [1, 'A', 0, 'A'.charCodeAt(0)],
                [1, 'A', 0, 'A'.charCodeAt(0)],
                [1, 'A', 0, 'A'.charCodeAt(0)]
            ]);
            chai_1.assert.equal(line._extendedAttrs[0], undefined);
            chai_1.assert.equal(line._extendedAttrs[1].underlineStyle, 3);
            chai_1.assert.equal(line._extendedAttrs[2].underlineStyle, 3);
            chai_1.assert.equal(line._extendedAttrs[3].underlineStyle, 4);
            chai_1.assert.equal(line._extendedAttrs[4], undefined);
            chai_1.assert.equal(line._extendedAttrs[1], line._extendedAttrs[2]);
            chai_1.assert.notEqual(line._extendedAttrs[1], line._extendedAttrs[3]);
        });
        it('loadCell', () => {
            const line = new TestBufferLine(5);
            const cell = CellData_1.CellData.fromCharData([1, 'a', 0, 'a'.charCodeAt(0)]);
            line.setCell(0, cell);
            cell.extended.underlineStyle = 3;
            cell.bg |= 268435456;
            line.setCell(1, cell);
            cell.content = 65;
            line.setCell(2, cell);
            cell.extended = cell.extended.clone();
            cell.extended.underlineStyle = 4;
            line.setCell(3, cell);
            cell.bg &= ~268435456;
            line.setCell(4, cell);
            const cell0 = new CellData_1.CellData();
            line.loadCell(0, cell0);
            const cell1 = new CellData_1.CellData();
            line.loadCell(1, cell1);
            const cell2 = new CellData_1.CellData();
            line.loadCell(2, cell2);
            const cell3 = new CellData_1.CellData();
            line.loadCell(3, cell3);
            const cell4 = new CellData_1.CellData();
            line.loadCell(4, cell4);
            chai_1.assert.equal(cell0.extended.underlineStyle, 0);
            chai_1.assert.equal(cell1.extended.underlineStyle, 3);
            chai_1.assert.equal(cell2.extended.underlineStyle, 3);
            chai_1.assert.equal(cell3.extended.underlineStyle, 4);
            chai_1.assert.equal(cell4.extended.underlineStyle, 0);
            chai_1.assert.equal(cell1.extended, cell2.extended);
            chai_1.assert.notEqual(cell2.extended, cell3.extended);
        });
        it('fill', () => {
            const line = new TestBufferLine(3);
            const cell = CellData_1.CellData.fromCharData([1, 'a', 0, 'a'.charCodeAt(0)]);
            cell.extended.underlineStyle = 3;
            cell.bg |= 268435456;
            line.fill(cell);
            chai_1.assert.equal(line._extendedAttrs[0].underlineStyle, 3);
            chai_1.assert.equal(line._extendedAttrs[1].underlineStyle, 3);
            chai_1.assert.equal(line._extendedAttrs[2].underlineStyle, 3);
        });
        it('insertCells', () => {
            const line = new TestBufferLine(5);
            const cell = CellData_1.CellData.fromCharData([1, 'a', 0, 'a'.charCodeAt(0)]);
            cell.extended.underlineStyle = 3;
            cell.bg |= 268435456;
            line.insertCells(1, 3, cell);
            chai_1.assert.equal(line._extendedAttrs[1].underlineStyle, 3);
            chai_1.assert.equal(line._extendedAttrs[2].underlineStyle, 3);
            chai_1.assert.equal(line._extendedAttrs[3].underlineStyle, 3);
            chai_1.assert.equal(line._extendedAttrs[4], undefined);
            cell.extended = cell.extended.clone();
            cell.extended.underlineStyle = 4;
            line.insertCells(2, 2, cell);
            chai_1.assert.equal(line._extendedAttrs[1].underlineStyle, 3);
            chai_1.assert.equal(line._extendedAttrs[2].underlineStyle, 4);
            chai_1.assert.equal(line._extendedAttrs[3].underlineStyle, 4);
            chai_1.assert.equal(line._extendedAttrs[4].underlineStyle, 3);
        });
        it('deleteCells', () => {
            const line = new TestBufferLine(5);
            const fillCell = CellData_1.CellData.fromCharData([1, 'a', 0, 'a'.charCodeAt(0)]);
            fillCell.extended.underlineStyle = 3;
            fillCell.bg |= 268435456;
            line.fill(fillCell);
            fillCell.extended = fillCell.extended.clone();
            fillCell.extended.underlineStyle = 2;
            line.deleteCells(1, 3, fillCell);
            chai_1.assert.equal(line._extendedAttrs[0].underlineStyle, 3);
            chai_1.assert.equal(line._extendedAttrs[1].underlineStyle, 3);
            chai_1.assert.equal(line._extendedAttrs[2].underlineStyle, 2);
            chai_1.assert.equal(line._extendedAttrs[3].underlineStyle, 2);
            chai_1.assert.equal(line._extendedAttrs[4].underlineStyle, 2);
        });
        it('replaceCells', () => {
            const line = new TestBufferLine(5);
            const fillCell = CellData_1.CellData.fromCharData([1, 'a', 0, 'a'.charCodeAt(0)]);
            fillCell.extended.underlineStyle = 3;
            fillCell.bg |= 268435456;
            line.fill(fillCell);
            fillCell.extended = fillCell.extended.clone();
            fillCell.extended.underlineStyle = 2;
            line.replaceCells(1, 3, fillCell);
            chai_1.assert.equal(line._extendedAttrs[0].underlineStyle, 3);
            chai_1.assert.equal(line._extendedAttrs[1].underlineStyle, 2);
            chai_1.assert.equal(line._extendedAttrs[2].underlineStyle, 2);
            chai_1.assert.equal(line._extendedAttrs[3].underlineStyle, 3);
            chai_1.assert.equal(line._extendedAttrs[4].underlineStyle, 3);
        });
        it('clone', () => {
            const line = new TestBufferLine(5);
            const cell = CellData_1.CellData.fromCharData([1, 'a', 0, 'a'.charCodeAt(0)]);
            line.setCell(0, cell);
            cell.extended.underlineStyle = 3;
            cell.bg |= 268435456;
            line.setCell(1, cell);
            cell.content = 65;
            line.setCell(2, cell);
            cell.extended = cell.extended.clone();
            cell.extended.underlineStyle = 4;
            line.setCell(3, cell);
            cell.bg &= ~268435456;
            line.setCell(4, cell);
            const nLine = line.clone();
            chai_1.assert.equal(nLine._extendedAttrs[0], line._extendedAttrs[0]);
            chai_1.assert.equal(nLine._extendedAttrs[1], line._extendedAttrs[1]);
            chai_1.assert.equal(nLine._extendedAttrs[2], line._extendedAttrs[2]);
            chai_1.assert.equal(nLine._extendedAttrs[3], line._extendedAttrs[3]);
            chai_1.assert.equal(nLine._extendedAttrs[4], line._extendedAttrs[4]);
        });
        it('copyFrom', () => {
            const initial = new TestBufferLine(5);
            const cell = CellData_1.CellData.fromCharData([1, 'a', 0, 'a'.charCodeAt(0)]);
            initial.setCell(0, cell);
            cell.extended.underlineStyle = 3;
            cell.bg |= 268435456;
            initial.setCell(1, cell);
            cell.content = 65;
            initial.setCell(2, cell);
            cell.extended = cell.extended.clone();
            cell.extended.underlineStyle = 4;
            initial.setCell(3, cell);
            cell.bg &= ~268435456;
            initial.setCell(4, cell);
            const line = new TestBufferLine(5);
            line.fill(CellData_1.CellData.fromCharData([1, 'b', 0, 'b'.charCodeAt(0)]));
            line.copyFrom(initial);
            chai_1.assert.equal(line._extendedAttrs[0], initial._extendedAttrs[0]);
            chai_1.assert.equal(line._extendedAttrs[1], initial._extendedAttrs[1]);
            chai_1.assert.equal(line._extendedAttrs[2], initial._extendedAttrs[2]);
            chai_1.assert.equal(line._extendedAttrs[3], initial._extendedAttrs[3]);
            chai_1.assert.equal(line._extendedAttrs[4], initial._extendedAttrs[4]);
        });
    });
});
//# sourceMappingURL=BufferLine.test.js.map