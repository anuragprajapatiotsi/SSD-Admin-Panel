import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Dialog, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { zodResolver } from "@hookform/resolvers/zod";
import { CircleAlert, Eye, EyeOff, KeyRound } from "lucide-react";
import { useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import { useForm, type FieldError as HookFormFieldError, type UseFormRegisterReturn } from "react-hook-form";
import { z } from "zod";
import { setAuthUserPassword } from "../../api/auth-admin.api";

function createResetPasswordSchema(t: (key: string) => string) {
  return z.object({
    password: z.string().min(1, t("pages.userManagement.validation.newPasswordRequired")).min(8, t("pages.userManagement.validation.passwordMin")).max(128, t("pages.userManagement.validation.passwordMax")),
    confirmPassword: z.string().min(1, t("pages.userManagement.validation.confirmNewPasswordRequired")),
  }).refine((values) => values.password === values.confirmPassword, {
    message: t("pages.userManagement.validation.passwordMismatch"),
    path: ["confirmPassword"],
  });
}

type ResetPasswordValues = z.infer<ReturnType<typeof createResetPasswordSchema>>;

export function ResetPasswordDialog({ displayName, onClose, onSuccess, username }: {
  displayName: string;
  onClose: () => void;
  onSuccess: () => void;
  username: string;
}) {
  const { t } = useTranslation("common");
  const schema = useMemo(() => createResetPasswordSchema(t), [t]);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const [serverError, setServerError] = useState("");
  const { formState: { errors, isSubmitting }, handleSubmit, register } = useForm<ResetPasswordValues>({
    defaultValues: { password: "", confirmPassword: "" },
    mode: "onBlur",
    reValidateMode: "onChange",
    resolver: zodResolver(schema),
  });

  async function resetPassword(values: ResetPasswordValues) {
    setServerError("");
    try {
      await setAuthUserPassword(username, values.password);
      onSuccess();
    } catch (error) {
      setServerError(error instanceof Error ? error.message : t("pages.userManagement.feedback.passwordResetErrorDescription"));
    }
  }

  return (
    <Dialog
      className="sm:max-w-md"
      isDismissable={!isSubmitting}
      isOpen
      showCloseButton={!isSubmitting}
      onOpenChange={(isOpen) => {
        if (!isOpen && !isSubmitting) onClose();
      }}
    >
      <DialogHeader>
        <DialogTitle>{t("pages.userManagement.resetPassword.title")}</DialogTitle>
        <DialogDescription>
          {t("pages.userManagement.resetPassword.descriptionPrefix")} <strong className="font-medium text-foreground">{displayName}</strong>
          {" "}(<span className="font-mono text-foreground">{username}</span>).
        </DialogDescription>
      </DialogHeader>

      <form className="flex flex-col gap-4" noValidate onSubmit={handleSubmit(resetPassword)}>
        {serverError ? (
          <Alert variant="destructive">
            <CircleAlert aria-hidden="true" />
            <AlertTitle>{t("pages.userManagement.feedback.passwordResetErrorTitle")}</AlertTitle>
            <AlertDescription>{serverError}</AlertDescription>
          </Alert>
        ) : null}

        <FieldGroup className="gap-3">
          <ResetPasswordField error={errors.password} id="reset-user-password" isDisabled={isSubmitting} isVisible={showPassword} label={t("pages.userManagement.fields.newPassword")} onToggle={() => setShowPassword((value) => !value)} registration={register("password")} />
          <ResetPasswordField error={errors.confirmPassword} id="reset-user-password-confirmation" isDisabled={isSubmitting} isVisible={showConfirmation} label={t("pages.userManagement.fields.confirmPassword")} onToggle={() => setShowConfirmation((value) => !value)} registration={register("confirmPassword")} />
        </FieldGroup>

        <DialogFooter>
          <Button type="button" variant="outline" isDisabled={isSubmitting} onPress={onClose}>{t("pages.userManagement.actions.cancel")}</Button>
          <Button type="submit" isDisabled={isSubmitting}>
            {isSubmitting ? <Spinner data-icon="inline-start" aria-hidden="true" /> : <KeyRound data-icon="inline-start" aria-hidden="true" />}
            {t(isSubmitting ? "pages.userManagement.actions.resettingPassword" : "pages.userManagement.actions.resetPassword")}
          </Button>
        </DialogFooter>
      </form>
    </Dialog>
  );
}

function ResetPasswordField({ error, id, isDisabled, isVisible, label, onToggle, registration }: {
  error?: HookFormFieldError;
  id: string;
  isDisabled: boolean;
  isVisible: boolean;
  label: string;
  onToggle: () => void;
  registration: UseFormRegisterReturn;
}) {
  const { t } = useTranslation("common");
  const errorId = `${id}-error`;
  const helpId = `${id}-help`;
  return (
    <Field className="gap-1" data-disabled={isDisabled || undefined} data-invalid={Boolean(error)}>
      <FieldLabel htmlFor={id}>{label}<span className="text-destructive" aria-hidden="true"> *</span></FieldLabel>
      <InputGroup>
        <InputGroupInput id={id} type={isVisible ? "text" : "password"} autoComplete="new-password" disabled={isDisabled} aria-invalid={Boolean(error)} aria-describedby={error ? errorId : helpId} aria-required="true" {...registration} />
        <InputGroupAddon align="inline-end">
          <InputGroupButton size="icon-xs" aria-label={t(isVisible ? "pages.userManagement.actions.hidePassword" : "pages.userManagement.actions.showPassword")} isDisabled={isDisabled} onPress={onToggle}>
            {isVisible ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
      <FieldDescription id={helpId}>{t("pages.userManagement.form.passwordHelp")}</FieldDescription>
      <FieldError id={errorId}>{error?.message}</FieldError>
    </Field>
  );
}
