import { Switch } from "@/components/ui/switch";
import { useId } from "react";
import { useTranslation } from "react-i18next";

export type AutoRefreshControlProps = {
  enabled: boolean;
  onEnabledChange: (enabled: boolean) => void;
  isRefreshing?: boolean;
  hasError?: boolean;
};

export function AutoRefreshControl({ enabled, onEnabledChange, isRefreshing = false, hasError = false }: AutoRefreshControlProps) {
  const { t } = useTranslation("common");
  const labelId = useId();

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Switch isSelected={enabled} onChange={onEnabledChange} aria-labelledby={labelId} />
      <span id={labelId} className="text-xs text-muted-foreground">{t("autoRefresh.label")}</span>
      <span role="status" aria-live="polite" className={hasError ? "text-xs text-destructive" : "sr-only"}>
        {hasError ? t("autoRefresh.error") : isRefreshing ? t("autoRefresh.refreshing") : ""}
      </span>
    </div>
  );
}
