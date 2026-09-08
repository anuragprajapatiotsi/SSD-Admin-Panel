import { Context } from "../context";
import { CellMatrix, SearchResult, GlobalCache } from "../types";
export declare function getSearchIndexArr(searchText: string, range: {
    row: number[];
    column: number[];
}[], flowdata: CellMatrix, { regCheck, wordCheck, caseCheck }?: {
    regCheck: boolean;
    wordCheck: boolean;
    caseCheck: boolean;
}): {
    r: number;
    c: number;
}[];
export declare function searchNext(ctx: Context, searchText: string, checkModes: {
    regCheck: boolean;
    wordCheck: boolean;
    caseCheck: boolean;
}): string | null;
export declare function searchAll(ctx: Context, searchText: string, checkModes: {
    regCheck: boolean;
    wordCheck: boolean;
    caseCheck: boolean;
}): SearchResult[];
export declare function onSearchDialogMoveStart(globalCache: GlobalCache, e: MouseEvent, container: HTMLDivElement): void;
export declare function onSearchDialogMove(globalCache: GlobalCache, e: MouseEvent): void;
export declare function onSearchDialogMoveEnd(globalCache: GlobalCache): void;
export declare function replace(ctx: Context, searchText: string, replaceText: string, checkModes: {
    regCheck: boolean;
    wordCheck: boolean;
    caseCheck: boolean;
}): string | null;
export declare function replaceAll(ctx: Context, searchText: string, replaceText: string, checkModes: {
    regCheck: boolean;
    wordCheck: boolean;
    caseCheck: boolean;
}): string;
