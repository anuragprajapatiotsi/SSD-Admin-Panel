import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import type {
  CreateRequestPeriodCollectionPayload,
  CollectionActivityFilters,
  CollectionActivityPreviewParams,
  UpdateRequestPeriodCollectionPayload,
  CreateRepositoryTemplatePayload,
  CreateDispatchBatchPayload,
  CreateTemplateDispatchPayload,
  JourneyActionPayload,
  PaginatedQuery,
  PublicAccessTokenPayload,
  PublicAssignmentPayload,
  PublicOtpPayload,
  PublicVerifyPayload,
  PublicWorkbookSubmissionPayload,
  ReviewDecisionPayload,
  RequestPeriodCollectionFilters,
  StartJourneyPayload,
  StartDirectJourneyPayload,
  TemplateRepositoryFilters,
  UploadRepositoryVersionPayload,
  WorkbookSubmissionPayload,
} from "../api/template-workflow.api";
import { templateWorkflowService } from "../services/template-workflow.service";
import { directIngestionService } from "@/services/direct-ingestion.service";
import { isDirectProcessing } from "@/hooks/use-direct-ingestion";
import type { DirectPreview } from "@/api/direct-ingestion.api";

export const templateWorkflowKeys = {
  all: ["template-workflow"] as const,
  templates: (filters: TemplateRepositoryFilters = {}) =>
    [...templateWorkflowKeys.all, "templates", filters] as const,
  template: (templateId: string) => [...templateWorkflowKeys.all, "template", templateId] as const,
  templateVersions: (templateId: string) =>
    [...templateWorkflowKeys.template(templateId), "versions"] as const,
  templateVersion: (versionId: string) =>
    [...templateWorkflowKeys.all, "template-version", versionId] as const,
  composeContext: (templateId: string, versionId: string, locale?: string) =>
    [...templateWorkflowKeys.all, "compose-context", templateId, versionId, locale] as const,
  collections: (filters: RequestPeriodCollectionFilters = {}) =>
    [...templateWorkflowKeys.all, "request-period-collections", filters] as const,
  collection: (requestPeriodCode: string, unitCode?: string, locale?: string) =>
    [...templateWorkflowKeys.all, "request-period-collection", requestPeriodCode, unitCode, locale] as const,
  dispatchBatch: (batchCode: string, unitCode?: string, locale?: string) =>
    [...templateWorkflowKeys.all, "dispatch-batch", batchCode, unitCode, locale] as const,
  dispatchPlans: (params: PaginatedQuery) =>
    [...templateWorkflowKeys.all, "dispatch-plans", params] as const,
  dispatchPlan: (planCode: string, unitCode: string) =>
    [...templateWorkflowKeys.all, "dispatch-plan", planCode, unitCode] as const,
  dispatchRuns: (params: PaginatedQuery & { dispatchPlanCode?: string }) =>
    [...templateWorkflowKeys.all, "dispatch-runs", params] as const,
  dispatchRun: (runCode: string, unitCode: string) =>
    [...templateWorkflowKeys.all, "dispatch-run", runCode, unitCode] as const,
  submissions: (params: PaginatedQuery) =>
    [...templateWorkflowKeys.all, "submissions", params] as const,
  accessLinks: (params: PaginatedQuery & { dispatchRunCode?: string; includeLink?: boolean }) =>
    [...templateWorkflowKeys.all, "access-links", params] as const,
  reviewContext: (runCode: string, runItemCode: string, locale?: string) =>
    [...templateWorkflowKeys.all, "review-context", runCode, runItemCode, locale] as const,
  reviewContexts: (runCode: string, runItemCode: string) =>
    [...templateWorkflowKeys.all, "review-context", runCode, runItemCode] as const,
  journey: (jobCode: string, unitCode: string) =>
    [...templateWorkflowKeys.all, "journey", jobCode, unitCode] as const,
  actionContext: (jobCode: string, unitCode: string, sheetIdentity?: string) =>
    [...templateWorkflowKeys.journey(jobCode, unitCode), "action-context", sheetIdentity] as const,
  collectionActivities: (filters: CollectionActivityFilters) =>
    [...templateWorkflowKeys.all, "collection-activities", filters] as const,
  collectionActivityPreview: (params: CollectionActivityPreviewParams) =>
    [...templateWorkflowKeys.all, "collection-activity-preview", params] as const,
  workspace: (resource: string, id: string, params: unknown) =>
    [...templateWorkflowKeys.all, "workspace", resource, id, params] as const,
};

