import { Button } from "@/components/ui/button";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
} from "@/components/ui/pagination";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react";
import type { RowData } from "@tanstack/react-table";
import { useTranslation } from "react-i18next";
import { cn } from "@/lib/utils";
import type { DataTableInstance } from "./data-table-core";

const DEFAULT_PAGE_SIZE_OPTIONS = [10, 20, 50];

type DataTablePaginationProps<TData extends RowData> = {
  table: DataTableInstance<TData>;
  pageSizeOptions?: number[];
  totalCount?: number;
  variant?: "table" | "plain";
};

export function DataTablePagination<TData extends RowData>({
  table,
  pageSizeOptions = DEFAULT_PAGE_SIZE_OPTIONS,
  totalCount,
  variant = "table",
}: DataTablePaginationProps<TData>) {
  const { t } = useTranslation("common");
  return (
    <table.Subscribe
      selector={(state) => ({
        pagination: state.pagination,
        globalFilter: state.globalFilter,
        columnFilters: state.columnFilters,
      })}
    >
      {({ pagination, globalFilter, columnFilters }) => {
        // Reading the filter state keeps client-only tables reactive when their
        // pre-paginated row count changes. API-backed tables can provide a
        // totalCount, which remains the source of truth for pagination totals.
        void globalFilter;
        void columnFilters;
        const rowCount = totalCount ?? table.getRowCount();
        const pageCount = table.getPageCount();
        const firstRow = rowCount ? pagination.pageIndex * pagination.pageSize + 1 : 0;
        const lastRow = Math.min(firstRow + pagination.pageSize - 1, rowCount);

        return (
          <div className={cn(
            "flex flex-col gap-2 py-2 sm:flex-row sm:items-center sm:justify-between",
            variant === "table" && "border-t bg-card px-3",
          )}>
            <p className="text-xs text-muted-foreground">
              {t("dataTable.showing", { first: firstRow, last: lastRow, total: rowCount })}
            </p>
            <div className="flex items-center gap-2">
              <Select
                aria-label={t("dataTable.rowsPerPage")}
                selectedKey={String(pagination.pageSize)}
                onSelectionChange={(key) => table.setPageSize(Number(key))}
              >
                <SelectTrigger size="sm" className="w-24">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    {pageSizeOptions.map((pageSize) => (
                      <SelectItem id={String(pageSize)} key={pageSize}>
                        {t("dataTable.rows", { count: pageSize })}
                      </SelectItem>
                    ))}
                  </SelectGroup>
                </SelectContent>
              </Select>
              <span className="min-w-20 text-center text-xs text-muted-foreground">
                {t("dataTable.page", {
                  current: rowCount ? pagination.pageIndex + 1 : 0,
                  total: pageCount,
                })}
              </span>
              <Pagination className="mx-0 w-auto">
                <PaginationContent>
                  <PaginationItem>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      aria-label={t("dataTable.previousPage")}
                      isDisabled={!table.getCanPreviousPage()}
                      onPress={() => table.previousPage()}
                    >
                      <IconChevronLeft data-icon="inline-start" aria-hidden="true" />
                    </Button>
                  </PaginationItem>
                  <PaginationItem>
                    <Button
                      type="button"
                      variant="outline"
                      size="icon-sm"
                      aria-label={t("dataTable.nextPage")}
                      isDisabled={!table.getCanNextPage()}
                      onPress={() => table.nextPage()}
                    >
                      <IconChevronRight data-icon="inline-start" aria-hidden="true" />
                    </Button>
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          </div>
        );
      }}
    </table.Subscribe>
  );
}
