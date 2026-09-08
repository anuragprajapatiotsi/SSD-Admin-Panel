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

export type IndicatorListItem = {
  national_indicator_code: string;
  indicator_number?: string;
  owning_unit_code?: string;
  current_version_code?: string;
  name?: string;
  description?: string;
  framework_code?: string;
  edition_code?: string;
  global_indicator_code?: string;
  global_indicator_number?: string;
  global_indicator_name?: string;
  source_organization_code?: string;
  source_organization_name?: string;
  department_organization_code?: string;
  department_organization_name?: string;
  unit_of_measure_code?: string;
  unit_of_measure_name?: string;
  uom_code?: string;
  uom_name?: string;
  periodicity_code?: string;
  periodicity_name?: string;
  ingestion_method?: string;
  ingestion_source_type?: string;
  latest_ingestion_method?: string;
  latest_submission_method?: string;
  last_submission_method?: string;
  last_submitted_by?: string;
  last_submitted_at?: string;
  ingestion_api_url?: string;
  ingestion_api_method?: string;
  ingestion_credentials_hash?: string;
  ingestion_json_structure?: Record<string, unknown> | string | null;
  updated_at?: string;
  last_updated?: string;
  status?: string;
  color_value?: string;
  color_method?: string;
  is_active?: boolean;
};

export type IndicatorListOptions = {
  limit?: number;
  offset?: number;
  search?: string;
  statusFilter?: string;
  sourceOrganizationCode?: string;
  periodicityCode?: string;
  uomCode?: string;
  frameworkNodeCode?: string;
};

export type IndicatorVersion = {
  version_code?: string;
  version_number?: number;
  version_label?: string;
  is_current?: boolean;
  status?: string;
  data_type?: string;
  decimal_places?: number;
  unit_of_measure_code?: string;
  name?: string;
  description?: string;
};

export type IndicatorMeasure = {
  version_code?: string;
  measure_code?: string;
  name?: string;
  value_type?: string;
  unit_code?: string;
  aggregation_type?: string;
  sort_order?: number;
  is_required?: boolean;
  is_active?: boolean;
};

export type IndicatorMetadataDetail = {
  version_code?: string;
  data_reference_period?: string;
  latest_data_availability?: string;
  data_dissemination_url?: string;
  source_reference_code?: string;
  source_document_name?: string;
  metadata_source_url?: string;
  computation_description?: string;
  data_source_description?: string;
  data_dissemination_label?: string;
  notes?: string;
  is_active?: boolean;
};

export type IndicatorSourceAssignment = {
  national_indicator_code?: string;
  source_organization_code?: string;
  source_organization_name?: string;
  department_organization_code?: string;
  department_organization_name?: string;
  parent_organization_code?: string;
  parent_organization_name?: string;
  ministry_organization_code?: string;
  ministry_name?: string;
  officer_code?: string;
  officer_display_name?: string;
  periodicity_code?: string;
  periodicity_name?: string;
  assignment_role?: string;
  is_active?: boolean;
};

export type IndicatorSourceOfficerAssignment = {
  national_indicator_code?: string;
  source_organization_code?: string;
  source_organization_name?: string;
  department_organization_code?: string;
  department_organization_name?: string;
  parent_organization_code?: string;
  parent_organization_name?: string;
  ministry_organization_code?: string;
  ministry_name?: string;
  assignment_role?: string;
  periodicity_code?: string;
  periodicity_name?: string;
  officer_code?: string;
  officer_display_name?: string;
  display_name?: string;
  email_address?: string;
  recipient_type?: string;
  contact_role?: string;
  is_primary?: boolean;
  sort_order?: number;
  is_active?: boolean;
};

export type SourceAssignmentPayload = {
  framework_code: string;
  edition_code: string;
  national_indicator_code: string;
  source_organization_code: string;
  assignment_role?: string;
  officer_code?: string;
  periodicity_code?: string;
  valid_from?: string;
  valid_to?: string;
  is_active?: boolean;
};

export type SourceOfficerAssignmentPayload = {
  national_indicator_code: string;
  source_organization_code: string;
  assignment_role?: string;
  officer_code: string;
  recipient_type?: string;
  contact_role?: string;
  is_primary?: boolean;
  sort_order?: number;
  valid_from?: string;
  valid_to?: string;
  is_active?: boolean;
};

export type GlobalIndicatorMapping = {
  global_indicator_code?: string;
  global_indicator_number?: string;
  global_indicator_name?: string;
  mapping_type?: string;
  mapping_note?: string;
  status?: string;
  tier_code?: string;
  is_active?: boolean;
};

