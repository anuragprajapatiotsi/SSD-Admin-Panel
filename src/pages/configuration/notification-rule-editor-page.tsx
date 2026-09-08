import { PageSection, PageHeader } from "@/components/common/page-layout";
import { Loader } from "@/components/common/loader";
import { Empty, EmptyHeader, EmptyTitle, EmptyDescription } from "@/components/ui/empty";
import { Alert, AlertTitle } from "@/components/ui/alert";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldLegend, FieldSet, FieldTitle } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { CustomTabs } from "@/components/common/custom-tabs";
import { ArrowLeft, Save } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { createDefaultNotificationRule, type EmailTemplate, listEmailTemplates, listNotificationReceiverGroups, listNotificationRules, type NotificationReceiverGroup, type NotificationRule, type NotificationRulePayload, saveNotificationRule } from "../../api/requests.api";
import { getSelectedUnitCode } from "../../api/session.api";

const RULES_PATH = "/configuration/notification-rules";
const ACTIONS = ["SEND_REQUEST", "FIRST_REMINDER", "DUE_DATE_REMINDER", "OVERDUE_ALERT", "ESCALATION", "SUBMITTED_FOR_REVIEW", "REVIEW_APPROVED", "REVIEW_REJECTED", "RESENT_FOR_SUBMISSION", "RESUBMITTED_FOR_REVIEW", "PUBLISHED"];
const SENDER_TYPES = ["SYSTEM_MAILBOX", "CURRENT_USER", "SOURCE_MAILBOX", "CUSTOM_EMAIL"];
const RECEIVER_BUCKETS = ["to", "cc", "bcc"] as const;

function toPayload(rule: NotificationRule): NotificationRulePayload {
  return { notification_rule_code: rule.notificationRuleCode, rule_name: rule.ruleName ?? "", action_code: rule.actionCode ?? "SEND_REQUEST", unit_code: rule.unitCode ?? getSelectedUnitCode(), scope_type: rule.scopeType ?? "GLOBAL", template_version_code: rule.templateVersionCode ?? null, source_organization_code: rule.sourceOrganizationCode ?? null, email_template_code: rule.emailTemplateCode ?? null, template_type: rule.templateType ?? rule.actionCode ?? "SEND_REQUEST", sender_type: rule.senderType ?? "SYSTEM_MAILBOX", sender_email: rule.senderEmail ?? null, receiver_rules: rule.receiverRules ?? { to: ["SOURCE_OFFICERS"], cc: [], bcc: [] }, trigger_rules: rule.triggerRules ?? {}, applies_to_statuses: rule.appliesToStatuses ?? [], approval_level: rule.approvalLevel ?? null, sort_order: rule.sortOrder ?? 0, is_default: rule.isDefault ?? false, is_active: rule.isActive ?? true };
}

