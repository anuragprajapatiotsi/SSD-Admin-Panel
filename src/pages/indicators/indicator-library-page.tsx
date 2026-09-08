import { useConfirmation } from "@/hooks/use-confirmation";
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty";

import { Sheet, SheetTitle } from "@/components/ui/sheet";

import { PageHeader } from "@/components/common/page-layout";
import { NativeSelectOption, NativeSelect } from "@/components/ui/native-select";
import { Input } from "@/components/ui/input";

import { Button } from "@/components/ui/button";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ButtonGroup } from "@/components/ui/button-group";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { createDataTableColumnHelper, DataTable, useDataTable } from "@/components/data-table";
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
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip";
import { ArrowLeft, CheckCircle2, Database, Edit3, Ellipsis, ExternalLink, Eye, FileText, Plus, Search, Trash2 } from "lucide-react";
import type { ReactNode } from "react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import type { PaginationState } from "@tanstack/react-table";
import { useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  deleteIndicator,
  getIndicator,
  listGlobalIndicators,
  listIndicators,
  saveGlobalIndicatorMapping,
  type GlobalIndicatorListItem,
  type GlobalIndicatorMapping,
  type FrameworkIndicatorMapping,
  type FrameworkMappedNode,
  type IndicatorDetail,
  type IndicatorListItem,
  type IndicatorMeasure,
  type IndicatorMetadataDetail,
  type PublishedTemplateUsage,
  type IndicatorVersion,
} from "../../api/indicators.api";
import {
  getFrameworkHierarchy,
  listFrameworkEditions,
  type FrameworkEdition,
  type FrameworkHierarchy,
  type FrameworkNode,
} from "../../api/framework.api";
import { listMasterRecords, type MasterRecord } from "../../api/masters-reference.api";
import {
  getSelectedUnitCode,
  listAvailableUnits,
  LOCALE_CHANGED_EVENT,
  selectedUnitGlobalMappingEnabled,
  UNIT_CHANGED_EVENT,
} from "../../api/session.api";
import { Loader } from "../../components/common/loader";

type IndicatorStatusFilter = "ALL" | "ACTIVE" | "DRAFT" | "INACTIVE";
type DetailTab = "overview" | "mapping" | "measures" | "usage" | "history";
type MappingPanel = "" | "global" | "source" | "periodicity" | "sourceOfficer" | "uom" | "measure";
type MappingMetaItem = { label: string; value: unknown };
type MetadataNotes = Record<string, unknown>;
type LooseRecord = Record<string, unknown>;
const indicatorColumnHelper = createDataTableColumnHelper<IndicatorListItem>();

function textValue(value: unknown): string {
  return value === undefined || value === null || value === "" ? "-" : String(value);
}

