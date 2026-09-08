import { PageSection, PageHeader } from "@/components/common/page-layout";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { CustomTabs, type TabItem } from "@/components/common/custom-tabs";
import { SearchInput } from "@/components/common/search-input";
import { StatusDot } from "@/components/common/status-badge";
import { normalizeStatusVariant } from "@/components/common/status-variants";
import {
  createDataTableColumnHelper,
  DataTable,
  useDataTable,
} from "@/components/data-table";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverHeader, PopoverTitle, PopoverTrigger } from "@/components/ui/popover";
import { Switch } from "@/components/ui/switch";
import { formatCodeLabel } from "@/lib/utils";
import { Ellipsis, KeyRound, Pencil, Plus, ShieldCheck } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import {
  getAuthUsers,
  listAuthRoles,
  listAuthUnits,
  updateAuthUser,
  type AuthRole,
  type AuthUnit,
  type AuthUser,
  type AuthUserRoleAssignment,
} from "../../api/auth-admin.api";
import { LOCALE_CHANGED_EVENT } from "../../api/session.api";
import { ResetPasswordDialog } from "./reset-password-dialog";

const userColumnHelper = createDataTableColumnHelper<AuthUser>();
const DEFAULT_STATUS_FILTER = "ALL";
const USER_STATUS_TABS = ["ALL", "ACTIVE", "INACTIVE"] as const;

