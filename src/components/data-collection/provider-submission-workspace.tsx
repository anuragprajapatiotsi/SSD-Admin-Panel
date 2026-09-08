import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { FortuneSpreadsheetHandle } from "@/components/fortune-spreadsheet";
import type { FortuneWorkbookData } from "@/utils/fortune-workbook";
import type { RequestAccessSessionDetail } from "@/api/requests.api";
import { ApiError } from "@/api/http-client";
import { useDownloadProviderSourceTemplate, useSaveProviderWorkbook } from "@/hooks/use-template-workflow";
import { useConfirmation } from "@/hooks/use-confirmation";
import { TemplateEditorWorkspace, TemplateEditorCanvas } from "@/components/template-editor/template-editor-workspace";
import { formatTemplateFileSize } from "@/components/template-editor/template-file-utils";
import { FileUpload } from "@/components/common/file-upload";
import { Loader } from "@/components/common/loader";
import { StatusBadge } from "@/components/common/status-badge";
import { normalizeStatusVariant } from "@/components/common/status-variants";
import { PublicPageHeader } from "@/components/common/public-page-branding";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Field, FieldError, FieldGroup } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupTextarea } from "@/components/ui/input-group";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Spinner } from "@/components/ui/spinner";
import { Empty, EmptyHeader, EmptyTitle, EmptyContent } from "@/components/ui/empty";
import { CompletionState } from "@/components/common/completion-state";
import { ScreenTour } from "@/components/common/guided-tour/guided-tour";
import { providerTours } from "./provider-tours";
import { providerAssignmentName, providerSubmissionReview, type ProviderEntryMode } from "@/utils/provider-assignment";
import { ProviderReviewNotice } from "@/components/data-collection/provider-review-notice";
import { ProviderSubmissionRequirements } from "@/components/data-collection/provider-submission-requirements";
import { ProviderSubmittedPreview } from "@/components/data-collection/provider-submitted-preview";
import { useProviderSubmissionRequirements } from "@/hooks/use-provider-submission-requirements";
import { IconCheck, IconSend, IconLogout, IconDeviceFloppy } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { z } from "zod";

const FortuneSpreadsheet = lazy(() => import("@/components/fortune-spreadsheet").then((module) => ({ default: module.FortuneSpreadsheet })));

const draftSchema = z.object({
  submissionNote: z.string().nullable().optional(),
  savedAt: z.string().nullable().optional(),
  entryStatus: z.string().nullable().optional(),
  attachments: z.array(z.object({
    artifactType: z.string().optional(),
    originalFileName: z.string().optional(),
  })).optional(),
});

