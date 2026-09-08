import { useId, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { IconArrowBackUp, IconCheck, IconClipboardCheck, IconLock } from "@tabler/icons-react";
import { useDirectPublicationReview, publicationDecisionSchema, type PublicationAction } from "@/hooks/use-direct-publication-review";
import { Loader } from "@/components/common/loader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { Spinner } from "@/components/ui/spinner";
import { Textarea } from "@/components/ui/textarea";
import { CompletionState } from "@/components/common/completion-state";

type Props = {
  code: string; version: number; unitCode: string; locale: string; phase: string;
  message?: string; previewReady: boolean; onFreezeQueued: () => void;
};

export function DirectPublicationReviewPanel({ code, version, unitCode, locale, phase, message, previewReady, onFreezeQueued }: Props) {
  const { t } = useTranslation("ingestion");
  const { query, mutation, refresh } = useDirectPublicationReview(code, version, unitCode, locale, phase);
  const [comments, setComments] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [error, setError] = useState("");
  const [needsRefresh, setNeedsRefresh] = useState(false);
  const [submitted, setSubmitted] = useState<PublicationAction | "APPROVE_ACKNOWLEDGED" | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const id = useId();
  const returned = phase === "RETURNED_FOR_CORRECTION";
  const readyToFreeze = phase === "READY_TO_FREEZE";
  const permissions = query.data?.factReview;
  const sameSubmission = query.data?.directIngestionCode === code && query.data?.submissionVersion === version;
  const contextCurrent = sameSubmission && query.data?.currentPhase === phase && query.data?.status === "IN_REVIEW";
  const canDecide = contextCurrent && phase === "WAITING_FOR_FACT_REVIEW" && permissions?.canDecide === true;
  const canFreeze = contextCurrent && readyToFreeze && permissions?.status === "APPROVED" && permissions.canFreeze === true;
  const awaitingTransition = submitted !== null && submitted !== "FREEZE" && phase === "WAITING_FOR_FACT_REVIEW";
  const showApprovalSuccess = submitted === "APPROVE" && !returned;
  const busy = mutation.isPending || refreshing;
  const disabled = busy || query.isPending || query.isError || needsRefresh || awaitingTransition || !previewReady;
  const instructions = returned ? message : permissions?.messages?.[locale] || permissions?.messages?.["en-IN"];

  function requestConfirmation(action: PublicationAction) {
    if (disabled) return false;
    if (action !== "FREEZE") {
      const result = publicationDecisionSchema(t("directPublicationReview.reasonRequired"), t("directPublicationReview.commentsTooLong")).safeParse({ action, comments });
      if (!result.success) {
        setFieldError(result.error.issues[0].message);
        return false;
      }
    }
    setFieldError("");
    return true;
  }

  async function commit(action: PublicationAction) {
    setError("");
    try {
      await mutation.mutateAsync({ action, comments: comments.trim() });
      setSubmitted(action);
      if (action === "FREEZE") onFreezeQueued();
      await refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t("directPublicationReview.saveError"));
      // A lost response can still mean the decision was saved. Refresh before retrying.
      setNeedsRefresh(true);
    }
  }

  async function reload() {
    if (busy || query.isFetching) return;
    setRefreshing(true);
    try {
      await Promise.all([
        refresh(false),
        returned ? Promise.resolve() : query.refetch({ throwOnError: true }),
      ]);
      setNeedsRefresh(false);
      setError("");
    } catch {
      setError(t("directPublicationReview.loadError"));
    } finally {
      setRefreshing(false);
    }
  }

  return <aside aria-labelledby={`${id}-title`} aria-busy={busy} className="flex min-h-0 min-w-0 flex-col overflow-hidden border-t bg-background md:border-t-0 md:border-l">
    <header className="flex shrink-0 items-center justify-between gap-2 p-4">
      <h2 id={`${id}-title`} className="flex min-w-0 items-center gap-2 font-medium"><IconClipboardCheck className="size-5 shrink-0" aria-hidden="true" />{t("directPublicationReview.title")}</h2>
      {query.isFetching && query.data && !busy && !showApprovalSuccess ? <span role="status" className="ml-auto flex items-center"><Spinner aria-hidden="true" /><span className="sr-only">{t("directPublicationReview.refreshing")}</span></span> : null}
      <Badge variant="secondary" className="shrink-0">{t("directIngestion.versionNumber", { version })}</Badge>
    </header>
    <Separator />
    {showApprovalSuccess ? <>
      <ScrollArea className="min-h-0 flex-1 p-4" key="approval-success">
        <CompletionState title={t("directPublicationReview.successTitle")} description={t("directPublicationReview.successDescription")} />
      </ScrollArea>
      <Separator />
      <footer className="flex shrink-0 justify-end p-4">
        <Button type="button" onPress={() => setSubmitted("APPROVE_ACKNOWLEDGED")}>{t("directReview.done")}</Button>
      </footer>
    </> : <>
    <ScrollArea className="min-h-0 flex-1" tabIndex={0} aria-label={t("directPublicationReview.title")}>
      <div className="flex flex-col gap-4 p-4">
        {query.isPending && !returned && !refreshing ? <Loader text={t("directPublicationReview.loading")} /> : <>
          <p className="text-sm font-medium">{t(`directPublicationReview.${returned ? "returnedTitle" : readyToFreeze ? "approvedTitle" : "reviewTitle"}`)}</p>
          <p className="text-xs leading-relaxed text-muted-foreground">{(!returned && instructions) || t(`directPublicationReview.${returned ? "returnedDescription" : readyToFreeze ? "approvedDescription" : "reviewDescription"}`)}</p>
          {returned && (instructions || (submitted === "RETURN" && comments.trim())) ? <Alert><AlertDescription>{instructions || comments.trim()}</AlertDescription></Alert> : null}
          {canDecide ? <FieldGroup><Field data-invalid={Boolean(fieldError)} data-disabled={disabled}>
            <FieldLabel htmlFor={`${id}-comments`}>{t("directPublicationReview.comments")}</FieldLabel>
            <Textarea id={`${id}-comments`} maxLength={2000} value={comments} onChange={(event) => { setComments(event.target.value); setFieldError(""); }} disabled={disabled} aria-invalid={Boolean(fieldError)} aria-describedby={`${id}-help${fieldError ? ` ${id}-error` : ""}`} />
            <FieldDescription id={`${id}-help`}>{t("directPublicationReview.commentsHelp")}</FieldDescription>
            {fieldError ? <FieldError id={`${id}-error`}>{fieldError}</FieldError> : null}
          </Field></FieldGroup> : null}
          {!returned && !query.isError && !canDecide && !canFreeze ? <Alert><AlertDescription>{t("directPublicationReview.waiting")}</AlertDescription></Alert> : null}
          {awaitingTransition ? <p role="status" className="text-xs text-muted-foreground">{t("directPublicationReview.decisionSaved")}</p> : null}
        </>}
        {error || query.isError ? <Alert variant="destructive"><AlertDescription>{error || t("directPublicationReview.loadError")}</AlertDescription></Alert> : null}
        {refreshing || needsRefresh || query.isError || awaitingTransition ? <Button type="button" variant="outline" isDisabled={busy || query.isFetching} onPress={() => void reload()}>
          {refreshing ? <Spinner data-icon="inline-start" aria-hidden="true" /> : null}{t("directReview.refresh")}
        </Button> : null}
      </div>
    </ScrollArea>
    {!returned && (canDecide || canFreeze) ? <>
      <Separator />
      <footer className="flex shrink-0 flex-wrap items-center justify-end gap-2 p-4">
        {canDecide && permissions?.allowedActions?.includes("RETURN") ? <PublicationConfirmation action="RETURN" version={version} disabled={disabled} busy={mutation.isPending && mutation.variables?.action === "RETURN"} request={() => requestConfirmation("RETURN")} confirm={() => commit("RETURN")} /> : null}
        {canDecide && permissions?.allowedActions?.includes("APPROVE") ? <PublicationConfirmation action="APPROVE" version={version} disabled={disabled} busy={mutation.isPending && mutation.variables?.action === "APPROVE"} request={() => requestConfirmation("APPROVE")} confirm={() => commit("APPROVE")} /> : null}
        {canFreeze ? <PublicationConfirmation action="FREEZE" version={version} disabled={disabled} busy={mutation.isPending && mutation.variables?.action === "FREEZE"} request={() => requestConfirmation("FREEZE")} confirm={() => commit("FREEZE")} /> : null}
      </footer>
    </> : null}
    </>}
  </aside>;
}

