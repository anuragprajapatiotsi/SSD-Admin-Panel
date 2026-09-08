import { z } from "zod";

export const ORGANIZATIONS_ENDPOINT = "/masters/organizations";
export const ORGANIZATION_TYPES = ["MINISTRY", "DEPARTMENT", "DIVISION", "UNIT", "SOURCE", "OTHER"] as const;

export function createUnitSchema(t: (key: string) => string) {
  return z.object({
    organization_code: z.string().trim().min(1, t("pages.sourcesMinistries.organizationForm.validation.codeRequired")).max(80, t("pages.sourcesMinistries.organizationForm.validation.codeMax"))
      .regex(/^[A-Za-z0-9_ -]+$/, t("pages.sourcesMinistries.organizationForm.validation.codeFormat")),
    name: z.string().trim().min(2, t("pages.sourcesMinistries.organizationForm.validation.nameMin")).max(160, t("pages.sourcesMinistries.organizationForm.validation.nameMax")),
    organization_type: z.enum(ORGANIZATION_TYPES, { message: t("pages.sourcesMinistries.organizationForm.validation.typeRequired") }),
    parent_organization_code: z.string().trim().max(80, t("pages.sourcesMinistries.organizationForm.validation.parentMax")),
    short_code: z.string().trim().max(40, t("pages.sourcesMinistries.organizationForm.validation.shortCodeMax")),
    description: z.string().trim().max(500, t("pages.sourcesMinistries.organizationForm.validation.descriptionMax")),
    is_active: z.boolean(),
  });
}

export const unitSchema = createUnitSchema((key) => key);

export type UnitFormValues = z.infer<typeof unitSchema>;

export const DEFAULT_UNIT_VALUES: UnitFormValues = {
  organization_code: "", name: "", organization_type: "MINISTRY", parent_organization_code: "",
  short_code: "", description: "", is_active: true,
};

function normalizeCode(value: string) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

export function unitPayload(values: UnitFormValues) {
  return {
    ...values,
    organization_code: normalizeCode(values.organization_code),
    name: values.name.trim(),
    parent_organization_code: values.parent_organization_code || null,
    short_code: values.short_code ? normalizeCode(values.short_code) : null,
    description: values.description.trim() || null,
  };
}
