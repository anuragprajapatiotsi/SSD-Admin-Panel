import type { Sheet } from "@fortune-sheet/core";
import type { PreviewValue } from "./collection-preview-canonical";
import type { PreviewCellBinding } from "./collection-preview-workbook";

type JsonRecord = Record<string, unknown>;
export type PreviewRecordEdit = { observationKey: string; field: string; value: PreviewValue };
const object = (value: unknown): JsonRecord => value && typeof value === "object" && !Array.isArray(value) ? value as JsonRecord : {};
const list = (value: unknown): unknown[] => Array.isArray(value) ? value : [];
const scalar = (value: unknown): PreviewValue => typeof value === "string" || typeof value === "number" || typeof value === "boolean" ? value : null;

/** Display coordinates are mapped to original observation identities, never API row positions. */
export function readPreviewEdits(sheets: Sheet[], bindings: PreviewCellBinding[]): PreviewRecordEdit[] {
  const sheet = sheets[0];
  if (!sheet) return [];
  const sparse = new Map((sheet.celldata ?? []).map((cell) => [`${cell.r}:${cell.c}`, cell.v]));
  return bindings.flatMap((binding) => {
    const cell = sheet.data ? sheet.data[binding.row]?.[binding.column] : sparse.get(`${binding.row}:${binding.column}`);
    let value = scalar(cell?.v);
    if (Object.is(value, binding.originalValue)) return [];
    if (binding.suffix && typeof value === "string" && value.endsWith(binding.suffix)) value = value.slice(0, -binding.suffix.length);
    return binding.observationKeys.map((observationKey) => ({ observationKey, field: binding.field, value }));
  });
}

/** Keep the API shape intact, including cells, values, nested record data and identifiers. */
export function applyPreviewEdits(response: unknown, edits: PreviewRecordEdit[], locale: string): unknown {
  const draft = structuredClone(response);
  const envelope = object(draft);
  const root = envelope.preview ? envelope : object(envelope.data);
  const preview = object(root.preview);
  const columns = list(preview.columns).map((column) => String(object(column).key ?? ""));
  const editsByRecord = new Map<string, PreviewRecordEdit[]>();
  edits.forEach((edit) => editsByRecord.set(edit.observationKey, [...(editsByRecord.get(edit.observationKey) ?? []), edit]));
  const updateName = (value: unknown, label: PreviewValue) => {
    const entity = object(value);
    entity.name = label;
    if ("displayName" in entity) entity.displayName = label;
    entity.names = { ...object(entity.names), [locale]: label };
  };
  list(preview.rows).forEach((value, index) => {
    const row = object(value);
    const record = object(row.record);
    const key = String(record.observationRef ?? record.sourceRecordKey ?? index);
    const changes = editsByRecord.get(key);
    if (!changes) return;
    const cells = object(row.cells);
    row.cells = cells;
    const setCell = (field: string, value: PreviewValue) => {
      cells[field] = value;
      const columnIndex = columns.indexOf(field);
      if (columnIndex >= 0 && Array.isArray(row.values)) row.values[columnIndex] = value;
    };
    changes.forEach(({ field, value }) => {
      setCell(field, value);
      if (field === "value") {
        record.value = { ...object(record.value), value, status: value === null || value === "" ? "MISSING" : "PRESENT" };
        setCell("valueStatus", String(object(record.value).status));
      } else if (field === "valueStatus") {
        record.value = { ...object(record.value), status: value };
      } else if (field.startsWith("geography:")) {
        const level = field.slice("geography:".length);
        const geography = object(record.geography);
        [...list(geography.path), geography].forEach((item) => {
          if (object(item).levelCode === level) updateName(item, value);
        });
      } else if (field.startsWith("dimension:")) {
        list(record.dimensions).forEach((item) => {
          const dimension = object(item);
          const entity = object(dimension.dimension);
          if (String(entity.ref ?? entity.id ?? entity.code) === field.slice("dimension:".length)) updateName(dimension.value ?? dimension.member, value);
        });
        delete cells[field];
      } else if (["measure", "timePeriod", "uom", "periodicity", "timeFrequency"].includes(field)) {
        updateName(record[field], value);
      } else {
        record[field] = value;
      }
    });
  });
  return draft;
}
