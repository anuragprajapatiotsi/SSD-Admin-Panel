import { SearchInput } from "@/components/common/search-input";
import type { RowData } from "@tanstack/react-table";
import type { ReactNode } from "react";
import { useTranslation } from "react-i18next";
import type { DataTableInstance } from "./data-table-core";

type DataTableToolbarProps<TData extends RowData> = {
  table: DataTableInstance<TData>;
  searchPlaceholder?: string;
  searchValue?: string;
  onSearchChange?: (value: string) => void;
  actions?: ReactNode;
};

export function DataTableToolbar<TData extends RowData>({
  table,
  searchPlaceholder,
  searchValue: controlledSearchValue,
  onSearchChange,
  actions,
}: DataTableToolbarProps<TData>) {
  const { t } = useTranslation("common");
  return (
    <div className="flex flex-col gap-2 bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
      {searchPlaceholder ? <table.Subscribe source={table.atoms.globalFilter}>
        {(globalFilter) => {
          const searchValue = onSearchChange
            ? controlledSearchValue ?? ""
            : typeof globalFilter === "string" ? globalFilter : "";
          const setSearchValue = onSearchChange ?? table.setGlobalFilter;

          return (
            <SearchInput
              className="max-w-sm bg-card"
              value={searchValue}
              onValueChange={setSearchValue}
              label={searchPlaceholder}
              placeholder={searchPlaceholder}
              clearLabel={t("dataTable.clearSearch")}
            />
          );
        }}
      </table.Subscribe> : null}
      {actions ? (
        <div className="flex w-full flex-wrap items-center justify-end gap-2 sm:ml-auto sm:w-auto">
          {actions}
        </div>
      ) : null}
    </div>
  );
}
