import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { motion, useReducedMotion } from "motion/react";
import { Controller } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { IconClipboardCheck, IconDeviceFloppy, IconListCheck, IconPlayerPause } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import { DirectReviewComplete } from "./direct-review-complete";
import { DirectReviewContextFields } from "./direct-review-context-fields";
import type { DirectPreview, DirectReviewIssue } from "@/api/direct-ingestion.api";
import { useDirectReviewSession } from "@/hooks/use-direct-review-session";
import { Loader } from "@/components/common/loader";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/ui/field";
import { Progress } from "@/components/ui/progress";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import {
  Questionnaire, QuestionnaireChoice, QuestionnaireChoices, QuestionnaireChoiceDescription,
  QuestionnaireDescription, QuestionnaireItem, QuestionnaireTitle,
} from "@/components/ui/questionnaire";

type DirectReviewPanelProps = {
  code: string; version: number; unitCode: string;
  review?: DirectPreview["review"];
  status?: DirectPreview["statusDetail"];
  entityNames: ReadonlyMap<string, string>;
  refresh: () => Promise<unknown>;
  onStart: () => void;
  onDone: () => void;
};

type ReviewSession = ReturnType<typeof useDirectReviewSession>;

export function DirectReviewPanel(props: DirectReviewPanelProps) {
  const { t } = useTranslation("ingestion");
  const session = useDirectReviewSession(props);
  const [started, setStarted] = useState(false);
  const { question, remaining, total, busy, complete } = session;
  const answered = Math.max(0, total - remaining);

  return <aside className="flex min-h-0 min-w-0 flex-col overflow-hidden border-t bg-card text-card-foreground md:border-t-0 md:border-l" aria-label={t("directReview.title")}>
    <header className="flex shrink-0 flex-col gap-3 border-b p-4">
      <h2 className="flex items-center gap-2 text-sm font-semibold">
        <IconClipboardCheck className="size-4" aria-hidden="true" />{t("directReview.title")}
      </h2>
      {started && !complete && total > 0 ? <>
        <div className="flex flex-wrap items-center justify-between gap-2 text-xs tabular-nums" aria-live="polite">
          <span>{t(complete ? "directReview.allSaved" : "directReview.question", { current: Math.min(answered + 1, total), total })}</span>
          <span>{t("directReview.savedCount", { count: answered, total })}</span>
        </div>
        <Progress value={answered} maxValue={Math.max(total, 1)} aria-label={t("directReview.progress")} />
      </> : null}
      {props.review?.resolvedIssues?.length ? <Collapsible>
        <CollapsibleTrigger className="text-left text-xs text-primary">{t("directReview.history", { count: props.review.resolvedIssues.length })}</CollapsibleTrigger>
        <CollapsibleContent>
          <ScrollArea className="max-h-40 pt-2">
            <ul className="flex flex-col gap-2 text-xs">
              {props.review.resolvedIssues.map((issue) => {
                const decision = issue.decision && typeof issue.decision === "object" ? issue.decision as Record<string, unknown> : {};
                const action = typeof decision.action === "string" ? decision.action : "";
                return <li key={issue.entityRef} className="flex flex-col gap-1">
                  <span>{issue.requestedValue?.displayName || issue.question || props.entityNames.get(issue.entityRef) || issue.requestedValue?.code}</span>
                  {["USE_EXISTING", "CREATE_NEW", "CHANGE_PARENT", "CORRECT_VALUE"].includes(action) ? <span className="text-muted-foreground">{t(`directReview.actions.${action}`)}</span> : null}
                </li>;
              })}
            </ul>
          </ScrollArea>
        </CollapsibleContent>
      </Collapsible> : null}
    </header>
    {question && !complete && !started ? <>
      <ReviewIntroduction remaining={remaining} />
      <footer className="flex shrink-0 flex-col gap-3 border-t p-4">
        <p className="text-xs leading-relaxed text-muted-foreground">{t("directReview.intro.finality")}</p>
        <Button type="button" onPress={() => { setStarted(true); props.onStart(); }}>{t("directReview.intro.start")}</Button>
      </footer>
    </> : question && !complete ? <Questionnaire
      className="min-h-0 flex-1 gap-0"
      key={question.entityRef}
      item={question.entityRef}
      noValidate
      aria-busy={busy}
      onKeyDownCapture={(event) => {
        if (event.target instanceof Element && event.target.closest("[data-review-context]")) return;
        if (event.key === "Enter" && !(event.target instanceof Element && event.target.closest("button"))) {
          event.preventDefault();
          event.stopPropagation();
        }
      }}
      onSubmitCapture={(event) => {
        event.preventDefault();
        event.stopPropagation();
        const submitter = (event.nativeEvent as SubmitEvent).submitter;
        if (submitter?.getAttribute("data-review-save") === "true") void session.submit();
      }}
    >
      <ScrollArea className="min-h-0 flex-1 overscroll-contain p-4">
        <ReviewEntrance className="flex flex-col gap-4">
          <ReviewQuestion issue={question} session={session} entityNames={props.entityNames} />
          {session.error ? <Alert variant="destructive"><AlertDescription>{session.error}</AlertDescription></Alert> : null}
          {!props.review?.canSubmitDecision && !busy ? <Alert><AlertDescription>{t("directReview.unavailable")}</AlertDescription></Alert> : null}
        </ReviewEntrance>
      </ScrollArea>
      <footer className="flex shrink-0 flex-col gap-3 border-t p-4">
        <p className="text-xs leading-relaxed text-muted-foreground">{t("directReview.intro.finality")}</p>
        {session.needsRefresh ? <Button type="button" isDisabled={busy} onPress={() => void session.refreshReview()}>
          {busy ? <Spinner data-icon="inline-start" /> : null}{t("directReview.refresh")}
        </Button> : <Button type="submit" data-review-save="true" isDisabled={!session.canSubmit}>
          {busy ? <Spinner data-icon="inline-start" /> : null}
          {t(busy ? "directReview.saving" : remaining === 1 ? "directReview.saveFinish" : "directReview.saveContinue")}
        </Button>}
      </footer>
    </Questionnaire> : complete ? <>
      <ScrollArea className="min-h-0 flex-1 overscroll-contain p-4"><DirectReviewComplete total={total} /></ScrollArea>
      <footer className="flex shrink-0 justify-end border-t p-4"><Button type="button" onPress={props.onDone}>{t("directReview.done")}</Button></footer>
    </> : <ScrollArea className="min-h-0 flex-1 overscroll-contain p-4">
      {props.status?.status === "FAILED" ? <Alert variant="destructive"><AlertDescription>{props.status.message || t("directIngestion.extractionFailed")}</AlertDescription></Alert>
        : !props.review || ["IN_QUEUE", "EXTRACTION_QUEUED", "PROCESSING"].includes(props.status?.status ?? "") ? <Loader text={t("directIngestion.processing")} />
        : <Empty>
          <EmptyHeader>
            <EmptyTitle>{t("directReview.unavailableTitle")}</EmptyTitle>
            <EmptyDescription>{t("directReview.unavailable")}</EmptyDescription>
          </EmptyHeader>
        </Empty>}
    </ScrollArea>}
  </aside>;
}

