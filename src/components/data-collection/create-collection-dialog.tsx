import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Field, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { useCreateRequestPeriodCollection } from "@/hooks/use-template-workflow";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconAlertTriangle, IconPlus } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";

type CreateCollectionFormValues = {
  requestPeriodLabel: string;
  yearPeriod: string;
};

const DEFAULT_VALUES: CreateCollectionFormValues = {
  requestPeriodLabel: "",
  yearPeriod: "",
};

type CreateCollectionDialogProps = {
  unitCode: string;
  locale: string;
};

export function CreateCollectionDialog({ unitCode, locale }: CreateCollectionDialogProps) {
  const { t } = useTranslation("ingestion");
  const [isOpen, setIsOpen] = useState(false);
  const createCollectionMutation = useCreateRequestPeriodCollection();
  const schema = useMemo(() => z.object({
    requestPeriodLabel: z.string().trim().min(1, t("dataCollection.create.required")),
    yearPeriod: z.string()
      .trim()
      .min(1, t("dataCollection.create.yearPeriodRequired"))
      .max(9, t("dataCollection.create.yearPeriodTooLong")),
  }), [t]);
  const {
    formState: { errors, isSubmitting },
    handleSubmit,
    register,
    reset,
  } = useForm<CreateCollectionFormValues>({
    defaultValues: DEFAULT_VALUES,
    mode: "onSubmit",
    reValidateMode: "onChange",
    resolver: zodResolver(schema),
  });
  const isPending = isSubmitting || createCollectionMutation.isPending;

  function handleOpenChange(open: boolean) {
    if (!open && isPending) return;
    setIsOpen(open);
    if (open) {
      reset(DEFAULT_VALUES);
      createCollectionMutation.reset();
    }
  }

  async function createCollection(values: CreateCollectionFormValues) {
    try {
      const collection = await createCollectionMutation.mutateAsync({
        payload: {
          unit_code: unitCode,
          request_period_label: values.requestPeriodLabel,
          year_period: values.yearPeriod,
        },
        locale,
      });
      toast.success(t("dataCollection.create.successTitle"), {
        description: t("dataCollection.create.successDescription", {
          name: collection.collectionLabel,
        }),
      });
      reset(DEFAULT_VALUES);
      setIsOpen(false);
    } catch {
      // The mutation error remains visible in the dialog so the entered name is preserved.
    }
  }

  const apiError = createCollectionMutation.error instanceof Error
    ? createCollectionMutation.error.message
    : t("dataCollection.create.errorDescription");

  return (
    <DialogTrigger isOpen={isOpen} onOpenChange={handleOpenChange}>
      <Button type="button" size="sm">
        <IconPlus data-icon="inline-start" aria-hidden="true" />
        {t("dataCollection.create.button")}
      </Button>
      <Dialog isDismissable={!isPending} showCloseButton={false}>
        <DialogHeader>
          <DialogTitle>
            <IconPlus aria-hidden="true" />
            {t("dataCollection.create.title")}
          </DialogTitle>
        </DialogHeader>

        <form noValidate onSubmit={handleSubmit(createCollection)}>
          <FieldGroup>
            <Field data-invalid={Boolean(errors.requestPeriodLabel)}>
              <FieldLabel htmlFor="collection-request-period-label">
                {t("dataCollection.create.name")}
              </FieldLabel>
              <Input
                id="collection-request-period-label"
                autoFocus
                placeholder={t("dataCollection.create.placeholder", { unit: unitCode })}
                aria-invalid={Boolean(errors.requestPeriodLabel)}
                aria-describedby={errors.requestPeriodLabel
                  ? "collection-request-period-label-error"
                  : undefined}
                disabled={isPending}
                {...register("requestPeriodLabel")}
              />
              <FieldError id="collection-request-period-label-error">
                {errors.requestPeriodLabel?.message}
              </FieldError>
            </Field>

            <Field data-invalid={Boolean(errors.yearPeriod)}>
              <FieldLabel htmlFor="collection-year-period">
                {t("dataCollection.create.yearPeriod")}
              </FieldLabel>
              <Input
                id="collection-year-period"
                maxLength={9}
                required
                placeholder={t("dataCollection.create.yearPeriodPlaceholder")}
                aria-invalid={Boolean(errors.yearPeriod)}
                aria-describedby={errors.yearPeriod
                  ? "collection-year-period-error"
                  : undefined}
                disabled={isPending}
                {...register("yearPeriod")}
              />
              <FieldError id="collection-year-period-error">
                {errors.yearPeriod?.message}
              </FieldError>
            </Field>

            {createCollectionMutation.isError ? (
              <Alert variant="destructive">
                <IconAlertTriangle aria-hidden="true" />
                <AlertTitle>{t("dataCollection.create.errorTitle")}</AlertTitle>
                <AlertDescription className="text-foreground">{apiError}</AlertDescription>
              </Alert>
            ) : null}
          </FieldGroup>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              isDisabled={isPending}
              onPress={() => handleOpenChange(false)}
            >
              {t("dataCollection.create.cancel")}
            </Button>
            <Button type="submit" isDisabled={isPending}>
              {isPending ? <Spinner data-icon="inline-start" aria-label={t("dataCollection.create.creating")} /> : null}
              {isPending
                ? t("dataCollection.create.creating")
                : t("dataCollection.create.submit")}
            </Button>
          </DialogFooter>
        </form>
      </Dialog>
    </DialogTrigger>
  );
}
