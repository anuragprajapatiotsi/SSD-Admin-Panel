import i18n from "i18next";
import { initReactI18next } from "react-i18next";

type SupportedLocale = "en-IN" | "hi-IN";

const DEFAULT_LOCALE: SupportedLocale = "en-IN";

function normalizeLocale(locale: string): SupportedLocale {
  return locale === "hi-IN" ? "hi-IN" : DEFAULT_LOCALE;
}

async function loadLocale(locale: SupportedLocale) {
  if (
    i18n.hasResourceBundle(locale, "common")
    && i18n.hasResourceBundle(locale, "accessibility")
    && i18n.hasResourceBundle(locale, "ingestion")
  ) return;

  const [common, accessibility, ingestion] = locale === "hi-IN"
    ? await Promise.all([
        import("./locales/hi/common.json"),
        import("./locales/hi/accessibility.json"),
        import("./locales/hi/ingestion.json"),
      ])
    : await Promise.all([
        import("./locales/en/common.json"),
        import("./locales/en/accessibility.json"),
        import("./locales/en/ingestion.json"),
      ]);

  i18n.addResourceBundle(locale, "common", common.default, true, true);
  i18n.addResourceBundle(locale, "accessibility", accessibility.default, true, true);
  i18n.addResourceBundle(locale, "ingestion", ingestion.default, true, true);
}

const initialLocale = normalizeLocale(window.localStorage.getItem("ssd_selected_locale") || DEFAULT_LOCALE);

await i18n.use(initReactI18next).init({
  lng: initialLocale,
  fallbackLng: DEFAULT_LOCALE,
  supportedLngs: [DEFAULT_LOCALE, "hi-IN"],
  defaultNS: "common",
  interpolation: { escapeValue: false },
  returnNull: false,
  react: { useSuspense: false },
});

await loadLocale(initialLocale);
document.documentElement.lang = initialLocale;

export async function changeAppLanguage(locale: string) {
  const normalizedLocale = normalizeLocale(locale);
  window.localStorage.setItem("ssd_selected_locale", normalizedLocale);
  await loadLocale(normalizedLocale);
  await i18n.changeLanguage(normalizedLocale);
  document.documentElement.lang = normalizedLocale;
}

export { i18n };
