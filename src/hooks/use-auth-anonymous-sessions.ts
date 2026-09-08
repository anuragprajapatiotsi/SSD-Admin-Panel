import {
  getAuthAnonymousSessions,
  type AuthAnonymousSessionListParams,
} from "@/api/auth-admin.api";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export const authAnonymousSessionKeys = {
  all: ["auth-admin", "anonymous-sessions"] as const,
  list: (params: AuthAnonymousSessionListParams) => [
    ...authAnonymousSessionKeys.all,
    params.includeInactive ?? false,
    params.limit ?? 10,
    params.offset ?? 0,
  ] as const,
};

export function useAuthAnonymousSessions(params: AuthAnonymousSessionListParams) {
  return useQuery({
    queryKey: authAnonymousSessionKeys.list(params),
    queryFn: () => getAuthAnonymousSessions(params),
    placeholderData: keepPreviousData,
  });
}
