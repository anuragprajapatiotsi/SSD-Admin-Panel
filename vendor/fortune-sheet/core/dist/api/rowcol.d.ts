import { Context } from "../context";
import { CommonOptions } from "./common";
export declare function freeze(ctx: Context, type: "row" | "column" | "both", range: {
    row: number;
    column: number;
}, options?: CommonOptions): void;
export declare function insertRowOrColumn(ctx: Context, type: "row" | "column", index: number, count: number, direction: "lefttop" | "rightbottom", options?: CommonOptions): void;
export declare function deleteRowOrColumn(ctx: Context, type: "row" | "column", start: number, end: number, options?: CommonOptions): void;
export declare function hideRowOrColumn(ctx: Context, rowColInfo: string[], type: "row" | "column"): void;
export declare function showRowOrColumn(ctx: Context, rowColInfo: string[], type: "row" | "column"): void;
export declare function setRowHeight(ctx: Context, rowInfo: Record<string, number>, options?: CommonOptions, custom?: boolean): void;
export declare function setColumnWidth(ctx: Context, columnInfo: Record<string, number>, options?: CommonOptions, custom?: boolean): void;
export declare function getRowHeight(ctx: Context, rows: number[], options?: CommonOptions): Record<number, number>;
export declare function getColumnWidth(ctx: Context, columns: number[], options?: CommonOptions): Record<number, number>;
