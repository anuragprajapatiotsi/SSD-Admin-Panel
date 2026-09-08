import {
  createEmailRecipient,
  normalizeRecipientEmail,
  type EmailRecipient,
} from "@/components/common/email-recipient";
import { EmailRecipientInput } from "@/components/common/email-recipient-input";
import { VariableMessageInput } from "@/components/common/variable-message-input";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
} from "@/components/ui/input-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconMail, IconMessage, IconSend, IconTextCaption } from "@tabler/icons-react";
import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Controller, useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

type CollectionTemplateEmailFormProps = {
  collectionName: string;
  templateKey: string;
  templateName: string;
  defaultSubject?: string;
  defaultMessage?: string;
  variableValues?: Readonly<Record<string, string | undefined>>;
  toEmailAddresses: string[];
  ccEmailAddresses: string[];
  bccEmailAddresses: string[];
  isTemplateSelected: boolean;
  isTemplateLoading?: boolean;
  presentation?: "card" | "pane";
  leadingContent?: ReactNode;
  onCancel: () => void;
  onSubmit: (values: TemplateEmailFormValues) => Promise<void>;
};

export type TemplateEmailFormValues = {
  to: EmailRecipient[];
  cc: EmailRecipient[];
  bcc: EmailRecipient[];
  subject: string;
  message: string;
};

type RecipientFieldName = "to" | "cc" | "bcc";

const recipientFields: RecipientFieldName[] = ["to", "cc", "bcc"];
// Same supported tokens as the configured email-template editor.
const MESSAGE_VARIABLES = ["officer_name", "template_name", "template_code", "indicator_number", "indicator_name", "ministry", "department", "request_period", "reporting_period", "due_date", "submission_link"];

