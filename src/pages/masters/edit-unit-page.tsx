import { PageSection } from "@/components/common/page-layout";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useQuery } from "@tanstack/react-query";
import { CircleAlert, RefreshCw } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { getOrganizationRecord, listMasterRecords, updateMasterRecord, type MasterRecord } from "../../api/masters-reference.api";
import { SOURCES_MINISTRIES_PATH } from "./source-ministry-routes";
import { UnitForm, UnitPageHeading } from "./unit-form";
import { ORGANIZATIONS_ENDPOINT, ORGANIZATION_TYPES, unitPayload, type UnitFormValues } from "./unit-schema";

export function EditUnitPage() {
  const navigate = useNavigate();
  const { t } = useTranslation("common");
  const { organizationCode = "" } = useParams<{ organizationCode: string }>();
  const decodedCode = decodeURIComponent(organizationCode);
  const returnToUnits = () => navigate(SOURCES_MINISTRIES_PATH);
  const detailQuery = useQuery({ queryKey: ["masters", "organizations", "detail", decodedCode], queryFn: () => getOrganizationRecord(decodedCode), enabled: Boolean(decodedCode) });
  const organizationsQuery = useQuery({ queryKey: ["masters", "organizations", "options"], queryFn: () => listMasterRecords({ endpoint: ORGANIZATIONS_ENDPOINT, params: { limit: 500, offset: 0, status_filter: "ALL" } }) });
  async function updateUnit(values: UnitFormValues) {
    try {
      await updateMasterRecord({ endpoint: ORGANIZATIONS_ENDPOINT, patchPath: `${ORGANIZATIONS_ENDPOINT}/${encodeURIComponent(decodedCode)}`, payload: unitPayload({ ...values, organization_code: decodedCode }) });
      toast.success(t("pages.sourcesMinistries.organizationForm.updated"), { description: t("pages.sourcesMinistries.organizationForm.updatedDescription", { name: values.name.trim() }) });
      navigate(SOURCES_MINISTRIES_PATH, { replace: true });
    } catch (error) {
      toast.error(t("pages.sourcesMinistries.organizationForm.updateError"), { description: error instanceof Error ? error.message : t("pages.sourcesMinistries.organizationForm.reviewDetails") });
    }
  }
  return <PageSection className="flex min-w-0 flex-col gap-4"><UnitPageHeading title={t("pages.sourcesMinistries.editTitle")} description={t("pages.sourcesMinistries.editDescription")} onBack={returnToUnits} />{detailQuery.isPending ? <div className="mx-auto flex w-full max-w-xl items-center justify-center gap-2 py-10 text-muted-foreground" role="status"><Spinner />{t("pages.sourcesMinistries.organizationForm.loading")}</div> : detailQuery.error ? <Alert className="mx-auto w-full max-w-xl" variant="destructive"><CircleAlert aria-hidden="true" /><AlertTitle>{t("pages.sourcesMinistries.organizationForm.loadError")}</AlertTitle><AlertDescription>{detailQuery.error instanceof Error ? detailQuery.error.message : t("pages.sourcesMinistries.organizationForm.loadAgain")}</AlertDescription><AlertAction><Button type="button" variant="outline" size="sm" onPress={() => void detailQuery.refetch()}><RefreshCw data-icon="inline-start" aria-hidden="true" />{t("pages.sourcesMinistries.organizationForm.retry")}</Button></AlertAction></Alert> : detailQuery.data ? <UnitForm mode="edit" organizations={organizationsQuery.data?.data ?? []} defaultValues={unitFormValues(detailQuery.data)} onCancel={returnToUnits} onSubmit={updateUnit} /> : null}</PageSection>;
}

function unitFormValues(record: MasterRecord): UnitFormValues {
  const rawType = String(record.organization_type ?? "OTHER");
  return { organization_code: String(record.organization_code ?? ""), name: String(record.name ?? ""), organization_type: ORGANIZATION_TYPES.find((type) => type === rawType) ?? "OTHER", parent_organization_code: String(record.parent_organization_code ?? ""), short_code: String(record.short_code ?? ""), description: String(record.description ?? ""), is_active: typeof record.is_active === "boolean" ? record.is_active : true };
}
