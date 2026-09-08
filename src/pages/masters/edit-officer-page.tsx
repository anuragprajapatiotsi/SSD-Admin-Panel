import { PageSection } from "@/components/common/page-layout";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useQuery } from "@tanstack/react-query";
import { CircleAlert, RefreshCw } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { getOfficerRecord, getOrganizationRecord, updateMasterRecord, type MasterRecord } from "../../api/masters-reference.api";
import { OfficerForm, OfficerPageHeading } from "./officer-form";
import { OFFICERS_ENDPOINT, ORGANIZATIONS_ENDPOINT, officerPayload, type OfficerFormValues } from "./officer-schema";
import { sourceOfficersPath } from "./source-ministry-routes";

export function EditOfficerPage() {
  const navigate = useNavigate();
  const { t } = useTranslation("common");
  const { organizationCode = "", officerCode = "" } = useParams<{ organizationCode: string; officerCode: string }>();
  const decodedOrganizationCode = decodeURIComponent(organizationCode);
  const decodedOfficerCode = decodeURIComponent(officerCode);
  const returnToOfficers = () => navigate(sourceOfficersPath(decodedOrganizationCode));
  const detailQuery = useQuery({ queryKey: ["masters", "officers", "detail", decodedOrganizationCode, decodedOfficerCode], queryFn: () => getOfficerRecord(decodedOrganizationCode, decodedOfficerCode), enabled: Boolean(decodedOrganizationCode && decodedOfficerCode) });
  const organizationQuery = useQuery({ queryKey: ["masters", "organizations", "detail", decodedOrganizationCode], queryFn: () => getOrganizationRecord(decodedOrganizationCode), enabled: Boolean(decodedOrganizationCode) });
  async function updateOfficer(values: OfficerFormValues) {
    try {
      await updateMasterRecord({ endpoint: OFFICERS_ENDPOINT, patchPath: `${ORGANIZATIONS_ENDPOINT}/${encodeURIComponent(decodedOrganizationCode)}/officers/${encodeURIComponent(decodedOfficerCode)}`, payload: officerPayload({ ...values, organization_code: decodedOrganizationCode, officer_code: decodedOfficerCode }) });
      toast.success(t("pages.sourcesMinistries.officerForm.updated"), { description: t("pages.sourcesMinistries.officerForm.updatedDescription", { name: values.display_name.trim() }) });
      navigate(sourceOfficersPath(decodedOrganizationCode), { replace: true });
    } catch (error) {
      toast.error(t("pages.sourcesMinistries.officerForm.updateError"), { description: error instanceof Error ? error.message : t("pages.sourcesMinistries.officerForm.reviewDetails") });
    }
  }
  const organization = organizationQuery.data ?? { organization_code: decodedOrganizationCode, name: decodedOrganizationCode };
  return <PageSection className="flex min-w-0 flex-col gap-4"><OfficerPageHeading title={t("pages.sourcesMinistries.editOfficerTitle")} description={t("pages.sourcesMinistries.officerForm.editDescription", { organization: String(organization.name ?? decodedOrganizationCode) })} onBack={returnToOfficers} />{detailQuery.isPending ? <div className="mx-auto flex w-full max-w-xl items-center justify-center gap-2 py-10 text-muted-foreground" role="status"><Spinner />{t("pages.sourcesMinistries.officerForm.loading")}</div> : detailQuery.error ? <Alert className="mx-auto w-full max-w-xl" variant="destructive"><CircleAlert aria-hidden="true" /><AlertTitle>{t("pages.sourcesMinistries.officerForm.loadError")}</AlertTitle><AlertDescription>{detailQuery.error instanceof Error ? detailQuery.error.message : t("pages.sourcesMinistries.officerForm.loadAgain")}</AlertDescription><AlertAction><Button type="button" variant="outline" size="sm" onPress={() => void detailQuery.refetch()}><RefreshCw data-icon="inline-start" aria-hidden="true" />{t("pages.sourcesMinistries.officerForm.retry")}</Button></AlertAction></Alert> : detailQuery.data ? <OfficerForm mode="edit" lockedOrganizationCode={decodedOrganizationCode} organizations={[organization]} defaultValues={officerFormValues(detailQuery.data)} onCancel={returnToOfficers} onSubmit={updateOfficer} /> : null}</PageSection>;
}

function officerFormValues(record: MasterRecord): OfficerFormValues {
  return { organization_code: String(record.organization_code ?? ""), officer_code: String(record.officer_code ?? ""), display_name: String(record.display_name ?? ""), email: String(record.email ?? ""), mobile_number: String(record.mobile_number ?? ""), designation: String(record.designation ?? ""), is_active: typeof record.is_active === "boolean" ? record.is_active : true };
}
