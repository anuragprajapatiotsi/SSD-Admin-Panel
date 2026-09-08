import { Freezen } from "..";
import { Context } from "../context";
import { Settings } from "../settings";
import { GlobalCache } from "../types";
export declare function handleGlobalWheel(ctx: Context, e: WheelEvent, cache: GlobalCache, scrollbarX: HTMLDivElement, scrollbarY: HTMLDivElement): {
    scrollTop?: number | undefined;
    scrollLeft?: number | undefined;
} | undefined;
export declare function fixPositionOnFrozenCells(freeze: Freezen | undefined, x: number, y: number, mouseX: number, mouseY: number): {
    x: number;
    y: number;
    inHorizontalFreeze: boolean;
    inVerticalFreeze: boolean;
};
export declare function handleCellAreaMouseDown(ctx: Context, globalCache: GlobalCache, e: MouseEvent, cellInput: HTMLDivElement, container: HTMLDivElement, fxInput?: HTMLDivElement | null, canvas?: CanvasRenderingContext2D): void;
export declare function handleCellAreaDoubleClick(ctx: Context, globalCache: GlobalCache, settings: Settings, e: MouseEvent, container: HTMLElement): void;
export declare function handleContextMenu(ctx: Context, settings: Settings, e: MouseEvent, workbookContainer: HTMLDivElement, container: HTMLDivElement, area: "cell" | "rowHeader" | "columnHeader"): void;
export declare function handleOverlayMouseMove(ctx: Context, globalCache: GlobalCache, e: MouseEvent, cellInput: HTMLDivElement, scrollX: HTMLDivElement, scrollY: HTMLDivElement, container: HTMLDivElement, fxInput?: HTMLDivElement | null): void;
export declare function handleOverlayMouseUp(ctx: Context, globalCache: GlobalCache, settings: Settings, e: MouseEvent, scrollbarX: HTMLDivElement, scrollbarY: HTMLDivElement, container: HTMLDivElement, cellInput: HTMLDivElement | null, fxInput: HTMLDivElement | null): void;
export declare function handleRowHeaderMouseDown(ctx: Context, globalCache: GlobalCache, e: MouseEvent, container: HTMLDivElement, cellInput: HTMLDivElement, fxInput: HTMLDivElement | null): void;
export declare function handleColumnHeaderMouseDown(ctx: Context, globalCache: GlobalCache, e: MouseEvent, container: HTMLElement, cellInput: HTMLDivElement, fxInput: HTMLDivElement | null): void;
export declare function handleColSizeHandleMouseDown(ctx: Context, globalCache: GlobalCache, e: MouseEvent, headerContainer: HTMLDivElement, workbookContainer: HTMLDivElement, cellArea: HTMLDivElement): void;
export declare function handleRowSizeHandleMouseDown(ctx: Context, globalCache: GlobalCache, e: MouseEvent, headerContainer: HTMLDivElement, workbookContainer: HTMLDivElement, cellArea: HTMLDivElement): void;
export declare function handleColFreezeHandleMouseDown(ctx: Context, globalCache: GlobalCache, e: MouseEvent, headerContainer: HTMLDivElement, workbookContainer: HTMLDivElement, cellArea: HTMLDivElement): void;
export declare function handleRowFreezeHandleMouseDown(ctx: Context, globalCache: GlobalCache, e: MouseEvent, headerContainer: HTMLDivElement, workbookContainer: HTMLDivElement, cellArea: HTMLDivElement): void;
