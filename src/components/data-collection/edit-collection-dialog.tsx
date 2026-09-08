import type { RequestPeriodCollectionSummary } from "@/api/template-workflow.api";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useUpdateRequestPeriodCollection } from "@/hooks/use-template-workflow";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconAlertTriangle, IconEdit } from "@tabler/icons-react";
import { type ReactNode, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";

type EditCollectionFormValues = {
  requestPeriodLabel: string;
  yearPeriod: string;
};

type EditCollectionDialogProps = {
  collection: RequestPeriodCollectionSummary;
  unitCode: string;
  trigger?: ReactNode;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
};

export function EditCollectionDialog({ collection, unitCode, trigger, open, onOpenChange }: EditCollectionDialogProps) {
  const { t } = useTranslation("ingestion");
  const [internalOpen, setInternalOpen] = useState(false);
  const isOpen = open ?? internalOpen;
  const updateCollection = useUpdateRequestPeriodCollection();
  const schema = useMemo(() => z.object({
    requestPeriodLabel: z.string().trim().min(1, t("dataCollection.create.required")),
    yearPeriod: z.string().trim()
      .min(1, t("dataCollection.create.yearPeriodRequired"))
      .max(9, t("dataCollection.create.yearPeriodTooLong")),
  }), [t]);
  const defaultValues = useMemo(() => ({
    requestPeriodLabel: collection.collectionLabel,
    yearPeriod: collection.yearPeriod,
  }), [collection.collectionLabel, collection.yearPeriod]);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<EditCollectionFormValues>({
    defaultValues,
    resolver: zodResolver(schema),
  });
  const isPending = isSubmitting || updateCollection.isPending;

  function handleOpenChange(open: boolean) {
    if (!open && isPending) return;
    onOpenChange?.(open);
    if (!onOpenChange) setInternalOpen(open);
    if (open) {
      reset(defaultValues);
      updateCollection.reset();
    }
  }

  async function submit(values: EditCollectionFormValues) {
    try {
      await updateCollection.mutateAsync({
        collectionCode: collection.collectionCode,
        unitCode,
        payload: {
          request_period_label: values.requestPeriodLabel,
          year_period: values.yearPeriod,
        },
      });
      toast.success(t("dataCollection.edit.successTitle"));
      handleOpenChange(false);
    } catch {
      // Keep the entered values and expose the mutation error in the dialog.
    }
  }

  const apiError = updateCollection.error instanceof Error
    ? updateCollection.error.message
    : t("dataCollection.edit.errorDescription");

  const dialog = (
      <Dialog
        isOpen={onOpenChange ? isOpen : undefined}
        onOpenChange={onOpenChange ? handleOpenChange : undefined}
        isDismissable={!isPending}
        showCloseButton={false}
      >
        <DialogHeader>
          <DialogTitle>
            <IconEdit aria-hidden="true" />
            {t("dataCollection.edit.title")}
          </DialogTitle>
        </DialogHeader>
        <form noValidate onSubmit={handleSubmit(submit)}>
          <FieldGroup>
            <Field data-invalid={Boolean(errors.requestPeriodLabel)}>
              <FieldLabel htmlFor={`collection-name-${collection.collectionCode}`}>
                {t("dataCollection.create.name")}
              </FieldLabel>
              <Input id={`collection-name-${collection.collectionCode}`} autoFocus disabled={isPending} aria-invalid={Boolean(errors.requestPeriodLabel)} {...register("requestPeriodLabel")} />
              <FieldError>{errors.requestPeriodLabel?.message}</FieldError>
            </Field>
            <Field data-invalid={Boolean(errors.yearPeriod)}>
              <FieldLabel htmlFor={`collection-year-${collection.collectionCode}`}>{t("dataCollection.create.yearPeriod")}</FieldLabel>
              <Input id={`collection-year-${collection.collectionCode}`} maxLength={9} disabled={isPending} aria-invalid={Boolean(errors.yearPeriod)} {...register("yearPeriod")} />
              <FieldError>{errors.yearPeriod?.message}</FieldError>
            </Field>
            {updateCollection.isError ? <Alert variant="destructive"><IconAlertTriangle aria-hidden="true" /><AlertTitle>{t("dataCollection.edit.errorTitle")}</AlertTitle><AlertDescription className="text-foreground">{apiError}</AlertDescription></Alert> : null}
          </FieldGroup>
          <DialogFooter>
            <Button type="button" variant="outline" isDisabled={isPending} onPress={() => handleOpenChange(false)}>{t("dataCollection.create.cancel")}</Button>
            <Button type="submit" isDisabled={isPending}>{isPending ? <Spinner data-icon="inline-start" aria-label={t("dataCollection.edit.saving")} /> : null}{isPending ? t("dataCollection.edit.saving") : t("dataCollection.edit.submit")}</Button>
          </DialogFooter>
        </form>
      </Dialog>
  );

  if (onOpenChange) return dialog;

  return (
    <DialogTrigger isOpen={internalOpen} onOpenChange={handleOpenChange}>
      {trigger ?? (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          aria-label={t("dataCollection.edit.action", { name: collection.collectionLabel })}
        >
          <IconEdit aria-hidden="true" />
        </Button>
      )}
      {dialog}
    </DialogTrigger>
  );
}
