import { createContext, type PropsWithChildren, useContext, useEffect, useMemo, useState } from "react";

export type FontSizeLevel = "xsmall" | "small" | "default" | "large" | "xlarge";

type AccessibilityContextValue = {
  fontSizeLevel: FontSizeLevel;
  setFontSizeLevel: (level: FontSizeLevel) => void;
  decreaseFontSize: () => void;
  resetFontSize: () => void;
  increaseFontSize: () => void;
  canDecreaseFontSize: boolean;
  canIncreaseFontSize: boolean;
};

const FONT_SIZE_STORAGE_KEY = "ssd.accessibility.fontSize";
const FONT_SIZE_LEVELS: FontSizeLevel[] = ["xsmall", "small", "default", "large", "xlarge"];

const FONT_SIZE_PERCENT: Record<FontSizeLevel, number> = {
  xsmall: 90,
  small: 95,
  default: 100,
  large: 105,
  xlarge: 110,
};

const AccessibilityContext = createContext<AccessibilityContextValue | null>(null);

function isFontSizeLevel(value: string | null): value is FontSizeLevel {
  return value === "xsmall" || value === "small" || value === "default" || value === "large" || value === "xlarge";
}

function readInitialFontSizeLevel(): FontSizeLevel {
  if (typeof window === "undefined") return "default";
  const stored = window.localStorage.getItem(FONT_SIZE_STORAGE_KEY);
  return isFontSizeLevel(stored) ? stored : "default";
}

export function AccessibilityProvider({ children }: PropsWithChildren) {
  const [fontSizeLevel, setFontSizeLevel] = useState<FontSizeLevel>(readInitialFontSizeLevel);
  const currentLevelIndex = FONT_SIZE_LEVELS.indexOf(fontSizeLevel);
  const canDecreaseFontSize = currentLevelIndex > 0;
  const canIncreaseFontSize = currentLevelIndex < FONT_SIZE_LEVELS.length - 1;

  useEffect(() => {
    const percent = FONT_SIZE_PERCENT[fontSizeLevel];
    const root = document.documentElement;
    root.dataset.fontSize = fontSizeLevel;
    root.style.fontSize = `${percent}%`;
    root.style.setProperty("--app-text-scale", String(percent / 100));
    root.style.setProperty("--app-font-size", "0.6875rem");
    window.localStorage.setItem(FONT_SIZE_STORAGE_KEY, fontSizeLevel);
  }, [fontSizeLevel]);

  const value = useMemo(
    () => ({
      fontSizeLevel,
      setFontSizeLevel,
      decreaseFontSize: () => {
        setFontSizeLevel((level) => {
          const nextIndex = Math.max(0, FONT_SIZE_LEVELS.indexOf(level) - 1);
          return FONT_SIZE_LEVELS[nextIndex];
        });
      },
      resetFontSize: () => setFontSizeLevel("default"),
      increaseFontSize: () => {
        setFontSizeLevel((level) => {
          const nextIndex = Math.min(FONT_SIZE_LEVELS.length - 1, FONT_SIZE_LEVELS.indexOf(level) + 1);
          return FONT_SIZE_LEVELS[nextIndex];
        });
      },
      canDecreaseFontSize,
      canIncreaseFontSize,
    }),
    [canDecreaseFontSize, canIncreaseFontSize, fontSizeLevel],
  );

  return <AccessibilityContext.Provider value={value}>{children}</AccessibilityContext.Provider>;
}

export function useAccessibility() {
  const context = useContext(AccessibilityContext);
  if (!context) {
    throw new Error("useAccessibility must be used within AccessibilityProvider");
  }
  return context;
}
