import { PageSection, PageHeader } from "@/components/common/page-layout";

import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldTitle } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CircleAlert, RefreshCw, Save } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { getPeriodicityRecord, updateMasterRecord, type MasterRecord } from "../../api/masters-reference.api";
import {
  normalizePeriodicityCode,
  PERIODICITIES_PATH,
  createPeriodicitySchema,
  type PeriodicityFormValues,
} from "./periodicity-schema";

export function EditPeriodicityPage() {
  const navigate = useNavigate();
  const { t } = useTranslation("common");
  const { periodicityCode = "" } = useParams<{ periodicityCode: string }>();
  const decodedCode = decodeURIComponent(periodicityCode);
  const returnToPeriodicities = () => navigate(PERIODICITIES_PATH);
  const periodicityQuery = useQuery({
    queryKey: ["masters", "periodicities", "detail", decodedCode],
    queryFn: () => getPeriodicityRecord(decodedCode),
    enabled: Boolean(decodedCode),
  });

  async function updatePeriodicity(values: PeriodicityFormValues) {
    const name = values.name.trim();
    try {
      await updateMasterRecord({
        endpoint: PERIODICITIES_PATH,
        patchPath: `${PERIODICITIES_PATH}/${encodeURIComponent(decodedCode)}`,
        payload: {
          name,
          periodicity_code: normalizePeriodicityCode(values.periodicity_code || name),
          months_interval: values.months_interval,
          description: values.description.trim() || undefined,
          sort_order: values.sort_order,
          is_active: values.is_active,
        },
      });
      toast.success(t("pages.periodicities.updated"), {
        description: t("pages.periodicities.updatedDescription", { name }),
      });
      navigate(PERIODICITIES_PATH, { replace: true });
    } catch (error) {
      toast.error(t("pages.periodicities.updateError"), {
        description: error instanceof Error ? error.message : t("pages.periodicities.reviewDetails"),
      });
    }
  }

  return (
    <PageSection className="flex min-w-0 flex-col gap-4">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-3">
        <Button className="w-fit" type="button" variant="outline" onPress={returnToPeriodicities}>
          <ArrowLeft data-icon="inline-start" aria-hidden="true" />
          {t("pages.periodicities.back")}
        </Button>
        <PageHeader>
          <div>
            <h2>{t("pages.periodicities.editTitle")}</h2>
            <p>{t("pages.periodicities.editDescription")}</p>
          </div>
        </PageHeader>
      </div>

      {periodicityQuery.isPending ? (
        <div className="mx-auto flex w-full max-w-xl items-center justify-center gap-2 py-10 text-muted-foreground" role="status">
          <Spinner />
          {t("pages.periodicities.loading")}
        </div>
      ) : periodicityQuery.error ? (
        <Alert className="mx-auto w-full max-w-xl" variant="destructive">
          <CircleAlert aria-hidden="true" />
          <AlertTitle>{t("pages.periodicities.loadError")}</AlertTitle>
          <AlertDescription>{periodicityQuery.error instanceof Error ? periodicityQuery.error.message : t("pages.periodicities.loadAgain")}</AlertDescription>
          <AlertAction>
            <Button type="button" variant="outline" size="sm" onPress={() => void periodicityQuery.refetch()}>
              <RefreshCw data-icon="inline-start" aria-hidden="true" />
              {t("pages.periodicities.retry")}
            </Button>
          </AlertAction>
        </Alert>
      ) : periodicityQuery.data ? (
        <PeriodicityEditForm record={periodicityQuery.data} onCancel={returnToPeriodicities} onSubmit={updatePeriodicity} />
      ) : null}
    </PageSection>
  );
}

