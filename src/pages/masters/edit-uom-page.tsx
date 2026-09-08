import { PageSection } from "@/components/common/page-layout";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useQuery } from "@tanstack/react-query";
import { CircleAlert, RefreshCw } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { useTranslation } from "react-i18next";
import { getUomRecord, updateMasterRecord, type MasterRecord } from "../../api/masters-reference.api";
import { UomForm, UomPageHeading } from "./uom-form";
import { UOM_PATH, UOM_TYPES, uomPayload, type UomFormValues } from "./uom-schema";

export function EditUomPage() {
  const navigate = useNavigate();
  const { t } = useTranslation("common");
  const { uomCode = "" } = useParams<{ uomCode: string }>();
  const decodedCode = decodeURIComponent(uomCode);
  const returnToUom = () => navigate(UOM_PATH);
  const query = useQuery({ queryKey: ["masters", "uom", "detail", decodedCode], queryFn: () => getUomRecord(decodedCode), enabled: Boolean(decodedCode) });

  async function updateUom(values: UomFormValues) {
    try {
      await updateMasterRecord({ endpoint: UOM_PATH, patchPath: `${UOM_PATH}/${encodeURIComponent(decodedCode)}`, payload: uomPayload({ ...values, uom_code: decodedCode }) });
      toast.success(t("pages.uom.updated"), { description: t("pages.uom.updatedDescription", { name: values.name.trim() }) });
      navigate(UOM_PATH, { replace: true });
    } catch (error) {
      toast.error(t("pages.uom.updateError"), { description: error instanceof Error ? error.message : t("pages.uom.reviewDetails") });
    }
  }

  return (
    <PageSection className="flex min-w-0 flex-col gap-4">
      <UomPageHeading title={t("pages.uom.editTitle")} description={t("pages.uom.editDescription")} onBack={returnToUom} />
      {query.isPending ? <div className="mx-auto flex w-full max-w-xl items-center justify-center gap-2 py-10 text-muted-foreground" role="status"><Spinner />{t("pages.uom.loading")}</div>
        : query.error ? <Alert className="mx-auto w-full max-w-xl" variant="destructive"><CircleAlert aria-hidden="true" /><AlertTitle>{t("pages.uom.loadError")}</AlertTitle><AlertDescription>{query.error instanceof Error ? query.error.message : t("pages.uom.loadAgain")}</AlertDescription><AlertAction><Button type="button" variant="outline" size="sm" onPress={() => void query.refetch()}><RefreshCw data-icon="inline-start" aria-hidden="true" />{t("pages.uom.retry")}</Button></AlertAction></Alert>
          : query.data ? <UomForm mode="edit" defaultValues={uomFormValues(query.data)} onCancel={returnToUom} onSubmit={updateUom} /> : null}
    </PageSection>
  );
}

function uomFormValues(record: MasterRecord): UomFormValues {
  const rawType = String(record.uom_type ?? "COUNT");
  const sortOrder = Number(record.sort_order ?? 0);
  return {
    name: String(record.name ?? ""), uom_code: String(record.uom_code ?? ""), symbol: String(record.symbol ?? ""),
    uom_type: UOM_TYPES.find((type) => type === rawType) ?? "OTHER", description: String(record.description ?? ""),
    sort_order: Number.isFinite(sortOrder) ? sortOrder : 0, is_active: typeof record.is_active === "boolean" ? record.is_active : true,
  };
}