export function UserAdministrationPage() {
  const navigate = useNavigate();
  const { t } = useTranslation("common");
  const [users, setUsers] = useState<AuthUser[]>([]);
  const [roles, setRoles] = useState<AuthRole[]>([]);
  const [units, setUnits] = useState<AuthUnit[]>([]);
  const [roleFilter, setRoleFilter] = useState("ALL");
  const [unitFilter, setUnitFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState(DEFAULT_STATUS_FILTER);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");
  const [totalCount, setTotalCount] = useState(0);
  const [resetPasswordUser, setResetPasswordUser] = useState<AuthUser | null>(null);
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [statusUpdatingUsername, setStatusUpdatingUsername] = useState("");
  const userRequestId = useRef(0);

  const loadFilterOptions = useCallback(async (): Promise<void> => {
    try {
      const [roleList, unitList] = await Promise.all([
        listAuthRoles(true),
        listAuthUnits(true),
      ]);
      setRoles(roleList);
      setUnits(unitList);
    } catch (filterError) {
      setError(filterError instanceof Error ? filterError.message : t("pages.userManagement.feedback.filterLoadError"));
    }
  }, [t]);

  const loadUsers = useCallback(async (): Promise<void> => {
    const requestId = ++userRequestId.current;
    setIsLoading(true);
    setLoadError("");
    try {
      const response = await getAuthUsers({
        search: debouncedSearchText || undefined,
        unitCode: unitFilter === "ALL" ? undefined : unitFilter,
        roleCode: roleFilter === "ALL" ? undefined : roleFilter,
        includeInactive: statusFilter !== "ACTIVE",
      });
      if (requestId !== userRequestId.current) return;

      // The API exposes include_inactive, but not an inactive-only parameter.
      // Request both states, then narrow that response only for the Inactive view.
      const userList = statusFilter === "INACTIVE"
        ? response.data.filter((user) => user.is_active === false)
        : response.data;
      const responseCount = Number.isFinite(response.count) ? response.count : response.data.length;
      setUsers(userList);
      setTotalCount(statusFilter === "INACTIVE" ? userList.length : responseCount);
    } catch (nextLoadError) {
      if (requestId !== userRequestId.current) return;
      setLoadError(nextLoadError instanceof Error ? nextLoadError.message : t("pages.userManagement.feedback.usersLoadError"));
    } finally {
      if (requestId === userRequestId.current) setIsLoading(false);
    }
  }, [debouncedSearchText, roleFilter, statusFilter, t, unitFilter]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadFilterOptions(), 0);
    return () => window.clearTimeout(timer);
  }, [loadFilterOptions]);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearchText(searchText.trim()), 350);
    return () => window.clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadUsers(), 0);
    return () => window.clearTimeout(timer);
  }, [loadUsers]);

  useEffect(() => {
    const handleLocaleChange = () => {
      void loadUsers();
      void loadFilterOptions();
    };
    window.addEventListener(LOCALE_CHANGED_EVENT, handleLocaleChange);
    return () => window.removeEventListener(LOCALE_CHANGED_EVENT, handleLocaleChange);
  }, [loadFilterOptions, loadUsers]);

  const handleStatusChange = useCallback(async (user: AuthUser, isActive: boolean): Promise<void> => {
    setStatusUpdatingUsername(user.username);
    setError("");
    try {
      await updateAuthUser(user.username, { is_active: isActive });
      await loadUsers();
      toast.success(t("pages.userManagement.feedback.statusUpdated"), {
        description: t("pages.userManagement.feedback.statusUpdatedDescription", { name: resolveUserDisplayName(user), status: t(isActive ? "pages.userManagement.status.active" : "pages.userManagement.status.inactive") }),
      });
    } catch (statusError) {
      toast.error(t("pages.userManagement.feedback.statusUpdateError"), {
        description: statusError instanceof Error ? statusError.message : t("pages.userManagement.feedback.tryAgain"),
      });
    } finally {
      setStatusUpdatingUsername("");
    }
  }, [loadUsers, t]);

  const columns = useMemo(() => userColumnHelper.columns([
    userColumnHelper.accessor((user) => resolveUserDisplayName(user), {
      id: "identity",
      header: t("pages.userManagement.columns.username"),
      sortFn: "alphanumeric",
      cell: ({ row }) => (
        <strong className="block min-w-0 whitespace-normal break-words font-medium text-foreground sm:min-w-44">
          {resolveUserDisplayName(row.original)}
        </strong>
      ),
    }),
    userColumnHelper.accessor("email", {
      header: t("pages.userManagement.columns.email"),
      sortFn: "alphanumeric",
      cell: ({ getValue }) => (
        <span className="block min-w-0 break-all whitespace-normal text-foreground sm:min-w-48">
          {getValue()?.trim() || "-"}
        </span>
      ),
    }),
    userColumnHelper.accessor((user) => getUserRoles(user).map((role) => role.role_name || role.role_code).filter(Boolean).join(" "), {
      id: "roles",
      header: t("pages.userManagement.columns.roles"),
      sortFn: "alphanumeric",
      cell: ({ row }) => <UserRoleBadges user={row.original} />,
    }),
    userColumnHelper.accessor("is_active", {
      id: "status",
      header: t("pages.userManagement.columns.status"),
      sortFn: "alphanumeric",
      cell: ({ row }) => {
        const isActive = row.original.is_active !== false;
        return (
          <div className="flex items-center gap-2">
            <Switch
              size="sm"
              aria-label={t("pages.userManagement.status.changeFor", { name: resolveUserDisplayName(row.original) })}
              isDisabled={Boolean(statusUpdatingUsername)}
              isSelected={isActive}
              onChange={(selected) => void handleStatusChange(row.original, selected)}
            />
            <span className={isActive ? "font-medium text-foreground" : "text-muted-foreground"}>
              {t(isActive ? "pages.userManagement.status.active" : "pages.userManagement.status.inactive")}
            </span>
          </div>
        );
      },
    }),
    userColumnHelper.display({
      id: "actions",
      header: () => <span className="block text-right">{t("pages.userManagement.columns.actions")}</span>,
      enableSorting: false,
      enableGlobalFilter: false,
      cell: ({ row }) => (
        <UserActionsMenu
          user={row.original}
          onEdit={(user) => navigate(`/authentication/users/${encodeURIComponent(user.username)}/edit`)}
          onResetPassword={setResetPasswordUser}
          onAssignRole={(user) => navigate(`/authentication/users/${encodeURIComponent(user.username)}/roles`)}
          onAssignReviewLevel={(user) => navigate(`/authentication/users/${encodeURIComponent(user.username)}/review-levels`)}
        />
      ),
    }),
  ]), [handleStatusChange, navigate, statusUpdatingUsername, t]);

  const table = useDataTable({
    columns,
    data: users,
    rowCount: totalCount,
    getRowId: (user: AuthUser) => user.username,
    enableMultiSort: false,
    enableRowSelection: false,
    autoResetPageIndex: false,
    initialState: {
      pagination: {
        pageIndex: 0,
        pageSize: 10,
      },
    },
  });

  const hasActiveFilters = Boolean(
    searchText.trim()
    || roleFilter !== "ALL"
    || unitFilter !== "ALL"
    || statusFilter !== DEFAULT_STATUS_FILTER,
  );

  function handleSearchChange(value: string): void {
    userRequestId.current += 1;
    table.setPageIndex(0);
    setSearchText(value);
  }

  function handleRoleFilterChange(value: string): void {
    userRequestId.current += 1;
    table.setPageIndex(0);
    setRoleFilter(value);
  }

  function handleUnitFilterChange(value: string): void {
    userRequestId.current += 1;
    table.setPageIndex(0);
    setUnitFilter(value);
  }

  function handleStatusFilterChange(value: string): void {
    userRequestId.current += 1;
    table.setPageIndex(0);
    setStatusFilter(value);
  }

  const userTable = (
    <DataTable
      table={table}
      ariaLabel={t("pages.userManagement.tableLabel")}
      isLoading={isLoading}
      loadingMessage={t("pages.userManagement.states.loading")}
      error={loadError || undefined}
      emptyMessage={t(hasActiveFilters ? "pages.userManagement.states.noResults" : "pages.userManagement.states.empty")}
      noResultsMessage={t("pages.userManagement.states.noResults")}
      onRetry={() => void loadUsers()}
      totalCount={totalCount}
    />
  );

  const statusTabItems: TabItem[] = USER_STATUS_TABS.map((status) => ({
    value: status,
    label: t(`pages.userManagement.status.${status.toLowerCase()}`),
    icon: (
      <StatusDot
        variant={normalizeStatusVariant(status)}
        aria-hidden="true"
      />
    ),
    content: userTable,
  }));

  const dropdownFilters = (
    <div className="flex w-full gap-2 sm:w-auto sm:flex-none">
      <Select
        className="min-w-0 flex-1 sm:w-40 sm:flex-none"
        aria-label={t("pages.userManagement.filters.pillar")}
        selectedKey={unitFilter}
        onSelectionChange={(key) => handleUnitFilterChange(String(key ?? "ALL"))}
      >
        <SelectTrigger size="sm" className="w-full min-w-0 data-[size=sm]:h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="min-w-52">
          <SelectItem id="ALL">{t("pages.userManagement.filters.allPillars")}</SelectItem>
          {units.map((unit) => (
            <SelectItem id={unit.unit_code} key={unit.unit_code}>
              {formatCodeLabel(
                unit.unit_name ?? unit.display_name ?? unit.name ?? unit.unit_code,
              )}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Select
        className="min-w-0 flex-1 sm:w-40 sm:flex-none"
        aria-label={t("pages.userManagement.filters.role")}
        selectedKey={roleFilter}
        onSelectionChange={(key) => handleRoleFilterChange(String(key ?? "ALL"))}
      >
        <SelectTrigger size="sm" className="w-full min-w-0 data-[size=sm]:h-8">
          <SelectValue />
        </SelectTrigger>
        <SelectContent className="min-w-52">
          <SelectItem id="ALL">{t("pages.userManagement.filters.allRoles")}</SelectItem>
          {roles.map((role) => (
            <SelectItem id={role.role_code} key={role.role_code}>
              {formatCodeLabel(
                role.role_name ?? role.display_name ?? role.name ?? role.role_code,
              )}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );

  return (
    <PageSection className="flex min-w-0 flex-col gap-4">
      <PageHeader>
        <div>
          <h2>{t("pages.userManagement.title")}</h2>
          <p>{t("pages.userManagement.description")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" onPress={() => navigate("/authentication/users/new")}>
            <Plus data-icon="inline-start" aria-hidden="true" />
            {t("pages.userManagement.actions.addUser")}
          </Button>
        </div>
      </PageHeader>

      {error && <div className="rounded-md bg-muted p-3 text-sm text-destructive">{error}</div>}

      <div className="flex min-w-0 flex-col gap-2">
        <div className="flex shrink-0 flex-col gap-2 sm:flex-row sm:flex-wrap sm:items-center">
          <SearchInput
            className="w-full min-w-0 flex-1 sm:basis-80"
            value={searchText}
            onValueChange={handleSearchChange}
            label={t("pages.userManagement.searchPlaceholder")}
            placeholder={t("pages.userManagement.searchPlaceholder")}
            clearLabel={t("dataTable.clearSearch")}
          />
          {dropdownFilters}
        </div>
        <CustomTabs
          items={statusTabItems}
          value={statusFilter}
          onValueChange={handleStatusFilterChange}
          defaultValue={DEFAULT_STATUS_FILTER}
          variant="underline"
          ariaLabel={t("pages.userManagement.status.tabsLabel")}
          compact
        />
      </div>

      {resetPasswordUser ? (
        <ResetPasswordDialog
          displayName={resolveUserDisplayName(resetPasswordUser)}
          username={resetPasswordUser.username}
          onClose={() => setResetPasswordUser(null)}
          onSuccess={() => {
            toast.success(t("pages.userManagement.feedback.passwordResetSuccess"), {
              description: t("pages.userManagement.feedback.passwordResetSuccessDescription", { name: resolveUserDisplayName(resetPasswordUser) }),
            });
            setResetPasswordUser(null);
          }}
        />
      ) : null}
    </PageSection>
  );
}

function UserActionsMenu({
  onAssignReviewLevel,
  onAssignRole,
  onEdit,
  onResetPassword,
  user,
}: {
  onAssignReviewLevel: (user: AuthUser) => void;
  onAssignRole: (user: AuthUser) => void;
  onEdit: (user: AuthUser) => void;
  onResetPassword: (user: AuthUser) => void;
  user: AuthUser;
}) {
  const { t } = useTranslation("common");
  return (
    <div className="flex justify-end">
        <DropdownMenuTrigger>
        <Button
          variant="ghost"
          size="icon-sm"
          type="button"
          aria-label={t("pages.userManagement.actions.actionsFor", { name: resolveUserDisplayName(user) })}
        >
          <Ellipsis aria-hidden="true" />
        </Button>
        <DropdownMenu className="min-w-52" placement="bottom end" aria-label={t("pages.userManagement.actions.actionsFor", { name: user.username })}>
          <DropdownMenuLabel>{t("pages.userManagement.actions.manageUser")}</DropdownMenuLabel>
          <DropdownMenuItem id="edit" onAction={() => onEdit(user)}>
            <Pencil aria-hidden="true" />
            {t("pages.userManagement.actions.editUser")}
          </DropdownMenuItem>
          <DropdownMenuItem id="reset-password" onAction={() => onResetPassword(user)}>
            <KeyRound aria-hidden="true" />
            {t("pages.userManagement.actions.resetPassword")}
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuLabel>{t("pages.userManagement.actions.accessAssignments")}</DropdownMenuLabel>
          <DropdownMenuItem id="assign-role" onAction={() => onAssignRole(user)}>
            <ShieldCheck aria-hidden="true" />
            {t("pages.userManagement.actions.assignRole")}
          </DropdownMenuItem>
          <DropdownMenuItem id="assign-review-level" onAction={() => onAssignReviewLevel(user)}>
            <ShieldCheck aria-hidden="true" />
            {t("pages.userManagement.actions.assignReviewLevel")}
          </DropdownMenuItem>
          </DropdownMenu>
        </DropdownMenuTrigger>
      </div>
  );
}

function UserRoleBadges({ user }: { user: AuthUser }) {
  const { t } = useTranslation("common");
  const assignedRoles = getUserRoles(user);
  if (!assignedRoles.length) {
    return <span className="text-muted-foreground">{t("pages.userManagement.roles.none")}</span>;
  }

  const visibleRoles = assignedRoles.slice(0, 2);
  const remainingRoles = assignedRoles.slice(2);
  const remainingCount = assignedRoles.length - visibleRoles.length;
  const allRoleLabels = assignedRoles
    .map((role) => role.role_name || role.role_code)
    .filter(Boolean)
    .join(", ");

  return (
    <span className="flex min-w-0 flex-wrap gap-1 whitespace-normal sm:min-w-44" title={allRoleLabels}>
      {visibleRoles.map((role, index) => (
        <Badge className="max-w-full whitespace-normal! text-center" variant="secondary" key={`${role.role_code}-${role.unit_code ?? "GLOBAL"}-${index}`}>
          {role.role_name || role.role_code || t("pages.userManagement.roles.assigned")}
        </Badge>
      ))}
      {remainingCount > 0 ? (
        <PopoverTrigger>
          <Button
            className="h-5 rounded-full border px-2 py-0.5 text-[0.625rem] font-medium hover:bg-muted"
            size="sm"
            type="button"
            variant="ghost"
            aria-label={t("pages.userManagement.roles.viewMore", { count: remainingCount })}
          >
            {t("pages.userManagement.roles.more", { count: remainingCount })}
          </Button>
          <Popover className="w-64" placement="bottom start">
            <PopoverHeader>
              <PopoverTitle>{t("pages.userManagement.roles.additional")}</PopoverTitle>
            </PopoverHeader>
            <div className="flex max-h-48 flex-wrap gap-1.5 overflow-y-auto overscroll-contain">
              {remainingRoles.map((role, index) => (
                <Badge className="max-w-full whitespace-normal! text-center" variant="secondary" key={`${role.role_code}-${role.unit_code ?? "GLOBAL"}-remaining-${index}`}>
                  {role.role_name || role.role_code || t("pages.userManagement.roles.assigned")}
                </Badge>
              ))}
            </div>
          </Popover>
        </PopoverTrigger>
      ) : null}
    </span>
  );
}

function getUserRoles(user: AuthUser): AuthUserRoleAssignment[] {
  return user.role_assignments ?? user.roles ?? [];
}

function resolveUserDisplayName(user: AuthUser): string {
  return user.display_name?.trim() || user.username;
}
