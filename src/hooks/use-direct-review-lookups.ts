import { useInfiniteQuery } from "@tanstack/react-query";
import { listDimensions, listDimensionMembers, listGeographies } from "@/api/dimensions.api";
import type { DirectReviewIssue } from "@/api/direct-ingestion.api";

type LookupRecord = { id?: string; name?: string; is_active?: boolean; geography_code?: string; dimension_code?: string; member_code?: string; dimension_name?: string };
export type ReviewOption = { id: string; code: string; label: string };
function useOptions(key: (string | undefined)[], enabled: boolean, fetch: (offset: number) => Promise<{ data: LookupRecord[]; count?: number }>, paged = true) {
  const query = useInfiniteQuery({
    queryKey: ["direct-review-options", ...key], enabled, initialPageParam: 0,
    queryFn: ({ pageParam }) => fetch(pageParam),
    getNextPageParam: (page, _pages, offset) => paged && page.data.length === 500 ? offset + 500 : undefined,
    staleTime: 60_000,
  });
  const options: ReviewOption[] = (query.data?.pages.flatMap((page) => page.data) ?? [])
    .filter((row) => row.is_active !== false && Boolean(row.id))
    .map((row) => ({ id: row.id!, code: row.member_code ?? row.geography_code ?? row.dimension_code ?? "", label: row.name || row.dimension_name || row.member_code || row.geography_code || row.dimension_code || "" }));
  return { ...query, options };
}

export function useDirectReviewLookups(issue: DirectReviewIssue | undefined, action: string, unitCode: string, locale: string, countryCode: string, scopeCode: string) {
  const changing = ["CREATE_NEW", "CHANGE_PARENT", "CORRECT_VALUE"].includes(action);
  const geography = issue?.entityType === "GEOGRAPHY";
  const subtype = issue?.requestedValue?.subtype?.toUpperCase();
  const district = geography && subtype === "DISTRICT";
  const state = geography && ["STATE", "STATE_UT", "UT", "UNION_TERRITORY"].includes(subtype ?? "");
  const member = issue?.entityType === "DIMENSION_MEMBER" || issue?.entityType === "DIMENSION_VALUE";
  const dimensionCode = scopeCode || issue?.requestedValue?.scope?.code || issue?.requestedScopeCode || "";
  const needsParent = action === "CHANGE_PARENT" || (action === "CREATE_NEW" && (state || district || (member && Boolean(issue?.requestedValue?.parent))));
  const countries = useOptions(["countries", unitCode, locale], changing && (state || district),
    (offset) => listGeographies({ levelCode: "COUNTRY", statusFilter: "ACTIVE", limit: 500, offset, locale }));
  const states = useOptions(["states", countryCode, unitCode, locale], changing && district && Boolean(countryCode),
    (offset) => listGeographies({ levelCode: "STATE_UT", parentGeographyCode: countryCode, statusFilter: "ACTIVE", limit: 500, offset, locale }));
  const scopes = useOptions(["dimensions", unitCode, locale], changing && member, () => listDimensions(), false);
  const members = useOptions(["members", dimensionCode, unitCode, locale], changing && member && Boolean(dimensionCode),
    (offset) => listDimensionMembers(dimensionCode, 500, { locale, offset }));
  const parents = district ? states : member ? members : countries;
  return { countries, parents, scopes, district, state, member, changing, needsParent, dimensionCode, supportsParent: district || state || member };
}
