import { api, Cell, Context, Op, Range, Selection, Presence, Settings, SingleRange, Sheet, CellMatrix, CellWithRowAndCol } from "@fortune-sheet/core";
import { SetContextOptions } from "../../context";
export declare function generateAPIs(context: Context, setContext: (recipe: (ctx: Context) => void, options?: SetContextOptions) => void, handleUndo: () => void, handleRedo: () => void, settings: Required<Settings>, cellInput: HTMLDivElement | null, scrollbarX: HTMLDivElement | null, scrollbarY: HTMLDivElement | null): {
    applyOp: (ops: Op[]) => void;
    getCellValue: (row: number, column: number, options?: api.CommonOptions & {
        type?: keyof Cell;
    }) => any;
    setCellValue: (row: number, column: number, value: any, options?: api.CommonOptions & {
        type?: keyof Cell;
    }) => void;
    clearCell: (row: number, column: number, options?: api.CommonOptions) => void;
    setCellFormat: (row: number, column: number, attr: keyof Cell, value: any, options?: api.CommonOptions) => void;
    autoFillCell: (copyRange: SingleRange, applyRange: SingleRange, direction: "up" | "down" | "left" | "right") => void;
    freeze: (type: "row" | "column" | "both", range: {
        row: number;
        column: number;
    }, options?: api.CommonOptions) => void;
    insertRowOrColumn: (type: "row" | "column", index: number, count: number, direction?: "lefttop" | "rightbottom", options?: api.CommonOptions) => void;
    deleteRowOrColumn: (type: "row" | "column", start: number, end: number, options?: api.CommonOptions) => void;
    hideRowOrColumn: (rowOrColInfo: string[], type: "row" | "column") => void;
    showRowOrColumn: (rowOrColInfo: string[], type: "row" | "column") => void;
    setRowHeight: (rowInfo: Record<string, number>, options?: api.CommonOptions, custom?: boolean) => void;
    setColumnWidth: (columnInfo: Record<string, number>, options?: api.CommonOptions, custom?: boolean) => void;
    getRowHeight: (rows: number[], options?: api.CommonOptions) => Record<number, number>;
    getColumnWidth: (columns: number[], options?: api.CommonOptions) => Record<number, number>;
    getSelection: () => {
        row: number[];
        column: number[];
    }[] | undefined;
    getFlattenRange: (range: Range) => {
        r: number;
        c: number;
    }[];
    getCellsByFlattenRange: (range?: {
        r: number;
        c: number;
    }[]) => (Cell | null)[];
    getSelectionCoordinates: () => string[];
    getCellsByRange: (range: Selection, options?: api.CommonOptions) => (Cell | null)[][];
    getHtmlByRange: (range: Range, options?: api.CommonOptions) => string | null;
    setSelection: (range: Range, options?: api.CommonOptions) => void;
    setCellValuesByRange: (data: any[][], range: SingleRange, options?: api.CommonOptions) => void;
    setCellFormatByRange: (attr: keyof Cell, value: any, range: Range | SingleRange, options?: api.CommonOptions) => void;
    mergeCells: (ranges: Range, type: string, options?: api.CommonOptions) => void;
    cancelMerge: (ranges: Range, options?: api.CommonOptions) => void;
    getAllSheets: () => Sheet[];
    getSheet: (options?: api.CommonOptions) => {
        celldata: CellWithRowAndCol[];
        name: string;
        config?: import("@fortune-sheet/core").SheetConfig | undefined;
        order?: number | undefined;
        color?: string | undefined;
        data?: CellMatrix | undefined;
        id?: string | undefined;
        images?: import("@fortune-sheet/core").Image[] | undefined;
        zoomRatio?: number | undefined;
        column?: number | undefined;
        row?: number | undefined;
        addRows?: number | undefined;
        status?: number | undefined;
        hide?: number | undefined;
        luckysheet_select_save?: Selection[] | undefined;
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
    addSheet: (sheetId?: string) => void;
    deleteSheet: (options?: api.CommonOptions) => void;
    updateSheet: (data: Sheet[]) => void;
    activateSheet: (options?: api.CommonOptions) => void;
    setSheetName: (name: string, options?: api.CommonOptions) => void;
    setSheetOrder: (orderList: Record<string, number>) => void;
    scroll: (options: {
        scrollLeft?: number;
        scrollTop?: number;
        targetRow?: number;
        targetColumn?: number;
    }) => void;
    addPresences: (newPresences: Presence[]) => void;
    removePresences: (arr: {
        username: string;
        userId?: string;
    }[]) => void;
    handleUndo: () => void;
    handleRedo: () => void;
    calculateFormula: (id?: string, range?: SingleRange) => void;
    dataToCelldata: (data: CellMatrix | undefined) => CellWithRowAndCol[];
    celldataToData: (celldata: CellWithRowAndCol[], rowCount?: number, colCount?: number) => CellMatrix | null;
    batchCallApis: (apiCalls: {
        name: string;
        args: any[];
    }[]) => void;
};
