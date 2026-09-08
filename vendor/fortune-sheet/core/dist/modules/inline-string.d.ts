import { Context } from "../context";
import { Cell, CellMatrix, CellStyle } from "../types";
export declare const attrToCssName: {
    bl: string;
    it: string;
    ff: string;
    fs: string;
    fc: string;
    cl: string;
    un: string;
};
export declare const inlineStyleAffectAttribute: {
    bl: number;
    it: number;
    ff: number;
    cl: number;
    un: number;
    fs: number;
    fc: number;
};
export declare const inlineStyleAffectCssName: {
    "font-weight": number;
    "font-style": number;
    "font-family": number;
    "text-decoration": number;
    "border-bottom": number;
    "font-size": number;
    color: number;
};
export declare function isInlineStringCell(cell: any): boolean;
export declare function isInlineStringCT(ct: any): boolean;
export declare function getInlineStringNoStyle(r: number, c: number, data: CellMatrix): string;
export declare function convertCssToStyleList(cssText: string, originCell: Cell): CellStyle;
export declare function convertSpanToShareString($dom: NodeListOf<HTMLSpanElement>, originCell: Cell): CellStyle[];
export declare function updateInlineStringFormatOutside(cell: Cell, key: string, value: any): void;
export declare function updateInlineStringFormat(ctx: Context, cell: Cell, attr: keyof Cell, value: any, cellInput: HTMLDivElement): void;
