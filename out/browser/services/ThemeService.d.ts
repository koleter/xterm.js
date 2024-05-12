import { IThemeService } from 'browser/services/Services';
import { IColorSet, ReadonlyColorSet } from 'browser/Types';
import { Disposable } from 'common/Lifecycle';
import { IOptionsService } from 'common/services/Services';
import { AllColorIndex, IColor } from 'common/Types';
export declare const DEFAULT_ANSI_COLORS: readonly IColor[];
export declare class ThemeService extends Disposable implements IThemeService {
    private readonly _optionsService;
    serviceBrand: undefined;
    private _colors;
    private _contrastCache;
    private _halfContrastCache;
    private _restoreColors;
    get colors(): ReadonlyColorSet;
    private readonly _onChangeColors;
    readonly onChangeColors: import("common/EventEmitter").IEvent<ReadonlyColorSet, void>;
    constructor(_optionsService: IOptionsService);
    private _setTheme;
    restoreColor(slot?: AllColorIndex): void;
    private _restoreColor;
    modifyColors(callback: (colors: IColorSet) => void): void;
    private _updateRestoreColors;
}
//# sourceMappingURL=ThemeService.d.ts.map