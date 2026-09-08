import { NativeSelectOption, NativeSelect } from "@/components/ui/native-select";
import { PageSection, PageHeader } from "@/components/common/page-layout";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Field, FieldContent, FieldDescription, FieldLabel, FieldTitle } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Plus, Save, Trash2 } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { createDimensionRollupRule, listDimensionMembers, listDimensionRollupRules, type DimensionMember } from "../../../api/dimensions.api";

const initialForm = { parent_member_code: "", rule_code: "", entry_mode: "MANUAL_WITH_VALIDATION", aggregation_method: "SUM", measure_code: "", weight_measure_code: "", validation_rule_code: "", is_active: true };
const initialChild = { member_code: "", child_order: 1, child_weight: "" };

function DimensionRollupPage() {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const { dimensionCode = "", parentCode = "", ruleCode = "" } = useParams<{ dimensionCode?: string; parentCode?: string; ruleCode?: string }>();
  const [form, setForm] = useState(initialForm);
  const [children, setChildren] = useState([initialChild]);
  const [members, setMembers] = useState<DimensionMember[]>([]);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const isEdit = Boolean(parentCode && ruleCode);
  const returnToDimension = () => navigate(`/masters/dimensions/${encodeURIComponent(dimensionCode)}`);

  useEffect(() => {
    if (!dimensionCode) return;
    void listDimensionMembers(dimensionCode, 500).then((response) => setMembers(response.data ?? [])).catch(() => setMembers([]));
    if (!isEdit) return;
    void listDimensionRollupRules(dimensionCode).then((response) => {
      const rollup = (response.data ?? []).find((item) => item.parent_member_code === parentCode && item.rule_code === ruleCode);
      if (!rollup) throw new Error(t("pages.dimensions.rollupForm.errors.notFound"));
      setForm({ parent_member_code: rollup.parent_member_code ?? parentCode, rule_code: rollup.rule_code ?? ruleCode, entry_mode: rollup.entry_mode ?? "MANUAL_WITH_VALIDATION", aggregation_method: rollup.aggregation_method ?? "SUM", measure_code: rollup.measure_code ?? "", weight_measure_code: rollup.weight_measure_code ?? "", validation_rule_code: rollup.validation_rule_code ?? "", is_active: rollup.is_active !== false });
      setChildren(rollup.children?.length ? rollup.children.map((child, index) => ({ member_code: String(child.member_code ?? child.child_member_code ?? ""), child_order: Number(child.child_order) || index + 1, child_weight: child.child_weight === undefined || child.child_weight === null ? "" : String(child.child_weight) })) : [initialChild]);
    }).catch((loadError) => setError(loadError instanceof Error ? loadError.message : t("pages.dimensions.rollupForm.errors.load")));
  }, [dimensionCode, isEdit, parentCode, ruleCode]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!dimensionCode || !form.parent_member_code) { setError(t("pages.dimensions.rollupForm.errors.required")); return; }
    setIsSaving(true); setError("");
    try {
      await createDimensionRollupRule(dimensionCode, { parent_member_code: form.parent_member_code, rule_code: form.rule_code.trim() || undefined, entry_mode: form.entry_mode, aggregation_method: form.aggregation_method, measure_code: form.measure_code.trim() || undefined, weight_measure_code: form.weight_measure_code.trim() || undefined, validation_rule_code: form.validation_rule_code.trim() || undefined, is_active: form.is_active, children: children.filter((child) => child.member_code).map((child, index) => ({ member_code: child.member_code, child_order: Number(child.child_order) || index + 1, child_weight: child.child_weight === "" ? undefined : Number(child.child_weight), is_active: true })) });
      returnToDimension();
    } catch (saveError) { setError(saveError instanceof Error ? saveError.message : t(isEdit ? "pages.dimensions.rollupForm.errors.update" : "pages.dimensions.rollupForm.errors.create")); }
    finally { setIsSaving(false); }
  }

  const memberOptions = <><NativeSelectOption value="">{t("pages.dimensions.shared.selectMember")}</NativeSelectOption>{members.map((member) => <NativeSelectOption value={member.member_code ?? ""} key={member.member_code}>{member.name ?? member.member_code}</NativeSelectOption>)}</>;
  return <PageSection className="flex min-w-0 flex-col gap-4"><div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
    <Button className="w-fit" type="button" variant="outline" onPress={returnToDimension}><ArrowLeft data-icon="inline-start" aria-hidden="true" /> {t("pages.dimensions.actions.back")}</Button>
    <PageHeader><div><h2>{t(isEdit ? "pages.dimensions.rollupForm.editTitle" : "pages.dimensions.rollupForm.createTitle")}</h2><p>{t(isEdit ? "pages.dimensions.rollupForm.editDescription" : "pages.dimensions.rollupForm.createDescription")}</p></div></PageHeader>
    {error && <div className="rounded-md bg-muted p-3 text-sm text-destructive" role="alert">{error}</div>}
    <form className="!overflow-visible !p-0" onSubmit={submit}><Card><CardContent className="flex flex-col gap-4"><div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
      <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-foreground [&>small]:font-normal [&>small]:text-muted-foreground">{t("pages.dimensions.rollupForm.fields.parent")} *<NativeSelect autoFocus required disabled={isEdit} value={form.parent_member_code} onChange={(event) => setForm((current) => ({ ...current, parent_member_code: event.target.value }))}>{memberOptions}</NativeSelect></label>
      <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-foreground [&>small]:font-normal [&>small]:text-muted-foreground">{t("pages.dimensions.rollupForm.fields.ruleCode")}<Input readOnly={isEdit} value={form.rule_code} onChange={(event) => setForm((current) => ({ ...current, rule_code: event.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "_") }))} /></label>
      <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-foreground [&>small]:font-normal [&>small]:text-muted-foreground">{t("pages.dimensions.rollupForm.fields.entryMode")}<NativeSelect value={form.entry_mode} onChange={(event) => setForm((current) => ({ ...current, entry_mode: event.target.value }))}><NativeSelectOption value="MANUAL">{t("pages.dimensions.rollupForm.entryModes.manual")}</NativeSelectOption><NativeSelectOption value="DERIVED">{t("pages.dimensions.rollupForm.entryModes.derived")}</NativeSelectOption><NativeSelectOption value="MANUAL_WITH_VALIDATION">{t("pages.dimensions.rollupForm.entryModes.manualValidation")}</NativeSelectOption></NativeSelect></label>
      <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-foreground [&>small]:font-normal [&>small]:text-muted-foreground">{t("pages.dimensions.rollupForm.fields.aggregation")}<NativeSelect value={form.aggregation_method} onChange={(event) => setForm((current) => ({ ...current, aggregation_method: event.target.value }))}><NativeSelectOption value="SUM">{t("pages.dimensions.rollupForm.aggregations.sum")}</NativeSelectOption><NativeSelectOption value="AVG">{t("pages.dimensions.rollupForm.aggregations.average")}</NativeSelectOption><NativeSelectOption value="WEIGHTED_AVG">{t("pages.dimensions.rollupForm.aggregations.weightedAverage")}</NativeSelectOption><NativeSelectOption value="MIN">{t("pages.dimensions.rollupForm.aggregations.minimum")}</NativeSelectOption><NativeSelectOption value="MAX">{t("pages.dimensions.rollupForm.aggregations.maximum")}</NativeSelectOption><NativeSelectOption value="NO_ROLLUP">{t("pages.dimensions.rollupForm.aggregations.none")}</NativeSelectOption></NativeSelect></label>
      <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-foreground [&>small]:font-normal [&>small]:text-muted-foreground">{t("pages.dimensions.rollupForm.fields.measureCode")}<Input value={form.measure_code} onChange={(event) => setForm((current) => ({ ...current, measure_code: event.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "_") }))} /></label>
      <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-foreground [&>small]:font-normal [&>small]:text-muted-foreground">{t("pages.dimensions.rollupForm.fields.weightMeasureCode")}<Input value={form.weight_measure_code} onChange={(event) => setForm((current) => ({ ...current, weight_measure_code: event.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "_") }))} /></label>
    </div><div className="flex min-w-0 flex-col gap-3"><div className="flex items-start justify-between gap-2 [&_h3]:text-sm [&_h3]:font-semibold [&_p]:text-xs [&_p]:text-muted-foreground"><strong>{t("pages.dimensions.rollupForm.children")}</strong><Button variant="outline" type="button" onClick={() => setChildren((current) => [...current, { ...initialChild, child_order: current.length + 1 }])}><Plus size={12} /> {t("pages.dimensions.rollupForm.addChild")}</Button></div>
      {children.map((child, index) => <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2 sm:grid-cols-3 items-end gap-2" key={index}><label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-foreground [&>small]:font-normal [&>small]:text-muted-foreground">{t("pages.dimensions.rollupForm.fields.child")}<NativeSelect value={child.member_code} onChange={(event) => setChildren((current) => current.map((item, childIndex) => childIndex === index ? { ...item, member_code: event.target.value } : item))}>{memberOptions}</NativeSelect></label><label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-foreground [&>small]:font-normal [&>small]:text-muted-foreground">{t("pages.dimensions.rollupForm.fields.order")}<Input type="number" value={child.child_order} onChange={(event) => setChildren((current) => current.map((item, childIndex) => childIndex === index ? { ...item, child_order: Number(event.target.value) } : item))} /></label><label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-foreground [&>small]:font-normal [&>small]:text-muted-foreground">{t("pages.dimensions.rollupForm.fields.weight")}<Input type="number" value={child.child_weight} onChange={(event) => setChildren((current) => current.map((item, childIndex) => childIndex === index ? { ...item, child_weight: event.target.value } : item))} /></label><Button size="icon-sm" variant="ghost" className="text-destructive" type="button" aria-label={t("pages.dimensions.rollupForm.removeChild")} onClick={() => setChildren((current) => current.length > 1 ? current.filter((_, childIndex) => childIndex !== index).map((item, childIndex) => ({ ...item, child_order: childIndex + 1 })) : [{ ...initialChild }])}><Trash2 size={13} /></Button></div>)}
    </div><FieldLabel><Field orientation="horizontal" data-disabled={isSaving || undefined}><Switch aria-label={t("pages.dimensions.rollupForm.fields.active")} isDisabled={isSaving} isSelected={form.is_active} onChange={(isSelected) => setForm((current) => ({ ...current, is_active: isSelected }))} /><FieldContent><FieldTitle>{t("pages.dimensions.status.active")}</FieldTitle><FieldDescription>{t("pages.dimensions.rollupForm.activeHelp")}</FieldDescription></FieldContent></Field></FieldLabel></CardContent>
    <CardFooter className="flex-col-reverse gap-2 border-t sm:flex-row sm:justify-end"><Button className="w-full sm:w-auto" type="button" variant="outline" isDisabled={isSaving} onPress={returnToDimension}>{t("pages.dimensions.form.cancel")}</Button><Button className="w-full sm:w-auto" type="submit" isDisabled={isSaving || !form.parent_member_code}><Save aria-hidden="true" />{t(isSaving ? "pages.dimensions.form.saving" : isEdit ? "pages.dimensions.rollupForm.update" : "pages.dimensions.rollupForm.create")}</Button></CardFooter></Card></form>
  </div></PageSection>;
}

export function CreateDimensionRollupPage() { return <DimensionRollupPage />; }
export function EditDimensionRollupPage() { return <DimensionRollupPage />; }
