import { setSelectedLocale } from "@/api/session.api";
import { Button } from "@/components/ui/button";
import { changeAppLanguage } from "@/i18n";
import { IconLanguage } from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

type LanguageSwitcherProps = {
  onLanguageChange?: (locale: string) => void;
};

export function LanguageSwitcher({ onLanguageChange }: LanguageSwitcherProps) {
  const { i18n, t } = useTranslation("common");
  const currentLocale = i18n.resolvedLanguage ?? i18n.language;
  const nextLocale = currentLocale.startsWith("hi") ? "en-IN" : "hi-IN";
  const nextLanguage = t(nextLocale === "hi-IN" ? "language.hindi" : "language.english");

  async function handleLanguageChange() {
    setSelectedLocale(nextLocale);
    await changeAppLanguage(nextLocale);
    onLanguageChange?.(nextLocale);
  }

  return (
    <Button
      variant="ghost"
      size="default"
      aria-label={t("language.switchTo", { language: nextLanguage })}
      onPress={() => void handleLanguageChange()}
    >
      <IconLanguage data-icon="inline-start" aria-hidden="true" />
      <span>{nextLanguage}</span>
    </Button>
  );
}
