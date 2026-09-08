import { PageHeader } from "@/components/common/page-layout";
import { useConfirmation } from "@/hooks/use-confirmation";
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty";

import { CardContent, Card } from "@/components/ui/card";
import { StatusBadge, StatusDot } from "@/components/common/status-badge";
import { DataTableReport } from "@/components/data-table/data-table-report";
import { Sheet, SheetTitle } from "@/components/ui/sheet";

import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";

import { Textarea } from "@/components/ui/textarea";

import { Button } from "@/components/ui/button";
import { ButtonGroup } from "@/components/ui/button-group";
import { CustomTabs, type TabItem } from "@/components/common/custom-tabs";
import { SearchInput } from "@/components/common/search-input";

import { normalizeStatusVariant } from "@/components/common/status-variants";
import {
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogMedia,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  createDataTableColumnHelper,
  DataTable,
  useDataTable,
} from "@/components/data-table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip";

import { Switch } from "@/components/ui/switch";
import { cn, formatCodeLabel } from "@/lib/utils";
import { useCreateAtom, useSelector } from "@tanstack/react-store";
import type { PaginationState } from "@tanstack/react-table";
import { IconEdit, IconTrash } from "@tabler/icons-react";
import { ArrowLeft, ChevronDown, Edit3, Ellipsis, LoaderCircle, Plus, RefreshCw, Search, Trash2, TriangleAlert, X } from "lucide-react";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import {
  createMasterRecord,
  deleteMasterRecord,
  listMasterRecords,
  updateMasterRecord,
  type MasterRecord,
} from "../../api/masters-reference.api";
import { LOCALE_CHANGED_EVENT, UNIT_CHANGED_EVENT } from "../../api/session.api";
import { Loader } from "../../components/common/loader";
import { clampPageOffset, paginationRange } from "../../utils/pagination";
import { SOURCES_MINISTRIES_PATH } from "./source-ministry-routes";

type FieldConfig = {
  key: string;
  label: string;
  type?: "text" | "number" | "checkbox" | "select" | "textarea";
  required?: boolean;
  options?: string[];
  codeFormat?: "locale" | "upper";
  relation?: "organization";
};

type ColumnConfig = {
  label: string;
  keys: string[];
  kind?: "code" | "status" | "organization" | "organizationName" | "localeRegion" | "localeDirection";
};

type MasterPageConfig = {
  title: string;
  description: string;
  endpoint: string;
  patchPath: (record: MasterRecord) => string;
  deletePath: (record: MasterRecord) => string;
  codeKeys: string[];
  columns: ColumnConfig[];
  fields: FieldConfig[];
  searchKeys: string[];
  ownershipNote: string;
};

const ORG_TYPES = ["MINISTRY", "DEPARTMENT", "DIVISION", "UNIT", "SOURCE", "OTHER"];
const OFFICERS_CONFIG_KEY = "scoped-officers";
const masterRecordColumnHelper = createDataTableColumnHelper<MasterRecord>();
const MASTER_STATUS_TABS = ["ALL", "ACTIVE", "INACTIVE"] as const;

const PAGE_CONFIG: Record<string, MasterPageConfig> = {
  "/masters/locales": {
    title: "Locales",
    description: "Govern language and locale records used by metadata labels, content, validation messages, and UI preferences.",
    endpoint: "/masters/locales",
    patchPath: (record) => `/masters/locales/${encodeURIComponent(String(record.locale_code))}`,
    deletePath: (record) => `/masters/locales/${encodeURIComponent(String(record.locale_code))}`,
    codeKeys: ["locale_code"],
    columns: [
      { label: "Name", keys: ["display_name", "name"] },
      { label: "Code", keys: ["locale_code"], kind: "code" },
    ],
    fields: [
      { key: "locale_code", label: "Locale code", required: true, codeFormat: "locale" },
      { key: "display_name", label: "Display name", required: true },
      { key: "native_name", label: "Native name" },
      { key: "sort_order", label: "Sort order", type: "number" },
      { key: "is_default", label: "Default locale", type: "checkbox" },
      { key: "is_active", label: "Active", type: "checkbox" },
    ],
    searchKeys: ["locale_code", "display_name", "native_name"],
    ownershipNote: "Default locale must be unique. Hindi can stay active even if full translation is completed later.",
  },
  "/masters/periodicities": {
    title: "Periodicities",
    description: "Manage reporting frequencies used by indicators, template schedules, collection cycles, and comparison windows.",
    endpoint: "/masters/periodicities",
    patchPath: (record) => `/masters/periodicities/${encodeURIComponent(String(record.periodicity_code))}`,
    deletePath: (record) => `/masters/periodicities/${encodeURIComponent(String(record.periodicity_code))}`,
    codeKeys: ["periodicity_code"],
    columns: [
      { label: "Name", keys: ["name"] },
      { label: "Code", keys: ["periodicity_code"], kind: "code" },
      { label: "Months", keys: ["months_interval"] },
    ],
    fields: [
      { key: "periodicity_code", label: "Periodicity code", codeFormat: "upper" },
      { key: "name", label: "Name", required: true },
      { key: "months_interval", label: "Months interval", type: "number" },
      { key: "sort_order", label: "Sort order", type: "number" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "is_active", label: "Active", type: "checkbox" },
    ],
    searchKeys: ["periodicity_code", "name", "description"],
    ownershipNote: "Periodicities should remain stable because templates and source assignments reference these codes.",
  },
  "/masters/uom": {
    title: "Unit of Measurement (UOM)",
    description: "Maintain governed measurement units referenced by indicator versions, indicator metadata, and indicator measures.",
    endpoint: "/masters/uom",
    patchPath: (record) => `/masters/uom/${encodeURIComponent(String(record.uom_code))}`,
    deletePath: (record) => `/masters/uom/${encodeURIComponent(String(record.uom_code))}`,
    codeKeys: ["uom_code"],
    columns: [
      { label: "Name", keys: ["name"] },
      { label: "Code", keys: ["uom_code"], kind: "code" },
      { label: "Symbol", keys: ["symbol"] },
    ],
    fields: [
      { key: "uom_code", label: "UOM code", codeFormat: "upper" },
      { key: "name", label: "Name", required: true },
      { key: "symbol", label: "Symbol" },
      { key: "uom_type", label: "UOM type", type: "select", required: true, options: ["COUNT", "PERCENT", "RATIO", "RATE", "CURRENCY", "TEXT", "OTHER"] },
      { key: "description", label: "Description", type: "textarea" },
      { key: "sort_order", label: "Sort order", type: "number" },
      { key: "is_active", label: "Active", type: "checkbox" },
    ],
    searchKeys: ["uom_code", "name", "symbol", "uom_type", "description"],
    ownershipNote: "UOM codes are shared reference data. Indicator versions use unit_of_measure_code and measures use unit_code.",
  },
  [SOURCES_MINISTRIES_PATH]: {
    title: "Data Provider",
    description: "Manage data providers and their hierarchy for data collection.",
    endpoint: "/masters/organizations",
    patchPath: (record) => `/masters/organizations/${encodeURIComponent(String(record.organization_code))}`,
    deletePath: (record) => `/masters/organizations/${encodeURIComponent(String(record.organization_code))}`,
    codeKeys: ["organization_code"],
    columns: [
      { label: "Provider Name", keys: ["name"] },
      { label: "Provider Code", keys: ["organization_code"], kind: "code" },
      { label: "Provider Type", keys: ["organization_type"] },
    ],
    fields: [
      { key: "organization_code", label: "Provider Code", codeFormat: "upper" },
      { key: "name", label: "Name", required: true },
      { key: "organization_type", label: "Provider Type", type: "select", required: true, options: ORG_TYPES },
      { key: "parent_organization_code", label: "Parent Provider", codeFormat: "upper", relation: "organization" },
      { key: "short_code", label: "Short code", codeFormat: "upper" },
      { key: "description", label: "Description", type: "textarea" },
      { key: "is_active", label: "Active", type: "checkbox" },
    ],
    searchKeys: ["organization_code", "name", "organization_type", "parent_organization_code", "short_code", "description"],
    ownershipNote: "These are business organizations. Auth unit scope is still managed from Authentication > Units.",
  },
  [OFFICERS_CONFIG_KEY]: {
    title: "Officers",
    description: "Maintain officer contacts for dispatch, escalation, review routing, and organization-level accountability.",
    endpoint: "/masters/officers",
    patchPath: (record) =>
      `/masters/organizations/${encodeURIComponent(String(record.organization_code))}/officers/${encodeURIComponent(String(record.officer_code))}`,
    deletePath: (record) =>
      `/masters/organizations/${encodeURIComponent(String(record.organization_code))}/officers/${encodeURIComponent(String(record.officer_code))}`,
    codeKeys: ["officer_code"],
    columns: [
      { label: "Officer Name", keys: ["display_name"] },
      { label: "Designation", keys: ["designation"] },
      { label: "Email", keys: ["email"] },
      { label: "Mobile", keys: ["mobile_number"] },
    ],
    fields: [
      { key: "organization_code", label: "Source", required: true, codeFormat: "upper", relation: "organization" },
      { key: "officer_code", label: "Officer code", codeFormat: "upper" },
      { key: "display_name", label: "Display name", required: true },
      { key: "email", label: "Email" },
      { key: "mobile_number", label: "Mobile number" },
      { key: "designation", label: "Designation" },
      { key: "is_active", label: "Active", type: "checkbox" },
    ],
    searchKeys: ["officer_code", "display_name", "organization_code", "designation", "email", "mobile_number"],
    ownershipNote: "Officers may later be linked to auth users, but contacts can exist independently for dispatch metadata.",
  },
};

