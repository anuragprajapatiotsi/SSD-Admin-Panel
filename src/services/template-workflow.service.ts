import {
  templateWorkflowApi,
  type CreateRequestPeriodCollectionPayload,
  type CreateTemplateDispatchPayload,
  type UpdateRequestPeriodCollectionPayload,
} from "../api/template-workflow.api";

const WORKBOOK_MIME = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";

function fileNameFromDisposition(disposition: string | null, fallback: string): string {
  if (!disposition) return fallback;
  const encoded = disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  if (encoded) return decodeURIComponent(encoded.replace(/["']/g, ""));
  return disposition.match(/filename="?([^";]+)"?/i)?.[1] ?? fallback;
}

async function downloadAsFile(
  request: Promise<{ blob: Blob; headers: Headers }>,
  fallbackName: string,
): Promise<File> {
  const { blob, headers } = await request;
  return new File([blob], fileNameFromDisposition(headers.get("content-disposition"), fallbackName), {
    type: blob.type || WORKBOOK_MIME,
  });
}

function normalizeDispatchPayload(payload: CreateTemplateDispatchPayload): CreateTemplateDispatchPayload {
  const normalizedPayload = typeof payload.request_period_label === "string"
    ? { ...payload, request_period_label: payload.request_period_label.trim() }
    : payload;

  if (normalizedPayload.dispatch_mode === "PROVIDER") return normalizedPayload;

  // SELF dispatches must never leak provider recipients or notification content.
  const selfPayload = { ...normalizedPayload };
  delete selfPayload.notification;
  return { ...selfPayload, recipients: [] };
}

function normalizeCollectionPayload(
  payload: CreateRequestPeriodCollectionPayload,
): CreateRequestPeriodCollectionPayload {
  return {
    ...payload,
    request_period_label: payload.request_period_label.trim(),
  };
}

function normalizeCollectionUpdatePayload(
  payload: UpdateRequestPeriodCollectionPayload,
): UpdateRequestPeriodCollectionPayload {
  return {
    ...payload,
    request_period_label: payload.request_period_label.trim(),
    year_period: payload.year_period.trim(),
  };
}

export const templateWorkflowService = {
  templates: {
    ...templateWorkflowApi.templates,
    download(templateId: string) {
      return downloadAsFile(templateWorkflowApi.templates.download(templateId), "template.xlsx");
    },
    downloadVersion(versionId: string) {
      return downloadAsFile(templateWorkflowApi.templates.downloadVersion(versionId), "template-version.xlsx");
    },
  },
  dispatches: {
    ...templateWorkflowApi.dispatches,
    createCollection(payload: CreateRequestPeriodCollectionPayload, locale?: string) {
      return templateWorkflowApi.dispatches.createCollection(normalizeCollectionPayload(payload), locale);
    },
    updateCollection(
      collectionCode: string,
      unitCode: string,
      payload: UpdateRequestPeriodCollectionPayload,
    ) {
      return templateWorkflowApi.dispatches.updateCollection(
        collectionCode,
        unitCode,
        normalizeCollectionUpdatePayload(payload),
      );
    },
    create(payload: CreateTemplateDispatchPayload, locale?: string) {
      return templateWorkflowApi.dispatches.create(normalizeDispatchPayload(payload), locale);
    },
  },
  provider: {
    ...templateWorkflowApi.provider,
    downloadSourceTemplate(payload: Parameters<typeof templateWorkflowApi.provider.downloadSourceTemplate>[0]) {
      return downloadAsFile(
        templateWorkflowApi.provider.downloadSourceTemplate(payload),
        "source-template.xlsx",
      );
    },
  },
  review: templateWorkflowApi.review,
  journeys: templateWorkflowApi.journeys,
  workspaces: templateWorkflowApi.workspaces,
};

export type TemplateWorkflowService = typeof templateWorkflowService;
