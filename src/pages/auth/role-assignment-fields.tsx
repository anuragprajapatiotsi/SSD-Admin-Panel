import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCodeLabel } from "@/lib/utils";
import { Controller, type Control, type FieldPath, type FieldValues } from "react-hook-form";
import { useTranslation } from "react-i18next";
import type { AuthRole, AuthUnit } from "../../api/auth-admin.api";

function roleLabel(role: AuthRole): string {
  return role.role_name?.trim() || role.display_name?.trim() || role.name?.trim() || formatCodeLabel(role.role_code);
}

function unitLabel(unit: AuthUnit): string {
  return unit.unit_name?.trim() || unit.display_name?.trim() || unit.name?.trim() || formatCodeLabel(unit.unit_code);
}

function isGlobalAccessValue(value: unknown): boolean {
  const normalized = String(value ?? "").trim().toUpperCase().replace(/[\s_-]+/g, "");
  return normalized === "GLOBAL" || normalized === "GLOBALACCESS";
}

function isGlobalAccessUnit(unit: AuthUnit): boolean {
  return [unit.unit_code, unit.unit_name, unit.display_name, unit.name].some(isGlobalAccessValue);
}

export function RoleAssignmentFields<TValues extends FieldValues>({
  allowGlobalAccess = true,
  className,
  control,
  idPrefix,
  isDisabled,
  roleError,
  roleName,
  roles,
  unitError,
  unitName,
  units,
}: {
  allowGlobalAccess?: boolean;
  className?: string;
  control: Control<TValues>;
  idPrefix: string;
  isDisabled?: boolean;
  roleError?: string;
  roleName: FieldPath<TValues>;
  roles: AuthRole[];
  unitError?: string;
  unitName: FieldPath<TValues>;
  units: AuthUnit[];
}) {
  const { t } = useTranslation("common");
  const roleId = `${idPrefix}-role-code`;
  const unitId = `${idPrefix}-role-unit`;

  return (
    <FieldGroup className={className}>
      <Controller control={control} name={roleName} render={({ field }) => (
        <Field className="gap-1" data-invalid={Boolean(roleError)}>
          <FieldLabel htmlFor={roleId}>{t("pages.userManagement.fields.role")} <span aria-hidden="true">*</span></FieldLabel>
          <Select aria-label={t("pages.userManagement.fields.role")} selectedKey={String(field.value || "") || null} isDisabled={isDisabled} onSelectionChange={(key) => field.onChange(String(key ?? ""))}>
            <SelectTrigger id={roleId} aria-invalid={Boolean(roleError)}><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {roles.map((role) => (
                  <SelectItem id={role.role_code} key={role.role_code} textValue={roleLabel(role)}>
                    {roleLabel(role)}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <FieldDescription>{t("pages.userManagement.assignRole.roleHelp")}</FieldDescription>
          <FieldError>{roleError}</FieldError>
        </Field>
      )} />

      <Controller control={control} name={unitName} render={({ field }) => (
        <Field className="gap-1" data-invalid={Boolean(unitError)}>
          <FieldLabel htmlFor={unitId}>{t("pages.userManagement.fields.pillar")} <span aria-hidden="true">*</span></FieldLabel>
          <Select
            aria-label={t("pages.userManagement.fields.pillar")}
            selectedKey={!allowGlobalAccess && isGlobalAccessValue(field.value)
              ? null
              : String(field.value || (allowGlobalAccess ? "GLOBAL" : "")) || null}
            isDisabled={isDisabled}
            onSelectionChange={(key) => field.onChange(String(key ?? (allowGlobalAccess ? "GLOBAL" : "")))}
          >
            <SelectTrigger id={unitId} aria-invalid={Boolean(unitError)}><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectGroup>
                {allowGlobalAccess ? <SelectItem id="GLOBAL">{t("pages.userManagement.assignRole.globalAccess")}</SelectItem> : null}
                {units.filter((unit) => allowGlobalAccess || !isGlobalAccessUnit(unit)).map((unit) => (
                  <SelectItem id={unit.unit_code} key={unit.unit_code} textValue={unitLabel(unit)}>
                    {unitLabel(unit)}
                  </SelectItem>
                ))}
              </SelectGroup>
            </SelectContent>
          </Select>
          <FieldDescription>
            {t(allowGlobalAccess ? "pages.userManagement.assignRole.pillarHelp" : "pages.userManagement.assignRole.specificPillarHelp")}
          </FieldDescription>
          <FieldError>{unitError}</FieldError>
        </Field>
      )} />
    </FieldGroup>
  );
}