export function CollectionTemplateEmailForm({
  templateKey,
  templateName,
  defaultSubject,
  defaultMessage,
  variableValues,
  toEmailAddresses,
  ccEmailAddresses,
  bccEmailAddresses,
  isTemplateSelected,
  isTemplateLoading = false,
  presentation = "card",
  leadingContent,
  onCancel,
  onSubmit,
}: CollectionTemplateEmailFormProps) {
  const { t } = useTranslation("ingestion");
  const messageVariables = useMemo(() => [...new Set([
    ...MESSAGE_VARIABLES,
    ...Array.from((defaultMessage ?? "").matchAll(/\{([a-z0-9_]+)\}/gi), (match) => match[1]),
  ])], [defaultMessage]);
  const schema = useMemo(() => {
    const recipient = z.object({
      id: z.string().min(1),
      email: z.string().refine(
        (email) => z.email().safeParse(email).success,
        t("dataCollection.sendTemplate.email.validation.recipientInvalid"),
      ),
      displayName: z.string().optional(),
      designation: z.string().optional(),
      officerCode: z.string().optional(),
      organizationCode: z.string().optional(),
      origins: z.array(z.object({
        type: z.enum(["template", "officer", "manual"]),
        key: z.string().min(1),
      })).min(1),
    });
    const recipients = z.array(recipient);

    return z.object({
      to: recipients.min(1, t("dataCollection.sendTemplate.email.validation.toRequired")),
      cc: recipients,
      bcc: recipients,
      subject: z.string().trim().min(1, t("dataCollection.sendTemplate.email.validation.subjectRequired")),
      message: z.string().trim().min(1, t("dataCollection.sendTemplate.email.validation.messageRequired")),
    });
  }, [t]);
  const {
    control,
    formState: { errors, isSubmitted, isSubmitting },
    getValues,
    handleSubmit,
    register,
    setValue,
  } = useForm<TemplateEmailFormValues>({
    defaultValues: {
      to: [],
      cc: [],
      bcc: [],
      subject: defaultSubject ?? (templateName
        ? t("dataCollection.sendTemplate.email.defaultSubject", { template: templateName })
        : ""),
      message: defaultMessage ?? (templateName
        ? t("dataCollection.sendTemplate.email.defaultMessage", {
          collection: "{request_period}",
          template: "{template_name}",
        })
        : ""),
    },
    mode: "onSubmit",
    reValidateMode: "onChange",
    resolver: zodResolver(schema),
  });
  const [showCc, setShowCc] = useState(false);
  const [showBcc, setShowBcc] = useState(false);
  const previousGeneratedContent = useRef({ subject: "", message: "" });
  const [to = [], cc = [], bcc = []] = useWatch({
    control,
    name: ["to", "cc", "bcc"],
  });

  useEffect(() => {
    const templateRecipients: Record<RecipientFieldName, string[]> = {
      to: toEmailAddresses,
      cc: ccEmailAddresses,
      bcc: bccEmailAddresses,
    };

    recipientFields.forEach((fieldName) => {
      const currentRecipients = getValues(fieldName);
      const nextRecipients = synchronizeTemplateRecipients(
        currentRecipients,
        templateRecipients[fieldName],
        templateKey,
      );

      if (!recipientListsEqual(currentRecipients, nextRecipients)) {
        setValue(fieldName, nextRecipients, { shouldValidate: isSubmitted });
      }
    });

  }, [
    bccEmailAddresses,
    ccEmailAddresses,
    getValues,
    isSubmitted,
    setValue,
    templateKey,
    toEmailAddresses,
  ]);

  useEffect(() => {
    const nextGeneratedContent = {
      subject: defaultSubject ?? (templateName
        ? t("dataCollection.sendTemplate.email.defaultSubject", { template: templateName })
        : ""),
      message: defaultMessage ?? (templateName
        ? t("dataCollection.sendTemplate.email.defaultMessage", {
          collection: "{request_period}",
          template: "{template_name}",
        })
        : ""),
    };

    (["subject", "message"] as const).forEach((fieldName) => {
      const currentValue = getValues(fieldName);
      const previousValue = previousGeneratedContent.current[fieldName];

      if (!currentValue || currentValue === previousValue) {
        setValue(fieldName, nextGeneratedContent[fieldName], { shouldValidate: isSubmitted });
      }
    });

    previousGeneratedContent.current = nextGeneratedContent;
  }, [
    defaultMessage,
    defaultSubject,
    getValues,
    isSubmitted,
    setValue,
    t,
    templateName,
  ]);

  async function submitEmail(values: TemplateEmailFormValues) {
    await onSubmit(values);
  }

  const isCcVisible = showCc || cc.length > 0;
  const isBccVisible = showBcc || bcc.length > 0;

  return (
    <form
      className={cn(
        "flex w-full min-w-0 flex-col gap-4",
        presentation === "pane" && "min-h-0 flex-1 gap-0",
      )}
      aria-busy={isTemplateLoading || isSubmitting}
      noValidate
      onSubmit={handleSubmit(submitEmail)}
    >
      <ScrollArea className={cn(
        "w-full min-w-0 overflow-x-hidden",
        presentation === "pane" && "min-h-0 flex-1",
      )}>
        <div className={cn(
          "flex w-full min-w-0 flex-col gap-4",
          presentation === "pane" && "px-(--card-spacing) pb-4",
        )}>
          {leadingContent}
          <FieldGroup>
            <InputGroup>
              <InputGroupAddon align="inline-start">
                <InputGroupText>
                  <IconMail aria-hidden="true" />
                  {t("dataCollection.sendTemplate.email.from")}
                </InputGroupText>
              </InputGroupAddon>
              <InputGroupInput
                aria-label={t("dataCollection.sendTemplate.email.from")}
                disabled={isTemplateLoading}
                readOnly
                value={t("dataCollection.sendTemplate.email.sender")}
              />
            </InputGroup>

            <Controller
              control={control}
              name="to"
              render={({ field }) => (
                <EmailRecipientInput
                  id="template-email-to"
                  label={t("dataCollection.sendTemplate.email.to")}
                  value={field.value}
                  onValueChange={field.onChange}
                  placeholder={t("dataCollection.sendTemplate.email.recipientPlaceholder")}
                  excludedEmails={[...recipientEmails(cc), ...recipientEmails(bcc)]}
                  errorMessage={errors.to?.message}
                  isDisabled={isTemplateLoading || isSubmitting}
                  endActions={(
                    <>
                      {!isCcVisible ? (
                        <InputGroupButton
                          aria-label={t("dataCollection.sendTemplate.email.showCc")}
                          isDisabled={isTemplateLoading}
                          onPress={() => setShowCc(true)}
                        >
                          {t("dataCollection.sendTemplate.email.cc")}
                        </InputGroupButton>
                      ) : null}
                      {!isBccVisible ? (
                        <InputGroupButton
                          aria-label={t("dataCollection.sendTemplate.email.showBcc")}
                          isDisabled={isTemplateLoading}
                          onPress={() => setShowBcc(true)}
                        >
                          {t("dataCollection.sendTemplate.email.bcc")}
                        </InputGroupButton>
                      ) : null}
                    </>
                  )}
                />
              )}
            />

            {isCcVisible ? (
              <Controller
                control={control}
                name="cc"
                render={({ field }) => (
                  <EmailRecipientInput
                    id="template-email-cc"
                    label={t("dataCollection.sendTemplate.email.cc")}
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder={t("dataCollection.sendTemplate.email.recipientPlaceholder")}
                    excludedEmails={[...recipientEmails(to), ...recipientEmails(bcc)]}
                    errorMessage={errors.cc?.message}
                    isDisabled={isTemplateLoading || isSubmitting}
                  />
                )}
              />
            ) : null}

            {isBccVisible ? (
              <Controller
                control={control}
                name="bcc"
                render={({ field }) => (
                  <EmailRecipientInput
                    id="template-email-bcc"
                    label={t("dataCollection.sendTemplate.email.bcc")}
                    value={field.value}
                    onValueChange={field.onChange}
                    placeholder={t("dataCollection.sendTemplate.email.recipientPlaceholder")}
                    excludedEmails={[...recipientEmails(to), ...recipientEmails(cc)]}
                    errorMessage={errors.bcc?.message}
                    isDisabled={isTemplateLoading || isSubmitting}
                  />
                )}
              />
            ) : null}

            <Field data-invalid={Boolean(errors.subject)}>
              <InputGroup>
                <InputGroupAddon align="inline-start">
                  <InputGroupText>
                    <IconTextCaption aria-hidden="true" />
                    {t("dataCollection.sendTemplate.email.subject")}
                  </InputGroupText>
                </InputGroupAddon>
                <InputGroupInput
                  aria-label={t("dataCollection.sendTemplate.email.subject")}
                  aria-invalid={Boolean(errors.subject)}
                  disabled={isTemplateLoading || isSubmitting}
                  {...register("subject")}
                />
              </InputGroup>
              <FieldError>{errors.subject?.message}</FieldError>
            </Field>

            <Controller
              control={control}
              name="message"
              render={({ field }) => (
                <VariableMessageInput
                  name={field.name}
                  inputRef={field.ref}
                  value={field.value}
                  onValueChange={field.onChange}
                  onBlur={field.onBlur}
                  label={t("dataCollection.sendTemplate.email.message")}
                  icon={<IconMessage aria-hidden="true" />}
                  variables={messageVariables}
                  variableValues={variableValues}
                  errorMessage={errors.message?.message}
                  disabled={isTemplateLoading || isSubmitting}
                />
              )}
            />
          </FieldGroup>
        </div>
      </ScrollArea>

      <footer className={cn(
        "flex justify-end gap-2",
        presentation === "pane"
          && "sticky bottom-0 w-full shrink-0 border-t bg-background px-(--card-spacing) py-3",
      )}>
        <Button type="button" variant="outline" isDisabled={isSubmitting} onPress={onCancel}>
          {t("dataCollection.sendTemplate.email.cancel")}
        </Button>
        <Button type="submit" isDisabled={!isTemplateSelected || isTemplateLoading || isSubmitting}>
          {isSubmitting ? (
            <Spinner data-icon="inline-start" aria-label={t("dataCollection.sendTemplate.email.sending")} />
          ) : (
            <IconSend data-icon="inline-start" aria-hidden="true" />
          )}
          {isSubmitting
            ? t("dataCollection.sendTemplate.email.sending")
            : t("dataCollection.sendTemplate.email.send")}
        </Button>
      </footer>
    </form>
  );
}

