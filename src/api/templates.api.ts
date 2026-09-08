import {
  apiDelete,
  apiGet,
  apiPatch,
  apiPost,
  apiPostForm,
  apiPut,
} from "./http-client";
import { getSelectedLocale, getSelectedUnitCode } from "./session.api";

type ListResponse<T> = {
  data: T[];
  locale?: string;
  count?: number;
};

type DetailResponse<T> = {
  data: T;
  locale?: string;
};

export type TemplateDefinition = {
  template_code?: string;
  name?: string;
  template_name?: string;
  description?: string | null;
  owning_unit_code?: string;
  template_type?: string;
  status?: string;
  template_status?: string;
  default_locale_code?: string;
  is_active?: boolean;
  created_at?: string | null;
  updated_at?: string | null;
  last_updated?: string | null;
  current_version_updated_at?: string | null;
  version_updated_at?: string | null;
  current_version_code?: string | null;
  current_version_status?: string | null;
  version_status?: string | null;
  current_version_number?: number | null;
  version_code?: string | null;
  version_number?: number | null;
};

export type TemplateVersion = {
  template_code?: string;
  version_code?: string;
  title?: string;
  subtitle?: string | null;
  instructions?: string | null;
  version_number?: number | null;
  render_contract_version?: string;
  status?: string;
  is_current?: boolean;
  effective_from?: string | null;
  effective_to?: string | null;
  publish_notes?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

export type TemplateAxis = {
  axis_code?: string;
  axis_role?: string;
  dimension_code?: string;
  label?: string;
  parent_axis_code?: string | null;
  member_strategy?: string;
  member_set_code?: string | null;
  axis_depth?: number;
  display_when_single_member?: boolean;
  is_required?: boolean;
  allow_multiple?: boolean;
  sort_order?: number;
  render_metadata?: Record<string, unknown>;
  is_active?: boolean;
  help_text?: string | null;
};

export type TemplateMeasure = {
  measure_code?: string;
  label?: string;
  source_measure_code?: string;
  indicator_version_code?: string;
  measure_unit_code?: string | null;
  value_type?: string | null;
  aggregation_type?: string | null;
  sort_order?: number;
  is_required?: boolean;
  is_editable?: boolean;
  is_active?: boolean;
};

export type UploadedTemplateFile = {
  unit: string;
  template_name: string;
  original_filename: string;
  stored_filename?: string;
  file_uri?: string;
  file_size_bytes: number;
};

export type UploadTemplateFilePayload = {
  unit: string;
  templateName: string;
  ministryIds: string[];
  file: File;
};

export type TemplateRepositoryVersion = {
  id: string;
  file_path: string | null;
  uploaded_at?: string;
  created_at?: string;
  updated_at?: string;
  template_id?: string;
  is_latest?: boolean;
  version_notes: string | null;
  version_number: number;
  original_file_name: string;
};

export type TemplateRepositoryItem = {
  id: string;
  status: string | null;
  unit_id: string;
  unit_code: string;
  created_at: string;
  updated_at: string;
  description: string | null;
  ministry_ids: string[];
  indicator_ids: string[] | null;
  template_name: string;
  to_email_addresses?: string[];
  cc_email_addresses?: string[];
  bcc_email_addresses?: string[];
  latest_version: TemplateRepositoryVersion | null;
};

export type MinistryContactDetail = {
  ministry_name: string | null;
  organization_id: string;
  to_email_addresses: string[];
  cc_email_addresses: string[];
  bcc_email_addresses: string[];
  attached_indicators: Array<{
    indicator_id: string;
    indicator_code?: string | null;
    indicator_name?: string | null;
  }>;
  source_assignment_details: Array<{
    is_active?: boolean;
    valid_from?: string | null;
    valid_to?: string | null;
  }>;
};

export type ListMinistryContactDetailsParams = {
  limit?: number;
  offset?: number;
  searchText?: string;
};

export type TemplateStudioDraft = {
  version_code?: string;
  studio_state?: Record<string, unknown>;
  updated_by?: string | null;
  updated_at?: string | null;
};

export type TemplateFormulaOutput = {
  formula_code?: string;
  formula_name?: string;
  formula_type?: string;
  expression_text?: string;
  output_uom_code?: string | null;
  function_code?: string | null;
  source_column_keys?: string[];
  render_metadata?: Record<string, unknown>;
  sort_order?: number;
  is_active?: boolean;
};

export type TemplateRenderContract = {
  template?: Record<string, unknown>;
  version?: Record<string, unknown>;
  axes?: TemplateAxis[];
  measures?: TemplateMeasure[];
  cells?: Record<string, unknown>[];
  render_elements?: Record<string, unknown>[];
  validation_rule_refs?: Record<string, unknown>[];
};

export type TemplateDefinitionPayload = {
  template_code: string;
  name: string;
  owning_unit_code: string;
  template_type: string;
  status: string;
  default_locale_code: string;
  is_active: boolean;
  description?: string | null;
};

export type TemplateVersionPayload = {
  template_code: string;
  version_code: string;
  title: string;
  unit_code: string;
  version_number?: number;
  render_contract_version: string;
  effective_from?: string;
  effective_to?: string;
  is_current: boolean;
  status: string;
  publish_notes?: string;
  subtitle?: string;
  instructions?: string;
};

export type TemplatePublishPayload = {
  unit_code: string;
  publish_notes?: string | null;
  effective_from?: string | null;
};

export type TemplateMeasureAccessPolicy = {
  policy_id?: string;
  template_version_code?: string;
  measure_code?: string;
  organization_code?: string;
  access_role?: string;
  provider_mode?: string;
  can_enter_data?: boolean;
  can_view_data?: boolean;
  can_view_other_measure_data?: boolean;
  can_view_after_submission?: boolean;
  is_primary_provider?: boolean;
  is_required?: boolean;
  policy_metadata?: Record<string, unknown>;
  is_active?: boolean;
};

export type TemplateIndicatorMapping = {
  mapping_id?: string;
  template_version_code?: string;
  template_code?: string;
  unit_code?: string;
  national_indicator_code?: string;
  indicator_code?: string;
  indicator_number?: string;
  indicator_name?: string;
  mapping_role?: string;
  mapping_metadata?: Record<string, unknown>;
  sort_order?: number;
  is_active?: boolean;
  updated_at?: string | null;
};

export type TemplateMeasureAccessPolicyPayload = {
  measure_code: string;
  organization_code: string;
  unit_code: string;
  access_role?: string;
  can_enter_data?: boolean;
  can_view_data?: boolean;
  can_view_other_measure_data?: boolean;
  can_view_after_submission?: boolean;
  is_primary_provider?: boolean;
  is_required?: boolean;
  policy_metadata?: Record<string, unknown>;
  is_active?: boolean;
};

export type TemplateIndicatorMappingPayload = {
  indicator_code: string;
  unit_code: string;
  mapping_role?: string;
  sort_order?: number;
  mapping_metadata?: Record<string, unknown>;
  is_active?: boolean;
};

export type TemplateVersionStatusPayload = {
  unit_code: string;
  status: string;
  is_current?: boolean;
};

export type TemplateVersionDeriveDraftPayload = {
  unit_code: string;
  reason?: string | null;
};

export type TemplateAxisPayload = {
  axis_code: string;
  axis_role: string;
  dimension_code: string;
  label: string;
  unit_code: string;
  parent_axis_code?: string;
  member_strategy: string;
  member_set_code?: string;
  axis_depth: number;
  display_when_single_member: boolean;
  is_required: boolean;
  allow_multiple: boolean;
  sort_order: number;
  render_metadata: Record<string, unknown>;
  is_active: boolean;
  help_text?: string;
};

export type TemplateMeasurePayload = {
  measure_code: string;
  indicator_version_code: string;
  source_measure_code: string;
  label: string;
  unit_code: string;
  value_type?: string | null;
  measure_unit_code?: string | null;
  aggregation_type?: string | null;
  decimal_places?: number | null;
  validation_rule_code?: string | null;
  sort_order: number;
  is_editable: boolean;
  is_required: boolean;
  render_metadata: Record<string, unknown>;
  is_active: boolean;
  help_text?: string | null;
};

export type TemplateStudioDraftPayload = {
  unit_code: string;
  studio_state: Record<string, unknown>;
  updated_by?: string | null;
};

export type TemplateFormulaOutputPayload = {
  formula_code: string;
  formula_name: string;
  formula_type: string;
  expression_text: string;
  unit_code: string;
  output_uom_code?: string | null;
  function_code?: string | null;
  source_column_keys?: string[];
  render_metadata?: Record<string, unknown>;
  sort_order?: number;
  is_active?: boolean;
};

export type TemplateImportTablePreview = {
  table_ref?: string;
  label?: string;
  sheet_name?: string;
  row_count?: number;
  column_count?: number;
  grid?: string[][];
  merged_ranges?: Array<{
    min_row: number;
    max_row: number;
    min_col: number;
    max_col: number;
    value?: string;
  }>;
  detected_shape?: Record<string, unknown>;
  layout_analysis?: Record<string, unknown>;
  pivot_suggestion?: Record<string, unknown> | null;
  json_preview?: unknown;
  cell_annotations?: Record<string, {
    type?: string;
    language?: string;
    action?: string;
    semantic?: string;
    dimension_candidate?: string;
    time_period_candidate?: string;
    label_en?: string;
    label_hi?: string;
  }>;
};

export type TemplateImportPreview = {
  source_type?: string;
  source_name?: string;
  tables?: TemplateImportTablePreview[];
  selected_table_ref?: string | null;
  requires_table_selection?: boolean;
  requires_sheet_selection?: boolean;
  message?: string;
  detected_source_type?: string;
  analysis?: {
    legend?: { type?: string; label?: string }[];
    totals?: Record<string, number>;
  };
};

export type TemplateImportJob = {
  import_job_code?: string;
  template_version_code?: string;
  unit_code?: string;
  source_type?: string;
  source_name?: string | null;
  source_config?: Record<string, unknown>;
  extraction_config?: Record<string, unknown>;
  selected_table_ref?: string | null;
  latest_preview?: TemplateImportPreview;
  latest_mapping?: Record<string, unknown>;
  status?: string;
  schedule_config?: Record<string, unknown>;
  last_run_at?: string | null;
  next_run_at?: string | null;
  error_message?: string | null;
  updated_at?: string | null;
};

export type TemplateImportFetchPayload = {
  source_type: "URL" | "API" | "PDF";
  unit_code: string;
  url?: string;
  page_mode?: string;
  page_number?: number | null;
  page_from?: number | null;
  page_to?: number | null;
  api?: {
    url: string;
    method: string;
    headers?: Record<string, string>;
    auth_type?: string;
    bearer_token?: string | null;
    basic_username?: string | null;
    basic_password?: string | null;
    body?: string | null;
    table_path?: string | null;
  };
  schedule?: Record<string, unknown>;
};

function query(params: Record<string, string | number | undefined | null>) {
  const search = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      search.set(key, String(value));
    }
  });
  const text = search.toString();
  return text ? `?${text}` : "";
}

