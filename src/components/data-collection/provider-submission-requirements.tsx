import { useId } from "react";
import { useTranslation } from "react-i18next";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group";
import { formatTemplateFileSize } from "@/components/template-editor/template-file-utils";
import type { useProviderSubmissionRequirements } from "@/hooks/use-provider-submission-requirements";

export function ProviderSubmissionRequirements({ requirements: r, disabled }: {
  requirements: ReturnType<typeof useProviderSubmissionRequirements>; disabled: boolean;
}) {
  const { t, i18n } = useTranslation("ingestion");
  const id = useId();
  return <>
    {r.evidenceEnabled ? <Field data-tour="provider-evidence" data-disabled={disabled} data-invalid={Boolean(r.evidenceError)}>
      <InputGroup>
        <InputGroupAddon align="block-start"><InputGroupText id={`${id}-evidence`}>{t(r.evidenceRequired ? "providerAccess.evidenceLabel" : "providerAccess.evidenceOptional")}</InputGroupText></InputGroupAddon>
        <InputGroupInput type="file" multiple accept={r.allowedTypes.length ? r.allowedTypes.map((type) => `.${type}`).join(",") : undefined} disabled={disabled}
          aria-labelledby={`${id}-evidence`} aria-describedby={`${id}-evidence-help ${id}-evidence-error`} aria-invalid={Boolean(r.evidenceError)}
          onChange={(event) => { r.chooseFiles(Array.from(event.target.files ?? [])); event.target.value = ""; }} />
      </InputGroup>
      <FieldDescription id={`${id}-evidence-help`}>
        {r.allowedTypes.length ? t("providerAccess.evidenceFormats", { types: r.allowedTypes.join(", ").toUpperCase() }) : null}
        {r.maxMb ? ` ${t("providerAccess.evidenceSize", { size: r.maxMb })}` : null}
      </FieldDescription>
      {r.files.length ? <ul className="flex min-w-0 flex-col gap-2">{r.files.map((file, index) => <li key={`${file.name}-${file.size}-${file.lastModified}`} className="flex min-w-0 items-center justify-between gap-2">
        <span className="min-w-0 break-all text-xs">{file.name} <span className="text-muted-foreground">{formatTemplateFileSize(file.size, i18n.language)}</span></span>
        <Button variant="ghost" size="sm" isDisabled={disabled} aria-label={t("providerAccess.removeEvidence", { name: file.name })} onPress={() => r.removeFile(index)}>{t("providerAccess.removeFile")}</Button>
      </li>)}</ul> : null}
      <FieldError id={`${id}-evidence-error`}>{r.evidenceError}</FieldError>
    </Field> : null}
    {r.showCertification ? <Field data-tour="provider-certification" data-disabled={disabled} data-invalid={Boolean(r.certificationError)}>
      <div className="flex items-start gap-3">
        <Checkbox isSelected={r.accepted} onChange={r.changeAcceptance} isDisabled={disabled || !r.text} isRequired={r.required} isInvalid={Boolean(r.certificationError)} aria-labelledby={`${id}-certification`} aria-describedby={`${id}-certification-error`} />
        <p id={`${id}-certification`} className="text-xs leading-relaxed">{r.text || t("providerAccess.certificationUnavailable")}</p>
      </div>
      <FieldError id={`${id}-certification-error`}>{r.certificationError}</FieldError>
    </Field> : null}
    {r.evidenceEnabled ? <FieldDescription>{t("providerAccess.requirementsSessionOnly")}</FieldDescription> : null}
  </>;
}
