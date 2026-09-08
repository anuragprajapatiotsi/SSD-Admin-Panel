import { Button } from "@/components/ui/button";
import {
  IconArrowDown,
  IconArrowUp,
  IconArrowsSort,
} from "@tabler/icons-react";
import {
  FlexRender,
  Subscribe,
  type CellData,
  type Header,
  type RowData,
} from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { dataTableFeatures } from "./data-table-features";

type DataTableColumnHeaderProps<TData extends RowData, TValue extends CellData> = {
  header: Header<typeof dataTableFeatures, TData, TValue>;
};

export function DataTableColumnHeader<TData extends RowData, TValue extends CellData>({
  header,
}: DataTableColumnHeaderProps<TData, TValue>) {
  const { t } = useTranslation("common");
  if (header.isPlaceholder) return null;

  if (!header.column.getCanSort()) {
    return <FlexRender header={header} />;
  }

  return (
    <Subscribe
      source={header.table.atoms.sorting}
      selector={(sorting) => sorting.find((item) => item.id === header.column.id)?.desc}
    >
      {(isDescending) => {
        const sortDirection = header.column.getIsSorted();
        const nextSortDirection = header.column.getNextSortingOrder();
        const sortLabel = nextSortDirection === "asc"
          ? t("dataTable.sortAscending")
          : nextSortDirection === "desc"
            ? t("dataTable.sortDescending")
            : t("dataTable.clearSorting");
        const columnLabel = header.column.id.replaceAll("_", " ");

        return (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="-ml-2 font-semibold"
            aria-label={t("dataTable.sortBy", { action: sortLabel, column: columnLabel })}
            onPress={() => header.column.toggleSorting()}
          >
            <FlexRender header={header} />
            {isDescending === true ? (
              <IconArrowDown aria-hidden="true" />
            ) : isDescending === false ? (
              <IconArrowUp aria-hidden="true" />
            ) : (
              <IconArrowsSort className="text-muted-foreground" aria-hidden="true" />
            )}
          </Button>
        );
      }}
    </Subscribe>
  );
}
