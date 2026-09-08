import { useId, type ReactNode, type ComponentProps } from "react";
import { Checkbox } from "@/components/ui/checkbox";
import { cn } from "@/lib/utils";

/** A named boolean setting with supporting text, using the shared control. */
export function BooleanField({ children, className, ...props }: Omit<ComponentProps<typeof Checkbox>, "children" | "className"> & { children: ReactNode; className?: string }) {
  const labelId = useId();
  return <div className={cn("flex items-center gap-3 text-sm", className)}>
    <Checkbox aria-labelledby={labelId} {...props} />
    <div id={labelId} className="flex min-w-0 flex-1 flex-col gap-1 [&_small]:text-xs [&_small]:text-muted-foreground">{children}</div>
  </div>;
}