export type PublishedTemplateUsage = {
  template_code?: string;
  template_name?: string;
  template_status?: string;
  owning_unit_code?: string;
  version_code?: string;
  version_number?: number;
  version_title?: string;
  version_status?: string;
  national_indicator_code?: string;
  indicator_number?: string;
  template_measure_code?: string;
  source_measure_code?: string;
  measure_code?: string;
  measure_name?: string;
  value_type?: string;
  unit_code?: string;
  uom_code?: string;
  uom_name?: string;
  aggregation_type?: string;
  is_editable?: boolean;
  is_required?: boolean;
  access_role?: string;
  provider_mode?: string;
  can_enter_data?: boolean;
  can_view_data?: boolean;
  can_view_other_measure_data?: boolean;
  can_view_after_submission?: boolean;
  is_primary_provider?: boolean;
  policy_required?: boolean;
  policy_metadata?: Record<string, unknown>;
  source_organization_code?: string;
  source_organization_name?: string;
  source_organization_type?: string;
  parent_organization_code?: string;
  parent_organization_name?: string;
  ministry_organization_code?: string;
  ministry_name?: string;
  department_organization_code?: string;
  department_organization_name?: string;
  periodicity_code?: string;
  periodicity_name?: string;
  ingestion_method?: string;
  ingestion_source_type?: string;
  latest_ingestion_method?: string;
  latest_submission_method?: string;
  last_submission_method?: string;
  last_submitted_by?: string;
  last_submitted_at?: string;
  ingestion_api_url?: string;
  ingestion_api_method?: string;
  ingestion_credentials_hash?: string;
  ingestion_json_structure?: Record<string, unknown> | string | null;
  cell_count?: number;
  officers?: IndicatorSourceOfficerAssignment[];
  updated_at?: string;
};

export type GlobalIndicatorListItem = {
  framework_code?: string;
  edition_code?: string;
  global_indicator_code: string;
  indicator_number?: string;
  name?: string;
  description?: string;
  methodology_note?: string;
  custodian_agency_code?: string;
  tier_code?: string;
  status?: string;
  is_active?: boolean;
  updated_at?: string;
  last_updated?: string;
  mapped_national_count?: number;
};

export type GlobalIndicatorPayload = {
  framework_code: string;
  edition_code: string;
  global_indicator_code?: string;
  indicator_number?: string;
  name: string;
  description?: string;
  methodology_note?: string;
  custodian_agency_code?: string;
  tier_code?: string;
  status: string;
  is_active: boolean;
};

export type GlobalIndicatorMappingPayload = {
  framework_code: string;
  edition_code: string;
  national_indicator_code: string;
  global_indicator_code: string;
  mapping_type?: string;
  mapping_note?: string;
  is_active?: boolean;
};

export type FrameworkMappedNode = {
  node_code?: string;
  node_number?: string;
  name?: string;
  short_name?: string;
  level_code?: string;
  level_number?: number;
  level_name?: string;
  color_value?: string;
  color_method?: string;
  relationship_type?: string;
};

export type FrameworkIndicatorMapping = {
  framework_code?: string;
  edition_code?: string;
  mapping_type?: string;
  is_active?: boolean;
  mapped_node?: FrameworkMappedNode;
  parents?: FrameworkMappedNode[];
};

export type FrameworkIndicatorMappingPayload = {
  framework_code: string;
  edition_code: string;
  node_code: string;
  national_indicator_code: string;
  mapping_type?: string;
  is_active?: boolean;
};

export type IndicatorDetail = {
  overview?: IndicatorListItem;
  versions?: IndicatorVersion[];
  measures?: IndicatorMeasure[];
  metadata?: IndicatorMetadataDetail[];
  global_indicator_mappings?: GlobalIndicatorMapping[];
  framework_mappings?: FrameworkIndicatorMapping[];
  sources?: IndicatorSourceAssignment[];
  source_assignments?: IndicatorSourceAssignment[];
  source_officers?: IndicatorSourceOfficerAssignment[];
  published_template_usage?: PublishedTemplateUsage[];
} & IndicatorListItem;

export type NationalIndicatorPayload = {
  framework_code: string;
  edition_code: string;
  national_indicator_code?: string;
  indicator_number?: string;
  owning_unit_code?: string;
  name: string;
  description?: string;
  status: string;
  is_active: boolean;
  color_value?: string;
  color_method?: string;
};

export type IndicatorMeasurePayload = {
  measure_code?: string;
  name: string;
  value_type?: string;
  unit_code?: string;
  aggregation_type?: string;
  sort_order?: number;
  is_required?: boolean;
  is_active?: boolean;
  description?: string;
};

function indicatorQuery(params: Record<string, string | number | boolean | undefined> = {}) {
  const query = new URLSearchParams({
    locale: getSelectedLocale(),
    unit_code: getSelectedUnitCode(),
  });

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      query.set(key, String(value));
    }
  });

  return query;
}

