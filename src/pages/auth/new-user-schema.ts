import { z } from "zod";
import { passwordSchema } from "@/lib/password-policy";

type Translate = (key: string, options?: Record<string, unknown>) => string;

const requiredName = (t: Translate, field: "firstName" | "lastName") => z
  .string()
  .trim()
  .min(1, t(`pages.userManagement.validation.${field}Required`))
  .max(100, t(`pages.userManagement.validation.${field}Max`));

export function createNewUserSchema(t: Translate) {
  const roleAssignmentSchema = z.object({
    roleCode: z.string().trim().min(1, t("pages.userManagement.validation.selectRole")),
    unitCode: z.string().trim().min(1, t("pages.userManagement.validation.selectPillar")),
  });

  return z.object({
    username: z
      .string()
      .trim()
      .min(1, t("pages.userManagement.validation.usernameRequired"))
      .min(3, t("pages.userManagement.validation.usernameMin"))
      .max(64, t("pages.userManagement.validation.usernameMax"))
      .regex(/^[a-zA-Z0-9._-]+$/, t("pages.userManagement.validation.usernameFormat")),
    email: z
      .string()
      .trim()
      .min(1, t("pages.userManagement.validation.emailRequired"))
      .email(t("pages.userManagement.validation.emailInvalid"))
      .max(254, t("pages.userManagement.validation.emailMax")),
    password: passwordSchema,
    confirmPassword: z.string().min(1, "auth.newPassword.validation.confirmRequired"),
    firstName: requiredName(t, "firstName"),
    lastName: requiredName(t, "lastName"),
    roleAssignments: z.array(roleAssignmentSchema).min(1, t("pages.userManagement.validation.atLeastOneRole")),
  }).superRefine((values, context) => {
    if (values.password !== values.confirmPassword) {
      context.addIssue({
        code: "custom",
        message: "auth.newPassword.validation.noMatch",
        path: ["confirmPassword"],
      });
    }

    const assignmentKeys = new Set<string>();
    values.roleAssignments.forEach((assignment, index) => {
      const key = `${assignment.roleCode.trim().toUpperCase()}::${assignment.unitCode.trim().toUpperCase()}`;
      if (assignmentKeys.has(key)) {
        context.addIssue({
          code: "custom",
          message: t("pages.userManagement.validation.duplicateRoleAssignment"),
          path: ["roleAssignments", index, "roleCode"],
        });
      }
      assignmentKeys.add(key);
    });
  });
}

export const newUserSchema = createNewUserSchema((key) => key);

export type NewUserFormValues = z.infer<typeof newUserSchema>;

export const NEW_USER_DEFAULT_VALUES: NewUserFormValues = {
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  firstName: "",
  lastName: "",
  roleAssignments: [{ roleCode: "", unitCode: "GLOBAL" }],
};
