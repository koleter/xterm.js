import type { IDisposable } from '@xterm/xterm';
declare global {
    interface Window {
        customCsiHandlerParams?: (number | number[])[][];
        customCsiHandlerCallStack?: string[];
        customDcsHandlerCallStack?: [string, (number | number[])[], string][];
        customEscHandlerCallStack?: string[];
        customOscHandlerCallStack?: string[][];
        disposable?: IDisposable;
        disposables?: IDisposable[];
    }
}
