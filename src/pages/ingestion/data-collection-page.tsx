import { PageSection, PageHeader } from "@/components/common/page-layout";

import type {
  RequestPeriodCollectionFilters,
  RequestPeriodCollectionStatus,
  RequestPeriodCollectionSummary,
} from "@/api/template-workflow.api";
import {
  getSelectedLocale,
  getSelectedUnitCode,
  LOCALE_CHANGED_EVENT,
  UNIT_CHANGED_EVENT,
} from "@/api/session.api";
import {
  StatusBadge,
  StatusDot,
} from "@/components/common/status-badge";
import { normalizeStatusVariant } from "@/components/common/status-variants";
import { CreateCollectionDialog } from "@/components/data-collection/create-collection-dialog";
import { CollectionRowActions } from "@/components/data-collection/collection-row-actions";
import { DataTable } from "@/components/data-table/data-table";
import {
  createDataTableColumnHelper,
  useDataTable,
} from "@/components/data-table/data-table-core";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Spinner } from "@/components/ui/spinner";
import { CustomTabs } from "@/components/common/custom-tabs";
import { useRequestPeriodCollections } from "@/hooks/use-template-workflow";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { IconRefresh } from "@tabler/icons-react";
import { useCreateAtom, useSelector } from "@tanstack/react-store";
import type { PaginationState } from "@tanstack/react-table";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";

const DEFAULT_PAGE_SIZE = 10;
const EMPTY_COLLECTIONS: RequestPeriodCollectionSummary[] = [];
const collectionColumnHelper = createDataTableColumnHelper<RequestPeriodCollectionSummary>();

type StatusFilter = "ALL" | RequestPeriodCollectionStatus;

const STATUS_TABS: Array<{ value: StatusFilter; labelKey: string }> = [
  { value: "ALL", labelKey: "all" },
  { value: "NOT_STARTED", labelKey: "notStarted" },
  { value: "IN_PROGRESS", labelKey: "inProgress" },
  { value: "UNDER_REVIEW", labelKey: "underReview" },
  { value: "READY_TO_PUBLISH", labelKey: "readyToPublish" },
  { value: "PARTIALLY_PUBLISHED", labelKey: "partiallyPublished" },
  { value: "COMPLETED_WITH_ERRORS", labelKey: "completedWithErrors" },
  { value: "PUBLISHED", labelKey: "published" },
];

const STATUS_LABEL_KEYS: Record<RequestPeriodCollectionStatus, string> = {
  PUBLISHED: "published",
  PARTIALLY_PUBLISHED: "partiallyPublished",
  COMPLETED_WITH_ERRORS: "completedWithErrors",
  READY_TO_PUBLISH: "readyToPublish",
  UNDER_REVIEW: "underReview",
  IN_PROGRESS: "inProgress",
  NOT_STARTED: "notStarted",
};

function collectionProgress(collection: RequestPeriodCollectionSummary) {
  const assignmentCount = Math.max(0, collection.assignmentCount);
  return assignmentCount > 0
    ? Math.min(100, Math.round((collection.submittedCount / assignmentCount) * 100))
    : 0;
}

function getCollectionRowId(collection: RequestPeriodCollectionSummary) {
  return `${collection.unitCode}:${collection.collectionCode}`;
}

