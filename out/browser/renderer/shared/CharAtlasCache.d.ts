import { ITerminalOptions, Terminal } from '@xterm/xterm';
import { ReadonlyColorSet } from 'browser/Types';
import { ITextureAtlas } from 'browser/renderer/shared/Types';
export declare function acquireTextureAtlas(terminal: Terminal, options: Required<ITerminalOptions>, colors: ReadonlyColorSet, deviceCellWidth: number, deviceCellHeight: number, deviceCharWidth: number, deviceCharHeight: number, devicePixelRatio: number): ITextureAtlas;
export declare function removeTerminalFromCache(terminal: Terminal): void;
//# sourceMappingURL=CharAtlasCache.d.ts.map