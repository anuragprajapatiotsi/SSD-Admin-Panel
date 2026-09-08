import { useTranslation } from "react-i18next";

export function AuthPortalIntro({ content }: { content?: { title: string; description: string; stepsLabel: string; steps: string[]; footer: string } }) {
  const { t } = useTranslation("common");

  return (
    <section className="relative flex min-w-0 flex-col justify-between overflow-hidden bg-gradient-to-br from-slate-950 via-blue-950 to-primary p-9 text-primary-foreground md:min-h-80 md:p-10 lg:p-16" aria-labelledby="portal-title">
      <div className="pointer-events-none absolute -top-36 -left-28 size-72 rounded-full border-[34px] border-white/10" aria-hidden="true" />
      <div className="pointer-events-none absolute -right-44 -bottom-44 size-88 rounded-full border-[34px] border-white/10" aria-hidden="true" />
      <div className="relative">
        <div className="mb-7 inline-flex w-fit items-center gap-3 border-b border-white/20 pb-3.5">
          <img className="h-12 w-auto brightness-0 invert" src="https://upload.wikimedia.org/wikipedia/commons/5/55/Emblem_of_India.svg" alt="" aria-hidden="true" />
          <div className="grid gap-1"><strong className="text-lg leading-none">SSD</strong><span className="text-xs font-semibold text-blue-100">{t("auth.portal.division")}</span></div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight lg:text-4xl" id="portal-title">{content?.title ?? t("auth.portal.title")}</h1>
        <p className="mt-4 max-w-xl text-sm leading-6 text-blue-100">{content?.description ?? t("auth.portal.description")}</p>
        {content ? <ol className="mt-7 grid gap-4 text-sm" aria-label={content.stepsLabel}>
          {content.steps.map((step, index) => <li key={index} className="flex items-center gap-3"><span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary-foreground/15 text-xs" aria-hidden="true">{index + 1}</span>{step}</li>)}
        </ol> : <ul className="mt-7 grid gap-3 text-xs md:grid-cols-3 lg:grid-cols-1" aria-label={t("auth.portal.benefitsLabel")}>
          <li className="flex items-center gap-2.5"><span className="grid size-6 place-items-center rounded-full bg-white/15" aria-hidden="true">✓</span> {t("auth.portal.benefitAccess")}</li>
          <li className="flex items-center gap-2.5"><span className="grid size-6 place-items-center rounded-full bg-white/15" aria-hidden="true">✓</span> {t("auth.portal.benefitValidation")}</li>
          <li className="flex items-center gap-2.5"><span className="grid size-6 place-items-center rounded-full bg-white/15" aria-hidden="true">✓</span> {t("auth.portal.benefitReporting")}</li>
        </ul>}
      </div>
      <div className="relative mt-10 grid gap-1"><strong className="text-sm">{t("auth.portal.official")}</strong><span className="text-xs text-blue-200">{content?.footer ?? t("auth.portal.governmentWorkspace")}</span></div>
    </section>
  );
}
