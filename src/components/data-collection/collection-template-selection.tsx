import type {
  CreateTemplateDispatchPayload,
  DispatchRecipient,
  TemplateDispatchComposeContext,
  TemplateDispatchComposeOrganization,
} from "@/api/template-workflow.api";
import type { TemplateRepositoryItem } from "@/api/templates.api";
import { getSelectedLocale } from "@/api/session.api";
import type { EmailRecipient } from "@/components/common/email-recipient";
import { Loader } from "@/components/common/loader";
import {
  CollectionTemplateEmailForm,
  type TemplateEmailFormValues,
} from "@/components/data-collection/collection-template-email-form";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
  ComboboxSeparator,
} from "@/components/ui/combobox";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { useTemplateRepositoryItems } from "@/hooks/use-template-repository";
import { useComposeContext, useCreateWorkflowDispatch } from "@/hooks/use-template-workflow";
import { cn } from "@/lib/utils";
import { IconAlertTriangle, IconEye, IconFileSpreadsheet, IconRefresh, IconX } from "@tabler/icons-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";

const TEMPLATE_BATCH_SIZE = 25;
const EMPTY_EMAIL_ADDRESSES: string[] = [];

type CollectionTemplateSelectionProps = {
  collectionName: string;
  collectionCode: string;
  unitCode: string;
  yearPeriod: string;
  scheduleStartDate?: string | null;
  dueDate?: string | null;
  presentation?: "card" | "pane";
  selectedTemplateId: string;
  onSelectionChange: (templateId: string) => void;
  onPreview: (templateId: string) => void;
  onCancel: () => void;
  onDispatchPendingChange?: (isPending: boolean) => void;
};

