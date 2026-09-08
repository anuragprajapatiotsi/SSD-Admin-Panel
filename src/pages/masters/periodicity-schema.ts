import { z } from "zod";

export const PERIODICITIES_PATH = "/masters/periodicities";

export function createPeriodicitySchema(t: (key: string) => string) {
  return z.object({
  name: z.string().trim().min(2, t("pages.periodicities.validation.nameMin")).max(120, t("pages.periodicities.validation.nameMax")),
  periodicity_code: z.string().trim().max(80, t("pages.periodicities.validation.codeMax"))
    .regex(/^[A-Za-z0-9_ -]*$/, t("pages.periodicities.validation.codeFormat")),
  months_interval: z.number().int(t("pages.periodicities.validation.monthsInteger")).min(0, t("pages.periodicities.validation.monthsMin")),
  description: z.string().trim().max(500, t("pages.periodicities.validation.descriptionMax")),
  sort_order: z.number().int(t("pages.periodicities.validation.sortOrderInteger")).min(0, t("pages.periodicities.validation.sortOrderMin")),
  is_active: z.boolean(),
  });
}

export const periodicitySchema = createPeriodicitySchema((key) => key);

export type PeriodicityFormValues = z.infer<typeof periodicitySchema>;

export function normalizePeriodicityCode(value: string) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_+|_+$/g, "");
}
