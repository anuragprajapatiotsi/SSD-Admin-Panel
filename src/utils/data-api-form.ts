import { z } from "zod";
import type { ExternalApiConnection, ExternalApiDefinition, ExternalApiTest } from "@/api/external-api.api";

export const API_METHODS = ["GET", "POST", "PUT", "PATCH"] as const;
export const API_AUTH_TYPES = ["NONE", "API_KEY_HEADER", "API_KEY_QUERY", "BEARER_TOKEN", "BASIC_AUTH", "OAUTH2_CLIENT_CREDENTIALS"] as const;
export type ApiAuthField = "api_key_name" | "api_key_value" | "bearer_token" | "username" | "password" | "token_url" | "client_id" | "client_secret" | "scope";
export const AUTH_FIELDS: Record<typeof API_AUTH_TYPES[number], readonly ApiAuthField[]> = {
  NONE: [], API_KEY_HEADER: ["api_key_name", "api_key_value"], API_KEY_QUERY: ["api_key_name", "api_key_value"],
  BEARER_TOKEN: ["bearer_token"], BASIC_AUTH: ["username", "password"],
  OAUTH2_CLIENT_CREDENTIALS: ["token_url", "client_id", "client_secret", "scope"],
};
export const SECRET_AUTH_FIELDS = new Set<ApiAuthField>(["api_key_value", "bearer_token", "password", "client_secret"]);
export type ApiPair = { id: string; key: string; value: string; enabled: boolean; secret: boolean; configured?: boolean };
export type DataApiFormValues = {
  name: string; description: string; method: typeof API_METHODS[number]; url: string; timeout: string;
  query: ApiPair[]; headers: ApiPair[];
  auth: { type: typeof API_AUTH_TYPES[number] } & Record<ApiAuthField, string>;
  body: string;
};

export const newApiPair = (): ApiPair => ({ id: crypto.randomUUID(), key: "", value: "", enabled: true, secret: false });
export function initialDataApiValues(connection?: ExternalApiConnection): DataApiFormValues {
  const config = connection?.configuration;
  const auth = config?.authentication;
  const pairs = (items: NonNullable<ExternalApiConnection["configuration"]>["headers"]) =>
    (items ?? []).map((item) => ({ ...newApiPair(), key: item.key, value: item.secret ? "" : item.value ?? "", enabled: item.enabled !== false, secret: Boolean(item.secret), configured: Boolean(item.secret && item.valueConfigured) }));
  return {
    name: connection?.name ?? "", description: connection?.description ?? "", method: connection?.method ?? "GET", url: connection?.url ?? "",
    timeout: connection ? String(connection.timeoutSeconds ?? "") : "30", query: pairs(config?.queryParameters), headers: pairs(config?.headers),
    auth: { type: auth?.type ?? "NONE", api_key_name: auth?.apiKeyName ?? "", api_key_value: "", bearer_token: "", username: auth?.username ?? "", password: "", token_url: auth?.tokenUrl ?? "", client_id: auth?.clientId ?? "", client_secret: "", scope: auth?.scope ?? "" },
    body: config?.body == null ? "" : JSON.stringify(config.body, null, 2),
  };
}

const httpUrl = z.string().trim().max(2000, "length").url("url").refine((value) => {
  try { const url = new URL(value); return ["http:", "https:"].includes(url.protocol) && !url.username && !url.password && !url.hash && !url.search; } catch { return false; }
}, "url");
const pairSchema = z.object({
  key: z.string().trim().min(1, "required").max(240, "length"), value: z.string().max(8000, "length"),
  enabled: z.boolean(), secret: z.boolean(), configured: z.boolean().optional(),
}).superRefine((pair, ctx) => {
  if (pair.configured && !pair.value) ctx.addIssue({ code: "custom", path: ["value"], message: "credential" });
});
const formSchema = z.object({
  name: z.string().trim().min(1, "required").max(240, "length"), description: z.string().max(4000, "length"),
  method: z.enum(API_METHODS), url: httpUrl, timeout: z.string().refine((value) => /^\d+$/.test(value) && Number(value) >= 1 && Number(value) <= 120, "timeout"),
  query: z.array(pairSchema).max(100, "pairs"), headers: z.array(pairSchema).max(100, "pairs"),
  auth: z.object({ type: z.enum(API_AUTH_TYPES), api_key_name: z.string().max(240, "length"), api_key_value: z.string().max(8000, "length"), bearer_token: z.string().max(16000, "length"), username: z.string().max(500, "length"), password: z.string().max(8000, "length"), token_url: z.string().max(2000, "length"), client_id: z.string().max(1000, "length"), client_secret: z.string().max(8000, "length"), scope: z.string().max(2000, "length") }),
  body: z.string(),
}).superRefine((value, ctx) => {
  for (const field of AUTH_FIELDS[value.auth.type]) {
    if (field !== "scope" && !value.auth[field].trim()) ctx.addIssue({ code: "custom", path: ["auth", field], message: "required" });
  }
  if (value.auth.type === "OAUTH2_CLIENT_CREDENTIALS" && !httpUrl.safeParse(value.auth.token_url).success) ctx.addIssue({ code: "custom", path: ["auth", "token_url"], message: "url" });
  if (value.method !== "GET" && value.body.trim()) {
    try { const body: unknown = JSON.parse(value.body); if (body === null || typeof body !== "object") throw new Error(); }
    catch { ctx.addIssue({ code: "custom", path: ["body"], message: "json" }); }
  }
});

export function validateDataApi(values: DataApiFormValues, unit: string): { payload: ExternalApiDefinition; errors?: never } | { errors: Record<string, string>; payload?: never } {
  const parsed = formSchema.safeParse(values);
  if (!parsed.success) return { errors: Object.fromEntries(parsed.error.issues.map((issue) => [issue.path.join("."), issue.message])) };
  const v = parsed.data;
  const authentication: NonNullable<ExternalApiDefinition["authentication"]> = { type: v.auth.type };
  for (const key of AUTH_FIELDS[v.auth.type]) authentication[key] = v.auth[key] || null;
  const pairs = (items: typeof v.query) => items.map(({ key, value, enabled, secret }) => ({ key, value, enabled, secret }));
  return { payload: { unit_code: unit, name: v.name, description: v.description || null, method: v.method, url: v.url, timeout_seconds: Number(v.timeout), query_parameters: pairs(v.query), headers: pairs(v.headers), authentication, body: v.method === "GET" || !v.body.trim() ? null : JSON.parse(v.body) } };
}

// Display metadata only: neither raw source responses nor exception messages are safe to echo.
export function testMetadata(test?: ExternalApiTest): ExternalApiTest | undefined {
  if (!test) return undefined;
  return { status: test.status, httpStatus: test.httpStatus, durationMs: test.durationMs, testedAt: test.testedAt, contentType: test.contentType };
}
export function safeConnectionAddress(address: string) {
  try { const url = new URL(address); return `${url.protocol}//${url.host}${url.pathname}`; } catch { return ""; }
}
