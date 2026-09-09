import type { AuthPermission, AuthRole } from "../../api/auth-admin.api";

export type PermissionKind = "PAGE" | "ACTION";
export type ModulePresetType = "standard_crud" | "workflow_review" | "publication" | "access_only";

/**
 * Explicit overrides for the current permission catalog. New modules do not
 * need to be added immediately: their preset type is inferred from the action
 * shape returned by GET /auth/admin/permissions.
 */
export const modulePresetTypeMap: Record<string, ModulePresetType> = {
  DASHBOARD: "standard_crud",
  INGESTION: "standard_crud",
  MASTERS: "standard_crud",
  REQUESTS: "standard_crud",
  TEMPLATES: "standard_crud",
  INDICATORS: "standard_crud",
  AUTH: "standard_crud",
  VALIDATION: "workflow_review",
  DATA_PUBLISH: "publication",
  INVITATION_ACCESS: "access_only",
};

export type PresetLevelDefinition = {
  key: string;
  label: string;
  actions: string[];
};

export type ResolvedPresetLevel = PresetLevelDefinition & {
  permissionCodes: string[];
};

export const presetDefinitions: Record<ModulePresetType, { levels: PresetLevelDefinition[] }> = {
  standard_crud: {
    levels: [
      { key: "none", label: "No Access", actions: [] },
      { key: "view", label: "View Only", actions: ["access", "view", "list"] },
      { key: "contributor", label: "Contributor", actions: ["access", "view", "list", "create", "update", "submit"] },
      { key: "full", label: "Full Access", actions: ["access", "view", "list", "create", "update", "submit", "delete", "approve", "reject", "assign", "export"] },
    ],
  },
  workflow_review: {
    levels: [
      { key: "none", label: "No Access", actions: [] },
      { key: "reviewer", label: "Reviewer", actions: ["access", "view", "list"] },
      { key: "approver", label: "Approver", actions: ["access", "view", "list", "approve", "reject"] },
    ],
  },
  publication: {
    levels: [
      { key: "none", label: "No Access", actions: [] },
      { key: "submitter", label: "Submitter", actions: ["view", "submit"] },
      { key: "publisher", label: "Publisher", actions: ["view", "submit", "approve", "publish"] },
    ],
  },
  access_only: {
    levels: [
      { key: "none", label: "No Access", actions: [] },
      { key: "granted", label: "Access Granted", actions: ["access"] },
    ],
  },
};

export type PermissionModuleGroup = {
  moduleCode: string;
  moduleName: string;
  presetType: ModulePresetType;
  permissions: AuthPermission[];
};

export function groupPermissionsByModule(permissions: AuthPermission[]): PermissionModuleGroup[] {
  const groups = new Map<string, PermissionModuleGroup>();
  permissions.forEach((permission) => {
    const moduleCode = normalizeCode(permission.module_code) || "UNMAPPED";
    const moduleName = permission.module_name || moduleCode;
    if (!groups.has(moduleCode)) {
      groups.set(moduleCode, {
        moduleCode,
        moduleName,
        presetType: "standard_crud",
        permissions: [],
      });
    }
    groups.get(moduleCode)?.permissions.push(permission);
  });
  return Array.from(groups.values())
    .map((group) => ({
      ...group,
      presetType: classifyModulePresetType(group.moduleCode, group.permissions),
      permissions: group.permissions.sort((first, second) => (
        String(first.permission_code).localeCompare(String(second.permission_code))
      )),
    }))
    .sort((first, second) => first.moduleCode.localeCompare(second.moduleCode));
}

export function classifyModulePresetType(
  moduleCode: string,
  permissions: AuthPermission[],
  overrides: Partial<Record<string, ModulePresetType>> = modulePresetTypeMap,
): ModulePresetType {
  const normalizedModuleCode = normalizeCode(moduleCode);
  const configuredType = overrides[normalizedModuleCode];
  if (configuredType) return configuredType;

  const actionCodes = new Set(
    permissions
      .map((permission) => normalizeCode(permission.action_code))
      .filter(Boolean),
  );

  if (permissions.length === 1 && actionCodes.size === 0) return "access_only";

  const hasAccessPermission = permissions.some((permission) => (
    normalizeCode(permission.action_code) === "ACCESS"
    || permission.permission_code.toLowerCase().endsWith(":access")
  ));
  const publicationActions = new Set(["SUBMIT", "APPROVE", "PUBLISH"]);
  if (
    !hasAccessPermission
    && actionCodes.size > 0
    && Array.from(actionCodes).every((action) => publicationActions.has(action))
  ) {
    return "publication";
  }

  const workflowActions = new Set(["APPROVE", "REJECT", "VIEW", "LIST"]);
  if (
    actionCodes.size > 0
    && Array.from(actionCodes).every((action) => workflowActions.has(action))
  ) {
    return "workflow_review";
  }

  if (["CREATE", "UPDATE", "SUBMIT"].some((action) => actionCodes.has(action))) {
    return "standard_crud";
  }

  // The broad CRUD preset is the safest non-destructive fallback for an
  // unfamiliar mixed action set until a product-specific override is added.
  return "standard_crud";
}

