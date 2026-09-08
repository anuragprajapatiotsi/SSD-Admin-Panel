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
import { createDimensionMember, listDimensionMembers, updateDimensionMember } from "../../../api/dimensions.api";

const initialForm = {
  member_code: "",
  external_code: "",
  sort_order: 0,
  valid_from: "",
  valid_to: "",
  is_active: true,
  name: "",
  name_hi: "",
  short_name: "",
  description: "",
};

function DimensionMemberPage() {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const { dimensionCode = "", memberCode = "" } = useParams<{ dimensionCode?: string; memberCode?: string }>();
  const [form, setForm] = useState(initialForm);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const isEdit = Boolean(memberCode);
  const returnToDimension = () => navigate(`/masters/dimensions/${encodeURIComponent(dimensionCode)}`);

  useEffect(() => {
    if (!dimensionCode || !memberCode) return;
    void listDimensionMembers(dimensionCode, 500)
      .then((response) => {
        const member = (response.data ?? []).find((item) => item.member_code === memberCode);
        if (!member) throw new Error(t("pages.dimensions.memberForm.errors.notFound"));
        setForm({
          member_code: member.member_code ?? memberCode,
          external_code: member.external_code ?? "",
          sort_order: Number(member.sort_order) || 0,
          valid_from: member.valid_from ?? "",
          valid_to: member.valid_to ?? "",
          is_active: member.is_active !== false,
          name: member.name ?? "",
          name_hi: member.name_hi ?? "",
          short_name: member.short_name ?? "",
          description: member.description ?? "",
        });
      })
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : t("pages.dimensions.memberForm.errors.load")));
  }, [dimensionCode, memberCode]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!dimensionCode || !form.name.trim()) {
      setError(t("pages.dimensions.memberForm.errors.required"));
      return;
    }
    setIsSaving(true);
    setError("");
    try {
      const payload = {
        member_code: form.member_code,
        external_code: form.external_code.trim() || undefined,
        sort_order: Number(form.sort_order) || 0,
        valid_from: form.valid_from || undefined,
        valid_to: form.valid_to || undefined,
        is_active: form.is_active,
        name: form.name.trim(),
        name_hi: form.name_hi.trim() || undefined,
        short_name: form.short_name.trim() || undefined,
        description: form.description.trim() || undefined,
      };
      if (isEdit) {
        await updateDimensionMember(dimensionCode, memberCode, payload);
      } else {
        await createDimensionMember(dimensionCode, payload);
      }
      returnToDimension();
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : t(isEdit ? "pages.dimensions.memberForm.errors.update" : "pages.dimensions.memberForm.errors.create"));
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <PageSection className="flex min-w-0 flex-col gap-4">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
        <Button className="w-fit" type="button" variant="outline" onPress={returnToDimension}>
          <ArrowLeft data-icon="inline-start" aria-hidden="true" /> {t("pages.dimensions.actions.back")}
        </Button>
        <PageHeader>
            <div><h2>{t(isEdit ? "pages.dimensions.memberForm.editTitle" : "pages.dimensions.memberForm.createTitle")}</h2><p>{t(isEdit ? "pages.dimensions.memberForm.editDescription" : "pages.dimensions.memberForm.createDescription")}</p></div>
        </PageHeader>
        {error && <div className="rounded-md bg-muted p-3 text-sm text-destructive" role="alert">{error}</div>}
        <form className="!overflow-visible !p-0" onSubmit={submit}>
          <Card>
            <CardContent className="flex flex-col gap-4">
              <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-foreground [&>small]:font-normal [&>small]:text-muted-foreground">{t("pages.dimensions.memberForm.fields.code")}<Input readOnly={isEdit} value={form.member_code} onChange={(event) => setForm((current) => ({ ...current, member_code: event.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "_") }))} /></label>
                <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-foreground [&>small]:font-normal [&>small]:text-muted-foreground">{t("pages.dimensions.memberForm.fields.name")} *<Input autoFocus required value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} /></label>
                <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-foreground [&>small]:font-normal [&>small]:text-muted-foreground">{t("pages.dimensions.memberForm.fields.shortName")}<Input value={form.short_name} onChange={(event) => setForm((current) => ({ ...current, short_name: event.target.value }))} /></label>
                {/* <label className="form-field">Hindi name<input placeholder="Hindi name, optional" value={form.name_hi} onChange={(event) => setForm((current) => ({ ...current, name_hi: event.target.value }))} /></label> */}
                <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-foreground [&>small]:font-normal [&>small]:text-muted-foreground">{t("pages.dimensions.memberForm.fields.externalCode")}<Input value={form.external_code} onChange={(event) => setForm((current) => ({ ...current, external_code: event.target.value }))} /></label>
                <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-foreground [&>small]:font-normal [&>small]:text-muted-foreground">{t("pages.dimensions.memberForm.fields.validFrom")}<Input type="date" value={form.valid_from} onChange={(event) => setForm((current) => ({ ...current, valid_from: event.target.value }))} /></label>
                <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-foreground [&>small]:font-normal [&>small]:text-muted-foreground">{t("pages.dimensions.memberForm.fields.validTo")}<Input type="date" value={form.valid_to} onChange={(event) => setForm((current) => ({ ...current, valid_to: event.target.value }))} /></label>
                <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-foreground [&>small]:font-normal [&>small]:text-muted-foreground">{t("pages.dimensions.memberForm.fields.sortOrder")}<Input min="0" type="number" value={form.sort_order} onChange={(event) => setForm((current) => ({ ...current, sort_order: Number(event.target.value) }))} /></label>
              </div>
              {/* <label>Description<textarea value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} /></label> */}
              <FieldLabel>
                <Field orientation="horizontal" data-disabled={isSaving || undefined}>
                  <Switch aria-label={t("pages.dimensions.memberForm.fields.active")} isDisabled={isSaving} isSelected={form.is_active} onChange={(isSelected) => setForm((current) => ({ ...current, is_active: isSelected }))} />
                  <FieldContent><FieldTitle>{t("pages.dimensions.status.active")}</FieldTitle><FieldDescription>{t("pages.dimensions.memberForm.activeHelp")}</FieldDescription></FieldContent>
                </Field>
              </FieldLabel>
            </CardContent>
            <CardFooter className="flex-col-reverse gap-2 border-t sm:flex-row sm:justify-end">
              <Button className="w-full sm:w-auto" type="button" variant="outline" isDisabled={isSaving} onPress={returnToDimension}>{t("pages.dimensions.form.cancel")}</Button>
              <Button className="w-full sm:w-auto" type="submit" isDisabled={isSaving || !form.name.trim()}><Save aria-hidden="true" />{t(isSaving ? "pages.dimensions.form.saving" : isEdit ? "pages.dimensions.memberForm.update" : "pages.dimensions.memberForm.create")}</Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </PageSection>
  );
}

export function CreateDimensionMemberPage() {
  return <DimensionMemberPage />;
}

export function EditDimensionMemberPage() {
  return <DimensionMemberPage />;
}
