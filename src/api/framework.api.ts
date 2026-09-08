import { apiDelete, apiGet, apiPatch, apiPost } from "./http-client";
import { getSelectedLocale, getSelectedUnitCode } from "./session.api";

export type MetadataListResponse<T> = {
  data: T[];
  locale: string;
  count: number;
};

export type MetadataDetailResponse<T> = {
  data: T;
  locale: string;
};

export type FrameworkEdition = {
  unit_code?: string;
  framework_code: string;
  edition_code: string;
  name?: string;
  description?: string;
  version_label?: string;
  status?: string;
  is_active?: boolean;
  effective_from?: string | null;
  effective_to?: string | null;
};

export type FrameworkLevel = {
  level_code: string;
  level_number: number;
  name?: string;
  description?: string;
  allows_indicator_mapping?: boolean;
  is_active?: boolean;
};

export type FrameworkNode = {
  node_code: string;
  level_code: string;
  node_number?: string;
  name?: string;
  short_name?: string;
  description?: string;
  color_value?: string;
  color_method?: string;
  icon_path?: string | null;
  sort_order?: number;
  status?: string;
  indicator_count?: number;
  is_active?: boolean;
};

export type FrameworkRelationship = {
  parent_node_code: string;
  child_node_code: string;
  relationship_type?: string;
  sort_order?: number;
  is_active?: boolean;
};

export type FrameworkHierarchy = {
  framework_code: string;
  edition_code?: string;
  name?: string;
  levels: FrameworkLevel[];
  nodes: FrameworkNode[];
  relationships: FrameworkRelationship[];
};

export type FrameworkIndicatorMappingSummary = {
  framework_code?: string;
  edition_code?: string;
  node_code?: string;
  node_number?: string;
  node_name?: string;
  level_code?: string;
  level_number?: number;
  level_name?: string;
  mapping_type?: string;
  national_indicator_code: string;
  indicator_number?: string;
  indicator_name?: string;
  indicator_description?: string;
  indicator_color_value?: string;
  indicator_color_method?: string;
  status?: string;
  is_active?: boolean;
};

export type FrameworkEditionPayload = {
  unit_code?: string;
  framework_code?: string;
  edition_code?: string;
  name: string;
  description?: string;
  version_label?: string;
  effective_from?: string;
  effective_to?: string;
  status: string;
  is_active: boolean;
};

export type FrameworkLevelPayload = {
  level_code?: string;
  level_number: number;
  name: string;
  description?: string;
  allows_indicator_mapping: boolean;
  is_active: boolean;
};

export type FrameworkNodePayload = {
  level_code: string;
  node_code?: string;
  name: string;
  node_number?: string;
  short_name?: string;
  description?: string;
  color_value?: string;
  color_method?: string;
  icon_path?: string;
  sort_order: number;
  status: string;
  is_active: boolean;
};

export type FrameworkRelationshipPayload = {
  parent_node_code: string;
  child_node_code: string;
  relationship_type: string;
  sort_order: number;
  is_active: boolean;
};

function getEffectiveUnitCode(): string {
  return getSelectedUnitCode();
}

function getEffectiveLocale(): string {
  return getSelectedLocale();
}

function frameworkQuery(params: Record<string, string | boolean | number | undefined> = {}) {
  const query = new URLSearchParams({
    unit_code: getEffectiveUnitCode(),
    locale: getEffectiveLocale(),
  });

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined) {
      query.set(key, String(value));
    }
  });

  return query;
}

export async function listFrameworkEditions(includeInactive = true) {
  const query = frameworkQuery({ include_inactive: includeInactive });
  const result = await apiGet<MetadataListResponse<FrameworkEdition>>(`/masters/framework-editions?${query}`);
  return result.data;
}

export async function getFrameworkHierarchy(frameworkCode: string, editionCode?: string) {
  const query = frameworkQuery({ edition_code: editionCode });
  const result = await apiGet<MetadataDetailResponse<FrameworkHierarchy>>(
    `/masters/frameworks/${encodeURIComponent(frameworkCode)}/hierarchy?${query}`,
  );
  return result.data;
}

export async function listFrameworkIndicatorMappingsByNode(nodeCode: string) {
  const query = frameworkQuery({ node_code: nodeCode });
  const result = await apiGet<MetadataListResponse<FrameworkIndicatorMappingSummary>>(
    `/masters/framework-indicator-mappings?${query}`,
  );
  return result.data;
}

