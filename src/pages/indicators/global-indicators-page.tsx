import { useTranslation } from "react-i18next";
import { CardContent, Card } from "@/components/ui/card";
import { StatusBadge } from "@/components/common/status-badge";
import { normalizeStatusVariant } from "@/components/common/status-variants";
import { DataTableReport } from "@/components/data-table/data-table-report";
import { Sheet, SheetTitle } from "@/components/ui/sheet";

import { BooleanField } from "@/components/common/boolean-field";
import { PageSection, PageHeader } from "@/components/common/page-layout";

import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";

import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Edit3, Plus, RefreshCw, Search, X } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  createGlobalIndicator,
  listGlobalIndicators,
  updateGlobalIndicator,
  type GlobalIndicatorListItem,
  type GlobalIndicatorPayload,
} from "../../api/indicators.api";
import { listFrameworkEditions, type FrameworkEdition } from "../../api/framework.api";
import {
  getSelectedUnitCode,
  listAvailableUnits,
  LOCALE_CHANGED_EVENT,
  selectedUnitGlobalMappingEnabled,
  UNIT_CHANGED_EVENT,
} from "../../api/session.api";

const emptyForm = {
  global_indicator_code: "",
  indicator_number: "",
  name: "",
  description: "",
  methodology_note: "",
  custodian_agency_code: "",
  tier_code: "",
  status: "ACTIVE",
  is_active: true,
};

function textValue(value: unknown) {
  return value === undefined || value === null || value === "" ? "-" : String(value);
}

function normalize(value: unknown) {
  return textValue(value).toLowerCase();
}

