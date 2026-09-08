import { PageHeader } from "@/components/common/page-layout";
import { getSelectedLocale, getSelectedUnitCode } from "@/api/session.api";
import { Loader } from "@/components/common/loader";
import { StatusBadge } from "@/components/common/status-badge";
import { normalizeStatusVariant } from "@/components/common/status-variants";
import { CollectionActivitiesTable } from "@/components/data-collection/collection-activities-table";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { useRequestPeriodCollection } from "@/hooks/use-template-workflow";
import { IconAlertTriangle, IconArrowLeft, IconPlus } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { useNavigate, useParams } from "react-router-dom";

const STATUS_KEYS = {
  PUBLISHED: "published",
  PARTIALLY_PUBLISHED: "partiallyPublished",
  COMPLETED_WITH_ERRORS: "completedWithErrors",
  READY_TO_PUBLISH: "readyToPublish",
  UNDER_REVIEW: "underReview",
  IN_PROGRESS: "inProgress",
  NOT_STARTED: "notStarted",
} as const;

export function DataCollectionDetailPage() {
  const { collectionCode = "" } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation("ingestion");
  const locale = getSelectedLocale();
  const collectionQuery = useRequestPeriodCollection(collectionCode, getSelectedUnitCode(), locale);
  const collection = collectionQuery.data;
  useDocumentTitle(collection?.collectionLabel ?? t("dataCollection.detail.fallbackTitle"));

  if (collectionQuery.isPending) {
    return <Loader className="h-full min-h-0 w-full" text={t("dataCollection.detail.loading")} />;
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

  const uploadPath = `/ingestion/data-collection/${encodeURIComponent(collection.collectionCode)}/upload`;
  const submissionPath = `/ingestion/data-collection/${encodeURIComponent(collection.collectionCode)}/new-submission`;

  return (
    <section className="flex flex-col gap-4" aria-labelledby="collection-detail-title">
      <Button className="w-fit" type="button" variant="outline" onPress={() => navigate("/ingestion/data-collection")}>
        <IconArrowLeft data-icon="inline-start" aria-hidden="true" />
        {t("dataCollection.detail.back")}
      </Button>
      <PageHeader>
        <div>
          <div className="flex items-center gap-3">
            <h2 id="collection-detail-title" className="capitalize">{collection.collectionLabel}</h2>
            <StatusBadge variant={normalizeStatusVariant(collection.status)}>
              {t(`dataCollection.status.${STATUS_KEYS[collection.status]}`)}
            </StatusBadge>
          </div>
          <dl className="mt-1 flex flex-wrap items-center divide-x divide-border text-xs/relaxed">
            <div className="flex items-baseline gap-2 pr-3">
              <dt className="font-medium">{t("dataCollection.columns.yearPeriod")}</dt>
              <dd><Badge variant="secondary">{collection.yearPeriod}</Badge></dd>
            </div>
          </dl>
        </div>
        <Button type="button" onPress={() => navigate(submissionPath)}>
          <IconPlus data-icon="inline-start" aria-hidden="true" />
          {t("newSubmission.title")}
        </Button>
      </PageHeader>
      <CollectionActivitiesTable
        collectionCode={collection.collectionCode}
        unitCode={collection.unitCode}
        locale={locale}
        onAddSubmission={(activity) => navigate(`${uploadPath}?direct_ingestion_code=${encodeURIComponent(activity.directIngestionCode || activity.activityCode)}`)}
        onActivityClick={(activity) => {
          const code = activity.originType === "DIRECT" ? activity.directIngestionCode || activity.activityCode : activity.runItemCode || activity.activityCode;
          const previewPath = `/ingestion/data-collection/${encodeURIComponent(collection.collectionCode)}/activities/${encodeURIComponent(activity.originType)}/${encodeURIComponent(code)}/preview`;
          const params = new URLSearchParams();
          if (activity.submissionVersion) params.set("submission_version", String(activity.submissionVersion));
          if (activity.dispatchRunCode) params.set("dispatch_run_code", activity.dispatchRunCode);
          navigate(`${previewPath}${params.size ? `?${params}` : ""}`);
        }}
      />
    </section>
  );
}
