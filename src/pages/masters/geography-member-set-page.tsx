import { PageSection, PageHeader } from "@/components/common/page-layout";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldTitle } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, MapPin, Save, Search } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  createDimensionMemberSet, createDimensionMemberSetItem, deactivateDimensionMemberSetItem,
  listDimensionMemberSetMembers, listDimensionMemberSets, listGeographies, updateDimensionMemberSet,
  type DimensionMemberSet, type Geography,
} from "../../api/dimensions.api";

const RETURN_PATH = "/masters/geography";
const SET_TYPES = ["CONTROLLED_SCOPE", "TEMPLATE_SCOPE", "REQUEST_SCOPE", "REPORT_SCOPE"] as const;

type FormValues = { set_code: string; name: string; name_hi: string; set_type: string; description: string; is_active: boolean };
const EMPTY_VALUES: FormValues = { set_code: "", name: "", name_hi: "", set_type: "CONTROLLED_SCOPE", description: "", is_active: true };

function compactCode(value: string) { return value.toUpperCase().replace(/[^A-Z0-9_]/g, "_").replace(/_+/g, "_"); }
function geographyCode(row: Geography) { return String(row.geography_code ?? row.member_code ?? ""); }

export function GeographyMemberSetPage() {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const { setCode } = useParams();
  const [searchParams] = useSearchParams();
  const isEdit = Boolean(setCode);
  const [values, setValues] = useState(EMPTY_VALUES);
  const [geographies, setGeographies] = useState<Geography[]>([]);
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [originalCodes, setOriginalCodes] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    const preset = searchParams.get("preset");
    Promise.all([
      listGeographies({ statusFilter: "ACTIVE", limit: 500 }),
      isEdit ? listDimensionMemberSets("GEOGRAPHY") : Promise.resolve({ data: [] as DimensionMemberSet[] }),
      isEdit && setCode ? listDimensionMemberSetMembers(setCode, 500) : Promise.resolve({ data: [] }),
    ]).then(([geographyResponse, setResponse, memberResponse]) => {
      if (!active) return;
      const rows = geographyResponse.data ?? [];
      setGeographies(rows);
      if (isEdit) {
        const set = (setResponse.data ?? []).find((item) => item.set_code === setCode);
        if (!set) throw new Error(t("pages.geographies.memberSetForm.notFound"));
        setValues({ set_code: set.set_code ?? "", name: set.name ?? "", name_hi: "", set_type: set.set_type ?? "CONTROLLED_SCOPE", description: set.description ?? "", is_active: set.is_active !== false });
        const codes = (memberResponse.data ?? []).map((item) => String(item.member_code ?? "")).filter(Boolean);
        setSelectedCodes(codes); setOriginalCodes(codes);
      } else if (preset) {
        const countries = rows.filter((row) => row.level_code === "COUNTRY" || !row.parent_geography_code).map(geographyCode).filter(Boolean);
        const states = rows.filter((row) => row.level_code === "STATE_UT" || row.parent_geography_code === "IND").map(geographyCode).filter(Boolean);
        const presets: Record<string, { code: string; name: string; description: string; codes: string[] }> = {
          national: { code: "GEOGRAPHY_NATIONAL", name: "National", description: "Country-level controlled scope.", codes: countries },
          national_states: { code: "GEOGRAPHY_NATIONAL_STATES", name: "National + States", description: "Country plus current States and Union Territories.", codes: [...countries, ...states] },
          states: { code: "GEOGRAPHY_STATES", name: "States", description: "Current States and Union Territories only.", codes: states },
        };
        const selected = presets[preset];
        if (selected) { setValues((current) => ({ ...current, set_code: selected.code, name: selected.name, description: selected.description })); setSelectedCodes([...new Set(selected.codes)]); }
      }
    }).catch((error) => toast.error(t("pages.geographies.memberSetForm.loadError"), { description: error instanceof Error ? error.message : undefined }))
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [isEdit, searchParams, setCode, t]);

  const filteredGeographies = useMemo(() => {
    const term = query.trim().toLowerCase();
    return geographies.filter((row) => !term || [row.name, row.geography_code, row.level_name, row.level_code].some((value) => String(value ?? "").toLowerCase().includes(term)));
  }, [geographies, query]);
  const update = <K extends keyof FormValues>(key: K, value: FormValues[K]) => setValues((current) => ({ ...current, [key]: value }));
  const toggleMember = (code: string, selected: boolean) => setSelectedCodes((current) => selected ? [...new Set([...current, code])] : current.filter((item) => item !== code));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!values.set_code.trim() || !values.name.trim() || !selectedCodes.length) return;
    setIsSubmitting(true);
    const normalizedSetCode = compactCode(values.set_code);
    try {
      const payload = { ...values, set_code: normalizedSetCode, name: values.name.trim(), name_hi: values.name_hi.trim() || undefined, description: values.description.trim() || undefined };
      if (isEdit && setCode) await updateDimensionMemberSet("GEOGRAPHY", setCode, payload);
      else await createDimensionMemberSet("GEOGRAPHY", payload);
      const additions = selectedCodes.filter((code) => !originalCodes.includes(code));
      await Promise.all(additions.map((memberCode) => createDimensionMemberSetItem(normalizedSetCode, { dimension_code: "GEOGRAPHY", member_code: memberCode, sort_order: selectedCodes.indexOf(memberCode) + 1, is_active: true })));
      if (isEdit && setCode) await Promise.all(originalCodes.filter((code) => !selectedCodes.includes(code)).map((code) => deactivateDimensionMemberSetItem(setCode, code)));
      toast.success(t(isEdit ? "pages.geographies.notifications.setUpdated" : "pages.geographies.notifications.setCreated"));
      navigate(RETURN_PATH, { replace: true });
    } catch (error) {
      toast.error(t("pages.geographies.memberSetForm.saveError"), { description: error instanceof Error ? error.message : t("pages.geographies.create.reviewDetails") });
    } finally { setIsSubmitting(false); }
  }

  return <PageSection className="flex min-w-0 flex-col gap-4">
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-3">
      <Button className="w-fit" type="button" variant="outline" onPress={() => navigate(RETURN_PATH)}><ArrowLeft data-icon="inline-start" aria-hidden="true" />{t("pages.geographies.create.back")}</Button>
      <PageHeader><div><h2>{t(isEdit ? "pages.geographies.memberSetForm.editTitle" : "pages.geographies.memberSetForm.createTitle")}</h2><p>{t("pages.geographies.memberSetForm.description")}</p></div></PageHeader>
    </div>
    {isLoading ? (
      <div className="mx-auto flex min-h-64 w-full max-w-4xl items-center justify-center gap-2 text-sm text-muted-foreground" role="status"><Spinner />{t("pages.geographies.memberSetForm.loadingForm")}</div>
    ) : <form className="mx-auto w-full max-w-4xl" onSubmit={submit}>
      <Card>
        <CardHeader><CardTitle>{t("pages.geographies.memberSetForm.detailsTitle")}</CardTitle><CardDescription>{t("pages.geographies.memberSetForm.detailsDescription")}</CardDescription></CardHeader>
        <CardContent className="flex flex-col gap-6">
          <FieldGroup>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field><FieldLabel htmlFor="set-name">{t("pages.geographies.memberSetForm.fields.name")}</FieldLabel><Input id="set-name" autoFocus required disabled={isLoading || isSubmitting} value={values.name} onChange={(event) => update("name", event.target.value)} /></Field>
              <Field><FieldLabel htmlFor="set-code">{t("pages.geographies.memberSetForm.fields.code")}</FieldLabel><Input id="set-code" required readOnly={isEdit} disabled={isLoading || isSubmitting} value={values.set_code} onChange={(event) => update("set_code", compactCode(event.target.value))} /><FieldDescription>{t(isEdit ? "pages.geographies.memberSetForm.codeEditHelp" : "pages.geographies.memberSetForm.codeHelp")}</FieldDescription></Field>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <Field><FieldLabel htmlFor="set-name-hi">{t("pages.geographies.memberSetForm.fields.hindiName")}</FieldLabel><Input id="set-name-hi" disabled={isLoading || isSubmitting} value={values.name_hi} onChange={(event) => update("name_hi", event.target.value)} /></Field>
              <Field><FieldLabel>{t("pages.geographies.memberSetForm.fields.type")}</FieldLabel><Select selectedKey={values.set_type} isDisabled={isLoading || isSubmitting} onSelectionChange={(key) => update("set_type", String(key))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectGroup>{SET_TYPES.map((type) => <SelectItem id={type} key={type}>{t(`pages.geographies.memberSetForm.types.${type}`)}</SelectItem>)}</SelectGroup></SelectContent></Select></Field>
            </div>
            <Field><FieldLabel htmlFor="set-description">{t("pages.geographies.memberSetForm.fields.description")}</FieldLabel><Textarea id="set-description" rows={3} disabled={isLoading || isSubmitting} value={values.description} onChange={(event) => update("description", event.target.value)} /></Field>
            <FieldLabel><Field orientation="horizontal"><Checkbox isDisabled={isLoading || isSubmitting} isSelected={values.is_active} onChange={(selected) => update("is_active", selected)} /><FieldContent><FieldTitle>{t("pages.geographies.memberSetForm.fields.active")}</FieldTitle><FieldDescription>{t("pages.geographies.memberSetForm.activeHelp")}</FieldDescription></FieldContent></Field></FieldLabel>
          </FieldGroup>
          <section className="flex flex-col gap-3" aria-labelledby="member-selection-title">
            <div><h3 className="text-sm font-medium" id="member-selection-title">{t("pages.geographies.memberSetForm.membersTitle", { count: selectedCodes.length })}</h3><p className="text-xs text-muted-foreground">{t("pages.geographies.memberSetForm.membersDescription")}</p></div>
            <InputGroup><InputGroupAddon><Search aria-hidden="true" /></InputGroupAddon><InputGroupInput aria-label={t("pages.geographies.memberSetForm.search")} placeholder={t("pages.geographies.memberSetForm.search")} value={query} onChange={(event) => setQuery(event.target.value)} /></InputGroup>
            <div className="max-h-72 overflow-y-auto rounded-md border p-2">
              {isLoading ? <div className="flex min-h-28 items-center justify-center gap-2 text-sm text-muted-foreground" role="status"><Spinner />{t("pages.geographies.memberSetForm.loading")}</div> : filteredGeographies.length ? <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">{filteredGeographies.map((row) => { const code = geographyCode(row); return <FieldLabel className="rounded-md p-2 hover:bg-muted" key={code}><Field orientation="horizontal"><Checkbox isSelected={selectedCodes.includes(code)} isDisabled={isSubmitting} onChange={(selected) => toggleMember(code, selected)} /><FieldContent><FieldTitle>{row.name ?? code}</FieldTitle><FieldDescription>{code} · {row.level_name ?? row.level_code}</FieldDescription></FieldContent></Field></FieldLabel>; })}</div> : <Empty className="min-h-28 border-0"><EmptyHeader><EmptyMedia variant="icon"><MapPin aria-hidden="true" /></EmptyMedia><EmptyTitle>{t("pages.geographies.memberSetForm.noResults")}</EmptyTitle><EmptyDescription>{t("pages.geographies.memberSetForm.noResultsDescription")}</EmptyDescription></EmptyHeader></Empty>}
            </div>
          </section>
        </CardContent>
        <CardFooter className="justify-end gap-2 border-t"><Button type="button" variant="outline" isDisabled={isSubmitting} onPress={() => navigate(RETURN_PATH)}>{t("pages.geographies.create.cancel")}</Button><Button type="submit" isDisabled={isLoading || isSubmitting || !selectedCodes.length}>{isSubmitting ? <Spinner data-icon="inline-start" aria-hidden="true" /> : <Save data-icon="inline-start" aria-hidden="true" />}{t(isSubmitting ? "pages.geographies.memberSetForm.saving" : isEdit ? "pages.geographies.memberSetForm.save" : "pages.geographies.memberSetForm.create")}</Button></CardFooter>
      </Card>
    </form>}
  </PageSection>;
}
