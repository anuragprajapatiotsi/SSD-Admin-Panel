import type { FortuneSpreadsheetHandle } from "@/components/fortune-spreadsheet";
import {
  createFileFromFortuneWorkbook,
  createFortuneWorkbookFromRows,
  parseFileToFortuneWorkbook,
  type FortuneWorkbookData,
} from "@/utils/fortune-workbook";
import {
  getSelectedUnitCode,
  UNIT_CHANGED_EVENT,
} from "@/api/session.api";
import {
  useCreateTemplateRepositoryVersion,
  useCreateTemplateRepository,
  useTemplateRepositoryItem,
  useTemplateRepositoryVersionFile,
  useUpdateTemplateRepository,
} from "@/hooks/use-template-repository";
import {
  isSupportedTemplateFile,
  templateNameFromFile,
} from "@/components/template-editor/template-file-utils";
import type {
  TemplateConfirmationIntent,
  TemplateEditorMode,
  TemplateMetadataFormValues,
} from "@/components/template-editor/template-editor-types";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  useForm,
  type FieldErrors,
  type Resolver,
} from "react-hook-form";
import { useTranslation } from "react-i18next";
import { useBlocker, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";

type UseExcelTemplateEditorOptions = {
  mode: TemplateEditorMode;
  templateId?: string;
  onExit?: () => void;
  onSaved?: (templateName: string) => void;
};

function createMetadataResolver(
  requiredName: string,
  shortName: string,
): Resolver<TemplateMetadataFormValues> {
  const schema = z.object({
    templateName: z.string()
      .trim()
      .min(1, requiredName)
      .min(3, shortName),
    ministryIds: z.array(z.string()),
  });

  return async (values) => {
    const result = schema.safeParse(values);
    if (result.success) return { values: result.data, errors: {} };

    const errors: FieldErrors<TemplateMetadataFormValues> = {};
    result.error.issues.forEach((issue) => {
      const field = issue.path[0] as keyof TemplateMetadataFormValues | undefined;
      if (field === "templateName" && !errors.templateName) {
        errors.templateName = { type: "validate", message: issue.message };
      }
    });
    return { values: {}, errors };
  };
}

export function useExcelTemplateEditor({
  mode,
  templateId,
  onExit,
  onSaved,
}: UseExcelTemplateEditorOptions) {
  const { t } = useTranslation("ingestion");
  const navigate = useNavigate();
  const workbookRef = useRef<FortuneSpreadsheetHandle | null>(null);
  const workbookDraftRef = useRef<FortuneWorkbookData | null>(null);
  const skipNavigationBlockRef = useRef(false);
  const initializedTemplateRef = useRef("");
  const [file, setFile] = useState<File | null>(null);
  const [workbookData, setWorkbookData] = useState<FortuneWorkbookData | null>(null);
  const [isWorkbookLoading, setIsWorkbookLoading] = useState(false);
  const [workbookDirty, setWorkbookDirty] = useState(false);
  const [fileError, setFileError] = useState("");
  const [initialLoadError, setInitialLoadError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [hasInitializedEdit, setHasInitializedEdit] = useState(mode !== "edit");
  const [loadAttempt, setLoadAttempt] = useState(0);
  const [confirmationIntent, setConfirmationIntent] = useState<TemplateConfirmationIntent | null>(null);
  const [selectedUnitCode, setSelectedUnitCode] = useState(getSelectedUnitCode);

  const resolver = useMemo(
    () => createMetadataResolver(
      t("templateForm.nameRequired"),
      t("templateForm.nameTooShort"),
    ),
    [t],
  );
  const form = useForm<TemplateMetadataFormValues>({
    defaultValues: { templateName: "", ministryIds: [] },
    mode: "onChange",
    resolver,
  });

  const editTemplateQuery = useTemplateRepositoryItem(templateId, mode === "edit");
  const latestVersionId = editTemplateQuery.data?.latest_version?.id;
  const editTemplateFileQuery = useTemplateRepositoryVersionFile(
    latestVersionId,
    mode === "edit" && Boolean(latestVersionId),
  );
  const createTemplateMutation = useCreateTemplateRepository();
  const createTemplateVersionMutation = useCreateTemplateRepositoryVersion();
  const updateTemplateMutation = useUpdateTemplateRepository();
  const isSubmitting = createTemplateMutation.isPending
    || createTemplateVersionMutation.isPending
    || updateTemplateMutation.isPending;
  const hasUnsavedChanges = form.formState.isDirty || workbookDirty;
  const navigationBlocker = useBlocker(() => hasUnsavedChanges && !skipNavigationBlockRef.current);
  const activeConfirmationIntent = confirmationIntent
    ?? (navigationBlocker.state === "blocked" ? "exit" : null);

  useEffect(() => {
    function handleUnitChange() {
      setSelectedUnitCode(getSelectedUnitCode());
    }

    window.addEventListener(UNIT_CHANGED_EVENT, handleUnitChange);
    return () => window.removeEventListener(UNIT_CHANGED_EVENT, handleUnitChange);
  }, []);

  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (!hasUnsavedChanges) return;
      event.preventDefault();
      event.returnValue = "";
    }

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  useEffect(() => {
    if (mode !== "edit" || !templateId || !latestVersionId) return;
    if (!editTemplateQuery.data || !editTemplateFileQuery.data) return;
    if (initializedTemplateRef.current === `${templateId}:${latestVersionId}:${loadAttempt}`) return;

    initializedTemplateRef.current = `${templateId}:${latestVersionId}:${loadAttempt}`;
    let isCurrent = true;
    setIsWorkbookLoading(true);
    setInitialLoadError("");
    const metadata = editTemplateQuery.data;
    const downloadedFile = editTemplateFileQuery.data;
    const sourceFile = new File(
      [downloadedFile],
      metadata.latest_version?.original_file_name || downloadedFile.name,
      { type: downloadedFile.type, lastModified: downloadedFile.lastModified },
    );

    parseFileToFortuneWorkbook(sourceFile)
      .then((workbook) => {
        if (!isCurrent) return;
        setFile(sourceFile);
        setWorkbookData(workbook);
        workbookDraftRef.current = workbook;
        form.reset({
          templateName: metadata.template_name,
          ministryIds: metadata.ministry_ids ?? [],
        });
        void form.trigger();
        setWorkbookDirty(false);
        setFileError("");
      })
      .catch(() => {
        if (isCurrent) setInitialLoadError(t("templateForm.existingFileError"));
      })
      .finally(() => {
        if (!isCurrent) return;
        setHasInitializedEdit(true);
        setIsWorkbookLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [
    editTemplateFileQuery.data,
    editTemplateQuery.data,
    form,
    latestVersionId,
    loadAttempt,
    mode,
    t,
    templateId,
  ]);

  const openFile = useCallback(async (nextFile: File) => {
    setSubmitError("");
    if (!isSupportedTemplateFile(nextFile)) {
      setFileError(t("templateForm.unsupportedFile"));
      return;
    }

    setIsWorkbookLoading(true);
    setFileError("");
    try {
      const workbook = await parseFileToFortuneWorkbook(nextFile);
      setFile(nextFile);
      setWorkbookData(workbook);
      workbookDraftRef.current = workbook;
      setWorkbookDirty(true);
      if (mode === "create" && !form.getValues("templateName").trim()) {
        form.setValue("templateName", templateNameFromFile(nextFile.name), {
          shouldDirty: true,
          shouldValidate: true,
        });
      }
    } catch {
      setFileError(t("templateForm.fileOpenError"));
    } finally {
      setIsWorkbookLoading(false);
    }
  }, [form, mode, t]);

  const createBlankWorkbook = useCallback(() => {
    const blankFile = new File([], t("templateForm.blankFileName"), {
      type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    });
    const blankWorkbook = createFortuneWorkbookFromRows(t("templateForm.blankSheetName"), [[""]]);
    setFile(blankFile);
    setWorkbookData(blankWorkbook);
    workbookDraftRef.current = blankWorkbook;
    setWorkbookDirty(true);
    setFileError("");
    setSubmitError("");
    form.setValue("templateName", "", {
      shouldDirty: true,
      shouldValidate: false,
    });
    form.clearErrors("templateName");
  }, [form, t]);

  const markWorkbookDirty = useCallback(() => {
    setWorkbookDirty(true);
    setSubmitError("");
  }, []);

  function clearFile() {
    setFile(null);
    setWorkbookData(null);
    workbookDraftRef.current = null;
    setWorkbookDirty(true);
    setFileError("");
    setSubmitError("");
  }

  function requestRemoveFile() {
    setConfirmationIntent("remove-file");
  }

  function leaveEditor() {
    skipNavigationBlockRef.current = true;
    setWorkbookDirty(false);
    form.reset(form.getValues());
    if (onExit) onExit();
    else navigate("/ingestion/excel-templates");
  }

  function requestExit() {
    if (isSubmitting) return;
    if (hasUnsavedChanges) setConfirmationIntent("exit");
    else leaveEditor();
  }

  function cancelConfirmation() {
    setConfirmationIntent(null);
    if (navigationBlocker.state === "blocked") navigationBlocker.reset();
  }

  function confirmAction() {
    const intent = activeConfirmationIntent;
    setConfirmationIntent(null);
    if (intent === "remove-file") {
      clearFile();
      return;
    }

    skipNavigationBlockRef.current = true;
    setWorkbookDirty(false);
    form.reset(form.getValues());
    if (navigationBlocker.state === "blocked") navigationBlocker.proceed();
    else navigate("/ingestion/excel-templates");
  }

  function retryInitialLoad() {
    initializedTemplateRef.current = "";
    setHasInitializedEdit(false);
    setInitialLoadError("");
    setLoadAttempt((attempt) => attempt + 1);
    void editTemplateQuery.refetch();
    void editTemplateFileQuery.refetch();
  }

  async function submitTemplate() {
    await form.handleSubmit(async (values) => {
      if (!file || !workbookData || !selectedUnitCode || isSubmitting) return;
      setSubmitError("");

      const committedWorkbook = await workbookRef.current?.commitAndGetSnapshot()
        ?? workbookDraftRef.current
        ?? workbookData;
      if (!committedWorkbook) {
        setSubmitError(t("templateForm.fileOpenError"));
        return;
      }

      workbookDraftRef.current = committedWorkbook;
      setWorkbookData(committedWorkbook);
      try {
        const submissionFile = await createFileFromFortuneWorkbook(
          committedWorkbook,
          file,
          values.templateName,
        );
        if (mode === "edit") {
          if (!templateId) {
            setSubmitError(t("templateForm.missingId"));
            return;
          }
          const currentTemplate = editTemplateQuery.data;
          await updateTemplateMutation.mutateAsync({
            templateId,
            templateName: values.templateName.trim(),
            unitCode: selectedUnitCode,
            ministryIds: values.ministryIds,
            description: currentTemplate?.description,
            indicatorIds: currentTemplate?.indicator_ids,
          });
          await createTemplateVersionMutation.mutateAsync({
            templateId,
            file: submissionFile,
          });
          setFile(submissionFile);
          form.reset(values);
          setWorkbookDirty(false);
          if (onSaved) {
            skipNavigationBlockRef.current = false;
            onSaved(values.templateName.trim());
            return;
          }
          skipNavigationBlockRef.current = true;
          navigate("/ingestion/excel-templates", {
            replace: true,
            state: { notice: t("templateForm.updatedNotice", { name: values.templateName.trim() }) },
          });
          return;
        }

        const receipt = await createTemplateMutation.mutateAsync({
          unit: selectedUnitCode,
          templateName: values.templateName.trim(),
          ministryIds: values.ministryIds,
          file: submissionFile,
        });
        skipNavigationBlockRef.current = true;
        form.reset(values);
        setWorkbookDirty(false);
        navigate("/ingestion/excel-templates", {
          replace: true,
          state: { notice: t("templateForm.createdNotice", { name: receipt.template_name }) },
        });
      } catch (error) {
        const message = error instanceof Error
          ? error.message
          : mode === "edit" ? t("templateForm.updateError") : t("templateForm.submitError");
        setSubmitError(message);
        toast.error(message);
      }
    })();
  }

  const queryLoadFailed = mode === "edit" && (
    !templateId
    || editTemplateQuery.isError
    || (editTemplateQuery.isSuccess && !latestVersionId)
    || editTemplateFileQuery.isError
  );
  const loadError = initialLoadError || (queryLoadFailed
    ? templateId ? t("templateForm.loadError") : t("templateForm.missingId")
    : "");
  const isInitialLoading = mode === "edit" && !hasInitializedEdit && !loadError;
  const canSubmit = Boolean(
    file
    && workbookData
    && selectedUnitCode
    && form.formState.isValid
    && (mode === "create" || hasUnsavedChanges)
    && !isWorkbookLoading
    && !isSubmitting,
  );

  return {
    canSubmit,
    confirmationIntent: activeConfirmationIntent,
    file,
    fileError,
    form,
    hasUnsavedChanges,
    isInitialLoading,
    isSubmitting,
    isWorkbookLoading,
    loadError,
    markWorkbookDirty,
    openFile,
    createBlankWorkbook,
    requestExit,
    requestRemoveFile,
    retryInitialLoad,
    cancelConfirmation,
    confirmAction,
    submitError,
    submitTemplate,
    workbookData,
    workbookRef,
  };
}
