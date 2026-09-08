import { useConfirmation } from "@/hooks/use-confirmation";
import { CardContent, Card } from "@/components/ui/card";
import { Sheet, SheetTitle } from "@/components/ui/sheet";

import { BooleanField } from "@/components/common/boolean-field";
import { PageHeader } from "@/components/common/page-layout";

import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  createDataTableColumnHelper,
  DataTable,
  type DataTableFilterFn,
  useDataTable,
} from "@/components/data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus, RefreshCw, Search, X } from "lucide-react";
import type { FormEvent } from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import {
  createAuthRole,
  deactivateAuthRole,
  getAuthRole,
  listAuthPermissions,
  listAuthRoles,
  setAuthRolePermissions,
  updateAuthRole,
  type AuthPermission,
  type AuthRole,
} from "../../api/auth-admin.api";
import { getSelectedLocale, LOCALE_CHANGED_EVENT } from "../../api/session.api";
import { Loader } from "../../components/common/loader";
import { useAuthPermissions } from "../../hooks/use-auth-permissions";
import { PermissionMatrixWorkspace } from "./permission-matrix-workspace";
import {
  getPermissionKind,
  getPermissionName,
  getRoleName,
  getRolePermissionCodes,
  groupPermissionsByModule,
} from "./permission-matrix-utils";

type AuthTab = "catalog" | "roles";
type RoleDrawerState = { mode: "create" } | { mode: "edit"; role: AuthRole } | null;

const accessCatalogColumnHelper = createDataTableColumnHelper<AuthPermission>();
const EMPTY_AUTH_PERMISSIONS: AuthPermission[] = [];

const accessCatalogGlobalFilter: DataTableFilterFn<AuthPermission> = (
  row,
  _columnId,
  filterValue,
) => matchesSearch(
  String(filterValue ?? ""),
  row.original.permission_name,
  row.original.module_code,
  row.original.route_path,
  row.original.description,
  row.original.is_active === false ? "Inactive" : "Active",
);

