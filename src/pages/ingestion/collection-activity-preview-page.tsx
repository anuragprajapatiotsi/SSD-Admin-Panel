import { lazy, Suspense, type ComponentType } from "react";
import { useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { Loader } from "@/components/common/loader";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";

const ExtractedPreview = lazy(() => import("./extracted-activity-preview-page").then((module) => ({ default: module.ExtractedActivityPreviewPage })));
const RequestPreview = lazy(() => import("./request-activity-preview-page").then((module) => ({ default: module.RequestActivityPreviewPage })));

// Integration boundary: register a flow here; its hooks and adapters own its API contract.
// Shared toolbar/canvas primitives remain independent of backend origin and review stages.
const activityPreviewFlows: Record<string, ComponentType> = {
  DIRECT: ExtractedPreview,
  REQUEST: RequestPreview,
  HISTORICAL: ExtractedPreview,
};

export function CollectionActivityPreviewPage() {
  const { originType = "", activityCode = "", collectionCode = "" } = useParams();
  const { t } = useTranslation("ingestion");
  const origin = originType.toUpperCase();
  const Preview = Object.hasOwn(activityPreviewFlows, origin) ? activityPreviewFlows[origin] : undefined;
  if (!Preview) return <Empty><EmptyHeader><EmptyTitle>{t("requestWorkbook.unsupportedTitle")}</EmptyTitle><EmptyDescription>{t("requestWorkbook.unsupportedDescription")}</EmptyDescription></EmptyHeader></Empty>;
  return <Suspense fallback={<Loader className="h-full" text={t("dataCollection.detail.preview.loading")} />}>
    <Preview key={`${collectionCode}:${originType}:${activityCode}`} />
  </Suspense>;
}
