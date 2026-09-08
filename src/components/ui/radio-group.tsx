"use client"

import {
  composeRenderProps,
  RadioGroup as RadioGroupPrimitive,
  Radio as RadioPrimitive,
  type RadioGroupProps,
  type RadioProps,
} from "react-aria-components"

import { cn } from "@/lib/utils"

function RadioGroup({ className, ...props }: RadioGroupProps) {
  return (
    <RadioGroupPrimitive
      data-slot="radio-group"
      className={cn("grid w-full gap-3", className)}
      {...props}
    />
  )
}

type RadioGroupItemProps = RadioProps & {
  variant?: "default" | "card"
}

function RadioGroupItem({
  className,
  children,
  variant = "default",
  ...props
}: RadioGroupItemProps) {
  return (
    <RadioPrimitive
      data-slot="radio-group-item"
      className={cn(
        variant === "default"
          ? "group/radio-group-item peer relative flex aspect-square size-4 shrink-0 rounded-full border border-input bg-background text-primary outline-none group-has-[:focus-visible]/field-label:ring-0 group-has-[:focus-visible]/field-label:not-data-checked:border-input after:absolute after:-inset-x-3 after:-inset-y-2 focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 aria-invalid:aria-checked:border-primary data-focus-visible:border-ring data-focus-visible:ring-3 data-focus-visible:ring-ring/50 data-invalid:border-destructive data-invalid:ring-3 data-invalid:ring-destructive/20 data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50 dark:bg-input/30 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 dark:data-invalid:border-destructive/50 dark:data-invalid:ring-destructive/40 data-checked:border-primary group-has-[:focus-visible]/field-label:data-checked:border-primary data-selected:border-primary data-invalid:data-selected:border-primary"
          : "group/radio-group-item relative flex w-full cursor-default items-start gap-2 rounded-md border border-transparent p-2 text-left outline-none hover:bg-muted focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/30 data-selected:bg-muted data-[disabled]:cursor-not-allowed data-[disabled]:opacity-50",
        className
      )}
      {...props}
    >
      {composeRenderProps(children, (children, { isSelected }) => (
        <>
          <span
            data-slot="radio-group-indicator"
            className={cn(
              "flex shrink-0 items-center justify-center",
              variant === "default" ? "absolute inset-0" : "relative mt-0.5 size-4 rounded-full border border-input bg-background",
              variant === "card" && isSelected && "border-primary bg-primary"
            )}
          >
            {isSelected && (
              <span
                className={cn(
                  "size-1.5 rounded-full",
                  variant === "default" ? "bg-current" : "bg-primary-foreground"
                )}
              />
            )}
          </span>
          {children}
        </>
      ))}
    </RadioPrimitive>
  )
}

export { RadioGroup, RadioGroupItem }