export async function createFrameworkEdition(payload: FrameworkEditionPayload) {
  const result = await apiPost<MetadataDetailResponse<FrameworkEdition>, FrameworkEditionPayload>(
    `/masters/framework-editions?locale=${getEffectiveLocale()}`,
    { ...payload, unit_code: payload.unit_code ?? getEffectiveUnitCode() },
  );
  return result.data;
}

export async function updateFrameworkEdition(
  frameworkCode: string,
  editionCode: string,
  payload: FrameworkEditionPayload,
) {
  const result = await apiPatch<MetadataDetailResponse<FrameworkEdition>, FrameworkEditionPayload>(
    `/masters/framework-editions/${encodeURIComponent(frameworkCode)}/${encodeURIComponent(editionCode)}?locale=${getEffectiveLocale()}`,
    { ...payload, unit_code: payload.unit_code ?? getEffectiveUnitCode() },
  );
  return result.data;
}

export async function deactivateFrameworkEdition(frameworkCode: string, editionCode: string) {
  const query = frameworkQuery();
  const result = await apiDelete<MetadataDetailResponse<FrameworkEdition>>(
    `/masters/framework-editions/${encodeURIComponent(frameworkCode)}/${encodeURIComponent(editionCode)}?${query}`,
  );
  return result.data;
}

export async function restoreFrameworkEdition(frameworkCode: string, editionCode: string) {
  const query = frameworkQuery();
  const result = await apiPost<MetadataDetailResponse<FrameworkEdition>, Record<string, never>>(
    `/masters/framework-editions/${encodeURIComponent(frameworkCode)}/${encodeURIComponent(editionCode)}/restore?${query}`,
    {},
  );
  return result.data;
}

export async function createFrameworkLevel(
  frameworkCode: string,
  editionCode: string,
  payload: FrameworkLevelPayload,
) {
  const query = frameworkQuery();
  const result = await apiPost<MetadataDetailResponse<FrameworkLevel>, FrameworkLevelPayload>(
    `/masters/framework-editions/${encodeURIComponent(frameworkCode)}/${encodeURIComponent(editionCode)}/levels?${query}`,
    payload,
  );
  return result.data;
}

export async function updateFrameworkLevel(
  frameworkCode: string,
  editionCode: string,
  levelCode: string,
  payload: FrameworkLevelPayload,
) {
  const query = frameworkQuery();
  const result = await apiPatch<MetadataDetailResponse<FrameworkLevel>, FrameworkLevelPayload>(
    `/masters/framework-editions/${encodeURIComponent(frameworkCode)}/${encodeURIComponent(editionCode)}/levels/${encodeURIComponent(levelCode)}?${query}`,
    payload,
  );
  return result.data;
}

export async function createFrameworkNode(
  frameworkCode: string,
  editionCode: string,
  payload: FrameworkNodePayload,
) {
  const query = frameworkQuery();
  const result = await apiPost<MetadataDetailResponse<FrameworkNode>, FrameworkNodePayload>(
    `/masters/framework-editions/${encodeURIComponent(frameworkCode)}/${encodeURIComponent(editionCode)}/nodes?${query}`,
    payload,
  );
  return result.data;
}

export async function updateFrameworkNode(
  frameworkCode: string,
  editionCode: string,
  nodeCode: string,
  payload: FrameworkNodePayload,
) {
  const query = frameworkQuery();
  const result = await apiPatch<MetadataDetailResponse<FrameworkNode>, FrameworkNodePayload>(
    `/masters/framework-editions/${encodeURIComponent(frameworkCode)}/${encodeURIComponent(editionCode)}/nodes/${encodeURIComponent(nodeCode)}?${query}`,
    payload,
  );
  return result.data;
}

export async function createFrameworkRelationship(
  frameworkCode: string,
  editionCode: string,
  payload: FrameworkRelationshipPayload,
) {
  const query = frameworkQuery();
  const result = await apiPost<MetadataDetailResponse<FrameworkRelationship>, FrameworkRelationshipPayload>(
    `/masters/framework-editions/${encodeURIComponent(frameworkCode)}/${encodeURIComponent(editionCode)}/relationships?${query}`,
    payload,
  );
  return result.data;
}
