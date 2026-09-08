import { IconAlertTriangle, IconHome, IconRefresh } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import { isRouteErrorResponse, useRouteError } from "react-router-dom";

import { PublicPageHeader, PublicPageFooter } from "@/components/common/public-page-branding";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "@/components/ui/empty";
import { useDocumentTitle } from "@/hooks/use-document-title";

type ErrorDetails = {
  kind: "notFound" | "request" | "update" | "unexpected";
  status?: number;
  detail?: string;
};

function describeError(error: unknown): ErrorDetails {
  if (isRouteErrorResponse(error)) {
    return {
      kind: error.status === 404 ? "notFound" : "request",
      status: error.status,
      detail: `${error.status} ${error.statusText}`.trim(),
    };
  }

  const detail = error instanceof Error ? error.message : error == null ? undefined : String(error);
  const isChunkLoadError = /dynamically imported module|failed to fetch|loading chunk|importing a module/i.test(detail ?? "");
  return { kind: isChunkLoadError ? "update" : "unexpected", detail };
}

export function AppErrorPage() {
  const { t } = useTranslation("common");
  const details = describeError(useRouteError());
  const isNotFound = details.kind === "notFound";
  const title = t(`systemError.${details.kind}.title`);
  useDocumentTitle(title);

  return (
    <div className="relative isolate flex min-h-svh flex-col overflow-hidden bg-muted/40 text-foreground">
      <PublicPageHeader />

      <main id="public-main-content" tabIndex={-1} className="relative flex flex-1 items-center justify-center px-4 py-10 sm:py-16" aria-labelledby="app-error-title">
        <div className="pointer-events-none absolute -right-24 -bottom-24 -z-10 size-80 rounded-full border-32 border-primary/5" aria-hidden="true" />
        <Empty className="mx-auto max-w-xl flex-none gap-6 px-0 sm:px-6">
          <EmptyHeader className="max-w-md gap-3">
            <EmptyMedia>
              {details.status ? (
                <span aria-hidden="true" className="select-none text-8xl font-bold leading-none tracking-tighter text-primary/20 sm:text-9xl">{details.status}</span>
              ) : (
                <span aria-hidden="true" className="grid size-20 place-items-center rounded-2xl bg-primary/10 text-primary">
                  {details.kind === "update" ? <IconRefresh className="size-10" /> : <IconAlertTriangle className="size-10" />}
                </span>
              )}
            </EmptyMedia>
            <EmptyTitle><h1 id="app-error-title" className="text-2xl font-semibold">{title}</h1></EmptyTitle>
            <EmptyDescription>{t(`systemError.${details.kind}.description`)}</EmptyDescription>
          </EmptyHeader>
          <EmptyContent className="max-w-md gap-6">
            <div className="flex w-full flex-col justify-center gap-3 sm:flex-row">
              <Button type="button" variant={isNotFound ? "default" : "outline"} onPress={() => window.location.assign("/")}>
                <IconHome data-icon="inline-start" aria-hidden="true" />
                {t("systemError.dashboard")}
              </Button>
              <Button type="button" variant={isNotFound ? "outline" : "default"} onPress={() => window.location.reload()}>
                <IconRefresh data-icon="inline-start" aria-hidden="true" />
                {t("systemError.refresh")}
              </Button>
            </div>
            {import.meta.env.DEV && details.detail && !isNotFound ? (
              <Accordion className="text-left">
                <AccordionItem id="technical-details">
                  <AccordionTrigger>{t("systemError.technicalDetails")}</AccordionTrigger>
                  <AccordionContent>
                    <pre className="max-h-36 overflow-auto whitespace-pre-wrap break-words text-xs text-muted-foreground">{details.detail}</pre>
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            ) : null}
          </EmptyContent>
        </Empty>
      </main>
      <PublicPageFooter />
    </div>
  );
}
