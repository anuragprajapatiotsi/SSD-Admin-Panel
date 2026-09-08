import { apiDelete, apiGet, apiPatch, apiPost } from "./http-client";
import { getSelectedLocale, getSelectedUnitCode } from "./session.api";

export type MetadataListResponse<T> = {
  data: T[];
  locale: string;
  count: number;
};

export type MasterRecord = Record<string, unknown>;

export type OfficerEmailSuggestion = {
  officerCode: string;
  displayName: string;
  email: string;
  designation?: string;
  organizationCode?: string;
};

export type OfficerEmailSuggestionPage = {
  data: OfficerEmailSuggestion[];
  count: number;
  offset: number;
  returnedCount: number;
};

export type MasterListOptions = {
  endpoint: string;
  includeUnit?: boolean;
  params?: Record<string, string | number | boolean | undefined>;
};

export type MasterMutationOptions = {
  endpoint: string;
  code?: string;
  payload: MasterRecord;
  patchPath?: string;
  deletePath?: string;
};

export async function listMasterRecords({ endpoint, includeUnit = false, params = {} }: MasterListOptions) {
  const query = new URLSearchParams({
    locale: getSelectedLocale(),
    limit: "25",
    offset: "0",
  });

  if (includeUnit) {
    query.set("unit_code", getSelectedUnitCode());
  }

  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== "") {
      query.set(key, String(value));
    }
  });

  const result = await apiGet<MetadataListResponse<MasterRecord>>(`${endpoint}?${query}`);
  return result.data;
}

export async function createMasterRecord({ endpoint, payload }: MasterMutationOptions) {
  const query = new URLSearchParams({ locale: getSelectedLocale() });
  const result = await apiPost<{ data: MasterRecord; locale: string }, MasterRecord>(`${endpoint}?${query}`, payload);
  return result.data.data;
}

export async function getLocaleRecord(localeCode: string): Promise<MasterRecord> {
  const response = await listMasterRecords({
    endpoint: "/masters/locales",
    params: {
      limit: 100,
      offset: 0,
      search: localeCode,
      status_filter: "ALL",
    },
  });
  const locale = response.data.find((record) => String(record.locale_code) === localeCode);
  if (!locale) throw new Error(`Locale "${localeCode}" was not found.`);
  return locale;
}

export async function getPeriodicityRecord(periodicityCode: string): Promise<MasterRecord> {
  const response = await listMasterRecords({
    endpoint: "/masters/periodicities",
    params: {
      limit: 100,
      offset: 0,
      search: periodicityCode,
      status_filter: "ALL",
    },
  });
  const periodicity = response.data.find((record) => String(record.periodicity_code) === periodicityCode);
  if (!periodicity) throw new Error(`Periodicity "${periodicityCode}" was not found.`);
  return periodicity;
}

export async function getUomRecord(uomCode: string): Promise<MasterRecord> {
  const response = await listMasterRecords({
    endpoint: "/masters/uom",
    params: { limit: 100, offset: 0, search: uomCode, status_filter: "ALL" },
  });
  const uom = response.data.find((record) => String(record.uom_code) === uomCode);
  if (!uom) throw new Error(`UOM "${uomCode}" was not found.`);
  return uom;
}

export async function getOrganizationRecord(organizationCode: string): Promise<MasterRecord> {
  const response = await listMasterRecords({ endpoint: "/masters/organizations", params: { limit: 500, offset: 0, search: organizationCode, status_filter: "ALL" } });
  const organization = response.data.find((record) => String(record.organization_code) === organizationCode);
  if (!organization) throw new Error(`Organization "${organizationCode}" was not found.`);
  return organization;
}

export async function getOfficerRecord(organizationCode: string, officerCode: string): Promise<MasterRecord> {
  const response = await listMasterRecords({ endpoint: "/masters/officers", params: { limit: 100, offset: 0, search: officerCode, organization_code: organizationCode, status_filter: "ALL" } });
  const officer = response.data.find((record) => String(record.officer_code) === officerCode && String(record.organization_code) === organizationCode);
  if (!officer) throw new Error(`Officer "${officerCode}" was not found.`);
  return officer;
}

export async function searchOfficerEmailSuggestions({
  search,
  organizationCode,
  limit = 20,
  offset = 0,
}: {
  search: string;
  organizationCode?: string;
  limit?: number;
  offset?: number;
}): Promise<OfficerEmailSuggestionPage> {
  const response = await listMasterRecords({
    endpoint: "/masters/officers",
    params: {
      search: search.trim(),
      organization_code: organizationCode,
      status_filter: "ACTIVE",
      limit,
      offset,
    },
  });

  return {
    data: response.data.flatMap((record) => {
      const email = String(record.email ?? "").trim();
      if (!email) return [];

      return [{
        officerCode: String(record.officer_code ?? email),
        displayName: String(record.display_name ?? email),
        email,
        designation: record.designation ? String(record.designation) : undefined,
        organizationCode: record.organization_code ? String(record.organization_code) : undefined,
      }];
    }),
    count: response.count,
    offset,
    returnedCount: response.data.length,
  };
}

export async function updateMasterRecord({ endpoint, payload, patchPath }: MasterMutationOptions) {
  const query = new URLSearchParams({ locale: getSelectedLocale() });
  const result = await apiPatch<{ data: MasterRecord; locale: string }, MasterRecord>(`${patchPath ?? endpoint}?${query}`, payload);
  return result.data.data;
}

export async function deleteMasterRecord({ endpoint, deletePath }: Pick<MasterMutationOptions, "endpoint" | "deletePath">) {
  const query = new URLSearchParams({ locale: getSelectedLocale() });
  const result = await apiDelete<{ data: MasterRecord; locale: string }>(`${deletePath ?? endpoint}?${query}`);
  return result.data.data;
}
