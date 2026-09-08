import { StatusBadge } from "@/components/common/status-badge";
import { normalizeStatusVariant } from "@/components/common/status-variants";

import { PageSection, PageHeader } from "@/components/common/page-layout";

import { CustomTabs, type TabItem } from "@/components/common/custom-tabs";
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
import { useCreateAtom, useSelector } from "@tanstack/react-store";
import type { PaginationState } from "@tanstack/react-table";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  listAuthSessions,
  type AuthSessionAuditRow,
} from "../../api/auth-admin.api";
import { useAuthAnonymousSessions } from "../../hooks/use-auth-anonymous-sessions";
import { useAuthLoginAudit } from "../../hooks/use-auth-login-audit";

type AuditTab = "sessions" | "login" | "anonymous";

const authSessionColumnHelper = createDataTableColumnHelper<AuthSessionAuditRow>();
const loginAuditColumnHelper = createDataTableColumnHelper<AuthSessionAuditRow>();
const anonymousSessionColumnHelper = createDataTableColumnHelper<AuthSessionAuditRow>();
const EMPTY_AUDIT_ROWS: AuthSessionAuditRow[] = [];

const authSessionGlobalFilter: DataTableFilterFn<AuthSessionAuditRow> = (
  row,
  _columnId,
  filterValue,
) => {
  const query = String(filterValue ?? "").trim().toLowerCase();
  if (!query) return true;
  const session = row.original;
  return [
    resolveSessionUser(session),
    isSessionActive(session.is_active) ? "Active" : "Inactive",
    session.started_at,
    session.last_seen_at,
    session.ended_at,
    meaningfulAuditText(session.end_reason),
  ].filter(Boolean).join(" ").toLowerCase().includes(query);
};

const loginAuditGlobalFilter: DataTableFilterFn<AuthSessionAuditRow> = (
  row,
  _columnId,
  filterValue,
) => {
  const query = String(filterValue ?? "").trim().toLowerCase();
  if (!query) return true;
  const audit = row.original;
  return [
    isLoginSuccessful(audit.success) ? "Success" : "Failed",
    meaningfulAuditText(audit.username_attempted),
    audit.login_at,
    meaningfulAuditText(audit.failure_reason),
    formatDeviceLocationInfo(audit),
  ].filter(Boolean).join(" ").toLowerCase().includes(query);
};

const anonymousSessionGlobalFilter: DataTableFilterFn<AuthSessionAuditRow> = (
  row,
  _columnId,
  filterValue,
) => {
  const query = String(filterValue ?? "").trim().toLowerCase();
  if (!query) return true;
  const session = row.original;
  return [
    meaningfulAuditText(session.anonymous_session_key),
    isSessionActive(session.is_active) ? "Active" : "Inactive",
    session.first_seen_at,
    session.last_seen_at,
    meaningfulAuditText(session.converted_user),
    meaningfulAuditText(session.browser_name),
  ].filter(Boolean).join(" ").toLowerCase().includes(query);
};

