import { StatusBadge } from "@/components/common/status-badge";
import { Loader } from "@/components/common/loader";
import { useConfirmation } from "@/hooks/use-confirmation";
import { normalizeStatusVariant } from "@/components/common/status-variants";
import { Sheet, SheetTitle } from "@/components/ui/sheet";

import { BooleanField } from "@/components/common/boolean-field";
import { PageSection, PageHeader } from "@/components/common/page-layout";

import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createDataTableColumnHelper, DataTable, useDataTable } from "@/components/data-table";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { CustomTabs } from "@/components/common/custom-tabs";
import { cn } from "@/lib/utils";
import { CalendarDays, Copy, Edit3, Ellipsis, Plus, Search, Trash2, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  createTimeFrequency,
  createTimePeriod,
  createTimePeriodSet,
  deactivateDimensionMemberSet,
  deactivateDimensionMemberSetItem,
  deactivateTimeFrequency,
  deactivateTimePeriod,
  listAllTimePeriods,
  listTimeFrequencies,
  listTimePeriods,
  listTimePeriodSetPeriods,
  listTimePeriodSets,
  updateTimeFrequency,
  updateTimePeriod,
  updateTimePeriodSet,
  type DimensionMemberSet,
  type DimensionMemberSetItem,
  type TimeFrequency,
  type TimePeriod,
} from "../../api/dimensions.api";
import { clampPageOffset } from "../../utils/pagination";

type TimeTab = "periods" | "sets" | "frequencies";
type DrawerMode = "period" | "set" | "frequency" | null;
const timePeriodColumnHelper = createDataTableColumnHelper<TimePeriod>();

const emptyPeriodForm = {
  time_period_code: "",
  frequency_code: "FINANCIAL_YEAR",
  period_year: 2024,
  period_quarter: "",
  period_month: "",
  start_date: "2024-04-01",
  end_date: "2025-03-31",
  status: "ACTIVE",
  is_active: true,
  name: "",
  short_name: "",
  description: "",
};

const emptySetForm = {
  set_code: "",
  set_type: "TEMPLATE_SCOPE",
  is_active: true,
  name: "",
  description: "",
};

const emptyFrequencyForm = {
  frequency_code: "",
  months_interval: "",
  sort_order: 0,
  is_active: true,
  name: "",
  description: "",
};

function textValue(value: unknown) {
  return value === undefined || value === null || value === "" ? "-" : String(value);
}

