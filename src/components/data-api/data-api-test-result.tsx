import { useTranslation } from "react-i18next";
import type { ExternalApiTest } from "@/api/external-api.api";
import { StatusBadge } from "@/components/common/status-badge";
import { normalizeStatusVariant } from "@/components/common/status-variants";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export function DataApiTestResult({ result }: { result: ExternalApiTest }) {
  const { t } = useTranslation("ingestion");
  const success = result.status === "SUCCESS";
  return <Alert variant={success ? "default" : "destructive"} aria-live="polite">
    <AlertTitle><StatusBadge variant={normalizeStatusVariant(result.status)}>{t(success ? "dataApi.testSuccess" : "dataApi.testFailed")}</StatusBadge></AlertTitle>
    <AlertDescription className="flex flex-col gap-1">
      <span>{t(success ? "dataApi.testSuccessHelp" : "dataApi.testFailedHelp")}</span>
      <span className="flex flex-wrap gap-3">
        {result.httpStatus != null ? <span>{t("dataApi.httpStatus", { status: result.httpStatus })}</span> : null}
        {result.durationMs != null ? <span>{t("dataApi.duration", { duration: result.durationMs })}</span> : null}
      </span>
    </AlertDescription>
  </Alert>;
}
