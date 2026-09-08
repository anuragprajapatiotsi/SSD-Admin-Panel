import { defaultContext } from "./context";
export declare const defaultStyle: {
    fillStyle: string;
    textBaseline: string;
    strokeStyle: string;
    rowFillStyle: string;
    textAlign: string;
};
export declare class Canvas {
    canvasElement: HTMLCanvasElement;
    sheetCtx: ReturnType<typeof defaultContext>;
    measureTextCacheTimeOut: any;
    cellOverflowMapCache: any;
    theme: {
        background: string;
        foreground: string;
        header: string;
        border: string;
    };
    constructor(canvasElement: HTMLCanvasElement, ctx: ReturnType<typeof defaultContext>);
    drawRowHeader(scrollHeight: number, drawHeight?: number, offsetTop?: number): void;
    drawColumnHeader(scrollWidth: number, drawWidth?: number, offsetLeft?: number): void;
    drawMain({ scrollWidth, scrollHeight, drawWidth, drawHeight, offsetLeft, offsetTop, columnOffsetCell, rowOffsetCell, clear, }: {
        scrollWidth: number;
        scrollHeight: number;
        drawWidth?: number;
        drawHeight?: number;
        offsetLeft?: number;
        offsetTop?: number;
        columnOffsetCell?: number;
        rowOffsetCell?: number;
        clear?: boolean;
    }): void;
    getCellOverflowMap(canvas: CanvasRenderingContext2D, colStart: number, colEnd: number, rowStart: number, rowEnd: number): any;
    nullCellRender(r: number, c: number, startY: number, startX: number, endY: number, endX: number, renderCtx: CanvasRenderingContext2D, afCompute: any, cfCompute: any, offsetLeft: number, offsetTop: number, dynamicArrayCompute: any, cellOverflowMap: any, colStart: number, colEnd: number, scrollHeight: number, scrollWidth: number, bodrder05: any, isMerge?: boolean): void;
    cellRender(r: number, c: number, startY: number, startX: number, endY: number, endX: number, value: any, renderCtx: CanvasRenderingContext2D, afCompute: any, cfCompute: any, offsetLeft: number, offsetTop: number, dynamicArrayCompute: any, cellOverflowMap: any, colStart: number, colEnd: number, scrollHeight: number, scrollWidth: number, bodrder05: number, isMerge?: boolean): void;
    cellOverflowRender(r: number, c: number, stc: number, edc: number, renderCtx: CanvasRenderingContext2D, scrollHeight: number, scrollWidth: number, offsetLeft: number, offsetTop: number, afCompute: any, cfCompute: any): void;
    cellOverflow_trace(r: number, curC: number, traceC: number, traceDir: string, horizonAlign: string, textMetrics: number): any;
    cellOverflow_colIn(map: any, r: number, c: number, col_st: number, col_ed: number): {
        colIn: boolean;
        colLast: boolean;
        rowIndex: number | undefined;
        colIndex: number | undefined;
        stc: number | undefined;
        edc: number | undefined;
    };
    cellTextRender(textInfo: any, ctx: CanvasRenderingContext2D, option: any): void;
    drawFreezeLine({ horizontalTop, verticalLeft, }: {
        horizontalTop?: number;
        verticalLeft?: number;
    }): void;
}
