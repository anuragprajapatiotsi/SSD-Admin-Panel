import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import { directIngestionService } from "@/services/direct-ingestion.service";
import { latestDirectSubmission, directIngestionKeys } from "@/hooks/use-direct-ingestion";
import type { DirectPublicationDecision } from "@/api/direct-ingestion.api";

export type PublicationAction = DirectPublicationDecision["action"] | "FREEZE";

export function publicationDecisionSchema(returnReason: string, commentsTooLong: string) {
  return z.object({ action: z.enum(["APPROVE", "RETURN"]), comments: z.string().trim().max(2000, commentsTooLong) })
    .refine((value) => value.action !== "RETURN" || value.comments.length > 0, { path: ["comments"], message: returnReason });
}

export function useDirectPublicationReview(code: string, version: number, unitCode: string, locale: string, phase: string) {
  const client = useQueryClient();
  const { t } = useTranslation("ingestion");
  const query = useQuery({
    queryKey: ["direct-publication-review", code, version, unitCode, locale, phase],
    queryFn: () => directIngestionService.publicationReview(code, version, unitCode, locale),
    enabled: ["WAITING_FOR_FACT_REVIEW", "READY_TO_FREEZE"].includes(phase),
  });
  const refresh = (refetchPublication = true) => Promise.all([
    client.invalidateQueries({ queryKey: ["direct-publication-review", code, version, unitCode], refetchType: refetchPublication ? "active" : "none" }),
    client.invalidateQueries({ queryKey: directIngestionKeys.all }),
    client.invalidateQueries({ queryKey: ["template-workflow", "collection-activity-preview"] }),
    client.invalidateQueries({ queryKey: ["template-workflow", "collection-activities"] }),
  ]);
  const mutation = useMutation({
    retry: false,
    mutationFn: async ({ action, comments }: { action: PublicationAction; comments: string }) => {
      const payload = action === "FREEZE" ? null : publicationDecisionSchema(t("directPublicationReview.reasonRequired"), t("directPublicationReview.commentsTooLong")).parse({ action, comments });
      // Recheck the version and server permissions immediately before each write.
      const parent = await directIngestionService.get(code, unitCode, locale);
      if (latestDirectSubmission(parent.submissionHistory, parent.latestSubmission)?.submissionVersion !== version) {
        void refresh();
        throw new Error(t("directIngestion.latestOnly"));
      }
      const context = await directIngestionService.publicationReview(code, version, unitCode, locale);
      const permissions = context.factReview;
      if (context.directIngestionCode !== code || context.submissionVersion !== version || context.status !== "IN_REVIEW") {
        void refresh();
        throw new Error(t("directPublicationReview.permissionsChanged"));
      }
      if (action === "FREEZE") {
        if (context.currentPhase !== "READY_TO_FREEZE" || permissions?.status !== "APPROVED" || permissions.canFreeze !== true) {
          void refresh();
          throw new Error(t("directPublicationReview.permissionsChanged"));
        }
        return directIngestionService.freeze(code, version, unitCode);
      }
      if (context.currentPhase !== "WAITING_FOR_FACT_REVIEW" || permissions?.canDecide !== true || !permissions.allowedActions?.includes(action)) {
        void refresh();
        throw new Error(t("directPublicationReview.permissionsChanged"));
      }
      return directIngestionService.decidePublication(code, version, unitCode, payload!);
    },
  });
  return { query, mutation, refresh };
}
