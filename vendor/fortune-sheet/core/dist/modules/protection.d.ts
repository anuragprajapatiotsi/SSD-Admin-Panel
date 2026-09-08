import { Context } from "../context";
export declare function checkCellIsLocked(ctx: Context, r: number, c: number, sheetId: string): boolean;
export declare function checkProtectionSelectLockedOrUnLockedCells(ctx: Context, r: number, c: number, sheetId: string): boolean;
export declare function checkProtectionAllSelected(ctx: Context, sheetId: string): boolean;
export declare function checkProtectionFormatCells(ctx: Context): boolean;
