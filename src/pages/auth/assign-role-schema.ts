import { z } from "zod";

export function createAssignRoleSchema(t: (key: string) => string) {
  return z.object({
    roleCode: z.string().trim().min(1, t("pages.userManagement.validation.selectRole")),
    unitCode: z.string().trim().min(1, t("pages.userManagement.validation.selectPillar")),
  });
}

export const assignRoleSchema = createAssignRoleSchema((key) => key);

export type AssignRoleFormValues = z.infer<typeof assignRoleSchema>;

export const DEFAULT_ASSIGN_ROLE_VALUES: AssignRoleFormValues = {
  roleCode: "",
  unitCode: "GLOBAL",
};
