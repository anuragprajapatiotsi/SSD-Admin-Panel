import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { IconApi, IconPlus, IconRefresh, IconSearch } from "@tabler/icons-react";
import { DATA_API_PATH, useDataApiList, useDataApiUnit } from "@/hooks/use-data-api";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { DataApiConnectionCard } from "@/components/data-api/data-api-connection-card";
import { PageHeader, PageSection } from "@/components/common/page-layout";
import { Loader } from "@/components/common/loader";
import { Button } from "@/components/ui/button";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";

function DataApiList({ unit }: { unit: string }) {
  const { t } = useTranslation("ingestion");
  const query = useDataApiList(unit);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();
  const records = [...new Map((query.data?.pages.flatMap((page) => page.items) ?? []).map((item) => [item.code, item])).values()];
  const items = records.filter((item) => `${item.name} ${item.description ?? ""}`.toLocaleLowerCase().includes(search.trim().toLocaleLowerCase()));
  return <PageSection className="mx-auto w-full max-w-6xl" aria-labelledby="data-api-title">
    <PageHeader><div><h2 id="data-api-title">{t("dataApi.title")}</h2><p>{t("dataApi.description")}</p></div>
      <Button onPress={() => navigate(`${DATA_API_PATH}/new`)}><IconPlus data-icon="inline-start" aria-hidden="true" />{t("dataApi.new")}</Button>
    </PageHeader>
    <div className="flex flex-wrap items-center gap-3">
      <InputGroup className="max-w-sm"><InputGroupAddon><IconSearch aria-hidden="true" /></InputGroupAddon><InputGroupInput aria-label={t("dataApi.search")} placeholder={t("dataApi.search")} value={search} onChange={(event) => setSearch(event.target.value)} /></InputGroup>
      <Button variant="outline" isDisabled={query.isFetching} onPress={() => void query.refetch()}><IconRefresh data-icon="inline-start" aria-hidden="true" />{t("dataApi.refresh")}</Button>
      {query.isFetching && !query.isPending ? <Loader className="min-h-0" text={t("dataApi.refreshing")} /> : null}
    </div>
    {query.isError ? <Alert variant="destructive"><AlertDescription>{t("dataApi.loadError")}</AlertDescription><Button variant="outline" isDisabled={query.isFetching} onPress={() => void query.refetch()}>{t("dataApi.retry")}</Button></Alert> : null}
    {query.isPending ? <Loader text={t("dataApi.loading")} /> : items.length ? <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">{items.map((item) => <DataApiConnectionCard key={`${item.code}:${item.currentVersion}`} connection={item} unit={unit} />)}</div>
      : !query.isError ? <Empty><EmptyHeader><EmptyMedia variant="icon"><IconApi aria-hidden="true" /></EmptyMedia><EmptyTitle>{t(search ? "dataApi.noMatches" : "dataApi.emptyTitle")}</EmptyTitle><EmptyDescription>{t(search ? "dataApi.noMatchesHelp" : "dataApi.emptyDescription")}</EmptyDescription></EmptyHeader><EmptyContent><Button variant="outline" onPress={() => search ? setSearch("") : navigate(`${DATA_API_PATH}/new`)}>{t(search ? "dataApi.clearSearch" : "dataApi.new")}</Button></EmptyContent></Empty> : null}
    {query.hasNextPage ? <div className="flex justify-end"><Button variant="outline" isDisabled={query.isFetching} onPress={() => void query.fetchNextPage()}>{t("dataApi.loadMore")}</Button></div> : null}
  </PageSection>;
}

export function DataApiPage() {
  const unit = useDataApiUnit();
  const { t } = useTranslation("ingestion");
  useDocumentTitle(t("dataApi.title"));
  return <DataApiList key={unit} unit={unit} />;
}
