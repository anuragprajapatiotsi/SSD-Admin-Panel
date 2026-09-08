import { PageSection, PageHeader } from "@/components/common/page-layout";

import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Field, FieldContent, FieldDescription, FieldLabel, FieldTitle } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { createDimensionMemberSet, listDimensionMemberSets, updateDimensionMemberSet } from "../../../api/dimensions.api";

const initialForm = { set_code: "", set_type: "CONTROLLED_SCOPE", is_active: true, name: "", description: "" };

function DimensionMemberSetPage() {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const { dimensionCode = "", setCode = "" } = useParams<{ dimensionCode?: string; setCode?: string }>();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const isEdit = Boolean(setCode);
  const returnToDimension = () => navigate(`/masters/dimensions/${encodeURIComponent(dimensionCode)}`);

  useEffect(() => {
    if (!dimensionCode || !setCode) return;
    void listDimensionMemberSets(dimensionCode).then((response) => {
      const memberSet = (response.data ?? []).find((item) => item.set_code === setCode);
      if (!memberSet) throw new Error(t("pages.dimensions.setForm.errors.notFound"));
      setForm({ set_code: memberSet.set_code ?? setCode, set_type: memberSet.set_type ?? "CONTROLLED_SCOPE", is_active: memberSet.is_active !== false, name: memberSet.name ?? "", description: memberSet.description ?? "" });
    }).catch((loadError) => setError(loadError instanceof Error ? loadError.message : t("pages.dimensions.setForm.errors.load")));
  }, [dimensionCode, setCode]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!dimensionCode || !form.name.trim()) { setError(t("pages.dimensions.setForm.errors.required")); return; }
    setIsSaving(true); setError("");
    try {
      const payload = { set_code: form.set_code.trim() || undefined, set_type: form.set_type, is_active: form.is_active, name: form.name.trim(), description: form.description.trim() || undefined };
      if (isEdit) await updateDimensionMemberSet(dimensionCode, setCode, payload); else await createDimensionMemberSet(dimensionCode, payload);
      returnToDimension();
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : t(isEdit ? "pages.dimensions.setForm.errors.update" : "pages.dimensions.setForm.errors.create")); }
    finally { setIsSaving(false); }
  }

  return <PageSection className="flex min-w-0 flex-col gap-4"><div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
    <Button className="w-fit" type="button" variant="outline" onPress={returnToDimension}><ArrowLeft data-icon="inline-start" aria-hidden="true" /> {t("pages.dimensions.actions.back")}</Button>
    <PageHeader><div><h2>{t(isEdit ? "pages.dimensions.setForm.editTitle" : "pages.dimensions.setForm.createTitle")}</h2><p>{t(isEdit ? "pages.dimensions.setForm.editDescription" : "pages.dimensions.setForm.createDescription")}</p></div></PageHeader>
    {error && <div className="rounded-md bg-muted p-3 text-sm text-destructive" role="alert">{error}</div>}
    <form className="!overflow-visible !p-0" onSubmit={submit}><Card><CardContent className="flex flex-col gap-4"><div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
      <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-foreground [&>small]:font-normal [&>small]:text-muted-foreground">{t("pages.dimensions.setForm.fields.code")}<Input autoFocus={!isEdit} readOnly={isEdit} value={form.set_code} onChange={(event) => setForm((current) => ({ ...current, set_code: event.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "_") }))} /></label>
      <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-foreground [&>small]:font-normal [&>small]:text-muted-foreground">{t("pages.dimensions.setForm.fields.name")} *<Input autoFocus={isEdit} required value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} /></label>
      <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-foreground [&>small]:font-normal [&>small]:text-muted-foreground">{t("pages.dimensions.setForm.fields.type")}<Input value={form.set_type} onChange={(event) => setForm((current) => ({ ...current, set_type: event.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "_") }))} /></label>
    </div><label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-foreground [&>small]:font-normal [&>small]:text-muted-foreground">{t("pages.dimensions.setForm.fields.description")}<Textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} /></label>
    <FieldLabel><Field orientation="horizontal" data-disabled={isSaving || undefined}><Switch aria-label={t("pages.dimensions.setForm.fields.active")} isDisabled={isSaving} isSelected={form.is_active} onChange={(isSelected) => setForm((current) => ({ ...current, is_active: isSelected }))} /><FieldContent><FieldTitle>{t("pages.dimensions.status.active")}</FieldTitle><FieldDescription>{t("pages.dimensions.setForm.activeHelp")}</FieldDescription></FieldContent></Field></FieldLabel></CardContent>
    <CardFooter className="flex-col-reverse gap-2 border-t sm:flex-row sm:justify-end"><Button className="w-full sm:w-auto" type="button" variant="outline" isDisabled={isSaving} onPress={returnToDimension}>{t("pages.dimensions.form.cancel")}</Button><Button className="w-full sm:w-auto" type="submit" isDisabled={isSaving || !form.name.trim()}><Save aria-hidden="true" />{t(isSaving ? "pages.dimensions.form.saving" : isEdit ? "pages.dimensions.setForm.update" : "pages.dimensions.setForm.create")}</Button></CardFooter></Card></form>
  </div></PageSection>;
}

export function CreateDimensionMemberSetPage() { return <DimensionMemberSetPage />; }
export function EditDimensionMemberSetPage() { return <DimensionMemberSetPage />; }
