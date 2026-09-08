import { Context } from "../context";
export declare function mousePosition(x: number, y: number, ctx: Context): number[];
export declare function rowLocationByIndex(row_index: number, visibleRow: number[]): number[];
export declare function rowLocation(y: number, visibleRow: number[]): number[];
export declare function colLocationByIndex(col_index: number, visibleCol: number[]): number[];
export declare function colLocation(x: number, visibleCol: number[]): number[];
