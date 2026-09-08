import { PageSection } from "@/components/common/page-layout";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { createMasterRecord } from "../../api/masters-reference.api";
import { LocaleForm, LocalePageHeading } from "./locale-form";
import { LOCALES_PATH, localePayload, type LocaleFormValues } from "./locale-schema";

export function CreateLocalePage() {
  const navigate = useNavigate();
  const returnToLocales = () => navigate(LOCALES_PATH);

  async function createLocale(values: LocaleFormValues) {
    try {
      await createMasterRecord({ endpoint: LOCALES_PATH, payload: localePayload(values) });
      toast.success("Locale created successfully", {
        description: `${values.display_name.trim()} is now available in Locales.`,
      });
      navigate(LOCALES_PATH, { replace: true });
    } catch (error) {
      toast.error("Locale could not be created", {
        description: error instanceof Error ? error.message : "Please review the details and try again.",
      });
    }
  }

  return (
    <PageSection className="flex min-w-0 flex-col gap-4">
      <LocalePageHeading title="Create Locale" description="Add a language and regional locale used across labels, content, and user preferences." onBack={returnToLocales} />
      <LocaleForm onCancel={returnToLocales} onSubmit={createLocale} />
    </PageSection>
  );
}