export function NotificationRuleEditorPage() {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const { notificationRuleCode } = useParams();
  const isEdit = Boolean(notificationRuleCode);
  const unitCode = getSelectedUnitCode();
  const [values, setValues] = useState<NotificationRulePayload>(() => createDefaultNotificationRule(unitCode));
  const [templates, setTemplates] = useState<EmailTemplate[]>([]);
  const [groups, setGroups] = useState<NotificationReceiverGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadError, setLoadError] = useState("");
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let active = true;
    Promise.all([listEmailTemplates({ unitCode, includeInactive: false, limit: 500 }), listNotificationReceiverGroups(), isEdit ? listNotificationRules({ unitCode, includeInactive: true, limit: 500 }) : Promise.resolve([] as NotificationRule[])])
      .then(([templateRows, groupRows, ruleRows]) => {
        if (!active) return;
        setLoadError("");
        setTemplates(templateRows); setGroups(groupRows.filter((group) => group.isActive !== false));
        if (isEdit) { const rule = ruleRows.find((item) => item.notificationRuleCode === notificationRuleCode); if (!rule) throw new Error(t("pages.notificationRules.editor.notFound")); setValues(toPayload(rule)); }
      })
      .catch((error) => { if (active) setLoadError(error instanceof Error ? error.message : t("pages.notificationRules.errors.load")); })
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [isEdit, notificationRuleCode, retryCount, t, unitCode]);

  const update = <K extends keyof NotificationRulePayload>(key: K, value: NotificationRulePayload[K]) => setValues((current) => ({ ...current, [key]: value }));
  function setAction(action: string) { setValues((current) => ({ ...current, action_code: action, template_type: action, email_template_code: null, trigger_rules: action === "SEND_REQUEST" ? { trigger: "MANUAL_SEND" } : action === "DUE_DATE_REMINDER" ? { trigger: "ON_DUE_DATE" } : action.includes("REMINDER") ? { trigger: "DAYS_BEFORE_DUE", daysBeforeDue: 7 } : action === "OVERDUE_ALERT" || action === "ESCALATION" ? { trigger: "DAYS_AFTER_DUE", daysAfterDue: action === "ESCALATION" ? 7 : 1 } : { trigger: "ON_STATUS_CHANGE" } })); }
  function setReceiver(bucket: typeof RECEIVER_BUCKETS[number], code: string, selected: boolean) { setValues((current) => { const existing = current.receiver_rules[bucket] ?? []; return { ...current, receiver_rules: { ...current.receiver_rules, [bucket]: selected ? Array.from(new Set([...existing, code])) : existing.filter((item) => item !== code) } }; }); }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!values.rule_name.trim()) { toast.error(t("pages.notificationRules.errors.required")); return; }
    setIsSubmitting(true);
    try { await saveNotificationRule(notificationRuleCode, values); toast.success(t(isEdit ? "pages.notificationRules.notifications.updated" : "pages.notificationRules.notifications.created")); navigate(RULES_PATH, { replace: true }); }
    catch (error) { toast.error(t("pages.notificationRules.errors.save"), { description: error instanceof Error ? error.message : undefined }); }
    finally { setIsSubmitting(false); }
  }

  return <PageSection className="flex min-w-0 flex-col gap-4">
    <div className="mx-auto flex w-full max-w-xl flex-col gap-3"><Button className="w-fit" variant="outline" type="button" onPress={() => navigate(RULES_PATH)}><ArrowLeft data-icon="inline-start" aria-hidden="true" />{t("pages.notificationRules.editor.back")}</Button><PageHeader><div><h2>{t(isEdit ? "pages.notificationRules.editor.editTitle" : "pages.notificationRules.editor.createTitle")}</h2><p>{t(isEdit ? "pages.notificationRules.editor.editDescription" : "pages.notificationRules.editor.createDescription")}</p></div></PageHeader></div>
    {isLoading ? <Loader text={t("pages.notificationRules.loading")} /> : loadError ? <Alert variant="destructive" className="mx-auto max-w-xl"><AlertTitle>{loadError}</AlertTitle><Button variant="outline" onPress={() => { setIsLoading(true); setRetryCount((count) => count + 1); }}>{t("fileUpload.retry")}</Button></Alert> : <form className="mx-auto w-full max-w-xl" onSubmit={submit}>
      <Card><CardHeader className="sr-only"><CardTitle>{t(isEdit ? "pages.notificationRules.editor.editTitle" : "pages.notificationRules.editor.createTitle")}</CardTitle><CardDescription>{t("pages.notificationRules.editor.formDescription")}</CardDescription></CardHeader>
        <CardContent className="flex flex-col gap-5"><FieldGroup>
          <Field className="gap-1"><FieldLabel htmlFor="rule-name">{t("pages.notificationRules.fields.name")}</FieldLabel><Input id="rule-name" autoFocus required disabled={isSubmitting} value={values.rule_name} onChange={(event) => update("rule_name", event.target.value)} /></Field>
          <Field className="gap-1"><FieldLabel>{t("pages.notificationRules.fields.action")}</FieldLabel><Select aria-label={t("pages.notificationRules.fields.action")} selectedKey={values.action_code} isDisabled={isSubmitting} onSelectionChange={(key) => setAction(String(key))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectGroup>{ACTIONS.map((action) => <SelectItem id={action} key={action}>{t(`pages.emailTemplates.types.${action}`)}</SelectItem>)}</SelectGroup></SelectContent></Select></Field>
          <Field className="gap-1"><FieldLabel>{t("pages.notificationRules.fields.template")}</FieldLabel><Select aria-label={t("pages.notificationRules.fields.template")} selectedKey={values.email_template_code ?? "DEFAULT"} isDisabled={isSubmitting} onSelectionChange={(key) => update("email_template_code", key === "DEFAULT" ? null : String(key))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent className="w-max max-w-[calc(100vw-2rem)]"><SelectGroup><SelectItem id="DEFAULT">{t("pages.notificationRules.defaultTemplate")}</SelectItem>{templates.filter((template) => template.templateType === values.template_type).map((template) => <SelectItem id={template.emailTemplateCode ?? ""} key={template.emailTemplateCode}>{template.templateName}</SelectItem>)}</SelectGroup></SelectContent></Select></Field>
          <Field className="gap-1"><FieldLabel htmlFor="approval-level">{t("pages.notificationRules.fields.approvalLevel")}</FieldLabel><Input id="approval-level" type="number" min={1} disabled={isSubmitting} value={values.approval_level ?? ""} onChange={(event) => update("approval_level", event.target.value ? Number(event.target.value) : null)} /><FieldDescription>{t("pages.notificationRules.editor.approvalHelp")}</FieldDescription></Field>
          <Field className="gap-1"><FieldLabel>{t("pages.notificationRules.fields.senderType")}</FieldLabel><Select aria-label={t("pages.notificationRules.fields.senderType")} selectedKey={values.sender_type} isDisabled={isSubmitting} onSelectionChange={(key) => update("sender_type", String(key))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectGroup>{SENDER_TYPES.map((sender) => <SelectItem id={sender} key={sender}>{t(`pages.notificationRules.senders.${sender}`)}</SelectItem>)}</SelectGroup></SelectContent></Select></Field>
          <Field className="gap-1"><FieldLabel htmlFor="sender-email">{t("pages.notificationRules.fields.senderEmail")}</FieldLabel><Input id="sender-email" type="email" disabled={isSubmitting || values.sender_type !== "CUSTOM_EMAIL"} required={values.sender_type === "CUSTOM_EMAIL"} value={values.sender_email ?? ""} onChange={(event) => update("sender_email", event.target.value || null)} /><FieldDescription>{t("pages.notificationRules.editor.senderHelp")}</FieldDescription></Field>
        </FieldGroup>
        <FieldSet><FieldLegend>{t("pages.notificationRules.fields.receivers")}</FieldLegend>
        {!groups.length && <Empty><EmptyHeader><EmptyTitle>{t("receiverGroups.emptyTitle")}</EmptyTitle><EmptyDescription>{t("receiverGroups.emptyDescription")}</EmptyDescription></EmptyHeader></Empty>}
        <CustomTabs
        defaultValue="to"
        compact
        ariaLabel={t("pages.notificationRules.fields.receivers")}
        items={RECEIVER_BUCKETS.map((bucket) => ({ value: bucket, label: t(`pages.notificationRules.buckets.${bucket}`), content: (<><FieldGroup>{groups.map((group) => { const code = group.receiverGroupCode ?? ""; return <FieldLabel key={`${bucket}-${code}`}><Field orientation="horizontal"><Checkbox isDisabled={isSubmitting} isSelected={(values.receiver_rules[bucket] ?? []).includes(code)} onChange={(selected) => setReceiver(bucket, code, selected)} /><FieldContent><FieldTitle>{group.groupName ?? code}</FieldTitle>{group.description ? <FieldDescription>{group.description}</FieldDescription> : null}</FieldContent></Field></FieldLabel>; })}</FieldGroup></>) }))}
      /></FieldSet>
        <FieldGroup><FieldLabel><Field orientation="horizontal"><Checkbox isDisabled={isSubmitting} isSelected={values.is_active} onChange={(selected) => update("is_active", selected)} /><FieldContent><FieldTitle>{t("pages.notificationRules.active")}</FieldTitle><FieldDescription>{t("pages.notificationRules.editor.activeHelp")}</FieldDescription></FieldContent></Field></FieldLabel></FieldGroup>
        </CardContent><CardFooter className="justify-end gap-2 border-t"><Button variant="outline" type="button" isDisabled={isSubmitting} onPress={() => navigate(RULES_PATH)}>{t("pages.notificationRules.cancel")}</Button><Button type="submit" isDisabled={isSubmitting}>{isSubmitting ? <Spinner data-icon="inline-start" aria-hidden="true" /> : <Save data-icon="inline-start" aria-hidden="true" />}{t(isSubmitting ? "pages.notificationRules.saving" : "pages.notificationRules.save")}</Button></CardFooter>
      </Card>
    </form>}
  </PageSection>;
}