function PublicationConfirmation({ action, version, disabled, busy, request, confirm }: {
  action: PublicationAction; version: number; disabled: boolean; busy: boolean;
  request: () => boolean; confirm: () => Promise<void>;
}) {
  const { t } = useTranslation("ingestion");
  const [open, setOpen] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const submitting = useRef(false);
  const pending = busy || confirming;
  const Icon = action === "RETURN" ? IconArrowBackUp : action === "FREEZE" ? IconLock : IconCheck;
  const label = t(`directPublicationReview.actions.${action}`);
  return <AlertDialogTrigger isOpen={open} onOpenChange={(next) => { if (!pending && (!next || request())) setOpen(next); }}>
    <Button type="button" variant={action === "RETURN" ? "destructive" : "default"} isDisabled={disabled}>
      {busy ? <Spinner data-icon="inline-start" /> : <Icon data-icon="inline-start" aria-hidden="true" />}{label}
    </Button>
    <AlertDialog isDismissable={false} isKeyboardDismissDisabled={pending}>
      <AlertDialogHeader>
        <AlertDialogTitle>{t(`directPublicationReview.confirmTitle.${action}`, { version })}</AlertDialogTitle>
        <AlertDialogDescription>{t(`directPublicationReview.confirmDescription.${action}`)}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <Button type="button" variant="outline" isDisabled={pending} onPress={() => setOpen(false)}>{t("directPublicationReview.cancel")}</Button>
        <Button type="button" variant={action === "RETURN" ? "destructive" : "default"} isDisabled={pending || disabled} onPress={() => {
          if (submitting.current) return;
          submitting.current = true;
          setConfirming(true);
          void confirm().finally(() => { submitting.current = false; setConfirming(false); setOpen(false); });
        }}>
          {pending ? <Spinner data-icon="inline-start" /> : null}{label}
        </Button>
      </AlertDialogFooter>
    </AlertDialog>
  </AlertDialogTrigger>;
}
