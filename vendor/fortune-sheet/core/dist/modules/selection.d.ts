import type { Sheet as SheetType, Freezen, Range } from "../types";
import { Context } from "../context";
export declare const selectionCache: {
    isPasteAction: boolean;
};
export declare function scrollToHighlightCell(ctx: Context, r: number, c: number): void;
export declare function seletedHighlistByindex(ctx: Context, r1: number, r2: number, c1: number, c2: number): {
    left: number;
    width: number;
    top: number;
    height: number;
} | null;
export declare function normalizeSelection(ctx: Context, selection: SheetType["luckysheet_select_save"]): import("../types").Selection[] | undefined;
export declare function selectTitlesMap(rangeMap: Record<string, number>, range1: number, range2: number): Record<string, number>;
export declare function selectTitlesRange(map: Record<string, number>): number[][];
export declare function pasteHandlerOfPaintModel(ctx: Context, copyRange: Context["luckysheet_copy_save"]): void;
export declare function selectionCopyShow(range: any, ctx: Context): void;
export declare function rowHasMerged(ctx: Context, r: number, c1: number, c2: number): boolean;
export declare function colHasMerged(ctx: Context, c: number, r1: number, r2: number): boolean;
export declare function getRowMerge(ctx: Context, rIndex: number, c1: number, c2: number): (number | null)[];
export declare function getColMerge(ctx: Context, cIndex: number, r1: number, r2: number): (number | null)[];
export declare function moveHighlightCell(ctx: Context, postion: "down" | "right", index: number, type: "rangeOfSelect" | "rangeOfFormula"): void;
export declare function moveHighlightRange(ctx: Context, postion: "down" | "right", index: number, type: "rangeOfSelect" | "rangeOfFormula"): void;
export declare function rangeValueToHtml(ctx: Context, sheetId: string, ranges?: Range): string | null;
export declare function copy(ctx: Context): void;
export declare function deleteSelectedCellText(ctx: Context): string;
export declare function selectIsOverlap(ctx: Context, range?: any): boolean;
export declare function selectAll(ctx: Context): void;
export declare function fixRowStyleOverflowInFreeze(ctx: Context, r1: number, r2: number, freeze: Freezen | undefined): {
    top?: number;
    height?: number;
    display?: string;
};
export declare function fixColumnStyleOverflowInFreeze(ctx: Context, c1: number, c2: number, freeze: Freezen | undefined): {
    left?: number;
    width?: number;
    display?: string;
};
export declare function calcSelectionInfo(ctx: Context, lang?: string | null): {
    numberC: number;
    count: number;
    sum: number;
    max: number;
    min: number;
    average: string;
};
