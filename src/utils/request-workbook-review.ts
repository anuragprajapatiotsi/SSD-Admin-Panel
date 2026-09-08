import { requestList, requestRecord, requestText, requestVersion } from "./request-workbook-preview";

export type RequestWorkbookReviewContext = {
  runCode: string;
  itemCode: string;
  unitCode: string;
  version?: number;
  level?: number;
  allowedActions: string[];
  canDecide: boolean;
  canFreeze: boolean;
  history: Record<string, unknown>[];
};

/** Review-context is authoritative. Never manufacture a level or infer final approval. */
export function normalizeRequestWorkbookReview(value: unknown, submission: Record<string, unknown>): RequestWorkbookReviewContext {
  const root = requestRecord(value);
  const workflow = requestRecord(root.reviewWorkflow);
  const readiness = requestRecord(root.freezeReadiness);
  const version = requestVersion(root.submissionVersion);
  return {
    runCode: requestText(root.dispatchRunCode), itemCode: requestText(root.runItemCode), unitCode: requestText(root.unitCode), version,
    level: requestVersion(requestRecord(workflow.nextLevel).levelNumber)
      ?? requestVersion(requestRecord(workflow.currentLevel).levelNumber) ?? requestVersion(workflow.currentLevel),
    allowedActions: Array.isArray(root.allowedActions) ? root.allowedActions.filter((action): action is string => typeof action === "string") : [],
    canDecide: root.canDecide !== false,
    // The handoff calls this freezeReady; deployed/local contracts also expose freezeReadiness.ready.
    canFreeze: root.approvalStatus === "APPROVED" && root.canFreeze !== false
      && (root.freezeReady === true || (readiness.ready === true && requestVersion(readiness.submissionVersion) === version)),
    history: requestList(root.reviewHistory ?? requestRecord(submission.reviewMetadata).reviewActions),
  };
}