function PeriodicityEditForm({ record, onCancel, onSubmit }: {
  record: MasterRecord;
  onCancel: () => void;
  onSubmit: (values: PeriodicityFormValues) => Promise<void>;
}) {
  const { t } = useTranslation("common");
  const periodicitySchema = useMemo(() => createPeriodicitySchema(t), [t]);
  const { control, formState: { errors, isSubmitting }, handleSubmit, register } = useForm<PeriodicityFormValues>({
    defaultValues: periodicityFormValues(record),
    mode: "onSubmit",
    reValidateMode: "onChange",
    resolver: zodResolver(periodicitySchema),
  });

  return (
    <form className="mx-auto w-full max-w-xl" noValidate onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader className="sr-only">
          <CardTitle>{t("pages.periodicities.editTitle")}</CardTitle>
          <CardDescription>{t("pages.periodicities.formDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <FieldGroup>
            <Field className="gap-1" data-invalid={Boolean(errors.name)}>
              <FieldLabel htmlFor="periodicity-name">{t("pages.periodicities.fields.name")}</FieldLabel>
              <Input id="periodicity-name" autoFocus aria-invalid={Boolean(errors.name)} disabled={isSubmitting} {...register("name")} />
              <FieldError>{errors.name?.message}</FieldError>
            </Field>
            <Field className="gap-1" data-invalid={Boolean(errors.periodicity_code)}>
              <FieldLabel htmlFor="periodicity-code">{t("pages.periodicities.fields.code")}</FieldLabel>
              <Input id="periodicity-code" aria-invalid={Boolean(errors.periodicity_code)} disabled={isSubmitting} {...register("periodicity_code")} />
              <FieldDescription>{t("pages.periodicities.codeEditHelp")}</FieldDescription>
              <FieldError>{errors.periodicity_code?.message}</FieldError>
            </Field>
            <Field className="gap-1" data-invalid={Boolean(errors.months_interval)}>
              <FieldLabel htmlFor="periodicity-months">{t("pages.periodicities.fields.months")}</FieldLabel>
              <Input id="periodicity-months" type="number" min={0} step={1} aria-invalid={Boolean(errors.months_interval)} disabled={isSubmitting} {...register("months_interval", { valueAsNumber: true })} />
              <FieldError>{errors.months_interval?.message}</FieldError>
            </Field>
            <Field className="gap-1" data-invalid={Boolean(errors.description)}>
              <FieldLabel htmlFor="periodicity-description">{t("pages.periodicities.fields.description")}</FieldLabel>
              <Textarea id="periodicity-description" rows={3} aria-invalid={Boolean(errors.description)} disabled={isSubmitting} {...register("description")} />
              <FieldError>{errors.description?.message}</FieldError>
            </Field>
            <Field className="gap-1" data-invalid={Boolean(errors.sort_order)}>
              <FieldLabel htmlFor="periodicity-sort-order">{t("pages.periodicities.fields.sortOrder")}</FieldLabel>
              <Input id="periodicity-sort-order" type="number" min={0} step={1} aria-invalid={Boolean(errors.sort_order)} disabled={isSubmitting} {...register("sort_order", { valueAsNumber: true })} />
              <FieldError>{errors.sort_order?.message}</FieldError>
            </Field>
          </FieldGroup>
          <FieldGroup>
            <Controller control={control} name="is_active" render={({ field }) => (
              <FieldLabel><Field orientation="horizontal"><Checkbox isDisabled={isSubmitting} isSelected={field.value} onBlur={field.onBlur} onChange={field.onChange} /><FieldContent><FieldTitle>{t("pages.periodicities.fields.active")}</FieldTitle><FieldDescription>{t("pages.periodicities.activeHelp")}</FieldDescription></FieldContent></Field></FieldLabel>
            )} />
          </FieldGroup>
        </CardContent>
        <CardFooter className="justify-end gap-2 border-t">
          <Button type="button" variant="outline" isDisabled={isSubmitting} onPress={onCancel}>{t("pages.periodicities.cancel")}</Button>
          <Button type="submit" isDisabled={isSubmitting}>
            {isSubmitting ? <Spinner data-icon="inline-start" aria-hidden="true" /> : <Save data-icon="inline-start" aria-hidden="true" />}
            {t(isSubmitting ? "pages.periodicities.saving" : "pages.periodicities.saveChanges")}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

function periodicityFormValues(record: MasterRecord): PeriodicityFormValues {
  const monthsInterval = Number(record.months_interval ?? 0);
  const sortOrder = Number(record.sort_order ?? 0);
  return {
    name: String(record.name ?? ""),
    periodicity_code: String(record.periodicity_code ?? ""),
    months_interval: Number.isFinite(monthsInterval) ? monthsInterval : 0,
    description: String(record.description ?? ""),
    sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
    is_active: typeof record.is_active === "boolean" ? record.is_active : true,
  };
}
