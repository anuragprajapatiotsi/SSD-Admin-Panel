import axios, {
  AxiosHeaders,
  type AxiosInstance,
  type AxiosRequestConfig,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from "axios";
import {
  clearStoredAuth,
  getStoredAccessToken,
  getStoredRefreshToken,
  getStoredUnitCode,
  setStoredAccessToken,
} from "./auth-storage";

const RAW_API_BASE_URL = import.meta.env.VITE_SSD_API_BASE_URL;
const API_BASE_URL = resolveApiBaseUrl(RAW_API_BASE_URL);
const AUTH_EXPIRED_EVENT = "ssd-auth-expired";

type RetryableRequestConfig = InternalAxiosRequestConfig & {
  _authRetry?: boolean;
};

type RefreshResponse = {
  access_token: string;
  token_type: string;
};

export type ApiResult<T> = {
  data: T;
  requestId?: string;
};

export type ApiGetOptions = {
  acceptLanguage?: string;
};

export type ApiUploadProgress = {
  loaded: number;
  total?: number;
  percentage?: number;
};

export class ApiError extends Error {
  readonly status?: number;
  readonly requestId?: string;
  readonly payload?: unknown;

  constructor(message: string, options: { status?: number; requestId?: string; payload?: unknown } = {}) {
    super(message);
    this.name = "ApiError";
    this.status = options.status;
    this.requestId = options.requestId;
    this.payload = options.payload;
  }
}

const apiClient = axios.create({ baseURL: API_BASE_URL });
const publicApiClient = axios.create({ baseURL: API_BASE_URL });
let refreshPromise: Promise<string | null> | null = null;

apiClient.interceptors.request.use((config) => {
  const accessToken = getStoredAccessToken();
  if (accessToken && !isAuthenticationPath(config.url)) {
    config.headers.set("Authorization", `Bearer ${accessToken}`);
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: unknown) => {
    if (!axios.isAxiosError(error)) return Promise.reject(error);

    const config = error.config as RetryableRequestConfig | undefined;
    if (
      error.response?.status !== 401
      || !config
      || config._authRetry
      || isAuthenticationPath(config.url)
    ) {
      return Promise.reject(error);
    }

    config._authRetry = true;
    const accessToken = await refreshAccessTokenOnce();
    if (!accessToken) return Promise.reject(error);

    config.headers = AxiosHeaders.from(config.headers);
    config.headers.set("Authorization", `Bearer ${accessToken}`);
    return apiClient.request(config);
  },
);

export async function apiGet<T>(path: string, options: ApiGetOptions = {}): Promise<ApiResult<T>> {
  return execute<T>(apiClient, {
    method: "GET",
    url: path,
    headers: {
      Accept: "application/json",
      ...(options.acceptLanguage ? { "Accept-Language": options.acceptLanguage } : {}),
    },
  });
}

export async function apiGetBlob(path: string): Promise<{ blob: Blob; headers: Headers }> {
  return executeBlob(apiClient, {
    method: "GET",
    url: path,
    responseType: "blob",
    headers: {
      Accept: "application/octet-stream, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet, text/csv",
    },
  });
}

export async function apiPost<T, TBody extends object>(path: string, body: TBody, options: ApiGetOptions = {}): Promise<ApiResult<T>> {
  const request = jsonRequest("POST", path, body);
  const headers = AxiosHeaders.from(request.headers);
  if (options.acceptLanguage) headers.set("Accept-Language", options.acceptLanguage);
  return execute<T, TBody>(apiClient, { ...request, headers });
}

export async function apiPatch<T, TBody extends object>(path: string, body: TBody): Promise<ApiResult<T>> {
  return execute<T, TBody>(apiClient, jsonRequest("PATCH", path, body));
}

export async function apiPostEmpty<T>(path: string, options: ApiGetOptions = {}): Promise<ApiResult<T>> {
  return execute<T>(apiClient, {
    method: "POST",
    url: path,
    headers: {
      Accept: "application/json",
      ...(options.acceptLanguage ? { "Accept-Language": options.acceptLanguage } : {}),
    },
  });
}

export async function apiPut<T, TBody extends object>(path: string, body: TBody): Promise<ApiResult<T>> {
  return execute<T, TBody>(apiClient, jsonRequest("PUT", path, body));
}

export async function apiDelete<T, TBody extends object = Record<string, never>>(
  path: string,
  body?: TBody,
): Promise<ApiResult<T>> {
  return execute<T, TBody>(apiClient, {
    method: "DELETE",
    url: path,
    data: body,
    headers: { Accept: "application/json" },
  });
}

export async function apiPostForm<T>(
  path: string,
  body: FormData,
  options: {
    onUploadProgress?: (progress: ApiUploadProgress) => void;
    acceptLanguage?: string;
  } = {},
): Promise<ApiResult<T>> {
  return execute<T, FormData>(apiClient, {
    method: "POST",
    url: path,
    data: body,
    headers: { Accept: "application/json", ...(options.acceptLanguage ? { "Accept-Language": options.acceptLanguage } : {}) },
    onUploadProgress: options.onUploadProgress
      ? (event) => {
          options.onUploadProgress?.({
            loaded: event.loaded,
            total: event.total,
            percentage: event.total
              ? Math.min(100, Math.round((event.loaded / event.total) * 100))
              : undefined,
          });
        }
      : undefined,
  });
}

export async function apiPutForm<T>(path: string, body: FormData): Promise<ApiResult<T>> {
  return execute<T, FormData>(apiClient, {
    method: "PUT",
    url: path,
    data: body,
    headers: { Accept: "application/json" },
  });
}

export async function apiPublicPost<T, TBody extends object>(path: string, body: TBody): Promise<ApiResult<T>> {
  return execute<T, TBody>(publicApiClient, jsonRequest("POST", path, body));
}

export async function apiPublicGet<T>(path: string): Promise<ApiResult<T>> {
  return execute<T>(publicApiClient, {
    method: "GET",
    url: path,
    headers: { Accept: "application/json" },
  });
}

export async function apiPublicPostForm<T>(path: string, body: FormData): Promise<ApiResult<T>> {
  return execute<T, FormData>(publicApiClient, {
    method: "POST",
    url: path,
    data: body,
    headers: { Accept: "application/json" },
  });
}

export async function apiPublicPostBlob<TBody extends object>(
  path: string,
  body: TBody,
): Promise<{ blob: Blob; headers: Headers }> {
  return executeBlob<TBody>(publicApiClient, {
    method: "POST",
    url: path,
    data: body,
    responseType: "blob",
    headers: {
      Accept: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Type": "application/json",
    },
  });
}

function jsonRequest<TBody>(method: "POST" | "PATCH" | "PUT", path: string, body: TBody): AxiosRequestConfig<TBody> {
  return {
    method,
    url: path,
    data: body,
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  };
}

async function execute<T, TBody = unknown>(
  client: AxiosInstance,
  config: AxiosRequestConfig<TBody>,
): Promise<ApiResult<T>> {
  try {
    const response = await client.request<T, AxiosResponse<T>, TBody>(config);
    return {
      data: response.data,
      requestId: headerValue(response, "x-request-id"),
    };
  } catch (error) {
    throw normalizeApiError(error);
  }
}

async function executeBlob<TBody = unknown>(
  client: AxiosInstance,
  config: AxiosRequestConfig<TBody>,
): Promise<{ blob: Blob; headers: Headers }> {
  try {
    const response = await client.request<Blob, AxiosResponse<Blob>, TBody>(config);
    return { blob: response.data, headers: toHeaders(response) };
  } catch (error) {
    throw normalizeApiError(error);
  }
}

function refreshAccessTokenOnce(): Promise<string | null> {
  if (!refreshPromise) {
    refreshPromise = refreshAccessToken().finally(() => {
      refreshPromise = null;
    });
  }
  return refreshPromise;
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getStoredRefreshToken();
  if (!refreshToken) {
    expireAuthSession();
    return null;
  }

  try {
    const response = await publicApiClient.post<RefreshResponse>("/auth/refresh", {
      refresh_token: refreshToken,
      unit_id: getStoredUnitCode(),
    });
    if (!response.data.access_token) {
      expireAuthSession();
      return null;
    }

    setStoredAccessToken(response.data.access_token);
    return response.data.access_token;
  } catch {
    expireAuthSession();
    return null;
  }
}

function expireAuthSession(): void {
  clearStoredAuth();
  window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
}

function isAuthenticationPath(url?: string): boolean {
  const path = url?.split("?")[0];
  return path === "/auth/login" || path === "/auth/refresh";
}

function normalizeApiError(error: unknown): ApiError {
  if (error instanceof ApiError) return error;
  if (!axios.isAxiosError(error)) {
    return new ApiError(error instanceof Error ? error.message : "The API request failed.");
  }

  const payload = error.response?.data;
  return new ApiError(
    errorMessageFromPayload(payload) || (error.response ? `API request failed: ${error.response.status}` : "Unable to connect to the API."),
    {
      status: error.response?.status,
      requestId: error.response ? headerValue(error.response, "x-request-id") : undefined,
      payload,
    },
  );
}

function errorMessageFromPayload(payload: unknown): string | undefined {
  if (!payload || typeof payload !== "object" || !("detail" in payload)) return undefined;
  const detail = (payload as { detail?: unknown }).detail;
  if (typeof detail === "string") return detail;
  if (Array.isArray(detail)) {
    return detail.map((item) => {
      if (typeof item === "string") return item;
      if (item && typeof item === "object" && "msg" in item) return String(item.msg);
      return "";
    }).filter(Boolean).join(", ");
  }
  if (detail && typeof detail === "object") {
    if ("message" in detail && typeof detail.message === "string") return detail.message;
    if ("detail" in detail && typeof detail.detail === "string") return detail.detail;
  }
  return undefined;
}

function headerValue(response: AxiosResponse, name: string): string | undefined {
  const value = response.headers[name];
  if (typeof value === "string") return value;
  if (typeof value === "number") return String(value);
  return undefined;
}

function toHeaders(response: AxiosResponse): Headers {
  const headers = new Headers();
  Object.entries(response.headers).forEach(([name, value]) => {
    if (value === undefined || value === null) return;
    headers.set(name, Array.isArray(value) ? value.join(", ") : String(value));
  });
  return headers;
}

function resolveApiBaseUrl(configuredUrl: string | undefined): string {
  const trimmedUrl = configuredUrl?.trim();
  if (trimmedUrl) {
    if (trimmedUrl.startsWith("/") && window.location.protocol === "file:") {
      return "http://localhost:8100";
    }
    if (trimmedUrl.startsWith("/") && (window.location.protocol === "http:" || window.location.protocol === "https:")) {
      return `${window.location.origin}${trimmedUrl.replace(/\/$/, "")}`;
    }
    return trimmedUrl.replace(/\/$/, "");
  }

  if (window.location.protocol === "http:" || window.location.protocol === "https:") {
    return window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
      ? "http://localhost:8100"
      : `${window.location.origin}/api`;
  }

  return "http://localhost:8100";
}
