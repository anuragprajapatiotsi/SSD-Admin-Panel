import {
  apiDelete,
  apiGet,
  apiGetBlob,
  apiPatch,
  apiPost,
  apiPostForm,
  apiPublicPost,
  apiPublicPostBlob,
  apiPublicPostForm,
} from "./http-client";
import type { ApiUploadProgress } from "./http-client";
import { getLatestSubmission } from "@/utils/submission-version";
import { getSelectedLocale } from "./session.api";
import type { RequestAccessPreview, RequestAccessOtpResponse, RequestAccessVerified, RequestAccessSessionDetail } from "./requests.api";

export type ApiEnvelope<T> = {
  data: T;
  count?: number;
  locale?: string;
};

export type WorkflowRecord = Record<string, unknown>;
export type WorkflowList<T = WorkflowRecord> = ApiEnvelope<T[]>;

export type TemplateRepositoryFilters = {
  unitCode?: string;
  status?: string;
  searchText?: string;
  locale?: string;
  ministryIds?: string[];
};

export type CreateRepositoryTemplatePayload = {
  template_name: string;
  unit_code: string;
  ministry_ids: string[];
  description?: string | null;
  indicator_ids?: string[] | null;
  status?: string;
};

export type UploadRepositoryVersionPayload = {
  file: File;
  versionNotes?: string;
  locale?: string;
};

export type TemplateDispatchComposeOfficer = {
  email: string;
  designation?: string | null;
  displayName?: string | null;
  officerCode?: string | null;
  suggestedCc?: string[];
};

export type TemplateDispatchComposeOrganization = {
  organizationId: string;
  organizationCode?: string | null;
  organizationName?: string | null;
  organizationType?: string | null;
  parentOrganizationName?: string | null;
  parentOrganizationType?: string | null;
  officers?: TemplateDispatchComposeOfficer[];
  suggestedTo?: string[];
  suggestedCc?: string[];
  suggestedBcc?: string[];
};

export type TemplateDispatchComposeContext = {
  templateId: string;
  templateVersionId: string;
  templateName?: string;
  originalFileName?: string;
  indicators?: Array<{
    indicatorNumber?: string | null;
    indicatorName?: string | null;
    indicatorCode?: string | null;
  }>;
  organizations: TemplateDispatchComposeOrganization[];
  notification?: {
    subject?: string;
    body?: string;
    editable?: {
      to?: boolean;
      cc?: boolean;
      bcc?: boolean;
      subject?: boolean;
      body?: boolean;
    };
  };
  dispatchDefaults?: {
    dispatchMode?: "PROVIDER" | "SELF";
    planName?: string;
  };
};

export type DispatchRecipient = {
  recipient_key: string;
  source_organization_id: string;
  source_organization_code: string;
  source_name: string;
  to: string[];
  cc: string[];
  bcc: string[];
  indicator_code?: string | null;
  measure_codes?: string[];
};

type TemplateDispatchCollectionReference =
  | {
      request_period_code: string;
      request_period_label?: never;
    }
  | {
      request_period_code?: never;
      request_period_label: string;
    };

export type CreateTemplateDispatchPayload = {
  template_id: string;
  template_version_id: string;
  unit_code: string;
  dispatch_mode: "PROVIDER" | "SELF";
  schedule_start_date?: string;
  due_date?: string;
  reporting_period_mode?: string;
  reporting_period_start_code?: string | null;
  dispatch_policy_code?: string | null;
  recipients: DispatchRecipient[];
  notification?: { subject: string; body: string };
  client_request_id?: string;
  plan_name?: string;
  year_period?: string;
  created_by_username?: string;
} & TemplateDispatchCollectionReference;

export type RequestPeriodCollectionStatus =
  | "PUBLISHED"
  | "PARTIALLY_PUBLISHED"
  | "COMPLETED_WITH_ERRORS"
  | "READY_TO_PUBLISH"
  | "UNDER_REVIEW"
  | "IN_PROGRESS"
  | "NOT_STARTED";

export type RequestPeriodCollectionIdentity = {
  collectionCode: string;
  collectionLabel: string;
  unitCode: string;
  isActive: boolean;
  labelConflict?: boolean;
};

export type TemplateDispatchResult = WorkflowRecord & {
  dispatchRun: WorkflowRecord & {
    requestPeriodCollection: RequestPeriodCollectionIdentity;
  };
};