function synchronizeTemplateRecipients(
  recipients: EmailRecipient[],
  templateEmails: string[],
  templateKey: string,
) {
  const withoutTemplateOrigins = recipients.flatMap((recipient) => {
    const origins = recipient.origins.filter((origin) => origin.type !== "template");
    return origins.length ? [{ ...recipient, origins }] : [];
  });

  if (!templateKey) return withoutTemplateOrigins;

  return templateEmails.reduce<EmailRecipient[]>((nextRecipients, email) => {
    if (!z.email().safeParse(email.trim()).success) return nextRecipients;

    const normalizedEmail = normalizeRecipientEmail(email);
    const existingRecipient = nextRecipients.find((recipient) => recipient.id === normalizedEmail);
    const templateOrigin = { type: "template" as const, key: templateKey };

    if (existingRecipient) {
      if (!existingRecipient.origins.some((origin) => originsEqual(origin, templateOrigin))) {
        existingRecipient.origins = [...existingRecipient.origins, templateOrigin];
      }
      return nextRecipients;
    }

    return [...nextRecipients, createEmailRecipient(email, templateOrigin)];
  }, withoutTemplateOrigins);
}

function originsEqual(
  first: EmailRecipient["origins"][number],
  second: EmailRecipient["origins"][number],
) {
  return first.type === second.type && first.key === second.key;
}

function recipientListsEqual(first: EmailRecipient[], second: EmailRecipient[]) {
  if (first.length !== second.length) return false;

  return first.every((recipient, index) => {
    const comparison = second[index];
    return recipient.id === comparison.id
      && recipient.email === comparison.email
      && recipient.origins.length === comparison.origins.length
      && recipient.origins.every((origin, originIndex) => (
        originsEqual(origin, comparison.origins[originIndex])
      ));
  });
}

function recipientEmails(recipients: EmailRecipient[]) {
  return recipients.map((recipient) => recipient.email);
}
