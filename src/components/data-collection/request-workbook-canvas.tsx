import { lazy, memo, Suspense, useMemo } from "react";
import { useTranslation } from "react-i18next";
import { createRequestPreviewWorkbook } from "@/utils/request-preview-workbook";
import { Loader } from "@/components/common/loader";

const FortuneSpreadsheet = lazy(() => import("@/components/fortune-spreadsheet").then((module) => ({ default: module.FortuneSpreadsheet })));

// Review comments and background requests must not remount the workbook.
export const RequestWorkbookCanvas = memo(function RequestWorkbookCanvas({ response, sheetName }: { response: Record<string, unknown>; sheetName: string }) {
  const { t } = useTranslation("ingestion");
  const workbook = useMemo(() => createRequestPreviewWorkbook(response, sheetName), [response, sheetName]);
  const loader = <Loader className="h-full" text={t("dataCollection.detail.preview.loading")} />;
  return <Suspense fallback={loader}><FortuneSpreadsheet initialData={workbook} readOnly showToolbar={false} loadingFallback={loader} /></Suspense>;
});