function compactDate(value?: string | null) {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return value;
  return parsed.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function getIndicatorName(indicator: IndicatorListItem | IndicatorDetail) {
  return indicator.name || indicator.national_indicator_code || "Indicator";
}

function getIndicatorCode(indicator: IndicatorListItem | IndicatorDetail) {
  return indicator.national_indicator_code || indicator.indicator_number || "";
}

function indicatorHexColor(value?: string | null) {
  const color = value?.trim();
  if (!color) return null;
  if (/^#[0-9a-f]{6}$/i.test(color)) return color;
  if (/^#[0-9a-f]{3}$/i.test(color)) {
    return `#${color.slice(1).split("").map((character) => character.repeat(2)).join("")}`;
  }
  return null;
}

function indicatorColorForeground(color: string) {
  const red = Number.parseInt(color.slice(1, 3), 16);
  const green = Number.parseInt(color.slice(3, 5), 16);
  const blue = Number.parseInt(color.slice(5, 7), 16);
  const luminance = (red * 299 + green * 587 + blue * 114) / 255000;
  return luminance > 0.56 ? "#0f172a" : "#ffffff";
}

function overviewOf(detail?: IndicatorDetail | null): IndicatorListItem {
  return detail?.overview ?? detail ?? ({} as IndicatorListItem);
}

function asRecord(value: unknown): LooseRecord | undefined {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as LooseRecord) : undefined;
}

function firstRecordValue(records: Array<LooseRecord | undefined>, keys: string[]) {
  for (const record of records) {
    if (!record) continue;
    for (const key of keys) {
      const value = record[key];
      if (value !== undefined && value !== null && value !== "") return value;
    }
  }
  return undefined;
}

function formatIngestionMethod(value: unknown) {
  const text = textValue(value);
  if (text === "-") return "-";
  return text
    .replace(/_/g, " ")
    .toLowerCase()
    .replace(/\b\w/g, (match) => match.toUpperCase());
}

function jsonDisplayValue(value: unknown) {
  if (value === undefined || value === null || value === "") {
    return { message: "No ingestion JSON structure has been recorded for this indicator yet." };
  }
  if (typeof value === "string") {
    try {
      return JSON.parse(value);
    } catch {
      return value;
    }
  }
  return value;
}

function buildIngestionInfo(records: Array<LooseRecord | undefined>) {
  const method = firstRecordValue(records, [
    "ingestion_method",
    "latest_ingestion_method",
    "latest_submission_method",
    "last_submission_method",
    "submission_method",
    "data_submission_method",
    "source_type",
    "ingestion_source_type",
  ]);
  const lastMethod = firstRecordValue(records, [
    "latest_submission_method",
    "last_submission_method",
    "submission_method",
    "data_submission_method",
  ]);
  const source = firstRecordValue(records, [
    "ingestion_source_name",
    "ingestion_source",
    "source_name",
    "source_type",
    "ingestion_source_type",
  ]);
  const lastSubmittedBy = firstRecordValue(records, [
    "last_submitted_by",
    "submitted_by",
    "latest_submitted_by",
    "working_by_officer",
    "last_working_by_officer",
  ]);
  const lastSubmittedAt = firstRecordValue(records, [
    "last_submitted_at",
    "submitted_at",
    "latest_submitted_at",
    "last_submission_at",
    "updated_at",
  ]);
  const apiUrl = firstRecordValue(records, ["ingestion_api_url", "api_url", "url", "source_url"]);
  const apiMethod = firstRecordValue(records, ["ingestion_api_method", "api_method", "method"]);
  const credentialsHash = firstRecordValue(records, ["ingestion_credentials_hash", "credentials_hash", "auth_hash"]);
  const jsonStructure = firstRecordValue(records, [
    "ingestion_json_structure",
    "api_json_structure",
    "json_structure",
    "sample_response_schema",
    "response_schema",
  ]);
  return {
    method: formatIngestionMethod(method),
    source: textValue(source),
    lastSubmissionMethod: formatIngestionMethod(lastMethod),
    lastSubmittedBy: textValue(lastSubmittedBy),
    lastSubmittedAt: lastSubmittedAt ? compactDate(String(lastSubmittedAt)) : "-",
    apiUrl: textValue(apiUrl),
    apiMethod: textValue(apiMethod),
    credentialsHash: textValue(credentialsHash),
    jsonStructure: jsonDisplayValue(jsonStructure),
  };
}

function firstMeasure(detail?: IndicatorDetail | null): IndicatorMeasure | undefined {
  return detail?.measures?.[0];
}

function firstVersion(detail?: IndicatorDetail | null): IndicatorVersion | undefined {
  return detail?.versions?.find((version) => version.is_current) ?? detail?.versions?.[0];
}

function firstMetadata(detail?: IndicatorDetail | null): IndicatorMetadataDetail | undefined {
  return detail?.metadata?.[0];
}

function firstGlobalMapping(detail?: IndicatorDetail | null): GlobalIndicatorMapping | undefined {
  return detail?.global_indicator_mappings?.[0];
}

function firstFrameworkMapping(detail?: IndicatorDetail | null): FrameworkIndicatorMapping | undefined {
  return detail?.framework_mappings?.find((mapping) => mapping.mapping_type === "PRIMARY") ?? detail?.framework_mappings?.[0];
}

function parseMetadataNotes(notes?: string | null): MetadataNotes {
  if (!notes) return {};
  try {
    const parsed = JSON.parse(notes);
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : {};
  } catch {
    return {};
  }
}

function noteValue(notes: MetadataNotes, keys: string[]) {
  for (const key of keys) {
    if (notes[key] !== undefined && notes[key] !== null && notes[key] !== "") return notes[key];
  }
  return undefined;
}

function optionLabel(record: MasterRecord, codeKey: string, nameKeys: string[]) {
  const code = textValue(record[codeKey]);
  const name = nameKeys.map((key) => record[key]).find(Boolean);
  return `${textValue(name)} (${code})`;
}

function usageSourceTitle(item: PublishedTemplateUsage) {
  const ministry = item.ministry_name ?? item.ministry_organization_code;
  const department = item.department_organization_name ?? item.source_organization_name ?? item.source_organization_code;
  if (ministry && department && String(ministry) !== String(department)) {
    return `${textValue(ministry)} / ${textValue(department)}`;
  }
  return textValue(department ?? ministry);
}

function usageKey(item: PublishedTemplateUsage, suffix = "") {
  return [
    item.template_code ?? "",
    item.version_code ?? "",
    item.template_measure_code ?? item.measure_code ?? "",
    item.source_organization_code ?? "",
    item.access_role ?? "",
    suffix,
  ].join("|");
}

function uniquePublishedUsage(records: PublishedTemplateUsage[], keySelector: (record: PublishedTemplateUsage) => string) {
  const seen = new Set<string>();
  return records.filter((record) => {
    const key = keySelector(record);
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function indicatorTargetNodes(hierarchy?: FrameworkHierarchy | null): FrameworkNode[] {
  if (!hierarchy) return [];
  const mappingLevels = hierarchy.levels.filter((level) => level.is_active !== false && level.allows_indicator_mapping);
  const fallbackLevel = hierarchy.levels
    .filter((level) => level.is_active !== false)
    .sort((left, right) => Number(right.level_number ?? 0) - Number(left.level_number ?? 0))[0];
  const allowedLevelCodes = new Set((mappingLevels.length ? mappingLevels : fallbackLevel ? [fallbackLevel] : []).map((level) => level.level_code));
  return hierarchy.nodes
    .filter((node) => node.is_active !== false && allowedLevelCodes.has(node.level_code))
    .sort((left, right) => {
      const leftNumber = left.node_number ?? left.node_code;
      const rightNumber = right.node_number ?? right.node_code;
      return String(leftNumber).localeCompare(String(rightNumber), undefined, { numeric: true });
    });
}

function parentNodeForTarget(targetNodeCode: string, hierarchy?: FrameworkHierarchy | null): FrameworkNode | undefined {
  const relationship = hierarchy?.relationships.find(
    (candidate) => candidate.is_active !== false && candidate.child_node_code === targetNodeCode,
  );
  return relationship ? hierarchy?.nodes.find((candidate) => candidate.node_code === relationship.parent_node_code) : undefined;
}

function frameworkMappedNodeFromHierarchyNode(node: FrameworkNode, hierarchy?: FrameworkHierarchy | null): FrameworkMappedNode {
  const level = hierarchy?.levels.find((candidate) => candidate.level_code === node.level_code);
  return {
    node_code: node.node_code,
    node_number: node.node_number,
    name: node.name,
    short_name: node.short_name,
    level_code: node.level_code,
    level_number: level?.level_number,
    level_name: level?.name ?? node.level_code,
    color_value: node.color_value,
    color_method: node.color_method,
  };
}

function frameworkHierarchyPathForMappedNode(
  mappedNode?: FrameworkMappedNode,
  hierarchy?: FrameworkHierarchy | null,
  fallbackParents: FrameworkMappedNode[] = [],
): FrameworkMappedNode[] {
  if (!mappedNode?.node_code) {
    return [];
  }
  const nodeByCode = new Map((hierarchy?.nodes ?? []).map((node) => [node.node_code, node]));
  const parentByChild = new Map(
    (hierarchy?.relationships ?? [])
      .filter((relationship) => relationship.is_active !== false)
      .map((relationship) => [relationship.child_node_code, relationship.parent_node_code]),
  );
  const path: FrameworkMappedNode[] = [];
  const visited = new Set<string>();
  let currentCode: string | undefined = mappedNode.node_code;
  while (currentCode && !visited.has(currentCode)) {
    visited.add(currentCode);
    const currentNode = nodeByCode.get(currentCode);
    path.unshift(currentNode ? frameworkMappedNodeFromHierarchyNode(currentNode, hierarchy) : mappedNode);
    currentCode = parentByChild.get(currentCode);
  }

  const fallbackPath = [...fallbackParents, mappedNode].filter((node) => Boolean(node.node_code));
  const resolvedPath = path.length > 1 ? path : fallbackPath;
  return resolvedPath
    .filter((node, index, items) => items.findIndex((candidate) => candidate.node_code === node.node_code) === index)
    .sort((left, right) => Number(left.level_number ?? 0) - Number(right.level_number ?? 0));
}

function indicatorParentNodes(hierarchy?: FrameworkHierarchy | null): FrameworkNode[] {
  const targets = indicatorTargetNodes(hierarchy);
  const parentCodes = new Set(
    targets
      .map((target) => parentNodeForTarget(target.node_code, hierarchy)?.node_code)
      .filter((nodeCode): nodeCode is string => Boolean(nodeCode)),
  );
  return hierarchy?.nodes
    .filter((node) => node.is_active !== false && parentCodes.has(node.node_code))
    .sort((left, right) => {
      const leftNumber = left.node_number ?? left.node_code;
      const rightNumber = right.node_number ?? right.node_code;
      return String(leftNumber).localeCompare(String(rightNumber), undefined, { numeric: true });
    }) ?? [];
}

function fullFrameworkNodeFilterLabel(node?: FrameworkNode): string {
  if (!node) return "";
  return [node.node_number ?? node.node_code, node.name ?? node.short_name].filter(Boolean).join(" - ");
}

function levelNameForNode(node?: FrameworkNode, hierarchy?: FrameworkHierarchy | null): string {
  if (!node) return "Level";
  const level = hierarchy?.levels.find((candidate) => candidate.level_code === node.level_code);
  return level?.name ?? node.level_code;
}

export function IndicatorLibraryPage({ routeIndicatorCode }: { routeIndicatorCode?: string } = {}) {
  const confirm = useConfirmation();
  const navigate = useNavigate();
  const { t } = useTranslation(["ingestion", "common"]);
  const [searchParams, setSearchParams] = useSearchParams();
  const [indicators, setIndicators] = useState<IndicatorListItem[]>([]);
  const [detailCache, setDetailCache] = useState<Record<string, IndicatorDetail>>({});
  const [selectedCode, setSelectedCode] = useState(routeIndicatorCode ?? "");
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [periodicityFilter, setPeriodicityFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState<IndicatorStatusFilter>("ALL");
  const [uomFilter, setUomFilter] = useState("");
  const [goalFilter, setGoalFilter] = useState("");
  const [pagination, setPagination] = useState<PaginationState>({ pageIndex: 0, pageSize: 25 });
  const [totalCount, setTotalCount] = useState(0);
  const [activeTab, setActiveTab] = useState<DetailTab>("overview");
  const [organizations, setOrganizations] = useState<MasterRecord[]>([]);
  const [periodicities, setPeriodicities] = useState<MasterRecord[]>([]);
  const [uoms, setUoms] = useState<MasterRecord[]>([]);
  const [globalIndicators, setGlobalIndicators] = useState<GlobalIndicatorListItem[]>([]);
  const [globalMappingEnabled, setGlobalMappingEnabled] = useState(() => getSelectedUnitCode() === "SDG");
  const [officers, setOfficers] = useState<MasterRecord[]>([]);
  const [activeFramework, setActiveFramework] = useState<FrameworkEdition | null>(null);
  const [frameworkHierarchy, setFrameworkHierarchy] = useState<FrameworkHierarchy | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(Boolean(routeIndicatorCode));
  const [isDeleting, setIsDeleting] = useState(false);
  const indicatorCodeFromQuery = searchParams.get("indicator") ?? "";
  const requestedIndicatorCode = routeIndicatorCode ?? indicatorCodeFromQuery;

  useEffect(() => {
    void loadPage();

    function handleContextChange() {
      void loadPage();
    }

    window.addEventListener(UNIT_CHANGED_EVENT, handleContextChange);
    window.addEventListener(LOCALE_CHANGED_EVENT, handleContextChange);
    return () => {
      window.removeEventListener(UNIT_CHANGED_EVENT, handleContextChange);
      window.removeEventListener(LOCALE_CHANGED_EVENT, handleContextChange);
    };
  }, []);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setDebouncedQuery(query);
      setPagination((current) => ({ ...current, pageIndex: 0 }));
    }, 280);
    return () => window.clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    void loadPage();
  }, [debouncedQuery, sourceFilter, periodicityFilter, statusFilter, uomFilter, goalFilter, pagination.pageSize, pagination.pageIndex]);

  useEffect(() => {
    if (requestedIndicatorCode) {
      void loadIndicatorDetail(requestedIndicatorCode, true, false, false);
    }
  }, [requestedIndicatorCode]);

  const selectedDetail = selectedCode ? detailCache[selectedCode] : null;

  const parentNodeOptions = useMemo(() => indicatorParentNodes(frameworkHierarchy), [frameworkHierarchy]);
  const goalNodeOptions = useMemo(
    () => (parentNodeOptions.length ? parentNodeOptions : indicatorTargetNodes(frameworkHierarchy)),
    [frameworkHierarchy, parentNodeOptions],
  );
  const goalNodeLabel = levelNameForNode(goalNodeOptions[0], frameworkHierarchy);
  const selectedGoalNode = goalFilter ? goalNodeOptions.find((node) => node.node_code === goalFilter) : undefined;
  const selectedGoalTooltip = selectedGoalNode ? fullFrameworkNodeFilterLabel(selectedGoalNode) : `All ${goalNodeLabel.toLowerCase()}`;
  const offset = pagination.pageIndex * pagination.pageSize;

  async function loadPage() {
    setIsLoading(true);
    try {
      const units = await listAvailableUnits().catch(() => []);
      const nextGlobalMappingEnabled = selectedUnitGlobalMappingEnabled(units);
      setGlobalMappingEnabled(nextGlobalMappingEnabled);
      const [indicatorResponse, organizationResponse, periodicityResponse, uomResponse, globalResponse, officerResponse] = await Promise.all([
        listIndicators({
          limit: pagination.pageSize,
          offset,
          search: debouncedQuery,
          statusFilter,
          sourceOrganizationCode: sourceFilter,
          periodicityCode: periodicityFilter,
          uomCode: uomFilter,
          frameworkNodeCode: goalFilter,
        }),
        listMasterRecords({ endpoint: "/masters/organizations" }).catch(() => ({ data: [], count: 0, locale: "en-IN" })),
        listMasterRecords({ endpoint: "/masters/periodicities" }).catch(() => ({ data: [], count: 0, locale: "en-IN" })),
        listMasterRecords({ endpoint: "/masters/uom" }).catch(() => ({ data: [], count: 0, locale: "en-IN" })),
        nextGlobalMappingEnabled ? listGlobalIndicators().catch(() => ({ data: [], count: 0, locale: "en-IN" })) : Promise.resolve({ data: [], count: 0, locale: "en-IN" }),
        listMasterRecords({ endpoint: "/masters/officers" }).catch(() => ({ data: [], count: 0, locale: "en-IN" })),
      ]);
      const frameworkResponse = await listFrameworkEditions(true).catch(() => ({ data: [], count: 0, locale: "en-IN" }));

      setIndicators(indicatorResponse.data);
      setTotalCount(indicatorResponse.count ?? indicatorResponse.data.length);
      setOrganizations(organizationResponse.data);
      setPeriodicities(periodicityResponse.data);
      setUoms(uomResponse.data);
      setGlobalIndicators(globalResponse.data);
      setOfficers(officerResponse.data);
      const nextFramework =
        frameworkResponse.data.find((edition) => edition.is_active && edition.status !== "INACTIVE") ??
          frameworkResponse.data.find((edition) => edition.is_active) ??
          frameworkResponse.data[0] ??
          null;
      const hierarchyResponse = nextFramework?.framework_code
        ? await getFrameworkHierarchy(nextFramework.framework_code, nextFramework.edition_code).catch(() => null)
        : null;

      setActiveFramework(nextFramework);
      setFrameworkHierarchy(hierarchyResponse?.data ?? null);

      if (!requestedIndicatorCode) {
        setSelectedCode("");
        setDetailCache({});
      }
    } catch {
      setIndicators([]);
      setTotalCount(0);
      setDetailCache({});
      setFrameworkHierarchy(null);
      setSelectedCode("");
      toast.error(t("ingestion:pillarIndicators.library.loadError"), { description: t("ingestion:pillarIndicators.library.loadErrorDescription") });
    } finally {
      setIsLoading(false);
    }
  }

  function handleRowEdit(indicator: IndicatorListItem) {
    const code = getIndicatorCode(indicator);
    if (!code) return;
    navigate(`/indicators/library/${encodeURIComponent(code)}/edit`);
  }

  async function handleDeleteIndicator(indicator: IndicatorListItem) {
    const code = getIndicatorCode(indicator);
    if (!code) return;
    const label = `${indicator.indicator_number ?? code} - ${indicator.name ?? code}`;
    const confirmed = (await confirm(t("ingestion:pillarIndicators.library.deleteConfirm", { label })));
    if (!confirmed) return;
    setIsDeleting(true);
    try {
      await deleteIndicator(code);
      if (selectedCode === code) {
        setSelectedCode("");
        setSearchParams(new URLSearchParams(), { replace: true });
      }
      await loadPage();
    } catch (deleteError) {
      toast.error(t("ingestion:pillarIndicators.library.deleteError"), {
        description: deleteError instanceof Error ? deleteError.message : t("ingestion:pillarIndicators.common.tryAgain"),
      });
    } finally {
      setIsDeleting(false);
    }
  }

  async function loadIndicatorDetail(indicatorCode: string, switchTab = true, force = false, updateUrl = true) {
    setSelectedCode(indicatorCode);
    if (updateUrl && indicatorCodeFromQuery !== indicatorCode) {
      setSearchParams({ indicator: indicatorCode });
    }
    if (switchTab) setActiveTab("overview");
    if (detailCache[indicatorCode] && !force) return;
    setIsDetailLoading(true);
    try {
      const response = await getIndicator(indicatorCode);
      setDetailCache((current) => ({ ...current, [indicatorCode]: response.data }));
    } catch {
      toast.error(t("ingestion:pillarIndicators.library.detailLoadError"), { description: t("ingestion:pillarIndicators.library.detailLoadErrorDescription") });
    } finally {
      setIsDetailLoading(false);
    }
  }

  const indicatorColumns = indicatorColumnHelper.columns([
    indicatorColumnHelper.accessor((indicator) => buildIndicatorRow(indicator, detailCache[getIndicatorCode(indicator)]).indicatorNumber, {
      id: "number",
      header: t("ingestion:pillarIndicators.library.columns.number"),
      sortFn: "alphanumeric",
      cell: ({ getValue, row }) => {
        const color = indicatorHexColor(row.original.color_value);
        return (
          <span
            className="inline-flex rounded-md border px-2 py-0.5 font-mono font-semibold"
            style={color ? { color: indicatorColorForeground(color), borderColor: color, backgroundColor: color } : undefined}
            title={getIndicatorCode(row.original)}
          >
            {getValue()}
          </span>
        );
      },
    }),
    indicatorColumnHelper.accessor((indicator) => buildIndicatorRow(indicator, detailCache[getIndicatorCode(indicator)]).indicatorName, {
      id: "name",
      header: t("ingestion:pillarIndicators.library.columns.name"),
      sortFn: "alphanumeric",
      cell: ({ getValue }) => (
        <TooltipTrigger delay={250}>
          <span className="block max-w-xl truncate font-medium">{getValue()}</span>
          <Tooltip className="max-w-sm whitespace-normal break-words">{getValue()}</Tooltip>
        </TooltipTrigger>
      ),
    }),
    indicatorColumnHelper.display({
      id: "actions",
      header: () => <span className="block text-right">{t("ingestion:pillarIndicators.library.columns.actions")}</span>,
      enableSorting: false,
      enableGlobalFilter: false,
      cell: ({ row }) => (
        <div className="flex justify-end" onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
          <DropdownMenuTrigger>
            <Button type="button" variant="ghost" size="icon-sm" aria-label={t("ingestion:pillarIndicators.library.actionsFor", { name: getIndicatorName(row.original) })}>
              <Ellipsis aria-hidden="true" />
            </Button>
            <DropdownMenu aria-label={t("ingestion:pillarIndicators.library.actionsFor", { name: getIndicatorName(row.original) })} className="min-w-40" placement="bottom end">
              <DropdownMenuLabel>{t("ingestion:pillarIndicators.library.indicatorActions")}</DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem id="edit" onAction={() => void handleRowEdit(row.original)}>
                  <Edit3 aria-hidden="true" />
                  {t("ingestion:pillarIndicators.library.editIndicator")}
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem id="delete" variant="destructive" isDisabled={isDeleting} onAction={() => void handleDeleteIndicator(row.original)}>
                  <Trash2 aria-hidden="true" />
                  {t("ingestion:pillarIndicators.library.deleteIndicator")}
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenu>
          </DropdownMenuTrigger>
        </div>
      ),
    }),
  ]);

  const indicatorTable = useDataTable({
    columns: indicatorColumns,
    data: indicators,
    state: { pagination },
    onPaginationChange: (updater) => setPagination((current) => typeof updater === "function" ? updater(current) : updater),
    manualPagination: true,
    rowCount: totalCount,
    getRowId: (indicator) => getIndicatorCode(indicator),
    enableMultiSort: false,
    enableRowSelection: false,
    autoResetPageIndex: false,
  });

  const indicatorTableView = (
    <DataTable
      table={indicatorTable}
      ariaLabel={t("ingestion:pillarIndicators.library.recordsLabel")}
      className="flex min-h-0 flex-1 flex-col"
      scrollContainerClassName="min-h-0 flex-1 overflow-y-auto [&_thead]:sticky [&_thead]:top-0 [&_thead]:z-10"
      isLoading={isLoading}
      loadingMessage={t("ingestion:pillarIndicators.library.loading")}
      emptyMessage={t("ingestion:pillarIndicators.library.empty")}
      noResultsMessage={t("ingestion:pillarIndicators.library.noResults")}
      pageSizeOptions={[10, 25, 50, 100]}
      totalCount={totalCount}
      onRowClick={(indicator) => {
        const code = getIndicatorCode(indicator);
        if (code) navigate(`/indicators/library/view/${encodeURIComponent(code)}`);
      }}
      getRowClassName={(indicator) => selectedCode === getIndicatorCode(indicator) ? "bg-muted" : undefined}
    />
  );

  return (
    <div className="flex min-w-0 flex-col gap-4">
      {selectedCode && isDetailLoading && !selectedDetail ? (
        <Loader text={t("ingestion:pillarIndicators.common.loadingDetails")} />
      ) : selectedDetail ? (
        <IndicatorDetailPage
          detail={selectedDetail}
          organizations={organizations}
          periodicities={periodicities}
          uoms={uoms}
          globalIndicators={globalIndicators}
          globalMappingEnabled={globalMappingEnabled}
          officers={officers}
          activeFramework={activeFramework}
          frameworkHierarchy={frameworkHierarchy}
          activeTab={activeTab}
          onTabChange={setActiveTab}
          onRefresh={() => loadIndicatorDetail(getIndicatorCode(overviewOf(selectedDetail)), false, true, false)}
          onEdit={() => handleRowEdit(overviewOf(selectedDetail))}
          onBack={() => {
            if (routeIndicatorCode) {
              navigate("/indicators/library");
              return;
            }
            setSelectedCode("");
            setSearchParams(new URLSearchParams(), { replace: true });
            setActiveTab("overview");
          }}
        />
      ) : (
        <div>
      <PageHeader>
        <div>
          <h2>{t("ingestion:pillarIndicators.library.title")}</h2>
          <p>{t("ingestion:pillarIndicators.library.description")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button type="button" onPress={() => navigate("/indicators/library/create")}>
            <Plus data-icon="inline-start" aria-hidden="true" />
            {t("ingestion:pillarIndicators.library.newIndicator")}
          </Button>
        </div>
      </PageHeader>

      <section className="grid grid-cols-1 gap-2 rounded-md bg-muted/50 p-2 md:grid-cols-2 xl:grid-cols-6" aria-label={t("ingestion:pillarIndicators.library.filtersLabel")}>
        <InputGroup className="xl:col-span-2">
          <InputGroupAddon>
            <Search aria-hidden="true" />
          </InputGroupAddon>
          <InputGroupInput
            aria-label={t("ingestion:pillarIndicators.library.searchLabel")}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={globalMappingEnabled
              ? t("ingestion:pillarIndicators.library.searchPlaceholderGlobal")
              : t("ingestion:pillarIndicators.library.searchPlaceholder")}
          />
        </InputGroup>
        <Select
          className="min-w-0 w-full"
          aria-label={`${goalNodeLabel}: ${selectedGoalTooltip}`}
          selectedKey={goalFilter || "ALL"}
          onSelectionChange={(key) => {
              setGoalFilter(key === "ALL" ? "" : String(key));
              setPagination((current) => ({ ...current, pageIndex: 0 }));
          }}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent className="w-max max-w-[calc(100vw-2rem)]">
            <SelectGroup>
              <SelectItem id="ALL">{t("ingestion:pillarIndicators.library.allLevel", { level: goalNodeLabel.toLowerCase() })}</SelectItem>
            {goalNodeOptions.map((node) => (
              <SelectItem className="max-w-lg [&>span:first-child]:whitespace-normal" id={node.node_code} key={node.node_code} textValue={fullFrameworkNodeFilterLabel(node)}>
                {fullFrameworkNodeFilterLabel(node)}
              </SelectItem>
            ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select
          className="min-w-0 w-full"
          aria-label={t("ingestion:pillarIndicators.library.ministryDepartment")}
          selectedKey={sourceFilter || "ALL"}
          onSelectionChange={(key) => {
            setSourceFilter(key === "ALL" ? "" : String(key));
            setPagination((current) => ({ ...current, pageIndex: 0 }));
          }}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent className="w-max max-w-[calc(100vw-2rem)]">
            <SelectGroup>
              <SelectItem id="ALL">{t("ingestion:pillarIndicators.library.allMinistriesDepartments")}</SelectItem>
            {organizations.map((record) => (
              <SelectItem className="max-w-lg [&>span:first-child]:whitespace-normal" id={String(record.organization_code)} key={String(record.organization_code)}>
                {optionLabel(record, "organization_code", ["name", "organization_name", "display_name"])}
              </SelectItem>
            ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select
          className="min-w-0 w-full"
          aria-label={t("ingestion:pillarIndicators.library.periodicity")}
          selectedKey={periodicityFilter || "ALL"}
          onSelectionChange={(key) => {
            setPeriodicityFilter(key === "ALL" ? "" : String(key));
            setPagination((current) => ({ ...current, pageIndex: 0 }));
          }}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent className="w-max max-w-[calc(100vw-2rem)]">
            <SelectGroup>
              <SelectItem id="ALL">{t("ingestion:pillarIndicators.library.allPeriodicities")}</SelectItem>
          {periodicities.map((record) => (
            <SelectItem className="max-w-lg [&>span:first-child]:whitespace-normal" id={String(record.periodicity_code)} key={String(record.periodicity_code)}>
              {textValue(record.name ?? record.periodicity_code)}
            </SelectItem>
          ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Select
          className="min-w-0 w-full"
          aria-label={t("ingestion:pillarIndicators.library.uom")}
          selectedKey={uomFilter || "ALL"}
          onSelectionChange={(key) => {
            setUomFilter(key === "ALL" ? "" : String(key));
            setPagination((current) => ({ ...current, pageIndex: 0 }));
          }}
        >
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent className="w-max max-w-[calc(100vw-2rem)]">
            <SelectGroup>
              <SelectItem id="ALL">{t("ingestion:pillarIndicators.library.allUom")}</SelectItem>
          {uoms.map((record) => (
            <SelectItem className="max-w-lg [&>span:first-child]:whitespace-normal" id={String(record.uom_code)} key={String(record.uom_code)} textValue={textValue(record.name ?? record.uom_code)}>
              {textValue(record.name ?? record.uom_code)}
            </SelectItem>
          ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </section>

      <CustomTabs
        className="min-h-0 flex-1 overflow-hidden"
        variant="underline"
        value={statusFilter}
        onValueChange={(key) => {
          setStatusFilter(String(key) as IndicatorStatusFilter);
          setPagination((current) => ({ ...current, pageIndex: 0 }));
        }}
        compact
        ariaLabel={t("ingestion:pillarIndicators.library.statusLabel")}
        contentClassName="flex min-h-0 flex-1 overflow-hidden"
        items={[{ value: "ALL", label: t("ingestion:pillarIndicators.common.all") },
          { value: "ACTIVE", label: t("ingestion:pillarIndicators.common.active") },
          { value: "DRAFT", label: t("ingestion:pillarIndicators.common.draft") },
          { value: "INACTIVE", label: t("ingestion:pillarIndicators.common.inactive") }].map((tab) => ({ ...tab, content: (<>{indicatorTableView}</>) }))}
      />
      {isDetailLoading && <div className="flex min-h-32 flex-col items-center justify-center gap-2 p-6 text-center text-sm text-muted-foreground">{t("ingestion:pillarIndicators.common.loadingDetails")}</div>}
        </div>
      )}

    </div>
  );
}

function buildIndicatorRow(indicator: IndicatorListItem, detail?: IndicatorDetail) {
  const overview = overviewOf(detail);
  const metadata = firstMetadata(detail);
  const globalMapping = firstGlobalMapping(detail);
  const publishedUsage = (detail?.published_template_usage ?? []).find(
    (item) =>
      item.source_organization_code ||
      item.source_organization_name ||
      item.uom_code ||
      item.uom_name ||
      item.unit_code ||
      item.periodicity_code ||
      item.periodicity_name,
  );
  const publishedMinistry =
    indicator.source_organization_name ??
    publishedUsage?.ministry_name ??
    publishedUsage?.ministry_organization_code ??
    indicator.source_organization_code;
  const publishedDepartment =
    indicator.department_organization_name ??
    publishedUsage?.department_organization_name ??
    publishedUsage?.department_organization_code ??
    indicator.department_organization_code;
  const publishedUom =
    indicator.unit_of_measure_name ??
    indicator.uom_name ??
    publishedUsage?.uom_name ??
    publishedUsage?.uom_code ??
    publishedUsage?.unit_code ??
    indicator.unit_of_measure_code ??
    indicator.uom_code;
  const publishedPeriodicity =
    indicator.periodicity_name ??
    publishedUsage?.periodicity_name ??
    publishedUsage?.periodicity_code ??
    indicator.periodicity_code;
  const ingestionInfo = buildIngestionInfo([asRecord(indicator), asRecord(publishedUsage), asRecord(metadata)]);

  return {
    indicatorCode: indicator.national_indicator_code || overview.national_indicator_code || "-",
    indicatorNumber: indicator.indicator_number || overview.indicator_number || "-",
    indicatorName: indicator.name || overview.name || "-",
    globalCode: indicator.global_indicator_code || globalMapping?.global_indicator_code || "",
    globalNumber: indicator.global_indicator_number || globalMapping?.global_indicator_number || "",
    globalName: indicator.global_indicator_name || globalMapping?.global_indicator_name || "",
    ministry: publishedMinistry || "-",
    department: publishedDepartment || "-",
    sourceCode: indicator.source_organization_code || publishedUsage?.source_organization_code || "",
    departmentCode: indicator.department_organization_code || publishedUsage?.department_organization_code || "",
    uom: publishedUom || "-",
    uomCode: indicator.unit_of_measure_code || indicator.uom_code || publishedUsage?.uom_code || publishedUsage?.unit_code || "",
    periodicity: publishedPeriodicity || "-",
    periodicityCode: indicator.periodicity_code || publishedUsage?.periodicity_code || "",
    ingestionMethod: ingestionInfo.method,
    lastUpdated: indicator.last_updated || indicator.updated_at || metadata?.latest_data_availability || "-",
  };
}

function nodeLabel(node?: FrameworkMappedNode) {
  if (!node) return "-";
  const number = node.node_number ? `${node.node_number} - ` : "";
  return `${number}${node.name ?? node.short_name ?? node.node_code ?? "-"}`;
}

function IndicatorDetailPage({
  detail,
  globalIndicators,
  globalMappingEnabled,
  activeFramework,
  frameworkHierarchy,
  activeTab,
  onTabChange,
  onRefresh,
  onEdit,
  onBack,
}: {
  detail: IndicatorDetail;
  organizations: MasterRecord[];
  periodicities: MasterRecord[];
  uoms: MasterRecord[];
  globalIndicators: GlobalIndicatorListItem[];
  globalMappingEnabled: boolean;
  officers: MasterRecord[];
  activeFramework: FrameworkEdition | null;
  frameworkHierarchy: FrameworkHierarchy | null;
  activeTab: DetailTab;
  onTabChange: (tab: DetailTab) => void;
  onRefresh: () => Promise<void>;
  onEdit: () => void;
  onBack: () => void;
}) {
  const navigate = useNavigate();
  const { t } = useTranslation(["ingestion", "common"]);
  const [mappingForm, setMappingForm] = useState({
    node_code: "",
    mapping_type: "PRIMARY",
    global_indicator_code: "",
    global_mapping_type: "DIRECT",
    source_organization_code: "",
    officer_code: "",
    officer_label: "",
    recipient_type: "TO",
    contact_role: "NODAL_OFFICER",
    periodicity_code: "",
    assignment_role: "PRIMARY_SOURCE",
    measure_code: "",
    measure_name: "",
    measure_unit_code: "",
    value_type: "NUMERIC",
    aggregation_type: "NONE",
  });
  const [mappingPanel, setMappingPanel] = useState<MappingPanel>("");
  const [isMappingSaving, setIsMappingSaving] = useState("");
  const [isIngestionJsonOpen, setIsIngestionJsonOpen] = useState(false);
  const [openMappingSections, setOpenMappingSections] = useState<string[]>([]);
  const overview = overviewOf(detail);
  const publishedTemplateUsage = useMemo(() => detail.published_template_usage ?? [], [detail.published_template_usage]);
  const publishedSourceUsage = useMemo(
    () =>
      uniquePublishedUsage(
        publishedTemplateUsage.filter((item) => item.source_organization_code || item.source_organization_name),
        (item) => [
          item.template_code ?? "",
          item.version_code ?? "",
          item.source_organization_code ?? "",
          item.access_role ?? "",
          item.provider_mode ?? "",
        ].join("|"),
      ),
    [publishedTemplateUsage],
  );
  const publishedPeriodicityUsage = useMemo(
    () =>
      uniquePublishedUsage(
        publishedTemplateUsage.filter((item) => item.periodicity_code || item.periodicity_name),
        (item) => [item.template_code ?? "", item.version_code ?? "", item.periodicity_code ?? item.periodicity_name ?? ""].join("|"),
      ),
    [publishedTemplateUsage],
  );
  const publishedUomUsage = useMemo(
    () =>
      uniquePublishedUsage(
        publishedTemplateUsage.filter((item) => item.uom_code || item.uom_name || item.unit_code),
        (item) => [item.template_code ?? "", item.version_code ?? "", item.uom_code ?? item.unit_code ?? item.uom_name ?? ""].join("|"),
      ),
    [publishedTemplateUsage],
  );
  const publishedMeasureUsage = useMemo(
    () =>
      uniquePublishedUsage(
        publishedTemplateUsage.filter((item) => item.template_measure_code || item.measure_code || item.source_measure_code),
        (item) => [
          item.template_code ?? "",
          item.version_code ?? "",
          item.template_measure_code ?? item.measure_code ?? item.source_measure_code ?? "",
          item.source_organization_code ?? "",
        ].join("|"),
      ),
    [publishedTemplateUsage],
  );
  const publishedOfficerUsage = useMemo(
    () =>
      publishedTemplateUsage.flatMap((item) =>
        (item.officers ?? []).map((officer) => ({
          usage: item,
          officer,
        })),
      ),
    [publishedTemplateUsage],
  );
  const publishedPrimaryUsage = publishedTemplateUsage[0];
  const sourceMinistry = publishedSourceUsage[0]?.ministry_name ?? publishedSourceUsage[0]?.ministry_organization_code;
  const sourceDepartment = publishedSourceUsage[0]?.department_organization_name ?? publishedSourceUsage[0]?.department_organization_code;
  const sourceUom = publishedUomUsage[0]?.uom_name ?? publishedUomUsage[0]?.uom_code ?? publishedUomUsage[0]?.unit_code;
  const sourcePeriodicity = publishedPeriodicityUsage[0]?.periodicity_name ?? publishedPeriodicityUsage[0]?.periodicity_code;
  const hasSource = Boolean(sourceMinistry || sourceDepartment);
  const hasPeriodicity = Boolean(sourcePeriodicity);
  const hasUom = Boolean(sourceUom);
  const measure = firstMeasure(detail);
  const version = firstVersion(detail);
  const metadata = firstMetadata(detail);
  const ingestionInfo = buildIngestionInfo([asRecord(overview), asRecord(publishedPrimaryUsage), asRecord(metadata)]);
  const hasMeasure = publishedMeasureUsage.length > 0 || Boolean(measure?.measure_code);
  const metadataComplete = hasSource && hasPeriodicity && hasUom && hasMeasure;
  const missingMetadata = [
    !hasSource ? "source" : "",
    !hasPeriodicity ? "periodicity" : "",
    !hasUom ? "UOM" : "",
    !hasMeasure ? "measure" : "",
  ].filter(Boolean).join(", ");
  const globalMapping = firstGlobalMapping(detail);
  const frameworkMapping = firstFrameworkMapping(detail);
  const mappedNode = frameworkMapping?.mapped_node;
  const relatedHierarchyPath = frameworkHierarchyPathForMappedNode(mappedNode, frameworkHierarchy, frameworkMapping?.parents ?? []);
  const notes = parseMetadataNotes(metadata?.notes);
  const indicatorNumber = textValue(overview.indicator_number);
  const color = overview.color_value || "#e91d3d";
  const indicatorCode = getIndicatorCode(overview);
  const frameworkCode = overview.framework_code || activeFramework?.framework_code || "";
  const editionCode = overview.edition_code || activeFramework?.edition_code || "";
  const definition = overview.description ?? version?.description;
  const computation = metadata?.computation_description ??
    noteValue(notes, ["computation", "formula", "calculation_method", "computation_formula"]);
  const supportingMetadata: Array<[string, unknown]> = [
    ["Data Source Ministry", sourceMinistry],
    ["Department / Division", sourceDepartment],
    ["Unit of Measurement", sourceUom],
    ["Periodicity", sourcePeriodicity],
    ["Level of Disaggregation", noteValue(notes, ["level_of_disaggregation", "disaggregation_level"])],
    ["Type of Disaggregation", noteValue(notes, ["type_of_disaggregation", "disaggregation_type"])],
    ...(globalMappingEnabled
      ? ([["Mapping with Global Indicator", globalMapping?.global_indicator_number ?? globalMapping?.global_indicator_code]] as Array<[string, unknown]>)
      : []),
    ["References", noteValue(notes, ["references", "reference", "source_references"]) ?? metadata?.source_reference_code],
  ];

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setMappingForm({
        node_code: mappedNode?.node_code ?? "",
        mapping_type: frameworkMapping?.mapping_type ?? "PRIMARY",
        global_indicator_code: globalMapping?.global_indicator_code ?? "",
        global_mapping_type: globalMapping?.mapping_type ?? "DIRECT",
        source_organization_code: publishedPrimaryUsage?.source_organization_code ?? "",
        officer_code: "",
        officer_label: "",
        recipient_type: "TO",
        contact_role: "NODAL_OFFICER",
        periodicity_code: publishedPrimaryUsage?.periodicity_code ?? "",
        assignment_role: publishedPrimaryUsage?.access_role ?? "PRIMARY_SOURCE",
        measure_code: measure?.measure_code ?? "",
        measure_name: textValue(measure?.name === "-" ? "" : measure?.name ?? measure?.measure_code ?? ""),
        measure_unit_code: measure?.unit_code ?? version?.unit_of_measure_code ?? "",
        value_type: measure?.value_type ?? "NUMERIC",
        aggregation_type: measure?.aggregation_type ?? "NONE",
      });
      setMappingPanel("");
      setOpenMappingSections([]);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [detail]);
  const selectedGlobalIndicator = globalIndicators.find((record) => record.global_indicator_code === mappingForm.global_indicator_code);
  const canSaveGlobalMapping = Boolean(globalMappingEnabled && frameworkCode && editionCode && indicatorCode && selectedGlobalIndicator && !isMappingSaving);
  const mappingSummary = [
    { key: "framework", label: t("ingestion:pillarIndicators.form.framework"), count: frameworkMapping ? 1 : 0, status: frameworkMapping ? t("ingestion:pillarIndicators.view.mapped") : t("ingestion:pillarIndicators.view.pending") },
    ...(globalMappingEnabled
      ? [{ key: "global", label: "Global Indicator", count: globalMapping ? 1 : 0, status: globalMapping ? "Mapped" : "Pending" }]
      : []),
    { key: "source", label: "Source", count: publishedSourceUsage.length, status: publishedSourceUsage.length ? t("ingestion:pillarIndicators.view.mapped") : t("ingestion:pillarIndicators.view.pending") },
    { key: "periodicity", label: t("ingestion:pillarIndicators.library.periodicity"), count: publishedPeriodicityUsage.length, status: publishedPeriodicityUsage.length ? t("ingestion:pillarIndicators.view.mapped") : t("ingestion:pillarIndicators.view.pending") },
    { key: "uom", label: "UOM", count: publishedUomUsage.length, status: publishedUomUsage.length ? t("ingestion:pillarIndicators.view.mapped") : t("ingestion:pillarIndicators.view.pending") },
    { key: "measure", label: t("ingestion:pillarIndicators.view.tabs.measures"), count: publishedMeasureUsage.length, status: publishedMeasureUsage.length ? t("ingestion:pillarIndicators.view.mapped") : t("ingestion:pillarIndicators.view.pending") },
  ];

  const detailTabs: Array<{ key: DetailTab; label: string; count?: number }> = [
    { key: "overview", label: t("ingestion:pillarIndicators.view.tabs.overview") },
    { key: "mapping", label: t("ingestion:pillarIndicators.view.tabs.mapping"), count: mappingSummary.reduce((total, item) => total + item.count, 0) },
    { key: "measures", label: t("ingestion:pillarIndicators.view.tabs.measures"), count: Math.max(detail.measures?.length ?? 0, publishedMeasureUsage.length) },
    { key: "usage", label: t("ingestion:pillarIndicators.view.tabs.templateUsage"), count: publishedTemplateUsage.length },
    { key: "history", label: t("ingestion:pillarIndicators.view.tabs.history"), count: detail.versions?.length ?? 0 },
  ];
  const statusSummary = textValue(overview.status ?? (overview.is_active === false ? "Inactive" : "Active"));
  const targetSummary = relatedHierarchyPath.length ? nodeLabel(relatedHierarchyPath[relatedHierarchyPath.length - 1]) : nodeLabel(mappedNode);
  const lastUpdatedSummary = compactDate(overview.last_updated ?? overview.updated_at ?? metadata?.latest_data_availability);
  const tabCopy: Record<DetailTab, { title: string; description: string }> = {
    overview: {
      title: t("ingestion:pillarIndicators.view.overviewTitle"),
      description: t("ingestion:pillarIndicators.view.overviewDescription"),
    },
    mapping: {
      title: t("ingestion:pillarIndicators.view.mappingTitle"),
      description: globalMappingEnabled
        ? t("ingestion:pillarIndicators.view.mappingDescriptionGlobal")
        : t("ingestion:pillarIndicators.view.mappingDescription"),
    },
    measures: {
      title: t("ingestion:pillarIndicators.view.measuresTitle"),
      description: t("ingestion:pillarIndicators.view.measuresDescription"),
    },
    usage: {
      title: t("ingestion:pillarIndicators.view.usageTitle"),
      description: t("ingestion:pillarIndicators.view.usageDescriptionDetail"),
    },
    history: {
      title: t("ingestion:pillarIndicators.view.historyTitle"),
      description: t("ingestion:pillarIndicators.view.historyDescription"),
    },
  };
  function toggleMappingSection(sectionId: string): void {
    setOpenMappingSections((current) =>
      current.includes(sectionId) ? current.filter((item) => item !== sectionId) : [...current, sectionId],
    );
  }

  async function runMappingSave(action: string, work: () => Promise<unknown>) {
    setIsMappingSaving(action);
    try {
      await work();
      await onRefresh();
      toast.success("Mapping changes saved");
    } catch (error) {
      toast.error("Mapping changes could not be saved", {
        description: error instanceof Error ? error.message : "Please try again.",
      });
    } finally {
      setIsMappingSaving("");
    }
  }

  return (
    <div className="flex min-w-0 flex-col gap-3">
      <section className="flex min-w-0 flex-wrap items-start justify-between gap-4">
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex size-12 shrink-0 items-center justify-center rounded-md bg-accent text-lg font-semibold text-accent-foreground" style={{ color, borderColor: `${color}55`, background: `${color}12` }}>
            {indicatorNumber}
          </div>
          <div className="flex min-w-0 flex-col gap-1.5">
            <div className="flex min-w-0 flex-wrap items-center gap-2">
              <h2 className="truncate text-lg font-semibold">{getIndicatorName(overview)}</h2>
              <Badge variant={statusSummary.toUpperCase() === "ACTIVE" ? "default" : "secondary"}>{statusSummary}</Badge>
            </div>
            <p className="whitespace-normal break-words text-xs leading-relaxed text-muted-foreground">{targetSummary}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <ButtonGroup aria-label={t("ingestion:pillarIndicators.view.actionsLabel")}>
            <Button type="button" variant="outline" size="sm" onPress={onBack}>
              <ArrowLeft data-icon="inline-start" aria-hidden="true" />
              {t("ingestion:pillarIndicators.common.back")}
            </Button>
            <Button type="button" variant="outline" size="sm" onPress={onEdit}>
              <Edit3 data-icon="inline-start" aria-hidden="true" />
              {t("ingestion:pillarIndicators.view.edit")}
            </Button>
            <Button type="button" size="sm" onPress={() => navigate("/indicators/library/create")}>
              <Plus data-icon="inline-start" aria-hidden="true" />
              {t("ingestion:pillarIndicators.view.newIndicator")}
            </Button>
          </ButtonGroup>
        </div>
      </section>

      <CustomTabs
        variant="underline"
        value={activeTab}
        onValueChange={(key) => onTabChange(String(key) as DetailTab)}
        compact
        ariaLabel={t("ingestion:pillarIndicators.view.sectionsLabel")}
        items={detailTabs.map((tab) => (
            ({ value: tab.key, label: tab.label, badge: typeof tab.count === "number" ? tab.count : undefined, content: (<><div className="flex min-w-0 flex-col gap-4">
        <section className="flex min-w-0 flex-col gap-3">
          <header className="flex flex-col gap-1 [&_h3]:text-sm [&_h3]:font-semibold [&_p]:text-muted-foreground">
            <div>
              <h3>{tabCopy[activeTab].title}</h3>
              <p>{tabCopy[activeTab].description}</p>
            </div>
          </header>

          {activeTab === "overview" ? (
            <div className="grid gap-4 p-4 lg:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Indicator definition</CardTitle>
                  <CardDescription>What this indicator measures and why it matters.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-sm leading-6">
                    {textValue(definition) === "-" ? "No indicator definition is available yet." : textValue(definition)}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle>Computation methodology</CardTitle>
                  <CardDescription>How the indicator value is calculated.</CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="whitespace-pre-wrap text-sm leading-6">
                    {textValue(computation) === "-" ? "No computation methodology is available yet." : textValue(computation)}
                  </p>
                </CardContent>
              </Card>
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle>Supporting metadata</CardTitle>
                  <CardDescription>Collection ownership, frequency, measurement, and disaggregation details.</CardDescription>
                </CardHeader>
                <CardContent>
                  <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {supportingMetadata.map(([label, value]) => {
                      const displayValue = textValue(value);
                      return (
                        <div className="flex min-w-0 flex-col gap-1 rounded-md bg-muted/50 p-3" key={label}>
                          <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
                          <dd className={cn("break-words text-sm font-medium", displayValue === "-" && "font-normal text-muted-foreground")}>
                            {displayValue === "-" ? "Not available" : displayValue}
                          </dd>
                        </div>
                      );
                    })}
                  </dl>
                </CardContent>
              </Card>
            </div>
          ) : activeTab === "mapping" ? (
            <div className="flex min-w-0 flex-col gap-3">
              <InfoSection
                title="Framework Mapping"
                id="framework-map"
                tone="framework"
                count={frameworkMapping ? 1 : 0}
                isOpen={openMappingSections.includes("framework")}
                onToggle={() => toggleMappingSection("framework")}
              >
                {frameworkMapping ? (
                  <MappingListRow
                    title={nodeLabel(mappedNode)}
                    meta={[
                      { label: "Mapping type", value: frameworkMapping.mapping_type },
                      { label: "Edition", value: activeFramework?.edition_code ?? editionCode },
                      { label: "Hierarchy path", value: relatedHierarchyPath.map(nodeLabel).join(" > ") },
                    ]}
                  />
                ) : (
                  <Empty><EmptyHeader><EmptyTitle>No framework hierarchy mapping found.</EmptyTitle></EmptyHeader></Empty>
                )}
              </InfoSection>

              {globalMappingEnabled ? (
                <InfoSection
                  title="Global Indicator Mapping"
                  id="global-map"
                  tone="global"
                  count={globalMapping ? 1 : 0}
                  isOpen={openMappingSections.includes("global")}
                  onToggle={() => toggleMappingSection("global")}
                  action={
                    <Button variant="outline" type="button" onClick={() => setMappingPanel("global")}>
                      Map Global Indicator
                    </Button>
                  }
                >
                  {globalMapping ? (
                    <MappingListRow
                      title={`${textValue(globalMapping.global_indicator_number ?? globalMapping.global_indicator_code)} - ${textValue(globalMapping.global_indicator_name)}`}
                      meta={[
                        { label: "Mapping type", value: globalMapping.mapping_type },
                        { label: "Status", value: globalMapping.status },
                        { label: "State", value: globalMapping.is_active === false ? "Inactive" : "Active" },
                      ]}
                      onUnmap={() =>
                        void runMappingSave("global-off", () =>
                          saveGlobalIndicatorMapping({
                            framework_code: frameworkCode,
                            edition_code: editionCode,
                            national_indicator_code: indicatorCode,
                            global_indicator_code: globalMapping.global_indicator_code ?? "",
                            mapping_type: globalMapping.mapping_type ?? "DIRECT",
                            is_active: false,
                          }),
                        )
                      }
                      disabled={!frameworkCode || !editionCode || !indicatorCode || !globalMapping.global_indicator_code || Boolean(isMappingSaving)}
                    />
                  ) : (
                    <Empty><EmptyHeader><EmptyTitle>No global indicator mapped.</EmptyTitle></EmptyHeader></Empty>
                  )}
                </InfoSection>
              ) : null}

              <InfoSection
                title="Source Assignment"
                id="source-map"
                tone="source"
                count={publishedSourceUsage.length}
                isOpen={openMappingSections.includes("source")}
                onToggle={() => toggleMappingSection("source")}
              >
                <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
                  Provided by published template usage and template/data-field provider policy.
                </div>
                {publishedSourceUsage.length ? (
                  publishedSourceUsage.map((item) => (
                    <MappingListRow
                      key={usageKey(item, "source")}
                      title={usageSourceTitle(item)}
                      meta={[
                        { label: "Template", value: item.template_name ?? item.template_code },
                        { label: "Version", value: item.version_title ?? item.version_code },
                        { label: "Source code", value: item.source_organization_code },
                        { label: "Role", value: item.access_role },
                        { label: "Provider", value: item.is_primary_provider ? "Primary" : undefined },
                        { label: "Access", value: item.can_enter_data ? "Data entry" : undefined },
                      ]}
                    />
                  ))
                ) : (
                  <Empty><EmptyHeader><EmptyTitle>No published template-derived source usage is available yet.</EmptyTitle></EmptyHeader></Empty>
                )}
              </InfoSection>

              <InfoSection
                title="Periodicity"
                id="periodicity-map"
                tone="periodicity"
                count={publishedPeriodicityUsage.length}
                isOpen={openMappingSections.includes("periodicity")}
                onToggle={() => toggleMappingSection("periodicity")}
              >
                <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
                  Provided by published template and request scheduling context.
                </div>
                {publishedPeriodicityUsage.length ? (
                  publishedPeriodicityUsage.map((item) => (
                    <MappingListRow
                      key={usageKey(item, "periodicity")}
                      title={textValue(item.periodicity_name ?? item.periodicity_code)}
                      meta={[
                        { label: "Template", value: item.template_name ?? item.template_code },
                        { label: "Version", value: item.version_title ?? item.version_code },
                        { label: "Source", value: usageSourceTitle(item) },
                      ]}
                    />
                  ))
                ) : (
                  <Empty><EmptyHeader><EmptyTitle>No published template-derived periodicity usage is available yet.</EmptyTitle></EmptyHeader></Empty>
                )}
              </InfoSection>

              <InfoSection
                title="Source Officer Assignment"
                id="source-officer-map"
                tone="officer"
                count={publishedOfficerUsage.length}
                isOpen={openMappingSections.includes("sourceOfficer")}
                onToggle={() => toggleMappingSection("sourceOfficer")}
              >
                <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
                  Provided by published template and source provider usage.
                </div>
                {publishedSourceUsage.length ? (
                  publishedSourceUsage.map((usage) => {
                    const officersForAssignment = publishedOfficerUsage.filter(
                      (item) => item.usage.source_organization_code === usage.source_organization_code && item.usage.template_measure_code === usage.template_measure_code,
                    );
                    return (
                      <div className="flex min-w-0 flex-col gap-3" key={usageKey(usage, "officers")}>
                        <div className="flex flex-wrap items-start justify-between gap-3 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:text-sm [&_h3]:font-semibold [&_p]:text-xs [&_p]:text-muted-foreground">
                          <strong>{usageSourceTitle(usage)}</strong>
                          <span>{textValue(usage.template_name ?? usage.template_code)} / {textValue(usage.measure_name ?? usage.template_measure_code)}</span>
                        </div>
                        {officersForAssignment.length ? (
                          officersForAssignment.map((item) => (
                            <MappingListRow
                              key={[usageKey(item.usage, "officer"), item.officer.recipient_type, item.officer.email_address].join("-")}
                              title={textValue(item.officer.officer_display_name ?? item.officer.display_name)}
                              badge={item.officer.recipient_type}
                              meta={[
                                { label: "Role", value: item.officer.contact_role },
                                { label: "Email", value: item.officer.email_address },
                                { label: "State", value: item.officer.is_active === false ? "Inactive" : "Active" },
                              ]}
                            />
                          ))
                        ) : (
                          <div className="flex min-h-32 flex-col items-center justify-center gap-2 p-6 text-center text-sm text-muted-foreground">No published template-derived officer recipients available for this source.</div>
                        )}
                      </div>
                    );
                  })
                ) : (
                  <Empty><EmptyHeader><EmptyTitle>No published template-derived officer usage is available yet.</EmptyTitle></EmptyHeader></Empty>
                )}
              </InfoSection>

              <InfoSection
                title="Unit of Measurement"
                id="uom-map"
                tone="uom"
                count={publishedUomUsage.length}
                isOpen={openMappingSections.includes("uom")}
                onToggle={() => toggleMappingSection("uom")}
              >
                <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
                  Provided by measures used in published template versions.
                </div>
                {publishedUomUsage.length ? (
                  publishedUomUsage.map((item) => (
                    <MappingListRow
                      key={usageKey(item, "uom")}
                      title={textValue(item.uom_name ?? item.uom_code ?? item.unit_code)}
                      meta={[
                        { label: "Template", value: item.template_name ?? item.template_code },
                        { label: "Measure", value: item.measure_name ?? item.template_measure_code },
                        { label: "Value type", value: item.value_type },
                      ]}
                    />
                  ))
                ) : (
                  <Empty><EmptyHeader><EmptyTitle>No published template-derived UOM usage is available yet.</EmptyTitle></EmptyHeader></Empty>
                )}
              </InfoSection>

              <InfoSection
                title="Measures"
                id="measure-map"
                tone="measure"
                count={publishedMeasureUsage.length}
                isOpen={openMappingSections.includes("measure")}
                onToggle={() => toggleMappingSection("measure")}
              >
                <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
                  Provided by Template Studio and published template versions.
                </div>
                {publishedMeasureUsage.length ? (
                  publishedMeasureUsage.map((item) => (
                    <MappingListRow
                      key={usageKey(item, "measure")}
                      title={textValue(item.measure_name ?? item.template_measure_code ?? item.measure_code)}
                      meta={[
                        { label: "Template", value: item.template_name ?? item.template_code },
                        { label: "Template measure", value: item.template_measure_code ?? item.measure_code },
                        { label: "Source measure", value: item.source_measure_code },
                        { label: "Value type", value: item.value_type },
                        { label: "UOM", value: item.uom_name ?? item.uom_code ?? item.unit_code },
                        { label: "Aggregation", value: item.aggregation_type },
                      ]}
                    />
                  ))
                ) : (
                  <Empty><EmptyHeader><EmptyTitle>No published template-derived measure usage is available yet.</EmptyTitle></EmptyHeader></Empty>
                )}
              </InfoSection>
              {mappingPanel && globalMappingEnabled && (
                <Sheet isOpen showCloseButton={false} onOpenChange={(open) => { if (!open) { setMappingPanel(""); } }} className="w-full sm:max-w-xl">
                <div className="flex min-h-0 flex-1 flex-col gap-3">
                  <header>
                    <div>
                      <span>Indicator mapping</span>
                      <SheetTitle>Global Indicator</SheetTitle>
                    </div>
                    <Button size="icon-sm" variant="ghost" type="button" onClick={() => setMappingPanel("")}>
                      x
                    </Button>
                  </header>

                  {mappingPanel === "global" && (
                    <div>
                      <datalist id="global-indicator-options">
                        {globalIndicators.map((record) => (
                          <NativeSelectOption
                            key={record.global_indicator_code}
                            value={record.global_indicator_code}
                            label={`${record.indicator_number ?? record.global_indicator_code} - ${record.name ?? record.global_indicator_code}`}
                          />
                        ))}
                      </datalist>
                      <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium">
                        <span>Global indicator *</span>
                        <Input
                          list="global-indicator-options"
                          value={mappingForm.global_indicator_code}
                          onChange={(event) => setMappingForm((current) => ({ ...current, global_indicator_code: event.target.value }))}
                          placeholder="Search global indicator"
                        />
                        {!selectedGlobalIndicator && mappingForm.global_indicator_code && <em>Select an exact global indicator from the list.</em>}
                      </label>
                      <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium">
                        <span>Mapping type</span>
                        <NativeSelect
                          value={mappingForm.global_mapping_type}
                          onChange={(event) => setMappingForm((current) => ({ ...current, global_mapping_type: event.target.value }))}
                        >
                          <NativeSelectOption value="DIRECT">DIRECT</NativeSelectOption>
                          <NativeSelectOption value="PROXY">PROXY</NativeSelectOption>
                          <NativeSelectOption value="PARTIAL">PARTIAL</NativeSelectOption>
                        </NativeSelect>
                      </label>
                      <div className="flex flex-wrap items-center gap-2">
                        <Button

                          type="button"
                          disabled={!canSaveGlobalMapping}
                          onClick={() =>
                            void runMappingSave("global", () =>
                              saveGlobalIndicatorMapping({
                                framework_code: frameworkCode,
                                edition_code: editionCode,
                                national_indicator_code: indicatorCode,
                                global_indicator_code: mappingForm.global_indicator_code,
                                mapping_type: mappingForm.global_mapping_type,
                                is_active: true,
                              }),
                            )
                          }
                        >
                          {isMappingSaving === "global" ? "Saving..." : "Save"}
                        </Button>
                        <Button variant="ghost"

                          type="button"
                          disabled={!canSaveGlobalMapping}
                          onClick={() =>
                            void runMappingSave("global-off", () =>
                              saveGlobalIndicatorMapping({
                                framework_code: frameworkCode,
                                edition_code: editionCode,
                                national_indicator_code: indicatorCode,
                                global_indicator_code: mappingForm.global_indicator_code,
                                mapping_type: mappingForm.global_mapping_type,
                                is_active: false,
                              }),
                            )
                          }
                        >
                          Deactivate
                        </Button>
                      </div>
                    </div>
                  )}

                </div>
                </Sheet>
              )}
            </div>
          ) : activeTab === "measures" ? (
            <div className="flex flex-col gap-4 p-4">
              {(detail.measures ?? []).length ? (
                (detail.measures ?? []).map((item) => (
                  <MeasureDetailsSection
                    key={item.measure_code ?? item.name ?? item.version_code ?? "measure"}
                    title={textValue(item.name ?? item.measure_code)}
                    details={[
                      { label: "Measure code", value: item.measure_code },
                      { label: "Version", value: item.version_code },
                      { label: "Value type", value: item.value_type },
                      { label: "UOM", value: item.unit_code },
                      { label: "Aggregation", value: item.aggregation_type },
                      { label: "Required", value: item.is_required ? "Yes" : "No" },
                    ]}
                  />
                ))
              ) : hasMeasure ? (
                <MeasureDetailsSection
                  title={textValue(measure?.name ?? measure?.measure_code)}
                  details={[
                    { label: "Measure code", value: measure?.measure_code },
                    { label: "Value type", value: measure?.value_type },
                    { label: "UOM", value: measure?.unit_code ?? version?.unit_of_measure_code },
                    { label: "Aggregation", value: measure?.aggregation_type },
                  ]}
                />
              ) : (
                <Empty><EmptyHeader><EmptyTitle>No measures configured for this indicator.</EmptyTitle></EmptyHeader></Empty>
              )}
              {publishedMeasureUsage.length ? (
                <section className="flex flex-col gap-3">
                  <div>
                    <h4 className="text-sm font-medium">Published template usage</h4>
                    <p className="text-xs text-muted-foreground">How this measure is configured in published collection templates.</p>
                  </div>
                  {publishedMeasureUsage.map((item) => (
                    <MeasureDetailsSection
                      key={usageKey(item, "measure-tab")}
                      title={textValue(item.measure_name ?? item.template_measure_code ?? item.measure_code)}
                      details={[
                        { label: "Template", value: item.template_name ?? item.template_code },
                        { label: "Version", value: item.version_title ?? item.version_code },
                        { label: "Source measure", value: item.source_measure_code },
                        { label: "Value type", value: item.value_type },
                        { label: "UOM", value: item.uom_name ?? item.uom_code ?? item.unit_code },
                      ]}
                    />
                  ))}
                </section>
              ) : null}
            </div>
          ) : activeTab === "usage" ? (
            <div className="flex min-w-0 flex-col gap-3">
              {publishedTemplateUsage.length ? (
                publishedTemplateUsage.map((item) => (
                  <MappingListRow
                    key={usageKey(item, "template-tab")}
                    title={textValue(item.template_name ?? item.template_code)}
                    meta={[
                      { label: "Template code", value: item.template_code },
                      { label: "Version", value: item.version_title ?? item.version_code },
                      { label: "Source", value: usageSourceTitle(item) },
                      { label: "Periodicity", value: item.periodicity_name ?? item.periodicity_code },
                      { label: "Status", value: item.version_status ?? item.template_status },
                      { label: "Cells", value: item.cell_count },
                    ]}
                  />
                ))
              ) : (
                <Empty><EmptyHeader><EmptyTitle>No published template usage is available for this indicator.</EmptyTitle></EmptyHeader></Empty>
              )}
            </div>
          ) : (
            <div className="flex flex-col gap-5 p-4">
              <MeasureDetailsSection
                title="Metadata Status"
                description="Completeness and version information for this indicator."
                details={[
                  { label: "Completeness", value: metadata?.is_active === false ? "Inactive" : metadataComplete ? "Complete" : `Incomplete: ${missingMetadata}` },
                  { label: "Last updated", value: lastUpdatedSummary },
                  { label: "Source document", value: metadata?.source_document_name ?? metadata?.source_reference_code },
                  { label: "Current version", value: version?.version_label ?? version?.version_code },
                ]}
              />
              <MeasureDetailsSection
                title="Ingestion information"
                description="Latest data ingestion method and submission activity."
                action={
                  <Button type="button" variant="outline" size="sm" onPress={() => setIsIngestionJsonOpen(true)}>
                    <Eye data-icon="inline-start" aria-hidden="true" />
                    {t("ingestion:pillarIndicators.view.viewJson")}
                  </Button>
                }
                details={[
                  { label: "Method", value: ingestionInfo.method },
                  { label: "Data source", value: ingestionInfo.source },
                  { label: "Last submit method", value: ingestionInfo.lastSubmissionMethod },
                  { label: "Last submitted by", value: ingestionInfo.lastSubmittedBy },
                  { label: "Last submitted on", value: ingestionInfo.lastSubmittedAt },
                  { label: "API method", value: ingestionInfo.apiMethod },
                ]}
              />
              {(detail.versions ?? []).length ? (
                <section className="flex flex-col gap-4">
                  <div>
                    <h4 className="text-sm font-medium">Version history</h4>
                    <p className="text-xs text-muted-foreground">Recorded versions and their configuration.</p>
                  </div>
                  {(detail.versions ?? []).map((item) => (
                    <MeasureDetailsSection
                      key={item.version_code ?? item.version_label ?? String(item.version_number)}
                      title={`${textValue(item.version_label ?? item.name ?? item.version_code ?? `Version ${item.version_number ?? ""}`)}${item.is_current ? " (Current)" : ""}`}
                      description="Version configuration"
                      details={[
                        { label: "Version code", value: item.version_code },
                        { label: "Number", value: item.version_number },
                        { label: "Status", value: item.status },
                        { label: "Data type", value: item.data_type },
                        { label: "UOM", value: item.unit_of_measure_code },
                        { label: "Decimals", value: item.decimal_places },
                      ]}
                    />
                  ))}
                </section>
              ) : (
                <Empty><EmptyHeader><EmptyTitle>No version history available for this indicator.</EmptyTitle></EmptyHeader></Empty>
              )}
            </div>
          )}
        </section>
        <aside className="flex min-w-0 flex-col gap-3">
          <Card className="min-w-0"><CardContent className="flex min-w-0 flex-col gap-3">
            <h3>
              <CheckCircle2 size={15} />
              Metadata Status
            </h3>
            <DetailLine
              label="Completeness"
              value={metadata?.is_active === false ? "Inactive" : metadataComplete ? "Complete" : `Incomplete: ${missingMetadata}`}
              tone={metadata?.is_active === false ? undefined : metadataComplete ? "success" : undefined}
            />
            <DetailLine label="Last Updated" value={compactDate(overview.last_updated ?? overview.updated_at ?? metadata?.latest_data_availability)} />
            <DetailLine label="Source Document" value={metadata?.source_document_name ?? metadata?.source_reference_code} />
            <DetailLine label="Metadata Version" value={version?.version_label ?? version?.version_code} />
          </CardContent></Card>

          <Card className="min-w-0"><CardContent className="flex min-w-0 flex-col gap-3">
            <h3>
              <Database size={15} />
              Ingestion Information
            </h3>
            <DetailLine label="Ingestion Method" value={ingestionInfo.method} />
            <DetailLine label="Data Source" value={ingestionInfo.source} />
            <DetailLine label="Last Submit Method" value={ingestionInfo.lastSubmissionMethod} />
            <DetailLine label="Last Submitted By" value={ingestionInfo.lastSubmittedBy} />
            <DetailLine label="Last Submitted On" value={ingestionInfo.lastSubmittedAt} />
            <DetailLine label="API Method" value={ingestionInfo.apiMethod} />
            <DetailLine label="API URL" value={ingestionInfo.apiUrl} />
            <DetailLine label="Credentials Hash" value={ingestionInfo.credentialsHash} />
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline" type="button" onClick={() => setIsIngestionJsonOpen(true)}>
                <Eye size={12} />
                {t("ingestion:pillarIndicators.view.viewJson")}
              </Button>
            </div>
          </CardContent></Card>

          <Card className="min-w-0"><CardContent className="flex min-w-0 flex-col gap-3">
            <h3>
              <FileText size={15} />
              Related Hierarchy
            </h3>
            {relatedHierarchyPath.length ? (
              relatedHierarchyPath.map((node) => (
                <DetailLine key={`${node.level_code}-${node.node_code}`} label={node.level_name ?? "Level"} value={nodeLabel(node)} />
              ))
            ) : (
              <DetailLine label="Framework" value="No hierarchy mapping found" />
            )}
            <DetailLine label="Indicator" value={`${indicatorNumber} - ${getIndicatorName(overview)}`} />
            <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 py-2">
              {relatedHierarchyPath.map((node, index) => {
                const parent = relatedHierarchyPath[index - 1];
                const path =
                  parent?.level_code && parent.node_code
                    ? `/framework/levels/${encodeURIComponent(String(parent.level_code))}/${encodeURIComponent(String(parent.node_code))}?selected=${encodeURIComponent(String(node.node_code))}`
                    : `/framework/levels/${encodeURIComponent(String(node.level_code))}/${encodeURIComponent(String(node.node_code))}`;
                return (
                  <Button variant="outline"

                    key={`${node.level_code}-${node.node_code}-action`}
                    type="button"
                    disabled={!node.level_code || !node.node_code}
                    onClick={() => navigate(path)}
                  >
                    <ExternalLink size={12} />
                    Open {node.level_name ?? "Level"}
                  </Button>
                );
              })}
            </div>
          </CardContent></Card>
        </aside>
      </div></>) })
          ))}
      />

      <Dialog className="sm:max-w-2xl" isOpen={isIngestionJsonOpen} onOpenChange={setIsIngestionJsonOpen}>
        <DialogHeader>
          <DialogTitle>{t("ingestion:pillarIndicators.view.jsonTitle")}</DialogTitle>
          <DialogDescription>{t("ingestion:pillarIndicators.view.jsonDescription")}</DialogDescription>
        </DialogHeader>
        <pre className="max-h-[60vh] overflow-auto rounded-md bg-muted p-4 font-mono text-xs">
              {typeof ingestionInfo.jsonStructure === "string"
                ? ingestionInfo.jsonStructure
                : JSON.stringify(ingestionInfo.jsonStructure, null, 2)}
        </pre>
      </Dialog>
    </div>
  );
}

function InfoSection({
  title,
  id,
  tone = "default",
  action,
  count = 0,
  isOpen = true,
  onToggle,
  children,
}: {
  title: string;
  id?: string;
  tone?: "default" | "framework" | "global" | "source" | "periodicity" | "officer" | "uom" | "measure";
  action?: ReactNode;
  count?: number;
  isOpen?: boolean;
  onToggle?: () => void;
  children: ReactNode;
}) {
  const stateText = count > 0 ? `${count} mapped` : "Pending";

  return (
    <Accordion data-section={tone}>
      <AccordionItem id={id ?? title} isExpanded={isOpen} onExpandedChange={onToggle}>
        <AccordionTrigger className="min-w-0 px-4 no-underline hover:no-underline">
          <span className="flex min-w-0 items-center gap-2">
            <span className="truncate">{title}</span>
            <Badge variant={count > 0 ? "secondary" : "outline"}>{stateText}</Badge>
          </span>
        </AccordionTrigger>
        <AccordionContent>
          {action ? <div className="mb-3 flex justify-end">{action}</div> : null}
          <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">{children}</div>
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}

function MeasureDetailsSection({ title, description = "Measure configuration", details, action }: { title: string; description?: string; details: MappingMetaItem[]; action?: ReactNode }) {
  const availableDetails = details
    .map((item) => ({ ...item, value: textValue(item.value) }))
    .filter((item) => item.value !== "-");

  return (
    <section className="flex flex-col gap-4 border-b pb-5 last:border-b-0 last:pb-0">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4 className="text-sm font-medium">{title}</h4>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
        {action}
      </div>
        {availableDetails.length ? (
          <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2 lg:grid-cols-3">
            {availableDetails.map((item) => (
              <div className="min-w-0 border-l-2 border-muted pl-3" key={item.label}>
                <dt className="text-xs text-muted-foreground">{item.label}</dt>
                <dd className="mt-1 break-words text-sm font-medium">{item.value}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="text-sm text-muted-foreground">No configuration details are available.</p>
        )}
    </section>
  );
}

function MappingListRow({
  title,
  meta,
  badge,
  onUnmap,
  disabled,
}: {
  title: string;
  meta: Array<MappingMetaItem | unknown>;
  badge?: unknown;
  onUnmap?: () => void;
  disabled?: boolean;
}) {
  const metaItems = meta
    .map((item, index) => {
      if (isMappingMetaItem(item)) {
        return { label: item.label, value: textValue(item.value) };
      }
      return { label: `Info ${index + 1}`, value: textValue(item) };
    })
    .filter((item) => item.value !== "-");

  return (
    <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 py-2">
      <div className="flex min-w-0 flex-1 flex-col gap-2">
        <strong className="flex min-w-0 items-center gap-2" title={title}>
          {badge ? <Badge variant="secondary">{textValue(badge)}</Badge> : null}
          {title}
        </strong>
        <div className="flex flex-wrap items-center gap-1.5">
          {metaItems.length ? (
            metaItems.map((item) => (
              <span className="inline-flex max-w-full flex-wrap gap-1 text-xs" key={`${item.label}-${item.value}`}>
                <span className="text-muted-foreground">{item.label}:</span>
                <span className="break-words">{item.value}</span>
              </span>
            ))
          ) : (
            <span className="text-muted-foreground">-</span>
          )}
        </div>
      </div>
      {onUnmap && (
        <Button variant="ghost" className="text-destructive" type="button" disabled={disabled} onClick={onUnmap}>
          Unmap
        </Button>
      )}
    </div>
  );
}

function isMappingMetaItem(item: MappingMetaItem | unknown): item is MappingMetaItem {
  return Boolean(item && typeof item === "object" && "label" in item && "value" in item);
}

function DetailLine({ label, value, tone }: { label: string; value: unknown; tone?: "success" }) {
  return (
    <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 py-2">
      <span>{label}</span>
      <strong className={tone === "success" ? "text-success" : ""}>{textValue(value)}</strong>
    </div>
  );
}
