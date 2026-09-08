export type PreviewLineagePart = { code?: string; label?: string };
export type PreviewLineageRow = PreviewLineagePart & { path?: PreviewLineagePart[] };
export type PreviewLineageColumn = PreviewLineagePart & { path?: PreviewLineagePart[] };

export type TimeAwarePreviewCell = {
  hidden?: boolean;
  mode?: "MERGE" | "SPLIT";
  rowSpan?: number;
  label?: string;
  splitLabels?: string[];
  splitItems?: { code: string; label: string }[];
};

type GeographyLineageRow = {
  geography_code?: string;
  member_code?: string;
  name?: string;
  short_name?: string | null;
  lineage_events?: GeographyLineageEvent[];
};

type GeographyLineageEvent = {
  lineage_group_code?: string | null;
  change_type?: "MERGE" | "SPLIT" | string;
  source_geography_code?: string;
  source_name?: string | null;
  target_geography_code?: string;
  target_name?: string | null;
  effective_from?: string;
  effective_to?: string | null;
  is_active?: boolean;
};

type TimePeriodRow = {
  time_period_code?: string;
  member_code?: string;
  name?: string;
  short_name?: string | null;
  start_date?: string | null;
  end_date?: string | null;
};

function normalize(value: unknown) {
  return String(value ?? "").trim().toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function display(value: unknown) {
  return String(value ?? "").trim();
}

function lineageGroupKey(event: GeographyLineageEvent) {
  return `${normalize(event.change_type)}:${normalize(event.lineage_group_code) || normalize(`${event.source_geography_code}_${event.target_geography_code}`)}`;
}

function geographyLookup(geographies: GeographyLineageRow[]) {
  const byKey = new Map<string, GeographyLineageRow>();
  geographies.forEach((geography) => {
    [geography.geography_code, geography.member_code, geography.name, geography.short_name]
      .map(normalize)
      .filter(Boolean)
      .forEach((key) => byKey.set(key, geography));
  });
  return byKey;
}

function geographyCodeForPath(path: PreviewLineagePart[] | undefined, byKey: Map<string, GeographyLineageRow>) {
  for (const part of path ?? []) {
    const geography = byKey.get(normalize(part.code)) ?? byKey.get(normalize(part.label));
    if (geography?.geography_code) return normalize(geography.geography_code);
  }
  return "";
}

function lineageEvents(geographies: GeographyLineageRow[]) {
  const events = new Map<string, GeographyLineageEvent>();
  geographies.forEach((geography) => {
    (geography.lineage_events ?? [])
      .filter((event) => event.is_active !== false)
      .forEach((event) => {
        const key = [
          event.change_type,
          event.lineage_group_code,
          event.source_geography_code,
          event.target_geography_code,
          event.effective_from,
        ].map(normalize).join(":");
        events.set(key, event);
      });
  });
  return Array.from(events.values());
}

function periodLookup(periods: TimePeriodRow[]) {
  const byKey = new Map<string, TimePeriodRow>();
  periods.forEach((period) => {
    [period.time_period_code, period.member_code, period.name, period.short_name]
      .map(normalize)
      .filter(Boolean)
      .forEach((key) => byKey.set(key, period));
  });
  return byKey;
}

function referenceDateForPath(path: PreviewLineagePart[] | undefined, periods: TimePeriodRow[]) {
  const byPeriod = periodLookup(periods);
  for (const part of path ?? []) {
    const period = byPeriod.get(normalize(part.code)) ?? byPeriod.get(normalize(part.label));
    const dateText = period?.end_date ?? period?.start_date;
    if (dateText) {
      const parsed = new Date(dateText);
      if (!Number.isNaN(parsed.getTime())) return parsed;
    }
    const match = display(part.label || part.code).match(/\b(19|20)\d{2}\b/);
    if (match) return new Date(Date.UTC(Number(match[0]), 11, 31));
  }
  return null;
}

function eventDate(event: GeographyLineageEvent) {
  const parsed = new Date(display(event.effective_from));
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

export function reorderRowsByGeographyLineage<T extends PreviewLineageRow>(rows: T[], geographies: GeographyLineageRow[]) {
  if (rows.length < 2 || !geographies.length) return rows;
  const byKey = geographyLookup(geographies);
  const rowCodes = rows.map((row) => geographyCodeForPath(row.path ?? [row], byKey));
  if (!rowCodes.some(Boolean)) return rows;
  const eventsByGroup = new Map<string, GeographyLineageEvent[]>();
  lineageEvents(geographies).forEach((event) => {
    const key = lineageGroupKey(event);
    eventsByGroup.set(key, [...(eventsByGroup.get(key) ?? []), event]);
  });
  const groups = Array.from(eventsByGroup.values())
    .map((events) => {
      const relatedCodes = new Set<string>();
      events.forEach((event) => {
        [event.source_geography_code, event.target_geography_code].map(normalize).filter(Boolean).forEach((code) => relatedCodes.add(code));
      });
      return rowCodes.map((code, index) => relatedCodes.has(code) ? index : -1).filter((index) => index >= 0);
    })
    .filter((indexes) => indexes.length > 1)
    .sort((left, right) => Math.min(...left) - Math.min(...right));
  if (!groups.length) return rows;
  const usedIndexes = new Set<number>();
  const ordered: T[] = [];
  rows.forEach((row, index) => {
    if (usedIndexes.has(index)) return;
    const group = groups.find((item) => item.includes(index) && !item.some((groupIndex) => usedIndexes.has(groupIndex)));
    if (!group) {
      ordered.push(row);
      usedIndexes.add(index);
      return;
    }
    group.forEach((groupIndex) => {
      ordered.push(rows[groupIndex]);
      usedIndexes.add(groupIndex);
    });
  });
  return ordered.length === rows.length ? ordered : rows;
}

export function buildTimeAwareGeographyCellMap(
  rows: PreviewLineageRow[],
  columns: PreviewLineageColumn[],
  geographies: GeographyLineageRow[],
  periods: TimePeriodRow[],
) {
  const events = lineageEvents(geographies);
  if (!events.length) return new Map<string, TimeAwarePreviewCell>();
  const byKey = geographyLookup(geographies);
  const rowCodes = rows.map((row) => geographyCodeForPath(row.path ?? [row], byKey));
  const eventsByGroup = new Map<string, GeographyLineageEvent[]>();
  events.forEach((event) => {
    const key = lineageGroupKey(event);
    eventsByGroup.set(key, [...(eventsByGroup.get(key) ?? []), event]);
  });
  const result = new Map<string, TimeAwarePreviewCell>();
  columns.forEach((column, columnIndex) => {
    const columnDate = referenceDateForPath(column.path ?? [column], periods);
    rows.forEach((row, rowIndex) => {
      const referenceDate = columnDate ?? referenceDateForPath(row.path ?? [row], periods);
      const geographyCode = rowCodes[rowIndex];
      if (!referenceDate || !geographyCode) return;
      const activeEvents = events.filter((event) => {
        const date = eventDate(event);
        return date && referenceDate >= date;
      });
      const splitAsSource = activeEvents.find((event) => event.change_type === "SPLIT" && normalize(event.source_geography_code) === geographyCode);
      if (splitAsSource) {
        const group = eventsByGroup.get(lineageGroupKey(splitAsSource)) ?? [splitAsSource];
        result.set(`${rowIndex}:${columnIndex}`, {
          mode: "SPLIT",
          splitLabels: group.map((event) => display(event.target_name ?? event.target_geography_code)).filter(Boolean),
          splitItems: group.map((event) => ({
            code: normalize(event.target_geography_code),
            label: display(event.target_name ?? event.target_geography_code),
          })).filter((item) => item.code && item.label),
        });
        return;
      }
      const splitAsTargetBefore = events.find((event) => {
        const date = eventDate(event);
        return event.change_type === "SPLIT" && normalize(event.target_geography_code) === geographyCode && Boolean(date && referenceDate < date);
      });
      if (splitAsTargetBefore) {
        const group = eventsByGroup.get(lineageGroupKey(splitAsTargetBefore)) ?? [splitAsTargetBefore];
        const targetCodes = new Set(group.map((event) => normalize(event.target_geography_code)));
        const indexes = rowCodes.map((code, index) => targetCodes.has(code) ? index : -1).filter((index) => index >= 0);
        const first = indexes[0] ?? rowIndex;
        result.set(`${rowIndex}:${columnIndex}`, rowIndex !== first ? { hidden: true } : {
          mode: "MERGE",
          rowSpan: Math.max(1, indexes.length),
          label: display(splitAsTargetBefore.source_name ?? splitAsTargetBefore.source_geography_code),
        });
        return;
      }
      const mergeAsTargetBefore = events.find((event) => {
        const date = eventDate(event);
        return event.change_type === "MERGE" && normalize(event.target_geography_code) === geographyCode && Boolean(date && referenceDate < date);
      });
      if (mergeAsTargetBefore) {
        const group = eventsByGroup.get(lineageGroupKey(mergeAsTargetBefore)) ?? [mergeAsTargetBefore];
        result.set(`${rowIndex}:${columnIndex}`, {
          mode: "SPLIT",
          splitLabels: group.map((event) => display(event.source_name ?? event.source_geography_code)).filter(Boolean),
          splitItems: group.map((event) => ({
            code: normalize(event.source_geography_code),
            label: display(event.source_name ?? event.source_geography_code),
          })).filter((item) => item.code && item.label),
        });
        return;
      }
      const mergeAsSource = activeEvents.find((event) => event.change_type === "MERGE" && normalize(event.source_geography_code) === geographyCode);
      if (!mergeAsSource) return;
      const group = eventsByGroup.get(lineageGroupKey(mergeAsSource)) ?? [mergeAsSource];
      const sourceCodes = new Set(group.map((event) => normalize(event.source_geography_code)));
      const indexes = rowCodes.map((code, index) => sourceCodes.has(code) ? index : -1).filter((index) => index >= 0);
      const first = indexes[0] ?? rowIndex;
      result.set(`${rowIndex}:${columnIndex}`, rowIndex !== first ? { hidden: true } : {
        mode: "MERGE",
        rowSpan: Math.max(1, indexes.length),
        label: display(mergeAsSource.target_name ?? mergeAsSource.target_geography_code),
      });
    });
  });
  return result;
}
