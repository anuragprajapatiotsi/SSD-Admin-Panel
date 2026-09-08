import { useEffect, useMemo } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useSearchParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { templateWorkflowKeys, useCollectionActivityPreview, useWorkflowDispatchRun } from "@/hooks/use-template-workflow";
import { requestList, requestRecord, requestText, requestVersion, readRequestPreviewMetadata } from "@/utils/request-workbook-preview";

/** Owns REQUEST selection only. DIRECT's unpaginated observation contract is untouched. */
export function useRequestWorkbookPreview(collectionCode: string, activityCode: string, unitCode: string, locale: string) {
  const [search, setSearch] = useSearchParams();
  const client = useQueryClient();
  const { t } = useTranslation("ingestion");
  const version = requestVersion(search.get("submission_version"));
  const sheetIdentity = search.get("sheet_identity") || undefined;
  const offsetValue = Number(search.get("offset") ?? 0);
  const offset = Number.isInteger(offsetValue) && offsetValue >= 0 ? offsetValue : 0;
  const params = { collectionCode, activityCode, unitCode, locale, originType: "REQUEST", submissionVersion: version, sheetIdentity, limit: 200, offset };
  const query = useCollectionActivityPreview(params);
  const document = useMemo(() => readRequestPreviewMetadata(query.data?.data, t("requestWorkbook.sheet")), [query.data, t]);
  const resolvedVersion = requestVersion(document.submission.submissionVersion);
  const runCode = requestText(document.submission.dispatchRunCode) || search.get("dispatch_run_code") || undefined;
  const runQuery = useWorkflowDispatchRun(runCode, unitCode);
  const assignment = requestList(runQuery.data?.items).find((item) => item.runItemCode === activityCode);
  const entry = requestRecord(assignment?.dataEntryState);
  const latest = requestRecord(entry.latestSubmission);
  const versions = [...new Set([
    ...requestList(entry.submissions).map((item) => requestVersion(item.submissionVersion)),
    requestVersion(latest.submissionVersion), resolvedVersion,
  ].filter((item): item is number => item !== undefined))].sort((a, b) => b - a);
  const latestVersion = requestVersion(latest.submissionVersion);

  // Pin the server-selected version on deep links too; a subsequent refresh must not silently switch evidence.
  useEffect(() => {
    if (version || !resolvedVersion || !query.data) return;
    client.setQueryData(templateWorkflowKeys.collectionActivityPreview({ collectionCode, activityCode, unitCode, locale,
      originType: "REQUEST", submissionVersion: resolvedVersion, sheetIdentity, limit: 200, offset }), query.data);
    setSearch((current) => { const next = new URLSearchParams(current); next.set("submission_version", String(resolvedVersion)); return next; }, { replace: true });
  }, [version, resolvedVersion, query.data, client, collectionCode, activityCode, unitCode, locale, sheetIdentity, offset, setSearch]);

  const selectVersion = (nextVersion: number) => setSearch((current) => {
    const next = new URLSearchParams(current);
    next.set("submission_version", String(nextVersion));
    next.delete("sheet_identity"); next.delete("offset"); next.delete("job_code");
    return next;
  });
  const selectSheet = (sheet: string) => setSearch((current) => {
    const next = new URLSearchParams(current); next.set("sheet_identity", sheet); next.delete("offset"); return next;
  });
  const selectOffset = (nextOffset: number) => setSearch((current) => {
    const next = new URLSearchParams(current); next.set("offset", String(Math.max(0, nextOffset))); return next;
  });
  const setJourney = (jobCode: string) => setSearch((current) => {
    const next = new URLSearchParams(current); next.set("job_code", jobCode); return next;
  }, { replace: true });
  return { query, document, version: version ?? resolvedVersion, runCode, runQuery, versions, latestVersion,
    selectVersion, selectSheet, selectOffset, setJourney, jobCode: search.get("job_code") || undefined };
}
