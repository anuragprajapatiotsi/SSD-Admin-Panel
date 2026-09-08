import { z } from "zod";

export const UOM_PATH = "/masters/uom";
export const UOM_TYPES = ["COUNT", "PERCENT", "RATIO", "RATE", "CURRENCY", "TEXT", "OTHER"] as const;

export function createUomSchema(t: (key: string, options?: Record<string, unknown>) => string) {
  return z.object({
  name: z.string().trim().min(2, t("pages.uom.validation.nameMin")).max(120, t("pages.uom.validation.nameMax")),
  uom_code: z.string().trim().min(1, t("pages.uom.validation.codeRequired")).max(80, t("pages.uom.validation.codeMax"))
    .regex(/^[A-Za-z0-9_ -]+$/, t("pages.uom.validation.codeFormat")),
  symbol: z.string().trim().max(30, t("pages.uom.validation.symbolMax")),
  uom_type: z.enum(UOM_TYPES, { message: t("pages.uom.validation.typeRequired") }),
  description: z.string().trim().max(500, t("pages.uom.validation.descriptionMax")),
  sort_order: z.number().int(t("pages.uom.validation.sortOrderInteger")).min(0, t("pages.uom.validation.sortOrder")),
  is_active: z.boolean(),
  });
}

export const uomSchema = createUomSchema((key) => key);

export type UomFormValues = z.infer<typeof uomSchema>;

export const DEFAULT_UOM_VALUES: UomFormValues = {
  name: "",
  uom_code: "",
  symbol: "",
  uom_type: "COUNT",
  description: "",
  sort_order: 0,
  is_active: true,
};

export function uomPayload(values: UomFormValues) {
  return {
    ...values,
    name: values.name.trim(),
    uom_code: values.uom_code.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_+|_+$/g, ""),
    symbol: values.symbol.trim() || null,
    description: values.description.trim() || null,
  };
}
