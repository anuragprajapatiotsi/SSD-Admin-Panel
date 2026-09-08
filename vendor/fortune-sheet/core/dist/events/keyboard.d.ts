import { Context } from "../context";
import { GlobalCache } from "../types";
export declare function handleGlobalEnter(ctx: Context, cellInput: HTMLDivElement, e: KeyboardEvent, canvas?: CanvasRenderingContext2D): void;
export declare function handleWithCtrlOrMetaKey(ctx: Context, cache: GlobalCache, e: KeyboardEvent, cellInput: HTMLDivElement, fxInput: HTMLDivElement | null | undefined, handleUndo: () => void, handleRedo: () => void): void;
export declare function handleArrowKey(ctx: Context, e: KeyboardEvent): void;
export declare function handleGlobalKeyDown(ctx: Context, cellInput: HTMLDivElement, fxInput: HTMLDivElement | null | undefined, e: KeyboardEvent, cache: GlobalCache, handleUndo: () => void, handleRedo: () => void, canvas?: CanvasRenderingContext2D): void;
