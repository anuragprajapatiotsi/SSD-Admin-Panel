import { useTranslation } from "react-i18next";
import { useWorkflowActionContext, useWorkflowJourney } from "@/hooks/use-template-workflow";
import { requestRecord, requestText } from "@/utils/request-workbook-preview";
import { Loader } from "@/components/common/loader";
import { CompletionState } from "@/components/common/completion-state";
import { StatusBadge } from "@/components/common/status-badge";
import { normalizeStatusVariant } from "@/components/common/status-variants";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";

/** Journey monitoring is a separate responsibility from immutable workbook approval. */
export function RequestJourneyPanel({ jobCode, unitCode, sheetIdentity }: { jobCode: string; unitCode: string; sheetIdentity: string }) {
  const { t } = useTranslation("ingestion");
  const query = useWorkflowJourney(jobCode, unitCode, { poll: true });
  const selected = query.data?.sheets?.find((sheet) => sheet.sheetIdentity === sheetIdentity);
  const context = useWorkflowActionContext(jobCode, unitCode, sheetIdentity, Boolean(selected?.nextActions?.length));
  const complete = query.data?.currentStage === "COMPLETE" && query.data.terminal === true
    && Boolean(query.data.sheets?.length) && query.data.sheets!.every((sheet) =>
      sheet.currentStage === "COMPLETE" && Boolean(sheet.publication?.publicationId) && sheet.lineage?.status === "SUCCEEDED");
  const status = complete ? "COMPLETED" : requestText(requestRecord(selected).status) || selected?.currentStage || query.data?.currentStage;
  const failed = Boolean(status?.includes("FAILED") || status === "BLOCKED");
  const waiting = !complete && selected?.terminal !== true && Array.isArray(context.data?.nextActions) && context.data.nextActions.length > 0;
  return <aside aria-label={t("requestWorkbook.processingTitle")} className="flex min-h-0 min-w-0 flex-col overflow-hidden border-t bg-background md:border-t-0 md:border-l">
    <header className="flex items-center justify-between gap-2 p-4"><h2 className="text-sm font-medium">{t("requestWorkbook.processingTitle")}</h2>
      {query.isFetching && query.data ? <span role="status"><Spinner /><span className="sr-only">{t("directPublicationReview.refreshing")}</span></span> : null}
    </header>
    <ScrollArea className="min-h-0 flex-1 p-4"><div className="flex flex-col gap-4">
      {complete ? <CompletionState title={t("requestWorkbook.completedTitle")} description={t("requestWorkbook.completedDescription")} /> : query.isPending ? <Loader text={t("requestWorkbook.queued")} /> : <>
        {status ? <StatusBadge variant={normalizeStatusVariant(status)}>{t(`dataCollection.detail.activityStatuses.${status}`, { defaultValue: status.replaceAll("_", " ") })}</StatusBadge> : null}
        <p className="text-sm text-muted-foreground">{t(failed ? "requestWorkbook.processingFailed" : "requestWorkbook.queued")}</p>
        {waiting ? <Alert><AlertDescription>{t("requestWorkbook.nextStageRequired")}</AlertDescription></Alert> : null}
      </>}
      {query.isError || context.isError ? <Alert variant="destructive"><AlertDescription>{t("requestWorkbook.refreshError")}</AlertDescription></Alert> : null}
      <Button variant="outline" isDisabled={query.isFetching || context.isFetching} onPress={() => { void query.refetch(); if (selected?.nextActions?.length) void context.refetch(); }}>{t("directReview.refresh")}</Button>
    </div></ScrollArea>
  </aside>;
}