export function useWorkflowTemplates(filters: TemplateRepositoryFilters = {}, enabled = true) {
  return useQuery({
    queryKey: templateWorkflowKeys.templates(filters),
    queryFn: () => templateWorkflowService.templates.list(filters),
    enabled,
    placeholderData: (previous) => previous,
  });
}

export function useWorkflowTemplate(templateId?: string, enabled = true) {
  return useQuery({
    queryKey: templateWorkflowKeys.template(templateId ?? ""),
    queryFn: () => templateWorkflowService.templates.get(templateId!),
    enabled: enabled && Boolean(templateId),
  });
}

export function useWorkflowTemplateVersions(templateId?: string, enabled = true) {
  return useQuery({
    queryKey: templateWorkflowKeys.templateVersions(templateId ?? ""),
    queryFn: () => templateWorkflowService.templates.listVersions(templateId!),
    enabled: enabled && Boolean(templateId),
  });
}

export function useWorkflowTemplateVersion(versionId?: string, enabled = true) {
  return useQuery({
    queryKey: templateWorkflowKeys.templateVersion(versionId ?? ""),
    queryFn: () => templateWorkflowService.templates.getVersion(versionId!),
    enabled: enabled && Boolean(versionId),
  });
}

export function useComposeContext(templateId?: string, versionId?: string, locale?: string) {
  return useQuery({
    queryKey: templateWorkflowKeys.composeContext(templateId ?? "", versionId ?? "", locale),
    queryFn: () => templateWorkflowService.dispatches.getComposeContext(templateId!, versionId!, locale),
    enabled: Boolean(templateId && versionId),
  });
}

export function useRequestPeriodCollections(
  filters: RequestPeriodCollectionFilters = {},
  enabled = true,
) {
  return useQuery({
    queryKey: templateWorkflowKeys.collections(filters),
    queryFn: () => templateWorkflowService.dispatches.listCollections(filters),
    enabled,
    placeholderData: (previous) => previous,
  });
}

export function useRequestPeriodCollection(
  requestPeriodCode?: string,
  unitCode?: string,
  locale?: string,
  enabled = true,
) {
  return useQuery({
    queryKey: templateWorkflowKeys.collection(requestPeriodCode ?? "", unitCode, locale),
    queryFn: () => templateWorkflowService.dispatches.getCollection(requestPeriodCode!, unitCode, locale),
    enabled: enabled && Boolean(requestPeriodCode),
  });
}

export function useCreateRequestPeriodCollection() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      payload,
      locale,
    }: {
      payload: CreateRequestPeriodCollectionPayload;
      locale?: string;
    }) => templateWorkflowService.dispatches.createCollection(payload, locale),
    onSuccess: () => client.invalidateQueries({ queryKey: templateWorkflowKeys.all }),
  });
}

export function useUpdateRequestPeriodCollection() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      collectionCode,
      unitCode,
      payload,
    }: {
      collectionCode: string;
      unitCode: string;
      payload: UpdateRequestPeriodCollectionPayload;
    }) => templateWorkflowService.dispatches.updateCollection(collectionCode, unitCode, payload),
    onSuccess: () => client.invalidateQueries({ queryKey: templateWorkflowKeys.all }),
  });
}

export function useDeleteRequestPeriodCollection() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ collectionCode, unitCode }: { collectionCode: string; unitCode: string }) =>
      templateWorkflowService.dispatches.deleteCollection(collectionCode, unitCode),
    onSuccess: () => client.invalidateQueries({ queryKey: templateWorkflowKeys.all }),
  });
}

export function useWorkflowDispatchBatch(
  batchCode?: string,
  unitCode?: string,
  locale?: string,
  options: { enabled?: boolean; poll?: boolean } = {},
) {
  return useQuery({
    queryKey: templateWorkflowKeys.dispatchBatch(batchCode ?? "", unitCode, locale),
    queryFn: () => templateWorkflowService.dispatches.getBatch(batchCode!, unitCode, locale),
    enabled: (options.enabled ?? true) && Boolean(batchCode),
    refetchInterval: options.poll
        ? (query) => {
          const items = query.state.data?.items;
          const isTerminal = items?.length
            ? items.every((item) => item.itemStatus === "SUCCEEDED" || item.itemStatus === "FAILED")
            : false;
          return isTerminal ? false : 2_000;
        }
      : false,
  });
}

