import type { AuthPermission, AuthRole } from "../../api/auth-admin.api";

export type PermissionKind = "PAGE" | "ACTION";

export type PermissionModuleGroup = {
  moduleCode: string;
  moduleName: string;
  permissions: AuthPermission[];
};

export function groupPermissionsByModule(permissions: AuthPermission[]): PermissionModuleGroup[] {
  const groups = new Map<string, PermissionModuleGroup>();
  permissions.forEach((permission) => {
    const moduleCode = normalizeCode(permission.module_code) || "UNMAPPED";
    const moduleName = permission.module_name || moduleCode;
    if (!groups.has(moduleCode)) {
      groups.set(moduleCode, { moduleCode, moduleName, permissions: [] });
    }
    groups.get(moduleCode)?.permissions.push(permission);
  });
  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      permissions: group.permissions.sort((first, second) => (
        String(first.permission_code).localeCompare(String(second.permission_code))
      )),
    }))
    .sort((first, second) => first.moduleCode.localeCompare(second.moduleCode));
}

export function getRolePermissionCodes(role: AuthRole): string[] {
  if (Array.isArray(role.permission_codes)) {
    return role.permission_codes.filter(Boolean);
  }
  if (Array.isArray(role.permissions)) {
    return role.permissions.map((permission) => permission.permission_code).filter(Boolean);
  }
  return [];
}

export function getRoleName(role: AuthRole): string {
  return role.role_name || role.display_name || role.name || role.role_code;
}

export function getPermissionName(permission: AuthPermission): string {
  return permission.permission_name || permission.display_name || permission.name || permission.permission_code;
}

export function getPermissionKind(permission: AuthPermission): PermissionKind {
  return permission.page_code || permission.route_path ? "PAGE" : "ACTION";
}

function normalizeCode(value?: string): string {
  return String(value ?? "").trim().toUpperCase();
}
