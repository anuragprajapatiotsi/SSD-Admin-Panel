import { apiDelete, apiGet, apiPatch, apiPost, apiPut } from "./http-client";
import { getSelectedLocale } from "./session.api";

export type AuthListResponse<T> = {
  data: T[];
  count: number;
};

export type AuthDetailResponse<T> = {
  data: T;
};

export type AuthPermission = {
  permission_code: string;
  permission_name?: string;
  name?: string;
  display_name?: string;
  module_code?: string;
  module_name?: string;
  page_code?: string;
  page_name?: string;
  route_path?: string;
  action_code?: string;
  action_name?: string;
  description?: string;
  category?: string;
  is_active?: boolean;
};

export type AuthPermissionListParams = {
  moduleCode?: string;
  includeInactive?: boolean;
  locale?: string;
  acceptLanguage?: string;
};

export type AuthRole = {
  role_code: string;
  role_name?: string;
  name?: string;
  display_name?: string;
  description?: string;
  role_scope?: "GLOBAL" | "UNIT" | string;
  is_system_role?: boolean;
  is_active?: boolean;
  permissions?: AuthPermission[];
  permission_codes?: string[];
};

export type AuthUnit = {
  unit_code: string;
  unit_name?: string;
  name?: string;
  display_name?: string;
  unit_type?: string;
  description?: string | null;
  updated_at?: string | null;
  global_mapping_enabled?: boolean;
  globalMappingEnabled?: boolean;
  is_active?: boolean;
};

export type AuthUserRoleAssignment = {
  role_code?: string;
  role_name?: string;
  unit_code?: string;
  unit_name?: string;
  assigned_at?: string;
  valid_from?: string;
  valid_until?: string;
  is_active?: boolean;
};

export type AuthUserReviewLevel = {
  workflow_code?: string;
  level_code?: string;
  level_name?: string;
  level_number?: number;
  unit_code?: string;
  role_code?: string;
  is_active?: boolean;
};

export type AuthUser = {
  username: string;
  email?: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  mobile_number?: string;
  preferred_language_code?: string;
  is_active?: boolean;
  is_system_user?: boolean;
  last_login_at?: string | null;
  failed_login_count?: number;
  account_locked_until?: string | null;
  roles?: AuthUserRoleAssignment[];
  role_assignments?: AuthUserRoleAssignment[];
  review_levels?: AuthUserReviewLevel[];
};

export type AuthReviewWorkflowLevel = {
  level_code?: string;
  level_name?: string;
  level_number?: number;
  is_final_level?: boolean;
  is_active?: boolean;
};

export type AuthReviewWorkflow = {
  workflow_code: string;
  workflow_name?: string;
  unit_code?: string;
  is_active?: boolean;
  levels?: AuthReviewWorkflowLevel[];
};

export type AuthSessionAuditRow = Record<string, string | number | boolean | null | undefined>;

export type AuthAuditListParams = {
  limit?: number;
  offset?: number;
};

export type AuthAnonymousSessionListParams = AuthAuditListParams & {
  includeInactive?: boolean;
};

export type ReviewWorkflowPayload = {
  unit_code: string;
  workflow_code: string;
  workflow_name: string;
  is_active: boolean;
};

export type ReviewLevelPayload = {
  level_code: string;
  level_number: number;
  level_name: string;
  is_final_level: boolean;
  is_active: boolean;
};

export type RolePayload = {
  role_code: string;
  role_scope: string;
  is_system_role: boolean;
};

export type RoleUpdatePayload = {
  role_name?: string;
  role_scope?: string;
  is_active?: boolean;
};

export type UserUpdatePayload = {
  email?: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  mobile_number?: string;
  preferred_language_code?: string;
  is_active?: boolean;
};

export type UserCreatePayload = {
  username: string;
  email: string;
  first_name?: string;
  last_name?: string;
  display_name?: string;
  mobile_number?: string;
  preferred_language_code: string;
  is_active: boolean;
  is_system_user: boolean;
  password_hash: string;
};

function localeQuery(): string {
  return `locale=${encodeURIComponent(getSelectedLocale())}`;
}

export async function listAuthPermissions(includeInactive = true, moduleCode?: string): Promise<AuthPermission[]> {
  const response = await getAuthPermissions({ includeInactive, moduleCode });
  return response.data;
}

export async function getAuthPermissions(
  options: AuthPermissionListParams = {},
): Promise<AuthListResponse<AuthPermission>> {
  const locale = options.locale ?? getSelectedLocale();
  const query = new URLSearchParams({
    include_inactive: String(options.includeInactive ?? false),
    locale,
  });
  if (options.moduleCode) {
    query.set("module_code", options.moduleCode);
  }
  const result = await apiGet<AuthListResponse<AuthPermission>>(
    `/auth/admin/permissions?${query.toString()}`,
    { acceptLanguage: options.acceptLanguage ?? locale },
  );
  return result.data;
}

