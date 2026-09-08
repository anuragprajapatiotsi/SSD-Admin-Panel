import { Context } from "..";
import { GlobalCache } from "../types";
export declare function handleOverlayTouchStart(ctx: Context, e: TouchEvent, globalCache: GlobalCache): void;
export declare function handleOverlayTouchMove(ctx: Context, e: TouchEvent, globalCache: GlobalCache, scrollbarX: HTMLDivElement, scrollbarY: HTMLDivElement): void;
export declare function handleOverlayTouchEnd(globalCache: GlobalCache): void;