export function GlobalIndicatorsPage() {
  const { t } = useTranslation("common");
  const [records, setRecords] = useState<GlobalIndicatorListItem[]>([]);
  const [activeFramework, setActiveFramework] = useState<FrameworkEdition | null>(null);
  const [selectedRecord, setSelectedRecord] = useState<GlobalIndicatorListItem | null>(null);
  const [editingRecord, setEditingRecord] = useState<GlobalIndicatorListItem | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ACTIVE");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [globalMappingEnabled, setGlobalMappingEnabled] = useState(() => getSelectedUnitCode() === "SDG");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

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
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 3200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const filteredRecords = useMemo(() => {
    const q = query.trim().toLowerCase();
    return records.filter((record) => {
      const status = record.is_active === false ? "INACTIVE" : record.status || "ACTIVE";
      const matchesStatus = statusFilter === "ALL" || status === statusFilter;
      const matchesQuery =
        !q ||
        [
          record.global_indicator_code,
          record.indicator_number,
          record.name,
          record.description,
          record.custodian_agency_code,
          record.tier_code,
          record.status,
        ]
          .map(normalize)
          .join(" ")
          .includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [query, records, statusFilter]);

  async function loadPage() {
    setIsLoading(true);
    setError("");
    try {
      const units = await listAvailableUnits().catch(() => []);
      const nextEnabled = selectedUnitGlobalMappingEnabled(units);
      setGlobalMappingEnabled(nextEnabled);
      if (!nextEnabled) {
        setRecords([]);
        setActiveFramework(null);
        setSelectedRecord(null);
        setIsDrawerOpen(false);
        setEditingRecord(null);
        return;
      }
      const [globalResponse, frameworkResponse] = await Promise.all([
        listGlobalIndicators(),
        listFrameworkEditions(true),
      ]);
      setRecords(globalResponse.data);
      setActiveFramework(
        frameworkResponse.data.find((edition) => edition.is_active && edition.status !== "INACTIVE") ??
          frameworkResponse.data.find((edition) => edition.is_active) ??
          frameworkResponse.data[0] ??
          null,
      );
      setSelectedRecord(globalResponse.data[0] ?? null);
    } catch {
      setRecords([]);
      setSelectedRecord(null);
      setError("Global indicators could not be loaded. Please refresh or try again later.");
    } finally {
      setIsLoading(false);
    }
  }

  function openCreate() {
    setEditingRecord(null);
    setForm(emptyForm);
    setIsDrawerOpen(true);
  }

  function openEdit(record: GlobalIndicatorListItem) {
    setEditingRecord(record);
    setIsDrawerOpen(true);
    setForm({
      global_indicator_code: record.global_indicator_code ?? "",
      indicator_number: record.indicator_number ?? "",
      name: record.name ?? "",
      description: record.description ?? "",
      methodology_note: record.methodology_note ?? "",
      custodian_agency_code: record.custodian_agency_code ?? "",
      tier_code: record.tier_code ?? "",
      status: record.status ?? "ACTIVE",
      is_active: record.is_active !== false,
    });
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!activeFramework?.framework_code || !activeFramework.edition_code) {
      setError("Global indicator save requires an active framework edition for the selected unit.");
      return;
    }
    if (!form.name.trim()) {
      setError("Global indicator name is required.");
      return;
    }
    setIsSaving(true);
    setError("");
    try {
      const payload: GlobalIndicatorPayload = {
        framework_code: activeFramework.framework_code,
        edition_code: activeFramework.edition_code,
        global_indicator_code: form.global_indicator_code.trim() || undefined,
        indicator_number: form.indicator_number.trim() || undefined,
        name: form.name.trim(),
        description: form.description.trim() || undefined,
        methodology_note: form.methodology_note.trim() || undefined,
        custodian_agency_code: form.custodian_agency_code.trim() || undefined,
        tier_code: form.tier_code.trim() || undefined,
        status: form.status,
        is_active: form.is_active,
      };
      if (editingRecord?.global_indicator_code) {
        await updateGlobalIndicator(editingRecord.global_indicator_code, payload);
      } else {
        await createGlobalIndicator(payload);
      }
      setNotice("Global indicator saved.");
      setEditingRecord(null);
      setIsDrawerOpen(false);
      await loadPage();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Global indicator could not be saved.");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <PageSection className="flex min-w-0 flex-col gap-4">
      <PageHeader>
        <div>
          <h2>Global Indicators</h2>
          <p>Manage global indicator references mapped to national indicators for the selected pillar.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" type="button" onClick={() => void loadPage()}>
            <RefreshCw size={13} />
            Refresh
          </Button>
          {globalMappingEnabled ? (
            <Button type="button" onClick={openCreate}>
              <Plus size={14} />
              New
            </Button>
          ) : null}
        </div>
      </PageHeader>

      {notice && <div className="flex items-center justify-between gap-3 rounded-md bg-muted p-3 text-sm">{notice}</div>}
      {error && <div className="rounded-md bg-muted p-3 text-sm text-destructive">{error}</div>}

      {!isLoading && !globalMappingEnabled ? (
        <Card className="min-w-0 empty-state-card">
          <h3>Global indicator mapping is not enabled for {getSelectedUnitCode()}.</h3>
          <p>This page is available only for pillars configured by the backend. SDG is enabled by default.</p>
        </Card>
      ) : (
      <>

      <section className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="flex min-w-0 flex-col gap-1"><CardContent className="flex min-w-0 flex-col gap-3">
          <div className="font-heading text-2xl font-semibold tabular-nums text-foreground">{records.length}</div>
          <div className="text-sm font-medium text-foreground">Global indicators</div>
          <div className="text-xs text-muted-foreground">{getSelectedUnitCode()}</div>
        </CardContent></Card>
        <Card className="flex min-w-0 flex-col gap-1"><CardContent className="flex min-w-0 flex-col gap-3">
          <div className="font-heading text-2xl font-semibold tabular-nums text-foreground">{records.filter((record) => record.is_active !== false).length}</div>
          <div className="text-sm font-medium text-foreground">Active</div>
          <div className="text-xs text-muted-foreground">available</div>
        </CardContent></Card>
        <Card className="flex min-w-0 flex-col gap-1"><CardContent className="flex min-w-0 flex-col gap-3">
          <div className="font-heading text-2xl font-semibold tabular-nums text-foreground">{records.reduce((total, record) => total + Number(record.mapped_national_count ?? 0), 0)}</div>
          <div className="text-sm font-medium text-foreground">National mappings</div>
          <div className="text-xs text-muted-foreground">active links</div>
        </CardContent></Card>
        <Card className="flex min-w-0 flex-col gap-1"><CardContent className="flex min-w-0 flex-col gap-3">
          <div className="font-heading text-2xl font-semibold tabular-nums text-foreground">{activeFramework?.edition_code ?? "-"}</div>
          <div className="text-sm font-medium text-foreground">Framework</div>
          <div className="text-xs text-muted-foreground">{activeFramework?.framework_code ?? "not selected"}</div>
        </CardContent></Card>
      </section>

      <section className="flex min-w-0 flex-wrap items-center gap-3">
        <label className="flex min-w-0 items-center gap-2 [&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-muted-foreground">
          <Search size={14} />
          <Input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search global indicator code, number, name, custodian, tier" />
        </label>
        <NativeSelect value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <NativeSelectOption value="ACTIVE">Active</NativeSelectOption>
          <NativeSelectOption value="INACTIVE">Inactive</NativeSelectOption>
          <NativeSelectOption value="ALL">All statuses</NativeSelectOption>
        </NativeSelect>
      </section>

      <div className="grid min-w-0 grid-cols-1 items-start gap-4 xl:grid-cols-2">
        <div className="min-w-0">
          <div className="min-w-0 overflow-x-auto">
                  <DataTableReport ariaLabel={t("reportTable.label")} isLoading={isLoading} headers={["Global Indicator",
                    "Name",
                    "Custodian",
                    "Tier",
                    "National Mappings",
                    "Status",
                    "Action"]} rows={filteredRecords.map((record) => (
                      ({
                        id: record.global_indicator_code, cells: [<div key="cell-0" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground "><span className="font-mono text-xs">{textValue(record.indicator_number)}</span>
                          <span className="text-xs text-muted-foreground">{record.global_indicator_code}</span></div>,
                        <div key="cell-1" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground "><span className="text-sm" title={record.name}>{textValue(record.name)}</span></div>,
                        <div key="cell-2" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground ">{textValue(record.custodian_agency_code)}</div>,
                        <div key="cell-3" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground ">{textValue(record.tier_code)}</div>,
                        <div key="cell-4" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground ">{Number(record.mapped_national_count ?? 0)}</div>,
                        <div key="cell-5" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground "><StatusBadge variant={normalizeStatusVariant(record.is_active === false ? "inactive" : "active")}>{record.is_active === false ? "Inactive" : textValue(record.status)}</StatusBadge></div>,
                        <div key="cell-6" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground "><Button variant="outline" type="button" onClick={(event) => { event.stopPropagation(); openEdit(record); }}>
                          <Edit3 size={12} />
                          Edit
                        </Button></div>], className: selectedRecord?.global_indicator_code === record.global_indicator_code ? "bg-accent cursor-pointer" : "cursor-pointer", onClick: () => setSelectedRecord(record)
                      })
                    ))} />
          </div>
        </div>

        <Card className="detail-panel min-w-0">
          <div className="flex flex-wrap items-start justify-between gap-3 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:text-sm [&_h3]:font-semibold [&_p]:text-xs [&_p]:text-muted-foreground">
            <div>
              <span>Global Indicator</span>
              <h3>{textValue(selectedRecord?.indicator_number ?? selectedRecord?.global_indicator_code)}</h3>
            </div>
          </div>
          <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
            <DetailField label="Name" value={selectedRecord?.name} />
            <DetailField label="Code" value={selectedRecord?.global_indicator_code} />
            <DetailField label="Description" value={selectedRecord?.description} />
            <DetailField label="Custodian" value={selectedRecord?.custodian_agency_code} />
            <DetailField label="Tier" value={selectedRecord?.tier_code} />
            <DetailField label="National mappings" value={selectedRecord?.mapped_national_count} />
          </div>
        </Card>
      </div>

      {isDrawerOpen && (
        <Sheet isOpen showCloseButton={false} onOpenChange={(open) => { if (!open) { setEditingRecord(null); setForm(emptyForm); setIsDrawerOpen(false); } }} className="w-full sm:max-w-xl">
          <div className="flex min-h-0 flex-1 flex-col gap-3">
            <div className="flex shrink-0 items-start justify-between gap-3 border-b p-4 [&_h3]:text-base [&_h3]:font-semibold [&_span]:text-xs [&_span]:text-muted-foreground">
              <div>
                <span>{editingRecord ? "Edit" : "Create"}</span>
                <SheetTitle>Global Indicator</SheetTitle>
              </div>
              <Button size="icon-sm" variant="ghost" type="button" onClick={() => { setEditingRecord(null); setForm(emptyForm); setIsDrawerOpen(false); }}>
                <X size={16} />
              </Button>
            </div>
            <form className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4" onSubmit={handleSubmit}>
              <div className="rounded-md bg-muted p-3 text-sm text-muted-foreground"><strong>Global reference</strong><span>Create a reusable global indicator reference for national indicator mappings.</span></div>
              <section className="flex min-w-0 flex-col gap-3">
                <div className="flex items-start justify-between gap-2 [&_h3]:text-sm [&_h3]:font-semibold [&_p]:text-xs [&_p]:text-muted-foreground"><span>01</span><div><strong>Reference details</strong><small>Core code, number, name, and description</small></div></div>
                <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium"><span>Global indicator code</span><Input value={form.global_indicator_code} onChange={(event) => setForm((current) => ({ ...current, global_indicator_code: event.target.value }))} /></label>
                  <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium"><span>Indicator number</span><Input value={form.indicator_number} onChange={(event) => setForm((current) => ({ ...current, indicator_number: event.target.value }))} /></label>
                  <label className="sm:col-span-2"><span>Name *</span><Input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} required /></label>
                  <label className="sm:col-span-2"><span>Description</span><Textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} /></label>
                </div>
              </section>
              <section className="flex min-w-0 flex-col gap-3">
                <div className="flex items-start justify-between gap-2 [&_h3]:text-sm [&_h3]:font-semibold [&_p]:text-xs [&_p]:text-muted-foreground"><span>02</span><div><strong>Ownership &amp; classification</strong><small>Custodian, tier, and lifecycle status</small></div></div>
                <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium"><span>Custodian agency</span><Input value={form.custodian_agency_code} onChange={(event) => setForm((current) => ({ ...current, custodian_agency_code: event.target.value }))} /></label>
                  <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium"><span>Tier</span><Input value={form.tier_code} onChange={(event) => setForm((current) => ({ ...current, tier_code: event.target.value }))} /></label>
                  <label className="flex min-w-0 flex-col gap-1.5 text-sm font-medium"><span>Status</span><NativeSelect value={form.status} onChange={(event) => setForm((current) => ({ ...current, status: event.target.value }))}><NativeSelectOption value="DRAFT">Draft</NativeSelectOption><NativeSelectOption value="ACTIVE">Active</NativeSelectOption><NativeSelectOption value="RETIRED">Retired</NativeSelectOption></NativeSelect></label>
                  <BooleanField isSelected={form.is_active} onChange={(isSelected) => setForm((current) => ({ ...current, is_active: isSelected }))}>

                    <span className="flex min-w-0 flex-1 flex-col gap-1 [&>small]:text-xs [&>small]:font-normal [&>small]:text-muted-foreground"><strong>Active reference</strong><small>Allow this indicator to be mapped.</small></span>
                    <span className="hidden" aria-hidden="true"><span className="hidden" /></span>
                  </BooleanField>
                </div>
              </section>
              <div className="mt-auto flex shrink-0 flex-wrap items-center justify-end gap-2 border-t pt-4">
                <Button variant="outline" type="button" onClick={() => { setEditingRecord(null); setForm(emptyForm); setIsDrawerOpen(false); }}>Cancel</Button>
                <Button type="submit" disabled={isSaving}>{isSaving ? "Saving..." : editingRecord ? "Save changes" : "Create indicator"}</Button>
              </div>
            </form>
          </div>
        </Sheet>
      )}
      </>
      )}
    </PageSection>
  );
}

function DetailField({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-foreground [&>small]:font-normal [&>small]:text-muted-foreground">
      <span>{label}</span>
      <strong>{textValue(value)}</strong>
    </div>
  );
}
