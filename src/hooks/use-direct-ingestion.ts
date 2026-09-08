import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { directIngestionService } from "@/services/direct-ingestion.service";
import type { CreateDirectIngestion, DirectReviewDecision, DirectSubmission } from "@/api/direct-ingestion.api";
import { getLatestSubmission } from "@/utils/submission-version";
import { useTranslation } from "react-i18next";

export const directIngestionKeys = {
  all: ["direct-ingestion"] as const,
  parent: (code: string, unitCode: string, locale?: string) => ["direct-ingestion", code, unitCode, locale] as const,
};
export function latestDirectSubmission(history: DirectSubmission[] = [], latest?: DirectSubmission) {
  return getLatestSubmission(history, latest);
}
export function isDirectProcessing(status?: string, terminal?: boolean) {
  return terminal !== true && ["IN_QUEUE", "EXTRACTION_QUEUED", "PROCESSING"].includes(status ?? "");
}
export function useDirectIngestion(code: string, unitCode: string, locale?: string, enabled = true) {
  return useQuery({
    queryKey: directIngestionKeys.parent(code, unitCode, locale),
    queryFn: () => directIngestionService.get(code, unitCode, locale),
    enabled: enabled && Boolean(code && unitCode),
    refetchInterval: (query) => {
      const latest = latestDirectSubmission(query.state.data?.submissionHistory, query.state.data?.latestSubmission);
      return isDirectProcessing(latest?.processingStatus ?? latest?.status, latest?.terminal) ? 2000 : false;
    },
  });
}
export function useDirectReview(code: string, version: number | undefined, unitCode: string, locale: string, enabled: boolean) {
  return useQuery({
    queryKey: ["direct-review", code, version, unitCode, locale],
    queryFn: () => directIngestionService.review(code, version!, unitCode, locale),
    enabled: enabled && Boolean(code && version && unitCode),
  });
}
export function useUploadDirectIngestion() {
  const client = useQueryClient();
  return useMutation({
    mutationFn: (input: { code?: string; payload: CreateDirectIngestion }) => input.code
      ? directIngestionService.submit(input.code, input.payload)
      : directIngestionService.create(input.payload),
    onSuccess: () => Promise.all([
      client.invalidateQueries({ queryKey: directIngestionKeys.all }),
      client.invalidateQueries({ queryKey: ["template-workflow", "collection-activities"] }),
    ]),
  });
}
export function useDirectReviewDecision(code: string, version: number, unitCode: string) {
  const client = useQueryClient();
  const { t } = useTranslation("ingestion");
  return useMutation({
    mutationFn: async (payload: DirectReviewDecision) => {
      const parent = await directIngestionService.get(code, unitCode);
      if (latestDirectSubmission(parent.submissionHistory, parent.latestSubmission)?.submissionVersion !== version) {
        await client.invalidateQueries({ queryKey: ["direct-ingestion", code, unitCode] });
        throw new Error(t("directIngestion.latestOnly"));
      }
      return directIngestionService.decide(code, version, unitCode, payload);
    },
    onSuccess: () => Promise.all([
      client.invalidateQueries({ queryKey: ["direct-review", code, version, unitCode] }),
      client.invalidateQueries({ queryKey: directIngestionKeys.all }),
      client.invalidateQueries({ queryKey: ["template-workflow", "collection-activity-preview"] }),
      client.invalidateQueries({ queryKey: ["template-workflow", "collection-activities"] }),
    ]),
  });
}
