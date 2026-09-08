import type { RequestAccessAssignment } from "@/api/requests.api";

export type ProviderEntryMode = "online" | "upload";

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === "object" && !Array.isArray(value) ? value as Record<string, unknown> : {};
}

function status(value: unknown) {
  return typeof value === "string" ? value.trim().toUpperCase().replaceAll(" ", "_") : "";
}

// Use the latest submission, never a previous version's review or the draft status.
export function providerSubmissionReview(item: RequestAccessAssignment, fallbackState?: Record<string, unknown>) {
  const state = item.dataEntryState ?? fallbackState;
  const latest = record(state?.latestSubmission);
  const lifecycle = status(latest.lifecycleStatus || item.lifecycleStatus);
  const submission = status(latest.submissionStatus || item.status);
  const review = status(latest.reviewStatus || item.reviewStatus);
  const approval = status(latest.approvalStatus || item.approvalStatus);
  const publication = status(latest.publicationStatus || item.publicationStatus);
  const locked = ["SUBMITTED", "RESUBMITTED", "APPROVED"].includes(submission)
    || ["REVIEW_PENDING", "IN_REVIEW", "APPROVED", "PUBLISHED", "COMPLETED"].includes(lifecycle)
    || ["PENDING_REVIEW", "IN_REVIEW", "APPROVED"].includes(review)
    || approval === "APPROVED" || publication === "PUBLISHED";
  const returned = !locked && [lifecycle, submission, review].includes("RETURNED");
  const metadata = record(latest.reviewMetadata);
  const comments = returned && typeof metadata.comments === "string" ? metadata.comments.trim() : "";
  return { locked, returned, comments };
}

export function providerAssignmentName(item: RequestAccessAssignment, fallback: string) {
  const name = item.templateName ?? item.template?.templateName ?? item.template?.template_name;
  return typeof name === "string" && name.trim() ? name : item.indicatorLabel || item.indicatorName || item.department || item.ministry || fallback;
}

export function providerDate(value: string, locale: string) {
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const date = new Date(dateOnly ? `${value}T00:00:00Z` : value);
  return Number.isNaN(date.getTime()) ? value : new Intl.DateTimeFormat(locale, {
    day: "numeric", month: "short", year: "numeric", ...(dateOnly ? { timeZone: "UTC" } : {}),
  }).format(date);
}
