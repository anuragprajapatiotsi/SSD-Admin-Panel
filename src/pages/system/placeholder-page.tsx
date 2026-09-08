import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@/components/ui/empty";
import { useTranslation } from "react-i18next";

type PlaceholderPageProps = {
  moduleName: string;
  moduleNameKey?: string;
};

export function PlaceholderPage({ moduleName, moduleNameKey }: PlaceholderPageProps) {
  const { t } = useTranslation("common");
  const localizedModuleName = moduleNameKey
    ? t(moduleNameKey, { defaultValue: moduleName })
    : moduleName;

  return (
    <div className="empty-screen">
      <Empty className="border-0">
        <EmptyHeader>
          <EmptyTitle>{localizedModuleName}</EmptyTitle>
          <EmptyDescription>{t("placeholderPage.description")}</EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  );
}
