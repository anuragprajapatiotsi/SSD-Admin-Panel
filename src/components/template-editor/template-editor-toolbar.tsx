import { StatusBadge } from "@/components/common/status-badge";
import { normalizeStatusVariant } from "@/components/common/status-variants";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip";
import { TemplateAppHeaderToggle } from "./template-app-header-toggle";
import {
  IconArrowLeft,
  IconColumnInsertRight,
  IconDeviceFloppy,
  IconFileSpreadsheet,
  IconFileUpload,
  IconLayoutSidebarRightCollapse,
  IconLayoutSidebarRightExpand,
  IconRowInsertBottom,
  IconTrash,
} from "@tabler/icons-react";
import { useRef, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { TEMPLATE_FILE_ACCEPT } from "./template-empty-state";
import { formatTemplateFileSize } from "./template-file-utils";

type TemplateEditorToolbarProps = {
  file?: { name: string; size?: number } | null;
  sheetCount?: number;
  isDirty: boolean;
  isDisabled?: boolean;
  isDetailsOpen?: boolean;
  isAppHeaderExpanded?: boolean;
  appHeaderTogglePosition?: "start" | "end" | "after-back";
  onToggleDetails?: () => void;
  onToggleAppHeader?: () => void;
  onAddRow?: () => void;
  onAddColumn?: () => void;
  onRemoveFile?: () => void;
  onReplaceFile?: (file: File) => void;
  showStatus?: boolean;
  showDetailsToggle?: boolean;
  isSaveDisabled?: boolean;
  isSaving?: boolean;
  onSave?: () => void;
  previewBackLabel?: string;
  onPreviewBack?: () => void;
  fileMetadata?: ReactNode;
  actions?: ReactNode;
};

export function TemplateEditorToolbar({
  file,
  sheetCount,
  isDirty,
  isDisabled = false,
  isDetailsOpen,
  isAppHeaderExpanded = false,
  appHeaderTogglePosition = "end",
  onToggleDetails,
  onToggleAppHeader,
  onAddRow,
  onAddColumn,
  onRemoveFile,
  onReplaceFile,
  showStatus = true,
  showDetailsToggle = true,
  isSaveDisabled = false,
  isSaving = false,
  onSave,
  previewBackLabel,
  onPreviewBack,
  fileMetadata,
  actions,
}: TemplateEditorToolbarProps) {
  const { t, i18n } = useTranslation("ingestion");
  const inputRef = useRef<HTMLInputElement>(null);
  const locale = i18n.resolvedLanguage ?? "en-IN";
  const headerToggle = onToggleAppHeader ? <TemplateAppHeaderToggle
    isExpanded={isAppHeaderExpanded}
    onToggle={onToggleAppHeader}
  /> : null;

  return (
    <div className="flex min-h-10 flex-wrap items-center justify-between gap-2 border-b bg-background px-3 py-1.5">
      <div className="flex min-w-0 flex-wrap items-center gap-1">
        {appHeaderTogglePosition === "start" ? headerToggle : null}
        {file ? (
          <>
            <IconFileSpreadsheet className="shrink-0 text-muted-foreground" aria-hidden="true" />
            <div className="min-w-0">
              <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                <span className="max-w-96 truncate text-sm font-medium">{file.name}</span>
                {file.size !== undefined ? <>
                <span className="text-muted-foreground" aria-hidden="true">|</span>
                <small className="leading-none text-muted-foreground">
                  {formatTemplateFileSize(file.size, locale)}
                </small>
                </> : null}
                {sheetCount !== undefined ? <>
                <span className="text-muted-foreground" aria-hidden="true">|</span>
                <small className="leading-none text-muted-foreground">
                  {t("templateForm.upload.sheetCount", { count: sheetCount ?? 0 })}
                </small>
                </> : null}
              </div>
            </div>
            {showStatus ? <StatusBadge variant={normalizeStatusVariant(isDirty ? "UNSAVED" : "READY")}>
              {isDirty ? t("templateForm.workspace.unsaved") : t("templateForm.workspace.ready")}
            </StatusBadge> : null}
          </>
        ) : null}
        {fileMetadata}
      </div>

      <div className="flex flex-wrap items-center gap-1">
        {file && (onAddRow || onAddColumn || onReplaceFile || onRemoveFile) ? (
          <div className="flex items-center gap-1" aria-label={t("templateForm.preview.actionsLabel")}>
            {onAddRow ? <TooltipTrigger>
              <Button type="button" variant="ghost" size="icon" isDisabled={isDisabled} aria-label={t("templateForm.preview.addRow")} onPress={onAddRow}>
                <IconRowInsertBottom data-icon="inline-start" aria-hidden="true" />
              </Button>
              <Tooltip>{t("templateForm.preview.addRow")}</Tooltip>
            </TooltipTrigger> : null}
            {onAddColumn ? <TooltipTrigger>
              <Button type="button" variant="ghost" size="icon" isDisabled={isDisabled} aria-label={t("templateForm.preview.addColumn")} onPress={onAddColumn}>
                <IconColumnInsertRight data-icon="inline-start" aria-hidden="true" />
              </Button>
              <Tooltip>{t("templateForm.preview.addColumn")}</Tooltip>
            </TooltipTrigger> : null}
            {onReplaceFile ? <TooltipTrigger>
              <Button type="button" variant="ghost" size="icon" isDisabled={isDisabled} aria-label={t("templateForm.workspace.replaceFile")} onPress={() => inputRef.current?.click()}>
                <IconFileUpload data-icon="inline-start" aria-hidden="true" />
              </Button>
              <Tooltip>{t("templateForm.workspace.replaceFile")}</Tooltip>
            </TooltipTrigger> : null}
            {onRemoveFile ? <TooltipTrigger>
              <Button type="button" variant="ghost" size="icon" isDisabled={isDisabled} aria-label={t("templateForm.upload.removeFile")} onPress={onRemoveFile}>
                <IconTrash data-icon="inline-start" aria-hidden="true" />
              </Button>
              <Tooltip>{t("templateForm.upload.removeFile")}</Tooltip>
            </TooltipTrigger> : null}
          </div>
        ) : null}
        {appHeaderTogglePosition === "end" ? headerToggle : null}
        {showDetailsToggle ? (
          <TooltipTrigger>
            <Button
              type="button"
              variant={isDetailsOpen ? "secondary" : "outline"}
              size="icon"
              aria-controls="template-details-panel"
              aria-expanded={isDetailsOpen}
              aria-label={t(isDetailsOpen
                ? "templateForm.workspace.closeDetails"
                : "templateForm.workspace.openDetails")}
              isDisabled={isDisabled}
              onPress={onToggleDetails}
            >
              {isDetailsOpen
                ? <IconLayoutSidebarRightCollapse data-icon="inline-start" aria-hidden="true" />
                : <IconLayoutSidebarRightExpand data-icon="inline-start" aria-hidden="true" />}
            </Button>
            <Tooltip>{t(isDetailsOpen
              ? "templateForm.workspace.closeDetails"
              : "templateForm.workspace.openDetails")}</Tooltip>
          </TooltipTrigger>
        ) : null}
        {onSave ? (
          <Button type="button" size="sm" isDisabled={isSaveDisabled || isSaving} onPress={onSave}>
            {isSaving
              ? <Spinner data-icon="inline-start" aria-label={t("templateForm.submit.saving")} />
              : <IconDeviceFloppy data-icon="inline-start" aria-hidden="true" />}
            {isSaving ? t("templateForm.submit.saving") : t("templateForm.submit.saveChanges")}
          </Button>
        ) : null}
        {actions}
        {onPreviewBack && previewBackLabel ? (
          <Button type="button" variant="outline" size="sm" isDisabled={isDisabled} onPress={onPreviewBack}>
            <IconArrowLeft data-icon="inline-start" aria-hidden="true" />
            {previewBackLabel}
          </Button>
        ) : null}
        {appHeaderTogglePosition === "after-back" ? headerToggle : null}
        <Input
          ref={inputRef}
          className="sr-only"
          type="file"
          tabIndex={-1}
          accept={TEMPLATE_FILE_ACCEPT}
          disabled={isDisabled}
          aria-label={t("templateForm.workspace.replaceFile")}
          onChange={(event) => {
            const replacement = event.target.files?.[0];
            if (replacement) onReplaceFile?.(replacement);
            event.currentTarget.value = "";
          }}
        />
      </div>
    </div>
  );
}
