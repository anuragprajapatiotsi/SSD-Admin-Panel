import { apiDelete, apiGet, apiPost } from "./http-client";
import { getSelectedLocale, getSelectedUnitCode } from "./session.api";

export type ListResponse<T> = {
  data: T[];
  locale?: string;
  count?: number;
};

export type DetailResponse<T> = {
  data: T;
  locale?: string;
};

export type DataFieldListItem = {
  measure_code?: string;
  data_field_code?: string;
  data_field_name?: string;
  measure_name?: string;
  name?: string;
  display_name?: string;
  localized_name?: string;
  name_hi?: string | null;
  label?: string;
  description?: string | null;
  national_indicator_code?: string;
  indicator_code?: string;
  indicator_number?: string;
  indicator_name?: string;
  version_code?: string;
  value_type?: string | null;
  aggregation_type?: string | null;
  sort_order?: number | string | null;
  is_required?: boolean | null;
  source_organization_code?: string | null;
  source_organization_name?: string | null;
  ministry_name?: string | null;
  department_organization_code?: string | null;
  department_organization_name?: string | null;
  uom_code?: string | null;
  unit_code?: string | null;
  uom_name?: string | null;
  unit_name?: string | null;
  periodicity_code?: string | null;
  periodicity_name?: string | null;
  default_grain?: string | null;
  grain_label?: string | null;
  grain_summary?: string | null;
  grain_labels?: string[] | null;
  grains?: DataFieldMapping[] | null;
  source_organizations?: DataFieldMapping[] | null;
  periodicities?: DataFieldMapping[] | null;
  availability?: string | null;
  status?: string | null;
  used_in_count?: number | string | null;
  usage_count?: number | string | null;
  used_in_templates?: number | string | null;
  published_indicator_count?: number | string | null;
  mapped_indicator_count?: number | string | null;
  indicator_usage_count?: number | string | null;
  last_approved?: string | null;
  last_approved_period?: string | null;
  reference_period?: string | null;
  updated_at?: string | null;
  last_updated?: string | null;
  is_active?: boolean;
};

export type DataFieldMapping = Record<string, unknown> & {
  mapping_code?: string;
  measure_code?: string;
  source_organization_code?: string;
  source_organization_name?: string;
  organization_code?: string;
  organization_name?: string;
  assignment_role?: string;
  periodicity_code?: string;
  periodicity_name?: string;
  mapping_role?: string;
  grain_type?: string;
  grain_role?: string;
  dimension_code?: string;
  dimension_name?: string;
  member_code?: string;
  member_name?: string;
  member_set_code?: string;
  member_set_name?: string;
  geography_code?: string;
  geography_name?: string;
  time_period_code?: string;
  time_period_name?: string;
  is_default?: boolean;
  is_required?: boolean;
  is_active?: boolean;
};

export type DataFieldDetail = DataFieldListItem & {
  overview?: DataFieldListItem;
  source_mappings?: DataFieldMapping[];
  periodicity_mappings?: DataFieldMapping[];
  grain_mappings?: DataFieldMapping[];
  source_officers?: DataFieldMapping[];
  source_officer_mappings?: DataFieldMapping[];
  template_grain_usage?: DataFieldMapping[];
  used_in?: DataFieldMapping[];
  history?: DataFieldMapping[];
};

export type DataFieldSourceMappingPayload = {
  source_organization_code: string;
  assignment_role: string;
  indicator_code?: string;
  version_code?: string;
  unit_code?: string;
  mapping_code?: string;
  valid_from?: string;
  valid_to?: string;
  sort_order?: number;
  is_active?: boolean;
};

export type DataFieldPeriodicityMappingPayload = {
  periodicity_code: string;
  mapping_role: string;
  indicator_code?: string;
  version_code?: string;
  unit_code?: string;
  mapping_code?: string;
  is_default?: boolean;
  valid_from?: string;
  valid_to?: string;
  sort_order?: number;
  is_active?: boolean;
};

export type DataFieldGrainMappingPayload = {
  grain_type: string;
  indicator_code?: string;
  version_code?: string;
  unit_code?: string;
  mapping_code?: string;
  dimension_code?: string;
  member_code?: string;
  member_set_code?: string;
  geography_code?: string;
  time_period_code?: string;
  grain_role: string;
  is_required?: boolean;
  sort_order?: number;
  is_active?: boolean;
};