function localeParams(extra: Record<string, string | number | undefined | null> = {}) {
  return query({ locale: getSelectedLocale(), unit_code: getSelectedUnitCode(), ...extra });
}

export async function listTemplates(filters: { status?: string; limit?: number; offset?: number; search?: string } = {}) {
  const result = await apiGet<ListResponse<TemplateDefinition>>(
    `/templates${localeParams({
      status: filters.status === "ALL" ? undefined : filters.status,
      search: filters.search,
      limit: filters.limit ?? 200,
      offset: filters.offset ?? 0,
    })}`,
  );
  return result.data;
}

export async function getTemplate(templateCode: string) {
  const result = await apiGet<DetailResponse<TemplateDefinition>>(
    `/templates/${encodeURIComponent(templateCode)}${localeParams()}`,
  );
  return result.data;
}

export async function createTemplate(payload: TemplateDefinitionPayload) {
  const result = await apiPost<DetailResponse<TemplateDefinition>, TemplateDefinitionPayload>(
    `/templates${query({ locale: getSelectedLocale() })}`,
    payload,
  );
  return result.data;
}

export async function updateTemplate(templateCode: string, payload: TemplateDefinitionPayload) {
  const result = await apiPatch<DetailResponse<TemplateDefinition>, TemplateDefinitionPayload>(
    `/templates/${encodeURIComponent(templateCode)}${query({ locale: getSelectedLocale() })}`,
    payload,
  );
  return result.data;
}

