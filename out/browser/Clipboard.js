"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rightClickHandler = exports.moveTextAreaUnderMouseCursor = exports.paste = exports.handlePasteEvent = exports.copyHandler = exports.bracketTextForPaste = exports.prepareTextForTerminal = void 0;
function prepareTextForTerminal(text) {
    return text.replace(/\r?\n/g, '\r');
}
exports.prepareTextForTerminal = prepareTextForTerminal;
function bracketTextForPaste(text, bracketedPasteMode) {
    if (bracketedPasteMode) {
        return '\x1b[200~' + text + '\x1b[201~';
    }
    return text;
}
exports.bracketTextForPaste = bracketTextForPaste;
function copyHandler(ev, selectionService) {
    if (ev.clipboardData) {
        ev.clipboardData.setData('text/plain', selectionService.selectionText);
    }
    ev.preventDefault();
}
exports.copyHandler = copyHandler;
function handlePasteEvent(ev, textarea, coreService, optionsService) {
    ev.stopPropagation();
    if (ev.clipboardData) {
        const text = ev.clipboardData.getData('text/plain');
        paste(text, textarea, coreService, optionsService);
    }
}
exports.handlePasteEvent = handlePasteEvent;
function paste(text, textarea, coreService, optionsService) {
    text = prepareTextForTerminal(text);
    text = bracketTextForPaste(text, coreService.decPrivateModes.bracketedPasteMode && optionsService.rawOptions.ignoreBracketedPasteMode !== true);
    coreService.triggerDataEvent(text, true);
    textarea.value = '';
}
exports.paste = paste;
function moveTextAreaUnderMouseCursor(ev, textarea, screenElement) {
    const pos = screenElement.getBoundingClientRect();
    const left = ev.clientX - pos.left - 10;
    const top = ev.clientY - pos.top - 10;
    textarea.style.width = '20px';
    textarea.style.height = '20px';
    textarea.style.left = `${left}px`;
    textarea.style.top = `${top}px`;
    textarea.style.zIndex = '1000';
    textarea.focus();
}
exports.moveTextAreaUnderMouseCursor = moveTextAreaUnderMouseCursor;
function rightClickHandler(ev, textarea, screenElement, selectionService, shouldSelectWord) {
    moveTextAreaUnderMouseCursor(ev, textarea, screenElement);
    if (shouldSelectWord) {
        selectionService.rightClickSelect(ev);
    }
    textarea.value = selectionService.selectionText;
    textarea.select();
}
exports.rightClickHandler = rightClickHandler;
//# sourceMappingURL=Clipboard.js.map