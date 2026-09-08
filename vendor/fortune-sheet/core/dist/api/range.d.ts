import { Selection } from "..";
import { Context } from "../context";
import { Cell, Range, SingleRange } from "../types";
import { CommonOptions } from "./common";
export declare function getSelection(ctx: Context): {
    row: number[];
    column: number[];
}[] | undefined;
export declare function getFlattenRange(ctx: Context, range?: Range): {
    r: number;
    c: number;
}[];
export declare function getCellsByFlattenRange(ctx: Context, range?: {
    r: number;
    c: number;
}[]): (Cell | null)[];
export declare function getSelectionCoordinates(ctx: Context): string[];
export declare function getCellsByRange(ctx: Context, range: Selection, options?: CommonOptions): (Cell | null)[][];
export declare function getHtmlByRange(ctx: Context, range: Range, options?: CommonOptions): string | null;
export declare function setSelection(ctx: Context, range: Range, options: CommonOptions): void;
export declare function setCellValuesByRange(ctx: Context, data: any[][], range: SingleRange, cellInput: HTMLDivElement | null, options?: CommonOptions): void;
export declare function setCellFormatByRange(ctx: Context, attr: keyof Cell, value: any, range: Range | SingleRange, options?: CommonOptions): void;
