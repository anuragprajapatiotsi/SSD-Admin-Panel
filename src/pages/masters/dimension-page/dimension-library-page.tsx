import { CardContent, Card } from "@/components/ui/card";
import { useConfirmation } from "@/hooks/use-confirmation";
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty";

import { StatusBadge } from "@/components/common/status-badge";
import { normalizeStatusVariant } from "@/components/common/status-variants";
import { BooleanField } from "@/components/common/boolean-field";
import { Dialog, DialogTitle } from "@/components/ui/dialog";

import { Sheet, SheetTitle } from "@/components/ui/sheet";

import { PageSection, PageHeader } from "@/components/common/page-layout";

import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";

import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { CustomTabs } from "@/components/common/custom-tabs";
import {
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { createDataTableColumnHelper, DataTable, useDataTable } from "@/components/data-table";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCreateAtom, useSelector } from "@tanstack/react-store";
import type { PaginationState } from "@tanstack/react-table";
import {
  ArrowLeft,
  ChevronRight,
  Edit3,
  Ellipsis,
  Plus,
  // RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  getFrameworkHierarchy,
  listFrameworkEditions,
  type FrameworkHierarchy,
  type FrameworkNode,
} from "../../../api/framework.api";
import { listIndicators, type IndicatorListItem } from "../../../api/indicators.api";
import {
  createDimension,
  createDimensionAlias,
  createDimensionMember,
  createDimensionMemberSet,
  createDimensionMemberSetItem,
  createDimensionRelationship,
  createDimensionRollupRule,
  deactivateDimension,
  deactivateDimensionAlias,
  deactivateDimensionMember,
  deactivateDimensionMemberSet,
  deactivateDimensionMemberSetItem,
  deactivateDimensionRelationship,
  deactivateDimensionRollupRule,
  getDimension,
  listDimensionAliases,
  listDimensionManagementRows,
  listDimensionMemberSets,
  listDimensionMemberSetMembers,
  listDimensionMembers,
  listDimensionRelationships,
  listDimensionRollupRules,
  listDimensions,
  listDimensionStructureTypes,
  updateDimension,
  type DimensionAlias,
  type DimensionDetail,
  type DimensionManagementRow,
  type DimensionMember,
  type DimensionMemberSet,
  type DimensionMemberSetItem,
  type DimensionRelationship,
  type DimensionRollupRule,
  type DimensionStructureType,
  type DimensionUsedIndicator,
} from "../../../api/dimensions.api";
import { Loader } from "../../../components/common/loader";
import { clampPageOffset } from "../../../utils/pagination";
import { LOCALE_CHANGED_EVENT, UNIT_CHANGED_EVENT } from "../../../api/session.api";

type DetailTab = "overview" | "members" | "relationships" | "sets" | "rollups" | "aliases";
type DrawerMode = "dimension" | "member" | "relationship" | "set" | "setItem" | "alias" | "rollup";
const dimensionColumnHelper = createDataTableColumnHelper<DimensionManagementRow>();
const DETAIL_TABS: DetailTab[] = ["members", "relationships", "sets", "rollups", "aliases"];

const STRUCTURE_FILTERS = [
  { value: "ALL", key: "all" },
  { value: "MASTER_DATASET", key: "masterDataset" },
  { value: "HIERARCHICAL", key: "hierarchical" },
  { value: "FIXED_LIST", key: "fixedList" },
  { value: "RANGE_BUCKETS", key: "rangeBuckets" },
];

const SPECIAL_DIMENSION_CODES = new Set(["GEOGRAPHY", "TIME_PERIOD"]);

type GoalFilterOption = {
  code: string;
  label: string;
  levelName: string;
};

const emptyDimensionForm = {
  dimension_code: "",
  dimension_type: "GENERAL",
  dimension_structure_type: "FIXED_LIST",
  value_type: "TEXT",
  is_hierarchical: false,
  sort_order: 0,
  is_active: true,
  name: "",
  name_hi: "",
  description: "",
};

const emptyMemberForm = {
  member_code: "",
  external_code: "",
  sort_order: 0,
  valid_from: "",
  valid_to: "",
  is_active: true,
  name: "",
  name_hi: "",
  short_name: "",
  description: "",
};

const emptyRelationshipForm = {
  parent_member_code: "",
  child_member_code: "",
  relationship_type: "PARENT_CHILD",
  sort_order: 0,
  is_active: true,
};

const emptySetForm = {
  set_code: "",
  set_type: "CONTROLLED_SCOPE",
  is_active: true,
  name: "",
  description: "",
};

const emptySetItemForm = {
  set_code: "",
  member_code: "",
  sort_order: 0,
  is_active: true,
};

const emptyAliasForm = {
  member_code: "",
  alias_type: "SOURCE_CODE",
  alias_value: "",
  source_system_code: "",
  alias_locale_code: "",
  is_active: true,
};

const emptyRollupForm = {
  parent_member_code: "",
  rule_code: "",
  entry_mode: "MANUAL_WITH_VALIDATION",
  aggregation_method: "SUM",
  measure_code: "",
  weight_measure_code: "",
  validation_rule_code: "",
  is_active: true,
};

const emptyRollupChild = {
  member_code: "",
  child_order: 1,
  child_weight: "",
};

function textValue(value: unknown) {
  return value === undefined || value === null || value === "" ? "-" : String(value);
}

