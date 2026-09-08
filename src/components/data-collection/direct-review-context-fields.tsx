import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { useDirectReviewSession } from "@/hooks/use-direct-review-session";
import type { ReviewOption } from "@/hooks/use-direct-review-lookups";
import { Combobox, ComboboxInput, ComboboxContent, ComboboxList, ComboboxItem, ComboboxEmpty } from "@/components/ui/combobox";
import { Field, FieldLabel, FieldGroup, FieldError } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader } from "@/components/common/loader";

type Session = ReturnType<typeof useDirectReviewSession>;
type Options = Session["lookups"]["parents"];
function Lookup({ label, value, query, disabled, onChange, error }: {
  label: string; value: string; query: Options; disabled: boolean;
  onChange: (option: ReviewOption | undefined) => void; error?: string;
}) {
  const { t } = useTranslation("ingestion");
  return <Field data-invalid={Boolean(error)}>
    <FieldLabel>{label}</FieldLabel>
    <Combobox aria-label={label} items={query.options} selectedKey={value || null} isDisabled={disabled}
      onSelectionChange={(key) => onChange(query.options.find((option) => option.id === key))}>
      <ComboboxInput className="w-full" disabled={disabled} />
      <ComboboxContent>
        <ComboboxList items={query.options} renderEmptyState={() => <ComboboxEmpty>{t("directReview.noOptions")}</ComboboxEmpty>}>
          {(option) => <ComboboxItem id={option.id} textValue={option.label}>{option.label}</ComboboxItem>}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
    {query.isFetching ? <Loader text={t("directReview.loadingOptions")} /> : null}
    {query.isError ? <><FieldError>{t("directReview.optionsError")}</FieldError><Button type="button" variant="outline" size="sm" isDisabled={disabled || query.isFetching} onPress={() => void query.refetch()}>{t("dataCollection.error.retry")}</Button></> : null}
    {query.hasNextPage ? <Button type="button" variant="ghost" size="sm" isDisabled={disabled || query.isFetching} onPress={() => void query.fetchNextPage()}>{t("dataCollection.sendTemplate.combobox.loadMore")}</Button> : null}
    {error ? <FieldError>{error}</FieldError> : null}
  </Field>;
}

export function DirectReviewContextFields({ session }: { session: Session }) {
  const { t } = useTranslation("ingestion");
  const { lookups, form, busy } = session;
  const { errors } = form.formState;
  if (!lookups.changing) return null;
  return <FieldGroup className="gap-3" data-review-context onKeyDown={(event) => { if (event.key === "Enter") event.stopPropagation(); }}>
    {session.choice === "CORRECT_VALUE" ? <Field data-invalid={Boolean(errors.code)}>
      <FieldLabel htmlFor="review-corrected-code">{t("directReview.correctedCode")}</FieldLabel>
      <Input id="review-corrected-code" disabled={busy} maxLength={160} aria-invalid={Boolean(errors.code)} {...form.register("code")} />
      <FieldError>{errors.code?.message}</FieldError>
    </Field> : null}
    {lookups.member ? <Controller control={form.control} name="scopeId" render={({ field }) => <Lookup
      label={t("directReview.dimensionScope")} query={lookups.scopes} disabled={busy}
      value={field.value || lookups.scopes.options.find((option) => option.code === lookups.dimensionCode)?.id || ""}
      error={errors.scopeId?.message} onChange={(option) => {
        field.onChange(option?.id ?? ""); form.setValue("scopeCode", option?.code ?? ""); form.setValue("parentId", "");
      }} />} /> : null}
    {lookups.district ? <Controller control={form.control} name="countryCode" render={({ field }) => <Lookup
      label={t("directReview.country")} query={lookups.countries} disabled={busy}
      value={lookups.countries.options.find((option) => option.code === field.value)?.id ?? ""}
      onChange={(option) => { field.onChange(option?.code ?? ""); form.setValue("parentId", ""); }} />} /> : null}
    {lookups.supportsParent ? <Controller control={form.control} name="parentId" render={({ field }) => <Lookup
      label={t(lookups.state ? "directReview.country" : lookups.district ? "directReview.state" : "directReview.parentRecord")}
      query={lookups.parents} value={field.value} disabled={busy || (lookups.district && !form.getValues("countryCode")) || (lookups.member && !lookups.dimensionCode)}
      error={errors.parentId?.message} onChange={(option) => field.onChange(option?.id ?? "")} />} /> : null}
    {!lookups.supportsParent && errors.parentId ? <FieldError>{errors.parentId.message}</FieldError> : null}
  </FieldGroup>;
}
