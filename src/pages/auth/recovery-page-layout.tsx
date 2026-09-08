import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { IconArrowLeft } from "@tabler/icons-react";
import { LockKeyhole } from "lucide-react";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { AuthPortalIntro } from "./auth-portal-intro";

type RecoveryPageLayoutProps = {
  backTo: string;
  children: ReactNode;
  description: ReactNode;
  title: string;
};

export function RecoveryPageLayout({
  backTo,
  children,
  description,
  title,
}: RecoveryPageLayoutProps) {
  const navigate = useNavigate();
  const { t } = useTranslation("common");

  return (
    <main className="min-h-screen w-full bg-muted/40 text-foreground lg:h-screen lg:overflow-hidden">
      <section className="grid min-h-screen w-full lg:h-full lg:grid-cols-[minmax(0,1.05fr)_minmax(430px,0.95fr)]">
        <AuthPortalIntro />
        <section className="relative grid place-items-center bg-background px-6 py-16 sm:px-10 lg:px-16" aria-labelledby="recovery-title">
          <div className="absolute right-4 top-4 sm:right-6">
            <LanguageSwitcher />
          </div>
          <div className="w-full max-w-md">
            <Button className="w-fit" variant="outline" size="sm" type="button" onPress={() => navigate(backTo)}>
              <IconArrowLeft data-icon="inline-start" aria-hidden="true" />
              {t("auth.recovery.back")}
            </Button>
            <div className="mb-7 mt-6 flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary" aria-hidden="true"><LockKeyhole /></span>
              <div><h2 className="text-xl font-semibold tracking-tight" id="recovery-title">{title}</h2><p className="mt-1.5 text-xs text-muted-foreground">{description}</p></div>
            </div>
            <div>{children}</div>
          </div>
        </section>
      </section>
    </main>
  );
}
