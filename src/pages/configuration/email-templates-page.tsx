import { PageHeader } from "@/components/common/page-layout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { StatusDot } from "@/components/common/status-badge";
import { normalizeStatusVariant } from "@/components/common/status-variants";
import { createDataTableColumnHelper, DataTable, useDataTable } from "@/components/data-table";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CustomTabs } from "@/components/common/custom-tabs";
import { DropdownMenu, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { CircleCheck, CircleOff, Edit3, Ellipsis, Plus, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";

import {
  EmailTemplate,
  EmailTemplatePayload,
  listEmailTemplates,
  saveEmailTemplate,
  setEmailTemplateActive,
} from "../../api/requests.api";
import { getSelectedUnitCode, listAvailableUnits, UnitOption } from "../../api/session.api";

const TEMPLATE_TYPES = [
  "SEND_REQUEST", "FIRST_REMINDER", "DUE_DATE_REMINDER", "OVERDUE_ALERT", "ESCALATION", "SUBMITTED_FOR_REVIEW", "REVIEW_APPROVED", "REVIEW_REJECTED", "RESENT_FOR_SUBMISSION", "RESUBMITTED_FOR_REVIEW", "PUBLISHED",
];

const STATUS_TABS = ["ALL", "ACTIVE", "INACTIVE"] as const;
type StatusFilter = (typeof STATUS_TABS)[number];

const emailTemplateColumnHelper = createDataTableColumnHelper<EmailTemplate>();

function toPayload(template: EmailTemplate): EmailTemplatePayload {
  return {
    email_template_code: template.emailTemplateCode,
    template_name: template.templateName ?? "",
    template_type: template.templateType ?? "SEND_REQUEST",
    unit_code: template.unitCode ?? getSelectedUnitCode(),
    scope_type: template.scopeType ?? "GLOBAL",
    template_version_code: template.scopeType === "TEMPLATE" ? template.templateVersionCode ?? "" : null,
    source_organization_code: template.scopeType === "SOURCE" ? template.sourceOrganizationCode ?? "" : null,
    subject: template.subject ?? "",
    body: template.body ?? "",
    variables: template.variables ?? [],
    is_default: template.isDefault ?? false,
    is_active: template.isActive ?? true,
  };
}

export function EmailTemplatesPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const unitCode = getSelectedUnitCode();
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [unitOptions, setUnitOptions] = useState<UnitOption[]>([]);
  const [copySourceUnit, setCopySourceUnit] = useState("");
  const [query, setQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [isCopying, setIsCopying] = useState(false);
  const [error, setError] = useState("");

  async function loadTemplates() {
    setIsLoading(true);
    setError("");
    try {
      const rows = await listEmailTemplates({ unitCode, includeInactive: true, limit: 500 });
      setTemplates(rows);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("pages.emailTemplates.errors.load"));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    Promise.all([
      listEmailTemplates({ unitCode, includeInactive: true, limit: 500 }),
      listAvailableUnits(),
    ])
      .then(([templateRows, unitRows]) => {
        if (!active) return;
        setTemplates(templateRows);
        setUnitOptions(unitRows.filter((unit) => unit.unit_code !== unitCode));
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : t("pages.emailTemplates.errors.load"));
      })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [t, unitCode]);

  const filteredTemplates = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return templates.filter((template) => {
      const haystack = [
        template.emailTemplateCode,
        template.templateName,
        template.templateType,
        template.scopeType,
        template.subject,
        template.templateVersionCode,
        template.sourceOrganizationCode,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matchesSearch = !needle || haystack.includes(needle);
      const matchesType = typeFilter === "ALL" || template.templateType === typeFilter;
      const matchesStatus =
        statusFilter === "ALL" ||
        (statusFilter === "ACTIVE" && template.isActive !== false) ||
        (statusFilter === "INACTIVE" && template.isActive === false);
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [query, statusFilter, templates, typeFilter]);

  async function toggleActive(template: EmailTemplate) {
    if (!template.emailTemplateCode) return;
    setError("");
    try {
      await setEmailTemplateActive(template.emailTemplateCode, template.unitCode ?? unitCode, template.isActive === false);
      await loadTemplates();
      toast.success(t(template.isActive === false ? "pages.emailTemplates.notifications.activated" : "pages.emailTemplates.notifications.deactivated"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("pages.emailTemplates.errors.status"));
    }
  }

  async function copyTemplatesFromUnit() {
    if (!copySourceUnit) {
      setError(t("pages.emailTemplates.errors.copySource"));
      return;
    }
    setIsCopying(true);
    setError("");
    try {
      const sourceTemplates = await listEmailTemplates({
        unitCode: copySourceUnit,
        includeInactive: true,
        limit: 500,
      });
      if (!sourceTemplates.length) {
        setError(t("pages.emailTemplates.errors.copyEmpty"));
        return;
      }
      await Promise.all(
        sourceTemplates.map((template) => {
          const payload = toPayload(template);
          return saveEmailTemplate(undefined, {
            ...payload,
            email_template_code: undefined,
            unit_code: unitCode,
            updated_by_username: "Copied from " + copySourceUnit,
          });
        }),
      );
      await loadTemplates();
      toast.success(t("pages.emailTemplates.notifications.copied", { count: sourceTemplates.length, unit: copySourceUnit }));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("pages.emailTemplates.errors.copy"));
    } finally {
      setIsCopying(false);
    }
  }

  const columns = emailTemplateColumnHelper.columns([
    emailTemplateColumnHelper.display({ id: "template", header: t("pages.emailTemplates.table.template"), cell: ({ row }) => <div className="flex min-w-0 flex-col"><strong className="truncate">{row.original.templateName}</strong><small className="truncate text-muted-foreground">{row.original.emailTemplateCode}</small></div> }),
    emailTemplateColumnHelper.display({ id: "type", header: t("pages.emailTemplates.table.type"), cell: ({ row }) => t(`pages.emailTemplates.types.${row.original.templateType}`) }),
    emailTemplateColumnHelper.display({ id: "scope", header: t("pages.emailTemplates.table.scope"), cell: ({ row }) => <div className="flex min-w-0 flex-col"><strong>{t(`pages.emailTemplates.scopes.${row.original.scopeType}`)}</strong><small className="truncate text-muted-foreground">{row.original.templateVersionCode || row.original.sourceOrganizationCode || row.original.unitCode}</small></div> }),
    emailTemplateColumnHelper.accessor("subject", { header: t("pages.emailTemplates.table.subject"), cell: ({ getValue }) => <span className="line-clamp-2 max-w-md">{getValue()}</span> }),
    emailTemplateColumnHelper.display({ id: "status", header: t("pages.emailTemplates.table.status"), cell: ({ row }) => <Badge variant={row.original.isActive === false ? "outline" : "secondary"}>{t(row.original.isActive === false ? "pages.emailTemplates.inactive" : "pages.emailTemplates.active")}</Badge> }),
    emailTemplateColumnHelper.accessor("updatedAt", { header: t("pages.emailTemplates.table.updated"), cell: ({ getValue }) => new Intl.DateTimeFormat(i18n.resolvedLanguage ?? i18n.language, { day: "2-digit", month: "short", year: "numeric" }).format(new Date(getValue() ?? "")) }),
    emailTemplateColumnHelper.display({ id: "actions", header: () => <span className="block text-right">{t("pages.emailTemplates.table.actions")}</span>, enableSorting: false, enableGlobalFilter: false, cell: ({ row }) => <div className="flex justify-end" onClick={event => event.stopPropagation()} onKeyDown={event => event.stopPropagation()}><DropdownMenuTrigger><Button variant="ghost" size="icon-sm" type="button" aria-label={t("pages.emailTemplates.actionsFor", { name: row.original.templateName })}><Ellipsis aria-hidden="true" /></Button><DropdownMenu className="min-w-40" placement="bottom end" aria-label={t("pages.emailTemplates.actionsFor", { name: row.original.templateName })}><DropdownMenuLabel>{t("pages.emailTemplates.templateActions")}</DropdownMenuLabel><DropdownMenuGroup><DropdownMenuItem id="edit" onAction={() => navigate(`/configuration/email-templates/${encodeURIComponent(row.original.emailTemplateCode ?? "")}/edit`)}><Edit3 aria-hidden="true" />{t("pages.emailTemplates.edit")}</DropdownMenuItem><DropdownMenuItem id="status" onAction={() => void toggleActive(row.original)}>{row.original.isActive === false ? <CircleCheck aria-hidden="true" /> : <CircleOff aria-hidden="true" />}{t(row.original.isActive === false ? "pages.emailTemplates.activate" : "pages.emailTemplates.deactivate")}</DropdownMenuItem></DropdownMenuGroup></DropdownMenu></DropdownMenuTrigger></div> }),
  ]);
  const table = useDataTable({ columns, data: filteredTemplates, getRowId: row => row.emailTemplateCode ?? "", enableMultiSort: false, enableRowSelection: false, initialState: { pagination: { pageIndex: 0, pageSize: 25 } } });

  return (
    <div className="flex min-w-0 flex-col gap-4 content-stack">
      <PageHeader>
        <div>
          <h1>{t("pages.emailTemplates.title")}</h1>
          <p>{t("pages.emailTemplates.description")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select aria-label={t("pages.emailTemplates.copyFrom")} selectedKey={copySourceUnit || "NONE"} onSelectionChange={(key) => setCopySourceUnit(key === "NONE" ? "" : String(key))}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger>
            <SelectContent className="w-max max-w-[calc(100vw-2rem)]"><SelectGroup>
              <SelectItem id="NONE">{t("pages.emailTemplates.copyFrom")}</SelectItem>
            {unitOptions.map((unit) => (
              <SelectItem key={unit.unit_code} id={unit.unit_code}>
                {unit.unit_name ?? unit.display_name ?? unit.name ?? unit.unit_code}
              </SelectItem>
            ))}
            </SelectGroup></SelectContent>
          </Select>
          <Button variant="outline" size="sm" isDisabled={isCopying || !copySourceUnit} type="button" onPress={() => void copyTemplatesFromUnit()}>
            {t(isCopying ? "pages.emailTemplates.copying" : "pages.emailTemplates.createFrom")}
          </Button>
          <Button size="sm" type="button" onPress={() => navigate("/configuration/email-templates/create")}>
            <Plus data-icon="inline-start" aria-hidden="true" /> {t("pages.emailTemplates.create")}
          </Button>
        </div>
      </PageHeader>

      {error ? <div className="text-sm text-destructive">{error}</div> : null}

      <div className="grid grid-cols-1 gap-2 rounded-md bg-muted/50 p-2 md:grid-cols-4" aria-label={t("pages.emailTemplates.filtersLabel")}>
        <InputGroup className="md:col-span-2">
          <InputGroupAddon><Search aria-hidden="true" /></InputGroupAddon>
          <InputGroupInput
            aria-label={t("pages.emailTemplates.search")}
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder={t("pages.emailTemplates.search")}
          />
        </InputGroup>
        <Select className="min-w-0 w-full" aria-label={t("pages.emailTemplates.typeFilter")} selectedKey={typeFilter} onSelectionChange={(key) => setTypeFilter(String(key))}>
          <SelectTrigger><SelectValue /></SelectTrigger><SelectContent className="w-max max-w-[calc(100vw-2rem)]"><SelectGroup>
            <SelectItem id="ALL">{t("pages.emailTemplates.allTypes")}</SelectItem>
            {TEMPLATE_TYPES.map((type) => <SelectItem key={type} id={type}>{t(`pages.emailTemplates.types.${type}`)}</SelectItem>)}
          </SelectGroup></SelectContent>
        </Select>
      </div>

      <CustomTabs
        variant="underline"
        value={statusFilter}
        onValueChange={(key) => setStatusFilter(String(key) as StatusFilter)}
        compact
        ariaLabel={t("pages.emailTemplates.statusFilter")}
        contentClassName="mt-2"
        items={STATUS_TABS.map((status) => (
            ({ value: status, label: t(`pages.emailTemplates.${status === "ALL" ? "all" : status.toLowerCase()}`), icon: (<StatusDot data-icon="inline-start" variant={normalizeStatusVariant(status)} aria-hidden="true" />), content: (<>{statusFilter === status ? (
              <DataTable table={table} ariaLabel={t("pages.emailTemplates.library")} isLoading={isLoading} loadingMessage={t("pages.emailTemplates.loading")} emptyMessage={t("pages.emailTemplates.empty")} pageSizeOptions={[10, 25, 50, 100]} totalCount={filteredTemplates.length} />
            ) : null}</>) })
          ))}
      />

    </div>
  );
}