export type RequestPeriodCollectionSummary = RequestPeriodCollectionIdentity & {
  yearPeriod: string;
  status: RequestPeriodCollectionStatus;
  templateCount: number;
  assignmentCount: number;
  sentCount: number;
  submittedCount: number;
  approvedCount: number;
  publishedCount: number;
  failedCount: number;
  returnedCount: number;
  reportingPeriodLabels: string[];
  scheduleStartDate?: string | null;
  dueDate?: string | null;
  latestActivityAt?: string | null;
};

export type RequestPeriodCollectionDetail = RequestPeriodCollectionSummary & {
  items: WorkflowRecord[];
  dispatchHistory: WorkflowRecord[];
};

export type CollectionActivityOrigin = "ALL" | "REQUEST" | "DIRECT" | "HISTORICAL";
export type CollectionActivitySource =
  | "ALL"
  | "TEMPLATE"
  | "EXCEL"
  | "CSV"
  | "PDF"
  | "WEB_SCRAPE"
  | "API"
  | "HISTORICAL_PACKAGE";

export type CollectionActivityFilters = {
  collectionCode: string;
  unitCode: string;
  originType?: CollectionActivityOrigin;
  sourceType?: CollectionActivitySource;
  status?: string;
  limit?: number;
  offset?: number;
  locale?: string;
};

export type CollectionActivitySubmission = {
  submissionVersion: number;
  isLatest: boolean;
  fileName: string;
  fileSize: number | null;
  status: string;
  updatedAt: string;
};

export type CollectionActivity = {
  activityCode: string;
  activityLabel: string;
  fileName: string;
  fileSize: number | null;
  originType: Exclude<CollectionActivityOrigin, "ALL"> | string;
  sourceType: Exclude<CollectionActivitySource, "ALL"> | string;
  status: string;
  reportingPeriod: string;
  updatedAt: string;
  directIngestionCode?: string;
  dispatchRunCode?: string;
  runItemCode?: string;
  submissionVersion?: number;
  latestSubmission?: CollectionActivitySubmission;
  submissionHistory?: CollectionActivitySubmission[];
};

export type CollectionActivityList = {
  data: CollectionActivity[];
  totalCount: number;
  limit: number;
  offset: number;
};

export type CollectionActivityPreviewParams = {
  collectionCode: string;
  originType: string;
  activityCode: string;
  unitCode: string;
  submissionVersion?: number;
  sheetIdentity?: string;
  limit?: number;
  offset?: number;
  locale?: string;
};

export type CollectionActivityPreviewResponse = ApiEnvelope<WorkflowRecord>;

export type CreateRequestPeriodCollectionPayload = {
  unit_code: string;
  request_period_label: string;
  year_period: string;
};

export type UpdateRequestPeriodCollectionPayload = Pick<
  CreateRequestPeriodCollectionPayload,
  "request_period_label" | "year_period"
>;

export type CreatedRequestPeriodCollection = RequestPeriodCollectionIdentity & {
  status: "NOT_STARTED";
  templateCount: number;
  assignmentCount: number;
  items: WorkflowRecord[];
  dispatchHistory: WorkflowRecord[];
  created: boolean;
  serverGeneratedCollectionCode: boolean;
};

export type RequestPeriodCollectionFilters = {
  unitCode?: string;
  requestPeriodCode?: string;
  searchText?: string;
  status?: RequestPeriodCollectionStatus;
  includeInactive?: boolean;
  limit?: number;
  offset?: number;
  locale?: string;
};

export type RequestPeriodCollectionList = ApiEnvelope<RequestPeriodCollectionSummary[]> & {
  count: number;
  total_count: number;
  limit: number;
  offset: number;
  locale: string;
};

export type DispatchBatchItemPayload = {
  dispatch_plan_code: string;
  item_label?: string;
  run: {
    unit_code: string;
    request_period_code: string;
    due_date?: string;
  };
};

export type CreateDispatchBatchPayload = {
  batch_name: string;
  unit_code: string;
  items: DispatchBatchItemPayload[];
};

export type DispatchBatchItem = WorkflowRecord & {
  itemStatus?: "QUEUED" | "PROCESSING" | "SUCCEEDED" | "FAILED";
  dispatchRunCode?: string | null;
  errorMessage?: string | null;
};

export type DispatchBatch = WorkflowRecord & {
  batchCode: string;
  batchStatus?: string;
  items?: DispatchBatchItem[];
};

export type PublicAccessTokenPayload = { token: string };
export type PublicOtpPayload = PublicAccessTokenPayload & { email: string };
export type PublicVerifyPayload = PublicOtpPayload & { otp: string };
export type PublicAssignmentPayload = {
  session: string;
  run_item_code?: string;
};

