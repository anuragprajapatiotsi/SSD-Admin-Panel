import type { RequestAccessAssignment, RequestAccessSessionDetail } from "@/api/requests.api";
import { ApiError } from "@/api/http-client";
import { useDownloadProviderSourceTemplate } from "@/hooks/use-template-workflow";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { StatusBadge } from "@/components/common/status-badge";
import { normalizeStatusVariant } from "@/components/common/status-variants";
import { providerAssignmentName, providerSubmissionReview, type ProviderEntryMode } from "@/utils/provider-assignment";
import { ProviderReviewNotice } from "@/components/data-collection/provider-review-notice";
import { IconCircleCheck, IconDownload, IconEdit, IconFileSpreadsheet, IconUpload } from "@tabler/icons-react";
import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";

export function ProviderAssignmentSelection({ assignments, session, detail, pending, onOpen, onExpired }: {
  assignments: RequestAccessAssignment[]; session: string; detail?: RequestAccessSessionDetail;
  pending: boolean; onOpen: (code: string, mode: ProviderEntryMode) => Promise<void>; onExpired: () => void;
}) {
  const { t } = useTranslation("ingestion");
  const download = useDownloadProviderSourceTemplate();
  const [downloadCode, setDownloadCode] = useState("");
  const [openingCode, setOpeningCode] = useState("");
  const [error, setError] = useState("");
  const busy = useRef(false);
  const active = useRef(true);
  useEffect(() => { active.current = true; return () => { active.current = false; }; }, []);
  const items = assignments.filter((item) => Boolean(item.runItemCode));
  const disabled = pending || download.isPending;
  const methods = detail?.policy?.submissionMethods;
  async function downloadTemplate(code: string) {
    if (busy.current || pending) return;
    busy.current = true;
    setDownloadCode(code);
    setError("");
    try {
      const file = await download.mutateAsync({ session, run_item_code: code });
      if (!active.current) return;
      const url = URL.createObjectURL(file);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = file.name;
      anchor.click();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (cause) {
      if (!active.current) return;
      if (cause instanceof ApiError && (cause.status === 401 || cause.status === 403)) { onExpired(); return; }
      setError(cause instanceof Error ? cause.message : t("providerAccess.downloadError"));
    } finally { busy.current = false; if (active.current) setDownloadCode(""); }
  }
  if (!items.length) return <Empty><EmptyHeader><EmptyTitle>{t("providerAccess.noAssignments")}</EmptyTitle><EmptyDescription>{t("providerAccess.noAssignmentsHelp")}</EmptyDescription></EmptyHeader></Empty>;
  return <div className="flex flex-col gap-4">
    {error ? <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert> : null}
    <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
      {items.map((item, index) => {
        const code = item.runItemCode!;
        const title = providerAssignmentName(item, t("providerAccess.assignmentNumber", { count: index + 1 }));
        const review = providerSubmissionReview(item);
        const organization = [item.ministry, item.department].filter(Boolean).join(" · ");
        return <Card key={code} data-tour={index === 0 ? "provider-assignments" : undefined} className="min-w-0">
          <CardHeader>
            <div className="flex items-center justify-between gap-3">
              <span className="grid size-10 place-items-center rounded-lg bg-primary/10 text-primary"><IconFileSpreadsheet className="size-5" aria-hidden="true" /></span>
              {item.lifecycleStatus ? <StatusBadge variant={normalizeStatusVariant(item.lifecycleStatus)}>{item.lifecycleStatus}</StatusBadge> : null}
            </div>
            <CardTitle className="break-words">{title}</CardTitle>
            {organization && organization !== title ? <CardDescription>{organization}</CardDescription> : null}
          </CardHeader>
          <CardContent className="flex flex-1 flex-col gap-2 text-sm text-muted-foreground">
            {item.reportingPeriod ? <p>{item.reportingPeriod}</p> : null}
            {review.locked ? <Alert data-tour="provider-submitted-note" variant="success" role="status"><IconCircleCheck aria-hidden="true" /><AlertDescription>{t("providerAccess.submissionSuccessNote")}</AlertDescription></Alert> : <p>{t("providerAccess.cardHelp")}</p>}
            <ProviderReviewNotice review={review} />
          </CardContent>
          {!review.locked ? <CardFooter className="flex flex-col items-stretch gap-2">
            {methods?.webForm === true ? <Button data-tour="provider-online" isDisabled={disabled || review.locked} onPress={() => { setOpeningCode(code + ":online"); void onOpen(code, "online"); }}>
              {pending && openingCode === code + ":online" ? <Spinner data-icon="inline-start" /> : <IconEdit data-icon="inline-start" />}{t("providerAccess.fillOnline")}
            </Button> : null}
            <div className="flex flex-wrap gap-2">
              <Button data-tour="provider-download" className="flex-1" variant="outline" isDisabled={disabled} onPress={() => void downloadTemplate(code)}>{downloadCode === code ? <Spinner data-icon="inline-start" /> : <IconDownload data-icon="inline-start" />}{t("providerAccess.download")}</Button>
              {methods?.excelUpload === true ? <Button data-tour="provider-upload" className="flex-1" variant="outline" isDisabled={disabled || review.locked} onPress={() => { setOpeningCode(code + ":upload"); void onOpen(code, "upload"); }}>{pending && openingCode === code + ":upload" ? <Spinner data-icon="inline-start" /> : <IconUpload data-icon="inline-start" />}{t("providerAccess.uploadCompleted")}</Button> : null}
            </div>
          </CardFooter> : null}
        </Card>;
      })}
    </div>
  </div>;
}
