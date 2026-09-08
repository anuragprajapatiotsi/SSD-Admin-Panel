import { apiDelete, apiGet, apiGetBlob, apiPostForm, apiPutForm } from "../api/http-client";
import type { TemplateRepositoryItem } from "../api/templates.api";

type DetailResponse<T> = { data: T };
type ListResponse<T> = { data: T[] };

export type UpdateTemplateRepositoryPayload = {
  templateId: string;
  templateName: string;
  unitCode: string;
  ministryIds: string[];
  description?: string | null;
  indicatorIds?: string[] | null;
  file?: File;
};

export type CreateTemplateRepositoryVersionPayload = {
  templateId: string;
  file: File;
  versionNotes?: string;
};

export type TemplateRepositoryFilters = {
  searchText?: string;
  ministryIds?: string[];
};

function fileNameFromDisposition(disposition: string | null) {
  if (!disposition) return "template.xlsx";
  const encoded = disposition.match(/filename\*=UTF-8''([^;]+)/i)?.[1];
  if (encoded) return decodeURIComponent(encoded.replace(/["']/g, ""));
  return disposition.match(/filename="?([^";]+)"?/i)?.[1] ?? "template.xlsx";
}

export async function getTemplateRepositoryItem(templateId: string): Promise<TemplateRepositoryItem> {
  const response = await apiGet<DetailResponse<TemplateRepositoryItem>>(
    `/templates/repository/${encodeURIComponent(templateId)}`,
  );
  return response.data.data;
}

export async function getTemplateRepositoryItems(
  filters: TemplateRepositoryFilters = {},
): Promise<TemplateRepositoryItem[]> {
  const searchParams = new URLSearchParams();
  const searchText = filters.searchText?.trim();

  if (searchText) searchParams.set("search_text", searchText);
  filters.ministryIds?.forEach((ministryId) => {
    if (ministryId) searchParams.append("ministry_ids", ministryId);
  });

  const queryString = searchParams.toString();
  const response = await apiGet<ListResponse<TemplateRepositoryItem>>(
    `/templates/repository${queryString ? `?${queryString}` : ""}`,
  );
  return response.data.data;
}

export async function deleteTemplateRepositoryItem(templateId: string): Promise<void> {
  await apiDelete<unknown>(`/templates/repository/${encodeURIComponent(templateId)}`);
}

export async function getTemplateRepositoryFile(templateId: string): Promise<File> {
  const { blob, headers } = await apiGetBlob(
    `/templates/repository/${encodeURIComponent(templateId)}/file`,
  );
  return new File(
    [blob],
    fileNameFromDisposition(headers.get("content-disposition")),
    { type: blob.type || "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
  );
}

export async function getTemplateRepositoryVersionFile(versionId: string): Promise<File> {
  const { blob, headers } = await apiGetBlob(
    `/templates/repository/versions/${encodeURIComponent(versionId)}/file`,
  );
  return new File(
    [blob],
    fileNameFromDisposition(headers.get("content-disposition")),
    { type: blob.type || "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" },
  );
}

export async function updateTemplateRepositoryItem(
  payload: UpdateTemplateRepositoryPayload,
): Promise<TemplateRepositoryItem> {
  const form = new FormData();
  form.set("template_name", payload.templateName);
  form.set("unit_code", payload.unitCode);
  payload.ministryIds.forEach((ministryId) => form.append("ministry_ids", ministryId));
  form.set("description", payload.description ?? "");
  if (payload.indicatorIds?.length) {
    payload.indicatorIds.forEach((indicatorId) => form.append("indicator_ids", indicatorId));
  } else {
    form.set("indicator_ids", "");
  }
  if (payload.file) form.set("file", payload.file);

  const response = await apiPutForm<DetailResponse<TemplateRepositoryItem>>(
    `/templates/repository/${encodeURIComponent(payload.templateId)}`,
    form,
  );
  return response.data.data;
}

export async function createTemplateRepositoryVersion({
  templateId,
  file,
  versionNotes,
}: CreateTemplateRepositoryVersionPayload): Promise<TemplateRepositoryItem["latest_version"]> {
  const form = new FormData();
  form.set("file", file);
  if (versionNotes?.trim()) form.set("version_notes", versionNotes.trim());

  const response = await apiPostForm<DetailResponse<{ version: NonNullable<TemplateRepositoryItem["latest_version"]> }>>(
    `/templates/repository/${encodeURIComponent(templateId)}/versions`,
    form,
  );
  return response.data.data.version;
}
