import { Button } from "@/components/ui/button";
import { Tooltip, TooltipTrigger } from "@/components/ui/tooltip";
import {
  IconLayoutNavbarCollapse,
  IconLayoutNavbarExpand,
} from "@tabler/icons-react";
import { useTranslation } from "react-i18next";

type TemplateAppHeaderToggleProps = {
  isExpanded: boolean;
  onToggle: () => void;
};

export function TemplateAppHeaderToggle({
  isExpanded,
  onToggle,
}: TemplateAppHeaderToggleProps) {
  const { t } = useTranslation("common");
  const label = t(isExpanded ? "header.collapse" : "header.expand");

  return (
    <TooltipTrigger>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        aria-controls="application-header"
        aria-expanded={isExpanded}
        aria-label={label}
        onPress={onToggle}
      >
        {isExpanded
          ? <IconLayoutNavbarCollapse data-icon="inline-start" aria-hidden="true" />
          : <IconLayoutNavbarExpand data-icon="inline-start" aria-hidden="true" />}
      </Button>
      <Tooltip>{label}</Tooltip>
    </TooltipTrigger>
  );
}
