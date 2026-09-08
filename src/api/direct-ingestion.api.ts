import { apiDelete, apiGet, apiPatch, apiPost, apiPostEmpty, apiPostForm, type ApiUploadProgress } from "./http-client";
import type { ApiEnvelope, WorkflowRecord } from "./template-workflow.api";
import { getSelectedLocale } from "./session.api";

export type DirectSource = "EXCEL" | "CSV" | "PDF" | "API" | "WEB_SCRAPE";
export type DirectSubmission = {
  submissionVersion: number;
  submissionId?: string;
  originalFileName?: string;
  status: string;
  processingStatus?: string;
  processingPhase?: string;
  terminal?: boolean;
  isLatest?: boolean;
};
export type DirectIngestion = {
  directIngestionCode: string;
  displayName: string;
  sourceType: DirectSource;
  requestPeriodCode: string;
  unitCode: string;
  submissionCount: number;
  latestSubmission?: DirectSubmission;
  submissionHistory: DirectSubmission[];
};
export type DirectUpload = {
  unit_code: string;
  source_type: DirectSource;
  file?: File;
  source_url?: string;
  onUploadProgress?: (progress: ApiUploadProgress) => void;
};
export type CreateDirectIngestion = DirectUpload & { request_period_code: string; display_name?: string };
export type DirectUploadResult = {
  directIngestionCode: string;
  submissionVersion: number;
  status: string;
  submissionPreviewPath?: string;
};
export type DirectReviewAction = "USE_EXISTING" | "CREATE_NEW" | "CHANGE_PARENT" | "CORRECT_VALUE";
export type DirectReviewDecision = {
  entity_ref: string;
  action: DirectReviewAction;
  selected_database_id?: string;
  corrected_code?: string;
  selected_parent_database_id?: string;
  selected_scope_database_id?: string;
  comment?: string;
};
export type DirectReviewIssue = {
  question?: string;
  questions?: Record<string, string>;
  requestedValue?: {
    ref?: string; code?: string; subtype?: string; names?: Record<string, string>; displayName?: string;
    parent?: { ref?: string; code?: string; names?: Record<string, string>; displayName?: string } | null;
    scope?: { ref?: string; code?: string; names?: Record<string, string>; displayName?: string } | null;
  };
  entityRef: string;
  issueCode?: string;
  entityType?: string;
  requestedParentCode?: string | null;
  requestedScopeCode?: string | null;
  affectedObservationRefs?: string[];
  message?: string;
  messages?: Record<string, string>;
  requestedCode?: string;
  decision?: unknown;
  allowedActions: DirectReviewAction[];
  candidates?: { databaseId: string; code: string; names?: Record<string, string>; displayName?: string; displayLabel?: string; parentCode?: string; scopeCode?: string; active?: boolean }[];
};
export type DirectReview = {
  status?: string;
  issues: DirectReviewIssue[];
  resolvedIssues?: DirectReviewIssue[];
  canSubmitDecision?: boolean;
  summary?: { pendingIssueCount?: number; totalIssueCount?: number; resolvedIssueCount?: number };
};
export type DirectPublicationDecision = { action: "APPROVE" | "RETURN"; comments: string };
export type DirectFactReview = {
  status: string;
  canDecide: boolean;
  canFreeze: boolean;
  allowedActions: string[];
  messages?: Record<string, string>;
};
export type DirectPublicationReview = {
  directIngestionCode: string;
  submissionVersion: number;
  status: string;
  currentPhase: string;
  factReview: DirectFactReview;
};
export type DirectPublicationResult = {
  directIngestionCode: string;
  submissionVersion: number;
  status: string;
  currentPhase: string;
  nextAction?: string;
};
export type DirectPreview = WorkflowRecord & {
  submission?: { submissionVersion: number; submissionId?: string; submissionCode?: string; isLatest?: boolean };
  statusDetail?: { status: string; currentPhase?: string; terminal?: boolean; userActionRequired?: boolean; message?: string; errorMessages?: Record<string, string> };
  review?: DirectReview;
  factReview?: DirectFactReview;
  publication?: WorkflowRecord & { lineageComplete?: boolean };
  preview?: WorkflowRecord & { available?: boolean };
};
export function ingestionQuery(values: Record<string, string | number | undefined>) {
  const query = new URLSearchParams();
  Object.entries(values).forEach(([key, value]) => { if (value !== undefined) query.set(key, String(value)); });
  return `?${query}`;
}
const parentPath = (code: string) => `/ingestion/v2/direct-ingestions/${encodeURIComponent(code)}`;
const submissionPath = (code: string, version: number) => `${parentPath(code)}/submissions/${version}`;
function uploadForm(payload: DirectUpload | CreateDirectIngestion) {
  const form = new FormData();
  form.set("unit_code", payload.unit_code);
  form.set("source_type", payload.source_type);
  if (payload.file) form.set("file", payload.file);
  if (payload.source_url) form.set("source_url", payload.source_url);
  if ("request_period_code" in payload) form.set("request_period_code", payload.request_period_code);
  if ("display_name" in payload && payload.display_name) form.set("display_name", payload.display_name);
  return form;
}
export const directIngestionApi = {
  async create(payload: CreateDirectIngestion) {
    return (await apiPostForm<ApiEnvelope<DirectUploadResult>>("/ingestion/v2/direct-ingestions", uploadForm(payload), { onUploadProgress: payload.onUploadProgress, acceptLanguage: getSelectedLocale() })).data.data;
  },
  async submit(code: string, payload: DirectUpload) {
    const { unit_code, source_type, file, source_url } = payload;
    return (await apiPostForm<ApiEnvelope<DirectUploadResult>>(`${parentPath(code)}/submissions`, uploadForm({ unit_code, source_type, file, source_url }), { onUploadProgress: payload.onUploadProgress, acceptLanguage: getSelectedLocale() })).data.data;
  },
  async get(code: string, unitCode: string, locale?: string) {
    return (await apiGet<ApiEnvelope<DirectIngestion>>(`${parentPath(code)}${ingestionQuery({ unit_code: unitCode, locale })}`, { acceptLanguage: locale })).data.data;
  },
  async preview(code: string, version: number, unitCode: string, locale?: string) {
    const { data } = await apiGet<ApiEnvelope<DirectPreview> | DirectPreview>(`${submissionPath(code, version)}/preview${ingestionQuery({ unit_code: unitCode, locale })}`, { acceptLanguage: locale });
    // Accept the full preview object as well as the documented API envelope.
    return "preview" in data || "statusDetail" in data ? { data: data as DirectPreview } : data as ApiEnvelope<DirectPreview>;
  },
  async decide(code: string, version: number, unitCode: string, payload: DirectReviewDecision) {
    return (await apiPost<ApiEnvelope<WorkflowRecord>, DirectReviewDecision>(`${submissionPath(code, version)}/review-decisions${ingestionQuery({ unit_code: unitCode })}`, payload, { acceptLanguage: getSelectedLocale() })).data.data;
  },
  async review(code: string, version: number, unitCode: string, locale?: string) {
    return (await apiGet<ApiEnvelope<DirectReview>>(`${submissionPath(code, version)}/review${ingestionQuery({ unit_code: unitCode, locale })}`, { acceptLanguage: locale })).data.data;
  },
  async rename(code: string, unitCode: string, displayName: string) {
    return (await apiPatch<ApiEnvelope<WorkflowRecord>, { display_name: string }>(`${parentPath(code)}${ingestionQuery({ unit_code: unitCode })}`, { display_name: displayName.trim() })).data.data;
  },
  async publicationReview(code: string, version: number, unitCode: string, locale?: string) {
    return (await apiGet<ApiEnvelope<DirectPublicationReview>>(`${submissionPath(code, version)}/publication-review${ingestionQuery({ unit_code: unitCode, locale })}`, { acceptLanguage: locale })).data.data;
  },
  async decidePublication(code: string, version: number, unitCode: string, payload: DirectPublicationDecision) {
    return (await apiPost<ApiEnvelope<DirectPublicationResult>, DirectPublicationDecision>(`${submissionPath(code, version)}/publication-review/decision${ingestionQuery({ unit_code: unitCode })}`, payload, { acceptLanguage: getSelectedLocale() })).data.data;
  },
  async freeze(code: string, version: number, unitCode: string) {
    return (await apiPostEmpty<ApiEnvelope<DirectPublicationResult>>(`${submissionPath(code, version)}/freeze${ingestionQuery({ unit_code: unitCode })}`, { acceptLanguage: getSelectedLocale() })).data.data;
  },
  async remove(code: string, unitCode: string) {
    return (await apiDelete<ApiEnvelope<WorkflowRecord>>(`${parentPath(code)}${ingestionQuery({ unit_code: unitCode })}`)).data.data;
  },
};
