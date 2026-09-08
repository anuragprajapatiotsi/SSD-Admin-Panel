import { NativeSelectOption, NativeSelect } from "@/components/ui/native-select";
import { PageSection, PageHeader } from "@/components/common/page-layout";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Field, FieldContent, FieldDescription, FieldLabel, FieldTitle } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { createDimensionAlias, listDimensionAliases, listDimensionMembers, type DimensionMember } from "../../../api/dimensions.api";

const initialForm = { member_code: "", alias_type: "SOURCE_CODE", alias_value: "", source_system_code: "", alias_locale_code: "", is_active: true };

function DimensionAliasPage() {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const { dimensionCode = "", memberCode = "", aliasType = "", aliasValue = "" } = useParams<{ dimensionCode?: string; memberCode?: string; aliasType?: string; aliasValue?: string }>();
  const [form, setForm] = useState(initialForm);
  const [members, setMembers] = useState<DimensionMember[]>([]);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const isEdit = Boolean(memberCode && aliasType && aliasValue);
  const returnToDimension = () => navigate(`/masters/dimensions/${encodeURIComponent(dimensionCode)}`);

  useEffect(() => {
    if (!dimensionCode) return;
    void listDimensionMembers(dimensionCode, 500).then((response) => setMembers(response.data ?? [])).catch(() => setMembers([]));
    if (!isEdit) return;
    void listDimensionAliases(dimensionCode).then((response) => {
      const alias = (response.data ?? []).find((item) => item.member_code === memberCode && item.alias_type === aliasType && item.alias_value === aliasValue);
      if (!alias) throw new Error(t("pages.dimensions.aliasForm.errors.notFound"));
      setForm({ member_code: alias.member_code ?? memberCode, alias_type: alias.alias_type ?? aliasType, alias_value: alias.alias_value ?? aliasValue, source_system_code: alias.source_system_code ?? "", alias_locale_code: alias.alias_locale_code ?? "", is_active: alias.is_active !== false });
    }).catch((loadError) => setError(loadError instanceof Error ? loadError.message : t("pages.dimensions.aliasForm.errors.load")));
  }, [aliasType, aliasValue, dimensionCode, isEdit, memberCode]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!dimensionCode || !form.member_code || !form.alias_value.trim()) { setError(t("pages.dimensions.aliasForm.errors.required")); return; }
    setIsSaving(true); setError("");
    try {
      await createDimensionAlias(dimensionCode, { member_code: form.member_code, alias_type: form.alias_type, alias_value: form.alias_value.trim(), source_system_code: form.source_system_code.trim() || undefined, alias_locale_code: form.alias_locale_code.trim() || undefined, is_active: form.is_active });
      returnToDimension();
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : t(isEdit ? "pages.dimensions.aliasForm.errors.update" : "pages.dimensions.aliasForm.errors.create")); }
    finally { setIsSaving(false); }
  }

  const memberOptions = <><NativeSelectOption value="">{t("pages.dimensions.shared.selectMember")}</NativeSelectOption>{members.map((member) => <NativeSelectOption value={member.member_code ?? ""} key={member.member_code}>{member.name ?? member.member_code}</NativeSelectOption>)}</>;
  return <PageSection className="flex min-w-0 flex-col gap-4"><div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
    <Button className="w-fit" type="button" variant="outline" onPress={returnToDimension}><ArrowLeft data-icon="inline-start" aria-hidden="true" /> {t("pages.dimensions.actions.back")}</Button>
    <PageHeader><div><h2>{t(isEdit ? "pages.dimensions.aliasForm.editTitle" : "pages.dimensions.aliasForm.createTitle")}</h2><p>{t(isEdit ? "pages.dimensions.aliasForm.editDescription" : "pages.dimensions.aliasForm.createDescription")}</p></div></PageHeader>
    {error && <div className="rounded-md bg-muted p-3 text-sm text-destructive" role="alert">{error}</div>}
    <form className="!overflow-visible !p-0" onSubmit={submit}><Card><CardContent className="flex flex-col gap-4"><div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
      <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-foreground [&>small]:font-normal [&>small]:text-muted-foreground">{t("pages.dimensions.aliasForm.fields.member")} *<NativeSelect autoFocus required disabled={isEdit} value={form.member_code} onChange={(event) => setForm((current) => ({ ...current, member_code: event.target.value }))}>{memberOptions}</NativeSelect></label>
      <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-foreground [&>small]:font-normal [&>small]:text-muted-foreground">{t("pages.dimensions.aliasForm.fields.type")}<NativeSelect disabled={isEdit} value={form.alias_type} onChange={(event) => setForm((current) => ({ ...current, alias_type: event.target.value }))}><NativeSelectOption value="SOURCE_CODE">{t("pages.dimensions.aliasForm.types.sourceCode")}</NativeSelectOption><NativeSelectOption value="DISPLAY_ALIAS">{t("pages.dimensions.aliasForm.types.displayAlias")}</NativeSelectOption><NativeSelectOption value="LEGACY_CODE">{t("pages.dimensions.aliasForm.types.legacyCode")}</NativeSelectOption><NativeSelectOption value="EXTERNAL_CODE">{t("pages.dimensions.aliasForm.types.externalCode")}</NativeSelectOption><NativeSelectOption value="OTHER">{t("pages.dimensions.aliasForm.types.other")}</NativeSelectOption></NativeSelect></label>
      <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-foreground [&>small]:font-normal [&>small]:text-muted-foreground">{t("pages.dimensions.aliasForm.fields.value")} *<Input required readOnly={isEdit} value={form.alias_value} onChange={(event) => setForm((current) => ({ ...current, alias_value: event.target.value }))} /></label>
      <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-foreground [&>small]:font-normal [&>small]:text-muted-foreground">{t("pages.dimensions.aliasForm.fields.sourceSystem")}<Input placeholder={t("pages.dimensions.aliasForm.placeholders.sourceSystem")} value={form.source_system_code} onChange={(event) => setForm((current) => ({ ...current, source_system_code: event.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "_") }))} /></label>
      <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-foreground [&>small]:font-normal [&>small]:text-muted-foreground">{t("pages.dimensions.aliasForm.fields.locale")}<Input placeholder={t("pages.dimensions.aliasForm.placeholders.locale")} value={form.alias_locale_code} onChange={(event) => setForm((current) => ({ ...current, alias_locale_code: event.target.value }))} /></label>
    </div><FieldLabel><Field orientation="horizontal" data-disabled={isSaving || undefined}><Switch aria-label={t("pages.dimensions.aliasForm.fields.active")} isDisabled={isSaving} isSelected={form.is_active} onChange={(isSelected) => setForm((current) => ({ ...current, is_active: isSelected }))} /><FieldContent><FieldTitle>{t("pages.dimensions.status.active")}</FieldTitle><FieldDescription>{t("pages.dimensions.aliasForm.activeHelp")}</FieldDescription></FieldContent></Field></FieldLabel></CardContent>
    <CardFooter className="flex-col-reverse gap-2 border-t sm:flex-row sm:justify-end"><Button className="w-full sm:w-auto" type="button" variant="outline" isDisabled={isSaving} onPress={returnToDimension}>{t("pages.dimensions.form.cancel")}</Button><Button className="w-full sm:w-auto" type="submit" isDisabled={isSaving || !form.member_code || !form.alias_value.trim()}><Save aria-hidden="true" />{t(isSaving ? "pages.dimensions.form.saving" : isEdit ? "pages.dimensions.aliasForm.update" : "pages.dimensions.aliasForm.create")}</Button></CardFooter></Card></form>
  </div></PageSection>;
}

export function CreateDimensionAliasPage() { return <DimensionAliasPage />; }
export function EditDimensionAliasPage() { return <DimensionAliasPage />; }
