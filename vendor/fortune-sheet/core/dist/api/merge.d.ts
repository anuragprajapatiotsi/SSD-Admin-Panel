import { Context } from "..";
import { Range } from "../types";
import { CommonOptions } from "./common";
export declare function mergeCells(ctx: Context, ranges: Range, type: string, options?: CommonOptions): void;
export declare function cancelMerge(ctx: Context, ranges: Range, options?: CommonOptions): void;
