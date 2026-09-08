import { useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { ApiError } from "@/api/http-client";
import type { DirectPreview, DirectReviewAction, DirectReviewDecision, DirectReviewIssue } from "@/api/direct-ingestion.api";
import { useDirectReviewDecision } from "@/hooks/use-direct-ingestion";
import { useDirectReviewLookups } from "@/hooks/use-direct-review-lookups";
import { getSelectedLocale } from "@/api/session.api";

export type ReviewAnswer = { choice: string; code: string; parentId: string; scopeId: string; countryCode: string; scopeCode: string };
const EMPTY_ANSWER: ReviewAnswer = { choice: "", code: "", parentId: "", scopeId: "", countryCode: "", scopeCode: "" };
const EMPTY_ISSUES: DirectReviewIssue[] = [];

export function useDirectReviewSession({ code, version, unitCode, review, refresh }: {
  code: string; version: number; unitCode: string;
  review?: DirectPreview["review"];
  refresh: () => Promise<unknown>;
}) {
  const { t } = useTranslation("ingestion");
  const [saved, setSaved] = useState<string[]>([]);
  const [completedTotal, setCompletedTotal] = useState<number | null>(null);
  const [activeIssue, setActiveIssue] = useState<DirectReviewIssue | null>(null);
  const [savingIssue, setSavingIssue] = useState<DirectReviewIssue | null>(null);
  const [needsRefresh, setNeedsRefresh] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");
  const locked = useRef(false);
  const remainingAtSave = useRef(0);
  const mutation = useDirectReviewDecision(code, version, unitCode);
  const serverPending = (review?.issues ?? EMPTY_ISSUES).filter((issue) => issue.decision == null);
  const pending = serverPending.filter((issue) => !saved.includes(issue.entityRef));
  const question = completedTotal !== null ? undefined : savingIssue ?? activeIssue ?? pending[0];
  useEffect(() => {
    if (!activeIssue && question) setActiveIssue(question);
  }, [activeIssue, question]);
  const acknowledgedPending = serverPending.filter((issue) => saved.includes(issue.entityRef)).length;
  const remaining = completedTotal !== null ? 0 : Math.max(pending.length, (review?.summary?.pendingIssueCount ?? pending.length) - acknowledgedPending);
  const resolvedCount = review?.summary?.resolvedIssueCount ?? review?.resolvedIssues?.length ?? 0;
  const total = Math.max(completedTotal ?? 0, review?.summary?.totalIssueCount ?? 0, serverPending.length + resolvedCount, review?.issues?.length ?? 0, remaining + saved.length);
  const busy = mutation.isPending || Boolean(savingIssue) || refreshing;
  const schema = useMemo(() => z.object({
    choice: z.string().min(1, t("directReview.choose")),
    code: z.string().trim().max(160, t("directReview.codeLength")),
    parentId: z.string(), scopeId: z.string(), countryCode: z.string(), scopeCode: z.string(),
  }).superRefine((answer, context) => {
    const [action, candidateId] = answer.choice.split(":");
    if (!question?.allowedActions.includes(action as DirectReviewAction)) {
      context.addIssue({ code: "custom", path: ["choice"], message: t("directReview.choose") });
    }
    if (action === "USE_EXISTING" && (!z.string().uuid().safeParse(candidateId).success
      || !question?.candidates?.some((candidate) => candidate.databaseId === candidateId && candidate.active !== false))) {
      context.addIssue({ code: "custom", path: ["choice"], message: t("directReview.choose") });
    }
    if (action === "CORRECT_VALUE" && !answer.code) {
      context.addIssue({ code: "custom", path: ["code"], message: t("directReview.codeRequired") });
    }
  }), [question, t]);
  const form = useForm<ReviewAnswer>({ defaultValues: EMPTY_ANSWER, resolver: zodResolver(schema), mode: "onSubmit", reValidateMode: "onChange" });
  const choice = useWatch({ control: form.control, name: "choice" });
  const countryCode = useWatch({ control: form.control, name: "countryCode" });
  const scopeCode = useWatch({ control: form.control, name: "scopeCode" });
  const lookups = useDirectReviewLookups(question, choice.split(":")[0], unitCode, getSelectedLocale(), countryCode, scopeCode);
  const { reset } = form;
  useEffect(() => { reset(EMPTY_ANSWER); }, [question?.entityRef, reset]);

  const submit = form.handleSubmit(async (answer) => {
    if (locked.current || busy || needsRefresh || !question || !review?.canSubmitDecision) return;
    if (lookups.changing && ((lookups.needsParent && !answer.parentId) || (answer.parentId &&
      (!z.string().uuid().safeParse(answer.parentId).success || lookups.parents.isError || !lookups.parents.options.some((option) => option.id === answer.parentId))))) {
      form.setError("parentId", { message: t("directReview.selectParent") });
      return;
    }
    if (lookups.changing && ((lookups.member && !lookups.dimensionCode) || (answer.scopeId &&
      (!z.string().uuid().safeParse(answer.scopeId).success || lookups.scopes.isError || !lookups.scopes.options.some((option) => option.id === answer.scopeId))))) {
      form.setError("scopeId", { message: t("directReview.selectScope") });
      return;
    }
    locked.current = true;
    remainingAtSave.current = remaining;
    setSavingIssue(question);
    setError("");
    const [action, candidateId] = answer.choice.split(":") as [DirectReviewAction, string | undefined];
    const payload: DirectReviewDecision = {
      entity_ref: question.entityRef, action,
      ...(action === "USE_EXISTING" ? { selected_database_id: candidateId } : {}),
      ...(action !== "USE_EXISTING" && answer.parentId ? { selected_parent_database_id: answer.parentId } : {}),
      ...(action !== "USE_EXISTING" && answer.scopeId ? { selected_scope_database_id: answer.scopeId } : {}),
      ...(action === "CORRECT_VALUE" ? { corrected_code: answer.code } : {}),
    };
    try {
      await mutation.mutateAsync(payload);
      setSaved((previous) => [...previous, question.entityRef]);
      setActiveIssue(null);
      // Keep the successful review visible until Done, even if polling advances the API phase.
      if (remainingAtSave.current === 1) setCompletedTotal(total);
    } catch (failure) {
      setError(failure instanceof Error ? failure.message : t("directReview.saveError"));
      // A lost response is not proof that the write failed. Read server state before retrying.
      setNeedsRefresh(!(failure instanceof ApiError && (failure.status === 400 || failure.status === 422)));
    } finally {
      locked.current = false;
      setSavingIssue(null);
    }
  });

  async function refreshReview() {
    if (locked.current || busy) return;
    setRefreshing(true);
    try { await refresh(); setActiveIssue(null); setNeedsRefresh(false); setError(""); }
    catch (failure) { setError(failure instanceof Error ? failure.message : t("directReview.refreshError")); }
    finally { setRefreshing(false); }
  }

  return {
    question, remaining: savingIssue ? remainingAtSave.current : remaining, total, busy, form, choice, lookups, submit, error, needsRefresh, refreshReview,
    canSubmit: Boolean(review?.canSubmitDecision && question && !busy && !needsRefresh),
    complete: Boolean(review && total > 0 && remaining === 0 && !question && !busy),
  };
}
