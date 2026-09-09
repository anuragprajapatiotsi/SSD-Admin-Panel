import { PageHeader, PageSection } from "@/components/common/page-layout";
import { SearchInput } from "@/components/common/search-input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { createDataTableColumnHelper, DataTable, useDataTable } from "@/components/data-table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip";
import { useConfirmation } from "@/hooks/use-confirmation";
import { cn } from "@/lib/utils";
import { IconEdit, IconLock, IconPlus, IconTrash } from "@tabler/icons-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { AuthRole } from "../../api/auth-admin.api";
import { getRoleName, getRolePermissionCodes } from "./permission-matrix-utils";
import { useAuthRoleList, useDeleteAuthRole, useUpdateAuthRole } from "../../hooks/use-auth-roles";

const roleColumnHelper = createDataTableColumnHelper<AuthRole>();

export function RoleManagementPage() {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const location = useLocation();
  const confirm = useConfirmation();
  const [search, setSearch] = useState("");
  const [scope, setScope] = useState("ALL");
  const [status, setStatus] = useState("ALL");
  const [highlightedRoleCode, setHighlightedRoleCode] = useState(() => String((location.state as { createdRoleCode?: string } | null)?.createdRoleCode ?? ""));
  const rolesQuery = useAuthRoleList(true);
  const deleteMutation = useDeleteAuthRole();
  const updateMutation = useUpdateAuthRole();
  const statusUpdatingRole = updateMutation.isPending ? updateMutation.variables?.roleCode ?? "" : "";
  useEffect(() => {
    if (!highlightedRoleCode) return;
    const timeout = window.setTimeout(() => setHighlightedRoleCode(""), 3000);
    navigate(location.pathname, { replace: true, state: null });
    return () => window.clearTimeout(timeout);
  }, [highlightedRoleCode, location.pathname, navigate]);
  const roles = useMemo(() => {
    const term = search.trim().toLocaleLowerCase();
    return (rolesQuery.data ?? []).filter((role) => {
      const matchesScope = scope === "ALL" || role.role_scope === scope;
      const matchesStatus = status === "ALL" || (status === "ACTIVE" ? role.is_active !== false : role.is_active === false);
      const matchesSearch = !term || [getRoleName(role), role.description, role.role_code].some((value) => String(value ?? "").toLocaleLowerCase().includes(term));
      return matchesScope && matchesStatus && matchesSearch;
    });
  }, [rolesQuery.data, scope, search, status]);

  const updateStatus = useCallback(async (role: AuthRole, isActive: boolean) => {
    try {
      await updateMutation.mutateAsync({ roleCode: role.role_code, payload: { role_scope: role.role_scope ?? "UNIT", is_active: isActive } });
      toast.success(t("pages.roleManagement.feedback.statusUpdated"), { description: t("pages.roleManagement.feedback.statusUpdatedDescription", { name: getRoleName(role), status: t(isActive ? "pages.roleManagement.status.active" : "pages.roleManagement.status.inactive") }) });
    } catch (error) {
      toast.error(t("pages.roleManagement.feedback.statusError"), { description: error instanceof Error ? error.message : t("pages.roleManagement.feedback.tryAgain") });
    }
  }, [t, updateMutation]);

  const deleteRole = useCallback(async (role: AuthRole) => {
    if (role.is_system_role) return;
    const approved = await confirm(t("pages.roleManagement.delete.description", { name: getRoleName(role) }));
    if (!approved) return;
    try {
      await deleteMutation.mutateAsync(role.role_code);
      toast.success(t("pages.roleManagement.feedback.deleted"), { description: t("pages.roleManagement.feedback.deletedDescription", { name: getRoleName(role) }) });
    } catch (error) {
      toast.error(t("pages.roleManagement.feedback.deleteError"), { description: error instanceof Error ? error.message : t("pages.roleManagement.feedback.tryAgain") });
    }
  }, [confirm, deleteMutation, t]);

  const columns = useMemo(() => roleColumnHelper.columns([
    roleColumnHelper.accessor((role) => getRoleName(role), { id: "name", header: t("pages.roleManagement.columns.name"), cell: ({ row }) => <div className="min-w-48"><div className="flex items-center gap-1.5"><p className="font-medium text-foreground">{getRoleName(row.original)}</p>{row.original.is_system_role ? <TooltipTrigger><span className="inline-flex text-muted-foreground" tabIndex={0} aria-label={t("pages.roleManagement.systemRoleHelp")}><IconLock className="size-3" aria-hidden="true" /></span><Tooltip>{t("pages.roleManagement.systemRoleHelp")}</Tooltip></TooltipTrigger> : null}</div><p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{row.original.description || row.original.role_code}</p></div> }),
    roleColumnHelper.accessor("role_scope", { header: t("pages.roleManagement.columns.scope"), cell: ({ getValue }) => <Badge variant={getValue() === "GLOBAL" ? "secondary" : "outline"}>{t(getValue() === "GLOBAL" ? "pages.roleManagement.scopes.global" : "pages.roleManagement.scopes.unit")}</Badge> }),
    roleColumnHelper.accessor((role) => getRolePermissionCodes(role).length, { id: "permissions", header: t("pages.roleManagement.columns.permissions"), cell: ({ getValue }) => <Badge variant="secondary">{getValue()}</Badge> }),
    roleColumnHelper.accessor("is_active", { header: t("pages.roleManagement.columns.status"), cell: ({ row }) => { const isActive = row.original.is_active !== false; return <div className="flex items-center gap-2"><Switch size="sm" aria-label={t("pages.roleManagement.status.changeFor", { name: getRoleName(row.original) })} isDisabled={Boolean(statusUpdatingRole)} isSelected={isActive} onChange={(selected) => void updateStatus(row.original, selected)} /><span className={cn(isActive ? "font-medium text-foreground" : "text-muted-foreground")}>{t(isActive ? "pages.roleManagement.status.active" : "pages.roleManagement.status.inactive")}</span></div>; } }),
    roleColumnHelper.display({ id: "actions", header: () => <span className="block text-right">{t("pages.roleManagement.columns.actions")}</span>, cell: ({ row }) => <div className="flex justify-end gap-1"><TooltipTrigger><Button aria-label={t("pages.roleManagement.actions.editFor", { name: getRoleName(row.original) })} size="icon-sm" variant="ghost" onPress={() => navigate(`/authentication/roles/${encodeURIComponent(row.original.role_code)}/edit`)}><IconEdit data-icon="inline-start" aria-hidden="true" /></Button><Tooltip>{t("pages.roleManagement.actions.edit")}</Tooltip></TooltipTrigger><TooltipTrigger><span className={cn("inline-flex", row.original.is_system_role && "cursor-not-allowed")} tabIndex={row.original.is_system_role ? 0 : undefined}><Button className="disabled:opacity-40" aria-label={t("pages.roleManagement.actions.deleteFor", { name: getRoleName(row.original) })} size="icon-sm" variant="destructive" isDisabled={row.original.is_system_role || deleteMutation.isPending} onPress={() => void deleteRole(row.original)}><IconTrash data-icon="inline-start" aria-hidden="true" /></Button></span><Tooltip>{t(row.original.is_system_role ? "pages.roleManagement.systemDeleteHelp" : "pages.roleManagement.actions.delete")}</Tooltip></TooltipTrigger></div> }),
  ]), [deleteMutation.isPending, deleteRole, navigate, statusUpdatingRole, t, updateStatus]);
  const table = useDataTable({ columns, data: roles, getRowId: (role) => role.role_code, enableRowSelection: false, initialState: { pagination: { pageIndex: 0, pageSize: 10 } } });

  return <PageSection className="flex min-w-0 flex-col gap-4"><PageHeader><div><h2>{t("pages.roleManagement.title")}</h2><p>{t("pages.roleManagement.description")}</p></div><Button onPress={() => navigate("/authentication/roles/new")}><IconPlus data-icon="inline-start" aria-hidden="true" />{t("pages.roleManagement.actions.new")}</Button></PageHeader><div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"><SearchInput className="w-full sm:max-w-sm" value={search} onValueChange={setSearch} label={t("pages.roleManagement.search")} placeholder={t("pages.roleManagement.search")} clearLabel={t("dataTable.clearSearch")} /><Select aria-label={t("pages.roleManagement.filters.scope")} selectedKey={scope} onSelectionChange={(key) => setScope(String(key))}><SelectTrigger className="w-full sm:w-44"><SelectValue /></SelectTrigger><SelectContent><SelectItem id="ALL">{t("pages.roleManagement.scopes.all")}</SelectItem><SelectItem id="UNIT">{t("pages.roleManagement.scopes.unit")}</SelectItem><SelectItem id="GLOBAL">{t("pages.roleManagement.scopes.global")}</SelectItem></SelectContent></Select></div><Tabs variant="underline" selectedKey={status} onSelectionChange={(key) => setStatus(String(key))}><TabsList aria-label={t("pages.roleManagement.status.tabsLabel")}><TabsTrigger id="ALL">{t("pages.roleManagement.status.all")}</TabsTrigger><TabsTrigger id="ACTIVE">{t("pages.roleManagement.status.active")}</TabsTrigger><TabsTrigger id="INACTIVE">{t("pages.roleManagement.status.inactive")}</TabsTrigger></TabsList><TabsContent id={status}><DataTable table={table} ariaLabel={t("pages.roleManagement.tableLabel")} isLoading={rolesQuery.isFetching} loadingMessage={t("pages.roleManagement.states.loading")} error={rolesQuery.error instanceof Error ? rolesQuery.error.message : rolesQuery.error ? t("pages.roleManagement.states.loadError") : undefined} emptyMessage={t(search || scope !== "ALL" || status !== "ALL" ? "pages.roleManagement.states.noResults" : "pages.roleManagement.states.empty")} noResultsMessage={t("pages.roleManagement.states.noResults")} onRetry={() => void rolesQuery.refetch()} totalCount={roles.length} getRowClassName={(role) => cn(role.role_code === highlightedRoleCode && "bg-primary/10 transition-colors")} /></TabsContent></Tabs></PageSection>;
}
