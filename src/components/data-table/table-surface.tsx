import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/** Internal native surface for DataTable's TanStack rows. Pages use DataTable. */
export function TableSurface({ className, ...props }: ComponentProps<"table">) {
  return <table className={cn(
    "w-full caption-bottom text-xs text-foreground [&_thead]:border-b [&_th]:h-9 [&_th]:px-3 [&_th]:text-left [&_th]:align-middle [&_th]:font-semibold [&_th]:whitespace-nowrap [&_td]:px-3 [&_td]:py-2 [&_td]:align-middle [&_td>strong]:block [&_tbody>tr]:border-b [&_tbody>tr:last-child]:border-b-0 [&_tbody>tr:hover]:bg-muted/50",
    className,
  )} {...props} />;
}
