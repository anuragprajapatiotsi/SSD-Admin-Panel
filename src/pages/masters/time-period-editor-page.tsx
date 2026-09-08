import { PageSection, PageHeader } from "@/components/common/page-layout";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldContent, FieldDescription, FieldGroup, FieldLabel, FieldTitle } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Save, Search } from "lucide-react";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import {
  createTimeFrequency, createTimePeriod, createTimePeriodSet, listAllTimePeriods, listTimeFrequencies,
  listTimePeriodSetPeriods, listTimePeriodSets, updateTimeFrequency, updateTimePeriod, updateTimePeriodSet,
  type TimeFrequency, type TimePeriod,
} from "../../api/dimensions.api";

export type TimePeriodEditorEntity = "period" | "sequence" | "frequency";
type Props = { entity: TimePeriodEditorEntity };

const PERIOD_DEFAULT = { time_period_code: "", frequency_code: "FINANCIAL_YEAR", period_year: new Date().getFullYear(), period_quarter: "", period_month: "", start_date: "", end_date: "", status: "ACTIVE", is_active: true, name: "", short_name: "", description: "" };
const SEQUENCE_DEFAULT = { set_code: "", set_type: "TEMPLATE_SCOPE", is_active: true, name: "", description: "" };
const FREQUENCY_DEFAULT = { frequency_code: "", months_interval: "", sort_order: 0, is_active: true, name: "", description: "" };
const ROOT = "/masters/time-periods";
const code = (value: string) => value.toUpperCase().replace(/[^A-Z0-9_]/g, "_").replace(/_+/g, "_");

