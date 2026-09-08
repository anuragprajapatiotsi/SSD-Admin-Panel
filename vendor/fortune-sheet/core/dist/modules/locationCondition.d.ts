import { Context } from "../context";
export declare function deleteCellInSave(cellSave: Record<string, number>, range: {
    row: any[];
    column: any[];
}): Record<string, number>;
export declare function getRangeArr(minR: number, maxR: number, minC: number, maxC: number, cellSave: Record<string, number>, rangeArr: {
    row: (number | null)[];
    column: (number | null)[];
}[], ctx: Context): any;
export declare function getOptionValue(constants: Record<string, boolean>): string | undefined;
export declare function getSelectRange(ctx: Context): {
    row: number[];
    column: number[];
}[];
export declare function applyLocation(range: {
    row: any[];
    column: any[];
}[], type: string, value: string | undefined, ctx: Context): {
    column: any[];
    row: any[];
}[];