function numberValue(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function statusOf(record: { status?: string; is_active?: boolean }) {
  if (record.is_active === false) return "INACTIVE";
  return (record.status || "ACTIVE").toUpperCase();
}

function displayName(record: DimensionManagementRow | DimensionDetail | null | undefined) {
  return textValue(record?.dimension_name ?? record?.name ?? record?.dimension_code);
}

function localizedHindiName(record: { name_hi?: unknown } | null | undefined) {
  const value = record?.name_hi;
  return value === undefined || value === null || value === "" ? "" : String(value);
}

function structureLabel(record: DimensionManagementRow | DimensionDetail | null | undefined) {
  return textValue(record?.dimension_structure_type_name ?? record?.type ?? record?.dimension_structure_type ?? record?.dimension_type);
}

function normalizedStatus(value: unknown) {
  return String(value ?? "").trim().toUpperCase();
}

function frameworkNodeOptionLabel(node: FrameworkNode) {
  const number = textValue(node.node_number);
  const name = textValue(node.name ?? node.short_name ?? node.node_code);
  return [number === "-" ? "" : number, name === "-" ? "" : name].filter(Boolean).join(" - ") || node.node_code;
}

function compactGoalFilterLabel(label: string, maxWords = 6) {
  const normalized = label.replace(/\s+/g, " ").trim();
  const words = normalized.split(" ").filter(Boolean);
  return words.length > maxWords ? `${words.slice(0, maxWords).join(" ")}...` : normalized;
}

async function loadGoalFilterOptions(): Promise<GoalFilterOption[]> {
  const activeEditionResponse = await listFrameworkEditions(false);
  const activeEdition =
    activeEditionResponse.data.find((edition) => edition.is_active !== false && normalizedStatus(edition.status) === "ACTIVE") ??
    activeEditionResponse.data.find((edition) => edition.is_active !== false);
  if (!activeEdition?.framework_code) return [];

  const hierarchyResponse = await getFrameworkHierarchy(activeEdition.framework_code, activeEdition.edition_code);
  const hierarchy: FrameworkHierarchy | null = hierarchyResponse.data ?? null;
  const levels = [...(hierarchy?.levels ?? [])].sort((left, right) => (left.level_number ?? 0) - (right.level_number ?? 0));
  const topLevel = levels[0];
  if (!topLevel?.level_code) return [];

  const levelName = textValue(topLevel.name ?? topLevel.level_code) === "-" ? "Goal" : textValue(topLevel.name ?? topLevel.level_code);
  return (hierarchy?.nodes ?? [])
    .filter((node) => node.is_active !== false && node.level_code === topLevel.level_code)
    .map((node) => ({
      code: node.node_code,
      label: frameworkNodeOptionLabel(node),
      levelName,
    }));
}

export function DimensionLibraryPage() {
  const confirm = useConfirmation();
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const { dimensionCode: routeDimensionCode = "" } = useParams<{ dimensionCode?: string }>();
  const isDetailPage = Boolean(routeDimensionCode);
  const [rows, setRows] = useState<DimensionManagementRow[]>([]);
  const [selectedCode, setSelectedCode] = useState(routeDimensionCode);
  const [selectedDetail, setSelectedDetail] = useState<DimensionDetail | null>(null);
  const [members, setMembers] = useState<DimensionMember[]>([]);
  const [relationships, setRelationships] = useState<DimensionRelationship[]>([]);
  const [sets, setSets] = useState<DimensionMemberSet[]>([]);
  const [setItems, setSetItems] = useState<Record<string, DimensionMemberSetItem[]>>({});
  const [aliases, setAliases] = useState<DimensionAlias[]>([]);
  const [rollups, setRollups] = useState<DimensionRollupRule[]>([]);
  const [structureTypes, setStructureTypes] = useState<DimensionStructureType[]>([]);
  const [activeTab, setActiveTab] = useState<DetailTab>("members");
  const [drawer, setDrawer] = useState<DrawerMode | null>(null);
  const [dimensionForm, setDimensionForm] = useState(emptyDimensionForm);
  const [memberForm, setMemberForm] = useState(emptyMemberForm);
  const [relationshipForm, setRelationshipForm] = useState(emptyRelationshipForm);
  const [setForm, setSetForm] = useState(emptySetForm);
  const [setItemForm, setSetItemForm] = useState(emptySetItemForm);
  const [setItemMemberCodes, setSetItemMemberCodes] = useState<string[]>([]);
  const [aliasForm, setAliasForm] = useState(emptyAliasForm);
  const [rollupForm, setRollupForm] = useState(emptyRollupForm);
  const [rollupChildren, setRollupChildren] = useState([emptyRollupChild]);
  const [listModal, setListModal] = useState<{ title: string; rows: DimensionMember[] } | null>(null);
  const [usedIndicatorsModal, setUsedIndicatorsModal] = useState<{ title: string; rows: DimensionUsedIndicator[] } | null>(null);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [structureFilter, setStructureFilter] = useState("ALL");
  const [usageFilter, setUsageFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ACTIVE");
  const [indicatorFilter, setIndicatorFilter] = useState("");
  const [isIndicatorFilterOpen, setIsIndicatorFilterOpen] = useState(false);
  const [indicatorOptions, setIndicatorOptions] = useState<IndicatorListItem[]>([]);
  const [goalFilter, setGoalFilter] = useState("ALL");
  const [goalOptions, setGoalOptions] = useState<GoalFilterOption[]>([]);
  const [pageSize, setPageSize] = useState(10);
  const [offset, setOffset] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDetailLoading, setIsDetailLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editingMemberCode, setEditingMemberCode] = useState("");
  const [editingRollupKey, setEditingRollupKey] = useState("");
  const didInitialLoadRef = useRef(false);

  const selectedRow = useMemo(
    () => rows.find((row) => row.dimension_code === selectedCode) ?? null,
    [rows, selectedCode],
  );
  const detailRecord = selectedDetail ?? selectedRow;
  const filteredRows = rows;
  const goalNodeLabel = goalOptions[0]?.levelName || t("pages.dimensions.filters.goal");
  const selectedGoalOption = goalFilter === "ALL" ? null : goalOptions.find((goal) => goal.code === goalFilter) ?? null;
  const selectedGoalTooltip = selectedGoalOption?.label ?? t("pages.dimensions.filters.allGoals", { goal: goalNodeLabel.toLowerCase() });

  useEffect(() => {
    void loadPage({ forceSupport: true }).finally(() => {
      didInitialLoadRef.current = true;
    });
    const handleContextChange = () => {
      setOffset(0);
      setStructureTypes([]);
      setIndicatorOptions([]);
      setGoalOptions([]);
      setGoalFilter("ALL");
      void loadPage({ forceSupport: true });
    };
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
      setOffset(0);
    }, 280);
    return () => window.clearTimeout(timeout);
  }, [query]);

  useEffect(() => {
    if (!didInitialLoadRef.current) return;
    void loadPage();
  }, [debouncedQuery, structureFilter, usageFilter, statusFilter, indicatorFilter, goalFilter, pageSize, offset]);

  useEffect(() => {
    const nextOffset = clampPageOffset(offset, pageSize, totalCount);
    if (nextOffset !== offset) setOffset(nextOffset);
  }, [offset, pageSize, totalCount]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 3400);
    return () => window.clearTimeout(timer);
  }, [notice]);

  useEffect(() => {
    if (!routeDimensionCode) return;
    setSelectedCode(routeDimensionCode);
    setSelectedDetail(null);
    void loadDetail(routeDimensionCode);
  }, [routeDimensionCode]);

  async function loadPage(options: { forceSupport?: boolean } = {}) {
    setIsLoading(true);
    setError("");
    try {
      const shouldLoadSupport = options.forceSupport || !structureTypes.length || !indicatorOptions.length || !goalOptions.length;
      const hasActiveRowFilter =
        Boolean(debouncedQuery.trim()) ||
        structureFilter !== "ALL" ||
        usageFilter !== "ALL" ||
        statusFilter !== "ACTIVE" ||
        Boolean(indicatorFilter.trim()) ||
        goalFilter !== "ALL";
      const rowPromise = listDimensionManagementRows({
          limit: pageSize,
          offset,
          searchText: debouncedQuery,
          structureType: structureFilter,
          usageFilter,
          statusFilter,
          indicatorCode: indicatorFilter,
          goalCode: goalFilter,
        }).catch(async (rowError) => {
          if (hasActiveRowFilter) {
            throw rowError;
          }
          const fallback = await listDimensions();
          return { data: { rows: fallback.data, total_count: fallback.count ?? fallback.data.length } };
        });
      const supportPromise = shouldLoadSupport
        ? Promise.all([
            listDimensionStructureTypes().catch(() => ({ data: [] as DimensionStructureType[] })),
            listIndicators({ limit: 500, offset: 0, statusFilter: "ALL" }).catch(() => ({ data: [] as IndicatorListItem[] })),
            loadGoalFilterOptions().catch(() => [] as GoalFilterOption[]),
          ])
        : Promise.resolve([null, null, null] as const);
      const [rowResponse, [structureResponse, indicatorResponse, goalResponse]] = await Promise.all([rowPromise, supportPromise]);
      const nextRows = (rowResponse.data?.rows ?? []).filter((row) => !SPECIAL_DIMENSION_CODES.has(String(row.dimension_code ?? "").toUpperCase()));
      setRows(nextRows);
      setTotalCount(Number(rowResponse.data?.total_count ?? nextRows.length));
      if (structureResponse) setStructureTypes(structureResponse.data ?? []);
      if (indicatorResponse) setIndicatorOptions(indicatorResponse.data ?? []);
      if (goalResponse) setGoalOptions(goalResponse);
      setSelectedCode((current) => routeDimensionCode || (current && nextRows.some((row) => row.dimension_code === current) ? current : ""));
    } catch {
      setRows([]);
      setTotalCount(0);
      setSelectedCode(routeDimensionCode);
      setError(t("pages.dimensions.errors.libraryLoad"));
    } finally {
      setIsLoading(false);
    }
  }

  async function loadDetail(dimensionCode: string) {
    setIsDetailLoading(true);
    setError("");
    try {
      const [detailResponse, membersResponse, relationshipsResponse, setsResponse, aliasesResponse, rollupsResponse] = await Promise.all([
        getDimension(dimensionCode),
        listDimensionMembers(dimensionCode).catch(() => ({ data: [] as DimensionMember[] })),
        listDimensionRelationships(dimensionCode).catch(() => ({ data: [] as DimensionRelationship[] })),
        listDimensionMemberSets(dimensionCode).catch(() => ({ data: [] as DimensionMemberSet[] })),
        listDimensionAliases(dimensionCode).catch(() => ({ data: [] as DimensionAlias[] })),
        listDimensionRollupRules(dimensionCode).catch(() => ({ data: [] as DimensionRollupRule[] })),
      ]);
      setSelectedDetail(detailResponse.data);
      setMembers(membersResponse.data ?? []);
      setRelationships(relationshipsResponse.data ?? []);
      const nextSets = setsResponse.data ?? [];
      setSets(nextSets);
      const itemEntries = await Promise.all(
        nextSets
          .filter((set) => set.set_code)
          .map(async (set) => {
            const items = await listDimensionMemberSetMembers(set.set_code ?? "").catch(() => ({ data: [] as DimensionMemberSetItem[] }));
            return [set.set_code ?? "", items.data ?? []] as const;
          }),
      );
      setSetItems(Object.fromEntries(itemEntries));
      setAliases(aliasesResponse.data ?? []);
      setRollups(rollupsResponse.data ?? []);
    } catch {
      setSelectedDetail(selectedRow);
      setError(t("pages.dimensions.errors.detailLoad"));
    } finally {
      setIsDetailLoading(false);
    }
  }

  function openDimensionDrawer(record?: DimensionManagementRow | DimensionDetail | null) {
    setDimensionForm(
      record
        ? {
            dimension_code: record.dimension_code ?? "",
            dimension_type: record.dimension_type ?? "GENERAL",
            dimension_structure_type: record.dimension_structure_type ?? (record.is_hierarchical ? "HIERARCHICAL" : "FIXED_LIST"),
            value_type: record.value_type ?? "TEXT",
            is_hierarchical: record.dimension_structure_type === "HIERARCHICAL" || Boolean(record.is_hierarchical),
            sort_order: numberValue(record.sort_order),
            is_active: record.is_active !== false,
            name: displayName(record) === "-" ? "" : displayName(record),
            name_hi: localizedHindiName(record),
            description: record.description ?? "",
          }
        : emptyDimensionForm,
    );
    setDrawer("dimension");
  }

  async function submitDimension(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const dimensionCode = dimensionForm.dimension_code.trim();
    if (!dimensionCode) {
      setError(t("pages.dimensions.errors.codeRequired"));
      return;
    }
    if (!dimensionForm.name.trim()) {
      setError(t("pages.dimensions.errors.nameRequired"));
      return;
    }
    setIsSaving(true);
    setError("");
    try {
      const payload = {
        dimension_code: dimensionCode,
        dimension_type: dimensionForm.dimension_type,
        dimension_structure_type: dimensionForm.dimension_structure_type,
        value_type: dimensionForm.value_type,
        is_hierarchical: dimensionForm.dimension_structure_type === "HIERARCHICAL",
        sort_order: Number(dimensionForm.sort_order) || 0,
        is_active: dimensionForm.is_active,
        name: dimensionForm.name.trim(),
        name_hi: dimensionForm.name_hi.trim() || undefined,
        description: dimensionForm.description.trim() || undefined,
      };
      if (selectedDetail?.dimension_code && dimensionForm.dimension_code === selectedDetail.dimension_code) {
        const response = await updateDimension(selectedDetail.dimension_code, payload);
        const updatedDetail = response.data;
        setSelectedDetail(updatedDetail);
        setRows((current) =>
          current.map((row) =>
            row.dimension_code === selectedDetail.dimension_code
              ? { ...row, ...updatedDetail, dimension_name: updatedDetail.name ?? row.dimension_name }
              : row,
          ),
        );
      } else {
        const response = await createDimension(payload);
        if (response.data.dimension_code) setSelectedCode(response.data.dimension_code);
        await loadPage({ forceSupport: true });
      }
      setNotice(t("pages.dimensions.notifications.saved"));
      setDrawer(null);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : t("pages.dimensions.errors.save"));
    } finally {
      setIsSaving(false);
    }
  }

  async function submitMember(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedCode || !memberForm.name.trim()) return;
    setIsSaving(true);
    setError("");
    try {
      await createDimensionMember(selectedCode, {
        member_code: memberForm.member_code.trim() || undefined,
        external_code: memberForm.external_code.trim() || undefined,
        sort_order: Number(memberForm.sort_order) || 0,
        valid_from: memberForm.valid_from || undefined,
        valid_to: memberForm.valid_to || undefined,
        is_active: memberForm.is_active,
        name: memberForm.name.trim(),
        name_hi: memberForm.name_hi.trim() || undefined,
        short_name: memberForm.short_name.trim() || undefined,
        description: memberForm.description.trim() || undefined,
      });
      setNotice(t(editingMemberCode ? "pages.dimensions.notifications.memberUpdated" : "pages.dimensions.notifications.memberSaved"));
      setEditingMemberCode("");
      setDrawer(null);
      await loadDetail(selectedCode);
      await loadPage();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : t("pages.dimensions.errors.memberSave"));
    } finally {
      setIsSaving(false);
    }
  }

  async function submitRelationship(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedCode || !relationshipForm.parent_member_code || !relationshipForm.child_member_code) return;
    setIsSaving(true);
    setError("");
    try {
      await createDimensionRelationship(selectedCode, {
        parent_member_code: relationshipForm.parent_member_code,
        child_member_code: relationshipForm.child_member_code,
        relationship_type: relationshipForm.relationship_type,
        sort_order: Number(relationshipForm.sort_order) || 0,
        is_active: relationshipForm.is_active,
      });
      setNotice(t("pages.dimensions.notifications.relationshipSaved"));
      setDrawer(null);
      await loadDetail(selectedCode);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : t("pages.dimensions.errors.relationshipSave"));
    } finally {
      setIsSaving(false);
    }
  }

  async function submitSet(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedCode || !setForm.name.trim()) return;
    setIsSaving(true);
    setError("");
    try {
      await createDimensionMemberSet(selectedCode, {
        set_code: setForm.set_code.trim() || undefined,
        set_type: setForm.set_type,
        is_active: setForm.is_active,
        name: setForm.name.trim(),
        description: setForm.description.trim() || undefined,
      });
      setNotice(t("pages.dimensions.notifications.setSaved"));
      setDrawer(null);
      await loadDetail(selectedCode);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : t("pages.dimensions.errors.setSave"));
    } finally {
      setIsSaving(false);
    }
  }

  async function submitSetItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const memberCodes = setItemMemberCodes.length ? setItemMemberCodes : setItemForm.member_code ? [setItemForm.member_code] : [];
    if (!selectedCode || !setItemForm.set_code || memberCodes.length === 0) return;
    setIsSaving(true);
    setError("");
    try {
      await Promise.all(
        memberCodes.map((memberCode, index) =>
          createDimensionMemberSetItem(setItemForm.set_code, {
            dimension_code: selectedCode,
            member_code: memberCode,
            sort_order: (Number(setItemForm.sort_order) || 0) + index,
            is_active: setItemForm.is_active,
          }),
        ),
      );
      setNotice(t(memberCodes.length > 1 ? "pages.dimensions.notifications.membersAdded" : "pages.dimensions.notifications.memberAdded"));
      setDrawer(null);
      setSetItemMemberCodes([]);
      await loadDetail(selectedCode);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : t("pages.dimensions.errors.memberAdd"));
    } finally {
      setIsSaving(false);
    }
  }

  async function submitAlias(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedCode || !aliasForm.member_code || !aliasForm.alias_value.trim()) return;
    setIsSaving(true);
    setError("");
    try {
      await createDimensionAlias(selectedCode, {
        member_code: aliasForm.member_code,
        alias_type: aliasForm.alias_type,
        alias_value: aliasForm.alias_value.trim(),
        source_system_code: aliasForm.source_system_code.trim() || undefined,
        alias_locale_code: aliasForm.alias_locale_code.trim() || undefined,
        is_active: aliasForm.is_active,
      });
      setNotice(t("pages.dimensions.notifications.aliasSaved"));
      setDrawer(null);
      await loadDetail(selectedCode);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : t("pages.dimensions.errors.aliasSave"));
    } finally {
      setIsSaving(false);
    }
  }

  async function submitRollup(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!selectedCode || !rollupForm.parent_member_code) return;
    setIsSaving(true);
    setError("");
    try {
      await createDimensionRollupRule(selectedCode, {
        parent_member_code: rollupForm.parent_member_code,
        rule_code: rollupForm.rule_code.trim() || undefined,
        entry_mode: rollupForm.entry_mode,
        aggregation_method: rollupForm.aggregation_method,
        measure_code: rollupForm.measure_code.trim() || undefined,
        weight_measure_code: rollupForm.weight_measure_code.trim() || undefined,
        validation_rule_code: rollupForm.validation_rule_code.trim() || undefined,
        is_active: rollupForm.is_active,
        children: rollupChildren
          .filter((child) => child.member_code)
          .map((child, index) => ({
            member_code: child.member_code,
            child_order: Number(child.child_order) || index + 1,
            child_weight: child.child_weight === "" ? undefined : Number(child.child_weight),
            is_active: true,
          })),
      });
      setNotice(t(editingRollupKey ? "pages.dimensions.notifications.rollupUpdated" : "pages.dimensions.notifications.rollupSaved"));
      setEditingRollupKey("");
      setDrawer(null);
      await loadDetail(selectedCode);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : t("pages.dimensions.errors.rollupSave"));
    } finally {
      setIsSaving(false);
    }
  }

  function openTabCreate(tab: DetailTab) {
    if (tab === "overview") {
      navigate("/masters/dimensions/create");
    } else if (tab === "members") {
      setEditingMemberCode("");
      setMemberForm(emptyMemberForm);
      setDrawer("member");
    } else if (tab === "relationships") {
      setRelationshipForm(emptyRelationshipForm);
      setDrawer("relationship");
    } else if (tab === "sets") {
      setSetForm(emptySetForm);
      setDrawer("set");
    } else if (tab === "rollups") {
      setEditingRollupKey("");
      setRollupForm(emptyRollupForm);
      setRollupChildren([emptyRollupChild]);
      setDrawer("rollup");
    } else {
      setAliasForm(emptyAliasForm);
      setDrawer("alias");
    }
  }

  function openMemberEdit(member: DimensionMember) {
    setEditingMemberCode(member.member_code ?? "");
    setMemberForm({
      member_code: member.member_code ?? "",
      external_code: member.external_code ?? "",
      sort_order: numberValue(member.sort_order),
      valid_from: member.valid_from ?? "",
      valid_to: member.valid_to ?? "",
      is_active: member.is_active !== false,
      name: member.name ?? "",
      name_hi: member.name_hi ?? "",
      short_name: member.short_name ?? "",
      description: member.description ?? "",
    });
    setDrawer("member");
  }

  function openRollupEdit(rollup: DimensionRollupRule) {
    setEditingRollupKey(`${rollup.parent_member_code ?? ""}:${rollup.rule_code ?? ""}`);
    setRollupForm({
      parent_member_code: rollup.parent_member_code ?? "",
      rule_code: rollup.rule_code ?? "",
      entry_mode: rollup.entry_mode ?? "MANUAL_WITH_VALIDATION",
      aggregation_method: rollup.aggregation_method ?? "SUM",
      measure_code: rollup.measure_code ?? "",
      weight_measure_code: rollup.weight_measure_code ?? "",
      validation_rule_code: rollup.validation_rule_code ?? "",
      is_active: rollup.is_active !== false,
    });
    const children = (rollup.children ?? []).map((child, index) => ({
      member_code: String(child.member_code ?? child.child_member_code ?? ""),
      child_order: Number(child.child_order ?? index + 1),
      child_weight: child.child_weight === undefined || child.child_weight === null ? "" : String(child.child_weight),
    }));
    setRollupChildren(children.length ? children : [emptyRollupChild]);
    setDrawer("rollup");
  }

  async function handleDeactivate(action: () => Promise<unknown>, successMessage: string) {
    if (!(await confirm(t("pages.dimensions.confirmDeactivate")))) return;
    setIsSaving(true);
    setError("");
    try {
      await action();
      setNotice(successMessage);
      if (selectedCode) await loadDetail(selectedCode);
      await loadPage();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : t("pages.dimensions.errors.deactivate"));
    } finally {
      setIsSaving(false);
    }
  }

  async function openMemberList(row: DimensionManagementRow) {
    setListModal({ title: displayName(row), rows: [] });
    try {
      const response = await listDimensionMembers(row.dimension_code ?? "", 500);
      setListModal({ title: displayName(row), rows: response.data ?? [] });
    } catch {
      setListModal({ title: displayName(row), rows: [] });
      setError(t("pages.dimensions.errors.memberListLoad"));
    }
  }

  const visibleIndicatorOptions = useMemo(() => {
    const term = indicatorFilter.trim().toLowerCase();
    return indicatorOptions
      .filter((indicator) => {
        if (!term) return true;
        const number = String(indicator.indicator_number ?? "").toLowerCase();
        const code = String(indicator.national_indicator_code ?? "").toLowerCase();
        const name = String(indicator.name ?? "").toLowerCase();
        return number.includes(term) || code.includes(term) || name.includes(term);
      })
      .slice(0, 30);
  }, [indicatorFilter, indicatorOptions]);

  const dimensionColumns = dimensionColumnHelper.columns([
    dimensionColumnHelper.display({ id: "dimension", header: t("pages.dimensions.table.dimension"), cell: ({ row }) => <div className="flex min-w-0 flex-col gap-1 [&>span]:text-xs [&>span]:text-muted-foreground"><LocalizedName primary={displayName(row.original)} hindi={localizedHindiName(row.original)} /></div> }),
    dimensionColumnHelper.display({ id: "type", header: t("pages.dimensions.table.type"), cell: ({ row }) => <div className="flex min-w-0 items-center gap-2"><strong>{structureLabel(row.original)}</strong>{/* Show List is intentionally hidden. */}</div> }),
    // Members column is intentionally hidden from the Dimension Library table.
    // dimensionColumnHelper.accessor("value_count", { header: "Members", cell: ({ getValue }) => numberValue(getValue()).toLocaleString("en-IN") }),
    // Used column is intentionally hidden from the Dimension Library table.
    // dimensionColumnHelper.display({ id: "used", header: "Used", cell: ({ row }) => numberValue(row.original.used_in_count) > 0 ? <Button className="count-link-button" type="button" title="Show indicators using this dimension" onClick={(event) => { event.stopPropagation(); setUsedIndicatorsModal({ title: displayName(row.original), rows: row.original.used_indicators ?? [] }); }}>{numberValue(row.original.used_in_count).toLocaleString("en-IN")}</Button> : "0" }),
    // Status column is intentionally hidden from the Dimension Library table.
    // dimensionColumnHelper.display({ id: "status", header: "Status", cell: ({ row }) => <StatusPill record={row.original} /> }),
    dimensionColumnHelper.display({
      id: "actions",
      header: () => <span className="block text-right">{t("pages.dimensions.table.actions")}</span>,
      enableSorting: false,
      cell: ({ row }) => (
        <div className="flex justify-end" onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
          <DropdownMenuTrigger>
            <Button type="button" variant="ghost" size="icon-sm" aria-label={t("pages.dimensions.actions.for", { name: displayName(row.original) })}>
              <Ellipsis aria-hidden="true" />
            </Button>
            <DropdownMenu aria-label={t("pages.dimensions.actions.for", { name: displayName(row.original) })} className="min-w-40" placement="bottom end">
              <DropdownMenuLabel>{t("pages.dimensions.actions.menu")}</DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem id="edit" onAction={() => navigate(`/masters/dimensions/${encodeURIComponent(row.original.dimension_code ?? "")}/edit`, { state: { returnTo: "/masters/dimensions" } })}>
                  <Edit3 aria-hidden="true" />
                  {t("pages.dimensions.actions.edit")}
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem id="deactivate" variant="destructive" isDisabled={isSaving} onAction={() => void handleDeactivate(() => deactivateDimension(row.original.dimension_code ?? ""), t("pages.dimensions.notifications.deactivated"))}>
                  <Trash2 aria-hidden="true" />
                  {t("pages.dimensions.actions.deactivate")}
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenu>
          </DropdownMenuTrigger>
        </div>
      ),
    }),
  ]);
  const dimensionPaginationAtom = useCreateAtom<PaginationState>({ pageIndex: Math.floor(offset / pageSize), pageSize });
  const dimensionPagination = useSelector(dimensionPaginationAtom, (value) => value);

  useEffect(() => {
    const nextOffset = dimensionPagination.pageIndex * dimensionPagination.pageSize;
    if (nextOffset !== offset) setOffset(nextOffset);
    if (dimensionPagination.pageSize !== pageSize) setPageSize(dimensionPagination.pageSize);
  }, [dimensionPagination.pageIndex, dimensionPagination.pageSize, offset, pageSize]);

  const dimensionTable = useDataTable({
    columns: dimensionColumns,
    data: filteredRows,
    atoms: { pagination: dimensionPaginationAtom },
    manualPagination: true,
    rowCount: totalCount,
    getRowId: (row) => row.dimension_code ?? "",
    enableMultiSort: false,
    enableRowSelection: false,
    autoResetPageIndex: false,
  });
  const dimensionFilters = (
    <section
      className="grid grid-cols-1 gap-2 rounded-md bg-muted/50 p-2 md:grid-cols-2 lg:grid-cols-6"
      aria-label={t("pages.dimensions.table.label")}
    >
      <InputGroup className="md:col-span-2">
        <InputGroupAddon><Search aria-hidden="true" /></InputGroupAddon>
        <InputGroupInput
          aria-label={t("pages.dimensions.filters.search")}
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("pages.dimensions.filters.search")}
        />
      </InputGroup>
      <Select
        className="min-w-0 w-full"
        aria-label={goalNodeLabel}
        selectedKey={goalFilter}
        onSelectionChange={(key) => { setGoalFilter(String(key ?? "ALL")); setOffset(0); }}
      >
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem id="ALL">{t("pages.dimensions.filters.allGoals", { goal: goalNodeLabel.toLowerCase() })}</SelectItem>
            {goalOptions.map((goal) => <SelectItem id={goal.code} key={goal.code}>{compactGoalFilterLabel(goal.label)}</SelectItem>)}
          </SelectGroup>
        </SelectContent>
      </Select>
      <Select
        className="min-w-0 w-full"
        aria-label={t("pages.dimensions.filters.structure")}
        selectedKey={structureFilter}
        onSelectionChange={(key) => { setStructureFilter(String(key ?? "ALL")); setOffset(0); }}
      >
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {STRUCTURE_FILTERS.map((filter) => <SelectItem id={filter.value} key={filter.value}>{t(`pages.dimensions.structures.${filter.key}`)}</SelectItem>)}
          </SelectGroup>
        </SelectContent>
      </Select>
      {/* Usage filter is intentionally hidden from the Dimension Library toolbar.
      <Select
        aria-label="Usage"
        selectedKey={usageFilter}
        onSelectionChange={(key) => { setUsageFilter(String(key ?? "ALL")); setOffset(0); }}
      >
        <SelectTrigger size="sm" className="w-28"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem id="ALL">All usage</SelectItem>
          <SelectItem id="USED">Used</SelectItem>
          <SelectItem id="UNUSED">Unused</SelectItem>
        </SelectContent>
      </Select>
      */}
      <Select
        className="min-w-0 w-full"
        aria-label={t("pages.dimensions.filters.status")}
        selectedKey={statusFilter}
        onSelectionChange={(key) => { setStatusFilter(String(key ?? "ACTIVE")); setOffset(0); }}
      >
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem id="ACTIVE">{t("pages.dimensions.status.active")}</SelectItem>
            <SelectItem id="ALL">{t("pages.dimensions.status.all")}</SelectItem>
            <SelectItem id="INACTIVE">{t("pages.dimensions.status.inactive")}</SelectItem>
          </SelectGroup>
        </SelectContent>
      </Select>
      <Select
        className="min-w-0 w-full"
        aria-label={t("pages.dimensions.filters.indicatorNumber")}
        value={indicatorFilter || "ALL"}
        onChange={(key) => { setIndicatorFilter(key === "ALL" ? "" : String(key ?? "")); setOffset(0); }}
      >
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectGroup>
            <SelectItem id="ALL">{t("pages.dimensions.filters.allIndicators")}</SelectItem>
            {indicatorOptions.map((indicator) => {
              const value = indicator.indicator_number || indicator.national_indicator_code || "";
              return value ? <SelectItem id={value} key={`${indicator.national_indicator_code}-${value}`}>{value}</SelectItem> : null;
            })}
          </SelectGroup>
        </SelectContent>
      </Select>
    </section>
  );

  return (
    <PageSection className="flex min-w-0 flex-col gap-4">
      <PageHeader>
        <div>
          {isDetailPage ? (
            <>
              <Button variant="ghost"  type="button" onClick={() => navigate("/masters/dimensions")}>
                <ArrowLeft size={15} />
                {t("pages.dimensions.actions.back")}
              </Button>
              <h2>{detailRecord ? displayName(detailRecord) : selectedCode}</h2>
              <p>{t("pages.dimensions.detailDescription")}</p>
            </>
          ) : (
            <>
              <h2>{t("pages.dimensions.title")}</h2>
              <p>{t("pages.dimensions.description")}</p>
            </>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {/* Refresh is intentionally hidden.
          <Button className="secondary-button compact" type="button" onClick={() => isDetailPage ? void loadDetail(selectedCode) : void loadPage()}>
            <RefreshCw size={13} />
            Refresh
          </Button>
          */}
          {!isDetailPage && (
            <Button type="button" onClick={() => navigate("/masters/dimensions/create")}>
              <Plus size={14} />
              {t("pages.dimensions.actions.add")}
            </Button>
          )}
        </div>
      </PageHeader>

      {notice && <div className="flex items-center justify-between gap-3 rounded-md bg-muted p-3 text-sm">{notice}</div>}
      {error && <div className="rounded-md bg-muted p-3 text-sm text-destructive">{error}</div>}

      {!isDetailPage && dimensionFilters}

      {false && !isDetailPage && <section className="flex min-w-0 flex-wrap items-center gap-3">
        <label className="flex min-w-0 items-center gap-2 [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-muted-foreground">
          <Search size={14} />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search dimension by name or code" />
        </label>
        <span>
          <NativeSelect

            value={goalFilter}
            title={selectedGoalTooltip}
            aria-label={goalNodeLabel}
            aria-describedby="dimension-goal-filter-tooltip"
            onChange={(event) => {
              setGoalFilter(event.target.value);
              setOffset(0);
            }}
          >
            <NativeSelectOption value="ALL">All {goalNodeLabel.toLowerCase()}</NativeSelectOption>
            {goalOptions.map((goal) => (
              <NativeSelectOption key={goal.code} value={goal.code} title={goal.label}>{compactGoalFilterLabel(goal.label)}</NativeSelectOption>
            ))}
          </NativeSelect>
          <span id="dimension-goal-filter-tooltip" role="tooltip">
            {selectedGoalTooltip}
          </span>
        </span>
        <NativeSelect
          value={structureFilter}
          onChange={(event) => {
            setStructureFilter(event.target.value);
            setOffset(0);
          }}
          aria-label="Structure"
        >
          {STRUCTURE_FILTERS.map((filter) => (
            <NativeSelectOption key={filter.value} value={filter.value}>{t(`pages.dimensions.structures.${filter.key}`)}</NativeSelectOption>
          ))}
        </NativeSelect>
        <NativeSelect
          value={usageFilter}
          onChange={(event) => {
            setUsageFilter(event.target.value);
            setOffset(0);
          }}
          aria-label="Usage"
        >
          <NativeSelectOption value="ALL">All usage</NativeSelectOption>
          <NativeSelectOption value="USED">Used</NativeSelectOption>
          <NativeSelectOption value="UNUSED">Unused</NativeSelectOption>
        </NativeSelect>
        <NativeSelect
          value={statusFilter}
          onChange={(event) => {
            setStatusFilter(event.target.value);
            setOffset(0);
          }}
          aria-label="Status"
        >
          <NativeSelectOption value="ACTIVE">Active</NativeSelectOption>
          <NativeSelectOption value="INACTIVE">Inactive</NativeSelectOption>
          <NativeSelectOption value="ALL">All statuses</NativeSelectOption>
        </NativeSelect>
        <div
          className="flex min-w-0 items-center gap-2 [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-muted-foreground compact-filter"
          onBlur={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) {
              setIsIndicatorFilterOpen(false);
            }
          }}
        >
          <Input
            value={indicatorFilter}
            onChange={(event) => {
              setIndicatorFilter(event.target.value);
              setIsIndicatorFilterOpen(true);
              setOffset(0);
            }}
            onFocus={() => setIsIndicatorFilterOpen(true)}
            onKeyDown={(event) => {
              if (event.key === "Escape") setIsIndicatorFilterOpen(false);
            }}
            placeholder="Filter by indicator number"
            aria-label="Indicator filter"
            aria-expanded={isIndicatorFilterOpen}
            aria-controls="dimension-indicator-filter-menu"
            role="combobox"
          />
          {indicatorFilter ? (
            <Button

              type="button"
              aria-label="Clear indicator filter"
              onClick={() => {
                setIndicatorFilter("");
                setIsIndicatorFilterOpen(false);
                setOffset(0);
              }}
            >
              <X size={12} />
            </Button>
          ) : null}
          {isIndicatorFilterOpen && (
            <div id="dimension-indicator-filter-menu" role="listbox">
              {visibleIndicatorOptions.length ? visibleIndicatorOptions.map((indicator) => {
                const value = indicator.indicator_number || indicator.national_indicator_code || "";
                return (
                  <Button

                    type="button"
                    role="option"
                    key={indicator.national_indicator_code || value}
                    title={`${value} - ${indicator.name || indicator.national_indicator_code || ""}`}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => {
                      setIndicatorFilter(value);
                      setIsIndicatorFilterOpen(false);
                      setOffset(0);
                    }}
                  >
                    <strong>{value}</strong>
                    <span>{indicator.name || indicator.national_indicator_code}</span>
                  </Button>
                );
              }) : <div>No indicators found</div>}
            </div>
          )}
        </div>
      </section>}

      <section className="flex min-h-0 min-w-0 flex-1 flex-col gap-4">
        {!isDetailPage && (
          <DataTable
            table={dimensionTable}
            ariaLabel={t("pages.dimensions.table.label")}
            className="flex min-h-0 flex-1 flex-col"
            scrollContainerClassName="min-h-0 flex-1 overflow-y-auto [&_thead]:sticky [&_thead]:top-0 [&_thead]:z-10"
            isLoading={isLoading}
            loadingMessage={t("pages.dimensions.table.loading")}
            emptyMessage={t("pages.dimensions.table.empty")}
            showPagination
            pageSizeOptions={[10, 25, 50, 100]}
            totalCount={totalCount}
            onRowClick={(row) => {
              const code = row.dimension_code;
              if (code) navigate(`/masters/dimensions/${encodeURIComponent(code)}`);
            }}
          />
        )}

        {isDetailPage && <Card className="min-w-0"><CardContent className="flex min-w-0 flex-col gap-3">
          {isDetailLoading && !detailRecord ? (
            <Loader text={t("pages.dimensions.loadingDetail")} />
          ) : detailRecord ? (
            <>
              <header className="flex flex-wrap items-start justify-between gap-3 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:text-sm [&_h3]:font-semibold [&_p]:text-xs [&_p]:text-muted-foreground">
                <div>
                  <span>{textValue(detailRecord.dimension_code)}</span>
                  <h3>{displayName(detailRecord)}</h3>
                  <p>{structureLabel(detailRecord)} / {textValue(detailRecord.dimension_type)} / {textValue(detailRecord.value_type)}</p>
                </div>
                <Button variant="outline" type="button" onClick={() => navigate(`/masters/dimensions/${encodeURIComponent(selectedCode)}/edit`, { state: { returnTo: `/masters/dimensions/${encodeURIComponent(selectedCode)}` } })}>
                  <Edit3 size={13} />
                  {t("pages.dimensions.actions.edit")}
                </Button>
              </header>

              {/* Summary cards are intentionally hidden to keep the detail view compact.
              <section className="dimension-detail-kpi-strip">
                <article>
                  <span>{t("pages.dimensions.tabs.members")}</span>
                  <strong>{members.length.toLocaleString("en-IN")}</strong>
                </article>
                <article>
                  <span>{t("pages.dimensions.tabs.relationships")}</span>
                  <strong>{relationships.length.toLocaleString("en-IN")}</strong>
                </article>
                <article>
                  <span>{t("pages.dimensions.tabs.sets")}</span>
                  <strong>{sets.length.toLocaleString("en-IN")}</strong>
                </article>
                <article>
                  <span>{t("pages.dimensions.tabs.aliases")}</span>
                  <strong>{aliases.length.toLocaleString("en-IN")}</strong>
                </article>
              </section>
              */}

              <CustomTabs
        className="min-h-0"
        variant="underline"
        value={activeTab}
        onValueChange={(key) => setActiveTab(String(key) as DetailTab)}
        compact
        ariaLabel={t("pages.dimensions.tabs.label")}
        contentClassName="flex min-w-0 flex-col gap-3"
        items={DETAIL_TABS.filter((tab) => tab !== "overview").map((tab) => (
                  ({ value: tab, label: t(`pages.dimensions.tabs.${tab}`), content: (<>{isDetailLoading ? (
                  <Loader text={t("pages.dimensions.loadingDetail")} />
                ) : activeTab === "members" ? (
                  <DimensionListPanel
                    title={t("pages.dimensions.sections.members.title")}
                    actionLabel={t("pages.dimensions.sections.members.add")}
                    onAction={() => navigate(`/masters/dimensions/${encodeURIComponent(selectedCode)}/members/create`)}
                    rows={members}
                    emptyText={t("pages.dimensions.sections.members.empty")}
                    onEdit={(member) => navigate(`/masters/dimensions/${encodeURIComponent(selectedCode)}/members/${encodeURIComponent(member.member_code ?? "")}/edit`)}
                    onDelete={(member) => void handleDeactivate(() => deactivateDimensionMember(selectedCode, member.member_code ?? ""), t("pages.dimensions.notifications.memberDeactivated"))}
                    render={(member) => (
                      <>
                        <LocalizedName primary={textValue(member.name ?? member.member_code)} hindi={localizedHindiName(member)} />
                        <span>{textValue(member.member_code)} {member.short_name ? `- ${member.short_name}` : ""}</span>
                      </>
                    )}
                  />
                ) : activeTab === "relationships" ? (
                  <DimensionListPanel
                    title={t("pages.dimensions.sections.relationships.title")}
                    actionLabel={t("pages.dimensions.sections.relationships.add")}
                    onAction={() => navigate(`/masters/dimensions/${encodeURIComponent(selectedCode)}/hierarchy/create`)}
                    rows={relationships}
                    emptyText={t("pages.dimensions.sections.relationships.empty")}
                    onEdit={(relationship) => navigate(`/masters/dimensions/${encodeURIComponent(selectedCode)}/hierarchy/${encodeURIComponent(relationship.parent_member_code ?? "")}/${encodeURIComponent(relationship.child_member_code ?? "")}/edit`)}
                    onDelete={(relationship) => void handleDeactivate(() => deactivateDimensionRelationship(selectedCode, relationship), t("pages.dimensions.notifications.relationshipRemoved"))}
                    render={(relationship) => (
                      <>
                        <strong>{textValue(relationship.parent_member_name ?? relationship.parent_member_code)} <ChevronRight size={12} /> {textValue(relationship.child_member_name ?? relationship.child_member_code)}</strong>
                        <span>{textValue(relationship.relationship_type)} - {t("pages.dimensions.sort", { value: textValue(relationship.sort_order) })}</span>
                      </>
                    )}
                  />
                ) : activeTab === "sets" ? (
                  <DimensionListPanel
                    title={t("pages.dimensions.sections.sets.title")}
                    actionLabel={t("pages.dimensions.sections.sets.add")}
                    onAction={() => navigate(`/masters/dimensions/${encodeURIComponent(selectedCode)}/sets/create`)}
                    rows={sets}
                    emptyText={t("pages.dimensions.sections.sets.empty")}
                    onEdit={(set) => navigate(`/masters/dimensions/${encodeURIComponent(selectedCode)}/sets/${encodeURIComponent(set.set_code ?? "")}/edit`)}
                    onDelete={(set) => void handleDeactivate(() => deactivateDimensionMemberSet(selectedCode, set.set_code ?? ""), t("pages.dimensions.notifications.setDeactivated"))}
                    render={(set) => (
                      <>
                        <strong>{textValue(set.name ?? set.set_code)}</strong>
                        <span>{textValue(set.set_type)} - {t("pages.dimensions.memberCount", { count: numberValue(set.member_count) })}</span>
                        <div className="flex flex-wrap items-center gap-2">
                          {(setItems[set.set_code ?? ""] ?? []).slice(0, 8).map((item) => (
                            <Button variant="secondary" size="sm" type="button" aria-label={t("pages.dimensions.actions.removeMember", { name: textValue(item.member_name ?? item.member_code) })} key={item.member_code} onClick={(event) => { event.stopPropagation(); void handleDeactivate(() => deactivateDimensionMemberSetItem(set.set_code ?? "", item.member_code ?? ""), t("pages.dimensions.notifications.memberRemoved")); }}>
                              {textValue(item.member_name ?? item.member_code)}
                              <X size={10} />
                            </Button>
                          ))}
                          <Button variant="ghost" type="button" onClick={(event) => { event.stopPropagation(); setSetItemMemberCodes([]); setSetItemForm({ ...emptySetItemForm, set_code: set.set_code ?? "" }); setDrawer("setItem"); }}>
                            <Plus size={11} />
                            {t("pages.dimensions.sections.sets.addItem")}
                          </Button>
                        </div>
                      </>
                    )}
                  />
                ) : activeTab === "rollups" ? (
                  <DimensionListPanel
                    title={t("pages.dimensions.sections.rollups.title")}
                    actionLabel={t("pages.dimensions.sections.rollups.add")}
                    onAction={() => navigate(`/masters/dimensions/${encodeURIComponent(selectedCode)}/rollups/create`)}
                    rows={rollups}
                    emptyText={t("pages.dimensions.sections.rollups.empty")}
                    onEdit={(rollup) => navigate(`/masters/dimensions/${encodeURIComponent(selectedCode)}/rollups/${encodeURIComponent(rollup.parent_member_code ?? "")}/${encodeURIComponent(rollup.rule_code ?? "")}/edit`)}
                    onDelete={(rollup) => void handleDeactivate(() => deactivateDimensionRollupRule(selectedCode, rollup), t("pages.dimensions.notifications.rollupDeactivated"))}
                    render={(rollup) => (
                      <>
                        <strong>{textValue(rollup.parent_member_name ?? rollup.parent_member_code)}</strong>
                        <span>{textValue(rollup.rule_code)} - {textValue(rollup.entry_mode)} / {textValue(rollup.aggregation_method)}</span>
                        <div className="flex flex-wrap items-center gap-2">
                          {(rollup.children ?? []).slice(0, 8).map((child, index) => (
                            <Badge variant="secondary" key={`${rollup.rule_code}-${index}`}>{textValue(child.member_name ?? child.member_code ?? child.child_member_code)}</Badge>
                          ))}
                        </div>
                      </>
                    )}
                  />
                ) : (
                  <DimensionListPanel
                    title={t("pages.dimensions.sections.aliases.title")}
                    actionLabel={t("pages.dimensions.sections.aliases.add")}
                    onAction={() => navigate(`/masters/dimensions/${encodeURIComponent(selectedCode)}/aliases/create`)}
                    rows={aliases}
                    emptyText={t("pages.dimensions.sections.aliases.empty")}
                    onEdit={(alias) => navigate(`/masters/dimensions/${encodeURIComponent(selectedCode)}/aliases/${encodeURIComponent(alias.member_code ?? "")}/${encodeURIComponent(alias.alias_type ?? "")}/${encodeURIComponent(alias.alias_value ?? "")}/edit`)}
                    onDelete={(alias) => void handleDeactivate(() => deactivateDimensionAlias(selectedCode, alias), t("pages.dimensions.notifications.aliasDeactivated"))}
                    render={(alias) => (
                      <>
                        <strong>{textValue(alias.alias_value)}</strong>
                        <span>{textValue(alias.member_name ?? alias.member_code)} - {textValue(alias.alias_type)}</span>
                      </>
                    )}
                  />
                )}</>) })
                  ))}
      />
            </>
          ) : (
            <div className="flex min-h-32 flex-col items-center justify-center gap-2 p-6 text-center text-sm text-muted-foreground">{t("pages.dimensions.detailUnavailable")}</div>
          )}
        </CardContent></Card>}
      </section>

      {drawer === "dimension" && (
        <Drawer title={selectedDetail?.dimension_code && dimensionForm.dimension_code === selectedDetail.dimension_code ? "Edit Dimension" : "Create Dimension"} subtitle="" onClose={() => setDrawer(null)}>
          <form className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4" onSubmit={submitDimension}>
              <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground"><strong>Configuration details</strong><span>Complete the governed fields below. Changes are validated before saving.</span></div>
            <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium" title="Stable public code used by API/UI contracts. Auto format uses A-Z, 0-9, and underscore.">Dimension code *<Input required placeholder="Required code, e.g. GEOGRAPHY" value={dimensionForm.dimension_code} onChange={(event) => setDimensionForm((current) => ({ ...current, dimension_code: event.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "_") }))} /></label>
            <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium" title="User-facing dimension name shown in templates and reports.">Name *<Input required placeholder="Enter dimension name, e.g. Geography" value={dimensionForm.name} onChange={(event) => setDimensionForm((current) => ({ ...current, name: event.target.value }))} /></label>
            <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium" title="Optional Hindi label. If provided, it is saved as the hi-IN dimension translation.">Hindi name<Input placeholder="Hindi name, optional" value={dimensionForm.name_hi} onChange={(event) => setDimensionForm((current) => ({ ...current, name_hi: event.target.value }))} /></label>
            <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-foreground [&>small]:font-normal [&>small]:text-muted-foreground" title="Business category for this dimension. General is for normal reusable lists, Time is for reporting periods, and Location is for geography/location dimensions.">Dimension type<NativeSelect value={dimensionForm.dimension_type} onChange={(event) => setDimensionForm((current) => ({ ...current, dimension_type: event.target.value }))}><NativeSelectOption value="GENERAL">General</NativeSelectOption><NativeSelectOption value="TIME">Time</NativeSelectOption><NativeSelectOption value="LOCATION">Location</NativeSelectOption></NativeSelect></label>
              <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-foreground [&>small]:font-normal [&>small]:text-muted-foreground" title="Governed UI/business structure. HIERARCHICAL enables parent-child behavior and stores is_hierarchical as true.">Dimension structure<NativeSelect value={dimensionForm.dimension_structure_type} onChange={(event) => setDimensionForm((current) => ({ ...current, dimension_structure_type: event.target.value, is_hierarchical: event.target.value === "HIERARCHICAL" }))}>{structureTypeOptions(structureTypes)}</NativeSelect></label>
              <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-foreground [&>small]:font-normal [&>small]:text-muted-foreground" title="Primitive value type used by import, validation, and display handling.">Value type<NativeSelect value={dimensionForm.value_type} onChange={(event) => setDimensionForm((current) => ({ ...current, value_type: event.target.value }))}><NativeSelectOption>TEXT</NativeSelectOption><NativeSelectOption>NUMBER</NativeSelectOption><NativeSelectOption>DATE</NativeSelectOption><NativeSelectOption>BOOLEAN</NativeSelectOption></NativeSelect></label>
            </div>
            <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium" title="Optional explanation for governance/admin users.">Description<Textarea placeholder="Describe where this dimension is used and any special rules" value={dimensionForm.description} onChange={(event) => setDimensionForm((current) => ({ ...current, description: event.target.value }))} /></label>
            <BooleanField isSelected={dimensionForm.is_active} onChange={(isSelected) => setDimensionForm((current) => ({ ...current, is_active: isSelected }))}> Active</BooleanField>
            <DrawerFooter disabled={isSaving || !dimensionForm.dimension_code.trim()} />
          </form>
        </Drawer>
      )}

      {drawer === "member" && (
        <Drawer title="Dimension Member" subtitle={editingMemberCode ? "Edit" : "Create"} onClose={() => setDrawer(null)}>
          <form className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4" onSubmit={submitMember}>
              <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground"><strong>Configuration details</strong><span>Complete the governed fields below. Changes are validated before saving.</span></div>
            <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium">Member code<Input value={memberForm.member_code} onChange={(event) => setMemberForm((current) => ({ ...current, member_code: event.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "_") }))} /></label>
            <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium">Name *<Input required value={memberForm.name} onChange={(event) => setMemberForm((current) => ({ ...current, name: event.target.value }))} /></label>
            <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium">Hindi name<Input placeholder="Hindi name, optional" value={memberForm.name_hi} onChange={(event) => setMemberForm((current) => ({ ...current, name_hi: event.target.value }))} /></label>
            <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium">Short name<Input value={memberForm.short_name} onChange={(event) => setMemberForm((current) => ({ ...current, short_name: event.target.value }))} /></label>
            <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium">External code<Input value={memberForm.external_code} onChange={(event) => setMemberForm((current) => ({ ...current, external_code: event.target.value }))} /></label>
            <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-foreground [&>small]:font-normal [&>small]:text-muted-foreground">Valid from<Input type="date" value={memberForm.valid_from} onChange={(event) => setMemberForm((current) => ({ ...current, valid_from: event.target.value }))} /></label>
              <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-foreground [&>small]:font-normal [&>small]:text-muted-foreground">Valid to<Input type="date" value={memberForm.valid_to} onChange={(event) => setMemberForm((current) => ({ ...current, valid_to: event.target.value }))} /></label>
            </div>
            <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium">Description<Textarea value={memberForm.description} onChange={(event) => setMemberForm((current) => ({ ...current, description: event.target.value }))} /></label>
            <BooleanField isSelected={memberForm.is_active} onChange={(isSelected) => setMemberForm((current) => ({ ...current, is_active: isSelected }))}> Active</BooleanField>
            <DrawerFooter disabled={isSaving} />
          </form>
        </Drawer>
      )}

      {drawer === "relationship" && (
        <Drawer title="Member Relationship" subtitle={selectedCode} onClose={() => setDrawer(null)}>
          <form className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4" onSubmit={submitRelationship}>
              <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground"><strong>Configuration details</strong><span>Complete the governed fields below. Changes are validated before saving.</span></div>
            <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium">Parent member *<NativeSelect required value={relationshipForm.parent_member_code} onChange={(event) => setRelationshipForm((current) => ({ ...current, parent_member_code: event.target.value }))}>{memberOptions(members)}</NativeSelect></label>
            <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium">Child member *<NativeSelect required value={relationshipForm.child_member_code} onChange={(event) => setRelationshipForm((current) => ({ ...current, child_member_code: event.target.value }))}>{memberOptions(members)}</NativeSelect></label>
            <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium">Relationship type<Input value={relationshipForm.relationship_type} onChange={(event) => setRelationshipForm((current) => ({ ...current, relationship_type: event.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "_") }))} /></label>
            <BooleanField isSelected={relationshipForm.is_active} onChange={(isSelected) => setRelationshipForm((current) => ({ ...current, is_active: isSelected }))}> Active</BooleanField>
            <DrawerFooter disabled={isSaving || relationshipForm.parent_member_code === relationshipForm.child_member_code} />
          </form>
        </Drawer>
      )}

      {drawer === "set" && (
        <Drawer title="Member Set" subtitle={selectedCode} onClose={() => setDrawer(null)}>
          <form className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4" onSubmit={submitSet}>
              <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground"><strong>Configuration details</strong><span>Complete the governed fields below. Changes are validated before saving.</span></div>
            <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium">Set code<Input value={setForm.set_code} onChange={(event) => setSetForm((current) => ({ ...current, set_code: event.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "_") }))} /></label>
            <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium">Name *<Input required value={setForm.name} onChange={(event) => setSetForm((current) => ({ ...current, name: event.target.value }))} /></label>
            <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium">Set type<Input value={setForm.set_type} onChange={(event) => setSetForm((current) => ({ ...current, set_type: event.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "_") }))} /></label>
            <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium">Description<Textarea value={setForm.description} onChange={(event) => setSetForm((current) => ({ ...current, description: event.target.value }))} /></label>
            <BooleanField isSelected={setForm.is_active} onChange={(isSelected) => setSetForm((current) => ({ ...current, is_active: isSelected }))}> Active</BooleanField>
            <DrawerFooter disabled={isSaving} />
          </form>
        </Drawer>
      )}

      {drawer === "setItem" && (
        <Drawer title="Member Set Item" subtitle={setItemForm.set_code} onClose={() => setDrawer(null)}>
          <form className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4" onSubmit={submitSetItem}>
              <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground"><strong>Configuration details</strong><span>Complete the governed fields below. Changes are validated before saving.</span></div>
            <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium" title="Choose the target set. Use New Set when the set itself does not exist yet.">Set *<NativeSelect required value={setItemForm.set_code} onChange={(event) => setSetItemForm((current) => ({ ...current, set_code: event.target.value }))}>{setOptions(sets)}</NativeSelect></label>
            <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium" title="Select one or more existing dimension members to include in this set.">
              Members *
              <NativeSelect
                className="flex max-h-64 flex-col gap-2 overflow-y-auto rounded-md border p-3"
                multiple
                required
                value={setItemMemberCodes}
                onChange={(event) => {
                  const values = Array.from(event.currentTarget.selectedOptions).map((option) => option.value).filter(Boolean);
                  setSetItemMemberCodes(values);
                  setSetItemForm((current) => ({ ...current, member_code: values[0] ?? "" }));
                }}
              >
                {members.map((member) => (
                  <NativeSelectOption value={member.member_code ?? ""} key={member.member_code}>
                    {textValue(member.name ?? member.member_code)}
                  </NativeSelectOption>
                ))}
              </NativeSelect>
            </label>
            <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium" title="Optional display order of this member inside the set.">Sort order<Input type="number" value={setItemForm.sort_order} onChange={(event) => setSetItemForm((current) => ({ ...current, sort_order: Number(event.target.value) }))} /></label>
            <BooleanField isSelected={setItemForm.is_active} onChange={(isSelected) => setSetItemForm((current) => ({ ...current, is_active: isSelected }))}> Active</BooleanField>
            <DrawerFooter disabled={isSaving || !setItemForm.set_code || setItemMemberCodes.length === 0} />
          </form>
        </Drawer>
      )}

      {drawer === "alias" && (
        <Drawer title="Member Alias" subtitle={selectedCode} onClose={() => setDrawer(null)}>
          <form className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4" onSubmit={submitAlias}>
              <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground"><strong>Configuration details</strong><span>Complete the governed fields below. Changes are validated before saving.</span></div>
            <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium">Member *<NativeSelect required value={aliasForm.member_code} onChange={(event) => setAliasForm((current) => ({ ...current, member_code: event.target.value }))}>{memberOptions(members)}</NativeSelect></label>
            <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium" title="Classify why this alternate value exists. SOURCE_CODE is for external import files; DISPLAY_ALIAS is for alternate labels; LEGACY_CODE is for old migrated codes.">Alias type<NativeSelect value={aliasForm.alias_type} onChange={(event) => setAliasForm((current) => ({ ...current, alias_type: event.target.value }))}><NativeSelectOption>SOURCE_CODE</NativeSelectOption><NativeSelectOption>DISPLAY_ALIAS</NativeSelectOption><NativeSelectOption>LEGACY_CODE</NativeSelectOption><NativeSelectOption>EXTERNAL_CODE</NativeSelectOption><NativeSelectOption>OTHER</NativeSelectOption></NativeSelect></label>
            <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium" title="The alternate code/name exactly as it appears in a source file, legacy system, or alternate display.">Alias value *<Input required placeholder="Example: IND, INDIA, 01, DISTRICT_001" value={aliasForm.alias_value} onChange={(event) => setAliasForm((current) => ({ ...current, alias_value: event.target.value }))} /></label>
            <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium" title="Optional upstream system or file source this alias belongs to. Leave blank for common aliases.">Source system<Input placeholder="Example: MOSPI_EXCEL, CENSUS_2011, LEGACY_PORTAL" value={aliasForm.source_system_code} onChange={(event) => setAliasForm((current) => ({ ...current, source_system_code: event.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "_") }))} /></label>
            <BooleanField isSelected={aliasForm.is_active} onChange={(isSelected) => setAliasForm((current) => ({ ...current, is_active: isSelected }))}> Active</BooleanField>
            <DrawerFooter disabled={isSaving} />
          </form>
        </Drawer>
      )}

      {drawer === "rollup" && (
        <Drawer title="Rollup Rule" subtitle={editingRollupKey ? "Edit" : "Create"} onClose={() => setDrawer(null)}>
          <form className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4" onSubmit={submitRollup}>
              <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground"><strong>Configuration details</strong><span>Complete the governed fields below. Changes are validated before saving.</span></div>
            <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium">Parent member *<NativeSelect required value={rollupForm.parent_member_code} onChange={(event) => setRollupForm((current) => ({ ...current, parent_member_code: event.target.value }))}>{memberOptions(members)}</NativeSelect></label>
            <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium">Rule code<Input value={rollupForm.rule_code} onChange={(event) => setRollupForm((current) => ({ ...current, rule_code: event.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "_") }))} /></label>
            <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
              <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-foreground [&>small]:font-normal [&>small]:text-muted-foreground">Entry mode<NativeSelect value={rollupForm.entry_mode} onChange={(event) => setRollupForm((current) => ({ ...current, entry_mode: event.target.value }))}><NativeSelectOption>MANUAL</NativeSelectOption><NativeSelectOption>DERIVED</NativeSelectOption><NativeSelectOption>MANUAL_WITH_VALIDATION</NativeSelectOption></NativeSelect></label>
              <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-foreground [&>small]:font-normal [&>small]:text-muted-foreground">Aggregation<NativeSelect value={rollupForm.aggregation_method} onChange={(event) => setRollupForm((current) => ({ ...current, aggregation_method: event.target.value }))}><NativeSelectOption>SUM</NativeSelectOption><NativeSelectOption>AVG</NativeSelectOption><NativeSelectOption>WEIGHTED_AVG</NativeSelectOption><NativeSelectOption>MIN</NativeSelectOption><NativeSelectOption>MAX</NativeSelectOption><NativeSelectOption>NO_ROLLUP</NativeSelectOption></NativeSelect></label>
            </div>
            <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium" title="Measure to aggregate for the selected parent member. This will become a searchable measure dropdown when the measure catalog is exposed here.">Measure code<Input list="dimension-measure-code-examples" placeholder="Example: AREA_TOTAL, POPULATION_TOTAL, VALUE" value={rollupForm.measure_code} onChange={(event) => setRollupForm((current) => ({ ...current, measure_code: event.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "_") }))} /></label>
            <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium" title="Optional measure used only when Aggregation is WEIGHTED_AVG.">Weight measure code<Input list="dimension-measure-code-examples" placeholder="Example: POPULATION_WEIGHT, AREA_WEIGHT" value={rollupForm.weight_measure_code} onChange={(event) => setRollupForm((current) => ({ ...current, weight_measure_code: event.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "_") }))} /></label>
            <p className="text-xs text-muted-foreground">Weight is an optional numeric coefficient for weighted-average rollups. It is not a formula; leave it blank for normal SUM, AVG, MIN, MAX, and parent-child total checks.</p>
            <datalist id="dimension-measure-code-examples">
              <NativeSelectOption value="VALUE" />
              <NativeSelectOption value="POPULATION_TOTAL" />
              <NativeSelectOption value="AREA_TOTAL" />
              <NativeSelectOption value="POPULATION_WEIGHT" />
              <NativeSelectOption value="AREA_WEIGHT" />
            </datalist>
            <div className="flex min-w-0 flex-col gap-3">
              <div className="flex items-start justify-between gap-2 [&_h3]:text-sm [&_h3]:font-semibold [&_p]:text-xs [&_p]:text-muted-foreground">
                <strong>Rollup children</strong>
                <Button variant="outline" type="button" onClick={() => setRollupChildren((current) => [...current, { ...emptyRollupChild, child_order: current.length + 1 }])}>
                  <Plus size={12} />
                  Add child
                </Button>
              </div>
              {rollupChildren.map((child, index) => (
                <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:grid-cols-3 items-end gap-2" key={index}>
                  <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-foreground [&>small]:font-normal [&>small]:text-muted-foreground">Child member<NativeSelect value={child.member_code} onChange={(event) => setRollupChildren((current) => current.map((item, childIndex) => childIndex === index ? { ...item, member_code: event.target.value } : item))}>{memberOptions(members)}</NativeSelect></label>
                  <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-foreground [&>small]:font-normal [&>small]:text-muted-foreground">Order<Input type="number" value={child.child_order} onChange={(event) => setRollupChildren((current) => current.map((item, childIndex) => childIndex === index ? { ...item, child_order: Number(event.target.value) } : item))} /></label>
                  <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-foreground [&>small]:font-normal [&>small]:text-muted-foreground" title="Optional numeric weight used by weighted average rollups. Leave blank for SUM/AVG/MIN/MAX.">Weight<Input type="number" placeholder="Example: 1.0" value={child.child_weight} onChange={(event) => setRollupChildren((current) => current.map((item, childIndex) => childIndex === index ? { ...item, child_weight: event.target.value } : item))} /></label>
                  <Button size="icon-sm" variant="ghost"
                    className="text-destructive"
                    type="button"
                    title="Remove child"
                    aria-label="Remove rollup child"
                    onClick={() =>
                      setRollupChildren((current) =>
                        current.length > 1
                          ? current
                              .filter((_, childIndex) => childIndex !== index)
                              .map((item, childIndex) => ({ ...item, child_order: childIndex + 1 }))
                          : [{ ...emptyRollupChild }],
                      )
                    }
                  >
                    <Trash2 size={13} />
                  </Button>
                </div>
              ))}
            </div>
            <BooleanField isSelected={rollupForm.is_active} onChange={(isSelected) => setRollupForm((current) => ({ ...current, is_active: isSelected }))}> Active</BooleanField>
            <DrawerFooter disabled={isSaving} />
          </form>
        </Drawer>
      )}

      {listModal && (
        <Dialog isOpen showCloseButton={false} onOpenChange={(open) => { if (!open) { setListModal(null); } }} className="max-h-[85svh] overflow-y-auto sm:max-w-2xl">
          <div className="flex min-h-0 flex-1 flex-col gap-3">
            <header>
              <div>
                <span>Member List</span>
                <DialogTitle>{listModal.title}</DialogTitle>
              </div>
              <Button size="icon-sm" variant="ghost" type="button" onClick={() => setListModal(null)} aria-label="Close member list">
                <X size={16} />
              </Button>
            </header>
            <div>
              {listModal.rows.length ? listModal.rows.map((member) => (
                <article className="flex min-w-0 flex-wrap items-center justify-between gap-3 py-2" key={member.member_code}>
                  <div>
                    <LocalizedName primary={textValue(member.name ?? member.member_code)} hindi={localizedHindiName(member)} />
                  </div>
                  <StatusPill record={member} />
                </article>
              )) : <Empty><EmptyHeader><EmptyTitle>No members available.</EmptyTitle></EmptyHeader></Empty>}
            </div>
          </div>
        </Dialog>
      )}

      {usedIndicatorsModal && (
        <Dialog isOpen showCloseButton={false} onOpenChange={(open) => { if (!open) { setUsedIndicatorsModal(null); } }} className="max-h-[85svh] overflow-y-auto sm:max-w-2xl">
          <div className="flex min-h-0 flex-1 flex-col gap-3">
            <header>
              <div>
                <span>Used In Indicators</span>
                <DialogTitle>{usedIndicatorsModal.title}</DialogTitle>
              </div>
              <Button size="icon-sm" variant="ghost" type="button" onClick={() => setUsedIndicatorsModal(null)} aria-label="Close indicator usage">
                <X size={16} />
              </Button>
            </header>
            <div>
              {usedIndicatorsModal.rows.length ? usedIndicatorsModal.rows.map((indicator, index) => {
                const indicatorNumber = textValue(indicator.indicator_number ?? indicator.national_indicator_code);
                const indicatorName = textValue(indicator.indicator_name);
                return (
                  <article className="flex min-w-0 flex-wrap items-center justify-between gap-3 py-2" key={`${indicator.national_indicator_code ?? indicatorNumber}-${indicator.version_code ?? index}`}>
                    <div>
                      <strong>{indicatorNumber}</strong>
                      <span>{indicatorName}</span>
                    </div>
                    <small>
                      {textValue(indicator.template_code)}
                      {indicator.version_code ? ` / ${indicator.version_code}` : ""}
                    </small>
                  </article>
                );
              }) : <Empty><EmptyHeader><EmptyTitle>No indicator usage details available.</EmptyTitle></EmptyHeader></Empty>}
            </div>
          </div>
        </Dialog>
      )}
    </PageSection>
  );
}

