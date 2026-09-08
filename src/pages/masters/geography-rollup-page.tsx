import { PageSection, PageHeader } from "@/components/common/page-layout";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Empty, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldTitle } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { ArrowLeft, MapPin, Save, Search } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { createDimensionRollupRule, listDimensionRollupRules, listGeographies, type DimensionRollupRule, type Geography } from "../../api/dimensions.api";

const RETURN_PATH = "/masters/geography";
const ENTRY_MODES = ["DERIVED", "MANUAL", "MANUAL_WITH_VALIDATION"] as const;
const AGGREGATIONS = ["SUM", "AVG", "WEIGHTED_AVG", "MIN", "MAX", "NO_ROLLUP"] as const;
type Values = { parent_member_code: string; rule_code: string; entry_mode: string; aggregation_method: string; measure_code: string; weight_measure_code: string; validation_rule_code: string; is_active: boolean };
const EMPTY_VALUES: Values = { parent_member_code: "IND", rule_code: "ROLLUP_INDIA_STATES_SUM", entry_mode: "DERIVED", aggregation_method: "SUM", measure_code: "", weight_measure_code: "", validation_rule_code: "", is_active: true };
function code(row: Geography) { return String(row.geography_code ?? row.member_code ?? ""); }
function compactCode(value: string) { return value.toUpperCase().replace(/[^A-Z0-9_]/g, "_").replace(/_+/g, "_"); }

