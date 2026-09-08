import { getSelectedLocale, getSelectedUnitCode } from "@/api/session.api";
import type { DirectPreview } from "@/api/direct-ingestion.api";
import { Loader } from "@/components/common/loader";
import { CollectionExtractedDataPreview } from "@/components/data-collection/collection-extracted-data-preview";
import { DirectReviewPanel } from "@/components/data-collection/direct-review-panel";
import { DirectPublicationReviewPanel } from "@/components/data-collection/direct-publication-review-panel";
import { TemplateEditorToolbar } from "@/components/template-editor/template-editor-toolbar";
import { TemplateEditorCanvas, TemplateEditorWorkspace } from "@/components/template-editor/template-editor-workspace";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { HoverCard, HoverCardTrigger } from "@/components/ui/hover-card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { StatusBadge } from "@/components/common/status-badge";
import { normalizeStatusVariant } from "@/components/common/status-variants";
import { cn } from "@/lib/utils";
import { latestDirectSubmission, useDirectIngestion, useDirectReview, isDirectProcessing } from "@/hooks/use-direct-ingestion";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { useCollectionActivityPreview } from "@/hooks/use-template-workflow";
import { useAppShellLayout } from "@/layouts/app-shell-context";
import { normalizeCollectionPreview } from "@/utils/collection-preview-canonical";
import { IconAlertTriangle, IconInfoCircle, IconPlus } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";

function optionalPositiveInteger(value: string | null) {
  if (!value) return undefined;
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 1 ? parsed : undefined;
}