export async function listAuthRoles(includeInactive = true): Promise<AuthRole[]> {
  const result = await apiGet<AuthListResponse<AuthRole>>(
    `/auth/admin/roles?include_inactive=${String(includeInactive)}&${localeQuery()}`,
  );
  return result.data.data;
}

export async function getAuthRole(roleCode: string): Promise<AuthRole> {
  const result = await apiGet<AuthDetailResponse<AuthRole>>(
    `/auth/admin/roles/${encodeURIComponent(roleCode)}?${localeQuery()}`,
  );
  return result.data.data;
}

export async function createAuthRole(payload: RolePayload): Promise<AuthRole> {
  const result = await apiPost<AuthDetailResponse<AuthRole>, RolePayload>("/auth/admin/roles", payload);
  return result.data.data;
}

export async function updateAuthRole(roleCode: string, payload: RoleUpdatePayload): Promise<AuthRole> {
  const result = await apiPatch<AuthDetailResponse<AuthRole>, RoleUpdatePayload>(
    `/auth/admin/roles/${encodeURIComponent(roleCode)}`,
    payload,
  );
  return result.data.data;
}

export async function deactivateAuthRole(roleCode: string): Promise<AuthRole> {
  const result = await apiDelete<AuthDetailResponse<AuthRole>>(`/auth/admin/roles/${encodeURIComponent(roleCode)}`);
  return result.data.data;
}

export async function setAuthRolePermissions(roleCode: string, permissionCodes: string[]): Promise<AuthRole> {
  const result = await apiPut<AuthDetailResponse<AuthRole>, { permission_codes: string[] }>(
    `/auth/admin/roles/${encodeURIComponent(roleCode)}/permissions`,
    { permission_codes: permissionCodes },
  );
  return result.data.data;
}

export type AuthUserListParams = {
  search?: string;
  unitCode?: string;
  roleCode?: string;
  includeInactive?: boolean;
  locale?: string;
  acceptLanguage?: string;
};

export async function getAuthUsers(
  params: AuthUserListParams = {},
): Promise<AuthListResponse<AuthUser>> {
  const locale = params.locale ?? getSelectedLocale();
  const query = new URLSearchParams({
    include_inactive: String(params.includeInactive ?? true),
    locale,
  });
  if (params.search) query.set("search", params.search);
  if (params.unitCode && params.unitCode !== "ALL") query.set("unit_code", params.unitCode);
  if (params.roleCode && params.roleCode !== "ALL") query.set("role_code", params.roleCode);
  const result = await apiGet<AuthListResponse<AuthUser>>(
    `/auth/admin/users?${query.toString()}`,
    { acceptLanguage: params.acceptLanguage ?? locale },
  );
  return result.data;
}

export async function listAuthUsers(params: AuthUserListParams = {}): Promise<AuthUser[]> {
  const response = await getAuthUsers(params);
  return response.data;
}

export async function getAuthUser(username: string): Promise<AuthUser> {
  const result = await apiGet<AuthDetailResponse<AuthUser>>(
    `/auth/admin/users/${encodeURIComponent(username)}?${localeQuery()}`,
  );
  return result.data.data;
}

export async function createAuthUser(payload: UserCreatePayload): Promise<AuthUser> {
  const result = await apiPost<AuthDetailResponse<AuthUser>, UserCreatePayload>("/auth/admin/users", payload);
  return result.data.data;
}

export async function updateAuthUser(username: string, payload: UserUpdatePayload): Promise<AuthUser> {
  const result = await apiPatch<AuthDetailResponse<AuthUser>, UserUpdatePayload>(
    `/auth/admin/users/${encodeURIComponent(username)}`,
    payload,
  );
  return result.data.data;
}

export async function deactivateAuthUser(username: string): Promise<AuthUser> {
  const result = await apiDelete<AuthDetailResponse<AuthUser>>(`/auth/admin/users/${encodeURIComponent(username)}`);
  return result.data.data;
}

export async function setAuthUserPassword(username: string, newPassword: string): Promise<void> {
  await apiPost<{ password_updated: boolean }, { new_password: string }>(
    `/auth/admin/users/${encodeURIComponent(username)}/password/set`,
    { new_password: newPassword },
  );
}

export async function assignAuthUserRole(username: string, roleCode: string, unitCode?: string): Promise<AuthUser> {
  const result = await apiPost<AuthDetailResponse<AuthUser>, { role_code: string; unit_code?: string }>(
    `/auth/admin/users/${encodeURIComponent(username)}/roles`,
    { role_code: roleCode, unit_code: unitCode && unitCode !== "GLOBAL" ? unitCode : undefined },
  );
  return result.data.data;
}

export async function revokeAuthUserRole(username: string, roleCode: string, unitCode?: string): Promise<AuthUser> {
  const result = await apiPost<AuthDetailResponse<AuthUser>, { role_code: string; unit_code?: string }>(
    `/auth/admin/users/${encodeURIComponent(username)}/roles/revoke`,
    { role_code: roleCode, unit_code: unitCode && unitCode !== "GLOBAL" ? unitCode : undefined },
  );
  return result.data.data;
}

