import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";
import { Spinner } from "@/components/ui/spinner";
import { useDebouncedValue } from "@/hooks/use-debounced-value";
import { IconSearch, IconX } from "@tabler/icons-react";
import { useEffect, useId } from "react";

type SearchInputProps = {
  value: string;
  onValueChange: (value: string) => void;
  label: string;
  placeholder: string;
  clearLabel: string;
  onDebouncedValueChange?: (value: string) => void;
  pendingLabel?: string;
  delay?: number;
  className?: string;
  isDisabled?: boolean;
};

export function SearchInput({
  value,
  onValueChange,
  onDebouncedValueChange,
  label,
  placeholder,
  clearLabel,
  pendingLabel,
  delay = 300,
  className,
  isDisabled = false,
}: SearchInputProps) {
  const inputId = useId();
  const debouncedValue = useDebouncedValue(value, delay);
  const isPending = Boolean(onDebouncedValueChange) && value !== debouncedValue;

  useEffect(() => {
    onDebouncedValueChange?.(debouncedValue);
  }, [debouncedValue, onDebouncedValueChange]);

  return (
    <>
      <label className="sr-only" htmlFor={inputId}>{label}</label>
      <InputGroup className={className} data-disabled={isDisabled || undefined}>
        <InputGroupInput
          id={inputId}
          type="search"
          value={value}
          placeholder={placeholder}
          disabled={isDisabled}
          autoComplete="off"
          onChange={(event) => onValueChange(event.currentTarget.value)}
        />
        <InputGroupAddon align="inline-start">
          <IconSearch aria-hidden="true" />
        </InputGroupAddon>
        {isPending || value ? (
          <InputGroupAddon align="inline-end">
            {isPending ? <Spinner aria-label={pendingLabel} /> : null}
            {value ? (
              <InputGroupButton
                size="icon-xs"
                aria-label={clearLabel}
                isDisabled={isDisabled}
                onPress={() => onValueChange("")}
              >
                <IconX aria-hidden="true" />
              </InputGroupButton>
            ) : null}
          </InputGroupAddon>
        ) : null}
      </InputGroup>
    </>
  );
}
