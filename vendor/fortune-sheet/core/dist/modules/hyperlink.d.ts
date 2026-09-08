import { Context } from "../context";
import { GlobalCache } from "../types";
export declare function getCellRowColumn(ctx: Context, e: MouseEvent, container: HTMLDivElement, scrollX: HTMLDivElement, scrollY: HTMLDivElement): {
    r: number;
    c: number;
} | undefined;
export declare function getCellHyperlink(ctx: Context, r: number, c: number): {
    linkType: string;
    linkAddress: string;
} | undefined;
export declare function saveHyperlink(ctx: Context, r: number, c: number, linkText: string, linkType: string, linkAddress: string): void;
export declare function removeHyperlink(ctx: Context, r: number, c: number): void;
export declare function showLinkCard(ctx: Context, r: number, c: number, isEditing?: boolean, isMouseDown?: boolean): void;
export declare function goToLink(ctx: Context, r: number, c: number, linkType: string, linkAddress: string, scrollbarX: HTMLDivElement, scrollbarY: HTMLDivElement): void;
export declare function isLinkValid(ctx: Context, linkType: string, linkAddress: string): {
    isValid: boolean;
    tooltip: string;
};
export declare function onRangeSelectionModalMoveStart(ctx: Context, globalCache: GlobalCache, e: MouseEvent): void;
export declare function onRangeSelectionModalMove(globalCache: GlobalCache, e: MouseEvent): void;
export declare function onRangeSelectionModalMoveEnd(globalCache: GlobalCache): void;
