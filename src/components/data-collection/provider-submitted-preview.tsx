import { lazy, Suspense, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import type { FortuneWorkbookData } from "@/utils/fortune-workbook";
import { Loader } from "@/components/common/loader";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScreenTour } from "@/components/common/guided-tour/guided-tour";
import { providerTours } from "./provider-tours";
import { TemplateEditorCanvas, TemplateEditorHeader, TemplateEditorWorkspace } from "@/components/template-editor/template-editor-workspace";

const FortuneSpreadsheet = lazy(() => import("@/components/fortune-spreadsheet").then((module) => ({ default: module.FortuneSpreadsheet })));

// Preview the exact successfully sent file; never replace submitted data with the original template.
export function ProviderSubmittedPreview({ file, onBack }: { file: File; onBack: () => void }) {
  const { t } = useTranslation("ingestion");
  const [workbook, setWorkbook] = useState<FortuneWorkbookData | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setFailed(false);
    void import("@/utils/fortune-workbook").then(({ parseFileToFortuneWorkbook }) => parseFileToFortuneWorkbook(file))
      .then((data) => { if (active) setWorkbook(data); })
      .catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
  }, [file, attempt]);
  const loader = <Loader className="size-full min-h-0" text={t("providerAccess.loadingWorkbook")} />;
  return <TemplateEditorWorkspace data-tour-scope="provider-preview" className="h-svh">
    <ScreenTour definition={providerTours.preview} ready={Boolean(workbook) && !failed} />
    <TemplateEditorHeader className="flex items-center justify-between gap-3">
      <h2 className="min-w-0 truncate text-sm font-medium">{file.name}</h2>
      <Button data-tour="provider-preview-close" variant="outline" onPress={onBack}>{t("providerAccess.closePreview")}</Button>
    </TemplateEditorHeader>
    <TemplateEditorCanvas data-tour="provider-preview-workbook">
      {failed ? <div className="flex flex-col items-center gap-3 p-4"><Alert variant="destructive"><AlertDescription>{t("providerAccess.workbookLoadError")}</AlertDescription></Alert><Button onPress={() => setAttempt((value) => value + 1)}>{t("providerAccess.retry")}</Button></div>
        : workbook ? <Suspense fallback={loader}><FortuneSpreadsheet initialData={workbook} loadingFallback={loader} readOnly showToolbar={false} /></Suspense> : loader}
    </TemplateEditorCanvas>
  </TemplateEditorWorkspace>;
}
