import { Context } from "../context";
export declare function labelFilterOptionState(ctx: Context, optionstate: boolean, rowhidden: Record<string, number>, caljs: any, str: number, edr: number, cindex: number, stc: number, edc: number, saveData: boolean): void;
export declare function orderbydatafiler(ctx: Context, str: number, stc: number, edr: number, edc: number, curr: number, asc: boolean): string | null;
export declare function createFilterOptions(ctx: Context, luckysheet_filter_save: {
    row: number[];
    column: number[];
} | undefined, sheetId: string | undefined, filterObj?: any, saveData?: boolean): void;
export declare function clearFilter(ctx: Context): void;
export declare function createFilter(ctx: Context): void;
export type FilterDate = {
    key: string;
    type: string;
    value: string;
    text: string;
    rows: number[];
    dateValues: string[];
    children: FilterDate[];
};
export type FilterValue = {
    key: string;
    value: any;
    mask: any;
    text: string;
    rows: number[];
};
export declare function getFilterColumnValues(ctx: Context, col: number, startRow: number, endRow: number, startCol: number): {
    dates: FilterDate[];
    datesUncheck: string[];
    dateRowMap: Record<string, number[]>;
    values: FilterValue[];
    valuesUncheck: string[];
    valueRowMap: Record<string, number[]>;
    visibleRows: number[];
    flattenValues: string[];
};
export type FilterColor = {
    color: string;
    checked: boolean;
    rows: number[];
};
export declare function getFilterColumnColors(ctx: Context, col: number, startRow: number, endRow: number): {
    bgColors: FilterColor[];
    fcColors: FilterColor[];
};
export declare function saveFilter(ctx: Context, optionState: boolean, hiddenRows: Record<string, number>, caljs: any, st_r: number, ed_r: number, cindex: number, st_c: number, ed_c: number): void;
