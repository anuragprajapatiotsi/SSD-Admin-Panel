import { Button } from "@/components/ui/button";
import { Field, FieldDescription, FieldError, FieldGroup } from "@/components/ui/field";
import { InputGroup, InputGroupAddon, InputGroupInput, InputGroupText } from "@/components/ui/input-group";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";
import { Spinner } from "@/components/ui/spinner";
import { zodResolver } from "@hookform/resolvers/zod";
import { IconMail } from "@tabler/icons-react";
import { useEffect, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { z } from "zod";

export function ProviderEmailForm({ busy, onSubmit }: { busy: boolean; onSubmit: (email: string) => Promise<void> }) {
  const { t } = useTranslation("ingestion");
  const form = useForm({ defaultValues: { email: "" }, resolver: zodResolver(z.object({ email: z.string().trim().email(t("providerAccess.invalidEmail")) })) });
  const error = form.formState.errors.email?.message;
  return (
    <form noValidate onSubmit={form.handleSubmit(({ email }) => onSubmit(email))}>
      <FieldGroup>
        <Field data-invalid={Boolean(error)} data-disabled={busy}>
          <InputGroup className="h-12">
            <InputGroupAddon><InputGroupText><IconMail aria-hidden="true" /></InputGroupText></InputGroupAddon>
            <InputGroupInput className="text-sm md:text-sm" type="email" autoComplete="email" placeholder={t("providerAccess.emailPlaceholder")} aria-label={t("providerAccess.email")} aria-describedby="provider-email-help provider-email-error" aria-invalid={Boolean(error)} disabled={busy} {...form.register("email")} />
          </InputGroup>
          <FieldDescription id="provider-email-help">{t("providerAccess.emailHelp")}</FieldDescription>
          <FieldError id="provider-email-error">{error}</FieldError>
        </Field>
        <Button type="submit" isDisabled={busy || form.formState.isSubmitting}>
          {busy ? <Spinner data-icon="inline-start" /> : null}{t("providerAccess.sendOtp")}
        </Button>
      </FieldGroup>
    </form>
  );
}

export function ProviderOtpForm({ email, resendAt, pending, onVerify, onResend, onBack }: {
  email: string; resendAt: number; pending: string | null;
  onVerify: (otp: string) => Promise<void>; onResend: () => Promise<void>; onBack: () => void;
}) {
  const { t } = useTranslation("ingestion");
  const [now, setNow] = useState(Date.now);
  const form = useForm({ defaultValues: { otp: "" }, resolver: zodResolver(z.object({ otp: z.string().regex(/^\d{6}$/, t("providerAccess.invalidOtp")) })) });
  const seconds = Math.max(0, Math.ceil((resendAt - now) / 1000));
  const busy = pending !== null;
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);
  return (
    <form noValidate onSubmit={form.handleSubmit(({ otp }) => onVerify(otp))}>
      <FieldGroup>
        <Field data-invalid={Boolean(form.formState.errors.otp)} data-disabled={busy}>
          <FieldDescription id="provider-otp-help" role="status">{t("providerAccess.otpHelp", { email })}</FieldDescription>
          <Controller name="otp" control={form.control} render={({ field }) => (
            <InputOTP {...field} containerClassName="w-full" maxLength={6} pattern="^[0-9]*$" inputMode="numeric" autoComplete="one-time-code" disabled={busy} aria-label={t("providerAccess.otp")} aria-describedby="provider-otp-help provider-otp-error" aria-invalid={Boolean(form.formState.errors.otp)}>
              <InputOTPGroup className="grid w-full max-w-sm grid-cols-6 gap-2 sm:gap-3">{Array.from({ length: 6 }, (_, index) => <InputOTPSlot className="h-14 w-full min-w-0 rounded-none border-0 border-b-2 text-lg first:rounded-none first:border-l-0 last:rounded-none data-[active=true]:ring-0" key={index} index={index} />)}</InputOTPGroup>
            </InputOTP>
          )} />
          <FieldError id="provider-otp-error">{form.formState.errors.otp?.message}</FieldError>
        </Field>
        <Button type="submit" isDisabled={busy || form.formState.isSubmitting}>
          {pending === "verify" ? <Spinner data-icon="inline-start" /> : null}{t("providerAccess.verify")}
        </Button>
        <div className="flex flex-wrap items-center justify-between gap-2">
          <Button type="button" variant="ghost" isDisabled={busy} onPress={onBack}>{t("providerAccess.changeEmail")}</Button>
          <Button type="button" variant="ghost" isDisabled={busy || seconds > 0} onPress={() => void onResend()}>
            {pending === "send" ? <Spinner data-icon="inline-start" /> : null}
            {seconds > 0 ? t("providerAccess.resendIn", { seconds }) : t("providerAccess.resend")}
          </Button>
        </div>
      </FieldGroup>
    </form>
  );
}
