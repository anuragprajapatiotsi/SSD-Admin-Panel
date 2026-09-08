import { IconAlertCircle, IconAt, IconBuilding, IconKey, IconLanguage, IconMail, IconShieldCheck } from "@tabler/icons-react";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import { getLocalCurrentUser, loadCurrentUser, type CurrentUser } from "@/api/session.api";
import { Loader } from "@/components/common/loader";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CustomTabs } from "@/components/common/custom-tabs";

function DetailRow({ icon, label, value }: { icon: ReactNode; label: string; value?: string }) {
  const { t } = useTranslation("common");
  return (
    <div className="flex min-w-0 items-start gap-3 rounded-lg border bg-background p-4">
      <span className="flex size-9 shrink-0 items-center justify-center rounded-md bg-muted text-muted-foreground" aria-hidden="true">{icon}</span>
      <div className="min-w-0">
        <dt className="text-xs font-medium text-muted-foreground">{label}</dt>
        <dd className="mt-1 break-words text-sm font-semibold text-foreground">{value?.trim() || t("account.profile.notAvailable")}</dd>
      </div>
    </div>
  );
}

function formatRole(role?: string) {
  return role?.toLowerCase().split("_").map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(" ");
}

export function AccountProfilePage() {
  const { t, i18n } = useTranslation("common");
  const navigate = useNavigate();
  const [user, setUser] = useState<CurrentUser>(() => getLocalCurrentUser());
  const [isUpdating, setIsUpdating] = useState(true);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let active = true;
    loadCurrentUser()
      .then((profile) => { if (active) setUser(profile); })
      .catch(() => { if (active) setHasError(true); })
      .finally(() => { if (active) setIsUpdating(false); });
    return () => { active = false; };
  }, []);

  const initials = useMemo(() => {
    const names = user.displayName.trim().split(/\s+/).filter(Boolean);
    return (names.length > 1 ? `${names[0][0]}${names.at(-1)?.[0]}` : names[0]?.slice(0, 2) || "U").toUpperCase();
  }, [user.displayName]);
  const language = useMemo(() => {
    if (!user.preferredLocale) return undefined;
    try { return new Intl.DisplayNames([i18n.language], { type: "language" }).of(user.preferredLocale) ?? user.preferredLocale; }
    catch { return user.preferredLocale.toUpperCase(); }
  }, [i18n.language, user.preferredLocale]);
  const role = formatRole(user.roles[0]);
  const accessScope = user.unitCode || (user.roles.some((item) => item.toUpperCase() === "SUPER_ADMIN") ? t("account.profile.allUnits") : undefined);

  return (
    <main className="min-h-0 flex-1 overflow-auto p-4 sm:p-5 lg:p-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-5">
        <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-heading text-2xl font-semibold tracking-tight text-primary">{t("account.profile.title")}</h1>
            <p className="mt-1 text-sm text-muted-foreground">{t("account.profile.description")}</p>
          </div>
          <Button onPress={() => navigate("/account/change-password")}>
            <IconKey data-icon="inline-start" aria-hidden="true" />
            {t("account.profile.password.tab")}
          </Button>
        </header>

        {hasError ? <Alert variant="destructive"><IconAlertCircle aria-hidden="true" /><AlertTitle>{t("account.profile.loadErrorTitle")}</AlertTitle><AlertDescription>{t("account.profile.loadError")}</AlertDescription></Alert> : null}
        {isUpdating ? <Loader className="min-h-7 justify-start" text={t("account.profile.updating")} /> : null}

        <Card className="gap-0 py-0">
          <div className="h-24 bg-gradient-to-r from-primary via-primary/90 to-primary/70 sm:h-28" />
          <CardContent className="relative px-5 pb-5 sm:px-7 sm:pb-7">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="-mt-9 flex size-20 shrink-0 items-center justify-center rounded-xl border-4 border-card bg-primary-foreground text-2xl font-bold text-primary shadow-sm" aria-hidden="true">{initials}</div>
              <div className="min-w-0 pb-0.5">
                <h2 className="font-heading text-xl font-semibold text-foreground">{user.displayName}</h2>
                <p className="mt-1 flex items-center gap-1.5 break-all text-sm text-muted-foreground"><IconAt className="size-4 shrink-0" aria-hidden="true" />{user.username || t("account.profile.notAvailable")}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <CustomTabs
        variant="underline"
        defaultValue="profile"
        compact
        ariaLabel={t("account.profile.tabsLabel")}
        contentClassName="pt-2"
        items={[{ value: "profile", label: t("account.profile.personalTitle"), content: (<><Card>
              <CardHeader className="border-b"><CardTitle>{t("account.profile.personalTitle")}</CardTitle><CardDescription>{t("account.profile.personalDescription")}</CardDescription></CardHeader>
              <CardContent><dl className="grid gap-3 sm:grid-cols-2"><DetailRow icon={<IconAt className="size-4" />} label={t("account.profile.username")} value={user.username} /><DetailRow icon={<IconMail className="size-4" />} label={t("account.profile.email")} value={user.email} /></dl></CardContent>
            </Card></>) },
          { value: "access", label: t("account.profile.accessTitle"), content: (<><Card>
              <CardHeader className="border-b"><CardTitle>{t("account.profile.accessTitle")}</CardTitle><CardDescription>{t("account.profile.accessDescription")}</CardDescription></CardHeader>
              <CardContent><dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3"><DetailRow icon={<IconShieldCheck className="size-4" />} label={t("account.profile.role")} value={role} /><DetailRow icon={<IconBuilding className="size-4" />} label={t("account.profile.unit")} value={accessScope} /><DetailRow icon={<IconLanguage className="size-4" />} label={t("account.profile.language")} value={language} /></dl></CardContent>
            </Card></>) }]}
      />
      </div>
    </main>
  );
}
