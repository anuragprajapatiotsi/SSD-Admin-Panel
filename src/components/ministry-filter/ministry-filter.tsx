import {
  MinistrySelector,
  type MinistryContactDetail,
} from "@/components/ministry-selector/ministry-selector";

type MinistryFilterProps = {
  value: MinistryContactDetail | null;
  onChange: (ministry: MinistryContactDetail | null) => void;
};

export function MinistryFilter({ value, onChange }: MinistryFilterProps) {
  return (
    <MinistrySelector
      selectionMode="single"
      value={value}
      onChange={onChange}
    />
  );
}

export type { MinistryContactDetail };
