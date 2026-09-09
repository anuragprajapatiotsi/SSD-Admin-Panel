import {
  createAuthRole,
  deactivateAuthRole,
  getAuthRole,
  listAuthRoles,
  setAuthRolePermissions,
  updateAuthRole,
  type RolePayload,
  type RoleUpdatePayload,
} from "@/api/auth-admin.api";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export const authRoleKeys = {
  all: ["auth-admin", "roles"] as const,
  list: (includeInactive: boolean, locale?: string) => [...authRoleKeys.all, "list", includeInactive, locale ?? ""] as const,
  detail: (roleCode: string, locale?: string) => [...authRoleKeys.all, "detail", roleCode, locale ?? ""] as const,
};

export function useAuthRoleList(includeInactive = true, locale?: string) {
  return useQuery({ queryKey: authRoleKeys.list(includeInactive, locale), queryFn: () => listAuthRoles(includeInactive) });
}

export function useAuthRole(roleCode: string, locale?: string) {
  return useQuery({ queryKey: authRoleKeys.detail(roleCode, locale), queryFn: () => getAuthRole(roleCode), enabled: Boolean(roleCode) });
}

function useRoleMutation<TVariables>(mutationFn: (variables: TVariables) => Promise<unknown>) {
  const queryClient = useQueryClient();
  return useMutation({ mutationFn, onSuccess: () => queryClient.invalidateQueries({ queryKey: authRoleKeys.all }) });
}

export function useCreateAuthRole() {
  return useRoleMutation((payload: RolePayload) => createAuthRole(payload));
}

export function useUpdateAuthRole() {
  return useRoleMutation(({ roleCode, payload }: { roleCode: string; payload: RoleUpdatePayload }) => updateAuthRole(roleCode, payload));
}

export function useDeleteAuthRole() {
  return useRoleMutation((roleCode: string) => deactivateAuthRole(roleCode));
}

export function useSetAuthRolePermissions() {
  return useRoleMutation(({ roleCode, permissionCodes }: { roleCode: string; permissionCodes: string[] }) => setAuthRolePermissions(roleCode, permissionCodes));
}