export function AuditSessionsPage() {
  const { t } = useTranslation("common");
  const [activeTab, setActiveTab] = useState<AuditTab>("sessions");
  const [rows, setRows] = useState<AuthSessionAuditRow[]>([]);
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  async function loadRows(): Promise<void> {
    setIsLoading(true);
    setError("");
    try {
      const data = await listAuthSessions(true);
      setRows(data);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : t("pages.accessLogs.errors.load"));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    if (activeTab === "sessions") {
      // The API request owns the related loading and error state transitions.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      void loadRows();
    }
    // Loading follows the selected audit view; retries invoke loadRows directly.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeTab]);

  const tabs: TabItem[] = [
    {
      value: "sessions",
      label: t("pages.accessLogs.tabs.sessions"),
      content: (
        <div className="min-w-0">
          <AuthSessionsDataTable
            error={error}
            isLoading={isLoading}
            onRetry={() => void loadRows()}
            rows={rows}
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />
        </div>
      ),
    },
    {
      value: "login",
      label: t("pages.accessLogs.tabs.login"),
      content: (
        <div className="min-w-0">
          <LoginAuditDataTable
            statusFilter={statusFilter}
            onStatusFilterChange={setStatusFilter}
          />
        </div>
      ),
    },
    {
      value: "anonymous",
      label: t("pages.accessLogs.tabs.anonymous"),
      content: (
        <div className="min-w-0">
          <AnonymousSessionsDataTable />
        </div>
      ),
    },
  ];

  return (
    <PageSection className="flex min-w-0 flex-col gap-4">
      <PageHeader>
        <div>
          <h2>{t("pages.accessLogs.title")}</h2>
          <p>{t("pages.accessLogs.description")}</p>
        </div>
      </PageHeader>

      <CustomTabs
        ariaLabel={t("pages.accessLogs.tabs.label")}
        compact
        items={tabs}
        orientation="horizontal"
        value={activeTab}
        variant="underline"
        onValueChange={(tab) => setActiveTab(tab as AuditTab)}
      />
    </PageSection>
  );
}

function AuthSessionsDataTable({
  error,
  isLoading,
  onRetry,
  onStatusFilterChange,
  rows,
  statusFilter,
}: {
  error: string;
  isLoading: boolean;
  onRetry: () => void;
  onStatusFilterChange: (status: string) => void;
  rows: AuthSessionAuditRow[];
  statusFilter: string;
}) {
  const { t } = useTranslation("common");
  const sessionRows = useMemo(() => rows.filter((row) => (
    statusFilter === "ALL" || isSessionActive(row.is_active) === (statusFilter === "ACTIVE")
  )), [rows, statusFilter]);
  const columns = useMemo(() => authSessionColumnHelper.columns([
    authSessionColumnHelper.accessor((row) => resolveSessionUser(row), {
      id: "user",
      header: t("pages.accessLogs.columns.user"),
      sortFn: "alphanumeric",
      cell: ({ getValue }) => <span className="block min-w-36 whitespace-normal font-medium">{getValue()}</span>,
    }),
    authSessionColumnHelper.accessor((row) => isSessionActive(row.is_active), {
      id: "status",
      header: t("pages.accessLogs.columns.status"),
      cell: ({ getValue }) => (
        <StatusBadge variant={normalizeStatusVariant(`${getValue() ? "active" : "inactive"}`)}>
          {getValue() ? "Active" : "Inactive"}
        </StatusBadge>
      ),
    }),
    authSessionColumnHelper.accessor("started_at", {
      header: t("pages.accessLogs.columns.sessionStart"),
      sortFn: "alphanumeric",
      cell: ({ getValue }) => <span className="block min-w-36 whitespace-normal">{formatSessionDateTime(getValue())}</span>,
    }),
    authSessionColumnHelper.accessor("last_seen_at", {
      header: t("pages.accessLogs.columns.lastActive"),
      sortFn: "alphanumeric",
      cell: ({ getValue }) => <span className="block min-w-36 whitespace-normal">{formatSessionDateTime(getValue())}</span>,
    }),
    authSessionColumnHelper.accessor("ended_at", {
      header: t("pages.accessLogs.columns.sessionEnd"),
      sortFn: "alphanumeric",
      cell: ({ row }) => (
        <span className="block min-w-36 whitespace-normal text-muted-foreground">
          {isSessionActive(row.original.is_active) ? "-" : formatSessionDateTime(row.original.ended_at)}
        </span>
      ),
    }),
    authSessionColumnHelper.accessor("end_reason", {
      header: t("pages.accessLogs.columns.terminationReason"),
      sortFn: "alphanumeric",
      cell: ({ row }) => {
        const reason = isSessionActive(row.original.is_active)
          ? undefined
          : meaningfulAuditText(row.original.end_reason);
        return (
          <span className="block min-w-40 whitespace-normal text-muted-foreground">
            {reason ? readableAuditText(reason) : "-"}
          </span>
        );
      },
    }),
  ]), [t]);
  const table = useDataTable({
    columns,
    data: sessionRows,
    getRowId: (row: AuthSessionAuditRow, index: number) => String(
      row.auth_session_id ?? row.session_id ?? `${row.username ?? "session"}-${row.started_at ?? index}-${index}`,
    ),
    globalFilterFn: authSessionGlobalFilter,
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

  return (
    <div>
      <DataTable
        table={table}
        ariaLabel={t("pages.accessLogs.sessions.tableLabel")}
        searchPlaceholder={t("pages.accessLogs.sessions.search")}
        toolbarActions={(
          <Select
            aria-label={t("pages.accessLogs.columns.status")}
            selectedKey={statusFilter}
            onSelectionChange={(key) => onStatusFilterChange(String(key ?? "ALL"))}
          >
            <SelectTrigger size="sm" className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem id="ALL">{t("pages.accessLogs.status.all")}</SelectItem>
              <SelectItem id="ACTIVE">{t("pages.accessLogs.status.active")}</SelectItem>
              <SelectItem id="INACTIVE">{t("pages.accessLogs.status.inactive")}</SelectItem>
            </SelectContent>
          </Select>
        )}
        isLoading={isLoading}
        loadingMessage={t("pages.accessLogs.sessions.loading")}
        error={error || undefined}
        emptyMessage={t("pages.accessLogs.sessions.empty")}
        noResultsMessage={t("pages.accessLogs.sessions.noResults")}
        onRetry={onRetry}
      />
    </div>
  );
}

function LoginAuditDataTable({
  onStatusFilterChange,
  statusFilter,
}: {
  onStatusFilterChange: (status: string) => void;
  statusFilter: string;
}) {
  const { t } = useTranslation("common");
  const paginationAtom = useCreateAtom<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const pagination = useSelector(paginationAtom, (value) => value);
  const loginAuditQuery = useAuthLoginAudit({
    limit: pagination.pageSize,
    offset: pagination.pageIndex * pagination.pageSize,
  });
  const responseRows = loginAuditQuery.data?.data ?? EMPTY_AUDIT_ROWS;
  const loginRows = useMemo(() => responseRows.filter((row) => (
    statusFilter === "ALL" || isLoginSuccessful(row.success) === (statusFilter === "ACTIVE")
  )), [responseRows, statusFilter]);
  const hasDeviceLocationInfo = useMemo(() => responseRows.some((row) => (
    Boolean(formatDeviceLocationInfo(row))
  )), [responseRows]);
  const columns = useMemo(() => loginAuditColumnHelper.columns([
    loginAuditColumnHelper.accessor("username_attempted", {
      header: t("pages.accessLogs.columns.usernameAttempted"),
      sortFn: "alphanumeric",
      cell: ({ getValue }) => (
        <span className="block min-w-40 whitespace-normal font-medium">
          {meaningfulAuditText(getValue()) ?? "-"}
        </span>
      ),
    }),
    loginAuditColumnHelper.accessor("login_at", {
      header: t("pages.accessLogs.columns.loginTime"),
      sortFn: "alphanumeric",
      cell: ({ getValue }) => (
        <span className="block min-w-36 whitespace-normal">{formatSessionDateTime(getValue())}</span>
      ),
    }),
    loginAuditColumnHelper.accessor("failure_reason", {
      header: t("pages.accessLogs.columns.failureReason"),
      sortFn: "alphanumeric",
      cell: ({ row }) => {
        const reason = isLoginSuccessful(row.original.success)
          ? undefined
          : meaningfulAuditText(row.original.failure_reason);
        return (
          <span className="block min-w-48 whitespace-normal text-muted-foreground">
            {reason ? readableAuditText(reason) : "-"}
          </span>
        );
      },
    }),
    loginAuditColumnHelper.accessor((row) => isLoginSuccessful(row.success), {
      id: "status",
      header: t("pages.accessLogs.columns.status"),
      cell: ({ getValue }) => (
        <StatusBadge variant={normalizeStatusVariant(`${getValue() ? "active" : "inactive"}`)}>
          {getValue() ? "Success" : "Failed"}
        </StatusBadge>
      ),
    }),
    ...(hasDeviceLocationInfo ? [loginAuditColumnHelper.display({
      id: "device-location",
      header: t("pages.accessLogs.columns.deviceLocation"),
      cell: ({ row }) => (
        <span className="block min-w-56 whitespace-normal text-muted-foreground">
          {formatDeviceLocationInfo(row.original) ?? "-"}
        </span>
      ),
    })] : []),
  ]), [hasDeviceLocationInfo, t]);
  const table = useDataTable({
    columns,
    data: loginRows,
    atoms: { pagination: paginationAtom },
    manualPagination: true,
    rowCount: loginAuditQuery.data?.count ?? 0,
    getRowId: (row: AuthSessionAuditRow, index: number) => String(
      row.login_audit_id ?? row.audit_id ?? `${row.username_attempted ?? "login"}-${row.login_at ?? index}-${index}`,
    ),
    globalFilterFn: loginAuditGlobalFilter,
    enableMultiSort: false,
    enableRowSelection: false,
    autoResetPageIndex: false,
  });
  const loadError = loginAuditQuery.error instanceof Error
    ? loginAuditQuery.error.message
    : loginAuditQuery.error ? t("pages.accessLogs.login.loadError") : undefined;

  return (
    <div>
      <DataTable
        table={table}
        ariaLabel={t("pages.accessLogs.login.tableLabel")}
        searchPlaceholder={t("pages.accessLogs.login.search")}
        toolbarActions={(
          <Select
            aria-label={t("pages.accessLogs.columns.status")}
            selectedKey={statusFilter}
            onSelectionChange={(key) => onStatusFilterChange(String(key ?? "ALL"))}
          >
            <SelectTrigger size="sm" className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem id="ALL">{t("pages.accessLogs.status.all")}</SelectItem>
              <SelectItem id="ACTIVE">{t("pages.accessLogs.status.success")}</SelectItem>
              <SelectItem id="INACTIVE">{t("pages.accessLogs.status.failed")}</SelectItem>
            </SelectContent>
          </Select>
        )}
        isLoading={loginAuditQuery.isPending}
        loadingMessage={t("pages.accessLogs.login.loading")}
        error={loadError}
        emptyMessage={t("pages.accessLogs.login.empty")}
        noResultsMessage={t("pages.accessLogs.login.noResults")}
        onRetry={() => void loginAuditQuery.refetch()}
        totalCount={loginAuditQuery.data?.count}
      />
    </div>
  );
}

function AnonymousSessionsDataTable() {
  const { t } = useTranslation("common");
  const [statusFilter, setStatusFilter] = useState("ACTIVE");
  const paginationAtom = useCreateAtom<PaginationState>({
    pageIndex: 0,
    pageSize: 10,
  });
  const pagination = useSelector(paginationAtom, (value) => value);
  const anonymousSessionsQuery = useAuthAnonymousSessions({
    includeInactive: statusFilter === "ALL",
    limit: pagination.pageSize,
    offset: pagination.pageIndex * pagination.pageSize,
  });
  const anonymousRows = anonymousSessionsQuery.data?.data ?? EMPTY_AUDIT_ROWS;
  const showConvertedUser = useMemo(() => anonymousRows.some((row) => (
    Boolean(meaningfulAuditText(row.converted_user))
  )), [anonymousRows]);
  const showBrowser = useMemo(() => anonymousRows.some((row) => (
    Boolean(meaningfulAuditText(row.browser_name))
  )), [anonymousRows]);
  const columns = useMemo(() => anonymousSessionColumnHelper.columns([
    anonymousSessionColumnHelper.accessor("anonymous_session_key", {
      header: t("pages.accessLogs.columns.sessionId"),
      sortFn: "alphanumeric",
      cell: ({ getValue }) => (
        <span className="block min-w-48 whitespace-normal font-medium">
          {meaningfulAuditText(getValue()) ?? "-"}
        </span>
      ),
    }),
    anonymousSessionColumnHelper.accessor("first_seen_at", {
      header: t("pages.accessLogs.columns.sessionStart"),
      sortFn: "alphanumeric",
      cell: ({ getValue }) => (
        <span className="block min-w-36 whitespace-normal">{formatSessionDateTime(getValue())}</span>
      ),
    }),
    anonymousSessionColumnHelper.accessor("last_seen_at", {
      header: t("pages.accessLogs.columns.lastActive"),
      sortFn: "alphanumeric",
      cell: ({ getValue }) => (
        <span className="block min-w-36 whitespace-normal">{formatSessionDateTime(getValue())}</span>
      ),
    }),
    ...(showConvertedUser ? [anonymousSessionColumnHelper.accessor("converted_user", {
      header: t("pages.accessLogs.columns.convertedUser"),
      sortFn: "alphanumeric",
      cell: ({ getValue }) => (
        <span className="block min-w-36 whitespace-normal text-muted-foreground">
          {meaningfulAuditText(getValue()) ?? "-"}
        </span>
      ),
    })] : []),
    ...(showBrowser ? [anonymousSessionColumnHelper.accessor("browser_name", {
      header: t("pages.accessLogs.columns.browser"),
      sortFn: "alphanumeric",
      cell: ({ getValue }) => (
        <span className="block min-w-28 whitespace-normal text-muted-foreground">
          {meaningfulAuditText(getValue()) ?? "-"}
        </span>
      ),
    })] : []),
    anonymousSessionColumnHelper.accessor((row) => isSessionActive(row.is_active), {
      id: "status",
      header: t("pages.accessLogs.columns.status"),
      cell: ({ getValue }) => (
        <StatusBadge variant={normalizeStatusVariant(`${getValue() ? "active" : "inactive"}`)}>
          {getValue() ? "Active" : "Inactive"}
        </StatusBadge>
      ),
    }),
  ]), [showBrowser, showConvertedUser, t]);
  const table = useDataTable({
    columns,
    data: anonymousRows,
    atoms: { pagination: paginationAtom },
    manualPagination: true,
    rowCount: anonymousSessionsQuery.data?.count ?? 0,
    getRowId: (row: AuthSessionAuditRow, index: number) => String(
      row.anonymous_session_key ?? row.anonymous_session_id ?? `anonymous-${index}`,
    ),
    globalFilterFn: anonymousSessionGlobalFilter,
    enableMultiSort: false,
    enableRowSelection: false,
    autoResetPageIndex: false,
  });
  const loadError = anonymousSessionsQuery.error instanceof Error
    ? anonymousSessionsQuery.error.message
    : anonymousSessionsQuery.error ? t("pages.accessLogs.anonymous.loadError") : undefined;

  return (
    <div>
      <DataTable
        table={table}
        ariaLabel={t("pages.accessLogs.anonymous.tableLabel")}
        searchPlaceholder={t("pages.accessLogs.anonymous.search")}
        toolbarActions={(
          <Select
            aria-label={t("pages.accessLogs.columns.status")}
            selectedKey={statusFilter}
            onSelectionChange={(key) => {
              setStatusFilter(String(key ?? "ACTIVE"));
              table.firstPage();
            }}
          >
            <SelectTrigger size="sm" className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem id="ACTIVE">{t("pages.accessLogs.status.activeOnly")}</SelectItem>
              <SelectItem id="ALL">{t("pages.accessLogs.status.all")}</SelectItem>
            </SelectContent>
          </Select>
        )}
        isLoading={anonymousSessionsQuery.isPending}
        loadingMessage={t("pages.accessLogs.anonymous.loading")}
        error={loadError}
        emptyMessage={t("pages.accessLogs.anonymous.empty")}
        noResultsMessage={t("pages.accessLogs.anonymous.noResults")}
        onRetry={() => void anonymousSessionsQuery.refetch()}
        totalCount={anonymousSessionsQuery.data?.count}
      />
    </div>
  );
}

function resolveSessionUser(row: AuthSessionAuditRow): string {
  return meaningfulAuditText(row.display_name) ?? meaningfulAuditText(row.username) ?? "-";
}

function meaningfulAuditText(value: unknown): string | undefined {
  const text = String(value ?? "").trim();
  if (!text || ["string", "null", "undefined", "n/a", "-"].includes(text.toLowerCase())) {
    return undefined;
  }
  return text;
}

function readableAuditText(value: string): string {
  const normalized = value.trim().replace(/_/g, " ");
  if (normalized !== normalized.toUpperCase()) return normalized;
  const lowerCaseValue = normalized.toLowerCase();
  return lowerCaseValue.charAt(0).toUpperCase() + lowerCaseValue.slice(1);
}

function formatDeviceLocationInfo(row: AuthSessionAuditRow): string | undefined {
  const values = [
    meaningfulAuditText(row.ip_address),
    meaningfulAuditText(row.browser_name),
    meaningfulAuditText(row.os_name),
    meaningfulAuditText(row.device_type),
  ].filter((value): value is string => Boolean(value));
  const uniqueValues = Array.from(new Set(values));
  return uniqueValues.length ? uniqueValues.join(" \u00b7 ") : undefined;
}

function isLoginSuccessful(value: unknown): boolean {
  return value === true || value === 1 || String(value).toLowerCase() === "true";
}

function isSessionActive(value: unknown): boolean {
  return value === true || value === 1 || String(value).toLowerCase() === "true";
}

function formatSessionDateTime(value: unknown): string {
  if (value === undefined || value === null || value === "") return "-";
  const date = value instanceof Date ? value : new Date(String(value));
  if (Number.isNaN(date.getTime())) return "-";
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Asia/Kolkata",
  }).format(date);
}
