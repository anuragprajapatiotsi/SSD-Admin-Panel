import { useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { useTranslation } from "react-i18next";
import { IconCalendar, IconCalendarDue, IconLock, IconLogout } from "@tabler/icons-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/common/loader";
import { ProviderEmailForm, ProviderOtpForm } from "@/components/data-collection/provider-verification-form";
import { ProviderAssignmentSelection } from "@/components/data-collection/provider-template-access";
import { ProviderSubmissionWorkspace } from "@/components/data-collection/provider-submission-workspace";
import { PublicPageHeader, PublicPageFooter } from "@/components/common/public-page-branding";
import { useProviderAccess } from "@/hooks/use-provider-access";
import { GuidedTourProvider, ScreenTour } from "@/components/common/guided-tour/guided-tour";
import { providerTours } from "@/components/data-collection/provider-tours";
import { AuthPageLayout } from "./auth-page-layout";
import { AuthPortalIntro } from "./auth-portal-intro";

export function RequestAccessPage() {
  const [params] = useSearchParams();
  const token = params.get("token") ?? "";
  // A different email link must never inherit another provider's session or assignments.
  return <RequestAccessFlow key={token} token={token} />;
}

function RequestAccessFlow({ token }: { token: string }) {
  const access = useProviderAccess(token);
  const verified = access.stage.kind === "verified" || access.stage.kind === "template";
  return <GuidedTourProvider userKey={verified ? access.tourUserKey : null} workflow="request-access">
    <RequestAccessScreens token={token} access={access} />
  </GuidedTourProvider>;
}

function RequestAccessScreens({ token, access }: { token: string; access: ReturnType<typeof useProviderAccess> }) {
  const { t, i18n } = useTranslation("ingestion");
  const { stage, preview, pending } = access;
  useEffect(() => {
    if (stage.kind !== "verified") return;
    const frame = window.requestAnimationFrame(() => window.scrollTo({ top: 0, behavior: "instant" }));
    return () => window.cancelAnimationFrame(frame);
  }, [stage.kind]);
  // Resolve the link and saved session before mounting either screen layout.
  if (access.loading) return <main className="min-h-svh bg-background"><Loader className="min-h-svh" text={t("providerAccess.loading")} /></main>;
  const title = stage.kind === "otp" ? t("providerAccess.verifyTitle")
    : stage.kind === "email" ? t("providerAccess.title") : t("providerAccess.templatesTitle");
  const blocked = !token || preview?.superseded || access.restoreFailed || (!access.loading && !preview);
  if (!blocked && stage.kind === "template") return <div className="flex min-h-svh flex-col bg-background">
    <ProviderSubmissionWorkspace key={`${stage.detail.assignment?.runItemCode}:${stage.mode}`} session={stage.session} detail={stage.detail} mode={stage.mode} onBack={access.back} onExpired={access.expire} onLogout={access.logout} onSubmittedBack={access.refreshAssignments} pending={pending !== null} sessionError={access.error} />
  </div>;
  if (!blocked && stage.kind === "verified") {
    const period = stage.detail?.dispatch?.requestPeriod ?? preview?.requestPeriod;
    const dueDate = stage.detail?.dispatch?.dueDate ?? preview?.dueDate;
    return <div className="flex min-h-svh flex-col bg-background" data-tour-scope="provider-assignments">
      <ScreenTour definition={providerTours.assignments} ready={Boolean(stage.assignments.length && !pending && !access.error)} />
      <PublicPageHeader actions={<Button data-tour="provider-logout" variant="outline" isDisabled={pending !== null} onPress={access.logout}><IconLogout data-icon="inline-start" />{t("providerAccess.logout")}</Button>} />
      <main id="public-main-content" tabIndex={-1} className="mx-auto flex min-h-svh w-full max-w-7xl flex-1 flex-col gap-6 px-5 py-8 sm:px-10" aria-labelledby="provider-assignments-title">
        <header className="flex flex-col gap-2"><h1 id="provider-assignments-title" className="text-xl font-semibold">{period || t("providerAccess.templatesTitle")}</h1><p className="text-sm text-muted-foreground">{t("providerAccess.verifiedDescription")}</p>{dueDate ? <p className="flex items-center gap-2 text-xs text-muted-foreground"><IconCalendarDue className="size-4" aria-hidden="true" />{t("providerAccess.dueDate")}: <time dateTime={dueDate}>{formatDueDate(dueDate, i18n.language)}</time></p> : null}</header>
        {access.error ? <Alert variant="destructive"><AlertDescription className="flex items-center justify-between gap-3">{access.error}<Button variant="outline" isDisabled={pending !== null} onPress={() => void access.refreshAssignments()}>{t("providerAccess.retry")}</Button></AlertDescription></Alert> : null}
        {!stage.detail && pending ? <Loader text={t("providerAccess.loading")} /> : <ProviderAssignmentSelection assignments={stage.assignments} session={stage.session} detail={stage.detail} pending={pending !== null} onOpen={access.openAssignment} onExpired={access.expire} />}
      </main>
      <PublicPageFooter />
    </div>;
  }
  return (
    <AuthPageLayout labelledBy="request-access-title" intro={<AuthPortalIntro content={{ title: t("providerAccess.introTitle"), description: t("providerAccess.introDescription"), stepsLabel: t("providerAccess.introSteps"), steps: [t("providerAccess.introVerify"), t("providerAccess.introPrepare"), t("providerAccess.introSubmit")], footer: t("providerAccess.introFooter") }} />}>
      <div className="flex flex-col gap-5">
        <header className="flex items-start gap-3">
          <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary" aria-hidden="true"><IconLock className="size-5" /></span>
          <div className="flex min-w-0 flex-col gap-1.5">
            <h2 className="text-xl font-semibold tracking-tight" id="request-access-title">{title}</h2>
            <p className="text-xs text-muted-foreground">{stage.kind === "email" || stage.kind === "otp" ? t("providerAccess.description") : t("providerAccess.verifiedDescription")}</p>
          </div>
        </header>
        {blocked ? (
          <Alert variant="destructive">
            <AlertDescription className="flex flex-col gap-3">
              {preview?.superseded ? preview.message || t("providerAccess.superseded") : access.error || t("providerAccess.linkError")}
              {token && !preview?.superseded ? <Button variant="outline" onPress={() => window.location.reload()}>{t("providerAccess.retry")}</Button> : null}
            </AlertDescription>
          </Alert>
        ) : (
          <>
            {preview?.requestPeriod || preview?.dueDate ? (
              <dl className="grid grid-cols-1 gap-4 rounded-lg bg-primary/5 p-4 text-xs sm:grid-cols-2">
                {preview.requestPeriod ? (
                  <div className="flex min-w-0 flex-col gap-2">
                    <dt className="flex items-center gap-2 text-muted-foreground"><IconCalendar className="size-4 shrink-0 text-primary" aria-hidden="true" />{t("providerAccess.period")}</dt>
                    <dd className="pl-6 text-sm font-semibold break-words">{preview.requestPeriod}</dd>
                  </div>
                ) : null}
                {preview.dueDate ? (
                  <div className="flex min-w-0 flex-col gap-2">
                    <dt className="flex items-center gap-2 text-muted-foreground"><IconCalendarDue className="size-4 shrink-0 text-primary" aria-hidden="true" />{t("providerAccess.dueDate")}</dt>
                    <dd className="pl-6 text-sm font-semibold"><time dateTime={preview.dueDate}>{formatDueDate(preview.dueDate, i18n.resolvedLanguage ?? i18n.language)}</time></dd>
                  </div>
                ) : null}
              </dl>
            ) : null}
            {access.error ? <Alert variant="destructive"><AlertDescription>{access.error}</AlertDescription></Alert> : null}
            {stage.kind === "email" ? <ProviderEmailForm busy={pending !== null} onSubmit={access.sendOtp} /> : null}
            {stage.kind === "otp" ? <ProviderOtpForm key={stage.resendAt} email={stage.email} resendAt={stage.resendAt} pending={pending} onVerify={access.verify} onResend={() => access.sendOtp(stage.email)} onBack={access.back} /> : null}
          </>
        )}
      </div>
    </AuthPageLayout>
  );
}

function formatDueDate(value: string, locale: string) {
  // Preserve date-only deadlines without shifting them across time zones.
  const dateOnly = /^\d{4}-\d{2}-\d{2}$/.test(value);
  const date = new Date(dateOnly ? `${value}T00:00:00Z` : value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat(locale, { day: "numeric", month: "short", year: "numeric", ...(dateOnly ? { timeZone: "UTC" } : {}) }).format(date);
}
