import { useTranslation } from "react-i18next";
import { CompletionState } from "@/components/common/completion-state";

export function DirectReviewComplete({ total }: { total: number }) {
  const { t } = useTranslation("ingestion");
  return <CompletionState
    title={t("directReview.completionHeadline")}
    description={t("directReview.completeDescription")}
    summary={t("directReview.savedCount", { count: total, total })}
  />;
}