export function MastersReferencePage() {
  const confirm = useConfirmation();
  const location = useLocation();
  const navigate = useNavigate();
  const { t } = useTranslation("common");
  const { organizationCode } = useParams<{ organizationCode?: string }>();
  const scopedOrganizationCode = organizationCode ? decodeURIComponent(organizationCode) : "";
  const isScopedOfficersRoute = Boolean(scopedOrganizationCode && location.pathname.endsWith("/officers"));
  const baseConfig = isScopedOfficersRoute ? PAGE_CONFIG[OFFICERS_CONFIG_KEY] : PAGE_CONFIG[location.pathname] ?? PAGE_CONFIG["/masters/locales"];
  const isUomPage = baseConfig.endpoint === "/masters/uom";
  const isPeriodicitiesPage = baseConfig.endpoint === "/masters/periodicities";
  const usesCollectionListPattern = isUomPage || isPeriodicitiesPage;
  const isSourcesMinistriesPage = baseConfig.endpoint === "/masters/organizations";
  const defaultsToAllStatuses = isSourcesMinistriesPage || isScopedOfficersRoute;
  const config = useMemo(() => isUomPage ? {
    ...baseConfig,
    title: t("pages.uom.title"),
    description: t("pages.uom.description"),
    ownershipNote: t("pages.uom.ownershipNote"),
    columns: [
      { ...baseConfig.columns[0], label: t("pages.uom.columns.name") },
      { ...baseConfig.columns[1], label: t("pages.uom.columns.code") },
      { ...baseConfig.columns[2], label: t("pages.uom.columns.symbol") },
    ],
    fields: baseConfig.fields.map((field) => ({
      ...field,
      label: t(`pages.uom.fields.${({ uom_code: "code", name: "name", symbol: "symbol", uom_type: "type", description: "description", sort_order: "sortOrder", is_active: "active" } as Record<string, string>)[field.key]}`),
    })),
  } : isPeriodicitiesPage ? {
    ...baseConfig,
    title: t("pages.periodicities.title"),
    description: t("pages.periodicities.description"),
    ownershipNote: t("pages.periodicities.ownershipNote"),
    columns: [
      { ...baseConfig.columns[0], label: t("pages.periodicities.columns.name") },
      { ...baseConfig.columns[1], label: t("pages.periodicities.columns.code") },
      { ...baseConfig.columns[2], label: t("pages.periodicities.columns.months") },
    ],
    fields: baseConfig.fields.map((field) => ({
      ...field,
      label: t(`pages.periodicities.fields.${({ periodicity_code: "code", name: "name", months_interval: "months", sort_order: "sortOrder", description: "description", is_active: "active" } as Record<string, string>)[field.key]}`),
    })),
  } : isSourcesMinistriesPage ? {
    ...baseConfig,
    title: t("pages.sourcesMinistries.title"),
    description: t("pages.sourcesMinistries.description"),
    columns: [
      { ...baseConfig.columns[0], label: t("pages.sourcesMinistries.columns.organizationName") },
      { ...baseConfig.columns[2], label: t("pages.sourcesMinistries.columns.type") },
      { label: t("pages.sourcesMinistries.columns.status"), keys: ["is_active"], kind: "status" as const },
    ],
  } : isScopedOfficersRoute ? {
    ...baseConfig,
    columns: [
      { ...baseConfig.columns[0], label: t("pages.sourcesMinistries.officerColumns.name") },
      { ...baseConfig.columns[1], label: t("pages.sourcesMinistries.officerColumns.designation") },
      { ...baseConfig.columns[2], label: t("pages.sourcesMinistries.officerColumns.email") },
      { ...baseConfig.columns[3], label: t("pages.sourcesMinistries.officerColumns.mobile") },
    ],
  } : baseConfig, [baseConfig, isPeriodicitiesPage, isScopedOfficersRoute, isSourcesMinistriesPage, isUomPage, t]);
  const [records, setRecords] = useState<MasterRecord[]>([]);
  const [organizationRecords, setOrganizationRecords] = useState<MasterRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<MasterRecord | null>(null);
  const [editingRecord, setEditingRecord] = useState<MasterRecord | null>(null);
  const [formValues, setFormValues] = useState<MasterRecord>({});
  const [searchText, setSearchText] = useState("");
  const [debouncedSearchText, setDebouncedSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState(defaultsToAllStatuses ? "ALL" : "ACTIVE");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [pageSize, setPageSize] = useState(isSourcesMinistriesPage || usesCollectionListPattern ? 10 : 25);
  const [offset, setOffset] = useState(0);
  const [totalCount, setTotalCount] = useState(0);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [statusUpdatingCode, setStatusUpdatingCode] = useState("");
  const [pendingDelete, setPendingDelete] = useState<{ record: MasterRecord; config: MasterPageConfig } | null>(null);
  const recordPendingDelete = pendingDelete?.record ?? null;
  const deleteTargetConfig = pendingDelete?.config ?? config;
  const deletingOfficer = deleteTargetConfig.endpoint === "/masters/officers";
  const [deleteError, setDeleteError] = useState("");

  const availableTypes = useMemo(() => {
    if (config.endpoint === "/masters/organizations") return ORG_TYPES;
    const types = new Set(records.map((record) => String(record.organization_type ?? "")).filter(Boolean));
    return Array.from(types).sort();
  }, [config.endpoint, records]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setRecords([]);
      setSelectedRecord(null);
      setEditingRecord(null);
      setSearchText("");
      setDebouncedSearchText("");
      setStatusFilter(defaultsToAllStatuses ? "ALL" : "ACTIVE");
      setTypeFilter("ALL");
      setPageSize(isSourcesMinistriesPage || usesCollectionListPattern ? 10 : 25);
      setOffset(0);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [config, defaultsToAllStatuses, isSourcesMinistriesPage, scopedOrganizationCode, usesCollectionListPattern]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearchText(searchText);
      setOffset(0);
    }, 280);
    return () => window.clearTimeout(timer);
  }, [searchText]);

  useEffect(() => {
    void loadRecords(config);
  }, [config, debouncedSearchText, statusFilter, typeFilter, scopedOrganizationCode, pageSize, offset]);

  useEffect(() => {
    const nextOffset = clampPageOffset(offset, pageSize, totalCount);
    if (nextOffset === offset) return;
    const timer = window.setTimeout(() => setOffset(nextOffset), 0);
    return () => window.clearTimeout(timer);
  }, [offset, pageSize, totalCount]);

  useEffect(() => {
    const handleContextChange = () => void loadRecords(config, true);
    window.addEventListener(LOCALE_CHANGED_EVENT, handleContextChange);
    window.addEventListener(UNIT_CHANGED_EVENT, handleContextChange);
    return () => {
      window.removeEventListener(LOCALE_CHANGED_EVENT, handleContextChange);
      window.removeEventListener(UNIT_CHANGED_EVENT, handleContextChange);
    };
  }, [config, debouncedSearchText, statusFilter, typeFilter, scopedOrganizationCode, pageSize, offset]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 3600);
    return () => window.clearTimeout(timer);
  }, [notice]);

  async function loadRecords(pageConfig = config, forceLoader = false): Promise<void> {
    setIsLoading(forceLoader || records.length === 0);
    setError("");
    try {
      const response = await listMasterRecords({
        endpoint: pageConfig.endpoint,
        params: masterListParams(pageConfig, {
          search: debouncedSearchText,
          statusFilter,
          typeFilter,
          organizationFilter: scopedOrganizationCode || "ALL",
          limit: pageSize,
          offset,
        }),
      });
      const organizationResponse =
        pageConfig.endpoint === "/masters/organizations"
          ? response
          : await listMasterRecords({
              endpoint: "/masters/organizations",
              params: { limit: 500, offset: 0, status_filter: "ALL" },
            });
      setRecords(response.data);
      setOrganizationRecords(organizationResponse.data);
      setTotalCount(response.count ?? response.data.length);
      setSelectedRecord((current) => {
        const currentKey = current ? getRecordKey(current, 0).split("-0")[0] : "";
        return response.data.find((record, index) => getRecordKey(record, index).startsWith(currentKey)) ?? response.data[0] ?? null;
      });
      setNotice(`${pageConfig.title} refreshed.`);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : isSourcesMinistriesPage || isScopedOfficersRoute ? t("pages.sourcesMinistries.loadError") : `${pageConfig.title} could not be loaded.`);
    } finally {
      setIsLoading(false);
    }
  }

  function openCreateForm(): void {
    if (isLocalesPage) {
      navigate("/masters/locales/create");
      return;
    }
    if (isPeriodicitiesPage) {
      navigate("/masters/periodicities/create");
      return;
    }
    if (isUomPage) {
      navigate("/masters/uom/create");
      return;
    }
    if (isUnitsPage) {
      navigate(`${SOURCES_MINISTRIES_PATH}/create`);
      return;
    }
    if (isOfficersPage) {
      navigate(`${SOURCES_MINISTRIES_PATH}/${encodeURIComponent(scopedOrganizationCode)}/officers/create`);
      return;
    }
    setEditingRecord(null);
    setFormValues(defaultFormValues(config));
  }

  function openEditForm(record: MasterRecord): void {
    setEditingRecord(record);
    setFormValues({ ...defaultFormValues(config), ...record });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setIsSaving(true);
    setError("");
    try {
      const payload = normalizePayload(config, formValues);
      validatePayload(config, payload);
      if (editingRecord) {
        await updateMasterRecord({
          endpoint: config.endpoint,
          patchPath: config.patchPath(editingRecord),
          payload,
        });
      } else {
        await createMasterRecord({ endpoint: config.endpoint, payload });
      }
      setNotice(`${config.title} saved.`);
      setEditingRecord(null);
      setFormValues({});
      await loadRecords(config);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : `${config.title} could not be saved.`);
    } finally {
      setIsSaving(false);
    }
  }

  async function handleDelete(record: MasterRecord): Promise<void> {
    const label = String(resolveValue(record, ["name", "display_name", "locale_code", "periodicity_code", "uom_code", "organization_code", "officer_code"]) ?? "this record");
    const confirmed = (await confirm(`Delete ${label}? This will deactivate the master only if no child records are using it.`));
    if (!confirmed) return;
    setIsDeleting(true);
    setError("");
    try {
      await deleteMasterRecord({
        endpoint: config.endpoint,
        deletePath: config.deletePath(record),
      });
      setNotice(`${config.title} deleted.`);
      setSelectedRecord((current) => (current === record ? null : current));
      await loadRecords(config);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : `${config.title} could not be deleted.`);
    } finally {
      setIsDeleting(false);
    }
  }

  function requestDelete(record: MasterRecord, targetConfig: MasterPageConfig = config): void {
    setDeleteError("");
    setPendingDelete({ record, config: targetConfig });
  }

  function closeDeleteDialog(): void {
    if (isDeleting) return;
    setPendingDelete(null);
    setDeleteError("");
  }

  async function confirmDelete(): Promise<void> {
    if (!recordPendingDelete || isDeleting) return;
    const record = recordPendingDelete;
    const label = String(resolveValue(record, ["name", "display_name", "locale_code", "periodicity_code"]) ?? "this record");
    setIsDeleting(true);
    setDeleteError("");
    try {
      await deleteMasterRecord({
        endpoint: deleteTargetConfig.endpoint,
        deletePath: deleteTargetConfig.deletePath(record),
      });
      setPendingDelete(null);
      setSelectedRecord((current) => (current === record ? null : current));
      toast.success(isUomPage ? t("pages.uom.deleted") : isPeriodicitiesPage ? t("pages.periodicities.deleted") : t(deletingOfficer ? "pages.sourcesMinistries.officerDeleted" : "pages.sourcesMinistries.organizationDeleted"), {
        description: isUomPage ? t("pages.uom.deletedDescription", { name: label }) : isPeriodicitiesPage ? t("pages.periodicities.deletedDescription", { name: label }) : t("pages.sourcesMinistries.deletedDescription", { name: label }),
      });
      if (isOfficersPage && deleteTargetConfig.endpoint === "/masters/organizations") {
        navigate(SOURCES_MINISTRIES_PATH, { replace: true });
      } else {
        await loadRecords(config);
      }
    } catch (deleteFailure) {
      const message = deleteFailure instanceof Error ? deleteFailure.message : isUomPage ? t("pages.uom.deleteError") : isPeriodicitiesPage ? t("pages.periodicities.deleteError") : t(deletingOfficer ? "pages.sourcesMinistries.officerDeleteError" : "pages.sourcesMinistries.organizationDeleteError");
      setDeleteError(message);
      toast.error(isUomPage ? t("pages.uom.couldNotDelete") : isPeriodicitiesPage ? t("pages.periodicities.couldNotDelete") : t(deletingOfficer ? "pages.sourcesMinistries.officerDeleteError" : "pages.sourcesMinistries.organizationDeleteError"), { description: message });
    } finally {
      setIsDeleting(false);
    }
  }

  async function updateOrganizationStatus(record: MasterRecord, isActive: boolean): Promise<void> {
    const organizationCode = String(record.organization_code ?? "");
    if (!organizationCode || statusUpdatingCode) return;
    setStatusUpdatingCode(organizationCode);
    try {
      await updateMasterRecord({
        endpoint: config.endpoint,
        patchPath: config.patchPath(record),
        payload: {
          organization_code: organizationCode,
          organization_type: record.organization_type,
          name: record.name,
          description: record.description ?? null,
          parent_organization_code: record.parent_organization_code ?? null,
          short_code: record.short_code ?? null,
          is_active: isActive,
        },
      });
      toast.success(t("pages.sourcesMinistries.statusUpdated"), {
        description: t("pages.sourcesMinistries.statusUpdatedDescription", {
          name: String(record.name ?? organizationCode),
          status: t(isActive ? "pages.sourcesMinistries.active" : "pages.sourcesMinistries.inactive"),
        }),
      });
      await loadRecords(config);
    } catch (statusError) {
      toast.error(t("pages.sourcesMinistries.statusUpdateError"), {
        description: statusError instanceof Error ? statusError.message : t("pages.sourcesMinistries.statusUpdateErrorDescription"),
      });
    } finally {
      setStatusUpdatingCode("");
    }
  }

  const activeCount = records.filter(isRecordActive).length;
  const formOpen = Object.keys(formValues).length > 0;
  const { pageStart, pageEnd, currentPage, totalPages, canGoPrevious, canGoNext } = paginationRange(offset, pageSize, totalCount, records.length);
  const isLocalesPage = config.title === "Locales";
  const isUnitsPage = config.endpoint === "/masters/organizations";
  const isOfficersPage = config.endpoint === "/masters/officers";
  const usesDataTablePage = isLocalesPage || isPeriodicitiesPage || isUomPage || isUnitsPage || isOfficersPage;
  const usesSimpleListPage = isLocalesPage || isPeriodicitiesPage || isUomPage || isUnitsPage || isOfficersPage;
  const usesAccordionDetail = false;
  const usesStreamlinedHeader = isLocalesPage || isPeriodicitiesPage || isUomPage || isUnitsPage || isOfficersPage;
  const selectedOrganization = organizationRecords.find((record) => String(record.organization_code) === scopedOrganizationCode);
  const pageTitle = isOfficersPage ? t("pages.sourcesMinistries.officersTitle") : config.title;
  const organizationName = String(selectedOrganization?.name ?? scopedOrganizationCode);
  const pageDescription = isOfficersPage
    ? t("pages.sourcesMinistries.officersDescription")
    : config.description;

  return (
    <div className="flex min-w-0 flex-col gap-4">
      {isOfficersPage ? <Button className="w-fit" type="button" variant="outline" onPress={() => navigate(SOURCES_MINISTRIES_PATH)}>
        <ArrowLeft data-icon="inline-start" aria-hidden="true" />{t("pages.sourcesMinistries.backToSources")}
      </Button> : null}
      <PageHeader>
        <div className="min-w-0">
          <h2 className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
            <span>{pageTitle}</span>
            {isOfficersPage ? <><span aria-hidden="true" className="text-muted-foreground">|</span><span className="min-w-0 break-words">{organizationName}</span></> : null}
          </h2>
          <p>{pageDescription}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {!usesStreamlinedHeader ? (
            <Button variant="outline" type="button" onClick={() => void loadRecords()}>
              <RefreshCw size={14} />
              Refresh
            </Button>
          ) : null}
          <ButtonGroup aria-label={isOfficersPage ? t("pages.sourcesMinistries.officerActions") : undefined}>
          <Button className={usesCollectionListPattern ? undefined : ""} size={usesCollectionListPattern ? "sm" : undefined} type="button" onClick={openCreateForm}>
            <Plus data-icon="inline-start" aria-hidden="true" />
            {isUomPage
              ? t("pages.uom.new")
              : isPeriodicitiesPage
                ? t("pages.periodicities.new")
                : isOfficersPage
                  ? t("pages.sourcesMinistries.addOfficer")
                  : isUnitsPage
                    ? t("pages.sourcesMinistries.addMinistry")
                    : "New"}
          </Button>
          {isOfficersPage ? <DropdownMenuTrigger>
            <Button type="button" size="icon" aria-label={t("pages.sourcesMinistries.officerActions")}><ChevronDown aria-hidden="true" /></Button>
            <DropdownMenu placement="bottom end" className="min-w-48 whitespace-nowrap" aria-label={t("pages.sourcesMinistries.officerActions")}>
              <DropdownMenuGroup>
                <DropdownMenuItem id="edit-ministry" textValue={t("pages.sourcesMinistries.editMinistry")} isDisabled={isDeleting || !scopedOrganizationCode} onAction={() => navigate(`${SOURCES_MINISTRIES_PATH}/${encodeURIComponent(scopedOrganizationCode)}/edit`)}>
                  <IconEdit aria-hidden="true" />{t("pages.sourcesMinistries.editMinistry")}
                </DropdownMenuItem>
                <DropdownMenuItem id="add-ministry" textValue={t("pages.sourcesMinistries.addMinistry")} isDisabled={isDeleting} onAction={() => navigate(`${SOURCES_MINISTRIES_PATH}/create`)}>
                  <Plus aria-hidden="true" />{t("pages.sourcesMinistries.addMinistry")}
                </DropdownMenuItem>
                <DropdownMenuItem id="delete-ministry" variant="destructive" textValue={t("pages.sourcesMinistries.deleteMinistry")} isDisabled={isDeleting || !scopedOrganizationCode} onAction={() => requestDelete(selectedOrganization ?? { organization_code: scopedOrganizationCode, name: organizationName }, PAGE_CONFIG[SOURCES_MINISTRIES_PATH])}>
                  <IconTrash aria-hidden="true" />{t("pages.sourcesMinistries.deleteMinistry")}
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenu>
          </DropdownMenuTrigger> : null}
          </ButtonGroup>
        </div>
      </PageHeader>

      {notice && !usesStreamlinedHeader ? <div className="rounded-md bg-muted p-3 text-sm">{notice}</div> : null}
      {error && !usesDataTablePage ? <div className="rounded-md bg-muted p-3 text-sm text-destructive">{error}</div> : null}

      {!usesStreamlinedHeader ? (
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MetricCard label="Records" sublabel={`${activeCount} active`} value={totalCount} />
          <MetricCard label="Visible" sublabel={`${pageStart}-${pageEnd} shown`} value={records.length} />
        </section>
      ) : null}

      {!usesDataTablePage ? <section className="flex min-w-0 flex-wrap items-center gap-3">
        <div className="flex min-w-0 items-center gap-2 [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-muted-foreground">
          <Search size={15} />
          <Input
            onChange={(event) => setSearchText(event.target.value)}
            placeholder={`Search ${config.title.toLowerCase()}`}
            value={searchText}
          />
        </div>
        <NativeSelect value={statusFilter} onChange={(event) => {
          setStatusFilter(event.target.value);
          setOffset(0);
        }} aria-label="Status">
          <NativeSelectOption value="ACTIVE">Active</NativeSelectOption>
          <NativeSelectOption value="ALL">All statuses</NativeSelectOption>
          <NativeSelectOption value="INACTIVE">Inactive</NativeSelectOption>
        </NativeSelect>
        {availableTypes.length > 0 && (
          <NativeSelect value={typeFilter} onChange={(event) => {
            setTypeFilter(event.target.value);
            setOffset(0);
          }} aria-label="Type">
            <NativeSelectOption value="ALL">All types</NativeSelectOption>
            {availableTypes.map((type) => (
              <NativeSelectOption value={type} key={type}>{type}</NativeSelectOption>
            ))}
          </NativeSelect>
        )}
      </section> : null}

      <section className="flex min-w-0 flex-col gap-4">
        <div className={usesDataTablePage ? "" : "min-w-0"}>
          {usesDataTablePage ? (
            <MasterDataTable
              config={config}
              records={records}
              organizationRecords={organizationRecords}
              searchText={searchText}
              statusFilter={statusFilter}
              typeFilter={typeFilter}
              availableTypes={availableTypes}
              pageSize={pageSize}
              offset={offset}
              totalCount={totalCount}
              isLoading={isLoading}
              error={error}
              isDeleting={isDeleting}
              statusUpdatingCode={statusUpdatingCode}
              onSearchChange={setSearchText}
              onStatusChange={(status) => {
                setStatusFilter(status);
                setOffset(0);
              }}
              onTypeChange={(type) => {
                setTypeFilter(type);
                setOffset(0);
              }}
              onPaginationChange={(nextOffset, nextPageSize) => {
                setPageSize(nextPageSize);
                setOffset(nextOffset);
              }}
              onEdit={(record) => {
                if (isLocalesPage) {
                  navigate(`/masters/locales/${encodeURIComponent(String(record.locale_code))}/edit`);
                  return;
                }
                if (isPeriodicitiesPage) {
                  navigate(`/masters/periodicities/${encodeURIComponent(String(record.periodicity_code))}/edit`);
                  return;
                }
                if (isUomPage) {
                  navigate(`/masters/uom/${encodeURIComponent(String(record.uom_code))}/edit`);
                  return;
                }
                if (isUnitsPage) {
                  navigate(`${SOURCES_MINISTRIES_PATH}/${encodeURIComponent(String(record.organization_code))}/edit`);
                  return;
                }
                if (isOfficersPage) {
                  navigate(`${SOURCES_MINISTRIES_PATH}/${encodeURIComponent(scopedOrganizationCode)}/officers/${encodeURIComponent(String(record.officer_code))}/edit`);
                  return;
                }
                openEditForm(record);
              }}
              onRowClick={isUnitsPage ? (record) => navigate(`${SOURCES_MINISTRIES_PATH}/${encodeURIComponent(String(record.organization_code))}/officers`) : undefined}
              onDelete={requestDelete}
              onStatusToggle={(record, isActive) => void updateOrganizationStatus(record, isActive)}
              onRetry={() => void loadRecords()}
            />
          ) : isLoading ? (
            <Loader text={`Loading ${config.title.toLowerCase()}...`} />
          ) : records.length === 0 ? (
            <Empty><EmptyHeader><EmptyTitle>No {config.title.toLowerCase()} records found.</EmptyTitle></EmptyHeader></Empty>
          ) : (
            <div className="min-w-0 overflow-x-auto">
                    <DataTableReport ariaLabel={config.title} headers={[...config.columns.map(column => column.label), t("reportTable.action")]} rows={records.map((record, index) => {
                      const isSelected = !usesSimpleListPage && record === selectedRecord;
                      return {
                        id: getRecordKey(record, index),
                        className: isSelected ? "bg-accent" : undefined,
                        onClick: usesSimpleListPage ? undefined : () => setSelectedRecord(current => usesAccordionDetail && current === record ? null : record),
                        cells: [...config.columns.map(column => <div key={column.label}>{renderColumn(record, column, organizationRecords)}</div>), <div key="actions">
                          <div className={usesAccordionDetail ? "text-right" : "flex flex-wrap items-center gap-2"}>
                            <Button size="icon-sm" variant="ghost"

                              type="button"
                              aria-label="Edit"
                              onClick={(event) => {
                                event.stopPropagation();
                                openEditForm(record);
                              }}
                            >
                              <Edit3 size={13} />
                              {!usesSimpleListPage && "Edit"}
                            </Button>
                            <Button size="icon-sm" variant="ghost"
                              className="text-destructive"
                              isDisabled={isDeleting}
                              type="button"
                              aria-label="Delete"
                              onClick={(event) => {
                                event.stopPropagation();
                                void handleDelete(record);
                              }}
                            >
                              <Trash2 size={13} />
                            </Button>
                            {usesAccordionDetail && (
                              <Button
                                aria-expanded={isSelected}
                                aria-label={isSelected ? `Hide ${config.title.toLowerCase()} details` : `Show ${config.title.toLowerCase()} details`}
                                className={isSelected ? "size-4 rotate-180" : "size-4"}
                                type="button"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  setSelectedRecord((current) => (current === record ? null : record));
                                }}
                              >
                                <ChevronDown size={13} />
                              </Button>
                            )}
                          </div>
                        </div>],
                        detail: usesAccordionDetail && isSelected ? <RecordDetailAccordion config={config} organizationRecords={organizationRecords} record={record} /> : undefined,
                      };
                    })} />
            </div>
          )}
          {!usesDataTablePage ? <div className="flex flex-wrap items-center justify-between gap-3 border-t p-3">
            <span className="text-xs text-muted-foreground">Showing {pageStart}-{pageEnd} of {totalCount}</span>
            <div className="flex flex-wrap items-center gap-2">
              <NativeSelect
                aria-label="Rows per page"
                value={pageSize}
                onChange={(event) => {
                  setPageSize(Number(event.target.value));
                  setOffset(0);
                }}
              >
                {[10, 25, 50, 100].map((size) => (
                  <NativeSelectOption key={size} value={size}>{size} / page</NativeSelectOption>
                ))}
              </NativeSelect>
              <span className="text-xs text-muted-foreground" aria-label="Current page">Page {currentPage} of {totalPages}</span>
              <Button variant="outline" isDisabled={!canGoPrevious} type="button" onClick={() => setOffset(clampPageOffset(offset - pageSize, pageSize, totalCount))}>
                Previous
              </Button>
              <Button variant="outline" isDisabled={!canGoNext} type="button" onClick={() => setOffset(clampPageOffset(offset + pageSize, pageSize, totalCount))}>
                Next
              </Button>
            </div>
          </div> : null}
        </div>
        {!usesAccordionDetail && !usesSimpleListPage && <RecordDetailPanel config={config} organizationRecords={organizationRecords} record={selectedRecord} />}
      </section>
      {formOpen && (
        <FormPanel
          config={config}
          editingRecord={editingRecord}
          formValues={formValues}
          isSaving={isSaving}
          organizationRecords={organizationRecords}
          onCancel={() => {
            setEditingRecord(null);
            setFormValues({});
          }}
          onChange={(key, value) => setFormValues((current) => applyFormValueChange(config, current, key, value))}
          onSubmit={(event) => void handleSubmit(event)}
        />
      )}
      {usesDataTablePage ? (
        <AlertDialogContent
          isOpen={Boolean(recordPendingDelete)}
          isDismissable={!isDeleting}
          onOpenChange={(isOpen) => {
            if (!isOpen) closeDeleteDialog();
          }}
        >
          <AlertDialogHeader>
            <AlertDialogMedia className="bg-destructive/10 text-destructive">
              <TriangleAlert aria-hidden="true" />
            </AlertDialogMedia>
            <AlertDialogTitle>{isUomPage ? t("pages.uom.deleteTitle") : isPeriodicitiesPage ? t("pages.periodicities.deleteTitle") : t(deletingOfficer ? "pages.sourcesMinistries.deleteOfficerTitle" : "pages.sourcesMinistries.deleteOrganizationTitle")}</AlertDialogTitle>
            <AlertDialogDescription>
              <p>
                {isUomPage ? t("pages.uom.deleteIntro", { name: String(resolveValue(recordPendingDelete ?? {}, ["name", "uom_code"]) ?? t("pages.uom.singular")) }) : isPeriodicitiesPage ? t("pages.periodicities.deleteIntro", { name: String(resolveValue(recordPendingDelete ?? {}, ["name", "periodicity_code"]) ?? t("pages.periodicities.singular")) }) : t("pages.sourcesMinistries.deleteIntro", { name: String(resolveValue(recordPendingDelete ?? {}, ["name", "display_name", "locale_code", "periodicity_code"]) ?? "-") })}
              </p>
              <p className="mt-1">{isUomPage ? t("pages.uom.deleteWarning") : isPeriodicitiesPage ? t("pages.periodicities.deleteWarning") : t("pages.sourcesMinistries.deleteWarning")}</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          {deleteError ? <p className="rounded-md bg-destructive/10 px-3 py-2 text-xs text-destructive" role="alert">{deleteError}</p> : null}
          <AlertDialogFooter>
            <AlertDialogCancel isDisabled={isDeleting} onPress={closeDeleteDialog}>{isUomPage ? t("pages.uom.cancel") : isPeriodicitiesPage ? t("pages.periodicities.cancel") : t("pages.sourcesMinistries.cancel")}</AlertDialogCancel>
            <Button variant="destructive" isDisabled={isDeleting} onPress={() => void confirmDelete()}>
              {isDeleting ? <LoaderCircle className="animate-spin" data-icon="inline-start" aria-hidden="true" /> : <Trash2 data-icon="inline-start" aria-hidden="true" />}
              {isUomPage ? t(isDeleting ? "pages.uom.deleting" : "pages.uom.delete") : isPeriodicitiesPage ? t(isDeleting ? "pages.periodicities.deleting" : "pages.periodicities.delete") : t(isDeleting ? "pages.sourcesMinistries.deleting" : deletingOfficer ? "pages.sourcesMinistries.deleteOfficerAction" : "pages.sourcesMinistries.deleteOrganization")}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      ) : null}
    </div>
  );
}

