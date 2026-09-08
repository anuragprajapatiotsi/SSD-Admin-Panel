import { apiDelete, apiGet, apiPost, apiPut } from "./http-client";
import type { ApiEnvelope } from "./template-workflow.api";
import { ingestionQuery, type DirectUploadResult } from "./direct-ingestion.api";
import { getSelectedLocale } from "./session.api";

export type ExternalApiDefinition = {
  unit_code: string;
  name: string;
  description?: string | null;
  method?: "GET" | "POST" | "PUT" | "PATCH";
  url: string;
  query_parameters?: ExternalApiKeyValue[];
  headers?: ExternalApiKeyValue[];
  authentication?: {
    type: "NONE" | "API_KEY_HEADER" | "API_KEY_QUERY" | "BEARER_TOKEN" | "BASIC_AUTH" | "OAUTH2_CLIENT_CREDENTIALS";
    api_key_name?: string | null;
    api_key_value?: string | null;
    bearer_token?: string | null;
    username?: string | null;
    password?: string | null;
    token_url?: string | null;
    client_id?: string | null;
    client_secret?: string | null;
    scope?: string | null;
  };
  body?: Record<string, unknown> | unknown[] | null;
  timeout_seconds?: number;
};
export type ExternalApiKeyValue = { key: string; value?: string; enabled?: boolean; secret?: boolean };
export type ExternalApiTest = {
  sampleResponse?: unknown;
  status: string;
  testedAt?: string;
  httpStatus?: number | null;
  durationMs?: number;
  contentType?: string;
  errorCode?: string;
};
export type ExternalApiConnection = {
  code: string;
  unitCode: string;
  name: string;
  description?: string | null;
  currentVersion: number;
  method: NonNullable<ExternalApiDefinition["method"]>;
  url: string;
  timeoutSeconds?: number;
  isActive: boolean;
  configuration?: {
    queryParameters?: (Omit<ExternalApiKeyValue, "value"> & { value?: string | null; valueConfigured?: boolean })[];
    headers?: (Omit<ExternalApiKeyValue, "value"> & { value?: string | null; valueConfigured?: boolean })[];
    authentication?: {
      type: NonNullable<ExternalApiDefinition["authentication"]>["type"];
      apiKeyName?: string;
      username?: string;
      tokenUrl?: string;
      clientId?: string;
      scope?: string;
      credentialConfigured?: boolean;
    };
    body?: ExternalApiDefinition["body"];
  };
  test?: ExternalApiTest;
};
export type ExternalApiList = {
  unitCode: string;
  items: ExternalApiConnection[];
  page: { limit: number; offset: number; returned: number; total: number };
};
export type ExternalApiIngestionPayload = { unit_code: string; request_period_code: string; display_name?: string };
const base = "/ingestion/v2/external-apis";
const path = (code: string) => `${base}/${encodeURIComponent(code)}`;

// Secret-bearing request payloads must never be logged or cached as connection records.
// GET responses contain redacted configuration, not reusable credentials.
export const externalApiApi = {
  async list(unitCode: string, limit = 50, offset = 0) {
    return (await apiGet<ApiEnvelope<ExternalApiList>>(`${base}${ingestionQuery({ unit_code: unitCode, limit, offset })}`, { acceptLanguage: getSelectedLocale() })).data.data;
  },
  async testDefinition(payload: ExternalApiDefinition) {
    return (await apiPost<ApiEnvelope<ExternalApiTest>, ExternalApiDefinition>(`${base}/test`, payload)).data.data;
  },
  async create(payload: ExternalApiDefinition) {
    return (await apiPost<ApiEnvelope<ExternalApiConnection>, ExternalApiDefinition>(base, payload)).data.data;
  },
  async get(code: string, unitCode: string) {
    return (await apiGet<ApiEnvelope<ExternalApiConnection>>(`${path(code)}${ingestionQuery({ unit_code: unitCode })}`)).data.data;
  },
  async update(code: string, payload: ExternalApiDefinition) {
    return (await apiPut<ApiEnvelope<ExternalApiConnection>, ExternalApiDefinition>(path(code), payload)).data.data;
  },
  async testSaved(code: string, unitCode: string) {
    return (await apiPost<ApiEnvelope<ExternalApiConnection>, Record<string, never>>(`${path(code)}/test${ingestionQuery({ unit_code: unitCode })}`, {})).data.data;
  },
  async remove(code: string, unitCode: string) {
    return (await apiDelete<ApiEnvelope<{ code: string; deleted: boolean }>>(`${path(code)}${ingestionQuery({ unit_code: unitCode })}`)).data.data;
  },
  async createIngestion(code: string, payload: ExternalApiIngestionPayload) {
    return (await apiPost<ApiEnvelope<DirectUploadResult>, ExternalApiIngestionPayload>(`${path(code)}/direct-ingestions`, payload, { acceptLanguage: getSelectedLocale() })).data.data;
  },
  async submit(code: string, directCode: string, unitCode: string) {
    return (await apiPost<ApiEnvelope<DirectUploadResult>, { unit_code: string }>(`${path(code)}/direct-ingestions/${encodeURIComponent(directCode)}/submissions`, { unit_code: unitCode }, { acceptLanguage: getSelectedLocale() })).data.data;
  },
};
