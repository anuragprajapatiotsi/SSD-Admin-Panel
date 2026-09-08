import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { IconChevronLeft, IconChevronRight } from "@tabler/icons-react";
import { getSelectedLocale, getSelectedUnitCode } from "@/api/session.api";
import { useAppShellLayout } from "@/layouts/app-shell-context";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { useRequestWorkbookPreview } from "@/hooks/use-request-workbook-preview";
import { requestText } from "@/utils/request-workbook-preview";
import { cn } from "@/lib/utils";
import { RequestWorkbookCanvas } from "@/components/data-collection/request-workbook-canvas";
import { RequestWorkbookReviewPanel } from "@/components/data-collection/request-workbook-review-panel";
import { RequestJourneyPanel } from "@/components/data-collection/request-journey-panel";
import { TemplateEditorToolbar } from "@/components/template-editor/template-editor-toolbar";
import { TemplateEditorCanvas, TemplateEditorWorkspace } from "@/components/template-editor/template-editor-workspace";
import { StatusBadge } from "@/components/common/status-badge";
import { normalizeStatusVariant } from "@/components/common/status-variants";
import { Loader } from "@/components/common/loader";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Pagination, PaginationContent, PaginationItem } from "@/components/ui/pagination";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";

/** Composition only: REQUEST selection, adaptation and decisions live behind focused hooks. */
export function RequestActivityPreviewPage() {
  const { collectionCode = "", activityCode = "" } = useParams();
  const { t } = useTranslation("ingestion");
  const navigate = useNavigate();
  const unitCode = getSelectedUnitCode();
  const locale = getSelectedLocale();
  const flow = useRequestWorkbookPreview(collectionCode, activityCode, unitCode, locale);
  const [reviewBusy, setReviewBusy] = useState(false);
  const { document, query } = flow;
  const { setImmersiveContent, isHeaderExpanded, toggleHeader } = useAppShellLayout();
  const title = document.title || t("requestWorkbook.title");
  useDocumentTitle(title);
  useEffect(() => { setImmersiveContent(true); return () => setImmersiveContent(false); }, [setImmersiveContent]);
  const status = requestText(document.submission.lifecycleStatus) || requestText(document.submission.submissionStatus);
  const hasPanel = Boolean(flow.runCode && flow.version && document.submission.runItemCode === activityCode);
  const previewReady = document.hasData && !query.isError && !query.isPending && !query.isPlaceholderData;
  return <TemplateEditorWorkspace aria-label={title}>
    <TemplateEditorToolbar file={{ name: title, size: document.size }} sheetCount={document.sheets.length || undefined}
      isDirty={false} isDisabled={reviewBusy} showStatus={false} showDetailsToggle={false} isAppHeaderExpanded={isHeaderExpanded}
      onToggleAppHeader={toggleHeader} appHeaderTogglePosition="after-back"
      previewBackLabel={t("dataCollection.detail.preview.back")} onPreviewBack={() => { if (!reviewBusy) navigate(`/ingestion/data-collection/${encodeURIComponent(collectionCode)}`); }}
      fileMetadata={<>
        {status ? <StatusBadge variant={normalizeStatusVariant(status)}>{t(`dataCollection.detail.activityStatuses.${status}`, { defaultValue: status.replaceAll("_", " ") })}</StatusBadge> : null}
        <Badge variant="secondary">{t("directIngestion.readOnly")}</Badge>
        {query.isFetching && query.data ? <span role="status"><Spinner /><span className="sr-only">{t("directPublicationReview.refreshing")}</span></span> : null}
      </>}
      actions={flow.versions.length ? <Select aria-label={t("directIngestion.version")} selectedKey={flow.version ? String(flow.version) : null}
        isDisabled={query.isFetching || reviewBusy} onSelectionChange={(key) => { if (key !== null) flow.selectVersion(Number(key)); }}>
        <SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectGroup>
          {flow.versions.map((version) => <SelectItem key={version} id={String(version)}>
            {t("directIngestion.versionNumber", { version })}{version === flow.latestVersion ? ` · ${t("directIngestion.latest")}` : ""}
          </SelectItem>)}
        </SelectGroup></SelectContent>
      </Select> : null} />
    <div className={cn("grid min-h-0 min-w-0 flex-1 grid-cols-1", hasPanel
      ? "grid-rows-[minmax(0,1fr)_minmax(14rem,45%)] md:grid-cols-[minmax(0,1fr)_24rem] md:grid-rows-1" : "grid-rows-1")}>
      <TemplateEditorCanvas>
        {document.sheets.length > 1 ? <div className="flex shrink-0 items-center gap-2 p-2">
          <Select aria-label={t("requestWorkbook.sheet")} selectedKey={document.selectedSheet} isDisabled={query.isFetching || reviewBusy}
            onSelectionChange={(key) => { if (key !== null) flow.selectSheet(String(key)); }}>
            <SelectTrigger><SelectValue /></SelectTrigger><SelectContent><SelectGroup>
              {document.sheets.map((sheet) => <SelectItem key={requestText(sheet.sheetIdentity)} id={requestText(sheet.sheetIdentity)}>{requestText(sheet.sheetIdentity)}</SelectItem>)}
            </SelectGroup></SelectContent>
          </Select>
        </div> : null}
        {query.isPending ? <Loader className="h-full" text={t("dataCollection.detail.preview.loading")} />
          : query.isError ? <div className="flex flex-col items-center gap-3 p-4"><Alert variant="destructive"><AlertDescription>{query.error instanceof Error ? query.error.message : t("requestWorkbook.loadError")}</AlertDescription></Alert>
            <Button variant="outline" isDisabled={query.isFetching} onPress={() => void query.refetch()}>{t("directReview.refresh")}</Button></div>
          : !document.hasData ? <Empty className="h-full"><EmptyHeader><EmptyTitle>{t("dataCollection.detail.preview.emptyTitle")}</EmptyTitle><EmptyDescription>{t("requestWorkbook.empty")}</EmptyDescription></EmptyHeader></Empty>
          : query.data ? <RequestWorkbookCanvas key={`${flow.version}:${document.selectedSheet}:${document.offset}`} response={query.data.data} sheetName={document.selectedSheet} /> : null}
        {document.returned > 0 || document.offset > 0 ? <div className="flex shrink-0 flex-wrap items-center justify-between gap-2 border-t p-2">
          <p className="text-xs text-muted-foreground">{t("requestWorkbook.rowRange", { start: document.returned ? document.offset + 1 : 0, end: document.offset + document.returned, total: document.total })}</p>
          <Pagination className="mx-0 w-auto" aria-label={t("requestWorkbook.pages")}><PaginationContent>
            <PaginationItem><Button variant="outline" size="icon-sm" aria-label={t("requestWorkbook.previous")} isDisabled={query.isFetching || reviewBusy || document.offset === 0}
              onPress={() => flow.selectOffset(document.offset - document.limit)}><IconChevronLeft /></Button></PaginationItem>
            <PaginationItem><Button variant="outline" size="icon-sm" aria-label={t("requestWorkbook.next")} isDisabled={query.isFetching || reviewBusy || !document.hasMore}
              onPress={() => flow.selectOffset(document.offset + document.limit)}><IconChevronRight /></Button></PaginationItem>
          </PaginationContent></Pagination>
        </div> : null}
        {flow.runQuery.isError ? <Alert variant="destructive"><AlertDescription>{t("requestWorkbook.historyError")}</AlertDescription><Button variant="outline" isDisabled={flow.runQuery.isFetching} onPress={() => void flow.runQuery.refetch()}>{t("directReview.refresh")}</Button></Alert> : null}
      </TemplateEditorCanvas>
      {hasPanel && flow.version && flow.runCode ? flow.jobCode
        ? <RequestJourneyPanel key={flow.jobCode} jobCode={flow.jobCode} unitCode={unitCode} sheetIdentity={document.selectedSheet} />
        : <RequestWorkbookReviewPanel key={`${activityCode}:${flow.version}:${unitCode}`} runCode={flow.runCode} itemCode={activityCode} version={flow.version}
          unitCode={unitCode} locale={locale} submission={document.submission} previewReady={previewReady} onJourney={flow.setJourney} onBusyChange={setReviewBusy} /> : null}
    </div>
  </TemplateEditorWorkspace>;
}
