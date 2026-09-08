import { cva } from "class-variance-authority"
import * as React from "react"
import {
  SelectionIndicator,
  TabList as TabListPrimitive,
  TabPanel as TabPanelPrimitive,
  Tab as TabPrimitive,
  Tabs as TabsPrimitive,
} from "react-aria-components"

import { cn } from "@/lib/utils"

type TabsVariant = "pill" | "underline" | "segment"

type TabsVisualContextValue = {
  variant: TabsVariant
}

const TabsVisualContext = React.createContext<TabsVisualContextValue | null>(null)

function useTabsVisualContext() {
  const context = React.useContext(TabsVisualContext)

  if (!context) {
    throw new Error("TabsTrigger and TabsList must be used inside Tabs")
  }

  return context
}

function Tabs({
  className,
  variant = "underline",
  ...props
}: React.ComponentProps<typeof TabsPrimitive> & {
  variant?: TabsVariant
}) {
  return (
    <TabsVisualContext.Provider value={{ variant }}>
      <TabsPrimitive
        data-slot="tabs"
        data-variant={variant}
        className={cn(
          "group/tabs flex min-w-0 gap-2 data-horizontal:flex-col",
          className
        )}
        {...props}
      />
    </TabsVisualContext.Provider>
  )
}

const tabsListVariants = cva(
  "group/tabs-list inline-flex w-fit max-w-full items-center justify-start rounded-lg p-[3px] text-muted-foreground group-data-horizontal/tabs:h-8 group-data-horizontal/tabs:overflow-x-auto group-data-vertical/tabs:h-fit group-data-vertical/tabs:flex-col",
  {
    variants: {
      variant: {
        pill: "rounded-full bg-muted",
        underline: "gap-1 rounded-none bg-transparent",
        segment: "bg-muted",
      },
    },
    defaultVariants: {
      variant: "underline",
    },
  }
)

function TabsList({
  className,
  ...props
}: React.ComponentProps<typeof TabListPrimitive>) {
  const { variant } = useTabsVisualContext()

  return (
    <TabListPrimitive
      data-slot="tabs-list"
      className={cn(tabsListVariants({ variant }), className)}
      {...props}
    />
  )
}

const tabsTriggerVariants = cva(
  "relative isolate inline-flex h-[calc(100%-1px)] flex-1 cursor-default items-center justify-center gap-1.5 rounded-md border border-transparent px-1.5 py-0.5 text-xs font-medium whitespace-nowrap text-foreground/60 outline-none transition-colors motion-reduce:transition-none group-data-vertical/tabs:w-full group-data-vertical/tabs:justify-start group-data-vertical/tabs:py-[calc(--spacing(1.25))] hover:text-foreground focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 focus-visible:outline-1 focus-visible:outline-ring disabled:pointer-events-none disabled:opacity-50 has-data-[icon=inline-end]:pr-1 has-data-[icon=inline-start]:pl-1 data-[disabled]:pointer-events-none data-[disabled]:opacity-50 dark:text-muted-foreground dark:hover:text-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
  {
    variants: {
      variant: {
        pill: "rounded-full data-selected:text-foreground dark:data-selected:border-input",
        underline:
          "bg-transparent data-selected:bg-transparent data-selected:text-foreground dark:data-selected:border-transparent dark:data-selected:bg-transparent dark:data-selected:text-foreground",
        segment: "data-selected:text-foreground dark:data-selected:border-input",
      },
    },
    defaultVariants: {
      variant: "underline",
    },
  }
)

function TabsTrigger({
  children,
  className,
  indicatorClassName,
  ...props
}: Omit<React.ComponentProps<typeof TabPrimitive>, "children" | "className"> &
  {
    children: React.ReactNode
    className?: string
    indicatorClassName?: string
  }) {
  const { variant } = useTabsVisualContext()

  return (
    <TabPrimitive
      data-slot="tabs-trigger"
      className={cn(tabsTriggerVariants({ variant }), className)}
      {...props}
    >
      <SelectionIndicator
        aria-hidden="true"
        className={cn(
          "pointer-events-none absolute transition-[translate,width,height] duration-200 ease-out motion-reduce:transition-none",
          variant === "underline"
            ? "bg-foreground group-data-horizontal/tabs:inset-x-0 group-data-horizontal/tabs:bottom-0 group-data-horizontal/tabs:h-0.5 group-data-vertical/tabs:inset-y-0 group-data-vertical/tabs:-right-1 group-data-vertical/tabs:w-0.5"
            : "inset-0 bg-card",
          variant === "pill" && "rounded-full",
          variant === "segment" && "rounded-md",
          indicatorClassName
        )}
      />
      <span className="relative inline-flex items-center justify-center gap-1.5">
        {children}
      </span>
    </TabPrimitive>
  )
}

function TabsContent({
  className,
  ...props
}: React.ComponentProps<typeof TabPanelPrimitive>) {
  return (
    <TabPanelPrimitive
      data-slot="tabs-content"
      className={cn(
        "min-w-0 flex-1 text-xs/relaxed outline-none motion-safe:animate-in motion-safe:fade-in motion-safe:duration-200",
        className
      )}
      {...props}
    />
  )
}

export {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
}
export type { TabsVariant }
