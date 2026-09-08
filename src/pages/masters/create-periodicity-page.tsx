import { PageSection, PageHeader } from "@/components/common/page-layout";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldTitle } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { createMasterRecord } from "../../api/masters-reference.api";
import { createPeriodicitySchema, normalizePeriodicityCode, PERIODICITIES_PATH, type PeriodicityFormValues } from "./periodicity-schema";

const DEFAULT_VALUES: PeriodicityFormValues = {
  name: "",
  periodicity_code: "",
  months_interval: 0,
  description: "",
  sort_order: 0,
  is_active: true,
};

export function CreatePeriodicityPage() {
  const navigate = useNavigate();
  const { t } = useTranslation("common");
  const periodicitySchema = useMemo(() => createPeriodicitySchema(t), [t]);
  const returnToPeriodicities = () => navigate(PERIODICITIES_PATH);
  const { control, formState: { errors, isSubmitting }, handleSubmit, register } = useForm<PeriodicityFormValues>({
    defaultValues: DEFAULT_VALUES,
    mode: "onSubmit",
    reValidateMode: "onChange",
    resolver: zodResolver(periodicitySchema),
  });

  async function createPeriodicity(values: PeriodicityFormValues) {
    const name = values.name.trim();
    const periodicityCode = normalizePeriodicityCode(values.periodicity_code || name);
    try {
      await createMasterRecord({
        endpoint: PERIODICITIES_PATH,
        payload: {
          name,
          periodicity_code: periodicityCode,
          months_interval: values.months_interval,
          description: values.description.trim() || undefined,
          sort_order: values.sort_order,
          is_active: values.is_active,
        },
      });
      toast.success(t("pages.periodicities.created"), {
        description: t("pages.periodicities.createdDescription", { name }),
      });
      navigate(PERIODICITIES_PATH, { replace: true });
    } catch (error) {
      toast.error(t("pages.periodicities.createError"), {
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
            <h2>{t("pages.periodicities.createTitle")}</h2>
            <p>{t("pages.periodicities.createDescription")}</p>
          </div>
        </PageHeader>
      </div>

      <form className="mx-auto w-full max-w-xl" noValidate onSubmit={handleSubmit(createPeriodicity)}>
        <Card>
          <CardHeader className="sr-only">
            <CardTitle>{t("pages.periodicities.createTitle")}</CardTitle>
            <CardDescription>{t("pages.periodicities.formDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <FieldGroup>
              <Field className="gap-1" data-invalid={Boolean(errors.name)}>
                <FieldLabel htmlFor="periodicity-name">{t("pages.periodicities.fields.name")}</FieldLabel>
                <Input id="periodicity-name" autoFocus placeholder={t("pages.periodicities.placeholders.name")} aria-invalid={Boolean(errors.name)} aria-describedby={errors.name ? "periodicity-name-error" : undefined} disabled={isSubmitting} {...register("name")} />
                <FieldError id="periodicity-name-error">{errors.name?.message}</FieldError>
              </Field>

              <Field className="gap-1" data-invalid={Boolean(errors.periodicity_code)}>
                <FieldLabel htmlFor="periodicity-code">{t("pages.periodicities.fields.code")}</FieldLabel>
                <Input id="periodicity-code" placeholder={t("pages.periodicities.placeholders.code")} aria-invalid={Boolean(errors.periodicity_code)} aria-describedby={errors.periodicity_code ? "periodicity-code-error" : "periodicity-code-description"} disabled={isSubmitting} {...register("periodicity_code")} />
                <FieldDescription id="periodicity-code-description">{t("pages.periodicities.codeCreateHelp")}</FieldDescription>
                <FieldError id="periodicity-code-error">{errors.periodicity_code?.message}</FieldError>
              </Field>

              <Field className="gap-1" data-invalid={Boolean(errors.months_interval)}>
                <FieldLabel htmlFor="periodicity-months">{t("pages.periodicities.fields.months")}</FieldLabel>
                <Input id="periodicity-months" type="number" min={0} step={1} aria-invalid={Boolean(errors.months_interval)} aria-describedby={errors.months_interval ? "periodicity-months-error" : undefined} disabled={isSubmitting} {...register("months_interval", { valueAsNumber: true })} />
                <FieldError id="periodicity-months-error">{errors.months_interval?.message}</FieldError>
              </Field>

              <Field className="gap-1" data-invalid={Boolean(errors.description)}>
                <FieldLabel htmlFor="periodicity-description">{t("pages.periodicities.fields.description")}</FieldLabel>
                <Textarea id="periodicity-description" rows={3} placeholder={t("pages.periodicities.placeholders.description")} aria-invalid={Boolean(errors.description)} aria-describedby={errors.description ? "periodicity-description-error" : undefined} disabled={isSubmitting} {...register("description")} />
                <FieldError id="periodicity-description-error">{errors.description?.message}</FieldError>
              </Field>

              <Field className="gap-1" data-invalid={Boolean(errors.sort_order)}>
                <FieldLabel htmlFor="periodicity-sort-order">{t("pages.periodicities.fields.sortOrder")}</FieldLabel>
                <Input id="periodicity-sort-order" type="number" min={0} step={1} aria-invalid={Boolean(errors.sort_order)} aria-describedby={errors.sort_order ? "periodicity-sort-order-error" : undefined} disabled={isSubmitting} {...register("sort_order", { valueAsNumber: true })} />
                <FieldError id="periodicity-sort-order-error">{errors.sort_order?.message}</FieldError>
              </Field>
            </FieldGroup>

            <FieldGroup>
              <Controller control={control} name="is_active" render={({ field }) => (
                <FieldLabel><Field orientation="horizontal"><Checkbox isDisabled={isSubmitting} isSelected={field.value} onBlur={field.onBlur} onChange={field.onChange} /><FieldContent><FieldTitle>{t("pages.periodicities.fields.active")}</FieldTitle><FieldDescription>{t("pages.periodicities.activeHelp")}</FieldDescription></FieldContent></Field></FieldLabel>
              )} />
            </FieldGroup>
          </CardContent>

          <CardFooter className="justify-end gap-2 border-t">
            <Button type="button" variant="outline" isDisabled={isSubmitting} onPress={returnToPeriodicities}>{t("pages.periodicities.cancel")}</Button>
            <Button type="submit" isDisabled={isSubmitting}>
              {isSubmitting ? <Spinner data-icon="inline-start" aria-hidden="true" /> : <Save data-icon="inline-start" aria-hidden="true" />}
              {t(isSubmitting ? "pages.periodicities.creating" : "pages.periodicities.create")}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </PageSection>
  );
}