export function TimePeriodEditorPage({ entity }: Props) {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  const [searchParams] = useSearchParams();
  const recordCode = params.timePeriodCode ?? params.setCode ?? params.frequencyCode;
  const copyFrom = searchParams.get("copyFrom") ?? "";
  const isEdit = Boolean(recordCode);
  const [period, setPeriod] = useState(PERIOD_DEFAULT);
  const [sequence, setSequence] = useState(SEQUENCE_DEFAULT);
  const [frequency, setFrequency] = useState(FREQUENCY_DEFAULT);
  const [frequencies, setFrequencies] = useState<TimeFrequency[]>([]);
  const [periods, setPeriods] = useState<TimePeriod[]>([]);
  const [selectedPeriods, setSelectedPeriods] = useState<string[]>([]);
  const [query, setQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.all([listTimeFrequencies(), listAllTimePeriods(), entity === "sequence" ? listTimePeriodSets() : Promise.resolve({ data: [] })])
      .then(async ([frequencyResponse, periodResponse, setResponse]) => {
        if (!active) return;
        const frequencyRows = frequencyResponse.data ?? [];
        const periodRows = periodResponse.data ?? [];
        setFrequencies(frequencyRows); setPeriods(periodRows);
        if (entity === "period" && recordCode) {
          const row = periodRows.find((item) => item.time_period_code === recordCode);
          if (!row) throw new Error(t("pages.timePeriods.errors.load"));
          setPeriod({ time_period_code: row.time_period_code ?? "", frequency_code: row.frequency_code ?? "FINANCIAL_YEAR", period_year: Number(row.period_year ?? new Date().getFullYear()), period_quarter: row.period_quarter ? String(row.period_quarter) : "", period_month: row.period_month ? String(row.period_month) : "", start_date: row.start_date ?? "", end_date: row.end_date ?? "", status: row.status ?? "ACTIVE", is_active: row.is_active !== false, name: row.name ?? "", short_name: row.short_name ?? "", description: row.description ?? "" });
        }
        if (entity === "frequency" && recordCode) {
          const row = frequencyRows.find((item) => item.frequency_code === recordCode);
          if (!row) throw new Error(t("pages.timePeriods.errors.load"));
          setFrequency({ frequency_code: row.frequency_code ?? "", months_interval: row.months_interval == null ? "" : String(row.months_interval), sort_order: Number(row.sort_order ?? 0), is_active: row.is_active !== false, name: row.name ?? "", description: row.description ?? "" });
        }
        if (entity === "sequence" && (recordCode || copyFrom)) {
          const sourceCode = recordCode ?? copyFrom;
          const row = (setResponse.data ?? []).find((item) => item.set_code === sourceCode);
          if (!row) throw new Error(t("pages.timePeriods.errors.load"));
          const itemResponse = await listTimePeriodSetPeriods(sourceCode);
          if (!active) return;
          setSelectedPeriods((itemResponse.data ?? []).map((item) => item.member_code ?? "").filter(Boolean));
          setSequence({ set_code: copyFrom ? `${code(sourceCode)}_V2` : row.set_code ?? "", set_type: row.set_type ?? "TEMPLATE_SCOPE", is_active: row.is_active !== false, name: copyFrom ? t("pages.timePeriods.sequences.newCycleName", { name: row.name ?? sourceCode }) : row.name ?? "", description: copyFrom ? t("pages.timePeriods.sequences.copiedDescription", { code: sourceCode }) : row.description ?? "" });
        }
      })
      .catch((error) => toast.error(t("pages.timePeriods.errors.load"), { description: error instanceof Error ? error.message : undefined }))
      .finally(() => { if (active) setIsLoading(false); });
    return () => { active = false; };
  }, [copyFrom, entity, recordCode, t]);

  const visiblePeriods = useMemo(() => { const q = query.trim().toLowerCase(); return periods.filter((item) => !q || [item.name, item.time_period_code, item.frequency_code, item.period_year].some((value) => String(value ?? "").toLowerCase().includes(q))); }, [periods, query]);
  const title = entity === "period" ? t(isEdit ? "pages.timePeriods.periodForm.editTitle" : "pages.timePeriods.periodForm.createTitle") : entity === "sequence" ? t(isEdit ? "pages.timePeriods.actions.editSequence" : "pages.timePeriods.add.sequence") : t(isEdit ? "pages.timePeriods.frequencyForm.editTitle" : "pages.timePeriods.frequencyForm.createTitle");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setIsSubmitting(true);
    try {
      if (entity === "period") { const payload = { ...period, time_period_code: code(period.time_period_code), period_quarter: period.period_quarter ? Number(period.period_quarter) : undefined, period_month: period.period_month ? Number(period.period_month) : undefined }; if (recordCode) await updateTimePeriod(recordCode, payload); else await createTimePeriod(payload); toast.success(t("pages.timePeriods.notifications.periodSaved")); }
      else if (entity === "frequency") { const payload = { ...frequency, frequency_code: code(frequency.frequency_code), months_interval: frequency.months_interval ? Number(frequency.months_interval) : undefined }; if (recordCode) await updateTimeFrequency(recordCode, payload); else await createTimeFrequency(payload); toast.success(t("pages.timePeriods.notifications.frequencySaved")); }
      else { const payload = { ...sequence, set_code: code(sequence.set_code), items: selectedPeriods.map((time_period_code, index) => ({ time_period_code, sort_order: index + 1, is_active: true })) }; if (recordCode) await updateTimePeriodSet(recordCode, payload); else await createTimePeriodSet(payload); toast.success(t("pages.timePeriods.notifications.sequenceSaved")); }
      navigate(ROOT, { replace: true });
    } catch (error) { toast.error(t(entity === "period" ? "pages.timePeriods.errors.periodSave" : entity === "frequency" ? "pages.timePeriods.errors.frequencySave" : "pages.timePeriods.errors.sequenceSave"), { description: error instanceof Error ? error.message : undefined }); }
    finally { setIsSubmitting(false); }
  }

  return <PageSection className="flex min-w-0 flex-col gap-4"><div className="mx-auto flex w-full max-w-2xl flex-col gap-3">
    <Button className="w-fit" type="button" variant="outline" onPress={() => navigate(ROOT)}><ArrowLeft data-icon="inline-start" aria-hidden="true" />{t("pages.geographies.create.back")}</Button>
    <PageHeader><div><h2>{title}</h2><p>{t(entity === "period" ? "pages.timePeriods.periodForm.description" : entity === "sequence" ? "pages.timePeriods.sequenceForm.description" : "pages.timePeriods.frequencyForm.description")}</p></div></PageHeader>
  </div>{isLoading ? <div className="mx-auto flex min-h-64 w-full max-w-2xl items-center justify-center gap-2" role="status"><Spinner />{t("pages.timePeriods.table.loading")}</div> : <form className="mx-auto w-full max-w-2xl" onSubmit={submit}><Card><CardHeader><CardTitle>{title}</CardTitle><CardDescription>{t("pages.timePeriods.sequenceForm.description")}</CardDescription></CardHeader><CardContent><FieldGroup>
    {entity === "period" && <><div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><Field><FieldLabel htmlFor="period-name">{t("pages.timePeriods.fields.name")}</FieldLabel><Input id="period-name" required autoFocus value={period.name} onChange={(e) => setPeriod(v => ({...v,name:e.target.value}))} /></Field><Field><FieldLabel htmlFor="period-code">{t("pages.timePeriods.fields.periodCode")}</FieldLabel><Input id="period-code" required readOnly={isEdit} value={period.time_period_code} onChange={(e) => setPeriod(v => ({...v,time_period_code:code(e.target.value)}))} /></Field></div><Field><FieldLabel>{t("pages.timePeriods.fields.frequency")}</FieldLabel><Select selectedKey={period.frequency_code} onSelectionChange={(key) => setPeriod(v => ({...v,frequency_code:String(key)}))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectGroup>{frequencies.map(f => <SelectItem id={f.frequency_code ?? ""} key={f.frequency_code}>{f.name ?? f.frequency_code}</SelectItem>)}</SelectGroup></SelectContent></Select></Field><div className="grid grid-cols-1 gap-4 sm:grid-cols-3"><Field><FieldLabel htmlFor="period-year">{t("pages.timePeriods.fields.periodYear")}</FieldLabel><Input id="period-year" type="number" value={period.period_year} onChange={e => setPeriod(v=>({...v,period_year:Number(e.target.value)}))}/></Field><Field><FieldLabel htmlFor="period-quarter">{t("pages.timePeriods.fields.quarter")}</FieldLabel><Input id="period-quarter" type="number" min="1" max="4" value={period.period_quarter} onChange={e=>setPeriod(v=>({...v,period_quarter:e.target.value}))}/></Field><Field><FieldLabel htmlFor="period-month">{t("pages.timePeriods.fields.month")}</FieldLabel><Input id="period-month" type="number" min="1" max="12" value={period.period_month} onChange={e=>setPeriod(v=>({...v,period_month:e.target.value}))}/></Field></div><div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><Field><FieldLabel htmlFor="period-start">{t("pages.timePeriods.fields.startDate")}</FieldLabel><Input id="period-start" required type="date" value={period.start_date} onChange={e=>setPeriod(v=>({...v,start_date:e.target.value}))}/></Field><Field><FieldLabel htmlFor="period-end">{t("pages.timePeriods.fields.endDate")}</FieldLabel><Input id="period-end" required type="date" value={period.end_date} onChange={e=>setPeriod(v=>({...v,end_date:e.target.value}))}/></Field></div><Field><FieldLabel htmlFor="period-description">{t("pages.timePeriods.fields.description")}</FieldLabel><Textarea id="period-description" value={period.description} onChange={e=>setPeriod(v=>({...v,description:e.target.value}))}/></Field></>}
    {entity === "frequency" && <><div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><Field><FieldLabel htmlFor="frequency-name">{t("pages.timePeriods.fields.name")}</FieldLabel><Input id="frequency-name" required value={frequency.name} onChange={e=>setFrequency(v=>({...v,name:e.target.value}))}/></Field><Field><FieldLabel htmlFor="frequency-code">{t("pages.timePeriods.fields.frequencyCode")}</FieldLabel><Input id="frequency-code" required readOnly={isEdit} value={frequency.frequency_code} onChange={e=>setFrequency(v=>({...v,frequency_code:code(e.target.value)}))}/></Field></div><div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><Field><FieldLabel htmlFor="frequency-months">{t("pages.timePeriods.fields.monthsInterval")}</FieldLabel><Input id="frequency-months" type="number" min="1" value={frequency.months_interval} onChange={e=>setFrequency(v=>({...v,months_interval:e.target.value}))}/></Field><Field><FieldLabel htmlFor="frequency-sort">{t("pages.timePeriods.fields.sortOrder")}</FieldLabel><Input id="frequency-sort" type="number" value={frequency.sort_order} onChange={e=>setFrequency(v=>({...v,sort_order:Number(e.target.value)}))}/></Field></div><Field><FieldLabel htmlFor="frequency-description">{t("pages.timePeriods.fields.description")}</FieldLabel><Textarea id="frequency-description" value={frequency.description} onChange={e=>setFrequency(v=>({...v,description:e.target.value}))}/></Field></>}
    {entity === "sequence" && <><div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><Field><FieldLabel htmlFor="sequence-name">{t("pages.timePeriods.fields.name")}</FieldLabel><Input id="sequence-name" required value={sequence.name} onChange={e=>setSequence(v=>({...v,name:e.target.value}))}/></Field><Field><FieldLabel htmlFor="sequence-code">{t("pages.timePeriods.fields.setCode")}</FieldLabel><Input id="sequence-code" required readOnly={isEdit} value={sequence.set_code} onChange={e=>setSequence(v=>({...v,set_code:code(e.target.value)}))}/></Field></div><Field><FieldLabel>{t("pages.timePeriods.fields.setType")}</FieldLabel><Select selectedKey={sequence.set_type} onSelectionChange={key=>setSequence(v=>({...v,set_type:String(key)}))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectGroup>{[["TEMPLATE_SCOPE","template"],["REQUEST_SCOPE","request"],["REPORT_SCOPE","report"],["CONTROLLED_SCOPE","controlled"]].map(([id,key])=><SelectItem id={id} key={id}>{t(`pages.timePeriods.setTypes.${key}`)}</SelectItem>)}</SelectGroup></SelectContent></Select></Field><Field><FieldLabel htmlFor="sequence-description">{t("pages.timePeriods.fields.description")}</FieldLabel><Textarea id="sequence-description" value={sequence.description} onChange={e=>setSequence(v=>({...v,description:e.target.value}))}/></Field><Field><FieldLabel htmlFor="sequence-search">{t("pages.timePeriods.sequenceForm.findPeriod")}</FieldLabel><div className="relative"><Search className="absolute left-3 top-2.5 size-4" aria-hidden="true"/><Input id="sequence-search" className="pl-9" value={query} onChange={e=>setQuery(e.target.value)} /></div></Field><div className="max-h-72 overflow-y-auto rounded-md border p-2">{visiblePeriods.map(item=><FieldLabel key={item.time_period_code}><Field orientation="horizontal"><Checkbox isSelected={selectedPeriods.includes(item.time_period_code ?? "")} onChange={selected=>setSelectedPeriods(current=>selected?[...current,item.time_period_code ?? ""]:current.filter(value=>value!==item.time_period_code))}/><FieldContent><FieldTitle>{item.name ?? item.time_period_code}</FieldTitle><FieldDescription>{item.time_period_code}</FieldDescription></FieldContent></Field></FieldLabel>)}</div></>}
    <FieldLabel><Field orientation="horizontal"><Checkbox isSelected={entity === "period" ? period.is_active : entity === "frequency" ? frequency.is_active : sequence.is_active} onChange={selected=>entity === "period" ? setPeriod(v=>({...v,is_active:selected})) : entity === "frequency" ? setFrequency(v=>({...v,is_active:selected})) : setSequence(v=>({...v,is_active:selected}))}/><FieldContent><FieldTitle>{t("pages.timePeriods.filters.active")}</FieldTitle></FieldContent></Field></FieldLabel>
  </FieldGroup></CardContent><CardFooter className="justify-end gap-2 border-t"><Button type="button" variant="outline" isDisabled={isSubmitting} onPress={()=>navigate(ROOT)}>{t("pages.timePeriods.actions.cancel")}</Button><Button type="submit" isDisabled={isSubmitting || (entity === "sequence" && !selectedPeriods.length)}>{isSubmitting?<Spinner data-icon="inline-start"/>:<Save data-icon="inline-start"/>}{t(isSubmitting ? "pages.timePeriods.actions.saving" : entity === "period" ? "pages.timePeriods.actions.savePeriod" : entity === "sequence" ? "pages.timePeriods.actions.saveSequence" : "pages.timePeriods.actions.saveFrequency")}</Button></CardFooter></Card></form>}</PageSection>;
}
