import { useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { IconApi, IconPencil, IconPlugConnected, IconTrash } from "@tabler/icons-react";
import { toast } from "sonner";
import type { ExternalApiConnection } from "@/api/external-api.api";
import { externalApiService } from "@/services/external-api.service";
import { DATA_API_PATH, useInvalidateDataApis } from "@/hooks/use-data-api";
import { safeConnectionAddress } from "@/utils/data-api-form";
import { dataApiTestView, type DataApiTestView } from "@/utils/data-api-test-response";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip";
import { Spinner } from "@/components/ui/spinner";
import { StatusBadge, StatusDot } from "@/components/common/status-badge";
import { normalizeStatusVariant } from "@/components/common/status-variants";
import { DataApiTestDialog } from "./data-api-test-dialog";

export function DataApiConnectionCard({ connection, unit }: { connection: ExternalApiConnection; unit: string }) {
  const { t } = useTranslation("ingestion");
  const navigate = useNavigate();
  const invalidate = useInvalidateDataApis();
  const [confirm, setConfirm] = useState(false);
  const [pending, setPending] = useState<"test" | "delete" | null>(null);
  const [result, setResult] = useState<DataApiTestView>();
  const [testOpen, setTestOpen] = useState(false);
  const [error, setError] = useState("");
  const busy = useRef(false);
  const status = result?.status ?? connection.test?.status ?? "NOT_STARTED";
  async function act(action: "test" | "delete") {
    if (busy.current) return;
    busy.current = true; setPending(action); setError("");
    if (action === "test") { setResult(undefined); setTestOpen(true); }
    try {
      if (action === "test") {
        const response = await externalApiService.testSaved(connection.code, unit);
        const config = response.configuration ?? connection.configuration;
        const secretKeys = [...(config?.queryParameters ?? []), ...(config?.headers ?? [])].filter((pair) => pair.secret).map((pair) => pair.key);
        if (config?.authentication?.apiKeyName) secretKeys.push(config.authentication.apiKeyName);
        setResult(dataApiTestView(response.test, { secretKeys, redacted: t("dataApi.redacted"), omitted: t("dataApi.omitted") }));
      } else {
        const response = await externalApiService.remove(connection.code, unit);
        if (!response.deleted) throw new Error();
        setConfirm(false); toast.success(t("dataApi.deleted"));
      }
      void invalidate();
    } catch { setError(t(action === "test" ? "dataApi.testError" : "dataApi.deleteError")); }
    finally { busy.current = false; setPending(null); }
  }
  return <Card size="sm" className="h-full">
    <CardHeader>
      <div className="flex min-w-0 items-center gap-2">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><IconApi aria-hidden="true" /></span>
        <CardTitle className="min-w-0 flex-1"><Link className="rounded-sm font-semibold outline-none hover:underline focus-visible:ring-2 focus-visible:ring-ring wrap-anywhere" to={`${DATA_API_PATH}/${encodeURIComponent(connection.code)}/edit`}>{connection.name}</Link></CardTitle>
        <Badge className="shrink-0" variant="secondary">{t("dataApi.version", { version: connection.currentVersion })}</Badge>
      </div>
      <CardDescription className="line-clamp-2 min-h-8">{connection.description || t("dataApi.cardDescription")}</CardDescription>
    </CardHeader>
    <CardContent className="flex flex-1 flex-col gap-3">
      <div className="flex min-w-0 items-start gap-2"><Badge variant="outline">{connection.method}</Badge><span className="wrap-anywhere text-muted-foreground">{safeConnectionAddress(connection.url)}</span></div>
      <div className="flex flex-wrap gap-2">
        <StatusBadge variant={normalizeStatusVariant(status)}>{t(status === "SUCCESS" ? "dataApi.testSuccess" : status === "FAILED" ? "dataApi.testFailed" : "dataApi.notTested")}</StatusBadge>
        <span className="inline-flex items-center gap-1.5 text-muted-foreground"><StatusDot variant={normalizeStatusVariant(connection.isActive ? "ACTIVE" : "INACTIVE")} aria-hidden="true" />{t(connection.isActive ? "dataApi.active" : "dataApi.inactive")}</span>
      </div>
    </CardContent>
    <CardFooter className="flex-wrap gap-2">
      <Button variant="outline" size="sm" onPress={() => navigate(`${DATA_API_PATH}/${encodeURIComponent(connection.code)}/edit`)} isDisabled={pending !== null}><IconPencil data-icon="inline-start" aria-hidden="true" />{t("dataApi.edit")}</Button>
      <TooltipTrigger><Button variant="destructive" size="icon-sm" aria-label={t("dataApi.deleteNamed", { name: connection.name })} isDisabled={pending !== null} onPress={() => { setError(""); setConfirm(true); }}><IconTrash aria-hidden="true" /></Button><Tooltip>{t("dataApi.delete")}</Tooltip></TooltipTrigger>
      <Button className="ml-auto" size="sm" isDisabled={pending !== null || !connection.isActive} onPress={() => void act("test")}>{pending === "test" ? <Spinner aria-hidden="true" /> : <IconPlugConnected aria-hidden="true" />}{t(pending === "test" ? "dataApi.testing" : "dataApi.test")}</Button>
    </CardFooter>
    <DataApiTestDialog open={testOpen} onOpenChange={setTestOpen} name={connection.name} pending={pending === "test"} result={result} error={error} onRetry={() => void act("test")} />
    <AlertDialog isOpen={confirm} onOpenChange={(open) => { if (!pending) setConfirm(open); }} isKeyboardDismissDisabled={pending !== null}>
      <AlertDialogHeader><AlertDialogTitle>{t("dataApi.deleteTitle", { name: connection.name })}</AlertDialogTitle><AlertDialogDescription>{t("dataApi.deleteDescription")}</AlertDialogDescription></AlertDialogHeader>
      {error ? <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert> : null}
      <AlertDialogFooter><Button variant="outline" isDisabled={pending !== null} onPress={() => setConfirm(false)}>{t("dataApi.cancel")}</Button><Button variant="destructive" isDisabled={pending !== null} onPress={() => void act("delete")}>{pending === "delete" ? <Spinner aria-hidden="true" /> : null}{t("dataApi.delete")}</Button></AlertDialogFooter>
    </AlertDialog>
  </Card>;
}
