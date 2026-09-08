export const SOURCES_MINISTRIES_PATH = "/ingestion/sources-ministries";

export function sourceOfficersPath(organizationCode: string): string {
  return `${SOURCES_MINISTRIES_PATH}/${encodeURIComponent(organizationCode)}/officers`;
}
