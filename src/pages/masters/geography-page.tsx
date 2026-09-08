import { StatusBadge } from "@/components/common/status-badge";
import { Loader } from "@/components/common/loader";
import { useConfirmation } from "@/hooks/use-confirmation";
import { normalizeStatusVariant } from "@/components/common/status-variants";
import { PageSection, PageHeader } from "@/components/common/page-layout";

import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { createDataTableColumnHelper, DataTable, useDataTable } from "@/components/data-table";
import {
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CustomTabs } from "@/components/common/custom-tabs";
import { cn } from "@/lib/utils";
import { Edit3, Ellipsis, GitBranch, MapPin, Plus, Search, Trash2 } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import {
  deactivateDimensionMemberSet,
  deactivateDimensionMemberSetItem,
  deactivateDimensionRollupRule,
  deactivateGeography,
  listDimensionMemberSetMembers,
  listDimensionMemberSets,
  listDimensionMembers,
  listDimensionRollupRules,
  listGeographies,
  listGeographyLevels,
  type DimensionMemberSet,
  type DimensionMemberSetItem,
  type DimensionMember,
  type DimensionRollupRule,
  type Geography,
  type GeographyLevel,
} from "../../api/dimensions.api";
import { clampPageOffset } from "../../utils/pagination";

type GeographyTab = "records" | "sets" | "rollups";
const geographyColumnHelper = createDataTableColumnHelper<Geography>();

const STANDARD_GEOGRAPHY_SETS = [
  {
    key: "national",
    label: "National",
    code: "GEOGRAPHY_NATIONAL",
    aliases: ["GEOGRAPHY_NATIONAL", "GEOGRAPHY_NATIONAL_COUNTRY"],
  },
  {
    key: "national_states",
    label: "National + States",
    code: "GEOGRAPHY_NATIONAL_STATES",
    aliases: ["GEOGRAPHY_NATIONAL_STATES", "GEOGRAPHY_NATIONAL_COUNTRY_STATES_UTS", "GEOGRAPHY_NATIONAL_STATES_UTS"],
  },
  {
    key: "states",
    label: "States",
    code: "GEOGRAPHY_STATES",
    aliases: ["GEOGRAPHY_STATES", "GEOGRAPHY_STATES_UTS_ONLY", "GEOGRAPHY_STATES_UTS"],
  },
] as const;

type StandardGeographySetKey = (typeof STANDARD_GEOGRAPHY_SETS)[number]["key"];

function textValue(value: unknown) {
  return value === undefined || value === null || value === "" ? "-" : String(value);
}

function formatDate(value: unknown) {
  if (!value) return "-";
  const date = new Date(String(value));
  if (Number.isNaN(date.getTime())) return textValue(value);
  return new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(date);
}

function geographyMemberCode(row: Geography | DimensionMember) {
  return String(row.member_code ?? ("geography_code" in row ? row.geography_code : "") ?? "");
}

function geographyDisplayName(row: Geography | DimensionMember | undefined, fallback: unknown) {
  return textValue(row?.name ?? row?.short_name ?? fallback);
}

function standardConfig(key: StandardGeographySetKey) {
  return STANDARD_GEOGRAPHY_SETS.find((config) => config.key === key) ?? STANDARD_GEOGRAPHY_SETS[0];
}

function findStandardSet(sets: DimensionMemberSet[], key: StandardGeographySetKey) {
  const config = standardConfig(key);
  return sets.find((set) => {
    const code = String(set.set_code ?? "").toUpperCase();
    const name = String(set.name ?? "").trim().toLowerCase();
    return (config.aliases as readonly string[]).includes(code) || name === config.label.toLowerCase();
  });
}