export function useWorkflowDispatchPlans(params: PaginatedQuery, enabled = true) {
  return useQuery({
    queryKey: templateWorkflowKeys.dispatchPlans(params),
    queryFn: () => templateWorkflowService.dispatches.listPlans(params),
    enabled: enabled && Boolean(params.unitCode),
    placeholderData: (previous) => previous,
  });
}

export function useWorkflowDispatchPlan(planCode: string | undefined, unitCode: string, enabled = true) {
  return useQuery({
    queryKey: templateWorkflowKeys.dispatchPlan(planCode ?? "", unitCode),
    queryFn: () => templateWorkflowService.dispatches.getPlan(planCode!, unitCode),
    enabled: enabled && Boolean(planCode && unitCode),
  });
}

export function useWorkflowDispatchRuns(
  params: PaginatedQuery & { dispatchPlanCode?: string },
  enabled = true,
) {
  return useQuery({
    queryKey: templateWorkflowKeys.dispatchRuns(params),
    queryFn: () => templateWorkflowService.dispatches.listRuns(params),
    enabled: enabled && Boolean(params.unitCode),
    placeholderData: (previous) => previous,
  });
}

export function useWorkflowDispatchRun(runCode: string | undefined, unitCode: string, enabled = true) {
  return useQuery({
    queryKey: templateWorkflowKeys.dispatchRun(runCode ?? "", unitCode),
    queryFn: () => templateWorkflowService.dispatches.getRun(runCode!, unitCode),
    enabled: enabled && Boolean(runCode && unitCode),
  });
}

export function useWorkflowSubmissions(params: PaginatedQuery, enabled = true) {
  return useQuery({
    queryKey: templateWorkflowKeys.submissions(params),
    queryFn: () => templateWorkflowService.dispatches.listSubmissions(params),
    enabled: enabled && Boolean(params.unitCode),
    placeholderData: (previous) => previous,
  });
}

export function useWorkflowAccessLinks(
  params: PaginatedQuery & { dispatchRunCode?: string; includeLink?: boolean },
  enabled = true,
) {
  return useQuery({
    queryKey: templateWorkflowKeys.accessLinks(params),
    queryFn: () => templateWorkflowService.dispatches.listAccessLinks(params),
    enabled: enabled && Boolean(params.unitCode),
  });
}

export function useWorkflowReviewContext(
  runCode?: string,
  runItemCode?: string,
  locale?: string,
  enabled = true,
) {
  return useQuery({
    queryKey: templateWorkflowKeys.reviewContext(runCode ?? "", runItemCode ?? "", locale),
    queryFn: () => templateWorkflowService.review.getContext(runCode!, runItemCode!, locale),
    enabled: enabled && Boolean(runCode && runItemCode),
  });
}

export function useWorkflowJourney(
  jobCode: string | undefined,
  unitCode: string,
  options: { enabled?: boolean; poll?: boolean } = {},
) {
  return useQuery({
    queryKey: templateWorkflowKeys.journey(jobCode ?? "", unitCode),
    queryFn: () => templateWorkflowService.journeys.get(jobCode!, unitCode),
    enabled: (options.enabled ?? true) && Boolean(jobCode && unitCode),
    refetchInterval: options.poll
      ? (query) => query.state.data?.terminal === true || query.state.data?.currentStage === "COMPLETE" ? false : 2_000
      : false,
    refetchIntervalInBackground: false,
  });
}

export function useCollectionActivities(filters: CollectionActivityFilters, enabled = true, refetchInterval: number | false = false) {
  return useQuery({
    queryKey: templateWorkflowKeys.collectionActivities(filters),
    queryFn: () => templateWorkflowService.journeys.listCollectionActivities(filters),
    enabled: enabled && Boolean(filters.collectionCode && filters.unitCode),
    placeholderData: (previous) => previous,
    refetchInterval,
    refetchIntervalInBackground: false,
  });
}

