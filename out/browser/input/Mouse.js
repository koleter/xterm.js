"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCoords = exports.getCoordsRelativeToElement = void 0;
function getCoordsRelativeToElement(window, event, element) {
    const rect = element.getBoundingClientRect();
    const elementStyle = window.getComputedStyle(element);
    const leftPadding = parseInt(elementStyle.getPropertyValue('padding-left'));
    const topPadding = parseInt(elementStyle.getPropertyValue('padding-top'));
    return [
        event.clientX - rect.left - leftPadding,
        event.clientY - rect.top - topPadding
    ];
}
exports.getCoordsRelativeToElement = getCoordsRelativeToElement;
function getCoords(window, event, element, colCount, rowCount, hasValidCharSize, cssCellWidth, cssCellHeight, isSelection) {
    if (!hasValidCharSize) {
        return undefined;
    }
    const coords = getCoordsRelativeToElement(window, event, element);
    if (!coords) {
        return undefined;
    }
    coords[0] = Math.ceil((coords[0] + (isSelection ? cssCellWidth / 2 : 0)) / cssCellWidth);
    coords[1] = Math.ceil(coords[1] / cssCellHeight);
    coords[0] = Math.min(Math.max(coords[0], 1), colCount + (isSelection ? 1 : 0));
    coords[1] = Math.min(Math.max(coords[1], 1), rowCount);
    return coords;
}
exports.getCoords = getCoords;
//# sourceMappingURL=Mouse.js.map