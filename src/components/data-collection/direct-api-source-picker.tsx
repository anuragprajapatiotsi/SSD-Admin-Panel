import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { IconApi, IconArrowDown, IconSearch } from "@tabler/icons-react";
import type { ExternalApiConnection } from "@/api/external-api.api";
import { DATA_API_PATH } from "@/hooks/use-data-api";
import { safeConnectionAddress } from "@/utils/data-api-form";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { AlertDialog, AlertDialogHeader, AlertDialogTitle, AlertDialogDescription, AlertDialogFooter } from "@/components/ui/alert-dialog";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "@/components/ui/empty";
import { Spinner } from "@/components/ui/spinner";
import { StatusBadge } from "@/components/common/status-badge";
import { normalizeStatusVariant } from "@/components/common/status-variants";

// Owns discovery and confirmation; the parent retains capture and pagination.
export function DirectApiSourcePicker({ connections, pending, error, onChoose, onFetch }: {
  connections: ExternalApiConnection[];
  pending: boolean;
  error?: string;
  onChoose: () => void;
  onFetch: (code: string) => Promise<void>;
}) {
  const { t } = useTranslation("ingestion");
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<ExternalApiConnection | null>(null);
  const term = search.trim().toLocaleLowerCase();
  const items = connections.filter((connection) => `${connection.name} ${connection.description ?? ""}`.toLocaleLowerCase().includes(term));

  return <>
    <div className="flex flex-wrap items-center justify-between gap-3">
      <InputGroup className="w-full sm:max-w-sm">
        <InputGroupAddon><IconSearch aria-hidden="true" /></InputGroupAddon>
        <InputGroupInput aria-label={t("dataApi.search")} placeholder={t("dataApi.search")} value={search} disabled={pending} onChange={(event) => setSearch(event.target.value)} />
      </InputGroup>
      <Button type="button" variant="outline" isDisabled={pending} onPress={() => navigate(DATA_API_PATH)}>{t("dataApi.manage")}</Button>
    </div>
    {items.length ? <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {items.map((connection) => {
        const status = connection.test?.status ?? "NOT_STARTED";
        return <Card key={connection.code} className="h-full" size="sm">
          <CardHeader>
            <div className="flex min-w-0 items-center gap-2">
              <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary"><IconApi aria-hidden="true" /></span>
              <CardTitle className="min-w-0 flex-1 wrap-anywhere">{connection.name}</CardTitle>
              <Badge className="shrink-0" variant="secondary">{t("dataApi.version", { version: connection.currentVersion })}</Badge>
            </div>
            {connection.description ? <CardDescription className="line-clamp-2">{connection.description}</CardDescription> : null}
          </CardHeader>
          <CardContent className="flex flex-1 items-start gap-2">
            <Badge variant="outline">{connection.method}</Badge>
            <span className="min-w-0 text-muted-foreground wrap-anywhere">{safeConnectionAddress(connection.url)}</span>
          </CardContent>
          <CardFooter className="flex-wrap justify-between gap-3">
            <StatusBadge variant={normalizeStatusVariant(status)}>{t(status === "SUCCESS" ? "dataApi.testSuccess" : status === "FAILED" ? "dataApi.testFailed" : "dataApi.notTested")}</StatusBadge>
            <Button type="button" className="ml-auto" isDisabled={pending} onPress={() => { onChoose(); setSelected(connection); }} aria-label={t("directIngestion.fetchApiNamed", { name: connection.name })}>
              <IconArrowDown data-icon="inline-start" aria-hidden="true" />{t("directIngestion.fetchSource")}
            </Button>
          </CardFooter>
        </Card>;
      })}
    </div> : <Empty>
      <EmptyHeader><EmptyMedia variant="icon"><IconApi aria-hidden="true" /></EmptyMedia><EmptyTitle>{t(term ? "dataApi.noMatches" : "directIngestion.noApis")}</EmptyTitle><EmptyDescription>{t(term ? "dataApi.noMatchesHelp" : "directIngestion.addApiHelp")}</EmptyDescription></EmptyHeader>
      <EmptyContent><Button type="button" variant="outline" onPress={() => term ? setSearch("") : navigate(`${DATA_API_PATH}/new`)}>{t(term ? "dataApi.clearSearch" : "dataApi.new")}</Button></EmptyContent>
    </Empty>}
    <AlertDialog isOpen={selected !== null} onOpenChange={(open) => { if (!open && !pending) setSelected(null); }} isDismissable={false} isKeyboardDismissDisabled={pending}>
      <AlertDialogHeader>
        <AlertDialogTitle>{t("directIngestion.confirmFetchTitle")}</AlertDialogTitle>
        <AlertDialogDescription className="wrap-anywhere">{t("directIngestion.confirmFetchDescription", { name: selected?.name })}</AlertDialogDescription>
      </AlertDialogHeader>
      {error ? <Alert variant="destructive"><AlertDescription>{error}</AlertDescription></Alert> : null}
      <AlertDialogFooter>
        <Button type="button" variant="outline" isDisabled={pending} onPress={() => setSelected(null)}>{t("dataApi.cancel")}</Button>
        <Button type="button" isDisabled={pending || !selected} onPress={() => { if (selected) void onFetch(selected.code); }}>
          {pending ? <Spinner data-icon="inline-start" aria-hidden="true" /> : <IconArrowDown data-icon="inline-start" aria-hidden="true" />}
          {t(pending ? "directIngestion.starting" : "directIngestion.fetchSource")}
        </Button>
      </AlertDialogFooter>
    </AlertDialog>
  </>;
}
