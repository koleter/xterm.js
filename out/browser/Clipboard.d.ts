import { ISelectionService } from 'browser/services/Services';
import { ICoreService, IOptionsService } from 'common/services/Services';
export declare function prepareTextForTerminal(text: string): string;
export declare function bracketTextForPaste(text: string, bracketedPasteMode: boolean): string;
export declare function copyHandler(ev: ClipboardEvent, selectionService: ISelectionService): void;
export declare function handlePasteEvent(ev: ClipboardEvent, textarea: HTMLTextAreaElement, coreService: ICoreService, optionsService: IOptionsService): void;
export declare function paste(text: string, textarea: HTMLTextAreaElement, coreService: ICoreService, optionsService: IOptionsService): void;
export declare function moveTextAreaUnderMouseCursor(ev: MouseEvent, textarea: HTMLTextAreaElement, screenElement: HTMLElement): void;
export declare function rightClickHandler(ev: MouseEvent, textarea: HTMLTextAreaElement, screenElement: HTMLElement, selectionService: ISelectionService, shouldSelectWord: boolean): void;
//# sourceMappingURL=Clipboard.d.ts.map