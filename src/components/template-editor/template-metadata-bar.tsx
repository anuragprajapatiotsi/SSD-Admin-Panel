import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field";
import {
  InputGroup,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Separator } from "@/components/ui/separator";
import { IconAlertTriangle } from "@tabler/icons-react";
import { Controller, useFormContext } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { MinistryMultiSelect } from "./ministry-multi-select";
import { TemplateEditorActions } from "./template-editor-actions";
import type {
  TemplateEditorMode,
  TemplateMetadataFormValues,
} from "./template-editor-types";

type TemplateDetailsPanelProps = {
  mode: TemplateEditorMode;
  isDisabled?: boolean;
  isPending: boolean;
  canSubmit: boolean;
  submitError?: string;
  onSubmit: () => void;
};

export function TemplateDetailsPanel({
  mode,
  isDisabled = false,
  isPending,
  canSubmit,
  submitError,
  onSubmit,
}: TemplateDetailsPanelProps) {
  const { t } = useTranslation("ingestion");
  const {
    control,
    register,
    formState: { errors },
  } = useFormContext<TemplateMetadataFormValues>();

  return (
    <aside
      id="template-details-panel"
      className="flex min-h-0 min-w-0 bg-card text-card-foreground"
      aria-labelledby="template-details-title"
    >
      <form
        className="flex size-full min-h-0 flex-col"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          onSubmit();
        }}
      >
        <header className="shrink-0 px-4 py-3">
          <h2 id="template-details-title" className="font-heading text-sm font-medium">
            {t("templateForm.workspace.detailsTitle")}
          </h2>
        </header>
        <Separator />

        <div className="min-h-0 flex-1 overflow-y-auto p-4">
          <FieldGroup>
            <Field data-invalid={Boolean(errors.templateName)}>
              <FieldLabel htmlFor="template-name">
                {t("templateForm.workspace.templateName")}
              </FieldLabel>
              <InputGroup>
                <InputGroupInput
                  id="template-name"
                  minLength={3}
                  aria-required="true"
                  disabled={isDisabled}
                  aria-invalid={Boolean(errors.templateName)}
                  aria-describedby={errors.templateName ? "template-name-error" : undefined}
                  {...register("templateName")}
                />
              </InputGroup>
              <FieldError id="template-name-error">{errors.templateName?.message}</FieldError>
            </Field>

            <Controller
              control={control}
              name="ministryIds"
              render={({ field, fieldState }) => (
                <Field data-invalid={fieldState.invalid}>
                  <FieldLabel id="template-ministry-label">
                    {t("templateForm.workspace.sourceMinistryOptional")}
                  </FieldLabel>
                  <MinistryMultiSelect
                    labelledBy="template-ministry-label"
                    value={field.value}
                    onChange={field.onChange}
                    onBlur={field.onBlur}
                    isDisabled={isDisabled}
                    isInvalid={fieldState.invalid}
                    isOptional
                    errorId="template-ministry-error"
                  />
                  <FieldError id="template-ministry-error">{fieldState.error?.message}</FieldError>
                </Field>
              )}
            />

            {submitError ? (
              <Alert variant="destructive">
                <IconAlertTriangle aria-hidden="true" />
                <AlertTitle>{t("templateForm.workspace.submitErrorTitle")}</AlertTitle>
                <AlertDescription>{submitError}</AlertDescription>
              </Alert>
            ) : null}
          </FieldGroup>
        </div>

        <Separator />
        <footer className="flex shrink-0 justify-end p-3">
            <TemplateEditorActions
              mode={mode}
              isPending={isPending}
              canSubmit={canSubmit}
            />
        </footer>
      </form>
    </aside>
  );
}
