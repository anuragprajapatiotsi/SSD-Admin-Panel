import { z } from "zod";

export function createReviewLevelSchema(t: (key: string) => string) {
  return z.object({
    workflowCode: z.string().trim().min(1, t("pages.userManagement.validation.selectWorkflow")),
    levelCode: z.string().trim().min(1, t("pages.userManagement.validation.selectReviewLevel")),
    roleCode: z.string(),
    pillarCode: z.string().trim().min(1, t("pages.userManagement.validation.selectPillar")),
  });
}

export const reviewLevelSchema = createReviewLevelSchema((key) => key);

export type ReviewLevelFormValues = z.infer<typeof reviewLevelSchema>;

export const DEFAULT_REVIEW_LEVEL_VALUES: ReviewLevelFormValues = {
  workflowCode: "",
  levelCode: "",
  roleCode: "NONE",
  pillarCode: "GLOBAL",
};