export function GeographyPage() {
  const confirm = useConfirmation();
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const [levels, setLevels] = useState<GeographyLevel[]>([]);
  const [rows, setRows] = useState<Geography[]>([]);
  const [sets, setSets] = useState<DimensionMemberSet[]>([]);
  const [setItems, setSetItems] = useState<Record<string, DimensionMemberSetItem[]>>({});
  const [members, setMembers] = useState<DimensionMember[]>([]);
  const [rollups, setRollups] = useState<DimensionRollupRule[]>([]);
  const [selectedSetCode, setSelectedSetCode] = useState("");
  const [activeTab, setActiveTab] = useState<GeographyTab>("records");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [levelFilter, setLevelFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ACTIVE");
  const [pageSize, setPageSize] = useState(25);
  const [offset, setOffset] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [catalogRows, setCatalogRows] = useState<Geography[]>([]);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const filteredRows = rows;
  const memberLookup = useMemo(() => {
    const lookup = new Map<string, DimensionMember | Geography>();
    members.forEach((member) => {
      if (member.member_code) lookup.set(member.member_code, member);
    });
    catalogRows.forEach((row) => {
      const code = geographyMemberCode(row);
      if (code && !lookup.has(code)) lookup.set(code, row);
    });
    return lookup;
  }, [catalogRows, members]);
  const selectedSet = useMemo(
    () => sets.find((set) => set.set_code === selectedSetCode) ?? null,
    [sets, selectedSetCode],
  );
  const selectedSetItems = selectedSet ? setItems[selectedSet.set_code ?? ""] ?? [] : [];
  const visibleGeographySets = useMemo(
    () =>
      STANDARD_GEOGRAPHY_SETS.map((config) => ({
        config,
        set: findStandardSet(sets, config.key),
      })),
    [sets],
  );

  async function loadPage() {
    setIsLoading(true);
    setError("");
    try {
      const [levelResponse, recordResponse, catalogResponse, memberResponse, setResponse, rollupResponse] = await Promise.all([
        listGeographyLevels(),
        listGeographies({
          levelCode: levelFilter,
          limit: pageSize,
          offset,
          searchText: debouncedQuery,
          statusFilter,
        }),
        listGeographies({ limit: 500, statusFilter: "ALL" }),
        listDimensionMembers("GEOGRAPHY", 1000).catch(() => ({ data: [] as DimensionMember[] })),
        listDimensionMemberSets("GEOGRAPHY").catch(() => ({ data: [] as DimensionMemberSet[] })),
        listDimensionRollupRules("GEOGRAPHY").catch(() => ({ data: [] as DimensionRollupRule[] })),
      ]);
      const nextSets = setResponse.data ?? [];
      setLevels(levelResponse.data ?? []);
      setRows(recordResponse.data ?? []);
      setTotalCount(recordResponse.count ?? recordResponse.data?.[0]?.total_count ?? recordResponse.data?.length ?? 0);
      setCatalogRows(catalogResponse.data ?? []);
      setMembers(memberResponse.data ?? []);
      setSets(nextSets);
      setRollups(rollupResponse.data ?? []);
      setSelectedSetCode((current) => {
        if (nextSets.some((set) => set.set_code === current)) return current;
        return STANDARD_GEOGRAPHY_SETS.map((config) => findStandardSet(nextSets, config.key)).find(Boolean)?.set_code ?? "";
      });
      const loadedItems = await Promise.all(
        nextSets
          .filter((set) => set.set_code)
          .map(async (set) => {
            const response = await listDimensionMemberSetMembers(set.set_code ?? "").catch(() => ({ data: [] as DimensionMemberSetItem[] }));
            return [set.set_code ?? "", response.data ?? []] as const;
          }),
      );
      setSetItems(Object.fromEntries(loadedItems));
    } catch (loadError) {
      setRows([]);
      setTotalCount(0);
      setCatalogRows([]);
      setError(loadError instanceof Error ? loadError.message : "Geography records could not be loaded.");
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedQuery(query);
      setOffset(0);
    }, 280);
    return () => window.clearTimeout(timer);
  }, [query]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadPage();
    }, 0);
    return () => window.clearTimeout(timer);
  }, [debouncedQuery, levelFilter, statusFilter, pageSize, offset]);

  useEffect(() => {
    const nextOffset = clampPageOffset(offset, pageSize, totalCount);
    if (nextOffset === offset) return;
    const timer = window.setTimeout(() => setOffset(nextOffset), 0);
    return () => window.clearTimeout(timer);
  }, [offset, pageSize, totalCount]);

  function selectOrCreateStandardSet(key: StandardGeographySetKey) {
    const existing = findStandardSet(sets, key);
    if (existing?.set_code) {
      setSelectedSetCode(existing.set_code);
      return;
    }
    navigate(`/masters/geography/member-sets/create?preset=${key}`);
  }

  async function removeGeography(row: Geography) {
    if (!row.geography_code) return;
    if (isSaving || !(await confirm(t("confirmation.remove")))) return;
    setIsSaving(true);
    setError("");
    try {
      await deactivateGeography(row.geography_code);
      toast.success(t("pages.geographies.notifications.deactivated"));
      await loadPage();
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Geography could not be deactivated.");
    } finally {
      setIsSaving(false);
    }
  }

  async function removeGeographySet(set: DimensionMemberSet) {
    if (!set.set_code) return;
    if (isSaving || !(await confirm(t("confirmation.remove")))) return;
    setIsSaving(true);
    setError("");
    try {
      await deactivateDimensionMemberSet("GEOGRAPHY", set.set_code);
      toast.success(t("pages.geographies.notifications.setDeactivated"));
      await loadPage();
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Geography member set could not be deactivated.");
    } finally {
      setIsSaving(false);
    }
  }

  async function removeSavedSetItem(setCode: string, memberCode: string) {
    if (!setCode || !memberCode) return;
    if (isSaving || !(await confirm(t("confirmation.remove")))) return;
    setIsSaving(true);
    setError("");
    try {
      await deactivateDimensionMemberSetItem(setCode, memberCode);
      toast.success(t("pages.geographies.notifications.memberRemoved"));
      await loadPage();
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Geography member could not be removed from set.");
    } finally {
      setIsSaving(false);
    }
  }

  async function removeRollup(rollup: DimensionRollupRule) {
    if (isSaving || !(await confirm(t("confirmation.remove")))) return;
    setIsSaving(true);
    setError("");
    try {
      await deactivateDimensionRollupRule("GEOGRAPHY", rollup);
      toast.success(t("pages.geographies.notifications.rollupDeactivated"));
      await loadPage();
    } catch (removeError) {
      setError(removeError instanceof Error ? removeError.message : "Geography rollup could not be deactivated.");
    } finally {
      setIsSaving(false);
    }
  }

  const geographyColumns = geographyColumnHelper.columns([
    geographyColumnHelper.display({ id: "geography", header: t("pages.geographies.table.geography"), cell: ({ row }) => <div className="flex min-w-0 flex-col gap-1 [&>span]:text-xs [&>span]:text-muted-foreground"><strong>{textValue(row.original.name)}</strong><span>{textValue(row.original.geography_code)}</span></div> }),
    geographyColumnHelper.accessor("level_name", { header: t("pages.geographies.table.level"), cell: ({ row }) => textValue(row.original.level_name ?? row.original.level_code) }),
    geographyColumnHelper.display({ id: "parent", header: t("pages.geographies.table.parent"), cell: ({ row }) => textValue(row.original.parent_geography_name ?? row.original.parent_geography_code) }),
    geographyColumnHelper.display({ id: "codes", header: t("pages.geographies.table.codes"), cell: ({ row }) => [row.original.iso_alpha2_code, row.original.iso_alpha3_code, row.original.census_code].filter(Boolean).join(" / ") || "-" }),
    geographyColumnHelper.accessor("effective_from", { header: t("pages.geographies.table.effectiveFrom"), cell: ({ getValue }) => formatDate(getValue()) }),
    geographyColumnHelper.display({ id: "status", header: t("pages.geographies.table.status"), cell: ({ row }) => <StatusBadge variant={normalizeStatusVariant(`${row.original.is_active === false ? "inactive" : "active"}`)}>{t(row.original.is_active === false ? "pages.geographies.table.inactive" : "pages.geographies.table.active")}</StatusBadge> }),
    geographyColumnHelper.display({
      id: "actions",
      header: () => <span className="block text-right">{t("pages.geographies.table.actions")}</span>,
      enableSorting: false,
      enableGlobalFilter: false,
      cell: ({ row }) => (
        <div className="flex justify-end" onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
          <DropdownMenuTrigger>
            <Button type="button" variant="ghost" size="icon-sm" aria-label={t("pages.geographies.table.actionsFor", { name: textValue(row.original.name) })}>
              <Ellipsis aria-hidden="true" />
            </Button>
            <DropdownMenu aria-label={t("pages.geographies.table.actionsFor", { name: textValue(row.original.name) })} className="min-w-40" placement="bottom end">
              <DropdownMenuLabel>{t("pages.geographies.table.menuLabel")}</DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem id="edit" onAction={() => navigate(`/masters/geography/${encodeURIComponent(row.original.geography_code ?? "")}/edit`)}>
                  <Edit3 aria-hidden="true" />
                  {t("pages.geographies.table.edit")}
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem id="deactivate" variant="destructive" isDisabled={isSaving} onAction={() => void removeGeography(row.original)}>
                  <Trash2 aria-hidden="true" />
                  {t("pages.geographies.table.deactivate")}
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenu>
          </DropdownMenuTrigger>
        </div>
      ),
    }),
  ]);
  const geographyTable = useDataTable({
    columns: geographyColumns,
    data: filteredRows,
    state: { pagination: { pageIndex: Math.floor(offset / pageSize), pageSize } },
    onPaginationChange: (updater) => {
      const current = { pageIndex: Math.floor(offset / pageSize), pageSize };
      const next = typeof updater === "function" ? updater(current) : updater;
      setPageSize(next.pageSize);
      setOffset(next.pageIndex * next.pageSize);
    },
    manualPagination: true,
    rowCount: totalCount,
    getRowId: (row) => row.geography_code ?? "",
    enableMultiSort: false,
    enableRowSelection: false,
    autoResetPageIndex: false,
  });

  return (
    <PageSection className="flex min-w-0 flex-col gap-4">
      <PageHeader>
        <div>
          <h2>{t("pages.geographies.title")}</h2>
          <p>{t("pages.geographies.description")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" onPress={() => navigate("/masters/geography/create")}>
            <Plus data-icon="inline-start" aria-hidden="true" />
            {t("pages.geographies.add")}
          </Button>
        </div>
      </PageHeader>

      {error && <div className="rounded-md bg-muted p-3 text-sm text-destructive">{error}</div>}

      <section className="grid grid-cols-1 gap-2 rounded-md bg-muted/50 p-2 md:grid-cols-4" aria-label={t("pages.geographies.filtersLabel")}>
        <InputGroup className="md:col-span-2">
          <InputGroupAddon><Search aria-hidden="true" /></InputGroupAddon>
          <InputGroupInput
            aria-label={t("pages.geographies.search")}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("pages.geographies.search")}
          />
        </InputGroup>
        <Select
          className="min-w-0 w-full"
          aria-label={t("pages.geographies.levelFilter")}
          selectedKey={levelFilter}
          onSelectionChange={(key) => { setLevelFilter(String(key)); setOffset(0); }}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent className="w-max max-w-[calc(100vw-2rem)]">
            <SelectGroup>
              <SelectItem id="ALL">{t("pages.geographies.allLevels")}</SelectItem>
              {levels.map((level) => <SelectItem id={level.level_code} key={level.level_code}>{level.name ?? level.level_code}</SelectItem>)}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select
          className="min-w-0 w-full"
          aria-label={t("pages.geographies.statusFilter")}
          selectedKey={statusFilter}
          onSelectionChange={(key) => { setStatusFilter(String(key)); setOffset(0); }}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectItem id="ACTIVE">{t("pages.geographies.table.active")}</SelectItem>
              <SelectItem id="INACTIVE">{t("pages.geographies.table.inactive")}</SelectItem>
              <SelectItem id="ALL">{t("pages.geographies.allStatuses")}</SelectItem>
            </SelectGroup>
          </SelectContent>
        </Select>
      </section>

      <CustomTabs
        className="min-h-0 flex-1 overflow-hidden"
        variant="underline"
        value={activeTab}
        onValueChange={(key) => setActiveTab(String(key) as GeographyTab)}
        compact
        ariaLabel={t("pages.geographies.tabsLabel")}
        contentClassName="flex min-h-0 flex-1 overflow-hidden"
        items={[{ value: "records", label: t("pages.geographies.tabs.records") },
          { value: "sets", label: t("pages.geographies.tabs.sets") },
          { value: "rollups", label: t("pages.geographies.tabs.rollups") }].map((tab) => ({ ...tab, content: (<><section className="flex min-h-0 min-w-0 flex-1 flex-col overflow-y-auto">
        {isLoading && activeTab !== "records" && <Loader text={t("pages.geographies.table.loading")} />}

        {activeTab === "records" && (
          <DataTable
            table={geographyTable}
            ariaLabel={t("pages.geographies.table.label")}
            className="flex min-h-0 flex-1 flex-col"
            scrollContainerClassName="min-h-0 flex-1 overflow-y-auto [&_thead]:sticky [&_thead]:top-0 [&_thead]:z-10"
            isLoading={isLoading}
            loadingMessage={t("pages.geographies.table.loading")}
            emptyMessage={t("pages.geographies.table.empty")}
            pageSizeOptions={[10, 25, 50, 100]}
            totalCount={totalCount}
          />
        )}

        {!isLoading && activeTab === "sets" && (
          <div className="grid min-h-0 flex-1 grid-cols-1 gap-3 overflow-y-auto lg:grid-cols-[minmax(18rem,22rem)_minmax(0,1fr)] lg:overflow-hidden">
            <Card className="min-h-72 gap-0 overflow-hidden py-0 lg:min-h-0">
              <CardHeader className="flex flex-row items-center justify-between gap-3 border-b p-4">
                <div className="min-w-0">
                  <CardTitle>{t("pages.geographies.memberSets.title")}</CardTitle>
                  <CardDescription>{t("pages.geographies.memberSets.description")}</CardDescription>
                </div>
                <Button type="button" size="sm" variant="outline" onPress={() => navigate("/masters/geography/member-sets/create")}>
                  <Plus data-icon="inline-start" aria-hidden="true" />
                  {t("pages.geographies.memberSets.new")}
                </Button>
              </CardHeader>
              <CardContent className="flex min-h-0 flex-col gap-2 overflow-y-auto p-2">
              {visibleGeographySets.map(({ config, set }) => (
                <div
                  className={cn("flex items-center gap-1 rounded-md p-1 transition-colors hover:bg-muted/50", Boolean(set && selectedSet && set.set_code === selectedSet.set_code) && "bg-accent")}
                  key={config.key}
                >
                  <Button className="h-auto min-w-0 flex-1 justify-start px-2 py-2 text-left" variant="ghost" type="button" onPress={() => selectOrCreateStandardSet(config.key)}>
                    <span className="flex min-w-0 flex-col items-start gap-0.5">
                      <strong className="truncate text-sm">{config.label}</strong>
                      <span className="w-full truncate text-xs font-normal text-muted-foreground">
                        {set ? `${textValue(set.set_code)} · ${textValue(set.set_type)}` : t("pages.geographies.memberSets.notConfigured")}
                      </span>
                      <small className="text-xs font-medium text-muted-foreground">
                        {set ? t("pages.geographies.memberSets.memberCount", { count: (setItems[set.set_code ?? ""] ?? []).length }) : t("pages.geographies.memberSets.createHint")}
                      </small>
                    </span>
                  </Button>
                  {set ? (
                    <DropdownMenuTrigger>
                      <Button type="button" variant="ghost" size="icon-sm" aria-label={t("pages.geographies.memberSets.actionsFor", { name: config.label })}>
                        <Ellipsis aria-hidden="true" />
                      </Button>
                      <DropdownMenu aria-label={t("pages.geographies.memberSets.actionsFor", { name: config.label })} className="min-w-40" placement="bottom end">
                        <DropdownMenuLabel>{t("pages.geographies.memberSets.actions")}</DropdownMenuLabel>
                        <DropdownMenuGroup>
                          <DropdownMenuItem id="edit" onAction={() => navigate(`/masters/geography/member-sets/${encodeURIComponent(set.set_code ?? "")}/edit`)}><Edit3 aria-hidden="true" />{t("pages.geographies.memberSets.edit")}</DropdownMenuItem>
                        </DropdownMenuGroup>
                        <DropdownMenuSeparator />
                        <DropdownMenuGroup>
                          <DropdownMenuItem id="deactivate" variant="destructive" isDisabled={isSaving} onAction={() => void removeGeographySet(set)}><Trash2 aria-hidden="true" />{t("pages.geographies.memberSets.deactivate")}</DropdownMenuItem>
                        </DropdownMenuGroup>
                      </DropdownMenu>
                    </DropdownMenuTrigger>
                  ) : (
                    <Button type="button" variant="ghost" size="icon-sm" aria-label={t("pages.geographies.memberSets.create", { name: config.label })} onPress={() => navigate(`/masters/geography/member-sets/create?preset=${config.key}`)}><Plus aria-hidden="true" /></Button>
                  )}
                </div>
              ))}
              </CardContent>
            </Card>
            <Card className="min-h-72 gap-0 overflow-hidden py-0 lg:min-h-0">
              <CardHeader className="flex flex-row items-center justify-between gap-3 border-b p-4">
                <div className="min-w-0">
                  <CardTitle>{textValue(selectedSet?.name ?? t("pages.geographies.memberSets.selectTitle"))}</CardTitle>
                  <CardDescription>{selectedSet ? textValue(selectedSet.set_code) : t("pages.geographies.memberSets.selectDescription")}</CardDescription>
                </div>
                {selectedSet && (
                  <Button type="button" size="sm" variant="outline" onPress={() => navigate(`/masters/geography/member-sets/${encodeURIComponent(selectedSet.set_code ?? "")}/edit`)}>
                    <Edit3 data-icon="inline-start" aria-hidden="true" />
                    {t("pages.geographies.memberSets.edit")}
                  </Button>
                )}
              </CardHeader>
              <CardContent className="min-h-0 overflow-y-auto p-4">
                {selectedSetItems.length ? selectedSetItems.map((item, index) => {
                  const member = memberLookup.get(textValue(item.member_code));
                  return (
                    <div className="flex items-center gap-3 border-b py-2 last:border-b-0" key={`${item.member_code}-${index}`}>
                      <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-muted text-xs font-medium">{index + 1}</span>
                      <span className="flex min-w-0 flex-1 flex-col">
                        <strong className="truncate text-sm font-medium">{geographyDisplayName(member, item.member_name ?? item.member_code)}</strong>
                        <small className="truncate text-xs text-muted-foreground">{textValue(item.member_code)}</small>
                      </span>
                      <Button type="button" variant="ghost" size="icon-sm" aria-label={t("pages.geographies.memberSets.remove", { name: geographyDisplayName(member, item.member_name ?? item.member_code) })} disabled={isSaving} onPress={() => void removeSavedSetItem(selectedSet?.set_code ?? "", item.member_code ?? "")}>
                        <Trash2 aria-hidden="true" />
                      </Button>
                    </div>
                  );
                }) : (
                  <Empty className="min-h-64 border-0">
                    <EmptyHeader>
                      <EmptyMedia variant="icon"><MapPin aria-hidden="true" /></EmptyMedia>
                      <EmptyTitle>{selectedSet ? t("pages.geographies.memberSets.emptyTitle") : t("pages.geographies.memberSets.selectTitle")}</EmptyTitle>
                      <EmptyDescription>{selectedSet ? t("pages.geographies.memberSets.emptyDescription") : t("pages.geographies.memberSets.selectDescription")}</EmptyDescription>
                    </EmptyHeader>
                    {selectedSet && <EmptyContent><Button type="button" size="sm" onPress={() => navigate(`/masters/geography/member-sets/${encodeURIComponent(selectedSet.set_code ?? "")}/edit`)}><Plus data-icon="inline-start" aria-hidden="true" />{t("pages.geographies.memberSets.addMembers")}</Button></EmptyContent>}
                  </Empty>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {!isLoading && activeTab === "rollups" && (
          <Card className="min-h-0 flex-1 gap-0 overflow-hidden py-0">
            <CardHeader className="flex flex-row items-center justify-between gap-3 border-b p-4">
              <div className="min-w-0">
                <CardTitle>{t("pages.geographies.rollups.title")}</CardTitle>
                <CardDescription>{t("pages.geographies.rollups.description")}</CardDescription>
              </div>
              <Button type="button" size="sm" onPress={() => navigate("/masters/geography/rollups/create")}>
                <Plus data-icon="inline-start" aria-hidden="true" />
                {t("pages.geographies.rollups.add")}
              </Button>
            </CardHeader>
            <CardContent className="min-h-0 overflow-y-auto p-4">
              {rollups.length ? (
                <Accordion>
                  {rollups.map((rollup, index) => {
                    const parentName = textValue(rollup.parent_member_name ?? rollup.parent_member_code);
                    const children = rollup.children ?? [];
                    return (
                      <AccordionItem className="relative" id={`${rollup.parent_member_code}-${rollup.rule_code}-${index}`} key={`${rollup.parent_member_code}-${rollup.rule_code}-${index}`}>
                        <AccordionTrigger className="min-h-16 items-center py-3 pr-20 pl-3 no-underline hover:no-underline">
                          <span className="flex min-w-0 flex-1 flex-col gap-1">
                            <span className="flex flex-wrap items-center gap-x-3 gap-y-1">
                              <strong className="text-sm">{parentName}</strong>
                              <StatusBadge variant={normalizeStatusVariant(rollup.is_active === false ? "INACTIVE" : "ACTIVE")}>
                                {t(rollup.is_active === false ? "pages.geographies.table.inactive" : "pages.geographies.table.active")}
                              </StatusBadge>
                            </span>
                            <span className="truncate text-xs font-normal text-muted-foreground">
                              {textValue(rollup.rule_code)} · {textValue(rollup.entry_mode)} · {textValue(rollup.aggregation_method)} · {t("pages.geographies.rollups.childCount", { count: children.length })}
                            </span>
                          </span>
                        </AccordionTrigger>
                        <div className="absolute top-4 right-9">
                          <DropdownMenuTrigger>
                            <Button type="button" variant="ghost" size="icon-sm" aria-label={t("pages.geographies.rollups.actionsFor", { name: parentName })}>
                              <Ellipsis aria-hidden="true" />
                            </Button>
                            <DropdownMenu aria-label={t("pages.geographies.rollups.actionsFor", { name: parentName })} className="min-w-40" placement="bottom end">
                              <DropdownMenuLabel>{t("pages.geographies.rollups.actions")}</DropdownMenuLabel>
                              <DropdownMenuGroup>
                                <DropdownMenuItem id="edit" onAction={() => navigate(`/masters/geography/rollups/${encodeURIComponent(rollup.rule_code ?? "")}/edit`)}><Edit3 aria-hidden="true" />{t("pages.geographies.rollups.edit")}</DropdownMenuItem>
                              </DropdownMenuGroup>
                              <DropdownMenuSeparator />
                              <DropdownMenuGroup>
                                <DropdownMenuItem id="deactivate" variant="destructive" isDisabled={isSaving} onAction={() => void removeRollup(rollup)}><Trash2 aria-hidden="true" />{t("pages.geographies.rollups.deactivate")}</DropdownMenuItem>
                              </DropdownMenuGroup>
                            </DropdownMenu>
                          </DropdownMenuTrigger>
                        </div>
                        <AccordionContent className="px-3">
                          <div className="border-t pt-3">
                            <p className="mb-2 font-medium text-foreground">{t("pages.geographies.rollups.children")}</p>
                            {children.length ? (
                              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-3">
                                {children.map((child, childIndex) => (
                                  <div className="flex min-w-0 items-center gap-2 rounded-md border bg-background px-3 py-2" key={`${rollup.rule_code}-${childIndex}`}>
                                    <MapPin className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                                    <span className="truncate">{textValue(child.member_name ?? child.child_member_name ?? child.member_code ?? child.child_member_code)}</span>
                                  </div>
                                ))}
                              </div>
                            ) : <p className="text-muted-foreground">{t("pages.geographies.rollups.noChildren")}</p>}
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    );
                  })}
                </Accordion>
              ) : (
                <Empty className="min-h-64 border-0">
                  <EmptyHeader>
                    <EmptyMedia variant="icon"><GitBranch aria-hidden="true" /></EmptyMedia>
                    <EmptyTitle>{t("pages.geographies.rollups.emptyTitle")}</EmptyTitle>
                    <EmptyDescription>{t("pages.geographies.rollups.emptyDescription")}</EmptyDescription>
                  </EmptyHeader>
                  <EmptyContent><Button type="button" size="sm" onPress={() => navigate("/masters/geography/rollups/create")}><Plus data-icon="inline-start" aria-hidden="true" />{t("pages.geographies.rollups.add")}</Button></EmptyContent>
                </Empty>
              )}
            </CardContent>
          </Card>
        )}
        </section></>) }))}
      />
    </PageSection>
  );
}
