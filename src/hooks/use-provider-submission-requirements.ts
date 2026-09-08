import { useCallback, useState } from "react";
import { useTranslation } from "react-i18next";
import { z } from "zod";
import type { RequestAccessSessionDetail } from "@/api/requests.api";
import type { PublicWorkbookSubmissionPayload } from "@/api/template-workflow.api";

export function useProviderSubmissionRequirements(policy: RequestAccessSessionDetail["policy"], evidenceEnabled: boolean) {
  const { t } = useTranslation("ingestion");
  const [accepted, setAccepted] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [changed, setChanged] = useState(false);
  const [certificationError, setCertificationError] = useState("");
  const [evidenceError, setEvidenceError] = useState("");
  const settings = policy?.certificationSettings;
  const required = settings?.certificationRequired === true || settings?.ministryMustCertify === true;
  const text = settings?.certificationText?.trim() ?? "";
  const showCertification = required || Boolean(text);
  const evidenceRequired = evidenceEnabled && settings?.evidenceRequired === true;
  const allowedTypes = policy?.attachmentSettings?.allowedTypes?.map((type) => type.replace(/^\./, "").toLowerCase()) ?? [];
  const maxMb = policy?.attachmentSettings?.maxFileSizeMb;
  const fileSchema = z.instanceof(File)
    .refine((file) => file.size > 0, t("providerAccess.evidenceEmpty"))
    .refine((file) => !allowedTypes.length || allowedTypes.includes(file.name.split(".").pop()?.toLowerCase() ?? ""), t("providerAccess.evidenceType", { types: allowedTypes.join(", ").toUpperCase() }))
    .refine((file) => !maxMb || file.size <= maxMb * 1024 * 1024, t("providerAccess.maxSize", { size: maxMb }));
  const resetAcceptance = useCallback(() => setAccepted(false), []);
  function chooseFiles(incoming: File[]) {
    const result = z.array(fileSchema).safeParse(incoming);
    if (!result.success) { setEvidenceError(result.error.issues[0].message); return; }
    setFiles((current) => [...current, ...incoming.filter((file) => !current.some((existing) => existing.name === file.name && existing.size === file.size && existing.lastModified === file.lastModified))]);
    setEvidenceError(""); setChanged(true); setAccepted(false);
  }
  function removeFile(index: number) {
    setFiles((current) => current.filter((_, i) => i !== index));
    setChanged(true); setAccepted(false); setEvidenceError("");
  }
  function changeAcceptance(next: boolean) {
    setAccepted(next); setChanged(true); setCertificationError("");
  }
  function validate(finalSubmit: boolean) {
    const certificationMessage = finalSubmit && required
      ? !text ? t("providerAccess.certificationUnavailable") : !accepted ? t("providerAccess.certificationRequired") : ""
      : "";
    const checkedFiles = z.array(fileSchema).safeParse(evidenceEnabled ? files : []);
    const evidenceMessage = !checkedFiles.success ? checkedFiles.error.issues[0].message
      : finalSubmit && evidenceRequired && !files.length ? t("providerAccess.evidenceRequired") : "";
    setCertificationError(certificationMessage); setEvidenceError(evidenceMessage);
    return !certificationMessage && !evidenceMessage;
  }
  const payload: Pick<PublicWorkbookSubmissionPayload, "certification" | "evidenceFiles"> = {
    ...(showCertification ? { certification: { accepted, certificationText: text, ministryMustCertify: settings?.ministryMustCertify === true } } : {}),
    ...(evidenceEnabled ? { evidenceFiles: files } : {}),
  };
  return { accepted, files, changed, required, text, showCertification, evidenceEnabled, evidenceRequired, allowedTypes, maxMb,
    certificationError, evidenceError, chooseFiles, removeFile, changeAcceptance, resetAcceptance, validate, payload };
}
