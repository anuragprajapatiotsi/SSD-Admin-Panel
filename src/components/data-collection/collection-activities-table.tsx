import type { CollectionActivity, CollectionActivityFilters, CollectionActivitySource } from "@/api/template-workflow.api";
import { StatusBadge, StatusDot } from "@/components/common/status-badge";
import { normalizeStatusVariant } from "@/components/common/status-variants";
import { DataTable } from "@/components/data-table/data-table";
import { createDataTableColumnHelper, useDataTable } from "@/components/data-table/data-table-core";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip";
import { IconMinus, IconPlus } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CustomTabs } from "@/components/common/custom-tabs";
import { useCollectionActivities } from "@/hooks/use-template-workflow";
import { useCreateAtom, useSelector } from "@tanstack/react-store";
import type { PaginationState } from "@tanstack/react-table";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";

const SOURCE_TABS: CollectionActivitySource[] = [
  "ALL",
  "TEMPLATE",
  "EXCEL",
  "CSV",
  "PDF",
  "WEB_SCRAPE",
  "API",
  "HISTORICAL_PACKAGE",
];
const STATUS_TABS = ["ALL", "IN_QUEUE", "PROCESSING", "IN_REVIEW", "COMPLETED", "FAILED", "APPROVED"] as const;
type ActivityStatusFilter = typeof STATUS_TABS[number];
const EMPTY_ACTIVITIES: CollectionActivity[] = [];
type ActivityTableRow = CollectionActivity & { isHistory?: boolean; isLastHistory?: boolean; children?: ActivityTableRow[] };
const activityColumnHelper = createDataTableColumnHelper<ActivityTableRow>();

type CollectionActivitiesTableProps = {
  collectionCode: string;
  unitCode: string;
  locale: string;
  onActivityClick: (activity: CollectionActivity) => void;
  onAddSubmission: (activity: CollectionActivity) => void;
};

function displayDate(value: string, locale: string, fallback: string) {
  if (!value) return fallback;
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat(locale, { dateStyle: "medium", timeStyle: "short" }).format(date);
}