export type WorkbookSubmissionPayload = {
  file: File;
  submissionNote?: string;
};

export type PublicWorkbookSubmissionPayload = WorkbookSubmissionPayload & {
  session: string;
  runItemCode?: string;
  certification?: { accepted: boolean; certificationText: string; ministryMustCertify: boolean };
  evidenceFiles?: File[];
};

export type ReviewDecisionPayload = {
  run_item_code: string;
  submission_version: number;
  action: "APPROVE" | "RETURN";
  approval_level: number;
  comments: string;
};

export type StartJourneyPayload = {
  unit_code: string;
  dispatch_run_code: string;
  run_item_code: string;
  submission_version: number;
};

export type StartDirectJourneyPayload = {
  unit_code: string;
  request_period_code: string;
  source_type?: "EXCEL";
  file: File;
  onUploadProgress?: (progress: ApiUploadProgress) => void;
};

export type JourneySheet = {
  sheetIdentity: string;
  currentStage: string;
  nextActions: string[];
  terminal: boolean;
  transformation?: { runId?: string; resultId?: string } | null;
  mapping?: WorkflowRecord | null;
  candidateSet?: WorkflowRecord | null;
  validation?: WorkflowRecord | null;
  approval?: WorkflowRecord | null;
  publication?: WorkflowRecord | null;
  lineage?: WorkflowRecord | null;
};

export type Journey = WorkflowRecord & {
  jobCode: string;
  journeyPath?: string;
  currentStage?: string;
  nextActions?: string[];
  sheetCount?: number;
  completedSheetCount?: number;
  sheets?: JourneySheet[];
};

export type JourneyAction =
  | "RECORD_QUALITY_DECISION"
  | "START_MAPPING_RUN"
  | "MAP_EXISTING_MASTER"
  | "CREATE_MAPPING_TASK"
  | "REFRESH_MAPPING_RUN"
  | "PROMOTE_DATA_FIELD"
  | "PROMOTE_UOM"
  | "PREPARE_DATASET"
  | "START_CANDIDATE_SET"
  | "ADD_CANDIDATE"
  | "ADD_CANDIDATE_DIMENSION"
  | "BUILD_CANDIDATES"
  | "SEAL_CANDIDATE_SET"
  | "START_VALIDATION"
  | "ADD_VALIDATION_RESULT"
  | "COMPLETE_VALIDATION"
  | "RUN_VALIDATION"
  | "REQUEST_PUBLICATION_APPROVAL"
  | "DECIDE_PUBLICATION"
  | "PUBLISH"
  | "PROCESS_LINEAGE"
  | "TRACE_LINEAGE";

export type JourneyActionPayload = {
  action: JourneyAction;
  payload: {
    unit_code: string;
    sheet_identity?: string;
    [key: string]: unknown;
  };
};

export type PaginatedQuery = {
  unitCode: string;
  limit?: number;
  offset?: number;
};

function query(values: Record<string, string | number | boolean | undefined | null | string[]>): string {
  const params = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") return;
    if (Array.isArray(value)) {
      value.forEach((item) => params.append(key, item));
      return;
    }
    params.set(key, String(value));
  });
  const serialized = params.toString();
  return serialized ? `?${serialized}` : "";
}

function submissionForm(payload: WorkbookSubmissionPayload): FormData {
  const form = new FormData();
  form.set("file", payload.file);
  if (payload.submissionNote?.trim()) form.set("submission_note", payload.submissionNote.trim());
  return form;
}

function directJourneyForm(payload: StartDirectJourneyPayload): FormData {
  const form = new FormData();
  form.set("unit_code", payload.unit_code);
  form.set("request_period_code", payload.request_period_code);
  form.set("source_type", payload.source_type ?? "EXCEL");
  form.set("file", payload.file);
  return form;
}

function recordText(record: WorkflowRecord, ...keys: string[]) {
  for (const key of keys) {
    const value = record[key];
    if (typeof value === "string" && value.trim()) return value;
    if (typeof value === "number") return String(value);
  }
  return "";
}

function recordObject(record: WorkflowRecord, key: string): WorkflowRecord {
  const value = record[key];
  return value && typeof value === "object" && !Array.isArray(value)
    ? value as WorkflowRecord
    : {};
}

