import { Context } from "../context";
import { CellMatrix, GlobalCache } from "../types";
export declare function getArrowCanvasSize(fromX: number, fromY: number, toX: number, toY: number): {
    left: number;
    top: number;
    width: number;
    height: number;
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
};
export declare function drawArrow(rc: string, { left, top, width, height, fromX, fromY, toX, toY, }: {
    left: number;
    top: number;
    width: number;
    height: number;
    fromX: number;
    fromY: number;
    toX: number;
    toY: number;
}, color?: string, theta?: number, headlen?: number): void;
type CommentBoxProps = {
    defaultWidth: number;
    defaultHeight: number;
    currentObj: null;
    currentWinW: null;
    currentWinH: null;
    resize: null;
    resizeXY: null;
    move: boolean;
    moveXY: object | null;
    cursorStartPosition: {
        x: number;
        y: number;
    } | null;
};
export declare const commentBoxProps: CommentBoxProps;
export declare function getCellTopRightPostion(ctx: Context, flowdata: CellMatrix, r: number, c: number): {
    toX: number;
    toY: number;
};
export declare function getCommentBoxByRC(ctx: Context, flowdata: CellMatrix, r: number, c: number): {
    r: number;
    c: number;
    rc: string;
    left: number;
    top: number;
    width: number;
    height: number;
    value: string;
    size: {
        left: number;
        top: number;
        width: number;
        height: number;
        fromX: number;
        fromY: number;
        toX: number;
        toY: number;
    };
    autoFocus: boolean;
};
export declare function setEditingComment(ctx: Context, flowdata: CellMatrix, r: number, c: number): void;
export declare function removeEditingComment(ctx: Context, globalCache: GlobalCache): void;
export declare function newComment(ctx: Context, globalCache: GlobalCache, r: number, c: number): void;
export declare function editComment(ctx: Context, globalCache: GlobalCache, r: number, c: number): void;
export declare function deleteComment(ctx: Context, globalCache: GlobalCache, r: number, c: number): void;
export declare function showComments(ctx: Context, commentShowCells: {
    r: number;
    c: number;
}[]): void;
export declare function showHideComment(ctx: Context, globalCache: GlobalCache, r: number, c: number): void;
export declare function showHideAllComments(ctx: Context): void;
export declare function overShowComment(ctx: Context, e: MouseEvent, scrollX: HTMLDivElement, scrollY: HTMLDivElement, container: HTMLDivElement): void;
export declare function getCommentBoxPosition(commentId: string): {
    left: number;
    top: number;
    width: number;
    height: number;
} | undefined;
export declare function onCommentBoxResizeStart(ctx: Context, globalCache: GlobalCache, e: MouseEvent, { r, c, rc }: {
    r: number;
    c: number;
    rc: string;
}, resizingId: string, resizingSide: string): void;
export declare function onCommentBoxResize(ctx: Context, globalCache: GlobalCache, e: MouseEvent): boolean;
export declare function onCommentBoxResizeEnd(ctx: Context, globalCache: GlobalCache): void;
export declare function onCommentBoxMoveStart(ctx: Context, globalCache: GlobalCache, e: MouseEvent, { r, c, rc }: {
    r: number;
    c: number;
    rc: string;
}, movingId: string): void;
export declare function onCommentBoxMove(ctx: Context, globalCache: GlobalCache, e: MouseEvent): boolean;
export declare function onCommentBoxMoveEnd(ctx: Context, globalCache: GlobalCache): void;
export {};
