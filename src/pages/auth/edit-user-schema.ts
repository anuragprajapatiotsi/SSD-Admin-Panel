import { z } from "zod";
import { createOptionalMobileNumberSchema } from "./user-validation";

type Translate = (key: string, options?: Record<string, unknown>) => string;

const requiredText = (requiredMessage: string, maximumMessage: string, maximumLength: number) => z
  .string()
  .trim()
  .min(1, requiredMessage)
  .max(maximumLength, maximumMessage);

export function createEditUserSchema(t: Translate) {
  return z.object({
  firstName: requiredText(t("pages.userManagement.validation.firstNameRequired"), t("pages.userManagement.validation.firstNameMax"), 100),
  lastName: requiredText(t("pages.userManagement.validation.lastNameRequired"), t("pages.userManagement.validation.lastNameMax"), 100),
  username: requiredText(t("pages.userManagement.validation.usernameRequired"), t("pages.userManagement.validation.usernameMax"), 64),
  email: z
    .string()
    .trim()
    .min(1, t("pages.userManagement.validation.emailRequired"))
    .email(t("pages.userManagement.validation.emailInvalid"))
    .max(254, t("pages.userManagement.validation.emailMax")),
  mobileNumber: createOptionalMobileNumberSchema(t("pages.userManagement.validation.mobileExact")),
  preferredLanguageCode: z
    .string()
    .trim()
    .max(20, t("pages.userManagement.validation.languageMax")),
  isActive: z.boolean(),
  isSystemUser: z.boolean(),
});
}

export const editUserSchema = createEditUserSchema((key) => key);

export type EditUserFormValues = z.infer<typeof editUserSchema>;
