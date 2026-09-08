import { PageSection } from "@/components/common/page-layout";
import { useQuery } from "@tanstack/react-query";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { createMasterRecord, getOrganizationRecord } from "../../api/masters-reference.api";
import { OfficerForm, OfficerPageHeading } from "./officer-form";
import { DEFAULT_OFFICER_VALUES, OFFICERS_ENDPOINT, officerPayload, type OfficerFormValues } from "./officer-schema";
import { sourceOfficersPath } from "./source-ministry-routes";

export function CreateOfficerPage() {
  const navigate = useNavigate();
  const { t } = useTranslation("common");
  const { organizationCode = "" } = useParams<{ organizationCode: string }>();
  const decodedOrganizationCode = decodeURIComponent(organizationCode);
  const returnToOfficers = () => navigate(sourceOfficersPath(decodedOrganizationCode));
  const organizationQuery = useQuery({ queryKey: ["masters", "organizations", "detail", decodedOrganizationCode], queryFn: () => getOrganizationRecord(decodedOrganizationCode), enabled: Boolean(decodedOrganizationCode) });
  async function createOfficer(values: OfficerFormValues) {
    try {
      await createMasterRecord({ endpoint: OFFICERS_ENDPOINT, payload: officerPayload({ ...values, organization_code: decodedOrganizationCode }) });
      toast.success(t("pages.sourcesMinistries.officerForm.created"), { description: t("pages.sourcesMinistries.officerForm.createdDescription", { name: values.display_name.trim() }) });
      navigate(sourceOfficersPath(decodedOrganizationCode), { replace: true });
    } catch (error) {
      toast.error(t("pages.sourcesMinistries.officerForm.createError"), { description: error instanceof Error ? error.message : t("pages.sourcesMinistries.officerForm.reviewDetails") });
    }
  }
  const organization = organizationQuery.data ?? { organization_code: decodedOrganizationCode, name: decodedOrganizationCode };
  return <PageSection className="flex min-w-0 flex-col gap-4"><OfficerPageHeading title={t("pages.sourcesMinistries.createOfficerTitle")} description={t("pages.sourcesMinistries.officerForm.createDescription", { organization: String(organization.name ?? decodedOrganizationCode) })} onBack={returnToOfficers} /><OfficerForm defaultValues={{ ...DEFAULT_OFFICER_VALUES, organization_code: decodedOrganizationCode }} lockedOrganizationCode={decodedOrganizationCode} organizations={[organization]} onCancel={returnToOfficers} onSubmit={createOfficer} /></PageSection>;
}
