import { z } from "zod";

export const OFFICERS_ENDPOINT = "/masters/officers";
export const ORGANIZATIONS_ENDPOINT = "/masters/organizations";

export function createOfficerSchema(t: (key: string) => string) {
  return z.object({
    organization_code: z.string().trim().min(1, t("pages.sourcesMinistries.officerForm.validation.sourceRequired")),
    officer_code: z.string().trim().min(1, t("pages.sourcesMinistries.officerForm.validation.codeRequired")).max(80, t("pages.sourcesMinistries.officerForm.validation.codeMax"))
      .regex(/^[A-Za-z0-9_ -]+$/, t("pages.sourcesMinistries.officerForm.validation.codeFormat")),
    display_name: z.string().trim().min(2, t("pages.sourcesMinistries.officerForm.validation.nameMin")).max(160, t("pages.sourcesMinistries.officerForm.validation.nameMax")),
    email: z.string().trim().refine((value) => !value || z.email().safeParse(value).success, t("pages.sourcesMinistries.officerForm.validation.email")),
    mobile_number: z.string().trim().max(20, t("pages.sourcesMinistries.officerForm.validation.mobileMax"))
      .regex(/^[+()\d\s-]*$/, t("pages.sourcesMinistries.officerForm.validation.mobileFormat")),
    designation: z.string().trim().max(120, t("pages.sourcesMinistries.officerForm.validation.designationMax")),
    is_active: z.boolean(),
  });
}

export const officerSchema = createOfficerSchema((key) => key);

export type OfficerFormValues = z.infer<typeof officerSchema>;

export const DEFAULT_OFFICER_VALUES: OfficerFormValues = {
  organization_code: "", officer_code: "", display_name: "", email: "", mobile_number: "", designation: "", is_active: true,
};

function normalizeCode(value: string) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}

export function officerPayload(values: OfficerFormValues) {
  return {
    ...values,
    organization_code: values.organization_code.trim(),
    officer_code: normalizeCode(values.officer_code),
    display_name: values.display_name.trim(),
    email: values.email.trim() || null,
    mobile_number: values.mobile_number.trim() || null,
    designation: values.designation.trim() || null,
  };
}
