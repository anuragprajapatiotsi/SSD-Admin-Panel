import { Context } from "../context";
import { GlobalCache } from "../types";
export declare function onCellsMoveStart(ctx: Context, globalCache: GlobalCache, e: MouseEvent, scrollbarX: HTMLDivElement, scrollbarY: HTMLDivElement, container: HTMLDivElement): void;
export declare function onCellsMove(ctx: Context, globalCache: GlobalCache, e: MouseEvent, scrollbarX: HTMLDivElement, scrollbarY: HTMLDivElement, container: HTMLDivElement): void;
export declare function onCellsMoveEnd(ctx: Context, globalCache: GlobalCache, e: MouseEvent, scrollbarX: HTMLDivElement, scrollbarY: HTMLDivElement, container: HTMLDivElement): void;
