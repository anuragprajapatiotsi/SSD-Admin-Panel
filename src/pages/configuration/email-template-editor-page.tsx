import { PageSection, PageHeader } from "@/components/common/page-layout";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldTitle } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Braces, Save } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";

import { createDefaultEmailTemplate, type EmailTemplate, type EmailTemplatePayload, listEmailTemplates, saveEmailTemplate } from "../../api/requests.api";
import { getSelectedUnitCode } from "../../api/session.api";

const EMAIL_TEMPLATES_PATH = "/configuration/email-templates";
const TEMPLATE_TYPES = ["SEND_REQUEST", "FIRST_REMINDER", "DUE_DATE_REMINDER", "OVERDUE_ALERT", "ESCALATION", "SUBMITTED_FOR_REVIEW", "REVIEW_APPROVED", "REVIEW_REJECTED", "RESENT_FOR_SUBMISSION", "RESUBMITTED_FOR_REVIEW", "PUBLISHED"];
const SCOPES = ["GLOBAL", "TEMPLATE", "SOURCE"];
const AVAILABLE_VARIABLES = ["officer_name", "template_name", "template_code", "indicator_number", "indicator_name", "ministry", "department", "request_period", "reporting_period", "due_date", "submission_link"];

function emptyValues(): EmailTemplatePayload {
  return { ...createDefaultEmailTemplate(getSelectedUnitCode()), template_name: "", subject: "", body: "", variables: [], is_default: false };
}

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

