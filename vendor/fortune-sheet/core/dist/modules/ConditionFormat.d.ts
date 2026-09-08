import { Context } from "../context";
import { CellMatrix, Sheet } from "../types";
export declare function getHistoryRules(fileH: Sheet[]): {
    sheetIndex: number;
    luckysheet_conditionformat_save: any[] | undefined;
}[];
export declare function getCurrentRules(fileC: Sheet[]): {
    sheetIndex: number;
    luckysheet_conditionformat_save: any[] | undefined;
}[];
export declare function setConditionRules(ctx: Context, protection: any, generalDialog: any, conditionformat: any, rules: any): void;
export declare function getColorGradation(color1: string, color2: string, value1: number, value2: number, value: number): string;
export declare function compute(ctx: Context, ruleArr: any, d: CellMatrix): any;
export declare function getComputeMap(ctx: Context): any;
export declare function checkCF(r: number, c: number, computeMap: any): any;
export declare function updateItem(ctx: Context, type: string): void;
export declare function CFSplitRange(range1: any, range2: any, range3: any, type: string): any;
