import { StatusBadge } from "@/components/common/status-badge";
import { normalizeStatusVariant } from "@/components/common/status-variants";
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { BooleanField } from "@/components/common/boolean-field";
import { PageSection, PageHeader } from "@/components/common/page-layout";

import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";

import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  createDataTableColumnHelper,
  DataTable,
  type DataTableFilterFn,
  useDataTable,
} from "@/components/data-table";
import {
  DropdownMenu,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip";
import { Check, ChevronRight, Ellipsis, ListOrdered, Pencil, Plus, Power, PowerOff, RefreshCw, X } from "lucide-react";
import type { FormEvent } from "react";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import {
  createAuthReviewLevel,
  createAuthReviewWorkflow,
  listAuthReviewWorkflows,
  listAuthUnits,
  updateAuthReviewLevel,
  updateAuthReviewWorkflow,
  type AuthReviewWorkflowLevel,
  type AuthReviewWorkflow,
  type AuthUnit,
} from "../../api/auth-admin.api";
import { LOCALE_CHANGED_EVENT } from "../../api/session.api";

type ReviewDrawerState =
  | { mode: "workflow-create" }
  | { mode: "workflow-edit"; workflow: AuthReviewWorkflow }
  | { mode: "level-create"; workflow: AuthReviewWorkflow }
  | { mode: "level-edit"; workflow: AuthReviewWorkflow; level: AuthReviewWorkflowLevel }
  | null;

const reviewWorkflowColumnHelper = createDataTableColumnHelper<AuthReviewWorkflow>();

const reviewWorkflowGlobalFilter: DataTableFilterFn<AuthReviewWorkflow> = (row, _columnId, filterValue) => {
  const workflow = row.original;
  const levelValues = (workflow.levels ?? []).flatMap((level) => [level.level_code, level.level_name, level.level_number]);
  return matchesSearch(
    String(filterValue ?? ""),
    workflow.workflow_name,
    workflow.workflow_code,
    workflow.unit_code,
    workflow.is_active === false ? "Inactive" : "Active",
    ...levelValues,
  );
};

export function ReviewWorkflowPage() {
  const [units, setUnits] = useState<AuthUnit[]>([]);
  const [workflows, setWorkflows] = useState<AuthReviewWorkflow[]>([]);
  const [unitFilter, setUnitFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState("ACTIVE");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [drawer, setDrawer] = useState<ReviewDrawerState>(null);
  const [managedWorkflowCode, setManagedWorkflowCode] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const filteredWorkflows = useMemo(() => workflows.filter((workflow) => {
    const unitMatches = unitFilter === "ALL" || workflow.unit_code === unitFilter;
    const statusMatches = statusFilter === "ALL" || (workflow.is_active !== false) === (statusFilter === "ACTIVE");
    return unitMatches && statusMatches;
  }), [statusFilter, unitFilter, workflows]);
  const managedWorkflow = workflows.find((workflow) => workflow.workflow_code === managedWorkflowCode) ?? null;

  const loadReviewContext = useCallback(async (): Promise<void> => {
    setIsLoading(true);
    setLoadError("");
    try {
      const [unitList, workflowList] = await Promise.all([
        listAuthUnits(true),
        listAuthReviewWorkflows(true),
      ]);
      setUnits(unitList);
      setWorkflows(workflowList);
      setNotice("Review workflow context refreshed.");
    } catch (nextLoadError) {
      setLoadError(nextLoadError instanceof Error ? nextLoadError.message : "Review workflow context could not be loaded.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadReviewContext(), 0);
    return () => window.clearTimeout(timer);
  }, [loadReviewContext]);

  useEffect(() => {
    const handleLocaleChange = () => void loadReviewContext();
    window.addEventListener(LOCALE_CHANGED_EVENT, handleLocaleChange);
    return () => window.removeEventListener(LOCALE_CHANGED_EVENT, handleLocaleChange);
  }, [loadReviewContext]);

  useEffect(() => {
    if (!notice) return;
    const timer = window.setTimeout(() => setNotice(""), 4200);
    return () => window.clearTimeout(timer);
  }, [notice]);

  const handleToggleWorkflow = useCallback(async (workflow: AuthReviewWorkflow): Promise<void> => {
    setIsSaving(true);
    setError("");
    try {
      const nextIsActive = workflow.is_active === false;
      await updateAuthReviewWorkflow(workflow.workflow_code, {
        unit_code: workflow.unit_code ?? "",
        workflow_code: workflow.workflow_code,
        workflow_name: workflow.workflow_name ?? workflow.workflow_code,
        is_active: nextIsActive,
      });
      await loadReviewContext();
      setNotice(`${workflow.workflow_code} ${nextIsActive ? "activated" : "deactivated"}.`);
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : "Workflow status could not be updated.");
    } finally {
      setIsSaving(false);
    }
  }, [loadReviewContext]);

  const handleToggleLevel = useCallback(async (
    workflow: AuthReviewWorkflow,
    level: AuthReviewWorkflowLevel,
  ): Promise<void> => {
    if (!level.level_code) return;
    setIsSaving(true);
    setError("");
    try {
      const nextIsActive = level.is_active === false;
      await updateAuthReviewLevel(workflow.workflow_code, level.level_code, {
        level_code: level.level_code,
        level_number: level.level_number ?? 1,
        level_name: level.level_name ?? level.level_code,
        is_final_level: level.is_final_level ?? false,
        is_active: nextIsActive,
      });
      await loadReviewContext();
      setNotice(`${level.level_code} ${nextIsActive ? "activated" : "deactivated"}.`);
    } catch (toggleError) {
      setError(toggleError instanceof Error ? toggleError.message : "Review level status could not be updated.");
    } finally {
      setIsSaving(false);
    }
  }, [loadReviewContext]);

  async function handleDrawerSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    if (!drawer) return;
    const form = new FormData(event.currentTarget);
    setIsSaving(true);
    setError("");
    try {
      if (drawer.mode === "workflow-create" || drawer.mode === "workflow-edit") {
        const payload = {
          unit_code: String(form.get("unit_code") ?? ""),
          workflow_code: normalizeCode(String(form.get("workflow_code") ?? "")),
          workflow_name: String(form.get("workflow_name") ?? "").trim(),
          is_active: form.get("is_active") === "on",
        };
        if (drawer.mode === "workflow-create") {
          await createAuthReviewWorkflow(payload);
          setNotice(`${payload.workflow_code} workflow created.`);
        } else {
          await updateAuthReviewWorkflow(drawer.workflow.workflow_code, payload);
          setNotice(`${payload.workflow_code} workflow updated.`);
        }
      }
      if (drawer.mode === "level-create" || drawer.mode === "level-edit") {
        const payload = {
          level_code: normalizeCode(String(form.get("level_code") ?? "")),
          level_number: Number(form.get("level_number") ?? 1),
          level_name: String(form.get("level_name") ?? "").trim(),
          is_final_level: form.get("is_final_level") === "on",
          is_active: form.get("is_active") === "on",
        };
        if (drawer.mode === "level-create") {
          await createAuthReviewLevel(drawer.workflow.workflow_code, payload);
          setNotice(`${payload.level_code} level created.`);
        } else {
          await updateAuthReviewLevel(drawer.workflow.workflow_code, drawer.level.level_code ?? "", payload);
          setNotice(`${payload.level_code} level updated.`);
        }
      }
      setDrawer(null);
      await loadReviewContext();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Review workflow request could not be completed.");
    } finally {
      setIsSaving(false);
    }
  }

  const columns = useMemo(() => reviewWorkflowColumnHelper.columns([
    reviewWorkflowColumnHelper.accessor((workflow) => workflow.workflow_name || workflow.workflow_code, {
      id: "workflowName",
      header: "Workflow Name",
      sortFn: "alphanumeric",
      cell: ({ row }) => (
        <span className="block min-w-52 whitespace-normal">
          <strong className="block font-medium text-foreground">
            {row.original.workflow_name || row.original.workflow_code}
          </strong>
          <span className="block break-all font-mono text-[0.6875rem] text-muted-foreground">
            {row.original.workflow_code}
          </span>
        </span>
      ),
    }),
    reviewWorkflowColumnHelper.accessor("unit_code", {
      header: "Associated Unit",
      sortFn: "alphanumeric",
      cell: ({ getValue }) => getValue()
        ? <Badge variant="outline">{getValue()}</Badge>
        : <span className="text-muted-foreground">-</span>,
    }),
    reviewWorkflowColumnHelper.accessor((workflow) => sortWorkflowLevels(workflow.levels).map((level) => level.level_name || level.level_code).join(" "), {
      id: "approvalSteps",
      header: "Approval Steps",
      sortFn: "alphanumeric",
      cell: ({ row }) => <WorkflowLevelStepper levels={row.original.levels} />,
    }),
    reviewWorkflowColumnHelper.accessor("is_active", {
      header: "Status",
      cell: ({ row }) => (
        <StatusBadge variant={normalizeStatusVariant(`${row.original.is_active === false ? "inactive" : "active"}`)}>
          {row.original.is_active === false ? "Inactive" : "Active"}
        </StatusBadge>
      ),
    }),
    reviewWorkflowColumnHelper.display({
      id: "actions",
      header: () => <span className="block text-right">Actions</span>,
      enableSorting: false,
      enableGlobalFilter: false,
      cell: ({ row }) => (
        <ReviewWorkflowActions
          isSaving={isSaving}
          workflow={row.original}
          onEdit={(workflow) => setDrawer({ mode: "workflow-edit", workflow })}
          onManageLevels={(workflow) => setManagedWorkflowCode(workflow.workflow_code)}
          onToggleStatus={handleToggleWorkflow}
        />
      ),
    }),
  ]), [handleToggleWorkflow, isSaving]);

  const table = useDataTable({
    columns,
    data: filteredWorkflows,
    getRowId: (workflow: AuthReviewWorkflow) => `${workflow.unit_code ?? "GLOBAL"}-${workflow.workflow_code}`,
    globalFilterFn: reviewWorkflowGlobalFilter,
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
    <PageSection className="flex min-w-0 flex-col gap-4">
      <PageHeader>
        <div>
          <h2>Review Workflow</h2>
          <p>Manage configured review workflows and their ordered approval levels by unit.</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" type="button" onPress={() => void loadReviewContext()}>
            <RefreshCw size={14} />
            Refresh
          </Button>
          <Button type="button" onPress={() => setDrawer({ mode: "workflow-create" })}>
            <Plus size={14} />
            New Workflow
          </Button>
        </div>
      </PageHeader>

      {notice && <div className="rounded-md bg-muted p-3 text-sm">{notice}</div>}
      {error && <div className="rounded-md bg-muted p-3 text-sm text-destructive">{error}</div>}

      <div>
        <DataTable
          table={table}
          ariaLabel="Review workflows"
          searchPlaceholder="Search workflow, code, unit, or approval level"
          toolbarActions={(
            <div className="flex flex-wrap items-center justify-end gap-2">
              <Select
                aria-label="Associated unit"
                selectedKey={unitFilter}
                onSelectionChange={(key) => setUnitFilter(String(key ?? "ALL"))}
              >
                <SelectTrigger size="sm" className="w-40"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem id="ALL">All units</SelectItem>
                  {units.map((unit) => (
                    <SelectItem id={unit.unit_code} key={unit.unit_code}>{unit.unit_code}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                aria-label="Workflow status"
                selectedKey={statusFilter}
                onSelectionChange={(key) => setStatusFilter(String(key ?? "ACTIVE"))}
              >
                <SelectTrigger size="sm" className="w-36"><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem id="ACTIVE">Active</SelectItem>
                  <SelectItem id="ALL">All statuses</SelectItem>
                  <SelectItem id="INACTIVE">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}
          isLoading={isLoading}
          loadingMessage="Loading review workflows..."
          error={loadError || undefined}
          emptyMessage="No review workflows are available."
          noResultsMessage="No review workflows match the current search and filters."
          onRetry={() => void loadReviewContext()}
        />
      </div>

      {managedWorkflow ? (
        <ReviewLevelsSheet
          isSaving={isSaving}
          workflow={managedWorkflow}
          onAddLevel={(workflow) => {
            setManagedWorkflowCode(null);
            setDrawer({ mode: "level-create", workflow });
          }}
          onClose={() => setManagedWorkflowCode(null)}
          onEditLevel={(workflow, level) => {
            setManagedWorkflowCode(null);
            setDrawer({ mode: "level-edit", workflow, level });
          }}
          onToggleLevel={handleToggleLevel}
        />
      ) : null}
      {drawer && (
        <ReviewWorkflowDrawer
          drawer={drawer}
          isSaving={isSaving}
          onClose={() => setDrawer(null)}
          onSubmit={handleDrawerSubmit}
          units={units}
        />
      )}
    </PageSection>
  );
}

function ReviewWorkflowActions({ isSaving, workflow, onEdit, onManageLevels, onToggleStatus }: {
  isSaving: boolean;
  workflow: AuthReviewWorkflow;
  onEdit: (workflow: AuthReviewWorkflow) => void;
  onManageLevels: (workflow: AuthReviewWorkflow) => void;
  onToggleStatus: (workflow: AuthReviewWorkflow) => Promise<void>;
}) {
  const isActive = workflow.is_active !== false;

  return (
    <div className="flex justify-end">
      <DropdownMenuTrigger>
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={`Actions for ${workflow.workflow_name || workflow.workflow_code}`}
          isDisabled={isSaving}
        >
          <Ellipsis aria-hidden="true" />
        </Button>
        <DropdownMenu
          aria-label={`Actions for ${workflow.workflow_name || workflow.workflow_code}`}
          className="min-w-48"
          placement="bottom end"
        >
          <DropdownMenuLabel>Workflow actions</DropdownMenuLabel>
          <DropdownMenuItem id="edit" onAction={() => onEdit(workflow)}>
            <Pencil aria-hidden="true" />
            Edit Workflow
          </DropdownMenuItem>
          <DropdownMenuItem id="manage-levels" onAction={() => onManageLevels(workflow)}>
            <ListOrdered aria-hidden="true" />
            Manage Levels / Add Level
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            id="toggle-status"
            variant={isActive ? "destructive" : "default"}
            onAction={() => void onToggleStatus(workflow)}
          >
            {isActive ? <PowerOff aria-hidden="true" /> : <Power aria-hidden="true" />}
            {isActive ? "Deactivate" : "Activate"}
          </DropdownMenuItem>
        </DropdownMenu>
      </DropdownMenuTrigger>
    </div>
  );
}

function sortWorkflowLevels(levels?: AuthReviewWorkflowLevel[]): AuthReviewWorkflowLevel[] {
  return [...(levels ?? [])].sort((left, right) => {
    const numberDifference = (left.level_number ?? Number.MAX_SAFE_INTEGER)
      - (right.level_number ?? Number.MAX_SAFE_INTEGER);
    return numberDifference || String(left.level_code ?? "").localeCompare(String(right.level_code ?? ""));
  });
}

function WorkflowLevelStepper({ levels: unsortedLevels }: { levels?: AuthReviewWorkflowLevel[] }) {
  const levels = sortWorkflowLevels(unsortedLevels);
  if (!levels.length) {
    return <span className="text-muted-foreground">No approval levels</span>;
  }

  return (
    <TooltipTrigger delay={250}>
      <span
        className="inline-flex min-w-max items-center gap-1.5 whitespace-nowrap"
        tabIndex={0}
        aria-label={`${levels.length} approval ${levels.length === 1 ? "level" : "levels"}`}
      >
        {levels.map((level, index) => (
          <Fragment key={`${level.level_code ?? "level"}-${level.level_number ?? index}`}>
            {index > 0 ? <ChevronRight className="size-3 shrink-0 text-muted-foreground" aria-hidden="true" /> : null}
            <span className="inline-flex shrink-0 items-center gap-1 rounded-md border bg-muted/30 px-2 py-1 text-[0.6875rem]">
              <span className="shrink-0 font-medium">{level.level_number ?? index + 1}.</span>
              <span>{level.level_name || level.level_code || `Level ${index + 1}`}</span>
              {level.is_final_level ? <Check className="size-3 shrink-0 text-primary" aria-label="Final level" /> : null}
            </span>
          </Fragment>
        ))}
      </span>
      <Tooltip className="max-w-sm items-start">
        <span className="grid gap-1">
          {levels.map((level, index) => (
            <span key={`${level.level_code ?? "level"}-${level.level_number ?? index}`}>
              {level.level_number ?? index + 1}. {level.level_name || level.level_code || "Unnamed level"}
              {level.is_final_level ? " - Final" : ""}
              {level.is_active === false ? " - Inactive" : ""}
            </span>
          ))}
        </span>
      </Tooltip>
    </TooltipTrigger>
  );
}

function ReviewLevelsSheet({ isSaving, workflow, onAddLevel, onClose, onEditLevel, onToggleLevel }: {
  isSaving: boolean;
  workflow: AuthReviewWorkflow;
  onAddLevel: (workflow: AuthReviewWorkflow) => void;
  onClose: () => void;
  onEditLevel: (workflow: AuthReviewWorkflow, level: AuthReviewWorkflowLevel) => void;
  onToggleLevel: (workflow: AuthReviewWorkflow, level: AuthReviewWorkflowLevel) => Promise<void>;
}) {
  const levels = sortWorkflowLevels(workflow.levels);

  return (
    <SheetContent
      isOpen
      onOpenChange={(isOpen) => {
        if (!isOpen) onClose();
      }}
      className="w-full sm:max-w-lg"
    >
      <SheetHeader className="border-b px-5 py-4 pr-12">
        <SheetTitle>Manage Approval Levels</SheetTitle>
        <SheetDescription>
          {workflow.workflow_name || workflow.workflow_code}
          <span className="block break-all font-mono text-[0.6875rem]">{workflow.workflow_code}</span>
          Edit a level number to change its order in this workflow.
        </SheetDescription>
      </SheetHeader>

      <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b px-5 py-3">
          <span className="text-xs text-muted-foreground">
            {levels.length} approval {levels.length === 1 ? "level" : "levels"}
          </span>
          <Button type="button" size="sm" onPress={() => onAddLevel(workflow)} isDisabled={isSaving}>
            <Plus aria-hidden="true" />
            Add Level
          </Button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          {levels.length ? (
            <ol className="grid gap-2">
              {levels.map((level, index) => {
                const levelName = level.level_name || level.level_code || `Level ${index + 1}`;
                const isActive = level.is_active !== false;
                return (
                  <li
                    className="flex items-start gap-3 rounded-md border bg-background p-3"
                    key={`${level.level_code ?? "level"}-${level.level_number ?? index}`}
                  >
                    <span className="flex size-7 shrink-0 items-center justify-center rounded-full border bg-muted/40 text-xs font-medium">
                      {level.level_number ?? index + 1}
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-1.5">
                        <strong className="font-medium text-foreground">{levelName}</strong>
                        {level.is_final_level ? <Badge variant="secondary">Final</Badge> : null}
                        {!isActive ? <Badge variant="outline">Inactive</Badge> : null}
                      </div>
                      {level.level_code ? (
                        <span className="block break-all font-mono text-[0.6875rem] text-muted-foreground">
                          {level.level_code}
                        </span>
                      ) : null}
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon-sm"
                        aria-label={`Edit ${levelName}`}
                        onPress={() => onEditLevel(workflow, level)}
                        isDisabled={isSaving}
                      >
                        <Pencil aria-hidden="true" />
                      </Button>
                      <Button
                        type="button"
                        variant={isActive ? "ghost" : "outline"}
                        size="icon-sm"
                        aria-label={`${isActive ? "Deactivate" : "Activate"} ${levelName}`}
                        onPress={() => void onToggleLevel(workflow, level)}
                        isDisabled={isSaving || !level.level_code}
                      >
                        {isActive ? <PowerOff aria-hidden="true" /> : <Power aria-hidden="true" />}
                      </Button>
                    </div>
                  </li>
                );
              })}
            </ol>
          ) : (
            <div className="flex min-h-44 flex-col items-center justify-center gap-2 rounded-md border border-dashed p-6 text-center">
              <ListOrdered className="size-5 text-muted-foreground" aria-hidden="true" />
              <strong className="font-medium">No approval levels</strong>
              <span className="max-w-72 text-xs text-muted-foreground">
                Add the first level to define this workflow's approval sequence.
              </span>
              <Button type="button" size="sm" onPress={() => onAddLevel(workflow)} isDisabled={isSaving}>
                <Plus aria-hidden="true" />
                Add First Level
              </Button>
            </div>
          )}
        </div>
      </div>
    </SheetContent>
  );
}

function ReviewWorkflowDrawer({ drawer, isSaving, onClose, onSubmit, units }: {
  drawer: Exclude<ReviewDrawerState, null>;
  isSaving: boolean;
  onClose: () => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  units: AuthUnit[];
}) {
  const workflow = drawer.mode !== "workflow-create" ? drawer.workflow : undefined;
  const level = drawer.mode === "level-edit" ? drawer.level : undefined;
  const isWorkflowMode = drawer.mode === "workflow-create" || drawer.mode === "workflow-edit";
  return (
    <Sheet isOpen showCloseButton={false} onOpenChange={(open) => { if (!open) { onClose(); } }} className="w-full sm:max-w-xl">
      <div className="flex min-h-0 flex-1 flex-col gap-3">
        <div className="flex shrink-0 items-start justify-between gap-3 border-b p-4 [&_h3]:text-base [&_h3]:font-semibold [&_span]:text-xs [&_span]:text-muted-foreground">
          <div>
            <span className="text-xs font-medium text-muted-foreground">{drawer.mode.replace("-", " ")}</span>
            <SheetTitle>{isWorkflowMode ? "Review Workflow" : "Review Level"}</SheetTitle>
          </div>
          <Button size="icon-sm" variant="ghost" type="button" onPress={onClose} aria-label="Close drawer"><X size={16} /></Button>
        </div>
        <form className="flex min-h-0 flex-1 flex-col gap-4 overflow-y-auto p-4" onSubmit={onSubmit}>
          {isWorkflowMode ? (
            <div className="flex min-w-0 flex-col gap-5">
              <section className="flex min-w-0 flex-col gap-3">
                <div className="flex items-start justify-between gap-2 [&_h3]:text-sm [&_h3]:font-semibold [&_p]:text-xs [&_p]:text-muted-foreground">
                  <span>01</span>
                  <div><strong>Workflow details</strong><small>Define the review process and owning unit</small></div>
                </div>
                <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-foreground [&>small]:font-normal [&>small]:text-muted-foreground">Pillar scope
                    <NativeSelect name="unit_code" defaultValue={workflow?.unit_code ?? units[0]?.unit_code ?? ""} required>
                      {units.map((unit) => <NativeSelectOption key={unit.unit_code} value={unit.unit_code}>{unit.unit_name || unit.unit_code}</NativeSelectOption>)}
                    </NativeSelect>
                  </label>
                  <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-foreground [&>small]:font-normal [&>small]:text-muted-foreground">Workflow code
                    <Input name="workflow_code" defaultValue={workflow?.workflow_code ?? "REVIEW_WORKFLOW"} required pattern="[A-Z0-9_\\-]+" />
                  </label>
                  <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-foreground [&>small]:font-normal [&>small]:text-muted-foreground">Workflow name
                    <Input name="workflow_name" defaultValue={workflow?.workflow_name ?? ""} required />
                  </label>
                </div>
              </section>
              <section className="flex min-w-0 flex-col gap-3">
                <div className="flex items-start justify-between gap-2 [&_h3]:text-sm [&_h3]:font-semibold [&_p]:text-xs [&_p]:text-muted-foreground">
                  <span>02</span>
                  <div><strong>Availability</strong><small>Control whether this workflow can be assigned</small></div>
                </div>
                <div>
                  <BooleanField name="is_active" defaultSelected={workflow?.is_active ?? true}>

                    <span className="flex min-w-0 flex-1 flex-col gap-1 [&>small]:text-xs [&>small]:font-normal [&>small]:text-muted-foreground"><strong>Active workflow</strong><small>Allow this workflow to receive review assignments.</small></span>
                    <span className="hidden" aria-hidden="true"><span className="hidden" /></span>
                  </BooleanField>
                </div>
              </section>
            </div>
          ) : (
            <div className="flex min-w-0 flex-col gap-5">
              <div>Level belongs to <strong>{workflow?.workflow_code}</strong></div>
              <section className="flex min-w-0 flex-col gap-3">
                <div className="flex items-start justify-between gap-2 [&_h3]:text-sm [&_h3]:font-semibold [&_p]:text-xs [&_p]:text-muted-foreground">
                  <span>01</span>
                  <div><strong>Level details</strong><small>Configure sequence, code, and display name</small></div>
                </div>
                <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
                  <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-foreground [&>small]:font-normal [&>small]:text-muted-foreground">Level number
                    <Input name="level_number" type="number" min={1} max={50} defaultValue={level?.level_number ?? ((workflow?.levels?.length ?? 0) + 1)} required />
                  </label>
                  <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-foreground [&>small]:font-normal [&>small]:text-muted-foreground">Level code
                    <Input name="level_code" defaultValue={level?.level_code ?? `LEVEL_${(workflow?.levels?.length ?? 0) + 1}`} required pattern="[A-Z0-9_\\-]+" />
                  </label>
                  <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-foreground [&>small]:font-normal [&>small]:text-muted-foreground">Level name
                    <Input name="level_name" defaultValue={level?.level_name ?? ""} required />
                  </label>
                </div>
              </section>
              <section className="flex min-w-0 flex-col gap-3">
                <div className="flex items-start justify-between gap-2 [&_h3]:text-sm [&_h3]:font-semibold [&_p]:text-xs [&_p]:text-muted-foreground">
                  <span>02</span>
                  <div><strong>Level behavior</strong><small>Set approval responsibility and availability</small></div>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <BooleanField name="is_final_level" defaultSelected={level?.is_final_level ?? false}>

                    <span className="flex min-w-0 flex-1 flex-col gap-1 [&>small]:text-xs [&>small]:font-normal [&>small]:text-muted-foreground"><strong>Final approval</strong><small>Completes the review workflow.</small></span>
                    <span className="hidden" aria-hidden="true"><span className="hidden" /></span>
                  </BooleanField>
                  <BooleanField name="is_active" defaultSelected={level?.is_active ?? true}>

                    <span className="flex min-w-0 flex-1 flex-col gap-1 [&>small]:text-xs [&>small]:font-normal [&>small]:text-muted-foreground"><strong>Active level</strong><small>Allow reviewers to use this level.</small></span>
                    <span className="hidden" aria-hidden="true"><span className="hidden" /></span>
                  </BooleanField>
                </div>
              </section>
            </div>
          )}
          <div className="mt-auto flex shrink-0 flex-wrap items-center justify-end gap-2 border-t pt-4">
            <Button variant="outline" type="button" onPress={onClose}>Cancel</Button>
            <Button isDisabled={isSaving} type="submit">{isSaving ? "Saving..." : drawer.mode.includes("create") ? isWorkflowMode ? "Create workflow" : "Create level" : "Save changes"}</Button>
          </div>
        </form>
      </div>
    </Sheet>
  );
}

function matchesSearch(searchText: string, ...values: Array<string | number | undefined | null>): boolean {
  if (!searchText.trim()) return true;
  const normalizedSearch = searchText.trim().toLowerCase();
  return values.some((value) => String(value ?? "").toLowerCase().includes(normalizedSearch));
}

function normalizeCode(value: string): string {
  return value.trim().toUpperCase().replace(/[^A-Z0-9_-]+/g, "_").replace(/^_+|_+$/g, "");
}
