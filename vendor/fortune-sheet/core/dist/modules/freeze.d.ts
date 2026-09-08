import { Context, Freezen, GlobalCache } from "..";
export declare function initFreeze(ctx: Context, cache: GlobalCache, sheetId: string): void;
export declare function scrollToFrozenRowCol(ctx: Context, freeze: Freezen | undefined): void;
export declare function getFrozenHandleTop(ctx: Context): number;
export declare function getFrozenHandleLeft(ctx: Context): number;