export async function deactivateTemplate(templateCode: string) {
  const result = await apiDelete<DetailResponse<TemplateDefinition>, { is_active: boolean; status: string; unit_code: string }>(
    `/templates/${encodeURIComponent(templateCode)}${query({ locale: getSelectedLocale() })}`,
    { is_active: false, status: "RETIRED", unit_code: getSelectedUnitCode() },
  );
  return result.data;
}

export async function listTemplateVersions(templateCode: string) {
  const result = await apiGet<ListResponse<TemplateVersion>>(
    `/templates/${encodeURIComponent(templateCode)}/versions${localeParams()}`,
  );
  return result.data;
}

export async function getTemplateVersion(versionCode: string) {
  const result = await apiGet<DetailResponse<TemplateVersion>>(
    `/templates/versions/${encodeURIComponent(versionCode)}${localeParams()}`,
  );
  return result.data;
}

export async function createTemplateVersion(templateCode: string, payload: TemplateVersionPayload) {
  const result = await apiPost<DetailResponse<TemplateVersion>, TemplateVersionPayload>(
    `/templates/${encodeURIComponent(templateCode)}/versions${query({ locale: getSelectedLocale() })}`,
    payload,
  );
  return result.data;
}

export async function updateTemplateVersion(templateCode: string, versionCode: string, payload: TemplateVersionPayload) {
  const result = await apiPatch<DetailResponse<TemplateVersion>, TemplateVersionPayload>(
    `/templates/${encodeURIComponent(templateCode)}/versions/${encodeURIComponent(versionCode)}${query({ locale: getSelectedLocale() })}`,
    payload,
  );
  return result.data;
}

