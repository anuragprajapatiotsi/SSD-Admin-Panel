import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Joyride, type Step, type EventHandler } from "react-joyride";
import { useTranslation } from "react-i18next";
import { useReducedMotion } from "motion/react";
import { TourTooltip } from "./tour-tooltip";
import { readTourProgress, writeTourProgress, type TourProgress } from "./tour-progress";

export type TourDefinition = {
  id: string;
  version: number;
  scope: string;
  waitFor?: string;
  steps: readonly { id: string; target: string; textKey: string; optional?: boolean; placement?: Step["placement"] }[];
};
type TourContextValue = {
  progress: TourProgress;
  update: (screen: string, value: { complete: boolean; step?: string }, skipped?: boolean) => void;
};
const TourContext = createContext<TourContextValue | null>(null);

export function GuidedTourProvider({ userKey, workflow, children }: { userKey: string | null; workflow: string; children: ReactNode }) {
  if (!userKey) return <TourContext.Provider value={null}>{children}</TourContext.Provider>;
  const storageKey = `ssd.tours.v1:${workflow}:${userKey}`;
  return <TourSession key={storageKey} storageKey={storageKey}>{children}</TourSession>;
}

function TourSession({ storageKey, children }: { storageKey: string; children: ReactNode }) {
  const [progress, setProgress] = useState(() => readTourProgress(storageKey));
  const current = useRef(progress);
  const update = useCallback<TourContextValue["update"]>((screen, value, skipped = false) => {
    const next = { skipped: current.current.skipped || skipped, screens: { ...current.current.screens, [screen]: value } };
    current.current = next;
    writeTourProgress(storageKey, next);
    setProgress(next);
  }, [storageKey]);
  useEffect(() => {
    const sync = (event: StorageEvent) => {
      if (event.key !== storageKey) return;
      const next = readTourProgress(storageKey);
      current.current = next;
      setProgress(next);
    };
    window.addEventListener("storage", sync);
    return () => window.removeEventListener("storage", sync);
  }, [storageKey]);
  const value = useMemo(() => ({ progress, update }), [progress, update]);
  return <TourContext.Provider value={value}>{children}</TourContext.Provider>;
}

export function ScreenTour({ definition, ready }: { definition: TourDefinition; ready: boolean }) {
  const session = useContext(TourContext);
  const screen = `${definition.id}:v${definition.version}`;
  if (!ready || !session || session.progress.skipped || session.progress.screens[screen]?.complete) return null;
  return <ReadyTour key={screen} definition={definition} screen={screen} session={session} />;
}

function ReadyTour({ definition, screen, session }: { definition: TourDefinition; screen: string; session: TourContextValue }) {
  const { t } = useTranslation();
  const reduceMotion = useReducedMotion();
  const [available, setAvailable] = useState<TourDefinition["steps"] | null>(null);
  const initialStep = useRef(session.progress.screens[screen]?.step);
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | undefined;
    let stopped = false;
    const visibleTarget = (selector: string) => Array.from(document.querySelectorAll<HTMLElement>(selector))
      .some((element) => element.getClientRects().length > 0 && getComputedStyle(element).visibility !== "hidden");
    const canStart = () => {
      const root = document.querySelector(definition.scope);
      if (!root || Array.from(root.querySelectorAll<HTMLElement>('[aria-busy="true"], [role="dialog"]'))
        .some((element) => element.getClientRects().length > 0 && getComputedStyle(element).visibility !== "hidden")) return false;
      if (definition.waitFor && !root.querySelector(definition.waitFor)) return false;
      return definition.steps.filter((step) => !step.optional).every((step) => visibleTarget(step.target));
    };
    const check = () => {
      if (stopped) return;
      if (!canStart()) { clearTimeout(timer); timer = undefined; return; }
      // Unrelated DOM updates must not continually restart the entrance delay.
      if (timer !== undefined) return;
      timer = setTimeout(() => {
        timer = undefined;
        if (stopped || !canStart()) return;
        const steps = definition.steps.filter((step) => visibleTarget(step.target));
        if (steps.length) { stopped = true; observer.disconnect(); setAvailable(steps); }
      }, 400);
    };
    const observer = new MutationObserver(check);
    observer.observe(document.body, { subtree: true, childList: true, attributes: true, attributeFilter: ["aria-busy", "hidden", "class"] });
    check();
    return () => { stopped = true; clearTimeout(timer); observer.disconnect(); };
  }, [definition]);
  const steps = useMemo<Step[]>(() => (available ?? []).map((step) => ({
    target: () => Array.from(document.querySelectorAll<HTMLElement>(step.target)).find((element) => element.getClientRects().length > 0) ?? null,
    title: t(`${step.textKey}.title`), content: t(`${step.textKey}.body`), placement: step.placement ?? "bottom",
    id: step.id,
  })), [available, t]);
  const onEvent: EventHandler = (event) => {
    if (event.type === "tooltip") session.update(screen, { complete: false, step: event.step.id });
    if (event.type === "tour:end") {
      if (event.status === "skipped") session.update(screen, { complete: false }, true);
      else if (event.status === "finished") session.update(screen, { complete: true });
    }
  };
  if (!available?.length) return null;
  return <Joyride run continuous scrollToFirstStep steps={steps}
    initialStepIndex={Math.max(0, available.findIndex((step) => step.id === initialStep.current))}
    onEvent={onEvent} tooltipComponent={TourTooltip} loaderComponent={null}
    floatingOptions={{ strategy: "fixed", shiftOptions: { crossAxis: true, padding: 16 }, flipOptions: { padding: 16 } }}
    options={{ skipBeacon: true, overlayClickAction: false, dismissKeyAction: false, blockTargetInteraction: true,
      scrollDuration: reduceMotion ? 0 : 250, targetWaitTimeout: 3000,
      backgroundColor: "var(--card)", arrowColor: "var(--card)", textColor: "var(--card-foreground)", primaryColor: "var(--primary)",
      width: "min(22rem, calc(100vw - 2rem))" }}
    locale={{ back: t("common:guidedTour.back"), next: t("common:guidedTour.next"), last: t("common:guidedTour.done"),
      skip: t("common:guidedTour.skip"), close: t("common:guidedTour.skip"), open: t("common:guidedTour.header") }}
  />;
}