function displayFileSize(bytes: number | null, locale: string) {
  if (bytes === null) return "";
  if (bytes < 1024) return `${bytes.toLocaleString(locale)} B`;
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024).toLocaleString(locale)} KB`;
  return `${(bytes / 1024 / 1024).toLocaleString(locale, { maximumFractionDigits: 2 })} MB`;
}

export function CollectionActivitiesTable({
  collectionCode,
  unitCode,
  locale,
  onActivityClick,
  onAddSubmission,
}: CollectionActivitiesTableProps) {
  const { t } = useTranslation("ingestion");
  const [sourceType, setSourceType] = useState<CollectionActivitySource>("ALL");
  const [status, setStatus] = useState<ActivityStatusFilter>("ALL");
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(true);
  const paginationAtom = useCreateAtom<PaginationState>({ pageIndex: 0, pageSize: 50 });
  const pagination = useSelector(paginationAtom, (value) => value);
  const filters = useMemo<CollectionActivityFilters>(() => ({
    collectionCode,
    unitCode,
    originType: "ALL",
    sourceType,
    status: status === "ALL" ? undefined : status,
    limit: pagination.pageSize,
    offset: pagination.pageIndex * pagination.pageSize,
    locale,
  }), [collectionCode, locale, pagination.pageIndex, pagination.pageSize, sourceType, status, unitCode]);
  const activitiesQuery = useCollectionActivities(filters, true, autoRefreshEnabled ? 5_000 : false);
  const activities = activitiesQuery.data?.data ?? EMPTY_ACTIVITIES;
  const rows = useMemo<ActivityTableRow[]>(() => activities.map((activity) => ({
    ...activity,
    children: ["DIRECT", "REQUEST"].includes(activity.originType) ? (activity.submissionHistory ?? [])
      .filter((submission) => submission.submissionVersion !== activity.submissionVersion)
      .map((submission, index, history) => ({
        ...activity,
        ...submission,
        isHistory: true,
        isLastHistory: index === history.length - 1,
        submissionHistory: undefined,
      })) : undefined,
  })), [activities]);
  const totalCount = activitiesQuery.data?.totalCount ?? 0;
  const columns = useMemo(() => activityColumnHelper.columns([
    activityColumnHelper.display({
      id: "history",
      header: "",
      cell: ({ row }) => row.original.isHistory ? <div className="pointer-events-none absolute inset-0 flex items-center justify-center" aria-hidden="true">
        <span className={cn("absolute top-0 left-1/2 w-px bg-primary/25", row.original.isLastHistory ? "bottom-1/2" : "bottom-0")} />
        <span className="relative size-2 rounded-full bg-primary ring-4 ring-card" />
      </div> : row.getCanExpand() ? <div className="flex justify-center" onClick={(event) => event.stopPropagation()}>
        {row.getIsExpanded() ? <span className="pointer-events-none absolute top-1/2 bottom-0 left-1/2 w-px bg-primary/25" aria-hidden="true" /> : null}
        <TooltipTrigger>
          <Button className="relative" type="button" variant="outline" size="icon-sm" aria-expanded={row.getIsExpanded()}
            aria-label={t(row.getIsExpanded() ? "directIngestion.collapseHistory" : "directIngestion.expandHistory", { name: row.original.activityLabel })}
            onPress={() => row.toggleExpanded()}>
            {row.getIsExpanded() ? <IconMinus aria-hidden="true" /> : <IconPlus aria-hidden="true" />}
          </Button>
          <Tooltip>{t(row.getIsExpanded() ? "directIngestion.collapseHistory" : "directIngestion.expandHistory", { name: row.original.activityLabel })}</Tooltip>
        </TooltipTrigger>
      </div> : null,
    }),
    activityColumnHelper.accessor("activityLabel", {
      header: t("dataCollection.detail.table.columns.activity"),
      enableSorting: false,
      cell: ({ row, getValue }) => <div className="flex min-w-0 items-center gap-2">
        <span className="max-w-xs font-medium whitespace-normal [overflow-wrap:anywhere]">{row.original.isHistory
          ? t("directIngestion.versionNumber", { version: row.original.submissionVersion })
          : getValue()}</span>
        {!row.original.isHistory && row.original.submissionVersion ? <Badge variant="secondary">
          {t("directIngestion.versionNumber", { version: row.original.submissionVersion })}
        </Badge> : null}
      </div>,
    }),
    activityColumnHelper.accessor("fileName", {
      header: t("dataCollection.detail.table.columns.file"),
      enableSorting: false,
      cell: ({ row, getValue }) => (
        <div className="flex min-w-0 flex-col">
          <span className="max-w-xs font-medium whitespace-normal [overflow-wrap:anywhere]">{getValue() || t("dataCollection.detail.notAvailable")}</span>
          {row.original.fileSize !== null ? <span>{displayFileSize(row.original.fileSize, locale)}</span> : null}
        </div>
      ),
    }),
    activityColumnHelper.accessor("originType", {
      header: t("dataCollection.detail.table.columns.origin"),
      enableSorting: false,
      cell: ({ getValue }) => t(`dataCollection.detail.origins.${getValue()}`, { defaultValue: getValue() }),
    }),
    activityColumnHelper.accessor("sourceType", {
      header: t("dataCollection.detail.table.columns.source"),
      enableSorting: false,
      cell: ({ getValue }) => t(`dataCollection.detail.sources.${getValue()}`, { defaultValue: getValue() }),
    }),
    activityColumnHelper.accessor("status", {
      header: t("dataCollection.detail.table.columns.status"),
      enableSorting: false,
      cell: ({ getValue }) => (
        <StatusBadge variant={normalizeStatusVariant(getValue())}>
          {t(`dataCollection.detail.activityStatuses.${getValue().toUpperCase()}`, {
            defaultValue: getValue().replaceAll("_", " "),
          })}
        </StatusBadge>
      ),
    }),
    activityColumnHelper.accessor("updatedAt", {
      header: t("dataCollection.detail.table.columns.updatedAt"),
      enableSorting: false,
      cell: ({ getValue }) => displayDate(getValue(), locale, t("dataCollection.detail.notAvailable")),
    }),
    activityColumnHelper.display({
      id: "actions",
      header: t("directIngestion.actions"),
      cell: ({ row }) => row.original.isHistory ? <Badge variant="secondary">{t("directIngestion.readOnly")}</Badge> : (
        <div className="flex items-center justify-end gap-1" onClick={(event) => event.stopPropagation()}>
          {row.original.originType === "DIRECT" && ["EXCEL", "CSV", "PDF", "API", "WEB_SCRAPE"].includes(row.original.sourceType) ? <TooltipTrigger>
            <Button type="button" size="sm" aria-label={t("directIngestion.newSubmission")} onPress={() => onAddSubmission(row.original)}>
              <IconPlus data-icon="inline-start" aria-hidden="true" />{t("directIngestion.add")}
            </Button>
            <Tooltip>{t("directIngestion.newSubmission")}</Tooltip>
          </TooltipTrigger> : null}
        </div>
      ),
    }),
  ]), [locale, onAddSubmission, t]);
  const table = useDataTable({
    columns,
    data: rows,
    atoms: { pagination: paginationAtom },
    manualPagination: true,
    rowCount: totalCount,
    getRowId: (row) => `${row.originType}:${row.activityCode}:${row.isHistory ? row.submissionVersion : "latest"}`,
    getSubRows: (row) => row.children,
    enableExpanding: true,
    paginateExpandedRows: false,
    maxLeafRowFilterDepth: 0,
    enableMultiSort: false,
    enableRowSelection: false,
    autoResetPageIndex: false,
  });
  const error = activitiesQuery.error instanceof Error
    ? activitiesQuery.error.message
    : activitiesQuery.error ? t("dataCollection.detail.table.error") : undefined;

  function selectSource(value: string) {
    if (!SOURCE_TABS.includes(value as CollectionActivitySource)) return;
    setSourceType(value as CollectionActivitySource);
    paginationAtom.set((current) => ({ ...current, pageIndex: 0 }));
  }

  function selectStatus(value: string) {
    if (!STATUS_TABS.includes(value as ActivityStatusFilter)) return;
    setStatus(value as ActivityStatusFilter);
    paginationAtom.set((current) => ({ ...current, pageIndex: 0 }));
  }

  const results = (
    <DataTable
      className="min-w-0 max-w-full"
      table={table}
      animateExpansion
      ariaLabel={t("dataCollection.detail.table.ariaLabel")}
      searchPlaceholder={t("dataCollection.detail.table.search")}
      isLoading={activitiesQuery.isPending}
      autoRefresh={{
        enabled: autoRefreshEnabled,
        onEnabledChange: setAutoRefreshEnabled,
        isRefreshing: activitiesQuery.isFetching,
        hasError: Boolean(activitiesQuery.data && error),
      }}
      loadingMessage={t("dataCollection.detail.table.loading")}
      error={activitiesQuery.data ? undefined : error}
      emptyMessage={t("dataCollection.detail.table.empty")}
      noResultsMessage={t("dataCollection.detail.table.noResults")}
      toolbarActions={(
        <Select
          className="flex items-center gap-2"
          aria-label={t("dataCollection.detail.sourceFilter.label")}
          selectedKey={sourceType}
          onSelectionChange={(key) => selectSource(String(key))}
        >
          <Label>{t("dataCollection.detail.sourceFilter.name")}</Label>
          <SelectTrigger className="min-w-44">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              {SOURCE_TABS.map((source) => (
                <SelectItem id={source} key={source}>
                  {t(`dataCollection.detail.sources.${source}`)}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      )}
      onRetry={() => void activitiesQuery.refetch()}
      showPagination={totalCount > 0}
      pageSizeOptions={[10, 25, 50, 100, 200]}
      totalCount={totalCount}
      onRowClick={onActivityClick}
      tableClassName="[&_tr>:first-child]:relative [&_tr>:first-child]:w-10"
      getRowClassName={(row) => row.isHistory ? "bg-muted/20" : undefined}
    />
  );

  return (
    <CustomTabs
      className="w-full max-w-full overflow-hidden"
      value={status}
      onValueChange={selectStatus}
      variant="underline"
      compact
      ariaLabel={t("dataCollection.detail.statusTabs.label")}
      items={STATUS_TABS.map((statusValue) => ({
        value: statusValue,
        label: statusValue === "ALL"
          ? t("dataCollection.detail.statusTabs.all")
          : t(`dataCollection.detail.activityStatuses.${statusValue}`),
        icon: <StatusDot variant={normalizeStatusVariant(statusValue)} aria-hidden="true" />,
        content: results,
      }))}
    />
  );
}
