import { PageSection, PageHeader } from "@/components/common/page-layout";

import { Input } from "@/components/ui/input";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Field, FieldContent, FieldDescription, FieldLabel, FieldTitle } from "@/components/ui/field";
import { Switch } from "@/components/ui/switch";
import { ArrowLeft, Save } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  createDimension,
  getDimension,
  listDimensionStructureTypes,
  updateDimension,
  type DimensionStructureType,
} from "../../../api/dimensions.api";

const initialForm = {
  dimension_code: "",
  dimension_type: "GENERAL",
  dimension_structure_type: "FIXED_LIST",
  value_type: "TEXT",
  is_active: true,
  name: "",
  name_hi: "",
  description: "",
};

const fallbackStructures = [
  { structure_type_code: "MASTER_DATASET", name: "Master Dataset" },
  { structure_type_code: "HIERARCHICAL", name: "Hierarchical" },
  { structure_type_code: "FIXED_LIST", name: "Fixed List" },
  { structure_type_code: "RANGE_BUCKETS", name: "Range Buckets" },
];

export function CreateDimensionPage() {
  return <DimensionFormPage mode="create" />;
}

export function EditDimensionPage() {
  return <DimensionFormPage mode="edit" />;
}

function DimensionFormPage({ mode }: { mode: "create" | "edit" }) {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const location = useLocation();
  const { dimensionCode = "" } = useParams<{ dimensionCode?: string }>();
  const isEdit = mode === "edit";
  const requestedReturnTo = (location.state as { returnTo?: unknown } | null)?.returnTo;
  const returnTo = typeof requestedReturnTo === "string" && requestedReturnTo.startsWith("/masters/dimensions")
    ? requestedReturnTo
    : "/masters/dimensions";
  const [form, setForm] = useState(initialForm);
  const [structureTypes, setStructureTypes] = useState<DimensionStructureType[]>([]);
  const [error, setError] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    void listDimensionStructureTypes()
      .then((response) => setStructureTypes(response.data ?? []))
      .catch(() => setStructureTypes([]));
  }, []);

  useEffect(() => {
    if (!isEdit || !dimensionCode) return;
    void getDimension(dimensionCode)
      .then((response) => {
        const record = response.data;
        setForm({
          dimension_code: record.dimension_code ?? dimensionCode,
          dimension_type: record.dimension_type ?? "GENERAL",
          dimension_structure_type: record.dimension_structure_type ?? (record.is_hierarchical ? "HIERARCHICAL" : "FIXED_LIST"),
          value_type: record.value_type ?? "TEXT",
          is_active: record.is_active !== false,
          name: String(record.dimension_name ?? record.name ?? ""),
          name_hi: record.name_hi ?? "",
          description: record.description ?? "",
        });
      })
      .catch((loadError) => setError(loadError instanceof Error ? loadError.message : t("pages.dimensions.form.errors.load")));
  }, [dimensionCode, isEdit]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const dimensionCode = form.dimension_code.trim();
    const name = form.name.trim();
    if (!dimensionCode || !name) {
      setError(t("pages.dimensions.form.errors.required"));
      return;
    }

    setIsSaving(true);
    setError("");
    try {
      const payload = {
        dimension_code: dimensionCode,
        dimension_type: form.dimension_type,
        dimension_structure_type: form.dimension_structure_type,
        value_type: form.value_type,
        is_hierarchical: form.dimension_structure_type === "HIERARCHICAL",
        sort_order: 0,
        is_active: form.is_active,
        name,
        name_hi: form.name_hi.trim() || undefined,
        description: form.description.trim() || undefined,
      };
      const response = isEdit
        ? await updateDimension(dimensionCode, payload)
        : await createDimension(payload);
      const savedCode = response.data.dimension_code ?? dimensionCode;
      navigate(isEdit ? returnTo : `/masters/dimensions/${encodeURIComponent(savedCode)}`, { replace: true });
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : t("pages.dimensions.errors.save"));
    } finally {
      setIsSaving(false);
    }
  }

  const structures = structureTypes.length ? structureTypes : fallbackStructures;

  return (
    <PageSection className="flex min-w-0 flex-col gap-4">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-3">
        <Button className="w-fit" type="button" variant="outline" onPress={() => navigate(returnTo)}>
          <ArrowLeft data-icon="inline-start" aria-hidden="true" />
          {t("pages.dimensions.actions.back")}
        </Button>
        <PageHeader>
          <div>
            <h2>{t(isEdit ? "pages.dimensions.form.editTitle" : "pages.dimensions.form.createTitle")}</h2>
            <p>{t(isEdit ? "pages.dimensions.form.editDescription" : "pages.dimensions.form.createDescription")}</p>
          </div>
        </PageHeader>

        {error && <div className="rounded-md bg-muted p-3 text-sm text-destructive" role="alert">{error}</div>}

        <form className="!overflow-visible !p-0" onSubmit={submit}>
          <Card>
            <CardContent className="flex flex-col gap-4">
              <div className="grid min-w-0 grid-cols-1 gap-4 sm:grid-cols-2">
                <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-foreground [&>small]:font-normal [&>small]:text-muted-foreground">{t("pages.dimensions.form.fields.code")} *<Input autoFocus required readOnly={isEdit} placeholder={t("pages.dimensions.form.placeholders.code")} value={form.dimension_code} onChange={(event) => setForm((current) => ({ ...current, dimension_code: event.target.value.toUpperCase().replace(/[^A-Z0-9_]/g, "_") }))} /></label>
                <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-foreground [&>small]:font-normal [&>small]:text-muted-foreground">{t("pages.dimensions.form.fields.name")} *<Input required placeholder={t("pages.dimensions.form.placeholders.name")} value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} /></label>
                {/* <label className="form-field">Hindi name<input placeholder="Hindi name, optional" value={form.name_hi} onChange={(event) => setForm((current) => ({ ...current, name_hi: event.target.value }))} /></label> */}
                <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-foreground [&>small]:font-normal [&>small]:text-muted-foreground">{t("pages.dimensions.form.fields.valueType")}<NativeSelect value={form.value_type} onChange={(event) => setForm((current) => ({ ...current, value_type: event.target.value }))}><NativeSelectOption>TEXT</NativeSelectOption><NativeSelectOption>NUMBER</NativeSelectOption><NativeSelectOption>DATE</NativeSelectOption><NativeSelectOption>BOOLEAN</NativeSelectOption></NativeSelect></label>
                <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-foreground [&>small]:font-normal [&>small]:text-muted-foreground">{t("pages.dimensions.form.fields.dimensionType")}<NativeSelect value={form.dimension_type} onChange={(event) => setForm((current) => ({ ...current, dimension_type: event.target.value }))}><NativeSelectOption value="GENERAL">{t("pages.dimensions.form.types.general")}</NativeSelectOption><NativeSelectOption value="TIME">{t("pages.dimensions.form.types.time")}</NativeSelectOption><NativeSelectOption value="LOCATION">{t("pages.dimensions.form.types.location")}</NativeSelectOption></NativeSelect></label>
                <label className="flex min-w-0 flex-col gap-1.5 text-xs font-medium text-foreground [&>small]:font-normal [&>small]:text-muted-foreground">{t("pages.dimensions.form.fields.structure")}<NativeSelect value={form.dimension_structure_type} onChange={(event) => setForm((current) => ({ ...current, dimension_structure_type: event.target.value }))}>{structures.map((type) => <NativeSelectOption value={type.structure_type_code ?? ""} key={type.structure_type_code}>{type.name ?? type.structure_type_code}</NativeSelectOption>)}</NativeSelect></label>
              </div>
              {/* <label>Description<textarea placeholder="Describe where this dimension is used and any special rules" value={form.description} onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} /></label> */}
              <FieldLabel>
                <Field orientation="horizontal" data-disabled={isSaving || undefined}>
                  <Switch
                    aria-label={t("pages.dimensions.form.fields.active")}
                    isDisabled={isSaving}
                    isSelected={form.is_active}
                    onChange={(isSelected) => setForm((current) => ({ ...current, is_active: isSelected }))}
                  />
                  <FieldContent>
                    <FieldTitle>{t("pages.dimensions.status.active")}</FieldTitle>
                    <FieldDescription>{t("pages.dimensions.form.activeHelp")}</FieldDescription>
                  </FieldContent>
                </Field>
              </FieldLabel>
            </CardContent>
            <CardFooter className="flex-col-reverse gap-2 border-t sm:flex-row sm:justify-end">
              <Button className="w-full sm:w-auto" type="button" variant="outline" onPress={() => navigate(returnTo)}>{t("pages.dimensions.form.cancel")}</Button>
              <Button className="w-full sm:w-auto" type="submit" isDisabled={isSaving || !form.dimension_code.trim() || !form.name.trim()}>
                <Save aria-hidden="true" />
                {t(isSaving ? "pages.dimensions.form.saving" : isEdit ? "pages.dimensions.form.update" : "pages.dimensions.form.save")}
              </Button>
            </CardFooter>
          </Card>
        </form>
      </div>
    </PageSection>
  );
}
