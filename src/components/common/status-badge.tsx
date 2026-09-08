import { Badge } from "@/components/ui/badge";
import { Spinner } from "@/components/ui/spinner";
import { cn } from "@/lib/utils";
import {
  IconAlertTriangle,
  IconCircle,
  IconCircleCheck,
  IconClock,
  IconInfoCircle,
  IconX,
} from "@tabler/icons-react";
import {
  statusColorVariants,
  type StatusVariant,
} from "@/components/common/status-variants";

type StatusBadgeProps = Omit<React.ComponentProps<typeof Badge>, "variant"> &
  {
    variant?: StatusVariant;
    showIcon?: boolean;
    isProcessing?: boolean;
  };

function statusIcon(variant: StatusVariant, isProcessing: boolean) {
  if (isProcessing) return <Spinner aria-hidden="true" />;

  switch (variant) {
    case "success":
    case "published":
      return <IconCircleCheck aria-hidden="true" />;
    case "destructive":
      return <IconX aria-hidden="true" />;
    case "warning":
      return <IconAlertTriangle aria-hidden="true" />;
    case "info":
      return <IconInfoCircle aria-hidden="true" />;
    case "ready":
    case "partial":
      return <IconClock aria-hidden="true" />;
    case "default":
    case "neutral":
      return <IconCircle aria-hidden="true" />;
  }
}

export function StatusBadge({
  className,
  variant = "default",
  showIcon = true,
  isProcessing = variant === "progress",
  children,
  ...props
}: StatusBadgeProps) {
  return (
    <Badge
      variant="secondary"
      data-slot="status-badge"
      data-status-variant={variant}
      className={cn(
        "border-transparent bg-[color:color-mix(in_oklab,var(--status-color)_28%,white)] text-[var(--status-text)] [&>svg]:size-3!",
        statusColorVariants({ variant }),
        className,
      )}
      {...props}
    >
      {showIcon ? statusIcon(variant, isProcessing) : null}
      {children}
    </Badge>
  );
}

type StatusDotProps = React.ComponentProps<"span"> &
  { variant?: StatusVariant };

export function StatusDot({
  className,
  variant = "default",
  ...props
}: StatusDotProps) {
  return (
    <span
      data-slot="status-dot"
      data-status-variant={variant}
      className={cn(
        "inline-block size-2 shrink-0 rounded-full bg-[var(--status-color)]",
        statusColorVariants({ variant }),
        className,
      )}
      {...props}
    />
  );
}
