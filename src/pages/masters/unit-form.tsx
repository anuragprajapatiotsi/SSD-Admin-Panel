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
import { useMemo, useRef } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { generateNameCode } from "@/utils/generate-name-code";
import type { MasterRecord } from "../../api/masters-reference.api";
import { createUnitSchema, DEFAULT_UNIT_VALUES, ORGANIZATION_TYPES, type UnitFormValues } from "./unit-schema";

export function UnitForm({ defaultValues = DEFAULT_UNIT_VALUES, mode = "create", organizations, onCancel, onSubmit }: {
  defaultValues?: UnitFormValues; mode?: "create" | "edit"; organizations: MasterRecord[];
  onCancel: () => void; onSubmit: (values: UnitFormValues) => Promise<void>;
}) {
  const { t } = useTranslation("common");
  const unitSchema = useMemo(() => createUnitSchema(t), [t]);
  const generatedCode = useRef<{ name: string; code: string } | null>(null);
  const { control, formState: { errors, isSubmitting }, handleSubmit, register, getValues, setValue } = useForm<UnitFormValues>({
    defaultValues, mode: "onSubmit", reValidateMode: "onChange", resolver: zodResolver(unitSchema),
  });
  const parentOptions = organizations.filter((record) => String(record.organization_code) !== defaultValues.organization_code);

  return (
    <form className="mx-auto w-full max-w-xl" noValidate onSubmit={(event) => {
      if (isSubmitting) { event.preventDefault(); return; }
      if (mode === "create") {
        const name = getValues("name").trim();
        // Keep the same identifier on retries, but regenerate if the name changes.
        const code = generatedCode.current?.name === name
          ? generatedCode.current.code
          : generateNameCode(name);
        generatedCode.current = { name, code };
        setValue("organization_code", code);
      }
      void handleSubmit(onSubmit)(event);
    }}>
      <Card>
        <CardHeader className="sr-only"><CardTitle>{t(mode === "create" ? "pages.sourcesMinistries.createTitle" : "pages.sourcesMinistries.editTitle")}</CardTitle><CardDescription>{t("pages.sourcesMinistries.organizationForm.formDescription")}</CardDescription></CardHeader>
        <CardContent className="flex flex-col gap-5">
          <FieldGroup>
            <Field className="gap-1" data-invalid={Boolean(errors.name)}><FieldLabel htmlFor="unit-name">{t("pages.sourcesMinistries.organizationForm.fields.name")} <span className="text-destructive" aria-hidden="true">*</span></FieldLabel><Input id="unit-name" autoFocus placeholder={t("pages.sourcesMinistries.organizationForm.placeholders.name")} aria-invalid={Boolean(errors.name)} aria-required="true" disabled={isSubmitting} {...register("name")} /><FieldError>{errors.name?.message}</FieldError></Field>
            <Controller control={control} name="organization_type" render={({ field }) => <Field className="gap-1" data-invalid={Boolean(errors.organization_type)}><FieldLabel htmlFor="unit-type">{t("pages.sourcesMinistries.organizationForm.fields.type")} <span className="text-destructive" aria-hidden="true">*</span></FieldLabel><Select aria-label={t("pages.sourcesMinistries.organizationForm.fields.type")} selectedKey={field.value} isDisabled={isSubmitting} onSelectionChange={(key) => field.onChange(String(key))}><SelectTrigger id="unit-type" aria-invalid={Boolean(errors.organization_type)} aria-required="true"><SelectValue /></SelectTrigger><SelectContent>{ORGANIZATION_TYPES.map((type) => <SelectItem id={type} key={type}>{t(`pages.sourcesMinistries.types.${type}`)}</SelectItem>)}</SelectContent></Select><FieldError>{errors.organization_type?.message}</FieldError></Field>} />
            {mode === "edit" ? (
              <>
                <Controller control={control} name="parent_organization_code" render={({ field }) => <Field className="gap-1"><FieldLabel>{t("pages.sourcesMinistries.organizationForm.fields.parent")}</FieldLabel><Select aria-label={t("pages.sourcesMinistries.organizationForm.fields.parent")} selectedKey={field.value || "NONE"} isDisabled={isSubmitting} onSelectionChange={(key) => field.onChange(key === "NONE" ? "" : String(key))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectItem id="NONE">{t("pages.sourcesMinistries.organizationForm.noParent")}</SelectItem>{parentOptions.map((record) => { const code = String(record.organization_code); return <SelectItem id={code} key={code}>{String(record.name ?? code)} ({code})</SelectItem>; })}</SelectContent></Select><FieldDescription>{t("pages.sourcesMinistries.organizationForm.parentHelp")}</FieldDescription></Field>} />
                <Field className="gap-1" data-invalid={Boolean(errors.short_code)}><FieldLabel htmlFor="unit-short-code">{t("pages.sourcesMinistries.organizationForm.fields.shortCode")}</FieldLabel><Input id="unit-short-code" placeholder={t("pages.sourcesMinistries.organizationForm.placeholders.shortCode")} aria-invalid={Boolean(errors.short_code)} disabled={isSubmitting} {...register("short_code")} /><FieldError>{errors.short_code?.message}</FieldError></Field>
                <Field className="gap-1" data-invalid={Boolean(errors.description)}><FieldLabel htmlFor="unit-description">{t("pages.sourcesMinistries.organizationForm.fields.description")}</FieldLabel><Textarea id="unit-description" rows={3} placeholder={t("pages.sourcesMinistries.organizationForm.placeholders.description")} aria-invalid={Boolean(errors.description)} disabled={isSubmitting} {...register("description")} /><FieldError>{errors.description?.message}</FieldError></Field>
              </>
            ) : null}
          </FieldGroup>
          {mode === "edit" ? <FieldGroup><Controller control={control} name="is_active" render={({ field }) => <FieldLabel><Field orientation="horizontal"><Checkbox isDisabled={isSubmitting} isSelected={field.value} onBlur={field.onBlur} onChange={field.onChange} /><FieldContent><FieldTitle>{t("pages.sourcesMinistries.organizationForm.fields.status")}</FieldTitle><FieldDescription>{t("pages.sourcesMinistries.organizationForm.statusHelp")}</FieldDescription></FieldContent></Field></FieldLabel>} /></FieldGroup> : null}
        </CardContent>
        <CardFooter className="justify-end gap-2 border-t"><Button type="button" variant="outline" isDisabled={isSubmitting} onPress={onCancel}>{t("pages.sourcesMinistries.cancel")}</Button><Button type="submit" isDisabled={isSubmitting}>{isSubmitting ? <Spinner data-icon="inline-start" aria-hidden="true" /> : <Save data-icon="inline-start" aria-hidden="true" />}{t(isSubmitting ? mode === "create" ? "pages.sourcesMinistries.organizationForm.creating" : "pages.sourcesMinistries.organizationForm.saving" : mode === "create" ? "pages.sourcesMinistries.organizationForm.create" : "pages.sourcesMinistries.organizationForm.save")}</Button></CardFooter>
      </Card>
    </form>
  );
}

export function UnitPageHeading({ title, description, onBack }: { title: string; description: string; onBack: () => void }) {
  const { t } = useTranslation("common");
  return <div className="mx-auto flex w-full max-w-xl flex-col gap-3"><Button className="w-fit" type="button" variant="outline" onPress={onBack}><ArrowLeft data-icon="inline-start" aria-hidden="true" />{t("pages.sourcesMinistries.back")}</Button><PageHeader><div><h2>{title}</h2><p>{description}</p></div></PageHeader></div>;
}
