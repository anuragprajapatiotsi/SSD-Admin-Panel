import { cva, type VariantProps } from "class-variance-authority";

export const statusColorVariants = cva(
  "[--status-color:var(--color-foreground)] [--status-text:var(--color-foreground)]",
  {
    variants: {
      variant: {
        default: "[--status-color:var(--color-foreground)] [--status-text:var(--color-foreground)]",
        neutral: "[--status-color:var(--color-slate-500)] [--status-text:var(--color-slate-900)]",
        success: "[--status-color:var(--color-green-600)] [--status-text:var(--color-green-900)]",
        destructive: "[--status-color:var(--color-red-600)] [--status-text:var(--color-red-900)]",
        warning: "[--status-color:var(--color-orange-500)] [--status-text:var(--color-orange-900)]",
        info: "[--status-color:var(--color-cyan-600)] [--status-text:var(--color-cyan-900)]",
        progress: "[--status-color:var(--color-blue-600)] [--status-text:var(--color-blue-900)]",
        ready: "[--status-color:var(--color-violet-600)] [--status-text:var(--color-violet-900)]",
        partial: "[--status-color:var(--color-amber-500)] [--status-text:var(--color-amber-900)]",
        published: "[--status-color:var(--color-emerald-600)] [--status-text:var(--color-emerald-900)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export type StatusVariant = NonNullable<
  VariantProps<typeof statusColorVariants>["variant"]
>;

export const STATUS_VARIANT_BY_STATUS = {
  ALL: "default",
  ACTIVE: "success",
  ENABLED: "success",
  APPROVED: "success",
  PUBLISHED: "published",
  COMPLETED: "success",
  SUCCESS: "success",
  SUCCEEDED: "success",
  SUBMITTED: "success",
  RESUBMITTED: "success",
  OVERDUE: "destructive",
  RETURNED: "destructive",
  WARNING: "warning",
  REVIEW_PENDING: "warning",
  PENDING_REVIEW: "warning",
  QUEUED: "neutral",
  INFO: "info",
  ERROR: "destructive",
  FAILED: "destructive",
  REJECTED: "destructive",
  COMPLETED_WITH_ERRORS: "destructive",
  PENDING: "warning",
  IN_QUEUE: "neutral",
  PROCESSING: "progress",
  READY: "success",
  ATTACHED: "info",
  UPLOADING: "progress",
  UPLOADED: "success",
  UNSAVED: "warning",
  IN_REVIEW: "warning",
  UNDER_REVIEW: "warning",
  PARTIALLY_PUBLISHED: "partial",
  IN_PROGRESS: "progress",
  READY_TO_PUBLISH: "ready",
  SENT: "info",
  INACTIVE: "neutral",
  DISABLED: "neutral",
  NOT_STARTED: "neutral",
  DRAFT: "info",
} as const satisfies Readonly<Record<string, StatusVariant>>;

export function normalizeStatusVariant(status: string): StatusVariant {
  const normalizedStatus = status.trim().toUpperCase().replace(/[\s-]+/g, "_");
  return STATUS_VARIANT_BY_STATUS[
    normalizedStatus as keyof typeof STATUS_VARIANT_BY_STATUS
  ] ?? "default";
}
