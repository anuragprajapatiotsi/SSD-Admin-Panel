import { PageSection } from "@/components/common/page-layout";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { createMasterRecord, listMasterRecords } from "../../api/masters-reference.api";
import { sourceOfficersPath, SOURCES_MINISTRIES_PATH } from "./source-ministry-routes";
import { UnitForm, UnitPageHeading } from "./unit-form";
import { ORGANIZATIONS_ENDPOINT, unitPayload, type UnitFormValues } from "./unit-schema";

export function CreateUnitPage() {
  const navigate = useNavigate();
  const { t } = useTranslation("common");
  const returnToUnits = () => navigate(SOURCES_MINISTRIES_PATH);
  const organizationsQuery = useQuery({
    queryKey: ["masters", "organizations", "options"],
    queryFn: () => listMasterRecords({ endpoint: ORGANIZATIONS_ENDPOINT, params: { limit: 500, offset: 0, status_filter: "ALL" } }),
  });
  async function createUnit(values: UnitFormValues) {
    try {
      const payload = unitPayload(values);
      const created = await createMasterRecord({ endpoint: ORGANIZATIONS_ENDPOINT, payload });
      const organizationCode = typeof created.organization_code === "string" && created.organization_code.trim()
        ? created.organization_code.trim()
        : payload.organization_code;
      toast.success(t("pages.sourcesMinistries.organizationForm.created"), { description: t("pages.sourcesMinistries.organizationForm.createdDescription", { name: values.name.trim() }) });
      navigate(sourceOfficersPath(organizationCode), { replace: true });
    } catch (error) {
      toast.error(t("pages.sourcesMinistries.organizationForm.createError"), { description: error instanceof Error ? error.message : t("pages.sourcesMinistries.organizationForm.reviewDetails") });
    }
  }
  return <PageSection className="flex min-w-0 flex-col gap-4"><UnitPageHeading title={t("pages.sourcesMinistries.createTitle")} description={t("pages.sourcesMinistries.createDescription")} onBack={returnToUnits} /><UnitForm organizations={organizationsQuery.data?.data ?? []} onCancel={returnToUnits} onSubmit={createUnit} /></PageSection>;
}
