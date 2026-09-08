import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import {
  ChevronDown,
  Copy,
  Save,
  Search,
  ShieldCheck,
  TriangleAlert,
} from "lucide-react";
import { useState } from "react";
import type { AuthPermission, AuthRole } from "../../api/auth-admin.api";
import {
  getPermissionKind,
  getPermissionName,
  getRoleName,
  getRolePermissionCodes,
  type PermissionModuleGroup,
} from "./permission-matrix-utils";

type PermissionMatrixWorkspaceProps = {
  addedCount: number;
  filteredPermissionCount: number;
  isRoleLoading: boolean;
  isSaving: boolean;
  moduleGroups: PermissionModuleGroup[];
  onClearAll: () => void;
  onClonePermissions: (roleCode: string) => void;
  onDeactivateRole: (roleCode: string) => void;
  onDiscardChanges: () => void;
  onEditRole: (role: AuthRole) => void;
  onRoleSearchChange: (value: string) => void;
  onRoleSelection: (roleCode: string) => void;
  onSave: () => void;
  onSetPermissions: (permissionCodes: string[], isSelected: boolean) => void;
  onTogglePermission: (permissionCode: string) => void;
  removedCount: number;
  roleSearch: string;
  roles: AuthRole[];
  selectedPermissionCodes: Set<string>;
  selectedRole?: AuthRole;
  totalPermissionCount: number;
};