export function CollectionTemplateSelection({
  collectionName,
  collectionCode,
  unitCode,
  yearPeriod,
  scheduleStartDate,
  dueDate,
  presentation = "card",
  selectedTemplateId,
  onSelectionChange,
  onPreview,
  onCancel,
  onDispatchPendingChange,
}: CollectionTemplateSelectionProps) {
  const { t, i18n } = useTranslation(["ingestion", "common"]);
  const [searchText, setSearchText] = useState("");
  const [visibleCount, setVisibleCount] = useState(TEMPLATE_BATCH_SIZE);
  const [selectedTemplateSnapshot, setSelectedTemplateSnapshot] =
    useState<TemplateRepositoryItem | null>(null);
  const debouncedSearchText = useDebouncedValue(searchText, 300);
  const templatesQuery = useTemplateRepositoryItems({ searchText: debouncedSearchText });
  const allTemplates = templatesQuery.data ?? [];
  const templates = allTemplates.slice(0, visibleCount);
  const selectedTemplate = allTemplates.find((template) => template.id === selectedTemplateId)
    ?? (selectedTemplateSnapshot?.id === selectedTemplateId ? selectedTemplateSnapshot : null);
  const selectedTemplateVersionId = selectedTemplate?.latest_version?.id;
  const composeContextQuery = useComposeContext(
    selectedTemplate?.id,
    selectedTemplateVersionId,
    getSelectedLocale(),
  );
  const createDispatchMutation = useCreateWorkflowDispatch();
  const dispatchInFlight = useRef(false);
  const dispatchAttempt = useRef<{ fingerprint: string; requestId: string } | null>(null);

  useEffect(() => {
    onDispatchPendingChange?.(createDispatchMutation.isPending);
  }, [createDispatchMutation.isPending, onDispatchPendingChange]);

  useEffect(() => () => onDispatchPendingChange?.(false), [onDispatchPendingChange]);
  const composeDefaults = useMemo(() => {
    const context = composeContextQuery.data;
    const organizations = context?.organizations ?? [];
    const officers = organizations.flatMap((organization) => organization.officers ?? []);
    const officerNames = uniqueTextValues(officers.map((officer) => officer.displayName ?? ""));
    const ministries = uniqueTextValues(organizations
      .filter((organization) => organization.organizationType === "MINISTRY")
      .map((organization) => organization.organizationName ?? ""));
    const departments = uniqueTextValues(organizations
      .filter((organization) => organization.organizationType !== "MINISTRY")
      .map((organization) => organization.organizationName ?? ""));
    const indicatorNumbers = uniqueTextValues(
      (context?.indicators ?? []).map((indicator) => indicator.indicatorNumber ?? indicator.indicatorCode ?? ""),
    );
    const indicatorNames = uniqueTextValues(
      (context?.indicators ?? []).map((indicator) => indicator.indicatorName ?? ""),
    );
    const values = {
      officer_name: officerNames.length === 1 ? officerNames[0] : undefined,
      template_name: context?.templateName ?? selectedTemplate?.template_name,
      indicator_number: indicatorNumbers.length ? indicatorNumbers.join(", ") : undefined,
      indicator_name: indicatorNames.length ? indicatorNames.join(", ") : undefined,
      request_period: collectionName || yearPeriod,
      ministry: ministries.length ? ministries.join(", ") : undefined,
      department: departments.length
        ? `${ministries.length ? " / " : ""}${departments.join(", ")}`
        : undefined,
      due_date: formatNotificationDate(dueDate, i18n.resolvedLanguage ?? i18n.language),
    };
    return {
      to: uniqueEmailAddresses(organizations.flatMap((organization) => organization.suggestedTo ?? [])),
      cc: uniqueEmailAddresses(organizations.flatMap((organization) => organization.suggestedCc ?? [])),
      bcc: uniqueEmailAddresses(organizations.flatMap((organization) => organization.suggestedBcc ?? [])),
      subject: resolveNotificationVariables(context?.notification?.subject, values),
      message: context?.notification?.body,
      variableValues: values,
    };
  }, [
    collectionName,
    composeContextQuery.data,
    dueDate,
    i18n.language,
    i18n.resolvedLanguage,
    selectedTemplate?.template_name,
    yearPeriod,
  ]);
  const isInitialLoading = templatesQuery.isPending;
  const isUpdating = templatesQuery.isFetching && !isInitialLoading;
  const loadError = templatesQuery.error instanceof Error
    ? templatesQuery.error.message
    : templatesQuery.error ? t("ingestion:templates.loadError") : "";

  const clearSelection = () => {
    setSelectedTemplateSnapshot(null);
    setSearchText("");
    setVisibleCount(TEMPLATE_BATCH_SIZE);
    onSelectionChange("");
  };
  const selectionHeading = (
    <>
      <CardTitle>{t("ingestion:dataCollection.sendTemplate.routeTitle")}</CardTitle>
      <CardDescription>
        {t("ingestion:dataCollection.sendTemplate.formDescription", {
          collection: collectionName,
          yearPeriod,
        })}
      </CardDescription>
    </>
  );

  async function sendDispatch(values: TemplateEmailFormValues) {
    if (dispatchInFlight.current) return;
    const context = composeContextQuery.data;
    if (!selectedTemplate || !selectedTemplateVersionId || !context) return;

    dispatchInFlight.current = true;
    try {
      if (context.templateId !== selectedTemplate.id || context.templateVersionId !== selectedTemplateVersionId) {
        throw new Error(t("ingestion:dataCollection.sendTemplate.email.defaultsErrorDescription"));
      }
      const recipients = buildDispatchRecipients(context, values);
      if (!recipients.length) {
        toast.error(t("ingestion:dataCollection.sendTemplate.email.noMappedRecipients"));
        return;
      }

      const payload: CreateTemplateDispatchPayload = {
          template_id: context.templateId,
          template_version_id: context.templateVersionId,
          plan_name: context.dispatchDefaults?.planName,
          unit_code: unitCode,
          request_period_code: collectionCode,
          year_period: yearPeriod,
          schedule_start_date: scheduleStartDate ?? undefined,
          due_date: dueDate ?? undefined,
          recipients,
          dispatch_mode: "PROVIDER",
          notification: {
            subject: values.subject.trim(),
            body: values.message.trim(),
          },
      };
      // Reuse the request identity when retrying the same dispatch after an uncertain response.
      const fingerprint = JSON.stringify(payload);
      if (dispatchAttempt.current?.fingerprint !== fingerprint) {
        dispatchAttempt.current = { fingerprint, requestId: crypto.randomUUID() };
      }
      await createDispatchMutation.mutateAsync({
        locale: getSelectedLocale(),
        payload: { ...payload, client_request_id: dispatchAttempt.current.requestId },
      });

      const recipientCount = values.to.length + values.cc.length + values.bcc.length;
      toast.success(t("ingestion:dataCollection.sendTemplate.email.successTitle"), {
        description: t("ingestion:dataCollection.sendTemplate.email.successDescription", {
          count: recipientCount,
        }),
      });
      onCancel();
    } catch (error) {
      toast.error(t("ingestion:dataCollection.sendTemplate.email.sendErrorTitle"), {
        description: error instanceof Error
          ? error.message
          : t("ingestion:dataCollection.sendTemplate.email.sendErrorDescription"),
      });
    } finally {
      dispatchInFlight.current = false;
    }
  }

  return (
    <Card
      className={cn(
        "w-full",
        presentation === "pane"
          && "min-h-0 flex-1 gap-0 overflow-hidden rounded-none bg-transparent py-0 ring-0",
      )}
    >
      {presentation !== "pane" || !selectedTemplate ? (
        <CardHeader className={cn(presentation === "pane" && "shrink-0 py-4")}>
          {selectionHeading}
        </CardHeader>
      ) : null}

      <CardContent className={cn(
        presentation === "pane" && "flex min-h-0 flex-1 flex-col overflow-hidden px-0",
      )}>
        {isInitialLoading ? (
          <Loader className="min-h-40" text={t("ingestion:dataCollection.sendTemplate.table.loading")} />
        ) : loadError ? (
          <Alert variant="destructive">
            <IconAlertTriangle aria-hidden="true" />
            <AlertTitle>{t("ingestion:templates.loadError")}</AlertTitle>
            <AlertDescription className="flex flex-wrap items-center justify-between gap-2">
              <span>{loadError}</span>
              <Button type="button" variant="outline" size="sm" onPress={() => void templatesQuery.refetch()}>
                <IconRefresh data-icon="inline-start" aria-hidden="true" />
                {t("common:actions.retry")}
              </Button>
            </AlertDescription>
          </Alert>
        ) : (
          <FieldGroup className={cn(presentation === "pane" && "min-h-0 flex-1 gap-3")}>
            {selectedTemplate && (!selectedTemplateVersionId || composeContextQuery.isError) ? (
              <Alert variant="destructive">
                <IconAlertTriangle aria-hidden="true" />
                <AlertTitle>{t("ingestion:dataCollection.sendTemplate.email.defaultsErrorTitle")}</AlertTitle>
                <AlertDescription className="flex flex-wrap items-center justify-between gap-2">
                  <span>
                    {composeContextQuery.error instanceof Error
                      ? composeContextQuery.error.message
                      : t("ingestion:dataCollection.sendTemplate.email.defaultsErrorDescription")}
                  </span>
                  {selectedTemplateVersionId ? (
                    <Button type="button" variant="outline" size="sm" onPress={() => void composeContextQuery.refetch()}>
                      <IconRefresh data-icon="inline-start" aria-hidden="true" />
                      {t("common:actions.retry")}
                    </Button>
                  ) : null}
                </AlertDescription>
              </Alert>
            ) : selectedTemplate ? (
              <CollectionTemplateEmailForm
                collectionName={collectionName}
                templateKey={selectedTemplateVersionId ?? selectedTemplate.id}
                templateName={selectedTemplate.template_name}
                defaultSubject={composeDefaults.subject}
                defaultMessage={composeDefaults.message}
                variableValues={composeDefaults.variableValues}
                toEmailAddresses={composeDefaults.to}
                ccEmailAddresses={composeDefaults.cc}
                bccEmailAddresses={composeDefaults.bcc}
                isTemplateSelected
                isTemplateLoading={composeContextQuery.isPending}
                presentation={presentation}
                leadingContent={(
                  <>
                    {presentation === "pane" ? (
                      <CardHeader className="px-0">
                        {selectionHeading}
                      </CardHeader>
                    ) : null}
                    <FieldTitle>
                      {t("ingestion:dataCollection.sendTemplate.combobox.selectedLabel")}
                    </FieldTitle>
                    <div className={cn(
                      "min-w-0",
                      presentation === "pane"
                        && "sticky top-0 z-10 -mx-(--card-spacing) bg-background px-(--card-spacing) pb-2",
                    )}>
                      <Field orientation="horizontal" className="min-h-14 min-w-0 overflow-hidden rounded-lg bg-muted/60 p-2.5">
                        <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
                          {composeContextQuery.isPending ? (
                            <Spinner
                              className="shrink-0"
                              aria-label={t("ingestion:dataCollection.sendTemplate.email.loadingDefaults")}
                            />
                          ) : (
                            <IconFileSpreadsheet className="shrink-0 text-muted-foreground" aria-hidden="true" />
                          )}
                          <FieldContent className="min-w-0 overflow-hidden">
                            <FieldTitle className="block min-w-0 max-w-full truncate" title={selectedTemplate.template_name}>
                              {selectedTemplate.template_name}
                            </FieldTitle>
                          </FieldContent>
                        </div>
                        <div className="flex shrink-0 items-center gap-1">
                          <Button
                            className="shrink-0"
                            type="button"
                            size="sm"
                            onPress={() => onPreview(selectedTemplate.id)}
                          >
                            <IconEye data-icon="inline-start" aria-hidden="true" />
                            {t("ingestion:dataCollection.sendTemplate.table.preview")}
                          </Button>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon-sm"
                            aria-label={t("ingestion:dataCollection.sendTemplate.combobox.removeSelection")}
                            onPress={clearSelection}
                          >
                            <IconX aria-hidden="true" />
                          </Button>
                        </div>
                      </Field>
                    </div>
                  </>
                )}
                onCancel={onCancel}
                onSubmit={sendDispatch}
              />
            ) : (
              <CollectionTemplateEmailForm
                collectionName={collectionName}
                templateKey=""
                templateName=""
                toEmailAddresses={EMPTY_EMAIL_ADDRESSES}
                ccEmailAddresses={EMPTY_EMAIL_ADDRESSES}
                bccEmailAddresses={EMPTY_EMAIL_ADDRESSES}
                isTemplateSelected={false}
                isTemplateLoading={false}
                presentation={presentation}
                leadingContent={(
                  <>
                    <Field>
                <FieldLabel htmlFor="collection-template-combobox">
                  {t("ingestion:dataCollection.sendTemplate.combobox.label")}
                </FieldLabel>
                <Combobox
                  items={templates}
                  inputValue={searchText}
                  menuTrigger="focus"
                  allowsEmptyCollection
                  onInputChange={(value) => {
                    setSearchText(value);
                    setVisibleCount(TEMPLATE_BATCH_SIZE);
                  }}
                  onSelectionChange={(key) => {
                    const templateId = key === null ? "" : String(key);
                    const template = templates.find((item) => item.id === templateId) ?? null;
                    setSelectedTemplateSnapshot(template);
                    onSelectionChange(templateId);
                  }}
                >
                  <ComboboxInput
                    id="collection-template-combobox"
                    className="w-full"
                    placeholder={t("ingestion:dataCollection.sendTemplate.combobox.placeholder")}
                    showClear
                  />
                  <ComboboxContent>
                    {templates.length ? (
                      <ComboboxList className="max-h-60" items={templates}>
                        {(template) => (
                          <ComboboxItem id={template.id} textValue={template.template_name}>
                            <span className="min-w-0 flex-1 truncate pr-5 font-medium" title={template.template_name}>
                              {template.template_name}
                            </span>
                          </ComboboxItem>
                        )}
                      </ComboboxList>
                    ) : (
                      <ComboboxEmpty className="flex">
                        {searchText.trim()
                          ? t("ingestion:dataCollection.sendTemplate.table.noResults")
                          : t("ingestion:dataCollection.sendTemplate.table.empty")}
                      </ComboboxEmpty>
                    )}

                    {visibleCount < allTemplates.length ? (
                      <>
                        <ComboboxSeparator />
                        <div className="p-1">
                          <Button
                            className="w-full"
                            type="button"
                            variant="ghost"
                            size="sm"
                            onPress={() => setVisibleCount((count) => count + TEMPLATE_BATCH_SIZE)}
                          >
                            {t("ingestion:dataCollection.sendTemplate.combobox.loadMore")}
                          </Button>
                        </div>
                      </>
                    ) : null}
                  </ComboboxContent>
                </Combobox>
                {isUpdating ? (
                  <FieldDescription className="inline-flex items-center gap-1.5" role="status">
                    <Spinner />
                    {t("ingestion:dataCollection.sendTemplate.table.updating")}
                  </FieldDescription>
                ) : null}
                    </Field>
                  </>
                )}
                onCancel={onCancel}
                onSubmit={sendDispatch}
              />
            )}
          </FieldGroup>
        )}
      </CardContent>
    </Card>
  );
}

