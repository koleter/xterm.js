import { ICoreTerminal } from 'common/Types';
import { IUnicodeHandling, IUnicodeVersionProvider } from '@xterm/xterm';
export declare class UnicodeApi implements IUnicodeHandling {
    private _core;
    constructor(_core: ICoreTerminal);
    register(provider: IUnicodeVersionProvider): void;
    get versions(): string[];
    get activeVersion(): string;
    set activeVersion(version: string);
}
//# sourceMappingURL=UnicodeApi.d.ts.map