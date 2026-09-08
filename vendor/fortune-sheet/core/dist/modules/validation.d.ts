import { Context } from "../context";
export declare const error: {
    v: string;
    n: string;
    na: string;
    r: string;
    d: string;
    nm: string;
    nl: string;
    sp: string;
};
export declare function valueIsError(value: string): boolean;
export declare function isRealNull(val: any): boolean;
export declare function isRealNum(val: any): boolean;
export declare function isdatetime(s: any, format?: string): boolean;
export declare function diff(now: any, then: any): number;
export declare function isdatatypemulti(s: any): any;
export declare function isdatatype(s: any): string;
export declare function hasPartMC(ctx: Context, cfg: any, r1: number, r2: number, c1: number, c2: number): boolean;
