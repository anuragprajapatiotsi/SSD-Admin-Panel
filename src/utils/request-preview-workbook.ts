import type { Cell, Sheet } from "@fortune-sheet/core";
import { requestList, requestRecord, requestText } from "./request-workbook-preview";

function requestPreviewCell(value: unknown): Cell {
  const raw = typeof value === "number" || typeof value === "string" || typeof value === "boolean" ? value : "";
  return {
    v: raw,
    // Fortune's text renderer checks isEmpty(m ?? v). A raw number or
    // boolean is considered empty by lodash, so display text is required.
    // Keep v typed and unchanged; m must not round or reinterpret API data.
    m: String(raw),
    ct: { t: typeof raw === "number" ? "n" : typeof raw === "boolean" ? "b" : "s", fa: "General" },
    fs: 10, ff: "Arial", tb: "2",
  };
}

/** Fortune binding only. No canonical model, pivot, flattening, invented headers or value correction. */
export function createRequestPreviewWorkbook(response: Record<string, unknown>, sheetName: string): Sheet[] {
  const preview = requestRecord(response.preview);
  const columns = requestList(preview.columns);
  const rows = requestList(preview.rows).map((row) => Array.isArray(row.values) ? row.values
    : columns.map((column) => requestRecord(row.cells)[requestText(column.key)]));
  return [{
    id: "request-workbook", name: sheetName, status: 1,
    row: Math.max(rows.length, 1), column: Math.max(1, ...rows.map((row) => row.length)),
    celldata: rows.flatMap((row, r) => row.map((value, c) => ({ r, c, v: requestPreviewCell(value) }))),
    config: {}, defaultRowHeight: 24, defaultColWidth: 160,
  }];
}
