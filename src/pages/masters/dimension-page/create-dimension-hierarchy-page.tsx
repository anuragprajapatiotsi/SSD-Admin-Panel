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
import { createDimensionRelationship, listDimensionMembers, listDimensionRelationships, type DimensionMember } from "../../../api/dimensions.api";

const initialForm = { parent_member_code: "", child_member_code: "", relationship_type: "PARENT_CHILD", sort_order: 0, is_active: true };

function DimensionHierarchyPage() {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const { dimensionCode = "", parentCode = "", childCode = "" } = useParams<{ dimensionCode?: string; parentCode?: string; childCode?: string }>();
  const [form, setForm] = useState(initialForm);
  const [members, setMembers] = useState<DimensionMember[]>([]);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const isEdit = Boolean(parentCode && childCode);
  const returnToDimension = () => navigate(`/masters/dimensions/${encodeURIComponent(dimensionCode)}`);

  useEffect(() => {
    if (!dimensionCode) return;
    void listDimensionMembers(dimensionCode, 500).then((response) => setMembers(response.data ?? [])).catch(() => setMembers([]));
    if (!isEdit) return;
    void listDimensionRelationships(dimensionCode).then((response) => {
      const relationship = (response.data ?? []).find((item) => item.parent_member_code === parentCode && item.child_member_code === childCode);
      if (!relationship) throw new Error(t("pages.dimensions.hierarchyForm.errors.notFound"));
      setForm({ parent_member_code: relationship.parent_member_code ?? parentCode, child_member_code: relationship.child_member_code ?? childCode, relationship_type: relationship.relationship_type ?? "PARENT_CHILD", sort_order: Number(relationship.sort_order) || 0, is_active: relationship.is_active !== false });
    }).catch((loadError) => setError(loadError instanceof Error ? loadError.message : t("pages.dimensions.hierarchyForm.errors.load")));
  }, [childCode, dimensionCode, isEdit, parentCode]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!dimensionCode || !form.parent_member_code || !form.child_member_code) { setError(t("pages.dimensions.hierarchyForm.errors.required")); return; }
    if (form.parent_member_code === form.child_member_code) { setError(t("pages.dimensions.hierarchyForm.errors.different")); return; }
    setIsSaving(true); setError("");
    try {
      await createDimensionRelationship(dimensionCode, { parent_member_code: form.parent_member_code, child_member_code: form.child_member_code, relationship_type: form.relationship_type, sort_order: Number(form.sort_order) || 0, is_active: form.is_active });
      returnToDimension();
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : t(isEdit ? "pages.dimensions.hierarchyForm.errors.update" : "pages.dimensions.hierarchyForm.errors.create")); }
    finally { setIsSaving(false); }
  }

  const memberOptions = <><NativeSelectOption value="">{t("pages.dimensions.shared.selectMember")}</NativeSelectOption>{members.map((member) => <NativeSelectOption value={member.member_code ?? ""} key={member.member_code}>{member.name ?? member.member_code}</NativeSelectOption>)}</>;
  return <PageSection className="flex min-w-0 flex-col gap-4"><div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
    <Button className="w-fit" type="button" variant="outline" onPress={returnToDimension}><ArrowLeft data-icon="inline-start" aria-hidden="true" /> {t("pages.dimensions.actions.back")}</Button>
    <PageHeader><div><h2>{t(isEdit ? "pages.dimensions.hierarchyForm.editTitle" : "pages.dimensions.hierarchyForm.createTitle")}</h2><p>{t(isEdit ? "pages.dimensions.hierarchyForm.editDescription" : "pages.dimensions.hierarchyForm.createDescription")}</p></div></PageHeader>
    {error && <div className="rounded-md bg-muted p-3 text-sm text-destructive" role="alert">{error}</div>}
    <form className="!overflow-visible !p-0" onSubmit={submit}><Card><CardContent className="flex flex-col gap-4"><div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
      <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-foreground [&>small]:font-normal [&>small]:text-muted-foreground">{t("pages.dimensions.hierarchyForm.fields.parent")} *<NativeSelect autoFocus required disabled={isEdit} value={form.parent_member_code} onChange={(event) => setForm((current) => ({ ...current, parent_member_code: event.target.value }))}>{memberOptions}</NativeSelect></label>
      <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-foreground [&>small]:font-normal [&>small]:text-muted-foreground">{t("pages.dimensions.hierarchyForm.fields.child")} *<NativeSelect required disabled={isEdit} value={form.child_member_code} onChange={(event) => setForm((current) => ({ ...current, child_member_code: event.target.value }))}>{memberOptions}</NativeSelect></label>
      <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-foreground [&>small]:font-normal [&>small]:text-muted-foreground">{t("pages.dimensions.hierarchyForm.fields.type")}<Input value={form.relationship_type} onChange={(event) => setForm((current) => ({ ...current, relationship_type: event.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "_") }))} /></label>
      <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-foreground [&>small]:font-normal [&>small]:text-muted-foreground">{t("pages.dimensions.memberForm.fields.sortOrder")}<Input min="0" type="number" value={form.sort_order} onChange={(event) => setForm((current) => ({ ...current, sort_order: Number(event.target.value) }))} /></label>
    </div><FieldLabel><Field orientation="horizontal" data-disabled={isSaving || undefined}><Switch aria-label={t("pages.dimensions.hierarchyForm.fields.active")} isDisabled={isSaving} isSelected={form.is_active} onChange={(isSelected) => setForm((current) => ({ ...current, is_active: isSelected }))} /><FieldContent><FieldTitle>{t("pages.dimensions.status.active")}</FieldTitle><FieldDescription>{t("pages.dimensions.hierarchyForm.activeHelp")}</FieldDescription></FieldContent></Field></FieldLabel></CardContent>
    <CardFooter className="flex-col-reverse gap-2 border-t sm:flex-row sm:justify-end"><Button className="w-full sm:w-auto" type="button" variant="outline" isDisabled={isSaving} onPress={returnToDimension}>{t("pages.dimensions.form.cancel")}</Button><Button className="w-full sm:w-auto" type="submit" isDisabled={isSaving || !form.parent_member_code || !form.child_member_code}><Save aria-hidden="true" />{t(isSaving ? "pages.dimensions.form.saving" : isEdit ? "pages.dimensions.hierarchyForm.update" : "pages.dimensions.hierarchyForm.create")}</Button></CardFooter></Card></form>
  </div></PageSection>;
}

export function CreateDimensionHierarchyPage() { return <DimensionHierarchyPage />; }
export function EditDimensionHierarchyPage() { return <DimensionHierarchyPage />; }
