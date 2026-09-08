import type { TourDefinition } from "@/components/common/guided-tour/guided-tour";

const step = (id: string, optional = false): TourDefinition["steps"][number] => ({
  id, target: `[data-tour="provider-${id}"]`, textKey: `ingestion:providerTour.${id}`, optional,
});
const define = (id: string, steps: TourDefinition["steps"]): TourDefinition => ({
  id, version: 1, scope: `[data-tour-scope="provider-${id}"]`, steps,
  ...(id === "online" ? { waitFor: '[data-tour="provider-workbook"] [aria-busy="false"]' } : {}),
  ...(id === "preview" ? { waitFor: '[data-tour="provider-preview-workbook"] [aria-busy="false"]' } : {}),
});
const formSteps = [step("note"), step("evidence", true), step("certification", true), step("draft", true), step("submit"), step("cancel")];
const online = define("online", [{ ...step("workbook"), placement: "right" }, ...formSteps]);
const upload = define("upload", [step("file"), ...formSteps]);

export const providerTours = {
  assignments: define("assignments", [step("assignments"), step("online", true), step("download", true), step("upload", true), step("submitted-note", true), step("language"), step("logout")]),
  online,
  upload,
  returnedOnline: { ...online, id: "returned-online", steps: [step("returned"), ...online.steps] },
  returnedUpload: { ...upload, id: "returned-upload", steps: [step("returned"), ...upload.steps] },
  completed: define("completed", [step("completed"), step("preview", true), step("assignments-back")]),
  preview: define("preview", [{ ...step("preview-workbook"), placement: "right" }, step("preview-close")]),
} satisfies Record<string, TourDefinition>;
