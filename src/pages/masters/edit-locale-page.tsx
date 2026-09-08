import { PageSection } from "@/components/common/page-layout";
import { Alert, AlertAction, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useQuery } from "@tanstack/react-query";
import { CircleAlert, RefreshCw } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { toast } from "sonner";
import { getLocaleRecord, updateMasterRecord, type MasterRecord } from "../../api/masters-reference.api";
import { LocaleForm, LocalePageHeading } from "./locale-form";
import { LOCALES_PATH, localePayload, type LocaleFormValues } from "./locale-schema";

export function EditLocalePage() {
  const navigate = useNavigate();
  const { localeCode = "" } = useParams<{ localeCode: string }>();
  const decodedLocaleCode = decodeURIComponent(localeCode);
  const returnToLocales = () => navigate(LOCALES_PATH);
  const localeQuery = useQuery({
    queryKey: ["masters", "locales", "detail", decodedLocaleCode],
    queryFn: () => getLocaleRecord(decodedLocaleCode),
    enabled: Boolean(decodedLocaleCode),
  });

  async function updateLocale(values: LocaleFormValues) {
    try {
      await updateMasterRecord({
        endpoint: LOCALES_PATH,
        patchPath: `${LOCALES_PATH}/${encodeURIComponent(decodedLocaleCode)}`,
        payload: localePayload({ ...values, locale_code: decodedLocaleCode }),
      });
      toast.success("Locale updated successfully", {
        description: `${values.display_name.trim()} has been updated.`,
      });
      navigate(LOCALES_PATH, { replace: true });
    } catch (error) {
      toast.error("Locale could not be updated", {
        description: error instanceof Error ? error.message : "Please review the details and try again.",
      });
    }
  }

  return (
    <PageSection className="flex min-w-0 flex-col gap-4">
      <LocalePageHeading title="Edit Locale" description="Update the locale name, ordering, and availability settings." onBack={returnToLocales} />

      {localeQuery.isPending ? (
        <div className="mx-auto flex w-full max-w-xl items-center justify-center gap-2 py-10 text-muted-foreground" role="status">
          <Spinner />
          Loading locale...
        </div>
      ) : localeQuery.error ? (
        <Alert className="mx-auto w-full max-w-xl" variant="destructive">
          <CircleAlert aria-hidden="true" />
          <AlertTitle>Locale could not be loaded</AlertTitle>
          <AlertDescription>{localeQuery.error instanceof Error ? localeQuery.error.message : "Try loading the locale again."}</AlertDescription>
          <AlertAction>
            <Button type="button" variant="outline" size="sm" onPress={() => void localeQuery.refetch()}>
              <RefreshCw data-icon="inline-start" aria-hidden="true" />
              Retry
            </Button>
          </AlertAction>
        </Alert>
      ) : localeQuery.data ? (
        <LocaleForm mode="edit" defaultValues={localeFormValues(localeQuery.data)} onCancel={returnToLocales} onSubmit={updateLocale} />
      ) : null}
    </PageSection>
  );
}

function localeFormValues(record: MasterRecord): LocaleFormValues {
  const sortOrder = Number(record.sort_order ?? 0);
  return {
    display_name: String(record.display_name ?? record.name ?? ""),
    locale_code: String(record.locale_code ?? ""),
    native_name: String(record.native_name ?? ""),
    sort_order: Number.isFinite(sortOrder) ? sortOrder : 0,
    is_default: Boolean(record.is_default),
    is_active: typeof record.is_active === "boolean" ? record.is_active : true,
  };
}
