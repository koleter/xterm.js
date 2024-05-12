import { ICharAtlasConfig } from './Types';
import { ITerminalOptions } from '@xterm/xterm';
import { ReadonlyColorSet } from 'browser/Types';
export declare function generateConfig(deviceCellWidth: number, deviceCellHeight: number, deviceCharWidth: number, deviceCharHeight: number, options: Required<ITerminalOptions>, colors: ReadonlyColorSet, devicePixelRatio: number): ICharAtlasConfig;
export declare function configEquals(a: ICharAtlasConfig, b: ICharAtlasConfig): boolean;
export declare function is256Color(colorCode: number): boolean;
//# sourceMappingURL=CharAtlasUtils.d.ts.map