export function PermissionMatrixWorkspace({
  addedCount,
  filteredPermissionCount,
  isRoleLoading,
  isSaving,
  moduleGroups,
  onClearAll,
  onClonePermissions,
  onDeactivateRole,
  onDiscardChanges,
  onEditRole,
  onRoleSearchChange,
  onRoleSelection,
  onSave,
  onSetPermissions,
  onTogglePermission,
  removedCount,
  roleSearch,
  roles,
  selectedPermissionCodes,
  selectedRole,
  totalPermissionCount,
}: PermissionMatrixWorkspaceProps) {
  const isDirty = addedCount > 0 || removedCount > 0;
  const filteredPermissionCodes = moduleGroups.flatMap((group) => (
    group.permissions.map((permission) => permission.permission_code)
  ));

  return (
    <section className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-lg border bg-background">
      <div className="grid min-h-0 flex-1 grid-cols-1 md:grid-cols-[18rem_minmax(0,1fr)]">
        <RoleSelector
          roles={roles}
          roleSearch={roleSearch}
          selectedPermissionCodes={selectedPermissionCodes}
          selectedRole={selectedRole}
          totalPermissionCount={totalPermissionCount}
          onRoleSearchChange={onRoleSearchChange}
          onRoleSelection={onRoleSelection}
        />

        <section className="flex min-h-0 min-w-0 flex-col bg-muted/10">
          {selectedRole ? (
            <>
              <PermissionWorkspaceHeader
                filteredPermissionCodes={filteredPermissionCodes}
                filteredPermissionCount={filteredPermissionCount}
                isRoleLoading={isRoleLoading}
                isSaving={isSaving}
                roles={roles}
                selectedPermissionCodes={selectedPermissionCodes}
                selectedRole={selectedRole}
                totalPermissionCount={totalPermissionCount}
                onClearAll={onClearAll}
                onClonePermissions={onClonePermissions}
                onDeactivateRole={onDeactivateRole}
                onEditRole={onEditRole}
                onSetPermissions={onSetPermissions}
              />

              <div className="min-h-0 flex-1 overflow-y-auto p-2 sm:p-3">
                {isRoleLoading ? (
                  <div className="grid min-h-48 place-items-center text-sm text-muted-foreground" role="status">
                    Loading permissions for {selectedRole.role_code}...
                  </div>
                ) : moduleGroups.length ? (
                  <PermissionModuleAccordion
                    key={selectedRole.role_code}
                    moduleGroups={moduleGroups}
                    selectedPermissionCodes={selectedPermissionCodes}
                    onSetPermissions={onSetPermissions}
                    onTogglePermission={onTogglePermission}
                  />
                ) : (
                  <Empty className="min-h-56 border">
                    <EmptyHeader>
                      <EmptyMedia variant="icon"><Search aria-hidden="true" /></EmptyMedia>
                      <EmptyTitle>No permissions found</EmptyTitle>
                      <EmptyDescription>
                        Adjust the search or filters to see permissions for this role.
                      </EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                )}
              </div>
            </>
          ) : (
            <Empty className="min-h-72 border-0">
              <EmptyHeader>
                <EmptyMedia variant="icon"><ShieldCheck aria-hidden="true" /></EmptyMedia>
                <EmptyTitle>Select a role</EmptyTitle>
                <EmptyDescription>
                  Choose a governed role to review and manage its permission grants.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          )}
        </section>
      </div>

      {isDirty ? (
        <div
          className="flex flex-col gap-2 border-t bg-amber-50 px-3 py-2 text-amber-950 shadow-[0_-8px_20px_rgba(15,23,42,0.08)] sm:flex-row sm:items-center sm:justify-between dark:bg-amber-950/30 dark:text-amber-100"
          role="status"
          aria-live="polite"
        >
          <div className="flex min-w-0 items-center gap-2 text-xs sm:text-sm">
            <TriangleAlert className="size-4 shrink-0" aria-hidden="true" />
            <span>
              You have unsaved changes ({addedCount} added, {removedCount} removed)
            </span>
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button variant="ghost" isDisabled={isSaving} onPress={onDiscardChanges}>
              Discard Changes
            </Button>
            <Button isDisabled={isSaving} onPress={onSave}>
              <Save data-icon="inline-start" aria-hidden="true" />
              {isSaving ? "Saving..." : "Save Grants"}
            </Button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function RoleSelector({
  onRoleSearchChange,
  onRoleSelection,
  roleSearch,
  roles,
  selectedPermissionCodes,
  selectedRole,
  totalPermissionCount,
}: Pick<
  PermissionMatrixWorkspaceProps,
  | "onRoleSearchChange"
  | "onRoleSelection"
  | "roleSearch"
  | "roles"
  | "selectedPermissionCodes"
  | "selectedRole"
  | "totalPermissionCount"
>) {
  return (
    <aside className="permission-role-panel flex min-h-0 flex-col border-b bg-background md:border-r md:border-b-0">
      <div className="border-b p-2.5">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div>
            <h2 className="text-sm font-semibold text-foreground">Roles</h2>
            <p className="text-xs text-muted-foreground">Select a governed role</p>
          </div>
          <Badge variant="secondary">{roles.length}</Badge>
        </div>
        <label className="relative block">
          <span className="sr-only">Search roles</span>
          <Search className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            className="pl-7"
            placeholder="Search roles..."
            value={roleSearch}
            onChange={(event) => onRoleSearchChange(event.target.value)}
          />
        </label>
      </div>

      <div className="max-h-56 min-h-0 flex-1 space-y-1 overflow-y-auto p-2 md:max-h-none">
        {roles.length ? roles.map((role) => {
          const isSelected = selectedRole?.role_code === role.role_code;
          const grantCount = isSelected
            ? selectedPermissionCodes.size
            : getRolePermissionCodes(role).length;
          return (
            <Button
              aria-pressed={isSelected}
              className="permission-role-item h-auto w-full justify-start whitespace-normal border border-transparent px-2.5 py-2 text-left data-[selected=true]:border-primary/50 data-[selected=true]:bg-primary/5 data-[selected=true]:text-primary"
              data-selected={isSelected || undefined}
              key={role.role_code}
              variant="ghost"
              onPress={() => onRoleSelection(role.role_code)}
            >
              <span className="min-w-0 flex-1">
                <strong className="block truncate text-xs font-semibold text-foreground">{role.role_code}</strong>
                <span className="mt-0.5 block truncate text-xs font-normal text-muted-foreground">
                  {getRoleName(role)}
                </span>
              </span>
              <span className="flex shrink-0 flex-col items-end gap-1">
                <Badge variant="secondary" className="h-4 px-1.5 text-[0.625rem]">
                  {grantCount}/{totalPermissionCount}
                </Badge>
                <StatusBadge isActive={role.is_active !== false} />
              </span>
            </Button>
          );
        }) : (
          <Empty className="min-h-28 gap-2 border-0 p-3">
            <EmptyHeader>
              <EmptyTitle>No roles found</EmptyTitle>
              <EmptyDescription>Adjust the role search or global filters.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
      </div>
    </aside>
  );
}

function PermissionWorkspaceHeader({
  filteredPermissionCodes,
  filteredPermissionCount,
  isRoleLoading,
  isSaving,
  onClearAll,
  onClonePermissions,
  onDeactivateRole,
  onEditRole,
  onSetPermissions,
  roles,
  selectedPermissionCodes,
  selectedRole,
  totalPermissionCount,
}: Pick<
  PermissionMatrixWorkspaceProps,
  | "filteredPermissionCount"
  | "isRoleLoading"
  | "isSaving"
  | "onClearAll"
  | "onClonePermissions"
  | "onDeactivateRole"
  | "onEditRole"
  | "onSetPermissions"
  | "roles"
  | "selectedPermissionCodes"
  | "selectedRole"
  | "totalPermissionCount"
> & { filteredPermissionCodes: string[] }) {
  if (!selectedRole) return null;

  const cloneSources = roles.filter((role) => role.role_code !== selectedRole.role_code);
  const roleDescription = selectedRole.description?.trim();
  return (
    <header className="permission-workspace-header sticky top-0 z-10 border-b bg-background/95 px-3 py-2.5 backdrop-blur">
      <div className="flex flex-col gap-2 xl:flex-row xl:items-start xl:justify-between">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="truncate text-sm font-semibold text-foreground">{getRoleName(selectedRole)}</h2>
            <StatusBadge isActive={selectedRole.is_active !== false} />
          </div>
          <p className="mt-0.5 text-xs text-muted-foreground">

          </p>
          {roleDescription ? (
            <p className="mt-1 max-w-3xl whitespace-normal break-words text-xs leading-4 text-muted-foreground">
              {selectedRole.description}
              {" — "}{selectedPermissionCodes.size} of {totalPermissionCount} permissions granted
            </p>
          ) : null}
        </div>

        <div className="flex flex-wrap items-center gap-1.5">
          <Button variant="outline" size="sm" isDisabled={isSaving || isRoleLoading} onPress={() => onEditRole(selectedRole)}>
            Edit Role
          </Button>
          {selectedRole.is_active !== false ? (
            <Button variant="destructive" size="sm" isDisabled={isSaving || isRoleLoading} onPress={() => onDeactivateRole(selectedRole.role_code)}>
              Deactivate
            </Button>
          ) : null}
          <DropdownMenuTrigger>
            <Button variant="outline" size="sm" isDisabled={!cloneSources.length || isSaving || isRoleLoading}>
              <Copy data-icon="inline-start" aria-hidden="true" />
              Clone Permissions
              <ChevronDown data-icon="inline-end" aria-hidden="true" />
            </Button>
            <DropdownMenu placement="bottom end" aria-label="Clone permissions from role">
              <DropdownMenuLabel>Clone grants from</DropdownMenuLabel>
              {cloneSources.map((role) => (
                <DropdownMenuItem id={role.role_code} key={role.role_code} onAction={() => onClonePermissions(role.role_code)}>
                  <span className="min-w-0">
                    <strong className="block truncate font-medium">{role.role_code}</strong>
                    <span className="block truncate text-[0.625rem] text-muted-foreground">{getRoleName(role)}</span>
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenu>
          </DropdownMenuTrigger>
        </div>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-2 border-t pt-2">
        <span className="text-xs text-muted-foreground">
          {filteredPermissionCount} permissions in the current view
        </span>
        <div className="flex items-center gap-1.5">
          <Button
            variant="outline"
            size="sm"
            isDisabled={!filteredPermissionCodes.length || isRoleLoading}
            onPress={() => onSetPermissions(filteredPermissionCodes, true)}
          >
            Select All Filtered
          </Button>
          <Button
            variant="ghost"
            size="sm"
            isDisabled={!selectedPermissionCodes.size || isRoleLoading}
            onPress={onClearAll}
          >
            Clear All
          </Button>
        </div>
      </div>
    </header>
  );
}

function PermissionModuleAccordion({
  moduleGroups,
  onSetPermissions,
  onTogglePermission,
  selectedPermissionCodes,
}: Pick<
  PermissionMatrixWorkspaceProps,
  "moduleGroups" | "onSetPermissions" | "onTogglePermission" | "selectedPermissionCodes"
>) {
  const [expandedModules, setExpandedModules] = useState<Set<string | number>>(() => new Set());

  return (
    <Accordion
      allowsMultipleExpanded
      className="permission-module-accordion bg-background"
      expandedKeys={expandedModules}
      onExpandedChange={(keys) => setExpandedModules(new Set(keys))}
    >
      {moduleGroups.map((group) => {
        const permissionCodes = group.permissions.map((permission) => permission.permission_code);
        const selectedCount = permissionCodes.filter((code) => selectedPermissionCodes.has(code)).length;
        const allSelected = selectedCount === permissionCodes.length && permissionCodes.length > 0;
        const someSelected = selectedCount > 0 && !allSelected;
        const pagePermissions = group.permissions.filter((permission) => getPermissionKind(permission) === "PAGE");
        const actionPermissions = group.permissions.filter((permission) => getPermissionKind(permission) === "ACTION");

        return (
          <AccordionItem id={group.moduleCode} key={group.moduleCode} className="bg-background data-open:bg-background">
            <div className="flex items-center border-b border-transparent data-open:border-border [&>*:first-child]:min-w-0 [&>*:first-child]:flex-1">
              <AccordionTrigger className="min-h-10 items-center px-3 py-2 hover:no-underline">
                <span className="flex min-w-0 flex-1 items-center gap-2">
                  <strong className="truncate text-xs font-semibold text-foreground">{group.moduleName}</strong>
                  <Badge variant="secondary" className="h-4 px-1.5 text-[0.625rem]">
                    {selectedCount} of {permissionCodes.length} selected
                  </Badge>
                </span>
              </AccordionTrigger>
              <Checkbox
                aria-label={`${allSelected ? "Clear" : "Select all"} ${group.moduleName} permissions`}
                className="mr-3"
                isIndeterminate={someSelected}
                isSelected={allSelected}
                onChange={(isSelected) => onSetPermissions(permissionCodes, isSelected)}
              />
            </div>
            <AccordionContent className="p-0 pb-0">
              {pagePermissions.length ? (
                <PermissionGroup
                  label="Page Access"
                  permissions={pagePermissions}
                  selectedPermissionCodes={selectedPermissionCodes}
                  onTogglePermission={onTogglePermission}
                />
              ) : null}
              {actionPermissions.length ? (
                <PermissionGroup
                  label="Module Actions"
                  permissions={actionPermissions}
                  selectedPermissionCodes={selectedPermissionCodes}
                  onTogglePermission={onTogglePermission}
                />
              ) : null}
            </AccordionContent>
          </AccordionItem>
        );
      })}
    </Accordion>
  );
}

function PermissionGroup({
  label,
  onTogglePermission,
  permissions,
  selectedPermissionCodes,
}: {
  label: "Page Access" | "Module Actions";
  onTogglePermission: (permissionCode: string) => void;
  permissions: AuthPermission[];
  selectedPermissionCodes: Set<string>;
}) {
  return (
    <section className="not-last:border-b">
      <div className="grid min-h-7 grid-cols-[minmax(0,1fr)_auto] items-center bg-muted/30 px-3 text-[0.6875rem] font-medium text-muted-foreground">
        <span>{label}</span>
        <span>Grant</span>
      </div>
      <div className="grid grid-cols-1 xl:grid-cols-2">
        {permissions.map((permission) => {
          const name = label === "Page Access"
            ? permission.page_name || getPermissionName(permission)
            : permission.action_name || getPermissionName(permission);
          const description = permission.description?.trim();
          const isSelected = selectedPermissionCodes.has(permission.permission_code);
          return (
            <div
              className="permission-row grid min-h-11 grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-t px-3 py-1.5 transition-colors first:border-t-0 hover:bg-muted/30 xl:odd:border-r xl:[&:nth-child(2)]:border-t-0"
              key={permission.permission_code}
            >
              <div className="min-w-0">
                <strong className="block text-xs font-medium leading-4 text-foreground">{name}</strong>
                {description ? (
                  <span className="mt-0.5 block whitespace-normal break-words text-[0.6875rem] leading-4 text-muted-foreground">
                    {permission.description}
                  </span>
                ) : null}
                <span className="block break-all font-mono text-[0.625rem] leading-4 text-muted-foreground">
                  {permission.permission_code}
                </span>
              </div>
              <Checkbox
                aria-label={`${isSelected ? "Revoke" : "Grant"} ${name}`}
                isSelected={isSelected}
                onChange={() => onTogglePermission(permission.permission_code)}
              />
            </div>
          );
        })}
      </div>
    </section>
  );
}

function StatusBadge({ isActive }: { isActive: boolean }) {
  return (
    <Badge
      variant="outline"
      className={isActive
        ? "h-4 border-emerald-200 bg-emerald-50 px-1.5 text-[0.625rem] text-emerald-700 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-300"
        : "h-4 border-slate-200 bg-slate-50 px-1.5 text-[0.625rem] text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-300"}
    >
      {isActive ? "Active" : "Inactive"}
    </Badge>
  );
}
