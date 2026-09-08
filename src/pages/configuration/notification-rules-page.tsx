import { PageHeader } from "@/components/common/page-layout";
import { CircleCheck, CircleOff, Edit3, Ellipsis, Plus, Search } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import type { TFunction } from "i18next";

import { Button } from "@/components/ui/button";
import { StatusDot } from "@/components/common/status-badge";
import { normalizeStatusVariant } from "@/components/common/status-variants";
import { createDataTableColumnHelper, DataTable, useDataTable } from "@/components/data-table";
import { DropdownMenu, DropdownMenuGroup, DropdownMenuItem, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { CustomTabs } from "@/components/common/custom-tabs";

import {
  listEmailTemplates,
  listNotificationReceiverGroups,
  listNotificationRules,
  NotificationRule,
  NotificationRulePayload,
  NotificationReceiverGroup,
  saveNotificationRule,
  setNotificationRuleActive,
  EmailTemplate,
} from "../../api/requests.api";
import { getSelectedUnitCode, listAvailableUnits, UnitOption } from "../../api/session.api";

const ACTIONS = ["SEND_REQUEST", "FIRST_REMINDER", "DUE_DATE_REMINDER", "OVERDUE_ALERT", "ESCALATION", "SUBMITTED_FOR_REVIEW", "REVIEW_APPROVED", "REVIEW_REJECTED", "RESENT_FOR_SUBMISSION", "RESUBMITTED_FOR_REVIEW", "PUBLISHED"];
const STATUS_TABS = ["ALL", "ACTIVE", "INACTIVE"] as const;
type StatusFilter = (typeof STATUS_TABS)[number];
const notificationRuleColumnHelper = createDataTableColumnHelper<NotificationRule>();

function labelFor(value: string | undefined, t: TFunction) {
  return value ? t(`pages.emailTemplates.types.${value}`, { defaultValue: value }) : "-";
}

function groupLabel(groups: NotificationReceiverGroup[], code: string) {
  return groups.find((group) => group.receiverGroupCode === code)?.groupName ?? code;
}

function ruleToPayload(rule: NotificationRule): NotificationRulePayload {
  return {
    notification_rule_code: rule.notificationRuleCode,
    rule_name: rule.ruleName ?? "",
    action_code: rule.actionCode ?? "SEND_REQUEST",
    unit_code: rule.unitCode ?? getSelectedUnitCode(),
    scope_type: rule.scopeType ?? "GLOBAL",
    template_version_code: rule.scopeType === "TEMPLATE" ? rule.templateVersionCode ?? "" : null,
    source_organization_code: rule.scopeType === "SOURCE" ? rule.sourceOrganizationCode ?? "" : null,
    email_template_code: rule.emailTemplateCode ?? null,
    template_type: rule.templateType ?? rule.actionCode ?? "SEND_REQUEST",
    sender_type: rule.senderType ?? "SYSTEM_MAILBOX",
    sender_email: rule.senderEmail ?? null,
    receiver_rules: rule.receiverRules ?? { to: ["SOURCE_OFFICERS"], cc: [], bcc: [] },
    trigger_rules: rule.triggerRules ?? {},
    applies_to_statuses: rule.appliesToStatuses ?? [],
    approval_level: rule.approvalLevel ?? null,
    sort_order: rule.sortOrder ?? 0,
    is_default: rule.isDefault ?? false,
    is_active: rule.isActive ?? true,
  };
}

function joinGroups(groups?: string[]) {
  return groups?.length ? groups.join(", ") : "-";
}

function triggerSummary(rule: NotificationRule, t: TFunction) {
  const triggerRules = rule.triggerRules ?? {};
  const trigger = String(triggerRules.trigger ?? "").toUpperCase();
  if (trigger === "MANUAL_SEND") return t("pages.notificationRules.list.triggers.manual");
  if (trigger === "ON_DUE_DATE") return t("pages.notificationRules.list.triggers.dueDate");
  if (trigger === "DAYS_BEFORE_DUE") return t("pages.notificationRules.list.triggers.beforeDue", { count: triggerRules.daysBeforeDue ?? 0 });
  if (trigger === "DAYS_AFTER_DUE") return t("pages.notificationRules.list.triggers.afterDue", { count: triggerRules.daysAfterDue ?? 0 });
  if (trigger === "ON_STATUS_CHANGE") {
    const action = String(rule.actionCode ?? "");
    if (action === "SUBMITTED_FOR_REVIEW") return t("pages.notificationRules.list.triggers.submitted");
    if (action === "RESUBMITTED_FOR_REVIEW") return t("pages.notificationRules.list.triggers.resubmitted");
    if (action === "REVIEW_APPROVED") return rule.approvalLevel ? t("pages.notificationRules.list.triggers.levelApproved", { level: rule.approvalLevel }) : t("pages.notificationRules.list.triggers.approved");
    if (action === "REVIEW_REJECTED") return t("pages.notificationRules.list.triggers.rejected");
    if (action === "RESENT_FOR_SUBMISSION") return t("pages.notificationRules.list.triggers.resent");
    if (action === "PUBLISHED") return t("pages.notificationRules.list.triggers.published");
    return t("pages.notificationRules.list.triggers.statusChange");
  }
  return trigger ? trigger.replace(/_/g, " ").toLowerCase() : t("pages.notificationRules.list.backendConfigured");
}

export function NotificationRulesPage() {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const unitCode = getSelectedUnitCode();
  const [rules, setRules] = useState<NotificationRule[]>([]);
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [receiverGroups, setReceiverGroups] = useState<NotificationReceiverGroup[]>([]);
  const [unitOptions, setUnitOptions] = useState<UnitOption[]>([]);
  const [copySourceUnit, setCopySourceUnit] = useState("");
  const [query, setQuery] = useState("");
  const [actionFilter, setActionFilter] = useState("ALL");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("ALL");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isCopying, setIsCopying] = useState(false);

  async function loadRules() {
    setIsLoading(true);
    setError("");
    try {
      const [ruleRows, templateRows, groupRows] = await Promise.all([
        listNotificationRules({ unitCode, includeInactive: true, limit: 500 }),
        listEmailTemplates({ unitCode, includeInactive: true, limit: 500 }),
        listNotificationReceiverGroups(),
      ]);
      setRules(ruleRows);
      setTemplates(templateRows);
      setReceiverGroups(groupRows);
    } catch (err) {
      setError(err instanceof Error ? err.message : t("pages.notificationRules.list.errors.load"));
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    let active = true;
    Promise.all([
      listNotificationRules({ unitCode, includeInactive: true, limit: 500 }),
      listEmailTemplates({ unitCode, includeInactive: true, limit: 500 }),
      listNotificationReceiverGroups(),
      listAvailableUnits(),
    ])
      .then(([ruleRows, templateRows, groupRows, unitRows]) => {
        if (!active) return;
        setRules(ruleRows);
        setTemplates(templateRows);
        setReceiverGroups(groupRows);
        setUnitOptions(unitRows.filter((unit) => unit.unit_code !== unitCode));
      })
      .catch((err) => {
        if (active) setError(err instanceof Error ? err.message : t("pages.notificationRules.list.errors.load"));
      })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [t, unitCode]);

  const filteredRules = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return rules.filter((rule) => {
      const haystack = [rule.notificationRuleCode, rule.ruleName, rule.actionCode, rule.emailTemplateCode, rule.senderType]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      const matchesStatus = statusFilter === "ALL" || (statusFilter === "ACTIVE" && rule.isActive !== false) || (statusFilter === "INACTIVE" && rule.isActive === false);
      return (!needle || haystack.includes(needle)) && (actionFilter === "ALL" || rule.actionCode === actionFilter) && matchesStatus;
    });
  }, [actionFilter, query, rules, statusFilter]);

  async function toggleRule(rule: NotificationRule) {
    if (!rule.notificationRuleCode) return;
    try {
      await setNotificationRuleActive(rule.notificationRuleCode, rule.unitCode ?? unitCode, rule.isActive === false);
      await loadRules();
      toast.success(t(rule.isActive === false ? "pages.notificationRules.list.notifications.activated" : "pages.notificationRules.list.notifications.deactivated"));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("pages.notificationRules.list.errors.status"));
    }
  }

  async function copyRulesFromUnit() {
    if (!copySourceUnit) {
      setError(t("pages.notificationRules.list.errors.copySource"));
      return;
    }
    setIsCopying(true);
    setError("");
    try {
      const sourceRules = await listNotificationRules({
        unitCode: copySourceUnit,
        includeInactive: true,
        limit: 500,
      });
      if (!sourceRules.length) {
        setError(t("pages.notificationRules.list.errors.copyEmpty"));
        return;
      }
      await Promise.all(
        sourceRules.map((rule) => {
          const payload = ruleToPayload(rule);
          const matchingTemplate = templates.find(
            (template) =>
              template.isActive !== false &&
              (template.templateType ?? "") === (payload.template_type || payload.action_code) &&
              (template.isDefault || !payload.email_template_code),
          );
          return saveNotificationRule(undefined, {
            ...payload,
            notification_rule_code: undefined,
            unit_code: unitCode,
            email_template_code: matchingTemplate?.emailTemplateCode ?? null,
            updated_by_username: "Copied from " + copySourceUnit,
          });
        }),
      );
      await loadRules();
      toast.success(t("pages.notificationRules.list.notifications.copied", { count: sourceRules.length, unit: copySourceUnit }));
    } catch (err) {
      setError(err instanceof Error ? err.message : t("pages.notificationRules.list.errors.copy"));
    } finally {
      setIsCopying(false);
    }
  }

  const columns = notificationRuleColumnHelper.columns([
    notificationRuleColumnHelper.display({ id: "rule", header: t("pages.notificationRules.list.table.rule"), cell: ({ row }) => <div className="flex min-w-0 flex-col"><strong className="truncate">{row.original.ruleName}</strong><small className="truncate text-muted-foreground">{row.original.notificationRuleCode}</small></div> }),
    notificationRuleColumnHelper.display({ id: "action", header: t("pages.notificationRules.list.table.action"), cell: ({ row }) => labelFor(row.original.actionCode, t) }),
    notificationRuleColumnHelper.display({ id: "template", header: t("pages.notificationRules.list.table.template"), cell: ({ row }) => <div className="flex min-w-0 flex-col"><strong className="truncate">{row.original.emailTemplateCode || t("pages.notificationRules.list.defaultByType")}</strong><small className="truncate text-muted-foreground">{labelFor(row.original.templateType, t)}</small></div> }),
    notificationRuleColumnHelper.display({ id: "sender", header: t("pages.notificationRules.list.table.sender"), cell: ({ row }) => <div className="flex min-w-0 flex-col"><strong className="truncate">{t(`pages.notificationRules.senders.${row.original.senderType}`, { defaultValue: row.original.senderType })}</strong><small className="truncate text-muted-foreground">{row.original.senderEmail || t("pages.notificationRules.list.systemConfigured")}</small></div> }),
    notificationRuleColumnHelper.display({ id: "receivers", header: t("pages.notificationRules.list.table.receivers"), cell: ({ row }) => <div className="flex min-w-0 flex-col"><small className="truncate">{t("pages.notificationRules.list.to")}: {joinGroups(row.original.receiverRules?.to?.map((group) => groupLabel(receiverGroups, group)))}</small><small className="truncate text-muted-foreground">{t("pages.notificationRules.list.cc")}: {joinGroups(row.original.receiverRules?.cc?.map((group) => groupLabel(receiverGroups, group)))}</small></div> }),
    notificationRuleColumnHelper.display({ id: "trigger", header: t("pages.notificationRules.list.table.trigger"), cell: ({ row }) => <span className="line-clamp-2">{triggerSummary(row.original, t)}</span> }),
    notificationRuleColumnHelper.display({ id: "actions", header: () => <span className="block text-right">{t("pages.notificationRules.list.table.actions")}</span>, enableSorting: false, enableGlobalFilter: false, cell: ({ row }) => <div className="flex justify-end" onClick={(event) => event.stopPropagation()} onKeyDown={(event) => event.stopPropagation()}><DropdownMenuTrigger><Button variant="ghost" size="icon-sm" type="button" aria-label={t("pages.notificationRules.list.actionsFor", { name: row.original.ruleName })}><Ellipsis aria-hidden="true" /></Button><DropdownMenu className="min-w-40" placement="bottom end" aria-label={t("pages.notificationRules.list.actionsFor", { name: row.original.ruleName })}><DropdownMenuLabel>{t("pages.notificationRules.list.ruleActions")}</DropdownMenuLabel><DropdownMenuGroup><DropdownMenuItem id="edit" onAction={() => navigate(`/configuration/notification-rules/${encodeURIComponent(row.original.notificationRuleCode ?? "")}/edit`)}><Edit3 aria-hidden="true" />{t("pages.notificationRules.list.edit")}</DropdownMenuItem><DropdownMenuItem id="status" onAction={() => void toggleRule(row.original)}>{row.original.isActive === false ? <CircleCheck aria-hidden="true" /> : <CircleOff aria-hidden="true" />}{t(row.original.isActive === false ? "pages.notificationRules.list.activate" : "pages.notificationRules.list.deactivate")}</DropdownMenuItem></DropdownMenuGroup></DropdownMenu></DropdownMenuTrigger></div> }),
  ]);
  const table = useDataTable({ columns, data: filteredRules, getRowId: (row) => row.notificationRuleCode ?? "", enableMultiSort: false, enableRowSelection: false, initialState: { pagination: { pageIndex: 0, pageSize: 25 } } });

  return (
    <div className="flex min-w-0 flex-col gap-4 content-stack">
      <PageHeader>
        <div>
          <h1>{t("pages.notificationRules.list.title")}</h1>
          <p>{t("pages.notificationRules.list.description")}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select aria-label={t("pages.notificationRules.list.copyFrom")} selectedKey={copySourceUnit || "NONE"} onSelectionChange={(key) => setCopySourceUnit(key === "NONE" ? "" : String(key))}>
            <SelectTrigger className="w-48"><SelectValue /></SelectTrigger><SelectContent className="w-max max-w-[calc(100vw-2rem)]"><SelectGroup>
            <SelectItem id="NONE">{t("pages.notificationRules.list.copyFrom")}</SelectItem>
            {unitOptions.map((unit) => (
              <SelectItem key={unit.unit_code} id={unit.unit_code}>
                {unit.unit_name ?? unit.display_name ?? unit.name ?? unit.unit_code}
              </SelectItem>
            ))}
            </SelectGroup></SelectContent>
          </Select>
          <Button variant="outline" size="sm" isDisabled={isCopying || !copySourceUnit} type="button" onPress={() => void copyRulesFromUnit()}>
            {t(isCopying ? "pages.notificationRules.list.copying" : "pages.notificationRules.list.createFrom")}
          </Button>
          <Button size="sm" type="button" onPress={() => navigate("/configuration/notification-rules/create")}><Plus data-icon="inline-start" aria-hidden="true" />{t("pages.notificationRules.list.create")}</Button>
        </div>
      </PageHeader>

      {error ? <div className="text-sm text-destructive">{error}</div> : null}

      <div className="grid grid-cols-1 gap-2 rounded-md bg-muted/50 p-2 md:grid-cols-4" aria-label={t("pages.notificationRules.list.filtersLabel")}>
        <InputGroup className="md:col-span-2"><InputGroupAddon><Search aria-hidden="true" /></InputGroupAddon><InputGroupInput aria-label={t("pages.notificationRules.list.search")} value={query} onChange={(event) => setQuery(event.target.value)} placeholder={t("pages.notificationRules.list.search")} /></InputGroup>
        <Select className="min-w-0 w-full" aria-label={t("pages.notificationRules.list.actionFilter")} selectedKey={actionFilter} onSelectionChange={(key) => setActionFilter(String(key))}>
          <SelectTrigger><SelectValue /></SelectTrigger><SelectContent className="w-max max-w-[calc(100vw-2rem)]"><SelectGroup>
          <SelectItem id="ALL">{t("pages.notificationRules.list.allActions")}</SelectItem>
          {ACTIONS.map((value) => <SelectItem key={value} id={value}>{labelFor(value, t)}</SelectItem>)}
          </SelectGroup></SelectContent>
        </Select>
      </div>

      <CustomTabs
        variant="underline"
        value={statusFilter}
        onValueChange={(key) => setStatusFilter(String(key) as StatusFilter)}
        compact
        ariaLabel={t("pages.notificationRules.list.statusFilter")}
        contentClassName="mt-2"
        items={STATUS_TABS.map((status) => (
            ({ value: status, label: t(status === "ALL" ? "pages.notificationRules.list.allStatuses" : status === "ACTIVE" ? "pages.notificationRules.active" : "pages.notificationRules.list.inactive"), icon: (<StatusDot data-icon="inline-start" variant={normalizeStatusVariant(status)} aria-hidden="true" />), content: (<>{statusFilter === status ? (
              <DataTable table={table} ariaLabel={t("pages.notificationRules.list.library")} isLoading={isLoading} loadingMessage={t("pages.notificationRules.list.loading")} emptyMessage={t("pages.notificationRules.list.empty")} pageSizeOptions={[10, 25, 50, 100]} totalCount={filteredRules.length} />
            ) : null}</>) })
          ))}
      />

    </div>
  );
}