export async function assignAuthUserReviewLevel(
  username: string,
  payload: { workflow_code: string; level_code: string; role_code?: string; unit_code?: string },
): Promise<AuthUser> {
  const result = await apiPost<AuthDetailResponse<AuthUser>, typeof payload>(
    `/auth/admin/users/${encodeURIComponent(username)}/review-levels`,
    {
      ...payload,
      role_code: payload.role_code || undefined,
      unit_code: payload.unit_code && payload.unit_code !== "GLOBAL" ? payload.unit_code : undefined,
    },
  );
  return result.data.data;
}

export async function removeAuthUserReviewLevel(
  username: string,
  payload: { workflow_code: string; level_code: string },
): Promise<AuthUser> {
  const result = await apiPost<AuthDetailResponse<AuthUser>, typeof payload>(
    `/auth/admin/users/${encodeURIComponent(username)}/review-levels/remove`,
    payload,
  );
  return result.data.data;
}

export async function listAuthUnits(includeInactive = true): Promise<AuthUnit[]> {
  const result = await apiGet<AuthListResponse<AuthUnit>>(
    `/auth/admin/units?include_inactive=${String(includeInactive)}&${localeQuery()}`,
  );
  return result.data.data;
}

export async function listAuthReviewWorkflows(includeInactive = true): Promise<AuthReviewWorkflow[]> {
  const result = await apiGet<AuthListResponse<AuthReviewWorkflow>>(
    `/auth/admin/review-workflows?include_inactive=${String(includeInactive)}&${localeQuery()}`,
  );
  return result.data.data;
}

export async function createAuthReviewWorkflow(payload: ReviewWorkflowPayload): Promise<AuthReviewWorkflow> {
  const result = await apiPost<AuthDetailResponse<AuthReviewWorkflow>, ReviewWorkflowPayload>(
    "/auth/admin/review-workflows",
    payload,
  );
  return result.data.data;
}

export async function updateAuthReviewWorkflow(
  workflowCode: string,
  payload: ReviewWorkflowPayload,
): Promise<AuthReviewWorkflow> {
  const result = await apiPatch<AuthDetailResponse<AuthReviewWorkflow>, ReviewWorkflowPayload>(
    `/auth/admin/review-workflows/${encodeURIComponent(workflowCode)}`,
    payload,
  );
  return result.data.data;
}

export async function createAuthReviewLevel(
  workflowCode: string,
  payload: ReviewLevelPayload,
): Promise<AuthReviewWorkflow> {
  const result = await apiPost<AuthDetailResponse<AuthReviewWorkflow>, ReviewLevelPayload>(
    `/auth/admin/review-workflows/${encodeURIComponent(workflowCode)}/levels`,
    payload,
  );
  return result.data.data;
}

export async function updateAuthReviewLevel(
  workflowCode: string,
  levelCode: string,
  payload: ReviewLevelPayload,
): Promise<AuthReviewWorkflow> {
  const result = await apiPatch<AuthDetailResponse<AuthReviewWorkflow>, ReviewLevelPayload>(
    `/auth/admin/review-workflows/${encodeURIComponent(workflowCode)}/levels/${encodeURIComponent(levelCode)}`,
    payload,
  );
  return result.data.data;
}

export async function listAuthSessions(includeInactive = true): Promise<AuthSessionAuditRow[]> {
  const result = await apiGet<AuthListResponse<AuthSessionAuditRow>>(
    `/auth/admin/sessions?include_inactive=${String(includeInactive)}&limit=100&offset=0`,
  );
  return result.data.data;
}

export async function listAuthLoginAudit(): Promise<AuthSessionAuditRow[]> {
  const response = await getAuthLoginAudit({ limit: 100, offset: 0 });
  return response.data;
}

export async function getAuthLoginAudit(
  options: AuthAuditListParams = {},
): Promise<AuthListResponse<AuthSessionAuditRow>> {
  const query = new URLSearchParams({
    limit: String(options.limit ?? 10),
    offset: String(options.offset ?? 0),
  });
  const result = await apiGet<AuthListResponse<AuthSessionAuditRow>>(`/auth/admin/login-audit?${query.toString()}`);
  return result.data;
}

export async function listAuthAnonymousSessions(includeInactive = true): Promise<AuthSessionAuditRow[]> {
  const response = await getAuthAnonymousSessions({ includeInactive, limit: 100, offset: 0 });
  return response.data;
}

export async function getAuthAnonymousSessions(
  options: AuthAnonymousSessionListParams = {},
): Promise<AuthListResponse<AuthSessionAuditRow>> {
  const query = new URLSearchParams({
    include_inactive: String(options.includeInactive ?? false),
    limit: String(options.limit ?? 10),
    offset: String(options.offset ?? 0),
  });
  const result = await apiGet<AuthListResponse<AuthSessionAuditRow>>(
    `/auth/admin/anonymous-sessions?${query.toString()}`,
  );
  return result.data;
}
