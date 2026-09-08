import { z } from "zod";

const STORAGE_KEY = "ssd_provider_access_v1";
const sessionSchema = z.object({
  version: z.literal(1),
  token: z.string().min(1),
  session: z.string().min(1),
  runItemCode: z.string().min(1).optional(),
  mode: z.enum(["online", "upload"]).optional(),
  tourUserKey: z.string().regex(/^[a-f0-9]{64}$/).optional(),
});

// Tab-scoped only. Never mix public provider access with employee authentication.
export function readProviderSession(token: string) {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const result = sessionSchema.safeParse(JSON.parse(raw));
    return result.success && result.data.token === token ? result.data : null;
  } catch { return null; }
}

export function saveProviderSession(token: string, session: string, runItemCode?: string, mode?: "online" | "upload", tourUserKey?: string) {
  try {
    const previous = readProviderSession(token);
    const identity = tourUserKey ?? (previous?.session === session ? previous.tourUserKey : undefined);
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify({ version: 1, token, session, runItemCode, mode, tourUserKey: identity }));
  } catch { /* Storage may be disabled; the current in-memory session still works. */ }
}

export function clearProviderSession(token: string) {
  if (!readProviderSession(token)) return;
  try { sessionStorage.removeItem(STORAGE_KEY); } catch { /* Storage is unavailable. */ }
}