export async function listIndicators(options: IndicatorListOptions = {}) {
  const query = indicatorQuery({
    limit: options.limit ?? 25,
    offset: options.offset ?? 0,
    search: options.search,
    status_filter: options.statusFilter,
    source_organization_code: options.sourceOrganizationCode,
    periodicity_code: options.periodicityCode,
    uom_code: options.uomCode,
    framework_node_code: options.frameworkNodeCode,
  });
  const result = await apiGet<MetadataListResponse<IndicatorListItem>>(`/masters/indicators?${query}`);
  return result.data;
}

export async function getIndicator(indicatorCode: string) {
  const query = indicatorQuery();
  const result = await apiGet<MetadataDetailResponse<IndicatorDetail>>(
    `/masters/indicators/${encodeURIComponent(indicatorCode)}?${query}`,
  );
  return result.data;
}

export async function createIndicator(payload: NationalIndicatorPayload) {
  const query = indicatorQuery();
  const result = await apiPost<MetadataDetailResponse<IndicatorDetail>, NationalIndicatorPayload>(
    `/masters/indicators?${query}`,
    payload,
  );
  return result.data;
}

export async function updateIndicator(indicatorCode: string, payload: NationalIndicatorPayload) {
  const query = indicatorQuery();
  const result = await apiPatch<MetadataDetailResponse<IndicatorDetail>, NationalIndicatorPayload>(
    `/masters/indicators/${encodeURIComponent(indicatorCode)}?${query}`,
    payload,
  );
  return result.data;
}

export async function deleteIndicator(indicatorCode: string) {
  const query = indicatorQuery();
  const result = await apiDelete<MetadataDetailResponse<IndicatorDetail>>(
    `/masters/indicators/${encodeURIComponent(indicatorCode)}?${query}`,
  );
  return result.data;
}

export async function listGlobalIndicators(limit = 500, offset = 0) {
  const query = indicatorQuery({ limit, offset });
  const result = await apiGet<MetadataListResponse<GlobalIndicatorListItem>>(`/masters/global-indicators?${query}`);
  return result.data;
}

export async function createGlobalIndicator(payload: GlobalIndicatorPayload) {
  const query = indicatorQuery();
  const result = await apiPost<MetadataDetailResponse<GlobalIndicatorListItem>, GlobalIndicatorPayload>(
    `/masters/global-indicators?${query}`,
    payload,
  );
  return result.data;
}

export async function updateGlobalIndicator(indicatorCode: string, payload: GlobalIndicatorPayload) {
  const query = indicatorQuery();
  const result = await apiPatch<MetadataDetailResponse<GlobalIndicatorListItem>, GlobalIndicatorPayload>(
    `/masters/global-indicators/${encodeURIComponent(indicatorCode)}?${query}`,
    payload,
  );
  return result.data;
}

export async function saveFrameworkIndicatorMapping(payload: FrameworkIndicatorMappingPayload) {
  const query = indicatorQuery();
  const result = await apiPost<MetadataDetailResponse<Record<string, unknown>>, FrameworkIndicatorMappingPayload>(
    `/masters/framework-indicator-mappings?${query}`,
    payload,
  );
  return result.data;
}

export async function saveGlobalIndicatorMapping(payload: GlobalIndicatorMappingPayload) {
  const query = indicatorQuery();
  const result = await apiPost<MetadataDetailResponse<Record<string, unknown>>, GlobalIndicatorMappingPayload>(
    `/masters/national-global-indicator-mappings?${query}`,
    payload,
  );
  return result.data;
}

export async function saveSourceAssignment(payload: SourceAssignmentPayload) {
  const query = indicatorQuery();
  const result = await apiPost<MetadataDetailResponse<Record<string, unknown>>, SourceAssignmentPayload>(
    `/masters/source-assignments?${query}`,
    payload,
  );
  return result.data;
}

export async function saveSourceOfficerAssignment(payload: SourceOfficerAssignmentPayload) {
  const query = indicatorQuery();
  const result = await apiPost<MetadataDetailResponse<Record<string, unknown>>, SourceOfficerAssignmentPayload>(
    `/masters/source-assignment-officers?${query}`,
    payload,
  );
  return result.data;
}

export async function createIndicatorMeasure(versionCode: string, payload: IndicatorMeasurePayload) {
  const query = indicatorQuery();
  const result = await apiPost<MetadataDetailResponse<Record<string, unknown>>, IndicatorMeasurePayload>(
    `/masters/indicator-versions/${encodeURIComponent(versionCode)}/measures?${query}`,
    payload,
  );
  return result.data;
}

export async function updateIndicatorMeasure(versionCode: string, measureCode: string, payload: IndicatorMeasurePayload) {
  const query = indicatorQuery();
  const result = await apiPatch<MetadataDetailResponse<Record<string, unknown>>, IndicatorMeasurePayload>(
    `/masters/indicator-versions/${encodeURIComponent(versionCode)}/measures/${encodeURIComponent(measureCode)}?${query}`,
    payload,
  );
  return result.data;
}
