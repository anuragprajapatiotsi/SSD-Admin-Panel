import { FortuneSpreadsheet, type FortuneSpreadsheetHandle } from "@/components/fortune-spreadsheet";
import { Loader } from "@/components/common/loader";
import { normalizeCollectionPreview, type CanonicalCollectionPreview } from "@/utils/collection-preview-canonical";
import { applyPreviewEdits, readPreviewEdits, type PreviewRecordEdit } from "@/utils/collection-preview-edits";
import { createCollectionPreviewWorkbook } from "@/utils/collection-preview-workbook";
import { useMemo, useRef, type Ref } from "react";
import { useTranslation } from "react-i18next";

export function CollectionExtractedDataPreview({ preview, response, workbookRef, readOnly = false }: { preview: CanonicalCollectionPreview; response?: unknown; workbookRef?: Ref<FortuneSpreadsheetHandle>; readOnly?: boolean }) {
  const { t, i18n } = useTranslation("ingestion");
  const edits = useRef<PreviewRecordEdit[]>([]);
  // A local working copy only: never mutate the query cache or imply a server save.
  const responseDraft = useRef(response);
  const locale = i18n.resolvedLanguage ?? i18n.language;
  const apiLocale = locale.includes("-") ? locale : `${locale}-IN`;
  const workbook = useMemo(() => {
    const theme = getComputedStyle(document.documentElement);
    const background = theme.getPropertyValue("--background").trim();
    const warning = theme.getPropertyValue("--warning").trim();
    const draft = response ? applyPreviewEdits(response, edits.current, apiLocale) : undefined;
    responseDraft.current = draft;
    const workbook = createCollectionPreviewWorkbook(draft ? normalizeCollectionPreview(draft, locale) : preview, {
      data: t("dataCollection.detail.preview.dataSheet"),
      missing: "-",
      notReturned: "-",
      unspecifiedGeography: t("directReview.unspecifiedGeography"),
    }, {
      background,
      foreground: theme.getPropertyValue("--foreground").trim(),
      header: theme.getPropertyValue("--muted").trim(),
      warning: `color-mix(in oklch, ${warning} 15%, ${background})`,
      font: getComputedStyle(document.body).fontFamily,
    });
    return { ...workbook, editsAtRender: [...edits.current] };
  }, [preview, response, apiLocale, locale, t]);

  return (
    <FortuneSpreadsheet
      key={readOnly ? "readonly-unfrozen-preview" : "editable-unfrozen-preview"}
      ref={workbookRef}
      readOnly={readOnly}
      initialData={workbook.sheets}
      onChange={readOnly || !response ? undefined : (snapshot) => {
        const changed = readPreviewEdits(snapshot, workbook.bindings);
        const next = new Map(workbook.editsAtRender.map((edit) => [JSON.stringify([edit.observationKey, edit.field]), edit]));
        changed.forEach((edit) => next.set(JSON.stringify([edit.observationKey, edit.field]), edit));
        edits.current = [...next.values()];
        responseDraft.current = applyPreviewEdits(response, edits.current, apiLocale);
      }}
      loadingFallback={<Loader className="h-full" text={t("dataCollection.detail.preview.loading")} />}
    />
  );
}
