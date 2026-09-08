import { Patch } from "immer";
import { Context } from "../context";
import { Op, Sheet } from "../types";
export type ChangedSheet = {
    index?: number;
    id?: string;
    value?: Sheet;
    order?: number;
};
export type PatchOptions = {
    insertRowColOp?: {
        type: "row" | "column";
        index: number;
        count: number;
        direction: "lefttop" | "rightbottom";
        id: string;
    };
    deleteRowColOp?: {
        type: "row" | "column";
        start: number;
        end: number;
        id: string;
    };
    restoreDeletedCells?: boolean;
    addSheetOp?: boolean;
    deleteSheetOp?: {
        id: string;
    };
    addSheet?: ChangedSheet;
    deletedSheet?: ChangedSheet;
    id?: string;
};
export declare function filterPatch(patches: Patch[]): Patch[];
export declare function extractFormulaCellOps(ops: Op[]): Op[];
export declare function patchToOp(ctx: Context, patches: Patch[], options?: PatchOptions, undo?: boolean): Op[];
export declare function opToPatch(ctx: Context, ops: Op[]): [Patch[], Op[]];
export declare function inverseRowColOptions(options?: PatchOptions): PatchOptions | undefined;