export function deriveModulePresetTypeMap(
  permissions: AuthPermission[],
  overrides: Partial<Record<string, ModulePresetType>> = modulePresetTypeMap,
): Record<string, ModulePresetType> {
  return Object.fromEntries(
    groupPermissionsByModule(permissions).map((group) => [
      group.moduleCode,
      classifyModulePresetType(group.moduleCode, group.permissions, overrides),
    ]),
  );
}

export function getPermissionPresetAction(permission: AuthPermission): string | null {
  const actionCode = String(permission.action_code ?? "").trim().toLowerCase();
  if (actionCode) return actionCode;

  const permissionCode = permission.permission_code.trim().toLowerCase();
  if (permission.category === "PAGE_ACCESS" || permissionCode.endsWith(":access")) {
    return "access";
  }

  return null;
}

export function resolveModulePresetLevels(
  module: Pick<PermissionModuleGroup, "presetType" | "permissions">,
): ResolvedPresetLevel[] {
  const permissionsByAction = new Map<string, string[]>();
  module.permissions.forEach((permission) => {
    const action = getPermissionPresetAction(permission);
    if (!action) return;
    const permissionCodes = permissionsByAction.get(action) ?? [];
    permissionCodes.push(permission.permission_code);
    permissionsByAction.set(action, permissionCodes);
  });

  return presetDefinitions[module.presetType].levels.map((level) => {
    const actions = level.actions.filter((action) => permissionsByAction.has(action));
    return {
      ...level,
      actions,
      permissionCodes: actions.flatMap((action) => permissionsByAction.get(action) ?? []),
    };
  });
}

export type ResolvedModulePresetState = {
  levelKey: string;
  isCustom: boolean;
  shouldExpandAdvanced: boolean;
};

export function resolvePresetLevel(
  grantedCodes: Set<string>,
  modulePermissions: AuthPermission[],
  presetLevels: PresetLevelDefinition[],
): string {
  const modulePermissionCodes = new Set(
    modulePermissions.map((permission) => permission.permission_code),
  );
  const grantedModuleCodes = new Set(
    Array.from(grantedCodes).filter((code) => modulePermissionCodes.has(code)),
  );
  const permissionsByAction = new Map<string, string[]>();

  modulePermissions.forEach((permission) => {
    const action = getPermissionPresetAction(permission);
    if (!action) return;
    const codes = permissionsByAction.get(action) ?? [];
    codes.push(permission.permission_code);
    permissionsByAction.set(action, codes);
  });

  for (const level of [...presetLevels].reverse()) {
    const requiredCodes = new Set(
      level.actions.flatMap((action) => permissionsByAction.get(action) ?? []),
    );
    if (level.key !== "none" && requiredCodes.size === 0) continue;
    const includesEveryRequiredCode = Array.from(requiredCodes).every((code) => (
      grantedModuleCodes.has(code)
    ));
    const hasNoExtraCodes = Array.from(grantedModuleCodes).every((code) => (
      requiredCodes.has(code)
    ));

    if (includesEveryRequiredCode && hasNoExtraCodes) return level.key;
  }

  return "custom";
}

export function resolveModulePresetState(
  grantedCodes: Set<string>,
  module: Pick<PermissionModuleGroup, "presetType" | "permissions">,
): ResolvedModulePresetState {
  const levelKey = resolvePresetLevel(
    grantedCodes,
    module.permissions,
    presetDefinitions[module.presetType].levels,
  );
  const isCustom = levelKey === "custom";
  return { levelKey, isCustom, shouldExpandAdvanced: isCustom };
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
