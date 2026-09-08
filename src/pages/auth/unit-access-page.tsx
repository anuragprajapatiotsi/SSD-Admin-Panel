import { PageSection, PageHeader } from "@/components/common/page-layout";

import { Badge } from "@/components/ui/badge";
import { SearchInput } from "@/components/common/search-input";
import { StatusDot } from "@/components/common/status-badge";
import { normalizeStatusVariant } from "@/components/common/status-variants";
import {
  createDataTableColumnHelper,
  DataTable,
  useDataTable,
} from "@/components/data-table";
import { CustomTabs } from "@/components/common/custom-tabs";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { listAuthUnits, type AuthUnit } from "../../api/auth-admin.api";
import { LOCALE_CHANGED_EVENT } from "../../api/session.api";

const unitColumnHelper = createDataTableColumnHelper<AuthUnit>();

type StatusFilter = "ALL" | "ACTIVE" | "INACTIVE";

const STATUS_TABS: Array<{ value: StatusFilter; labelKey: "all" | "active" | "inactive" }> = [
  { value: "ALL", labelKey: "all" },
  { value: "ACTIVE", labelKey: "active" },
  { value: "INACTIVE", labelKey: "inactive" },
];

export function UnitAccessPage() {
  const { t, i18n } = useTranslation("common");
  const [units, setUnits] = useState<AuthUnit[]>([]);
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ACTIVE");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const filteredUnits = useMemo(() => {
    return units.filter((unit) => {
      const statusMatches = statusFilter === "ALL" || Boolean(unit.is_active ?? true) === (statusFilter === "ACTIVE");
      const searchMatches = matchesSearch(
        debouncedSearchText,
        unit.unit_name,
        unit.unit_code,
        unit.unit_type,
        unit.description,
        unit.is_active === false ? t("pages.ssdPillars.status.inactive") : t("pages.ssdPillars.status.active"),
      );
      return statusMatches && searchMatches;
    });
  }, [debouncedSearchText, statusFilter, t, units]);

  const loadUnits = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setError("");
    try {
      const unitList = await listAuthUnits(true);
      setUnits(unitList);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : t("pages.ssdPillars.loadError"));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadUnits(), 0);
    return () => window.clearTimeout(timer);
  }, [loadUnits]);

  useEffect(() => {
    const handleLocaleChange = () => void loadUnits();
    window.addEventListener(LOCALE_CHANGED_EVENT, handleLocaleChange);
    return () => window.removeEventListener(LOCALE_CHANGED_EVENT, handleLocaleChange);
  }, [loadUnits]);

  const columns = useMemo(() => unitColumnHelper.columns([
    unitColumnHelper.accessor((unit) => getUnitName(unit), {
      id: "unitName",
      header: t("pages.ssdPillars.columns.name"),
      sortFn: "alphanumeric",
      cell: ({ row }) => (
        <span className="block min-w-52 whitespace-normal">
          <strong className="block font-medium text-foreground">{getUnitName(row.original)}</strong>
          <span className="block break-all font-mono text-[0.6875rem] text-muted-foreground">
            {row.original.unit_code}
          </span>
        </span>
      ),
    }),
    unitColumnHelper.accessor("unit_type", {
      header: t("pages.ssdPillars.columns.classification"),
      sortFn: "alphanumeric",
      cell: ({ getValue }) => <UnitTypeBadge unitType={getValue()} />,
    }),
    unitColumnHelper.accessor("description", {
      header: t("pages.ssdPillars.columns.description"),
      sortFn: "alphanumeric",
      cell: ({ getValue }) => {
        const description = getValue()?.trim() || "-";
        return (
          <span className="block max-w-[32rem] min-w-64 truncate text-muted-foreground" title={description}>
            {description}
          </span>
        );
      },
    }),
    unitColumnHelper.accessor("updated_at", {
      header: t("pages.ssdPillars.columns.modified"),
      sortFn: "alphanumeric",
      cell: ({ getValue }) => (
        <span className="block min-w-28 whitespace-normal text-muted-foreground">
          {formatUnitDate(getValue(), i18n.language)}
        </span>
      ),
    }),
  ]), [i18n.language, t]);

  const table = useDataTable({
    columns,
    data: filteredUnits,
    getRowId: (unit: AuthUnit) => unit.unit_code,
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

  const handleDebouncedSearch = useCallback((value: string) => {
    setDebouncedSearchText(value.trim());
  }, []);

  function selectStatus(value: string) {
    const tab = STATUS_TABS.find((item) => item.value === value);
    if (tab) setStatusFilter(tab.value);
  }

  const hasActiveFilter = Boolean(debouncedSearchText) || statusFilter !== "ALL";
  const results = (
    <DataTable
      table={table}
      ariaLabel={t("pages.ssdPillars.tableLabel")}
      isLoading={isLoading}
      loadingMessage={t("pages.ssdPillars.loading")}
      error={error || undefined}
      emptyMessage={hasActiveFilter ? t("pages.ssdPillars.noResults") : t("pages.ssdPillars.empty")}
      noResultsMessage={t("pages.ssdPillars.noResults")}
      onRetry={() => void loadUnits()}
    />
  );

  return (
    <PageSection className="flex min-w-0 flex-col gap-4 data-collection-page" aria-labelledby="ssd-pillars-title">
      <PageHeader>
        <div>
          <h2 id="ssd-pillars-title">{t("pages.ssdPillars.title")}</h2>
          <p>{t("pages.ssdPillars.description")}</p>
        </div>
      </PageHeader>

      <SearchInput
        className="w-full max-w-md"
        value={searchText}
        onValueChange={setSearchText}
        onDebouncedValueChange={handleDebouncedSearch}
        label={t("pages.ssdPillars.searchLabel")}
        placeholder={t("pages.ssdPillars.search")}
        clearLabel={t("pages.ssdPillars.clearSearch")}
        pendingLabel={t("pages.ssdPillars.searchPending")}
      />

      <CustomTabs
        variant="underline"
        value={statusFilter}
        onValueChange={(key) => selectStatus(String(key))}
        compact
        ariaLabel={t("pages.ssdPillars.status.label")}
        contentClassName="mt-2"
        items={STATUS_TABS.map((tab) => (
            ({ value: tab.value, label: t(`pages.ssdPillars.status.${tab.labelKey}`), icon: (<StatusDot data-icon="inline-start" variant={normalizeStatusVariant(tab.value)} aria-hidden="true" />), content: (<>{statusFilter === tab.value ? results : null}</>) })
          ))}
      />
    </PageSection>
  );
}

function getUnitName(unit: AuthUnit): string {
  return unit.unit_name?.trim() || unit.unit_code;
}

function UnitTypeBadge({ unitType }: { unitType: string | undefined }) {
  const { t, i18n } = useTranslation("common");
  const normalizedType = unitType?.trim().toUpperCase();
  if (!normalizedType) return <span className="text-muted-foreground">-</span>;

  const variant = normalizedType === "PILLAR"
    ? "secondary"
    : normalizedType === "PROGRAM"
      ? "outline"
      : "ghost";
  const typeKey = `pages.ssdPillars.types.${normalizedType}`;
  return <Badge variant={variant}>{i18n.exists(typeKey) ? t(typeKey) : readableUnitType(normalizedType)}</Badge>;
}

function readableUnitType(unitType: string): string {
  return unitType
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatUnitDate(value: string | null | undefined, locale: string): string {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";

  const parts = new Intl.DateTimeFormat(locale, {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).formatToParts(date);
  const part = (type: Intl.DateTimeFormatPartTypes) => parts.find((item) => item.type === type)?.value ?? "";
  return `${part("day")}-${part("month")}-${part("year")}`;
}

function matchesSearch(searchText: string, ...values: Array<string | number | undefined | null>): boolean {
  if (!searchText.trim()) return true;
  const normalizedSearch = searchText.trim().toLowerCase();
  return values.some((value) => String(value ?? "").toLowerCase().includes(normalizedSearch));
}