export function ExtractedActivityPreviewPage() {
  const { collectionCode = "", originType = "", activityCode = "" } = useParams();
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation("ingestion");
  const { setImmersiveContent, isHeaderExpanded, toggleHeader } = useAppShellLayout();
  const title = t("dataCollection.detail.preview.title");
  const unitCode = getSelectedUnitCode();
  const locale = getSelectedLocale();
  const isDirect = originType === "DIRECT";
  const parentQuery = useDirectIngestion(activityCode, unitCode, locale, isDirect);
  const parent = parentQuery.data;
  const latest = latestDirectSubmission(parent?.submissionHistory, parent?.latestSubmission);
  const version = optionalPositiveInteger(searchParams.get("submission_version")) ?? latest?.submissionVersion;
  const reviewIdentity = `${activityCode}:${version}:${unitCode}`;
  const [queuedPublication, setQueuedPublication] = useState<string | null>(null);
  const versions = useMemo(() => [...new Map([
    ...(parent?.submissionHistory ?? []), ...(latest ? [latest] : []),
  ].map((submission) => [submission.submissionVersion, submission])).values()]
    .sort((a, b) => b.submissionVersion - a.submissionVersion), [parent?.submissionHistory, latest]);
  const previewQuery = useCollectionActivityPreview({
    collectionCode,
    originType,
    activityCode,
    unitCode,
    locale,
    submissionVersion: version,
    sheetIdentity: searchParams.get("sheet_identity")?.trim() || undefined,
  }, !isDirect || Boolean(parent && version), queuedPublication === reviewIdentity);
  useDocumentTitle(title);
  const canonical = useMemo(
    () => normalizeCollectionPreview(previewQuery.data ? { data: {
      ...previewQuery.data.data,
      displayName: previewQuery.data.data.displayName || parent?.displayName,
    } } : undefined, i18n.resolvedLanguage ?? i18n.language),
    [previewQuery.data, parent?.displayName, i18n.resolvedLanguage, i18n.language],
  );
  const detail = isDirect ? previewQuery.data?.data as DirectPreview | undefined : undefined;
  const isLatestVersion = Boolean(version && latest?.submissionVersion === version
    && detail?.submission?.isLatest !== false
    && (!detail?.submission || detail.submission.submissionVersion === version));
  const status = detail?.statusDetail;
  const selectedSubmission = versions.find((submission) => submission.submissionVersion === version);
  const submissionStatus = status?.status ?? selectedSubmission?.processingStatus ?? selectedSubmission?.status;
  const isCompleted = submissionStatus?.toUpperCase() === "COMPLETED" && detail?.publication?.lineageComplete === true;
  const publicationProcessing = queuedPublication === reviewIdentity && !isCompleted && submissionStatus !== "FAILED";
  const currentPhase = status?.currentPhase ?? selectedSubmission?.processingPhase;
  const masterReviewPhase = currentPhase === "WAITING_FOR_REVIEW" && submissionStatus === "IN_REVIEW";
  const [reviewPanel, setReviewPanel] = useState<{ identity: string; phase: "reviewing" | "dismissed" } | null>(null);
  useEffect(() => { setReviewPanel(null); }, [reviewIdentity]);
  const reviewQuery = useDirectReview(activityCode, version, unitCode, locale, isDirect && isLatestVersion && masterReviewPhase);
  const review = reviewQuery.data ? {
    ...reviewQuery.data,
    canSubmitDecision: masterReviewPhase && (!reviewQuery.data.status || reviewQuery.data.status === "IN_REVIEW")
      && reviewQuery.data.canSubmitDecision !== false && detail?.review?.canSubmitDecision !== false && !reviewQuery.isError,
  } : undefined;
  const pendingReviews = review?.summary?.pendingIssueCount ?? review?.issues?.filter((issue) => issue.decision == null).length ?? 0;
  const hasReviewQuestions = review?.issues?.some((issue) => issue.decision == null) === true;
  const reviewInSession = reviewPanel?.identity === reviewIdentity && reviewPanel.phase === "reviewing";
  const reviewDismissed = reviewPanel?.identity === reviewIdentity && reviewPanel.phase === "dismissed" && (!masterReviewPhase || pendingReviews === 0);
  const showReviewPanel = isDirect && Boolean(parent && version) && isLatestVersion && !reviewDismissed
    && submissionStatus !== "FAILED"
    && ((reviewInSession && Boolean(review)) || (masterReviewPhase && hasReviewQuestions));
  const showPublicationPanel = isDirect && Boolean(parent && version) && isLatestVersion && !publicationProcessing
    && !showReviewPanel
    && submissionStatus === "IN_REVIEW"
    && ["WAITING_FOR_FACT_REVIEW", "READY_TO_FREEZE", "RETURNED_FOR_CORRECTION"].includes(currentPhase ?? "");
  const failureMessage = status?.message || status?.errorMessages?.[locale] || status?.errorMessages?.["en-IN"] || t("directIngestion.extractionFailed");
  const readOnly = isDirect && (!isLatestVersion || !masterReviewPhase);
  const entityNames = useMemo(() => {
    const names = new Map<string, string>();
    canonical.observations.forEach((observation) => observation.dimensions.forEach((dimension) => {
      if (dimension.identity && dimension.value) names.set(dimension.identity, dimension.value);
    }));
    return names;
  }, [canonical]);
  const processing = publicationProcessing || (submissionStatus === "COMPLETED" && !isCompleted) || isDirectProcessing(status?.status, status?.terminal);
  const displayedStatus = publicationProcessing || (submissionStatus === "COMPLETED" && !isCompleted)
    ? "PROCESSING" : status?.status === "EXTRACTION_QUEUED" ? "IN_QUEUE" : status?.status;
  const loading = (isDirect && parentQuery.isPending) || (previewQuery.isPending && (!isDirect || Boolean(version)));
  const error = (isDirect ? parentQuery.error : null) || previewQuery.error;
  useEffect(() => {
    setImmersiveContent(true);
    return () => setImmersiveContent(false);
  }, [setImmersiveContent]);

  return (
    <TemplateEditorWorkspace aria-label={canonical.title || title}>
      <TemplateEditorToolbar
        file={{ name: canonical.title || title, size: canonical.sourceByteSize }}
        sheetCount={canonical.observations.length ? 1 : undefined}
        isDirty={false}
        showStatus={false}
        showDetailsToggle={false}
        isAppHeaderExpanded={isHeaderExpanded}
        appHeaderTogglePosition="after-back"
        onToggleAppHeader={toggleHeader}
        previewBackLabel={t("dataCollection.detail.preview.back")}
        onPreviewBack={() => navigate(`/ingestion/data-collection/${encodeURIComponent(collectionCode)}`)}
        fileMetadata={<>
          {displayedStatus ? <StatusBadge variant={normalizeStatusVariant(displayedStatus)}>
            {t(`dataCollection.detail.activityStatuses.${displayedStatus}`, { defaultValue: displayedStatus })}
          </StatusBadge> : null}
          {readOnly ? <Badge variant="secondary">{t("directIngestion.readOnly")}</Badge> : null}
          {detail?.preview?.available || (isDirect && !isLatestVersion) ? <HoverCardTrigger>
            <Button type="button" variant="ghost" size="icon-sm" aria-label={t("directIngestion.previewInformation")}>
              <IconInfoCircle aria-hidden="true" />
            </Button>
            <HoverCard placement="bottom start" className="max-w-[calc(100vw-2rem)]">
              <div className="flex flex-col gap-2">
                {status?.currentPhase ? <p>{t("directReview.phase", { value: status.currentPhase.replaceAll("_", " ") })}</p> : null}
                {isCompleted && detail?.publication?.lineageComplete === true ? <p>{t("directReview.lineageComplete")}</p> : null}
                {detail?.preview?.available ? <p>{t("directReview.observationCount", { count: canonical.observations.length })}</p> : null}
                {isDirect && !isLatestVersion ? <p>{t("directIngestion.latestOnly")}</p> : null}
              </div>
            </HoverCard>
          </HoverCardTrigger> : null}
        </>}
        actions={isDirect && parent ? <>
        <Select aria-label={t("directIngestion.version")} selectedKey={version ? String(version) : null} onSelectionChange={(key) => {
          setSearchParams((current) => { const next = new URLSearchParams(current); next.set("submission_version", String(key)); return next; });
        }}>
          <SelectTrigger><SelectValue /></SelectTrigger>
          <SelectContent><SelectGroup>{versions.map((submission) => <SelectItem key={submission.submissionVersion} id={String(submission.submissionVersion)}>
            {t("directIngestion.versionNumber", { version: submission.submissionVersion })}{submission.submissionVersion === latest?.submissionVersion ? ` · ${t("directIngestion.latest")}` : ""}
          </SelectItem>)}</SelectGroup></SelectContent>
        </Select>
        {isLatestVersion && ["EXCEL", "CSV", "PDF", "API", "WEB_SCRAPE"].includes(parent.sourceType) ? <Button type="button" onPress={() => navigate(`/ingestion/data-collection/${encodeURIComponent(collectionCode)}/upload?direct_ingestion_code=${encodeURIComponent(activityCode)}`)}>
          <IconPlus data-icon="inline-start" aria-hidden="true" />{t("directIngestion.addSubmission")}
        </Button> : null}
        </> : null}
      />
      {status?.status === "FAILED" && canonical.observations.length > 0 ? <Alert variant="destructive" className="mx-3 mt-3 w-auto">
        <AlertTitle>{t("directIngestion.extractionFailed")}</AlertTitle><AlertDescription>{failureMessage}</AlertDescription>
      </Alert> : null}
      {reviewQuery.isError && masterReviewPhase ? <Alert variant="destructive" className="mx-3 mt-3 w-auto">
        <AlertDescription>{t("directReview.refreshError")}</AlertDescription>
        <Button type="button" variant="outline" isDisabled={reviewQuery.isFetching} onPress={() => void reviewQuery.refetch()}>{t("directReview.refresh")}</Button>
      </Alert> : null}
      <div className={cn("grid min-h-0 min-w-0 flex-1 grid-cols-1", showReviewPanel || showPublicationPanel
        ? "grid-rows-[minmax(0,1fr)_minmax(14rem,45%)] md:grid-cols-[minmax(0,1fr)_24rem] md:grid-rows-1"
        : "grid-rows-1")}>
      <TemplateEditorCanvas>
      {loading ? (
        <Loader className="h-full" text={t("dataCollection.detail.preview.loading")} />
      ) : error ? (
        <div className="flex h-full min-h-0 items-center justify-center overflow-y-auto p-4">
        <Alert variant="destructive" className="max-w-xl">
          <IconAlertTriangle aria-hidden="true" />
          <AlertTitle>{t("dataCollection.detail.preview.errorTitle")}</AlertTitle>
          <AlertDescription>
            {error instanceof Error
              ? error.message
              : t("dataCollection.detail.preview.errorDescription")}
          </AlertDescription>
          <Button className="col-start-2 mt-2 w-fit" type="button" variant="outline" isDisabled={previewQuery.isFetching || parentQuery.isFetching} onPress={() => { if (isDirect) void parentQuery.refetch(); if (!isDirect || version) void previewQuery.refetch(); }}>
            {t("dataCollection.error.retry")}
          </Button>
        </Alert>
        </div>
      ) : status?.status === "FAILED" && canonical.observations.length === 0 ? (
        <div className="flex h-full min-h-0 items-center justify-center overflow-y-auto p-4">
          <Alert variant="destructive" className="max-w-xl">
            <IconAlertTriangle aria-hidden="true" />
            <AlertTitle>{t("directIngestion.extractionFailed")}</AlertTitle>
            <AlertDescription>{failureMessage}</AlertDescription>
          </Alert>
        </div>
      ) : processing && canonical.observations.length === 0 ? (
        <Loader className="h-full" presentation="immersive" text={t("directIngestion.processing")} description={status?.currentPhase ? t("directReview.phase", { value: status.currentPhase.replaceAll("_", " ") }) : t("directIngestion.processingDescription")} />
      ) : canonical.observations.length === 0 ? (
        <Empty className="h-full">
          <EmptyHeader>
            <EmptyTitle>{t("dataCollection.detail.preview.emptyTitle")}</EmptyTitle>
            <EmptyDescription>{t("dataCollection.detail.preview.emptyDescription")}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <CollectionExtractedDataPreview key={`${activityCode}:${version}:${i18n.resolvedLanguage}:${readOnly}`} preview={canonical} response={previewQuery.data} readOnly={readOnly} />
      )}
      </TemplateEditorCanvas>
      {showReviewPanel && version ? <DirectReviewPanel key={`${activityCode}:${version}:${unitCode}`} code={activityCode} version={version} unitCode={unitCode}
        review={review} status={status} entityNames={entityNames} refresh={() => reviewQuery.refetch({ throwOnError: true })}
        onStart={() => setReviewPanel({ identity: reviewIdentity, phase: "reviewing" })}
        onDone={() => setReviewPanel({ identity: reviewIdentity, phase: "dismissed" })} /> : null}
      {showPublicationPanel && version ? <DirectPublicationReviewPanel key={reviewIdentity}
        code={activityCode} version={version} unitCode={unitCode} locale={locale} phase={currentPhase!}
        message={status?.message || detail?.factReview?.messages?.[locale] || detail?.factReview?.messages?.["en-IN"]}
        previewReady={!loading && !error && canonical.observations.length > 0}
        onFreezeQueued={() => setQueuedPublication(reviewIdentity)} /> : null}
      </div>
    </TemplateEditorWorkspace>
  );
}
