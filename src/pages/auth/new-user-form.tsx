import { PasswordField } from "@/components/auth/password-field";
import { Loader } from "@/components/common/loader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { IconAlertCircle, IconPlus, IconShieldCheck, IconTrash, IconUserPlus } from "@tabler/icons-react";
import { zodResolver } from "@hookform/resolvers/zod";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useFieldArray, useForm, useWatch, type FieldError as HookFormFieldError, type UseFormRegisterReturn } from "react-hook-form";
import { listAuthRoles, listAuthUnits, type AuthRole, type AuthUnit } from "../../api/auth-admin.api";
import { createNewUserSchema, NEW_USER_DEFAULT_VALUES, type NewUserFormValues } from "./new-user-schema";
import { RoleAssignmentFields } from "./role-assignment-fields";

export function NewUserForm({ accountLocked = false, initialValues = NEW_USER_DEFAULT_VALUES, onCancel, onSubmit, serverError }: {
  accountLocked?: boolean;
  initialValues?: NewUserFormValues;
  onCancel: () => void;
  onSubmit: (values: NewUserFormValues) => Promise<void>;
  serverError?: string;
}) {
  const { t } = useTranslation("common");
  const schema = useMemo(() => createNewUserSchema(t), [t]);
  const [roles, setRoles] = useState<AuthRole[]>([]);
  const [units, setUnits] = useState<AuthUnit[]>([]);
  const [isLoadingOptions, setIsLoadingOptions] = useState(true);
  const [optionsError, setOptionsError] = useState("");
  const { control, formState: { errors, isSubmitting }, handleSubmit, register } = useForm<NewUserFormValues>({
    defaultValues: initialValues,
    mode: "onSubmit",
    reValidateMode: "onChange",
    resolver: zodResolver(schema),
  });
  const { append: appendRoleAssignment, fields: roleAssignmentFields, remove: removeRoleAssignment } = useFieldArray({
    control,
    name: "roleAssignments",
  });
  const password = useWatch({ control, name: "password" });
  const confirmPassword = useWatch({ control, name: "confirmPassword" });

  const loadRoleOptions = useCallback(async () => {
    setIsLoadingOptions(true);
    setOptionsError("");
    try {
      const [roleResult, unitResult] = await Promise.all([
        listAuthRoles(false),
        listAuthUnits(false),
      ]);
      setRoles(roleResult);
      setUnits(unitResult);
    } catch (error) {
      setOptionsError(error instanceof Error ? error.message : t("pages.userManagement.form.rolesAndPillarsLoadError"));
    } finally {
      setIsLoadingOptions(false);
    }
  }, [t]);

  useEffect(() => {
    void Promise.resolve().then(loadRoleOptions);
  }, [loadRoleOptions]);

  return (
    <form className="mx-auto w-full max-w-3xl" noValidate onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>{t("pages.userManagement.form.userDetails")}</CardTitle>
          <CardDescription>{t("pages.userManagement.form.createDetailsDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {serverError ? (
            <Alert variant="destructive">
              <IconAlertCircle aria-hidden="true" />
              <AlertTitle>{t("pages.userManagement.feedback.createErrorTitle")}</AlertTitle>
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          ) : null}

          {accountLocked ? (
            <Alert>
              <IconShieldCheck aria-hidden="true" />
              <AlertDescription>{t("pages.userManagement.form.partialProgress")}</AlertDescription>
            </Alert>
          ) : null}

          <FieldGroup className="grid gap-4 md:grid-cols-2">
            <UserTextField
              autoComplete="given-name"
              autoFocus
              error={errors.firstName}
              id="new-user-first-name"
              label={t("pages.userManagement.fields.firstName")}
              readOnly={accountLocked}
              registration={register("firstName")}
              required
            />
            <UserTextField
              autoComplete="family-name"
              error={errors.lastName}
              id="new-user-last-name"
              label={t("pages.userManagement.fields.lastName")}
              readOnly={accountLocked}
              registration={register("lastName")}
              required
            />
            <UserTextField
              autoComplete="username"
              error={errors.username}
              id="new-user-username"
              label={t("pages.userManagement.fields.username")}
              readOnly={accountLocked}
              placeholder={t("pages.userManagement.placeholders.username")}
              registration={register("username")}
              required
            />
            <UserTextField
              autoComplete="email"
              error={errors.email}
              id="new-user-email"
              label={t("pages.userManagement.fields.email")}
              readOnly={accountLocked}
              placeholder={t("pages.userManagement.placeholders.email")}
              registration={register("email")}
              required
              type="email"
            />
          </FieldGroup>

          <section className="flex flex-col gap-3 border-t pt-5" aria-labelledby="new-user-access-heading">
            <div>
              <h3 id="new-user-access-heading" className="text-sm font-semibold">{t("pages.userManagement.form.accessAndRoles")}</h3>
              <p className="text-xs text-muted-foreground">{t("pages.userManagement.form.accessAndRolesDescription")}</p>
            </div>
            {isLoadingOptions ? (
              <Loader text={t("pages.userManagement.form.loadingRolesAndPillars")} />
            ) : optionsError ? (
              <Alert variant="destructive">
                <IconAlertCircle aria-hidden="true" />
                <AlertTitle>{t("pages.userManagement.form.rolesAndPillarsLoadErrorTitle")}</AlertTitle>
                <AlertDescription>{optionsError}</AlertDescription>
                <Button className="col-start-2 mt-2 w-fit" size="sm" type="button" variant="outline" onPress={() => void loadRoleOptions()}>
                  {t("pages.userManagement.actions.tryAgain")}
                </Button>
              </Alert>
            ) : (
              <div className="flex flex-col gap-3">
                {roleAssignmentFields.map((assignment, index) => (
                  <Fragment key={assignment.id}>
                    <div className="flex flex-col gap-3 rounded-md bg-slate-50 p-3 dark:bg-slate-900/40">
                      <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium">
                          {t("pages.userManagement.form.roleNumber", { number: index + 1 })}
                        </p>
                        {index > 0 ? (
                          <Button
                            type="button"
                            size="icon-sm"
                            variant="ghost"
                            aria-label={t("pages.userManagement.actions.removeRoleAssignment", { number: index + 1 })}
                            isDisabled={isSubmitting || accountLocked}
                            onPress={() => removeRoleAssignment(index)}
                          >
                            <IconTrash aria-hidden="true" />
                          </Button>
                        ) : null}
                      </div>
                      <RoleAssignmentFields
                        allowGlobalAccess={false}
                        className="grid gap-3 sm:grid-cols-2"
                        control={control}
                        idPrefix={`new-user-role-${index}`}
                        isDisabled={isSubmitting || accountLocked}
                        roleError={errors.roleAssignments?.[index]?.roleCode?.message}
                        roleName={`roleAssignments.${index}.roleCode`}
                        roles={roles}
                        unitError={errors.roleAssignments?.[index]?.unitCode?.message}
                        unitName={`roleAssignments.${index}.unitCode`}
                        units={units}
                      />
                    </div>
                    {index === 0 ? (
                      <Button
                        className="w-fit text-primary hover:bg-primary/10 hover:text-primary"
                        type="button"
                        size="sm"
                        variant="ghost"
                        isDisabled={isSubmitting || accountLocked}
                        onPress={() => appendRoleAssignment({ roleCode: "", unitCode: "" })}
                      >
                        <IconPlus data-icon="inline-start" aria-hidden="true" />
                        {t("pages.userManagement.actions.addAnotherRole")}
                      </Button>
                    ) : null}
                  </Fragment>
                ))}
              </div>
            )}
          </section>

          <FieldGroup className="grid gap-4 border-t pt-5 md:grid-cols-2">
            <PasswordField
              id="new-user-password"
              label={t("pages.userManagement.fields.password")}
              error={errors.password?.message ? t(errors.password.message) : undefined}
              showStrength
              value={password}
              inputProps={{
                autoComplete: "new-password",
                readOnly: accountLocked,
                ...register("password"),
              }}
            />
            <PasswordField
              comparisonValue={password}
              id="new-user-confirm-password"
              label={t("pages.userManagement.fields.confirmPassword")}
              error={errors.confirmPassword?.message ? t(errors.confirmPassword.message) : undefined}
              value={confirmPassword}
              inputProps={{
                autoComplete: "new-password",
                readOnly: accountLocked,
                ...register("confirmPassword"),
              }}
            />
          </FieldGroup>
        </CardContent>
        <CardFooter className="flex-col-reverse gap-2 border-t sm:flex-row sm:justify-end">
          <Button
            className="w-full sm:w-auto"
            type="button"
            variant="outline"
            isDisabled={isSubmitting || accountLocked}
            onMouseDown={(event) => event.preventDefault()}
            onClick={onCancel}
          >
            {t("pages.userManagement.actions.cancel")}
          </Button>
          <Button className="w-full sm:w-auto" type="submit" isDisabled={isSubmitting || isLoadingOptions || Boolean(optionsError)}>
            {isSubmitting ? <Spinner data-icon="inline-start" aria-hidden="true" /> : <IconUserPlus data-icon="inline-start" aria-hidden="true" />}
            {t(isSubmitting ? "pages.userManagement.actions.creatingUser" : "pages.userManagement.actions.createUser")}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}

export function UserTextField({ autoComplete, autoFocus, description, error, id, isDisabled, label, placeholder, readOnly, registration, required, type = "text" }: {
  autoComplete?: string;
  autoFocus?: boolean;
  description?: string;
  error?: HookFormFieldError;
  id: string;
  isDisabled?: boolean;
  label: string;
  placeholder?: string;
  readOnly?: boolean;
  registration: UseFormRegisterReturn;
  required?: boolean;
  type?: React.HTMLInputTypeAttribute;
}) {
  const errorId = `${id}-error`;
  return (
    <Field className="gap-1" data-disabled={isDisabled || undefined} data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={id}>{label}{required ? <RequiredIndicator /> : null}</FieldLabel>
      <Input id={id} type={type} autoComplete={autoComplete} autoFocus={autoFocus} placeholder={placeholder} readOnly={readOnly} disabled={isDisabled} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : description ? `${id}-description` : undefined} aria-required={required || undefined} {...registration} />
      {description ? <FieldDescription id={`${id}-description`}>{description}</FieldDescription> : null}
      <FieldError id={errorId}>{error?.message}</FieldError>
    </Field>
  );
}

export function RequiredIndicator() {
  return <span className="text-destructive" aria-hidden="true"> *</span>;
}
