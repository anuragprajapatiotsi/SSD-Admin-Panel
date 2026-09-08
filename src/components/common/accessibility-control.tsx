import { useEffect, useRef, useState } from "react";
import { useTranslation } from "react-i18next";
import { IconAccessible, IconContrast, IconLetterSpacing, IconLineHeight, IconLink, IconMoon, IconRefresh, IconTypography, IconVolume } from "@tabler/icons-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetDescription, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { useAccessibility } from "@/providers/accessibility-provider";

export function AccessibilityControl({ pageTitle }: { pageTitle?: string }) {
  const { t, i18n } = useTranslation(["common", "accessibility"]);
  const [contrastEnabled, setContrastEnabled] = useState(() => readAccessibilitySetting("contrast"));
  const [darkModeEnabled, setDarkModeEnabled] = useState(() => readAccessibilitySetting("darkMode"));
  const [textSpacingEnabled, setTextSpacingEnabled] = useState(() => readAccessibilitySetting("textSpacing"));
  const [lineHeightEnabled, setLineHeightEnabled] = useState(() => readAccessibilitySetting("lineHeight"));
  const [highlightLinksEnabled, setHighlightLinksEnabled] = useState(() => readAccessibilitySetting("highlightLinks"));
  const [dyslexiaFontEnabled, setDyslexiaFontEnabled] = useState(() => readAccessibilitySetting("dyslexiaFont"));
  const [screenReaderRunning, setScreenReaderRunning] = useState(false);
  const screenReaderUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const { fontSizeLevel, decreaseFontSize, resetFontSize, increaseFontSize, canDecreaseFontSize, canIncreaseFontSize } = useAccessibility();

  useEffect(() => {
    document.documentElement.classList.toggle("high-contrast", contrastEnabled);
    persistAccessibilitySetting("contrast", contrastEnabled);
  }, [contrastEnabled]);

  useEffect(() => {
    const root = document.documentElement;
    const settings = {
      darkMode: darkModeEnabled,
      textSpacing: textSpacingEnabled,
      lineHeight: lineHeightEnabled,
      highlightLinks: highlightLinksEnabled,
      dyslexiaFont: dyslexiaFontEnabled,
    };

    root.classList.toggle("dark", darkModeEnabled);
    root.classList.toggle("a11y-text-spacing", textSpacingEnabled);
    root.classList.toggle("a11y-line-height", lineHeightEnabled);
    root.classList.toggle("a11y-highlight-links", highlightLinksEnabled);
    root.classList.toggle("a11y-dyslexia-font", dyslexiaFontEnabled);
    Object.entries(settings).forEach(([key, value]) => persistAccessibilitySetting(key, value));

    const styleId = "ssd-accessibility-adjustments";
    let style = document.getElementById(styleId) as HTMLStyleElement | null;
    if (!style) {
      style = document.createElement("style");
      style.id = styleId;
      document.head.appendChild(style);
    }
    style.textContent = `
      .a11y-text-spacing body *:not(svg):not(path) { letter-spacing: 0.075em !important; word-spacing: 0.12em !important; }
      .a11y-line-height body *:not(svg):not(path) { line-height: 1.65 !important; }
      .a11y-highlight-links a { text-decoration: underline 0.15em !important; text-underline-offset: 0.2em !important; outline: 2px solid currentColor !important; outline-offset: 2px !important; }
      .a11y-dyslexia-font body *:not(svg):not(path) { font-family: Arial, Verdana, sans-serif !important; letter-spacing: 0.04em; word-spacing: 0.08em; }
    `;
  }, [darkModeEnabled, dyslexiaFontEnabled, highlightLinksEnabled, lineHeightEnabled, textSpacingEnabled]);

  useEffect(() => {
    return () => {
      window.speechSynthesis?.cancel();
      screenReaderUtteranceRef.current = null;
    };
  }, []);

  function handleScreenReader() {
    if (screenReaderUtteranceRef.current) {
      window.speechSynthesis?.cancel();
      screenReaderUtteranceRef.current = null;
      setScreenReaderRunning(false);
      return;
    }

    const pageText = (document.querySelector('[data-slot="content-frame"]') ?? document.querySelector("main"))?.textContent?.replace(/\s+/g, " ").trim();
    const message = `${pageTitle || document.title}. ${pageText || ""}`.slice(0, 3500);
    const speechSynthesis = window.speechSynthesis;
    if (!speechSynthesis) return;

    const utterance = new SpeechSynthesisUtterance(message);
    utterance.lang = i18n.resolvedLanguage ?? i18n.language;
    const finishReading = () => {
      if (screenReaderUtteranceRef.current !== utterance) return;
      screenReaderUtteranceRef.current = null;
      setScreenReaderRunning(false);
    };

    utterance.addEventListener("end", finishReading);
    utterance.addEventListener("error", finishReading);
    screenReaderUtteranceRef.current = utterance;
    setScreenReaderRunning(true);
    speechSynthesis.speak(utterance);
  }

  function resetAccessibilityPreferences() {
    resetFontSize();
    setContrastEnabled(false);
    setDarkModeEnabled(false);
    setTextSpacingEnabled(false);
    setLineHeightEnabled(false);
    setHighlightLinksEnabled(false);
    setDyslexiaFontEnabled(false);
    if (screenReaderUtteranceRef.current) handleScreenReader();
  }

  return (
          <SheetTrigger>
            <Button variant="ghost" size="icon" aria-label={t("accessibility:trigger")}><IconAccessible className="size-4" stroke={1.5} /></Button>
            <Sheet side="right" className="w-full sm:max-w-md!">
              <SheetHeader className="border-b p-4 pr-12">
                <SheetTitle className="flex items-center gap-2 text-base"><IconAccessible className="size-5 text-primary" />{t("accessibility:title")}</SheetTitle>
                <SheetDescription>{t("accessibility:description")}</SheetDescription>
              </SheetHeader>

              <ScrollArea className="min-h-0 flex-1"><div className="flex flex-col gap-5 p-4">
                <section className="flex flex-col gap-3" aria-labelledby="accessibility-text-heading">
                  <div>
                    <h2 id="accessibility-text-heading" className="font-heading text-sm font-medium">{t("accessibility:text.title")}</h2>
                    <p className="text-xs text-muted-foreground">{t("accessibility:text.description")}</p>
                  </div>
                  <div className="flex flex-col gap-2 rounded-lg bg-muted/50 p-3">
                    <div className="flex items-center justify-between gap-3">
                      <span className="flex items-center gap-2 font-medium"><IconTypography />{t("accessibility:text.size")}</span>
                      <span className="text-xs text-muted-foreground">{fontSizeLevel}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      <Button variant={fontSizeLevel === "xsmall" || fontSizeLevel === "small" ? "secondary" : "outline"} aria-label={t("accessibility:text.decrease")} isDisabled={!canDecreaseFontSize} onPress={decreaseFontSize}>A−</Button>
                      <Button variant={fontSizeLevel === "default" ? "secondary" : "outline"} aria-label={t("accessibility:text.reset")} onPress={resetFontSize}>A</Button>
                      <Button variant={fontSizeLevel === "large" || fontSizeLevel === "xlarge" ? "secondary" : "outline"} aria-label={t("accessibility:text.increase")} isDisabled={!canIncreaseFontSize} onPress={increaseFontSize}>A+</Button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button className="h-16 flex-col gap-1 whitespace-normal" variant={lineHeightEnabled ? "secondary" : "outline"} aria-pressed={lineHeightEnabled} onPress={() => setLineHeightEnabled((value) => !value)}><IconLineHeight />{t("accessibility:text.lineHeight")}</Button>
                    <Button className="h-16 flex-col gap-1 whitespace-normal" variant={textSpacingEnabled ? "secondary" : "outline"} aria-pressed={textSpacingEnabled} onPress={() => setTextSpacingEnabled((value) => !value)}><IconLetterSpacing />{t("accessibility:text.spacing")}</Button>
                  </div>
                </section>

                <Separator />

                <section className="flex flex-col gap-3" aria-labelledby="accessibility-visual-heading">
                  <div>
                    <h2 id="accessibility-visual-heading" className="font-heading text-sm font-medium">{t("accessibility:visual.title")}</h2>
                    <p className="text-xs text-muted-foreground">{t("accessibility:visual.description")}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button className="h-16 flex-col gap-1 whitespace-normal" variant={contrastEnabled ? "secondary" : "outline"} aria-pressed={contrastEnabled} onPress={() => setContrastEnabled((value) => !value)}><IconContrast />{t("accessibility:visual.contrast")}</Button>
                    <Button className="h-16 flex-col gap-1 whitespace-normal" variant={darkModeEnabled ? "secondary" : "outline"} aria-pressed={darkModeEnabled} onPress={() => setDarkModeEnabled((value) => !value)}><IconMoon />{t("accessibility:visual.darkMode")}</Button>
                    <Button className="h-16 flex-col gap-1 whitespace-normal" variant={highlightLinksEnabled ? "secondary" : "outline"} aria-pressed={highlightLinksEnabled} onPress={() => setHighlightLinksEnabled((value) => !value)}><IconLink />{t("accessibility:visual.highlightLinks")}</Button>
                    <Button className="h-16 flex-col gap-1 whitespace-normal" variant={dyslexiaFontEnabled ? "secondary" : "outline"} aria-pressed={dyslexiaFontEnabled} onPress={() => setDyslexiaFontEnabled((value) => !value)}><IconTypography />{t("accessibility:visual.dyslexia")}</Button>
                  </div>
                </section>

                <Separator />

                <section className="flex flex-col gap-3" aria-labelledby="accessibility-content-heading">
                  <div>
                    <h2 id="accessibility-content-heading" className="font-heading text-sm font-medium">{t("accessibility:content.title")}</h2>
                    <p className="text-xs text-muted-foreground">{t("accessibility:content.description")}</p>
                  </div>
                  <div className="grid gap-2">
                    <Button className="h-16 flex-col gap-1 whitespace-normal" variant={screenReaderRunning ? "secondary" : "outline"} aria-pressed={screenReaderRunning} onPress={handleScreenReader}><IconVolume />{t("accessibility:content.screenReader")}</Button>
                  </div>
                </section>
              </div></ScrollArea>

              <SheetFooter className="border-t p-4">
                <Button variant="default" className="w-full" onPress={resetAccessibilityPreferences}><IconRefresh />{t("accessibility:reset")}</Button>
              </SheetFooter>
            </Sheet>
          </SheetTrigger>
  );
}

function readAccessibilitySetting(key: string): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(`ssd.accessibility.${key}`) === "true";
}

function persistAccessibilitySetting(key: string, enabled: boolean) {
  window.localStorage.setItem(`ssd.accessibility.${key}`, String(enabled));
}
