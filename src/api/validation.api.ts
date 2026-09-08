import { apiPost } from "./http-client";
import { getSelectedLocale } from "./session.api";

type DetailResponse<T> = {
  data: T;
  locale?: string;
};

export type ValidationRulePayload = {
  unit_code: string;
  rule_code: string;
  rule_type: string;
  rule_category: string;
  default_severity: string;
  evaluation_model: string;
  parameter_schema: Record<string, unknown>;
  display_name?: string;
  message_template?: string;
  help_text?: string;
  is_system_rule: boolean;
  is_active: boolean;
};

export type ValidationRuleBindingPayload = {
  unit_code: string;
  binding_code: string;
  rule_code: string;
  template_version_code: string;
  cell_code?: string;
  measure_code?: string;
  severity?: string;
  rule_config: Record<string, unknown>;
  is_active: boolean;
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

export async function upsertValidationRule(payload: ValidationRulePayload) {
  const result = await apiPost<DetailResponse<Record<string, unknown>>, ValidationRulePayload>(
    `/validation/rules${query({ locale: getSelectedLocale() })}`,
    payload,
  );
  return result.data;
}

export async function upsertValidationRuleBinding(payload: ValidationRuleBindingPayload) {
  const result = await apiPost<DetailResponse<Record<string, unknown>>, ValidationRuleBindingPayload>(
    `/validation/bindings${query({ locale: getSelectedLocale() })}`,
    payload,
  );
  return result.data;
}
