import { MinistrySelector } from "@/components/ministry-selector/ministry-selector";

type MinistryMultiSelectProps = {
  labelledBy?: string;
  value: string[];
  onChange: (value: string[]) => void;
  onBlur?: () => void;
  isDisabled?: boolean;
  isInvalid?: boolean;
  isOptional?: boolean;
  errorId?: string;
};

export function MinistryMultiSelect({
  labelledBy,
  value,
  onChange,
  onBlur,
  isDisabled,
  isInvalid,
  isOptional,
  errorId,
}: MinistryMultiSelectProps) {
  return (
    <MinistrySelector
      selectionMode="multiple"
      labelledBy={labelledBy}
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      isDisabled={isDisabled}
      isInvalid={isInvalid}
      isOptional={isOptional}
      errorId={errorId}
    />
  );
}
