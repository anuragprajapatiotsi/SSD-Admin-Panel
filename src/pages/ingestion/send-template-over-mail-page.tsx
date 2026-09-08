import { getSelectedLocale, getSelectedUnitCode } from "@/api/session.api";
import { Loader } from "@/components/common/loader";
import { CollectionTemplateSelection } from "@/components/data-collection/collection-template-selection";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { useRequestPeriodCollection } from "@/hooks/use-template-workflow";
import { useAppShellLayout } from "@/layouts/app-shell-context";
import { cn } from "@/lib/utils";
import { IconAlertTriangle, IconArrowLeft } from "@tabler/icons-react";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { ExcelTemplateForm } from "./excel-template-form";

export function SendTemplateOverMailPage() {
  const { collectionCode = "" } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation("ingestion");
  const { setImmersiveContent } = useAppShellLayout();
  const [selectedTemplateId, setSelectedTemplateId] = useState("");
  const [previewTemplateId, setPreviewTemplateId] = useState("");
  const [isDispatchPending, setIsDispatchPending] = useState(false);
  const collectionQuery = useRequestPeriodCollection(
    collectionCode,
    getSelectedUnitCode(),
    getSelectedLocale(),
  );
  const collection = collectionQuery.data;
  const isPreviewOpen = Boolean(previewTemplateId);
  useDocumentTitle(t("dataCollection.sendTemplate.routeTitle"));

  useEffect(() => {
    setImmersiveContent(isPreviewOpen);
    return () => setImmersiveContent(false);
  }, [isPreviewOpen, setImmersiveContent]);

  const openPreview = useCallback((templateId: string) => {
    setSelectedTemplateId(templateId);
    setPreviewTemplateId(templateId);
  }, []);

  const closePreview = useCallback(() => {
    setPreviewTemplateId("");
  }, []);

  const handleTemplateSaved = useCallback((templateName: string) => {
    toast.success(t("dataCollection.sendTemplate.saved", { name: templateName }));
  }, [t]);

  if (collectionQuery.isPending) {
    return <Loader className="h-full min-h-0 w-full" text={t("dataCollection.sendTemplate.loadingCollection")} />;
  }

  if (!collection) {
    return (
      <Alert variant="destructive">
        <IconAlertTriangle aria-hidden="true" />
        <AlertTitle>{t("dataCollection.detail.errorTitle")}</AlertTitle>
        <AlertDescription>
          {collectionQuery.error instanceof Error
            ? collectionQuery.error.message
            : t("dataCollection.detail.errorDescription")}
        </AlertDescription>
      </Alert>
    );
  }

  const collectionPath = `/ingestion/data-collection/${encodeURIComponent(collection.collectionCode)}`;

  return (
    <section
      className={cn("min-w-0", isPreviewOpen ? "h-full min-h-0" : "pb-4")}
      aria-label={t("dataCollection.sendTemplate.routeTitle")}
    >
      <div
        className={cn(
          "grid min-w-0 transition-[grid-template-columns,grid-template-rows] duration-300 ease-out motion-reduce:transition-none",
          isPreviewOpen
            ? "h-full min-h-0 grid-cols-1 grid-rows-[minmax(16rem,2fr)_minmax(24rem,5fr)] md:grid-cols-[minmax(20rem,2fr)_minmax(0,5fr)] md:grid-rows-1"
            : "grid-cols-[minmax(0,1fr)_0fr] grid-rows-1",
        )}
      >
        <main
          className={cn(
            "min-h-0 min-w-0",
            isPreviewOpen && "overflow-hidden",
          )}
        >
          <div className={cn(
            "flex w-full min-w-0 flex-col gap-3",
            isPreviewOpen ? "h-full min-h-0 gap-0" : "mx-auto max-w-3xl",
          )}>
            <header className={cn(isPreviewOpen && "shrink-0 bg-background p-4")}>
              <Button
                className="w-fit"
                type="button"
                variant="outline"
                onPress={() => navigate(collectionPath)}
              >
                <IconArrowLeft data-icon="inline-start" aria-hidden="true" />
                {t("dataCollection.sendTemplate.back")}
              </Button>
            </header>

            <CollectionTemplateSelection
              collectionName={collection.collectionLabel}
              collectionCode={collection.collectionCode}
              unitCode={collection.unitCode}
              yearPeriod={collection.yearPeriod}
              scheduleStartDate={collection.scheduleStartDate}
              dueDate={collection.dueDate}
              presentation={isPreviewOpen ? "pane" : "card"}
              selectedTemplateId={selectedTemplateId}
              onSelectionChange={setSelectedTemplateId}
              onPreview={openPreview}
              onCancel={() => navigate(collectionPath)}
              onDispatchPendingChange={setIsDispatchPending}
            />
          </div>
        </main>

        <aside
          className={cn(
            "min-h-0 min-w-0 overflow-hidden bg-background transition-opacity duration-300 motion-reduce:transition-none",
            isPreviewOpen ? "border-t opacity-100 md:border-t-0 md:border-l" : "invisible opacity-0",
          )}
          aria-label={t("dataCollection.sendTemplate.previewLabel")}
          aria-hidden={!isPreviewOpen}
        >
          {previewTemplateId ? (
            <ExcelTemplateForm
              key={previewTemplateId}
              mode="edit"
              templateId={previewTemplateId}
              presentation="split-preview"
              isSaveDisabled={isDispatchPending}
              onExit={closePreview}
              onSaved={handleTemplateSaved}
            />
          ) : null}
        </aside>
      </div>
    </section>
  );
}
