import { useTranslation } from "react-i18next";
import { Loader } from "@/components/common/loader";
import { PageHeader } from "@/components/common/page-layout";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { StatusBadge } from "@/components/common/status-badge";
import { normalizeStatusVariant } from "@/components/common/status-variants";
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty";

import { CardContent, Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DataTableReport } from "@/components/data-table/data-table-report";
import { NativeSelect, NativeSelectOption } from "@/components/ui/native-select";

import { Button } from "@/components/ui/button";
import {
  BarChart3,
  BookOpen,
  Building2,
  Download,
  ExternalLink,
  FileCheck,
  GitBranch,
  Inbox,
  Link2,
  RefreshCw,
  Search,
  Send,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import {
  listDispatchAccessLinks,
  listRequestPublishedFactsIndex,
  listRequestPublishedObservations,
  listSubmissionMonitor,
  type DispatchAccessLinkRow,
  type RequestPublishedFactsIndexRow,
  type RequestPublishedObservationRow,
  type SubmissionMonitorRow,
} from "../../api/requests.api";
import { getSelectedUnitCode } from "../../api/session.api";

type WorkflowMode =
  | "overview-dashboard"
  | "unit-dashboard"
  | "dispatch-history"
  | "data-entry-links"
  | "data-entry-assignments"
  | "review-dashboard"
  | "review-queue"
  | "review-approvals"
  | "published-index"
  | "published-approved"
  | "published-observations"
  | "published-computed";

type WorkflowMonitorPageProps = {
  mode: WorkflowMode;
};

const MODE_COPY: Record<WorkflowMode, { eyebrow: string; title: string; description: string }> = {
  "overview-dashboard": {
    eyebrow: "Dashboard",
    title: "SSD Overview",
    description: "Selected-pillar lifecycle view for dispatches, submissions, reviews, approvals, and publication.",
  },
  "unit-dashboard": {
    eyebrow: "Dashboard",
    title: "Dashboard",
    description: "Lifecycle and compliance summary for the selected pillar scope.",
  },
  "dispatch-history": {
    eyebrow: "Requests",
    title: "Dispatch History",
    description: "Track every request send cycle, including single and batch dispatches.",
  },
  "data-entry-links": {
    eyebrow: "Data Entry",
    title: "Dispatch Links",
    description: "See request links generated for dispatches and open assignment context from the logged-in application.",
  },
  "data-entry-assignments": {
    eyebrow: "Data Entry",
    title: "Assignments",
    description: "Assigned templates by source, indicator, request period, and data-entry status.",
  },
  "review-dashboard": {
    eyebrow: "Review",
    title: "Review Dashboard",
    description: "Reviewer workload, pending approval levels, returned submissions, and approved items.",
  },
  "review-queue": {
    eyebrow: "Review",
    title: "Review Queue",
    description: "Submissions that need review or approval action.",
  },
  "review-approvals": {
    eyebrow: "Review",
    title: "Approvals",
    description: "Approval decisions and level-wise progress for submitted data.",
  },
  "published-index": {
    eyebrow: "Published Facts",
    title: "Published Index",
    description: "Index of indicators with approved/published periods, grouped by framework and source.",
  },
  "published-approved": {
    eyebrow: "Published Facts",
    title: "Approved Data",
    description: "Approved submission snapshots ready for reporting and publication review.",
  },
  "published-observations": {
    eyebrow: "Published Facts",
    title: "Observations",
    description: "Cell-level published facts for dashboards, exports, and downstream analytics.",
  },
  "published-computed": {
    eyebrow: "Published Facts",
    title: "Computed Facts",
    description: "Computed, calculated, rollup, and selected publication facts once backend publication projection is available.",
  },
};

function textValue(value: unknown, fallback = "-") {
  return typeof value === "string" && value.trim() ? value.trim() : fallback;
}

function numberValue(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalize(value: unknown) {
  return textValue(value, "").toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

function titleCaseStatus(value: unknown, fallback = "Unknown") {
  const clean = textValue(value, fallback).replace(/_/g, " ").toLowerCase();
  return clean.replace(/\b\w/g, (char) => char.toUpperCase());
}

function formatDate(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function formatDateTime(value?: string | null) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return date.toLocaleString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function groupBy<T>(items: T[], keyFor: (item: T) => string) {
  return items.reduce<Map<string, T[]>>((groups, item) => {
    const key = keyFor(item) || "-";
    groups.set(key, [...(groups.get(key) ?? []), item]);
    return groups;
  }, new Map<string, T[]>());
}

function rowLifecycle(row: SubmissionMonitorRow) {
  const publication = normalize(row.publicationStatus);
  const approval = normalize(row.approvalStatus);
  const review = normalize(row.reviewStatus);
  const submission = normalize(row.submissionStatus);
  const lifecycle = normalize(row.lifecycleStatus);
  if (publication === "PUBLISHED" || lifecycle === "PUBLISHED") return "Published";
  if (approval === "APPROVED" || lifecycle === "APPROVED") return "Approved";
  if (review.includes("REVIEW") || lifecycle.includes("REVIEW")) return "In Review";
  if (submission === "SUBMITTED" || submission === "RESUBMITTED") return "Submitted";
  if (submission === "IN_PROGRESS" || lifecycle === "IN_PROGRESS" || lifecycle === "DRAFT") return "In Progress";
  if (normalize(row.dispatchStatus) === "SENT") return "Sent";
  return titleCaseStatus(row.dispatchStatus, "Ready");
}

function lastActivity(row: SubmissionMonitorRow) {
  return row.latestPublishedAt || row.submittedAt || row.lastDraftSavedAt || row.lastNotificationAt || row.sentAt || "";
}

function isOverdue(row: SubmissionMonitorRow) {
  if (!row.dueDate || ["PUBLISHED", "APPROVED"].includes(normalize(row.publicationStatus || row.approvalStatus))) {
    return false;
  }
  const due = new Date(row.dueDate);
  if (Number.isNaN(due.getTime())) return false;
  return due.getTime() < Date.now() && !["SUBMITTED", "RESUBMITTED"].includes(normalize(row.submissionStatus));
}

function isReviewRow(row: SubmissionMonitorRow) {
  const submission = normalize(row.submissionStatus);
  const review = normalize(row.reviewStatus);
  const approval = normalize(row.approvalStatus);
  const publication = normalize(row.publicationStatus);
  return (
    ["SUBMITTED", "RESUBMITTED"].includes(submission) ||
    review.includes("REVIEW") ||
    approval.includes("PENDING") ||
    (approval === "APPROVED" && publication !== "PUBLISHED")
  );
}

function isPublishedRow(row: SubmissionMonitorRow) {
  return rowLifecycle(row) === "Published" || numberValue(row.publishedObservationCount) > 0;
}

function frameworkPath(row: SubmissionMonitorRow) {
  const indicator = textValue(row.indicatorCode, "");
  const parts = indicator.replace(/^[A-Z]+[_-]?/i, "").split(/[_./-]+/).filter(Boolean);
  if (parts.length >= 3) {
    return [`Level 1 ${parts[0]}`, `Level 2 ${parts[0]}.${parts[1]}`, `Indicator ${parts.join(".")}`];
  }
  if (parts.length >= 2) return [`Level 1 ${parts[0]}`, `Indicator ${parts.join(".")}`];
  return ["Framework", indicator || textValue(row.indicatorName, "Unmapped indicator")];
}

function csvValue(value: unknown) {
  return `"${textValue(value, "").replace(/"/g, '""')}"`;
}

function exportRows(rows: SubmissionMonitorRow[], filename: string) {
  const header = [
    "Unit",
    "Ministry",
    "Department",
    "Dispatch",
    "Run Item",
    "Template",
    "Indicator Code",
    "Indicator Name",
    "Period",
    "Due Date",
    "Lifecycle",
    "Submission Status",
    "Review Status",
    "Approval Status",
    "Publication Status",
    "Published Observations",
    "Last Activity",
  ];
  const lines = rows.map((row) =>
    [
      row.unitCode,
      row.ministryName,
      row.departmentName,
      row.dispatchRunCode,
      row.runItemCode,
      row.templateName || row.templateVersionCode,
      row.indicatorCode,
      row.indicatorName,
      row.requestPeriodLabel || row.reportingPeriodLabel,
      row.dueDate,
      rowLifecycle(row),
      row.submissionStatus,
      row.reviewStatus,
      row.approvalStatus,
      row.publicationStatus,
      row.publishedObservationCount,
      lastActivity(row),
    ]
      .map(csvValue)
      .join(","),
  );
  const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function exportObjects(rows: Record<string, unknown>[], filename: string) {
  if (!rows.length) {
    exportRows([], filename);
    return;
  }
  const header = Array.from(rows.reduce<Set<string>>((keys, row) => {
    Object.keys(row).forEach((key) => keys.add(key));
    return keys;
  }, new Set<string>()));
  const lines = rows.map((row) => header.map((key) => csvValue(row[key])).join(","));
  const blob = new Blob([[header.join(","), ...lines].join("\n")], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function getModeRows(mode: WorkflowMode, rows: SubmissionMonitorRow[]) {
  if (mode === "review-dashboard" || mode === "review-queue" || mode === "review-approvals") {
    return rows.filter(isReviewRow);
  }
  if (mode === "published-index" || mode === "published-approved" || mode === "published-observations" || mode === "published-computed") {
    return rows.filter(isPublishedRow);
  }
  return rows;
}

function isPublishedMode(mode: WorkflowMode) {
  return mode === "published-index" || mode === "published-approved" || mode === "published-observations" || mode === "published-computed";
}

function isObservationMode(mode: WorkflowMode) {
  return mode === "published-observations" || mode === "published-computed";
}

function dispatchCodePreview(value: unknown, maxWords = 4) {
  const full = textValue(value, "Not generated");
  const words = full.split(/[_\s-]+/).filter(Boolean);
  if (words.length <= maxWords) {
    return { full, short: full, hasMore: false };
  }
  return { full, short: `${words.slice(0, maxWords).join("_")}...`, hasMore: true };
}

function dispatchDetailPath(row: SubmissionMonitorRow, options: { submissionTab?: boolean } = {}) {
  const dispatchRunCode = textValue(row.dispatchRunCode, "");
  if (!dispatchRunCode) return "";
  const params = new URLSearchParams();
  const runItemCode = textValue(row.runItemCode, "");
  if (options.submissionTab || runItemCode) params.set("tab", "SUBMISSION");
  if (runItemCode) params.set("run_item_code", runItemCode);
  const query = params.toString();
  return `/requests/dispatch-runs/${encodeURIComponent(dispatchRunCode)}${query ? `?${query}` : ""}`;
}

function DispatchCodeCell({ code, expanded, onToggle }: { code: unknown; expanded: boolean; onToggle: () => void }) {
  const preview = dispatchCodePreview(code);
  return (
    <div className="flex min-w-0 flex-col gap-1 [&>span]:text-xs [&>span]:text-muted-foreground">
      <strong title={preview.full}>{expanded ? preview.full : preview.short}</strong>
      {preview.hasMore ? (
        <Button type="button" onClick={onToggle}>
          {expanded ? "Less" : "More"}
        </Button>
      ) : null}
    </div>
  );
}

function DispatchLinkCodeCell({ row }: { row: DispatchAccessLinkRow }) {
  const dispatch = dispatchCodePreview(row.dispatchRunCode, 5);
  const item = dispatchCodePreview(row.runItemCode, 3);
  const hasItem = textValue(row.runItemCode, "").trim().length > 0;

  return (
    <div className="flex min-w-0 flex-col gap-1 [&>span]:text-xs [&>span]:text-muted-foreground">
      <strong title={dispatch.full}>{dispatch.short}</strong>
      {hasItem ? <span title={item.full}>Item {item.short}</span> : null}
    </div>
  );
}

function summarizeDispatchValues(rows: SubmissionMonitorRow[], selector: (row: SubmissionMonitorRow) => unknown, fallback = "-") {
  const values = Array.from(new Set(rows.map((row) => textValue(selector(row), fallback)).filter((value) => value !== "-")));
  if (!values.length) {
    return { primary: fallback, secondary: "", title: fallback };
  }
  return {
    primary: values[0],
    secondary: values.length > 1 ? `+${values.length - 1} more` : "",
    title: values.join(", "),
  };
}

function DispatchHistoryCountCell({ items }: { items: SubmissionMonitorRow[] }) {
  const counts = [
    { key: "dispatches", label: "Runs", value: 1 },
    { key: "items", label: "Items", value: items.length },
    { key: "published", label: "Published", value: items.filter(isPublishedRow).length },
    { key: "overdue", label: "Overdue", value: items.filter(isOverdue).length },
  ];

  return (
    <div className="flex flex-wrap items-center gap-1.5" aria-label="Dispatch row summary">
      {counts.map((count) => (
        <span className={count.key === "overdue" && count.value > 0 ? "text-xs tabular-nums text-destructive" : "text-xs tabular-nums text-muted-foreground"} key={count.key}>
          <strong>{count.value}</strong>
          <small>{count.label}</small>
        </span>
      ))}
    </div>
  );
}

function SourceCell({ row }: { row: SubmissionMonitorRow }) {
  const ministry = textValue(row.ministryName, "Source pending");
  const department = textValue(row.departmentName, "");
  const showDepartment = department.length > 0 && normalize(department) !== normalize(ministry);

  return (
    <div className="flex min-w-40 flex-col gap-0.5 whitespace-normal [&>span]:text-muted-foreground">
      <strong title={ministry}>{ministry}</strong>
      {showDepartment ? <span title={department}>{department}</span> : null}
    </div>
  );
}

function RowSummary({ row, onOpen }: { row: SubmissionMonitorRow; onOpen: (row: SubmissionMonitorRow) => void }) {
  return (
    <div>
      <div>
        <strong>
          {textValue(row.indicatorCode)} - {textValue(row.indicatorName, "Indicator")}
        </strong>
        <span>{textValue(row.ministryName, "Source pending")} / {textValue(row.departmentName)}</span>
      </div>
      <div>
        <span>{textValue(row.requestPeriodLabel || row.reportingPeriodLabel)}</span>
        <small>Last {formatDateTime(lastActivity(row))}</small>
      </div>
      <Button variant="outline" type="button" onClick={() => onOpen(row)}>
        <ExternalLink size={13} /> Open
      </Button>
    </div>
  );
}

export function WorkflowMonitorPage({ mode }: WorkflowMonitorPageProps) {
  const { t } = useTranslation("common");
  const config = MODE_COPY[mode];
  const unitCode = getSelectedUnitCode();
  const navigate = useNavigate();
  const [rows, setRows] = useState<SubmissionMonitorRow[]>([]);
  const [accessRows, setAccessRows] = useState<DispatchAccessLinkRow[]>([]);
  const [publishedIndexRows, setPublishedIndexRows] = useState<RequestPublishedFactsIndexRow[]>([]);
  const [publishedObservationRows, setPublishedObservationRows] = useState<RequestPublishedObservationRow[]>([]);
  const [searchText, setSearchText] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [expandedDispatchCodes, setExpandedDispatchCodes] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  async function loadRows() {
    setIsLoading(true);
    setError("");
    try {
      if (mode === "data-entry-links" || mode === "data-entry-assignments") {
        setAccessRows(
          await listDispatchAccessLinks({
            unitCode,
            searchText: searchText.trim() || undefined,
            includeLink: true,
            limit: 800,
          }),
        );
        setRows([]);
      } else if (mode === "published-index" || mode === "published-approved") {
        setPublishedIndexRows(
          await listRequestPublishedFactsIndex({
            unitCode,
            searchText: searchText.trim() || undefined,
            limit: 800,
          }),
        );
        setRows([]);
      } else if (isObservationMode(mode)) {
        setPublishedObservationRows(
          await listRequestPublishedObservations({
            unitCode,
            includeGenerated: true,
            limit: 1000,
          }),
        );
        setRows([]);
      } else {
        setRows(
          await listSubmissionMonitor({
            unitCode,
            searchText: searchText.trim() || undefined,
            limit: 800,
          }),
        );
      }
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : `${config.title} could not be loaded.`);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    const timer = window.setTimeout(() => void loadRows(), 250);
    return () => window.clearTimeout(timer);
  }, [mode, unitCode, searchText]);

  const modeRows = useMemo(() => getModeRows(mode, rows), [mode, rows]);
  const filteredRows = useMemo(() => {
    if (statusFilter === "ALL") return modeRows;
    return modeRows.filter((row) => normalize(rowLifecycle(row)) === statusFilter);
  }, [modeRows, statusFilter]);

  const metrics = useMemo(() => {
    if (mode === "data-entry-links" || mode === "data-entry-assignments") {
      return {
        total: accessRows.length,
        sent: accessRows.filter((row) => normalize(row.notificationStatus) === "SENT").length,
        inProgress: accessRows.filter((row) => normalize(row.submissionStatus) === "IN_PROGRESS").length,
        submitted: accessRows.filter((row) => ["SUBMITTED", "RESUBMITTED"].includes(normalize(row.submissionStatus))).length,
        review: 0,
        approved: 0,
        published: 0,
        overdue: accessRows.filter((row) => {
          const due = row.dueDate ? new Date(row.dueDate) : null;
          return due && !Number.isNaN(due.getTime()) && due.getTime() < Date.now() && normalize(row.submissionStatus) !== "SUBMITTED";
        }).length,
      };
    }
    if (mode === "published-index" || mode === "published-approved") {
      return {
        total: publishedIndexRows.length,
        sent: 0,
        inProgress: 0,
        submitted: 0,
        review: 0,
        approved: publishedIndexRows.length,
        published: publishedIndexRows.length,
        overdue: 0,
      };
    }
    if (isObservationMode(mode)) {
      return {
        total: publishedObservationRows.length,
        sent: 0,
        inProgress: 0,
        submitted: 0,
        review: 0,
        approved: publishedObservationRows.length,
        published: publishedObservationRows.length,
        overdue: 0,
      };
    }
    const lifecycleCounts = filteredRows.reduce<Record<string, number>>((counts, row) => {
      const key = rowLifecycle(row);
      counts[key] = (counts[key] ?? 0) + 1;
      return counts;
    }, {});
    return {
      total: filteredRows.length,
      sent: lifecycleCounts.Sent ?? 0,
      inProgress: lifecycleCounts["In Progress"] ?? 0,
      submitted: lifecycleCounts.Submitted ?? 0,
      review: lifecycleCounts["In Review"] ?? 0,
      approved: lifecycleCounts.Approved ?? 0,
      published: lifecycleCounts.Published ?? 0,
      overdue: filteredRows.filter(isOverdue).length,
    };
  }, [accessRows, filteredRows, mode, publishedIndexRows, publishedObservationRows]);

  const ministryGroups = useMemo(
    () => Array.from(groupBy(filteredRows, (row) => textValue(row.ministryName, "Source pending")).entries()),
    [filteredRows],
  );
  const dispatchGroups = useMemo(
    () => Array.from(groupBy(filteredRows, (row) => textValue(row.dispatchRunCode, "Not generated")).entries()),
    [filteredRows],
  );
  const frameworkGroups = useMemo(() => {
    return Array.from(groupBy(filteredRows, (row) => frameworkPath(row)[0]).entries()).map(([levelOne, levelRows]) => ({
      levelOne,
      children: Array.from(groupBy(levelRows, (row) => frameworkPath(row)[1]).entries()),
    }));
  }, [filteredRows]);

  const statusBars = [
    ["Sent", metrics.sent],
    ["In Progress", metrics.inProgress],
    ["Submitted", metrics.submitted],
    ["Review", metrics.review],
    ["Approved", metrics.approved],
    ["Published", metrics.published],
  ] as const;
  const maxStatus = Math.max(1, ...statusBars.map(([, value]) => value));
  const unpublishedCount = Math.max(0, metrics.total - metrics.published);
  const dashboardFunnel = [
    { label: "Assigned", count: metrics.total, helper: "Total items" },
    { label: "Submitted", count: metrics.submitted, helper: "Submitted by source" },
    { label: "Review", count: metrics.review, helper: "Needs review" },
    { label: "Approved", count: metrics.approved, helper: "Approved items" },
    { label: "Published", count: metrics.published, helper: "Published facts" },
  ] as const;
  const dashboardAttention = [
    { label: "Overdue", count: metrics.overdue, detail: "Past due and not submitted" },
    { label: "Pending Review", count: metrics.review, detail: "Waiting with reviewers" },
    { label: "Unpublished", count: unpublishedCount, detail: "Not yet published" },
  ] as const;
  const ministryStatusRows = useMemo(
    () => ministryGroups
      .map(([ministry, items]) => {
        const assigned = items.length;
        const submitted = items.filter((row) => {
          const lifecycle = rowLifecycle(row);
          return ["Submitted", "In Review", "Approved", "Published"].includes(lifecycle) || ["SUBMITTED", "RESUBMITTED"].includes(normalize(row.submissionStatus));
        }).length;
        const review = items.filter((row) => rowLifecycle(row) === "In Review").length;
        const approved = items.filter((row) => rowLifecycle(row) === "Approved").length;
        const published = items.filter(isPublishedRow).length;
        const overdue = items.filter(isOverdue).length;
        return {
          ministry,
          assigned,
          submitted,
          review,
          approved,
          published,
          overdue,
          completion: assigned ? Math.round((published / assigned) * 100) : 0,
          row: items[0],
        };
      })
      .sort((left, right) => right.overdue - left.overdue || right.review - left.review || right.assigned - left.assigned || left.ministry.localeCompare(right.ministry))
      .slice(0, 8),
    [ministryGroups],
  );
  const unitCompletion = metrics.total ? Math.round((metrics.published / metrics.total) * 100) : 0;
  const unitLatestActivity = useMemo(() => {
    const latest = filteredRows
      .map((row) => lastActivity(row))
      .map((value) => ({ value, time: value ? new Date(value).getTime() : 0 }))
      .filter((entry) => Number.isFinite(entry.time) && entry.time > 0)
      .sort((left, right) => right.time - left.time)[0];
    return latest?.value ?? "";
  }, [filteredRows]);
  const unitNotStartedOrInProgress = filteredRows.filter((row) => {
    const submission = normalize(row.submissionStatus);
    const lifecycle = rowLifecycle(row);
    return ["NOT_STARTED", "IN_PROGRESS", "DRAFT"].includes(submission) || ["Sent", "In Progress"].includes(lifecycle);
  }).length;
  const unitLifecycleFlow = [
    { label: "Assigned", count: metrics.total, helper: "Total scope" },
    { label: "Sent", count: metrics.sent, helper: "Requests sent" },
    { label: "In Progress", count: metrics.inProgress, helper: "Being filled" },
    { label: "Submitted", count: metrics.submitted, helper: "Source submitted" },
    { label: "Review", count: metrics.review, helper: "Reviewer queue" },
    { label: "Approved", count: metrics.approved, helper: "Approved" },
    { label: "Published", count: metrics.published, helper: "Published facts" },
  ] as const;
  const unitActionRequired = [
    { label: "Overdue", count: metrics.overdue, detail: "Past due submissions" },
    { label: "Pending Review", count: metrics.review, detail: "Waiting for review" },
    { label: "Unpublished", count: unpublishedCount, detail: "Approved or assigned, not published" },
    { label: "Not Started / In Progress", count: unitNotStartedOrInProgress, detail: "Still with source users" },
  ] as const;
  const unitSourceRows = useMemo(
    () => Array.from(
      groupBy(filteredRows, (row) => {
        const source = textValue(row.ministryName, "Source pending");
        const department = textValue(row.departmentName, "");
        if (!department || normalize(department) === normalize(source)) return source;
        return `${source} / ${department}`;
      }).entries(),
    )
      .map(([source, items]) => {
        const assigned = items.length;
        const submitted = items.filter((row) => {
          const lifecycle = rowLifecycle(row);
          return ["Submitted", "In Review", "Approved", "Published"].includes(lifecycle) || ["SUBMITTED", "RESUBMITTED"].includes(normalize(row.submissionStatus));
        }).length;
        const review = items.filter((row) => rowLifecycle(row) === "In Review").length;
        const approved = items.filter((row) => rowLifecycle(row) === "Approved").length;
        const published = items.filter(isPublishedRow).length;
        const overdue = items.filter(isOverdue).length;
        return {
          source,
          assigned,
          submitted,
          review,
          approved,
          published,
          overdue,
          completion: assigned ? Math.round((published / assigned) * 100) : 0,
          row: items[0],
        };
      })
      .sort((left, right) => right.overdue - left.overdue || right.review - left.review || right.assigned - left.assigned || left.source.localeCompare(right.source))
      .slice(0, 10),
    [filteredRows],
  );
  const unitRecentRows = useMemo(
    () => [...filteredRows]
      .sort((left, right) => {
        const leftTime = lastActivity(left) ? new Date(lastActivity(left)).getTime() : 0;
        const rightTime = lastActivity(right) ? new Date(lastActivity(right)).getTime() : 0;
        return (Number.isFinite(rightTime) ? rightTime : 0) - (Number.isFinite(leftTime) ? leftTime : 0);
      })
      .slice(0, 5),
    [filteredRows],
  );

  function openDispatch(row: SubmissionMonitorRow) {
    const path = dispatchDetailPath(row, { submissionTab: mode.startsWith("review") || mode.startsWith("published") });
    if (path) navigate(path);
  }

  const publishedFrameworkGroups = useMemo(() => {
    return Array.from(
      groupBy(publishedIndexRows, (row) => frameworkPath({ indicatorCode: row.indicatorCode, indicatorName: row.indicatorName } as SubmissionMonitorRow)[0]).entries(),
    ).map(([levelOne, levelRows]) => ({
      levelOne,
      children: Array.from(
        groupBy(levelRows, (row) => frameworkPath({ indicatorCode: row.indicatorCode, indicatorName: row.indicatorName } as SubmissionMonitorRow)[1]).entries(),
      ),
    }));
  }, [publishedIndexRows]);

  const visibleObservationRows = useMemo(() => {
    const searched = searchText.trim().toLowerCase();
    const base = mode === "published-computed"
      ? publishedObservationRows.filter((row) => row.isGenerated)
      : publishedObservationRows;
    if (!searched) return base;
    return base.filter((row) =>
      [
        row.snapshotCode,
        row.indicatorCode,
        row.indicatorName,
        row.cellKey,
        row.ministryName,
        row.departmentName,
        row.approvedValueText,
        row.approvedValueNumeric,
      ]
        .some((value) => String(value ?? "").toLowerCase().includes(searched)),
    );
  }, [mode, publishedObservationRows, searchText]);

  const assignmentGroups = useMemo(() => {
    return Array.from(
      groupBy(accessRows, (row) => {
        const ministry = textValue(row.ministryName, "Source pending");
        const department = textValue(row.departmentName, "");
        if (!department || normalize(department) === normalize(ministry)) {
          return ministry;
        }
        return `${ministry} / ${department}`;
      }).entries(),
    );
  }, [accessRows]);

  function exportCurrentRows() {
    if (mode === "data-entry-links" || mode === "data-entry-assignments") {
      exportObjects(accessRows as unknown as Record<string, unknown>[], `${mode}.csv`);
      return;
    }
    if (mode === "published-index" || mode === "published-approved") {
      exportObjects(publishedIndexRows as unknown as Record<string, unknown>[], `${mode}.csv`);
      return;
    }
    if (isObservationMode(mode)) {
      exportObjects(visibleObservationRows as unknown as Record<string, unknown>[], `${mode}.csv`);
      return;
    }
    exportRows(filteredRows, `${mode}.csv`);
  }

  const isDispatchHistoryMode = mode === "dispatch-history";
  const showSectionEyebrow = false;
  const useAdminFacingLifecycleTable = mode === "review-queue" || mode === "review-approvals";
  const dispatchHistoryRows = useMemo(
    () => dispatchGroups.map(([dispatchCode, items]) => ({ dispatchCode, items, row: items[0] })).filter((entry) => Boolean(entry.row)),
    [dispatchGroups],
  );

  function toggleDispatchCode(code: string) {
    setExpandedDispatchCodes((current) => current.includes(code) ? current.filter((item) => item !== code) : [...current, code]);
  }

  return (
    <section className="flex min-w-0 flex-col gap-4">
      {error ? <div className="toast-message text-destructive">{error}</div> : null}
      <PageHeader>
        <div>
          {showSectionEyebrow ? <p className="text-xs font-medium text-muted-foreground">{config.eyebrow}</p> : null}
          <h1>{config.title}</h1>
          <p>{config.description}</p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button variant="outline" type="button" onClick={exportCurrentRows}>
            <Download size={14} /> Export CSV
          </Button>
          <Button variant="outline" type="button" onClick={() => void loadRows()}>
            <RefreshCw size={14} /> Refresh
          </Button>
        </div>
      </PageHeader>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-6">
        {(["total", "submitted", "review", "approved", "published", "overdue"] as const).map((key) => (
          <Card key={key}><CardContent className="flex flex-col gap-1">
            <span className="text-xs text-muted-foreground">{t(`overviewMetrics.${key}`)}</span>
            <strong className="text-2xl font-semibold tabular-nums">{metrics[key]}</strong>
          </CardContent></Card>
        ))}
      </div>

      <div className="flex min-w-0 flex-wrap items-center gap-3">
        <InputGroup className="w-full sm:max-w-md">
          <InputGroupAddon><Search aria-hidden="true" /></InputGroupAddon>
          <InputGroupInput
            aria-label={t("overviewMetrics.search")}
            value={searchText}
            onChange={(event) => setSearchText(event.target.value)}
            placeholder={t("pages.sourcesMinistries.workflowSearch")}
          />
        </InputGroup>
        <NativeSelect aria-label={t("overviewMetrics.status")} value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)}>
          <NativeSelectOption value="ALL">All lifecycle statuses</NativeSelectOption>
          <NativeSelectOption value="SENT">Sent</NativeSelectOption>
          <NativeSelectOption value="IN_PROGRESS">In Progress</NativeSelectOption>
          <NativeSelectOption value="SUBMITTED">Submitted</NativeSelectOption>
          <NativeSelectOption value="IN_REVIEW">In Review</NativeSelectOption>
          <NativeSelectOption value="APPROVED">Approved</NativeSelectOption>
          <NativeSelectOption value="PUBLISHED">Published</NativeSelectOption>
        </NativeSelect>
      </div>

      {mode === "data-entry-links" ? (
        <div className="flex min-w-0 flex-col gap-3">
          <section className="flex min-w-0 flex-col gap-3 [&>header]:flex [&>header]:flex-wrap [&>header]:items-center [&>header]:justify-between [&>header]:gap-2 [&>header_span]:text-xs [&>header_span]:text-muted-foreground">
            <header>
              <div>
                <strong>Generated Request Links</strong>
                <span>Encrypted token links are available for authorized app users.</span>
              </div>
              <StatusBadge variant={normalizeStatusVariant("info")}><Link2 size={12} /> Token protected</StatusBadge>
            </header>
            <div className="min-w-0 overflow-x-auto">
              <DataTableReport ariaLabel={t("reportTable.label")} isLoading={isLoading} headers={["Dispatch",
                "Recipient",
                "Indicator",
                "Source",
                "Period",
                "Notification",
                "Action"]} rows={accessRows.map((row, index) => (
                  ({
                    id: `${row.dispatchRunCode}-${row.runItemCode}-${row.recipientBucket}-${index}`, cells: [<div key="cell-0" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground "><DispatchLinkCodeCell row={row} /></div>,
                    <div key="cell-1" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground "><strong>{textValue(row.recipientName, "Officer")}</strong><span>{textValue(row.recipientBucket)}</span></div>,
                    <div key="cell-2" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground "><strong>{textValue(row.indicatorCode)}</strong><span>{textValue(row.indicatorName)}</span></div>,
                    <SourceCell key="cell-3" row={row} />,
                    <div key="cell-4" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground "><strong>{textValue(row.requestPeriodLabel || row.reportingPeriodLabel)}</strong><span>Due {formatDate(row.dueDate)}</span></div>,
                    <div key="cell-5" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground "><StatusBadge variant={normalizeStatusVariant(`${String(row.notificationStatus)}`)}>{titleCaseStatus(row.notificationStatus, "Queued")}</StatusBadge></div>,
                    <div key="cell-6" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground text-right">{row.accessUrl ? (
                      <Button variant="outline" type="button" onClick={() => window.open(row.accessUrl, "_blank", "noopener,noreferrer")}>
                        <ExternalLink size={13} /> Open Link
                      </Button>
                    ) : (
                      <StatusBadge variant={normalizeStatusVariant("queued")}>Not generated</StatusBadge>
                    )}</div>]
                  })
                ))} />
            </div>
          </section>
          {!accessRows.length ? (isLoading ? <Loader text={"Loading request links..."} /> : <Empty><EmptyHeader><EmptyTitle>{"No dispatch links found."}</EmptyTitle></EmptyHeader></Empty>) : null}
        </div>
      ) : null}

      {mode === "data-entry-assignments" ? (
        <div className="flex min-w-0 flex-col gap-3">
          {assignmentGroups.map(([groupName, items]) => (
            <section className="flex min-w-0 flex-col gap-3 [&>header]:flex [&>header]:flex-wrap [&>header]:items-center [&>header]:justify-between [&>header]:gap-2 [&>header_span]:text-xs [&>header_span]:text-muted-foreground" key={groupName}>
              <header>
                <div>
                  <strong>{groupName}</strong>
                  <span>{items.length} assignment(s) - Pillar {unitCode}</span>
                </div>
              </header>
              <div className="min-w-0 overflow-x-auto">
                <DataTableReport ariaLabel={t("reportTable.label")} isLoading={isLoading} headers={["Officer",
                  "Indicator",
                  "Template",
                  "Request Period",
                  "Submission",
                  "Notification",
                  "Action"]} rows={items.map((row, index) => (
                    ({
                      id: `${row.dispatchRunCode}-${row.runItemCode}-${row.recipientBucket}-${index}`, cells: [<div key="cell-0" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground "><strong>{textValue(row.recipientName, "Officer")}</strong><span>{textValue(row.recipientBucket)}</span></div>,
                      <div key="cell-1" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground "><strong>{textValue(row.indicatorCode)}</strong><span>{textValue(row.indicatorName)}</span></div>,
                      <div key="cell-2" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground "><strong>{textValue(row.templateVersionCode)}</strong></div>,
                      <div key="cell-3" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground "><strong>{textValue(row.requestPeriodLabel || row.reportingPeriodLabel)}</strong><span>Due {formatDate(row.dueDate)}</span></div>,
                      <div key="cell-4" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground "><StatusBadge variant={normalizeStatusVariant(`${String(row.submissionStatus)}`)}>{titleCaseStatus(row.submissionStatus, "Not Started")}</StatusBadge></div>,
                      <div key="cell-5" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground "><StatusBadge variant={normalizeStatusVariant(`${String(row.notificationStatus)}`)}>{titleCaseStatus(row.notificationStatus, "Queued")}</StatusBadge></div>,
                      <div key="cell-6" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground ">{row.accessUrl ? (
                        <Button variant="outline" type="button" onClick={() => window.open(row.accessUrl, "_blank", "noopener,noreferrer")}>
                          <ExternalLink size={13} /> Open
                        </Button>
                      ) : (
                        <StatusBadge variant={normalizeStatusVariant("queued")}>Pending</StatusBadge>
                      )}</div>]
                    })
                  ))} />
              </div>
            </section>
          ))}
          {!accessRows.length ? (isLoading ? <Loader text={"Loading assignments..."} /> : <Empty><EmptyHeader><EmptyTitle>{`No dispatch assignments found for ${unitCode}.`}</EmptyTitle></EmptyHeader></Empty>) : null}
        </div>
      ) : null}

      {mode === "published-index" ? (
        <div>
          {publishedFrameworkGroups.map((group) => (
            <details key={group.levelOne} open>
              <summary><BookOpen size={15} /> <strong>{group.levelOne}</strong><span>{group.children.length} section(s)</span></summary>
              {group.children.map(([levelTwo, items]) => (
                <section key={levelTwo}>
                  <h3>{levelTwo}</h3>
                  <div className="min-w-0 overflow-x-auto">
                    <DataTableReport ariaLabel={t("reportTable.label")} isLoading={isLoading} headers={["SN",
                      "Indicator No.",
                      "Indicator Description",
                      "Time Period",
                      "Source",
                      "Facts",
                      "Generated",
                      "Published",
                      "Action"]} rows={items.map((row, index) => (
                        ({
                          id: textValue(row.snapshotCode, `${levelTwo}-${index}`), cells: [<div key="cell-0" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground ">{index + 1}</div>,
                          <div key="cell-1" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground ">{textValue(row.indicatorCode)}</div>,
                          <div key="cell-2" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground ">{textValue(row.indicatorName)}</div>,
                          <div key="cell-3" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground ">{textValue(row.requestPeriodLabel || row.reportingPeriodLabel)}</div>,
                          <div key="cell-4" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground "><strong>{textValue(row.ministryName)}</strong><span>{textValue(row.departmentName)}</span></div>,
                          <div key="cell-5" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground ">{numberValue(row.observationCount)}</div>,
                          <div key="cell-6" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground ">{numberValue(row.generatedObservationCount)}</div>,
                          <div key="cell-7" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground ">{formatDate(row.publishedAt)}</div>,
                          <div key="cell-8" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground "><Button variant="outline"

                            type="button"
                            onClick={() => row.snapshotCode && navigate(`/published-facts/workbook/${encodeURIComponent(row.snapshotCode)}`)}
                          >
                            <ExternalLink size={13} /> Open
                          </Button></div>]
                        })
                      ))} />
                  </div>
                </section>
              ))}
            </details>
          ))}
          {!publishedIndexRows.length ? (isLoading ? <Loader text={"Loading published index..."} /> : <Empty><EmptyHeader><EmptyTitle>{"No published facts found."}</EmptyTitle></EmptyHeader></Empty>) : null}
        </div>
      ) : null}

      {mode === "published-approved" ? (
        <div className="flex min-w-0 flex-col gap-3">
          <section className="flex min-w-0 flex-col gap-3 [&>header]:flex [&>header]:flex-wrap [&>header]:items-center [&>header]:justify-between [&>header]:gap-2 [&>header_span]:text-xs [&>header_span]:text-muted-foreground">
            <header>
              <div>
                <strong>Approved Published Data</strong>
                <span>Latest approved data by source, template, indicator, and request period.</span>
              </div>
            </header>
            <div className="min-w-0 overflow-x-auto">
              <DataTableReport ariaLabel={t("reportTable.label")} isLoading={isLoading} headers={["Indicator",
                "Source",
                "Template",
                "Period",
                "Version",
                "Facts",
                "Published By",
                "Published At"]} rows={publishedIndexRows.map((row) => (
                  ({
                    id: textValue(row.snapshotCode), cells: [<div key="cell-0" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground "><strong>{textValue(row.indicatorCode)}</strong><span>{textValue(row.indicatorName)}</span></div>,
                    <div key="cell-1" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground "><strong>{textValue(row.ministryName)}</strong><span>{textValue(row.departmentName)}</span></div>,
                    <div key="cell-2" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground "><strong>{textValue(row.templateVersionCode)}</strong></div>,
                    <div key="cell-3" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground ">{textValue(row.requestPeriodLabel || row.reportingPeriodLabel)}</div>,
                    <div key="cell-4" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground ">v{row.submissionVersion ?? "-"}</div>,
                    <div key="cell-5" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground ">{numberValue(row.observationCount)}</div>,
                    <div key="cell-6" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground ">{textValue(row.publishedByUsername)}</div>,
                    <div key="cell-7" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground ">{formatDateTime(row.publishedAt)}</div>]
                  })
                ))} />
            </div>
          </section>
          {!publishedIndexRows.length ? (isLoading ? <Loader text={"Loading approved data..."} /> : <Empty><EmptyHeader><EmptyTitle>{"No approved published data found."}</EmptyTitle></EmptyHeader></Empty>) : null}
        </div>
      ) : null}

      {isObservationMode(mode) ? (
        <div className="flex min-w-0 flex-col gap-3">
          <section className="flex min-w-0 flex-col gap-3 [&>header]:flex [&>header]:flex-wrap [&>header]:items-center [&>header]:justify-between [&>header]:gap-2 [&>header_span]:text-xs [&>header_span]:text-muted-foreground">
            <header>
              <div>
                <strong>{mode === "published-computed" ? "Computed Published Facts" : "Published Observations"}</strong>
                <span>{mode === "published-computed" ? "Generated/calculated/rollup observations only." : "Cell-level facts from request-approved published observations."}</span>
              </div>
            </header>
            <div className="min-w-0 overflow-x-auto">
              <DataTableReport ariaLabel={t("reportTable.label")} isLoading={isLoading} headers={["Indicator",
                "Source",
                "Period",
                "Data Cell",
                "Value",
                "Type",
                "Generated",
                "Published"]} rows={visibleObservationRows.map((row) => (
                  ({
                    id: textValue(row.observationCode, `${row.snapshotCode}-${row.cellKey}`), cells: [<div key="cell-0" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground "><strong>{textValue(row.indicatorCode)}</strong><span>{textValue(row.indicatorName)}</span></div>,
                    <div key="cell-1" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground "><strong>{textValue(row.ministryName)}</strong><span>{textValue(row.departmentName)}</span></div>,
                    <div key="cell-2" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground ">{textValue(row.requestPeriodLabel || row.reportingPeriodLabel)}</div>,
                    <div key="cell-3" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground ">{textValue(row.cellKey)}</div>,
                    <div key="cell-4" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground ">{textValue(row.approvedValueNumeric ?? row.approvedValueText)}</div>,
                    <div key="cell-5" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground ">{textValue(row.valueType)}</div>,
                    <div key="cell-6" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground "><StatusBadge variant={normalizeStatusVariant(`${row.isGenerated ? "info" : "queued"}`)}>{row.isGenerated ? "Yes" : "No"}</StatusBadge></div>,
                    <div key="cell-7" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground ">{formatDateTime(row.publishedAt)}</div>]
                  })
                ))} />
            </div>
          </section>
          {!visibleObservationRows.length ? (isLoading ? <Loader text={"Loading observations..."} /> : <Empty><EmptyHeader><EmptyTitle>{"No published observations found."}</EmptyTitle></EmptyHeader></Empty>) : null}
        </div>
      ) : null}

      {mode === "overview-dashboard" ? (
        <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2">
          <Card className="min-w-0">
            <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2"><BarChart3 size={16} /> Lifecycle Funnel</CardTitle>
                <CardDescription>Assigned items through publication stages.</CardDescription>
              </div>
              <span>{metrics.total} total</span>
            </CardHeader>
            <CardContent>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {dashboardFunnel.map((stage, index) => (
                <div className="flex min-w-0 flex-col gap-2 rounded-md bg-muted p-3" key={stage.label}>
                  <div className="flex items-center gap-2">
                    <strong>{stage.count}</strong>
                    <span>{stage.label}</span>
                  </div>
                  <small>{stage.helper}</small>
                  {index < dashboardFunnel.length - 1 ? <i aria-hidden="true" /> : null}
                </div>
              ))}
            </div>
          </CardContent></Card>

          <Card className="min-w-0">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Inbox size={16} /> Needs Attention</CardTitle>
              <CardDescription>Compact admin workload signals.</CardDescription>
            </CardHeader>
            <CardContent>
            <div className="flex min-w-0 flex-col gap-3">
              {dashboardAttention.map((item) => (
                <div className="flex min-w-0 items-center gap-3 py-2" key={item.label}>
                  <strong className="w-10 shrink-0 text-2xl tabular-nums">{item.count}</strong>
                  <div className="flex min-w-0 flex-col gap-0.5"><span className="font-medium">{item.label}</span>
                  <small className="text-muted-foreground">{item.detail}</small></div>
                </div>
              ))}
            </div>
          </CardContent></Card>

          <Card className="min-w-0 xl:col-span-2">
            <CardHeader className="flex flex-row flex-wrap items-start justify-between gap-3">
              <div>
                <CardTitle className="flex items-center gap-2"><Building2 size={16} /> Ministry Status</CardTitle>
                <CardDescription>Source-wise completion and lifecycle workload.</CardDescription>
              </div>
              <span>{ministryStatusRows.length} shown</span>
            </CardHeader>
            <CardContent>
            <div className="min-w-0 overflow-x-auto">
              <DataTableReport ariaLabel={t("reportTable.label")} isLoading={isLoading} headers={["Ministry",
                "Assigned",
                "Submitted",
                "Review",
                "Approved",
                "Published",
                "Overdue",
                "Completion",
                "Action"]} rows={ministryStatusRows.map((row) => (
                  ({
                    id: row.ministry, cells: [<div key="cell-0" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground "><strong>{row.ministry}</strong></div>,
                    <div key="cell-1" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground ">{row.assigned}</div>,
                    <div key="cell-2" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground ">{row.submitted}</div>,
                    <div key="cell-3" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground ">{row.review}</div>,
                    <div key="cell-4" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground ">{row.approved}</div>,
                    <div key="cell-5" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground ">{row.published}</div>,
                    <div key="cell-6" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground "><StatusBadge variant={normalizeStatusVariant(row.overdue ? "failed" : "succeeded")}>{row.overdue}</StatusBadge></div>,
                    <div key="cell-7" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground "><div className="flex min-w-0 flex-col gap-2 [&>div]:h-2 [&>div]:overflow-hidden [&>div]:rounded-full [&>div]:bg-muted [&_i]:block [&_i]:h-full [&_i]:rounded-full [&_i]:bg-primary">
                      <div><i style={{ width: `${row.completion}%` }} /></div>
                      <span>{row.completion}%</span>
                    </div></div>,
                    <div key="cell-8" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground "><Button variant="outline" type="button" onClick={() => openDispatch(row.row)}>
                      <ExternalLink size={13} /> Open
                    </Button></div>]
                  })
                ))} />
            </div>
            {!filteredRows.length ? (isLoading ? <Loader text={"Loading lifecycle data..."} /> : <Empty><EmptyHeader><EmptyTitle>{"No lifecycle rows found."}</EmptyTitle></EmptyHeader></Empty>) : null}
          </CardContent></Card>
        </div>
      ) : mode === "unit-dashboard" ? (
        <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2">
          <Card className="min-w-0"><CardContent className="flex min-w-0 flex-col gap-3">
            <div className="flex flex-wrap items-start justify-between gap-3 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:text-sm [&_h3]:font-semibold [&_p]:text-xs [&_p]:text-muted-foreground">
              <div>
                <h3><FileCheck size={16} /> Pillar Health Summary</h3>
                <p>Selected pillar operational status.</p>
              </div>
              <span>{unitCode}</span>
            </div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <span>Selected Pillar</span>
                <strong>{unitCode}</strong>
              </div>
              <div>
                <span>Completion</span>
                <strong>{unitCompletion}%</strong>
              </div>
              <div>
                <span>Overdue</span>
                <strong>{metrics.overdue}</strong>
              </div>
              <div>
                <span>Last Activity</span>
                <strong>{formatDateTime(unitLatestActivity)}</strong>
              </div>
            </div>
            <div className="flex min-w-0 flex-col gap-2 [&>div]:h-2 [&>div]:overflow-hidden [&>div]:rounded-full [&>div]:bg-muted [&_i]:block [&_i]:h-full [&_i]:rounded-full [&_i]:bg-primary">
              <div><i style={{ width: `${unitCompletion}%` }} /></div>
              <span>{metrics.published} of {metrics.total} published</span>
            </div>
          </CardContent></Card>

          <Card className="min-w-0"><CardContent className="flex min-w-0 flex-col gap-3">
            <div className="flex flex-wrap items-start justify-between gap-3 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:text-sm [&_h3]:font-semibold [&_p]:text-xs [&_p]:text-muted-foreground">
              <div>
                <h3><Inbox size={16} /> Action Required</h3>
                <p>Items that need operational follow-up.</p>
              </div>
            </div>
            <div className="flex min-w-0 flex-col gap-3">
              {unitActionRequired.map((item) => (
                <div className="flex min-w-0 flex-wrap items-center justify-between gap-3 py-2" key={item.label}>
                  <strong>{item.count}</strong>
                  <span>{item.label}</span>
                  <small>{item.detail}</small>
                </div>
              ))}
            </div>
          </CardContent></Card>

          <Card className="min-w-0"><CardContent className="flex min-w-0 flex-col gap-3">
            <div className="flex flex-wrap items-start justify-between gap-3 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:text-sm [&_h3]:font-semibold [&_p]:text-xs [&_p]:text-muted-foreground">
              <div>
                <h3><BarChart3 size={16} /> Lifecycle Progress</h3>
                <p>Assigned work moving through the pillar lifecycle.</p>
              </div>
              <span>{unitCompletion}% complete</span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {unitLifecycleFlow.map((stage, index) => (
                <div className="flex min-w-0 flex-col gap-2 rounded-md bg-muted p-3" key={stage.label}>
                  <div>
                    <strong>{stage.count}</strong>
                    <span>{stage.label}</span>
                  </div>
                  <small>{stage.helper}</small>
                  {index < unitLifecycleFlow.length - 1 ? <i aria-hidden="true" /> : null}
                </div>
              ))}
            </div>
          </CardContent></Card>

          <Card className="min-w-0"><CardContent className="flex min-w-0 flex-col gap-3">
            <div className="flex flex-wrap items-start justify-between gap-3 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:text-sm [&_h3]:font-semibold [&_p]:text-xs [&_p]:text-muted-foreground">
              <div>
                <h3><Building2 size={16} /> Source / Department Breakdown</h3>
                <p>Completion and workload by source ownership.</p>
              </div>
              <span>{unitSourceRows.length} shown</span>
            </div>
            <div className="min-w-0 overflow-x-auto">
                <DataTableReport ariaLabel={t("reportTable.label")} isLoading={isLoading} headers={["Source / Department",
                  "Assigned",
                  "Submitted",
                  "Review",
                  "Approved",
                  "Published",
                  "Overdue",
                  "Completion",
                  "Action"]} rows={unitSourceRows.map((row) => (
                    ({
                      id: row.source, cells: [<div key="cell-0" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground "><strong title={row.source}>{row.source}</strong></div>,
                      <div key="cell-1" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground ">{row.assigned}</div>,
                      <div key="cell-2" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground ">{row.submitted}</div>,
                      <div key="cell-3" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground ">{row.review}</div>,
                      <div key="cell-4" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground ">{row.approved}</div>,
                      <div key="cell-5" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground ">{row.published}</div>,
                      <div key="cell-6" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground "><StatusBadge variant={normalizeStatusVariant(row.overdue ? "failed" : "succeeded")}>{row.overdue}</StatusBadge></div>,
                      <div key="cell-7" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground "><div className="flex min-w-0 flex-col gap-2 [&>div]:h-2 [&>div]:overflow-hidden [&>div]:rounded-full [&>div]:bg-muted [&_i]:block [&_i]:h-full [&_i]:rounded-full [&_i]:bg-primary">
                        <div><i style={{ width: `${row.completion}%` }} /></div>
                        <span>{row.completion}%</span>
                      </div></div>,
                      <div key="cell-8" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground "><Button variant="outline" type="button" onClick={() => openDispatch(row.row)}>
                        <ExternalLink size={13} /> Open
                      </Button></div>]
                    })
                  ))} />
            </div>
            {!filteredRows.length ? (isLoading ? <Loader text={"Loading lifecycle data..."} /> : <Empty><EmptyHeader><EmptyTitle>{"No lifecycle rows found."}</EmptyTitle></EmptyHeader></Empty>) : null}
          </CardContent></Card>

          <Card className="min-w-0"><CardContent className="flex min-w-0 flex-col gap-3">
            <div className="flex flex-wrap items-start justify-between gap-3 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:text-sm [&_h3]:font-semibold [&_p]:text-xs [&_p]:text-muted-foreground">
              <div>
                <h3><Send size={16} /> Recent Activity</h3>
                <p>Latest source, indicator, status, and activity date.</p>
              </div>
            </div>
            <div className="flex min-w-0 flex-col gap-3">
              {unitRecentRows.map((row) => (
                <Button variant="ghost" className="flex h-auto min-w-0 flex-wrap items-center justify-between gap-3 whitespace-normal py-2 text-left" type="button" key={textValue(row.runItemCode, textValue(row.dispatchRunCode))} onClick={() => openDispatch(row)}>
                  <span>
                    <strong>{textValue(row.ministryName, "Source pending")}</strong>
                    <small>{textValue(row.indicatorCode)} - {textValue(row.indicatorName, "Indicator")}</small>
                  </span>
                  <StatusBadge variant={normalizeStatusVariant(`${String(rowLifecycle(row))}`)}>{rowLifecycle(row)}</StatusBadge>
                  <time>{formatDateTime(lastActivity(row))}</time>
                </Button>
              ))}
              {!unitRecentRows.length ? (isLoading ? <Loader text={"Loading recent activity..."} /> : <Empty><EmptyHeader><EmptyTitle>{"No recent activity found."}</EmptyTitle></EmptyHeader></Empty>) : null}
            </div>
          </CardContent></Card>
        </div>
      ) : mode === "review-dashboard" ? (
        <div className="grid min-w-0 grid-cols-1 gap-4 xl:grid-cols-2">
          <section>
            <h3><BarChart3 size={16} /> Lifecycle Funnel</h3>
            {statusBars.map(([label, value]) => (
              <div className="flex min-w-0 flex-col gap-2 [&>div]:h-2 [&>div]:overflow-hidden [&>div]:rounded-full [&>div]:bg-muted [&_i]:block [&_i]:h-full [&_i]:rounded-full [&_i]:bg-primary" key={label}>
                <span>{label}</span>
                <div><i style={{ width: `${Math.max(6, (value / maxStatus) * 100)}%` }} /></div>
                <strong>{value}</strong>
              </div>
            ))}
          </section>
          <section>
            <h3><Inbox size={16} /> Queues</h3>
            <Card className="min-w-0"><CardContent className="flex min-w-0 flex-col gap-3"><strong>{metrics.review}</strong><span>Pending reviewer workload</span></CardContent></Card>
            <Card className="min-w-0"><CardContent className="flex min-w-0 flex-col gap-3"><strong>{metrics.overdue}</strong><span>Overdue ministries</span></CardContent></Card>
            <Card className="min-w-0"><CardContent className="flex min-w-0 flex-col gap-3"><strong>{metrics.total - metrics.published}</strong><span>Not yet published</span></CardContent></Card>
          </section>
          <section>
            <h3><Building2 size={16} /> Ministry Status</h3>
            {ministryGroups.slice(0, 8).map(([ministry, items]) => (
              <RowSummary key={ministry} row={items[0]} onOpen={openDispatch} />
            ))}
            {!filteredRows.length ? (isLoading ? <Loader text={"Loading lifecycle data..."} /> : <Empty><EmptyHeader><EmptyTitle>{"No lifecycle rows found."}</EmptyTitle></EmptyHeader></Empty>) : null}
          </section>
          <section>
            <h3><FileCheck size={16} /> Compliance</h3>
            <div className="font-heading text-2xl font-semibold tabular-nums text-foreground">
              <strong>{metrics.total ? Math.round((metrics.published / metrics.total) * 100) : 0}%</strong>
              <span>Published / assigned</span>
            </div>
          </section>
        </div>
      ) : null}
      {false && mode === "published-index" ? (
        <div>
          {frameworkGroups.map((group) => (
            <details key={group.levelOne} open>
              <summary><BookOpen size={15} /> <strong>{group.levelOne}</strong><span>{group.children.length} section(s)</span></summary>
              {group.children.map(([levelTwo, items]) => (
                <section key={levelTwo}>
                  <h3>{levelTwo}</h3>
                  <div className="min-w-0 overflow-x-auto">
                    <DataTableReport ariaLabel={t("reportTable.label")} isLoading={isLoading} headers={["SN",
                      "Indicator No.",
                      "Indicator Description",
                      "Time Period",
                      "Facts",
                      "Action"]} rows={items.map((row, index) => (
                        ({
                          id: textValue(row.runItemCode, `${levelTwo}-${index}`), cells: [<div key="cell-0" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground ">{index + 1}</div>,
                          <div key="cell-1" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground ">{textValue(row.indicatorCode)}</div>,
                          <div key="cell-2" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground ">{textValue(row.indicatorName)}</div>,
                          <div key="cell-3" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground ">{textValue(row.requestPeriodLabel || row.reportingPeriodLabel)}</div>,
                          <div key="cell-4" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground ">{numberValue(row.publishedObservationCount)}</div>,
                          <div key="cell-5" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground "><Button variant="outline" type="button" onClick={() => openDispatch(row)}>
                            <ExternalLink size={13} /> Open
                          </Button></div>]
                        })
                      ))} />
                  </div>
                </section>
              ))}
            </details>
          ))}
          {!filteredRows.length ? (isLoading ? <Loader text={"Loading published index..."} /> : <Empty><EmptyHeader><EmptyTitle>{"No published facts found."}</EmptyTitle></EmptyHeader></Empty>) : null}
        </div>
      ) : null}

      {mode !== "overview-dashboard" && mode !== "unit-dashboard" && mode !== "review-dashboard" && !isPublishedMode(mode) && mode !== "data-entry-links" && mode !== "data-entry-assignments" ? (
        isDispatchHistoryMode ? (
          <div className="flex min-w-0 flex-col gap-3">
            <Card className="flex min-w-0 flex-col gap-3 [&>header]:flex [&>header]:flex-wrap [&>header]:items-center [&>header]:justify-between [&>header]:gap-2 [&>header_span]:text-xs [&>header_span]:text-muted-foreground">
              <header className="flex flex-wrap items-start justify-between gap-3 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:text-sm [&_h3]:font-semibold [&_p]:text-xs [&_p]:text-muted-foreground">
                <div>
                  <strong>Dispatch History</strong>
                  <span>Each dispatch run is shown as one row with its own lifecycle counts.</span>
                </div>
              </header>
              <div className="min-w-0 overflow-x-auto">
                <DataTableReport ariaLabel={t("reportTable.label")} isLoading={isLoading} headers={["Dispatch",
                  "Counts",
                  "Source",
                  "Indicator",
                  "Template",
                  "Period",
                  "Submission",
                  "Review / Approval",
                  "Publication",
                  "Action"]} rows={dispatchHistoryRows.map(({ dispatchCode, items, row }) => {
                    const source = summarizeDispatchValues(items, (item) => item.ministryName, "Source pending");
                    const department = summarizeDispatchValues(items, (item) => item.departmentName);
                    const indicator = summarizeDispatchValues(items, (item) => item.indicatorCode, "Indicator pending");
                    const indicatorName = summarizeDispatchValues(items, (item) => item.indicatorName);
                    const template = summarizeDispatchValues(items, (item) => item.templateName || item.templateVersionCode, "Template pending");
                    const period = summarizeDispatchValues(items, (item) => item.requestPeriodLabel || item.reportingPeriodLabel, "Period pending");
                    return (
                      ({
                        id: dispatchCode, cells: [<div key="cell-0" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground "><DispatchCodeCell
                          code={dispatchCode}
                          expanded={expandedDispatchCodes.includes(dispatchCode)}
                          onToggle={() => toggleDispatchCode(dispatchCode)}
                        /></div>,
                        <div key="cell-1" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground "><DispatchHistoryCountCell items={items} /></div>,
                        <div key="cell-2" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground "><strong title={source.title}>{source.primary}</strong><span title={department.title}>{department.secondary || department.primary}</span></div>,
                        <div key="cell-3" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground "><strong title={indicator.title}>{indicator.primary}</strong><span title={indicatorName.title}>{indicator.secondary || indicatorName.primary}</span></div>,
                        <div key="cell-4" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground "><strong title={template.title}>{template.primary}</strong>{template.secondary ? <span>{template.secondary}</span> : null}</div>,
                        <div key="cell-5" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground "><strong title={period.title}>{period.primary}</strong>{period.secondary ? <span>{period.secondary}</span> : <span>Due {formatDate(row.dueDate)}</span>}</div>,
                        <div key="cell-6" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground "><StatusBadge variant={normalizeStatusVariant(`${String(row.submissionStatus)}`)}>{titleCaseStatus(row.submissionStatus, "Not Started")}</StatusBadge></div>,
                        <div key="cell-7" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground "><StatusBadge variant={normalizeStatusVariant(`${String(row.reviewStatus || row.approvalStatus)}`)}>
                          {titleCaseStatus(row.reviewStatus || row.approvalStatus, "Pending")}
                        </StatusBadge></div>,
                        <div key="cell-8" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground "><StatusBadge variant={normalizeStatusVariant(`${String(row.publicationStatus)}`)}>{titleCaseStatus(row.publicationStatus, "Not Published")}</StatusBadge></div>,
                        <div key="cell-9" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground "><Button variant="outline" type="button" onClick={() => openDispatch(row)}>
                          <ExternalLink size={13} /> Open
                        </Button></div>]
                      })
                    );
                  })} />
              </div>
            </Card>
            {!filteredRows.length ? (isLoading ? <Loader text={"Loading lifecycle rows..."} /> : <Empty><EmptyHeader><EmptyTitle>{"No records found."}</EmptyTitle></EmptyHeader></Empty>) : null}
          </div>
        ) : (
          <div className="flex min-w-0 flex-col gap-3">
            {ministryGroups.map(([groupName, items]) => (
              <section className="flex min-w-0 flex-col gap-3 [&>header]:flex [&>header]:flex-wrap [&>header]:items-center [&>header]:justify-between [&>header]:gap-2 [&>header_span]:text-xs [&>header_span]:text-muted-foreground" key={groupName}>
                <header>
                  <div>
                    <strong>{groupName}</strong>
                    <span>{items.length} item(s) - {items.filter(isPublishedRow).length} published - {items.filter(isOverdue).length} overdue</span>
                  </div>
                </header>
                <div className="min-w-0 overflow-x-auto">
                  <DataTableReport ariaLabel={t("reportTable.label")} isLoading={isLoading} headers={[...(useAdminFacingLifecycleTable ? [] : ["Dispatch"]),
                    "Source",
                    "Indicator",
                    "Template",
                    "Period",
                    "Submission",
                    "Review / Approval",
                    "Publication",
                    "Action"]} rows={items.map((row) => (
                      ({
                        id: textValue(row.runItemCode, textValue(row.dispatchRunCode)), cells: [...(useAdminFacingLifecycleTable ? [] : [<div className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground "><strong>{textValue(row.dispatchRunCode, "Not generated")}</strong><span>{textValue(row.runItemCode)}</span></div>]),
                        <SourceCell key="cell-1" row={row} />,
                        <div key="cell-2" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground "><strong>{textValue(row.indicatorCode)}</strong><span>{textValue(row.indicatorName)}</span></div>,
                        <div key="cell-3" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground "><strong>{textValue(row.templateName, textValue(row.templateVersionCode))}</strong>{useAdminFacingLifecycleTable ? null : <span>{textValue(row.templateVersionCode)}</span>}</div>,
                        <div key="cell-4" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground "><strong>{textValue(row.requestPeriodLabel || row.reportingPeriodLabel)}</strong><span>Due {formatDate(row.dueDate)}</span></div>,
                        <div key="cell-5" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground "><StatusBadge variant={normalizeStatusVariant(`${String(row.submissionStatus)}`)}>{titleCaseStatus(row.submissionStatus, "Not Started")}</StatusBadge></div>,
                        <div key="cell-6" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground "><StatusBadge variant={normalizeStatusVariant(`${String(row.reviewStatus || row.approvalStatus)}`)}>
                          {titleCaseStatus(row.reviewStatus || row.approvalStatus, "Pending")}
                        </StatusBadge>
                          <span>Level {row.approvalLevel ?? 1}</span></div>,
                        <div key="cell-7" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground "><StatusBadge variant={normalizeStatusVariant(`${String(row.publicationStatus)}`)}>{titleCaseStatus(row.publicationStatus, "Not Published")}</StatusBadge></div>,
                        <div key="cell-8" className="flex min-w-0 flex-col gap-0.5 whitespace-normal break-words [&>span]:text-muted-foreground "><Button variant="outline" type="button" onClick={() => openDispatch(row)}>
                          <ExternalLink size={13} /> Open
                        </Button></div>]
                      })
                    ))} />
                </div>
              </section>
            ))}
            {!filteredRows.length ? (isLoading ? <Loader text={"Loading lifecycle rows..."} /> : <Empty><EmptyHeader><EmptyTitle>{"No records found."}</EmptyTitle></EmptyHeader></Empty>) : null}
          </div>
        )
      ) : null}
    </section>
  );
}
