import { z } from "zod";

const progressSchema = z.object({
  skipped: z.boolean(),
  screens: z.record(z.string(), z.object({ complete: z.boolean(), step: z.string().optional() })),
});
export type TourProgress = z.infer<typeof progressSchema>;

export function readTourProgress(key: string): TourProgress {
  try {
    const parsed = progressSchema.safeParse(JSON.parse(localStorage.getItem(key) ?? "null"));
    if (parsed.success) return parsed.data;
  } catch { /* Storage is optional; keep the guide usable in memory. */ }
  return { skipped: false, screens: {} };
}

export function writeTourProgress(key: string, progress: TourProgress) {
  try { localStorage.setItem(key, JSON.stringify(progress)); } catch { /* In-memory progress still applies. */ }
}

// A local pseudonymous identifier, not authentication or an anonymization guarantee.
export async function createTourUserKey(email: string): Promise<string | null> {
  return hashTourIdentity(`ssd-provider-tour:${email.trim().toLowerCase()}`);
}

// Older validated sessions have no verified-email key. Keep their progress scoped
// to that session, never to a shared browser-wide identity or a guessed recipient.
// A subsequent OTP sign-in establishes the normal per-user key.
export async function createRestoredTourUserKey(session: string): Promise<string | null> {
  return hashTourIdentity(`ssd-provider-restored-tour:${session}`);
}

async function hashTourIdentity(identity: string): Promise<string | null> {
  try {
    const bytes = new TextEncoder().encode(identity);
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
  } catch { return null; } // Never block sign-in or share progress between unidentified users.
}