export function ProviderSubmissionWorkspace({ session, detail, mode, onBack, onExpired, onLogout, onSubmittedBack, pending, sessionError }: {
  session: string; detail: RequestAccessSessionDetail; mode: ProviderEntryMode; onBack: () => void; onExpired: () => void;
  onLogout: () => void; onSubmittedBack: () => Promise<void>; pending: boolean; sessionError: string;
}) {
  const { t, i18n } = useTranslation("ingestion");
  const confirm = useConfirmation();
  const download = useDownloadProviderSourceTemplate();
  const submit = useSaveProviderWorkbook();
  const requirements = useProviderSubmissionRequirements(detail.policy, mode === "upload");
  const resetAcceptance = requirements.resetAcceptance;
  const draftResult = draftSchema.safeParse((detail.assignment?.dataEntryState ?? detail.dataEntry)?.draft);
  const existingDraft = draftResult.success ? draftResult.data : undefined;
  const draftWorkbook = existingDraft?.attachments?.find((attachment) => attachment.artifactType === "DRAFT_WORKBOOK");
  const hasExistingDraft = Boolean(draftWorkbook || existingDraft?.savedAt || existingDraft?.entryStatus === "DRAFT" || detail.assignment?.lifecycleStatus === "DRAFT");
  const [usingOriginalInsteadOfDraft, setUsingOriginalInsteadOfDraft] = useState(mode === "online" && hasExistingDraft);
  const [file, setFile] = useState<File | null>(null);
  const [workbook, setWorkbook] = useState<FortuneWorkbookData | null>(null);
  const [loading, setLoading] = useState(mode === "online");
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [error, setError] = useState("");
  const [note, setNote] = useState(existingDraft?.submissionNote ?? "");
  const [noteError, setNoteError] = useState("");
  const [dirty, setDirty] = useState(false);
  const [savingAction, setSavingAction] = useState<"draft" | "submit" | null>(null);
  const saving = savingAction !== null;
  const [draftSaved, setDraftSaved] = useState(false);
  const [savedNote, setSavedNote] = useState(existingDraft?.submissionNote ?? "");
  const hasUnsavedChanges = dirty || note !== savedNote || requirements.changed;
  const [saved, setSaved] = useState(false);
  const [submittedFile, setSubmittedFile] = useState<File | null>(null);
  const [submittedPreviewOpen, setSubmittedPreviewOpen] = useState(false);
  const [lifecycleStatus, setLifecycleStatus] = useState(detail.assignment?.lifecycleStatus);
  const handleWorkbookDirty = useCallback(() => {
    setDirty(true);
    setDraftSaved(false);
    resetAcceptance();
  }, [resetAcceptance]);
  const loadingWorkbookText = t("providerAccess.loadingWorkbook");
  const workbookLoadingFallback = useMemo(() => <Loader className="size-full min-h-0" text={loadingWorkbookText} />, [loadingWorkbookText]);
  const workbookRef = useRef<FortuneSpreadsheetHandle>(null);
  const submitting = useRef(false);
  const assignment = detail.assignment!;
  const review = providerSubmissionReview(assignment, detail.dataEntry);
  const code = assignment.runItemCode!;
  const title = providerAssignmentName(assignment, t("providerAccess.template"));
  const requestFile = download.mutateAsync;
  const expiredRef = useRef(onExpired);
  const tRef = useRef(t);
  useEffect(() => { expiredRef.current = onExpired; tRef.current = t; }, [onExpired, t]);
  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const main = document.getElementById("public-main-content");
      main?.focus({ preventScroll: true });
      main?.scrollIntoView({ block: "start", behavior: "instant" });
    });
    return () => window.cancelAnimationFrame(frame);
  }, [code, mode]);
  useEffect(() => {
    if (mode !== "online" || review.locked) return;
    // Temporary fallback: no deployed draft-download API. Load the pinned original
    // and disclose missing draft edits before allowing the user to replace them.
    let active = true;
    setLoading(true);
    setError("");
    void requestFile({ session, run_item_code: code }).then(async (source) => {
      const { parseFileToFortuneWorkbook } = await import("@/utils/fortune-workbook");
      const data = await parseFileToFortuneWorkbook(source);
      if (active) { setFile(source); setWorkbook(data); }
    }).catch((cause) => {
      if (!active) return;
      if (cause instanceof ApiError && (cause.status === 401 || cause.status === 403)) { expiredRef.current(); return; }
      setError(tRef.current("providerAccess.workbookLoadError"));
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [session, code, mode, requestFile, loadAttempt, review.locked]);
  useEffect(() => {
    if (!hasUnsavedChanges || saved) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ""; };
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [hasUnsavedChanges, saved]);
  const policy = detail.policy;
  const canSaveDraft = mode === "online" && policy?.submissionControls?.saveDraftAllowed === true;
  const approved = [assignment.approvalStatus, assignment.reviewStatus, assignment.publicationStatus, assignment.status].some((status) => /^(APPROVED|PUBLISHED|COMPLETED)$/i.test(status ?? ""));
  const dueDate = detail.dispatch?.dueDate;
  const overdue = dueDate && Date.now() > new Date(/^\d{4}-\d{2}-\d{2}$/.test(dueDate) ? `${dueDate}T23:59:59` : dueDate).getTime();
  const locked = Boolean(review.locked || detail.superseded || policy?.isActive === false
    || (approved && (policy?.submissionControls?.lockSubmissionAfterApproval === true || policy?.submissionControls?.allowRevisionAfterApproval === false))
    || (overdue && policy?.submissionControls?.allowLateSubmission === false)
    || (mode === "online" ? policy?.submissionMethods?.webForm !== true : policy?.submissionMethods?.excelUpload !== true));
  const maxMb = policy?.attachmentSettings?.maxFileSizeMb;
  const workbookReady = mode === "online"
    ? Boolean(file && workbook)
    : Boolean(file && /\.xlsx$/i.test(file.name) && file.size > 0 && (!maxMb || file.size <= maxMb * 1024 * 1024));
  const actionDisabled = saving || pending || loading || !workbookReady || locked || saved;
  function selectFile(nextFile: File) {
    const schema = z.instanceof(File).refine((value) => /\.xlsx$/i.test(value.name) && value.size > 0, t("providerAccess.xlsxOnly"))
      .refine((value) => !maxMb || value.size <= maxMb * 1024 * 1024, t("providerAccess.maxSize", { size: maxMb }));
    const result = schema.safeParse(nextFile);
    setFile(nextFile);
    setDirty(true);
    resetAcceptance();
    setError(result.success ? "" : result.error.issues[0].message);
  }
  async function back() {
    if (submitting.current) return;
    if (!saved && hasUnsavedChanges && !await confirm(t("providerAccess.discardConfirm"))) return;
    onBack();
  }
  async function logout() {
    if (submitting.current || pending) return;
    if (!saved && hasUnsavedChanges && !await confirm(t("providerAccess.logoutConfirm"))) return;
    onLogout();
  }
  async function send(action: "draft" | "submit") {
    if (submitting.current || actionDisabled || !file || (action === "draft" && !canSaveDraft)) return;
    const validation = z.string().max(500, t("providerAccess.noteTooLong")).trim().safeParse(note);
    if (!validation.success) { setNoteError(validation.error.issues[0].message); return; }
    if (!requirements.validate(action === "submit")) return;
    submitting.current = true;
    try {
      if (action === "draft" && usingOriginalInsteadOfDraft && !await confirm(t("providerAccess.replaceDraftConfirm"))) return;
      if (action === "submit" && !await confirm(t("providerAccess.submitConfirm"))) return;
      setSavingAction(action);
      setDraftSaved(false);
      setError("");
      let output = file;
      if (mode === "online") {
        if (!workbookRef.current) throw new Error(t("providerAccess.workbookLoadError"));
        const snapshot = await workbookRef.current.commitAndGetSnapshot();
        const { createFileFromFortuneWorkbook } = await import("@/utils/fortune-workbook");
        output = await createFileFromFortuneWorkbook(snapshot, file, file.name.replace(/\.xlsx$/i, ""));
      }
      if (!/\.xlsx$/i.test(output.name) || output.size === 0) throw new Error(t("providerAccess.xlsxOnly"));
      if (maxMb && output.size > maxMb * 1024 * 1024) throw new Error(t("providerAccess.maxSize", { size: maxMb }));
      await submit.mutateAsync({ mode: action, payload: { session, runItemCode: code, file: output, submissionNote: validation.data, ...requirements.payload } });
      if (action === "submit") { setSubmittedFile(output); setSaved(true); }
      else {
        setDraftSaved(true);
        setLifecycleStatus("DRAFT");
        setUsingOriginalInsteadOfDraft(false);
      }
      setSavedNote(note);
      setDirty(false);
    } catch (cause) {
      if (cause instanceof ApiError && (cause.status === 401 || cause.status === 403)) { onExpired(); return; }
      setError(cause instanceof Error ? cause.message : t("providerAccess.actionError"));
    } finally { setSavingAction(null); submitting.current = false; }
  }
  const publicHeader = <PublicPageHeader actions={<Button variant="outline" isDisabled={saving || pending} onPress={() => void logout()}><IconLogout data-icon="inline-start" />{t("providerAccess.logout")}</Button>} />;
  if (saved && submittedPreviewOpen && submittedFile) return <>{publicHeader}<main id="public-main-content" tabIndex={-1}><ProviderSubmittedPreview file={submittedFile} onBack={() => setSubmittedPreviewOpen(false)} /></main></>;
  if (saved || review.locked) return <>
    {publicHeader}
    <main data-tour-scope="provider-completed" id="public-main-content" tabIndex={-1} className="flex flex-1 items-center justify-center p-4 sm:p-6">
      <ScreenTour definition={providerTours.completed} ready={!pending && !sessionError} />
      <div data-tour="provider-completed" className="flex w-full max-w-lg flex-col items-center gap-4">
        <CompletionState title={t("providerAccess.submittedTitle")} description={t("providerAccess.submittedDescription")} />
        {sessionError ? <Alert variant="destructive"><AlertDescription>{sessionError}</AlertDescription></Alert> : null}
        {submittedFile ? <Button data-tour="provider-preview" variant="outline" onPress={() => setSubmittedPreviewOpen(true)}>{t("providerAccess.previewSubmission")}</Button> : null}
        <Button data-tour="provider-assignments-back" isDisabled={pending} onPress={() => void onSubmittedBack()}>
          {pending ? <Spinner data-icon="inline-start" /> : null}
          {t("providerAccess.assignments")}
        </Button>
      </div>
    </main>
  </>;
  return <TemplateEditorWorkspace data-tour-scope={`provider-${mode}`} className="h-auto overflow-visible">
    <ScreenTour definition={review.returned ? providerTours[mode === "online" ? "returnedOnline" : "returnedUpload"] : providerTours[mode]} ready={!loading && !saving && !pending && !locked && !error && (mode === "upload" || Boolean(workbook))} />
    {publicHeader}
    <main id="public-main-content" tabIndex={-1} className="flex min-h-svh min-w-0 flex-col" aria-label={title}>
    <div className="grid h-svh min-h-128 flex-none grid-cols-1 grid-rows-[minmax(22rem,1fr)_auto] overflow-auto lg:grid-cols-[minmax(0,1fr)_20rem] lg:grid-rows-1 lg:overflow-hidden">
      <TemplateEditorCanvas data-tour={mode === "online" ? "provider-workbook" : "provider-file"} className="relative isolate">
        {loading ? <Loader className="h-full" text={t("providerAccess.loadingWorkbook")} /> : mode === "online" ? workbook ? (
          <div className="relative flex min-h-0 flex-1" inert={saving || locked ? true : undefined}>
            <Suspense fallback={workbookLoadingFallback}><FortuneSpreadsheet ref={workbookRef} initialData={workbook} onDirty={handleWorkbookDirty} readOnly={locked} showToolbar={false} loadingFallback={workbookLoadingFallback} /></Suspense>
          </div>
        ) : <Empty><EmptyHeader><EmptyTitle>{t("providerAccess.workbookLoadError")}</EmptyTitle></EmptyHeader><EmptyContent><Button onPress={() => setLoadAttempt((value) => value + 1)}>{t("providerAccess.retry")}</Button></EmptyContent></Empty> : (
          <ScrollArea className="h-full"><div className="mx-auto w-full max-w-3xl p-4 sm:p-6"><FileUpload title={t("providerAccess.uploadTitle")} description={t("providerAccess.xlsxOnly")} browseLabel={t("providerAccess.browse")} inputLabel={t("providerAccess.uploadCompleted")} accept=".xlsx" selectedFile={file} selectedFileLabel={file ? formatTemplateFileSize(file.size, i18n.language) : undefined} onFileSelect={selectFile} onRemove={() => { setFile(null); setError(""); }} removeLabel={t("providerAccess.removeFile")} disabled={saving || locked} state={saving ? "uploading" : file ? "attached" : "empty"} /></div></ScrollArea>
        )}
      </TemplateEditorCanvas>
      <aside className="flex min-h-0 flex-col border-t bg-card lg:border-t-0 lg:border-l" aria-label={t("providerAccess.submitTitle")}>
        <ScrollArea className="min-h-0 flex-1 p-4">
          <FieldGroup>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h2 className="text-base font-semibold">{t("providerAccess.submitTitle")}</h2>
              {lifecycleStatus ? <StatusBadge variant={normalizeStatusVariant(lifecycleStatus)}>{lifecycleStatus}</StatusBadge> : null}
            </div>
            <p className="text-sm font-medium">{title}</p>
            <p className="text-xs text-muted-foreground">{t("providerAccess.submitHelp")}</p>
            <Field data-tour="provider-note" data-invalid={Boolean(noteError)}>
              <InputGroup><InputGroupAddon align="block-start"><InputGroupText>{t("providerAccess.note")}</InputGroupText></InputGroupAddon><InputGroupTextarea aria-label={t("providerAccess.note")} aria-invalid={Boolean(noteError)} maxLength={500} value={note} onChange={(event) => { setNote(event.target.value); setNoteError(""); setDraftSaved(false); resetAcceptance(); }} disabled={saving || locked} rows={5} /></InputGroup>
              <FieldError>{noteError}</FieldError>
            </Field>
            <ProviderSubmissionRequirements requirements={requirements} disabled={saving || pending || locked} />
            <ProviderReviewNotice review={review} />
            {locked && !review.locked ? <Alert><AlertDescription>{t("providerAccess.locked")}</AlertDescription></Alert> : null}
            {error ? <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert> : null}
          </FieldGroup>
        </ScrollArea>
        <div className="flex shrink-0 flex-col gap-2 p-4">
          {draftSaved ? <p role="status" className="flex items-center gap-2 text-xs text-muted-foreground"><IconCheck className="size-4 shrink-0" aria-hidden="true" />{t("providerAccess.draftSaved")}</p> : null}
          <div className="flex items-center justify-between gap-2">
          <Button data-tour="provider-cancel" variant="outline" isDisabled={saving || pending} onPress={() => void back()}>{t("confirmation.cancel", { ns: "common" })}</Button>
          <div className="flex flex-wrap justify-end gap-2">
          {canSaveDraft ? <Button data-tour="provider-draft" variant="outline" isDisabled={actionDisabled} onPress={() => void send("draft")}>{savingAction === "draft" ? <Spinner data-icon="inline-start" /> : <IconDeviceFloppy data-icon="inline-start" />}{t(savingAction === "draft" ? "providerAccess.savingDraft" : "providerAccess.saveDraft")}</Button> : null}
          <Button data-tour="provider-submit" isDisabled={actionDisabled} aria-busy={savingAction === "submit"} onPress={() => void send("submit")}>{savingAction === "submit" ? <Spinner data-icon="inline-start" /> : <IconSend data-icon="inline-start" />}{t(savingAction === "submit" ? "providerAccess.submitting" : "providerAccess.submit")}</Button>
          </div>
          </div>
        </div>
      </aside>
    </div>
    </main>
  </TemplateEditorWorkspace>;
}