export async function publishTemplateVersion(versionCode: string, payload: TemplatePublishPayload) {
  const result = await apiPost<DetailResponse<TemplateVersion>, TemplatePublishPayload>(
    `/templates/versions/${encodeURIComponent(versionCode)}/publish${query({ locale: getSelectedLocale() })}`,
    payload,
  );
  return result.data;
}

export async function deriveTemplateVersionDraft(versionCode: string, payload: TemplateVersionDeriveDraftPayload) {
  const result = await apiPost<DetailResponse<TemplateVersion>, TemplateVersionDeriveDraftPayload>(
    `/templates/versions/${encodeURIComponent(versionCode)}/derive-draft${query({ locale: getSelectedLocale() })}`,
    payload,
  );
  return result.data;
}

export async function listTemplateMeasureAccessPolicies(versionCode: string, includeInactive = false) {
  const result = await apiGet<ListResponse<TemplateMeasureAccessPolicy>>(
    `/templates/versions/${encodeURIComponent(versionCode)}/measure-access-policies${localeParams({
      include_inactive: includeInactive ? "true" : "false",
    })}`,
  );
  return result.data;
}

export async function upsertTemplateMeasureAccessPolicy(versionCode: string, payload: TemplateMeasureAccessPolicyPayload) {
  const result = await apiPost<DetailResponse<TemplateMeasureAccessPolicy>, TemplateMeasureAccessPolicyPayload>(
    `/templates/versions/${encodeURIComponent(versionCode)}/measure-access-policies${query({ locale: getSelectedLocale() })}`,
    payload,
  );
  return result.data;
}

export async function listTemplateIndicatorMappings(versionCode: string, includeInactive = false) {
  const result = await apiGet<ListResponse<TemplateIndicatorMapping>>(
    `/templates/versions/${encodeURIComponent(versionCode)}/indicator-mappings${localeParams({
      include_inactive: includeInactive ? "true" : "false",
    })}`,
  );
  return result.data;
}

export async function upsertTemplateIndicatorMapping(versionCode: string, payload: TemplateIndicatorMappingPayload) {
  const result = await apiPost<DetailResponse<TemplateIndicatorMapping>, TemplateIndicatorMappingPayload>(
    `/templates/versions/${encodeURIComponent(versionCode)}/indicator-mappings${query({ locale: getSelectedLocale() })}`,
    payload,
  );
  return result.data;
}

export async function deactivateTemplateIndicatorMapping(
  versionCode: string,
  indicatorCode: string,
  payload: { unit_code: string; mapping_role?: string; is_active: boolean },
) {
  const result = await apiDelete<DetailResponse<TemplateIndicatorMapping>, typeof payload>(
    `/templates/versions/${encodeURIComponent(versionCode)}/indicator-mappings/${encodeURIComponent(indicatorCode)}${query({
      locale: getSelectedLocale(),
    })}`,
    payload,
  );
  return result.data;
}

export async function setTemplateVersionStatus(versionCode: string, payload: TemplateVersionStatusPayload) {
  const result = await apiPatch<DetailResponse<TemplateVersion>, TemplateVersionStatusPayload>(
    `/templates/versions/${encodeURIComponent(versionCode)}/status${query({ locale: getSelectedLocale() })}`,
    payload,
  );
  return result.data;
}

