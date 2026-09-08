import { useQuery } from "@tanstack/react-query";
import {
  getAuthPermissions,
  type AuthPermissionListParams,
} from "@/api/auth-admin.api";

export const authPermissionKeys = {
  all: ["auth-admin", "permissions"] as const,
  list: (params: AuthPermissionListParams) => [
    ...authPermissionKeys.all,
    params.moduleCode ?? "ALL",
    params.includeInactive ?? false,
    params.locale ?? "",
    params.acceptLanguage ?? "",
  ] as const,
};

export function useAuthPermissions(
  params: AuthPermissionListParams,
  enabled = true,
) {
  return useQuery({
    queryKey: authPermissionKeys.list(params),
    queryFn: () => getAuthPermissions(params),
    enabled,
  });
}
