import { useId } from "react";
import { useTranslation } from "react-i18next";
import { IconApi } from "@tabler/icons-react";
import { JsonView, collapseAllNested } from "react-json-view-lite";
import "react-json-view-lite/dist/index.css";
import type { DataApiTestView } from "@/utils/data-api-test-response";
import { Dialog, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Empty, EmptyDescription, EmptyHeader, EmptyTitle } from "@/components/ui/empty";
import { Loader } from "@/components/common/loader";
import { DataApiTestResult } from "./data-api-test-result";

export function DataApiTestDialog({ open, onOpenChange, name, pending, result, error, onRetry }: {
  open: boolean; onOpenChange: (open: boolean) => void; name: string; pending: boolean;
  result?: DataApiTestView; error?: string; onRetry: () => void;
}) {
  const { t } = useTranslation("ingestion");
  const responseTitleId = useId();
  return <Dialog isOpen={open} onOpenChange={(next) => { if (!pending) onOpenChange(next); }} showCloseButton={false}
    isDismissable={!pending} isKeyboardDismissDisabled={pending} className="h-144 max-h-[calc(100dvh-2rem)] sm:max-w-3xl [&>[data-slot=dialog]]:min-h-0 [&>[data-slot=dialog]]:grid-rows-[auto_minmax(0,1fr)_auto]">
    <DialogHeader><DialogTitle><IconApi aria-hidden="true" />{t("dataApi.test")}</DialogTitle><DialogDescription className="wrap-anywhere">{name}</DialogDescription></DialogHeader>
    <ScrollArea className="min-h-0" role="region" aria-label={t("dataApi.testDetails")} tabIndex={0}>
      {pending ? <Loader className="min-h-48" text={t("dataApi.testing")} /> : <div className="flex min-w-0 flex-col gap-3">
        {error ? <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert> : null}
        {result ? <DataApiTestResult result={result} /> : null}
        {result?.responseData !== undefined ? <section className="flex min-w-0 flex-col gap-2" aria-labelledby={responseTitleId}>
          <h3 id={responseTitleId} className="font-medium">{t("dataApi.receivedJson")}</h3>
          <div className="min-w-0 rounded-md bg-muted p-3 font-mono text-xs wrap-anywhere">
            {result.responseData !== null && typeof result.responseData === "object" ? <JsonView
              data={result.responseData}
              shouldExpandNode={collapseAllNested}
              aria-label={t("dataApi.receivedJson")}
              style={{
                container: "text-foreground",
                label: "mr-1 font-medium text-foreground",
                stringValue: "text-foreground",
                numberValue: "text-primary",
                booleanValue: "text-primary",
                nullValue: "text-muted-foreground",
                undefinedValue: "text-muted-foreground",
                otherValue: "text-muted-foreground",
                punctuation: "text-muted-foreground",
                ariaLables: { collapseJson: t("dataApi.collapseJson"), expandJson: t("dataApi.expandJson") },
              }}
            /> : <code>{JSON.stringify(result.responseData)}</code>}
          </div>
        </section> : !error ? <Empty><EmptyHeader><EmptyTitle>{t("dataApi.noResponse")}</EmptyTitle><EmptyDescription>{t("dataApi.noResponseHelp")}</EmptyDescription></EmptyHeader></Empty> : null}
      </div>}
    </ScrollArea>
    <DialogFooter><Button type="button" variant="outline" isDisabled={pending} onPress={() => onOpenChange(false)}>{t("dataApi.close")}</Button><Button type="button" isDisabled={pending} onPress={onRetry}>{t("dataApi.test")}</Button></DialogFooter>
  </Dialog>;
}
