import { PageHeader } from "@/components/common/page-layout";
import { DirectRemoteSourceForm } from "@/components/data-collection/direct-remote-source-form";
import { getSelectedLocale, getSelectedUnitCode } from "@/api/session.api";
import { motion, useReducedMotion } from "motion/react";
import { cn } from "@/lib/utils";
import { FileUpload, type FileUploadState } from "@/components/common/file-upload";
import { Loader } from "@/components/common/loader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { useRequestPeriodCollection } from "@/hooks/use-template-workflow";
import { useDirectIngestion, useUploadDirectIngestion } from "@/hooks/use-direct-ingestion";
import { IconAlertTriangle, IconArrowLeft, IconUpload } from "@tabler/icons-react";
import { useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";

const DIRECT_UPLOAD_ACCEPT = ".xlsx,.xls,.csv,.pdf,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel,text/csv,application/pdf";
const ALLOWED_EXTENSIONS = [".xlsx", ".xls", ".csv", ".pdf"];

function isAllowedFile(file: File) {
  const name = file.name.toLocaleLowerCase();
  return ALLOWED_EXTENSIONS.some((extension) => name.endsWith(extension));
}

export function DataCollectionUploadPage() {
  const { collectionCode = "" } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation(["ingestion", "common"]);
  const reduceMotion = useReducedMotion();
  const unitCode = getSelectedUnitCode();
  const [searchParams] = useSearchParams();
  const parentCode = searchParams.get("direct_ingestion_code") || "";
  const parentQuery = useDirectIngestion(parentCode, unitCode, getSelectedLocale(), Boolean(parentCode));
  const collectionQuery = useRequestPeriodCollection(collectionCode, unitCode, getSelectedLocale());
  const startJourney = useUploadDirectIngestion();
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const uploadInFlight = useRef(false);
  const [uploadProgress, setUploadProgress] = useState<{
    loaded: number;
    total?: number;
    percentage?: number;
  }>({ loaded: 0 });
  const collection = collectionQuery.data;
  const source = parentQuery.data?.sourceType || searchParams.get("source_type");
  const remoteSource = source === "API" || source === "WEB_SCRAPE" ? source : undefined;
  useDocumentTitle(t(source === "API" ? "directIngestion.fetchApiTitle" : "dataCollection.upload.title"));

  function selectFile(nextFile: File) {
    if (uploadInFlight.current) return;
    setFile(nextFile);
    startJourney.reset();
    setUploadProgress({ loaded: 0 });
    if (!isAllowedFile(nextFile)) {
      setFileError(t("dataCollection.upload.invalidFile"));
      return;
    }
    setFileError("");
  }

  async function upload() {
    if (!file || !collection || fileError || uploadInFlight.current || startJourney.isSuccess) return;
    uploadInFlight.current = true;
    try {
      setUploadProgress({ loaded: 0 });
      const sourceType = file.name.toLowerCase().endsWith(".csv") ? "CSV" : file.name.toLowerCase().endsWith(".pdf") ? "PDF" : "EXCEL";
      if (parentCode && (!parentQuery.data || parentQuery.data.requestPeriodCode !== collection.collectionCode || parentQuery.data.sourceType !== sourceType)) {
        setFileError(t("directIngestion.sourceMismatch"));
        return;
      }
      await startJourney.mutateAsync({ code: parentCode || undefined, payload: {
        unit_code: unitCode,
        request_period_code: collection.collectionCode,
        source_type: sourceType,
        file,
        onUploadProgress: setUploadProgress,
      } });
      toast.success(t("dataCollection.upload.started"), {
        description: t("dataCollection.upload.startedDescription", { name: file.name }),
      });
      navigate(`/ingestion/data-collection/${encodeURIComponent(collection.collectionCode)}`, { replace: true });
    } catch {
      // Keep the selected file available for retry.
    } finally {
      uploadInFlight.current = false;
    }
  }

  if (collectionQuery.isPending || (parentCode && parentQuery.isPending)) {
    return <Loader className="h-full min-h-0 w-full" text={t("common:loading.page")} />;
  }

  if (parentCode && parentQuery.error) {
    return <Alert variant="destructive">
      <AlertTitle>{t("dataCollection.detail.errorTitle")}</AlertTitle>
      <AlertDescription>{parentQuery.error.message}</AlertDescription>
      <Button type="button" variant="outline" isDisabled={parentQuery.isFetching} onPress={() => void parentQuery.refetch()}>{t("dataCollection.error.retry")}</Button>
    </Alert>;
  }

  if (!collection) {
    return (
      <Alert variant="destructive">
        <IconAlertTriangle aria-hidden="true" />
        <AlertTitle>{t("dataCollection.detail.errorTitle")}</AlertTitle>
        <AlertDescription>{collectionQuery.error instanceof Error ? collectionQuery.error.message : t("dataCollection.detail.errorDescription")}</AlertDescription>
      </Alert>
    );
  }

  const uploadError = startJourney.error instanceof Error
    ? startJourney.error.message
    : t("dataCollection.upload.errorDescription");
  const uploadState: FileUploadState = startJourney.isPending ? "uploading"
    : fileError || startJourney.isError ? "error"
      : startJourney.isSuccess ? "uploaded" : file ? "attached" : "empty";

  return (
    <section className="mx-auto flex w-full max-w-3xl flex-col gap-4" aria-labelledby="collection-upload-title">
      <Button className="w-fit" type="button" variant="outline" isDisabled={startJourney.isPending} onPress={() => navigate(`/ingestion/data-collection/${encodeURIComponent(collection.collectionCode)}`)}>
        <IconArrowLeft data-icon="inline-start" aria-hidden="true" />
        {t("dataCollection.upload.back")}
      </Button>
      <PageHeader>
        <div>
          <h2 id="collection-upload-title">{t(source === "API" ? "directIngestion.fetchApiTitle" : remoteSource ? "directIngestion.fetchSource" : parentCode ? "directIngestion.newVersion" : "dataCollection.upload.title")}</h2>
          {parentQuery.data ? <p>{parentQuery.data.displayName}</p> : null}
          <p>{t("dataCollection.upload.collection", {
            name: collection.collectionLabel,
            year: collection.yearPeriod,
          })}</p>
        </div>
      </PageHeader>
      {remoteSource ? <DirectRemoteSourceForm key={`${parentCode}:${remoteSource}`} source={remoteSource} unitCode={unitCode} collectionCode={collection.collectionCode} parent={parentQuery.data}
        onSuccess={() => navigate(`/ingestion/data-collection/${encodeURIComponent(collection.collectionCode)}`, { replace: true })} /> : <>
      <motion.div
        key={file ? `${file.name}:${file.size}:${file.lastModified}` : "empty"}
        className="min-w-0"
        initial={reduceMotion || uploadState !== "attached" ? false : { opacity: 0, y: 8, scale: 0.99 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 320, damping: 26 }}
      >
      <FileUpload
        className={cn("[&_[data-slot=empty]]:h-64", uploadState === "attached" && "bg-primary/5 ring-primary/20")}
        title={t("dataCollection.upload.dropTitle")}
        description={t("dataCollection.upload.dropDescription")}
        supportedFiles={t("dataCollection.upload.supportedFiles")}
        activeTitle={t("dataCollection.upload.dropActiveTitle")}
        activeDescription={t("dataCollection.upload.dropActiveDescription")}
        browseLabel={file ? t("dataCollection.upload.replace") : t("dataCollection.upload.browse")}
        inputLabel={t("dataCollection.upload.inputLabel")}
        selectedFile={file}
        selectedFileLabel={file ? `${file.name.split(".").pop()?.toUpperCase()} · ${new Intl.NumberFormat(getSelectedLocale(), { maximumFractionDigits: 2 }).format(file.size / 1024)} KB` : undefined}
        removeLabel={t("dataCollection.upload.remove")}
        accept={DIRECT_UPLOAD_ACCEPT}
        disabled={startJourney.isPending}
        state={uploadState}
        error={fileError || (startJourney.isError ? uploadError : undefined)}
        onRetry={startJourney.isError && !fileError ? () => void upload() : undefined}
        progress={startJourney.isPending ? uploadProgress.percentage : undefined}
        progressLabel={t("dataCollection.upload.progressLabel")}
        onFileSelect={selectFile}
        onRemove={() => {
          setFile(null);
          setFileError("");
          startJourney.reset();
          setUploadProgress({ loaded: 0 });
        }}
      />
      </motion.div>
      {startJourney.data ? <Button className="self-end" type="button" onPress={() => navigate(`/ingestion/data-collection/${encodeURIComponent(collection.collectionCode)}/activities/DIRECT/${encodeURIComponent(startJourney.data.directIngestionCode)}/preview?submission_version=${startJourney.data.submissionVersion}`)}>
        {t("directIngestion.openSubmission")}
      </Button> : null}
      {uploadState !== "uploaded" && uploadState !== "error" && uploadState !== "uploading" ? <div className="flex justify-end">
        <Button type="button" size="lg" isDisabled={!file || startJourney.isPending || Boolean(fileError)} onPress={() => void upload()}>
          <IconUpload data-icon="inline-start" aria-hidden="true" />
          {t("dataCollection.upload.submit")}
        </Button>
      </div> : null}
      </>}
    </section>
  );
}
