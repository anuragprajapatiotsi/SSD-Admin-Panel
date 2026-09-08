import type { Cell, Sheet } from "@fortune-sheet/core";
import type { CanonicalCollectionPreview, CanonicalPreviewObservation, PreviewValue } from "./collection-preview-canonical";

type PreviewWorkbookLabels = { data: string; missing: string; notReturned: string; unspecifiedGeography?: string };
type PreviewWorkbookTheme = { background: string; foreground: string; header: string; warning: string; font: string };
export type PreviewCellBinding = {
  row: number;
  column: number;
  observationKeys: string[];
  field: string;
  originalValue: PreviewValue;
  suffix?: string;
};

/** Presentation adapter: canonical observations -> merged measure/period headers. */
export function createCollectionPreviewWorkbook(
  preview: CanonicalCollectionPreview,
  labels: PreviewWorkbookLabels,
  theme: PreviewWorkbookTheme,
): { sheets: Sheet[]; bindings: PreviewCellBinding[] } {
  const bindings: PreviewCellBinding[] = [];
  const sheet: Sheet = {
    id: "collection-extracted-data", name: labels.data, order: 0, status: 1,
    celldata: [], config: { merge: {}, columnlen: {}, rowlen: {} },
    defaultRowHeight: 32, defaultColWidth: 150, showGridLines: true,
  };
  function put(row: number, column: number, value: PreviewValue, header = false, issues: string[] = []) {
    const isPlaceholder = value == null || value === labels.missing || value === labels.notReturned;
    const cell: Cell = {
      v: value ?? labels.missing, m: String(value ?? labels.missing),
      ct: { t: typeof value === "number" ? "n" : "s", fa: typeof value === "number" ? "0.############" : "@" },
      fs: 9, ff: theme.font, fc: theme.foreground, bg: header ? theme.header : theme.background,
      bl: header ? 1 : 0, ht: header ? 0 : typeof value === "number" || isPlaceholder ? 2 : 1, vt: 0, tb: "2",
    };
    if (issues.length) {
      cell.bg = theme.warning;
      cell.ps = { value: [...new Set(issues)].join("\n"), isShow: false, left: null, top: null, width: null, height: null };
    }
    sheet.celldata!.push({ r: row, c: column, v: cell });
  }
  function merge(row: number, column: number, rows: number, columns: number, header = true) {
    if (rows === 1 && columns === 1) return;
    sheet.config!.merge![`${row}_${column}`] = { r: row, c: column, rs: rows, cs: columns };
    for (let r = row; r < row + rows; r++) {
      for (let c = column; c < column + columns; c++) {
        let cell = sheet.celldata!.find((item) => item.r === r && item.c === c);
        if (!cell) { put(r, c, "", header); cell = sheet.celldata![sheet.celldata!.length - 1]; }
        cell.v!.mc = r === row && c === column ? { r: row, c: column, rs: rows, cs: columns } : { r: row, c: column };
      }
    }
  }
  if (preview.canPivot) {
    const dimensions = [...new Map(preview.observations.flatMap((o) => o.dimensions.map((d) => [d.key, d] as const))).values()];
    const measures = [...new Map(preview.observations.map((o) => [o.measure.key, { ...o.measure, unit: o.unit }])).values()];
    const periods = [...new Map(preview.observations.map((o) => [o.period.key, o.period])).values()]
      .sort((a, b) => a.label.localeCompare(b.label, undefined, { numeric: true }));
    const rows = new Map<string, { values: Map<string, string>; identities: Map<string, string>; observations: Map<string, CanonicalPreviewObservation> }>();
    preview.observations.forEach((observation) => {
      const key = JSON.stringify(dimensions.map((d) => observation.dimensions.find((v) => v.key === d.key)?.identity ?? null));
      if (!rows.has(key)) rows.set(key, { values: new Map(observation.dimensions.map((d) => [d.key, d.value])), identities: new Map(observation.dimensions.map((d) => [d.key, d.identity])), observations: new Map() });
      rows.get(key)!.observations.set(JSON.stringify([observation.measure.key, observation.period.key]), observation);
    });
    dimensions.forEach((dimension, c) => {
      put(0, c, dimension.label, true);
      merge(0, c, 2, 1);
      sheet.config!.columnlen![c] = 240;
    });
    measures.forEach((measure, m) => {
      const first = dimensions.length + m * periods.length;
      const title = measure.unit && !measure.label.includes(measure.unit) ? `${measure.label} (${measure.unit})` : measure.label;
      put(0, first, title, true);
      bindings.push({ row: 0, column: first, field: "measure", originalValue: title,
        suffix: title !== measure.label ? ` (${measure.unit})` : undefined,
        observationKeys: preview.observations.filter((o) => o.measure.key === measure.key).map((o) => o.key) });
      merge(0, first, 1, periods.length);
      periods.forEach((period, p) => {
        put(1, first + p, period.label, true); sheet.config!.columnlen![first + p] = 150;
        bindings.push({ row: 1, column: first + p, field: "timePeriod", originalValue: period.label,
          observationKeys: preview.observations.filter((o) => o.measure.key === measure.key && o.period.key === period.key).map((o) => o.key) });
      });
    });
    const groupedRows = [...rows.values()];
    groupedRows.forEach((row, r) => {
      dimensions.forEach((dimension, c) => put(r + 2, c,
        row.values.get(dimension.key) || (dimension.key.startsWith("geography:") ? labels.unspecifiedGeography ?? labels.notReturned : labels.notReturned)));
      measures.forEach((measure, m) => periods.forEach((period, p) => {
        const observation = row.observations.get(JSON.stringify([measure.key, period.key]));
        put(r + 2, dimensions.length + m * periods.length + p,
          !observation ? labels.notReturned : observation.status === "MISSING" || observation.value === null ? labels.missing : observation.value,
          false, observation?.issues);
        if (observation) bindings.push({ row: r + 2, column: dimensions.length + m * periods.length + p,
          field: "value", originalValue: observation.status === "MISSING" || observation.value === null ? labels.missing : observation.value,
          observationKeys: [observation.key] });
      }));
    });
    // Merge only consecutive dimension labels within the same parent group.
    // Numeric observations remain separate even when their values are equal.
    dimensions.forEach((dimension, column) => {
      let start = 0;
      while (start < groupedRows.length) {
        const first = groupedRows[start];
        let end = start + 1;
        while (first.values.get(dimension.key) && end < groupedRows.length
          && dimensions.slice(0, column + 1).every((parent) =>
            first.identities.get(parent.key) === groupedRows[end].identities.get(parent.key)
            && first.values.get(parent.key) === groupedRows[end].values.get(parent.key))) end++;
        if (end - start > 1) merge(start + 2, column, end - start, 1, false);
        bindings.push({ row: start + 2, column,
          field: dimension.key.startsWith("geography:") ? dimension.key : `dimension:${dimension.key}`,
          originalValue: first.values.get(dimension.key) || labels.unspecifiedGeography || labels.notReturned,
          observationKeys: groupedRows.slice(start, end).flatMap((row) => [...row.observations.values()].map((o) => o.key)) });
        start = end;
      }
    });
    sheet.config!.rowlen = { 0: 88, 1: 36 };
    sheet.column = dimensions.length + measures.length * periods.length;
    sheet.row = rows.size + 2;
  } else {
    preview.columns.forEach((column, c) => { put(0, c, column.label, true); sheet.config!.columnlen![c] = 200; });
    preview.flatRows.forEach((row, r) => row.forEach((value, c) => {
      put(r + 1, c, value, false, preview.observations[r]?.issues);
      bindings.push({ row: r + 1, column: c, field: preview.columns[c].key,
        originalValue: value ?? labels.missing, observationKeys: [preview.observations[r].key] });
    }));
    sheet.config!.rowlen = { 0: 44 };
    sheet.column = preview.columns.length;
    sheet.row = preview.flatRows.length + 1;
  }
  sheet.column = Math.max(sheet.column ?? 1, 1);
  sheet.row = Math.max(sheet.row ?? 1, 1);
  if (preview.footerNotes.length) {
    const firstFooterRow = sheet.row + 1;
    const width = Array.from({ length: sheet.column }, (_, c) => sheet.config!.columnlen![c] ?? 150)
      .reduce((sum, value) => sum + value, 0);
    preview.footerNotes.forEach((note, index) => {
      const row = firstFooterRow + index;
      put(row, 0, note);
      merge(row, 0, 1, sheet.column!, false);
      const lines = note.split("\n").reduce((sum, line) => sum + Math.max(1, Math.ceil(line.length * 6 / Math.max(width - 16, 1))), 0);
      sheet.config!.rowlen![row] = Math.max(32, lines * 18 + 16);
    });
    sheet.row = firstFooterRow + preview.footerNotes.length;
  }
  // Insert API-provided context before the table and move all cell bindings with it.
  if (preview.informationNotes.length) {
    const offset = preview.informationNotes.length + 1;
    sheet.celldata!.forEach((cell) => {
      cell.r += offset;
      if (cell.v?.mc) cell.v.mc.r += offset;
    });
    sheet.config!.merge = Object.fromEntries(Object.values(sheet.config!.merge!).map((range) => {
      const moved = { ...range, r: range.r + offset };
      return [`${moved.r}_${moved.c}`, moved];
    }));
    sheet.config!.rowlen = Object.fromEntries(Object.entries(sheet.config!.rowlen!).map(([row, height]) => [Number(row) + offset, height]));
    bindings.forEach((binding) => { binding.row += offset; });
    preview.informationNotes.forEach((note, row) => {
      put(row, 0, note);
      merge(row, 0, 1, sheet.column!, false);
      sheet.config!.rowlen![row] = Math.max(32, note.split("\n").length * 18 + 16);
    });
    sheet.row += offset;
  }
  return { sheets: [sheet], bindings };
}