function normalizeActivitySubmission(value: unknown): CollectionActivitySubmission | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const record = value as WorkflowRecord;
  const version = record.submissionVersion;
  if (typeof version !== "number" || !Number.isInteger(version) || version < 1) return undefined;
  const source = recordObject(record, "source");
  const artifact = recordObject(record, "artifact");
  const statusDetail = recordObject(record, "statusDetail");
  const size = record.sourceByteSize ?? source.sourceByteSize ?? artifact.byteSize;
  return {
    submissionVersion: version,
    isLatest: record.isLatest === true,
    fileName: recordText(record, "originalFileName") || recordText(source, "originalFileName") || recordText(artifact, "originalFileName"),
    fileSize: typeof size === "number" ? size : null,
    status: recordText(statusDetail, "status") || recordText(record, "lifecycleStatus", "status", "submissionStatus", "processingStatus", "journeyStatus"),
    updatedAt: recordText(statusDetail, "updatedAt") || recordText(record, "updatedAt", "submittedAt"),
  };
}

function normalizeCollectionActivity(record: WorkflowRecord, index: number): CollectionActivity {
  const activityCode = recordText(
    record,
    "activityCode",
    "activity_code",
    "jobCode",
    "job_code",
    "dispatchRunCode",
    "dispatch_run_code",
    "packageCode",
    "package_code",
    "id",
  ) || `activity-${index}`;
  const directIngestion = recordObject(record, "directIngestion");
  const directIngestionSnake = recordObject(record, "direct_ingestion");
  const requestDispatch = recordObject(record, "requestDispatch");
  const submissions = record.originType === "REQUEST" ? recordObject(record, "submission") : directIngestion;
  const history = (Array.isArray(submissions.submissionHistory) ? submissions.submissionHistory : [])
    .map(normalizeActivitySubmission).filter((item): item is CollectionActivitySubmission => Boolean(item));
  const latestSubmission = getLatestSubmission(history, normalizeActivitySubmission(submissions.latestSubmission));
  const submissionHistory = [...new Map([...history, ...(latestSubmission ? [latestSubmission] : [])].map((submission) => [submission.submissionVersion, submission])).values()]
    .sort((a, b) => b.submissionVersion - a.submissionVersion)
    .map((submission) => ({ ...submission, isLatest: submission.submissionVersion === latestSubmission?.submissionVersion }));
  const sourceByteSize = latestSubmission?.fileSize ?? directIngestion.sourceByteSize ?? directIngestionSnake.source_byte_size;
  return {
    activityCode,
    activityLabel: recordText(
      record,
      "activityLabel",
      "activity_label",
      "displayName",
      "display_name",
      "displayLabel",
      "display_label",
      "templateName",
      "template_name",
      "fileName",
      "file_name",
      "name",
    ) || recordText(directIngestion, "displayName") || activityCode,
    directIngestionCode: recordText(directIngestion, "directIngestionCode") || undefined,
    dispatchRunCode: recordText(requestDispatch, "dispatchRunCode") || undefined,
    runItemCode: recordText(requestDispatch, "runItemCode") || undefined,
    submissionVersion: latestSubmission?.submissionVersion,
    latestSubmission,
    submissionHistory,
    fileName: latestSubmission?.fileName || recordText(directIngestion, "originalFileName", "original_file_name")
      || recordText(directIngestionSnake, "originalFileName", "original_file_name")
      || recordText(record, "fileName", "file_name"),
    fileSize: typeof sourceByteSize === "number" ? sourceByteSize : null,
    originType: recordText(record, "originType", "origin_type") || "DIRECT",
    sourceType: recordText(record, "sourceType", "source_type") || "EXCEL",
    status: latestSubmission?.status || recordText(record, "status", "currentStatus", "current_status") || "NOT_STARTED",
    reportingPeriod: recordText(
      record,
      "reportingPeriod",
      "reporting_period",
      "reportingPeriodLabel",
      "reporting_period_label",
      "yearPeriod",
      "year_period",
    ),
    updatedAt: latestSubmission?.updatedAt || recordText(
      record,
      "updatedAt",
      "updated_at",
      "latestActivityAt",
      "latest_activity_at",
      "createdAt",
      "created_at",
    ),
  };
}

