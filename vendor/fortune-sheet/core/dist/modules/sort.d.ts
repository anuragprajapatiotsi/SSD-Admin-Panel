import { Cell, CellMatrix, Context } from "..";
export declare function orderbydata(isAsc: boolean, index: number, data: (Cell | null)[][]): {
    sortedData: (Cell | null)[][];
    rowOffsets: number[];
};
export declare function sortDataRange(ctx: Context, sheetData: CellMatrix, dataRange: CellMatrix, index: number, isAsc: boolean, str: number, edr: number, stc: number, edc: number): void;
export declare function sortSelection(ctx: Context, isAsc: boolean, colIndex?: number): void;
