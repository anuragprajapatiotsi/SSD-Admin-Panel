import { PageHeader } from "@/components/common/page-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldTitle } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Save } from "lucide-react";
import { Controller, useForm } from "react-hook-form";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { createUomSchema, DEFAULT_UOM_VALUES, UOM_TYPES, type UomFormValues } from "./uom-schema";

export function UomForm({ defaultValues = DEFAULT_UOM_VALUES, mode = "create", onCancel, onSubmit }: {
  defaultValues?: UomFormValues;
  mode?: "create" | "edit";
  onCancel: () => void;
  onSubmit: (values: UomFormValues) => Promise<void>;
}) {
  const { t } = useTranslation("common");
  const uomSchema = useMemo(() => createUomSchema(t), [t]);
  const { control, formState: { errors, isSubmitting }, handleSubmit, register } = useForm<UomFormValues>({
    defaultValues,
    mode: "onSubmit",
    reValidateMode: "onChange",
    resolver: zodResolver(uomSchema),
  });

  return (
    <form className="mx-auto w-full max-w-xl" noValidate onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader className="sr-only">
          <CardTitle>{t(mode === "create" ? "pages.uom.createTitle" : "pages.uom.editTitle")}</CardTitle>
          <CardDescription>{t("pages.uom.formDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          <FieldGroup>
            <Field className="gap-1" data-invalid={Boolean(errors.name)}>
              <FieldLabel htmlFor="uom-name">{t("pages.uom.fields.name")}</FieldLabel>
              <Input id="uom-name" autoFocus placeholder={t("pages.uom.placeholders.name")} aria-invalid={Boolean(errors.name)} disabled={isSubmitting} {...register("name")} />
              <FieldError>{errors.name?.message}</FieldError>
            </Field>
            <Field className="gap-1" data-invalid={Boolean(errors.uom_code)}>
              <FieldLabel htmlFor="uom-code">{t("pages.uom.fields.code")}</FieldLabel>
              <Input id="uom-code" placeholder={t("pages.uom.placeholders.code")} readOnly={mode === "edit"} aria-invalid={Boolean(errors.uom_code)} disabled={isSubmitting} {...register("uom_code")} />
              <FieldDescription>{t(mode === "edit" ? "pages.uom.codeEditHelp" : "pages.uom.codeCreateHelp")}</FieldDescription>
              <FieldError>{errors.uom_code?.message}</FieldError>
            </Field>
            <Field className="gap-1" data-invalid={Boolean(errors.symbol)}>
              <FieldLabel htmlFor="uom-symbol">{t("pages.uom.fields.symbol")}</FieldLabel>
              <Input id="uom-symbol" placeholder="%" aria-invalid={Boolean(errors.symbol)} disabled={isSubmitting} {...register("symbol")} />
              <FieldError>{errors.symbol?.message}</FieldError>
            </Field>
            <Controller control={control} name="uom_type" render={({ field }) => (
              <Field className="gap-1" data-invalid={Boolean(errors.uom_type)}>
                <FieldLabel>{t("pages.uom.fields.type")}</FieldLabel>
                <Select aria-label={t("pages.uom.fields.type")} selectedKey={field.value} isDisabled={isSubmitting} onSelectionChange={(key) => field.onChange(String(key))}>
                  <SelectTrigger aria-invalid={Boolean(errors.uom_type)}><SelectValue /></SelectTrigger>
                  <SelectContent>{UOM_TYPES.map((type) => <SelectItem id={type} key={type}>{t(`pages.uom.types.${type}`)}</SelectItem>)}</SelectContent>
                </Select>
                <FieldError>{errors.uom_type?.message}</FieldError>
              </Field>
            )} />
            <Field className="gap-1" data-invalid={Boolean(errors.description)}>
              <FieldLabel htmlFor="uom-description">{t("pages.uom.fields.description")}</FieldLabel>
              <Textarea id="uom-description" rows={3} placeholder={t("pages.uom.placeholders.description")} aria-invalid={Boolean(errors.description)} disabled={isSubmitting} {...register("description")} />
              <FieldError>{errors.description?.message}</FieldError>
            </Field>
            <Field className="gap-1" data-invalid={Boolean(errors.sort_order)}>
              <FieldLabel htmlFor="uom-sort-order">{t("pages.uom.fields.sortOrder")}</FieldLabel>
              <Input id="uom-sort-order" type="number" min={0} step={1} aria-invalid={Boolean(errors.sort_order)} disabled={isSubmitting} {...register("sort_order", { valueAsNumber: true })} />
              <FieldError>{errors.sort_order?.message}</FieldError>
            </Field>
          </FieldGroup>
          <FieldGroup>
            <Controller control={control} name="is_active" render={({ field }) => (
              <FieldLabel><Field orientation="horizontal"><Checkbox isDisabled={isSubmitting} isSelected={field.value} onBlur={field.onBlur} onChange={field.onChange} /><FieldContent><FieldTitle>{t("pages.uom.fields.active")}</FieldTitle><FieldDescription>{t("pages.uom.activeHelp")}</FieldDescription></FieldContent></Field></FieldLabel>
            )} />
          </FieldGroup>
        </CardContent>
        <CardFooter className="justify-end gap-2 border-t">
          <Button type="button" variant="outline" isDisabled={isSubmitting} onPress={onCancel}>{t("pages.uom.cancel")}</Button>
          <Button type="submit" isDisabled={isSubmitting}>
            {isSubmitting ? <Spinner data-icon="inline-start" aria-hidden="true" /> : <Save data-icon="inline-start" aria-hidden="true" />}
            {t(isSubmitting ? (mode === "create" ? "pages.uom.creating" : "pages.uom.saving") : (mode === "create" ? "pages.uom.create" : "pages.uom.saveChanges"))}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

export function UomPageHeading({ title, description, onBack }: { title: string; description: string; onBack: () => void }) {
  const { t } = useTranslation("common");
  return (
    <div className="mx-auto flex w-full max-w-xl flex-col gap-3">
      <Button className="w-fit" type="button" variant="outline" onPress={onBack}>
        <ArrowLeft data-icon="inline-start" aria-hidden="true" />
        {t("pages.uom.back")}
      </Button>
      <PageHeader><div><h2>{title}</h2><p>{description}</p></div></PageHeader>
    </div>
  );
}
