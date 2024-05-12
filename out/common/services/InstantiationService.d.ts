import { IInstantiationService, IServiceIdentifier } from 'common/services/Services';
export declare class ServiceCollection {
    private _entries;
    constructor(...entries: [IServiceIdentifier<any>, any][]);
    set<T>(id: IServiceIdentifier<T>, instance: T): T;
    forEach(callback: (id: IServiceIdentifier<any>, instance: any) => any): void;
    has(id: IServiceIdentifier<any>): boolean;
    get<T>(id: IServiceIdentifier<T>): T | undefined;
}
export declare class InstantiationService implements IInstantiationService {
    serviceBrand: undefined;
    private readonly _services;
    constructor();
    setService<T>(id: IServiceIdentifier<T>, instance: T): void;
    getService<T>(id: IServiceIdentifier<T>): T | undefined;
    createInstance<T>(ctor: any, ...args: any[]): T;
}
//# sourceMappingURL=InstantiationService.d.ts.map