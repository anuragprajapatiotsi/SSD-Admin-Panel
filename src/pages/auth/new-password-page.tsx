import { PasswordField } from "@/components/auth/password-field";
import { Button } from "@/components/ui/button";
import { FieldGroup } from "@/components/ui/field";
import { Spinner } from "@/components/ui/spinner";
import { passwordSchema } from "@/lib/password-policy";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, useWatch } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Navigate, useNavigate, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import { resetForgottenPassword } from "../../api/session.api";
import { RecoveryPageLayout } from "./recovery-page-layout";

const newPasswordSchema = z.object({
  password: passwordSchema,
  confirmPassword: z.string().min(1, "auth.newPassword.validation.confirmRequired"),
}).refine((values) => values.password === values.confirmPassword, {
  message: "auth.newPassword.validation.noMatch",
  path: ["confirmPassword"],
});

type NewPasswordFormValues = z.infer<typeof newPasswordSchema>;

export function NewPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t } = useTranslation("common");
  const resetToken = searchParams.get("token")?.trim();
  const form = useForm<NewPasswordFormValues>({
    defaultValues: { password: "", confirmPassword: "" },
    mode: "onSubmit",
    reValidateMode: "onChange",
    resolver: zodResolver(newPasswordSchema),
  });
  const passwordError = form.formState.errors.password?.message;
  const confirmPasswordError = form.formState.errors.confirmPassword?.message;
  const password = useWatch({ control: form.control, name: "password" });
  const confirmPassword = useWatch({ control: form.control, name: "confirmPassword" });

  async function handleSubmit(values: NewPasswordFormValues) {
    if (!resetToken) return;
    try {
      const response = await resetForgottenPassword(resetToken, values.password);
      if (!response.password_updated) throw new Error(t("passwordRecovery.errors.notUpdated"));
      toast.success(t("passwordRecovery.passwordUpdated"), { description: t("passwordRecovery.passwordUpdatedDescription") });
      navigate("/login", { replace: true });
    } catch (error) {
      toast.error(t("passwordRecovery.errors.reset"), { description: error instanceof Error ? error.message : t("passwordRecovery.errors.tryAgain") });
    }
  }

  if (!resetToken) {
    return <Navigate to="/forgot-password" replace />;
  }

  return (
    <RecoveryPageLayout
      backTo="/login"
      title={t("auth.newPassword.title")}
      description={t("auth.newPassword.description")}
    >
      <form onSubmit={form.handleSubmit(handleSubmit)} noValidate>
        <FieldGroup>
          <PasswordField
            id="new-password"
            label={t("auth.newPassword.createLabel")}
            error={passwordError ? t(passwordError) : undefined}
            showStrength
            value={password}
            inputProps={{
              autoComplete: "new-password",
              autoFocus: true,
              ...form.register("password"),
            }}
          />

          <PasswordField
            comparisonValue={password}
            id="confirm-new-password"
            label={t("auth.newPassword.confirmLabel")}
            error={confirmPasswordError ? t(confirmPasswordError) : undefined}
            value={confirmPassword}
            inputProps={{
              autoComplete: "new-password",
              ...form.register("confirmPassword"),
            }}
          />

          <Button className="w-full" size="lg" type="submit" isDisabled={form.formState.isSubmitting}>
            {form.formState.isSubmitting ? <Spinner data-icon="inline-start" aria-hidden="true" /> : null}{form.formState.isSubmitting ? t("passwordRecovery.updating") : t("auth.newPassword.submit")}
          </Button>
        </FieldGroup>
      </form>
    </RecoveryPageLayout>
  );
}
