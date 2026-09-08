import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { FileUpload } from "@/components/common/file-upload";
import { Spinner } from "@/components/ui/spinner";
import {
  IconAlertTriangle,
  IconArrowLeft,
  IconFileSpreadsheet,
  IconFolderOpen,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { TemplateAppHeaderToggle } from "./template-app-header-toggle";

const TEMPLATE_FILE_ACCEPT = ".xlsx,.csv,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

type TemplateEmptyStateProps = {
  error?: string;
  isLoading?: boolean;
  isAppHeaderExpanded: boolean;
  onBack: () => void;
  onToggleAppHeader: () => void;
  onCreateBlank: () => void;
  onSelectFile: (file: File) => void;
};

export function TemplateEmptyState({
  error,
  isLoading = false,
  isAppHeaderExpanded,
  onBack,
  onToggleAppHeader,
  onCreateBlank,
  onSelectFile,
}: TemplateEmptyStateProps) {
  const { t } = useTranslation("ingestion");
  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 p-3">
      <div className="flex items-center justify-between gap-2">
        <Button type="button" variant="outline" size="sm" isDisabled={isLoading} onPress={onBack}>
          <IconArrowLeft data-icon="inline-start" aria-hidden="true" />
          {t("templateForm.backToTemplates")}
        </Button>
        <TemplateAppHeaderToggle
          isExpanded={isAppHeaderExpanded}
          onToggle={onToggleAppHeader}
        />
      </div>
      <FileUpload
        title={t("templateForm.workspace.emptyTitle")}
        description={t("templateForm.workspace.emptyDescription")}
        activeTitle={t("templateForm.workspace.dropActiveTitle")}
        activeDescription={t("templateForm.workspace.dropActiveDescription")}
        browseLabel={t("templateForm.workspace.browseDevice")}
        inputLabel={t("templateForm.workspace.browseDevice")}
        accept={TEMPLATE_FILE_ACCEPT}
        disabled={isLoading}
        icon={isLoading ? <Spinner aria-label={t("templateForm.upload.preparing")} /> : <IconFolderOpen aria-hidden="true" />}
        onFileSelect={onSelectFile}
        actions={(
          <Button type="button" variant="outline" isDisabled={isLoading} onPress={onCreateBlank}>
            <IconFileSpreadsheet data-icon="inline-start" aria-hidden="true" />
            {t("templateForm.upload.blankWorkbook")}
          </Button>
        )}
      />
      {error ? (
        <Alert variant="destructive">
          <IconAlertTriangle aria-hidden="true" />
          <AlertTitle>{t("templateForm.workspace.fileErrorTitle")}</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}
    </div>
  );
}

export { TEMPLATE_FILE_ACCEPT };
