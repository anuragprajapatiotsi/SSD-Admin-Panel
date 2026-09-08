import { useId } from "react";
import { useTranslation } from "react-i18next";
import type { TooltipRenderProps } from "react-joyride";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

export function TourTooltip({ controls, index, size, isLastStep, step, tooltipProps }: TooltipRenderProps) {
  const { t } = useTranslation("common");
  const id = useId();
  return <Card {...tooltipProps} aria-labelledby={`${id}-title`} aria-describedby={`${id}-description`} size="sm"
    style={{ width: step.width, maxWidth: "calc(100vw - 2rem)" }}>
    <CardHeader>
      <div className="flex items-center justify-between gap-3">
        <span className="flex items-center gap-2 text-sm font-medium"><span aria-hidden="true">👋</span>{t("guidedTour.header")}</span>
        <span className="text-xs text-muted-foreground">{t("guidedTour.progress", { current: index + 1, total: size })}</span>
      </div>
    </CardHeader>
    <CardContent className="flex flex-col gap-2">
      <CardTitle id={`${id}-title`}>{step.title}</CardTitle>
      <div id={`${id}-description`} className="text-sm leading-relaxed text-muted-foreground">{step.content}</div>
    </CardContent>
    <CardFooter className="flex flex-wrap justify-between gap-2">
      <Button data-action="skip" variant="ghost" onPress={() => controls.skip("button_skip")}>{t("guidedTour.skip")}</Button>
      <div className="flex gap-2">
        {index > 0 ? <Button data-action="back" variant="outline" onPress={() => controls.prev("button_back")}>{t("guidedTour.back")}</Button> : null}
        <Button data-action="primary" onPress={() => controls.next("button_primary")}>{t(isLastStep ? "guidedTour.done" : "guidedTour.next")}</Button>
      </div>
    </CardFooter>
  </Card>;
}
