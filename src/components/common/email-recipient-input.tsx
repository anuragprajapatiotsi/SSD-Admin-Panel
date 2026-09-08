import type { OfficerEmailSuggestion } from "@/api/masters-reference.api";
import {
  createEmailRecipient,
  normalizeRecipientEmail,
  type EmailRecipient,
} from "@/components/common/email-recipient";
import { Button } from "@/components/ui/button";
import {
  Combobox,
  ComboboxChip,
  ComboboxChipList,
  ComboboxChips,
  ComboboxChipsInput,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxItem,
  ComboboxList,
  ComboboxSeparator,
  useComboboxAnchor,
} from "@/components/ui/combobox";
import { Field, FieldError } from "@/components/ui/field";
import {
  InputGroupAddon,
  InputGroupText,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { useOfficerEmailSuggestions } from "@/hooks/use-officer-email-suggestions";
import { IconAt, IconRefresh } from "@tabler/icons-react";
import { useMemo, useState, type ClipboardEvent, type KeyboardEvent, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";

type EmailRecipientInputProps = {
  id: string;
  label: string;
  value: EmailRecipient[];
  onValueChange: (recipients: EmailRecipient[]) => void;
  placeholder: string;
  excludedEmails?: string[];
  organizationCode?: string;
  endActions?: ReactNode;
  errorMessage?: string;
  isDisabled?: boolean;
};

export function EmailRecipientInput({
  id,
  label,
  value,
  onValueChange,
  placeholder,
  excludedEmails = [],
  organizationCode,
  endActions,
  errorMessage,
  isDisabled = false,
}: EmailRecipientInputProps) {
  const { t } = useTranslation("ingestion");
  const [inputValue, setInputValue] = useState("");
  const [entryError, setEntryError] = useState("");
  const anchor = useComboboxAnchor();
  const officerQuery = useOfficerEmailSuggestions({
    searchText: inputValue,
    organizationCode,
    enabled: !isDisabled,
  });
  const selectedEmails = useMemo(
    () => new Set(value.map((recipient) => normalizeRecipientEmail(recipient.email))),
    [value],
  );
  const excludedEmailSet = useMemo(
    () => new Set(excludedEmails.map(normalizeRecipientEmail)),
    [excludedEmails],
  );
  const officerOptions = useMemo(
    () => officerQuery.suggestions
      .filter((officer) => isValidEmail(officer.email))
      .map(officerToRecipient),
    [officerQuery.suggestions],
  );
  const manualOption = isValidEmail(inputValue)
    ? createEmailRecipient(inputValue, { type: "manual", key: normalizeRecipientEmail(inputValue) })
    : null;
  const options = uniqueRecipientOptions([
    ...value,
    ...officerOptions,
    ...(manualOption ? [manualOption] : []),
  ]);
  const isSearching = officerQuery.isDebouncing || officerQuery.isFetching;
  const combinedError = errorMessage || entryError;

  function updateSelection(keys: string[]) {
    const optionsByEmail = new Map(options.map((option) => [option.id, option]));
    const nextRecipients: EmailRecipient[] = [];

    keys.forEach((key) => {
      const normalizedEmail = normalizeRecipientEmail(String(key));
      const recipient = optionsByEmail.get(normalizedEmail);
      if (!recipient || excludedEmailSet.has(normalizedEmail)) {
        if (excludedEmailSet.has(normalizedEmail)) {
          setEntryError(t("dataCollection.sendTemplate.email.duplicateRecipient", { email: normalizedEmail }));
        }
        return;
      }
      nextRecipients.push(recipient);
    });

    onValueChange(uniqueRecipientOptions(nextRecipients));
    setInputValue("");
    setEntryError("");
  }

  function addManualEmails(emails: string[]) {
    const nextRecipients = [...value];
    let nextError = "";

    emails.forEach((email) => {
      const normalizedEmail = normalizeRecipientEmail(email);
      if (!isValidEmail(normalizedEmail)) {
        nextError = t("dataCollection.sendTemplate.email.invalidRecipient", { email: email.trim() });
        return;
      }
      if (excludedEmailSet.has(normalizedEmail)) {
        nextError = t("dataCollection.sendTemplate.email.duplicateRecipient", { email: email.trim() });
        return;
      }
      if (!nextRecipients.some((recipient) => recipient.id === normalizedEmail)) {
        nextRecipients.push(createEmailRecipient(email, { type: "manual", key: normalizedEmail }));
      }
    });

    onValueChange(nextRecipients);
    setInputValue("");
    setEntryError(nextError);
  }

  function handleKeyDown(event: KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Backspace" && !inputValue && value.length) {
      event.preventDefault();
      onValueChange(value.slice(0, -1));
      return;
    }

    if (["Enter", ",", ";"].includes(event.key) && isValidEmail(inputValue)) {
      event.preventDefault();
      addManualEmails([inputValue]);
    }
  }

  function handlePaste(event: ClipboardEvent<HTMLInputElement>) {
    const pastedValue = event.clipboardData.getData("text");
    const pastedEmails = splitEmailInput(pastedValue);
    if (pastedEmails.length <= 1 && !/[;,\n]/.test(pastedValue)) return;

    event.preventDefault();
    addManualEmails(pastedEmails);
  }

  return (
    <Field data-invalid={Boolean(combinedError)}>
      <Combobox<EmailRecipient, "multiple">
        aria-label={label}
        selectionMode="multiple"
        items={options}
        value={value.map((recipient) => recipient.id)}
        inputValue={inputValue}
        menuTrigger="input"
        allowsEmptyCollection
        isDisabled={isDisabled}
        onInputChange={(nextInputValue) => {
          setInputValue(nextInputValue);
          setEntryError("");
        }}
        onChange={(keys) => updateSelection(keys.map(String))}
      >
        <ComboboxChips ref={anchor} aria-invalid={Boolean(combinedError)} data-disabled={isDisabled || undefined}>
          <InputGroupAddon align="inline-start">
            <InputGroupText>
              <IconAt aria-hidden="true" />
              {label}
            </InputGroupText>
          </InputGroupAddon>
          <ComboboxChipList<EmailRecipient>>
            {(recipient) => (
              <ComboboxChip
                id={recipient.id}
                removeLabel={t("dataCollection.sendTemplate.email.removeRecipient", {
                  email: recipient.email,
                })}
                textValue={recipient.email}
              >
                <span title={recipient.email}>{recipient.displayName || recipient.email}</span>
              </ComboboxChip>
            )}
          </ComboboxChipList>
          <ComboboxChipsInput
            id={id}
            aria-label={label}
            autoComplete="off"
            placeholder={value.length ? "" : placeholder}
            onKeyDown={handleKeyDown}
            onPaste={handlePaste}
            onBlur={() => {
              if (inputValue && isValidEmail(inputValue)) addManualEmails([inputValue]);
              else if (inputValue) {
                setEntryError(t("dataCollection.sendTemplate.email.invalidRecipient", { email: inputValue }));
              }
            }}
          />
          {isSearching || endActions ? (
            <InputGroupAddon align="inline-end">
              {isSearching ? (
                <Spinner aria-label={t("dataCollection.sendTemplate.email.searchingOfficers")} />
              ) : null}
              {endActions}
            </InputGroupAddon>
          ) : null}
        </ComboboxChips>

        <ComboboxContent anchor={anchor}>
          <ComboboxList items={options}>
            {(recipient) => {
              const isManualEmail = recipient.origins.some((origin) => origin.type === "manual")
                && !recipient.officerCode;

              return (
                <ComboboxItem
                  id={recipient.id}
                  className={selectedEmails.has(recipient.id) ? "hidden" : undefined}
                  textValue={`${recipient.displayName ?? ""} ${recipient.email}`}
                >
                  <div className="flex min-w-0 flex-1 flex-col">
                    <span className="truncate font-medium">
                      {isManualEmail
                        ? t("dataCollection.sendTemplate.email.useEmail", { email: recipient.email })
                        : recipient.displayName || recipient.email}
                    </span>
                    {!isManualEmail ? (
                      <span className="truncate text-muted-foreground">
                        {[recipient.email, recipient.designation, recipient.organizationCode].filter(Boolean).join(" · ")}
                      </span>
                    ) : null}
                  </div>
                </ComboboxItem>
              );
            }}
          </ComboboxList>
          <ComboboxEmpty className="flex">
            {officerQuery.isError
              ? t("dataCollection.sendTemplate.email.officerSearchError")
              : inputValue.trim().length < 2
                ? t("dataCollection.sendTemplate.email.searchHint")
                : t("dataCollection.sendTemplate.email.noOfficers")}
          </ComboboxEmpty>
          {officerQuery.isError || officerQuery.hasNextPage ? (
            <>
              <ComboboxSeparator />
              <div className="p-1">
                <Button
                  className="w-full"
                  type="button"
                  variant="ghost"
                  size="sm"
                  isDisabled={officerQuery.isFetchingNextPage}
                  onPress={() => {
                    if (officerQuery.isError) void officerQuery.refetch();
                    else void officerQuery.fetchNextPage();
                  }}
                >
                  {officerQuery.isFetchingNextPage ? (
                    <Spinner data-icon="inline-start" aria-hidden="true" />
                  ) : (
                    <IconRefresh data-icon="inline-start" aria-hidden="true" />
                  )}
                  {t(officerQuery.isError
                    ? "dataCollection.sendTemplate.email.retryOfficerSearch"
                    : "dataCollection.sendTemplate.email.loadMoreOfficers")}
                </Button>
              </div>
            </>
          ) : null}
        </ComboboxContent>
      </Combobox>
      <FieldError>{combinedError}</FieldError>
    </Field>
  );
}

function officerToRecipient(officer: OfficerEmailSuggestion): EmailRecipient {
  return createEmailRecipient(
    officer.email,
    { type: "officer", key: officer.officerCode },
    {
      displayName: officer.displayName,
      designation: officer.designation,
      officerCode: officer.officerCode,
      organizationCode: officer.organizationCode,
    },
  );
}

function uniqueRecipientOptions(recipients: EmailRecipient[]) {
  const recipientsByEmail = new Map<string, EmailRecipient>();
  recipients.forEach((recipient) => {
    const normalizedEmail = normalizeRecipientEmail(recipient.email);
    if (!recipientsByEmail.has(normalizedEmail)) {
      recipientsByEmail.set(normalizedEmail, { ...recipient, id: normalizedEmail });
    }
  });
  return [...recipientsByEmail.values()];
}

function splitEmailInput(value: string) {
  return value.split(/[;,\n]/).map((email) => email.trim()).filter(Boolean);
}

function isValidEmail(email: string) {
  return z.email().safeParse(email.trim()).success;
}