export function DataCollectionPage() {
  const { t } = useTranslation(["ingestion", "common"]);
  const navigate = useNavigate();
  const [selectedUnitCode, setSelectedUnitCode] = useState(getSelectedUnitCode);
  const [selectedLocale, setSelectedLocale] = useState(getSelectedLocale);
  const [searchText, setSearchText] = useState("");
  const debouncedSearchText = useDebouncedValue(searchText, 300).trim();
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const paginationAtom = useCreateAtom<PaginationState>({
    pageIndex: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  });
  const pagination = useSelector(paginationAtom, (value) => value);

  const resetPage = useCallback(() => {
    paginationAtom.set((current) => ({ ...current, pageIndex: 0 }));
  }, [paginationAtom]);

  useEffect(() => {
    const handleUnitChange = () => {
      setSelectedUnitCode(getSelectedUnitCode());
      resetPage();
    };
    const handleLocaleChange = () => setSelectedLocale(getSelectedLocale());
    window.addEventListener(UNIT_CHANGED_EVENT, handleUnitChange);
    window.addEventListener(LOCALE_CHANGED_EVENT, handleLocaleChange);
    return () => {
      window.removeEventListener(UNIT_CHANGED_EVENT, handleUnitChange);
      window.removeEventListener(LOCALE_CHANGED_EVENT, handleLocaleChange);
    };
  }, [resetPage]);

  useEffect(() => {
    resetPage();
  }, [debouncedSearchText, resetPage]);

  const filters = useMemo<RequestPeriodCollectionFilters>(() => ({
    unitCode: selectedUnitCode,
    searchText: debouncedSearchText || undefined,
    status: statusFilter === "ALL" ? undefined : statusFilter,
    includeInactive: false,
    limit: pagination.pageSize,
    offset: pagination.pageIndex * pagination.pageSize,
    locale: selectedLocale,
  }), [
    debouncedSearchText,
    pagination.pageIndex,
    pagination.pageSize,
    selectedLocale,
    selectedUnitCode,
    statusFilter,
  ]);

  const collectionsQuery = useRequestPeriodCollections(filters);
  const collections = collectionsQuery.data?.data ?? EMPTY_COLLECTIONS;
  const totalCount = collectionsQuery.data?.total_count ?? 0;
  const isTableLoading = collectionsQuery.isFetching;
  const hasActiveFilter = Boolean(debouncedSearchText) || statusFilter !== "ALL";
  const loadError = collectionsQuery.error instanceof Error
    ? collectionsQuery.error.message
    : collectionsQuery.error ? t("ingestion:dataCollection.error.description") : undefined;

  const columns = useMemo(() => collectionColumnHelper.columns([
    collectionColumnHelper.accessor("collectionLabel", {
      header: t("ingestion:dataCollection.columns.collection"),
      enableSorting: false,
      cell: ({ getValue }) => {
        return (
          <div className="min-w-44 whitespace-normal">
            <span className="font-medium">{getValue()}</span>
          </div>
        );
      },
    }),
    collectionColumnHelper.accessor("status", {
      header: t("ingestion:dataCollection.columns.status"),
      enableSorting: false,
      cell: ({ getValue }) => {
        const status = getValue();
        return (
          <StatusBadge variant={normalizeStatusVariant(status)}>
            {t(`ingestion:dataCollection.status.${STATUS_LABEL_KEYS[status]}`)}
          </StatusBadge>
        );
      },
    }),
    collectionColumnHelper.accessor("yearPeriod", {
      header: t("ingestion:dataCollection.columns.yearPeriod"),
      enableSorting: false,
      cell: ({ getValue }) => <span className="font-medium tabular-nums">{getValue()}</span>,
    }),
    collectionColumnHelper.display({
      id: "submission-progress",
      header: t("ingestion:dataCollection.progress.label"),
      enableSorting: false,
      cell: ({ row }) => {
        const collection = row.original;
        return (
          <Progress
            className="min-w-32 flex-nowrap items-center gap-2 [&_[data-slot=progress-track]]:order-first [&_[data-slot=progress-track]]:w-16 [&_[data-slot=progress-track]]:shrink-0"
            value={collectionProgress(collection)}
            aria-label={t("ingestion:dataCollection.progress.label")}
          >
            <span className="font-medium whitespace-nowrap tabular-nums">
              {t("ingestion:dataCollection.progress.value", {
                submitted: collection.submittedCount,
                total: collection.assignmentCount,
              })}
            </span>
          </Progress>
        );
      },
    }),
    collectionColumnHelper.accessor("templateCount", {
      header: t("ingestion:dataCollection.metrics.templates"),
      enableSorting: false,
      cell: ({ getValue }) => <span className="font-medium tabular-nums">{getValue()}</span>,
    }),
    collectionColumnHelper.accessor("sentCount", {
      header: t("ingestion:dataCollection.metrics.sent"),
      enableSorting: false,
      cell: ({ getValue }) => <span className="font-medium tabular-nums">{getValue()}</span>,
    }),
    collectionColumnHelper.accessor("approvedCount", {
      header: t("ingestion:dataCollection.metrics.approved"),
      enableSorting: false,
      cell: ({ getValue }) => <span className="font-medium tabular-nums">{getValue()}</span>,
    }),
    collectionColumnHelper.accessor("publishedCount", {
      header: t("ingestion:dataCollection.metrics.published"),
      enableSorting: false,
      cell: ({ getValue }) => <span className="font-medium tabular-nums">{getValue()}</span>,
    }),
    collectionColumnHelper.display({
      id: "actions",
      header: () => <span className="block text-right">{t("ingestion:dataCollection.columns.actions")}</span>,
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex justify-end">
          <CollectionRowActions collection={row.original} unitCode={selectedUnitCode} />
        </div>
      ),
    }),
  ]), [selectedUnitCode, t]);

  const collectionTable = useDataTable({
    columns,
    data: collections,
    atoms: { pagination: paginationAtom },
    manualPagination: true,
    rowCount: totalCount,
    getRowId: getCollectionRowId,
    enableMultiSort: false,
    enableRowSelection: false,
    autoResetPageIndex: false,
  });

  function selectStatus(value: string) {
    const tab = STATUS_TABS.find((item) => item.value === value);
    if (!tab) return;
    setStatusFilter(tab.value);
    resetPage();
  }

  const results = (
    <DataTable
      table={collectionTable}
      ariaLabel={t("ingestion:dataCollection.table.ariaLabel")}
      searchPlaceholder={t("ingestion:dataCollection.search.placeholder")}
      searchValue={searchText}
      onSearchChange={setSearchText}
      isLoading={isTableLoading}
      loadingMessage={t("ingestion:dataCollection.loading")}
      error={loadError}
      emptyMessage={hasActiveFilter
        ? t("ingestion:dataCollection.empty.filteredDescription")
        : t("ingestion:dataCollection.empty.description")}
      onRetry={() => void collectionsQuery.refetch()}
      showPagination={totalCount > 0}
      totalCount={totalCount}
      onRowClick={(collection) => navigate(`/ingestion/data-collection/${encodeURIComponent(collection.collectionCode)}`)}
    />
  );

  return (
    <PageSection className="flex min-w-0 flex-col gap-4 data-collection-page" aria-labelledby="data-collection-title">
      <PageHeader>
        <div>
          <h2 id="data-collection-title">{t("ingestion:dataCollection.title")}</h2>
          <p className="text-foreground">{t("ingestion:dataCollection.description")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            isDisabled={collectionsQuery.isFetching}
            onPress={() => void collectionsQuery.refetch()}
          >
            {collectionsQuery.isFetching ? (
              <Spinner data-icon="inline-start" aria-label={t("ingestion:dataCollection.refreshing")} />
            ) : (
              <IconRefresh data-icon="inline-start" aria-hidden="true" />
            )}
            {collectionsQuery.isFetching
              ? t("ingestion:dataCollection.refreshing")
              : t("ingestion:dataCollection.refresh")}
          </Button>
          <CreateCollectionDialog unitCode={selectedUnitCode} locale={selectedLocale} />
        </div>
      </PageHeader>

      <CustomTabs
        variant="underline"
        value={statusFilter}
        onValueChange={(key) => selectStatus(String(key))}
        compact
        ariaLabel={t("ingestion:dataCollection.tabs.label")}
        contentClassName="mt-2"
        items={STATUS_TABS.map((tab) => (
            ({ value: tab.value, label: t(`ingestion:dataCollection.tabs.${tab.labelKey}`), icon: (<StatusDot
                data-icon="inline-start"
                variant={normalizeStatusVariant(tab.value)}
                aria-hidden="true"
              />), content: (<>{statusFilter === tab.value ? results : null}</>) })
          ))}
      />
    </PageSection>
  );
}
