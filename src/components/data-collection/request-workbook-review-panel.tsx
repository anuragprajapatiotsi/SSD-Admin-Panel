import { useEffect, useId } from "react";
import { useTranslation } from "react-i18next";
import { IconArrowBackUp, IconCheck, IconClipboardCheck, IconLock, IconRefresh } from "@tabler/icons-react";
import { useRequestWorkbookReview, type RequestWorkbookReviewProps } from "@/hooks/use-request-workbook-review";
import { requestText } from "@/utils/request-workbook-preview";
import { CompletionState } from "@/components/common/completion-state";
import { Loader } from "@/components/common/loader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";

export function RequestWorkbookReviewPanel(props: RequestWorkbookReviewProps) {
  const { t } = useTranslation("ingestion");
  const id = useId();
  const review = useRequestWorkbookReview(props);
  const { onBusyChange } = props;
  useEffect(() => {
    onBusyChange(Boolean(review.pending));
    return () => onBusyChange(false);
  }, [review.pending, onBusyChange]);
  return <aside aria-labelledby={`${id}-title`} aria-busy={Boolean(review.pending)} className="flex min-h-0 min-w-0 flex-col overflow-hidden border-t bg-card md:border-t-0 md:border-l">
    <header className="flex shrink-0 items-center justify-between gap-2 p-4">
      <h2 id={`${id}-title`} className="flex items-center gap-2 text-sm font-medium"><IconClipboardCheck className="size-5" aria-hidden="true" />{t("requestWorkbook.reviewTitle")}</h2>
      <Badge variant="secondary">{t("directIngestion.versionNumber", { version: props.version })}</Badge>
    </header>
    <Separator />
    <ScrollArea className="min-h-0 flex-1" key={review.saved || "review"} aria-label={t("requestWorkbook.reviewTitle")}>
      <div className="flex flex-col gap-4 p-4">
        {review.saved ? <CompletionState title={t(`requestWorkbook.saved.${review.saved}`)} description={t("requestWorkbook.decisionSaved")} />
          : review.query.isPending ? <Loader text={t("directPublicationReview.loading")} /> : <>
            {review.level ? <p className="text-sm font-medium">{t("requestWorkbook.level", { level: review.level })}</p> : null}
            <p className="text-sm text-muted-foreground">{t("requestWorkbook.reviewHelp")}</p>
            {review.ownSubmission ? <Alert><AlertDescription>{t("requestWorkbook.ownSubmission")}</AlertDescription></Alert>
              : !review.matches ? <Alert><AlertDescription>{t("requestWorkbook.latestOnly")}</AlertDescription></Alert> : null}
            {review.canApprove || review.canReturn ? <FieldGroup><Field data-invalid={Boolean(review.fieldError)} data-disabled={review.disabled}>
              <FieldLabel htmlFor={`${id}-comments`}>{t("directPublicationReview.comments")}</FieldLabel>
              <Textarea id={`${id}-comments`} maxLength={2000} value={review.comments} onChange={(event) => review.setComments(event.target.value)} disabled={review.disabled} aria-invalid={Boolean(review.fieldError)} aria-describedby={`${id}-help${review.fieldError ? ` ${id}-error` : ""}`} />
              <FieldDescription id={`${id}-help`}>{t("directPublicationReview.commentsHelp")}</FieldDescription>
              {review.fieldError ? <FieldError id={`${id}-error`}>{review.fieldError}</FieldError> : null}
            </Field></FieldGroup> : review.canFreeze ? <Alert><AlertDescription>{t("requestWorkbook.freezeHelp")}</AlertDescription></Alert>
              : review.matches && !review.ownSubmission && !review.query.isError ? <Alert><AlertDescription>{t("requestWorkbook.waiting")}</AlertDescription></Alert> : null}
            {review.history.length ? <section className="flex flex-col gap-3" aria-label={t("requestWorkbook.history")}>
              <h3 className="text-sm font-medium">{t("requestWorkbook.history")}</h3>
              {review.history.map((entry, index) => <div key={index} className="flex flex-col gap-1 text-sm">
                <p>{t(`requestWorkbook.saved.${requestText(entry.action)}`, { defaultValue: requestText(entry.action) })}</p>
                {requestText(entry.comments) ? <p className="whitespace-pre-wrap break-words text-muted-foreground">{requestText(entry.comments)}</p> : null}
                {requestText(entry.reviewedAt) ? <time className="text-xs text-muted-foreground">{new Date(requestText(entry.reviewedAt)).toLocaleString(props.locale)}</time> : null}
              </div>)}
            </section> : null}
          </>}
        {review.error || review.query.isError ? <Alert variant="destructive"><AlertDescription>{review.error || t("requestWorkbook.refreshError")}</AlertDescription></Alert> : null}
      </div>
    </ScrollArea>
    <Separator />
    <footer className="flex shrink-0 flex-wrap items-center justify-end gap-2 p-4">
      <Button variant="outline" size="icon-sm" aria-label={t("directReview.refresh")} isDisabled={Boolean(review.pending) || review.query.isFetching} onPress={() => void review.reload()}>
        {review.pending === "REFRESH" || (review.query.isFetching && review.query.data) ? <Spinner aria-hidden="true" /> : <IconRefresh aria-hidden="true" />}
      </Button>
      {review.saved ? <Button isDisabled={Boolean(review.pending)} onPress={review.acknowledge}>{t("directReview.done")}</Button> : <>
        {review.canReturn ? <Button variant="destructive" isDisabled={review.disabled} onPress={() => void review.act("RETURN")}>
          {review.pending === "RETURN" ? <Spinner data-icon="inline-start" /> : <IconArrowBackUp data-icon="inline-start" />}{t("directPublicationReview.actions.RETURN")}
        </Button> : null}
        {review.canApprove ? <Button isDisabled={review.disabled} onPress={() => void review.act("APPROVE")}>
          {review.pending === "APPROVE" ? <Spinner data-icon="inline-start" /> : <IconCheck data-icon="inline-start" />}{t("directPublicationReview.actions.APPROVE")}
        </Button> : null}
        {review.canFreeze ? <Button isDisabled={review.disabled} onPress={() => void review.act("FREEZE")}>
          {review.pending === "FREEZE" ? <Spinner data-icon="inline-start" /> : <IconLock data-icon="inline-start" />}{t("requestWorkbook.startProcessing")}
        </Button> : null}
      </>}
    </footer>
  </aside>;
}