export function useCollectionActivityPreview(params: CollectionActivityPreviewParams, enabled = true, publicationQueued = false) {
  return useQuery({
    queryKey: templateWorkflowKeys.collectionActivityPreview(params),
    queryFn: () => params.originType === "DIRECT"
      ? directIngestionService.preview(params.activityCode, params.submissionVersion!, params.unitCode, params.locale)
      : templateWorkflowService.journeys.previewCollectionActivity(params),
    // Preserve the same version's review panel while paging; never show another assignment's evidence.
    placeholderData: (previous, previousQuery) => {
      if (params.originType !== "REQUEST" || !previous || !previousQuery) return undefined;
      const prior = previousQuery.queryKey[previousQuery.queryKey.length - 1] as CollectionActivityPreviewParams;
      return prior.originType === "REQUEST" && prior.activityCode === params.activityCode
        && prior.collectionCode === params.collectionCode && prior.unitCode === params.unitCode
        && prior.locale === params.locale && prior.submissionVersion === params.submissionVersion
        ? previous : undefined;
    },
    enabled: enabled && Boolean(
      params.collectionCode
      && params.originType
      && params.activityCode
      && params.unitCode
      && (params.originType !== "DIRECT" || params.submissionVersion)
    ),
    refetchInterval: (query) => {
      if (params.originType !== "DIRECT") return false;
      const preview = query.state.data?.data as DirectPreview | undefined;
      const detail = preview?.statusDetail;
      const published = detail?.status === "COMPLETED" && preview?.publication?.lineageComplete === true;
      if (detail?.status === "FAILED" || published) return false;
      if (publicationQueued || detail?.status === "COMPLETED" || isDirectProcessing(detail?.status, detail?.terminal)) return 2000;
      return ["WAITING_FOR_REVIEW", "WAITING_FOR_FACT_REVIEW", "READY_TO_FREEZE"].includes(detail?.currentPhase ?? "") ? 5000 : false;
    },
  });
}

export function useWorkflowActionContext(
  jobCode: string | undefined,
  unitCode: string,
  sheetIdentity?: string,
  enabled = true,
) {
  return useQuery({
    queryKey: templateWorkflowKeys.actionContext(jobCode ?? "", unitCode, sheetIdentity),
    queryFn: () => templateWorkflowService.journeys.getActionContext(jobCode!, unitCode, sheetIdentity),
    enabled: enabled && Boolean(jobCode && unitCode),
  });
}

export function useQualityReview(resultId: string | undefined, unitCode: string, enabled = true) {
  return useQuery({
    queryKey: templateWorkflowKeys.workspace("quality", resultId ?? "", unitCode),
    queryFn: () => templateWorkflowService.workspaces.getQualityReview(resultId!, unitCode),
    enabled: enabled && Boolean(resultId && unitCode),
  });
}

export function useTransformEntities(
  resultId: string | undefined,
  params: PaginatedQuery & { entityType?: string },
  enabled = true,
) {
  return useQuery({
    queryKey: templateWorkflowKeys.workspace("entities", resultId ?? "", params),
    queryFn: () => templateWorkflowService.workspaces.listEntities(resultId!, params),
    enabled: enabled && Boolean(resultId && params.unitCode),
    placeholderData: (previous) => previous,
  });
}

export function useTransformRecords(
  resultId: string | undefined,
  params: PaginatedQuery & { sourceType?: string },
  enabled = true,
) {
  return useQuery({
    queryKey: templateWorkflowKeys.workspace("records", resultId ?? "", params),
    queryFn: () => templateWorkflowService.workspaces.listRecords(resultId!, params),
    enabled: enabled && Boolean(resultId && params.unitCode),
    placeholderData: (previous) => previous,
  });
}

export function useTransformSourceEvidence(resultId: string | undefined, unitCode: string, enabled = true) {
  return useQuery({
    queryKey: templateWorkflowKeys.workspace("source-evidence", resultId ?? "", unitCode),
    queryFn: () => templateWorkflowService.workspaces.getSourceEvidence(resultId!, unitCode),
    enabled: enabled && Boolean(resultId && unitCode),
  });
}

