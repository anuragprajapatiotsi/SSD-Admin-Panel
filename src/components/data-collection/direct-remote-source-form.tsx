import { useRef, useState } from "react";
import { useInfiniteQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { dataApiKeys } from "@/hooks/use-data-api";
import { externalApiService } from "@/services/external-api.service";
import { directIngestionService } from "@/services/direct-ingestion.service";
import type { DirectIngestion } from "@/api/direct-ingestion.api";
import { Field, FieldGroup, FieldLabel, FieldError, FieldDescription } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group";
import { Card, CardAction, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { IconWorld, IconLink, IconArrowRight } from "@tabler/icons-react";
import { DirectApiSourcePicker } from "./direct-api-source-picker";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Loader } from "@/components/common/loader";
import { Spinner } from "@/components/ui/spinner";

export function DirectRemoteSourceForm({ source, unitCode, collectionCode, parent, onSuccess }: {
  source: "API" | "WEB_SCRAPE"; unitCode: string; collectionCode: string; parent?: DirectIngestion; onSuccess: () => void;
}) {
  const { t } = useTranslation("ingestion");
  const client = useQueryClient();
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const submitting = useRef(false);
  const connections = useInfiniteQuery({
    queryKey: ["external-api-options", unitCode], enabled: source === "API", initialPageParam: 0,
    queryFn: ({ pageParam }) => externalApiService.list(unitCode, 200, pageParam),
    getNextPageParam: (page) => page.page.returned > 0 && page.page.offset + page.page.returned < page.page.total ? page.page.offset + page.page.returned : undefined,
  });
  const options = (connections.data?.pages.flatMap((page) => page.items) ?? [])
    .filter((item) => item.isActive === true);
  const mutation = useMutation({
    mutationFn: async (input: string) => {
      if (parent && (parent.requestPeriodCode !== collectionCode || parent.sourceType !== source)) throw new Error(t("directIngestion.sourceMismatch"));
      if (source === "API") return parent
        ? externalApiService.submit(input, parent.directIngestionCode, unitCode)
        : externalApiService.createIngestion(input, { unit_code: unitCode, request_period_code: collectionCode });
      const payload = { unit_code: unitCode, request_period_code: collectionCode, source_type: source, source_url: input };
      return parent ? directIngestionService.submit(parent.directIngestionCode, payload) : directIngestionService.create(payload);
    },
    onSuccess: async () => {
      await Promise.all([
        client.invalidateQueries({ queryKey: ["direct-ingestion"] }),
        client.invalidateQueries({ queryKey: ["template-workflow", "collection-activities"] }),
        client.invalidateQueries({ queryKey: dataApiKeys.all }),
        client.invalidateQueries({ queryKey: ["external-api-options"] }),
      ]);
      onSuccess();
    },
  });
  async function submit(selectedValue = value) {
    if (submitting.current || mutation.isSuccess) return;
    const input = selectedValue.trim();
    const valid = source === "API" ? !connections.isError && options.some((option) => option.code === input)
      : z.string().url().regex(/^https?:\/\//i).safeParse(input).success;
    if (!valid) { setError(t(source === "API" ? "directIngestion.selectApi" : "directIngestion.validUrl")); return; }
    submitting.current = true;
    setError("");
    try { await mutation.mutateAsync(input); } catch { /* Keep the source selected for retry. */ }
    finally { submitting.current = false; }
  }
  if (source === "API") return <div className="flex flex-col gap-4">
    {connections.isPending ? <Loader text={t("directReview.loadingOptions")} /> : connections.data ? <DirectApiSourcePicker
      connections={options}
      pending={mutation.isPending || mutation.isSuccess}
      error={error || (mutation.isError ? mutation.error.message : undefined)}
      onChoose={() => { setError(""); mutation.reset(); }}
      onFetch={submit}
    /> : null}
    {connections.isFetching && !connections.isPending ? <Loader className="min-h-0 justify-start" text={t("dataApi.refreshing")} /> : null}
    {connections.isError ? <Alert variant="destructive"><AlertDescription>{t("directReview.optionsError")}</AlertDescription><Button type="button" variant="outline" isDisabled={connections.isFetching || mutation.isPending} onPress={() => void connections.refetch()}>{t("dataCollection.error.retry")}</Button></Alert> : null}
    {connections.hasNextPage ? <Button className="self-end" type="button" variant="outline" isDisabled={connections.isFetching || mutation.isPending} onPress={() => void connections.fetchNextPage()}>{t("dataApi.loadMore")}</Button> : null}
  </div>;
  return <form onSubmit={(event) => { event.preventDefault(); void submit(); }} noValidate aria-busy={mutation.isPending}>
    <Card>
      <CardHeader>
        <CardTitle>{t("directIngestion.webSourceTitle")}</CardTitle>
        <CardDescription>{t("directIngestion.webSourceDescription")}</CardDescription>
        <CardAction>
          <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <IconWorld className="size-5" aria-hidden="true" />
          </div>
        </CardAction>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <FieldGroup>
      <Field data-invalid={Boolean(error)} data-disabled={mutation.isPending}>
        <FieldLabel htmlFor="direct-remote-source">{t("directIngestion.webUrl")}</FieldLabel>
        <InputGroup>
          <InputGroupAddon><IconLink aria-hidden="true" /></InputGroupAddon>
          <InputGroupInput id="direct-remote-source" type="url" value={value} placeholder={t("directIngestion.webUrlPlaceholder")} autoCapitalize="none" spellCheck={false} disabled={mutation.isPending} aria-invalid={Boolean(error)} aria-describedby={error ? "direct-remote-source-help direct-remote-source-error" : "direct-remote-source-help"} onChange={(event) => { setValue(event.target.value); setError(""); }} />
        </InputGroup>
        <FieldDescription id="direct-remote-source-help">{t("directIngestion.webUrlHelp")}</FieldDescription>
        <FieldError id="direct-remote-source-error">{error}</FieldError>
      </Field>
        </FieldGroup>
        {mutation.isError ? <Alert variant="destructive"><AlertDescription>{mutation.error.message}</AlertDescription></Alert> : null}
      </CardContent>
      <CardFooter className="justify-end">
        <Button className="w-full sm:w-auto" type="submit" isDisabled={!value.trim() || mutation.isPending || mutation.isSuccess}>
          {mutation.isPending ? <Spinner aria-hidden="true" /> : <IconArrowRight data-icon="inline-start" aria-hidden="true" />}{t(mutation.isPending ? "directIngestion.starting" : "directIngestion.fetchSource")}
        </Button>
      </CardFooter>
    </Card>
  </form>;
}
