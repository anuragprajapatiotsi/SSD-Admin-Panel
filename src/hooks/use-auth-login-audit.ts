import { getAuthLoginAudit, type AuthAuditListParams } from "@/api/auth-admin.api";
import { keepPreviousData, useQuery } from "@tanstack/react-query";

export const authLoginAuditKeys = {
  all: ["auth-admin", "login-audit"] as const,
  list: (params: AuthAuditListParams) => [
    ...authLoginAuditKeys.all,
    params.limit ?? 10,
    params.offset ?? 0,
  ] as const,
};

export function useAuthLoginAudit(params: AuthAuditListParams) {
  return useQuery({
    queryKey: authLoginAuditKeys.list(params),
    queryFn: () => getAuthLoginAudit(params),
    placeholderData: keepPreviousData,
  });
}
