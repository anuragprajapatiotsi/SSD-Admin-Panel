import type { Cell, Sheet } from "@fortune-sheet/core";
import {
  transformExcelToFortune,
  transformFortuneToExcel,
} from "@corbe30/fortune-excel";

export type FortuneWorkbookData = Sheet[];

type ImportedImageAnchor = {
  fromCol?: number;
  toCol?: number;
};

function maximumImportedColumnIndex(sheet: Sheet) {
  let maximum = Math.max((sheet.column ?? 0) - 1, 0);

  sheet.celldata?.forEach((cell) => {
    maximum = Math.max(maximum, cell.c);
  });
  sheet.data?.forEach((row) => {
    maximum = Math.max(maximum, row.length - 1);
  });
  Object.values(sheet.config?.merge ?? {}).forEach((range) => {
    maximum = Math.max(maximum, range.c + range.cs - 1);
  });
  sheet.luckysheet_select_save?.forEach((selection) => {
    maximum = Math.max(maximum, ...selection.column);
  });
  sheet.images?.forEach((image) => {
    const anchor = image as typeof image & ImportedImageAnchor;
    maximum = Math.max(maximum, anchor.fromCol ?? 0, anchor.toCol ?? 0);
  });

  return maximum;
}

function normalizeImportedColumnWidths(sheet: Sheet): Sheet {
  const importedConfig = sheet.config;
  if (!importedConfig) return sheet;

  const maximumColumn = maximumImportedColumnIndex(sheet);
  const columnWidths = importedConfig.columnlen ?? {};
  const customWidths = importedConfig.customWidth ?? {};
  const normalizedWidths = Object.fromEntries(
    Object.entries(columnWidths).filter(([column, width]) => {
      const columnIndex = Number(column);
      return Number.isInteger(columnIndex)
        && columnIndex >= 0
        && Number.isFinite(width)
        && columnIndex <= maximumColumn;
    }),
  );
  const normalizedCustomWidths = Object.fromEntries(
    Object.entries(customWidths).filter(([column]) => {
      const columnIndex = Number(column);
      return Number.isInteger(columnIndex)
        && columnIndex >= 0
        && columnIndex <= maximumColumn;
    }),
  );

  return {
    ...sheet,
    config: {
      ...importedConfig,
      ...(importedConfig.columnlen ? { columnlen: normalizedWidths } : {}),
      ...(importedConfig.customWidth ? { customWidth: normalizedCustomWidths } : {}),
    },
  };
}

function cellValue(value: unknown): Cell {
  const normalizedValue = value instanceof Date ? value.toISOString() : value;
  const supportedValue = typeof normalizedValue === "string"
    || typeof normalizedValue === "number"
    || typeof normalizedValue === "boolean"
    ? normalizedValue
    : normalizedValue == null ? "" : String(normalizedValue);

  return {
    v: supportedValue,
    m: String(supportedValue),
    ct: { t: typeof supportedValue === "number" ? "n" : "s" },
  };
}

export function createFortuneWorkbookFromRows(name: string, rows: unknown[][]): FortuneWorkbookData {
  const celldata = rows.flatMap((row, rowIndex) => row.map((value, columnIndex) => ({
    r: rowIndex,
    c: columnIndex,
    v: cellValue(value),
  })));

  return [{
    id: `sheet-${crypto.randomUUID()}`,
    name,
    order: 0,
    status: 1,
    row: Math.max(rows.length + 20, 30),
    column: Math.max(rows.reduce((maximum, row) => Math.max(maximum, row.length), 0), 12),
    celldata,
  }];
}

export async function parseFileToFortuneWorkbook(file: File): Promise<FortuneWorkbookData> {
  let workbook: FortuneWorkbookData | null = null;

  await transformExcelToFortune(
    file,
    (sheets: FortuneWorkbookData) => {
      workbook = sheets;
    },
    () => undefined,
    { current: null },
  );

  const parsedWorkbook = workbook as FortuneWorkbookData | null;
  if (!parsedWorkbook?.length) throw new Error("The workbook did not contain any readable sheets.");
  return parsedWorkbook.map(normalizeImportedColumnWidths);
}

function hasCellValue(cell: Cell | null | undefined) {
  return cell != null && (cell.v != null || cell.f != null || cell.m != null);
}

