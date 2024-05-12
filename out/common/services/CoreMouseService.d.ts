import { IBufferService, ICoreService, ICoreMouseService } from 'common/services/Services';
import { ICoreMouseProtocol, ICoreMouseEvent, CoreMouseEncoding, CoreMouseEventType } from 'common/Types';
import { Disposable } from 'common/Lifecycle';
export declare class CoreMouseService extends Disposable implements ICoreMouseService {
    private readonly _bufferService;
    private readonly _coreService;
    private _protocols;
    private _encodings;
    private _activeProtocol;
    private _activeEncoding;
    private _lastEvent;
    private readonly _onProtocolChange;
    readonly onProtocolChange: import("common/EventEmitter").IEvent<CoreMouseEventType, void>;
    constructor(_bufferService: IBufferService, _coreService: ICoreService);
    addProtocol(name: string, protocol: ICoreMouseProtocol): void;
    addEncoding(name: string, encoding: CoreMouseEncoding): void;
    get activeProtocol(): string;
    get areMouseEventsActive(): boolean;
    set activeProtocol(name: string);
    get activeEncoding(): string;
    set activeEncoding(name: string);
    reset(): void;
    triggerMouseEvent(e: ICoreMouseEvent): boolean;
    explainEvents(events: CoreMouseEventType): {
        [event: string]: boolean;
    };
    private _equalEvents;
}
//# sourceMappingURL=CoreMouseService.d.ts.map