function StatusPill({ record }: { record: { status?: string; is_active?: boolean } }) {
  const { t } = useTranslation("common");
  const status = statusOf(record);
  return <StatusBadge variant={normalizeStatusVariant(`${status === "ACTIVE" ? "active" : "inactive"}`)}>{status === "ACTIVE" ? t("pages.dimensions.status.active") : status === "INACTIVE" ? t("pages.dimensions.status.inactive") : status}</StatusBadge>;
}

function DimensionListPanel<T>({
  title,
  actionLabel,
  rows,
  emptyText,
  render,
  onAction,
  onEdit,
  onDelete,
}: {
  title: string;
  actionLabel: string;
  rows: T[];
  emptyText: string;
  render: (row: T) => ReactNode;
  onAction: () => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
}) {
  const { t } = useTranslation("common");
  return (
    <section className="flex min-w-0 flex-col gap-3">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <span className="text-xs text-muted-foreground">{t("pages.dimensions.configuration")}</span>
          <h4 className="text-sm font-semibold">{title}</h4>
        </div>
        <Button variant="outline" type="button" onClick={onAction}>
          <Plus size={13} />
          {actionLabel}
        </Button>
      </header>
      <div className="flex min-w-0 flex-col gap-3">
        {rows.length ? (
          rows.slice(0, 80).map((row, index) => (
            <article className="flex min-w-0 flex-wrap items-center justify-between gap-3 py-2" key={index}>
              <div className="flex min-w-0 flex-1 flex-col gap-1 break-words [&>span]:text-muted-foreground [&>strong]:flex [&>strong]:items-center [&>strong]:gap-1">{render(row)}</div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill record={row as { status?: string; is_active?: boolean }} />
                {(onEdit || onDelete) && (
                  <DropdownMenuTrigger>
                    <Button type="button" variant="ghost" size="icon-sm" aria-label={t("pages.dimensions.actions.itemMenu")}>
                      <Ellipsis aria-hidden="true" />
                    </Button>
                    <DropdownMenu aria-label={t("pages.dimensions.actions.itemMenu")} className="min-w-40" placement="bottom end">
                      <DropdownMenuLabel>{t("pages.dimensions.actions.itemMenu")}</DropdownMenuLabel>
                      {onEdit && (
                        <DropdownMenuGroup>
                          <DropdownMenuItem id="edit" onAction={() => onEdit(row)}>
                            <Edit3 aria-hidden="true" />
                            {t("pages.dimensions.actions.editItem")}
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      )}
                      {onEdit && onDelete && <DropdownMenuSeparator />}
                      {onDelete && (
                        <DropdownMenuGroup>
                          <DropdownMenuItem id="deactivate" variant="destructive" onAction={() => onDelete(row)}>
                            <Trash2 aria-hidden="true" />
                            {t("pages.dimensions.actions.deactivateItem")}
                          </DropdownMenuItem>
                        </DropdownMenuGroup>
                      )}
                    </DropdownMenu>
                  </DropdownMenuTrigger>
                )}
              </div>
            </article>
          ))
        ) : (
          <Empty><EmptyHeader><EmptyTitle>{emptyText}</EmptyTitle></EmptyHeader></Empty>
        )}
      </div>
    </section>
  );
}

