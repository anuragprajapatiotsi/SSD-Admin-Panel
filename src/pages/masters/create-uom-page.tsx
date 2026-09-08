import { PageSection } from "@/components/common/page-layout";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { createMasterRecord } from "../../api/masters-reference.api";
import { UomForm, UomPageHeading } from "./uom-form";
import { UOM_PATH, uomPayload, type UomFormValues } from "./uom-schema";

export function CreateUomPage() {
  const navigate = useNavigate();
  const { t } = useTranslation("common");
  const returnToUom = () => navigate(UOM_PATH);

  async function createUom(values: UomFormValues) {
    try {
      await createMasterRecord({ endpoint: UOM_PATH, payload: uomPayload(values) });
      toast.success(t("pages.uom.created"), { description: t("pages.uom.createdDescription", { name: values.name.trim() }) });
      navigate(UOM_PATH, { replace: true });
    } catch (error) {
      toast.error(t("pages.uom.createError"), { description: error instanceof Error ? error.message : t("pages.uom.reviewDetails") });
    }
  }

  return <PageSection className="flex min-w-0 flex-col gap-4"><UomPageHeading title={t("pages.uom.createTitle")} description={t("pages.uom.createDescription")} onBack={returnToUom} /><UomForm onCancel={returnToUom} onSubmit={createUom} /></PageSection>;
}
