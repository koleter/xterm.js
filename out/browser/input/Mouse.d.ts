export declare function getCoordsRelativeToElement(window: Pick<Window, 'getComputedStyle'>, event: {
    clientX: number;
    clientY: number;
}, element: HTMLElement): [number, number];
export declare function getCoords(window: Pick<Window, 'getComputedStyle'>, event: Pick<MouseEvent, 'clientX' | 'clientY'>, element: HTMLElement, colCount: number, rowCount: number, hasValidCharSize: boolean, cssCellWidth: number, cssCellHeight: number, isSelection?: boolean): [number, number] | undefined;
//# sourceMappingURL=Mouse.d.ts.map