export function useMappingRun(mappingRunId: string | undefined, params: PaginatedQuery, enabled = true) {
  return useQuery({
    queryKey: templateWorkflowKeys.workspace("mapping-run", mappingRunId ?? "", params),
    queryFn: () => templateWorkflowService.workspaces.getMappingRun(mappingRunId!, params),
    enabled: enabled && Boolean(mappingRunId && params.unitCode),
    placeholderData: (previous) => previous,
  });
}

export function useWorkflowDataFields(
  params: PaginatedQuery & { search?: string; valueType?: string },
  enabled = true,
) {
  return useQuery({
    queryKey: templateWorkflowKeys.workspace("data-fields", "list", params),
    queryFn: () => templateWorkflowService.workspaces.listDataFields(params),
    enabled: enabled && Boolean(params.unitCode),
    placeholderData: (previous) => previous,
  });
}

export function useWorkflowDatasets(unitCode: string, enabled = true) {
  return useQuery({
    queryKey: templateWorkflowKeys.workspace("datasets", "list", unitCode),
    queryFn: () => templateWorkflowService.workspaces.listDatasets(unitCode),
    enabled: enabled && Boolean(unitCode),
  });
}

export function useCandidateSet(candidateSetId: string | undefined, params: PaginatedQuery, enabled = true) {
  return useQuery({
    queryKey: templateWorkflowKeys.workspace("candidate-set", candidateSetId ?? "", params),
    queryFn: () => templateWorkflowService.workspaces.getCandidateSet(candidateSetId!, params),
    enabled: enabled && Boolean(candidateSetId && params.unitCode),
    placeholderData: (previous) => previous,
  });
}

export function useValidationRun(
  validationRunId: string | undefined,
  params: PaginatedQuery & { outcome?: string },
  enabled = true,
) {
  return useQuery({
    queryKey: templateWorkflowKeys.workspace("validation-run", validationRunId ?? "", params),
    queryFn: () => templateWorkflowService.workspaces.getValidationRun(validationRunId!, params),
    enabled: enabled && Boolean(validationRunId && params.unitCode),
    placeholderData: (previous) => previous,
  });
}

export function usePublicationApproval(approvalRequestId: string | undefined, unitCode: string, enabled = true) {
  return useQuery({
    queryKey: templateWorkflowKeys.workspace("publication-approval", approvalRequestId ?? "", unitCode),
    queryFn: () => templateWorkflowService.workspaces.getPublicationApproval(approvalRequestId!, unitCode),
    enabled: enabled && Boolean(approvalRequestId && unitCode),
  });
}

export function useWorkflowPublication(
  publicationId: string | undefined,
  params: PaginatedQuery,
  enabled = true,
) {
  return useQuery({
    queryKey: templateWorkflowKeys.workspace("publication", publicationId ?? "", params),
    queryFn: () => templateWorkflowService.workspaces.getPublication(publicationId!, params),
    enabled: enabled && Boolean(publicationId && params.unitCode),
    placeholderData: (previous) => previous,
  });
}

export function useCreateWorkflowTemplate() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRepositoryTemplatePayload) => templateWorkflowService.templates.create(payload),
    onSuccess: () => client.invalidateQueries({ queryKey: templateWorkflowKeys.all }),
  });
}

export function useUploadWorkflowTemplateVersion() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ templateId, payload }: { templateId: string; payload: UploadRepositoryVersionPayload }) =>
      templateWorkflowService.templates.uploadVersion(templateId, payload),
    onSuccess: (_data, { templateId }) =>
      client.invalidateQueries({ queryKey: templateWorkflowKeys.template(templateId) }),
  });
}

export function useDownloadWorkflowTemplate() {
  return useMutation({ mutationFn: (templateId: string) => templateWorkflowService.templates.download(templateId) });
}

export function useDownloadWorkflowTemplateVersion() {
  return useMutation({ mutationFn: (versionId: string) => templateWorkflowService.templates.downloadVersion(versionId) });
}

export function useCreateWorkflowDispatch() {
  const client = useQueryClient();
  return useMutation({
    retry: false,
    mutationFn: ({ payload, locale }: { payload: CreateTemplateDispatchPayload; locale?: string }) =>
      templateWorkflowService.dispatches.create(payload, locale),
    onSuccess: () => client.invalidateQueries({ queryKey: templateWorkflowKeys.all }),
  });
}

