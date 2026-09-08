import { LanguageSwitcher } from "@/components/language-switcher";
import { NationalEmblem } from "@/components/branding/national-emblem";
import { AccessibilityControl } from "@/components/common/accessibility-control";
import { ExternalLink } from "@/components/common/external-link";
import { useTranslation } from "react-i18next";
import type { ReactNode } from "react";

export function PublicPageHeader({ actions }: { actions?: ReactNode }) {
  const { t } = useTranslation("common");
  return <>
    <div className="h-1 shrink-0 bg-linear-to-r from-brand-saffron via-brand-white to-brand-green" aria-hidden="true" />
    <div className="flex shrink-0 flex-wrap items-center justify-between gap-x-4 gap-y-1 border-b bg-muted px-5 py-2 text-xs text-foreground sm:px-10">
      <ExternalLink href="https://www.india.gov.in/" className="h-auto gap-2 px-0"><img src="https://upload.wikimedia.org/wikipedia/en/4/41/Flag_of_India.svg" className="h-4 w-6 shrink-0" alt="" aria-hidden="true" />{t("government.india")}</ExternalLink>
      <a href="#public-main-content" className="rounded-sm underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring" onClick={() => document.getElementById("public-main-content")?.focus({ preventScroll: true })}>{t("government.skipToMain")}</a>
    </div>
    <header className="flex shrink-0 flex-wrap items-center justify-between gap-4 border-b bg-card px-5 py-4 sm:px-10">
      <a href={window.location.href} className="flex min-w-0 items-center gap-3 rounded-sm text-foreground no-underline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ring" aria-label={`${t("government.identityLabel")} — ${t("government.reloadPage")}`} title={t("government.reloadPage")} onClick={(event) => { event.preventDefault(); window.location.reload(); }}>
        <NationalEmblem className="h-12 w-auto shrink-0 contrast-125 dark:invert" alt="" aria-hidden="true" />
        <div className="flex min-w-0 flex-col gap-1"><strong className="text-sm">{t("government.india")}</strong><span className="text-xs text-muted-foreground">{t("government.ministry")}</span></div>
      </a>
      <div className="flex items-center gap-3"><div data-tour="provider-language" className="flex"><LanguageSwitcher /></div><AccessibilityControl />{actions}</div>
    </header>
  </>;
}

export function PublicPageFooter() {
  const { t } = useTranslation("common");
  return <footer className="flex shrink-0 flex-col items-center gap-1 px-5 py-6 text-center">
    <p className="text-sm font-semibold text-primary">{t("auth.portal.title")}</p>
    <p className="text-xs text-muted-foreground">{t("auth.portal.division")} · {t("auth.portal.governmentWorkspace")}</p>
  </footer>;
}
