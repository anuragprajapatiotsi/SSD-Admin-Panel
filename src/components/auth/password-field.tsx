import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { cn } from "@/lib/utils";
import { passwordRequirementResults } from "@/lib/password-policy";
import { IconCheck, IconEye, IconEyeOff, IconX } from "@tabler/icons-react";
import { type ComponentProps, useState } from "react";
import { useTranslation } from "react-i18next";

type PasswordFieldProps = {
  comparisonValue?: string;
  error?: string;
  id: string;
  inputProps: ComponentProps<typeof InputGroupInput>;
  label: string;
  showStrength?: boolean;
  value?: string;
};

export function PasswordField({
  comparisonValue,
  error,
  id,
  inputProps,
  label,
  showStrength = false,
  value = "",
}: PasswordFieldProps) {
  const [isVisible, setIsVisible] = useState(false);
  const { t } = useTranslation("common");

  return (
    <Field data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={id}>
        {label} <span aria-hidden="true">*</span>
      </FieldLabel>
      <InputGroup className="h-11">
        <InputGroupInput
          {...inputProps}
          id={id}
          type={isVisible ? "text" : "password"}
          aria-required="true"
          aria-invalid={Boolean(error)}
          aria-describedby={error ? `${id}-error` : undefined}
        />
        <InputGroupAddon align="inline-end">
          <InputGroupButton
            size="icon-xs"
            aria-label={t(isVisible ? "auth.password.hideField" : "auth.password.showField", { field: label })}
            onPress={() => setIsVisible((current) => !current)}
          >
            {isVisible ? <IconEyeOff aria-hidden="true" /> : <IconEye aria-hidden="true" />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      {showStrength ? <PasswordStrength value={value} /> : null}
      {comparisonValue !== undefined && value ? (
        <div
          id={`${id}-error`}
          className={cn(
            "flex items-center gap-1 text-xs font-medium",
            value === comparisonValue ? "text-success" : "text-destructive",
          )}
          aria-live="polite"
        >
          {value === comparisonValue ? <IconCheck className="size-3" aria-hidden="true" /> : <IconX className="size-3" aria-hidden="true" />}
          {t(value === comparisonValue ? "auth.password.match" : "auth.password.noMatch")}
        </div>
      ) : null}
      <FieldError id={`${id}-error`}>{comparisonValue !== undefined && value ? undefined : error}</FieldError>
    </Field>
  );
}

function PasswordStrength({ value }: { value: string }) {
  const { t } = useTranslation("common");
  const requirements = passwordRequirementResults(value);
  const metCount = requirements.filter((requirement) => requirement.met).length;
  const strength = metCount === requirements.length
    ? { bars: 4, label: t("auth.password.strength.strong"), barClass: "bg-success", textClass: "text-success" }
    : metCount >= 3
      ? { bars: 3, label: t("auth.password.strength.good"), barClass: "bg-warning", textClass: "text-warning" }
      : { bars: value ? 1 : 0, label: t("auth.password.strength.weak"), barClass: "bg-destructive", textClass: "text-destructive" };

  return (
    <div className="flex flex-col gap-2" aria-live="polite">
      <div className="flex items-center gap-2">
        <div className="grid flex-1 grid-cols-4 gap-1" aria-hidden="true">
          {Array.from({ length: 4 }, (_, index) => (
            <span
              className={cn(
                "h-1 rounded-full bg-muted transition-all duration-300 ease-out",
                index < strength.bars ? cn(strength.barClass, "opacity-100") : "opacity-60",
              )}
              key={index}
            />
          ))}
        </div>
        <span className={cn("min-w-12 text-right text-xs font-medium transition-colors duration-300", value ? strength.textClass : "text-muted-foreground")}>
          {value ? strength.label : ""}
        </span>
      </div>

      <ul className="grid grid-cols-2 gap-x-3 gap-y-1 text-xs text-muted-foreground">
        {requirements.map((requirement, index) => (
          <li className={cn("flex items-center gap-1", requirement.met && "text-success")} key={requirement.label}>
            <IconCheck className={cn("size-3", !requirement.met && "opacity-35")} aria-hidden="true" />
            {t(`auth.password.requirements.${index}`)}
          </li>
        ))}
      </ul>
    </div>
  );
}
