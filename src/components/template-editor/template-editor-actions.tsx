import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { IconDeviceFloppy } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";
import type { TemplateEditorMode } from "./template-editor-types";

type TemplateEditorActionsProps = {
  mode: TemplateEditorMode;
  isPending: boolean;
  canSubmit: boolean;
};

export function TemplateEditorActions({
  mode,
  isPending,
  canSubmit,
}: TemplateEditorActionsProps) {
  const { t } = useTranslation("ingestion");

  return (
    <div className="flex shrink-0 items-center gap-2">
      <Button type="submit" isDisabled={!canSubmit || isPending}>
        {isPending
          ? <Spinner data-icon="inline-start" aria-label={mode === "edit" ? t("templateForm.submit.saving") : t("templateForm.submit.submitting")} />
          : <IconDeviceFloppy data-icon="inline-start" aria-hidden="true" />}
        {isPending
          ? mode === "edit" ? t("templateForm.submit.saving") : t("templateForm.submit.submitting")
          : mode === "edit" ? t("templateForm.submit.saveChanges") : t("templateForm.workspace.createTemplate")}
      </Button>
    </div>
  );
}
