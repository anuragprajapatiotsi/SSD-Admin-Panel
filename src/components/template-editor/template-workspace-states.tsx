import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/common/loader";
import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { IconAlertTriangle, IconRefresh } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

export function TemplateWorkspaceLoadingState() {
  const { t } = useTranslation("ingestion");

  return <Loader className="size-full min-h-0" text={t("templateForm.loadingTemplate")} />;
}

type TemplateWorkspaceErrorStateProps = {
  message: string;
  onRetry: () => void;
};

export function TemplateWorkspaceErrorState({ message, onRetry }: TemplateWorkspaceErrorStateProps) {
  const { t } = useTranslation(["ingestion", "common"]);

  return (
    <div className="flex size-full min-h-0 p-3">
      <Empty className="border bg-background">
        <EmptyHeader>
          <EmptyMedia variant="icon"><IconAlertTriangle aria-hidden="true" /></EmptyMedia>
          <EmptyTitle>{t("ingestion:templateForm.workspace.loadErrorTitle")}</EmptyTitle>
          <EmptyDescription>{t("ingestion:templateForm.workspace.loadErrorDescription")}</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Alert variant="destructive">
            <IconAlertTriangle aria-hidden="true" />
            <AlertTitle>{t("ingestion:templateForm.workspace.loadErrorTitle")}</AlertTitle>
            <AlertDescription>{message}</AlertDescription>
          </Alert>
          <Button type="button" variant="outline" onPress={onRetry}>
            <IconRefresh data-icon="inline-start" aria-hidden="true" />
            {t("common:actions.retry")}
          </Button>
        </EmptyContent>
      </Empty>
    </div>
  );
}
