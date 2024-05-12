import { ICharsetService } from 'common/services/Services';
import { ICharset } from 'common/Types';
export declare class CharsetService implements ICharsetService {
    serviceBrand: any;
    charset: ICharset | undefined;
    glevel: number;
    private _charsets;
    reset(): void;
    setgLevel(g: number): void;
    setgCharset(g: number, charset: ICharset | undefined): void;
}
//# sourceMappingURL=CharsetService.d.ts.map