export async function listTemplateAxes(versionCode: string) {
  const result = await apiGet<ListResponse<TemplateAxis>>(
    `/templates/versions/${encodeURIComponent(versionCode)}/axes${localeParams()}`,
  );
  return result.data;
}

export async function createTemplateAxis(versionCode: string, payload: TemplateAxisPayload) {
  const result = await apiPost<DetailResponse<TemplateAxis>, TemplateAxisPayload>(
    `/templates/versions/${encodeURIComponent(versionCode)}/axes${query({ locale: getSelectedLocale() })}`,
    payload,
  );
  return result.data;
}

export async function updateTemplateAxis(versionCode: string, axisCode: string, payload: TemplateAxisPayload) {
  const result = await apiPatch<DetailResponse<TemplateAxis>, TemplateAxisPayload>(
    `/templates/versions/${encodeURIComponent(versionCode)}/axes/${encodeURIComponent(axisCode)}${query({
      locale: getSelectedLocale(),
    })}`,
    payload,
  );
  return result.data;
}

export async function listTemplateMeasures(versionCode: string) {
  const result = await apiGet<ListResponse<TemplateMeasure>>(
    `/templates/versions/${encodeURIComponent(versionCode)}/measures${localeParams()}`,
  );
  return result.data;
}

export async function createTemplateMeasure(versionCode: string, payload: TemplateMeasurePayload) {
  const result = await apiPost<DetailResponse<TemplateMeasure>, TemplateMeasurePayload>(
    `/templates/versions/${encodeURIComponent(versionCode)}/measures${query({ locale: getSelectedLocale() })}`,
    payload,
  );
  return result.data;
}

export async function updateTemplateMeasure(versionCode: string, measureCode: string, payload: TemplateMeasurePayload) {
  const result = await apiPatch<DetailResponse<TemplateMeasure>, TemplateMeasurePayload>(
    `/templates/versions/${encodeURIComponent(versionCode)}/measures/${encodeURIComponent(measureCode)}${query({
      locale: getSelectedLocale(),
    })}`,
    payload,
  );
  return result.data;
}

export async function deactivateTemplateMeasure(versionCode: string, measureCode: string) {
  const result = await apiDelete<DetailResponse<TemplateMeasure>, { unit_code: string; is_active: boolean }>(
    `/templates/versions/${encodeURIComponent(versionCode)}/measures/${encodeURIComponent(measureCode)}${query({
      locale: getSelectedLocale(),
    })}`,
    {
      unit_code: getSelectedUnitCode(),
      is_active: false,
    },
  );
  return result.data;
}

export async function getTemplateRenderContract(versionCode: string) {
  const result = await apiGet<DetailResponse<TemplateRenderContract>>(
    `/templates/versions/${encodeURIComponent(versionCode)}/render-contract${localeParams()}`,
  );
  return result.data;
}

export async function getTemplateStudioDraft(versionCode: string) {
  const result = await apiGet<DetailResponse<TemplateStudioDraft>>(
    `/templates/versions/${encodeURIComponent(versionCode)}/studio-draft${localeParams()}`,
  );
  return result.data;
}

export async function saveTemplateStudioDraft(versionCode: string, payload: TemplateStudioDraftPayload) {
  const result = await apiPut<DetailResponse<TemplateStudioDraft>, TemplateStudioDraftPayload>(
    `/templates/versions/${encodeURIComponent(versionCode)}/studio-draft${query({ locale: getSelectedLocale() })}`,
    payload,
  );
  return result.data;
}

export async function listTemplateFormulaOutputs(versionCode: string) {
  const result = await apiGet<ListResponse<TemplateFormulaOutput>>(
    `/templates/versions/${encodeURIComponent(versionCode)}/formula-outputs${localeParams()}`,
  );
  return result.data;
}

export async function upsertTemplateFormulaOutput(versionCode: string, payload: TemplateFormulaOutputPayload) {
  const result = await apiPost<DetailResponse<TemplateFormulaOutput>, TemplateFormulaOutputPayload>(
    `/templates/versions/${encodeURIComponent(versionCode)}/formula-outputs${query({ locale: getSelectedLocale() })}`,
    payload,
  );
  return result.data;
}

