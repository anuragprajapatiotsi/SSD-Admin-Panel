import { useState } from "react";
import { useTranslation } from "react-i18next";
import { IconArrowLeft, IconApi, IconDeviceFloppy, IconPlayerPlay, IconShieldLock } from "@tabler/icons-react";
import type { ExternalApiConnection } from "@/api/external-api.api";
import { PageHeader } from "@/components/common/page-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FieldGroup } from "@/components/ui/field";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertDialog, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { CustomTabs } from "@/components/common/custom-tabs";
import { Spinner } from "@/components/ui/spinner";
import { Badge } from "@/components/ui/badge";
import { useDataApiEditor } from "@/hooks/use-data-api-editor";
import { API_AUTH_TYPES, API_METHODS, AUTH_FIELDS, SECRET_AUTH_FIELDS, type DataApiFormValues } from "@/utils/data-api-form";
import { DataApiPairs, DataApiSelect, DataApiTextarea, DataApiTextField } from "./data-api-fields";
import { DataApiTestDialog } from "./data-api-test-dialog";

export function DataApiEditor({ unit, connection }: { unit: string; connection?: ExternalApiConnection }) {
  const { t } = useTranslation("ingestion");
  const editor = useDataApiEditor(unit, connection);
  const { values, update, errors, pending, result, blocker } = editor;
  const disabled = pending !== null;
  const authType = values.auth.type;
  const [selectedTab, setSelectedTab] = useState("query");
  const tabs = ["query", "headers", "authentication", "body"] as const;
  const hasTabError = (tab: typeof tabs[number]) => Object.keys(errors).some((path) => path.split(".")[0] === (tab === "authentication" ? "auth" : tab));
  const tabContent = {
    query: <DataApiPairs name="query" values={values.query} disabled={disabled} errors={errors} onChange={(rows) => update("query", rows)} />,
    headers: <DataApiPairs name="headers" values={values.headers} disabled={disabled} errors={errors} onChange={(rows) => update("headers", rows)} />,
    authentication: <FieldGroup>
      <DataApiSelect label={t("dataApi.fields.authentication")} value={authType} disabled={disabled} options={API_AUTH_TYPES.map((type) => ({ value: type, label: t(`dataApi.authTypes.${type}`) }))} onChange={(type) => update("auth", { ...values.auth, type: type as DataApiFormValues["auth"]["type"] })} />
      {connection?.configuration?.authentication?.credentialConfigured && authType === connection.configuration.authentication.type ? <Alert><IconShieldLock aria-hidden="true" /><AlertDescription>{t("dataApi.credentialReenter")}</AlertDescription></Alert> : null}
      {AUTH_FIELDS[authType].map((key) => <DataApiTextField key={key} id={`api-auth-${key}`} label={t(`dataApi.fields.${key}`)} value={values.auth[key]} disabled={disabled} error={errors[`auth.${key}`]} autoComplete="off" type={SECRET_AUTH_FIELDS.has(key) ? "password" : key === "token_url" ? "url" : "text"} onChange={(event) => update("auth", { ...values.auth, [key]: event.target.value })} />)}
    </FieldGroup>,
    body: values.method === "GET" ? <Alert><AlertDescription>{t("dataApi.getBodyHelp")}</AlertDescription></Alert>
      : <DataApiTextarea id="api-body" label={t("dataApi.fields.body")} value={values.body} rows={8} disabled={disabled} error={errors.body} spellCheck={false} description={t("dataApi.bodyHelp")} onChange={(event) => update("body", event.target.value)} />,
  };

  async function submit(action: "test" | "save") {
    const invalid = await editor.send(action);
    if (!invalid) return;
    const [section, index, field] = Object.keys(invalid)[0].split(".");
    if (section === "auth") setSelectedTab("authentication");
    else if (section === "query" || section === "headers" || section === "body") setSelectedTab(section);
    const id = section === "auth" ? `api-auth-${index}`
      : section === "query" || section === "headers" ? `${values[section][Number(index)]?.id}-${field}` : `api-${section}`;
    requestAnimationFrame(() => document.getElementById(id)?.focus());
  }

  return <section className="mx-auto flex w-full max-w-3xl flex-col gap-4" aria-labelledby="data-api-editor-title">
    <Button type="button" variant="outline" className="w-fit" isDisabled={disabled} onPress={editor.back}><IconArrowLeft data-icon="inline-start" aria-hidden="true" />{t("dataApi.back")}</Button>
    <PageHeader><div><h2 id="data-api-editor-title">{t(connection ? "dataApi.editTitle" : "dataApi.createTitle")}</h2><p>{t(connection ? "dataApi.editDescription" : "dataApi.createDescription")}</p></div>
      {connection ? <Badge variant="secondary">{t("dataApi.version", { version: connection.currentVersion })}</Badge> : null}
    </PageHeader>
    <form noValidate onSubmit={(event) => { event.preventDefault(); void submit("save"); }} className="flex flex-col gap-4" aria-busy={disabled}>
      <Card>
        <CardHeader><CardTitle><span className="flex items-center gap-2"><IconApi aria-hidden="true" />{t("dataApi.connectionDetails")}</span></CardTitle><CardDescription>{t("dataApi.unit", { unit })}</CardDescription></CardHeader>
        <CardContent><FieldGroup>
          <DataApiTextField id="api-name" label={t("dataApi.fields.name")} value={values.name} maxLength={240} disabled={disabled} error={errors.name} onChange={(event) => update("name", event.target.value)} />
          <DataApiTextarea id="api-description" label={t("dataApi.fields.description")} value={values.description} maxLength={4000} rows={2} disabled={disabled} error={errors.description} onChange={(event) => update("description", event.target.value)} />
          <FieldGroup className="sm:flex-row">
            <DataApiSelect label={t("dataApi.fields.method")} value={values.method} disabled={disabled} options={API_METHODS.map((method) => ({ value: method, label: method }))} onChange={(method) => update("method", method as DataApiFormValues["method"])} />
            <DataApiTextField id="api-timeout" label={t("dataApi.fields.timeout")} type="number" min={1} max={120} step={1} value={values.timeout} disabled={disabled} error={errors.timeout} description={connection && connection.timeoutSeconds == null ? t("dataApi.timeoutNotReturned") : undefined} onChange={(event) => update("timeout", event.target.value)} />
          </FieldGroup>
          <DataApiTextField id="api-url" label={t("dataApi.fields.url")} type="url" autoComplete="off" value={values.url} maxLength={2000} disabled={disabled} error={errors.url} description={t("dataApi.urlHelp")} onChange={(event) => update("url", event.target.value)} />
        </FieldGroup></CardContent>
      </Card>
      <Card>
        <CardHeader><CardTitle>{t("dataApi.requestSettings")}</CardTitle><CardDescription>{t("dataApi.requestSettingsHelp")}</CardDescription></CardHeader>
        <CardContent>
          <CustomTabs
            value={selectedTab}
            onValueChange={setSelectedTab}
            variant="underline"
            ariaLabel={t("dataApi.requestSettings")}
            items={tabs.map((tab) => ({
              value: tab,
              label: t(`dataApi.tabs.${tab}`),
              icon: hasTabError(tab) ? <span aria-label={t("dataApi.fieldErrors")} className="text-destructive">*</span> : undefined,
              content: tabContent[tab],
            }))}
          />
        </CardContent>
        <CardFooter><p className="text-muted-foreground">{t("dataApi.testWarning")}</p></CardFooter>
      </Card>
      {Object.keys(errors).length ? <Alert variant="destructive"><AlertDescription>{t("dataApi.fieldErrors")}</AlertDescription></Alert> : null}
      {editor.error && !editor.testOpen ? <Alert variant="destructive"><AlertDescription>{editor.error}</AlertDescription></Alert> : null}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button type="button" variant="outline" isDisabled={disabled} onPress={editor.back}>{t("dataApi.cancel")}</Button>
        <div className="flex flex-wrap gap-2">
          <Button type="button" variant="outline" isDisabled={disabled} onPress={() => void submit("test")}>{pending === "test" ? <Spinner aria-hidden="true" /> : <IconPlayerPlay data-icon="inline-start" aria-hidden="true" />}{t(pending === "test" ? "dataApi.testing" : "dataApi.test")}</Button>
          <Button type="submit" isDisabled={disabled}>{pending === "save" ? <Spinner aria-hidden="true" /> : <IconDeviceFloppy data-icon="inline-start" aria-hidden="true" />}{t(pending === "save" ? "dataApi.saving" : "dataApi.save")}</Button>
        </div>
      </div>
    </form>
    <DataApiTestDialog open={editor.testOpen} onOpenChange={editor.setTestOpen} name={values.name} pending={pending === "test"} result={result} error={editor.error} onRetry={() => void submit("test")} />
    <AlertDialog isOpen={blocker.state === "blocked"} onOpenChange={(open) => { if (!open && !disabled && blocker.state === "blocked") blocker.reset(); }} isKeyboardDismissDisabled={disabled}>
      <AlertDialogHeader><AlertDialogTitle>{t(disabled ? "dataApi.waitTitle" : "dataApi.discardTitle")}</AlertDialogTitle><AlertDialogDescription>{t(disabled ? "dataApi.waitDescription" : "dataApi.discardDescription")}</AlertDialogDescription></AlertDialogHeader>
      <AlertDialogFooter><Button variant="outline" onPress={() => { if (blocker.state === "blocked") blocker.reset(); }}>{t("dataApi.stay")}</Button>
        {!disabled ? <Button variant="destructive" onPress={() => { if (blocker.state === "blocked") blocker.proceed(); }}>{t("dataApi.discard")}</Button> : null}</AlertDialogFooter>
    </AlertDialog>
  </section>;
}
