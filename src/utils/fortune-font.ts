import type { Cell, Sheet } from "@fortune-sheet/core";

export const WORKBOOK_FONT = "Arial";

function applyCellFont(cell: Cell | null): Cell | null {
  if (!cell) return cell;

  return {
    ...cell,
    ff: WORKBOOK_FONT,
    ...(Array.isArray(cell.ct?.s) ? {
      ct: {
        ...cell.ct,
        s: cell.ct.s.map((run: Record<string, unknown>) => ({ ...run, ff: WORKBOOK_FONT })),
      },
    } : {}),
  };
}

// Normalize both imported sparse workbooks and generated cell matrices.
export function applyWorkbookFont(sheets: Sheet[]): Sheet[] {
  return sheets.map((sheet) => ({
    ...sheet,
    ...(sheet.data ? { data: sheet.data.map((row) => row.map(applyCellFont)) } : {}),
    ...(sheet.celldata ? {
      celldata: sheet.celldata.map((cell) => ({ ...cell, v: applyCellFont(cell.v) })),
    } : {}),
  }));
}