function Drawer({ title, subtitle, children, onClose }: { title: string; subtitle: string; children: ReactNode; onClose: () => void }) {
  const { t } = useTranslation("common");
  return (
    <Sheet isOpen showCloseButton={false} onOpenChange={(open) => { if (!open) { onClose(); } }} className="w-full sm:max-w-xl">
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <header className="flex shrink-0 items-start justify-between gap-3 border-b p-4 [&_h3]:text-base [&_h3]:font-semibold [&_span]:text-xs [&_span]:text-muted-foreground">
          <div>
            {subtitle ? <span>{subtitle}</span> : null}
            <SheetTitle>{title}</SheetTitle>
          </div>
          <Button size="icon-sm" variant="ghost" type="button" onClick={onClose} aria-label={t("pages.dimensions.actions.close")}>
            <X size={16} />
          </Button>
        </header>
        {children}
      </div>
    </Sheet>
  );
}

function DrawerFooter({ disabled }: { disabled: boolean }) {
  const { t } = useTranslation("common");
  return (
    <div className="mt-auto flex shrink-0 flex-wrap items-center justify-end gap-2 border-t pt-4">
      <Button type="submit" disabled={disabled}>
        {t("pages.dimensions.actions.save")}
      </Button>
    </div>
  );
}

function LocalizedName({ primary, hindi }: { primary: string; hindi?: string }) {
  return (
    <>
      <strong>{primary}</strong>
      {hindi ? <small className="text-xs text-muted-foreground">{hindi}</small> : null}
    </>
  );
}

function structureTypeOptions(structureTypes: DimensionStructureType[]) {
  const fallback = STRUCTURE_FILTERS.filter((filter) => filter.value !== "ALL").map((filter) => ({
    structure_type_code: filter.value,
    name: filter.value,
  }));
  return (structureTypes.length ? structureTypes : fallback).map((type) => (
    <NativeSelectOption value={type.structure_type_code ?? ""} key={type.structure_type_code}>
      {textValue(type.name ?? type.structure_type_code)}
    </NativeSelectOption>
  ));
}

function setOptions(sets: DimensionMemberSet[]) {
  return (
    <>
      <NativeSelectOption value="">Select set</NativeSelectOption>
      {sets.map((set) => (
        <NativeSelectOption value={set.set_code ?? ""} key={set.set_code}>
          {textValue(set.name ?? set.set_code)}
        </NativeSelectOption>
      ))}
    </>
  );
}

function memberOptions(members: DimensionMember[]) {
  return (
    <>
      <NativeSelectOption value="">Select member</NativeSelectOption>
      {members.map((member) => (
        <NativeSelectOption value={member.member_code ?? ""} key={member.member_code}>
          {textValue(member.name ?? member.member_code)}
        </NativeSelectOption>
      ))}
    </>
  );
}
