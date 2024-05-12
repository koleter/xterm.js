"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getWrappedLineTrimmedLength = exports.reflowSmallerGetNewLineLengths = exports.reflowLargerApplyNewLayout = exports.reflowLargerCreateNewLayout = exports.reflowLargerGetLinesToRemove = void 0;
function reflowLargerGetLinesToRemove(lines, oldCols, newCols, bufferAbsoluteY, nullCell) {
    const toRemove = [];
    for (let y = 0; y < lines.length - 1; y++) {
        let i = y;
        let nextLine = lines.get(++i);
        if (!nextLine.isWrapped) {
            continue;
        }
        const wrappedLines = [lines.get(y)];
        while (i < lines.length && nextLine.isWrapped) {
            wrappedLines.push(nextLine);
            nextLine = lines.get(++i);
        }
        if (bufferAbsoluteY >= y && bufferAbsoluteY < i) {
            y += wrappedLines.length - 1;
            continue;
        }
        let destLineIndex = 0;
        let destCol = getWrappedLineTrimmedLength(wrappedLines, destLineIndex, oldCols);
        let srcLineIndex = 1;
        let srcCol = 0;
        while (srcLineIndex < wrappedLines.length) {
            const srcTrimmedTineLength = getWrappedLineTrimmedLength(wrappedLines, srcLineIndex, oldCols);
            const srcRemainingCells = srcTrimmedTineLength - srcCol;
            const destRemainingCells = newCols - destCol;
            const cellsToCopy = Math.min(srcRemainingCells, destRemainingCells);
            wrappedLines[destLineIndex].copyCellsFrom(wrappedLines[srcLineIndex], srcCol, destCol, cellsToCopy, false);
            destCol += cellsToCopy;
            if (destCol === newCols) {
                destLineIndex++;
                destCol = 0;
            }
            srcCol += cellsToCopy;
            if (srcCol === srcTrimmedTineLength) {
                srcLineIndex++;
                srcCol = 0;
            }
            if (destCol === 0 && destLineIndex !== 0) {
                if (wrappedLines[destLineIndex - 1].getWidth(newCols - 1) === 2) {
                    wrappedLines[destLineIndex].copyCellsFrom(wrappedLines[destLineIndex - 1], newCols - 1, destCol++, 1, false);
                    wrappedLines[destLineIndex - 1].setCell(newCols - 1, nullCell);
                }
            }
        }
        wrappedLines[destLineIndex].replaceCells(destCol, newCols, nullCell);
        let countToRemove = 0;
        for (let i = wrappedLines.length - 1; i > 0; i--) {
            if (i > destLineIndex || wrappedLines[i].getTrimmedLength() === 0) {
                countToRemove++;
            }
            else {
                break;
            }
        }
        if (countToRemove > 0) {
            toRemove.push(y + wrappedLines.length - countToRemove);
            toRemove.push(countToRemove);
        }
        y += wrappedLines.length - 1;
    }
    return toRemove;
}
exports.reflowLargerGetLinesToRemove = reflowLargerGetLinesToRemove;
function reflowLargerCreateNewLayout(lines, toRemove) {
    const layout = [];
    let nextToRemoveIndex = 0;
    let nextToRemoveStart = toRemove[nextToRemoveIndex];
    let countRemovedSoFar = 0;
    for (let i = 0; i < lines.length; i++) {
        if (nextToRemoveStart === i) {
            const countToRemove = toRemove[++nextToRemoveIndex];
            lines.onDeleteEmitter.fire({
                index: i - countRemovedSoFar,
                amount: countToRemove
            });
            i += countToRemove - 1;
            countRemovedSoFar += countToRemove;
            nextToRemoveStart = toRemove[++nextToRemoveIndex];
        }
        else {
            layout.push(i);
        }
    }
    return {
        layout,
        countRemoved: countRemovedSoFar
    };
}
exports.reflowLargerCreateNewLayout = reflowLargerCreateNewLayout;
function reflowLargerApplyNewLayout(lines, newLayout) {
    const newLayoutLines = [];
    for (let i = 0; i < newLayout.length; i++) {
        newLayoutLines.push(lines.get(newLayout[i]));
    }
    for (let i = 0; i < newLayoutLines.length; i++) {
        lines.set(i, newLayoutLines[i]);
    }
    lines.length = newLayout.length;
}
exports.reflowLargerApplyNewLayout = reflowLargerApplyNewLayout;
function reflowSmallerGetNewLineLengths(wrappedLines, oldCols, newCols) {
    const newLineLengths = [];
    const cellsNeeded = wrappedLines.map((l, i) => getWrappedLineTrimmedLength(wrappedLines, i, oldCols)).reduce((p, c) => p + c);
    let srcCol = 0;
    let srcLine = 0;
    let cellsAvailable = 0;
    while (cellsAvailable < cellsNeeded) {
        if (cellsNeeded - cellsAvailable < newCols) {
            newLineLengths.push(cellsNeeded - cellsAvailable);
            break;
        }
        srcCol += newCols;
        const oldTrimmedLength = getWrappedLineTrimmedLength(wrappedLines, srcLine, oldCols);
        if (srcCol > oldTrimmedLength) {
            srcCol -= oldTrimmedLength;
            srcLine++;
        }
        const endsWithWide = wrappedLines[srcLine].getWidth(srcCol - 1) === 2;
        if (endsWithWide) {
            srcCol--;
        }
        const lineLength = endsWithWide ? newCols - 1 : newCols;
        newLineLengths.push(lineLength);
        cellsAvailable += lineLength;
    }
    return newLineLengths;
}
exports.reflowSmallerGetNewLineLengths = reflowSmallerGetNewLineLengths;
function getWrappedLineTrimmedLength(lines, i, cols) {
    if (i === lines.length - 1) {
        return lines[i].getTrimmedLength();
    }
    const endsInNull = !(lines[i].hasContent(cols - 1)) && lines[i].getWidth(cols - 1) === 1;
    const followingLineStartsWithWide = lines[i + 1].getWidth(0) === 2;
    if (endsInNull && followingLineStartsWithWide) {
        return cols - 1;
    }
    return cols;
}
exports.getWrappedLineTrimmedLength = getWrappedLineTrimmedLength;
//# sourceMappingURL=BufferReflow.js.map