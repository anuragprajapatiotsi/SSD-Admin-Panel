import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import { z } from "zod";
import { requestForgotPasswordLink } from "../../api/session.api";
import { RecoveryPageLayout } from "./recovery-page-layout";

const forgotPasswordSchema = z.object({
  email: z.string()
    .trim()
    .min(1, "auth.forgot.validation.required")
    .email("auth.forgot.validation.invalid"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

const RESET_LINK_COOLDOWN_SECONDS = 60;

export function ForgotPasswordPage() {
  const { t } = useTranslation("common");
  const [cooldownSeconds, setCooldownSeconds] = useState(0);
  const form = useForm<ForgotPasswordFormValues>({
    defaultValues: { email: "" },
    mode: "onSubmit",
    reValidateMode: "onChange",
    resolver: zodResolver(forgotPasswordSchema),
  });
  const emailError = form.formState.errors.email?.message;

  useEffect(() => {
    if (cooldownSeconds === 0) return;

    const timer = window.setTimeout(() => {
      setCooldownSeconds((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [cooldownSeconds]);

  async function handleSubmit(values: ForgotPasswordFormValues) {
    try {
      const response = await requestForgotPasswordLink(values.email);
      if (!response.link_sent) throw new Error(t("auth.forgot.feedback.linkNotSent"));
      setCooldownSeconds(RESET_LINK_COOLDOWN_SECONDS);
      toast.success(t("auth.forgot.feedback.linkSent"), { description: t("auth.forgot.feedback.linkSentDescription", { email: values.email }) });
    } catch (error) {
      toast.error(t("auth.forgot.feedback.sendLinkError"), { description: error instanceof Error ? error.message : t("passwordRecovery.errors.tryAgain") });
    }
  }

  return (
    <RecoveryPageLayout
      backTo="/login"
      title={t("auth.forgot.title")}
      description={t("auth.forgot.description")}
    >
      <form onSubmit={form.handleSubmit(handleSubmit)} noValidate>
        <FieldGroup>
          <Field data-invalid={Boolean(emailError)}>
            <FieldLabel htmlFor="forgot-password-email">
              {t("auth.forgot.emailLabel")} <span aria-hidden="true">*</span>
            </FieldLabel>
            <Input
              className="h-11"
              id="forgot-password-email"
              type="email"
              autoComplete="email"
              autoFocus
              placeholder={t("auth.forgot.emailPlaceholder")}
              aria-required="true"
              aria-invalid={Boolean(emailError)}
              aria-describedby={emailError ? "forgot-password-email-error" : "forgot-password-email-help"}
              {...form.register("email")}
            />
            <FieldDescription id="forgot-password-email-help">{t("auth.forgot.emailHelp")}</FieldDescription>
            <FieldError id="forgot-password-email-error">{emailError ? t(emailError) : undefined}</FieldError>
          </Field>

          <Button className="w-full" size="lg" type="submit" isDisabled={form.formState.isSubmitting || cooldownSeconds > 0}>
            {form.formState.isSubmitting ? <Spinner data-icon="inline-start" aria-hidden="true" /> : null}
            {form.formState.isSubmitting
              ? t("auth.forgot.sending")
              : cooldownSeconds > 0
                ? t("auth.forgot.resendCountdown", { seconds: cooldownSeconds })
                : t("auth.forgot.submit")}
          </Button>
        </FieldGroup>
      </form>
    </RecoveryPageLayout>
  );
}
