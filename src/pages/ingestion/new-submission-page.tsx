import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { IconArrowLeft } from "@tabler/icons-react";
import { getSelectedLocale, getSelectedUnitCode } from "@/api/session.api";
import { useRequestPeriodCollection } from "@/hooks/use-template-workflow";
import { useDocumentTitle } from "@/hooks/use-document-title";
import { PageHeader } from "@/components/common/page-layout";
import { Loader } from "@/components/common/loader";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { SubmissionMethodSelection } from "@/components/data-collection/submission-method-selection";

export function NewSubmissionPage() {
  const { collectionCode = "" } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation("ingestion");
  const collectionQuery = useRequestPeriodCollection(collectionCode, getSelectedUnitCode(), getSelectedLocale());
  const collection = collectionQuery.data;
  const collectionPath = `/ingestion/data-collection/${encodeURIComponent(collectionCode)}`;
  useDocumentTitle(t("newSubmission.title"));

  return <section className="mx-auto flex w-full max-w-3xl flex-col gap-4" aria-labelledby="new-submission-title">
    <Button className="w-fit" type="button" variant="outline" onPress={() => navigate(collectionPath)}>
      <IconArrowLeft data-icon="inline-start" aria-hidden="true" />{t("dataCollection.upload.back")}
    </Button>
    <PageHeader>
      <div className="min-w-0">
        <h2 id="new-submission-title">{t("newSubmission.title")}</h2>
        <p className="wrap-anywhere">{collection
          ? t("newSubmission.collectionDescription", { name: collection.collectionLabel, year: collection.yearPeriod })
          : t("newSubmission.description")}</p>
      </div>
    </PageHeader>
    {collectionQuery.isPending ? <Loader text={t("dataCollection.detail.loading")} />
      : !collection ? <Alert variant="destructive">
        <AlertTitle>{t("dataCollection.detail.errorTitle")}</AlertTitle>
        <AlertDescription>{collectionQuery.error instanceof Error ? collectionQuery.error.message : t("dataCollection.detail.errorDescription")}</AlertDescription>
        <Button className="w-fit" type="button" variant="outline" isDisabled={collectionQuery.isFetching} onPress={() => void collectionQuery.refetch()}>{t("dataCollection.error.retry")}</Button>
      </Alert> : <>
        {collectionQuery.isFetching ? <Loader className="min-h-0 justify-start" text={t("newSubmission.refreshing")} /> : null}
        <SubmissionMethodSelection collectionPath={`/ingestion/data-collection/${encodeURIComponent(collection.collectionCode)}`} />
      </>}
  </section>;
}