function ReviewIntroduction({ remaining }: { remaining: number }) {
  const { t } = useTranslation("ingestion");
  const steps = [
    { key: "choose", icon: IconListCheck, surface: "bg-primary/15 text-primary" },
    { key: "save", icon: IconDeviceFloppy, surface: "bg-success/15 text-success" },
    { key: "resume", icon: IconPlayerPause, surface: "bg-warning/15 text-warning" },
  ] as const;
  return <ScrollArea className="min-h-0 flex-1 overscroll-contain p-4">
    <ReviewEntrance className="flex flex-col gap-5">
      <div className="flex flex-col items-start gap-2">
        <Badge>{t("directReview.intro.count", { count: remaining })}</Badge>
        <h3 className="text-sm font-medium text-balance">{t("directReview.intro.title")}</h3>
        <p className="text-xs leading-relaxed text-muted-foreground">{t("directReview.intro.summary")}</p>
      </div>
      <ol className="flex flex-col gap-4">
        {steps.map(({ key, icon: Icon, surface }) => <li key={key} className="flex items-start gap-3">
          <div className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", surface)}><Icon className="size-4" aria-hidden="true" /></div>
          <div className="flex min-w-0 flex-col gap-1">
            <h4 className="text-xs font-medium">{t(`directReview.intro.${key}Title`)}</h4>
            <p className="text-xs leading-relaxed text-muted-foreground">{t(key === "resume" ? "directReview.intro.resumePanel" : `directReview.intro.${key}`)}</p>
          </div>
        </li>)}
      </ol>
    </ReviewEntrance>
  </ScrollArea>;
}

function ReviewEntrance({ children, className }: { children: ReactNode; className?: string }) {
  const reduceMotion = useReducedMotion();
  return <motion.div className={className} initial={reduceMotion ? false : { opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: reduceMotion ? 0 : 0.2 }}>
    {children}
  </motion.div>;
}

