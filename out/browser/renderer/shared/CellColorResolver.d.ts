import { ISelectionRenderModel } from 'browser/renderer/shared/Types';
import { ICoreBrowserService, IThemeService } from 'browser/services/Services';
import { IDecorationService, IOptionsService } from 'common/services/Services';
import { ICellData } from 'common/Types';
import { Terminal } from '@xterm/xterm';
export declare class CellColorResolver {
    private readonly _terminal;
    private readonly _optionService;
    private readonly _selectionRenderModel;
    private readonly _decorationService;
    private readonly _coreBrowserService;
    private readonly _themeService;
    readonly result: {
        fg: number;
        bg: number;
        ext: number;
    };
    constructor(_terminal: Terminal, _optionService: IOptionsService, _selectionRenderModel: ISelectionRenderModel, _decorationService: IDecorationService, _coreBrowserService: ICoreBrowserService, _themeService: IThemeService);
    resolve(cell: ICellData, x: number, y: number, deviceCellWidth: number): void;
}
//# sourceMappingURL=CellColorResolver.d.ts.map