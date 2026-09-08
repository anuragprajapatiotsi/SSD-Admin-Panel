import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import type { providerSubmissionReview } from "@/utils/provider-assignment";
import { useTranslation } from "react-i18next";

export function ProviderReviewNotice({ review }: { review: ReturnType<typeof providerSubmissionReview> }) {
  const { t } = useTranslation("ingestion");
  if (!review.returned) return null;
  return <Alert data-tour="provider-returned">
    <AlertTitle>{t("providerAccess.returnedTitle")}</AlertTitle>
    <AlertDescription>
      <p>{t("providerAccess.returnedHelp")}</p>
      {review.comments ? <div className="flex flex-col gap-1"><span>{t("providerAccess.reviewerComments")}</span><p className="whitespace-pre-wrap break-words">{review.comments}</p></div> : null}
    </AlertDescription>
  </Alert>;
}
