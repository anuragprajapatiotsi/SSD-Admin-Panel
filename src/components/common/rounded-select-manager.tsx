import { Button } from "@/components/ui/button";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

type SelectOption = {
  disabled: boolean;
  label: string;
  value: string;
};

type SelectMenuState = {
  activeIndex: number;
  direction: "down" | "up";
  options: SelectOption[];
  rect: DOMRect;
  select: HTMLSelectElement;
  value: string;
};

export function RoundedSelectManager() {
  const [menu, setMenu] = useState<SelectMenuState | null>(null);

  useEffect(() => {
    function openSelect(select: HTMLSelectElement) {
      if (select.disabled || select.multiple) return;

      const options = Array.from(select.options).map((option) => ({
        disabled: option.disabled,
        label: option.label || option.textContent || option.value,
        value: option.value,
      }));
      const selectedIndex = Math.max(0, select.selectedIndex);
      const rect = select.getBoundingClientRect();
      const spaceBelow = window.innerHeight - rect.bottom;
      const spaceAbove = rect.top;
      const direction = spaceBelow < 210 && spaceAbove > spaceBelow ? "up" : "down";

      setMenu({
        activeIndex: selectedIndex,
        direction,
        options,
        rect,
        select,
        value: select.value,
      });
    }

    function closeSelect() {
      setMenu(null);
    }

    function handlePointerDown(event: PointerEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest(".rounded-select-menu")) return;

      const select = target.closest("select");
      if (select instanceof HTMLSelectElement && !select.disabled && !select.multiple) {
        event.preventDefault();
        event.stopPropagation();
        if (menu?.select === select) {
          closeSelect();
        } else {
          openSelect(select);
        }
        select.focus();
        return;
      }

      closeSelect();
    }

    function handleClick(event: MouseEvent) {
      const target = event.target;
      if (!(target instanceof Element)) return;
      if (target.closest(".rounded-select-menu")) return;

      const select = target.closest("select");
      if (select instanceof HTMLSelectElement && !select.disabled && !select.multiple) {
        event.preventDefault();
        event.stopPropagation();
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      const target = event.target;
      if (!menu && target instanceof HTMLSelectElement && ["Enter", " ", "ArrowDown", "ArrowUp"].includes(event.key)) {
        event.preventDefault();
        openSelect(target);
        return;
      }

      if (!menu) return;

      if (event.key === "Escape") {
        event.preventDefault();
        menu.select.focus();
        closeSelect();
        return;
      }

      if (event.key === "ArrowDown" || event.key === "ArrowUp") {
        event.preventDefault();
        const stepDirection = event.key === "ArrowDown" ? 1 : -1;
        setMenu((current) => {
          if (!current) return current;
          let nextIndex = current.activeIndex;
          for (let step = 0; step < current.options.length; step += 1) {
            nextIndex = (nextIndex + stepDirection + current.options.length) % current.options.length;
            if (!current.options[nextIndex]?.disabled) break;
          }
          return { ...current, activeIndex: nextIndex };
        });
        return;
      }

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        const option = menu.options[menu.activeIndex];
        if (!option?.disabled) {
          menu.select.value = option.value;
          menu.select.dispatchEvent(new Event("input", { bubbles: true }));
          menu.select.dispatchEvent(new Event("change", { bubbles: true }));
          menu.select.focus();
          closeSelect();
        }
      }
    }

    function syncPosition() {
      setMenu((current) => {
        if (!current || !document.body.contains(current.select)) return null;
        return { ...current, rect: current.select.getBoundingClientRect(), value: current.select.value };
      });
    }

    document.addEventListener("pointerdown", handlePointerDown, true);
    document.addEventListener("click", handleClick, true);
    document.addEventListener("keydown", handleKeyDown, true);
    window.addEventListener("resize", syncPosition);
    window.addEventListener("scroll", syncPosition, true);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown, true);
      document.removeEventListener("click", handleClick, true);
      document.removeEventListener("keydown", handleKeyDown, true);
      window.removeEventListener("resize", syncPosition);
      window.removeEventListener("scroll", syncPosition, true);
    };
  }, [menu]);

  const selectedValue = menu?.select.value ?? menu?.value ?? "";
  const menuStyle = useMemo(() => {
    if (!menu) return undefined;
    const availableHeight = menu.direction === "down" ? window.innerHeight - menu.rect.bottom - 12 : menu.rect.top - 12;
    return {
      left: `${menu.rect.left}px`,
      minWidth: `${Math.max(menu.rect.width, 148)}px`,
      top: menu.direction === "down" ? `${menu.rect.bottom + 4}px` : undefined,
      bottom: menu.direction === "up" ? `${window.innerHeight - menu.rect.top + 4}px` : undefined,
      maxHeight: `${Math.max(120, Math.min(availableHeight, 260))}px`,
    };
  }, [menu]);

  if (!menu || !menuStyle) return null;

  function chooseOption(option: SelectOption) {
    if (!menu || option.disabled) return;
    menu.select.value = option.value;
    menu.select.dispatchEvent(new Event("input", { bubbles: true }));
    menu.select.dispatchEvent(new Event("change", { bubbles: true }));
    menu.select.focus();
    setMenu(null);
  }

  return createPortal(
    <div
      className={`rounded-select-menu ${menu.direction}`}
      role="listbox"
      style={menuStyle}
      aria-label={menu.select.getAttribute("aria-label") ?? undefined}
    >
      {menu.options.map((option, index) => (
        <Button
          className={[
            "rounded-select-option",
            option.value === selectedValue ? "selected" : "",
            index === menu.activeIndex ? "highlighted" : "",
          ].filter(Boolean).join(" ")}
          disabled={option.disabled}
          key={`${option.value}-${index}`}
          onMouseEnter={() => setMenu((current) => (current ? { ...current, activeIndex: index } : current))}
          onMouseDown={(event) => event.preventDefault()}
          onClick={() => chooseOption(option)}
          role="option"
          aria-selected={option.value === selectedValue}
          type="button"
        >
          {option.label}
        </Button>
      ))}
    </div>,
    document.body,
  );
}