export function EmailTemplateEditorPage() {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const { emailTemplateCode } = useParams();
  const isEdit = Boolean(emailTemplateCode);
  const [values, setValues] = useState<EmailTemplatePayload>(emptyValues);
  const [isLoading, setIsLoading] = useState(isEdit);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (!isEdit || !emailTemplateCode) return;
    let active = true;
    listEmailTemplates({ unitCode: getSelectedUnitCode(), includeInactive: true, limit: 500 })
      .then((templates) => {
        if (!active) return;
        const template = templates.find((item) => item.emailTemplateCode === emailTemplateCode);
        if (!template) throw new Error(t("pages.emailTemplates.editor.notFound"));
        setValues(toPayload(template));
      })
      .catch((error) => toast.error(t("pages.emailTemplates.errors.load"), { description: error instanceof Error ? error.message : undefined }))
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [emailTemplateCode, isEdit, t]);

  const update = <K extends keyof EmailTemplatePayload>(key: K, value: EmailTemplatePayload[K]) => setValues((current) => ({ ...current, [key]: value }));

  function updateScope(scope: string) {
    setValues((current) => ({ ...current, scope_type: scope, template_version_code: scope === "TEMPLATE" ? current.template_version_code ?? "" : null, source_organization_code: scope === "SOURCE" ? current.source_organization_code ?? "" : null }));
  }

  function insertVariable(variable: string) {
    const separator = values.body && !values.body.endsWith(" ") && !values.body.endsWith("\n") ? " " : "";
    setValues((current) => ({ ...current, body: `${current.body}${separator}{${variable}}`, variables: Array.from(new Set([...current.variables, variable])) }));
  }

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!values.template_name.trim() || !values.subject.trim() || !values.body.trim()) {
      toast.error(t("pages.emailTemplates.errors.required")); return;
    }
    if (values.scope_type === "TEMPLATE" && !values.template_version_code?.trim()) {
      toast.error(t("pages.emailTemplates.errors.versionRequired")); return;
    }
    if (values.scope_type === "SOURCE" && !values.source_organization_code?.trim()) {
      toast.error(t("pages.emailTemplates.errors.sourceRequired")); return;
    }
    setIsSubmitting(true);
    try {
      await saveEmailTemplate(emailTemplateCode, { ...values, template_version_code: values.scope_type === "TEMPLATE" ? values.template_version_code : null, source_organization_code: values.scope_type === "SOURCE" ? values.source_organization_code : null });
      toast.success(t(isEdit ? "pages.emailTemplates.notifications.updated" : "pages.emailTemplates.notifications.created"));
      navigate(EMAIL_TEMPLATES_PATH, { replace: true });
    } catch (error) {
      toast.error(t("pages.emailTemplates.errors.save"), { description: error instanceof Error ? error.message : undefined });
    } finally { setIsSubmitting(false); }
  }

  return (
    <PageSection className="flex min-w-0 flex-col gap-4">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-3">
        <Button className="w-fit" type="button" variant="outline" onPress={() => navigate(EMAIL_TEMPLATES_PATH)}><ArrowLeft data-icon="inline-start" aria-hidden="true" />{t("pages.emailTemplates.editor.back")}</Button>
        <PageHeader><div><h2>{t(isEdit ? "pages.emailTemplates.editor.editTitle" : "pages.emailTemplates.editor.createTitle")}</h2><p>{t(isEdit ? "pages.emailTemplates.editor.editDescription" : "pages.emailTemplates.editor.createDescription")}</p></div></PageHeader>
      </div>

      {isLoading ? <div className="mx-auto flex w-full max-w-xl items-center justify-center gap-2 py-10 text-muted-foreground" role="status"><Spinner />{t("pages.emailTemplates.editor.loading")}</div> : (
        <form className="mx-auto w-full max-w-xl" onSubmit={submit}>
          <Card>
            <CardHeader className="sr-only"><CardTitle>{t(isEdit ? "pages.emailTemplates.editor.editTitle" : "pages.emailTemplates.editor.createTitle")}</CardTitle><CardDescription>{t("pages.emailTemplates.editor.detailsDescription")}</CardDescription></CardHeader>
            <CardContent className="flex flex-col gap-5"><FieldGroup>
              <Field className="gap-1"><FieldLabel htmlFor="email-template-name">{t("pages.emailTemplates.form.name")}</FieldLabel><Input id="email-template-name" autoFocus required disabled={isSubmitting} value={values.template_name} onChange={(event) => update("template_name", event.target.value)} /></Field>
              <Field className="gap-1"><FieldLabel htmlFor="email-template-code">{t("pages.emailTemplates.form.code")}</FieldLabel><Input id="email-template-code" readOnly={isEdit} disabled={isSubmitting} value={values.email_template_code ?? ""} onChange={(event) => update("email_template_code", event.target.value)} placeholder={t("pages.emailTemplates.form.codePlaceholder")} /><FieldDescription>{t(isEdit ? "pages.emailTemplates.editor.codeEditHelp" : "pages.emailTemplates.editor.codeHelp")}</FieldDescription></Field>
              <Field className="gap-1"><FieldLabel>{t("pages.emailTemplates.form.type")}</FieldLabel><Select aria-label={t("pages.emailTemplates.form.type")} selectedKey={values.template_type} isDisabled={isSubmitting} onSelectionChange={(key) => update("template_type", String(key))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectGroup>{TEMPLATE_TYPES.map((type) => <SelectItem key={type} id={type}>{t(`pages.emailTemplates.types.${type}`)}</SelectItem>)}</SelectGroup></SelectContent></Select></Field>
              <Field className="gap-1"><FieldLabel>{t("pages.emailTemplates.form.scope")}</FieldLabel><Select aria-label={t("pages.emailTemplates.form.scope")} selectedKey={values.scope_type} isDisabled={isSubmitting} onSelectionChange={(key) => updateScope(String(key))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectGroup>{SCOPES.map((scope) => <SelectItem key={scope} id={scope}>{t(`pages.emailTemplates.scopes.${scope}`)}</SelectItem>)}</SelectGroup></SelectContent></Select></Field>
              {values.scope_type === "TEMPLATE" ? <Field><FieldLabel htmlFor="email-template-version">{t("pages.emailTemplates.form.versionCode")}</FieldLabel><Input id="email-template-version" required disabled={isSubmitting} value={values.template_version_code ?? ""} onChange={(event) => update("template_version_code", event.target.value)} /></Field> : null}
              {values.scope_type === "SOURCE" ? <Field><FieldLabel htmlFor="email-template-source">{t("pages.emailTemplates.form.sourceCode")}</FieldLabel><Input id="email-template-source" required disabled={isSubmitting} value={values.source_organization_code ?? ""} onChange={(event) => update("source_organization_code", event.target.value)} /></Field> : null}
              <Field className="gap-1"><FieldLabel htmlFor="email-template-subject">{t("pages.emailTemplates.form.subject")}</FieldLabel><Input id="email-template-subject" required disabled={isSubmitting} value={values.subject} onChange={(event) => update("subject", event.target.value)} /></Field>
              <Field className="gap-1"><FieldLabel htmlFor="email-template-body">{t("pages.emailTemplates.form.body")}</FieldLabel><Textarea id="email-template-body" rows={8} required disabled={isSubmitting} value={values.body} onChange={(event) => update("body", event.target.value)} /></Field>
              <Field className="gap-1"><FieldLabel>{t("pages.emailTemplates.form.variables")}</FieldLabel><div className="flex flex-wrap gap-2" aria-label={t("pages.emailTemplates.form.variables")}>
                {AVAILABLE_VARIABLES.map((variable) => <Button key={variable} type="button" size="sm" variant="outline" isDisabled={isSubmitting} onPress={() => insertVariable(variable)}><Braces data-icon="inline-start" aria-hidden="true" />{variable}</Button>)}
              </div><FieldDescription>{t("pages.emailTemplates.form.variablesHelp")}</FieldDescription></Field>
            </FieldGroup>
            <FieldGroup>
                <FieldLabel><Field orientation="horizontal"><Checkbox isDisabled={isSubmitting} isSelected={Boolean(values.is_default)} onChange={(selected) => update("is_default", selected)} /><FieldContent><FieldTitle>{t("pages.emailTemplates.form.default")}</FieldTitle><FieldDescription>{t("pages.emailTemplates.editor.defaultHelp")}</FieldDescription></FieldContent></Field></FieldLabel>
                <FieldLabel><Field orientation="horizontal"><Checkbox isDisabled={isSubmitting} isSelected={values.is_active !== false} onChange={(selected) => update("is_active", selected)} /><FieldContent><FieldTitle>{t("pages.emailTemplates.active")}</FieldTitle><FieldDescription>{t("pages.emailTemplates.editor.activeHelp")}</FieldDescription></FieldContent></Field></FieldLabel>
            </FieldGroup></CardContent>
            <CardFooter className="justify-end gap-2 border-t"><Button type="button" variant="outline" isDisabled={isSubmitting} onPress={() => navigate(EMAIL_TEMPLATES_PATH)}>{t("pages.emailTemplates.cancel")}</Button><Button type="submit" isDisabled={isSubmitting}>{isSubmitting ? <Spinner data-icon="inline-start" aria-hidden="true" /> : <Save data-icon="inline-start" aria-hidden="true" />}{t(isSubmitting ? "pages.emailTemplates.saving" : "pages.emailTemplates.save")}</Button></CardFooter>
          </Card>
        </form>
      )}
    </PageSection>
  );
}
