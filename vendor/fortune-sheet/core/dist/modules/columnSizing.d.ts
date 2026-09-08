import { Context } from "../context";
export declare const MIN_COLUMN_WIDTH = 10;
export declare const MAX_COLUMN_WIDTH = 2038;
export declare function canResizeColumn(ctx: Context, column: number, sheetId?: string): boolean;
export declare function applyColumnWidths(ctx: Context, columnWidths: Record<string, number>, custom?: boolean, sheetId?: string): void;
export declare function getAutoFitColumnIndexes(ctx: Context, targetColumn: number): number[];
export declare function autoFitColumns(ctx: Context, renderContext: CanvasRenderingContext2D, targetColumns: number[]): void;
