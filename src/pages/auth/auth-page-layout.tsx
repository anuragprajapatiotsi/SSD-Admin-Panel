import { LanguageSwitcher } from "@/components/language-switcher";
import type { ReactNode } from "react";
import { AuthPortalIntro } from "./auth-portal-intro";

export function AuthPageLayout({ children, labelledBy, intro }: { children: ReactNode; labelledBy: string; intro?: ReactNode }) {
  return (
    <main className="min-h-screen w-full bg-muted/40 text-foreground lg:h-screen lg:overflow-hidden">
      <section className="grid min-h-screen w-full lg:h-full lg:grid-cols-[minmax(0,1.05fr)_minmax(430px,0.95fr)]">
        {intro ?? <AuthPortalIntro />}
        <section className="relative grid min-w-0 place-items-center overflow-y-auto bg-background px-6 py-16 sm:px-10 lg:px-16" aria-labelledby={labelledBy}>
          <div className="absolute right-4 top-4 sm:right-6"><LanguageSwitcher /></div>
          <div className="w-full min-w-0 max-w-md">{children}</div>
        </section>
      </section>
    </main>
  );
}
