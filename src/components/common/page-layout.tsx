import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

/** Shared composition for routed workspaces, including narrow layouts. */
export function PageSection({ className, ...props }: ComponentProps<"section">) {
  return <section className={cn("flex min-w-0 flex-col gap-4 text-foreground", className)} {...props} />;
}

export function PageHeader({ className, ...props }: ComponentProps<"header">) {
  return <header className={cn(
    "flex min-w-0 flex-wrap items-start justify-between gap-3 [&>div]:min-w-0 [&_h1]:font-heading [&_h1]:text-2xl [&_h1]:font-semibold [&_h1]:tracking-tight [&_h1]:text-foreground [&_h2]:font-heading [&_h2]:text-xl [&_h2]:font-semibold [&_p]:mt-1 [&_p]:text-sm [&_p]:text-muted-foreground",
    className,
  )} {...props} />;
}
