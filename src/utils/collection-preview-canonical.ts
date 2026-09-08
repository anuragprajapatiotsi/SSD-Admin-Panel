type JsonRecord = Record<string, unknown>;
export type PreviewValue = string | number | boolean | null;
type PreviewDimension = { key: string; label: string; identity: string; value: string };
type PreviewEntity = { key: string; label: string };

export type CanonicalPreviewObservation = {
  key: string;
  dimensions: PreviewDimension[];
  measure: PreviewEntity;
  period: PreviewEntity;
  unit: string;
  value: PreviewValue;
  status: string;
  issues: string[];
};

export type CanonicalCollectionPreview = {
  title: string;
  sourceByteSize?: number;
  observations: CanonicalPreviewObservation[];
  columns: { key: string; label: string }[];
  flatRows: PreviewValue[][];
  footerNotes: string[];
  informationNotes: string[];
  canPivot: boolean;
};

function object(value: unknown): JsonRecord {
  return value && typeof value === "object" && !Array.isArray(value) ? value as JsonRecord : {};
}

function list(value: unknown): unknown[] {
  return Array.isArray(value) ? value : [];
}

function text(value: unknown): string {
  return typeof value === "string" ? value : typeof value === "number" ? String(value) : "";
}

function scalar(value: unknown): PreviewValue {
  return typeof value === "string" || typeof value === "number" || typeof value === "boolean"
    ? value : value == null ? null : JSON.stringify(value);
}

function localized(value: unknown, locale: string): string {
  const labels = object(value);
  return text(labels[locale]) || text(labels[locale.split("-")[0]])
    || text(Object.entries(labels).find(([key]) => key.split("-")[0] === locale.split("-")[0])?.[1])
    || text(labels["en-IN"]) || text(Object.values(labels)[0]);
}

function entity(value: unknown, fallback: unknown, locale: string): PreviewEntity {
  const data = object(value);
  const label = localized(data.names, locale) || text(data.displayName) || text(data.name) || text(fallback);
  return { key: text(data.ref) || text(data.id) || text(data.code) || label, label };
}

/** API boundary: retain observation identity and explicit missingness, independent of Fortune. */
export function normalizeCollectionPreview(response: unknown, locale: string): CanonicalCollectionPreview {
  const envelope = object(response);
  const root = envelope.preview ? envelope : object(envelope.data);
  const preview = object(root.preview);
  const rows = list(preview.rows).map(object);
  const columns = list(preview.columns).map((item) => {
    const column = object(item);
    return { key: text(column.key), label: localized(column.labels, locale) || text(column.label) || text(column.key) };
  });
  const issuesByObservation = new Map<string, string[]>();
  list(object(root.review).issues).forEach((item) => {
    const issue = object(item);
    if (issue.decision != null) return;
    const message = localized(issue.messages, locale) || text(issue.message);
    list(issue.affectedObservationRefs).forEach((ref) => {
      const key = text(ref);
      issuesByObservation.set(key, [...(issuesByObservation.get(key) ?? []), message]);
    });
  });
  const observations = rows.map((row, index): CanonicalPreviewObservation => {
    const record = object(row.record);
    const cells = object(row.cells);
    const geography = object(record.geography);
    const geographyPath = [...list(geography.path).map(object), geography];
    const dimensions: PreviewDimension[] = columns.filter((c) => c.key.startsWith("geography:")).map((c) => {
      const member = entity(geographyPath.find((item) => c.key === `geography:${text(item.levelCode)}`), cells[c.key], locale);
      return { key: c.key, label: c.label, identity: member.key, value: member.label };
    });
    list(record.dimensions).forEach((item) => {
      const dimension = object(item);
      const category = entity(dimension.dimension, dimension.dimensionCode ?? dimension.dimensionRef, locale);
      const member = entity(dimension.value ?? dimension.member, dimension.valueCode ?? dimension.valueRef, locale);
      // Unknown dimension structures still participate in identity, preventing accidental aggregation.
      const key = category.key || JSON.stringify(dimension);
      dimensions.push({ key, label: category.label || key, identity: member.key || JSON.stringify(dimension), value: member.label || JSON.stringify(dimension) });
    });
    const value = object(record.value);
    const key = text(record.observationRef) || text(record.sourceRecordKey) || String(index);
    const measure = entity(record.measure, cells.measure, locale);
    const unit = entity(record.uom, cells.uom, locale);
    return {
      key,
      dimensions,
      measure: { key: JSON.stringify([measure.key, unit.key]), label: measure.label },
      period: entity(record.timePeriod, cells.timePeriod, locale),
      unit: text(object(record.uom).symbol) || unit.label,
      value: scalar(Object.hasOwn(value, "value") ? value.value : cells.value),
      status: text(value.status) || text(cells.valueStatus),
      issues: issuesByObservation.get(key) ?? [],
    };
  });
  const identities = observations.map((row) => JSON.stringify([
    row.dimensions.map((d) => [d.key, d.identity]).sort(([a], [b]) => a.localeCompare(b)),
    row.measure.key, row.period.key,
  ]));
  return {
    title: text(root.displayName) || text(object(root.source).originalFileName),
    sourceByteSize: typeof object(root.source).sourceByteSize === "number" ? object(root.source).sourceByteSize as number : undefined,
    columns,
    flatRows: rows.map((row) => columns.map((column, index) => {
      const cells = object(row.cells);
      return scalar(Object.hasOwn(cells, column.key) ? cells[column.key] : list(row.values)[index]);
    })),
    observations,
    // Duplicate intersections or incomplete identities must never silently replace a value.
    canPivot: observations.length > 0 && observations.every((row) => row.dimensions.length > 0 && row.measure.label && row.period.key)
      && new Set(identities).size === observations.length,
    footerNotes: [...new Set(list(preview.footerRows).map((item) => {
      const note = object(item);
      return localized(note.texts, locale) || localized(note.names, locale) || text(note.text) || text(object(note.cells).text) || (typeof item === "string" ? item : "");
    }).filter(Boolean))],
    informationNotes: list(preview.informationRows).map((item) => {
      const note = object(item);
      return localized(note.texts, locale) || localized(note.names, locale) || text(note.text) || text(object(note.cells).text) || (typeof item === "string" ? item : "");
    }).filter(Boolean),
  };
}
