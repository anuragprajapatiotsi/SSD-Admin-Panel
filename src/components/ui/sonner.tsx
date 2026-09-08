import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";
import {
  IconCircleCheck,
  IconInfoCircle,
  IconAlertTriangle,
  IconAlertOctagon,
  IconLoader,
  IconX,
} from "@tabler/icons-react";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      position="top-center"
      closeButton
      className="toaster group"
      icons={{
        success: <IconCircleCheck className="size-4" />,
        info: <IconInfoCircle className="size-4" />,
        warning: <IconAlertTriangle className="size-4" />,
        error: <IconAlertOctagon className="size-4" />,
        loading: <IconLoader className="size-4 animate-spin" />,
        close: <IconX />,
      }}
      style={
        {
          "--normal-bg": "var(--popover)",
          "--normal-text": "var(--popover-foreground)",
          "--normal-border": "var(--border)",
          "--border-radius": "var(--radius)",
        } as React.CSSProperties
      }
      toastOptions={{
        classNames: {
          toast: "cn-toast",
          description: "text-popover-foreground!",
          closeButton:
            "border-border! bg-background! text-foreground! hover:bg-accent! hover:text-accent-foreground! [&_svg]:size-3.5 [&_svg]:shrink-0",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
