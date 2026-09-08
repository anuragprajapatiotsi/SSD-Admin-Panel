/** Creates an API-safe code of at most 80 characters with a 128-bit random suffix. */
export function generateNameCode(name: string): string {
  const stem = name.normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_+|_+$/g, "")
    .slice(0, 47)
    .replace(/_+$/g, "") || "RECORD";
  const suffix = Array.from(crypto.getRandomValues(new Uint8Array(16)),
    (byte) => byte.toString(16).padStart(2, "0")).join("").toUpperCase();
  return `${stem}_${suffix}`;
}
