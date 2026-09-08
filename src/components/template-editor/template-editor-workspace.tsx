import { cn } from "@/lib/utils";
import type { HTMLAttributes } from "react";

type TemplateEditorRegionProps = HTMLAttributes<HTMLElement>;

function TemplateEditorWorkspace({ className, ...props }: TemplateEditorRegionProps) {
  return (
    <section
      data-slot="template-editor-workspace"
      className={cn(
        "flex h-full min-h-0 min-w-0 flex-col overflow-hidden bg-background",
        className,
      )}
      {...props}
    />
  );
}

function TemplateEditorHeader({ className, ...props }: TemplateEditorRegionProps) {
  return (
    <header
      data-slot="template-editor-header"
      className={cn("border-b bg-background px-3 py-2 md:px-4", className)}
      {...props}
    />
  );
}

function TemplateEditorCanvas({ className, ...props }: TemplateEditorRegionProps) {
  return (
    <div
      data-slot="template-editor-canvas"
      className={cn("flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden bg-muted/20", className)}
      {...props}
    />
  );
}

export {
  TemplateEditorCanvas,
  TemplateEditorHeader,
  TemplateEditorWorkspace,
};
