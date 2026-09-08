import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Field, FieldContent, FieldDescription, FieldError, FieldGroup, FieldLabel, FieldTitle } from "@/components/ui/field";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlert, Save } from "lucide-react";
import { useMemo } from "react";
import { useTranslation } from "react-i18next";
import { Controller, useForm } from "react-hook-form";
import { UserTextField } from "./new-user-form";
import { createEditUserSchema, type EditUserFormValues } from "./edit-user-schema";

export function EditUserForm({ defaultValues, onCancel, onSubmit, serverError }: {
  defaultValues: EditUserFormValues;
  onCancel: () => void;
  onSubmit: (values: EditUserFormValues) => Promise<void>;
  serverError?: string;
}) {
  const { t } = useTranslation("common");
  const schema = useMemo(() => createEditUserSchema(t), [t]);
  const languageOptions = [
    { value: "en-IN", label: t("pages.userManagement.languages.englishIndia") },
    { value: "hi-IN", label: t("pages.userManagement.languages.hindiIndia") },
  ];
  const { control, formState: { errors, isSubmitting }, handleSubmit, register } = useForm<EditUserFormValues>({
    defaultValues,
    mode: "onBlur",
    reValidateMode: "onChange",
    resolver: zodResolver(schema),
  });

  return (
    <form className="mx-auto w-full max-w-3xl" noValidate onSubmit={handleSubmit(onSubmit)}>
      <Card>
        <CardHeader>
          <CardTitle>{t("pages.userManagement.form.userDetails")}</CardTitle>
          <CardDescription>{t("pages.userManagement.form.editDetailsDescription")}</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-5">
          {serverError ? (
            <Alert variant="destructive">
              <CircleAlert aria-hidden="true" />
              <AlertTitle>{t("pages.userManagement.feedback.updateErrorTitle")}</AlertTitle>
              <AlertDescription>{serverError}</AlertDescription>
            </Alert>
          ) : null}

          <FieldGroup className="grid gap-4 md:grid-cols-2">
            <UserTextField autoComplete="given-name" autoFocus error={errors.firstName} id="edit-user-first-name" label={t("pages.userManagement.fields.firstName")} registration={register("firstName")} required />
            <UserTextField autoComplete="family-name" error={errors.lastName} id="edit-user-last-name" label={t("pages.userManagement.fields.lastName")} registration={register("lastName")} required />
            <UserTextField autoComplete="username" description={t("pages.userManagement.form.usernameReadOnly")} error={errors.username} id="edit-user-username" label={t("pages.userManagement.fields.username")} readOnly registration={register("username")} required />
            <UserTextField autoComplete="email" error={errors.email} id="edit-user-email" label={t("pages.userManagement.fields.email")} registration={register("email")} required type="email" />
            <UserTextField autoComplete="tel" description={t("pages.userManagement.form.mobileHelp")} error={errors.mobileNumber} id="edit-user-mobile" label={t("pages.userManagement.fields.mobile")} placeholder={t("pages.userManagement.placeholders.mobile")} registration={register("mobileNumber")} type="tel" />

            <Controller control={control} name="preferredLanguageCode" render={({ field }) => (
              <Field className="gap-1" data-invalid={Boolean(errors.preferredLanguageCode)}>
                <FieldLabel htmlFor="edit-user-language">{t("pages.userManagement.fields.preferredLanguage")}</FieldLabel>
                <Select
                  aria-label={t("pages.userManagement.fields.preferredLanguage")}
                  selectedKey={field.value}
                  onSelectionChange={(key) => field.onChange(String(key ?? "en-IN"))}
                >
                  <SelectTrigger id="edit-user-language" aria-invalid={Boolean(errors.preferredLanguageCode)}>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectGroup>
                      {languageOptions.map((language) => (
                        <SelectItem id={language.value} key={language.value}>{language.label}</SelectItem>
                      ))}
                    </SelectGroup>
                  </SelectContent>
                </Select>
                <FieldError>{errors.preferredLanguageCode?.message}</FieldError>
              </Field>
            )} />
          </FieldGroup>

          <FieldGroup className="grid gap-3 sm:grid-cols-2">
            <Controller control={control} name="isActive" render={({ field }) => (
              <FieldLabel>
                <Field orientation="horizontal" data-disabled={isSubmitting || undefined}>
                  <Switch aria-label={t("pages.userManagement.form.activeAccount")} isDisabled={isSubmitting} isSelected={field.value} onBlur={field.onBlur} onChange={field.onChange} />
                  <FieldContent>
                    <FieldTitle>{t("pages.userManagement.form.activeAccount")}</FieldTitle>
                    <FieldDescription>{t("pages.userManagement.form.activeAccountDescription")}</FieldDescription>
                  </FieldContent>
                </Field>
              </FieldLabel>
            )} />
            <Controller control={control} name="isSystemUser" render={({ field }) => (
              <FieldLabel>
                <Field orientation="horizontal" data-disabled>
                  <Switch aria-label={t("pages.userManagement.form.systemUser")} isDisabled isSelected={field.value} />
                  <FieldContent>
                    <FieldTitle>{t("pages.userManagement.form.systemUser")}</FieldTitle>
                    <FieldDescription>{t("pages.userManagement.form.systemUserDescription")}</FieldDescription>
                  </FieldContent>
                </Field>
              </FieldLabel>
            )} />
          </FieldGroup>
        </CardContent>
        <CardFooter className="flex-col-reverse gap-2 border-t sm:flex-row sm:justify-end">
          <Button className="w-full sm:w-auto" type="button" variant="outline" isDisabled={isSubmitting} onPress={onCancel}>{t("pages.userManagement.actions.cancel")}</Button>
          <Button className="w-full sm:w-auto" type="submit" isDisabled={isSubmitting}>
            {isSubmitting ? <Spinner data-icon="inline-start" aria-hidden="true" /> : <Save data-icon="inline-start" aria-hidden="true" />}
            {t(isSubmitting ? "pages.userManagement.actions.savingChanges" : "pages.userManagement.actions.saveChanges")}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
}
