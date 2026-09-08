import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import { useTranslation } from "react-i18next";

type LoaderProps = {
  text?: string;
  className?: string;
  presentation?: "inline" | "immersive";
  description?: string;
};

export function Loader({ text, className, presentation = "inline", description }: LoaderProps) {
  const { t } = useTranslation("common");
  const resolvedText = text?.trim() || t("loading.default", { defaultValue: "Loading..." });

  if (presentation === "immersive") {
    return (
      <div className={cn("relative isolate flex min-h-64 w-full items-center justify-center overflow-hidden bg-background p-6", className)} role="status" aria-live="polite" aria-atomic="true">
        <div className="relative flex max-w-sm flex-col items-center gap-5 text-center">
          <Spinner className="size-6 text-primary motion-reduce:animate-none" aria-hidden="true" />
          <div className="flex flex-col gap-2">
            <p className="text-base font-medium text-foreground">{resolvedText}</p>
            {description ? <p className="text-sm leading-relaxed text-muted-foreground">{description}</p> : null}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn(
        "flex min-h-24 items-center justify-center gap-2 text-sm text-muted-foreground",
        className,
      )}
      role="status"
      aria-live="polite"
    >
      <Spinner aria-hidden="true" />
      <span>{resolvedText}</span>
    </div>
  );
}