export async function listTemplateImportJobs(versionCode: string) {
  const result = await apiGet<ListResponse<TemplateImportJob>>(
    `/templates/versions/${encodeURIComponent(versionCode)}/import-jobs${localeParams()}`,
  );
  return result.data;
}

export async function extractTemplateImportFile(
  versionCode: string,
  sourceType: "EXCEL" | "CSV" | "PDF",
  file: File,
  options: Record<string, unknown> = {},
): Promise<TemplateImportJob> {
  const form = new FormData();
  form.set("source_type", sourceType);
  form.set("unit_code", getSelectedUnitCode());
  form.set("options_json", JSON.stringify(options));
  form.set("file", file);
  const result = await apiPostForm<DetailResponse<TemplateImportJob>>(
    `/templates/versions/${encodeURIComponent(versionCode)}/import-jobs/file${query({ locale: getSelectedLocale() })}`,
    form,
  );
  return result.data.data;
}

export async function extractTemplateImportFetch(
  versionCode: string,
  payload: Omit<TemplateImportFetchPayload, "unit_code">,
): Promise<TemplateImportJob> {
  const result = await apiPost<DetailResponse<TemplateImportJob>, TemplateImportFetchPayload>(
    `/templates/versions/${encodeURIComponent(versionCode)}/import-jobs/fetch${query({ locale: getSelectedLocale() })}`,
    { ...payload, unit_code: getSelectedUnitCode() },
  );
  return result.data.data;
}

export async function updateTemplateImportJob(
  versionCode: string,
  importJobCode: string,
  payload: {
    unit_code: string;
    latest_preview?: TemplateImportPreview;
    latest_mapping?: Record<string, unknown>;
    selected_table_ref?: string | null;
    status?: string;
  },
): Promise<TemplateImportJob> {
  const result = await apiPut<DetailResponse<TemplateImportJob>, typeof payload>(
    `/templates/versions/${encodeURIComponent(versionCode)}/import-jobs/${encodeURIComponent(importJobCode)}${query({ locale: getSelectedLocale() })}`,
    payload,
  );
  return result.data.data;
}

export async function applyTemplateImportBinding(
  versionCode: string,
  importJobCode: string,
  payload: {
    unit_code: string;
    mappings: Record<string, unknown>;
    create_aliases?: boolean;
    create_hindi_names?: boolean;
    create_missing_masters?: boolean;
  },
): Promise<TemplateImportJob> {
  const result = await apiPost<DetailResponse<TemplateImportJob>, typeof payload>(
    `/templates/versions/${encodeURIComponent(versionCode)}/import-jobs/${encodeURIComponent(importJobCode)}/apply-binding${query({ locale: getSelectedLocale() })}`,
    payload,
  );
  return result.data.data;
}

export async function deleteTemplateImportJob(
  versionCode: string,
  importJobCode: string,
): Promise<TemplateImportJob> {
  const result = await apiDelete<DetailResponse<TemplateImportJob>>(
    `/templates/versions/${encodeURIComponent(versionCode)}/import-jobs/${encodeURIComponent(importJobCode)}${query({ locale: getSelectedLocale(), unit_code: getSelectedUnitCode() })}`,
  );
  return result.data.data;
}

export async function uploadTemplateFile(payload: UploadTemplateFilePayload): Promise<UploadedTemplateFile> {
  const form = new FormData();
  form.set("unit", payload.unit);
  form.set("template_name", payload.templateName);
  payload.ministryIds.forEach((ministryId) => form.append("ministry", ministryId));
  form.set("file", payload.file);

  const result = await apiPostForm<DetailResponse<UploadedTemplateFile>>(
    "/ingestion/template_files/upload",
    form,
  );
  return result.data.data;
}

export async function listTemplateRepository(): Promise<TemplateRepositoryItem[]> {
  const result = await apiGet<ListResponse<TemplateRepositoryItem>>("/templates/repository");
  return result.data.data;
}

export async function listMinistryContactDetails({
  limit = 100,
  offset = 0,
  searchText,
}: ListMinistryContactDetailsParams = {}): Promise<MinistryContactDetail[]> {
  const query = new URLSearchParams({
    limit: String(limit),
    offset: String(offset),
  });
  if (searchText?.trim()) query.set("search", searchText.trim());

  const result = await apiGet<{
    data: { rows: MinistryContactDetail[] };
  }>(`/masters/ministry-contact-details?${query.toString()}`);
  return result.data.data.rows;
}
