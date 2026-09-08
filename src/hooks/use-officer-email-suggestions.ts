import { searchOfficerEmailSuggestions } from "@/api/masters-reference.api";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useInfiniteQuery } from "@tanstack/react-query";

const OFFICER_SUGGESTION_LIMIT = 20;
const OFFICER_SEARCH_DELAY = 300;
const MINIMUM_OFFICER_SEARCH_LENGTH = 2;

export function useOfficerEmailSuggestions({
  searchText,
  organizationCode,
  enabled = true,
}: {
  searchText: string;
  organizationCode?: string;
  enabled?: boolean;
}) {
  const debouncedSearchText = useDebouncedValue(searchText.trim(), OFFICER_SEARCH_DELAY);
  const query = useInfiniteQuery({
    queryKey: [
      "masters",
      "officers",
      "email-suggestions",
      { organizationCode: organizationCode ?? "", searchText: debouncedSearchText },
    ],
    queryFn: ({ pageParam }) => searchOfficerEmailSuggestions({
      search: debouncedSearchText,
      organizationCode,
      limit: OFFICER_SUGGESTION_LIMIT,
      offset: pageParam,
    }),
    initialPageParam: 0,
    getNextPageParam: (lastPage) => (
      lastPage.returnedCount > 0 && lastPage.offset + lastPage.returnedCount < lastPage.count
        ? lastPage.offset + lastPage.returnedCount
        : undefined
    ),
    enabled: enabled && debouncedSearchText.length >= MINIMUM_OFFICER_SEARCH_LENGTH,
  });

  return {
    ...query,
    debouncedSearchText,
    suggestions: query.data?.pages.flatMap((page) => page.data) ?? [],
    isDebouncing: searchText.trim() !== debouncedSearchText,
  };
}
