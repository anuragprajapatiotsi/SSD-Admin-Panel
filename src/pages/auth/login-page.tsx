import { Button } from "@/components/ui/button";
import { Loader } from "@/components/common/loader";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Field, FieldError, FieldLabel } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput } from "@/components/ui/input-group";
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Eye,
  EyeOff,
  LoaderCircle,
  LockKeyhole,
  Mail,
  RefreshCw,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { useTranslation } from "react-i18next";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { z } from "zod";
import {
  getCaptchaChallenge,
  getPostLoginPath,
  loadCurrentUser,
  login,
  type CaptchaChallengeResponse,
} from "../../api/session.api";
import { AuthPageLayout } from "./auth-page-layout";

const loginSchema = z.object({
  loginIdentifier: z.string().trim().min(1, "pages.login.validation.identifierRequired"),
  password: z.string().min(1, "pages.login.validation.passwordRequired"),
  captchaResponse: z.string().trim().min(1, "pages.login.captcha.required"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export function LoginPage() {
  const navigate = useNavigate();
  const { t } = useTranslation("common");
  const [captcha, setCaptcha] = useState<CaptchaChallengeResponse | null>(null);
  const [isCaptchaLoading, setIsCaptchaLoading] = useState(true);
  const [isCaptchaExpired, setIsCaptchaExpired] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const captchaRequestId = useRef(0);
  const { clearErrors, formState: { errors, isSubmitting }, handleSubmit, register, resetField, setError } = useForm<LoginFormValues>({
    defaultValues: { loginIdentifier: "", password: "", captchaResponse: "" },
    mode: "onSubmit",
    reValidateMode: "onChange",
    resolver: zodResolver(loginSchema),
  });

  const loadCaptcha = useCallback(async () => {
    const requestId = ++captchaRequestId.current;
    setIsCaptchaLoading(true);
    clearErrors("captchaResponse");
    resetField("captchaResponse");
    setIsCaptchaExpired(false);
    try {
      const challenge = await getCaptchaChallenge();
      if (requestId !== captchaRequestId.current) return;
      setCaptcha(challenge);
    } catch {
      if (requestId !== captchaRequestId.current) return;
      setCaptcha(null);
      setError("captchaResponse", { type: "server", message: "pages.login.captcha.loadError" });
    } finally {
      if (requestId === captchaRequestId.current) setIsCaptchaLoading(false);
    }
  }, [clearErrors, resetField, setError]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadCaptcha(), 0);
    return () => {
      window.clearTimeout(timer);
      captchaRequestId.current += 1;
    };
  }, [loadCaptcha]);

  useEffect(() => {
    if (!captcha) return;
    const timeout = window.setTimeout(() => {
      setIsCaptchaExpired(true);
      resetField("captchaResponse");
      void loadCaptcha();
    }, Math.max(1, captcha.expires_in_seconds) * 1000);
    return () => window.clearTimeout(timeout);
  }, [captcha, loadCaptcha, resetField]);

  async function submitLogin(values: LoginFormValues) {
    if (!captcha || isCaptchaExpired) {
      setError("captchaResponse", { type: "server", message: "pages.login.captcha.expired" });
      return;
    }
    try {
      const response = await login({
        login_identifier: values.loginIdentifier.trim(),
        password: values.password,
        captcha_challenge_id: captcha.challenge_id,
        captcha_response: values.captchaResponse.trim(),
      });
      const fallbackRoleUnitCode = response.roles.find(
        (role) => role.unit_code,
      )?.unit_code;
      const currentUser = await loadCurrentUser().catch(() => ({
        displayName:
          response.user_profile.display_name ??
          response.user_profile.username ??
          "SSD User",
        email: response.user_profile.email ?? "",
        unitCode:
          response.user_profile.owning_unit_code ??
          response.user_profile.default_unit_code ??
          response.user_profile.unit_code ??
          fallbackRoleUnitCode,
        defaultUnitCode: response.user_profile.default_unit_code,
        roles: response.roles.map(
          (role) =>
            role.role_code ??
            role.code ??
            role.role_name ??
            role.name ??
            "USER",
        ),
      }));
      navigate(getPostLoginPath(currentUser.roles), { replace: true });
    } catch (error) {
      toast.error(t("auth.login.unsuccessful"), {
        description: getLoginErrorMessage(error, {
          captcha: t("pages.login.captcha.incorrect"),
          credentials: t("pages.login.invalidCredentials"),
          generic: t("pages.login.genericError"),
        }),
      });
      await loadCaptcha();
    }
  }

  // React Hook Form invokes this callback only after the browser submits the form.
  // eslint-disable-next-line react-hooks/refs
  const submitForm = handleSubmit(submitLogin);

  return (
    <AuthPageLayout labelledBy="sign-in-title">
            <div className="mb-7 flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary" aria-hidden="true">
                <LockKeyhole size={20} />
              </span>
              <div>
                <h2 className="text-xl font-semibold tracking-tight" id="sign-in-title">{t("auth.login.title")}</h2>
                <p className="mt-1.5 text-xs text-muted-foreground">{t("auth.login.description")}</p>
              </div>
            </div>
            <form
              className="grid gap-3"
              id="sign-in-form"
              noValidate
              onSubmit={submitForm}
            >
              <Field className="mt-1 gap-1" data-invalid={Boolean(errors.loginIdentifier)}>
                <FieldLabel htmlFor="login-identifier">
                  {t("auth.login.emailLabel")} <span aria-hidden="true">*</span>
                </FieldLabel>
                <InputGroup className="h-11">
                  <InputGroupAddon align="inline-start">
                    <Mail aria-hidden="true" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="login-identifier"
                    autoComplete="username"
                    placeholder={t("auth.login.emailPlaceholder")}
                    aria-required="true"
                    aria-invalid={Boolean(errors.loginIdentifier)}
                    aria-describedby={errors.loginIdentifier ? "login-identifier-error" : undefined}
                    {...register("loginIdentifier")}
                  />
                </InputGroup>
                <FieldError id="login-identifier-error">{errors.loginIdentifier?.message ? t(errors.loginIdentifier.message) : undefined}</FieldError>
              </Field>
              <Field className="mt-1 gap-1" data-invalid={Boolean(errors.password)}>
                <FieldLabel htmlFor="login-password">
                  {t("auth.login.passwordLabel")} <span aria-hidden="true">*</span>
                </FieldLabel>
                <InputGroup className="h-11">
                  <InputGroupAddon align="inline-start">
                    <LockKeyhole aria-hidden="true" />
                  </InputGroupAddon>
                  <InputGroupInput
                    id="login-password"
                    autoComplete="current-password"
                    placeholder={t("auth.login.passwordPlaceholder")}
                    aria-required="true"
                    aria-invalid={Boolean(errors.password)}
                    aria-describedby={errors.password ? "login-password-error" : undefined}
                    type={showPassword ? "text" : "password"}
                    {...register("password")}
                  />
                  <InputGroupAddon align="inline-end">
                    <InputGroupButton
                      className="active:!translate-y-0"
                      size="icon-xs"
                      aria-label={t(showPassword ? "auth.password.hide" : "auth.password.show")}
                      onPress={() => setShowPassword((current) => !current)}
                    >
                      {showPassword ? <EyeOff aria-hidden="true" /> : <Eye aria-hidden="true" />}
                    </InputGroupButton>
                  </InputGroupAddon>
                </InputGroup>
                <FieldError id="login-password-error">{errors.password?.message ? t(errors.password.message) : undefined}</FieldError>
              </Field>
              <Field className="mt-1 gap-2" data-invalid={Boolean(errors.captchaResponse)}>
                <FieldLabel htmlFor="login-captcha-response">
                  {t("pages.login.captcha.label")} <span aria-hidden="true">*</span>
                </FieldLabel>
                <Card className="gap-0 py-0 [--card-spacing:0px]">
                  <CardContent className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] items-stretch gap-0 px-0 py-0">
                    <div className="relative flex min-w-0 items-center justify-center overflow-hidden bg-muted/20" aria-busy={isCaptchaLoading}>
                      {captcha?.challenge_image ? (
                        <img
                          className="absolute inset-0 block size-full object-fill"
                          src={captcha.challenge_image}
                          alt={t("pages.login.captcha.imageAlt")}
                        />
                      ) : !isCaptchaLoading ? (
                        <span className="text-xs text-muted-foreground">{t("pages.login.captcha.unavailable")}</span>
                      ) : null}
                      {isCaptchaLoading ? (
                        <Loader
                          className="absolute inset-0 min-h-0 bg-background/90 px-2 text-xs"
                          text={t("pages.login.captcha.loading")}
                        />
                      ) : null}
                    </div>
                    <Separator orientation="vertical" />
                    <div className="flex min-w-0 flex-col gap-2 py-2">
                    <TooltipTrigger>
                      <Button
                        type="button"
                        variant="secondary"
                        size="sm"
                        className="mx-2 h-auto min-h-7 self-end whitespace-normal"
                        isDisabled={isCaptchaLoading || isSubmitting}
                        onPress={() => void loadCaptcha()}
                        aria-label={t("pages.login.captcha.refresh")}
                      >
                        <RefreshCw className={isCaptchaLoading ? "animate-spin motion-reduce:animate-none" : undefined} aria-hidden="true" />
                        {t("pages.login.captcha.refresh")}
                      </Button>
                      <Tooltip>{t("pages.login.captcha.refresh")}</Tooltip>
                    </TooltipTrigger>
                    <Separator />
                    <div className="px-2">
                  <Input
                    className="w-full min-w-0 text-sm"
                    id="login-captcha-response"
                    autoComplete="off"
                    autoCapitalize="characters"
                    spellCheck={false}
                    maxLength={20}
                    placeholder={t("pages.login.captcha.placeholder")}
                    disabled={isCaptchaLoading || !captcha || isCaptchaExpired || isSubmitting}
                    aria-required="true"
                    aria-invalid={Boolean(errors.captchaResponse)}
                    aria-describedby={errors.captchaResponse ? "login-captcha-error" : undefined}
                    {...register("captchaResponse")}
                    onChange={(event) => {
                      const input = event.currentTarget;
                      const { selectionStart, selectionEnd } = input;
                      input.value = input.value.toUpperCase();
                      input.setSelectionRange(selectionStart, selectionEnd);
                      void register("captchaResponse").onChange(event);
                    }}
                  />
                    </div>
                    </div>
                  </CardContent>
                </Card>
                <FieldError id="login-captcha-error">{errors.captchaResponse?.message ? t(errors.captchaResponse.message) : undefined}</FieldError>
              </Field>
              <div className="my-1 flex justify-end text-xs">
                <Link className="font-semibold text-primary hover:underline!" to="/forgot-password">{t("auth.login.forgotPassword")}</Link>
              </div>
              <Button
                className="h-11 w-full text-sm! font-semibold!"
                size="lg"
                disabled={isSubmitting || isCaptchaLoading || !captcha || isCaptchaExpired}
                type="submit"
              >
                {isSubmitting ? <LoaderCircle className="animate-spin" data-icon="inline-start" aria-hidden="true" /> : null}
                {t("auth.login.signIn")}
              </Button>
            </form>
    </AuthPageLayout>
  );
}

function getLoginErrorMessage(error: unknown, messages: { captcha: string; credentials: string; generic: string }): string {
  const message = error instanceof Error ? error.message : "";
  if (message.toLowerCase().includes("captcha")) return messages.captcha;
  if (message.toLowerCase().includes("invalid"))
    return messages.credentials;
  return messages.generic;
}