export function GeographyRollupPage() {
  const { t } = useTranslation("common");
  const navigate = useNavigate();
  const { ruleCode } = useParams();
  const isEdit = Boolean(ruleCode);
  const [values, setValues] = useState(EMPTY_VALUES);
  const [geographies, setGeographies] = useState<Geography[]>([]);
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([listGeographies({ statusFilter: "ACTIVE", limit: 500 }), isEdit ? listDimensionRollupRules("GEOGRAPHY", 300) : Promise.resolve({ data: [] as DimensionRollupRule[] })])
      .then(([geographyResponse, rollupResponse]) => {
        if (!active) return;
        const rows = geographyResponse.data ?? [];
        setGeographies(rows);
        if (isEdit) {
          const rollup = (rollupResponse.data ?? []).find((item) => item.rule_code === ruleCode);
          if (!rollup) throw new Error(t("pages.geographies.rollupForm.notFound"));
          setValues({ parent_member_code: rollup.parent_member_code ?? "", rule_code: rollup.rule_code ?? "", entry_mode: rollup.entry_mode ?? "DERIVED", aggregation_method: rollup.aggregation_method ?? "SUM", measure_code: rollup.measure_code ?? "", weight_measure_code: rollup.weight_measure_code ?? "", validation_rule_code: rollup.validation_rule_code ?? "", is_active: rollup.is_active !== false });
          setSelectedCodes((rollup.children ?? []).map((child) => String(child.member_code ?? child.child_member_code ?? "")).filter(Boolean));
        } else {
          const india = rows.find((row) => code(row) === "IND") ?? rows.find((row) => row.level_code === "COUNTRY");
          const states = rows.filter((row) => row.level_code === "STATE_UT" || row.parent_geography_code === "IND").map(code).filter(Boolean);
          setValues((current) => ({ ...current, parent_member_code: code(india ?? {}) || current.parent_member_code }));
          setSelectedCodes(states);
        }
      }).catch((error) => toast.error(t("pages.geographies.rollupForm.loadError"), { description: error instanceof Error ? error.message : undefined }))
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [isEdit, ruleCode, t]);

  const parents = useMemo(() => geographies.filter((row) => row.level_code === "COUNTRY" || row.level_code === "STATE_UT" || !row.parent_geography_code), [geographies]);
  const children = useMemo(() => { const term = query.trim().toLowerCase(); return geographies.filter((row) => code(row) !== values.parent_member_code && (!term || [row.name, row.geography_code, row.level_name, row.level_code].some((value) => String(value ?? "").toLowerCase().includes(term)))); }, [geographies, query, values.parent_member_code]);
  const update = <K extends keyof Values>(key: K, value: Values[K]) => setValues((current) => ({ ...current, [key]: value }));
  const toggleChild = (memberCode: string, selected: boolean) => setSelectedCodes((current) => selected ? [...new Set([...current, memberCode])] : current.filter((item) => item !== memberCode));

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!values.parent_member_code || !values.rule_code.trim() || !selectedCodes.length) return;
    setIsSubmitting(true);
    try {
      await createDimensionRollupRule("GEOGRAPHY", {
        parent_member_code: values.parent_member_code, rule_code: compactCode(values.rule_code), entry_mode: values.entry_mode, aggregation_method: values.aggregation_method,
        measure_code: values.measure_code.trim() || undefined, weight_measure_code: values.weight_measure_code.trim() || undefined, validation_rule_code: values.validation_rule_code.trim() || undefined,
        is_active: values.is_active, children: selectedCodes.map((memberCode, index) => ({ member_code: memberCode, child_order: index + 1, is_active: true })),
      });
      toast.success(t("pages.geographies.notifications.rollupSaved"));
      navigate(RETURN_PATH, { replace: true });
    } catch (error) { toast.error(t("pages.geographies.rollupForm.saveError"), { description: error instanceof Error ? error.message : t("pages.geographies.create.reviewDetails") }); }
    finally { setIsSubmitting(false); }
  }

  return <PageSection className="flex min-w-0 flex-col gap-4">
    <div className="mx-auto flex w-full max-w-4xl flex-col gap-3"><Button className="w-fit" type="button" variant="outline" onPress={() => navigate(RETURN_PATH)}><ArrowLeft data-icon="inline-start" aria-hidden="true" />{t("pages.geographies.create.back")}</Button><PageHeader><div><h2>{t(isEdit ? "pages.geographies.rollupForm.editTitle" : "pages.geographies.rollupForm.createTitle")}</h2><p>{t("pages.geographies.rollupForm.description")}</p></div></PageHeader></div>
    {isLoading ? <div className="mx-auto flex min-h-64 w-full max-w-4xl items-center justify-center gap-2 text-sm text-muted-foreground" role="status"><Spinner />{t("pages.geographies.rollupForm.loading")}</div> :
    <form className="mx-auto w-full max-w-4xl" onSubmit={submit}><Card><CardHeader><CardTitle>{t("pages.geographies.rollupForm.detailsTitle")}</CardTitle><CardDescription>{t("pages.geographies.rollupForm.detailsDescription")}</CardDescription></CardHeader><CardContent className="flex flex-col gap-6"><FieldGroup>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><Field><FieldLabel>{t("pages.geographies.rollupForm.fields.parent")}</FieldLabel><Select selectedKey={values.parent_member_code} isDisabled={isSubmitting} onSelectionChange={(key) => update("parent_member_code", String(key))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent className="w-max max-w-[calc(100vw-2rem)]"><SelectGroup>{parents.map((row) => <SelectItem id={code(row)} key={code(row)}>{row.name ?? code(row)}</SelectItem>)}</SelectGroup></SelectContent></Select></Field><Field><FieldLabel htmlFor="rollup-code">{t("pages.geographies.rollupForm.fields.code")}</FieldLabel><Input id="rollup-code" required readOnly={isEdit} disabled={isSubmitting} value={values.rule_code} onChange={(event) => update("rule_code", compactCode(event.target.value))} /><FieldDescription>{t(isEdit ? "pages.geographies.rollupForm.codeEditHelp" : "pages.geographies.rollupForm.codeHelp")}</FieldDescription></Field></div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><Field><FieldLabel>{t("pages.geographies.rollupForm.fields.entryMode")}</FieldLabel><Select selectedKey={values.entry_mode} isDisabled={isSubmitting} onSelectionChange={(key) => update("entry_mode", String(key))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectGroup>{ENTRY_MODES.map((item) => <SelectItem id={item} key={item}>{t(`pages.geographies.rollupForm.entryModes.${item}`)}</SelectItem>)}</SelectGroup></SelectContent></Select></Field><Field><FieldLabel>{t("pages.geographies.rollupForm.fields.aggregation")}</FieldLabel><Select selectedKey={values.aggregation_method} isDisabled={isSubmitting} onSelectionChange={(key) => update("aggregation_method", String(key))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectGroup>{AGGREGATIONS.map((item) => <SelectItem id={item} key={item}>{item}</SelectItem>)}</SelectGroup></SelectContent></Select></Field></div>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3"><Field><FieldLabel htmlFor="measure-code">{t("pages.geographies.rollupForm.fields.measure")}</FieldLabel><Input id="measure-code" disabled={isSubmitting} value={values.measure_code} onChange={(event) => update("measure_code", compactCode(event.target.value))} /></Field><Field><FieldLabel htmlFor="weight-code">{t("pages.geographies.rollupForm.fields.weight")}</FieldLabel><Input id="weight-code" disabled={isSubmitting || values.aggregation_method !== "WEIGHTED_AVG"} value={values.weight_measure_code} onChange={(event) => update("weight_measure_code", compactCode(event.target.value))} /></Field><Field><FieldLabel htmlFor="validation-code">{t("pages.geographies.rollupForm.fields.validation")}</FieldLabel><Input id="validation-code" disabled={isSubmitting} value={values.validation_rule_code} onChange={(event) => update("validation_rule_code", compactCode(event.target.value))} /></Field></div>
      <FieldLabel><Field orientation="horizontal"><Checkbox isDisabled={isSubmitting} isSelected={values.is_active} onChange={(selected) => update("is_active", selected)} /><FieldContent><FieldTitle>{t("pages.geographies.rollupForm.fields.active")}</FieldTitle><FieldDescription>{t("pages.geographies.rollupForm.activeHelp")}</FieldDescription></FieldContent></Field></FieldLabel>
    </FieldGroup><section className="flex flex-col gap-3" aria-labelledby="rollup-children-title"><div><h3 className="text-sm font-medium" id="rollup-children-title">{t("pages.geographies.rollupForm.childrenTitle", { count: selectedCodes.length })}</h3><p className="text-xs text-muted-foreground">{t("pages.geographies.rollupForm.childrenDescription")}</p></div><InputGroup><InputGroupAddon><Search aria-hidden="true" /></InputGroupAddon><InputGroupInput aria-label={t("pages.geographies.rollupForm.search")} placeholder={t("pages.geographies.rollupForm.search")} value={query} onChange={(event) => setQuery(event.target.value)} /></InputGroup><div className="max-h-72 overflow-y-auto rounded-md border p-2">{children.length ? <div className="grid grid-cols-1 gap-1 sm:grid-cols-2">{children.map((row) => { const memberCode = code(row); return <FieldLabel className="rounded-md p-2 hover:bg-muted" key={memberCode}><Field orientation="horizontal"><Checkbox isSelected={selectedCodes.includes(memberCode)} isDisabled={isSubmitting} onChange={(selected) => toggleChild(memberCode, selected)} /><FieldContent><FieldTitle>{row.name ?? memberCode}</FieldTitle><FieldDescription>{memberCode} · {row.level_name ?? row.level_code}</FieldDescription></FieldContent></Field></FieldLabel>; })}</div> : <Empty className="min-h-28 border-0"><EmptyHeader><EmptyMedia variant="icon"><MapPin aria-hidden="true" /></EmptyMedia><EmptyTitle>{t("pages.geographies.rollupForm.noResults")}</EmptyTitle><EmptyDescription>{t("pages.geographies.rollupForm.noResultsDescription")}</EmptyDescription></EmptyHeader></Empty>}</div></section></CardContent><CardFooter className="justify-end gap-2 border-t"><Button type="button" variant="outline" isDisabled={isSubmitting} onPress={() => navigate(RETURN_PATH)}>{t("pages.geographies.create.cancel")}</Button><Button type="submit" isDisabled={isSubmitting || !selectedCodes.length}>{isSubmitting ? <Spinner data-icon="inline-start" aria-hidden="true" /> : <Save data-icon="inline-start" aria-hidden="true" />}{t(isSubmitting ? "pages.geographies.rollupForm.saving" : isEdit ? "pages.geographies.rollupForm.save" : "pages.geographies.rollupForm.create")}</Button></CardFooter></Card></form>}
  </PageSection>;
}
