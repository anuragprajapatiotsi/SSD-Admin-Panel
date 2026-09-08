import { PageSection, PageHeader } from "@/components/common/page-layout";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Plus } from "lucide-react";
import { type FormEvent, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { createIndicator, getIndicator, saveFrameworkIndicatorMapping, updateIndicator } from "../../api/indicators.api";
import {
  getFrameworkHierarchy,
  listFrameworkEditions,
  type FrameworkEdition,
  type FrameworkHierarchy,
  type FrameworkNode,
} from "../../api/framework.api";
import { getSelectedUnitCode } from "../../api/session.api";
import { Loader } from "../../components/common/loader";

type IndicatorDraft = {
  nationalIndicatorCode: string;
  indicatorNumber: string;
  name: string;
  description: string;
  status: string;
  colorValue: string;
  targetNodeCode: string;
};

const initialDraft: IndicatorDraft = {
  nationalIndicatorCode: "",
  indicatorNumber: "",
  name: "",
  description: "",
  status: "DRAFT",
  colorValue: "#e91d3d",
  targetNodeCode: "",
};

function indicatorTargets(hierarchy: FrameworkHierarchy | null): FrameworkNode[] {
  if (!hierarchy) return [];
  const mappingLevels = hierarchy.levels.filter((level) => level.is_active !== false && level.allows_indicator_mapping);
  const fallbackLevel = hierarchy.levels
    .filter((level) => level.is_active !== false)
    .sort((left, right) => Number(right.level_number ?? 0) - Number(left.level_number ?? 0))[0];
  const allowedLevels = new Set((mappingLevels.length ? mappingLevels : fallbackLevel ? [fallbackLevel] : []).map((level) => level.level_code));
  return hierarchy.nodes
    .filter((node) => node.is_active !== false && allowedLevels.has(node.level_code))
    .sort((left, right) => String(left.node_number ?? left.node_code).localeCompare(String(right.node_number ?? right.node_code), undefined, { numeric: true }));
}

function nodeLabel(node: FrameworkNode, hierarchy: FrameworkHierarchy | null) {
  const relationship = hierarchy?.relationships.find((item) => item.child_node_code === node.node_code && item.is_active !== false);
  const parent = relationship ? hierarchy?.nodes.find((item) => item.node_code === relationship.parent_node_code) : undefined;
  return [parent?.node_number ?? parent?.name, node.node_number, node.name ?? node.short_name ?? node.node_code].filter(Boolean).join(" / ");
}

export function IndicatorFormPage({ indicatorCode }: { indicatorCode?: string }) {
  const navigate = useNavigate();
  const { t } = useTranslation(["ingestion", "common"]);
  const isEditing = Boolean(indicatorCode);
  const [draft, setDraft] = useState(initialDraft);
  const [framework, setFramework] = useState<FrameworkEdition | null>(null);
  const [hierarchy, setHierarchy] = useState<FrameworkHierarchy | null>(null);
  const [originalTargetNodeCode, setOriginalTargetNodeCode] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const targets = useMemo(() => indicatorTargets(hierarchy), [hierarchy]);

  useEffect(() => {
    let active = true;
    void (async () => {
      try {
        const response = await listFrameworkEditions(true);
        const selected = response.data.find((item) => item.is_active && item.status !== "INACTIVE")
          ?? response.data.find((item) => item.is_active)
          ?? response.data[0]
          ?? null;
        const hierarchyResponse = selected?.framework_code
          ? await getFrameworkHierarchy(selected.framework_code, selected.edition_code)
          : null;
        const detailResponse = indicatorCode ? await getIndicator(indicatorCode) : null;
        if (!active) return;
        setFramework(selected);
        setHierarchy(hierarchyResponse?.data ?? null);
        if (detailResponse) {
          const detail = detailResponse.data;
          const overview = detail.overview ?? detail;
          const mapping = detail.framework_mappings?.find((item) => item.is_active !== false) ?? detail.framework_mappings?.[0];
          setOriginalTargetNodeCode(mapping?.mapped_node?.node_code ?? "");
          setDraft({
            nationalIndicatorCode: overview.national_indicator_code ?? indicatorCode ?? "",
            indicatorNumber: overview.indicator_number ?? "",
            name: overview.name ?? "",
            description: overview.description ?? "",
            status: overview.status ?? "DRAFT",
            colorValue: overview.color_value ?? "#e91d3d",
            targetNodeCode: mapping?.mapped_node?.node_code ?? "",
          });
        }
      } catch (error) {
        if (active) toast.error(t("ingestion:pillarIndicators.form.frameworkLoadError"), { description: error instanceof Error ? error.message : t("ingestion:pillarIndicators.common.tryAgain") });
      } finally {
        if (active) setIsLoading(false);
      }
    })();
    return () => { active = false; };
  }, [indicatorCode, t]);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!framework?.framework_code || !framework.edition_code) {
      toast.error(t("ingestion:pillarIndicators.form.frameworkRequired"));
      return;
    }
    if (!draft.targetNodeCode) {
      toast.error(t("ingestion:pillarIndicators.form.targetRequired"));
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        framework_code: framework.framework_code,
        edition_code: framework.edition_code,
        owning_unit_code: getSelectedUnitCode(),
        national_indicator_code: draft.nationalIndicatorCode.trim() || undefined,
        indicator_number: draft.indicatorNumber.trim() || undefined,
        name: draft.name.trim(),
        description: draft.description.trim() || undefined,
        status: draft.status,
        is_active: draft.status !== "INACTIVE",
        color_value: draft.colorValue,
        color_method: "HEX",
      };
      let savedIndicatorCode = indicatorCode;
      if (indicatorCode) {
        await updateIndicator(indicatorCode, payload);
      } else {
        const response = await createIndicator(payload);
        const overview = response.data.overview ?? response.data;
        savedIndicatorCode = overview.national_indicator_code ?? draft.nationalIndicatorCode.trim();
      }
      if (!savedIndicatorCode) throw new Error(t("ingestion:pillarIndicators.form.missingCode"));
      if (isEditing && originalTargetNodeCode && originalTargetNodeCode !== draft.targetNodeCode) {
        await saveFrameworkIndicatorMapping({
          framework_code: framework.framework_code,
          edition_code: framework.edition_code,
          node_code: originalTargetNodeCode,
          national_indicator_code: savedIndicatorCode,
          mapping_type: "PRIMARY",
          is_active: false,
        });
      }
      await saveFrameworkIndicatorMapping({
        framework_code: framework.framework_code,
        edition_code: framework.edition_code,
        node_code: draft.targetNodeCode,
        national_indicator_code: savedIndicatorCode,
        mapping_type: "PRIMARY",
        is_active: true,
      });
      toast.success(t(isEditing ? "ingestion:pillarIndicators.form.updated" : "ingestion:pillarIndicators.form.created"));
      navigate("/indicators/library");
    } catch (error) {
      toast.error(t(isEditing ? "ingestion:pillarIndicators.form.updateError" : "ingestion:pillarIndicators.form.createError"), { description: error instanceof Error ? error.message : t("ingestion:pillarIndicators.form.verifyDetails") });
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <PageSection className="flex min-w-0 flex-col gap-4">
      <div className="mx-auto flex w-full max-w-xl flex-col gap-3">
        <Button className="w-fit" type="button" variant="outline" onPress={() => navigate("/indicators/library")}>
          <ArrowLeft data-icon="inline-start" aria-hidden="true" />
          {t("ingestion:pillarIndicators.common.back")}
        </Button>
        <PageHeader>
          <div>
            <h2>{t(isEditing ? "ingestion:pillarIndicators.form.editTitle" : "ingestion:pillarIndicators.form.createTitle")}</h2>
            <p>{t(isEditing ? "ingestion:pillarIndicators.form.editDescription" : "ingestion:pillarIndicators.form.createDescription")}</p>
          </div>
        </PageHeader>
      </div>

      {isEditing && isLoading ? (
        <Loader className="mx-auto w-full max-w-xl py-10" text={t("ingestion:pillarIndicators.common.loadingDetails")} />
      ) : (
      <form className="mx-auto w-full max-w-xl" noValidate onSubmit={submit}>
        <Card>
          <CardHeader className="sr-only">
            <CardTitle>{t(isEditing ? "ingestion:pillarIndicators.form.editTitle" : "ingestion:pillarIndicators.form.createTitle")}</CardTitle>
            <CardDescription>{t("ingestion:pillarIndicators.form.detailsDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-5">
            <FieldGroup>
          <div className="grid gap-4 md:grid-cols-2">
            <Field><FieldLabel htmlFor="indicator-framework">{t("ingestion:pillarIndicators.form.framework")}</FieldLabel><Input id="indicator-framework" value={framework?.framework_code ?? ""} readOnly /></Field>
            <Field><FieldLabel htmlFor="indicator-edition">{t("ingestion:pillarIndicators.form.edition")}</FieldLabel><Input id="indicator-edition" value={framework?.edition_code ?? ""} readOnly /></Field>
          </div>
          <Field>
            <FieldLabel>{t("ingestion:pillarIndicators.form.target")}</FieldLabel>
            <Select aria-label={t("ingestion:pillarIndicators.form.target")} isDisabled={isLoading || !targets.length} selectedKey={draft.targetNodeCode || null} onSelectionChange={(key) => setDraft((current) => ({ ...current, targetNodeCode: String(key ?? "") }))}>
              <SelectTrigger><SelectValue>{({ defaultChildren }) => defaultChildren ?? t(isLoading ? "ingestion:pillarIndicators.form.loadingTargets" : "ingestion:pillarIndicators.form.selectTarget")}</SelectValue></SelectTrigger>
              <SelectContent className="w-max max-w-[calc(100vw-2rem)]"><SelectGroup>{targets.map((node) => <SelectItem className="max-w-lg [&>span:first-child]:whitespace-normal" id={node.node_code} key={node.node_code}>{nodeLabel(node, hierarchy)}</SelectItem>)}</SelectGroup></SelectContent>
            </Select>
            <FieldDescription>{t("ingestion:pillarIndicators.form.targetHelp")}</FieldDescription>
          </Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field><FieldLabel htmlFor="indicator-code">{t("ingestion:pillarIndicators.form.code")}</FieldLabel><Input id="indicator-code" placeholder={t("ingestion:pillarIndicators.form.codePlaceholder")} readOnly={isEditing} value={draft.nationalIndicatorCode} onChange={(event) => setDraft((current) => ({ ...current, nationalIndicatorCode: event.target.value.toUpperCase().replace(/\s+/g, "_") }))} /></Field>
            <Field><FieldLabel htmlFor="indicator-number">{t("ingestion:pillarIndicators.form.number")}</FieldLabel><Input id="indicator-number" placeholder={t("ingestion:pillarIndicators.form.numberPlaceholder")} value={draft.indicatorNumber} onChange={(event) => setDraft((current) => ({ ...current, indicatorNumber: event.target.value }))} /></Field>
          </div>
          <Field><FieldLabel htmlFor="indicator-name">{t("ingestion:pillarIndicators.form.name")}</FieldLabel><Input id="indicator-name" required value={draft.name} onChange={(event) => setDraft((current) => ({ ...current, name: event.target.value }))} /></Field>
          <Field><FieldLabel htmlFor="indicator-description">{t("ingestion:pillarIndicators.form.description")}</FieldLabel><Textarea id="indicator-description" value={draft.description} onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))} /></Field>
          <div className="grid gap-4 md:grid-cols-2">
            <Field><FieldLabel>{t("ingestion:pillarIndicators.form.status")}</FieldLabel><Select aria-label={t("ingestion:pillarIndicators.form.status")} selectedKey={draft.status} onSelectionChange={(key) => setDraft((current) => ({ ...current, status: String(key) }))}><SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectGroup><SelectItem id="DRAFT">{t("ingestion:pillarIndicators.common.draft")}</SelectItem><SelectItem id="ACTIVE">{t("ingestion:pillarIndicators.common.active")}</SelectItem><SelectItem id="INACTIVE">{t("ingestion:pillarIndicators.common.inactive")}</SelectItem></SelectGroup></SelectContent></Select></Field>
            <Field><FieldLabel htmlFor="indicator-color">{t("ingestion:pillarIndicators.form.color")}</FieldLabel><Input id="indicator-color" type="color" value={draft.colorValue} onChange={(event) => setDraft((current) => ({ ...current, colorValue: event.target.value }))} /></Field>
          </div>
            </FieldGroup>
          </CardContent>
          <CardFooter className="justify-end gap-2 border-t">
            <Button type="button" variant="outline" isDisabled={isSaving} onPress={() => navigate("/indicators/library")}>{t("ingestion:pillarIndicators.common.cancel")}</Button>
            <Button type="submit" isDisabled={isLoading || isSaving || !targets.length}>
              {isSaving ? <Spinner data-icon="inline-start" aria-hidden="true" /> : <Plus data-icon="inline-start" aria-hidden="true" />}
              {t(isSaving ? (isEditing ? "ingestion:pillarIndicators.form.saving" : "ingestion:pillarIndicators.form.creating") : (isEditing ? "ingestion:pillarIndicators.form.saveChanges" : "ingestion:pillarIndicators.form.createIndicator"))}
            </Button>
          </CardFooter>
        </Card>
      </form>
      )}
    </PageSection>
  );
}

export function CreateIndicatorPage() {
  return <IndicatorFormPage />;
}