export function countFortuneWorkbookRows(workbook: FortuneWorkbookData) {
  return Math.max(workbook.reduce((total, sheet) => {
    if (sheet.data) {
      return total + sheet.data.reduce((count, row) => count + (row.some(hasCellValue) ? 1 : 0), 0);
    }

    const rows = new Set(
      (sheet.celldata ?? [])
        .filter((cell) => hasCellValue(cell.v))
        .map((cell) => cell.r),
    );
    return total + rows.size;
  }, 0), 1);
}

function csvValue(value: unknown) {
  const text = value == null ? "" : String(value);
  return /[",\r\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
}

function workbookToCsv(workbook: FortuneWorkbookData) {
  const sheet = workbook[0];
  const data = sheet?.data ?? [];
  return data.map((row) => row.map((cell) => csvValue(cell?.f ?? cell?.v ?? cell?.m)).join(",")).join("\r\n");
}

function exportCell(value: Cell | string | number | boolean | null | undefined): Cell | null {
  if (value == null) return null;
  if (typeof value !== "object") return cellValue(value);

  // The XLSX adapter reads v, not m. Never use truthiness here: 0 and false
  // are valid data, and an explicitly cleared value must stay cleared.
  if (value.v != null) return value;
  if (value.ct?.t === "inlineStr" && Array.isArray(value.ct.s)) return value;
  if (value.m == null) return value;

  // A display-only value has no reliable raw numeric/date representation.
  // Preserve it as text instead of coercing formatted percentages or dates.
  return {
    ...value,
    v: value.m,
    ct: { ...value.ct, t: typeof value.m === "number" ? "n" : "s" },
  };
}

function prepareWorkbookForExport(workbook: FortuneWorkbookData): FortuneWorkbookData {
  // Keep the exporter (including its style/image helpers) away from live
  // editor state. Inactive sheets may still exist only as sparse celldata.
  return structuredClone(workbook).map((sheet) => {
    const hasCurrentData = Array.isArray(sheet.data);
    let rows = Math.max(sheet.data?.length ?? 0, 1);
    let columns = (sheet.data ?? []).reduce((maximum, row) => Math.max(maximum, row.length), 1);

    if (!hasCurrentData) {
      sheet.celldata?.forEach(({ r, c }) => {
        rows = Math.max(rows, r + 1);
        columns = Math.max(columns, c + 1);
      });
    }
    Object.values(sheet.config?.merge ?? {}).forEach(({ r, c, rs, cs }) => {
      rows = Math.max(rows, r + rs);
      columns = Math.max(columns, c + cs);
    });

    const data: NonNullable<Sheet["data"]> = Array.from({ length: rows }, (_, r) =>
      Array.from({ length: columns }, (_, c) => exportCell(sheet.data?.[r]?.[c])),
    );
    // Current dense data is authoritative. Overlaying the original celldata
    // would restore values that the user has since edited or deleted.
    if (!hasCurrentData) {
      sheet.celldata?.forEach(({ r, c, v }) => {
        data[r][c] = exportCell(v);
      });
    }

    return { ...sheet, data };
  });
}

export async function createFileFromFortuneWorkbook(
  workbookData: FortuneWorkbookData,
  sourceFile: File,
  templateName: string,
) {
  const extension = sourceFile.name.slice(sourceFile.name.lastIndexOf(".")).toLowerCase();
  const baseName = templateName
    .trim()
    .replace(/[<>:"/\\|?*\u0000-\u001f]/g, "-")
    .replace(/[. ]+$/, "")
    || "template";
  const exportWorkbook = prepareWorkbookForExport(workbookData);

  if (extension === ".csv") {
    return new File([workbookToCsv(exportWorkbook)], `${baseName}.csv`, {
      type: "text/csv;charset=utf-8",
    });
  }

  const spreadsheetRef = {
    current: {
      getAllSheets: () => exportWorkbook,
      getSheet: () => exportWorkbook.find((sheet) => sheet.status === 1) ?? exportWorkbook[0],
    },
  };
  const blob = await transformFortuneToExcel(spreadsheetRef, undefined, false);
  return new File([blob], `${baseName}.xlsx`, {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}
