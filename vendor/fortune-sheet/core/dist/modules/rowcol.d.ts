import { Context } from "../context";
export declare function insertRowCol(ctx: Context, op: {
    type: "row" | "column";
    index: number;
    count: number;
    direction: "lefttop" | "rightbottom";
    id: string;
}, changeSelection?: boolean): void;
export declare function deleteRowCol(ctx: Context, op: {
    type: "row" | "column";
    start: number;
    end: number;
    id?: string;
}): void;
export declare function computeRowlenArr(ctx: Context, rowHeight: number, cfg: any): number[];
export declare function hideSelected(ctx: Context, type: string): "" | "noMulti";
export declare function showSelected(ctx: Context, type: string): "" | "noMulti";
export declare function isShowHidenCR(ctx: Context): boolean;
export declare function hideCRCount(ctx: Context, type: string): number;