export const templateWorkflowApi = {
  templates: {
    async list(filters: TemplateRepositoryFilters = {}) {
      const result = await apiGet<WorkflowList>(`/templates/repository${query({
        unit_code: filters.unitCode,
        status: filters.status,
        search_text: filters.searchText?.trim(),
        locale: filters.locale,
        ministry_ids: filters.ministryIds,
      })}`);
      return result.data;
    },
    async get(templateId: string) {
      const result = await apiGet<ApiEnvelope<WorkflowRecord>>(
        `/templates/repository/${encodeURIComponent(templateId)}`,
      );
      return result.data.data;
    },
    async create(payload: CreateRepositoryTemplatePayload) {
      const result = await apiPost<ApiEnvelope<WorkflowRecord>, CreateRepositoryTemplatePayload>(
        "/templates/repository",
        payload,
      );
      return result.data.data;
    },
    download(templateId: string) {
      return apiGetBlob(`/templates/repository/${encodeURIComponent(templateId)}/file`);
    },
    async listVersions(templateId: string) {
      const result = await apiGet<WorkflowList>(
        `/templates/repository/${encodeURIComponent(templateId)}/versions`,
      );
      return result.data;
    },
    async getVersion(versionId: string) {
      const result = await apiGet<ApiEnvelope<WorkflowRecord>>(
        `/templates/repository/versions/${encodeURIComponent(versionId)}`,
      );
      return result.data.data;
    },
    downloadVersion(versionId: string) {
      return apiGetBlob(`/templates/repository/versions/${encodeURIComponent(versionId)}/file`);
    },
    async uploadVersion(templateId: string, payload: UploadRepositoryVersionPayload) {
      const form = new FormData();
      form.set("file", payload.file);
      if (payload.versionNotes?.trim()) form.set("version_notes", payload.versionNotes.trim());
      const result = await apiPostForm<ApiEnvelope<WorkflowRecord>>(
        `/templates/repository/${encodeURIComponent(templateId)}/versions${query({ locale: payload.locale })}`,
        form,
      );
      return result.data.data;
    },
  },

  dispatches: {
    async getComposeContext(templateId: string, templateVersionId: string, locale?: string) {
      const result = await apiGet<ApiEnvelope<TemplateDispatchComposeContext>>(
        `/requests/template-dispatches/context${query({
          template_id: templateId,
          template_version_id: templateVersionId,
          locale,
        })}`,
      );
      return result.data.data;
    },
    async create(payload: CreateTemplateDispatchPayload, locale?: string) {
      const result = await apiPost<ApiEnvelope<TemplateDispatchResult>, CreateTemplateDispatchPayload>(
        `/requests/template-dispatches${query({ locale })}`,
        payload,
        { acceptLanguage: locale },
      );
      return result.data.data;
    },
    async listCollections(filters: RequestPeriodCollectionFilters = {}) {
      const result = await apiGet<RequestPeriodCollectionList>(
        `/requests/request-period-collections${query({
          unit_code: filters.unitCode,
          request_period_code: filters.requestPeriodCode,
          search_text: filters.searchText?.trim(),
          status: filters.status,
          include_inactive: filters.includeInactive,
          limit: filters.limit,
          offset: filters.offset,
          locale: filters.locale,
        })}`,
      );
      return result.data;
    },
    async createCollection(payload: CreateRequestPeriodCollectionPayload, locale?: string) {
      const result = await apiPost<
        ApiEnvelope<CreatedRequestPeriodCollection>,
        CreateRequestPeriodCollectionPayload
      >(`/requests/request-period-collections${query({ locale })}`, payload);
      return result.data.data;
    },
    async updateCollection(
      collectionCode: string,
      unitCode: string,
      payload: UpdateRequestPeriodCollectionPayload,
    ) {
      const result = await apiPatch<
        ApiEnvelope<RequestPeriodCollectionSummary>,
        UpdateRequestPeriodCollectionPayload
      >(
        `/requests/request-period-collections/${encodeURIComponent(collectionCode)}${query({
          unit_code: unitCode,
        })}`,
        payload,
      );
      return result.data.data;
    },
    async deleteCollection(collectionCode: string, unitCode: string) {
      await apiDelete<ApiEnvelope<Record<string, never>>>(
        `/requests/request-period-collections/${encodeURIComponent(collectionCode)}${query({
          unit_code: unitCode,
        })}`,
      );
    },
    async getCollection(requestPeriodCode: string, unitCode?: string, locale?: string) {
      const result = await apiGet<ApiEnvelope<RequestPeriodCollectionDetail>>(
        `/requests/request-period-collections/${encodeURIComponent(requestPeriodCode)}${query({
          unit_code: unitCode,
          locale,
        })}`,
      );
      return result.data.data;
    },
    async createBatch(payload: CreateDispatchBatchPayload, locale?: string) {
      const result = await apiPost<ApiEnvelope<DispatchBatch>, CreateDispatchBatchPayload>(
        `/requests/dispatch-batches${query({ locale })}`,
        payload,
      );
      return result.data.data;
    },
    async getBatch(batchCode: string, unitCode?: string, locale?: string) {
      const result = await apiGet<ApiEnvelope<DispatchBatch>>(
        `/requests/dispatch-batches/${encodeURIComponent(batchCode)}${query({
          unit_code: unitCode,
          locale,
        })}`,
      );
      return result.data.data;
    },
    async listPlans(params: PaginatedQuery) {
      const result = await apiGet<WorkflowList>(`/requests/dispatch-plans${query({
        unit_code: params.unitCode,
        limit: params.limit,
        offset: params.offset,
      })}`);
      return result.data;
    },
    async getPlan(planCode: string, unitCode: string) {
      const result = await apiGet<ApiEnvelope<WorkflowRecord>>(
        `/requests/dispatch-plans/${encodeURIComponent(planCode)}${query({ unit_code: unitCode })}`,
      );
      return result.data.data;
    },
    async listRuns(params: PaginatedQuery & { dispatchPlanCode?: string }) {
      const result = await apiGet<WorkflowList>(`/requests/dispatch-runs${query({
        unit_code: params.unitCode,
        dispatch_plan_code: params.dispatchPlanCode,
        limit: params.limit,
        offset: params.offset,
      })}`);
      return result.data;
    },
    async getRun(runCode: string, unitCode: string) {
      const result = await apiGet<ApiEnvelope<WorkflowRecord>>(
        `/requests/dispatch-runs/${encodeURIComponent(runCode)}${query({ unit_code: unitCode })}`,
      );
      return result.data.data;
    },
    async listSubmissions(params: PaginatedQuery) {
      const result = await apiGet<WorkflowList>(`/requests/submission-monitor${query({
        unit_code: params.unitCode,
        limit: params.limit,
        offset: params.offset,
      })}`);
      return result.data;
    },
    async listAccessLinks(params: PaginatedQuery & { dispatchRunCode?: string; includeLink?: boolean }) {
      const result = await apiGet<WorkflowList>(`/requests/dispatch-access-links${query({
        unit_code: params.unitCode,
        dispatch_run_code: params.dispatchRunCode,
        include_link: params.includeLink,
        limit: params.limit,
        offset: params.offset,
      })}`);
      return result.data;
    },
  },

  provider: {
    async preview(payload: PublicAccessTokenPayload) {
      const result = await apiPublicPost<ApiEnvelope<RequestAccessPreview>, PublicAccessTokenPayload>(
        `/requests/public/access/preview${query({ locale: getSelectedLocale() })}`,
        payload,
      );
      return result.data.data;
    },
    async requestOtp(payload: PublicOtpPayload) {
      const result = await apiPublicPost<ApiEnvelope<RequestAccessOtpResponse>, PublicOtpPayload>(
        `/requests/public/access/otp${query({ locale: getSelectedLocale() })}`,
        payload,
      );
      return result.data.data;
    },
    async verifyOtp(payload: PublicVerifyPayload) {
      const result = await apiPublicPost<ApiEnvelope<RequestAccessVerified>, PublicVerifyPayload>(
        `/requests/public/access/verify${query({ locale: getSelectedLocale() })}`,
        payload,
      );
      return result.data.data;
    },
    async selectAssignment(payload: PublicAssignmentPayload) {
      const result = await apiPublicPost<ApiEnvelope<RequestAccessSessionDetail>, PublicAssignmentPayload>(
        `/requests/public/access/session${query({ locale: getSelectedLocale() })}`,
        payload,
      );
      return result.data.data;
    },
    downloadSourceTemplate(payload: PublicAssignmentPayload) {
      return apiPublicPostBlob(`/requests/public/access/source-template${query({ locale: getSelectedLocale() })}`, payload);
    },
    async saveWorkbook(mode: "draft" | "submit", payload: PublicWorkbookSubmissionPayload) {
      const form = submissionForm(payload);
      form.set("session", payload.session);
      if (payload.runItemCode) form.set("run_item_code", payload.runItemCode);
      // Proposed fields pending backend support; see data-collection-api-handoff.md.
      if (payload.certification) form.set("certification", JSON.stringify(payload.certification));
      for (const evidence of payload.evidenceFiles ?? []) form.append("evidence_files", evidence);
      const result = await apiPublicPostForm<ApiEnvelope<WorkflowRecord>>(
        `/requests/public/access/file-entry/${mode}${query({ locale: getSelectedLocale() })}`,
        form,
      );
      return result.data.data;
    },
  },

  review: {
    async saveSelfWorkbook(
      mode: "draft" | "submit",
      runCode: string,
      runItemCode: string,
      payload: WorkbookSubmissionPayload,
    ) {
      const result = await apiPostForm<ApiEnvelope<WorkflowRecord>>(
        `/requests/dispatch-runs/${encodeURIComponent(runCode)}/items/${encodeURIComponent(runItemCode)}/file-entry/${mode}`,
        submissionForm(payload),
      );
      return result.data.data;
    },
    async getContext(runCode: string, runItemCode: string, locale?: string) {
      const result = await apiGet<ApiEnvelope<WorkflowRecord>>(
        `/requests/dispatch-runs/${encodeURIComponent(runCode)}/items/${encodeURIComponent(runItemCode)}/review-context${query({ locale })}`,
      );
      return result.data.data;
    },
    async decide(runCode: string, runItemCode: string, payload: ReviewDecisionPayload) {
      const result = await apiPost<ApiEnvelope<WorkflowRecord>, ReviewDecisionPayload>(
        `/requests/dispatch-runs/${encodeURIComponent(runCode)}/items/${encodeURIComponent(runItemCode)}/review`,
        payload,
      );
      return result.data.data;
    },
  },

  journeys: {
    async listCollectionActivities(filters: CollectionActivityFilters): Promise<CollectionActivityList> {
      const result = await apiGet<ApiEnvelope<WorkflowRecord>>(
        `/ingestion/v2/collections/${encodeURIComponent(filters.collectionCode)}/activities${query({
          unit_code: filters.unitCode,
          origin_type: filters.originType ?? "ALL",
          source_type: filters.sourceType ?? "ALL",
          status: filters.status,
          limit: filters.limit ?? 50,
          offset: filters.offset ?? 0,
          locale: filters.locale,
        })}`,
      );
      const payload = result.data.data;
      const rawItems = Array.isArray(payload.items)
        ? payload.items
        : Array.isArray(payload.activities)
          ? payload.activities
          : Array.isArray(payload.data)
            ? payload.data
            : [];
      const items = rawItems.filter((item): item is WorkflowRecord => Boolean(item) && typeof item === "object");
      const page = recordObject(payload, "page");
      const totalCount = Number(page.total ?? payload.totalCount ?? payload.total_count ?? payload.count ?? items.length);
      return {
        data: items.map(normalizeCollectionActivity),
        totalCount: Number.isFinite(totalCount) ? totalCount : items.length,
        limit: Number(page.limit ?? payload.limit ?? filters.limit ?? 50),
        offset: Number(page.offset ?? payload.offset ?? filters.offset ?? 0),
      };
    },
    async previewCollectionActivity(
      params: CollectionActivityPreviewParams,
    ): Promise<CollectionActivityPreviewResponse> {
      const result = await apiGet<CollectionActivityPreviewResponse>(
        `/ingestion/v2/collections/${encodeURIComponent(params.collectionCode)}/activities/${encodeURIComponent(params.originType)}/${encodeURIComponent(params.activityCode)}/preview${query({
          unit_code: params.unitCode,
          submission_version: params.submissionVersion,
          sheet_identity: params.sheetIdentity,
          limit: params.limit,
          offset: params.offset,
          locale: params.locale,
        })}`,
      );
      return result.data;
    },
    async startDirect(payload: StartDirectJourneyPayload) {
      const result = await apiPostForm<ApiEnvelope<Journey>>(
        "/ingestion/v2/direct-journeys",
        directJourneyForm(payload),
        { onUploadProgress: payload.onUploadProgress },
      );
      return result.data.data;
    },
    async start(payload: StartJourneyPayload) {
      const result = await apiPost<ApiEnvelope<Journey>, StartJourneyPayload>("/ingestion/v2/journeys", payload);
      return result.data.data;
    },
    async get(jobCode: string, unitCode: string) {
      const result = await apiGet<ApiEnvelope<Journey>>(
        `/ingestion/v2/journeys/${encodeURIComponent(jobCode)}${query({ unit_code: unitCode })}`,
      );
      return result.data.data;
    },
    async getActionContext(jobCode: string, unitCode: string, sheetIdentity?: string) {
      const result = await apiGet<ApiEnvelope<WorkflowRecord>>(
        `/ingestion/v2/journeys/${encodeURIComponent(jobCode)}/action-context${query({
          unit_code: unitCode,
          sheet_identity: sheetIdentity,
        })}`,
      );
      return result.data.data;
    },
    async act(jobCode: string, payload: JourneyActionPayload) {
      const result = await apiPost<ApiEnvelope<WorkflowRecord>, JourneyActionPayload>(
        `/ingestion/v2/journeys/${encodeURIComponent(jobCode)}/actions`,
        payload,
      );
      return result.data.data;
    },
  },

  workspaces: {
    async getQualityReview(resultId: string, unitCode: string) {
      const result = await apiGet<ApiEnvelope<WorkflowRecord>>(
        `/ingestion/v2/transform-results/${encodeURIComponent(resultId)}/quality-review${query({ unit_code: unitCode })}`,
      );
      return result.data.data;
    },
    async listEntities(resultId: string, params: PaginatedQuery & { entityType?: string }) {
      const result = await apiGet<WorkflowList>(
        `/ingestion/v2/transform-results/${encodeURIComponent(resultId)}/entities${query({
          unit_code: params.unitCode,
          entity_type: params.entityType,
          limit: params.limit,
          offset: params.offset,
        })}`,
      );
      return result.data;
    },
    async listRecords(resultId: string, params: PaginatedQuery & { sourceType?: string }) {
      const result = await apiGet<WorkflowList>(
        `/ingestion/v2/transform-results/${encodeURIComponent(resultId)}/records${query({
          unit_code: params.unitCode,
          source_type: params.sourceType,
          limit: params.limit,
          offset: params.offset,
        })}`,
      );
      return result.data;
    },
    async getSourceEvidence(resultId: string, unitCode: string) {
      const result = await apiGet<ApiEnvelope<WorkflowRecord>>(
        `/ingestion/v2/transform-results/${encodeURIComponent(resultId)}/source-evidence${query({ unit_code: unitCode })}`,
      );
      return result.data.data;
    },
    async getMappingRun(mappingRunId: string, params: PaginatedQuery) {
      const result = await apiGet<ApiEnvelope<WorkflowRecord>>(
        `/ingestion/v2/mapping-runs/${encodeURIComponent(mappingRunId)}${query({
          unit_code: params.unitCode,
          limit: params.limit,
          offset: params.offset,
        })}`,
      );
      return result.data.data;
    },
    async listDataFields(params: PaginatedQuery & { search?: string; valueType?: string }) {
      const result = await apiGet<WorkflowList>(`/ingestion/v2/master-options/data-fields${query({
        unit_code: params.unitCode,
        search: params.search?.trim(),
        value_type: params.valueType,
        limit: params.limit,
        offset: params.offset,
      })}`);
      return result.data;
    },
    async listDatasets(unitCode: string) {
      const result = await apiGet<WorkflowList>(`/ingestion/v2/datasets${query({ unit_code: unitCode })}`);
      return result.data;
    },
    async getCandidateSet(candidateSetId: string, params: PaginatedQuery) {
      const result = await apiGet<ApiEnvelope<WorkflowRecord>>(
        `/ingestion/v2/candidate-sets/${encodeURIComponent(candidateSetId)}${query({
          unit_code: params.unitCode,
          limit: params.limit,
          offset: params.offset,
        })}`,
      );
      return result.data.data;
    },
    async getValidationRun(validationRunId: string, params: PaginatedQuery & { outcome?: string }) {
      const result = await apiGet<ApiEnvelope<WorkflowRecord>>(
        `/ingestion/v2/validation-runs/${encodeURIComponent(validationRunId)}${query({
          unit_code: params.unitCode,
          outcome: params.outcome,
          limit: params.limit,
          offset: params.offset,
        })}`,
      );
      return result.data.data;
    },
    async getPublicationApproval(approvalRequestId: string, unitCode: string) {
      const result = await apiGet<ApiEnvelope<WorkflowRecord>>(
        `/ingestion/v2/publication-approvals/${encodeURIComponent(approvalRequestId)}${query({ unit_code: unitCode })}`,
      );
      return result.data.data;
    },
    async getPublication(publicationId: string, params: PaginatedQuery) {
      const result = await apiGet<ApiEnvelope<WorkflowRecord>>(
        `/ingestion/v2/publications/${encodeURIComponent(publicationId)}${query({
          unit_code: params.unitCode,
          limit: params.limit,
          offset: params.offset,
        })}`,
      );
      return result.data.data;
    },
  },
};
