import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { IconAlertTriangle, IconCheck, IconFile, IconFileSpreadsheet, IconFileTypePdf, IconFolderOpen, IconRefresh, IconTrash, IconUpload } from "@tabler/icons-react";
import { useRef, useState, type DragEvent, type ReactNode } from "react";
import { useTranslation } from "react-i18next";

export type FileUploadState = "empty" | "attached" | "uploading" | "uploaded" | "error";

type FileUploadProps = {
  title: string;
  description: string;
  browseLabel: string;
  inputLabel: string;
  activeTitle?: string;
  activeDescription?: string;
  selectedFile?: File | null;
  selectedFileLabel?: string;
  removeLabel?: string;
  accept?: string;
  disabled?: boolean;
  progress?: number;
  progressLabel?: string;
  state?: FileUploadState;
  error?: string;
  supportedFiles?: string;
  onRetry?: () => void;
  icon?: ReactNode;
  actions?: ReactNode;
  className?: string;
  onFileSelect: (file: File) => void;
  onRemove?: () => void;
};

export function FileUpload({
  title,
  description,
  browseLabel,
  inputLabel,
  activeTitle = title,
  activeDescription = description,
  selectedFile,
  selectedFileLabel,
  removeLabel,
  accept,
  disabled = false,
  progress,
  progressLabel,
  state,
  error,
  supportedFiles,
  onRetry,
  icon,
  actions,
  className,
  onFileSelect,
  onRemove,
}: FileUploadProps) {
  const { t } = useTranslation("common");
  const currentState = state ?? (progress !== undefined ? "uploading" : selectedFile ? "attached" : "empty");
  const isUploading = currentState === "uploading";
  const isDisabled = disabled || isUploading;
  const percentage = progress !== undefined && Number.isFinite(progress)
    ? Math.round(Math.min(100, Math.max(0, progress))) : undefined;
  const statusText = isUploading && percentage !== undefined
    ? percentage === 100 ? t("fileUpload.confirming") : t("fileUpload.uploadingPercent", { percentage })
    : t(`fileUpload.${currentState}`);
  const FileIcon = selectedFile?.name.toLowerCase().endsWith(".pdf")
    ? IconFileTypePdf : /\.(xlsx?|csv)$/i.test(selectedFile?.name ?? "") ? IconFileSpreadsheet : IconFile;
  const inputRef = useRef<HTMLInputElement>(null);
  const dragDepthRef = useRef(0);
  const [isDragActive, setIsDragActive] = useState(false);

  function selectOne(fileList: FileList | null | undefined) {
    const file = fileList?.[0];
    if (file) onFileSelect(file);
  }

  function handleDragEnter(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    if (isDisabled) return;
    dragDepthRef.current += 1;
    setIsDragActive(true);
  }

  function handleDragLeave(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    dragDepthRef.current = Math.max(0, dragDepthRef.current - 1);
    if (!dragDepthRef.current) setIsDragActive(false);
  }

  function handleDrop(event: DragEvent<HTMLDivElement>) {
    event.preventDefault();
    dragDepthRef.current = 0;
    setIsDragActive(false);
    if (!isDisabled) selectOne(event.dataTransfer.files);
  }

  return (
    <Card
      data-state={currentState}
      className={cn(
        "transition-colors motion-reduce:transition-none",
        currentState === "attached" && "bg-muted/50 ring-primary/40",
        isUploading && "bg-primary/5 ring-primary/40",
        currentState === "uploaded" && "bg-muted/50",
        currentState === "error" && "bg-destructive/5 ring-destructive",
        isDragActive && !isDisabled && "bg-primary/5 ring-primary",
        className,
      )}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
      onDragOver={(event) => event.preventDefault()}
      onDrop={handleDrop}
    >
      <CardHeader className="sr-only">
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <Empty className="h-88 overflow-y-auto border-0 p-4">
          <EmptyHeader className="w-full max-w-md">
            <EmptyMedia variant="default" className="size-16">
                <div
                  className="relative grid size-16 place-items-center rounded-full bg-primary/5 text-primary"
                  role={isUploading ? "progressbar" : undefined}
                  aria-label={isUploading ? progressLabel || t("fileUpload.uploading") : undefined}
                  aria-valuemin={isUploading ? 0 : undefined}
                  aria-valuemax={isUploading ? 100 : undefined}
                  aria-valuenow={isUploading ? percentage : undefined}
                  aria-valuetext={isUploading ? statusText : undefined}
                >
                  <svg className={cn("absolute inset-0 size-16 -rotate-90", isUploading && percentage === undefined && "motion-safe:animate-spin")} viewBox="0 0 64 64" aria-hidden="true">
                    <circle className="text-muted" cx="32" cy="32" r="27" fill="none" stroke="currentColor" strokeWidth="6" />
                    {isUploading ? <circle
                      className="text-primary transition-[stroke-dashoffset] motion-reduce:transition-none"
                      cx="32"
                      cy="32"
                      r="27"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="6"
                      strokeLinecap="round"
                      strokeDasharray={169.65}
                      strokeDashoffset={169.65 * (1 - (percentage ?? 25) / 100)}
                    /> : null}
                  </svg>
                  <div className="relative flex flex-col items-center justify-center gap-0.5">
                    {isUploading ? <IconUpload className="size-6" aria-hidden="true" />
                      : currentState === "uploaded" ? <IconCheck className="size-6" aria-hidden="true" />
                        : currentState === "error" ? <IconAlertTriangle className="size-6 text-destructive" aria-hidden="true" />
                          : selectedFile ? <FileIcon className="size-6" aria-hidden="true" /> : icon ?? <IconUpload className="size-6" aria-hidden="true" />}
                    {isUploading && percentage !== undefined ? <span className="text-xs font-semibold tabular-nums">{percentage}%</span> : null}
                  </div>
                </div>
            </EmptyMedia>
            <EmptyTitle className="w-full truncate" title={selectedFile?.name}>{selectedFile ? selectedFile.name : isDragActive ? activeTitle : title}</EmptyTitle>
            <EmptyDescription>
              {selectedFile
                ? selectedFileLabel
                : isDragActive
                  ? activeDescription
                  : description}
            </EmptyDescription>
            {currentState !== "empty" ? (
              <div className="sr-only" role="status" aria-live="polite" aria-atomic="true">
                {statusText}
              </div>
            ) : supportedFiles ? <EmptyDescription>{supportedFiles}</EmptyDescription> : null}
          </EmptyHeader>
          <EmptyContent>
            {currentState === "error" && error ? (
              <Alert variant="destructive" className="max-h-20 overflow-y-auto text-left">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
            <div className="flex flex-wrap justify-center gap-2">
              {currentState === "error" && onRetry ? (
                <Button type="button" isDisabled={isDisabled} onPress={onRetry}>
                  <IconRefresh data-icon="inline-start" aria-hidden="true" />
                  {t("fileUpload.retry")}
                </Button>
              ) : null}
              <Button type="button" variant={selectedFile ? "outline" : "default"} isDisabled={isDisabled} onPress={() => inputRef.current?.click()}>
                <IconFolderOpen data-icon="inline-start" aria-hidden="true" />
                {browseLabel}
              </Button>
              {selectedFile && onRemove && removeLabel ? (
                <Button type="button" variant="ghost" isDisabled={isDisabled} onPress={onRemove}>
                  <IconTrash data-icon="inline-start" aria-hidden="true" />
                  {removeLabel}
                </Button>
              ) : null}
              {actions}
            </div>
            <Input
              ref={inputRef}
              className="sr-only"
              type="file"
              tabIndex={-1}
              accept={accept}
              disabled={isDisabled}
              aria-label={inputLabel}
              onChange={(event) => {
                selectOne(event.target.files);
                event.currentTarget.value = "";
              }}
            />
          </EmptyContent>
        </Empty>
      </CardContent>
    </Card>
  );
}
