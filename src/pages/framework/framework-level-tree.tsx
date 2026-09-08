import { useTranslation } from "react-i18next";
import { ChevronDown, Pencil, Plus } from "lucide-react";
import type { FrameworkLevel } from "@/api/framework.api";
import { StatusBadge } from "@/components/common/status-badge";
import { normalizeStatusVariant } from "@/components/common/status-variants";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Empty, EmptyHeader, EmptyTitle } from "@/components/ui/empty";

export function FrameworkLevelTree({ levels, onCreate, onEdit }: {
  levels: FrameworkLevel[];
  onCreate: () => void;
  onEdit: (level: FrameworkLevel) => void;
}) {
  const { t } = useTranslation("common");
  const orderedLevels = [...levels].sort((a, b) => Number(a.level_number) - Number(b.level_number) || a.level_code.localeCompare(b.level_code));
  return <section className="flex w-full min-w-0 max-w-2xl flex-col gap-4" aria-label={t("frameworkTree.title")}>
    <div>
      <h3 className="text-sm font-semibold">{t("frameworkTree.title")}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{t("frameworkTree.description")}</p>
    </div>
    {!orderedLevels.length && <Empty><EmptyHeader><EmptyTitle>{t("frameworkTree.empty")}</EmptyTitle></EmptyHeader></Empty>}
    <ol className="flex min-w-0 flex-col">
      {orderedLevels.map((level) => <li className="relative flex min-w-0 items-start gap-3 pb-4" key={level.level_code}>
        <span className="absolute bottom-0 left-4 top-8 w-px bg-border" aria-hidden="true" />
        <span className="absolute left-8 top-4 h-px w-3 bg-border" aria-hidden="true" />
        <ChevronDown className="absolute bottom-0 left-2 size-4 text-muted-foreground" aria-hidden="true" />
        <span className="relative flex size-8 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold tabular-nums" aria-hidden="true">{level.level_number}</span>
        <Card className="min-w-0 flex-1 py-0 shadow-sm">
        <Button variant="ghost" className="h-auto w-full min-w-0 justify-start gap-3 whitespace-normal p-3 text-left" onPress={() => onEdit(level)} aria-label={t("frameworkTree.edit", { name: level.name ?? level.level_code })}>
          <span className="flex min-w-0 flex-1 flex-col gap-1.5">
            <span className="text-xs font-normal text-muted-foreground">{t("frameworkTree.level", { number: level.level_number })}</span>
            <span className="break-words text-sm font-semibold">{level.name ?? level.level_code}</span>
            <span className="flex flex-wrap items-center gap-2">
              <span className="break-all text-xs font-normal text-muted-foreground">{level.level_code}</span>
              <StatusBadge variant={normalizeStatusVariant(level.is_active === false ? "INACTIVE" : "ACTIVE")}>{t(level.is_active === false ? "frameworkTree.inactive" : "frameworkTree.active")}</StatusBadge>
              {level.allows_indicator_mapping && <Badge variant="secondary">{t("frameworkTree.indicators")}</Badge>}
            </span>
          </span>
          <Pencil aria-hidden="true" />
        </Button>
        </Card>
      </li>)}
      <li className="relative flex min-w-0 items-center gap-3">
        <span className="absolute left-8 top-1/2 h-px w-3 bg-border" aria-hidden="true" />
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-muted" aria-hidden="true"><Plus className="size-4" /></span>
        <Button variant="outline" onPress={onCreate}><Plus data-icon="inline-start" aria-hidden="true" />{t("frameworkTree.add")}</Button>
      </li>
    </ol>
  </section>;
}