function ReviewAnswerMotion({ children, selected, busy, index }: { children: ReactNode; selected: boolean; busy: boolean; index: number }) {
  const reduceMotion = useReducedMotion();
  return <motion.div
    initial={reduceMotion ? false : { opacity: 0, y: 6 }}
    animate={{ opacity: 1, y: 0, x: !reduceMotion && selected ? 2 : 0 }}
    whileHover={reduceMotion || busy ? undefined : { y: -1 }}
    transition={{
      opacity: { duration: reduceMotion ? 0 : 0.16, delay: reduceMotion ? 0 : Math.min(index * 0.025, 0.125) },
      y: { duration: reduceMotion ? 0 : 0.16 },
      x: reduceMotion ? { duration: 0 } : { type: "spring", stiffness: 360, damping: 28 },
    }}
  >{children}</motion.div>;
}

function ReviewQuestion({ issue, session, entityNames }: { issue: DirectReviewIssue; session: ReviewSession; entityNames: ReadonlyMap<string, string> }) {
  const { t, i18n } = useTranslation("ingestion");
  const fieldset = useRef<HTMLFieldSetElement>(null);
  useLayoutEffect(() => {
    const question = fieldset.current;
    const scrollArea = question?.closest<HTMLElement>('[data-slot="scroll-area"]');
    if (scrollArea) {
      scrollArea.scrollTop = 0;
      scrollArea.scrollLeft = 0;
    }
  }, [issue.entityRef]);
  const language = i18n.resolvedLanguage ?? i18n.language;
  const localized = (names?: Record<string, string>) => names?.[language] || names?.[`${language.split("-")[0]}-IN`] || names?.["en-IN"];
  const name = localized(issue.requestedValue?.names) || issue.requestedValue?.displayName || entityNames.get(issue.entityRef) || issue.requestedCode || issue.entityRef;
  const errors = session.form.formState.errors;
  const candidates = issue.allowedActions.includes("USE_EXISTING") ? (issue.candidates ?? []).filter((candidate) => candidate.active !== false) : [];
  return <QuestionnaireItem name={issue.entityRef} ref={fieldset} required invalid={Boolean(errors.choice)} className="shrink-0">
    <QuestionnaireTitle>{localized(issue.questions) || issue.question || t("directReview.matchQuestion", { name })}</QuestionnaireTitle>
    <QuestionnaireDescription>{localized(issue.messages) || issue.message || t("directReview.choose")}</QuestionnaireDescription>
    <Controller control={session.form.control} name="choice" render={({ field }) => <QuestionnaireChoices aria-describedby={errors.choice ? `${issue.entityRef}-error` : undefined}>
      {candidates.map((candidate, index) => {
        const value = `USE_EXISTING:${candidate.databaseId}`;
        const parentName = candidate.parentCode ? entityNames.get(candidate.parentCode) : undefined;
        const scopeName = candidate.scopeCode ? entityNames.get(candidate.scopeCode) : undefined;
        return <ReviewAnswerMotion key={value} selected={field.value === value} busy={session.busy} index={index}>
        <QuestionnaireChoice value={value} checked={field.value === value} disabled={session.busy} onChange={() => { field.onChange(value); session.form.setValue("parentId", ""); session.form.setValue("scopeId", ""); session.form.setValue("scopeCode", ""); session.form.setValue("countryCode", ""); }}>
          {candidate.displayLabel || candidate.displayName || candidate.code}
          {parentName || scopeName ? <QuestionnaireChoiceDescription>
            {[parentName ? t("directReview.parent", { value: parentName }) : null, scopeName ? t("directReview.scope", { value: scopeName }) : null].filter(Boolean).join(" · ")}
          </QuestionnaireChoiceDescription> : null}
        </QuestionnaireChoice>
        </ReviewAnswerMotion>;
      })}
      {issue.allowedActions.filter((value) => ["CREATE_NEW", "CHANGE_PARENT", "CORRECT_VALUE"].includes(value)).map((value, index) => <ReviewAnswerMotion key={value} selected={field.value === value} busy={session.busy} index={candidates.length + index}>
        <QuestionnaireChoice value={value} checked={field.value === value} disabled={session.busy} onChange={() => { field.onChange(value); session.form.setValue("parentId", ""); session.form.setValue("scopeId", ""); session.form.setValue("scopeCode", ""); session.form.setValue("countryCode", ""); }}>
        {t(`directReview.actions.${value}`)}
        <QuestionnaireChoiceDescription>{t(`directReview.actionDescriptions.${value}`, { name })}</QuestionnaireChoiceDescription>
        </QuestionnaireChoice>
      </ReviewAnswerMotion>)}
      </QuestionnaireChoices>} />
    {errors.choice ? <FieldError id={`${issue.entityRef}-error`}>{errors.choice.message}</FieldError> : null}
    <DirectReviewContextFields session={session} />
  </QuestionnaireItem>;
}