export function AccessManagementPage() {
  const confirm = useConfirmation();
  const location = useLocation();
  const activeTab: AuthTab = location.pathname.includes("permission-matrix") ? "roles" : "catalog";
  const pageTitle = activeTab === "roles" ? "Permission Matrix" : "Access Catalog";
  const pageDescription =
    activeTab === "roles"
      ? "Assign module, page, and action permissions to governed roles."
      : "Review protected modules, pages, routes, actions, and permission codes.";

  const [permissions, setPermissions] = useState<AuthPermission[]>([]);
  const [roles, setRoles] = useState<AuthRole[]>([]);
  const [selectedRoleCode, setSelectedRoleCode] = useState("");
  const [initialPermissionCodes, setInitialPermissionCodes] = useState<Set<string>>(new Set());
  const [selectedPermissionCodes, setSelectedPermissionCodes] = useState<Set<string>>(new Set());
  const [searchText, setSearchText] = useState("");
  const [roleSearchText, setRoleSearchText] = useState("");
  const [moduleFilter, setModuleFilter] = useState("ALL");
  const [permissionTypeFilter, setPermissionTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ACTIVE");
  const [drawer, setDrawer] = useState<RoleDrawerState>(null);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isRoleLoading, setIsRoleLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [catalogLocale, setCatalogLocale] = useState(getSelectedLocale);
  const roleRequestId = useRef(0);

  const debouncedSearchText = useDebouncedValue(searchText, 220);
  const debouncedRoleSearchText = useDebouncedValue(roleSearchText, 160);

  const moduleGroups = useMemo(() => groupPermissionsByModule(permissions), [permissions]);
  const moduleOptions = useMemo(() => moduleGroups.map((group) => group.moduleCode).sort(), [moduleGroups]);
  const selectedRole = useMemo(
    () => roles.find((role) => role.role_code === selectedRoleCode) ?? roles[0],
    [roles, selectedRoleCode],
  );

  const filteredPermissions = useMemo(() => {
    return permissions.filter((permission) => {
      const moduleMatches = moduleFilter === "ALL" || normalizeCode(permission.module_code) === moduleFilter;
      const typeMatches = permissionTypeFilter === "ALL" || getPermissionKind(permission) === permissionTypeFilter;
      const statusMatches = statusFilter === "ALL" || Boolean(permission.is_active ?? true) === (statusFilter === "ACTIVE");
      return (
        moduleMatches &&
        typeMatches &&
        statusMatches &&
        matchesSearch(
          debouncedSearchText,
          permission.permission_code,
          getPermissionName(permission),
          permission.module_code,
          permission.page_code,
          permission.action_code,
        )
      );
    });
  }, [debouncedSearchText, moduleFilter, permissionTypeFilter, permissions, statusFilter]);

  const filteredRoles = useMemo(() => {
    return roles.filter((role) => {
      const statusMatches = statusFilter === "ALL" || Boolean(role.is_active ?? true) === (statusFilter === "ACTIVE");
      return statusMatches
        && matchesSearch(debouncedSearchText, role.role_code, getRoleName(role), role.role_scope)
        && matchesSearch(debouncedRoleSearchText, role.role_code, getRoleName(role), role.role_scope);
    });
  }, [debouncedRoleSearchText, debouncedSearchText, roles, statusFilter]);
  const visibleRoles = useMemo(() => {
    if (!selectedRole || filteredRoles.some((role) => role.role_code === selectedRole.role_code)) {
      return filteredRoles;
    }
    return [selectedRole, ...filteredRoles];
  }, [filteredRoles, selectedRole]);

  const dirtySummary = useMemo(() => {
    const addedCount = Array.from(selectedPermissionCodes).filter((code) => !initialPermissionCodes.has(code)).length;
    const removedCount = Array.from(initialPermissionCodes).filter((code) => !selectedPermissionCodes.has(code)).length;
    return { addedCount, removedCount, isDirty: addedCount > 0 || removedCount > 0 };
  }, [initialPermissionCodes, selectedPermissionCodes]);

  useEffect(() => {
    void loadAccessData();
    // The initial bootstrap intentionally runs once; later reloads are explicit user or locale actions.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const handleLocaleChange = () => {
      setCatalogLocale(getSelectedLocale());
      void loadAccessData(selectedRoleCode);
    };
    window.addEventListener(LOCALE_CHANGED_EVENT, handleLocaleChange);
    return () => window.removeEventListener(LOCALE_CHANGED_EVENT, handleLocaleChange);
    // Re-registering keeps the latest selected role available to the locale event handler.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedRoleCode]);

  useEffect(() => {
    if (!notice) {
      return;
    }
    const timer = window.setTimeout(() => setNotice(""), 4200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    if (!dirtySummary.isDirty) return;
    const warnBeforeUnload = (event: BeforeUnloadEvent) => {
      event.preventDefault();
      event.returnValue = "";
    };
    window.addEventListener("beforeunload", warnBeforeUnload);
    return () => window.removeEventListener("beforeunload", warnBeforeUnload);
  }, [dirtySummary.isDirty]);

  async function loadAccessData(nextRoleCode = selectedRoleCode): Promise<void> {
    setIsLoading(true);
    setError("");
    try {
      const [permissionList, roleList] = await Promise.all([listAuthPermissions(true), listAuthRoles(true)]);
      setPermissions(permissionList);
      setRoles(roleList);
      const nextRole = roleList.find((role) => role.role_code === nextRoleCode) ?? roleList[0] ?? null;
      setSelectedRoleCode(nextRole?.role_code ?? "");
      if (nextRole) {
        await loadRolePermissions(nextRole.role_code, nextRole);
      } else {
        setInitialPermissionCodes(new Set());
        setSelectedPermissionCodes(new Set());
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Auth access data could not be loaded.");
    } finally {
      setIsLoading(false);
    }
  }

  async function loadRolePermissions(roleCode: string, fallbackRole?: AuthRole): Promise<void> {
    const requestId = ++roleRequestId.current;
    setIsRoleLoading(true);
    try {
      const detail = await getAuthRole(roleCode);
      if (requestId !== roleRequestId.current) return;
      setRoles((currentRoles) => currentRoles.map((role) => (
        role.role_code === roleCode ? { ...role, ...detail } : role
      )));
      const permissionCodes = new Set(getRolePermissionCodes(detail));
      setInitialPermissionCodes(permissionCodes);
      setSelectedPermissionCodes(new Set(permissionCodes));
    } catch {
      if (requestId !== roleRequestId.current) return;
      const role = fallbackRole ?? roles.find((item) => item.role_code === roleCode);
      const permissionCodes = new Set(role ? getRolePermissionCodes(role) : []);
      setInitialPermissionCodes(permissionCodes);
      setSelectedPermissionCodes(new Set(permissionCodes));
    } finally {
      if (requestId === roleRequestId.current) setIsRoleLoading(false);
    }
  }

  async function handleRoleSelection(roleCode: string): Promise<void> {
    if (roleCode === selectedRole?.role_code) return;
    if (dirtySummary.isDirty && !(await confirm("Discard unsaved permission changes and switch roles?"))) {
      return;
    }
    const role = roles.find((item) => item.role_code === roleCode);
    setSelectedRoleCode(roleCode);
    void loadRolePermissions(roleCode, role);
  }

  function togglePermission(permissionCode: string): void {
    setSelectedPermissionCodes((current) => {
      const next = new Set(current);
      if (next.has(permissionCode)) {
        next.delete(permissionCode);
      } else {
        next.add(permissionCode);
      }
      return next;
    });
  }

  function setPermissionSelection(permissionCodes: string[], isSelected: boolean): void {
    setSelectedPermissionCodes((current) => {
      const next = new Set(current);
      permissionCodes.forEach((permissionCode) => {
        if (isSelected) next.add(permissionCode);
        else next.delete(permissionCode);
      });
      return next;
    });
  }

  function discardPermissionChanges(): void {
    setSelectedPermissionCodes(new Set(initialPermissionCodes));
  }

  async function cloneRolePermissions(roleCode: string): Promise<void> {
    const requestId = ++roleRequestId.current;
    setIsRoleLoading(true);
    setError("");
    try {
      const sourceRole = await getAuthRole(roleCode);
      if (requestId !== roleRequestId.current) return;
      setSelectedPermissionCodes(new Set(getRolePermissionCodes(sourceRole)));
      setNotice(`Permissions copied from ${roleCode}. Review and save the changes.`);
    } catch (cloneError) {
      if (requestId !== roleRequestId.current) return;
      setError(cloneError instanceof Error ? cloneError.message : "Role permissions could not be copied.");
    } finally {
      if (requestId === roleRequestId.current) setIsRoleLoading(false);
    }
  }

  async function handleSavePermissions(): Promise<void> {
    if (!selectedRole || !dirtySummary.isDirty) {
      return;
    }
    setIsSaving(true);
    setError("");
    try {
      await setAuthRolePermissions(selectedRole.role_code, Array.from(selectedPermissionCodes).sort());
      await loadAccessData(selectedRole.role_code);
      setNotice(`Permissions saved for ${selectedRole.role_code}.`);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Role permissions could not be saved.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDeactivateRole(roleCode: string): Promise<void> {
    const unsavedWarning = dirtySummary.isDirty ? " Unsaved permission changes will be discarded." : "";
    if (!(await confirm(`Deactivate role ${roleCode}? Existing history will be preserved.${unsavedWarning}`))) {
      return;
    }
    setIsSaving(true);
    setError("");
    try {
      await deactivateAuthRole(roleCode);
      await loadAccessData(roleCode);
      setNotice(`${roleCode} deactivated.`);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Role could not be deactivated.");
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDrawerSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (dirtySummary.isDirty && !(await confirm("Discard unsaved permission changes and save the role details?"))) {
      return;
    }
    const form = new FormData(event.currentTarget);
    const roleCode = normalizeFormCode(String(form.get("role_code") ?? ""));
    const roleScope = String(form.get("role_scope") ?? "UNIT");
    const isActive = form.get("is_active") === "on";
    const isSystemRole = form.get("is_system_role") === "on";

    setIsSaving(true);
    setError("");
    try {
      if (drawer?.mode === "edit") {
        await updateAuthRole(drawer.role.role_code, { role_scope: roleScope, is_active: isActive });
        await loadAccessData(drawer.role.role_code);
        setNotice(`${drawer.role.role_code} updated.`);
      } else {
        await createAuthRole({ role_code: roleCode, role_scope: roleScope, is_system_role: isSystemRole });
        await loadAccessData(roleCode);
        setNotice(`${roleCode} created.`);
      }
      setDrawer(null);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Role could not be saved.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="flex min-w-0 flex-col gap-4">
      <PageHeader>
        <div>
          <h2>{pageTitle}</h2>
          <p>{pageDescription}</p>
        </div>
        {activeTab === "roles" ? (
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline"

              type="button"
              onPress={async () => {
                if (dirtySummary.isDirty && !(await confirm("Discard unsaved permission changes and refresh?"))) {
                  return;
                }
                void loadAccessData();
              }}
            >
              <RefreshCw size={14} />
              Refresh
            </Button>
            <Button type="button" onClick={() => setDrawer({ mode: "create" })}>
              <Plus size={14} />
              New Role
            </Button>
          </div>
        ) : null}
      </PageHeader>

      {notice && <div className="rounded-md bg-muted p-3 text-sm">{notice}</div>}
      {activeTab === "roles" && error && <div className="rounded-md bg-muted p-3 text-sm text-destructive">{error}</div>}

      {activeTab === "roles" && <section className="flex flex-wrap items-center gap-2 rounded-lg border bg-background p-2">
        <label className="relative min-w-56 flex-1">
          <span className="sr-only">Search roles and permissions</span>
          <Search className="pointer-events-none absolute top-1/2 left-2 size-3.5 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
          <Input
            className="pl-7"
            onChange={(event) => setSearchText(event.target.value)}
            placeholder="Search role, module, permission, or code..."
            value={searchText}
          />
        </label>
        <Select selectedKey={moduleFilter} aria-label="Module filter" onSelectionChange={(key) => setModuleFilter(String(key ?? "ALL"))}>
          <SelectTrigger size="sm" className="w-40">
            <span className="text-muted-foreground">Module:</span><SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem id="ALL">All</SelectItem>
            {moduleOptions.map((moduleCode) => (
              <SelectItem id={moduleCode} key={moduleCode}>{moduleCode}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select selectedKey={permissionTypeFilter} aria-label="Permission type filter" onSelectionChange={(key) => setPermissionTypeFilter(String(key ?? "ALL"))}>
          <SelectTrigger size="sm" className="w-40">
            <span className="text-muted-foreground">Type:</span><SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem id="ALL">All</SelectItem>
            <SelectItem id="PAGE">Page Access</SelectItem>
            <SelectItem id="ACTION">Module Actions</SelectItem>
          </SelectContent>
        </Select>
        <Select selectedKey={statusFilter} aria-label="Status filter" onSelectionChange={(key) => setStatusFilter(String(key ?? "ACTIVE"))}>
          <SelectTrigger size="sm" className="w-36">
            <span className="text-muted-foreground">Status:</span><SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem id="ACTIVE">Active</SelectItem>
            <SelectItem id="ALL">All</SelectItem>
            <SelectItem id="INACTIVE">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </section>}

      {activeTab === "catalog" ? (
        <Card className="min-w-0"><CardContent className="flex min-w-0 flex-col gap-3"><AccessCatalog locale={catalogLocale} /></CardContent></Card>
      ) : isLoading ? (
        <section className="grid min-h-72 flex-1 place-items-center rounded-lg border bg-background">
          <Loader text="Loading authentication access records..." />
        </section>
      ) : (
        <PermissionMatrixWorkspace
            addedCount={dirtySummary.addedCount}
            filteredPermissionCount={filteredPermissions.length}
            isRoleLoading={isRoleLoading}
            isSaving={isSaving}
            moduleGroups={groupPermissionsByModule(filteredPermissions)}
            onClearAll={() => setSelectedPermissionCodes(new Set())}
            onClonePermissions={(roleCode) => void cloneRolePermissions(roleCode)}
            onDeactivateRole={(roleCode) => void handleDeactivateRole(roleCode)}
            onDiscardChanges={discardPermissionChanges}
            onEditRole={(role) => setDrawer({ mode: "edit", role })}
            onRoleSearchChange={setRoleSearchText}
            onRoleSelection={handleRoleSelection}
            onSave={() => void handleSavePermissions()}
            onSetPermissions={setPermissionSelection}
            onTogglePermission={togglePermission}
            removedCount={dirtySummary.removedCount}
            roleSearch={roleSearchText}
            roles={visibleRoles}
            selectedPermissionCodes={selectedPermissionCodes}
            selectedRole={selectedRole}
            totalPermissionCount={permissions.length}
        />
      )}

      {drawer && (
        <RoleDrawer
          drawer={drawer}
          isSaving={isSaving}
          onClose={() => setDrawer(null)}
          onSubmit={handleDrawerSubmit}
        />
      )}
    </div>
  );
}

function AccessCatalog({ locale }: { locale: string }) {
  const [moduleFilter, setModuleFilter] = useState("ALL");
  const [permissionTypeFilter, setPermissionTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ACTIVE");
  const includeInactive = statusFilter !== "ACTIVE";
  const baseQuery = useAuthPermissions({
    includeInactive,
    locale,
    acceptLanguage: locale,
  });
  const scopedQuery = useAuthPermissions({
    moduleCode: moduleFilter === "ALL" ? undefined : moduleFilter,
    includeInactive,
    locale,
    acceptLanguage: locale,
  }, moduleFilter !== "ALL");
  const activeQuery = moduleFilter === "ALL" ? baseQuery : scopedQuery;
  const responsePermissions = activeQuery.data?.data ?? EMPTY_AUTH_PERMISSIONS;
  const permissions = useMemo(() => responsePermissions.filter((permission) => {
    const typeMatches = permissionTypeFilter === "ALL" || getPermissionKind(permission) === permissionTypeFilter;
    const statusMatches = statusFilter !== "INACTIVE" || permission.is_active === false;
    return typeMatches && statusMatches;
  }), [permissionTypeFilter, responsePermissions, statusFilter]);
  const moduleOptions = useMemo(() => Array.from(new Set(
    (baseQuery.data?.data ?? responsePermissions)
      .map((permission) => normalizeCode(permission.module_code))
      .filter(Boolean),
  )).sort(), [baseQuery.data?.data, responsePermissions]);
  const columns = useMemo(() => accessCatalogColumnHelper.columns([
    accessCatalogColumnHelper.accessor("permission_name", {
      header: "Permission Name",
      sortFn: "alphanumeric",
      cell: ({ getValue }) => {
        const value = readableTitle(getValue(), "Not provided");
        return <span className="block whitespace-normal break-words font-medium" title={value}>{value}</span>;
      },
    }),
    accessCatalogColumnHelper.accessor("description", {
      header: "Description",
      sortFn: "alphanumeric",
      cell: ({ getValue }) => {
        const value = readableSentence(getValue(), "No description available");
        return <span className="block whitespace-normal break-words text-foreground" title={value}>{value}</span>;
      },
    }),
    accessCatalogColumnHelper.accessor("module_code", {
      header: "Module Code",
      sortFn: "alphanumeric",
      cell: ({ getValue }) => {
        const value = readableTitle(getValue(), "Not assigned");
        return <span className="block whitespace-normal break-words" title={value}>{value}</span>;
      },
    }),
    accessCatalogColumnHelper.accessor("route_path", {
      header: "Route Path",
      sortFn: "alphanumeric",
      cell: ({ getValue }) => {
        const value = getValue()?.trim() || "Not assigned";
        return <span className="block whitespace-normal break-all text-foreground" title={value}>{value}</span>;
      },
    }),
  ]), []);
  const table = useDataTable({
    columns,
    data: permissions,
    rowCount: activeQuery.data?.count ?? permissions.length,
    getRowId: (permission: AuthPermission) => permission.permission_code,
    globalFilterFn: accessCatalogGlobalFilter,
    enableMultiSort: false,
    enableRowSelection: false,
    autoResetPageIndex: true,
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 10,
      },
    },
  });
  const loadError = activeQuery.error instanceof Error
    ? activeQuery.error.message
    : activeQuery.error ? "Permissions could not be loaded." : undefined;

  return (
    <div>
      <DataTable
        table={table}
        ariaLabel="Access catalog permissions"
        tableClassName="min-w-[720px] table-fixed [&_th:nth-child(1)]:w-[26%] [&_th:nth-child(2)]:w-[38%] [&_th:nth-child(3)]:w-[16%] [&_th:nth-child(4)]:w-[20%]"
        searchPlaceholder="Search permission, module, route, or description"
        toolbarActions={(
          <div className="flex flex-wrap items-center justify-end gap-2">
            <Select
              aria-label="Module"
              selectedKey={moduleFilter}
              onSelectionChange={(key) => setModuleFilter(String(key ?? "ALL"))}
            >
              <SelectTrigger size="sm" className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem id="ALL">All modules</SelectItem>
                {moduleOptions.map((moduleCode) => (
                  <SelectItem id={moduleCode} key={moduleCode}>{readableTitle(moduleCode, moduleCode)}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              aria-label="Permission type"
              selectedKey={permissionTypeFilter}
              onSelectionChange={(key) => setPermissionTypeFilter(String(key ?? "ALL"))}
            >
              <SelectTrigger size="sm" className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem id="ALL">All types</SelectItem>
                <SelectItem id="PAGE">Page access</SelectItem>
                <SelectItem id="ACTION">Module actions</SelectItem>
              </SelectContent>
            </Select>
            <Select
              aria-label="Status"
              selectedKey={statusFilter}
              onSelectionChange={(key) => setStatusFilter(String(key ?? "ACTIVE"))}
            >
              <SelectTrigger size="sm" className="w-32"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem id="ALL">All Statuses</SelectItem>
                <SelectItem id="ACTIVE">Active</SelectItem>
                <SelectItem id="INACTIVE">Inactive</SelectItem>
              </SelectContent>
            </Select>
          </div>
        )}
        isLoading={activeQuery.isPending}
        loadingMessage="Loading access catalog permissions..."
        error={loadError}
        emptyMessage="No permissions are available."
        noResultsMessage="No permissions found for the selected filters."
        onRetry={() => void activeQuery.refetch()}
        totalCount={activeQuery.data?.count}
      />
    </div>
  );
}

function RoleDrawer({
  drawer,
  isSaving,
  onClose,
  onSubmit,
}: {
  drawer: Exclude<RoleDrawerState, null>;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const isEdit = drawer.mode === "edit";
  const role = isEdit ? drawer.role : undefined;
  return (
    <Sheet isOpen showCloseButton={false} onOpenChange={(open) => { if (!open) { onClose(); } }} className="w-full sm:max-w-xl">
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <div className="flex shrink-0 items-start justify-between gap-3 border-b p-4 [&_h3]:text-base [&_h3]:font-semibold [&_span]:text-xs [&_span]:text-muted-foreground">
          <div>
            <span className="text-xs font-medium text-muted-foreground">{isEdit ? "Update" : "Create"}</span>
            <SheetTitle>Role</SheetTitle>
          </div>
          <Button size="icon-sm" variant="ghost" type="button" onClick={onClose} aria-label="Close role drawer">
            <X size={16} />
          </Button>
        </div>
        <form className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4" onSubmit={onSubmit}>
          <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-foreground [&>small]:font-normal [&>small]:text-muted-foreground">
            Role code
            <Input
              defaultValue={role?.role_code ?? ""}
              disabled={isEdit}
              name="role_code"
              onBlur={(event) => {
                event.currentTarget.value = normalizeFormCode(event.currentTarget.value);
              }}
              placeholder="UNIT_REVIEWER"
              required
            />
          </label>
          <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-foreground [&>small]:font-normal [&>small]:text-muted-foreground">
            Role scope
            <NativeSelect defaultValue={role?.role_scope ?? "UNIT"} name="role_scope">
              <NativeSelectOption value="UNIT">Pillar scoped</NativeSelectOption>
              <NativeSelectOption value="GLOBAL">Global</NativeSelectOption>
            </NativeSelect>
          </label>
          <BooleanField defaultSelected={role?.is_active ?? true} isDisabled={!isEdit} name="is_active" >

            <span className="flex min-w-0 flex-1 flex-col gap-1 [&>small]:text-xs [&>small]:font-normal [&>small]:text-muted-foreground">
              <strong>Active role</strong>
              <small>Allow this role to be assigned and used.</small>
            </span>
            <span className="hidden" aria-hidden="true">
              <span className="hidden" />
            </span>
          </BooleanField>
          <BooleanField defaultSelected={role?.is_system_role ?? false} isDisabled={isEdit} name="is_system_role" >

            <span className="flex min-w-0 flex-1 flex-col gap-1 [&>small]:text-xs [&>small]:font-normal [&>small]:text-muted-foreground">
              <strong>System role</strong>
              <small>Protect this role as a platform-managed role.</small>
            </span>
            <span className="hidden" aria-hidden="true">
              <span className="hidden" />
            </span>
          </BooleanField>
          <div className="text-xs text-muted-foreground">
            Create the role first, then assign permissions from the module-wise matrix. Delete is treated as deactivate.
          </div>
          <div className="mt-auto flex shrink-0 flex-wrap items-center justify-end gap-2 border-t pt-4">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button isDisabled={isSaving} type="submit">
              Save Role
            </Button>
          </div>
        </form>
      </div>
    </Sheet>
  );
}

function readableTitle(value: string | undefined, fallback: string): string {
  const normalized = String(value ?? "").trim().replace(/[_-]+/g, " ");
  if (!normalized) {
    return fallback;
  }
  return normalized
    .toLowerCase()
    .replace(/\b[a-z0-9]/g, (character) => character.toUpperCase());
}

function readableSentence(value: string | undefined, fallback: string): string {
  const normalized = String(value ?? "").trim().replace(/_/g, " ");
  if (!normalized) {
    return fallback;
  }
  if (normalized !== normalized.toUpperCase()) {
    return normalized;
  }
  const lowerCaseValue = normalized.toLowerCase();
  return lowerCaseValue.charAt(0).toUpperCase() + lowerCaseValue.slice(1);
}

function normalizeCode(value?: string): string {
  return String(value ?? "").trim().toUpperCase();
}

function normalizeFormCode(value: string): string {
  return value.trim().toUpperCase().replace(/[^A-Z0-9_]/g, "_").replace(/_+/g, "_").replace(/^_|_$/g, "");
}

function matchesSearch(searchText: string, ...values: Array<string | number | undefined | null>): boolean {
  if (!searchText.trim()) {
    return true;
  }
  const normalizedSearch = searchText.trim().toLowerCase();
  return values.some((value) => String(value ?? "").toLowerCase().includes(normalizedSearch));
}

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedValue(value), delay);
    return () => window.clearTimeout(timer);
  }, [delay, value]);

  return debouncedValue;
}
