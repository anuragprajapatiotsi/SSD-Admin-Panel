import type { ComponentProps } from "react";
import { useTranslation } from "react-i18next";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupTextarea } from "@/components/ui/input-group";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip";
import { newApiPair, type ApiPair } from "@/utils/data-api-form";

type TextFieldProps = ComponentProps<typeof InputGroupInput> & { label: string; error?: string; description?: string };
export function DataApiTextField({ label, error, description, id, ...props }: TextFieldProps) {
  const { t } = useTranslation("ingestion");
  return <Field data-invalid={Boolean(error)} data-disabled={props.disabled}>
    <InputGroup>
      <InputGroupAddon><FieldLabel htmlFor={id}>{label}</FieldLabel></InputGroupAddon>
      <InputGroupInput id={id} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : description ? `${id}-help` : undefined} {...props} />
    </InputGroup>
    {description ? <FieldDescription id={`${id}-help`}>{description}</FieldDescription> : null}
    {error ? <FieldError id={`${id}-error`}>{t(`dataApi.validation.${error}`)}</FieldError> : null}
  </Field>;
}

export function DataApiTextarea({ label, error, description, id, ...props }: ComponentProps<typeof InputGroupTextarea> & { label: string; error?: string; description?: string }) {
  const { t } = useTranslation("ingestion");
  return <Field data-invalid={Boolean(error)} data-disabled={props.disabled}>
    <InputGroup>
      <InputGroupAddon align="block-start"><FieldLabel htmlFor={id}>{label}</FieldLabel></InputGroupAddon>
      <InputGroupTextarea id={id} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : description ? `${id}-help` : undefined} {...props} />
    </InputGroup>
    {description ? <FieldDescription id={`${id}-help`}>{description}</FieldDescription> : null}
    {error ? <FieldError id={`${id}-error`}>{t(`dataApi.validation.${error}`)}</FieldError> : null}
  </Field>;
}

export function DataApiSelect({ label, value, options, disabled, onChange }: {
  label: string; value: string; options: readonly { value: string; label: string }[]; disabled?: boolean; onChange: (value: string) => void;
}) {
  return <Field>
    <Select className="w-full" aria-label={label} selectedKey={value} isDisabled={disabled} onSelectionChange={(key) => { if (key !== null) onChange(String(key)); }}>
      <SelectTrigger><span className="text-muted-foreground">{label}</span><SelectValue /></SelectTrigger>
      <SelectContent><SelectGroup>{options.map((option) => <SelectItem key={option.value} id={option.value} textValue={option.label}>{option.label}</SelectItem>)}</SelectGroup></SelectContent>
    </Select>
  </Field>;
}

export function DataApiPairs({ name, values, errors, disabled, onChange }: {
  name: "query" | "headers"; values: ApiPair[]; errors: Record<string, string>; disabled: boolean; onChange: (value: ApiPair[]) => void;
}) {
  const { t } = useTranslation("ingestion");
  const update = (id: string, patch: Partial<ApiPair>) => onChange(values.map((row) => row.id === id ? { ...row, ...patch } : row));
  return <FieldGroup>
    <FieldDescription>{t(`dataApi.${name}Help`)}</FieldDescription>
    {values.map((row, index) => <FieldGroup key={row.id} className="rounded-lg bg-muted/40 p-3">
      <FieldGroup className="md:flex-row">
        <DataApiTextField id={`${row.id}-key`} label={t("dataApi.fields.key")} value={row.key} disabled={disabled} maxLength={240} error={errors[`${name}.${index}.key`]} onChange={(event) => update(row.id, { key: event.target.value })} />
        <DataApiTextField id={`${row.id}-value`} label={t("dataApi.fields.value")} type={row.secret ? "password" : "text"} autoComplete="off" value={row.value} disabled={disabled} maxLength={8000} error={errors[`${name}.${index}.value`]} description={row.configured ? t("dataApi.credentialReenter") : undefined} onChange={(event) => update(row.id, { value: event.target.value })} />
      </FieldGroup>
      <div className="flex flex-wrap items-center gap-4">
        <Field orientation="horizontal" className="w-auto"><Switch id={`${row.id}-enabled`} aria-label={t("dataApi.fields.enabled")} isSelected={row.enabled} isDisabled={disabled} onChange={(enabled) => update(row.id, { enabled })} /><FieldLabel htmlFor={`${row.id}-enabled`}>{t("dataApi.fields.enabled")}</FieldLabel></Field>
        <Field orientation="horizontal" className="w-auto"><Switch id={`${row.id}-secret`} aria-label={t("dataApi.fields.secret")} isSelected={row.secret} isDisabled={disabled} onChange={(secret) => update(row.id, { secret })} /><FieldLabel htmlFor={`${row.id}-secret`}>{t("dataApi.fields.secret")}</FieldLabel></Field>
        <TooltipTrigger><Button className="ml-auto" type="button" variant="ghost" size="icon" aria-label={t("dataApi.removeParameter", { number: index + 1 })} isDisabled={disabled} onPress={() => onChange(values.filter((item) => item.id !== row.id))}><IconTrash aria-hidden="true" /></Button><Tooltip>{t("dataApi.removeParameter", { number: index + 1 })}</Tooltip></TooltipTrigger>
      </div>
    </FieldGroup>)}
    {errors[name] ? <FieldError>{t(`dataApi.validation.${errors[name]}`)}</FieldError> : null}
    <Button type="button" variant="outline" className="w-fit" isDisabled={disabled || values.length >= 100} onPress={() => onChange([...values, newApiPair()])}><IconPlus data-icon="inline-start" aria-hidden="true" />{t(name === "query" ? "dataApi.addParameter" : "dataApi.addHeader")}</Button>
  </FieldGroup>;
}
