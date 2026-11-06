import { ITestContext } from './TestUtils';
export interface ISharedRendererTestContext {
    value: ITestContext;
    skipCanvasExceptions?: boolean;
    skipDomExceptions?: boolean;
}
export declare function injectSharedRendererTests(ctx: ISharedRendererTestContext): void;
export declare function injectSharedRendererTestsStandalone(ctx: ISharedRendererTestContext, setupCb: () => Promise<void> | void): void;
