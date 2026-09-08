import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader } from "@/components/common/loader";
import { Separator } from "@/components/ui/separator";
import { TemplateConfirmationDialog } from "@/components/template-editor/template-confirmation-dialog";
import { TemplateEditorToolbar } from "@/components/template-editor/template-editor-toolbar";
import { TemplateEmptyState } from "@/components/template-editor/template-empty-state";
import { TemplateDetailsPanel } from "@/components/template-editor/template-metadata-bar";
import type { TemplateEditorMode } from "@/components/template-editor/template-editor-types";
import {
  TemplateEditorCanvas,
  TemplateEditorWorkspace,
} from "@/components/template-editor/template-editor-workspace";
import {
  TemplateWorkspaceErrorState,
  TemplateWorkspaceLoadingState,
} from "@/components/template-editor/template-workspace-states";
import { FortuneSpreadsheet } from "@/components/fortune-spreadsheet";
import { useExcelTemplateEditor } from "@/hooks/use-excel-template-editor";
import { useAppShellLayout } from "@/layouts/app-shell-context";
import { cn } from "@/lib/utils";
import { IconAlertTriangle } from "@tabler/icons-react";
import { useEffect, useMemo, useRef, useState } from "react";
import { FormProvider } from "react-hook-form";
import { useTranslation } from "react-i18next";

export type ExcelTemplateFormMode = TemplateEditorMode;

type ExcelTemplateFormProps = {
  mode: ExcelTemplateFormMode;
  templateId?: string;
  presentation?: "page" | "split-preview";
  isSaveDisabled?: boolean;
  onExit?: () => void;
  onSaved?: (templateName: string) => void;
};

export function ExcelTemplateForm({
  mode,
  templateId,
  presentation = "page",
  isSaveDisabled = false,
  onExit,
  onSaved,
}: ExcelTemplateFormProps) {
  const { t } = useTranslation("ingestion");
  const { workbookRef, ...editor } = useExcelTemplateEditor({ mode, templateId, onExit, onSaved });
  const { collapseHeader, isHeaderExpanded, toggleHeader } = useAppShellLayout();
  const isInteractionDisabled = editor.isInitialLoading || editor.isWorkbookLoading || editor.isSubmitting;
  const isViewerActive = Boolean(editor.file && editor.workbookData);
  const workbookLoadingFallback = useMemo(() => <TemplateWorkspaceLoadingState />, []);
  const wasViewerActiveRef = useRef(false);
  const [isDetailsOpen, setIsDetailsOpen] = useState(true);

  async function requestTemplateSubmission() {
    const isValid = await editor.form.trigger("templateName");
    if (!isValid) return;

    await editor.submitTemplate();
  }

  useEffect(() => {
    if (isViewerActive && presentation === "page") collapseHeader();
  }, [collapseHeader, isViewerActive, presentation]);

  useEffect(() => {
    if (isViewerActive && !wasViewerActiveRef.current) setIsDetailsOpen(true);
    wasViewerActiveRef.current = isViewerActive;
  }, [isViewerActive, presentation]);

  return (
    <FormProvider {...editor.form}>
      <TemplateEditorWorkspace>
        {editor.file ? (
          <TemplateEditorToolbar
            file={editor.file}
            sheetCount={editor.workbookData?.length}
            isDirty={editor.hasUnsavedChanges}
            isDisabled={editor.isWorkbookLoading || editor.isSubmitting}
            isDetailsOpen={isDetailsOpen}
            isAppHeaderExpanded={isHeaderExpanded}
            onToggleDetails={() => setIsDetailsOpen((isOpen) => !isOpen)}
            onToggleAppHeader={toggleHeader}
            onAddRow={() => workbookRef.current?.addRow()}
            onAddColumn={() => workbookRef.current?.addColumn()}
            onRemoveFile={editor.requestRemoveFile}
            onReplaceFile={(file) => void editor.openFile(file)}
            showDetailsToggle={presentation === "page"}
            isSaveDisabled={isSaveDisabled}
            isSaving={editor.isSubmitting}
            onSave={presentation === "split-preview" ? () => void requestTemplateSubmission() : undefined}
            previewBackLabel={presentation === "split-preview" ? t("dataCollection.sendTemplate.closePreview") : t("templateForm.backToTemplates")}
            onPreviewBack={editor.requestExit}
          />
        ) : null}
        <div
          className={cn(
            "grid min-h-0 min-w-0 flex-1 grid-cols-1",
            isViewerActive && isDetailsOpen && presentation === "page"
              ? "grid-rows-[minmax(0,1fr)_auto_minmax(14rem,40%)] md:grid-cols-[minmax(0,1fr)_auto_20rem] md:grid-rows-1"
              : "grid-rows-1",
          )}
        >
        <TemplateEditorCanvas>
          <div className="flex size-full min-h-0 flex-col bg-background">
            <div className="relative flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
              {editor.isInitialLoading ? (
                workbookLoadingFallback
              ) : editor.loadError ? (
                <TemplateWorkspaceErrorState message={editor.loadError} onRetry={editor.retryInitialLoad} />
              ) : !editor.file || !editor.workbookData ? (
                <TemplateEmptyState
                  error={editor.fileError}
                  isLoading={editor.isWorkbookLoading}
                  isAppHeaderExpanded={isHeaderExpanded}
                  onBack={editor.requestExit}
                  onCreateBlank={editor.createBlankWorkbook}
                  onSelectFile={(file) => void editor.openFile(file)}
                  onToggleAppHeader={toggleHeader}
                />
              ) : (
                <>
                  {editor.fileError ? (
                    <Alert className="rounded-none border-x-0 border-t-0" variant="destructive">
                      <IconAlertTriangle aria-hidden="true" />
                      <AlertTitle>{t("templateForm.workspace.fileErrorTitle")}</AlertTitle>
                      <AlertDescription>{editor.fileError}</AlertDescription>
                    </Alert>
                  ) : null}
                  {editor.isWorkbookLoading ? (
                    <Loader
                      className="absolute inset-0 min-h-0 bg-background/80"
                      text={t("templateForm.upload.preparing")}
                    />
                  ) : (
                    <div className="min-h-0 min-w-0 flex-1">
                      <FortuneSpreadsheet
                        key={`${editor.file.name}:${editor.file.lastModified}:${editor.file.size}`}
                        ref={workbookRef}
                        initialData={editor.workbookData}
                        loadingFallback={workbookLoadingFallback}
                        onDirty={editor.markWorkbookDirty}
                      />
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        </TemplateEditorCanvas>

        {editor.file && isViewerActive && isDetailsOpen && presentation === "page" ? (
          <>
            <Separator className="md:hidden" />
            <Separator orientation="vertical" className="hidden h-full md:block" />
            <TemplateDetailsPanel
              mode={mode}
              isDisabled={isInteractionDisabled}
              isPending={editor.isSubmitting}
              canSubmit={Boolean(editor.file && editor.workbookData && !editor.isWorkbookLoading)}
              submitError={editor.submitError}
              onSubmit={() => void requestTemplateSubmission()}
            />
          </>
        ) : null}
        </div>

      </TemplateEditorWorkspace>

      <TemplateConfirmationDialog
        intent={editor.confirmationIntent}
        onCancel={editor.cancelConfirmation}
        onConfirm={editor.confirmAction}
      />

    </FormProvider>
  );
}
