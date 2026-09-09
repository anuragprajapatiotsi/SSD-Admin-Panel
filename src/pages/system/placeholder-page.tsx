import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { IconBarrierBlock } from "@tabler/icons-react";
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
    <section
      aria-label={localizedModuleName}
      className="flex h-full min-h-96 w-full"
    >
      <Empty className="min-h-96 rounded-xl border border-dashed border-border bg-card">
        <EmptyHeader className="gap-2">
          <EmptyMedia
            aria-hidden="true"
            className="mb-2 size-14 rounded-lg bg-muted"
            variant="icon"
          >
            <IconBarrierBlock className="size-5" stroke={1.75} />
          </EmptyMedia>
          <EmptyTitle>
            <h1 className="font-heading text-xl font-semibold tracking-tight">
              {t("placeholderPage.title")}
            </h1>
          </EmptyTitle>
          <EmptyDescription className="text-sm/relaxed">
            {t("placeholderPage.description")}
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </section>
  );
}
