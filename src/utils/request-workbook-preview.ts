export function requestRecord(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}
export function requestList(value: unknown): Record<string, unknown>[] {
  return Array.isArray(value) ? value.map(requestRecord) : [];
}
export function requestText(value: unknown): string { return typeof value === "string" ? value : ""; }
export function requestVersion(value: unknown): number | undefined {
  const number = typeof value === "string" && value.trim() ? Number(value) : value;
  return typeof number === "number" && Number.isInteger(number) && number > 0 ? number : undefined;
}
/** Read transport metadata only. REQUEST rows remain untouched in the original response. */
export function readRequestPreviewMetadata(data: unknown, fallbackSheet: string) {
  const root = requestRecord(data);
  const preview = requestRecord(root.preview);
  const rows = requestList(preview.rows);
  const sheets = requestList(preview.sheets);
  const selectedSheet = requestText(preview.selectedSheet) || requestText(sheets[0]?.sheetIdentity) || fallbackSheet;
  const page = requestRecord(preview.page);
  const offset = typeof page.offset === "number" ? page.offset : 0;
  const returned = rows.length;
  const count = typeof page.total === "number" ? page.total : returned;
  return {
    hasData: rows.length > 0,
    selectedSheet, sheets, offset, returned, total: count,
    hasMore: page.hasMore === true, limit: typeof page.limit === "number" ? page.limit : 200,
    title: requestText(requestRecord(root.artifact).originalFileName) || requestText(root.displayName),
    size: typeof requestRecord(root.artifact).byteSize === "number" ? requestRecord(root.artifact).byteSize as number : undefined,
    submission: requestRecord(root.submission),
  };
}
