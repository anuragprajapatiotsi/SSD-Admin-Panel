import { PageSection, PageHeader } from "@/components/common/page-layout";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldTitle } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { createGeography, listGeographies, listGeographyLevels, updateGeography, type Geography, type GeographyLevel } from "../../api/dimensions.api";

const GEOGRAPHY_PATH = "/masters/geography";

type GeographyFormValues = {
  geography_code: string;
  name: string;
  name_hi: string;
  level_code: string;
  parent_geography_code: string;
  iso_alpha2_code: string;
  iso_alpha3_code: string;
  census_code: string;
  effective_from: string;
  effective_to: string;
  description: string;
  is_active: boolean;
};

const DEFAULT_VALUES: GeographyFormValues = {
  geography_code: "", name: "", name_hi: "", level_code: "STATE_UT", parent_geography_code: "IND",
  iso_alpha2_code: "", iso_alpha3_code: "", census_code: "", effective_from: "", effective_to: "", description: "", is_active: true,
};

function normalizeCode(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9_]/g, "_").replace(/_+/g, "_");
}

export function CreateGeographyPage() {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const { geographyCode } = useParams();
  const isEdit = Boolean(geographyCode);
  const [values, setValues] = useState(DEFAULT_VALUES);
  const [levels, setLevels] = useState<GeographyLevel[]>([]);
  const [geographies, setGeographies] = useState<Geography[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([
      listGeographyLevels(),
      listGeographies({ statusFilter: "ACTIVE", limit: 500 }),
      isEdit ? listGeographies({ statusFilter: "ALL", searchText: geographyCode, limit: 500 }) : Promise.resolve({ data: [] as Geography[] }),
    ])
      .then(([levelResponse, geographyResponse, recordResponse]) => {
        if (!active) return;
        setLevels(levelResponse.data ?? []);
        setGeographies(geographyResponse.data ?? []);
        if (isEdit) {
          const record = (recordResponse.data ?? []).find((row) => row.geography_code === geographyCode);
          if (!record) throw new Error(t("pages.geographies.create.notFound"));
          setValues({
            geography_code: record.geography_code ?? "", name: record.name ?? "", name_hi: record.name_hi ?? "",
            level_code: record.level_code ?? "", parent_geography_code: record.parent_geography_code ?? "",
            iso_alpha2_code: record.iso_alpha2_code ?? "", iso_alpha3_code: record.iso_alpha3_code ?? "", census_code: record.census_code ?? "",
            effective_from: record.effective_from ?? "", effective_to: record.effective_to ?? "", description: record.description ?? "", is_active: record.is_active !== false,
          });
        }
      })
      .catch((error) => toast.error(t("pages.geographies.create.loadError"), { description: error instanceof Error ? error.message : undefined }))
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [geographyCode, isEdit, t]);

  const parentOptions = useMemo(() => geographies.filter((row) => row.geography_code), [geographies]);
  const update = <K extends keyof GeographyFormValues>(key: K, value: GeographyFormValues[K]) => setValues((current) => ({ ...current, [key]: value }));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!values.geography_code.trim() || !values.name.trim() || !values.level_code) return;
    setIsSubmitting(true);
    try {
      const payload = {
        geography_code: normalizeCode(values.geography_code.trim()), level_code: values.level_code,
        parent_geography_code: values.level_code === "COUNTRY" ? undefined : values.parent_geography_code || undefined,
        name: values.name.trim(), name_hi: values.name_hi.trim() || undefined,
        iso_alpha2_code: values.iso_alpha2_code.trim().toUpperCase() || undefined,
        iso_alpha3_code: values.iso_alpha3_code.trim().toUpperCase() || undefined,
        census_code: values.census_code.trim() || undefined,
        effective_from: values.effective_from || undefined, effective_to: values.effective_to || undefined,
        description: values.description.trim() || undefined, is_active: values.is_active,
      };
      if (isEdit && geographyCode) await updateGeography(geographyCode, payload);
      else await createGeography(payload);
      toast.success(t(isEdit ? "pages.geographies.notifications.updated" : "pages.geographies.notifications.created"));
      navigate(GEOGRAPHY_PATH, { replace: true });
    } catch (error) {
      toast.error(t(isEdit ? "pages.geographies.create.updateError" : "pages.geographies.create.createError"), { description: error instanceof Error ? error.message : t("pages.geographies.create.reviewDetails") });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <PageSection className="flex min-w-0 flex-col gap-4">
      <div className="mx-auto flex w-full max-w-2xl flex-col gap-3">
        <Button className="w-fit" type="button" variant="outline" onPress={() => navigate(GEOGRAPHY_PATH)}>
          <ArrowLeft data-icon="inline-start" aria-hidden="true" />{t("pages.geographies.create.back")}
        </Button>
        <PageHeader><div><h2>{t(isEdit ? "pages.geographies.create.editTitle" : "pages.geographies.create.title")}</h2><p>{t(isEdit ? "pages.geographies.create.editDescription" : "pages.geographies.create.description")}</p></div></PageHeader>
      </div>

      {isLoading ? (
        <div className="mx-auto flex min-h-64 w-full max-w-2xl items-center justify-center gap-2 text-sm text-muted-foreground" role="status"><Spinner />{t("pages.geographies.create.loading")}</div>
      ) : <form className="mx-auto w-full max-w-2xl" onSubmit={submit}>
        <Card>
          <CardHeader>
            <CardTitle>{t("pages.geographies.create.detailsTitle")}</CardTitle>
            <CardDescription>{t("pages.geographies.create.detailsDescription")}</CardDescription>
          </CardHeader>
          <CardContent>
            <FieldGroup>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field><FieldLabel htmlFor="geography-name">{t("pages.geographies.create.fields.name")}</FieldLabel><Input id="geography-name" autoFocus required disabled={isSubmitting} value={values.name} onChange={(event) => update("name", event.target.value)} /></Field>
                <Field><FieldLabel htmlFor="geography-code">{t("pages.geographies.create.fields.code")}</FieldLabel><Input id="geography-code" required readOnly={isEdit} disabled={isSubmitting} value={values.geography_code} onChange={(event) => update("geography_code", normalizeCode(event.target.value))} placeholder="STATE_MAHARASHTRA" /><FieldDescription>{t(isEdit ? "pages.geographies.create.codeEditHelp" : "pages.geographies.create.codeHelp")}</FieldDescription></Field>
              </div>
              <Field><FieldLabel htmlFor="geography-name-hi">{t("pages.geographies.create.fields.hindiName")}</FieldLabel><Input id="geography-name-hi" disabled={isSubmitting} value={values.name_hi} onChange={(event) => update("name_hi", event.target.value)} /></Field>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field><FieldLabel>{t("pages.geographies.create.fields.level")}</FieldLabel><Select aria-label={t("pages.geographies.create.fields.level")} selectedKey={values.level_code} isDisabled={isLoading || isSubmitting} onSelectionChange={(key) => { const level = String(key); setValues((current) => ({ ...current, level_code: level, parent_geography_code: level === "COUNTRY" ? "" : current.parent_geography_code || "IND" })); }}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectGroup>{levels.map((level) => <SelectItem id={String(level.level_code)} key={String(level.level_code)}>{level.name ?? level.level_code}</SelectItem>)}</SelectGroup></SelectContent></Select></Field>
                <Field><FieldLabel>{t("pages.geographies.create.fields.parent")}</FieldLabel><Select aria-label={t("pages.geographies.create.fields.parent")} selectedKey={values.parent_geography_code || "NONE"} isDisabled={values.level_code === "COUNTRY" || isLoading || isSubmitting} onSelectionChange={(key) => update("parent_geography_code", key === "NONE" ? "" : String(key))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent className="w-max max-w-[calc(100vw-2rem)]"><SelectGroup><SelectItem id="NONE">{t("pages.geographies.create.noParent")}</SelectItem>{parentOptions.map((row) => <SelectItem id={String(row.geography_code)} key={String(row.geography_code)}>{row.name ?? row.geography_code}</SelectItem>)}</SelectGroup></SelectContent></Select></Field>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <Field><FieldLabel htmlFor="geography-iso2">{t("pages.geographies.create.fields.iso2")}</FieldLabel><Input id="geography-iso2" maxLength={2} disabled={isSubmitting} value={values.iso_alpha2_code} onChange={(event) => update("iso_alpha2_code", event.target.value.toUpperCase())} placeholder="IN" /></Field>
                <Field><FieldLabel htmlFor="geography-iso3">{t("pages.geographies.create.fields.iso3")}</FieldLabel><Input id="geography-iso3" maxLength={3} disabled={isSubmitting} value={values.iso_alpha3_code} onChange={(event) => update("iso_alpha3_code", event.target.value.toUpperCase())} placeholder="IND" /></Field>
                <Field><FieldLabel htmlFor="geography-census">{t("pages.geographies.create.fields.censusCode")}</FieldLabel><Input id="geography-census" disabled={isSubmitting} value={values.census_code} onChange={(event) => update("census_code", event.target.value)} /></Field>
              </div>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <Field><FieldLabel htmlFor="geography-from">{t("pages.geographies.create.fields.effectiveFrom")}</FieldLabel><Input id="geography-from" type="date" disabled={isSubmitting} value={values.effective_from} onChange={(event) => update("effective_from", event.target.value)} /></Field>
                <Field><FieldLabel htmlFor="geography-to">{t("pages.geographies.create.fields.effectiveTo")}</FieldLabel><Input id="geography-to" type="date" disabled={isSubmitting} value={values.effective_to} onChange={(event) => update("effective_to", event.target.value)} /></Field>
              </div>
              <Field><FieldLabel htmlFor="geography-description">{t("pages.geographies.create.fields.description")}</FieldLabel><Textarea id="geography-description" rows={3} disabled={isSubmitting} value={values.description} onChange={(event) => update("description", event.target.value)} /></Field>
              <FieldLabel><Field orientation="horizontal"><Checkbox isDisabled={isSubmitting} isSelected={values.is_active} onChange={(selected) => update("is_active", selected)} /><FieldContent><FieldTitle>{t("pages.geographies.create.fields.active")}</FieldTitle><FieldDescription>{t("pages.geographies.create.activeHelp")}</FieldDescription></FieldContent></Field></FieldLabel>
            </FieldGroup>
          </CardContent>
          <CardFooter className="justify-end gap-2 border-t">
            <Button type="button" variant="outline" isDisabled={isSubmitting} onPress={() => navigate(GEOGRAPHY_PATH)}>{t("pages.geographies.create.cancel")}</Button>
            <Button type="submit" isDisabled={isSubmitting}>{isSubmitting ? <Spinner data-icon="inline-start" aria-hidden="true" /> : <Save data-icon="inline-start" aria-hidden="true" />}{t(isSubmitting ? "pages.geographies.create.saving" : isEdit ? "pages.geographies.create.save" : "pages.geographies.create.submit")}</Button>
          </CardFooter>
        </Card>
      </form>}
    </PageSection>
  );
}