function formatDate(value: unknown, locale: string) {
  if (!value) return "-";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return textValue(value);
  return new Intl.DateTimeFormat(locale, { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

function compactCode(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9_]/g, "_").replace(/_+/g, "_");
}

function labelForPeriod(period: TimePeriod) {
  return textValue(period.name ?? period.short_name ?? period.time_period_code);
}

function isSetImmutable(set?: DimensionMemberSet | null) {
  return Boolean(set?.is_immutable || Number(set?.usage_count ?? 0) > 0);
}

const currentYear = String(new Date().getFullYear());

export function TimePeriodsPage() {
  const confirm = useConfirmation();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TimeTab>("periods");
  const [frequencies, setFrequencies] = useState<TimeFrequency[]>([]);
  const [periods, setPeriods] = useState<TimePeriod[]>([]);
  const [periodCatalog, setPeriodCatalog] = useState<TimePeriod[]>([]);
  const [sets, setSets] = useState<DimensionMemberSet[]>([]);
  const [setItems, setSetItems] = useState<Record<string, DimensionMemberSetItem[]>>({});
  const [selectedSetCode, setSelectedSetCode] = useState("");
  const [selectedPeriodCodes, setSelectedPeriodCodes] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [frequencyFilter, setFrequencyFilter] = useState("ALL");
  const [yearFilter, setYearFilter] = useState(currentYear);
  const [statusFilter, setStatusFilter] = useState("ACTIVE");
  const [pageSize, setPageSize] = useState(25);
  const [offset, setOffset] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [sequenceSetQuery, setSequenceSetQuery] = useState("");
  const [sequenceSearch, setSequenceSearch] = useState("");
  const [sequenceFrequencyFilter, setSequenceFrequencyFilter] = useState("ALL");
  const [drawer, setDrawer] = useState<DrawerMode>(null);
  const [editingPeriodCode, setEditingPeriodCode] = useState("");
  const [editingSetCode, setEditingSetCode] = useState("");
  const [editingFrequencyCode, setEditingFrequencyCode] = useState("");
  const [periodForm, setPeriodForm] = useState(emptyPeriodForm);
  const [setForm, setSetForm] = useState(emptySetForm);
  const [frequencyForm, setFrequencyForm] = useState(emptyFrequencyForm);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query);
      setOffset(0);
    }, 280);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    void loadPage();
  }, [debouncedQuery, frequencyFilter, yearFilter, statusFilter, pageSize, offset]);

  const selectedSet = useMemo(
    () => sets.find((set) => set.set_code === selectedSetCode) ?? sets[0] ?? null,
    [sets, selectedSetCode],
  );

  const selectedSetItems = selectedSet ? setItems[selectedSet.set_code ?? ""] ?? [] : [];

  const yearOptions = useMemo(() => {
    return Array.from(
      new Set(
        periodCatalog
          .map((period) => period.period_year)
          .filter((year): year is number => typeof year === "number" && Number.isFinite(year)),
      ),
    ).sort((first, second) => second - first);
  }, [periodCatalog]);

  const selectedPeriods = useMemo(
    () =>
      selectedPeriodCodes
        .map((code) => periodCatalog.find((period) => period.time_period_code === code))
        .filter((period): period is TimePeriod => Boolean(period)),
    [periodCatalog, selectedPeriodCodes],
  );

  const filteredSets = useMemo(() => {
    const q = sequenceSetQuery.trim().toLowerCase();
    return sets.filter((set) => {
      if (!q) return true;
      return [set.name, set.set_code, set.set_type]
        .filter(Boolean)
        .some((value) => String(value).toLowerCase().includes(q));
    });
  }, [sequenceSetQuery, sets]);

  const sequencePickerPeriods = useMemo(() => {
    const q = sequenceSearch.trim().toLowerCase();
    return periodCatalog.filter((period) => {
      const code = period.time_period_code ?? "";
      if (selectedPeriodCodes.includes(code)) return false;
      if (sequenceFrequencyFilter !== "ALL" && period.frequency_code !== sequenceFrequencyFilter) return false;
      return (
        !q ||
        [period.time_period_code, period.name, period.short_name, period.frequency_code, period.period_year]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(q))
      );
    });
  }, [periodCatalog, selectedPeriodCodes, sequenceSearch, sequenceFrequencyFilter]);

  async function loadPage() {
    setIsLoading(true);
    setError("");
    try {
      const [frequencyResponse, periodResponse, catalogResponse, setResponse] = await Promise.all([
        listTimeFrequencies(),
        listTimePeriods({
          frequencyCode: frequencyFilter,
          searchText: debouncedQuery,
          periodYear: yearFilter === "ALL" ? undefined : Number(yearFilter),
          statusFilter,
          limit: pageSize,
          offset,
        }),
        listAllTimePeriods(),
        listTimePeriodSets(),
      ]);
      const nextFrequencies = frequencyResponse.data ?? [];
      const nextPeriods = periodResponse.data ?? [];
      const nextPeriodCatalog = catalogResponse.data ?? [];
      const nextSets = setResponse.data ?? [];
      setFrequencies(nextFrequencies);
      setPeriods(nextPeriods);
      setPeriodCatalog(nextPeriodCatalog);
      const nextTotalCount = periodResponse.count ?? nextPeriods[0]?.total_count ?? nextPeriods.length;
      setTotalCount(nextTotalCount);
      setOffset((currentOffset) => clampPageOffset(currentOffset, pageSize, nextTotalCount));
      setSets(nextSets);
      const nextSetCode = selectedSetCode || nextSets[0]?.set_code || "";
      setSelectedSetCode(nextSetCode);
      const loadedItems: Record<string, DimensionMemberSetItem[]> = {};
      await Promise.all(
        nextSets.map(async (set) => {
          if (!set.set_code) return;
          const response = await listTimePeriodSetPeriods(set.set_code);
          loadedItems[set.set_code] = response.data ?? [];
        }),
      );
      setSetItems(loadedItems);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : t("pages.timePeriods.errors.load"));
    } finally {
      setIsLoading(false);
    }
  }

  function openPeriodDrawer(period?: TimePeriod) {
    if (period) {
      setEditingPeriodCode(period.time_period_code ?? "");
      setPeriodForm({
        time_period_code: period.time_period_code ?? "",
        frequency_code: period.frequency_code ?? "FINANCIAL_YEAR",
        period_year: Number(period.period_year ?? new Date().getFullYear()),
        period_quarter: period.period_quarter ? String(period.period_quarter) : "",
        period_month: period.period_month ? String(period.period_month) : "",
        start_date: period.start_date ?? "",
        end_date: period.end_date ?? "",
        status: period.status ?? "ACTIVE",
        is_active: period.is_active !== false,
        name: period.name ?? "",
        short_name: period.short_name ?? "",
        description: period.description ?? "",
      });
    } else {
      setEditingPeriodCode("");
      setPeriodForm(emptyPeriodForm);
    }
    setDrawer("period");
  }

  function nextSetVersionCode(set: DimensionMemberSet) {
    const base = compactCode(set.set_code ?? "TIME_PERIOD_SET");
    for (let version = 2; version <= 99; version += 1) {
      const candidate = `${base}_V${version}`;
      if (!sets.some((existing) => existing.set_code === candidate)) return candidate;
    }
    return `${base}_NEXT`;
  }

  function openSetDrawer(set?: DimensionMemberSet, options: { copyAsNew?: boolean } = {}) {
    if (set) {
      const items = setItems[set.set_code ?? ""] ?? [];
      setEditingSetCode(options.copyAsNew ? "" : set.set_code ?? "");
      setSelectedPeriodCodes(items.map((item) => item.member_code ?? "").filter(Boolean));
      setSetForm({
        set_code: options.copyAsNew ? nextSetVersionCode(set) : set.set_code ?? "",
        set_type: set.set_type ?? "TEMPLATE_SCOPE",
        is_active: set.is_active !== false,
        name: options.copyAsNew ? t("pages.timePeriods.sequences.newCycleName", { name: textValue(set.name ?? set.set_code) }) : set.name ?? "",
        description: options.copyAsNew
          ? t("pages.timePeriods.sequences.copiedDescription", { code: textValue(set.set_code) })
          : set.description ?? "",
      });
    } else {
      setEditingSetCode("");
      setSelectedPeriodCodes([]);
      setSetForm(emptySetForm);
    }
    setSequenceSearch("");
    setSequenceFrequencyFilter("ALL");
    setDrawer("set");
  }

  function openFrequencyDrawer(frequency?: TimeFrequency) {
    if (frequency) {
      setEditingFrequencyCode(frequency.frequency_code ?? "");
      setFrequencyForm({
        frequency_code: frequency.frequency_code ?? "",
        months_interval: frequency.months_interval === undefined || frequency.months_interval === null ? "" : String(frequency.months_interval),
        sort_order: Number(frequency.sort_order ?? 0),
        is_active: frequency.is_active !== false,
        name: frequency.name ?? "",
        description: frequency.description ?? "",
      });
    } else {
      setEditingFrequencyCode("");
      setFrequencyForm(emptyFrequencyForm);
    }
    setDrawer("frequency");
  }

  // Retained temporarily with the legacy form markup until its CSS can be removed safely.
  // No page action invokes these handlers; create and edit now use dedicated routes.
  void openPeriodDrawer;
  void openSetDrawer;
  void openFrequencyDrawer;

  async function savePeriod(event: FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    try {
      const payload = {
        ...periodForm,
        time_period_code: compactCode(periodForm.time_period_code),
        period_quarter: periodForm.period_quarter ? Number(periodForm.period_quarter) : undefined,
        period_month: periodForm.period_month ? Number(periodForm.period_month) : undefined,
      };
      if (editingPeriodCode) await updateTimePeriod(editingPeriodCode, payload);
      else await createTimePeriod(payload);
      setDrawer(null);
      toast.success(t("pages.timePeriods.notifications.periodSaved"));
      await loadPage();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : t("pages.timePeriods.errors.periodSave"));
    } finally {
      setIsSaving(false);
    }
  }

  async function saveSet(event: FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    try {
      const existingSet = sets.find((set) => set.set_code === editingSetCode);
      if (editingSetCode && isSetImmutable(existingSet)) {
        throw new Error(t("pages.timePeriods.errors.sequenceImmutableSave"));
      }
      const payload = {
        ...setForm,
        set_code: compactCode(setForm.set_code),
        items: selectedPeriodCodes.map((timePeriodCode, index) => ({
          time_period_code: timePeriodCode,
          sort_order: index + 1,
          is_active: true,
        })),
      };
      if (editingSetCode) await updateTimePeriodSet(editingSetCode, payload);
      else await createTimePeriodSet(payload);
      setDrawer(null);
      toast.success(t("pages.timePeriods.notifications.sequenceSaved"));
      await loadPage();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : t("pages.timePeriods.errors.sequenceSave"));
    } finally {
      setIsSaving(false);
    }
  }

  async function saveFrequency(event: FormEvent) {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    try {
      const payload = {
        frequency_code: compactCode(frequencyForm.frequency_code),
        months_interval: frequencyForm.months_interval ? Number(frequencyForm.months_interval) : undefined,
        sort_order: Number(frequencyForm.sort_order ?? 0),
        is_active: frequencyForm.is_active,
        name: frequencyForm.name,
        description: frequencyForm.description || undefined,
      };
      if (editingFrequencyCode) await updateTimeFrequency(editingFrequencyCode, payload);
      else await createTimeFrequency(payload);
      setDrawer(null);
      toast.success(t("pages.timePeriods.notifications.frequencySaved"));
      await loadPage();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : t("pages.timePeriods.errors.frequencySave"));
    } finally {
      setIsSaving(false);
    }
  }

  function togglePeriodInSet(timePeriodCode: string) {
    setSelectedPeriodCodes((current) =>
      current.includes(timePeriodCode)
        ? current.filter((code) => code !== timePeriodCode)
        : [...current, timePeriodCode],
    );
  }

  function removePeriodFromSet(timePeriodCode: string) {
    setSelectedPeriodCodes((current) => current.filter((code) => code !== timePeriodCode));
  }

  async function removeSavedPeriodFromSet(setCode: string, memberCode: string) {
    if (!setCode || !memberCode) return;
    const existingSet = sets.find((set) => set.set_code === setCode);
    if (isSetImmutable(existingSet)) {
      setError(t("pages.timePeriods.errors.sequenceImmutableItems"));
      return;
    }
    if (isSaving || !(await confirm(t("confirmation.remove")))) return;
    setIsSaving(true);
    setError("");
    try {
      await deactivateDimensionMemberSetItem(setCode, memberCode);
      toast.success(t("pages.timePeriods.notifications.periodRemoved"));
      await loadPage();
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : t("pages.timePeriods.errors.periodRemove"));
    } finally {
      setIsSaving(false);
    }
  }

  async function removePeriodSet(set: DimensionMemberSet) {
    if (!set.set_code) return;
    if (isSetImmutable(set)) {
      setError(t("pages.timePeriods.errors.sequenceImmutableDeactivate"));
      return;
    }
    if (isSaving || !(await confirm(t("confirmation.remove")))) return;
    setIsSaving(true);
    setError("");
    try {
      await deactivateDimensionMemberSet("TIME_PERIOD", set.set_code);
      toast.success(t("pages.timePeriods.notifications.sequenceDeactivated"));
      await loadPage();
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : t("pages.timePeriods.errors.sequenceDeactivate"));
    } finally {
      setIsSaving(false);
    }
  }

  async function removeRecord(action: () => Promise<unknown>) {
    if (isSaving || !(await confirm(t("confirmation.remove")))) return;
    setIsSaving(true);
    setError("");
    try {
      await action();
      await loadPage();
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : t("pages.timePeriods.errors.periodRemove"));
    } finally {
      setIsSaving(false);
    }
  }

  const timePeriodColumns = timePeriodColumnHelper.columns([
    timePeriodColumnHelper.display({ id: "period", header: t("pages.timePeriods.table.period"), cell: ({ row }) => <strong>{labelForPeriod(row.original)}</strong> }),
    timePeriodColumnHelper.accessor("time_period_code", { header: t("pages.timePeriods.table.code"), cell: ({ getValue }) => <span className="code-pill">{getValue()}</span> }),
    timePeriodColumnHelper.display({ id: "frequency", header: t("pages.timePeriods.table.frequency"), cell: ({ row }) => textValue(row.original.frequency_name ?? row.original.frequency_code) }),
    timePeriodColumnHelper.accessor("start_date", { header: t("pages.timePeriods.table.start"), cell: ({ getValue }) => formatDate(getValue(), i18n.resolvedLanguage ?? i18n.language) }),
    timePeriodColumnHelper.accessor("end_date", { header: t("pages.timePeriods.table.end"), cell: ({ getValue }) => formatDate(getValue(), i18n.resolvedLanguage ?? i18n.language) }),
    timePeriodColumnHelper.display({ id: "status", header: t("pages.timePeriods.table.status"), cell: ({ row }) => <StatusBadge variant={normalizeStatusVariant(`${row.original.is_active === false ? "inactive" : "active"}`)}>{t(row.original.is_active === false ? "pages.timePeriods.filters.inactive" : "pages.timePeriods.filters.active")}</StatusBadge> }),
    timePeriodColumnHelper.display({
      id: "actions",
      header: () => <span className="block text-right">{t("pages.timePeriods.table.actions")}</span>,
      enableSorting: false,
      enableGlobalFilter: false,
      cell: ({ row }) => (
        <div className="flex justify-end" onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
          <DropdownMenuTrigger>
            <Button type="button" variant="ghost" size="icon-sm" aria-label={t("pages.timePeriods.actions.for", { name: labelForPeriod(row.original) })}>
              <Ellipsis aria-hidden="true" />
            </Button>
            <DropdownMenu aria-label={t("pages.timePeriods.actions.for", { name: labelForPeriod(row.original) })} className="min-w-40" placement="bottom end">
              <DropdownMenuLabel>{t("pages.timePeriods.actions.period")}</DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem id="edit" onAction={() => navigate(`/masters/time-periods/periods/${encodeURIComponent(row.original.time_period_code ?? "")}/edit`)}>
                  <Edit3 aria-hidden="true" />
                  {t("pages.timePeriods.actions.edit")}
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem id="deactivate" variant="destructive" isDisabled={isSaving} onAction={() => void removeRecord(() => deactivateTimePeriod(row.original.time_period_code ?? ""))}>
                  <Trash2 aria-hidden="true" />
                  {t("pages.timePeriods.actions.deactivate")}
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenu>
          </DropdownMenuTrigger>
        </div>
      ),
    }),
  ]);
  const timePeriodTable = useDataTable({
    columns: timePeriodColumns,
    data: periods,
    state: { pagination: { pageIndex: Math.floor(offset / pageSize), pageSize } },
    onPaginationChange: (updater) => {
      const current = { pageIndex: Math.floor(offset / pageSize), pageSize };
      const next = typeof updater === "function" ? updater(current) : updater;
      setPageSize(next.pageSize);
      setOffset(next.pageIndex * next.pageSize);
    },
    manualPagination: true,
    rowCount: totalCount,
    getRowId: (row) => row.time_period_code ?? "",
    enableMultiSort: false,
    enableRowSelection: false,
    autoResetPageIndex: false,
  });

  return (
    <PageSection className="flex min-w-0 flex-col gap-4">
      <PageHeader>
        <div>
          <h2>{t("pages.timePeriods.title")}</h2>
          <p>{t("pages.timePeriods.description")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            onPress={() => navigate(`/masters/time-periods/${activeTab}/create`)}
          >
            <Plus data-icon="inline-start" aria-hidden="true" />
            {t(activeTab === "frequencies" ? "pages.timePeriods.add.frequency" : activeTab === "sets" ? "pages.timePeriods.add.sequence" : "pages.timePeriods.add.period")}
          </Button>
        </div>
      </PageHeader>

      {error && <div className="rounded-md bg-muted p-3 text-sm text-destructive">{error}</div>}

      <section className="grid grid-cols-1 gap-2 rounded-md bg-muted/50 p-2 md:grid-cols-5" aria-label={t("pages.timePeriods.filters.label")}>
        <InputGroup className="md:col-span-2">
          <InputGroupAddon><Search aria-hidden="true" /></InputGroupAddon>
          <InputGroupInput
            aria-label={t("pages.timePeriods.filters.searchLabel")}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("pages.timePeriods.filters.searchPlaceholder")}
          />
        </InputGroup>
        <Select
          className="min-w-0 w-full"
          aria-label={t("pages.timePeriods.filters.frequencyLabel")}
          selectedKey={frequencyFilter}
          onSelectionChange={(key) => { setFrequencyFilter(String(key)); setOffset(0); }}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent className="w-max max-w-[calc(100vw-2rem)]">
            <SelectGroup>
              <SelectItem id="ALL">{t("pages.timePeriods.filters.allFrequencies")}</SelectItem>
              {frequencies.map((frequency) => <SelectItem id={frequency.frequency_code ?? ""} key={frequency.frequency_code}>{frequency.name ?? frequency.frequency_code}</SelectItem>)}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select
          className="min-w-0 w-full"
          aria-label={t("pages.timePeriods.filters.statusLabel")}
          selectedKey={statusFilter}
          onSelectionChange={(key) => { setStatusFilter(String(key)); setOffset(0); }}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem id="ACTIVE">{t("pages.timePeriods.filters.active")}</SelectItem>
              <SelectItem id="INACTIVE">{t("pages.timePeriods.filters.inactive")}</SelectItem>
              <SelectItem id="ALL">{t("pages.timePeriods.filters.allStatuses")}</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select
          className="min-w-0 w-full"
          aria-label={t("pages.timePeriods.filters.yearLabel")}
          selectedKey={yearFilter}
          onSelectionChange={(key) => { setYearFilter(String(key)); setOffset(0); }}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem id="ALL">{t("pages.timePeriods.filters.allYears")}</SelectItem>
              {yearOptions.map((year) => <SelectItem id={String(year)} key={year}>{year}</SelectItem>)}
            </SelectGroup>
          </SelectContent>
        </Select>
      </section>

      <CustomTabs
        className="min-h-0 flex-1 overflow-hidden"
        variant="underline"
        value={activeTab}
        onValueChange={(key) => setActiveTab(String(key) as TimeTab)}
        compact
        ariaLabel={t("pages.timePeriods.tabs.label")}
        contentClassName="flex min-h-0 flex-1 overflow-hidden"
        items={[{ value: "periods", label: t("pages.timePeriods.tabs.periods") },
          { value: "sets", label: t("pages.timePeriods.tabs.sequences") },
          { value: "frequencies", label: t("pages.timePeriods.tabs.frequencies") }].map((tab) => ({ ...tab, content: (<><section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
        {isLoading && activeTab !== "periods" && <Loader text={t("pages.timePeriods.table.loading")} />}

        {activeTab === "periods" && (
          <DataTable
            table={timePeriodTable}
            ariaLabel={t("pages.timePeriods.table.label")}
            className="flex min-h-0 flex-1 flex-col"
            scrollContainerClassName="min-h-0 flex-1 overflow-y-auto [&_thead]:sticky [&_thead]:top-0 [&_thead]:z-10"
            isLoading={isLoading}
            loadingMessage={t("pages.timePeriods.table.loading")}
            emptyMessage={t("pages.timePeriods.table.empty")}
            pageSizeOptions={[10, 25, 50, 100]}
            totalCount={totalCount}
          />
        )}

        {!isLoading && activeTab === "sets" && (
          <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-y-auto lg:grid-cols-[minmax(18rem,22rem)_minmax(0,1fr)] lg:overflow-hidden">
            <Card className="min-h-72 gap-0 overflow-hidden py-0 lg:min-h-0">
              <CardHeader className="border-b p-4">
                <CardTitle>{t("pages.timePeriods.sequences.title")}</CardTitle>
                <CardDescription>{t("pages.timePeriods.sequences.subtitle")}</CardDescription>
                <InputGroup className="mt-2">
                  <InputGroupAddon><Search aria-hidden="true" /></InputGroupAddon>
                  <InputGroupInput aria-label={t("pages.timePeriods.sequences.search")} value={sequenceSetQuery} onChange={(event) => setSequenceSetQuery(event.target.value)} placeholder={t("pages.timePeriods.sequences.search")} />
                </InputGroup>
              </CardHeader>
              <CardContent className="flex min-h-0 flex-col gap-1 overflow-y-auto p-2">
              {filteredSets.map((set) => {
                const selected = set.set_code === selectedSet?.set_code;
                return <div className={cn("flex items-center gap-1 rounded-md p-1 transition-colors hover:bg-muted/50", selected && "bg-accent")} key={set.set_code}>
                  <Button className="h-auto min-w-0 flex-1 justify-start px-2 py-2 text-left" variant="ghost" type="button" onPress={() => setSelectedSetCode(set.set_code ?? "")}>
                    <span className="flex min-w-0 flex-col items-start gap-0.5">
                      <strong className="w-full truncate text-sm">{textValue(set.name ?? set.set_code)}</strong>
                      <span className="w-full truncate text-xs font-normal text-muted-foreground">{textValue(set.set_code)} · {textValue(set.set_type)}</span>
                      <span className="flex flex-wrap items-center gap-1 text-xs font-normal text-muted-foreground">
                        {t("pages.timePeriods.sequences.periodCount", { count: (setItems[set.set_code ?? ""] ?? []).length })}
                        {isSetImmutable(set) && <Badge variant="secondary">{t("pages.timePeriods.sequences.immutable")}</Badge>}
                      </span>
                    </span>
                  </Button>
                  <DropdownMenuTrigger>
                    <Button type="button" variant="ghost" size="icon-sm" aria-label={t("pages.timePeriods.actions.for", { name: textValue(set.name ?? set.set_code) })}>
                      <Ellipsis aria-hidden="true" />
                    </Button>
                    <DropdownMenu aria-label={t("pages.timePeriods.actions.for", { name: textValue(set.name ?? set.set_code) })} className="min-w-48" placement="bottom end">
                      <DropdownMenuLabel>{t("pages.timePeriods.actions.sequence")}</DropdownMenuLabel>
                      <DropdownMenuGroup>
                        <DropdownMenuItem id="copy" onAction={() => navigate(`/masters/time-periods/sets/create?copyFrom=${encodeURIComponent(set.set_code ?? "")}`)}>
                          <Copy aria-hidden="true" />
                          {t("pages.timePeriods.actions.copyCycle")}
                        </DropdownMenuItem>
                        <DropdownMenuItem id="edit" isDisabled={isSetImmutable(set)} onAction={() => navigate(`/masters/time-periods/sets/${encodeURIComponent(set.set_code ?? "")}/edit`)}>
                          <Edit3 aria-hidden="true" />
                          {t("pages.timePeriods.actions.edit")}
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuItem id="deactivate" variant="destructive" isDisabled={isSaving || isSetImmutable(set)} onAction={() => void removePeriodSet(set)}>
                          <Trash2 aria-hidden="true" />
                          {t("pages.timePeriods.actions.deactivate")}
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenu>
                  </DropdownMenuTrigger>
                </div>;
              })}
              {!filteredSets.length && <Empty className="min-h-48"><EmptyHeader><EmptyMedia variant="icon"><Search /></EmptyMedia><EmptyTitle>{t("pages.timePeriods.sequences.emptySearch")}</EmptyTitle></EmptyHeader></Empty>}
              </CardContent>
            </Card>
            <Card className="min-h-72 gap-0 overflow-hidden py-0 lg:min-h-0">
              <CardHeader className="flex flex-row items-center justify-between gap-3 border-b p-4">
                <div className="min-w-0">
                  <CardTitle className="truncate">{textValue(selectedSet?.name ?? t("pages.timePeriods.sequences.select"))}</CardTitle>
                  <CardDescription>{selectedSet ? `${textValue(selectedSet.set_code)} · ${t("pages.timePeriods.sequences.periodCount", { count: selectedSetItems.length })}` : t("pages.timePeriods.sequences.singular")}</CardDescription>
                </div>
                {selectedSet && (
                  <div className="flex shrink-0 flex-wrap justify-end gap-2">
                    {isSetImmutable(selectedSet) && <Badge variant="secondary" title={selectedSet.lock_reason ?? t("pages.timePeriods.sequences.immutableHelp")}>{t("pages.timePeriods.sequences.immutable")}</Badge>}
                    <Button size="sm" variant="outline" type="button" onPress={() => navigate(`/masters/time-periods/sets/create?copyFrom=${encodeURIComponent(selectedSet.set_code ?? "")}`)}>
                      <Copy data-icon="inline-start" aria-hidden="true" />
                      {t("pages.timePeriods.actions.copyCycle")}
                    </Button>
                    <Button size="sm" variant="outline" type="button" isDisabled={isSetImmutable(selectedSet)} onPress={() => navigate(`/masters/time-periods/sets/${encodeURIComponent(selectedSet.set_code ?? "")}/edit`)}>
                      <Edit3 data-icon="inline-start" aria-hidden="true" />
                      {t("pages.timePeriods.actions.editSequence")}
                    </Button>
                  </div>
                )}
              </CardHeader>
              <CardContent className="min-h-0 overflow-y-auto p-3">
                {selectedSetItems.length ? selectedSetItems.map((item, index) => (
                  <div className="flex items-center gap-3 border-b py-2 last:border-b-0" key={`${item.member_code}-${index}`}>
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-medium">{index + 1}</span>
                    <span className="flex min-w-0 flex-1 flex-col"><strong className="truncate text-sm font-medium">{textValue(item.member_name ?? item.member_code)}</strong><small className="truncate text-xs text-muted-foreground">{textValue(item.member_code)}</small></span>
                    <Button
                      type="button"
                      variant="ghost" size="icon-sm" aria-label={t("pages.timePeriods.actions.removePeriod")}
                      isDisabled={isSaving || isSetImmutable(selectedSet)}
                      onPress={() => void removeSavedPeriodFromSet(selectedSet?.set_code ?? "", item.member_code ?? "")}
                    >
                      <Trash2 aria-hidden="true" />
                    </Button>
                  </div>
                )) : <Empty className="min-h-64"><EmptyHeader><EmptyMedia variant="icon"><CalendarDays /></EmptyMedia><EmptyTitle>{t("pages.timePeriods.sequences.empty")}</EmptyTitle><EmptyDescription>{t("pages.timePeriods.sequenceForm.selectionHelp")}</EmptyDescription></EmptyHeader></Empty>}
              </CardContent>
            </Card>
          </div>
        )}

        {!isLoading && activeTab === "frequencies" && (
          <Card className="min-h-0 flex-1 gap-0 overflow-hidden py-0">
            <CardHeader className="flex flex-row items-center justify-between gap-4 border-b p-4">
              <div className="min-w-0">
                <CardTitle>{t("pages.timePeriods.frequencies.title")}</CardTitle>
                <CardDescription>{t("pages.timePeriods.frequencies.description")}</CardDescription>
              </div>
              <Button className="shrink-0" size="sm" type="button" onPress={() => navigate("/masters/time-periods/frequencies/create")}>
                <Plus data-icon="inline-start" aria-hidden="true" />
                {t("pages.timePeriods.add.frequency")}
              </Button>
            </CardHeader>
            <CardContent className="min-h-0 overflow-y-auto p-4">
              {frequencies.length ? (
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {frequencies.map((frequency) => (
                <Card className="gap-0 py-0 transition-shadow hover:shadow-sm" size="sm" key={frequency.frequency_code}>
                  <CardHeader className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-start gap-3 p-3">
                    <span className="flex size-9 items-center justify-center rounded-md bg-primary/10 text-primary"><CalendarDays aria-hidden="true" /></span>
                    <div className="min-w-0">
                      <CardTitle className="truncate">{textValue(frequency.name ?? frequency.frequency_code)}</CardTitle>
                      <CardDescription className="mt-0.5 truncate font-mono">{textValue(frequency.frequency_code)}</CardDescription>
                    </div>
                  <DropdownMenuTrigger>
                    <Button type="button" variant="ghost" size="icon-sm" aria-label={t("pages.timePeriods.actions.for", { name: textValue(frequency.name ?? frequency.frequency_code) })}>
                      <Ellipsis aria-hidden="true" />
                    </Button>
                    <DropdownMenu aria-label={t("pages.timePeriods.actions.for", { name: textValue(frequency.name ?? frequency.frequency_code) })} className="min-w-40" placement="bottom end">
                      <DropdownMenuLabel>{t("pages.timePeriods.actions.frequency")}</DropdownMenuLabel>
                      <DropdownMenuGroup>
                        <DropdownMenuItem id="edit" onAction={() => navigate(`/masters/time-periods/frequencies/${encodeURIComponent(frequency.frequency_code ?? "")}/edit`)}>
                          <Edit3 aria-hidden="true" />
                          {t("pages.timePeriods.actions.edit")}
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                      <DropdownMenuSeparator />
                      <DropdownMenuGroup>
                        <DropdownMenuItem id="deactivate" variant="destructive" isDisabled={isSaving} onAction={() => void removeRecord(() => deactivateTimeFrequency(frequency.frequency_code ?? ""))}>
                          <Trash2 aria-hidden="true" />
                          {t("pages.timePeriods.actions.deactivate")}
                        </DropdownMenuItem>
                      </DropdownMenuGroup>
                    </DropdownMenu>
                  </DropdownMenuTrigger>
                  </CardHeader>
                  <CardContent className="border-t px-3 py-2">
                    <Badge variant="secondary">{frequency.months_interval ? t("pages.timePeriods.frequencies.monthInterval", { count: frequency.months_interval }) : t("pages.timePeriods.frequencies.customInterval")}</Badge>
                  </CardContent>
                </Card>
                ))}
                </div>
              ) : (
                <Empty className="min-h-64">
                  <EmptyHeader>
                    <EmptyMedia variant="icon"><CalendarDays /></EmptyMedia>
                    <EmptyTitle>{t("pages.timePeriods.frequencies.emptyTitle")}</EmptyTitle>
                    <EmptyDescription>{t("pages.timePeriods.frequencies.emptyDescription")}</EmptyDescription>
                  </EmptyHeader>
                </Empty>
              )}
            </CardContent>
          </Card>
        )}
        </section></>) }))}
      />

      {drawer && (
        <Sheet isOpen showCloseButton={false} onOpenChange={(open) => { if (!open) { setDrawer(null); } }} className="w-full sm:max-w-xl">
          <div className="flex min-h-0 flex-1 flex-col gap-3">
            <header className="flex shrink-0 items-start justify-between gap-3 border-b p-4 [&_h3]:text-base [&_h3]:font-semibold [&_span]:text-xs [&_span]:text-muted-foreground">
              <div>
                <span>{t(drawer === "period" ? "pages.timePeriods.drawer.periodEyebrow" : drawer === "set" ? "pages.timePeriods.drawer.sequenceEyebrow" : "pages.timePeriods.drawer.frequencyEyebrow")}</span>
                <SheetTitle>{t(drawer === "period" ? "pages.timePeriods.drawer.periodTitle" : drawer === "set" ? "pages.timePeriods.drawer.sequenceTitle" : "pages.timePeriods.drawer.frequencyTitle")}</SheetTitle>
              </div>
              <Button size="icon-sm" variant="ghost" type="button" aria-label={t("pages.timePeriods.actions.close")} onClick={() => setDrawer(null)}><X size={16} /></Button>
            </header>
            {drawer === "period" ? (
              <form className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4" onSubmit={savePeriod}>
                <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
                  <strong>{t(editingPeriodCode ? "pages.timePeriods.periodForm.editTitle" : "pages.timePeriods.periodForm.createTitle")}</strong>
                  <span>{t("pages.timePeriods.periodForm.description")}</span>
                </div>

                <section className="flex min-w-0 flex-col gap-3">
                  <div className="flex items-start justify-between gap-2 [&_h3]:text-sm [&_h3]:font-semibold [&_p]:text-xs [&_p]:text-muted-foreground">
                    <span>{t("pages.timePeriods.periodForm.identityTitle")}</span>
                    <p>{t("pages.timePeriods.periodForm.identityDescription")}</p>
                  </div>
                  <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium">
                    {t("pages.timePeriods.fields.periodCode")}
                    <Input
                      value={periodForm.time_period_code}
                      onChange={(event) => setPeriodForm((current) => ({ ...current, time_period_code: compactCode(event.target.value) }))}
                      required
                    />
                  </label>
                  <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium">
                    {t("pages.timePeriods.fields.name")}
                    <Input
                      value={periodForm.name}
                      onChange={(event) => setPeriodForm((current) => ({ ...current, name: event.target.value }))}
                      required
                    />
                  </label>
                </section>

                <section className="flex min-w-0 flex-col gap-3">
                  <div className="flex items-start justify-between gap-2 [&_h3]:text-sm [&_h3]:font-semibold [&_p]:text-xs [&_p]:text-muted-foreground">
                    <span>{t("pages.timePeriods.periodForm.calendarTitle")}</span>
                    <p>{t("pages.timePeriods.periodForm.calendarDescription")}</p>
                  </div>
                  <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium">
                      {t("pages.timePeriods.fields.frequency")}
                      <NativeSelect value={periodForm.frequency_code} onChange={(event) => setPeriodForm((current) => ({ ...current, frequency_code: event.target.value }))}>
                        {frequencies.map((frequency) => <NativeSelectOption value={frequency.frequency_code} key={frequency.frequency_code}>{frequency.name ?? frequency.frequency_code}</NativeSelectOption>)}
                      </NativeSelect>
                    </label>
                    <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium">
                      {t("pages.timePeriods.fields.periodYear")}
                      <Input type="number" value={periodForm.period_year} onChange={(event) => setPeriodForm((current) => ({ ...current, period_year: Number(event.target.value) }))} />
                    </label>
                  </div>
                  <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium">
                      {t("pages.timePeriods.fields.quarter")}
                      <Input type="number" min="1" max="4" value={periodForm.period_quarter} onChange={(event) => setPeriodForm((current) => ({ ...current, period_quarter: event.target.value }))} />
                    </label>
                    <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium">
                      {t("pages.timePeriods.fields.month")}
                      <Input type="number" min="1" max="12" value={periodForm.period_month} onChange={(event) => setPeriodForm((current) => ({ ...current, period_month: event.target.value }))} />
                    </label>
                  </div>
                </section>

                <section className="flex min-w-0 flex-col gap-3">
                  <div className="flex items-start justify-between gap-2 [&_h3]:text-sm [&_h3]:font-semibold [&_p]:text-xs [&_p]:text-muted-foreground">
                    <span>{t("pages.timePeriods.periodForm.dateTitle")}</span>
                    <p>{t("pages.timePeriods.periodForm.dateDescription")}</p>
                  </div>
                  <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium">
                      {t("pages.timePeriods.fields.startDate")}
                      <Input type="date" value={periodForm.start_date} onChange={(event) => setPeriodForm((current) => ({ ...current, start_date: event.target.value }))} required />
                    </label>
                    <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium">
                      {t("pages.timePeriods.fields.endDate")}
                      <Input type="date" value={periodForm.end_date} onChange={(event) => setPeriodForm((current) => ({ ...current, end_date: event.target.value }))} required />
                    </label>
                  </div>
                  <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium">
                    {t("pages.timePeriods.fields.description")}
                    <Textarea value={periodForm.description} onChange={(event) => setPeriodForm((current) => ({ ...current, description: event.target.value }))} />
                  </label>
                </section>

                <section className="flex min-w-0 flex-col gap-3">
                  <div className="flex items-start justify-between gap-2 [&_h3]:text-sm [&_h3]:font-semibold [&_p]:text-xs [&_p]:text-muted-foreground">
                    <span>{t("pages.timePeriods.fields.availability")}</span>
                    <p>{t("pages.timePeriods.periodForm.availabilityDescription")}</p>
                  </div>
                  <BooleanField isSelected={periodForm.is_active} onChange={(isSelected) => setPeriodForm((current) => ({ ...current, is_active: isSelected }))}>

                    <span>{t("pages.timePeriods.filters.active")}</span>
                  </BooleanField>
                </section>

                <footer className="mt-auto flex shrink-0 flex-wrap items-center justify-end gap-2 border-t pt-4">
                  <Button variant="outline" type="button" onClick={() => setDrawer(null)}>{t("pages.timePeriods.actions.cancel")}</Button>
                  <Button type="submit" disabled={isSaving}>{t(isSaving ? "pages.timePeriods.actions.saving" : "pages.timePeriods.actions.savePeriod")}</Button>
                </footer>
              </form>
            ) : drawer === "set" ? (
              <form className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4" onSubmit={saveSet}>
              <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground"><strong>{t("pages.timePeriods.sequenceForm.title")}</strong><span>{t("pages.timePeriods.sequenceForm.description")}</span></div>
                <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium">{t("pages.timePeriods.fields.setCode")}<Input value={setForm.set_code} onChange={(event) => setSetForm((current) => ({ ...current, set_code: compactCode(event.target.value) }))} required /></label>
                <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium">{t("pages.timePeriods.fields.name")}<Input value={setForm.name} onChange={(event) => setSetForm((current) => ({ ...current, name: event.target.value }))} required /></label>
                <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium">{t("pages.timePeriods.fields.setType")}<NativeSelect value={setForm.set_type} onChange={(event) => setSetForm((current) => ({ ...current, set_type: event.target.value }))}><NativeSelectOption value="TEMPLATE_SCOPE">{t("pages.timePeriods.setTypes.template")}</NativeSelectOption><NativeSelectOption value="REQUEST_SCOPE">{t("pages.timePeriods.setTypes.request")}</NativeSelectOption><NativeSelectOption value="REPORT_SCOPE">{t("pages.timePeriods.setTypes.report")}</NativeSelectOption><NativeSelectOption value="CONTROLLED_SCOPE">{t("pages.timePeriods.setTypes.controlled")}</NativeSelectOption></NativeSelect></label>
                <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium">{t("pages.timePeriods.fields.description")}<Textarea value={setForm.description} onChange={(event) => setSetForm((current) => ({ ...current, description: event.target.value }))} /></label>
                <div className="text-xs text-muted-foreground">{t("pages.timePeriods.sequenceForm.selectionHelp")}</div>
                {!editingSetCode && setForm.description?.startsWith(t("pages.timePeriods.sequences.copiedPrefix")) && (
                  <div className="text-xs text-muted-foreground">{t("pages.timePeriods.sequenceForm.copyHelp")}</div>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  <strong>{t("pages.timePeriods.sequenceForm.selected", { count: selectedPeriods.length })}</strong>
                  {selectedPeriods.length ? selectedPeriods.map((period, index) => (
                    <Badge key={period.time_period_code}>
                      <b>{index + 1}</b>
                      {labelForPeriod(period)}
                      <Button type="button" title={t("pages.timePeriods.actions.removeFromSequence")} onClick={() => removePeriodFromSet(period.time_period_code ?? "")}>
                        <X size={11} />
                      </Button>
                    </Badge>
                  )) : <small>{t("pages.timePeriods.sequenceForm.noneSelected")}</small>}
                </div>
                <div className="flex min-w-0 flex-wrap items-center gap-3">
                  <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium" title={t("pages.timePeriods.sequenceForm.searchHelp")}>{t("pages.timePeriods.sequenceForm.findPeriod")}<Input value={sequenceSearch} onChange={(event) => setSequenceSearch(event.target.value)} placeholder={t("pages.timePeriods.sequenceForm.searchPlaceholder")} /></label>
                  <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium" title={t("pages.timePeriods.sequenceForm.frequencyHelp")}>{t("pages.timePeriods.fields.frequency")}<NativeSelect value={sequenceFrequencyFilter} onChange={(event) => setSequenceFrequencyFilter(event.target.value)}><NativeSelectOption value="ALL">{t("pages.timePeriods.filters.allFrequencies")}</NativeSelectOption>{frequencies.map((frequency) => <NativeSelectOption value={frequency.frequency_code} key={frequency.frequency_code}>{frequency.name ?? frequency.frequency_code}</NativeSelectOption>)}</NativeSelect></label>
                </div>
                <div className="flex max-h-64 flex-col gap-2 overflow-y-auto rounded-md border p-3">
                  {sequencePickerPeriods.map((period) => {
                    const code = period.time_period_code ?? "";
                    return (
                      <Button className="flex items-center gap-2 text-sm" type="button" key={code} onClick={() => togglePeriodInSet(code)}>
                        <span>+</span>
                        <strong>{labelForPeriod(period)}</strong>
                        <small>{code}</small>
                      </Button>
                    );
                  })}
                  {!sequencePickerPeriods.length && <div className="table-empty">{t("pages.timePeriods.sequenceForm.noMatches")}</div>}
                </div>
                <footer className="mt-auto flex shrink-0 flex-wrap items-center justify-end gap-2 border-t pt-4">
                  <Button variant="outline" type="button" onClick={() => setDrawer(null)}>{t("pages.timePeriods.actions.cancel")}</Button>
                  <Button type="submit" disabled={isSaving || !selectedPeriodCodes.length}>{t(isSaving ? "pages.timePeriods.actions.saving" : "pages.timePeriods.actions.saveSequence")}</Button>
                </footer>
              </form>
            ) : (
              <form className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4" onSubmit={saveFrequency}>
                <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
                  <strong>{t(editingFrequencyCode ? "pages.timePeriods.frequencyForm.editTitle" : "pages.timePeriods.frequencyForm.createTitle")}</strong>
                  <span>{t("pages.timePeriods.frequencyForm.description")}</span>
                </div>

                <section className="flex min-w-0 flex-col gap-3">
                  <div className="flex items-start justify-between gap-2 [&_h3]:text-sm [&_h3]:font-semibold [&_p]:text-xs [&_p]:text-muted-foreground">
                    <span>{t("pages.timePeriods.frequencyForm.identityTitle")}</span>
                    <p>{t("pages.timePeriods.frequencyForm.identityDescription")}</p>
                  </div>
                  <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium" title={t("pages.timePeriods.frequencyForm.codeHelp")}>
                    {t("pages.timePeriods.fields.frequencyCode")}
                    <Input
                      value={frequencyForm.frequency_code}
                      onChange={(event) => setFrequencyForm((current) => ({ ...current, frequency_code: compactCode(event.target.value) }))}
                      required
                    />
                  </label>
                  <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium" title={t("pages.timePeriods.frequencyForm.nameHelp")}>
                    {t("pages.timePeriods.fields.name")}
                    <Input
                      value={frequencyForm.name}
                      onChange={(event) => setFrequencyForm((current) => ({ ...current, name: event.target.value }))}
                      required
                    />
                  </label>
                </section>

                <section className="flex min-w-0 flex-col gap-3">
                  <div className="flex items-start justify-between gap-2 [&_h3]:text-sm [&_h3]:font-semibold [&_p]:text-xs [&_p]:text-muted-foreground">
                    <span>{t("pages.timePeriods.frequencyForm.scheduleTitle")}</span>
                    <p>{t("pages.timePeriods.frequencyForm.scheduleDescription")}</p>
                  </div>
                  <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
                    <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium" title={t("pages.timePeriods.frequencyForm.monthsHelp")}>
                      {t("pages.timePeriods.fields.monthsInterval")}
                      <Input
                        type="number"
                        min="1"
                        value={frequencyForm.months_interval}
                        onChange={(event) => setFrequencyForm((current) => ({ ...current, months_interval: event.target.value }))}
                      />
                    </label>
                    <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium" title={t("pages.timePeriods.frequencyForm.sortHelp")}>
                      {t("pages.timePeriods.fields.sortOrder")}
                      <Input
                        type="number"
                        value={frequencyForm.sort_order}
                        onChange={(event) => setFrequencyForm((current) => ({ ...current, sort_order: Number(event.target.value) }))}
                      />
                    </label>
                  </div>
                  <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
                    <span>{t("pages.timePeriods.frequencies.monthInterval", { count: frequencyForm.months_interval || "-" })}</span>
                    <span>{t("pages.timePeriods.frequencyForm.sortSummary", { value: frequencyForm.sort_order ?? 0 })}</span>
                  </div>
                </section>

                <section className="flex min-w-0 flex-col gap-3">
                  <div className="flex items-start justify-between gap-2 [&_h3]:text-sm [&_h3]:font-semibold [&_p]:text-xs [&_p]:text-muted-foreground">
                    <span>{t("pages.timePeriods.frequencyForm.usageTitle")}</span>
                    <p>{t("pages.timePeriods.frequencyForm.usageDescription")}</p>
                  </div>
                  <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium" title={t("pages.timePeriods.frequencyForm.descriptionHelp")}>
                    {t("pages.timePeriods.fields.description")}
                    <Textarea
                      value={frequencyForm.description}
                      onChange={(event) => setFrequencyForm((current) => ({ ...current, description: event.target.value }))}
                    />
                  </label>
                </section>

                <section className="flex min-w-0 flex-col gap-3">
                  <div className="flex items-start justify-between gap-2 [&_h3]:text-sm [&_h3]:font-semibold [&_p]:text-xs [&_p]:text-muted-foreground">
                    <span>{t("pages.timePeriods.fields.availability")}</span>
                    <p>{t("pages.timePeriods.frequencyForm.availabilityDescription")}</p>
                  </div>
                  <BooleanField isSelected={frequencyForm.is_active}
                      onChange={(isSelected) => setFrequencyForm((current) => ({ ...current, is_active: isSelected }))}>

                    <span>{t("pages.timePeriods.filters.active")}</span>
                  </BooleanField>
                </section>

                <footer className="mt-auto flex shrink-0 flex-wrap items-center justify-end gap-2 border-t pt-4">
                  <Button variant="outline" type="button" onClick={() => setDrawer(null)}>{t("pages.timePeriods.actions.cancel")}</Button>
                  <Button type="submit" disabled={isSaving}>{t(isSaving ? "pages.timePeriods.actions.saving" : "pages.timePeriods.actions.saveFrequency")}</Button>
                </footer>
              </form>
            )}
          </div>
        </Sheet>
      )}
    </PageSection>
  );
}
