import type { ExternalApiDefinition, ExternalApiTest } from "@/api/external-api.api";
import { testMetadata } from "@/utils/data-api-form";

export type DataApiTestView = Omit<ExternalApiTest, "sampleResponse"> & {
  responseData?: unknown;
  responseTruncated?: boolean;
};

// Source APIs may echo request credentials. Redact before putting a response in
// UI state. Saved credentials are intentionally unavailable to the frontend;
// backend redaction is still required for secrets echoed under arbitrary names.
export function dataApiTestView(test: ExternalApiTest | undefined, options: {
  redacted: string;
  omitted: string;
  secretKeys?: string[];
  definition?: ExternalApiDefinition;
}): DataApiTestView | undefined {
  if (!test) return undefined;
  const metadata = testMetadata(test)!;
  if (!Object.prototype.hasOwnProperty.call(test, "sampleResponse") || test.sampleResponse === undefined) return metadata;
  const normalize = (key: string) => key.toLowerCase().replace(/[^a-z0-9]/g, "");
  const keys = new Set((options.secretKeys ?? []).map(normalize));
  const secrets: string[] = [];
  for (const pair of [...(options.definition?.query_parameters ?? []), ...(options.definition?.headers ?? [])]) {
    if (pair.secret) { keys.add(normalize(pair.key)); if (pair.value) secrets.push(pair.value); }
  }
  const auth = options.definition?.authentication;
  for (const value of [auth?.api_key_value, auth?.bearer_token, auth?.password, auth?.client_secret]) if (value) secrets.push(value);
  if (auth?.api_key_name) keys.add(normalize(auth.api_key_name));
  if (auth?.type === "BASIC_AUTH" && auth.username && auth.password) {
    const bytes = new TextEncoder().encode(`${auth.username}:${auth.password}`);
    secrets.push(btoa(Array.from(bytes, (byte) => String.fromCharCode(byte)).join("")));
  }
  const replacements = [...new Set(secrets.flatMap((secret) => [secret, encodeURIComponent(secret)]))].sort((a, b) => b.length - a.length);
  const sensitive = (key: string) => keys.has(normalize(key)) || /password|passwd|secret|token|authorization|cookie|apikey|credential/.test(normalize(key));
  const redactText = (value: string) => {
    let result = value;
    for (const secret of replacements) result = result.split(secret).join(options.redacted);
    return result.replace(/\b(?:Bearer|Basic)\s+[A-Za-z0-9+/=._~-]+/gi, options.redacted)
      .replace(/((?:[?&]|\b)(?:api[_-]?key|access[_-]?token|token|password|client[_-]?secret)=)[^\s&#"']+/gi, `$1${options.redacted}`);
  };
  let nodes = 0;
  let characters = 0;
  let truncated = false;
  function visit(value: unknown, depth: number): unknown {
    if (++nodes > 15000 || characters > 100000 || depth > 30) { truncated = true; return options.omitted; }
    if (typeof value === "string") {
      const safe = redactText(value);
      const remaining = Math.max(0, 100000 - characters);
      characters += safe.length;
      if (safe.length > remaining) { truncated = true; return safe.slice(0, remaining) + options.omitted; }
      return safe;
    }
    if (!value || typeof value !== "object") return value;
    if (Array.isArray(value)) {
      const result: unknown[] = [];
      for (const item of value) {
        if (nodes > 15000 || characters > 100000) { truncated = true; result.push(options.omitted); break; }
        result.push(visit(item, depth + 1));
      }
      return result;
    }
    const result: Record<string, unknown> = Object.create(null);
    const record = value as Record<string, unknown>;
    // Also cover echoed key/value header or parameter arrays.
    const secretPair = record.secret === true || (typeof record.key === "string" && sensitive(record.key)) || (typeof record.name === "string" && sensitive(record.name));
    for (const [key, item] of Object.entries(record)) {
      if (nodes > 15000 || characters > 100000) { truncated = true; break; }
      const fullKey = redactText(key);
      const safeKey = fullKey.slice(0, 1000);
      if (fullKey.length > 1000) truncated = true;
      characters += safeKey.length;
      result[safeKey] = sensitive(key) || (secretPair && key === "value") ? options.redacted : visit(item, depth + 1);
    }
    return result;
  }
  return { ...metadata, responseData: visit(test.sampleResponse, 0), responseTruncated: truncated };
}
