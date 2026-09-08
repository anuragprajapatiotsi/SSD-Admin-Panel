import { useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { getLocalCurrentUser } from "@/api/session.api";
import { useConfirmation } from "@/hooks/use-confirmation";
import { templateWorkflowKeys, useStartWorkflowJourney, useWorkflowReviewContext, useWorkflowReviewDecision } from "@/hooks/use-template-workflow";
import { requestText, requestVersion } from "@/utils/request-workbook-preview";
import { normalizeRequestWorkbookReview } from "@/utils/request-workbook-review";

export type RequestWorkbookReviewProps = {
  runCode: string; itemCode: string; version: number; unitCode: string; locale: string;
  submission: Record<string, unknown>; previewReady: boolean; onJourney: (jobCode: string) => void;
  onBusyChange: (busy: boolean) => void;
};
type Action = "APPROVE" | "RETURN" | "FREEZE";

export function useRequestWorkbookReview(props: RequestWorkbookReviewProps) {
  const { runCode, itemCode, version, unitCode, locale, submission, previewReady, onJourney } = props;
  const { t } = useTranslation("ingestion");
  const confirm = useConfirmation();
  const client = useQueryClient();
  const query = useWorkflowReviewContext(runCode, itemCode, locale);
  const decision = useWorkflowReviewDecision();
  const freeze = useStartWorkflowJourney();
  const guard = useRef(false);
  const [pending, setPending] = useState<Action | "REFRESH" | null>(null);
  const [comments, setComments] = useState("");
  const [fieldError, setFieldError] = useState("");
  const [error, setError] = useState("");
  const [needsRefresh, setNeedsRefresh] = useState(false);
  const [saved, setSaved] = useState<"APPROVE" | "RETURN" | null>(null);
  const context = normalizeRequestWorkbookReview(query.data, submission);
  const level = context.level;
  const matches = context.itemCode === itemCode && context.runCode === runCode
    && (!context.unitCode || context.unitCode === unitCode)
    && context.version === version
    && submission.runItemCode === itemCode && submission.dispatchRunCode === runCode
    && requestVersion(submission.submissionVersion) === version;
  const user = getLocalCurrentUser();
  const ownSubmission = Boolean((user.email && requestText(submission.submittedByEmail).toLowerCase() === user.email.toLowerCase())
    || (user.userId && submission.submittedByUserId === user.userId));
  const canDecide = matches && !ownSubmission && context.canDecide && Boolean(level);
  const canApprove = canDecide && context.allowedActions.includes("APPROVE");
  const canReturn = canDecide && context.allowedActions.includes("RETURN");
  const canFreeze = matches && context.canFreeze;
  const disabled = Boolean(pending || saved || needsRefresh || query.isPending || query.isError || !previewReady);
  const history = context.history;

  async function refresh() {
    await query.refetch({ throwOnError: true });
    await Promise.all([
      client.invalidateQueries({ queryKey: [...templateWorkflowKeys.all, "collection-activities"] }),
      client.invalidateQueries({ queryKey: [...templateWorkflowKeys.all, "collection-activity-preview"] }),
      client.invalidateQueries({ queryKey: templateWorkflowKeys.dispatchRun(runCode, unitCode) }),
    ]);
  }
  async function reload() {
    if (guard.current) return;
    guard.current = true; setPending("REFRESH");
    try { await refresh(); setError(""); setNeedsRefresh(false); }
    catch { setError(t("requestWorkbook.refreshError")); }
    finally { guard.current = false; setPending(null); }
  }
  async function act(action: Action) {
    if (guard.current || disabled || (action === "APPROVE" ? !canApprove : action === "RETURN" ? !canReturn : !canFreeze)) return;
    const result = z.string().trim().max(2000, t("requestWorkbook.commentsLong"))
      .refine((value) => action !== "RETURN" || value.length > 0, t("requestWorkbook.reasonRequired")).safeParse(comments);
    if (!result.success) { setFieldError(result.error.issues[0].message); return; }
    guard.current = true; setPending(action); setError(""); setFieldError("");
    try {
      if (!await confirm(t(`requestWorkbook.confirm.${action}`, { version }))) return;
      if (action === "FREEZE") {
        const journey = await freeze.mutateAsync({ unit_code: unitCode, dispatch_run_code: runCode, run_item_code: itemCode, submission_version: version });
        if (!journey.jobCode) throw new Error(t("requestWorkbook.refreshError"));
        onJourney(journey.jobCode); // 202 is queued, never publication success.
      } else {
        await decision.mutateAsync({ runCode, runItemCode: itemCode, payload: {
          run_item_code: itemCode, submission_version: version, action, approval_level: level!, comments: result.data,
        } });
        setSaved(action);
      }
      await refresh();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : t("requestWorkbook.saveError"));
      setNeedsRefresh(true); // An uncertain response may already have saved the decision.
    } finally { guard.current = false; setPending(null); }
  }
  return { query, level, canApprove, canReturn, canFreeze, ownSubmission, matches, history, comments, setComments,
    fieldError, error, pending, disabled, saved, acknowledge: () => { setSaved(null); setComments(""); }, act, reload };
}
