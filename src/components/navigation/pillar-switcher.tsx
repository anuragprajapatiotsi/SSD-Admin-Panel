import {
  IconBuildingCommunity,
  IconCaretDownFilled,
} from "@tabler/icons-react";
import { useState } from "react";
import { useTranslation } from "react-i18next";
import { toast } from "sonner";
import type { UnitOption } from "@/api/session.api";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverTrigger,
} from "@/components/ui/popover";

type PillarSwitcherProps = {
  items: UnitOption[];
  selectedKey: string;
  onSelectionChange: (unitCode: string) => void;
};

function getPillarName(item: UnitOption) {
  return item.name || item.display_name || item.unit_name || item.unit_code;
}

export function PillarSwitcher({ items, selectedKey, onSelectionChange }: PillarSwitcherProps) {
  const { t } = useTranslation("common");
  const [open, setOpen] = useState(false);
  const selectedPillar = items.find((item) => item.unit_code === selectedKey);
  const pillarName = (item: UnitOption) => t(
    `navigation.pillarSwitcher.pillars.${item.unit_code.trim().toUpperCase()}`,
    { defaultValue: getPillarName(item) },
  );
  const selectedName = selectedPillar ? pillarName(selectedPillar) : selectedKey;

  function selectPillar(unitCode: string) {
    setOpen(false);
    if (unitCode === selectedKey) return;

    const pillar = items.find((item) => item.unit_code === unitCode);
    onSelectionChange(unitCode);
    toast.success(t("navigation.pillarSwitcher.changed"), {
      description: pillar ? pillarName(pillar) : unitCode,
    });
  }

  return (
    <PopoverTrigger isOpen={open} onOpenChange={setOpen}>
      <Button
        variant="ghost"
        className="max-w-64 justify-start bg-muted text-sm!"
        aria-label={t("navigation.pillarSwitcher.triggerLabel", { name: selectedName })}
      >
        <IconBuildingCommunity data-icon="inline-start" aria-hidden="true" />
        <span className="min-w-0 flex-1 truncate text-left">{selectedName}</span>
        <IconCaretDownFilled data-icon="inline-end" aria-hidden="true" />
      </Button>
      <Popover className="w-72 gap-0 overflow-hidden p-0" placement="bottom end">
        <Command className="p-0">
          <CommandInput placeholder={t("navigation.pillarSwitcher.search")} />
          <CommandList
            className="max-h-56 p-1"
            items={items}
            aria-label={t("navigation.pillarSwitcher.listLabel")}
            selectionMode="single"
            selectedKeys={[selectedKey]}
            onAction={(key) => selectPillar(String(key))}
            renderEmptyState={() => (
              <CommandEmpty>{t("navigation.pillarSwitcher.empty")}</CommandEmpty>
            )}
          >
            {(item) => (
              <CommandItem
                id={item.unit_code}
                className="min-h-8 text-sm! data-[checked=true]:bg-primary/10 data-[checked=true]:text-primary"
                textValue={`${pillarName(item)} ${getPillarName(item)} ${item.unit_code}`}
                data-checked={item.unit_code === selectedKey}
              >
                <span className="min-w-0 flex-1 truncate pr-5 font-medium">{pillarName(item)}</span>
              </CommandItem>
            )}
          </CommandList>
        </Command>
      </Popover>
    </PopoverTrigger>
  );
}
