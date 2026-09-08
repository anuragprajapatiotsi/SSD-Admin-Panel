import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { IconArrowLeft } from "@tabler/icons-react";
import { DATA_API_PATH, useDataApiConnection, useDataApiUnit } from "@/hooks/use-data-api";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { DataApiEditor } from "@/components/data-api/data-api-editor";
import { Loader } from "@/components/common/loader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

export function DataApiEditorPage() {
  const { connectionCode } = useParams();
  const unit = useDataApiUnit();
  const query = useDataApiConnection(unit, connectionCode);
  const { t } = useTranslation("ingestion");
  const navigate = useNavigate();
  useDocumentTitle(t(connectionCode ? "dataApi.editTitle" : "dataApi.createTitle"));
  if (connectionCode && query.isPending) return <Loader text={t("dataApi.loading")} />;
  if (connectionCode && (!query.data || !query.data.configuration)) return <section className="mx-auto flex w-full max-w-3xl flex-col gap-4">
    <Button variant="outline" className="w-fit" onPress={() => navigate(DATA_API_PATH)}><IconArrowLeft aria-hidden="true" />{t("dataApi.back")}</Button>
    <Alert variant="destructive"><AlertDescription>{t("dataApi.loadError")}</AlertDescription><Button variant="outline" isDisabled={query.isFetching} onPress={() => void query.refetch()}>{t("dataApi.retry")}</Button></Alert>
  </section>;
  return <DataApiEditor key={`${unit}:${connectionCode ?? "new"}`} unit={unit} connection={query.data} />;
}