export function useCreateWorkflowDispatchBatch() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ payload, locale }: { payload: CreateDispatchBatchPayload; locale?: string }) =>
      templateWorkflowService.dispatches.createBatch(payload, locale),
    onSuccess: (batch, { payload, locale }) => {
      client.setQueryData(
        templateWorkflowKeys.dispatchBatch(batch.batchCode, payload.unit_code, locale),
        batch,
      );
      return client.invalidateQueries({ queryKey: templateWorkflowKeys.all });
    },
  });
}

export function useProviderPreview() {
  return useMutation({ gcTime: 0, mutationFn: (payload: PublicAccessTokenPayload) => templateWorkflowService.provider.preview(payload) });
}

export function useProviderOtp() {
  return useMutation({ gcTime: 0, mutationFn: (payload: PublicOtpPayload) => templateWorkflowService.provider.requestOtp(payload) });
}

export function useProviderVerify() {
  return useMutation({ gcTime: 0, mutationFn: (payload: PublicVerifyPayload) => templateWorkflowService.provider.verifyOtp(payload) });
}

export function useProviderAssignment() {
  return useMutation({
    gcTime: 0,
    mutationFn: (payload: PublicAssignmentPayload) => templateWorkflowService.provider.selectAssignment(payload),
  });
}

export function useDownloadProviderSourceTemplate() {
  return useMutation({
    gcTime: 0,
    mutationFn: (payload: PublicAssignmentPayload) => templateWorkflowService.provider.downloadSourceTemplate(payload),
  });
}

export function useSaveProviderWorkbook() {
  return useMutation({
    gcTime: 0,
    retry: false,
    mutationFn: ({ mode, payload }: { mode: "draft" | "submit"; payload: PublicWorkbookSubmissionPayload }) =>
      templateWorkflowService.provider.saveWorkbook(mode, payload),
  });
}

export function useSaveSelfWorkbook() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({
      mode,
      runCode,
      runItemCode,
      payload,
    }: {
      mode: "draft" | "submit";
      runCode: string;
      runItemCode: string;
      payload: WorkbookSubmissionPayload;
    }) => templateWorkflowService.review.saveSelfWorkbook(mode, runCode, runItemCode, payload),
    onSuccess: () => client.invalidateQueries({ queryKey: templateWorkflowKeys.all }),
  });
}

export function useWorkflowReviewDecision() {
  const client = useQueryClient();
  return useMutation({
    retry: false,
    mutationFn: ({
      runCode,
      runItemCode,
      payload,
    }: {
      runCode: string;
      runItemCode: string;
      payload: ReviewDecisionPayload;
    }) => templateWorkflowService.review.decide(runCode, runItemCode, payload),
    onSuccess: (_data, { runCode, runItemCode }) =>
      client.invalidateQueries({ queryKey: templateWorkflowKeys.reviewContexts(runCode, runItemCode) }),
  });
}

export function useStartWorkflowJourney() {
  const client = useQueryClient();
  return useMutation({
    retry: false,
    mutationFn: (payload: StartJourneyPayload) => templateWorkflowService.journeys.start(payload),
    onSuccess: (journey, payload) => {
      client.setQueryData(templateWorkflowKeys.journey(journey.jobCode, payload.unit_code), journey);
    },
  });
}

export function useStartDirectWorkflowJourney() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (payload: StartDirectJourneyPayload) =>
      templateWorkflowService.journeys.startDirect(payload),
    onSuccess: (journey, payload) => {
      client.setQueryData(templateWorkflowKeys.journey(journey.jobCode, payload.unit_code), journey);
    },
  });
}

export function useWorkflowJourneyAction() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: ({ jobCode, payload }: { jobCode: string; payload: JourneyActionPayload }) =>
      templateWorkflowService.journeys.act(jobCode, payload),
    onSuccess: async (_data, { jobCode, payload }) => {
      const unitCode = payload.payload.unit_code;
      await Promise.all([
        client.invalidateQueries({ queryKey: templateWorkflowKeys.journey(jobCode, unitCode) }),
        client.invalidateQueries({
          queryKey: templateWorkflowKeys.actionContext(jobCode, unitCode, payload.payload.sheet_identity),
        }),
      ]);
    },
  });
}
