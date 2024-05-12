import { IBuffer } from 'common/buffer/Types';
import { CoreTerminal } from 'common/CoreTerminal';
import { IMarker, ITerminalOptions } from 'common/Types';
export declare class Terminal extends CoreTerminal {
    private readonly _onBell;
    readonly onBell: import("common/EventEmitter").IEvent<void, void>;
    private readonly _onCursorMove;
    readonly onCursorMove: import("common/EventEmitter").IEvent<void, void>;
    private readonly _onTitleChange;
    readonly onTitleChange: import("common/EventEmitter").IEvent<string, void>;
    private readonly _onA11yCharEmitter;
    readonly onA11yChar: import("common/EventEmitter").IEvent<string, void>;
    private readonly _onA11yTabEmitter;
    readonly onA11yTab: import("common/EventEmitter").IEvent<number, void>;
    constructor(options?: ITerminalOptions);
    get buffer(): IBuffer;
    get markers(): IMarker[];
    addMarker(cursorYOffset: number): IMarker | undefined;
    bell(): void;
    input(data: string, wasUserInput?: boolean): void;
    resize(x: number, y: number): void;
    clear(): void;
    reset(): void;
}
//# sourceMappingURL=Terminal.d.ts.map