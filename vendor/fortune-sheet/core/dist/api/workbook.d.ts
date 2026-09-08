import { Context, Sheet } from "..";
import { Settings } from "../settings";
import { CommonOptions } from "./common";
export declare function addSheet(ctx: Context, settings?: Required<Settings>, newSheetID?: string, isPivotTable?: boolean, sheetname?: string | undefined, sheetData?: Sheet | undefined): void;
export declare function deleteSheet(ctx: Context, options?: CommonOptions): void;
export declare function updateSheet(ctx: Context, data: Sheet[]): void;
export declare function activateSheet(ctx: Context, options?: CommonOptions): void;
export declare function setSheetName(ctx: Context, name: string, options?: CommonOptions): void;
export declare function setSheetOrder(ctx: Context, orderList: Record<string, number>): void;
export declare function scroll(ctx: Context, scrollbarX: HTMLDivElement | null, scrollbarY: HTMLDivElement | null, options: {
    scrollLeft?: number;
    scrollTop?: number;
    targetRow?: number;
    targetColumn?: number;
}): void;