export type DataFieldPayload = {
  measure_code?: string;
  name: string;
  name_hi?: string;
  value_type: string;
  unit_code?: string;
  aggregation_type?: string;
  sort_order?: number;
  is_required?: boolean;
  is_active?: boolean;
  description?: string;
};

function dataFieldQuery(params: Record<string, string | number | undefined | null> = {}) {
  const query = new URLSearchParams({
    locale: String(params.locale ?? getSelectedLocale()),
    unit_code: getSelectedUnitCode(),
  });

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      query.set(key, String(value));
    }
  });

  return query;
}

export async function listDataFields(
  params: {
    limit?: number;
    offset?: number;
    locale?: string;
    unitCode?: string;
    search?: string;
    sourceCode?: string;
    periodicityCode?: string;
    uomCode?: string;
    statusFilter?: string;
  } = {},
) {
  const query = dataFieldQuery({
    limit: params.limit ?? 500,
    offset: params.offset ?? 0,
    locale: params.locale,
    unit_code: params.unitCode,
    search: params.search,
    source_code: params.sourceCode,
    periodicity_code: params.periodicityCode,
    uom_code: params.uomCode,
    status_filter: params.statusFilter,
  });
  const result = await apiGet<ListResponse<DataFieldListItem>>(`/masters/data-fields?${query}`);
  return result.data;
}

export async function getDataFieldDetail(
  measureCode: string,
  params: { indicatorCode?: string; versionCode?: string } = {},
) {
  const query = dataFieldQuery({
    indicator_code: params.indicatorCode,
    version_code: params.versionCode,
  });
  const result = await apiGet<DetailResponse<DataFieldDetail>>(
    `/masters/data-fields/${encodeURIComponent(measureCode)}?${query}`,
  );
  return result.data.data;
}

export async function createDataField(payload: DataFieldPayload, params: { locale?: string; unitCode?: string } = {}) {
  const query = dataFieldQuery({ locale: params.locale, unit_code: params.unitCode });
  const result = await apiPost<DetailResponse<DataFieldDetail>, DataFieldPayload>(
    `/masters/data-fields?${query}`,
    payload,
  );
  return result.data.data;
}

export async function mapDataFieldSource(measureCode: string, payload: DataFieldSourceMappingPayload) {
  const query = dataFieldQuery();
  const result = await apiPost<DetailResponse<DataFieldMapping>, DataFieldSourceMappingPayload>(
    `/masters/data-fields/${encodeURIComponent(measureCode)}/source-mappings?${query}`,
    payload,
  );
  return result.data.data;
}

export async function mapDataFieldPeriodicity(measureCode: string, payload: DataFieldPeriodicityMappingPayload) {
  const query = dataFieldQuery();
  const result = await apiPost<DetailResponse<DataFieldMapping>, DataFieldPeriodicityMappingPayload>(
    `/masters/data-fields/${encodeURIComponent(measureCode)}/periodicity-mappings?${query}`,
    payload,
  );
  return result.data.data;
}

export async function mapDataFieldGrain(measureCode: string, payload: DataFieldGrainMappingPayload) {
  const query = dataFieldQuery();
  const result = await apiPost<DetailResponse<DataFieldMapping>, DataFieldGrainMappingPayload>(
    `/masters/data-fields/${encodeURIComponent(measureCode)}/grain-mappings?${query}`,
    payload,
  );
  return result.data.data;
}

export async function unmapDataFieldMapping(mappingType: "SOURCE" | "PERIODICITY" | "GRAIN", mappingCode: string) {
  const query = dataFieldQuery();
  const result = await apiDelete<DetailResponse<DataFieldMapping>>(
    `/masters/data-fields/mappings/${mappingType}/${encodeURIComponent(mappingCode)}?${query}`,
  );
  return result.data.data;
}

export async function restoreDataFieldMapping(mappingType: "SOURCE" | "PERIODICITY" | "GRAIN", mappingCode: string) {
  const query = dataFieldQuery();
  const result = await apiPost<DetailResponse<DataFieldMapping>, Record<string, never>>(
    `/masters/data-fields/mappings/${mappingType}/${encodeURIComponent(mappingCode)}/restore?${query}`,
    {},
  );
  return result.data.data;
}
