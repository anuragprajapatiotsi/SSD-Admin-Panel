import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { useSearchParams } from "react-router-dom";

export interface TabItem {
  value: string;
  label: string;
  content: ReactNode;
  icon?: ReactNode;
  badge?: string | number;
  disabled?: boolean;
}

export interface CustomTabsProps {
  items: TabItem[];
  value?: string;
  onValueChange?: (value: string) => void;
  defaultValue?: string;
  endContent?: ReactNode;
  compact?: boolean;
  syncWithUrl?: boolean;
  className?: string;
  contentClassName?: string;
  orientation?: "horizontal" | "vertical";
  variant?: "pill" | "underline" | "segment";
  ariaLabel?: string;
}

function isAvailableTab(
  items: TabItem[],
  value: string | null | undefined,
): value is string {
  return Boolean(
    value && items.some((item) => item.value === value && !item.disabled),
  );
}

export function CustomTabs({
  items,
  value,
  onValueChange,
  defaultValue,
  endContent,
  compact = false,
  syncWithUrl = false,
  className,
  contentClassName,
  orientation = "horizontal",
  variant = "underline",
  ariaLabel = "Sections",
}: CustomTabsProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const fallbackValue = useMemo(() => {
    if (isAvailableTab(items, defaultValue)) return defaultValue;
    return items.find((item) => !item.disabled)?.value ?? "";
  }, [defaultValue, items]);
  const [internalValue, setInternalValue] = useState(fallbackValue);
  const urlValue = syncWithUrl ? searchParams.get("tab") : null;
  const activeValue = isAvailableTab(items, value)
    ? value
    : isAvailableTab(items, urlValue)
      ? urlValue
      : isAvailableTab(items, internalValue)
        ? internalValue
        : fallbackValue;
  const activeItem = items.find(
    (item) => item.value === activeValue && !item.disabled,
  );

  useEffect(() => {
    if (!syncWithUrl || !activeValue || searchParams.get("tab") === activeValue)
      return;
    const nextParams = new URLSearchParams(searchParams);
    nextParams.set("tab", activeValue);
    setSearchParams(nextParams, { replace: true });
  }, [activeValue, searchParams, setSearchParams, syncWithUrl]);

  function selectTab(nextValue: string) {
    if (!isAvailableTab(items, nextValue)) return;
    if (value === undefined) setInternalValue(nextValue);
    onValueChange?.(nextValue);

    if (syncWithUrl && searchParams.get("tab") !== nextValue) {
      const nextParams = new URLSearchParams(searchParams);
      nextParams.set("tab", nextValue);
      setSearchParams(nextParams, { replace: true });
    }
  }

  if (!activeItem) return null;

  const tabsList = (
    <TabsList
      aria-label={ariaLabel}
      className={cn(
        "max-w-full shrink-0 justify-start",
        variant === "underline" && orientation === "horizontal" && "group-data-horizontal/tabs:h-auto py-0",
        orientation === "horizontal"
          ? cn(
              "flex-nowrap overflow-x-auto overflow-y-hidden",
              endContent || compact ? "min-w-0 w-fit" : "w-full",
            )
          : "shrink-0",
      )}
    >
      {items.map((item) => (
        <TabsTrigger
          id={item.value}
          isDisabled={item.disabled}
          key={item.value}
          className={cn(
            "shrink-0",
            (endContent || compact) && "flex-none",
            variant === "underline" && orientation === "horizontal" && "h-auto pt-1 pb-2",
          )}
        >
          {item.icon ? <span data-icon="inline-start">{item.icon}</span> : null}
          <span>{item.label}</span>
          {item.badge !== undefined ? (
            <Badge className="ml-1 h-4 min-w-4 px-1.5" variant="secondary">
              {item.badge}
            </Badge>
          ) : null}
        </TabsTrigger>
      ))}
    </TabsList>
  );

  return (
    <Tabs
      className={cn("min-h-0", className)}
      orientation={orientation}
      variant={variant}
      selectedKey={activeValue}
      onSelectionChange={(key) => selectTab(String(key))}
    >
      {endContent && orientation === "horizontal" ? (
        <div className="flex min-w-0 shrink-0 flex-wrap items-center gap-2">
          {tabsList}
          <div className="ml-auto min-w-0 max-w-full">{endContent}</div>
        </div>
      ) : (
        tabsList
      )}

      <TabsContent id={activeItem.value} className={cn("min-h-0", contentClassName)}>
        {activeItem.content}
      </TabsContent>
    </Tabs>
  );
}
