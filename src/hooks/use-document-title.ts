import { useEffect } from "react";
import { useTranslation } from "react-i18next";

export function useDocumentTitle(pageName?: string) {
  const { t } = useTranslation("common");
  const applicationName = t("government.ministry");

  useEffect(() => {
    const normalizedPageName = pageName?.trim();
    document.title = normalizedPageName
      ? `${normalizedPageName} | ${applicationName}`
      : applicationName;
  }, [applicationName, pageName]);
}
