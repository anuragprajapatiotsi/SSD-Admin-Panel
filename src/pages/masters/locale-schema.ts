import { z } from "zod";

export const LOCALES_PATH = "/masters/locales";

export const localeSchema = z.object({
  display_name: z.string().trim().min(2, "Enter a display name with at least 2 characters.").max(100),
  locale_code: z.string().trim().min(2, "Enter a locale code.").max(20, "Locale code must be 20 characters or fewer.")
    .regex(/^[a-z]{2,3}(?:-[A-Z][a-z]{3})?(?:-(?:[A-Z]{2}|\d{3}))?$/, "Use a locale code such as en-IN or hi-IN."),
  native_name: z.string().trim().max(100, "Native name must be 100 characters or fewer."),
  sort_order: z.number().int("Sort order must be a whole number.").min(0, "Sort order cannot be negative."),
  is_default: z.boolean(),
  is_active: z.boolean(),
});

export type LocaleFormValues = z.infer<typeof localeSchema>;

export const DEFAULT_LOCALE_VALUES: LocaleFormValues = {
  display_name: "",
  locale_code: "",
  native_name: "",
  sort_order: 0,
  is_default: false,
  is_active: true,
};

export function localePayload(values: LocaleFormValues) {
  return {
    ...values,
    display_name: values.display_name.trim(),
    locale_code: values.locale_code.trim(),
    native_name: values.native_name.trim() || null,
  };
}