function uniqueEmailAddresses(addresses: string[]) {
  const uniqueAddresses = new Map<string, string>();
  addresses.forEach((address) => {
    const trimmedAddress = address.trim();
    if (trimmedAddress) uniqueAddresses.set(trimmedAddress.toLocaleLowerCase(), trimmedAddress);
  });
  return [...uniqueAddresses.values()];
}

function uniqueTextValues(values: string[]) {
  const uniqueValues = new Map<string, string>();
  values.forEach((value) => {
    const trimmedValue = value.trim();
    if (trimmedValue) uniqueValues.set(trimmedValue.toLocaleLowerCase(), trimmedValue);
  });
  return [...uniqueValues.values()];
}

function resolveNotificationVariables(
  template: string | undefined,
  values: Record<string, string | undefined>,
) {
  if (!template) return undefined;
  return template.replace(/\{([a-z0-9_]+)\}/gi, (token, variable: string) => (
    values[variable] || token
  ));
}

function formatNotificationDate(value: string | null | undefined, locale: string) {
  if (!value) return undefined;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale, { dateStyle: "medium" }).format(date);
}

function buildDispatchRecipients(
  context: TemplateDispatchComposeContext,
  values: TemplateEmailFormValues,
): DispatchRecipient[] {
  const organizations = context.organizations;
  const activeOrganizations = organizations.filter((organization) => (
    values.to.some((recipient) => organizationOwnsRecipient(organization, recipient))
  ));

  if (!activeOrganizations.length) return [];

  const ownedEmails = new Set(organizations.flatMap(organizationEmailAddresses));
  return activeOrganizations.map((organization) => ({
    recipient_key: organization.organizationCode || organization.organizationId,
    source_organization_id: organization.organizationId,
    source_organization_code: organization.organizationCode || organization.organizationId,
    source_name: organization.organizationName || organization.organizationCode || organization.organizationId,
    to: emailsForOrganization(organization, values.to, ownedEmails),
    cc: emailsForOrganization(organization, values.cc, ownedEmails),
    bcc: emailsForOrganization(organization, values.bcc, ownedEmails),
    indicator_code: null,
    measure_codes: [],
  })).filter((recipient) => recipient.to.length > 0);
}

function emailsForOrganization(
  organization: TemplateDispatchComposeOrganization,
  recipients: EmailRecipient[],
  ownedEmails: Set<string>,
) {
  return recipients
    .filter((recipient) => (
      organizationOwnsRecipient(organization, recipient)
      || !ownedEmails.has(normalizeEmail(recipient.email))
    ))
    .map((recipient) => recipient.email);
}

function organizationOwnsRecipient(
  organization: TemplateDispatchComposeOrganization,
  recipient: EmailRecipient,
) {
  if (
    recipient.organizationCode
    && recipient.organizationCode === organization.organizationCode
  ) return true;

  const organizationEmails = new Set(organizationEmailAddresses(organization));
  return organizationEmails.has(normalizeEmail(recipient.email));
}

function organizationEmailAddresses(organization: TemplateDispatchComposeOrganization) {
  return [
    ...(organization.suggestedTo ?? []),
    ...(organization.suggestedCc ?? []),
    ...(organization.suggestedBcc ?? []),
    ...(organization.officers ?? []).map((officer) => officer.email),
  ].map(normalizeEmail);
}

function normalizeEmail(email: string) {
  return email.trim().toLocaleLowerCase();
}
