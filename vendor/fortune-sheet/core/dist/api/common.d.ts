import { Context } from "../context";
import { CellMatrix, CellWithRowAndCol, Sheet } from "../types";
export type CommonOptions = {
    index?: number;
    id?: string;
};
export declare const dataToCelldata: (data: CellMatrix | undefined) => CellWithRowAndCol[];
export declare const celldataToData: (celldata: CellWithRowAndCol[], rowCount?: number, colCount?: number) => CellMatrix | null;
export declare function getSheet(ctx: Context, options?: CommonOptions): Sheet;
export declare function getSheetWithLatestCelldata(ctx: Context, options?: CommonOptions): {
    celldata: CellWithRowAndCol[];
    name: string;
    config?: import("../types").SheetConfig | undefined;
    order?: number | undefined;
    color?: string | undefined;
    data?: CellMatrix | undefined;
    id?: string | undefined;
    images?: import("../types").Image[] | undefined;
    zoomRatio?: number | undefined;
    column?: number | undefined;
    row?: number | undefined;
    addRows?: number | undefined;
    status?: number | undefined;
    hide?: number | undefined;
    luckysheet_select_save?: import("../types").Selection[] | undefined;
    luckysheet_selection_range?: {
        row: number[];
        column: number[];
    }[] | undefined;
    calcChain?: any[] | undefined;
    defaultRowHeight?: number | undefined;
    defaultColWidth?: number | undefined;
    showGridLines?: number | boolean | undefined;
    pivotTable?: any;
    isPivotTable?: boolean | undefined;
    filter?: Record<string, any> | undefined;
    filter_select?: {
        row: number[];
        column: number[];
    } | undefined;
    luckysheet_conditionformat_save?: any[] | undefined;
    luckysheet_alternateformat_save?: any[] | undefined;
    dataVerification?: any;
    hyperlink?: Record<string, {
        linkType: string;
        linkAddress: string;
    }> | undefined;
    dynamicArray_compute?: any;
    dynamicArray?: any[] | undefined;
    frozen?: {
        type: "row" | "column" | "both" | "rangeRow" | "rangeColumn" | "rangeBoth";
        range?: {
            row_focus: number;
            column_focus: number;
        } | undefined;
    } | undefined;
};