function MasterDataTable({
  config,
  records,
  organizationRecords,
  searchText,
  statusFilter,
  typeFilter,
  availableTypes,
  pageSize,
  offset,
  totalCount,
  isLoading,
  error,
  isDeleting,
  statusUpdatingCode,
  onSearchChange,
  onStatusChange,
  onTypeChange,
  onPaginationChange,
  onEdit,
  onDelete,
  onStatusToggle,
  onRowClick,
  onRetry,
}: {
  config: MasterPageConfig;
  records: MasterRecord[];
  organizationRecords: MasterRecord[];
  searchText: string;
  statusFilter: string;
  typeFilter: string;
  availableTypes: string[];
  pageSize: number;
  offset: number;
  totalCount: number;
  isLoading: boolean;
  error: string;
  isDeleting: boolean;
  statusUpdatingCode: string;
  onSearchChange: (value: string) => void;
  onStatusChange: (value: string) => void;
  onTypeChange: (value: string) => void;
  onPaginationChange: (offset: number, pageSize: number) => void;
  onEdit: (record: MasterRecord) => void;
  onDelete: (record: MasterRecord) => void;
  onStatusToggle: (record: MasterRecord, isActive: boolean) => void;
  onRowClick?: (record: MasterRecord) => void;
  onRetry: () => void;
}) {
  const { t } = useTranslation("common");
  const isUomPage = config.endpoint === "/masters/uom";
  const isPeriodicitiesPage = config.endpoint === "/masters/periodicities";
  const isSourcesMinistriesPage = config.endpoint === "/masters/organizations";
  const isOfficersPage = config.endpoint === "/masters/officers";
  const usesOrganizationStatusOptions = isSourcesMinistriesPage || isOfficersPage;
  const usesStatusTabs = isSourcesMinistriesPage || isOfficersPage || isUomPage || isPeriodicitiesPage;
  const localizedPage = isUomPage ? "pages.uom" : isPeriodicitiesPage ? "pages.periodicities" : "";
  const singularTitle = getSingularTitle(config.title);
  const lowerCaseTitle = config.title.toLowerCase();
  const paginationAtom = useCreateAtom<PaginationState>({
    pageIndex: Math.floor(offset / pageSize),
    pageSize,
  });
  const pagination = useSelector(paginationAtom, (value) => value);

  useEffect(() => {
    const nextOffset = pagination.pageIndex * pagination.pageSize;
    if (nextOffset !== offset || pagination.pageSize !== pageSize) {
      onPaginationChange(nextOffset, pagination.pageSize);
    }
  }, [offset, onPaginationChange, pageSize, pagination.pageIndex, pagination.pageSize]);

  const columns = useMemo(() => masterRecordColumnHelper.columns([
    ...config.columns.map((column) => masterRecordColumnHelper.accessor(
      (record) => resolveValue(record, column.keys),
      {
        id: column.label,
        header: column.label,
        sortFn: "alphanumeric",
        cell: ({ row }) => {
          const isOrganizationStatusColumn = isSourcesMinistriesPage
            && column.keys.length === 1
            && column.keys[0] === "is_active";
          if (isOrganizationStatusColumn) {
            const organizationCode = String(row.original.organization_code ?? "");
            const isActive = isRecordActive(row.original);
            return (
              <div className="flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
                <Switch
                  size="sm"
                  aria-label={t("pages.sourcesMinistries.statusToggleLabel", { name: String(row.original.name ?? organizationCode) })}
                  isDisabled={Boolean(statusUpdatingCode)}
                  isSelected={isActive}
                  onChange={(selected) => onStatusToggle(row.original, selected)}
                />
                <span className={cn("text-xs", isActive ? "font-medium text-foreground" : "text-muted-foreground")}>
                  {t(isActive ? "pages.sourcesMinistries.active" : "pages.sourcesMinistries.inactive")}
                </span>
              </div>
            );
          }
          const isOrganizationTypeColumn = isSourcesMinistriesPage
            && column.keys.length === 1
            && column.keys[0] === "organization_type";
          const organizationType = String(resolveValue(row.original, column.keys) ?? "");
          const renderedValue = isOrganizationTypeColumn
            ? renderCompactCell(t(`pages.sourcesMinistries.types.${organizationType}`, { defaultValue: formatCodeLabel(organizationType) }))
            : renderColumn(row.original, column, organizationRecords);
          const isOrganizationNameColumn = isSourcesMinistriesPage
            && column.keys.length === 1
            && column.keys[0] === "name";
          if (isOrganizationNameColumn) {
            const fullValue = formatValue(resolveValue(row.original, column.keys));
            return (
              <span
                className="block w-full max-w-none overflow-hidden whitespace-normal break-words text-ellipsis [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]"
                title={fullValue}
              >
                {renderedValue}
              </span>
            );
          }
          const truncatesPeriodicity = isPeriodicitiesPage && column.kind !== "status";
          const truncatesOfficer = config.title === "Officers" && column.kind !== "status";
          if (!truncatesPeriodicity && !truncatesOfficer) {
            return renderedValue;
          }
          const fullValue = formatValue(resolveValue(row.original, column.keys));
          return (
            <TooltipTrigger delay={250}>
              <span className={cn(
                column.keys[0] === "display_name" && isOfficersPage
                  ? "block w-full overflow-hidden whitespace-normal break-words text-ellipsis [display:-webkit-box] [-webkit-box-orient:vertical] [-webkit-line-clamp:2]"
                  : "block truncate",
                column.keys[0] === "display_name" && isOfficersPage
                  ? "max-w-none"
                  : column.label === "Name"
                    ? "max-w-72"
                    : column.keys[0] === "display_name" || ["Officer", "Source", "Designation"].includes(column.label)
                      ? "max-w-56"
                      : "max-w-44",
              )} tabIndex={0}>
                {renderedValue}
              </span>
              <Tooltip className="max-w-sm whitespace-normal break-words">{fullValue}</Tooltip>
            </TooltipTrigger>
          );
        },
      },
    )),
    masterRecordColumnHelper.display({
      id: "actions",
      header: () => <span className="block text-right">{isSourcesMinistriesPage || isOfficersPage ? t("pages.sourcesMinistries.actions") : localizedPage ? t(`${localizedPage}.columns.actions`) : "Actions"}</span>,
      enableSorting: false,
      enableGlobalFilter: false,
      cell: ({ row }) => usesOrganizationStatusOptions ? (
        <div className="flex items-center justify-end gap-1" onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
          <TooltipTrigger>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={t(isOfficersPage ? "pages.sourcesMinistries.editOfficer" : "pages.sourcesMinistries.editMinistry")}
              onPress={() => onEdit(row.original)}
            >
              <IconEdit data-icon="inline-start" aria-hidden="true" />
            </Button>
            <Tooltip>{t(isOfficersPage ? "pages.sourcesMinistries.editOfficer" : "pages.sourcesMinistries.editMinistry")}</Tooltip>
          </TooltipTrigger>
          <TooltipTrigger>
            <Button
              type="button"
              variant="destructive"
              size="icon-sm"
              aria-label={t(isOfficersPage ? "pages.sourcesMinistries.deleteOfficer" : "pages.sourcesMinistries.deleteMinistry")}
              isDisabled={isDeleting}
              onPress={() => onDelete(row.original)}
            >
              <IconTrash data-icon="inline-start" aria-hidden="true" />
            </Button>
            <Tooltip>{t(isOfficersPage ? "pages.sourcesMinistries.deleteOfficer" : "pages.sourcesMinistries.deleteMinistry")}</Tooltip>
          </TooltipTrigger>
        </div>
      ) : (
        <div className="flex justify-end" onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}>
          <DropdownMenuTrigger>
            <Button
              type="button"
              variant="ghost"
              size="icon-sm"
              aria-label={localizedPage ? t(`${localizedPage}.actionsFor`, { name: String(resolveValue(row.original, ["name", ...config.codeKeys]) ?? singularTitle) }) : `Actions for ${String(resolveValue(row.original, ["display_name", "name", ...config.codeKeys]) ?? singularTitle)}`}
            >
              <Ellipsis aria-hidden="true" />
            </Button>
            <DropdownMenu
              aria-label={localizedPage ? t(`${localizedPage}.actionsFor`, { name: String(resolveValue(row.original, ["name", ...config.codeKeys]) ?? singularTitle) }) : `Actions for ${String(resolveValue(row.original, ["display_name", "name", ...config.codeKeys]) ?? singularTitle)}`}
              className="min-w-40"
              placement="bottom end"
            >
              <DropdownMenuLabel>{localizedPage ? t(`${localizedPage}.actions`) : `${config.title} actions`}</DropdownMenuLabel>
              <DropdownMenuGroup>
                <DropdownMenuItem id="edit" onAction={() => onEdit(row.original)}>
                  <Edit3 aria-hidden="true" />
                  {localizedPage ? t(`${localizedPage}.edit`) : `Edit ${singularTitle}`}
                </DropdownMenuItem>
              </DropdownMenuGroup>
              <DropdownMenuSeparator />
              <DropdownMenuGroup>
                <DropdownMenuItem
                  id="delete"
                  variant="destructive"
                  isDisabled={isDeleting}
                  onAction={() => onDelete(row.original)}
                >
                  <Trash2 aria-hidden="true" />
                  {localizedPage ? t(`${localizedPage}.delete`) : `Delete ${singularTitle}`}
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </DropdownMenu>
          </DropdownMenuTrigger>
        </div>
      ),
    }),
  ]), [config, isDeleting, isOfficersPage, isPeriodicitiesPage, isSourcesMinistriesPage, localizedPage, onDelete, onEdit, onStatusToggle, organizationRecords, singularTitle, statusUpdatingCode, t, usesOrganizationStatusOptions]);

  const table = useDataTable({
    columns,
    data: records,
    atoms: { pagination: paginationAtom },
    manualPagination: true,
    rowCount: totalCount,
    getRowId: (record: MasterRecord, index: number) => getRecordKey(record, index),
    enableMultiSort: false,
    enableRowSelection: false,
    autoResetPageIndex: false,
  });

  const typeFilterControl = isSourcesMinistriesPage ? (
    <Select
      className="w-full sm:w-40"
      aria-label={t("pages.sourcesMinistries.organizationTypeLabel")}
      selectedKey={typeFilter}
      onSelectionChange={(key) => onTypeChange(String(key ?? "ALL"))}
    >
      <SelectTrigger size="sm" className="w-full min-w-0 data-[size=sm]:h-8">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        <SelectItem id="ALL">{t("pages.sourcesMinistries.allTypes")}</SelectItem>
        {availableTypes.map((type) => (
          <SelectItem id={type} key={type}>
            {t(`pages.sourcesMinistries.types.${type}`, { defaultValue: formatCodeLabel(type) })}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  ) : undefined;

  const dataTable = (
    <DataTable
      table={table}
      ariaLabel={localizedPage ? t(`${localizedPage}.records`) : `${config.title} records`}
      searchPlaceholder={isSourcesMinistriesPage || isOfficersPage
        ? t(isOfficersPage ? "pages.sourcesMinistries.officerSearch" : "pages.sourcesMinistries.organizationSearch")
        : usesStatusTabs ? undefined : localizedPage ? t(`${localizedPage}.search`) : `Search ${lowerCaseTitle}`}
      searchValue={searchText}
      onSearchChange={onSearchChange}
      toolbarActions={usesStatusTabs ? typeFilterControl : (
        <div className="flex items-center gap-2">
          {availableTypes.length > 0 ? (
            <Select aria-label={isSourcesMinistriesPage ? t("pages.sourcesMinistries.organizationTypeLabel") : "Organization type"} selectedKey={typeFilter} onSelectionChange={(key) => onTypeChange(String(key ?? "ALL"))}>
              <SelectTrigger size="sm" className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem id="ALL">{isSourcesMinistriesPage ? t("pages.sourcesMinistries.allTypes") : "All types"}</SelectItem>
                {availableTypes.map((type) => <SelectItem id={type} key={type}>{isSourcesMinistriesPage ? t(`pages.sourcesMinistries.types.${type}`, { defaultValue: formatCodeLabel(type) }) : type}</SelectItem>)}
              </SelectContent>
            </Select>
          ) : null}
          <Select aria-label={usesOrganizationStatusOptions ? t("pages.sourcesMinistries.statusFilterLabel") : localizedPage ? t(`${localizedPage}.status`) : "Status"} selectedKey={statusFilter} onSelectionChange={(key) => onStatusChange(String(key ?? (usesOrganizationStatusOptions ? "ALL" : "ACTIVE")))}>
            <SelectTrigger size="sm" className="w-36"><SelectValue /></SelectTrigger>
            <SelectContent>
              {usesOrganizationStatusOptions ? (
                <SelectItem id="ALL">{t("pages.sourcesMinistries.allStatuses")}</SelectItem>
              ) : null}
              <SelectItem id="ACTIVE">{localizedPage ? t(`${localizedPage}.active`) : usesOrganizationStatusOptions ? t("pages.sourcesMinistries.active") : "Active"}</SelectItem>
              {!usesOrganizationStatusOptions ? (
                <SelectItem id="ALL">{localizedPage ? t(`${localizedPage}.allStatuses`) : "All statuses"}</SelectItem>
              ) : null}
              <SelectItem id="INACTIVE">{localizedPage ? t(`${localizedPage}.inactive`) : usesOrganizationStatusOptions ? t("pages.sourcesMinistries.inactive") : "Inactive"}</SelectItem>
            </SelectContent>
          </Select>
        </div>
      )}
      isLoading={isLoading}
      loadingMessage={isOfficersPage ? t("pages.sourcesMinistries.officerLoading") : isSourcesMinistriesPage ? t("pages.sourcesMinistries.organizationLoading") : localizedPage ? t(`${localizedPage}.loadingRecords`) : `Loading ${lowerCaseTitle}...`}
      error={error || undefined}
      emptyMessage={isOfficersPage ? t("pages.sourcesMinistries.officerEmpty") : isSourcesMinistriesPage ? t("pages.sourcesMinistries.organizationEmpty") : localizedPage ? t(`${localizedPage}.empty`) : `No ${lowerCaseTitle} records are available.`}
      noResultsMessage={isOfficersPage ? t("pages.sourcesMinistries.officerNoResults") : isSourcesMinistriesPage ? t("pages.sourcesMinistries.organizationNoResults") : localizedPage ? t(`${localizedPage}.noResults`) : `No ${lowerCaseTitle} records match the current filters.`}
      onRowClick={onRowClick}
      onRetry={onRetry}
      showPagination={usesStatusTabs ? totalCount > 0 : undefined}
      pageSizeOptions={[10, 25, 50, 100]}
      tableClassName={isSourcesMinistriesPage
        ? "min-w-[720px] table-fixed [&_th:first-child]:w-[44%] [&_th:nth-child(2)]:w-[22%] [&_th:nth-child(3)]:w-[22%] [&_th:last-child]:w-[12%] [&_tbody_td]:align-top [&_tbody_td:not(:first-child)]:whitespace-nowrap"
        : isOfficersPage
          ? "min-w-[820px] table-fixed [&_th:first-child]:w-[30%] [&_th:nth-child(2)]:w-[20%] [&_th:nth-child(3)]:w-[25%] [&_th:nth-child(4)]:w-[15%] [&_th:last-child]:w-[10%] [&_tbody_td]:align-top"
          : undefined}
      totalCount={totalCount}
    />
  );

  if (isSourcesMinistriesPage || isOfficersPage) {
    const statusTabItems: TabItem[] = MASTER_STATUS_TABS.map((status) => ({
      value: status,
      label: t(`pages.sourcesMinistries.${status === "ALL" ? "all" : status.toLowerCase()}`),
      icon: (
        <StatusDot
          variant={normalizeStatusVariant(status)}
          aria-hidden="true"
        />
      ),
      content: dataTable,
    }));

    return (
      <div className="flex min-w-0 flex-col gap-2">
        <CustomTabs
          items={statusTabItems}
          value={statusFilter}
          onValueChange={onStatusChange}
          defaultValue="ALL"
          variant="underline"
          ariaLabel={t(isOfficersPage
            ? "pages.sourcesMinistries.officerTabsLabel"
            : "pages.sourcesMinistries.tabsLabel")}
          compact
        />
      </div>
    );
  }

  if (usesStatusTabs) {
    return (
      <div className="flex min-w-0 flex-col gap-2">
        <SearchInput
          className="w-full max-w-md"
          value={searchText}
          onValueChange={onSearchChange}
          label={t(`${localizedPage}.searchLabel`)}
          placeholder={t(`${localizedPage}.search`)}
          clearLabel={t(`${localizedPage}.clearSearch`)}
        />
        <CustomTabs
        variant="underline"
        value={statusFilter}
        onValueChange={(key) => onStatusChange(String(key))}
        compact
        ariaLabel={t(`${localizedPage}.tabsLabel`)}
        contentClassName="mt-2"
        items={MASTER_STATUS_TABS.map((status) => (
              ({ value: status, label: t(`${localizedPage}.${status === "ALL" ? "all" : status.toLowerCase()}`), icon: (<StatusDot data-icon="inline-start" variant={normalizeStatusVariant(status)} aria-hidden="true" />), content: (<>{statusFilter === status ? dataTable : null}</>) })
            ))}
      />
      </div>
    );
  }

  return dataTable;
}

function FormPanel({
  config,
  editingRecord,
  formValues,
  isSaving,
  organizationRecords,
  onCancel,
  onChange,
  onSubmit,
}: {
  config: MasterPageConfig;
  editingRecord: MasterRecord | null;
  formValues: MasterRecord;
  isSaving: boolean;
  organizationRecords: MasterRecord[];
  onCancel: () => void;
  onChange: (key: string, value: string | number | boolean) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
}) {
  const { t } = useTranslation("common");
  const detailFields = config.fields.filter((field) => field.type !== "checkbox");
  const booleanFields = config.fields.filter((field) => field.type === "checkbox");
  return (
    <Sheet isOpen showCloseButton={false} onOpenChange={(open) => { if (!open) { onCancel(); } }} className="w-full sm:max-w-xl">
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <div className="flex shrink-0 items-start justify-between gap-3 border-b p-4 [&_h3]:text-base [&_h3]:font-semibold [&_span]:text-xs [&_span]:text-muted-foreground">
          <div>
            <div className="text-xs font-medium text-muted-foreground">{editingRecord ? "Edit" : "Create"}</div>
            <SheetTitle>{config.title}</SheetTitle>
          </div>
          <Button size="icon-sm" variant="ghost" type="button" onClick={onCancel} aria-label="Close">
            <X size={15} />
          </Button>
        </div>
        <form className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4" onSubmit={onSubmit}>
          <div className="flex min-w-0 flex-col gap-5">
            <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground">
              <span>Governance note</span>
              <p>{config.ownershipNote}</p>
            </div>

            <section className="flex min-w-0 flex-col gap-3">
              <div className="flex items-start justify-between gap-2 [&_h3]:text-sm [&_h3]:font-semibold [&_p]:text-xs [&_p]:text-muted-foreground">
                <span>01</span>
                <div><strong>Record details</strong><small>Provide the governed code, labels, and metadata</small></div>
              </div>
              <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
                {detailFields.map((field) => (
                  <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-foreground [&>small]:font-normal [&>small]:text-muted-foreground" key={field.key}>
                    <span>{field.label}{field.required ? " *" : ""}</span>
                    {renderField(field, formValues[field.key], onChange, organizationRecords, t("pages.sourcesMinistries.searchCode"))}
                  </label>
                ))}
              </div>
            </section>

            {booleanFields.length > 0 && (
              <section className="flex min-w-0 flex-col gap-3">
                <div className="flex items-start justify-between gap-2 [&_h3]:text-sm [&_h3]:font-semibold [&_p]:text-xs [&_p]:text-muted-foreground">
                  <span>02</span>
                  <div><strong>Status &amp; behavior</strong><small>Control availability and special record behavior</small></div>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {booleanFields.map((field) => (
                    <label className="flex items-center gap-3 text-sm" key={field.key}>
                      {renderField(field, formValues[field.key], onChange, organizationRecords, t("pages.sourcesMinistries.searchCode"))}
                      <span className="flex min-w-0 flex-1 flex-col gap-1 [&>small]:text-xs [&>small]:font-normal [&>small]:text-muted-foreground">
                        <strong>{field.label}</strong>
                        <small>{getBooleanFieldDescription(field)}</small>
                      </span>
                      <span className="hidden" aria-hidden="true"><span className="hidden" /></span>
                    </label>
                  ))}
                </div>
              </section>
            )}
          </div>
          <div className="mt-auto flex shrink-0 flex-wrap items-center justify-end gap-2 border-t pt-4">
            <Button variant="outline" type="button" onClick={onCancel}>Cancel</Button>
            <Button isDisabled={isSaving} type="submit">{isSaving ? "Saving..." : editingRecord ? "Save changes" : `Create ${getSingularTitle(config.title)}`}</Button>
          </div>
        </form>
      </div>
    </Sheet>
  );
}

function getBooleanFieldDescription(field: FieldConfig): string {
  if (field.key === "is_active") return "Make this record available across governed workflows.";
  if (field.key === "is_default") return "Use this as the default option when no preference is selected.";
  return `Enable ${field.label.toLowerCase()} behavior for this record.`;
}

function getSingularTitle(title: string): string {
  const singularTitles: Record<string, string> = {
    Locales: "locale",
    Periodicities: "periodicity",
    "Unit of Measurement (UOM)": "UOM",
    "Data Provider": "data provider",
    Officers: "officer",
  };
  return singularTitles[title] ?? "record";
}
function renderField(
  field: FieldConfig,
  value: unknown,
  onChange: (key: string, value: string | number | boolean) => void,
  organizationRecords: MasterRecord[],
  providerSearchLabel: string,
) {
  if (field.type === "checkbox") {
    return (
      <Checkbox isSelected={Boolean(value)}
        onChange={(isSelected) => onChange(field.key, isSelected)} aria-label={field.label} />
    );
  }
  if (field.type === "select") {
    return (
      <NativeSelect value={String(value ?? "")} onChange={(event) => onChange(field.key, event.target.value)}>
        <NativeSelectOption value="">Select</NativeSelectOption>
        {(field.options ?? []).map((option) => <NativeSelectOption value={option} key={option}>{option}</NativeSelectOption>)}
      </NativeSelect>
    );
  }
  if (field.relation === "organization") {
    return (
      <>
        <Input
          list={`org-options-${field.key}`}
          value={String(value ?? "")}
          onChange={(event) => onChange(field.key, event.target.value)}
          placeholder={providerSearchLabel}
        />
        <datalist id={`org-options-${field.key}`}>
          {organizationRecords.map((record) => (
            <NativeSelectOption
              key={String(record.organization_code)}
              value={String(record.organization_code)}
              label={getOrganizationTitle(record)}
            />
          ))}
        </datalist>
      </>
    );
  }
  if (field.type === "textarea") {
    return <Textarea value={String(value ?? "")} onChange={(event) => onChange(field.key, event.target.value)} />;
  }
  return (
    <Input
      value={String(value ?? "")}
      type={field.type === "number" ? "number" : "text"}
      onChange={(event) => onChange(field.key, field.type === "number" ? Number(event.target.value) : event.target.value)}
    />
  );
}

function MetricCard({ label, sublabel, value }: { label: string; sublabel: string; value: number | string }) {
  return (
    <Card className="flex min-w-0 flex-col gap-1"><CardContent className="flex min-w-0 flex-col gap-3">
      <div className="font-heading text-2xl font-semibold tabular-nums text-foreground">{value}</div>
      <div className="text-sm font-medium text-foreground">{label}</div>
      <div className="text-xs text-muted-foreground">{sublabel}</div>
    </CardContent></Card>
  );
}

function RecordDetailAccordion({
  config,
  organizationRecords,
  record,
}: {
  config: MasterPageConfig;
  organizationRecords: MasterRecord[];
  record: MasterRecord;
}) {
  const entries = Object.entries(record).filter(([, value]) => value !== null && value !== undefined && value !== "");
  const configuredKeys = config.fields.map((field) => field.key);
  const orderedEntries = [
    ...configuredKeys
      .filter((key) => record[key] !== null && record[key] !== undefined && record[key] !== "")
      .map((key) => [key, record[key]] as [string, unknown]),
    ...entries.filter(([key]) => !configuredKeys.includes(key)),
  ];
  const title = String(resolveValue(record, ["name", "display_name", "organization_name", "periodicity_code", "locale_code", "organization_code", "officer_code"]) ?? "Record");
  const primaryCode = String(resolveValue(record, config.codeKeys) ?? "");

  return (
    <div className="flex flex-col gap-4 bg-muted/30 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:text-sm [&_h3]:font-semibold [&_p]:text-xs [&_p]:text-muted-foreground">
        <div className="text-sm font-semibold">
          <span>{config.title}</span>
          <strong>{title}</strong>
        </div>
        <div className="text-xs text-muted-foreground">
          {primaryCode && <code>{primaryCode}</code>}
          {renderStatus(record)}
        </div>
      </div>
      <div className="text-sm text-muted-foreground">{config.ownershipNote}</div>
      <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
        {orderedEntries.slice(0, 18).map(([key, value]) => (
          <div className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-foreground [&>small]:font-normal [&>small]:text-muted-foreground" key={key}>
            <span>{formatLabel(key)}</span>
            <strong>{formatDetailValue(key, value, organizationRecords)}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function RecordDetailPanel({
  config,
  organizationRecords,
  record,
}: {
  config: MasterPageConfig;
  organizationRecords: MasterRecord[];
  record: MasterRecord | null;
}) {
  if (!record) {
    return (
      <Card className="min-w-0"><CardContent className="flex min-w-0 flex-col gap-3">
        <Empty><EmptyHeader><EmptyTitle>Select a record to inspect its backend fields.</EmptyTitle></EmptyHeader></Empty>
      </CardContent></Card>
    );
  }
  const entries = Object.entries(record).filter(([, value]) => value !== null && value !== undefined && value !== "");
  return (
    <Card className="min-w-0"><CardContent className="flex min-w-0 flex-col gap-3">
      <div className="flex flex-wrap items-start justify-between gap-3 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:text-sm [&_h3]:font-semibold [&_p]:text-xs [&_p]:text-muted-foreground">
        <div>
          <span>{config.title}</span>
          <h3>{String(resolveValue(record, ["name", "display_name", "organization_name", "periodicity_code", "locale_code", "organization_code", "officer_code"]) ?? "Record")}</h3>
        </div>
        {renderStatus(record)}
      </div>
      <p className="text-xs text-muted-foreground">{config.ownershipNote}</p>
      <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
        {entries.slice(0, 18).map(([key, value]) => (
          <div className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-foreground [&>small]:font-normal [&>small]:text-muted-foreground" key={key}>
            <span>{formatLabel(key)}</span>
            <strong>{formatDetailValue(key, value, organizationRecords)}</strong>
          </div>
        ))}
      </div>
    </CardContent></Card>
  );
}

function defaultFormValues(config: MasterPageConfig): MasterRecord {
  const values: MasterRecord = {};
  config.fields.forEach((field) => {
    values[field.key] = field.type === "checkbox" ? field.key === "is_active" : "";
    if (field.type === "number") values[field.key] = 0;
  });
  return values;
}

function applyFormValueChange(config: MasterPageConfig, current: MasterRecord, key: string, value: string | number | boolean): MasterRecord {
  const next = { ...current, [key]: value };
  const primaryCodeKey = config.codeKeys[0];
  if (
    primaryCodeKey &&
    ["name", "display_name"].includes(key) &&
    !String(current[primaryCodeKey] ?? "").trim()
  ) {
    next[primaryCodeKey] = generateRecordCode(config, next);
  }
  return next;
}

function normalizePayload(config: MasterPageConfig, formValues: MasterRecord): MasterRecord {
  const payload: MasterRecord = {};
  config.fields.forEach((field) => {
    const rawValue = formValues[field.key];
    if (field.type === "checkbox") {
      payload[field.key] = Boolean(rawValue);
      return;
    }
    if (field.type === "number") {
      payload[field.key] = rawValue === "" || rawValue === null || rawValue === undefined ? undefined : Number(rawValue);
      return;
    }
    const value = String(rawValue ?? "").trim();
    if (!value) return;
    if (field.codeFormat === "upper") {
      payload[field.key] = value.toUpperCase().replace(/\s+/g, "_");
      return;
    }
    payload[field.key] = value;
  });
  config.codeKeys.forEach((key) => {
    if (!payload[key]) {
      payload[key] = generateRecordCode(config, payload);
    }
  });
  return payload;
}

function validatePayload(config: MasterPageConfig, payload: MasterRecord): void {
  for (const field of config.fields) {
    if (field.required && !payload[field.key]) {
      throw new Error(`${field.label} is required.`);
    }
    if (field.codeFormat === "locale" && payload[field.key] && !/^[a-z]{2}-[A-Z]{2}$/.test(String(payload[field.key]))) {
      throw new Error(`${field.label} must use locale format like en-IN or hi-IN.`);
    }
  }
}

function renderColumn(record: MasterRecord, column: ColumnConfig, organizationRecords: MasterRecord[]) {
  if (column.kind === "status") return renderStatus(record);
  const value = resolveValue(record, column.keys);
  if (column.kind === "organization") return renderCompactCell(getOrganizationName(String(value ?? ""), organizationRecords));
  if (column.kind === "organizationName") return renderCompactCell(getOrganizationDisplayName(String(value ?? ""), organizationRecords));
  if (column.kind === "localeRegion") return renderCompactCell(getLocaleRegion(String(value ?? "")));
  if (column.kind === "localeDirection") return renderCompactCell(getLocaleDirection(String(value ?? "")));
  if (column.kind === "code") return renderCompactCell(formatValue(value), "font-mono text-xs");
  return renderCompactCell(formatValue(value));
}

function getLocaleParts(localeCode: string): { languageCode: string; regionCode: string } {
  const [languageCode = "", regionCode = ""] = localeCode.split(/[-_]/);
  return { languageCode: languageCode.toLowerCase(), regionCode: regionCode.toUpperCase() };
}

function getLocaleRegion(localeCode: string): string {
  const { regionCode } = getLocaleParts(localeCode);
  const names: Record<string, string> = { IN: "India" };
  return (names[regionCode] ?? regionCode) || "-";
}

function getLocaleDirection(localeCode: string): string {
  const { languageCode } = getLocaleParts(localeCode);
  return ["ar", "fa", "he", "ur"].includes(languageCode) ? "RTL" : "LTR";
}
function renderCompactCell(value: string, className = "text-sm") {
  return (
    <span className={className} title={value}>
      {value}
    </span>
  );
}

function renderStatus(record: MasterRecord) {
  const active = isRecordActive(record);
  return <StatusBadge variant={normalizeStatusVariant(`${active ? "active" : "inactive"}`)}>{active ? "Active" : "Inactive"}</StatusBadge>;
}

function resolveValue(record: MasterRecord, keys: string[]) {
  for (const key of keys) {
    if (record[key] !== undefined && record[key] !== null && record[key] !== "") return record[key];
  }
  return undefined;
}

function isRecordActive(record: MasterRecord): boolean {
  if (typeof record.is_active === "boolean") return record.is_active;
  const status = String(record.status ?? "ACTIVE").toUpperCase();
  return !["INACTIVE", "DELETED", "DISABLED", "ARCHIVED"].includes(status);
}

function masterListParams(
  config: MasterPageConfig,
  options: {
    search: string;
    statusFilter: string;
    typeFilter: string;
    organizationFilter: string;
    limit: number;
    offset: number;
  },
): Record<string, string | number | boolean | undefined> {
  const params: Record<string, string | number | boolean | undefined> = {
    limit: options.limit,
    offset: options.offset,
    search: options.search.trim() || undefined,
    status_filter: options.statusFilter,
  };
  if (config.endpoint === "/masters/organizations" && options.typeFilter !== "ALL") {
    params.organization_type = options.typeFilter;
  }
  if (config.endpoint === "/masters/officers" && options.organizationFilter !== "ALL") {
    params.organization_code = options.organizationFilter;
  }
  return params;
}

function getRecordKey(record: MasterRecord, index: number): string {
  if (record.officer_code) {
    return `${String(record.organization_code ?? "organization")}-${String(record.officer_code)}-${index}`;
  }
  const value = resolveValue(record, ["locale_code", "periodicity_code", "uom_code", "organization_code", "officer_code", "code"]);
  return `${String(value ?? "record")}-${index}`;
}

function formatLabel(key: string): string {
  return key.replace(/_/g, " ").replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatValue(value: unknown): string {
  if (value === undefined || value === null || value === "") return "-";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

function formatDetailValue(key: string, value: unknown, organizationRecords: MasterRecord[]): string {
  if (key === "organization_code" || key === "parent_organization_code") {
    return getOrganizationName(String(value ?? ""), organizationRecords);
  }
  return formatValue(value);
}

function getOrganizationName(code: string, organizationRecords: MasterRecord[]): string {
  if (!code) return "-";
  const record = organizationRecords.find((item) => String(item.organization_code) === code);
  return record ? getOrganizationTitle(record) : code;
}

function getOrganizationDisplayName(code: string, organizationRecords: MasterRecord[]): string {
  if (!code) return "-";
  const record = organizationRecords.find((item) => String(item.organization_code) === code);
  return record ? String(record.name ?? code) : code;
}

function getOrganizationTitle(record: MasterRecord): string {
  return `${String(record.name ?? record.organization_code)} (${String(record.organization_code)})`;
}

function generateRecordCode(config: MasterPageConfig, payload: MasterRecord): string {
  if (config.title === "Locales") return "en-IN";
  const source =
    String(payload.display_name ?? payload.name ?? payload.organization_code ?? payload.periodicity_code ?? config.title)
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]+/g, "_")
      .replace(/^_+|_+$/g, "");
  const prefix =
    config.title === "Officers"
      ? "OFF"
      : config.title === "Periodicities"
        ? "PER"
        : config.title.includes("UOM")
          ? "UOM"
        : config.endpoint === "/masters/organizations"
          ? "SRC"
          : "ORG";
  return `${prefix}_${source || Date.now()}`;
}
